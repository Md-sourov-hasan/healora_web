import React, { useState, useEffect } from 'react';
import {
  PhMagnifyingGlass,
  PhUsers,
  PhHospital,
  PhCalendarBlank,
  PhX,
} from '../icons/PhosphorIcons';
import { useApp } from '../../context/AppContext';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    queue,
    patients,
    hubs,
    setActiveView,
    setSelectedHubId,
    language,
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
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(11, 31, 34, 0.45)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '100px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        style={{
          width: '580px',
          maxWidth: '92%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 12px 32px -10px rgba(11,31,34,.28)',
          border: '1px solid #DDE5E1',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 24px',
            borderBottom: '1px solid #DDE5E1',
          }}
        >
          <PhMagnifyingGlass size={20} color="#1D6B66" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'bn'
                ? 'রোগীর নাম, সিরিয়াল টোকেন বা হাব দিয়ে খুঁজুন...'
                : 'Search patients, tokens (e.g. A-101), hubs, or actions...'
            }
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--ui)',
              fontSize: '16px',
              color: '#0B1F22',
            }}
          />
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(false)}
            className="btn-icon btn-icon-ghost"
            style={{ width: '32px', height: '32px' }}
          >
            <PhX size={16} color="#5B6B6E" />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '12px 16px' }}>
          {/* Quick Actions */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase', padding: '4px 8px' }}>
              {language === 'bn' ? 'দ্রুত পদক্ষেপ' : 'Quick Navigation'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveView('queue');
                  setIsCommandPaletteOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #DDE5E1',
                  backgroundColor: '#F5F3EE',
                  color: '#0B1F22',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <PhUsers size={16} color="#1D6B66" />
                <span>{language === 'bn' ? 'লাইভ কিউ ড্যাশবোর্ড' : 'Open Live Queue'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveView('sessions');
                  setIsCommandPaletteOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #DDE5E1',
                  backgroundColor: '#F5F3EE',
                  color: '#0B1F22',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <PhCalendarBlank size={16} color="#1D6B66" />
                <span>{language === 'bn' ? 'নতুন সেশন / ক্যাম্প' : 'Manage Sessions'}</span>
              </button>
            </div>
          </div>

          {/* Queue Tokens Found */}
          {filteredQueue.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase', padding: '4px 8px' }}>
                {language === 'bn' ? 'সিরিয়াল টোকেন' : 'Live Queue Tokens'}
              </div>
              {filteredQueue.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveView('queue');
                    setIsCommandPaletteOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E6EEEA')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        backgroundColor: '#0B1F22',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                      }}
                    >
                      {item.ticketNumber}
                    </span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#0B1F22' }}>
                        {language === 'bn' ? item.patientNameBn : item.patientName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#5B6B6E' }}>
                        {item.stationName}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', color: '#1D6B66', fontWeight: 600 }}>
                    {item.currentStatus.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Patients Found */}
          {filteredPatients.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase', padding: '4px 8px' }}>
                {language === 'bn' ? 'রোগী তথ্য' : 'Registered Patients'}
              </div>
              {filteredPatients.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => {
                    setActiveView('patients');
                    setIsCommandPaletteOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E6EEEA')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PhUsers size={16} color="#1D6B66" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F22' }}>
                      {language === 'bn' ? pat.fullNameBn : pat.fullName}
                    </span>
                    <span style={{ fontSize: '11px', color: '#5B6B6E' }}>
                      ({pat.canonicalHealoraId})
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#5B6B6E' }}>
                    {pat.phone}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Hubs Found */}
          {filteredHubs.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#5B6B6E', textTransform: 'uppercase', padding: '4px 8px' }}>
                {language === 'bn' ? 'হাব কেন্দ্র' : 'Hubs'}
              </div>
              {filteredHubs.map((hub) => (
                <div
                  key={hub.id}
                  onClick={() => {
                    setSelectedHubId(hub.id);
                    setActiveView('hubs');
                    setIsCommandPaletteOpen(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E6EEEA')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PhHospital size={16} color="#1D6B66" />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F22' }}>
                      {language === 'bn' ? hub.nameBn : hub.name} ({hub.code})
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#5B6B6E' }}>
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
