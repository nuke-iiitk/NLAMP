import type { Href } from 'expo-router';

/**
 * Route map for National Land Acquisition & Management System (NLAMS)
 * Maps old and new route aliases seamlessly.
 */
export const path = {
  home: '/' as Href,
  dashboard: '/dashboard' as Href,
  projects: '/centres' as Href, // National Projects listing & detail
  parcels: '/marketplace' as Href, // Land Parcels
  workflow: '/how-it-works' as Href, // Acquisition Workflow
  gis: '/queue' as Href, // National Land Acquisition Map & GIS
  awards: '/pools' as Href, // Awards (Section 23, 26-30)
  compensation: '/payments' as Href, // Compensation Dashboard
  possession: '/status' as Href, // Possession Tracker
  rr: '/offers' as Href, // Rehabilitation & Resettlement
  documents: '/notices' as Href, // Document Management
  reports: '/prices' as Href, // Reports & Analytics
  alerts: '/notifications' as Href, // Statutory & Milestones Alerts
  proposal: '/booking' as Href, // Proposal Submission Wizard
  about: '/about' as Href, // System Architecture & Act Reference
  help: '/help' as Href, // User Manual & RFCTLARR Legal Help
  login: '/login' as Href, // Officer / Authority Login
  register: '/register' as Href, // Agency & Department Registration
  profile: '/profile' as Href, // Role Profile & Node Configuration
  officialDashboard: '/official' as Href,
  officialLogin: '/official/login' as Href,
  officialQueue: '/official/queue' as Href,
  officialOps: '/official/ops' as Href,
  administration: '/buyer' as Href, // System Administration & role management

  // Backward compatibility alias keys
  centres: '/centres' as Href,
  prices: '/prices' as Href,
  marketplace: '/marketplace' as Href,
  pools: '/pools' as Href,
  offers: '/offers' as Href,
  buyer: '/buyer' as Href,
  payments: '/payments' as Href,
  booking: '/booking' as Href,
  queue: '/queue' as Href,
  bookings: '/bookings' as Href,
  status: '/status' as Href,
  notifications: '/notifications' as Href,
  notices: '/notices' as Href,
  howItWorks: '/how-it-works' as Href,
};


