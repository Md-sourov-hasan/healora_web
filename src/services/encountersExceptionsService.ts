/**
 * Healora Encounter Monitoring & Operational Exceptions Service
 * Endpoints from hello.md:
 * - GET /sessions/{sessionId}/encounters
 * - GET /encounters/{id}/operational
 * - POST /encounters/{id}/assign
 * - GET /exceptions
 * - GET /exceptions/{id}
 * - POST /exceptions/{id}/acknowledge
 * - POST /exceptions/{id}/assign
 * - POST /exceptions/{id}/escalate
 * - POST /exceptions/{id}/resolve
 * - POST /exceptions/{id}/dismiss
 * - POST /exceptions/scan
 */

import { apiRequest } from './apiClient';

export interface ApiEncounterOperational {
  id: string;
  sessionId: string;
  patientId: string;
  patientName: string;
  patientNameBn?: string | null;
  patientPhone: string;
  ticketNumber: string;
  syncStatus: 'synced' | 'pending_sync' | 'sync_conflict' | 'failed';
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  currentStationId?: string | null;
  currentStationName?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  lastSyncAttempt?: string | null;
  conflictDetails?: string | null;
  clinicalSummaryMasked?: string;
  vitalCount?: number;
}

export interface ApiOperationalException {
  id: string;
  hubId: string;
  sessionId?: string | null;
  type:
    | 'long_wait'
    | 'unassigned_task'
    | 'stalled_encounter'
    | 'review_overdue'
    | 'sync_delayed'
    | 'equipment_fault'
    | 'capacity_overrun';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'in_progress' | 'escalated' | 'resolved' | 'dismissed';
  title: string;
  titleBn?: string;
  description: string;
  detectedAt: string;
  acknowledgedAt?: string | null;
  acknowledgedBy?: string | null;
  assignedToUserId?: string | null;
  assignedToName?: string | null;
  resolvedAt?: string | null;
  resolutionNotes?: string | null;
  entityType?: string;
  entityId?: string;
}

export const encountersExceptionsService = {
  // ---- ENCOUNTER MONITORING ----

  async getSessionEncounters(sessionId: string): Promise<ApiEncounterOperational[]> {
    return apiRequest<ApiEncounterOperational[]>(`/sessions/${sessionId}/encounters`);
  },

  async getOperationalEncounter(id: string): Promise<ApiEncounterOperational> {
    return apiRequest<ApiEncounterOperational>(`/encounters/${id}/operational`);
  },

  async assignEncounter(id: string, assignedToUserId: string): Promise<{ success: boolean }> {
    return apiRequest(`/encounters/${id}/assign`, {
      method: 'POST',
      json: { assignedToUserId },
    });
  },

  // ---- OPERATIONAL EXCEPTIONS ----

  async getExceptions(params?: {
    hubId?: string;
    sessionId?: string;
    status?: string;
    severity?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: ApiOperationalException[]; total?: number; limit: number; offset: number }> {
    return apiRequest('/exceptions', {
      params: params as Record<string, string | number>,
    });
  },

  async getException(id: string): Promise<ApiOperationalException> {
    return apiRequest<ApiOperationalException>(`/exceptions/${id}`);
  },

  async acknowledge(id: string): Promise<ApiOperationalException> {
    return apiRequest<ApiOperationalException>(`/exceptions/${id}/acknowledge`, {
      method: 'POST',
      json: {},
    });
  },

  async assign(id: string, userId: string): Promise<ApiOperationalException> {
    return apiRequest<ApiOperationalException>(`/exceptions/${id}/assign`, {
      method: 'POST',
      json: { userId },
    });
  },

  async escalate(id: string, reason: string): Promise<ApiOperationalException> {
    return apiRequest<ApiOperationalException>(`/exceptions/${id}/escalate`, {
      method: 'POST',
      json: { reason },
    });
  },

  async resolve(id: string, notes: string): Promise<ApiOperationalException> {
    return apiRequest<ApiOperationalException>(`/exceptions/${id}/resolve`, {
      method: 'POST',
      json: { notes },
    });
  },

  async dismiss(id: string, reason: string): Promise<ApiOperationalException> {
    return apiRequest<ApiOperationalException>(`/exceptions/${id}/dismiss`, {
      method: 'POST',
      json: { reason },
    });
  },

  async triggerScan(): Promise<{ exceptionsFound: number; scanTime: string }> {
    return apiRequest('/exceptions/scan', {
      method: 'POST',
      json: {},
    });
  },
};

