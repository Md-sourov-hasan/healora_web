import { apiRequest } from './apiClient';

export type StaffRoleCode =
  | 'platform_super_admin'
  | 'regional_ops_manager'
  | 'hub_manager'
  | 'reception_officer'
  | 'queue_coordinator'
  | 'equipment_officer'
  | 'operations_auditor'
  | 'clinical_ops_admin'
  | 'special_team_lead'
  | 'field_health_worker'
  | 'local_doctor'
  | 'registered_doctor';

export type ClinicalRoleCode =
  | 'special_team_lead'
  | 'field_health_worker'
  | 'local_doctor'
  | 'registered_doctor';

export type StationTypeCode =
  | 'registration'
  | 'vitals'
  | 'doctor_review'
  | 'counselling'
  | 'waiting'
  | 'other';

export type EquipmentCategoryCode =
  | 'bp_monitor'
  | 'glucometer'
  | 'weighing_scale'
  | 'stadiometer'
  | 'thermometer'
  | 'pulse_oximeter'
  | 'tablet'
  | 'printer'
  | 'other';

export type ConsentPurposeCode =
  | 'hub_service'
  | 'health_data_processing'
  | 'teleconsultation'
  | 'overseas_sharing'
  | 'caregiver_authority'
  | 'call_recording'
  | 'marketing';

export interface ApiServiceTypeRequirement {
  id: string;
  serviceTypeId: string;
  kind: 'staff_role' | 'station_type' | 'equipment_type';
  staffRole?: StaffRoleCode | null;
  stationType?: StationTypeCode | null;
  equipmentCategory?: EquipmentCategoryCode | null;
  minCount: number;
  mandatory: boolean;
}

export interface ApiServiceType {
  id: string;
  code: string;
  name: string;
  nameBn?: string | null;
  description?: string | null;
  protocolId?: string | null;
  defaultSlotMinutes?: number;
  requiresDoctorReview?: boolean;
  status: 'active' | 'inactive';
  requirements?: ApiServiceTypeRequirement[];
  protocol?: {
    id: string;
    code: string;
    version: number;
    name: string;
    status: 'draft' | 'approved' | 'retired';
  } | null;
}

export interface ApiObservationDefinition {
  id: string;
  code: string;
  externalSystem?: string | null;
  externalCode?: string | null;
  name: string;
  nameBn?: string | null;
  valueType: 'quantity' | 'coded' | 'text' | 'scale';
  canonicalUnit?: string | null;
  allowedUnits: string[];
  plausibleMin?: string | number | null;
  plausibleMax?: string | number | null;
  allowedContexts: string[];
  allowedMethods: string[];
  allowedSites: string[];
  isDerived: boolean;
  status: 'active' | 'inactive';
}

export interface ApiProtocolObservation {
  id: string;
  protocolId: string;
  observationCode: string;
  required: boolean;
  permittedRoles: ClinicalRoleCode[];
  repeatRule?: {
    count: number;
    intervalMinutes?: number;
    trigger: 'always' | 'on_alert';
  } | null;
  sortOrder: number;
}

export interface ApiAlertCondition {
  op: '>' | '>=' | '<' | '<=' | '==' | '!=';
  value: number;
  unit?: string;
  context?: string;
}

export interface ApiProtocolAlertRule {
  id: string;
  protocolId: string;
  code: string;
  observationCode: string;
  condition: ApiAlertCondition;
  action: 'repeat_measurement' | 'contact_doctor' | 'urgent_review' | 'referral';
  severity: 'low' | 'medium' | 'high' | 'critical';
  messageEn: string;
  messageBn?: string | null;
}

export interface ApiClinicalProtocol {
  id: string;
  code: string;
  version: number;
  name: string;
  description?: string | null;
  clinicalOwnerId: string;
  clinicalOwner?: { id: string; name: string } | null;
  approvedById?: string | null;
  approvedBy?: { id: string; name: string } | null;
  approvedAt?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  documentRef?: string | null;
  guidelineReference?: string | null;
  status: 'draft' | 'approved' | 'retired';
  observations?: ApiProtocolObservation[];
  alertRules?: ApiProtocolAlertRule[];
}

export interface ApiConsentTemplate {
  id: string;
  code: string;
  version: number;
  purpose: ConsentPurposeCode;
  language: 'bn' | 'en';
  title: string;
  body: string;
  verbalScript?: string | null;
  dataCategories: string[];
  recipients: string[];
  status: 'draft' | 'approved' | 'retired';
  approvedById?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}

export interface ApiQueuePriorityPolicy {
  id: string;
  code: string;
  version: number;
  description: string;
  priorityLevel: number;
  status: 'active' | 'inactive';
  approvedById?: string | null;
  approvedAt?: string | null;
}

export const catalogService = {
  // ---- SERVICE TYPES ----

  async getServiceTypes(includeInactive = false): Promise<{ items: ApiServiceType[] }> {
    return apiRequest('/catalog/service-types', { params: { includeInactive } });
  },

  async getServiceType(id: string): Promise<ApiServiceType> {
    return apiRequest(`/catalog/service-types/${id}`);
  },

  async createServiceType(data: {
    code: string;
    name: string;
    nameBn?: string;
    description?: string;
    protocolId?: string;
    defaultSlotMinutes?: number;
    requiresDoctorReview?: boolean;
    requirements?: Array<{
      kind: 'staff_role' | 'station_type' | 'equipment_type';
      staffRole?: StaffRoleCode;
      stationType?: StationTypeCode;
      equipmentCategory?: EquipmentCategoryCode;
      minCount?: number;
      mandatory?: boolean;
    }>;
  }): Promise<ApiServiceType> {
    return apiRequest('/catalog/service-types', {
      method: 'POST',
      json: data,
    });
  },

  async updateServiceType(
    id: string,
    data: Partial<{
      name: string;
      nameBn: string | null;
      description: string | null;
      protocolId: string | null;
      defaultSlotMinutes: number;
      requiresDoctorReview: boolean;
      status: 'active' | 'inactive';
    }>
  ): Promise<ApiServiceType> {
    return apiRequest(`/catalog/service-types/${id}`, {
      method: 'PATCH',
      json: data,
    });
  },

  async addServiceTypeRequirement(
    id: string,
    data: {
      kind: 'staff_role' | 'station_type' | 'equipment_type';
      staffRole?: StaffRoleCode;
      stationType?: StationTypeCode;
      equipmentCategory?: EquipmentCategoryCode;
      minCount?: number;
      mandatory?: boolean;
    }
  ): Promise<ApiServiceTypeRequirement> {
    return apiRequest(`/catalog/service-types/${id}/requirements`, {
      method: 'POST',
      json: data,
    });
  },

  async removeServiceTypeRequirement(id: string, reqId: string): Promise<{ removed: boolean }> {
    return apiRequest(`/catalog/service-types/${id}/requirements/${reqId}`, {
      method: 'DELETE',
    });
  },

  // ---- OBSERVATION DEFINITIONS ----

  async getObservationDefinitions(): Promise<{ items: ApiObservationDefinition[] }> {
    return apiRequest('/catalog/observation-definitions');
  },

  async createObservationDefinition(data: {
    code: string;
    externalSystem?: string | null;
    externalCode?: string | null;
    name: string;
    nameBn?: string | null;
    valueType: 'quantity' | 'coded' | 'text' | 'scale';
    canonicalUnit?: string | null;
    allowedUnits?: string[];
    plausibleMin?: string | number | null;
    plausibleMax?: string | number | null;
    allowedContexts?: string[];
    allowedMethods?: string[];
    allowedSites?: string[];
    isDerived?: boolean;
  }): Promise<ApiObservationDefinition> {
    return apiRequest('/catalog/observation-definitions', {
      method: 'POST',
      json: data,
    });
  },

  async updateObservationDefinition(
    code: string,
    data: Partial<{
      externalSystem: string | null;
      externalCode: string | null;
      name: string;
      nameBn: string | null;
      valueType: 'quantity' | 'coded' | 'text' | 'scale';
      canonicalUnit: string | null;
      allowedUnits: string[];
      plausibleMin: string | number | null;
      plausibleMax: string | number | null;
      allowedContexts: string[];
      allowedMethods: string[];
      allowedSites: string[];
      isDerived: boolean;
      status: 'active' | 'inactive';
    }>
  ): Promise<ApiObservationDefinition> {
    return apiRequest(`/catalog/observation-definitions/${encodeURIComponent(code)}`, {
      method: 'PATCH',
      json: data,
    });
  },

  // ---- CLINICAL PROTOCOLS ----

  async getProtocols(params?: {
    code?: string;
    status?: 'draft' | 'approved' | 'retired';
  }): Promise<{ items: ApiClinicalProtocol[] }> {
    return apiRequest('/catalog/protocols', {
      params: params as Record<string, string>,
    });
  },

  async getProtocol(id: string): Promise<ApiClinicalProtocol> {
    return apiRequest(`/catalog/protocols/${id}`);
  },

  async createProtocol(data: {
    code: string;
    name: string;
    description?: string;
    clinicalOwnerId: string;
    documentRef?: string;
    guidelineReference?: string;
    copyFromId?: string;
  }): Promise<ApiClinicalProtocol> {
    return apiRequest('/catalog/protocols', {
      method: 'POST',
      json: data,
    });
  },

  async updateProtocol(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      clinicalOwnerId: string;
      documentRef: string | null;
      guidelineReference: string | null;
    }>
  ): Promise<ApiClinicalProtocol> {
    return apiRequest(`/catalog/protocols/${id}`, {
      method: 'PATCH',
      json: data,
    });
  },

  async upsertProtocolObservation(
    protocolId: string,
    observationCode: string,
    data: {
      required?: boolean;
      permittedRoles: ClinicalRoleCode[];
      repeatRule?: {
        count: number;
        intervalMinutes?: number;
        trigger?: 'always' | 'on_alert';
      } | null;
      sortOrder?: number;
    }
  ): Promise<ApiProtocolObservation> {
    return apiRequest(`/catalog/protocols/${protocolId}/observations/${encodeURIComponent(observationCode)}`, {
      method: 'PUT',
      json: data,
    });
  },

  async removeProtocolObservation(protocolId: string, observationCode: string): Promise<{ removed: boolean }> {
    return apiRequest(`/catalog/protocols/${protocolId}/observations/${encodeURIComponent(observationCode)}`, {
      method: 'DELETE',
    });
  },

  async addProtocolAlertRule(
    protocolId: string,
    data: {
      code: string;
      observationCode: string;
      condition: ApiAlertCondition;
      action: ApiProtocolAlertRule['action'];
      severity: ApiProtocolAlertRule['severity'];
      messageEn: string;
      messageBn?: string;
    }
  ): Promise<ApiProtocolAlertRule> {
    return apiRequest(`/catalog/protocols/${protocolId}/alert-rules`, {
      method: 'POST',
      json: data,
    });
  },

  async updateProtocolAlertRule(
    protocolId: string,
    ruleId: string,
    data: Partial<{
      code: string;
      observationCode: string;
      condition: ApiAlertCondition;
      action: ApiProtocolAlertRule['action'];
      severity: ApiProtocolAlertRule['severity'];
      messageEn: string;
      messageBn: string;
    }>
  ): Promise<ApiProtocolAlertRule> {
    return apiRequest(`/catalog/protocols/${protocolId}/alert-rules/${ruleId}`, {
      method: 'PATCH',
      json: data,
    });
  },

  async removeProtocolAlertRule(protocolId: string, ruleId: string): Promise<{ removed: boolean }> {
    return apiRequest(`/catalog/protocols/${protocolId}/alert-rules/${ruleId}`, {
      method: 'DELETE',
    });
  },

  async approveProtocol(id: string, effectiveFrom?: string): Promise<ApiClinicalProtocol> {
    return apiRequest(`/catalog/protocols/${id}/approve`, {
      method: 'POST',
      json: effectiveFrom ? { effectiveFrom } : {},
    });
  },

  async retireProtocol(id: string, reason: string): Promise<ApiClinicalProtocol> {
    return apiRequest(`/catalog/protocols/${id}/retire`, {
      method: 'POST',
      json: { reason },
    });
  },

  // ---- CONSENT TEMPLATES ----

  async getConsentTemplates(params?: {
    purpose?: ConsentPurposeCode;
    language?: string;
    status?: 'draft' | 'approved' | 'retired';
    code?: string;
  }): Promise<{ items: ApiConsentTemplate[] }> {
    return apiRequest('/catalog/consent-templates', {
      params: params as Record<string, string>,
    });
  },

  async getConsentTemplate(id: string): Promise<ApiConsentTemplate> {
    return apiRequest(`/catalog/consent-templates/${id}`);
  },

  async createConsentTemplate(data: {
    code: string;
    purpose: ConsentPurposeCode;
    language: 'bn' | 'en';
    title: string;
    body: string;
    verbalScript?: string;
    dataCategories: string[];
    recipients: string[];
  }): Promise<ApiConsentTemplate> {
    return apiRequest('/catalog/consent-templates', {
      method: 'POST',
      json: data,
    });
  },

  async updateConsentTemplate(
    id: string,
    data: Partial<{
      title: string;
      body: string;
      verbalScript: string | null;
      dataCategories: string[];
      recipients: string[];
    }>
  ): Promise<ApiConsentTemplate> {
    return apiRequest(`/catalog/consent-templates/${id}`, {
      method: 'PATCH',
      json: data,
    });
  },

  async approveConsentTemplate(id: string, effectiveFrom?: string): Promise<ApiConsentTemplate> {
    return apiRequest(`/catalog/consent-templates/${id}/approve`, {
      method: 'POST',
      json: effectiveFrom ? { effectiveFrom } : {},
    });
  },

  async retireConsentTemplate(id: string, reason: string): Promise<ApiConsentTemplate> {
    return apiRequest(`/catalog/consent-templates/${id}/retire`, {
      method: 'POST',
      json: { reason },
    });
  },

  // ---- QUEUE PRIORITY POLICIES ----

  async getQueuePriorityPolicies(includeInactive = false): Promise<{ items: ApiQueuePriorityPolicy[] }> {
    return apiRequest('/catalog/queue-priority-policies', {
      params: { includeInactive },
    });
  },

  async createQueuePriorityPolicy(data: {
    code: string;
    description: string;
    priorityLevel: number;
  }): Promise<ApiQueuePriorityPolicy> {
    return apiRequest('/catalog/queue-priority-policies', {
      method: 'POST',
      json: data,
    });
  },

  async retireQueuePriorityPolicy(id: string, reason: string): Promise<ApiQueuePriorityPolicy> {
    return apiRequest(`/catalog/queue-priority-policies/${id}/retire`, {
      method: 'POST',
      json: { reason },
    });
  },
};
