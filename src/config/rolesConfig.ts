import type { AppRoute, UserRole } from '../types';

export interface RoleConfig {
  id: UserRole;
  number: number;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  scope: 'platform' | 'region' | 'hub' | 'reception' | 'queue' | 'equipment' | 'audit';
  scopeLabel: string;
  scopeLabelBn: string;
  clinicalWrite: boolean;
  isReadOnly: boolean;
  allowedRoutes: AppRoute[];
  capabilities: string[];
}

export const ROLES_CONFIG: Record<UserRole, RoleConfig> = {
  platform_super_admin: {
    id: 'platform_super_admin',
    number: 1,
    title: 'Platform Super Admin',
    titleBn: 'প্ল্যাটফর্ম সুপার অ্যাডমিন',
    description: 'পুরো Platform, Hub এবং Settings Manage',
    descriptionBn: 'পুরো প্ল্যাটফর্ম, হাব নেটওয়ার্ক এবং সিস্টেম সেটিংস পরিচালনা',
    scope: 'platform',
    scopeLabel: 'Entire Healora Infrastructure',
    scopeLabelBn: 'সম্পূর্ণ প্ল্যাটফর্ম অবকাঠামো',
    clinicalWrite: false,
    isReadOnly: false,
    allowedRoutes: [
      '/dashboard',
      '/hubs',
      '/regions',
      '/sessions',
      '/appointments',
      '/queue',
      '/patients',
      '/team',
      '/stations',
      '/equipment',
      '/encounters',
      '/exceptions',
      '/reports',
      '/notifications',
      '/settings',
      '/audit-logs',
      '/catalog',
    ],
    capabilities: [
      'Manage all physical hubs & regional demarcations',
      'Assign & revoke staff role permissions via API',
      'Configure platform-wide SLA & break-glass policies',
      'Access immutable audit logs & administrative reports',
    ],
  },
  regional_ops_manager: {
    id: 'regional_ops_manager',
    number: 2,
    title: 'Regional Operations Manager',
    titleBn: 'আঞ্চলিক পরিচালনা ব্যবস্থাপক',
    description: 'নির্দিষ্ট Region-এর Hubs ও Operations Manage',
    descriptionBn: 'নির্দিষ্ট প্রশাসনিক অঞ্চলের হাবসমূহ ও কার্যক্রম তদারকি',
    scope: 'region',
    scopeLabel: 'Assigned Administrative Region(s)',
    scopeLabelBn: 'বরাদ্দকৃত প্রশাসনিক অঞ্চল',
    clinicalWrite: false,
    isReadOnly: false,
    allowedRoutes: [
      '/dashboard',
      '/hubs',
      '/regions',
      '/sessions',
      '/team',
      '/encounters',
      '/exceptions',
      '/reports',
      '/notifications',
      '/catalog',
    ],
    capabilities: [
      'Manage multi-hub sessions and outreach camps in region',
      'Monitor regional capacity, wait-times and SLA bottlenecks',
      'Approve staff roster shifts and cross-hub allocations',
      'Handle regional clinical exceptions and emergency referral dispatch',
    ],
  },
  hub_manager: {
    id: 'hub_manager',
    number: 3,
    title: 'Hub Manager',
    titleBn: 'হাব অপারেশনস ম্যানেজার',
    description: 'নিজের Hub, Staff, Sessions ও Capacity Manage',
    descriptionBn: 'নিজের হাবের কর্মী, সেশন, সক্ষমতা ও সামগ্রিক কার্যক্রম পরিচালনা',
    scope: 'hub',
    scopeLabel: 'Assigned Physical Hub Only',
    scopeLabelBn: 'নির্দিষ্ট ফিজিক্যাল হাব',
    clinicalWrite: false,
    isReadOnly: false,
    allowedRoutes: [
      '/dashboard',
      '/hubs',
      '/sessions',
      '/appointments',
      '/queue',
      '/patients',
      '/team',
      '/stations',
      '/equipment',
      '/encounters',
      '/exceptions',
      '/reports',
      '/notifications',
      '/catalog',
    ],
    capabilities: [
      'Configure hub profile, operating hours & service desks',
      'Create and publish clinic sessions and set slot capacities',
      'Assign staff to daily shifts and monitor desk throughput',
      'Manage queue overflows, walk-in thresholds and local equipment',
    ],
  },
  reception_officer: {
    id: 'reception_officer',
    number: 4,
    title: 'Reception / Registration Officer',
    titleBn: 'অভ্যর্থনা ও নিবন্ধন কর্মকর্তা',
    description: 'Patient Registration, Appointment ও Check-in',
    descriptionBn: 'রোগী নিবন্ধন, পরিচয় যাচাই, অ্যাপয়েন্টমেন্ট বুকিং ও চেক-ইন',
    scope: 'reception',
    scopeLabel: 'Hub Reception Desk & Intake',
    scopeLabelBn: 'হাব অভ্যর্থনা ডেস্ক ও চেক-ইন',
    clinicalWrite: false,
    isReadOnly: false,
    allowedRoutes: [
      '/dashboard',
      '/patients',
      '/appointments',
      '/queue',
      '/sessions',
      '/notifications',
    ],
    capabilities: [
      'Lookup patients by NID, phone, or canonical Healora ID',
      'Register assisted walk-in patients and capture informed consent',
      'Book appointment slots and check in arriving patients',
      'Issue printed or SMS queue tokens at physical reception',
    ],
  },
  queue_coordinator: {
    id: 'queue_coordinator',
    number: 5,
    title: 'Queue Coordinator',
    titleBn: 'কিউ সমন্বয়কারী',
    description: 'Live Queue ও Station Assignment Manage',
    descriptionBn: 'লাইভ কিউ ব্যবস্থাপনা, সিরিয়াল কল ও স্টেশন টিকিট বণ্টন',
    scope: 'queue',
    scopeLabel: 'Hub Waiting Hall & Live Queue',
    scopeLabelBn: 'হাব অপেক্ষাগার ও কিউ সমন্বয়',
    clinicalWrite: false,
    isReadOnly: false,
    allowedRoutes: [
      '/dashboard',
      '/queue',
      '/stations',
      '/appointments',
      '/sessions',
      '/notifications',
    ],
    capabilities: [
      'Call next patient token to active service desks',
      'Transfer queue tickets between triage and doctor stations',
      'Prioritize elderly, pregnant, or acute escalation cases',
      'Monitor station wait duration and balance desk queues',
    ],
  },
  equipment_officer: {
    id: 'equipment_officer',
    number: 6,
    title: 'Equipment / Facilities Officer',
    titleBn: 'চিকিৎসা সরঞ্জাম ও সুযোগ-সুবিধা কর্মকর্তা',
    description: 'Equipment, Maintenance ও Availability Manage',
    descriptionBn: 'চিকিৎসা সরঞ্জামের ক্যালিব্রেশন, রক্ষণাবেক্ষণ ও প্রাপ্যতা নিশ্চিতকরণ',
    scope: 'equipment',
    scopeLabel: 'Biomedical Inventory & Facility',
    scopeLabelBn: 'বায়োমেডিকেল ইনভেন্টরি ও সুবিধা',
    clinicalWrite: false,
    isReadOnly: false,
    allowedRoutes: [
      '/dashboard',
      '/equipment',
      '/stations',
      '/hubs',
      '/notifications',
    ],
    capabilities: [
      'Register medical devices with serial number attribution',
      'Record calibration benchmarks and biomedical inspection logs',
      'Take faulty devices out of service to block session usage',
      'Certify readiness of blood pressure, glucose, and ECG units',
    ],
  },
  auditor: {
    id: 'auditor',
    number: 7,
    title: 'Read-only Operations Auditor',
    titleBn: 'অপারেশনস অডিটর (শুধুমাত্র পরিদর্শন)',
    description: 'Reports ও Audit Logs দেখা (Read-only)',
    descriptionBn: 'অপরিবর্তনীয় অডিট ট্রেইল ও কার্যক্রম রিপোর্ট পরিদর্শন ও এক্সপোর্ট',
    scope: 'audit',
    scopeLabel: 'Regional & Platform Audit Governance',
    scopeLabelBn: 'আইনগত অডিট ও সম্মতি পরিদর্শন',
    clinicalWrite: false,
    isReadOnly: true,
    allowedRoutes: [
      '/dashboard',
      '/reports',
      '/audit-logs',
      '/notifications',
    ],
    capabilities: [
      'Inspect tamper-evident append-only audit event ledgers',
      'Review aggregated operational performance and wait-time KPIs',
      'Export compliance audit trails for DGHS & regulatory bodies',
      'Strictly read-only access: no operational data alteration allowed',
    ],
  },
  local_doctor: {
    id: 'local_doctor',
    number: 8,
    title: 'Local Doctor (Clinical Reviewer)',
    titleBn: 'স্থানীয় চিকিৎসক (রিভিউয়ার)',
    description: 'Clinical Review & Measurement Evaluations',
    descriptionBn: 'পরিমাপ পর্যালোচনা ও ক্লিনিক্যাল নোট প্রদান',
    scope: 'hub',
    scopeLabel: 'Clinical Review Station',
    scopeLabelBn: 'ক্লিনিক্যাল পর্যালোচনা স্টেশন',
    clinicalWrite: true,
    isReadOnly: false,
    allowedRoutes: ['/dashboard', '/encounters', '/queue', '/sessions'],
    capabilities: ['Evaluate submitted measurements', 'Sign clinical notes & prescriptions in mobile app'],
  },
  field_health_worker: {
    id: 'field_health_worker',
    number: 9,
    title: 'Field Health Worker',
    titleBn: 'মাঠ স্বাস্থ্যকর্মী',
    description: 'Mobile Vitals & Field Screenings',
    descriptionBn: 'মোবাইল অ্যাপে ভাইটালস গ্রহণ ও স্ক্রিনিং',
    scope: 'hub',
    scopeLabel: 'Field & Station Checkup',
    scopeLabelBn: 'মাঠ ও স্টেশন পরিমাপ',
    clinicalWrite: true,
    isReadOnly: false,
    allowedRoutes: ['/dashboard', '/encounters', '/sessions'],
    capabilities: ['Collect checklist measurements with device attribution'],
  },
};

/**
 * The 7 primary operations roles for the Healora Hub Platform
 */
export const CORE_OPERATIONS_ROLES: UserRole[] = [
  'platform_super_admin',
  'regional_ops_manager',
  'hub_manager',
  'reception_officer',
  'queue_coordinator',
  'equipment_officer',
  'auditor',
];

/** Keep the product label "Auditor" while sending the backend's canonical role code. */
export const toUiRole = (role: string): UserRole | undefined => {
  const canonical = role === 'operations_auditor' ? 'auditor' : role;
  return CORE_OPERATIONS_ROLES.includes(canonical as UserRole) || canonical in ROLES_CONFIG
    ? canonical as UserRole
    : undefined;
};

export const toApiRole = (role: string): string => role === 'auditor' ? 'operations_auditor' : role;

export function isRouteAllowedForRole(route: AppRoute, role: UserRole): boolean {
  const config = ROLES_CONFIG[role];
  if (!config) return true;
  return config.allowedRoutes.includes(route);
}

