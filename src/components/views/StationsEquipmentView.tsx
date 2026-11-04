import React, { useState } from 'react';
import {
  PhArrowsClockwise,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { HubEquipment } from '../../types';

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
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'bn' ? 'চিকিৎসা সরঞ্জাম ও স্টেশন' : 'CERTIFIED DEVICES & STATION INVENTORY'}
            </span>
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
            {t.navEquipment}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#5B6B6E', fontSize: '14px' }}>
            {language === 'bn'
              ? 'পরিমাপ ডিভাইসের নিয়মিত ক্যালিব্রেশন, ব্যাটারি ও সার্ভিসিং স্থিতি'
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
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F22', marginBottom: '14px' }}>
          {language === 'bn' ? 'হাবের সক্রিয় স্টেশনসমূহ' : 'Physical Service Stations'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {hubStations.map((station) => (
            <Card key={station.id} variant="card" style={{ padding: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#5B6B6E' }}>
                  {station.stationType.toUpperCase()}
                </span>
                <StatusPill
                  label={station.status}
                  variant={station.status === 'available' ? 'available' : station.status === 'busy' ? 'busy' : 'draft'}
                />
              </div>

              <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 600, color: '#0B1F22' }}>
                {station.name}
              </h3>
              <div style={{ fontSize: '13px', color: '#5B6B6E', marginBottom: '14px' }}>
                Assigned: <strong style={{ color: '#0B1F22' }}>{station.currentStaffName}</strong>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() =>
                    toggleStationStatus(
                      station.id,
                      station.status === 'out_of_service' ? 'available' : 'out_of_service'
                    )
                  }
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #DDE5E1',
                    backgroundColor: '#FFFFFF',
                    color: station.status === 'out_of_service' ? '#2F855A' : '#C53030',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                  }}
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0B1F22', margin: 0 }}>
            {language === 'bn' ? 'চিকিৎসা সরঞ্জাম তালিকা ও ক্যালিব্রেশন' : 'Device Registry & Calibration Status'}
          </h2>
          <span style={{ fontSize: '13px', color: '#5B6B6E' }}>
            Total Registered: <strong>{hubEquipment.length} devices</strong>
          </span>
        </div>

        <Card variant="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--ui)' }}>
            <thead>
              <tr style={{ backgroundColor: '#F5F3EE', borderBottom: '1px solid #DDE5E1' }}>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Device Code &amp; Name
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Model / Serial
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Station Assigned
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Last Calibrated
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Next Calibration
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase' }}>
                  Status
                </th>
                <th style={{ padding: '14px 20px', fontSize: '12px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase', textAlign: 'right' }}>
                  {t.actions}
                </th>
              </tr>
            </thead>
            <tbody>
              {hubEquipment.map((eq, idx) => (
                <tr
                  key={eq.id}
                  style={{
                    borderBottom: idx === hubEquipment.length - 1 ? 'none' : '1px solid #DDE5E1',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F5F3EE')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {/* Code & Name */}
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600, fontSize: '14px', color: '#0B1F22' }}>
                      {eq.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#1D6B66', fontWeight: 600 }}>
                      Code: {eq.code}
                    </div>
                  </td>

                  {/* Model & Serial */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5B6B6E' }}>
                    <div>{eq.model}</div>
                    <div className="num-tabular" style={{ fontSize: '11px', color: '#5B6B6E' }}>
                      S/N: {eq.serialNumber}
                    </div>
                  </td>

                  {/* Station */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#0B1F22' }}>
                    {eq.stationName || 'Inventory Buffer'}
                  </td>

                  {/* Last Calibration */}
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: '#5B6B6E' }} className="num-tabular">
                    {eq.lastCalibrationDate}
                  </td>

                  {/* Next Calibration */}
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        fontSize: '13px',
                        color: eq.status === 'calibration_due' ? '#C53030' : '#0B1F22',
                        fontWeight: eq.status === 'calibration_due' ? 700 : 500,
                      }}
                      className="num-tabular"
                    >
                      {eq.nextCalibrationDue}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '16px 20px' }}>
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
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedDevice(eq)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid #DDE5E1',
                          backgroundColor: '#FFFFFF',
                          color: '#1D6B66',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
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
                        style={{
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: '1px solid #DDE5E1',
                          backgroundColor: '#FFFFFF',
                          color: eq.status === 'out_of_service' ? '#2F855A' : '#C53030',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F5F3EE', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F22', marginBottom: '8px' }}>
                Device Calibration &amp; Battery State
              </div>
              <div style={{ fontSize: '13px', color: '#5B6B6E', lineHeight: 1.7 }}>
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
              <div style={{ backgroundColor: '#E6EEEA', padding: '14px', borderRadius: '12px', fontSize: '13px', color: '#0F3D3A' }}>
                <strong>Quality Procedure Note:</strong> {selectedDevice.notes}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
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
