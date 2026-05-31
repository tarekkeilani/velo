import { QueryClient } from '@tanstack/react-query';

/**
 * Factory for the React Query client. Centralizing defaults keeps caching and
 * retry behavior consistent and tunable for mobile (conservative retries,
 * sensible stale times to avoid needless refetches and battery drain).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}
