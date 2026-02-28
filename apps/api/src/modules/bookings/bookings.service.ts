import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingStatus } from '@winphotography/shared';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { EmailService } from '../email/email.service';
import {
  BookingLifecycleStage,
  deriveBookingLifecycleStage,
} from '../../common/utils/booking-lifecycle';

export type BookingWithLifecycle = Booking & {
  lifecycleStage: BookingLifecycleStage;
};

@Injectable()
export class BookingsService implements OnModuleInit {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    try {
      await this.ensureSchema();
    } catch (error) {
      this.logger.error(
        'Failed to ensure booking datetime columns exist. Run SQL migrations if booking updates fail.',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async create(data: Partial<Booking>): Promise<Booking> {
    const booking = this.bookingsRepository.create({
      ...data,
      eventTime: this.normalizeEventTime(data.eventTime),
      eventTimezone: this.normalizeEventTimezone(data.eventTimezone),
    });
    const saved = await this.bookingsRepository.save(booking);
    const hydrated = await this.findById(saved.id);
    if (!hydrated) {
      throw new NotFoundException(`Booking with ID "${saved.id}" not found`);
    }
    return hydrated;
  }

  async findAll(): Promise<BookingWithLifecycle[]> {
    const bookings = await this.bookingsRepository.find({
      relations: ['client', 'payments', 'galleries'],
      order: { createdAt: 'DESC' },
    });
    return bookings.map((booking) => this.attachLifecycleStage(booking));
  }

  async findById(id: string): Promise<BookingWithLifecycle | null> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['client', 'payments', 'galleries'],
    });
    return booking ? this.attachLifecycleStage(booking) : null;
  }

  async findByClientId(clientId: string): Promise<BookingWithLifecycle[]> {
    const bookings = await this.bookingsRepository.find({
      where: { clientId },
      relations: ['client', 'payments', 'galleries'],
      order: { createdAt: 'DESC' },
    });
    return bookings.map((booking) => this.attachLifecycleStage(booking));
  }

  async update(id: string, data: Partial<Booking>): Promise<BookingWithLifecycle> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['client'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }

    const previousStatus = booking.status;
    const normalizedData: Partial<Booking> = {
      ...data,
      ...(data.eventTime !== undefined
        ? { eventTime: this.normalizeEventTime(data.eventTime) }
        : {}),
      ...(data.eventTimezone !== undefined
        ? { eventTimezone: this.normalizeEventTimezone(data.eventTimezone) }
        : {}),
    };

    Object.assign(booking, normalizedData);
    const saved = await this.bookingsRepository.save(booking);

    // Send email notifications on status changes
    if (normalizedData.status && normalizedData.status !== previousStatus) {
      if (normalizedData.status === BookingStatus.UPCOMING && booking.client?.email) {
        try {
          await this.emailService.sendBookingConfirmed(booking.client.email, {
            clientName: booking.client.fullName,
            eventType: booking.eventType,
            eventDate: booking.eventDate,
            eventLocation: booking.eventLocation,
            packageName: booking.packageName,
          });
        } catch (error) {
          this.logger.error(
            `Failed to send booking confirmation email to ${booking.client.email}`,
            error?.stack ?? error,
          );
        }
      }

      try {
        await this.emailService.sendAdminNotification('booking_status_change', {
          clientName: booking.client?.fullName,
          clientEmail: booking.client?.email,
          bookingId: booking.id,
          eventType: booking.eventType,
          eventDate: booking.eventDate,
          previousStatus,
          newStatus: String(normalizedData.status),
        });
      } catch (error) {
        this.logger.error('Failed to send admin notification for booking status change', error?.stack ?? error);
      }
    }

    const hydrated = await this.findById(saved.id);
    if (!hydrated) {
      throw new NotFoundException(`Booking with ID "${saved.id}" not found`);
    }

    return hydrated;
  }

  async remove(id: string): Promise<void> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }
    await this.bookingsRepository.remove(booking);
  }

  private attachLifecycleStage(booking: Booking): BookingWithLifecycle {
    const lifecycleStage = deriveBookingLifecycleStage(booking);
    Object.assign(booking, { lifecycleStage });
    return booking as BookingWithLifecycle;
  }

  private normalizeEventTime(value?: string | null): string {
    const raw = (value || '').trim();
    if (!raw) return '12:00:00';
    if (/^\d{2}:\d{2}$/.test(raw)) {
      return `${raw}:00`;
    }
    if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) {
      return raw;
    }
    return '12:00:00';
  }

  private normalizeEventTimezone(value?: string | null): string {
    const raw = (value || '').trim();
    return raw || 'America/New_York';
  }

  private async ensureSchema(): Promise<void> {
    await this.bookingsRepository.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS event_time TIME;
    `);

    await this.bookingsRepository.query(`
      UPDATE bookings
      SET event_time = '12:00:00'
      WHERE event_time IS NULL;
    `);

    await this.bookingsRepository.query(`
      ALTER TABLE bookings
      ALTER COLUMN event_time SET DEFAULT '12:00:00';
    `);

    await this.bookingsRepository.query(`
      ALTER TABLE bookings
      ALTER COLUMN event_time SET NOT NULL;
    `);

    await this.bookingsRepository.query(`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS event_timezone VARCHAR(64);
    `);

    await this.bookingsRepository.query(`
      UPDATE bookings
      SET event_timezone = 'America/New_York'
      WHERE event_timezone IS NULL OR btrim(event_timezone) = '';
    `);

    await this.bookingsRepository.query(`
      ALTER TABLE bookings
      ALTER COLUMN event_timezone SET DEFAULT 'America/New_York';
    `);

    await this.bookingsRepository.query(`
      ALTER TABLE bookings
      ALTER COLUMN event_timezone SET NOT NULL;
    `);
  }
}
