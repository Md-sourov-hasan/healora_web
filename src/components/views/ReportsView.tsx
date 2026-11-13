import React, { useEffect, useState } from 'react';
import { PhChartBar } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/useApp';
import { reportsAuditService } from '../../services/reportsAuditService';

type ReportCatalogue = { reports: string[]; maxRangeDays: number; note: string };

export const ReportsView: React.FC = () => {
  const { t, language, selectedHubId, hubs, showToast } = useApp();
  const currentHub = hubs.find((hub) => hub.id === selectedHubId);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const monthStart = today.slice(0, 8) + '01';
  const [catalogue, setCatalogue] = useState<ReportCatalogue | null>(null);
  const [reportCode, setReportCode] = useState('');
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [purpose, setPurpose] = useState('');
  const [reportResult, setReportResult] = useState<unknown>(null);
  const [exportStatus, setExportStatus] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    reportsAuditService.getReports().then((response) => {
      setCatalogue(response);
      setReportCode(response.reports[0] ?? '');
    }).catch((error) => showToast(error instanceof Error ? error.message : 'Report catalogue unavailable.'));
  }, []);

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
        patientLevel: false,
      });
      setExportStatus(response.status);
      showToast('Export request status: ' + response.status);
      if (response.status === 'generated') {
        const blob = await reportsAuditService.downloadExport(response.id);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'healora-' + reportCode + '-' + from + '-' + to + '.csv';
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Export request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">
            {language === 'bn' ? 'রিপোর্ট ও পরিমাপ' : 'Operational reports'}
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navReports}</h1>
          <p className="mt-1 text-sm text-slate">{currentHub?.name ?? 'API scoped report access'}</p>
        </div>
        <Button variant="secondary" onClick={runReport} disabled={loading || !reportCode} icon={<PhChartBar size={16} />}>
          {loading ? 'Loading…' : 'Run report'}
        </Button>
      </div>

      <Card variant="card" className="mb-6">
        <div className="grid grid-cols-4 items-end gap-4">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
            Report
            <select value={reportCode} onChange={(event) => setReportCode(event.target.value)} className="h-11 rounded-xl border border-line bg-paper px-3 text-sm font-normal">
              {(catalogue?.reports ?? []).map((code) => <option key={code} value={code}>{code.replaceAll('_', ' ')}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate">From<input type="date" value={from} onChange={(event) => setFrom(event.target.value)} className="h-11 rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate">To<input type="date" value={to} onChange={(event) => setTo(event.target.value)} className="h-11 rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate">
            Export purpose
            <input value={purpose} onChange={(event) => setPurpose(event.target.value)} placeholder="Required for export" className="h-11 rounded-xl border border-line px-3 text-sm font-normal" />
          </label>
        </div>
        {catalogue && <p className="mb-0 mt-3 text-xs text-slate">{catalogue.note} Maximum range: {catalogue.maxRangeDays} days.</p>}
        <div className="mt-4 flex items-center gap-3">
          <Button variant="primary" onClick={requestExport} disabled={loading || !purpose.trim() || !reportCode}>Request CSV export</Button>
          {exportStatus && <span className="text-sm text-slate">Latest export: {exportStatus}</span>}
        </div>
      </Card>

      <Card variant="card">
        <h2 className="mb-3 mt-0 text-base font-semibold text-ink">API report result</h2>
        {reportResult === null ? (
          <p className="mb-0 text-sm text-slate">Choose a report and date range, then run it to load backend results.</p>
        ) : (
          <pre className="max-h-[65vh] overflow-auto whitespace-pre-wrap rounded-xl bg-bone p-4 text-xs text-ink">{JSON.stringify(reportResult, null, 2)}</pre>
        )}
      </Card>
    </div>
  );
};
