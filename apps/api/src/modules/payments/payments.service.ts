import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentsRepository: Repository<PaymentEntity>,
  ) {}

  async create(data: Partial<PaymentEntity>): Promise<PaymentEntity> {
    throw new Error('Not implemented');
  }

  async findAll(): Promise<PaymentEntity[]> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<PaymentEntity | null> {
    throw new Error('Not implemented');
  }

  async findByBookingId(bookingId: string): Promise<PaymentEntity[]> {
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<PaymentEntity>): Promise<PaymentEntity> {
    throw new Error('Not implemented');
  }

  async markAsPaid(id: string): Promise<PaymentEntity> {
    throw new Error('Not implemented');
  }
}
