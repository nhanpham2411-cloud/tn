import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

/**
 * SprouX Button
 *
 * Figma: [SprouX - DS] Foundation & Component (node 9:1071)
 * Shadcn: @shadcn/button (Slot pattern + CVA)
 *
 * Figma Variant Properties:
 *   Variant:    Primary | Secondary | Outline | Ghost | Ghost Muted | Destructive | Destructive Secondary
 *   Size:       Large (40px) | Regular (36px) | Small (32px) | Mini (24px)
 *   State:      Default | Hover & Active | Focus | Disabled
 *   Show left icon / Show right icon: Boolean (instance swap)
 *   Roundness:  Default
 *
 * Code Variant Mapping:
 *   default → Primary, secondary → Secondary, outline → Outline,
 *   ghost → Ghost, ghost-muted → Ghost Muted,
 *   destructive → Destructive, destructive-secondary → Destructive Secondary
 *
 * Code Size Mapping:
 *   lg → Large, default → Regular, sm → Small, xs → Mini,
 *   icon / icon-sm / icon-lg → icon-only variants
 *
 * Merged specs (Shadcn structure + Figma tokens):
 *   Container: rounded-lg (8px), gap-xs (8px) or gap-2xs (6px)
 *   Text:      typo-paragraph-sm-bold (14/20 ls:0.07) for lg/default/sm
 *              typo-paragraph-mini-bold (12/16 ls:0.18) for xs
 *   Icon:      size-md (16px) all sizes
 *   Disabled:  opacity-50
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover focus-visible:ring-ring",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary-hover active:bg-secondary-hover focus-visible:bg-secondary-hover focus-visible:ring-ring",
        outline:
          "border border-border bg-outline text-foreground hover:bg-outline-hover active:bg-outline-hover focus-visible:ring-ring focus-visible:border-border-strong",
        ghost:
          "bg-ghost text-ghost-foreground hover:bg-ghost-hover hover:text-foreground active:bg-ghost-hover active:text-foreground focus-visible:ring-ring",
        "ghost-muted":
          "bg-ghost text-ghost-foreground hover:bg-ghost-hover hover:text-foreground active:bg-ghost-hover active:text-foreground focus-visible:ring-ring",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive active:bg-destructive focus-visible:ring-ring-error",
        "destructive-secondary":
          "bg-destructive-subtle text-destructive-subtle-foreground border border-destructive-border hover:bg-destructive-subtle active:bg-destructive-subtle focus-visible:ring-ring-error",
      },
      size: {
        lg: "h-3xl px-xl gap-xs typo-paragraph-sm-bold [&_svg:not([class*='size-'])]:size-md",
        default: "h-9 px-md gap-xs typo-paragraph-sm-bold [&_svg:not([class*='size-'])]:size-md",
        sm: "h-2xl px-sm gap-2xs typo-paragraph-sm-bold [&_svg:not([class*='size-'])]:size-md",
        xs: "h-xl px-xs gap-2xs typo-paragraph-mini-bold [&_svg:not([class*='size-'])]:size-md",
        icon: "size-9 [&_svg:not([class*='size-'])]:size-md",
        "icon-sm": "size-2xl [&_svg:not([class*='size-'])]:size-md",
        "icon-lg": "size-3xl [&_svg:not([class*='size-'])]:size-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export { Button, buttonVariants, type ButtonProps }
