import React, { useState, useEffect } from 'react';
import {
  PhMagnifyingGlass,
  PhUsers,
  PhHospital,
  PhCalendarBlank,
  PhX,
  PhHouse,
  PhGlobe,
  PhDesktop,
  PhGauge,
  PhActivity,
  PhBell,
  PhSlidersHorizontal,
  PhShieldCheck,
  PhChartBar,
  PhClipboardText,
  PhUserCircle,
} from '../icons/PhosphorIcons';
import { useApp } from '../../context/AppContext';
import type { AppRoute } from '../../types';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    queue,
    patients,
    hubs,
    navigate,
    setSelectedHubId,
    language,
    t,
  } = useApp();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const allModules: { path: AppRoute; label: string; icon: React.ComponentType<any>; tags: string }[] = [
    { path: '/dashboard', label: t.navDashboard, icon: PhHouse, tags: 'overview home metrics kpi' },
    { path: '/queue', label: t.navQueue, icon: PhUsers, tags: 'live waiting called tickets dispatch' },
    { path: '/appointments', label: t.navAppointments, icon: PhClipboardText, tags: 'booking checkin intake schedule' },
    { path: '/sessions', label: t.navSessions, icon: PhCalendarBlank, tags: 'camps clinic days capacity' },
    { path: '/encounters', label: t.navEncounters, icon: PhActivity, tags: 'monitoring clinical measurements vitals' },
    { path: '/exceptions', label: t.navExceptions, icon: PhX, tags: 'escalations alerts sync delay emergency' },
    { path: '/hubs', label: t.navHubs, icon: PhHospital, tags: 'directory physical centers locations' },
    { path: '/regions', label: t.navRegions, icon: PhGlobe, tags: 'catchment upazila union division geographic' },
    { path: '/stations', label: t.navStations, icon: PhDesktop, tags: 'desks reception vitals room counseling' },
    { path: '/equipment', label: t.navEquipment, icon: PhGauge, tags: 'devices calibration biomedical bp monitor ecg' },
    { path: '/patients', label: t.navPatients, icon: PhUserCircle, tags: 'lookup registry identity verification' },
    { path: '/team', label: t.navTeam, icon: PhUsers, tags: 'staff rosters bmdc licenses doctors health workers' },
    { path: '/reports', label: t.navReports, icon: PhChartBar, tags: 'analytics export performance sla' },
    { path: '/notifications', label: t.navNotifications, icon: PhBell, tags: 'activity sms push dispatches' },
    { path: '/settings', label: t.navSettings, icon: PhSlidersHorizontal, tags: 'permissions rbac pdpa 2026 dghs compliance' },
    { path: '/audit-logs', label: t.navAuditLogs, icon: PhShieldCheck, tags: 'immutable security ledger activity' },
    { path: '/catalog', label: t.navCatalog, icon: PhShieldCheck, tags: 'service types protocols observation definitions consent templates queue priority alert rules governance' },
  ];

  const matchedModules = query.trim()
    ? allModules.filter(
        (m) =>
          m.label.toLowerCase().includes(query.toLowerCase()) ||
          m.tags.toLowerCase().includes(query.toLowerCase()) ||
          m.path.toLowerCase().includes(query.toLowerCase())
      )
    : allModules;

  const filteredQueue = queue.filter(
    (q) =>
      q.ticketNumber.toLowerCase().includes(query.toLowerCase()) ||
      q.patientName.toLowerCase().includes(query.toLowerCase()) ||
      q.patientPhone.includes(query)
  );

  const filteredPatients = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(query.toLowerCase()) ||
      p.canonicalHealoraId.toLowerCase().includes(query.toLowerCase()) ||
      p.phone.includes(query)
  );

  const filteredHubs = hubs.filter(
    (h) =>
      h.name.toLowerCase().includes(query.toLowerCase()) ||
      h.nameBn.includes(query) ||
      h.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-ink/45 pt-[90px] backdrop-blur-xs"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="flex w-[620px] max-w-[94%] flex-col overflow-hidden rounded-card border border-line bg-paper shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-line px-6 py-[18px]">
          <PhMagnifyingGlass size={20} color="#1D6B66" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'মডিউল, রোগী, সিরিয়াল টোকেন বা হাব দিয়ে খুঁজুন...'
                : 'Search any route (e.g. /regions, /stations), token, patient, or hub...'
            }
            className="flex-1 border-none bg-transparent font-ui text-base text-ink outline-none placeholder:text-slate/70"
          />
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(false)}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border-none bg-transparent transition-colors hover:bg-mist"
          >
            <PhX size={16} color="#5B6B6E" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[440px] overflow-y-auto px-4 py-3">
          {/* Quick Route Navigation */}
          <div className="mb-4">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate">
              {language === 'bn' ? 'সরাসরি পেজ নেভিগেশন' : 'Modules & Direct Routes'}
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              {matchedModules.slice(0, 8).map((mod) => {
                const Icon = mod.icon;
                return (
                  <button
                    key={mod.path}
                    type="button"
                    onClick={() => {
                      navigate(mod.path);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-chip border border-line bg-bone px-3 py-2 text-left text-xs font-semibold text-ink transition-colors hover:bg-mist"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon size={15} color="#1D6B66" />
                      <span className="truncate">{mod.label}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate">{mod.path}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Queue Tokens Found */}
          {filteredQueue.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate">
                {language === 'bn' ? 'সিরিয়াল টোকেন' : 'Live Queue Tokens'}
              </div>
              {filteredQueue.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate('/queue');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-pill px-3 py-2 transition-colors duration-150 hover:bg-mist"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-[6px] bg-ink px-2 py-[3px] text-xs font-bold text-white font-mono">
                      {item.ticketNumber}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-ink">
                        {language === 'bn' ? item.patientNameBn : item.patientName}
                      </div>
                      <div className="text-xs text-slate">
                        {item.stationName}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-teal">
                    {item.currentStatus.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Patients Found */}
          {filteredPatients.length > 0 && (
            <div className="mb-4">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate">
                {language === 'bn' ? 'রোগী তথ্য' : 'Registered Patients'}
              </div>
              {filteredPatients.slice(0, 4).map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => {
                    navigate('/patients');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-pill px-3 py-2 transition-colors duration-150 hover:bg-mist"
                >
                  <div className="flex items-center gap-2">
                    <PhUserCircle size={16} color="#1D6B66" />
                    <span className="text-[13px] font-semibold text-ink">
                      {language === 'bn' ? pat.fullNameBn : pat.fullName}
                    </span>
                    <span className="text-[11px] text-slate font-mono">
                      ({pat.canonicalHealoraId})
                    </span>
                  </div>
                  <span className="text-xs text-slate">
                    {pat.phone}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Hubs Found */}
          {filteredHubs.length > 0 && (
            <div className="mb-2">
              <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate">
                {language === 'bn' ? 'হাব কেন্দ্র' : 'Physical Hubs'}
              </div>
              {filteredHubs.map((hub) => (
                <div
                  key={hub.id}
                  onClick={() => {
                    setSelectedHubId(hub.id);
                    navigate('/hubs');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-pill px-3 py-2 transition-colors duration-150 hover:bg-mist"
                >
                  <div className="flex items-center gap-2">
                    <PhHospital size={16} color="#1D6B66" />
                    <span className="text-[13px] font-semibold text-ink">
                      {language === 'bn' ? hub.nameBn : hub.name} ({hub.code})
                    </span>
                  </div>
                  <span className="text-xs text-slate">
                    {hub.district}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
