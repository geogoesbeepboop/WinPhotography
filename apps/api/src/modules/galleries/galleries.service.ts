import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryStatus } from '@winphotography/shared';
import { GalleryEntity } from './entities/gallery.entity';
import { GalleryPhotoEntity } from './entities/gallery-photo.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class GalleriesService {
  private readonly logger = new Logger(GalleriesService.name);

  constructor(
    @InjectRepository(GalleryEntity)
    private readonly galleriesRepository: Repository<GalleryEntity>,
    @InjectRepository(GalleryPhotoEntity)
    private readonly photosRepository: Repository<GalleryPhotoEntity>,
    private readonly emailService: EmailService,
  ) {}

  async create(data: Partial<GalleryEntity>): Promise<GalleryEntity> {
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
    return this.galleriesRepository.findOne({
      where: { id },
      relations: ['photos', 'booking', 'client'],
    });
  }

  async findByClientId(clientId: string): Promise<GalleryEntity[]> {
    return this.galleriesRepository.find({
      where: { clientId },
      relations: ['booking'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<GalleryEntity>): Promise<GalleryEntity> {
    const gallery = await this.galleriesRepository.findOne({ where: { id } });
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID "${id}" not found`);
    }
    Object.assign(gallery, data);
    return this.galleriesRepository.save(gallery);
  }

  async remove(id: string): Promise<void> {
    const gallery = await this.galleriesRepository.findOne({ where: { id } });
    if (!gallery) {
      throw new NotFoundException(`Gallery with ID "${id}" not found`);
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
        this.logger.error(`Failed to send gallery ready email to ${gallery.client.email}`, error?.stack ?? error);
      }
    }

    return saved;
  }

  async addPhotos(galleryId: string, photos: Partial<GalleryPhotoEntity>[]): Promise<GalleryPhotoEntity[]> {
    // TODO: Implement when R2/storage integration is set up
    throw new Error('Not implemented - requires R2/storage integration');
  }

  async removePhoto(galleryId: string, photoId: string): Promise<void> {
    // TODO: Implement when R2/storage integration is set up
    throw new Error('Not implemented - requires R2/storage integration');
  }

  async getPhoto(galleryId: string, photoId: string): Promise<GalleryPhotoEntity | null> {
    // TODO: Implement when R2/storage integration is set up
    throw new Error('Not implemented - requires R2/storage integration');
  }

  async generateDownloadUrl(galleryId: string, photoId: string): Promise<string> {
    // TODO: Implement when R2/storage integration is set up
    throw new Error('Not implemented - requires R2/storage integration');
  }

  async generateBulkDownloadUrl(galleryId: string): Promise<string> {
    // TODO: Implement when R2/storage integration is set up
    throw new Error('Not implemented - requires R2/storage integration');
  }
}
