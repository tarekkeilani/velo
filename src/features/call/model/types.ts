/**
 * Domain types for the call feature, shared across its data/logic/ui layers.
 *
 * These are deliberately framework-agnostic (plain serializable shapes) so the
 * signaling layer never depends on WebRTC's concrete classes. The WebRTC layer
 * (added in M1/M2) maps these to/from RTCSessionDescription / RTCIceCandidate.
 */

export type RoomCode = string;

/** Who initiates: the caller creates the offer, the callee answers it. */
export type CallRole = 'caller' | 'callee';

export type CallState =
  | 'idle'
  | 'joining' // subscribed to the signaling channel, waiting for the peer
  | 'negotiating' // exchanging offer/answer/ICE
  | 'connected' // P2P media is flowing
  | 'ended'
  | 'failed';

/** Serializable mirror of RTCSessionDescriptionInit. */
export type SessionDescription = {
  type: 'offer' | 'answer';
  sdp: string;
};

/** Serializable mirror of RTCIceCandidateInit. */
export type IceCandidate = {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
};

/** Everything that crosses the signaling channel. One tagged union, one event. */
export type SignalMessage =
  | { kind: 'ready' } // "I'm in the room" — drives the join handshake
  | { kind: 'offer'; description: SessionDescription }
  | { kind: 'answer'; description: SessionDescription }
  | { kind: 'ice'; candidate: IceCandidate }
  | { kind: 'bye' };
