import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';
import { mockClients } from '@/lib/mock-data/admin-data';

export const clientKeys = {
  all: ['clients'] as const,
  list: () => [...clientKeys.all, 'list'] as const,
  detail: (id: string) => [...clientKeys.all, 'detail', id] as const,
};

export function useClients() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...clientKeys.list(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockClients;
      const { data } = await apiClient.get('/users/clients');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { fullName: string; email: string; phone?: string }) => {
      const { data: result } = await apiClient.post('/users', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useClient(id: string) {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...clientKeys.detail(id), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockClients.find((c) => c.id === id) ?? null;
      const { data } = await apiClient.get(`/users/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
