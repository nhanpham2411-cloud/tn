import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"
import { figma, AVATAR_SIZE } from "@/lib/figma-dev"

/**
 * SprouX Avatar
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * User avatar with image + fallback (initials or icon).
 */
function Avatar({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  const hasImage = React.Children.toArray(children).some(
    (child) => React.isValidElement(child) && child.type === AvatarImage
  )
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      {...figma("Avatar", {
        Type: hasImage ? "Image" : "Text",
        Size: AVATAR_SIZE[className?.includes("size-8") ? "sm" : className?.includes("size-14") ? "lg" : "default"] ?? "Default",
      })}
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full border border-border",
        className
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground typo-paragraph-sm-bold",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
