import React, { useState } from 'react';
import {
  PhCheckCircle,
  PhShieldCheck,
  PhPlus,
  PhArrowsClockwise,
} from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { ModalSheet } from '../common/ModalSheet';
import { useApp } from '../../context/AppContext';
import type { AppNotification } from '../../types';

export const NotificationsActivityView: React.FC = () => {
  const {
    t,
    language,
    notifications,
    selectedHubId,
    hubs,
    acknowledgeNotification,
    dismissNotification,
    navigate,
    showToast,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastChannel, setBroadcastChannel] = useState<'sms' | 'push_app' | 'internal_system'>('sms');

  const currentHub = hubs.find((h) => h.id === selectedHubId) || hubs[0];
  const hubNotifications = notifications.filter((n) => !n.hubId || n.hubId === selectedHubId);

  const filtered = categoryFilter === 'all'
    ? hubNotifications
    : hubNotifications.filter((n) => n.category === categoryFilter);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    // Check PRD Section 8.12 constraint: no raw vitals in payload
    const lower = broadcastMessage.toLowerCase();
    if (lower.includes('bp') || lower.includes('blood pressure') || lower.includes('sugar') || lower.includes('glucose')) {
      showToast('Notice: PRD 8.12 mandates generic notices only. Avoid clinical vitals in SMS/push payload.');
    }

    showToast(`Operational notice dispatched via ${broadcastChannel.toUpperCase()}.`);
    setIsBroadcastOpen(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
  };

  const getChannelBadge = (ch: AppNotification['channel']) => {
    switch (ch) {
      case 'sms':
        return <span className="rounded-md bg-sage-200 px-2 py-0.5 text-[11px] font-bold text-pine uppercase">SMS (BANGLA/ENG)</span>;
      case 'push_app':
        return <span className="rounded-md bg-teal px-2 py-0.5 text-[11px] font-bold text-white uppercase">APP PUSH</span>;
      case 'internal_system':
        return <span className="rounded-md bg-ink px-2 py-0.5 text-[11px] font-bold text-white uppercase">HUB DISPATCH</span>;
    }
  };

  const getStatusBadge = (st: AppNotification['status']) => {
    switch (st) {
      case 'delivered':
        return <StatusPill label="DELIVERED" variant="completed" />;
      case 'sent':
        return <StatusPill label="SENT" variant="active" />;
      case 'pending':
        return <StatusPill label="PENDING" variant="upcoming" />;
      case 'failed':
        return <StatusPill label="FAILED" variant="cancelled" />;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="text-xs font-semibold tracking-[0.04em] uppercase text-teal">
              {language === 'bn' ? 'সিস্টেম বার্তা ও কার্যক্রম লগ' : 'COMMUNICATIONS & DISPATCH ACTIVITY'}
            </span>
            <span className="size-2 animate-pulse-live rounded-full bg-ok" />
          </div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">
            {t.navNotifications}
          </h1>
          <p className="mt-1 mb-0 text-sm text-slate">
            {currentHub.name} • {language === 'bn'
              ? 'অ্যাপয়েন্টমেন্ট নিশ্চিতকরণ, কিউ টোকেন এসএমএস, ক্লিনিক্যাল অ্যালার্ট ও প্রাক-সেশন বার্তা'
              : 'SMS gateways, push alerts, session announcements and audited delivery trackers'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => showToast('Delivery receipts synced from telco gateway.')}
            icon={<PhArrowsClockwise size={16} />}
          >
            {language === 'bn' ? 'রিফ্রেশ' : 'Refresh Delivery'}
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsBroadcastOpen(true)}
            icon={<PhPlus size={16} />}
          >
            {language === 'bn' ? 'নতুন বার্তা পাঠান' : 'Dispatch Notice'}
          </Button>
        </div>
      </div>

      {/* PRD Section 8.12 Notification Privacy Guard */}
      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-sage-200 bg-mist px-5 py-3.5 text-[13px] text-pine">
        <PhShieldCheck size={20} color="#1D6B66" />
        <div className="flex-1">
          <strong>Privacy Constraint (PRD Section 8.12):</strong> Strictly generic messages with authenticated deep links are delivered. Diagnoses, raw vitals, lab reports, and prescriptions are never included in SMS, WhatsApp, or push notification previews.
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="mb-7 grid grid-cols-4 gap-4">
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Total Dispatches Today</div>
          <div className="mt-1 text-3xl font-bold text-ink">{hubNotifications.length}</div>
          <div className="mt-1 text-xs text-teal">Automated &amp; operational notices</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Delivered Successfully</div>
          <div className="mt-1 text-3xl font-bold text-ok">
            {hubNotifications.filter((n) => n.status === 'delivered').length}
          </div>
          <div className="mt-1 text-xs text-slate">Telco delivery receipt confirmed</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Urgent Alerts</div>
          <div className="mt-1 text-3xl font-bold text-clay">
            {hubNotifications.filter((n) => n.priority === 'urgent' || n.priority === 'high').length}
          </div>
          <div className="mt-1 text-xs text-clay font-semibold">Priority staff &amp; doctor alerts</div>
        </Card>
        <Card variant="card">
          <div className="text-xs font-semibold uppercase text-slate">Unacknowledged Alerts</div>
          <div className="mt-1 text-3xl font-bold text-ink">
            {hubNotifications.filter((n) => !n.acknowledged).length}
          </div>
          <div className="mt-1 text-xs text-slate">Requires staff acknowledgement</div>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="mb-5 flex items-center gap-2">
        <span className="text-xs font-semibold text-slate">Category:</span>
        {['all', 'appointment', 'queue', 'clinical_alert', 'sync', 'equipment', 'session'].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${categoryFilter === cat ? 'bg-ink text-white' : 'bg-paper border border-line text-slate hover:bg-mist'
              }`}
          >
            {cat === 'all' ? 'All Communications' : cat.replace('_', ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3.5">
        {filtered.map((item) => (
          <Card
            key={item.id}
            variant="card"
            className={`border-l-4! ${item.priority === 'urgent'
                ? 'border-l-bad!'
                : item.priority === 'high'
                  ? 'border-l-amber!'
                  : 'border-l-teal!'
              }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1.5 flex items-center gap-2">
                  {getChannelBadge(item.channel)}
                  {getStatusBadge(item.status)}
                  <span className="text-xs text-slate">• {item.timestamp}</span>
                  {item.hubName && <span className="text-xs font-semibold text-slate">[{item.hubName}]</span>}
                </div>

                <h3 className="m-0 text-base font-semibold text-ink">
                  {language === 'bn' ? item.titleBn : item.title}
                </h3>
                <p className="mt-1 mb-2 text-xs text-slate leading-relaxed">
                  {language === 'bn' ? item.messageBn : item.message}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate">
                  <span>Recipient: <strong className="text-ink">{item.recipientRoleOrPhone}</strong></span>
                  {item.acknowledged ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-ok">
                      <PhCheckCircle size={14} /> Acknowledged
                    </span>
                  ) : (
                    <span className="font-semibold text-amber">Pending acknowledgement</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col items-end gap-2">
                {item.deepLinkPath && (
                  <button
                    type="button"
                    onClick={() => navigate(item.deepLinkPath!)}
                    className="cursor-pointer rounded-xl bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-pine"
                  >
                    Open View ({item.deepLinkPath})
                  </button>
                )}

                {!item.acknowledged && (
                  <button
                    type="button"
                    onClick={() => acknowledgeNotification(item.id)}
                    className="cursor-pointer rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:bg-bone"
                  >
                    Acknowledge
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => dismissNotification(item.id)}
                  className="cursor-pointer text-[11px] text-slate hover:text-bad"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal: Dispatch Operational Notice */}
      <ModalSheet
        isOpen={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        title="Dispatch Operational Notice"
      >
        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div className="text-xs text-slate">
            Send an operational notification or session announcement to staff or booked patients. Strict adherence to generic text rule (PRD Section 8.12).
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Broadcast Title</label>
            <input
              type="text"
              required
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="e.g. Session Reminder: Checkup at Dhaka Central Hub"
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Delivery Channel</label>
            <select
              value={broadcastChannel}
              onChange={(e) => setBroadcastChannel(e.target.value as any)}
              className="h-10 w-full rounded-xl border border-line px-3 text-sm"
            >
              <option value="sms">SMS Gateway (Bangla / English)</option>
              <option value="push_app">Mobile App Push Notification</option>
              <option value="internal_system">Internal Hub Desk Broadcast</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate">Message Content (Generic &amp; Non-Clinical)</label>
            <textarea
              rows={3}
              required
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="e.g. Your scheduled health checkup is tomorrow at 09:00 AM at Healora Dhanmondi Hub. Please bring booking code. Authenticated link: healora.com/v/..."
              className="w-full rounded-xl border border-line p-3 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button variant="secondary" onClick={() => setIsBroadcastOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Dispatch Notification</Button>
          </div>
        </form>
      </ModalSheet>
    </div>
  );
};
