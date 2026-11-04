import React, { useState } from 'react';
import {
  PhMagnifyingGlass,
  PhCheckCircle,
  PhShieldCheck,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
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
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
            {language === 'bn' ? 'তথ্য গোপনীয়তা ও রোগী যাচাই' : 'OPERATIONAL IDENTITY & PRIVACY CONTROLS'}
          </span>
          <StatusPill label="PDPA 2026 Sensitive Data Scoped" variant="upcoming" />
        </div>
        <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
          {t.navPatients}
        </h1>
        <p className="mt-1 mb-0 text-sm text-slate">
          {language === 'bn'
            ? 'অভ্যর্থনা ও হাব কার্যক্রমের জন্য ন্যূনতম প্রয়োজনীয় পরিচিতি তথ্য। চিকিৎসা বিবরণী ডাক্তার ও টিম অ্যাপে সীমাবদ্ধ।'
            : 'Minimum-necessary operational view for patient verification and check-in. Full medical history is restricted to verified clinical workflows.'}
        </p>
      </div>

      {/* Privacy Notice Card (PRD Section 16 & 17) */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sage-200 bg-mist px-5 py-3.5 text-[13px] text-pine">
        <PhShieldCheck size={20} color="#1D6B66" />
        <div className="flex-1">
          <strong>Least-Privilege Guard Active:</strong> Receptionists and hub managers are authorized to verify patient identity, contact details, and consent status. Complete diagnostic notes, prescriptions, and raw vitals are restricted to BMDC-verified doctors.
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-5">
        <div className="flex items-center gap-2.5 rounded-xl border border-line bg-paper px-4 py-3 shadow-2xs">
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
            className="flex-1 border-none bg-transparent font-ui text-[15px] text-ink outline-none placeholder:text-slate/70"
          />
        </div>
      </div>

      {/* Patients Table */}
      <Card variant="card" className="p-0! overflow-hidden">
        <table className="w-full border-collapse text-left font-ui">
          <thead>
            <tr className="border-b border-line bg-bone">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                Canonical ID
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                {t.patientName}
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                Demographics
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                Upazila &amp; District
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                Consent / Authority
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                Encounters
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase text-slate">
                Verification
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((patient) => (
              <tr
                key={patient.id}
                className="border-b border-line transition-colors duration-100 last:border-b-0 hover:bg-bone"
              >
                {/* Canonical ID */}
                <td className="px-5 py-4">
                  <div className="text-[13px] font-bold text-ink">
                    {patient.canonicalHealoraId}
                  </div>
                  <div className="text-[11px] text-slate">
                    NID: {patient.nationalIdMasked}
                  </div>
                </td>

                {/* Name & Phone */}
                <td className="px-5 py-4">
                  <div className="text-[15px] font-semibold text-ink">
                    {language === 'bn' ? patient.fullNameBn : patient.fullName}
                  </div>
                  <div className="tabular-nums text-xs text-slate">
                    {patient.phone}
                  </div>
                </td>

                {/* Age & Gender */}
                <td className="px-5 py-4 text-sm text-ink">
                  <span className="tabular-nums">{patient.age}y</span> / {patient.gender}
                </td>

                {/* Catchment Area */}
                <td className="px-5 py-4 text-sm text-slate">
                  {patient.upazila}, {patient.district}
                </td>

                {/* Consent & Caregiver */}
                <td className="px-5 py-4">
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
                    <div className="mt-0.5 text-[11px] text-slate">
                      Caregiver: {patient.caregiverName}
                    </div>
                  )}
                </td>

                {/* Total Encounters */}
                <td className="px-5 py-4 text-sm text-ink">
                  <strong className="tabular-nums">{patient.totalEncounters}</strong> visits
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(patient)}
                    className="cursor-pointer rounded-pill border border-line bg-paper px-3.5 py-1.5 text-[13px] font-semibold text-teal transition hover:bg-mist"
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
          <div className="flex flex-col gap-4">
            <div className="rounded-ctl bg-bone p-4">
              <div className="mb-2 text-[13px] font-semibold text-ink">
                Demographic Profile
              </div>
              <div className="text-sm leading-[1.7] text-slate">
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

            <div className="rounded-ctl border border-sage-200 bg-paper p-4">
              <div className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold text-ok-fg">
                <PhCheckCircle size={16} color="#2F855A" />
                <span>Bangladesh PDPA 2026 Consent Record</span>
              </div>
              <div className="text-[13px] leading-[1.6] text-slate">
                • <strong>Consent Type:</strong> Physical Hub Basic Measurement &amp; Care Coordination
                <br />
                • <strong>Recorded Date:</strong> {selectedPatient.consentDate}
                <br />
                • <strong>Caregiver Representation:</strong> {selectedPatient.caregiverRelation || 'Direct Patient Consent'}
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2.5">
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  showToast(`Patient ${selectedPatient.fullName} identity verified for hub encounter.`);
                  setSelectedPatient(null);
                }}
              >
                Confirm Identity Match
              </Button>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
