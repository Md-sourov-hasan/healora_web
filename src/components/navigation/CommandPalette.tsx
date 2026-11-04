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
      className="fixed inset-0 z-[1000] flex items-start justify-center bg-ink/45 pt-[100px] backdrop-blur-xs"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        className="flex w-[580px] max-w-[92%] flex-col overflow-hidden rounded-card border border-line bg-paper shadow-float"
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
                ? 'রোগীর নাম, সিরিয়াল টোকেন বা হাব দিয়ে খুঁজুন...'
                : 'Search patients, tokens (e.g. A-101), hubs, or actions...'
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
        <div className="max-h-[380px] overflow-y-auto px-4 py-3">
          {/* Quick Actions */}
          <div className="mb-4">
            <div className="px-2 py-1 text-[11px] font-semibold uppercase text-slate">
              {language === 'bn' ? 'দ্রুত পদক্ষেপ' : 'Quick Navigation'}
            </div>
            <div className="mt-1 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveView('queue');
                  setIsCommandPaletteOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-chip border border-line bg-bone px-3 py-2.5 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-mist"
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
                className="flex cursor-pointer items-center gap-2 rounded-chip border border-line bg-bone px-3 py-2.5 text-left text-[13px] font-semibold text-ink transition-colors hover:bg-mist"
              >
                <PhCalendarBlank size={16} color="#1D6B66" />
                <span>{language === 'bn' ? 'নতুন সেশন / ক্যাম্প' : 'Manage Sessions'}</span>
              </button>
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
                    setActiveView('queue');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-pill px-3 py-2 transition-colors duration-150 hover:bg-mist"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="rounded-[6px] bg-ink px-2 py-[3px] text-xs font-bold text-white">
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
              {filteredPatients.map((pat) => (
                <div
                  key={pat.id}
                  onClick={() => {
                    setActiveView('patients');
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex cursor-pointer items-center justify-between rounded-pill px-3 py-2 transition-colors duration-150 hover:bg-mist"
                >
                  <div className="flex items-center gap-2">
                    <PhUsers size={16} color="#1D6B66" />
                    <span className="text-[13px] font-semibold text-ink">
                      {language === 'bn' ? pat.fullNameBn : pat.fullName}
                    </span>
                    <span className="text-[11px] text-slate">
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
