import React, { useEffect, useState, useCallback } from 'react';
import {
  PhMagnifyingGlass,
  PhCheckCircle,
  PhPlus,
  PhArrowsClockwise,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { SegmentedTabs } from '../common/Tabs';
import { WalkInSessionCapacity, describeWalkInError } from './WalkInSessionCapacity';
import { useApp } from '../../context/useApp';
import { patientsService, type ApiPatient } from '../../services/patientsService';
import { sessionsService, type SessionSlot } from '../../services/sessionsService';
import { appointmentsService, type ApiAppointment, type WaitlistEntry } from '../../services/appointmentsService';
import { formatApiTime } from '../../services/apiMappers';

export const AppointmentsView: React.FC = () => {
  const {
    t,
    language,
    appointments,
    selectedHubId,
    sessions,
    checkInAppointment,
    markAppointmentNoShow,
    createAppointment,
    registerWalkIn,
    refreshBackendData,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'appointments' | 'waitlist'>('appointments');
  const [filterSearch, setFilterSearch] = useState('');
  const [sessionFilterId, setSessionFilterId] = useState<string>('');
  const [sessionRosterOverride, setSessionRosterOverride] = useState<ApiAppointment[] | null>(null);
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isBookApptOpen, setIsBookApptOpen] = useState(false);

  // Appointment Detail / Reschedule / Cancel modals
  const [inspectingAppt, setInspectingAppt] = useState<ApiAppointment | null>(null);
  const [reschedulingApptId, setReschedulingApptId] = useState<string | null>(null);
  const [reschedSessionId, setReschedSessionId] = useState('');
  const [reschedSlots, setReschedSlots] = useState<SessionSlot[]>([]);
  const [reschedSlotId, setReschedSlotId] = useState('');
  const [cancellingApptId, setCancellingApptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Waitlist states
  const [waitlistSessionId, setWaitlistSessionId] = useState('');
  const [waitlistItems, setWaitlistItems] = useState<WaitlistEntry[]>([]);
  const [waitlistPhoneLookup, setWaitlistPhoneLookup] = useState('');
  const [waitlistMatches, setWaitlistMatches] = useState<ApiPatient[]>([]);
  const [waitlistPatientId, setWaitlistPatientId] = useState('');
  const [removingWaitlistId, setRemovingWaitlistId] = useState<string | null>(null);
  const [removeWaitlistReason, setRemoveWaitlistReason] = useState('');

  // Book Appt Form states
  const [bookSessionId, setBookSessionId] = useState('');
  const [patientLookup, setPatientLookup] = useState('');
  const [patientMatches, setPatientMatches] = useState<ApiPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [availableSlots, setAvailableSlots] = useState<SessionSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');

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

  const dhakaToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka' }).format(new Date());
  const hubAppointments = appointments.filter((a) => a.hubId === selectedHubId);
  const hubSessions = sessions.filter((s) => s.hubId === selectedHubId);
  const bookableSessions = sessions.filter((session) => session.hubId === selectedHubId && ['published', 'open_for_booking', 'in_progress'].includes(session.status));
  const activeSessions = sessions.filter((session) => session.hubId === selectedHubId && session.status === 'in_progress');
  const todayActiveSessions = activeSessions.filter((s) => s.date === dhakaToday);
  const selectedSession = activeSessions.find((s) => s.id === walkInSessionId);
  const isSelectedSessionToday = selectedSession ? selectedSession.date === dhakaToday : false;

  useEffect(() => {
    if (isWalkInOpen && !walkInSessionId && todayActiveSessions.length > 0) {
      setWalkInSessionId(todayActiveSessions[0].id);
    }
  }, [isWalkInOpen, todayActiveSessions, walkInSessionId]);

  useEffect(() => {
    if (!waitlistSessionId && hubSessions.length > 0) {
      setWaitlistSessionId(hubSessions[0].id);
    }
  }, [hubSessions, waitlistSessionId]);

  const loadSessionRoster = useCallback(async (sid: string) => {
    if (!sid) {
      setSessionRosterOverride(null);
      return;
    }
    try {
      const res = await appointmentsService.getSessionAppointments(sid);
      setSessionRosterOverride(res.items || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load session roster');
      setSessionRosterOverride(null);
    }
  }, [showToast]);

  useEffect(() => {
    void loadSessionRoster(sessionFilterId);
  }, [sessionFilterId, loadSessionRoster]);

  const loadWaitlist = useCallback(async (sid: string) => {
    if (!sid) {
      setWaitlistItems([]);
      return;
    }
    try {
      const res = await appointmentsService.getWaitlist(sid);
      setWaitlistItems(res.items || []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load waitlist');
      setWaitlistItems([]);
    }
  }, [showToast]);

  useEffect(() => {
    if (activeTab === 'waitlist' && waitlistSessionId) {
      void loadWaitlist(waitlistSessionId);
    }
  }, [activeTab, waitlistSessionId, loadWaitlist]);

  useEffect(() => {
    let active = true;
    if (!bookSessionId) { setAvailableSlots([]); setSelectedSlotId(''); return; }
    sessionsService.getSlots(bookSessionId).then((rows) => {
      if (active) { setAvailableSlots(rows.filter((slot) => slot.status === 'available')); setSelectedSlotId(''); }
    }).catch((error) => {
      if (active) { setAvailableSlots([]); setSelectedSlotId(''); }
      showToast(error instanceof Error ? error.message : 'Could not load session slots.');
    });
    return () => { active = false; };
  }, [bookSessionId, showToast]);

  useEffect(() => {
    let active = true;
    if (!reschedSessionId) { setReschedSlots([]); setReschedSlotId(''); return; }
    sessionsService.getSlots(reschedSessionId).then((rows) => {
      if (active) { setReschedSlots(rows.filter((slot) => slot.status === 'available')); setReschedSlotId(''); }
    }).catch(() => {
      if (active) { setReschedSlots([]); setReschedSlotId(''); }
    });
    return () => { active = false; };
  }, [reschedSessionId]);

  const baseAppointments = sessionFilterId
    ? hubAppointments.filter((a) => a.sessionId === sessionFilterId)
    : hubAppointments;

  const filtered = baseAppointments.filter(
    (a) =>
      a.patientName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      a.patientNameBn.includes(filterSearch) ||
      a.appointmentCode.toLowerCase().includes(filterSearch.toLowerCase()) ||
      a.patientPhone.includes(filterSearch) ||
      (a.queueToken && a.queueToken.toLowerCase().includes(filterSearch.toLowerCase()))
  );

  const handleConfirmAppt = async (id: string) => {
    try {
      await appointmentsService.confirm(id);
      showToast('Appointment confirmed');
      await refreshBackendData();
      if (sessionFilterId) await loadSessionRoster(sessionFilterId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to confirm appointment');
    }
  };

  const handleMarkArrived = async (id: string) => {
    try {
      await appointmentsService.markArrived(id);
      showToast('Patient marked as arrived at hub reception');
      await refreshBackendData();
      if (sessionFilterId) await loadSessionRoster(sessionFilterId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to mark arrived');
    }
  };

  const handleInspectAppointment = async (id: string) => {
    try {
      const detail = await appointmentsService.getAppointment(id);
      setInspectingAppt(detail);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to load appointment details');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApptId || !reschedSessionId) return;
    try {
      await appointmentsService.reschedule(reschedulingApptId, {
        sessionId: reschedSessionId,
        slotId: reschedSlotId || undefined,
      });
      showToast('Appointment rescheduled');
      setReschedulingApptId(null);
      setReschedSessionId('');
      setReschedSlotId('');
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reschedule appointment');
    }
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingApptId || !cancelReason.trim()) return;
    try {
      await appointmentsService.cancel(cancellingApptId, cancelReason.trim());
      showToast('Appointment cancelled');
      setCancellingApptId(null);
      setCancelReason('');
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel appointment');
    }
  };

  const handleWaitlistLookup = async () => {
    if (!selectedHubId || !waitlistPhoneLookup.trim()) return;
    try {
      const res = await patientsService.lookup({ by: 'phone', value: waitlistPhoneLookup.trim(), hubId: selectedHubId });
      setWaitlistMatches(res.matches);
      if (res.matches[0]) setWaitlistPatientId(res.matches[0].id);
      if (!res.matches.length) showToast('No patient found for this phone number');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Patient lookup failed');
    }
  };

  const handleAddToWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistSessionId || !waitlistPatientId) return;
    try {
      await appointmentsService.addToWaitlist(waitlistSessionId, { patientId: waitlistPatientId });
      showToast('Patient added to session waitlist');
      setWaitlistPatientId('');
      setWaitlistMatches([]);
      setWaitlistPhoneLookup('');
      await loadWaitlist(waitlistSessionId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add to waitlist');
    }
  };

  const handleOfferWaitlist = async (entryId: string) => {
    try {
      await appointmentsService.offerWaitlist(entryId);
      showToast('Waitlist spot offered and booked');
      await loadWaitlist(waitlistSessionId);
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to offer waitlist spot');
    }
  };

  const handleRemoveWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!removingWaitlistId || !removeWaitlistReason.trim()) return;
    try {
      await appointmentsService.removeFromWaitlist(removingWaitlistId, removeWaitlistReason.trim());
      showToast('Removed from waitlist');
      setRemovingWaitlistId(null);
      setRemoveWaitlistReason('');
      await loadWaitlist(waitlistSessionId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove from waitlist');
    }
  };

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

  const handlePatientLookup = async () => {
    if (!selectedHubId || !patientLookup.trim()) return;
    try {
      const response = await patientsService.lookup({ by: 'phone', value: patientLookup.trim(), hubId: selectedHubId });
      setPatientMatches(response.matches);
      setSelectedPatientId('');
      if (!response.matches.length) showToast('No patient matched this phone. Register the patient before booking.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Patient lookup failed.');
      setPatientMatches([]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'রোগী আগমন ও চেক-ইন' : 'ARRIVAL ROSTER & ASSISTED INTAKE'}
            </span>
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navAppointments}
          </h1>
          <p className="mt-1 mb-0 text-sm text-slate">
            {t.leastPrivilegeNote}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsBookApptOpen(true)}
            icon={<PhPlus size={16} />}
          >
            {language === 'bn' ? 'নতুন বুকিং' : 'Book Appointment'}
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsWalkInOpen(true)}
            icon={<PhPlus size={16} />}
          >
            {t.addWalkIn}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <SegmentedTabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as 'appointments' | 'waitlist')}
          options={[
            { key: 'appointments', label: language === 'bn' ? 'অ্যাপয়েন্টমেন্ট রোস্টার' : 'Appointments Roster', count: filtered.length },
            { key: 'waitlist', label: language === 'bn' ? 'সেশন ওয়েটলিস্ট' : 'Session Waitlist', count: waitlistItems.length },
          ]}
        />

        {activeTab === 'appointments' && (
          <div className="flex items-center gap-2">
            <select
              value={sessionFilterId}
              onChange={(e) => setSessionFilterId(e.target.value)}
              className="h-10 rounded-xl border border-line bg-paper px-3 text-xs font-medium text-ink"
            >
              <option value="">All Hub Sessions</option>
              {hubSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.date})
                </option>
              ))}
            </select>
            {sessionRosterOverride && (
              <span className="rounded-lg bg-mist px-2.5 py-1 text-xs font-semibold text-pine">
                Roster API: {sessionRosterOverride.length} expected
              </span>
            )}
          </div>
        )}
      </div>

      {activeTab === 'appointments' ? (
        <>
          {/* Search Bar & Filters */}
          <div className="mb-5 flex items-center gap-3">
            <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-line bg-paper px-4 py-2.5 shadow-2xs">
              <PhMagnifyingGlass size={18} color="#1D6B66" />
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder={
                  language === 'bn'
                    ? 'রোগীর নাম, ফোন নম্বর, বা অ্যাপয়েন্টমেন্ট কোড দিয়ে খুঁজুন...'
                    : 'Filter by patient name, phone (+880...), appointment code or token...'
                }
                className="flex-1 border-none bg-transparent font-ui text-sm text-ink outline-none placeholder:text-slate/70"
              />
            </div>
          </div>

          {/* Appointments Table */}
          <Card variant="card" className="p-0! overflow-hidden">
            <table className="w-full border-collapse text-left font-ui">
              <thead>
                <tr className="border-b border-line bg-bone">
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                    Appt Code / Slot
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                    {t.patientName}
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                    Service Requested
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                    Source
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                    Consent Status
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                    Status / Token
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase text-slate">
                    {t.actions}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate">
                      {filterSearch
                        ? (language === 'bn' ? 'কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি' : 'No appointments matching search')
                        : (language === 'bn' ? 'কোনো অ্যাপয়েন্টমেন্ট নেই। উপরে "নতুন বুকিং" বা "ওয়াক-ইন আগমন" বাটনে ক্লিক করুন।' : 'No appointments booked yet. Click "Book Appointment" or "Add Walk-In" to register.')}
                    </td>
                  </tr>
                ) : (
                  filtered.map((apt) => (
                    <tr
                      key={apt.id}
                      className="border-b border-line transition-colors duration-100 last:border-b-0 hover:bg-bone"
                    >
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => void handleInspectAppointment(apt.id)}
                          className="cursor-pointer border-0 bg-transparent p-0 text-left text-sm font-semibold text-ink underline decoration-dotted hover:text-teal"
                        >
                          {apt.appointmentCode}
                        </button>
                        <div className="tabular-nums text-xs font-semibold text-teal">
                          {apt.slotTime}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-[15px] font-semibold text-ink">
                          {language === 'bn' ? apt.patientNameBn || apt.patientName : apt.patientName}
                        </div>
                        <div className="tabular-nums text-xs text-slate">
                          {apt.patientPhone}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate">
                        {apt.serviceType}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-mist px-2 py-0.75 text-[11px] font-semibold uppercase text-pine">
                          {apt.bookingSource.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-ok-fg">
                          <PhCheckCircle size={14} color="#2F855A" />
                          <span>Informed Consent Active</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <StatusPill
                            label={apt.status.replace('_', ' ')}
                            variant={
                              apt.status === 'in_service'
                                ? 'in_service'
                                : apt.status === 'checked_in' || apt.status === 'arrived'
                                  ? 'upcoming'
                                  : apt.status === 'completed'
                                    ? 'completed'
                                    : 'draft'
                            }
                          />
                          {apt.queueToken && (
                            <span className="tabular-nums rounded-md bg-ink px-2 py-0.5 text-xs font-bold text-white">
                              {apt.queueToken}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {['pending_confirmation', 'confirmed', 'arrived'].includes(apt.status) ? (
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            {apt.status === 'pending_confirmation' && (
                              <button
                                type="button"
                                onClick={() => void handleConfirmAppt(apt.id)}
                                className="cursor-pointer rounded-chip border border-teal bg-mist px-2.5 py-1.5 text-xs font-semibold text-pine"
                              >
                                Confirm
                              </button>
                            )}
                            {(apt.status === 'pending_confirmation' || apt.status === 'confirmed') && (
                              <button
                                type="button"
                                onClick={() => void handleMarkArrived(apt.id)}
                                className="cursor-pointer rounded-chip border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-mist"
                              >
                                Arrived
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => void checkInAppointment(apt.id)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-chip border-none bg-ink px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-ink-hover"
                            >
                              <span>{t.checkInPatient}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setReschedulingApptId(apt.id);
                                setReschedSessionId(apt.sessionId);
                              }}
                              className="cursor-pointer rounded-chip border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-slate hover:text-ink"
                            >
                              Reschedule
                            </button>
                            <button
                              type="button"
                              onClick={() => setCancellingApptId(apt.id)}
                              className="cursor-pointer rounded-chip border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-bad hover:bg-bad-bg"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void markAppointmentNoShow(apt.id)}
                              className="cursor-pointer rounded-chip border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-slate hover:text-bad"
                            >
                              No-Show
                            </button>
                          </div>
                        ) : apt.status === 'no_show' ? (
                          <span className="text-xs font-semibold text-bad">No-Show Recorded</span>
                        ) : apt.status === 'cancelled' ? (
                          <span className="text-xs font-semibold text-slate">Cancelled</span>
                        ) : (
                          <span className="text-[13px] font-medium text-slate">
                            Checked In {apt.queueToken ? `(${apt.queueToken})` : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </>
      ) : (
        /* TAB 2: SESSION WAITLIST */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="p-5 lg:col-span-1">
            <h3 className="mt-0 mb-3 text-base font-semibold text-ink">Add Patient to Waitlist</h3>
            <form onSubmit={(e) => void handleAddToWaitlist(e)} className="flex flex-col gap-3.5">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Select Session*</label>
                <select
                  required
                  value={waitlistSessionId}
                  onChange={(e) => setWaitlistSessionId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm"
                >
                  <option value="">Choose session</option>
                  {hubSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title} — {s.date}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">Lookup Patient by Phone*</label>
                <div className="flex gap-2">
                  <input
                    value={waitlistPhoneLookup}
                    onChange={(e) => setWaitlistPhoneLookup(e.target.value)}
                    placeholder="+8801..."
                    className="h-10 flex-1 rounded-xl border border-line bg-white px-3 text-sm"
                  />
                  <Button type="button" variant="secondary" onClick={() => void handleWaitlistLookup()}>
                    Lookup
                  </Button>
                </div>
              </div>
              {waitlistMatches.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate">Matched Patient*</label>
                  <select
                    required
                    value={waitlistPatientId}
                    onChange={(e) => setWaitlistPatientId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-line bg-white px-3 text-sm"
                  >
                    {waitlistMatches.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.fullName} ({p.healoraCode})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <Button type="submit" variant="primary" fullWidth disabled={!waitlistSessionId || !waitlistPatientId}>
                Add to Session Waitlist
              </Button>
            </form>
          </Card>

          <Card className="overflow-hidden p-0 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-line bg-bone px-5 py-3.5">
              <span className="text-xs font-bold uppercase text-slate">
                Session Waitlist Queue ({waitlistItems.length})
              </span>
              <Button
                variant="text"
                icon={<PhArrowsClockwise size={14} />}
                onClick={() => void loadWaitlist(waitlistSessionId)}
              >
                Refresh
              </Button>
            </div>
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-canvas text-[11px] font-semibold uppercase text-slate">
                  <th className="px-5 py-3">Position / Patient</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Added</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {waitlistItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-xs text-slate">
                      No waitlist entries for the selected session.
                    </td>
                  </tr>
                ) : (
                  waitlistItems.map((w, idx) => {
                    const pat = (w as unknown as { patient?: { fullName?: string; healoraCode?: string } }).patient;
                    return (
                      <tr key={w.id} className="border-b border-line">
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-ink">
                            #{idx + 1} • {pat?.fullName || w.patientName || w.patientId}
                          </div>
                          {pat?.healoraCode && <div className="text-xs text-slate">{pat.healoraCode}</div>}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusPill label={w.status} variant={w.status === 'booked' ? 'completed' : 'awaiting'} />
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate">{w.createdAt?.slice(0, 16)}</td>
                        <td className="px-5 py-3.5 text-right">
                          {(w.status === 'waiting' || w.status === 'offered') && (
                            <div className="flex justify-end gap-2">
                              <Button variant="small" onClick={() => void handleOfferWaitlist(w.id)}>
                                Offer &amp; Book
                              </Button>
                              <Button variant="text" onClick={() => setRemovingWaitlistId(w.id)}>
                                Remove
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Modal: Inspect Appointment Detail */}
      <ModalSheet
        isOpen={Boolean(inspectingAppt)}
        onClose={() => setInspectingAppt(null)}
        title={inspectingAppt ? `Appointment ${inspectingAppt.code}` : 'Appointment Details'}
      >
        {inspectingAppt && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="rounded-xl border border-line bg-canvas p-4">
              <div><strong>Patient:</strong> {inspectingAppt.patient?.fullName} ({inspectingAppt.patient?.healoraCode})</div>
              <div><strong>Status:</strong> {inspectingAppt.status}</div>
              <div><strong>Source:</strong> {inspectingAppt.source}</div>
              <div><strong>Assignment Basis:</strong> {inspectingAppt.hubAssignmentBasis || '—'}</div>
              <div><strong>Session:</strong> {inspectingAppt.session?.title || inspectingAppt.sessionId} ({inspectingAppt.session?.sessionDate || '—'})</div>
              {inspectingAppt.slot && (
                <div><strong>Slot:</strong> {formatApiTime(inspectingAppt.slot.startsAt)} – {formatApiTime(inspectingAppt.slot.endsAt)}</div>
              )}
            </div>
          </div>
        )}
      </ModalSheet>

      {/* Modal: Reschedule Appointment */}
      <ModalSheet
        isOpen={Boolean(reschedulingApptId)}
        onClose={() => setReschedulingApptId(null)}
        title="Reschedule Appointment"
      >
        <form onSubmit={(e) => void handleRescheduleSubmit(e)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
            Target Session*
            <select
              required
              value={reschedSessionId}
              onChange={(e) => setReschedSessionId(e.target.value)}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-normal"
            >
              <option value="">Choose session</option>
              {bookableSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} — {s.date}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
            Target Slot (Optional)
            <select
              value={reschedSlotId}
              onChange={(e) => setReschedSlotId(e.target.value)}
              className="h-10 rounded-xl border border-line bg-white px-3 text-sm font-normal"
            >
              <option value="">Any available capacity</option>
              {reschedSlots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {formatApiTime(slot.startTime || slot.startsAt)} – {formatApiTime(slot.endTime || slot.endsAt)}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" variant="primary" fullWidth>
            Confirm Reschedule
          </Button>
        </form>
      </ModalSheet>

      {/* Modal: Cancel Appointment */}
      <ModalSheet
        isOpen={Boolean(cancellingApptId)}
        onClose={() => setCancellingApptId(null)}
        title="Cancel Appointment"
      >
        <form onSubmit={(e) => void handleCancelSubmit(e)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
            Reason for Cancellation*
            <textarea
              required
              minLength={5}
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Patient requested cancellation / unable to attend..."
              className="rounded-xl border border-line bg-white p-3 text-sm font-normal"
            />
          </label>
          <Button type="submit" variant="primary" fullWidth>
            Confirm Cancel Appointment
          </Button>
        </form>
      </ModalSheet>

      {/* Modal: Remove from Waitlist */}
      <ModalSheet
        isOpen={Boolean(removingWaitlistId)}
        onClose={() => setRemovingWaitlistId(null)}
        title="Remove from Waitlist"
      >
        <form onSubmit={(e) => void handleRemoveWaitlist(e)} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
            Removal Reason*
            <textarea
              required
              minLength={5}
              rows={3}
              value={removeWaitlistReason}
              onChange={(e) => setRemoveWaitlistReason(e.target.value)}
              placeholder="Booked at another hub / no longer needed..."
              className="rounded-xl border border-line bg-white p-3 text-sm font-normal"
            />
          </label>
          <Button type="submit" variant="primary" fullWidth>
            Confirm Remove
          </Button>
        </form>
      </ModalSheet>

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
          {activeSessions.length === 0 ? (
            <p role="status" className="rounded-xl bg-warn-bg p-3 text-xs font-medium text-warn-fg">
              ⚠️ No session is currently in progress. Start an eligible session from <strong>Sessions &amp; Health Camps</strong> before registering a walk-in.
            </p>
          ) : todayActiveSessions.length === 0 ? (
            <div role="status" className="rounded-xl bg-warn-bg p-3 text-xs font-medium text-warn-fg">
              <p className="font-semibold">⚠️ No session is active for today ({dhakaToday}):</p>
              <p className="mt-1">
                Clinical protocol requires check-ins to happen on the scheduled session day. Currently running sessions are from other dates. Please start or create a session for <strong>{dhakaToday}</strong> in <strong>Sessions &amp; Health Camps</strong>.
              </p>
            </div>
          ) : null}
          <label className="flex items-center gap-2 text-sm text-slate"><input type="checkbox" required /> I have confirmed this patient's identity.</label>
          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate">
              Full Name (রোগীর পূর্ণ নাম) *
            </label>
            <input
              type="text"
              required
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              placeholder="e.g. Rahima Begum"
              className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 font-ui text-[15px] text-ink outline-none focus:border-teal"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate">
              Contact Phone (মোবাইল নম্বর) *
            </label>
            <input
              type="text"
              required
              value={walkInPhone}
              onChange={(e) => setWalkInPhone(e.target.value)}
              placeholder="+880 1711 234567"
              className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 font-ui text-[15px] text-ink outline-none focus:border-teal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Age (বয়স)
              </label>
              <input
                type="number"
                value={walkInAge}
                onChange={(e) => setWalkInAge(e.target.value)}
                className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 font-ui text-[15px] text-ink outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Gender (লিঙ্গ)
              </label>
              <select
                value={walkInGender}
                onChange={(e) => setWalkInGender(e.target.value as 'Female' | 'Male' | 'Other' | 'Unknown')}
                className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 font-ui text-[15px] text-ink outline-none focus:border-teal"
              >
                <option value="Unknown">Unknown</option><option value="Other">Other</option><option value="Female">Female (মহিলা)</option>
                <option value="Male">Male (পুরুষ)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate">Active session *</label>
            <select
              required
              value={walkInSessionId}
              onChange={(e) => setWalkInSessionId(e.target.value)}
              className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 font-ui text-[15px] text-ink"
            >
              <option value="">Choose an in-progress session</option>
              {activeSessions.map((session) => {
                const isToday = session.date === dhakaToday;
                return (
                  <option key={session.id} value={session.id} disabled={!isToday}>
                    {session.title} — {session.date} {isToday ? '✓ (Today - Eligible)' : '⚠️ (Not Today - Check-in Disabled)'}
                  </option>
                );
              })}
            </select>
            {selectedSession && !isSelectedSessionToday && (
              <p role="alert" className="mt-1.5 rounded-lg bg-bad-bg p-2 text-xs font-semibold text-bad-fg">
                ⚠️ This session is scheduled for {selectedSession.date}. Check-in is only allowed on the exact session date ({dhakaToday}).
              </p>
            )}
          </div>

          <WalkInSessionCapacity sessionId={isWalkInOpen ? walkInSessionId : ''} />
          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" disabled={issuingWalkIn} onClick={() => setIsWalkInOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={issuingWalkIn || !walkInSessionId || (selectedSession ? !isSelectedSessionToday : false)}
            >
              Register &amp; Issue Ticket
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Book New Appointment Modal */}
      <ModalSheet
        isOpen={isBookApptOpen}
        onClose={() => setIsBookApptOpen(false)}
        title="Schedule Health Hub Appointment"
        subtitle="Reserve dedicated time slot with automated capacity deduction"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const ok = await createAppointment({
              sessionId: bookSessionId,
              patientId: selectedPatientId,
              slotId: selectedSlotId || undefined,
              bookingSource: 'operations_assignment',
            });
            if (ok) {
              setPatientLookup('');
              setPatientMatches([]);
              setSelectedPatientId('');
              setBookSessionId('');
              setIsBookApptOpen(false);
            }
          }}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
            Session *
            <select required value={bookSessionId} onChange={(e) => setBookSessionId(e.target.value)} className="h-10 rounded-xl border border-line px-3 text-sm font-normal">
              <option value="">Choose session</option>
              {bookableSessions.map((session) => <option key={session.id} value={session.id}>{session.title} — {session.date}</option>)}
            </select>
          </label>

          <div className="flex gap-2">
            <input type="tel" required value={patientLookup} onChange={(e) => setPatientLookup(e.target.value)} placeholder="Patient phone number" className="h-10 flex-1 rounded-xl border border-line px-3 text-sm" />
            <Button type="button" variant="secondary" onClick={handlePatientLookup}>Look up</Button>
          </div>

          {patientMatches.length > 0 && (
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
              API patient record *
              <select required value={selectedPatientId} onChange={(e) => setSelectedPatientId(e.target.value)} className="h-10 rounded-xl border border-line px-3 text-sm font-normal">
                <option value="">Choose patient</option>
                {patientMatches.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName} · {patient.healoraCode}</option>)}
              </select>
            </label>
          )}

          <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
            Available slot
            <select value={selectedSlotId} onChange={(e) => setSelectedSlotId(e.target.value)} className="h-10 rounded-xl border border-line px-3 text-sm font-normal">
              <option value="">No slot selected</option>
              {availableSlots.map((slot) => <option key={slot.id} value={slot.id}>{formatApiTime(slot.startTime || slot.startsAt)} – {formatApiTime(slot.endTime || slot.endsAt)}</option>)}
            </select>
          </label>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsBookApptOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={!selectedPatientId || !bookSessionId}>Confirm Booking</Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
