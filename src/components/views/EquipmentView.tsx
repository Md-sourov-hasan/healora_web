import React, { useState } from 'react';
import {
  PhPlus,
  PhArrowsClockwise,
  PhShieldCheck,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { HubEquipment, EquipmentStatus, EquipmentCategory } from '../../types';

export const EquipmentView: React.FC = () => {
  const {
    t,
    language,
    equipment,
    stations,
    selectedHubId,
    hubs,
    toggleEquipmentStatus,
    recordEquipmentService,
    addEquipment,
    refreshBackendData,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<HubEquipment | null>(null);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [calibrationNextDue, setCalibrationNextDue] = useState('');

  // Add form states
  const [deviceAssetTag, setDeviceAssetTag] = useState('');
  const [deviceMake, setDeviceMake] = useState('');
  const [deviceCategory, setDeviceCategory] = useState<EquipmentCategory>('bp_monitor');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceSerial, setDeviceSerial] = useState('');
  const [deviceStationId, setDeviceStationId] = useState('');

  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];
  const hubEquipment = equipment.filter((eq) => eq.hubId === selectedHubId);
  const hubStations = stations.filter((s) => s.hubId === selectedHubId);

  const filteredEquipment = categoryFilter === 'all'
    ? hubEquipment
    : hubEquipment.filter((eq) => eq.category === categoryFilter);

  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceAssetTag.trim()) return;
    const ok = await addEquipment({
      code: deviceAssetTag,
      name: deviceMake,
      category: deviceCategory,
      model: deviceModel,
      serialNumber: deviceSerial,
      stationId: deviceStationId || undefined,
    });
    if (ok) { setDeviceAssetTag(''); setDeviceMake(''); setDeviceModel(''); setDeviceSerial(''); setDeviceStationId(''); setIsAddDeviceOpen(false); }
  };

  const handleRecordMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    const ok = await recordEquipmentService(selectedDevice.id, { kind: 'calibration', notes: maintenanceNotes, nextDueOn: calibrationNextDue || undefined });
    if (ok) { setIsMaintenanceOpen(false); setMaintenanceNotes(''); setCalibrationNextDue(''); }
  };

  const getStatusBadge = (status: EquipmentStatus) => {
    switch (status) {
      case 'available':
        return <StatusPill label="AVAILABLE" variant="available" />;
      case 'assigned':
        return <StatusPill label="ASSIGNED &amp; ACTIVE" variant="active" />;
      case 'calibration_due':
        return <StatusPill label="CALIBRATION DUE" variant="upcoming" />;
      case 'maintenance':
        return <StatusPill label="MAINTENANCE" variant="draft" />;
      case 'out_of_service':
        return <StatusPill label="OUT OF SERVICE" variant="cancelled" />;
      default:
        return <StatusPill label={status} variant="draft" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'চিকিৎসা সরঞ্জাম ও ক্যালিব্রেশন' : 'BIOMEDICAL EQUIPMENT & QUALITY BENCHMARK'}
            </span>
            <span className="size-2 animate-pulse-live rounded-full bg-ok" />
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navEquipment}
          </h1>
          <p className="mt-1 mb-0 text-sm text-slate">
            {currentHub?.name || 'Selected hub'} • {language === 'bn'
              ? 'পরিমাপ ডিভাইসের নিয়মিত ক্যালিব্রেশন, ব্যাটারি স্বাস্থ্য ও ব্যবহারযোগ্যতা স্থিতি'
              : 'Medical device calibration logs, serial attributions & session readiness safeguards'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => void refreshBackendData()}
            icon={<PhArrowsClockwise size={16} />}
          >
            {language === 'bn' ? 'ক্যালিব্রেশন রিপোর্ট' : 'Refresh Equipment'}
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddDeviceOpen(true)}
            icon={<PhPlus size={16} />}
          >
            {language === 'bn' ? 'নতুন ডিভাইস যুক্ত করুন' : 'Register Equipment'}
          </Button>
        </div>
      </div>

      {/* PRD Equipment Constraint Notice (PRD Section 8.9) */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sage-200 bg-mist px-5 py-3.5 text-[13px] text-pine">
        <PhShieldCheck size={20} color="#1D6B66" />
        <div className="flex-1">
          <strong>Mandatory Safety Rule (PRD 8.9 &amp; 12.6):</strong> The platform strictly prevents any device marked "Out of Service" or overdue for calibration from being assigned to active clinical sessions. Readings submitted via the mobile app retain exact device serial attribution.
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="mb-7 grid grid-cols-4 gap-4">
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Total Devices</div>
          <div className="mt-1 text-3xl font-bold text-ink">{hubEquipment.length}</div>
          <div className="mt-1 text-xs text-teal">Inventory registered at this hub</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Ready &amp; Assigned</div>
          <div className="mt-1 text-3xl font-bold text-ok">
            {hubEquipment.filter((e) => e.status === 'assigned' || e.status === 'available').length}
          </div>
          <div className="mt-1 text-xs text-slate">Certified for patient checkups</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Calibration Due</div>
          <div className="mt-1 text-3xl font-bold text-amber">
            {hubEquipment.filter((e) => e.status === 'calibration_due').length}
          </div>
          <div className="mt-1 text-xs text-amber font-semibold">Requires biomedical inspection</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Out of Service</div>
          <div className="mt-1 text-3xl font-bold text-bad">
            {hubEquipment.filter((e) => e.status === 'out_of_service' || e.status === 'maintenance').length}
          </div>
          <div className="mt-1 text-xs text-bad">Blocked from session allocation</div>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-xs font-semibold text-slate">Category:</span>
        {['all', 'bp_monitor', 'glucometer', 'pulse_oximeter', 'weight_scale', 'ecg_device'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              categoryFilter === cat ? 'bg-ink text-white' : 'bg-paper border border-line text-slate hover:bg-mist'
            }`}
          >
            {cat === 'all' ? 'All Devices' : cat.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Equipment Table */}
      <Card variant="card" className="p-0! overflow-hidden">
        <table className="w-full border-collapse text-left font-ui">
          <thead>
            <tr className="border-b border-line bg-bone">
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Device &amp; Code</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Category &amp; Model</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Station Assigned</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Calibration Due</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Battery</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Status</th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line text-sm">
            {filteredEquipment.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-slate">
                  <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-mist text-teal">
                    <PhShieldCheck size={24} />
                  </div>
                  <p className="font-semibold text-ink">No biomedical equipment registered</p>
                  <p className="text-xs text-slate">Register a device or sync equipment records from the central hub inventory.</p>
                </td>
              </tr>
            ) : (
              filteredEquipment.map((device) => {
              const isOverdue = device.status === 'calibration_due';
              return (
                <tr key={device.id} className="transition-colors hover:bg-mist/30">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-ink">{device.name}</div>
                    <div className="font-mono text-xs text-teal">{device.code} • SN: {device.serialNumber}</div>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className="font-medium text-ink">{device.model || '—'}</div>
                    <div className="text-slate">{device.category.replace('_', ' ').toUpperCase()}</div>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-slate">
                    {device.stationName || 'Unassigned'}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className={isOverdue ? 'font-bold text-bad' : 'text-slate'}>
                      {device.nextCalibrationDue || 'Not reported'}
                    </div>
                    <div className="text-[11px] text-slate">Last: {device.lastCalibrationDate || 'Not reported'}</div>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium">
                    {device.batteryPercent == null ? <span className="text-xs text-slate">Not reported</span> : <div className="flex items-center gap-1.5">
                      <div className="h-2 w-10 overflow-hidden rounded-full bg-line">
                        <div
                          className={`h-full ${device.batteryPercent > 50 ? 'bg-ok' : device.batteryPercent > 20 ? 'bg-amber' : 'bg-bad'}`}
                          style={{ width: `${device.batteryPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate">{device.batteryPercent}%</span>
                    </div>}
                  </td>
                  <td className="px-5 py-4">
                    {getStatusBadge(device.status)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDevice(device)}
                        className="cursor-pointer text-xs font-semibold text-teal hover:underline"
                      >
                        Inspect
                      </button>

                      {isOverdue && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDevice(device);
                            setIsMaintenanceOpen(true);
                          }}
                          className="cursor-pointer rounded-md bg-warn-bg px-2 py-1 text-xs font-bold text-warn-fg"
                        >
                          Recalibrate
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const reason = window.prompt('Enter a reason for this equipment status change:');
                          if (reason?.trim()) void toggleEquipmentStatus(device.id, device.status === 'out_of_service' ? 'available' : 'out_of_service', reason.trim());
                        }}
                        className={`cursor-pointer rounded-md border px-2 py-1 text-[11px] font-semibold ${
                          device.status === 'out_of_service'
                            ? 'border-ok text-ok bg-paper hover:bg-ok-bg'
                            : 'border-bad/30 text-bad bg-paper hover:bg-bad-bg'
                        }`}
                      >
                        {device.status === 'out_of_service' ? 'Restore' : 'Take Offline'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>
      </Card>

      {/* Modal: Register Equipment */}
      <ModalSheet
        isOpen={isAddDeviceOpen}
        onClose={() => setIsAddDeviceOpen(false)}
        title="Register Medical Equipment"
      >
        <form onSubmit={handleCreateDevice} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Asset tag *</label>
            <input
              type="text"
              required
              value={deviceAssetTag}
              onChange={(e) => setDeviceAssetTag(e.target.value)}
              placeholder="Unique inventory asset tag"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Device Category</label>
              <select
                value={deviceCategory}
                onChange={(e) => setDeviceCategory(e.target.value as EquipmentCategory)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              >
                <option value="bp_monitor">Digital BP Monitor</option>
                <option value="glucometer">Glucometer</option>
                <option value="pulse_oximeter">Pulse Oximeter (SpO2)</option>
                <option value="weighing_scale">Medical Scale</option>
                <option value="stadiometer">Stadiometer</option>
                <option value="thermometer">Thermometer</option>
                <option value="tablet">Tablet</option>
                <option value="printer">Printer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Manufacturer / make</label>
              <input
                type="text"
                value={deviceMake}
                onChange={(e) => setDeviceMake(e.target.value)}
                placeholder="Manufacturer"
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Model number</label>
              <input type="text" value={deviceModel} onChange={(e) => setDeviceModel(e.target.value)} className="h-10 w-full rounded-xl border border-line px-3 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Serial Number</label>
              <input
                type="text"
                value={deviceSerial}
                onChange={(e) => setDeviceSerial(e.target.value)}
                placeholder="e.g. OM-2026-9921"
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Assign to Station</label>
              <select
                value={deviceStationId}
                onChange={(e) => setDeviceStationId(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              >
                <option value="">Depot / Unassigned</option>
                {hubStations.map((st) => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsAddDeviceOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Device</Button>
          </div>
        </form>
      </ModalSheet>

      {/* Drawer: Device Details */}
      {selectedDevice && !isMaintenanceOpen && (
        <ModalSheet
          isOpen={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          title={`Device Inspector: ${selectedDevice.name}`}
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-bone p-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-bold text-teal">{selectedDevice.code}</span>
                {getStatusBadge(selectedDevice.status)}
              </div>
              <div className="mt-2 text-sm text-ink">
                Serial Number: <strong>{selectedDevice.serialNumber || 'Not reported'}</strong>
              </div>
              <div className="text-xs text-slate">
                Model: {selectedDevice.model || 'Not reported'}
              </div>
            </div>

            <div className="rounded-xl border border-line p-3.5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate">Station Placement:</span>
                <strong className="text-ink">{selectedDevice.stationName || 'Unassigned'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Last Calibration Date:</span>
                <span className="font-semibold text-ink">{selectedDevice.lastCalibrationDate || 'Not reported'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Next Calibration Due:</span>
                <span className="font-semibold text-bad">{selectedDevice.nextCalibrationDue || 'Not reported'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Internal Battery:</span>
                <span className="font-semibold text-ink">{selectedDevice.batteryPercent == null ? 'Not reported' : `${selectedDevice.batteryPercent}%`}</span>
              </div>
            </div>

            {selectedDevice.notes && (
              <div className="rounded-xl bg-mist p-3.5 text-xs text-pine">
                <strong>Calibration Benchmark:</strong> {selectedDevice.notes}
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <Button
                variant="primary"
                onClick={() => setIsMaintenanceOpen(true)}
                className="w-full"
              >
                Record Recalibration / Maintenance
              </Button>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* Modal: Recalibrate */}
      <ModalSheet
        isOpen={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
        title="Biomedical Recalibration Certification"
      >
        <form onSubmit={handleRecordMaintenance} className="space-y-4">
          <div className="text-xs text-slate">
            Certify that device <strong className="text-ink">{selectedDevice?.name} ({selectedDevice?.code})</strong> was tested against clinical standards.
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Calibration Service Notes</label>
            <textarea
              rows={3}
              required
              value={maintenanceNotes}
              onChange={(e) => setMaintenanceNotes(e.target.value)}
              placeholder="Describe the calibration work performed and its outcome."
              className="w-full rounded-xl border border-line p-3 text-sm"
            />
          </div>

          <label className="block text-xs font-semibold text-slate">
            Next calibration due date
            <input type="date" value={calibrationNextDue} onChange={(e) => setCalibrationNextDue(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" />
          </label>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsMaintenanceOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Record Calibration Event</Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
