import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('testimonials')
export class TestimonialEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'client_name', type: 'varchar', length: 255 })
  clientName: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100, nullable: true })
  eventType: string | null;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string | null;

  @ManyToOne(() => Booking, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking | null;

  @Column({ name: 'event_date', type: 'date', nullable: true })
  eventDate: Date | null;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'smallint', nullable: true })
  rating: number | null;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
