import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';

// Packages don't need mock data — the pricing page has its own hardcoded display format.
// This hook is for when packages are managed via admin dashboard.

export const packageKeys = {
  all: ['packages'] as const,
  active: () => [...packageKeys.all, 'active'] as const,
};

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
