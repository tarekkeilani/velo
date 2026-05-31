import { useCallback, useEffect, useRef, useState } from 'react';
import { mediaDevices, MediaStream } from 'react-native-webrtc';

/**
 * LOGIC LAYER — local media lifecycle.
 *
 * Acquires the camera + mic once, exposes the stream for preview, and owns the
 * mute/camera/switch controls. Crucially it *stops every track on unmount* so
 * the camera light turns off and the device isn't left holding hardware — a
 * common RN leak. The UI just renders `stream` and calls the toggles.
 */
export type LocalMedia = {
  stream: MediaStream | null;
  error: Error | null;
  isMicMuted: boolean;
  isCameraOff: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  switchCamera: () => void;
};

export function useLocalMedia(): LocalMedia {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isMicMuted, setMicMuted] = useState(false);
  const [isCameraOff, setCameraOff] = useState(false);

  // Ref mirrors state so cleanup can stop tracks without a stale closure.
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    mediaDevices
      .getUserMedia({ audio: true, video: { facingMode: 'user' } })
      .then(media => {
        if (cancelled) {
          media.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = media;
        setStream(media);
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error('getUserMedia failed'));
        }
      });

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    };
  }, []);

  const toggleMic = useCallback(() => {
    setMicMuted(prev => {
      const muted = !prev;
      streamRef.current?.getAudioTracks().forEach(t => {
        t.enabled = !muted;
      });
      return muted;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    setCameraOff(prev => {
      const off = !prev;
      streamRef.current?.getVideoTracks().forEach(t => {
        t.enabled = !off;
      });
      return off;
    });
  }, []);

  const switchCamera = useCallback(() => {
    streamRef.current?.getVideoTracks().forEach(track => {
      // react-native-webrtc extension to flip front/back camera in place.
      (track as unknown as { _switchCamera?: () => void })._switchCamera?.();
    });
  }, []);

  return {
    stream,
    error,
    isMicMuted,
    isCameraOff,
    toggleMic,
    toggleCamera,
    switchCamera,
  };
}
