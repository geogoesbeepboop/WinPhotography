import { API_URL } from '@/lib/constants';
import { createBrowserClient } from '@/lib/supabase/client';

interface UploadResponse {
  key: string;
  publicUrl: string;
}

interface UploadErrorPayload {
  message?: string | string[];
}

type UploadError = Error & {
  response?: {
    data?: UploadErrorPayload;
  };
};

function getErrorMessage(payload?: UploadErrorPayload, fallback?: string): string {
  const message = payload?.message;
  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string' && message.trim()) return message;
  return fallback || 'Upload failed.';
}

function createUploadError(payload?: UploadErrorPayload, fallback?: string): UploadError {
  const error = new Error(getErrorMessage(payload, fallback)) as UploadError;
  error.response = { data: payload };
  return error;
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

  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: HeadersInit = {};
  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  // Let the browser set multipart boundaries automatically.
  const response = await fetch(`${API_URL}/storage/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as UploadErrorPayload &
    UploadResponse;

  if (!response.ok) {
    throw createUploadError(payload, 'Failed to upload file. Please try again.');
  }

  if (!payload.key || !payload.publicUrl) {
    throw createUploadError(payload, 'Upload response was missing file details.');
  }

  return { key: payload.key, publicUrl: payload.publicUrl };
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
