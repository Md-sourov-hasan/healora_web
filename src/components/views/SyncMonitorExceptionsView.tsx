import React, { useState } from 'react';
import {
  PhArrowsClockwise,
  PhCheckCircle,
  PhCloudCheck,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
import type { Encounter } from '../../types';

const thClass = 'px-5 py-3.5 text-xs font-semibold uppercase text-slate';

export const SyncMonitorExceptionsView: React.FC = () => {
  const {
    t,
    language,
    encounters,
    selectedHubId,
    retrySyncEncounter,
    showToast,
  } = useApp();

  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);

  const hubEncounters = encounters.filter((e) => e.hubId === selectedHubId);
  const pendingSyncCount = hubEncounters.filter((e) => e.syncState !== 'synced').length;
  const reviewPendingCount = hubEncounters.filter((e) => e.status === 'submitted_for_review').length;

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.04em] text-teal">
              {language === 'bn' ? 'অফলাইন সিঙ্ক ও ক্লিনিক্যাল এক্সেপশন' : 'MOBILE SYNC & CLINICAL HANDOVER'}
            </span>
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navExceptions}
          </h1>
          <p className="mt-1 text-sm text-slate">
            {t.offlineNotice}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => {
            const pending = hubEncounters.find((e) => e.syncState !== 'synced');
            if (pending) {
              retrySyncEncounter(pending.id);
            } else {
              showToast('All local encounters already synchronized with canonical record.');
            }
          }}
          icon={<PhArrowsClockwise size={16} />}
        >
          {t.retrySync}
        </Button>
      </div>

      {/* Sync Health Stat Cards 3-up (Design System 7.6) */}
      <div className="mb-7 grid grid-cols-3 gap-5">
        <Card variant="card">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">Mobile Outbox Pending</span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-chip ${
                pendingSyncCount > 0 ? 'bg-warn-bg text-warn-fg' : 'bg-ok-bg text-ok-fg'
              }`}
            >
              <PhArrowsClockwise size={18} />
            </div>
          </div>
          <div className={`tabular-nums text-[32px] font-semibold ${pendingSyncCount > 0 ? 'text-warn' : 'text-ok'}`}>
            {pendingSyncCount}
          </div>
          <div className="mt-1.5 text-xs text-slate">
            Idempotent local outbox queued for retry
          </div>
        </Card>

        <Card variant="card">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">Doctor Review Queue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-chip bg-mist text-teal">
              <PhCheckCircle size={18} />
            </div>
          </div>
          <div className="tabular-nums text-[32px] font-semibold text-ink">
            {reviewPendingCount}
          </div>
          <div className="mt-1.5 text-xs text-slate">
            Encounter vitals ready for clinical evaluation
          </div>
        </Card>

        <Card variant="card">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">Sync Reliability Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-chip bg-sage-200 text-pine">
              <PhCloudCheck size={18} />
            </div>
          </div>
          <div className="tabular-nums text-[32px] font-semibold text-ok">
            99.4%
          </div>
          <div className="mt-1.5 text-xs text-slate">
            Zero observation data loss recorded
          </div>
        </Card>
      </div>

      {/* Encounters & Sync States Table */}
      <Card variant="card" className="p-0! overflow-hidden">
        <table className="w-full border-collapse text-left font-ui">
          <thead>
            <tr className="border-b border-line bg-bone">
              <th className={thClass}>
                Encounter Code
              </th>
              <th className={thClass}>
                Patient
              </th>
              <th className={thClass}>
                Field Worker Assigned
              </th>
              <th className={thClass}>
                Sync State
              </th>
              <th className={thClass}>
                Completeness
              </th>
              <th className={thClass}>
                Clinical Disposition
              </th>
              <th className={`${thClass} text-right`}>
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {hubEncounters.map((enc, idx) => (
              <tr
                key={enc.id}
                className={`transition-colors duration-100 hover:bg-bone ${
                  idx === hubEncounters.length - 1 ? '' : 'border-b border-line'
                }`}
              >
                {/* Code & Idempotency Key */}
                <td className="px-5 py-4">
                  <div className="text-sm font-bold text-ink">
                    {enc.encounterCode}
                  </div>
                  <div className="tabular-nums text-[11px] text-slate">
                    Key: {enc.idempotencyKey.slice(0, 18)}...
                  </div>
                </td>

                {/* Patient */}
                <td className="px-5 py-4">
                  <div className="text-[15px] font-semibold text-ink">
                    {language === 'bn' ? enc.patientNameBn : enc.patientName}
                  </div>
                  <div className="text-xs text-slate">
                    Opened: {enc.openedAt}
                  </div>
                </td>

                {/* Field Worker */}
                <td className="px-5 py-4 text-sm text-ink">
                  {enc.assignedWorkerName}
                </td>

                {/* Sync State */}
                <td className="px-5 py-4">
                  <div className="flex flex-col gap-1">
                    <StatusPill
                      label={
                        enc.syncState === 'synced'
                          ? 'Server Acknowledged'
                          : enc.syncState === 'retrying'
                            ? 'Retrying Sync...'
                            : 'Pending Local Outbox'
                      }
                      variant={
                        enc.syncState === 'synced'
                          ? 'completed'
                          : enc.syncState === 'retrying'
                            ? 'upcoming'
                            : 'awaiting'
                      }
                    />
                    <span className="text-[11px] text-slate">
                      {enc.lastSyncAttempt}
                    </span>
                  </div>
                </td>

                {/* Completeness */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums text-[13px] font-semibold">
                      {enc.completenessPercentage}%
                    </span>
                    <div className="h-1.5 w-15 overflow-hidden rounded-full bg-sage-200">
                      <div
                        className={`h-full ${enc.completenessPercentage === 100 ? 'bg-ok' : 'bg-teal'}`}
                        style={{ width: `${enc.completenessPercentage}%` }}
                      />
                    </div>
                  </div>
                  {enc.missingObservationsCount > 0 && (
                    <div className="mt-0.5 text-[11px] text-warn">
                      {enc.missingObservationsCount} required value pending
                    </div>
                  )}
                </td>

                {/* Clinical Review State */}
                <td className="px-5 py-4">
                  <StatusPill
                    label={enc.status.replace(/_/g, ' ')}
                    variant={
                      enc.status === 'completed'
                        ? 'completed'
                        : enc.status === 'submitted_for_review'
                          ? 'awaiting'
                          : 'upcoming'
                    }
                  />
                  {enc.reviewingDoctorName && (
                    <div className="mt-0.5 text-[11px] text-slate">
                      Reviewer: {enc.reviewingDoctorName}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedEncounter(enc)}
                      className="cursor-pointer rounded-lg border border-line bg-paper px-3 py-1.5 text-[13px] font-semibold text-teal"
                    >
                      Audit
                    </button>
                    {enc.syncState !== 'synced' && (
                      <button
                        type="button"
                        onClick={() => retrySyncEncounter(enc.id)}
                        className="cursor-pointer rounded-lg border-none bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Sync Now
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Audit Drawer */}
      {selectedEncounter && (
        <ModalSheet
          isOpen={!!selectedEncounter}
          onClose={() => setSelectedEncounter(null)}
          title={`Encounter Audit: ${selectedEncounter.encounterCode}`}
          subtitle={`Patient: ${selectedEncounter.patientName} • Assigned: ${selectedEncounter.assignedWorkerName}`}
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-ctl bg-bone p-4">
              <div className="mb-1.5 text-[13px] font-semibold text-ink">
                Idempotency &amp; Server Provenance (PRD Section 10.6)
              </div>
              <div className="text-[13px] leading-[1.6] text-slate">
                • <strong>Idempotency Key:</strong> {selectedEncounter.idempotencyKey}
                <br />
                • <strong>Sync Status:</strong> {selectedEncounter.syncState.toUpperCase()}
                <br />
                • <strong>Client Timestamp:</strong> {selectedEncounter.openedAt}
                <br />
                • <strong>Attributed Performer:</strong> {selectedEncounter.assignedWorkerName}
              </div>
            </div>

            <div className="rounded-ctl border border-sage-200 bg-paper p-4">
              <div className="mb-2 text-[13px] font-semibold text-pine">
                Captured Structured Observations:
              </div>
              {selectedEncounter.observations.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {selectedEncounter.observations.map((obs) => (
                    <div
                      key={obs.code}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                        obs.isAbnormal ? 'bg-warn-bg' : 'bg-bone'
                      }`}
                    >
                      <span className="text-[13px] font-medium text-ink">
                        {obs.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`tabular-nums text-sm font-bold ${obs.isAbnormal ? 'text-clay' : 'text-ink'}`}>
                          {obs.value} {obs.unit}
                        </span>
                        {obs.deviceId && (
                          <span className="text-[11px] text-slate">
                            ({obs.deviceId})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[13px] text-slate">
                  No observations uploaded yet (Task currently in progress on mobile team app).
                </div>
              )}
            </div>

            {selectedEncounter.dispositionNotes && (
              <div className="rounded-xl bg-mist p-3.5 text-[13px] text-pine">
                <strong>Local Doctor Assessment Note:</strong> {selectedEncounter.dispositionNotes}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedEncounter(null)}>
                Close
              </Button>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
