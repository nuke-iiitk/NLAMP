/**
 * Marketplace hooks — Fair Price Discovery & Smart Matching.
 *
 * Same contract as `usePortalNotices`: the backend is authoritative whenever it
 * answers, so screens can safely keep their static fallback content for when it
 * does not (offline demo mode).
 */

import { useCallback, useEffect, useState } from 'react';

import { api } from '../services/api';
import type {
  ApiBuyer,
  ApiBuyerRequirement,
  ApiFairPriceIndicator,
  ApiMarketPrice,
  ApiMarketPriceSummary,
  ApiMatchedBuyerRequirement,
  ApiMatchedFarmerListing,
  ApiOffer,
  ApiPooledLot,
  ApiResult,
} from '../services/api';

/** Crop + region that all price endpoints are keyed by. */
export type MarketPriceScope = {
  crop: string;
  region: string;
  state: string;
  grade?: string;
};

export type MarketPriceResult = {
  summary: ApiMarketPriceSummary | null;
  loading: boolean;
  /** True when the figures came from the backend rather than a fallback. */
  live: boolean;
};

/** Live modal price + 30-day statistics for one crop/region (`null` = idle). */
export function useMarketPrice(scope: MarketPriceScope | null): MarketPriceResult {
  const crop = scope?.crop;
  const region = scope?.region;
  const state = scope?.state;
  const grade = scope?.grade;
  const key = crop && region && state ? `${crop}|${region}|${state}|${grade ?? ''}` : null;

  // Only the fetched payload lives in state; "loading" and staleness are derived
  // during render, so the effect never calls setState synchronously.
  const [loaded, setLoaded] = useState<(MarketPriceResult & { key: string }) | null>(null);

  useEffect(() => {
    if (!key || !crop || !region || !state) return;
    let cancelled = false;

    void (async () => {
      const response = await api.marketPrice({ crop, region, state, grade });
      if (cancelled) return;
      setLoaded(
        response.ok
          ? { key, summary: response.data, loading: false, live: true }
          : { key, summary: null, loading: false, live: false }
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [key, crop, region, state, grade]);

  if (!key) return { summary: null, loading: false, live: false };
  if (loaded?.key !== key) return { summary: null, loading: true, live: false };
  return { summary: loaded.summary, loading: false, live: loaded.live };
}

export type FairPriceCheck = {
  indicator: ApiFairPriceIndicator | null;
  checking: boolean;
  error: string | null;
  check: (offerPrice: number | string) => Promise<ApiFairPriceIndicator | null>;
  reset: () => void;
};

/**
 * On-demand fair-price check: the price a trader offers is compared against the
 * market average and classified below / near / above market by the backend.
 */
export function useFairPriceCheck(scope: MarketPriceScope): FairPriceCheck {
  const [indicator, setIndicator] = useState<ApiFairPriceIndicator | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { crop, region, state, grade } = scope;

  const check = useCallback(
    async (offerPrice: number | string) => {
      setChecking(true);
      setError(null);
      const response = await api.fairPrice({ crop, region, state, grade, offerPrice });
      setChecking(false);
      if (response.ok) {
        setIndicator(response.data);
        return response.data;
      }
      setIndicator(null);
      setError(response.error);
      return null;
    },
    [crop, region, state, grade]
  );

  const reset = useCallback(() => {
    setIndicator(null);
    setError(null);
  }, []);

  return { indicator, checking, error, check, reset };
}

export type FarmerListing = {
  /** Backend farmer id or `farmer_code` — `resolve_farmer` accepts both. */
  farmerId: string;
  crop: string;
  quantityKg: number | string;
  state: string;
  district: string;
  grade?: string;
  limit?: number;
};

export type FarmerMatchesResult = {
  matches: ApiMatchedBuyerRequirement[];
  loading: boolean;
  live: boolean;
  error: string | null;
  reload: () => void;
};

/** Ranked buyer requirements for a farmer's produce (`null` = idle). */
export function useFarmerMatches(listing: FarmerListing | null): FarmerMatchesResult {
  const farmerId = listing?.farmerId;
  const crop = listing?.crop;
  const quantityKg = listing?.quantityKg;
  const region = listing?.state;
  const district = listing?.district;
  const grade = listing?.grade;
  const limit = listing?.limit;

  const [reloadCount, setReloadCount] = useState(0);
  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  // The key captures every input (plus the reload counter), so a stale payload
  // is reported as "loading" instead of flashing outdated matches.
  const key =
    farmerId && crop && region && district
      ? `${farmerId}|${crop}|${quantityKg ?? ''}|${region}|${district}|${grade ?? ''}|${limit ?? ''}|${reloadCount}`
      : null;

  const [loaded, setLoaded] = useState<
    (Omit<FarmerMatchesResult, 'reload'> & { key: string }) | null
  >(null);

  useEffect(() => {
    if (!key || !farmerId || !crop || !region || !district) return;
    let cancelled = false;

    void (async () => {
      const response = await api.matchFarmerToBuyers(farmerId, {
        crop,
        quantityKg: quantityKg ?? 0,
        state: region,
        district,
        grade,
        limit,
      });
      if (cancelled) return;
      setLoaded(
        response.ok
          ? { key, matches: response.data, loading: false, live: true, error: null }
          : { key, matches: [], loading: false, live: false, error: response.error }
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [key, farmerId, crop, quantityKg, region, district, grade, limit]);

  if (!key) return { matches: [], loading: false, live: false, error: null, reload };
  if (loaded?.key !== key) return { matches: [], loading: true, live: false, error: null, reload };
  return {
    matches: loaded.matches,
    loading: false,
    live: loaded.live,
    error: loaded.error,
    reload,
  };
}

// ---------------------------------------------------------------- shared

/** Result shape shared by every keyed list hook below. */
export type KeyedListResult<T> = {
  items: T[];
  loading: boolean;
  live: boolean;
  error: string | null;
  reload: () => void;
};

/**
 * Keyed-fetch helper: `key` encodes every input that affects the request, so a
 * changed key reports "loading" instead of flashing the previous payload.
 * `key === null` keeps the hook idle; `load` must be memoized on those inputs.
 */
function useKeyedList<T>(
  key: string | null,
  load: () => Promise<ApiResult<T[]>>
): KeyedListResult<T> {
  const [reloadCount, setReloadCount] = useState(0);
  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const fullKey = key ? `${key}|r${reloadCount}` : null;

  const [loaded, setLoaded] = useState<
    (Omit<KeyedListResult<T>, 'reload'> & { key: string }) | null
  >(null);

  useEffect(() => {
    if (!fullKey) return;
    let cancelled = false;

    void (async () => {
      const response = await load();
      if (cancelled) return;
      if (response.ok) {
        setLoaded({ key: fullKey, items: response.data, loading: false, live: true, error: null });
      } else {
        setLoaded({ key: fullKey, items: [], loading: false, live: false, error: response.error });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fullKey, load]);

  if (!fullKey) return { items: [], loading: false, live: false, error: null, reload };
  if (loaded?.key !== fullKey) return { items: [], loading: true, live: false, error: null, reload };
  return { items: loaded.items, loading: false, live: loaded.live, error: loaded.error, reload };
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `2026-08-29` -> `29 Aug`, so chart axis labels stay short. */
function shortDate(iso: string): string {
  const parts = iso.split('-');
  const index = Number(parts[1]) - 1;
  return index >= 0 && index < 12 ? `${Number(parts[2])} ${MONTHS[index]}` : iso;
}

// ------------------------------------------------------------ price history

export type PriceHistoryResult = {
  /** Oldest → newest, ready for `<BarChart/>`. */
  series: { label: string; value: number }[];
  rows: ApiMarketPrice[];
  loading: boolean;
  live: boolean;
};

/** Daily market-price trend for one crop/region (`null` scope = idle). */
export function useMarketPriceHistory(
  scope: MarketPriceScope | null,
  options?: { days?: number; points?: number }
): PriceHistoryResult {
  const crop = scope?.crop;
  const region = scope?.region;
  const state = scope?.state;
  const grade = scope?.grade;
  const days = options?.days ?? 30;
  const points = options?.points ?? 14;
  const key = crop && region && state ? `${crop}|${region}|${state}|${grade ?? ''}|${days}` : null;

  const [loaded, setLoaded] = useState<(PriceHistoryResult & { key: string }) | null>(null);

  useEffect(() => {
    if (!key || !crop || !region || !state) return;
    let cancelled = false;

    void (async () => {
      const response = await api.marketPriceHistory({ crop, region, state, grade, days });
      if (cancelled) return;
      if (!response.ok) {
        setLoaded({ key, series: [], rows: [], loading: false, live: false });
        return;
      }
      // The API returns newest-first; charts read left-to-right in time order.
      const series = [...response.data]
        .slice(0, points)
        .reverse()
        .map((row) => ({
          label: shortDate(row.price_date),
          value: Math.round(Number(row.modal_price) || 0),
        }));
      setLoaded({ key, series, rows: response.data, loading: false, live: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [key, crop, region, state, grade, days, points]);

  if (!key) return { series: [], rows: [], loading: false, live: false };
  if (loaded?.key !== key) return { series: [], rows: [], loading: true, live: false };
  return { series: loaded.series, rows: loaded.rows, loading: false, live: loaded.live };
}

// ---------------------------------------------------------- buyer directory

export type BuyerDirectoryFilters = {
  state?: string;
  district?: string;
  /** Only buyers who posted a requirement for this crop. */
  crop?: string;
  limit?: number;
};

/** Registered buyers, most reliable first (`null` filters = idle). */
export function useBuyerDirectory(filters: BuyerDirectoryFilters): KeyedListResult<ApiBuyer> {
  const { state, district, crop, limit } = filters;
  const load = useCallback(
    () => api.listBuyers({ state, district, crop, limit }),
    [state, district, crop, limit]
  );
  const key =
    state || district || crop
      ? `${state ?? ''}|${district ?? ''}|${crop ?? ''}|${limit ?? ''}`
      : null;
  return useKeyedList(key, load);
}

/** Requirements posted by one buyer — the buyer console's own list. */
export function useBuyerRequirements(
  buyerId: string | null,
  status?: string
): KeyedListResult<ApiBuyerRequirement> {
  const load = useCallback(
    () => api.listBuyerRequirements(buyerId ?? '', status),
    [buyerId, status]
  );
  return useKeyedList(buyerId ? `${buyerId}|${status ?? ''}` : null, load);
}

// --------------------------------------------------------------- offers

export type OfferFilters = {
  /** Farmer inbox: direct offers plus offers on pooled lots they joined. */
  farmerId?: string;
  /** Buyer outbox: everything this buyer has sent. */
  buyerId?: string;
  status?: string;
  limit?: number;
};

/** Offer inbox/outbox — idle until a farmer or a buyer is known. */
export function useOfferInbox(filters: OfferFilters): KeyedListResult<ApiOffer> {
  const { farmerId, buyerId, status, limit } = filters;
  const load = useCallback(
    () => api.listOffers({ farmerId, buyerId, status, limit }),
    [farmerId, buyerId, status, limit]
  );
  const key =
    farmerId || buyerId ? `${farmerId ?? ''}|${buyerId ?? ''}|${status ?? ''}|${limit ?? ''}` : null;
  return useKeyedList(key, load);
}

// ------------------------------------------------------------ pooled lots

export type OpenPoolFilters = {
  crop?: string;
  state?: string;
  district?: string;
  status?: string;
  /** Restrict to the lots this farmer already belongs to. */
  farmerId?: string;
  limit?: number;
};

/** Browsable pooled lots; the backend sends each lot with its members. */
export function useOpenPools(filters: OpenPoolFilters): KeyedListResult<ApiPooledLot> {
  const { crop, state, district, status, farmerId, limit } = filters;
  const load = useCallback(
    () => api.listPooledLots({ crop, state, district, status, farmerId, limit }),
    [crop, state, district, status, farmerId, limit]
  );
  const key = `${crop ?? ''}|${state ?? ''}|${district ?? ''}|${status ?? ''}|${farmerId ?? ''}|${limit ?? ''}`;
  return useKeyedList(key, load);
}

// ------------------------------------------------- buyer-side smart matching

/** Ranked farmers for one buyer requirement (`null` id = idle). */
export function useBuyerMatches(
  requirementId: string | null,
  limit = 5
): KeyedListResult<ApiMatchedFarmerListing> {
  const load = useCallback(
    () => api.matchBuyerToFarmers(requirementId ?? '', limit),
    [requirementId, limit]
  );
  return useKeyedList(requirementId ? `${requirementId}|${limit}` : null, load);
}
