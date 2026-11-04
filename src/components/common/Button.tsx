import React from 'react';
import { PhArrowUpRight } from '../icons/PhosphorIcons';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'small' | 'text' | 'icon';
  children?: React.ReactNode;
  icon?: React.ReactNode;
  showArrow?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  showArrow = true,
  fullWidth = false,
  className = '',
  disabled,
  style,
  ...rest
}) => {
  if (variant === 'primary') {
    return (
      <button
        type="button"
        disabled={disabled}
        className={`btn-primary ${fullWidth ? 'w-full justify-between' : ''} ${className}`}
        style={{
          width: fullWidth ? '100%' : undefined,
          ...style,
        }}
        {...rest}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          {children}
        </span>
        {showArrow && (
          <span className="btn-arrow-chip">
            <PhArrowUpRight size={16} color="#FFFFFF" />
          </span>
        )}
      </button>
    );
  }

  if (variant === 'small') {
    return (
      <button
        type="button"
        disabled={disabled}
        className={`btn-primary btn-primary-small ${fullWidth ? 'w-full' : ''} ${className}`}
        style={{
          width: fullWidth ? '100%' : undefined,
          ...style,
        }}
        {...rest}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          {icon}
          {children}
        </span>
        {showArrow && (
          <span className="btn-arrow-chip">
            <PhArrowUpRight size={14} color="#FFFFFF" />
          </span>
        )}
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        type="button"
        disabled={disabled}
        className={`btn-secondary ${fullWidth ? 'w-full' : ''} ${className}`}
        style={{
          width: fullWidth ? '100%' : undefined,
          ...style,
        }}
        {...rest}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          {icon}
          {children}
        </span>
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        type="button"
        disabled={disabled}
        className={`btn-text ${className}`}
        style={style}
        {...rest}
      >
        {icon}
        {children}
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        type="button"
        disabled={disabled}
        className={`btn-icon ${className}`}
        style={style}
        {...rest}
      >
        {icon || children}
      </button>
    );
  }

  return (
    <button type="button" disabled={disabled} className={className} style={style} {...rest}>
      {children}
    </button>
  );
};

