import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

/**
 * SprouX Tabs
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Tabbed interface with trigger list and content panels.
 * Variants: "default" (rounded-md triggers) | "pill" (rounded-full triggers).
 * Set variant once on TabsList — all TabsTrigger children inherit it via context.
 */

type TabsVariant = "default" | "pill"

const TabsVariantContext = React.createContext<TabsVariant>("default")

function Tabs(props: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" {...props} />
}

function TabsList({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { variant?: TabsVariant }) {
  return (
    <TabsVariantContext.Provider value={variant}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(
          "inline-flex h-9 items-center justify-center bg-muted p-1 text-muted-foreground",
          variant === "default" && "rounded-lg",
          variant === "pill" && "rounded-full",
          className
        )}
        {...props}
      />
    </TabsVariantContext.Provider>
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const variant = React.useContext(TabsVariantContext)
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap px-sm py-1 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=inactive]:hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
        variant === "default" && "rounded-md",
        variant === "pill" && "rounded-full",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "mt-xs focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
