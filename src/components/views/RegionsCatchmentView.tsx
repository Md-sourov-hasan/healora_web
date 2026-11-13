import React, { useState } from 'react';
import { PhGlobe, PhPlus } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/useApp';
import type { Region } from '../../types';

const levels: NonNullable<Region['level']>[] = ['operational_region', 'division', 'district', 'upazila', 'union', 'ward', 'village'];

export const RegionsCatchmentView: React.FC = () => {
  const { t, regions, catchments, hubs, selectedHubId, addRegion, addCatchment } = useApp();
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [isAddCatchmentOpen, setIsAddCatchmentOpen] = useState(false);
  const [regionCode, setRegionCode] = useState('');
  const [regionName, setRegionName] = useState('');
  const [regionLevel, setRegionLevel] = useState<NonNullable<Region['level']> | ''>('');
  const [parentId, setParentId] = useState('');
  const [catchmentRegionId, setCatchmentRegionId] = useState('');
  const [catchmentHubId, setCatchmentHubId] = useState(selectedHubId);

  const handleCreateRegion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!regionLevel) return;
    const ok = await addRegion({ code: regionCode, name: regionName, level: regionLevel, parentId: parentId || undefined });
    if (ok) { setRegionCode(''); setRegionName(''); setRegionLevel(''); setParentId(''); setIsAddRegionOpen(false); }
  };

  const handleCreateCatchment = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await addCatchment({ hubId: catchmentHubId, regionId: catchmentRegionId });
    if (ok) { setCatchmentRegionId(''); setIsAddCatchmentOpen(false); }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">Geographic service regions</div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navRegions}</h1>
          <p className="mt-1 text-sm text-slate">Regions and hub catchments returned by the API.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsAddRegionOpen(true)} icon={<PhGlobe size={16} />}>Add Region</Button>
          <Button variant="primary" onClick={() => setIsAddCatchmentOpen(true)} icon={<PhPlus size={16} />}>Assign Catchment</Button>
        </div>
      </div>

      <h2 className="mb-3 text-lg font-semibold text-ink">Regions ({regions.length})</h2>
      {regions.length === 0 ? <Card variant="card"><p className="m-0 text-sm text-slate">No regions are available to this account.</p></Card> : (
        <div className="mb-8 grid grid-cols-3 gap-4">
          {regions.map((region) => (
            <Card key={region.id} variant="card">
              <div className="flex items-center justify-between"><span className="rounded bg-ink px-2 py-1 text-xs text-white">{region.code}</span><span className="text-xs text-slate">{region.level?.replaceAll('_', ' ') ?? 'Level unavailable'}</span></div>
              <h3 className="mb-1 mt-3 text-base font-semibold text-ink">{region.name}</h3>
              <p className="m-0 text-sm text-slate">Hubs: {region.totalHubsCount ?? '—'} · Active: {region.activeHubsCount ?? '—'}</p>
            </Card>
          ))}
        </div>
      )}

      <h2 className="mb-3 text-lg font-semibold text-ink">Hub catchments ({catchments.length})</h2>
      {catchments.length === 0 ? <Card variant="card"><p className="m-0 text-sm text-slate">No catchments were returned for the selected hub.</p></Card> : (
        <div className="grid grid-cols-2 gap-4">
          {catchments.map((item) => (
            <Card key={item.id} variant="card">
              <h3 className="mb-1 mt-0 text-base font-semibold text-ink">{item.name || regions.find((region) => region.id === item.regionId)?.name || item.regionId}</h3>
              <p className="m-0 text-sm text-slate">{item.hubName || hubs.find((hub) => hub.id === item.hubId)?.name || item.hubId}</p>
              <p className="mb-0 mt-2 text-xs text-slate">Region ID: {item.regionId}</p>
            </Card>
          ))}
        </div>
      )}

      <ModalSheet isOpen={isAddRegionOpen} onClose={() => setIsAddRegionOpen(false)} title="Create Region">
        <form onSubmit={handleCreateRegion} className="space-y-3">
          <label className="block text-xs font-semibold text-slate">Code *<input required value={regionCode} onChange={(event) => setRegionCode(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Name *<input required value={regionName} onChange={(event) => setRegionName(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal" /></label>
          <label className="block text-xs font-semibold text-slate">Administrative level *<select required value={regionLevel} onChange={(event) => setRegionLevel(event.target.value as NonNullable<Region['level']>)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"><option value="">Select level</option>{levels.map((level) => <option key={level} value={level}>{level.replaceAll('_', ' ')}</option>)}</select></label>
          <label className="block text-xs font-semibold text-slate">Parent region<select value={parentId} onChange={(event) => setParentId(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"><option value="">No parent</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name} ({region.code})</option>)}</select></label>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setIsAddRegionOpen(false)}>Cancel</Button><Button variant="primary" type="submit">Create region</Button></div>
        </form>
      </ModalSheet>

      <ModalSheet isOpen={isAddCatchmentOpen} onClose={() => setIsAddCatchmentOpen(false)} title="Assign Hub Catchment">
        <form onSubmit={handleCreateCatchment} className="space-y-3">
          <label className="block text-xs font-semibold text-slate">Hub *<select required value={catchmentHubId} onChange={(event) => setCatchmentHubId(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"><option value="">Select hub</option>{hubs.map((hub) => <option key={hub.id} value={hub.id}>{hub.name}</option>)}</select></label>
          <label className="block text-xs font-semibold text-slate">Region *<select required value={catchmentRegionId} onChange={(event) => setCatchmentRegionId(event.target.value)} className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"><option value="">Select region</option>{regions.map((region) => <option key={region.id} value={region.id}>{region.name} ({region.code})</option>)}</select></label>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setIsAddCatchmentOpen(false)}>Cancel</Button><Button variant="primary" type="submit">Assign catchment</Button></div>
        </form>
      </ModalSheet>
    </div>
  );
};