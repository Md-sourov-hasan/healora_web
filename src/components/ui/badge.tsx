import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 text-xs font-semibold leading-none',
  {
    variants: {
      variant: {
        default: 'bg-draft-bg text-slate',
        success: 'bg-ok-bg text-ok-fg',
        warning: 'bg-warn-bg text-warn-fg',
        destructive: 'bg-bad-bg text-bad-fg',
        info: 'bg-mist text-pine',
        teal: 'bg-teal text-white',
        clay: 'bg-clay text-white',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
