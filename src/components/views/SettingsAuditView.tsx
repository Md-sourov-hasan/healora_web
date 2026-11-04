import React from 'react';
import {
  PhShieldCheck,
  PhCheckCircle,
  PhMapPin,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { StatusPill } from '../common/StatusPill';
import { useApp } from '../../context/useApp';

export const SettingsAuditView: React.FC = () => {
  const { t, language, auditLogs } = useApp();

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
            {language === 'bn' ? 'নিরাপত্তা ও আইনগত সম্মতি' : 'SECURITY, AUDIT TRAIL & REGULATORY GATES'}
          </span>
          <StatusPill label="Tier-IV Data Residency" variant="active" />
        </div>
        <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
          {t.navAudit}
        </h1>
        <p className="mt-1 mb-0 text-sm text-slate">
          {language === 'bn'
            ? 'অপরিবর্তনীয় সিস্টেম অডিট লগ ও বাংলাদেশ স্বাস্থ্য তথ্য সুরক্ষা গেজেট ২০২৬ বাস্তবায়ন'
            : 'Immutable system audit logging and compliance status under Bangladesh PDPA 2026 & DGHS Telehealth Guidelines'}
        </p>
      </div>

      {/* Compliance Overview Grid (PRD Section 17) */}
      <div className="mb-8 grid grid-cols-3 gap-5">
        <Card variant="card" className="border-t-3! border-t-teal!">
          <div className="mb-2.5 flex items-center gap-2">
            <PhShieldCheck size={20} color="#1D6B66" />
            <h2 className="m-0 text-[15px] font-semibold text-ink">
              Personal Data Protection Act, 2026
            </h2>
          </div>
          <p className="mt-0 mb-2.5 text-[13px] leading-normal text-slate">
            Health-related information classified as sensitive personal data. Specific, voluntary informed consent captured for each hub encounter.
          </p>
          <StatusPill label="Act No. 63 of 2026 Compliant" variant="completed" />
        </Card>

        <Card variant="card" className="border-t-3! border-t-teal!">
          <div className="mb-2.5 flex items-center gap-2">
            <PhMapPin size={20} color="#1D6B66" />
            <h2 className="m-0 text-[15px] font-semibold text-ink">
              DGHS Telehealth Data Residency
            </h2>
          </div>
          <p className="mt-0 mb-2.5 text-[13px] leading-normal text-slate">
            Zero foreign cloud storage for patient vitals. Primary database and encrypted backups hosted within Bangladesh at AP-DCC Gazipur Tier-IV.
          </p>
          <StatusPill label="Local Residency Verified" variant="completed" />
        </Card>

        <Card variant="card" className="border-t-3! border-t-teal!">
          <div className="mb-2.5 flex items-center gap-2">
            <PhCheckCircle size={20} color="#1D6B66" />
            <h2 className="m-0 text-[15px] font-semibold text-ink">
              BMDC Telemedicine Guidelines
            </h2>
          </div>
          <p className="mt-0 mb-2.5 text-[13px] leading-normal text-slate">
            Registered practitioner verification, explicit consent for remote consultations, and health worker measurement provenance preserved.
          </p>
          <StatusPill label="BMDC Framework Aligned" variant="completed" />
        </Card>
      </div>

      {/* Immutable Audit Log Table (PRD Section 16.2) */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="m-0 text-lg font-semibold text-ink">
            {language === 'bn' ? 'অপরিবর্তনীয় অডিট ট্রেইল (সর্বশেষ কার্যক্রম)' : 'Immutable Operations Audit Trail'}
          </h2>
          <span className="text-xs text-slate">
            Append-only verification log • <strong>{auditLogs.length} events logged</strong>
          </span>
        </div>

        <Card variant="card" className="p-0! overflow-hidden">
          <table className="w-full border-collapse text-left font-ui">
            <thead>
              <tr className="border-b border-line bg-bone">
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                  Timestamp
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                  Actor &amp; Role
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                  Action Executed
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                  Scope / Hub
                </th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase text-slate">
                  Audit Details
                </th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase text-slate">
                  Outcome
                </th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-line transition-colors duration-100 last:border-b-0 hover:bg-bone"
                >
                  {/* Timestamp */}
                  <td className="tabular-nums px-5 py-4 text-[13px] text-slate">
                    {log.timestamp}
                  </td>

                  {/* Actor & Role */}
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-ink">
                      {log.actorName}
                    </div>
                    <div className="text-[11px] font-semibold uppercase text-teal">
                      {log.actorRole.replace('_', ' ')}
                    </div>
                  </td>

                  {/* Action */}
                  <td className="px-5 py-4 text-sm font-medium text-ink">
                    {log.action}
                  </td>

                  {/* Scope */}
                  <td className="px-5 py-4 text-[13px] text-slate">
                    {log.hubName}
                  </td>

                  {/* Details */}
                  <td className="max-w-xs px-5 py-4 text-[13px] text-slate">
                    {log.details}
                  </td>

                  {/* Outcome */}
                  <td className="px-5 py-4 text-right">
                    <StatusPill
                      label={log.outcome.toUpperCase()}
                      variant={
                        log.outcome === 'success'
                          ? 'completed'
                          : log.outcome === 'flagged'
                            ? 'awaiting'
                            : 'declined'
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
};
