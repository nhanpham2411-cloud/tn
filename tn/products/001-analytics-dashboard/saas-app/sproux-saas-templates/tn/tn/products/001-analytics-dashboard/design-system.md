# Design System: ShopPulse — E-commerce Analytics Dashboard

> Forked from SprouX Design System
> Customized: 2026-02-28
> Art direction: `art-direction.md` (extracted from research.md Section 5)
> Repo: `~/sproux-saas-templates/`

---

## 1. Style Direction

**Style chính**: "Minimal clean base + selective glassmorphism (KPI cards, product cards, sidebar) + bento dashboard grid + gradient area charts. Dark-first."
**Mood**: "Premium commerce intelligence — feels like a $129/mo tool with stunning UI. Data-driven but not sterile."
**Differentiator**: "Violet accent (no UI8 competitor uses violet), glass product cards with images, JetBrains Mono KPI numbers, ambient gradient orbs behind glass."

---

## 2. Color Palette

### Raw Colors (Primitive Palette)

| Color | Shade Range | Hex (representative) | Usage |
|-------|------------|---------------------|-------|
| Violet | 50-950 | #7c3aed (600) | Primary accent, CTAs, chart-1 |
| Zinc | 50-950 | #71717a (500) | Text, backgrounds, borders |
| Green | 50-950 | #16a34a (600) | Success, revenue growth |
| Amber | 50-950 | #d97706 (600) | Warning, pending states |
| Red | 50-950 | #dc2626 (600) | Destructive, errors |
| Blue | 50-950 | #2563eb (600) | Info, emphasis |
| Cyan | 50-950 | #0891b2 (600) | Chart-2, cool contrast |
| Rose | 50-950 | #e11d48 (600) | Chart-3, warm contrast |
| Pink | 50-950 | #db2777 (600) | Chart-6 |

### Semantic Colors (Changed from SprouX)

| Token | Light Mode | Dark Mode | Change from SprouX |
|-------|-----------|-----------|-------------------|
| `--background` | zinc-50 `#fafafa` | zinc-950 `#09090b` | slate → zinc |
| `--foreground` | zinc-950 `#09090b` | zinc-50 `#fafafa` | slate → zinc |
| `--foreground-subtle` | zinc-500 `#71717a` | zinc-500 `#71717a` | slate-700 → zinc-500 |
| `--card` | white | zinc-900 `#18181b` | slate-950 → zinc-900 (dark) |
| `--primary` | violet-600 `#7c3aed` | violet-600 `#7c3aed` | **teal → violet** |
| `--primary-hover` | violet-700 `#6d28d9` | violet-700 `#6d28d9` | **teal → violet** |
| `--primary-subtle` | violet-50 `#f5f3ff` | violet-950 `#2e1065` | **teal → violet** |
| `--brand` | violet-600 | violet-600 | **teal → violet** |
| `--border` | zinc-200 `#e4e4e7` | zinc-800 `#27272a` | slate → zinc |
| `--border-subtle` | zinc-100 | `rgba(255,255,255,0.06)` | slate → zinc + rgba in dark |
| `--destructive` (dark) | red-500 `#ef4444` | — | red-900 → red-500 (brighter) |
| `--destructive-subtle` (dark) | `rgba(239,68,68,0.1)` | — | red-950 → rgba (translucent) |

### Chart Colors (6 series)

| Token | Light Mode | Dark Mode | Purpose |
|-------|-----------|-----------|---------|
| `--chart-1` | violet-600 `#7c3aed` | violet-500 `#8b5cf6` | Primary (revenue) |
| `--chart-2` | cyan-600 `#0891b2` | cyan-500 `#06b6d4` | Cool contrast |
| `--chart-3` | rose-600 `#e11d48` | rose-500 `#f43f5e` | Warm contrast |
| `--chart-4` | green-600 `#16a34a` | green-500 `#22c55e` | Growth/success |
| `--chart-5` | amber-600 `#d97706` | amber-500 `#f59e0b` | Attention |
| `--chart-6` | pink-600 `#db2777` | pink-500 `#ec4899` | **NEW** (6th series) |

### Status Colors

| Status | Light | Dark |
|--------|-------|------|
| Success | green-600 `#16a34a` | green-500 `#22c55e` |
| Warning | amber-600 `#d97706` | amber-500 `#f59e0b` |
| Destructive | red-600 `#dc2626` | red-500 `#ef4444` |
| Info | blue-600 `#2563eb` | blue-500 `#3b82f6` |

---

## 3. Typography

### Fonts

| Role | Font Family | Source | Import |
|------|-----------|--------|--------|
| Headings | Plus Jakarta Sans | Google Fonts | `@import url('...family=Plus+Jakarta+Sans:wght@500;600;700;800...')` |
| Body | Inter | Google Fonts | `@import url('...family=Inter:wght@400;500;600...')` |
| Monospace | JetBrains Mono | Google Fonts | `@import url('...family=JetBrains+Mono:wght@400;500;600...')` |

### Font Tokens Changed

| Token | SprouX Original | New Value | Reason |
|-------|----------------|-----------|--------|
| `--font-heading` | Fraunces (serif) | Plus Jakarta Sans (sans) | Geometric, warm, modern — matches SaaS dashboard aesthetic |
| `--font-body` | Geist (sans) | Inter (sans) | Industry standard for dashboards, maximum readability |
| `--font-mono` | Geist Mono | JetBrains Mono | Better for revenue/KPI display, wider character set |

### Typography Scale (ShopPulse custom `sp-*` tokens)

| Level | Class | Font | Size | Weight | Line Height | Usage |
|-------|-------|------|------|--------|-------------|-------|
| H1 | `sp-h1` | Jakarta | 36px | 800 | 40px | Page titles |
| H2 | `sp-h2` | Jakarta | 24px | 700 | 32px | Section headers |
| H3 | `sp-h3` | Jakarta | 20px | 700 | 28px | Card titles |
| H4 | `sp-h4` | Jakarta | 16px | 600 | 24px | Widget titles |
| H5 | `sp-h5` | Jakarta | 14px | 600 | 20px | Small headers |
| Body LG | `sp-body-lg` | Inter | 16px | 400 | 24px | Large body |
| Body | `sp-body` | Inter | 14px | 400 | 20px | Default |
| Body Med | `sp-body-medium` | Inter | 14px | 500 | 20px | Emphasized |
| Body Bold | `sp-body-semibold` | Inter | 14px | 600 | 20px | Bold labels |
| Label | `sp-label` | Inter | 12px | 500 | 16px | Form labels |
| Label UC | `sp-label-uppercase` | Inter | 11px | 600 | 16px | Category labels |
| Caption | `sp-caption` | Inter | 12px | 400 | 16px | Help text |
| Overline | `sp-overline` | Inter | 10px | 600 | 12px | Badges |
| KPI Hero | `sp-kpi-hero` | JB Mono | 48px | 600 | 48px | Hero metric |
| KPI LG | `sp-kpi-lg` | JB Mono | 32px | 600 | 36px | Large metric |
| KPI MD | `sp-kpi-md` | JB Mono | 24px | 500 | 28px | Medium metric |
| KPI SM | `sp-kpi-sm` | JB Mono | 20px | 500 | 24px | Small metric |
| Data | `sp-data` | JB Mono | 14px | 400 | 20px | Table data |
| Data SM | `sp-data-sm` | JB Mono | 12px | 400 | 16px | Badge numbers |
| Order ID | `sp-order-id` | JB Mono | 13px | 500 | 20px | Order IDs |

> All `sp-kpi-*` and `sp-data-*` tokens include `font-variant-numeric: tabular-nums`.

---

## 4. Spacing & Layout

### Spacing Tokens Changed

No changes — SprouX spacing tokens kept as-is:

| Token | Value |
|-------|-------|
| `--spacing-3xs` | 4px |
| `--spacing-2xs` | 6px |
| `--spacing-xs` | 8px |
| `--spacing-sm` | 12px |
| `--spacing-md` | 16px |
| `--spacing-lg` | 20px |
| `--spacing-xl` | 24px |
| `--spacing-2xl` | 32px |
| `--spacing-3xl` | 40px |

### Border Radius

No changes — SprouX border radius kept as-is. Card default = `rounded-xl` (12px) matches art direction.

---

## 5. Shadows & Glassmorphism

### Shadow Strategy

**Light mode**: SprouX default Tailwind shadows (Figma naming).
**Dark mode**: Custom inset top-edge highlight + darker outer shadow for visibility on dark bg.

### Glassmorphism (NEW — 4 levels)

| Level | Class | Background | Blur | Border | Usage |
|-------|-------|-----------|------|--------|-------|
| 1 | `glass-card` | 3% white | 12px | 6% white | KPI cards, chart containers |
| 2 | `glass-elevated` | 5% white | 16px | 10% white | Modals, popovers |
| 3 | `glass-panel` | 7% white | 24px | 10% white | Sidebar (collapsed) |
| Accent | `glass-accent` | 6% violet | 12px | 12% violet | Featured KPI card |

### Glow Effects (NEW)

| Class | Usage | Colors |
|-------|-------|--------|
| `glow-accent` | Primary CTA hover, selected KPI | Violet 15%/25%/10% |
| `glow-success` | Success actions | Green 15%/20% |
| `glow-destructive` | Destructive confirmations | Red 15%/20% |

### Border-Based Elevation (NEW)

| Class | Border Opacity | Usage |
|-------|---------------|-------|
| `elevation-0` | 4% white | Minimal |
| `elevation-1` | 6% white | Default cards |
| `elevation-2` | 8% white | Raised cards |
| `elevation-3` | 12% white | High emphasis |
| `elevation-rich` | Top 10%, Bottom 20% black | Featured content |

---

## 6. Component Customizations

### Components — NO code changes needed

All SprouX components use semantic tokens (`bg-primary`, `text-foreground`, `border-border`, etc.) so they automatically inherit the new violet/zinc color scheme. No component files were modified.

| Component | Visual Change | How |
|-----------|-------------|-----|
| Card | Violet accent, zinc borders | Via `--card`, `--border` tokens |
| Button | Violet primary, zinc secondary | Via `--primary`, `--secondary` tokens |
| Badge | Violet default, zinc outline | Via `--primary`, `--border` tokens |
| Sidebar | Violet active state, zinc bg | Via `--sidebar-*` tokens |
| Table | Zinc row borders | Via `--border` token |
| Input | Zinc border, violet focus ring | Via `--input`, `--ring-brand` tokens |
| Dialog/Popover | Zinc-900 bg in dark mode | Via `--popover` token |

### Custom Utility Classes Added (in index.css)

| Class | Type | Purpose |
|-------|------|---------|
| `glass-card` | Glassmorphism | Default glass card (12px blur, 3% bg) |
| `glass-elevated` | Glassmorphism | Elevated glass (16px blur, 5% bg) |
| `glass-panel` | Glassmorphism | Sidebar glass (24px blur, 7% bg) |
| `glass-accent` | Glassmorphism | Violet-tinted glass card |
| `glow-accent` | Glow | Violet glow effect |
| `glow-success` | Glow | Green glow effect |
| `glow-destructive` | Glow | Red glow effect |
| `elevation-0..3` | Elevation | Border-based dark mode elevation |
| `elevation-rich` | Elevation | Rich top/bottom edge highlight |
| `sp-h1..h5` | Typography | ShopPulse heading scale |
| `sp-body*` | Typography | ShopPulse body text scale |
| `sp-kpi-*` | Typography | KPI/metric display with tabular-nums |
| `sp-data*` | Typography | Table data + order IDs |
| `sp-label*` | Typography | Labels, captions, overlines |

---

## 7. Verification Results

| Check | Status | Notes |
|-------|--------|-------|
| All components render with new tokens | ✅ | 47 components — all use semantic tokens |
| `pnpm build` pass | ✅ | Zero errors, 2.25s build time |
| No hardcoded teal/slate in components | ✅ | Verified via grep — zero matches |
| Typography tokens render correctly | ✅ | All sp-* and typo-* utilities generated |
| Chart colors 6-series defined | ✅ | Violet/cyan/rose/green/amber/pink |
| Glassmorphism utilities available | ✅ | 4 levels + accent variant |
| Glow + elevation utilities available | ✅ | 3 glow + 5 elevation classes |

---

## 8. Font Installation Guide

### Required Fonts
1. **Plus Jakarta Sans** — [Google Fonts](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
   - Weights needed: Medium (500), SemiBold (600), Bold (700), ExtraBold (800)
2. **Inter** — [Google Fonts](https://fonts.google.com/specimen/Inter)
   - Weights needed: Regular (400), Medium (500), SemiBold (600)
3. **JetBrains Mono** — [Google Fonts](https://fonts.google.com/specimen/JetBrains+Mono)
   - Weights needed: Regular (400), Medium (500), SemiBold (600)

### How to Install
- **Web (React app)**: Already imported via Google Fonts in `index.css` (3 `@import url(...)` statements)
- **Figma**: Download from Google Fonts → Install on system → Restart Figma
- **Local development**: Fonts auto-load from Google CDN — no local install needed
