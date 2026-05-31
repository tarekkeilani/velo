import React, { useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@shared/theme/ThemeProvider';
import { ServicesProvider, Services } from '@shared/lib/services';
import { createHttpClient } from '@shared/lib/httpClient';
import { createInMemoryStorage } from '@shared/lib/storage';
import { createQueryClient } from '@shared/lib/queryClient';
import { createSupabaseClient } from '@shared/lib/supabase';
import { env } from '@app/config/env';

/**
 * COMPOSITION ROOT.
 * The single place where concrete dependencies are constructed and wired into
 * the tree. Everything below depends on abstractions; only this file knows the
 * real implementations — so swapping storage, API host, or theme is local.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(createQueryClient, []);
  const services = useMemo<Services>(
    () => ({
      supabase: createSupabaseClient(env.supabaseUrl, env.supabaseAnonKey),
      http: createHttpClient({ baseUrl: env.supabaseUrl }),
      storage: createInMemoryStorage(),
    }),
    [],
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ServicesProvider services={services}>
          <ThemeProvider>{children}</ThemeProvider>
        </ServicesProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
