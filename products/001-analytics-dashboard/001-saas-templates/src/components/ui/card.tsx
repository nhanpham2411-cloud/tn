import * as React from "react"

import { cn } from "@/lib/utils"
import { figma } from "@/lib/figma-dev"

/**
 * SprouX Card
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Content container with Header, Title, Description, Content, Footer sub-components.
 *
 * (no size) — Flat container with sub-component layout (CardHeader p-md, CardContent p-md, etc.)
 * size="md"   — p-xl (24px) flat container, no sub-components needed
 * size="lg"   — p-2xl (32px) flat container, no sub-components needed
 */
type CardSize = "md" | "lg"

function Card({
  className,
  size,
  ...props
}: React.ComponentProps<"div"> & { size?: CardSize }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      {...figma("Card", {
        Size: size === "lg" ? "Large" : size === "md" ? "Medium" : "Default",
      })}
      className={cn(
        "rounded-2xl border border-border/60 bg-card text-card-foreground dark:border-border-subtle",
        !size && "p-md",
        size === "md" && "p-xl",
        size === "lg" && "p-2xl",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-2xs p-md", className)}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("sp-h4 text-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("typo-paragraph-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("p-md pt-0", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center p-md pt-0", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
