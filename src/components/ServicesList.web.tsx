import BootstrapIcon from './BootstrapIcon';
import type { AppIconName } from './iconGlyphs';
import type { ServiceItem } from './ServicesList';

/**
 * Web services list — a Bootstrap responsive card grid (2-up on md+). Each
 * card has a fixed 40px icon square pinned to the top of the text block so
 * the icon glyphs share one vertical rail, and the title sits directly beside
 * the icon with the description below. Metro resolves this file instead of
 * ServicesList.tsx on web.
 */
export default function ServicesList({ items }: { items: ServiceItem[] }) {
  return (
    <div className="row row-cols-1 row-cols-md-2 g-3" role="list">
      {items.map((srv) => (
        <div key={String(srv.href)} className="col" role="listitem">
          <a
            href={typeof srv.href === 'string' ? srv.href : String(srv.href)}
            className="card h-100 shadow-sm text-decoration-none link-dark"
            aria-label={srv.title}
          >
            <div className="card-body d-flex align-items-start gap-3">
              <span className="d-inline-flex align-items-center justify-content-center rounded bg-primary-subtle flex-shrink-0" style={{ width: 44, height: 44 }}>
                <BootstrapIcon name={srv.icon as AppIconName} size={22} color="#0d47a1" />
              </span>
              <span className="flex-grow-1 d-flex flex-column min-w-0">
                <span className="d-flex align-items-center justify-content-between gap-2">
                  <span className="fw-bold lh-sm card-title mb-0">{srv.title}</span>
                  <BootstrapIcon
                    name="bi-chevron-right"
                    size={14}
                    color="#6c757d"
                  />
                </span>
                <span className="text-body-secondary small lh-sm mt-1">{srv.desc}</span>
              </span>
            </div>
          </a>
        </div>
      ))}
    </div>
  );
}
