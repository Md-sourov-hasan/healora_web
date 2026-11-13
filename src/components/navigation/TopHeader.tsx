import React from 'react';
import {
  PhMagnifyingGlass,
  PhBell,
  PhHospital,
  PhTranslate,
  PhCaretDown,
  PhShieldCheck,
  PhLockKey,
  PhArrowsClockwise,
} from '../icons/PhosphorIcons';
import { useApp } from '../../context/AppContext';
import { ROLES_CONFIG } from '../../config/rolesConfig';
import type { UserRole } from '../../types';

export const TopHeader: React.FC = () => {
  const {
    language,
    setLanguage,
    simpleMode,
    setSimpleMode,
    activeRole,
    availableRoles,
    setActiveRole,
    hubs,
    selectedHubId,
    setSelectedHubId,
    sessions,
    notifications,
    navigate,
    setIsCommandPaletteOpen,
    showToast,
    isAuthenticated,
    currentUser,
    apiStatus,
    apiLatency,
    roleAssignments,
    setIsAuthModalOpen,
    refreshBackendData,
  } = useApp();

  const activeSession = sessions.find((s) => s.hubId === selectedHubId && s.status === 'in_progress');
  const unreadNotifsCount = notifications.filter((n) => n.acknowledged === false).length;

  const roleOptions = availableRoles.map((roleKey) => {
    const cfg = ROLES_CONFIG[roleKey];
    return {
      value: roleKey,
      label: `${cfg.number}. ${language === 'bn' ? cfg.titleBn : cfg.title}`,
      scope: cfg.scopeLabel,
    };
  });

  const visibleHubs = activeRole === 'regional_ops_manager'
    ? hubs.filter((hub) => roleAssignments.some((assignment) => assignment.status === 'active' && assignment.role === activeRole && assignment.regionId === hub.regionId))
    : hubs;

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
              {visibleHubs.length === 0 ? (
                <option value="">{language === 'bn' ? 'কোনো হাব নেই' : 'No Hubs Registered'}</option>
              ) : (
                visibleHubs.map((h) => (
                  <option key={h.id} value={h.id}>
                    {language === 'bn' ? h.nameBn : h.name}
                  </option>
                ))
              )}
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

        {/* Backend API Live Status Pill */}
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className={`inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-xs font-semibold transition-colors ${
            apiStatus === 'connected'
              ? 'border-ok/30 bg-ok/10 text-pine hover:bg-ok/20'
              : apiStatus === 'connecting'
              ? 'border-amber-400/30 bg-amber-50 text-amber-800'
              : 'border-slate/30 bg-bone text-slate hover:bg-mist'
          }`}
          title="Click to view Backend API status and authenticate"
        >
          <span
            className={`size-2 rounded-full ${
              apiStatus === 'connected'
                ? 'bg-ok animate-pulse'
                : apiStatus === 'connecting'
                ? 'bg-amber-500 animate-ping'
                : 'bg-slate'
            }`}
          />
          <span>
            {apiStatus === 'connected'
              ? `API Live${apiLatency ? ` (${apiLatency}ms)` : ''}`
              : apiStatus === 'connecting'
              ? 'Connecting API...'
              : 'API Disconnected'}
          </span>
        </button>
      </div>

      {/* Center: Quick Search Trigger */}
      <div
        onClick={() => setIsCommandPaletteOpen(true)}
        className="flex w-[280px] cursor-pointer items-center gap-2.5 rounded-xl border border-line bg-bone px-4 py-2 text-sm text-slate hover:border-pine/30 transition-colors"
      >
        <PhMagnifyingGlass size={16} color="#5B6B6E" />
        <span className="flex-1 truncate">
          {language === 'bn' ? 'টোকেন, রোগী বা হাব অনুসন্ধান...' : 'Search token, patient, ID (⌘K)...'}
        </span>
        <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 text-[11px]">⌘K</kbd>
      </div>

      {/* Right Controls: Sync, Language, Simple Mode, Role, Notification, Auth/Avatar */}
      <div className="flex items-center gap-3">
        {/* Quick Sync Button */}
        <button
          type="button"
          onClick={() => {
            refreshBackendData();
            showToast('Syncing with Render Backend...');
          }}
          className="inline-flex size-9 items-center justify-center rounded-chip border border-line bg-bone text-slate hover:text-pine hover:bg-mist transition-colors"
          title="Refresh live data from backend"
        >
          <PhArrowsClockwise size={16} />
        </button>

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
            disabled={!isAuthenticated || availableRoles.length < 2}
            onChange={(e) => {
              setActiveRole(e.target.value as UserRole);
            }}
            aria-label="Select active assigned role"
            title={isAuthenticated ? 'Select an assigned role' : 'Sign in to select your role'}
            className="cursor-pointer appearance-none border-none bg-transparent pr-4 text-xs font-semibold text-ink outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            {!isAuthenticated && <option value={activeRole}>Sign in to select role</option>}
            {isAuthenticated && roleOptions.length === 0 && <option value={activeRole}>No assigned roles</option>}
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

        {/* Notification Bell with Clay Badge */}
        <button
          type="button"
          onClick={() => navigate('/notifications')}
          className="relative inline-flex size-10 cursor-pointer items-center justify-center rounded-full border-none bg-transparent hover:bg-mist"
          title="Notifications & Activity"
        >
          <PhBell size={20} color="#0B1F22" />
          {unreadNotifsCount > 0 && (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-clay text-[10px] font-bold text-white shadow-[0_1px_3px_rgba(192,99,63,0.4)]">
              {unreadNotifsCount}
            </span>
          )}
        </button>

        {/* Staff Authentication & Profile Button */}
        {isAuthenticated && currentUser ? (
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-ok/30 bg-ok/10 pl-2 pr-3 py-1 text-xs font-semibold text-pine hover:bg-ok/20 transition-colors"
            title={`Signed in as ${currentUser.name} (${currentUser.email})`}
          >
            <div className="flex size-7 items-center justify-center rounded-full bg-pine text-white text-[11px] font-bold">
              {currentUser.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="max-w-[90px] truncate">{currentUser.name.split(' ')[0]}</span>
            <PhShieldCheck size={14} className="text-ok" weight="bold" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="flex items-center gap-1.5 rounded-chip border border-pine/30 bg-pine/5 px-3 py-1.5 text-xs font-semibold text-pine hover:bg-pine hover:text-white transition-all"
            title="Sign in with staff credentials"
          >
            <PhLockKey size={14} />
            <span>{language === 'bn' ? 'স্টাফ লগইন' : 'Staff Login'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
