/**
 * Healora Hub Authentication Service
 * Endpoints from hello.md:
 * - POST /auth/staff/login
 * - POST /auth/staff/mfa/verify
 * - POST /auth/staff/password
 * - POST /auth/staff/mfa/enroll
 * - POST /auth/staff/mfa/confirm
 * - POST /auth/staff/mfa/disable
 * - GET /me
 * - POST /auth/refresh
 * - POST /auth/logout
 * - GET /auth/sessions
 * - DELETE /auth/sessions/{id}
 * - GET /health
 */

import {
  apiRequest,
  setStoredTokens,
  clearStoredTokens,
  HEALTH_ENDPOINT,
  type AuthTokens,
} from './apiClient';

export interface StaffLoginResponse {
  mfaRequired?: boolean;
  challengeId?: string;
  expiresIn?: number;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  sessionId?: string;
  refreshExpiresAt?: string;
  passwordChangeRequired?: boolean;
  mfaEnrollmentRequired?: boolean;
}

export interface MeResponse {
  kind: 'staff' | 'patient';
  user: {
    id: string;
    email: string;
    name: string;
    nameBn?: string | null;
    preferredLanguage?: string;
    mfaEnabled?: boolean;
    status?: string;
  };
  assignments: Array<{
    id: string;
    role: string;
    scopeType: string;
    status?: 'active' | 'revoked' | 'expired';
    validFrom?: string;
    validTo?: string | null;
    regionId?: string | null;
    hubId?: string | null;
    sessionId?: string | null;
  }>;
  navigation?: string[];
  strongAuth?: boolean;
}

export interface HealthResponse {
  status: string;
  database: boolean;
  time: string;
}

export const authService = {
  /**
   * Health check on root /health
   */
  async checkHealth(): Promise<HealthResponse> {
    const res = await fetch(HEALTH_ENDPOINT, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Health check failed with ${res.status}`);
    return res.json();
  },

  /**
   * Initial staff sign-in with email and password
   */
  async login(email: string, password: string): Promise<StaffLoginResponse> {
    const res = await apiRequest<StaffLoginResponse>('/auth/staff/login', {
      method: 'POST',
      json: { email, password },
      skipAuth: true,
    });

    if (res.accessToken) {
      setStoredTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
    }

    return res;
  },

  /**
   * MFA verification step
   */
  async verifyMfa(challengeId: string, code: string): Promise<AuthTokens> {
    const res = await apiRequest<AuthTokens>('/auth/staff/mfa/verify', {
      method: 'POST',
      json: { challengeId, code },
      skipAuth: true,
    });

    if (res.accessToken) {
      setStoredTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      });
    }

    return res;
  },

  /**
   * Change own password (e.g. forced after temporary password)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ changed: boolean; note?: string }> {
    return apiRequest<{ changed: boolean; note?: string }>('/auth/staff/password', {
      method: 'POST',
      json: { currentPassword, newPassword },
    });
  },

  /**
   * Start MFA setup - returns secret and otpauthUri for QR code
   */
  async enrollMfa(): Promise<{ secret: string; otpauthUri: string }> {
    return apiRequest<{ secret: string; otpauthUri: string }>('/auth/staff/mfa/enroll', {
      method: 'POST',
    });
  },

  /**
   * Confirm MFA setup with code from authenticator app
   */
  async confirmMfa(code: string): Promise<{ confirmed: boolean }> {
    return apiRequest<{ confirmed: boolean }>('/auth/staff/mfa/confirm', {
      method: 'POST',
      json: { code },
    });
  },

  /**
   * Get current signed-in staff profile, role assignments, and allowed navigation
   */
  async getMe(): Promise<MeResponse> {
    return apiRequest<MeResponse>('/me');
  },

  /**
   * Logout current sign-in or everywhere
   */
  async logout(everywhere = false): Promise<void> {
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        json: { everywhere },
      });
    } catch {
      // Continue clearing tokens even if server call fails
    } finally {
      clearStoredTokens();
    }
  },

  /**
   * List active sessions
   */
  async getSessions(): Promise<Array<{ id: string; createdAt: string; current: boolean; userAgent?: string }>> {
    return apiRequest('/auth/sessions');
  },

  /**
   * Terminate a specific session
   */
  async revokeSession(id: string): Promise<void> {
    return apiRequest(`/auth/sessions/${id}`, { method: 'DELETE' });
  },
};

