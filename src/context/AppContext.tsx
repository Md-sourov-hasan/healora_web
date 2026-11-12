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
import { reportsAuditService } from '../services/reportsAuditService';
import { staffService, type ApiRoleAssignment } from '../services/staffService';
import { CORE_OPERATIONS_ROLES, isRouteAllowedForRole, ROLES_CONFIG } from '../config/rolesConfig';
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
    case 'audit':
    case 'audit-logs':
      return '/audit-logs';
    default:
      return '/dashboard';
  }
}

export type ApiConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'demo';

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
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  mfaChallenge: { challengeId: string; expiresIn: number } | null;
  passwordChangeRequired: boolean;
  mfaEnrollmentRequired: boolean;
  mfaEnrollmentUri: string | null;
  syncWithBackend: boolean;
  setSyncWithBackend: (sync: boolean) => void;
  loginWithCredentials: (email: string, pass: string) => Promise<StaffLoginResponse>;
  verifyMfaCode: (code: string) => Promise<'password' | 'enroll' | 'complete'>;
  changeStaffPassword: (curr: string, newPass: string) => Promise<void>;
  enrollStaffMfa: () => Promise<void>;
  confirmStaffMfa: (code: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  refreshBackendData: () => Promise<void>;
  // Operational Actions
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
  // Role & Permissions Integration
  isReadOnlyRole: boolean;
  canAccessRoute: (route: AppRoute) => boolean;
  roleAssignments: ApiRoleAssignment[];
  assignStaffRole: (userId: string, data: { role: string; scopeType: string; hubId?: string; regionId?: string }) => Promise<void>;
  revokeStaffRole: (roleAssignmentId: string, reason?: string) => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<UserRole>('hub_manager');
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [selectedHubId, setSelectedHubId] = useState<string>('hub_dhaka_01');
  const [activeView, setActiveViewState] = useState<AppRoute>(() =>
    typeof window !== 'undefined' ? normalizeRoute(window.location.pathname) : '/dashboard'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  // Core Data States (Initialized with rich local defaults, augmented via API)
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

  // Authentication & API Integration States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<MeResponse['user'] | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiConnectionStatus>('connecting');
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [mfaChallenge, setMfaChallenge] = useState<{ challengeId: string; expiresIn: number } | null>(null);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState<boolean>(false);
  const [mfaEnrollmentRequired, setMfaEnrollmentRequired] = useState(false);
  const [mfaEnrollmentUri, setMfaEnrollmentUri] = useState<string | null>(null);
  const [syncWithBackend, setSyncWithBackend] = useState<boolean>(true);
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
      actorName: currentUser?.name || (
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
          : 'System Administrator'
      ),
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

  const handleSetActiveRole = (newRole: UserRole) => {
    if (!isAuthenticated || !availableRoles.includes(newRole)) {
      showToast('This role is not assigned to your account.');
      return;
    }
    setActiveRole(newRole);
    const cfg = ROLES_CONFIG[newRole];
    const roleName = cfg?.title || newRole;
    addAuditLog('Role Scope Switch', 'Security', `role_${newRole}`, `Active operational role switched to ${roleName}`);
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
    data: { role: string; scopeType: string; hubId?: string; regionId?: string }
  ) => {
    try {
      const newAssignment = await staffService.assignRole(userId, data);
      setRoleAssignments((prev) => [newAssignment, ...prev]);
      addAuditLog('Assign Staff Role', 'Security', `user_${userId}`, `Assigned role ${data.role} with ${data.scopeType} scope.`);
      showToast(`Role ${data.role} successfully assigned to staff.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API error assigning role';
      const code = err instanceof ApiError ? ` (${err.code})` : '';
      showToast(`Failed to assign role: ${msg}${code}`);
      throw err;
    }
  };

  const revokeStaffRole = async (roleAssignmentId: string, reason?: string) => {
    try {
      await staffService.revokeRole(roleAssignmentId, reason);
      setRoleAssignments((prev) =>
        prev.map((r) => (r.id === roleAssignmentId ? { ...r, status: 'revoked' as const } : r))
      );
      addAuditLog(
        'Revoke Staff Role',
        'Security',
        `assignment_${roleAssignmentId}`,
        `Revoked role assignment. Reason: ${reason || 'Administrative action'}`
      );
      showToast('Staff role assignment revoked.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'API error revoking role';
      showToast(`Failed to revoke role: ${msg}`);
      throw err;
    }
  };

  /**
   * Re-fetch and synchronize live data from the Render backend API
   */
  const refreshBackendData = useCallback(async () => {
    if (!syncWithBackend || !isAuthenticated) return;
    try {
      // 1. Fetch Hubs
      const hubRes = await hubsService.getHubs({ limit: 50 }).catch(() => null);
      if (hubRes?.items?.length) {
        setHubs(hubRes.items.map(mapApiHubToHub));
      }

      // 2. Fetch Regions
      const regionRes = await regionsService.getRegions({ limit: 50 }).catch(() => null);
      if (regionRes?.items?.length) {
        setRegions(regionRes.items.map(mapApiRegionToRegion));
      }

      // 3. Fetch Sessions
      const sessionRes = await sessionsService.getSessions({ limit: 50 }).catch(() => null);
      if (sessionRes?.items?.length) {
        setSessions(sessionRes.items.map((s) => mapApiSessionToSession(s)));
      }

      // 4. Fetch Appointments
      const aptRes = await appointmentsService.getAppointments({ limit: 50 }).catch(() => null);
      if (aptRes?.items?.length) {
        setAppointments(aptRes.items.map(mapApiAppointmentToAppointment));
      }

      // 5. Fetch Stations
      const stationRes = await stationsEquipmentService.getStations(selectedHubId).catch(() => null);
      if (stationRes && Array.isArray(stationRes) && stationRes.length > 0) {
        setStations(stationRes.map(mapApiStationToStation));
      }

      // 6. Fetch Equipment
      const eqRes = await stationsEquipmentService.getEquipment({ limit: 50 }).catch(() => null);
      if (eqRes?.items?.length) {
        setEquipment(eqRes.items.map(mapApiEquipmentToEquipment));
      }

      // 7. Fetch Operational Exceptions
      const excRes = await encountersExceptionsService.getExceptions({ limit: 50 }).catch(() => null);
      if (excRes?.items?.length) {
        setExceptions(excRes.items.map(mapApiExceptionToException));
      }

      // 8. Fetch Notifications
      const notifRes = await reportsAuditService.getNotifications({ limit: 30 }).catch(() => null);
      if (notifRes?.items?.length) {
        setNotifications(notifRes.items.map(mapApiNotificationToNotification));
      }

      // 9. Fetch Audit Events
      const audRes = await reportsAuditService.getAuditEvents({ limit: 50 }).catch(() => null);
      if (audRes?.items?.length) {
        setAuditLogs(audRes.items.map(mapApiAuditEventToAuditEvent));
      }

      // 10. Fetch Role Assignments via API
      const rolesRes = await staffService.getRoleAssignments().catch(() => null);
      if (rolesRes && Array.isArray(rolesRes)) {
        setRoleAssignments(rolesRes);
      }
    } catch {
      // If network calls fail, graceful local fallback remains
    }
  }, [isAuthenticated, selectedHubId, syncWithBackend]);

  const loadSignedInProfile = useCallback(async () => {
    const me = await authService.getMe();
    if (!me?.user) throw new Error('The account profile could not be loaded.');
    const assignedRoles = [...new Set(
      (me.assignments || [])
        .filter((assignment) => !assignment.status || assignment.status === 'active')
        .map((assignment) => assignment.role)
        .filter((role): role is UserRole => CORE_OPERATIONS_ROLES.includes(role as UserRole))
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
      validFrom: assignment.validFrom || new Date().toISOString(),
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
          setApiStatus('demo');
        }
      }
    };

    initBackend();

    const handleLoggedOut = () => {
      setIsAuthenticated(false);
      setCurrentUser(null);
      setAvailableRoles([]);
      setRoleAssignments([]);
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
    if (!isAuthenticated || !syncWithBackend || !sessions.length) return;
    const activeSession = sessions.find((s) => s.status === 'in_progress') || sessions[0];
    if (!activeSession) return;

    const unsubscribe = queueService.subscribeQueueStream(
      activeSession.id,
      () => {
        // Refetch queue on queue update event
        queueService.getQueue(activeSession.id).then((res) => {
          if (res?.items) {
            setQueue(
              res.items.map((t) => mapApiQueueTicketToQueueItem(t, activeSession.hubId, activeSession.id))
            );
          }
        }).catch(() => {});
      }
    );

    return () => {
      unsubscribe();
    };
  }, [isAuthenticated, sessions, syncWithBackend]);

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
    showToast('Signed out successfully.');
  };

  // Operational Action Handlers
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
      message: `${apt.patientName} checked in. Assigned to Station 1.`,
      messageBn: `${apt.patientNameBn || apt.patientName} চেক-ইন সম্পন্ন। ১ নং স্টেশনে পাঠানো হয়েছে।`,
      channel: 'internal_system',
      recipientRoleOrPhone: 'hub_manager',
      status: 'delivered',
      priority: 'normal',
      acknowledged: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addAuditLog(`Patient Check-in (${tokenNum})`, 'Queue', newQueueItem.id, `Issued token for ${apt.patientName}.`);
    showToast(`Checked in ${apt.patientName} -> Token: ${tokenNum}`);

    // Call API if synchronized
    if (syncWithBackend && !appointmentId.startsWith('apt_')) {
      appointmentsService.checkIn(appointmentId).catch(() => {});
    }
  };

  const callNextPatient = (stationId: string) => {
    const station = stations.find((s) => s.id === stationId);
    const nextWaiting = queue.find((q) => q.currentStatus === 'waiting');

    if (!nextWaiting) {
      showToast('No patients currently waiting in queue.');
      return;
    }

    setQueue((prev) =>
      prev.map((q) =>
        q.id === nextWaiting.id
          ? {
              ...q,
              currentStatus: 'called',
              stationId,
              stationName: station?.name || q.stationName,
              stepProgress: 2,
            }
          : q
      )
    );

    if (station) {
      setStations((prev) =>
        prev.map((s) =>
          s.id === stationId ? { ...s, currentTicketNumber: nextWaiting.ticketNumber } : s
        )
      );
    }

    addAuditLog(
      `Called Ticket (${nextWaiting.ticketNumber})`,
      'Queue',
      nextWaiting.id,
      `Called to ${station?.name || 'Station'}.`
    );
    showToast(`Calling ${nextWaiting.ticketNumber} to ${station?.name || 'station'}`);

    if (syncWithBackend && !nextWaiting.id.startsWith('q_')) {
      queueService.callTicket(nextWaiting.id, stationId).catch(() => {});
    }
  };

  const advanceQueueStatus = (queueId: string, nextStatus: QueueState) => {
    const item = queue.find((q) => q.id === queueId);
    if (!item) return;

    setQueue((prev) =>
      prev.map((q) => {
        if (q.id === queueId) {
          const step =
            nextStatus === 'completed'
              ? 4
              : nextStatus === 'in_service'
              ? 3
              : nextStatus === 'called'
              ? 2
              : 1;
          return { ...q, currentStatus: nextStatus, stepProgress: step };
        }
        return q;
      })
    );

    if (nextStatus === 'completed') {
      setAppointments((prev) =>
        prev.map((a) => (a.id === item.appointmentId ? { ...a, status: 'completed' } : a))
      );
    }

    addAuditLog(`Queue Status -> ${nextStatus}`, 'Queue', queueId, `Ticket ${item.ticketNumber} advanced.`);
    showToast(`Ticket ${item.ticketNumber} set to ${nextStatus.replace('_', ' ')}`);

    if (syncWithBackend && !queueId.startsWith('q_')) {
      if (nextStatus === 'in_service') {
        queueService.startTicket(queueId, item.stationId).catch(() => {});
      } else if (nextStatus === 'completed') {
        queueService.completeTicket(queueId).catch(() => {});
      }
    }
  };

  const transferStation = (queueId: string, newStationId: string) => {
    const item = queue.find((q) => q.id === queueId);
    const targetStation = stations.find((s) => s.id === newStationId);
    if (!item || !targetStation) return;

    setQueue((prev) =>
      prev.map((q) =>
        q.id === queueId
          ? {
              ...q,
              currentStatus: 'waiting',
              stationId: newStationId,
              stationName: targetStation.name,
              stepProgress: 2,
            }
          : q
      )
    );

    addAuditLog(`Transfer Ticket (${item.ticketNumber})`, 'Queue', queueId, `Transferred to ${targetStation.name}.`);
    showToast(`Transferred ${item.ticketNumber} -> ${targetStation.name}`);

    if (syncWithBackend && !queueId.startsWith('q_')) {
      queueService.transferTicket(queueId, { targetStationId: newStationId }).catch(() => {});
    }
  };

  const registerWalkIn = (patientData: Partial<Patient>, serviceType: string) => {
    const newPatId = `pat_${Date.now()}`;
    const tokenNum = `W-${Math.floor(100 + Math.random() * 900)}`;

    const newPatient: Patient = {
      id: newPatId,
      canonicalHealoraId: `HLR-SAV-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: patientData.fullName || 'Walk-in Patient',
      fullNameBn: patientData.fullNameBn || 'ওয়াক-ইন রোগী',
      phone: patientData.phone || '01700000000',
      gender: patientData.gender || 'Male',
      age: patientData.age || 35,
      district: 'Dhaka',
      upazila: 'Savar',
      nationalIdMasked: '•••• •••• 9999',
      consentStatus: 'active',
      consentDate: new Date().toISOString().slice(0, 10),
      preferredHubId: selectedHubId,
      totalEncounters: 1,
    };

    const newQueueItem: QueueItem = {
      id: `q_${Date.now()}`,
      ticketNumber: tokenNum,
      encounterId: `enc_${Date.now()}`,
      appointmentId: `apt_walk_${Date.now()}`,
      patientId: newPatient.id,
      patientName: newPatient.fullName,
      patientNameBn: newPatient.fullNameBn,
      patientPhone: newPatient.phone,
      hubId: selectedHubId,
      sessionId: sessions[0]?.id || 'sess_dhk_01',
      stationId: 'st_dhk_01',
      stationName: 'Station 1: Reception & Identity',
      currentStatus: 'waiting',
      priority: 'normal',
      arrivalTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      waitMinutes: 0,
      serviceType: serviceType || 'General Consultation',
      assignedStaffName: 'Unassigned',
      stepProgress: 1,
    };

    setPatients((prev) => [newPatient, ...prev]);
    setQueue((prev) => [newQueueItem, ...prev]);

    addAuditLog(`Registered Walk-in (${tokenNum})`, 'Patient', newPatient.id, `Created walk-in for ${newPatient.fullName}.`);
    showToast(`Walk-in registered -> Token: ${tokenNum}`);

    if (syncWithBackend && sessions[0]?.id && !sessions[0].id.startsWith('sess_')) {
      queueService.registerWalkIn(sessions[0].id, {
        patientId: newPatient.id,
        serviceTypeId: undefined,
        notes: `Walk-in registered at reception`,
      }).catch(() => {});
    }
  };

  const createSession = (sessionData: Partial<HubSession>): boolean => {
    const activeHub = hubs.find((h) => h.id === (sessionData.hubId || selectedHubId));
    const newSession: HubSession = {
      id: `sess_${Date.now()}`,
      hubId: sessionData.hubId || selectedHubId,
      hubName: activeHub?.name || 'Savar Physical Hub',
      title: sessionData.title || 'Special Diabetes & NCD Camp',
      titleBn: sessionData.titleBn || 'বিশেষ ডায়াবেটিস ও এনসিডি ক্যাম্প',
      serviceType: sessionData.serviceType || 'basic_vitals',
      date: sessionData.date || new Date().toISOString().slice(0, 10),
      startTime: sessionData.startTime || '09:00',
      endTime: sessionData.endTime || '16:00',
      sessionType: sessionData.sessionType || 'special_camp',
      status: 'published',
      bookedCount: 0,
      totalCapacity: sessionData.totalCapacity || 50,
      walkInCapacity: sessionData.walkInCapacity || 10,
      walkInUsed: 0,
      teamLeadId: 'stf_01',
      teamLeadName: 'Dr. Arjun Mehta',
      healthWorkersCount: 3,
      doctorsCount: 1,
      requiredEquipmentReady: true,
      minimumStaffReady: true,
    };

    setSessions((prev) => [newSession, ...prev]);
    addAuditLog(`Session Created (${newSession.title})`, 'Session', newSession.id, `Capacity: ${newSession.totalCapacity}.`);
    showToast(`Session created: ${newSession.title}`);

    if (syncWithBackend) {
      sessionsService.createSession({
        hubId: newSession.hubId,
        title: newSession.title,
        titleBn: newSession.titleBn,
        date: newSession.date,
        startTime: newSession.startTime,
        endTime: newSession.endTime,
        capacityTotal: newSession.totalCapacity,
        capacityWalkIn: newSession.walkInCapacity,
        sessionType: newSession.sessionType === 'special_camp' ? 'special_camp' : 'standard_clinic',
      }).catch(() => {});
    }
    return true;
  };

  const cancelSession = (sessionId: string, reason: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' } : s))
    );
    addAuditLog(`Cancelled Session`, 'Session', sessionId, `Reason: ${reason}.`);
    showToast(`Session cancelled.`);

    if (syncWithBackend && !sessionId.startsWith('sess_')) {
      sessionsService.cancel(sessionId, reason).catch(() => {});
    }
  };

  const createAppointment = (aptData: Partial<HubAppointment>) => {
    const newApt: HubAppointment = {
      id: `apt_${Date.now()}`,
      appointmentCode: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: aptData.patientId || `pat_${Date.now()}`,
      patientName: aptData.patientName || 'Booked Patient',
      patientNameBn: aptData.patientNameBn || 'নিবন্ধিত রোগী',
      patientPhone: aptData.patientPhone || '01700000000',
      hubId: aptData.hubId || selectedHubId,
      hubName: 'Healora Hub Savar',
      sessionId: aptData.sessionId || sessions[0]?.id || 'sess_dhk_01',
      serviceType: aptData.serviceType || 'General Consultation',
      slotTime: aptData.slotTime || '11:00',
      status: 'confirmed',
      bookingSource: 'patient_app',
      createdAt: new Date().toISOString(),
      consentRecorded: true,
    };

    setAppointments((prev) => [newApt, ...prev]);
    addAuditLog(`Booked Appointment`, 'Appointment', newApt.id, `Patient: ${newApt.patientName}.`);
    showToast(`Appointment booked for ${newApt.patientName}`);

    if (syncWithBackend && aptData.sessionId && !aptData.sessionId.startsWith('sess_')) {
      appointmentsService.createAppointment(aptData.sessionId, {
        patientId: newApt.patientId,
        scheduledTime: newApt.slotTime,
      }).catch(() => {});
    }
  };

  const markAppointmentNoShow = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'no_show' } : a))
    );
    addAuditLog(`Marked No-Show`, 'Appointment', appointmentId, `No-show recorded.`);
    showToast(`Appointment marked as no-show.`);

    if (syncWithBackend && !appointmentId.startsWith('apt_')) {
      appointmentsService.markNoShow(appointmentId).catch(() => {});
    }
  };

  const toggleStationStatus = (stationId: string, newStatus: StationStatus) => {
    setStations((prev) =>
      prev.map((s) => (s.id === stationId ? { ...s, status: newStatus } : s))
    );
    addAuditLog(`Station Status -> ${newStatus}`, 'Hub', stationId, `Station updated.`);
    showToast(`Station status set to ${newStatus}`);

    if (syncWithBackend && !stationId.startsWith('st_')) {
      stationsEquipmentService.setStationStatus(stationId, newStatus as any).catch(() => {});
    }
  };

  const toggleEquipmentStatus = (eqId: string, newStatus: EquipmentStatus) => {
    setEquipment((prev) =>
      prev.map((e) => (e.id === eqId ? { ...e, status: newStatus } : e))
    );
    addAuditLog(`Equipment Status -> ${newStatus}`, 'Equipment', eqId, `Status updated.`);
    showToast(`Device status set to ${newStatus}`);

    if (syncWithBackend && !eqId.startsWith('eq_')) {
      stationsEquipmentService.setEquipmentStatus(eqId, newStatus as any).catch(() => {});
    }
  };

  const retrySyncEncounter = (encounterId: string) => {
    setEncounters((prev) =>
      prev.map((e) =>
        e.id === encounterId
          ? {
              ...e,
              syncState: 'synced',
            }
          : e
      )
    );
    addAuditLog(`Retried Sync`, 'Encounter', encounterId, `Pushed to AP-DCC Tier-IV Gazipur.`);
    showToast(`Encounter synced with Bangladesh Data Center`);
  };

  const reassignEncounter = (encounterId: string, newWorker: string) => {
    setEncounters((prev) =>
      prev.map((e) =>
        e.id === encounterId
          ? { ...e, assignedWorkerName: newWorker }
          : e
      )
    );
    addAuditLog(`Reassigned Encounter`, 'Encounter', encounterId, `Assigned to ${newWorker}.`);
    showToast(`Encounter reassigned to ${newWorker}`);
  };

  const resolveException = (exceptionId: string, notes?: string) => {
    setExceptions((prev) =>
      prev.map((ex) =>
        ex.id === exceptionId
          ? {
              ...ex,
              status: 'resolved',
              details: notes ? `${ex.details} (Note: ${notes})` : ex.details,
            }
          : ex
      )
    );
    addAuditLog(`Resolved Exception`, 'Security', exceptionId, notes || 'Resolved.');
    showToast(`Operational exception resolved`);

    if (syncWithBackend && !exceptionId.startsWith('exc_')) {
      encountersExceptionsService.resolve(exceptionId, notes || 'Resolved').catch(() => {});
    }
  };

  const acknowledgeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, acknowledged: true } : n))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (syncWithBackend && !id.startsWith('notif_')) {
      reportsAuditService.markNotificationRead(id).catch(() => {});
    }
  };

  const addHub = (hubData: Partial<Hub>) => {
    const newHub: Hub = {
      id: `hub_${Date.now()}`,
      code: hubData.code || `HUB-DH-${Math.floor(10 + Math.random() * 90)}`,
      name: hubData.name || 'New Regional Hub',
      nameBn: hubData.nameBn || hubData.name || 'নতুন আঞ্চলিক হাব',
      status: hubData.status || 'active',
      regionId: hubData.regionId || regions[0]?.id || 'reg_dhaka',
      division: hubData.division || 'Dhaka',
      district: hubData.district || 'Dhaka',
      upazila: hubData.upazila || 'Savar',
      unionName: hubData.unionName || 'Savar Sadar',
      address: hubData.address || 'Savar, Dhaka',
      addressBn: hubData.addressBn || 'সাভার, ঢাকা',
      phone: hubData.phone || '+8801700000000',
      operatingHours: hubData.operatingHours || '08:00 - 16:00 (Sat-Thu)',
      services: hubData.services || ['NCD Screening', 'Basic Vitals'],
      assignedManager: hubData.assignedManager || 'Kamrul Hassan',
      emergencyReferralFacility: hubData.emergencyReferralFacility || 'Savar UHC',
      emergencyPhone: hubData.emergencyPhone || '+8801711999888',
      capacityPerDay: hubData.capacityPerDay || 60,
      activeSessionsToday: 1,
      openStationsCount: 4,
      totalDevicesCount: 10,
    };

    setHubs((prev) => [newHub, ...prev]);
    addAuditLog(`Hub Registered (${newHub.code})`, 'Hub', newHub.id, `Created hub ${newHub.name}.`);
    showToast(`Hub created: ${newHub.name}`);

    if (syncWithBackend) {
      hubsService.createHub({
        code: newHub.code,
        name: newHub.name,
        nameBn: newHub.nameBn,
        regionId: newHub.regionId,
        addressLine: `${newHub.upazila}, ${newHub.district}`,
        contactPhone: newHub.phone,
      }).catch(() => {});
    }
  };

  const updateHubStatus = (hubId: string, status: HubStatus) => {
    setHubs((prev) =>
      prev.map((h) => (h.id === hubId ? { ...h, status } : h))
    );
    addAuditLog(`Hub Status -> ${status}`, 'Hub', hubId, `Status updated.`);
    showToast(`Hub status updated to ${status}`);

    if (syncWithBackend && !hubId.startsWith('hub_')) {
      hubsService.updateStatus(hubId, status as any).catch(() => {});
    }
  };

  const addRegion = (regionData: Partial<Region>) => {
    const newReg: Region = {
      id: `reg_${Date.now()}`,
      code: regionData.code || `REG-DH-${Math.floor(10 + Math.random() * 90)}`,
      name: regionData.name || 'New Catchment Region',
      nameBn: regionData.nameBn || regionData.name || 'নতুন অঞ্চল',
      division: regionData.division || 'Dhaka',
      regionalManagerName: regionData.regionalManagerName || 'Tariqul Islam',
      regionalManagerPhone: regionData.regionalManagerPhone || '+8801712000001',
      totalHubsCount: regionData.totalHubsCount || 1,
      activeHubsCount: regionData.activeHubsCount || 1,
      catchmentPopulation: regionData.catchmentPopulation || 150000,
      districts: regionData.districts || ['Dhaka'],
      catchmentUnions: regionData.catchmentUnions || ['Savar', 'Ashulia'],
      status: 'active',
    };

    setRegions((prev) => [newReg, ...prev]);
    addAuditLog(`Region Added (${newReg.code})`, 'Region', newReg.id, `Created ${newReg.name}.`);
    showToast(`Region added: ${newReg.name}`);

    if (syncWithBackend) {
      regionsService.createRegion({
        name: newReg.name,
        nameBn: newReg.nameBn,
        code: newReg.code,
        level: 'upazila',
      }).catch(() => {});
    }
  };

  const addCatchment = (catchmentData: Partial<CatchmentArea>) => {
    const newCatchment: CatchmentArea = {
      id: `catch_${Date.now()}`,
      hubId: catchmentData.hubId || selectedHubId,
      hubName: catchmentData.hubName || 'Healora Hub Savar',
      regionId: catchmentData.regionId || regions[0]?.id || 'reg_savar',
      name: catchmentData.name || 'Savar Upazila Catchment',
      nameBn: catchmentData.nameBn || 'সাভার উপজেলা এলাকা',
      upazila: catchmentData.upazila || 'Savar',
      unions: catchmentData.unions || ['Savar Sadar', 'Ashulia'],
      estimatedPopulation: catchmentData.estimatedPopulation || 45000,
      coverageRadiusKm: catchmentData.coverageRadiusKm || 12,
      basis: catchmentData.basis || 'operations_assignment',
      outOfCatchmentPolicy: catchmentData.outOfCatchmentPolicy || 'allowed_with_capacity',
    };

    setCatchments((prev) => [newCatchment, ...prev]);
    addAuditLog(`Catchment Assigned`, 'Catchment', newCatchment.id, `Linked ${newCatchment.name}.`);
    showToast(`Catchment linked: ${newCatchment.name}`);

    if (syncWithBackend && !catchmentData.hubId?.startsWith('hub_') && !catchmentData.regionId?.startsWith('reg_')) {
      hubsService.addCatchment(newCatchment.hubId, newCatchment.regionId).catch(() => {});
    }
  };

  const addStaffMember = (memberData: Partial<StaffMember>) => {
    const newStaff: StaffMember = {
      id: `stf_${Date.now()}`,
      fullName: memberData.fullName || 'New Staff Member',
      fullNameBn: memberData.fullNameBn || memberData.fullName || 'নতুন কর্মী',
      role: memberData.role || 'field_health_worker',
      roleTitle: 'Community Health Worker',
      roleTitleBn: 'কমিউনিটি স্বাস্থ্য কর্মী',
      phone: memberData.phone || '+8801700000000',
      bmdcOrLicenseNumber: memberData.bmdcOrLicenseNumber || 'BMDC-PENDING',
      active: true,
      assignedHubIds: [memberData.assignedHubIds?.[0] || selectedHubId],
      supervisorName: 'Kamrul Hassan (Hub Mgr)',
      credentialVerified: true,
      activeShift: 'Day Shift (08:00 - 16:00)',
    };

    setStaff((prev) => [newStaff, ...prev]);
    addAuditLog(`Staff Added (${newStaff.fullName})`, 'Staff', newStaff.id, `Role: ${newStaff.role}.`);
    showToast(`Staff member registered: ${newStaff.fullName}`);
  };

  const addStation = (stationData: Partial<HubStation>) => {
    const newStation: HubStation = {
      id: `st_${Date.now()}`,
      hubId: stationData.hubId || selectedHubId,
      name: stationData.name || `Station ${stations.length + 1}: Service Point`,
      nameBn: stationData.nameBn || stationData.name || `স্টেশন ${stations.length + 1}`,
      stationType: stationData.stationType || 'vitals',
      status: 'available',
      currentStaffName: stationData.currentStaffName || 'Station Staff',
      completedTodayCount: 0,
      supportedServices: ['NCD Vitals', 'Blood Pressure', 'Glucose'],
    };

    setStations((prev) => [...prev, newStation]);
    addAuditLog(`Station Added (${newStation.name})`, 'Hub', newStation.id, `Created station.`);
    showToast(`Station created: ${newStation.name}`);

    if (syncWithBackend && !selectedHubId.startsWith('hub_')) {
      stationsEquipmentService.createStation(selectedHubId, {
        name: newStation.name,
        nameBn: newStation.nameBn,
        stationType: 'triage_vitals',
      }).catch(() => {});
    }
  };

  const addEquipment = (eqData: Partial<HubEquipment>) => {
    const newEq: HubEquipment = {
      id: `eq_${Date.now()}`,
      code: eqData.code || `EQ-${Math.floor(1000 + Math.random() * 9000)}`,
      name: eqData.name || 'Digital Vitals Monitor',
      category: eqData.category || 'bp_monitor',
      model: eqData.model || 'MOD-2026',
      serialNumber: eqData.serialNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      hubId: eqData.hubId || selectedHubId,
      stationId: eqData.stationId || 'st_dhk_01',
      stationName: 'Station 2: Vitals & Triage',
      status: 'available',
      lastCalibrationDate: new Date().toISOString().slice(0, 10),
      nextCalibrationDue: '2026-12-31',
      batteryPercent: 100,
    };

    setEquipment((prev) => [newEq, ...prev]);
    addAuditLog(`Equipment Registered (${newEq.serialNumber})`, 'Equipment', newEq.id, `Added ${newEq.name}.`);
    showToast(`Equipment registered: ${newEq.name}`);

    if (syncWithBackend) {
      stationsEquipmentService.createEquipment({
        hubId: newEq.hubId,
        stationId: newEq.stationId,
        deviceType: newEq.category,
        deviceName: newEq.name,
        modelNumber: newEq.model,
        serialNumber: newEq.serialNumber,
      }).catch(() => {});
    }
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
        isAuthModalOpen,
        setIsAuthModalOpen,
        mfaChallenge,
        passwordChangeRequired,
        mfaEnrollmentRequired,
        mfaEnrollmentUri,
        syncWithBackend,
        setSyncWithBackend,
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
