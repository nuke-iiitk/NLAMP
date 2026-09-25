/**
 * API client for the FastAPI + PostgreSQL backend.
 *
 * Every function returns `ApiResult<T>` so callers never see raw exceptions —
 * network failures, 404s, 409 conflicts and 422 validation errors are all
 * normalised into a friendly `error` string.
 *
 * Base URL resolution (configurable, never hardcoded per call-site):
 *   1. `EXPO_PUBLIC_API_URL` env var (see .env.example) — recommended.
 *   2. Otherwise a platform default:
 *        • Android emulator → http://10.0.2.2:8000 (host loopback alias)
 *        • iOS simulator    → http://localhost:8000
 *        • Expo web         → http://localhost:8000
 *      Physical devices must set EXPO_PUBLIC_API_URL to your LAN IP
 *      (e.g. http://192.168.1.20:8000).
 *
 * Set `EXPO_PUBLIC_USE_BACKEND=false` to force the pure mock/demo mode.
 */

import { Platform } from 'react-native';

import type {
  AppNotification,
  Booking,
  CentreQueue,
  Farmer,
  Officer,
  ProcurementCentre,
  QueueEntry,
} from '../data/mockData';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

// ------------------------------------------------------------ base URL
//
// The FastAPI backend can be reached via several URLs. The client tries them
// in priority order and uses the first one that actually talks to OUR backend:
//   1. EXPO_PUBLIC_API_URL (set at build time — GitHub Actions / .env) — recommended.

//   2. Public dev tunnels (listed below). During development the backend runs on
//      one machine behind a tunnel so phones/other laptops can reach it:
//        • Cloudflare quick tunnel (trycloudflare.com — no interstitial page,
//          works for real browser fetch requests).
//        • localtunnel (loca.lt — shows an interstitial "Tunnel website ahead!"
//          page for browser agents — the client auto-skips it because it returns
//          HTML instead of JSON, then falls through to the next candidate).
//   3. Platform defaults (localhost etc.) — only for one local dev machine.





const PUBLIC_TUNNEL_URLS: string[] = [
  'https://projector-statewide-david-carries.trycloudflare.com',
  'https://crop-overhead-talk-delivering.trycloudflare.com',
  'https://kisan-api.loca.lt',
];

/** All candidate base URLs, most-preferred first, deduped, no trailing slashes. */
export function getApiBaseCandidates(): string[] {
  const result: string[] = [];
  const push = (u: string | undefined) => {
   if (!u) return;
   const clean = u.trim().replace(/\/+$/, '');
   if (clean && !result.includes(clean)) result.push(clean);
 };
 push(process.env.EXPO_PUBLIC_API_URL);
 PUBLIC_TUNNEL_URLS.forEach(push);
 // Platform defaults — only meaningful on ONE local dev machine.



 if (Platform.OS === 'android') push('http://10.0.2.2:8000');
 push('http://localhost:8000');
 return result;
}

/** Primary base URL (first candidate — informational / backward-compat). */
export function getApiBaseUrl(): string {
  return getApiBaseCandidates()[0] ?? 'http://localhost:8000';
}

export const API_BASE_URL = getApiBaseUrl();

export function isBackendEnabled(): boolean {
  return process.env.EXPO_PUBLIC_USE_BACKEND !== 'false';
}

/** Rough reachability classification used by the store's fallback logic. */
export function isNetworkError(error: string): boolean {
  return (
    error === 'NETWORK_ERROR' ||
    error === 'TIMEOUT' ||
    error.toLowerCase().includes('network') ||
    error.toLowerCase().includes('unreachable')
  );
}

const REQUEST_TIMEOUT_MS = 8000;

/** Officer bearer token (set by officerLogin; harmless in demo mode). */
let officerToken: string | null = null;
export function setOfficerToken(token: string | null) {
  officerToken = token;
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  // Try each candidate base URL in order. A candidate is skipped when it cannot
  // reach OUR backend — e.g. network failure, timeout, or a tunnel that returns
  // HTML instead of JSON (like localtunnel's interstitial page for browser agents).
  // HTTP business errors (4xx/5xx with JSON `detail`) come from OUR API and are
  // authoritative — we return them immediately without trying other candidates.



  const candidates = getApiBaseCandidates();
  let lastError: ApiResult<T> | null = null;
  for (const base of candidates) {
    const url = `${base}${path}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(officerToken ? { Authorization: `Bearer ${officerToken}` } : {}),
          ...init?.headers,
        },
      });
      if (response.status === 204) return { ok: true, data: undefined as T };
      const text = await response.text();
      let body: Record<string, unknown> = {};
      if (text.length > 0) {
        try {
          body = JSON.parse(text) as Record<string, unknown>;
        } catch {
          // Not our API — e.g. a tunnel interstitial/proxy HTML page. Skip this base.



          continue;

        }
      }
      if (!response.ok) {
        const detail = typeof body.detail === 'string' ? body.detail : undefined;
        switch (response.status) {
          case 401:
            return { ok: false, error: detail ?? 'AUTH' };
          case 404:
            return { ok: false, error: detail ?? 'NOT_FOUND' };
          case 409:
            return { ok: false, error: detail ?? 'CONFLICT' };
          case 422:
            return { ok: false, error: detail ?? 'VALIDATION' };
          default:
            return { ok: false, error: detail ?? `HTTP_${response.status}` };
        }
      }
      return { ok: true, data: body as T };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.toLowerCase().includes('abort')) {
        lastError = { ok: false, error: 'TIMEOUT' };
      } else {
        lastError = { ok: false, error: 'NETWORK_ERROR' };
      }
      // Try the next candidate — maybe another tunnel/localhost is reachable.



    } finally {
      clearTimeout(timer);
    }
  }
  return lastError ?? { ok: false, error: 'NETWORK_ERROR' };

}

function get<T>(path: string): Promise<ApiResult<T>> {
  return request<T>(path);
}

function post<T>(path: string, payload?: unknown): Promise<ApiResult<T>> {
  return request<T>(path, { method: 'POST', body: payload ? JSON.stringify(payload) : undefined });
}

function patch<T>(path: string, payload?: unknown): Promise<ApiResult<T>> {
  return request<T>(path, { method: 'PATCH', body: payload ? JSON.stringify(payload) : undefined });
}

function put<T>(path: string, payload?: unknown): Promise<ApiResult<T>> {
  return request<T>(path, { method: 'PUT', body: payload ? JSON.stringify(payload) : undefined });
}

/** Build a `?a=1&b=2` query string, skipping empty / undefined values. */
function qs(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

// ------------------------------------------------------------ backend DTOs

export type ApiCentre = {
  id: number;
  centre_code: string;
  name: string;
  state: string;
  district: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  opening_hours: string | null;
  capacity_per_day: number;
  crops: string[];
  status: string; // 'Open' | 'Busy' | 'Full' | 'Closed'
  distance_km: number | null;
  created_at: string;
  updated_at: string;
};

export type ApiFarmer = {
  id: string;
  farmer_code: string;
  name: string;
  phone: string;
  email: string | null;
  date_of_birth: string | null;
  address: string | null;
  state: string | null;
  district: string | null;
  village: string | null;
  land_size_acres: string | null;
  crop: string | null;
  quantity_kg: string | null;
  preferred_centre_id: number | null;
  created_at: string;
  updated_at: string;
};

export type ApiSlot = {
  id: string;
  centre_id: number;
  date: string;
  start: string;
  end: string;
  capacity: number;
  booked: number;
  closed: boolean;
  remaining: number;
};

export type ApiQueueEntry = {
  id: string;
  token_number: number;
  token: string;
  status: string; // WAITING | CALLED | IN_PROGRESS | COMPLETED | CANCELLED | NO_SHOW | ON_HOLD
  booking_status: string; // Upcoming | Waiting | Processing | Completed | Cancelled
  position: number | null;
  farmers_ahead: number;
  estimated_wait_minutes: number;
  arrived: boolean;
  produce: string;
  quantity_kg: number;
  joined_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  slot: { id: string; date: string; start_time: string; end_time: string };
  centre: { id: number; centre_code: string; name: string; state: string; district: string; address: string };
  farmer: { id: string; farmer_code: string; name: string; phone: string };
};

export type ApiQueueCentre = {
  centre_id: number;
  centre_code: string;
  date: string;
  entries: ApiQueueEntry[];
  counts: {
    waiting: number;
    called: number;
    in_progress: number;
    on_hold: number;
    completed: number;
    total_active: number;
  };
  last_updated: string;
};

export type ApiNotification = {
  id: string;
  farmer_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: number;
  created_at: string;
};

export type ApiOfficer = {
  id: string;
  officer_code: string;
  name: string;
  designation: string;
  centre_id: number | null;
};

export type ApiAuth<T> = { farmer?: T; officer?: T; token: { token: string; expires_at: string } };

// ------------------------------------------------------------------ mappers

export function mapCentre(dto: ApiCentre): ProcurementCentre {
  return {
    id: String(dto.id),
    name: dto.name,
    state: dto.state,
    district: dto.district,
    address: dto.address,
    distanceKm: dto.distance_km ?? 0,
    openingHours: dto.opening_hours ?? '8:00 AM – 5:00 PM',
    capacityPerDay: dto.capacity_per_day,
    crops: dto.crops,
    status: dto.status as ProcurementCentre['status'],
  };
}

export function mapFarmer(dto: ApiFarmer): Farmer {
  return {
    id: dto.farmer_code,
    name: dto.name,
    mobile: dto.phone,
    aadhaar: '', // never sent back by the API (only a hash is stored)
    dateOfBirth: dto.date_of_birth ?? '',
    state: dto.state ?? '',
    district: dto.district ?? '',
    village: dto.village ?? '',
    address: dto.address ?? '',
    landSizeAcres: dto.land_size_acres ?? '',
    crop: dto.crop ?? 'Paddy',
    quantityKg: dto.quantity_kg ?? '',
    preferredCentreId: dto.preferred_centre_id != null ? String(dto.preferred_centre_id) : '',
  };
}

export function mapSlot(dto: ApiSlot) {
  return {
    id: dto.id,
    centreId: String(dto.centre_id),
    date: dto.date,
    start: dto.start,
    end: dto.end,
    capacity: dto.capacity,
    booked: dto.booked,
    closed: dto.closed,
  };
}

export function mapBooking(dto: ApiQueueEntry): Booking {
  return {
    id: dto.id,
    token: dto.token,
    farmerId: dto.farmer.farmer_code,
    farmerName: dto.farmer.name,
    centreId: String(dto.centre.id),
    centreName: dto.centre.name,
    date: dto.slot.date,
    slotStart: dto.slot.start_time,
    slotEnd: dto.slot.end_time,
    produce: dto.produce,
    quantityKg: String(dto.quantity_kg),
    status: dto.booking_status as Booking['status'],
    arrived: dto.arrived,
    createdAt: new Date(dto.joined_at).getTime(),
  };
}

const QUEUE_STATUS_BY_BACKEND: Record<string, QueueEntry['status']> = {
  WAITING: 'Waiting',
  CALLED: 'Called',
  IN_PROGRESS: 'Processing',
  COMPLETED: 'Completed',
  ON_HOLD: 'On Hold',
};

export function mapQueueEntry(dto: ApiQueueEntry): QueueEntry {
  return {
    id: dto.id,
    token: dto.token,
    farmerName: dto.farmer.name,
    slot: dto.slot.start_time,
    produce: dto.produce,
    status: QUEUE_STATUS_BY_BACKEND[dto.status] ?? 'Waiting',
  };
}

export function mapQueueCentre(dto: ApiQueueCentre): CentreQueue {
  return {
    entries: dto.entries.map(mapQueueEntry),
    lastUpdated: new Date(dto.last_updated).getTime(),
  };
}

const NOTIFICATION_TYPE: Record<string, AppNotification['type']> = {
  SUCCESS: 'success',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
};

export function mapNotification(dto: ApiNotification): AppNotification {
  return {
    id: dto.id,
    title: dto.title,
    message: dto.message,
    type: NOTIFICATION_TYPE[dto.type.toUpperCase()] ?? 'info',
    timestamp: dto.timestamp,
    read: dto.read,
  };
}

export function mapOfficer(dto: ApiOfficer): Officer {
  return {
    id: dto.officer_code,
    name: dto.name,
    designation: dto.designation,
    centreId: dto.centre_id != null ? String(dto.centre_id) : '',
  };
}

// -------------------------------------------------------------- api surface

export type LoginInput = { mobile: string; password?: string; otp?: string };
export type OfficerLoginInput = { officerId: string; password: string };

export type BookingInput = {
  centreId: string;
  date: string;
  slotStart: string;
  slotEnd: string;
  produce: string;
  quantityKg: string;
  /** Slot id from the backend — preferred over date/start matching. */
  slotId?: string;
  /** Farmer identifier (farmer_code). */
  farmerId?: string;
};

// ------------------------------------------------------ marketplace DTOs
//
// Fair Price Discovery & Smart Matching Engine (backend/app/routers/marketplace.py).
// Decimal columns are serialized as strings by FastAPI, so prices/quantities
// arrive as strings and must be parsed with Number() before display/maths.

export type ApiMarketPriceSummary = {
  crop: string;
  region: string;
  state: string;
  price_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
  unit: string;
  price_30d_avg: string | null;
  price_30d_min: string | null;
  price_30d_max: string | null;
};

export type ApiMarketPrice = {
  id: string;
  crop: string;
  region: string;
  state: string;
  district: string | null;
  market_name: string | null;
  grade: string | null;
  price_date: string;
  min_price: string;
  max_price: string;
  modal_price: string;
  unit: string;
  source: string;
  created_at: string;
  updated_at: string;
};

export type ApiFairPriceStatus = 'below_market' | 'near_market' | 'above_market';

/** Response of GET /api/marketplace/fair-price — the fair-price badge payload. */
export type ApiFairPriceIndicator = {
  market_avg_price: string;
  offer_price: string;
  deviation_pct: number;
  status: ApiFairPriceStatus;
  badge_color: 'green' | 'yellow' | 'red';
  message: string;
};

/** Response of POST /api/marketplace/check-low-offer. */
export type ApiLowOfferAlert = {
  is_low_offer: boolean;
  deviation_pct?: number;
  suggested_counter_price?: string;
  market_avg?: string;
  message?: string;
};

export type ApiMatchScore = {
  price_score: number;
  distance_score: number;
  quantity_score: number;
  reliability_score: number;
  total_score: number;
};

export type ApiBuyer = {
  id: string;
  buyer_code: string;
  name: string;
  company_name: string | null;
  contact_person: string | null;
  phone: string;
  email: string | null;
  state: string | null;
  district: string | null;
  reliability_score: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ApiBuyerRequirement = {
  id: string;
  buyer_id: string;
  crop: string;
  variety: string | null;
  grade: string | null;
  min_quantity_kg: string;
  max_quantity_kg: string;
  offered_price_per_quintal: string;
  state: string;
  district: string | null;
  max_distance_km: number | null;
  delivery_deadline: string | null;
  quality_requirements: string | null;
  status: string; // ACTIVE | FILLED | EXPIRED | CANCELLED
  valid_until: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiMatchedBuyerRequirement = {
  requirement: ApiBuyerRequirement;
  match_score: ApiMatchScore;
  fair_price: ApiFairPriceIndicator;
};

export type ApiMatchedFarmerListing = {
  farmer_id: string;
  farmer_name: string;
  crop: string;
  quantity_kg: string;
  state: string;
  district: string;
  price_per_quintal: string | null;
  match_score: ApiMatchScore;
  fair_price: ApiFairPriceIndicator;
};

export type ApiOffer = {
  id: string;
  buyer_id: string;
  requirement_id: string;
  farmer_id: string | null;
  pooled_lot_id: string | null;
  price_per_quintal: string;
  quantity_kg: string;
  status: string; // PENDING | ACCEPTED | REJECTED | COUNTERED | EXPIRED
  market_avg_price: string | null;
  deviation_pct: number | null;
  is_counter: boolean;
  parent_offer_id: string | null;
  expires_at: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiPooledLotMember = {
  id: string;
  pooled_lot_id: string;
  farmer_id: string;
  quantity_kg: string;
  agreed_price_per_quintal: string | null;
  is_confirmed: boolean;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ApiPooledLot = {
  id: string;
  lot_code: string;
  crop: string;
  variety: string | null;
  grade: string | null;
  state: string;
  district: string;
  total_quantity_kg: string;
  target_quantity_kg: string;
  status: string; // FORMING | READY | MATCHED | COMPLETED | EXPIRED | CANCELLED
  suggested_price_per_quintal: string | null;
  matched_requirement_id: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  members: ApiPooledLotMember[];
};

export type ApiPayoutLine = {
  farmer_id: string;
  quantity_kg: string;
  share_pct: number;
  amount: string;
  price_per_quintal: string;
};

/** Query accepted by the market-price / fair-price endpoints. */
export type MarketPriceQuery = {
  crop: string;
  region: string;
  state: string;
  grade?: string;
};

/**
 * 1:1 mapping to the FastAPI endpoints (see backend/app/routers).
 * All functions return ApiResult so the store can fall back to the mock
 * behaviour when the backend is unreachable.
 */
export const api = {
  health: () => get<{ status: string; database: string }>('/health'),

  // analytics ----------------------------------------------------------
  analyticsSummary: () =>
    get<{
      farmers_processed: number;
      capacity_used_percent: number;
      active_centres: number;
      generated_at: string;
    }>('/api/analytics/summary'),

  // notices ------------------------------------------------------------
  notices: () =>
    get<
      {
        id: string;
        title: string;
        dept: string;
        body: string;
        tag: string | null;
        is_urgent: boolean;
        date: string;
        created_at: string;
      }[]
    >('/api/notices'),

  urgentNotice: () =>
    get<{
      id: string;
      title: string;
      dept: string;
      body: string;
      tag: string | null;
      is_urgent: boolean;
      date: string;
      created_at: string;
    } | null>('/api/notices/urgent'),

  // auth ---------------------------------------------------------------
  registerFarmer: (farmer: Farmer, aadhaar?: string) =>
    post<ApiAuth<ApiFarmer>>('/api/auth/farmer/register', {
      name: farmer.name,
      phone: farmer.mobile,
      date_of_birth: farmer.dateOfBirth || undefined,
      address: farmer.address || undefined,
      state: farmer.state || undefined,
      district: farmer.district || undefined,
      village: farmer.village || undefined,
      land_size_acres: farmer.landSizeAcres ? Number(farmer.landSizeAcres) : undefined,
      crop: farmer.crop || undefined,
      quantity_kg: farmer.quantityKg ? Number(farmer.quantityKg) : undefined,
      preferred_centre_id: farmer.preferredCentreId || undefined,
      aadhaar: aadhaar || undefined,
    }),

  farmerLogin: (input: LoginInput) =>
    post<ApiAuth<ApiFarmer>>('/api/auth/farmer/login', {
      mobile: input.mobile,
      password: input.password,
      otp: input.otp,
    }),

  officerLogin: (input: OfficerLoginInput) =>
    post<ApiAuth<ApiOfficer>>('/api/auth/officer/login', {
      officer_id: input.officerId,
      password: input.password,
    }),

  // farmers ------------------------------------------------------------
  getFarmer: (farmerId: string) => get<ApiFarmer>(`/api/farmers/${farmerId}`),
  updateFarmer: (farmerId: string, patchBody: Partial<Record<string, unknown>>) =>
    put<ApiFarmer>(`/api/farmers/${farmerId}`, patchBody),
  listFarmerBookings: (farmerId: string) =>
    get<ApiQueueEntry[]>(`/api/farmers/${farmerId}/queue`),
  listFarmerProcurements: (farmerId: string) =>
    get<unknown[]>(`/api/farmers/${farmerId}/procurements`),
  listFarmerPayments: (farmerId: string) =>
    get<unknown[]>(`/api/farmers/${farmerId}/payments`),

  // centres ------------------------------------------------------------
  listCentres: (filters?: { state?: string; district?: string; crop?: string }) => {
    const params = new URLSearchParams();
    if (filters?.state) params.set('state', filters.state);
    if (filters?.district) params.set('district', filters.district);
    if (filters?.crop) params.set('crop', filters.crop);
    const qs = params.toString();
    return get<ApiCentre[]>(`/api/centres${qs ? `?${qs}` : ''}`);
  },
  getCentre: (centreId: string) => get<ApiCentre>(`/api/centres/${centreId}`),

  // slots --------------------------------------------------------------
  listSlotsAll: (range?: { from?: string; to?: string }) => {
    const params = new URLSearchParams();
    if (range?.from) params.set('from', range.from);
    if (range?.to) params.set('to', range.to);
    const qs = params.toString();
    return get<ApiSlot[]>(`/api/slots${qs ? `?${qs}` : ''}`);
  },
  listSlots: (centreId: string, date: string) =>
    get<ApiSlot[]>(`/api/centres/${centreId}/slots?date=${date}`),
  createSlot: (centreId: string, input: { date: string; start: string; end: string; capacity: number }) =>
    post<ApiSlot>(`/api/centres/${centreId}/slots`, {
      date: input.date,
      start_time: input.start,
      end_time: input.end,
      capacity: input.capacity,
    }),
  updateSlot: (slotId: string, input: { capacity?: number; closed?: boolean }) =>
    patch<ApiSlot>(`/api/slots/${slotId}`, input),

  // queue --------------------------------------------------------------
  joinQueue: (input: {
    farmerId: string;
    centreId: string;
    slotId?: string;
    date?: string;
    startTime?: string;
    produce: string;
    quantityKg: string;
  }) =>
    post<ApiQueueEntry>('/api/queue/join', {
      farmer_id: input.farmerId,
      centre_id: input.centreId,
      slot_id: input.slotId,
      date: input.date,
      start_time: input.startTime,
      produce: input.produce,
      quantity_kg: Number(input.quantityKg) || 0,
    }),
  getQueueEntry: (entryId: string) => get<ApiQueueEntry>(`/api/queue/${entryId}`),
  getCentreQueue: (centreId: string, date?: string) =>
    get<ApiQueueCentre>(`/api/queue/centre/${centreId}${date ? `?date=${date}` : ''}`),
  advanceQueue: (centreId: string, date?: string) =>
    post<unknown>(`/api/queue/centre/${centreId}/advance${date ? `?date=${date}` : ''}`),
  updateQueueStatus: (entryId: string, status: string) =>
    patch<ApiQueueEntry>(`/api/queue/${entryId}/status`, { status }),
  moveQueueSlot: (entryId: string, slotId: string) =>
    patch<ApiQueueEntry>(`/api/queue/${entryId}/slot`, { slot_id: slotId }),
  markArrived: (entryId: string) => post<ApiQueueEntry>(`/api/queue/${entryId}/arrive`),

  // notifications ------------------------------------------------------
  listNotifications: (farmerId: string) =>
    get<ApiNotification[]>(`/api/notifications?farmer_id=${farmerId}`),
  markAllNotificationsRead: (farmerId: string) =>
    patch<{ updated: number }>('/api/notifications/read-all', { farmer_id: farmerId }),

  // marketplace — market price ------------------------------------------
  marketPrice: (query: MarketPriceQuery) =>
    get<ApiMarketPriceSummary>(`/api/marketplace/market-price${qs({ ...query })}`),
  marketPriceHistory: (query: MarketPriceQuery & { days?: number }) =>
    get<ApiMarketPrice[]>(`/api/marketplace/market-price/history${qs({ ...query })}`),

  // marketplace — fair price --------------------------------------------
  fairPrice: (query: MarketPriceQuery & { offerPrice: number | string }) =>
    get<ApiFairPriceIndicator>(
      `/api/marketplace/fair-price${qs({
        offer_price: query.offerPrice,
        crop: query.crop,
        region: query.region,
        state: query.state,
        grade: query.grade,
      })}`
    ),
  checkLowOffer: (query: MarketPriceQuery & { offerPrice: number | string }) =>
    post<ApiLowOfferAlert>(
      `/api/marketplace/check-low-offer${qs({
        offer_price: query.offerPrice,
        crop: query.crop,
        region: query.region,
        state: query.state,
        grade: query.grade,
      })}`
    ),

  // marketplace — buyers & requirements ---------------------------------
  createBuyer: (input: {
    name: string;
    phone: string;
    password: string;
    company_name?: string;
    contact_person?: string;
    email?: string;
    address?: string;
    state?: string;
    district?: string;
    gstin?: string;
    license_number?: string;
  }) => post<ApiBuyer>('/api/marketplace/buyers', input),
  getBuyer: (buyerId: string) => get<ApiBuyer>(`/api/marketplace/buyers/${buyerId}`),
  updateBuyer: (buyerId: string, body: Record<string, unknown>) =>
    put<ApiBuyer>(`/api/marketplace/buyers/${buyerId}`, body),

  listRequirements: (filters?: {
    crop?: string;
    state?: string;
    district?: string;
    status?: string;
  }) => get<ApiBuyerRequirement[]>(`/api/marketplace/requirements${qs({ ...filters })}`),
  listBuyerRequirements: (buyerId: string, status?: string) =>
    get<ApiBuyerRequirement[]>(
      `/api/marketplace/buyers/${buyerId}/requirements${qs({ status })}`
    ),
  getRequirement: (requirementId: string) =>
    get<ApiBuyerRequirement>(`/api/marketplace/requirements/${requirementId}`),
  createRequirement: (
    buyerId: string,
    input: {
      crop: string;
      min_quantity_kg: number;
      max_quantity_kg: number;
      offered_price_per_quintal: number;
      state: string;
      district?: string;
      variety?: string;
      grade?: string;
      max_distance_km?: number;
      delivery_deadline?: string;
      quality_requirements?: string;
      valid_until?: string;
    }
  ) => post<ApiBuyerRequirement>(`/api/marketplace/buyers/${buyerId}/requirements`, input),
  updateRequirement: (requirementId: string, body: Record<string, unknown>) =>
    put<ApiBuyerRequirement>(`/api/marketplace/requirements/${requirementId}`, body),

  // marketplace — smart matching ----------------------------------------
  matchFarmerToBuyers: (
    farmerId: string,
    query: {
      crop: string;
      quantityKg: number | string;
      state: string;
      district: string;
      grade?: string;
      limit?: number;
    }
  ) =>
    get<ApiMatchedBuyerRequirement[]>(
      `/api/marketplace/match/farmer/${farmerId}${qs({
        crop: query.crop,
        quantity_kg: query.quantityKg,
        state: query.state,
        district: query.district,
        grade: query.grade,
        limit: query.limit,
      })}`
    ),
  matchBuyerToFarmers: (requirementId: string, limit?: number) =>
    get<ApiMatchedFarmerListing[]>(
      `/api/marketplace/match/buyer/${requirementId}${qs({ limit })}`
    ),

  // marketplace — offers -------------------------------------------------
  createOffer: (input: {
    requirement_id: string;
    price_per_quintal: number;
    quantity_kg: number;
    farmer_id?: string;
    pooled_lot_id?: string;
    parent_offer_id?: string;
    expires_at?: string;
  }) => post<ApiOffer>('/api/marketplace/offers', input),
  getOffer: (offerId: string) => get<ApiOffer>(`/api/marketplace/offers/${offerId}`),
  updateOffer: (
    offerId: string,
    body: {
      price_per_quintal?: number;
      quantity_kg?: number;
      status?: string;
      expires_at?: string;
    }
  ) => put<ApiOffer>(`/api/marketplace/offers/${offerId}`, body),

  // marketplace — pooled lots -------------------------------------------
  createPooledLot: (input: {
    crop: string;
    state: string;
    district: string;
    target_quantity_kg: number;
    variety?: string;
    grade?: string;
    suggested_price_per_quintal?: number;
  }) => post<ApiPooledLot>('/api/marketplace/pooled-lots', input),
  autoCreatePooledLot: (query: {
    crop: string;
    state: string;
    district: string;
    bulkThresholdKg?: number;
    radiusKm?: number;
  }) =>
    post<ApiPooledLot>(
      `/api/marketplace/pooled-lots/auto-create${qs({
        crop: query.crop,
        state: query.state,
        district: query.district,
        bulk_threshold_kg: query.bulkThresholdKg,
        radius_km: query.radiusKm,
      })}`
    ),
  getPooledLot: (lotId: string) => get<ApiPooledLot>(`/api/marketplace/pooled-lots/${lotId}`),
  addFarmerToPooledLot: (
    lotId: string,
    input: { farmer_id: string; quantity_kg: number; agreed_price_per_quintal?: number }
  ) => post<ApiPooledLot>(`/api/marketplace/pooled-lots/${lotId}/members`, input),
  confirmPooledLotParticipation: (lotId: string, farmerId: string) =>
    post<{ success: boolean; message: string }>(
      `/api/marketplace/pooled-lots/${lotId}/confirm/${farmerId}`
    ),
  matchPooledLotToRequirement: (lotId: string, requirementId: string) =>
    post<{ success: boolean; message: string }>(
      `/api/marketplace/pooled-lots/${lotId}/match/${requirementId}`
    ),
  pooledLotPayout: (lotId: string) =>
    get<{ payouts: ApiPayoutLine[] }>(`/api/marketplace/pooled-lots/${lotId}/payout`),
} as const;

