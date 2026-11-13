/** Maps only values returned by the backend. Missing API fields stay empty. */

import type {
  Hub, HubSession, HubAppointment, QueueItem, Patient, HubStation,
  HubEquipment, StaffMember, Encounter, Region, CatchmentArea,
  AppNotification, OperationalException, AuditEvent,
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
import { toUiRole } from '../config/rolesConfig';
import { parseApiDate } from './apiClient';

const value = (v: string | null | undefined): string => v ?? '';
export const formatApiTime = (v: string | null | undefined): string => {
  const date = parseApiDate(v);
  return date ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(date) : '';
};

export function mapApiHubToHub(a: ApiHub): Hub {
  return {
    id: a.id, code: a.code, name: a.name, nameBn: value(a.nameBn), status: a.status,
    regionId: a.regionId,
    address: value(a.addressLine), addressBn: value(a.addressLineBn), phone: value(a.contactPhone),
    services: a.serviceOfferings?.map((x) => x.serviceType?.name).filter((x): x is string => Boolean(x)) ?? [],
    assignedManager: value(a.manager?.name), emergencyReferralFacility: value(a.nearestReferralFacility),
    emergencyPhone: value(a.referralFacilityPhone ?? a.emergencyContactPhone),
  };
}

export function mapApiRegionToRegion(a: ApiRegion): Region {
  return {
    id: a.id, code: a.code, name: a.name, level: a.level, nameBn: value(a.nameBn),
    totalHubsCount: a.assignedHubCount,
    activeHubsCount: a.activeHubCount, catchmentPopulation: a.catchmentPopulation,
    status: a.active ? 'active' : 'inactive',
  };
}

export function mapApiCatchmentToCatchment(a: { id: string; regionId: string; hubId: string; region?: { name?: string | null; code?: string | null } | null; hub?: { name?: string | null } | null }): CatchmentArea {
  return {
    id: a.id, regionId: a.regionId, hubId: a.hubId,
    hubName: value(a.hub?.name), name: value(a.region?.name), nameBn: '', upazila: '',
  };
}

export function mapApiSessionToSession(a: ApiSession, hubName = ''): HubSession {
  return {
    id: a.id, hubId: a.hubId, hubName, title: value(a.title), titleBn: value(a.titleBn),
    serviceType: a.serviceTypeCode,
    serviceTypeId: a.serviceTypeId,
    date: a.sessionDate, startTime: formatApiTime(a.startsAt), endTime: formatApiTime(a.endsAt),
    sessionType: a.sessionType,
    status: a.status, bookedCount: a.bookedCount, totalCapacity: a.appointmentCapacity,
    walkInCapacity: a.walkInCapacity, walkInUsed: a.walkInCount,
    teamLeadId: value(a.teamLeadUserId), teamLeadName: value(a.teamLeadName),
    healthWorkersCount: a.healthWorkersCount, doctorsCount: a.doctorsCount,
    requiredEquipmentReady: a.readiness?.equipmentReady,
    minimumStaffReady: a.readiness?.staffReady,
  };
}

export function mapApiAppointmentToAppointment(a: ApiAppointment, hubName = ''): HubAppointment {
  const slotStart = a.slot?.startsAt ?? a.session?.startsAt ?? '';
  return {
    id: a.id, appointmentCode: a.code, patientId: a.patientId,
    patientName: value(a.patient?.fullName), patientNameBn: value(a.patient?.fullNameBn),
    patientPhone: value(a.patient?.maskedPhone), hubId: a.hubId, hubName, sessionId: a.sessionId,
    serviceType: value(a.serviceTypeName), slotTime: formatApiTime(slotStart),
    status: a.status,
    bookingSource: (a.source || '') as HubAppointment['bookingSource'], queueToken: a.queueToken ?? undefined,
    createdAt: a.createdAt, consentRecorded: a.consentRecorded,
  };
}

export function mapApiQueueTicketToQueueItem(a: ApiQueueTicket, hubId: string, sessionId: string, serviceType?: string): QueueItem {
  const state = a.status;
  const assigned = a.assignedStaff?.find((x) => ['assigned', 'accepted', 'started'].includes(x.status))?.name ?? '';
  return {
    id: a.id, ticketNumber: a.displayCode, encounterId: a.encounter?.id ?? '', appointmentId: a.appointmentId ?? undefined,
    patientId: a.patient?.id ?? '', patientName: a.patient?.firstName ?? '',
    patientNameBn: '', patientPhone: '', hubId, sessionId, stationId: a.station?.id ?? '', stationName: value(a.station?.name),
    currentStatus: state,
    priority: a.priorityLevel >= 2 ? 'escalation' : a.priorityLevel === 1 ? 'priority_elderly' : 'normal',
    arrivalTime: formatApiTime(a.issuedAt), waitMinutes: a.waitingMinutes, serviceType, assignedStaffName: assigned,
    stepProgress: state === 'completed' ? 4 : state === 'in_service' ? 3 : state === 'called' ? 2 : 1,
  };
}

export function mapApiPatientToPatient(a: ApiPatient): Patient {
  const gender = a.sex === 'female' ? 'Female' : a.sex === 'male' ? 'Male' : a.sex === 'other' ? 'Other' : 'Unknown';
  return {
    id: a.id, canonicalHealoraId: a.healoraCode, fullName: a.fullName, fullNameBn: value(a.fullNameBn),
    age: a.age, gender, phone: value(a.maskedPhone ?? a.phone), district: '', upazila: '', nationalIdMasked: '',
    consentStatus: undefined, consentDate: undefined, caregiverName: undefined, preferredHubId: value(a.registeredHubId),
  };
}

export function mapApiStationToStation(a: ApiStation): HubStation {
  const types: Record<string, HubStation['stationType']> = { registration: 'registration', vitals: 'vitals', doctor_review: 'doctor_review', counselling: 'counseling', waiting: 'waiting', other: 'other' };
  const statuses: Record<string, HubStation['status']> = { available: 'available', busy: 'busy', paused: 'paused', out_of_service: 'out_of_service' };
  return {
    id: a.id, hubId: a.hubId, name: a.name, code: a.code, nameBn: value(a.nameBn),
    stationType: types[a.stationType] ?? a.stationType, status: statuses[a.status] ?? a.status,
    currentStaffName: value(a.currentStaff?.name), currentTicketNumber: a.currentTicketNumber ?? undefined,
    supportedServices: a.serviceTypeIds,
  };
}

export function mapApiEquipmentToEquipment(a: ApiEquipment): HubEquipment {
  const category = a.category;
  return {
    id: a.id, code: a.assetTag, name: a.assetTag, category: category as HubEquipment['category'],
    model: value(a.model), serialNumber: value(a.serialNumber), hubId: a.hubId,
    stationId: a.stationId ?? undefined, stationName: value(a.station?.name),
    status: a.status,
    lastCalibrationDate: value(a.lastCalibratedAt), nextCalibrationDue: value(a.nextCalibrationDue),
    batteryPercent: a.batteryPercent ?? undefined, notes: value(a.notes ?? a.activeFaultDescription),
  };
}

export function mapApiUserToStaff(a: ApiUser, shift?: ApiShift): StaffMember {
  const rawRole = shift?.role ?? a.roleAssignments?.[0]?.role ?? '';
  const role = toUiRole(rawRole) ?? rawRole as StaffMember['role'];
  return {
    id: a.id, email: a.email, fullName: a.name, fullNameBn: value(a.nameBn), role, roleTitle: role, roleTitleBn: role,
    phone: value(a.phone), bmdcOrLicenseNumber: undefined, active: a.status === 'active',
    assignedHubIds: [...new Set([...(a.roleAssignments ?? []).map((r) => r.hubId).filter((x): x is string => Boolean(x)), ...(shift?.hubId ? [shift.hubId] : [])])],
    activeShift: shift ? `${formatApiTime(shift.startsAt)}–${formatApiTime(shift.endsAt)} (${shift.status})` : '',
  };
}

export function mapApiEncounterToEncounter(a: ApiEncounterOperational, hubId: string, hubName = ''): Encounter {
  const c = a.completeness;
  const total = c?.requiredTotal;
  const captured = c?.captured;
  const status: Encounter['status'] = a.status === 'submitted' ? 'submitted_for_review' : a.status === 'unable_to_complete' ? 'referred_escalated' : a.status;
  return {
    id: a.id, encounterCode: a.queueTicket?.displayCode ?? a.id, patientId: a.patientId ?? '',
    patientName: value(a.patient?.fullName), patientNameBn: value(a.patient?.fullNameBn), hubId, hubName,
    sessionId: a.sessionId ?? '', status,
    syncState: a.sync?.state === 'synced' ? 'synced' : a.sync?.state === 'failed' ? 'sync_failed' : a.sync?.state === 'pending' ? 'pending_local' : a.sync?.state === 'none' ? 'none' : undefined,
    idempotencyKey: undefined, openedAt: formatApiTime(a.openedAt), closedAt: formatApiTime(a.closedAt),
    assignedWorkerName: value(a.assignments?.find((x) => ['assigned', 'accepted', 'started'].includes(x.status))?.name),
    completenessPercentage: total && captured != null ? Math.round((captured / total) * 100) : undefined,
    missingObservationsCount: c?.pending, lastSyncAttempt: a.sync?.lastServerAckAt ?? undefined,
    observations: undefined, doctorReviewStatus: a.requiresDoctorReview ? 'pending' : 'not_required',
  };
}

export function mapApiNotificationToNotification(a: ApiNotification): AppNotification {
  const categoryMap: Record<string, AppNotification['category']> = { appointment: 'appointment', session: 'session', queue_ticket: 'queue', equipment: 'equipment', encounter: 'clinical_alert', sync_submission: 'sync', operational_exception: 'escalation' };
  return {
    id: a.id, timestamp: formatApiTime(a.queuedAt), category: categoryMap[a.relatedType ?? ''] ?? 'system',
    title: a.templateCode, status: a.status === 'failed' ? 'failed' : a.status === 'queued' ? 'pending' : a.status === 'delivered' ? 'delivered' : 'sent',
    hubName: '', relatedType: a.relatedType ?? undefined, relatedId: a.relatedId ?? undefined, deepLinkPath: notificationRoute(a.deepLink),
  };
}

function notificationRoute(deepLink?: string | null): string | undefined {
  if (!deepLink) return undefined;
  const match = deepLink.match(/(?:healora-hub|healora-team):\/\/(hubs|sessions|appointments|queue|patients|encounters|exceptions|equipment|staff)/i);
  return match ? `/${match[1].toLowerCase() === 'staff' ? 'team' : match[1].toLowerCase()}` : undefined;
}

export function mapApiExceptionToException(a: ApiOperationalException, hubName = ''): OperationalException {
  const severity = a.severity === 'critical' || a.severity === 'high' ? 'critical' : a.severity === 'medium' || a.severity === 'moderate' ? 'warning' : 'info';
  const category = a.type === 'sync_delayed' ? 'sync_error' : a.type === 'equipment_fault' ? 'equipment_fault' : a.type === 'unassigned_task' ? 'unassigned_encounter' : a.type === 'wait_time_breach' ? 'wait_time_breach' : 'other';
  return {
    id: a.id, code: a.id, title: a.title ?? a.summary ?? '', titleBn: value(a.titleBn), category, severity,
    hubId: a.hubId, hubName: value(a.hub?.name ?? hubName), sessionId: a.sessionId ?? undefined,
    encounterId: a.entityType === 'encounter' ? a.entityId : undefined, createdAt: formatApiTime(a.raisedAt ?? a.detectedAt),
    status: a.status,
    details: value(a.description ?? a.summary),
  };
}

export function mapApiAuditEventToAuditEvent(a: ApiAuditEvent, hubName = ''): AuditEvent {
  const entity = a.targetType?.toLowerCase() ?? '';
  const types: Record<string, AuditEvent['entityType']> = { hub: 'Hub', session: 'Session', appointment: 'Appointment', queue_ticket: 'Queue', staff_shift: 'Staff', equipment: 'Equipment', encounter: 'Encounter', patient: 'Patient', region: 'Region', hub_catchment: 'Catchment', notification: 'Notification' };
  return {
    id: a.id, timestamp: a.occurredAt ?? '', actorName: a.actorName ?? '', actorRole: a.actorRole ?? '',
    action: a.action ?? '', entityType: types[entity] ?? 'Security', entityId: a.targetId ?? '', hubName: value(a.hub?.name ?? hubName),
    details: [a.reason, typeof a.metadata === 'string' ? a.metadata : a.metadata ? JSON.stringify(a.metadata) : undefined].filter(Boolean).join(' | '),
    outcome: a.outcome === 'success' ? 'success' : a.outcome === 'denied' ? 'denied' : 'flagged',
  };
}
