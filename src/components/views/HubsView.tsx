import React, { useState } from 'react';
import {
  PhHospital,
  PhMapPin,
  PhCheckCircle,
  PhPlus,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { Hub } from '../../types';

export const HubsView: React.FC = () => {
  const { t, language, hubs, selectedHubId, setSelectedHubId, showToast } = useApp();
  const [selectedHubForEdit, setSelectedHubForEdit] = useState<Hub | null>(null);

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'bn' ? 'ভৌগোলিক অবকাঠামো' : 'PHYSICAL CATCHMENT INFRASTRUCTURE'}
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
            {t.navHubs}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#5B6B6E', fontSize: '14px' }}>
            {language === 'bn'
              ? 'নির্ধারিত ভৌগোলিক এলাকাভিত্তিক স্থায়ী ও আউটরিচ কেন্দ্রসমূহ'
              : 'Configured physical service hubs serving district and upazila catchment areas'}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => showToast('New hub onboarding workflow initiated with Regional Operations.')}
          icon={<PhPlus size={16} />}
        >
          {language === 'bn' ? 'নতুন হাব যুক্ত করুন' : 'Add New Hub'}
        </Button>
      </div>

      {/* Hub Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
        {hubs.map((hub) => {
          const isSelected = hub.id === selectedHubId;

          return (
            <Card
              key={hub.id}
              variant="card"
              style={{
                border: isSelected ? '2px solid #1D6B66' : '1px solid #DDE5E1',
                position: 'relative',
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#1D6B66',
                    color: '#FFFFFF',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  <PhCheckCircle size={12} color="#FFFFFF" />
                  Active Selection
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '14px',
                    backgroundColor: '#CFE0D8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0F3D3A',
                    flexShrink: 0,
                  }}
                >
                  <PhHospital size={24} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        backgroundColor: '#0B1F22',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {hub.code}
                    </span>
                    <StatusPill
                      label={hub.status.toUpperCase()}
                      variant={hub.status === 'active' ? 'active' : 'paused'}
                    />
                  </div>

                  <h2 style={{ margin: '6px 0 2px 0', fontSize: '18px', fontWeight: 600, color: '#0B1F22' }}>
                    {language === 'bn' ? hub.nameBn : hub.name}
                  </h2>
                  <div style={{ fontSize: '13px', color: '#5B6B6E' }}>
                    {hub.district}, {hub.division} • Upazila: {hub.upazila} ({hub.unionName})
                  </div>
                </div>
              </div>

              {/* Catchment & Address */}
              <div style={{ backgroundColor: '#F5F3EE', padding: '14px', borderRadius: '14px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#0F3D3A', marginBottom: '4px' }}>
                  <PhMapPin size={16} color="#1D6B66" />
                  <span style={{ fontWeight: 600 }}>Physical Address:</span>
                </div>
                <div style={{ fontSize: '13px', color: '#5B6B6E', paddingLeft: '22px' }}>
                  {language === 'bn' ? hub.addressBn : hub.address}
                </div>
                <div style={{ fontSize: '12px', color: '#5B6B6E', paddingLeft: '22px', marginTop: '4px' }}>
                  Operating: {hub.operatingHours} • Contact: {hub.phone}
                </div>
              </div>

              {/* Emergency Referral Hospital (PRD Section 8.3 & 13.3) */}
              <div style={{ borderLeft: '3px solid #C0633F', paddingLeft: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#C0633F', textTransform: 'uppercase' }}>
                  {language === 'bn' ? 'জরুরি রেফারেল হাসপাতাল যোগাযোগ' : 'Emergency Referral Facility SOP'}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F22' }}>
                  {hub.emergencyReferralFacility}
                </div>
                <div style={{ fontSize: '12px', color: '#5B6B6E' }}>
                  Direct Medical Hotline: {hub.emergencyPhone}
                </div>
              </div>

              {/* Services offered badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {hub.services.map((srv) => (
                  <span
                    key={srv}
                    style={{
                      fontSize: '11px',
                      backgroundColor: '#E6EEEA',
                      color: '#0F3D3A',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontWeight: 500,
                    }}
                  >
                    {srv}
                  </span>
                ))}
              </div>

              {/* Footer details & Action */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #DDE5E1' }}>
                <div style={{ fontSize: '13px', color: '#5B6B6E' }}>
                  Manager: <strong style={{ color: '#0B1F22' }}>{hub.assignedManager}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isSelected ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHubId(hub.id);
                        showToast(`Switched active operational console to: ${hub.name}`);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        backgroundColor: '#0B1F22',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {language === 'bn' ? 'এই হাব নির্বাচন করুন' : 'Select This Hub'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedHubForEdit(hub)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        backgroundColor: '#F5F3EE',
                        border: '1px solid #DDE5E1',
                        color: '#0B1F22',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {language === 'bn' ? 'প্রোফাইল সম্পাদন' : 'Edit Profile'}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Edit Hub Profile Drawer */}
      {selectedHubForEdit && (
        <ModalSheet
          isOpen={!!selectedHubForEdit}
          onClose={() => setSelectedHubForEdit(null)}
          title={`Edit Hub Profile: ${selectedHubForEdit.name}`}
          subtitle="Update catchment, operating hours, and emergency escalation protocol"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Operating Hours
              </label>
              <input
                type="text"
                defaultValue={selectedHubForEdit.operatingHours}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '10px',
                  border: '1px solid #DDE5E1',
                  padding: '0 12px',
                  fontSize: '14px',
                  fontFamily: 'var(--ui)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Emergency Referral Hospital SOP
              </label>
              <input
                type="text"
                defaultValue={selectedHubForEdit.emergencyReferralFacility}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '10px',
                  border: '1px solid #DDE5E1',
                  padding: '0 12px',
                  fontSize: '14px',
                  fontFamily: 'var(--ui)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '6px' }}>
                Emergency Liaison Direct Phone
              </label>
              <input
                type="text"
                defaultValue={selectedHubForEdit.emergencyPhone}
                style={{
                  width: '100%',
                  height: '46px',
                  borderRadius: '10px',
                  border: '1px solid #DDE5E1',
                  padding: '0 12px',
                  fontSize: '14px',
                  fontFamily: 'var(--ui)',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => setSelectedHubForEdit(null)}>
                {t.cancel}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  showToast('Hub operational profile updated successfully.');
                  setSelectedHubForEdit(null);
                }}
              >
                {t.save}
              </Button>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
