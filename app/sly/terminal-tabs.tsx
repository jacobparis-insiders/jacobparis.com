import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "~/utils/misc.ts"
import { Icon } from "#app/components/icon.tsx"

interface TerminalTabsTriggerProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
  onDelete?: () => void
  isDeletable?: boolean
}

const TerminalTabs = TabsPrimitive.Root

const TerminalTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex  items-center justify-center bg-black text-neutral-400",
      className,
    )}
    {...props}
  />
))
TerminalTabsList.displayName = TabsPrimitive.List.displayName

const TerminalTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TerminalTabsTriggerProps
>(({ className, onDelete, isDeletable, children, ...props }, ref) => (
  <div
    className={cn(
      "group flex items-center",
      "  has-[[data-state=active]]:bg-neutral-700 has-[[data-state=active]]:text-white",
    )}
  >
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "inline-flex items-center  justify-center whitespace-nowrap py-1  pl-3 pr-1 font-medium ring-offset-white transition-all hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
        !isDeletable && "pr-2",
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
    {isDeletable && onDelete && (
      <button
        onClick={onDelete}
        className="grid pl-1 pr-2 opacity-100 hover:text-white "
        aria-label="Delete"
      >
        <Icon name="trash" />
      </button>
    )}
  </div>
))
TerminalTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TerminalTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
))
TerminalTabsContent.displayName = TabsPrimitive.Content.displayName

export {
  TerminalTabs,
  TerminalTabsList,
  TerminalTabsTrigger,
  TerminalTabsContent,
}
