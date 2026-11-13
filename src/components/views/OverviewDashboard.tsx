import React, { useState } from 'react';
import {
  PhUsers,
  PhClipboardText,
  PhCheckCircle,
  PhArrowsClockwise,
  PhGauge,
  PhHeartbeat,
  PhPlus,
  PhHospital,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { WalkInSessionCapacity, describeWalkInError } from './WalkInSessionCapacity';
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
    serviceTypes,
    dashboardOverview,
    queue,
    equipment,
    encounters,
    navigate,
    registerWalkIn,
    createSession,
  } = useApp();

  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);

  // Walk-in form states
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInAge, setWalkInAge] = useState('');
  const [walkInGender, setWalkInGender] = useState<'Female' | 'Male' | 'Other' | 'Unknown'>('Unknown');
  const [walkInSessionId, setWalkInSessionId] = useState('');
  const [issuingWalkIn, setIssuingWalkIn] = useState(false);
  const [walkInError, setWalkInError] = useState('');
  const [issuedWalkInToken, setIssuedWalkInToken] = useState<string | null>(null);
  const [registeredWalkIn, setRegisteredWalkIn] = useState<{ key: string; id: string } | null>(null);

  // New session form states
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionDate, setNewSessionDate] = useState('');
  const [newSessionStart, setNewSessionStart] = useState('');
  const [newSessionEnd, setNewSessionEnd] = useState('');
  const [newSessionServiceTypeId, setNewSessionServiceTypeId] = useState('');
  const [newSessionType, setNewSessionType] = useState<'standard_clinic' | 'special_camp'>('standard_clinic');
  const [newSessionCapacity, setNewSessionCapacity] = useState('');
  const [newSessionWalkInCap, setNewSessionWalkInCap] = useState('');

  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];
  const hubQueue = queue.filter((q) => q.hubId === selectedHubId);
  const hubEncounters = encounters.filter((e) => e.hubId === selectedHubId);
  const pendingSyncCount = hubEncounters.filter((e) => ['pending_local', 'sync_failed', 'retrying'].includes(e.syncState ?? '')).length;
  const calibrationDueDevices = equipment.filter((eq) => eq.hubId === selectedHubId && eq.status === 'calibration_due').length;
  const activeSessions = sessions.filter((session) => session.hubId === selectedHubId && session.status === 'in_progress');
  const apiVisits = dashboardOverview?.cards.visits;

  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkInName.trim() || issuingWalkIn) return;
    const identityKey = JSON.stringify([walkInName.trim(), walkInPhone.trim(), walkInAge, walkInGender]);
    setIssuingWalkIn(true);
    setWalkInError('');
    try {
    const ok = await registerWalkIn(
      {
        id: registeredWalkIn?.key === identityKey ? registeredWalkIn.id : undefined,
        fullName: walkInName,
        phone: walkInPhone,
        age: walkInAge ? Number(walkInAge) : undefined,
        gender: walkInGender,
      },
      walkInSessionId,
      (id) => setRegisteredWalkIn({ key: identityKey, id })
    );
    if (ok) {
      setIssuedWalkInToken(ok);
      setRegisteredWalkIn(null);
      setWalkInName('');
      setWalkInPhone('');
      setIsWalkInOpen(false);
    }
    } catch (error) {
      setWalkInError(describeWalkInError(error));
    } finally {
      setIssuingWalkIn(false);
    }
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionTitle.trim()) return;
    const ok = await createSession({
      hubId: selectedHubId,
      serviceTypeId: newSessionServiceTypeId,
      title: newSessionTitle,
      date: newSessionDate,
      startTime: newSessionStart,
      endTime: newSessionEnd,
      sessionType: newSessionType,
      totalCapacity: Number(newSessionCapacity),
      walkInCapacity: Number(newSessionWalkInCap),
    });
    if (ok) {
      setNewSessionTitle('');
      setNewSessionServiceTypeId('');
      setNewSessionCapacity('');
      setNewSessionWalkInCap('');
      setIsNewSessionOpen(false);
    }
  };

  if (!currentHub) {
    return (
      <div className="mx-auto max-w-4xl px-10 py-16 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-sage-200 text-pine">
          <PhHospital size={32} />
        </div>
        <h2 className="text-2xl font-bold text-ink">
          {language === 'bn' ? 'কোনো হাব নিবন্ধিত নেই' : 'No Operational Hubs Found'}
        </h2>
        <p className="mt-2 text-sm text-slate">
          {language === 'bn'
            ? 'সিস্টেমে কোনো ডামি ডেটা নেই। শুরু করতে একটি নতুন হাব যুক্ত করুন অথবা লাইভ API থেকে ডেটা সিঙ্ক করুন।'
            : 'Zero dummy data in frontend. Register your first physical hub or sync live data from the backend to get started.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="primary" onClick={() => navigate('/hubs')}>
            {language === 'bn' ? 'হাব নিবন্ধন করুন' : 'Register New Hub'}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/sessions')}>
            {language === 'bn' ? 'সেশন শিডিউল করুন' : 'Schedule Session'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Top Banner / Hero Organic Section */}
      <div className="mb-7 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.04em] text-teal">
              {language === 'bn' ? 'অপারেশনাল কন্ট্রোল সেন্টার' : 'OPERATIONAL CONTROL CENTER'}
            </span>
            <StatusPill label={currentHub.status.replaceAll('_', ' ')} variant={currentHub.status === 'active' ? 'active' : 'draft'} />
          </div>
          <h1 className="m-0 font-ui text-[32px] font-semibold tracking-[-0.01em] text-ink">
            {language === 'bn' ? currentHub.nameBn || currentHub.name : currentHub.name}
          </h1>
          <p className="mt-1.5 mb-0 text-[15px] text-slate">
            {language === 'bn' ? currentHub.addressBn || currentHub.address : currentHub.address}
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
              {apiVisits ? `${apiVisits.completed} / ${apiVisits.expected}` : '—'}
            </div>
            <div className="text-xs text-sage-400">
              {language === 'bn' ? 'আজকের মোট রোগী সক্ষমতা' : 'Patients Served Today'}
            </div>
          </div>
        </div>
      </Card>

      {/* Operational Metrics 4-up Grid */}
      <div className="mb-8 grid grid-cols-4 gap-4.5">
        <Card variant="card" clickable onClick={() => navigate('/appointments')}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">{t.appointmentsToday}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-chip bg-sage-200 text-pine">
              <PhClipboardText size={18} />
            </div>
          </div>
          <div className="tabular-nums text-[32px] font-semibold text-ink">
            {dashboardOverview?.cards.appointmentsBookedToday.count ?? '—'}
          </div>
          <div className="mt-1.5 text-xs font-medium text-teal">
            {apiVisits?.checkedIn ?? '—'} {t.checkedIn}
          </div>
        </Card>

        <Card variant="card" clickable onClick={() => navigate('/queue')}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">{t.waiting} / {t.inService}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-chip bg-mist text-teal">
              <PhUsers size={18} />
            </div>
          </div>
          <div className="tabular-nums text-[32px] font-semibold text-clay">
            {apiVisits?.waiting ?? '—'} <span className="text-lg font-normal text-slate">+ {apiVisits?.inService ?? '—'}</span>
          </div>
          <div className="mt-1.5 text-xs text-slate">
            {t.avgWaitTime}: <strong className="text-ink">{dashboardOverview?.cards.timings.avgWaitingMinutes ?? '—'} {dashboardOverview?.cards.timings.avgWaitingMinutes != null ? 'mins' : ''}</strong>
          </div>
        </Card>

        <Card variant="card" clickable onClick={() => navigate('/exceptions')}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">{t.syncPending}</span>
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-chip ${pendingSyncCount > 0 ? 'bg-warn-bg text-warn-fg' : hubEncounters.length > 0 ? 'bg-ok-bg text-ok-fg' : 'bg-mist text-slate'
                }`}
            >
              <PhArrowsClockwise size={18} />
            </div>
          </div>
          <div className={`tabular-nums text-[32px] font-semibold ${pendingSyncCount > 0 ? 'text-warn' : hubEncounters.length > 0 ? 'text-ok' : 'text-slate'}`}>
            {hubEncounters.length > 0 ? pendingSyncCount : '—'}
          </div>
          <div className="mt-1.5 text-xs text-slate">
            {pendingSyncCount > 0 ? <span className="font-semibold text-warn">Pending, retrying or failed syncs in returned encounters</span>
              : hubEncounters.length > 0 ? <span className="text-ok">No pending or failed syncs reported</span>
                : <span className="text-slate">No encounters returned for the active sessions</span>}
          </div>
        </Card>

        <Card variant="card" clickable onClick={() => navigate('/equipment')}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate">{t.equipmentReady}</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-chip bg-sage-200 text-pine">
              <PhGauge size={18} />
            </div>
          </div>
          <div className="tabular-nums text-[32px] font-semibold text-ink">
            {equipment.filter((e) => e.hubId === selectedHubId && e.status === 'assigned').length} / {equipment.filter((e) => e.hubId === selectedHubId).length}
          </div>
          <div className={`mt-1.5 text-xs font-medium ${calibrationDueDevices > 0 ? 'text-bad' : 'text-slate'}`}>
            {calibrationDueDevices > 0 ? `${calibrationDueDevices} device calibration due` : equipment.some((e) => e.hubId === selectedHubId) ? 'No returned devices flagged calibration due' : 'No equipment records returned'}
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
            <Button variant="text" onClick={() => navigate('/queue')}>
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
                      {language === 'bn' ? item.patientNameBn || item.patientName : item.patientName}
                    </div>
                    <div className="text-[13px] text-slate">
                      {item.stationName} • {item.serviceType || '—'}
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
            <Button variant="text" onClick={() => navigate('/sessions')}>
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
                        {language === 'bn' ? session.titleBn || session.title : session.title}
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
                      Lead: {session.teamLeadName || 'Not assigned'}
                    </span>
                    <span className="flex items-center gap-1">
                      <PhCheckCircle size={14} color="#2F855A" />
                      Equipment readiness: {session.requiredEquipmentReady === true ? 'Ready per backend' : session.requiredEquipmentReady === false ? 'Not ready' : 'Not reported'}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Walk-in Registration Sheet */}
      <ModalSheet isOpen={issuedWalkInToken !== null} onClose={() => setIssuedWalkInToken(null)} title="Walk-in token issued">
        <p className="text-sm text-slate">Check-in completed. Queue token returned by the backend:</p>
        <div className="my-6 text-center text-4xl font-bold text-pine">{issuedWalkInToken}</div>
        <Button variant="primary" onClick={() => setIssuedWalkInToken(null)}>Done</Button>
      </ModalSheet>
      <ModalSheet
        isOpen={isWalkInOpen}
        onClose={() => !issuingWalkIn && setIsWalkInOpen(false)}
        title={t.addWalkIn}
        subtitle="Assisted arrival registration & queue assignment without clinical pre-entry"
      >
        <form onSubmit={handleWalkInSubmit} className="flex flex-col gap-4">
          {walkInError && <p role="alert" className="rounded-xl bg-bad-bg p-3 text-sm text-bad-fg">{walkInError}</p>}
          {activeSessions.length === 0 && <p role="status" className="text-sm text-warn-fg">No session is in progress. Start an eligible session from Sessions &amp; Health Camps before registering a walk-in.</p>}
          <label className="flex items-center gap-2 text-sm text-slate"><input type="checkbox" required /> I have confirmed this patient's identity.</label>
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
                onChange={(e) => setWalkInAge(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Gender (লিঙ্গ)
              </label>
              <select
                value={walkInGender}
                onChange={(e) => setWalkInGender(e.target.value as 'Female' | 'Male' | 'Other' | 'Unknown')}
                className={selectClass}
              >
                <option value="Female">Female (মহিলা)</option>
                <option value="Male">Male (পুরুষ)</option>
              </select>
            </div>
          </div>

      <div>
        <label className={labelClass}>Active session *</label>
        <select required value={walkInSessionId} onChange={(e) => setWalkInSessionId(e.target.value)} className={selectClass}>
          <option value="">Choose an in-progress session</option>
          {activeSessions.map((session) => <option key={session.id} value={session.id}>{session.title} — {session.date}</option>)}
        </select>
      </div>

          <WalkInSessionCapacity sessionId={isWalkInOpen ? walkInSessionId : ''} />
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" disabled={issuingWalkIn} onClick={() => setIsWalkInOpen(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={issuingWalkIn || !walkInSessionId}>
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

          <label className="flex flex-col gap-1 text-[13px] font-semibold text-slate">
            Service type *
            <select required value={newSessionServiceTypeId} onChange={(e) => setNewSessionServiceTypeId(e.target.value)} className={selectClass}>
              <option value="">Select service type</option>
              {serviceTypes.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[13px] font-semibold text-slate">
            Session type
            <select value={newSessionType} onChange={(e) => setNewSessionType(e.target.value as 'standard_clinic' | 'special_camp')} className={selectClass}>
              <option value="standard_clinic">Standard clinic</option>
              <option value="special_camp">Special camp</option>
            </select>
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1 text-[13px] font-semibold text-slate">Date<input required type="date" value={newSessionDate} onChange={(e) => setNewSessionDate(e.target.value)} className={inputClass} /></label>
            <label className="flex flex-col gap-1 text-[13px] font-semibold text-slate">Starts<input required type="time" value={newSessionStart} onChange={(e) => setNewSessionStart(e.target.value)} className={inputClass} /></label>
            <label className="flex flex-col gap-1 text-[13px] font-semibold text-slate">Ends<input required type="time" value={newSessionEnd} onChange={(e) => setNewSessionEnd(e.target.value)} className={inputClass} /></label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Total Slots
              </label>
              <input
                type="number"
                required
                min={1}
                value={newSessionCapacity}
                onChange={(e) => setNewSessionCapacity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Walk-in Capacity
              </label>
              <input
                type="number"
                required
                min={0}
                value={newSessionWalkInCap}
                onChange={(e) => setNewSessionWalkInCap(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <p className="m-0 rounded-ctl border border-line bg-bone p-3 text-xs text-slate">
            The backend validates session readiness when you publish or start the session.
          </p>

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
    </div>
  );
};
