import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * SprouX Skeleton
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Loading placeholder with shimmer animation.
 */
function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-lg bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
