import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TestimonialEntity } from './entities/testimonial.entity';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(
    @InjectRepository(TestimonialEntity)
    private readonly testimonialsRepository: Repository<TestimonialEntity>,
  ) {}

  async create(data: CreateTestimonialDto): Promise<TestimonialEntity> {
    const testimonial = this.testimonialsRepository.create({
      ...data,
      eventDate: data.eventDate ? new Date(data.eventDate) : null,
    });
    return this.testimonialsRepository.save(testimonial);
  }

  async findPublished(): Promise<TestimonialEntity[]> {
    return this.testimonialsRepository.find({
      where: { isPublished: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findFeatured(): Promise<TestimonialEntity[]> {
    return this.testimonialsRepository.find({
      where: { isFeatured: true, isPublished: true },
      order: { sortOrder: 'ASC' },
    });
  }

  async findAll(): Promise<TestimonialEntity[]> {
    return this.testimonialsRepository.find({
      order: { sortOrder: 'ASC' },
    });
  }

  async findById(id: string): Promise<TestimonialEntity | null> {
    return this.testimonialsRepository.findOne({ where: { id } });
  }

  async update(id: string, data: UpdateTestimonialDto): Promise<TestimonialEntity> {
    const testimonial = await this.testimonialsRepository.findOne({ where: { id } });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID "${id}" not found`);
    }

    const { eventDate, ...rest } = data;
    const updateData: Partial<TestimonialEntity> = { ...rest };

    if (eventDate !== undefined) {
      updateData.eventDate = eventDate ? new Date(eventDate) : null;
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
}
