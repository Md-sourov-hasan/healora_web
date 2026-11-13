import React, { useState, useCallback } from 'react';
import { PhHospital, PhMapPin, PhPlus, PhGear, PhShieldCheck } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { SegmentedTabs } from '../common/Tabs';
import { useApp } from '../../context/useApp';
import type { Hub } from '../../types';
import {
  hubsService,
  type ApiHub,
  type OperatingHoursDay,
  type ApiAvailabilityBlock,
  type ApiHubServiceOffering,
} from '../../services/hubsService';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const HubsView: React.FC = () => {
  const {
    t,
    language,
    hubs,
    regions,
    staff,
    serviceTypes,
    selectedHubId,
    setSelectedHubId,
    addHub,
    updateHubProfile,
    updateHubStatus,
    refreshBackendData,
  } = useApp();

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

  // Manage Hub Drawer state
  const [managingHub, setManagingHub] = useState<Hub | null>(null);
  const [manageTab, setManageTab] = useState<'leadership' | 'hours' | 'blocks' | 'offerings' | 'catchment'>('leadership');
  const [liveHubDetail, setLiveHubDetail] = useState<ApiHub | null>(null);
  const [manageBusy, setManageBusy] = useState(false);
  const [manageFeedback, setManageFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Leadership & Status states
  const [newStatus, setNewStatus] = useState<Hub['status']>('active');
  const [statusReason, setStatusReason] = useState('');
  const [managerUserId, setManagerUserId] = useState('');
  const [regionalOwnerUserId, setRegionalOwnerUserId] = useState('');

  // Operating hours states
  const [operatingHours, setOperatingHours] = useState<OperatingHoursDay[]>([]);

  // Availability blocks states
  const [blocks, setBlocks] = useState<ApiAvailabilityBlock[]>([]);
  const [blockType, setBlockType] = useState<'closure' | 'pause' | 'capacity_block'>('closure');
  const [blockStartsAt, setBlockStartsAt] = useState('');
  const [blockEndsAt, setBlockEndsAt] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [liftReason, setLiftReason] = useState('');

  // Service offerings states
  const [offerings, setOfferings] = useState<ApiHubServiceOffering[]>([]);
  const [proposeServiceTypeId, setProposeServiceTypeId] = useState('');
  const [offeringDecisionReason, setOfferingDecisionReason] = useState('');

  // Catchments & Staff states
  const [hubCatchments, setHubCatchments] = useState<
    Array<{ id: string; hubId: string; regionId: string; isPrimary: boolean; region?: { id: string; code: string; name: string; level: string } }>
  >([]);
  const [newCatchmentRegionId, setNewCatchmentRegionId] = useState('');
  const [newCatchmentPrimary, setNewCatchmentPrimary] = useState(false);
  const [hubStaffList, setHubStaffList] = useState<
    Array<{ assignmentId: string; role: string; scopeType: string; user: { id: string; name: string; phone?: string | null; status?: string } }>
  >([]);

  const resetAddForm = () => {
    setHubName('');
    setHubCode('');
    setRegionId('');
    setHubAddress('');
    setHubPhone('');
    setHubReferral('');
    setHubEmergencyPhone('');
  };

  const handleAdd = async (event: React.FormEvent) => {
    event.preventDefault();
    const ok = await addHub({
      name: hubName,
      code: hubCode,
      regionId,
      address: hubAddress,
      phone: hubPhone,
      emergencyReferralFacility: hubReferral,
      emergencyPhone: hubEmergencyPhone,
    });
    if (ok) {
      setIsAddHubOpen(false);
      resetAddForm();
    }
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
      name: editName,
      address: editAddress,
      phone: editPhone,
      emergencyReferralFacility: editReferral,
      emergencyPhone: editEmergencyPhone,
    });
    if (ok) setSelectedHubForEdit(null);
  };

  const loadHubGovernance = useCallback(async (hubId: string) => {
    setManageBusy(true);
    try {
      const [detail, hoursRes, blocksRes, offeringsRes, catchmentsRes, staffRes] = await Promise.all([
        hubsService.getHub(hubId).catch(() => null),
        hubsService.getOperatingHours(hubId).catch(() => ({ items: [] })),
        hubsService.getAvailabilityBlocks(hubId, false).catch(() => ({ items: [] })),
        hubsService.getServiceOfferings(hubId).catch(() => ({ items: [] })),
        hubsService.getCatchments(hubId).catch(() => ({ items: [] })),
        hubsService.getStaff(hubId).catch(() => ({ items: [] })),
      ]);
      setLiveHubDetail(detail);
      if (detail?.managerUserId) setManagerUserId(detail.managerUserId);
      setOperatingHours(
        (hoursRes.items ?? []).length > 0
          ? hoursRes.items
          : [0, 1, 2, 3, 4, 5, 6].map((d) => ({ dayOfWeek: d, opensAt: '08:30', closesAt: '16:30' }))
      );
      setBlocks(blocksRes.items ?? []);
      setOfferings(offeringsRes.items ?? []);
      setHubCatchments(catchmentsRes.items ?? []);
      setHubStaffList(staffRes.items ?? []);
    } finally {
      setManageBusy(false);
    }
  }, []);

  const openManageHub = (hub: Hub) => {
    setManagingHub(hub);
    setNewStatus(hub.status);
    setStatusReason('');
    setManageFeedback(null);
    setManageTab('leadership');
    void loadHubGovernance(hub.id);
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingHub || !statusReason.trim()) return;
    setManageFeedback(null);
    await updateHubStatus(managingHub.id, newStatus, statusReason.trim());
    setStatusReason('');
    await loadHubGovernance(managingHub.id);
    setManageFeedback({ type: 'ok', text: `Hub status updated to ${newStatus}.` });
  };

  const handleAssignManager = async () => {
    if (!managingHub) return;
    setManageFeedback(null);
    try {
      await hubsService.setManager(managingHub.id, managerUserId || null);
      await refreshBackendData();
      await loadHubGovernance(managingHub.id);
      setManageFeedback({ type: 'ok', text: 'Hub manager updated.' });
    } catch (err) {
      setManageFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to set manager.' });
    }
  };

  const handleAssignRegionalOwner = async () => {
    if (!managingHub) return;
    setManageFeedback(null);
    try {
      await hubsService.setRegionalOwner(managingHub.id, regionalOwnerUserId || null);
      await loadHubGovernance(managingHub.id);
      setManageFeedback({ type: 'ok', text: 'Regional owner updated.' });
    } catch (err) {
      setManageFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to set regional owner.' });
    }
  };

  const handleSaveOperatingHours = async () => {
    if (!managingHub) return;
    setManageFeedback(null);
    try {
      await hubsService.setOperatingHours(
        managingHub.id,
        operatingHours.map((h) => ({
          dayOfWeek: h.dayOfWeek,
          opensAt: h.opensAt,
          closesAt: h.closesAt,
        }))
      );
      await loadHubGovernance(managingHub.id);
      setManageFeedback({ type: 'ok', text: 'Weekly operating hours saved.' });
    } catch (err) {
      setManageFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to save operating hours.' });
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingHub || !blockStartsAt || !blockReason.trim()) return;
    setManageFeedback(null);
    try {
      await hubsService.createAvailabilityBlock(managingHub.id, {
        blockType,
        startsAt: new Date(blockStartsAt).toISOString(),
        endsAt: blockEndsAt ? new Date(blockEndsAt).toISOString() : null,
        reason: blockReason.trim(),
      });
      setBlockReason('');
      await loadHubGovernance(managingHub.id);
      setManageFeedback({ type: 'ok', text: 'Availability block declared.' });
    } catch (err) {
      setManageFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to declare availability block.' });
    }
  };

  const handleLiftBlock = async (blockId: string) => {
    if (!managingHub) return;
    setManageFeedback(null);
    try {
      await hubsService.liftAvailabilityBlock(managingHub.id, blockId, liftReason.trim() || 'Operations resumed');
      await loadHubGovernance(managingHub.id);
      setManageFeedback({ type: 'ok', text: 'Availability block lifted.' });
    } catch (err) {
      setManageFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to lift block.' });
    }
  };

  const handleProposeOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingHub || !proposeServiceTypeId) return;
    setManageFeedback(null);
    try {
      await hubsService.proposeServiceOffering(managingHub.id, proposeServiceTypeId);
      setProposeServiceTypeId('');
      await loadHubGovernance(managingHub.id);
      setManageFeedback({ type: 'ok', text: 'Service offering proposed.' });
    } catch (err) {
      setManageFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to propose offering.' });
    }
  };

  const handleDecideOffering = async (offeringId: string, action: 'approve' | 'suspend' | 'retire') => {
    if (!managingHub) return;
    setManageFeedback(null);
    try {
      await hubsService.decideServiceOffering(
        managingHub.id,
        offeringId,
        action,
        offeringDecisionReason.trim() || `Offering ${action}d by governance`
      );
      await loadHubGovernance(managingHub.id);
      setManageFeedback({ type: 'ok', text: `Service offering ${action}d.` });
    } catch (err) {
      setManageFeedback({ type: 'err', text: err instanceof Error ? err.message : `Failed to ${action} offering.` });
    }
  };

  const handleAddCatchment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingHub || !newCatchmentRegionId) return;
    setManageFeedback(null);
    try {
      await hubsService.addCatchment(managingHub.id, newCatchmentRegionId, newCatchmentPrimary);
      setNewCatchmentRegionId('');
      await loadHubGovernance(managingHub.id);
      setManageFeedback({ type: 'ok', text: 'Catchment region assigned to hub.' });
    } catch (err) {
      setManageFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to add catchment.' });
    }
  };

  const handleRemoveCatchment = async (catchmentRegionId: string) => {
    if (!managingHub) return;
    setManageFeedback(null);
    try {
      await hubsService.deleteCatchment(managingHub.id, catchmentRegionId);
      await loadHubGovernance(managingHub.id);
      setManageFeedback({ type: 'ok', text: 'Catchment removed from hub.' });
    } catch (err) {
      setManageFeedback({ type: 'err', text: err instanceof Error ? err.message : 'Failed to remove catchment.' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">
            Physical hub directory & governance
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navHubs}</h1>
          <p className="mt-1 text-sm text-slate">
            Hub records, operating hours, availability closures, and approved service offerings.
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddHubOpen(true)} icon={<PhPlus size={16} />}>
          Add New Hub
        </Button>
      </div>

      {hubs.length === 0 ? (
        <Card variant="card">
          <p className="m-0 text-sm text-slate">No hubs were returned for this account.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {hubs.map((hub) => {
            const region = regions.find((item) => item.id === hub.regionId);
            const selected = hub.id === selectedHubId;
            return (
              <Card key={hub.id} variant="card" className={selected ? 'border-2! border-teal!' : ''}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-ink px-1.5 py-0.5 text-[11px] font-bold text-white">
                        {hub.code}
                      </span>
                      <StatusPill
                        label={hub.status.replaceAll('_', ' ').toUpperCase()}
                        variant={hub.status === 'active' ? 'active' : 'paused'}
                      />
                    </div>
                    <h2 className="mb-1 mt-2 text-lg font-semibold text-ink">
                      {language === 'bn' ? hub.nameBn || hub.name : hub.name}
                    </h2>
                    <div className="text-sm text-slate">{region?.name ?? 'Region not available'}</div>
                  </div>
                  <PhHospital size={24} />
                </div>
                <div className="mt-4 rounded-xl bg-bone p-3.5">
                  <div className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-pine">
                    <PhMapPin size={16} />
                    Address
                  </div>
                  <div className="text-sm text-slate">
                    {language === 'bn' ? hub.addressBn || hub.address : hub.address}
                  </div>
                  {hub.phone && <div className="mt-1 text-xs text-slate">Contact: {hub.phone}</div>}
                </div>
                {(hub.emergencyReferralFacility || hub.emergencyPhone) && (
                  <div className="mt-3 border-l-3 border-clay pl-3 text-sm">
                    <div className="font-semibold text-ink">
                      {hub.emergencyReferralFacility || 'Referral facility not set'}
                    </div>
                    {hub.emergencyPhone && <div className="text-xs text-slate">{hub.emergencyPhone}</div>}
                  </div>
                )}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
                  <span className="text-sm text-slate">Manager: {hub.assignedManager || 'Not assigned'}</span>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="small" onClick={() => beginEdit(hub)}>
                      Edit profile
                    </Button>
                    <Button
                      variant="small"
                      icon={<PhGear size={14} />}
                      onClick={() => openManageHub(hub)}
                    >
                      Governance & Hours
                    </Button>
                    {!selected && (
                      <Button variant="primary" onClick={() => setSelectedHubId(hub.id)}>
                        Select hub
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Hub Modal */}
      <ModalSheet isOpen={isAddHubOpen} onClose={() => setIsAddHubOpen(false)} title="Create Hub">
        <form onSubmit={handleAdd} className="space-y-3">
          <label className="block text-xs font-semibold text-slate">
            Hub name *
            <input
              required
              value={hubName}
              onChange={(e) => setHubName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Hub code *
            <input
              required
              value={hubCode}
              onChange={(e) => setHubCode(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Region *
            <select
              required
              value={regionId}
              onChange={(e) => setRegionId(e.target.value)}
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
          <label className="block text-xs font-semibold text-slate">
            Address *
            <input
              required
              value={hubAddress}
              onChange={(e) => setHubAddress(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Contact phone
            <input
              value={hubPhone}
              onChange={(e) => setHubPhone(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Referral facility
            <input
              value={hubReferral}
              onChange={(e) => setHubReferral(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Referral contact phone
            <input
              value={hubEmergencyPhone}
              onChange={(e) => setHubEmergencyPhone(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsAddHubOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create hub
            </Button>
          </div>
        </form>
      </ModalSheet>

      {/* Edit Hub Profile Modal */}
      <ModalSheet
        isOpen={!!selectedHubForEdit}
        onClose={() => setSelectedHubForEdit(null)}
        title="Edit hub profile"
      >
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-slate">
            Hub name
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Address
            <input
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Contact phone
            <input
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Referral facility
            <input
              value={editReferral}
              onChange={(e) => setEditReferral(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <label className="block text-xs font-semibold text-slate">
            Referral contact phone
            <input
              value={editEmergencyPhone}
              onChange={(e) => setEditEmergencyPhone(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-line px-3 text-sm font-normal"
            />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setSelectedHubForEdit(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              Save changes
            </Button>
          </div>
        </div>
      </ModalSheet>

      {/* Hub Governance, Hours, Closures & Offerings Modal */}
      {managingHub && (
        <ModalSheet
          isOpen={!!managingHub}
          onClose={() => setManagingHub(null)}
          title={`Hub Governance: ${managingHub.name}`}
          subtitle={`${managingHub.code} • Status: ${liveHubDetail?.status || managingHub.status}`}
        >
          <div className="flex flex-col gap-4">
            <SegmentedTabs
              activeKey={manageTab}
              onChange={(k) => setManageTab(k as 'leadership' | 'hours' | 'blocks' | 'offerings' | 'catchment')}
              options={[
                { key: 'leadership', label: 'Lifecycle & Owners' },
                { key: 'hours', label: 'Hours' },
                { key: 'blocks', label: 'Closures', count: blocks.length },
                { key: 'offerings', label: 'Offerings', count: offerings.length },
                { key: 'catchment', label: 'Catchments & Staff', count: hubCatchments.length },
              ]}
            />

            {manageFeedback && (
              <div
                className={`rounded-xl p-2.5 text-xs font-medium ${
                  manageFeedback.type === 'ok' ? 'bg-ok-bg text-ok-fg' : 'bg-bad-bg text-bad-fg'
                }`}
              >
                {manageFeedback.text}
              </div>
            )}

            {manageBusy && <div className="text-xs text-slate">Loading hub configuration...</div>}

            {manageTab === 'leadership' && (
              <div className="space-y-4">
                <form onSubmit={handleStatusChange} className="space-y-2.5 rounded-xl bg-bone p-3.5">
                  <div className="text-xs font-semibold text-ink">Transition Hub Lifecycle Status</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as Hub['status'])}
                      className="h-9 rounded-lg border border-line bg-paper px-2.5 text-xs"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="temporarily_closed">Temporarily Closed</option>
                      <option value="permanently_closed">Permanently Closed</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value)}
                      placeholder="Mandatory status reason..."
                      className="h-9 rounded-lg border border-line bg-paper px-2.5 text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button variant="small" type="submit">
                      Update Lifecycle Status
                    </Button>
                  </div>
                </form>

                <div className="space-y-2.5 rounded-xl border border-line p-3.5">
                  <div className="text-xs font-semibold text-ink">Assign Hub Manager</div>
                  <div className="flex gap-2">
                    <select
                      value={managerUserId}
                      onChange={(e) => setManagerUserId(e.target.value)}
                      className="h-9 flex-1 rounded-lg border border-line bg-paper px-2.5 text-xs"
                    >
                      <option value="">Unassigned</option>
                      {staff.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} ({m.role})
                        </option>
                      ))}
                    </select>
                    <Button variant="small" onClick={() => void handleAssignManager()}>
                      Set Manager
                    </Button>
                  </div>
                </div>

                <div className="space-y-2.5 rounded-xl border border-line p-3.5">
                  <div className="text-xs font-semibold text-ink">Assign Regional Owner</div>
                  <div className="flex gap-2">
                    <select
                      value={regionalOwnerUserId}
                      onChange={(e) => setRegionalOwnerUserId(e.target.value)}
                      className="h-9 flex-1 rounded-lg border border-line bg-paper px-2.5 text-xs"
                    >
                      <option value="">Unassigned</option>
                      {staff.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} ({m.role})
                        </option>
                      ))}
                    </select>
                    <Button variant="small" onClick={() => void handleAssignRegionalOwner()}>
                      Set Regional Owner
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {manageTab === 'hours' && (
              <div className="space-y-3">
                <div className="text-xs text-slate">
                  Configure standard weekly opening and closing times for this hub.
                </div>
                <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                  {operatingHours.map((day, idx) => (
                    <div
                      key={day.dayOfWeek}
                      className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2 text-xs"
                    >
                      <span className="w-28 font-semibold text-ink">
                        {DAY_NAMES[day.dayOfWeek] ?? `Day ${day.dayOfWeek}`}
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={day.opensAt}
                          onChange={(e) => {
                            const next = [...operatingHours];
                            next[idx] = { ...day, opensAt: e.target.value };
                            setOperatingHours(next);
                          }}
                          className="h-8 rounded-lg border border-line px-2 text-xs"
                        />
                        <span>to</span>
                        <input
                          type="time"
                          value={day.closesAt}
                          onChange={(e) => {
                            const next = [...operatingHours];
                            next[idx] = { ...day, closesAt: e.target.value };
                            setOperatingHours(next);
                          }}
                          className="h-8 rounded-lg border border-line px-2 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="small"
                    onClick={() => void handleSaveOperatingHours()}
                  >
                    Save Operating Hours
                  </Button>
                </div>
              </div>
            )}

            {manageTab === 'blocks' && (
              <div className="space-y-3">
                <form onSubmit={handleCreateBlock} className="space-y-2 rounded-xl bg-bone p-3">
                  <div className="text-xs font-semibold text-ink">Declare Emergency Closure / Availability Block</div>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={blockType}
                      onChange={(e) => setBlockType(e.target.value as 'closure' | 'pause' | 'capacity_block')}
                      className="h-8 rounded-lg border border-line bg-paper px-2 text-xs"
                    >
                      <option value="closure">Full Closure</option>
                      <option value="pause">Temporary Pause</option>
                      <option value="capacity_block">Capacity Block</option>
                    </select>
                    <input
                      type="datetime-local"
                      required
                      value={blockStartsAt}
                      onChange={(e) => setBlockStartsAt(e.target.value)}
                      className="h-8 rounded-lg border border-line bg-paper px-2 text-xs"
                    />
                    <input
                      type="datetime-local"
                      value={blockEndsAt}
                      onChange={(e) => setBlockEndsAt(e.target.value)}
                      className="h-8 rounded-lg border border-line bg-paper px-2 text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      placeholder="Mandatory closure reason..."
                      className="h-8 flex-1 rounded-lg border border-line bg-paper px-2 text-xs"
                    />
                    <Button variant="small" type="submit">
                      Declare Block
                    </Button>
                  </div>
                </form>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={liftReason}
                    onChange={(e) => setLiftReason(e.target.value)}
                    placeholder="Reason for lifting block (optional)"
                    className="h-8 flex-1 rounded-lg border border-line px-2.5 text-xs"
                  />
                </div>

                {blocks.length === 0 ? (
                  <div className="rounded-xl border border-line p-4 text-center text-xs text-slate">
                    No availability blocks recorded for this hub.
                  </div>
                ) : (
                  <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                    {blocks.map((blk) => (
                      <div
                        key={blk.id}
                        className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-ink">
                            {(blk.blockType || 'closure').toUpperCase()} — {blk.reason}
                          </div>
                          <div className="text-[11px] text-slate">
                            Starts: {new Date(blk.startsAt).toLocaleString()}
                            {blk.endsAt ? ` • Ends: ${new Date(blk.endsAt).toLocaleString()}` : ''}
                          </div>
                        </div>
                        {blk.liftedAt ? (
                          <StatusPill label="LIFTED" variant="completed" />
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleLiftBlock(blk.id)}
                            className="cursor-pointer rounded border border-teal px-2.5 py-1 text-[11px] font-semibold text-teal"
                          >
                            Lift Block
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {manageTab === 'offerings' && (
              <div className="space-y-3">
                <form onSubmit={handleProposeOffering} className="flex gap-2 rounded-xl bg-bone p-3">
                  <select
                    required
                    value={proposeServiceTypeId}
                    onChange={(e) => setProposeServiceTypeId(e.target.value)}
                    className="h-9 flex-1 rounded-lg border border-line bg-paper px-2.5 text-xs"
                  >
                    <option value="">Select catalogue service type to propose...</option>
                    {serviceTypes.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                  <Button variant="small" type="submit" icon={<PhShieldCheck size={14} />}>
                    Propose Service
                  </Button>
                </form>

                <input
                  type="text"
                  value={offeringDecisionReason}
                  onChange={(e) => setOfferingDecisionReason(e.target.value)}
                  placeholder="Governance decision note (optional for approve, used for suspend/retire)"
                  className="h-8 w-full rounded-lg border border-line px-2.5 text-xs"
                />

                {offerings.length === 0 ? (
                  <div className="rounded-xl border border-line p-4 text-center text-xs text-slate">
                    No service offerings proposed for this hub yet.
                  </div>
                ) : (
                  <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
                    {offerings.map((off) => (
                      <div
                        key={off.id}
                        className="flex items-center justify-between rounded-xl border border-line bg-paper px-3 py-2 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-ink">
                            {off.serviceType?.name || off.serviceTypeId}{' '}
                            <span className="font-mono text-[11px] text-slate">
                              ({off.serviceType?.code || ''})
                            </span>
                          </div>
                          <StatusPill
                            label={off.status}
                            variant={
                              off.status === 'approved'
                                ? 'active'
                                : off.status === 'proposed'
                                  ? 'upcoming'
                                  : 'cancelled'
                            }
                          />
                        </div>
                        <div className="flex gap-1.5">
                          {off.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => void handleDecideOffering(off.id, 'approve')}
                              className="cursor-pointer rounded bg-teal px-2 py-1 text-[11px] font-semibold text-white"
                            >
                              Approve
                            </button>
                          )}
                          {off.status === 'approved' && (
                            <button
                              type="button"
                              onClick={() => void handleDecideOffering(off.id, 'suspend')}
                              className="cursor-pointer rounded border border-warn/40 bg-warn-bg px-2 py-1 text-[11px] font-semibold text-warn-fg"
                            >
                              Suspend
                            </button>
                          )}
                          {off.status !== 'retired' && (
                            <button
                              type="button"
                              onClick={() => void handleDecideOffering(off.id, 'retire')}
                              className="cursor-pointer rounded border border-bad/40 px-2 py-1 text-[11px] font-semibold text-bad"
                            >
                              Retire
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {manageTab === 'catchment' && (
              <div className="space-y-3">
                <form onSubmit={handleAddCatchment} className="flex items-center gap-2 rounded-xl bg-bone p-3">
                  <select
                    required
                    value={newCatchmentRegionId}
                    onChange={(e) => setNewCatchmentRegionId(e.target.value)}
                    className="h-8 flex-1 rounded-lg border border-line bg-paper px-2 text-xs"
                  >
                    <option value="">Assign catchment region...</option>
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.level})
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-slate">
                    <input
                      type="checkbox"
                      checked={newCatchmentPrimary}
                      onChange={(e) => setNewCatchmentPrimary(e.target.checked)}
                    />
                    Primary
                  </label>
                  <Button variant="small" type="submit">
                    Add
                  </Button>
                </form>

                <div className="text-xs font-semibold text-ink">Assigned Catchments</div>
                {hubCatchments.length === 0 ? (
                  <div className="text-xs text-slate">No catchment areas assigned.</div>
                ) : (
                  <div className="space-y-1">
                    {hubCatchments.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-1.5 text-xs"
                      >
                        <span>
                          <strong>{c.region?.name || c.regionId}</strong>{' '}
                          {c.isPrimary ? '(Primary)' : '(Secondary)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => void handleRemoveCatchment(c.regionId)}
                          className="cursor-pointer text-[11px] font-semibold text-bad hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 text-xs font-semibold text-ink">
                  Hub Staff Roster ({hubStaffList.length})
                </div>
                {hubStaffList.length === 0 ? (
                  <div className="text-xs text-slate">No staff directly scoped to this hub.</div>
                ) : (
                  <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
                    {hubStaffList.map((s) => (
                      <div
                        key={s.assignmentId}
                        className="flex items-center justify-between rounded-lg bg-bone px-3 py-1.5 text-xs"
                      >
                        <span className="font-medium text-ink">{s.user.name}</span>
                        <span className="text-slate">
                          {s.role} ({s.scopeType})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setManagingHub(null)}>
                Close
              </Button>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
