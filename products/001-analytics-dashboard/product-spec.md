# Product Spec: ShopPulse — E-commerce Analytics Dashboard

> Version: 2.0
> Ngày: 2026-02-28
> Dựa trên research: `research.md`

---

## 1. Overview

**Product name**: BredarStudio — ShopPulse
**Tagline**: "E-commerce intelligence, beautifully visualized"
**Description**: A comprehensive e-commerce analytics dashboard template for Shopify/WooCommerce store owners. Track revenue, analyze customer behavior, optimize product performance, and monitor sales channels — all in one stunning dark-first interface with glassmorphism cards and geographic insights.
**Target screens**: 22+
**Estimated price**: $79 (Figma) / $149 (Figma + React code)
**Style direction**: Minimal clean + glassmorphism product cards + bento grid + gradient charts, dark-first (from research.md section 5)

---

## 2. User Personas

### End User Persona 1 (Primary): Linh — D2C Brand Founder

| Attribute | Detail |
|-----------|--------|
| **Tên & vai trò** | Linh — D2C Brand Founder, 32 tuổi |
| **Demographics** | Founder thương hiệu skincare, team 8 người, Shopify store |
| **Tech savviness** | Intermediate — quen Shopify, Google Analytics nhưng không biết SQL |
| **Thiết bị** | Desktop primary (MacBook), check metrics trên iPhone khi di chuyển |
| **Frequency** | 3-5 lần/ngày — sáng check revenue, trưa check orders, chiều check ads |

**Goals**:
- [x] Xem tổng quan revenue, orders, conversion rate ngay khi mở app
- [x] Biết sản phẩm nào bán chạy để restock, sản phẩm nào ế để promotion
- [x] Hiểu khách hàng đến từ channel nào (organic, FB ads, TikTok) để tối ưu ad spend
- [x] Export weekly report cho investor meeting

**Frustrations**:
- [x] Phải mở 4 tabs (Shopify + GA + FB Ads + Stripe) để có full picture
- [x] Shopify Analytics quá basic, không có customer segmentation
- [x] Triple Whale $129/mo — quá đắt cho startup giai đoạn đầu
- [x] Không biết LTV của khách hàng, không biết ai sắp churn

**Daily tasks trên app**:
- [x] Sáng: Check overnight revenue, so sánh vs hôm qua
- [x] Trưa: Review orders mới, check inventory top sellers
- [x] Chiều: Xem traffic sources, check ad campaign performance
- [x] Tuần: Export report, review customer segments, check geographic data

**Key screens sử dụng nhiều nhất**:
- [x] Revenue Overview (dashboard chính)
- [x] Product Analytics (top sellers, performance)
- [x] Customer Insights (segments, LTV)
- [x] Orders (list + detail)

### End User Persona 2: Tùng — Marketing Manager

| Attribute | Detail |
|-----------|--------|
| **Tên & vai trò** | Tùng — Marketing Manager tại e-commerce company, 28 tuổi |
| **Demographics** | Quản lý marketing cho brand fashion, team 4 người, WooCommerce |
| **Tech savviness** | Advanced — quen data tools, biết đọc cohort analysis |
| **Thiết bị** | Desktop primary (dual monitor), tablet khi meeting |
| **Frequency** | Power user — mở app suốt ngày, 10+ lần/ngày |

**Goals**:
- [x] Track marketing channel performance (organic vs paid vs social vs email)
- [x] Monitor conversion funnel: visit → add to cart → checkout → purchase
- [x] Analyze customer acquisition cost (CAC) vs lifetime value (LTV)
- [x] Build custom reports cho weekly marketing meeting

**Frustrations**:
- [x] Data rải rác giữa Google Analytics, Facebook Ads Manager, Klaviyo
- [x] Không có unified view để compare channels side-by-side
- [x] Charts trên GA4 khó customize, export report xấu
- [x] Thiếu conversion funnel visualization — phải tính tay

**Daily tasks**:
- [x] Morning: Check campaign ROAS, daily traffic by channel
- [x] Midday: Review conversion funnel, identify drop-offs
- [x] Afternoon: Analyze customer segments, plan targeting
- [x] Weekly: Build multi-channel comparison report

**Key screens**:
- [x] Channel Analytics (traffic sources, ROAS)
- [x] Conversion Funnel
- [x] Customer Insights (segments, cohorts)
- [x] Reports (custom, export)

### End User Persona 3: Hà — Operations Manager

| Attribute | Detail |
|-----------|--------|
| **Tên & vai trò** | Hà — Operations Manager, 35 tuổi |
| **Demographics** | Quản lý vận hành shop thời trang, 200+ orders/ngày |
| **Tech savviness** | Intermediate — quen Excel, Shopify admin |
| **Thiết bị** | Desktop primary |
| **Frequency** | 5-8 lần/ngày — focus vào orders, inventory |

**Goals**:
- [x] Monitor order status flow (pending → processing → shipped → delivered)
- [x] Track inventory levels, get alerts for low stock
- [x] Review customer complaints, returns, refunds
- [x] Check daily revenue vs target

**Frustrations**:
- [x] Shopify order list thiếu advanced filters
- [x] Không có geographic view — không biết region nào order nhiều
- [x] Phải export CSV rồi mở Excel để phân tích

**Daily tasks**:
- [x] Process pending orders, update statuses
- [x] Check inventory alerts, restock requests
- [x] Review returns/refunds
- [x] Check daily target progress

**Key screens**:
- [x] Orders (list + filters + detail)
- [x] Product Analytics (inventory focus)
- [x] Revenue Overview (daily target)
- [x] Geographic Map (shipping regions)

---

### Buyer Persona 1 (Primary): Alex — SaaS Founder building analytics tool

| Attribute | Detail |
|-----------|--------|
| **Who** | Startup founder building e-commerce analytics SaaS (competitor to Triple Whale) |
| **Budget** | $100-200 — sẵn sàng trả premium cho quality + code |
| **Decision criteria** | Code quality (React/TS), screen completeness, dark mode, Figma quality, analytics depth |
| **Use case** | MVP UI trong 2 tuần — cần screens cho investor demo |
| **Pain with alternatives** | Generic dashboard templates thiếu e-commerce specifics (product images, funnels, maps) |

### Buyer Persona 2: Mai — UI Designer tại Agency

| Attribute | Detail |
|-----------|--------|
| **Who** | Senior UI designer, agency chuyên làm e-commerce projects |
| **Budget** | $50-100 — agency budget per project |
| **Decision criteria** | Figma quality, Variables support, easy rebrand, dark mode, responsive |
| **Use case** | Starting point cho client e-commerce dashboards, customize brand colors + content |
| **Pain with alternatives** | Hardcoded colors, detached components, phải redesign dark mode manually |

### Buyer Persona 3: Khoa — Frontend Developer

| Attribute | Detail |
|-----------|--------|
| **Who** | Freelance frontend dev, build e-commerce dashboards cho clients |
| **Budget** | $100-150 — ROI after 1-2 projects |
| **Decision criteria** | React code quality, TypeScript, Tailwind, component architecture, chart implementation |
| **Use case** | Code reference + Figma specs → build pixel-perfect for clients |
| **Pain with alternatives** | Figma-only templates, no code. Phải interpret Figma → code, dễ miss details |

---

## 3. User Journey Maps

### Journey: Linh (D2C Founder) — Từ Sign Up đến Daily Use

| Stage | Actions | Touchpoints (Screens) | Emotions | Pain Points | Opportunities |
|-------|---------|----------------------|----------|-------------|---------------|
| **Sign Up** | Tạo account, nhập email/password | Sign Up | Excited — "Muốn xem app thế nào" | Quá nhiều fields? | Social sign-up (Google) |
| **Onboarding** | Connect Shopify store, chọn currency, set targets | Onboarding (3 steps) | Hopeful → Impatient | API key phức tạp? | 1-click Shopify connect |
| **First Dashboard** | Xem revenue overview, explore charts | Revenue Overview | Curious → "Wow" moment | Overwhelmed by data? | Highlight 3 key metrics first |
| **Explore Products** | Click top sellers, xem product performance | Product Analytics | Interested → Useful | Missing product? | Search + filter products |
| **Check Customers** | Xem customer segments, LTV tiers | Customer Insights | Surprised — "Không biết data này!" | Segment names unclear? | Tooltips explaining segments |
| **Daily Use** | Morning check: revenue + orders + alerts | Overview, Orders | Confident → Efficient | Repetitive clicks? | Dashboard widgets customizable |
| **Reports** | Export weekly report cho investor | Reports | Satisfied → Professional | Export format limited? | PDF + CSV + email schedule |
| **Settings** | Dark mode, notifications, billing | Settings | Comfortable | Theme change jarring? | Smooth transition animation |

**"Aha" moment**: Khi thấy geographic sales map lần đầu — "Ồ, hóa ra 40% revenue đến từ TP.HCM, mình nên chạy geo-targeted ads!"
**Friction points**: Onboarding connect store (API key có thể phức tạp) — cần hướng dẫn rõ ràng
**Delight moments**: Smooth dark mode transition, gradient chart animations, glassmorphism card hover effects

### Journey: Tùng (Marketing Manager) — Focus trên Channel Analytics

| Stage | Actions | Touchpoints (Screens) | Emotions | Pain Points | Opportunities |
|-------|---------|----------------------|----------|-------------|---------------|
| **Sign In** | Quick login, straight to channels | Sign In → Channel Analytics | Focused | Slow load? | Cache last view |
| **Channel Compare** | Compare organic vs paid vs social | Channel Analytics | Analytical → Insights | Too many data points? | Highlight top/bottom channel |
| **Funnel Analysis** | Check conversion drops | Conversion Funnel | Concerned → Action | Which step loses most? | Visual funnel with drop % |
| **Customer Deep Dive** | Segment analysis, cohort retention | Customer Insights | Data-driven | Complex charts? | Clear labels, tooltips |
| **Build Report** | Filter, export, share | Reports | Productive | Export layout ugly? | Beautiful PDF template |

**"Aha" moment**: Conversion funnel hiển thị "Cart → Checkout drop-off: 68%" — actionable insight ngay lập tức
**Friction points**: Quá nhiều charts trên 1 page — cần clear visual hierarchy
**Delight moments**: Channel comparison bar chart với brand colors (FB blue, TikTok black, Google multicolor)

---

## 4. Sitemap & Navigation

### Sitemap

```
Root (/)
├── Auth (no sidebar — centered card layout)
│   ├── /auth/sign-in
│   ├── /auth/sign-up
│   ├── /auth/forgot-password
│   └── /auth/onboarding
│
├── Dashboard (sidebar layout — Main group)
│   ├── /dashboard                    ← Revenue Overview (landing page)
│   ├── /dashboard/analytics          ← Channel & Traffic Analytics
│   └── /dashboard/reports            ← Reports & Export
│
├── Commerce (sidebar layout — Commerce group)
│   ├── /commerce/products            ← Product Analytics (grid + performance)
│   ├── /commerce/products/:id        ← Product Detail
│   ├── /commerce/orders              ← Orders List
│   ├── /commerce/orders/:id          ← Order Detail
│   ├── /commerce/customers           ← Customer Insights & Segments
│   └── /commerce/customers/:id       ← Customer Profile
│
├── Settings (sidebar layout — Settings group)
│   ├── /settings/general             ← Profile, Store, Appearance
│   ├── /settings/notifications       ← Email, Push, Webhooks
│   └── /settings/billing             ← Plan, Usage, Payment
│
└── Utility
    └── * (404 Not Found)
```

**Total screens**: 17 page components, 22+ screen states

### Navigation Model

| Type | Implementation | Details |
|------|---------------|---------|
| **Primary nav** | Sidebar | Icon + label, collapsible (Cmd+B), 3 groups: Dashboard / Commerce / Settings |
| **Secondary nav** | Tabs | Within pages (Customer Profile tabs, Settings tabs) |
| **Contextual nav** | Breadcrumbs | Home > Section > Page > Detail |
| **Quick actions** | Command palette | Cmd+K → search products, customers, orders, pages |
| **User menu** | Avatar dropdown | Profile, Store Settings, Theme toggle, Logout |
| **Notifications** | Bell icon in header | Recent alerts (low stock, high return rate, etc.) |

### Sidebar Structure

```
── ShopPulse (logo + brand)
│
├── Dashboard
│   ├── Overview           /dashboard
│   ├── Analytics          /dashboard/analytics
│   └── Reports            /dashboard/reports
│
├── Commerce
│   ├── Products           /commerce/products
│   ├── Orders             /commerce/orders
│   └── Customers          /commerce/customers
│
├── Settings
│   ├── General            /settings/general
│   ├── Notifications      /settings/notifications
│   └── Billing            /settings/billing
│
└── Footer
    ├── User avatar + name
    ├── Theme toggle (light/dark)
    └── Collapse button
```

### Breadcrumb Structure

| Route | Breadcrumb |
|-------|------------|
| /dashboard | Dashboard |
| /dashboard/analytics | Dashboard > Analytics |
| /dashboard/reports | Dashboard > Reports |
| /commerce/products | Commerce > Products |
| /commerce/products/:id | Commerce > Products > {Product Name} |
| /commerce/orders | Commerce > Orders |
| /commerce/orders/:id | Commerce > Orders > #{Order ID} |
| /commerce/customers | Commerce > Customers |
| /commerce/customers/:id | Commerce > Customers > {Customer Name} |
| /settings/general | Settings > General |
| /settings/notifications | Settings > Notifications |
| /settings/billing | Settings > Billing |

### Cross-linking Map

| From Screen | Links To | Trigger |
|-------------|---------|---------|
| Revenue Overview | Analytics | Click "View details" on traffic KPI card |
| Revenue Overview | Orders | Click "View all" on recent orders |
| Revenue Overview | Products | Click product in "Top Sellers" |
| Product list | Product Detail | Click product row/card |
| Product Detail | Orders (filtered) | Click "View orders for this product" |
| Orders list | Order Detail | Click order row |
| Order Detail | Customer Profile | Click customer name/avatar |
| Order Detail | Product Detail | Click product in order items |
| Customer list | Customer Profile | Click customer row |
| Customer Profile | Orders (filtered) | Click "View orders" in Orders tab |
| Customer Profile | Product Detail | Click product in "Purchased products" |
| Analytics | Reports | Click "Generate report" |
| Reports | Any detail page | Click metric → drill down |

---

## 5. User Flows

### Flow 1: Authentication

```
[Sign In] → (Enter email + password) → (Submit)
    ├── ✅ Valid → [Revenue Overview]
    └── ❌ Invalid → (Error: "Invalid email or password") → [Sign In]

[Sign In] → (Click "Continue with Google") → (OAuth) → [Revenue Overview]
[Sign In] → (Click "Forgot Password?") → [Forgot Password]
    → (Enter email) → (Submit) → (Success: "Check your email") → [Sign In]
[Sign In] → (Click "Create account") → [Sign Up]
    → (Fill form) → (Submit)
    ├── ✅ → [Onboarding Step 1]
    └── ❌ → (Inline errors)
```

### Flow 2: Onboarding (3 steps)

```
[Step 1: Store Setup] → (Store name, platform, URL, Connect) → (Next)
[Step 2: Preferences] → (Currency, timezone, revenue target) → (Next)
[Step 3: Team] → (Invite emails or Skip) → (Complete) → [Revenue Overview + welcome banner]
```

### Flow 3: Revenue Analysis

```
[Revenue Overview] → (View KPIs: Revenue, Orders, AOV, Conversion)
    → (Change date range: Today/7d/30d/90d/Custom)
    → (Click "Top Sellers" product) → [Product Detail]
    → (Click "View all orders") → [Orders List]
    → (Click traffic KPI) → [Channel Analytics]
```

### Flow 4: Product Analytics

```
[Products — Grid/List] → (Toggle view, Filter category/status/stock, Sort)
    → (Click product) → [Product Detail]
    → (Tabs: Overview/Orders/Reviews)
    → (Click "View orders") → [Orders filtered by product]
```

### Flow 5: Order Management

```
[Orders List] → (Search, Filter status/date, Sort)
    → (Click order) → [Order Detail]
    → (Update status: Pending→Processing→Shipped)
    → (Add tracking number)
    → (Click customer name) → [Customer Profile]
```

### Flow 6: Customer Insights

```
[Customers] → (Tab segments: All/New/Returning/VIP/At-Risk/Churned)
    → (Search, Sort by LTV/orders/date)
    → (Click customer) → [Customer Profile]
    → (Tabs: Overview/Orders/Activity)
```

### Flow 7: Conversion Funnel

```
[Analytics] → (Scroll to Funnel)
    → (View: Visitors→Cart→Checkout→Purchase→Return with conversion %)
    → (Hover step → tooltip breakdown)
```

### Flow 8: Geographic Map

```
[Revenue Overview] → (View map with revenue dots)
    → (Hover region → tooltip: revenue, orders, top products)
    → (Click region → filter all data to region)
```

### Flow 9: Reports & Export

```
[Reports] → (Select type: Revenue/Products/Customers/Channels)
    → (Set date range) → (Preview)
    → (Export: PDF/CSV/Excel) → (Download) → (Toast: "Downloaded")
```

### Flow 10: Settings

```
[Settings General] → (Edit profile/store/theme) → (Save) → (Toast: "Saved")
[Settings General] → (Delete Account) → [AlertDialog: type store name] → (Confirm) → [Sign In]
```

### Flow 11: Search & Filter

```
[Any List] → (Type search → real-time filter)
    → (Click filter dropdowns → select options)
    → (Filters shown as badges) → (Click "×" to remove)
    → (Click "Clear all") → [Full list]
```

### Flow 12: Empty → Populated

```
[Products — no data] → (Empty: "No products synced yet") → (CTA: "Connect Store")
    → [Settings > Store Connection] → (Connect API) → (Sync) → [Products populated]
```

---

## 6. Wireframes & Layout Patterns

### Layout Patterns

| Pattern | Screens | Structure |
|---------|---------|-----------|
| **Dashboard/Bento** | Revenue Overview, Analytics | KPI cards (4) → Bento: charts + tables + map |
| **List** | Products, Orders, Customers | Header + search/filters → Table/grid → Pagination |
| **Detail** | Product, Order, Customer | Status header → Info cards → Tabs → Content |
| **Form/Settings** | General, Notifications, Billing | Section cards → Form fields → Save |
| **Auth** | Sign In, Sign Up, Forgot Password | Centered card → Logo → Form → Links |
| **Wizard** | Onboarding | Step indicator → Content → Next/Back/Skip |
| **Utility** | 404 | Centered → Illustration → Title → CTA |

### E-commerce Specific Patterns

| Pattern | Description | Used In |
|---------|------------|---------|
| **Product Grid** | Image + name + price + metrics | Products list |
| **KPI + Sparkline** | Large number + trend % + mini chart | Revenue Overview |
| **Funnel** | Horizontal stepped bars, narrowing | Analytics |
| **Geographic Map** | SVG map with data dots/heatmap | Revenue Overview |
| **Status Timeline** | Vertical timeline with status dots | Order Detail |
| **Segment Tabs** | Tab bar filtering by customer segment | Customers |
| **Channel Comparison** | Side-by-side charts per channel | Analytics |

---

## 7. Screen Specifications

### Auth (4 screens)

| # | Screen | Route | Layout | Key Components | Data | Actions | States |
|---|--------|-------|--------|---------------|------|---------|--------|
| 1 | Sign In | /auth/sign-in | Auth | Card, Input, Button, Checkbox, Separator | — | Submit, Google OAuth, Navigate | Default, Validation, Loading |
| 2 | Sign Up | /auth/sign-up | Auth | Card, Input, Button, Checkbox, Progress | — | Submit, Google OAuth, Navigate | Default, Validation, Loading |
| 3 | Forgot Password | /auth/forgot-password | Auth | Card, Input, Button | — | Submit, Back | Default, Success, Error |
| 4 | Onboarding | /auth/onboarding | Wizard | Card, Input, Select, RadioGroup, Progress | — | Next, Back, Skip, Connect Store | Step 1/2/3, Loading |

### Dashboard (3 screens)

| # | Screen | Route | Layout | Key Components | Data | Actions | States |
|---|--------|-------|--------|---------------|------|---------|--------|
| 5 | Revenue Overview | /dashboard | Bento | Card, Badge, Table, Avatar, Select, Charts, Map | KPIs, revenue chart, top sellers, recent orders, geo map | Date range, Click KPI, Click product/order | Default, Loading, Empty (no store) |
| 6 | Channel Analytics | /dashboard/analytics | Dashboard | Card, Tabs, Charts, Funnel | Traffic sources, funnel, channel comparison, daily visitors | Filter channel, Date range, View funnel | Default, Loading, Empty |
| 7 | Reports | /dashboard/reports | List | Card, Table, Select, Button, DropdownMenu | Report data | Select type, Date range, Export | Default, Loading, Empty, Generating |

### Commerce (6 screens)

| # | Screen | Route | Layout | Key Components | Data | Actions | States |
|---|--------|-------|--------|---------------|------|---------|--------|
| 8 | Products | /commerce/products | List/Grid | Card, Table, Badge, Input, Select, ToggleGroup, Pagination | Products + images | Search, Filter, Sort, Toggle view, Click | Default, Loading, Empty, Grid/List |
| 9 | Product Detail | /commerce/products/:id | Detail | Card, Tabs, Badge, Table, Chart | Product info, sales chart | View tabs, Navigate | Default, Loading |
| 10 | Orders | /commerce/orders | List | Table, Badge, Input, Select, DatePicker, Pagination | Orders + status | Search, Filter, Sort, Click | Default, Loading, Empty |
| 11 | Order Detail | /commerce/orders/:id | Detail | Card, Badge, Table, Select, Timeline | Order info, items, timeline | Update status, Add tracking, Navigate | Default, Loading |
| 12 | Customers | /commerce/customers | List | Table, Avatar, Badge, Tabs, Input, Pagination | Customers + segments | Filter segment, Search, Sort, Click | Default, Loading, Empty |
| 13 | Customer Profile | /commerce/customers/:id | Detail | Card, Avatar, Tabs, Table, Badge, Chart | Customer info, spending | View tabs, Navigate | Default, Loading |

### Settings (3 screens)

| # | Screen | Route | Layout | Key Components | Data | Actions | States |
|---|--------|-------|--------|---------------|------|---------|--------|
| 14 | General | /settings/general | Form | Card, Input, Select, RadioGroup, Avatar, AlertDialog | Profile, store, theme | Edit, Theme, Connect store, Delete account | Default, Saving |
| 15 | Notifications | /settings/notifications | Form | Card, Switch, Input, Button | Notification prefs | Toggle switches, Add webhook | Default, Saving |
| 16 | Billing | /settings/billing | Form | Card, Progress, Badge, Table, Button | Plan, usage, payment | Change plan, Update payment, Download invoice | Default, Loading |

### Utility (1 screen)

| # | Screen | Route | Layout | Key Components | Data | Actions | States |
|---|--------|-------|--------|---------------|------|---------|--------|
| 17 | 404 | * | Utility | Button | — | Go back, Go home | Default |

---

## 8. Component Inventory

### SprouX Components Used (38/47 = 81%)

**Layout**: [x] Sidebar [x] Sheet [x] Dialog [x] Drawer [x] Tabs
**Data Display**: [x] Table [x] Card [x] Badge [x] Avatar [x] Separator [ ] AspectRatio
**Data Input**: [x] Input [x] Select [x] Checkbox [x] RadioGroup [x] Switch [x] Textarea [ ] Slider
**Feedback**: [x] Alert [x] AlertDialog [x] Toast/Sonner [x] Progress [x] Skeleton
**Navigation**: [x] Breadcrumb [x] Pagination [x] DropdownMenu [x] Command [ ] NavigationMenu
**Form**: [x] Form [x] Label [x] Calendar [x] DatePicker [x] Popover
**Other**: [ ] Accordion [x] Collapsible [x] Tooltip [x] Toggle [x] ToggleGroup [x] ScrollArea

### Custom Components (16)

| Component | Purpose | Based on | Screens |
|-----------|---------|----------|---------|
| Revenue Chart (Area) | Revenue over time, gradient fill | Recharts | Overview, Product Detail |
| Bar Chart | Channel comparison, product perf | Recharts | Analytics, Products |
| Donut Chart | Traffic sources, segments | Recharts | Analytics, Customers |
| Line Chart | Daily visitors, trends | Recharts | Analytics |
| Funnel Chart | Conversion funnel | Custom div | Analytics |
| Geographic Map | Revenue by country | Custom SVG | Overview |
| KPI Card | Metric + trend % + sparkline | Card | Overview |
| Product Card | Image + name + price + badge | Card | Products grid |
| Data Table | Search/filter/sort/paginate | Table | Orders, Customers |
| Page Header | Title + desc + actions | — | All pages |
| Empty State | Illustration + message + CTA | — | All lists |
| Confirm Dialog | Destructive confirmation | AlertDialog | Settings |
| Status Badge | Colored per status | Badge | Orders, Products |
| Order Timeline | Vertical steps | Custom | Order Detail |
| Sparkline | Tiny inline chart | Recharts | Overview KPIs |
| Segment Tabs | Tabs with count badges | Tabs + Badge | Customers |

---

## 9. UI States & Edge Cases

### Empty States (9)

| Screen | Trigger | Message | CTA |
|--------|---------|---------|-----|
| Overview (no store) | No store connected | "Connect your store to start tracking" | "Connect Store" |
| Overview (no data) | Store connected, no orders | "Waiting for your first sale!" | "View Setup Guide" |
| Products (no sync) | Store not synced | "No products synced yet" | "Sync Products" |
| Products (filtered) | Filter = 0 | "No products match your filters" | "Clear Filters" |
| Orders (empty) | New store | "No orders yet" | — |
| Orders (filtered) | Filter = 0 | "No orders match your filters" | "Clear Filters" |
| Customers (empty) | No orders | "No customer data yet" | — |
| Customers (segment) | Segment = 0 | "No {segment} customers" | "View All" |
| Reports (first) | No reports | "Generate your first report" | "Create Report" |

### Loading States (8 screens with skeleton)

### Error States (6 types: 404, network, sync fail, validation, permission, store disconnected)

### Overflow (10 edge cases defined)

---

## 10. Responsive Behavior

| Breakpoint | Sidebar | Grid | Table | Charts | Dialogs |
|------------|---------|------|-------|--------|---------|
| 1440px | Full | 4 cols | Full | Full | Modal |
| 1024px | Collapsible | 3 cols | Full | Smaller | Modal |
| 768px | Sheet | 2 cols | H-scroll | Stacked | Full width |
| 375px | Sheet | 1 col | Card view | Full width | Drawer |

---

## 11. Content & Tone

**Tone**: Professional but approachable — data confidence without intimidation
**Headings**: Clear — "Revenue Overview", "Top Selling Products"
**Actions**: Imperative — "Export Report", "Connect Store"
**Errors**: Helpful — "We couldn't load your data. Please try again."
**Empty states**: Encouraging — "No orders yet. They'll appear here automatically."

### Naming Conventions

| Concept | Use | NOT |
|---------|-----|-----|
| Buyers | "Customers" | Users, Clients |
| Purchases | "Orders" | Transactions, Sales |
| Goods | "Products" | Items, SKUs |
| Money in | "Revenue" | Sales, Income |
| Avg order | "AOV" | Avg Sale |
| Lifetime value | "LTV" | CLV |
| Traffic sources | "Channels" | Sources, Platforms |
| Order progress | "Status" | State, Stage |
| Date filter | "Date Range" | Period, Timeframe |
| Theme | "Theme" | Mode, Appearance |

---

## 12. Mock Data Requirements

| Data File | Records | Key Fields |
|-----------|---------|------------|
| products.ts | 50 | name, image, price, category, stock, status, revenue, unitsSold, returnRate |
| orders.ts | 200 | id (#ORD-XXXX), items[], total, status, customer, paymentMethod, date |
| customers.ts | 150 | name, email, avatar, segment, totalSpent, ordersCount, ltv, country |
| kpi.ts | — | revenue, orders, aov, conversionRate, visitors (all with change%) |
| chart-data.ts | 12mo | dailyRevenue, trafficByChannel, funnel, revenueByCountry, segments |
| channels.ts | 6 | Organic, Paid Social, Paid Search, Email, Referral, Direct + metrics |
| navigation.ts | — | sidebar items, groups, icons, routes |

**Data quality**: Realistic names (VN + intl mix), product images, growth trend, diverse status distribution, geographic spread (VN 60%, US 15%, JP 10%, Other 15%), USD currency.

---

## 13. Tech Decisions

- **Routing**: react-router-dom v6
- **Charts**: Recharts (area, bar, line, donut, funnel custom)
- **Map**: Custom SVG map component (no API needed)
- **Forms**: react-hook-form + zod
- **Dates**: date-fns
- **Icons**: Lucide React
- **Dark mode**: `.dark` class, localStorage
- **Code splitting**: React.lazy() all pages
- **CSS**: Tailwind v4 + SprouX tokens (`typo-*`)
- **Chart colors**: `useChartColors()` hook

---

## 14. Build Phases

| Phase | Scope | Screens | Days |
|-------|-------|---------|------|
| A | Layout shell (sidebar, header, routing, dark mode) | — | 1 |
| B | Auth (sign-in, sign-up, forgot-password, onboarding) | 4 | 1 |
| C | Revenue Overview + charts + geographic map | 1 | 2 |
| D | Analytics + Funnel + Reports | 2 | 2 |
| E | Products (list/grid + detail) | 2 | 2 |
| F | Orders (list + detail + timeline) | 2 | 2 |
| G | Customers (segments + profile) | 2 | 1.5 |
| H | Settings (general + notifications + billing) | 3 | 1 |
| I | Utility + Polish (404, skeletons, empty states, WCAG) | 1+ | 1.5 |
| **Total** | | **17 pages** | **~14 days** |

---

## 15. Spec Review Checklist

- [x] Mọi screen trong sitemap có Screen Spec? — 17/17
- [x] Mọi flow có screens tương ứng? — 12 flows mapped
- [x] Mọi data entity có screens? — products, orders, customers, KPIs, channels
- [x] Edge cases planned? — 9 empty + 8 loading + 6 error + 10 overflow
- [x] Cross-links 2 chiều? — 13 cross-links mapped
- [x] Component inventory complete? — 38 SprouX + 16 custom
- [x] Responsive defined? — 4 breakpoints × 11 components
- [x] Content tone consistent? — 10 naming conventions
- [x] Build phases estimated? — 14 days / 9 phases
