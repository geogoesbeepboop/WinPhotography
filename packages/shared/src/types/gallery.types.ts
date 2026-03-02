import { GalleryStatus } from '../enums';

export interface Gallery {
  id: string;
  bookingId: string | null;
  clientId: string;
  title: string;
  description: string | null;
  status: GalleryStatus;
  coverPhotoId: string | null;
  photoCount: number;
  totalSizeBytes: number;
  publishedAt: string | null;
  expiresAt: string | null;
  isHiddenPublic: boolean;
  publicAccessSlug: string | null;
  createdAt: string;
  updatedAt: string;
  photos?: GalleryPhoto[];
}

export interface GalleryPhoto {
  id: string;
  galleryId: string;
  filename: string;
  r2Key: string;
  r2ThumbnailKey: string;
  r2WatermarkedKey: string | null;
  mimeType: string;
  fileSizeBytes: number;
  width: number | null;
  height: number | null;
  sortOrder: number;
  caption: string | null;
  isFavorite: boolean;
  createdAt: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
}

export interface CreateGalleryDto {
  bookingId: string;
  title: string;
  description?: string;
}

export interface CreateHiddenGalleryDto {
  title: string;
  description?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
}

export interface UpdateGalleryDto {
  title?: string;
  description?: string;
  status?: GalleryStatus;
  coverPhotoId?: string;
}
