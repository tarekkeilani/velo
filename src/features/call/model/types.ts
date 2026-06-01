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

/**
 * Each peer's signaling state, published via Supabase *presence* (reliable in
 * React Native, unlike broadcast). We use *non-trickle* ICE: a peer gathers all
 * its ICE candidates first, so `desc` is a complete SDP with candidates already
 * embedded. The other side only needs `setRemoteDescription` — no per-candidate
 * `addIceCandidate` calls (which were aborting the native WebRTC lib).
 */
export type PeerPayload = {
  role: CallRole;
  desc: SessionDescription | null;
};
