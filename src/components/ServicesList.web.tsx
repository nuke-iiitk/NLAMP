import type { Href } from 'expo-router';

import BootstrapIcon from './BootstrapIcon';
import Button from './Button';
import type { AppIconName } from './iconGlyphs';
import type { ServiceItem } from './ServicesList';

/**
 * Web services list — a Bootstrap `list-group` of action links.
 * Metro resolves this file instead of ServicesList.tsx on web.
 */
export default function ServicesList({ items }: { items: ServiceItem[] }) {
  return (
    <div className="list-group shadow-sm" role="list">
      {items.map((srv) => (
        <Button
          key={String(srv.href)}
          variant="ghost"
          href={srv.href as Href}
          className="list-group-item list-group-item-action d-flex align-items-center gap-3 py-3"
          leading={<BootstrapIcon name={srv.icon as AppIconName} size={22} color="#0d47a1" />}
          after={<BootstrapIcon name="bi-chevron-right" size={16} color="#6c757d" />}
          accessibilityLabel={srv.title}
          accessibilityHint={srv.desc}
          label={srv.title}
          description={srv.desc}
        />
      ))}
    </div>
  );
}
