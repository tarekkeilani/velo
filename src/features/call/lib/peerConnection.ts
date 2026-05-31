import {
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from 'react-native-webrtc';
import { IceCandidate, SessionDescription } from '../model/types';

/**
 * DATA LAYER — WebRTC primitives.
 *
 * Owns construction of the RTCPeerConnection and the translation between
 * WebRTC's concrete objects and our serializable signaling types. Keeping this
 * mapping here means `useCall` (logic) and the signaling channel (transport)
 * never touch a raw RTC object, and stay unit-testable.
 */
export type IceServer = { urls: string };

export function createPeerConnection(
  iceServers: readonly IceServer[],
): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: [...iceServers] });
}

/** Add every local track to the connection so the peer receives our media. */
export function attachLocalStream(
  pc: RTCPeerConnection,
  stream: MediaStream,
): void {
  stream.getTracks().forEach(track => pc.addTrack(track, stream));
}

export function serializeDescription(d: {
  type: string;
  sdp?: string | null;
}): SessionDescription {
  return { type: d.type === 'answer' ? 'answer' : 'offer', sdp: d.sdp ?? '' };
}

export function toRTCSessionDescription(
  d: SessionDescription,
): RTCSessionDescription {
  return new RTCSessionDescription(d);
}

export function serializeCandidate(c: {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
}): IceCandidate {
  return {
    candidate: c.candidate,
    sdpMid: c.sdpMid ?? null,
    sdpMLineIndex: c.sdpMLineIndex ?? null,
  };
}

export function toRTCIceCandidate(c: IceCandidate): RTCIceCandidate {
  return new RTCIceCandidate(c);
}
