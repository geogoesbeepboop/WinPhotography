import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { GalleryStatus } from '@winphotography/shared';
import { GalleryEntity } from './entities/gallery.entity';
import { GalleryPhotoEntity } from './entities/gallery-photo.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { EmailService } from '../email/email.service';
import { StorageService } from '../storage/storage.service';
import { ImageProcessorService } from '../storage/image-processor.service';

@Injectable()
export class GalleriesService {
  private readonly logger = new Logger(GalleriesService.name);

  constructor(
    @InjectRepository(GalleryEntity)
    private readonly galleriesRepository: Repository<GalleryEntity>,
    @InjectRepository(GalleryPhotoEntity)
    private readonly photosRepository: Repository<GalleryPhotoEntity>,
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
    private readonly imageProcessorService: ImageProcessorService,
  ) {}

  async create(data: Partial<GalleryEntity>): Promise<GalleryEntity> {
    // Auto-resolve clientId from booking if not provided
    if (!data.clientId && data.bookingId) {
      const booking = await this.bookingsRepository.findOne({
        where: { id: data.bookingId },
      });
      if (booking) {
        data.clientId = booking.clientId;
      }
    }
    const gallery = this.galleriesRepository.create(data);
    return this.galleriesRepository.save(gallery);
  }

  async findAll(): Promise<GalleryEntity[]> {
    return this.galleriesRepository.find({
      relations: ['booking', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<GalleryEntity | null> {
    const gallery = await this.galleriesRepository.findOne({
      where: { id },
      relations: ['photos', 'booking', 'client'],
    });
    if (gallery) {
      this.hydratePhotoUrls(gallery);
    }
    return gallery;
  }

  async findByClientId(clientId: string): Promise<GalleryEntity[]> {
    const galleries = await this.galleriesRepository.find({
      where: { clientId },
      relations: ['booking', 'photos'],
      order: { createdAt: 'DESC' },
    });
    for (const gallery of galleries) {
      this.hydratePhotoUrls(gallery);
    }
    return galleries;
  }

  async update(
    id: string,
    data: Partial<GalleryEntity>,
  ): Promise<GalleryEntity> {
    const gallery = await this.galleriesRepository.findOne({ where: { id } });
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID "${id}" not found`);
    }
    Object.assign(gallery, data);
    return this.galleriesRepository.save(gallery);
  }

  async remove(id: string): Promise<void> {
    const gallery = await this.galleriesRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID "${id}" not found`);
    }

    // Delete all photos from R2
    for (const photo of gallery.photos || []) {
      await this.storageService.deleteObject(photo.r2Key).catch(() => {});
      if (photo.r2ThumbnailKey) {
        await this.storageService
          .deleteObject(photo.r2ThumbnailKey)
          .catch(() => {});
      }
    }

    await this.galleriesRepository.remove(gallery);
  }

  async publish(id: string): Promise<GalleryEntity> {
    const gallery = await this.galleriesRepository.findOne({
      where: { id },
      relations: ['client'],
    });
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID "${id}" not found`);
    }
    gallery.status = GalleryStatus.PUBLISHED;
    gallery.publishedAt = new Date();
    const saved = await this.galleriesRepository.save(gallery);

    if (gallery.client?.email) {
      try {
        await this.emailService.sendGalleryReady(gallery.client.email, {
          name: gallery.client.fullName,
          galleryName: gallery.title,
          galleryId: gallery.id,
          imageCount: gallery.photoCount || undefined,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send gallery ready email to ${gallery.client.email}`,
          error?.stack ?? error,
        );
      }
    }

    return saved;
  }

  async generateUploadUrl(
    galleryId: string,
    filename: string,
    contentType: string,
  ) {
    const ext = filename.split('.').pop() || 'jpg';
    const key = `galleries/${galleryId}/${randomUUID()}.${ext}`;
    const uploadUrl = await this.storageService.generatePresignedUploadUrl(
      key,
      contentType,
    );
    const publicUrl = this.storageService.generatePublicUrl(key);
    return { uploadUrl, key, publicUrl };
  }

  async addPhotos(
    galleryId: string,
    photos: Array<{
      filename: string;
      r2Key: string;
      mimeType: string;
      fileSizeBytes: number;
      width?: number;
      height?: number;
    }>,
  ): Promise<GalleryPhotoEntity[]> {
    const gallery = await this.galleriesRepository.findOne({
      where: { id: galleryId },
    });
    if (!gallery) {
      throw new NotFoundException(`Gallery "${galleryId}" not found`);
    }

    const existingCount = gallery.photoCount || 0;
    const entities = photos.map((p, i) => {
      const thumbnailKey = p.r2Key.replace(/(\.[^.]+)$/, '_thumb.jpg');
      return this.photosRepository.create({
        gallery,
        filename: p.filename,
        r2Key: p.r2Key,
        r2ThumbnailKey: thumbnailKey,
        mimeType: p.mimeType,
        fileSizeBytes: p.fileSizeBytes,
        width: p.width ?? null,
        height: p.height ?? null,
        sortOrder: existingCount + i,
      });
    });

    const saved = await this.photosRepository.save(entities);

    // Update gallery stats
    gallery.photoCount = existingCount + saved.length;
    gallery.totalSizeBytes =
      Number(gallery.totalSizeBytes || 0) +
      photos.reduce((sum, p) => sum + p.fileSizeBytes, 0);
    if (!gallery.coverPhotoId && saved.length > 0) {
      gallery.coverPhotoId = saved[0].id;
    }
    await this.galleriesRepository.save(gallery);

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

  async removePhoto(galleryId: string, photoId: string): Promise<void> {
    const photo = await this.photosRepository.findOne({
      where: { id: photoId },
      relations: ['gallery'],
    });
    if (!photo || photo.gallery?.id !== galleryId) {
      throw new NotFoundException(`Photo "${photoId}" not found`);
    }

    await this.storageService.deleteObject(photo.r2Key).catch(() => {});
    if (photo.r2ThumbnailKey) {
      await this.storageService
        .deleteObject(photo.r2ThumbnailKey)
        .catch(() => {});
    }
    await this.photosRepository.remove(photo);

    // Update gallery stats
    const gallery = await this.galleriesRepository.findOne({
      where: { id: galleryId },
    });
    if (gallery) {
      gallery.photoCount = Math.max(0, (gallery.photoCount || 1) - 1);
      gallery.totalSizeBytes = Math.max(
        0,
        Number(gallery.totalSizeBytes) - Number(photo.fileSizeBytes),
      );
      if (gallery.coverPhotoId === photoId) {
        gallery.coverPhotoId = null;
      }
      await this.galleriesRepository.save(gallery);
    }
  }

  async getPhoto(
    galleryId: string,
    photoId: string,
  ): Promise<GalleryPhotoEntity | null> {
    return this.photosRepository.findOne({
      where: { id: photoId, gallery: { id: galleryId } },
    });
  }

  async generateDownloadUrl(
    galleryId: string,
    photoId: string,
  ): Promise<string> {
    const photo = await this.getPhoto(galleryId, photoId);
    if (!photo) {
      throw new NotFoundException(`Photo "${photoId}" not found`);
    }
    return this.storageService.generateSignedReadUrl(photo.r2Key);
  }

  async generateBulkDownloadUrl(galleryId: string): Promise<string> {
    throw new Error(
      'Bulk download not yet implemented — use individual photo downloads',
    );
  }

  private hydratePhotoUrls(gallery: GalleryEntity): void {
    if (gallery.photos) {
      for (const photo of gallery.photos) {
        (photo as any).url = this.storageService.generatePublicUrl(
          photo.r2Key,
        );
        (photo as any).thumbnailUrl = photo.r2ThumbnailKey
          ? this.storageService.generatePublicUrl(photo.r2ThumbnailKey)
          : null;
      }
    }
  }
}
