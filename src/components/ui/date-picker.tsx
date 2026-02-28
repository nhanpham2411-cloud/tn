import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * SprouX Date Picker
 *
 * Figma: [SprouX - DS] Foundation & Component (node 60:9340)
 *
 * Date selection using Calendar in a Popover.
 * Trigger is an Input-style field (not a Button) matching the Figma "Date Picker Input" component.
 * Input size default (36px height), radius-lg (8px), bg-input, border-border, px-sm (12px).
 */
function DatePicker({
  date,
  onDateChange,
  className,
}: {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  className?: string
}) {
  const [selected, setSelected] = React.useState<Date | undefined>(date)

  const handleSelect = (day: Date | undefined) => {
    setSelected(day)
    onDateChange?.(day)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          data-slot="date-picker-trigger"
          className={cn(
            "flex h-9 w-[280px] items-center gap-xs rounded-lg border border-border bg-input px-sm typo-paragraph-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-md shrink-0" />
          <span className="flex-1 text-left">
            {selected ? format(selected, "PPP") : "Pick a date"}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

/**
 * SprouX Date Range Picker
 *
 * Figma: [SprouX - DS] Foundation & Component (node 288:119954, Type=Range)
 *
 * Date range selection using a 2-month Calendar in a Popover.
 * Trigger shows "Start – End" format or placeholder.
 */
function DateRangePicker({
  from,
  to,
  onRangeChange,
  className,
}: {
  from?: Date
  to?: Date
  onRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void
  className?: string
}) {
  const [range, setRange] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>({ from, to })

  const handleSelect = (selected: { from?: Date; to?: Date } | undefined) => {
    const newRange = { from: selected?.from, to: selected?.to }
    setRange(newRange)
    onRangeChange?.(newRange)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          data-slot="date-range-picker-trigger"
          className={cn(
            "flex h-9 items-center gap-xs rounded-lg border border-border bg-input px-sm typo-paragraph-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !range.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-md shrink-0" />
          <span className="flex-1 text-left">
            {range.from ? (
              range.to ? (
                `${format(range.from, "LLL dd, y")} – ${format(range.to, "LLL dd, y")}`
              ) : (
                format(range.from, "LLL dd, y")
              )
            ) : (
              "Pick a date range"
            )}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range.from ? { from: range.from, to: range.to } : undefined}
          onSelect={handleSelect}
          numberOfMonths={2}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, DateRangePicker }
