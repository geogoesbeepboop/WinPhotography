import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';
import { mockGalleries } from '@/lib/mock-data/admin-data';
import { mockPortalGalleries } from '@/lib/mock-data/portal-data';

export const galleryKeys = {
  all: ['galleries'] as const,
  list: () => [...galleryKeys.all, 'list'] as const,
  detail: (id: string) => [...galleryKeys.all, 'detail', id] as const,
};

export function useGalleries() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...galleryKeys.list(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockGalleries;
      const { data } = await apiClient.get('/galleries');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useGallery(id: string) {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...galleryKeys.detail(id), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') {
        // Check admin mock data first, then portal mock data
        return mockGalleries.find((g) => g.id === id)
          ?? mockPortalGalleries.find((g) => g.id === id)
          ?? null;
      }
      const { data } = await apiClient.get(`/galleries/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.post('/galleries', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.list() });
    },
  });
}

export function useUpdateGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result } = await apiClient.patch(`/galleries/${id}`, data);
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.list() });
      queryClient.invalidateQueries({ queryKey: galleryKeys.detail(variables.id) });
    },
  });
}

export function usePublishGallery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result } = await apiClient.post(`/galleries/${id}/publish`);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: galleryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
