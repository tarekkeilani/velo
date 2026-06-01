import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@shared/ui';

/**
 * UI — the SAS safety code, Velo's trust anchor.
 *
 * Both peers derive the same code from the two DTLS fingerprints. Users read it
 * aloud and compare: a match proves there's no man-in-the-middle; a mismatch
 * means hang up. Once verified, it can be collapsed out of the way. Rendered
 * over the video, so it uses explicit light colors with a black outline.
 */
export function SafetyCode({ code }: { code: string | null }) {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show safety code"
        onPress={() => setCollapsed(false)}
        style={styles.pill}
      >
        <Text style={styles.pillText}>🔒 Safety code</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>SAFETY CODE</Text>
        {code ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Hide safety code"
            onPress={() => setCollapsed(true)}
            hitSlop={10}
          >
            <Text style={styles.hide}>Hide ▾</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.code}>{code ?? '— — —'}</Text>
      <Text style={styles.hint}>
        {code
          ? 'Read this aloud together. If it differs, hang up.'
          : 'Securing…'}
      </Text>
    </View>
  );
}

const outline = {
  textShadowColor: '#000',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
} as const;

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
  hide: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  code: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
    ...outline,
  },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  pillText: { color: '#fff', fontSize: 13, fontWeight: '600', ...outline },
});
