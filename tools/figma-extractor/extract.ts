#!/usr/bin/env npx tsx
/**
 * Figma Extractor — Main Entry
 *
 * Usage:
 *   npx tsx extract.ts                           # Extract all pages, desktop only
 *   npx tsx extract.ts --page dashboard-overview  # Extract single page
 *   npx tsx extract.ts --breakpoint mobile        # Extract all pages at mobile
 *   npx tsx extract.ts --all                      # All pages × all breakpoints
 *   npx tsx extract.ts --states                   # All pages × default + all states
 *   npx tsx extract.ts --state filled --page X    # Extract specific state only
 *   npx tsx extract.ts --debug                    # Save raw DOM tree for debugging
 *   npx tsx extract.ts --copy --page X            # Extract and copy JSON to clipboard
 *   npx tsx extract.ts --serve                    # Start HTTP API server (port 3456)
 */

import { chromium } from "playwright"
import { writeFileSync, mkdirSync, existsSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { createServer } from "http"
import { execSync } from "child_process"

import { PAGES, BREAKPOINTS, BASE_URL, OUTPUT_DIR, type PageConfig, type Breakpoint } from "./config.js"
import { DOM_WALKER_SCRIPT } from "./dom-walker.js"
import type { ExtractedNode } from "./dom-walker.js"
import { RAW_DOM_WALKER_SCRIPT } from "./raw-dom-walker.js"
import type { RawExtractedNode } from "./raw-dom-walker.js"
import { buildColorTokenMap, CSS_VAR_EXTRACTION_SCRIPT } from "./style-mapper.js"
import { buildScreenJSON, formatJSON } from "./json-builder.js"
import { PAGE_STATES, type ScreenState, type StateAction } from "./states.js"
import { annotateTokens } from "./token-annotator.js"

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── CLI Args ──
const args = process.argv.slice(2)
const pageFilter = args.includes("--page") ? args[args.indexOf("--page") + 1] : null
const bpFilter = args.includes("--breakpoint") ? args[args.indexOf("--breakpoint") + 1]?.toLowerCase() : null
const extractAll = args.includes("--all")
const debug = args.includes("--debug")
const copyToClipboard = args.includes("--copy")
const serveMode = args.includes("--serve")
const includeStates = args.includes("--states")
const stateFilter = args.includes("--state") ? args[args.indexOf("--state") + 1] : null
const statesOnly = args.includes("--states-only") // Skip default, only extract states
const SERVE_PORT = 3456

async function main() {
  console.log("🚀 Figma Extractor v0.2")
  console.log(`   Base URL: ${BASE_URL}`)

  // Filter pages
  let pages = [...PAGES]
  if (pageFilter) {
    pages = pages.filter(p => p.name === pageFilter || p.name.includes(pageFilter))
    if (pages.length === 0) {
      console.error(`❌ No page found matching "${pageFilter}"`)
      console.log("Available pages:", PAGES.map(p => p.name).join(", "))
      process.exit(1)
    }
  }

  // Filter breakpoints
  let breakpoints = extractAll ? [...BREAKPOINTS] : [BREAKPOINTS[0]] // Default: desktop only
  if (bpFilter) {
    breakpoints = BREAKPOINTS.filter(b => b.name.toLowerCase() === bpFilter)
    if (breakpoints.length === 0) {
      console.error(`❌ No breakpoint found matching "${bpFilter}"`)
      process.exit(1)
    }
  }

  // Determine which states to extract
  const wantStates = includeStates || stateFilter !== null || statesOnly

  console.log(`   Pages: ${pages.length} | Breakpoints: ${breakpoints.map(b => b.name).join(", ")}`)
  if (wantStates) {
    const totalStates = pages.reduce((sum, p) => {
      const states = PAGE_STATES[p.name] || []
      return sum + (stateFilter ? states.filter(s => s.name === stateFilter).length : states.length)
    }, 0)
    console.log(`   States: ${totalStates} additional states`)
  }
  console.log()

  // Launch browser
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  // Extract color tokens first (from any page, dark mode)
  console.log("📋 Extracting color tokens...")
  const tokenPage = await context.newPage()
  await tokenPage.setViewportSize({ width: 1440, height: 900 })
  await tokenPage.goto(`${BASE_URL}${pages[0].route}`, { waitUntil: "networkidle" })
  await tokenPage.waitForTimeout(500)

  const cssVars = await tokenPage.evaluate(() => {
    const root = document.documentElement
    const vars: Record<string, string> = {}
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
    ]
    const temp = document.createElement("div")
    document.body.appendChild(temp)
    for (const name of semanticVars) {
      temp.style.color = `var(--${name})`
      const computed = getComputedStyle(temp).color
      if (computed && computed !== "" && computed !== "rgba(0, 0, 0, 0)") {
        vars[name] = computed
      }
      temp.style.color = ""
    }
    document.body.removeChild(temp)
    return vars
  })
  buildColorTokenMap(cssVars)
  console.log(`   Found ${Object.keys(cssVars).length} color tokens`)

  if (debug) {
    const debugDir = resolve(__dirname, "debug")
    mkdirSync(debugDir, { recursive: true })
    writeFileSync(resolve(debugDir, "color-tokens.json"), JSON.stringify(cssVars, null, 2))
    console.log("   Saved debug/color-tokens.json")
  }

  await tokenPage.close()

  // Extract each page × breakpoint × state
  let successCount = 0
  let errorCount = 0

  for (const page of pages) {
    for (const bp of breakpoints) {
      // Extract default state (unless --states-only)
      if (!statesOnly && !stateFilter) {
        try {
          const result = await extractPage(context, page, bp)
          if (result) {
            saveResult(result.screenJSON, page, bp)
            successCount++

            // Copy to clipboard if --copy flag (only for single page extraction)
            if (copyToClipboard && pages.length === 1 && breakpoints.length === 1) {
              try {
                const json = formatJSON(result.screenJSON)
                execSync("pbcopy", { input: json })
                console.log("   📋 Copied to clipboard!")
              } catch {
                console.log("   ⚠️ Could not copy to clipboard")
              }
            }
          }
        } catch (err) {
          console.error(`   ❌ Error: ${(err as Error).message}`)
          errorCount++
        }
      }

      // Extract additional states
      if (wantStates) {
        const states = PAGE_STATES[page.name] || []
        const targetStates = stateFilter
          ? states.filter(s => s.name === stateFilter)
          : states

        for (const state of targetStates) {
          try {
            const result = await extractPage(context, page, bp, state)
            if (result) {
              saveResult(result.screenJSON, page, bp, state)
              successCount++
            }
          } catch (err) {
            console.error(`   ❌ Error (${state.name}): ${(err as Error).message}`)
            errorCount++
          }
        }
      }
    }
  }

  await browser.close()

  console.log()
  console.log(`✅ Done! ${successCount} screens extracted, ${errorCount} errors`)
}

// ── State action executor ──

async function executeAction(page: any, action: StateAction): Promise<void> {
  switch (action.action) {
    case "fill":
      await page.fill(action.selector, action.text)
      break
    case "click":
      await page.click(action.selector, { timeout: 5000, force: (action as any).force })
      break
    case "wait":
      await page.waitForTimeout(action.ms)
      break
    case "waitFor":
      await page.waitForSelector(action.selector, { timeout: action.timeout || 5000 })
      break
    case "evaluate":
      await page.evaluate(action.script)
      break
    case "press":
      await page.keyboard.press(action.key)
      break
    case "hover":
      await page.hover(action.selector)
      break
  }
}

// ── Page extraction ──

interface ExtractResult {
  screenJSON: ReturnType<typeof buildScreenJSON>
  rawTree: ExtractedNode
}

async function extractPage(
  context: Awaited<ReturnType<typeof chromium.launch>>["contexts"][number] extends never ? never : any,
  pageConfig: PageConfig,
  bp: Breakpoint,
  state?: ScreenState
): Promise<ExtractResult | null> {
  const stateSuffix = state ? ` [${state.name}]` : ""
  const pageName = `${pageConfig.name} (${bp.name})${stateSuffix}`
  process.stdout.write(`   📄 ${pageName}... `)

  const page = await context.newPage()
  await page.setViewportSize({ width: bp.width, height: bp.height })

  const url = `${BASE_URL}${pageConfig.route}`
  const waitUntil = state?.waitMode || "networkidle"
  await page.goto(url, { waitUntil })

  // Wait for animations/transitions to settle (unless state says skip)
  if (!state?.skipSettleWait) {
    await page.waitForTimeout(1000)
  }

  // Run state setup actions
  if (state?.actions) {
    for (const action of state.actions) {
      try {
        await executeAction(page, action)
      } catch (err) {
        if (debug) console.log(`\n      ⚠️ Action ${action.action} failed: ${(err as Error).message}`)
        // Continue with remaining actions — partial state is still useful
      }
    }
  }

  // Extract DOM tree
  const rawTree = await page.evaluate(`(${DOM_WALKER_SCRIPT})()`) as ExtractedNode | null

  if (!rawTree) {
    console.log("⚠️ Empty tree")
    await page.close()
    return null
  }

  // For state extractions, use modified page name for output
  const effectivePageConfig = state
    ? { ...pageConfig, name: `${pageConfig.name}-${state.name}` } as any as PageConfig
    : pageConfig

  if (debug) {
    const debugDir = resolve(__dirname, "debug")
    mkdirSync(debugDir, { recursive: true })
    writeFileSync(
      resolve(debugDir, `${effectivePageConfig.name}-${bp.name.toLowerCase()}-raw.json`),
      JSON.stringify(rawTree, null, 2)
    )
  }

  // Build screen JSON
  const screenJSON = buildScreenJSON(rawTree, effectivePageConfig, bp)

  const rootChildren = (screenJSON.root as any).children || []
  const childCount = countNodes(rootChildren)
  console.log(`✅ ${childCount} nodes`)

  await page.close()
  return { screenJSON, rawTree }
}


function countNodes(children: any[]): number {
  let count = children.length
  for (const child of children) {
    if (child.children) count += countNodes(child.children)
  }
  return count
}

function saveResult(screenJSON: any, page: PageConfig, bp: Breakpoint, state?: ScreenState) {
  const outDir = resolve(__dirname, OUTPUT_DIR, page.category)
  mkdirSync(outDir, { recursive: true })

  const baseName = page.name.replace(`${page.category}-`, "")
  const stateSuffix = state ? `-${state.name}` : ""

  const filename = bp.name === "Desktop"
    ? `${baseName}${stateSuffix}.json`
    : `${baseName}${stateSuffix}-${bp.name.toLowerCase()}.json`

  const outPath = resolve(outDir, filename)
  writeFileSync(outPath, formatJSON(screenJSON))
  console.log(`      → ${outPath.replace(resolve(__dirname, "../.."), "")}`)
}

// ── Raw extraction for serve mode (uses RAW_DOM_WALKER_SCRIPT) ──
// Returns richer tree with SVG content, background selectors, mixed inline runs

async function extractPageRaw(
  context: any,
  pageConfig: PageConfig,
  bp: Breakpoint,
  state?: ScreenState
): Promise<RawExtractedNode | null> {
  const page = await context.newPage()
  await page.setViewportSize({ width: bp.width, height: bp.height })

  const url = `${BASE_URL}${pageConfig.route}`
  const waitUntil = state?.waitMode || "networkidle"
  await page.goto(url, { waitUntil })

  if (!state?.skipSettleWait) {
    await page.waitForTimeout(1000)
  }

  // Run state setup actions
  if (state?.actions) {
    for (const action of state.actions) {
      try {
        await executeAction(page, action)
      } catch (err) {
        if (debug) console.log(`\n      ⚠️ Action ${action.action} failed: ${(err as Error).message}`)
      }
    }
  }

  // Extract DOM tree using RAW walker (SVG vectors, background selectors, mixed inline runs)
  const rawTree = await page.evaluate(`(${RAW_DOM_WALKER_SCRIPT})()`) as RawExtractedNode | null
  if (!rawTree) {
    await page.close()
    return null
  }

  await page.close()
  return rawTree
}


// ── Serve mode: HTTP API for Figma plugin ──

async function startServer() {
  console.log("🚀 Figma Extractor API Server")
  console.log(`   Base URL: ${BASE_URL}`)
  console.log(`   Available pages: ${PAGES.length}`)
  console.log()

  // Pre-initialize browser and color tokens
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  // Extract color tokens once
  console.log("📋 Extracting color tokens...")
  const tokenPage = await context.newPage()
  await tokenPage.setViewportSize({ width: 1440, height: 900 })
  await tokenPage.goto(`${BASE_URL}${PAGES[0].route}`, { waitUntil: "networkidle" })
  await tokenPage.waitForTimeout(500)
  const cssVars = await tokenPage.evaluate(`(${CSS_VAR_EXTRACTION_SCRIPT})()`) as Record<string, string>
  buildColorTokenMap(cssVars)
  console.log(`   Found ${Object.keys(cssVars).length} color tokens`)
  await tokenPage.close()

  const server = createServer(async (req, res) => {
    // CORS for Figma plugin UI iframe
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url || "/", `http://localhost:${SERVE_PORT}`)

    // GET /api/pages — list available pages + states
    if (url.pathname === "/api/pages") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(JSON.stringify({
        pages: PAGES.map(p => ({
          name: p.name,
          route: p.route,
          category: p.category,
          layout: p.layout,
          states: (PAGE_STATES[p.name] || []).map(s => s.name),
        })),
        breakpoints: BREAKPOINTS.map(b => ({
          name: b.name,
          width: b.width,
          height: b.height,
        })),
      }))
      return
    }

    // GET /api/extract/:page?breakpoint=Desktop&state=filled
    if (url.pathname.startsWith("/api/extract/")) {
      const pageName = url.pathname.replace("/api/extract/", "")
      const bpName = url.searchParams.get("breakpoint") || "Desktop"
      const stateName = url.searchParams.get("state") || null

      const pageConfig = PAGES.find(p => p.name === pageName)
      if (!pageConfig) {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: `Page "${pageName}" not found` }))
        return
      }

      const bp = BREAKPOINTS.find(b => b.name.toLowerCase() === bpName.toLowerCase())
      if (!bp) {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: `Breakpoint "${bpName}" not found` }))
        return
      }

      // Find state if requested
      let state: ScreenState | undefined
      if (stateName) {
        const states = PAGE_STATES[pageName] || []
        state = states.find(s => s.name === stateName)
        if (!state) {
          res.writeHead(400, { "Content-Type": "application/json" })
          res.end(JSON.stringify({
            error: `State "${stateName}" not found for page "${pageName}"`,
            available: states.map(s => s.name),
          }))
          return
        }
      }

      const stateLabel = state ? ` [${state.name}]` : ""
      console.log(`   📄 Extracting ${pageName} (${bp.name})${stateLabel}...`)

      try {
        // Use RAW walker for serve mode (SVG vectors, background effects, mixed inline runs)
        const rawTree = await extractPageRaw(context, pageConfig, bp, state)
        if (!rawTree) {
          res.writeHead(500, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "Empty tree" }))
          return
        }

        // Enrich raw tree with semantic token annotations (colorToken, fillToken, gapToken, etc.)
        annotateTokens(rawTree as any)

        // Return raw tree for HTML to Figma plugin (it has its own rendering engine)
        const responsePageName = state
          ? `${pageName}/${state.name}`
          : pageName

        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ pageName: responsePageName, tree: rawTree }))
        console.log(`   ✅ Done`)
      } catch (err) {
        console.error(`   ❌ Error: ${(err as Error).message}`)
        res.writeHead(500, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ error: (err as Error).message }))
      }
      return
    }

    // 404
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: "Not found" }))
  })

  server.listen(SERVE_PORT, () => {
    console.log()
    console.log(`🌐 Server running at http://localhost:${SERVE_PORT}`)
    console.log(`   GET /api/pages                                    — List pages + states`)
    console.log(`   GET /api/extract/{page}?breakpoint=X              — Extract default`)
    console.log(`   GET /api/extract/{page}?breakpoint=X&state=filled — Extract state`)
    console.log()
    console.log(`   Example: http://localhost:${SERVE_PORT}/api/extract/auth-sign-in?state=filled`)
    console.log()
    console.log("Press Ctrl+C to stop.")
  })

  // Cleanup on exit
  process.on("SIGINT", async () => {
    console.log("\nShutting down...")
    await browser.close()
    server.close()
    process.exit(0)
  })
}

// ── Entry point ──

if (serveMode) {
  startServer().catch(err => {
    console.error("Fatal error:", err)
    process.exit(1)
  })
} else {
  main().catch(err => {
    console.error("Fatal error:", err)
    process.exit(1)
  })
}
