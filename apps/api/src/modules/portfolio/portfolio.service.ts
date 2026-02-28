import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { PortfolioItemEntity } from './entities/portfolio-item.entity';
import { PortfolioPhotoEntity } from './entities/portfolio-photo.entity';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';
import { StorageService } from '../storage/storage.service';
import { ImageProcessorService } from '../storage/image-processor.service';
import { Booking } from '../bookings/entities/booking.entity';
import { GalleryEntity } from '../galleries/entities/gallery.entity';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class PortfolioService implements OnModuleInit {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    @InjectRepository(PortfolioItemEntity)
    private readonly portfolioRepository: Repository<PortfolioItemEntity>,
    @InjectRepository(PortfolioPhotoEntity)
    private readonly photosRepository: Repository<PortfolioPhotoEntity>,
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    @InjectRepository(GalleryEntity)
    private readonly galleriesRepository: Repository<GalleryEntity>,
    private readonly storageService: StorageService,
    private readonly imageProcessorService: ImageProcessorService,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(
        'Failed to ensure portfolio booking link schema. Run SQL migrations if portfolio booking links fail.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async create(data: CreatePortfolioItemDto): Promise<PortfolioItemEntity> {
    const slug = await this.generateUniqueSlug(data.title);
    const bookingId = await this.resolveBookingId(data.bookingId);
    const sourceGalleryId = await this.resolveSourceGalleryId(data.sourceGalleryId);
    const existingBySourceGallery = await this.findBySourceGalleryId(sourceGalleryId);
    if (existingBySourceGallery) {
      return existingBySourceGallery;
    }

    const item = this.portfolioRepository.create({
      ...data,
      slug,
      bookingId,
      sourceGalleryId,
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
    const hasDirectPhotos = Array.isArray(item.photos) && item.photos.length > 0;
    const sourcePhotos = item.sourceGallery?.photos || [];

    if (!hasDirectPhotos && sourcePhotos.length > 0) {
      // Reuse existing gallery photo keys instead of duplicating portfolio photo rows.
      item.photos = sourcePhotos
        .filter((photo) => Boolean(photo.r2Key?.trim()))
        .map((photo) => ({
          id: photo.id,
          portfolioItemId: item.id,
          r2Key: photo.r2Key,
          r2ThumbnailKey: photo.r2ThumbnailKey,
          mimeType: photo.mimeType,
          width: photo.width,
          height: photo.height,
          altText: photo.caption,
          sortOrder: photo.sortOrder,
          createdAt: photo.createdAt,
        })) as PortfolioPhotoEntity[];
    }

    if (item.coverImageKey) {
      (item as any).coverImageUrl =
        this.storageService.generatePublicUrl(item.coverImageKey);
    } else if (item.photos?.[0]?.r2Key) {
      (item as any).coverImageUrl =
        this.storageService.generatePublicUrl(item.photos[0].r2Key);
    }
    if (item.coverThumbnailKey) {
      (item as any).coverThumbnailUrl =
        this.storageService.generatePublicUrl(item.coverThumbnailKey);
    }
    if (item.photos) {
      item.photos = item.photos.filter((photo) => Boolean(photo.r2Key?.trim()));
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
      relations: ['photos', 'sourceGallery', 'sourceGallery.photos'],
      order: { sortOrder: 'ASC' },
    });
    return items.map((item) => this.hydratePhotoUrls(item));
  }

  async findBySlug(slug: string): Promise<PortfolioItemEntity | null> {
    const item = await this.portfolioRepository.findOne({
      where: { slug },
      relations: ['photos', 'sourceGallery', 'sourceGallery.photos'],
    });
    return item ? this.hydratePhotoUrls(item) : null;
  }

  async findById(id: string): Promise<PortfolioItemEntity | null> {
    const item = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['photos', 'sourceGallery', 'sourceGallery.photos'],
    });
    return item ? this.hydratePhotoUrls(item) : null;
  }

  async findPublished(): Promise<PortfolioItemEntity[]> {
    const items = await this.portfolioRepository.find({
      where: { isPublished: true },
      relations: ['photos', 'sourceGallery', 'sourceGallery.photos'],
      order: { sortOrder: 'ASC' },
    });
    return items.map((item) => this.hydratePhotoUrls(item));
  }

  async findFeatured(): Promise<PortfolioItemEntity[]> {
    const items = await this.portfolioRepository.find({
      where: { isFeatured: true, isPublished: true },
      relations: ['photos', 'sourceGallery', 'sourceGallery.photos'],
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

    const { eventDate, bookingId, sourceGalleryId, ...rest } = data;
    const updateData: Partial<PortfolioItemEntity> = { ...rest };

    if (data.title) {
      updateData.slug = await this.generateUniqueSlug(data.title, id);
    }

    if (eventDate !== undefined) {
      updateData.eventDate = eventDate ? new Date(eventDate) : null;
    }

    if (bookingId !== undefined) {
      updateData.bookingId = await this.resolveBookingId(bookingId);
    }

    if (sourceGalleryId !== undefined) {
      updateData.sourceGalleryId = await this.resolveSourceGalleryId(
        sourceGalleryId,
      );
      const existingBySourceGallery = await this.findBySourceGalleryId(
        updateData.sourceGalleryId,
      );
      if (existingBySourceGallery && existingBySourceGallery.id !== id) {
        throw new BadRequestException(
          'This gallery is already linked to another portfolio item',
        );
      }
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
    if (!Array.isArray(photos) || photos.length === 0) {
      throw new BadRequestException('No photos provided');
    }

    const item = await this.portfolioRepository.findOne({
      where: { id: itemId },
      relations: ['photos'],
    });
    if (!item) {
      throw new NotFoundException(`Portfolio item "${itemId}" not found`);
    }

    const existingCount = item.photos?.length || 0;
    const entities = photos.map((photo, i) => {
      if (!photo?.r2Key) {
        throw new BadRequestException(
          `Photo ${i + 1} is missing a storage key`,
        );
      }

      const thumbnailKey = this.buildThumbnailKey(photo.r2Key);
      return this.photosRepository.create({
        portfolioItem: item,
        r2Key: photo.r2Key,
        r2ThumbnailKey: thumbnailKey,
        mimeType: photo.mimeType || this.inferMimeTypeFromKey(photo.r2Key),
        width: photo.width ?? null,
        height: photo.height ?? null,
        altText: photo.altText ?? null,
        sortOrder: photo.sortOrder ?? existingCount + i,
      });
    });

    const saved = await this.photosRepository.save(entities);

    // Set cover from first photo if not already set
    if (!item.coverImageKey && saved.length > 0) {
      try {
        await this.portfolioRepository.update(item.id, {
          coverImageKey: saved[0].r2Key,
          coverThumbnailKey: saved[0].r2ThumbnailKey,
        });
        item.coverImageKey = saved[0].r2Key;
        item.coverThumbnailKey = saved[0].r2ThumbnailKey;
      } catch (error) {
        // Do not fail the entire request when photo records were already saved.
        this.logger.warn(
          `Failed to set cover image for portfolio item ${item.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
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
      await this.portfolioRepository.update(item.id, {
        coverImageKey: remaining[0]?.r2Key ?? '',
        coverThumbnailKey: remaining[0]?.r2ThumbnailKey ?? '',
      });
    }
  }

  private buildThumbnailKey(sourceKey: string): string {
    if (/\.[^.]+$/.test(sourceKey)) {
      return sourceKey.replace(/(\.[^.]+)$/, '_thumb.jpg');
    }
    return `${sourceKey}_thumb.jpg`;
  }

  private inferMimeTypeFromKey(key: string): string {
    const ext = key.split('.').pop()?.toLowerCase();
    const map: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      avif: 'image/avif',
      heic: 'image/heic',
      heif: 'image/heif',
    };
    return (ext && map[ext]) || 'image/jpeg';
  }

  private async generateUniqueSlug(
    title: string,
    excludeItemId?: string,
  ): Promise<string> {
    const baseSlug = generateSlug(title) || `portfolio-${randomUUID().slice(0, 8)}`;
    let candidate = baseSlug;
    let suffix = 2;

    while (true) {
      const existing = await this.portfolioRepository.findOne({
        where: { slug: candidate },
      });

      if (!existing || (excludeItemId && existing.id === excludeItemId)) {
        return candidate;
      }

      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
  }

  private async resolveBookingId(bookingId?: string | null): Promise<string | null> {
    if (bookingId === undefined || bookingId === null) return null;

    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new NotFoundException(`Booking "${bookingId}" not found`);
    }
    return booking.id;
  }

  private async resolveSourceGalleryId(
    sourceGalleryId?: string | null,
  ): Promise<string | null> {
    if (sourceGalleryId === undefined || sourceGalleryId === null) return null;

    const gallery = await this.galleriesRepository.findOne({
      where: { id: sourceGalleryId },
    });
    if (!gallery) {
      throw new NotFoundException(`Gallery "${sourceGalleryId}" not found`);
    }
    return gallery.id;
  }

  private async findBySourceGalleryId(
    sourceGalleryId: string | null,
  ): Promise<PortfolioItemEntity | null> {
    if (!sourceGalleryId) return null;
    const item = await this.portfolioRepository.findOne({
      where: { sourceGalleryId },
      relations: ['photos', 'sourceGallery', 'sourceGallery.photos'],
    });
    return item ? this.hydratePhotoUrls(item) : null;
  }

  private async ensureSchema(): Promise<void> {
    await this.portfolioRepository.query(`
      ALTER TABLE portfolio_items
      ADD COLUMN IF NOT EXISTS booking_id UUID;
    `);

    await this.portfolioRepository.query(`
      DO $$ BEGIN
        ALTER TABLE portfolio_items
          ADD CONSTRAINT fk_portfolio_items_booking
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await this.portfolioRepository.query(`
      CREATE INDEX IF NOT EXISTS idx_portfolio_items_booking_id
      ON portfolio_items (booking_id);
    `);

    await this.portfolioRepository.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_items_booking_unique
      ON portfolio_items (booking_id)
      WHERE booking_id IS NOT NULL;
    `);

    await this.portfolioRepository.query(`
      ALTER TABLE portfolio_items
      ADD COLUMN IF NOT EXISTS source_gallery_id UUID;
    `);

    await this.portfolioRepository.query(`
      DO $$ BEGIN
        ALTER TABLE portfolio_items
          ADD CONSTRAINT fk_portfolio_items_source_gallery
          FOREIGN KEY (source_gallery_id) REFERENCES galleries(id) ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await this.portfolioRepository.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_items_source_gallery_unique
      ON portfolio_items (source_gallery_id)
      WHERE source_gallery_id IS NOT NULL;
    `);
  }
}
