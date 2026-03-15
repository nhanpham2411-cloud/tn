import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"
import { figma, RADIO_VALUE } from "@/lib/figma-dev"

/**
 * SprouX Radio Group
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Single selection from multiple options.
 * Size:   16×16px (matches Checkbox)
 * States: default | focus | error (aria-invalid) | disabled
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-sm", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      {...figma("Radio", {
        Value: "Unchecked",
        State: props.disabled ? "Disabled" : "Default",
        "Show Label": "No",
      })}
      className={cn(
        "group peer size-md shrink-0 rounded-full border border-border-strong bg-input transition-colors hover:border-primary-border disabled:hover:border-border-strong focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground aria-invalid:border-destructive-border aria-invalid:focus-visible:ring-ring-error aria-invalid:data-[state=checked]:bg-destructive aria-invalid:data-[state=checked]:border-destructive-border",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex items-center justify-center"
      >
        <Circle className="size-1.5 fill-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
