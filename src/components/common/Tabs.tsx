import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

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
  <Tabs value={activeKey} onValueChange={onChange}>
  <TabsList className={className}>
    {options.map((opt) => {
      const isActive = opt.key === activeKey;
      return (
        <TabsTrigger
          key={opt.key}
          value={opt.key}
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
        </TabsTrigger>
      );
    })}
  </TabsList>
  </Tabs>
);
