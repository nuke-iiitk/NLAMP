import type { CSSProperties } from 'react';

import type { AppIconName } from './iconGlyphs';

type WebProps = {
  /** Bootstrap Icons glyph class, e.g. 'bi-house-door'. */
  name: AppIconName;
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
  /** Fixed-width icon slot (Bootstrap `fa-fw` equivalent) so icons in a list align vertically. */
  fixedWidth?: boolean;
};

/**
 * Web renderer — a real `<i className="bi …">` element so the Bootstrap Icons
 * font applies. The font CSS is linked from the HTML shell; Metro resolves this
 * file instead of BootstrapIcon.tsx on web, so no icon JS is bundled.
 */
export default function BootstrapIcon({
  name,
  size = 16,
  color,
  style,
  className,
  fixedWidth = false,
}: WebProps) {
  const merged: CSSProperties = {
    fontSize: size,
    lineHeight: 1,
    width: fixedWidth ? '1.5em' : undefined,
    textAlign: fixedWidth ? 'center' : undefined,
    flexShrink: 0,
    ...style,
  };
  if (color) merged.color = color;
  return (
    <i
      className={`bi ${name}${className ? ` ${className}` : ''}`}
      style={merged}
      aria-hidden="true"
    />
  );
}
