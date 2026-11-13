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
  status: 'created' | 'assigned' | 'in_progress' | 'awaiting_sync' | 'sync_failed' | 'submitted' | 'reviewed' | 'completed' | 'unable_to_complete';
  disposition?: string | null;
  identityMatchStatus?: string;
  requiresDoctorReview: boolean;
  openedAt: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  closedAt?: string | null;
  sessionId?: string;
  patientId?: string;
  patient?: { fullName?: string | null; fullNameBn?: string | null } | null;
  hubId?: string;
  queueTicket?: { id: string; displayCode: string; status: string } | null;
  assignments?: Array<{ id: string; userId: string; name?: string | null; role: string; status: string; assignedAt: string; acceptedAt?: string | null; startedAt?: string | null }>;
  completeness?: { requiredTotal: number; captured: number; missingWithReason: number; waived: number; pending: number; optionalCaptured: number };
  sync?: { state: 'synced' | 'pending' | 'failed' | 'none'; accepted: number; failedUnresolved: number; failureCategories: string[]; lastServerAckAt?: string | null };
}

export interface ApiOperationalException {
  id: string;
  hubId: string;
  sessionId?: string | null;
  type: string;
  severity: 'low' | 'medium' | 'moderate' | 'high' | 'critical';
  status: 'open' | 'acknowledged' | 'in_progress' | 'escalated' | 'resolved' | 'dismissed';
  summary: string;
  title?: string;
  titleBn?: string;
  description?: string;
  detectedAt?: string;
  raisedAt: string;
  hub?: { id: string; code?: string; name?: string } | null;
  assignedTo?: { id: string; name?: string } | null;
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

  async getSessionEncounters(sessionId: string): Promise<{ sessionId: string; items: ApiEncounterOperational[] }> {
    return apiRequest<{ sessionId: string; items: ApiEncounterOperational[] }>(`/sessions/${sessionId}/encounters`);
  },

  async getOperationalEncounter(id: string): Promise<ApiEncounterOperational> {
    return apiRequest<ApiEncounterOperational>(`/encounters/${id}/operational`);
  },

  async assignEncounter(id: string, data: { userId: string; role: 'special_team_lead' | 'field_health_worker' | 'local_doctor' | 'registered_doctor'; stationId?: string; reason?: string }): Promise<unknown> {
    return apiRequest(`/encounters/${id}/assign`, {
      method: 'POST',
      json: data,
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

  async escalate(id: string, to: 'regional_operations' | 'clinical_operations', note: string): Promise<ApiOperationalException> {
    return apiRequest<ApiOperationalException>(`/exceptions/${id}/escalate`, {
      method: 'POST',
      json: { to, note },
    });
  },

  async resolve(id: string, note: string): Promise<ApiOperationalException> {
    return apiRequest<ApiOperationalException>(`/exceptions/${id}/resolve`, {
      method: 'POST',
      json: { note },
    });
  },

  async dismiss(id: string, reason: string): Promise<ApiOperationalException> {
    return apiRequest<ApiOperationalException>(`/exceptions/${id}/dismiss`, {
      method: 'POST',
      json: { reason },
    });
  },

  async triggerScan(): Promise<{ exceptionsFound: number; scanTime: string }> {
    return apiRequest('/exceptions/scan', { method: 'POST' });
  },
};

