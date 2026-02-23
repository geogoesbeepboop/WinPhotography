import { apiClient } from '@/lib/api-client';

interface UploadResponse {
  key: string;
  publicUrl: string;
}

/**
 * Upload a file to R2 via the API server (avoids CORS issues with presigned URLs).
 */
async function serverUpload(
  file: File,
  folder: string,
  entityId?: string,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (entityId) formData.append('entityId', entityId);

  // Let the browser set the multipart boundary automatically.
  const { data } = await apiClient.post('/storage/upload', formData);
  return data;
}

export async function uploadPortfolioPhoto(
  portfolioItemId: string,
  file: File,
): Promise<UploadResponse> {
  return serverUpload(file, 'portfolio', portfolioItemId);
}

export async function uploadGalleryPhoto(
  galleryId: string,
  file: File,
): Promise<UploadResponse> {
  return serverUpload(file, 'galleries', galleryId);
}

export async function uploadBlogCoverImage(
  file: File,
): Promise<UploadResponse> {
  return serverUpload(file, 'blog');
}
