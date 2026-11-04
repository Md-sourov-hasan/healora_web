import React from 'react';

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

export const StatusPill: React.FC<StatusPillProps> = ({
  label,
  variant = 'draft',
  showDot = true,
  className = '',
}) => {
  let bg = '#EEEDE8';
  let fg = '#5B6B6E';
  let dotColor = '#5B6B6E';

  switch (variant) {
    case 'completed':
    case 'active':
    case 'available':
      bg = '#E3F1E8';
      fg = '#22643F';
      dotColor = '#2F855A';
      break;
    case 'awaiting':
    case 'busy':
    case 'calibration_due':
      bg = '#F8EDD8';
      fg = '#80540F';
      dotColor = '#B7791F';
      break;
    case 'declined':
    case 'maintenance':
    case 'paused':
      bg = '#FBE4E4';
      fg = '#9B2424';
      dotColor = '#C53030';
      break;
    case 'upcoming':
    case 'in_service':
      bg = '#E6EEEA';
      fg = '#0F3D3A';
      dotColor = '#1D6B66';
      break;
    case 'teal':
      bg = '#1D6B66';
      fg = '#FFFFFF';
      dotColor = '#FFFFFF';
      break;
    case 'clay':
      bg = '#C0633F';
      fg = '#FFFFFF';
      dotColor = '#FFFFFF';
      break;
    default:
      bg = '#EEEDE8';
      fg = '#5B6B6E';
      dotColor = '#5B6B6E';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-semibold leading-none rounded-[8px] whitespace-nowrap ${className}`}
      style={{
        backgroundColor: bg,
        color: fg,
        height: '24px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '0 10px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 600,
      }}
    >
      {showDot && (
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '9999px',
            backgroundColor: dotColor,
            flexShrink: 0,
          }}
        />
      )}
      <span>{label}</span>
    </span>
  );
};

