import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export const portalKeys = {
  bookings: ['portal', 'bookings'] as const,
  galleries: ['portal', 'galleries'] as const,
  payments: ['portal', 'payments'] as const,
};

export function useMyBookings() {
  return useQuery({
    queryKey: portalKeys.bookings,
    queryFn: async () => {
      const { data } = await apiClient.get('/bookings/my');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMyGalleries() {
  return useQuery({
    queryKey: portalKeys.galleries,
    queryFn: async () => {
      const { data } = await apiClient.get('/galleries/my');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useMyPayments() {
  return useQuery({
    queryKey: portalKeys.payments,
    queryFn: async () => {
      const { data } = await apiClient.get('/payments/my');
      return data;
    },
    staleTime: 60 * 1000,
  });
}
