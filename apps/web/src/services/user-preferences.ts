import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useDataSourceStore } from "@/stores/admin-settings-store";

export interface NotificationPreferences {
  notifyGalleryReady: boolean;
  notifyPaymentReminders: boolean;
  notifySessionReminders: boolean;
  notifyPromotions: boolean;
}

const defaultPreferences: NotificationPreferences = {
  notifyGalleryReady: true,
  notifyPaymentReminders: true,
  notifySessionReminders: true,
  notifyPromotions: false,
};

export const userPreferenceKeys = {
  all: ["user-preferences"] as const,
  notification: () => [...userPreferenceKeys.all, "notification"] as const,
};

export function useNotificationPreferences() {
  const { dataSource } = useDataSourceStore();

  return useQuery<NotificationPreferences>({
    queryKey: [...userPreferenceKeys.notification(), dataSource],
    queryFn: async () => {
      if (dataSource === "mock") return defaultPreferences;
      const { data } = await apiClient.get("/users/me/preferences");
      return {
        ...defaultPreferences,
        ...data,
      } as NotificationPreferences;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<NotificationPreferences>) => {
      const { data } = await apiClient.patch("/users/me/preferences", payload);
      return data as NotificationPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userPreferenceKeys.notification() });
    },
  });
}
