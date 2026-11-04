import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, type, ...props }, ref) => (
  <input type={type} className={cn('flex h-12 w-full rounded-xl border border-line bg-paper px-3.5 py-2 text-[15px] text-ink outline-none transition placeholder:text-slate/70 focus:border-teal focus:ring-2 focus:ring-teal/20 disabled:cursor-not-allowed disabled:opacity-50', className)} ref={ref} {...props} />
));
Input.displayName = 'Input';

export { Input };
