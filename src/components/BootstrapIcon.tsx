import Ionicons from '@expo/vector-icons/Ionicons';
import type { StyleProp, TextStyle } from 'react-native';

import { NATIVE_FALLBACK, type AppIconName } from './iconGlyphs';

type NativeProps = {
  /** Bootstrap Icons glyph class, e.g. `bi-house-door`. */
  name: AppIconName;
  size?: number;
  color?: string;
  /** Layout applied to the glyph (mirrors the web `<i style>` prop). */
  style?: StyleProp<TextStyle>;
};

/**
 * iOS/Android renderer — draws the mapped system glyph. The website uses
 * `BootstrapIcon.web.tsx` instead (Metro swaps the file), so this module and
 * its font dependency never reach the web bundle.
 */
export default function BootstrapIcon({ name, size = 16, color, style }: NativeProps) {
  const fallback = NATIVE_FALLBACK[name] as keyof typeof Ionicons.glyphMap;
  return <Ionicons name={fallback} size={size} color={color} style={style} />;
}
