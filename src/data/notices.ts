/**
 * Portal notices, shared by the Notices page and the home notice board.
 * In production this list comes from the FastAPI backend; here it is static
 * sample content, so both screens always show the same set.
 */
export type PortalNotice = {
  title: string;
  date: string;
  dept: string;
  /** Optional highlight chip, e.g. "New". */
  tag: string | null;
};

export const PORTAL_NOTICES: PortalNotice[] = [
  {
    title: 'Procurement schedule updated for the current cycle',
    date: '29 Aug 2026',
    dept: 'Department of Consumer Affairs',
    tag: 'NEW',
  },
  {
    title: 'Slot booking opened for Kottayam procurement centre',
    date: '28 Aug 2026',
    dept: 'Department of Consumer Affairs',
    tag: null,
  },
  {
    title: 'Guidelines for bringing produce to procurement centres',
    date: '25 Aug 2026',
    dept: 'Department of Consumer Affairs',
    tag: null,
  },
  {
    title: 'Registration portal scheduled maintenance notice',
    date: '20 Aug 2026',
    dept: 'Department of Consumer Affairs',
    tag: null,
  },
  {
    title: 'Revised daily capacity for major procurement centres',
    date: '15 Aug 2026',
    dept: 'Department of Consumer Affairs',
    tag: null,
  },
  {
    title: 'Advisory: Carry booking token (print or mobile) to the centre',
    date: '10 Aug 2026',
    dept: 'Department of Consumer Affairs',
    tag: null,
  },
];
