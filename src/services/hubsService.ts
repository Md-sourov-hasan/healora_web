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
  addressLineBn?: string | null;
  contactPhone?: string | null;
  managerUserId?: string | null;
  operatorType?: string;
  latitude?: number | null;
  longitude?: number | null;
  directions?: string | null;
  directionsBn?: string | null;
  languages?: string[];
  accessibilityNotes?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  nearestReferralFacility?: string | null;
  referralFacilityPhone?: string | null;
  referralInstructions?: string | null;
  operatorName?: string | null;
  region?: { id: string; name?: string; level?: string } | null;
  manager?: { id: string; name?: string; phone?: string | null } | null;
  serviceOfferings?: Array<{ serviceType?: { id: string; code: string; name: string; nameBn?: string | null } | null }>;
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
  id?: string;
  hubId?: string;
  dayOfWeek: number;
  opensAt: string;
  closesAt: string;
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
  async createHub(data: {
    code: string; regionId: string; name: string; addressLine: string; nameBn?: string;
    addressLineBn?: string; contactPhone?: string; emergencyContactName?: string;
    emergencyContactPhone?: string; nearestReferralFacility?: string; referralFacilityPhone?: string;
    operatorType?: 'healora_owned' | 'partner_clinic' | 'rented' | 'temporary_site'; timezone?: string;
  }): Promise<ApiHub> {
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
  async updateStatus(id: string, status: ApiHub['status'], reason: string): Promise<ApiHub> {
    return apiRequest<ApiHub>(`/hubs/${id}/status`, {
      method: 'POST',
      json: { status, reason },
    });
  },

  /**
   * Set hub manager
   */
  async setManager(id: string, userId: string | null): Promise<{ success: boolean }> {
    return apiRequest(`/hubs/${id}/manager`, {
      method: 'PUT',
      json: { userId },
    });
  },

  /**
   * Get hub operating hours
   */
  async getOperatingHours(id: string): Promise<{ items: OperatingHoursDay[] }> {
    return apiRequest(`/hubs/${id}/operating-hours`);
  },

  /**
   * Update hub operating hours
   */
  async setOperatingHours(id: string, hours: Array<{ dayOfWeek: number; opensAt: string; closesAt: string }>): Promise<{ items: OperatingHoursDay[] }> {
    return apiRequest(`/hubs/${id}/operating-hours`, {
      method: 'PUT',
      json: { hours },
    });
  },

  /**
   * Get catchment areas assigned to this hub
   */
  async getCatchments(id: string): Promise<{ items: Array<{ id: string; hubId: string; regionId: string; isPrimary: boolean; region?: { id: string; code: string; name: string; level: string } }> }> {
    return apiRequest(`/hubs/${id}/catchments`);
  },

  /**
   * Add a catchment area
   */
  async addCatchment(id: string, regionId: string, isPrimary = true): Promise<unknown> {
    return apiRequest(`/hubs/${id}/catchments`, {
      method: 'POST',
      json: { regionId, isPrimary },
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
  async getAvailabilityBlocks(id: string): Promise<{ items: Array<{ id: string; startsAt: string; endsAt: string | null; reason: string }> }> {
    return apiRequest(`/hubs/${id}/availability-blocks`);
  },

  /**
   * Declare availability block / closure
   */
  async createAvailabilityBlock(id: string, data: { blockType: 'closure' | 'pause' | 'capacity_block'; startsAt: string; endsAt?: string | null; remainingCapacityPct?: number; reason: string }): Promise<{ id: string }> {
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
  async getStaff(id: string): Promise<{ items: Array<{ assignmentId: string; role: string; scopeType: string; user: { id: string; name: string; nameBn?: string | null; phone?: string | null; status?: string } }> }> {
    return apiRequest(`/hubs/${id}/staff`);
  },
};

