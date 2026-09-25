/**
 * Local data model for the National Land Acquisition & Management System (NLAMS).
 *
 * All names, centres, numbers and IDs are sample records for development.
 * In production this module is replaced by the FastAPI backend
 * (see src/services/api.ts for the intended endpoint mapping).
 */
import { INDIAN_LOCATIONS } from './indiaLocations';

// ------------------------------------------------------------------ types

export type CentreStatus = 'Open' | 'Busy' | 'Full' | 'Closed';

export type BookingStatus =
  | 'Upcoming'
  | 'Waiting'
  | 'Your Turn'
  | 'Processing'
  | 'Completed'
  | 'Cancelled';

export type QueueEntryStatus =
  | 'Completed'
  | 'Processing'
  | 'Called'
  | 'Waiting'
  | 'On Hold';

export type SlotAvailability = 'Available' | 'Almost Full' | 'Full' | 'Closed';

export type Farmer = {
  id: string;
  name: string;
  mobile: string;
  aadhaar: string;
  dateOfBirth: string; // DD/MM/YYYY (demo)
  state: string;
  district: string;
  village: string;
  address: string;
  landSizeAcres: string;
  crop: string;
  quantityKg: string;
  preferredCentreId: string;
};

export type ProcurementCentre = {
  id: string;
  name: string;
  state: string;
  district: string;
  address: string;
  distanceKm: number;
  openingHours: string;
  capacityPerDay: number;
  crops: string[];
  status: CentreStatus;
};

export type Slot = {
  id: string;
  centreId: string;
  date: string; // ISO yyyy-mm-dd
  start: string; // HH:mm (24h)
  end: string; // HH:mm (24h)
  capacity: number;
  booked: number;
  closed: boolean;
};

export type Booking = {
  id: string;
  token: string; // NLAMS-1042
  farmerId: string;
  farmerName: string;
  centreId: string;
  centreName: string;
  date: string; // ISO
  slotStart: string; // HH:mm
  slotEnd: string; // HH:mm
  produce: string;
  quantityKg: string;
  status: BookingStatus;
  arrived: boolean;
  createdAt: number;
};

export type QueueEntry = {
  /** Backend queue-entry id (present when the entry came from PostgreSQL). */
  id?: string;
  token: string;
  farmerName: string;
  slot: string; // display e.g. "10:30"
  produce: string;
  status: QueueEntryStatus;
};

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
  read: boolean;
};

export type Officer = {
  id: string;
  name: string;
  designation: string;
  centreId: string;
};

// ------------------------------------------------------------- date utils

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISO(new Date());
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return toISO(d);
}

/** "2026-08-29" -> "29 August 2026" */
export function formatDateLong(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** "2026-08-29" -> "29 Aug" */
export function formatDateShort(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1].slice(0, 3)}`;
}

export function dayName(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return DAY_NAMES[d.getDay()];
}

/** "14:30" -> "2:30 PM" */
export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function slotRange(start: string, end: string): string {
  return `${formatTime12h(start)} – ${formatTime12h(end)}`;
}

// ------------------------------------------------------------ mock seeds

export const DEMO_MOBILE = '9876543210';
export const DEMO_FARMER_ID = 'NLAMS-2026-0482';
export const DEMO_TOKEN = 'NLAMS-1042';
export const DEMO_OTP = '123456';

export const HELPLINE = '1800-180-1551';
export const HELP_EMAIL = 'helpdesk@nlams-demo.in';
export const PORTAL_VERSION = '1.0.0';

export const crops = ['Highways', 'Railways', 'Energy', 'Irrigation', 'Industrial', 'Urban Infra', 'Energy'];

/** All 28 States and 8 Union Territories (single source of truth). */
export const states = INDIAN_LOCATIONS.map((location) => location.name);

/** Official districts per State/UT, derived from the shared location data. */
export const districtsByState: Record<string, string[]> = Object.fromEntries(
  INDIAN_LOCATIONS.map((location) => [location.name, location.districts])
);

export const demoFarmer: Farmer = {
  id: DEMO_FARMER_ID,
  name: 'Rajan Kumar',
  mobile: DEMO_MOBILE,
  aadhaar: '432143214321',
  dateOfBirth: '12/04/1986',
  state: 'Kerala',
  district: 'Kottayam',
  village: 'Kumarapuram',
  address: 'Kizhakke Veettil, Kumarapuram P.O.',
  landSizeAcres: '2.5',
  crop: 'Highways',
  quantityKg: '850',
  preferredCentreId: 'c1',
};

export const officer: Officer = {
  id: 'OFF-2201',
  name: 'Suresh Nair',
  designation: 'District Land Acquisition Officer',
  centreId: 'c1',
};

export const procurementCentres: ProcurementCentre[] = [
  {
    id: 'c1',
    name: 'Kottayam District Land Acquisition Office',
    state: 'Kerala',
    district: 'Kottayam',
    address: 'Nagampadam, Kottayam',
    distanceKm: 4.2,
    openingHours: '8:00 AM – 5:00 PM',
    capacityPerDay: 150,
    crops: ['Highways', 'Irrigation', 'Energy', 'Urban Infra'],
    status: 'Open',
  },
  {
    id: 'c2',
    name: 'Changanassery District Land Acquisition Office',
    state: 'Kerala',
    district: 'Kottayam',
    address: 'Perunna, Changanassery',
    distanceKm: 12.8,
    openingHours: '8:00 AM – 5:00 PM',
    capacityPerDay: 120,
    crops: ['Highways', 'Urban Infra', 'Energy'],
    status: 'Open',
  },
  {
    id: 'c3',
    name: 'Ettumanoor District Land Acquisition Office',
    state: 'Kerala',
    district: 'Kottayam',
    address: 'MC Road, Ettumanoor',
    distanceKm: 16.4,
    openingHours: '8:00 AM – 4:30 PM',
    capacityPerDay: 100,
    crops: ['Highways', 'Industrial', 'Energy'],
    status: 'Busy',
  },
  {
    id: 'c4',
    name: 'Alappuzha District Land Acquisition Office',
    state: 'Kerala',
    district: 'Alappuzha',
    address: 'Civil Station Road, Alappuzha',
    distanceKm: 48.0,
    openingHours: '8:00 AM – 5:00 PM',
    capacityPerDay: 110,
    crops: ['Highways', 'Irrigation'],
    status: 'Open',
  },
  {
    id: 'c5',
    name: 'Ernakulam District Land Acquisition Office',
    state: 'Kerala',
    district: 'Ernakulam',
    address: 'Kaloor, Kochi',
    distanceKm: 65.5,
    openingHours: '8:30 AM – 5:00 PM',
    capacityPerDay: 140,
    crops: ['Highways', 'Irrigation', 'Urban Infra'],
    status: 'Open',
  },
  {
    id: 'c6',
    name: 'Thrissur District Land Acquisition Office',
    state: 'Kerala',
    district: 'Thrissur',
    address: 'Kokkalai, Thrissur',
    distanceKm: 92.0,
    openingHours: '8:00 AM – 4:30 PM',
    capacityPerDay: 90,
    crops: ['Highways', 'Irrigation', 'Energy'],
    status: 'Full',
  },

  // ---- demo centres across other states (keep the cascade demonstrable) ----
  {
    id: 'c7',
    name: 'Coimbatore District Land Acquisition Office',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    address: 'Gandhipuram, Coimbatore',
    distanceKm: 6.1,
    openingHours: '8:00 AM – 5:00 PM',
    capacityPerDay: 160,
    crops: ['Highways', 'Irrigation', 'Urban Infra'],
    status: 'Open',
  },
  {
    id: 'c8',
    name: 'Erode District Land Acquisition Office',
    state: 'Tamil Nadu',
    district: 'Erode',
    address: 'Brough Road, Erode',
    distanceKm: 3.8,
    openingHours: '8:00 AM – 4:30 PM',
    capacityPerDay: 110,
    crops: ['Highways', 'Energy', 'Urban Infra'],
    status: 'Busy',
  },
  {
    id: 'c9',
    name: 'Mysuru Regional Land Acquisition Office',
    state: 'Karnataka',
    district: 'Mysuru',
    address: 'Land Records Road, Mysuru',
    distanceKm: 7.4,
    openingHours: '8:00 AM – 5:00 PM',
    capacityPerDay: 150,
    crops: ['Highways', 'Railways', 'Energy'],
    status: 'Open',
  },
  {
    id: 'c10',
    name: 'Mandya District Land Acquisition Office',
    state: 'Karnataka',
    district: 'Mandya',
    address: 'Collectorate Road, Mandya',
    distanceKm: 5.2,
    openingHours: '8:30 AM – 5:00 PM',
    capacityPerDay: 100,
    crops: ['Highways', 'Irrigation', 'Urban Infra'],
    status: 'Closed',
  },
  {
    id: 'c11',
    name: 'Ludhiana Land Records Centre',
    state: 'Punjab',
    district: 'Ludhiana',
    address: 'Land Records Centre, Ludhiana',
    distanceKm: 4.6,
    openingHours: '8:00 AM – 5:00 PM',
    capacityPerDay: 200,
    crops: ['Railways', 'Energy', 'Highways'],
    status: 'Open',
  },
  {
    id: 'c12',
    name: 'Patiala District Land Acquisition Office',
    state: 'Punjab',
    district: 'Patiala',
    address: 'Civil Lines, Patiala',
    distanceKm: 6.9,
    openingHours: '8:00 AM – 4:30 PM',
    capacityPerDay: 140,
    crops: ['Railways', 'Highways'],
    status: 'Busy',
  },
  {
    id: 'c13',
    name: 'Nashik District Land Acquisition Office',
    state: 'Maharashtra',
    district: 'Nashik',
    address: 'Collectorate Campus, Nashik',
    distanceKm: 5.5,
    openingHours: '8:00 AM – 5:00 PM',
    capacityPerDay: 170,
    crops: ['Highways', 'Railways', 'Energy'],
    status: 'Open',
  },
  {
    id: 'c14',
    name: 'Nagpur District Land Acquisition Office',
    state: 'Maharashtra',
    district: 'Nagpur',
    address: 'Land Records Colony, Nagpur',
    distanceKm: 8.3,
    openingHours: '8:00 AM – 5:00 PM',
    capacityPerDay: 130,
    crops: ['Highways', 'Railways', 'Irrigation'],
    status: 'Full',
  },
  {
    id: 'c15',
    name: 'Lucknow Divisional Land Acquisition Office',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    address: 'Rajkiya Bhumi Vibhag, Lucknow',
    distanceKm: 5.0,
    openingHours: '8:00 AM – 5:00 PM',
    capacityPerDay: 190,
    crops: ['Railways', 'Highways', 'Energy'],
    status: 'Open',
  },
  {
    id: 'c16',
    name: 'Kanpur Nagar Land Acquisition Office',
    state: 'Uttar Pradesh',
    district: 'Kanpur Nagar',
    address: 'Civil Lines, Kanpur',
    distanceKm: 6.7,
    openingHours: '8:00 AM – 4:30 PM',
    capacityPerDay: 150,
    crops: ['Railways', 'Highways'],
    status: 'Busy',
  },
  {
    id: 'c17',
    name: 'Ahmedabad District Land Acquisition Office',
    state: 'Gujarat',
    district: 'Ahmedabad',
    address: 'Sachivalaya Road, Ahmedabad',
    distanceKm: 9.1,
    openingHours: '8:00 AM – 5:00 PM',
    capacityPerDay: 180,
    crops: ['Railways', 'Highways', 'Urban Infra'],
    status: 'Open',
  },
  {
    id: 'c18',
    name: 'Rajkot District Land Acquisition Office',
    state: 'Gujarat',
    district: 'Rajkot',
    address: 'Gondal Road, Rajkot',
    distanceKm: 4.9,
    openingHours: '8:30 AM – 5:00 PM',
    capacityPerDay: 120,
    crops: ['Railways', 'Highways'],
    status: 'Closed',
  },
];

// ------------------------------------------------------------------ slots

export const SLOT_MINUTES = 30;
export const SLOT_CAPACITIES = 12;

function buildTimeRanges(): { start: string; end: string }[] {
  const out: { start: string; end: string }[] = [];
  for (let h = 8; h < 17; h += 1) {
    out.push({
      start: `${String(h).padStart(2, '0')}:00`,
      end: `${String(h).padStart(2, '0')}:30`,
    });
    out.push({
      start: `${String(h).padStart(2, '0')}:30`,
      end: `${String(h + 1).padStart(2, '0')}:00`,
    });
  }
  return out;
}

export const TIME_RANGES = buildTimeRanges();

/** Deterministic pseudo-random so slots look organic but stay stable. */
function seededBooked(centreIndex: number, dayIndex: number, slotIndex: number): number {
  return (centreIndex * 37 + dayIndex * 13 + slotIndex * 7) % 11;
}

export function buildSlotsForCentre(centre: ProcurementCentre, centreIndex: number): Slot[] {
  const slots: Slot[] = [];
  const today = todayISO();
  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const date = addDaysISO(today, dayIndex);
    TIME_RANGES.forEach((range, slotIndex) => {
      const booked = seededBooked(centreIndex, dayIndex, slotIndex);
      const closed = dayIndex >= 5 && slotIndex > 12; // afternoon closed later in week
      slots.push({
        id: `${centre.id}#${date}#${range.start}`,
        centreId: centre.id,
        date,
        start: range.start,
        end: range.end,
        capacity: SLOT_CAPACITIES,
        booked: closed ? SLOT_CAPACITIES : booked,
        closed,
      });
    });
  }
  return slots;
}

export function buildAllSlots(): Slot[] {
  return procurementCentres.flatMap((centre, index) => buildSlotsForCentre(centre, index));
}

// ------------------------------------------------------------------ queue

const QUEUE_NAMES = [
  'Anil Das', 'Priya Devi', 'Jose Mathew', 'Lakshmi Amma', 'Binu Varghese',
  'Shaji P Panicker', 'Mini Thomas', 'Ravi Chandran', 'Beena Mol', 'Arun Prakash',
  'Gopika Menon', 'Manoj Menon', 'Radha Krishnan', 'Sindhu S', 'Vikram Singh',
  'Fatima Beevi', 'Kunjhappu', 'Devika R', 'Mahesh Pillai', 'Anandhu Krishna',
];

export type CentreQueue = {
  entries: QueueEntry[];
  lastUpdated: number;
};

function seedQueueForCentre(centreIndex: number, centreId: string): CentreQueue {
  if (centreId !== 'c1') {
    const base = 2100 + centreIndex * 40;
    const entries: QueueEntry[] = Array.from({ length: 6 }, (_, i) => ({
      token: `NLAMS-${base + i}`,
      farmerName: QUEUE_NAMES[(centreIndex * 3 + i) % QUEUE_NAMES.length],
      slot: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'][i % 6],
      produce: crops[i % crops.length],
      status:
        i < 2
          ? ('Completed' as const)
          : i === 2
            ? ('Processing' as const)
            : ('Waiting' as const),
    }));
    return { entries, lastUpdated: Date.now() };
  }

  const entries: QueueEntry[] = [];
  let nameIndex = 0;
  // Completed: NLAMS-1020 .. NLAMS-1037
  for (let token = 1020; token <= 1037; token += 1) {
    entries.push({
      token: `NLAMS-${token}`,
      farmerName: QUEUE_NAMES[nameIndex % QUEUE_NAMES.length],
      slot: '08:00',
      produce: crops[nameIndex % crops.length],
      status: 'Completed',
    });
    nameIndex += 1;
  }
  // Currently processing
  entries.push({
    token: 'NLAMS-1038',
    farmerName: 'Anil Das',
    slot: '10:00',
    produce: 'Highways',
    status: 'Processing',
  });
  // Waiting ahead of the demo claimant
  entries.push({
    token: 'NLAMS-1039',
    farmerName: 'Priya Devi',
    slot: '10:30',
    produce: 'Highways',
    status: 'Waiting',
  });
  entries.push({
    token: 'NLAMS-1040',
    farmerName: 'Jose Mathew',
    slot: '10:30',
    produce: 'Irrigation',
    status: 'Waiting',
  });
  entries.push({
    token: 'NLAMS-1041',
    farmerName: 'Lakshmi Amma',
    slot: '10:30',
    produce: 'Highways',
    status: 'Waiting',
  });
  // The demo claimant's own token
  entries.push({
    token: DEMO_TOKEN,
    farmerName: demoFarmer.name,
    slot: '10:30',
    produce: 'Highways',
    status: 'Waiting',
  });
  // Behind the demo claimant
  entries.push({
    token: 'NLAMS-1043',
    farmerName: 'Suresh Nair',
    slot: '10:30',
    produce: 'Highways',
    status: 'Waiting',
  });
  entries.push({
    token: 'NLAMS-1044',
    farmerName: 'Binu Varghese',
    slot: '11:00',
    produce: 'Urban Infra',
    status: 'Waiting',
  });
  entries.push({
    token: 'NLAMS-1045',
    farmerName: 'Shaji P Panicker',
    slot: '11:00',
    produce: 'Energy',
    status: 'Waiting',
  });

  return { entries, lastUpdated: Date.now() };
}

export function buildAllQueues(): Record<string, CentreQueue> {
  const queues: Record<string, CentreQueue> = {};
  procurementCentres.forEach((centre, index) => {
    queues[centre.id] = seedQueueForCentre(index, centre.id);
  });
  return queues;
}

/** Next token number issued at a centre (based on the highest seeded token). */
export function nextTokenForCentre(centreId: string): string {
  if (centreId === 'c1') return 'NLAMS-1046';
  const centreIndex = procurementCentres.findIndex((c) => c.id === centreId);
  const base = 2100 + centreIndex * 40;
  return `NLAMS-${base + 6}`;
}

// --------------------------------------------------------------- bookings

function minutesAgo(minutes: number): number {
  return Date.now() - minutes * 60 * 1000;
}

export const demoBooking: Booking = {
  id: 'NLAMS-PROP-48291',
  token: DEMO_TOKEN,
  farmerId: DEMO_FARMER_ID,
  farmerName: demoFarmer.name,
  centreId: 'c1',
  centreName: 'Kottayam Land Acquisition Cell',
  date: todayISO(),
  slotStart: '10:30',
  slotEnd: '11:00',
  produce: 'Highways',
  quantityKg: '850',
  status: 'Waiting',
  arrived: true,
  createdAt: minutesAgo(240),
};

export const pastBookings: Booking[] = [
  {
    id: 'NLAMS-PROP-47110',
    token: 'NLAMS-0987',
    farmerId: DEMO_FARMER_ID,
    farmerName: demoFarmer.name,
    centreId: 'c1',
    centreName: 'Kottayam Land Acquisition Cell',
    date: addDaysISO(todayISO(), -8),
    slotStart: '09:00',
    slotEnd: '09:30',
    produce: 'Highways',
    quantityKg: '760',
    status: 'Completed',
    arrived: true,
    createdAt: minutesAgo(60 * 24 * 9),
  },
  {
    id: 'NLAMS-PROP-46204',
    token: 'NLAMS-0812',
    farmerId: DEMO_FARMER_ID,
    farmerName: demoFarmer.name,
    centreId: 'c2',
    centreName: 'Changanassery Land Acquisition Cell',
    date: addDaysISO(todayISO(), -15),
    slotStart: '11:00',
    slotEnd: '11:30',
    produce: 'Urban Infra',
    quantityKg: '420',
    status: 'Completed',
    arrived: true,
    createdAt: minutesAgo(60 * 24 * 16),
  },
  {
    id: 'NLAMS-PROP-45980',
    token: 'NLAMS-0633',
    farmerId: DEMO_FARMER_ID,
    farmerName: demoFarmer.name,
    centreId: 'c1',
    centreName: 'Kottayam Land Acquisition Cell',
    date: addDaysISO(todayISO(), -22),
    slotStart: '13:30',
    slotEnd: '14:00',
    produce: 'Irrigation',
    quantityKg: '300',
    status: 'Cancelled',
    arrived: false,
    createdAt: minutesAgo(60 * 24 * 23),
  },
];

export const initialBookings: Booking[] = [demoBooking, ...pastBookings];

// ---------------------------------------------------------- notifications

export const initialNotifications: AppNotification[] = [
  {
    id: 'n1',
    title: 'Land proposal acknowledged',
    message: 'Your land proposal has been acknowledged for Kottayam land acquisition cell.',
    type: 'success',
    timestamp: minutesAgo(12),
    read: false,
  },
  {
    id: 'n2',
    title: 'Project PRJ-2026-001 stage advanced',
    message: 'NH-66 corridor moved to Possession stage. Review pending parcels in the GIS map.',
    type: 'info',
    timestamp: minutesAgo(35),
    read: false,
  },
  {
    id: 'n3',
    title: 'Possession milestone delayed',
    message:
      'Possession at Kottayam corridor cell is delayed by approximately 20 days pending utility shifting.',
    type: 'warning',
    timestamp: minutesAgo(90),
    read: false,
  },
  {
    id: 'n4',
    title: 'Claims & objections reminder',
    message: 'Titleholders should keep revenue title records and registered mobile active for Section 11 claims.',
    type: 'info',
    timestamp: minutesAgo(60 * 26),
    read: true,
  },
  {
    id: 'n5',
    title: 'Previous award disbursed',
    message: 'Your award on 21 August 2026 (NLAMS-0987) has been disbursed via DBT.',
    type: 'success',
    timestamp: minutesAgo(60 * 24 * 8),
    read: true,
  },
];

// -------------------------------------------------------------- analytics

export type HourlyStat = { label: string; value: number };

export const hourlyProcessed: HourlyStat[] = [
  { label: '8–9', value: 14 },
  { label: '9–10', value: 19 },
  { label: '10–11', value: 26 },
  { label: '11–12', value: 22 },
  { label: '12–13', value: 11 },
  { label: '13–14', value: 9 },
  { label: '14–15', value: 16 },
  { label: '15–16', value: 12 },
];

export const hourlyAvgWait: HourlyStat[] = [
  { label: '8–9', value: 12 },
  { label: '9–10', value: 18 },
  { label: '10–11', value: 34 },
  { label: '11–12', value: 29 },
  { label: '12–13', value: 15 },
  { label: '13–14', value: 9 },
  { label: '14–15', value: 21 },
  { label: '15–16', value: 14 },
];

export const volumeByCrop: HourlyStat[] = [
  { label: 'Highways', value: 146 },
  { label: 'Irrigation', value: 58 },
  { label: 'Urban Infra', value: 37 },
  { label: 'Energy', value: 24 },
  { label: 'Industrial', value: 12 },
];

export const analyticsSummary = {
  farmersProcessed: 129,
  avgWaitMinutes: 24,
  volumeQuintals: 277,
  capacityUsedPercent: 86,
  peakHour: '10:00 – 11:00 AM',
};

// ------------------------------------------------------------- estimation

/** Rough per-farmer processing time used to estimate waits (minutes). */
export const MINUTES_PER_FARMER = 7;

// ---------------------------------------------------------------- helpers

export function slotAvailability(slot: Slot): SlotAvailability {
  if (slot.closed) return 'Closed';
  if (slot.booked >= slot.capacity) return 'Full';
  if (slot.capacity - slot.booked <= 3) return 'Almost Full';
  return 'Available';
}

export function findSlot(slots: Slot[], id: string): Slot | undefined {
  return slots.find((s) => s.id === id);
}





