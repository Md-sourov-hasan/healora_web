import React, { useState } from 'react';
import {
  PhMagnifyingGlass,
  PhCheckCircle,
  PhPlus,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';

export const AppointmentsView: React.FC = () => {
  const {
    t,
    language,
    appointments,
    selectedHubId,
    checkInAppointment,
    registerWalkIn,
  } = useApp();

  const [filterSearch, setFilterSearch] = useState('');
  const [isWalkInOpen, setIsWalkInOpen] = useState(false);

  // Walk-in form states
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInAge, setWalkInAge] = useState(52);
  const [walkInGender, setWalkInGender] = useState<'Female' | 'Male'>('Female');
  const [walkInService, setWalkInService] = useState('Basic Vitals & Cardio Followup');

  const hubAppointments = appointments.filter((a) => a.hubId === selectedHubId);

  const filtered = hubAppointments.filter(
    (a) =>
      a.patientName.toLowerCase().includes(filterSearch.toLowerCase()) ||
      a.patientNameBn.includes(filterSearch) ||
      a.appointmentCode.toLowerCase().includes(filterSearch.toLowerCase()) ||
      a.patientPhone.includes(filterSearch) ||
      (a.queueToken && a.queueToken.toLowerCase().includes(filterSearch.toLowerCase()))
  );

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
            {filtered.map((apt) => (
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
                    {language === 'bn' ? apt.patientNameBn : apt.patientName}
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
                    <button
                      type="button"
                      onClick={() => checkInAppointment(apt.id)}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-chip border-none bg-ink px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-ink-hover active:scale-[0.985]"
                    >
                      <span>{t.checkInPatient}</span>
                    </button>
                  ) : (
                    <span className="text-[13px] font-medium text-slate">
                      Already Checked In
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Walk-in Registration Sheet */}
      <ModalSheet
        isOpen={isWalkInOpen}
        onClose={() => setIsWalkInOpen(false)}
        title={t.addWalkIn}
        subtitle="Assisted arrival registration & queue assignment without clinical pre-entry"
      >
        <form onSubmit={handleWalkInSubmit} className="flex flex-col gap-4">
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
                onChange={(e) => setWalkInAge(Number(e.target.value))}
                className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 font-ui text-[15px] text-ink outline-none focus:border-teal"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Gender (লিঙ্গ)
              </label>
              <select
                value={walkInGender}
                onChange={(e) => setWalkInGender(e.target.value as 'Female' | 'Male')}
                className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 font-ui text-[15px] text-ink outline-none focus:border-teal"
              >
                <option value="Female">Female (মহিলা)</option>
                <option value="Male">Male (পুরুষ)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[13px] font-semibold text-slate">
              Service Requested (প্রয়োজনীয় সেবা)
            </label>
            <select
              value={walkInService}
              onChange={(e) => setWalkInService(e.target.value)}
              className="h-12 w-full rounded-xl border border-line bg-paper px-3.5 font-ui text-[15px] text-ink outline-none focus:border-teal"
            >
              <option value="Basic Vitals & Glucose Screening">Basic Vitals & Glucose Screening</option>
              <option value="Cardio & Hypertension Check">Cardio & Hypertension Check</option>
              <option value="Maternal Vitals Assessment">Maternal Vitals Assessment</option>
            </select>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsWalkInOpen(false)}>
              {t.cancel}
            </Button>
            <Button type="submit" variant="primary">
              Register &amp; Issue Ticket
            </Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
