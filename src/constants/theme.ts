import { Platform } from 'react-native';

/**
 * Farmer Procurement Portal design system.
 *
 * Indian government service portal visual language — modelled on the NTA
 * JEE-Main portal: crisp white background, deep institutional navy for text
 * and authority, saffron as the secondary accent, and soft surface greys
 * that keep the layout clean and scannable on both desktop and mobile.
 */
export const Fonts = {
  regular: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  medium: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  semiBold: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  bold: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  extraBold: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;

export const FONT_STACK =
  "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Devanagari', 'Noto Sans Malayalam', sans-serif";

export const Colors = {
  // Deep navy — government authority (JEE-Main style)
  primary: '#176B45',
  primaryDark: '#0D3D2A',
  primaryLight: '#E8F4ED',

  // Saffron — secondary government accent
  saffron: '#C97918',
  saffronDark: '#8C4B0A',
  saffronLight: '#FFF3DF',

  // Status green
  green: '#16823b',
  greenDark: '#0f6a2e',
  greenLight: '#e6f4ec',

  // Neutrals — crisp white background, soft grey surfaces
  white: '#ffffff',
  background: '#F7F9F7',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F2',
  surfaceMuted: '#E9F0EB',

  text: '#17221B',
  textSecondary: '#536158',
  textMuted: '#718078',
  textOnDark: '#E8F3EC',

  border: '#DCE6DE',
  borderDark: '#B8C8BC',

  success: '#16823b',
  successLight: '#E6F4EC',
  warning: '#B77900',
  warningLight: '#FFF3E5',
  danger: '#c62828',
  dangerLight: '#fce8e6',
  info: '#1565c0',
  infoLight: '#e8f1fc',

  black: '#111111',

  /** India tricolour — navy, white, green for the flag strip. */
  flag: ['#040488', '#FFFFFF', '#138808'] as const,

  light: {
    text: '#17221B',
    textSecondary: '#536158',
    background: '#F7F9F7',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8F4ED',
  },
  dark: {
    text: '#F8F9FA',
    textSecondary: '#A8B3BE',
    background: '#0D3D2A',
    backgroundElement: '#176B45',
    backgroundSelected: '#0D3D2A',
  },
};

export type ThemeColor = keyof typeof Colors.light;

/** System-level font-family stacks per platform (Arial is the app font). */
export const SystemFonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, sans-serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  half: 2,
  xs: 4,
  one: 4,
  sm: 8,
  two: 8,
  three: 12,
  md: 16,
  four: 16,
  five: 24,
  lg: 24,
  six: 32,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
};

/** Base font sizes; use with the accessibility text-size scaler (useSettings().fs). */
export const FontSize = {
  xs: 11,
  sm: 12,
  md: 13,
  body: 15,
  base: 16,
  lg: 18,
  xl: 20,
  title: 24,
  h1: 28,
  hero: 34,
  display: 42,
};

/** Desktop content width — tuned for 16:9 displays (1920×1080, 1366×768). */
export const MaxContentWidth = 1280;
export const MaxTextWidth = 880;
export const BottomTabInset = 76;

/** Shared responsive breakpoints. */
export const Breakpoint = {
  tablet: 768,
  desktop: 1024,
};

