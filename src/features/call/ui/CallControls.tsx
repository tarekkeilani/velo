import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@shared/ui';
import { useAppTheme } from '@shared/theme/ThemeProvider';
import { MIN_TOUCH_TARGET } from '@shared/theme/theme';

type ControlButtonProps = {
  icon: string;
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
};

/**
 * UI — a single round call-control button. Guarantees the 44pt HIG touch
 * target and exposes an accessibility label (icons alone aren't accessible).
 */
export function ControlButton({
  icon,
  label,
  onPress,
  active = false,
  danger = false,
}: ControlButtonProps) {
  const theme = useAppTheme();
  const bg = danger
    ? theme.colors.danger
    : active
      ? theme.colors.primary
      : 'rgba(255,255,255,0.18)';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 56,
    height: 56,
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 24 },
});
