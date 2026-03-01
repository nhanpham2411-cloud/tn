import * as React from "react"
import { format, subDays, startOfYear, startOfMonth, endOfMonth, subMonths } from "date-fns"
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
            "flex h-9 w-full sm:w-[280px] items-center gap-xs rounded-lg border border-border bg-input px-sm typo-paragraph-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
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

/* ── Presets for DateRangePicker ── */
const RANGE_PRESETS = [
  { label: "Last 7 days", getValue: () => ({ from: subDays(new Date(), 7), to: new Date() }) },
  { label: "Last 14 days", getValue: () => ({ from: subDays(new Date(), 14), to: new Date() }) },
  { label: "Last 30 days", getValue: () => ({ from: subDays(new Date(), 30), to: new Date() }) },
  { label: "Last 60 days", getValue: () => ({ from: subDays(new Date(), 60), to: new Date() }) },
  { label: "Last 90 days", getValue: () => ({ from: subDays(new Date(), 90), to: new Date() }) },
  { label: "This month", getValue: () => ({ from: startOfMonth(new Date()), to: new Date() }) },
  { label: "Last month", getValue: () => ({ from: startOfMonth(subMonths(new Date(), 1)), to: endOfMonth(subMonths(new Date(), 1)) }) },
  { label: "This year", getValue: () => ({ from: startOfYear(new Date()), to: new Date() }) },
]

/**
 * SprouX Date Range Picker
 *
 * Figma: [SprouX - DS] Foundation & Component (node 288:119954, Type=Range)
 *
 * Date range selection using a 2-month Calendar in a Popover with preset shortcuts.
 * Left panel: quick presets (Last 7/14/30/60/90 days, This month, Last month, This year).
 * Right panel: 2-month calendar for custom range selection.
 * Trigger shows "Start – End" format or placeholder.
 */
function DateRangePicker({
  from,
  to,
  onRangeChange,
  presets = true,
  className,
}: {
  from?: Date
  to?: Date
  onRangeChange?: (range: { from: Date | undefined; to: Date | undefined }) => void
  presets?: boolean
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [range, setRange] = React.useState<{
    from: Date | undefined
    to: Date | undefined
  }>({ from, to })
  const [activePreset, setActivePreset] = React.useState("")

  const handleSelect = (selected: { from?: Date; to?: Date } | undefined) => {
    const newRange = { from: selected?.from, to: selected?.to }
    setRange(newRange)
    setActivePreset("")
    onRangeChange?.(newRange)
    if (newRange.from && newRange.to) {
      setOpen(false)
    }
  }

  const handlePreset = (preset: typeof RANGE_PRESETS[number]) => {
    const value = preset.getValue()
    setRange(value)
    setActivePreset(preset.label)
    onRangeChange?.(value)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
        <div className="flex">
          {presets && (
            <div className="flex flex-col gap-3xs border-r border-border/30 dark:border-white/[0.06] p-sm min-w-[140px]">
              <p className="sp-label text-muted-foreground px-sm pb-2xs">Presets</p>
              {RANGE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePreset(preset)}
                  className={`sp-caption text-left px-sm py-xs rounded-md transition-colors ${
                    activePreset === preset.label
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
          <div>
            <Calendar
              mode="range"
              selected={range.from ? { from: range.from, to: range.to } : undefined}
              onSelect={handleSelect}
              numberOfMonths={2}
              initialFocus
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, DateRangePicker }
