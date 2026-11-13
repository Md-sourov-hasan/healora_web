import React, { useState } from 'react';
import {
  PhArrowsClockwise,
  PhCheckCircle,
  PhHospital,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { OperationalException } from '../../types';

export const ExceptionsEscalationsView: React.FC = () => {
  const {
    t,
    language,
    exceptions,
    selectedHubId,
    hubs,
    resolveException,
    acknowledgeException,
    escalateException,
    dismissException,
    refreshBackendData,
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [selectedException, setSelectedException] = useState<OperationalException | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];
  const hubExceptions = exceptions.filter((exc) => exc.hubId === selectedHubId);

  const filtered = severityFilter === 'all'
    ? hubExceptions
    : hubExceptions.filter((e) => e.severity === severityFilter);

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedException) return;
    if (!resolutionNotes.trim()) return;
    void resolveException(selectedException.id, resolutionNotes.trim());
    setIsResolveModalOpen(false);
    setSelectedException(null);
    setResolutionNotes('');
  };

  const getSeverityBadge = (sev: OperationalException['severity']) => {
    switch (sev) {
      case 'critical':
        return <span className="rounded-md bg-bad-bg px-2 py-0.5 text-[11px] font-bold uppercase text-bad-fg">CRITICAL ESCALATION</span>;
      case 'warning':
        return <span className="rounded-md bg-warn-bg px-2 py-0.5 text-[11px] font-bold uppercase text-warn-fg">WARNING</span>;
      case 'info':
        return <span className="rounded-md bg-sage-200 px-2 py-0.5 text-[11px] font-bold uppercase text-pine">INFO</span>;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'অপারেশনাল এক্সেপশন ও জরুরি ব্যবস্থা' : 'INCIDENT QUEUES & SAFETY ESCALATIONS'}
            </span>
            <span className="size-2 animate-pulse-live rounded-full bg-bad" />
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navExceptions}
          </h1>
          <p className="mt-1 mb-0 text-sm text-slate">
            {currentHub?.name || 'Healora Hub'} • {language === 'bn'
              ? 'মোবাইল সিঙ্ক জটিলতা, অসম্পূর্ণ পরিমাপ, অতিরিক্ত অপেক্ষার সময় ও চিকিৎসা রেফারেল ট্র্যাকিং'
              : 'Real-time exception routing, offline sync recovery, wait-time SLA violations and clinical referrals'}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => void refreshBackendData()}
          icon={<PhArrowsClockwise size={16} />}
        >
          {language === 'bn' ? 'রিফ্রেশ' : 'Refresh Queues'}
        </Button>
      </div>

      {/* Emergency Facility Reference Card (PRD Section 8.3 & 13.3) */}
      {(currentHub?.emergencyReferralFacility || currentHub?.emergencyPhone) && <div className="mb-6 rounded-2xl border border-bad/30 bg-bad-bg/40 p-4.5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-bad text-white">
              <PhHospital size={20} color="#FFFFFF" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-bad-fg">
                Emergency referral contact from hub record
              </div>
              <h3 className="m-0 text-base font-bold text-ink">
                {currentHub?.emergencyReferralFacility}
              </h3>
              <div className="text-xs text-slate">
                {currentHub?.emergencyPhone && <>Phone: <strong className="text-bad">{currentHub.emergencyPhone}</strong></>}
              </div>
            </div>
          </div>

          {currentHub?.emergencyPhone && <a href={`tel:${currentHub.emergencyPhone}`} className="rounded-xl border border-bad/40 bg-paper px-3 py-2 text-sm font-semibold text-bad">Call hub referral contact</a>}
        </div>
      </div>}

      {/* KPI Severity Stat Cards */}
      <div className="mb-7 grid grid-cols-4 gap-4">
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Total Exceptions</div>
          <div className="mt-1 text-3xl font-bold text-ink">{hubExceptions.length}</div>
          <div className="mt-1 text-xs text-teal">Recorded operational deviations</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Critical Safety Alerts</div>
          <div className="mt-1 text-3xl font-bold text-bad">
            {hubExceptions.filter((e) => e.severity === 'critical' && !['resolved', 'dismissed'].includes(e.status)).length}
          </div>
          <div className="mt-1 text-xs text-bad">Requires immediate supervision</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Sync &amp; Wait Warnings</div>
          <div className="mt-1 text-3xl font-bold text-amber">
            {hubExceptions.filter((e) => e.severity === 'warning' && !['resolved', 'dismissed'].includes(e.status)).length}
          </div>
          <div className="mt-1 text-xs text-amber font-semibold">Offline outbox or SLA breach</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Resolved Today</div>
          <div className="mt-1 text-3xl font-bold text-ok">
            {hubExceptions.filter((e) => ['resolved', 'dismissed'].includes(e.status)).length}
          </div>
          <div className="mt-1 text-xs text-slate">Handled with audit confirmation</div>
        </Card>
      </div>

      {/* Severity Filter */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-xs font-semibold text-slate">Severity:</span>
        {['all', 'critical', 'warning', 'info'].map((sev) => (
          <button
            key={sev}
            type="button"
            onClick={() => setSeverityFilter(sev)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              severityFilter === sev ? 'bg-ink text-white' : 'bg-paper border border-line text-slate hover:bg-mist'
            }`}
          >
            {sev === 'all' ? 'All Deviations' : sev.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Exceptions List */}
      <div className="space-y-3.5">
        {filtered.length === 0 ? (
          <Card variant="card" className="py-12 text-center text-slate">
            <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-mist text-teal">
              <PhCheckCircle size={24} />
            </div>
            <p className="font-semibold text-ink">No active exceptions or escalations</p>
            <p className="text-xs text-slate">All session queues, patient wait times, device calibrations, and mobile synchronizations are operating within normal operational parameters.</p>
          </Card>
        ) : (
          filtered.map((item) => (
          <Card
            key={item.id}
            variant="card"
            className={`border-l-4! ${
              ['resolved', 'dismissed'].includes(item.status)
                ? 'border-l-ok! opacity-60'
                : item.severity === 'critical'
                ? 'border-l-bad!'
                : item.severity === 'warning'
                ? 'border-l-amber!'
                : 'border-l-teal!'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate">{item.code}</span>
                  {getSeverityBadge(item.severity)}
                  <StatusPill
                    label={item.status.toUpperCase()}
                    variant={['resolved', 'dismissed'].includes(item.status) ? 'completed' : 'draft'}
                  />
                  <span className="text-xs text-slate">• Logged {item.createdAt}</span>
                </div>

                <h3 className="m-0 text-base font-semibold text-ink">
                  {language === 'bn' ? item.titleBn : item.title}
                </h3>
                <p className="mt-1 mb-2 text-xs text-slate leading-relaxed">
                  {item.details}
                </p>

                {item.patientName && (
                  <div className="text-xs text-slate">
                    Associated Patient: <strong className="text-ink">{item.patientName}</strong>
                    {item.encounterId && <span className="ml-2 font-mono text-teal">({item.encounterId})</span>}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-end gap-2">
                {!['resolved', 'dismissed'].includes(item.status) ? (
                  <>
                    {item.status === 'open' && (
                      <button
                        type="button"
                        onClick={() => void acknowledgeException(item.id)}
                        className="cursor-pointer rounded-xl bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-pine"
                      >
                        Acknowledge
                      </button>
                    )}

                    <button type="button" onClick={() => {
                      const note = window.prompt('Enter the escalation note:');
                      if (note?.trim()) void escalateException(item.id, item.category === 'clinical_escalation' ? 'clinical_operations' : 'regional_operations', note.trim());
                    }} className="cursor-pointer rounded-xl border border-warn bg-paper px-3 py-1.5 text-xs font-semibold text-warn-fg">Escalate</button>

                    <button type="button" onClick={() => {
                      const reason = window.prompt('Enter the reason for dismissing this exception:');
                      if (reason?.trim()) void dismissException(item.id, reason.trim());
                    }} className="cursor-pointer rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-slate">Dismiss</button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedException(item);
                        setIsResolveModalOpen(true);
                      }}
                      className="cursor-pointer rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:bg-bone"
                    >
                      Resolve Exception
                    </button>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-ok">
                    <PhCheckCircle size={16} /> Resolved
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))
        )}
      </div>

      {/* Resolve Modal */}
      <ModalSheet
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve Operational Exception"
      >
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <div className="text-xs text-slate">
            Resolving incident <strong className="text-ink">{selectedException?.code}</strong>: {selectedException?.title}.
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Supervisor Resolution Notes (Audited)</label>
            <textarea
              rows={3}
              required
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Explain how this operational exception was handled (e.g. re-assigned patient to Doctor Mehta desk, confirmed retry sync)..."
              className="w-full rounded-xl border border-line p-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsResolveModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Mark as Resolved</Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
