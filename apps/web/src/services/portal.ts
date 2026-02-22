import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';
import { mockPortalBookings, mockPortalGalleries } from '@/lib/mock-data/portal-data';

export const portalKeys = {
  bookings: ['portal', 'bookings'] as const,
  galleries: ['portal', 'galleries'] as const,
  payments: ['portal', 'payments'] as const,
};

export function useMyBookings() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...portalKeys.bookings, dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockPortalBookings;
      const { data } = await apiClient.get('/bookings/my');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMyGalleries() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...portalKeys.galleries, dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockPortalGalleries;
      const { data } = await apiClient.get('/galleries/my');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMyPayments() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...portalKeys.payments, dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return [];
      const { data } = await apiClient.get('/payments/my');
      return data;
    },
    staleTime: 60 * 1000,
  });
}
