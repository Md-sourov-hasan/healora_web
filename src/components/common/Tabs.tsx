import React from 'react';

export interface TabOption {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  options: TabOption[];
  activeKey: string;
  onChange: (key: string) => void;
  className?: string;
}

export const SegmentedTabs: React.FC<TabsProps> = ({
  options,
  activeKey,
  onChange,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#EAE8E1',
        borderRadius: '12px',
        padding: '4px',
        gap: '4px',
        maxWidth: '100%',
        overflowX: 'auto',
      }}
    >
      {options.map((opt) => {
        const isActive = opt.key === activeKey;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onChange(opt.key)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'var(--ui)',
              color: isActive ? '#0B1F22' : '#5B6B6E',
              backgroundColor: isActive ? '#FFFFFF' : 'transparent',
              boxShadow: isActive ? '0 1px 3px rgba(11,31,34,.10)' : 'none',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{opt.label}</span>
            {opt.count !== undefined && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: isActive ? '#CFE0D8' : 'rgba(0,0,0,0.06)',
                  color: isActive ? '#0F3D3A' : '#5B6B6E',
                  padding: '2px 6px',
                  borderRadius: '9999px',
                }}
              >
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

