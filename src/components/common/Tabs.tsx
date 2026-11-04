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

export const SegmentedTabs: React.FC<TabsProps> = ({ options, activeKey, onChange, className = '' }) => (
  <div className={`inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-tab p-1 ${className}`}>
    {options.map((opt) => {
      const isActive = opt.key === activeKey;
      return (
        <button
          key={opt.key}
          type="button"
          onClick={() => onChange(opt.key)}
          className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[9px] border-none px-4 py-2 text-sm transition-all duration-150 ${
            isActive
              ? 'bg-paper font-semibold text-ink shadow-[0_1px_3px_rgba(11,31,34,.10)]'
              : 'bg-transparent font-medium text-slate hover:text-ink'
          }`}
        >
          <span>{opt.label}</span>
          {opt.count !== undefined && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                isActive ? 'bg-sage-200 text-pine' : 'bg-black/5 text-slate'
              }`}
            >
              {opt.count}
            </span>
          )}
        </button>
      );
    })}
  </div>
);
