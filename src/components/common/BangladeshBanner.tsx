import React, { useState } from 'react';
import { PhShieldCheck, PhX } from '../icons/PhosphorIcons';
import { useApp } from '../../context/useApp';

export const BangladeshBanner: React.FC = () => {
  const { language, apiStatus, apiLatency, apiErrors } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const statusLabel = apiStatus === 'connected'
    ? (language === 'bn' ? 'ব্যাকএন্ড সংযুক্ত' : 'Backend connected')
    : apiStatus === 'connecting'
      ? (language === 'bn' ? 'ব্যাকএন্ডে সংযোগ হচ্ছে' : 'Connecting to backend')
      : (language === 'bn' ? 'ব্যাকএন্ড সংযোগ বিচ্ছিন্ন' : 'Backend disconnected');
  const statusColor = apiStatus === 'connected' ? 'bg-ok' : apiStatus === 'connecting' ? 'bg-warn' : 'bg-bad';

  return (
    <div className="flex items-center justify-between border-b border-sage-200 bg-mist px-6 py-2 text-[13px] text-pine">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-2 py-0.5 text-[11px] font-semibold text-teal">
          <PhShieldCheck size={14} color="#1D6B66" />
          <span>{statusLabel}</span>
        </div>
        {apiLatency !== null && <span className="text-[11px] text-slate">{apiLatency} ms</span>}
        {apiErrors.length > 0 && <span className="text-[11px] font-semibold text-bad">{apiErrors.length} API data request{apiErrors.length === 1 ? '' : 's'} failed</span>}
      </div>
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1 text-[11px] text-slate">
          <span className={`size-1.5 rounded-full ${statusColor}`} />
          {language === 'bn' ? 'সরাসরি API অবস্থা' : 'Live API status'}
        </span>
        <button type="button" onClick={() => setDismissed(true)} className="cursor-pointer border-none bg-transparent p-0.5 text-slate hover:text-ink" title="Dismiss" aria-label="Dismiss backend status">
          <PhX size={14} />
        </button>
      </div>
    </div>
  );
};
