import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';
import { mockBookings } from '@/lib/mock-data/admin-data';

export const bookingKeys = {
  all: ['bookings'] as const,
  list: () => [...bookingKeys.all, 'list'] as const,
  detail: (id: string) => [...bookingKeys.all, 'detail', id] as const,
};

export function useBookings() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...bookingKeys.list(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockBookings;
      const { data } = await apiClient.get('/bookings');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useBooking(id: string) {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...bookingKeys.detail(id), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockBookings.find((b) => b.id === id) ?? null;
      const { data } = await apiClient.get(`/bookings/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.post('/bookings', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.list() });
      // Also invalidate inquiries since inquiry→booking conversion changes inquiry status
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result } = await apiClient.patch(`/bookings/${id}`, data);
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: bookingKeys.detail(variables.id) });
      const previous = queryClient.getQueryData(bookingKeys.detail(variables.id));
      queryClient.setQueryData(bookingKeys.detail(variables.id), (old: any) =>
        old ? { ...old, ...variables } : old,
      );
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bookingKeys.detail(variables.id), context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.list() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.id) });
    },
  });
}
