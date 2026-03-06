import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * SprouX Accordion
 *
 * Figma: [SprouX - DS] Foundation & Component (node 66:5034)
 * Shadcn: @shadcn/accordion (radix-ui/react-accordion)
 *
 * Vertically collapsible content sections.
 *
 * Variants (Accordion Trigger — Figma):
 *   State:    Default | Hover | Focus | Disable
 *   Type:     Open | Closed
 *   End Item: False | True
 *
 * Merged specs (Shadcn structure + Figma tokens):
 *   Trigger:  py-sm (12px), gap-xs (8px), items-center
 *             Default: no border-radius (Figma root cornerRadius=0)
 *             Hover: hover:underline (Figma characterStyleOverride UNDERLINE)
 *             Focus: rounded-lg + ring-focus (Figma cornerRadius=8, DROP_SHADOW 3px --ring)
 *   Label:    typo-paragraph-sm-bold (Geist 600 14/20 ls:0.07px), text-foreground
 *   Icon:     size-md (16px), text-ghost-foreground (#6f6f6a), rotates 180° on open
 *   Content:  pb-sm (12px), typo-paragraph-sm (Geist 400 14/20 ls:0.07px), text-foreground
 *   Border:   1px border-border, last:border-b-0 (End Item=True)
 *   Disabled: pointer-events-none opacity-50 (Shadcn convention)
 */
function Accordion(
  props: React.ComponentProps<typeof AccordionPrimitive.Root>
) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex font-body">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-center justify-between gap-xs py-sm typo-paragraph-sm-bold text-foreground text-left transition-all outline-none hover:underline focus-visible:rounded-lg focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown aria-hidden="true" className="size-md shrink-0 text-ghost-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden typo-paragraph-sm text-foreground"
      {...props}
    >
      <div className={cn("pt-0 pb-sm", className)}>{children}</div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
