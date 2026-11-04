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
} from '../icons/PhosphorIcons';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, t, setIsCommandPaletteOpen, activeRole } = useApp();

  const navItems = [
    { key: 'overview', label: t.navOverview, icon: PhHouse },
    { key: 'hubs', label: t.navHubs, icon: PhHospital },
    { key: 'sessions', label: t.navSessions, icon: PhCalendarBlank },
    { key: 'appointments', label: t.navAppointments, icon: PhClipboardText },
    { key: 'queue', label: t.navQueue, icon: PhUsers, badge: 'Live' },
    { key: 'patients', label: t.navPatients, icon: PhClipboardText },
    { key: 'team', label: t.navTeam, icon: PhUsers },
    { key: 'equipment', label: t.navEquipment, icon: PhGauge },
    { key: 'reports', label: t.navReports, icon: PhChartBar },
    { key: 'exceptions', label: t.navExceptions, icon: PhArrowsClockwise, alertCount: 2 },
    { key: 'audit', label: t.navAudit, icon: PhShieldCheck },
  ];

  return (
    <aside className="sticky top-0 z-50 flex h-screen w-[248px] shrink-0 flex-col border-r border-line bg-paper">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-line px-5 pb-4 pt-6">
        <div className="flex size-10 items-center justify-center rounded-xl bg-teal text-white shadow-[0_2px_6px_rgba(29,107,102,0.25)]">
          <PhFirstAidKit size={22} color="#FFFFFF" />
        </div>
        <div>
          <h1 className="m-0 text-lg font-bold tracking-tight text-ink">Healora</h1>
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-slate">Hub Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = activeView === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveView(item.key)}
              className={`relative flex cursor-pointer items-center justify-between rounded-xl border-none px-3.5 py-2.5 text-left text-sm transition-colors duration-150 ${
                // Design System 7.8: active tab = label at 700 on Mist fill
                isActive ? 'bg-mist font-bold text-ink' : 'bg-transparent font-medium text-slate hover:bg-bone'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex items-center ${isActive ? 'text-teal' : 'text-slate'}`}>
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className="rounded-full bg-clay px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    {item.badge}
                  </span>
                )}
                {item.alertCount && (
                  <span className="rounded-full bg-bad-bg px-1.5 py-px text-[11px] font-bold text-bad-fg">
                    {item.alertCount}
                  </span>
                )}
                {/* 4px Teal active dot (Design System Ch 7.8) */}
                {isActive && <span className="size-1 rounded-full bg-teal" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Assistant & Command Launcher (Design System Ch 12: Assistant as a persistent mist button and Cmd+K) */}
      <div className="border-t border-line p-4">
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-sage-200 bg-mist px-3.5 py-2.5 text-[13px] font-semibold text-pine transition-colors duration-150 hover:bg-sage-200"
        >
          <div className="flex items-center gap-2">
            <PhWaveform size={16} color="#1D6B66" />
            <span>Voice &amp; Search</span>
          </div>
          <kbd className="rounded border border-line bg-paper px-1.5 py-0.5 text-[11px] text-slate">⌘K</kbd>
        </button>

        {/* Current Active Role Indicator */}
        <div className="mt-3 text-[11px] text-slate">
          <span>Role Scope: </span>
          <span className="font-semibold uppercase text-ink">{activeRole.replace(/_/g, ' ')}</span>
        </div>
      </div>
    </aside>
  );
};
