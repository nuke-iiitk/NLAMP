import { BOOTSTRAP_TONE, TONES, type AlertBannerProps, type Tone } from './alertShared';
import BootstrapIcon from './BootstrapIcon';

export type { Tone };

/**
 * Web alert — a real `<div class="alert alert-*">` so Bootstrap's alert
 * styling applies. Metro resolves this file instead of AlertBanner.tsx on web.
 */
export default function AlertBanner({
  tone = 'info',
  title,
  message,
  icon,
}: AlertBannerProps) {
  const colors = TONES[tone];
  return (
    <div
      role="alert"
      className={`${BOOTSTRAP_TONE[tone]} d-flex align-items-start gap-3`}
    >
      <BootstrapIcon name={icon ?? colors.bi} size={20} color={colors.fg} />
      <div className="flex-grow-1">
        {title ? <div className="fw-bold" style={{ marginBottom: 2 }}>{title}</div> : null}
        <div>{message}</div>
      </div>
    </div>
  );
}
