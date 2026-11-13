import { apiRequest } from './apiClient';

export interface ApiServiceType {
  id: string;
  code: string;
  name: string;
  nameBn?: string | null;
  status: string;
}

export const catalogService = {
  async getServiceTypes(includeInactive = false): Promise<{ items: ApiServiceType[] }> {
    return apiRequest('/catalog/service-types', { params: { includeInactive } });
  },
};
