import { create } from "zustand";

interface AdminNetworkActivityState {
  mutatingRequests: number;
  increment: () => void;
  decrement: () => void;
}

export const useAdminNetworkActivityStore = create<AdminNetworkActivityState>((set) => ({
  mutatingRequests: 0,
  increment: () =>
    set((state) => ({
      mutatingRequests: state.mutatingRequests + 1,
    })),
  decrement: () =>
    set((state) => ({
      mutatingRequests: Math.max(0, state.mutatingRequests - 1),
    })),
}));
