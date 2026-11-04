import React from 'react';

export interface IconProps {
  size?: number;
  weight?: 'regular' | 'bold' | 'fill';
  color?: string;
  className?: string;
}

export const PhHouse: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M152 208V160a24 24 0 0 0-48 0v48" />
    <path d="M208 208H48a8 8 0 0 1-8-8V104a8 8 0 0 1 2.87-6.11l80-68.57a8 8 0 0 1 10.26 0l80 68.57a8 8 0 0 1 2.87 6.11v96a8 8 0 0 1-8 8Z" />
  </svg>
);

export const PhHospital: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M32 216h192" />
    <path d="M48 216V40a8 8 0 0 1 8-8h144a8 8 0 0 1 8 8v176" />
    <path d="M128 72v48M104 96h48" strokeWidth="18" />
    <path d="M104 216v-40a8 8 0 0 1 8-8h32a8 8 0 0 1 8 8v40" />
  </svg>
);

export const PhHeartbeat: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M32 136h48l24-48 40 96 28-64 16 16h36" />
    <path d="M178.4 40.4a58 58 0 0 0-84.8 0L128 72l34.4-31.6a58 58 0 0 1 82 82l-88.4 88-88.4-88a58 58 0 0 1 18-97" strokeDasharray="3 3" opacity="0.4" />
  </svg>
);

export const PhFirstAidKit: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="32" y="72" width="192" height="144" rx="16" />
    <path d="M88 72V48a16 16 0 0 1 16-16h48a16 16 0 0 1 16 16v24" />
    <path d="M128 112v64M96 144h64" strokeWidth="18" />
  </svg>
);

export const PhCalendarBlank: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="40" y="48" width="176" height="176" rx="16" />
    <path d="M176 24v48M80 24v48M40 96h176" />
  </svg>
);

export const PhUserCircle: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="128" cy="128" r="96" />
    <circle cx="128" cy="120" r="40" />
    <path d="M63.8 199.37a72 72 0 0 1 128.4 0" />
  </svg>
);

export const PhBell: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M56 112a72 72 0 0 1 144 0c0 35.82 8.3 56.6 14.9 66.82A8 8 0 0 1 208 192H48a8 8 0 0 1-6.9-13.18C47.7 168.6 56 147.82 56 112Z" />
    <path d="M96 192a32 32 0 0 0 64 0" />
  </svg>
);

export const PhMagnifyingGlass: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="112" cy="112" r="80" />
    <path d="m168.49 168.49 51.51 51.51" />
  </svg>
);

export const PhMicrophone: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="96" y="24" width="64" height="120" rx="32" />
    <path d="M48 112a80 80 0 0 0 160 0M128 192v40M88 232h80" />
  </svg>
);

export const PhArrowUpRight: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M64 192 192 64M88 64h104v104" />
  </svg>
);

export const PhCaretLeft: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m160 208-80-80 80-80" />
  </svg>
);

export const PhCaretRight: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m96 48 80 80-80 80" />
  </svg>
);

export const PhCaretDown: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m48 96 80 80 80-80" />
  </svg>
);

export const PhCheckCircle: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="128" cy="128" r="96" />
    <path d="m88 128 28 28 56-56" strokeWidth="18" />
  </svg>
);

export const PhMapPin: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M128 224s80-82.35 80-128a80 80 0 0 0-160 0c0 45.65 80 128 80 128Z" />
    <circle cx="128" cy="96" r="32" />
  </svg>
);

export const PhTranslate: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M192 216l-48-96-48 96M112 184h64" />
    <path d="M32 56h112M88 32v24c0 48-36 80-64 96" />
    <path d="M60 88c12 20 28 36 48 46" />
  </svg>
);

export const PhShieldCheck: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M48 40h160v88c0 60-72 96-80 96-8 0-80-36-80-96Z" />
    <path d="m96 124 24 24 44-44" strokeWidth="18" />
  </svg>
);

export const PhClipboardText: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M88 48H56a8 8 0 0 0-8 8v160a8 8 0 0 0 8 8h144a8 8 0 0 0 8-8V56a8 8 0 0 0-8-8h-32" />
    <rect x="88" y="24" width="80" height="48" rx="8" />
    <path d="M88 120h80M88 152h80M88 184h48" />
  </svg>
);

export const PhFolder: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M32 80a8 8 0 0 1 8-8h53.33a8 8 0 0 1 5.34 2.05L128 96h88a8 8 0 0 1 8 8v104a8 8 0 0 1-8 8H40a8 8 0 0 1-8-8Z" />
  </svg>
);

export const PhGauge: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M32 160a96 96 0 1 1 192 0c0 14.54-3.23 28.32-9 40H41c-5.77-11.68-9-25.46-9-40Z" />
    <circle cx="128" cy="160" r="16" />
    <path d="m139.31 148.69 40.69-40.69" strokeWidth="18" />
  </svg>
);

export const PhPill: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="49.94" y="49.94" width="156.12" height="78.06" rx="39.03" transform="rotate(45 128 88.97)" />
    <line x1="88.97" y1="128" x2="167.03" y2="128" transform="rotate(-45 128 128)" strokeWidth="16" />
  </svg>
);

export const PhWaveform: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="40" y1="104" x2="40" y2="152" />
    <line x1="72" y1="72" x2="72" y2="184" />
    <line x1="104" y1="40" x2="104" y2="216" />
    <line x1="136" y1="88" x2="136" y2="168" />
    <line x1="168" y1="56" x2="168" y2="200" />
    <line x1="200" y1="96" x2="200" y2="160" />
  </svg>
);

export const PhArrowsClockwise: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M192 104V56h-48M64 152v48h48" />
    <path d="M197.68 88A96 96 0 0 0 49.33 116M58.32 168a96 96 0 0 0 148.35-28" />
  </svg>
);

export const PhWarningCircle: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="128" cy="128" r="96" />
    <line x1="128" y1="80" x2="128" y2="136" strokeWidth="18" />
    <circle cx="128" cy="172" r="8" fill={color} />
  </svg>
);

export const PhX: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="200" y1="56" x2="56" y2="200" />
    <line x1="200" y1="200" x2="56" y2="56" />
  </svg>
);

export const PhPlus: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="128" y1="48" x2="128" y2="208" />
    <line x1="48" y1="128" x2="208" y2="128" />
  </svg>
);

export const PhGear: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="128" cy="128" r="40" />
    <path d="M128 32v24M128 200v24M32 128h24M200 128h24M60.1 60.1l17 17M178.9 178.9l17 17M60.1 195.9l17-17M178.9 77.1l17-17" />
  </svg>
);

export const PhShareNetwork: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="176" cy="64" r="24" />
    <circle cx="64" cy="128" r="24" />
    <circle cx="176" cy="192" r="24" />
    <line x1="85.47" y1="117.27" x2="154.53" y2="74.73" />
    <line x1="85.47" y1="138.73" x2="154.53" y2="181.27" />
  </svg>
);

export const PhChartBar: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M224 208H32V48" />
    <rect x="72" y="128" width="32" height="80" rx="4" />
    <rect x="128" y="96" width="32" height="112" rx="4" />
    <rect x="184" y="64" width="32" height="144" rx="4" />
  </svg>
);

export const PhUsers: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="88" cy="104" r="36" />
    <path d="M24 192a64 64 0 0 1 128 0" />
    <path d="M164 72a36 36 0 0 1 0 64" />
    <path d="M176 192a64 64 0 0 0-48-52" />
  </svg>
);

export const PhCloudCheck: React.FC<IconProps> = ({ size = 20, color = 'currentColor', className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 256 256" fill="none" stroke={color} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M80 128a80 80 0 1 1 144 48H80a48 48 0 0 1 0-96 46.5 46.5 0 0 1 20 4.5" />
    <path d="m116 160 20 20 40-40" strokeWidth="18" />
  </svg>
);

