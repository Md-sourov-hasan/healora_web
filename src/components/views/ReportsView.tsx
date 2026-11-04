import React from 'react';
import {
  PhChartBar,
  PhCheckCircle,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/useApp';

export const ReportsView: React.FC = () => {
  const { t, language, selectedHubId, hubs, showToast } = useApp();
  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'কার্যক্রম ও সক্ষমতা রিপোর্ট' : 'OPERATIONAL PERFORMANCE & METRICS'}
            </span>
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navReports}
          </h1>
          <p className="mt-1 mb-0 text-sm text-slate">
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
      <div className="mb-7 grid grid-cols-4 gap-4.5">
        <Card variant="card">
          <div className="mb-2 text-[13px] font-semibold text-slate">
            Hub Capacity Utilization
          </div>
          <div className="tabular-nums text-[32px] font-bold text-ink">
            78.5%
          </div>
          <div className="mt-1.5 text-xs font-medium text-ok">
            Within target operational band (70-85%)
          </div>
        </Card>

        <Card variant="card">
          <div className="mb-2 text-[13px] font-semibold text-slate">
            Attendance Rate
          </div>
          <div className="tabular-nums text-[32px] font-bold text-teal">
            91.4%
          </div>
          <div className="mt-1.5 text-xs text-slate">
            No-show rate controlled at 8.6%
          </div>
        </Card>

        <Card variant="card">
          <div className="mb-2 text-[13px] font-semibold text-slate">
            Median Arrival-to-Service Wait
          </div>
          <div className="tabular-nums text-[32px] font-bold text-ink">
            14 <span className="text-lg font-normal text-slate">mins</span>
          </div>
          <div className="mt-1.5 text-xs text-ok">
            Below 20-min operational SLA threshold
          </div>
        </Card>

        <Card variant="card">
          <div className="mb-2 text-[13px] font-semibold text-slate">
            Vitals Check Duration
          </div>
          <div className="tabular-nums text-[32px] font-bold text-ink">
            8.5 <span className="text-lg font-normal text-slate">mins</span>
          </div>
          <div className="mt-1.5 text-xs text-slate">
            Thorough protocol adherence confirmed
          </div>
        </Card>
      </div>

      {/* Visual Analytics Grid */}
      <div className="mb-7 grid grid-cols-2 gap-6">
        {/* Hourly Queue Inflow */}
        <Card variant="card">
          <h2 className="mt-0 mb-4 text-base font-semibold text-ink">
            Hourly Patient Flow (08:00 AM – 04:00 PM)
          </h2>
          <div className="flex flex-col gap-3">
            {[
              { hour: '08:00 AM - 09:00 AM', count: 12, max: 20 },
              { hour: '09:00 AM - 10:00 AM', count: 18, max: 20 },
              { hour: '10:00 AM - 11:00 AM', count: 16, max: 20 },
              { hour: '11:00 AM - 12:00 PM', count: 14, max: 20 },
              { hour: '12:00 PM - 01:00 PM', count: 8, max: 20 },
              { hour: '01:00 PM - 02:00 PM', count: 11, max: 20 },
            ].map((slot) => (
              <div key={slot.hour}>
                <div className="mb-1 flex justify-between text-xs text-slate">
                  <span>{slot.hour}</span>
                  <span className="font-semibold text-ink">{slot.count} patients</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-mist">
                  <div
                    className={`h-full ${slot.count > 16 ? 'bg-clay' : 'bg-teal'}`}
                    style={{ width: `${(slot.count / slot.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sync & Quality Integrity Metrics */}
        <Card variant="card">
          <h2 className="mt-0 mb-4 text-base font-semibold text-ink">
            Clinical Safety &amp; Protocol Integrity (PRD Section 13)
          </h2>
          <div className="flex flex-col gap-4">
            <div className="rounded-ctl bg-bone p-4">
              <div className="mb-1.5 text-[13px] font-semibold text-ink">
                Required Vitals Completeness Rate
              </div>
              <div className="tabular-nums text-2xl font-bold text-ok">
                98.2%
              </div>
              <div className="mt-0.5 text-xs text-slate">
                Encounters completed with 100% required checklist values before doctor signoff.
              </div>
            </div>

            <div className="rounded-ctl bg-bone p-4">
              <div className="mb-1.5 text-[13px] font-semibold text-ink">
                Repeat Measurement Rate
              </div>
              <div className="tabular-nums text-2xl font-bold text-ink">
                6.4%
              </div>
              <div className="mt-0.5 text-xs text-slate">
                Elevated blood pressure or glucose readings prompted protocol-driven rest &amp; repeat.
              </div>
            </div>

            <div className="flex items-start gap-1.5 rounded-xl bg-mist p-3.5 text-xs text-pine">
              <span className="mt-0.5 shrink-0">
                <PhCheckCircle size={14} color="#1D6B66" />
              </span>
              <span>
                Quality Safeguard: Individual staff throughput leaderboards are disabled to prevent rushed or unsafe care.
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
