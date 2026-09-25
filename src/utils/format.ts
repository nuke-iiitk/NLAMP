/**
 * Small display formatters shared by the marketplace screens.
 *
 * Indian digit grouping (last 3 digits, then pairs: 12,34,567) is implemented
 * by hand instead of `Intl.NumberFormat` so the app renders identically on
 * Hermes builds where the Intl/add-on locale data may be unavailable.
 */

/** Format an amount as Indian-grouped digits, e.g. `1,875` or `11,000.50`. */
export function formatInr(value: string | number | null | undefined): string {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return '—';
  const [whole, decimals] = Math.abs(amount).toFixed(2).split('.');
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
  const sign = amount < 0 ? '-' : '';
  return decimals === '00' ? `${sign}${grouped}` : `${sign}${grouped}.${decimals}`;
}

/** Format a quantity in kilograms without trailing `.00`, e.g. `5,000 kg`. */
export function formatKg(value: string | number | null | undefined): string {
  return `${formatInr(value)} kg`;
}

/** `₹1,875 / quintal` — the unit every marketplace price is quoted in. */
export function formatRate(value: string | number | null | undefined): string {
  return `₹${formatInr(value)}/quintal`;
}

/** Percentage deviation with an explicit sign, e.g. `+6.7%` / `-12.4%`. */
export function formatDeviation(deviationPct: number | null | undefined): string {
  const value = Number(deviationPct ?? 0);
  if (!Number.isFinite(value)) return '0.0%';
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

/** `2026-09-25` → `25 Sep 2026` (compact, locale-neutral). */
export function formatIsoDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parsed = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return iso;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${parsed.getDate()} ${months[parsed.getMonth()]} ${parsed.getFullYear()}`;
}
