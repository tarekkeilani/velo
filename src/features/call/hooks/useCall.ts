import { useCallback, useEffect, useRef, useState } from 'react';
import { MediaStream, RTCPeerConnection } from 'react-native-webrtc';
import { sha256 } from 'js-sha256';
import { useServices } from '@shared/lib/services';
import { env } from '@app/config/env';
import {
  CallRole,
  CallState,
  PeerPayload,
  RoomCode,
} from '../model/types';
import {
  createSignalingChannel,
  SignalingChannel,
} from '../lib/signalingChannel';
import {
  attachLocalStream,
  createPeerConnection,
  serializeDescription,
  toRTCSessionDescription,
} from '../lib/peerConnection';
import { deriveSafetyCode } from '../lib/sas';
import { extractDtlsFingerprint } from '../lib/fingerprint';
import { setSpeakerOn } from '../lib/audioRoute';

/**
 * LOGIC LAYER — the call orchestrator (presence + non-trickle ICE).
 *
 * Each peer gathers all ICE candidates first, then publishes a single complete
 * SDP via presence. The caller offers, the callee answers. Because candidates
 * are embedded in the SDP, neither side calls `addIceCandidate` — which was
 * aborting the native WebRTC library on-device.
 */
export type Call = {
  state: CallState;
  remoteStream: MediaStream | null;
  safetyCode: string | null;
  statusDetail: string;
  hangUp: () => void;
};

const ICE_GATHER_TIMEOUT_MS = 5000;
// If the call hasn't connected within this window, give up with a clear error.
const CONNECT_TIMEOUT_MS = 60000;

type PeerEvents = {
  addEventListener(t: 'track', cb: (e: { streams: MediaStream[] }) => void): void;
  addEventListener(t: 'connectionstatechange', cb: () => void): void;
  addEventListener(t: 'icegatheringstatechange', cb: () => void): void;
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
  const [statusDetail, setStatusDetail] = useState('');

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<SignalingChannel | null>(null);

  const cleanup = useCallback(() => {
    setSpeakerOn(false);
    pcRef.current?.close();
    pcRef.current = null;
    channelRef.current?.leave();
    channelRef.current = null;
  }, []);

  const hangUp = useCallback(() => {
    setState('ended');
    cleanup();
  }, [cleanup]);

  useEffect(() => {
    if (!localStream) {
      return;
    }

    let disposed = false;
    const pc = createPeerConnection(env.iceServers);
    pcRef.current = pc;
    attachLocalStream(pc, localStream);

    // Route call audio to the loudspeaker (default is the earpiece).
    setSpeakerOn(true);

    const channel = createSignalingChannel(supabase, roomCode);
    channelRef.current = channel;

    const events = pc as unknown as PeerEvents;

    // Local-to-this-effect call lifecycle flags.
    let connectedOnce = false;
    let connectTimer: ReturnType<typeof setTimeout> | undefined;

    // Resolve once ICE gathering finishes (or after a fallback timeout, so a
    // single stuck candidate can't block the whole exchange).
    const waitForGathering = () =>
      new Promise<void>(resolve => {
        if (pc.iceGatheringState === 'complete') {
          resolve();
          return;
        }
        let done = false;
        const finish = () => {
          if (!done) {
            done = true;
            resolve();
          }
        };
        events.addEventListener('icegatheringstatechange', () => {
          if (pc.iceGatheringState === 'complete') {
            finish();
          }
        });
        setTimeout(finish, ICE_GATHER_TIMEOUT_MS);
      });

    const computeSafety = () => {
      const localFp = extractDtlsFingerprint(pc.localDescription?.sdp ?? '');
      const remoteFp = extractDtlsFingerprint(pc.remoteDescription?.sdp ?? '');
      if (localFp && remoteFp) {
        setSafetyCode(deriveSafetyCode(localFp, remoteFp, sha256));
      }
    };

    const publishDescription = async () => {
      const desc = pc.localDescription;
      if (desc) {
        await channel.setState({
          role,
          desc: serializeDescription(desc),
        });
      }
    };

    const offerCreated = { v: false };
    const remoteApplied = { v: false };

    events.addEventListener('track', event => {
      const [incoming] = event.streams;
      if (incoming) {
        setRemoteStream(incoming);
      }
    });

    events.addEventListener('connectionstatechange', () => {
      switch (pc.connectionState) {
        case 'connecting':
          setStatusDetail('Connecting media…');
          break;
        case 'connected':
          connectedOnce = true;
          if (connectTimer) {
            clearTimeout(connectTimer);
          }
          setState('connected');
          setStatusDetail('');
          break;
        case 'failed':
          setState('failed');
          setStatusDetail('Connection failed');
          break;
        case 'disconnected':
        case 'closed':
          setState(prev => (prev === 'connected' ? 'ended' : prev));
          break;
        default:
          break;
      }
    });

    const onPeer = async (peer: PeerPayload | null) => {
      // Caller: once the peer appears, create an offer, gather, then publish.
      if (role === 'caller' && peer && !offerCreated.v) {
        offerCreated.v = true;
        setState('negotiating');
        setStatusDetail('Peer found — gathering…');
        const offer = await pc.createOffer({});
        await pc.setLocalDescription(offer);
        await waitForGathering();
        setStatusDetail('Sending offer');
        await publishDescription();
      }

      if (!peer || !peer.desc || remoteApplied.v) {
        if (!peer && connectedOnce) {
          setState('ended');
          setStatusDetail('The other person left.');
        }
        return;
      }

      if (role === 'callee' && peer.desc.type === 'offer') {
        remoteApplied.v = true;
        setState('negotiating');
        setStatusDetail('Received offer — answering');
        await pc.setRemoteDescription(toRTCSessionDescription(peer.desc));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await waitForGathering();
        await publishDescription();
        computeSafety();
      } else if (role === 'caller' && peer.desc.type === 'answer') {
        remoteApplied.v = true;
        setStatusDetail('Received answer');
        await pc.setRemoteDescription(toRTCSessionDescription(peer.desc));
        computeSafety();
      }
    };

    channel.onPeer(peer => {
      onPeer(peer);
    });

    setState('joining');
    setStatusDetail('Connecting to signaling server…');
    channel
      .join({ role, desc: null })
      .then(() => {
        if (!disposed) {
          setStatusDetail('On server — waiting for peer');
        }
      })
      .catch((e: unknown) => {
        if (!disposed) {
          const msg = e instanceof Error ? e.message : String(e);
          setStatusDetail(`Server connection failed: ${msg}`);
          setState('failed');
        }
      });

    // Give up if the call never connects (peer never joined, or NAT blocked it).
    connectTimer = setTimeout(() => {
      if (!disposed && !connectedOnce) {
        setState('failed');
        setStatusDetail(
          "Couldn't connect — they may not have joined, or the network blocked the call.",
        );
      }
    }, CONNECT_TIMEOUT_MS);

    return () => {
      disposed = true;
      if (connectTimer) {
        clearTimeout(connectTimer);
      }
      cleanup();
    };
  }, [localStream, roomCode, role, supabase, cleanup]);

  return { state, remoteStream, safetyCode, statusDetail, hangUp };
}
