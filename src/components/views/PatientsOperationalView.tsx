import React, { useEffect, useState, useCallback } from 'react';
import { PhMagnifyingGlass, PhPlus, PhArrowsClockwise } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { SegmentedTabs } from '../common/Tabs';
import { useApp } from '../../context/useApp';
import {
  patientsService,
  type ApiPatient,
  type ApiPatientRepresentative,
  type DuplicateCandidate,
} from '../../services/patientsService';

type LookupKind = 'phone' | 'healora_code' | 'appointment_code' | 'identifier';
type IdentifierKind = 'national_id' | 'birth_registration' | 'passport' | 'healora_card' | 'other';

export const PatientsOperationalView: React.FC = () => {
  const { t, selectedHubId, regions, checkInAppointment, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'lookup' | 'duplicates'>('lookup');
  const [lookupKind, setLookupKind] = useState<LookupKind>('phone');
  const [identifierType, setIdentifierType] = useState<IdentifierKind>('national_id');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApiPatient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<ApiPatient | null>(null);
  const [appointment, setAppointment] = useState<{
    id: string;
    code: string;
    status: string;
    sessionId: string;
    hubId: string;
  } | null>(null);
  const [identityConfirmed, setIdentityConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Register new patient modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regNameBn, setRegNameBn] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSex, setRegSex] = useState<'male' | 'female' | 'other'>('female');
  const [regAge, setRegAge] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regNationalId, setRegNationalId] = useState('');
  const [regRegionId, setRegRegionId] = useState('');

  // Patient Record Inspector states (getPatient, identifiers, representatives)
  const [patientTab, setPatientTab] = useState<'profile' | 'identifiers' | 'representatives'>('profile');
  const [livePatient, setLivePatient] = useState<ApiPatient | null>(null);
  const [newIdType, setNewIdType] = useState<IdentifierKind>('national_id');
  const [newIdValue, setNewIdValue] = useState('');
  const [representatives, setRepresentatives] = useState<ApiPatientRepresentative[]>([]);
  const [repName, setRepName] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [repRelation, setRepRelation] = useState<ApiPatientRepresentative['relationship']>('parent');
  const [repLegalBasis, setRepLegalBasis] = useState('Parent / Family Carer');
  const [repRevokeReason, setRepRevokeReason] = useState('');
  const [patientFeedback, setPatientFeedback] = useState<string | null>(null);

  // Duplicates tab states
  const [dupStatusFilter, setDupStatusFilter] = useState<'open' | 'confirmed_duplicate' | 'not_duplicate'>('open');
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[]>([]);
  const [loadingDuplicates, setLoadingDuplicates] = useState(false);
  const [resolveNote, setResolveNote] = useState('');
  const [mergeReason, setMergeReason] = useState('');

  const lookup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedHubId || !query.trim()) return;
    setLoading(true);
    try {
      const criteria =
        lookupKind === 'identifier'
          ? { by: 'identifier' as const, identifierType, value: query.trim(), hubId: selectedHubId }
          : { by: lookupKind, value: query.trim(), hubId: selectedHubId };
      const response = await patientsService.lookup(criteria);
      setResults(response.matches);
      setAppointment(response.appointment);
      setSelectedPatient(null);
      setIdentityConfirmed(false);
      if (!response.matches.length && !response.appointment) {
        showToast('No matching API patient or appointment was found.');
      }
    } catch (error) {
      setResults([]);
      setAppointment(null);
      showToast(error instanceof Error ? error.message : 'Patient lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHubId || !regName.trim() || !regPhone.trim()) return;
    try {
      const created = await patientsService.register({
        hubId: selectedHubId,
        fullName: regName.trim(),
        fullNameBn: regNameBn.trim() || undefined,
        phone: regPhone.trim(),
        sex: regSex,
        age: regAge ? Number(regAge) : undefined,
        addressLine: regAddress.trim() || undefined,
        nationalId: regNationalId.trim() || undefined,
        regionId: regRegionId || undefined,
      });
      setResults([created, ...results]);
      setIsRegisterOpen(false);
      setRegName('');
      setRegNameBn('');
      setRegPhone('');
      setRegAge('');
      setRegAddress('');
      setRegNationalId('');
      showToast(`Registered patient ${created.healoraCode}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to register patient.');
    }
  };

  const loadPatientInspector = useCallback(
    async (patient: ApiPatient) => {
      setSelectedPatient(patient);
      setPatientTab('profile');
      setPatientFeedback(null);
      if (!selectedHubId) return;
      try {
        const [fullProfile, repsRes] = await Promise.all([
          patientsService.getPatient(patient.id, selectedHubId).catch(() => patient),
          patientsService.getRepresentatives(patient.id, selectedHubId).catch(() => ({ items: [] })),
        ]);
        setLivePatient(fullProfile);
        setRepresentatives(repsRes.items ?? []);
      } catch {
        setLivePatient(patient);
      }
    },
    [selectedHubId]
  );

  const handleAddIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedHubId || !newIdValue.trim()) return;
    try {
      await patientsService.addIdentifier(selectedPatient.id, {
        hubId: selectedHubId,
        type: newIdType,
        value: newIdValue.trim(),
      });
      setNewIdValue('');
      setPatientFeedback('Identifier linked to patient record.');
    } catch (err) {
      setPatientFeedback(err instanceof Error ? err.message : 'Failed to attach identifier.');
    }
  };

  const handleAddRepresentative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !selectedHubId || !repName.trim()) return;
    try {
      await patientsService.addRepresentative(selectedPatient.id, {
        hubId: selectedHubId,
        fullName: repName.trim(),
        phone: repPhone.trim() || undefined,
        relationship: repRelation,
        legalBasis: repLegalBasis.trim() || 'Family representative',
      });
      setRepName('');
      setRepPhone('');
      const repsRes = await patientsService.getRepresentatives(selectedPatient.id, selectedHubId);
      setRepresentatives(repsRes.items ?? []);
      setPatientFeedback('Representative added.');
    } catch (err) {
      setPatientFeedback(err instanceof Error ? err.message : 'Failed to add representative.');
    }
  };

  const handleVerifyRep = async (repId: string) => {
    if (!selectedPatient || !selectedHubId) return;
    try {
      await patientsService.verifyRepresentative(selectedPatient.id, repId, selectedHubId);
      const repsRes = await patientsService.getRepresentatives(selectedPatient.id, selectedHubId);
      setRepresentatives(repsRes.items ?? []);
      setPatientFeedback('Representative verified.');
    } catch (err) {
      setPatientFeedback(err instanceof Error ? err.message : 'Failed to verify representative.');
    }
  };

  const handleRevokeRep = async (repId: string) => {
    if (!selectedPatient || !selectedHubId) return;
    try {
      await patientsService.revokeRepresentative(
        selectedPatient.id,
        repId,
        selectedHubId,
        repRevokeReason.trim() || 'Revoked at hub desk'
      );
      const repsRes = await patientsService.getRepresentatives(selectedPatient.id, selectedHubId);
      setRepresentatives(repsRes.items ?? []);
      setPatientFeedback('Representative authority revoked.');
    } catch (err) {
      setPatientFeedback(err instanceof Error ? err.message : 'Failed to revoke representative.');
    }
  };

  const loadDuplicates = useCallback(async () => {
    setLoadingDuplicates(true);
    try {
      const res = await patientsService.getDuplicates(dupStatusFilter);
      setDuplicates(res.items ?? []);
    } catch {
      setDuplicates([]);
    } finally {
      setLoadingDuplicates(false);
    }
  }, [dupStatusFilter]);

  useEffect(() => {
    if (activeTab === 'duplicates') {
      void loadDuplicates();
    }
  }, [activeTab, loadDuplicates]);

  const handleResolveDuplicate = async (
    candidateId: string,
    resolution: 'confirmed_duplicate' | 'not_duplicate'
  ) => {
    try {
      await patientsService.resolveDuplicate(
        candidateId,
        resolution,
        resolveNote.trim() || `Marked ${resolution} by operator`
      );
      showToast(`Duplicate candidate marked as ${resolution}.`);
      await loadDuplicates();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to resolve duplicate.');
    }
  };

  const handleMergeDuplicate = async (cand: DuplicateCandidate) => {
    const survivor = cand.primaryPatient || cand.patientA;
    const merged = cand.duplicatePatient || cand.patientB;
    if (!survivor?.id || !merged?.id) {
      showToast('Survivor and duplicate patient IDs are required to merge.');
      return;
    }
    try {
      await patientsService.mergeDuplicates(
        survivor.id,
        merged.id,
        mergeReason.trim() || 'Confirmed duplicate patient record merge',
        cand.id
      );
      showToast('Duplicate patient records merged.');
      await loadDuplicates();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to merge duplicate records.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">
            Patient identity lookup, caregivers & deduplication
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navPatients}</h1>
          <p className="mt-1 text-sm text-slate">
            Search operational records, manage legal representatives, and resolve duplicate patient profiles.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsRegisterOpen(true)} icon={<PhPlus size={16} />}>
          Register Patient
        </Button>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <SegmentedTabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as 'lookup' | 'duplicates')}
          options={[
            { key: 'lookup', label: 'Identity Lookup & Registration', count: results.length },
            { key: 'duplicates', label: 'Duplicate Resolution', count: duplicates.length },
          ]}
        />
      </div>

      {activeTab === 'lookup' ? (
        <>
          <Card variant="card" className="mb-5">
            <form onSubmit={lookup} className="flex flex-wrap items-center gap-3">
              <PhMagnifyingGlass size={18} color="#1D6B66" />
              <select
                value={lookupKind}
                onChange={(event) => setLookupKind(event.target.value as LookupKind)}
                className="h-11 rounded-xl border border-line bg-paper px-3 text-sm"
              >
                <option value="phone">Phone number</option>
                <option value="healora_code">Healora ID</option>
                <option value="appointment_code">Appointment code</option>
                <option value="identifier">Government / Card Identifier</option>
              </select>
              {lookupKind === 'identifier' && (
                <select
                  value={identifierType}
                  onChange={(e) => setIdentifierType(e.target.value as IdentifierKind)}
                  className="h-11 rounded-xl border border-line bg-paper px-3 text-sm"
                >
                  <option value="national_id">National ID (NID)</option>
                  <option value="birth_registration">Birth Registration</option>
                  <option value="passport">Passport</option>
                  <option value="healora_card">Healora Card</option>
                  <option value="other">Other</option>
                </select>
              )}
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                required
                placeholder="Enter exact identifier"
                className="h-11 min-w-56 flex-1 rounded-xl border border-line px-3 text-sm"
              />
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? 'Searching…' : 'Search API'}
              </Button>
            </form>
          </Card>

          {appointment && (
            <Card variant="card" className="mb-5">
              <h2 className="mt-0 text-base font-semibold text-ink">Matching appointment</h2>
              <p className="text-sm text-slate">
                Code: {appointment.code} · Status: {appointment.status}
              </p>
              <label className="mb-3 flex items-center gap-2 text-sm text-slate">
                <input
                  type="checkbox"
                  checked={identityConfirmed}
                  onChange={(event) => setIdentityConfirmed(event.target.checked)}
                />
                I confirmed the patient identity against the appointment.
              </label>
              <Button
                variant="primary"
                disabled={!identityConfirmed}
                onClick={() => void checkInAppointment(appointment.id)}
              >
                Check in through API
              </Button>
            </Card>
          )}

          <Card variant="card" className="p-0! overflow-hidden">
            {results.length === 0 ? (
              <p className="m-0 p-6 text-sm text-slate">
                Run a patient lookup or register a new patient to display backend records.
              </p>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-bone text-xs uppercase text-slate">
                    <th className="px-5 py-3">Healora ID</th>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Age / Sex</th>
                    <th className="px-5 py-3">Phone</th>
                    <th className="px-5 py-3">Record & Caregivers</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((patient) => (
                    <tr key={patient.id} className="border-b border-line text-sm">
                      <td className="px-5 py-4 font-mono">{patient.healoraCode}</td>
                      <td className="px-5 py-4">{patient.fullName}</td>
                      <td className="px-5 py-4">
                        {patient.age ?? '—'} / {patient.sex}
                      </td>
                      <td className="px-5 py-4">{patient.maskedPhone ?? patient.phone ?? '—'}</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          className="cursor-pointer font-semibold text-teal hover:underline"
                          onClick={() => void loadPatientInspector(patient)}
                        >
                          Inspect Profile & Caregivers
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      ) : (
        /* Duplicates Tab */
        <div className="space-y-4">
          <Card variant="card" className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate">Status Filter:</span>
                <select
                  value={dupStatusFilter}
                  onChange={(e) =>
                    setDupStatusFilter(e.target.value as 'open' | 'confirmed_duplicate' | 'not_duplicate')
                  }
                  className="h-9 rounded-lg border border-line bg-paper px-2.5 text-xs"
                >
                  <option value="open">Open Candidates</option>
                  <option value="confirmed_duplicate">Confirmed Duplicates</option>
                  <option value="not_duplicate">Resolved (Not Duplicate)</option>
                </select>
                <input
                  type="text"
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  placeholder="Resolution note..."
                  className="h-9 rounded-lg border border-line px-2.5 text-xs"
                />
                <input
                  type="text"
                  value={mergeReason}
                  onChange={(e) => setMergeReason(e.target.value)}
                  placeholder="Merge reason..."
                  className="h-9 rounded-lg border border-line px-2.5 text-xs"
                />
              </div>
              <Button variant="small" onClick={() => void loadDuplicates()} icon={<PhArrowsClockwise size={14} />}>
                Refresh
              </Button>
            </div>
          </Card>

          {loadingDuplicates ? (
            <Card variant="card">
              <p className="m-0 text-sm text-slate">Loading duplicate candidates...</p>
            </Card>
          ) : duplicates.length === 0 ? (
            <Card variant="card">
              <p className="m-0 text-sm text-slate">No duplicate patient candidates in this state.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {duplicates.map((cand) => {
                const pA = cand.primaryPatient || cand.patientA;
                const pB = cand.duplicatePatient || cand.patientB;
                return (
                  <Card key={cand.id} variant="card">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <StatusPill label={cand.status || 'open'} variant="upcoming" />
                          {cand.confidenceScore != null && (
                            <span className="text-xs font-semibold text-teal">
                              Match Score: {cand.confidenceScore}%
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-ink">
                          <strong>Survivor (Primary):</strong> {pA?.fullName || 'Unknown'} (
                          <span className="font-mono">{pA?.healoraCode || pA?.id || '—'}</span>)
                        </div>
                        <div className="text-sm text-ink">
                          <strong>Candidate Duplicate:</strong> {pB?.fullName || 'Unknown'} (
                          <span className="font-mono">{pB?.healoraCode || pB?.id || '—'}</span>)
                        </div>
                        {(cand.reason || cand.matchReason) && (
                          <div className="mt-1 text-xs text-slate">Reason: {cand.reason || cand.matchReason}</div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="small"
                          onClick={() => void handleResolveDuplicate(cand.id, 'confirmed_duplicate')}
                        >
                          Confirm Duplicate
                        </Button>
                        <Button
                          variant="small"
                          onClick={() => void handleResolveDuplicate(cand.id, 'not_duplicate')}
                        >
                          Not Duplicate
                        </Button>
                        <Button variant="primary" onClick={() => void handleMergeDuplicate(cand)}>
                          Merge Records
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Register Patient Modal */}
      <ModalSheet
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register Operational Patient"
      >
        <form onSubmit={handleRegisterPatient} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate">
              Full Name *
              <input
                required
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-slate">
              Full Name (Bangla)
              <input
                value={regNameBn}
                onChange={(e) => setRegNameBn(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
              />
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <label className="block text-xs font-semibold text-slate">
              Phone *
              <input
                required
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-slate">
              Sex *
              <select
                value={regSex}
                onChange={(e) => setRegSex(e.target.value as 'male' | 'female' | 'other')}
                className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm font-normal"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate">
              Age (Years)
              <input
                type="number"
                min={0}
                max={120}
                value={regAge}
                onChange={(e) => setRegAge(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate">
              National ID (Optional)
              <input
                value={regNationalId}
                onChange={(e) => setRegNationalId(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-slate">
              Region
              <select
                value={regRegionId}
                onChange={(e) => setRegRegionId(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm font-normal"
              >
                <option value="">Select region...</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-xs font-semibold text-slate">
            Address Line
            <input
              value={regAddress}
              onChange={(e) => setRegAddress(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsRegisterOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Register Patient
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Patient Inspector Modal */}
      <ModalSheet
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={`Patient Record: ${livePatient?.fullName || selectedPatient?.fullName || ''}`}
        subtitle={`Healora ID: ${livePatient?.healoraCode || selectedPatient?.healoraCode || ''}`}
      >
        {selectedPatient && (
          <div className="space-y-4">
            <SegmentedTabs
              activeKey={patientTab}
              onChange={(k) => setPatientTab(k as 'profile' | 'identifiers' | 'representatives')}
              options={[
                { key: 'profile', label: 'Demographics' },
                { key: 'identifiers', label: 'Attach ID' },
                { key: 'representatives', label: 'Caregivers', count: representatives.length },
              ]}
            />

            {patientFeedback && (
              <div className="rounded-xl bg-mist p-2.5 text-xs font-medium text-pine">{patientFeedback}</div>
            )}

            {patientTab === 'profile' && (
              <div className="space-y-2 rounded-xl bg-bone p-4 text-sm text-slate">
                <div>
                  Patient ID: <span className="font-mono text-ink">{(livePatient || selectedPatient).id}</span>
                </div>
                <div>
                  Healora ID: <strong className="text-ink">{(livePatient || selectedPatient).healoraCode}</strong>
                </div>
                <div>Name: {(livePatient || selectedPatient).fullName}</div>
                {(livePatient || selectedPatient).fullNameBn && (
                  <div>Name (Bangla): {(livePatient || selectedPatient).fullNameBn}</div>
                )}
                <div>Phone: {(livePatient || selectedPatient).maskedPhone ?? 'Not returned'}</div>
                <div>Date of birth: {(livePatient || selectedPatient).dateOfBirth ?? 'Not returned'}</div>
                <div>Registered hub ID: {(livePatient || selectedPatient).registeredHubId ?? 'Not returned'}</div>
                <div>Status: {(livePatient || selectedPatient).status ?? 'active'}</div>
              </div>
            )}

            {patientTab === 'identifiers' && (
              <form onSubmit={handleAddIdentifier} className="space-y-3 rounded-xl bg-bone p-4">
                <div className="text-xs font-semibold text-ink">Attach Government or Health Card Identifier</div>
                <select
                  value={newIdType}
                  onChange={(e) => setNewIdType(e.target.value as IdentifierKind)}
                  className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-xs"
                >
                  <option value="national_id">National ID (NID)</option>
                  <option value="birth_registration">Birth Registration</option>
                  <option value="passport">Passport</option>
                  <option value="healora_card">Healora Card</option>
                  <option value="other">Other</option>
                </select>
                <input
                  type="text"
                  required
                  value={newIdValue}
                  onChange={(e) => setNewIdValue(e.target.value)}
                  placeholder="Identifier number..."
                  className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-xs"
                />
                <div className="flex justify-end">
                  <Button variant="small" type="submit">
                    Attach Identifier
                  </Button>
                </div>
              </form>
            )}

            {patientTab === 'representatives' && (
              <div className="space-y-3">
                <form onSubmit={handleAddRepresentative} className="space-y-2 rounded-xl bg-bone p-3">
                  <div className="text-xs font-semibold text-ink">Add Family Caregiver / Legal Representative</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={repName}
                      onChange={(e) => setRepName(e.target.value)}
                      placeholder="Representative full name *"
                      className="h-8 rounded-lg border border-line bg-paper px-2.5 text-xs"
                    />
                    <input
                      type="text"
                      value={repPhone}
                      onChange={(e) => setRepPhone(e.target.value)}
                      placeholder="Phone (optional)"
                      className="h-8 rounded-lg border border-line bg-paper px-2.5 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={repRelation}
                      onChange={(e) =>
                        setRepRelation(e.target.value as ApiPatientRepresentative['relationship'])
                      }
                      className="h-8 rounded-lg border border-line bg-paper px-2 text-xs"
                    >
                      <option value="parent">Parent</option>
                      <option value="legal_guardian">Legal Guardian</option>
                      <option value="spouse">Spouse</option>
                      <option value="child">Child</option>
                      <option value="sibling">Sibling</option>
                      <option value="other_relative">Other Relative</option>
                      <option value="authorised_carer">Authorised Carer</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={repLegalBasis}
                      onChange={(e) => setRepLegalBasis(e.target.value)}
                      placeholder="Legal basis *"
                      className="h-8 rounded-lg border border-line bg-paper px-2.5 text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="small" type="submit">
                      Add Representative
                    </Button>
                  </div>
                </form>

                <input
                  type="text"
                  value={repRevokeReason}
                  onChange={(e) => setRepRevokeReason(e.target.value)}
                  placeholder="Revocation reason (if revoking)"
                  className="h-8 w-full rounded-lg border border-line px-2.5 text-xs"
                />

                {representatives.length === 0 ? (
                  <div className="text-xs text-slate">No representatives registered for this patient.</div>
                ) : (
                  <div className="space-y-1.5">
                    {representatives.map((rep) => (
                      <div
                        key={rep.id}
                        className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-ink">
                            {rep.fullName} ({rep.relationship.replace('_', ' ')})
                          </div>
                          <div className="text-[11px] text-slate">
                            Basis: {rep.legalBasis} • Verified: {rep.verified ? 'Yes' : 'No'}
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          {!rep.verified && !rep.revoked && (
                            <button
                              type="button"
                              onClick={() => void handleVerifyRep(rep.id)}
                              className="cursor-pointer rounded bg-teal px-2 py-1 text-[11px] font-semibold text-white"
                            >
                              Verify
                            </button>
                          )}
                          {!rep.revoked ? (
                            <button
                              type="button"
                              onClick={() => void handleRevokeRep(rep.id)}
                              className="cursor-pointer rounded border border-bad/40 px-2 py-1 text-[11px] font-semibold text-bad"
                            >
                              Revoke
                            </button>
                          ) : (
                            <StatusPill label="REVOKED" variant="cancelled" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ModalSheet>
    </div>
  );
};
