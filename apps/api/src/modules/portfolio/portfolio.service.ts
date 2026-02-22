import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioItemEntity } from './entities/portfolio-item.entity';
import { PortfolioPhotoEntity } from './entities/portfolio-photo.entity';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioItemEntity)
    private readonly portfolioRepository: Repository<PortfolioItemEntity>,
    @InjectRepository(PortfolioPhotoEntity)
    private readonly photosRepository: Repository<PortfolioPhotoEntity>,
  ) {}

  async create(data: Partial<PortfolioItemEntity>): Promise<PortfolioItemEntity> {
    throw new Error('Not implemented');
  }

  async findAll(): Promise<PortfolioItemEntity[]> {
    throw new Error('Not implemented');
  }

  async findBySlug(slug: string): Promise<PortfolioItemEntity | null> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<PortfolioItemEntity | null> {
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<PortfolioItemEntity>): Promise<PortfolioItemEntity> {
    throw new Error('Not implemented');
  }

  async remove(id: string): Promise<void> {
    throw new Error('Not implemented');
  }

  async addPhotos(itemId: string, photos: Partial<PortfolioPhotoEntity>[]): Promise<PortfolioPhotoEntity[]> {
    throw new Error('Not implemented');
  }

  async removePhoto(itemId: string, photoId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
