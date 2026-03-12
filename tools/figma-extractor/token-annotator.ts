/**
 * Token Annotator — Enrich raw DOM tree with semantic token names
 *
 * Shared module used by both html-to-figma.ts and extract.ts serve mode.
 * Walks tree and adds fillToken, strokeToken, colorToken, gapToken,
 * padding*Token, radiusToken, shadowToken, textStyle.
 */

import { mapColor, mapSpacing, mapRadius, mapTextStyle } from "./style-mapper.js"

// ── Shadow mapping ──

function mapShadowToken(shadow: string): string | undefined {
  if (!shadow || shadow === "none") return undefined
  const blurValues: number[] = []
  const layers = shadow.split(/,(?![^(]*\))/)
  for (const layer of layers) {
    const nums = layer.trim().replace(/^inset\s*/, "").match(/-?[\d.]+px/g)
    if (nums && nums.length >= 3) {
      blurValues.push(parseFloat(nums[2]))
    }
  }
  if (blurValues.length === 0) return undefined
  const maxBlur = Math.max(...blurValues)
  if (maxBlur <= 0) return undefined
  if (maxBlur <= 2) return "Shadow/xs"
  if (maxBlur <= 4) return "Shadow/sm"
  if (maxBlur <= 8) return "Shadow/md"
  if (maxBlur <= 16) return "Shadow/lg"
  if (maxBlur <= 25) return "Shadow/xl"
  return "Shadow/2xl"
}

// ── Slot token overrides ──

const SLOT_TOKEN_MAP: Record<string, { fillToken?: string; strokeToken?: string; radiusToken?: string }> = {
  "card":            { fillToken: "card", strokeToken: "border", radiusToken: "xl" },
  "card-header":     { fillToken: "" },
  "card-content":    { fillToken: "" },
  "card-footer":     { fillToken: "" },
  "dialog":          { fillToken: "card", strokeToken: "border", radiusToken: "xl" },
  "dialog-header":   { fillToken: "" },
  "dialog-content":  { fillToken: "" },
  "dialog-footer":   { fillToken: "" },
  "alert":           { fillToken: "card", strokeToken: "border", radiusToken: "lg" },
  "alert-dialog":    { fillToken: "card", strokeToken: "border", radiusToken: "xl" },
  "sheet-content":   { fillToken: "card", strokeToken: "border" },
  "drawer-content":  { fillToken: "card", strokeToken: "border" },
  "popover":         { fillToken: "popover", strokeToken: "border", radiusToken: "lg" },
  "dropdown-menu":   { fillToken: "popover", strokeToken: "border", radiusToken: "lg" },
  "select-content":  { fillToken: "popover", strokeToken: "border", radiusToken: "lg" },
  "tooltip":         { fillToken: "primary", radiusToken: "md" },
}

// ── Main annotator ──

interface AnnotatableNode {
  type: string
  name?: string
  layout?: string
  fill?: string
  stroke?: string
  color?: string
  gap?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  radius?: number | { topLeft: number; topRight: number; bottomLeft: number; bottomRight: number }
  shadow?: string
  fontFamily?: string
  fontWeight?: number
  fontSize?: number
  children?: AnnotatableNode[]
  // Token fields (added by this annotator)
  fillToken?: string
  strokeToken?: string
  colorToken?: string
  gapToken?: string
  paddingTopToken?: string
  paddingRightToken?: string
  paddingBottomToken?: string
  paddingLeftToken?: string
  radiusToken?: string | { topLeft: string; topRight: string; bottomLeft: string; bottomRight: string }
  shadowToken?: string
  textStyle?: string
  dataSlot?: string
}

export function annotateTokens(node: AnnotatableNode) {
  const isLayoutFrame = node.type === "frame" && !!node.layout

  // Component slot token overrides
  const slotName = node.dataSlot || node.name
  const slotOverrides = slotName ? SLOT_TOKEN_MAP[slotName] : undefined
  if (slotOverrides) {
    if (slotOverrides.fillToken !== undefined) {
      if (slotOverrides.fillToken === "") {
        delete node.fill
        delete node.fillToken
      } else {
        node.fillToken = slotOverrides.fillToken
      }
    }
    if (slotOverrides.strokeToken !== undefined) {
      node.strokeToken = slotOverrides.strokeToken
    }
    if (slotOverrides.radiusToken !== undefined) {
      node.radiusToken = slotOverrides.radiusToken
    }
  }

  // Color tokens
  if (node.fill && !node.fillToken) {
    const token = mapColor(node.fill)
    if (token && token !== node.fill) node.fillToken = token
  }
  if (node.stroke && !node.strokeToken) {
    const token = mapColor(node.stroke)
    if (token && token !== node.stroke) node.strokeToken = token
  }
  if (node.color) {
    const token = mapColor(node.color)
    if (token && token !== node.color) node.colorToken = token
  }

  // Spacing tokens
  if (isLayoutFrame) {
    const gap = node.gap ?? 0
    const token = mapSpacing(gap)
    if (typeof token === "string") node.gapToken = token

    const pTop = node.paddingTop ?? 0
    const pRight = node.paddingRight ?? 0
    const pBottom = node.paddingBottom ?? 0
    const pLeft = node.paddingLeft ?? 0
    const tTop = mapSpacing(pTop)
    const tRight = mapSpacing(pRight)
    const tBottom = mapSpacing(pBottom)
    const tLeft = mapSpacing(pLeft)
    if (typeof tTop === "string") node.paddingTopToken = tTop
    if (typeof tRight === "string") node.paddingRightToken = tRight
    if (typeof tBottom === "string") node.paddingBottomToken = tBottom
    if (typeof tLeft === "string") node.paddingLeftToken = tLeft
  } else {
    if (node.gap && node.gap > 0) {
      const token = mapSpacing(node.gap)
      if (typeof token === "string") node.gapToken = token
    }
    if (node.paddingTop && node.paddingTop > 0) {
      const token = mapSpacing(node.paddingTop)
      if (typeof token === "string") node.paddingTopToken = token
    }
    if (node.paddingRight && node.paddingRight > 0) {
      const token = mapSpacing(node.paddingRight)
      if (typeof token === "string") node.paddingRightToken = token
    }
    if (node.paddingBottom && node.paddingBottom > 0) {
      const token = mapSpacing(node.paddingBottom)
      if (typeof token === "string") node.paddingBottomToken = token
    }
    if (node.paddingLeft && node.paddingLeft > 0) {
      const token = mapSpacing(node.paddingLeft)
      if (typeof token === "string") node.paddingLeftToken = token
    }
  }

  // Border radius token
  if (node.type === "frame") {
    if (typeof node.radius === "number") {
      const token = mapRadius(node.radius)
      if (typeof token === "string") node.radiusToken = token
    } else if (typeof node.radius === "object" && node.radius !== null) {
      const r = node.radius as { topLeft: number; topRight: number; bottomLeft: number; bottomRight: number }
      node.radiusToken = {
        topLeft: String(mapRadius(r.topLeft ?? 0)),
        topRight: String(mapRadius(r.topRight ?? 0)),
        bottomLeft: String(mapRadius(r.bottomLeft ?? 0)),
        bottomRight: String(mapRadius(r.bottomRight ?? 0)),
      }
    } else {
      node.radiusToken = "none"
      node.radius = 0
    }
  }

  // Shadow → effect style token
  if (node.shadow) {
    const shadowToken = mapShadowToken(node.shadow)
    if (shadowToken) node.shadowToken = shadowToken
  }

  // Text style
  if (node.type === "text" && node.fontFamily) {
    const style = mapTextStyle(node.fontFamily, node.fontWeight || 400, node.fontSize || 14)
    if (style) node.textStyle = style
  }

  // Recurse children
  if (node.children) {
    for (const child of node.children) {
      annotateTokens(child)
    }
  }
}
