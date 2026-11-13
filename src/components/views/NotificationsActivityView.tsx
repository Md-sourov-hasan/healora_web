import React, { useState } from 'react';
import { PhShieldCheck } from '../icons/PhosphorIcons';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { StatusPill } from '../common/StatusPill';
import { useApp } from '../../context/useApp';

export const NotificationsActivityView: React.FC = () => {
  const { t, language, notifications, acknowledgeNotification, navigate, refreshBackendData } = useApp();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const filtered = categoryFilter === 'all' ? notifications : notifications.filter((item) => item.category === categoryFilter);
  const categories = ['all', ...new Set(notifications.map((item) => item.category))];

  return (
    <div className="mx-auto max-w-7xl px-10 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.04em] text-teal">Notification records</div>
          <h1 className="m-0 font-ui text-[28px] font-semibold text-ink">{t.navNotifications}</h1>
          <p className="mt-1 text-sm text-slate">Notification metadata returned for the authenticated account.</p>
        </div>
        <Button variant="secondary" onClick={() => void refreshBackendData()}>Refresh API data</Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate">Category:</span>
        {categories.map((category) => <button key={category} type="button" onClick={() => setCategoryFilter(category)} className={categoryFilter === category ? 'rounded-xl bg-ink px-3 py-1.5 text-xs font-semibold text-white' : 'rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-slate'}>{category === 'all' ? 'All' : category.replaceAll('_', ' ')}</button>)}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? <Card variant="card"><div className="flex items-center gap-2 text-sm text-slate"><PhShieldCheck size={18} />No notification records were returned.</div></Card> : filtered.map((item) => (
          <Card key={item.id} variant="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <StatusPill label={item.status.toUpperCase()} variant={item.status === 'failed' ? 'cancelled' : item.status === 'delivered' ? 'completed' : 'upcoming'} />
                  <span className="text-xs text-slate">{item.timestamp}</span>
                </div>
                <h2 className="m-0 text-base font-semibold text-ink">{language === 'bn' ? item.titleBn || item.title : item.title}</h2>
                <p className="mb-0 mt-1 text-xs text-slate">Category: {item.category.replaceAll('_', ' ')} · Record ID: <span className="font-mono">{item.id}</span></p>
                {item.relatedType && <p className="mb-0 mt-1 text-xs text-slate">Related: {item.relatedType} {item.relatedId ?? ''}</p>}
                <p className="mb-0 mt-1 text-xs text-slate">{item.acknowledged ? 'Marked read in this session.' : 'Read state is not included in the notification list response.'}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {item.deepLinkPath && <Button variant="secondary" onClick={() => navigate(item.deepLinkPath!)}>Open related view</Button>}
                <Button variant="secondary" disabled={item.acknowledged} onClick={() => void acknowledgeNotification(item.id)}>Mark read</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};