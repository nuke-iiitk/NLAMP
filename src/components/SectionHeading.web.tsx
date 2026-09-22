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
    <div className="mt-4 mb-3">
      <div className="d-flex align-items-center justify-content-between gap-3">
        <div className="d-flex align-items-center gap-2">
          <span
            aria-hidden="true"
            style={{
              width: 5,
              height: 22,
              borderRadius: 3,
              background: '#d97c0a',
              flexShrink: 0,
            }}
          />
          <h2
            className="mb-0 fw-bold"
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              color: '#1e2a52',
              fontSize: '1.35rem',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
        </div>
        {right ? <div className="flex-shrink-0 ms-2">{right}</div> : null}
      </div>
      {subtitle ? (
        <p className="text-body-secondary mb-0 mt-1" style={{ paddingLeft: 15, fontSize: '0.925rem' }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
