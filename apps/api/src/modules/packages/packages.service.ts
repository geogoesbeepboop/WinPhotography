import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageEntity } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(PackageEntity)
    private readonly packagesRepository: Repository<PackageEntity>,
  ) {}

  async create(data: CreatePackageDto): Promise<PackageEntity> {
    const slug = generateSlug(data.name);
    const pkg = this.packagesRepository.create({
      ...data,
      slug,
    });
    return this.packagesRepository.save(pkg);
  }

  async findActive(): Promise<PackageEntity[]> {
    return this.packagesRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findAll(): Promise<PackageEntity[]> {
    return this.packagesRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async findById(id: string): Promise<PackageEntity | null> {
    return this.packagesRepository.findOne({ where: { id } });
  }

  async update(id: string, data: UpdatePackageDto): Promise<PackageEntity> {
    const pkg = await this.packagesRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException(`Package with ID "${id}" not found`);
    }

    const updateData: Partial<PackageEntity> = { ...data };

    // Re-generate slug if name changes
    if (data.name) {
      updateData.slug = generateSlug(data.name);
    }

    Object.assign(pkg, updateData);
    return this.packagesRepository.save(pkg);
  }

  async remove(id: string): Promise<void> {
    const pkg = await this.packagesRepository.findOne({ where: { id } });
    if (!pkg) {
      throw new NotFoundException(`Package with ID "${id}" not found`);
    }
    await this.packagesRepository.remove(pkg);
  }
}
