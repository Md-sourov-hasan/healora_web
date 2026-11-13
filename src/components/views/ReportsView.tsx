import React, { useEffect, useState, useCallback } from 'react';
import { PhChartBar, PhArrowsClockwise } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { SegmentedTabs } from '../common/Tabs';
import { useApp } from '../../context/useApp';
import { reportsAuditService, type ApiDataExport } from '../../services/reportsAuditService';

type ReportCatalogue = { reports: string[]; maxRangeDays: number; note: string };

export const ReportsView: React.FC = () => {
  const { t, language, selectedHubId, hubs, showToast } = useApp();
  const currentHub = hubs.find((hub) => hub.id === selectedHubId);
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const monthStart = today.slice(0, 8) + '01';

  const [activeTab, setActiveTab] = useState<'reports' | 'exports'>('reports');
  const [catalogue, setCatalogue] = useState<ReportCatalogue | null>(null);
  const [reportCode, setReportCode] = useState('');
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [purpose, setPurpose] = useState('');
  const [patientLevel, setPatientLevel] = useState(false);
  const [reportResult, setReportResult] = useState<unknown>(null);
  const [exportStatus, setExportStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Exports governance state
  const [exportsList, setExportsList] = useState<ApiDataExport[]>([]);
  const [exportFilterStatus, setExportFilterStatus] = useState<string>('');
  const [rejectReason, setRejectReason] = useState('');
  const [loadingExports, setLoadingExports] = useState(false);

  useEffect(() => {
    reportsAuditService
      .getReports()
      .then((response) => {
        setCatalogue(response);
        setReportCode(response.reports[0] ?? '');
      })
      .catch((error) =>
        showToast(error instanceof Error ? error.message : 'Report catalogue unavailable.')
      );
  }, [showToast]);

  const loadExports = useCallback(async () => {
    setLoadingExports(true);
    try {
      const list = await reportsAuditService.getExports({
        status: (exportFilterStatus || undefined) as ApiDataExport['status'] | undefined,
        limit: 50,
      });
      setExportsList(list);
    } catch {
      setExportsList([]);
    } finally {
      setLoadingExports(false);
    }
  }, [exportFilterStatus]);

  useEffect(() => {
    if (activeTab === 'exports') {
      void loadExports();
    }
  }, [activeTab, loadExports]);

  const runReport = async () => {
    if (!reportCode || !from || !to) return;
    setLoading(true);
    try {
      const response = await reportsAuditService.getReportData(reportCode, {
        from,
        to,
        ...(selectedHubId ? { hubId: selectedHubId } : {}),
      });
      setReportResult(response);
    } catch (error) {
      setReportResult(null);
      showToast(error instanceof Error ? error.message : 'Report request failed.');
    } finally {
      setLoading(false);
    }
  };

  const downloadExportFile = async (exp: ApiDataExport) => {
    try {
      const blob = await reportsAuditService.downloadExport(exp.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `healora-${exp.reportCode}-${exp.id.slice(0, 8)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not download export.');
    }
  };

  const requestExport = async () => {
    if (!reportCode || !purpose.trim()) return;
    setLoading(true);
    try {
      const response = await reportsAuditService.requestExport({
        reportCode,
        from,
        to,
        hubId: selectedHubId || undefined,
        purpose: purpose.trim(),
        patientLevel,
      });
      setExportStatus(response.status);
      showToast('Export request status: ' + response.status);
      if (response.status === 'generated') {
        await downloadExportFile(response);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Export request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExport = async (id: string) => {
    try {
      await reportsAuditService.approveExport(id);
      showToast('Export request approved and generated.');
      await loadExports();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to approve export.');
    }
  };

  const handleRejectExport = async (id: string) => {
    try {
      await reportsAuditService.rejectExport(id, rejectReason.trim() || 'Rejected by data governance');
      showToast('Export request rejected.');
      await loadExports();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reject export.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">
            {language === 'bn' ? 'রিপোর্ট ও পরিমাপ' : 'Operational reports & export governance'}
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navReports}</h1>
          <p className="mt-1 text-sm text-slate">{currentHub?.name ?? 'API scoped report access'}</p>
        </div>
        {activeTab === 'reports' ? (
          <Button
            variant="secondary"
            onClick={runReport}
            disabled={loading || !reportCode}
            icon={<PhChartBar size={16} />}
          >
            {loading ? 'Loading…' : 'Run report'}
          </Button>
        ) : (
          <Button
            variant="secondary"
            onClick={() => void loadExports()}
            icon={<PhArrowsClockwise size={16} />}
          >
            Refresh Exports
          </Button>
        )}
      </div>

      <div className="mb-6">
        <SegmentedTabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as 'reports' | 'exports')}
          options={[
            { key: 'reports', label: 'Run Operational Reports' },
            { key: 'exports', label: 'Data Export Governance (/exports)', count: exportsList.length },
          ]}
        />
      </div>

      {activeTab === 'reports' ? (
        <>
          <Card variant="card" className="mb-6">
            <div className="grid grid-cols-4 items-end gap-4">
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
                Report
                <select
                  value={reportCode}
                  onChange={(event) => setReportCode(event.target.value)}
                  className="h-11 rounded-xl border border-line bg-paper px-3 text-sm font-normal"
                >
                  {(catalogue?.reports ?? []).map((code) => (
                    <option key={code} value={code}>
                      {code.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
                From
                <input
                  type="date"
                  value={from}
                  onChange={(event) => setFrom(event.target.value)}
                  className="h-11 rounded-xl border border-line px-3 text-sm font-normal"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
                To
                <input
                  type="date"
                  value={to}
                  onChange={(event) => setTo(event.target.value)}
                  className="h-11 rounded-xl border border-line px-3 text-sm font-normal"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
                Export purpose
                <input
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value)}
                  placeholder="Required for export (min 10 chars)"
                  className="h-11 rounded-xl border border-line px-3 text-sm font-normal"
                />
              </label>
            </div>
            {catalogue && (
              <p className="mb-0 mt-3 text-xs text-slate">
                {catalogue.note} Maximum range: {catalogue.maxRangeDays} days.
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-slate">
                <input
                  type="checkbox"
                  checked={patientLevel}
                  onChange={(e) => setPatientLevel(e.target.checked)}
                />
                Request patient-level export (requires governance approval before download)
              </label>
              <div className="flex items-center gap-3">
                {exportStatus && <span className="text-sm text-slate">Latest export: {exportStatus}</span>}
                <Button
                  variant="primary"
                  onClick={requestExport}
                  disabled={loading || !purpose.trim() || !reportCode}
                >
                  Request CSV export
                </Button>
              </div>
            </div>
          </Card>

          <Card variant="card">
            <h2 className="mb-3 mt-0 text-base font-semibold text-ink">API report result</h2>
            {reportResult === null ? (
              <p className="mb-0 text-sm text-slate">
                Choose a report and date range, then run it to load backend results.
              </p>
            ) : (
              <pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap rounded-xl bg-bone p-4 text-xs text-ink">
                {JSON.stringify(reportResult, null, 2)}
              </pre>
            )}
          </Card>
        </>
      ) : (
        <div className="space-y-4">
          <Card variant="card" className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate">Filter Status:</span>
                <select
                  value={exportFilterStatus}
                  onChange={(e) => setExportFilterStatus(e.target.value)}
                  className="h-9 rounded-lg border border-line bg-paper px-2.5 text-xs"
                >
                  <option value="">All Statuses</option>
                  <option value="requested">Requested (Pending Approval)</option>
                  <option value="generated">Generated</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason (when rejecting)..."
                  className="h-9 rounded-lg border border-line px-2.5 text-xs"
                />
              </div>
            </div>
          </Card>

          <Card variant="card" className="p-0! overflow-hidden">
            {loadingExports ? (
              <p className="m-0 p-6 text-sm text-slate">Loading export requests...</p>
            ) : exportsList.length === 0 ? (
              <p className="m-0 p-6 text-sm text-slate">No data export requests found.</p>
            ) : (
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-line bg-bone uppercase text-slate">
                    <th className="px-4 py-3">Report Code</th>
                    <th className="px-4 py-3">Date Range</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Patient Level</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {exportsList.map((exp) => (
                    <tr key={exp.id}>
                      <td className="px-4 py-3 font-mono font-semibold text-ink">{exp.reportCode}</td>
                      <td className="px-4 py-3 text-slate">
                        {exp.dateFrom || '—'} → {exp.dateTo || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate">{exp.purpose}</td>
                      <td className="px-4 py-3">{exp.patientLevel ? 'Yes (PHI)' : 'Aggregated'}</td>
                      <td className="px-4 py-3">
                        <StatusPill
                          label={exp.status.toUpperCase()}
                          variant={
                            exp.status === 'generated'
                              ? 'completed'
                              : exp.status === 'rejected'
                                ? 'cancelled'
                                : 'upcoming'
                          }
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {exp.status === 'requested' && (
                            <>
                              <button
                                type="button"
                                onClick={() => void handleApproveExport(exp.id)}
                                className="cursor-pointer rounded bg-teal px-2.5 py-1 text-[11px] font-semibold text-white"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleRejectExport(exp.id)}
                                className="cursor-pointer rounded border border-bad/40 px-2.5 py-1 text-[11px] font-semibold text-bad"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {exp.status === 'generated' && (
                            <Button variant="small" onClick={() => void downloadExportFile(exp)}>
                              Download CSV
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};
