/**
 * Figma Dev Markers — data attributes cho DOM extraction pipeline.
 * Chỉ active trong DEV mode. Production build sẽ tree-shake hết.
 *
 * Usage trong UI components:
 *   <button {...figma("Button", { Variant: "Default", Size: "Default" })} />
 */

const IS_DEV = import.meta.env.DEV

type FigmaAttrs = {
  "data-figma"?: string
  "data-figma-variants"?: string
}

export function figma(component: string, variants: Record<string, string>): FigmaAttrs {
  if (!IS_DEV) return {}
  return {
    "data-figma": component,
    "data-figma-variants": JSON.stringify(variants),
  }
}

// ── Variant value maps: React lowercase → Figma Title Case ──

export const BUTTON_VARIANT: Record<string, string> = {
  default: "Default", secondary: "Secondary", outline: "Outline",
  ghost: "Ghost", "ghost-muted": "Ghost Muted",
  destructive: "Destructive", "destructive-secondary": "Destructive Secondary",
  special: "Special",
}

export const BUTTON_SIZE: Record<string, string> = {
  lg: "Large", default: "Default", sm: "Small", xs: "Mini",
  icon: "Default", "icon-sm": "Small", "icon-xs": "Mini", "icon-lg": "Large",
}

export const BUTTON_ICON: Record<string, string> = {
  icon: "Icon Only", "icon-sm": "Icon Only", "icon-xs": "Icon Only", "icon-lg": "Icon Only",
}

export const BADGE_VARIANT: Record<string, string> = {
  default: "Default", secondary: "Secondary", outline: "Outline",
  ghost: "Ghost", destructive: "Destructive", emphasis: "Emphasis",
  success: "Success", warning: "Warning",
}

export const BADGE_LEVEL: Record<string, string> = {
  primary: "Primary", secondary: "Secondary",
}

export const BADGE_SIZE: Record<string, string> = {
  sm: "SM", default: "Default", lg: "LG",
}

// ── Checkbox / Switch / Radio ──
export const CHECK_VALUE: Record<string, string> = {
  checked: "Checked", unchecked: "Unchecked", indeterminate: "Indeterminate",
}

export const SWITCH_VALUE: Record<string, string> = {
  checked: "On", unchecked: "Off",
}

export const RADIO_VALUE: Record<string, string> = {
  checked: "Checked", unchecked: "Unchecked",
}

// ── Toggle ──
export const TOGGLE_VARIANT: Record<string, string> = {
  default: "Default", outline: "Outline",
}

export const TOGGLE_SIZE: Record<string, string> = {
  sm: "Small", default: "Default", lg: "Large",
}

export const TOGGLE_VALUE: Record<string, string> = {
  on: "Pressed", off: "Unpressed",
}

// ── Avatar ──
export const AVATAR_SIZE: Record<string, string> = {
  sm: "SM", default: "Default", lg: "LG",
}

// ── Thumbnail ──
export const THUMBNAIL_TYPE: Record<string, string> = {
  image: "Image", icon: "Icon", text: "Text",
}

export const THUMBNAIL_SIZE: Record<string, string> = {
  xs: "XS", sm: "SM", default: "Default", lg: "LG", xl: "XL",
}

export const THUMBNAIL_SHAPE: Record<string, string> = {
  square: "Square", circle: "Circle",
}

export const THUMBNAIL_COLOR: Record<string, string> = {
  default: "Default", primary: "Primary", "primary-solid": "Primary Solid",
  success: "Success", destructive: "Destructive", warning: "Warning",
  outline: "Outline", surface: "Surface",
}

// ── Progress ──
export const PROGRESS_LABEL: Record<string, string> = {
  true: "Yes", false: "No",
}

// ── Alert ──
export const ALERT_TYPE: Record<string, string> = {
  default: "Neutral", destructive: "Error", success: "Success",
  warning: "Warning", emphasis: "Emphasis",
}

// ── Tabs ──
export const TABS_VARIANT: Record<string, string> = {
  default: "Default", pill: "Pill",
}

// ── Accordion ──
export const ACCORDION_TYPE: Record<string, string> = {
  open: "Open", closed: "Closed",
}
