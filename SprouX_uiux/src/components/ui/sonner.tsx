import * as React from "react"
import { Toaster as Sonner } from "sonner"

/**
 * SprouX Sonner (Toast)
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Toast notifications via sonner library.
 * Place <Toaster /> at root, trigger with toast() function.
 */
function Toaster(props: React.ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      data-slot="sonner-toaster"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
