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
import { useApp } from '../../context/AppContext';
import type { Encounter } from '../../types';

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
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'bn' ? 'অফলাইন সিঙ্ক ও ক্লিনিক্যাল এক্সেপশন' : 'MOBILE SYNC & CLINICAL HANDOVER'}
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 600,
              color: '#0B1F22',
              fontFamily: 'var(--ui)',
            }}
          >
            {t.navExceptions}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#5B6B6E', fontSize: '14px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
        <Card variant="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E' }}>Mobile Outbox Pending</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: pendingSyncCount > 0 ? '#F8EDD8' : '#E3F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pendingSyncCount > 0 ? '#80540F' : '#22643F' }}>
              <PhArrowsClockwise size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: pendingSyncCount > 0 ? '#B7791F' : '#2F855A' }} className="num-tabular">
            {pendingSyncCount}
          </div>
          <div style={{ fontSize: '12px', color: '#5B6B6E', marginTop: '6px' }}>
            Idempotent local outbox queued for retry
          </div>
        </Card>

        <Card variant="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E' }}>Doctor Review Queue</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#E6EEEA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D6B66' }}>
              <PhCheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#0B1F22' }} className="num-tabular">
            {reviewPendingCount}
          </div>
          <div style={{ fontSize: '12px', color: '#5B6B6E', marginTop: '6px' }}>
            Encounter vitals ready for clinical evaluation
          </div>
        </Card>

        <Card variant="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E' }}>Sync Reliability Rate</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#CFE0D8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3D3A' }}>
              <PhCloudCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#2F855A' }} className="num-tabular">
            99.4%
          </div>
          <div style={{ fontSize: '12px', color: '#5B6B6E', marginTop: '6px' }}>
            Zero observation data loss recorded
          </div>
        </Card>
      </div>

      {/* Encounters & Sync States Table */}
      <Card variant="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--ui)' }}>
          <thead>
            <tr style={{ backgroundColor: '#F5F3EE', borderBottom: '1px solid #DDE5E1' }}>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Encounter Code
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Patient
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Field Worker Assigned
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Sync State
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Completeness
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Clinical Disposition
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase', textAlign: 'right' }}>
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {hubEncounters.map((enc, idx) => (
              <tr
                key={enc.id}
                style={{
                  borderBottom: idx === hubEncounters.length - 1 ? 'none' : '1px solid #DDE5E1',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F3EE')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Code & Idempotency Key */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: '#0B1F22' }}>
                    {enc.encounterCode}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5B6B6E' }} className="num-tabular">
                    Key: {enc.idempotencyKey.slice(0, 18)}...
                  </div>
                </td>

                {/* Patient */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#0B1F22' }}>
                    {language === 'bn' ? enc.patientNameBn : enc.patientName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5B6B6E' }}>
                    Opened: {enc.openedAt}
                  </div>
                </td>

                {/* Field Worker */}
                <td style={{ padding: '16px 20px', fontSize: '14px', color: '#0B1F22' }}>
                  {enc.assignedWorkerName}
                </td>

                {/* Sync State */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                    <span style={{ fontSize: '11px', color: '#5B6B6E' }}>
                      {enc.lastSyncAttempt}
                    </span>
                  </div>
                </td>

                {/* Completeness */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="num-tabular" style={{ fontWeight: 600, fontSize: '13px' }}>
                      {enc.completenessPercentage}%
                    </span>
                    <div style={{ width: '60px', height: '6px', borderRadius: '9999px', backgroundColor: '#CFE0D8', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${enc.completenessPercentage}%`,
                          height: '100%',
                          backgroundColor: enc.completenessPercentage === 100 ? '#2F855A' : '#1D6B66',
                        }}
                      />
                    </div>
                  </div>
                  {enc.missingObservationsCount > 0 && (
                    <div style={{ fontSize: '11px', color: '#B7791F', marginTop: '2px' }}>
                      {enc.missingObservationsCount} required value pending
                    </div>
                  )}
                </td>

                {/* Clinical Review State */}
                <td style={{ padding: '16px 20px' }}>
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
                    <div style={{ fontSize: '11px', color: '#5B6B6E', marginTop: '2px' }}>
                      Reviewer: {enc.reviewingDoctorName}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedEncounter(enc)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: '1px solid #DDE5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#1D6B66',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Audit
                    </button>
                    {enc.syncState !== 'synced' && (
                      <button
                        type="button"
                        onClick={() => retrySyncEncounter(enc.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: '#0B1F22',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F5F3EE', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F22', marginBottom: '6px' }}>
                Idempotency &amp; Server Provenance (PRD Section 10.6)
              </div>
              <div style={{ fontSize: '13px', color: '#5B6B6E', lineHeight: 1.6 }}>
                • <strong>Idempotency Key:</strong> {selectedEncounter.idempotencyKey}
                <br />
                • <strong>Sync Status:</strong> {selectedEncounter.syncState.toUpperCase()}
                <br />
                • <strong>Client Timestamp:</strong> {selectedEncounter.openedAt}
                <br />
                • <strong>Attributed Performer:</strong> {selectedEncounter.assignedWorkerName}
              </div>
            </div>

            <div style={{ border: '1px solid #CFE0D8', borderRadius: '14px', padding: '16px', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F3D3A', marginBottom: '8px' }}>
                Captured Structured Observations:
              </div>
              {selectedEncounter.observations.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedEncounter.observations.map((obs) => (
                    <div
                      key={obs.code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        backgroundColor: obs.isAbnormal ? '#F8EDD8' : '#F5F3EE',
                        borderRadius: '8px',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: '#0B1F22', fontWeight: 500 }}>
                        {obs.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: obs.isAbnormal ? '#C0633F' : '#0B1F22' }} className="num-tabular">
                          {obs.value} {obs.unit}
                        </span>
                        {obs.deviceId && (
                          <span style={{ fontSize: '11px', color: '#5B6B6E' }}>
                            ({obs.deviceId})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#5B6B6E' }}>
                  No observations uploaded yet (Task currently in progress on mobile team app).
                </div>
              )}
            </div>

            {selectedEncounter.dispositionNotes && (
              <div style={{ backgroundColor: '#E6EEEA', padding: '14px', borderRadius: '12px', fontSize: '13px', color: '#0F3D3A' }}>
                <strong>Local Doctor Assessment Note:</strong> {selectedEncounter.dispositionNotes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
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
