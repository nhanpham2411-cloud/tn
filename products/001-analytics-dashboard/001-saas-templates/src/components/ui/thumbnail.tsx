import * as React from "react"

import { cn } from "@/lib/utils"
import { figma, THUMBNAIL_SIZE, THUMBNAIL_TYPE, THUMBNAIL_SHAPE, THUMBNAIL_COLOR } from "@/lib/figma-dev"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   THUMBNAIL
   Square or circular visual element — product image with
   fallback, icon inside a colored box, circular icon,
   or text/initials badge.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

type ThumbnailSize = "xs" | "sm" | "default" | "lg" | "xl"
type ThumbnailColor = "default" | "primary" | "primary-solid" | "success" | "destructive" | "warning" | "outline" | "surface"
type ThumbnailShape = "square" | "circle"

const imageSquareSizeClasses: Record<ThumbnailSize, string> = {
  xs: "size-[24px] rounded-sm",
  sm: "size-[32px] rounded-md",
  default: "size-[40px] rounded-lg",
  lg: "size-[48px] rounded-lg",
  xl: "size-[64px] rounded-lg",
}

const imageCircleSizeClasses: Record<ThumbnailSize, string> = {
  xs: "size-[24px] rounded-full",
  sm: "size-[32px] rounded-full",
  default: "size-[40px] rounded-full",
  lg: "size-[48px] rounded-full",
  xl: "size-[64px] rounded-full",
}

const iconSquareSizeClasses: Record<ThumbnailSize, string> = {
  xs: "size-[24px] rounded-md",
  sm: "size-[28px] rounded-md",
  default: "size-[36px] rounded-lg",
  lg: "size-[44px] rounded-xl",
  xl: "size-[64px] rounded-xl",
}

const iconCircleSizeClasses: Record<ThumbnailSize, string> = {
  xs: "size-[24px] rounded-full",
  sm: "size-[28px] rounded-full",
  default: "size-[40px] rounded-full",
  lg: "size-[48px] rounded-full",
  xl: "size-[64px] rounded-full",
}

const textSquareSizeClasses: Record<ThumbnailSize, string> = {
  xs: "size-[24px] rounded-md typo-paragraph-mini",
  sm: "size-[28px] rounded-md typo-paragraph-mini",
  default: "size-[40px] rounded-lg typo-paragraph-sm",
  lg: "size-[48px] rounded-lg typo-paragraph-sm",
  xl: "size-[64px] rounded-lg typo-heading-6",
}

const textCircleSizeClasses: Record<ThumbnailSize, string> = {
  xs: "size-[24px] rounded-full typo-paragraph-mini",
  sm: "size-[28px] rounded-full typo-paragraph-mini",
  default: "size-[40px] rounded-full typo-paragraph-sm",
  lg: "size-[48px] rounded-full typo-paragraph-sm",
  xl: "size-[64px] rounded-full typo-heading-6",
}

const colorClasses: Record<ThumbnailColor, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary-10 dark:bg-primary-20 text-primary",
  "primary-solid": "bg-primary text-primary-foreground",
  success: "bg-success-subtle text-success",
  destructive: "bg-destructive-subtle text-destructive",
  warning: "bg-warning-subtle text-warning",
  outline: "bg-outline-hover text-muted-foreground",
  surface: "bg-surface-raised text-muted-foreground",
}

/* ── Image Thumbnail ── */
interface ThumbnailImageProps {
  type?: "image"
  /** Size preset */
  size?: ThumbnailSize
  /** Shape — square (rounded corners) or circle (default: square) */
  shape?: ThumbnailShape
  /** Semantic color preset — controls background color (visible in fallback state) */
  color?: ThumbnailColor
  /** Image source URL */
  src?: string
  /** Accessible alt text */
  alt?: string
  /** Fallback text when image fails or missing (1-3 chars) */
  fallback?: string
  className?: string
}

/* ── Icon Thumbnail ── */
interface ThumbnailIconProps {
  type: "icon"
  /** Size preset */
  size?: ThumbnailSize
  /** Shape — square (rounded corners) or circle (default: square) */
  shape?: ThumbnailShape
  /** Semantic color preset — controls background and icon color (via currentColor inheritance) */
  color?: ThumbnailColor
  /** Icon element (e.g. <Package className="size-[18px]" />) */
  icon: React.ReactNode
  className?: string
}

/* ── Text Thumbnail ── */
interface ThumbnailTextProps {
  type: "text"
  /** Size preset */
  size?: ThumbnailSize
  /** Shape — square (rounded corners) or circle (default: circle) */
  shape?: ThumbnailShape
  /** Semantic color preset — controls background and text color */
  color?: ThumbnailColor
  /** Text content (initials, numbers, 1-3 chars) */
  text: string | number
  className?: string
}

type ThumbnailProps = ThumbnailImageProps | ThumbnailIconProps | ThumbnailTextProps

function Thumbnail(props: ThumbnailProps) {
  const { type = "image", size = "default", className } = props
  const color = (props as ThumbnailImageProps | ThumbnailIconProps | ThumbnailTextProps).color ?? "default"
  const shape = type === "text"
    ? ((props as ThumbnailTextProps).shape ?? "circle")
    : ((props as ThumbnailImageProps | ThumbnailIconProps).shape ?? "square")

  const sizeClasses =
    type === "image" && shape === "circle" ? imageCircleSizeClasses[size]
    : type === "image" ? imageSquareSizeClasses[size]
    : type === "icon" && shape === "circle" ? iconCircleSizeClasses[size]
    : type === "icon" ? iconSquareSizeClasses[size]
    : type === "text" && shape === "square" ? textSquareSizeClasses[size]
    : textCircleSizeClasses[size]

  return (
    <div
      data-slot="thumbnail"
      {...figma("Thumbnail", {
        Type: THUMBNAIL_TYPE[type] ?? "Image",
        Size: THUMBNAIL_SIZE[size] ?? "Default",
        Shape: THUMBNAIL_SHAPE[shape] ?? "Square",
        Color: THUMBNAIL_COLOR[color] ?? "Default",
      })}
      className={cn(
        "shrink-0 overflow-hidden",
        type === "image"
          ? cn(sizeClasses, "bg-surface-raised ring-1 ring-border relative")
          : type === "text"
            ? cn(sizeClasses, colorClasses[color], "flex items-center justify-center font-semibold")
            : cn(sizeClasses, colorClasses[color], "flex items-center justify-center"),
        className,
      )}
    >
      {type === "image" && <ImageContent {...(props as ThumbnailImageProps)} />}
      {type === "icon" && (props as ThumbnailIconProps).icon}
      {type === "text" && (props as ThumbnailTextProps).text}
    </div>
  )
}

function ImageContent({ src, alt = "", fallback }: ThumbnailImageProps) {
  const [imgError, setImgError] = React.useState(false)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt={alt}
        className="size-full object-cover"
        onError={() => setImgError(true)}
      />
    )
  }

  if (fallback) {
    return (
      <span className="flex size-full items-center justify-center typo-paragraph-mini text-muted-foreground">
        {fallback}
      </span>
    )
  }

  return null
}

export { Thumbnail }
export type { ThumbnailProps, ThumbnailSize, ThumbnailColor, ThumbnailShape }
