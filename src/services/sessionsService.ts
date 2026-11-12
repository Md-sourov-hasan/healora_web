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
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  capacityTotal: number;
  capacityBooked: number;
  capacityWalkIn: number;
  locationName?: string;
  locationDetails?: string;
  notes?: string;
  readinessPassed?: boolean;
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

export const sessionsService = {
  /**
   * List sessions filterable by hub, date range, and status
   */
  async getSessions(params?: {
    hubId?: string;
    from?: string;
    to?: string;
    status?: string | string[];
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
  async createSession(data: Partial<ApiSession>): Promise<ApiSession> {
    return apiRequest<ApiSession>('/sessions', {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Update session details
   */
  async updateSession(id: string, data: Partial<ApiSession>): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}`, {
      method: 'PATCH',
      json: data,
    });
  },

  /**
   * Check session readiness checklist (staff, equipment, consent forms)
   */
  async checkReadiness(id: string): Promise<{
    ready: boolean;
    checks: Array<{ code: string; label: string; passed: boolean; message?: string }>;
  }> {
    return apiRequest(`/sessions/${id}/readiness`);
  },

  /**
   * Session state transitions
   */
  async publish(id: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/publish`, { method: 'POST', json: {} });
  },

  async openBooking(id: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/open-booking`, { method: 'POST', json: {} });
  },

  async start(id: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/start`, { method: 'POST', json: {} });
  },

  async pause(id: string, reason?: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/pause`, { method: 'POST', json: { reason } });
  },

  async resume(id: string): Promise<ApiSession> {
    return apiRequest<ApiSession>(`/sessions/${id}/resume`, { method: 'POST', json: {} });
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
  async updateCapacity(id: string, capacity: { total: number; walkIn: number }): Promise<ApiSession> {
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
    data: { slotDurationMinutes: number; capacityPerSlot: number }
  ): Promise<SessionSlot[]> {
    return apiRequest<SessionSlot[]>(`/sessions/${sessionId}/slots/generate`, {
      method: 'POST',
      json: data,
    });
  },
};

