import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { SegmentedTabs } from '../common/Tabs';
import {
  PhPlus,
  PhArrowsClockwise,
  PhShieldCheck,
} from '../icons/PhosphorIcons';
import { useApp } from '../../context/useApp';
import {
  catalogService,
  type ApiServiceType,
  type ApiObservationDefinition,
  type ApiClinicalProtocol,
  type ApiConsentTemplate,
  type ApiQueuePriorityPolicy,
  type StaffRoleCode,
  type StationTypeCode,
  type EquipmentCategoryCode,
  type ClinicalRoleCode,
  type ConsentPurposeCode,
  type ApiAlertCondition,
} from '../../services/catalogService';
import { staffService, type ApiUser } from '../../services/staffService';

const STAFF_ROLES: StaffRoleCode[] = [
  'platform_super_admin',
  'regional_ops_manager',
  'hub_manager',
  'reception_officer',
  'queue_coordinator',
  'equipment_officer',
  'operations_auditor',
  'clinical_ops_admin',
  'special_team_lead',
  'field_health_worker',
  'local_doctor',
  'registered_doctor',
];

const CLINICAL_ROLES: ClinicalRoleCode[] = [
  'special_team_lead',
  'field_health_worker',
  'local_doctor',
  'registered_doctor',
];

const STATION_TYPES: StationTypeCode[] = [
  'registration',
  'vitals',
  'doctor_review',
  'counselling',
  'waiting',
  'other',
];

const EQUIPMENT_CATEGORIES: EquipmentCategoryCode[] = [
  'bp_monitor',
  'glucometer',
  'weighing_scale',
  'stadiometer',
  'thermometer',
  'pulse_oximeter',
  'tablet',
  'printer',
  'other',
];

const CONSENT_PURPOSES: ConsentPurposeCode[] = [
  'hub_service',
  'health_data_processing',
  'teleconsultation',
  'overseas_sharing',
  'caregiver_authority',
  'call_recording',
  'marketing',
];

export const CatalogGovernanceView: React.FC = () => {
  const { t, language, showToast, refreshBackendData, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('service-types');
  const [loading, setLoading] = useState(false);

  // Data lists
  const [serviceTypes, setServiceTypes] = useState<ApiServiceType[]>([]);
  const [includeInactiveServices, setIncludeInactiveServices] = useState(true);
  const [observationDefs, setObservationDefs] = useState<ApiObservationDefinition[]>([]);
  const [protocols, setProtocols] = useState<ApiClinicalProtocol[]>([]);
  const [consentTemplates, setConsentTemplates] = useState<ApiConsentTemplate[]>([]);
  const [queuePolicies, setQueuePolicies] = useState<ApiQueuePriorityPolicy[]>([]);
  const [includeInactivePolicies, setIncludeInactivePolicies] = useState(true);
  const [staffUsers, setStaffUsers] = useState<ApiUser[]>([]);

  // Detail / Modal states
  // 1) Service Types
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false);
  const [stCode, setStCode] = useState('');
  const [stName, setStName] = useState('');
  const [stNameBn, setStNameBn] = useState('');
  const [stDesc, setStDesc] = useState('');
  const [stProtocolId, setStProtocolId] = useState('');
  const [stSlotMinutes, setStSlotMinutes] = useState(15);
  const [stRequiresDoctor, setStRequiresDoctor] = useState(false);

  const [selectedServiceType, setSelectedServiceType] = useState<ApiServiceType | null>(null);
  const [editStName, setEditStName] = useState('');
  const [editStNameBn, setEditStNameBn] = useState('');
  const [editStDesc, setEditStDesc] = useState('');
  const [editStProtocolId, setEditStProtocolId] = useState('');
  const [editStSlotMinutes, setEditStSlotMinutes] = useState(15);
  const [editStRequiresDoctor, setEditStRequiresDoctor] = useState(false);
  const [editStStatus, setEditStStatus] = useState<'active' | 'inactive'>('active');

  const [reqKind, setReqKind] = useState<'staff_role' | 'station_type' | 'equipment_type'>('staff_role');
  const [reqStaffRole, setReqStaffRole] = useState<StaffRoleCode>('field_health_worker');
  const [reqStationType, setReqStationType] = useState<StationTypeCode>('vitals');
  const [reqEquipmentCategory, setReqEquipmentCategory] = useState<EquipmentCategoryCode>('bp_monitor');
  const [reqMinCount, setReqMinCount] = useState(1);
  const [reqMandatory, setReqMandatory] = useState(true);

  // 2) Observation Definitions
  const [isNewObsOpen, setIsNewObsOpen] = useState(false);
  const [obsCode, setObsCode] = useState('');
  const [obsName, setObsName] = useState('');
  const [obsNameBn, setObsNameBn] = useState('');
  const [obsValueType, setObsValueType] = useState<'quantity' | 'coded' | 'text' | 'scale'>('quantity');
  const [obsCanonicalUnit, setObsCanonicalUnit] = useState('mmHg');
  const [obsAllowedUnits, setObsAllowedUnits] = useState('mmHg');
  const [obsMin, setObsMin] = useState('');
  const [obsMax, setObsMax] = useState('');
  const [obsExternalSystem, setObsExternalSystem] = useState('LOINC');
  const [obsExternalCode, setObsExternalCode] = useState('');

  const [editingObs, setEditingObs] = useState<ApiObservationDefinition | null>(null);
  const [editObsName, setEditObsName] = useState('');
  const [editObsNameBn, setEditObsNameBn] = useState('');
  const [editObsUnit, setEditObsUnit] = useState('');
  const [editObsAllowedUnits, setEditObsAllowedUnits] = useState('');
  const [editObsMin, setEditObsMin] = useState('');
  const [editObsMax, setEditObsMax] = useState('');
  const [editObsStatus, setEditObsStatus] = useState<'active' | 'inactive'>('active');

  // 3) Clinical Protocols
  const [isNewProtocolOpen, setIsNewProtocolOpen] = useState(false);
  const [prCode, setPrCode] = useState('');
  const [prName, setPrName] = useState('');
  const [prDesc, setPrDesc] = useState('');
  const [prOwnerId, setPrOwnerId] = useState('');
  const [prGuideline, setPrGuideline] = useState('');
  const [prCopyFromId, setPrCopyFromId] = useState('');

  const [selectedProtocol, setSelectedProtocol] = useState<ApiClinicalProtocol | null>(null);
  const [editPrName, setEditPrName] = useState('');
  const [editPrDesc, setEditPrDesc] = useState('');
  const [editPrGuideline, setEditPrGuideline] = useState('');
  const [retireReason, setRetireReason] = useState('');

  // Protocol observation binding form
  const [bindObsCode, setBindObsCode] = useState('');
  const [bindRequired, setBindRequired] = useState(true);
  const [bindRoles, setBindRoles] = useState<ClinicalRoleCode[]>(['field_health_worker', 'local_doctor']);
  const [bindSortOrder, setBindSortOrder] = useState(10);

  // Protocol alert rule form
  const [ruleCode, setRuleCode] = useState('');
  const [ruleObsCode, setRuleObsCode] = useState('');
  const [ruleOp, setRuleOp] = useState<ApiAlertCondition['op']>('>=');
  const [ruleVal, setRuleVal] = useState(140);
  const [ruleUnit, setRuleUnit] = useState('mmHg');
  const [ruleAction, setRuleAction] = useState<'repeat_measurement' | 'contact_doctor' | 'urgent_review' | 'referral'>('repeat_measurement');
  const [ruleSeverity, setRuleSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [ruleMsgEn, setRuleMsgEn] = useState('');
  const [ruleMsgBn, setRuleMsgBn] = useState('');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);

  // 4) Consent Templates
  const [isNewConsentOpen, setIsNewConsentOpen] = useState(false);
  const [ctCode, setCtCode] = useState('');
  const [ctPurpose, setCtPurpose] = useState<ConsentPurposeCode>('hub_service');
  const [ctLanguage, setCtLanguage] = useState<'bn' | 'en'>('bn');
  const [ctTitle, setCtTitle] = useState('');
  const [ctBody, setCtBody] = useState('');
  const [ctVerbal, setCtVerbal] = useState('');
  const [ctCategories, setCtCategories] = useState('demographics, vitals');
  const [ctRecipients, setCtRecipients] = useState('Healora Clinical Team');

  const [selectedConsent, setSelectedConsent] = useState<ApiConsentTemplate | null>(null);
  const [editCtTitle, setEditCtTitle] = useState('');
  const [editCtBody, setEditCtBody] = useState('');
  const [editCtVerbal, setEditCtVerbal] = useState('');
  const [editCtCategories, setEditCtCategories] = useState('');
  const [editCtRecipients, setEditCtRecipients] = useState('');
  const [consentRetireReason, setConsentRetireReason] = useState('');

  // 5) Queue Priority Policies
  const [isNewPolicyOpen, setIsNewPolicyOpen] = useState(false);
  const [qpCode, setQpCode] = useState('');
  const [qpDesc, setQpDesc] = useState('');
  const [qpLevel, setQpLevel] = useState(10);
  const [retiringPolicy, setRetiringPolicy] = useState<ApiQueuePriorityPolicy | null>(null);
  const [policyRetireReason, setPolicyRetireReason] = useState('');

  const loadAllCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [stRes, obsRes, prRes, ctRes, qpRes, usersRes] = await Promise.allSettled([
        catalogService.getServiceTypes(includeInactiveServices),
        catalogService.getObservationDefinitions(),
        catalogService.getProtocols(),
        catalogService.getConsentTemplates(),
        catalogService.getQueuePriorityPolicies(includeInactivePolicies),
        staffService.getUsers({ limit: 100 }),
      ]);

      if (stRes.status === 'fulfilled') setServiceTypes(stRes.value.items || []);
      if (obsRes.status === 'fulfilled') setObservationDefs(obsRes.value.items || []);
      if (prRes.status === 'fulfilled') setProtocols(prRes.value.items || []);
      if (ctRes.status === 'fulfilled') setConsentTemplates(ctRes.value.items || []);
      if (qpRes.status === 'fulfilled') setQueuePolicies(qpRes.value.items || []);
      if (usersRes.status === 'fulfilled') {
        const list = usersRes.value.items || [];
        setStaffUsers(list);
        if (!prOwnerId && (currentUser?.id || list[0]?.id)) {
          setPrOwnerId(currentUser?.id || list[0]?.id || '');
        }
      } else if (!prOwnerId && currentUser?.id) {
        setPrOwnerId(currentUser.id);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load catalogue');
    } finally {
      setLoading(false);
    }
  }, [includeInactiveServices, includeInactivePolicies, currentUser?.id, prOwnerId, showToast]);

  useEffect(() => {
    void loadAllCatalog();
  }, [loadAllCatalog]);

  // --- Handlers: Service Types ---
  const openServiceTypeDetails = async (st: ApiServiceType) => {
    try {
      const detail = await catalogService.getServiceType(st.id);
      setSelectedServiceType(detail);
      setEditStName(detail.name);
      setEditStNameBn(detail.nameBn || '');
      setEditStDesc(detail.description || '');
      setEditStProtocolId(detail.protocolId || '');
      setEditStSlotMinutes(detail.defaultSlotMinutes || 15);
      setEditStRequiresDoctor(Boolean(detail.requiresDoctorReview));
      setEditStStatus(detail.status);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load service type details');
    }
  };

  const handleCreateServiceType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await catalogService.createServiceType({
        code: stCode.trim(),
        name: stName.trim(),
        nameBn: stNameBn.trim() || undefined,
        description: stDesc.trim() || undefined,
        protocolId: stProtocolId || undefined,
        defaultSlotMinutes: Number(stSlotMinutes) || 15,
        requiresDoctorReview: stRequiresDoctor,
      });
      showToast(language === 'bn' ? 'সেবা ধরন তৈরি হয়েছে' : 'Service type created');
      setIsNewServiceOpen(false);
      setStCode('');
      setStName('');
      setStNameBn('');
      setStDesc('');
      await loadAllCatalog();
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not create service type');
    }
  };

  const handleUpdateServiceType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceType) return;
    try {
      const updated = await catalogService.updateServiceType(selectedServiceType.id, {
        name: editStName.trim(),
        nameBn: editStNameBn.trim() || null,
        description: editStDesc.trim() || null,
        protocolId: editStProtocolId || null,
        defaultSlotMinutes: Number(editStSlotMinutes) || 15,
        requiresDoctorReview: editStRequiresDoctor,
        status: editStStatus,
      });
      const refreshed = await catalogService.getServiceType(updated.id);
      setSelectedServiceType(refreshed);
      showToast(language === 'bn' ? 'সেবা ধরন আপডেট হয়েছে' : 'Service type updated');
      await loadAllCatalog();
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update service type');
    }
  };

  const handleAddRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceType) return;
    try {
      await catalogService.addServiceTypeRequirement(selectedServiceType.id, {
        kind: reqKind,
        staffRole: reqKind === 'staff_role' ? reqStaffRole : undefined,
        stationType: reqKind === 'station_type' ? reqStationType : undefined,
        equipmentCategory: reqKind === 'equipment_type' ? reqEquipmentCategory : undefined,
        minCount: Number(reqMinCount) || 1,
        mandatory: reqMandatory,
      });
      const refreshed = await catalogService.getServiceType(selectedServiceType.id);
      setSelectedServiceType(refreshed);
      showToast(language === 'bn' ? 'প্রয়োজনীয়তা যোগ করা হয়েছে' : 'Requirement added');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add requirement');
    }
  };

  const handleRemoveRequirement = async (reqId: string) => {
    if (!selectedServiceType) return;
    try {
      await catalogService.removeServiceTypeRequirement(selectedServiceType.id, reqId);
      const refreshed = await catalogService.getServiceType(selectedServiceType.id);
      setSelectedServiceType(refreshed);
      showToast(language === 'bn' ? 'প্রয়োজনীয়তা সরানো হয়েছে' : 'Requirement removed');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove requirement');
    }
  };

  // --- Handlers: Observation Definitions ---
  const handleCreateObservationDef = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const units = obsAllowedUnits
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);
      await catalogService.createObservationDefinition({
        code: obsCode.trim(),
        name: obsName.trim(),
        nameBn: obsNameBn.trim() || null,
        valueType: obsValueType,
        canonicalUnit: obsCanonicalUnit.trim() || null,
        allowedUnits: units,
        plausibleMin: obsMin !== '' ? Number(obsMin) : null,
        plausibleMax: obsMax !== '' ? Number(obsMax) : null,
        externalSystem: obsExternalSystem.trim() || null,
        externalCode: obsExternalCode.trim() || null,
      });
      showToast(language === 'bn' ? 'পর্যবেক্ষণ সংজ্ঞা তৈরি হয়েছে' : 'Observation definition created');
      setIsNewObsOpen(false);
      setObsCode('');
      setObsName('');
      setObsNameBn('');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create observation definition');
    }
  };

  const openEditObservation = (obs: ApiObservationDefinition) => {
    setEditingObs(obs);
    setEditObsName(obs.name);
    setEditObsNameBn(obs.nameBn || '');
    setEditObsUnit(obs.canonicalUnit || '');
    setEditObsAllowedUnits((obs.allowedUnits || []).join(', '));
    setEditObsMin(obs.plausibleMin !== null && obs.plausibleMin !== undefined ? String(obs.plausibleMin) : '');
    setEditObsMax(obs.plausibleMax !== null && obs.plausibleMax !== undefined ? String(obs.plausibleMax) : '');
    setEditObsStatus(obs.status);
  };

  const handleUpdateObservationDef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingObs) return;
    try {
      const units = editObsAllowedUnits
        .split(',')
        .map((u) => u.trim())
        .filter(Boolean);
      await catalogService.updateObservationDefinition(editingObs.code, {
        name: editObsName.trim(),
        nameBn: editObsNameBn.trim() || null,
        canonicalUnit: editObsUnit.trim() || null,
        allowedUnits: units,
        plausibleMin: editObsMin !== '' ? Number(editObsMin) : null,
        plausibleMax: editObsMax !== '' ? Number(editObsMax) : null,
        status: editObsStatus,
      });
      showToast(language === 'bn' ? 'পর্যবেক্ষণ সংজ্ঞা আপডেট হয়েছে' : 'Observation definition updated');
      setEditingObs(null);
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update observation definition');
    }
  };

  // --- Handlers: Clinical Protocols ---
  const openProtocolDetails = async (pr: ApiClinicalProtocol) => {
    try {
      const detail = await catalogService.getProtocol(pr.id);
      setSelectedProtocol(detail);
      setEditPrName(detail.name);
      setEditPrDesc(detail.description || '');
      setEditPrGuideline(detail.guidelineReference || '');
      setRetireReason('');
      if (observationDefs.length > 0 && !bindObsCode) {
        setBindObsCode(observationDefs[0].code);
      }
      if (detail.observations && detail.observations.length > 0 && !ruleObsCode) {
        setRuleObsCode(detail.observations[0].observationCode);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load protocol details');
    }
  };

  const handleCreateProtocol = async (e: React.FormEvent) => {
    e.preventDefault();
    const ownerId = prOwnerId || currentUser?.id;
    if (!ownerId) {
      showToast('Select a clinical owner user ID');
      return;
    }
    try {
      const created = await catalogService.createProtocol({
        code: prCode.trim(),
        name: prName.trim(),
        description: prDesc.trim() || undefined,
        clinicalOwnerId: ownerId,
        guidelineReference: prGuideline.trim() || undefined,
        copyFromId: prCopyFromId || undefined,
      });
      showToast(`Protocol ${created.code} v${created.version} draft created`);
      setIsNewProtocolOpen(false);
      setPrCode('');
      setPrName('');
      setPrDesc('');
      setPrCopyFromId('');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create protocol');
    }
  };

  const handleUpdateProtocolMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocol) return;
    try {
      await catalogService.updateProtocol(selectedProtocol.id, {
        name: editPrName.trim(),
        description: editPrDesc.trim() || null,
        guidelineReference: editPrGuideline.trim() || null,
      });
      const refreshed = await catalogService.getProtocol(selectedProtocol.id);
      setSelectedProtocol(refreshed);
      showToast('Draft protocol metadata updated');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update protocol');
    }
  };

  const handleBindObservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocol || !bindObsCode) return;
    try {
      await catalogService.upsertProtocolObservation(selectedProtocol.id, bindObsCode, {
        required: bindRequired,
        permittedRoles: bindRoles.length ? bindRoles : ['field_health_worker'],
        sortOrder: Number(bindSortOrder) || 0,
      });
      const refreshed = await catalogService.getProtocol(selectedProtocol.id);
      setSelectedProtocol(refreshed);
      showToast(`Observation ${bindObsCode} bound to protocol`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to bind observation');
    }
  };

  const handleRemoveProtocolObs = async (obsCodeToRemove: string) => {
    if (!selectedProtocol) return;
    try {
      await catalogService.removeProtocolObservation(selectedProtocol.id, obsCodeToRemove);
      const refreshed = await catalogService.getProtocol(selectedProtocol.id);
      setSelectedProtocol(refreshed);
      showToast(`Observation ${obsCodeToRemove} removed`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove observation');
    }
  };

  const handleSaveAlertRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProtocol) return;
    try {
      if (editingRuleId) {
        await catalogService.updateProtocolAlertRule(selectedProtocol.id, editingRuleId, {
          code: ruleCode.trim(),
          observationCode: ruleObsCode.trim(),
          condition: { op: ruleOp, value: Number(ruleVal), unit: ruleUnit.trim() || undefined },
          action: ruleAction,
          severity: ruleSeverity,
          messageEn: ruleMsgEn.trim(),
          messageBn: ruleMsgBn.trim() || undefined,
        });
        showToast('Alert rule updated');
      } else {
        await catalogService.addProtocolAlertRule(selectedProtocol.id, {
          code: ruleCode.trim(),
          observationCode: ruleObsCode.trim(),
          condition: { op: ruleOp, value: Number(ruleVal), unit: ruleUnit.trim() || undefined },
          action: ruleAction,
          severity: ruleSeverity,
          messageEn: ruleMsgEn.trim(),
          messageBn: ruleMsgBn.trim() || undefined,
        });
        showToast('Alert rule added');
      }
      setEditingRuleId(null);
      setRuleCode('');
      setRuleMsgEn('');
      setRuleMsgBn('');
      const refreshed = await catalogService.getProtocol(selectedProtocol.id);
      setSelectedProtocol(refreshed);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save alert rule');
    }
  };

  const handleDeleteAlertRule = async (ruleId: string) => {
    if (!selectedProtocol) return;
    try {
      await catalogService.removeProtocolAlertRule(selectedProtocol.id, ruleId);
      const refreshed = await catalogService.getProtocol(selectedProtocol.id);
      setSelectedProtocol(refreshed);
      showToast('Alert rule removed');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove alert rule');
    }
  };

  const handleApproveProtocol = async () => {
    if (!selectedProtocol) return;
    try {
      await catalogService.approveProtocol(selectedProtocol.id);
      const refreshed = await catalogService.getProtocol(selectedProtocol.id);
      setSelectedProtocol(refreshed);
      showToast(`Protocol ${refreshed.code} v${refreshed.version} approved`);
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve protocol');
    }
  };

  const handleRetireProtocol = async () => {
    if (!selectedProtocol || !retireReason.trim()) {
      showToast('Provide a retirement reason (min 5 chars)');
      return;
    }
    try {
      await catalogService.retireProtocol(selectedProtocol.id, retireReason.trim());
      const refreshed = await catalogService.getProtocol(selectedProtocol.id);
      setSelectedProtocol(refreshed);
      setRetireReason('');
      showToast('Protocol retired');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to retire protocol');
    }
  };

  // --- Handlers: Consent Templates ---
  const openConsentDetails = async (ct: ApiConsentTemplate) => {
    try {
      const detail = await catalogService.getConsentTemplate(ct.id);
      setSelectedConsent(detail);
      setEditCtTitle(detail.title);
      setEditCtBody(detail.body);
      setEditCtVerbal(detail.verbalScript || '');
      setEditCtCategories((detail.dataCategories || []).join(', '));
      setEditCtRecipients((detail.recipients || []).join(', '));
      setConsentRetireReason('');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load consent template');
    }
  };

  const handleCreateConsentTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cats = ctCategories.split(',').map((s) => s.trim()).filter(Boolean);
      const recs = ctRecipients.split(',').map((s) => s.trim()).filter(Boolean);
      await catalogService.createConsentTemplate({
        code: ctCode.trim(),
        purpose: ctPurpose,
        language: ctLanguage,
        title: ctTitle.trim(),
        body: ctBody.trim(),
        verbalScript: ctVerbal.trim() || undefined,
        dataCategories: cats.length ? cats : ['health_data'],
        recipients: recs.length ? recs : ['Healora Clinical Team'],
      });
      showToast('Consent template draft created');
      setIsNewConsentOpen(false);
      setCtCode('');
      setCtTitle('');
      setCtBody('');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create consent template');
    }
  };

  const handleUpdateConsentTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsent) return;
    try {
      const cats = editCtCategories.split(',').map((s) => s.trim()).filter(Boolean);
      const recs = editCtRecipients.split(',').map((s) => s.trim()).filter(Boolean);
      const updated = await catalogService.updateConsentTemplate(selectedConsent.id, {
        title: editCtTitle.trim(),
        body: editCtBody.trim(),
        verbalScript: editCtVerbal.trim() || null,
        dataCategories: cats,
        recipients: recs,
      });
      setSelectedConsent(updated);
      showToast('Consent template updated');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update consent template');
    }
  };

  const handleApproveConsent = async () => {
    if (!selectedConsent) return;
    try {
      const updated = await catalogService.approveConsentTemplate(selectedConsent.id);
      setSelectedConsent(updated);
      showToast('Consent template approved');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve consent template');
    }
  };

  const handleRetireConsent = async () => {
    if (!selectedConsent || !consentRetireReason.trim()) {
      showToast('Provide a retirement reason');
      return;
    }
    try {
      const updated = await catalogService.retireConsentTemplate(selectedConsent.id, consentRetireReason.trim());
      setSelectedConsent(updated);
      setConsentRetireReason('');
      showToast('Consent template retired');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to retire consent template');
    }
  };

  // --- Handlers: Queue Priority Policies ---
  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await catalogService.createQueuePriorityPolicy({
        code: qpCode.trim(),
        description: qpDesc.trim(),
        priorityLevel: Number(qpLevel) || 10,
      });
      showToast('Queue priority policy published');
      setIsNewPolicyOpen(false);
      setQpCode('');
      setQpDesc('');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create queue priority policy');
    }
  };

  const handleRetirePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retiringPolicy || !policyRetireReason.trim()) return;
    try {
      await catalogService.retireQueuePriorityPolicy(retiringPolicy.id, policyRetireReason.trim());
      showToast('Queue priority policy retired');
      setRetiringPolicy(null);
      setPolicyRetireReason('');
      await loadAllCatalog();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to retire policy');
    }
  };

  const approvedProtocols = protocols.filter((p) => p.status === 'approved');

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-bold tracking-wider text-teal uppercase">
            <PhShieldCheck size={14} />
            <span>{language === 'bn' ? 'ক্লিনিক্যাল গভর্ন্যান্স এবং সেবা ক্যাটালগ' : 'CLINICAL GOVERNANCE & SERVICE CATALOGUE'}</span>
          </div>
          <h1 className="m-0 font-ui text-[32px] font-semibold tracking-tight text-ink">
            {t.navCatalog}
          </h1>
          <p className="mt-1 mb-0 text-[15px] text-slate">
            {language === 'bn'
              ? 'সেবা ধরন, পরিমাপ সংজ্ঞা, ক্লিনিক্যাল প্রটোকল ও অ্যালার্ট রুল, সম্মতি টেমপ্লেট এবং কিউ অগ্রাধিকার নীতি পরিচালনা করুন'
              : 'Govern hub service types, measurement definitions, clinical protocols & alert rules, PDPA consent templates, and queue priority policies'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<PhArrowsClockwise size={16} />}
            onClick={() => void loadAllCatalog()}
            disabled={loading}
          >
            {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
          </Button>
          {activeTab === 'service-types' && (
            <Button variant="primary" icon={<PhPlus size={16} color="#FFF" />} onClick={() => setIsNewServiceOpen(true)}>
              {language === 'bn' ? 'নতুন সেবা ধরন' : 'New Service Type'}
            </Button>
          )}
          {activeTab === 'observations' && (
            <Button variant="primary" icon={<PhPlus size={16} color="#FFF" />} onClick={() => setIsNewObsOpen(true)}>
              {language === 'bn' ? 'নতুন পরিমাপ সংজ্ঞা' : 'New Observation'}
            </Button>
          )}
          {activeTab === 'protocols' && (
            <Button variant="primary" icon={<PhPlus size={16} color="#FFF" />} onClick={() => setIsNewProtocolOpen(true)}>
              {language === 'bn' ? 'নতুন প্রটোকল খসড়া' : 'New Protocol Draft'}
            </Button>
          )}
          {activeTab === 'consents' && (
            <Button variant="primary" icon={<PhPlus size={16} color="#FFF" />} onClick={() => setIsNewConsentOpen(true)}>
              {language === 'bn' ? 'নতুন সম্মতি টেমপ্লেট' : 'New Consent Template'}
            </Button>
          )}
          {activeTab === 'queue-policies' && (
            <Button variant="primary" icon={<PhPlus size={16} color="#FFF" />} onClick={() => setIsNewPolicyOpen(true)}>
              {language === 'bn' ? 'নতুন অগ্রাধিকার নীতি' : 'New Priority Policy'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <SegmentedTabs
          activeKey={activeTab}
          onChange={setActiveTab}
          options={[
            { key: 'service-types', label: language === 'bn' ? 'সেবা ধরন' : 'Service Types', count: serviceTypes.length },
            { key: 'observations', label: language === 'bn' ? 'পরিমাপ ক্যাটালগ' : 'Observation Definitions', count: observationDefs.length },
            { key: 'protocols', label: language === 'bn' ? 'ক্লিনিক্যাল প্রটোকল' : 'Clinical Protocols', count: protocols.length },
            { key: 'consents', label: language === 'bn' ? 'সম্মতি টেমপ্লেট' : 'Consent Templates', count: consentTemplates.length },
            { key: 'queue-policies', label: language === 'bn' ? 'কিউ অগ্রাধিকার নীতি' : 'Queue Priority Policies', count: queuePolicies.length },
          ]}
        />
      </div>

      {/* TAB 1: SERVICE TYPES */}
      {activeTab === 'service-types' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactiveServices}
                onChange={(e) => setIncludeInactiveServices(e.target.checked)}
              />
              {language === 'bn' ? 'নিষ্ক্রিয় সেবা ধরন দেখান' : 'Include inactive service types'}
            </label>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {serviceTypes.map((st) => (
              <Card key={st.id} className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-sage-100 px-2 py-0.5 font-mono text-xs font-bold text-pine">
                        {st.code}
                      </span>
                      <StatusPill
                        label={st.status}
                        variant={st.status === 'active' ? 'active' : 'draft'}
                      />
                      {st.requiresDoctorReview && (
                        <StatusPill label="Doctor Review Required" variant="teal" showDot={false} />
                      )}
                    </div>
                    <h3 className="mt-2 mb-0.5 text-lg font-semibold text-ink">{st.name}</h3>
                    {st.nameBn && <div className="text-sm text-slate">{st.nameBn}</div>}
                    {st.description && <p className="mt-1.5 mb-0 text-xs text-slate">{st.description}</p>}
                  </div>
                  <Button variant="text" onClick={() => void openServiceTypeDetails(st)}>
                    {language === 'bn' ? 'পরিচালনা' : 'Manage'}
                  </Button>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-xs text-slate">
                  <span>Slot: <strong>{st.defaultSlotMinutes ?? 15} min</strong></span>
                  <span>•</span>
                  <span>Requirements: <strong>{st.requirements?.length ?? 0}</strong></span>
                  {st.requirements && st.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {st.requirements.map((r) => (
                        <span key={r.id} className="rounded-md bg-canvas px-2 py-0.5 text-[11px] font-medium text-ink">
                          {r.kind === 'staff_role' ? r.staffRole : r.kind === 'station_type' ? r.stationType : r.equipmentCategory} ×{r.minCount}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: OBSERVATION DEFINITIONS */}
      {activeTab === 'observations' && (
        <Card className="overflow-hidden p-0">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-line bg-canvas text-[11px] font-semibold tracking-wider text-slate uppercase">
                <th className="px-6 py-3.5">Code</th>
                <th className="px-4 py-3.5">Name / Bangla</th>
                <th className="px-4 py-3.5">Value Type</th>
                <th className="px-4 py-3.5">Units</th>
                <th className="px-4 py-3.5">Plausible Range</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {observationDefs.map((obs) => (
                <tr key={obs.id} className="border-b border-line text-sm hover:bg-canvas/50">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-pine">
                    {obs.code}
                    {obs.externalCode && (
                      <div className="font-sans text-[11px] font-normal text-slate">
                        {obs.externalSystem}: {obs.externalCode}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-semibold text-ink">{obs.name}</div>
                    {obs.nameBn && <div className="text-xs text-slate">{obs.nameBn}</div>}
                  </td>
                  <td className="px-4 py-4 capitalize text-slate">{obs.valueType}</td>
                  <td className="px-4 py-4 text-xs text-ink">
                    {obs.canonicalUnit || '—'}
                    {obs.allowedUnits?.length > 1 && (
                      <div className="text-[11px] text-slate">({obs.allowedUnits.join(', ')})</div>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-slate">
                    {obs.plausibleMin ?? '—'} to {obs.plausibleMax ?? '—'}
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill label={obs.status} variant={obs.status === 'active' ? 'active' : 'draft'} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="text" onClick={() => openEditObservation(obs)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* TAB 3: CLINICAL PROTOCOLS */}
      {activeTab === 'protocols' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {protocols.map((pr) => (
            <Card key={pr.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-sage-100 px-2 py-0.5 font-mono text-xs font-bold text-pine">
                      {pr.code} v{pr.version}
                    </span>
                    <StatusPill
                      label={pr.status}
                      variant={
                        pr.status === 'approved'
                          ? 'completed'
                          : pr.status === 'draft'
                          ? 'awaiting'
                          : 'draft'
                      }
                    />
                  </div>
                  <h3 className="mt-2 mb-1 text-lg font-semibold text-ink">{pr.name}</h3>
                  {pr.description && <p className="m-0 text-xs text-slate">{pr.description}</p>}
                  <div className="mt-2 text-xs text-slate">
                    Clinical Owner: <strong>{pr.clinicalOwner?.name || pr.clinicalOwnerId}</strong>
                    {pr.guidelineReference && <> • Guideline: <strong>{pr.guidelineReference}</strong></>}
                  </div>
                </div>
                <Button variant="secondary" onClick={() => void openProtocolDetails(pr)}>
                  {pr.status === 'draft' ? 'Configure / Approve' : 'Inspect / Retire'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 4: CONSENT TEMPLATES */}
      {activeTab === 'consents' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {consentTemplates.map((ct) => (
            <Card key={ct.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-sage-100 px-2 py-0.5 font-mono text-xs font-bold text-pine">
                      {ct.code} v{ct.version} ({ct.language.toUpperCase()})
                    </span>
                    <StatusPill
                      label={ct.status}
                      variant={
                        ct.status === 'approved'
                          ? 'completed'
                          : ct.status === 'draft'
                          ? 'awaiting'
                          : 'draft'
                      }
                    />
                    <span className="rounded bg-canvas px-2 py-0.5 text-[11px] font-medium text-slate">
                      {ct.purpose}
                    </span>
                  </div>
                  <h3 className="mt-2 mb-1 text-base font-semibold text-ink">{ct.title}</h3>
                  <p className="m-0 line-clamp-2 text-xs text-slate">{ct.body}</p>
                  <div className="mt-2 text-[11px] text-slate">
                    Categories: {(ct.dataCategories || []).join(', ')} • Recipients: {(ct.recipients || []).join(', ')}
                  </div>
                </div>
                <Button variant="text" onClick={() => void openConsentDetails(ct)}>
                  Manage
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 5: QUEUE PRIORITY POLICIES */}
      {activeTab === 'queue-policies' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactivePolicies}
                onChange={(e) => setIncludeInactivePolicies(e.target.checked)}
              />
              {language === 'bn' ? 'অবসরপ্রাপ্ত নীতিগুলো দেখান' : 'Include retired priority policies'}
            </label>
          </div>
          <Card className="overflow-hidden p-0">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line bg-canvas text-[11px] font-semibold tracking-wider text-slate uppercase">
                  <th className="px-6 py-3.5">Policy Code</th>
                  <th className="px-4 py-3.5">Version</th>
                  <th className="px-4 py-3.5">Priority Level</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queuePolicies.map((pol) => (
                  <tr key={pol.id} className="border-b border-line text-sm">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-pine">{pol.code}</td>
                    <td className="px-4 py-4 text-xs text-slate">v{pol.version}</td>
                    <td className="px-4 py-4 font-bold text-ink">{pol.priorityLevel}</td>
                    <td className="px-4 py-4 text-slate">{pol.description}</td>
                    <td className="px-4 py-4">
                      <StatusPill label={pol.status} variant={pol.status === 'active' ? 'active' : 'draft'} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      {pol.status === 'active' && (
                        <Button variant="text" onClick={() => setRetiringPolicy(pol)}>
                          Retire
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* MODAL: New Service Type */}
      <ModalSheet
        isOpen={isNewServiceOpen}
        onClose={() => setIsNewServiceOpen(false)}
        title="Create Service Type"
        subtitle="Define a clinical/screening service type for Healora hubs"
      >
        <form onSubmit={(e) => void handleCreateServiceType(e)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Code (letters, digits, _ -)*</label>
            <input
              required
              value={stCode}
              onChange={(e) => setStCode(e.target.value)}
              placeholder="e.g. ncd_screening"
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Name (English)*</label>
            <input
              required
              value={stName}
              onChange={(e) => setStName(e.target.value)}
              placeholder="e.g. NCD Screening & Hypertension Check"
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Name (Bangla)</label>
            <input
              value={stNameBn}
              onChange={(e) => setStNameBn(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Description</label>
            <textarea
              rows={2}
              value={stDesc}
              onChange={(e) => setStDesc(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Approved Protocol</label>
              <select
                value={stProtocolId}
                onChange={(e) => setStProtocolId(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm"
              >
                <option value="">None linked yet</option>
                {approvedProtocols.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code} v{p.version})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Default Slot Minutes</label>
              <input
                type="number"
                min={5}
                max={240}
                value={stSlotMinutes}
                onChange={(e) => setStSlotMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={stRequiresDoctor}
              onChange={(e) => setStRequiresDoctor(e.target.checked)}
            />
            Requires Doctor Review before encounter completion
          </label>
          <Button type="submit" variant="primary" fullWidth>
            Create Service Type
          </Button>
        </form>
      </ModalSheet>

      {/* MODAL: Manage Service Type & Requirements */}
      <ModalSheet
        isOpen={Boolean(selectedServiceType)}
        onClose={() => setSelectedServiceType(null)}
        title={selectedServiceType ? `Service Type: ${selectedServiceType.name}` : 'Service Type'}
        subtitle={selectedServiceType ? `Code: ${selectedServiceType.code}` : ''}
      >
        {selectedServiceType && (
          <div className="flex flex-col gap-6">
            <form onSubmit={(e) => void handleUpdateServiceType(e)} className="flex flex-col gap-3 border-b border-line pb-5">
              <div className="text-xs font-bold uppercase text-teal">Edit Service Type</div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Name (English)</label>
                <input
                  required
                  value={editStName}
                  onChange={(e) => setEditStName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Name (Bangla)</label>
                <input
                  value={editStNameBn}
                  onChange={(e) => setEditStNameBn(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Description</label>
                <textarea
                  rows={2}
                  value={editStDesc}
                  onChange={(e) => setEditStDesc(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate">Approved Protocol</label>
                  <select
                    value={editStProtocolId}
                    onChange={(e) => setEditStProtocolId(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    {approvedProtocols.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} v{p.version} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate">Status</label>
                  <select
                    value={editStStatus}
                    onChange={(e) => setEditStStatus(e.target.value as 'active' | 'inactive')}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate">Slot Minutes</label>
                  <input
                    type="number"
                    min={1}
                    max={480}
                    value={editStSlotMinutes}
                    onChange={(e) => setEditStSlotMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                  />
                </div>
                <label className="mt-4 flex items-center gap-2 text-xs font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={editStRequiresDoctor}
                    onChange={(e) => setEditStRequiresDoctor(e.target.checked)}
                  />
                  Requires Doctor Review
                </label>
              </div>
              <Button type="submit" variant="small">
                Save Service Type Changes
              </Button>
            </form>

            {/* Readiness Requirements */}
            <div className="flex flex-col gap-3">
              <div className="text-xs font-bold uppercase text-teal">
                Session Readiness Requirements ({selectedServiceType.requirements?.length ?? 0})
              </div>
              {selectedServiceType.requirements && selectedServiceType.requirements.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {selectedServiceType.requirements.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs"
                    >
                      <div>
                        <span className="font-semibold uppercase text-pine">{req.kind}: </span>
                        <span className="font-mono text-ink">
                          {req.staffRole || req.stationType || req.equipmentCategory}
                        </span>
                        <span className="ml-2 text-slate">
                          Min: {req.minCount} • {req.mandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleRemoveRequirement(req.id)}
                        className="cursor-pointer border-0 bg-transparent text-xs font-semibold text-bad-fg"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate">No readiness requirements configured.</div>
              )}

              <form onSubmit={(e) => void handleAddRequirement(e)} className="mt-2 flex flex-col gap-3 rounded-xl border border-line bg-canvas/50 p-3.5">
                <div className="text-xs font-semibold text-ink">Add Readiness Requirement</div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="mb-1 block text-[11px] text-slate">Kind</label>
                    <select
                      value={reqKind}
                      onChange={(e) => setReqKind(e.target.value as typeof reqKind)}
                      className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                    >
                      <option value="staff_role">Staff Role</option>
                      <option value="station_type">Station Type</option>
                      <option value="equipment_type">Equipment Category</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] text-slate">Target</label>
                    {reqKind === 'staff_role' && (
                      <select
                        value={reqStaffRole}
                        onChange={(e) => setReqStaffRole(e.target.value as StaffRoleCode)}
                        className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                      >
                        {STAFF_ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    )}
                    {reqKind === 'station_type' && (
                      <select
                        value={reqStationType}
                        onChange={(e) => setReqStationType(e.target.value as StationTypeCode)}
                        className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                      >
                        {STATION_TYPES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                    {reqKind === 'equipment_type' && (
                      <select
                        value={reqEquipmentCategory}
                        onChange={(e) => setReqEquipmentCategory(e.target.value as EquipmentCategoryCode)}
                        className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                      >
                        {EQUIPMENT_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate">Min Count:</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={reqMinCount}
                      onChange={(e) => setReqMinCount(Number(e.target.value))}
                      className="w-16 rounded-lg border border-line bg-white px-2 py-1 text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-ink">
                    <input
                      type="checkbox"
                      checked={reqMandatory}
                      onChange={(e) => setReqMandatory(e.target.checked)}
                    />
                    Mandatory
                  </label>
                  <Button type="submit" variant="small">
                    Add Requirement
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </ModalSheet>

      {/* MODAL: New Observation Definition */}
      <ModalSheet
        isOpen={isNewObsOpen}
        onClose={() => setIsNewObsOpen(false)}
        title="New Observation Definition"
        subtitle="Define a clinical measurement or observation code"
      >
        <form onSubmit={(e) => void handleCreateObservationDef(e)} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Observation Code*</label>
            <input
              required
              value={obsCode}
              onChange={(e) => setObsCode(e.target.value)}
              placeholder="e.g. systolic_bp"
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Name (EN)*</label>
              <input
                required
                value={obsName}
                onChange={(e) => setObsName(e.target.value)}
                placeholder="Systolic Blood Pressure"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Name (BN)</label>
              <input
                value={obsNameBn}
                onChange={(e) => setObsNameBn(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Value Type</label>
              <select
                value={obsValueType}
                onChange={(e) => setObsValueType(e.target.value as typeof obsValueType)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              >
                <option value="quantity">Quantity</option>
                <option value="coded">Coded</option>
                <option value="text">Text</option>
                <option value="scale">Scale</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Canonical Unit</label>
              <input
                value={obsCanonicalUnit}
                onChange={(e) => setObsCanonicalUnit(e.target.value)}
                placeholder="mmHg"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Allowed Units (CSV)</label>
              <input
                value={obsAllowedUnits}
                onChange={(e) => setObsAllowedUnits(e.target.value)}
                placeholder="mmHg"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Plausible Min</label>
              <input
                type="number"
                step="any"
                value={obsMin}
                onChange={(e) => setObsMin(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Plausible Max</label>
              <input
                type="number"
                step="any"
                value={obsMax}
                onChange={(e) => setObsMax(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">External System</label>
              <input
                value={obsExternalSystem}
                onChange={(e) => setObsExternalSystem(e.target.value)}
                placeholder="LOINC"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">External Code</label>
              <input
                value={obsExternalCode}
                onChange={(e) => setObsExternalCode(e.target.value)}
                placeholder="8480-6"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
          <Button type="submit" variant="primary" fullWidth>
            Create Observation Definition
          </Button>
        </form>
      </ModalSheet>

      {/* MODAL: Edit Observation Definition */}
      <ModalSheet
        isOpen={Boolean(editingObs)}
        onClose={() => setEditingObs(null)}
        title={editingObs ? `Edit Observation: ${editingObs.code}` : 'Edit Observation'}
      >
        {editingObs && (
          <form onSubmit={(e) => void handleUpdateObservationDef(e)} className="flex flex-col gap-3.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Name (EN)*</label>
              <input
                required
                value={editObsName}
                onChange={(e) => setEditObsName(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Name (BN)</label>
              <input
                value={editObsNameBn}
                onChange={(e) => setEditObsNameBn(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Canonical Unit</label>
                <input
                  value={editObsUnit}
                  onChange={(e) => setEditObsUnit(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Allowed Units (CSV)</label>
                <input
                  value={editObsAllowedUnits}
                  onChange={(e) => setEditObsAllowedUnits(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Plausible Min</label>
                <input
                  type="number"
                  step="any"
                  value={editObsMin}
                  onChange={(e) => setEditObsMin(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Plausible Max</label>
                <input
                  type="number"
                  step="any"
                  value={editObsMax}
                  onChange={(e) => setEditObsMax(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Status</label>
              <select
                value={editObsStatus}
                onChange={(e) => setEditObsStatus(e.target.value as 'active' | 'inactive')}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <Button type="submit" variant="primary" fullWidth>
              Save Observation Changes
            </Button>
          </form>
        )}
      </ModalSheet>

      {/* MODAL: New Clinical Protocol */}
      <ModalSheet
        isOpen={isNewProtocolOpen}
        onClose={() => setIsNewProtocolOpen(false)}
        title="New Clinical Protocol Draft"
        subtitle="Create a versioned clinical protocol (or clone an existing version)"
      >
        <form onSubmit={(e) => void handleCreateProtocol(e)} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Protocol Code*</label>
            <input
              required
              value={prCode}
              onChange={(e) => setPrCode(e.target.value)}
              placeholder="e.g. proto_hypertension"
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Protocol Name*</label>
            <input
              required
              value={prName}
              onChange={(e) => setPrName(e.target.value)}
              placeholder="Hypertension & Cardiovascular Risk Screening"
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Description</label>
            <textarea
              rows={2}
              value={prDesc}
              onChange={(e) => setPrDesc(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Clinical Owner*</label>
            {staffUsers.length > 0 ? (
              <select
                required
                value={prOwnerId}
                onChange={(e) => setPrOwnerId(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
              >
                {staffUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email})
                  </option>
                ))}
              </select>
            ) : (
              <input
                required
                value={prOwnerId}
                onChange={(e) => setPrOwnerId(e.target.value)}
                placeholder="Clinical owner user UUID"
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Guideline Reference</label>
            <input
              value={prGuideline}
              onChange={(e) => setPrGuideline(e.target.value)}
              placeholder="DGHS National NCD Protocol 2026"
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Clone Observations & Rules From (Optional)</label>
            <select
              value={prCopyFromId}
              onChange={(e) => {
                setPrCopyFromId(e.target.value);
                const foundPr = protocols.find((p) => p.id === e.target.value);
                if (foundPr && !prCode) setPrCode(foundPr.code);
              }}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            >
              <option value="">Start empty</option>
              {protocols.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} v{p.version} ({p.status}) - {p.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" variant="primary" fullWidth>
            Create Draft Protocol
          </Button>
        </form>
      </ModalSheet>

      {/* MODAL: Protocol Details, Observations, Alert Rules & Lifecycle */}
      <ModalSheet
        isOpen={Boolean(selectedProtocol)}
        onClose={() => setSelectedProtocol(null)}
        title={selectedProtocol ? `${selectedProtocol.name} (${selectedProtocol.code} v${selectedProtocol.version})` : 'Protocol'}
        subtitle={selectedProtocol ? `Status: ${selectedProtocol.status.toUpperCase()}` : ''}
      >
        {selectedProtocol && (
          <div className="flex flex-col gap-6">
            {/* Lifecycle Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-canvas p-3.5">
              <div className="flex items-center gap-2">
                <StatusPill
                  label={selectedProtocol.status}
                  variant={selectedProtocol.status === 'approved' ? 'completed' : selectedProtocol.status === 'draft' ? 'awaiting' : 'draft'}
                />
                <span className="text-xs text-slate">
                  {selectedProtocol.status === 'draft'
                    ? 'Draft versions can be edited and approved.'
                    : 'Approved/retired protocols are immutable.'}
                </span>
              </div>
              {selectedProtocol.status === 'draft' && (
                <Button variant="small" onClick={() => void handleApproveProtocol()}>
                  Approve Protocol
                </Button>
              )}
            </div>

            {/* Retire box if not retired */}
            {selectedProtocol.status !== 'retired' && (
              <div className="flex items-center gap-2">
                <input
                  value={retireReason}
                  onChange={(e) => setRetireReason(e.target.value)}
                  placeholder="Reason to retire this protocol version..."
                  className="flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs"
                />
                <Button variant="secondary" onClick={() => void handleRetireProtocol()}>
                  Retire
                </Button>
              </div>
            )}

            {/* Metadata edit if draft */}
            {selectedProtocol.status === 'draft' && (
              <form onSubmit={(e) => void handleUpdateProtocolMeta(e)} className="flex flex-col gap-2.5 border-b border-line pb-4">
                <div className="text-xs font-bold uppercase text-teal">Draft Metadata</div>
                <input
                  required
                  value={editPrName}
                  onChange={(e) => setEditPrName(e.target.value)}
                  placeholder="Protocol Name"
                  className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs"
                />
                <input
                  value={editPrGuideline}
                  onChange={(e) => setEditPrGuideline(e.target.value)}
                  placeholder="Guideline reference"
                  className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs"
                />
                <textarea
                  rows={2}
                  value={editPrDesc}
                  onChange={(e) => setEditPrDesc(e.target.value)}
                  placeholder="Description"
                  className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs"
                />
                <Button type="submit" variant="small">
                  Update Metadata
                </Button>
              </form>
            )}

            {/* Protocol Observations */}
            <div className="flex flex-col gap-2.5 border-b border-line pb-4">
              <div className="text-xs font-bold uppercase text-teal">
                Bound Observations ({selectedProtocol.observations?.length ?? 0})
              </div>
              {selectedProtocol.observations && selectedProtocol.observations.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {selectedProtocol.observations.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-lg border border-line bg-canvas px-3 py-2 text-xs">
                      <div>
                        <span className="font-mono font-bold text-pine">{o.observationCode}</span>
                        <span className="ml-2 text-slate">
                          {o.required ? 'Required' : 'Optional'} • Roles: {(o.permittedRoles || []).join(', ')} • Order: {o.sortOrder}
                        </span>
                      </div>
                      {selectedProtocol.status === 'draft' && (
                        <button
                          type="button"
                          onClick={() => void handleRemoveProtocolObs(o.observationCode)}
                          className="cursor-pointer border-0 bg-transparent text-xs font-semibold text-bad-fg"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate">No observations bound yet. Add at least one before approval.</div>
              )}

              {selectedProtocol.status === 'draft' && (
                <form onSubmit={(e) => void handleBindObservation(e)} className="mt-2 flex flex-col gap-2.5 rounded-xl border border-line bg-canvas/50 p-3">
                  <div className="text-xs font-semibold text-ink">Bind / Update Observation</div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={bindObsCode}
                      onChange={(e) => setBindObsCode(e.target.value)}
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                    >
                      <option value="">Select observation...</option>
                      {observationDefs.filter((d) => d.status === 'active').map((d) => (
                        <option key={d.code} value={d.code}>
                          {d.code} ({d.name})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={bindSortOrder}
                      onChange={(e) => setBindSortOrder(Number(e.target.value))}
                      placeholder="Sort order"
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {CLINICAL_ROLES.map((r) => (
                      <label key={r} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={bindRoles.includes(r)}
                          onChange={(e) => {
                            if (e.target.checked) setBindRoles([...bindRoles, r]);
                            else setBindRoles(bindRoles.filter((x) => x !== r));
                          }}
                        />
                        {r}
                      </label>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={bindRequired}
                        onChange={(e) => setBindRequired(e.target.checked)}
                      />
                      Mandatory Observation
                    </label>
                    <Button type="submit" variant="small">
                      Bind Observation
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Alert Rules */}
            <div className="flex flex-col gap-2.5">
              <div className="text-xs font-bold uppercase text-teal">
                Protocol Alert Rules ({selectedProtocol.alertRules?.length ?? 0})
              </div>
              {selectedProtocol.alertRules && selectedProtocol.alertRules.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {selectedProtocol.alertRules.map((rule) => (
                    <div key={rule.id} className="rounded-lg border border-line bg-canvas p-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-pine">{rule.code}</span>
                          <StatusPill
                            label={rule.severity}
                            variant={rule.severity === 'critical' || rule.severity === 'high' ? 'declined' : 'awaiting'}
                          />
                          <span className="font-mono text-ink">
                            {rule.observationCode} {rule.condition.op} {rule.condition.value} {rule.condition.unit || ''}
                          </span>
                        </div>
                        {selectedProtocol.status === 'draft' && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingRuleId(rule.id);
                                setRuleCode(rule.code);
                                setRuleObsCode(rule.observationCode);
                                setRuleOp(rule.condition.op);
                                setRuleVal(rule.condition.value);
                                setRuleUnit(rule.condition.unit || '');
                                setRuleAction(rule.action);
                                setRuleSeverity(rule.severity);
                                setRuleMsgEn(rule.messageEn);
                                setRuleMsgBn(rule.messageBn || '');
                              }}
                              className="cursor-pointer border-0 bg-transparent text-xs font-semibold text-teal"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteAlertRule(rule.id)}
                              className="cursor-pointer border-0 bg-transparent text-xs font-semibold text-bad-fg"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mt-1 text-slate">
                        Action: <strong>{rule.action}</strong> — {rule.messageEn}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate">No alert rules configured.</div>
              )}

              {selectedProtocol.status === 'draft' && (
                <form onSubmit={(e) => void handleSaveAlertRule(e)} className="mt-2 flex flex-col gap-2.5 rounded-xl border border-line bg-canvas/50 p-3">
                  <div className="text-xs font-semibold text-ink">
                    {editingRuleId ? 'Update Alert Rule' : 'Add Alert Rule'}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      value={ruleCode}
                      onChange={(e) => setRuleCode(e.target.value)}
                      placeholder="Rule code (e.g. high_sbp)"
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                    />
                    <select
                      required
                      value={ruleObsCode}
                      onChange={(e) => setRuleObsCode(e.target.value)}
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                    >
                      <option value="">Select bound observation...</option>
                      {(selectedProtocol.observations || []).map((o) => (
                        <option key={o.observationCode} value={o.observationCode}>
                          {o.observationCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={ruleOp}
                      onChange={(e) => setRuleOp(e.target.value as ApiAlertCondition['op'])}
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                    >
                      <option value=">">&gt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<">&lt;</option>
                      <option value="<=">&lt;=</option>
                      <option value="==">==</option>
                      <option value="!=">!=</option>
                    </select>
                    <input
                      type="number"
                      step="any"
                      required
                      value={ruleVal}
                      onChange={(e) => setRuleVal(Number(e.target.value))}
                      placeholder="Threshold value"
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                    />
                    <input
                      value={ruleUnit}
                      onChange={(e) => setRuleUnit(e.target.value)}
                      placeholder="Unit (e.g. mmHg)"
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={ruleAction}
                      onChange={(e) => setRuleAction(e.target.value as typeof ruleAction)}
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                    >
                      <option value="repeat_measurement">Repeat Measurement</option>
                      <option value="contact_doctor">Contact Doctor</option>
                      <option value="urgent_review">Urgent Review</option>
                      <option value="referral">Referral</option>
                    </select>
                    <select
                      value={ruleSeverity}
                      onChange={(e) => setRuleSeverity(e.target.value as typeof ruleSeverity)}
                      className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <input
                    required
                    value={ruleMsgEn}
                    onChange={(e) => setRuleMsgEn(e.target.value)}
                    placeholder="Guidance message (English)*"
                    className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                  />
                  <input
                    value={ruleMsgBn}
                    onChange={(e) => setRuleMsgBn(e.target.value)}
                    placeholder="Guidance message (Bangla)"
                    className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <Button type="submit" variant="small">
                      {editingRuleId ? 'Save Rule' : 'Add Rule'}
                    </Button>
                    {editingRuleId && (
                      <Button
                        type="button"
                        variant="text"
                        onClick={() => {
                          setEditingRuleId(null);
                          setRuleCode('');
                          setRuleMsgEn('');
                        }}
                      >
                        Cancel Edit
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </ModalSheet>

      {/* MODAL: New Consent Template */}
      <ModalSheet
        isOpen={isNewConsentOpen}
        onClose={() => setIsNewConsentOpen(false)}
        title="New Consent Template Draft"
        subtitle="Create a PDPA 2026 purpose-specific consent template"
      >
        <form onSubmit={(e) => void handleCreateConsentTemplate(e)} className="flex flex-col gap-3.5">
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Code*</label>
              <input
                required
                value={ctCode}
                onChange={(e) => setCtCode(e.target.value)}
                placeholder="consent_hub_care"
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Purpose*</label>
              <select
                value={ctPurpose}
                onChange={(e) => setCtPurpose(e.target.value as ConsentPurposeCode)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              >
                {CONSENT_PURPOSES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Language*</label>
              <select
                value={ctLanguage}
                onChange={(e) => setCtLanguage(e.target.value as 'bn' | 'en')}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              >
                <option value="bn">Bangla (bn)</option>
                <option value="en">English (en)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Title*</label>
            <input
              required
              value={ctTitle}
              onChange={(e) => setCtTitle(e.target.value)}
              placeholder="Informed Consent for Hub Screening & Data Processing"
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Consent Body (min 20 chars)*</label>
            <textarea
              required
              minLength={20}
              rows={4}
              value={ctBody}
              onChange={(e) => setCtBody(e.target.value)}
              placeholder="Full legal consent notice wording..."
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Verbal Read-Aloud Script</label>
            <textarea
              rows={2}
              value={ctVerbal}
              onChange={(e) => setCtVerbal(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Data Categories (CSV)*</label>
              <input
                required
                value={ctCategories}
                onChange={(e) => setCtCategories(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Recipients (CSV)*</label>
              <input
                required
                value={ctRecipients}
                onChange={(e) => setCtRecipients(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
          <Button type="submit" variant="primary" fullWidth>
            Create Draft Consent Template
          </Button>
        </form>
      </ModalSheet>

      {/* MODAL: Manage Consent Template */}
      <ModalSheet
        isOpen={Boolean(selectedConsent)}
        onClose={() => setSelectedConsent(null)}
        title={selectedConsent ? `${selectedConsent.code} v${selectedConsent.version} (${selectedConsent.language.toUpperCase()})` : 'Consent Template'}
        subtitle={selectedConsent ? `Purpose: ${selectedConsent.purpose} • Status: ${selectedConsent.status}` : ''}
      >
        {selectedConsent && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between rounded-xl border border-line bg-canvas p-3.5">
              <StatusPill
                label={selectedConsent.status}
                variant={selectedConsent.status === 'approved' ? 'completed' : selectedConsent.status === 'draft' ? 'awaiting' : 'draft'}
              />
              {selectedConsent.status === 'draft' && (
                <Button variant="small" onClick={() => void handleApproveConsent()}>
                  Approve Template
                </Button>
              )}
            </div>

            {selectedConsent.status !== 'retired' && (
              <div className="flex items-center gap-2">
                <input
                  value={consentRetireReason}
                  onChange={(e) => setConsentRetireReason(e.target.value)}
                  placeholder="Reason to retire template..."
                  className="flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-xs"
                />
                <Button variant="secondary" onClick={() => void handleRetireConsent()}>
                  Retire
                </Button>
              </div>
            )}

            {selectedConsent.status === 'draft' ? (
              <form onSubmit={(e) => void handleUpdateConsentTemplate(e)} className="flex flex-col gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate">Title</label>
                  <input
                    required
                    value={editCtTitle}
                    onChange={(e) => setEditCtTitle(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate">Body</label>
                  <textarea
                    required
                    minLength={20}
                    rows={5}
                    value={editCtBody}
                    onChange={(e) => setEditCtBody(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate">Verbal Script</label>
                  <textarea
                    rows={2}
                    value={editCtVerbal}
                    onChange={(e) => setEditCtVerbal(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate">Data Categories (CSV)</label>
                    <input
                      value={editCtCategories}
                      onChange={(e) => setEditCtCategories(e.target.value)}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate">Recipients (CSV)</label>
                    <input
                      value={editCtRecipients}
                      onChange={(e) => setEditCtRecipients(e.target.value)}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <Button type="submit" variant="primary" fullWidth>
                  Save Draft Changes
                </Button>
              </form>
            ) : (
              <div className="flex flex-col gap-3 text-sm">
                <div className="font-semibold text-ink">{selectedConsent.title}</div>
                <div className="whitespace-pre-wrap rounded-xl border border-line bg-canvas p-4 text-xs text-ink">
                  {selectedConsent.body}
                </div>
                {selectedConsent.verbalScript && (
                  <div className="text-xs text-slate">
                    <strong>Verbal Script:</strong> {selectedConsent.verbalScript}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ModalSheet>

      {/* MODAL: New Queue Priority Policy */}
      <ModalSheet
        isOpen={isNewPolicyOpen}
        onClose={() => setIsNewPolicyOpen(false)}
        title="New Queue Priority Policy"
        subtitle="Define an approved clinical governance policy for elevating queue priority"
      >
        <form onSubmit={(e) => void handleCreatePolicy(e)} className="flex flex-col gap-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Policy Code*</label>
            <input
              required
              value={qpCode}
              onChange={(e) => setQpCode(e.target.value)}
              placeholder="e.g. elderly_70_plus"
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Priority Level (1-100)*</label>
            <input
              type="number"
              min={1}
              max={100}
              required
              value={qpLevel}
              onChange={(e) => setQpLevel(Number(e.target.value))}
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Policy Description*</label>
            <textarea
              required
              minLength={5}
              rows={3}
              value={qpDesc}
              onChange={(e) => setQpDesc(e.target.value)}
              placeholder="Criteria for applying this priority policy at the hub queue..."
              className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
            />
          </div>
          <Button type="submit" variant="primary" fullWidth>
            Publish Priority Policy
          </Button>
        </form>
      </ModalSheet>

      {/* MODAL: Retire Queue Policy */}
      <ModalSheet
        isOpen={Boolean(retiringPolicy)}
        onClose={() => setRetiringPolicy(null)}
        title={retiringPolicy ? `Retire Policy: ${retiringPolicy.code}` : 'Retire Policy'}
      >
        {retiringPolicy && (
          <form onSubmit={(e) => void handleRetirePolicy(e)} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Reason for Retirement*</label>
              <textarea
                required
                minLength={5}
                rows={3}
                value={policyRetireReason}
                onChange={(e) => setPolicyRetireReason(e.target.value)}
                placeholder="Explain why this priority policy is being retired..."
                className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm"
              />
            </div>
            <Button type="submit" variant="primary" fullWidth>
              Confirm Retire Policy
            </Button>
          </form>
        )}
      </ModalSheet>
    </div>
  );
};
