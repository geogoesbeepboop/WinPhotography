import axios from 'axios';
import { API_URL } from './constants';
import { createBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useAdminNetworkActivityStore } from '@/stores/network-activity-store';

type TrackedConfig = {
  __adminMutatingRequest?: boolean;
  method?: string;
  url?: string;
  data?: unknown;
  headers?: Record<string, unknown> & {
    setContentType?: (value?: string) => void;
  };
};

function isMutatingMethod(method?: string): boolean {
  const normalized = (method || 'get').toLowerCase();
  return normalized === 'post' || normalized === 'patch' || normalized === 'put' || normalized === 'delete';
}

function isAdminPageContext(): boolean {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
}

function getSuccessFallback(method?: string): string {
  const normalized = (method || 'post').toLowerCase();
  if (normalized === 'delete') return 'Deleted successfully.';
  if (normalized === 'patch' || normalized === 'put') return 'Updated successfully.';
  return 'Saved successfully.';
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== 'object') return fallback;

  const data = payload as { message?: string | string[]; error?: string };
  if (Array.isArray(data.message) && data.message.length > 0) {
    return data.message.join(', ');
  }
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error;
  }
  return fallback;
}

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const trackedConfig = config as typeof config & TrackedConfig;
    const shouldTrackAdminMutation =
      isAdminPageContext() && isMutatingMethod(trackedConfig.method);

    trackedConfig.__adminMutatingRequest = shouldTrackAdminMutation;
    if (shouldTrackAdminMutation) {
      useAdminNetworkActivityStore.getState().increment();
    }

    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      // Allow the browser to set multipart boundaries for FormData uploads.
      if (
        config.headers &&
        typeof trackedConfig.headers?.setContentType === 'function'
      ) {
        trackedConfig.headers?.setContentType(undefined);
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
  },
  (error) => {
    const trackedConfig = error?.config as TrackedConfig | undefined;
    if (trackedConfig?.__adminMutatingRequest) {
      useAdminNetworkActivityStore.getState().decrement();
    }
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  (response) => {
    const trackedConfig = response.config as typeof response.config & TrackedConfig;
    if (trackedConfig.__adminMutatingRequest) {
      useAdminNetworkActivityStore.getState().decrement();
      const message = getErrorMessage(response.data, getSuccessFallback(trackedConfig.method));
      toast.success(message);
    }

    return response;
  },
  (error) => {
    const trackedConfig = error.config as (TrackedConfig | undefined);
    if (trackedConfig?.__adminMutatingRequest) {
      useAdminNetworkActivityStore.getState().decrement();
      const message = getErrorMessage(
        error.response?.data,
        'Action failed. Please try again.',
      );
      toast.error(message);
    }

    if (error.response?.status === 401) {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export { apiClient };
