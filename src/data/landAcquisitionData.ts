/**
 * Realistic Mock Data for National Land Acquisition & Management System (NLAMS)
 * RFCTLARR Act 2013 compliant workflows, projects, parcels, compensation, possession, R&R.
 */

export type UserRole =
  | 'Central Ministry'
  | 'State Government'
  | 'District Authority'
  | 'Project Implementing Agency'
  | 'Policy Maker';

export type AcquisitionStage =
  | 'Proposal'
  | 'Scrutiny'
  | 'Approval'
  | 'Notification'
  | 'Award'
  | 'Compensation'
  | 'Possession'
  | 'R&R'
  | 'Closure';

export type ProjectStatus = 'Active' | 'Delayed' | 'Completed' | 'Pending Approval';
export type ParcelStatus =
  | 'Identified'
  | 'Surveyed'
  | 'Notified (Sec 11)'
  | 'Award Declared (Sec 23)'
  | 'Compensation Disbursed'
  | 'Possession Taken'
  | 'Transferred';

export interface LandProject {
  id: string;
  code: string;
  name: string;
  sector: 'Highways' | 'Railways' | 'Energy' | 'Industrial' | 'Irrigation' | 'Urban Infra';
  agency: string;
  state: string;
  district: string;
  tehsil: string;
  landProposedHa: number;
  landAcquiredHa: number;
  areaNotifiedHa: number;
  compensationBudgetCr: number;
  compensationDisbursedCr: number;
  affectedFamilies: number;
  displacedFamilies: number;
  possessionPercent: number;
  rrPercent: number;
  currentStage: AcquisitionStage;
  status: ProjectStatus;
  timelineMonths: number;
  startDate: string;
  targetDate: string;
  lat: number;
  lng: number;
  description: string;
}

export interface LandParcel {
  id: string;
  surveyNumber: string;
  projectId: string;
  projectName: string;
  state: string;
  district: string;
  tehsil: string;
  village: string;
  landType: 'Agricultural' | 'Commercial' | 'Residential' | 'Government/Forest';
  areaHa: number;
  landownersCount: number;
  acquisitionStatus: ParcelStatus;
  compensationStatus: 'Assessed' | 'Approved' | 'Disbursed' | 'Pending';
  compensationAmountLakhs: number;
  possessionStatus: 'Pending' | 'Notice Issued' | 'Possession Taken';
  rrStatus: 'Not Applicable' | 'Survey Done' | 'Package Approved' | 'Rehabilitated';
  currentStage: AcquisitionStage;
  coordinates: [number, number];
}

export interface CompensationRecord {
  id: string;
  awardNo: string;
  projectId: string;
  projectName: string;
  beneficiaryName: string;
  aadhaarMasked: string;
  surveyNumber: string;
  village: string;
  district: string;
  state: string;
  assessedAmountLakhs: number;
  solatiumLakhs: number;
  totalApprovedLakhs: number;
  disbursedAmountLakhs: number;
  status: 'Disbursed' | 'Approved' | 'Under Scrutiny' | 'Disputed/Escrow';
  bankRef: string;
  disbursementDate: string;
}

export interface RRRecord {
  id: string;
  projectId: string;
  projectName: string;
  familyHead: string;
  membersCount: number;
  category: 'SC' | 'ST' | 'OBC' | 'General';
  village: string;
  district: string;
  state: string;
  entitlementHouseAllotted: boolean;
  grantDisbursedLakhs: number;
  employmentStatus: 'Provided' | 'One-time Annuity' | 'Pending';
  rehabilitationStatus: 'Completed' | 'In Progress' | 'Pending';
  resettlementStatus: 'Shifted' | 'Plot Allotted' | 'Pending';
}

export interface ProjectAlert {
  id: string;
  type: 'Critical' | 'Warning' | 'Information' | 'Success';
  title: string;
  message: string;
  projectId?: string;
  date: string;
  stage?: AcquisitionStage;
}

export interface LandDocument {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  type: 'Notification' | 'Award' | 'Legal' | 'Compensation' | 'Map' | 'R&R' | 'Project Document';
  version: string;
  date: string;
  status: 'Verified' | 'Pending Verification' | 'Archived';
  fileSize: string;
}

export interface WorkflowStageStats {
  stage: AcquisitionStage;
  label: string;
  totalCases: number;
  completed: number;
  pending: number;
  delayed: number;
  rfctlarrSec: string;
}

export const MOCK_PROJECTS: LandProject[] = [
  {
    id: 'PRJ-2026-001',
    code: 'NH-66-EXP',
    name: 'NH-66 6-Lane Coastal Expansion Corridor',
    sector: 'Highways',
    agency: 'National Highways Authority of India (NHAI)',
    state: 'Kerala',
    district: 'Kottayam',
    tehsil: 'Changanassery',
    landProposedHa: 245.0,
    landAcquiredHa: 182.5,
    areaNotifiedHa: 245.0,
    compensationBudgetCr: 84.2,
    compensationDisbursedCr: 62.3,
    affectedFamilies: 620,
    displacedFamilies: 180,
    possessionPercent: 74,
    rrPercent: 68,
    currentStage: 'Possession',
    status: 'Active',
    timelineMonths: 24,
    startDate: '2024-03-15',
    targetDate: '2026-06-30',
    lat: 9.5916,
    lng: 76.5222,
    description: 'Widening of NH-66 to 6-lane configuration with service roads and multi-modal transit junctions.',
  },
  {
    id: 'PRJ-2026-002',
    code: 'DFC-WEST-04',
    name: 'Western Dedicated Freight Corridor (Ph-II)',
    sector: 'Railways',
    agency: 'Dedicated Freight Corridor Corp. of India (DFCCIL)',
    state: 'Maharashtra',
    district: 'Palghar',
    tehsil: 'Dahanu',
    landProposedHa: 410.0,
    landAcquiredHa: 360.0,
    areaNotifiedHa: 410.0,
    compensationBudgetCr: 142.8,
    compensationDisbursedCr: 135.0,
    affectedFamilies: 890,
    displacedFamilies: 240,
    possessionPercent: 88,
    rrPercent: 82,
    currentStage: 'R&R',
    status: 'Active',
    timelineMonths: 36,
    startDate: '2023-08-10',
    targetDate: '2026-12-31',
    lat: 19.6967,
    lng: 72.7699,
    description: 'High-speed heavy freight rail route connecting JNPT Mumbai to Dadri multimodal logistics hub.',
  },
  {
    id: 'PRJ-2026-003',
    code: 'DMIC-AUR-NOD',
    name: 'Delhi-Mumbai Industrial Corridor (Shendra Node)',
    sector: 'Industrial',
    agency: 'NICDIT & Maharashtra Industrial Dev Corp',
    state: 'Maharashtra',
    district: 'Chhatrapati Sambhajinagar',
    tehsil: 'Shendra',
    landProposedHa: 520.0,
    landAcquiredHa: 312.0,
    areaNotifiedHa: 450.0,
    compensationBudgetCr: 198.5,
    compensationDisbursedCr: 112.4,
    affectedFamilies: 1140,
    displacedFamilies: 310,
    possessionPercent: 60,
    rrPercent: 54,
    currentStage: 'Compensation',
    status: 'Delayed',
    timelineMonths: 30,
    startDate: '2023-11-01',
    targetDate: '2026-09-30',
    lat: 19.8762,
    lng: 75.3433,
    description: 'Smart city industrial manufacturing zone with dedicated freight feeder logistics and green corridors.',
  },
  {
    id: 'PRJ-2026-004',
    code: 'SOL-BHAD-07',
    name: 'Bhadla Ultra-Mega Solar Park Expansion',
    sector: 'Energy',
    agency: 'Solar Energy Corporation of India (SECI)',
    state: 'Rajasthan',
    district: 'Jodhpur',
    tehsil: 'Phalodi',
    landProposedHa: 680.0,
    landAcquiredHa: 680.0,
    areaNotifiedHa: 680.0,
    compensationBudgetCr: 94.6,
    compensationDisbursedCr: 94.6,
    affectedFamilies: 320,
    displacedFamilies: 45,
    possessionPercent: 100,
    rrPercent: 96,
    currentStage: 'Closure',
    status: 'Completed',
    timelineMonths: 18,
    startDate: '2023-01-10',
    targetDate: '2025-08-30',
    lat: 27.5398,
    lng: 71.9161,
    description: 'Renewable power park development with battery energy storage system grid substations.',
  },
];

export const MOCK_PROJECTS_MORE: LandProject[] = [
  {
    id: 'PRJ-2026-005',
    code: 'KALE-IRR-09',
    name: 'Kaleshwaram Lift Irrigation Canal Link Ph-3',
    sector: 'Irrigation',
    agency: 'Irrigation & CAD Department, Govt of Telangana',
    state: 'Telangana',
    district: 'Karimnagar',
    tehsil: 'Manakondur',
    landProposedHa: 380.0,
    landAcquiredHa: 235.0,
    areaNotifiedHa: 380.0,
    compensationBudgetCr: 126.4,
    compensationDisbursedCr: 88.0,
    affectedFamilies: 950,
    displacedFamilies: 210,
    possessionPercent: 62,
    rrPercent: 58,
    currentStage: 'Award',
    status: 'Active',
    timelineMonths: 28,
    startDate: '2024-01-20',
    targetDate: '2026-11-30',
    lat: 18.4386,
    lng: 79.1288,
    description: 'Gravity canal system and distributary network providing assured irrigation for 1.2 lakh acres.',
  },
  {
    id: 'PRJ-2026-006',
    code: 'BLR-MET-PH3',
    name: 'Bengaluru Metro Rail Phase-3 Outer Ring Road',
    sector: 'Urban Infra',
    agency: 'Bangalore Metro Rail Corporation Ltd (BMRCL)',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    tehsil: 'Bengaluru South',
    landProposedHa: 95.0,
    landAcquiredHa: 48.0,
    areaNotifiedHa: 80.0,
    compensationBudgetCr: 175.0,
    compensationDisbursedCr: 84.5,
    affectedFamilies: 410,
    displacedFamilies: 130,
    possessionPercent: 50,
    rrPercent: 45,
    currentStage: 'Notification',
    status: 'Delayed',
    timelineMonths: 36,
    startDate: '2024-05-01',
    targetDate: '2027-05-31',
    lat: 12.9716,
    lng: 77.5946,
    description: 'Elevated rapid transit corridor along Silk Board to KR Puram with multi-modal interchange hubs.',
  },
  {
    id: 'PRJ-2026-007',
    code: 'DEL-AMR-EXP',
    name: 'Delhi-Amritsar-Katra Expressway Section IV',
    sector: 'Highways',
    agency: 'National Highways Authority of India (NHAI)',
    state: 'Punjab',
    district: 'Ludhiana',
    tehsil: 'Samrala',
    landProposedHa: 340.0,
    landAcquiredHa: 290.0,
    areaNotifiedHa: 340.0,
    compensationBudgetCr: 110.5,
    compensationDisbursedCr: 98.2,
    affectedFamilies: 780,
    displacedFamilies: 110,
    possessionPercent: 85,
    rrPercent: 78,
    currentStage: 'Possession',
    status: 'Active',
    timelineMonths: 24,
    startDate: '2024-02-10',
    targetDate: '2026-08-31',
    lat: 30.901,
    lng: 75.8573,
    description: 'Access-controlled greenfield expressway boosting freight connectivity between economic centers.',
  },
  {
    id: 'PRJ-2026-008',
    code: 'VIZ-PORT-EVAC',
    name: 'Visakhapatnam Port Cargo Rail-Road Link',
    sector: 'Urban Infra',
    agency: 'Visakhapatnam Port Authority & Sagarmala',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    tehsil: 'Gajuwaka',
    landProposedHa: 130.0,
    landAcquiredHa: 42.0,
    areaNotifiedHa: 95.0,
    compensationBudgetCr: 68.0,
    compensationDisbursedCr: 21.0,
    affectedFamilies: 280,
    displacedFamilies: 90,
    possessionPercent: 32,
    rrPercent: 28,
    currentStage: 'Scrutiny',
    status: 'Pending Approval',
    timelineMonths: 20,
    startDate: '2024-08-01',
    targetDate: '2026-10-31',
    lat: 17.6868,
    lng: 83.2185,
    description: 'Dedicated heavy port-connectivity link bypassing urban congestion under PM GatiShakti.',
  },
];

export const ALL_PROJECTS: LandProject[] = [...MOCK_PROJECTS, ...MOCK_PROJECTS_MORE];

export const MOCK_PARCELS: LandParcel[] = [
  {
    id: 'PCL-KL-KTM-0101',
    surveyNumber: '142/3A',
    projectId: 'PRJ-2026-001',
    projectName: 'NH-66 Coastal Expansion',
    state: 'Kerala',
    district: 'Kottayam',
    tehsil: 'Changanassery',
    village: 'Vazhappally',
    landType: 'Commercial',
    areaHa: 1.45,
    landownersCount: 4,
    acquisitionStatus: 'Possession Taken',
    compensationStatus: 'Disbursed',
    compensationAmountLakhs: 72.5,
    possessionStatus: 'Possession Taken',
    rrStatus: 'Rehabilitated',
    currentStage: 'Possession',
    coordinates: [9.589, 76.521],
  },
  {
    id: 'PCL-KL-KTM-0102',
    surveyNumber: '144/1B',
    projectId: 'PRJ-2026-001',
    projectName: 'NH-66 Coastal Expansion',
    state: 'Kerala',
    district: 'Kottayam',
    tehsil: 'Changanassery',
    village: 'Vazhappally',
    landType: 'Agricultural',
    areaHa: 2.1,
    landownersCount: 2,
    acquisitionStatus: 'Award Declared (Sec 23)',
    compensationStatus: 'Approved',
    compensationAmountLakhs: 48.0,
    possessionStatus: 'Notice Issued',
    rrStatus: 'Package Approved',
    currentStage: 'Award',
    coordinates: [9.593, 76.525],
  },
  {
    id: 'PCL-MH-PLG-0201',
    surveyNumber: '88/4',
    projectId: 'PRJ-2026-002',
    projectName: 'Western Dedicated Freight Corridor',
    state: 'Maharashtra',
    district: 'Palghar',
    tehsil: 'Dahanu',
    village: 'Gholvad',
    landType: 'Agricultural',
    areaHa: 3.8,
    landownersCount: 6,
    acquisitionStatus: 'Compensation Disbursed',
    compensationStatus: 'Disbursed',
    compensationAmountLakhs: 94.0,
    possessionStatus: 'Possession Taken',
    rrStatus: 'Rehabilitated',
    currentStage: 'R&R',
    coordinates: [19.702, 72.772],
  },
  {
    id: 'PCL-MH-CSN-0301',
    surveyNumber: '312/7',
    projectId: 'PRJ-2026-003',
    projectName: 'DMIC Shendra Node',
    state: 'Maharashtra',
    district: 'Chhatrapati Sambhajinagar',
    tehsil: 'Shendra',
    village: 'Jalna Road Belt',
    landType: 'Agricultural',
    areaHa: 5.6,
    landownersCount: 8,
    acquisitionStatus: 'Notified (Sec 11)',
    compensationStatus: 'Pending',
    compensationAmountLakhs: 135.0,
    possessionStatus: 'Pending',
    rrStatus: 'Survey Done',
    currentStage: 'Compensation',
    coordinates: [19.878, 75.348],
  },
  {
    id: 'PCL-RJ-JOD-0401',
    surveyNumber: '502/1',
    projectId: 'PRJ-2026-004',
    projectName: 'Bhadla Solar Park',
    state: 'Rajasthan',
    district: 'Jodhpur',
    tehsil: 'Phalodi',
    village: 'Bhadla North',
    landType: 'Government/Forest',
    areaHa: 12.0,
    landownersCount: 1,
    acquisitionStatus: 'Transferred',
    compensationStatus: 'Disbursed',
    compensationAmountLakhs: 42.0,
    possessionStatus: 'Possession Taken',
    rrStatus: 'Not Applicable',
    currentStage: 'Closure',
    coordinates: [27.542, 71.918],
  },
  {
    id: 'PCL-TG-KRM-0501',
    surveyNumber: '215/2C',
    projectId: 'PRJ-2026-005',
    projectName: 'Kaleshwaram Canal Ph-3',
    state: 'Telangana',
    district: 'Karimnagar',
    tehsil: 'Manakondur',
    village: 'Vemulawada Road',
    landType: 'Agricultural',
    areaHa: 4.25,
    landownersCount: 5,
    acquisitionStatus: 'Award Declared (Sec 23)',
    compensationStatus: 'Approved',
    compensationAmountLakhs: 86.4,
    possessionStatus: 'Notice Issued',
    rrStatus: 'Package Approved',
    currentStage: 'Award',
    coordinates: [18.441, 79.132],
  },
  {
    id: 'PCL-KA-BLR-0601',
    surveyNumber: '64/1',
    projectId: 'PRJ-2026-006',
    projectName: 'Bengaluru Metro Ph-3',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    tehsil: 'Bengaluru South',
    village: 'Bellandur Ring Road',
    landType: 'Commercial',
    areaHa: 0.85,
    landownersCount: 3,
    acquisitionStatus: 'Notified (Sec 11)',
    compensationStatus: 'Pending',
    compensationAmountLakhs: 145.0,
    possessionStatus: 'Pending',
    rrStatus: 'Survey Done',
    currentStage: 'Notification',
    coordinates: [12.973, 77.597],
  },
  {
    id: 'PCL-PB-LDH-0701',
    surveyNumber: '91/5A',
    projectId: 'PRJ-2026-007',
    projectName: 'Delhi-Amritsar Expressway',
    state: 'Punjab',
    district: 'Ludhiana',
    tehsil: 'Samrala',
    village: 'Machhiwara Bypass',
    landType: 'Agricultural',
    areaHa: 3.1,
    landownersCount: 4,
    acquisitionStatus: 'Possession Taken',
    compensationStatus: 'Disbursed',
    compensationAmountLakhs: 82.0,
    possessionStatus: 'Possession Taken',
    rrStatus: 'Rehabilitated',
    currentStage: 'Possession',
    coordinates: [30.905, 75.861],
  },
];

export const MOCK_COMPENSATION: CompensationRecord[] = [
  {
    id: 'CMP-2026-801',
    awardNo: 'AWD/KL/NH66/2025/14',
    projectId: 'PRJ-2026-001',
    projectName: 'NH-66 Coastal Expansion',
    beneficiaryName: 'K. S. Narayanan Namboothiri',
    aadhaarMasked: 'XXXX-XXXX-4192',
    surveyNumber: '142/3A',
    village: 'Vazhappally',
    district: 'Kottayam',
    state: 'Kerala',
    assessedAmountLakhs: 36.25,
    solatiumLakhs: 36.25,
    totalApprovedLakhs: 72.5,
    disbursedAmountLakhs: 72.5,
    status: 'Disbursed',
    bankRef: 'SBIN00249182910',
    disbursementDate: '2026-02-14',
  },
  {
    id: 'CMP-2026-802',
    awardNo: 'AWD/KL/NH66/2025/19',
    projectId: 'PRJ-2026-001',
    projectName: 'NH-66 Coastal Expansion',
    beneficiaryName: 'Mariamma Mathew',
    aadhaarMasked: 'XXXX-XXXX-7310',
    surveyNumber: '144/1B',
    village: 'Vazhappally',
    district: 'Kottayam',
    state: 'Kerala',
    assessedAmountLakhs: 24.0,
    solatiumLakhs: 24.0,
    totalApprovedLakhs: 48.0,
    disbursedAmountLakhs: 0.0,
    status: 'Approved',
    bankRef: 'Pending Treasury Cleared',
    disbursementDate: 'Pending',
  },
  {
    id: 'CMP-2026-803',
    awardNo: 'AWD/MH/DFC/2025/08',
    projectId: 'PRJ-2026-002',
    projectName: 'Western Dedicated Freight Corridor',
    beneficiaryName: 'Suresh Baban Patil',
    aadhaarMasked: 'XXXX-XXXX-8921',
    surveyNumber: '88/4',
    village: 'Gholvad',
    district: 'Palghar',
    state: 'Maharashtra',
    assessedAmountLakhs: 47.0,
    solatiumLakhs: 47.0,
    totalApprovedLakhs: 94.0,
    disbursedAmountLakhs: 94.0,
    status: 'Disbursed',
    bankRef: 'MAHB0001290334',
    disbursementDate: '2026-01-28',
  },
  {
    id: 'CMP-2026-804',
    awardNo: 'AWD/MH/DMIC/2026/02',
    projectId: 'PRJ-2026-003',
    projectName: 'DMIC Shendra Node',
    beneficiaryName: 'Ganesh Pandurang Shinde',
    aadhaarMasked: 'XXXX-XXXX-5541',
    surveyNumber: '312/7',
    village: 'Jalna Road Belt',
    district: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    assessedAmountLakhs: 67.5,
    solatiumLakhs: 67.5,
    totalApprovedLakhs: 135.0,
    disbursedAmountLakhs: 0.0,
    status: 'Under Scrutiny',
    bankRef: 'Awaiting SLAO Approval',
    disbursementDate: 'Pending',
  },
  {
    id: 'CMP-2026-805',
    awardNo: 'AWD/TG/KAL/2025/44',
    projectId: 'PRJ-2026-005',
    projectName: 'Kaleshwaram Canal Ph-3',
    beneficiaryName: 'M. Thirupathi Reddy',
    aadhaarMasked: 'XXXX-XXXX-3388',
    surveyNumber: '215/2C',
    village: 'Vemulawada Road',
    district: 'Karimnagar',
    state: 'Telangana',
    assessedAmountLakhs: 43.2,
    solatiumLakhs: 43.2,
    totalApprovedLakhs: 86.4,
    disbursedAmountLakhs: 86.4,
    status: 'Disbursed',
    bankRef: 'APGV0009823101',
    disbursementDate: '2026-02-02',
  },
  {
    id: 'CMP-2026-806',
    awardNo: 'AWD/PB/EXP/2025/11',
    projectId: 'PRJ-2026-007',
    projectName: 'Delhi-Amritsar Expressway',
    beneficiaryName: 'Harpreet Singh Dhillon',
    aadhaarMasked: 'XXXX-XXXX-6120',
    surveyNumber: '91/5A',
    village: 'Machhiwara Bypass',
    district: 'Ludhiana',
    state: 'Punjab',
    assessedAmountLakhs: 41.0,
    solatiumLakhs: 41.0,
    totalApprovedLakhs: 82.0,
    disbursedAmountLakhs: 82.0,
    status: 'Disbursed',
    bankRef: 'PUNB0044192801',
    disbursementDate: '2026-01-19',
  },
];

export const MOCK_RR: RRRecord[] = [
  {
    id: 'RR-2026-101',
    projectId: 'PRJ-2026-001',
    projectName: 'NH-66 Coastal Expansion',
    familyHead: 'K. S. Narayanan Namboothiri',
    membersCount: 4,
    category: 'General',
    village: 'Vazhappally',
    district: 'Kottayam',
    state: 'Kerala',
    entitlementHouseAllotted: true,
    grantDisbursedLakhs: 5.5,
    employmentStatus: 'One-time Annuity',
    rehabilitationStatus: 'Completed',
    resettlementStatus: 'Shifted',
  },
  {
    id: 'RR-2026-102',
    projectId: 'PRJ-2026-002',
    projectName: 'Western Dedicated Freight Corridor',
    familyHead: 'Suresh Baban Patil',
    membersCount: 5,
    category: 'OBC',
    village: 'Gholvad',
    district: 'Palghar',
    state: 'Maharashtra',
    entitlementHouseAllotted: true,
    grantDisbursedLakhs: 6.0,
    employmentStatus: 'Provided',
    rehabilitationStatus: 'Completed',
    resettlementStatus: 'Shifted',
  },
  {
    id: 'RR-2026-103',
    projectId: 'PRJ-2026-003',
    projectName: 'DMIC Shendra Node',
    familyHead: 'Bhikaji Ramrao Wagh',
    membersCount: 6,
    category: 'ST',
    village: 'Jalna Road Belt',
    district: 'Chhatrapati Sambhajinagar',
    state: 'Maharashtra',
    entitlementHouseAllotted: false,
    grantDisbursedLakhs: 2.0,
    employmentStatus: 'Pending',
    rehabilitationStatus: 'In Progress',
    resettlementStatus: 'Plot Allotted',
  },
  {
    id: 'RR-2026-104',
    projectId: 'PRJ-2026-005',
    projectName: 'Kaleshwaram Canal Ph-3',
    familyHead: 'G. Mallaiah Goud',
    membersCount: 4,
    category: 'OBC',
    village: 'Vemulawada Road',
    district: 'Karimnagar',
    state: 'Telangana',
    entitlementHouseAllotted: true,
    grantDisbursedLakhs: 5.0,
    employmentStatus: 'One-time Annuity',
    rehabilitationStatus: 'Completed',
    resettlementStatus: 'Shifted',
  },
  {
    id: 'RR-2026-105',
    projectId: 'PRJ-2026-006',
    projectName: 'Bengaluru Metro Ph-3',
    familyHead: 'Venkatesh Murthy',
    membersCount: 3,
    category: 'General',
    village: 'Bellandur Ring Road',
    district: 'Bengaluru Urban',
    state: 'Karnataka',
    entitlementHouseAllotted: false,
    grantDisbursedLakhs: 1.5,
    employmentStatus: 'Pending',
    rehabilitationStatus: 'In Progress',
    resettlementStatus: 'Pending',
  },
];

export const MOCK_ALERTS: ProjectAlert[] = [
  {
    id: 'ALT-1',
    type: 'Critical',
    title: 'Statutory deadline approaching (Sec 25 Award declaration)',
    message: 'DMIC Shendra Node requires Section 23/25 Award declaration within 14 days to prevent notification lapse.',
    projectId: 'PRJ-2026-003',
    date: 'Today, 09:30 AM',
    stage: 'Award',
  },
  {
    id: 'ALT-2',
    type: 'Warning',
    title: 'Compensation pending disbursement in Kottayam',
    message: 'Rs 21.9 Cr sanctioned under Section 19 notification remains undisbursed across 14 affected titleholders.',
    projectId: 'PRJ-2026-001',
    date: 'Yesterday, 04:15 PM',
    stage: 'Compensation',
  },
  {
    id: 'ALT-3',
    type: 'Warning',
    title: 'Possession delayed due to pending utility relocation',
    message: 'Bengaluru Metro Phase-3 Section II has 47 hectares delayed beyond planned quarter.',
    projectId: 'PRJ-2026-006',
    date: '22 Feb 2026',
    stage: 'Possession',
  },
  {
    id: 'ALT-4',
    type: 'Information',
    title: 'Preliminary Notification (Section 11) published in Gazette',
    message: 'Visakhapatnam Port Cargo link published in state official gazette and 2 daily regional newspapers.',
    projectId: 'PRJ-2026-008',
    date: '20 Feb 2026',
    stage: 'Notification',
  },
  {
    id: 'ALT-5',
    type: 'Success',
    title: 'R&R Resettlement Colony handed over to 240 displaced families',
    message: 'Western DFC Dahanu sector milestone completed with water and electrification certificates.',
    projectId: 'PRJ-2026-002',
    date: '18 Feb 2026',
    stage: 'R&R',
  },
];

export const MOCK_DOCUMENTS: LandDocument[] = [
  {
    id: 'DOC-101',
    name: 'Section 11(1) Preliminary Notification Gazette Copy',
    projectId: 'PRJ-2026-001',
    projectName: 'NH-66 Coastal Expansion',
    type: 'Notification',
    version: 'v1.2',
    date: '12 Jan 2025',
    status: 'Verified',
    fileSize: '3.4 MB',
  },
  {
    id: 'DOC-102',
    name: 'Section 19 Declaration of Land Required for Public Purpose',
    projectId: 'PRJ-2026-001',
    projectName: 'NH-66 Coastal Expansion',
    type: 'Notification',
    version: 'v2.0',
    date: '04 Jun 2025',
    status: 'Verified',
    fileSize: '4.8 MB',
  },
  {
    id: 'DOC-103',
    name: 'Comprehensive Award Statement (Sec 23, 26-30)',
    projectId: 'PRJ-2026-002',
    projectName: 'Western Dedicated Freight Corridor',
    type: 'Award',
    version: 'v1.0',
    date: '15 Sep 2025',
    status: 'Verified',
    fileSize: '8.2 MB',
  },
  {
    id: 'DOC-104',
    name: 'High Court Writ Petition Interim Direction Compliance',
    projectId: 'PRJ-2026-003',
    projectName: 'DMIC Shendra Node',
    type: 'Legal',
    version: 'v1.1',
    date: '18 Nov 2025',
    status: 'Verified',
    fileSize: '1.9 MB',
  },
  {
    id: 'DOC-105',
    name: 'Direct Benefit Transfer (DBT) Compensation Disbursal Sheet',
    projectId: 'PRJ-2026-004',
    projectName: 'Bhadla Solar Park',
    type: 'Compensation',
    version: 'v3.0',
    date: '10 Dec 2025',
    status: 'Verified',
    fileSize: '5.1 MB',
  },
  {
    id: 'DOC-106',
    name: 'Cadastral & Drone Photogrammetry GIS Map Overlay',
    projectId: 'PRJ-2026-005',
    projectName: 'Kaleshwaram Canal Ph-3',
    type: 'Map',
    version: 'v2.4',
    date: '22 Jan 2026',
    status: 'Verified',
    fileSize: '14.2 MB',
  },
  {
    id: 'DOC-107',
    name: 'Approved Rehabilitation & Resettlement (R&R) Scheme',
    projectId: 'PRJ-2026-002',
    projectName: 'Western Dedicated Freight Corridor',
    type: 'R&R',
    version: 'v1.0',
    date: '08 Aug 2025',
    status: 'Verified',
    fileSize: '6.7 MB',
  },
  {
    id: 'DOC-108',
    name: 'Detailed Project Report (DPR) & Alignment Proposal',
    projectId: 'PRJ-2026-008',
    projectName: 'Visakhapatnam Port Cargo Link',
    type: 'Project Document',
    version: 'v1.0',
    date: '15 Jan 2026',
    status: 'Pending Verification',
    fileSize: '11.5 MB',
  },
];

export const WORKFLOW_STAGES: WorkflowStageStats[] = [
  { stage: 'Proposal', label: 'Proposal Submission', totalCases: 42, completed: 34, pending: 8, delayed: 2, rfctlarrSec: 'Sec 4 (SIA)' },
  { stage: 'Scrutiny', label: 'Inter-Agency Scrutiny', totalCases: 38, completed: 31, pending: 7, delayed: 3, rfctlarrSec: 'Sec 7 (Expert Group)' },
  { stage: 'Approval', label: 'Competent Authority Approval', totalCases: 32, completed: 28, pending: 4, delayed: 1, rfctlarrSec: 'Sec 8' },
  { stage: 'Notification', label: 'Section 11 Preliminary Notification', totalCases: 28, completed: 22, pending: 6, delayed: 2, rfctlarrSec: 'Sec 11 & 15' },
  { stage: 'Award', label: 'Land Acquisition Award Declaration', totalCases: 24, completed: 18, pending: 6, delayed: 4, rfctlarrSec: 'Sec 23, 26-30' },
  { stage: 'Compensation', label: 'Direct Benefit Compensation Disbursal', totalCases: 21, completed: 15, pending: 6, delayed: 3, rfctlarrSec: 'Sec 77-80' },
  { stage: 'Possession', label: 'Physical Possession Taking', totalCases: 18, completed: 12, pending: 6, delayed: 2, rfctlarrSec: 'Sec 38 & 40' },
  { stage: 'R&R', label: 'Rehabilitation & Resettlement Award', totalCases: 16, completed: 11, pending: 5, delayed: 2, rfctlarrSec: 'Sec 31-42' },
  { stage: 'Closure', label: 'Project Handover & Cadastral Mutation', totalCases: 12, completed: 8, pending: 4, delayed: 1, rfctlarrSec: 'Revenue Records' },
];

export function getNationalSummary(role: UserRole, stateFilter?: string) {
  let list = ALL_PROJECTS;
  if (role === 'State Government' && stateFilter) {
    list = list.filter((p) => p.state === stateFilter);
  } else if (role === 'District Authority') {
    list = list.filter((p) => p.district === 'Kottayam' || p.district === 'Palghar');
  } else if (role === 'Project Implementing Agency') {
    list = list.filter((p) => p.agency.includes('NHAI'));
  }
  const totalProjects = list.length;
  const landProposed = list.reduce((acc, p) => acc + p.landProposedHa, 0);
  const landAcquired = list.reduce((acc, p) => acc + p.landAcquiredHa, 0);
  const areaNotified = list.reduce((acc, p) => acc + p.areaNotifiedHa, 0);
  const compensationDisbursed = list.reduce((acc, p) => acc + p.compensationDisbursedCr, 0);
  const affectedFamilies = list.reduce((acc, p) => acc + p.affectedFamilies, 0);
  const possessionAvg = Math.round(list.reduce((acc, p) => acc + p.possessionPercent, 0) / (totalProjects || 1));
  const rrAvg = Math.round(list.reduce((acc, p) => acc + p.rrPercent, 0) / (totalProjects || 1));
  return {
    totalProjects,
    landProposed: Math.round(landProposed),
    landAcquired: Math.round(landAcquired),
    areaNotified: Math.round(areaNotified),
    compensationDisbursed: Number(compensationDisbursed.toFixed(1)),
    affectedFamilies,
    possessionCompleted: possessionAvg + '%',
    rrProgress: rrAvg + '%',
  };
}
