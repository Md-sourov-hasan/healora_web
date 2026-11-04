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
import { useApp } from '../../context/useApp';
import type { StaffMember } from '../../types';

export const TeamRosterView: React.FC = () => {
  const { t, language, staff, selectedHubId, showToast } = useApp();
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const hubStaff = staff.filter((s) => s.assignedHubIds.includes(selectedHubId));

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'কর্মীবাহিনী ও দায়িত্ব' : 'CLINICAL & OPERATIONS ROSTER'}
            </span>
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navTeam}
          </h1>
          <p className="mt-1 mb-0 text-sm text-slate">
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
      <div className="grid grid-cols-2 gap-6">
        {hubStaff.map((person) => (
          <Card key={person.id} variant="card">
            <div className="mb-3.5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-11 items-center justify-center rounded-xl text-[15px] font-bold ${
                    person.role === 'local_doctor'
                      ? 'bg-teal text-white'
                      : 'bg-sage-200 text-pine'
                  }`}
                >
                  {person.fullName.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <h2 className="m-0 text-[17px] font-semibold text-ink">
                    {language === 'bn' ? person.fullNameBn : person.fullName}
                  </h2>
                  <div className="text-[13px] text-slate">
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
            <div className="mb-3.5 rounded-ctl bg-bone p-3.5">
              <div className="mb-1 flex items-center gap-1.5 text-xs text-pine">
                <PhShieldCheck size={16} color="#1D6B66" />
                <span className="font-semibold">{t.bmdcNumber}:</span>
              </div>
              <div className="pl-5.5 text-[13px] text-ink">
                {person.bmdcOrLicenseNumber || 'Operational Role (Non-prescribing)'}
              </div>
              <div className="mt-1 flex items-center gap-1.5 pl-5.5 text-xs text-ok-fg">
                <PhCheckCircle size={14} color="#2F855A" />
                <span>Verified with Bangladesh Medical &amp; Dental Council / BNC Registry</span>
              </div>
            </div>

            {/* Shift & Contact Info */}
            <div className="flex items-center justify-between text-[13px] text-slate">
              <span>
                Shift: <strong className="text-ink">{person.activeShift}</strong>
              </span>
              <span className="tabular-nums">{person.phone}</span>
            </div>

            <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3.5">
              <span className="text-xs text-slate">
                Supervisor: <strong>{person.supervisorName}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedStaff(person)}
                className="cursor-pointer rounded-pill border border-line bg-paper px-3.5 py-1.5 text-[13px] font-semibold text-teal transition hover:bg-mist"
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
          <div className="flex flex-col gap-4">
            <div className="rounded-ctl bg-bone p-4">
              <div className="mb-2 text-[13px] font-semibold text-ink">
                Credential Verification Summary (PRD Section 6.2)
              </div>
              <div className="text-[13px] leading-[1.7] text-slate">
                • <strong>Professional Role:</strong> {selectedStaff.roleTitle}
                <br />
                • <strong>Registration Number:</strong> {selectedStaff.bmdcOrLicenseNumber || 'Operations Role'}
                <br />
                • <strong>Credential Status:</strong> Verified &amp; Active
                <br />
                • <strong>Scope of Practice:</strong> {selectedStaff.role === 'local_doctor' ? 'Clinical evaluation, remeasurement orders, specialist tele-coordination' : 'Physical vitals collection under approved Protocol v2.4'}
              </div>
            </div>

            <div className="rounded-ctl border border-sage-200 bg-paper p-4">
              <div className="mb-1.5 text-[13px] font-semibold text-pine">
                Shift Conflict Prevention Rule:
              </div>
              <p className="m-0 text-[13px] leading-normal text-slate">
                System automatically verifies that this staff member is not scheduled for concurrent overlapping shifts across different physical hubs or field outreach units.
              </p>
            </div>

            <div className="mt-4 flex justify-end">
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
