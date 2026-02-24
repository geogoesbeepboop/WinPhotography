import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PackageEntity } from './entities/package.entity';
import { PricingAddonEntity } from './entities/pricing-addon.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { CreatePricingAddonDto } from './dto/create-pricing-addon.dto';
import { UpdatePricingAddonDto } from './dto/update-pricing-addon.dto';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const DEFAULT_PRICING_ADDONS: Array<{
  name: string;
  description: string;
  price: number;
  priceSuffix?: string;
  sortOrder: number;
}> = [
  {
    name: 'Additional Hour',
    description: 'Extend coverage for your session.',
    price: 400,
    priceSuffix: '/hr',
    sortOrder: 0,
  },
  {
    name: 'Second Photographer',
    description: 'Additional angle coverage for larger sessions.',
    price: 600,
    sortOrder: 1,
  },
  {
    name: 'Rush Delivery (1 week)',
    description: 'Expedited final gallery delivery.',
    price: 500,
    sortOrder: 2,
  },
  {
    name: 'Fine Art Album (30 pages)',
    description: 'Heirloom album with custom design.',
    price: 1200,
    sortOrder: 3,
  },
  {
    name: 'Canvas Gallery Wrap (16x24)',
    description: 'Large wall print for display.',
    price: 350,
    sortOrder: 4,
  },
  {
    name: 'Print Collection (10 prints)',
    description: 'Curated print set from your session.',
    price: 450,
    sortOrder: 5,
  },
];

@Injectable()
export class PackagesService implements OnModuleInit {
  private readonly logger = new Logger(PackagesService.name);

  constructor(
    @InjectRepository(PackageEntity)
    private readonly packagesRepository: Repository<PackageEntity>,
    @InjectRepository(PricingAddonEntity)
    private readonly pricingAddonsRepository: Repository<PricingAddonEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.ensurePricingAddonsTableExists();
      const count = await this.pricingAddonsRepository.count();
      if (count === 0) {
        const defaults = DEFAULT_PRICING_ADDONS.map((addon) =>
          this.pricingAddonsRepository.create({
            ...addon,
            eventType: null,
            isActive: true,
          }),
        );
        await this.pricingAddonsRepository.save(defaults);
      }
    } catch (error) {
      this.logger.error(
        'Failed to initialize pricing_addons table. Dynamic add-ons may be unavailable until DB migrations are applied.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

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

  async createAddOn(data: CreatePricingAddonDto): Promise<PricingAddonEntity> {
    const addon = this.pricingAddonsRepository.create({
      ...data,
      description: data.description?.trim() || null,
      priceSuffix: data.priceSuffix?.trim() || null,
      eventType: data.eventType?.trim() || null,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
    });
    return this.pricingAddonsRepository.save(addon);
  }

  async findActiveAddOns(eventType?: string): Promise<PricingAddonEntity[]> {
    const query = this.pricingAddonsRepository
      .createQueryBuilder('addon')
      .where('addon.isActive = :active', { active: true });

    const normalizedEventType = eventType?.trim();
    if (normalizedEventType) {
      query.andWhere(
        '(addon.eventType IS NULL OR addon.eventType = :eventType)',
        { eventType: normalizedEventType },
      );
    }

    return query.orderBy('addon.sortOrder', 'ASC').addOrderBy('addon.name', 'ASC').getMany();
  }

  async findAllAddOns(): Promise<PricingAddonEntity[]> {
    return this.pricingAddonsRepository.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async updateAddOn(
    id: string,
    data: UpdatePricingAddonDto,
  ): Promise<PricingAddonEntity> {
    const addon = await this.pricingAddonsRepository.findOne({ where: { id } });
    if (!addon) {
      throw new NotFoundException(`Pricing add-on with ID "${id}" not found`);
    }

    const updateData: Partial<PricingAddonEntity> = { ...data };
    if (data.description !== undefined) {
      updateData.description = data.description.trim() || null;
    }
    if (data.priceSuffix !== undefined) {
      updateData.priceSuffix = data.priceSuffix.trim() || null;
    }
    if (data.eventType !== undefined) {
      updateData.eventType = data.eventType.trim() || null;
    }

    Object.assign(addon, updateData);
    return this.pricingAddonsRepository.save(addon);
  }

  async removeAddOn(id: string): Promise<void> {
    const addon = await this.pricingAddonsRepository.findOne({ where: { id } });
    if (!addon) {
      throw new NotFoundException(`Pricing add-on with ID "${id}" not found`);
    }
    await this.pricingAddonsRepository.remove(addon);
  }

  private async ensurePricingAddonsTableExists(): Promise<void> {
    await this.pricingAddonsRepository.query(`
      CREATE TABLE IF NOT EXISTS pricing_addons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(120) NOT NULL,
        description VARCHAR(500),
        price DECIMAL(10, 2) NOT NULL,
        price_suffix VARCHAR(40),
        event_type VARCHAR(100),
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await this.pricingAddonsRepository.query(`
      CREATE INDEX IF NOT EXISTS idx_pricing_addons_active ON pricing_addons (is_active);
    `);
    await this.pricingAddonsRepository.query(`
      CREATE INDEX IF NOT EXISTS idx_pricing_addons_event_type ON pricing_addons (event_type);
    `);
    await this.pricingAddonsRepository.query(`
      CREATE INDEX IF NOT EXISTS idx_pricing_addons_sort_order ON pricing_addons (sort_order);
    `);
  }
}
