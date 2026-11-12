/**
 * Healora Live Database State
 * ZERO dummy data: all initial records are empty arrays.
 * Data is populated exclusively from live backend API endpoints
 * and real user operational interactions.
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
  AuditEvent,
  Region,
  CatchmentArea,
  AppNotification,
  OperationalException,
} from '../types';

export const initialHubs: Hub[] = [];
export const initialSessions: HubSession[] = [];
export const initialPatients: Patient[] = [];
export const initialAppointments: HubAppointment[] = [];
export const initialQueueItems: QueueItem[] = [];
export const initialStations: HubStation[] = [];
export const initialEquipment: HubEquipment[] = [];
export const initialStaff: StaffMember[] = [];
export const initialEncounters: Encounter[] = [];
export const initialAuditLogs: AuditEvent[] = [];
export const initialRegions: Region[] = [];
export const initialCatchments: CatchmentArea[] = [];
export const initialNotifications: AppNotification[] = [];
export const initialExceptions: OperationalException[] = [];
