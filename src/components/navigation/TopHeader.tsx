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

  return (
    <header
      style={{
        height: '72px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #DDE5E1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      {/* Left: Hub Selector & Session Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#CFE0D8', // Sage 200 (Design System Ch 02)
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0F3D3A', // Pine
            }}
          >
            <PhHospital size={20} />
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={selectedHubId}
              onChange={(e) => setSelectedHubId(e.target.value)}
              style={{
                appearance: 'none',
                backgroundColor: 'transparent',
                border: 'none',
                fontFamily: 'var(--ui)',
                fontSize: '16px',
                fontWeight: 600,
                color: '#0B1F22',
                cursor: 'pointer',
                paddingRight: '24px',
                outline: 'none',
              }}
            >
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>
                  {language === 'bn' ? h.nameBn : h.name}
                </option>
              ))}
            </select>
            <span
              style={{
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: '#5B6B6E',
              }}
            >
              <PhCaretDown size={14} />
            </span>
          </div>
        </div>

        {/* Active Session Indicator */}
        {activeSession ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#E6EEEA', // Mist
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#0F3D3A',
              fontWeight: 500,
            }}
          >
            <span
              className="pulse-live"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '9999px',
                backgroundColor: '#2F855A',
              }}
            />
            <span style={{ fontWeight: 600 }}>
              {language === 'bn' ? 'সেশন চলছে: ' : 'Session Active: '}
            </span>
            <span>
              {language === 'bn' ? activeSession.titleBn : activeSession.title}
            </span>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#EEEDE8',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#5B6B6E',
            }}
          >
            {language === 'bn' ? 'কোনো সেশন সক্রিয় নেই' : 'No Active Session'}
          </div>
        )}
      </div>

      {/* Center: Quick Search Trigger */}
      <div
        onClick={() => setIsCommandPaletteOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#F5F3EE', // Bone
          border: '1px solid #DDE5E1',
          borderRadius: '12px',
          padding: '8px 16px',
          width: '320px',
          cursor: 'pointer',
          color: '#5B6B6E',
          fontSize: '14px',
        }}
      >
        <PhMagnifyingGlass size={16} color="#5B6B6E" />
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {language === 'bn' ? 'টোকেন, রোগী বা হাব অনুসন্ধান...' : 'Search token, patient, ID (⌘K)...'}
        </span>
        <kbd
          style={{
            fontSize: '11px',
            backgroundColor: '#FFFFFF',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #DDE5E1',
          }}
        >
          ⌘K
        </kbd>
      </div>

      {/* Right Controls: Language, Simple Mode, Role, Notification, Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Language Toggle: "বাংলা · English" (PRD Chapter 10 & Design System Ch 03) */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '36px',
            padding: '0 12px',
            borderRadius: '10px',
            backgroundColor: '#F5F3EE',
            border: '1px solid #DDE5E1',
            color: '#0B1F22',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          title="Toggle Language / ভাষা পরিবর্তন করুন"
        >
          <PhTranslate size={16} color="#1D6B66" />
          <span>{language === 'en' ? 'বাংলা · English' : 'English · বাংলা'}</span>
        </button>

        {/* Simple Mode Toggle (Accessibility Ch 11) */}
        <button
          type="button"
          onClick={() => setSimpleMode(!simpleMode)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            height: '36px',
            padding: '0 12px',
            borderRadius: '10px',
            backgroundColor: simpleMode ? '#1D6B66' : '#F5F3EE',
            border: simpleMode ? '1px solid #1D6B66' : '1px solid #DDE5E1',
            color: simpleMode ? '#FFFFFF' : '#5B6B6E',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          title="Simple Mode for elderly or low-strain operation"
        >
          <span>{language === 'bn' ? 'সহজ মোড' : 'Simple Mode'}</span>
        </button>

        {/* Role Switcher */}
        <div
          style={{
            position: 'relative',
            backgroundColor: '#F5F3EE',
            borderRadius: '10px',
            border: '1px solid #DDE5E1',
            padding: '4px 10px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <select
            value={activeRole}
            onChange={(e) => {
              setActiveRole(e.target.value as UserRole);
              showToast(`Switched active role to: ${e.target.value.replace(/_/g, ' ')}`);
            }}
            style={{
              appearance: 'none',
              backgroundColor: 'transparent',
              border: 'none',
              fontFamily: 'var(--ui)',
              fontSize: '12px',
              fontWeight: 600,
              color: '#0B1F22',
              cursor: 'pointer',
              paddingRight: '16px',
              outline: 'none',
            }}
          >
            {roleOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <span
            style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: '#5B6B6E',
            }}
          >
            <PhCaretDown size={12} />
          </span>
        </div>

        {/* Notification Bell with Clay Badge (Design System Ch 7.8: notification badge is clay, 16px) */}
        <button
          type="button"
          onClick={() => showToast('2 unassigned encounters require staff attention.')}
          className="btn-icon btn-icon-ghost"
          style={{ position: 'relative' }}
          title="Notifications"
        >
          <PhBell size={20} color="#0B1F22" />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '16px',
              height: '16px',
              borderRadius: '9999px',
              backgroundColor: '#C0633F', // Clay
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 1px 3px rgba(192, 99, 63, 0.4)',
            }}
          >
            2
          </span>
        </button>

        {/* User Avatar */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '9999px',
            backgroundColor: '#CFE0D8', // Sage 200
            color: '#0F3D3A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '14px',
            border: '2px solid #FFFFFF',
            boxShadow: '0 1px 4px rgba(11,31,34,.1)',
          }}
          title={currentHub.assignedManager}
        >
          KH
        </div>
      </div>
    </header>
  );
};
