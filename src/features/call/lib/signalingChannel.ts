import { SupabaseClient } from '@supabase/supabase-js';
import { PeerPayload, RoomCode } from '../model/types';

/**
 * DATA LAYER — signaling transport (presence-based).
 *
 * Supabase *broadcast* reception is unreliable in React Native, but *presence*
 * works. So each peer publishes its full signaling state (offer/answer + ICE)
 * as its presence payload via `track()`, and reads the other peer's latest
 * payload on every presence sync. State is cumulative, so the newest snapshot
 * is authoritative — no ordering or replay concerns.
 */
export type SignalingChannel = {
  /** Subscribe, publish initial presence, resolve once joined. */
  join(initial: PeerPayload): Promise<void>;
  /** Republish this peer's full state. */
  setState(payload: PeerPayload): Promise<void>;
  /** Fires on every presence change with the peer's latest state + member count. */
  onPeer(handler: (peer: PeerPayload | null, peerCount: number) => void): void;
  leave(): Promise<void>;
};

/** Rank a meta by completeness; re-track() appends metas, so the one with a
 * description (published after gathering) wins over the initial empty one. */
function completeness(m: PeerPayload): number {
  return m.desc ? 1 : 0;
}

export function createSignalingChannel(
  supabase: SupabaseClient,
  roomCode: RoomCode,
): SignalingChannel {
  // Unique presence key per client so two peers count as two members.
  const presenceKey = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const channel = supabase.channel(`call:${roomCode}`, {
    config: { presence: { key: presenceKey } },
  });

  let peerHandler: ((peer: PeerPayload | null, count: number) => void) | null =
    null;

  const emit = () => {
    const state = channel.presenceState();
    const keys = Object.keys(state);
    const otherKey = keys.find(k => k !== presenceKey);
    let peer: PeerPayload | null = null;
    if (otherKey) {
      const metas = state[otherKey] as unknown as PeerPayload[];
      peer = metas.reduce(
        (best, m) => (completeness(m) >= completeness(best) ? m : best),
        metas[0],
      );
    }
    peerHandler?.(peer, keys.length);
  };

  channel.on('presence', { event: 'sync' }, emit);

  return {
    join: initial =>
      new Promise<void>((resolve, reject) => {
        channel.subscribe(status => {
          if (status === 'SUBSCRIBED') {
            channel
              .track(initial)
              .then(() => resolve())
              .catch(() => resolve());
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            reject(new Error(`Signaling channel failed: ${status}`));
          }
        });
      }),

    setState: async payload => {
      await channel.track(payload);
    },

    onPeer: handler => {
      peerHandler = handler;
    },

    leave: async () => {
      await supabase.removeChannel(channel);
    },
  };
}
