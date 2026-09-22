import type { ReactNode } from 'react';

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

/**
 * Web section heading — semantic `<h2>` with Bootstrap type scale, a hairline
 * rule underneath, and an optional action slot pinned to the title row so the
 * heading never wraps under its own action link. Metro resolves this file
 * instead of SectionHeading.tsx on web.
 */
export default function SectionHeading({ title, subtitle, right }: Props) {
  return (
    <div className="mt-5 mb-3">
      <div className="d-flex align-items-center justify-content-between gap-3 pb-2 border-bottom border-2 border-primary-subtle">
        <h2 className="h4 fw-bold text-primary mb-0">{title}</h2>
        {right ? <div className="flex-shrink-0">{right}</div> : null}
      </div>
      {subtitle ? <p className="text-body-secondary mb-0 mt-2">{subtitle}</p> : null}
    </div>
  );
}
