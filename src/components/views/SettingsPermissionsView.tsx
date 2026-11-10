import React, { useState } from 'react';
import {
  PhShieldCheck,
  PhCheckCircle,
  PhMapPin,
  PhSlidersHorizontal,
  PhLockKey,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

export const SettingsPermissionsView: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    simpleMode,
    setSimpleMode,
    activeRole,
    setActiveRole,
    showToast,
  } = useApp();

  const [maxWaitTime, setMaxWaitTime] = useState(20);
  const [slotBuffer, setSlotBuffer] = useState(10);
  const [allowOverbooking, setAllowOverbooking] = useState(false);
  const [breakGlassReason, setBreakGlassReason] = useState('');
  const [isBreakGlassActive, setIsBreakGlassActive] = useState(false);

  const roleDefinitions: { role: UserRole; title: string; scope: string; clinicalWrite: boolean; permissions: string }[] = [
    {
      role: 'platform_super_admin',
      title: 'Platform Super Admin',
      scope: 'Entire Healora Infrastructure',
      clinicalWrite: false,
      permissions: 'Configure platform-wide hubs, assign regional managers, audit system security.',
    },
    {
      role: 'regional_ops_manager',
      title: 'Regional Operations Manager',
      scope: 'Assigned Administrative Region(s)',
      clinicalWrite: false,
      permissions: 'Manage multi-hub sessions, approve rosters, handle regional capacity escalations.',
    },
    {
      role: 'hub_manager',
      title: 'Hub Operations Manager',
      scope: 'Assigned Physical Hub Only',
      clinicalWrite: false,
      permissions: 'Manage hub profile, sessions, local staff roster, equipment readiness, queue.',
    },
    {
      role: 'reception_officer',
      title: 'Reception & Check-in Officer',
      scope: 'Assigned Hub / Live Session',
      clinicalWrite: false,
      permissions: 'Verify patient identity, issue queue tokens, register assisted walk-ins. (No medical history).',
    },
    {
      role: 'queue_coordinator',
      title: 'Queue Coordinator',
      scope: 'Assigned Hub / Live Session',
      clinicalWrite: false,
      permissions: 'Move tickets through queue states, re-route between desks, prioritize vulnerable cases.',
    },
    {
      role: 'equipment_officer',
      title: 'Biomedical & Facilities Officer',
      scope: 'Assigned Physical Hub',
      clinicalWrite: false,
      permissions: 'Manage medical device inventory, record calibration benchmarks, manage out-of-service.',
    },
    {
      role: 'local_doctor',
      title: 'Local Doctor (Clinical Reviewer)',
      scope: 'Assigned Clinical Encounters',
      clinicalWrite: true,
      permissions: 'Evaluate submitted measurements, request remeasurements, sign clinical notes & referrals.',
    },
    {
      role: 'field_health_worker',
      title: 'Field Health Worker / HW Lead',
      scope: 'Assigned Session / Station',
      clinicalWrite: true,
      permissions: 'Capture vitals checklist via mobile app, submit with device attribution, report flags.',
    },
    {
      role: 'auditor',
      title: 'Operations & Compliance Auditor',
      scope: 'Assigned Regional / Hub Audit',
      clinicalWrite: false,
      permissions: 'Inspect immutable security logs, verify PDPA compliance, export de-identified data.',
    },
  ];

  const handleSaveParameters = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Operational parameters updated and committed.');
  };

  const handleBreakGlass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassReason.trim()) return;
    setIsBreakGlassActive(true);
    showToast('Break-glass emergency authorization granted for 60 minutes. High-priority audit logged.');
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
            {language === 'bn' ? 'সিস্টেম কনফিগারেশন ও আইনগত অনুমতি' : 'PLATFORM GOVERNANCE & ACCESS CONTROL'}
          </span>
          <StatusPill label="Bangladesh PDPA 2026 Verified" variant="active" />
        </div>
        <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
          {t.navSettings}
        </h1>
        <p className="mt-1 mb-0 text-sm text-slate">
          {language === 'bn'
            ? 'ভূমিকাভিত্তিক অনুমতি (RBAC/ABAC), বাংলাদেশ স্বাস্থ্য তথ্য সুরক্ষা গেজেট ২০২৬ ও অপারেশনাল থ্রেশহোল্ড'
            : 'Role-based access matrix, Bangladesh regulatory compliance status, and operational SLA parameters'}
        </p>
      </div>

      {/* Compliance Overview Grid (PRD Section 17) */}
      <div className="mb-8 grid grid-cols-3 gap-5">
        <Card variant="card" className="border-t-3! border-t-teal!">
          <div className="mb-2.5 flex items-center gap-2">
            <PhShieldCheck size={20} color="#1D6B66" />
            <h2 className="m-0 text-[15px] font-semibold text-ink">
              Personal Data Protection Act, 2026
            </h2>
          </div>
          <p className="mt-0 mb-2.5 text-[13px] leading-normal text-slate">
            Health-related information classified as sensitive personal data. Specific, voluntary informed consent captured for each hub encounter.
          </p>
          <StatusPill label="Act No. 63 of 2026 Compliant" variant="completed" />
        </Card>

        <Card variant="card" className="border-t-3! border-t-teal!">
          <div className="mb-2.5 flex items-center gap-2">
            <PhMapPin size={20} color="#1D6B66" />
            <h2 className="m-0 text-[15px] font-semibold text-ink">
              DGHS Telehealth Data Residency
            </h2>
          </div>
          <p className="mt-0 mb-2.5 text-[13px] leading-normal text-slate">
            Zero foreign cloud storage for patient vitals. Primary database and encrypted backups hosted within Bangladesh at AP-DCC Gazipur Tier-IV.
          </p>
          <StatusPill label="Local Residency Verified" variant="completed" />
        </Card>

        <Card variant="card" className="border-t-3! border-t-teal!">
          <div className="mb-2.5 flex items-center gap-2">
            <PhCheckCircle size={20} color="#1D6B66" />
            <h2 className="m-0 text-[15px] font-semibold text-ink">
              BMDC Telemedicine Guidelines
            </h2>
          </div>
          <p className="mt-0 mb-2.5 text-[13px] leading-normal text-slate">
            Registered practitioner verification, explicit consent for remote consultations, and health worker measurement provenance preserved.
          </p>
          <StatusPill label="BMDC Framework Aligned" variant="completed" />
        </Card>
      </div>

      {/* Section 1: Role Permissions Matrix (PRD Section 6) */}
      <div className="mb-8">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="m-0 text-lg font-semibold text-ink">
            Role Scopes &amp; Least-Privilege Access Matrix (PRD Section 6.1 &amp; 6.2)
          </h2>
          <span className="text-xs text-slate">Enforced on Central Backend Auth Broker</span>
        </div>

        <Card variant="card" className="p-0! overflow-hidden">
          <table className="w-full border-collapse text-left font-ui">
            <thead>
              <tr className="border-b border-line bg-bone">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Role Title</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Scope Boundary</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Clinical Write</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Permitted Capabilities &amp; Restrictions</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Test Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {roleDefinitions.map((item) => {
                const isActive = activeRole === item.role;
                return (
                  <tr key={item.role} className={`transition-colors ${isActive ? 'bg-mist/40' : 'hover:bg-bone/40'}`}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ink">{item.title}</div>
                      <div className="font-mono text-xs text-slate">{item.role}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate">
                      {item.scope}
                    </td>
                    <td className="px-5 py-4">
                      {item.clinicalWrite ? (
                        <span className="rounded-md bg-teal px-2 py-0.5 text-[11px] font-bold text-white">
                          MOBILE APP ONLY
                        </span>
                      ) : (
                        <span className="rounded-md bg-sage-200 px-2 py-0.5 text-[11px] font-semibold text-pine">
                          RESTRICTED (DENY)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate">
                      {item.permissions}
                    </td>
                    <td className="px-5 py-4">
                      {isActive ? (
                        <span className="rounded-md bg-ink px-2 py-1 text-xs font-bold text-white">
                          CURRENT
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveRole(item.role);
                            showToast(`Switched active role scope to ${item.title}`);
                          }}
                          className="cursor-pointer text-xs font-semibold text-teal hover:underline"
                        >
                          Switch Scope
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Section 2: Operational SLA Parameters */}
      <div className="mb-8 grid grid-cols-2 gap-6">
        <Card variant="card">
          <div className="mb-3 flex items-center gap-2">
            <PhSlidersHorizontal size={20} color="#1D6B66" />
            <h3 className="m-0 text-base font-semibold text-ink">
              Operational Thresholds &amp; SLA Rules
            </h3>
          </div>

          <form onSubmit={handleSaveParameters} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">
                Maximum Allowable Wait Time SLA (minutes)
              </label>
              <input
                type="number"
                value={maxWaitTime}
                onChange={(e) => setMaxWaitTime(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
              <span className="text-[11px] text-slate">Triggers exception alert when patient wait exceeds this limit.</span>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">
                Appointment Slot Buffer (minutes)
              </label>
              <input
                type="number"
                value={slotBuffer}
                onChange={(e) => setSlotBuffer(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="overbookingCheckbox"
                checked={allowOverbooking}
                onChange={(e) => setAllowOverbooking(e.target.checked)}
                className="size-4 rounded border-line"
              />
              <label htmlFor="overbookingCheckbox" className="text-xs font-semibold text-ink">
                Allow Overbooking (Default: strictly disabled per PRD Section 8.5)
              </label>
            </div>

            <Button variant="primary" type="submit">
              Save Parameters
            </Button>
          </form>
        </Card>

        {/* Section 3: Break-Glass Emergency Mode (PRD Section 6.4) */}
        <Card variant="card" className="border-t-3! border-t-bad!">
          <div className="mb-3 flex items-center gap-2">
            <PhLockKey size={20} color="#C53030" />
            <h3 className="m-0 text-base font-semibold text-ink">
              Emergency Break-Glass Override Protocol (PRD 6.4)
            </h3>
          </div>

          <p className="text-xs text-slate leading-relaxed mb-4">
            Under severe clinical emergencies or disaster response, authorized operations personnel can request temporary elevated access. Every break-glass activation generates an immediate high-priority audit record and notifies compliance supervisors.
          </p>

          {isBreakGlassActive ? (
            <div className="rounded-xl bg-bad-bg p-4 text-xs text-bad-fg">
              <div className="font-bold">BREAK-GLASS ELEVATION ACTIVE</div>
              <div className="mt-1">Reason: {breakGlassReason}</div>
              <div className="mt-1">Authorized for next 54 minutes. All interactions logged immutably.</div>
              <button
                type="button"
                onClick={() => {
                  setIsBreakGlassActive(false);
                  showToast('Break-glass emergency session revoked.');
                }}
                className="mt-3 cursor-pointer rounded-lg bg-bad px-3 py-1.5 font-bold text-white"
              >
                Revoke Emergency Session
              </button>
            </div>
          ) : (
            <form onSubmit={handleBreakGlass} className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate">
                  Emergency Justification Reason (Mandatory)
                </label>
                <textarea
                  rows={2}
                  required
                  value={breakGlassReason}
                  onChange={(e) => setBreakGlassReason(e.target.value)}
                  placeholder="e.g. Mass casualty intake at Dhanmondi Hub requiring emergency desk bypass..."
                  className="w-full rounded-xl border border-line p-2.5 text-xs"
                />
              </div>

              <button
                type="submit"
                className="cursor-pointer rounded-xl bg-bad px-4 py-2 text-xs font-bold text-white hover:bg-bad-fg transition"
              >
                Request 60-Minute Elevation
              </button>
            </form>
          )}
        </Card>
      </div>

      {/* Section 4: Accessibility & Language Mode (PRD Section 18) */}
      <div className="mb-8">
        <Card variant="card">
          <h3 className="m-0 mb-3 text-base font-semibold text-ink">
            {language === 'bn' ? 'ভাষা ও সহজ মোড (অ্যাক্সেসিবিলিটি)' : 'Localisation & Accessibility Configuration'}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-xl bg-bone p-3.5">
              <div>
                <div className="text-xs font-semibold text-ink">Interface Language / ভাষা</div>
                <div className="text-[11px] text-slate">Toggle platform UI strings between English and বাংলা</div>
              </div>
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                className="cursor-pointer rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-semibold"
              >
                {language === 'en' ? 'বাংলা রূপান্তর' : 'English View'}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-bone p-3.5">
              <div>
                <div className="text-xs font-semibold text-ink">Simple Mode (Low Strain UI)</div>
                <div className="text-[11px] text-slate">Enlarged touch targets for elderly or busy desk receptionists</div>
              </div>
              <button
                type="button"
                onClick={() => setSimpleMode(!simpleMode)}
                className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  simpleMode ? 'bg-teal text-white' : 'border border-line bg-paper text-slate'
                }`}
              >
                {simpleMode ? 'Simple Mode Active' : 'Standard Mode'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
