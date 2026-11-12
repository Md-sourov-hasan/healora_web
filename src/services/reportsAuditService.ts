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

import { apiRequest } from './apiClient';

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
  timestamp: string;
  actorUserId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  hubId?: string | null;
  hubName?: string | null;
  details?: Record<string, unknown> | string;
  ipAddress?: string;
  userAgent?: string;
  outcome: 'success' | 'denied' | 'error';
}

export interface ApiNotification {
  id: string;
  recipientUserId: string;
  category: 'operational' | 'clinical' | 'queue' | 'sync' | 'security' | 'system';
  title: string;
  titleBn?: string;
  message: string;
  messageBn?: string;
  severity: 'info' | 'warning' | 'alert';
  read: boolean;
  createdAt: string;
  actionRoute?: string;
}

export interface BreakGlassLog {
  id: string;
  userId: string;
  userName: string;
  reason: string;
  targetPatientId?: string;
  targetHubId?: string;
  startedAt: string;
  endedAt?: string | null;
  active: boolean;
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

  async getReports(): Promise<ApiReportMeta[]> {
    return apiRequest<ApiReportMeta[]>('/reports');
  },

  async getReportData(code: string, params?: Record<string, string>): Promise<unknown> {
    return apiRequest(`/reports/${code}`, { params });
  },

  async requestExport(data: { reportCode: string; format: 'csv'; parameters?: Record<string, unknown> }): Promise<{ exportId: string }> {
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
    entityType?: string;
    entityId?: string;
    actorUserId?: string;
    from?: string;
    to?: string;
  }): Promise<{ items: ApiAuditEvent[]; total?: number; limit: number; offset: number }> {
    return apiRequest('/audit-events', {
      params: params as Record<string, string | number>,
    });
  },

  // ---- NOTIFICATIONS ----

  async getNotifications(params?: {
    limit?: number;
    offset?: number;
  }): Promise<{ items: ApiNotification[]; unreadCount: number }> {
    return apiRequest('/notifications', {
      params: params as Record<string, string | number>,
    });
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return apiRequest(`/notifications/${id}/read`, {
      method: 'POST',
      json: {},
    });
  },

  // ---- BREAK-GLASS ACCESS ----

  async requestBreakGlass(data: {
    reason: string;
    targetPatientId?: string;
    targetHubId?: string;
  }): Promise<BreakGlassLog> {
    return apiRequest<BreakGlassLog>('/admin/break-glass', {
      method: 'POST',
      json: data,
    });
  },

  async getBreakGlassList(): Promise<BreakGlassLog[]> {
    return apiRequest<BreakGlassLog[]>('/admin/break-glass');
  },

  async endBreakGlass(id: string): Promise<void> {
    return apiRequest(`/admin/break-glass/${id}/end`, {
      method: 'POST',
      json: {},
    });
  },
};

