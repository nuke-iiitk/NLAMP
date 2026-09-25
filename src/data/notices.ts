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
    title: 'Land acquisition schedule updated for the current phase',
    date: '29 Aug 2026',
    dept: 'Department of Land Resources',
    tag: 'NEW',
  },
  {
    title: 'Field verification slots opened at Kottayam District Land Acquisition Office',
    date: '28 Aug 2026',
    dept: 'Department of Land Resources',
    tag: null,
  },
  {
    title: 'Guidelines for document submission at District Land Offices',
    date: '25 Aug 2026',
    dept: 'Department of Land Resources',
    tag: null,
  },
  {
    title: 'Registration portal scheduled maintenance notice',
    date: '20 Aug 2026',
    dept: 'Department of Land Resources',
    tag: null,
  },
  {
    title: 'Revised daily capacity for major District Land Acquisition Offices',
    date: '15 Aug 2026',
    dept: 'Department of Land Resources',
    tag: null,
  },
  {
    title: 'Advisory: Carry case token (print or mobile) to the office',
    date: '10 Aug 2026',
    dept: 'Department of Land Resources',
    tag: null,
  },
];
