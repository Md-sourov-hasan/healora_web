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
  phone: string;
  phoneVerified?: boolean;
  dateOfBirth?: string;
  age?: number;
  gender: 'male' | 'female' | 'other';
  bloodGroup?: string | null;
  addressLine?: string | null;
  preferredLanguage?: string;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  registeredHubId?: string | null;
  createdAt?: string;
}

export type PatientLookupCriteria =
  | { by: 'healora_code'; value: string }
  | { by: 'national_id'; value: string }
  | { by: 'phone'; value: string }
  | { by: 'appointment_code'; value: string };

export interface DuplicateCandidate {
  id: string;
  confidenceScore: number;
  reason: string;
  primaryPatient: ApiPatient;
  duplicatePatient: ApiPatient;
  detectedAt: string;
}

export const patientsService = {
  /**
   * Search for a patient by permitted identifier
   */
  async lookup(criteria: PatientLookupCriteria): Promise<{ patient: ApiPatient | null; found: boolean }> {
    return apiRequest<{ patient: ApiPatient | null; found: boolean }>('/patients/lookup', {
      method: 'POST',
      json: criteria,
    });
  },

  /**
   * Register a new patient
   */
  async register(data: {
    fullName: string;
    fullNameBn?: string;
    phone: string;
    gender: 'male' | 'female' | 'other';
    dateOfBirth?: string;
    age?: number;
    addressLine?: string;
    nationalId?: string;
    registeredHubId?: string;
  }): Promise<ApiPatient> {
    return apiRequest<ApiPatient>('/patients', {
      method: 'POST',
      json: data,
    });
  },

  /**
   * Get operational patient profile by ID
   */
  async getPatient(id: string): Promise<ApiPatient> {
    return apiRequest<ApiPatient>(`/patients/${id}`);
  },

  /**
   * Attach national ID / birth certificate identifier to patient
   */
  async addIdentifier(
    patientId: string,
    data: { identifierType: 'nid' | 'brn' | 'passport'; value: string }
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
    patientId: string
  ): Promise<Array<{ id: string; name: string; relationship: string; phone: string; verified: boolean }>> {
    return apiRequest(`/patients/${patientId}/representatives`);
  },

  /**
   * List potential duplicate patient profiles for deduplication
   */
  async getDuplicates(): Promise<DuplicateCandidate[]> {
    return apiRequest<DuplicateCandidate[]>('/patient-duplicates');
  },

  /**
   * Merge two confirmed duplicate patient records
   */
  async mergeDuplicates(
    primaryId: string,
    secondaryId: string,
    reason: string
  ): Promise<{ mergedPatientId: string }> {
    return apiRequest('/patient-duplicates/merge', {
      method: 'POST',
      json: { primaryId, secondaryId, reason },
    });
  },
};

