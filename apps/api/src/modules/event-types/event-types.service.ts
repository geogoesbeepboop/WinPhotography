import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventTypeEntity } from './entities/event-type.entity';
import { CreateEventTypeDto } from './dto/create-event-type.dto';
import { UpdateEventTypeDto } from './dto/update-event-type.dto';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Default event types seeded on first run if table is empty. */
const DEFAULT_EVENT_TYPES = [
  { name: 'Wedding', slug: 'wedding', sortOrder: 0 },
  { name: 'Engagement', slug: 'engagement', sortOrder: 1 },
  { name: 'Portrait', slug: 'portrait', sortOrder: 2 },
  { name: 'Event', slug: 'event', sortOrder: 3 },
  { name: 'Other', slug: 'other', sortOrder: 4 },
];

@Injectable()
export class EventTypesService implements OnModuleInit {
  private readonly logger = new Logger(EventTypesService.name);
  private readonly enumTargets = ['event_type', 'portfolio_category'] as const;

  constructor(
    @InjectRepository(EventTypeEntity)
    private readonly repo: Repository<EventTypeEntity>,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureTableExists();
      const count = await this.repo.count();
      if (count === 0) {
        this.logger.log('Seeding default event types...');
        for (const et of DEFAULT_EVENT_TYPES) {
          await this.repo.save(this.repo.create(et));
          await this.syncEnumValues(et.slug);
        }
        this.logger.log(`Seeded ${DEFAULT_EVENT_TYPES.length} event types`);
      } else {
        const existingTypes = await this.repo.find();
        for (const eventType of existingTypes) {
          await this.syncEnumValues(eventType.slug);
        }
      }
    } catch (error) {
      // Keep API boot resilient even if migrations are pending.
      this.logger.error(
        'Failed to initialize event_types table. Event type admin features may be unavailable until DB migrations are applied.',
        error?.stack ?? String(error),
      );
    }
  }

  async findAll(): Promise<EventTypeEntity[]> {
    return this.repo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async findActive(): Promise<EventTypeEntity[]> {
    return this.repo.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  async findById(id: string): Promise<EventTypeEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateEventTypeDto): Promise<EventTypeEntity> {
    const slug = this.normalizeSlug(dto.slug || dto.name);
    const sortOrder = dto.sortOrder ?? 0;
    const existing = await this.repo.findOne({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Event type with slug "${slug}" already exists`);
    }
    await this.ensureSortOrderAvailable(sortOrder);

    const entity = this.repo.create({
      name: dto.name,
      slug,
      isActive: dto.isActive ?? true,
      sortOrder,
    });
    const saved = await this.repo.save(entity);
    await this.syncEnumValues(saved.slug);
    return saved;
  }

  async update(id: string, dto: UpdateEventTypeDto): Promise<EventTypeEntity> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Event type ${id} not found`);
    }

    if (dto.name !== undefined) entity.name = dto.name;
    if (dto.slug !== undefined) {
      const normalized = this.normalizeSlug(dto.slug);
      const existing = await this.repo.findOne({ where: { slug: normalized } });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Event type with slug "${normalized}" already exists`);
      }
      entity.slug = normalized;
    }
    if (dto.isActive !== undefined) entity.isActive = dto.isActive;
    if (dto.sortOrder !== undefined) {
      await this.ensureSortOrderAvailable(dto.sortOrder, id);
      entity.sortOrder = dto.sortOrder;
    }

    const saved = await this.repo.save(entity);
    await this.syncEnumValues(saved.slug);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const result = await this.repo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event type ${id} not found`);
    }
  }

  private normalizeSlug(input: string): string {
    const slug = generateSlug(input);
    if (!slug) {
      throw new BadRequestException('Event type slug must contain letters or numbers');
    }
    return slug;
  }

  private async ensureTableExists(): Promise<void> {
    await this.repo.query(`
      CREATE TABLE IF NOT EXISTS event_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) NOT NULL UNIQUE,
        is_active BOOLEAN NOT NULL DEFAULT true,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    await this.repo.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_event_types_slug ON event_types (slug);
    `);

    // Ensure pre-existing duplicate sort orders are repaired before enforcing uniqueness.
    await this.repo.query(`
      WITH duplicate_rows AS (
        SELECT
          id,
          sort_order,
          ROW_NUMBER() OVER (
            PARTITION BY sort_order
            ORDER BY created_at ASC, id ASC
          ) AS duplicate_rank
        FROM event_types
      ),
      max_sort AS (
        SELECT COALESCE(MAX(sort_order), -1) AS value
        FROM event_types
      ),
      reassignments AS (
        SELECT
          d.id,
          m.value + ROW_NUMBER() OVER (ORDER BY d.sort_order ASC, d.id ASC) AS new_sort_order
        FROM duplicate_rows d
        CROSS JOIN max_sort m
        WHERE d.duplicate_rank > 1
      )
      UPDATE event_types e
      SET sort_order = r.new_sort_order
      FROM reassignments r
      WHERE e.id = r.id;
    `);

    await this.repo.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_event_types_sort_order ON event_types (sort_order);
    `);
  }

  private async syncEnumValues(slug: string): Promise<void> {
    for (const enumName of this.enumTargets) {
      await this.ensureEnumValue(enumName, slug);
    }
  }

  private async ensureEnumValue(enumName: string, value: string): Promise<void> {
    await this.repo.query(
      `ALTER TYPE ${enumName} ADD VALUE IF NOT EXISTS '${value}';`,
    );
  }

  private async ensureSortOrderAvailable(
    sortOrder: number,
    excludeId?: string,
  ): Promise<void> {
    const query = this.repo
      .createQueryBuilder('eventType')
      .where('eventType.sortOrder = :sortOrder', { sortOrder });

    if (excludeId) {
      query.andWhere('eventType.id != :excludeId', { excludeId });
    }

    const existing = await query.getOne();
    if (existing) {
      throw new ConflictException(
        `Sort order "${sortOrder}" is already used by "${existing.name}"`,
      );
    }
  }
}
