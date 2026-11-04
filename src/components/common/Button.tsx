import React from 'react';
import { PhArrowUpRight } from '../icons/PhosphorIcons';

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
      <button
        type={type}
        className={cx(
          'group inline-flex cursor-pointer items-center justify-between rounded-ctl border-none bg-ink font-semibold text-white hover:bg-ink-hover active:bg-ink-press',
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
      </button>
    );
  }

  if (variant === 'secondary') {
    return (
      <button
        type={type}
        className={cx(
          'inline-flex h-14 min-w-[160px] cursor-pointer items-center justify-center gap-2 rounded-ctl border border-line bg-paper px-6 text-base font-semibold text-ink hover:bg-mist',
          fullWidth && 'w-full',
          press,
          className
        )}
        {...rest}
      >
        {icon}
        {children}
      </button>
    );
  }

  if (variant === 'text') {
    return (
      <button
        type={type}
        className={cx(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-pill border-none bg-transparent px-3 py-2 text-[15px] font-semibold text-teal transition-colors hover:bg-mist hover:text-pine',
          className
        )}
        {...rest}
      >
        {icon}
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      className={cx(
        'relative inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-paper text-ink transition hover:bg-mist active:scale-95',
        className
      )}
      {...rest}
    >
      {icon || children}
    </button>
  );
};
