import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

/* ── Day Cell Styles ── */

type DayCellState = "default" | "hover" | "today" | "selected" | "outside" | "disabled" | "range-start" | "range-middle" | "range-end" | "range-hover"

const dayCellStyles: Record<DayCellState, string> = {
  "default":      "rounded-sm text-foreground bg-transparent",
  "hover":        "rounded-sm text-foreground bg-ghost-hover",
  "today":        "rounded-sm text-foreground border border-primary-border",
  "selected":     "rounded-sm text-primary-foreground bg-primary",
  "outside":      "rounded-sm text-muted-foreground bg-transparent",
  "disabled":     "rounded-sm text-muted-foreground opacity-50 bg-transparent",
  "range-start":  "rounded-l-sm text-primary-foreground bg-primary",
  "range-middle": "text-foreground bg-primary-10",
  "range-end":    "rounded-r-sm text-primary-foreground bg-primary",
  "range-hover":  "text-foreground bg-primary-20",
}

/** DayCell — standalone visual component for design system docs */
function DayCell({ state, children }: { state: DayCellState; children: React.ReactNode }) {
  return (
    <div className={cn("size-[48px] flex items-center justify-center typo-paragraph-sm font-normal", dayCellStyles[state])}>
      {children}
    </div>
  )
}

/** CalendarDayButton — swaps react-day-picker's default DayButton with DayCell styles */
function CalendarDayButton({ day, modifiers, className, ...props }: any) {
  let state: DayCellState = "default"
  if (modifiers.outside) state = "outside"
  if (modifiers.today) state = "today"
  if (modifiers.disabled) state = "disabled"
  if (modifiers.selected) state = "selected"
  if (modifiers.range_start) state = "range-start"
  if (modifiers.range_middle) state = "range-middle"
  if (modifiers.range_end) state = "range-end"

  const isOutside = modifiers.outside

  return (
    <button
      {...props}
      className={cn(
        "size-[48px] flex items-center justify-center typo-paragraph-sm font-normal transition-colors",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
        "disabled:pointer-events-none",
        dayCellStyles[state],
        (state === "default" || state === "today" || state === "outside") && "hover:bg-ghost-hover",
        isOutside && state !== "outside" && "opacity-40",
      )}
    />
  )
}

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
  components,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      data-slot="calendar"
      showOutsideDays
      className={cn("p-sm", className)}
      classNames={{
        months: "relative flex flex-col sm:flex-row gap-md",
        month: "flex flex-col gap-md",
        month_caption: "flex justify-center items-center h-2xl",
        caption_label: "typo-paragraph-sm font-semibold",
        nav: "absolute top-0 inset-x-0 flex items-center justify-between z-10 h-2xl",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "size-2xl rounded-lg p-2xs"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "size-2xl rounded-lg p-2xs"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-sm w-[48px] h-[32px] font-normal sp-caption",
        week: "flex w-full mt-px",
        day: cn(
          "relative p-0 text-center typo-paragraph-sm focus-within:relative focus-within:z-20",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-sm [&:has(>.day-range-start)]:rounded-l-sm first:[&:has([aria-selected])]:rounded-l-sm last:[&:has([aria-selected])]:rounded-r-sm"
            : "[&:has([aria-selected])]:rounded-sm"
        ),
        day_button: "",
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected: "",
        today: "",
        outside: cn(
          "day-outside",
          !showOutsideDays && "invisible"
        ),
        disabled: "",
        range_middle: "day-range-middle",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        DayButton: CalendarDayButton,
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon aria-hidden="true" className="size-[18px]" />
        },
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar, DayCell, dayCellStyles, type DayCellState }
