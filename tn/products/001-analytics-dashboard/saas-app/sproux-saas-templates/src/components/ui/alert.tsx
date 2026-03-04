import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * SprouX Alert
 *
 * Figma: [SprouX - DS] Foundation & Component (node 58:5416)
 * Shadcn: @shadcn/alert (native div)
 *
 * Inline feedback message for neutral, error, success, warning, emphasis.
 *
 * Variants (Figma):
 *   Type:         Neutral | Error | Success | Warning | Emphasis
 *   Dismissable:  False | True
 *   In Card:      False | True
 *   Show Title:   True | False
 *   Show Subtitle:True | False
 *   Show Icon:    true | false
 *
 * Merged specs (Shadcn structure + Figma tokens):
 *   Container:  py-sm (12px) px-md (16px), gap-md (16px) outer
 *               rounded-lg (8px), border 1px
 *   Icon:       size-md (16px), absolute left-md top-[14px] (center-aligned to 20px text line)
 *   Title:      typo-paragraph-sm-bold (Geist 600 14/20 ls:0.07px)
 *   Description:typo-paragraph-sm (Geist 400 14/20 ls:0.07px)
 *   Gap:        icon-to-text gap-sm (12px), title-to-desc gap-xs (8px)
 *
 *   Neutral:        bg-card, border-border, text-foreground, desc: text-ghost-foreground
 *   Neutral inCard: bg-card-subtle, border-transparent, py-xs px-sm (same text)
 *   Other inCard:   border-transparent, py-xs px-sm (keep variant bg)
 *   Error:    bg-destructive-subtle, border-destructive-border, text-destructive-subtle-foreground
 *   Success:  bg-success-subtle, border-success-border, text-success-subtle-foreground
 *   Warning:  bg-warning-subtle, border-warning-border, text-warning-subtle-foreground
 *   Emphasis: bg-emphasis-subtle, border-emphasis-border, text-emphasis-subtle-foreground
 */
const alertVariants = cva(
  "relative w-full rounded-lg border py-sm px-md [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-md [&>svg]:top-[14px] [&>svg]:size-md",
  {
    variants: {
      variant: {
        default:
          "bg-card border-border text-foreground [&>svg]:text-foreground *:data-[slot=alert-description]:text-ghost-foreground",
        destructive:
          "bg-destructive-subtle border-destructive-border text-destructive-subtle-foreground [&>svg]:text-destructive-subtle-foreground",
        success:
          "bg-success-subtle border-success-border text-success-subtle-foreground [&>svg]:text-success-subtle-foreground",
        warning:
          "bg-warning-subtle border-warning-border text-warning-subtle-foreground [&>svg]:text-warning-subtle-foreground",
        emphasis:
          "bg-emphasis-subtle border-emphasis-border text-emphasis-subtle-foreground [&>svg]:text-emphasis-subtle-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  inCard,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof alertVariants> & {
    /** Use when Alert sits inside a Card — removes border, tightens padding, neutral uses card-subtle bg */
    inCard?: boolean
  }) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(
        alertVariants({ variant }),
        inCard && [
          "border-transparent py-xs px-sm [&>svg]:left-sm [&>svg]:top-[10px]",
          (!variant || variant === "default") && "bg-card-subtle",
        ],
        className
      )}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn("typo-paragraph-sm-bold", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn("typo-paragraph-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
