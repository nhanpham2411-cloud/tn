import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * SprouX Collapsible
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Toggle visibility of content sections.
 */
function Collapsible(
  props: React.ComponentProps<typeof CollapsiblePrimitive.Root>
) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger(
  props: React.ComponentProps<typeof CollapsiblePrimitive.Trigger>
) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

function CollapsibleContent(
  props: React.ComponentProps<typeof CollapsiblePrimitive.Content>
) {
  return (
    <CollapsiblePrimitive.Content
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
