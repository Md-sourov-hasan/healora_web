import React from 'react';
import {
  PhShieldCheck,
  PhCheckCircle,
  PhMapPin,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { StatusPill } from '../common/StatusPill';
import { useApp } from '../../context/AppContext';

export const SettingsAuditView: React.FC = () => {
  const { t, language, auditLogs } = useApp();

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {language === 'bn' ? 'নিরাপত্তা ও আইনগত সম্মতি' : 'SECURITY, AUDIT TRAIL & REGULATORY GATES'}
          </span>
          <StatusPill label="Tier-IV Data Residency" variant="active" />
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
          {t.navAudit}
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#5B6B6E', fontSize: '14px' }}>
          {language === 'bn'
            ? 'অপরিবর্তনীয় সিস্টেম অডিট লগ ও বাংলাদেশ স্বাস্থ্য তথ্য সুরক্ষা গেজেট ২০২৬ বাস্তবায়ন'
            : 'Immutable system audit logging and compliance status under Bangladesh PDPA 2026 & DGHS Telehealth Guidelines'}
        </p>
      </div>

      {/* Compliance Overview Grid (PRD Section 17) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
        <Card variant="card" style={{ borderTop: '3px solid #1D6B66' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <PhShieldCheck size={20} color="#1D6B66" />
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0B1F22' }}>
              Personal Data Protection Act, 2026
            </h2>
          </div>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#5B6B6E', lineHeight: 1.5 }}>
            Health-related information classified as sensitive personal data. Specific, voluntary informed consent captured for each hub encounter.
          </p>
          <StatusPill label="Act No. 63 of 2026 Compliant" variant="completed" />
        </Card>

        <Card variant="card" style={{ borderTop: '3px solid #1D6B66' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <PhMapPin size={20} color="#1D6B66" />
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0B1F22' }}>
              DGHS Telehealth Data Residency
            </h2>
          </div>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#5B6B6E', lineHeight: 1.5 }}>
            Zero foreign cloud storage for patient vitals. Primary database and encrypted backups hosted within Bangladesh at AP-DCC Gazipur Tier-IV.
          </p>
          <StatusPill label="Local Residency Verified" variant="completed" />
        </Card>

        <Card variant="card" style={{ borderTop: '3px solid #1D6B66' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <PhCheckCircle size={20} color="#1D6B66" />
            <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0B1F22' }}>
              BMDC Telemedicine Guidelines
            </h2>
          </div>
          <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#5B6B6E', lineHeight: 1.5 }}>
            Registered practitioner verification, explicit consent for remote consultations, and health worker measurement provenance preserved.
          </p>
          <StatusPill label="BMDC Framework Aligned" variant="completed" />
        </Card>
      </div>

      {/* Immutable Audit Log Table (PRD Section 16.2) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F22', margin: 0 }}>
            {language === 'bn' ? 'অপরিবর্তনীয় অডিট ট্রেইল (সর্বশেষ কার্যক্রম)' : 'Immutable Operations Audit Trail'}
          </h2>
          <span style={{ fontSize: '12px', color: '#5B6B6E' }}>
            Append-only verification log • <strong>{auditLogs.length} events logged</strong>
          </span>
        </div>

        <Card variant="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--ui)' }}>
            <thead>
              <tr style={{ backgroundColor: '#F5F3EE', borderBottom: '1px solid #DDE5E1' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Timestamp
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Actor &amp; Role
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Action Executed
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Scope / Hub
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Audit Details
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase', textAlign: 'right' }}>
                  Outcome
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, idx) => (
                <tr
                  key={log.id}
                  style={{
                    borderBottom: idx === auditLogs.length - 1 ? 'none' : '1px solid #DDE5E1',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F3EE')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Timestamp */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5B6B6E' }} className="num-tabular">
                    {log.timestamp}
                  </td>

                  {/* Actor & Role */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0B1F22' }}>
                      {log.actorName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#1D6B66', textTransform: 'uppercase', fontWeight: 600 }}>
                      {log.actorRole.replace('_', ' ')}
                    </div>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: '#0B1F22', fontWeight: 500 }}>
                    {log.action}
                  </td>

                  {/* Scope */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5B6B6E' }}>
                    {log.hubName}
                  </td>

                  {/* Details */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5B6B6E', maxWidth: '320px' }}>
                    {log.details}
                  </td>

                  {/* Outcome */}
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <StatusPill
                      label={log.outcome.toUpperCase()}
                      variant={
                        log.outcome === 'success'
                          ? 'completed'
                          : log.outcome === 'flagged'
                            ? 'awaiting'
                            : 'declined'
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
