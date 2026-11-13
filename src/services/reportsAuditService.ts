/**
 * Healora Dashboard, Reports, Audit Logs & Notifications Service
 * Endpoints from hello.md:
 * - GET /dashboard/overview
 * - GET /reports
 * - GET /reports/{code}
 * - GET /exports
 * - POST /exports
 * - GET /exports/{id}/download
 * - GET /audit-events
 * - GET /notifications
 * - POST /notifications/{id}/read
 * - POST /admin/break-glass
 * - GET /admin/break-glass
 * - POST /admin/break-glass/{id}/end
 */

import { apiRequest, parseApiDate } from './apiClient';

export interface DashboardOverviewResponse {
  date: string;
  generatedAt: string;
  hubsInScope: number;
  cards: {
    activeHubs: { count: number; source: string };
    operatingToday: { hubs: number; sessions: number; inProgress: number; source: string };
    appointmentsBookedToday: { count: number; source: string };
    visits: {
      expected: number;
      arrived: number;
      checkedIn: number;
      waiting: number;
      inService: number;
      awaitingReview: number;
      completed: number;
      cancelled: number;
      noShow: number;
      source: string;
    };
    timings: {
      estimate: boolean;
      avgWaitingMinutes?: number | null;
      avgServiceMinutes?: number | null;
      basis: string;
      source: string;
    };
    staffing: { scheduled: number; checkedIn: number };
  };
}

export interface ApiReportMeta {
  code: string;
  name: string;
  nameBn?: string;
  description: string;
  category: 'clinical' | 'operations' | 'quality' | 'finance';
  parameters: Array<{ name: string; type: string; required: boolean }>;
}

export interface ApiAuditEvent {
  id: string;
  occurredAt: string;
  actorUserId?: string | null;
  actorName?: string | null;
  actorRole?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  scopeHubId?: string | null;
  hub?: { id: string; name?: string } | null;
  metadata?: Record<string, unknown> | string | null;
  reason?: string | null;
  outcome: 'success' | 'denied' | 'error';
}

export interface ApiNotification {
  id: string;
  templateCode: string;
  language: 'bn' | 'en';
  deepLink?: string | null;
  relatedType?: string | null;
  relatedId?: string | null;
  queuedAt: string;
  status: string;
}

export interface BreakGlassLog {
  id: string;
  userId: string;
  patientId: string;
  reason: string;
  startsAt: string;
  expiresAt: string;
  endedAt?: string | null;
  reviewOutcome?: 'pending' | 'justified' | 'not_justified' | null;
  user?: { id: string; name: string };
  patient?: { id: string; healoraCode: string };
}

export function isBreakGlassActive(record: BreakGlassLog): boolean {
  const expiration = parseApiDate(record.expiresAt);
  return !record.endedAt && Boolean(expiration && expiration.getTime() > Date.now());
}

export const reportsAuditService = {
  // ---- DASHBOARD OVERVIEW ----

  async getDashboardOverview(params?: {
    hubId?: string;
    regionId?: string;
    date?: string;
    serviceTypeId?: string;
  }): Promise<DashboardOverviewResponse> {
    return apiRequest<DashboardOverviewResponse>('/dashboard/overview', {
      params: params as Record<string, string>,
    });
  },

  // ---- REPORTS & EXPORTS ----

  async getReports(): Promise<{ reports: string[]; maxRangeDays: number; note: string }> {
    return apiRequest('/reports');
  },

  async getReportData(code: string, params?: Record<string, string>): Promise<unknown> {
    return apiRequest(`/reports/${code}`, { params });
  },

  async requestExport(data: { reportCode: string; from: string; to: string; hubId?: string; regionId?: string; purpose: string; patientLevel?: boolean }): Promise<{ id: string; status: string; reportCode: string }> {
    return apiRequest('/exports', {
      method: 'POST',
      json: data,
    });
  },

  async downloadExport(id: string): Promise<Blob> {
    return apiRequest<Blob>(`/exports/${id}/download`);
  },

  // ---- AUDIT EVENTS ----

  async getAuditEvents(params?: {
    limit?: number;
    offset?: number;
    targetType?: string;
    targetId?: string;
    actorUserId?: string;
    from?: string;
    to?: string;
  }): Promise<ApiAuditEvent[]> {
    return apiRequest('/audit-events', {
      params: params as Record<string, string | number>,
    });
  },

  // ---- NOTIFICATIONS ----

  async getNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiNotification[]> {
    return apiRequest('/notifications', {
      params: params as Record<string, string | number>,
    });
  },

  async markNotificationRead(id: string): Promise<void> {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'POST',
      json: {},
    });
  },

  // ---- BREAK-GLASS ACCESS ----

  async requestBreakGlass(data: {
    patientId: string;
    reason: string;
    durationMinutes?: number;
  }): Promise<BreakGlassLog> {
    return apiRequest<BreakGlassLog>('/admin/break-glass', {
      method: 'POST',
      json: data,
    });
  },

  async getBreakGlassList(): Promise<{ items: BreakGlassLog[] }> {
    return apiRequest<{ items: BreakGlassLog[] }>('/admin/break-glass');
  },

  async getMyBreakGlass(): Promise<{ items: BreakGlassLog[] }> {
    return apiRequest<{ items: BreakGlassLog[] }>('/admin/break-glass/mine');
  },

  async endBreakGlass(id: string): Promise<void> {
    return apiRequest(`/admin/break-glass/${id}/end`, {
      method: 'POST',
      json: {},
    });
  },

  async reviewBreakGlass(id: string, outcome: 'justified' | 'not_justified', notes?: string): Promise<BreakGlassLog> {
    return apiRequest<BreakGlassLog>(`/admin/break-glass/${id}/review`, {
      method: 'POST',
      json: { outcome, notes },
    });
  },
};

