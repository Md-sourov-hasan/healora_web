import React, { createContext, useState, useEffect, useCallback } from 'react';
import type {
  AppRoute,
  Language,
  UserRole,
  Hub,
  HubStatus,
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
  Region,
  CatchmentArea,
  AppNotification,
  OperationalException,
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
  initialRegions,
  initialCatchments,
  initialNotifications,
  initialExceptions,
} from '../mockData/mockDatabase';
import { translations, type TranslationDict } from '../i18n/translations';

export function normalizeRoute(path: string): AppRoute {
  const clean = path.toLowerCase().replace(/^\/+/, '').split('?')[0].split('#')[0];
  switch (clean) {
    case '':
    case 'overview':
    case 'dashboard':
      return '/dashboard';
    case 'hubs':
      return '/hubs';
    case 'regions':
    case 'catchment':
      return '/regions';
    case 'sessions':
    case 'camps':
      return '/sessions';
    case 'appointments':
    case 'booking':
      return '/appointments';
    case 'queue':
    case 'live-queue':
      return '/queue';
    case 'patients':
      return '/patients';
    case 'team':
    case 'roster':
      return '/team';
    case 'stations':
      return '/stations';
    case 'equipment':
    case 'devices':
      return '/equipment';
    case 'encounters':
      return '/encounters';
    case 'exceptions':
      return '/exceptions';
    case 'reports':
    case 'analytics':
      return '/reports';
    case 'notifications':
    case 'activity':
      return '/notifications';
    case 'settings':
    case 'permissions':
      return '/settings';
    case 'audit':
    case 'audit-logs':
      return '/audit-logs';
    default:
      return '/dashboard';
  }
}

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
  activeView: AppRoute;
  setActiveView: (view: AppRoute) => void;
  navigate: (routeOrPath: string) => void;
  hubs: Hub[];
  regions: Region[];
  catchments: CatchmentArea[];
  sessions: HubSession[];
  appointments: HubAppointment[];
  queue: QueueItem[];
  patients: Patient[];
  stations: HubStation[];
  equipment: HubEquipment[];
  staff: StaffMember[];
  encounters: Encounter[];
  auditLogs: AuditEvent[];
  notifications: AppNotification[];
  exceptions: OperationalException[];
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
  cancelSession: (sessionId: string, reason: string) => void;
  createAppointment: (apt: Partial<HubAppointment>) => void;
  markAppointmentNoShow: (appointmentId: string) => void;
  toggleStationStatus: (stationId: string, newStatus: StationStatus) => void;
  toggleEquipmentStatus: (eqId: string, newStatus: EquipmentStatus) => void;
  retrySyncEncounter: (encounterId: string) => void;
  reassignEncounter: (encounterId: string, newWorker: string) => void;
  resolveException: (exceptionId: string, notes?: string) => void;
  acknowledgeNotification: (id: string) => void;
  dismissNotification: (id: string) => void;
  addHub: (hub: Partial<Hub>) => void;
  updateHubStatus: (hubId: string, status: HubStatus) => void;
  addRegion: (region: Partial<Region>) => void;
  addCatchment: (catchment: Partial<CatchmentArea>) => void;
  addStaffMember: (member: Partial<StaffMember>) => void;
  addStation: (station: Partial<HubStation>) => void;
  addEquipment: (eq: Partial<HubEquipment>) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<UserRole>('hub_manager');
  const [selectedHubId, setSelectedHubId] = useState<string>('hub_dhaka_01');
  const [activeView, setActiveViewState] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? normalizeRoute(window.location.pathname) : '/dashboard'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  const [hubs, setHubs] = useState<Hub[]>(initialHubs);
  const [regions, setRegions] = useState<Region[]>(initialRegions);
  const [catchments, setCatchments] = useState<CatchmentArea[]>(initialCatchments);
  const [sessions, setSessions] = useState<HubSession[]>(initialSessions);
  const [appointments, setAppointments] = useState<HubAppointment[]>(initialAppointments);
  const [queue, setQueue] = useState<QueueItem[]>(initialQueueItems);
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [stations, setStations] = useState<HubStation[]>(initialStations);
  const [equipment, setEquipment] = useState<HubEquipment[]>(initialEquipment);
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff);
  const [encounters, setEncounters] = useState<Encounter[]>(initialEncounters);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);
  const [exceptions, setExceptions] = useState<OperationalException[]>(initialExceptions);

  const t = translations[language];

  // Navigate helper syncs state & window history
  const navigate = useCallback((target: string) => {
    const route = normalizeRoute(target);
    setActiveViewState(route);
    if (typeof window !== 'undefined' && window.location.pathname !== route) {
      window.history.pushState(null, '', route);
    }
  }, []);

  const setActiveView = useCallback((route: AppRoute) => {
    navigate(route);
  }, [navigate]);

  useEffect(() => {
    const handlePopState = () => {
      setActiveViewState(normalizeRoute(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    const activeHub = hubs.find((h) => h.id === selectedHubId)?.name || 'Central Platform';
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
          : activeRole === 'regional_ops_manager'
          ? 'Tariqul Islam (Regional Ops)'
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

    // Add notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'queue',
      title: `Queue Token Issued (${tokenNum})`,
      titleBn: `সিরিয়াল টোকেন ইস্যু (${tokenNum})`,
      message: `Checked in patient ${apt.patientName}. Token ${tokenNum} routed to Reception Station.`,
      messageBn: `রোগী ${apt.patientNameBn} চেক-ইন সম্পন্ন। টোকেন ${tokenNum} অভ্যর্থনা স্টেশনে পাঠানো হয়েছে।`,
      channel: 'sms',
      recipientRoleOrPhone: apt.patientPhone,
      status: 'delivered',
      hubId: apt.hubId,
      hubName: apt.hubName,
      priority: 'normal',
      deepLinkPath: '/queue',
      acknowledged: true,
    };
    setNotifications((prev) => [newNotif, ...prev]);

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

  const cancelSession = (sessionId: string, reason: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' } : s))
    );
    addAuditLog(
      `Session Cancelled (${sessionId})`,
      'Session',
      sessionId,
      `Session cancelled with reason: ${reason}. Automated notifications dispatched.`
    );
    showToast(`Session cancelled. Reason: ${reason}`);
  };

  const createAppointment = (aptData: Partial<HubAppointment>) => {
    const curHub = hubs.find((h) => h.id === selectedHubId);
    const newApt: HubAppointment = {
      id: `apt_${Date.now()}`,
      appointmentCode: `APT-2611-${Math.floor(10 + Math.random() * 90)}`,
      patientId: aptData.patientId || `pat_${Date.now()}`,
      patientName: aptData.patientName || 'Booked Patient',
      patientNameBn: aptData.patientNameBn || aptData.patientName || 'বুক করা রোগী',
      patientPhone: aptData.patientPhone || '+880 1711 000000',
      hubId: selectedHubId,
      hubName: curHub?.name || 'Dhaka Central Hub',
      sessionId: aptData.sessionId || sessions[0]?.id || 'ses_dhk_01',
      serviceType: aptData.serviceType || 'Basic Vitals & Screening',
      slotTime: aptData.slotTime || '10:30 AM',
      status: 'confirmed',
      bookingSource: aptData.bookingSource || 'patient_app',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      consentRecorded: true,
    };

    setAppointments((prev) => [newApt, ...prev]);
    addAuditLog(
      `Appointment Booked (${newApt.appointmentCode})`,
      'Appointment',
      newApt.id,
      `Confirmed appointment for ${newApt.patientName} at ${newApt.slotTime}.`
    );
    showToast(`Appointment confirmed: ${newApt.appointmentCode}`);
  };

  const markAppointmentNoShow = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'no_show' } : a))
    );
    addAuditLog(
      `Appointment Marked No-Show (${appointmentId})`,
      'Appointment',
      appointmentId,
      `Patient did not arrive within grace threshold.`
    );
    showToast(`Marked appointment as No-Show.`);
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

      // clear related exception
      setExceptions((prev) =>
        prev.map((exc) => (exc.encounterId === encounterId ? { ...exc, status: 'resolved' } : exc))
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

  const reassignEncounter = (encounterId: string, newWorker: string) => {
    setEncounters((prev) =>
      prev.map((e) => (e.id === encounterId ? { ...e, assignedWorkerName: newWorker, status: 'assigned' } : e))
    );
    addAuditLog(
      `Encounter Reassigned (${encounterId})`,
      'Encounter',
      encounterId,
      `Transferred operational responsibility to ${newWorker}.`
    );
    showToast(`Encounter reassigned to ${newWorker}`);
  };

  const resolveException = (exceptionId: string, notes?: string) => {
    setExceptions((prev) =>
      prev.map((exc) => (exc.id === exceptionId ? { ...exc, status: 'resolved' } : exc))
    );
    addAuditLog(
      `Operational Exception Resolved (${exceptionId})`,
      'Security',
      exceptionId,
      notes || 'Resolved by operational supervisor.'
    );
    showToast(`Exception resolved.`);
  };

  const acknowledgeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, acknowledged: true } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Notification dismissed.');
  };

  const addHub = (hubData: Partial<Hub>) => {
    const newHub: Hub = {
      id: `hub_${Date.now()}`,
      code: hubData.code || `HUB-${Math.floor(10 + Math.random() * 90)}`,
      name: hubData.name || 'New Physical Hub',
      nameBn: hubData.nameBn || hubData.name || 'নতুন শারীরিক সেবা কেন্দ্র',
      status: hubData.status || 'draft',
      regionId: hubData.regionId || 'reg_dhaka',
      division: hubData.division || 'Dhaka',
      district: hubData.district || 'Dhaka',
      upazila: hubData.upazila || 'Sadar',
      unionName: hubData.unionName || 'Ward 1',
      address: hubData.address || 'Address pending verification',
      addressBn: hubData.addressBn || 'ঠিকানা যাচাইকরণ প্রক্রিয়াধীন',
      phone: hubData.phone || '+880 1711 000000',
      operatingHours: hubData.operatingHours || '09:00 AM - 05:00 PM',
      services: hubData.services || ['Basic Vitals', 'Doctor Review'],
      assignedManager: hubData.assignedManager || 'Unassigned',
      emergencyReferralFacility: hubData.emergencyReferralFacility || 'District Sadar Hospital',
      emergencyPhone: hubData.emergencyPhone || '+880 1711 999999',
      capacityPerDay: hubData.capacityPerDay || 50,
      activeSessionsToday: 0,
      openStationsCount: 3,
      totalDevicesCount: 5,
    };
    setHubs((prev) => [...prev, newHub]);
    addAuditLog(`New Hub Created (${newHub.code})`, 'Hub', newHub.id, `Created ${newHub.name}.`);
    showToast(`Created Hub: ${newHub.name}`);
  };

  const updateHubStatus = (hubId: string, status: HubStatus) => {
    setHubs((prev) => prev.map((h) => (h.id === hubId ? { ...h, status } : h)));
    addAuditLog(`Hub Status Changed: ${hubId} -> ${status}`, 'Hub', hubId, `Status updated.`);
    showToast(`Hub status changed to ${status}`);
  };

  const addRegion = (regionData: Partial<Region>) => {
    const newReg: Region = {
      id: `reg_${Date.now()}`,
      code: regionData.code || `REG-${Math.floor(10 + Math.random() * 90)}`,
      name: regionData.name || 'New Regional Care Network',
      nameBn: regionData.nameBn || regionData.name || 'নতুন আঞ্চলিক সেবা নেটওয়ার্ক',
      division: regionData.division || 'Dhaka',
      regionalManagerName: regionData.regionalManagerName || 'Regional Director',
      regionalManagerPhone: regionData.regionalManagerPhone || '+880 1711 000000',
      totalHubsCount: 1,
      activeHubsCount: 1,
      catchmentPopulation: regionData.catchmentPopulation || 500000,
      districts: regionData.districts || ['Dhaka'],
      catchmentUnions: regionData.catchmentUnions || ['Union 1'],
      status: regionData.status || 'active',
    };
    setRegions((prev) => [...prev, newReg]);
    addAuditLog(`New Region Configured (${newReg.code})`, 'Region', newReg.id, `Created ${newReg.name}.`);
    showToast(`Region added: ${newReg.name}`);
  };

  const addCatchment = (cData: Partial<CatchmentArea>) => {
    const curHub = hubs.find((h) => h.id === (cData.hubId || selectedHubId));
    const newC: CatchmentArea = {
      id: `catch_${Date.now()}`,
      regionId: cData.regionId || curHub?.regionId || 'reg_dhaka',
      hubId: curHub?.id || selectedHubId,
      hubName: curHub?.name || 'Dhaka Central Hub',
      name: cData.name || 'New Catchment Area',
      nameBn: cData.nameBn || cData.name || 'নতুন ক্যাচমেন্ট এলাকা',
      upazila: cData.upazila || 'Upazila Sadar',
      unions: cData.unions || ['Union 1', 'Union 2'],
      estimatedPopulation: cData.estimatedPopulation || 150000,
      coverageRadiusKm: cData.coverageRadiusKm || 8,
      basis: cData.basis || 'operations_assignment',
      outOfCatchmentPolicy: cData.outOfCatchmentPolicy || 'allowed_with_capacity',
    };
    setCatchments((prev) => [...prev, newC]);
    addAuditLog(`Catchment Area Added (${newC.name})`, 'Catchment', newC.id, `Mapped to ${newC.hubName}.`);
    showToast(`Catchment added: ${newC.name}`);
  };

  const addStaffMember = (sData: Partial<StaffMember>) => {
    const newStaff: StaffMember = {
      id: `staff_${Date.now()}`,
      fullName: sData.fullName || 'New Staff Member',
      fullNameBn: sData.fullNameBn || sData.fullName || 'নতুন কর্মী',
      role: sData.role || 'field_health_worker',
      roleTitle: sData.roleTitle || 'Health Worker',
      roleTitleBn: sData.roleTitleBn || 'স্বাস্থ্যকর্মী',
      phone: sData.phone || '+880 1711 000000',
      bmdcOrLicenseNumber: sData.bmdcOrLicenseNumber || 'Training Certified (Protocol v2.4)',
      active: true,
      assignedHubIds: [selectedHubId],
      supervisorName: 'Hub Manager',
      credentialVerified: sData.credentialVerified ?? true,
      activeShift: sData.activeShift || '08:30 AM - 04:30 PM',
    };
    setStaff((prev) => [...prev, newStaff]);
    addAuditLog(`Staff Member Added (${newStaff.fullName})`, 'Staff', newStaff.id, `Assigned role: ${newStaff.role}.`);
    showToast(`Staff member registered: ${newStaff.fullName}`);
  };

  const addStation = (stData: Partial<HubStation>) => {
    const newSt: HubStation = {
      id: `st_${Date.now()}`,
      hubId: selectedHubId,
      name: stData.name || 'New Service Station',
      nameBn: stData.nameBn || stData.name || 'নতুন সেবা স্টেশন',
      stationType: stData.stationType || 'vitals',
      status: 'available',
      currentStaffName: stData.currentStaffName || 'Unassigned',
      completedTodayCount: 0,
      supportedServices: stData.supportedServices || ['Basic Vitals'],
    };
    setStations((prev) => [...prev, newSt]);
    addAuditLog(`Station Added (${newSt.name})`, 'Hub', newSt.id, `Added to hub ${selectedHubId}.`);
    showToast(`Station added: ${newSt.name}`);
  };

  const addEquipment = (eqData: Partial<HubEquipment>) => {
    const newEq: HubEquipment = {
      id: `eq_${Date.now()}`,
      code: eqData.code || `DEV-${Math.floor(100 + Math.random() * 900)}`,
      name: eqData.name || 'Medical Screening Device',
      category: eqData.category || 'bp_monitor',
      model: eqData.model || 'Standard Clinical',
      serialNumber: eqData.serialNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      hubId: selectedHubId,
      stationId: eqData.stationId,
      stationName: eqData.stationName,
      status: 'available',
      lastCalibrationDate: new Date().toISOString().slice(0, 10),
      nextCalibrationDue: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      batteryPercent: 100,
      notes: eqData.notes || 'Certified benchmark calibration passed.',
    };
    setEquipment((prev) => [...prev, newEq]);
    addAuditLog(`Equipment Registered (${newEq.code})`, 'Equipment', newEq.id, `Added ${newEq.name}.`);
    showToast(`Equipment registered: ${newEq.code}`);
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
        navigate,
        hubs,
        regions,
        catchments,
        sessions,
        appointments,
        queue,
        patients,
        stations,
        equipment,
        staff,
        encounters,
        auditLogs,
        notifications,
        exceptions,
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
        cancelSession,
        createAppointment,
        markAppointmentNoShow,
        toggleStationStatus,
        toggleEquipmentStatus,
        retrySyncEncounter,
        reassignEncounter,
        resolveException,
        acknowledgeNotification,
        dismissNotification,
        addHub,
        updateHubStatus,
        addRegion,
        addCatchment,
        addStaffMember,
        addStation,
        addEquipment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { useApp } from './useApp';
