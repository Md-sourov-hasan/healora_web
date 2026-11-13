import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
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
import { translations, type TranslationDict } from '../i18n/translations';
import {
  authService,
  type StaffLoginResponse,
  type MeResponse,
} from '../services/authService';
import { hubsService } from '../services/hubsService';
import { regionsService } from '../services/regionsService';
import { sessionsService } from '../services/sessionsService';
import { appointmentsService } from '../services/appointmentsService';
import { queueService } from '../services/queueService';
import { stationsEquipmentService } from '../services/stationsEquipmentService';
import { encountersExceptionsService } from '../services/encountersExceptionsService';
import { reportsAuditService, type DashboardOverviewResponse } from '../services/reportsAuditService';
import { staffService, type ApiRoleAssignment } from '../services/staffService';
import { catalogService, type ApiServiceType } from '../services/catalogService';
import { patientsService } from '../services/patientsService';
import { CORE_OPERATIONS_ROLES, isRouteAllowedForRole, ROLES_CONFIG, toApiRole, toUiRole } from '../config/rolesConfig';
import { ApiError, getStoredAccessToken, refreshAuthToken } from '../services/apiClient';
import {
  mapApiHubToHub,
  mapApiRegionToRegion,
  mapApiSessionToSession,
  mapApiAppointmentToAppointment,
  mapApiQueueTicketToQueueItem,
  mapApiStationToStation,
  mapApiEquipmentToEquipment,
  mapApiNotificationToNotification,
  mapApiExceptionToException,
  mapApiAuditEventToAuditEvent,
  mapApiCatchmentToCatchment,
  mapApiEncounterToEncounter,
  formatApiTime,
} from '../services/apiMappers';

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
    case 'catalog':
    case 'catalogue':
    case 'protocols':
      return '/catalog';
    case 'audit':
    case 'audit-logs':
      return '/audit-logs';
    default:
      return '/dashboard';
  }
}

export type ApiConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
  simpleMode: boolean;
  setSimpleMode: (v: boolean) => void;
  activeRole: UserRole;
  availableRoles: UserRole[];
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
  // Auth & Backend Integration State
  isAuthenticated: boolean;
  currentUser: MeResponse['user'] | null;
  apiStatus: ApiConnectionStatus;
  apiLatency: number | null;
  apiErrors: string[];
  dashboardOverview: DashboardOverviewResponse | null;
  serviceTypes: ApiServiceType[];
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  mfaChallenge: { challengeId: string; expiresIn: number } | null;
  passwordChangeRequired: boolean;
  mfaEnrollmentRequired: boolean;
  mfaEnrollmentUri: string | null;
  loginWithCredentials: (email: string, pass: string) => Promise<StaffLoginResponse>;
  verifyMfaCode: (code: string) => Promise<'password' | 'enroll' | 'complete'>;
  changeStaffPassword: (curr: string, newPass: string) => Promise<void>;
  enrollStaffMfa: () => Promise<void>;
  confirmStaffMfa: (code: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshBackendData: () => Promise<void>;
  // Operational Actions
  checkInAppointment: (appointmentId: string) => Promise<void>;
  callNextPatient: (stationId: string) => Promise<void>;
  advanceQueueStatus: (queueId: string, nextStatus: QueueState) => Promise<void>;
  transferStation: (queueId: string, newStationId: string) => Promise<void>;
  registerWalkIn: (patient: Partial<Patient>, sessionId: string, onPatientRegistered?: (id: string) => void) => Promise<string | null>;
  createSession: (session: Partial<HubSession>) => Promise<boolean>;
  publishSession: (sessionId: string, overrideReason?: string) => Promise<void>;
  openBookingSession: (sessionId: string) => Promise<void>;
  startSession: (sessionId: string) => Promise<void>;
  completeSession: (sessionId: string) => Promise<void>;
  cancelSession: (sessionId: string, reason: string) => Promise<boolean>;
  createAppointment: (apt: Partial<HubAppointment>) => Promise<boolean>;
  markAppointmentNoShow: (appointmentId: string) => Promise<void>;
  toggleStationStatus: (stationId: string, newStatus: StationStatus, reason?: string) => Promise<void>;
  toggleEquipmentStatus: (eqId: string, newStatus: EquipmentStatus, reason?: string) => Promise<void>;
  recordEquipmentService: (eqId: string, data: { kind: 'inspection' | 'calibration' | 'maintenance'; notes: string; serviceProvider?: string; nextDueOn?: string }) => Promise<boolean>;
  reassignEncounter: (encounterId: string, userId: string, role: 'special_team_lead' | 'field_health_worker' | 'local_doctor' | 'registered_doctor') => Promise<void>;
  resolveException: (exceptionId: string, notes?: string) => Promise<void>;
  acknowledgeException: (exceptionId: string) => Promise<void>;
  escalateException: (exceptionId: string, to: 'regional_operations' | 'clinical_operations', note: string) => Promise<void>;
  dismissException: (exceptionId: string, reason: string) => Promise<void>;
  acknowledgeNotification: (id: string) => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  addHub: (hub: Partial<Hub>) => Promise<boolean>;
  updateHubProfile: (hubId: string, data: Partial<Hub>) => Promise<boolean>;
  updateHubStatus: (hubId: string, status: HubStatus, reason?: string) => Promise<void>;
  addRegion: (region: Partial<Region> & { parentId?: string }) => Promise<boolean>;
  addCatchment: (catchment: Partial<CatchmentArea>) => Promise<boolean>;
  addStaffMember: (member: Partial<StaffMember>) => Promise<{ userId: string; temporaryPassword: string; activated: boolean } | null>;
  addStation: (station: Partial<HubStation>) => Promise<boolean>;
  addEquipment: (eq: Partial<HubEquipment>) => Promise<boolean>;
  // Role & Permissions Integration
  isReadOnlyRole: boolean;
  canAccessRoute: (route: AppRoute) => boolean;
  roleAssignments: ApiRoleAssignment[];
  assignStaffRole: (userId: string, data: { role: string; scopeType: 'platform' | 'region' | 'hub' | 'session'; hubId?: string; regionId?: string; sessionId?: string }) => Promise<void>;
  revokeStaffRole: (roleAssignmentId: string, reason?: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<UserRole>('hub_manager');
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string>('');
  const [activeView, setActiveViewState] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? normalizeRoute(window.location.pathname) : '/dashboard'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  // Operational data is populated only by authenticated API responses.
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [catchments, setCatchments] = useState<CatchmentArea[]>([]);
  const [sessions, setSessions] = useState<HubSession[]>([]);
  const [appointments, setAppointments] = useState<HubAppointment[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stations, setStations] = useState<HubStation[]>([]);
  const [equipment, setEquipment] = useState<HubEquipment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [exceptions, setExceptions] = useState<OperationalException[]>([]);

  // Authentication & API Integration States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<MeResponse['user'] | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiConnectionStatus>('connecting');
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverviewResponse | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ApiServiceType[]>([]);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [mfaChallenge, setMfaChallenge] = useState<{ challengeId: string; expiresIn: number } | null>(null);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState<boolean>(false);
  const [mfaEnrollmentRequired, setMfaEnrollmentRequired] = useState(false);
  const [mfaEnrollmentUri, setMfaEnrollmentUri] = useState<string | null>(null);
  const [roleAssignments, setRoleAssignments] = useState<ApiRoleAssignment[]>([]);

  const t = translations[language];

  // RBAC & Permission Scoping
  const isReadOnlyRole = useMemo(() => activeRole === 'auditor', [activeRole]);

  const canAccessRoute = useCallback(
    (route: AppRoute) => {
      return isRouteAllowedForRole(route, activeRole);
    },
    [activeRole]
  );

  // Navigate helper syncs state & window history with RBAC validation
  const navigate = useCallback(
    (target: string) => {
      const route = normalizeRoute(target);
      if (!isRouteAllowedForRole(route, activeRole)) {
        const cfg = ROLES_CONFIG[activeRole];
        setToast(
          `Access Restricted: ${cfg?.title || activeRole} does not have permission to view ${route}. Redirected to Dashboard.`
        );
        setTimeout(() => setToast(null), 4500);
        setActiveViewState('/dashboard');
        if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
          window.history.pushState(null, '', '/dashboard');
        }
        return;
      }
      setActiveViewState(route);
      if (typeof window !== 'undefined' && window.location.pathname !== route) {
        window.history.pushState(null, '', route);
      }
    },
    [activeRole]
  );

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

  const handleSetActiveRole = (newRole: UserRole) => {
    if (!isAuthenticated || !availableRoles.includes(newRole)) {
      showToast('This role is not assigned to your account.');
      return;
    }
    setActiveRole(newRole);
    const cfg = ROLES_CONFIG[newRole];
    const roleName = cfg?.title || newRole;
    showToast(`Role scope set to: ${roleName}`);
    if (!isRouteAllowedForRole(activeView, newRole)) {
      setActiveViewState('/dashboard');
      if (typeof window !== 'undefined' && window.location.pathname !== '/dashboard') {
        window.history.pushState(null, '', '/dashboard');
      }
    }
  };

  const assignStaffRole = async (
    userId: string,
    data: { role: string; scopeType: 'platform' | 'region' | 'hub' | 'session'; hubId?: string; regionId?: string; sessionId?: string }
  ) => {
    try {
      const newAssignment = await staffService.assignRole(userId, { ...data, role: toApiRole(data.role) });
      setRoleAssignments((prev) => [newAssignment, ...prev]);
      showToast(`Role ${data.role} successfully assigned to staff.`);
      await refreshBackendData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API error assigning role';
      const code = err instanceof ApiError ? ` (${err.code})` : '';
      showToast(`Failed to assign role: ${msg}${code}`);
      throw err;
    }
  };

  const revokeStaffRole = async (roleAssignmentId: string, reason?: string) => {
    try {
      if (!reason?.trim()) throw new Error('A reason of at least 3 characters is required to revoke a role.');
      await staffService.revokeRole(roleAssignmentId, reason.trim());
      setRoleAssignments((prev) =>
        prev.map((r) => (r.id === roleAssignmentId ? { ...r, status: 'revoked' as const } : r))
      );
      showToast('Staff role assignment revoked.');
      await refreshBackendData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API error revoking role';
      showToast(`Failed to revoke role: ${msg}`);
      throw err;
    }
  };

  /** Fetch all screen data from the authenticated backend. Failed requests clear that dataset. */
  const refreshBackendData = useCallback(async () => {
    if (!getStoredAccessToken()) return;
    setApiStatus('connecting');
    const errors: string[] = [];
    const load = async <T,>(name: string, request: Promise<T>, accept: (data: T) => void, clear: () => void) => {
      try { accept(await request); }
      catch (error) {
        clear();
        const detail = error instanceof ApiError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : 'Request failed';
        errors.push(`${name}: ${detail}`);
      }
    };

    let hubRows: Awaited<ReturnType<typeof hubsService.getHubs>>['items'] = [];
    await Promise.all([
      load('Hubs', hubsService.getHubs({ limit: 200 }), (r) => { hubRows = r.items; setHubs(r.items.map(mapApiHubToHub)); }, () => setHubs([])),
      load('Regions', regionsService.getRegions({ limit: 200 }), (r) => setRegions(r.items.map(mapApiRegionToRegion)), () => setRegions([])),
    ]);
    const hubId = selectedHubId || hubRows[0]?.id || '';
    if (!selectedHubId && hubId) setSelectedHubId(hubId);
    const hubNames = new Map(hubRows.map((h) => [h.id, h.name]));

    let sessionRows: Awaited<ReturnType<typeof sessionsService.getSessions>>['items'] = [];
    await load('Service catalogue', catalogService.getServiceTypes(), (r) => setServiceTypes(r.items), () => setServiceTypes([]));
    if (!hubId) {
      setCatchments([]); setSessions([]); setAppointments([]); setQueue([]); setStations([]); setEquipment([]);
      setStaff([]); setEncounters([]); setExceptions([]); setDashboardOverview(null);
    } else {
      await Promise.all([
        load('Sessions', sessionsService.getSessions({ hubId, limit: 200 }), (r) => { sessionRows = r.items; setSessions(r.items.map((s) => mapApiSessionToSession(s, hubNames.get(s.hubId) ?? ''))); }, () => setSessions([])),
        load('Appointments', appointmentsService.getAppointments({ hubId, limit: 200 }), (r) => setAppointments(r.items.map((a) => mapApiAppointmentToAppointment(a, hubNames.get(a.hubId) ?? ''))), () => setAppointments([])),
        load('Catchments', hubsService.getCatchments(hubId), (r) => setCatchments(r.items.map((x) => mapApiCatchmentToCatchment({ ...x, hubId }))), () => setCatchments([])),
        load('Stations', stationsEquipmentService.getStations(hubId), (r) => setStations(r.map(mapApiStationToStation)), () => setStations([])),
        load('Equipment', stationsEquipmentService.getEquipment({ hubId, limit: 200 }), (r) => setEquipment(r.items.map(mapApiEquipmentToEquipment)), () => setEquipment([])),
        load('Exceptions', encountersExceptionsService.getExceptions({ hubId, limit: 200 }), (r) => setExceptions(r.items.map((x) => mapApiExceptionToException(x, hubNames.get(x.hubId) ?? ''))), () => setExceptions([])),
        load('Dashboard', reportsAuditService.getDashboardOverview({ hubId }), setDashboardOverview, () => setDashboardOverview(null)),
      ]);
    }

    await Promise.all([
      load('Notifications', reportsAuditService.getNotifications({ limit: 100 }), (r) => setNotifications(r.map(mapApiNotificationToNotification)), () => setNotifications([])),
      load('Audit events', reportsAuditService.getAuditEvents({ limit: 100 }), (r) => setAuditLogs(r.map((x) => mapApiAuditEventToAuditEvent(x))), () => setAuditLogs([])),
      load('Role assignments', staffService.getRoleAssignments({ limit: 200 }), (r) => setRoleAssignments(r.items), () => undefined),
    ]);

    if (hubId) {
      const roster = await hubsService.getStaff(hubId).catch((error) => { errors.push(`Staff roster: ${error instanceof Error ? error.message : 'Request failed'}`); return null; });
      if (roster) {
        const shifts = await staffService.getShifts({ hubId }).then((r) => r.items).catch((error) => { errors.push(`Staff shifts: ${error instanceof Error ? error.message : 'Request failed'}`); return []; });
        setStaff(roster.items.map((assignment) => {
          const user = assignment.user;
          const shift = shifts.find((s) => s.userId === user.id && s.role === assignment.role);
          return {
            id: user.id, fullName: user.name, fullNameBn: user.nameBn ?? '', role: toUiRole(assignment.role) ?? assignment.role as UserRole,
            roleTitle: assignment.role, roleTitleBn: assignment.role, phone: user.phone ?? '', active: user.status === 'active',
            assignedHubIds: [hubId],
            activeShift: shift ? `${formatApiTime(shift.startsAt)}–${formatApiTime(shift.endsAt)} (${shift.status})` : '',
          };
        }));
      } else setStaff([]);

      const liveSessions = sessionRows.map((s) => mapApiSessionToSession(s, hubNames.get(s.hubId) ?? '')).filter((s) => s.status === 'in_progress');
      const queues: QueueItem[] = [];
      const operationalEncounters: Encounter[] = [];
      for (const session of liveSessions) {
        await Promise.all([
          load(`Queue ${session.title}`, queueService.getQueue(session.id), (r) => queues.push(...r.items.map((t) => mapApiQueueTicketToQueueItem(t, session.hubId, session.id, session.serviceType))), () => undefined),
          load(`Encounters ${session.title}`, encountersExceptionsService.getSessionEncounters(session.id), (r) => operationalEncounters.push(...r.items.map((e) => mapApiEncounterToEncounter(e, session.hubId, hubNames.get(session.hubId) ?? ''))), () => undefined),
        ]);
      }
      setQueue(queues);
      setEncounters(operationalEncounters);
    }

    setApiErrors(errors);
    if (errors.length === 0) {
      setApiStatus('connected');
    } else {
      try {
        const health = await authService.checkHealth();
        setApiStatus(health.database ? 'connected' : 'disconnected');
      } catch {
        setApiStatus('disconnected');
      }
    }
  }, [selectedHubId]);

  const loadSignedInProfile = useCallback(async () => {
    const me = await authService.getMe();
    if (!me?.user) throw new Error('The account profile could not be loaded.');
    const assignedRoles = [...new Set(
      (me.assignments || [])
        .filter((assignment) => !assignment.status || assignment.status === 'active')
        .map((assignment) => toUiRole(assignment.role))
        .filter((role): role is UserRole => Boolean(role && CORE_OPERATIONS_ROLES.includes(role)))
    )];
    if (!assignedRoles.length) {
      await authService.logout();
      throw new Error('This account has no active Hub Management role. Contact your administrator.');
    }
    setCurrentUser(me.user);
    setRoleAssignments((me.assignments || []).map((assignment) => ({
      ...assignment,
      userId: me.user.id,
      status: assignment.status || 'active',
      validFrom: assignment.validFrom || '',
      scopeType: assignment.scopeType as ApiRoleAssignment['scopeType'],
    } as ApiRoleAssignment)));
    setAvailableRoles(assignedRoles);
    if (assignedRoles.length) {
      setActiveRole((previous) => assignedRoles.includes(previous) ? previous : assignedRoles[0]);
    }
    setIsAuthenticated(true);
    return me;
  }, []);

  // Initial Health & User Check on Load
  useEffect(() => {
    let isMounted = true;
    const initBackend = async () => {
      const startTime = performance.now();
      try {
        const health = await authService.checkHealth();
        if (isMounted) {
          const latency = Math.round(performance.now() - startTime);
          setApiLatency(latency);
          setApiStatus(health.database ? 'connected' : 'disconnected');
        }

        // Check if existing token exists
        let token = getStoredAccessToken();
        if (!token) {
          await refreshAuthToken();
          token = getStoredAccessToken();
        }
        if (token) {
          await loadSignedInProfile().catch(() => undefined);
        }

        // Initial Data Fetch
        await refreshBackendData();
      } catch {
        if (isMounted) {
          setApiStatus('disconnected');
        }
      }
    };

    initBackend();

    const handleLoggedOut = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAvailableRoles([]);
      setRoleAssignments([]);
      setHubs([]); setRegions([]); setCatchments([]); setSessions([]); setAppointments([]); setQueue([]); setPatients([]);
      setStations([]); setEquipment([]); setStaff([]); setEncounters([]); setAuditLogs([]); setNotifications([]); setExceptions([]);
      setDashboardOverview(null); setApiErrors([]);
      setServiceTypes([]);
      showToast('Session ended. Please sign in again.');
    };
    window.addEventListener('healora:logged-out', handleLoggedOut);

    return () => {
      isMounted = false;
      window.removeEventListener('healora:logged-out', handleLoggedOut);
    };
  }, [loadSignedInProfile, refreshBackendData]);

  // Real-time Queue Stream (SSE) for active session
  useEffect(() => {
    if (!isAuthenticated || !sessions.length) return;
    const activeSession = sessions.find((s) => s.status === 'in_progress') || sessions[0];
    if (!activeSession) return;

    const unsubscribe = queueService.subscribeQueueStream(
      activeSession.id,
      () => {
        // Refetch queue on queue update event
        queueService.getQueue(activeSession.id).then((res) => {
          setQueue((current) => [
            ...current.filter((item) => item.sessionId !== activeSession.id),
            ...res.items.map((t) => mapApiQueueTicketToQueueItem(t, activeSession.hubId, activeSession.id, activeSession.serviceType)),
          ]);
        }).catch((err) => showToast(`Queue refresh failed: ${err instanceof Error ? err.message : 'API error'}`));
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, sessions]);

  // Auth Action Methods
  const loginWithCredentials = async (email: string, pass: string): Promise<StaffLoginResponse> => {
    const res = await authService.login(email, pass);
    setPasswordChangeRequired(Boolean(res.passwordChangeRequired));
    setMfaEnrollmentRequired(Boolean(res.mfaEnrollmentRequired));
    if (res.mfaRequired && res.challengeId) {
      setMfaChallenge({ challengeId: res.challengeId, expiresIn: res.expiresIn || 300 });
      return res;
    }
    if (res.passwordChangeRequired) {
      return res;
    }
    if (res.mfaEnrollmentRequired) {
      return res;
    }
    if (res.accessToken) {
      const me = await loadSignedInProfile();
      showToast(`Welcome back, ${me.user.name}`);
      await refreshBackendData();
    }
    return res;
  };

  const verifyMfaCode = async (code: string): Promise<'password' | 'enroll' | 'complete'> => {
    if (!mfaChallenge) throw new Error('No active MFA challenge found');
    const res = await authService.verifyMfa(mfaChallenge.challengeId, code);
    setMfaChallenge(null);
    setPasswordChangeRequired(Boolean(res.passwordChangeRequired));
    setMfaEnrollmentRequired(Boolean(res.mfaEnrollmentRequired));
    if (res.accessToken) {
      if (res.passwordChangeRequired) {
        return 'password';
      }
      if (res.mfaEnrollmentRequired) {
        return 'enroll';
      }
      const me = await loadSignedInProfile();
      showToast(`MFA verified. Welcome ${me.user.name}`);
      await refreshBackendData();
      return 'complete';
    }
    return 'complete';
  };

  const changeStaffPassword = async (curr: string, newPass: string): Promise<void> => {
    await authService.changePassword(curr, newPass);
    if (getStoredAccessToken()) {
      const refreshed = await refreshAuthToken();
      if (!refreshed) throw new Error('Session expired after password change. Please sign in again.');
      // Keep the sign-in modal mounted until required MFA enrollment finishes.
      // Loading /me here would unlock the console and reset the enrollment UI.
      if (!mfaEnrollmentRequired) await loadSignedInProfile();
    }
    setPasswordChangeRequired(false);
    showToast('Password updated successfully. Session active.');
  };

  const enrollStaffMfa = async (): Promise<void> => {
    const result = await authService.enrollMfa();
    setMfaEnrollmentUri(result.otpauthUri);
  };

  const confirmStaffMfa = async (code: string): Promise<void> => {
    await authService.confirmMfa(code);
    await authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAvailableRoles([]);
    setMfaEnrollmentRequired(false);
    setMfaEnrollmentUri(null);
    showToast('MFA enabled. Sign in again to continue.');
  };

  const logoutUser = async (): Promise<void> => {
    await authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAvailableRoles([]);
    setRoleAssignments([]);
    setHubs([]); setRegions([]); setCatchments([]); setSessions([]); setAppointments([]); setQueue([]); setPatients([]);
    setStations([]); setEquipment([]); setStaff([]); setEncounters([]); setAuditLogs([]); setNotifications([]); setExceptions([]);
    setDashboardOverview(null); setApiErrors([]); setServiceTypes([]);
    showToast('Signed out successfully.');
  };

  // Mutations are confirmed by the backend, then all visible data is reloaded from API responses.
  const runMutation = async (successMessage: string, request: () => Promise<unknown>): Promise<boolean> => {
    try {
      await request();
      await refreshBackendData();
      showToast(successMessage);
      return true;
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Request failed';
      showToast('API action failed: ' + detail);
      return false;
    }
  };

  const checkInAppointment = async (appointmentId: string): Promise<void> => {
    await runMutation('Appointment checked in.', () => appointmentsService.checkIn(appointmentId));
  };

  const callNextPatient = async (stationId: string): Promise<void> => {
    const next = queue.find((item) => item.currentStatus === 'waiting');
    if (!next) { showToast('No patients are waiting in the API queue.'); return; }
    await runMutation('Ticket called to station.', () => queueService.callTicket(next.id, stationId));
  };

  const advanceQueueStatus = async (queueId: string, nextStatus: QueueState): Promise<void> => {
    const item = queue.find((row) => row.id === queueId);
    if (!item) { showToast('Queue ticket was not found in the current API data.'); return; }
    if (nextStatus === 'in_service') {
      await runMutation('Queue service started.', () => queueService.startTicket(queueId, item.stationId));
      return;
    }
    if (nextStatus === 'completed') {
      await runMutation('Queue ticket completed.', () => queueService.completeTicket(queueId));
      return;
    }
    if (nextStatus === 'no_show') {
      await runMutation('Queue ticket marked no-show.', () => queueService.markNoShow(queueId));
      return;
    }
    showToast('This queue transition is not available in the backend API.');
  };

  const transferStation = async (queueId: string, newStationId: string): Promise<void> => {
    await runMutation('Queue ticket transferred.', () => queueService.transferTicket(queueId, { stationId: newStationId }));
  };

  const registerWalkIn = async (patientData: Partial<Patient>, sessionId: string, onPatientRegistered?: (id: string) => void): Promise<string | null> => {
    if (!sessionId) throw new Error('Choose an in-progress session for walk-ins.');
    // Check current capacity before creating a patient; the backend checks again atomically on booking.
    const session = await sessionsService.getSession(sessionId);
    if (session.status !== 'in_progress') throw new ApiError(409, 'SESSION_NOT_ACTIVE', 'Start this session before registering a walk-in.');
    if (session.hub && session.hub.status !== 'active') throw new ApiError(409, 'HUB_NOT_ACTIVE', 'Activate the selected hub before registering a walk-in.');
    if (!session.allowOverbooking && session.walkInCount >= session.walkInCapacity) {
      throw new ApiError(409, 'WALK_IN_CAPACITY_FULL', `No walk-in capacity left: ${session.walkInCount} used out of ${session.walkInCapacity}. Ask a hub administrator to update capacity, or select another session.`);
    }
      let patientId = patientData.id;
      if (!patientId) {
        if (!patientData.fullName?.trim() || !patientData.phone?.trim()) {
          throw new Error('Patient name and phone are required to register a new patient.');
        }
        const patient = await patientsService.register({
          hubId: session.hubId,
          fullName: patientData.fullName.trim(),
          fullNameBn: patientData.fullNameBn || undefined,
          phone: patientData.phone.trim(),
          sex: patientData.gender === 'Female' ? 'female' : patientData.gender === 'Male' ? 'male' : patientData.gender === 'Other' ? 'other' : 'unknown',
          age: patientData.age,
        });
        patientId = patient.id;
        onPatientRegistered?.(patientId);
      }
      if (!patientId) throw new Error('The patient record has no API identifier.');
      const result = await queueService.registerWalkIn(session.id, { patientId, identityConfirmed: true });
      if (!result.ticket?.displayCode) throw new Error('The backend did not return a queue token. Check Live Queue before trying again.');
      await refreshBackendData();
      showToast(`Walk-in registered. Token: ${result.ticket.displayCode}`);
      return result.ticket.displayCode;
  };

  const createSession = async (sessionData: Partial<HubSession>): Promise<boolean> => {
    const hubId = sessionData.hubId || selectedHubId;
    const serviceTypeId = sessionData.serviceTypeId;
    const sessionDate = sessionData.date;
    const appointmentCapacity = sessionData.totalCapacity;
    const walkInCapacity = sessionData.walkInCapacity;
    if (!hubId || !serviceTypeId || !sessionDate || !sessionData.startTime || !sessionData.endTime || !sessionData.title || !sessionData.sessionType) {
      showToast('Select a hub, service type, session type, title, date and time before creating a session.');
      return false;
    }
    if (!Number.isInteger(appointmentCapacity) || appointmentCapacity! < 1 || !Number.isInteger(walkInCapacity) || walkInCapacity! < 0) {
      showToast('Enter valid appointment and walk-in capacities.');
      return false;
    }
    const startsAt = new Date(sessionDate + 'T' + sessionData.startTime + ':00+06:00').toISOString();
    const endsAt = new Date(sessionDate + 'T' + sessionData.endTime + ':00+06:00').toISOString();
    if (new Date(endsAt) <= new Date(startsAt)) {
      showToast('Session end time must be after its start time.');
      return false;
    }
    return runMutation('Session created.', () => sessionsService.createSession({
      hubId,
      serviceTypeId,
      title: sessionData.title!,
      sessionType: sessionData.sessionType!,
      sessionDate,
      startsAt,
      endsAt,
      appointmentCapacity: appointmentCapacity!,
      walkInCapacity: walkInCapacity!,
      teamLeadUserId: sessionData.teamLeadId || undefined,
    }));
  };

  const cancelSession = async (sessionId: string, reason: string): Promise<boolean> => {
    if (!reason.trim()) { showToast('A cancellation reason is required.'); return false; }
    return runMutation('Session cancelled.', () => sessionsService.cancel(sessionId, reason.trim()));
  };

  const publishSession = async (sessionId: string, overrideReason?: string): Promise<void> => {
    await runMutation('Session published.', () => sessionsService.publish(sessionId, overrideReason));
  };

  const openBookingSession = async (sessionId: string): Promise<void> => {
    await runMutation('Session opened for booking.', () => sessionsService.openBooking(sessionId));
  };

  const startSession = async (sessionId: string): Promise<void> => {
    await runMutation('Session started.', () => sessionsService.start(sessionId));
  };

  const completeSession = async (sessionId: string): Promise<void> => {
    await runMutation('Session completed.', () => sessionsService.complete(sessionId));
  };

  const createAppointment = async (apt: Partial<HubAppointment>): Promise<boolean> => {
    if (!apt.sessionId || !apt.patientId) { showToast('Choose an API patient and session before booking.'); return false; }
    const source = ['campaign', 'local_doctor', 'referral', 'operations_assignment'].includes(apt.bookingSource || '')
      ? apt.bookingSource as 'campaign' | 'local_doctor' | 'referral' | 'operations_assignment'
      : 'operations_assignment';
    return runMutation('Appointment created.', () => appointmentsService.createAppointment(apt.sessionId!, {
      patientId: apt.patientId!,
      slotId: apt.slotId,
      source,
      hubAssignmentBasis: 'operations_assignment',
    }));
  };

  const markAppointmentNoShow = async (appointmentId: string): Promise<void> => {
    await runMutation('Appointment marked no-show.', () => appointmentsService.markNoShow(appointmentId));
  };

  const toggleStationStatus = async (stationId: string, newStatus: StationStatus, reason = 'Status updated by authorized staff.'): Promise<void> => {
    await runMutation('Station status updated.', () => stationsEquipmentService.setStationStatus(stationId, newStatus, reason));
  };

  const toggleEquipmentStatus = async (eqId: string, newStatus: EquipmentStatus, reason = ''): Promise<void> => {
    if (!reason.trim()) { showToast('Enter a reason before changing equipment status.'); return; }
    await runMutation('Equipment status updated.', async () => {
      if (newStatus === 'retired') return stationsEquipmentService.retireEquipment(eqId, reason.trim());
      return stationsEquipmentService.setEquipmentStatus(eqId, newStatus, reason.trim());
    });
  };

  const recordEquipmentService = async (eqId: string, data: { kind: 'inspection' | 'calibration' | 'maintenance'; notes: string; serviceProvider?: string; nextDueOn?: string }): Promise<boolean> => {
    if (!data.notes.trim()) { showToast('Maintenance notes are required.'); return false; }
    return runMutation('Equipment service event recorded.', () => stationsEquipmentService.recordServiceEvent(eqId, data));
  };

  const reassignEncounter = async (
    encounterId: string,
    userId: string,
    role: 'special_team_lead' | 'field_health_worker' | 'local_doctor' | 'registered_doctor'
  ): Promise<void> => {
    await runMutation('Encounter reassigned.', () => encountersExceptionsService.assignEncounter(encounterId, { userId, role }));
  };

  const resolveException = async (exceptionId: string, notes?: string): Promise<void> => {
    if (!notes?.trim()) { showToast('Resolution notes are required.'); return; }
    await runMutation('Exception resolved.', () => encountersExceptionsService.resolve(exceptionId, notes.trim()));
  };

  const acknowledgeException = async (exceptionId: string): Promise<void> => {
    await runMutation('Exception acknowledged.', () => encountersExceptionsService.acknowledge(exceptionId));
  };

  const escalateException = async (exceptionId: string, to: 'regional_operations' | 'clinical_operations', note: string): Promise<void> => {
    if (!note.trim()) { showToast('Escalation note is required.'); return; }
    await runMutation('Exception escalated.', () => encountersExceptionsService.escalate(exceptionId, to, note.trim()));
  };

  const dismissException = async (exceptionId: string, reason: string): Promise<void> => {
    if (!reason.trim()) { showToast('A dismissal reason is required.'); return; }
    await runMutation('Exception dismissed.', () => encountersExceptionsService.dismiss(exceptionId, reason.trim()));
  };

  const acknowledgeNotification = async (id: string): Promise<void> => {
    try {
      await reportsAuditService.markNotificationRead(id);
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, acknowledged: true } : item));
      showToast('Notification marked read.');
    } catch (error) {
      showToast('Could not mark notification read: ' + (error instanceof Error ? error.message : 'API error'));
    }
  };

  const dismissNotification = acknowledgeNotification;

  const addHub = async (hub: Partial<Hub>): Promise<boolean> => {
    if (!hub.code?.trim() || !hub.regionId || !hub.name?.trim() || !hub.address?.trim()) {
      showToast('Hub code, region, name and address are required.');
      return false;
    }
    return runMutation('Hub created.', () => hubsService.createHub({
      code: hub.code!.trim(), regionId: hub.regionId!, name: hub.name!.trim(), addressLine: hub.address!.trim(),
      nameBn: hub.nameBn || undefined, addressLineBn: hub.addressBn || undefined, contactPhone: hub.phone || undefined,
      emergencyContactPhone: hub.emergencyPhone || undefined, nearestReferralFacility: hub.emergencyReferralFacility || undefined,
    }));
  };

  const updateHubProfile = async (hubId: string, hub: Partial<Hub>): Promise<boolean> => {
    return runMutation('Hub profile updated.', () => hubsService.updateHub(hubId, {
      name: hub.name, nameBn: hub.nameBn, addressLine: hub.address, addressLineBn: hub.addressBn,
      contactPhone: hub.phone, nearestReferralFacility: hub.emergencyReferralFacility,
      emergencyContactPhone: hub.emergencyPhone,
    }));
  };

  const updateHubStatus = async (hubId: string, status: HubStatus, reason = ''): Promise<void> => {
    if (!reason.trim()) { showToast('Enter a reason before changing hub status.'); return; }
    await runMutation('Hub status updated.', () => hubsService.updateStatus(hubId, status, reason.trim()));
  };

  const addRegion = async (region: Partial<Region> & { parentId?: string }): Promise<boolean> => {
    if (!region.code?.trim() || !region.name?.trim() || !region.level) {
      showToast('Region code, name and administrative level are required.');
      return false;
    }
    return runMutation('Region created.', () => regionsService.createRegion({
      code: region.code!.trim(), name: region.name!.trim(), nameBn: region.nameBn || undefined, level: region.level!, parentId: region.parentId || undefined,
    }));
  };

  const addCatchment = async (catchment: Partial<CatchmentArea>): Promise<boolean> => {
    if (!catchment.hubId || !catchment.regionId) { showToast('Choose a hub and region for the catchment.'); return false; }
    return runMutation('Catchment assigned.', () => hubsService.addCatchment(catchment.hubId!, catchment.regionId!, true));
  };

  const addStaffMember = async (member: Partial<StaffMember>): Promise<{ userId: string; temporaryPassword: string; activated: boolean } | null> => {
    if (!member.email?.trim() || !member.fullName?.trim() || !member.role || !member.assignedHubIds?.[0]) {
      showToast('Staff name, work email, hub and role are required.');
      return null;
    }
    if (!['hub_manager', 'reception_officer', 'queue_coordinator', 'equipment_officer'].includes(member.role)) {
      showToast('Clinical roles require a verified backend credential before assignment.');
      return null;
    }

    let createdUserId: string | undefined;
    let temporaryPassword: string | undefined;
    let accountActivated = false;
    try {
      const user = await staffService.createUser({
        email: member.email.trim(),
        name: member.fullName.trim(),
        nameBn: member.fullNameBn || undefined,
        phone: member.phone || undefined,
      });
      createdUserId = user.id;
      await staffService.assignRole(user.id, { role: member.role, scopeType: 'hub', hubId: member.assignedHubIds[0] });
      const issued = await staffService.issueTemporaryPassword(user.id, 'Initial staff account setup');
      temporaryPassword = issued.temporaryPassword;
      const activation = await staffService.setUserStatus(user.id, 'active', 'Activated after initial role and password setup');
      if (activation.user.status !== 'active') throw new Error('The backend did not activate the new account.');
      accountActivated = true;
      await refreshBackendData();
      showToast('Staff account created, activated and assigned from the backend.');
      return { userId: user.id, temporaryPassword, activated: true };
    } catch (error) {
      await refreshBackendData().catch(() => undefined);
      const detail = error instanceof Error ? error.message : 'Request failed';
      const code = error instanceof ApiError ? ` (${error.code})` : '';
      if (temporaryPassword && createdUserId) {
        showToast(accountActivated
          ? `Account ${createdUserId} is active, but the latest data refresh failed: ${detail}${code}`
          : `Password issued, but account activation needs attention for user ${createdUserId}: ${detail}${code}`);
        return { userId: createdUserId, temporaryPassword, activated: accountActivated };
      }
      if (createdUserId) {
        showToast(`Account ${createdUserId} was created, but setup did not finish: ${detail}${code}`);
      } else {
        showToast(`Staff account setup failed: ${detail}${code}`);
      }
      return null;
    }
  };

  const addStation = async (station: Partial<HubStation>): Promise<boolean> => {
    const hubId = station.hubId || selectedHubId;
    if (!hubId || !station.code?.trim() || !station.name?.trim()) { showToast('Select a hub and provide station code and name.'); return false; }
    return runMutation('Station created.', () => stationsEquipmentService.createStation(hubId, {
      code: station.code!.trim(), name: station.name!.trim(), nameBn: station.nameBn || undefined,
      stationType: station.stationType === 'counseling' ? 'counselling' : station.stationType || 'other',
    }));
  };

  const addEquipment = async (equipmentItem: Partial<HubEquipment>): Promise<boolean> => {
    const hubId = equipmentItem.hubId || selectedHubId;
    const allowed = ['bp_monitor', 'glucometer', 'weighing_scale', 'stadiometer', 'thermometer', 'pulse_oximeter', 'tablet', 'printer', 'other'];
    const rawCategory = equipmentItem.category === 'weight_scale' ? 'weighing_scale' : equipmentItem.category;
    const category = allowed.includes(rawCategory || '') ? rawCategory as 'bp_monitor' | 'glucometer' | 'weighing_scale' | 'stadiometer' | 'thermometer' | 'pulse_oximeter' | 'tablet' | 'printer' | 'other' : 'other';
    if (!hubId || !equipmentItem.code?.trim()) { showToast('Select a hub and provide an asset tag.'); return false; }
    return runMutation('Equipment registered.', () => stationsEquipmentService.createEquipment({
      hubId, assetTag: equipmentItem.code!.trim(), category, make: equipmentItem.name || undefined, model: equipmentItem.model || undefined,
      serialNumber: equipmentItem.serialNumber || undefined, stationId: equipmentItem.stationId || undefined, notes: equipmentItem.notes || undefined,
    }));
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
        availableRoles,
        setActiveRole: handleSetActiveRole,
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
        // Backend & Auth
        isAuthenticated,
        currentUser,
        apiStatus,
        apiLatency,
        apiErrors,
        dashboardOverview,
        serviceTypes,
        isAuthModalOpen,
        setIsAuthModalOpen,
        mfaChallenge,
        passwordChangeRequired,
        mfaEnrollmentRequired,
        mfaEnrollmentUri,
        loginWithCredentials,
        verifyMfaCode,
        changeStaffPassword,
        enrollStaffMfa,
        confirmStaffMfa,
        logoutUser,
        refreshBackendData,
        // Operational Actions
        checkInAppointment,
        callNextPatient,
        advanceQueueStatus,
        transferStation,
        registerWalkIn,
        createSession,
        publishSession,
        openBookingSession,
        startSession,
        completeSession,
        cancelSession,
        createAppointment,
        markAppointmentNoShow,
        toggleStationStatus,
        toggleEquipmentStatus,
        recordEquipmentService,
        reassignEncounter,
        resolveException,
        acknowledgeException,
        escalateException,
        dismissException,
        acknowledgeNotification,
        dismissNotification,
        addHub,
        updateHubProfile,
        updateHubStatus,
        addRegion,
        addCatchment,
        addStaffMember,
        addStation,
        addEquipment,
        // Role & Permissions Integration
        isReadOnlyRole,
        canAccessRoute,
        roleAssignments,
        assignStaffRole,
        revokeStaffRole,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { useApp } from './useApp';
