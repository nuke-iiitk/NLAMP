import type { Href } from 'expo-router';

import type { PortalNotice } from '../data/notices';
import BootstrapIcon from './BootstrapIcon';
import Button from './Button';

type Props = {
  notices: PortalNotice[];
  subjectLabel: string;
  dateLabel: string;
  viewAllLabel: string;
  viewAllHref: Href | string;
};

/**
 * Web latest-notices board — a Bootstrap `table` inside a `card`.
 * Metro resolves this file instead of NoticesBoard.tsx on web.
 */
export default function NoticesBoard({ notices, subjectLabel, dateLabel, viewAllLabel, viewAllHref }: Props) {
  return (
    <div className="card shadow-sm">
      <div className="table-responsive mb-0">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-primary">
            <tr>
              <th scope="col">{subjectLabel}</th>
              <th scope="col" className="text-end" style={{ width: 130 }}>{dateLabel}</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {notices.map((n) => (
              <tr key={n.title}>
                <td>
                  <span className="d-flex align-items-center gap-2">
                    <BootstrapIcon name="bi-file-earmark-text" size={15} color="#0d47a1" />
                    <span>{n.title}</span>
                  </span>
                </td>
                <td className="text-end text-body-secondary small text-nowrap">{n.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-footer bg-white border-top-0 pt-0">
        <Button label={viewAllLabel} href={viewAllHref} variant="link" small />
      </div>
    </div>
  );
}
