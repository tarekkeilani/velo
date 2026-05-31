/**
 * App configuration — the single place for environment-level constants.
 *
 * For a real build, source these from a build-time injector such as
 * `react-native-config` (a `.env` file, git-ignored) instead of the inline
 * placeholders below. The Supabase *anon* key is safe to ship in a client;
 * the service-role key never is.
 */
export const env = {
  supabaseUrl: 'https://bpgzfbgoohriwgaqpckg.supabase.co',
  supabaseAnonKey: 'sb_publishable_hnGF0ZxZOMH4wXr4LNjEMQ_Jzo5kyGi',

  /**
   * STUN only (free, no hosting). STUN helps peers discover their public
   * address for NAT traversal — it never sees or relays media. No TURN means
   * a minority of strict-NAT calls won't connect; that's the free tradeoff.
   */
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
} as const;
