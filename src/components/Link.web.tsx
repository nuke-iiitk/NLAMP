import { router, type Href } from 'expo-router';
import type { LinkVariant, LinkProps } from './Link';

const LINK_CLASSES: Record<LinkVariant, string> = {
  nav: 'nav-link px-0',
  body: 'link-body-text fw-semibold text-decoration-none',
  muted: 'link-secondary text-decoration-none',
  footer: 'link-light text-decoration-underline-opacity-0',
  breadcrumb: 'breadcrumb-item',
};

/**
 * Web link — a real `<a>` with Bootstrap classes, wired to the router so the
 * static export stays client-side. Metro resolves this file on web.
 */
export default function Link({
  href,
  label,
  children,
  variant = 'body',
  active = false,
  onPress,
  after,
  accessibilityLabel,
  className = '',
}: LinkProps) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onPress) {
      onPress();
    } else {
      router.push(href as Href);
    }
  };

  // Anchor href must be a string path (Href may be an object).
  const hrefStr =
    typeof href === 'string'
      ? href
      : href && typeof href === 'object' && 'pathname' in href
      ? String((href as { pathname: string }).pathname)
      : '#';

  const isBreadcrumb = variant === 'breadcrumb';
  const classes = [
    LINK_CLASSES[variant],
    active && 'active',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (isBreadcrumb) {
    return active ? (
      <li className="breadcrumb-item active" aria-current="page">
        <span>{label ?? children}</span>
      </li>
    ) : (
      <li className={classes}>
        <a href={hrefStr} onClick={handleClick}>
          {label ?? children}
          {after}
        </a>
      </li>
    );
  }

  return (
    <a
      href={hrefStr}
      className={classes}
      onClick={handleClick}
      aria-current={active ? 'page' : undefined}
      aria-label={accessibilityLabel}
    >
      {label ?? children}
      {after}
    </a>
  );
}
