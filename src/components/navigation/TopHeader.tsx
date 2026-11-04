import React from 'react';
import {
  PhMagnifyingGlass,
  PhBell,
  PhHospital,
  PhTranslate,
  PhCaretDown,
} from '../icons/PhosphorIcons';
import { useApp } from '../../context/AppContext';
import type { UserRole } from '../../types';

export const TopHeader: React.FC = () => {
  const {
    language,
    setLanguage,
    simpleMode,
    setSimpleMode,
    activeRole,
    setActiveRole,
    hubs,
    selectedHubId,
    setSelectedHubId,
    sessions,
    setIsCommandPaletteOpen,
    showToast,
  } = useApp();

  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];
  const activeSession = sessions.find((s) => s.hubId === selectedHubId && s.status === 'in_progress');

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'hub_manager', label: 'Hub Manager (Kamrul H.)' },
    { value: 'reception_officer', label: 'Reception Officer (Anisur R.)' },
    { value: 'local_doctor', label: 'Local Doctor (Dr. Arjun M.)' },
    { value: 'queue_coordinator', label: 'Queue Coordinator' },
    { value: 'equipment_officer', label: 'Equipment Officer' },
    { value: 'platform_super_admin', label: 'Platform Super Admin' },
    { value: 'auditor', label: 'Operations Auditor' },
  ];

  const chip = 'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-chip border px-3 text-[13px] font-semibold transition-all duration-150';

  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-line bg-paper px-7">
      {/* Left: Hub Selector & Session Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Sage 200 tile (Design System Ch 02) */}
          <div className="flex size-9 items-center justify-center rounded-chip bg-sage-200 text-pine">
            <PhHospital size={20} />
          </div>

          <div className="relative">
            <select
              value={selectedHubId}
              onChange={(e) => setSelectedHubId(e.target.value)}
              className="cursor-pointer appearance-none border-none bg-transparent pr-6 text-base font-semibold text-ink outline-none"
            >
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>
                  {language === 'bn' ? h.nameBn : h.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-slate">
              <PhCaretDown size={14} />
            </span>
          </div>
        </div>

        {/* Active Session Indicator */}
        {activeSession ? (
          <div className="inline-flex items-center gap-1.5 rounded-pill bg-mist px-2.5 py-1 text-xs font-medium text-pine">
            <span className="size-2 animate-pulse-live rounded-full bg-ok" />
            <span className="font-semibold">{language === 'bn' ? 'সেশন চলছে: ' : 'Session Active: '}</span>
            <span>{language === 'bn' ? activeSession.titleBn : activeSession.title}</span>
          </div>
        ) : (
          <div className="rounded-pill bg-draft-bg px-2.5 py-1 text-xs text-slate">
            {language === 'bn' ? 'কোনো সেশন সক্রিয় নেই' : 'No Active Session'}
          </div>
        )}
      </div>

      {/* Center: Quick Search Trigger */}
      <div
        onClick={() => setIsCommandPaletteOpen(true)}
        className="flex w-[320px] cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-bone px-4 py-2 text-sm text-slate"
      >
        <PhMagnifyingGlass size={16} color="#5B6B6E" />
        <span className="flex-1 truncate">
          {language === 'bn' ? 'টোকেন, রোগী বা হাব অনুসন্ধান...' : 'Search token, patient, ID (⌘K)...'}
        </span>
        <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 text-[11px]">⌘K</kbd>
      </div>

      {/* Right Controls: Language, Simple Mode, Role, Notification, Avatar */}
      <div className="flex items-center gap-3.5">
        {/* Language Toggle: "বাংলা · English" (PRD Chapter 10 & Design System Ch 03) */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          className={`${chip} border-line bg-bone text-ink`}
          title="Toggle Language / ভাষা পরিবর্তন করুন"
        >
          <PhTranslate size={16} color="#1D6B66" />
          <span>{language === 'en' ? 'বাংলা · English' : 'English · বাংলা'}</span>
        </button>

        {/* Simple Mode Toggle (Accessibility Ch 11) */}
        <button
          type="button"
          onClick={() => setSimpleMode(!simpleMode)}
          className={`${chip} ${simpleMode ? 'border-teal bg-teal text-white' : 'border-line bg-bone text-slate'}`}
          title="Simple Mode for elderly or low-strain operation"
        >
          <span>{language === 'bn' ? 'সহজ মোড' : 'Simple Mode'}</span>
        </button>

        {/* Role Switcher */}
        <div className="relative flex h-9 items-center rounded-chip border border-line bg-bone px-2.5 py-1">
          <select
            value={activeRole}
            onChange={(e) => {
              setActiveRole(e.target.value as UserRole);
              showToast(`Switched active role to: ${e.target.value.replace(/_/g, ' ')}`);
            }}
            className="cursor-pointer appearance-none border-none bg-transparent pr-4 text-xs font-semibold text-ink outline-none"
          >
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate">
            <PhCaretDown size={12} />
          </span>
        </div>

        {/* Notification Bell with Clay Badge (Design System Ch 7.8: notification badge is clay, 16px) */}
        <button
          type="button"
          onClick={() => showToast('2 unassigned encounters require staff attention.')}
          className="relative inline-flex size-11 cursor-pointer items-center justify-center rounded-full border-none bg-transparent hover:bg-mist"
          title="Notifications"
        >
          <PhBell size={20} color="#0B1F22" />
          <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-white shadow-[0_1px_3px_rgba(192,99,63,0.4)]">
            2
          </span>
        </button>

        {/* User Avatar */}
        <div
          className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-sage-200 text-sm font-bold text-pine shadow-[0_1px_4px_rgba(11,31,34,.1)]"
          title={currentHub.assignedManager}
        >
          KH
        </div>
      </div>
    </header>
  );
};
