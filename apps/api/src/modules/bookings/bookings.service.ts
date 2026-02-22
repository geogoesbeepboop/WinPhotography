import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { EmailService } from '../email/email.service';

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
    return this.bookingsRepository.save(booking);
  }

  async findAll(): Promise<Booking[]> {
    return this.bookingsRepository.find({
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<Booking | null> {
    return this.bookingsRepository.findOne({
      where: { id },
      relations: ['client', 'payments', 'galleries'],
    });
  }

  async findByClientId(clientId: string): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: { clientId },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<Booking>): Promise<Booking> {
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
      if (data.status === 'confirmed' && booking.client?.email) {
        try {
          await this.emailService.sendBookingConfirmed(booking.client.email, {
            clientName: booking.client.fullName,
            eventType: booking.eventType,
            eventDate: booking.eventDate,
            eventLocation: booking.eventLocation,
            packageName: booking.packageName,
          });
        } catch (error) {
          this.logger.error(`Failed to send booking confirmed email to ${booking.client.email}`, error?.stack ?? error);
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

    return saved;
  }

  async remove(id: string): Promise<void> {
    const booking = await this.bookingsRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException(`Booking with ID "${id}" not found`);
    }
    await this.bookingsRepository.remove(booking);
  }
}
