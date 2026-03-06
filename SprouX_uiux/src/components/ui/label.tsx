import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * SprouX Label
 *
 * Figma: [SprouX - DS] Foundation & Component (node 103:9453)
 *
 * Variants:
 *   Size:   Small (14/20) | Regular (16/24)
 *   Layout: Block | Inline (flex row gap-xs)
 *
 * Renders an accessible label associated with form controls.
 */
const labelVariants = cva(
  "text-foreground select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      size: {
        sm: "typo-paragraph-sm-medium",
        default: "typo-paragraph-medium",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
)

function Label({
  className,
  size,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(labelVariants({ size }), className)}
      {...props}
    />
  )
}

export { Label, labelVariants }
