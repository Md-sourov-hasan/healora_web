import { useEffect, useState } from 'react';
import { sessionsService, type ApiSession } from '../../services/sessionsService';
import { ApiError } from '../../services/apiClient';
import { useApp } from '../../context/useApp';
import { Button } from '../common/Button';

export function describeWalkInError(error: unknown): string {
  if (!(error instanceof ApiError)) return error instanceof Error ? error.message : 'Request failed. Please try again.';
  const advice: Record<string, string> = {
    WALK_IN_CAPACITY_FULL: 'Increase walk-in capacity below, or select another session with available places.',
    IDENTITY_UNRESOLVED: 'The patient has a possible duplicate record. An administrator must review that record before check-in; do not register the patient again.',
    DUPLICATE_BOOKING: 'This patient already has a booking for the session. Check Appointments or Live Queue.',
    NOT_SESSION_DAY: 'Check-in is allowed on the session date (Bangladesh time).',
    MFA_REQUIRED: 'Complete MFA sign-in before this action.',
    VERSION_MISMATCH: 'The session changed. Refresh capacity and try again.',
  };
  const details = Array.isArray(error.details) ? error.details.map((item) => item && typeof item === 'object' && 'message' in item ? `${'path' in item ? String(item.path) + ': ' : ''}${String(item.message)}` : '').filter(Boolean).join('; ') : '';
  return `${error.code}: ${error.message}${details ? ` — ${details}` : ''}${advice[error.code] ? ` ${advice[error.code]}` : ''}`;
}

export function WalkInSessionCapacity({ sessionId }: { sessionId: string }) {
  const { availableRoles, refreshBackendData } = useApp();
  const [session, setSession] = useState<ApiSession | null>(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [capacity, setCapacity] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const canManage = availableRoles.some((role) => ['platform_super_admin', 'regional_ops_manager', 'hub_manager'].includes(role));

  useEffect(() => {
    let current = true;
    setSession(null); setError(''); setEditing(false); setReason('');
    if (!sessionId) { setLoading(false); return; }
    setLoading(true);
    sessionsService.getSession(sessionId).then((result) => {
      if (current) { setSession(result); setCapacity(String(result.walkInCapacity)); }
    }).catch((failure) => { if (current) setError(describeWalkInError(failure)); })
      .finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [sessionId, revision]);

  const save = async () => {
    if (!session || saving) return;
    const value = Number(capacity);
    if (!capacity.trim() || !Number.isInteger(value) || value < session.walkInCount || value > 5000 || reason.trim().length < 3) {
      setError(`Enter a total capacity from ${session.walkInCount} to 5000 and a reason of at least 3 characters.`); return;
    }
    setSaving(true); setError('');
    try {
      const updated = await sessionsService.updateCapacity(session.id, { walkInCapacity: value, expectedVersion: session.version, reason: reason.trim() });
      setSession(updated); setCapacity(String(updated.walkInCapacity)); setEditing(false); setReason('');
      await refreshBackendData();
    } catch (failure) { setError(describeWalkInError(failure)); }
    finally { setSaving(false); }
  };

  if (!sessionId) return null;
  return <div className="space-y-2 rounded-xl border border-line bg-bone p-3 text-sm">
    {loading && <p role="status">Loading current walk-in capacity…</p>}
    {session && <>
      <div>Walk-in places: <strong>{Math.max(0, session.walkInCapacity - session.walkInCount)} remaining</strong> ({session.walkInCount} used / {session.walkInCapacity} total)</div>
      {session.allowOverbooking && <div>Overbooking is enabled by the backend.</div>}
      {!session.allowOverbooking && session.walkInCount >= session.walkInCapacity && <p className="text-bad">This session has no walk-in places available.</p>}
      {canManage && !editing && <Button variant="text" onClick={() => setEditing(true)}>Edit walk-in capacity</Button>}
      {editing && <div className="space-y-2">
        <label className="block">Total walk-in capacity<input type="number" min={session.walkInCount} max={5000} step={1} value={capacity} disabled={saving} onChange={(event) => setCapacity(event.target.value)} className="mt-1 w-full rounded-xl border border-line p-2" /></label>
        <label className="block">Reason<input value={reason} maxLength={1000} disabled={saving} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full rounded-xl border border-line p-2" /></label>
        <Button variant="secondary" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save capacity'}</Button>
        <p className="text-xs text-slate">Larger increases may require a Platform Super Admin or Regional Operations Manager.</p>
      </div>}
    </>}
    {error && <p role="alert" className="text-bad">{error}</p>}
    <Button variant="text" disabled={loading || saving} onClick={() => setRevision((value) => value + 1)}>Refresh capacity</Button>
  </div>;
}
