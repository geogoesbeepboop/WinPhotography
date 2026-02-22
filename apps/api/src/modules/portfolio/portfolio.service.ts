import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioItemEntity } from './entities/portfolio-item.entity';
import { PortfolioPhotoEntity } from './entities/portfolio-photo.entity';
import { CreatePortfolioItemDto } from './dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from './dto/update-portfolio-item.dto';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioItemEntity)
    private readonly portfolioRepository: Repository<PortfolioItemEntity>,
    @InjectRepository(PortfolioPhotoEntity)
    private readonly photosRepository: Repository<PortfolioPhotoEntity>,
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

  async findAll(): Promise<PortfolioItemEntity[]> {
    return this.portfolioRepository.find({
      relations: ['photos'],
      order: { sortOrder: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<PortfolioItemEntity | null> {
    return this.portfolioRepository.findOne({
      where: { slug },
      relations: ['photos'],
    });
  }

  async findById(id: string): Promise<PortfolioItemEntity | null> {
    return this.portfolioRepository.findOne({
      where: { id },
      relations: ['photos'],
    });
  }

  async findPublished(): Promise<PortfolioItemEntity[]> {
    return this.portfolioRepository.find({
      where: { isPublished: true },
      relations: ['photos'],
      order: { sortOrder: 'ASC' },
    });
  }

  async findFeatured(): Promise<PortfolioItemEntity[]> {
    return this.portfolioRepository.find({
      where: { isFeatured: true, isPublished: true },
      relations: ['photos'],
      order: { sortOrder: 'ASC' },
    });
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

    // Re-generate slug if title changes
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
    const item = await this.portfolioRepository.findOne({ where: { id } });

    if (!item) {
      throw new NotFoundException(`Portfolio item with ID "${id}" not found`);
    }

    // Photos are cascade-deleted via the entity relation (onDelete: 'CASCADE')
    await this.portfolioRepository.remove(item);
  }

  async addPhotos(
    itemId: string,
    photos: Partial<PortfolioPhotoEntity>[],
  ): Promise<PortfolioPhotoEntity[]> {
    // TODO: Implement when R2 storage integration is ready
    throw new Error(
      'Not implemented: photo upload requires R2 storage integration',
    );
  }

  async removePhoto(itemId: string, photoId: string): Promise<void> {
    // TODO: Implement when R2 storage integration is ready
    throw new Error(
      'Not implemented: photo removal requires R2 storage integration',
    );
  }
}
