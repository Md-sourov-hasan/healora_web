import React, { useState } from 'react';
import { PhShieldCheck, PhMapPin, PhX } from '../icons/PhosphorIcons';
import { useApp } from '../../context/AppContext';

export const BangladeshBanner: React.FC = () => {
  const { language } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      style={{
        backgroundColor: '#E6EEEA', // Mist
        borderBottom: '1px solid #CFE0D8',
        padding: '8px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: '#0F3D3A', // Pine
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FFFFFF',
            padding: '3px 8px',
            borderRadius: '6px',
            fontWeight: 600,
            fontSize: '11px',
            color: '#1D6B66',
            border: '1px solid #DDE5E1',
          }}
        >
          <PhShieldCheck size={14} color="#1D6B66" />
          <span>PDPA 2026 &amp; DGHS Compliant</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PhMapPin size={14} color="#0F3D3A" />
          <span>
            {language === 'bn'
              ? 'স্থানীয় ডাটা সেন্টার (AP-DCC Gazipur Tier-IV) এ সংরক্ষিত | বিএমডিসি টেলিমেডিসিন গাইডলাইন অনুসৃত'
              : 'Local Data Residency: Hosted at AP-DCC Gazipur Tier-IV | BMDC Telemedicine Guidelines strictly enforced.'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            fontSize: '11px',
            color: '#5B6B6E',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '9999px',
              backgroundColor: '#2F855A',
            }}
          />
          {language === 'bn' ? 'নিরাপদ এনক্রিপশন সক্রিয়' : 'End-to-end Encrypted'}
        </span>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#5B6B6E',
            cursor: 'pointer',
            padding: '2px',
          }}
          title="Dismiss"
        >
          <PhX size={14} />
        </button>
      </div>
    </div>
  );
};

