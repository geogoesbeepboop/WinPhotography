import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  forwardRef,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InquiryEntity } from './entities/inquiry.entity';
import { InquiryStatus } from '@winphotography/shared';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { EmailService } from '../email/email.service';
import { BookingsService } from '../bookings/bookings.service';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class InquiriesService implements OnModuleInit {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiriesRepository: Repository<InquiryEntity>,
    private readonly emailService: EmailService,
    @Inject(forwardRef(() => BookingsService))
    private readonly bookingsService: BookingsService,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(
        'Failed to ensure inquiry preferred-time column exists. Run SQL migrations if inquiry updates fail.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async create(dto: CreateInquiryDto): Promise<InquiryEntity> {
    const inquiry = this.inquiriesRepository.create({
      ...dto,
      eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
      eventTime: this.normalizeEventTime(dto.eventTime),
      status: InquiryStatus.NEW,
    });
    const saved = await this.inquiriesRepository.save(inquiry);

    try {
      await this.emailService.sendInquiryConfirmation(dto.contactEmail, {
        name: dto.contactName,
        eventType: dto.eventType,
        eventDate: dto.eventDate,
      });
    } catch (error) {
      this.logger.error(`Failed to send inquiry confirmation email to ${dto.contactEmail}`, error?.stack ?? error);
    }

    try {
      await this.emailService.sendAdminNotification('new_inquiry', {
        clientName: dto.contactName,
        clientEmail: dto.contactEmail,
        eventType: dto.eventType,
        eventDate: dto.eventDate,
      });
    } catch (error) {
      this.logger.error('Failed to send admin notification for new inquiry', error?.stack ?? error);
    }

    return saved;
  }

  async findAll(): Promise<InquiryEntity[]> {
    return this.inquiriesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<InquiryEntity | null> {
    return this.inquiriesRepository.findOne({ where: { id } });
  }

  async update(id: string, data: Partial<InquiryEntity>): Promise<InquiryEntity> {
    const inquiry = await this.inquiriesRepository.findOne({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException(`Inquiry ${id} not found`);
    }
    const normalizedData: Partial<InquiryEntity> = {
      ...data,
      ...(data.eventTime !== undefined
        ? { eventTime: this.normalizeEventTime(data.eventTime) }
        : {}),
    };
    Object.assign(inquiry, normalizedData);
    return this.inquiriesRepository.save(inquiry);
  }

  async remove(id: string): Promise<void> {
    const result = await this.inquiriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Inquiry ${id} not found`);
    }
  }

  async convertToBooking(
    id: string,
    conversionData: {
      clientId: string;
      packageName: string;
      packagePrice: number;
      depositAmount: number;
      eventDate?: string;
      eventTime?: string;
      eventTimezone?: string;
      eventLocation?: string;
    },
  ): Promise<{ booking: Booking; inquiry: InquiryEntity }> {
    const inquiry = await this.findById(id);
    if (!inquiry) {
      throw new NotFoundException(`Inquiry ${id} not found`);
    }
    if (inquiry.status === InquiryStatus.CONVERTED) {
      throw new BadRequestException('Inquiry already converted');
    }

    const booking = await this.bookingsService.create({
      clientId: conversionData.clientId,
      inquiryId: inquiry.id,
      eventType: inquiry.eventType,
      eventDate: conversionData.eventDate
        ? new Date(conversionData.eventDate)
        : inquiry.eventDate ?? new Date(),
      eventTime:
        this.normalizeEventTime(conversionData.eventTime) ||
        this.normalizeEventTime(inquiry.eventTime) ||
        '12:00:00',
      eventTimezone: conversionData.eventTimezone || 'America/New_York',
      eventLocation: conversionData.eventLocation || inquiry.eventLocation || 'TBD',
      packageName: conversionData.packageName,
      packagePrice: conversionData.packagePrice,
      depositAmount: conversionData.depositAmount,
    });

    inquiry.status = InquiryStatus.CONVERTED;
    inquiry.bookingId = booking.id;
    await this.inquiriesRepository.save(inquiry);

    return { booking, inquiry };
  }

  private normalizeEventTime(value?: string | null): string | null {
    const raw = (value || '').trim();
    if (!raw) return null;
    if (/^\d{2}:\d{2}$/.test(raw)) {
      return `${raw}:00`;
    }
    if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) {
      return raw;
    }
    return null;
  }

  private async ensureSchema(): Promise<void> {
    await this.inquiriesRepository.query(`
      ALTER TABLE inquiries
      ADD COLUMN IF NOT EXISTS event_time TIME;
    `);
  }
}
