export interface TranslationDict {
  brandTitle: string;
  brandSubtitle: string;
  navOverview: string;
  navHubs: string;
  navSessions: string;
  navAppointments: string;
  navQueue: string;
  navPatients: string;
  navTeam: string;
  navEquipment: string;
  navReports: string;
  navExceptions: string;
  navAudit: string;
  todaySession: string;
  activeHubs: string;
  appointmentsToday: string;
  checkedIn: string;
  waiting: string;
  inService: string;
  completed: string;
  syncPending: string;
  equipmentReady: string;
  avgWaitTime: string;
  avgServiceTime: string;
  checkInPatient: string;
  callNext: string;
  transferStation: string;
  newSession: string;
  addWalkIn: string;
  searchPlaceholder: string;
  simpleMode: string;
  dataResidencyNotice: string;
  roleSwitcher: string;
  auditTrail: string;
  offlineNotice: string;
  retrySync: string;
  viewDetails: string;
  save: string;
  cancel: string;
  confirm: string;
  statusCompleted: string;
  statusWaiting: string;
  statusInService: string;
  statusUpcoming: string;
  statusDraft: string;
  statusCancelled: string;
  statusNoShow: string;
  statusAwaitingReview: string;
  statusReferred: string;
  statusOutOfService: string;
  statusAvailable: string;
  statusBusy: string;
  statusCalibrationDue: string;
  prerequisitesMet: string;
  prerequisitesMissing: string;
  tokenNumber: string;
  patientName: string;
  phone: string;
  station: string;
  actions: string;
  bmdcNumber: string;
  credentialVerified: string;
  observationsSubmitted: string;
  doctorReviewRequired: string;
  leastPrivilegeNote: string;
  allHubs: string;
}

export const translations: Record<'en' | 'bn', TranslationDict> = {
  en: {
    brandTitle: 'Healora Hub Ops',
    brandSubtitle: 'Area-based Physical Hub Operations & Care Coordination',
    navOverview: 'Overview',
    navHubs: 'Hubs',
    navSessions: 'Sessions & Camps',
    navAppointments: 'Appointments',
    navQueue: 'Live Queue',
    navPatients: 'Patients (Operational)',
    navTeam: 'Team & Rosters',
    navEquipment: 'Stations & Devices',
    navReports: 'Operations Reports',
    navExceptions: 'Sync & Exceptions',
    navAudit: 'Audit & Compliance',
    todaySession: "Today's Hub Operations",
    activeHubs: 'Active Hubs',
    appointmentsToday: 'Booked Today',
    checkedIn: 'Checked In',
    waiting: 'Waiting',
    inService: 'In Service',
    completed: 'Completed',
    syncPending: 'Sync Pending',
    equipmentReady: 'Equipment Readiness',
    avgWaitTime: 'Avg. Wait Time',
    avgServiceTime: 'Avg. Vitals Duration',
    checkInPatient: 'Check-in Patient',
    callNext: 'Call Next Patient',
    transferStation: 'Transfer Station',
    newSession: 'Create Hub Session',
    addWalkIn: 'Register Walk-in',
    searchPlaceholder: 'Search by Healora ID, Ticket (e.g. A-102) or Phone...',
    simpleMode: 'Simple Mode',
    dataResidencyNotice: 'Bangladesh Data Residency: PDPA 2026 & DGHS Telehealth compliant (Tier-IV National DC)',
    roleSwitcher: 'Active Role',
    auditTrail: 'Immutable System Audit',
    offlineNotice: 'Mobile capture operates offline-safely. Syncing occurs upon connection.',
    retrySync: 'Retry Sync Now',
    viewDetails: 'View Details',
    save: 'Save Changes',
    cancel: 'Cancel',
    confirm: 'Confirm Action',
    statusCompleted: 'Completed',
    statusWaiting: 'Waiting',
    statusInService: 'In Service',
    statusUpcoming: 'Upcoming',
    statusDraft: 'Draft',
    statusCancelled: 'Cancelled',
    statusNoShow: 'No-Show',
    statusAwaitingReview: 'Awaiting Doctor Review',
    statusReferred: 'Referred / Escalated',
    statusOutOfService: 'Out of Service',
    statusAvailable: 'Available',
    statusBusy: 'Busy',
    statusCalibrationDue: 'Calibration Due',
    prerequisitesMet: 'Prerequisites Satisfied (Staff & Devices Ready)',
    prerequisitesMissing: 'Prerequisites Missing (Requires Override Reason)',
    tokenNumber: 'Queue Token',
    patientName: 'Patient Name',
    phone: 'Phone',
    station: 'Station',
    actions: 'Actions',
    bmdcNumber: 'BMDC / Reg No',
    credentialVerified: 'Verified Credential',
    observationsSubmitted: 'Observations Submitted',
    doctorReviewRequired: 'Doctor Review Pending',
    leastPrivilegeNote: 'Least-Privilege Active: Non-clinical roles view operational check-in & queue progress only.',
    allHubs: 'All Operating Hubs',
  },
  bn: {
    brandTitle: 'হিলোরা হাব ম্যানেজমেন্ট',
    brandSubtitle: 'শাখাভিত্তিক স্বাস্থ্যসেবা কেন্দ্র পরিচালনা ও স্থানীয় কেয়ার সমন্বয়',
    navOverview: 'সারসংক্ষেপ',
    navHubs: 'শাখা কেন্দ্রসমূহ',
    navSessions: 'সেশন ও হেলথ ক্যাম্প',
    navAppointments: 'অ্যাপয়েন্টমেন্ট',
    navQueue: 'লাইভ সিরিয়াল / কিউ',
    navPatients: 'রোগী তথ্য (অপারেশনাল)',
    navTeam: 'টিম ও ডিউটি রোস্টার',
    navEquipment: 'স্টেশন ও চিকিৎসা সরঞ্জাম',
    navReports: 'কার্যক্রম রিপোর্ট',
    navExceptions: 'সিঙ্ক ও সমস্যা মনিটর',
    navAudit: 'অডিট ও আইনগত সম্মতি',
    todaySession: 'আজকের হাব কার্যক্রম',
    activeHubs: 'সক্রিয় হাব',
    appointmentsToday: 'আজকের বুকিং',
    checkedIn: 'উপস্থিত',
    waiting: 'অপেক্ষারত',
    inService: 'সেবা চলছে',
    completed: 'সম্পন্ন',
    syncPending: 'সিঙ্ক অপেক্ষমান',
    equipmentReady: 'প্রস্তুত সরঞ্জাম',
    avgWaitTime: 'গড় অপেক্ষার সময়',
    avgServiceTime: 'গড় পরীক্ষা সময়',
    checkInPatient: 'রোগী চেক-ইন করুন',
    callNext: 'পরবর্তী রোগী ডাকুন',
    transferStation: 'স্টেশন বদল করুন',
    newSession: 'নতুন সেশন তৈরি',
    addWalkIn: 'ওয়াক-ইন নিবন্ধন',
    searchPlaceholder: 'হিলোরা আইডি, টোকেন (যেমন A-102) বা ফোন দিয়ে খুঁজুন...',
    simpleMode: 'সহজ মোড',
    dataResidencyNotice: 'বাংলাদেশ ডাটা সুরক্ষা: PDPA ২০২৬ ও স্বাস্থ্য অধিদপ্তর টেলিহেলথ নীতিমালা অনুযায়ী সুরক্ষিত',
    roleSwitcher: 'বর্তমান ভূমিকা',
    auditTrail: 'অপরিবর্তনীয় সিস্টেম অডিট',
    offlineNotice: 'মোবাইল অ্যাপ অফলাইনে নিরাপদভাবে তথ্য জমা রাখে। নেটওয়ার্ক পেলেই স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।',
    retrySync: 'পুনরায় সিঙ্ক করুন',
    viewDetails: 'বিস্তারিত দেখুন',
    save: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    confirm: 'নিশ্চিত করুন',
    statusCompleted: 'সম্পন্ন',
    statusWaiting: 'অপেক্ষারত',
    statusInService: 'সেবা চলছে',
    statusUpcoming: 'আসন্ন',
    statusDraft: 'খসড়া',
    statusCancelled: 'বাতিলকৃত',
    statusNoShow: 'অনুপস্থিত',
    statusAwaitingReview: 'ডাক্তার পর্যালোচনায়',
    statusReferred: 'রেফার / বিশেষায়িত',
    statusOutOfService: 'কার্যক্রম স্থগিত',
    statusAvailable: 'প্রস্তুত',
    statusBusy: 'ব্যস্ত',
    statusCalibrationDue: 'ক্যালিব্রেশন প্রয়োজন',
    prerequisitesMet: 'সকল শর্ত পূরণ (কর্মী ও সরঞ্জাম প্রস্তুত)',
    prerequisitesMissing: 'শর্ত অসম্পূর্ণ (অনুমোদন প্রয়োজন)',
    tokenNumber: 'সিরিয়াল টোকেন',
    patientName: 'রোগীর নাম',
    phone: 'ফোন নম্বর',
    station: 'স্টেশন',
    actions: 'পদক্ষেপ',
    bmdcNumber: 'বিএমডিসি নিবন্ধন',
    credentialVerified: 'যাচাইকৃত সনদ',
    observationsSubmitted: 'পরিমাপ ডেটা আপলোড সম্পন্ন',
    doctorReviewRequired: 'স্থানীয় ডাক্তারের মতামত প্রয়োজন',
    leastPrivilegeNote: 'তথ্য গোপনীয়তা সক্রিয়: অভ্যর্থনাকারী শুধুমাত্র উপস্থিতি ও সিরিয়াল দেখতে পারবেন, চিকিৎসা ইতিহাস সংরক্ষিত।',
    allHubs: 'সকল সক্রিয় হাব',
  },
};

