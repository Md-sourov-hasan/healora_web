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
import { useApp } from '../../context/useApp';
import type { Hub } from '../../types';

export const HubsView: React.FC = () => {
  const { t, language, hubs, selectedHubId, setSelectedHubId, showToast } = useApp();
  const [selectedHubForEdit, setSelectedHubForEdit] = useState<Hub | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.04em] text-teal">
              {language === 'bn' ? 'ভৌগোলিক অবকাঠামো' : 'PHYSICAL CATCHMENT INFRASTRUCTURE'}
            </span>
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navHubs}
          </h1>
          <p className="mt-1 text-sm text-slate">
            {language === 'bn'
              ? 'নির্ধারিত ভৌগোলিক এলাকাভিত্তিক স্থায়ী ও আউটরিচ কেন্দ্রসমূহ'
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
      <div className="grid grid-cols-2 gap-6">
        {hubs.map((hub) => {
          const isSelected = hub.id === selectedHubId;

          return (
            <Card
              key={hub.id}
              variant="card"
              className={`relative ${isSelected ? 'border-2! border-teal!' : 'border! border-line!'}`}
            >
              {isSelected && (
                <div className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-md bg-teal px-2 py-0.75 text-[11px] font-semibold text-white">
                  <PhCheckCircle size={12} color="#FFFFFF" />
                  Active Selection
                </div>
              )}

              <div className="mb-4 flex items-start gap-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-ctl bg-sage-200 text-pine">
                  <PhHospital size={24} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {hub.code}
                    </span>
                    <StatusPill
                      label={hub.status.toUpperCase()}
                      variant={hub.status === 'active' ? 'active' : 'paused'}
                    />
                  </div>

                  <h2 className="mb-0.5 mt-1.5 text-lg font-semibold text-ink">
                    {language === 'bn' ? hub.nameBn : hub.name}
                  </h2>
                  <div className="text-[13px] text-slate">
                    {hub.district}, {hub.division} • Upazila: {hub.upazila} ({hub.unionName})
                  </div>
                </div>
              </div>

              {/* Catchment & Address */}
              <div className="mb-4 rounded-ctl bg-bone p-3.5">
                <div className="mb-1 flex items-center gap-1.5 text-[13px] text-pine">
                  <PhMapPin size={16} color="#1D6B66" />
                  <span className="font-semibold">Physical Address:</span>
                </div>
                <div className="pl-5.5 text-[13px] text-slate">
                  {language === 'bn' ? hub.addressBn : hub.address}
                </div>
                <div className="mt-1 pl-5.5 text-xs text-slate">
                  Operating: {hub.operatingHours} • Contact: {hub.phone}
                </div>
              </div>

              {/* Emergency Referral Hospital (PRD Section 8.3 & 13.3) */}
              <div className="mb-4 border-l-3 border-clay pl-3">
                <div className="text-[11px] font-bold uppercase text-clay">
                  {language === 'bn' ? 'জরুরি রেফারেল হাসপাতাল যোগাযোগ' : 'Emergency Referral Facility SOP'}
                </div>
                <div className="text-[13px] font-semibold text-ink">
                  {hub.emergencyReferralFacility}
                </div>
                <div className="text-xs text-slate">
                  Direct Medical Hotline: {hub.emergencyPhone}
                </div>
              </div>

              {/* Services offered badges */}
              <div className="mb-5 flex flex-wrap gap-1.5">
                {hub.services.map((srv) => (
                  <span
                    key={srv}
                    className="rounded-md bg-mist px-2 py-0.75 text-[11px] font-medium text-pine"
                  >
                    {srv}
                  </span>
                ))}
              </div>

              {/* Footer details & Action */}
              <div className="flex items-center justify-between border-t border-line pt-4">
                <div className="text-[13px] text-slate">
                  Manager: <strong className="text-ink">{hub.assignedManager}</strong>
                </div>

                <div className="flex items-center gap-2">
                  {!isSelected ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHubId(hub.id);
                        showToast(`Switched active operational console to: ${hub.name}`);
                      }}
                      className="cursor-pointer rounded-chip border-none bg-ink px-4 py-2 text-[13px] font-semibold text-white"
                    >
                      {language === 'bn' ? 'এই হাব নির্বাচন করুন' : 'Select This Hub'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedHubForEdit(hub)}
                      className="cursor-pointer rounded-chip border border-line bg-bone px-4 py-2 text-[13px] font-semibold text-ink"
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
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Operating Hours
              </label>
              <input
                type="text"
                defaultValue={selectedHubForEdit.operatingHours}
                className="h-11.5 w-full rounded-chip border border-line px-3 font-ui text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Emergency Referral Hospital SOP
              </label>
              <input
                type="text"
                defaultValue={selectedHubForEdit.emergencyReferralFacility}
                className="h-11.5 w-full rounded-chip border border-line px-3 font-ui text-sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-slate">
                Emergency Liaison Direct Phone
              </label>
              <input
                type="text"
                defaultValue={selectedHubForEdit.emergencyPhone}
                className="h-11.5 w-full rounded-chip border border-line px-3 font-ui text-sm"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2.5">
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
