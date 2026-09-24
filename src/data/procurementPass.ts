/** Adaptive Procurement Pass data model. Demo state is local and deterministic. */
import type { Booking, ProcurementCentre } from './mockData';

export type PassStatus = 'Confirmed' | 'Leave Soon' | 'On the Way' | 'Checked In' | 'Delayed' | 'Rescheduled' | 'Completed' | 'Missed' | 'Cancelled';
export type ReadinessKey = 'produce' | 'documents' | 'token' | 'travel';
export type PassUpdateKind = 'status' | 'delay' | 'window' | 'recommendation' | 'checklist';

export type PassUpdate = { id: string; at: number; kind: PassUpdateKind; message: string };
export type PassReadiness = Record<ReadinessKey, boolean>;
export type CentreOperations = { delayMinutes: number; closed: boolean; capacityReduction: number };

export type ProcurementPass = {
  bookingId: string;
  token: string;
  centreId: string;
  centreName: string;
  centreAddress: string;
  crop: string;
  quantityKg: string;
  arrivalStart: string;
  arrivalEnd: string;
  leaveAt: string;
  status: PassStatus;
  position: number;
  waitMinutes: number;
  capacityRemaining: number;
  nextAction: string;
  updatedAt: number;
  updates: PassUpdate[];
  readiness: PassReadiness;
  operations: CentreOperations;
};

export const PASS_STORAGE_KEY = 'fpp.adaptive-pass.v1';

export function makePassId(booking: Booking, centre: ProcurementCentre, delayMinutes = 0): ProcurementPass {
  const now = Date.now();
  const position = 0;
  return {
    bookingId: booking.id,
    token: booking.token,
    centreId: centre.id,
    centreName: centre.name,
    centreAddress: centre.address,
    crop: booking.produce,
    quantityKg: booking.quantityKg,
    arrivalStart: booking.slotStart,
    arrivalEnd: booking.slotEnd,
    leaveAt: booking.slotStart,
    status: 'Confirmed',
    position,
    waitMinutes: 0,
    capacityRemaining: centre.capacityPerDay,
    nextAction: 'Prepare produce and documents',
    updatedAt: now,
    updates: [{ id: `${booking.id}-created`, at: now, kind: 'status', message: 'Booking confirmed' }],
    readiness: { produce: false, documents: false, token: true, travel: false },
    operations: { delayMinutes: 0, closed: false, capacityReduction: 0 },
  };
}

export function qrCells(value: string, size = 13): boolean[] {
  const cells: boolean[] = [];
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) { hash ^= value.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  for (let i = 0; i < size * size; i += 1) cells.push(((hash ^ Math.imul(i + 1, 2654435761)) & 1) === 1);
  return cells;
}
