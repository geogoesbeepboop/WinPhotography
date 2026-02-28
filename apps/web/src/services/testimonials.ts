import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';
import { mockTestimonials } from '@/lib/mock-data/portal-data';

interface TestimonialBookingSummary {
  id: string;
  eventType?: string | null;
  eventDate?: string | null;
  packageName?: string | null;
  status?: string | null;
  lifecycleStage?: string | null;
  clientId?: string;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  eventType?: string | null;
  portfolioSlug?: string | null;
  bookingId?: string | null;
  booking?: TestimonialBookingSummary | null;
  eventDate?: string | null;
  content: string;
  rating?: number | null;
  avatarUrl?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const testimonialKeys = {
  all: ['testimonials'] as const,
  published: () => [...testimonialKeys.all, 'published'] as const,
  featured: () => [...testimonialKeys.all, 'featured'] as const,
  byId: (id: string) => [...testimonialKeys.all, 'by-id', id] as const,
  adminList: () => [...testimonialKeys.all, 'admin-list'] as const,
  my: () => [...testimonialKeys.all, 'my'] as const,
};

export function useTestimonials() {
  const { dataSource } = useDataSourceStore();

  return useQuery<TestimonialItem[]>({
    queryKey: [...testimonialKeys.published(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockTestimonials as TestimonialItem[];
      const { data } = await apiClient.get('/testimonials/published');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useFeaturedTestimonials() {
  const { dataSource } = useDataSourceStore();

  return useQuery<TestimonialItem[]>({
    queryKey: [...testimonialKeys.featured(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') {
        return (mockTestimonials as TestimonialItem[]).filter((t) => t.isFeatured);
      }
      const { data } = await apiClient.get('/testimonials/featured');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useTestimonialById(id: string) {
  const { dataSource } = useDataSourceStore();

  return useQuery<TestimonialItem | null>({
    queryKey: [...testimonialKeys.byId(id), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') {
        const item = (mockTestimonials as TestimonialItem[]).find((testimonial) => testimonial.id === id);
        return item ?? null;
      }
      const { data } = await apiClient.get(`/testimonials/${id}`);
      return data;
    },
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminTestimonials() {
  const { dataSource } = useDataSourceStore();

  return useQuery<TestimonialItem[]>({
    queryKey: [...testimonialKeys.adminList(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockTestimonials as TestimonialItem[];
      const { data } = await apiClient.get('/testimonials/admin/all');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMyTestimonials() {
  return useQuery<TestimonialItem[]>({
    queryKey: testimonialKeys.my(),
    queryFn: async () => {
      const { data } = await apiClient.get('/testimonials/my');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      clientName: string;
      eventType?: string;
      eventDate?: string;
      bookingId?: string;
      content: string;
      rating?: number;
      avatarUrl?: string;
      isFeatured?: boolean;
      isPublished?: boolean;
      sortOrder?: number;
    }) => {
      const { data: result } = await apiClient.post('/testimonials', data);
      return result as TestimonialItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
    },
  });
}

export function useUpdateTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      clientName?: string;
      eventType?: string;
      eventDate?: string;
      bookingId?: string;
      content?: string;
      rating?: number;
      avatarUrl?: string;
      isFeatured?: boolean;
      isPublished?: boolean;
      sortOrder?: number;
    }) => {
      const { data: result } = await apiClient.patch(`/testimonials/${id}`, data);
      return result as TestimonialItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
    },
  });
}

export function useSubmitMyTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { bookingId: string; content: string; rating?: number }) => {
      const { data: result } = await apiClient.post('/testimonials/my', data);
      return result as TestimonialItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
      queryClient.invalidateQueries({ queryKey: ['portal', 'bookings'] });
    },
  });
}

export function useUpdateMyTestimonial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      content?: string;
      rating?: number;
    }) => {
      const { data: result } = await apiClient.patch(`/testimonials/my/${id}`, data);
      return result as TestimonialItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
      queryClient.invalidateQueries({ queryKey: ['portal', 'bookings'] });
    },
  });
}
