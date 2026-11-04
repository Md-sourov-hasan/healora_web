import React, { useState } from 'react';
import {
  PhCalendarBlank,
  PhCheckCircle,
  PhPlus,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
import type { HubSession } from '../../types';

export const SessionsCampsView: React.FC = () => {
  const { t, language, sessions, selectedHubId, createSession, showToast } = useApp();
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<HubSession | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-11-04');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('02:00 PM');
  const [sessionType, setSessionType] = useState<'standard_clinic' | 'special_camp'>('standard_clinic');
  const [totalCapacity, setTotalCapacity] = useState(35);
  const [walkInCapacity, setWalkInCapacity] = useState(8);
  const [overrideReason, setOverrideReason] = useState('');

  const hubSessions = sessions.filter((s) => s.hubId === selectedHubId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const ok = createSession({
      title,
      titleBn: title,
      date,
      startTime,
      endTime,
      sessionType,
      totalCapacity: Number(totalCapacity),
      walkInCapacity: Number(walkInCapacity),
      healthWorkersCount: 2,
      doctorsCount: 1,
      requiredEquipmentReady: true,
      overrideReason,
    });

    if (ok) {
      setTitle('');
      setOverrideReason('');
      setIsNewSessionOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.04em] text-teal">
              {language === 'bn' ? 'সেশন ও ক্যাম্প সময়সূচি' : 'SESSION ROSTER & CAPACITY CONTROLS'}
            </span>
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navSessions}
          </h1>
          <p className="mt-1 text-sm text-slate">
            {language === 'bn'
              ? 'নিয়মিত ক্লিনিক দিন ও বিশেষ পল্লী স্বাস্থ্য ক্যাম্পের সক্ষমতা ও প্রস্তুতি নিশ্চিতকরণ'
              : 'Configured clinic days and health camps with strict staffing & device prerequisite validation'}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsNewSessionOpen(true)}
          icon={<PhPlus size={16} />}
        >
          {t.newSession}
        </Button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-2 gap-6">
        {hubSessions.map((session) => (
          <Card key={session.id} variant="card">
            <div className="mb-3 flex items-start justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${
                      session.sessionType === 'special_camp' ? 'bg-warn-bg text-warn-fg' : 'bg-sage-200 text-pine'
                    }`}
                  >
                    {session.sessionType.replace('_', ' ')}
                  </span>
                  <StatusPill
                    label={session.status.replace('_', ' ')}
                    variant={session.status === 'in_progress' ? 'in_service' : 'upcoming'}
                  />
                </div>
                <h2 className="m-0 text-lg font-semibold text-ink">
                  {language === 'bn' ? session.titleBn : session.title}
                </h2>
              </div>
            </div>

            <div className="mb-4 flex items-center gap-4 text-[13px] text-slate">
              <span className="flex items-center gap-1">
                <PhCalendarBlank size={16} color="#1D6B66" />
                {session.date} • {session.startTime} – {session.endTime}
              </span>
            </div>

            {/* Capacity bars */}
            <div className="mb-4 rounded-2xl bg-bone p-4">
              <div className="mb-1.5 flex justify-between text-[13px] text-ink">
                <span>
                  <strong>Booked:</strong> {session.bookedCount} / {session.totalCapacity} slots
                </span>
                <span>
                  <strong>Walk-ins:</strong> {session.walkInUsed} / {session.walkInCapacity}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-sage-200">
                <div
                  className="h-full bg-teal"
                  style={{
                    width: `${Math.min(100, (session.bookedCount / session.totalCapacity) * 100)}%`,
                  }}
                />
              </div>
              <div className="mt-1.5 text-[11px] text-slate">
                Overbooking Guard: Active (Hard-stop at slot limit + walk-in buffer)
              </div>
            </div>

            {/* Prerequisites Checklist (PRD Section 8.5) */}
            <div className="mb-4.5 flex flex-col gap-1.5 text-xs">
              <div className={`flex items-center gap-1.5 ${session.minimumStaffReady ? 'text-ok-fg' : 'text-bad-fg'}`}>
                <PhCheckCircle size={15} color={session.minimumStaffReady ? '#2F855A' : '#C53030'} />
                <span>
                  Staffing: Lead ({session.teamLeadName}), {session.healthWorkersCount} HWs, {session.doctorsCount} Doctor assigned.
                </span>
              </div>
              <div className={`flex items-center gap-1.5 ${session.requiredEquipmentReady ? 'text-ok-fg' : 'text-bad-fg'}`}>
                <PhCheckCircle size={15} color={session.requiredEquipmentReady ? '#2F855A' : '#C53030'} />
                <span>
                  Equipment: BP, Glucometer &amp; Pulse Oximeter calibration certified.
                </span>
              </div>
              {session.overrideReason && (
                <div className="rounded-md bg-warn-bg px-2 py-1 text-[11px] text-warn-fg">
                  Override Note: {session.overrideReason}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-t border-line pt-3.5">
              <button
                type="button"
                onClick={() => setSelectedSessionForDetails(session)}
                className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-teal"
              >
                {language === 'bn' ? 'বিস্তারিত রোস্টার দেখুন' : 'View Full Roster'}
              </button>

              <div className="flex gap-2">
                {session.status === 'open_for_booking' && (
                  <button
                    type="button"
                    onClick={() => showToast(`Session ${session.title} opened for live check-in.`)}
                    className="cursor-pointer rounded-lg border-none bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Start Session
                  </button>
                )}
                {session.status === 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => showToast(`Session ${session.title} marked completed.`)}
                    className="cursor-pointer rounded-lg border border-ok bg-ok-bg px-3 py-1.5 text-xs font-semibold text-ok-fg"
                  >
                    End Session
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* New Session Modal */}
      <ModalSheet
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        title={t.newSession}
        subtitle="Validate staffing & device calibration prior to publishing"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate">
              Session / Camp Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Afternoon Diabetic & Hypertension Outreach"
              className="h-12 w-full rounded-xl border border-line px-3.5 font-ui text-[15px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as 'standard_clinic' | 'special_camp')}
                className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-sm"
              >
                <option value="standard_clinic">Standard Clinic Day</option>
                <option value="special_camp">Special Outreach Camp</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00 AM"
                className="h-12 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="02:00 PM"
                className="h-12 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Booked Slots Limit
              </label>
              <input
                type="number"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(Number(e.target.value))}
                className="h-12 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Walk-In Buffer Slots
              </label>
              <input
                type="number"
                value={walkInCapacity}
                onChange={(e) => setWalkInCapacity(Number(e.target.value))}
                className="h-12 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate">
              Override Reason (if staffing/equipment needs variance)
            </label>
            <input
              type="text"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Single-worker screening authorized under Protocol v2.4"
              className="h-12 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsNewSessionOpen(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" variant="primary">
              Publish Session
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Roster Details Drawer */}
      {selectedSessionForDetails && (
        <ModalSheet
          isOpen={!!selectedSessionForDetails}
          onClose={() => setSelectedSessionForDetails(null)}
          title={`Session Details: ${selectedSessionForDetails.title}`}
          subtitle="Operational parameters and verified staffing roster"
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-ctl bg-bone p-4">
              <div className="mb-1.5 text-[13px] font-semibold text-ink">
                Assigned Team Roster:
              </div>
              <div className="text-[13px] leading-[1.6] text-slate">
                • <strong>Team Lead:</strong> {selectedSessionForDetails.teamLeadName}
                <br />
                • <strong>Health Assistants:</strong> 2 Field Health Workers checked in
                <br />
                • <strong>Clinical Reviewer:</strong> Dr. Arjun Mehta (BMDC-A-45892)
              </div>
            </div>

            <div className="rounded-ctl bg-mist p-4">
              <div className="mb-1.5 text-[13px] font-semibold text-pine">
                Equipment Checklist Status:
              </div>
              <div className="text-[13px] leading-[1.6] text-pine">
                ✓ Omron HEM-7120 Digital BP Monitor (Calibrated)
                <br />
                ✓ Accu-Chek Instant Glucometer (Control solution verified)
                <br />
                ✓ Masimo MightySat Pulse Oximeter (95% battery)
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedSessionForDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
