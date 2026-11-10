export type AppRoute =
  | '/dashboard'
  | '/hubs'
  | '/regions'
  | '/sessions'
  | '/appointments'
  | '/queue'
  | '/patients'
  | '/team'
  | '/stations'
  | '/equipment'
  | '/encounters'
  | '/exceptions'
  | '/reports'
  | '/notifications'
  | '/settings'
  | '/audit-logs';

export type Language = 'en' | 'bn';

export type UserRole =
  | 'platform_super_admin'
  | 'regional_ops_manager'
  | 'hub_manager'
  | 'reception_officer'
  | 'queue_coordinator'
  | 'equipment_officer'
  | 'local_doctor'
  | 'field_health_worker'
  | 'auditor';

export type HubStatus = 'draft' | 'active' | 'paused' | 'temporarily_closed' | 'permanently_closed';

export interface Hub {
  id: string;
  code: string;
  name: string;
  nameBn: string;
  status: HubStatus;
  regionId: string;
  division: string;
  district: string;
  upazila: string;
  unionName: string;
  address: string;
  addressBn: string;
  phone: string;
  operatingHours: string;
  services: string[];
  assignedManager: string;
  emergencyReferralFacility: string;
  emergencyPhone: string;
  capacityPerDay: number;
  activeSessionsToday: number;
  openStationsCount: number;
  totalDevicesCount: number;
}

export type SessionType = 'standard_clinic' | 'special_camp' | 'outreach_event';
export type SessionStatus =
  | 'draft'
  | 'published'
  | 'open_for_booking'
  | 'full'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'paused';

export interface HubSession {
  id: string;
  hubId: string;
  hubName: string;
  title: string;
  titleBn: string;
  serviceType: 'basic_vitals' | 'doctor_review' | 'camp_session' | 'telemedicine_support';
  date: string;
  startTime: string;
  endTime: string;
  sessionType: SessionType;
  status: SessionStatus;
  bookedCount: number;
  totalCapacity: number;
  walkInCapacity: number;
  walkInUsed: number;
  teamLeadId: string;
  teamLeadName: string;
  healthWorkersCount: number;
  doctorsCount: number;
  requiredEquipmentReady: boolean;
  minimumStaffReady: boolean;
  overrideReason?: string;
}

export type AppointmentStatus =
  | 'pending_confirmation'
  | 'confirmed'
  | 'arrived'
  | 'checked_in'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export type BookingSource =
  | 'patient_app'
  | 'field_referral'
  | 'assisted_walkin'
  | 'doctor_referral';

export interface HubAppointment {
  id: string;
  appointmentCode: string;
  patientId: string;
  patientName: string;
  patientNameBn: string;
  patientPhone: string;
  hubId: string;
  hubName: string;
  sessionId: string;
  serviceType: string;
  slotTime: string;
  status: AppointmentStatus;
  bookingSource: BookingSource;
  queueToken?: string;
  createdAt: string;
  consentRecorded: boolean;
}

export interface Patient {
  id: string;
  canonicalHealoraId: string;
  fullName: string;
  fullNameBn: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  phone: string;
  district: string;
  upazila: string;
  nationalIdMasked: string;
  consentStatus: 'active' | 'pending' | 'caregiver_authorized';
  consentDate: string;
  caregiverName?: string;
  caregiverRelation?: string;
  preferredHubId: string;
  totalEncounters: number;
}

export type QueueState =
  | 'waiting'
  | 'called'
  | 'in_service'
  | 'awaiting_review'
  | 'completed'
  | 'referred'
  | 'no_show';

export interface QueueItem {
  id: string;
  ticketNumber: string;
  encounterId: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientNameBn: string;
  patientPhone: string;
  hubId: string;
  sessionId: string;
  stationId: string;
  stationName: string;
  currentStatus: QueueState;
  priority: 'normal' | 'priority_elderly' | 'escalation';
  arrivalTime: string;
  waitMinutes: number;
  serviceType: string;
  assignedStaffName: string;
  stepProgress: number; // e.g. 1 to 4
}

export type StationStatus = 'available' | 'busy' | 'paused' | 'out_of_service';

export interface HubStation {
  id: string;
  hubId: string;
  name: string;
  nameBn: string;
  stationType: 'registration' | 'vitals' | 'doctor_review' | 'counseling';
  status: StationStatus;
  currentStaffName: string;
  currentTicketNumber?: string;
  completedTodayCount: number;
  supportedServices?: string[];
}

export type EquipmentCategory =
  | 'bp_monitor'
  | 'glucometer'
  | 'pulse_oximeter'
  | 'weight_scale'
  | 'ecg_device';

export type EquipmentStatus =
  | 'available'
  | 'assigned'
  | 'maintenance'
  | 'calibration_due'
  | 'out_of_service';

export interface HubEquipment {
  id: string;
  code: string;
  name: string;
  category: EquipmentCategory;
  model: string;
  serialNumber: string;
  hubId: string;
  stationId?: string;
  stationName?: string;
  status: EquipmentStatus;
  lastCalibrationDate: string;
  nextCalibrationDue: string;
  batteryPercent: number;
  notes?: string;
  supportedObservations?: string[];
}

export interface StaffMember {
  id: string;
  fullName: string;
  fullNameBn: string;
  role: UserRole;
  roleTitle: string;
  roleTitleBn: string;
  phone: string;
  bmdcOrLicenseNumber?: string;
  active: boolean;
  assignedHubIds: string[];
  supervisorName: string;
  credentialVerified: boolean;
  activeShift: string;
}

export type SyncState = 'synced' | 'pending_local' | 'sync_failed' | 'retrying';

export interface EncounterObservation {
  code: string;
  name: string;
  value: string;
  unit: string;
  isAbnormal?: boolean;
  measuredAt: string;
  deviceId?: string;
}

export interface Encounter {
  id: string;
  encounterCode: string;
  patientId: string;
  patientName: string;
  patientNameBn: string;
  hubId: string;
  hubName: string;
  sessionId: string;
  appointmentId?: string;
  status:
    | 'created'
    | 'assigned'
    | 'in_progress'
    | 'submitted_for_review'
    | 'reviewed'
    | 'completed'
    | 'referred_escalated';
  syncState: SyncState;
  idempotencyKey: string;
  openedAt: string;
  closedAt?: string;
  assignedWorkerName: string;
  reviewingDoctorName?: string;
  completenessPercentage: number;
  missingObservationsCount: number;
  lastSyncAttempt?: string;
  observations: EncounterObservation[];
  dispositionNotes?: string;
  doctorReviewStatus?: 'not_required' | 'pending' | 'reviewed' | 'remeasurement_requested';
  requiredObservations?: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: 'Hub' | 'Session' | 'Appointment' | 'Queue' | 'Staff' | 'Equipment' | 'Encounter' | 'Security' | 'Patient' | 'Region' | 'Catchment' | 'Notification';
  entityId: string;
  hubName: string;
  details: string;
  outcome: 'success' | 'flagged' | 'denied';
}

export interface Region {
  id: string;
  code: string;
  name: string;
  nameBn: string;
  division: string;
  regionalManagerName: string;
  regionalManagerPhone: string;
  totalHubsCount: number;
  activeHubsCount: number;
  catchmentPopulation: number;
  districts: string[];
  catchmentUnions: string[];
  status: 'active' | 'expansion_planned';
}

export interface CatchmentArea {
  id: string;
  regionId: string;
  hubId: string;
  hubName: string;
  name: string;
  nameBn: string;
  upazila: string;
  unions: string[];
  estimatedPopulation: number;
  coverageRadiusKm: number;
  basis: 'patient_choice' | 'operations_assignment' | 'campaign_camp' | 'field_referral' | 'assisted_walkin';
  outOfCatchmentPolicy: 'allowed_with_capacity' | 'restricted' | 'referral_only';
}

export interface AppNotification {
  id: string;
  timestamp: string;
  category: 'appointment' | 'session' | 'queue' | 'sync' | 'equipment' | 'clinical_alert' | 'escalation';
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  channel: 'sms' | 'push_app' | 'internal_system';
  recipientRoleOrPhone: string;
  status: 'delivered' | 'sent' | 'pending' | 'failed';
  hubId?: string;
  hubName?: string;
  priority: 'normal' | 'high' | 'urgent';
  deepLinkPath?: string;
  acknowledged: boolean;
}

export interface OperationalException {
  id: string;
  code: string;
  title: string;
  titleBn: string;
  category: 'sync_error' | 'missing_measurement' | 'unassigned_encounter' | 'wait_time_breach' | 'equipment_fault' | 'clinical_escalation';
  severity: 'critical' | 'warning' | 'info';
  hubId: string;
  hubName: string;
  sessionId?: string;
  encounterId?: string;
  patientName?: string;
  createdAt: string;
  status: 'active' | 'investigating' | 'resolved';
  details: string;
  resolutionActionText?: string;
}
