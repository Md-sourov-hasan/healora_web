import React from 'react';
import { Card as ShadcnCard } from '../ui/card';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'card' | 'tint' | 'flat' | 'hero';
  children: React.ReactNode;
  clickable?: boolean;
}

const variants: Record<NonNullable<CardProps['variant']>, string> = {
  card: 'rounded-card border border-line/60 bg-paper p-6 shadow-card',
  tint: 'rounded-card border border-sage-200/60 bg-mist p-5',
  flat: 'rounded-tile border border-line bg-paper p-[18px]',
  hero: 'relative overflow-hidden rounded-sheet bg-ink p-7 text-white shadow-float',
};

export const Card: React.FC<CardProps> = ({
  variant = 'card',
  children,
  clickable = false,
  className = '',
  ...rest
}) => (
  <ShadcnCard
    className={[
      'box-border',
      variants[variant],
      clickable &&
        'cursor-pointer transition duration-150 ease-organic hover:-translate-y-0.5 hover:shadow-float active:scale-[0.985]',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    {...rest}
  >
    {children}
  </ShadcnCard>
);
