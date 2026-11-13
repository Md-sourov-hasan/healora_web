/**
 * Healora Operational Patient Lookup & Registration Service
 * Endpoints from hello.md:
 * - POST /patients/lookup
 * - POST /patients
 * - GET /patients/{id}
 * - POST /patients/{id}/identifiers
 * - GET /patients/{id}/representatives
 * - POST /patients/{id}/representatives
 * - GET /patient-duplicates
 * - POST /patient-duplicates/{id}/resolve
 * - POST /patient-duplicates/merge
 */

import { apiRequest } from './apiClient';

export interface ApiPatient {
  id: string;
  healoraCode: string;
  fullName: string;
  fullNameBn?: string | null;
  maskedPhone?: string | null;
  phone?: string | null;
  dateOfBirth?: string | null;
  birthYear?: number | null;
  age?: number;
  sex: 'male' | 'female' | 'other' | 'unknown';
  status?: string;
  registeredHubId?: string | null;
  addressLine?: string | null;
  createdAt?: string;
}

export type PatientLookupCriteria =
  | { by: 'healora_code'; value: string; hubId: string }
  | { by: 'identifier'; identifierType: 'national_id' | 'birth_registration' | 'passport' | 'healora_card' | 'other'; value: string; hubId: string }
  | { by: 'phone'; value: string; hubId: string }
  | { by: 'appointment_code'; value: string; hubId: string };

export interface DuplicateCandidate {
  id: string;
  status?: 'open' | 'confirmed_duplicate' | 'not_duplicate';
  confidenceScore?: number;
  reason?: string;
  matchReason?: string;
  primaryPatient?: ApiPatient | null;
  duplicatePatient?: ApiPatient | null;
  patientA?: ApiPatient | null;
  patientB?: ApiPatient | null;
  detectedAt?: string;
  createdAt?: string;
}

export interface ApiPatientRepresentative {
  id: string;
  fullName: string;
  maskedPhone?: string | null;
  relationship: 'parent' | 'legal_guardian' | 'spouse' | 'child' | 'sibling' | 'other_relative' | 'authorised_carer';
  legalBasis: string;
  validFrom?: string;
  validTo?: string | null;
  verified: boolean;
  revoked: boolean;
}

export const patientsService = {
  /**
   * Search for a patient by permitted identifier
   */
  async lookup(criteria: PatientLookupCriteria): Promise<{ matches: ApiPatient[]; appointment: { id: string; code: string; status: string; sessionId: string; hubId: string } | null }> {
    return apiRequest<{ matches: ApiPatient[]; appointment: { id: string; code: string; status: string; sessionId: string; hubId: string } | null }>('/patients/lookup', {
      method: 'POST',
      json: criteria,
    });
  },

  /**
   * Register a new patient
   */
  async register(data: {
    hubId: string;
    fullName: string;
    fullNameBn?: string;
    phone: string;
    sex: 'male' | 'female' | 'other' | 'unknown';
    dateOfBirth?: string;
    age?: number;
    addressLine?: string;
    nationalId?: string;
    regionId?: string;
  }): Promise<ApiPatient> {
    const { age, nationalId, ...fields } = data;
    const year = Number(new Intl.DateTimeFormat('en', { timeZone: 'Asia/Dhaka', year: 'numeric' }).format(new Date()));
    if (age !== undefined && (!Number.isInteger(age) || age < 0 || year - age < 1900)) {
      throw new Error('Enter a valid whole-number age, or leave age blank.');
    }
    const response = await apiRequest<{ patient: ApiPatient }>('/patients', {
      method: 'POST',
      json: {
        ...fields,
        birthYearEstimated: !data.dateOfBirth && age !== undefined ? year - age : undefined,
        identifiers: nationalId ? [{ type: 'national_id', value: nationalId }] : undefined,
      },
    });
    if (!response.patient?.id) throw new Error('Patient registration did not return a patient identifier.');
    return response.patient;
  },

  /**
   * Get operational patient profile by ID
   */
  async getPatient(id: string, hubId: string): Promise<ApiPatient> {
    return apiRequest<ApiPatient>(`/patients/${id}`, { params: { hubId } });
  },

  /**
   * Attach national ID / birth certificate identifier to patient
   */
  async addIdentifier(
    patientId: string,
    data: { hubId: string; type: 'national_id' | 'birth_registration' | 'passport' | 'healora_card' | 'other'; value: string }
  ): Promise<{ success: boolean }> {
    return apiRequest(`/patients/${patientId}/identifiers`, {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Get family caregivers / legal representatives
   */
  async getRepresentatives(
    patientId: string,
    hubId: string
  ): Promise<{ items: ApiPatientRepresentative[] }> {
    return apiRequest(`/patients/${patientId}/representatives`, {
      params: { hubId },
    });
  },

  /**
   * Add a family caregiver / legal representative
   */
  async addRepresentative(
    patientId: string,
    data: {
      hubId: string;
      fullName: string;
      phone?: string;
      relationship: ApiPatientRepresentative['relationship'];
      legalBasis: string;
      identityEvidence?: string;
      validTo?: string;
    }
  ): Promise<unknown> {
    return apiRequest(`/patients/${patientId}/representatives`, {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Verify a representative's identity/authority
   */
  async verifyRepresentative(patientId: string, repId: string, hubId: string): Promise<unknown> {
    return apiRequest(`/patients/${patientId}/representatives/${repId}/verify`, {
      method: 'POST',
      json: { hubId },
    });
  },

  /**
   * Revoke a representative's authority
   */
  async revokeRepresentative(patientId: string, repId: string, hubId: string, reason: string): Promise<unknown> {
    return apiRequest(`/patients/${patientId}/representatives/${repId}/revoke`, {
      method: 'POST',
      json: { hubId, reason },
    });
  },

  /**
   * List potential duplicate patient profiles for deduplication
   */
  async getDuplicates(status: 'open' | 'confirmed_duplicate' | 'not_duplicate' = 'open'): Promise<{ items: DuplicateCandidate[] }> {
    return apiRequest<{ items: DuplicateCandidate[] }>('/patient-duplicates', {
      params: { status },
    });
  },

  /**
   * Resolve a duplicate candidate as confirmed_duplicate or not_duplicate
   */
  async resolveDuplicate(
    id: string,
    resolution: 'not_duplicate' | 'confirmed_duplicate',
    note: string
  ): Promise<unknown> {
    return apiRequest(`/patient-duplicates/${id}/resolve`, {
      method: 'POST',
      json: { resolution, note },
    });
  },

  /**
   * Merge two confirmed duplicate patient records
   */
  async mergeDuplicates(
    survivorPatientId: string,
    mergedPatientId: string,
    reason: string,
    duplicateCandidateId?: string
  ): Promise<{ mergedPatientId?: string }> {
    return apiRequest('/patient-duplicates/merge', {
      method: 'POST',
      json: { survivorPatientId, mergedPatientId, reason, duplicateCandidateId },
    });
  },
};

