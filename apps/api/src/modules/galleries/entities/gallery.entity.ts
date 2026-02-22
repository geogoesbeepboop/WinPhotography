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
import { GalleryStatus } from '@winphotography/shared';
import { Booking } from '../../bookings/entities/booking.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { GalleryPhotoEntity } from './gallery-photo.entity';

@Entity('galleries')
export class GalleryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'booking_id', type: 'uuid' })
  bookingId: string;

  @ManyToOne(() => Booking, (booking) => booking.galleries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Index()
  @Column({ name: 'client_id', type: 'uuid' })
  clientId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'client_id' })
  client: UserEntity;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({ type: 'enum', enum: GalleryStatus, default: GalleryStatus.DRAFT })
  status: GalleryStatus;

  @Column({ name: 'cover_photo_id', type: 'uuid', nullable: true })
  coverPhotoId: string | null;

  @Column({ name: 'photo_count', type: 'int', default: 0 })
  photoCount: number;

  @Column({ name: 'total_size_bytes', type: 'bigint', default: 0 })
  totalSizeBytes: number;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date | null;

  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => GalleryPhotoEntity, (photo) => photo.gallery)
  photos: GalleryPhotoEntity[];
}
