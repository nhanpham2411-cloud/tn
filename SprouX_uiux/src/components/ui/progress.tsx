import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * SprouX Progress
 *
 * Figma: [SprouX - DS] Foundation & Component (node 438:64981)
 *
 * Progress bar — determinate.
 * Variants:
 *   Size:  Default (8px) | Small (4px)
 *   Value: Primary (teal) | Success (green)
 */
const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-muted",
  {
    variants: {
      size: {
        default: "h-xs",
        sm: "h-3xs",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 rounded-full transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-success",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Progress({
  className,
  value,
  size,
  variant,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants> &
  VariantProps<typeof progressIndicatorVariants>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(progressVariants({ size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(progressIndicatorVariants({ variant }))}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress, progressVariants, progressIndicatorVariants }
