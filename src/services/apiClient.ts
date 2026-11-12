/**
 * Healora Hub Management Platform - API Client
 * Built strictly according to the Healora Hub API specifications (PRD & hello.md).
 * Base URL: https://healora-hub-backend-fqvj.onrender.com/api/v1
 */

export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://healora-hub-backend-fqvj.onrender.com/api/v1';

// The health check endpoint has no /api/v1 prefix per PRD / hello.md specification
export const HEALTH_ENDPOINT = API_BASE.replace(/\/api\/v\d+$/, '') + '/health';

export interface ApiErrorDetail {
  path?: string;
  message?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  sessionId?: string;
  refreshExpiresAt?: string;
  passwordChangeRequired?: boolean;
  mfaEnrollmentRequired?: boolean;
}

const ACCESS_TOKEN_KEY = 'healora_access_token';
const REFRESH_TOKEN_KEY = 'healora_refresh_token';
const USER_KEY = 'healora_user';
let accessTokenInMemory: string | null = null;

export function getStoredAccessToken(): string | null {
  return accessTokenInMemory;
}

export function getStoredRefreshToken(): string | null {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredTokens(tokens: { accessToken: string; refreshToken?: string }): void {
  accessTokenInMemory = tokens.accessToken;
  try {
    // Access tokens stay in memory; only the rotating refresh token survives
    // navigation within this tab, as specified by the backend integration guide.
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    if (tokens.refreshToken) {
      sessionStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    }
  } catch {
    // Ignore storage quota errors
  }
}

export function clearStoredTokens(): void {
  accessTokenInMemory = null;
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {
    // Ignore
  }
}

// Global refresh promise to prevent concurrent refreshes (thundering herd)
let refreshPromise: Promise<boolean> | null = null;

export async function refreshAuthToken(): Promise<boolean> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return false;

  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        clearStoredTokens();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('healora:logged-out'));
        }
        return false;
      }

      const data = await res.json();
      if (data.accessToken) {
        setStoredTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken || refreshToken,
        });
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  json?: unknown;
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
}

/**
 * Universal resilient fetcher adhering to Healora PRD / hello.md guidelines.
 * Automatically injects Bearer token, JSON headers, handles 401 token refresh & errors.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
  retryOn401 = true
): Promise<T> {
  const { json, params, skipAuth = false, headers: customHeaders, ...init } = options;

  // Build query string if params are provided
  let url = path.startsWith('http') ? path : `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.set(key, String(val));
      }
    }
    const qs = searchParams.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const headers = new Headers(customHeaders);
  if (json !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!skipAuth) {
    const token = getStoredAccessToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const fetchOptions: RequestInit = {
    ...init,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined,
  };

  const response = await fetch(url, fetchOptions);

  // Auto-refresh token on 401 if not already an auth path
  if (
    response.status === 401 &&
    retryOn401 &&
    !path.includes('/auth/')
  ) {
    const refreshed = await refreshAuthToken();
    if (refreshed) {
      return apiRequest<T>(path, options, false);
    }
  }

  if (response.status === 204) {
    return undefined as unknown as T;
  }

  // Handle blob responses (e.g. CSV exports)
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/csv') || contentType.includes('application/octet-stream')) {
    return (await response.blob()) as unknown as T;
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body.code || `HTTP_${response.status}`,
      body.message || response.statusText || 'An unexpected API error occurred',
      body.details
    );
  }

  return body as T;
}

/**
 * Parses Healora backend timestamp string to Date
 * (hello.md: "2026-11-10 03:00:00+00" -> ISO valid date)
 */
export function parseApiDate(str?: string | null): Date | null {
  if (!str) return null;
  try {
    const iso = str.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}
