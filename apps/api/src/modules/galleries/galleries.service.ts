import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GalleryEntity } from './entities/gallery.entity';
import { GalleryPhotoEntity } from './entities/gallery-photo.entity';

@Injectable()
export class GalleriesService {
  constructor(
    @InjectRepository(GalleryEntity)
    private readonly galleriesRepository: Repository<GalleryEntity>,
    @InjectRepository(GalleryPhotoEntity)
    private readonly photosRepository: Repository<GalleryPhotoEntity>,
  ) {}

  async create(data: Partial<GalleryEntity>): Promise<GalleryEntity> {
    throw new Error('Not implemented');
  }

  async findAll(): Promise<GalleryEntity[]> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<GalleryEntity | null> {
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<GalleryEntity>): Promise<GalleryEntity> {
    throw new Error('Not implemented');
  }

  async remove(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async addPhotos(galleryId: string, photos: Partial<GalleryPhotoEntity>[]): Promise<GalleryPhotoEntity[]> {
    throw new Error('Not implemented');
  }

  async removePhoto(galleryId: string, photoId: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async getPhoto(galleryId: string, photoId: string): Promise<GalleryPhotoEntity | null> {
    throw new Error('Not implemented');
  }

  async publish(id: string): Promise<GalleryEntity> {
    throw new Error('Not implemented');
  }

  async generateDownloadUrl(galleryId: string, photoId: string): Promise<string> {
    throw new Error('Not implemented');
  }

  async generateBulkDownloadUrl(galleryId: string): Promise<string> {
    throw new Error('Not implemented');
  }
}
