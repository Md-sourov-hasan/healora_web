import { createContext } from 'react';
import type {
  Language,
  UserRole,
  Hub,
  HubSession,
  HubAppointment,
  Patient,
  QueueItem,
  HubStation,
  HubEquipment,
  StaffMember,
  Encounter,
  AuditEvent,
  QueueState,
  EquipmentStatus,
  StationStatus,
} from '../types';
import type { TranslationDict } from '../i18n/translations';

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
  simpleMode: boolean;
  setSimpleMode: (v: boolean) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  selectedHubId: string;
  setSelectedHubId: (id: string) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  hubs: Hub[];
  sessions: HubSession[];
  appointments: HubAppointment[];
  queue: QueueItem[];
  patients: Patient[];
  stations: HubStation[];
  equipment: HubEquipment[];
  staff: StaffMember[];
  encounters: Encounter[];
  auditLogs: AuditEvent[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  checkInAppointment: (appointmentId: string) => void;
  callNextPatient: (stationId: string) => void;
  advanceQueueStatus: (queueId: string, nextStatus: QueueState) => void;
  transferStation: (queueId: string, newStationId: string) => void;
  registerWalkIn: (patient: Partial<Patient>, serviceType: string) => void;
  createSession: (session: Partial<HubSession>) => boolean;
  toggleStationStatus: (stationId: string, newStatus: StationStatus) => void;
  toggleEquipmentStatus: (eqId: string, newStatus: EquipmentStatus) => void;
  retrySyncEncounter: (encounterId: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

