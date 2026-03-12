/**
 * Style Mapper — Convert extracted CSS values to Figma semantic tokens
 *
 * Maps computed px values → spacing tokens, radius tokens
 * Maps computed colors → semantic color tokens
 * Maps computed fonts → text style names
 */

import { SPACING_MAP, RADIUS_MAP, TEXT_STYLE_RULES } from "./config.js"

// ── Spacing ──

export function mapSpacing(px: number): string | number {
  // Try exact match
  const token = SPACING_MAP[px]
  if (token) return token
  // Try nearest
  const values = Object.keys(SPACING_MAP).map(Number).sort((a, b) => a - b)
  let closest = values[0]
  for (const v of values) {
    if (Math.abs(v - px) < Math.abs(closest - px)) closest = v
  }
  // Only map if within 2px tolerance
  if (Math.abs(closest - px) <= 2) return SPACING_MAP[closest]
  return px // Return raw px if no match
}

export function mapPadding(top: number, right: number, bottom: number, left: number) {
  // Symmetric: paddingX/paddingY
  if (left === right && top === bottom) {
    return {
      paddingX: mapSpacing(left),
      paddingY: mapSpacing(top),
    }
  }
  // Asymmetric: return per-side values
  return {
    paddingX: left === right ? mapSpacing(left) : undefined,
    paddingY: top === bottom ? mapSpacing(top) : undefined,
    paddingTop: top !== bottom ? mapSpacing(top) : undefined,
    paddingRight: left !== right ? mapSpacing(right) : undefined,
    paddingBottom: top !== bottom ? mapSpacing(bottom) : undefined,
    paddingLeft: left !== right ? mapSpacing(left) : undefined,
  }
}

// ── Border Radius ──

export function mapRadius(px: number): string | number {
  if (px === 0) return "none"
  const token = RADIUS_MAP[px]
  if (token) return token
  // Nearest match with 2px tolerance
  const values = Object.keys(RADIUS_MAP).map(Number).sort((a, b) => a - b)
  let closest = values[0]
  for (const v of values) {
    if (Math.abs(v - px) < Math.abs(closest - px)) closest = v
  }
  if (Math.abs(closest - px) <= 2) return RADIUS_MAP[closest]
  return px
}

// ── Colors ──

// Parse rgba/rgb string → {r,g,b,a}
function parseColor(str: string | null | undefined): { r: number; g: number; b: number; a: number } | null {
  if (!str) return null
  // rgba(r, g, b, a)
  const rgba = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (rgba) {
    return {
      r: parseInt(rgba[1]),
      g: parseInt(rgba[2]),
      b: parseInt(rgba[3]),
      a: parseFloat(rgba[4] ?? "1"),
    }
  }
  return null
}

// Pre-built color token map: will be populated at runtime from CSS vars
let colorTokenMap: Map<string, string> | null = null

// Priority tokens — prefer these when multiple tokens share the same RGB
const PRIORITY_TOKENS = new Set([
  "foreground", "background", "primary", "primary-foreground",
  "secondary", "secondary-foreground", "muted", "muted-foreground",
  "accent", "accent-foreground", "destructive", "destructive-foreground",
  "border", "card", "card-foreground", "input",
  "ring", "popover", "sidebar-background", "sidebar-foreground",
  "brand", "brand-foreground",
  "success", "success-foreground", "warning", "warning-foreground",
  "emphasis", "emphasis-foreground",
])

// Force specific RGB → token overrides (applied after token map build)
const FORCED_TOKEN_MAP: Record<string, string> = {
  "255,255,255": "foreground",   // pure white → foreground (not emphasis-foreground)
}

export function buildColorTokenMap(cssVarMap: Record<string, string>) {
  colorTokenMap = new Map()
  // First pass: insert all tokens
  for (const [varName, computedColor] of Object.entries(cssVarMap)) {
    const parsed = parseColor(computedColor)
    if (parsed) {
      const key = `${parsed.r},${parsed.g},${parsed.b}`
      // Only overwrite if the new token has higher priority
      const existing = colorTokenMap.get(key)
      if (!existing || PRIORITY_TOKENS.has(varName)) {
        colorTokenMap.set(key, varName)
      }
    }
  }
  // Apply forced overrides
  for (const [key, token] of Object.entries(FORCED_TOKEN_MAP)) {
    colorTokenMap.set(key, token)
  }
}

// Hardcoded fallbacks for known non-token colors (e.g. auth panel)
const HARDCODED_COLOR_MAP: Record<string, string> = {
  "12,10,26": "sidebar-background",  // auth panel bg-[#0c0a1a]
  "12,12,16": "background",         // auth right panel bg
  "255,255,255": "foreground",          // pure white (text-white/XX) → closest semantic token
}

export function mapColor(rawRGBA: string | null | undefined): string | undefined {
  if (!rawRGBA) return undefined
  const parsed = parseColor(rawRGBA)
  if (!parsed) return undefined
  if (parsed.a === 0) return undefined // fully transparent

  const key = `${parsed.r},${parsed.g},${parsed.b}`

  // Check token map first
  if (colorTokenMap) {
    const token = colorTokenMap.get(key)
    if (token) {
      if (parsed.a < 1 && parsed.a > 0) {
        const pct = Math.round(parsed.a * 100)
        return `${token}/${pct}`
      }
      return token
    }
  }

  // Check hardcoded fallbacks
  const fallback = HARDCODED_COLOR_MAP[key]
  if (fallback) {
    if (parsed.a < 1 && parsed.a > 0) {
      return `${fallback}/${Math.round(parsed.a * 100)}`
    }
    return fallback
  }

  return rawRGBA // No token match
}

// ── Text Styles ──

export function mapTextStyle(
  fontFamily: string | undefined,
  fontWeight: number,
  fontSize: number
): string | undefined {
  if (!fontFamily) return undefined

  for (const rule of TEXT_STYLE_RULES) {
    if (
      rule.family.test(fontFamily) &&
      rule.weight === fontWeight &&
      fontSize >= rule.minSize &&
      fontSize <= rule.maxSize
    ) {
      return rule.style
    }
  }

  // Fuzzy match — same family and size, weight within 100
  for (const rule of TEXT_STYLE_RULES) {
    if (
      rule.family.test(fontFamily) &&
      Math.abs(rule.weight - fontWeight) <= 100 &&
      fontSize >= rule.minSize &&
      fontSize <= rule.maxSize
    ) {
      return rule.style
    }
  }

  return undefined
}

// ── Gap ──

export function mapGap(px: number): string | number {
  return mapSpacing(px)
}

// ── Flex alignment → Figma ──

export function mapPrimaryAlign(value: string | undefined): string | undefined {
  if (!value || value === "start") return undefined // default
  const map: Record<string, string> = {
    "center": "center",
    "end": "end",
    "space-between": "space-between",
  }
  return map[value]
}

export function mapCounterAlign(value: string | undefined): string | undefined {
  if (!value || value === "start") return undefined // default
  if (value === "stretch") return "stretch"
  if (value === "center") return "center"
  if (value === "end") return "end"
  return undefined
}

// ── CSS var extraction script (runs in browser) ──

export const CSS_VAR_EXTRACTION_SCRIPT = `
() => {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const vars = {};

  // Extract all CSS custom properties that map to semantic colors
  const semanticVars = [
    "background", "foreground", "foreground-subtle",
    "primary", "primary-foreground", "primary-hover", "primary-10", "primary-20",
    "secondary", "secondary-foreground", "secondary-hover",
    "muted", "muted-foreground",
    "accent", "accent-foreground", "accent-selected",
    "destructive", "destructive-foreground",
    "destructive-subtle", "destructive-subtle-foreground", "destructive-border",
    "border", "border-strong", "border-subtle", "border-card",
    "input", "input-readonly",
    "ring", "ring-error", "ring-brand", "ring-success", "ring-warning", "ring-emphasis",
    "card", "card-foreground", "card-subtle", "card-subtle-foreground",
    "popover", "popover-foreground",
    "ghost", "ghost-foreground", "ghost-hover",
    "outline", "outline-hover",
    "backdrop", "shadow-color",
    "surface-raised", "surface-inset",
    "code", "code-foreground",
    "brand", "brand-hover", "brand-foreground",
    "brand-subtle", "brand-subtle-foreground",
    "primary-subtle", "primary-subtle-foreground",
    "success", "success-foreground", "success-subtle", "success-subtle-foreground", "success-border",
    "warning", "warning-foreground", "warning-subtle", "warning-subtle-foreground", "warning-border",
    "emphasis", "emphasis-foreground", "emphasis-subtle", "emphasis-subtle-foreground", "emphasis-border",
    "sidebar-background", "sidebar-foreground",
    "sidebar-primary", "sidebar-primary-foreground",
    "sidebar-accent", "sidebar-accent-foreground",
    "sidebar-accent-hover", "sidebar-muted", "sidebar-border", "sidebar-ring",
    "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6",
  ];

  // Create a temp element to resolve CSS var values
  const temp = document.createElement("div");
  document.body.appendChild(temp);

  for (const name of semanticVars) {
    temp.style.color = "var(--" + name + ")";
    const computed = getComputedStyle(temp).color;
    if (computed && computed !== "" && computed !== "rgba(0, 0, 0, 0)") {
      vars[name] = computed;
    }
    temp.style.color = "";
  }

  document.body.removeChild(temp);
  return vars;
}
`
