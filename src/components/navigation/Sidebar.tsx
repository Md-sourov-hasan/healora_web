import React from 'react';
import {
  PhHouse,
  PhHospital,
  PhCalendarBlank,
  PhClipboardText,
  PhUsers,
  PhFirstAidKit,
  PhGauge,
  PhChartBar,
  PhArrowsClockwise,
  PhShieldCheck,
  PhWaveform,
  PhGlobe,
  PhDesktop,
  PhActivity,
  PhBell,
  PhSlidersHorizontal,
  PhUserCircle,
} from '../icons/PhosphorIcons';
import { useApp } from '../../context/AppContext';
import { ROLES_CONFIG } from '../../config/rolesConfig';
import type { AppRoute } from '../../types';

interface NavItem {
  path: AppRoute;
  label: string;
  icon: React.ComponentType<any>;
  badge?: string;
  alertCount?: number;
}

interface NavSection {
  title: string;
  titleBn: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const {
    activeView,
    navigate,
    t,
    language,
    setIsCommandPaletteOpen,
    activeRole,
    exceptions,
    notifications,
    canAccessRoute,
    isReadOnlyRole,
  } = useApp();

  const activeExceptionCount = exceptions.filter((e) => e.status !== 'resolved').length;
  const unreadNotifCount = notifications.filter((n) => !n.acknowledged).length;

  const navSections: NavSection[] = [
    {
      title: 'Care Operations',
      titleBn: 'দৈনন্দিন কার্যক্রম',
      items: [
        { path: '/dashboard', label: t.navDashboard, icon: PhHouse },
        { path: '/queue', label: t.navQueue, icon: PhUsers, badge: 'Live' },
        { path: '/appointments', label: t.navAppointments, icon: PhClipboardText },
        { path: '/sessions', label: t.navSessions, icon: PhCalendarBlank },
        { path: '/encounters', label: t.navEncounters, icon: PhActivity },
        {
          path: '/exceptions',
          label: t.navExceptions,
          icon: PhArrowsClockwise,
          alertCount: activeExceptionCount > 0 ? activeExceptionCount : undefined,
        },
      ],
    },
    {
      title: 'Infrastructure & Stations',
      titleBn: 'অবকাঠামো ও স্টেশন',
      items: [
        { path: '/hubs', label: t.navHubs, icon: PhHospital },
        { path: '/regions', label: t.navRegions, icon: PhGlobe },
        { path: '/stations', label: t.navStations, icon: PhDesktop },
        { path: '/equipment', label: t.navEquipment, icon: PhGauge },
      ],
    },
    {
      title: 'People & Registry',
      titleBn: 'ব্যক্তি ও রেজিস্ট্রি',
      items: [
        { path: '/patients', label: t.navPatients, icon: PhUserCircle },
        { path: '/team', label: t.navTeam, icon: PhUsers },
      ],
    },
    {
      title: 'Governance & Activity',
      titleBn: 'আইনগত সম্মতি ও অডিট',
      items: [
        { path: '/reports', label: t.navReports, icon: PhChartBar },
        {
          path: '/notifications',
          label: t.navNotifications,
          icon: PhBell,
          alertCount: unreadNotifCount > 0 ? unreadNotifCount : undefined,
        },
        { path: '/settings', label: t.navSettings, icon: PhSlidersHorizontal },
      { path: '/catalog', label: t.navCatalog, icon: PhClipboardText },
        { path: '/audit-logs', label: t.navAuditLogs, icon: PhShieldCheck },
      ],
    },
  ];

  return (
    <aside className="sticky top-0 z-50 flex h-screen w-[260px] shrink-0 flex-col border-r border-line bg-paper">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-line px-5 pb-4 pt-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-teal text-white shadow-[0_2px_6px_rgba(29,107,102,0.25)]">
          <PhFirstAidKit size={22} color="#FFFFFF" />
        </div>
        <div>
          <h1 className="m-0 text-base font-bold tracking-tight text-ink">Healora</h1>
          <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-slate">Hub Platform</p>
        </div>
      </div>

      {/* Navigation Links Scrollable (Role-Filtered) */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
        {navSections
          .map((section) => ({
            ...section,
            items: section.items.filter((item) => canAccessRoute(item.path)),
          }))
          .filter((section) => section.items.length > 0)
          .map((section, sIdx) => (
          <div key={sIdx} className="mb-3">
            <div className="px-3 pb-1 pt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate/70">
              {language === 'bn' ? section.titleBn : section.title}
            </div>

            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = activeView === item.path;
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => navigate(item.path)}
                    className={`relative flex cursor-pointer items-center justify-between rounded-xl border-none px-3 py-2 text-left text-[13px] transition-colors duration-150 ${
                      isActive
                        ? 'bg-mist font-bold text-ink'
                        : 'bg-transparent font-medium text-slate hover:bg-bone'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`flex shrink-0 items-center ${isActive ? 'text-teal' : 'text-slate'}`}>
                        <Icon size={17} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 ml-1">
                      {item.badge && (
                        <span className="rounded-full bg-clay px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                          {item.badge}
                        </span>
                      )}
                      {item.alertCount && (
                        <span className="rounded-full bg-bad-bg px-1.5 py-px text-[10px] font-bold text-bad-fg">
                          {item.alertCount}
                        </span>
                      )}
                      {isActive && <span className="size-1 rounded-full bg-teal" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Assistant & Command Launcher */}
      <div className="border-t border-line p-3.5">
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-sage-200 bg-mist px-3 py-2 text-xs font-semibold text-pine transition-colors duration-150 hover:bg-sage-200"
        >
          <div className="flex items-center gap-2">
            <PhWaveform size={15} color="#1D6B66" />
            <span>Search &amp; Jump</span>
          </div>
          <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 text-[10px] text-slate">⌘K</kbd>
        </button>

        {/* Current Active Role Indicator Card */}
        <div className="mt-3 rounded-xl border border-line bg-bone/60 p-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate">Active Role</span>
            {isReadOnlyRole ? (
              <span className="rounded bg-bad-bg px-1.5 py-0.5 text-[10px] font-bold text-bad-fg">
                READ-ONLY
              </span>
            ) : (
              <span className="rounded bg-sage-200 px-1.5 py-0.5 text-[10px] font-bold text-pine uppercase">
                {ROLES_CONFIG[activeRole]?.scope || 'HUB'}
              </span>
            )}
          </div>
          <div className="mt-1 text-xs font-bold text-ink truncate">
            {language === 'bn' ? ROLES_CONFIG[activeRole]?.titleBn : ROLES_CONFIG[activeRole]?.title}
          </div>
          <div className="text-[10px] text-slate truncate mt-0.5" title={ROLES_CONFIG[activeRole]?.description}>
            {language === 'bn' ? ROLES_CONFIG[activeRole]?.descriptionBn : ROLES_CONFIG[activeRole]?.description}
          </div>
        </div>
      </div>
    </aside>
  );
};
