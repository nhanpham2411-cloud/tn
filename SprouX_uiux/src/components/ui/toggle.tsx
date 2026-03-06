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
 * Variants: default (ghost) | outline
 * Sizes:    default (36px) | sm (32px) | lg (40px) | mini (24px)
 */
const toggleVariants = cva(
  "inline-flex items-center justify-center rounded-lg typo-paragraph-sm-bold text-foreground [&_svg]:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-'])]:size-md",
  {
    variants: {
      variant: {
        default:
          "bg-ghost hover:bg-ghost-hover data-[state=on]:bg-ghost-hover",
        outline:
          "border border-border bg-transparent hover:bg-outline-hover data-[state=on]:bg-outline-hover",
      },
      size: {
        default: "h-9 px-xs min-w-9 gap-xs",
        sm: "h-2xl px-2xs min-w-8 gap-2xs",
        lg: "h-3xl px-sm min-w-10 gap-xs",
        mini: "h-xl px-3xs min-w-xl rounded-sm gap-3xs typo-paragraph-mini-bold",
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
