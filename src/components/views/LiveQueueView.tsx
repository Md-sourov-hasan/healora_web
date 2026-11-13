import React, { useState, useEffect, useCallback } from 'react';
import {
  PhArrowsClockwise,
  PhCaretRight,
  PhDesktop,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { SegmentedTabs } from '../common/Tabs';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
import type { QueueItem } from '../../types';
import { queueService, type QueueHistoryEvent } from '../../services/queueService';
import { catalogService, type ApiQueuePriorityPolicy } from '../../services/catalogService';

const DELAY_REASONS = [
  { value: '', label: 'Clear Delay (None)' },
  { value: 'station_unavailable', label: 'Station Unavailable' },
  { value: 'staff_unavailable', label: 'Staff Unavailable' },
  { value: 'sync_pending', label: 'Sync Pending' },
  { value: 'equipment_issue', label: 'Equipment Issue' },
  { value: 'high_volume', label: 'High Volume' },
  { value: 'other', label: 'Other Operational Delay' },
];

export const LiveQueueView: React.FC = () => {
  const {
    t,
    language,
    selectedHubId,
    sessions,
    queue,
    stations,
    callNextPatient,
    advanceQueueStatus,
    transferStation,
    refreshBackendData,
    showToast,
  } = useApp();

  const [activeStationFilter, setActiveStationFilter] = useState<string>('all');
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);
  const [ticketHistory, setTicketHistory] = useState<QueueHistoryEvent[]>([]);
  const [priorityPolicies, setPriorityPolicies] = useState<ApiQueuePriorityPolicy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [pauseReason, setPauseReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [reopenReason, setReopenReason] = useState('');

  // Public TV Display Board state
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [boardSessionId, setBoardSessionId] = useState('');
  const [boardData, setBoardData] = useState<{
    nowServing?: Array<{ ticket?: string; displayCode?: string; station?: string }>;
    waiting?: Array<{ ticket?: string; displayCode?: string; estimatedMinutes?: number }>;
  } | null>(null);

  const hubQueue = queue.filter((q) => q.hubId === selectedHubId);
  const hubStations = stations.filter((s) => s.hubId === selectedHubId);
  const hubSessions = sessions.filter((s) => s.hubId === selectedHubId);

  useEffect(() => {
    catalogService
      .getQueuePriorityPolicies(false)
      .then((res) => {
        setPriorityPolicies(res.items || []);
        if (res.items?.[0]) setSelectedPolicyId(res.items[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!boardSessionId && hubSessions.length > 0) {
      const inProg = hubSessions.find((s) => s.status === 'in_progress') || hubSessions[0];
      setBoardSessionId(inProg.id);
    }
  }, [hubSessions, boardSessionId]);

  const loadBoard = useCallback(async (sid: string) => {
    if (!sid) return;
    try {
      const res = await queueService.getDisplayBoard(sid);
      setBoardData(res);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Could not load display board');
    }
  }, [showToast]);

  useEffect(() => {
    if (isBoardOpen && boardSessionId) {
      void loadBoard(boardSessionId);
    }
  }, [isBoardOpen, boardSessionId, loadBoard]);

  const openTicketModal = async (item: QueueItem) => {
    setSelectedQueueItem(item);
    setTicketHistory([]);
    try {
      const hist = await queueService.getTicketHistory(item.id);
      setTicketHistory(hist);
    } catch {
      setTicketHistory([]);
    }
  };

  const handlePauseTicket = async () => {
    if (!selectedQueueItem) return;
    try {
      await queueService.pauseTicket(selectedQueueItem.id, pauseReason.trim() || undefined);
      showToast(`Ticket ${selectedQueueItem.ticketNumber} paused`);
      setPauseReason('');
      setSelectedQueueItem(null);
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to pause ticket');
    }
  };

  const handleResumeTicket = async () => {
    if (!selectedQueueItem) return;
    try {
      await queueService.resumeTicket(selectedQueueItem.id);
      showToast(`Ticket ${selectedQueueItem.ticketNumber} resumed`);
      setSelectedQueueItem(null);
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to resume ticket');
    }
  };

  const handleSetDelay = async () => {
    if (!selectedQueueItem) return;
    try {
      await queueService.delayTicket(selectedQueueItem.id, delayReason ? delayReason : null);
      showToast(delayReason ? 'Delay reason recorded' : 'Delay reason cleared');
      setSelectedQueueItem(null);
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update delay status');
    }
  };

  const handleApplyPriority = async () => {
    if (!selectedQueueItem || !selectedPolicyId) return;
    try {
      await queueService.setPriority(selectedQueueItem.id, selectedPolicyId);
      showToast('Ticket priority updated via governance policy');
      setSelectedQueueItem(null);
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to set priority');
    }
  };

  const handleCancelTicket = async () => {
    if (!selectedQueueItem || !cancelReason.trim()) {
      showToast('Enter a reason to cancel ticket');
      return;
    }
    try {
      await queueService.cancelTicket(selectedQueueItem.id, cancelReason.trim());
      showToast(`Ticket ${selectedQueueItem.ticketNumber} cancelled`);
      setCancelReason('');
      setSelectedQueueItem(null);
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel ticket');
    }
  };

  const handleReopenTicket = async () => {
    if (!selectedQueueItem || !reopenReason.trim()) {
      showToast('Enter a reason to reopen ticket');
      return;
    }
    try {
      await queueService.reopenTicket(selectedQueueItem.id, reopenReason.trim());
      showToast(`Ticket ${selectedQueueItem.ticketNumber} reopened`);
      setReopenReason('');
      setSelectedQueueItem(null);
      await refreshBackendData();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reopen ticket');
    }
  };

  const filteredQueue = activeStationFilter === 'all'
    ? hubQueue
    : hubQueue.filter((q) => q.stationId === activeStationFilter);

  const tabOptions = [
    { key: 'all', label: language === 'bn' ? 'সকল স্টেশন' : 'All Stations', count: hubQueue.length },
    ...hubStations.map((st) => ({
      key: st.id,
      label: st.name.split(':')[1] || st.name,
      count: hubQueue.filter((q) => q.stationId === st.id).length,
    })),
  ];

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'লাইভ অপারেশন' : 'REAL-TIME QUEUE DISPATCH'}
            </span>
            <span className="size-2 animate-pulse-live rounded-full bg-ok" />
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navQueue}
          </h1>
          <p className="mt-1 mb-0 text-sm text-slate">
            {t.leastPrivilegeNote}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsBoardOpen(true)}
            icon={<PhDesktop size={16} />}
          >
            {language === 'bn' ? 'টিভি ডিসপ্লে বোর্ড' : 'TV Display Board'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => void refreshBackendData()}
            icon={<PhArrowsClockwise size={16} />}
          >
            {language === 'bn' ? 'রিফ্রেশ' : 'Refresh Queue'}
          </Button>
        </div>
      </div>

      {/* Stations Status Row */}
      <div className="mb-7 grid grid-cols-4 gap-4">
        {hubStations.map((station) => {
          const waitingCount = hubQueue.filter((q) => q.stationId === station.id && q.currentStatus === 'waiting').length;

          return (
            <Card
              key={station.id}
              variant="card"
              className={`p-5! border-t-3! ${
                station.status === 'busy' ? 'border-t-teal!' : 'border-t-line!'
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <span className="text-xs font-semibold text-slate">
                  {station.name.split(':')[0]}
                </span>
                <StatusPill
                  label={station.status}
                  variant={station.status === 'busy' ? 'busy' : station.status === 'available' ? 'available' : 'draft'}
                />
              </div>

              <h3 className="mt-0 mb-1 text-[15px] font-semibold text-ink">
                {station.name.split(':')[1] || station.name}
              </h3>
              <div className="mb-3.5 text-xs text-slate">
                Staff: <strong className="text-ink">{station.currentStaffName || 'Not assigned'}</strong>
              </div>

              <div className="flex items-center justify-between border-t border-line pt-3">
                <div className="text-[13px] text-slate">
                  <div>
                    Serving: <strong className="text-ink">{station.currentTicketNumber || '—'}</strong>
                  </div>
                  <div className="text-[11px] font-semibold text-teal">
                    Queue: {waitingCount} waiting
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void callNextPatient(station.id)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-pill border-none bg-ink px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-ink-hover active:scale-[0.985]"
                >
                  <span>{t.callNext}</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div className="mb-5">
        <SegmentedTabs
          options={tabOptions}
          activeKey={activeStationFilter}
          onChange={(key) => setActiveStationFilter(key)}
        />
      </div>

      {/* Queue Table */}
      <Card variant="card" className="p-0! overflow-hidden">
        <table className="w-full border-collapse text-left font-ui">
          <thead>
            <tr className="border-b border-line bg-bone">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                {t.tokenNumber}
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                {t.patientName}
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                {t.station}
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                Service Type
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                Wait Time
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                Queue Status
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase text-slate">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate">
                  {language === 'bn'
                    ? 'কিউতে কোনো রোগী অপেক্ষমাণ নেই। চেক-ইন বা ওয়াক-ইন সম্পন্ন হলে এখানে লাইভ সিরিয়াল প্রদর্শিত হবে।'
                    : 'Live queue is currently empty. Patients will appear here in real-time as they check in at reception.'}
                </td>
              </tr>
            ) : (
              filteredQueue.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-line transition-colors duration-100 last:border-b-0 hover:bg-bone"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums rounded-pill bg-ink px-2.5 py-1 text-[13px] font-bold text-white">
                        {item.ticketNumber}
                      </span>
                      {item.priority === 'priority_elderly' && (
                        <span className="rounded-md bg-warn-bg px-1.5 py-0.5 text-[10px] font-bold text-warn-fg">
                          Priority
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-[15px] font-semibold text-ink">
                      {language === 'bn' ? item.patientNameBn || item.patientName : item.patientName}
                    </div>
                    <div className="tabular-nums text-xs text-slate">
                      {item.patientPhone}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-ink">
                    <div className="font-medium">{item.stationName}</div>
                    <div className="text-xs text-slate">Staff: {item.assignedStaffName}</div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate">
                    {item.serviceType || '—'}
                  </td>

                  <td className="px-5 py-4 text-sm text-ink">
                    <div className="tabular-nums font-semibold">
                      {item.waitMinutes} mins
                    </div>
                    <div className="text-[11px] text-slate">
                      Arr: {item.arrivalTime}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <StatusPill
                      label={item.currentStatus.replace('_', ' ')}
                      variant={
                        item.currentStatus === 'in_service'
                          ? 'in_service'
                          : item.currentStatus === 'completed'
                          ? 'completed'
                          : item.currentStatus === 'awaiting_review' || item.currentStatus === 'paused'
                          ? 'awaiting'
                          : 'upcoming'
                      }
                    />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void openTicketModal(item)}
                        className="cursor-pointer rounded-pill border border-line bg-paper px-3.5 py-1.5 text-[13px] font-semibold text-teal transition hover:bg-mist"
                      >
                        {language === 'bn' ? 'স্টেশন বদল / অ্যাকশন' : 'Dispatch / Action'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Modal: Waiting Hall Public TV Display Board */}
      <ModalSheet
        isOpen={isBoardOpen}
        onClose={() => setIsBoardOpen(false)}
        title="Waiting Hall TV Display Board"
        subtitle="De-identified public token board (no patient names or clinical details)"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <select
              value={boardSessionId}
              onChange={(e) => setBoardSessionId(e.target.value)}
              className="h-10 flex-1 rounded-xl border border-line bg-white px-3 text-sm"
            >
              <option value="">Select session</option>
              {hubSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.date})
                </option>
              ))}
            </select>
            <Button variant="secondary" onClick={() => void loadBoard(boardSessionId)}>
              Refresh Board
            </Button>
          </div>

          <div className="rounded-2xl bg-ink p-5 text-white">
            <div className="mb-2 text-xs font-bold tracking-wider uppercase text-teal">NOW SERVING</div>
            {boardData?.nowServing && boardData.nowServing.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {boardData.nowServing.map((entry, idx) => (
                  <div key={idx} className="rounded-xl bg-white/10 p-3">
                    <div className="text-2xl font-bold text-white">{entry.ticket || entry.displayCode}</div>
                    <div className="text-xs text-white/80">Station: {entry.station || '—'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/70">No tickets currently being called/served.</div>
            )}

            <div className="mt-5 mb-2 text-xs font-bold tracking-wider uppercase text-white/70">UPCOMING IN QUEUE</div>
            {boardData?.waiting && boardData.waiting.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {boardData.waiting.map((w, idx) => (
                  <span key={idx} className="rounded-lg bg-white/15 px-3 py-1.5 font-mono text-sm font-semibold">
                    {w.ticket || w.displayCode} {w.estimatedMinutes !== undefined ? `(~${w.estimatedMinutes}m)` : ''}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-sm text-white/70">No waiting tickets.</div>
            )}
          </div>
        </div>
      </ModalSheet>

      {/* Action Sheet for Dispatching / Transferring / Full Lifecycle */}
      {selectedQueueItem && (
        <ModalSheet
          isOpen={!!selectedQueueItem}
          onClose={() => setSelectedQueueItem(null)}
          title={`Ticket ${selectedQueueItem.ticketNumber} Dispatch`}
          subtitle={`Patient: ${selectedQueueItem.patientName} (${selectedQueueItem.patientPhone})`}
        >
          <div className="flex flex-col gap-5">
            {/* Current Care Step Progress Bar */}
            <div className="rounded-2xl border border-line bg-bone p-4">
              <div className="mb-2 text-[13px] font-semibold text-slate">
                Encounter Progression:
              </div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-ink">
                <span>1. Intake</span>
                <span>2. Vitals &amp; Lab</span>
                <span>3. Dr. Review</span>
                <span>4. Complete</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-sage-200">
                <div
                  className="h-full bg-teal transition-[width] duration-300 ease-organic"
                  style={{ width: `${(selectedQueueItem.stepProgress / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Primary Status Transitions */}
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-slate">
                Queue Lifecycle Actions:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    void advanceQueueStatus(selectedQueueItem.id, 'in_service');
                    setSelectedQueueItem(null);
                  }}
                  className="cursor-pointer rounded-chip border border-teal bg-mist p-2.5 text-xs font-semibold text-pine"
                >
                  Start Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void advanceQueueStatus(selectedQueueItem.id, 'completed');
                    setSelectedQueueItem(null);
                  }}
                  className="cursor-pointer rounded-chip border border-ok bg-ok-bg p-2.5 text-xs font-semibold text-ok-fg"
                >
                  Complete Ticket
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void advanceQueueStatus(selectedQueueItem.id, 'no_show');
                    setSelectedQueueItem(null);
                  }}
                  className="cursor-pointer rounded-chip border border-line bg-paper p-2.5 text-xs font-semibold text-slate"
                >
                  Mark No-Show
                </button>
                {selectedQueueItem.currentStatus === 'paused' ? (
                  <button
                    type="button"
                    onClick={() => void handleResumeTicket()}
                    className="cursor-pointer rounded-chip border border-teal bg-mist p-2.5 text-xs font-semibold text-pine"
                  >
                    Resume Paused Ticket
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handlePauseTicket()}
                    className="cursor-pointer rounded-chip border border-warn bg-warn-bg p-2.5 text-xs font-semibold text-warn-fg"
                  >
                    Pause Ticket
                  </button>
                )}
              </div>
              {selectedQueueItem.currentStatus !== 'paused' && (
                <input
                  value={pauseReason}
                  onChange={(e) => setPauseReason(e.target.value)}
                  placeholder="Optional pause note (e.g. Resting 5m before repeat BP)..."
                  className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs"
                />
              )}
            </div>

            {/* Operational Delay Reason */}
            <div className="rounded-xl border border-line bg-canvas p-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate">
                Operational Delay Indicator
              </label>
              <div className="flex gap-2">
                <select
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                >
                  {DELAY_REASONS.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <Button variant="small" onClick={() => void handleSetDelay()}>
                  Apply Delay
                </Button>
              </div>
            </div>

            {/* Priority Policy Elevation */}
            <div className="rounded-xl border border-line bg-canvas p-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate">
                Elevate Priority (Approved Governance Policy)
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                >
                  <option value="">Select priority policy...</option>
                  {priorityPolicies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} (Level {p.priorityLevel}) - {p.description}
                    </option>
                  ))}
                </select>
                <Button variant="small" onClick={() => void handleApplyPriority()} disabled={!selectedPolicyId}>
                  Set Priority
                </Button>
              </div>
            </div>

            {/* Transfer to Another Station */}
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-slate">
                Transfer to Another Station:
              </label>
              <div className="flex flex-col gap-2">
                {hubStations.map((st) => {
                  const isCurrent = st.id === selectedQueueItem.stationId;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      disabled={isCurrent}
                      onClick={() => {
                        void transferStation(selectedQueueItem.id, st.id);
                        setSelectedQueueItem(null);
                      }}
                      className={`flex items-center justify-between rounded-xl border border-line px-4 py-2.5 text-xs font-medium transition ${
                        isCurrent
                          ? 'cursor-not-allowed bg-bone text-slate'
                          : 'cursor-pointer bg-paper text-ink hover:bg-mist'
                      }`}
                    >
                      <span>{st.name}</span>
                      <PhCaretRight size={14} color="#1D6B66" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cancel or Reopen Ticket */}
            <div className="grid grid-cols-1 gap-2 border-t border-line pt-3">
              {['completed', 'cancelled', 'no_show'].includes(selectedQueueItem.currentStatus) ? (
                <div className="flex gap-2">
                  <input
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.target.value)}
                    placeholder="Reason to reopen ticket..."
                    className="flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                  />
                  <Button variant="secondary" onClick={() => void handleReopenTicket()}>
                    Reopen Ticket
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Reason to cancel ticket..."
                    className="flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-xs"
                  />
                  <Button variant="secondary" onClick={() => void handleCancelTicket()}>
                    Cancel Ticket
                  </Button>
                </div>
              )}
            </div>

            {/* Ticket Audit History */}
            <div className="border-t border-line pt-3">
              <div className="mb-2 text-xs font-bold uppercase text-teal">
                Ticket Progression History ({ticketHistory.length})
              </div>
              {ticketHistory.length === 0 ? (
                <div className="text-xs text-slate">No history events recorded yet.</div>
              ) : (
                <div className="flex max-h-44 flex-col gap-1.5 overflow-y-auto">
                  {ticketHistory.map((ev) => (
                    <div key={ev.id} className="rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs">
                      <div className="flex justify-between font-semibold text-ink">
                        <span>{ev.action}</span>
                        <span className="font-mono text-[11px] text-slate">{ev.timestamp?.slice(11, 19)}</span>
                      </div>
                      <div className="text-[11px] text-slate">
                        {ev.fromStatus ? `${ev.fromStatus} → ${ev.toStatus}` : ev.toStatus || ''}
                        {ev.stationName ? ` • Station: ${ev.stationName}` : ''}
                        {ev.staffName ? ` • By: ${ev.staffName}` : ''}
                        {ev.notes ? ` • Note: ${ev.notes}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
