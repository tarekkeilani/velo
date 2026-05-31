import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client factory. The client is created once in the composition root
 * and injected via the services container — features depend on the injected
 * instance, never on a module-level singleton (keeps them test-swappable).
 *
 * We only use the *anon* key + Realtime here. For pure signaling we rely on
 * ephemeral broadcast channels (no rows persisted), so no schema is required.
 */
export function createSupabaseClient(
  url: string,
  anonKey: string,
): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      // No session persistence needed in v1 (anonymous room-code calling).
      persistSession: false,
    },
    realtime: {
      // Light throttle is fine; signaling is a brief one-shot handshake.
      params: { eventsPerSecond: 10 },
    },
  });
}
