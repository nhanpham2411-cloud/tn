# Art Direction: ShopPulse — E-commerce Analytics Dashboard

> Ngày: 2026-02-28
> Người thực hiện: Nhan
> Trạng thái: Complete
> Input: research.md Section 5 + product-spec.md

---

> **Nghiên cứu ngày**: 2026-02-28
> **Phương pháp**: Phân tích Triple Whale redesign (blog), Dribbble e-commerce analytics shots (1200+ likes), glassmorphism dark mode best practices, 2026 color trends, typography pairing research.
> **Mục đích**: Implementation-ready art direction — CSS values, hex codes, font sizes, spacing — sẵn sàng cho Phase 4 (Design System Customization).

## 1. Design Style Matrix

| Style | Trend 2026 | Marketplace Appeal | SprouX Fit | Build Effort | Verdict |
|-------|-----------|-------------------|------------|-------------|---------|
| Minimal Clean | ★★★★★ (evergreen) | ★★★★ | ★★★★★ | ★★★★★ | **Base foundation** |
| Glassmorphism | ★★★★ (dark glass trending) | ★★★★★ | ★★★★ | ★★★★ | **Selective — cards, panels** |
| Neubrutalism | ★★ (declining) | ★★★ | ★★★ | ★★★ | Skip |
| Bento Grid | ★★★★★ (mainstream) | ★★★★★ | ★★★★ | ★★★★ | **Dashboard layout** |
| Gradient Rich | ★★★★ (stable) | ★★★★ | ★★★★ | ★★★★ | **Chart fills only** |
| Dark-first | ★★★★★ (default for SaaS 2026) | ★★★★★ | ★★★★★ | ★★★★★ | **Primary mode** |
| Data-dense | ★★★★ (practical) | ★★★ | ★★★★ | ★★★★ | **Tables + analytics** |

**Final style**: "Minimal clean base + selective glassmorphism (KPI cards, product cards, sidebar) + bento dashboard grid + gradient area charts. Dark-first. Product images humanize the data."

## 2. Competitor Visual Analysis

### Triple Whale (triplewhale.com — $129/mo)
**Fonts**: Inconsolata, Inter, Manrope, Space Grotesk (4 fonts — wide variety)
**Accent**: Blue `#0C70F2` (active nav states)
**Dark mode**: Default, left sidebar consolidated
**Design language**: "Rounded corners, subtle drop shadows, prominent whitespace"
**Lesson**: Multiple fonts tạo visual hierarchy rõ ràng nhưng tăng complexity. ShopPulse dùng 3 fonts (Jakarta + Inter + JetBrains Mono) — đủ variety, dễ maintain.

### Dribbble Top Shots (e-commerce analytics dark mode)
- **Thinkwik** (1500+ likes): Product images in cards + revenue charts trên dark bg = visual richness
- **Tokoku / 10am Studio** (1200+ likes): Clean layout, product images prominent, subtle borders
- **Dony Alhadi** (900+ likes): Gradient area charts, KPI cards with trend arrows
- **Common pattern**: Product thumbnails inline trong analytics → unique cho e-commerce

## 3. Color Palette (Implementation-Ready)

### Color Philosophy
- **Primary accent**: Violet `#7C3AED` (Tailwind violet-600) — khác biệt với blue/green phổ biến ở e-commerce. Heroku, Stripe (subtle purple) prove violet works in tech.
- **Neutral base**: Zinc (cool neutral) — thay vì Slate (hơi xanh) hay Stone (hơi ấm). Zinc = trung tính nhất cho dashboard.
- **Dark-first**: Default = dark mode, light mode = opt-in variant.
- **60-30-10 rule**: 60% zinc neutrals, 30% violet primary, 10% status colors.

### Complete Token Table

| Token | Light Mode | Dark Mode | Tailwind Ref | Usage |
|-------|-----------|-----------|-------------|-------|
| **Surfaces** | | | | |
| `--background` | `#fafafa` (zinc-50) | `#09090b` (zinc-950) | — | Page background |
| `--background-alt` | `#f4f4f5` (zinc-100) | `#18181b` (zinc-900) | — | Secondary bg |
| `--card` | `#ffffff` (white) | `#18181b` (zinc-900) | — | Card opaque fallback |
| `--card-elevated` | `#ffffff` | `#27272a` (zinc-800) | — | Raised card, modal |
| **Text** | | | | |
| `--foreground` | `#09090b` (zinc-950) | `#fafafa` (zinc-50) | — | Primary text |
| `--foreground-muted` | `#71717a` (zinc-500) | `#a1a1aa` (zinc-400) | — | Secondary text |
| `--foreground-subtle` | `#a1a1aa` (zinc-400) | `#71717a` (zinc-500) | — | Disabled/hint text |
| **Accent (Violet)** | | | | |
| `--primary` | `#7c3aed` (violet-600) | `#7c3aed` (violet-600) | — | CTA buttons, links |
| `--primary-hover` | `#6d28d9` (violet-700) | `#6d28d9` (violet-700) | — | Hover state |
| `--primary-foreground` | `#ffffff` | `#ffffff` | — | Text on primary bg |
| `--primary-subtle` | `#f5f3ff` (violet-50) | `#2e1065` (violet-950) | — | Subtle bg |
| `--primary-subtle-fg` | `#7c3aed` (violet-600) | `#a78bfa` (violet-400) | — | Text on subtle bg |
| **Borders** | | | | |
| `--border` | `#e4e4e7` (zinc-200) | `#27272a` (zinc-800) | — | Default border |
| `--border-subtle` | `#f4f4f5` (zinc-100) | `rgba(255,255,255,0.06)` | — | Subtle dividers |
| `--border-strong` | `#a1a1aa` (zinc-400) | `#52525b` (zinc-600) | — | Emphasized |
| **Status Colors** | | | | |
| `--success` | `#16a34a` (green-600) | `#22c55e` (green-500) | — | Revenue up, delivered |
| `--success-subtle` | `#f0fdf4` (green-50) | `rgba(34,197,94,0.1)` | — | Subtle bg |
| `--warning` | `#d97706` (amber-600) | `#f59e0b` (amber-500) | — | Pending, risk |
| `--warning-subtle` | `#fffbeb` (amber-50) | `rgba(245,158,11,0.1)` | — | Subtle bg |
| `--destructive` | `#dc2626` (red-600) | `#ef4444` (red-500) | — | Loss, cancelled |
| `--destructive-subtle` | `#fef2f2` (red-50) | `rgba(239,68,68,0.1)` | — | Subtle bg |
| `--info` | `#2563eb` (blue-600) | `#3b82f6` (blue-500) | — | Info, processing |
| `--info-subtle` | `#eff6ff` (blue-50) | `rgba(59,130,246,0.1)` | — | Subtle bg |
| **Charts (6 series — perceptually distinct)** | | | | |
| `--chart-1` | `#7c3aed` (violet-600) | `#8b5cf6` (violet-500) | — | Primary series |
| `--chart-2` | `#0891b2` (cyan-600) | `#06b6d4` (cyan-500) | — | Cool contrast |
| `--chart-3` | `#e11d48` (rose-600) | `#f43f5e` (rose-500) | — | Warm contrast |
| `--chart-4` | `#16a34a` (green-600) | `#22c55e` (green-500) | — | Revenue/growth |
| `--chart-5` | `#d97706` (amber-600) | `#f59e0b` (amber-500) | — | Attention |
| `--chart-6` | `#db2777` (pink-600) | `#ec4899` (pink-500) | — | Differentiation |
| **Glassmorphism** | | | | |
| `--glass-bg` | `rgba(255,255,255,0.7)` | `rgba(255,255,255,0.03)` | — | Glass card bg |
| `--glass-bg-hover` | `rgba(255,255,255,0.85)` | `rgba(255,255,255,0.05)` | — | Glass hover |
| `--glass-border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.06)` | — | Glass border |
| `--glass-border-hover` | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.10)` | — | Glass border hover |

### Chart Gradient Fills (cho Recharts `<Area>`)

```css
/* Area chart gradients — 40% opacity ở top, 0% ở bottom */
--chart-1-fill-start: rgba(139, 92, 246, 0.4);   /* violet 40% */
--chart-1-fill-end:   rgba(139, 92, 246, 0);      /* violet 0% */
--chart-2-fill-start: rgba(6, 182, 212, 0.35);    /* cyan 35% */
--chart-2-fill-end:   rgba(6, 182, 212, 0);
--chart-3-fill-start: rgba(244, 63, 94, 0.35);    /* rose 35% */
--chart-3-fill-end:   rgba(244, 63, 94, 0);
--chart-4-fill-start: rgba(34, 197, 94, 0.35);    /* green 35% */
--chart-4-fill-end:   rgba(34, 197, 94, 0);
```

## 4. Typography Scale (Implementation-Ready)

### Font Stack

```
Headings:  Plus Jakarta Sans — geometric, warm, modern
Body:      Inter — best readability, industry standard for dashboards
Monospace: JetBrains Mono — revenue numbers, order IDs, data cells
```

**Google Fonts weights cần load**:
- Plus Jakarta Sans: 500, 600, 700, 800
- Inter: 400, 500, 600
- JetBrains Mono: 400, 500, 600

### Heading Scale (Plus Jakarta Sans)

| Token | Weight | Size | Line Height | Letter Spacing | Use Case |
|-------|--------|------|-------------|----------------|----------|
| `sp-h1` | 800 (ExtraBold) | 36px | 40px | -0.02em | Page titles: "Dashboard", "Analytics" |
| `sp-h2` | 700 (Bold) | 24px | 32px | -0.01em | Section headers: "Revenue", "Orders" |
| `sp-h3` | 700 (Bold) | 20px | 28px | -0.01em | Card titles: "Sales by Category" |
| `sp-h4` | 600 (SemiBold) | 16px | 24px | 0 | Sub-section, widget titles |
| `sp-h5` | 600 (SemiBold) | 14px | 20px | 0.01em | Small headers, table section labels |

### Body Scale (Inter)

| Token | Weight | Size | Line Height | Letter Spacing | Use Case |
|-------|--------|------|-------------|----------------|----------|
| `sp-body-lg` | 400 | 16px | 24px | 0 | Large body, summaries |
| `sp-body` | 400 | 14px | 20px | 0 | Default body text |
| `sp-body-medium` | 500 | 14px | 20px | 0 | Emphasized body, nav items |
| `sp-body-semibold` | 600 | 14px | 20px | 0 | Bold labels, active nav |
| `sp-label` | 500 | 12px | 16px | 0.02em | Form labels, table headers |
| `sp-label-uppercase` | 600 | 11px | 16px | 0.05em | Category labels (+ `text-transform: uppercase`) |
| `sp-caption` | 400 | 12px | 16px | 0.01em | Help text, timestamps |
| `sp-overline` | 600 | 10px | 12px | 0.08em | Badges, overlines (+ `text-transform: uppercase`) |

### Data Scale (JetBrains Mono)

| Token | Weight | Size | Line Height | Letter Spacing | Use Case |
|-------|--------|------|-------------|----------------|----------|
| `sp-kpi-hero` | 600 | 48px | 48px | -0.02em | Hero KPI: "$1,247,892" |
| `sp-kpi-lg` | 600 | 32px | 36px | -0.01em | Large KPI: "$45,231" |
| `sp-kpi-md` | 500 | 24px | 28px | -0.01em | Medium metric: "12,847" |
| `sp-kpi-sm` | 500 | 20px | 24px | 0 | Small metric, counters |
| `sp-data` | 400 | 14px | 20px | 0 | Table data cells, inline numbers |
| `sp-data-sm` | 400 | 12px | 16px | 0.01em | Small data, badge numbers |
| `sp-order-id` | 500 | 13px | 20px | 0.02em | Order IDs: "#ORD-2847" |

**Critical**: Tất cả tokens `sp-kpi-*` và `sp-data-*` PHẢI dùng `font-variant-numeric: tabular-nums` để numbers align vertically trong tables và KPI cards.

## 5. Glassmorphism Specifications

### Nguyên tắc cốt lõi
1. **Dark mode glass cần ambient decoration** — glass trên solid dark bg = vô hình. PHẢI có gradient orbs/blobs phía sau.
2. **Blur 12-16px optimal** — dưới 8px = quá subtle, trên 24px = performance hit.
3. **Background opacity 3-5% white** — cao hơn 5% looks muddy trên dark bg.
4. **Border 6% white** — vừa đủ define edges mà không thành wireframe.
5. **KHÔNG dùng glass cho**: tables (readability), long text (eye strain), mobile nhiều layers (GPU), small elements (checkbox, radio).

### CSS Specifications

```css
/* === Level 1: Default glass card === */
.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
}

/* === Level 2: Elevated glass (modal, popover) === */
.glass-elevated {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

/* === Level 3: Sidebar/nav panel === */
.glass-panel {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 16px;
}

/* === Accent glass (violet-tinted KPI card) === */
.glass-accent {
  background: rgba(124, 58, 237, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(124, 58, 237, 0.12);
  border-radius: 12px;
  box-shadow: 0 0 20px -4px rgba(124, 58, 237, 0.15);
}
```

### Ambient Background Decoration (BẮT BUỘC cho glass visibility)

```css
/* Gradient orbs phía sau glass cards */
.dashboard-bg::before {
  content: '';
  position: absolute;
  top: -20%; left: -10%;
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(124, 58, 237, 0.08) 0%, transparent 70%);
  pointer-events: none;
}
.dashboard-bg::after {
  content: '';
  position: absolute;
  bottom: -10%; right: -5%;
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%);
  pointer-events: none;
}
```

### Glass Usage Map

| Element | Glass Level | Reason |
|---------|------------|--------|
| KPI cards (4 tiles) | Level 1 (glass-card) | Short content, eye-catching |
| Product analytics card | Level 1 + product image | Image behind glass = stunning |
| Revenue chart container | Level 1 | Gradient chart fill visible through glass |
| Sidebar (collapsed mode) | Level 3 (glass-panel) | Fixed position, content scrolls behind |
| Modal/Dialog | Level 2 (glass-elevated) | Floating panel |
| Data tables | OPAQUE (zinc-900) | Readability critical — NO glass |
| Forms/Settings | OPAQUE (zinc-900) | Text-heavy — NO glass |
| Auth pages | Level 2 (centered card) | Hero effect for login card |
| Dropdown/Popover | Level 2 | Floating element |
| Tooltips | Level 1 | Small, temporary |

## 6. Shadows & Elevation (Dark Mode Optimized)

**Strategy**: Border-based elevation mặc định + shadow on hover + accent glow cho primary actions.

### Shadow Scale

```css
/* Traditional shadows gần invisible trên dark bg.
   Solution: inset top-edge highlight + darker outer shadow. */

--shadow-sm:  inset 0 1px 0 0 rgba(255,255,255,0.04),
              0 1px 2px 0 rgba(0,0,0,0.3),
              0 1px 3px 0 rgba(0,0,0,0.15);

--shadow-md:  inset 0 1px 0 0 rgba(255,255,255,0.05),
              0 4px 8px -2px rgba(0,0,0,0.4),
              0 2px 4px -2px rgba(0,0,0,0.2);

--shadow-lg:  inset 0 1px 0 0 rgba(255,255,255,0.06),
              0 8px 24px -4px rgba(0,0,0,0.5),
              0 4px 8px -4px rgba(0,0,0,0.3);

--shadow-xl:  inset 0 1px 0 0 rgba(255,255,255,0.08),
              0 16px 48px -8px rgba(0,0,0,0.6),
              0 8px 16px -8px rgba(0,0,0,0.4);
```

### Accent Glow (cho primary CTA, selected KPI)

```css
--glow-accent: 0 0 0 1px rgba(124,58,237,0.15),
               0 0 20px -4px rgba(124,58,237,0.25),
               0 0 40px -8px rgba(124,58,237,0.10);

--glow-success: 0 0 0 1px rgba(34,197,94,0.15),
                0 0 20px -4px rgba(34,197,94,0.20);

--glow-destructive: 0 0 0 1px rgba(239,68,68,0.15),
                    0 0 20px -4px rgba(239,68,68,0.20);
```

### Border-Based Elevation (performance-first alternative)

```css
/* Border opacity tăng dần = elevation tăng */
.elevation-0 { border: 1px solid rgba(255,255,255,0.04); }
.elevation-1 { border: 1px solid rgba(255,255,255,0.06); }
.elevation-2 { border: 1px solid rgba(255,255,255,0.08); }
.elevation-3 { border: 1px solid rgba(255,255,255,0.12); }

/* Rich elevation: top-edge highlight + bottom gradient */
.elevation-rich {
  border: 1px solid rgba(255,255,255,0.06);
  border-top-color: rgba(255,255,255,0.10);
  border-bottom-color: rgba(0,0,0,0.2);
}
```

## 7. Spacing & Layout

### Dashboard Dimensions

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-expanded` | 260px | Full sidebar with labels |
| `--sidebar-collapsed` | 64px | Icon-only mode |
| `--sidebar-padding` | 16px | Internal padding |
| `--sidebar-item-h` | 40px | Nav item height |
| `--sidebar-item-gap` | 4px | Between nav items |
| `--sidebar-section-gap` | 24px | Between nav groups |
| `--header-h` | 64px | Topbar height |
| `--header-px` | 24px | Topbar horizontal padding |
| `--content-max-w` | 1440px | Content area max-width |
| `--content-px` | 24px | Content horizontal padding (desktop) |
| `--content-px-mobile` | 16px | Content horizontal padding (mobile) |
| `--content-py` | 24px | Content vertical padding from header |

### Card Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--card-padding` | 24px | Default card internal padding |
| `--card-padding-sm` | 16px | Compact card (small KPI) |
| `--card-padding-lg` | 32px | Large feature card, auth card |
| `--card-radius` | 12px | Default card border-radius |
| `--card-radius-sm` | 8px | Small cards, buttons, inputs |
| `--card-radius-lg` | 16px | Hero cards, large panels, modals |
| `--card-radius-full` | 9999px | Badges, avatars |

### Grid & Section Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--grid-gap` | 24px | Default gap between cards (desktop) |
| `--grid-gap-sm` | 16px | Compact gap (mobile / data-dense) |
| `--grid-gap-xs` | 12px | Within-card grids |
| `--section-gap` | 32px | Between dashboard sections |
| `--section-gap-lg` | 48px | Between major page sections |

### Bento Grid Patterns

```css
/* KPI row: 4 equal columns */
.grid-kpi { grid-template-columns: repeat(4, 1fr); gap: 24px; }

/* Dashboard main: 2/3 + 1/3 split */
.grid-bento { grid-template-columns: 2fr 1fr; gap: 24px; }

/* Mixed: 3-column flexible */
.grid-mixed { grid-template-columns: repeat(3, 1fr); gap: 24px; }

/* Responsive: */
@media (max-width: 1280px) { .grid-kpi → repeat(2, 1fr); .grid-bento → 1fr; }
@media (max-width: 768px) { .grid-kpi → 1fr; gap: 16px; }
```

## 8. Component Visual Patterns

### KPI Card (Hero Component)

```
┌──────────────────────────┐
│ ↗ Total Revenue          │ ← sp-label (Inter 500, 12px, muted)
│                          │
│ $45,231.00               │ ← sp-kpi-lg (JetBrains Mono 600, 32px)
│                          │
│ ↑ +12.5% from last month │ ← sp-data-sm (JetBrains Mono, 12px, green-500)
│ ▂▃▅▆▇█▇▅▃▂▃▅▇           │ ← Sparkline (violet-500, 1.5px stroke)
└──────────────────────────┘
```
- **Background**: glass-card (rgba(255,255,255,0.03), blur 12px)
- **Border**: rgba(255,255,255,0.06)
- **Padding**: 24px
- **Radius**: 12px
- **Hover**: border → rgba(255,255,255,0.10), scale(1.01) transition 200ms
- **Selected state**: accent glow + violet-tinted border

### Product Analytics Card

```
┌──────────────────────────┐
│ ┌────┐                   │
│ │ 📷 │ Nike Air Max 90   │ ← Product image 48x48 rounded-8
│ └────┘ $129.99           │ ← sp-data (JetBrains Mono, 14px)
│                          │
│ 847 sales  ↑ +23%        │ ← sp-body-medium + green badge
│ $109,403 revenue         │ ← sp-data (JetBrains Mono, 14px, violet-400)
└──────────────────────────┘
```
- **Glass card + product image** = visual richness unique cho e-commerce

### Revenue Area Chart

```
Recharts configuration:
- CartesianGrid: rgba(255,255,255,0.06), dashed, horizontal only
- XAxis/YAxis: hide axis lines, tick color zinc-500 (#71717a)
- XAxis labels: Inter 12px, YAxis labels: JetBrains Mono 12px
- Area fill: linearGradient 40% opacity top → 0% bottom
- Stroke: 2px, series color
- Active dot: 5px radius, fill=series color, stroke=background color 2px
- Tooltip: glass-card (blur 12px, rgba(24,24,27,0.95))
- Cursor: rgba(255,255,255,0.1)
```

### Order Status Badges

| Status | Background | Text | Border |
|--------|-----------|------|--------|
| Pending | `rgba(245,158,11,0.1)` | `#fbbf24` (amber-400) | `rgba(245,158,11,0.2)` |
| Processing | `rgba(59,130,246,0.1)` | `#60a5fa` (blue-400) | `rgba(59,130,246,0.2)` |
| Shipped | `rgba(139,92,246,0.1)` | `#a78bfa` (violet-400) | `rgba(139,92,246,0.2)` |
| Delivered | `rgba(34,197,94,0.1)` | `#4ade80` (green-400) | `rgba(34,197,94,0.2)` |
| Cancelled | `rgba(239,68,68,0.1)` | `#f87171` (red-400) | `rgba(239,68,68,0.2)` |
| Returned | `rgba(236,72,153,0.1)` | `#f472b6` (pink-400) | `rgba(236,72,153,0.2)` |

## 9. Micro-Interactions & Transitions

| Element | Interaction | CSS |
|---------|------------|-----|
| Cards | Hover → border brighten + subtle scale | `transition: all 200ms ease; hover: scale(1.01), border-color: rgba(255,255,255,0.10)` |
| Table rows | Hover → row highlight | `hover: bg rgba(255,255,255,0.02)` |
| Buttons (primary) | Hover → darken | `transition: 150ms; hover: bg violet-700` |
| Nav items | Active → violet subtle bg | `bg rgba(124,58,237,0.08), color violet-400` |
| KPI trend arrow | Animate on load | `animation: fadeUp 300ms ease-out` |
| Chart tooltips | Fade in | `transition: opacity 150ms` |
| Sidebar toggle | Slide width | `transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1)` |
| Page transitions | Fade | `opacity 0→1, 200ms` |

## 10. Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|----------------|
| Desktop XL | ≥1440px | 4-column KPI, 2/3+1/3 bento, sidebar expanded |
| Desktop | ≥1280px | 4-column KPI, full-width content |
| Tablet | ≥768px | 2-column KPI, sidebar collapsed auto, stacked bento |
| Mobile | <768px | 1-column everything, bottom nav or hamburger, cards full-width |

## 11. Mood Board References

| # | Reference | Source | Takeaway |
|---|-----------|--------|----------|
| 1 | Triple Whale redesign 2025 | triplewhale.com/blog/new-look | Left sidebar consolidated, rounded corners, whitespace, dark-first |
| 2 | eCommerce Analytics Dark Mode | Dribbble/Thinkwik (1500+ likes) | Product images in cards + revenue charts = visual richness |
| 3 | Tokoku Dashboard | Dribbble/10am Studio (1200+ likes) | Clean layout, subtle borders, product images prominent |
| 4 | Glassmorphism Dashboard Dark | Dribbble/MitulJetani | Glass cards trên dark bg with gradient orbs = stunning |
| 5 | Dark Glassmorphism 2026 | Medium article | 3% white opacity, 12px blur, 6% border = optimal dark glass |
| 6 | Neon cyan + violet gradient | 2026 color trend | Cyber/AI SaaS aesthetic, violet accent = futuristic |
| 7 | Josh W. Comeau backdrop-filter | joshwcomeau.com | Best practices for frosted glass, performance considerations |

## 12. Style Direction Summary

> **Style**: Minimal clean base + selective glassmorphism (KPI cards, product cards, sidebar) + bento dashboard grid + gradient area chart fills. Dark-first (zinc-950 #09090b base). Product images humanize analytics data.
>
> **Mood**: "Premium commerce intelligence" — feels like a $129/mo tool (Triple Whale) with stunning UI. Data-driven but not sterile — product images, customer avatars, and violet glow effects add personality.
>
> **Typography system**: Plus Jakarta Sans (800/700/600) for headings — geometric, warm, authoritative. Inter (400/500/600) for body — maximum readability. JetBrains Mono (400/500/600) + tabular-nums for KPIs, revenue, order IDs — data credibility.
>
> **Color signature**: Violet #7C3AED primary (vs blue/green competition), zinc neutral base, green for growth metrics. 6-color chart palette perceptually distinct on dark background.
>
> **Glass signature**: 3% white bg, 12px blur, 6% border — applied to KPI cards, product cards, sidebar. NOT applied to data tables, forms, long text.
>
> **Differentiators vs all UI8 competitors**:
> 1. Violet accent (no competitor uses violet)
> 2. Glass product cards with images (no competitor has glass + product images)
> 3. JetBrains Mono KPI numbers (no competitor uses dedicated mono font for data)
> 4. Ambient gradient orbs behind glass (no competitor has this)
> 5. Geographic sales map
> 6. Figma Variables + React code

## 13. Marketplace Visual Competitiveness

| Tiêu chí | Score | Evidence |
|----------|-------|---------|
| Thumbnail nổi bật khi scroll? | 5/5 | Dark mode + violet accent + glass product cards = unique on UI8 |
| Dark mode dramatic enough? | 5/5 | Product images on glass over zinc-950 + violet gradient orbs |
| Preview variety? | 5/5 | Charts + products + maps + funnels + tables + auth + responsive |
| Khác biệt vs top 5? | 5/5 | Analytics (not admin) + glass + map = zero competitor has this combo |
| Cover "WOW" 2-second test? | 5/5 | Revenue dashboard with glass KPI cards + gradient area chart + product images |

## 14. Preview Image Strategy (12 images)

| # | Image | Content | Mode |
|---|-------|---------|------|
| 1 | **Cover** | Revenue overview — bento grid, glass KPI cards, gradient area chart, product images | Dark |
| 2 | Light overview | Same layout, clean white bg, product images pop | Light |
| 3 | Product analytics | Top sellers grid with images, performance bar chart | Dark |
| 4 | Customer insights | Segments donut, LTV chart, customer list with avatars | Dark |
| 5 | Geographic map | Revenue by country, interactive dots on vector map | Dark |
| 6 | Conversion funnel | Visit→cart→checkout→purchase, step conversion rates | Dark |
| 7 | Order management | Table with status badges, filters, detail drawer | Dark |
| 8 | Auth pages | Sign in/up centered card with subtle glass + brand | Dark |
| 9 | Responsive | 375px mobile views, 3-4 screens side by side | Dark |
| 10 | Figma Variables | Before/after rebrand (violet → orange → teal) | Split |
| 11 | Component overview | All SprouX + custom components used | Dark |
| 12 | Light/Dark split | Same screen, both modes side by side | Split |
