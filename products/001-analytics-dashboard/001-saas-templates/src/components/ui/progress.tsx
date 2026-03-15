import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { figma } from "@/lib/figma-dev"

/**
 * SprouX Progress
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Progress bar — determinate and indeterminate.
 * Track height: 6px
 * Type: primary (default) | chart-1..8 for colored variants
 */

const PROGRESS_TYPE: Record<string, string> = {
  primary: "Primary",
  "chart-1": "Chart 1",
  "chart-2": "Chart 2",
  "chart-3": "Chart 3",
  "chart-4": "Chart 4",
  "chart-5": "Chart 5",
  "chart-6": "Chart 6",
  "chart-7": "Chart 7",
  "chart-8": "Chart 8",
}

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all",
  {
    variants: {
      type: {
        primary: "bg-primary",
        "chart-1": "bg-chart-1",
        "chart-2": "bg-chart-2",
        "chart-3": "bg-chart-3",
        "chart-4": "bg-chart-4",
        "chart-5": "bg-chart-5",
        "chart-6": "bg-chart-6",
        "chart-7": "bg-chart-7",
        "chart-8": "bg-chart-8",
      },
    },
    defaultVariants: {
      type: "primary",
    },
  }
)

type ProgressType = "primary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "chart-6" | "chart-7" | "chart-8"

function Progress({
  className,
  value,
  type = "primary",
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> & { type?: ProgressType }) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={value}
      {...figma("Progress", {
        Value: value == null ? "Indeterminate" : String(Math.round(value / 5) * 5),
        "Show Label": "No",
        Type: PROGRESS_TYPE[type] ?? "Primary",
      })}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={progressIndicatorVariants({ type })}
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress, type ProgressType }
