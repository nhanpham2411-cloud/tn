import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * SprouX Checkbox
 *
 * Figma: [SprouX - DS] Foundation & Component (node 16:1790)
 *
 * Size:   16×16px
 * States: default | focus | error (aria-invalid) | error+focus | disabled
 * Values: unchecked | checked | indeterminate
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group peer size-md shrink-0 rounded-sm border border-border-strong bg-input transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:border-primary data-[state=indeterminate]:text-primary-foreground aria-invalid:border-destructive-border aria-invalid:focus-visible:ring-ring-error aria-invalid:data-[state=checked]:bg-destructive aria-invalid:data-[state=checked]:border-destructive aria-invalid:data-[state=indeterminate]:bg-destructive aria-invalid:data-[state=indeterminate]:border-destructive",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
      >
        <Check className="size-sm group-data-[state=indeterminate]:hidden" />
        <Minus className="size-sm hidden group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
