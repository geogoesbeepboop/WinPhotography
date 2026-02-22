'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createBrowserClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/auth-store';

function AuthListener({ children }: { children: React.ReactNode }) {
  const { setSupabaseUser, setUserRole, reset } = useAuthStore();

  useEffect(() => {
    const supabase = createBrowserClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setSupabaseUser(user);
        setUserRole((user.user_metadata?.role as 'admin' | 'client') || 'client');
      } else {
        reset();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        setUserRole((session.user.user_metadata?.role as 'admin' | 'client') || 'client');
      } else {
        reset();
      }
    });

    return () => subscription.unsubscribe();
  }, [setSupabaseUser, setUserRole, reset]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthListener>{children}</AuthListener>
    </QueryClientProvider>
  );
}
