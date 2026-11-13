import React, { useEffect, useState } from 'react';
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
import { ROLES_CONFIG, CORE_OPERATIONS_ROLES, toUiRole } from '../../config/rolesConfig';
import { regionsService, type ApiRegion } from '../../services/regionsService';
import { staffService, type ApiUser } from '../../services/staffService';
import type { UserRole } from '../../types';
import { isBreakGlassActive, reportsAuditService, type BreakGlassLog } from '../../services/reportsAuditService';
import { patientsService, type ApiPatient } from '../../services/patientsService';

export const SettingsPermissionsView: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    simpleMode,
    setSimpleMode,
    activeRole,
    availableRoles,
    currentUser,
    apiStatus,
    apiLatency,
    apiErrors,
    setActiveRole,
    showToast,
    roleAssignments,
    assignStaffRole,
    revokeStaffRole,
    staff,
    hubs,
    sessions,
    selectedHubId,
    refreshBackendData,
  } = useApp();

  const [breakGlassReason, setBreakGlassReason] = useState('');
  const [breakGlassPatientQuery, setBreakGlassPatientQuery] = useState('');
  const [breakGlassPatients, setBreakGlassPatients] = useState<ApiPatient[]>([]);
  const [breakGlassPatientId, setBreakGlassPatientId] = useState('');
  const [breakGlassDuration, setBreakGlassDuration] = useState(60);
  const [activeBreakGlass, setActiveBreakGlass] = useState<BreakGlassLog[]>([]);
  const [myBreakGlass, setMyBreakGlass] = useState<BreakGlassLog[]>([]);
  const [pendingBreakGlassReview, setPendingBreakGlassReview] = useState<BreakGlassLog[]>([]);
  const [breakGlassReviewNotes, setBreakGlassReviewNotes] = useState<Record<string, string>>({});
  const [reviewingBreakGlassId, setReviewingBreakGlassId] = useState<string | null>(null);
  const canReviewBreakGlass = availableRoles.includes('platform_super_admin') || availableRoles.includes('auditor');
  const canRequestBreakGlass = availableRoles.some((role) => ['local_doctor', 'registered_doctor', 'special_team_lead', 'field_health_worker'].includes(role));

  // Modal State for API Role Assignment
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState<UserRole>('hub_manager');
  const [assignScopeType, setAssignScopeType] = useState<'platform' | 'region' | 'hub' | 'session'>('hub');
  const [assignScopeId, setAssignScopeId] = useState('');
  const [isSubmittingRole, setIsSubmittingRole] = useState(false);
  const [backendUsers, setBackendUsers] = useState<ApiUser[]>([]);
  const [backendRegions, setBackendRegions] = useState<ApiRegion[]>([]);
  const [isLoadingAssignmentOptions, setIsLoadingAssignmentOptions] = useState(false);
  const [assignmentOptionsError, setAssignmentOptionsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (canReviewBreakGlass) {
      reportsAuditService.getBreakGlassList().then((response) => {
        if (!mounted) return;
        setActiveBreakGlass(response.items.filter(isBreakGlassActive));
        setPendingBreakGlassReview(response.items.filter((entry) => (entry.reviewOutcome ?? 'pending') === 'pending'));
      }).catch((error) => { if (mounted) showToast(error instanceof Error ? error.message : 'Break-glass records unavailable.'); });
    }
    if (canRequestBreakGlass) {
      reportsAuditService.getMyBreakGlass().then((response) => { if (mounted) setMyBreakGlass(response.items); })
        .catch((error) => { if (mounted) showToast(error instanceof Error ? error.message : 'Your break-glass records are unavailable.'); });
    }
    return () => { mounted = false; };
  }, [canReviewBreakGlass, canRequestBreakGlass]);

  const openAssignRoleModal = async () => {
    setIsAssignModalOpen(true);
    setIsLoadingAssignmentOptions(true);
    setAssignmentOptionsError(null);
    try {
      const [usersResult, regionsResult] = await Promise.all([
        staffService.getUsers({ limit: 200 }),
        regionsService.getRegions({ limit: 200, level: 'operational_region' }),
      ]);
      setBackendUsers(usersResult.items.filter((user) => user.status !== 'disabled'));
      setBackendRegions(regionsResult.items.filter((region) => region.active));
    } catch (err) {
      setAssignmentOptionsError(err instanceof Error ? err.message : 'Could not load staff and regions from the backend.');
    } finally {
      setIsLoadingAssignmentOptions(false);
    }
  };

  const handleAssignRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUserId) {
      showToast('Please select or specify a staff user ID.');
      return;
    }
    if (['hub', 'region', 'session'].includes(assignScopeType) && !assignScopeId) {
      showToast('Choose the required scope before assigning this role.');
      return;
    }
    setIsSubmittingRole(true);
    try {
      await assignStaffRole(assignUserId, {
        role: assignRole,
        scopeType: assignScopeType,
        hubId: assignScopeType === 'hub' ? assignScopeId : undefined,
        regionId: assignScopeType === 'region' ? assignScopeId : undefined,
        sessionId: assignScopeType === 'session' ? assignScopeId : undefined,
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
        const reason = window.prompt('Enter the reason for revoking this role assignment (required):');
        if (!reason?.trim()) return;
        await revokeStaffRole(assignmentId, reason.trim());
      } catch {
        // error toast in context
      }
    }
  };

  const handleBreakGlassLookup = async () => {
    if (!selectedHubId || !breakGlassPatientQuery.trim()) return;
    try {
      const result = await patientsService.lookup({ by: 'phone', value: breakGlassPatientQuery.trim(), hubId: selectedHubId });
      setBreakGlassPatients(result.matches);
      setBreakGlassPatientId('');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Patient lookup failed.'); }
  };

  const handleBreakGlass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakGlassPatientId || breakGlassReason.trim().length < 20) { showToast('Select a patient and provide a reason of at least 20 characters.'); return; }
    try {
      await reportsAuditService.requestBreakGlass({ patientId: breakGlassPatientId, reason: breakGlassReason.trim(), durationMinutes: breakGlassDuration });
      if (canRequestBreakGlass) {
        const mine = await reportsAuditService.getMyBreakGlass();
        setMyBreakGlass(mine.items);
      }
      if (canReviewBreakGlass) {
        const response = await reportsAuditService.getBreakGlassList();
        setActiveBreakGlass(response.items.filter(isBreakGlassActive));
        setPendingBreakGlassReview(response.items.filter((entry) => (entry.reviewOutcome ?? 'pending') === 'pending'));
      }
      setBreakGlassReason('');
      showToast('Break-glass request accepted by the backend.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Break-glass request failed.'); }
  };

  const endBreakGlass = async (id: string) => {
    try {
      await reportsAuditService.endBreakGlass(id);
      setActiveBreakGlass((items) => items.filter((item) => item.id !== id));
      setMyBreakGlass((items) => items.map((item) => item.id === id ? { ...item, endedAt: new Date().toISOString() } : item));
      showToast('Break-glass session ended by the backend.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Could not end break-glass session.'); }
  };

  const reviewBreakGlass = async (entry: BreakGlassLog, outcome: 'justified' | 'not_justified') => {
    const notes = breakGlassReviewNotes[entry.id]?.trim();
    if (entry.userId === currentUser?.id) { showToast('You cannot review your own break-glass access.'); return; }
    if (outcome === 'not_justified' && !notes) { showToast('Add review notes before marking access not justified.'); return; }
    setReviewingBreakGlassId(entry.id);
    try {
      await reportsAuditService.reviewBreakGlass(entry.id, outcome, notes || undefined);
      const response = await reportsAuditService.getBreakGlassList();
      setActiveBreakGlass(response.items.filter(isBreakGlassActive));
      setPendingBreakGlassReview(response.items.filter((item) => (item.reviewOutcome ?? 'pending') === 'pending'));
      setBreakGlassReviewNotes((items) => { const next = { ...items }; delete next[entry.id]; return next; });
      showToast('Break-glass review recorded by the backend.');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Break-glass review failed.'); }
    finally { setReviewingBreakGlassId(null); }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
            {language === 'bn' ? 'সিস্টেম কনফিগারেশন ও আইনগত অনুমতি' : 'PLATFORM GOVERNANCE & ACCESS CONTROL'}
          </span>
          <StatusPill label="Backend-managed authorization" variant="active" />
        </div>
        <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
          {t.navSettings}
        </h1>
        <p className="mt-1 mb-0 text-sm text-slate">
          {language === 'bn'
            ? 'ভূমিকাভিত্তিক অনুমতি (RBAC/ABAC), বাংলাদেশ স্বাস্থ্য তথ্য সুরক্ষা গেজেট ২০২৬ ও অপারেশনাল থ্রেশহোল্ড'
            : 'Backend account identity, assigned role scopes, and controls available through the API'}
        </p>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-5">
        <Card variant="card" className="border-t-3! border-t-teal!">
          <div className="mb-2.5 flex items-center gap-2"><PhShieldCheck size={20} color="#1D6B66" /><h2 className="m-0 text-[15px] font-semibold text-ink">Backend API status</h2></div>
          <p className="mt-0 mb-2.5 text-[13px] text-slate">Connection status and latency from live backend requests.</p>
          <StatusPill label={apiStatus} variant={apiStatus === 'connected' ? 'active' : apiStatus === 'connecting' ? 'awaiting' : 'declined'} />
          <p className="mb-0 mt-2 text-xs text-slate">Latency: {apiLatency === null ? 'Not reported' : `${apiLatency} ms`} · API errors: {apiErrors.length}</p>
        </Card>
        <Card variant="card" className="border-t-3! border-t-teal!">
          <div className="mb-2.5 flex items-center gap-2"><PhMapPin size={20} color="#1D6B66" /><h2 className="m-0 text-[15px] font-semibold text-ink">Signed-in backend account</h2></div>
          <p className="mt-0 mb-2.5 text-[13px] text-slate">Identity returned by the authenticated profile endpoint.</p>
          <div className="text-sm font-semibold text-ink">{currentUser?.name || 'No account returned'}</div>
          <div className="mt-1 break-all text-xs text-slate">{currentUser?.email || 'Email not returned'}</div>
          <StatusPill label={currentUser?.status || 'Status not returned'} variant={currentUser?.status === 'active' ? 'active' : 'draft'} className="mt-2" />
        </Card>
        <Card variant="card" className="border-t-3! border-t-teal!">
          <div className="mb-2.5 flex items-center gap-2"><PhCheckCircle size={20} color="#1D6B66" /><h2 className="m-0 text-[15px] font-semibold text-ink">Multi-factor authentication</h2></div>
          <p className="mt-0 mb-2.5 text-[13px] text-slate">Enrollment state returned for the signed-in backend account.</p>
          <StatusPill label={currentUser?.mfaEnabled === true ? 'Enabled' : currentUser?.mfaEnabled === false ? 'Not enabled' : 'Not reported'} variant={currentUser?.mfaEnabled === true ? 'active' : 'draft'} />
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
          <span className="text-xs text-slate font-mono">Role choice limited to API assignments</span>
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
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Select role</th>
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
              onClick={() => void refreshBackendData()}
              icon={<PhArrowsClockwise size={16} />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={() => void openAssignRoleModal()}
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
                  const canRevoke = assignment.status === 'active';
                  const uiRole = toUiRole(assignment.role);
                  return (
                    <tr key={assignment.id} className="transition-colors hover:bg-mist/30">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink">
                          {assignment.user?.name || staffUser?.fullName || assignment.userId}
                        </div>
                        <div className="font-mono text-xs text-slate">{assignment.userId}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="rounded bg-mist px-2 py-0.5 text-xs font-bold text-pine">
                          {uiRole ? ROLES_CONFIG[uiRole].title : assignment.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold uppercase text-slate">
                        {assignment.scopeType}
                      </td>
                      <td className="px-5 py-4 text-xs font-mono text-slate">
                        {assignment.hubId || assignment.regionId || assignment.sessionId || (assignment.scopeType === 'platform' ? 'Platform Wide' : 'Not returned')}
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill
                          label={assignment.status.toUpperCase()}
                          variant={assignment.status === 'active' ? 'completed' : assignment.status === 'revoked' ? 'cancelled' : 'draft'}
                        />
                      </td>
                      <td className="px-5 py-4">
                        {canRevoke && (
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

      <div className="mb-8 grid grid-cols-2 gap-6">
        <Card variant="card">
          <div className="mb-3 flex items-center gap-2">
            <PhSlidersHorizontal size={20} color="#1D6B66" />
            <h3 className="m-0 text-base font-semibold text-ink">Operational thresholds</h3>
          </div>
          <p className="m-0 text-sm text-slate">This backend does not expose an API to edit global wait-time or overbooking settings. Queue and session limits shown elsewhere come from API records.</p>
        </Card>

        <Card variant="card" className="border-t-3! border-t-bad!">
          <div className="mb-3 flex items-center gap-2">
            <PhLockKey size={20} color="#C53030" />
            <h3 className="m-0 text-base font-semibold text-ink">Break-glass sessions</h3>
          </div>
          <p className="mb-4 mt-0 text-xs leading-relaxed text-slate">Break-glass access is patient-specific. Requests require a clinical staff role, a selected patient and a reason of at least 20 characters.</p>

          {canReviewBreakGlass && (
            <div className="mb-4 space-y-2">
              {activeBreakGlass.map((entry) => (
                <div key={entry.id} className="rounded-xl bg-bad-bg p-3 text-xs text-bad-fg">
                  <div className="font-bold">Active API record · patient {entry.patient?.healoraCode || entry.patientId}</div>
                  <div className="mt-1">Requested by {entry.user?.name || entry.userId}</div>
                  <div className="mt-1">{entry.reason}</div>
                  <div className="mt-1">Started {entry.startsAt} · Expires {entry.expiresAt}</div>
                  {(availableRoles.includes('platform_super_admin') || entry.userId === currentUser?.id) && <button type="button" onClick={() => endBreakGlass(entry.id)} className="mt-2 rounded-lg bg-bad px-3 py-1.5 font-bold text-white">End session</button>}
                </div>
              ))}
            </div>
          )}

          {!canReviewBreakGlass && canRequestBreakGlass && (
            <div className="mb-4 space-y-2">
              <h4 className="m-0 text-xs font-bold uppercase tracking-wide text-slate">My active break-glass access</h4>
              {myBreakGlass.filter(isBreakGlassActive).length === 0 ? <p className="m-0 rounded-xl bg-bone p-3 text-xs text-slate">No active break-glass access was returned for your account.</p> : myBreakGlass.filter(isBreakGlassActive).map((entry) => (
                <div key={entry.id} className="rounded-xl bg-bad-bg p-3 text-xs text-bad-fg">
                  <div className="font-bold">Patient {entry.patient?.healoraCode || entry.patientId}</div>
                  <div className="mt-1">{entry.reason}</div>
                  <div className="mt-1">Starts {entry.startsAt} Â· Expires {entry.expiresAt}</div>
                  <button type="button" onClick={() => endBreakGlass(entry.id)} className="mt-2 rounded-lg bg-bad px-3 py-1.5 font-bold text-white">End my access</button>
                </div>
              ))}
            </div>
          )}

          {canReviewBreakGlass && (
            <div className="mb-4 space-y-2">
              <h4 className="m-0 text-xs font-bold uppercase tracking-wide text-slate">Break-glass reviews pending</h4>
              {pendingBreakGlassReview.length === 0 ? <p className="m-0 rounded-xl bg-bone p-3 text-xs text-slate">No pending review records were returned.</p> : pendingBreakGlassReview.map((entry) => {
                const isOwnRequest = entry.userId === currentUser?.id;
                const isReviewing = reviewingBreakGlassId === entry.id;
                return <div key={entry.id} className="rounded-xl border border-line bg-paper p-3 text-xs text-slate">
                  <div className="font-bold text-ink">Patient {entry.patient?.healoraCode || entry.patientId} Â· {entry.user?.name || entry.userId}</div>
                  <div className="mt-1">{entry.reason}</div>
                  <div className="mt-1">Starts {entry.startsAt} Â· Expires {entry.expiresAt}</div>
                  {isOwnRequest ? <p className="mb-0 mt-2 text-warn-fg">You cannot review your own access.</p> : <>
                    <textarea aria-label="Review notes" value={breakGlassReviewNotes[entry.id] ?? ''} onChange={(event) => setBreakGlassReviewNotes((items) => ({ ...items, [entry.id]: event.target.value }))} maxLength={2000} rows={2} placeholder="Review notes (required if not justified)" className="mt-2 w-full rounded-lg border border-line p-2" />
                    <div className="mt-2 flex gap-2">
                      <Button variant="secondary" disabled={isReviewing} onClick={() => reviewBreakGlass(entry, 'justified')}>{isReviewing ? 'Saving…' : 'Justified'}</Button>
                      <Button variant="secondary" disabled={isReviewing || !breakGlassReviewNotes[entry.id]?.trim()} onClick={() => reviewBreakGlass(entry, 'not_justified')}>Not justified</Button>
                    </div>
                  </>}
                </div>;
              })}
            </div>
          )}

          {canRequestBreakGlass ? (
            <form onSubmit={handleBreakGlass} className="space-y-3">
              <div className="flex gap-2">
                <input type="tel" value={breakGlassPatientQuery} onChange={(event) => setBreakGlassPatientQuery(event.target.value)} placeholder="Patient phone" className="h-10 flex-1 rounded-xl border border-line px-3 text-sm" />
                <Button type="button" variant="secondary" onClick={handleBreakGlassLookup}>Find patient</Button>
              </div>
              {breakGlassPatients.length > 0 && (
                <label className="block text-xs font-semibold text-slate">Patient record
                  <select required value={breakGlassPatientId} onChange={(event) => setBreakGlassPatientId(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal">
                    <option value="">Select patient</option>
                    {breakGlassPatients.map((patient) => <option key={patient.id} value={patient.id}>{patient.fullName} · {patient.healoraCode}</option>)}
                  </select>
                </label>
              )}
              <label className="block text-xs font-semibold text-slate">Reason (minimum 20 characters)
                <textarea required minLength={20} maxLength={2000} rows={3} value={breakGlassReason} onChange={(event) => setBreakGlassReason(event.target.value)} className="mt-1 w-full rounded-xl border border-line p-2.5 text-sm font-normal" />
              </label>
              <label className="block text-xs font-semibold text-slate">Duration in minutes
                <input type="number" required min={5} max={240} value={breakGlassDuration} onChange={(event) => setBreakGlassDuration(Number(event.target.value))} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" />
              </label>
              <Button type="submit" variant="primary" disabled={!breakGlassPatientId}>Request access</Button>
            </form>
          ) : (
            <p className="m-0 rounded-xl bg-bone p-3 text-xs text-slate">No break-glass request role is assigned to this account. Platform administrators can review and end active sessions.</p>
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
            Choose a staff account and assign a role within the correct region or hub scope. The backend validates and audits the assignment.
          </p>

          {assignmentOptionsError && (
            <p role="alert" className="rounded-lg border border-bad/20 bg-bad-bg px-3 py-2 text-xs text-bad-fg">
              Could not load backend users or regions: {assignmentOptionsError}. Confirm you signed in with a current MFA code, then reopen this form.
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Select Backend Staff Account</label>
            {isLoadingAssignmentOptions ? (
              <p className="rounded-lg border border-line bg-bone px-3 py-3 text-sm text-slate">Loading staff accounts…</p>
            ) : backendUsers.length > 0 ? (
              <select
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                required
                className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none"
              >
                <option value="">-- Choose Staff User --</option>
                {backendUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} — {user.email} ({user.status})
                  </option>
                ))}
              </select>
            ) : (
              <p className="rounded-lg border border-line bg-bone px-3 py-3 text-xs text-slate">
                No backend staff accounts were returned. Create or invite the staff account first, then reopen this form.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Operational Role</label>
            <select
              value={assignRole}
              onChange={(e) => {
                const role = e.target.value as UserRole;
                setAssignRole(role);
                setAssignScopeType(role === 'regional_ops_manager' ? 'region' : role === 'platform_super_admin' ? 'platform' : 'hub');
                setAssignScopeId('');
              }}
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
                disabled={assignRole === 'regional_ops_manager' || assignRole === 'platform_super_admin'}
                onChange={(e) => {
                  setAssignScopeType(e.target.value as 'platform' | 'region' | 'hub' | 'session');
                  setAssignScopeId('');
                }}
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
                  required
                  onChange={(e) => setAssignScopeId(e.target.value)}
                  className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none"
                >
                  <option value="">-- Choose Hub --</option>
                  {hubs.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              ) : assignScopeType === 'hub' ? (
                <p className="rounded-lg border border-line bg-bone px-3 py-3 text-xs text-slate">No hubs were returned by the backend for this account.</p>
              ) : assignScopeType === 'region' && backendRegions.length > 0 ? (
                <select
                  value={assignScopeId}
                  onChange={(e) => setAssignScopeId(e.target.value)}
                  required={assignScopeType === 'region'}
                  className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none"
                >
                  <option value="">-- Choose Region --</option>
                  {backendRegions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              ) : assignScopeType === 'region' ? (
                <p className="rounded-lg border border-line bg-bone px-3 py-3 text-xs text-slate">No active operational regions available from the backend.</p>
              ) : assignScopeType === 'session' && sessions.length > 0 ? (
                <select value={assignScopeId} onChange={(e) => setAssignScopeId(e.target.value)} required className="h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm text-ink outline-none">
                  <option value="">-- Choose Session --</option>
                  {sessions.map((session) => <option key={session.id} value={session.id}>{session.title} · {session.date}</option>)}
                </select>
              ) : assignScopeType === 'session' ? (
                <p className="rounded-lg border border-line bg-bone px-3 py-3 text-xs text-slate">No sessions were returned by the backend for this account.</p>
              ) : assignScopeType === 'platform' ? (
                <p className="rounded-lg border border-line bg-bone px-3 py-3 text-xs text-slate">This role applies at platform scope and does not use a target entity ID.</p>
              ) : (
                <p className="rounded-lg border border-line bg-bone px-3 py-3 text-xs text-slate">Choose a valid scope boundary above.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmittingRole || isLoadingAssignmentOptions || !backendUsers.length || (['region', 'hub', 'session'].includes(assignScopeType) && !assignScopeId)}>
              {isSubmittingRole ? 'Assigning via API...' : 'Commit Assignment (API)'}
            </Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
