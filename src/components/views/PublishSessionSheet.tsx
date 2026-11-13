import { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
import { ApiError } from '../../services/apiClient';
import { sessionsService, type SessionReadiness } from '../../services/sessionsService';
import type { HubSession } from '../../types';

export function PublishSessionSheet({ session, onClose }: { session: HubSession; onClose: () => void }) {
  const { availableRoles, refreshBackendData, showToast } = useApp();
  const [readiness, setReadiness] = useState<SessionReadiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [override, setOverride] = useState(false);
  const [reason, setReason] = useState('');
  const [revision, setRevision] = useState(0);
  const canOverride = availableRoles.some((role) => role === 'platform_super_admin' || role === 'regional_ops_manager');
  const blockedHub = readiness?.unmet.some((item) => item.kind === 'hub' || item.code === 'hub_closure');
  const canPublish = readiness && !loading && !publishing && (readiness.ready || (canOverride && !blockedHub && override && reason.trim().length >= 3));

  useEffect(() => {
    let current = true;
    setLoading(true);
    setError('');
    setReadiness(null);
    sessionsService.checkReadiness(session.id).then((result) => {
      if (current) setReadiness(result);
    }).catch((failure) => {
      if (current) setError(failure instanceof Error ? failure.message : 'Could not load session readiness.');
    }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [session.id, revision]);

  const publish = async () => {
    if (!canPublish) return;
    setPublishing(true);
    setError('');
    try {
      const result = await sessionsService.publish(session.id, !readiness.ready && override ? reason.trim() : undefined);
      if (result.status !== 'published') throw new Error('The backend did not confirm the session as published.');
      await refreshBackendData();
      showToast('Session published. Use Start Session when you are ready to receive walk-ins.');
      onClose();
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : 'Session publish failed.';
      setError(failure instanceof ApiError ? `${failure.code}: ${message}` : message);
      // Re-read real blockers if readiness changed while the form was open.
      try { setReadiness(await sessionsService.checkReadiness(session.id)); } catch { /* Keep the publish error visible. */ }
    } finally { setPublishing(false); }
  };

  return <ModalSheet isOpen onClose={() => !publishing && onClose()} title="Publish session" subtitle={session.title}>
    <div className="space-y-4">
      <p className="text-sm text-slate">Publishing checks the hub, approved service, staff roster, stations and equipment assigned to this session.</p>
      {loading && <p role="status">Checking session readiness…</p>}
      {error && <p role="alert" className="rounded-xl bg-bad-bg p-3 text-sm text-bad-fg">{error}</p>}
      {readiness && <>
        <p className={`rounded-xl p-3 text-sm font-semibold ${readiness.ready ? 'bg-ok-bg text-ok-fg' : 'bg-warn-bg text-warn-fg'}`}>{readiness.ready ? 'All required checks passed.' : 'These requirements are preventing normal publication:'}</p>
        <ul className="space-y-3 pl-5 text-sm">
          {readiness.unmet.map((item, index) => <li key={`${item.kind}-${item.code}-${index}`}>
            <div className="font-semibold text-ink">{item.detail}</div>
            <div className="text-xs text-slate">{item.code}{item.required !== undefined ? ` — required: ${item.required}, available: ${item.available ?? 'not reported'}` : ''}</div>
          </li>)}
        </ul>
        {readiness.warnings.length > 0 && <div className="rounded-xl bg-bone p-3 text-sm"><strong>Warnings</strong><ul className="list-disc pl-5">{readiness.warnings.map((item, index) => <li key={`${item.code}-${index}`}>{item.detail}</li>)}</ul></div>}
        {blockedHub && <p className="text-sm text-bad">Activate the hub or resolve its closure before publishing. The backend does not allow overriding this restriction.</p>}
        {!readiness.ready && !blockedHub && canOverride && <div className="space-y-3 rounded-xl border border-line p-3">
          <label className="flex gap-2 text-sm"><input type="checkbox" checked={override} onChange={(event) => setOverride(event.target.checked)} disabled={publishing} />Use an administrative readiness override</label>
          {override && <label className="block text-sm">Reason (recorded in the audit log)<textarea value={reason} onChange={(event) => setReason(event.target.value)} minLength={3} maxLength={1000} disabled={publishing} className="mt-2 w-full rounded-xl border border-line p-3" /></label>}
        </div>}
      </>}
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary" disabled={loading || publishing} onClick={() => setRevision((value) => value + 1)}>Recheck readiness</Button>
        <Button variant="primary" disabled={!canPublish} onClick={publish}>{publishing ? 'Publishing…' : override && !readiness?.ready ? 'Publish with override' : 'Publish session'}</Button>
      </div>
    </div>
  </ModalSheet>;
}
