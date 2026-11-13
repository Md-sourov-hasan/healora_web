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
  status: 'invited' | 'active' | 'suspended' | 'disabled';
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
  user?: { id: string; name: string; nameBn?: string | null; status?: ApiUser['status'] };
}

export interface ApiStaffCredential {
  id: string;
  userId: string;
  professionalDesignation: string;
  qualification: string;
  registrationBody?: string | null;
  registrationNumber?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  permittedObservationCodes?: string[];
  qualifiesForRoles: string[];
  trainingCompletedAt?: string | null;
  evidenceRef?: string | null;
  displayOnPatientRecord?: boolean;
  status: 'pending' | 'verified' | 'rejected' | 'expired' | 'suspended';
  verifiedAt?: string | null;
  user?: { id: string; name: string; status?: string } | null;
}

export interface ApiShift {
  id: string;
  userId: string;
  hubId: string;
  sessionId?: string | null;
  stationId?: string | null;
  role: string;
  startsAt: string;
  endsAt: string;
  status: 'proposed' | 'approved' | 'checked_in' | 'checked_out' | 'cancelled' | 'absent';
  staffName?: string;
  hubName?: string;
  user?: { id: string; name: string; nameBn?: string | null };
  station?: { id: string; code: string; name: string } | null;
  hub?: { id: string; code: string; name: string; addressLine?: string | null; contactPhone?: string | null } | null;
  session?: { id: string; title?: string | null; status: string; startsAt: string; endsAt: string } | null;
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

  async createUser(data: { email: string; name: string; nameBn?: string | null; phone?: string | null; preferredLanguage?: 'bn' | 'en' }): Promise<ApiUser> {
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

  async setUserStatus(id: string, status: Exclude<ApiUser['status'], 'invited'>, reason: string): Promise<{ user: ApiUser; revokedAssignments: number }> {
    return apiRequest<{ user: ApiUser; revokedAssignments: number }>(`/admin/users/${id}/status`, {
      method: 'POST',
      json: { status, reason },
    });
  },

  async getRoleAssignments(params?: {
    userId?: string;
    hubId?: string;
    role?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: ApiRoleAssignment[]; limit: number; offset: number }> {
    return apiRequest<{ items: ApiRoleAssignment[]; limit: number; offset: number }>('/admin/role-assignments', {
      params: params as Record<string, string | number>,
    });
  },

  async assignRole(
    userId: string,
    data: { role: string; scopeType: 'platform' | 'region' | 'hub' | 'session'; hubId?: string; regionId?: string; sessionId?: string }
  ): Promise<ApiRoleAssignment> {
    return apiRequest<ApiRoleAssignment>(`/admin/users/${userId}/role-assignments`, {
      method: 'POST',
      json: data,
    });
  },

  async revokeRole(roleAssignmentId: string, reason: string): Promise<ApiRoleAssignment> {
    return apiRequest(`/admin/role-assignments/${roleAssignmentId}/revoke`, {
      method: 'POST',
      json: { reason },
    });
  },

  async issueTemporaryPassword(userId: string, reason: string): Promise<{ temporaryPassword: string }> {
    return apiRequest(`/auth/admin/users/${userId}/temporary-password`, {
      method: 'POST',
      json: { reason },
    });
  },

  async unlockUser(userId: string, reason: string): Promise<{ unlocked: boolean }> {
    return apiRequest(`/auth/admin/users/${userId}/unlock`, {
      method: 'POST',
      json: { reason },
    });
  },

  async resetMfa(userId: string, reason: string): Promise<{ mfaReset: boolean }> {
    return apiRequest(`/auth/admin/users/${userId}/mfa/reset`, {
      method: 'POST',
      json: { reason },
    });
  },

  async revokeUserSessions(userId: string, reason: string): Promise<{ revoked: boolean }> {
    return apiRequest(`/auth/admin/users/${userId}/revoke-sessions`, {
      method: 'POST',
      json: { reason },
    });
  },

  async getUserRoleAssignments(userId: string, includeRevoked = false): Promise<{ items: ApiRoleAssignment[] }> {
    return apiRequest(`/admin/users/${userId}/role-assignments`, {
      params: { includeRevoked },
    });
  },

  // ---- CREDENTIALS ----

  async getUserCredentials(userId: string): Promise<{ items: ApiStaffCredential[] }> {
    return apiRequest(`/admin/users/${userId}/credentials`);
  },

  async addUserCredential(
    userId: string,
    data: {
      professionalDesignation: string;
      qualification: string;
      registrationBody?: string | null;
      registrationNumber?: string | null;
      issuedAt?: string | null;
      expiresAt?: string | null;
      permittedObservationCodes?: string[];
      qualifiesForRoles: string[];
      trainingCompletedAt?: string | null;
      evidenceRef?: string | null;
      displayOnPatientRecord?: boolean;
    }
  ): Promise<ApiStaffCredential> {
    return apiRequest(`/admin/users/${userId}/credentials`, {
      method: 'POST',
      json: data,
    });
  },

  async getCredentials(params?: {
    status?: 'pending' | 'verified' | 'rejected' | 'expired' | 'suspended';
    expiringBefore?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: ApiStaffCredential[]; limit: number; offset: number }> {
    return apiRequest('/admin/credentials', {
      params: params as Record<string, string | number>,
    });
  },

  async decideCredential(
    id: string,
    action: 'verify' | 'reject' | 'suspend' | 'expire',
    reason?: string
  ): Promise<{ credential: ApiStaffCredential; revokedAssignments: unknown[] }> {
    return apiRequest(`/admin/credentials/${id}/${action}`, {
      method: 'POST',
      json: reason ? { reason } : {},
    });
  },

  // ---- SHIFTS & ROSTERING ----

  async getShifts(params?: {
    hubId?: string;
    sessionId?: string;
    userId?: string;
    date?: string;
    status?: string;
  }): Promise<{ items: ApiShift[]; limit: number; offset: number }> {
    return apiRequest<{ items: ApiShift[]; limit: number; offset: number }>('/shifts', { params: params as Record<string, string> });
  },

  async getMyShifts(params?: { from?: string; to?: string }): Promise<ApiShift[]> {
    return apiRequest<ApiShift[]>('/shifts/mine', { params: params as Record<string, string> });
  },

  async getShift(id: string): Promise<ApiShift> {
    return apiRequest<ApiShift>(`/shifts/${id}`);
  },

  async createShift(data: {
    userId: string;
    hubId: string;
    role: string;
    startsAt: string;
    endsAt: string;
    sessionId?: string;
    stationId?: string;
    overlapOverrideReason?: string;
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

  async markShiftAbsent(id: string, reason: string): Promise<ApiShift> {
    return apiRequest<ApiShift>(`/shifts/${id}/absent`, { method: 'POST', json: { reason } });
  },

  async checkInShift(id: string): Promise<ApiShift> {
    return apiRequest<ApiShift>(`/shifts/${id}/check-in`, { method: 'POST', json: {} });
  },

  async checkOutShift(id: string): Promise<ApiShift> {
    return apiRequest<ApiShift>(`/shifts/${id}/check-out`, { method: 'POST', json: {} });
  },
};

