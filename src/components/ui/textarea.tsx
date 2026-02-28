import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * SprouX Textarea
 *
 * Figma: [SprouX - DS] Foundation & Component (node 2256:175)
 *
 * States: default | focus | error (aria-invalid) | error+focus | disabled
 */
function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[76px] w-full rounded-lg border border-border bg-input p-xs text-sm tracking-sm font-body font-normal text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:not-placeholder-shown:border-border-strong disabled:cursor-not-allowed disabled:opacity-30 aria-invalid:border-destructive-border aria-invalid:focus-visible:ring-ring-error aria-invalid:focus-visible:not-placeholder-shown:border-destructive-border",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
