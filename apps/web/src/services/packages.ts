import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useDataSourceStore } from '@/stores/admin-settings-store';

export const packageKeys = {
  all: ['packages'] as const,
  active: () => [...packageKeys.all, 'active'] as const,
  adminList: () => [...packageKeys.all, 'admin-list'] as const,
  addOns: (eventType?: string) =>
    [...packageKeys.all, 'add-ons', eventType || 'all'] as const,
  adminAddOns: () => [...packageKeys.all, 'admin-add-ons'] as const,
};

export interface PricingAddOnItem {
  id: string;
  name: string;
  description?: string | null;
  price: number | string;
  priceSuffix?: string | null;
  eventType?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export interface PackageItem {
  id: string;
  name: string;
  subtitle?: string | null;
  categoryLabel?: string | null;
  categoryDescription?: string | null;
  price: number | string;
  features?: string[] | null;
  eventType: string;
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

// Public: active packages only
export function usePackages() {
  const { dataSource } = useDataSourceStore();

  return useQuery<PackageItem[]>({
    queryKey: [...packageKeys.active(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return [];
      const { data } = await apiClient.get('/packages');
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Admin: all packages including inactive
export function useAdminPackages() {
  const { dataSource } = useDataSourceStore();

  return useQuery<PackageItem[]>({
    queryKey: [...packageKeys.adminList(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return [];
      const { data } = await apiClient.get('/packages/admin/all');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

// Public: active pricing add-ons
export function usePricingAddOns(eventType?: string) {
  const { dataSource } = useDataSourceStore();

  return useQuery<PricingAddOnItem[]>({
    queryKey: [...packageKeys.addOns(eventType), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return [];
      const { data } = await apiClient.get('/packages/add-ons', {
        params: eventType ? { eventType } : undefined,
      });
      return data;
    },
    staleTime: 10 * 60 * 1000,
  });
}

// Admin: all add-ons including inactive
export function useAdminPricingAddOns() {
  const { dataSource } = useDataSourceStore();

  return useQuery<PricingAddOnItem[]>({
    queryKey: [...packageKeys.adminAddOns(), dataSource],
    queryFn: async () => {
      if (dataSource === 'mock') return [];
      const { data } = await apiClient.get('/packages/admin/add-ons');
      return data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.post('/packages', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
    },
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result } = await apiClient.patch(`/packages/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
    },
  });
}

export function useDeletePackage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/packages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
    },
  });
}

export function useCreatePricingAddOn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { data: result } = await apiClient.post('/packages/add-ons', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
    },
  });
}

export function useUpdatePricingAddOn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { data: result } = await apiClient.patch(`/packages/add-ons/${id}`, data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
    },
  });
}

export function useDeletePricingAddOn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/packages/add-ons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: packageKeys.all });
    },
  });
}
