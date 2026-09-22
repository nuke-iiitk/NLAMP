import type { CSSProperties } from 'react';

import type { AppIconName } from './iconGlyphs';

type WebProps = {
  /** Bootstrap Icons glyph class, e.g. 'bi-house-door'. */
  name: AppIconName;
  size?: number;
  color?: string;
  style?: CSSProperties;
  className?: string;
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
}: WebProps) {
  const merged: CSSProperties = {
    fontSize: size,
    lineHeight: 1,
    color: color ?? 'inherit',
    ...style,
  };
  return (
    <i
      className={`bi ${name}${className ? ` ${className}` : ''}`}
      style={merged}
      aria-hidden="true"
    />
  );
}
