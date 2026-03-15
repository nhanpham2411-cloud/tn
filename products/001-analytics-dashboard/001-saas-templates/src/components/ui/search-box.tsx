import * as React from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { figma } from "@/lib/figma-dev"

/**
 * SprouX SearchBox
 *
 * Pill-shaped search input with Search icon (left), ⌘K shortcut badge (right),
 * and clear button when filled. Matches the header search bar pattern.
 * Single size (36px), rounded-full.
 */
function SearchBox({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
  shortcut = false,
  className,
  ...props
}: Omit<React.ComponentProps<"input">, "onChange"> & {
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  shortcut?: boolean
}) {
  const hasValue = !!value

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value)
  }

  const handleClear = () => {
    onChange?.("")
    onClear?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && hasValue) {
      e.preventDefault()
      handleClear()
    }
    props.onKeyDown?.(e)
  }

  return (
    <div
      {...figma("Search Box", {
        State: props.disabled ? "Disabled" : "Default",
        Value: hasValue ? "Filled" : "Placeholder",
        Shortcut: shortcut && !hasValue ? "Yes" : "No",
      })}
      className={cn("relative flex items-center", className)}
    >
      <Search className="absolute left-md pointer-events-none size-[16px] text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          "flex w-full h-9 rounded-full bg-muted dark:bg-white/[0.04] border border-border dark:border-white/[0.08] text-foreground sp-body transition-colors",
          "pl-3xl pr-md",
          "placeholder:text-muted-foreground",
          "hover:border-border dark:hover:border-white/[0.15]",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:border-border-strong",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border",
          "[&::-webkit-search-cancel-button]:hidden",
          hasValue && "pr-3xl",
          shortcut && !hasValue && "pr-[56px]",
        )}
        {...props}
      />
      {hasValue ? (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="size-[14px]" />
        </button>
      ) : shortcut ? (
        <kbd className="absolute right-md pointer-events-none hidden sm:inline-flex h-[20px] items-center gap-4xs rounded bg-surface-raised border border-border-subtle px-2xs sp-caption text-muted-foreground">
          <span className="sp-mini">⌘</span>K
        </kbd>
      ) : null}
    </div>
  )
}

export { SearchBox }
