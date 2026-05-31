import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useAppTheme } from '@shared/theme/ThemeProvider';
import { MIN_TOUCH_TARGET } from '@shared/theme/theme';
import { Text } from './Text';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

/**
 * Accessible, themed button. Guarantees the 44pt minimum touch target from
 * Apple's HIG and provides press feedback + loading state in one place.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}: ButtonProps) {
  const theme = useAppTheme();
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        {
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing.lg,
          backgroundColor: isPrimary ? theme.colors.primary : 'transparent',
          borderColor: theme.colors.primary,
          borderWidth: isPrimary ? 0 : StyleSheet.hairlineWidth * 2,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? theme.colors.onPrimary : theme.colors.primary}
        />
      ) : (
        <Text
          variant="body"
          style={[
            styles.label,
            { color: isPrimary ? theme.colors.onPrimary : theme.colors.primary },
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
  },
});
