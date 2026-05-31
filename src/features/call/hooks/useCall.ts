import { useCallback, useEffect, useRef, useState } from 'react';
import { MediaStream, RTCPeerConnection } from 'react-native-webrtc';
import { sha256 } from 'js-sha256';
import { useServices } from '@shared/lib/services';
import { env } from '@app/config/env';
import { deriveSafetyCode } from '../lib/sas';
import { extractDtlsFingerprint } from '../lib/fingerprint';
import {
  CallRole,
  CallState,
  IceCandidate,
  RoomCode,
  SignalMessage,
} from '../model/types';
import {
  createSignalingChannel,
  SignalingChannel,
} from '../lib/signalingChannel';
import {
  attachLocalStream,
  createPeerConnection,
  serializeCandidate,
  serializeDescription,
  toRTCIceCandidate,
  toRTCSessionDescription,
} from '../lib/peerConnection';

/**
 * LOGIC LAYER — the call orchestrator.
 *
 * Wires the peer connection (data) to the signaling channel (transport) and
 * drives the offer/answer/ICE exchange. The UI only reads `state` /
 * `remoteStream` and calls `hangUp`. Roles are fixed (caller offers, callee
 * answers), so we avoid full perfect-negotiation; the only real hazard is the
 * join-order race on an ephemeral broadcast channel, handled by a small
 * "ready" handshake below.
 */
export type Call = {
  state: CallState;
  remoteStream: MediaStream | null;
  /** SAS safety code for out-of-band verification; null until negotiated. */
  safetyCode: string | null;
  hangUp: () => void;
};

/**
 * Minimal, precisely-typed view of the parts of RTCPeerConnection's event API
 * we use. react-native-webrtc's EventTarget base doesn't surface
 * `addEventListener` cleanly through its published types, so we narrow it here
 * rather than reaching for `any`.
 */
type RawIceCandidate = {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
};
type PeerEvents = {
  addEventListener(t: 'icecandidate', cb: (e: { candidate: RawIceCandidate | null }) => void): void;
  addEventListener(t: 'track', cb: (e: { streams: MediaStream[] }) => void): void;
  addEventListener(t: 'connectionstatechange', cb: () => void): void;
};

type Params = {
  roomCode: RoomCode;
  role: CallRole;
  localStream: MediaStream | null;
};

export function useCall({ roomCode, role, localStream }: Params): Call {
  const { supabase } = useServices();
  const [state, setState] = useState<CallState>('idle');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [safetyCode, setSafetyCode] = useState<string | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<SignalingChannel | null>(null);
  // Buffer remote ICE that arrives before the remote description is set.
  const pendingIce = useRef<IceCandidate[]>([]);
  const remoteReady = useRef(false);
  const offerMade = useRef(false);
  const repliedReady = useRef(false);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    channelRef.current?.leave();
    channelRef.current = null;
  }, []);

  const hangUp = useCallback(() => {
    channelRef.current?.send({ kind: 'bye' });
    setState('ended');
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    // Wait until the local camera/mic is ready before negotiating.
    if (!localStream) {
      return;
    }

    let disposed = false;
    const pc = createPeerConnection(env.iceServers);
    pcRef.current = pc;
    attachLocalStream(pc, localStream);

    const channel = createSignalingChannel(supabase, roomCode);
    channelRef.current = channel;

    const drainIce = async () => {
      for (const candidate of pendingIce.current) {
        await pc.addIceCandidate(toRTCIceCandidate(candidate));
      }
      pendingIce.current = [];
    };

    // Once both descriptions exist we hold both DTLS fingerprints; hash them
    // into the SAS code both users compare aloud. SHA-256 keeps it
    // collision-resistant so a MITM can't forge a matching code.
    const computeSafety = () => {
      const localFp = extractDtlsFingerprint(pc.localDescription?.sdp ?? '');
      const remoteFp = extractDtlsFingerprint(pc.remoteDescription?.sdp ?? '');
      if (localFp && remoteFp) {
        setSafetyCode(deriveSafetyCode(localFp, remoteFp, sha256));
      }
    };

    const makeOffer = async () => {
      if (offerMade.current) {
        return;
      }
      offerMade.current = true;
      setState('negotiating');
      const offer = await pc.createOffer({});
      await pc.setLocalDescription(offer);
      await channel.send({
        kind: 'offer',
        description: serializeDescription(offer),
      });
    };

    const handle = async (msg: SignalMessage) => {
      switch (msg.kind) {
        case 'ready': {
          // Echo exactly once so both peers learn of each other regardless of
          // who subscribed first (broadcast doesn't replay missed messages).
          if (!repliedReady.current) {
            repliedReady.current = true;
            await channel.send({ kind: 'ready' });
          }
          if (role === 'caller') {
            await makeOffer();
          }
          break;
        }
        case 'offer': {
          if (role !== 'callee') {
            break;
          }
          setState('negotiating');
          await pc.setRemoteDescription(
            toRTCSessionDescription(msg.description),
          );
          remoteReady.current = true;
          await drainIce();
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await channel.send({
            kind: 'answer',
            description: serializeDescription(answer),
          });
          computeSafety();
          break;
        }
        case 'answer': {
          if (role !== 'caller') {
            break;
          }
          await pc.setRemoteDescription(
            toRTCSessionDescription(msg.description),
          );
          remoteReady.current = true;
          await drainIce();
          computeSafety();
          break;
        }
        case 'ice': {
          if (remoteReady.current) {
            await pc.addIceCandidate(toRTCIceCandidate(msg.candidate));
          } else {
            pendingIce.current.push(msg.candidate);
          }
          break;
        }
        case 'bye': {
          setState('ended');
          cleanup();
          break;
        }
      }
    };

    // --- WebRTC event wiring ---
    const events = pc as unknown as PeerEvents;

    events.addEventListener('icecandidate', event => {
      if (event.candidate) {
        channel.send({
          kind: 'ice',
          candidate: serializeCandidate(event.candidate),
        });
      }
    });

    events.addEventListener('track', event => {
      const [incoming] = event.streams;
      if (incoming) {
        setRemoteStream(incoming);
      }
    });

    events.addEventListener('connectionstatechange', () => {
      switch (pc.connectionState) {
        case 'connected':
          setState('connected');
          break;
        case 'failed':
          setState('failed');
          break;
        case 'disconnected':
        case 'closed':
          setState(prev => (prev === 'connected' ? 'ended' : prev));
          break;
        default:
          break;
      }
    });

    channel.onMessage(msg => {
      handle(msg);
    });

    setState('joining');
    channel
      .join()
      .then(() => {
        if (!disposed) {
          // Announce presence; the handshake/echo handles either join order.
          return channel.send({ kind: 'ready' });
        }
      })
      .catch(() => {
        if (!disposed) {
          setState('failed');
        }
      });

    return () => {
      // pc.close() (in cleanup) detaches native listeners; the JS handlers are
      // released when this connection instance is dropped.
      disposed = true;
      pendingIce.current = [];
      remoteReady.current = false;
      offerMade.current = false;
      repliedReady.current = false;
      cleanup();
    };
  }, [localStream, roomCode, role, supabase, cleanup]);

  return { state, remoteStream, safetyCode, hangUp };
}
