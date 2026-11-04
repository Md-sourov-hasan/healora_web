import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  ({ className, ...props }, ref) => <TabsPrimitive.List ref={ref} className={cn('inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-tab p-1', className)} {...props} />,
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  ({ className, ...props }, ref) => <TabsPrimitive.Trigger ref={ref} className={cn('inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-[9px] border-none px-4 py-2 text-sm font-medium text-slate outline-none transition-all duration-150 hover:text-ink focus-visible:ring-2 focus-visible:ring-teal/45 data-[state=active]:bg-paper data-[state=active]:font-semibold data-[state=active]:text-ink data-[state=active]:shadow-[0_1px_3px_rgba(11,31,34,.10)]', className)} {...props} />,
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>>(
  ({ className, ...props }, ref) => <TabsPrimitive.Content ref={ref} className={cn('mt-2 outline-none', className)} {...props} />,
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
