import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PortfolioPhotoEntity } from './portfolio-photo.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { GalleryEntity } from '../../galleries/entities/gallery.entity';

@Entity('portfolio_items')
export class PortfolioItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Index()
  @Column({ name: 'booking_id', type: 'uuid', nullable: true })
  bookingId: string | null;

  @ManyToOne(() => Booking, (booking) => booking.portfolioItems, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking | null;

  @Index({ unique: true })
  @Column({ name: 'source_gallery_id', type: 'uuid', nullable: true, unique: true })
  sourceGalleryId: string | null;

  @ManyToOne(() => GalleryEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_gallery_id' })
  sourceGallery: GalleryEntity | null;

  @Column({ name: 'cover_image_key', type: 'varchar', length: 500 })
  coverImageKey: string;

  @Column({ name: 'cover_thumbnail_key', type: 'varchar', length: 500 })
  coverThumbnailKey: string;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_published', type: 'boolean', default: true })
  isPublished: boolean;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({ name: 'meta_description', type: 'varchar', length: 500, nullable: true })
  metaDescription: string | null;

  @Column({ name: 'event_date', type: 'date', nullable: true })
  eventDate: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => PortfolioPhotoEntity, (photo) => photo.portfolioItem)
  photos: PortfolioPhotoEntity[];
}
