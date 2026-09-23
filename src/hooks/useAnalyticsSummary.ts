import { useEffect, useState } from 'react';

import { analyticsSummary } from '../data/mockData';
import { api } from '../services/api';

export type AnalyticsSummary = typeof analyticsSummary & {
  /** True while the live fetch is in flight (show a subtle loading state). */
  loading: boolean;
  /** True when the numbers came from the live backend, not the mock fallback. */
  live: boolean;
};

/**
 * Homepage analytics figures.
 *
 * Tries `GET /api/analytics/summary` once on mount. On any failure —
 * network down, timeout, non-JSON response — it silently falls back to the
 * mock constants so the homepage never breaks or shows an error state for
 * a purely informational panel. `loading` is true only until the first
 * result (live or fallback) is available.
 */
export function useAnalyticsSummary(): AnalyticsSummary {
  const [state, setState] = useState<AnalyticsSummary>({
    ...analyticsSummary,
    loading: true,
    live: false,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const result = await api.analyticsSummary();
      if (cancelled) return;
      if (result.ok) {
        setState({
          ...analyticsSummary,
          farmersProcessed: result.data.farmers_processed,
          capacityUsedPercent: result.data.capacity_used_percent,
          loading: false,
          live: true,
        });
      } else {
        // Silent fallback — keep the mock numbers, just clear the loading flag.
        setState((prev) => ({ ...prev, loading: false, live: false }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

