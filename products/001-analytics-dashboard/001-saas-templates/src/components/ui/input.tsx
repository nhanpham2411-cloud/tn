import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * SprouX Input
 *
 * Figma: [SprouX - DS] Foundation & Component (node 2250:904)
 *
 * Sizes:  lg (40px) | default (36px) | sm (32px) | xs/mini (24px)
 * States: default | focus | error (aria-invalid) | error+focus | disabled
 *
 * Inner decorations: iconLeft, iconRight, prefix, suffix (inside the input)
 * Outer addons:      textLeft, textRight (labels attached outside the input)
 */
const inputVariants = cva(
  "flex w-full bg-input border border-border text-foreground transition-colors file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground hover:border-border-strong focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:not-placeholder-shown:border-border-strong disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border aria-invalid:border-destructive-border aria-invalid:focus-visible:ring-ring-error aria-invalid:focus-visible:not-placeholder-shown:border-destructive-border",
  {
    variants: {
      size: {
        lg: "h-3xl px-md rounded-lg typo-paragraph-sm",
        default: "h-9 px-sm rounded-lg typo-paragraph-sm",
        sm: "h-2xl px-xs rounded-lg typo-paragraph-sm",
        xs: "h-xl px-2xs rounded-sm typo-paragraph-mini",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function Input({
  className,
  size,
  type = "text",
  iconLeft,
  iconRight,
  prefix,
  suffix,
  textLeft,
  textRight,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants> & {
    iconLeft?: React.ReactNode
    iconRight?: React.ReactNode
    prefix?: string
    suffix?: string
    textLeft?: string
    textRight?: string
  }) {
  const hasInner = !!(iconLeft || iconRight || prefix || suffix)
  const hasOuter = !!(textLeft || textRight)

  const inputEl = (
    <input
      data-slot="input"
      type={type}
      className={cn(
        inputVariants({ size, className }),
        (iconLeft || prefix) && "pl-9",
        (iconRight || suffix) && "pr-9",
        textLeft && "rounded-l-none border-l-0",
        textRight && "rounded-r-none border-r-0",
      )}
      {...props}
    />
  )

  const withInner = hasInner ? (
    <div className={cn("relative flex items-center", hasOuter && "flex-1 min-w-0")}>
      {(iconLeft || prefix) && (
        <span className="absolute left-3 flex items-center gap-1 text-muted-foreground [&>svg]:size-md pointer-events-none z-10">
          {iconLeft}
          {prefix && <span className="typo-paragraph-sm">{prefix}</span>}
        </span>
      )}
      {inputEl}
      {(iconRight || suffix) && (
        <span className="absolute right-3 flex items-center gap-1 text-muted-foreground [&>svg]:size-md pointer-events-none z-10">
          {suffix && <span className="typo-paragraph-sm">{suffix}</span>}
          {iconRight}
        </span>
      )}
    </div>
  ) : inputEl

  if (!hasOuter) return withInner

  return (
    <div className="flex items-center">
      {textLeft && (
        <span className="inline-flex items-center self-stretch px-sm border border-r-0 border-border rounded-l-lg bg-muted text-muted-foreground typo-paragraph-sm shrink-0">
          {textLeft}
        </span>
      )}
      {withInner}
      {textRight && (
        <span className="inline-flex items-center self-stretch px-sm border border-l-0 border-border rounded-r-lg bg-muted text-muted-foreground typo-paragraph-sm shrink-0">
          {textRight}
        </span>
      )}
    </div>
  )
}

export { Input, inputVariants }
