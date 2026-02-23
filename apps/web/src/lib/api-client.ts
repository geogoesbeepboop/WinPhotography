import axios from 'axios';
import { API_URL } from './constants';
import { createBrowserClient } from '@/lib/supabase/client';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    // Allow the browser to set multipart boundaries for FormData uploads.
    if (config.headers && typeof (config.headers as any).setContentType === 'function') {
      (config.headers as any).setContentType(undefined);
    } else if (config.headers) {
      delete (config.headers as Record<string, unknown>)['Content-Type'];
    }
  }

  const supabase = createBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export { apiClient };
