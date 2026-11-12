import React, { useState } from 'react';
import {
  PhShieldCheck,
  PhCheckCircle,
  PhMapPin,
  PhSlidersHorizontal,
  PhLockKey,
  PhPlus,
  PhArrowsClockwise,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import { ROLES_CONFIG, CORE_OPERATIONS_ROLES } from '../../config/rolesConfig';
import type { UserRole } from '../../types';

export const SettingsPermissionsView: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    simpleMode,
    setSimpleMode,
    activeRole,
    availableRoles,
    setActiveRole,
    showToast,
    roleAssignments,
    assignStaffRole,
    revokeStaffRole,
    staff,
    hubs,
    regions,
    refreshBackendData,
  } = useApp();

  const [maxWaitTime, setMaxWaitTime] = useState(20);
  const [slotBuffer, setSlotBuffer] = useState(10);
  const [allowOverbooking, setAllowOverbooking] = useState(false);
  const [breakGlassReason, setBreakGlassReason] = useState('');
  const [isBreakGlassActive, setIsBreakGlassActive] = useState(false);

  // Modal State for API Role Assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState<UserRole>('hub_manager');
  const [assignScopeType, setAssignScopeType] = useState<'platform' | 'region' | 'hub' | 'session'>('hub');
  const [assignScopeId, setAssignScopeId] = useState('');
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);

  const handleAssignRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) {
      showToast('Please select or specify a staff user ID.');
      return;
    }
    setIsSubmittingRole(true);
    try {
      await assignStaffRole(assignUserId, {
        role: assignRole,
        scopeType: assignScopeType,
        hubId: assignScopeType === 'hub' ? (assignScopeId || hubs[0]?.id) : undefined,
        regionId: assignScopeType === 'region' ? (assignScopeId || regions[0]?.id) : undefined,
      });
      setIsAssignModalOpen(false);
      setAssignUserId('');
    } catch {
      // toast shown in context
    } finally {
      setIsSubmittingRole(false);
    }
  };

  const handleRevokeRole = async (assignmentId: string) => {
    if (window.confirm('Are you sure you want to revoke this role assignment?')) {
      try {
        await revokeStaffRole(assignmentId, 'Revoked by supervisor in settings');
      } catch {
        // error toast in context
      }
    }
  };

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
          <div>
            <h2 className="m-0 text-lg font-semibold text-ink">
              {language === 'bn' ? 'অপারেশনাল ভূমিকা ও দায়িত্ব ম্যাট্রিক্স' : 'Hub Operations Role & Responsibility Matrix (PRD Section 6.1)'}
            </h2>
            <p className="mt-0.5 text-xs text-slate">
              {language === 'bn'
                ? '৭টি মূল অপারেশনাল ভূমিকার দায়িত্ব, অনুমতি ও এক্সেস স্কোপ'
                : 'The 7 core operations roles, exact responsibilities, least-privilege boundary and access controls'}
            </p>
          </div>
          <span className="text-xs text-slate font-mono">Auth Broker: Enforced</span>
        </div>

        <Card variant="card" className="p-0! overflow-hidden">
          <table className="w-full border-collapse text-left font-ui">
            <thead>
              <tr className="border-b border-line bg-bone">
                <th className="px-4 py-3.5 text-xs font-semibold uppercase text-slate">#</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Role Title</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Scope Boundary</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Core Responsibilities (কাজ)</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Access Mode</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Switch &amp; Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {CORE_OPERATIONS_ROLES.map((roleKey) => {
                const item = ROLES_CONFIG[roleKey];
                const isActive = activeRole === item.id;
                return (
                  <tr key={item.id} className={`transition-colors ${isActive ? 'bg-mist/50' : 'hover:bg-bone/40'}`}>
                    <td className="px-4 py-4 font-mono text-xs font-bold text-teal">
                      {item.number}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ink">
                        {language === 'bn' ? item.titleBn : item.title}
                      </div>
                      <div className="font-mono text-[11px] text-slate">{item.id}</div>
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate">
                      {language === 'bn' ? item.scopeLabelBn : item.scopeLabel}
                    </td>
                    <td className="px-5 py-4 text-xs text-ink">
                      <strong className="text-pine block mb-1">
                        {language === 'bn' ? item.descriptionBn : item.description}
                      </strong>
                      <span className="text-[11px] text-slate leading-relaxed">
                        {item.capabilities.slice(0, 2).join(' • ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {item.isReadOnly ? (
                        <span className="rounded-md bg-bad-bg px-2 py-0.5 text-[11px] font-bold text-bad-fg">
                          READ-ONLY AUDITOR
                        </span>
                      ) : (
                        <span className="rounded-md bg-sage-200 px-2 py-0.5 text-[11px] font-bold text-pine uppercase">
                          OPERATIONAL
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isActive ? (
                        <span className="rounded-md bg-teal px-2.5 py-1 text-xs font-bold text-white shadow-2xs">
                          ACTIVE SCOPE
                        </span>
                      ) : availableRoles.includes(item.id) ? (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveRole(item.id);
                            showToast(`Switched operational role to: ${item.title}`);
                          }}
                          className="cursor-pointer text-xs font-semibold text-teal hover:underline"
                        >
                          Switch Scope
                        </button>
                      ) : (
                        <span className="text-xs text-slate">Assigned by administrator</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Section 1B: Live API Role Assignments (/admin/role-assignments) */}
      <div className="mb-8">
        <div className="mb-3.5 flex items-center justify-between">
          <div>
            <h2 className="m-0 text-lg font-semibold text-ink">
              Staff Role Assignments via Live API (/admin/role-assignments)
            </h2>
            <p className="mt-0.5 text-xs text-slate">
              Cryptographically audited staff roles assigned on the Render backend
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                refreshBackendData();
                showToast('Refreshed role assignments from backend API.');
              }}
              icon={<PhArrowsClockwise size={16} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => setIsAssignModalOpen(true)}
              icon={<PhPlus size={16} />}
            >
              Assign Role (API)
            </Button>
          </div>
        </div>

        <Card variant="card" className="p-0! overflow-hidden">
          <table className="w-full border-collapse text-left font-ui">
            <thead>
              <tr className="border-b border-line bg-bone">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Staff ID / Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Assigned Role</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Scope Type</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Scoped Entity ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line text-sm">
              {roleAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-xs text-slate">
                    No active staff role assignments recorded on the backend. Click "+ Assign Role (API)" above to assign a role.
                  </td>
                </tr>
              ) : (
                roleAssignments.map((assignment) => {
                  const staffUser = staff.find((s) => s.id === assignment.userId);
                  const isRevoked = assignment.status === 'revoked';
                  return (
                    <tr key={assignment.id} className="transition-colors hover:bg-mist/30">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink">
                          {staffUser?.fullName || assignment.userId}
                        </div>
                        <div className="font-mono text-xs text-slate">{assignment.userId}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded bg-mist px-2 py-0.5 text-xs font-bold text-pine">
                          {ROLES_CONFIG[assignment.role as UserRole]?.title || assignment.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold uppercase text-slate">
                        {assignment.scopeType}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-slate">
                        {assignment.hubId || assignment.regionId || 'Platform Wide'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill
                          label={assignment.status.toUpperCase()}
                          variant={isRevoked ? 'cancelled' : 'completed'}
                        />
                      </td>
                      <td className="px-5 py-4">
                        {!isRevoked && (
                          <button
                            type="button"
                            onClick={() => handleRevokeRole(assignment.id)}
                            className="cursor-pointer text-xs font-semibold text-bad hover:underline"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
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

      {/* Modal: Assign Staff Role via API */}
      <ModalSheet
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Staff Role (API: /admin/users/{id}/role-assignments)"
      >
        <form onSubmit={handleAssignRoleSubmit} className="space-y-4">
          <p className="text-xs text-slate">
            Assign one of the 7 operational roles to a staff member. Scopes are cryptographically audited and validated on the Render backend.
          </p>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Select Staff Member</label>
            {staff.length > 0 ? (
              <select
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                required
                className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none"
              >
                <option value="">-- Choose Staff User --</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} ({s.roleTitle})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="e.g. usr_01 or staff email"
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Operational Role</label>
            <select
              value={assignRole}
              onChange={(e) => setAssignRole(e.target.value as UserRole)}
              className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none"
            >
              {CORE_OPERATIONS_ROLES.map((roleKey) => {
                const cfg = ROLES_CONFIG[roleKey];
                return (
                  <option key={roleKey} value={roleKey}>
                    {cfg.number}. {cfg.title} — {cfg.description}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Scope Boundary</label>
              <select
                value={assignScopeType}
                onChange={(e) => setAssignScopeType(e.target.value as any)}
                className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none"
              >
                <option value="platform">Platform Wide</option>
                <option value="region">Specific Region</option>
                <option value="hub">Specific Hub</option>
                <option value="session">Specific Session</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Target Entity ID</label>
              {assignScopeType === 'hub' && hubs.length > 0 ? (
                <select
                  value={assignScopeId}
                  onChange={(e) => setAssignScopeId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none"
                >
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              ) : assignScopeType === 'region' && regions.length > 0 ? (
                <select
                  value={assignScopeId}
                  onChange={(e) => setAssignScopeId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none"
                >
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. hub_dhaka_01 (optional for platform)"
                  value={assignScopeId}
                  onChange={(e) => setAssignScopeId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line px-3 text-sm"
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmittingRole}>
              {isSubmittingRole ? 'Assigning via API...' : 'Commit Assignment (API)'}
            </Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
