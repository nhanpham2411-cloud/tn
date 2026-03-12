#!/usr/bin/env npx tsx
/**
 * HTML to Figma — CLI Extractor
 *
 * Extracts DOM tree with RAW pixel values (no token mapping)
 * for the "HTML to Figma" Figma plugin.
 *
 * Usage:
 *   npx tsx html-to-figma.ts --url http://localhost:5173/auth/sign-in
 *   npx tsx html-to-figma.ts --page auth-sign-in
 *   npx tsx html-to-figma.ts --page auth-sign-in --copy
 *   npx tsx html-to-figma.ts --page auth-sign-in --out output.json
 *   npx tsx html-to-figma.ts --serve   # HTTP API mode
 */

import { chromium } from "playwright"
import { writeFileSync, mkdirSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { createServer } from "http"
import { execSync } from "child_process"

import { PAGES, BREAKPOINTS, BASE_URL, type PageConfig } from "./config.js"
import { RAW_DOM_WALKER_SCRIPT, type RawExtractedNode } from "./raw-dom-walker.js"
import {
  buildColorTokenMap, mapColor, mapSpacing, mapRadius, mapTextStyle,
} from "./style-mapper.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── CLI Args ──
const args = process.argv.slice(2)
const pageFilter = args.includes("--page") ? args[args.indexOf("--page") + 1] : null
const urlArg = args.includes("--url") ? args[args.indexOf("--url") + 1] : null
const outFile = args.includes("--out") ? args[args.indexOf("--out") + 1] : null
const copyToClipboard = args.includes("--copy")
const serveMode = args.includes("--serve")
const debug = args.includes("--debug")
const bpArg = args.includes("--breakpoint") ? args[args.indexOf("--breakpoint") + 1]?.toLowerCase() : null
const SERVE_PORT = 3457

async function main() {
  console.log("🚀 HTML to Figma Extractor v1.0")

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  if (urlArg) {
    // Direct URL mode
    const bp = bpArg
      ? BREAKPOINTS.find(b => b.name.toLowerCase() === bpArg) || BREAKPOINTS[0]
      : BREAKPOINTS[0]
    const result = await extractURL(context, urlArg, bp.width, bp.height)
    outputResult(result, "extracted")
  } else if (pageFilter) {
    // Page name mode
    const page = PAGES.find(p => p.name === pageFilter || p.name.includes(pageFilter))
    if (!page) {
      console.error(`❌ No page found matching "${pageFilter}"`)
      console.log("Available pages:", PAGES.map(p => p.name).join(", "))
      process.exit(1)
    }
    const bp = bpArg
      ? BREAKPOINTS.find(b => b.name.toLowerCase() === bpArg) || BREAKPOINTS[0]
      : BREAKPOINTS[0]
    const url = `${BASE_URL}${page.route}`
    console.log(`   URL: ${url}`)
    console.log(`   Viewport: ${bp.width}×${bp.height}`)
    const result = await extractURL(context, url, bp.width, bp.height)
    outputResult(result, page.name)
  } else if (!serveMode) {
    console.log("Usage:")
    console.log("  npx tsx html-to-figma.ts --url http://localhost:5173/auth/sign-in")
    console.log("  npx tsx html-to-figma.ts --page auth-sign-in")
    console.log("  npx tsx html-to-figma.ts --page auth-sign-in --copy")
    console.log("  npx tsx html-to-figma.ts --serve")
  }

  await browser.close()
}

// Browser script: extract CSS custom properties → normalized rgba values
const CSS_VAR_NORMALIZE_SCRIPT = `
() => {
  const _cc = document.createElement("canvas");
  _cc.width = 1; _cc.height = 1;
  const _ctx = _cc.getContext("2d");
  function norm(str) {
    if (!str || str === "rgba(0, 0, 0, 0)") return null;
    if (str.startsWith("rgb")) return str;
    if (_ctx) {
      _ctx.clearRect(0, 0, 1, 1);
      _ctx.fillStyle = str;
      _ctx.fillRect(0, 0, 1, 1);
      var d = _ctx.getImageData(0, 0, 1, 1).data;
      if (d[3] === 0) return null;
      var a = Math.round((d[3] / 255) * 100) / 100;
      if (a >= 1) return "rgb(" + d[0] + ", " + d[1] + ", " + d[2] + ")";
      return "rgba(" + d[0] + ", " + d[1] + ", " + d[2] + ", " + a + ")";
    }
    return str;
  }
  var vars = {};
  var names = [
    "background","foreground","foreground-subtle",
    "primary","primary-foreground","primary-hover","primary-10","primary-20",
    "secondary","secondary-foreground","secondary-hover",
    "muted","muted-foreground",
    "accent","accent-foreground","accent-selected",
    "destructive","destructive-foreground",
    "destructive-subtle","destructive-subtle-foreground","destructive-border",
    "border","border-strong","border-subtle","border-card",
    "input","input-readonly",
    "ring","ring-error","ring-brand","ring-success","ring-warning","ring-emphasis",
    "card","card-foreground","card-subtle","card-subtle-foreground",
    "popover","popover-foreground",
    "ghost","ghost-foreground","ghost-hover",
    "outline","outline-hover",
    "backdrop","shadow-color",
    "surface-raised","surface-inset",
    "code","code-foreground",
    "brand","brand-hover","brand-foreground",
    "brand-subtle","brand-subtle-foreground",
    "primary-subtle","primary-subtle-foreground",
    "success","success-foreground","success-subtle","success-subtle-foreground","success-border",
    "warning","warning-foreground","warning-subtle","warning-subtle-foreground","warning-border",
    "emphasis","emphasis-foreground","emphasis-subtle","emphasis-subtle-foreground","emphasis-border",
    "sidebar-background","sidebar-foreground",
    "sidebar-primary","sidebar-primary-foreground",
    "sidebar-accent","sidebar-accent-foreground",
    "sidebar-accent-hover","sidebar-muted","sidebar-border","sidebar-ring",
    "chart-1","chart-2","chart-3","chart-4","chart-5","chart-6",
  ];
  var temp = document.createElement("div");
  document.body.appendChild(temp);
  for (var i = 0; i < names.length; i++) {
    temp.style.color = "var(--" + names[i] + ")";
    var c = getComputedStyle(temp).color;
    if (c && c !== "" && c !== "rgba(0, 0, 0, 0)") {
      vars[names[i]] = norm(c) || c;
    }
    temp.style.color = "";
  }
  document.body.removeChild(temp);
  return vars;
}
`

async function extractURL(
  context: any,
  url: string,
  width: number,
  height: number
): Promise<RawExtractedNode> {
  const page = await context.newPage()
  await page.setViewportSize({ width, height })
  await page.goto(url, { waitUntil: "networkidle" })
  await page.waitForTimeout(1000) // Let animations settle

  // Force all animations/transitions to finish → elements at final state
  await page.addStyleTag({ content: "*, *::before, *::after { animation-duration: 0s !important; animation-delay: 0s !important; transition-duration: 0s !important; transition-delay: 0s !important; }" })
  await page.waitForTimeout(100) // Let forced styles apply

  // Extract CSS custom properties → build color token reverse-lookup
  console.log("   Extracting CSS tokens...")
  const cssVarMap = await page.evaluate(`(${CSS_VAR_NORMALIZE_SCRIPT})()`) as Record<string, string>
  buildColorTokenMap(cssVarMap)
  const tokenCount = Object.keys(cssVarMap).length
  console.log(`   Resolved ${tokenCount} color tokens`)

  console.log("   Extracting DOM...")
  const rawTree = await page.evaluate(`(${RAW_DOM_WALKER_SCRIPT})()`) as RawExtractedNode

  if (!rawTree) {
    throw new Error("Empty DOM tree")
  }

  // Count nodes
  let nodeCount = 0
  function countAll(n: any) {
    nodeCount++
    if (n.children) n.children.forEach(countAll)
  }
  countAll(rawTree)
  console.log(`   Extracted ${nodeCount} nodes`)

  // Screenshot images (SVG illustrations that couldn't be serialized, IMG tags)
  await screenshotImages(page, rawTree)

  // Screenshot decorative backgrounds (glow effects, grid patterns, etc.)
  await screenshotBackgrounds(page, rawTree)

  // Annotate tree with token mappings (color, spacing, radius, text style)
  annotateTokens(rawTree)
  console.log("   Token mapping applied")

  if (debug) {
    const debugDir = resolve(__dirname, "debug")
    mkdirSync(debugDir, { recursive: true })
    writeFileSync(resolve(debugDir, "html-to-figma-raw.json"), JSON.stringify(rawTree, null, 2))
    console.log("   Saved debug/html-to-figma-raw.json")
  }

  await page.close()
  return rawTree
}

/**
 * Map CSS box-shadow blur radius → Figma effect style name.
 * Parses the largest blur value from (possibly multi-layer) box-shadow.
 */
function mapShadowToken(shadow: string): string | undefined {
  if (!shadow || shadow === "none") return undefined
  // Extract all blur values: "0 4px 6px rgba(...), 0 2px 4px rgba(...)"
  const blurValues: number[] = []
  // Each shadow layer: [inset?] x y blur [spread] color
  const layers = shadow.split(/,(?![^(]*\))/) // split on comma not inside parens
  for (const layer of layers) {
    const nums = layer.trim().replace(/^inset\s*/, "").match(/-?[\d.]+px/g)
    if (nums && nums.length >= 3) {
      blurValues.push(parseFloat(nums[2])) // 3rd number is blur
    }
  }
  if (blurValues.length === 0) return undefined
  const maxBlur = Math.max(...blurValues)
  if (maxBlur <= 0) return undefined
  // Map blur radius → shadow token
  if (maxBlur <= 2) return "Shadow/xs"
  if (maxBlur <= 4) return "Shadow/sm"
  if (maxBlur <= 8) return "Shadow/md"
  if (maxBlur <= 16) return "Shadow/lg"
  if (maxBlur <= 25) return "Shadow/xl"
  return "Shadow/2xl"
}

/**
 * Walk extracted tree and annotate nodes with semantic token names.
 * Adds fillToken, strokeToken, colorToken, gapToken, padding*Token, radiusToken, shadowToken, textStyle.
 * EVERY element must get foundation tokens — including 0px values → "none".
 */
// Component slot → token overrides
// When data-slot is detected, force correct semantic tokens instead of relying on RGB reverse-lookup
const SLOT_TOKEN_MAP: Record<string, { fillToken?: string; strokeToken?: string; radiusToken?: string }> = {
  "card":            { fillToken: "card", strokeToken: "border", radiusToken: "xl" },
  "card-header":     { fillToken: "" },  // transparent (no fill)
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

function annotateTokens(node: RawExtractedNode) {
  const isLayoutFrame = node.type === "frame" && !!node.layout

  // Component slot token overrides — force correct tokens for known components
  const slotOverrides = node.name ? SLOT_TOKEN_MAP[node.name] : undefined
  if (slotOverrides) {
    if (slotOverrides.fillToken !== undefined) {
      if (slotOverrides.fillToken === "") {
        // Empty string = transparent, remove fill
        delete node.fill
        delete (node as any).fillToken
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

  // Color tokens (skip if already set by slot override)
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

  // Spacing tokens (gap, padding) — always annotate for layout frames, including 0 → "none"
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
    // Non-layout frames: only annotate if value exists and > 0
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

  // Border radius token — always annotate, including 0 → "none"
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
      // No radius specified → treat as 0 → "none"
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

/**
 * Screenshot image nodes that don't have inline data.
 * Captures SVG illustrations and IMG elements as PNG base64.
 */
async function screenshotImages(page: any, tree: RawExtractedNode) {
  const imageNodes: RawExtractedNode[] = []
  collectImageNodes(tree, imageNodes)

  if (imageNodes.length === 0) return
  console.log(`   Screenshotting ${imageNodes.length} image(s)...`)

  for (const node of imageNodes) {
    if (!node.selector) continue
    // Skip if already has SVG content or base64
    if (node.svgContent || (node.src && node.src.startsWith("data:"))) continue
    try {
      const el = page.locator(node.selector).first()
      const isVisible = await el.isVisible().catch(() => false)
      if (!isVisible) continue

      const buffer = await el.screenshot({ type: "png" })
      node.imageBase64 = `data:image/png;base64,${buffer.toString("base64")}`
    } catch {
      // Skip failed screenshots
    }
  }
}

function collectImageNodes(node: RawExtractedNode, out: RawExtractedNode[]) {
  if (node.type === "image" && node.selector) out.push(node)
  if (node.type === "svg" && !node.svgContent && node.selector) out.push(node)
  if (node.children) {
    for (const child of node.children) {
      collectImageNodes(child, out)
    }
  }
}

/**
 * Screenshot frames with decorative backgrounds (glow, grid patterns, etc.)
 * Sets backgroundImage on the frame node for the plugin to use as fill.
 */
async function screenshotBackgrounds(page: any, tree: RawExtractedNode) {
  const bgNodes: RawExtractedNode[] = []
  collectBgNodes(tree, bgNodes)

  if (bgNodes.length === 0) return
  console.log(`   Screenshotting ${bgNodes.length} background(s)...`)

  for (const node of bgNodes) {
    if (!node.backgroundSelector) continue
    try {
      const el = page.locator(node.backgroundSelector).first()
      const isVisible = await el.isVisible().catch(() => false)
      if (!isVisible) continue

      // Hide non-decorative (non-absolute) children before screenshot
      // so only background effects (glow, grid) are captured
      await el.evaluate((parent: HTMLElement) => {
        for (const child of parent.children) {
          const pos = getComputedStyle(child).position
          if (pos !== "absolute" && pos !== "fixed") {
            ;(child as HTMLElement).dataset._wasVis = (child as HTMLElement).style.visibility
            ;(child as HTMLElement).style.visibility = "hidden"
          }
        }
      })
      const buffer = await el.screenshot({ type: "png" })
      // Restore hidden children
      await el.evaluate((parent: HTMLElement) => {
        for (const child of parent.children) {
          if ("_wasVis" in (child as HTMLElement).dataset) {
            ;(child as HTMLElement).style.visibility = (child as HTMLElement).dataset._wasVis || ""
            delete (child as HTMLElement).dataset._wasVis
          }
        }
      })
      ;(node as any).backgroundImage = `data:image/png;base64,${buffer.toString("base64")}`
    } catch {
      // Skip failed screenshots
    }
  }
}

function collectBgNodes(node: RawExtractedNode, out: RawExtractedNode[]) {
  if (node.backgroundSelector) out.push(node)
  if (node.children) {
    for (const child of node.children) {
      collectBgNodes(child, out)
    }
  }
}

function outputResult(tree: RawExtractedNode, name: string) {
  const json = JSON.stringify(tree, null, 2)
  const sizeKB = Math.round(Buffer.byteLength(json) / 1024)

  if (outFile) {
    writeFileSync(outFile, json)
    console.log(`   ✅ Saved to ${outFile} (${sizeKB} KB)`)
  }

  if (copyToClipboard) {
    try {
      execSync("pbcopy", { input: json })
      console.log(`   📋 Copied to clipboard (${sizeKB} KB)`)
    } catch {
      console.log("   ⚠️ Could not copy to clipboard")
    }
  }

  if (!outFile && !copyToClipboard) {
    // Default: save to debug dir
    const debugDir = resolve(__dirname, "debug")
    mkdirSync(debugDir, { recursive: true })
    const outPath = resolve(debugDir, `${name}-raw.json`)
    writeFileSync(outPath, json)
    console.log(`   ✅ Saved to ${outPath} (${sizeKB} KB)`)
  }

  console.log(`   Done!`)
}

// ── Serve mode ──

async function startServer() {
  console.log("🚀 HTML to Figma API Server")
  console.log(`   Base URL: ${BASE_URL}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  const server = createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url || "/", `http://localhost:${SERVE_PORT}`)

    // GET /api/pages
    if (url.pathname === "/api/pages") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({
        pages: PAGES.map(p => ({ name: p.name, route: p.route, category: p.category })),
      }))
      return
    }

    // GET /api/extract/:page or POST /api/extract with { url }
    if (url.pathname.startsWith("/api/extract")) {
      const pageName = url.pathname.replace("/api/extract/", "").replace("/api/extract", "")
      const bpParam = url.searchParams.get("breakpoints") // comma-separated: "Desktop,Tablet,Mobile"
      const bpName = url.searchParams.get("breakpoint") || "Desktop"

      let targetUrl: string
      let displayName = pageName || "page"
      if (pageName) {
        const pageConfig = PAGES.find(p => p.name === pageName)
        if (!pageConfig) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: `Page "${pageName}" not found` }))
          return
        }
        targetUrl = `${BASE_URL}${pageConfig.route}`
        displayName = pageConfig.name
      } else {
        const customUrl = url.searchParams.get("url")
        if (!customUrl) {
          res.writeHead(400, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "Provide page name or ?url= parameter" }))
          return
        }
        targetUrl = customUrl
      }

      // Multi-breakpoint mode
      if (bpParam) {
        const bpNames = bpParam.split(",").map(s => s.trim())
        const selectedBPs = bpNames
          .map(n => BREAKPOINTS.find(b => b.name.toLowerCase() === n.toLowerCase()))
          .filter(Boolean) as typeof BREAKPOINTS[number][]

        if (selectedBPs.length === 0) {
          res.writeHead(400, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "No valid breakpoints found" }))
          return
        }

        console.log(`   📄 Extracting ${targetUrl} at ${selectedBPs.length} breakpoint(s)...`)
        try {
          const roots = []
          for (const bp of selectedBPs) {
            console.log(`      → ${bp.name} (${bp.width}×${bp.height})`)
            const tree = await extractURL(context, targetUrl, bp.width, bp.height)
            roots.push({
              breakpoint: bp.name,
              width: bp.width,
              minHeight: bp.height,
              tree,
            })
          }
          res.writeHead(200, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ pageName: displayName, roots }, null, 2))
          console.log(`   ✅ Done (${roots.length} breakpoints)`)
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: (err as Error).message }))
        }
        return
      }

      // Single breakpoint mode (backward compatible)
      const bp = BREAKPOINTS.find(b => b.name.toLowerCase() === bpName.toLowerCase()) || BREAKPOINTS[0]
      console.log(`   📄 Extracting ${targetUrl} (${bp.width}×${bp.height})...`)
      try {
        const result = await extractURL(context, targetUrl, bp.width, bp.height)
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(result, null, 2))
        console.log(`   ✅ Done`)
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: (err as Error).message }))
      }
      return
    }

    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "Not found" }))
  })

  server.listen(SERVE_PORT, () => {
    console.log(`\n🌐 Server at http://localhost:${SERVE_PORT}`)
    console.log(`   GET /api/extract/{page}     — Extract by page name`)
    console.log(`   GET /api/extract?url=...    — Extract any URL`)
    console.log(`\nPress Ctrl+C to stop.`)
  })

  process.on("SIGINT", async () => {
    console.log("\nShutting down...")
    await browser.close()
    server.close()
    process.exit(0)
  })
}

// ── Entry ──

if (serveMode) {
  startServer().catch(err => { console.error("Fatal:", err); process.exit(1) })
} else {
  main().catch(err => { console.error("Fatal:", err); process.exit(1) })
}
