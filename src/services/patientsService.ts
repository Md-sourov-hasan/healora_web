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
    patientId: string
  ): Promise<{ items: Array<{ id: string; fullName: string; maskedPhone?: string | null; relationship: string; legalBasis: string; verified: boolean; revoked: boolean }> }> {
    return apiRequest(`/patients/${patientId}/representatives`);
  },

  /**
   * List potential duplicate patient profiles for deduplication
   */
  async getDuplicates(): Promise<{ items: DuplicateCandidate[] }> {
    return apiRequest<{ items: DuplicateCandidate[] }>('/patient-duplicates');
  },

  /**
   * Merge two confirmed duplicate patient records
   */
  async mergeDuplicates(
    survivorPatientId: string,
    mergedPatientId: string,
    reason: string
  ): Promise<{ mergedPatientId: string }> {
    return apiRequest('/patient-duplicates/merge', {
      method: 'POST',
      json: { survivorPatientId, mergedPatientId, reason },
    });
  },
};

