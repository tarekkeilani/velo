import React, { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, Card, Screen, Text } from '@shared/ui';
import { useAppTheme } from '@shared/theme/ThemeProvider';
import { RootStackParamList } from '@app/navigation/types';
import { generateRoomCode, normalizeRoomCode } from '../lib/roomCode';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

/**
 * UI — entry point. Two ways into a call:
 *  - "Start a call" generates a fresh room code (this device is the caller).
 *  - Entering a shared code joins as the callee.
 * The code is shared out-of-band (any messenger / QR). No accounts yet (v1).
 */
export function HomeScreen({ navigation }: Props) {
  const theme = useAppTheme();
  const [code, setCode] = useState('');

  const startCall = () => {
    navigation.navigate('Call', {
      roomCode: generateRoomCode(),
      role: 'caller',
    });
  };

  const joinCall = () => {
    const roomCode = normalizeRoomCode(code);
    if (roomCode.length === 0) {
      return;
    }
    navigation.navigate('Call', { roomCode, role: 'callee' });
  };

  return (
    <Screen contentStyle={styles.content}>
      <Text variant="title">Velo</Text>
      <Text variant="caption" tone="muted" style={styles.tagline}>
        Private, peer-to-peer video calls.
      </Text>

      <Button label="Start a call" onPress={startCall} style={styles.cta} />

      <Card style={styles.joinCard}>
        <Text variant="heading">Join a call</Text>
        <Text variant="caption" tone="muted" style={styles.joinHint}>
          Enter the code your contact shared with you.
        </Text>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="e.g. ABCD 2345"
          placeholderTextColor={theme.colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          style={[
            styles.input,
            {
              color: theme.colors.text,
              borderColor: theme.colors.border,
              borderRadius: theme.radius.sm,
            },
          ]}
        />
        <Button
          label="Join"
          variant="secondary"
          onPress={joinCall}
          disabled={normalizeRoomCode(code).length === 0}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 12 },
  tagline: { marginBottom: 12 },
  cta: { marginTop: 8 },
  joinCard: { marginTop: 16, gap: 12 },
  joinHint: { marginTop: -4 },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 18,
    letterSpacing: 2,
  },
});
