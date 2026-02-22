import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepository: Repository<Booking>,
  ) {}

  async create(data: Partial<Booking>): Promise<Booking> {
    throw new Error('Not implemented');
  }

  async findAll(): Promise<Booking[]> {
    throw new Error('Not implemented');
  }

  async findById(id: string): Promise<Booking | null> {
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<Booking>): Promise<Booking> {
    throw new Error('Not implemented');
  }

  async remove(id: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
