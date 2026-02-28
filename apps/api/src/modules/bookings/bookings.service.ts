import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
    private readonly emailService: EmailService,
  ) {}

  async create(data: Partial<Booking>): Promise<Booking> {
    const booking = this.bookingsRepository.create(data);
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
    Object.assign(booking, data);
    const saved = await this.bookingsRepository.save(booking);

    // Send email notifications on status changes
    if (data.status && data.status !== previousStatus) {
      if (data.status === BookingStatus.UPCOMING && booking.client?.email) {
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
          newStatus: String(data.status),
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
}
