/**
 * Healora Appointments & Booking Service
 * Endpoints from hello.md:
 * - GET /appointments
 * - GET /appointments/{id}
 * - POST /sessions/{sessionId}/appointments
 * - POST /appointments/{id}/confirm
 * - POST /appointments/{id}/arrived
 * - POST /appointments/{id}/check-in
 * - POST /appointments/{id}/reschedule
 * - POST /appointments/{id}/cancel
 * - POST /appointments/{id}/no-show
 * - GET /sessions/{sessionId}/waitlist
 * - POST /sessions/{sessionId}/waitlist
 * - POST /waitlist/{id}/offer
 * - POST /waitlist/{id}/remove
 */

import { apiRequest } from './apiClient';

export interface ApiAppointment {
  id: string;
  code: string;
  sessionId: string;
  hubId: string;
  patientId: string;
  slotId?: string | null;
  scheduledTime: string; // HH:MM or ISO
  serviceType: string;
  serviceTypeId?: string;
  status:
    | 'pending_confirmation'
    | 'confirmed'
    | 'arrived'
    | 'checked_in'
    | 'in_service'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'unable_to_complete'
    | 'referred';
  patient?: {
    id: string;
    healoraCode?: string;
    fullName: string;
    fullNameBn?: string;
    phone: string;
    gender?: string;
    age?: number;
  };
  queueToken?: string | null;
  notes?: string;
}

export interface AppointmentListResponse {
  items: ApiAppointment[];
  total?: number;
  limit: number;
  offset: number;
}

export interface WaitlistEntry {
  id: string;
  sessionId: string;
  patientId: string;
  patientName?: string;
  phone?: string;
  serviceType?: string;
  priority: number;
  status: 'waiting' | 'offered' | 'booked' | 'expired' | 'removed';
  createdAt: string;
}

export interface CheckInResponse {
  appointmentId: string;
  queueTicketId: string;
  displayCode: string;
  ticketNumber: number;
  status: string;
  stationId?: string;
  stationName?: string;
}

export const appointmentsService = {
  /**
   * Search appointments by date, status, hub, patient
   */
  async getAppointments(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    hubId?: string;
    patientId?: string;
    date?: string;
    sessionId?: string;
  }): Promise<AppointmentListResponse> {
    return apiRequest<AppointmentListResponse>('/appointments', {
      params: params as Record<string, string | number>,
    });
  },

  /**
   * Get appointment details
   */
  async getAppointment(id: string): Promise<ApiAppointment> {
    return apiRequest<ApiAppointment>(`/appointments/${id}`);
  },

  /**
   * Create an appointment for a session
   */
  async createAppointment(
    sessionId: string,
    data: {
      patientId: string;
      serviceTypeId?: string;
      scheduledTime?: string;
      notes?: string;
    }
  ): Promise<ApiAppointment> {
    return apiRequest<ApiAppointment>(`/sessions/${sessionId}/appointments`, {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Confirm appointment
   */
  async confirm(id: string): Promise<ApiAppointment> {
    return apiRequest<ApiAppointment>(`/appointments/${id}/confirm`, { method: 'POST', json: {} });
  },

  /**
   * Mark patient as arrived at hub reception
   */
  async markArrived(id: string): Promise<ApiAppointment> {
    return apiRequest<ApiAppointment>(`/appointments/${id}/arrived`, { method: 'POST', json: {} });
  },

  /**
   * Check in patient: generates queue ticket and starts visit
   */
  async checkIn(id: string): Promise<CheckInResponse> {
    return apiRequest<CheckInResponse>(`/appointments/${id}/check-in`, { method: 'POST', json: {} });
  },

  /**
   * Reschedule appointment
   */
  async reschedule(id: string, data: { newSessionId: string; newTime?: string }): Promise<ApiAppointment> {
    return apiRequest<ApiAppointment>(`/appointments/${id}/reschedule`, {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Cancel appointment
   */
  async cancel(id: string, reason: string): Promise<ApiAppointment> {
    return apiRequest<ApiAppointment>(`/appointments/${id}/cancel`, {
      method: 'POST',
      json: { reason },
    });
  },

  /**
   * Mark appointment as no-show
   */
  async markNoShow(id: string): Promise<ApiAppointment> {
    return apiRequest<ApiAppointment>(`/appointments/${id}/no-show`, { method: 'POST', json: {} });
  },

  /**
   * Get waitlist for a session
   */
  async getWaitlist(sessionId: string): Promise<WaitlistEntry[]> {
    return apiRequest<WaitlistEntry[]>(`/sessions/${sessionId}/waitlist`);
  },

  /**
   * Add patient to session waitlist
   */
  async addToWaitlist(
    sessionId: string,
    data: { patientId: string; serviceTypeId?: string; priority?: number }
  ): Promise<WaitlistEntry> {
    return apiRequest<WaitlistEntry>(`/sessions/${sessionId}/waitlist`, {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Offer waitlist spot to patient
   */
  async offerWaitlist(id: string): Promise<{ success: boolean }> {
    return apiRequest(`/waitlist/${id}/offer`, { method: 'POST', json: {} });
  },

  /**
   * Remove patient from waitlist
   */
  async removeFromWaitlist(id: string, reason?: string): Promise<{ success: boolean }> {
    return apiRequest(`/waitlist/${id}/remove`, { method: 'POST', json: { reason } });
  },
};

