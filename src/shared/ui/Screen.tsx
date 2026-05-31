import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@shared/theme/ThemeProvider';

type ScreenProps = {
  children: React.ReactNode;
  /** Scrollable content is the common case; opt out for full-bleed layouts. */
  scroll?: boolean;
  /** Which safe-area edges to inset. Defaults to top/bottom (notch + home bar). */
  edges?: readonly Edge[];
  contentStyle?: ViewStyle;
};

/**
 * Standard screen container. Owns safe-area handling (iPhone notch + home
 * indicator) and themed background so individual screens never re-implement it.
 */
export function Screen({
  children,
  scroll = true,
  edges = ['top', 'bottom'],
  contentStyle,
}: ScreenProps) {
  const theme = useAppTheme();
  const background = { backgroundColor: theme.colors.background };
  const padding = { padding: theme.spacing.md };

  return (
    <SafeAreaView style={[styles.flex, background]} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, padding, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
