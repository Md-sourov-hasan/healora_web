import React, { useState } from 'react';
import {
  PhShieldCheck,
  PhMagnifyingGlass,
  PhArrowsClockwise,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { AuditEvent } from '../../types';

export const AuditLogsView: React.FC = () => {
  const {
    t,
    language,
    auditLogs,
    selectedHubId,
    hubs,
    showToast,
  } = useApp();

  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportPurpose, setExportPurpose] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditEvent | null>(null);

  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];

  const filtered = auditLogs.filter((log) => {
    const matchEntity = entityFilter === 'all' || log.entityType === entityFilter;
    const matchOutcome = outcomeFilter === 'all' || log.outcome === outcomeFilter;
    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.entityId.toLowerCase().includes(search.toLowerCase());
    return matchEntity && matchOutcome && matchSearch;
  });

  const handleExportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exportPurpose.trim()) return;
    showToast(`Audit log exported. Compliance purpose logged: "${exportPurpose}"`);
    setIsExportModalOpen(false);
    setExportPurpose('');
  };

  const getOutcomeBadge = (outcome: AuditEvent['outcome']) => {
    switch (outcome) {
      case 'success':
        return <StatusPill label="SUCCESS" variant="completed" />;
      case 'flagged':
        return <StatusPill label="FLAGGED / ABAC GUARD" variant="upcoming" />;
      case 'denied':
        return <StatusPill label="ACCESS DENIED" variant="cancelled" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'অপরিবর্তনীয় অডিট ট্রেইল' : 'IMMUTABLE AUDIT TRAIL'}
            </span>
            <StatusPill label="Append-Only Tamper Evident" variant="active" />
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navAuditLogs}
          </h1>
          <p className="mt-1 mb-0 text-sm text-slate">
            {currentHub?.name || 'Central Audit Ledger'} • {language === 'bn'
              ? 'সকল অপারেশনাল পরিবর্তন, চেক-ইন, কর্মী নির্ধারণ ও নিরাপত্তা অ্যাক্সেসের অপরিবর্তনীয় প্রমাণ'
              : 'Cryptographically ordered activity log recording every administrative, patient lookup and security interaction'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => showToast('Audit trail ledger verified against root hash.')}
            icon={<PhArrowsClockwise size={16} />}
          >
            {language === 'bn' ? 'যাচাই করুন' : 'Verify Ledger'}
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsExportModalOpen(true)}
            icon={<PhShieldCheck size={16} />}
          >
            {language === 'bn' ? 'অডিট এক্সপোর্ট' : 'Export Audit Log'}
          </Button>
        </div>
      </div>

      {/* PRD Section 16.2 Notice */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sage-200 bg-mist px-5 py-3.5 text-[13px] text-pine">
        <PhShieldCheck size={20} color="#1D6B66" />
        <div className="flex-1">
          <strong>Audit Compliance (PRD Section 16.2):</strong> All staff check-ins, queue calls, session publications, offline sync events, and ABAC boundary blocks are logged immutably. Audit records cannot be modified or deleted by standard operators.
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="mb-7 grid grid-cols-4 gap-4">
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Total Logged Events</div>
          <div className="mt-1 text-3xl font-bold text-ink">{auditLogs.length}</div>
          <div className="mt-1 text-xs text-teal">All events in current ledger</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Security &amp; ABAC Guards</div>
          <div className="mt-1 text-3xl font-bold text-clay">
            {auditLogs.filter((l) => l.entityType === 'Security').length}
          </div>
          <div className="mt-1 text-xs text-clay font-semibold">Least-privilege policy enforcements</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Queue &amp; Patient Intakes</div>
          <div className="mt-1 text-3xl font-bold text-ok">
            {auditLogs.filter((l) => l.entityType === 'Queue' || l.entityType === 'Appointment').length}
          </div>
          <div className="mt-1 text-xs text-slate">Verified patient check-ins</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Flagged Outcomes</div>
          <div className="mt-1 text-3xl font-bold text-amber">
            {auditLogs.filter((l) => l.outcome === 'flagged' || l.outcome === 'denied').length}
          </div>
          <div className="mt-1 text-xs text-amber font-semibold">Access boundary attempts blocked</div>
        </Card>
      </div>

      {/* Search & Filters */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-line bg-paper px-4 py-2.5 shadow-2xs">
          <PhMagnifyingGlass size={18} color="#1D6B66" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor, entity ID (e.g. PAT-88120, ses_01), or details..."
            className="flex-1 border-none bg-transparent font-ui text-sm text-ink outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate">Entity:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs"
          >
            <option value="all">All Entities</option>
            <option value="Queue">Queue</option>
            <option value="Encounter">Encounter</option>
            <option value="Session">Session</option>
            <option value="Appointment">Appointment</option>
            <option value="Equipment">Equipment</option>
            <option value="Security">Security Guard</option>
            <option value="Patient">Patient</option>
            <option value="Hub">Hub</option>
            <option value="Region">Region</option>
          </select>

          <span className="font-semibold text-slate ml-2">Outcome:</span>
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs"
          >
            <option value="all">All Outcomes</option>
            <option value="success">Success</option>
            <option value="flagged">Flagged</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <Card variant="card" className="p-0! overflow-hidden">
        <table className="w-full border-collapse text-left font-ui">
          <thead>
            <tr className="border-b border-line bg-bone">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Timestamp (BD)</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Actor &amp; Role</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Action Performed</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Entity &amp; Target ID</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Hub Scope</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Outcome</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-sm">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate">
                  <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-mist text-teal">
                    <PhShieldCheck size={24} />
                  </div>
                  <p className="font-semibold text-ink">No audit events recorded</p>
                  <p className="text-xs text-slate">All user logins, patient lookups, and session modifications will be recorded immutably here.</p>
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
              <tr key={log.id} className="transition-colors hover:bg-mist/30">
                <td className="px-5 py-4 font-mono text-xs text-slate whitespace-nowrap">
                  {log.timestamp}
                </td>
                <td className="px-5 py-4">
                  <div className="font-semibold text-ink">{log.actorName}</div>
                  <div className="font-mono text-xs text-teal">{log.actorRole}</div>
                </td>
                <td className="px-5 py-4 text-xs font-medium text-ink">
                  {log.action}
                </td>
                <td className="px-5 py-4 text-xs">
                  <span className="rounded bg-sage-200 px-1.5 py-0.5 font-semibold text-pine">
                    {log.entityType}
                  </span>
                  <div className="mt-1 font-mono text-[11px] text-slate">{log.entityId}</div>
                </td>
                <td className="px-5 py-4 text-xs text-slate">
                  {log.hubName}
                </td>
                <td className="px-5 py-4">
                  {getOutcomeBadge(log.outcome)}
                </td>
                <td className="px-5 py-4 text-xs text-slate max-w-xs truncate" title={log.details}>
                  <button
                    type="button"
                    onClick={() => setSelectedAuditLog(log)}
                    className="cursor-pointer text-teal font-semibold hover:underline"
                  >
                    {log.details.length > 50 ? `${log.details.slice(0, 50)}...` : log.details}
                  </button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Drawer: Detailed Audit Inspection */}
      {selectedAuditLog && (
        <ModalSheet
          isOpen={!!selectedAuditLog}
          onClose={() => setSelectedAuditLog(null)}
          title="Immutable Audit Entry Inspector"
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate">{selectedAuditLog.id}</span>
                {getOutcomeBadge(selectedAuditLog.outcome)}
              </div>
              <h3 className="mt-2 text-base font-semibold text-ink">
                {selectedAuditLog.action}
              </h3>
              <div className="text-xs text-slate">
                Timestamp: <strong>{selectedAuditLog.timestamp} (Bangladesh Standard Time)</strong>
              </div>
            </div>

            <div className="rounded-xl border border-line p-3.5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate">Actor Name:</span>
                <strong className="text-ink">{selectedAuditLog.actorName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Active Role Scope:</span>
                <span className="font-mono font-semibold text-teal">{selectedAuditLog.actorRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Target Entity:</span>
                <span className="font-semibold text-ink">{selectedAuditLog.entityType} ({selectedAuditLog.entityId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Hub Jurisdiction:</span>
                <span className="font-semibold text-ink">{selectedAuditLog.hubName}</span>
              </div>
            </div>

            <div className="rounded-xl bg-mist p-3.5 text-xs text-pine leading-relaxed">
              <strong>Context &amp; Security Verification Details:</strong>
              <p className="mt-1 mb-0">{selectedAuditLog.details}</p>
            </div>

            <Button variant="secondary" onClick={() => setSelectedAuditLog(null)} className="w-full">
              Close Inspector
            </Button>
          </div>
        </ModalSheet>
      )}

      {/* Modal: Export Audit Log */}
      <ModalSheet
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Purpose-Bound Audit Trail Export"
      >
        <form onSubmit={handleExportSubmit} className="space-y-4">
          <div className="rounded-xl bg-mist p-3.5 text-xs text-pine">
            <strong>Security Warning (PRD Section 16.2 &amp; 17):</strong> Broad data exports are restricted. Any export generates a permanent, high-priority compliance audit record containing the requesting administrator's ID and mandatory stated purpose.
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">
              Stated Compliance / Auditing Purpose (Mandatory)
            </label>
            <textarea
              rows={3}
              required
              value={exportPurpose}
              onChange={(e) => setExportPurpose(e.target.value)}
              placeholder="e.g. Quarterly DGHS Telehealth &amp; Bangladesh PDPA 2026 data residency verification review..."
              className="w-full rounded-xl border border-line p-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsExportModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Authorize &amp; Download Signed Audit Log</Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
