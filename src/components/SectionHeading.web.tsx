type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

/**
 * Web section heading — semantic `<h2 class="h5">` with Bootstrap type scale,
 * so headings align with the rest of the page. Metro resolves this file
 * instead of SectionHeading.tsx on web.
 */
/**
 * Web section heading — semantic `<h2>` with Bootstrap type scale, a hairline
 * rule underneath, and an optional action slot pinned to the title row so the
 * heading never wraps under its own action link. Metro resolves this file
 * instead of SectionHeading.tsx on web.
 */
export default function SectionHeading({ title, subtitle, right }: Props) {
  return (
    <div className="mt-4 mb-3 border-bottom pb-2">
      <div className="d-flex align-items-center justify-content-between gap-3">
        <h2 className="h5 fw-bold text-primary-emphasis mb-0">{title}</h2>
        {right ? <div className="flex-shrink-0 ms-2">{right}</div> : null}
      </div>
      {subtitle ? <p className="text-body-secondary small mb-0 mt-1">{subtitle}</p> : null}
    </div>
  );
}
