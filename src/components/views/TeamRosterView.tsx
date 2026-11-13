import React, { useEffect, useState, useCallback } from 'react';
import { PhPlus, PhArrowsClockwise } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { SegmentedTabs } from '../common/Tabs';
import { useApp } from '../../context/useApp';
import type { StaffMember, UserRole } from '../../types';
import { ROLES_CONFIG } from '../../config/rolesConfig';
import {
  staffService,
  type ApiUser,
  type ApiShift,
  type ApiRoleAssignment,
  type ApiStaffCredential,
} from '../../services/staffService';

const INVITABLE_HUB_ROLES: UserRole[] = [
  'hub_manager',
  'reception_officer',
  'queue_coordinator',
  'equipment_officer',
];

export const TeamRosterView: React.FC = () => {
  const {
    t,
    staff,
    hubs,
    sessions,
    stations,
    selectedHubId,
    activeRole,
    addStaffMember,
    refreshBackendData,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'roster' | 'shifts' | 'my_shifts'>('roster');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [staffInspectorTab, setStaffInspectorTab] = useState<'account' | 'security' | 'credentials'>('account');
  const [liveUser, setLiveUser] = useState<ApiUser | null>(null);
  const [userAssignments, setUserAssignments] = useState<ApiRoleAssignment[]>([]);
  const [userCredentials, setUserCredentials] = useState<ApiStaffCredential[]>([]);
  const [editUserName, setEditUserName] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [securityReason, setSecurityReason] = useState('');

  // Add credential form states
  const [credDesignation, setCredDesignation] = useState('Registered Physician');
  const [credQualification, setCredQualification] = useState('MBBS');
  const [credRegBody, setCredRegBody] = useState('BMDC');
  const [credRegNo, setCredRegNo] = useState('');
  const [credRoles, setCredRoles] = useState('local_doctor');

  // Create staff states
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('reception_officer');
  const [isCreating, setIsCreating] = useState(false);
  const [issuedAccount, setIssuedAccount] = useState<{
    userId: string;
    temporaryPassword: string;
    activated: boolean;
  } | null>(null);
  const [isRetryingActivation, setIsRetryingActivation] = useState(false);

  // Shifts states
  const [shifts, setShifts] = useState<ApiShift[]>([]);
  const [myShifts, setMyShifts] = useState<ApiShift[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [isNewShiftOpen, setIsNewShiftOpen] = useState(false);
  const [shiftUserId, setShiftUserId] = useState('');
  const [shiftRole, setShiftRole] = useState('reception_officer');
  const [shiftSessionId, setShiftSessionId] = useState('');
  const [shiftStationId, setShiftStationId] = useState('');
  const [shiftStartsAt, setShiftStartsAt] = useState('');
  const [shiftEndsAt, setShiftEndsAt] = useState('');
  const [shiftActionReason, setShiftActionReason] = useState('');
  const [inspectingShift, setInspectingShift] = useState<ApiShift | null>(null);

  const canInviteStaff =
    activeRole === 'platform_super_admin' ||
    activeRole === 'regional_ops_manager' ||
    activeRole === 'hub_manager';

  const hubStaff = staff.filter((person) => person.assignedHubIds.includes(selectedHubId));
  const hubName = hubs.find((hub) => hub.id === selectedHubId)?.name ?? '';
  const hubSessions = sessions.filter((s) => s.hubId === selectedHubId);
  const hubStations = stations.filter((s) => s.hubId === selectedHubId);

  const loadShifts = useCallback(async () => {
    if (!selectedHubId) return;
    setLoadingShifts(true);
    try {
      const res = await staffService.getShifts({ hubId: selectedHubId });
      setShifts(res.items ?? []);
    } catch {
      setShifts([]);
    } finally {
      setLoadingShifts(false);
    }
  }, [selectedHubId]);

  const loadMyShifts = useCallback(async () => {
    setLoadingShifts(true);
    try {
      const res = await staffService.getMyShifts();
      setMyShifts(Array.isArray(res) ? res : []);
    } catch {
      setMyShifts([]);
    } finally {
      setLoadingShifts(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'shifts') void loadShifts();
    if (activeTab === 'my_shifts') void loadMyShifts();
  }, [activeTab, loadShifts, loadMyShifts]);

  const openStaffInspector = async (person: StaffMember) => {
    setSelectedStaff(person);
    setStaffInspectorTab('account');
    setEditUserName(person.fullName);
    setEditUserPhone(person.phone || '');
    setSecurityReason('');
    try {
      const [u, assigns, creds] = await Promise.all([
        staffService.getUser(person.id).catch(() => null),
        staffService.getUserRoleAssignments(person.id, true).catch(() => ({ items: [] })),
        staffService.getUserCredentials(person.id).catch(() => ({ items: [] })),
      ]);
      setLiveUser(u);
      if (u?.name) setEditUserName(u.name);
      if (u?.phone) setEditUserPhone(u.phone);
      setUserAssignments(assigns.items ?? []);
      setUserCredentials(creds.items ?? []);
    } catch {
      // ignore
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      await staffService.updateUser(selectedStaff.id, {
        name: editUserName.trim(),
        phone: editUserPhone.trim() || null,
      });
      await refreshBackendData();
      showToast('Staff profile updated.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update staff profile.');
    }
  };

  const handleSecurityAction = async (
    action: 'unlock' | 'reset_mfa' | 'revoke_sessions' | 'temp_password' | 'suspend' | 'activate'
  ) => {
    if (!selectedStaff) return;
    const reason = securityReason.trim() || 'Administrative security action';
    try {
      if (action === 'unlock') {
        await staffService.unlockUser(selectedStaff.id, reason);
        showToast('User account unlocked.');
      } else if (action === 'reset_mfa') {
        await staffService.resetMfa(selectedStaff.id, reason);
        showToast('User MFA reset.');
      } else if (action === 'revoke_sessions') {
        await staffService.revokeUserSessions(selectedStaff.id, reason);
        showToast('All active sessions for user revoked.');
      } else if (action === 'temp_password') {
        const res = await staffService.issueTemporaryPassword(selectedStaff.id, reason);
        setIssuedAccount({
          userId: selectedStaff.id,
          temporaryPassword: res.temporaryPassword,
          activated: true,
        });
      } else if (action === 'suspend') {
        await staffService.setUserStatus(selectedStaff.id, 'suspended', reason);
        showToast('User suspended.');
      } else if (action === 'activate') {
        await staffService.setUserStatus(selectedStaff.id, 'active', reason);
        showToast('User activated.');
      }
      await refreshBackendData();
      await openStaffInspector(selectedStaff);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Action failed.');
    }
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !credDesignation.trim() || !credQualification.trim()) return;
    try {
      await staffService.addUserCredential(selectedStaff.id, {
        professionalDesignation: credDesignation.trim(),
        qualification: credQualification.trim(),
        registrationBody: credRegBody.trim() || null,
        registrationNumber: credRegNo.trim() || null,
        qualifiesForRoles: credRoles
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setCredRegNo('');
      const creds = await staffService.getUserCredentials(selectedStaff.id);
      setUserCredentials(creds.items ?? []);
      showToast('Clinical credential recorded.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add credential.');
    }
  };

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedHubId) {
      showToast('Select a hub before adding a staff account.');
      return;
    }
    setIsCreating(true);
    try {
      const created = await addStaffMember({
        fullName: staffName,
        email: staffEmail,
        phone: staffPhone,
        role: staffRole,
        assignedHubIds: [selectedHubId],
      });
      if (created) {
        setStaffName('');
        setStaffEmail('');
        setStaffPhone('');
        setIsAddStaffOpen(false);
        setIssuedAccount(created);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const retryActivation = async () => {
    if (!issuedAccount) return;
    setIsRetryingActivation(true);
    try {
      const current = await staffService.getUser(issuedAccount.userId);
      if (current.status !== 'active') {
        const result = await staffService.setUserStatus(
          issuedAccount.userId,
          'active',
          'Activated after initial staff setup'
        );
        if (result.user.status !== 'active') {
          throw new Error('The backend did not activate this account.');
        }
      }
      setIssuedAccount({ ...issuedAccount, activated: true });
      await refreshBackendData();
      showToast('Staff account is active.');
    } catch (error) {
      showToast(`Account activation failed: ${error instanceof Error ? error.message : 'Request failed'}`);
    } finally {
      setIsRetryingActivation(false);
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHubId || !shiftUserId || !shiftStartsAt || !shiftEndsAt) return;
    try {
      await staffService.createShift({
        hubId: selectedHubId,
        userId: shiftUserId,
        role: shiftRole,
        startsAt: new Date(shiftStartsAt).toISOString(),
        endsAt: new Date(shiftEndsAt).toISOString(),
        sessionId: shiftSessionId || undefined,
        stationId: shiftStationId || undefined,
      });
      setIsNewShiftOpen(false);
      await loadShifts();
      showToast('Shift scheduled.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create shift.');
    }
  };

  const handleShiftTransition = async (
    shiftId: string,
    action: 'approve' | 'check_in' | 'check_out' | 'cancel' | 'absent'
  ) => {
    const reason = shiftActionReason.trim() || `Shift ${action} via hub web console`;
    try {
      if (action === 'approve') await staffService.approveShift(shiftId);
      else if (action === 'check_in') await staffService.checkInShift(shiftId);
      else if (action === 'check_out') await staffService.checkOutShift(shiftId);
      else if (action === 'cancel') await staffService.cancelShift(shiftId, reason);
      else if (action === 'absent') await staffService.markShiftAbsent(shiftId, reason);
      showToast(`Shift ${action.replace('_', ' ')} recorded.`);
      if (activeTab === 'shifts') await loadShifts();
      if (activeTab === 'my_shifts') await loadMyShifts();
    } catch (err) {
      showToast(err instanceof Error ? err.message : `Failed to ${action} shift.`);
    }
  };

  const openShiftDetail = async (shiftId: string) => {
    try {
      const detail = await staffService.getShift(shiftId);
      setInspectingShift(detail);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not load shift detail.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">
            Hub staff roster, credentials & shift scheduling
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navTeam}</h1>
          <p className="mt-1 text-sm text-slate">
            Accounts, hub roles, clinical credentials, and shift attendance loaded from the backend · {hubName}
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'shifts' && (
            <Button variant="primary" onClick={() => setIsNewShiftOpen(true)} icon={<PhPlus size={16} />}>
              Schedule Shift
            </Button>
          )}
          {canInviteStaff && (
            <Button
              variant="primary"
              disabled={!selectedHubId}
              onClick={() => setIsAddStaffOpen(true)}
              icon={<PhPlus size={16} />}
            >
              Create staff account
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <SegmentedTabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as 'roster' | 'shifts' | 'my_shifts')}
          options={[
            { key: 'roster', label: 'Hub Staff Roster', count: hubStaff.length },
            { key: 'shifts', label: 'Shift Schedule', count: shifts.length },
            { key: 'my_shifts', label: 'My Shifts', count: myShifts.length },
          ]}
        />
        {activeTab !== 'roster' && (
          <Button
            variant="small"
            onClick={() => void (activeTab === 'shifts' ? loadShifts() : loadMyShifts())}
            icon={<PhArrowsClockwise size={14} />}
          >
            Refresh Shifts
          </Button>
        )}
      </div>

      {activeTab === 'roster' && (
        <>
          {hubStaff.length === 0 ? (
            <Card variant="card">
              <p className="m-0 text-sm text-slate">No staff role assignments were returned for this hub.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-5">
              {hubStaff.map((person) => (
                <Card key={person.id} variant="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="m-0 text-lg font-semibold text-ink">{person.fullName}</h2>
                      <p className="mb-0 mt-1 text-sm text-slate">
                        {ROLES_CONFIG[person.role]?.title ?? person.role}
                      </p>
                    </div>
                    <StatusPill
                      label={person.active ? 'Account active' : 'Account inactive'}
                      variant={person.active ? 'active' : 'draft'}
                    />
                  </div>
                  <div className="mt-4 space-y-1 text-sm text-slate">
                    <div>Email: {person.email || 'Not returned'}</div>
                    <div>Phone: {person.phone || 'Not returned'}</div>
                    <div>Shift: {person.activeShift || 'No shift returned'}</div>
                  </div>
                  <div className="mt-4 border-t border-line pt-3">
                    <Button variant="secondary" onClick={() => void openStaffInspector(person)}>
                      Manage Account, Security & Credentials
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'shifts' && (
        <div className="space-y-4">
          <Card variant="card" className="p-3.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate">
                Shift Cancellation / Absence Reason (when cancelling or marking absent):
              </span>
              <input
                type="text"
                value={shiftActionReason}
                onChange={(e) => setShiftActionReason(e.target.value)}
                placeholder="e.g. Medical leave / reassigned to camp"
                className="h-8 flex-1 rounded-lg border border-line px-2.5 text-xs"
              />
            </div>
          </Card>

          {loadingShifts ? (
            <Card variant="card">
              <p className="m-0 text-sm text-slate">Loading hub shifts...</p>
            </Card>
          ) : shifts.length === 0 ? (
            <Card variant="card">
              <p className="m-0 text-sm text-slate">
                No shifts scheduled for this hub. Click &ldquo;Schedule Shift&rdquo; above to assign staff.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {shifts.map((sh) => (
                <Card key={sh.id} variant="card">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink">
                          {sh.user?.name || sh.staffName || sh.userId}
                        </span>
                        <span className="rounded bg-sage-200 px-2 py-0.5 text-[11px] font-bold uppercase text-pine">
                          {sh.role}
                        </span>
                        <StatusPill
                          label={sh.status.toUpperCase()}
                          variant={
                            sh.status === 'checked_in' || sh.status === 'approved'
                              ? 'active'
                              : sh.status === 'cancelled' || sh.status === 'absent'
                                ? 'cancelled'
                                : 'upcoming'
                          }
                        />
                      </div>
                      <div className="mt-1 text-xs text-slate">
                        {new Date(sh.startsAt).toLocaleString()} → {new Date(sh.endsAt).toLocaleString()}
                      </div>
                      {sh.station && (
                        <div className="mt-0.5 text-xs text-slate">Station: {sh.station.name}</div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      <Button variant="small" onClick={() => void openShiftDetail(sh.id)}>
                        Inspect
                      </Button>
                      {sh.status === 'proposed' && (
                        <Button
                          variant="small"
                          onClick={() => void handleShiftTransition(sh.id, 'approve')}
                        >
                          Approve
                        </Button>
                      )}
                      {['proposed', 'approved'].includes(sh.status) && (
                        <Button
                          variant="small"
                          onClick={() => void handleShiftTransition(sh.id, 'check_in')}
                        >
                          Check In
                        </Button>
                      )}
                      {sh.status === 'checked_in' && (
                        <Button
                          variant="small"
                          onClick={() => void handleShiftTransition(sh.id, 'check_out')}
                        >
                          Check Out
                        </Button>
                      )}
                      {!['cancelled', 'checked_out', 'absent'].includes(sh.status) && (
                        <>
                          <button
                            type="button"
                            onClick={() => void handleShiftTransition(sh.id, 'absent')}
                            className="cursor-pointer rounded-lg border border-warn/40 bg-warn-bg px-2.5 py-1 text-xs font-semibold text-warn-fg"
                          >
                            Mark Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => void handleShiftTransition(sh.id, 'cancel')}
                            className="cursor-pointer rounded-lg border border-bad/40 px-2.5 py-1 text-xs font-semibold text-bad"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'my_shifts' && (
        <div className="space-y-3">
          {myShifts.length === 0 ? (
            <Card variant="card">
              <p className="m-0 text-sm text-slate">No shifts assigned to your account.</p>
            </Card>
          ) : (
            myShifts.map((sh) => (
              <Card key={sh.id} variant="card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-ink">
                      {sh.hub?.name || sh.hubName || sh.hubId} — {sh.role}
                    </div>
                    <div className="text-xs text-slate">
                      {new Date(sh.startsAt).toLocaleString()} → {new Date(sh.endsAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill label={sh.status} variant="active" />
                    {sh.status === 'approved' && (
                      <Button
                        variant="small"
                        onClick={() => void handleShiftTransition(sh.id, 'check_in')}
                      >
                        Check In
                      </Button>
                    )}
                    {sh.status === 'checked_in' && (
                      <Button
                        variant="small"
                        onClick={() => void handleShiftTransition(sh.id, 'check_out')}
                      >
                        Check Out
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Staff Account, Security & Credentials Inspector Modal */}
      <ModalSheet
        isOpen={!!selectedStaff}
        onClose={() => setSelectedStaff(null)}
        title={selectedStaff?.fullName ?? 'Staff account'}
        subtitle={`User ID: ${selectedStaff?.id || ''} • Status: ${liveUser?.status || (selectedStaff?.active ? 'active' : 'inactive')}`}
      >
        {selectedStaff && (
          <div className="space-y-4">
            <SegmentedTabs
              activeKey={staffInspectorTab}
              onChange={(k) => setStaffInspectorTab(k as 'account' | 'security' | 'credentials')}
              options={[
                { key: 'account', label: 'Profile & Roles', count: userAssignments.length },
                { key: 'security', label: 'Security & Access' },
                { key: 'credentials', label: 'Credentials', count: userCredentials.length },
              ]}
            />

            {staffInspectorTab === 'account' && (
              <div className="space-y-4">
                <form onSubmit={handleUpdateUser} className="space-y-3 rounded-xl bg-bone p-3.5">
                  <div className="text-xs font-semibold text-ink">Update Staff Profile</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <label className="block text-xs text-slate">
                      Full Name
                      <input
                        required
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border border-line bg-paper px-2.5 text-xs text-ink"
                      />
                    </label>
                    <label className="block text-xs text-slate">
                      Phone
                      <input
                        value={editUserPhone}
                        onChange={(e) => setEditUserPhone(e.target.value)}
                        className="mt-1 h-9 w-full rounded-lg border border-line bg-paper px-2.5 text-xs text-ink"
                      />
                    </label>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="small" type="submit">
                      Save Profile
                    </Button>
                  </div>
                </form>

                <div className="text-xs font-semibold text-ink">
                  User Role Assignments ({userAssignments.length})
                </div>
                {userAssignments.length === 0 ? (
                  <div className="text-xs text-slate">No role assignments returned.</div>
                ) : (
                  <div className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                    {userAssignments.map((ra) => (
                      <div
                        key={ra.id}
                        className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-xs"
                      >
                        <span>
                          <strong>{ra.role}</strong> ({ra.scopeType})
                        </span>
                        <StatusPill
                          label={ra.status}
                          variant={ra.status === 'active' ? 'active' : 'cancelled'}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {staffInspectorTab === 'security' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate">
                  Audit Reason for Security Action *
                  <input
                    value={securityReason}
                    onChange={(e) => setSecurityReason(e.target.value)}
                    placeholder="e.g. Locked out at reception desk / new phone for MFA"
                    className="mt-1 h-9 w-full rounded-lg border border-line px-3 text-xs font-normal"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="small" onClick={() => void handleSecurityAction('unlock')}>
                    Unlock Account
                  </Button>
                  <Button variant="small" onClick={() => void handleSecurityAction('reset_mfa')}>
                    Reset MFA
                  </Button>
                  <Button variant="small" onClick={() => void handleSecurityAction('revoke_sessions')}>
                    Revoke Active Sessions
                  </Button>
                  <Button variant="small" onClick={() => void handleSecurityAction('temp_password')}>
                    Issue Temp Password
                  </Button>
                  <Button variant="small" onClick={() => void handleSecurityAction('activate')}>
                    Set Active
                  </Button>
                  <Button variant="small" onClick={() => void handleSecurityAction('suspend')}>
                    Suspend User
                  </Button>
                </div>
              </div>
            )}

            {staffInspectorTab === 'credentials' && (
              <div className="space-y-3">
                <form onSubmit={handleAddCredential} className="space-y-2 rounded-xl bg-bone p-3">
                  <div className="text-xs font-semibold text-ink">Record Clinical / Professional Credential</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      required
                      value={credDesignation}
                      onChange={(e) => setCredDesignation(e.target.value)}
                      placeholder="Designation (e.g. Local Doctor)"
                      className="h-8 rounded-lg border border-line bg-paper px-2 text-xs"
                    />
                    <input
                      required
                      value={credQualification}
                      onChange={(e) => setCredQualification(e.target.value)}
                      placeholder="Qualification (e.g. MBBS)"
                      className="h-8 rounded-lg border border-line bg-paper px-2 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      value={credRegBody}
                      onChange={(e) => setCredRegBody(e.target.value)}
                      placeholder="Body (BMDC)"
                      className="h-8 rounded-lg border border-line bg-paper px-2 text-xs"
                    />
                    <input
                      value={credRegNo}
                      onChange={(e) => setCredRegNo(e.target.value)}
                      placeholder="Reg / License #"
                      className="h-8 rounded-lg border border-line bg-paper px-2 text-xs"
                    />
                    <input
                      value={credRoles}
                      onChange={(e) => setCredRoles(e.target.value)}
                      placeholder="Roles (local_doctor)"
                      className="h-8 rounded-lg border border-line bg-paper px-2 text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="small" type="submit">
                      Add Credential
                    </Button>
                  </div>
                </form>

                {userCredentials.length === 0 ? (
                  <div className="text-xs text-slate">No clinical credentials recorded for this user.</div>
                ) : (
                  <div className="space-y-1.5">
                    {userCredentials.map((cred) => (
                      <div
                        key={cred.id}
                        className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-ink">
                            {cred.professionalDesignation} ({cred.qualification})
                          </div>
                          <div className="text-[11px] text-slate">
                            {cred.registrationBody || 'Reg'}: {cred.registrationNumber || '—'} • Roles:{' '}
                            {cred.qualifiesForRoles.join(', ')}
                          </div>
                        </div>
                        <StatusPill
                          label={cred.status}
                          variant={cred.status === 'verified' ? 'active' : 'upcoming'}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </ModalSheet>

      {/* Schedule Shift Modal */}
      <ModalSheet
        isOpen={isNewShiftOpen}
        onClose={() => setIsNewShiftOpen(false)}
        title="Schedule Hub Shift"
      >
        <form onSubmit={handleCreateShift} className="space-y-3">
          <label className="block text-xs font-semibold text-slate">
            Staff Member *
            <select
              required
              value={shiftUserId}
              onChange={(e) => setShiftUserId(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm font-normal"
            >
              <option value="">Select staff...</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.fullName} ({s.role})
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate">
            Shift Role *
            <select
              value={shiftRole}
              onChange={(e) => setShiftRole(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm font-normal"
            >
              <option value="hub_manager">Hub Manager</option>
              <option value="reception_officer">Reception Officer</option>
              <option value="queue_coordinator">Queue Coordinator</option>
              <option value="equipment_officer">Equipment Officer</option>
              <option value="field_health_worker">Field Health Worker</option>
              <option value="local_doctor">Local Doctor</option>
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate">
              Starts At *
              <input
                type="datetime-local"
                required
                value={shiftStartsAt}
                onChange={(e) => setShiftStartsAt(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-xs font-normal"
              />
            </label>
            <label className="block text-xs font-semibold text-slate">
              Ends At *
              <input
                type="datetime-local"
                required
                value={shiftEndsAt}
                onChange={(e) => setShiftEndsAt(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-xs font-normal"
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-xs font-semibold text-slate">
              Linked Session (Optional)
              <select
                value={shiftSessionId}
                onChange={(e) => setShiftSessionId(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-xs font-normal"
              >
                <option value="">None</option>
                {hubSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.date})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate">
              Station (Optional)
              <select
                value={shiftStationId}
                onChange={(e) => setShiftStationId(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-xs font-normal"
              >
                <option value="">None</option>
                {hubStations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsNewShiftOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Shift
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Shift Inspector Modal */}
      {inspectingShift && (
        <ModalSheet
          isOpen={!!inspectingShift}
          onClose={() => setInspectingShift(null)}
          title="Shift Record Detail"
        >
          <div className="space-y-2 text-xs text-slate">
            <div>
              Shift ID: <span className="font-mono text-ink">{inspectingShift.id}</span>
            </div>
            <div>
              Staff: <strong className="text-ink">{inspectingShift.user?.name || inspectingShift.userId}</strong>
            </div>
            <div>Role: {inspectingShift.role}</div>
            <div>Status: {inspectingShift.status}</div>
            <div>Starts: {new Date(inspectingShift.startsAt).toLocaleString()}</div>
            <div>Ends: {new Date(inspectingShift.endsAt).toLocaleString()}</div>
            {inspectingShift.station && <div>Station: {inspectingShift.station.name}</div>}
            {inspectingShift.session && <div>Session: {inspectingShift.session.title}</div>}
          </div>
        </ModalSheet>
      )}

      {/* Create Staff Account Modal */}
      <ModalSheet
        isOpen={isAddStaffOpen}
        onClose={() => !isCreating && setIsAddStaffOpen(false)}
        title="Create staff account for hub"
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <label className="block text-xs font-semibold text-slate">
            Full name *
            <input
              required
              value={staffName}
              onChange={(event) => setStaffName(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Work email *
            <input
              required
              type="email"
              value={staffEmail}
              onChange={(event) => setStaffEmail(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Phone
            <input
              type="tel"
              value={staffPhone}
              onChange={(event) => setStaffPhone(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Hub role *
            <select
              value={staffRole}
              onChange={(event) => setStaffRole(event.target.value as UserRole)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            >
              {INVITABLE_HUB_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ROLES_CONFIG[role]?.title ?? role}
                </option>
              ))}
            </select>
          </label>
          <p className="m-0 text-xs text-slate">
            The backend creates and activates the account, assigns this hub role, and returns a one-time temporary password.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" disabled={isCreating} onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={isCreating} type="submit">
              {isCreating ? 'Creating…' : 'Create and activate account'}
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* One-time Password Modal */}
      <ModalSheet
        isOpen={!!issuedAccount}
        onClose={() => setIssuedAccount(null)}
        title="One-time staff password"
      >
        {issuedAccount && (
          <div className="space-y-4 text-sm text-slate">
            <p className="m-0">
              Copy this password and give it securely to the staff member. It is shown only now; the backend requires a password change at first sign-in.
            </p>
            <div className="rounded-xl border border-line bg-bone p-4">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate">
                Temporary password
              </div>
              <code className="select-all break-all text-base font-bold text-ink">
                {issuedAccount.temporaryPassword}
              </code>
            </div>
            <div className="text-xs">
              User ID: <span className="font-mono">{issuedAccount.userId}</span>
            </div>
            {!issuedAccount.activated && (
              <div className="rounded-lg border border-warn bg-warn-bg p-3 text-xs text-warn-fg">
                The backend returned the temporary password, but the account is not confirmed active yet. Retry activation before the staff member signs in.
              </div>
            )}
            <div className="flex justify-end gap-2">
              {!issuedAccount.activated && (
                <Button variant="secondary" disabled={isRetryingActivation} onClick={retryActivation}>
                  {isRetryingActivation ? 'Activating…' : 'Retry activation'}
                </Button>
              )}
              <Button variant="primary" onClick={() => setIssuedAccount(null)}>
                Done
              </Button>
            </div>
          </div>
        )}
      </ModalSheet>
    </div>
  );
};
