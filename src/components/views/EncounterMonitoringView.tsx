import React, { useState } from 'react';
import {
  PhArrowsClockwise,
  PhShieldCheck,
  PhMagnifyingGlass,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { Encounter, SyncState } from '../../types';

export const EncounterMonitoringView: React.FC = () => {
  const {
    t,
    language,
    encounters,
    selectedHubId,
    hubs,
    staff,
    retrySyncEncounter,
    reassignEncounter,
    showToast,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [syncFilter, setSyncFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [newAssignedStaff, setNewAssignedStaff] = useState('');

  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];
  const hubEncounters = encounters.filter((e) => e.hubId === selectedHubId);

  const filtered = hubEncounters.filter((enc) => {
    const matchStatus = statusFilter === 'all' || enc.status === statusFilter;
    const matchSync = syncFilter === 'all' || enc.syncState === syncFilter;
    const matchSearch =
      enc.patientName.toLowerCase().includes(search.toLowerCase()) ||
      enc.patientNameBn.includes(search) ||
      enc.encounterCode.toLowerCase().includes(search.toLowerCase()) ||
      enc.assignedWorkerName.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSync && matchSearch;
  });

  const getSyncStateBadge = (sync: SyncState) => {
    switch (sync) {
      case 'synced':
        return <StatusPill label="ACKNOWLEDGED (SYNCED)" variant="completed" />;
      case 'pending_local':
        return <StatusPill label="LOCAL OUTBOX PENDING" variant="upcoming" />;
      case 'retrying':
        return <StatusPill label="RETRYING SYNC..." variant="draft" />;
      case 'sync_failed':
        return <StatusPill label="SYNC FAILED" variant="cancelled" />;
      default:
        return <StatusPill label={sync} variant="draft" />;
    }
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEncounter || !newAssignedStaff) return;
    reassignEncounter(selectedEncounter.id, newAssignedStaff);
    setIsReassignOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'ক্লিনিক্যাল এনকাউন্টার পর্যবেক্ষণ' : 'CLINICAL ENCOUNTER MONITORING'}
            </span>
            <span className="size-2 animate-pulse-live rounded-full bg-ok" />
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navEncounters}
          </h1>
          <p className="mt-1 mb-0 text-sm text-slate">
            {currentHub?.name || 'Healora Hub'} • {language === 'bn'
              ? 'মোবাইল অ্যাপে রেকর্ডকৃত পরিমাপের সমাপ্তি হার, সেন্ট্রাল সিঙ্ক স্বীকৃতি ও ডাক্তার রিভিউ স্থিতি'
              : 'Operational status, mobile capture completeness, idempotency keys & central backend sync states'}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => showToast('Encounter operational status refreshed.')}
          icon={<PhArrowsClockwise size={16} />}
        >
          {language === 'bn' ? 'রিফ্রেশ' : 'Refresh Encounters'}
        </Button>
      </div>

      {/* PRD Boundary Guard Notice (PRD Section 1.1 & 8.10) */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sage-200 bg-mist px-5 py-3.5 text-[13px] text-pine">
        <PhShieldCheck size={20} color="#1D6B66" />
        <div className="flex-1">
          <strong>Architectural Rule (PRD 5.2 &amp; 8.10):</strong> The hub website displays operational progress and completeness metadata. It is not an alternate medical record or clinical editor. Hub managers and receptionists cannot alter clinical values or complete medical reviews on behalf of doctors.
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="mb-7 grid grid-cols-4 gap-4">
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Total Encounters Today</div>
          <div className="mt-1 text-3xl font-bold text-ink">{hubEncounters.length}</div>
          <div className="mt-1 text-xs text-teal">Active patient care interactions</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Server Acknowledged (Synced)</div>
          <div className="mt-1 text-3xl font-bold text-ok">
            {hubEncounters.filter((e) => e.syncState === 'synced').length}
          </div>
          <div className="mt-1 text-xs text-slate">Stored in canonical patient timeline</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Doctor Review Queue</div>
          <div className="mt-1 text-3xl font-bold text-pine">
            {hubEncounters.filter((e) => e.status === 'submitted_for_review').length}
          </div>
          <div className="mt-1 text-xs text-slate">Awaiting local doctor evaluation</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Pending Mobile Outbox</div>
          <div className="mt-1 text-3xl font-bold text-amber">
            {hubEncounters.filter((e) => e.syncState !== 'synced').length}
          </div>
          <div className="mt-1 text-xs text-amber font-semibold">Offline captures awaiting sync</div>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-line bg-paper px-4 py-2.5 shadow-2xs">
          <PhMagnifyingGlass size={18} color="#1D6B66" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search encounter code, patient name, or assigned health worker..."
            className="flex-1 border-none bg-transparent font-ui text-sm text-ink outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs"
          >
            <option value="all">All States</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="submitted_for_review">Submitted for Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="completed">Completed</option>
          </select>

          <span className="font-semibold text-slate ml-2">Sync:</span>
          <select
            value={syncFilter}
            onChange={(e) => setSyncFilter(e.target.value)}
            className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs"
          >
            <option value="all">All Sync</option>
            <option value="synced">Synced Only</option>
            <option value="pending_local">Pending Local Outbox</option>
            <option value="sync_failed">Sync Failed</option>
          </select>
        </div>
      </div>

      {/* Encounter Table */}
      <Card variant="card" className="p-0! overflow-hidden">
        <table className="w-full border-collapse text-left font-ui">
          <thead>
            <tr className="border-b border-line bg-bone">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Encounter Code</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Patient Name</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Assigned Care Team</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Completeness</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Sync Status</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Clinical Review</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate">
                  <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-mist text-teal">
                    <PhShieldCheck size={24} />
                  </div>
                  <p className="font-semibold text-ink">No encounters recorded</p>
                  <p className="text-xs text-slate">Encounters initiated by field health workers and reception staff will be tracked here in real time.</p>
                </td>
              </tr>
            ) : (
              filtered.map((enc) => (
              <tr key={enc.id} className="transition-colors hover:bg-mist/30">
                <td className="px-5 py-4">
                  <div className="font-mono text-xs font-bold text-teal">{enc.encounterCode}</div>
                  <div className="text-[11px] text-slate">Opened: {enc.openedAt}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-ink">{language === 'bn' ? enc.patientNameBn : enc.patientName}</div>
                  <div className="font-mono text-xs text-slate">{enc.patientId}</div>
                </td>
                <td className="px-5 py-4 text-xs">
                  <div>HW: <strong className="text-ink">{enc.assignedWorkerName}</strong></div>
                  {enc.reviewingDoctorName && (
                    <div className="text-slate">Review: {enc.reviewingDoctorName}</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-line">
                      <div
                        className={`h-full ${enc.completenessPercentage === 100 ? 'bg-ok' : 'bg-amber'}`}
                        style={{ width: `${enc.completenessPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-ink">{enc.completenessPercentage}%</span>
                  </div>
                  {enc.missingObservationsCount > 0 && (
                    <div className="text-[11px] font-semibold text-amber">
                      {enc.missingObservationsCount} protocol items missing
                    </div>
                  )}
                </td>
                <td className="px-5 py-4">
                  {getSyncStateBadge(enc.syncState)}
                  <div className="text-[11px] text-slate mt-0.5">{enc.lastSyncAttempt}</div>
                </td>
                <td className="px-5 py-4">
                  <StatusPill
                    label={enc.status.replace(/_/g, ' ').toUpperCase()}
                    variant={enc.status === 'completed' || enc.status === 'reviewed' ? 'completed' : 'active'}
                  />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEncounter(enc)}
                      className="cursor-pointer text-xs font-semibold text-teal hover:underline"
                    >
                      Inspect
                    </button>
                    {enc.syncState !== 'synced' && (
                      <button
                        type="button"
                        onClick={() => retrySyncEncounter(enc.id)}
                        className="cursor-pointer rounded-md bg-warn-bg px-2 py-1 text-xs font-bold text-warn-fg"
                      >
                        Retry Sync
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Drawer: Encounter Inspector */}
      {selectedEncounter && !isReassignOpen && (
        <ModalSheet
          isOpen={!!selectedEncounter}
          onClose={() => setSelectedEncounter(null)}
          title={`Encounter Inspector: ${selectedEncounter.encounterCode}`}
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-teal">{selectedEncounter.encounterCode}</span>
                {getSyncStateBadge(selectedEncounter.syncState)}
              </div>
              <div className="mt-2 text-sm text-ink">
                Patient: <strong>{selectedEncounter.patientName}</strong> ({selectedEncounter.patientId})
              </div>
              <div className="text-xs text-slate">
                Assigned Health Worker: <strong>{selectedEncounter.assignedWorkerName}</strong>
              </div>
              <div className="text-xs text-slate">
                Idempotency Key: <span className="font-mono">{selectedEncounter.idempotencyKey}</span>
              </div>
            </div>

            {/* Read-only Observations Summary */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="m-0 text-xs font-bold uppercase tracking-wider text-slate">
                  Mobile Submitted Observations ({selectedEncounter.observations.length})
                </h4>
                <span className="text-[11px] text-teal font-semibold">Attested via Special Team App</span>
              </div>

              {selectedEncounter.observations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-slate">
                  No vitals observations submitted yet for this encounter.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEncounter.observations.map((obs, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between rounded-xl border p-3 text-xs ${
                        obs.isAbnormal ? 'border-amber/50 bg-amber-50/50' : 'border-line bg-paper'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-ink">{obs.name}</div>
                        <div className="text-slate">
                          Time: {obs.measuredAt} • Device: <span className="font-mono text-teal">{obs.deviceId || 'Attributed'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-base font-bold ${obs.isAbnormal ? 'text-bad' : 'text-ink'}`}>
                          {obs.value} <span className="text-xs font-normal text-slate">{obs.unit}</span>
                        </div>
                        {obs.isAbnormal && (
                          <span className="rounded bg-bad-bg px-1.5 py-0.5 text-[10px] font-bold text-bad-fg">
                            Flagged for Review
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedEncounter.dispositionNotes && (
              <div className="rounded-xl bg-mist p-3.5 text-xs text-pine">
                <strong>Local Doctor Assessment / Disposition:</strong>
                <p className="mt-1 mb-0">{selectedEncounter.dispositionNotes}</p>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setIsReassignOpen(true)}
                className="w-full"
              >
                Reassign to Different Worker
              </Button>
              {selectedEncounter.syncState !== 'synced' && (
                <Button
                  variant="primary"
                  onClick={() => {
                    retrySyncEncounter(selectedEncounter.id);
                    setSelectedEncounter(null);
                  }}
                  className="w-full"
                >
                  Retry Sync Now
                </Button>
              )}
            </div>
          </div>
        </ModalSheet>
      )}

      {/* Modal: Reassign Worker */}
      <ModalSheet
        isOpen={isReassignOpen}
        onClose={() => setIsReassignOpen(false)}
        title="Reassign Encounter to Qualified Staff"
      >
        <form onSubmit={handleReassignSubmit} className="space-y-4">
          <div className="text-xs text-slate">
            Select a verified health worker or doctor present at this hub to take over encounter <strong className="text-ink">{selectedEncounter?.encounterCode}</strong>.
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Select Assigned Staff Member</label>
            <select
              required
              value={newAssignedStaff}
              onChange={(e) => setNewAssignedStaff(e.target.value)}
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            >
              <option value="">Select staff...</option>
              {staff
                .filter((s) => s.role === 'field_health_worker' || s.role === 'local_doctor')
                .map((s) => (
                  <option key={s.id} value={`${s.fullName} (${s.roleTitle})`}>
                    {s.fullName} — {s.roleTitle}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsReassignOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Confirm Reassignment</Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
