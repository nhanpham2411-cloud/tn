import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/**
 * SprouX Calendar
 *
 * Figma: [SprouX - DS] Foundation & Component (node 288:119954)
 *
 * Date picker calendar built on react-day-picker v9.
 * Figma variants: Type=Basic (1 month) | Type=Range (2 months side-by-side).
 * Day cell 48×48 r=4 p=8, nav buttons 32×32 r=8 with border,
 * header title Geist 600 14px, weekday 12px/16px, row gap 1px, multi-month gap 16px.
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays={showOutsideDays}
      className={cn("p-sm", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-md",
        month: "flex flex-col gap-md",
        month_caption: "flex justify-center relative items-center w-full",
        caption_label: "typo-paragraph-sm font-semibold",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-2xl rounded-lg p-[7px] absolute left-1"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-2xl rounded-lg p-[7px] absolute right-1"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-sm w-[48px] h-[32px] font-normal text-[12px] leading-[16px]",
        week: "flex w-full mt-[1px]",
        day: cn(
          "relative p-0 text-center typo-paragraph-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-muted [&:has([aria-selected].day-range-end)]:rounded-r-sm [&:has([aria-selected].day-outside)]:bg-muted/50",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-sm [&:has(>.day-range-start)]:rounded-l-sm first:[&:has([aria-selected])]:rounded-l-sm last:[&:has([aria-selected])]:rounded-r-sm"
            : "[&:has([aria-selected])]:rounded-sm"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-[48px] rounded-sm p-xs font-normal aria-selected:opacity-100"
        ),
        range_start: "day-range-start rounded-l-sm",
        range_end: "day-range-end rounded-r-sm",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-muted text-foreground",
        outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon aria-hidden="true" className="size-[18px]" />
        },
      }}
      {...props}
    />
  )
}

export { Calendar }
