import React, { useState } from 'react';
import {
  PhArrowsClockwise,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
import type { HubEquipment } from '../../types';

const thClass = 'px-5 py-3.5 text-xs font-semibold uppercase text-slate';

export const StationsEquipmentView: React.FC = () => {
  const {
    t,
    language,
    equipment,
    stations,
    selectedHubId,
    toggleStationStatus,
    toggleEquipmentStatus,
    showToast,
  } = useApp();

  const [selectedDevice, setSelectedDevice] = useState<HubEquipment | null>(null);

  const hubEquipment = equipment.filter((eq) => eq.hubId === selectedHubId);
  const hubStations = stations.filter((s) => s.hubId === selectedHubId);

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.04em] text-teal">
              {language === 'bn' ? 'চিকিৎসা সরঞ্জাম ও স্টেশন' : 'CERTIFIED DEVICES & STATION INVENTORY'}
            </span>
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navEquipment}
          </h1>
          <p className="mt-1 text-sm text-slate">
            {language === 'bn'
              ? 'পরিমাপ ডিভাইসের নিয়মিত ক্যালিব্রেশন, ব্যাটারি ও সার্ভিসিং স্থিতি'
              : 'Medical device calibration schedules, maintenance logs & physical station readiness'}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => showToast('Biomedical engineer maintenance schedule requested.')}
          icon={<PhArrowsClockwise size={16} />}
        >
          {language === 'bn' ? 'ক্যালিব্রেশন রিপোর্ট' : 'Calibration Report'}
        </Button>
      </div>

      {/* Physical Stations Section */}
      <div className="mb-8">
        <h2 className="mb-3.5 text-lg font-semibold text-ink">
          {language === 'bn' ? 'হাবের সক্রিয় স্টেশনসমূহ' : 'Physical Service Stations'}
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {hubStations.map((station) => (
            <Card key={station.id} variant="card" className="p-4.5!">
              <div className="mb-2.5 flex items-start justify-between">
                <span className="text-xs font-semibold text-slate">
                  {station.stationType.toUpperCase()}
                </span>
                <StatusPill
                  label={station.status}
                  variant={station.status === 'available' ? 'available' : station.status === 'busy' ? 'busy' : 'draft'}
                />
              </div>

              <h3 className="mb-1 mt-0 text-[15px] font-semibold text-ink">
                {station.name}
              </h3>
              <div className="mb-3.5 text-[13px] text-slate">
                Assigned: <strong className="text-ink">{station.currentStaffName}</strong>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    toggleStationStatus(
                      station.id,
                      station.status === 'out_of_service' ? 'available' : 'out_of_service'
                    )
                  }
                  className={`w-full cursor-pointer rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold ${
                    station.status === 'out_of_service' ? 'text-ok' : 'text-bad'
                  }`}
                >
                  {station.status === 'out_of_service' ? 'Set Available' : 'Set Out of Service'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Certified Medical Devices Section */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="m-0 text-lg font-semibold text-ink">
            {language === 'bn' ? 'চিকিৎসা সরঞ্জাম তালিকা ও ক্যালিব্রেশন' : 'Device Registry & Calibration Status'}
          </h2>
          <span className="text-[13px] text-slate">
            Total Registered: <strong>{hubEquipment.length} devices</strong>
          </span>
        </div>

        <Card variant="card" className="p-0! overflow-hidden">
          <table className="w-full border-collapse text-left font-ui">
            <thead>
              <tr className="border-b border-line bg-bone">
                <th className={thClass}>
                  Device Code &amp; Name
                </th>
                <th className={thClass}>
                  Model / Serial
                </th>
                <th className={thClass}>
                  Station Assigned
                </th>
                <th className={thClass}>
                  Last Calibrated
                </th>
                <th className={thClass}>
                  Next Calibration
                </th>
                <th className={thClass}>
                  Status
                </th>
                <th className={`${thClass} text-right`}>
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {hubEquipment.map((eq, idx) => (
                <tr
                  key={eq.id}
                  className={`transition-colors duration-100 hover:bg-bone ${
                    idx === hubEquipment.length - 1 ? '' : 'border-b border-line'
                  }`}
                >
                  {/* Code & Name */}
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-ink">
                      {eq.name}
                    </div>
                    <div className="text-xs font-semibold text-teal">
                      Code: {eq.code}
                    </div>
                  </td>

                  {/* Model & Serial */}
                  <td className="px-5 py-4 text-[13px] text-slate">
                    <div>{eq.model}</div>
                    <div className="tabular-nums text-[11px] text-slate">
                      S/N: {eq.serialNumber}
                    </div>
                  </td>

                  {/* Station */}
                  <td className="px-5 py-4 text-[13px] text-ink">
                    {eq.stationName || 'Inventory Buffer'}
                  </td>

                  {/* Last Calibration */}
                  <td className="tabular-nums px-5 py-4 text-[13px] text-slate">
                    {eq.lastCalibrationDate}
                  </td>

                  {/* Next Calibration */}
                  <td className="px-5 py-4">
                    <span
                      className={`tabular-nums text-[13px] ${
                        eq.status === 'calibration_due' ? 'font-bold text-bad' : 'font-medium text-ink'
                      }`}
                    >
                      {eq.nextCalibrationDue}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusPill
                      label={eq.status.replace('_', ' ')}
                      variant={
                        eq.status === 'assigned' || eq.status === 'available'
                          ? 'available'
                          : eq.status === 'calibration_due'
                          ? 'calibration_due'
                          : 'declined'
                      }
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedDevice(eq)}
                        className="cursor-pointer rounded-lg border border-line bg-paper px-3 py-1.5 text-[13px] font-semibold text-teal"
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          toggleEquipmentStatus(
                            eq.id,
                            eq.status === 'out_of_service' ? 'available' : 'out_of_service'
                          )
                        }
                        className={`cursor-pointer rounded-lg border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold ${
                          eq.status === 'out_of_service' ? 'text-ok' : 'text-bad'
                        }`}
                      >
                        {eq.status === 'out_of_service' ? 'Enable' : 'Halt'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Device Inspection Drawer */}
      {selectedDevice && (
        <ModalSheet
          isOpen={!!selectedDevice}
          onClose={() => setSelectedDevice(null)}
          title={`Device Audit: ${selectedDevice.name}`}
          subtitle={`Serial Number: ${selectedDevice.serialNumber}`}
        >
          <div className="flex flex-col gap-4">
            <div className="rounded-ctl bg-bone p-4">
              <div className="mb-2 text-[13px] font-semibold text-ink">
                Device Calibration &amp; Battery State
              </div>
              <div className="text-[13px] leading-[1.7] text-slate">
                • <strong>Equipment Code:</strong> {selectedDevice.code}
                <br />
                • <strong>Category:</strong> {selectedDevice.category.toUpperCase()}
                <br />
                • <strong>Battery Level:</strong> {selectedDevice.batteryPercent}% (Normal operating range)
                <br />
                • <strong>Last Certified:</strong> {selectedDevice.lastCalibrationDate}
                <br />
                • <strong>Next Recalibration Due:</strong> {selectedDevice.nextCalibrationDue}
              </div>
            </div>

            {selectedDevice.notes && (
              <div className="rounded-xl bg-mist p-3.5 text-[13px] text-pine">
                <strong>Quality Procedure Note:</strong> {selectedDevice.notes}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button variant="secondary" onClick={() => setSelectedDevice(null)}>
                Close Inspection
              </Button>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
