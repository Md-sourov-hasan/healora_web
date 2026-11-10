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
    addEquipment,
    showToast,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<HubEquipment | null>(null);
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  // Add form states
  const [deviceName, setDeviceName] = useState('');
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

  const handleCreateDevice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceName.trim()) return;
    const targetStation = hubStations.find((s) => s.id === deviceStationId);
    const generatedSerial = deviceSerial.trim() || 'SN-8820';
    addEquipment({
      name: deviceName,
      category: deviceCategory,
      model: deviceModel || 'Clinical Grade Standard',
      serialNumber: generatedSerial,
      stationId: deviceStationId || undefined,
      stationName: targetStation?.name || undefined,
    });
    setDeviceName('');
    setDeviceModel('');
    setDeviceSerial('');
    setIsAddDeviceOpen(false);
  };

  const handleRecordMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDevice) return;
    toggleEquipmentStatus(selectedDevice.id, 'available');
    showToast(`Recalibration certified for device ${selectedDevice.code}. Marked available.`);
    setIsMaintenanceOpen(false);
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
            {currentHub.name} • {language === 'bn'
              ? 'পরিমাপ ডিভাইসের নিয়মিত ক্যালিব্রেশন, ব্যাটারি স্বাস্থ্য ও ব্যবহারযোগ্যতা স্থিতি'
              : 'Medical device calibration logs, serial attributions & session readiness safeguards'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => showToast('Biomedical engineer maintenance schedule requested.')}
            icon={<PhArrowsClockwise size={16} />}
          >
            {language === 'bn' ? 'ক্যালিব্রেশন রিপোর্ট' : 'Calibration Report'}
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
            {filteredEquipment.map((device) => {
              const isOverdue = device.status === 'calibration_due';
              return (
                <tr key={device.id} className="transition-colors hover:bg-mist/30">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-ink">{device.name}</div>
                    <div className="font-mono text-xs text-teal">{device.code} • SN: {device.serialNumber}</div>
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className="font-medium text-ink">{device.model}</div>
                    <div className="text-slate">{device.category.replace('_', ' ').toUpperCase()}</div>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-slate">
                    {device.stationName || 'Storage Depot (Unassigned)'}
                  </td>
                  <td className="px-5 py-4 text-xs">
                    <div className={isOverdue ? 'font-bold text-bad' : 'text-slate'}>
                      {device.nextCalibrationDue}
                    </div>
                    <div className="text-[11px] text-slate">Last: {device.lastCalibrationDate}</div>
                  </td>
                  <td className="px-5 py-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-10 overflow-hidden rounded-full bg-line">
                        <div
                          className={`h-full ${device.batteryPercent > 50 ? 'bg-ok' : device.batteryPercent > 20 ? 'bg-amber' : 'bg-bad'}`}
                          style={{ width: `${device.batteryPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate">{device.batteryPercent}%</span>
                    </div>
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
                        onClick={() =>
                          toggleEquipmentStatus(
                            device.id,
                            device.status === 'out_of_service' ? 'available' : 'out_of_service'
                          )
                        }
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
            })}
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
            <label className="mb-1 block text-xs font-semibold text-slate">Device Name &amp; Brand</label>
            <input
              type="text"
              required
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. Omron HEM-7120 Digital BP Monitor"
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
                <option value="weight_scale">Medical Scale</option>
                <option value="ecg_device">12-Channel Tele-ECG</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Model Number</label>
              <input
                type="text"
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="e.g. HEM-7120 Clinical"
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
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
                Serial Number: <strong>{selectedDevice.serialNumber}</strong>
              </div>
              <div className="text-xs text-slate">
                Model: {selectedDevice.model}
              </div>
            </div>

            <div className="rounded-xl border border-line p-3.5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate">Station Placement:</span>
                <strong className="text-ink">{selectedDevice.stationName || 'Depot'}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Last Calibration Date:</span>
                <span className="font-semibold text-ink">{selectedDevice.lastCalibrationDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Next Calibration Due:</span>
                <span className="font-semibold text-bad">{selectedDevice.nextCalibrationDue}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate">Internal Battery:</span>
                <span className="font-semibold text-ink">{selectedDevice.batteryPercent}%</span>
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
              placeholder="e.g. Standard manometer column benchmark test passed within +/- 2 mmHg tolerance margin."
              className="w-full rounded-xl border border-line p-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsMaintenanceOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Certify &amp; Reopen Device</Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
