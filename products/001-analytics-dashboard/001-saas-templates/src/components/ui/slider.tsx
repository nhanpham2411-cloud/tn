import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

/**
 * SprouX Slider
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Range input supporting single and dual thumb.
 * Track height: 6px, Thumb: 16×16px
 * States: default | focus | disabled
 * Disabled: root opacity-50 + cursor-not-allowed, range → muted-foreground/40, thumb → border-border-strong bg-muted
 */
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _value = value ?? defaultValue ?? [min]

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none select-none items-center data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-muted"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute h-full bg-primary data-[disabled]:bg-muted-foreground/40"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _value.length }, (_, i) => (
        <SliderPrimitive.Thumb
          key={i}
          data-slot="slider-thumb"
          className="block size-md rounded-full border-2 border-primary bg-background transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none data-[disabled]:border-border-strong data-[disabled]:bg-muted"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
