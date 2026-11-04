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
import { useApp } from '../../context/AppContext';
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
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'bn' ? 'সেশন ও ক্যাম্প সময়সূচি' : 'SESSION ROSTER & CAPACITY CONTROLS'}
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
            {t.navSessions}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#5B6B6E', fontSize: '14px' }}>
            {language === 'bn'
              ? 'নিয়মিত ক্লিনিক দিন ও বিশেষ পল্লী স্বাস্থ্য ক্যাম্পের সক্ষমতা ও প্রস্তুতি নিশ্চিতকরণ'
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {hubSessions.map((session) => (
          <Card key={session.id} variant="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: session.sessionType === 'special_camp' ? '#F8EDD8' : '#CFE0D8',
                      color: session.sessionType === 'special_camp' ? '#80540F' : '#0F3D3A',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {session.sessionType.replace('_', ' ')}
                  </span>
                  <StatusPill
                    label={session.status.replace('_', ' ')}
                    variant={session.status === 'in_progress' ? 'in_service' : 'upcoming'}
                  />
                </div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#0B1F22' }}>
                  {language === 'bn' ? session.titleBn : session.title}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#5B6B6E', marginBottom: '16px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <PhCalendarBlank size={16} color="#1D6B66" />
                {session.date} • {session.startTime} – {session.endTime}
              </span>
            </div>

            {/* Capacity bars */}
            <div style={{ backgroundColor: '#F5F3EE', padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#0B1F22', marginBottom: '6px' }}>
                <span>
                  <strong>Booked:</strong> {session.bookedCount} / {session.totalCapacity} slots
                </span>
                <span>
                  <strong>Walk-ins:</strong> {session.walkInUsed} / {session.walkInCapacity}
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: '#CFE0D8', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, (session.bookedCount / session.totalCapacity) * 100)}%`,
                    height: '100%',
                    backgroundColor: '#1D6B66',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#5B6B6E', marginTop: '6px' }}>
                Overbooking Guard: Active (Hard-stop at slot limit + walk-in buffer)
              </div>
            </div>

            {/* Prerequisites Checklist (PRD Section 8.5) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: session.minimumStaffReady ? '#22643F' : '#9B2424' }}>
                <PhCheckCircle size={15} color={session.minimumStaffReady ? '#2F855A' : '#C53030'} />
                <span>
                  Staffing: Lead ({session.teamLeadName}), {session.healthWorkersCount} HWs, {session.doctorsCount} Doctor assigned.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: session.requiredEquipmentReady ? '#22643F' : '#9B2424' }}>
                <PhCheckCircle size={15} color={session.requiredEquipmentReady ? '#2F855A' : '#C53030'} />
                <span>
                  Equipment: BP, Glucometer &amp; Pulse Oximeter calibration certified.
                </span>
              </div>
              {session.overrideReason && (
                <div style={{ color: '#80540F', backgroundColor: '#F8EDD8', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>
                  Override Note: {session.overrideReason}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid #DDE5E1' }}>
              <button
                type="button"
                onClick={() => setSelectedSessionForDetails(session)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1D6B66',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {language === 'bn' ? 'বিস্তারিত রোস্টার দেখুন' : 'View Full Roster'}
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {session.status === 'open_for_booking' && (
                  <button
                    type="button"
                    onClick={() => showToast(`Session ${session.title} opened for live check-in.`)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#0B1F22',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Start Session
                  </button>
                )}
                {session.status === 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => showToast(`Session ${session.title} marked completed.`)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#E3F1E8',
                      color: '#22643F',
                      fontSize: '12px',
                      fontWeight: 600,
                      border: '1px solid #2F855A',
                      cursor: 'pointer',
                    }}
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
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
              Session / Camp Name *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Afternoon Diabetic & Hypertension Outreach"
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
                Session Type
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as any)}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #DDE5E1',
                  padding: '0 12px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <option value="standard_clinic">Standard Clinic Day</option>
                <option value="special_camp">Special Outreach Camp</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #DDE5E1',
                  padding: '0 12px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Start Time
              </label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="09:00 AM"
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #DDE5E1',
                  padding: '0 12px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                End Time
              </label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="02:00 PM"
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #DDE5E1',
                  padding: '0 12px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Booked Slots Limit
              </label>
              <input
                type="number"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #DDE5E1',
                  padding: '0 12px',
                  fontSize: '14px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Walk-In Buffer Slots
              </label>
              <input
                type="number"
                value={walkInCapacity}
                onChange={(e) => setWalkInCapacity(Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '12px',
                  border: '1px solid #DDE5E1',
                  padding: '0 12px',
                  fontSize: '14px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
              Override Reason (if staffing/equipment needs variance)
            </label>
            <input
              type="text"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="e.g. Single-worker screening authorized under Protocol v2.4"
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                border: '1px solid #DDE5E1',
                padding: '0 12px',
                fontSize: '14px',
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

      {/* Roster Details Drawer */}
      {selectedSessionForDetails && (
        <ModalSheet
          isOpen={!!selectedSessionForDetails}
          onClose={() => setSelectedSessionForDetails(null)}
          title={`Session Details: ${selectedSessionForDetails.title}`}
          subtitle="Operational parameters and verified staffing roster"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F5F3EE', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F22', marginBottom: '6px' }}>
                Assigned Team Roster:
              </div>
              <div style={{ fontSize: '13px', color: '#5B6B6E', lineHeight: 1.6 }}>
                • <strong>Team Lead:</strong> {selectedSessionForDetails.teamLeadName}
                <br />
                • <strong>Health Assistants:</strong> 2 Field Health Workers checked in
                <br />
                • <strong>Clinical Reviewer:</strong> Dr. Arjun Mehta (BMDC-A-45892)
              </div>
            </div>

            <div style={{ backgroundColor: '#E6EEEA', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F3D3A', marginBottom: '6px' }}>
                Equipment Checklist Status:
              </div>
              <div style={{ fontSize: '13px', color: '#0F3D3A', lineHeight: 1.6 }}>
                ✓ Omron HEM-7120 Digital BP Monitor (Calibrated)
                <br />
                ✓ Accu-Chek Instant Glucometer (Control solution verified)
                <br />
                ✓ Masimo MightySat Pulse Oximeter (95% battery)
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
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
