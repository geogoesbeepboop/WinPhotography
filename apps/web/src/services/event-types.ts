import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface EventTypeItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

export const eventTypeKeys = {
  all: ['event-types'] as const,
  active: () => [...eventTypeKeys.all, 'active'] as const,
  adminList: () => [...eventTypeKeys.all, 'admin-list'] as const,
};

/** Public: active event types for dropdowns */
export function useEventTypes() {
  return useQuery<EventTypeItem[]>({
    queryKey: eventTypeKeys.active(),
    queryFn: async () => {
      const { data } = await apiClient.get('/event-types');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Admin: all event types including inactive */
export function useAdminEventTypes() {
  return useQuery<EventTypeItem[]>({
    queryKey: eventTypeKeys.adminList(),
    queryFn: async () => {
      const { data } = await apiClient.get('/event-types/admin/all');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; slug?: string; isActive?: boolean; sortOrder?: number }) => {
      const { data: result } = await apiClient.post('/event-types', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypeKeys.all });
    },
  });
}

export function useUpdateEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result } = await apiClient.patch(`/event-types/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypeKeys.all });
    },
  });
}

export function useDeleteEventType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/event-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventTypeKeys.all });
    },
  });
}
