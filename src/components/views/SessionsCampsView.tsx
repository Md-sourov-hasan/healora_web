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
import { PublishSessionSheet } from './PublishSessionSheet';

export const SessionsCampsView: React.FC = () => {
  const { t, language, sessions, serviceTypes, selectedHubId, createSession, openBookingSession, startSession, completeSession, cancelSession } = useApp();
  const [publishingSession, setPublishingSession] = useState<HubSession | null>(null);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<HubSession | null>(null);
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [sessionType, setSessionType] = useState<'standard_clinic' | 'special_camp'>('standard_clinic');
  const [totalCapacity, setTotalCapacity] = useState('');
  const [walkInCapacity, setWalkInCapacity] = useState('');

  const hubSessions = sessions.filter((s) => s.hubId === selectedHubId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const ok = await createSession({
      hubId: selectedHubId,
      serviceTypeId,
      title,
      date,
      startTime,
      endTime,
      sessionType,
      totalCapacity: Number(totalCapacity),
      walkInCapacity: Number(walkInCapacity),
    });

    if (ok) {
      setTitle('');
      setServiceTypeId('');
      setTotalCapacity('');
      setWalkInCapacity('');
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
        {hubSessions.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-line bg-paper p-12 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-sage-200 text-pine">
              <PhCalendarBlank size={24} />
            </div>
            <h3 className="text-base font-bold text-ink">
              {language === 'bn' ? 'কোনো সেশন নির্ধারিত নেই' : 'No Sessions Scheduled'}
            </h3>
            <p className="mt-1 text-sm text-slate">
              {language === 'bn'
                ? 'উপরে "+ নতুন সেশন" বাটনে ক্লিক করে নিয়মিত ক্লিনিক বা ক্যাম্প শিডিউল করুন।'
                : 'Zero dummy data. Click "+ New Session" above to schedule a clinic or health camp.'}
            </p>
          </div>
        ) : (
          hubSessions.map((session) => (
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
                  {language === 'bn' ? session.titleBn || session.title : session.title}
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
            </div>

            {/* Prerequisites Checklist (PRD Section 8.5) */}
            <div className="mb-4.5 flex flex-col gap-1.5 text-xs">
              <div className={`flex items-center gap-1.5 ${session.minimumStaffReady == null ? 'text-slate' : session.minimumStaffReady ? 'text-ok-fg' : 'text-bad-fg'}`}>
                <PhCheckCircle size={15} color={session.minimumStaffReady == null ? '#718096' : session.minimumStaffReady ? '#2F855A' : '#C53030'} />
                <span>
                  Staffing readiness: {session.minimumStaffReady == null ? 'not reported' : session.minimumStaffReady ? 'ready' : 'not ready'}; {session.teamLeadName || 'Not reported'}; {session.healthWorkersCount ?? '—'} health workers, {session.doctorsCount ?? '—'} doctors reported.
                </span>
              </div>
              <div className={`flex items-center gap-1.5 ${session.requiredEquipmentReady == null ? 'text-slate' : session.requiredEquipmentReady ? 'text-ok-fg' : 'text-bad-fg'}`}>
                <PhCheckCircle size={15} color={session.requiredEquipmentReady == null ? '#718096' : session.requiredEquipmentReady ? '#2F855A' : '#C53030'} />
                <span>
                  Equipment readiness: {session.requiredEquipmentReady == null ? 'not reported' : session.requiredEquipmentReady ? 'ready' : 'not ready'}.
                </span>
              </div>
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
                {session.status === 'draft' && (
                  <button type="button" onClick={() => setPublishingSession(session)} className="cursor-pointer rounded-lg border-none bg-teal px-3 py-1.5 text-xs font-semibold text-white">Publish</button>
                )}
                {session.status === 'published' && (
                  <button type="button" onClick={() => openBookingSession(session.id)} className="cursor-pointer rounded-lg border-none bg-ink px-3 py-1.5 text-xs font-semibold text-white">Open Booking</button>
                )}
                {['published', 'open_for_booking', 'full'].includes(session.status) && (
                  <button
                    type="button"
                    onClick={() => startSession(session.id)}
                    className="cursor-pointer rounded-lg border-none bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Start Session
                  </button>
                )}
                {session.status === 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => completeSession(session.id)}
                    className="cursor-pointer rounded-lg border border-ok bg-ok-bg px-3 py-1.5 text-xs font-semibold text-ok-fg"
                  >
                    End Session
                  </button>
                )}
                {session.status !== 'completed' && session.status !== 'cancelled' && (
                  <button
                    type="button"
                    onClick={() => setCancellingSessionId(session.id)}
                    className="cursor-pointer rounded-lg border border-bad/30 bg-paper px-2.5 py-1.5 text-xs font-semibold text-bad hover:bg-bad-bg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </Card>
        ))
        )}
      </div>

      {/* New Session Modal */}
      {publishingSession && <PublishSessionSheet key={publishingSession.id} session={publishingSession} onClose={() => setPublishingSession(null)} />}
      <ModalSheet
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        title={t.newSession}
        subtitle="Create a session using the backend service catalogue and hub schedule"
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

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate">Service Type *</label>
            <select required value={serviceTypeId} onChange={(e) => setServiceTypeId(e.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-sm">
              <option value="">Select service type</option>
              {serviceTypes.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
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
                required
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
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
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
                required
                min={1}
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(e.target.value)}
                className="h-12 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Walk-In Buffer Slots
              </label>
              <input
                type="number"
                required
                min={0}
                value={walkInCapacity}
                onChange={(e) => setWalkInCapacity(e.target.value)}
                className="h-12 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsNewSessionOpen(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" variant="primary">
              Create Session
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
          subtitle="Session staffing and equipment readiness reported by the backend"
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-ctl bg-bone p-4">
              <div className="mb-1.5 text-[13px] font-semibold text-ink">
                Assigned Team Roster:
              </div>
              <div className="text-[13px] leading-[1.6] text-slate">
                • <strong>Team Lead:</strong> {selectedSessionForDetails.teamLeadName || 'Not assigned'}
                <br />
                • <strong>Health workers:</strong> {selectedSessionForDetails.healthWorkersCount ?? 'Not reported'}
                <br />
                • <strong>Doctors:</strong> {selectedSessionForDetails.doctorsCount ?? 'Not reported'}
              </div>
            </div>

            <div className="rounded-ctl bg-mist p-4">
              <div className="mb-1.5 text-[13px] font-semibold text-pine">
              Equipment readiness
              </div>
              <div className="text-[13px] leading-[1.6] text-pine">
                {selectedSessionForDetails.requiredEquipmentReady == null ? 'Equipment readiness not reported.' : selectedSessionForDetails.requiredEquipmentReady ? 'Ready according to backend.' : 'Not ready according to backend.'}
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

      {/* Cancellation Modal (PRD Section 8.5) */}
      <ModalSheet
        isOpen={!!cancellingSessionId}
        onClose={() => setCancellingSessionId(null)}
        title="Cancel Hub Service Session"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (cancellingSessionId && cancelReason.trim()) {
              const ok = await cancelSession(cancellingSessionId, cancelReason);
              if (ok) { setCancellingSessionId(null); setCancelReason(''); }
            }
          }}
          className="space-y-4"
        >
          <p className="m-0 text-xs text-slate">The backend validates the cancellation and records the reason.</p>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Cancellation Reason (Mandatory)</label>
            <textarea
              rows={3}
              required
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="e.g. Unforeseen electrical outage / Staff medical emergency. Patients redirected to next clinic session."
              className="w-full rounded-xl border border-line p-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setCancellingSessionId(null)}>Cancel</Button>
            <Button variant="primary" type="submit" className="bg-bad! hover:bg-bad-fg!">Confirm Cancellation</Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
