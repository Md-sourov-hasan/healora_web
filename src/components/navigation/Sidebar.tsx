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
    <aside
      style={{
        width: '248px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #DDE5E1',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px 16px 20px',
          borderBottom: '1px solid #DDE5E1',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: '#1D6B66',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            boxShadow: '0 2px 6px rgba(29, 107, 102, 0.25)',
          }}
        >
          <PhFirstAidKit size={22} color="#FFFFFF" />
        </div>
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: '#0B1F22',
              fontFamily: 'var(--ui)',
            }}
          >
            Healora
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: '11px',
              fontWeight: 600,
              color: '#5B6B6E',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            Hub Platform
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {navItems.map((item) => {
          const isActive = activeView === item.key;
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveView(item.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--ui)',
                fontSize: '14px',
                fontWeight: isActive ? 700 : 500, // Design System 7.8: active tab = label at 700
                color: isActive ? '#0B1F22' : '#5B6B6E',
                backgroundColor: isActive ? '#E6EEEA' : 'transparent', // Mist fill
                textAlign: 'left',
                transition: 'background-color 0.15s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = '#F5F3EE';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    color: isActive ? '#1D6B66' : '#5B6B6E',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon size={18} />
                </span>
                <span>{item.label}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: '#C0633F',
                      color: '#FFFFFF',
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
                {item.alertCount && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#FBE4E4',
                      color: '#9B2424',
                      padding: '1px 6px',
                      borderRadius: '9999px',
                    }}
                  >
                    {item.alertCount}
                  </span>
                )}
                {/* 4px Teal active dot (Design System Ch 7.8) */}
                {isActive && (
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '9999px',
                      backgroundColor: '#1D6B66',
                    }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Assistant & Command Launcher (Design System Ch 12: Assistant as a persistent mist button and Cmd+K) */}
      <div style={{ padding: '16px', borderTop: '1px solid #DDE5E1' }}>
        <button
          type="button"
          onClick={() => setIsCommandPaletteOpen(true)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            backgroundColor: '#E6EEEA', // Mist
            border: '1px solid #CFE0D8',
            color: '#0F3D3A',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#CFE0D8')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#E6EEEA')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PhWaveform size={16} color="#1D6B66" />
            <span>Voice &amp; Search</span>
          </div>
          <kbd
            style={{
              fontSize: '11px',
              padding: '2px 6px',
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
              border: '1px solid #DDE5E1',
              color: '#5B6B6E',
            }}
          >
            ⌘K
          </kbd>
        </button>

        {/* Current Active Role Indicator */}
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#5B6B6E' }}>
          <span>Role Scope: </span>
          <span style={{ fontWeight: 600, color: '#0B1F22' }}>
            {activeRole.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </aside>
  );
};

