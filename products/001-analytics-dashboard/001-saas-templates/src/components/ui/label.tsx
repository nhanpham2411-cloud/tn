import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

/**
 * SprouX Label
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Renders an accessible label associated with form controls.
 * Supports required indicator via data-required attribute.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "typo-paragraph-sm-medium text-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
