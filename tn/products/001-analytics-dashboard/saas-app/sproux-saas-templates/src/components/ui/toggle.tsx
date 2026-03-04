import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * SprouX Toggle
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * A two-state button that can be toggled on or off (e.g. bold, italic).
 * Variants: default | outline
 * Sizes:    default (36px) | sm (32px) | lg (40px)
 */
const toggleVariants = cva(
  "inline-flex items-center justify-center gap-xs rounded-lg text-sm font-medium tracking-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-md",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground",
        outline:
          "border border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground",
      },
      size: {
        default: "h-9 px-sm min-w-9",
        sm: "h-2xl px-xs min-w-8",
        lg: "h-3xl px-md min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
