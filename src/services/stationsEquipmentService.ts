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
  stationNumber: number;
  name: string;
  nameBn?: string | null;
  stationType: 'reception' | 'triage_vitals' | 'consultation' | 'lab_sampling' | 'pharmacy_checkout';
  status: 'active' | 'inactive' | 'maintenance' | 'closed';
  currentStaffId?: string | null;
  currentStaffName?: string | null;
  currentTicketNumber?: string | null;
  assignedEquipmentIds?: string[];
}

export interface ApiEquipment {
  id: string;
  hubId: string;
  stationId?: string | null;
  deviceType: string;
  deviceName: string;
  deviceNameBn?: string | null;
  modelNumber: string;
  serialNumber: string;
  status: 'available' | 'assigned' | 'maintenance' | 'calibration_due' | 'out_of_service' | 'retired';
  batteryPercent?: number | null;
  lastSyncTime?: string | null;
  lastCalibrationDate?: string | null;
  nextCalibrationDate?: string | null;
  activeFaultDescription?: string | null;
}

export const stationsEquipmentService = {
  // ---- STATIONS ----

  async getStations(hubId: string): Promise<ApiStation[]> {
    return apiRequest<ApiStation[]>(`/hubs/${hubId}/stations`);
  },

  async createStation(hubId: string, data: Partial<ApiStation>): Promise<ApiStation> {
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

  async setStationStatus(id: string, status: ApiStation['status']): Promise<ApiStation> {
    return apiRequest<ApiStation>(`/stations/${id}/status`, {
      method: 'POST',
      json: { status },
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

  async createEquipment(data: Partial<ApiEquipment>): Promise<ApiEquipment> {
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

  async setEquipmentStatus(id: string, status: ApiEquipment['status']): Promise<ApiEquipment> {
    return apiRequest<ApiEquipment>(`/equipment/${id}/status`, {
      method: 'POST',
      json: { status },
    });
  },

  async reportFault(id: string, description: string, severity = 'high'): Promise<{ success: boolean }> {
    return apiRequest(`/equipment/${id}/faults`, {
      method: 'POST',
      json: { description, severity },
    });
  },

  async resolveFault(id: string, resolutionNotes: string): Promise<{ success: boolean }> {
    return apiRequest(`/equipment/${id}/faults/resolve`, {
      method: 'POST',
      json: { resolutionNotes },
    });
  },

  async retireEquipment(id: string, reason: string): Promise<void> {
    return apiRequest(`/equipment/${id}/retire`, {
      method: 'POST',
      json: { reason },
    });
  },

  async getEquipmentEvents(id: string): Promise<Array<{ id: string; timestamp: string; eventType: string; description: string }>> {
    return apiRequest(`/equipment/${id}/events`);
  },
};

