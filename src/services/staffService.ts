/**
 * Healora Staff Administration & Rostering Service
 * Endpoints from hello.md:
 * - GET /admin/users
 * - GET /admin/users/{id}
 * - POST /admin/users
 * - PATCH /admin/users/{id}
 * - POST /admin/users/{id}/status
 * - GET /admin/role-assignments
 * - POST /admin/users/{id}/role-assignments
 * - POST /admin/role-assignments/{id}/revoke
 * - POST /auth/admin/users/{userId}/temporary-password
 * - POST /auth/admin/users/{userId}/unlock
 * - POST /auth/admin/users/{userId}/mfa/reset
 * - GET /shifts
 * - POST /shifts
 * - POST /shifts/{id}/approve
 * - POST /shifts/{id}/cancel
 * - POST /shifts/{id}/check-in
 * - POST /shifts/{id}/check-out
 */

import { apiRequest } from './apiClient';

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  nameBn?: string | null;
  phone?: string | null;
  status: 'invited' | 'active' | 'suspended' | 'disabled' | 'locked' | 'inactive';
  mfaEnabled: boolean;
  preferredLanguage?: string;
  createdAt?: string;
  roleAssignments?: ApiRoleAssignment[];
}

export interface ApiRoleAssignment {
  id: string;
  userId: string;
  role: string;
  scopeType: 'platform' | 'region' | 'hub' | 'session';
  regionId?: string | null;
  hubId?: string | null;
  sessionId?: string | null;
  status: 'active' | 'revoked' | 'expired';
  validFrom: string;
  validTo?: string | null;
}

export interface ApiShift {
  id: string;
  userId: string;
  hubId: string;
  sessionId?: string | null;
  stationId?: string | null;
  role: string;
  startTime: string; // ISO
  endTime: string; // ISO
  status: 'scheduled' | 'approved' | 'checked_in' | 'completed' | 'cancelled' | 'absent';
  staffName?: string;
  hubName?: string;
}

export const staffService = {
  // ---- USERS & ROLES ----

  async getUsers(params?: {
    limit?: number;
    offset?: number;
    status?: string;
    q?: string;
  }): Promise<{ items: ApiUser[]; total?: number; limit: number; offset: number }> {
    return apiRequest('/admin/users', { params: params as Record<string, string | number> });
  },

  async getUser(id: string): Promise<ApiUser> {
    return apiRequest<ApiUser>(`/admin/users/${id}`);
  },

  async createUser(data: {
    email: string;
    name: string;
    nameBn?: string;
    phone?: string;
    initialRole?: string;
    hubId?: string;
    regionId?: string;
  }): Promise<ApiUser> {
    return apiRequest<ApiUser>('/admin/users', {
      method: 'POST',
      json: data,
    });
  },

  async updateUser(id: string, data: Partial<ApiUser>): Promise<ApiUser> {
    return apiRequest<ApiUser>(`/admin/users/${id}`, {
      method: 'PATCH',
      json: data,
    });
  },

  async setUserStatus(id: string, status: ApiUser['status'], reason?: string): Promise<ApiUser> {
    return apiRequest<ApiUser>(`/admin/users/${id}/status`, {
      method: 'POST',
      json: { status, reason },
    });
  },

  async getRoleAssignments(params?: {
    userId?: string;
    hubId?: string;
    role?: string;
  }): Promise<ApiRoleAssignment[]> {
    return apiRequest<ApiRoleAssignment[]>('/admin/role-assignments', {
      params: params as Record<string, string>,
    });
  },

  async assignRole(
    userId: string,
    data: { role: string; scopeType: string; hubId?: string; regionId?: string }
  ): Promise<ApiRoleAssignment> {
    return apiRequest<ApiRoleAssignment>(`/admin/users/${userId}/role-assignments`, {
      method: 'POST',
      json: data,
    });
  },

  async revokeRole(roleAssignmentId: string, reason?: string): Promise<{ success: boolean }> {
    return apiRequest(`/admin/role-assignments/${roleAssignmentId}/revoke`, {
      method: 'POST',
      json: { reason },
    });
  },

  async issueTemporaryPassword(userId: string): Promise<{ temporaryPassword: string }> {
    return apiRequest(`/auth/admin/users/${userId}/temporary-password`, {
      method: 'POST',
      json: {},
    });
  },

  async unlockUser(userId: string): Promise<{ unlocked: boolean }> {
    return apiRequest(`/auth/admin/users/${userId}/unlock`, {
      method: 'POST',
      json: {},
    });
  },

  async resetMfa(userId: string, reason: string): Promise<{ mfaReset: boolean }> {
    return apiRequest(`/auth/admin/users/${userId}/mfa/reset`, {
      method: 'POST',
      json: { reason },
    });
  },

  // ---- SHIFTS & ROSTERING ----

  async getShifts(params?: {
    hubId?: string;
    sessionId?: string;
    userId?: string;
    from?: string;
    to?: string;
    status?: string;
  }): Promise<ApiShift[]> {
    return apiRequest<ApiShift[]>('/shifts', { params: params as Record<string, string> });
  },

  async createShift(data: {
    userId: string;
    hubId: string;
    role: string;
    startTime: string;
    endTime: string;
    stationId?: string;
  }): Promise<ApiShift> {
    return apiRequest<ApiShift>('/shifts', {
      method: 'POST',
      json: data,
    });
  },

  async approveShift(id: string): Promise<ApiShift> {
    return apiRequest<ApiShift>(`/shifts/${id}/approve`, { method: 'POST', json: {} });
  },

  async cancelShift(id: string, reason: string): Promise<ApiShift> {
    return apiRequest<ApiShift>(`/shifts/${id}/cancel`, { method: 'POST', json: { reason } });
  },

  async checkInShift(id: string): Promise<ApiShift> {
    return apiRequest<ApiShift>(`/shifts/${id}/check-in`, { method: 'POST', json: {} });
  },

  async checkOutShift(id: string): Promise<ApiShift> {
    return apiRequest<ApiShift>(`/shifts/${id}/check-out`, { method: 'POST', json: {} });
  },
};

