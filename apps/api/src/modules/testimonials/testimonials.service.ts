import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestimonialEntity } from './entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { Booking } from '../bookings/entities/booking.entity';
import { SubmitTestimonialDto } from './dto/submit-testimonial.dto';
import { UpdateMyTestimonialDto } from './dto/update-my-testimonial.dto';
import { deriveBookingLifecycleStage } from '../../common/utils/booking-lifecycle';
import { PortfolioItemEntity } from '../portfolio/entities/portfolio-item.entity';

type PublicTestimonial = TestimonialEntity & {
  portfolioSlug?: string | null;
};

@Injectable()
export class TestimonialsService implements OnModuleInit {
  private readonly logger = new Logger(TestimonialsService.name);

  constructor(
    @InjectRepository(TestimonialEntity)
    private readonly testimonialsRepository: Repository<TestimonialEntity>,
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(
        'Failed to ensure testimonials schema. Run SQL migrations if testimonial features fail.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async create(data: CreateTestimonialDto): Promise<TestimonialEntity> {
    const booking = data.bookingId
      ? await this.bookingsRepository.findOne({
          where: { id: data.bookingId },
          relations: ['client'],
        })
      : null;

    if (data.bookingId && !booking) {
      throw new NotFoundException(`Booking "${data.bookingId}" not found`);
    }

    if (booking?.id) {
      const existing = await this.testimonialsRepository.findOne({
        where: { bookingId: booking.id },
      });
      if (existing) {
        throw new BadRequestException(
          'A testimonial already exists for this booking',
        );
      }
    }

    const testimonial = this.testimonialsRepository.create({
      ...data,
      bookingId: booking?.id ?? null,
      clientName: data.clientName || booking?.client?.fullName || 'Client',
      eventType: this.normalizeEventType(data.eventType ?? booking?.eventType),
      eventDate: data.eventDate ? new Date(data.eventDate) : null,
    });
    return this.testimonialsRepository.save(testimonial);
  }

  async findPublished(): Promise<TestimonialEntity[]> {
    const testimonials = await this.testimonialsRepository.find({
      where: { isPublished: true },
      relations: [
        'booking',
        'booking.client',
        'booking.payments',
        'booking.galleries',
        'booking.portfolioItems',
      ],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return testimonials.map((testimonial) =>
      this.attachPublicBookingMetadata(
        this.attachBookingLifecycleStage(testimonial),
      ),
    );
  }

  async findFeatured(): Promise<TestimonialEntity[]> {
    const testimonials = await this.testimonialsRepository.find({
      where: { isFeatured: true, isPublished: true },
      relations: [
        'booking',
        'booking.client',
        'booking.payments',
        'booking.galleries',
        'booking.portfolioItems',
      ],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return testimonials.map((testimonial) =>
      this.attachPublicBookingMetadata(
        this.attachBookingLifecycleStage(testimonial),
      ),
    );
  }

  async findAll(): Promise<TestimonialEntity[]> {
    return this.testimonialsRepository.find({
      relations: ['booking', 'booking.client'],
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<TestimonialEntity | null> {
    const testimonial = await this.testimonialsRepository.findOne({
      where: { id },
      relations: ['booking', 'booking.client', 'booking.payments', 'booking.galleries'],
    });
    return testimonial ? this.attachBookingLifecycleStage(testimonial) : null;
  }

  async findPublishedById(id: string): Promise<TestimonialEntity | null> {
    const testimonial = await this.testimonialsRepository.findOne({
      where: { id, isPublished: true },
      relations: [
        'booking',
        'booking.client',
        'booking.payments',
        'booking.galleries',
        'booking.portfolioItems',
      ],
    });
    return testimonial
      ? this.attachPublicBookingMetadata(
          this.attachBookingLifecycleStage(testimonial),
        )
      : null;
  }

  async findMine(clientId: string): Promise<TestimonialEntity[]> {
    const testimonials = await this.testimonialsRepository
      .createQueryBuilder('testimonial')
      .leftJoinAndSelect('testimonial.booking', 'booking')
      .leftJoinAndSelect('booking.client', 'client')
      .leftJoinAndSelect('booking.payments', 'payments')
      .leftJoinAndSelect('booking.galleries', 'galleries')
      .where('booking.client_id = :clientId', { clientId })
      .orderBy('testimonial.createdAt', 'DESC')
      .getMany();
    return testimonials.map((testimonial) => this.attachBookingLifecycleStage(testimonial));
  }

  async submitByClient(
    clientId: string,
    data: SubmitTestimonialDto,
  ): Promise<TestimonialEntity> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: data.bookingId, clientId },
      relations: ['client'],
    });

    if (!booking) {
      throw new NotFoundException(
        `Booking "${data.bookingId}" not found for current client`,
      );
    }

    const bookingLifecycle = deriveBookingLifecycleStage(booking);

    if (bookingLifecycle !== 'completed') {
      throw new BadRequestException(
        'Testimonials can only be submitted once your booking is fully paid and gallery delivery is complete',
      );
    }

    const existing = await this.testimonialsRepository.findOne({
      where: { bookingId: booking.id },
      relations: ['booking'],
    });

    if (existing && existing.booking?.clientId !== clientId) {
      throw new NotFoundException('Testimonial not found for current client');
    }

    if (existing) {
      existing.content = data.content.trim();
      existing.rating = data.rating ?? existing.rating ?? null;
      existing.clientName = booking.client?.fullName || existing.clientName;
      existing.eventType = this.normalizeEventType(booking.eventType);
      existing.eventDate = booking.eventDate;
      existing.isPublished = false;
      existing.isFeatured = false;
      return this.testimonialsRepository.save(existing);
    }

    const testimonial = this.testimonialsRepository.create({
      bookingId: booking.id,
      clientName: booking.client?.fullName || 'Client',
      eventType: this.normalizeEventType(booking.eventType),
      eventDate: booking.eventDate,
      content: data.content.trim(),
      rating: data.rating ?? null,
      isPublished: false,
      isFeatured: false,
      sortOrder: 0,
    });

    return this.testimonialsRepository.save(testimonial);
  }

  async updateMine(
    clientId: string,
    testimonialId: string,
    data: UpdateMyTestimonialDto,
  ): Promise<TestimonialEntity> {
    const testimonial = await this.testimonialsRepository
      .createQueryBuilder('testimonial')
      .leftJoinAndSelect('testimonial.booking', 'booking')
      .leftJoinAndSelect('booking.client', 'client')
      .where('testimonial.id = :testimonialId', { testimonialId })
      .andWhere('booking.client_id = :clientId', { clientId })
      .getOne();

    if (!testimonial) {
      throw new NotFoundException(
        `Testimonial "${testimonialId}" not found for current client`,
      );
    }

    const hasMutableFields =
      data.content !== undefined || data.rating !== undefined;
    if (!hasMutableFields) {
      return testimonial;
    }

    if (data.content !== undefined) {
      testimonial.content = data.content.trim();
    }
    if (data.rating !== undefined) {
      testimonial.rating = data.rating;
    }

    testimonial.isPublished = false;
    testimonial.isFeatured = false;

    return this.testimonialsRepository.save(testimonial);
  }

  async update(id: string, data: UpdateTestimonialDto): Promise<TestimonialEntity> {
    const testimonial = await this.testimonialsRepository.findOne({
      where: { id },
    });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID "${id}" not found`);
    }

    const { eventDate, bookingId, eventType, ...rest } = data;
    const updateData: Partial<TestimonialEntity> = { ...rest };

    if (bookingId !== undefined) {
      if (bookingId === null) {
        updateData.bookingId = null;
      } else {
        const booking = await this.bookingsRepository.findOne({
          where: { id: bookingId },
        });
        if (!booking) {
          throw new NotFoundException(`Booking "${bookingId}" not found`);
        }
        updateData.bookingId = booking.id;
      }
    }

    if (eventDate !== undefined) {
      updateData.eventDate = eventDate ? new Date(eventDate) : null;
    }
    if (eventType !== undefined) {
      updateData.eventType = this.normalizeEventType(eventType);
    }

    Object.assign(testimonial, updateData);
    return this.testimonialsRepository.save(testimonial);
  }

  async remove(id: string): Promise<void> {
    const testimonial = await this.testimonialsRepository.findOne({ where: { id } });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID "${id}" not found`);
    }
    await this.testimonialsRepository.remove(testimonial);
  }

  private normalizeEventType(value?: string | null): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }

  private attachBookingLifecycleStage(
    testimonial: TestimonialEntity,
  ): TestimonialEntity {
    if (!testimonial.booking) return testimonial;
    const lifecycleStage = deriveBookingLifecycleStage(testimonial.booking);
    Object.assign(testimonial.booking, { lifecycleStage });
    return testimonial;
  }

  private attachPublicBookingMetadata(
    testimonial: TestimonialEntity,
  ): PublicTestimonial {
    const withPortfolioSlug = testimonial as PublicTestimonial;
    const booking = testimonial.booking as
      | (Booking & { portfolioItems?: PortfolioItemEntity[]; lifecycleStage?: string })
      | null;

    const linkedPortfolio =
      booking?.portfolioItems?.find(
        (item) => item.isPublished && Boolean(item.slug?.trim()),
      ) || null;
    withPortfolioSlug.portfolioSlug = linkedPortfolio?.slug ?? null;

    if (!booking) {
      return withPortfolioSlug;
    }

    // Public endpoints should expose booking date context only (no internal time fields).
    (withPortfolioSlug as any).booking = {
      id: booking.id,
      eventType: booking.eventType,
      eventDate: booking.eventDate,
      packageName: booking.packageName,
      status: booking.status,
      lifecycleStage:
        (booking as any).lifecycleStage ?? deriveBookingLifecycleStage(booking),
      clientId: booking.clientId,
    };

    return withPortfolioSlug;
  }

  private async ensureSchema(): Promise<void> {
    await this.testimonialsRepository.query(`
      ALTER TABLE testimonials
      ADD COLUMN IF NOT EXISTS booking_id UUID;
    `);

    await this.testimonialsRepository.query(`
      DO $$ BEGIN
        ALTER TABLE testimonials
          ADD CONSTRAINT fk_testimonials_booking
          FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await this.testimonialsRepository.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_testimonials_booking_unique
      ON testimonials (booking_id)
      WHERE booking_id IS NOT NULL;
    `);

    await this.testimonialsRepository.query(`
      CREATE INDEX IF NOT EXISTS idx_testimonials_published_featured
      ON testimonials (is_published, is_featured);
    `);

    await this.testimonialsRepository.query(`
      DO $$
      DECLARE
        current_type TEXT;
      BEGIN
        SELECT data_type
        INTO current_type
        FROM information_schema.columns
        WHERE table_name = 'testimonials'
          AND column_name = 'event_type';

        IF current_type IS NOT NULL AND current_type <> 'character varying' THEN
          ALTER TABLE testimonials
            ALTER COLUMN event_type TYPE VARCHAR(100)
            USING event_type::text;
        END IF;
      END $$;
    `);
  }
}
