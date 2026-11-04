import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-ctl text-sm font-semibold transition-[color,box-shadow,transform,background-color] duration-150 ease-organic outline-none focus-visible:ring-2 focus-visible:ring-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-bone disabled:pointer-events-none disabled:opacity-45 active:scale-[0.985]',
  {
    variants: {
      variant: {
        default: 'bg-ink text-white hover:bg-ink-hover active:bg-ink-press',
        secondary: 'border border-line bg-paper text-ink hover:bg-mist',
        outline: 'border border-line bg-transparent text-ink hover:bg-mist',
        ghost: 'bg-transparent text-teal hover:bg-mist hover:text-pine',
        destructive: 'bg-bad text-white hover:bg-bad/90',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 rounded-pill px-3 text-xs',
        lg: 'h-14 px-6 text-base',
        icon: 'size-10 rounded-full p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
