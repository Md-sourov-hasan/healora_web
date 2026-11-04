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
import { useApp } from '../../context/AppContext';
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
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'bn' ? 'লাইভ অপারেশন' : 'REAL-TIME QUEUE DISPATCH'}
            </span>
            <span
              className="pulse-live"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: '#2F855A',
              }}
            />
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 600,
              color: '#0B1F22',
              fontFamily: 'var(--ui)',
            }}
          >
            {t.navQueue}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#5B6B6E', fontSize: '14px' }}>
            {t.leastPrivilegeNote}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        {hubStations.map((station) => {
          const waitingCount = hubQueue.filter((q) => q.stationId === station.id && q.currentStatus === 'waiting').length;

          return (
            <Card
              key={station.id}
              variant="card"
              style={{
                borderTop: station.status === 'busy' ? '3px solid #1D6B66' : '3px solid #DDE5E1',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#5B6B6E' }}>
                  {station.name.split(':')[0]}
                </span>
                <StatusPill
                  label={station.status}
                  variant={station.status === 'busy' ? 'busy' : station.status === 'available' ? 'available' : 'draft'}
                />
              </div>

              <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#0B1F22' }}>
                {station.name.split(':')[1] || station.name}
              </h3>
              <div style={{ fontSize: '12px', color: '#5B6B6E', marginBottom: '14px' }}>
                Staff: <strong style={{ color: '#0B1F22' }}>{station.currentStaffName}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #DDE5E1' }}>
                <div style={{ fontSize: '13px', color: '#5B6B6E' }}>
                  <div>Serving: <strong style={{ color: '#0B1F22' }}>{station.currentTicketNumber || '—'}</strong></div>
                  <div style={{ fontSize: '11px', color: '#1D6B66', fontWeight: 600 }}>Queue: {waitingCount} waiting</div>
                </div>
                <button
                  type="button"
                  onClick={() => callNextPatient(station.id)}
                  style={{
                    backgroundColor: '#0B1F22',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span>{t.callNext}</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <SegmentedTabs
          options={tabOptions}
          activeKey={activeStationFilter}
          onChange={(key) => setActiveStationFilter(key)}
        />
      </div>

      {/* Queue Table */}
      <Card variant="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--ui)' }}>
          <thead>
            <tr style={{ backgroundColor: '#F5F3EE', borderBottom: '1px solid #DDE5E1' }}>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                {t.tokenNumber}
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                {t.patientName}
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                {t.station}
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Service Type
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Wait Time
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                Queue Status
              </th>
              <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase', textAlign: 'right' }}>
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredQueue.map((item, idx) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: idx === filteredQueue.length - 1 ? 'none' : '1px solid #DDE5E1',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F3EE')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {/* Token */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: '#0B1F22',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '13px',
                      }}
                      className="num-tabular"
                    >
                      {item.ticketNumber}
                    </span>
                    {item.priority === 'priority_elderly' && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#F8EDD8',
                          color: '#80540F',
                          padding: '2px 6px',
                          borderRadius: '6px',
                        }}
                      >
                        Elderly Priority
                      </span>
                    )}
                  </div>
                </td>

                {/* Patient Name & Phone (Operational Least-Privilege) */}
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: '#0B1F22' }}>
                    {language === 'bn' ? item.patientNameBn : item.patientName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5B6B6E' }} className="num-tabular">
                    {item.patientPhone}
                  </div>
                </td>

                {/* Station */}
                <td style={{ padding: '16px 20px', fontSize: '14px', color: '#0B1F22' }}>
                  <div style={{ fontWeight: 500 }}>{item.stationName}</div>
                  <div style={{ fontSize: '12px', color: '#5B6B6E' }}>Staff: {item.assignedStaffName}</div>
                </td>

                {/* Service Type */}
                <td style={{ padding: '16px 20px', fontSize: '14px', color: '#5B6B6E' }}>
                  {item.serviceType}
                </td>

                {/* Wait Time */}
                <td style={{ padding: '16px 20px', fontSize: '14px', color: '#0B1F22' }}>
                  <div className="num-tabular" style={{ fontWeight: 600 }}>
                    {item.waitMinutes} mins
                  </div>
                  <div style={{ fontSize: '11px', color: '#5B6B6E' }}>
                    Arr: {item.arrivalTime}
                  </div>
                </td>

                {/* Status Pill */}
                <td style={{ padding: '16px 20px' }}>
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
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedQueueItem(item)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid #DDE5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#1D6B66',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Current Care Step Progress Bar */}
            <div style={{ backgroundColor: '#F5F3EE', padding: '16px', borderRadius: '16px', border: '1px solid #DDE5E1' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '8px' }}>
                Encounter Progression:
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#0B1F22', marginBottom: '6px' }}>
                <span>1. Intake</span>
                <span>2. Vitals &amp; Lab</span>
                <span>3. Dr. Review</span>
                <span>4. Complete</span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: '#CFE0D8', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(selectedQueueItem.stepProgress / 4) * 100}%`,
                    height: '100%',
                    backgroundColor: '#1D6B66',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>

            {/* Advance Status Options */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '8px' }}>
                Update Queue Status:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    advanceQueueStatus(selectedQueueItem.id, 'in_service');
                    setSelectedQueueItem(null);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #1D6B66',
                    backgroundColor: '#E6EEEA',
                    color: '#0F3D3A',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Mark In-Service
                </button>
                <button
                  type="button"
                  onClick={() => {
                    advanceQueueStatus(selectedQueueItem.id, 'awaiting_review');
                    setSelectedQueueItem(null);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #DDE5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#B7791F',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Send for Doctor Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    advanceQueueStatus(selectedQueueItem.id, 'completed');
                    setSelectedQueueItem(null);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #2F855A',
                    backgroundColor: '#E3F1E8',
                    color: '#22643F',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Mark Completed
                </button>
                <button
                  type="button"
                  onClick={() => {
                    advanceQueueStatus(selectedQueueItem.id, 'referred');
                    setSelectedQueueItem(null);
                  }}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #C0633F',
                    backgroundColor: '#F8EDD8',
                    color: '#C0633F',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Refer / Escalate
                </button>
              </div>
            </div>

            {/* Transfer to Another Station */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '8px' }}>
                Transfer to Another Station:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {hubStations.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    disabled={st.id === selectedQueueItem.stationId}
                    onClick={() => {
                      transferStation(selectedQueueItem.id, st.id);
                      setSelectedQueueItem(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid #DDE5E1',
                      backgroundColor: st.id === selectedQueueItem.stationId ? '#F5F3EE' : '#FFFFFF',
                      cursor: st.id === selectedQueueItem.stationId ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: st.id === selectedQueueItem.stationId ? '#5B6B6E' : '#0B1F22',
                    }}
                  >
                    <span>{st.name}</span>
                    <PhCaretRight size={16} color="#1D6B66" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
