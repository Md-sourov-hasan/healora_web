import React from 'react';
import { Badge } from '../ui/badge';

export type StatusVariant =
  | 'completed'
  | 'awaiting'
  | 'declined'
  | 'upcoming'
  | 'draft'
  | 'teal'
  | 'clay'
  | 'in_service'
  | 'active'
  | 'paused'
  | 'busy'
  | 'available'
  | 'maintenance'
  | 'calibration_due';

interface StatusPillProps {
  label: string;
  variant?: StatusVariant;
  showDot?: boolean;
  className?: string;
}

const styles: Record<StatusVariant, { pill: string; dot: string }> = {
  completed: { pill: 'bg-ok-bg text-ok-fg', dot: 'bg-ok' },
  active: { pill: 'bg-ok-bg text-ok-fg', dot: 'bg-ok' },
  available: { pill: 'bg-ok-bg text-ok-fg', dot: 'bg-ok' },
  awaiting: { pill: 'bg-warn-bg text-warn-fg', dot: 'bg-warn' },
  busy: { pill: 'bg-warn-bg text-warn-fg', dot: 'bg-warn' },
  calibration_due: { pill: 'bg-warn-bg text-warn-fg', dot: 'bg-warn' },
  declined: { pill: 'bg-bad-bg text-bad-fg', dot: 'bg-bad' },
  maintenance: { pill: 'bg-bad-bg text-bad-fg', dot: 'bg-bad' },
  paused: { pill: 'bg-bad-bg text-bad-fg', dot: 'bg-bad' },
  upcoming: { pill: 'bg-mist text-pine', dot: 'bg-teal' },
  in_service: { pill: 'bg-mist text-pine', dot: 'bg-teal' },
  teal: { pill: 'bg-teal text-white', dot: 'bg-white' },
  clay: { pill: 'bg-clay text-white', dot: 'bg-white' },
  draft: { pill: 'bg-draft-bg text-slate', dot: 'bg-slate' },
};

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  variant = 'draft',
  showDot = true,
  className = '',
}) => {
  const s = styles[variant] ?? styles.draft;
  return (
    <Badge
      className={`capitalize ${s.pill} ${className}`}
    >
      {showDot && <span className={`size-2 shrink-0 rounded-full ${s.dot}`} />}
      <span>{label}</span>
    </Badge>
  );
};
