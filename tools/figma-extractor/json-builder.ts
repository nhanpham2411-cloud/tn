/**
 * JSON Builder — Convert extracted DOM tree → Plugin-compatible screen JSON
 *
 * Output format matches the plugin's "Generate UI" tab:
 * { pageName, root: { type: "frame", sizing, children: [...] } }
 *
 * KEY SIZING RULES (learned from hand-written screen JSONs):
 * - Text nodes: NEVER set sizing → auto-hug
 * - Component instances: width "fill" or omit (hug), NEVER fixed height
 * - Frames with children: width "fill" if stretching, omit height (hug)
 * - Decorative frames (no children): keep fixed sizing
 * - Icons/placeholders: keep fixed sizing
 * - Thin elements (1-2px): convert to separator
 */

import type { ExtractedNode } from "./dom-walker.js"
import {
  mapSpacing, mapPadding, mapRadius, mapColor, mapTextStyle,
  mapGap, mapPrimaryAlign, mapCounterAlign,
} from "./style-mapper.js"
import type { PageConfig, Breakpoint } from "./config.js"

type PluginNode = Record<string, unknown>

interface ScreenJSON {
  pageName: string
  root: PluginNode
}

export function buildScreenJSON(
  tree: ExtractedNode,
  page: PageConfig,
  breakpoint: Breakpoint
): ScreenJSON {
  // Convert root's children directly as top-level panels
  const rootChildren = (tree.children || [])
    .map(c => convertNode(c, true))
    .filter(Boolean) as PluginNode[]

  const root: PluginNode = {
    type: "frame",
    name: formatScreenName(page.name, breakpoint.name),
    layout: tree.layout || "vertical",
    sizing: { width: `fixed:${breakpoint.width}`, height: `fixed:${breakpoint.height}` },
    fill: "background",
  }

  if (rootChildren && rootChildren.length > 0) {
    root.children = rootChildren
  }

  return {
    pageName: formatPageName(page.name),
    root,
  }
}

function formatScreenName(pageName: string, breakpoint: string): string {
  return pageName
    .split("-")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") + ` — ${breakpoint}`
}

function formatPageName(pageName: string): string {
  const parts = pageName.split("-")
  const category = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  const rest = parts.slice(1)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
  return `${category} — ${rest}`
}

// ── Node converters ──

function convertNode(node: ExtractedNode, isTopLevel = false): PluginNode | null {
  if (!node) return null

  switch (node.type) {
    case "instance":
      return convertInstance(node)
    case "text":
      return convertText(node)
    case "icon":
      return convertIcon(node)
    case "image":
      return convertImage(node)
    case "frame":
      return convertFrame(node, isTopLevel)
    default:
      return null
  }
}

function convertInstance(node: ExtractedNode): PluginNode {
  const result: PluginNode = {
    type: "component",
    componentSet: node.component!,
    name: node.component!,
  }

  if (node.variants && Object.keys(node.variants).length > 0) {
    result.variants = node.variants
  }

  if (node.textOverrides && Object.keys(node.textOverrides).length > 0) {
    result.overrides = { text: node.textOverrides }
  }

  // Instances: fill width if stretching, otherwise omit sizing (hug)
  if (node.fillWidth) {
    result.sizing = { width: "fill" }
  }
  // Never set fixed height on instances

  return result
}

function convertText(node: ExtractedNode): PluginNode {
  const textStyle = mapTextStyle(node.fontFamily, node.fontWeight || 400, node.fontSize || 14)
  const textFill = mapColor(node.color)

  const result: PluginNode = {
    type: "text",
    content: node.textContent || "",
  }

  if (textStyle) result.textStyle = textStyle
  if (textFill) result.fill = textFill

  if (node.textAlign && node.textAlign !== "left" && node.textAlign !== "start") {
    result.textAlign = node.textAlign
  }

  // Text: fill width/height if parent stretches it, otherwise NEVER set sizing (hug)
  const textSizing: Record<string, string> = {}
  if (node.fillWidth) textSizing.width = "fill"
  if (node.fillHeight) textSizing.height = "fill"
  if (Object.keys(textSizing).length > 0) result.sizing = textSizing

  return result
}

function convertIcon(node: ExtractedNode): PluginNode {
  const color = mapColor(node.color)
  const result: PluginNode = {
    type: "icon",
    name: node.name || "Icon",
    sizing: {
      width: `fixed:${node.width || 16}`,
      height: `fixed:${node.height || 16}`,
    },
  }
  if (color) result.fill = color
  return result
}

function convertImage(node: ExtractedNode): PluginNode {
  const imgSizing: Record<string, string> = {}
  if (node.fillWidth) {
    imgSizing.width = "fill"
  } else {
    imgSizing.width = `fixed:${node.width || 100}`
  }
  imgSizing.height = `fixed:${node.height || 100}`

  // Large SVG illustrations → placeholder (avoids base64 bloat)
  const isLargeIllustration = node.tagName === "svg" && ((node.width || 0) > 100 || (node.height || 0) > 100)

  if (isLargeIllustration) {
    return {
      type: "placeholder",
      name: node.name || "Illustration",
      sizing: imgSizing,
      fill: "card",
      fillOpacity: 0.06,
      radius: node.radius ? mapRadius(node.radius) : "xl",
      label: node.name || "Illustration",
    }
  }

  const result: PluginNode = {
    type: "image",
    name: node.name || "Image",
    sizing: imgSizing,
    radius: node.radius ? mapRadius(node.radius) : undefined,
  }

  if (node.src && node.src.startsWith("data:image")) {
    result.imageBase64 = node.src
  } else if (node.src && node.src.startsWith("http")) {
    result.imageUrl = node.src
  } else {
    result.type = "placeholder"
    result.fill = "card"
    result.fillOpacity = 0.06
    result.label = node.name || "Image"
  }

  return result
}

function convertFrame(node: ExtractedNode, isTopLevel = false): PluginNode | null {
  const children = (node.children || [])
    .map(c => convertNode(c, false))
    .filter(Boolean) as PluginNode[]

  // Detect separator: thin element (1-2px) with no children
  if (isSeparator(node)) {
    const isVertical = (node.width || 0) <= 2 && (node.height || 0) > 2
    return { type: "separator", direction: isVertical ? "vertical" : undefined }
  }

  if (children.length === 0 && !node.fill && !node.stroke) {
    return null
  }

  const result: PluginNode = {
    type: "frame",
    layout: node.layout || "vertical",
  }

  // Name
  if (node.dataSlot) {
    result.name = node.dataSlot
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c: string) => c.toUpperCase())
  }

  // Gap
  const gap = mapGap(node.gap || 0)
  if (gap !== "none" && gap !== 0) result.gap = gap

  // Padding
  const paddingInfo = mapPadding(
    node.paddingTop || 0,
    node.paddingRight || 0,
    node.paddingBottom || 0,
    node.paddingLeft || 0
  )
  const hasPaddingX = paddingInfo.paddingX && paddingInfo.paddingX !== "none" && paddingInfo.paddingX !== 0
  const hasPaddingY = paddingInfo.paddingY && paddingInfo.paddingY !== "none" && paddingInfo.paddingY !== 0
  const hasAsymmetric = !!(paddingInfo as any).paddingTop || !!(paddingInfo as any).paddingLeft

  if (!hasAsymmetric && hasPaddingX && hasPaddingY && paddingInfo.paddingX === paddingInfo.paddingY) {
    result.padding = paddingInfo.paddingX
  } else if (!hasAsymmetric) {
    if (hasPaddingX) result.paddingX = paddingInfo.paddingX
    if (hasPaddingY) result.paddingY = paddingInfo.paddingY
  } else {
    // Asymmetric padding: use per-side when available
    const pi = paddingInfo as any
    if (pi.paddingTop) result.paddingTop = pi.paddingTop
    if (pi.paddingRight) result.paddingRight = pi.paddingRight
    if (pi.paddingBottom) result.paddingBottom = pi.paddingBottom
    if (pi.paddingLeft) result.paddingLeft = pi.paddingLeft
    // Symmetric axis still uses paddingX/paddingY
    if (hasPaddingX && !pi.paddingLeft) result.paddingX = paddingInfo.paddingX
    if (hasPaddingY && !pi.paddingTop) result.paddingY = paddingInfo.paddingY
  }

  // Alignment
  const pAlign = mapPrimaryAlign(node.primaryAlign)
  const cAlign = mapCounterAlign(node.counterAlign)
  if (pAlign || cAlign) {
    const align: Record<string, string> = {}
    if (pAlign) align.justify = pAlign
    if (cAlign) align.counter = cAlign
    result.align = align
  }

  if (node.wrap) result.wrap = true

  // Grid annotation
  if (node.gridCols && node.gridCols > 1) {
    result.name = (result.name || "Grid") + ` (${node.gridCols}-col)`
  }

  // ── Sizing logic ──
  // Top-level panels (direct children of root): use fixed width or fill, height = fill
  // Frames with children: width = fill if stretching, omit height (hug)
  // Decorative frames (no children): keep fixed sizing
  const sizing: Record<string, string> = {}

  if (isTopLevel) {
    // Top-level panels: explicit width, fill height
    if (node.fillWidth) {
      sizing.width = "fill"
    } else if (node.width) {
      sizing.width = `fixed:${node.width}`
    }
    sizing.height = "fill"
  } else if (children.length === 0) {
    // Decorative frame (colored box, etc.): keep fixed sizing
    if (node.width) sizing.width = `fixed:${node.width}`
    if (node.height) sizing.height = `fixed:${node.height}`
  } else {
    // Frame with children: prefer fill/hug, avoid fixed height
    if (node.fillWidth) {
      sizing.width = "fill"
    } else if (node.width) {
      sizing.width = `fixed:${node.width}`
    }
    if (node.fillHeight) {
      sizing.height = "fill"
    }
    // Never set fixed height on frames with children → let them hug
  }

  if (Object.keys(sizing).length > 0) result.sizing = sizing

  // Visual
  const fill = mapColor(node.fill)
  if (fill) result.fill = fill

  const stroke = mapColor(node.stroke)
  if (stroke) result.stroke = stroke

  const radius = node.radius ? mapRadius(node.radius) : undefined
  if (radius && radius !== "none" && radius !== 0) result.radius = radius

  if (node.overflow === "hidden") result.clipsContent = true
  if (node.opacity !== undefined && node.opacity !== 1) result.opacity = node.opacity

  if (children.length > 0) result.children = children

  return result
}

// ── Helpers ──

function isSeparator(node: ExtractedNode): boolean {
  if (node.children && node.children.length > 0) return false
  const w = node.width || 0
  const h = node.height || 0
  // Thin horizontal line (height 1-2px) or vertical line (width 1-2px)
  return (h <= 2 && w > 2) || (w <= 2 && h > 2)
}

// ── JSON output ──

export function formatJSON(json: ScreenJSON): string {
  return JSON.stringify(json, null, 2)
}
