import React, { useState } from 'react';
import { PhPlus } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
import type { StaffMember, UserRole } from '../../types';
import { ROLES_CONFIG } from '../../config/rolesConfig';
import { staffService } from '../../services/staffService';

const INVITABLE_HUB_ROLES: UserRole[] = ['hub_manager', 'reception_officer', 'queue_coordinator', 'equipment_officer'];

export const TeamRosterView: React.FC = () => {
  const { t, staff, hubs, selectedHubId, activeRole, addStaffMember, refreshBackendData, showToast } = useApp();
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<UserRole>('reception_officer');
  const [isCreating, setIsCreating] = useState(false);
  const [issuedAccount, setIssuedAccount] = useState<{ userId: string; temporaryPassword: string; activated: boolean } | null>(null);
  const [isRetryingActivation, setIsRetryingActivation] = useState(false);
  const canInviteStaff = activeRole === 'platform_super_admin' || activeRole === 'regional_ops_manager';

  const hubStaff = staff.filter((person) => person.assignedHubIds.includes(selectedHubId));
  const hubName = hubs.find((hub) => hub.id === selectedHubId)?.name ?? '';

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
        setStaffName(''); setStaffEmail(''); setStaffPhone('');
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
        const result = await staffService.setUserStatus(issuedAccount.userId, 'active', 'Activated after initial staff setup');
        if (result.user.status !== 'active') throw new Error('The backend did not activate this account.');
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

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">Hub staff roster</div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navTeam}</h1>
          <p className="mt-1 text-sm text-slate">Accounts, hub roles and shifts loaded from the backend · {hubName}</p>
        </div>
        {canInviteStaff && <Button variant="primary" disabled={!selectedHubId} onClick={() => setIsAddStaffOpen(true)} icon={<PhPlus size={16} />}>Create staff account</Button>}
      </div>

      {hubStaff.length === 0 ? <Card variant="card"><p className="m-0 text-sm text-slate">No staff role assignments were returned for this hub.</p></Card> : (
        <div className="grid grid-cols-2 gap-5">
          {hubStaff.map((person) => (
            <Card key={person.id} variant="card">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="m-0 text-lg font-semibold text-ink">{person.fullName}</h2>
                  <p className="mb-0 mt-1 text-sm text-slate">{ROLES_CONFIG[person.role]?.title ?? person.role}</p>
                </div>
                <StatusPill label={person.active ? 'Account active' : 'Account inactive'} variant={person.active ? 'active' : 'draft'} />
              </div>
              <div className="mt-4 space-y-1 text-sm text-slate">
                <div>Email: {person.email || 'Not returned'}</div>
                <div>Phone: {person.phone || 'Not returned'}</div>
                <div>Shift: {person.activeShift || 'No shift returned'}</div>
              </div>
              <div className="mt-4 border-t border-line pt-3">
                <Button variant="secondary" onClick={() => setSelectedStaff(person)}>View account data</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ModalSheet isOpen={!!selectedStaff} onClose={() => setSelectedStaff(null)} title={selectedStaff?.fullName ?? 'Staff account'}>
        {selectedStaff && <div className="space-y-2 text-sm text-slate">
          <div>User ID: <span className="font-mono">{selectedStaff.id}</span></div>
          <div>Role: {selectedStaff.role}</div>
          <div>Email: {selectedStaff.email || 'Not returned'}</div>
          <div>Phone: {selectedStaff.phone || 'Not returned'}</div>
          <div>Assigned hubs: {selectedStaff.assignedHubIds.join(', ') || 'None returned'}</div>
          <div>Shift: {selectedStaff.activeShift || 'No shift returned'}</div>
        </div>}
      </ModalSheet>

      <ModalSheet isOpen={isAddStaffOpen} onClose={() => !isCreating && setIsAddStaffOpen(false)} title="Create staff account for hub">
        <form onSubmit={handleCreate} className="space-y-3">
          <label className="block text-xs font-semibold text-slate">Full name *<input required value={staffName} onChange={(event) => setStaffName(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Work email *<input required type="email" value={staffEmail} onChange={(event) => setStaffEmail(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Phone<input type="tel" value={staffPhone} onChange={(event) => setStaffPhone(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Hub role *<select value={staffRole} onChange={(event) => setStaffRole(event.target.value as UserRole)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal">{INVITABLE_HUB_ROLES.map((role) => <option key={role} value={role}>{ROLES_CONFIG[role]?.title ?? role}</option>)}</select></label>
          <p className="m-0 text-xs text-slate">The backend creates and activates the account, assigns this hub role, and returns a one-time temporary password. The staff member must change it at first sign-in. Clinical roles need a verified backend credential before they can be assigned.</p>
          <div className="flex justify-end gap-2"><Button variant="secondary" disabled={isCreating} onClick={() => setIsAddStaffOpen(false)}>Cancel</Button><Button variant="primary" disabled={isCreating} type="submit">{isCreating ? 'Creating…' : 'Create and activate account'}</Button></div>
        </form>
      </ModalSheet>

      <ModalSheet isOpen={!!issuedAccount} onClose={() => setIssuedAccount(null)} title="One-time staff password">
        {issuedAccount && <div className="space-y-4 text-sm text-slate">
          <p className="m-0">Copy this password and give it securely to the staff member. It is shown only now; the backend requires a password change at first sign-in.</p>
          <div className="rounded-xl border border-line bg-bone p-4">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate">Temporary password</div>
            <code className="select-all break-all text-base font-bold text-ink">{issuedAccount.temporaryPassword}</code>
          </div>
          <div className="text-xs">User ID: <span className="font-mono">{issuedAccount.userId}</span></div>
          {!issuedAccount.activated && <div className="rounded-lg border border-warn bg-warn-bg p-3 text-xs text-warn-fg">The backend returned the temporary password, but the account is not confirmed active yet. Retry activation before the staff member signs in.</div>}
          <div className="flex justify-end gap-2">
            {!issuedAccount.activated && <Button variant="secondary" disabled={isRetryingActivation} onClick={retryActivation}>{isRetryingActivation ? 'Activating…' : 'Retry activation'}</Button>}
            <Button variant="primary" onClick={() => setIssuedAccount(null)}>Done</Button>
          </div>
        </div>}
      </ModalSheet>
    </div>
  );
};
