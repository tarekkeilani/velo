import { SupabaseClient } from '@supabase/supabase-js';
import { RoomCode, SignalMessage } from '../model/types';

/**
 * DATA LAYER — signaling transport.
 *
 * A thin wrapper over a Supabase Realtime *broadcast* channel. Broadcast
 * messages are ephemeral (never written to the database), which is exactly
 * what handshake data should be — zero rows, zero storage. Once the peers
 * connect, media flows directly P2P and this channel is torn down.
 *
 * It knows nothing about WebRTC; it just ships `SignalMessage`s between peers.
 */
export type SignalingChannel = {
  /** Subscribe and resolve once the channel is joined. */
  join(): Promise<void>;
  /** Broadcast a signal to the other peer in the room. */
  send(message: SignalMessage): Promise<void>;
  /** Register a handler for incoming signals. Call before `join()`. */
  onMessage(handler: (message: SignalMessage) => void): void;
  /** Leave and clean up the channel (removes all listeners). */
  leave(): Promise<void>;
};

const EVENT = 'signal';

export function createSignalingChannel(
  supabase: SupabaseClient,
  roomCode: RoomCode,
): SignalingChannel {
  const channel = supabase.channel(`call:${roomCode}`, {
    config: { broadcast: { self: false, ack: true } },
  });

  return {
    join: () =>
      new Promise<void>((resolve, reject) => {
        channel.subscribe(status => {
          if (status === 'SUBSCRIBED') {
            resolve();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            reject(new Error(`Signaling channel failed: ${status}`));
          }
        });
      }),

    send: async message => {
      await channel.send({ type: 'broadcast', event: EVENT, payload: message });
    },

    onMessage: handler => {
      channel.on('broadcast', { event: EVENT }, ({ payload }) => {
        handler(payload as SignalMessage);
      });
    },

    leave: async () => {
      await supabase.removeChannel(channel);
    },
  };
}
