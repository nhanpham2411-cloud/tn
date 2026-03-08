# Status: ShopPulse — E-commerce Analytics Dashboard

## Current Phase: 7 — Figma Gen (🔄 In Progress)

| Phase | Status | Started | Completed |
|-------|--------|---------|-----------|
| 1. Research | ✅ Done | 2026-02-28 | 2026-02-28 |
| 2. UX & Spec | ✅ Done | 2026-02-28 | 2026-02-28 |
| 3. Art Direction | ✅ Done | 2026-02-28 | 2026-02-28 |
| 4. Design System | ✅ Done | 2026-02-28 | 2026-02-28 |
| 5. Build App | ✅ Done | 2026-02-28 | 2026-03-01 |
| 6. Review | ✅ Done | 2026-03-01 | 2026-03-01 |
| 6.5. Test | ✅ Done | 2026-03-01 | 2026-03-01 |
| 7. Figma Gen | 🔄 In Progress | 2026-03-02 | — |
| 8. Polish | ⏳ Pending | — | — |
| 9. Package | ⏳ Pending | — | — |
| 10. Publish | ⏳ Pending | — | — |
| 11. Post-launch | ⏳ Pending | — | — |

## Product Summary

- **Product**: ShopPulse — E-commerce Analytics Dashboard
- **Niche**: E-commerce Analytics (Triple Whale / Shopify Analytics style)
- **Style**: Minimal + glassmorphism + bento + dark-first, Violet accent (#7C3AED)
- **Fonts**: Plus Jakarta Sans + Inter + JetBrains Mono
- **Price**: $79 (Figma) / $149 (Figma + React code)
- **Screens**: 17 pages, 22+ states
- **Est. build**: ~14 days across 9 build phases

## Phase 2 Deliverables

- **Personas**: 3 end users (Linh-Founder, Tùng-Marketing, Hà-Operations) + 3 buyers
- **User Journeys**: 2 journey maps with aha/friction/delight moments
- **User Flows**: 12 flows (auth, onboarding, revenue, products, orders, customers, funnel, map, reports, settings, search, empty→populated)
- **Sitemap**: 17 pages across 4 groups (Auth, Dashboard, Commerce, Settings, Utility)
- **Navigation**: Sidebar 3 groups, breadcrumbs, 13 cross-links
- **Screen Specs**: 17 pages detailed (layout, components, data, actions, states)
- **Components**: 38/47 SprouX + 16 custom (charts, map, funnel, product card, etc.)
- **Edge Cases**: 9 empty states, 8 loading, 6 errors, 10 overflow cases
- **Responsive**: 4 breakpoints × 11 component types
- **Mock Data**: 7 data files (products 50, orders 200, customers 150, KPIs, charts, channels, nav)
- **Content**: 10 naming conventions, tone guidelines

## Phase 3 Deliverables (Art Direction Deep Dive)

- **Art direction specs** extracted to `art-direction.md` (14 sections, ~500 lines)
- **Color palette**: Violet-600 accent (#7C3AED), Zinc neutral, complete token table (light + dark hex values)
- **Typography**: Plus Jakarta Sans (headings) + Inter (body) + JetBrains Mono (data)
- **Visual effects**: 4-level glassmorphism specs, dark mode shadow system, accent glow
- **Component patterns**: KPI card, chart config, status badges, sidebar — all with CSS
- **Micro-interactions**: Hover, transition, loading state specs
- **13 preview image strategy** planned

## Phase 4 Deliverables (Design System Customization)

- **Repo**: `~/sproux-saas-templates/` — 47 SprouX UI components forked
- **Fonts**: Fraunces/Geist → Plus Jakarta Sans/Inter/JetBrains Mono (3 @import)
- **Colors**: Teal primary → Violet-600 (#7C3AED), Slate → Zinc neutral
- **Charts**: 6-series perceptually distinct palette (violet/cyan/rose/green/amber/pink)
- **Typography**: 20 ShopPulse `sp-*` utility classes (headings, body, KPI, data)
- **Glassmorphism**: 4 glass levels (card, elevated, panel, accent) as `@utility` classes
- **Effects**: 3 glow effects + 5 elevation levels as `@utility` classes
- **Dark mode**: rgba-based status subtles, 3% glass bg, zinc-900 cards
- **No component code changes**: All 47 components use semantic tokens → auto-inherit
- **Build**: `pnpm build` pass, zero errors, 2.25s

## Phase 5 Progress (Build App)

### Completed
- **Layout Shell**: DashboardLayout (no sidebar, header-based nav), AuthLayout
- **Header**: Tab nav (6 tabs), theme toggle, notification bell dropdown (5 notifications, read/unread, mark all, dismiss), user profile dropdown (avatar + online status, navigation links, sign out), command palette (Cmd+K, search pages/products/quick actions)
- **Dashboard Overview** (~1400 lines, most complex page):
  - Date picker filter: Popover with 2-month calendar + 6 preset buttons (7d/14d/30d/60d/90d/year)
  - Total Revenue card: category tabs (Online/Retail/Wholesale) with animated KPIs, descriptions
  - 4 metric cards: animated counters, sparkline mini-charts, dropdown actions
  - Statistics stacked bar chart: Days/Weeks/Months tabs, day selector, legend toggle, chart actions
  - Global Sales globe: 8 regions, error state with retry
  - Upgrade CTA: purple gradient card
  - Recent Orders: 4 orders with avatars, status badges, refresh skeleton, empty state
  - Top Products: 4 products with images, star badge, growth indicators
  - Sales Channels: 4 channels with progress bars, tooltips
  - **Edge cases**: loading skeleton, offline banner, error state, animated counters, tooltips everywhere
  - **Action UIs**: 6 Sheet drawers (revenue breakdown, metric detail, order detail, product detail, global sales, add channel form), 2 Dialogs (compare periods, channel management), CSV download, clipboard copy, real navigation
  - Global scrollbar: minimal thumb-only design, light/dark mode adaptive
  - Sonner Toaster mounted at root (`main.tsx`)
- **Analytics page** (~950 lines):
  - Bento grid layout: 12-col CSS Grid with varied col-span/row-span (mosaic pattern)
  - 4 KPI cards with sparklines, 4 Key Insight cards
  - Revenue Overview: stacked bar + channel legend
  - Traffic Sources: interactive donut chart with bidirectional hover (overflow-visible fix for hover expansion)
  - Product Categories: icon + progress bar style (matched Sales Channels visual)
  - Daily Orders: dual-series bar chart (this week vs last week)
  - Revenue Forecast: dual line chart (actual vs projected)
  - Conversion Funnel: waterfall bar chart + vertical step list + refresh button with skeleton
  - Geography: d3 halftone bubble map (90% scale, +10px translate) + interactive 4-col legend
  - Chart palette: purple (#7c3aed) + green (#22c55e) + amber (#f59e0b) triadic, 6 tokens light/dark
  - **Edge cases**: loading skeleton (800ms), offline banner with reconnect, map error state with retry, funnel refresh simulation, 4 empty state guards (revenue, traffic, orders, categories)
- **Reports page** (~430 lines, rebuilt to match dashboard/analytics quality):
  - 4 KPI summary cards: Total Reports, Completed, Processing, Scheduled (DCard + colored icons)
  - Reports table: DCard wrapper, Tabs (All/Revenue/Customers/Products/Channels), search input, status Select filter
  - 16 mock reports with 4 types (revenue/customers/products/channels), 3 statuses, 3 formats (PDF/CSV/Excel)
  - Type badges with colored dots (violet/cyan/amber/rose), status badges with dot indicators (success/warning/muted)
  - Row actions: DropdownMenu (Preview, Download, Share, Delete) with hover reveal
  - Report Detail Sheet: metadata grid, preview placeholder, export buttons (PDF/CSV/Excel), status-specific messaging
  - Generate Report Dialog: type/date range/format selects, loading spinner simulation (1500ms), toast feedback
  - **Edge cases**: loading skeleton (800ms), offline banner with reconnect, empty state (filtered), generating state
  - Typography: migrated from typo-* to sp-* classes (consistent with dashboard/analytics)
- **Users List page** (~580 lines, rebuilt to match dashboard quality):
  - 4 KPI cards: Total Users, Active, Inactive, Invited (DCard + colored icons)
  - Users table: DCard wrapper, pill Tabs (All/Active/Inactive/Invited), search, role Select filter, table-fixed columns
  - Checkbox bulk select with bulk action bar (Export, Remove, Clear)
  - Custom status badges with colored dots (success/muted/primary-pulse), role Badge outline
  - Row actions: DropdownMenu (View Profile, Edit Role, Export Data, Remove User) with hover reveal
  - Invite User Dialog: name/email/role fields, loading spinner simulation, toast feedback
  - Edit Role Sheet: user info card + role Select + save button, toast feedback
  - Delete confirmation AlertDialog
  - **Edge cases**: loading skeleton (800ms), offline banner, refresh button with table skeleton, empty state
- **User Profile page** (~430 lines, rebuilt to match dashboard quality):
  - Profile header: DCard, 64px avatar with online status dot, status badge, meta info (email/role/joined/last active)
  - 3 KPI cards: Plan, Role, Member Since (DCard + colored icons)
  - Pill tabs: Overview, Activity, Settings
  - Activity tab: timeline-style with vertical line, colored type icons (auth/settings/report/team/security/billing/project), type Badge
  - Settings tab: user info form with Save button (loading state + toast), Danger Zone (Deactivate + Delete with AlertDialog)
  - **Edge cases**: loading skeleton (800ms), offline banner, not-found state, save loading, delete → navigate back
- **Management pages**: products, orders, order-detail, invoices (built in previous sessions)
- **Settings pages**: general, notifications, billing (built in previous sessions)
- **Auth pages**: sign-in, sign-up, forgot-password, onboarding (built in previous sessions)
- **Utility**: not-found 404 page

### Remaining
- README.md

## Phase 6 Deliverables (Review)

- **Date:** 2026-03-01
- **Issues found:** ~105 total (0 code quality, 5 functional, 9 responsive, ~48 WCAG, ~43 DS compliance)
- **Issues fixed:** ~104 (1 was non-issue)
- **Review notes:** `review-notes.md`
- **Key fixes:**
  - Auth forms: added `disabled` + Loader2 spinner + toast feedback (sign-in, sign-up, forgot-password, onboarding)
  - Responsive: `grid-cols-2` → `grid-cols-1 sm:grid-cols-2` in 9 Sheet/Dialog grids across 5 files
  - WCAG: 40 `aria-label` additions across 13 files (icon buttons, search inputs, focus-visible)
  - DS compliance: 35 `typo-*` → `sp-*` replacements across 6 files, 8 native `<button>` → `<Button>` conversions
- **Build:** zero errors, 3.20s
- **DS compliance:** 100% — all tokens, components, typography prefix verified

### Phase 6 — Animation & Auth Polish (2026-03-01)
- **Auth redesign:**
  - Split-screen layout (illustration left + form right, 50/50 flex)
  - `ShopPulseLogo` component (diamond SVG gradient)
  - Card width `max-w-[440px]`, padding `p-xl`, social buttons `grid grid-cols-2`
  - Dark mode default + FOUC prevention (inline script in index.html)
  - Input autofill fix (`background-color: var(--input) !important` + `transition: background-color 5000s`)
- **Animation system:**
  - 4 new CSS keyframes: `page-in`, `slide-up`, `scale-in`, `shimmer`
  - `PageTransition` component wraps `<Outlet />` in both layouts
  - `stagger-children` on KPI grids (10 grids, 9 pages, 50ms delay)
  - `prefers-reduced-motion: reduce` media query
  - Removed `hover-lift` on DCards (user preference)
- **Bug fixes:**
  - PageTransition wrapper causing card shrink in auth → added `w-full flex items-center justify-center`
  - forgot-password max-width 420→440px (consistency)

## Phase 6.5 Deliverables (Test)

- **Date:** 2026-03-01
- **Score:** 43/47 automated (91%) — EXCELLENT
- **Report:** `test-report.md`
- **Results by category:**
  - A. Code Quality: 6/8 (13 `text-[Xpx]` micro-sizing, 24 sub-token spacing — acceptable)
  - B. Interaction & State: 11/11 (all edge cases covered)
  - C. Visual Polish: 6/7 (mobile cards use inline div — intentional differentiation)
  - D. Dark Mode: 6/7 (CTA shadow barely visible in dark)
  - E. Responsive: 7/7 (all breakpoints, mobile card views, hamburger menu)
  - F. Data Realism: 7/7 (50 users, 100 orders, 29 products, diverse names, real CDN images)
- **Issues found:** 1 medium (CTA shadow), 1 low (violet shadow strength), 2 info
- **Manual checks pending:** G. Micro-interactions (7), H. UI8 Buyer Experience (9)

## Phase 7 Progress — Figma Gen

### 7a. Foundation (✅ Done)
- Variables: 107 vars, 4 collections (raw colors, semantic colors, spacing, border radius)
- Text Styles: 20 styles (SP/H1-H5, Body, Label, Caption, KPI, Data, Overline)
- Effects: 10 styles (Shadows sm-xl, Glass card/elevated/panel, Glow accent/success/destructive)
- CSS synced: +spacing 5xl/6xl, secondary-hover→zinc-300, muted→zinc-100

### 7b. Design System Page (✅ Done — 2026-03-04)
- 🧱 Foundation page: Colors, Typography, Tokens (spacing, border radius, shadows) merged into 1 page. 🔣 Icons page separate (1900+)
- 38 component docs, each with 10 sections: Header, Explore Behavior, Installation, Examples, Props, Design Tokens, Best Practices, Figma Mapping, Accessibility, Related
- ExploreBehavior: button pills pattern, State control on all interactive components
  - Selects render vertical, Toggles render horizontal (flex-wrap)
  - `disabled` property support for cascade logic
  - Overlay components show static face (pointer-events-none), NOT trigger
- Interactive Demo subsection for trigger-based components (Dialog, AlertDialog, Sheet, Drawer)
- Dialog: Type selector (Desktop/Desktop Scrollable/Mobile/Mobile Full Screen) + 4 toggles
- AlertDialog: Type (Desktop/Mobile), Slot (text/congratulation), Icon picker, 4 toggles with cascade disabled
- All Props tables complete with full types/defaults from source code
- Favicon updated to diamond SVG logo
- Pattern documented: `component-docs-pattern.md` (10-section standard)
- Training reference: `../../common-mistakes.md` (33 lessons)

### 7c. Plugin Showcase Rewrite (✅ Done — 2026-03-05)
- Figma showcase generates **3 sections only**: Header → Component grid → Installation
- All other sections (Explore, Examples, Props, Tokens, Best Practices, Figma Mapping, Accessibility, Related) are **web-only** — not rendered in Figma
- Variable binding fixes: gap/padding → `spacing/*` (string tokens), radius → `border radius/*`
- Icon auto-detect from combo (`IconLeft=true`)
- Grid: first property horizontal (columns), rest vertical (rows)
- `_buildProps` hoisted out of explore block to fix scope error

### 7d. Component Generation (🔄 In Progress)

**Có JSON**: 18/41 components
**Cần tạo**: 25 components

#### Generation Order (dependency-based)

**Tier 0 — Leaf components (no dependencies)**

| # | Component | JSON | Notes |
|---|-----------|------|-------|
| 1 | Button | done | Base dep for many others |
| 2 | Badge | done | Used in Table, Card |
| 3 | Avatar | done | Used in Table, Card, HoverCard |
| 4 | Label | done | |
| 5 | Spinner | done | Ellipse pattern |
| 6 | Checkbox | done | Indicator pattern. Used in Table |
| 7 | Switch | done | Indicator pattern |
| 8 | Toggle | done | |
| 9 | Radio | done | Indicator pattern |
| 10 | Separator | done | Simple |
| 11 | Skeleton | done | Children pattern (4 shape compositions) |
| 12 | Progress | done | Children pattern (indicator per value) |
| 13 | Slider | done | Three-segment layout (filled + thumb + empty) |
| 14 | Input | done | Addon pattern (iconLeft/iconRight) |
| 15 | Textarea | done | Same state pattern as Input |
| 16 | Select | done | Trigger face (text + chevron) |
| 17 | InputOTP | done | Children pattern (9 groups for Length x Value) |
| 18 | Tabs | done | Variant context (Default/Pill), compound showWhen |
| 19 | Accordion | TODO | |
| 20 | Breadcrumb | TODO | |
| 21 | ScrollArea | TODO | |
| 22 | Tooltip | TODO | Children pattern |
| 23 | NavigationMenu | TODO | |

**Tier 1 — Depends on Tier 0 (Button, Badge, Avatar, Checkbox...)**

| # | Component | JSON | Instance deps |
|---|-----------|------|---------------|
| 24 | SearchBox | TODO | Input |
| 25 | Alert | TODO | Button (close) |
| 26 | Pagination | TODO | Button |
| 27 | Collapsible | TODO | Button (trigger) |
| 28 | Command | TODO | Input, Badge |
| 29 | Card | TODO | Button, Badge, Avatar |
| 30 | Dropdown | TODO | Checkbox |
| 31 | ContextMenu | TODO | Checkbox |
| 32 | Popover | TODO | Button |
| 33 | Table | TODO | Checkbox, Badge, Avatar, Button |

**Tier 2 — Depends on Tier 0 + Tier 1**

| # | Component | JSON | Instance deps |
|---|-----------|------|---------------|
| 34 | Dialog | TODO | Button |
| 35 | Sheet | TODO | Button |
| 36 | Drawer | TODO | Button |
| 37 | Alert Dialog | done | Button |
| 38 | HoverCard | TODO | Avatar, Button |
| 39 | Combobox | TODO | Command, Badge |
| 40 | Calendar | TODO | Day Cell (sub-component) |
| 41 | DatePicker | TODO | Calendar, Button |

**Rule**: Always generate Tier 0 first, then Tier 1, then Tier 2. Within same tier, order doesn't matter.
