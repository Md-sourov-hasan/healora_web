/**
 * Healora Sessions & Health Camps Service
 * Endpoints from hello.md:
 * - GET /sessions
 * - GET /sessions/{id}
 * - POST /sessions
 * - PATCH /sessions/{id}
 * - GET /sessions/{id}/readiness
 * - POST /sessions/{id}/publish
 * - POST /sessions/{id}/open-booking
 * - POST /sessions/{id}/pause
 * - POST /sessions/{id}/resume
 * - POST /sessions/{id}/start
 * - POST /sessions/{id}/complete
 * - POST /sessions/{id}/cancel
 * - POST /sessions/{id}/capacity
 * - GET /sessions/{id}/slots
 * - POST /sessions/{id}/slots/generate
 */

import { apiRequest } from './apiClient';

export interface ApiSession {
  id: string;
  hubId: string;
  serviceTypeId: string;
  serviceTypeCode?: string;
  teamLeadUserId?: string | null;
  teamLeadName?: string | null;
  sessionType: 'standard_clinic' | 'special_camp' | 'outreach_event' | 'other';
  status:
    | 'draft'
    | 'published'
    | 'open_for_booking'
    | 'full'
    | 'in_progress'
    | 'paused'
    | 'completed'
    | 'cancelled';
  title?: string;
  titleBn?: string;
  sessionDate: string;
  startsAt: string;
  endsAt: string;
  appointmentCapacity: number;
  walkInCapacity: number;
  bookedCount: number;
  walkInCount: number;
  allowOverbooking?: boolean;
  version: number;
  hub?: { id: string; name: string; status: string };
  venueAddress?: string | null;
  operationalNotes?: string | null;
  readiness?: { staffReady?: boolean; equipmentReady?: boolean };
  healthWorkersCount?: number;
  doctorsCount?: number;
}

export interface SessionListResponse {
  items: ApiSession[];
  total?: number;
  limit: number;
  offset: number;
}

export interface SessionSlot {
  id: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  status: 'available' | 'booked' | 'blocked';
  blockedReason?: string | null;
}

export interface SessionReadinessIssue {
  kind: 'hub' | 'availability' | 'staff_role' | 'station_type' | 'equipment_type' | 'equipment_item' | 'service_offering';
  code: string;
  required?: number;
  available?: number;
  detail: string;
}

export interface SessionReadiness {
  sessionId: string;
  ready: boolean;
  unmet: SessionReadinessIssue[];
  warnings: SessionReadinessIssue[];
}

export const sessionsService = {
  /**
   * List sessions filterable by hub, date range, and status
   */
  async getSessions(params?: {
    hubId?: string;
    from?: string;
    to?: string;
    status?: string;
    sessionType?: string;
    limit?: number;
    offset?: number;
  }): Promise<SessionListResponse> {
    return apiRequest<SessionListResponse>('/sessions', {
      params: params as Record<string, string | number>,
    });
  },

  /**
   * Get single session details
   */
  async getSession(id: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}`);
  },

  /**
   * Create new session / health camp
   */
  async createSession(data: {
    hubId: string; serviceTypeId: string; title: string; titleBn?: string; sessionType: ApiSession['sessionType'];
    sessionDate: string; startsAt: string; endsAt: string; venueAddress?: string;
    appointmentCapacity: number; walkInCapacity: number; slotMinutes?: number;
    teamLeadUserId?: string;
  }): Promise<ApiSession> {
    return apiRequest<ApiSession>('/sessions', {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Update session details
   */
  async updateSession(id: string, data: Partial<Omit<ApiSession, 'id' | 'hubId'>>): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}`, {
      method: 'PATCH',
      json: data,
    });
  },

  /**
   * Check session readiness checklist (staff, equipment, consent forms)
   */
  async checkReadiness(id: string): Promise<SessionReadiness> {
    return apiRequest(`/sessions/${id}/readiness`);
  },

  /**
   * Session state transitions
   */
  async publish(id: string, overrideReason?: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/publish`, { method: 'POST', json: { overrideReason } });
  },

  async openBooking(id: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/open-booking`, { method: 'POST', json: {} });
  },

  async start(id: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/start`, { method: 'POST', json: {} });
  },

  async pause(id: string, reason: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/pause`, { method: 'POST', json: { reason } });
  },

  async resume(id: string, reason?: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/resume`, { method: 'POST', json: { reason } });
  },

  async complete(id: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/complete`, { method: 'POST', json: {} });
  },

  async cancel(id: string, reason: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/cancel`, { method: 'POST', json: { reason } });
  },

  /**
   * Adjust session capacity
   */
  async updateCapacity(id: string, capacity: { appointmentCapacity?: number; walkInCapacity?: number; expectedVersion: number; reason: string }): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/capacity`, { method: 'POST', json: capacity });
  },

  /**
   * Get slots for a session
   */
  async getSlots(sessionId: string): Promise<SessionSlot[]> {
    return apiRequest<SessionSlot[]>(`/sessions/${sessionId}/slots`);
  },

  /**
   * Generate slots for a session
   */
  async generateSlots(
    sessionId: string,
    data: { perSlotCapacity?: number }
  ): Promise<SessionSlot[]> {
    return apiRequest<SessionSlot[]>(`/sessions/${sessionId}/slots/generate`, {
      method: 'POST',
      json: data,
    });
  },
};

