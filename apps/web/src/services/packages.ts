import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';

export const packageKeys = {
  all: ['packages'] as const,
  active: () => [...packageKeys.all, 'active'] as const,
  adminList: () => [...packageKeys.all, 'admin-list'] as const,
};

// Public: active packages only
export function usePackages() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...packageKeys.active(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return [];
      const { data } = await apiClient.get('/packages');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Admin: all packages including inactive
export function useAdminPackages() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...packageKeys.adminList(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return [];
      const { data } = await apiClient.get('/packages/admin/all');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.post('/packages', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
    },
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result } = await apiClient.patch(`/packages/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
    },
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
    },
  });
}
