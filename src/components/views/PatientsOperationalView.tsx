import React, { useState } from 'react';
import {
  PhMagnifyingGlass,
  PhCheckCircle,
  PhShieldCheck,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { Patient } from '../../types';

export const PatientsOperationalView: React.FC = () => {
  const { t, language, patients, showToast } = useApp();
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filtered = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.fullNameBn.includes(search) ||
      p.canonicalHealoraId.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search)
  );

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {language === 'bn' ? 'তথ্য গোপনীয়তা ও রোগী যাচাই' : 'OPERATIONAL IDENTITY & PRIVACY CONTROLS'}
          </span>
          <StatusPill label="PDPA 2026 Sensitive Data Scoped" variant="upcoming" />
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
          {t.navPatients}
        </h1>
        <p style={{ margin: '4px 0 0 0', color: '#5B6B6E', fontSize: '14px' }}>
          {language === 'bn'
            ? 'অভ্যর্থনা ও হাব কার্যক্রমের জন্য ন্যূনতম প্রয়োজনীয় পরিচিতি তথ্য। চিকিৎসা বিবরণী ডাক্তার ও টিম অ্যাপে সীমাবদ্ধ।'
            : 'Minimum-necessary operational view for patient verification and check-in. Full medical history is restricted to verified clinical workflows.'}
        </p>
      </div>

      {/* Privacy Notice Card (PRD Section 16 & 17) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backgroundColor: '#E6EEEA', // Mist
          border: '1px solid #CFE0D8',
          borderRadius: '16px',
          padding: '14px 20px',
          marginBottom: '24px',
          color: '#0F3D3A',
          fontSize: '13px',
        }}
      >
        <PhShieldCheck size={20} color="#1D6B66" />
        <div style={{ flex: 1 }}>
          <strong>Least-Privilege Guard Active:</strong> Receptionists and hub managers are authorized to verify patient identity, contact details, and consent status. Complete diagnostic notes, prescriptions, and raw vitals are restricted to BMDC-verified doctors.
        </div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #DDE5E1',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 1px 2px rgba(11,31,34,.04)',
          }}
        >
          <PhMagnifyingGlass size={18} color="#1D6B66" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'হিলোরা আইডি (যেমন PAT-88019), ফোন নম্বর বা নাম দিয়ে খুঁজুন...'
                : 'Search by Healora ID (e.g. PAT-88019), phone number (+880...), or name...'
            }
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--ui)',
              fontSize: '15px',
              color: '#0B1F22',
            }}
          />
        </div>
      </div>

      {/* Patients Table */}
      <Card variant="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--ui)' }}>
          <thead>
            <tr style={{ backgroundColor: '#F5F3EE', borderBottom: '1px solid #DDE5E1' }}>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Canonical ID
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                {t.patientName}
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Demographics
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Upazila &amp; District
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Consent / Authority
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Encounters
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase', textAlign: 'right' }}>
                Verification
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((patient, idx) => (
              <tr
                key={patient.id}
                style={{
                  borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid #DDE5E1',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F3EE')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Canonical ID */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#0B1F22' }}>
                    {patient.canonicalHealoraId}
                  </div>
                  <div style={{ fontSize: '11px', color: '#5B6B6E' }}>
                    NID: {patient.nationalIdMasked}
                  </div>
                </td>

                {/* Name & Phone */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#0B1F22' }}>
                    {language === 'bn' ? patient.fullNameBn : patient.fullName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5B6B6E' }} className="num-tabular">
                    {patient.phone}
                  </div>
                </td>

                {/* Age & Gender */}
                <td style={{ padding: '16px 20px', fontSize: '14px', color: '#0B1F22' }}>
                  <span className="num-tabular">{patient.age}y</span> / {patient.gender}
                </td>

                {/* Catchment Area */}
                <td style={{ padding: '16px 20px', fontSize: '14px', color: '#5B6B6E' }}>
                  {patient.upazila}, {patient.district}
                </td>

                {/* Consent & Caregiver */}
                <td style={{ padding: '16px 20px' }}>
                  <StatusPill
                    label={
                      patient.consentStatus === 'active'
                        ? 'Consent Recorded'
                        : patient.consentStatus === 'caregiver_authorized'
                        ? 'Caregiver Auth'
                        : 'Consent Pending'
                    }
                    variant={patient.consentStatus === 'active' ? 'completed' : 'upcoming'}
                  />
                  {patient.caregiverName && (
                    <div style={{ fontSize: '11px', color: '#5B6B6E', marginTop: '2px' }}>
                      Caregiver: {patient.caregiverName}
                    </div>
                  )}
                </td>

                {/* Total Encounters */}
                <td style={{ padding: '16px 20px', fontSize: '14px', color: '#0B1F22' }}>
                  <strong className="num-tabular">{patient.totalEncounters}</strong> visits
                </td>

                {/* Actions */}
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(patient)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid #DDE5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#1D6B66',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Verify Identity
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Patient Verification & Consent Drawer */}
      {selectedPatient && (
        <ModalSheet
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Verify Identity: ${selectedPatient.fullName}`}
          subtitle={`Healora ID: ${selectedPatient.canonicalHealoraId}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F5F3EE', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F22', marginBottom: '8px' }}>
                Demographic Profile
              </div>
              <div style={{ fontSize: '14px', color: '#5B6B6E', lineHeight: 1.7 }}>
                <strong>Full Name:</strong> {selectedPatient.fullName} ({selectedPatient.fullNameBn})
                <br />
                <strong>Age / Gender:</strong> {selectedPatient.age} years / {selectedPatient.gender}
                <br />
                <strong>Phone:</strong> {selectedPatient.phone}
                <br />
                <strong>National ID (Masked):</strong> {selectedPatient.nationalIdMasked}
                <br />
                <strong>Address:</strong> {selectedPatient.upazila}, {selectedPatient.district}
              </div>
            </div>

            <div style={{ border: '1px solid #CFE0D8', borderRadius: '14px', padding: '16px', backgroundColor: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#22643F', marginBottom: '8px' }}>
                <PhCheckCircle size={16} color="#2F855A" />
                <span>Bangladesh PDPA 2026 Consent Record</span>
              </div>
              <div style={{ fontSize: '13px', color: '#5B6B6E', lineHeight: 1.6 }}>
                • <strong>Consent Type:</strong> Physical Hub Basic Measurement &amp; Care Coordination
                <br />
                • <strong>Recorded Date:</strong> {selectedPatient.consentDate}
                <br />
                • <strong>Caregiver Representation:</strong> {selectedPatient.caregiverRelation || 'Direct Patient Consent'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <button
                type="button"
                onClick={() => {
                  showToast(`Patient ${selectedPatient.fullName} identity verified for hub encounter.`);
                  setSelectedPatient(null);
                }}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                <span>Confirm Identity Match</span>
              </button>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
