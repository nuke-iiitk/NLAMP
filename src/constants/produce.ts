/**
 * Produce-declaration constants shared by the booking wizard and its validator.
 *
 * ── CONFIG DECISIONS (flag for review) ──────────────────────────────
 * MAX_QUANTITY_KG
 *   The MSP schemes this portal models (PM-AASHA / FCI procurement) do not
 *   publish a single universal per-farmer daily cap — the ceiling is set per
 *   State agency and per centre. Rather than hard-code a scheme rule that may
 *   be wrong, a single booking is capped here and the remaining ceiling is the
 *   selected slot's spare capacity. Change this one constant once the scheme
 *   rule is confirmed.
 * BAG_WEIGHT_KG
 *   50 kg — the standard gunny-bag norm for foodgrain at procurement centres.
 * ─────────────────────────────────────────────────────────────────────
 */

/** Standard gunny bag weight for foodgrain (kg). */
export const BAG_WEIGHT_KG = 50;

/** Upper bound for a single booking (kg). See config note above. */
export const MAX_QUANTITY_KG = 2000;

/** Upper bound for a single booking (gunny bags) = MAX_QUANTITY_KG / BAG_WEIGHT_KG. */
export const MAX_BAGS = MAX_QUANTITY_KG / BAG_WEIGHT_KG;

/** Grain crops that carry a moisture-content declaration at the gate. */
const MOISTURE_CROPS = ['Paddy', 'Wheat', 'Maize'];

/** True when the crop needs a farmer-declared moisture reading. */
export function cropNeedsMoisture(crop: string): boolean {
  return MOISTURE_CROPS.includes(crop);
}

/**
 * Declared variety / grade per crop. Paddy and wheat are procured by grade
 * under MSP; crops without graded procurement fall back to a plain descriptor.
 */
const VARIETIES_BY_CROP: Record<string, string[]> = {
  Paddy: ['Grade A', 'Common', 'Fine'],
  Wheat: ['Grade A', 'Grade B', 'Common'],
  Maize: ['Grade A', 'Common'],
  Coconut: ['Mature', 'Tender'],
  Rubber: ['RSS 1', 'RSS 4', 'Latex'],
  Banana: ['Class A', 'Class B'],
  Pepper: ['Grade 1', 'Grade 2'],
};

/** Variety / grade options accepted for the given crop. */
export function varietiesForCrop(crop: string): string[] {
  return VARIETIES_BY_CROP[crop] ?? ['Standard'];
}

/**
 * Transport modes recorded at gate entry. `needsVehicle: false` hides the
 * vehicle-number field — head-load / own-carry arrivals have no vehicle.
 */
export const TRANSPORT_MODES: {
  id: string;
  /** i18n key for the option label. */
  labelKey: string;
  needsVehicle: boolean;
}[] = [
  { id: 'own-vehicle', labelKey: 'book.transportOwn', needsVehicle: true },
  { id: 'hired-transport', labelKey: 'book.transportHired', needsVehicle: true },
  { id: 'head-load', labelKey: 'book.transportHeadload', needsVehicle: false },
  { id: 'other', labelKey: 'book.transportOther', needsVehicle: true },
];

/** Default transport mode pre-selected for the farmer. */
export const DEFAULT_TRANSPORT_MODE = 'own-vehicle';

/** Whether the given transport mode requires a vehicle number. */
export function transportNeedsVehicle(modeId: string): boolean {
  const mode = TRANSPORT_MODES.find((m) => m.id === modeId);
  return mode ? mode.needsVehicle : true;
}

/** kg → gunny bags (rounded up), used for the quick count at the gate. */
export function bagsForWeight(kg: number): number {
  if (!Number.isFinite(kg) || kg <= 0) return 0;
  return Math.ceil(kg / BAG_WEIGHT_KG);
}

/** Human label for a transport mode id (falls back to the raw id). */
export function transportModeLabelKey(modeId: string): string {
  return TRANSPORT_MODES.find((m) => m.id === modeId)?.labelKey ?? 'book.transportOther';
}
