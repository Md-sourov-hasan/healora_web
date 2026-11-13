import React, { useState } from 'react';
import {
  PhPlus,
  PhArrowsClockwise,
  PhDesktop,
  PhGear,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { HubStation, StationStatus } from '../../types';
import { stationsEquipmentService } from '../../services/stationsEquipmentService';

export const StationsView: React.FC = () => {
  const {
    t,
    language,
    stations,
    serviceTypes,
    selectedHubId,
    hubs,
    queue,
    toggleStationStatus,
    addStation,
    callNextPatient,
    refreshBackendData,
    showToast,
  } = useApp();

  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [newStationName, setNewStationName] = useState('');
  const [newStationCode, setNewStationCode] = useState('');
  const [newStationType, setNewStationType] = useState<HubStation['stationType']>('vitals');

  // Edit & Service Types modal
  const [managingStation, setManagingStation] = useState<HubStation | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameBn, setEditNameBn] = useState('');
  const [editType, setEditType] = useState<HubStation['stationType']>('vitals');
  const [selectedServiceTypeIds, setSelectedServiceTypeIds] = useState<string[]>([]);
  const [stationBusy, setStationBusy] = useState(false);

  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];
  const hubStations = stations.filter((s) => s.hubId === selectedHubId);
  const hubQueue = queue.filter((q) => q.hubId === selectedHubId);

  const handleCreateStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim()) return;
    const ok = await addStation({
      code: newStationCode,
      name: newStationName,
      stationType: newStationType,
    });
    if (ok) {
      setNewStationName('');
      setNewStationCode('');
      setIsAddStationOpen(false);
    }
  };

  const openManageStation = async (station: HubStation) => {
    setManagingStation(station);
    setEditName(station.name);
    setEditNameBn(station.nameBn || '');
    setEditType(station.stationType);
    setSelectedServiceTypeIds([]);
    setStationBusy(true);
    try {
      const linked = await stationsEquipmentService.getStationServiceTypes(station.id);
      if (Array.isArray(linked)) {
        setSelectedServiceTypeIds(linked.map((s) => s.id));
      }
    } catch {
      // ignore
    } finally {
      setStationBusy(false);
    }
  };

  const handleSaveStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingStation) return;
    setStationBusy(true);
    try {
      const apiType = editType === 'counseling' ? 'counselling' : editType;
      await stationsEquipmentService.updateStation(managingStation.id, {
        name: editName.trim(),
        nameBn: editNameBn.trim() || undefined,
        stationType: apiType,
      });
      await stationsEquipmentService.setStationServiceTypes(managingStation.id, selectedServiceTypeIds);
      setManagingStation(null);
      await refreshBackendData();
      showToast('Station configuration and service types updated.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update station.');
    } finally {
      setStationBusy(false);
    }
  };

  const handleDeleteStation = async (stationId: string) => {
    setStationBusy(true);
    try {
      await stationsEquipmentService.deleteStation(stationId);
      setManagingStation(null);
      await refreshBackendData();
      showToast('Station deleted.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete station.');
    } finally {
      setStationBusy(false);
    }
  };

  const toggleServiceTypeSelection = (stId: string) => {
    setSelectedServiceTypeIds((prev) =>
      prev.includes(stId) ? prev.filter((id) => id !== stId) : [...prev, stId]
    );
  };

  const getStationTypeBadge = (type: HubStation['stationType']) => {
    switch (type) {
      case 'registration':
        return 'bg-sage-200 text-pine';
      case 'vitals':
        return 'bg-teal text-white';
      case 'doctor_review':
        return 'bg-pine text-white';
      case 'counseling':
        return 'bg-clay text-white';
      default:
        return 'bg-bone text-ink';
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'শারীরিক সেবা পয়েন্ট' : 'PHYSICAL WORKFLOW STATIONS'}
            </span>
            <span className="size-2 animate-pulse-live rounded-full bg-ok" />
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navStations}</h1>
          <p className="mt-1 mb-0 text-sm text-slate">
            {currentHub?.name || 'Selected hub'} •{' '}
            {language === 'bn'
              ? 'অভ্যর্থনা, ভাইটালস পরিমাপ কক্ষ, ডাক্তার রিভিউ ও কাউন্সেলিং স্টেশন পরিচালনা'
              : 'Dedicated physical care desks, live occupancy, service type bindings & queue progress'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => void refreshBackendData()}
            icon={<PhArrowsClockwise size={16} />}
          >
            {language === 'bn' ? 'রিফ্রেশ' : 'Refresh Desks'}
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddStationOpen(true)}
            icon={<PhPlus size={16} />}
          >
            {language === 'bn' ? 'নতুন স্টেশন তৈরি' : 'Add Station'}
          </Button>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="mb-7 grid grid-cols-4 gap-4">
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Configured Stations</div>
          <div className="mt-1 text-3xl font-bold text-ink">{hubStations.length}</div>
          <div className="mt-1 text-xs text-teal">Active physical service points</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Currently Busy</div>
          <div className="mt-1 text-3xl font-bold text-teal">
            {hubStations.filter((s) => s.status === 'busy').length}
          </div>
          <div className="mt-1 text-xs text-slate">Patients in active service</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Available Stations</div>
          <div className="mt-1 text-3xl font-bold text-ok">
            {hubStations.filter((s) => s.status === 'available').length}
          </div>
          <div className="mt-1 text-xs text-slate">Ready for next queue ticket</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Completed Today</div>
          <div className="mt-1 text-3xl font-bold text-pine">
            {hubStations.length > 0 && hubStations.every((station) => station.completedTodayCount != null)
              ? hubStations.reduce((acc, station) => acc + (station.completedTodayCount ?? 0), 0)
              : '—'}
          </div>
          <div className="mt-1 text-xs text-slate">Cumulative encounters served</div>
        </Card>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-2 gap-6">
        {hubStations.length === 0 ? (
          <div className="col-span-2 rounded-2xl border border-line bg-paper p-12 text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-sage-200 text-pine">
              <PhDesktop size={24} />
            </div>
            <h3 className="text-base font-bold text-ink">
              {language === 'bn' ? 'কোনো স্টেশন তৈরি করা নেই' : 'No Service Stations Configured'}
            </h3>
            <p className="mt-1 text-sm text-slate">
              {language === 'bn'
                ? 'উপরে "নতুন স্টেশন তৈরি" বাটনে ক্লিক করে অভ্যর্থনা বা ভাইটালস পরিমাপ কক্ষ যুক্ত করুন।'
                : 'Click "Add Station" above to configure your physical service desks.'}
            </p>
          </div>
        ) : (
          hubStations.map((station) => {
            const waitingAtStation = hubQueue.filter(
              (q) => q.stationId === station.id && q.currentStatus === 'waiting'
            ).length;

            return (
              <Card
                key={station.id}
                variant="card"
                className={`border-t-3! ${
                  station.status === 'busy'
                    ? 'border-t-teal!'
                    : station.status === 'available'
                      ? 'border-t-ok!'
                      : 'border-t-bad!'
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-bold uppercase ${getStationTypeBadge(
                          station.stationType
                        )}`}
                      >
                        {station.stationType.replace('_', ' ')}
                      </span>
                      <StatusPill
                        label={station.status.toUpperCase()}
                        variant={
                          station.status === 'available'
                            ? 'available'
                            : station.status === 'busy'
                              ? 'busy'
                              : 'cancelled'
                        }
                      />
                    </div>
                    <h3 className="m-0 text-lg font-semibold text-ink">
                      {language === 'bn' ? station.nameBn || station.name : station.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-[11px] font-semibold text-slate">Active Ticket</div>
                      <div className="font-mono text-base font-bold text-teal">
                        {station.currentTicketNumber || '—'}
                      </div>
                    </div>
                    <Button
                      variant="small"
                      icon={<PhGear size={14} />}
                      onClick={() => void openManageStation(station)}
                    >
                      Configure
                    </Button>
                  </div>
                </div>

                {/* Station Details */}
                <div className="mb-4 rounded-xl bg-bone p-3.5 text-xs">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-slate">Assigned Personnel:</span>
                    <strong className="text-ink">{station.currentStaffName || 'Not assigned'}</strong>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-slate">Patients Waiting in Line:</span>
                    <span className="rounded-md bg-paper px-2 py-0.5 font-bold text-ink">
                      {waitingAtStation} patients
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate">Completed Today:</span>
                    <span className="font-semibold text-pine">
                      {station.completedTodayCount ?? '—'}
                      {station.completedTodayCount != null ? ' visits' : ''}
                    </span>
                  </div>
                </div>

                {/* Operational Action Controls */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={waitingAtStation === 0}
                    onClick={() => void callNextPatient(station.id)}
                    className="flex-1 cursor-pointer rounded-xl bg-teal px-3 py-2 text-center text-xs font-semibold text-white transition hover:bg-pine disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Call Next Patient
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const nextSt =
                        station.status === 'available'
                          ? 'busy'
                          : station.status === 'busy'
                            ? 'paused'
                            : 'available';
                      void toggleStationStatus(station.id, nextSt as StationStatus);
                    }}
                    className="cursor-pointer rounded-xl border border-line bg-paper px-3 py-2 text-xs font-semibold text-ink hover:bg-bone"
                  >
                    Toggle State
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void toggleStationStatus(
                        station.id,
                        station.status === 'out_of_service' ? 'available' : 'out_of_service'
                      )
                    }
                    className={`cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold ${
                      station.status === 'out_of_service'
                        ? 'border-ok bg-paper text-ok hover:bg-ok-bg'
                        : 'border-bad/30 bg-paper text-bad hover:bg-bad-bg'
                    }`}
                  >
                    {station.status === 'out_of_service' ? 'Reopen Desk' : 'Out of Service'}
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Station Modal */}
      <ModalSheet
        isOpen={isAddStationOpen}
        onClose={() => setIsAddStationOpen(false)}
        title="Add Physical Service Station"
      >
        <form onSubmit={handleCreateStation} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Station code *</label>
            <input
              type="text"
              required
              value={newStationCode}
              onChange={(e) => setNewStationCode(e.target.value)}
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Station Name</label>
            <input
              type="text"
              required
              value={newStationName}
              onChange={(e) => setNewStationName(e.target.value)}
              placeholder="e.g. Station 5: Diagnostic & ECG Room"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Station Category</label>
            <select
              value={newStationType}
              onChange={(e) => setNewStationType(e.target.value as HubStation['stationType'])}
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            >
              <option value="registration">Registration & Identity Desk</option>
              <option value="vitals">Vitals & Screening Room</option>
              <option value="doctor_review">Local Doctor Consultation</option>
              <option value="counseling">Tele-triage & Patient Counseling</option>
            </select>
          </div>

          <p className="m-0 text-xs text-slate">
            Create the station first. Staff assignments are maintained in shift/roster APIs.
          </p>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsAddStationOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Desk
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Configure Station & Supported Service Types Modal */}
      {managingStation && (
        <ModalSheet
          isOpen={!!managingStation}
          onClose={() => setManagingStation(null)}
          title={`Configure Station: ${managingStation.name}`}
          subtitle="Update station metadata, bind supported service types, or delete idle station"
        >
          <form onSubmit={handleSaveStation} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-slate">
                Station Name *
                <input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
                />
              </label>
              <label className="block text-xs font-semibold text-slate">
                Station Name (Bangla)
                <input
                  value={editNameBn}
                  onChange={(e) => setEditNameBn(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
                />
              </label>
            </div>

            <label className="block text-xs font-semibold text-slate">
              Station Category
              <select
                value={editType}
                onChange={(e) => setEditType(e.target.value as HubStation['stationType'])}
                className="mt-1 h-10 w-full rounded-xl border border-line bg-paper px-3 text-sm font-normal"
              >
                <option value="registration">Registration & Identity Desk</option>
                <option value="vitals">Vitals & Screening Room</option>
                <option value="doctor_review">Local Doctor Consultation</option>
                <option value="counseling">Tele-triage & Patient Counseling</option>
                <option value="waiting">Waiting Area</option>
                <option value="other">Other</option>
              </select>
            </label>

            <div>
              <div className="mb-1.5 text-xs font-semibold text-slate">
                Supported Catalogue Service Types ({selectedServiceTypeIds.length} selected)
              </div>
              <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-xl border border-line bg-bone p-3">
                {serviceTypes.map((st) => (
                  <label key={st.id} className="flex items-center gap-2 text-xs text-ink">
                    <input
                      type="checkbox"
                      checked={selectedServiceTypeIds.includes(st.id)}
                      onChange={() => toggleServiceTypeSelection(st.id)}
                    />
                    <span>
                      {st.name} <span className="font-mono text-slate">({st.code})</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-line pt-3">
              <button
                type="button"
                disabled={stationBusy}
                onClick={() => void handleDeleteStation(managingStation.id)}
                className="cursor-pointer rounded-xl border border-bad/40 bg-bad-bg px-3 py-2 text-xs font-semibold text-bad-fg"
              >
                Delete Station
              </button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setManagingStation(null)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={stationBusy}>
                  Save Station
                </Button>
              </div>
            </div>
          </form>
        </ModalSheet>
      )}
    </div>
  );
};
