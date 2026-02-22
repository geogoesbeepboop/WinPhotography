import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GalleryEntity } from './gallery.entity';

@Entity('gallery_photos')
export class GalleryPhotoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'gallery_id', type: 'uuid' })
  galleryId: string;

  @ManyToOne(() => GalleryEntity, (gallery) => gallery.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'gallery_id' })
  gallery: GalleryEntity;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ name: 'r2_key', type: 'varchar', length: 500 })
  r2Key: string;

  @Column({ name: 'r2_thumbnail_key', type: 'varchar', length: 500 })
  r2ThumbnailKey: string;

  @Column({ name: 'r2_watermarked_key', type: 'varchar', length: 500, nullable: true })
  r2WatermarkedKey: string | null;

  @Column({ name: 'mime_type', type: 'varchar', length: 50 })
  mimeType: string;

  @Column({ name: 'file_size_bytes', type: 'bigint' })
  fileSizeBytes: number;

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Index()
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  caption: string | null;

  @Column({ name: 'is_favorite', type: 'boolean', default: false })
  isFavorite: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
