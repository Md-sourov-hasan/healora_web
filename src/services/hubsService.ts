/**
 * Healora Hubs Service
 * Endpoints from hello.md:
 * - GET /hubs
 * - GET /hubs/{id}
 * - POST /hubs
 * - PATCH /hubs/{id}
 * - POST /hubs/{id}/status
 * - PUT /hubs/{id}/manager
 * - GET /hubs/{id}/operating-hours
 * - PUT /hubs/{id}/operating-hours
 * - GET /hubs/{id}/catchments
 * - POST /hubs/{id}/catchments
 * - DELETE /hubs/{id}/catchments/{regionId}
 * - GET /hubs/{id}/availability-blocks
 * - POST /hubs/{id}/availability-blocks
 * - POST /hubs/{id}/availability-blocks/{blockId}/lift
 * - GET /hubs/{id}/staff
 * - GET /hubs/{id}/service-offerings
 */

import { apiRequest } from './apiClient';

export interface ApiHub {
  id: string;
  code: string;
  name: string;
  nameBn?: string | null;
  status: 'draft' | 'active' | 'paused' | 'temporarily_closed' | 'permanently_closed';
  regionId: string;
  addressLine?: string | null;
  contactPhone?: string | null;
  managerUserId?: string | null;
  operatorType?: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface HubListResponse {
  items: ApiHub[];
  total?: number;
  limit: number;
  offset: number;
}

export interface OperatingHoursDay {
  dayOfWeek: number; // 0=Sunday..6=Saturday
  openTime: string; // HH:MM
  closeTime: string; // HH:MM
  closed: boolean;
}

export const hubsService = {
  /**
   * List hubs visible to current staff
   */
  async getHubs(params?: {
    limit?: number;
    offset?: number;
    regionId?: string;
    status?: string;
    q?: string;
  }): Promise<HubListResponse> {
    return apiRequest<HubListResponse>('/hubs', { params: params as Record<string, string | number> });
  },

  /**
   * Get single hub details
   */
  async getHub(id: string): Promise<ApiHub> {
    return apiRequest<ApiHub>(`/hubs/${id}`);
  },

  /**
   * Create new hub
   */
  async createHub(data: Partial<ApiHub>): Promise<ApiHub> {
    return apiRequest<ApiHub>('/hubs', {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Update hub details
   */
  async updateHub(id: string, data: Partial<ApiHub>): Promise<ApiHub> {
    return apiRequest<ApiHub>(`/hubs/${id}`, {
      method: 'PATCH',
      json: data,
    });
  },

  /**
   * Change hub lifecycle status
   */
  async updateStatus(id: string, status: ApiHub['status'], reason?: string): Promise<ApiHub> {
    return apiRequest<ApiHub>(`/hubs/${id}/status`, {
      method: 'POST',
      json: { status, reason },
    });
  },

  /**
   * Set hub manager
   */
  async setManager(id: string, managerUserId: string): Promise<{ success: boolean }> {
    return apiRequest(`/hubs/${id}/manager`, {
      method: 'PUT',
      json: { managerUserId },
    });
  },

  /**
   * Get hub operating hours
   */
  async getOperatingHours(id: string): Promise<{ schedule: OperatingHoursDay[] }> {
    return apiRequest(`/hubs/${id}/operating-hours`);
  },

  /**
   * Update hub operating hours
   */
  async setOperatingHours(id: string, schedule: OperatingHoursDay[]): Promise<{ schedule: OperatingHoursDay[] }> {
    return apiRequest(`/hubs/${id}/operating-hours`, {
      method: 'PUT',
      json: { schedule },
    });
  },

  /**
   * Get catchment areas assigned to this hub
   */
  async getCatchments(id: string): Promise<Array<{ regionId: string; priority: number; regionName?: string }>> {
    return apiRequest(`/hubs/${id}/catchments`);
  },

  /**
   * Add a catchment area
   */
  async addCatchment(id: string, regionId: string, priority = 1): Promise<{ success: boolean }> {
    return apiRequest(`/hubs/${id}/catchments`, {
      method: 'POST',
      json: { regionId, priority },
    });
  },

  /**
   * Remove a catchment area
   */
  async deleteCatchment(id: string, regionId: string): Promise<void> {
    return apiRequest(`/hubs/${id}/catchments/${regionId}`, { method: 'DELETE' });
  },

  /**
   * List availability blocks / emergency closures
   */
  async getAvailabilityBlocks(id: string): Promise<Array<{ id: string; startsAt: string; endsAt: string; reason: string }>> {
    return apiRequest(`/hubs/${id}/availability-blocks`);
  },

  /**
   * Declare availability block / closure
   */
  async createAvailabilityBlock(id: string, data: { startsAt: string; endsAt: string; reason: string }): Promise<{ id: string }> {
    return apiRequest(`/hubs/${id}/availability-blocks`, {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Lift an availability block
   */
  async liftAvailabilityBlock(id: string, blockId: string): Promise<void> {
    return apiRequest(`/hubs/${id}/availability-blocks/${blockId}/lift`, { method: 'POST' });
  },

  /**
   * List staff assigned to this hub
   */
  async getStaff(id: string): Promise<Array<{ id: string; name: string; role: string; email: string; phone?: string }>> {
    return apiRequest(`/hubs/${id}/staff`);
  },
};

