import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';
import { mockTestimonials } from '@/lib/mock-data/portal-data';

export const testimonialKeys = {
  all: ['testimonials'] as const,
  published: () => [...testimonialKeys.all, 'published'] as const,
  featured: () => [...testimonialKeys.all, 'featured'] as const,
};

export function useTestimonials() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...testimonialKeys.published(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockTestimonials;
      const { data } = await apiClient.get('/testimonials');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useFeaturedTestimonials() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...testimonialKeys.featured(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockTestimonials.filter((t) => t.isFeatured);
      const { data } = await apiClient.get('/testimonials/featured');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
