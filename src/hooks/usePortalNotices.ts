import { useEffect, useState } from 'react';

import { PORTAL_NOTICES, type PortalNotice } from '../data/notices';
import { api } from '../services/api';

export type PortalNoticesResult = {
  /** Notices for display — live from the backend, or the static fallback. */
  notices: PortalNotice[];
  /** True while the live fetch is in flight. */
  loading: boolean;
  /** True when the list came from the backend rather than static sample data. */
  live: boolean;
};

/**
 * Latest portal notices for the homepage board.
 *
 * Tries `GET /api/notices` once on mount, newest first, capped to `limit`.
 * On any failure it silently falls back to the static `PORTAL_NOTICES`
 * sample list so the board is never empty or broken. While loading, the
 * static list is shown immediately (no blank flash) and swapped if the
 * live fetch succeeds.
 */
export function usePortalNotices(limit = 5): PortalNoticesResult {
  const [state, setState] = useState<PortalNoticesResult>({
    notices: PORTAL_NOTICES.slice(0, limit),
    loading: true,
    live: false,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await api.notices();
      if (cancelled) return;
      if (result.ok && Array.isArray(result.data)) {
        const notices: PortalNotice[] = result.data
          .slice(0, limit)
          .map((n) => ({
            title: n.title,
            date: n.date,
            dept: n.dept,
            tag: n.is_urgent ? 'URGENT' : n.tag,
          }));
        // Only replace the fallback when the backend actually has notices.
        if (notices.length > 0) {
          setState({ notices, loading: false, live: true });
          return;
        }
      }
      setState((prev) => ({ ...prev, loading: false, live: false }));
    })();

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return state;
}
