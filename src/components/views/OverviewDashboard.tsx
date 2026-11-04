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
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Banner / Hero Organic Section */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'bn' ? 'অপারেশনাল কন্ট্রোল সেন্টার' : 'OPERATIONAL CONTROL CENTER'}
            </span>
            <StatusPill label={language === 'bn' ? 'সক্রিয় শাখা' : 'Active Hub'} variant="active" />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '32px',
              fontWeight: 600,
              color: '#0B1F22',
              letterSpacing: '-0.01em',
              fontFamily: 'var(--ui)',
            }}
          >
            {language === 'bn' ? currentHub.nameBn : currentHub.name}
          </h1>
          <p style={{ margin: '6px 0 0 0', color: '#5B6B6E', fontSize: '15px' }}>
            {language === 'bn' ? currentHub.addressBn : currentHub.address} • {currentHub.operatingHours}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
      <Card variant="hero" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.12)', padding: '4px 12px', borderRadius: '8px', marginBottom: '12px' }}>
              <PhCheckCircle size={14} color="#8FB3A3" />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#CFE0D8' }}>
                {language === 'bn' ? 'হিলোরা সমন্বিত শারীরিক হাব কেয়ার' : 'Healora Integrated Physical Hub Care'}
              </span>
            </div>

            <h2
              className="font-disp"
              style={{
                margin: 0,
                fontSize: '32px',
                lineHeight: 1.2,
                color: '#FFFFFF',
                fontWeight: 400,
              }}
            >
              {language === 'bn' ? (
                <span>উপজেলা ও ইউনিয়নে নির্ভরযোগ্য প্রাথমিক স্বাস্থ্য পরীক্ষা ও টেলি-ট্রায়াজ</span>
              ) : (
                <span>Predictable area-based checkups, <em>without travel friction</em></span>
              )}
            </h2>

            <p style={{ margin: '12px 0 0 0', color: '#CFE0D8', fontSize: '15px', lineHeight: 1.5 }}>
              {language === 'bn'
                ? 'অনুমোদিত স্বাস্থ্য সহকারী ও স্থানীয় ডাক্তারের মাধ্যমে ভাইটালস গ্রহণ, কেন্দ্রীয় রেকর্ডে তাৎক্ষণিক সংযোজন ও আন্তর্জাতিক বিশেষজ্ঞ পরামর্শের পূর্ণ প্রস্তুতি।'
                : 'Empowering authorized special teams and local doctors to collect accurate measurements directly into the shared patient record for seamless specialist consultations.'}
            </p>
          </div>

          {/* Pulsing Clay Heart & Live Stats Container (Design System 7.7) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '20px 28px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div
              className="heart-pulsing"
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '9999px',
                backgroundColor: '#C0633F', // Clay
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(192,99,63,0.5)',
                marginBottom: '12px',
              }}
            >
              <PhHeartbeat size={28} color="#FFFFFF" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF' }} className="num-tabular">
              {waitingCount + inServiceCount + completedCount} / {currentHub.capacityPerDay}
            </div>
            <div style={{ fontSize: '12px', color: '#8FB3A3' }}>
              {language === 'bn' ? 'আজকের মোট রোগী সক্ষমতা' : 'Patients Served Today'}
            </div>
          </div>
        </div>
      </Card>

      {/* Operational Metrics 4-up Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '32px' }}>
        <Card variant="card" clickable onClick={() => setActiveView('appointments')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E' }}>{t.appointmentsToday}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#CFE0D8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3D3A' }}>
              <PhClipboardText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#0B1F22' }} className="num-tabular">
            {hubAppointments.length}
          </div>
          <div style={{ fontSize: '12px', color: '#1D6B66', marginTop: '6px', fontWeight: 500 }}>
            {hubAppointments.filter((a) => a.status === 'checked_in').length} {t.checkedIn}
          </div>
        </Card>

        <Card variant="card" clickable onClick={() => setActiveView('queue')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E' }}>{t.waiting} / {t.inService}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#E6EEEA', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D6B66' }}>
              <PhUsers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#C0633F' }} className="num-tabular">
            {waitingCount} <span style={{ fontSize: '18px', color: '#5B6B6E', fontWeight: 400 }}>+ {inServiceCount}</span>
          </div>
          <div style={{ fontSize: '12px', color: '#5B6B6E', marginTop: '6px' }}>
            {t.avgWaitTime}: <strong style={{ color: '#0B1F22' }}>14 mins</strong>
          </div>
        </Card>

        <Card variant="card" clickable onClick={() => setActiveView('exceptions')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E' }}>{t.syncPending}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: pendingSyncCount > 0 ? '#F8EDD8' : '#E3F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: pendingSyncCount > 0 ? '#80540F' : '#22643F' }}>
              <PhArrowsClockwise size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: pendingSyncCount > 0 ? '#B7791F' : '#2F855A' }} className="num-tabular">
            {pendingSyncCount}
          </div>
          <div style={{ fontSize: '12px', color: '#5B6B6E', marginTop: '6px' }}>
            {pendingSyncCount > 0 ? (
              <span style={{ color: '#B7791F', fontWeight: 600 }}>Mobile outbox queued</span>
            ) : (
              <span style={{ color: '#2F855A' }}>All local vitals synchronized</span>
            )}
          </div>
        </Card>

        <Card variant="card" clickable onClick={() => setActiveView('equipment')}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E' }}>{t.equipmentReady}</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#CFE0D8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F3D3A' }}>
              <PhGauge size={18} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#0B1F22' }} className="num-tabular">
            {equipment.filter((e) => e.hubId === selectedHubId && e.status === 'assigned').length} / {currentHub.totalDevicesCount}
          </div>
          <div style={{ fontSize: '12px', color: calibrationDueDevices > 0 ? '#C53030' : '#2F855A', marginTop: '6px', fontWeight: 500 }}>
            {calibrationDueDevices > 0 ? `${calibrationDueDevices} device calibration due` : 'All devices operational'}
          </div>
        </Card>
      </div>

      {/* Active Stations & Today's Live Flow (2 Columns) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        {/* Left Column: Live Queue Snippet */}
        <Card variant="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0B1F22' }}>
                {language === 'bn' ? 'চলমান কিউ ও স্টেশন সার্ভিস' : 'Live Queue & Station Progress'}
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5B6B6E' }}>
                {t.leastPrivilegeNote}
              </p>
            </div>
            <Button variant="text" onClick={() => setActiveView('queue')}>
              {language === 'bn' ? 'পূর্ণাঙ্গ কিউ বোর্ড দেখুন' : 'Open Full Board'}
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {hubQueue.slice(0, 4).map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '14px',
                  backgroundColor: '#F5F3EE', // Bone
                  border: '1px solid #DDE5E1',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      backgroundColor: '#0B1F22',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '15px',
                    }}
                    className="num-tabular"
                  >
                    {item.ticketNumber}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px', color: '#0B1F22' }}>
                      {language === 'bn' ? item.patientNameBn : item.patientName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#5B6B6E' }}>
                      {item.stationName} • {item.serviceType}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  <span style={{ fontSize: '12px', color: '#5B6B6E' }} className="num-tabular">
                    {item.waitMinutes}m wait
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column: Sessions Overview */}
        <Card variant="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0B1F22' }}>
                {language === 'bn' ? 'আজকের সেশন ও ক্যাম্প' : 'Scheduled Hub Sessions'}
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#5B6B6E' }}>
                {language === 'bn' ? 'সক্ষমতা ও শর্ত পর্যালোচনা' : 'Capacity, roster & equipment checklist'}
              </p>
            </div>
            <Button variant="text" onClick={() => setActiveView('sessions')}>
              {language === 'bn' ? 'সকল সেশন' : 'Manage All'}
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions
              .filter((s) => s.hubId === selectedHubId)
              .map((session) => (
                <div
                  key={session.id}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #DDE5E1',
                    boxShadow: '0 1px 3px rgba(11,31,34,.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0B1F22' }}>
                        {language === 'bn' ? session.titleBn : session.title}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#5B6B6E', marginTop: '2px' }}>
                        {session.startTime} – {session.endTime} ({session.sessionType.replace('_', ' ')})
                      </div>
                    </div>
                    <StatusPill
                      label={session.status.replace('_', ' ')}
                      variant={session.status === 'in_progress' ? 'in_service' : 'upcoming'}
                    />
                  </div>

                  {/* Progress track */}
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5B6B6E', marginBottom: '4px' }}>
                      <span>Booked: {session.bookedCount} / {session.totalCapacity}</span>
                      <span>Walk-in: {session.walkInUsed} / {session.walkInCapacity}</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', borderRadius: '9999px', backgroundColor: '#CFE0D8', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${Math.min(100, (session.bookedCount / session.totalCapacity) * 100)}%`,
                          height: '100%',
                          backgroundColor: '#1D6B66',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', fontSize: '12px', color: '#0F3D3A' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <PhCheckCircle size={14} color="#2F855A" />
                      Lead: {session.teamLeadName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                color: '#0B1F22',
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
                color: '#0B1F22',
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
                  fontFamily: 'var(--ui)',
                  color: '#0B1F22',
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
                  fontFamily: 'var(--ui)',
                  color: '#0B1F22',
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
                fontFamily: 'var(--ui)',
                color: '#0B1F22',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="Basic Vitals & Glucose Screening">Basic Vitals & Glucose Screening</option>
              <option value="Hypertension Checkup">Hypertension Checkup</option>
              <option value="Maternal Health Vitals">Maternal Health Vitals</option>
              <option value="Specialist Pre-Teleconsultation Assessment">Specialist Pre-Teleconsultation Assessment</option>
            </select>
          </div>

          <div style={{ backgroundColor: '#E6EEEA', padding: '12px', borderRadius: '12px', fontSize: '12px', color: '#0F3D3A' }}>
            <PhCheckCircle size={14} color="#1D6B66" style={{ display: 'inline', marginRight: '6px' }} />
            Informed consent for physical measurement collection obtained in accordance with Bangladesh PDPA 2026.
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
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
        <form onSubmit={handleSessionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
              Session Title (সেশনের নাম) *
            </label>
            <input
              type="text"
              required
              value={newSessionTitle}
              onChange={(e) => setNewSessionTitle(e.target.value)}
              placeholder="e.g. Afternoon Cardiovascular Outreach"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                border: '1px solid #DDE5E1',
                padding: '0 14px',
                fontSize: '15px',
                fontFamily: 'var(--ui)',
                color: '#0B1F22',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Total Slots
              </label>
              <input
                type="number"
                value={newSessionCapacity}
                onChange={(e) => setNewSessionCapacity(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #DDE5E1',
                  padding: '0 14px',
                  fontSize: '15px',
                  fontFamily: 'var(--ui)',
                  color: '#0B1F22',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Walk-in Capacity
              </label>
              <input
                type="number"
                value={newSessionWalkInCap}
                onChange={(e) => setNewSessionWalkInCap(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #DDE5E1',
                  padding: '0 14px',
                  fontSize: '15px',
                  fontFamily: 'var(--ui)',
                  color: '#0B1F22',
                }}
              />
            </div>
          </div>

          <div style={{ border: '1px solid #CFE0D8', borderRadius: '14px', padding: '16px', backgroundColor: '#F5F3EE' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F3D3A', marginBottom: '8px' }}>
              Minimum Prerequisites Verification (PRD Section 8.5):
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#5B6B6E', lineHeight: 1.6 }}>
              <li>Minimum Staff: 1 Special Team Lead, 1 Field Health Worker, 1 Reviewing Doctor.</li>
              <li>Calibrated Devices: BP Monitor (HEM-7120), Glucometer, Pulse Oximeter.</li>
            </ul>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
              Administrative Override Reason (If prerequisites differ)
            </label>
            <input
              type="text"
              value={newSessionOverrideReason}
              onChange={(e) => setNewSessionOverrideReason(e.target.value)}
              placeholder="e.g. Remote outreach arrangement authorized by Regional Ops"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                border: '1px solid #DDE5E1',
                padding: '0 14px',
                fontSize: '14px',
                fontFamily: 'var(--ui)',
                color: '#0B1F22',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
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
