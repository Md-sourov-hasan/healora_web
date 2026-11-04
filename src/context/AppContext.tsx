import React, { createContext, useState, useEffect } from 'react';
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
import {
  initialHubs,
  initialSessions,
  initialPatients,
  initialAppointments,
  initialQueueItems,
  initialStations,
  initialEquipment,
  initialStaff,
  initialEncounters,
  initialAuditLogs,
} from '../mockData/mockDatabase';
import { translations, type TranslationDict } from '../i18n/translations';

interface AppContextType {
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<UserRole>('hub_manager');
  const [selectedHubId, setSelectedHubId] = useState<string>('hub_dhaka_01');
  const [activeView, setActiveView] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const [hubs] = useState<Hub[]>(initialHubs);
  const [sessions, setSessions] = useState<HubSession[]>(initialSessions);
  const [appointments, setAppointments] = useState<HubAppointment[]>(initialAppointments);
  const [queue, setQueue] = useState<QueueItem[]>(initialQueueItems);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [stations, setStations] = useState<HubStation[]>(initialStations);
  const [equipment, setEquipment] = useState<HubEquipment[]>(initialEquipment);
  const [staff] = useState<StaffMember[]>(initialStaff);
  const [encounters, setEncounters] = useState<Encounter[]>(initialEncounters);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(initialAuditLogs);

  const t = translations[language];

  useEffect(() => {
    if (simpleMode) {
      document.body.classList.add('simple-mode');
    } else {
      document.body.classList.remove('simple-mode');
    }
  }, [simpleMode]);

  useEffect(() => {
    if (language === 'bn') {
      document.body.classList.add('lang-bn');
    } else {
      document.body.classList.remove('lang-bn');
    }
  }, [language]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const addAuditLog = (
    action: string,
    entityType: AuditEvent['entityType'],
    entityId: string,
    details: string,
    outcome: AuditEvent['outcome'] = 'success'
  ) => {
    const activeHub = hubs.find((h) => h.id === selectedHubId)?.name || 'General';
    const newLog: AuditEvent = {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actorName:
        activeRole === 'hub_manager'
          ? 'Kamrul Hassan (Hub Mgr)'
          : activeRole === 'reception_officer'
          ? 'Anisur Rahman (Reception)'
          : activeRole === 'local_doctor'
          ? 'Dr. Arjun Mehta (Doctor)'
          : activeRole === 'field_health_worker'
          ? 'Nasrin Sultana (HW)'
          : 'System Administrator',
      actorRole: activeRole,
      action,
      entityType,
      entityId,
      hubName: activeHub,
      details,
      outcome,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const checkInAppointment = (appointmentId: string) => {
    const apt = appointments.find((a) => a.id === appointmentId);
    if (!apt) return;

    const tokenNum = `A-${Math.floor(100 + Math.random() * 900)}`;
    const newQueueItem: QueueItem = {
      id: `q_${Date.now()}`,
      ticketNumber: tokenNum,
      encounterId: `enc_${Date.now()}`,
      appointmentId: apt.id,
      patientId: apt.patientId,
      patientName: apt.patientName,
      patientNameBn: apt.patientNameBn,
      patientPhone: apt.patientPhone,
      hubId: apt.hubId,
      sessionId: apt.sessionId,
      stationId: 'st_dhk_01',
      stationName: 'Station 1: Reception & Identity',
      currentStatus: 'waiting',
      priority: 'normal',
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waitMinutes: 0,
      serviceType: apt.serviceType,
      assignedStaffName: 'Unassigned',
      stepProgress: 1,
    };

    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'checked_in', queueToken: tokenNum } : a))
    );
    setQueue((prev) => [newQueueItem, ...prev]);

    addAuditLog(
      `Patient Check-In Processed (${tokenNum})`,
      'Appointment',
      appointmentId,
      `Issued queue ticket ${tokenNum} for patient ${apt.patientName}. Transferred to reception waiting line.`
    );
    showToast(`Checked in ${apt.patientName}. Issued Token: ${tokenNum}`);
  };

  const callNextPatient = (stationId: string) => {
    const station = stations.find((s) => s.id === stationId);
    const waitingItems = queue.filter((q) => q.stationId === stationId && q.currentStatus === 'waiting');
    if (waitingItems.length === 0) {
      showToast('No patients currently waiting at this station.');
      return;
    }
    const nextItem = waitingItems[0];
    setQueue((prev) =>
      prev.map((q) => (q.id === nextItem.id ? { ...q, currentStatus: 'called', waitMinutes: q.waitMinutes + 1 } : q))
    );
    setStations((prev) =>
      prev.map((s) => (s.id === stationId ? { ...s, currentTicketNumber: nextItem.ticketNumber, status: 'busy' } : s))
    );

    addAuditLog(
      `Called Token ${nextItem.ticketNumber} to ${station?.name || 'Station'}`,
      'Queue',
      nextItem.id,
      `Assigned patient ${nextItem.patientName} to active service.`
    );
    showToast(`Calling Token ${nextItem.ticketNumber} to ${station?.name || 'Station'}`);
  };

  const advanceQueueStatus = (queueId: string, nextStatus: QueueState) => {
    setQueue((prev) =>
      prev.map((q) => {
        if (q.id !== queueId) return q;
        let progress = q.stepProgress;
        if (nextStatus === 'in_service') progress = 2;
        if (nextStatus === 'awaiting_review') progress = 3;
        if (nextStatus === 'completed') progress = 4;
        return { ...q, currentStatus: nextStatus, stepProgress: progress };
      })
    );

    const item = queue.find((q) => q.id === queueId);
    if (item) {
      addAuditLog(
        `Queue State Updated: ${item.ticketNumber} -> ${nextStatus}`,
        'Queue',
        queueId,
        `Patient ${item.patientName} progressed to status: ${nextStatus}`
      );
      showToast(`Token ${item.ticketNumber} is now: ${nextStatus.replace('_', ' ')}`);
    }
  };

  const transferStation = (queueId: string, newStationId: string) => {
    const targetStation = stations.find((s) => s.id === newStationId);
    if (!targetStation) return;

    setQueue((prev) =>
      prev.map((q) =>
        q.id === queueId
          ? {
              ...q,
              stationId: newStationId,
              stationName: targetStation.name,
              currentStatus: 'waiting',
              stepProgress: targetStation.stationType === 'vitals' ? 2 : targetStation.stationType === 'doctor_review' ? 3 : 4,
            }
          : q
      )
    );

    const item = queue.find((q) => q.id === queueId);
    if (item) {
      addAuditLog(
        `Transferred Token ${item.ticketNumber} to ${targetStation.name}`,
        'Queue',
        queueId,
        `Routing patient to next care step.`
      );
      showToast(`Transferred Token ${item.ticketNumber} to ${targetStation.name}`);
    }
  };

  const registerWalkIn = (patientData: Partial<Patient>, serviceType: string) => {
    const canonicalId = `PAT-88${Math.floor(100 + Math.random() * 900)}-${selectedHubId.split('_')[1]?.toUpperCase() || 'HUB'}`;
    const newPatient: Patient = {
      id: `pat_${Date.now()}`,
      canonicalHealoraId: canonicalId,
      fullName: patientData.fullName || 'Walk-in Patient',
      fullNameBn: patientData.fullNameBn || patientData.fullName || 'ওয়াক-ইন রোগী',
      age: patientData.age || 45,
      gender: patientData.gender || 'Female',
      phone: patientData.phone || '+880 1700 000000',
      district: patientData.district || 'Dhaka',
      upazila: patientData.upazila || 'Dhanmondi',
      nationalIdMasked: '1980269000000****',
      consentStatus: 'active',
      consentDate: new Date().toISOString().slice(0, 10),
      preferredHubId: selectedHubId,
      totalEncounters: 1,
    };

    const tokenNum = `W-${Math.floor(100 + Math.random() * 900)}`;
    const newQueueItem: QueueItem = {
      id: `q_${Date.now()}`,
      ticketNumber: tokenNum,
      encounterId: `enc_${Date.now()}`,
      patientId: newPatient.id,
      patientName: newPatient.fullName,
      patientNameBn: newPatient.fullNameBn,
      patientPhone: newPatient.phone,
      hubId: selectedHubId,
      sessionId: sessions[0]?.id || 'ses_dhk_01',
      stationId: 'st_dhk_01',
      stationName: 'Station 1: Reception & Identity',
      currentStatus: 'waiting',
      priority: 'normal',
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waitMinutes: 0,
      serviceType: serviceType || 'Basic Vitals & Screening',
      assignedStaffName: 'Reception Desk',
      stepProgress: 1,
    };

    setPatients((prev) => [newPatient, ...prev]);
    setQueue((prev) => [newQueueItem, ...prev]);

    // update walkInUsed in current session
    setSessions((prev) =>
      prev.map((s) => (s.id === newQueueItem.sessionId ? { ...s, walkInUsed: s.walkInUsed + 1 } : s))
    );

    addAuditLog(
      `Assisted Walk-In Registered (${canonicalId})`,
      'Patient',
      newPatient.id,
      `Verified identity, obtained informed consent, issued token ${tokenNum}.`
    );
    showToast(`Walk-in registered for ${newPatient.fullName}. Token: ${tokenNum}`);
  };

  const createSession = (sessionData: Partial<HubSession>): boolean => {
    // Check prerequisites (PRD Section 8.5 & Acceptance criteria 20.1)
    const hasStaff = (sessionData.healthWorkersCount || 0) >= 1 && (sessionData.doctorsCount || 0) >= 1;
    const hasEquipment = sessionData.requiredEquipmentReady ?? true;

    if (!hasStaff && !sessionData.overrideReason) {
      showToast('Error: Minimum staffing required (at least 1 HW & 1 Doctor) or provide override reason.');
      return false;
    }

    const currentHub = hubs.find((h) => h.id === selectedHubId);
    const newSession: HubSession = {
      id: `ses_${Date.now()}`,
      hubId: selectedHubId,
      hubName: currentHub?.name || 'Dhaka Central Hub',
      title: sessionData.title || 'Special Scheduled Session',
      titleBn: sessionData.titleBn || 'নির্ধারিত বিশেষ সেশন',
      serviceType: sessionData.serviceType || 'basic_vitals',
      date: sessionData.date || new Date().toISOString().slice(0, 10),
      startTime: sessionData.startTime || '09:00 AM',
      endTime: sessionData.endTime || '02:00 PM',
      sessionType: sessionData.sessionType || 'standard_clinic',
      status: 'open_for_booking',
      bookedCount: 0,
      totalCapacity: sessionData.totalCapacity || 30,
      walkInCapacity: sessionData.walkInCapacity || 8,
      walkInUsed: 0,
      teamLeadId: staff[2]?.id || 'staff_lead_01',
      teamLeadName: staff[2]?.fullName || 'Salma Khatun',
      healthWorkersCount: sessionData.healthWorkersCount || 2,
      doctorsCount: sessionData.doctorsCount || 1,
      requiredEquipmentReady: hasEquipment,
      minimumStaffReady: hasStaff,
      overrideReason: sessionData.overrideReason,
    };

    setSessions((prev) => [newSession, ...prev]);
    addAuditLog(
      `New Hub Session Published: ${newSession.title}`,
      'Session',
      newSession.id,
      `Capacity ${newSession.totalCapacity} slots (${newSession.walkInCapacity} walk-ins). Prerequisites validated.`
    );
    showToast(`Published session: ${newSession.title}`);
    return true;
  };

  const toggleStationStatus = (stationId: string, newStatus: StationStatus) => {
    setStations((prev) =>
      prev.map((s) => (s.id === stationId ? { ...s, status: newStatus } : s))
    );
    addAuditLog(
      `Station Status Changed: ${stationId} -> ${newStatus}`,
      'Hub',
      stationId,
      `Station operational state updated.`
    );
    showToast(`Station updated to: ${newStatus}`);
  };

  const toggleEquipmentStatus = (eqId: string, newStatus: EquipmentStatus) => {
    setEquipment((prev) =>
      prev.map((eq) => (eq.id === eqId ? { ...eq, status: newStatus } : eq))
    );
    const eq = equipment.find((e) => e.id === eqId);
    addAuditLog(
      `Equipment Status Changed: ${eq?.name || eqId} -> ${newStatus}`,
      'Equipment',
      eqId,
      `Device operational status changed to: ${newStatus}`
    );
    showToast(`Device ${eq?.code || ''} is now: ${newStatus.replace('_', ' ')}`);
  };

  const retrySyncEncounter = (encounterId: string) => {
    setEncounters((prev) =>
      prev.map((enc) =>
        enc.id === encounterId
          ? {
              ...enc,
              syncState: 'retrying',
              lastSyncAttempt: 'Retrying sync with central server...',
            }
          : enc
      )
    );

    setTimeout(() => {
      setEncounters((prev) =>
        prev.map((enc) =>
          enc.id === encounterId
            ? {
                ...enc,
                syncState: 'synced',
                lastSyncAttempt: `Acknowledged by Central Backend (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
              }
            : enc
        )
      );
      addAuditLog(
        `Observation Sync Succeeded (Idempotency Key verified)`,
        'Encounter',
        encounterId,
        `Mobile pending outbox data synced to canonical patient vitals timeline.`
      );
      showToast(`Encounter synced successfully with canonical record!`);
    }, 1200);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        simpleMode,
        setSimpleMode,
        activeRole,
        setActiveRole,
        selectedHubId,
        setSelectedHubId,
        activeView,
        setActiveView,
        hubs,
        sessions,
        appointments,
        queue,
        patients,
        stations,
        equipment,
        staff,
        encounters,
        auditLogs,
        searchQuery,
        setSearchQuery,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        toast,
        showToast,
        checkInAppointment,
        callNextPatient,
        advanceQueueStatus,
        transferStation,
        registerWalkIn,
        createSession,
        toggleStationStatus,
        toggleEquipmentStatus,
        retrySyncEncounter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { useApp } from './useApp';
