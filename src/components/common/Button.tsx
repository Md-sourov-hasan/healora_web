import React from 'react';
import { PhArrowUpRight } from '../icons/PhosphorIcons';
import { Button as ShadcnButton } from '../ui/button';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'small' | 'text' | 'icon';
  children?: React.ReactNode;
  icon?: React.ReactNode;
  showArrow?: boolean;
  fullWidth?: boolean;
}

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  showArrow = true,
  fullWidth = false,
  className = '',
  type = 'button',
  ...rest
}) => {
  const press = 'transition duration-150 ease-organic active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100';

  if (variant === 'primary' || variant === 'small') {
    const small = variant === 'small';
    return (
      <ShadcnButton
        type={type}
        variant="default"
        size={small ? 'default' : 'lg'}
        className={cx(
          'group cursor-pointer justify-between',
          small ? 'h-11 min-w-[140px] pl-4 pr-3 text-[15px]' : 'h-14 min-w-[180px] pl-6 pr-4 text-base',
          fullWidth && 'w-full',
          press,
          className
        )}
        {...rest}
      >
        <span className="inline-flex items-center gap-2">
          {icon}
          {children}
        </span>
        {showArrow && (
          <span
            className={cx(
              'ml-3 flex shrink-0 items-center justify-center rounded-full bg-white/15 transition-transform duration-150 ease-organic group-hover:translate-x-0.5 group-hover:-translate-y-0.5',
              small ? 'size-7' : 'size-8'
            )}
          >
            <PhArrowUpRight size={small ? 14 : 16} color="#FFFFFF" />
          </span>
        )}
      </ShadcnButton>
    );
  }

  if (variant === 'secondary') {
    return (
      <ShadcnButton
        type={type}
        variant="secondary"
        size="lg"
        className={cx(
          'min-w-[160px] cursor-pointer gap-2',
          fullWidth && 'w-full',
          press,
          className
        )}
        {...rest}
      >
        {icon}
        {children}
      </ShadcnButton>
    );
  }

  if (variant === 'text') {
    return (
      <ShadcnButton
        type={type}
        variant="ghost"
        size="sm"
        className={cx(
          'cursor-pointer gap-1.5 px-3 py-2 text-[15px]',
          className
        )}
        {...rest}
      >
        {icon}
        {children}
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton
      type={type}
      variant="outline"
      size="icon"
      className={cx(
        'relative size-11 cursor-pointer',
        className
      )}
      {...rest}
    >
      {icon || children}
    </ShadcnButton>
  );
};
