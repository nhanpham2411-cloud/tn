import * as React from "react"

import { cn } from "@/lib/utils"
import { figma } from "@/lib/figma-dev"

/**
 * SprouX Separator
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Horizontal or vertical divider line.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<"div"> & {
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}) {
  return (
    <div
      data-slot="separator"
      {...figma("Separator", {
        Orientation: orientation === "vertical" ? "Vertical" : "Horizontal",
      })}
      role={decorative ? "none" : "separator"}
      aria-orientation={decorative ? undefined : orientation}
      data-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
