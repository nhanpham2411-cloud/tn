import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

/**
 * SprouX Switch
 *
 * Figma: [SprouX - DS] Foundation & Component (node 16:1801)
 *
 * Track:  33×18px, pill shape (border-radius 12px)
 * Thumb:  16×16px circle, white
 * States: default | focus | disabled
 * Values: unchecked | checked
 */
function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[18px] w-[33px] shrink-0 cursor-pointer items-center rounded-xl p-px transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-border",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-md rounded-full bg-background transition-transform data-[state=checked]:translate-x-[15px] data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
