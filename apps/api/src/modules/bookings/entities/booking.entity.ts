import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BookingStatus, EventType } from '@winphotography/shared';
import { UserEntity } from '../../users/entities/user.entity';
import { GalleryEntity } from '../../galleries/entities/gallery.entity';
import { PaymentEntity } from '../../payments/entities/payment.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => UserEntity, (user) => user.bookings, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client: UserEntity;

  @Column({ name: 'inquiry_id', type: 'uuid', nullable: true })
  inquiryId: string | null;

  @Column({ name: 'event_type', type: 'enum', enum: EventType })
  eventType: EventType;

  @Index()
  @Column({ name: 'event_date', type: 'date' })
  eventDate: Date;

  @Column({ name: 'event_end_date', type: 'date', nullable: true })
  eventEndDate: Date | null;

  @Column({ name: 'event_location', type: 'varchar', length: 500 })
  eventLocation: string;

  @Column({ name: 'package_name', type: 'varchar', length: 100 })
  packageName: string;

  @Column({ name: 'package_price', type: 'decimal', precision: 10, scale: 2 })
  packagePrice: number;

  @Column({ name: 'deposit_amount', type: 'decimal', precision: 10, scale: 2 })
  depositAmount: number;

  @Index()
  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING_DEPOSIT })
  status: BookingStatus;

  @Column({ name: 'contract_url', type: 'varchar', length: 500, nullable: true })
  contractUrl: string | null;

  @Column({ name: 'contract_signed_at', type: 'timestamptz', nullable: true })
  contractSignedAt: Date | null;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @Column({ name: 'client_notes', type: 'text', nullable: true })
  clientNotes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => GalleryEntity, (gallery) => gallery.booking)
  galleries: GalleryEntity[];

  @OneToMany(() => PaymentEntity, (payment) => payment.booking)
  payments: PaymentEntity[];
}
