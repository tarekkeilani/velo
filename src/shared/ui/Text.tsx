import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { useAppTheme } from '@shared/theme/ThemeProvider';

type Variant = 'title' | 'heading' | 'body' | 'caption';
type Tone = 'default' | 'muted' | 'primary';

type TextProps = RNTextProps & {
  variant?: Variant;
  tone?: Tone;
};

/**
 * Themed text primitive. Maps semantic variants/tones to the type scale and
 * palette so screens describe intent ("heading", "muted") rather than raw
 * font sizes and hex colors (DRY + consistency).
 */
export function Text({
  variant = 'body',
  tone = 'default',
  style,
  ...rest
}: TextProps) {
  const theme = useAppTheme();
  const color =
    tone === 'muted'
      ? theme.colors.textMuted
      : tone === 'primary'
        ? theme.colors.primary
        : theme.colors.text;

  return (
    <RNText
      style={[theme.typography[variant], { color }, style]}
      {...rest}
    />
  );
}
