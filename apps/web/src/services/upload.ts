import { apiClient } from '@/lib/api-client';

interface PresignedUrlResponse {
  uploadUrl: string;
  key: string;
}

export async function getPortfolioUploadUrl(
  portfolioItemId: string,
  file: File,
): Promise<PresignedUrlResponse> {
  const { data } = await apiClient.post('/portfolio/upload-url', {
    portfolioItemId,
    filename: file.name,
    contentType: file.type,
  });
  return data;
}

export async function getGalleryUploadUrl(
  galleryId: string,
  file: File,
): Promise<PresignedUrlResponse> {
  const { data } = await apiClient.post('/galleries/upload-url', {
    galleryId,
    filename: file.name,
    contentType: file.type,
  });
  return data;
}

export async function uploadFileToR2(
  uploadUrl: string,
  file: File,
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }
}
