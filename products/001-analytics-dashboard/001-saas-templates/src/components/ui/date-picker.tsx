import * as React from "react"
import { format, subDays, startOfYear, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
 * Footer: selected range label + Cancel / Apply buttons.
 * Changes are staged (pending) and only committed on Apply.
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
  // committed = what the trigger shows (last applied value)
  const [committed, setCommitted] = React.useState<{ from: Date | undefined; to: Date | undefined }>({ from, to })
  // pending = what the user is currently selecting inside the popover
  const [pending, setPending] = React.useState<{ from: Date | undefined; to: Date | undefined }>({ from, to })
  const [activePreset, setActivePreset] = React.useState("")

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // Reset pending to committed every time the popover opens
      setPending(committed)
      setActivePreset("")
    }
    setOpen(next)
  }

  const handleSelect = (selected: { from?: Date; to?: Date } | undefined) => {
    setPending({ from: selected?.from, to: selected?.to })
    setActivePreset("")
  }

  const handlePreset = (preset: typeof RANGE_PRESETS[number]) => {
    setPending(preset.getValue())
    setActivePreset(preset.label)
  }

  const handleApply = () => {
    setCommitted(pending)
    onRangeChange?.(pending)
    setOpen(false)
  }

  const handleCancel = () => {
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          data-slot="date-range-picker-trigger"
          className={cn(
            "flex h-9 w-full sm:w-[280px] items-center gap-xs rounded-lg border border-border bg-input px-sm typo-paragraph-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            !committed.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-md shrink-0" />
          <span className="flex-1 text-left">
            {committed.from ? (
              committed.to ? (
                `${format(committed.from, "MMM d")} – ${format(committed.to, "MMM d, yyyy")}`
              ) : (
                format(committed.from, "MMM d, yyyy")
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
          <div className="flex flex-col">
            <Calendar
              mode="range"
              selected={pending.from ? { from: pending.from, to: pending.to } : undefined}
              onSelect={handleSelect}
              numberOfMonths={2}
              initialFocus
            />
            <div className="flex items-center justify-between border-t border-border/30 dark:border-white/[0.06] px-md py-sm">
              <p className="sp-caption text-muted-foreground">
                {pending.from && pending.to
                  ? `${format(pending.from, "MMM d")} – ${format(pending.to, "MMM d, yyyy")}`
                  : pending.from
                    ? `${format(pending.from, "MMM d, yyyy")} – ...`
                    : "Select a range"}
              </p>
              <div className="flex items-center gap-sm">
                <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
                <Button size="sm" disabled={!pending.from || !pending.to} onClick={handleApply}>Apply</Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker, DateRangePicker }
