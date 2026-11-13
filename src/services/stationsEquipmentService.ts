/**
 * Healora Stations & Equipment Service
 * Endpoints from hello.md:
 * - GET /hubs/{hubId}/stations
 * - POST /hubs/{hubId}/stations
 * - PATCH /stations/{id}
 * - DELETE /stations/{id}
 * - POST /stations/{id}/status
 * - GET /stations/{id}/service-types
 * - PUT /stations/{id}/service-types
 * - GET /equipment
 * - GET /equipment/{id}
 * - POST /equipment
 * - PATCH /equipment/{id}
 * - POST /equipment/{id}/status
 * - POST /equipment/{id}/faults
 * - POST /equipment/{id}/faults/resolve
 * - POST /equipment/{id}/retire
 * - GET /equipment/{id}/events
 */

import { apiRequest } from './apiClient';

export interface ApiStation {
  id: string;
  hubId: string;
  code: string;
  name: string;
  nameBn?: string | null;
  stationType: 'registration' | 'vitals' | 'doctor_review' | 'counselling' | 'waiting' | 'other';
  status: 'available' | 'busy' | 'paused' | 'out_of_service';
  currentTicketNumber?: string | null;
  sortOrder?: number;
  serviceTypeIds?: string[];
  currentStaff?: { id: string; name: string | null } | null;
}

export interface ApiEquipment {
  id: string;
  hubId: string;
  stationId?: string | null;
  assetTag: string;
  category: 'bp_monitor' | 'glucometer' | 'weighing_scale' | 'stadiometer' | 'thermometer' | 'pulse_oximeter' | 'tablet' | 'printer' | 'other';
  make?: string | null;
  model?: string | null;
  serialNumber?: string | null;
  ownerName?: string | null;
  status: 'available' | 'assigned' | 'maintenance' | 'calibration_due' | 'out_of_service' | 'retired';
  batteryPercent?: number | null;
  lastSyncTime?: string | null;
  lastCalibratedAt?: string | null;
  nextCalibrationDue?: string | null;
  notes?: string | null;
  calibrationOverdue?: boolean;
  station?: { id: string; name: string } | null;
  activeFaultDescription?: string | null;
}

export const stationsEquipmentService = {
  // ---- STATIONS ----

  async getStations(hubId: string): Promise<ApiStation[]> {
    return apiRequest<ApiStation[]>(`/hubs/${hubId}/stations`);
  },

  async createStation(hubId: string, data: { code: string; name: string; nameBn?: string; stationType: ApiStation['stationType']; sortOrder?: number; serviceTypeIds?: string[] }): Promise<ApiStation> {
    return apiRequest<ApiStation>(`/hubs/${hubId}/stations`, {
      method: 'POST',
      json: data,
    });
  },

  async updateStation(id: string, data: Partial<ApiStation>): Promise<ApiStation> {
    return apiRequest<ApiStation>(`/stations/${id}`, {
      method: 'PATCH',
      json: data,
    });
  },

  async deleteStation(id: string): Promise<void> {
    return apiRequest(`/stations/${id}`, { method: 'DELETE' });
  },

  async setStationStatus(id: string, status: ApiStation['status'], reason?: string): Promise<ApiStation> {
    return apiRequest<ApiStation>(`/stations/${id}/status`, {
      method: 'POST',
      json: { status, reason },
    });
  },

  // ---- EQUIPMENT ----

  async getEquipment(params?: {
    hubId?: string;
    stationId?: string;
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: ApiEquipment[]; total?: number; limit: number; offset: number }> {
    return apiRequest('/equipment', {
      params: params as Record<string, string | number>,
    });
  },

  async getEquipmentItem(id: string): Promise<ApiEquipment> {
    return apiRequest<ApiEquipment>(`/equipment/${id}`);
  },

  async createEquipment(data: { hubId: string; stationId?: string; assetTag: string; category: ApiEquipment['category']; make?: string; model?: string; serialNumber?: string; ownerName?: string; nextCalibrationDue?: string; notes?: string }): Promise<ApiEquipment> {
    return apiRequest<ApiEquipment>('/equipment', {
      method: 'POST',
      json: data,
    });
  },

  async updateEquipment(id: string, data: Partial<ApiEquipment>): Promise<ApiEquipment> {
    return apiRequest<ApiEquipment>(`/equipment/${id}`, {
      method: 'PATCH',
      json: data,
    });
  },

  async setEquipmentStatus(id: string, status: Exclude<ApiEquipment['status'], 'retired'>, reason: string): Promise<ApiEquipment> {
    return apiRequest<ApiEquipment>(`/equipment/${id}/status`, {
      method: 'POST',
      json: { status, reason },
    });
  },

  async reportFault(id: string, notes: string, sessionId?: string, takeOutOfService = true): Promise<unknown> {
    return apiRequest(`/equipment/${id}/faults`, {
      method: 'POST',
      json: { notes, sessionId, takeOutOfService },
    });
  },

  async resolveFault(id: string, notes: string, status: 'available' | 'assigned' | 'calibration_due' = 'available'): Promise<unknown> {
    return apiRequest(`/equipment/${id}/faults/resolve`, {
      method: 'POST',
      json: { notes, status },
    });
  },

  async recordServiceEvent(id: string, data: { kind: 'inspection' | 'calibration' | 'maintenance'; notes?: string; serviceProvider?: string; nextDueOn?: string }): Promise<unknown> {
    return apiRequest(`/equipment/${id}/service-events`, { method: 'POST', json: data });
  },

  async retireEquipment(id: string, reason: string): Promise<void> {
    return apiRequest(`/equipment/${id}/retire`, {
      method: 'POST',
      json: { reason },
    });
  },

  async getEquipmentEvents(id: string): Promise<{ items: Array<{ id: string; occurredAt: string; kind: string; notes?: string | null }> }> {
    return apiRequest(`/equipment/${id}/events`);
  },
};

