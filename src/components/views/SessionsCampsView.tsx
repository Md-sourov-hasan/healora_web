import React, { useEffect, useState, useCallback } from 'react';
import {
  PhCalendarBlank,
  PhCheckCircle,
  PhPlus,
  PhArrowsClockwise,
  PhWarningCircle,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { SegmentedTabs } from '../common/Tabs';
import { useApp } from '../../context/useApp';
import type { HubSession } from '../../types';
import { PublishSessionSheet } from './PublishSessionSheet';
import {
  sessionsService,
  type ApiSession,
  type SessionSlot,
  type SessionReadiness,
  type ApiSessionRecurrence,
} from '../../services/sessionsService';
import {
  stationsEquipmentService,
  type ApiSessionEquipmentLink,
} from '../../services/stationsEquipmentService';

export const SessionsCampsView: React.FC = () => {
  const {
    t,
    language,
    sessions,
    serviceTypes,
    equipment,
    stations,
    staff,
    selectedHubId,
    createSession,
    openBookingSession,
    startSession,
    completeSession,
    cancelSession,
    refreshBackendData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sessions' | 'recurrences'>('sessions');
  const [publishingSession, setPublishingSession] = useState<HubSession | null>(null);
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [selectedSessionForDetails, setSelectedSessionForDetails] = useState<HubSession | null>(null);
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Edit / Pause / Capacity modals
  const [editingSession, setEditingSession] = useState<HubSession | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editVenueAddress, setEditVenueAddress] = useState('');
  const [editTeamLeadId, setEditTeamLeadId] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  const [pausingSession, setPausingSession] = useState<HubSession | null>(null);
  const [pauseReason, setPauseReason] = useState('');
  const [resumingSession, setResumingSession] = useState<HubSession | null>(null);
  const [resumeReason, setResumeReason] = useState('');

  const [capacitySession, setCapacitySession] = useState<HubSession | null>(null);
  const [capBooked, setCapBooked] = useState('');
  const [capWalkIn, setCapWalkIn] = useState('');
  const [capReason, setCapReason] = useState('');
  const [capError, setCapError] = useState<string | null>(null);

  // Details drawer state (Readiness, Slots, Equipment)
  const [detailTab, setDetailTab] = useState<'readiness' | 'slots' | 'equipment'>('readiness');
  const [liveSessionDetail, setLiveSessionDetail] = useState<ApiSession | null>(null);
  const [readiness, setReadiness] = useState<SessionReadiness | null>(null);
  const [slots, setSlots] = useState<SessionSlot[]>([]);
  const [perSlotCapacity, setPerSlotCapacity] = useState('2');
  const [slotBlockReason, setSlotBlockReason] = useState('');
  const [sessionEquipment, setSessionEquipment] = useState<ApiSessionEquipmentLink[]>([]);
  const [assignEquipId, setAssignEquipId] = useState('');
  const [assignStationId, setAssignStationId] = useState('');
  const [assignMandatory, setAssignMandatory] = useState(true);
  const [detailBusy, setDetailBusy] = useState(false);
  const [detailFeedback, setDetailFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Recurrences state
  const [recurrences, setRecurrences] = useState<ApiSessionRecurrence[]>([]);
  const [loadingRecurrences, setLoadingRecurrences] = useState(false);
  const [isNewRecurrenceOpen, setIsNewRecurrenceOpen] = useState(false);
  const [recTitle, setRecTitle] = useState('');
  const [recServiceTypeId, setRecServiceTypeId] = useState('');
  const [recSessionType, setRecSessionType] = useState<'standard_clinic' | 'special_camp'>('standard_clinic');
  const [recRrule, setRecRrule] = useState('FREQ=WEEKLY;BYDAY=MO,WE');
  const [recStartTime, setRecStartTime] = useState('09:00');
  const [recEndTime, setRecEndTime] = useState('14:00');
  const [recStartsOn, setRecStartsOn] = useState('');
  const [recEndsOn, setRecEndsOn] = useState('');
  const [recAppointmentCap, setRecAppointmentCap] = useState('30');
  const [recWalkInCap, setRecWalkInCap] = useState('10');
  const [recSlotMinutes, setRecSlotMinutes] = useState('15');
  const [materializeUntil, setMaterializeUntil] = useState('');
  const [deactivateReason, setDeactivateReason] = useState('');
  const [recFeedback, setRecFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const dhakaToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date());

  // New session form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(dhakaToday);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('14:00');
  const [serviceTypeId, setServiceTypeId] = useState('');
  const [sessionType, setSessionType] = useState<'standard_clinic' | 'special_camp'>('standard_clinic');
  const [totalCapacity, setTotalCapacity] = useState('30');
  const [walkInCapacity, setWalkInCapacity] = useState('10');

  const hubSessions = sessions.filter((s) => s.hubId === selectedHubId);
  const hubEquipment = equipment.filter((e) => e.hubId === selectedHubId);
  const hubStations = stations.filter((s) => s.hubId === selectedHubId);

  const loadRecurrences = useCallback(async () => {
    if (!selectedHubId) return;
    setLoadingRecurrences(true);
    try {
      const res = await sessionsService.getRecurrences(selectedHubId);
      const list = Array.isArray(res) ? res : res.items ?? [];
      setRecurrences(list);
    } catch {
      setRecurrences([]);
    } finally {
      setLoadingRecurrences(false);
    }
  }, [selectedHubId]);

  useEffect(() => {
    if (activeTab === 'recurrences') {
      void loadRecurrences();
    }
  }, [activeTab, loadRecurrences]);

  const loadSessionDetails = useCallback(async (sessionId: string) => {
    setDetailBusy(true);
    setDetailFeedback(null);
    try {
      const [detailRes, readinessRes, slotsRes, equipRes] = await Promise.all([
        sessionsService.getSession(sessionId).catch(() => null),
        sessionsService.checkReadiness(sessionId).catch(() => null),
        sessionsService.getSlots(sessionId).catch(() => []),
        stationsEquipmentService.getSessionEquipment(sessionId).catch(() => []),
      ]);
      setLiveSessionDetail(detailRes);
      setReadiness(readinessRes);
      setSlots(Array.isArray(slotsRes) ? slotsRes : []);
      setSessionEquipment(Array.isArray(equipRes) ? equipRes : []);
    } finally {
      setDetailBusy(false);
    }
  }, []);

  const openSessionDetails = (session: HubSession) => {
    setSelectedSessionForDetails(session);
    setDetailTab('readiness');
    void loadSessionDetails(session.id);
  };

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
      setIsNewSessionOpen(false);
    }
  };

  const openEditModal = async (session: HubSession) => {
    setEditingSession(session);
    setEditTitle(session.title);
    setEditDate(session.date);
    setEditStartTime(session.startTime);
    setEditEndTime(session.endTime);
    setEditVenueAddress('');
    setEditTeamLeadId('');
    setEditError(null);
    try {
      const live = await sessionsService.getSession(session.id);
      if (live.venueAddress) setEditVenueAddress(live.venueAddress);
      if (live.teamLeadUserId) setEditTeamLeadId(live.teamLeadUserId);
    } catch {
      // ignore
    }
  };

  const handleUpdateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    setEditError(null);
    try {
      const startsAtIso = `${editDate}T${editStartTime.length === 5 ? `${editStartTime}:00` : editStartTime}+06:00`;
      const endsAtIso = `${editDate}T${editEndTime.length === 5 ? `${editEndTime}:00` : editEndTime}+06:00`;
      await sessionsService.updateSession(editingSession.id, {
        title: editTitle.trim(),
        sessionDate: editDate,
        startsAt: startsAtIso,
        endsAt: endsAtIso,
        venueAddress: editVenueAddress.trim() || undefined,
        teamLeadUserId: editTeamLeadId || undefined,
      });
      setEditingSession(null);
      await refreshBackendData();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update session.');
    }
  };

  const openCapacityModal = (session: HubSession) => {
    setCapacitySession(session);
    setCapBooked(String(session.totalCapacity));
    setCapWalkIn(String(session.walkInCapacity));
    setCapReason('Operational capacity adjustment');
    setCapError(null);
  };

  const handleUpdateCapacity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capacitySession || !capReason.trim()) return;
    setCapError(null);
    try {
      const live = await sessionsService.getSession(capacitySession.id);
      await sessionsService.updateCapacity(capacitySession.id, {
        appointmentCapacity: Number(capBooked),
        walkInCapacity: Number(capWalkIn),
        expectedVersion: live.version ?? 1,
        reason: capReason.trim(),
      });
      setCapacitySession(null);
      await refreshBackendData();
    } catch (err) {
      setCapError(err instanceof Error ? err.message : 'Failed to update capacity.');
    }
  };

  const handlePauseSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pausingSession || !pauseReason.trim()) return;
    try {
      await sessionsService.pause(pausingSession.id, pauseReason.trim());
      setPausingSession(null);
      setPauseReason('');
      await refreshBackendData();
    } catch {
      // error handled
    }
  };

  const handleResumeSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumingSession) return;
    try {
      await sessionsService.resume(resumingSession.id, resumeReason.trim() || undefined);
      setResumingSession(null);
      setResumeReason('');
      await refreshBackendData();
    } catch {
      // error handled
    }
  };

  const handleGenerateSlots = async () => {
    if (!selectedSessionForDetails) return;
    setDetailBusy(true);
    setDetailFeedback(null);
    try {
      await sessionsService.generateSlots(selectedSessionForDetails.id, {
        perSlotCapacity: Number(perSlotCapacity) || 1,
      });
      await loadSessionDetails(selectedSessionForDetails.id);
      setDetailFeedback({ type: 'ok', text: 'Time slots generated.' });
    } catch (err) {
      setDetailFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to generate slots.' });
    } finally {
      setDetailBusy(false);
    }
  };

  const handleBlockSlot = async (slotId: string) => {
    if (!selectedSessionForDetails) return;
    setDetailBusy(true);
    setDetailFeedback(null);
    try {
      await sessionsService.blockSlot(
        selectedSessionForDetails.id,
        slotId,
        slotBlockReason.trim() || 'Operational slot hold'
      );
      await loadSessionDetails(selectedSessionForDetails.id);
      setDetailFeedback({ type: 'ok', text: 'Slot blocked.' });
    } catch (err) {
      setDetailFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to block slot.' });
    } finally {
      setDetailBusy(false);
    }
  };

  const handleUnblockSlot = async (slotId: string) => {
    if (!selectedSessionForDetails) return;
    setDetailBusy(true);
    setDetailFeedback(null);
    try {
      await sessionsService.unblockSlot(selectedSessionForDetails.id, slotId);
      await loadSessionDetails(selectedSessionForDetails.id);
      setDetailFeedback({ type: 'ok', text: 'Slot unblocked.' });
    } catch (err) {
      setDetailFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to unblock slot.' });
    } finally {
      setDetailBusy(false);
    }
  };

  const handleAssignEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionForDetails || !assignEquipId) return;
    setDetailBusy(true);
    setDetailFeedback(null);
    try {
      await stationsEquipmentService.assignSessionEquipment(selectedSessionForDetails.id, {
        equipmentId: assignEquipId,
        stationId: assignStationId || undefined,
        mandatory: assignMandatory,
      });
      setAssignEquipId('');
      await loadSessionDetails(selectedSessionForDetails.id);
      await refreshBackendData();
      setDetailFeedback({ type: 'ok', text: 'Equipment allocated to session.' });
    } catch (err) {
      setDetailFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to allocate equipment.' });
    } finally {
      setDetailBusy(false);
    }
  };

  const handleUnassignEquipment = async (equipmentId: string) => {
    if (!selectedSessionForDetails) return;
    setDetailBusy(true);
    setDetailFeedback(null);
    try {
      await stationsEquipmentService.unassignSessionEquipment(selectedSessionForDetails.id, equipmentId);
      await loadSessionDetails(selectedSessionForDetails.id);
      await refreshBackendData();
      setDetailFeedback({ type: 'ok', text: 'Equipment removed from session.' });
    } catch (err) {
      setDetailFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to remove equipment.' });
    } finally {
      setDetailBusy(false);
    }
  };

  const handleCreateRecurrence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHubId || !recServiceTypeId || !recTitle.trim()) return;
    setRecFeedback(null);
    try {
      await sessionsService.createRecurrence({
        hubId: selectedHubId,
        serviceTypeId: recServiceTypeId,
        title: recTitle.trim(),
        sessionType: recSessionType,
        rrule: recRrule.trim(),
        startTime: recStartTime,
        endTime: recEndTime,
        startsOn: recStartsOn || dhakaToday,
        endsOn: recEndsOn || undefined,
        appointmentCapacity: Number(recAppointmentCap) || 20,
        walkInCapacity: Number(recWalkInCap) || 5,
        slotMinutes: Number(recSlotMinutes) || 15,
      });
      setIsNewRecurrenceOpen(false);
      setRecTitle('');
      await loadRecurrences();
      setRecFeedback({ type: 'ok', text: 'Recurring schedule created.' });
    } catch (err) {
      setRecFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to create recurrence.' });
    }
  };

  const handleMaterializeRecurrence = async (recId: string) => {
    const until = materializeUntil || dhakaToday;
    setRecFeedback(null);
    try {
      const res = await sessionsService.materializeRecurrence(recId, until);
      await refreshBackendData();
      setRecFeedback({
        type: 'ok',
        text: `Materialized recurring sessions through ${until} (${res.created ?? res.sessions?.length ?? 0} created).`,
      });
    } catch (err) {
      setRecFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to materialize sessions.' });
    }
  };

  const handleDeactivateRecurrence = async (recId: string) => {
    setRecFeedback(null);
    try {
      await sessionsService.deactivateRecurrence(recId, deactivateReason.trim() || 'Deactivated by hub operator');
      await loadRecurrences();
      setRecFeedback({ type: 'ok', text: 'Recurring schedule deactivated.' });
    } catch (err) {
      setRecFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to deactivate recurrence.' });
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

          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navSessions}</h1>
          <p className="mt-1 text-sm text-slate">
            {language === 'bn'
              ? 'নিয়মিত ক্লিনিক দিন ও বিশেষ পল্লী স্বাস্থ্য ক্যাম্পের সক্ষমতা ও প্রস্তুতি নিশ্চিতকরণ'
              : 'Configured clinic days, recurring templates, time slots, and device prerequisite validation'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'sessions' ? (
            <Button variant="primary" onClick={() => setIsNewSessionOpen(true)} icon={<PhPlus size={16} />}>
              {t.newSession}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                setRecStartsOn(dhakaToday);
                setIsNewRecurrenceOpen(true);
              }}
              icon={<PhPlus size={16} />}
            >
              {language === 'bn' ? 'নতুন রিকারিং শিডিউল' : 'New Recurring Schedule'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center justify-between">
        <SegmentedTabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as 'sessions' | 'recurrences')}
          options={[
            { key: 'sessions', label: language === 'bn' ? 'সেশন ও ক্যাম্প' : 'Sessions & Camps', count: hubSessions.length },
            { key: 'recurrences', label: language === 'bn' ? 'রিকারিং শিডিউল' : 'Recurring Schedules', count: recurrences.length },
          ]}
        />
      </div>

      {activeTab === 'sessions' ? (
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
                  : 'Click "+ New Session" above to schedule a clinic day or outreach camp.'}
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
                        variant={
                          session.status === 'in_progress'
                            ? 'in_service'
                            : session.status === 'paused'
                              ? 'paused'
                              : session.status === 'cancelled'
                                ? 'cancelled'
                                : 'upcoming'
                        }
                      />
                    </div>
                    <h2 className="m-0 text-lg font-semibold text-ink">
                      {language === 'bn' ? session.titleBn || session.title : session.title}
                    </h2>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => void openEditModal(session)}
                      className="cursor-pointer rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-ink hover:bg-bone"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => openCapacityModal(session)}
                      className="cursor-pointer rounded-lg border border-line bg-paper px-2.5 py-1 text-xs font-semibold text-pine hover:bg-bone"
                    >
                      Capacity
                    </button>
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
                        width: `${Math.min(100, (session.bookedCount / Math.max(1, session.totalCapacity)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Prerequisites Checklist */}
                <div className="mb-4.5 flex flex-col gap-1.5 text-xs">
                  <div
                    className={`flex items-center gap-1.5 ${
                      session.minimumStaffReady == null
                        ? 'text-slate'
                        : session.minimumStaffReady
                          ? 'text-ok-fg'
                          : 'text-bad-fg'
                    }`}
                  >
                    <PhCheckCircle
                      size={15}
                      color={
                        session.minimumStaffReady == null
                          ? '#718096'
                          : session.minimumStaffReady
                            ? '#2F855A'
                            : '#C53030'
                      }
                    />
                    <span>
                      Staffing readiness:{' '}
                      {session.minimumStaffReady == null
                        ? 'not reported'
                        : session.minimumStaffReady
                          ? 'ready'
                          : 'not ready'}
                      ; {session.teamLeadName || 'No team lead'}; {session.healthWorkersCount ?? '—'} HW,{' '}
                      {session.doctorsCount ?? '—'} doctors.
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      session.requiredEquipmentReady == null
                        ? 'text-slate'
                        : session.requiredEquipmentReady
                          ? 'text-ok-fg'
                          : 'text-bad-fg'
                    }`}
                  >
                    <PhCheckCircle
                      size={15}
                      color={
                        session.requiredEquipmentReady == null
                          ? '#718096'
                          : session.requiredEquipmentReady
                            ? '#2F855A'
                            : '#C53030'
                      }
                    />
                    <span>
                      Equipment readiness:{' '}
                      {session.requiredEquipmentReady == null
                        ? 'not reported'
                        : session.requiredEquipmentReady
                          ? 'ready'
                          : 'not ready'}
                      .
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5">
                  <button
                    type="button"
                    onClick={() => openSessionDetails(session)}
                    className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-teal hover:underline"
                  >
                    {language === 'bn' ? 'বিস্তারিত, স্লট ও ডিভাইস' : 'Readiness, Slots & Devices'}
                  </button>

                  <div className="flex flex-wrap gap-1.5">
                    {session.status === 'draft' && (
                      <button
                        type="button"
                        onClick={() => setPublishingSession(session)}
                        className="cursor-pointer rounded-lg border-none bg-teal px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Publish
                      </button>
                    )}
                    {session.status === 'published' && (
                      <button
                        type="button"
                        onClick={() => void openBookingSession(session.id)}
                        className="cursor-pointer rounded-lg border-none bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Open Booking
                      </button>
                    )}
                    {['published', 'open_for_booking', 'full'].includes(session.status) && (
                      <button
                        type="button"
                        onClick={() => void startSession(session.id)}
                        className="cursor-pointer rounded-lg border-none bg-ink px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Start Session
                      </button>
                    )}
                    {['open_for_booking', 'in_progress'].includes(session.status) && (
                      <button
                        type="button"
                        onClick={() => setPausingSession(session)}
                        className="cursor-pointer rounded-lg border border-warn/40 bg-warn-bg px-2.5 py-1.5 text-xs font-semibold text-warn-fg"
                      >
                        Pause
                      </button>
                    )}
                    {session.status === 'paused' && (
                      <button
                        type="button"
                        onClick={() => setResumingSession(session)}
                        className="cursor-pointer rounded-lg border border-teal bg-mist px-2.5 py-1.5 text-xs font-semibold text-pine"
                      >
                        Resume
                      </button>
                    )}
                    {session.status === 'in_progress' && (
                      <button
                        type="button"
                        onClick={() => void completeSession(session.id)}
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
      ) : (
        /* Recurrences Tab */
        <div className="space-y-4">
          {recFeedback && (
            <div
              className={`rounded-xl border p-3 text-xs font-medium ${
                recFeedback.type === 'ok'
                  ? 'border-ok/30 bg-ok-bg text-ok-fg'
                  : 'border-bad/30 bg-bad-bg text-bad-fg'
              }`}
            >
              {recFeedback.text}
            </div>
          )}

          <Card variant="card" className="p-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase text-teal">Materialize Horizon</div>
                <div className="text-xs text-slate">
                  Select target end date when materializing concrete clinic sessions from a recurring rule.
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-slate">
                  Materialize Until:{' '}
                  <input
                    type="date"
                    value={materializeUntil || dhakaToday}
                    onChange={(e) => setMaterializeUntil(e.target.value)}
                    className="ml-1.5 h-9 rounded-lg border border-line px-2.5 text-xs"
                  />
                </label>
                <input
                  type="text"
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder="Deactivation reason (optional)"
                  className="h-9 rounded-lg border border-line px-2.5 text-xs"
                />
                <Button
                  variant="small"
                  onClick={() => void loadRecurrences()}
                  icon={<PhArrowsClockwise size={14} />}
                >
                  Refresh
                </Button>
              </div>
            </div>
          </Card>

          {loadingRecurrences ? (
            <Card variant="card" className="p-8 text-center text-sm text-slate">
              Loading recurring schedules...
            </Card>
          ) : recurrences.length === 0 ? (
            <Card variant="card" className="p-8 text-center text-sm text-slate">
              No recurring session templates found for this hub. Click &ldquo;New Recurring Schedule&rdquo; to create one.
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {recurrences.map((rec) => {
                const isActive = rec.active !== false && rec.status !== 'inactive';
                return (
                  <Card key={rec.id} variant="card">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-sage-200 px-2 py-0.5 font-mono text-[11px] font-bold text-pine">
                            {rec.rrule}
                          </span>
                          <StatusPill
                            label={isActive ? 'ACTIVE' : 'INACTIVE'}
                            variant={isActive ? 'active' : 'cancelled'}
                          />
                        </div>
                        <h3 className="mt-2 text-base font-semibold text-ink">{rec.title}</h3>
                        <div className="mt-1 text-xs text-slate">
                          {rec.startTime} – {rec.endTime} • Starts {rec.startsOn}
                          {rec.endsOn ? ` → ${rec.endsOn}` : ''} • {rec.slotMinutes}m slots
                        </div>
                        <div className="mt-1 text-xs text-slate">
                          Capacity: <strong>{rec.appointmentCapacity}</strong> booked /{' '}
                          <strong>{rec.walkInCapacity}</strong> walk-in
                        </div>
                      </div>
                    </div>

                    {isActive && (
                      <div className="mt-4 flex justify-end gap-2 border-t border-line pt-3">
                        <Button
                          variant="small"
                          onClick={() => void handleMaterializeRecurrence(rec.id)}
                        >
                          Materialize Sessions
                        </Button>
                        <button
                          type="button"
                          onClick={() => void handleDeactivateRecurrence(rec.id)}
                          className="cursor-pointer rounded-lg border border-bad/40 px-3 py-1.5 text-xs font-semibold text-bad hover:bg-bad-bg"
                        >
                          Deactivate
                        </button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Publish Session Sheet */}
      {publishingSession && (
        <PublishSessionSheet
          key={publishingSession.id}
          session={publishingSession}
          onClose={() => setPublishingSession(null)}
        />
      )}

      {/* New Session Modal */}
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
            <select
              required
              value={serviceTypeId}
              onChange={(e) => setServiceTypeId(e.target.value)}
              className="h-12 w-full rounded-xl border border-line bg-paper px-3 text-sm"
            >
              <option value="">Select service type</option>
              {serviceTypes.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">Session Type</label>
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
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">Date</label>
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
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">Start Time</label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">End Time</label>
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
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">Booked Slots Limit</label>
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
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">Walk-In Buffer Slots</label>
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

      {/* Edit Session Modal */}
      <ModalSheet
        isOpen={!!editingSession}
        onClose={() => setEditingSession(null)}
        title="Edit Session Details"
        subtitle={editingSession?.title}
      >
        <form onSubmit={handleUpdateSession} className="space-y-3">
          {editError && (
            <div className="rounded-xl bg-bad-bg p-3 text-xs font-medium text-bad-fg">{editError}</div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Title *</label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Date *</label>
              <input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Starts At *</label>
              <input
                type="time"
                required
                value={editStartTime}
                onChange={(e) => setEditStartTime(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Ends At *</label>
              <input
                type="time"
                required
                value={editEndTime}
                onChange={(e) => setEditEndTime(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Team Lead</label>
            <select
              value={editTeamLeadId}
              onChange={(e) => setEditTeamLeadId(e.target.value)}
              className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm"
            >
              <option value="">Unassigned</option>
              {staff.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Venue Address (for Outreach Camps)</label>
            <input
              type="text"
              value={editVenueAddress}
              onChange={(e) => setEditVenueAddress(e.target.value)}
              placeholder="Optional camp venue location"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditingSession(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Adjust Capacity Modal */}
      <ModalSheet
        isOpen={!!capacitySession}
        onClose={() => setCapacitySession(null)}
        title="Adjust Session Capacity"
        subtitle={capacitySession?.title}
      >
        <form onSubmit={handleUpdateCapacity} className="space-y-3">
          {capError && (
            <div className="rounded-xl bg-bad-bg p-3 text-xs font-medium text-bad-fg">{capError}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Appointment Capacity *</label>
              <input
                type="number"
                required
                min={0}
                value={capBooked}
                onChange={(e) => setCapBooked(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Walk-In Capacity *</label>
              <input
                type="number"
                required
                min={0}
                value={capWalkIn}
                onChange={(e) => setCapWalkIn(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Reason for Capacity Change *</label>
            <input
              type="text"
              required
              value={capReason}
              onChange={(e) => setCapReason(e.target.value)}
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setCapacitySession(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Update Capacity
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Pause Session Modal */}
      <ModalSheet
        isOpen={!!pausingSession}
        onClose={() => setPausingSession(null)}
        title="Pause Session"
        subtitle={pausingSession?.title}
      >
        <form onSubmit={handlePauseSession} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Pause Reason *</label>
            <textarea
              rows={3}
              required
              value={pauseReason}
              onChange={(e) => setPauseReason(e.target.value)}
              placeholder="e.g. Temporary power backup switchover or equipment recalibration"
              className="w-full rounded-xl border border-line p-3 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPausingSession(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Pause Session
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Resume Session Modal */}
      <ModalSheet
        isOpen={!!resumingSession}
        onClose={() => setResumingSession(null)}
        title="Resume Session"
        subtitle={resumingSession?.title}
      >
        <form onSubmit={handleResumeSession} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Resume Note (Optional)</label>
            <input
              type="text"
              value={resumeReason}
              onChange={(e) => setResumeReason(e.target.value)}
              placeholder="e.g. Operations restored"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setResumingSession(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Resume Session
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* New Recurrence Modal */}
      <ModalSheet
        isOpen={isNewRecurrenceOpen}
        onClose={() => setIsNewRecurrenceOpen(false)}
        title="Create Recurring Schedule"
        subtitle="Define an RRULE recurrence pattern to materialize future clinic sessions"
      >
        <form onSubmit={handleCreateRecurrence} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Template Title *</label>
            <input
              type="text"
              required
              value={recTitle}
              onChange={(e) => setRecTitle(e.target.value)}
              placeholder="e.g. Weekly NCD Screening Clinic"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Service Type *</label>
              <select
                required
                value={recServiceTypeId}
                onChange={(e) => setRecServiceTypeId(e.target.value)}
                className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm"
              >
                <option value="">Select service type</option>
                {serviceTypes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Session Type</label>
              <select
                value={recSessionType}
                onChange={(e) => setRecSessionType(e.target.value as 'standard_clinic' | 'special_camp')}
                className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm"
              >
                <option value="standard_clinic">Standard Clinic</option>
                <option value="special_camp">Special Camp</option>
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">RRULE Expression *</label>
            <input
              type="text"
              required
              value={recRrule}
              onChange={(e) => setRecRrule(e.target.value)}
              placeholder="FREQ=WEEKLY;BYDAY=MO,WE"
              className="h-10 w-full rounded-xl border border-line px-3 font-mono text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Start Time *</label>
              <input
                type="time"
                required
                value={recStartTime}
                onChange={(e) => setRecStartTime(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">End Time *</label>
              <input
                type="time"
                required
                value={recEndTime}
                onChange={(e) => setRecEndTime(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Starts On *</label>
              <input
                type="date"
                required
                value={recStartsOn}
                onChange={(e) => setRecStartsOn(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Ends On (Optional)</label>
              <input
                type="date"
                value={recEndsOn}
                onChange={(e) => setRecEndsOn(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Booked Cap *</label>
              <input
                type="number"
                required
                min={1}
                value={recAppointmentCap}
                onChange={(e) => setRecAppointmentCap(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Walk-In Cap *</label>
              <input
                type="number"
                required
                min={0}
                value={recWalkInCap}
                onChange={(e) => setRecWalkInCap(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Slot Minutes *</label>
              <input
                type="number"
                required
                min={5}
                value={recSlotMinutes}
                onChange={(e) => setRecSlotMinutes(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsNewRecurrenceOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Recurrence
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Roster, Slots & Equipment Drawer */}
      {selectedSessionForDetails && (
        <ModalSheet
          isOpen={!!selectedSessionForDetails}
          onClose={() => setSelectedSessionForDetails(null)}
          title={`Session Control: ${selectedSessionForDetails.title}`}
          subtitle={`${selectedSessionForDetails.date} • ${selectedSessionForDetails.startTime} – ${selectedSessionForDetails.endTime}`}
        >
          <div className="flex flex-col gap-4">
            <SegmentedTabs
              activeKey={detailTab}
              onChange={(k) => setDetailTab(k as 'readiness' | 'slots' | 'equipment')}
              options={[
                { key: 'readiness', label: 'Readiness & Roster' },
                { key: 'slots', label: 'Time Slots', count: slots.length },
                { key: 'equipment', label: 'Devices', count: sessionEquipment.length },
              ]}
            />

            {detailFeedback && (
              <div
                className={`rounded-xl p-2.5 text-xs font-medium ${
                  detailFeedback.type === 'ok' ? 'bg-ok-bg text-ok-fg' : 'bg-bad-bg text-bad-fg'
                }`}
              >
                {detailFeedback.text}
              </div>
            )}

            {detailBusy && <div className="text-xs text-slate">Syncing with backend...</div>}

            {detailTab === 'readiness' && (
              <div className="space-y-3">
                <div className="rounded-xl bg-bone p-3.5 text-xs">
                  <div className="mb-1 font-semibold text-ink">Assigned Team & Venue</div>
                  <div className="space-y-1 text-slate">
                    <div>
                      • <strong>Team Lead:</strong>{' '}
                      {liveSessionDetail?.teamLeadName || selectedSessionForDetails.teamLeadName || 'Not assigned'}
                    </div>
                    <div>
                      • <strong>Health Workers:</strong>{' '}
                      {liveSessionDetail?.healthWorkersCount ?? selectedSessionForDetails.healthWorkersCount ?? 0}
                    </div>
                    <div>
                      • <strong>Doctors:</strong>{' '}
                      {liveSessionDetail?.doctorsCount ?? selectedSessionForDetails.doctorsCount ?? 0}
                    </div>
                    {liveSessionDetail?.venueAddress && (
                      <div>
                        • <strong>Venue:</strong> {liveSessionDetail.venueAddress}
                      </div>
                    )}
                  </div>
                </div>

                {readiness && (
                  <div className="rounded-xl border border-line p-3.5 text-xs">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-ink">Live Readiness Evaluation</span>
                      <StatusPill
                        label={readiness.ready ? 'READY' : 'UNMET PREREQUISITES'}
                        variant={readiness.ready ? 'active' : 'cancelled'}
                      />
                    </div>
                    {readiness.unmet.length === 0 && readiness.warnings.length === 0 ? (
                      <div className="text-ok-fg">All staffing, station, and equipment prerequisites satisfied.</div>
                    ) : (
                      <div className="space-y-1.5">
                        {readiness.unmet.map((issue, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-bad-fg">
                            <PhWarningCircle size={14} className="mt-0.5 shrink-0" />
                            <span>
                              <strong>[{issue.kind}]</strong> {issue.detail}
                            </span>
                          </div>
                        ))}
                        {readiness.warnings.map((warn, idx) => (
                          <div key={idx} className="flex items-start gap-1.5 text-warn-fg">
                            <PhWarningCircle size={14} className="mt-0.5 shrink-0" />
                            <span>
                              <strong>[{warn.kind}]</strong> {warn.detail}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {detailTab === 'slots' && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-end justify-between gap-2 rounded-xl bg-bone p-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate">Per-Slot Capacity</label>
                    <input
                      type="number"
                      min={1}
                      value={perSlotCapacity}
                      onChange={(e) => setPerSlotCapacity(e.target.value)}
                      className="mt-1 h-8 w-24 rounded-lg border border-line bg-paper px-2 text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate">Block Reason (if blocking)</label>
                    <input
                      type="text"
                      value={slotBlockReason}
                      onChange={(e) => setSlotBlockReason(e.target.value)}
                      placeholder="e.g. Lunch break / calibration"
                      className="mt-1 h-8 w-full rounded-lg border border-line bg-paper px-2 text-xs"
                    />
                  </div>
                  <Button
                    variant="small"
                    onClick={() => void handleGenerateSlots()}
                    icon={<PhCalendarBlank size={14} />}
                  >
                    Generate Slots
                  </Button>
                </div>

                {slots.length === 0 ? (
                  <div className="rounded-xl border border-line p-6 text-center text-xs text-slate">
                    No time slots generated for this session yet. Click &ldquo;Generate Slots&rdquo; above.
                  </div>
                ) : (
                  <div className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                    {slots.map((slot) => {
                      const startLabel = slot.startTime || (slot.startsAt ? slot.startsAt.slice(11, 16) : 'Slot');
                      const endLabel = slot.endTime || (slot.endsAt ? slot.endsAt.slice(11, 16) : '');
                      const cap = slot.capacity ?? slot.maxCapacity ?? 1;
                      return (
                        <div
                          key={slot.id}
                          className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2 text-xs"
                        >
                          <div>
                            <span className="font-mono font-semibold text-ink">
                              {startLabel}
                              {endLabel ? ` – ${endLabel}` : ''}
                            </span>
                            <span className="ml-2 text-slate">
                              Booked: {slot.bookedCount} / {cap}
                            </span>
                            {slot.blockedReason && (
                              <span className="ml-2 text-bad-fg">({slot.blockedReason})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusPill
                              label={slot.status}
                              variant={
                                slot.status === 'blocked'
                                  ? 'cancelled'
                                  : slot.status === 'full'
                                    ? 'paused'
                                    : 'active'
                              }
                            />
                            {slot.status === 'blocked' ? (
                              <button
                                type="button"
                                onClick={() => void handleUnblockSlot(slot.id)}
                                className="cursor-pointer rounded border border-teal px-2 py-0.5 text-[11px] font-semibold text-teal"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => void handleBlockSlot(slot.id)}
                                className="cursor-pointer rounded border border-bad/40 px-2 py-0.5 text-[11px] font-semibold text-bad"
                              >
                                Block
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {detailTab === 'equipment' && (
              <div className="space-y-3">
                <form onSubmit={handleAssignEquipment} className="space-y-2 rounded-xl bg-bone p-3">
                  <div className="text-xs font-semibold text-ink">Allocate Hub Device to Session</div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      required
                      value={assignEquipId}
                      onChange={(e) => setAssignEquipId(e.target.value)}
                      className="h-9 rounded-lg border border-line bg-paper px-2 text-xs"
                    >
                      <option value="">Select equipment...</option>
                      {hubEquipment.map((eq) => (
                        <option key={eq.id} value={eq.id}>
                          {eq.name} ({eq.category}) — {eq.status}
                        </option>
                      ))}
                    </select>
                    <select
                      value={assignStationId}
                      onChange={(e) => setAssignStationId(e.target.value)}
                      className="h-9 rounded-lg border border-line bg-paper px-2 text-xs"
                    >
                      <option value="">Any station</option>
                      {hubStations.map((st) => (
                        <option key={st.id} value={st.id}>
                          {st.code} — {st.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-slate">
                      <input
                        type="checkbox"
                        checked={assignMandatory}
                        onChange={(e) => setAssignMandatory(e.target.checked)}
                      />
                      Mandatory for session readiness
                    </label>
                    <Button variant="small" type="submit">
                      Allocate Device
                    </Button>
                  </div>
                </form>

                {sessionEquipment.length === 0 ? (
                  <div className="rounded-xl border border-line p-6 text-center text-xs text-slate">
                    No devices explicitly linked to this session yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {sessionEquipment.map((link) => (
                      <div
                        key={link.id}
                        className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-ink">
                            {link.equipment?.assetTag || link.equipmentId}{' '}
                            <span className="font-normal text-slate">
                              ({link.equipment?.category || 'device'})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate">
                            Station: {link.station?.name || 'Unassigned'} •{' '}
                            {link.mandatory ? 'Mandatory' : 'Optional'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleUnassignEquipment(link.equipmentId)}
                          className="cursor-pointer rounded border border-bad/40 px-2 py-1 text-[11px] font-semibold text-bad hover:bg-bad-bg"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="mt-2 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedSessionForDetails(null)}>
                Close
              </Button>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* Cancellation Modal */}
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
              if (ok) {
                setCancellingSessionId(null);
                setCancelReason('');
              }
            }
          }}
          className="space-y-4"
        >
          <p className="m-0 text-xs text-slate">
            The backend validates the cancellation and records the reason.
          </p>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">
              Cancellation Reason (Mandatory)
            </label>
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
            <Button variant="secondary" onClick={() => setCancellingSessionId(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="bg-bad! hover:bg-bad-fg!">
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
