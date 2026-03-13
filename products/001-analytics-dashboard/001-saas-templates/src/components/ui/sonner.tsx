import * as React from "react"
import { Toaster as Sonner } from "sonner"
import { useTheme } from "@/hooks/use-theme"

/**
 * SprouX Sonner (Toast)
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Toast notifications via sonner library.
 * Place <Toaster /> at root, trigger with toast() function.
 */
const toasterStyle = {
  "--normal-bg": "var(--foreground)",
  "--normal-text": "var(--background)",
  "--normal-border": "color-mix(in srgb, var(--foreground) 90%, transparent)",
  "--success-bg": "var(--foreground)",
  "--success-text": "var(--background)",
  "--success-border": "color-mix(in srgb, var(--foreground) 90%, transparent)",
  "--error-bg": "var(--foreground)",
  "--error-text": "var(--background)",
  "--error-border": "color-mix(in srgb, var(--foreground) 90%, transparent)",
  "--warning-bg": "var(--foreground)",
  "--warning-text": "var(--background)",
  "--warning-border": "color-mix(in srgb, var(--foreground) 90%, transparent)",
  "--info-bg": "var(--foreground)",
  "--info-text": "var(--background)",
  "--info-border": "color-mix(in srgb, var(--foreground) 90%, transparent)",
} as React.CSSProperties

function Toaster(props: React.ComponentProps<typeof Sonner>) {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      data-slot="sonner-toaster"
      theme={resolvedTheme as "light" | "dark"}
      className="toaster group"
      style={toasterStyle}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:py-sm group-[.toaster]:px-md group-[.toaster]:shadow-lg",
          description: "group-[.toast]:!text-[color-mix(in_srgb,var(--background)_70%,transparent)]",
          actionButton:
            "group-[.toast]:!bg-[var(--background)] group-[.toast]:!text-[var(--foreground)]",
          cancelButton:
            "group-[.toast]:!bg-[var(--background)]/20 group-[.toast]:!text-[var(--background)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
