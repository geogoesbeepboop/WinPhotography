import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';
import { mockPayments } from '@/lib/mock-data/admin-data';

export const paymentKeys = {
  all: ['payments'] as const,
  list: () => [...paymentKeys.all, 'list'] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
  byBooking: (bookingId: string) => [...paymentKeys.all, 'booking', bookingId] as const,
};

export function usePayments() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...paymentKeys.list(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockPayments;
      const { data } = await apiClient.get('/payments');
      return data;
    },
    staleTime: 30 * 1000,
  });
}

export function usePaymentsByBooking(bookingId: string) {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...paymentKeys.byBooking(bookingId), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockPayments.filter((p) => p.bookingId === bookingId);
      const { data } = await apiClient.get(`/payments/booking/${bookingId}`);
      return data;
    },
    enabled: !!bookingId,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.post('/payments', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      // Payment changes affect booking detail (payment tracking section)
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useMarkPaymentPaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: result } = await apiClient.post(`/payments/${id}/mark-paid`);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.all });
      // Payment status change affects booking detail view
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}
