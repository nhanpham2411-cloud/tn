# DOM Extraction Pipeline — Web React → Figma Screen JSON

## Mục tiêu

Tự động extract DOM từ web React đang chạy → generate Figma screen JSON → chạy plugin tạo màn hình trên Figma. **Zero Claude token**, chính xác, reusable cho mọi product.

## Pipeline tổng quan

```
[Web App chạy localhost]
        │
        ▼
[Playwright visit page]
        │
        ▼
[DOM Extractor] ── đọc data-figma attributes ──→ Component instances
        │         ── đọc getComputedStyle()    ──→ Layout frames
        │         ── đọc textContent + font    ──→ Text nodes
        │         ── đọc getBoundingClientRect ──→ Sizes
        ▼
[Screen JSON Generator] ── map semantic tokens
        │                ── map text styles
        │                ── resolve component variants
        ▼
[screen-{name}.json] ── compatible với existing plugin
        │
        ▼
[Figma Plugin] ── render Figma frames + instances
```

---

## Phase 1: Thêm `data-figma` vào UI Components

### 1.1 Nguyên tắc

- Thêm `data-figma` attribute vào **root element** của mỗi component
- `data-figma` = tên component trên Figma (phải match ComponentSet name)
- `data-figma-variants` = JSON string chứa variant mapping
- Chỉ thêm trong **development mode** (`import.meta.env.DEV`) để không ảnh hưởng production build
- KHÔNG thay đổi logic/style hiện tại, chỉ thêm data attributes

### 1.2 Pattern chung

```tsx
// Trước
<button className={cn(buttonVariants({ variant, size }), className)} {...props}>

// Sau
<button
  {...(import.meta.env.DEV && {
    "data-figma": "Button",
    "data-figma-variants": JSON.stringify({
      Variant: variantMap[variant ?? "default"],
      Size: sizeMap[size ?? "default"],
      State: props.disabled ? "Disabled" : "Default",
      Icon: iconValue,
    }),
  })}
  className={cn(buttonVariants({ variant, size }), className)}
  {...props}
>
```

### 1.3 Component mapping table (48 components → 42 Figma specs)

| # | React Component | Figma Name | React Props → Figma Variants | Priority |
|---|-----------------|------------|------------------------------|----------|
| 1 | `Button` | `Button` | variant→Variant, size→Size, disabled→State, iconLeft/Right→Icon | P0 |
| 2 | `Input` | `Input` | disabled/aria-invalid→State, placeholder vs value→Value, iconLeft→Left, iconRight→Right | P0 |
| 3 | `Badge` | `Badge` | variant→Variant, level→Level, size→Size | P0 |
| 4 | `Card` | `Card` | size→Size | P0 |
| 5 | `Select` (Trigger) | `Select` | disabled→State, placeholder→Value | P0 |
| 6 | `Checkbox` | `Checkbox` | checked→Checked, disabled→State | P0 |
| 7 | `Switch` | `Switch` | checked→Checked, disabled→State | P0 |
| 8 | `Label` | `Label` | required→Required, disabled→State | P0 |
| 9 | `Separator` | `Separator` | orientation→Orientation | P1 |
| 10 | `Avatar` | `Avatar` | src→Type(Image/Fallback) | P1 |
| 11 | `Tabs` | `Tabs` | — (Group+Item) | P1 |
| 12 | `Table` | `Table` | — (Group+Item) | P1 |
| 13 | `Dialog` | `Dialog` | — | P1 |
| 14 | `Sheet` | `Sheet` | side→Side | P1 |
| 15 | `Drawer` | `Drawer` | — | P1 |
| 16 | `Dropdown` | `Dropdown` | — | P1 |
| 17 | `Textarea` | `Textarea` | disabled→State, placeholder→Value | P0 |
| 18 | `Progress` | `Progress` | value→trực tiếp | P1 |
| 19 | `Slider` | `Slider` | — | P2 |
| 20 | `Tooltip` | `Tooltip` | — | P2 |
| 21 | `Accordion` | `Accordion` | — | P1 |
| 22 | `Alert` | `Alert` | variant→Variant | P1 |
| 23 | `AlertDialog` | `Alert Dialog` | — | P2 |
| 24 | `Breadcrumb` | `Breadcrumb` | — | P1 |
| 25 | `Calendar` | `Calendar` | — | P2 |
| 26 | `Collapsible` | `Collapsible` | — | P2 |
| 27 | `Combobox` | `Combobox` | — | P2 |
| 28 | `Command` | `Command` | — | P2 |
| 29 | `ContextMenu` | `Context Menu` | — | P2 |
| 30 | `DatePicker` | `Date Picker` | — | P2 |
| 31 | `HoverCard` | `Hover Card` | — | P2 |
| 32 | `InputOTP` | `Input OTP` | — | P2 |
| 33 | `NavigationMenu` | `Navigation Menu` | — | P1 |
| 34 | `Pagination` | `Pagination` | — | P1 |
| 35 | `Popover` | `Popover` | — | P2 |
| 36 | `RadioGroup` | `Radio` | — | P1 |
| 37 | `ScrollArea` | `Scroll Area` | — | P2 |
| 38 | `SearchBox` | `Search Box` | value→Value, disabled→State | P0 |
| 39 | `Skeleton` | `Skeleton` | — | P1 |
| 40 | `Spinner` | `Spinner` | — | P2 |
| 41 | `Toggle` | `Toggle` | pressed→Active, variant→Variant | P1 |
| 42 | `ToggleGroup` | — (no Figma spec) | skip | — |

**P0** = Core form/data components (dùng nhiều nhất trên screens) — 8 components
**P1** = Layout/navigation components — 14 components
**P2** = Overlay/complex components — 16 components (low priority, ít xuất hiện trực tiếp trên screen)
**Skip** = Components không có Figma spec riêng (form, menubar, resizable, sidebar, sonner, aspect-ratio, toggle-group)

### 1.4 Variant value mapping

React dùng lowercase (`variant="outline"`), Figma dùng Title Case (`Variant: "Outline"`).

```ts
// Shared mapping util — figma-markers.ts
export const FIGMA_VARIANT_MAPS = {
  Button: {
    variant: { default: "Default", secondary: "Secondary", outline: "Outline", ghost: "Ghost", "ghost-muted": "Ghost Muted", destructive: "Destructive", "destructive-secondary": "Destructive Secondary" },
    size: { lg: "Large", default: "Default", sm: "Small", xs: "Mini", icon: "Icon Only", "icon-sm": "Icon Only", "icon-lg": "Icon Only" },
  },
  Badge: {
    variant: { default: "Default", secondary: "Secondary", outline: "Outline", ghost: "Ghost", destructive: "Destructive", emphasis: "Emphasis", success: "Success", warning: "Warning" },
    level: { primary: "Primary", secondary: "Secondary" },
    size: { sm: "SM", default: "Default", lg: "LG" },
  },
  Input: {
    state: { default: "Default", hover: "Hover", focus: "Focus", error: "Error", disabled: "Disabled" },
    value: { placeholder: "Placeholder", filled: "Filled", empty: "Empty" },
  },
  // ... etc cho mỗi component
} as const
```

---

## Phase 2: Playwright Extractor Script

### 2.1 Setup

```bash
# Trong thư mục tools/ (tách riêng khỏi saas-app)
pnpm add -D playwright @playwright/test
```

Đặt script tại: `tools/figma-extractor/`

```
tools/figma-extractor/
├── extract.ts          # Main entry — visit pages, orchestrate
├── dom-walker.ts       # Walk DOM tree, identify components + layout
├── style-mapper.ts     # Map computed CSS → Figma properties
├── json-builder.ts     # Build screen JSON from extracted data
├── config.ts           # Page routes, breakpoints, text style map
└── output/             # Generated screen JSONs
```

### 2.2 Extraction logic

```ts
// Pseudo-code cho dom-walker.ts

interface ExtractedNode {
  type: "instance" | "frame" | "text" | "icon"
  // Instance (DS component)
  component?: string          // "Button", "Input", etc.
  variants?: Record<string, string>
  textOverrides?: Record<string, string>
  fillWidth?: boolean
  // Frame (layout container)
  layout?: "horizontal" | "vertical"
  gap?: string               // semantic token
  paddingX?: string
  paddingY?: string
  primaryAlign?: string
  counterAlign?: string
  width?: number
  height?: number
  fill?: string              // semantic color token
  stroke?: string
  radius?: string
  // Text
  textContent?: string
  textStyle?: string         // "SP/H2", "SP/Body", etc.
  textFill?: string          // semantic color token
  // Children
  children?: ExtractedNode[]
}

function walkDOM(element: Element): ExtractedNode | null {
  // 1. Check data-figma attribute → component instance
  const figmaComponent = element.getAttribute("data-figma")
  if (figmaComponent) {
    return {
      type: "instance",
      component: figmaComponent,
      variants: JSON.parse(element.getAttribute("data-figma-variants") || "{}"),
      textOverrides: extractTextOverrides(element),
      fillWidth: isFullWidth(element),
    }
  }

  // 2. Check if text-only element → text node
  if (isTextOnly(element)) {
    return {
      type: "text",
      textContent: element.textContent,
      textStyle: mapTextStyle(getComputedStyle(element)),
      textFill: mapColorToken(getComputedStyle(element).color),
    }
  }

  // 3. Otherwise → layout frame
  const style = getComputedStyle(element)
  const children = Array.from(element.children)
    .map(walkDOM)
    .filter(Boolean)

  if (children.length === 0) return null

  return {
    type: "frame",
    layout: mapFlexDirection(style),
    gap: mapGapToken(style.gap),
    paddingX: mapSpacingToken(style.paddingLeft),
    paddingY: mapSpacingToken(style.paddingTop),
    primaryAlign: mapJustifyContent(style.justifyContent),
    counterAlign: mapAlignItems(style.alignItems),
    width: element.getBoundingClientRect().width,
    height: element.getBoundingClientRect().height,
    fill: mapBackgroundToken(style.backgroundColor),
    radius: mapRadiusToken(style.borderRadius),
    children,
  }
}
```

### 2.3 Style → Token mapping

```ts
// style-mapper.ts

// Spacing: computed px → semantic token
const SPACING_MAP: Record<number, string> = {
  0: "none", 2: "4xs", 4: "3xs", 6: "2xs", 8: "xs",
  12: "sm", 16: "md", 20: "lg", 24: "xl", 32: "2xl",
  40: "3xl", 48: "4xl", 56: "5xl", 64: "6xl",
}

// Border radius: computed px → token
const RADIUS_MAP: Record<number, string> = {
  0: "none", 2: "sm", 4: "DEFAULT", 6: "md", 8: "lg",
  12: "xl", 16: "2xl", 24: "3xl", 9999: "full",
}

// Text style: computed font → Figma text style name
const TEXT_STYLE_MAP = [
  { family: /Plus Jakarta/i, weight: 700, size: 30, style: "SP/H1" },
  { family: /Plus Jakarta/i, weight: 700, size: 24, style: "SP/H2" },
  { family: /Plus Jakarta/i, weight: 700, size: 20, style: "SP/H3" },
  { family: /Plus Jakarta/i, weight: 600, size: 16, style: "SP/H4" },
  { family: /Inter/i, weight: 400, size: 14, style: "SP/Body" },
  { family: /Inter/i, weight: 500, size: 14, style: "SP/Body Medium" },
  { family: /Inter/i, weight: 600, size: 14, style: "SP/Body Semibold" },
  { family: /Inter/i, weight: 400, size: 12, style: "SP/Caption" },
  { family: /Inter/i, weight: 500, size: 12, style: "SP/Label" },
  // ... full 20 text styles
]

// Color: computed rgba → semantic token
// Strategy: extract from CSS custom properties thay vì matching hex
// document.documentElement → getComputedStyle → lấy --color-* variables
// So sánh computed color với resolved variable values
const COLOR_TOKEN_MAP = buildColorMap() // runtime build từ CSS vars
```

### 2.4 Xử lý đặc biệt

**Layout containers không có data-figma**: Dùng heuristic:
- `display: flex` → frame có layout
- `display: grid` → frame, convert grid-cols → horizontal frames
- Container có `max-width` → detect width constraint
- `overflow: hidden` → `clipsContent: true`

**Icons** (Lucide SVG):
- Detect `<svg>` bên trong non-component elements
- Extract icon size từ `width`/`height` attributes
- Tên icon: đọc từ `class` hoặc parent context (không reliable → fallback "placeholder")

**Images**:
- `<img>` → extract src, width, height
- Background images → extract từ computed style

**Semantic colors** (quan trọng nhất):
- Thay vì match hex → token, đọc trực tiếp CSS custom property usage
- Khi React dùng `bg-card` → browser resolves thành computed color
- Script cũng resolve `--color-card` → so sánh → match token name
- Edge case: `bg-primary/10` (opacity) → detect opacity layer

---

## Phase 3: Page Configuration

### 3.1 Route map

```ts
// config.ts
export const PAGES = [
  // Dashboard layout
  { route: "/dashboard", name: "dashboard-overview", layout: "dashboard" },
  { route: "/dashboard/analytics", name: "dashboard-analytics", layout: "dashboard" },
  { route: "/dashboard/reports", name: "dashboard-reports", layout: "dashboard" },
  // Management
  { route: "/management/users", name: "management-users", layout: "dashboard" },
  { route: "/management/products", name: "management-products", layout: "dashboard" },
  { route: "/management/orders", name: "management-orders", layout: "dashboard" },
  { route: "/management/invoices", name: "management-invoices", layout: "dashboard" },
  // Settings
  { route: "/settings/general", name: "settings-general", layout: "dashboard" },
  { route: "/settings/notifications", name: "settings-notifications", layout: "dashboard" },
  { route: "/settings/billing", name: "settings-billing", layout: "dashboard" },
  { route: "/settings/help", name: "settings-help", layout: "dashboard" },
  // Auth layout
  { route: "/auth/sign-in", name: "auth-sign-in", layout: "auth" },
  { route: "/auth/sign-up", name: "auth-sign-up", layout: "auth" },
  { route: "/auth/forgot-password", name: "auth-forgot-password", layout: "auth" },
  { route: "/auth/onboarding", name: "auth-onboarding", layout: "auth" },
  // Utility
  { route: "/utility/empty-state", name: "utility-empty-state", layout: "dashboard" },
  { route: "/not-found-page", name: "utility-not-found", layout: "none" },
]

export const BREAKPOINTS = [
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Mobile", width: 375, height: 812 },
]
```

### 3.2 Extraction modes

**Mode 1: Full page** — extract toàn bộ page including layout (header + content)
**Mode 2: Content only** — chỉ extract content area (bỏ header/sidebar), dùng khi layout đã có component riêng

---

## Phase 4: Output Format

### 4.1 Screen JSON structure (compatible với plugin)

```json
{
  "type": "screen",
  "name": "Dashboard — Overview",
  "category": "dashboard",
  "width": 1440,
  "height": 900,
  "fill": "background",
  "clipsContent": true,
  "children": [
    {
      "type": "instance",
      "component": "App Header",
      "variants": { "Page": "Dashboard", "Breakpoint": "Desktop" },
      "fillWidth": true
    },
    {
      "type": "frame",
      "name": "Content",
      "layout": "vertical",
      "fillWidth": true,
      "paddingX": "2xl",
      "paddingY": "2xl",
      "gap": "xl",
      "children": [...]
    }
  ]
}
```

### 4.2 Output location

```
products/001-analytics-dashboard/figma-specs/screens/
├── dashboard/
│   ├── overview.json
│   ├── analytics.json
│   └── reports.json
├── management/
│   ├── users.json
│   ├── products.json
│   ├── orders.json
│   └── invoices.json
├── settings/
│   ├── general.json
│   ├── notifications.json
│   ├── billing.json
│   └── help.json
├── auth/
│   ├── sign-in.json
│   ├── sign-up.json
│   ├── forgot-password.json
│   └── onboarding.json
└── utility/
    ├── empty-state.json
    └── not-found.json
```

---

## Phase 5: Chạy & Cải thiện

### 5.1 Quy trình chạy

```bash
# 1. Start web app
cd products/001-analytics-dashboard/001-saas-templates
pnpm dev

# 2. Run extractor (từ thư mục tools)
cd tools/figma-extractor
pnpm extract                     # Extract tất cả pages
pnpm extract --page overview     # Extract 1 page cụ thể
pnpm extract --breakpoint mobile # Extract 1 breakpoint

# 3. Output tự động vào figma-specs/screens/
# 4. Copy JSON vào Figma plugin → Generate
```

### 5.2 Iteration loop

```
Extract → So sánh visual (web vs Figma) → Identify gaps → Fix mapper/walker → Re-extract
```

**Expected iterations:**
- v0.1: Basic extraction — layout + text + component instances (P0 components)
- v0.2: Fix spacing/alignment issues, improve color token matching
- v0.3: Handle P1 components, grid layouts, responsive breakpoints
- v1.0: Production-ready cho 17 screens × 3 breakpoints

---

## Hạn chế đã biết

| Hạn chế | Status | Workaround |
|---------|--------|------------|
| Auth panel `bg-[#0c0a1a]` hardcoded hex | Open | Hard-map hex → "background" trong extractor |
| Gradient orbs / blur effects | **Fixed v0.2** | `isDecorative()` filter |
| Animated elements (AuthIllustration SVG) | Open | Skip — placeholder frame, replace manual |
| Grid layout detection | **Fixed v0.2** | `getGridCols()` + annotated names, column-span chưa support |
| Overlay components (open state) | Open | Cần trigger state trước khi extract (Playwright click) |
| Portal components (Sonner, Dialog) | **Fixed v0.3** | Portal traversal after main walkDOM |
| ComponentSet missing in Figma | **Fixed v0.3** | `createManualInstance()` draws UI manually |
| Screenshot/rasterized images | **Removed v0.3** | Zero screenshots — all vector/frame/text |
| Icon name resolution | **Mostly fixed v0.2** | Lucide class/data-lucide/aria-label, 80% accuracy |
| `fillHeight` detection limited | Open | Plugin doesn't fully support anyway |
| Nav text concatenation | **Fixed v0.2** | `isTextOnly()` only leaf elements |
| Huge border-radius values | **Fixed v0.2** | Cap at 9999 |

---

## Timeline

| Phase | Task | Effort |
|-------|------|--------|
| **Phase 1** | Thêm `data-figma` vào P0 components (8 files) | 30 phút |
| **Phase 2** | Viết extractor script (dom-walker + style-mapper + json-builder) | 2-3 giờ |
| **Phase 3** | Test trên 1 page (Dashboard Overview) | 30 phút |
| **Phase 4** | Fix issues, iterate | 1-2 giờ |
| **Phase 5** | Extract tất cả 17 pages × 3 breakpoints | 5 phút (automated) |
| **Total** | | **~5-6 giờ one-time, 5 phút/lần sau** |

---

## Log cải thiện

| Ngày | Phiên bản | Thay đổi | Kết quả |
|------|-----------|----------|---------|
| 2026-03-11 | v0.1 | Initial extraction — basic DOM walker, style mapper, JSON builder | 68 nodes, nhiều noise (gradient orbs, concatenated nav text, huge radius) |
| 2026-03-11 | v0.2 | 6 fixes: (1) `isDecorative()` filter aria-hidden+pointer-events-none & blur>50px, (2) `isTextOnly()` chỉ match leaf elements (childElementCount===0), (3) Grid detection `getGridCols()` + annotated `Grid (N-col)`, (4) Lucide icon name extraction từ SVG class/data-lucide/aria-label, (5) Radius cap 9999, (6) Removed class-name-based `isHidden()` | 85 nodes, 15 instances, 10 icons (8 named), 0 gradient orb noise, grid detected |
| 2026-03-12 | v0.3 | 6 fixes: (1) Portal traversal cho Sonner toast ngoài #root, (2) toast.custom() type detection via data-toast-type, (3) Plugin field name compatibility (component/instance), (4) createManualInstance() fallback khi ComponentSet thiếu, (5) State actions waitFor toast, (6) Remove ALL screenshot functions | Sonner detected as instance, manual UI fallback, zero rasterized images |

### v0.2 Chi tiết fixes

**1. Gradient orb / decorative filter**
- Problem: `aria-hidden="true"` blur overlays (700×700 frames) xuất hiện trong output
- Fix: `isDecorative(el)` check `aria-hidden + pointer-events:none` combo, và `filter: blur()` > 50px
- Result: Zero gradient orb noise

**2. Nav text concatenation**
- Problem: `isTextOnly()` v0.1 dùng `el.children.length === 0 || all children are inline` → NAV with A children treated as single text → "DashboardAnalyticsReportsUsers..."
- Fix: Simplified to `childElementCount === 0 && textContent.trim()` — only true leaf elements
- Result: Each nav link extracted separately

**3. Grid layout detection**
- Problem: CSS Grid containers not differentiated from flex
- Fix: `getGridCols(style)` parses `gridTemplateColumns` → count tracks, annotate frame name as `Grid (N-col)`
- Result: 12-column grids properly annotated

**4. Icon name extraction**
- Problem: All SVGs were skipped (in SKIP_TAGS) or returned generic names
- Fix: Removed SVG from SKIP_TAGS, `getIconName(svg)` extracts from: Lucide class `lucide-{name}`, `data-lucide` attr, `aria-label`, fallback "Icon"
- Result: 8/10 icons correctly named (Calendar, ChartColumn, ChevronDown, ArrowUpRight, Globe, Store, Warehouse, Sparkles)

**5. Huge radius values**
- Problem: `rounded-full` on large elements → `borderTopLeftRadius` = 33554400px
- Fix: `extractBorderRadius()` caps at 9999
- Result: Max radius = 9999 (maps to "full" token)

**6. Hidden element false positives**
- Problem: `isHidden()` checked `className.includes("hidden")` → matched Tailwind `dark:block hidden` on elements visible in dark mode
- Fix: Removed all class-name checks, only use computed style: `display==="none"`, `visibility==="hidden"`, `opacity==="0"`, sr-only clip pattern
- Result: Main content area no longer skipped

### v0.2 Known remaining issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| 2/10 icons fallback to "Icon" (no Lucide class) | Low | Manual rename in JSON |
| Grid children don't replicate grid column spans | Medium | Manual adjustment — need column-span detection |
| Single-child flattening may lose some wrapper semantics | Low | Check data-slot preservation |
| `fillHeight` detection limited | Low | Plugin doesn't fully support anyway |

### v0.3 Portal traversal & Manual fallback

**1. Portal component detection (Sonner)**
- Problem: Sonner `<ol data-sonner-toaster>` renders via React portal OUTSIDE `#root` → walker starting from `#root` never sees it
- Fix: After `walkDOM(root)`, traverse portal roots: `document.querySelector("[data-sonner-toaster]")` → walk each `[data-sonner-toast]` → push to `result.children`
- Applied to: Both `raw-dom-walker.ts` AND `dom-walker.ts`

**2. toast.custom() type detection**
- Problem: `toast.custom()` sets `data-type="custom"` on wrapper `<li>`, not the real type
- Fix: When `data-type === "custom"`, check inner `[data-toast-type]` attribute. React: add `data-toast-type={type}` to root div inside `toast.custom()` callback
- Result: Correct Sonner variant detection (Error/Success/Warning/Info/Default)

**3. Plugin field name compatibility**
- Problem: json-builder outputs `type: "component"` + `componentSet` + `overrides.text`, plugin expected `type: "instance"` + `component` + `textOverrides`
- Fix: Plugin switch has both `case "component":` and `case "instance":`. `createInstance()` accepts both field formats.

**4. Manual UI fallback (createManualInstance)**
- Problem: When ComponentSet not found in Figma (e.g. "Sonner" not yet created), plugin showed empty placeholder
- Fix: `createManualInstance()` draws full UI manually using Figma API:
  - **Sonner**: frame with foreground fill, border 10% opacity, shadow, type-specific icon (CircleCheck/CircleAlert/TriangleAlert/Info), title text, optional description + action button — all using Figma variables
  - **Generic**: card frame with component name + variant values as text label
- No screenshots/rasterized images — everything is vector/frame/text

**5. State actions for toast visibility**
- Problem: Toast dismissed before walker runs → not captured
- Fix: Added `waitFor: "[data-sonner-toast]"` + `wait: 500ms` to validation-error states in `states.ts`

**6. Screenshot removal**
- Removed ALL screenshot functions from pipeline: `screenshotImages()`, `collectImageNodes()`, `screenshotBackgrounds()`, `collectBgNodes()`
- Policy: NO rasterized images in Figma output — everything must be component instances, manual frames, or SVG vectors

### v0.4 Absolute positioning & Decorative backgrounds

**1. Decorative background screenshots (`captureDecorativeBackgrounds()`)**
- Problem: Auth layout has complex decorative backgrounds (gradient orbs, glow effects) that can't be replicated with Figma primitives
- Fix: `hasDecorativeBackground(el)` detects ≥2 absolute children with blur/bg-image → sets `backgroundSelector` → server captures screenshot with Playwright `el.screenshot()`
- Content isolation: Before screenshot, hide flow children (`visibility: hidden`) + portal overlays (Sonner, dialogs `display: none`), keep only absolute/fixed decorative elements
- Result: `backgroundImage` = base64 PNG of just decorative effects (gradient orbs, glow, grid pattern)

**2. Sonner toast absolute positioning**
- Problem: Sonner toast is a portal overlay that should float on top of UI at exact web position
- Fix: Walker returns `position: "absolute"` + `rightMargin`/`bottomMargin` + `constraints` (NOT viewport x/y — see common-mistake #102)
- Plugin: calculates x/y from parent frame dimensions: `x = parent.width - nodeWidth - rightMargin` (MAX), `x = (parent.width - nodeWidth) / 2` (CENTER)
- Breakpoint logic: Desktop/Tablet (>480px) = MAX/MAX (right-bottom), Mobile (≤480px) = CENTER/MAX (center-bottom, width = viewport - 32px)

**3. `insertChild()` reorder fix (common-mistake #101)**
- Problem: `reconcileChildren()` sets absolute positioning, then `insertChild()` reorder resets `layoutPositioning` back to AUTO
- Fix: Post-reorder loop re-applies absolute positioning (resize + x/y + constraints) for all `position: "absolute"` specs

**4. Instance `resize()` for absolute nodes**
- Problem: Component instances keep default size after creation; `applySizing()` doesn't call `resize()`
- Fix: Explicit `node.resize(spec.width, spec.height)` before setting x/y coordinates for absolute-positioned instances

### v0.5 Mixed-color text, partial variant matching, icon conflicts

**1. Mixed-color inline text (links in labels)**
- Problem: `<Label>I agree to the <span class="text-primary">Terms of Service</span></Label>` — Label has `data-figma` → extracted as instance → text flattened, link color lost
- Fix: When Label element has `hasColoredInlineChildren()` (child spans with different color) → skip instance extraction → fall through to mixed-inline logic → creates frame with per-run text nodes preserving colorToken
- Frame gets `wrap: true` + `fillWidth: true` for mobile text wrapping
- Checkbox/Radio adjacent to mixed-color label → `textOverrides.Label = " "` (hide default label text)

**2. Partial variant matching in HTML-to-Figma plugin**
- Problem: `getVariantKey()` creates exact key like `"Value=75"` but Figma ComponentSet variant names include ALL properties like `"Show Label=No, Value=75"` — no match
- Fix: Plugin fallback iterates ComponentSet children, checking if variant name contains ALL specified `key=value` pairs via `indexOf()`. Falls back to first child if still no match.

**3. Brand icon name conflict (common-mistake #109)**
- Problem: Brand "X" (Twitter logo, fill) same name as Lucide "X" (close icon, stroke) → walker extracts `name="X"` → plugin finds brand icon → shows Twitter logo on close buttons
- Fix: Rename brand to "X Twitter" in foundation-icons.json + brand-icons.tsx + design-system page. Add separate Lucide "X" close icon to foundation.

**4. Button `asChild` + `<Link>` not detected (common-mistake #111)**
- Problem: `<Button asChild><Link>text</Link></Button>` renders `<a>` tag with `data-figma` attribute. But `<a>` is in `INLINE_TAGS` → parent mixed-inline logic treats it as text run, not component.
- Fix: Use `<Button onClick={() => navigate("...")}>` directly (no `asChild`) → renders `<button>` tag → walker detects `data-figma`.

**5. Playwright `force: true` unreliable on Mobile**
- Problem: Decorative blur div intercepts pointer events on Mobile viewport. `force: true` clicks don't trigger form validation reliably.
- Fix: Use `evaluate` action with `document.querySelector().click()` to bypass Playwright event dispatch entirely.

### v0.6 Password input masking & dual-walker sync

**1. Password input value NOT masked (common-mistake #128)**
- Problem: `dom-walker.ts` extracted `inputEl.value` directly without checking `type="password"` → plain text visible in Figma. `raw-dom-walker.ts` had mask code but `extract.ts` uses `DOM_WALKER_SCRIPT` from `dom-walker.ts` (different file).
- Fix: Both walkers now check `inputEl.getAttribute("type") || inputEl.type === "password"` → replace value with `"\u2022".repeat(value.length)`. Use `\u2022` escape (not `•` literal) because walker code is inside template literal string.
- **Critical rule**: When adding input handling logic → MUST update BOTH walker files (`dom-walker.ts` + `raw-dom-walker.ts`). `extract.ts` uses `DOM_WALKER_SCRIPT`, `html-to-figma.ts` uses `RAW_DOM_WALKER_SCRIPT`.

**2. Password field icon pattern (common-mistake #129)**
- Password input MUST have `iconRight` toggle: default `showPassword=false` → `type="password"` + Eye icon → masked bullets. Toggle → `type="text"` + EyeOff icon → plain text visible.
- DOM extraction: filled state extracts default (password hidden) → icon = Eye, Label = bullets.
- States config can add `show-password` state if needed: toggle click → extract with EyeOff icon + plain text.

**3. Form input textOverrides key mapping (common-mistake #130)**
- Problem: Walker always set `textOverrides["Label"]` for ALL components. But Input/Select/Textarea/Combobox Figma components use text node named **"Value"** (not "Label"). Plugin `findOne(n.name === "Label")` → miss → default "Placeholder text" shown.
- Fix: Walker detects form input components → uses `textOverrides["Value"]` instead. Plugin has fallback: if "Label" not found → try "Value", and vice versa.
- Rule: textOverrides key MUST match Figma text node name. Check component JSON spec `children[].name` when adding new components to pipeline.

**4. SVG icon extraction in data-figma components (common-mistake #131)**
- Problem: dom-walker.ts skipped SVGs with `continue` inside leaf component extraction → Button Icon variant always "None", icons missing on Figma. raw-dom-walker.ts already handled this correctly.
- Fix: Both walkers now extract SVG icon data via `getIconName()` instead of skipping. Override `variants.Icon = "Left"` when Button has SVGs + `Icon === "None"`. Also scan nested elements (`querySelectorAll("svg")`) for `asChild` patterns (Button > a > svg). Added parent wrapper SVG scan for native `<input>` elements.
- Rule: NEVER skip SVGs inside data-figma components. Both walker files MUST extract icon presence and override Button Icon variant.

**5. Mixed content extraction — text nodes + non-inline elements (common-mistake #132)**
- Problem: `<p>Text <button>click</button></p>` — walker used `el.children` (HTMLCollection) which only returns element nodes. Text nodes (nodeType 3) invisible. `BUTTON` not in `INLINE_TAGS` → `isMixedInline()` false → falls to layout frame path → text lost.
- Fix: Added section 5c (raw-dom-walker) / 4b (dom-walker): detect `el.childNodes` has both text nodes AND non-inline element children → iterate `childNodes` → text nodes become text frames, elements recurse. Output: horizontal frame `wrap: true, gap: 4`.
- Rule: ALWAYS use `el.childNodes` when capturing mixed text + element children. `el.children` only returns elements.

**6. Small square frames lose fixed height (common-mistake #133)**
- Problem: json-builder rule "frames with children never get fixed height" → icon container `size-[48px]` with icon child only gets `width: fixed:48`, no height → parent stretches it into a bar. Also `selfAlign: "center"` from `mx-auto` not propagated.
- Fix: json-builder detects small square frames (w ≈ h, ≤100px, has children) → keeps fixed height. selfAlign propagated in both convertFrame and convertInstance.
- Rule: Small square frames (icon containers, avatar wrappers) MUST keep fixed height despite having children.

**7. Horizontal flex fillWidth not detected (common-mistake #134)**
- Problem: `getFlexGrow()` only checked column flex parents. Row flex children with `w-full` → `getComputedStyle().width` returns pixels (never "100%") → missed. Buttons in horizontal flex containers rendered FIXED width instead of FILL.
- Fix: Added `if (!isCol && fills) return true` — detect row flex children whose computed width ≈ parent content width. Both walkers synced.
- Rule: `getFlexGrow()` MUST detect fillWidth for BOTH column AND row flex parents.

**8. Visual frame margin distorts shape (common-mistake #135)**
- Problem: Walker converts CSS `marginBottom` to `paddingBottom` on child frame + increases height. For visual frames (rounded, filled, ≤100px) — e.g. 48×48 icon circle with `mb-sm` → becomes 48×60 oval on Figma.
- Fix: Detect visual frames (radius > 0, fill, ≤100px) → wrap in transparent frame with margin as wrapper padding. Child frame keeps original dimensions. Inherit selfAlign/fillWidth from child to wrapper.
- Rule: NEVER add margin as internal padding to visual frames. Always wrap.

**9. Mixed inline text-align center lost (common-mistake #136)**
- Problem: Mixed inline content (colored spans, links) creates horizontal frame for text runs. Parent `text-align: center` only mapped to `textAlign` on text nodes — frame doesn't get `primaryAlign: center`.
- Fix: Check `style.textAlign === "center"` → set `primaryAlign: "center"` on mixed inline/content frames. Both code paths (hasColoredInlineChildren, mixed content handler) and both walkers synced.
- Rule: When creating frames from mixed inline content, ALWAYS propagate parent `text-align` as frame `primaryAlign`.

**10. HUG false positive for explicit-size elements (common-mistake #137)**
- Problem: `getHugWidth`/`getHugHeight` returns true for elements with explicit CSS dimensions (e.g. `size-[48px]`) when in a flex parent with `align-items: center`. Plugin sets `layoutSizing = "HUG"` → frame collapses to content size (48×48 → 24×24), background circle disappears.
- Fix: Added `hasExplicitWidth(el)`/`hasExplicitHeight(el)` helpers that compare element dimension with total children dimension. If element > content + 2px → explicit CSS sizing → returns FIXED, not HUG.
- Rule: Before returning HUG from flex context checks, ALWAYS verify content is not smaller than element. Elements with explicit dimensions (icon containers, avatar wrappers) must be FIXED.

**11. Plugin `primaryAxisSizingMode` hardcode AUTO (common-mistake #138)**
- Problem: Plugin `createFrame()` hardcodes `primaryAxisSizingMode = "AUTO"` (hug content) for ALL frames. Frame 48×48 horizontal with 24×24 icon → width collapses to 24px. `primaryAxisSizingMode` = frame's OWN sizing (different from `layoutSizingHorizontal` = sizing in PARENT).
- Fix: Set `primaryAxisSizingMode`/`counterAxisSizingMode` dynamically based on `hugWidth`/`hugHeight`/`fillWidth`/`fillHeight` flags. Map by layout direction: horizontal → primary=width, counter=height; vertical → reverse. HUG/FILL → AUTO, FIXED (default) → FIXED.
- Rule: `primaryAxisSizingMode` must match frame's sizing intent. NEVER hardcode AUTO for all frames.

**12. Visual frame margin wrapper sizing (common-mistake #135 update)**
- Problem: Original wrapper used fixed width/height matching child dimensions. This creates rigid frames that don't adapt to parent layout. Icon container 48×60 fixed inside CardHeader → doesn't fill width → alignment issues.
- Fix: Wrapper now uses `fillWidth: true` (fill parent width) + `hugHeight: true` (hug content) + `counterAlign: "center"` (center child). Child's `selfAlign` removed since wrapper handles centering. This matches web behavior where icon container is a block element in normal flow.
- Rule: Margin wrappers should be transparent layout helpers — fill parent width, hug content height, center child via counterAlign.

**13. `isTextOnly()` skips visual properties — text-only elements lose bg/stroke/radius (common-mistake #140)**
- Problem: Walker `isTextOnly()` returns TEXT node immediately when `childElementCount === 0`. Step indicator circles (28×28 bg-primary rounded-full + text "1") extracted as plain text, losing all visual properties. Affects ALL text-only elements with visual decoration.
- Fix: Before returning text node, check for `normalizeColor(bg)`, `getStrokeInfo()`, `extractBorderRadius()`. If any visual property exists → return frame with fill/stroke/radius + text child. Set primaryAlign/counterAlign based on flex+center.
- Rule: `isTextOnly()` early return only for pure text leaves. Visual elements MUST be wrapped in frames.

**14. Component instance built-in label collision (common-mistake #141)**
- Problem: Figma components with `Show Label` property default to showing label. Web renders label as separate sibling element. Extraction creates instance without `Show Label: No` → both built-in label AND sibling text appear. E.g., Radio "Option label" + "1-10".
- Fix: Add visibility variant to `figma()` data attributes: `"Show Label": "No"`. Review ALL components with label/visibility properties (Radio, Checkbox, Switch).
- Rule: When Figma component has built-in text that web renders separately, set hide variant in `figma()` call.

**15. Margin handling skips non-frame types (common-mistake #142)**
- Problem: Margin-to-padding conversion only processes `type === "frame"` children. Instance (Progress, Button), text, icon, svg nodes with CSS margins (`mb-md`, `mr-sm`) are completely ignored. Result: Figma only has parent gap between items, missing the extra margin spacing.
- Fix: Handle ALL node types. Frame: add padding directly (or wrap if visual frame). Instance/text/icon/svg: wrap in transparent frame with margin as padding. Wrapper inherits fillWidth from child, uses hugHeight/hugWidth.
- Rule: Margin conversion must not filter by node type. Every child with CSS margin must be handled.

**16. Radix `data-state` not reflected in figma variants (common-mistake #143)**
- Problem: `figma()` sets Value variant statically at render time. Radix updates `data-state` attribute dynamically on DOM. Walker only reads `data-figma-variants` (static) → all Radio/Checkbox/Switch extracted as Unchecked regardless of actual state.
- Fix: After parsing `data-figma-variants`, check `el.getAttribute("data-state")`. If present and variants has `Value` key → override: checked→Checked, unchecked→Unchecked, indeterminate→Indeterminate.
- Rule: Always read DOM `data-state` to override static figma variants for Radix primitives.

**17b. Form input Value variant not detected from DOM state (common-mistake #161)**
- Problem: `figma("Select", { Value: "Placeholder" })` is static. Playwright actions select option → text changes but `data-figma-variants` stays `Placeholder`. Walker trusts static attribute → extracts wrong variant. Affects: Select, Combobox, Input, Textarea.
- Fix: After parsing variants, detect actual DOM state: (1) Select/Combobox: scan child `<span>` for `data-placeholder` attribute — absent + has text → `Value = "Filled"`. (2) Input/Textarea: check `inputEl.value` — has value → `Value = "Filled"`.
- Rule: **figma() static annotation divergence pattern** — 3 cases: checked state (data-state for Checkbox/Switch/Radio #143), filled state (DOM content for form inputs #161), open state (future). Walker must always verify runtime DOM state, not trust static attributes.

**18. Frames default FIXED height instead of HUG (common-mistake #152)**
- Problem: `getHugHeight()` only checks specific flex parent cases. Row-flex with `align-items: stretch` (default) + auto-height parent → both `getFillHeight` and `getHugHeight` return false → plugin defaults `layoutSizingVertical = "FIXED"`. Many content-driven divs get FIXED height.
- Fix: Added `isContentSizedHeight(el)` fallback — if element has visible flow children AND height ≈ content height → `hugHeight = true`. Applied as: `hugHeight: getHugHeight(el) || (!getFillHeight(el) && isContentSizedHeight(el))`. Also fixed `getFillHeight` for row-flex stretch: compares sibling heights instead of requiring parent explicit height.
- Rule: Content-driven frames must be HUG in Figma. Only FIXED when explicit CSS height (h-9, size-[48px]). `isContentSizedHeight` is a safety net for edge cases.
