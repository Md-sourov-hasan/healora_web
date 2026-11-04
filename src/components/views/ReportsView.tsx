import React from 'react';
import {
  PhChartBar,
  PhCheckCircle,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const ReportsView: React.FC = () => {
  const { t, language, selectedHubId, hubs, showToast } = useApp();
  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];

  return (
    <div style={{ padding: '32px 40px', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1D6B66', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'bn' ? 'কার্যক্রম ও সক্ষমতা রিপোর্ট' : 'OPERATIONAL PERFORMANCE & METRICS'}
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 600,
              color: '#0B1F22',
              fontFamily: 'var(--ui)',
            }}
          >
            {t.navReports}
          </h1>
          <p style={{ margin: '4px 0 0 0', color: '#5B6B6E', fontSize: '14px' }}>
            {currentHub.name} • {language === 'bn'
              ? 'গড় অপেক্ষার সময়, সেশন সক্ষমতা ব্যবহার ও মোবাইল সিঙ্ক নির্ভরযোগ্যতা'
              : 'Aggregated, de-identified operational throughput, median wait duration and sync reliability'}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => showToast('Exporting de-identified operational summary CSV...')}
          icon={<PhChartBar size={16} />}
        >
          {language === 'bn' ? 'রিপোর্ট ডাউনলোড (অপারেশনাল)' : 'Export Operational Report'}
        </Button>
      </div>

      {/* KPI Cards 4-up */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px', marginBottom: '28px' }}>
        <Card variant="card">
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '8px' }}>
            Hub Capacity Utilization
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0B1F22' }} className="num-tabular">
            78.5%
          </div>
          <div style={{ fontSize: '12px', color: '#2F855A', marginTop: '6px', fontWeight: 500 }}>
            Within target operational band (70-85%)
          </div>
        </Card>

        <Card variant="card">
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '8px' }}>
            Attendance Rate
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1D6B66' }} className="num-tabular">
            91.4%
          </div>
          <div style={{ fontSize: '12px', color: '#5B6B6E', marginTop: '6px' }}>
            No-show rate controlled at 8.6%
          </div>
        </Card>

        <Card variant="card">
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '8px' }}>
            Median Arrival-to-Service Wait
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0B1F22' }} className="num-tabular">
            14 <span style={{ fontSize: '18px', fontWeight: 400, color: '#5B6B6E' }}>mins</span>
          </div>
          <div style={{ fontSize: '12px', color: '#2F855A', marginTop: '6px' }}>
            Below 20-min operational SLA threshold
          </div>
        </Card>

        <Card variant="card">
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#5B6B6E', marginBottom: '8px' }}>
            Vitals Check Duration
          </div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0B1F22' }} className="num-tabular">
            8.5 <span style={{ fontSize: '18px', fontWeight: 400, color: '#5B6B6E' }}>mins</span>
          </div>
          <div style={{ fontSize: '12px', color: '#5B6B6E', marginTop: '6px' }}>
            Thorough protocol adherence confirmed
          </div>
        </Card>
      </div>

      {/* Visual Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        {/* Hourly Queue Inflow */}
        <Card variant="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0B1F22', margin: '0 0 16px 0' }}>
            Hourly Patient Flow (08:00 AM – 04:00 PM)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { hour: '08:00 AM - 09:00 AM', count: 12, max: 20 },
              { hour: '09:00 AM - 10:00 AM', count: 18, max: 20 },
              { hour: '10:00 AM - 11:00 AM', count: 16, max: 20 },
              { hour: '11:00 AM - 12:00 PM', count: 14, max: 20 },
              { hour: '12:00 PM - 01:00 PM', count: 8, max: 20 },
              { hour: '01:00 PM - 02:00 PM', count: 11, max: 20 },
            ].map((slot) => (
              <div key={slot.hour}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#5B6B6E', marginBottom: '4px' }}>
                  <span>{slot.hour}</span>
                  <span style={{ fontWeight: 600, color: '#0B1F22' }}>{slot.count} patients</span>
                </div>
                <div style={{ width: '100%', height: '8px', borderRadius: '9999px', backgroundColor: '#E6EEEA', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${(slot.count / slot.max) * 100}%`,
                      height: '100%',
                      backgroundColor: slot.count > 16 ? '#C0633F' : '#1D6B66',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sync & Quality Integrity Metrics */}
        <Card variant="card">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#0B1F22', margin: '0 0 16px 0' }}>
            Clinical Safety &amp; Protocol Integrity (PRD Section 13)
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F5F3EE', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F22', marginBottom: '6px' }}>
                Required Vitals Completeness Rate
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#2F855A' }} className="num-tabular">
                98.2%
              </div>
              <div style={{ fontSize: '12px', color: '#5B6B6E', marginTop: '2px' }}>
                Encounters completed with 100% required checklist values before doctor signoff.
              </div>
            </div>

            <div style={{ backgroundColor: '#F5F3EE', padding: '16px', borderRadius: '14px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0B1F22', marginBottom: '6px' }}>
                Repeat Measurement Rate
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#0B1F22' }} className="num-tabular">
                6.4%
              </div>
              <div style={{ fontSize: '12px', color: '#5B6B6E', marginTop: '2px' }}>
                Elevated blood pressure or glucose readings prompted protocol-driven rest &amp; repeat.
              </div>
            </div>

            <div style={{ backgroundColor: '#E6EEEA', padding: '14px', borderRadius: '12px', fontSize: '12px', color: '#0F3D3A' }}>
              <PhCheckCircle size={14} color="#1D6B66" style={{ display: 'inline', marginRight: '6px' }} />
              Quality Safeguard: Individual staff throughput leaderboards are disabled to prevent rushed or unsafe care.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
