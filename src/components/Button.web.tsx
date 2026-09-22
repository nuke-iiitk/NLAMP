import { AppIcon } from './AppIcon';
import type { ButtonVariant, ButtonProps } from './Button';

const BOOTSTRAP_VARIANT: Record<ButtonVariant, string> = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  'outline-primary': 'btn btn-outline-primary',
  'outline-secondary': 'btn btn-outline-secondary',
  success: 'btn btn-success',
  danger: 'btn btn-danger',
  link: 'btn btn-link',
  ghost: 'btn btn-light text-decoration-none',
};

type Props = ButtonProps;

/**
 * Web button - a real `<button>` or `<a>` element so Bootstrap's `.btn`
 * classes apply natively (hover/active/focus states, sizing, disabled styling).
 * Metro resolves this file instead of Button.tsx on web.
 */
export default function Button({
  label,
  children,
  onPress,
  variant = 'primary',
  href,
  active = false,
  disabled = false,
  small = false,
  icon,
    iconOnly = false,
  className = '',
  accessibilityLabel,
  after,
}: Props) {
  const showLabel = !iconOnly;

  const classes = [
    BOOTSTRAP_VARIANT[variant],
    active && 'active',
    small && 'btn-sm',
    iconOnly && 'btn-icon',
    'd-inline-flex align-items-center justify-content-center gap-2',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const inner = (
    <>
      {icon ? (
        <AppIcon name={icon} size={18} />
      ) : null}
            {showLabel ? <span>{label ?? children}</span> : null}
      {after}
    </>
  );

    // Anchor variant (used for nav links that point to a route).
  if (href) {
    const hrefStr =
      typeof href === 'string'
        ? href
        : href && typeof href === 'object' && 'pathname' in href
        ? String((href as { pathname: string }).pathname)
        : '#';
    return (
      <a
        href={hrefStr}
        className={classes.replace('btn ', 'nav-link ')}
        onClick={onPress}
        aria-current={active ? 'page' : undefined}
        aria-label={accessibilityLabel ?? (showLabel ? label : undefined)}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      aria-label={accessibilityLabel ?? (showLabel ? label : undefined)}
      onClick={onPress}
      style={{ minWidth: iconOnly ? 40 : undefined }}
    >
      {inner}
    </button>
  );
}
