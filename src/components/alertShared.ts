import { Colors } from '../constants/theme';
import { APP_ICONS, type AppIconName } from './iconGlyphs';

export type Tone = 'success' | 'info' | 'warning' | 'error' | 'neutral';

export type AlertBannerProps = {
  tone?: Tone;
  title?: string;
  message: string;
  /** Overrides the default glyph for the tone (a Bootstrap Icons glyph class). */
  icon?: AppIconName;
};

/** Colour + severity glyph for each alert tone. */
export const TONES: Record<Tone, { bg: string; fg: string; border: string; bi: AppIconName }> = {
  success: {
    bg: Colors.greenLight,
    fg: Colors.green,
    border: Colors.green,
    bi: APP_ICONS.checkmarkCircle,
  },
  info: {
    bg: Colors.infoLight,
    fg: Colors.info,
    border: Colors.info,
    bi: APP_ICONS.infoCircle,
  },
  warning: {
    bg: Colors.warningLight,
    fg: Colors.warning,
    border: Colors.warning,
    bi: APP_ICONS.warning,
  },
  error: {
    bg: Colors.dangerLight,
    fg: Colors.danger,
    border: Colors.danger,
    bi: APP_ICONS.alertCircle,
  },
  neutral: {
    bg: Colors.surfaceAlt,
    fg: Colors.textSecondary,
    border: Colors.border,
    bi: APP_ICONS.infoCircle,
  },
};

/** Bootstrap `alert-*` class per tone (web only). */
export const BOOTSTRAP_TONE: Record<Tone, string> = {
  success: 'alert alert-success',
  info: 'alert alert-primary',
  warning: 'alert alert-warning',
  error: 'alert alert-danger',
  neutral: 'alert alert-secondary',
};
