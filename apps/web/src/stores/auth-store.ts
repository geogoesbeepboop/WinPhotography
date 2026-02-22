import { create } from 'zustand';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
  supabaseUser: SupabaseUser | null;
  userRole: 'admin' | 'client' | null;
  isLoading: boolean;
  setSupabaseUser: (user: SupabaseUser | null) => void;
  setUserRole: (role: 'admin' | 'client' | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  supabaseUser: null,
  userRole: null,
  isLoading: true,
  setSupabaseUser: (supabaseUser) => set({ supabaseUser, isLoading: false }),
  setUserRole: (userRole) => set({ userRole }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ supabaseUser: null, userRole: null, isLoading: false }),
}));
