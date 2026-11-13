import React, { useMemo, useState } from 'react';
import { PhShieldCheck, PhArrowsClockwise } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { useApp } from '../../context/useApp';

export const AuditLogsView: React.FC = () => {
  const { t, auditLogs, selectedHubId, hubs, refreshBackendData } = useApp();
  const [search, setSearch] = useState('');
  const currentHub = hubs.find((hub) => hub.id === selectedHubId);
  const filtered = useMemo(() => auditLogs.filter((event) => {
    const text = [event.action, event.actorName, event.actorRole, event.entityId, event.details].join(' ').toLowerCase();
    return text.includes(search.toLowerCase());
  }), [auditLogs, search]);

  const downloadCsv = () => {
    const quote = (value: string) => '"' + value.replaceAll('"', '""') + '"';
    const rows = [
      ['timestamp', 'actor', 'role', 'action', 'entity', 'entity_id', 'outcome', 'details'],
      ...filtered.map((event) => [event.timestamp, event.actorName, event.actorRole, event.action, event.entityType, event.entityId, event.outcome, event.details]),
    ];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(quote).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'healora-audit-api-rows.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const outcomeVariant = (outcome: string) => outcome === 'success' ? 'completed' : outcome === 'denied' ? 'cancelled' : 'upcoming';

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.04em] text-teal"><PhShieldCheck size={16} />Backend audit events</div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navAuditLogs}</h1>
          <p className="mt-1 text-sm text-slate">{currentHub?.name ?? 'Audit events visible to this account'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void refreshBackendData()} icon={<PhArrowsClockwise size={16} />}>Refresh API data</Button>
          <Button variant="primary" onClick={downloadCsv}>Download loaded rows</Button>
        </div>
      </div>

      <Card variant="card" className="mb-5">
        <div className="flex items-center justify-between gap-4">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter loaded API events" className="h-11 flex-1 rounded-xl border border-line px-3 text-sm" />
          <div className="text-xs text-slate">Showing {filtered.length} of {auditLogs.length} API rows loaded</div>
        </div>
      </Card>

      <Card variant="card" className="p-0! overflow-hidden">
        {filtered.length === 0 ? <p className="m-0 p-6 text-sm text-slate">No audit events were returned for this account.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead><tr className="border-b border-line bg-bone text-xs uppercase text-slate"><th className="px-4 py-3">Time</th><th className="px-4 py-3">Actor</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">Target</th><th className="px-4 py-3">Outcome</th><th className="px-4 py-3">Details</th></tr></thead>
              <tbody>{filtered.map((event) => <tr key={event.id} className="border-b border-line text-sm">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-slate">{event.timestamp}</td>
                <td className="px-4 py-3">{event.actorName || '—'}<div className="text-xs text-slate">{event.actorRole}</div></td>
                <td className="px-4 py-3 font-medium">{event.action}</td>
                <td className="px-4 py-3">{event.entityType}<div className="font-mono text-xs text-slate">{event.entityId}</div></td>
                <td className="px-4 py-3"><StatusPill label={event.outcome.toUpperCase()} variant={outcomeVariant(event.outcome)} /></td>
                <td className="max-w-md px-4 py-3 text-xs text-slate">{event.details}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
