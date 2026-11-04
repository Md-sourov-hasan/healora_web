import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'card' | 'tint' | 'flat' | 'hero';
  children: React.ReactNode;
  clickable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  variant = 'card',
  children,
  clickable = false,
  className = '',
  style,
  ...rest
}) => {
  let baseStyle: React.CSSProperties = {
    borderRadius: '24px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 2px rgba(11,31,34,.06), 0 8px 24px -12px rgba(11,31,34,.12)',
    padding: '24px',
    boxSizing: 'border-box',
    border: '1px solid rgba(221, 229, 225, 0.6)',
  };

  if (variant === 'tint') {
    baseStyle = {
      borderRadius: '24px',
      backgroundColor: '#E6EEEA',
      padding: '20px',
      boxSizing: 'border-box',
      border: '1px solid rgba(207, 224, 216, 0.6)',
    };
  } else if (variant === 'flat') {
    baseStyle = {
      borderRadius: '18px',
      backgroundColor: '#FFFFFF',
      border: '1px solid #DDE5E1',
      padding: '18px',
      boxSizing: 'border-box',
    };
  } else if (variant === 'hero') {
    baseStyle = {
      borderRadius: '28px',
      backgroundColor: '#0B1F22',
      color: '#FFFFFF',
      padding: '28px',
      boxSizing: 'border-box',
      boxShadow: '0 12px 32px -10px rgba(11,31,34,.28)',
      position: 'relative',
      overflow: 'hidden',
    };
  }

  return (
    <div
      className={`${clickable ? 'clickable-card' : ''} ${className}`}
      style={{
        ...baseStyle,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
};

