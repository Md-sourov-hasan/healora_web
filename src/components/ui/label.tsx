import * as React from 'react';
import { cn } from '@/lib/utils';

const Label = React.forwardRef<HTMLLabelElement, React.ComponentProps<'label'>>(({ className, ...props }, ref) => (
  <label ref={ref} className={cn('mb-1.5 block text-[13px] font-semibold text-slate', className)} {...props} />
));
Label.displayName = 'Label';

export { Label };
