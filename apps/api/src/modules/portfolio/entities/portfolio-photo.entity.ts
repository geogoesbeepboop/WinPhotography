import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PortfolioItemEntity } from './portfolio-item.entity';

@Entity('portfolio_photos')
export class PortfolioPhotoEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'portfolio_item_id', type: 'uuid' })
  portfolioItemId: string;

  @ManyToOne(() => PortfolioItemEntity, (item) => item.photos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'portfolio_item_id' })
  portfolioItem: PortfolioItemEntity;

  @Column({ name: 'r2_key', type: 'varchar', length: 500 })
  r2Key: string;

  @Column({ name: 'r2_thumbnail_key', type: 'varchar', length: 500 })
  r2ThumbnailKey: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 50 })
  mimeType: string;

  @Column({ type: 'int', nullable: true })
  width: number | null;

  @Column({ type: 'int', nullable: true })
  height: number | null;

  @Column({ name: 'alt_text', type: 'varchar', length: 255, nullable: true })
  altText: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
