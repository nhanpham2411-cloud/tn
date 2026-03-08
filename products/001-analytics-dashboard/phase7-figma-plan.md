# Phase 7: ShopPulse Figma File — Master Plan

## Mục tiêu

- **140+ frames** cho UI8 Featured
- Dark-first, light mode trên 4+ key screens
- 100% auto-layout, Figma Variables bound
- Layer names descriptive, naming convention nhất quán

---

## Cấu trúc Figma File (10 pages)

| # | Page Name | Est. Frames | Nội dung |
|---|-----------|-------------|----------|
| 0 | 🎨 Cover | 1 | Product branding, mockup, UI8 badges |
| 1 | 📖 How to Use | 3-5 | Getting started, customization guide, variables guide |
| 2 | 👤 Personas & Research | 4 | 6 personas + 2 journey maps |
| 3 | 🔀 User Flows | 12 | 12 flows dạng screen sequences |
| 4 | 🗺️ Sitemap & Features | 2 | Sitemap tree + feature matrix |
| 5 | 🧱 Foundation | 8-10 | Colors (raw palette, semantic tokens, chart, status), Typography (type scale, type pairing), Tokens (spacing, border radius, shadows, glass) |
| 6 | 🔣 Icons | 1-2 | 1900+ Lucide icon components + showcase grid (stroke bound to foreground variable) |
| 7 | 🧩 Components | 6-10 | Button, Input, Card, Table, Badge, Chart, Navigation, Overlay — mỗi component có showcase (header, component grid, installation). Detailed docs (examples, props, tokens, etc.) are web-only |
| 8 | 📱 Visual | ~100 | Tất cả màn hình app: Auth, Dashboard, Management, Settings, Utility, Edge Cases, Responsive |
| 9 | 📋 Change Log | 1 | Version info |
| | **Tổng** | **~140** | |

---

## Page 5: 🧱 Foundation

| Frame | Nội dung |
|-------|----------|
| **Colors** | |
| Raw Palette | Violet (50-950), Zinc (50-950), status raw colors |
| Semantic Tokens | Light vs Dark side-by-side: background, foreground, card, primary, secondary, muted, border, sidebar, destructive, success, warning, info |
| Chart Colors | chart-1 → chart-6 với sample donut/bar |
| Status Colors | success, warning, destructive, info — dot badge + fill + text samples |
| **Typography** | |
| Type Scale | Tất cả sp-* styles: display, h1-h4, body, body-semibold, caption, label, kpi-hero, kpi-label, kpi-value, mono, mono-sm — font name, size, weight, line-height |
| Type Pairing | Plus Jakarta Sans (headings) + Inter (body) + JetBrains Mono (data) sample compositions |
| **Tokens** | |
| Spacing Scale | 3xs (2px) → 3xl (48px) visual boxes side-by-side |
| Border Radius | sm/md/lg/xl/2xl/full với sample boxes |
| Shadows & Elevation | 5 levels (sm → 2xl) light vs dark comparison |
| Glass & Elevation | 4 levels (subtle, light, medium, heavy) với backdrop blur samples |

## Page 6: 🔣 Icons

| Frame | Nội dung |
|-------|----------|
| Icons — Showcase | 1440px showcase frame: header (title + description + count pill), grid of 30 icon cards (icon instance + label), dark bg bound to `background` variable |
| Icon Components (raw) | 30 standalone Components dạng `Icon / {Name}` (24×24, stroke bound to `foreground` variable). Đặt bên phải showcase frame |

**30 icons**: Search, X, Check, ChevronDown, ChevronRight, ChevronLeft, ChevronUp, Plus, Minus, Eye, EyeOff, Loader2, Mail, ArrowLeft, Home, CheckCircle2, MoreHorizontal, Circle, Calendar, Download, RefreshCw, Trash2, Bell, Settings, User, WifiOff, Filter, Star, TrendingUp, Copy

**Đặc điểm kỹ thuật:**
- Mỗi icon = Component (không phải ComponentSet) → dùng cho icon swap trong Button, Input, etc.
- Stroke color bound to `semantic colors/foreground` → tự đổi Light/Dark mode
- SVG paths từ Lucide React (cùng bộ icon dùng trong React app)
- Naming convention: `Icon / {PascalCase}` — Figma tự nhóm vào thư mục "Icon" trong Assets panel

## Page 7: 🧩 Components

Mỗi component tạo ra gồm 2 phần:
1. **ComponentSet** (raw) — chứa tất cả variants, dùng cho design (Assets panel)
2. **Showcase Frame** (1440px) — documentation page đẹp gồm:
   - Header: title (SP/H1), description, property pills
   - Variant Grid: mỗi variant = 1 card row với tất cả sizes
   - Size Comparison: align bottom, captions
   - State Flow: Default → Hover → Disabled với arrows
   - Examples: 3+ real-world usage patterns (form actions, destructive confirmation, toolbar)

| Component | Variants | Showcase Sections |
|-----------|----------|-------------------|
| **Button** | 5 Variant × 4 Size × 3 State = 60 | Variants (5 rows), Sizes (4 cols), States (3 flow), Examples (3 patterns) |
| Input | 4 State | States, Examples |
| Badge | 6 Variant | Variants, Examples |
| Card (DCard) | stat card, chart card, list card | Variants, Examples |
| Table | header row, body rows, selected, pagination | Anatomy, Examples |
| Form Controls | Checkbox, Radio, Switch × states | States, Examples |
| Navigation | Sidebar, Breadcrumb, Tabs | Variants, Examples |
| Overlay | Sheet, Dialog, AlertDialog, DropdownMenu, Toast | Variants, Examples |

> **Thứ tự tạo**: Button trước (test pattern) → còn lại theo dependency order

---

## Page 8: 📱 Visual (tất cả màn hình app)

### Quy tắc đặt tên Frame

```
{Flow#}.{Screen#} — {Feature} / {Screen Name} — {State}
```

| Thành phần | Mô tả | Ví dụ |
|------------|-------|-------|
| `{Flow#}` | Số thứ tự luồng tính năng (2 chữ số) | `01`, `02`, `10` |
| `{Screen#}` | Số thứ tự màn hình trong luồng đó (2 chữ số) | `01`, `02`, `03` |
| `{Feature}` | Tên luồng tính năng | `Auth`, `Dashboard`, `Management`, `Settings`, `Utility` |
| `{Screen Name}` | Tên cụ thể của màn hình | `Sign In`, `Overview`, `Products`, `Profile` |
| `{State}` | Trạng thái / edge case / corner case | `Default`, `Loading`, `Empty`, `Error`, `Offline`, `Light` |

**Ví dụ đặt tên:**

| Frame Name | Giải thích |
|------------|-----------|
| `01.01 — Auth / Sign In — Default` | Flow 1, Screen 1: Auth Sign In, trạng thái Default (Dark) |
| `01.02 — Auth / Sign In — Error` | Flow 1, Screen 2: Auth Sign In, trạng thái Error |
| `01.03 — Auth / Sign In — Loading` | Flow 1, Screen 3: Auth Sign In, trạng thái Loading |
| `01.04 — Auth / Sign In — Light` | Flow 1, Screen 4: Auth Sign In, Light mode variant |
| `02.01 — Auth / Sign Up — Default` | Flow 2, Screen 1: Auth Sign Up |
| `05.01 — Dashboard / Overview — Default` | Flow 5, Screen 1: Dashboard Overview |
| `05.02 — Dashboard / Overview — Loading` | Flow 5, Screen 2: Dashboard Overview Skeleton |
| `05.03 — Dashboard / Overview — Empty` | Flow 5, Screen 3: Dashboard Overview Empty State |
| `05.04 — Dashboard / Overview — Offline` | Flow 5, Screen 4: Dashboard Overview Offline |
| `05.05 — Dashboard / Overview — Error` | Flow 5, Screen 5: Dashboard Overview Error/Retry |
| `05.06 — Dashboard / Overview — DatePicker` | Flow 5, Screen 6: Date Picker mở |
| `05.07 — Dashboard / Overview — Light` | Flow 5, Screen 7: Light mode variant |
| `08.01 — Management / Products — Default` | Flow 8, Screen 1: Products list |
| `08.05 — Management / Products — BulkSelect` | Flow 8, Screen 5: Bulk selection active |
| `08.06 — Management / Products — EditSheet` | Flow 8, Screen 6: Edit sheet open |
| `08.07 — Management / Products — DeleteConfirm` | Flow 8, Screen 7: AlertDialog confirm |
| `14.01 — Utility / 404 — Default` | Flow 14, Screen 1: Not Found |
| `15.01 — Edge Cases / Skeletons — Catalog` | Flow 15: Edge case catalog |
| `16.01 — Responsive / Dashboard — Tablet` | Flow 16: Responsive variant |

### Phân bổ Flow Numbers

| Flow # | Feature | Số màn hình |
|--------|---------|-------------|
| 01 | Auth / Sign In | 4 (default, error, loading, light) |
| 02 | Auth / Sign Up | 4 (default, password-strength, validation-error, light) |
| 03 | Auth / Forgot Password | 3 (default, email-sent, light) |
| 04 | Auth / Onboarding | 4 (step1, step2, step3, light) |
| 05 | Dashboard / Overview | 8 (default, loading, empty, offline, error, datepicker, export-sheet, light) |
| 06 | Dashboard / Analytics | 6 (default, loading, empty, error, chart-tooltip, light) |
| 07 | Dashboard / Reports | 6 (default, loading, empty, filter-active, detail-sheet, light) |
| 08 | Management / Products | 8 (default, loading, empty, offline, bulk-select, edit-sheet, delete-confirm, light) |
| 09 | Management / Orders | 6 (default, loading, empty, status-tab, detail-sheet, light) |
| 10 | Management / Users | 6 (default, loading, empty, bulk-select, edit-sheet, light) |
| 11 | Management / Invoices | 5 (default, loading, empty, detail-sheet, light) |
| 12 | Management / Customers | 4 (default, loading, detail-sheet, light) |
| 13 | Settings / Profile | 4 (default, edit-mode, save-loading, light) |
| 14 | Settings / Notifications | 3 (default, all-off, light) |
| 15 | Settings / Billing | 5 (default, plan-comparison, payment-sheet, cancel-confirm, light) |
| 16 | Utility / 404 | 2 (default, light) |
| 17 | Utility / 500 | 1 (default) |
| 18 | Utility / Maintenance | 1 (default) |
| 19 | Edge Cases / Catalog | 12 (skeletons, empty-states, errors, offline, loading-buttons, form-validation, toasts, dialogs, pagination, tables, dropdowns, sheets) |
| 20 | Responsive | 8 (dashboard-tablet, dashboard-mobile, table-tablet, table-mobile, auth-mobile, settings-mobile, nav-mobile, sheet-mobile) |
| | **Tổng** | **~100** |

### Sắp xếp màn hình trong Page "Visual"

```
Page "Visual" layout (Figma canvas):

Trục Y (dọc từ trên xuống) = Từng luồng tính năng (Flow)
Trục X (ngang từ trái sang phải) = Các màn hình trong luồng đó (Screen#)

Flow 01 — Auth / Sign In:
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ 01.01    │  │ 01.02    │  │ 01.03    │  │ 01.04    │
│ Default  │  │ Error    │  │ Loading  │  │ Light    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
    gap=100       gap=100       gap=100

Flow 02 — Auth / Sign Up:
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ 02.01    │  │ 02.02    │  │ 02.03    │  │ 02.04    │
│ Default  │  │ PwdStr   │  │ ValError │  │ Light    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘

... (tiếp tục cho mỗi flow)

Flow 20 — Responsive:
┌────────┐  ┌──────┐  ┌────────┐  ┌──────┐
│ Tablet │  │Mobile│  │ Tablet │  │Mobile│
│ 768px  │  │375px │  │ 768px  │  │375px │
└────────┘  └──────┘  └────────┘  └──────┘
```

**Quy tắc sắp xếp:**

| Quy tắc | Mô tả |
|---------|-------|
| **Hàng ngang** | 1 hàng = 1 luồng tính năng (flow). Các màn hình xếp từ trái sang phải theo thứ tự sử dụng |
| **Thứ tự màn hình** | Default (main) > Edge cases (loading, empty, error, offline) > Interactions (sheet, dialog, tooltip) > Light variant (cuối cùng) |
| **Khoảng cách ngang** | 100px giữa các frame trong cùng 1 flow |
| **Khoảng cách dọc** | 200px giữa các flow (hàng) |
| **Section header** | Mỗi nhóm feature (Auth, Dashboard, Management, Settings, Utility, Edge Cases, Responsive) có 1 text label lớn phía trên, cách 300px từ nhóm trước |
| **Frame size** | Desktop: 1440x900. Tablet: 768x1024. Mobile: 375x812 |
| **Light variants** | Luôn đặt ở cuối hàng (bên phải nhất) của mỗi flow |

### Sắp xếp Responsive (Flow 20)

```
Flow 20 — Responsive:

Desktop reference       Tablet (768px)      Mobile (375px)
(không tạo lại,         ┌──────────┐        ┌──────┐
 chỉ label trỏ về       │ 20.01    │        │20.02 │
 frame gốc)             │ Dashboard│        │Dash  │
                        │ Tablet   │        │Mobile│
                        └──────────┘        └──────┘
                        768x1024            375x812

                        ┌──────────┐        ┌──────┐
                        │ 20.03    │        │20.04 │
                        │ Table    │        │Table │
                        │ Tablet   │        │Mobile│
                        └──────────┘        └──────┘

                        ┌──────────┐        ┌──────┐
                        │ 20.05    │        │20.06 │
                        │ Auth     │        │Sett  │
                        │ Mobile   │        │Mobile│
                        └──────────┘        └──────┘
```

**Responsive xếp theo cặp**: Tablet + Mobile cùng 1 screen xếp cạnh nhau (tablet trái, mobile phải). Mỗi cặp cách nhau 200px dọc.

---

## Chi tiết từng Flow — Danh sách màn hình

### Flow 01: Auth / Sign In (4 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `01.01 — Auth / Sign In — Default` | Dark | Main | Split-screen: left branding + right form (email, password, remember me, social login) |
| `01.02 — Auth / Sign In — Error` | Dark | Edge | Invalid credentials error message dưới form |
| `01.03 — Auth / Sign In — Loading` | Dark | Edge | Button có spinner, inputs disabled |
| `01.04 — Auth / Sign In — Light` | Light | Variant | Light mode version của Default |

### Flow 02: Auth / Sign Up (4 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `02.01 — Auth / Sign Up — Default` | Dark | Main | Form: name, email, password + strength meter + terms checkbox + social login |
| `02.02 — Auth / Sign Up — PasswordStrength` | Dark | State | Password strength bar = Strong, 3/4 requirements met |
| `02.03 — Auth / Sign Up — ValidationError` | Dark | Edge | Terms unchecked, email format error |
| `02.04 — Auth / Sign Up — Light` | Light | Variant | Light mode |

### Flow 03: Auth / Forgot Password (3 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `03.01 — Auth / Forgot Password — Default` | Dark | Main | Email input + Send Reset Link button |
| `03.02 — Auth / Forgot Password — EmailSent` | Dark | State | Success icon + "Check your email" message |
| `03.03 — Auth / Forgot Password — Light` | Light | Variant | Light mode |

### Flow 04: Auth / Onboarding (4 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `04.01 — Auth / Onboarding — Step1` | Dark | Main | Company Info: name, industry select, team size radios |
| `04.02 — Auth / Onboarding — Step2` | Dark | State | Team Setup: invite members, roles |
| `04.03 — Auth / Onboarding — Step3` | Dark | State | Preferences: dashboard widgets, notification prefs |
| `04.04 — Auth / Onboarding — Light` | Light | Variant | Step 1 light mode |

### Flow 05: Dashboard / Overview (8 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `05.01 — Dashboard / Overview — Default` | Dark | Main | 4 KPI cards + revenue chart + orders chart + recent orders table + top products |
| `05.02 — Dashboard / Overview — Loading` | Dark | Edge | Full page skeleton: KPI shimmer + chart shimmer + table shimmer |
| `05.03 — Dashboard / Overview — Empty` | Dark | Edge | No data state: illustration + "Start adding products" CTA |
| `05.04 — Dashboard / Overview — Offline` | Dark | Edge | WifiOff banner top + stale data bên dưới |
| `05.05 — Dashboard / Overview — Error` | Dark | Edge | Error card với retry button thay cho charts |
| `05.06 — Dashboard / Overview — DatePicker` | Dark | Interaction | Date range picker dropdown mở |
| `05.07 — Dashboard / Overview — ExportSheet` | Dark | Interaction | Export options sheet (PDF, CSV, Excel) |
| `05.08 — Dashboard / Overview — Light` | Light | Variant | Light mode |

### Flow 06: Dashboard / Analytics (6 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `06.01 — Dashboard / Analytics — Default` | Dark | Main | Bento grid: 6 chart sections + KPI cards + insight cards |
| `06.02 — Dashboard / Analytics — Loading` | Dark | Edge | Bento skeleton shimmer |
| `06.03 — Dashboard / Analytics — Empty` | Dark | Edge | Chưa có analytics data |
| `06.04 — Dashboard / Analytics — Error` | Dark | Edge | Error card với retry |
| `06.05 — Dashboard / Analytics — ChartTooltip` | Dark | Interaction | Hover state trên chart với tooltip |
| `06.06 — Dashboard / Analytics — Light` | Light | Variant | Light mode |

### Flow 07: Dashboard / Reports (6 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `07.01 — Dashboard / Reports — Default` | Dark | Main | Table view: filters + search + pagination |
| `07.02 — Dashboard / Reports — Loading` | Dark | Edge | Table skeleton rows |
| `07.03 — Dashboard / Reports — Empty` | Dark | Edge | Không có reports |
| `07.04 — Dashboard / Reports — FilterActive` | Dark | State | Tab filter active + search đã điền |
| `07.05 — Dashboard / Reports — DetailSheet` | Dark | Interaction | Report detail sheet mở |
| `07.06 — Dashboard / Reports — Light` | Light | Variant | Light mode |

### Flow 08: Management / Products (8 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `08.01 — Management / Products — Default` | Dark | Main | Table: image, name, category, price, stock, status + actions |
| `08.02 — Management / Products — Loading` | Dark | Edge | Skeleton table rows |
| `08.03 — Management / Products — Empty` | Dark | Edge | Chưa có products + "Add Product" CTA |
| `08.04 — Management / Products — Offline` | Dark | Edge | WifiOff banner |
| `08.05 — Management / Products — BulkSelect` | Dark | Interaction | Checkboxes đã chọn + bulk action bar |
| `08.06 — Management / Products — EditSheet` | Dark | Interaction | Edit product form sheet |
| `08.07 — Management / Products — DeleteConfirm` | Dark | Interaction | AlertDialog "Are you sure?" |
| `08.08 — Management / Products — Light` | Light | Variant | Light mode |

### Flow 09: Management / Orders (6 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `09.01 — Management / Orders — Default` | Dark | Main | Table: order#, customer, date, status, total + actions |
| `09.02 — Management / Orders — Loading` | Dark | Edge | Skeleton |
| `09.03 — Management / Orders — Empty` | Dark | Edge | Chưa có orders |
| `09.04 — Management / Orders — StatusTab` | Dark | State | Status pill tabs: All/Pending/Delivered/Cancelled |
| `09.05 — Management / Orders — DetailSheet` | Dark | Interaction | Order detail sheet |
| `09.06 — Management / Orders — Light` | Light | Variant | Light mode |

### Flow 10: Management / Users (6 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `10.01 — Management / Users — Default` | Dark | Main | Table: avatar, name, email, role, status + actions |
| `10.02 — Management / Users — Loading` | Dark | Edge | Skeleton |
| `10.03 — Management / Users — Empty` | Dark | Edge | Chưa có users |
| `10.04 — Management / Users — BulkSelect` | Dark | Interaction | Bulk selection + action bar |
| `10.05 — Management / Users — EditSheet` | Dark | Interaction | Edit user sheet |
| `10.06 — Management / Users — Light` | Light | Variant | Light mode |

### Flow 11: Management / Invoices (5 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `11.01 — Management / Invoices — Default` | Dark | Main | Table: invoice#, customer, date, amount, status |
| `11.02 — Management / Invoices — Loading` | Dark | Edge | Skeleton |
| `11.03 — Management / Invoices — Empty` | Dark | Edge | Chưa có invoices |
| `11.04 — Management / Invoices — DetailSheet` | Dark | Interaction | Invoice detail sheet |
| `11.05 — Management / Invoices — Light` | Light | Variant | Light mode |

### Flow 12: Management / Customers (4 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `12.01 — Management / Customers — Default` | Dark | Main | Table/cards: avatar, name, orders, revenue, last active |
| `12.02 — Management / Customers — Loading` | Dark | Edge | Skeleton |
| `12.03 — Management / Customers — DetailSheet` | Dark | Interaction | Customer detail sheet |
| `12.04 — Management / Customers — Light` | Light | Variant | Light mode |

### Flow 13: Settings / Profile (4 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `13.01 — Settings / Profile — Default` | Dark | Main | Avatar, name, email, bio — read-only view |
| `13.02 — Settings / Profile — EditMode` | Dark | State | Fields editable, Save/Cancel buttons |
| `13.03 — Settings / Profile — SaveLoading` | Dark | Edge | Save button spinner, inputs disabled |
| `13.04 — Settings / Profile — Light` | Light | Variant | Light mode |

### Flow 14: Settings / Notifications (3 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `14.01 — Settings / Notifications — Default` | Dark | Main | Toggle switches cho email, push, in-app categories |
| `14.02 — Settings / Notifications — AllOff` | Dark | Edge | Tất cả toggles tắt + warning banner |
| `14.03 — Settings / Notifications — Light` | Light | Variant | Light mode |

### Flow 15: Settings / Billing (5 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `15.01 — Settings / Billing — Default` | Dark | Main | Current plan card + payment method + invoice history |
| `15.02 — Settings / Billing — PlanComparison` | Dark | State | 3 plan cards side-by-side (Free, Pro, Enterprise) |
| `15.03 — Settings / Billing — PaymentSheet` | Dark | Interaction | Thêm/sửa payment method sheet |
| `15.04 — Settings / Billing — CancelConfirm` | Dark | Edge | Cancel subscription AlertDialog |
| `15.05 — Settings / Billing — Light` | Light | Variant | Light mode |

### Flow 16: Utility / 404 (2 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `16.01 — Utility / 404 — Default` | Dark | Main | "Page not found" + illustration + back button |
| `16.02 — Utility / 404 — Light` | Light | Variant | Light mode |

### Flow 17: Utility / 500 (1 frame)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `17.01 — Utility / 500 — Default` | Dark | Main | "Server error" + retry button |

### Flow 18: Utility / Maintenance (1 frame)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `18.01 — Utility / Maintenance — Default` | Dark | Main | "Under maintenance" + estimated time |

### Flow 19: Edge Cases / Catalog (12 frames)

| Frame Name | Mode | Type | Mô tả |
|------------|------|------|-------|
| `19.01 — Edge Cases / Skeletons — Catalog` | Dark | Catalog | Loading skeletons: KPI card, chart, table rows, form, sidebar, avatar |
| `19.02 — Edge Cases / EmptyStates — Catalog` | Dark | Catalog | Tất cả empty states: products, orders, users, invoices, reports, analytics |
| `19.03 — Edge Cases / Errors — Catalog` | Dark | Catalog | Error card, error toast, form validation, API timeout |
| `19.04 — Edge Cases / Offline — Catalog` | Dark | Catalog | WifiOff banner + reconnect + "Back online" toast |
| `19.05 — Edge Cases / LoadingButtons — Catalog` | Dark | Catalog | Spinner states: Default, Outline, Destructive x sizes |
| `19.06 — Edge Cases / FormValidation — Catalog` | Dark | Catalog | Input error, required missing, email format, password reqs |
| `19.07 — Edge Cases / Toasts — Catalog` | Dark | Catalog | Success, Error, Info, Warning toasts |
| `19.08 — Edge Cases / Dialogs — Catalog` | Dark | Catalog | Delete, Discard, Logout, Bulk delete, Cancel subscription |
| `19.09 — Edge Cases / Pagination — Catalog` | Dark | Catalog | First, middle, last, single, many pages |
| `19.10 — Edge Cases / Tables — Catalog` | Dark | Catalog | Loading, empty, single item, selected, sorted |
| `19.11 — Edge Cases / Dropdowns — Catalog` | Dark | Catalog | Action menu, status change, export options |
| `19.12 — Edge Cases / Sheets — Catalog` | Dark | Catalog | Detail, edit, create, scrollable sheet |

### Flow 20: Responsive (8 frames)

| Frame Name | Size | Mô tả |
|------------|------|-------|
| `20.01 — Responsive / Dashboard — Tablet` | 768x1024 | KPI 2-col, charts stack, sidebar collapsed |
| `20.02 — Responsive / Dashboard — Mobile` | 375x812 | KPI 1-col, hamburger menu, compact charts |
| `20.03 — Responsive / Table — Tablet` | 768x1024 | Table horizontal scroll hoặc card view |
| `20.04 — Responsive / Table — Mobile` | 375x812 | Card view (không table), stacked fields |
| `20.05 — Responsive / Auth — Mobile` | 375x812 | Single column, không có left branding panel |
| `20.06 — Responsive / Settings — Mobile` | 375x812 | Stacked layout, full-width inputs |
| `20.07 — Responsive / Navigation — Mobile` | 375x812 | Hamburger menu open, bottom nav |
| `20.08 — Responsive / Sheet — Mobile` | 375x812 | Full-screen sheet / bottom sheet pattern |

---

## Quy trình làm việc chi tiết (Step-by-step)

> Mỗi bước ghi rõ: ai làm, làm gì, input/output, done criteria.
> Ký hiệu cột "Người thực hiện":
> - **Nhân** = Nhân (bạn) làm trong Figma
> - **Claude** = Claude Code làm (generate code, JSON, content)
> - **Cả hai** = Phối hợp cả Nhân và Claude

---

### Bước 0: Chuẩn bị môi trường

**Mục tiêu**: Sẵn sàng Figma file, plugin, API access để bắt đầu làm việc.

| # | Việc cần làm | Người thực hiện | Chi tiết | Done criteria |
|---|-------------|-----------------|----------|---------------|
| 0.1 | Tạo Figma file | Nhân | Tạo file mới tên "tn - 01" trong Figma team/project | File tồn tại, có thể mở |
| 0.2 | Tạo 11 pages | Nhân | Tạo pages: 🎨 Cover, 📖 How to Use, 👤 Personas & Research, 🔀 User Flows, 🗺️ Sitemap & Features, 🎛️ Tokens, 🔤 Typography, 🎨 Colors, 🧩 Components, 📱 Visual, 📋 Change Log | 11 pages hiển thị trong sidebar |
| 0.3 | Cài plugin "Generate SaaS Template" | Nhân | Mở Figma > Plugins > Development > Import plugin from manifest > Chọn file `tn/plugins/Generate SaaS Template/manifest.json` | Plugin hiện trong menu Plugins > Development |
| 0.4 | Test plugin hoạt động | Nhân | Chạy plugin > paste JSON mẫu bên dưới > Generate > Kiểm tra output | Plugin tạo được frame không lỗi |

**JSON mẫu để test plugin (copy & paste vào plugin):**

```json
{"pageName":"Test","root":{"type":"frame","name":"Test Frame","layout":"vertical","sizing":{"w":400,"h":"hug"},"fill":"background","padding":[32,32,32,32],"gap":16,"children":[{"type":"text","text":"Hello ShopPulse!","style":"sp-h2"},{"type":"text","text":"Plugin is working correctly.","style":"sp-body"},{"type":"frame","name":"Card","layout":"vertical","sizing":{"w":"fill","h":"hug"},"fill":"card","padding":[16,16,16,16],"radius":12,"gap":8,"children":[{"type":"text","text":"Test Card","style":"sp-h4"},{"type":"text","text":"Card content with background color.","style":"sp-caption","fill":"muted-foreground"}]}]}}
```

> Sau khi Generate thành công, xóa page "[Gen] Test" để dọn dẹp.
| 0.5 | Cung cấp Figma API access (optional) | Nhân | Figma > Settings > Personal Access Tokens > Generate token > Chia sẻ với Claude nếu cần truy xuất API | Token hoạt động (test: `curl -H "X-Figma-Token: xxx" https://api.figma.com/v1/me`) |

**Input**: Figma account, plugin source code (`tn/plugins/Generate SaaS Template/`)
**Output**: Figma file với 11 pages + plugin hoạt động

---

### Bước 1: Thiết lập Foundation trong Figma (tự động qua Plugin)

**Mục tiêu**: Tạo toàn bộ Figma Variables, Text Styles, Effect Styles, Icons, Components — tất cả tự động bằng plugin từ JSON specs. **Không copy thủ công từ SprouX.**

**Cách hoạt động**: Claude tạo JSON specs → Nhân paste vào plugin Foundation tab → Generate → plugin tự tạo trong Figma.

**Thứ tự BẮT BUỘC** (dependency chain):

```
Variables → Text Styles → Effects → Icons → Components
   ↓            ↓           ↓         ↓          ↓
 colors      SP/H1..    shadows   Icon/Search  Button uses
 spacing     SP/Body    glass     Icon/Check   all of above
 radius      etc.       etc.      30 icons     (instances + vars)
```

| # | Việc cần làm | Ai | JSON file | Plugin type | Done criteria |
|---|-------------|-----|-----------|-------------|---------------|
| 1.1 | Tạo Variables | Claude → Nhân | `foundation-variables.json` | `foundation-variables` | 107 vars, 4 collections (raw colors, semantic colors, spacing, border radius) |
| 1.2 | Tạo Text Styles | Claude → Nhân | `foundation-text-styles.json` | `foundation-text-styles` | 20 SP/* text styles (H1-H5, Body, Label, KPI, Data, etc.) |
| 1.3 | Tạo Effect Styles | Claude → Nhân | `foundation-effects.json` | `foundation-effects` | 10 styles (5 shadow levels + 4 glass blurs + 1 accent glow) |
| 1.4 | Tạo Icon Components | Claude → Nhân | `foundation-icons.json` | `foundation-icons` | 30 Lucide icons (24×24, stroke=foreground) + showcase frame |
| 1.5 | Tạo UI Components | Claude → Nhân | `foundation-components.json` | `foundation-components` | Button (60 variants) + showcase page. Các component khác tạo riêng từng file |
| 1.6 | Kiểm tra kết quả | Nhân | — | — | Switch Light/Dark → colors đổi, text styles đúng font, icon stroke đổi, Button instances hoạt động |

**Quy trình cho mỗi bước (Nhân thực hiện trong Figma):**
1. Mở plugin → tab **Foundation**
2. Copy nội dung JSON file (từ `figma-specs/` folder)
3. Paste vào textarea → plugin auto-detect type
4. Click **Generate Foundation**
5. Kiểm tra output trong Figma (Variables panel, Styles panel, Assets panel)
6. Nếu lỗi → báo Claude fix JSON → re-generate

**Input**: `art-direction.md`, `design-system.md`, SprouX `index.css` (token values)
**Output**: 4 Variable collections, 20 Text Styles, 10 Effect Styles, 30 Icon Components, Button ComponentSet + Showcase

> **Lưu ý**: Bước này yêu cầu plugin đã nâng cấp (Bước 2). Plugin hiện hỗ trợ 5 foundation types: Variables, Text Styles, Effects, Icons, Components.

---

### Bước 2: Nâng cấp Plugin

**Mục tiêu**: Nâng cấp plugin để hỗ trợ 2 khả năng mới:
1. **Foundation**: Tạo Variables, Text Styles, Effect Styles, Components từ JSON
2. **Multi-frame**: 1 JSON = 1 luồng tính năng (nhiều frames với `roots[]`)

| # | Việc cần làm | Người thực hiện | Chi tiết | Done criteria |
|---|-------------|-----------------|----------|---------------|
| — | **Foundation capabilities** | | | |
| 2.1 | Thêm `doCreateVariables()` | Claude | JSON `foundation-variables` → Variable Collections + Modes (Light/Dark) + cross-collection alias resolution | 4 collections, 107 vars |
| 2.2 | Thêm `doCreateTextStyles()` | Claude | JSON `foundation-text-styles` → Text Styles với `loadFontSafe` weight fallback | 20 text styles |
| 2.3 | Thêm `doCreateEffectStyles()` | Claude | JSON `foundation-effects` → Shadow + Blur styles (blendMode fix, orphan prevention) | 10 effect styles |
| 2.4 | Thêm `doCreateIcons()` | Claude | JSON `foundation-icons` → SVG → Component (`figma.createNodeFromSvg`) + stroke bound to `foreground` variable + showcase grid | 30 icon components |
| 2.5 | Thêm `doCreateComponents()` | Claude | JSON `foundation-components` → ComponentSet (`combineAsVariants`) + showcase page (variant grid, sizes, states, examples). Hỗ trợ: variable binding (fill, stroke, padding, gap, radius), text style linking, compound variant keys, opacity, strokeDash | ComponentSet + showcase |
| — | **Multi-frame capabilities** | | | |
| 2.6 | Update `doGenerate()` cho `roots[]` | Claude | Nếu spec có `roots` (array) → loop render từng root, sắp xếp ngang với gap. Backward compat với `root` (single) | Nhiều frames, gap đúng |
| 2.7 | Thêm `layout` option | Claude | `layout: { direction: "horizontal", gap: 100 }` config sắp xếp frames | Layout param hoạt động |
| 2.8 | Thêm `sectionLabel` option | Claude | Text node phía trên các frames làm section header | Section label hiển thị đúng |
| — | **UI & Testing** | | | |
| 2.9 | Plugin UI: 5 Foundation types | Claude | Tab bar: Variables \| Text Styles \| Effects \| Icons \| Components. Auto-detect type từ JSON | 5 buttons hoạt động |
| 2.10 | Test foundation (all 5 types) | Nhân | Chạy plugin lần lượt: Variables → Text Styles → Effects → Icons → Components | Tất cả elements tồn tại + bound variables |
| 2.11 | Test multi-frame | Nhân | Chạy plugin với `roots: [...]` → kiểm tra frames tạo đúng | Frames đúng số lượng, gap đúng |

**Input**: Hiện tại `code.js`, Figma Plugin API docs
**Output**: Plugin mới support foundation + `roots[]` + `layout` + `sectionLabel`

> **Thứ tự thực hiện**: Làm Bước 2 trước → rồi quay lại Bước 1 (chạy foundation JSONs)

**Plugin chạy như thế nào sau nâng cấp:**
```
1. User mở Figma > Plugins > Development > "Generate SaaS Template"
2. User copy JSON (1 file = 1 flow, ví dụ: flow-01-auth-sign-in.json)
3. Paste vào textarea > Click "Generate"
4. Plugin tự động:
   a. Tạo page "[Gen] Auth — Sign In" (hoặc reuse nếu đã có)
   b. Render frame 01.01 (Default) tại x=0
   c. Render frame 01.02 (Error) tại x=1440+100=1540
   d. Render frame 01.03 (Loading) tại x=3080
   e. Render frame 01.04 (Light) tại x=4620
   f. (Nếu có sectionLabel) Tạo text "Auth / Sign In" phía trên
5. User kiểm tra > chỉnh sửa thủ công nếu cần
6. Lặp lại cho flow tiếp theo
```

---

### Bước 3: Generate JSON Specs

**Mục tiêu**: Claude tạo JSON spec cho mỗi flow. Mỗi file = 1 luồng tính năng đầy đủ (default + edge cases + light variant).

| # | Batch | Files | Số frames | Trạng thái |
|---|-------|-------|-----------|-----------|
| 3.1 | Auth / Sign In | `flow-01-auth-sign-in.json` | 4 | TODO (có 1 spec cũ, cần chuyển sang roots format) |
| 3.2 | Auth / Sign Up | `flow-02-auth-sign-up.json` | 4 | TODO |
| 3.3 | Auth / Forgot Password | `flow-03-auth-forgot-password.json` | 3 | TODO |
| 3.4 | Auth / Onboarding | `flow-04-auth-onboarding.json` | 4 | TODO |
| 3.5 | Dashboard / Overview | `flow-05-dashboard-overview.json` | 8 | TODO |
| 3.6 | Dashboard / Analytics | `flow-06-dashboard-analytics.json` | 6 | TODO |
| 3.7 | Dashboard / Reports | `flow-07-dashboard-reports.json` | 6 | TODO |
| 3.8 | Management / Products | `flow-08-mgmt-products.json` | 8 | TODO |
| 3.9 | Management / Orders | `flow-09-mgmt-orders.json` | 6 | TODO |
| 3.10 | Management / Users | `flow-10-mgmt-users.json` | 6 | TODO |
| 3.11 | Management / Invoices | `flow-11-mgmt-invoices.json` | 5 | TODO |
| 3.12 | Management / Customers | `flow-12-mgmt-customers.json` | 4 | TODO |
| 3.13 | Settings / Profile | `flow-13-settings-profile.json` | 4 | TODO |
| 3.14 | Settings / Notifications | `flow-14-settings-notifications.json` | 3 | TODO |
| 3.15 | Settings / Billing | `flow-15-settings-billing.json` | 5 | TODO |
| 3.16 | Utility / 404 | `flow-16-utility-404.json` | 2 | TODO |
| 3.17 | Utility / 500 | `flow-17-utility-500.json` | 1 | TODO |
| 3.18 | Utility / Maintenance | `flow-18-utility-maintenance.json` | 1 | TODO |
| 3.19 | Edge Cases Catalog | `flow-19-edge-cases.json` | 12 | TODO |
| 3.20 | Responsive | `flow-20-responsive.json` | 8 | TODO |
| | **Tổng** | **20 JSON files** | **~100 frames** | |

**Quy trình cho mỗi JSON file (Claude làm):**
```
1. Đọc React page source code (Read tool)
2. Phân tích component tree: layout, children, text, colors, spacing
3. Chuyển thành JSON spec với format:
   {
     "pageName": "Auth — Sign In",
     "sectionLabel": "01 Auth / Sign In",
     "layout": { "direction": "horizontal", "gap": 100 },
     "roots": [
       { "type": "frame", "name": "01.01 — Auth / Sign In — Default", ... },
       { "type": "frame", "name": "01.02 — Auth / Sign In — Error", ... },
       ...
     ]
   }
4. Lưu file vào tn/products/001-analytics-dashboard/figma-specs/
5. Commit + push
```

**Input**: React page source code (`~/sproux-saas-templates/src/pages/`)
**Output**: 20 JSON files trong `figma-specs/`

---

### Bước 4: Chạy Plugin — Generate Figma Frames

**Mục tiêu**: User chạy plugin cho từng JSON file, tạo frames trong Figma.

**Quy trình cho mỗi batch (Nhân làm trong Figma):**

```
1. Mở Figma file > Chuyển đến page "Visual"
2. Chạy plugin (Plugins > Development > "Generate SaaS Template")
3. Copy nội dung JSON spec từ file (Claude cung cấp path)
4. Paste vào plugin textarea > Click "Generate"
5. Đợi plugin chạy xong (thông báo "Done! Page '...' generated in Xms")
6. Kiểm tra output:
   - Frames có đúng số lượng?
   - Layout có sắp xếp ngang, gap đúng?
   - Text có hiển thị đúng font/size?
   - Colors có bind Variables (đổi mode thì đổi màu)?
   - Components có đúng instance (Button, Input, etc.)?
7. Nếu có lỗi → Báo Claude, cung cấp screenshot nếu cần
8. Claude fix JSON spec → Nhân re-generate
9. Khi OK → Chuyển frames từ page "[Gen] ..." sang page "Visual"
10. Sắp xếp theo layout quy định (xem mục "Sắp xếp màn hình")
11. Lặp lại từ bước 2 cho JSON tiếp theo
```

**Thứ tự chạy (khuyến nghị):**
1. Auth (flow 01-04) — đơn giản nhất, test plugin trước
2. Settings (flow 13-15) — trung bình
3. Management (flow 08-12) — nhiều edge cases
4. Dashboard (flow 05-07) — phức tạp nhất (charts, KPIs)
5. Utility (flow 16-18) — nhanh
6. Edge Cases (flow 19) — catalog
7. Responsive (flow 20) — sizes khác

**Input**: 20 JSON files
**Output**: ~100 frames trong page "Visual"
**Done criteria**: Mỗi frame khớp với React app (sizing, spacing, colors, typography)

---

### Bước 5: Verify & Fix — So sánh Figma vs React app

**Mục tiêu**: Đảm bảo Figma output khớp với React app chạy trên browser.

| # | Việc cần làm | Người thực hiện | Chi tiết | Done criteria |
|---|-------------|-----------------|----------|---------------|
| 5.1 | Mở React app | Nhân | `cd ~/sproux-saas-templates && pnpm dev` > Mở browser localhost | App chạy không lỗi |
| 5.2 | So sánh từng page | Nhân | Mở Figma frame cạnh browser > so sánh visual: layout, spacing, màu sắc, typography, alignment | Không có sai lệch lớn |
| 5.3 | Check Variable binding | Nhân | Figma > switch Light/Dark mode > màu đổi đúng | Light/Dark mode hoạt động |
| 5.4 | Check component instances | Nhân | Click vào Button/Input/Card trong Figma > xác nhận là instance (không phải detached) | 0 detached components |
| 5.5 | Fix JSON specs | Claude | User báo lỗi > Claude sửa JSON > User re-generate | Lỗi được fix |
| 5.6 | Fix thủ công | Nhân | Những chỉnh sửa nhỏ (text, padding) — user làm trực tiếp trong Figma | Output match React app |

**Input**: Figma frames + React app running
**Output**: Tất cả frames verified, khớp với React app

---

### Bước 6: Tạo Documentation Pages

**Mục tiêu**: Tạo nội dung cho pages: Personas, User Flows, Sitemap, Tokens/Typography/Colors/Components showcase, How to Use.

| # | Việc cần làm | Người thực hiện | Chi tiết | Done criteria |
|---|-------------|-----------------|----------|---------------|
| 6.1 | Generate Personas content | Claude | Viết nội dung 6 personas (3 end-user + 3 buyer) + 2 journey maps. Xuất ra file md hoặc JSON spec | File nội dung sẵn sàng |
| 6.2 | Build Personas page | Nhân | Dùng nội dung từ 6.1 > Thiết kế 4 frames trong Figma page "Personas & Research" | 4 frames hoàn chỉnh |
| 6.3 | Generate User Flows content | Claude | Viết 12 flow descriptions với screen sequences. Xuất ra md | File nội dung sẵn sàng |
| 6.4 | Build User Flows page | Nhân | Dùng nội dung từ 6.3 > Thiết kế 12 flow frames trong Figma. Mỗi flow = 1 row các screens nối với nhau bằng arrows | 12 frames hoàn chỉnh |
| 6.5 | Generate Sitemap content | Claude | Viết tree structure + feature matrix | File nội dung sẵn sàng |
| 6.6 | Build Sitemap page | Nhân | 2 frames: sitemap tree + feature comparison table | 2 frames hoàn chỉnh |
| 6.7 | Build Tokens page | Nhân | Showcase: spacing scale, border radius, shadows, glass. Dùng Variables thực tế | Frames trong page "Tokens" |
| 6.8 | Build Typography page | Nhân | Showcase: tất cả SP/* text styles với sample text | Frames trong page "Typography" |
| 6.9 | Build Colors page | Nhân | Showcase: raw palette, semantic tokens (light/dark), chart colors, status colors | Frames trong page "Colors" |
| 6.10 | Build Components page | Nhân | Showcase: Button variants, Input states, Cards, Tables, Badges, Charts, etc. Dùng component instances | Frames trong page "Components" |
| 6.11 | Generate How to Use content | Claude | Viết getting started guide: file overview, customization, Variables guide | File nội dung sẵn sàng |
| 6.12 | Build How to Use page | Nhân | 3-5 frames hướng dẫn | Frames trong page "How to Use" |

**Input**: Product spec, design system doc, React app
**Output**: Tất cả documentation pages có nội dung

---

### Bước 7: Polish & Light Mode

**Mục tiêu**: Thêm light mode variants, chỉnh sửa chi tiết, đảm bảo chất lượng.

| # | Việc cần làm | Người thực hiện | Chi tiết | Done criteria |
|---|-------------|-----------------|----------|---------------|
| 7.1 | Light mode variants | Nhân | Trong page "Visual", duplicate 4+ key frames (Sign In, Overview, Products, Profile) > Switch Variables sang Light mode. Đã có sẵn trong mỗi flow (frame cuối) | 4+ light frames hiển thị đúng |
| 7.2 | Auth illustrations | Cả hai | Tạo/tìm SVG illustration cho left panel auth pages (dashboard mockup, charts decorative) | Auth pages có illustration |
| 7.3 | Layer naming cleanup | Nhân | Kiểm tra mọi frame: không có "Frame 427", "Group 12". Tất cả layers có tên rõ nghĩa | 0 unnamed layers |
| 7.4 | Auto-layout check | Nhân | Mọi frame phải dùng auto-layout. Kiểm tra resize 1440 → 1280 vẫn đúng | Responsive resize hoạt động |
| 7.5 | Variable binding check | Nhân | Mọi color phải bind Variable (không hardcode hex). Kiểm tra: select element > Design panel > color có hiện icon Variable | 0 hardcoded colors |
| 7.6 | Component check | Nhân | Mọi Button/Input/Card phải là instance (không detach). Kiểm tra: select > hiện tên component trong panel | 0 detached instances |

**Input**: Figma file với tất cả frames
**Output**: Figma file polished, clean layers, Variables bound

---

### Bước 8: Cover & Change Log

**Mục tiêu**: Tạo trang bìa và change log — hoàn tất file.

| # | Việc cần làm | Người thực hiện | Chi tiết | Done criteria |
|---|-------------|-----------------|----------|---------------|
| 8.1 | Tạo Cover page | Nhân | Frame 1600x1200: product title "ShopPulse — Analytics Dashboard", mockup screenshots (dashboard + auth), badges ("140+ Screens", "Dark & Light Mode", "Figma Variables", "Auto-Layout", "SprouX DS"), version "v1.0", "BredarStudio" branding | Cover frame hoàn chỉnh |
| 8.2 | Generate Change Log | Claude | Viết nội dung: Version 1.0, release date, feature list, credits, **third-party licenses** | Content sẵn sàng |
| 8.3 | Build Change Log page | Nhân | 1 frame với change log content | Frame hoàn chỉnh |

**Input**: Screenshots từ Figma, branding assets
**Output**: Cover + Change Log pages hoàn chỉnh

---

### Third-Party Licenses & Credits (BẮT BUỘC cho sản phẩm bán)

Nội dung sau PHẢI xuất hiện trong **📖 How to Use** page VÀ **📋 Change Log** page:

```
Credits & Licenses
──────────────────

Icons: Lucide Icons (https://lucide.dev)
License: ISC License
Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022
as part of Feather (MIT License).
All other copyright for Lucide are held by Lucide Contributors 2022-present.

Fonts: Plus Jakarta Sans (OFL), Inter (OFL), JetBrains Mono (OFL)
All fonts are licensed under the SIL Open Font License 1.1.
```

> **Lưu ý**: ISC License yêu cầu giữ copyright notice trong tất cả bản copies.
> Các font OFL cho phép bán kèm sản phẩm, không cần trả phí.
> Cần ghi credit trong: Figma file, UI8 product description, README nếu có.

---

### Bước 9: Quality Check cuối cùng

**Mục tiêu**: Kiểm tra toàn diện trước khi chuyển sang Phase 8 (Package).

| # | Hạng mục kiểm tra | Tiêu chí | Pass? |
|---|-------------------|----------|-------|
| 9.1 | Frame count | >= 136 frames | [ ] |
| 9.2 | Naming convention | Tất cả frames theo format `XX.XX — Feature / Screen — State` | [ ] |
| 9.3 | Page structure | 11 pages đúng tên, đúng nội dung | [ ] |
| 9.4 | Variables binding | 100% colors dùng Variable (0 hardcoded) | [ ] |
| 9.5 | Light/Dark mode | Switch mode → tất cả frames đổi màu đúng | [ ] |
| 9.6 | Text Styles | 100% text dùng SP/* styles (0 freestyle text) | [ ] |
| 9.7 | Component instances | 0 detached components | [ ] |
| 9.8 | Auto-layout | 100% frames dùng auto-layout | [ ] |
| 9.9 | Layer naming | 0 "Frame 123", "Group 45" | [ ] |
| 9.10 | Responsive | Resize 1440 → 1280 không vỡ layout | [ ] |
| 9.11 | Visual match | Figma output khớp với React app | [ ] |
| 9.12 | Edge cases | Tất cả edge cases có frame: skeleton, empty, error, offline | [ ] |
| 9.13 | Documentation | Personas, User Flows, Sitemap, DS pages đầy đủ | [ ] |
| 9.14 | Cover | Cover page có mockup, badges, branding | [ ] |

**Tất cả 14 hạng mục PASS → Phase 7 DONE → Chuyển sang Phase 8 (Package)**

---

## JSON Spec — 1 file = 1 frame hay 1 luồng?

### Hiện tại: 1 JSON = 1 frame

Plugin hiện tại đọc 1 `root` node và render thành 1 frame duy nhất trong Figma.

```json
{
  "pageName": "Auth — Sign In",
  "root": {
    "type": "frame",
    "name": "01.01 — Auth / Sign In — Default",
    "children": [...]
  }
}
```

### Đề xuất nâng cấp: 1 JSON = 1 luồng (nhiều frames)

Có thể nâng cấp plugin để support `roots` (mảng nhiều frames):

```json
{
  "pageName": "Auth — Sign In",
  "roots": [
    {
      "type": "frame",
      "name": "01.01 — Auth / Sign In — Default",
      "children": [...]
    },
    {
      "type": "frame",
      "name": "01.02 — Auth / Sign In — Error",
      "children": [...]
    },
    {
      "type": "frame",
      "name": "01.03 — Auth / Sign In — Loading",
      "children": [...]
    },
    {
      "type": "frame",
      "name": "01.04 — Auth / Sign In — Light",
      "children": [...]
    }
  ],
  "layout": {
    "direction": "horizontal",
    "gap": 100
  }
}
```

**Lợi ích**: 1 JSON file = toàn bộ 1 flow, plugin tự sắp xếp ngang, tiết kiệm thời gian.
**Cần làm**: Sửa `doGenerate()` trong code.js để loop qua `roots[]` và đặt vị trí `x += frameWidth + gap`.

### Khuyến nghị

**Dùng cách mới (1 JSON = 1 flow)** vì:
- Gom tất cả states của 1 feature vào 1 file, dễ quản lý
- Plugin tự sắp xếp layout (không cần user kéo tay)
- Naming convention tự động đúng theo `roots` order
- Giảm số lần copy-paste (1 lần thay vì 4-8 lần per flow)

---

## Tiến độ hiện tại

### Đã hoàn thành
- [x] Plugin `code.js` updated: Plus Jakarta Sans, JetBrains Mono, 50+ sp-* font mappings
- [x] 5 JSON specs Auth cũ (format `root` đơn, cần chuyển sang `roots[]` format mới)
- [x] Pagination fix across 5 React files (đã commit)
- [x] Phase 7 plan hoàn chỉnh (file này)
- [x] Bước 0: Nhân tạo Figma file + cài plugin ✅
- [x] Bước 2: Plugin nâng cấp hoàn tất ✅
  - [x] 2.1 `doCreateVariables()` — tạo Variable Collections từ JSON
  - [x] 2.2 `doCreateTextStyles()` — tạo Text Styles (+ `loadFontSafe` weight fallback)
  - [x] 2.3 `doCreateEffectStyles()` — tạo Effect Styles (blendMode per-type fix)
  - [x] 2.4 `doCreateIcons()` — tạo Icon Components từ SVG (stroke → foreground var) + showcase
  - [x] 2.5 `doCreateComponents()` — tạo ComponentSet + showcase page (variant grid, sizes, states, examples)
  - [x] 2.6 `roots[]` multi-frame support
  - [x] 2.7 `layout.gap` option
  - [x] 2.8 `sectionLabel` option
  - [x] 2.9 Plugin UI: 5 Foundation types (Variables | Text Styles | Effects | Icons | Components)
  - [x] Export Foundation functions (doExportVariables/TextStyles/EffectStyles)
  - [x] `mergeComponentStyles()` — compound key support (`Variant=Default,State=Hover`)
  - [x] Variable binding: fill, stroke, padding, gap, radius (full path support `border radius/lg`)
  - [x] `getRadiusValue()` / `getSpacingValue()` — handle full paths (e.g. `border radius/lg` → 8)
  - [x] `findVar()` — prefix search includes `border radius/`, `semantic colors/`
- [x] Bước 1: Foundation import — Variables, Text Styles, Effects verified ✅ (2026-03-02)
  - [x] 1.1 Variables: 107 vars, 4 collections — import/export roundtrip verified
  - [x] 1.2 Text Styles: 20 styles — all correct (JetBrains Mono SemiBold → Bold fallback)
  - [x] 1.3 Effect Styles: 10 styles — all correct

### Đang làm (2026-03-02)
- [ ] 1.4 Icons: `foundation-icons.json` sẵn sàng (30 icons) — chờ Nhân chạy plugin ← **TIẾP THEO**
- [ ] 1.5 Components: `foundation-components.json` sẵn sàng (Button 60 variants) — chờ Icons xong trước
- [ ] 1.6 Kiểm tra toàn bộ foundation

### Đang chờ
- [ ] Bước 3: Generate flow JSON specs (20 flows, ~100 frames)
- [ ] Bước 4-9: Chưa bắt đầu

## Tổng frame count

| Page | Min | Max |
|------|-----------------|-----|
| Cover | 1 | 1 |
| How to Use | 3 | 5 |
| Personas & Research | 4 | 4 |
| User Flows | 12 | 12 |
| Sitemap & Features | 2 | 2 |
| Tokens | 3 | 4 |
| Typography | 1 | 2 |
| Colors | 3 | 4 |
| Icons | 1 | 2 |
| Components | 6 | 10 |
| Visual — Auth (Flows 01-04) | 15 | 15 |
| Visual — Dashboard (Flows 05-07) | 20 | 20 |
| Visual — Management (Flows 08-12) | 29 | 29 |
| Visual — Settings (Flows 13-15) | 12 | 12 |
| Visual — Utility (Flows 16-18) | 4 | 4 |
| Visual — Edge Cases (Flow 19) | 12 | 12 |
| Visual — Responsive (Flow 20) | 8 | 8 |
| Change Log | 1 | 1 |
| **Tổng** | **137** | **147** |
