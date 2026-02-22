import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InquiryEntity } from './entities/inquiry.entity';
import { InquiryStatus } from '@winphotography/shared';
import { CreateInquiryDto } from './dto/create-inquiry.dto';

@Injectable()
export class InquiriesService {
  constructor(
    @InjectRepository(InquiryEntity)
    private readonly inquiriesRepository: Repository<InquiryEntity>,
  ) {}

  async create(dto: CreateInquiryDto): Promise<InquiryEntity> {
    const inquiry = this.inquiriesRepository.create({
      ...dto,
      eventDate: dto.eventDate ? new Date(dto.eventDate) : null,
      status: InquiryStatus.NEW,
    });
    return this.inquiriesRepository.save(inquiry);
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
    Object.assign(inquiry, data);
    return this.inquiriesRepository.save(inquiry);
  }

  async remove(id: string): Promise<void> {
    const result = await this.inquiriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Inquiry ${id} not found`);
    }
  }

  async convertToBooking(id: string): Promise<any> {
    // TODO: Implement inquiry-to-booking conversion in Phase 3
    throw new Error('Not implemented — requires BookingsService');
  }
}
