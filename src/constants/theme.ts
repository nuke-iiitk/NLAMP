import { Platform } from 'react-native';

/**
 * Farmer Procurement Portal design system.
 *
 * "Harvest Desk" visual language: deep indigo for public-service authority,
 * leaf green for crop/liveness/success, warm saffron-gold for tokens and
 * emphasis. Warm cream backgrounds keep long reading comfortable in field
 * daylight. Radii are soft, borders are rare — hierarchy comes from tinted
 * surfaces and type weight, not outlines.
 */
export const Fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  extraBold: 'System',
} as const;

export const FONT_STACK =
  "'Noto Sans', -apple-system, 'Segoe UI', Roboto, 'Noto Sans Devanagari', 'Noto Sans Malayalam', 'Hind Siliguri', sans-serif";

/** Display face for headlines — confident, editorial. */
export const DISPLAY_STACK =
  "'Fraunces', 'Playfair Display', Georgia, 'Noto Serif Devanagari', 'Noto Serif Malayalam', serif";

export const Colors = {
  // Deep indigo — trust and public-service authority
  primary: '#2c3a72',
  primaryDark: '#1e2a52',
  primaryDeep: '#141d3d',
  primaryLight: '#e9edf8',

  // Fresh leaf green — success, crop status, progress
  green: '#2e7d4f',
  greenDark: '#1f5e39',
  greenLight: '#e6f2ea',

  // Warm saffron-gold — token highlights, deadlines, active emphasis
  saffron: '#d97c0a',
  saffronDark: '#a85f04',
  saffronLight: '#fdf1dd',

  // Warm neutrals — cream paper, never stark white
  white: '#fffdf8',
  background: '#faf6ee',
  surface: '#fffdf8',
  surfaceAlt: '#f3ede1',
  surfaceMuted: '#ece5d6',

  text: '#232735',
  textSecondary: '#4c5064',
  textMuted: '#777b8c',
  textOnDark: '#c9d2ec',

  border: '#e6dfd0',
  borderDark: '#cfc6b2',

  success: '#2e7d4f',
  successLight: '#e6f2ea',
  warning: '#b06a00',
  warningLight: '#fdf1dd',
  danger: '#b3372e',
  dangerLight: '#fbe9e6',
  info: '#2c3a72',
  infoLight: '#e9edf8',

  black: '#141d3d',

  /** India tricolour — used sparingly (a 3px strip, nothing more). */
  flag: ['#d97c0a', '#fffdf8', '#2e7d4f'] as const,

  light: {
    text: '#232735',
    textSecondary: '#4c5064',
    background: '#faf6ee',
    backgroundElement: '#fffdf8',
    backgroundSelected: '#e9edf8',
  },
  dark: {
    text: '#f3efe6',
    textSecondary: '#aab2c8',
    background: '#141d3d',
    backgroundElement: '#1e2a52',
    backgroundSelected: '#2c3a72',
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

