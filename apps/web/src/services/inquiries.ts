import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';
import { mockInquiries } from '@/lib/mock-data/admin-data';

export const inquiryKeys = {
  all: ['inquiries'] as const,
  list: () => [...inquiryKeys.all, 'list'] as const,
  detail: (id: string) => [...inquiryKeys.all, 'detail', id] as const,
};

export function useInquiries() {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...inquiryKeys.list(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockInquiries;
      const { data } = await apiClient.get('/inquiries');
      return data;
    },
    staleTime: 30 * 1000, // 30s — inquiries change frequently
  });
}

export function useInquiry(id: string) {
  const { dataSource } = useDataSourceStore();

  return useQuery({
    queryKey: [...inquiryKeys.detail(id), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return mockInquiries.find((i) => i.id === id) ?? null;
      const { data } = await apiClient.get(`/inquiries/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useUpdateInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result } = await apiClient.patch(`/inquiries/${id}`, data);
      return result;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: inquiryKeys.detail(variables.id) });
      const previous = queryClient.getQueryData(inquiryKeys.detail(variables.id));
      queryClient.setQueryData(inquiryKeys.detail(variables.id), (old: any) =>
        old ? { ...old, ...variables } : old,
      );
      return { previous };
    },
    onError: (_err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(inquiryKeys.detail(variables.id), context.previous);
      }
    },
    onSettled: (_data, _err, variables) => {
      queryClient.invalidateQueries({ queryKey: inquiryKeys.list() });
      queryClient.invalidateQueries({ queryKey: inquiryKeys.detail(variables.id) });
    },
  });
}

export function useDeleteInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/inquiries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiryKeys.list() });
    },
  });
}
