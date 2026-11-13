import React, { useEffect, useState, useCallback } from 'react';
import { PhGlobe, PhPlus, PhArrowsClockwise } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { SegmentedTabs } from '../common/Tabs';
import { useApp } from '../../context/useApp';
import type { Region } from '../../types';
import { regionsService, type ApiRegion } from '../../services/regionsService';
import { hubsService } from '../../services/hubsService';

const levels: NonNullable<Region['level']>[] = [
  'operational_region',
  'division',
  'district',
  'upazila',
  'union',
  'ward',
  'village',
];

export const RegionsCatchmentView: React.FC = () => {
  const {
    t,
    regions,
    catchments,
    hubs,
    selectedHubId,
    addRegion,
    addCatchment,
    refreshBackendData,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'directory' | 'tree' | 'catchments'>('directory');
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [isAddCatchmentOpen, setIsAddCatchmentOpen] = useState(false);
  const [regionCode, setRegionCode] = useState('');
  const [regionName, setRegionName] = useState('');
  const [regionNameBn, setRegionNameBn] = useState('');
  const [regionLevel, setRegionLevel] = useState<NonNullable<Region['level']> | ''>('');
  const [parentId, setParentId] = useState('');
  const [catchmentRegionId, setCatchmentRegionId] = useState('');
  const [catchmentHubId, setCatchmentHubId] = useState(selectedHubId);

  // Tree state
  const [treeNodes, setTreeNodes] = useState<ApiRegion[]>([]);
  const [loadingTree, setLoadingTree] = useState(false);

  // Edit / Inspect Region modal state
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [liveRegionDetail, setLiveRegionDetail] = useState<ApiRegion | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameBn, setEditNameBn] = useState('');
  const [editLevel, setEditLevel] = useState<NonNullable<Region['level']>>('upazila');
  const [editParentId, setEditParentId] = useState('');
  const [deactivateReason, setDeactivateReason] = useState('');
  const [regionBusy, setRegionBusy] = useState(false);

  const loadTree = useCallback(async () => {
    setLoadingTree(true);
    try {
      const nodes = await regionsService.getRegionTree();
      setTreeNodes(nodes);
    } catch {
      setTreeNodes([]);
    } finally {
      setLoadingTree(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'tree') {
      void loadTree();
    }
  }, [activeTab, loadTree]);

  const handleCreateRegion = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!regionLevel) return;
    const ok = await addRegion({
      code: regionCode,
      name: regionName,
      level: regionLevel,
      parentId: parentId || undefined,
    });
    if (ok) {
      setRegionCode('');
      setRegionName('');
      setRegionNameBn('');
      setRegionLevel('');
      setParentId('');
      setIsAddRegionOpen(false);
      if (activeTab === 'tree') void loadTree();
    }
  };

  const handleCreateCatchment = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await addCatchment({ hubId: catchmentHubId, regionId: catchmentRegionId });
    if (ok) {
      setCatchmentRegionId('');
      setIsAddCatchmentOpen(false);
    }
  };

  const openInspectRegion = async (region: Region) => {
    setEditingRegion(region);
    setEditName(region.name);
    setEditNameBn(region.nameBn || '');
    setEditLevel((region.level as NonNullable<Region['level']>) || 'upazila');
    setEditParentId('');
    setDeactivateReason('');
    setLiveRegionDetail(null);
    setRegionBusy(true);
    try {
      const detail = await regionsService.getRegion(region.id);
      setLiveRegionDetail(detail);
      setEditName(detail.name);
      setEditNameBn(detail.nameBn || '');
      setEditLevel(detail.level);
      setEditParentId(detail.parentId || '');
    } catch {
      // fallback to list item
    } finally {
      setRegionBusy(false);
    }
  };

  const handleUpdateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegion) return;
    setRegionBusy(true);
    try {
      await regionsService.updateRegion(editingRegion.id, {
        name: editName.trim(),
        nameBn: editNameBn.trim() || undefined,
        level: editLevel,
        parentId: editParentId || null,
      });
      setEditingRegion(null);
      await refreshBackendData();
      if (activeTab === 'tree') void loadTree();
      showToast('Region updated.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update region.');
    } finally {
      setRegionBusy(false);
    }
  };

  const handleDeactivateRegion = async () => {
    if (!editingRegion) return;
    setRegionBusy(true);
    try {
      await regionsService.deactivateRegion(
        editingRegion.id,
        deactivateReason.trim() || 'Deactivated by regional administrator'
      );
      setEditingRegion(null);
      await refreshBackendData();
      if (activeTab === 'tree') void loadTree();
      showToast('Region deactivated.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to deactivate region.');
    } finally {
      setRegionBusy(false);
    }
  };

  const handleRemoveCatchment = async (hubId: string, regId: string) => {
    try {
      await hubsService.deleteCatchment(hubId, regId);
      await refreshBackendData();
      showToast('Catchment mapping removed.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to remove catchment.');
    }
  };

  const renderTreeNode = (node: ApiRegion, depth = 0): React.ReactNode => (
    <div key={node.id} className="space-y-1.5" style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center justify-between rounded-xl border border-line bg-paper px-3.5 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="rounded bg-ink px-2 py-0.5 font-mono text-[11px] font-bold text-white">
            {node.code}
          </span>
          <span className="font-semibold text-ink">{node.name}</span>
          {node.nameBn && <span className="text-slate">({node.nameBn})</span>}
          <span className="rounded bg-bone px-2 py-0.5 text-[11px] uppercase text-slate">
            {node.level.replaceAll('_', ' ')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill label={node.active ? 'ACTIVE' : 'INACTIVE'} variant={node.active ? 'active' : 'cancelled'} />
          <button
            type="button"
            onClick={() =>
              void openInspectRegion({
                id: node.id,
                code: node.code,
                name: node.name,
                nameBn: node.nameBn || '',
                level: node.level,
                status: node.active ? 'active' : 'inactive',
              })
            }
            className="cursor-pointer font-semibold text-teal hover:underline"
          >
            Edit
          </button>
        </div>
      </div>
      {node.children && node.children.map((child) => renderTreeNode(child, depth + 1))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">
            Geographic service regions & hierarchy
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navRegions}</h1>
          <p className="mt-1 text-sm text-slate">
            Administrative hierarchy, region lifecycle controls, and hub catchment assignments.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsAddRegionOpen(true)} icon={<PhGlobe size={16} />}>
            Add Region
          </Button>
          <Button variant="primary" onClick={() => setIsAddCatchmentOpen(true)} icon={<PhPlus size={16} />}>
            Assign Catchment
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <SegmentedTabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as 'directory' | 'tree' | 'catchments')}
          options={[
            { key: 'directory', label: 'Regions Directory', count: regions.length },
            { key: 'tree', label: 'Hierarchy Tree' },
            { key: 'catchments', label: 'Hub Catchments', count: catchments.length },
          ]}
        />
        {activeTab === 'tree' && (
          <Button variant="small" onClick={() => void loadTree()} icon={<PhArrowsClockwise size={14} />}>
            Refresh Tree
          </Button>
        )}
      </div>

      {activeTab === 'directory' && (
        <>
          {regions.length === 0 ? (
            <Card variant="card">
              <p className="m-0 text-sm text-slate">No regions are available to this account.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {regions.map((region) => (
                <Card key={region.id} variant="card">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-ink px-2 py-1 font-mono text-xs text-white">{region.code}</span>
                    <span className="text-xs uppercase text-slate">
                      {region.level?.replaceAll('_', ' ') ?? 'Level unavailable'}
                    </span>
                  </div>
                  <h3 className="mb-1 mt-3 text-base font-semibold text-ink">{region.name}</h3>
                  <p className="m-0 text-sm text-slate">
                    Hubs: {region.totalHubsCount ?? '—'} · Active: {region.activeHubsCount ?? '—'}
                  </p>
                  <div className="mt-4 flex justify-end border-t border-line pt-3">
                    <Button variant="small" onClick={() => void openInspectRegion(region)}>
                      Inspect & Edit
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'tree' && (
        <Card variant="card">
          {loadingTree ? (
            <p className="m-0 text-sm text-slate">Loading hierarchical region tree...</p>
          ) : treeNodes.length === 0 ? (
            <p className="m-0 text-sm text-slate">No region tree nodes returned.</p>
          ) : (
            <div className="space-y-2">{treeNodes.map((n) => renderTreeNode(n, 0))}</div>
          )}
        </Card>
      )}

      {activeTab === 'catchments' && (
        <>
          {catchments.length === 0 ? (
            <Card variant="card">
              <p className="m-0 text-sm text-slate">No catchments were returned for the selected hub.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {catchments.map((item) => (
                <Card key={item.id} variant="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 mt-0 text-base font-semibold text-ink">
                        {item.name || regions.find((region) => region.id === item.regionId)?.name || item.regionId}
                      </h3>
                      <p className="m-0 text-sm text-slate">
                        Hub: {item.hubName || hubs.find((hub) => hub.id === item.hubId)?.name || item.hubId}
                      </p>
                      <p className="mb-0 mt-2 font-mono text-xs text-slate">Region ID: {item.regionId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleRemoveCatchment(item.hubId, item.regionId)}
                      className="cursor-pointer rounded-lg border border-bad/40 px-2.5 py-1 text-xs font-semibold text-bad hover:bg-bad-bg"
                    >
                      Remove
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create Region Modal */}
      <ModalSheet isOpen={isAddRegionOpen} onClose={() => setIsAddRegionOpen(false)} title="Create Region">
        <form onSubmit={handleCreateRegion} className="space-y-3">
          <label className="block text-xs font-semibold text-slate">
            Code *
            <input
              required
              value={regionCode}
              onChange={(event) => setRegionCode(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Name *
            <input
              required
              value={regionName}
              onChange={(event) => setRegionName(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Name (Bangla)
            <input
              value={regionNameBn}
              onChange={(event) => setRegionNameBn(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Administrative level *
            <select
              required
              value={regionLevel}
              onChange={(event) => setRegionLevel(event.target.value as NonNullable<Region['level']>)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            >
              <option value="">Select level</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate">
            Parent region
            <select
              value={parentId}
              onChange={(event) => setParentId(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            >
              <option value="">No parent</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name} ({region.code})
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAddRegionOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create region
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Edit / Deactivate Region Modal */}
      {editingRegion && (
        <ModalSheet
          isOpen={!!editingRegion}
          onClose={() => setEditingRegion(null)}
          title={`Region Governance: ${editingRegion.name}`}
          subtitle={`Code: ${editingRegion.code} • Active: ${liveRegionDetail?.active !== false ? 'Yes' : 'No'}`}
        >
          <div className="space-y-4">
            <form onSubmit={handleUpdateRegion} className="space-y-3">
              <label className="block text-xs font-semibold text-slate">
                Region Name *
                <input
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
                />
              </label>
              <label className="block text-xs font-semibold text-slate">
                Region Name (Bangla)
                <input
                  value={editNameBn}
                  onChange={(e) => setEditNameBn(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
                />
              </label>
              <label className="block text-xs font-semibold text-slate">
                Administrative Level *
                <select
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value as NonNullable<Region['level']>)}
                  className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
                >
                  {levels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl.replaceAll('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate">
                Parent Region
                <select
                  value={editParentId}
                  onChange={(e) => setEditParentId(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
                >
                  <option value="">No parent</option>
                  {regions
                    .filter((r) => r.id !== editingRegion.id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                </select>
              </label>
              <div className="flex justify-end gap-2">
                <Button variant="primary" type="submit" disabled={regionBusy}>
                  Save Changes
                </Button>
              </div>
            </form>

            <div className="border-t border-line pt-3">
              <div className="mb-1.5 text-xs font-semibold text-bad">Deactivate Region</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={deactivateReason}
                  onChange={(e) => setDeactivateReason(e.target.value)}
                  placeholder="Deactivation reason..."
                  className="h-9 flex-1 rounded-xl border border-line px-3 text-xs"
                />
                <button
                  type="button"
                  disabled={regionBusy}
                  onClick={() => void handleDeactivateRegion()}
                  className="cursor-pointer rounded-xl border border-bad/40 bg-bad-bg px-3 py-1.5 text-xs font-semibold text-bad-fg"
                >
                  Deactivate
                </button>
              </div>
            </div>
          </div>
        </ModalSheet>
      )}

      {/* Assign Catchment Modal */}
      <ModalSheet
        isOpen={isAddCatchmentOpen}
        onClose={() => setIsAddCatchmentOpen(false)}
        title="Assign Hub Catchment"
      >
        <form onSubmit={handleCreateCatchment} className="space-y-3">
          <label className="block text-xs font-semibold text-slate">
            Hub *
            <select
              required
              value={catchmentHubId}
              onChange={(event) => setCatchmentHubId(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            >
              <option value="">Select hub</option>
              {hubs.map((hub) => (
                <option key={hub.id} value={hub.id}>
                  {hub.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-semibold text-slate">
            Region *
            <select
              required
              value={catchmentRegionId}
              onChange={(event) => setCatchmentRegionId(event.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            >
              <option value="">Select region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name} ({region.code})
                </option>
              ))}
            </select>
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsAddCatchmentOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Assign catchment
            </Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
