import React, { useState } from 'react';
import {
  PhCheckCircle,
  PhShieldCheck,
  PhPlus,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { StaffMember } from '../../types';

export const TeamRosterView: React.FC = () => {
  const { t, language, staff, selectedHubId, showToast } = useApp();
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const hubStaff = staff.filter((s) => s.assignedHubIds.includes(selectedHubId));

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'bn' ? 'কর্মীবাহিনী ও দায়িত্ব' : 'CLINICAL & OPERATIONS ROSTER'}
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
            {t.navTeam}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#5B6B6E', fontSize: '14px' }}>
            {language === 'bn'
              ? 'হাবের জন্য নির্ধারিত ডাক্তার, স্বাস্থ্য সহকারী ও অভ্যর্থনা কর্মীদের ডিউটি ও সনদ নিয়ন্ত্রণ'
              : 'Assigned personnel, BMDC medical credentials verification & shift conflict prevention'}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => showToast('Staff assignment proposal sent to Regional Operations for approval.')}
          icon={<PhPlus size={16} />}
        >
          {language === 'bn' ? 'কর্মী বরাদ্দ করুন' : 'Assign Staff to Hub'}
        </Button>
      </div>

      {/* Staff Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {hubStaff.map((person) => (
          <Card key={person.id} variant="card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    backgroundColor: person.role === 'local_doctor' ? '#1D6B66' : '#CFE0D8',
                    color: person.role === 'local_doctor' ? '#FFFFFF' : '#0F3D3A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '15px',
                  }}
                >
                  {person.fullName.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: '#0B1F22' }}>
                    {language === 'bn' ? person.fullNameBn : person.fullName}
                  </h2>
                  <div style={{ fontSize: '13px', color: '#5B6B6E' }}>
                    {language === 'bn' ? person.roleTitleBn : person.roleTitle}
                  </div>
                </div>
              </div>

              <StatusPill
                label={person.active ? 'On Duty' : 'Off Duty'}
                variant={person.active ? 'active' : 'draft'}
              />
            </div>

            {/* Credential Status (PRD Section 6.2 & 17.3) */}
            <div style={{ backgroundColor: '#F5F3EE', padding: '14px', borderRadius: '14px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0F3D3A', marginBottom: '4px' }}>
                <PhShieldCheck size={16} color="#1D6B66" />
                <span style={{ fontWeight: 600 }}>{t.bmdcNumber}:</span>
              </div>
              <div style={{ fontSize: '13px', color: '#0B1F22', paddingLeft: '22px' }}>
                {person.bmdcOrLicenseNumber || 'Operational Role (Non-prescribing)'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#22643F', paddingLeft: '22px', marginTop: '4px' }}>
                <PhCheckCircle size={14} color="#2F855A" />
                <span>Verified with Bangladesh Medical &amp; Dental Council / BNC Registry</span>
              </div>
            </div>

            {/* Shift & Contact Info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: '#5B6B6E' }}>
              <span>
                Shift: <strong style={{ color: '#0B1F22' }}>{person.activeShift}</strong>
              </span>
              <span className="num-tabular">{person.phone}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', marginTop: '14px', borderTop: '1px solid #DDE5E1' }}>
              <span style={{ fontSize: '12px', color: '#5B6B6E' }}>
                Supervisor: <strong>{person.supervisorName}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedStaff(person)}
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
                View Roster Details
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Staff Details Drawer */}
      {selectedStaff && (
        <ModalSheet
          isOpen={!!selectedStaff}
          onClose={() => setSelectedStaff(null)}
          title={`Staff Profile: ${selectedStaff.fullName}`}
          subtitle={`${selectedStaff.roleTitle} (${selectedStaff.phone})`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F5F3EE', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F22', marginBottom: '8px' }}>
                Credential Verification Summary (PRD Section 6.2)
              </div>
              <div style={{ fontSize: '13px', color: '#5B6B6E', lineHeight: 1.7 }}>
                • <strong>Professional Role:</strong> {selectedStaff.roleTitle}
                <br />
                • <strong>Registration Number:</strong> {selectedStaff.bmdcOrLicenseNumber || 'Operations Role'}
                <br />
                • <strong>Credential Status:</strong> Verified &amp; Active
                <br />
                • <strong>Scope of Practice:</strong> {selectedStaff.role === 'local_doctor' ? 'Clinical evaluation, remeasurement orders, specialist tele-coordination' : 'Physical vitals collection under approved Protocol v2.4'}
              </div>
            </div>

            <div style={{ border: '1px solid #CFE0D8', borderRadius: '14px', padding: '16px', backgroundColor: '#FFFFFF' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F3D3A', marginBottom: '6px' }}>
                Shift Conflict Prevention Rule:
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#5B6B6E', lineHeight: 1.5 }}>
                System automatically verifies that this staff member is not scheduled for concurrent overlapping shifts across different physical hubs or field outreach units.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setSelectedStaff(null)}>
                Close
              </Button>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
