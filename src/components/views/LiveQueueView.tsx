import React, { useState } from 'react';
import {
  PhArrowsClockwise,
  PhCaretRight,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { SegmentedTabs } from '../common/Tabs';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
import type { QueueItem } from '../../types';

export const LiveQueueView: React.FC = () => {
  const {
    t,
    language,
    selectedHubId,
    queue,
    stations,
    callNextPatient,
    advanceQueueStatus,
    transferStation,
    showToast,
  } = useApp();

  const [activeStationFilter, setActiveStationFilter] = useState<string>('all');
  const [selectedQueueItem, setSelectedQueueItem] = useState<QueueItem | null>(null);

  const hubQueue = queue.filter((q) => q.hubId === selectedHubId);
  const hubStations = stations.filter((s) => s.hubId === selectedHubId);

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
            onClick={() => showToast('Refreshed real-time queue states from central broker.')}
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
                Staff: <strong className="text-ink">{station.currentStaffName}</strong>
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
                  onClick={() => callNextPatient(station.id)}
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
            {filteredQueue.map((item) => (
              <tr
                key={item.id}
                className="border-b border-line transition-colors duration-100 last:border-b-0 hover:bg-bone"
              >
                {/* Token */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="tabular-nums rounded-pill bg-ink px-2.5 py-1 text-[13px] font-bold text-white">
                      {item.ticketNumber}
                    </span>
                    {item.priority === 'priority_elderly' && (
                      <span className="rounded-md bg-warn-bg px-1.5 py-0.5 text-[10px] font-bold text-warn-fg">
                        Elderly Priority
                      </span>
                    )}
                  </div>
                </td>

                {/* Patient Name & Phone (Operational Least-Privilege) */}
                <td className="px-5 py-4">
                  <div className="text-[15px] font-semibold text-ink">
                    {language === 'bn' ? item.patientNameBn : item.patientName}
                  </div>
                  <div className="tabular-nums text-xs text-slate">
                    {item.patientPhone}
                  </div>
                </td>

                {/* Station */}
                <td className="px-5 py-4 text-sm text-ink">
                  <div className="font-medium">{item.stationName}</div>
                  <div className="text-xs text-slate">Staff: {item.assignedStaffName}</div>
                </td>

                {/* Service Type */}
                <td className="px-5 py-4 text-sm text-slate">
                  {item.serviceType}
                </td>

                {/* Wait Time */}
                <td className="px-5 py-4 text-sm text-ink">
                  <div className="tabular-nums font-semibold">
                    {item.waitMinutes} mins
                  </div>
                  <div className="text-[11px] text-slate">
                    Arr: {item.arrivalTime}
                  </div>
                </td>

                {/* Status Pill */}
                <td className="px-5 py-4">
                  <StatusPill
                    label={item.currentStatus.replace('_', ' ')}
                    variant={
                      item.currentStatus === 'in_service'
                        ? 'in_service'
                        : item.currentStatus === 'completed'
                        ? 'completed'
                        : item.currentStatus === 'awaiting_review'
                        ? 'awaiting'
                        : 'upcoming'
                    }
                  />
                </td>

                {/* Actions */}
                <td className="px-5 py-4 text-right">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedQueueItem(item)}
                      className="cursor-pointer rounded-pill border border-line bg-paper px-3.5 py-1.5 text-[13px] font-semibold text-teal transition hover:bg-mist"
                    >
                      {language === 'bn' ? 'স্টেশন বদল / অ্যাকশন' : 'Dispatch / Action'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Action Sheet for Dispatching / Transferring */}
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

            {/* Advance Status Options */}
            <div>
              <label className="mb-2 block text-[13px] font-semibold text-slate">
                Update Queue Status:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    advanceQueueStatus(selectedQueueItem.id, 'in_service');
                    setSelectedQueueItem(null);
                  }}
                  className="cursor-pointer rounded-chip border border-teal bg-mist p-3 text-[13px] font-semibold text-pine transition hover:opacity-90"
                >
                  Mark In-Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    advanceQueueStatus(selectedQueueItem.id, 'awaiting_review');
                    setSelectedQueueItem(null);
                  }}
                  className="cursor-pointer rounded-chip border border-line bg-paper p-3 text-[13px] font-semibold text-warn transition hover:bg-bone"
                >
                  Send for Doctor Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    advanceQueueStatus(selectedQueueItem.id, 'completed');
                    setSelectedQueueItem(null);
                  }}
                  className="cursor-pointer rounded-chip border border-ok bg-ok-bg p-3 text-[13px] font-semibold text-ok-fg transition hover:opacity-90"
                >
                  Mark Completed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    advanceQueueStatus(selectedQueueItem.id, 'referred');
                    setSelectedQueueItem(null);
                  }}
                  className="cursor-pointer rounded-chip border border-clay bg-warn-bg p-3 text-[13px] font-semibold text-clay transition hover:opacity-90"
                >
                  Refer / Escalate
                </button>
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
                        transferStation(selectedQueueItem.id, st.id);
                        setSelectedQueueItem(null);
                      }}
                      className={`flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm font-medium transition ${
                        isCurrent
                          ? 'cursor-not-allowed bg-bone text-slate'
                          : 'cursor-pointer bg-paper text-ink hover:bg-mist'
                      }`}
                    >
                      <span>{st.name}</span>
                      <PhCaretRight size={16} color="#1D6B66" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
