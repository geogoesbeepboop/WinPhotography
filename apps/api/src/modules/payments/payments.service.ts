import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentStatus } from '@winphotography/shared';
import { PaymentEntity } from './entities/payment.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentsRepository: Repository<PaymentEntity>,
    private readonly emailService: EmailService,
  ) {}

  async create(data: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const payment = this.paymentsRepository.create(data);
    return this.paymentsRepository.save(payment);
  }

  async findAll(): Promise<PaymentEntity[]> {
    return this.paymentsRepository.find({
      relations: ['booking', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    return this.paymentsRepository.findOne({
      where: { id },
      relations: ['booking', 'client'],
    });
  }

  async findByBookingId(bookingId: string): Promise<PaymentEntity[]> {
    return this.paymentsRepository.find({
      where: { bookingId },
      relations: ['booking', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByClientId(clientId: string): Promise<PaymentEntity[]> {
    return this.paymentsRepository.find({
      where: { clientId },
      relations: ['booking', 'client'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<PaymentEntity>): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.findOne({ where: { id } });
    if (!payment) {
      throw new NotFoundException(`Payment with ID "${id}" not found`);
    }
    Object.assign(payment, data);
    return this.paymentsRepository.save(payment);
  }

  async markAsPaid(id: string): Promise<PaymentEntity> {
    const payment = await this.paymentsRepository.findOne({
      where: { id },
      relations: ['client', 'booking'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID "${id}" not found`);
    }
    payment.status = PaymentStatus.SUCCEEDED;
    payment.paidAt = new Date();
    const saved = await this.paymentsRepository.save(payment);

    if (payment.client?.email) {
      try {
        await this.emailService.sendPaymentReceipt(payment.client.email, {
          clientName: payment.client.fullName,
          amount: Number(payment.amount),
          currency: payment.currency,
          paymentType: payment.paymentType,
          paidAt: payment.paidAt,
          description: payment.description ?? undefined,
        });
      } catch (error) {
        this.logger.error(`Failed to send payment receipt email to ${payment.client.email}`, error?.stack ?? error);
      }
    }

    try {
      await this.emailService.sendAdminNotification('payment_received', {
        clientName: payment.client?.fullName,
        clientEmail: payment.client?.email,
        amount: Number(payment.amount),
        currency: payment.currency,
        paymentType: payment.paymentType,
        paymentId: payment.id,
        bookingId: payment.bookingId,
      });
    } catch (error) {
      this.logger.error('Failed to send admin notification for payment received', error?.stack ?? error);
    }

    return saved;
  }

  // TODO: Implement Stripe checkout session creation
  async createCheckoutSession(data: {
    bookingId: string;
    paymentType: string;
    amount: number;
    description?: string;
  }): Promise<{ url: string }> {
    // TODO: Use StripeService to create a Stripe Checkout Session
    // and return the checkout URL
    throw new Error('Stripe checkout not yet implemented');
  }

  // TODO: Implement Stripe webhook handling
  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    // TODO: Verify webhook signature via StripeService,
    // parse event, and update payment status accordingly
    throw new Error('Stripe webhook handling not yet implemented');
  }
}
