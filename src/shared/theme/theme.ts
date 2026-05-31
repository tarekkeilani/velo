/**
 * Design tokens. The single source of truth for colors, spacing, radii and
 * type scale. UI components read from here instead of hard-coding values, so
 * theming stays DRY and consistent across the app.
 */

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34 },
  heading: { fontSize: 20, fontWeight: '600' as const, lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
} as const;

/**
 * Apple Human Interface Guidelines recommend a minimum 44x44pt hit target.
 * Shared so every interactive component can guarantee accessible touch areas.
 */
export const MIN_TOUCH_TARGET = 44;

type Palette = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  onPrimary: string;
  danger: string;
};

const lightPalette: Palette = {
  background: '#F7F8FA',
  surface: '#FFFFFF',
  border: '#E4E7EC',
  text: '#101828',
  textMuted: '#667085',
  primary: '#2563EB',
  onPrimary: '#FFFFFF',
  danger: '#D92D20',
};

const darkPalette: Palette = {
  background: '#0B0F19',
  surface: '#151B28',
  border: '#26303F',
  text: '#F2F4F7',
  textMuted: '#98A2B3',
  primary: '#4F8DFD',
  onPrimary: '#0B0F19',
  danger: '#F97066',
};

export type AppTheme = {
  dark: boolean;
  colors: Palette;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
};

export const lightTheme: AppTheme = {
  dark: false,
  colors: lightPalette,
  spacing,
  radius,
  typography,
};

export const darkTheme: AppTheme = {
  dark: true,
  colors: darkPalette,
  spacing,
  radius,
  typography,
};
