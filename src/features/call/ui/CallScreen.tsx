import React from 'react';
import { Pressable, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTCView } from 'react-native-webrtc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Text } from '@shared/ui';
import { RootStackParamList } from '@app/navigation/types';
import { CallState } from '../model/types';
import { useLocalMedia } from '../hooks/useLocalMedia';
import { useCall } from '../hooks/useCall';
import { ControlButton } from './CallControls';
import { SafetyCode } from './SafetyCode';

type Props = NativeStackScreenProps<RootStackParamList, 'Call'>;

/**
 * UI — call screen.
 *
 * Composes two logic hooks: `useLocalMedia` (my camera) feeds its stream into
 * `useCall` (the peer connection). When the remote stream arrives it fills the
 * screen and the local preview shrinks to a corner tile — the familiar call
 * layout. M3 will replace the room-code banner with the SAS safety code.
 */
export function CallScreen({ route, navigation }: Props) {
  const { roomCode, role } = route.params;
  const local = useLocalMedia();
  const { state, remoteStream, safetyCode, statusDetail, hangUp } = useCall({
    roomCode,
    role,
    localStream: local.stream,
  });

  const connected = state === 'connected' && remoteStream;

  const end = () => {
    hangUp();
    local.stream?.getTracks().forEach(t => t.stop());
    navigation.goBack();
  };

  const shareCode = () => {
    Share.share({
      message: `Join my secure Velo video call. Code: ${formatCode(roomCode)}`,
    });
  };

  return (
    <View style={styles.root}>
      {/* Main surface: remote video once connected, else my own preview. */}
      {connected ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
          zOrder={0}
        />
      ) : local.stream ? (
        <RTCView
          streamURL={local.stream.toURL()}
          style={StyleSheet.absoluteFill}
          objectFit="cover"
          mirror
          zOrder={0}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text tone="muted">
            {local.error
              ? 'Camera unavailable — check permissions'
              : 'Starting camera…'}
          </Text>
        </View>
      )}

      {/* Local preview tile (only once the remote fills the main surface). */}
      {connected && local.stream && !local.isCameraOff ? (
        <RTCView
          streamURL={local.stream.toURL()}
          style={styles.pip}
          objectFit="cover"
          mirror
          zOrder={1}
        />
      ) : null}

      <SafeAreaView style={styles.overlay} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Text variant="caption" style={styles.onVideoMuted}>
            {connected
              ? 'Connected'
              : role === 'caller'
                ? 'Share this code'
                : 'Joining room'}
          </Text>
          {!connected ? (
            <View style={styles.codeRow}>
              <Text variant="heading" style={styles.onVideo}>
                {formatCode(roomCode)}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share call code"
                onPress={shareCode}
                hitSlop={10}
                style={styles.shareBtn}
              >
                <Text style={styles.shareLabel}>Share ↗</Text>
              </Pressable>
            </View>
          ) : null}
          <Text variant="caption" style={styles.onVideoMuted}>
            {statusLabel(state)}
          </Text>
          <Text variant="caption" style={styles.onVideoMuted}>
            {statusDetail}
          </Text>
          {state === 'connected' || state === 'negotiating' ? (
            <SafetyCode code={safetyCode} />
          ) : null}
        </View>

        <View style={styles.controls}>
          <ControlButton
            icon={local.isMicMuted ? '🔇' : '🎙️'}
            label={local.isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
            active={local.isMicMuted}
            onPress={local.toggleMic}
          />
          <ControlButton
            icon={local.isCameraOff ? '📷' : '📹'}
            label={local.isCameraOff ? 'Turn camera on' : 'Turn camera off'}
            active={local.isCameraOff}
            onPress={local.toggleCamera}
          />
          <ControlButton
            icon="🔄"
            label="Switch camera"
            onPress={local.switchCamera}
          />
          <ControlButton icon="📞" label="Hang up" danger onPress={end} />
        </View>
      </SafeAreaView>
    </View>
  );
}

function formatCode(code: string): string {
  return code.replace(/(.{4})/g, '$1 ').trim();
}

function statusLabel(state: CallState): string {
  switch (state) {
    case 'joining':
      return 'Connecting…';
    case 'negotiating':
      return 'Establishing secure link…';
    case 'connected':
      return '';
    case 'failed':
      return 'Connection failed';
    case 'ended':
      return 'Call ended';
    default:
      return '';
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  topBar: { padding: 16, gap: 2 },
  onVideo: {
    color: '#fff',
    // Black halo so the code stays legible over any video background.
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  onVideoMuted: {
    color: 'rgba(255,255,255,0.85)',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  codeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shareBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  shareLabel: { color: '#fff', fontWeight: '600' },
  pip: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 96,
    height: 144,
    borderRadius: 12,
    backgroundColor: '#111',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 16,
  },
});
