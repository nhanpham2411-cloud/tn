import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

/**
 * SprouX Combobox
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Searchable select using Command + Popover composition.
 * Supports iconLeft, iconRight, prefix, suffix (inside trigger),
 * and textLeft, textRight (external addon labels attached to trigger).
 */
type ComboboxOption = {
  value: string
  label: string
}

function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  disabled,
  iconLeft,
  iconRight,
  prefix,
  suffix,
  textLeft,
  textRight,
  className,
}: {
  options: ComboboxOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  iconLeft?: React.ReactNode
  iconRight?: React.ReactNode
  prefix?: string
  suffix?: string
  textLeft?: string
  textRight?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [selected, setSelected] = React.useState(value ?? "")

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === selected ? "" : currentValue
    setSelected(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  const selectedLabel = options.find((opt) => opt.value === selected)?.label

  return (
    <div className="flex items-center">
      {textLeft && (
        <span className="inline-flex items-center h-9 px-sm border border-r-0 border-border rounded-l-lg bg-muted text-muted-foreground text-sm shrink-0">
          {textLeft}
        </span>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-[200px] justify-between",
              textLeft && "rounded-l-none border-l-0",
              textRight && "rounded-r-none border-r-0",
              className
            )}
          >
            <span className="flex items-center gap-xs min-w-0 truncate">
              {iconLeft && <span className="shrink-0 text-muted-foreground [&>svg]:size-md">{iconLeft}</span>}
              {prefix && <span className="shrink-0 text-muted-foreground">{prefix}</span>}
              <span className="truncate">{selectedLabel ?? placeholder}</span>
              {suffix && <span className="shrink-0 text-muted-foreground">{suffix}</span>}
            </span>
            <span className="flex items-center gap-xs shrink-0 ml-xs">
              {iconRight && <span className="text-muted-foreground [&>svg]:size-md">{iconRight}</span>}
              <ChevronsUpDown className="size-md opacity-50" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-xs size-md",
                        selected === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {textRight && (
        <span className="inline-flex items-center h-9 px-sm border border-l-0 border-border rounded-r-lg bg-muted text-muted-foreground text-sm shrink-0">
          {textRight}
        </span>
      )}
    </div>
  )
}

export { Combobox, type ComboboxOption }
