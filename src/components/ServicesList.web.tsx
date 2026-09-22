import BootstrapIcon from './BootstrapIcon';
import type { AppIconName } from './iconGlyphs';
import type { ServiceItem } from './ServicesList';

/**
 * Web services list — a Bootstrap `list-group` of action links.
 * Metro resolves this file instead of ServicesList.tsx on web.
 */
/**
 * Web services list — a Bootstrap `list-group` of action links. The icon sits
 * in a fixed 40px slot and the title/desc stack in a flex column, so every
 * row's text starts at the same x no matter the glyph width. Metro resolves
 * this file instead of ServicesList.tsx on web.
 */
export default function ServicesList({ items }: { items: ServiceItem[] }) {
  return (
    <div className="list-group shadow-sm" role="list">
      {items.map((srv) => (
        <a
          key={String(srv.href)}
          href={typeof srv.href === 'string' ? srv.href : String(srv.href)}
          className="list-group-item list-group-item-action py-3"
          aria-label={srv.title}
        >
          <span className="d-flex align-items-center gap-3 w-100">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded bg-primary-subtle flex-shrink-0"
              style={{ width: 40, height: 40 }}
            >
              <BootstrapIcon name={srv.icon as AppIconName} size={20} color="#0d47a1" fixedWidth />
            </span>
            <span className="flex-grow-1 d-flex flex-column">
              <span className="fw-bold lh-sm text-body">{srv.title}</span>
              <span className="text-body-secondary small lh-sm mt-1">{srv.desc}</span>
            </span>
            <BootstrapIcon
              name="bi-chevron-right"
              size={16}
              color="#6c757d"
              fixedWidth
              className="flex-shrink-0"
            />
          </span>
        </a>
      ))}
    </div>
  );
}
