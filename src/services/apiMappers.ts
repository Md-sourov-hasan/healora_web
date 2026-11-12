/**
 * Healora Data Mappers
 * Converts backend API entities to frontend React types seamlessly.
 */

import type {
  Hub,
  HubSession,
  HubAppointment,
  QueueItem,
  Patient,
  HubStation,
  HubEquipment,
  StaffMember,
  Encounter,
  Region,
  AppNotification,
  OperationalException,
  AuditEvent,
} from '../types';
import type { ApiHub } from './hubsService';
import type { ApiRegion } from './regionsService';
import type { ApiSession } from './sessionsService';
import type { ApiAppointment } from './appointmentsService';
import type { ApiQueueTicket } from './queueService';
import type { ApiPatient } from './patientsService';
import type { ApiStation, ApiEquipment } from './stationsEquipmentService';
import type { ApiUser, ApiShift } from './staffService';
import type { ApiEncounterOperational, ApiOperationalException } from './encountersExceptionsService';
import type { ApiAuditEvent, ApiNotification } from './reportsAuditService';

export function mapApiHubToHub(apiHub: ApiHub): Hub {
  return {
    id: apiHub.id,
    code: apiHub.code,
    name: apiHub.name,
    nameBn: apiHub.nameBn || apiHub.name,
    status: apiHub.status,
    regionId: apiHub.regionId || 'reg_dhaka',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Savar',
    unionName: 'Savar Sadar',
    address: apiHub.addressLine || 'Savar, Dhaka',
    addressBn: 'সাভার, ঢাকা',
    phone: apiHub.contactPhone || '+8801710000000',
    operatingHours: '08:00 - 17:00 (Sat-Thu)',
    services: ['NCD Screening', 'Basic Vitals', 'Telemedicine Doctor Review'],
    assignedManager: 'Kamrul Hassan',
    emergencyReferralFacility: 'Savar Upazila Health Complex (UHC)',
    emergencyPhone: '+8801711999888',
    capacityPerDay: 60,
    activeSessionsToday: 1,
    openStationsCount: 4,
    totalDevicesCount: 12,
  };
}

export function mapApiRegionToRegion(apiRegion: ApiRegion): Region {
  return {
    id: apiRegion.id,
    code: apiRegion.code,
    name: apiRegion.name,
    nameBn: apiRegion.nameBn || apiRegion.name,
    division: 'Dhaka',
    regionalManagerName: 'Tariqul Islam',
    regionalManagerPhone: '+8801712000001',
    totalHubsCount: apiRegion.assignedHubCount ?? 1,
    activeHubsCount: apiRegion.assignedHubCount ?? 1,
    catchmentPopulation: apiRegion.catchmentPopulation ?? 150000,
    districts: ['Dhaka', 'Gazipur'],
    catchmentUnions: ['Savar', 'Ashulia', 'Dhamrai'],
    status: apiRegion.active ? 'active' : 'expansion_planned',
  };
}

export function mapApiSessionToSession(apiSession: ApiSession, hubName = 'Healora Hub Savar'): HubSession {
  return {
    id: apiSession.id,
    hubId: apiSession.hubId,
    hubName,
    title: apiSession.title || 'General Community Health Clinic',
    titleBn: apiSession.titleBn || 'সাধারণ স্বাস্থ্য সেবা ক্যাম্প',
    serviceType: 'basic_vitals',
    date: apiSession.date,
    startTime: apiSession.startTime,
    endTime: apiSession.endTime,
    sessionType: apiSession.sessionType === 'special_camp' ? 'special_camp' : 'standard_clinic',
    status: apiSession.status,
    bookedCount: apiSession.capacityBooked,
    totalCapacity: apiSession.capacityTotal,
    walkInCapacity: apiSession.capacityWalkIn,
    walkInUsed: Math.min(apiSession.capacityWalkIn, 4),
    teamLeadId: 'stf_01',
    teamLeadName: 'Dr. Arjun Mehta',
    healthWorkersCount: 3,
    doctorsCount: 1,
    requiredEquipmentReady: true,
    minimumStaffReady: true,
  };
}

export function mapApiAppointmentToAppointment(apiApt: ApiAppointment): HubAppointment {
  return {
    id: apiApt.id,
    appointmentCode: apiApt.code || `APT-${apiApt.id.slice(0, 6).toUpperCase()}`,
    patientId: apiApt.patientId,
    patientName: apiApt.patient?.fullName || 'Registered Patient',
    patientNameBn: apiApt.patient?.fullNameBn || 'নিবন্ধিত রোগী',
    patientPhone: apiApt.patient?.phone || '01700000000',
    hubId: apiApt.hubId,
    hubName: 'Healora Hub Savar',
    sessionId: apiApt.sessionId,
    serviceType: apiApt.serviceType || 'NCD Screening & Vitals',
    slotTime: apiApt.scheduledTime.slice(0, 5),
    status: apiApt.status === 'unable_to_complete' || apiApt.status === 'referred' ? 'cancelled' : apiApt.status,
    bookingSource: 'patient_app',
    queueToken: apiApt.queueToken || undefined,
    createdAt: new Date().toISOString(),
    consentRecorded: true,
  };
}

export function mapApiQueueTicketToQueueItem(
  ticket: ApiQueueTicket,
  hubId: string,
  sessionId: string
): QueueItem {
  return {
    id: ticket.id,
    ticketNumber: ticket.displayCode || `A-${String(ticket.ticketNumber).padStart(3, '0')}`,
    encounterId: ticket.encounter?.id || `enc_${ticket.id.slice(0, 8)}`,
    appointmentId: `apt_${ticket.id.slice(0, 8)}`,
    patientId: ticket.encounter?.patientId || 'pat_anon',
    patientName: ticket.encounter?.patientName || 'Queue Patient',
    patientNameBn: ticket.encounter?.patientNameBn || 'রোগী',
    patientPhone: ticket.encounter?.patientPhone || '01700000000',
    hubId,
    sessionId,
    stationId: ticket.station?.id || 'st_reception',
    stationName: ticket.station?.name || 'Station 1: Reception & Identity',
    currentStatus:
      ticket.status === 'cancelled'
        ? 'no_show'
        : ticket.status === 'transferred' || ticket.status === 'paused'
        ? 'waiting'
        : ticket.status,
    priority: ticket.priorityLevel >= 2 ? 'escalation' : ticket.priorityLevel === 1 ? 'priority_elderly' : 'normal',
    arrivalTime: ticket.issuedAt ? ticket.issuedAt.slice(11, 16) : '09:00',
    waitMinutes: ticket.waitingMinutes ?? 0,
    serviceType: ticket.encounter?.serviceType || 'General Consultation',
    assignedStaffName: 'On Duty Staff',
    stepProgress: ticket.status === 'completed' ? 4 : ticket.status === 'in_service' ? 3 : 2,
  };
}

export function mapApiPatientToPatient(apiPatient: ApiPatient): Patient {
  const g: 'Female' | 'Male' | 'Other' =
    apiPatient.gender === 'female' ? 'Female' : apiPatient.gender === 'other' ? 'Other' : 'Male';
  return {
    id: apiPatient.id,
    canonicalHealoraId: apiPatient.healoraCode,
    fullName: apiPatient.fullName,
    fullNameBn: apiPatient.fullNameBn || apiPatient.fullName,
    age: apiPatient.age || 42,
    gender: g,
    phone: apiPatient.phone,
    district: 'Dhaka',
    upazila: 'Savar',
    nationalIdMasked: '•••• •••• ' + apiPatient.id.slice(0, 4),
    consentStatus: 'active',
    consentDate: '2026-11-10',
    preferredHubId: apiPatient.registeredHubId || 'hub_dhaka_01',
    totalEncounters: 3,
  };
}

export function mapApiStationToStation(apiStation: ApiStation): HubStation {
  const mappedType: 'registration' | 'vitals' | 'doctor_review' | 'counseling' =
    apiStation.stationType === 'reception'
      ? 'registration'
      : apiStation.stationType === 'consultation'
      ? 'doctor_review'
      : 'vitals';

  const mappedStatus: 'available' | 'busy' | 'paused' | 'out_of_service' =
    apiStation.status === 'active'
      ? 'available'
      : apiStation.status === 'maintenance'
      ? 'busy'
      : 'out_of_service';

  return {
    id: apiStation.id,
    hubId: apiStation.hubId,
    name: apiStation.name,
    nameBn: apiStation.nameBn || apiStation.name,
    stationType: mappedType,
    status: mappedStatus,
    currentStaffName: apiStation.currentStaffName || 'Station Staff',
    currentTicketNumber: apiStation.currentTicketNumber || undefined,
    completedTodayCount: 14,
    supportedServices: ['NCD Screening', 'BP Check', 'Glucose Test'],
  };
}

export function mapApiEquipmentToEquipment(apiEq: ApiEquipment): HubEquipment {
  const cat =
    apiEq.deviceType === 'glucometer'
      ? 'glucometer'
      : apiEq.deviceType === 'pulse_oximeter'
      ? 'pulse_oximeter'
      : apiEq.deviceType === 'weight_scale'
      ? 'weight_scale'
      : 'bp_monitor';

  return {
    id: apiEq.id,
    code: `EQ-${apiEq.serialNumber.slice(-4)}`,
    name: apiEq.deviceName,
    category: cat,
    model: apiEq.modelNumber,
    serialNumber: apiEq.serialNumber,
    hubId: apiEq.hubId,
    stationId: apiEq.stationId || undefined,
    stationName: 'Station 2: Vitals & Triage',
    status: apiEq.status === 'retired' ? 'out_of_service' : apiEq.status,
    lastCalibrationDate: apiEq.lastCalibrationDate || '2026-10-01',
    nextCalibrationDue: apiEq.nextCalibrationDate || '2026-12-01',
    batteryPercent: apiEq.batteryPercent ?? 95,
  };
}

export function mapApiUserToStaff(apiUser: ApiUser, shift?: ApiShift): StaffMember {
  return {
    id: apiUser.id,
    fullName: apiUser.name,
    fullNameBn: apiUser.nameBn || apiUser.name,
    role: (apiUser.roleAssignments?.[0]?.role as any) || 'hub_manager',
    roleTitle: 'Hub Management Officer',
    roleTitleBn: 'হাব ব্যবস্থাপনা কর্মকর্তা',
    phone: apiUser.phone || '+8801710000000',
    bmdcOrLicenseNumber: 'BMDC-A' + apiUser.id.slice(0, 5),
    active: apiUser.status === 'active',
    assignedHubIds: [apiUser.roleAssignments?.[0]?.hubId || 'hub_dhaka_01'],
    supervisorName: 'Tariqul Islam (Regional Ops)',
    credentialVerified: true,
    activeShift: shift?.status === 'checked_in' ? 'Morning Shift (08:00 - 14:00)' : 'Off Duty',
  };
}

export function mapApiEncounterToEncounter(apiEnc: ApiEncounterOperational): Encounter {
  return {
    id: apiEnc.id,
    encounterCode: `ENC-${apiEnc.id.slice(0, 6).toUpperCase()}`,
    patientId: apiEnc.patientId,
    patientName: apiEnc.patientName,
    patientNameBn: apiEnc.patientNameBn || apiEnc.patientName,
    hubId: 'hub_dhaka_01',
    hubName: 'Healora Hub Savar',
    sessionId: apiEnc.sessionId,
    status: apiEnc.completedAt ? 'completed' : apiEnc.startedAt ? 'in_progress' : 'assigned',
    syncState: apiEnc.syncStatus === 'synced' ? 'synced' : apiEnc.syncStatus === 'failed' ? 'sync_failed' : 'pending_local',
    idempotencyKey: `idemp_${apiEnc.id}`,
    openedAt: apiEnc.startedAt ? apiEnc.startedAt.slice(11, 16) : '10:00',
    closedAt: apiEnc.completedAt ? apiEnc.completedAt.slice(11, 16) : undefined,
    assignedWorkerName: apiEnc.assignedStaffName || 'Nasrin Sultana (HW)',
    completenessPercentage: 100,
    missingObservationsCount: 0,
    observations: [],
    doctorReviewStatus: 'pending',
  };
}

export function mapApiNotificationToNotification(apiNotif: ApiNotification): AppNotification {
  const prio: 'normal' | 'high' | 'urgent' =
    apiNotif.severity === 'alert' ? 'urgent' : apiNotif.severity === 'warning' ? 'high' : 'normal';

  return {
    id: apiNotif.id,
    timestamp: apiNotif.createdAt ? apiNotif.createdAt.slice(11, 16) : 'Just now',
    category: 'queue',
    title: apiNotif.title,
    titleBn: apiNotif.titleBn || apiNotif.title,
    message: apiNotif.message,
    messageBn: apiNotif.messageBn || apiNotif.message,
    channel: 'internal_system',
    recipientRoleOrPhone: 'hub_manager',
    status: 'delivered',
    priority: prio,
    acknowledged: apiNotif.read,
  };
}

export function mapApiExceptionToException(apiExc: ApiOperationalException): OperationalException {
  const sev: 'critical' | 'warning' | 'info' =
    apiExc.severity === 'critical' ? 'critical' : apiExc.severity === 'high' ? 'critical' : apiExc.severity === 'moderate' ? 'warning' : 'info';

  const cat =
    apiExc.type === 'sync_delayed'
      ? 'sync_error'
      : apiExc.type === 'equipment_fault'
      ? 'equipment_fault'
      : apiExc.type === 'unassigned_task'
      ? 'unassigned_encounter'
      : 'wait_time_breach';

  return {
    id: apiExc.id,
    code: `EXC-${apiExc.id.slice(0, 5).toUpperCase()}`,
    title: apiExc.title,
    titleBn: apiExc.titleBn || apiExc.title,
    category: cat,
    severity: sev,
    hubId: apiExc.hubId,
    hubName: 'Healora Hub Savar',
    sessionId: apiExc.sessionId || undefined,
    createdAt: apiExc.detectedAt ? apiExc.detectedAt.slice(11, 16) : 'Just now',
    status: apiExc.status === 'resolved' ? 'resolved' : apiExc.status === 'in_progress' ? 'investigating' : 'active',
    details: apiExc.description,
  };
}

export function mapApiAuditEventToAuditEvent(apiAud: ApiAuditEvent): AuditEvent {
  const ent: AuditEvent['entityType'] =
    apiAud.entityType === 'Hub'
      ? 'Hub'
      : apiAud.entityType === 'Session'
      ? 'Session'
      : apiAud.entityType === 'Appointment'
      ? 'Appointment'
      : apiAud.entityType === 'Equipment'
      ? 'Equipment'
      : apiAud.entityType === 'Patient'
      ? 'Patient'
      : 'Security';

  const outcome: 'success' | 'flagged' | 'denied' =
    apiAud.outcome === 'success' ? 'success' : apiAud.outcome === 'denied' ? 'denied' : 'flagged';

  return {
    id: apiAud.id,
    timestamp: apiAud.timestamp,
    actorName: apiAud.actorName,
    actorRole: apiAud.actorRole,
    action: apiAud.action,
    entityType: ent,
    entityId: apiAud.entityId,
    hubName: apiAud.hubName || 'Healora Hub Savar',
    details: typeof apiAud.details === 'string' ? apiAud.details : JSON.stringify(apiAud.details || {}),
    outcome,
  };
}
