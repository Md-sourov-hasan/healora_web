import React, { useState } from 'react';
import { PhShieldCheck, PhMapPin, PhX } from '../icons/PhosphorIcons';
import { useApp } from '../../context/AppContext';

export const BangladeshBanner: React.FC = () => {
  const { language } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="flex items-center justify-between border-b border-sage-200 bg-mist px-6 py-2 text-[13px] text-pine">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex items-center gap-1.5 rounded-md border border-line bg-paper px-2 py-0.5 text-[11px] font-semibold text-teal">
          <PhShieldCheck size={14} color="#1D6B66" />
          <span>PDPA 2026 &amp; DGHS Compliant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <PhMapPin size={14} color="#0F3D3A" />
          <span>
            {language === 'bn'
              ? 'স্থানীয় ডাটা সেন্টার (AP-DCC Gazipur Tier-IV) এ সংরক্ষিত | বিএমডিসি টেলিমেডিসিন গাইডলাইন অনুসৃত'
              : 'Local Data Residency: Hosted at AP-DCC Gazipur Tier-IV | BMDC Telemedicine Guidelines strictly enforced.'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1 text-[11px] text-slate">
          <span className="size-1.5 rounded-full bg-ok" />
          {language === 'bn' ? 'নিরাপদ এনক্রিপশন সক্রিয়' : 'End-to-end Encrypted'}
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="cursor-pointer border-none bg-transparent p-0.5 text-slate hover:text-ink"
          title="Dismiss"
        >
          <PhX size={14} />
        </button>
      </div>
    </div>
  );
};
