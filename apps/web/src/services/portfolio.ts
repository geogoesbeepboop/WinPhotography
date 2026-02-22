import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';
import { mockPortfolio } from '@/lib/mock-data/admin-data';
import { mockPublicPortfolio } from '@/lib/mock-data/portal-data';

export const portfolioKeys = {
  all: ['portfolio'] as const,
  list: () => [...portfolioKeys.all, 'list'] as const,
  adminList: () => [...portfolioKeys.all, 'admin-list'] as const,
  detail: (id: string) => [...portfolioKeys.all, 'detail', id] as const,
  bySlug: (slug: string) => [...portfolioKeys.all, 'slug', slug] as const,
};

// Admin: all items (published + draft)
export function useAdminPortfolio() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...portfolioKeys.adminList(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockPortfolio;
      const { data } = await apiClient.get('/portfolio/admin/all');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

// Public: published items only
export function usePortfolio() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...portfolioKeys.list(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockPublicPortfolio;
      const { data } = await apiClient.get('/portfolio');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePortfolioBySlug(slug: string) {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...portfolioKeys.bySlug(slug), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockPublicPortfolio.find((p) => p.slug === slug) ?? null;
      const { data } = await apiClient.get(`/portfolio/${slug}`);
      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.post('/portfolio', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
}

export function useUpdatePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result } = await apiClient.patch(`/portfolio/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
}

export function useDeletePortfolioItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/portfolio/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.all });
    },
  });
}
