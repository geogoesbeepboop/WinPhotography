import { PortfolioCategory } from '../enums';

export interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: PortfolioCategory;
  coverImageKey: string;
  coverThumbnailKey: string;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  metaTitle: string | null;
  metaDescription: string | null;
  eventDate: string | null;
  createdAt: string;
  updatedAt: string;
  photos?: PortfolioPhoto[];
  coverImageUrl?: string;
}

export interface PortfolioPhoto {
  id: string;
  portfolioItemId: string;
  r2Key: string;
  r2ThumbnailKey: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  altText: string | null;
  sortOrder: number;
  createdAt: string;
  thumbnailUrl?: string;
  fullUrl?: string;
}

export interface CreatePortfolioItemDto {
  title: string;
  description?: string;
  category: PortfolioCategory;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  eventDate?: string;
}

export interface UpdatePortfolioItemDto {
  title?: string;
  description?: string;
  category?: PortfolioCategory;
  isFeatured?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
  metaTitle?: string;
  metaDescription?: string;
}
