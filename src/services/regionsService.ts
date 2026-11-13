/**
 * Healora Regions & Catchment Service
 * Endpoints from hello.md:
 * - GET /regions
 * - GET /regions/tree
 * - GET /regions/{id}
 * - POST /regions
 * - PATCH /regions/{id}
 * - POST /regions/{id}/deactivate
 */

import { apiRequest } from './apiClient';

export interface ApiRegion {
  id: string;
  code: string;
  name: string;
  nameBn?: string | null;
  level: 'operational_region' | 'division' | 'district' | 'upazila' | 'union' | 'ward' | 'village';
  parentId?: string | null;
  active: boolean;
  riskTier?: 'low' | 'moderate' | 'high' | 'critical';
  catchmentPopulation?: number;
  assignedHubCount?: number;
  activeHubCount?: number;
  children?: ApiRegion[];
}

export interface RegionListResponse {
  items: ApiRegion[];
  total?: number;
  limit: number;
  offset: number;
}

export const regionsService = {
  /**
   * List regions with optional filters
   */
  async getRegions(params?: {
    parentId?: string;
    level?: string;
    q?: string;
    includeInactive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<RegionListResponse> {
    return apiRequest<RegionListResponse>('/regions', {
      params: params as Record<string, string | number | boolean>,
    });
  },

  /**
   * Get hierarchical region tree
   */
  async getRegionTree(): Promise<ApiRegion[]> {
    const res = await apiRequest<{ items: ApiRegion[] } | ApiRegion[]>('/regions/tree');
    return Array.isArray(res) ? res : res.items || [];
  },

  /**
   * Get single region by id
   */
  async getRegion(id: string): Promise<ApiRegion> {
    return apiRequest<ApiRegion>(`/regions/${id}`);
  },

  /**
   * Create new administrative/operational region
   */
  async createRegion(data: { code: string; name: string; nameBn?: string; level: ApiRegion['level']; parentId?: string }): Promise<ApiRegion> {
    return apiRequest<ApiRegion>('/regions', {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Update region details
   */
  async updateRegion(id: string, data: Partial<Pick<ApiRegion, 'name' | 'nameBn' | 'level' | 'parentId'>>): Promise<ApiRegion> {
    return apiRequest<ApiRegion>(`/regions/${id}`, {
      method: 'PATCH',
      json: data,
    });
  },

  /**
   * Deactivate region
   */
  async deactivateRegion(id: string, reason?: string): Promise<{ success: boolean }> {
    return apiRequest(`/regions/${id}/deactivate`, {
      method: 'POST',
      json: { reason },
    });
  },
};

