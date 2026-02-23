import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { PortfolioItemEntity } from './entities/portfolio-item.entity';
import { PortfolioPhotoEntity } from './entities/portfolio-photo.entity';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { StorageService } from '../storage/storage.service';
import { ImageProcessorService } from '../storage/image-processor.service';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    @InjectRepository(PortfolioItemEntity)
    private readonly portfolioRepository: Repository<PortfolioItemEntity>,
    @InjectRepository(PortfolioPhotoEntity)
    private readonly photosRepository: Repository<PortfolioPhotoEntity>,
    private readonly storageService: StorageService,
    private readonly imageProcessorService: ImageProcessorService,
  ) {}

  async create(data: CreatePortfolioItemDto): Promise<PortfolioItemEntity> {
    const slug = generateSlug(data.title);

    const item = this.portfolioRepository.create({
      ...data,
      slug,
      eventDate: data.eventDate ? new Date(data.eventDate) : null,
      coverImageKey: '',
      coverThumbnailKey: '',
    });

    return this.portfolioRepository.save(item);
  }

  async generateUploadUrl(
    portfolioItemId: string,
    filename: string,
    contentType: string,
  ) {
    const ext = filename.split('.').pop() || 'jpg';
    const key = `portfolio/${portfolioItemId}/${randomUUID()}.${ext}`;
    const uploadUrl = await this.storageService.generatePresignedUploadUrl(
      key,
      contentType,
    );
    const publicUrl = this.storageService.generatePublicUrl(key);
    return { uploadUrl, key, publicUrl };
  }

  private hydratePhotoUrls(item: PortfolioItemEntity): PortfolioItemEntity {
    if (item.coverImageKey) {
      (item as any).coverImageUrl =
        this.storageService.generatePublicUrl(item.coverImageKey);
    }
    if (item.coverThumbnailKey) {
      (item as any).coverThumbnailUrl =
        this.storageService.generatePublicUrl(item.coverThumbnailKey);
    }
    if (item.photos) {
      for (const photo of item.photos) {
        (photo as any).url = this.storageService.generatePublicUrl(photo.r2Key);
        (photo as any).thumbnailUrl = photo.r2ThumbnailKey
          ? this.storageService.generatePublicUrl(photo.r2ThumbnailKey)
          : null;
      }
    }
    return item;
  }

  async findAll(): Promise<PortfolioItemEntity[]> {
    const items = await this.portfolioRepository.find({
      relations: ['photos'],
      order: { sortOrder: 'ASC' },
    });
    return items.map((item) => this.hydratePhotoUrls(item));
  }

  async findBySlug(slug: string): Promise<PortfolioItemEntity | null> {
    const item = await this.portfolioRepository.findOne({
      where: { slug },
      relations: ['photos'],
    });
    return item ? this.hydratePhotoUrls(item) : null;
  }

  async findById(id: string): Promise<PortfolioItemEntity | null> {
    const item = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
    return item ? this.hydratePhotoUrls(item) : null;
  }

  async findPublished(): Promise<PortfolioItemEntity[]> {
    const items = await this.portfolioRepository.find({
      where: { isPublished: true },
      relations: ['photos'],
      order: { sortOrder: 'ASC' },
    });
    return items.map((item) => this.hydratePhotoUrls(item));
  }

  async findFeatured(): Promise<PortfolioItemEntity[]> {
    const items = await this.portfolioRepository.find({
      where: { isFeatured: true, isPublished: true },
      relations: ['photos'],
      order: { sortOrder: 'ASC' },
    });
    return items.map((item) => this.hydratePhotoUrls(item));
  }

  async update(
    id: string,
    data: UpdatePortfolioItemDto,
  ): Promise<PortfolioItemEntity> {
    const item = await this.portfolioRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Portfolio item with ID "${id}" not found`);
    }

    const { eventDate, ...rest } = data;
    const updateData: Partial<PortfolioItemEntity> = { ...rest };

    if (data.title) {
      updateData.slug = generateSlug(data.title);
    }

    if (eventDate !== undefined) {
      updateData.eventDate = eventDate ? new Date(eventDate) : null;
    }

    Object.assign(item, updateData);

    return this.portfolioRepository.save(item);
  }

  async remove(id: string): Promise<void> {
    const item = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['photos'],
    });

    if (!item) {
      throw new NotFoundException(`Portfolio item with ID "${id}" not found`);
    }

    // Delete all photos from R2
    for (const photo of item.photos || []) {
      await this.storageService.deleteObject(photo.r2Key).catch(() => {});
      if (photo.r2ThumbnailKey) {
        await this.storageService.deleteObject(photo.r2ThumbnailKey).catch(() => {});
      }
    }

    await this.portfolioRepository.remove(item);
  }

  async addPhotos(
    itemId: string,
    photos: Array<{
      r2Key: string;
      mimeType: string;
      width?: number;
      height?: number;
      altText?: string;
      sortOrder?: number;
    }>,
  ): Promise<PortfolioPhotoEntity[]> {
    const item = await this.portfolioRepository.findOne({
      where: { id: itemId },
      relations: ['photos'],
    });
    if (!item) {
      throw new NotFoundException(`Portfolio item "${itemId}" not found`);
    }

    const existingCount = item.photos?.length || 0;
    const entities = photos.map((photo, i) => {
      const thumbnailKey = photo.r2Key.replace(/(\.[^.]+)$/, '_thumb.jpg');
      return this.photosRepository.create({
        portfolioItem: item,
        r2Key: photo.r2Key,
        r2ThumbnailKey: thumbnailKey,
        mimeType: photo.mimeType,
        width: photo.width ?? null,
        height: photo.height ?? null,
        altText: photo.altText ?? null,
        sortOrder: photo.sortOrder ?? existingCount + i,
      });
    });

    const saved = await this.photosRepository.save(entities);

    // Set cover from first photo if not already set
    if (!item.coverImageKey && saved.length > 0) {
      item.coverImageKey = saved[0].r2Key;
      item.coverThumbnailKey = saved[0].r2ThumbnailKey;
      await this.portfolioRepository.save(item);
    }

    // Generate thumbnails in background
    for (const photo of saved) {
      this.imageProcessorService
        .generateThumbnail(photo.r2Key, photo.r2ThumbnailKey)
        .catch((err) =>
          this.logger.error(
            `Thumbnail generation failed for ${photo.r2Key}`,
            err,
          ),
        );
    }

    return saved;
  }

  async removePhoto(itemId: string, photoId: string): Promise<void> {
    const photo = await this.photosRepository.findOne({
      where: { id: photoId },
      relations: ['portfolioItem'],
    });
    if (!photo || photo.portfolioItem?.id !== itemId) {
      throw new NotFoundException(`Photo "${photoId}" not found`);
    }

    await this.storageService.deleteObject(photo.r2Key).catch(() => {});
    if (photo.r2ThumbnailKey) {
      await this.storageService
        .deleteObject(photo.r2ThumbnailKey)
        .catch(() => {});
    }
    await this.photosRepository.remove(photo);

    // Update cover if this was the cover photo
    const item = await this.portfolioRepository.findOne({
      where: { id: itemId },
      relations: ['photos'],
    });
    if (item && item.coverImageKey === photo.r2Key) {
      const remaining = item.photos || [];
      item.coverImageKey = remaining[0]?.r2Key ?? '';
      item.coverThumbnailKey = remaining[0]?.r2ThumbnailKey ?? '';
      await this.portfolioRepository.save(item);
    }
  }
}
