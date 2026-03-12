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
