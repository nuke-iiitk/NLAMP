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
  ApiFairPriceIndicator,
  ApiMarketPriceSummary,
  ApiMatchedBuyerRequirement,
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
