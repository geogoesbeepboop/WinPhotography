import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InquiryStatus } from '@winphotography/shared';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('inquiries')
export class InquiryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'contact_name', type: 'varchar', length: 255 })
  contactName: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 255 })
  contactEmail: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 50, nullable: true })
  contactPhone: string | null;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({ name: 'event_date', type: 'date', nullable: true })
  eventDate: Date | null;

  @Column({ name: 'event_location', type: 'varchar', length: 500, nullable: true })
  eventLocation: string | null;

  @Column({ name: 'guest_count', type: 'int', nullable: true })
  guestCount: number | null;

  @Column({ name: 'package_interest', type: 'varchar', length: 100, nullable: true })
  packageInterest: string | null;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'how_found_us', type: 'varchar', length: 255, nullable: true })
  howFoundUs: string | null;

  @Index()
  @Column({ type: 'enum', enum: InquiryStatus, default: InquiryStatus.NEW })
  status: InquiryStatus;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string | null;

  @ManyToOne(() => Booking, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking | null;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
