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
import { useApp } from '../../context/AppContext';

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
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'bn' ? 'রোগী আগমন ও চেক-ইন' : 'ARRIVAL ROSTER & ASSISTED INTAKE'}
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
            {t.navAppointments}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#5B6B6E', fontSize: '14px' }}>
            {t.leastPrivilegeNote}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DDE5E1',
            borderRadius: '12px',
            padding: '10px 16px',
            flex: 1,
            boxShadow: '0 1px 2px rgba(11,31,34,.04)',
          }}
        >
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
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--ui)',
              fontSize: '14px',
              color: '#0B1F22',
            }}
          />
        </div>
      </div>

      {/* Appointments Table */}
      <Card variant="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--ui)' }}>
          <thead>
            <tr style={{ backgroundColor: '#F5F3EE', borderBottom: '1px solid #DDE5E1' }}>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Appt Code / Slot
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                {t.patientName}
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Service Requested
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Source
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Consent Status
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Status / Token
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase', textAlign: 'right' }}>
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((apt, idx) => (
              <tr
                key={apt.id}
                style={{
                  borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid #DDE5E1',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F3EE')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Code & Slot */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0B1F22' }}>
                    {apt.appointmentCode}
                  </div>
                  <div style={{ fontSize: '12px', color: '#1D6B66', fontWeight: 600 }} className="num-tabular">
                    {apt.slotTime}
                  </div>
                </td>

                {/* Patient Name & Phone */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#0B1F22' }}>
                    {language === 'bn' ? apt.patientNameBn : apt.patientName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5B6B6E' }} className="num-tabular">
                    {apt.patientPhone}
                  </div>
                </td>

                {/* Service */}
                <td style={{ padding: '16px 20px', fontSize: '14px', color: '#5B6B6E' }}>
                  {apt.serviceType}
                </td>

                {/* Booking Source */}
                <td style={{ padding: '16px 20px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      backgroundColor: '#E6EEEA',
                      color: '#0F3D3A',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {apt.bookingSource.replace('_', ' ')}
                  </span>
                </td>

                {/* Consent Status (PDPA 2026) */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#22643F' }}>
                    <PhCheckCircle size={14} color="#2F855A" />
                    <span>Informed Consent Active</span>
                  </div>
                </td>

                {/* Status & Token */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      <span
                        style={{
                          backgroundColor: '#0B1F22',
                          color: '#FFFFFF',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 700,
                        }}
                        className="num-tabular"
                      >
                        {apt.queueToken}
                      </span>
                    )}
                  </div>
                </td>

                {/* Action button */}
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  {apt.status === 'pending_confirmation' || apt.status === 'confirmed' ? (
                    <button
                      type="button"
                      onClick={() => checkInAppointment(apt.id)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        backgroundColor: '#0B1F22',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{t.checkInPatient}</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#5B6B6E', fontWeight: 500 }}>
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
        <form onSubmit={handleWalkInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
              Full Name (রোগীর পূর্ণ নাম) *
            </label>
            <input
              type="text"
              required
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              placeholder="e.g. Rahima Begum"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                border: '1px solid #DDE5E1',
                padding: '0 14px',
                fontSize: '15px',
                fontFamily: 'var(--ui)',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
              Contact Phone (মোবাইল নম্বর) *
            </label>
            <input
              type="text"
              required
              value={walkInPhone}
              onChange={(e) => setWalkInPhone(e.target.value)}
              placeholder="+880 1711 234567"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                border: '1px solid #DDE5E1',
                padding: '0 14px',
                fontSize: '15px',
                fontFamily: 'var(--ui)',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Age (বয়স)
              </label>
              <input
                type="number"
                value={walkInAge}
                onChange={(e) => setWalkInAge(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #DDE5E1',
                  padding: '0 14px',
                  fontSize: '15px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Gender (লিঙ্গ)
              </label>
              <select
                value={walkInGender}
                onChange={(e) => setWalkInGender(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #DDE5E1',
                  padding: '0 14px',
                  fontSize: '15px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="Female">Female (মহিলা)</option>
                <option value="Male">Male (পুরুষ)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
              Service Requested (প্রয়োজনীয় সেবা)
            </label>
            <select
              value={walkInService}
              onChange={(e) => setWalkInService(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                border: '1px solid #DDE5E1',
                padding: '0 14px',
                fontSize: '15px',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="Basic Vitals & Glucose Screening">Basic Vitals & Glucose Screening</option>
              <option value="Cardio & Hypertension Check">Cardio & Hypertension Check</option>
              <option value="Maternal Vitals Assessment">Maternal Vitals Assessment</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
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
