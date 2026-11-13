import React, { useState } from 'react';
import { PhHospital, PhMapPin, PhPlus } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
import type { Hub } from '../../types';

export const HubsView: React.FC = () => {
  const { t, language, hubs, regions, selectedHubId, setSelectedHubId, addHub, updateHubProfile } = useApp();
  const [isAddHubOpen, setIsAddHubOpen] = useState(false);
  const [selectedHubForEdit, setSelectedHubForEdit] = useState<Hub | null>(null);
  const [hubName, setHubName] = useState('');
  const [hubCode, setHubCode] = useState('');
  const [regionId, setRegionId] = useState('');
  const [hubAddress, setHubAddress] = useState('');
  const [hubPhone, setHubPhone] = useState('');
  const [hubReferral, setHubReferral] = useState('');
  const [hubEmergencyPhone, setHubEmergencyPhone] = useState('');
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editReferral, setEditReferral] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');

  const resetAddForm = () => {
    setHubName(''); setHubCode(''); setRegionId(''); setHubAddress(''); setHubPhone(''); setHubReferral(''); setHubEmergencyPhone('');
  };

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await addHub({
      name: hubName, code: hubCode, regionId, address: hubAddress, phone: hubPhone,
      emergencyReferralFacility: hubReferral, emergencyPhone: hubEmergencyPhone,
    });
    if (ok) { setIsAddHubOpen(false); resetAddForm(); }
  };

  const beginEdit = (hub: Hub) => {
    setSelectedHubForEdit(hub);
    setEditName(hub.name);
    setEditAddress(hub.address);
    setEditPhone(hub.phone);
    setEditReferral(hub.emergencyReferralFacility);
    setEditEmergencyPhone(hub.emergencyPhone);
  };

  const handleUpdate = async () => {
    if (!selectedHubForEdit) return;
    const ok = await updateHubProfile(selectedHubForEdit.id, {
      name: editName, address: editAddress, phone: editPhone,
      emergencyReferralFacility: editReferral, emergencyPhone: editEmergencyPhone,
    });
    if (ok) setSelectedHubForEdit(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">Physical hub directory</div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navHubs}</h1>
          <p className="mt-1 text-sm text-slate">Hub records and assigned regions loaded from the API.</p>
        </div>
        <Button variant="primary" onClick={() => setIsAddHubOpen(true)} icon={<PhPlus size={16} />}>Add New Hub</Button>
      </div>

      {hubs.length === 0 ? (
        <Card variant="card"><p className="m-0 text-sm text-slate">No hubs were returned for this account.</p></Card>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {hubs.map((hub) => {
            const region = regions.find((item) => item.id === hub.regionId);
            const selected = hub.id === selectedHubId;
            return (
              <Card key={hub.id} variant="card" className={selected ? 'border-2! border-teal!' : ''}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2"><span className="rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-bold text-white">{hub.code}</span><StatusPill label={hub.status.replaceAll('_', ' ').toUpperCase()} variant={hub.status === 'active' ? 'active' : 'paused'} /></div>
                    <h2 className="mb-1 mt-2 text-lg font-semibold text-ink">{language === 'bn' ? hub.nameBn || hub.name : hub.name}</h2>
                    <div className="text-sm text-slate">{region?.name ?? 'Region not available'}</div>
                  </div>
                  <PhHospital size={24} />
                </div>
                <div className="mt-4 rounded-xl bg-bone p-3.5">
                  <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-pine"><PhMapPin size={16} />Address</div>
                  <div className="text-sm text-slate">{language === 'bn' ? hub.addressBn || hub.address : hub.address}</div>
                  {hub.phone && <div className="mt-1 text-xs text-slate">Contact: {hub.phone}</div>}
                </div>
                {(hub.emergencyReferralFacility || hub.emergencyPhone) && (
                  <div className="mt-3 border-l-3 border-clay pl-3 text-sm">
                    <div className="font-semibold text-ink">{hub.emergencyReferralFacility || 'Referral facility not set'}</div>
                    {hub.emergencyPhone && <div className="text-xs text-slate">{hub.emergencyPhone}</div>}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-sm text-slate">Manager: {hub.assignedManager || 'Not assigned'}</span>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => beginEdit(hub)}>Edit profile</Button>
                    {!selected && <Button variant="primary" onClick={() => setSelectedHubId(hub.id)}>Select hub</Button>}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ModalSheet isOpen={isAddHubOpen} onClose={() => setIsAddHubOpen(false)} title="Create Hub">
        <form onSubmit={handleAdd} className="space-y-3">
          <label className="block text-xs font-semibold text-slate">Hub name *<input required value={hubName} onChange={(e) => setHubName(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Hub code *<input required value={hubCode} onChange={(e) => setHubCode(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Region *<select required value={regionId} onChange={(e) => setRegionId(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"><option value="">Select region</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name} ({region.code})</option>)}</select></label>
          <label className="block text-xs font-semibold text-slate">Address *<input required value={hubAddress} onChange={(e) => setHubAddress(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Contact phone<input value={hubPhone} onChange={(e) => setHubPhone(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Referral facility<input value={hubReferral} onChange={(e) => setHubReferral(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Referral contact phone<input value={hubEmergencyPhone} onChange={(e) => setHubEmergencyPhone(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <div className="flex justify-end gap-2 pt-2"><Button variant="secondary" onClick={() => setIsAddHubOpen(false)}>Cancel</Button><Button variant="primary" type="submit">Create hub</Button></div>
        </form>
      </ModalSheet>

      <ModalSheet isOpen={!!selectedHubForEdit} onClose={() => setSelectedHubForEdit(null)} title="Edit hub profile">
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate">Hub name<input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Address<input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Contact phone<input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Referral facility<input value={editReferral} onChange={(e) => setEditReferral(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Referral contact phone<input value={editEmergencyPhone} onChange={(e) => setEditEmergencyPhone(e.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <div className="flex justify-end gap-2 pt-2"><Button variant="secondary" onClick={() => setSelectedHubForEdit(null)}>Cancel</Button><Button variant="primary" onClick={handleUpdate}>Save changes</Button></div>
        </div>
      </ModalSheet>
    </div>
  );
};