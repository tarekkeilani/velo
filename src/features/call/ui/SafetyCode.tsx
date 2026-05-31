import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@shared/ui';

/**
 * UI — the SAS safety code, Velo's trust anchor.
 *
 * Both peers derive the same code from the two DTLS fingerprints. Users read
 * it aloud and compare: a match proves there's no man-in-the-middle on the
 * signaling path; a mismatch means hang up. Rendered over the video, so it
 * uses explicit light colors rather than the theme.
 */
export function SafetyCode({ code }: { code: string | null }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>SAFETY CODE</Text>
      <Text style={styles.code}>{code ?? '— — —'}</Text>
      <Text style={styles.hint}>
        {code
          ? 'Read this aloud together. If it differs, hang up.'
          : 'Securing…'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
  code: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
  },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
});
