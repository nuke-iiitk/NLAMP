import type { StyleProp, TextStyle } from 'react-native';

import BootstrapIcon from './BootstrapIcon';
import { APP_ICONS, type AppIconName } from './iconGlyphs';

export { APP_ICONS };
export type { AppIconName };

type Props = {
  /** Bootstrap Icons glyph class from `APP_ICONS`, e.g. `APP_ICONS.search`. */
  name: AppIconName;
  size?: number;
  color?: string;
  /** Layout applied to the glyph (margin, alignment, …). */
  style?: StyleProp<TextStyle>;
};

/**
 * Typed wrapper around `BootstrapIcon`. Prefer this over a bare glyph string so
 * every icon in the product comes from one reviewed vocabulary.
 */
export function AppIcon({ name, size = 20, color = '#0d47a1', style }: Props) {
  return <BootstrapIcon name={name} size={size} color={color} style={style} />;
}
