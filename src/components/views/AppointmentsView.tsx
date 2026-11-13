import React, { useEffect, useState } from 'react';
import {
  PhMagnifyingGlass,
  PhCheckCircle,
  PhPlus,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { WalkInSessionCapacity, describeWalkInError } from './WalkInSessionCapacity';
import { useApp } from '../../context/useApp';
import { patientsService, type ApiPatient } from '../../services/patientsService';
import { sessionsService, type SessionSlot } from '../../services/sessionsService';
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
    showToast,
  } = useApp();

  const [filterSearch, setFilterSearch] = useState('');
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);
  const [isBookApptOpen, setIsBookApptOpen] = useState(false);

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

  const hubAppointments = appointments.filter((a) => a.hubId === selectedHubId);
  const bookableSessions = sessions.filter((session) => session.hubId === selectedHubId && ['published', 'open_for_booking', 'in_progress'].includes(session.status));
  const activeSessions = sessions.filter((session) => session.hubId === selectedHubId && session.status === 'in_progress');

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
  }, [bookSessionId]);

  const filtered = hubAppointments.filter(
    (a) =>
      a.patientName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      a.patientNameBn.includes(filterSearch) ||
      a.appointmentCode.toLowerCase().includes(filterSearch.toLowerCase()) ||
      a.patientPhone.includes(filterSearch) ||
      (a.queueToken && a.queueToken.toLowerCase().includes(filterSearch.toLowerCase()))
  );

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
                <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate">
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
                {/* Code & Slot */}
                <td className="px-5 py-4">
                  <div className="text-sm font-semibold text-ink">
                    {apt.appointmentCode}
                  </div>
                  <div className="tabular-nums text-xs font-semibold text-teal">
                    {apt.slotTime}
                  </div>
                </td>

                {/* Patient Name & Phone */}
                <td className="px-5 py-4">
                  <div className="text-[15px] font-semibold text-ink">
                    {language === 'bn' ? apt.patientNameBn || apt.patientName : apt.patientName}
                  </div>
                  <div className="tabular-nums text-xs text-slate">
                    {apt.patientPhone}
                  </div>
                </td>

                {/* Service */}
                <td className="px-5 py-4 text-sm text-slate">
                  {apt.serviceType}
                </td>

                {/* Booking Source */}
                <td className="px-5 py-4">
                  <span className="rounded-md bg-mist px-2 py-0.75 text-[11px] font-semibold uppercase text-pine">
                    {apt.bookingSource.replace('_', ' ')}
                  </span>
                </td>

                {/* Consent Status (PDPA 2026) */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1.5 text-xs text-ok-fg">
                    <PhCheckCircle size={14} color="#2F855A" />
                    <span>Informed Consent Active</span>
                  </div>
                </td>

                {/* Status & Token */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <StatusPill
                      label={apt.status.replace('_', ' ')}
                      variant={
                        apt.status === 'in_service'
                          ? 'in_service'
                          : apt.status === 'checked_in'
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

                {/* Action button */}
                <td className="px-5 py-4 text-right">
                  {apt.status === 'pending_confirmation' || apt.status === 'confirmed' ? (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => checkInAppointment(apt.id)}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-chip border-none bg-ink px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-ink-hover active:scale-[0.985]"
                      >
                        <span>{t.checkInPatient}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => markAppointmentNoShow(apt.id)}
                        className="cursor-pointer rounded-chip border border-line bg-paper px-2.5 py-2 text-xs font-semibold text-slate hover:text-bad"
                      >
                        No-Show
                      </button>
                    </div>
                  ) : apt.status === 'no_show' ? (
                    <span className="text-xs font-semibold text-bad">No-Show Recorded</span>
                  ) : (
                    <span className="text-[13px] font-medium text-slate">
                      Checked In ({apt.queueToken})
                    </span>
                  )}
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </Card>

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
            <select required value={walkInSessionId} onChange={(e) => setWalkInSessionId(e.target.value)} className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 font-ui text-[15px] text-ink">
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
              {availableSlots.map((slot) => <option key={slot.id} value={slot.id}>{formatApiTime(slot.startTime)} – {formatApiTime(slot.endTime)}</option>)}
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
