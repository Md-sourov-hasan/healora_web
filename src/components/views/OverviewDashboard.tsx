import React, { useState } from 'react';
import {
  PhUsers,
  PhClipboardText,
  PhCheckCircle,
  PhArrowsClockwise,
  PhGauge,
  PhHeartbeat,
  PhPlus,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';

const labelClass = 'mb-1.5 block text-[13px] font-semibold text-slate';
const inputClass = 'h-12 w-full rounded-xl border border-line px-3.5 font-ui text-[15px] text-ink';
const selectClass = `${inputClass} bg-paper`;

export const OverviewDashboard: React.FC = () => {
  const {
    t,
    language,
    hubs,
    selectedHubId,
    sessions,
    appointments,
    queue,
    equipment,
    encounters,
    setActiveView,
    registerWalkIn,
    createSession,
  } = useApp();

  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);

  // Walk-in form states
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInAge, setWalkInAge] = useState(48);
  const [walkInGender, setWalkInGender] = useState<'Female' | 'Male'>('Female');
  const [walkInService, setWalkInService] = useState('Basic Vitals & Glucose Screening');

  // New session form states
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionCapacity, setNewSessionCapacity] = useState(30);
  const [newSessionWalkInCap, setNewSessionWalkInCap] = useState(8);
  const [newSessionOverrideReason, setNewSessionOverrideReason] = useState('');

  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];
  const hubAppointments = appointments.filter((a) => a.hubId === selectedHubId);
  const hubQueue = queue.filter((q) => q.hubId === selectedHubId);
  const waitingCount = hubQueue.filter((q) => q.currentStatus === 'waiting').length;
  const inServiceCount = hubQueue.filter((q) => q.currentStatus === 'in_service' || q.currentStatus === 'called').length;
  const completedCount = hubQueue.filter((q) => q.currentStatus === 'completed').length;
  const pendingSyncCount = encounters.filter((e) => e.hubId === selectedHubId && e.syncState !== 'synced').length;
  const calibrationDueDevices = equipment.filter((eq) => eq.hubId === selectedHubId && eq.status === 'calibration_due').length;

  const handleWalkInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim()) return;
    registerWalkIn(
      {
        fullName: walkInName,
        fullNameBn: walkInName,
        phone: walkInPhone || '+880 1711 000000',
        age: Number(walkInAge),
        gender: walkInGender,
      },
      walkInService
    );
    setWalkInName('');
    setWalkInPhone('');
    setIsWalkInOpen(false);
  };

  const handleSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) return;
    const ok = createSession({
      title: newSessionTitle,
      titleBn: newSessionTitle,
      totalCapacity: Number(newSessionCapacity),
      walkInCapacity: Number(newSessionWalkInCap),
      healthWorkersCount: 2,
      doctorsCount: 1,
      requiredEquipmentReady: true,
      overrideReason: newSessionOverrideReason,
    });
    if (ok) {
      setNewSessionTitle('');
      setNewSessionOverrideReason('');
      setIsNewSessionOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Top Banner / Hero Organic Section */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.04em] text-teal">
              {language === 'bn' ? 'অপারেশনাল কন্ট্রোল সেন্টার' : 'OPERATIONAL CONTROL CENTER'}
            </span>
            <StatusPill label={language === 'bn' ? 'সক্রিয় শাখা' : 'Active Hub'} variant="active" />
          </div>
          <h1 className="m-0 font-ui text-[32px] font-semibold tracking-[-0.01em] text-ink">
            {language === 'bn' ? currentHub.nameBn : currentHub.name}
          </h1>
          <p className="mt-1.5 mb-0 text-[15px] text-slate">
            {language === 'bn' ? currentHub.addressBn : currentHub.address} • {currentHub.operatingHours}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsWalkInOpen(true)}
            icon={<PhPlus size={16} />}
          >
            {t.addWalkIn}
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsNewSessionOpen(true)}
          >
            {t.newSession}
          </Button>
        </div>
      </div>

      {/* Hero Action Card (Design System Ch 7.7) */}
      <Card variant="hero" className="mb-8">
        <div className="relative z-2 flex items-center justify-between">
          <div className="max-w-160">
            <div className="mb-3 inline-flex items-center gap-2 rounded-lg bg-white/12 px-3 py-1">
              <PhCheckCircle size={14} color="#8FB3A3" />
              <span className="text-xs font-semibold text-sage-200">
                {language === 'bn' ? 'হিলোরা সমন্বিত শারীরিক হাব কেয়ার' : 'Healora Integrated Physical Hub Care'}
              </span>
            </div>

            <h2 className="font-disp m-0 text-[32px] font-normal leading-[1.2] text-white">
              {language === 'bn' ? (
                <span>উপজেলা ও ইউনিয়নে নির্ভরযোগ্য প্রাথমিক স্বাস্থ্য পরীক্ষা ও টেলি-ট্রায়াজ</span>
              ) : (
                <span>Predictable area-based checkups, <em>without travel friction</em></span>
              )}
            </h2>

            <p className="mt-3 mb-0 text-[15px] leading-normal text-sage-200">
              {language === 'bn'
                ? 'অনুমোদিত স্বাস্থ্য সহকারী ও স্থানীয় ডাক্তারের মাধ্যমে ভাইটালস গ্রহণ, কেন্দ্রীয় রেকর্ডে তাৎক্ষণিক সংযোজন ও আন্তর্জাতিক বিশেষজ্ঞ পরামর্শের পূর্ণ প্রস্তুতি।'
                : 'Empowering authorized special teams and local doctors to collect accurate measurements directly into the shared patient record for seamless specialist consultations.'}
            </p>
          </div>

          {/* Pulsing Clay Heart & Live Stats Container (Design System 7.7) */}
          <div className="flex flex-col items-center rounded-[20px] border border-white/12 bg-white/8 px-7 py-5">
            <div className="animate-heart mb-3 flex size-13 items-center justify-center rounded-full bg-clay text-white shadow-[0_4px_12px_rgba(192,99,63,0.5)]">
              <PhHeartbeat size={28} color="#FFFFFF" />
            </div>
            <div className="tabular-nums text-2xl font-bold text-white">
              {waitingCount + inServiceCount + completedCount} / {currentHub.capacityPerDay}
            </div>
            <div className="text-xs text-sage-400">
              {language === 'bn' ? 'আজকের মোট রোগী সক্ষমতা' : 'Patients Served Today'}
            </div>
          </div>
        </div>
      </Card>

      {/* Operational Metrics 4-up Grid */}
      <div className="mb-8 grid grid-cols-4 gap-4.5">
        <Card variant="card" clickable onClick={() => setActiveView('appointments')}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">{t.appointmentsToday}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-chip bg-sage-200 text-pine">
              <PhClipboardText size={18} />
            </div>
          </div>
          <div className="tabular-nums text-[32px] font-semibold text-ink">
            {hubAppointments.length}
          </div>
          <div className="mt-1.5 text-xs font-medium text-teal">
            {hubAppointments.filter((a) => a.status === 'checked_in').length} {t.checkedIn}
          </div>
        </Card>

        <Card variant="card" clickable onClick={() => setActiveView('queue')}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">{t.waiting} / {t.inService}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-chip bg-mist text-teal">
              <PhUsers size={18} />
            </div>
          </div>
          <div className="tabular-nums text-[32px] font-semibold text-clay">
            {waitingCount} <span className="text-lg font-normal text-slate">+ {inServiceCount}</span>
          </div>
          <div className="mt-1.5 text-xs text-slate">
            {t.avgWaitTime}: <strong className="text-ink">14 mins</strong>
          </div>
        </Card>

        <Card variant="card" clickable onClick={() => setActiveView('exceptions')}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">{t.syncPending}</span>
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
            {pendingSyncCount > 0 ? (
              <span className="font-semibold text-warn">Mobile outbox queued</span>
            ) : (
              <span className="text-ok">All local vitals synchronized</span>
            )}
          </div>
        </Card>

        <Card variant="card" clickable onClick={() => setActiveView('equipment')}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">{t.equipmentReady}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-chip bg-sage-200 text-pine">
              <PhGauge size={18} />
            </div>
          </div>
          <div className="tabular-nums text-[32px] font-semibold text-ink">
            {equipment.filter((e) => e.hubId === selectedHubId && e.status === 'assigned').length} / {currentHub.totalDevicesCount}
          </div>
          <div className={`mt-1.5 text-xs font-medium ${calibrationDueDevices > 0 ? 'text-bad' : 'text-ok'}`}>
            {calibrationDueDevices > 0 ? `${calibrationDueDevices} device calibration due` : 'All devices operational'}
          </div>
        </Card>
      </div>

      {/* Active Stations & Today's Live Flow (2 Columns) */}
      <div className="grid grid-cols-[1.2fr_1fr] gap-6">
        {/* Left Column: Live Queue Snippet */}
        <Card variant="card">
          <div className="mb-4.5 flex items-center justify-between">
            <div>
              <h2 className="m-0 text-lg font-semibold text-ink">
                {language === 'bn' ? 'চলমান কিউ ও স্টেশন সার্ভিস' : 'Live Queue & Station Progress'}
              </h2>
              <p className="mt-1 mb-0 text-[13px] text-slate">
                {t.leastPrivilegeNote}
              </p>
            </div>
            <Button variant="text" onClick={() => setActiveView('queue')}>
              {language === 'bn' ? 'পূর্ণাঙ্গ কিউ বোর্ড দেখুন' : 'Open Full Board'}
            </Button>
          </div>

          <div className="flex flex-col gap-2.5">
            {hubQueue.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-ctl border border-line bg-bone px-4 py-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="tabular-nums flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-[15px] font-bold text-white">
                    {item.ticketNumber}
                  </div>
                  <div>
                    <div className="text-[15px] font-semibold text-ink">
                      {language === 'bn' ? item.patientNameBn : item.patientName}
                    </div>
                    <div className="text-[13px] text-slate">
                      {item.stationName} • {item.serviceType}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusPill
                    label={item.currentStatus.replace('_', ' ')}
                    variant={
                      item.currentStatus === 'in_service'
                        ? 'in_service'
                        : item.currentStatus === 'completed'
                        ? 'completed'
                        : item.currentStatus === 'awaiting_review'
                        ? 'awaiting'
                        : 'upcoming'
                    }
                  />
                  <span className="tabular-nums text-xs text-slate">
                    {item.waitMinutes}m wait
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Sessions Overview */}
        <Card variant="card">
          <div className="mb-4.5 flex items-center justify-between">
            <div>
              <h2 className="m-0 text-lg font-semibold text-ink">
                {language === 'bn' ? 'আজকের সেশন ও ক্যাম্প' : 'Scheduled Hub Sessions'}
              </h2>
              <p className="mt-1 mb-0 text-[13px] text-slate">
                {language === 'bn' ? 'সক্ষমতা ও শর্ত পর্যালোচনা' : 'Capacity, roster & equipment checklist'}
              </p>
            </div>
            <Button variant="text" onClick={() => setActiveView('sessions')}>
              {language === 'bn' ? 'সকল সেশন' : 'Manage All'}
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {sessions
              .filter((s) => s.hubId === selectedHubId)
              .map((session) => (
                <div
                  key={session.id}
                  className="rounded-2xl border border-line bg-paper p-4 shadow-[0_1px_3px_rgba(11,31,34,.05)]"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <h3 className="m-0 text-[15px] font-semibold text-ink">
                        {language === 'bn' ? session.titleBn : session.title}
                      </h3>
                      <div className="mt-0.5 text-[13px] text-slate">
                        {session.startTime} – {session.endTime} ({session.sessionType.replace('_', ' ')})
                      </div>
                    </div>
                    <StatusPill
                      label={session.status.replace('_', ' ')}
                      variant={session.status === 'in_progress' ? 'in_service' : 'upcoming'}
                    />
                  </div>

                  {/* Progress track */}
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-xs text-slate">
                      <span>Booked: {session.bookedCount} / {session.totalCapacity}</span>
                      <span>Walk-in: {session.walkInUsed} / {session.walkInCapacity}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-sage-200">
                      <div
                        className="h-full bg-teal"
                        style={{
                          width: `${Math.min(100, (session.bookedCount / session.totalCapacity) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-xs text-pine">
                    <span className="flex items-center gap-1">
                      <PhCheckCircle size={14} color="#2F855A" />
                      Lead: {session.teamLeadName}
                    </span>
                    <span className="flex items-center gap-1">
                      <PhCheckCircle size={14} color="#2F855A" />
                      Equip. Verified
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Walk-in Registration Sheet */}
      <ModalSheet
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        title={t.addWalkIn}
        subtitle="Assisted arrival registration & queue assignment without clinical pre-entry"
      >
        <form onSubmit={handleWalkInSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>
              Full Name (রোগীর পূর্ণ নাম) *
            </label>
            <input
              type="text"
              required
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              placeholder="e.g. Rahima Begum"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Contact Phone (মোবাইল নম্বর) *
            </label>
            <input
              type="text"
              required
              value={walkInPhone}
              onChange={(e) => setWalkInPhone(e.target.value)}
              placeholder="+880 1711 234567"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Age (বয়স)
              </label>
              <input
                type="number"
                value={walkInAge}
                onChange={(e) => setWalkInAge(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Gender (লিঙ্গ)
              </label>
              <select
                value={walkInGender}
                onChange={(e) => setWalkInGender(e.target.value as 'Female' | 'Male')}
                className={selectClass}
              >
                <option value="Female">Female (মহিলা)</option>
                <option value="Male">Male (পুরুষ)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Service Requested (প্রয়োজনীয় সেবা)
            </label>
            <select
              value={walkInService}
              onChange={(e) => setWalkInService(e.target.value)}
              className={selectClass}
            >
              <option value="Basic Vitals & Glucose Screening">Basic Vitals & Glucose Screening</option>
              <option value="Hypertension Checkup">Hypertension Checkup</option>
              <option value="Maternal Health Vitals">Maternal Health Vitals</option>
              <option value="Specialist Pre-Teleconsultation Assessment">Specialist Pre-Teleconsultation Assessment</option>
            </select>
          </div>

          <div className="rounded-xl bg-mist p-3 text-xs text-pine">
            <PhCheckCircle size={14} color="#1D6B66" className="mr-1.5 inline" />
            Informed consent for physical measurement collection obtained in accordance with Bangladesh PDPA 2026.
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsWalkInOpen(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" variant="primary">
              Generate Token &amp; Check-in
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Create New Session Sheet with Prerequisite Validation */}
      <ModalSheet
        isOpen={isNewSessionOpen}
        onClose={() => setIsNewSessionOpen(false)}
        title={t.newSession}
        subtitle="Configure capacity, minimum staffing & calibrated equipment"
      >
        <form onSubmit={handleSessionSubmit} className="flex flex-col gap-4">
          <div>
            <label className={labelClass}>
              Session Title (সেশনের নাম) *
            </label>
            <input
              type="text"
              required
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              placeholder="e.g. Afternoon Cardiovascular Outreach"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Total Slots
              </label>
              <input
                type="number"
                value={newSessionCapacity}
                onChange={(e) => setNewSessionCapacity(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Walk-in Capacity
              </label>
              <input
                type="number"
                value={newSessionWalkInCap}
                onChange={(e) => setNewSessionWalkInCap(Number(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded-ctl border border-sage-200 bg-bone p-4">
            <div className="mb-2 text-[13px] font-semibold text-pine">
              Minimum Prerequisites Verification (PRD Section 8.5):
            </div>
            <ul className="m-0 pl-5 text-[13px] leading-[1.6] text-slate">
              <li>Minimum Staff: 1 Special Team Lead, 1 Field Health Worker, 1 Reviewing Doctor.</li>
              <li>Calibrated Devices: BP Monitor (HEM-7120), Glucometer, Pulse Oximeter.</li>
            </ul>
          </div>

          <div>
            <label className={labelClass}>
              Administrative Override Reason (If prerequisites differ)
            </label>
            <input
              type="text"
              value={newSessionOverrideReason}
              onChange={(e) => setNewSessionOverrideReason(e.target.value)}
              placeholder="e.g. Remote outreach arrangement authorized by Regional Ops"
              className="h-12 w-full rounded-xl border border-line px-3.5 font-ui text-sm text-ink"
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
    </div>
  );
};
