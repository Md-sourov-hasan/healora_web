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

export interface ApiDataExport {
  id: string;
  requestedById?: string;
  reportCode: string;
  purpose: string;
  scopeHubId?: string | null;
  scopeRegionId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  patientLevel: boolean;
  status: 'requested' | 'approved' | 'rejected' | 'generated' | 'expired';
  approvedById?: string | null;
  approvedAt?: string | null;
  generatedAt?: string | null;
  rowCount?: number | null;
  expiresAt?: string | null;
  createdAt?: string;
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

  async getExports(params?: {
    status?: 'requested' | 'approved' | 'rejected' | 'generated' | 'expired';
    limit?: number;
    offset?: number;
  }): Promise<ApiDataExport[]> {
    const res = await apiRequest<ApiDataExport[] | { items: ApiDataExport[] }>('/exports', {
      params: params as Record<string, string | number>,
    });
    return Array.isArray(res) ? res : res.items || [];
  },

  async requestExport(data: { reportCode: string; from: string; to: string; hubId?: string; regionId?: string; purpose: string; patientLevel?: boolean }): Promise<ApiDataExport> {
    return apiRequest('/exports', {
      method: 'POST',
      json: data,
    });
  },

  async approveExport(id: string): Promise<ApiDataExport> {
    return apiRequest(`/exports/${id}/approve`, {
      method: 'POST',
      json: {},
    });
  },

  async rejectExport(id: string, reason: string): Promise<ApiDataExport> {
    return apiRequest(`/exports/${id}/reject`, {
      method: 'POST',
      json: { reason },
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
    action?: string;
    hubId?: string;
    outcome?: 'success' | 'denied' | 'error';
    priority?: 'normal' | 'high';
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

