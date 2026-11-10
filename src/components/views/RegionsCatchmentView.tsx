import React, { useState } from 'react';
import {
  PhGlobe,
  PhMapPin,
  PhPlus,
  PhHospital,
  PhShieldCheck,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { CatchmentArea } from '../../types';

export const RegionsCatchmentView: React.FC = () => {
  const {
    t,
    language,
    regions,
    catchments,
    hubs,
    addRegion,
    addCatchment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'catchments' | 'regions'>('catchments');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [isAddCatchmentOpen, setIsAddCatchmentOpen] = useState(false);
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [selectedCatchment, setSelectedCatchment] = useState<CatchmentArea | null>(null);

  // Form states for Catchment
  const [catchmentName, setCatchmentName] = useState('');
  const [catchmentUpazila, setCatchmentUpazila] = useState('');
  const [catchmentUnions, setCatchmentUnions] = useState('');
  const [catchmentHubId, setCatchmentHubId] = useState(hubs[0]?.id || '');
  const [catchmentPopulation, setCatchmentPopulation] = useState(150000);
  const [catchmentRadius, setCatchmentRadius] = useState(7);
  const [catchmentBasis, setCatchmentBasis] = useState<CatchmentArea['basis']>('operations_assignment');

  // Form states for Region
  const [regionName, setRegionName] = useState('');
  const [regionDivision, setRegionDivision] = useState('Dhaka');
  const [regionalManager, setRegionalManager] = useState('');
  const [regionalPhone, setRegionalPhone] = useState('');

  const filteredCatchments = selectedRegionFilter === 'all'
    ? catchments
    : catchments.filter((c) => c.regionId === selectedRegionFilter);

  const handleCreateCatchment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catchmentName.trim()) return;
    const targetHub = hubs.find((h) => h.id === catchmentHubId);
    addCatchment({
      name: catchmentName,
      nameBn: catchmentName,
      hubId: catchmentHubId,
      hubName: targetHub?.name || 'Assigned Hub',
      upazila: catchmentUpazila || 'Upazila Sadar',
      unions: catchmentUnions ? catchmentUnions.split(',').map((u) => u.trim()) : ['Union 1'],
      estimatedPopulation: Number(catchmentPopulation),
      coverageRadiusKm: Number(catchmentRadius),
      basis: catchmentBasis,
      regionId: targetHub?.regionId || 'reg_dhaka',
    });
    setCatchmentName('');
    setCatchmentUpazila('');
    setCatchmentUnions('');
    setIsAddCatchmentOpen(false);
  };

  const handleCreateRegion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regionName.trim()) return;
    addRegion({
      name: regionName,
      nameBn: regionName,
      division: regionDivision,
      regionalManagerName: regionalManager || 'Regional Manager',
      regionalManagerPhone: regionalPhone || '+880 1711 000000',
      catchmentPopulation: 500000,
      districts: [regionDivision],
      catchmentUnions: ['Central Union'],
    });
    setRegionName('');
    setRegionalManager('');
    setRegionalPhone('');
    setIsAddRegionOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'ভৌগোলিক পরিধি ও সেবা বণ্টন' : 'GEOGRAPHIC SERVICE DELIMITATION'}
            </span>
            <StatusPill label="Administrative Area Mapped" variant="active" />
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navRegions}
          </h1>
          <p className="mt-1 mb-0 text-sm text-slate">
            {language === 'bn'
              ? 'উপজেলা ও ইউনিয়নভিত্তিক সেবা এলাকা নির্ধারণ, আঞ্চলিক পরিচালকদের দায়িত্ব ও ক্যাচমেন্ট নীতি'
              : 'Defined administrative catchment areas, regional supervisor governance, and patient-to-hub assignment rules'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsAddRegionOpen(true)}
            icon={<PhGlobe size={16} />}
          >
            {language === 'bn' ? 'নতুন অঞ্চল (Region)' : 'Add Region'}
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddCatchmentOpen(true)}
            icon={<PhPlus size={16} />}
          >
            {language === 'bn' ? 'ক্যাচমেন্ট এলাকা নির্ধারণ' : 'Add Catchment Area'}
          </Button>
        </div>
      </div>

      {/* PRD Privacy & Policy Notice (PRD Section 8.4) */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sage-200 bg-mist px-5 py-3.5 text-[13px] text-pine">
        <PhShieldCheck size={20} color="#1D6B66" />
        <div className="flex-1">
          <strong>Catchment Governance (PRD Section 8.4):</strong> Healora relies strictly on administrative union/upazila mapping for catchment assignment. No continuous location/GPS tracking is collected. Patients outside the primary catchment may still receive care as controlled capacity exceptions.
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('catchments')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'catchments' ? 'bg-ink text-white' : 'text-slate hover:bg-mist'
            }`}
          >
            {language === 'bn' ? 'ক্যাচমেন্ট এলাকাসমূহ' : 'Catchment Areas'} ({catchments.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('regions')}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
              activeTab === 'regions' ? 'bg-ink text-white' : 'text-slate hover:bg-mist'
            }`}
          >
            {language === 'bn' ? 'প্রশাসনিক অঞ্চলসমূহ' : 'Administrative Regions'} ({regions.length})
          </button>
        </div>

        {activeTab === 'catchments' && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate">
            <span>Filter Region:</span>
            <select
              value={selectedRegionFilter}
              onChange={(e) => setSelectedRegionFilter(e.target.value)}
              className="rounded-lg border border-line bg-paper px-2.5 py-1 text-xs text-ink"
            >
              <option value="all">All Regions ({regions.length})</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Catchment Areas */}
      {activeTab === 'catchments' && (
        <div className="grid grid-cols-2 gap-6">
          {filteredCatchments.map((catchment) => {
            const mappedHub = hubs.find((h) => h.id === catchment.hubId);
            return (
              <Card key={catchment.id} variant="card" className="border-t-3! border-t-teal!">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-md bg-sage-200 px-2 py-0.5 text-[11px] font-bold text-pine">
                        Upazila: {catchment.upazila}
                      </span>
                      <StatusPill
                        label={catchment.basis.replace('_', ' ').toUpperCase()}
                        variant="active"
                      />
                    </div>
                    <h3 className="m-0 text-base font-semibold text-ink">
                      {language === 'bn' ? catchment.nameBn : catchment.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedCatchment(catchment)}
                    className="cursor-pointer text-xs font-semibold text-teal hover:underline"
                  >
                    View Details
                  </button>
                </div>

                <div className="mb-4 rounded-xl bg-bone p-3.5 text-xs">
                  <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-pine">
                    <PhHospital size={16} color="#1D6B66" />
                    <span>Serving Hub:</span>
                    <strong className="text-ink">{mappedHub?.name || catchment.hubName}</strong>
                  </div>
                  <div className="text-slate">
                    Radius: <strong>~{catchment.coverageRadiusKm} km</strong> • Est. Catchment Population: <strong>{catchment.estimatedPopulation.toLocaleString()}</strong>
                  </div>
                  <div className="mt-2 text-slate">
                    Policy: <span className="font-semibold text-ink">{catchment.outOfCatchmentPolicy.replace(/_/g, ' ')}</span>
                  </div>
                </div>

                <div>
                  <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate">
                    Mapped Unions & Wards:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {catchment.unions.map((union, idx) => (
                      <span key={idx} className="rounded-md border border-line bg-paper px-2 py-1 text-xs text-ink">
                        {union}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Tab 2: Administrative Regions */}
      {activeTab === 'regions' && (
        <div className="grid grid-cols-2 gap-6">
          {regions.map((region) => (
            <Card key={region.id} variant="card" className="border-t-3! border-t-pine!">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-md bg-ink px-2 py-0.5 text-[11px] font-bold text-white">
                      {region.code}
                    </span>
                    <StatusPill
                      label={region.status === 'active' ? 'ACTIVE REGION' : 'PLANNED'}
                      variant={region.status === 'active' ? 'active' : 'upcoming'}
                    />
                  </div>
                  <h3 className="m-0 text-base font-semibold text-ink">
                    {language === 'bn' ? region.nameBn : region.name}
                  </h3>
                  <div className="text-xs text-slate">
                    Division: <strong>{region.division}</strong>
                  </div>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-3 gap-3 rounded-xl bg-bone p-3.5 text-center text-xs">
                <div>
                  <div className="text-slate">Active Hubs</div>
                  <div className="text-lg font-bold text-teal">{region.activeHubsCount} / {region.totalHubsCount}</div>
                </div>
                <div>
                  <div className="text-slate">Population</div>
                  <div className="text-lg font-bold text-ink">{(region.catchmentPopulation / 1000000).toFixed(1)}M</div>
                </div>
                <div>
                  <div className="text-slate">Districts</div>
                  <div className="text-lg font-bold text-ink">{region.districts.length}</div>
                </div>
              </div>

              <div className="text-xs text-slate">
                <div className="mb-1">
                  Regional Director: <strong className="text-ink">{region.regionalManagerName}</strong> ({region.regionalManagerPhone})
                </div>
                <div>
                  Districts Covered: <span className="text-ink">{region.districts.join(', ')}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Add Catchment */}
      <ModalSheet
        isOpen={isAddCatchmentOpen}
        onClose={() => setIsAddCatchmentOpen(false)}
        title="Add Geographic Catchment Area"
      >
        <form onSubmit={handleCreateCatchment} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Catchment Area Name</label>
            <input
              type="text"
              required
              value={catchmentName}
              onChange={(e) => setCatchmentName(e.target.value)}
              placeholder="e.g. Dhanmondi - Mohammadpur Urban Catchment"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Primary Upazila</label>
              <input
                type="text"
                required
                value={catchmentUpazila}
                onChange={(e) => setCatchmentUpazila(e.target.value)}
                placeholder="e.g. Dhanmondi"
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Serving Hub</label>
              <select
                value={catchmentHubId}
                onChange={(e) => setCatchmentHubId(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              >
                {hubs.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Mapped Unions / Wards (comma separated)</label>
            <input
              type="text"
              value={catchmentUnions}
              onChange={(e) => setCatchmentUnions(e.target.value)}
              placeholder="e.g. Ward 15, Ward 14, Mohammadpur East"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Est. Population</label>
              <input
                type="number"
                value={catchmentPopulation}
                onChange={(e) => setCatchmentPopulation(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Coverage Radius (km)</label>
              <input
                type="number"
                value={catchmentRadius}
                onChange={(e) => setCatchmentRadius(Number(e.target.value))}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Assignment Basis (PRD 8.4)</label>
            <select
              value={catchmentBasis}
              onChange={(e) => setCatchmentBasis(e.target.value as CatchmentArea['basis'])}
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            >
              <option value="operations_assignment">Operations Assignment (Official Catchment)</option>
              <option value="patient_choice">Patient Choice (Preferred Hub)</option>
              <option value="campaign_camp">Campaign / Health Camp Outreach</option>
              <option value="field_referral">Field Health Worker Referral</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsAddCatchmentOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Catchment Area</Button>
          </div>
        </form>
      </ModalSheet>

      {/* Modal: Add Region */}
      <ModalSheet
        isOpen={isAddRegionOpen}
        onClose={() => setIsAddRegionOpen(false)}
        title="Add Regional Care Network"
      >
        <form onSubmit={handleCreateRegion} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Region Title</label>
            <input
              type="text"
              required
              value={regionName}
              onChange={(e) => setRegionName(e.target.value)}
              placeholder="e.g. Mymensingh Division Regional Care Network"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Division</label>
              <select
                value={regionDivision}
                onChange={(e) => setRegionDivision(e.target.value)}
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              >
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Barisal">Barisal</option>
                <option value="Khulna">Khulna</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate">Regional Director</label>
              <input
                type="text"
                value={regionalManager}
                onChange={(e) => setRegionalManager(e.target.value)}
                placeholder="e.g. Tariqul Islam"
                className="h-10 w-full rounded-xl border border-line px-3 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Emergency Contact Phone</label>
            <input
              type="text"
              value={regionalPhone}
              onChange={(e) => setRegionalPhone(e.target.value)}
              placeholder="+880 1711 000000"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsAddRegionOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Create Region</Button>
          </div>
        </form>
      </ModalSheet>

      {/* Drawer: Catchment Details */}
      {selectedCatchment && (
        <ModalSheet
          isOpen={!!selectedCatchment}
          onClose={() => setSelectedCatchment(null)}
          title={`Catchment Area: ${selectedCatchment.name}`}
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-bone p-4">
              <div className="text-xs text-slate">Administrative Mapping</div>
              <div className="text-base font-semibold text-ink">
                Upazila: {selectedCatchment.upazila}
              </div>
              <div className="mt-1 text-sm text-slate">
                Assigned Hub: <strong>{selectedCatchment.hubName}</strong>
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate">
                Mapped Unions &amp; Villages
              </h4>
              <div className="space-y-1.5">
                {selectedCatchment.unions.map((u, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-line bg-paper px-3 py-2 text-sm">
                    <PhMapPin size={16} color="#1D6B66" />
                    <span>{u}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-line p-3">
                <span className="text-slate">Coverage Radius:</span>
                <div className="text-sm font-bold text-ink">~{selectedCatchment.coverageRadiusKm} km</div>
              </div>
              <div className="rounded-lg border border-line p-3">
                <span className="text-slate">Est. Target Population:</span>
                <div className="text-sm font-bold text-ink">{selectedCatchment.estimatedPopulation.toLocaleString()}</div>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="secondary" onClick={() => setSelectedCatchment(null)} className="w-full">
                Close Inspector
              </Button>
            </div>
          </div>
        </ModalSheet>
      )}
    </div>
  );
};
