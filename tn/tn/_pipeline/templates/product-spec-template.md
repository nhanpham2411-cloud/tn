# Product Spec: {Tên Template}

> Version: 1.0
> Ngày: YYYY-MM-DD
> Dựa trên research: `research.md`

---

## 1. Overview

**Product name**: BredarStudio — {Tên}
**Tagline**: (1 câu, ≤ 10 words)
**Description**: (2-3 câu mô tả sản phẩm)
**Target screens**: {số}
**Estimated price**: ${số}
**Style direction**: (tham chiếu từ research.md — ví dụ: "Minimal clean + glassmorphism cards")

---

## 2. User Personas

### End User Persona 1 (Primary): {Tên — Vai trò}

| Attribute | Detail |
|-----------|--------|
| **Tên & vai trò** | (ví dụ: "Minh — Marketing Manager") |
| **Demographics** | Tuổi, chức vụ, công ty size |
| **Tech savviness** | Beginner / Intermediate / Advanced |
| **Thiết bị** | Desktop primary / Tablet / Mobile |
| **Frequency** | Hàng ngày / Hàng tuần / Thỉnh thoảng |

**Goals**:
- [ ]
- [ ]

**Frustrations**:
- [ ]
- [ ]

**Daily tasks trên app**:
- [ ]
- [ ]

**Key screens sử dụng nhiều nhất**:
- [ ]
- [ ]

### End User Persona 2: {Tên — Vai trò}

| Attribute | Detail |
|-----------|--------|
| **Tên & vai trò** | |
| **Demographics** | |
| **Tech savviness** | |
| **Thiết bị** | |
| **Frequency** | |

**Goals**:
- [ ]

**Frustrations**:
- [ ]

**Daily tasks**:
- [ ]

### End User Persona 3 (optional): {Tên — Vai trò}

(tương tự format trên)

---

### Buyer Persona 1 (Primary): {Tên — Vai trò}

| Attribute | Detail |
|-----------|--------|
| **Who** | (ví dụ: "Startup founder building MVP") |
| **Budget** | $XX — $XX |
| **Decision criteria** | (screens count, dark mode, code quality, Figma quality...) |
| **Use case** | (MVP nhanh, reference design, client project...) |
| **Pain with alternatives** | |

### Buyer Persona 2: {Tên — Vai trò}

| Attribute | Detail |
|-----------|--------|
| **Who** | |
| **Budget** | |
| **Decision criteria** | |
| **Use case** | |
| **Pain with alternatives** | |

### Buyer Persona 3 (optional): {Tên — Vai trò}

(tương tự format trên)

---

## 3. User Journey Maps

### Journey: {Primary Persona} — Từ Sign Up đến Daily Use

| Stage | Actions | Touchpoints (Screens) | Emotions | Pain Points | Opportunities |
|-------|---------|----------------------|----------|-------------|---------------|
| **Onboarding** | Sign up, setup profile, invite team | Sign Up, Onboarding | Excited → Impatient | Too many steps? | Quick start option |
| **First Use** | Explore dashboard, view sample data | Dashboard Overview | Curious → Confused? | Where to look first? | Guided tour, clear KPIs |
| **Daily Use** | Check KPIs, review data, take action | Dashboard, Lists, Detail | Confident → Efficient | Repetitive clicks? | Shortcuts, filters saved |
| **Advanced Use** | Custom reports, settings, bulk actions | Reports, Settings | Power user → Satisfied | Missing features? | Export, API |

**"Aha" moment**: (ví dụ: "Khi thấy dashboard load data chart đầu tiên — nhận ra giá trị của data visualization")
**Friction points**: (ví dụ: "Onboarding 3 steps có thể skip được không?")
**Delight moments**: (ví dụ: "Smooth dark mode transition, animated chart loading")

### Journey: {Persona 2} (optional)

(tương tự format trên)

---

## 4. Sitemap & Navigation

### Sitemap

```
Root (/)
├── Auth (no sidebar)
│   ├── /auth/sign-in
│   ├── /auth/sign-up
│   ├── /auth/forgot-password
│   └── /auth/onboarding
├── Dashboard (sidebar layout)
│   ├── /dashboard              ← Overview / Landing
│   ├── /dashboard/analytics
│   └── /dashboard/reports
├── Management
│   ├── /management/users
│   ├── /management/users/:id
│   ├── /management/products
│   ├── /management/orders
│   ├── /management/orders/:id
│   └── /management/invoices
├── Settings
│   ├── /settings/general
│   ├── /settings/notifications
│   └── /settings/billing
└── Utility
    └── * (404)
```

**Total screens**: {số}

### Navigation Model

| Type | Implementation | Details |
|------|---------------|---------|
| **Primary nav** | Sidebar | Icon + label, collapsible (Cmd+B), groups: Main / Management / Settings |
| **Secondary nav** | Tabs | Within pages (ví dụ: User Profile tabs) |
| **Contextual nav** | Breadcrumbs | Home > Section > Page > Detail |
| **Quick actions** | Command palette | Cmd+K → search pages, actions |
| **User menu** | Avatar dropdown | Profile, Settings, Theme toggle, Logout |

### Breadcrumb Structure

| Route | Breadcrumb |
|-------|------------|
| /dashboard | Dashboard |
| /dashboard/analytics | Dashboard > Analytics |
| /management/users | Management > Users |
| /management/users/:id | Management > Users > {User Name} |
| /settings/general | Settings > General |

### Cross-linking Map

| From Screen | Links To | Trigger |
|-------------|---------|---------|
| Orders list | Order Detail | Click order ID |
| Order Detail | User Profile | Click customer name |
| Dashboard Overview | Analytics | Click "View details" on KPI |
| Users list | User Profile | Click user row |

---

## 5. User Flows

### Flow 1: Authentication

```
[Sign In Page] → (Enter email + password) → (Submit)
    ├── ✅ Valid → [Dashboard Overview]
    └── ❌ Invalid → (Show error inline) → [Sign In Page]

[Sign In Page] → (Click "Forgot Password") → [Forgot Password]
    → (Enter email) → (Submit) → (Success message) → [Sign In Page]

[Sign In Page] → (Click "Sign Up") → [Sign Up Page]
    → (Fill form) → (Submit)
    ├── ✅ Valid → [Onboarding Step 1]
    └── ❌ Validation error → (Show inline errors)
```

**Entry**: /auth/sign-in
**Happy path**: Enter credentials → Dashboard
**Error paths**: Invalid credentials, validation errors, network error
**Exit**: /dashboard

### Flow 2: Onboarding Wizard

```
[Onboarding Step 1: Company Info]
    → (Fill company name, size, industry) → (Next)
    → [Step 2: Invite Team]
    → (Add team emails or Skip) → (Next)
    → [Step 3: Preferences]
    → (Select theme, notifications) → (Complete)
    → [Dashboard Overview]
```

**Entry**: After sign-up
**Happy path**: Complete 3 steps → Dashboard
**Skip path**: User can skip any step → still reaches Dashboard

### Flow 3: Primary Task — {mô tả task chính}

```
[Dashboard Overview] → (Click metric/KPI card) → [Analytics Detail]
    → (Apply date range filter) → (View charts) → (Click data point)
    → [Detail View / Drill-down]
```

**Entry**: /dashboard
**Happy path**: Overview → Drill down → Insights
**Error paths**: No data → Empty state with CTA

### Flow 4: CRUD — {entity name}

```
[List Page] → (Click "Add New") → [Create Dialog/Form]
    → (Fill fields) → (Save)
    ├── ✅ Success → (Toast "Created") → [Updated List]
    └── ❌ Validation → (Inline errors)

[List Page] → (Click row) → [Detail Page]
    → (Click "Edit") → [Edit Dialog/Form]
    → (Modify fields) → (Save)
    ├── ✅ Success → (Toast "Updated") → [Detail Page]
    └── ❌ Error → (Error message)

[List Page] → (Select rows) → (Click "Delete") → [Confirm Dialog]
    ├── Confirm → (Toast "Deleted") → [Updated List]
    └── Cancel → [List Page]
```

### Flow 5: Search & Filter

```
[List Page] → (Type in search) → (Results filter real-time)
    → (Click filter dropdown) → (Select options) → (Results update)
    → (Click "Clear filters") → [Full list]
```

### Flow 6: Settings

```
[Sidebar] → (Click "Settings") → [Settings General]
    → (Edit profile fields) → (Click "Save")
    ├── ✅ → (Toast "Settings saved")
    └── ❌ Validation → (Inline errors)

[Settings General] → (Click "Delete Account" in Danger Zone)
    → [AlertDialog: "Are you sure?"]
    ├── Confirm → (Account deleted) → [Sign In]
    └── Cancel → [Settings General]
```

### Flow 7 (optional): Bulk Actions

```
[List Page] → (Check header checkbox = select all)
    → (Bulk action bar appears) → (Click "Delete Selected")
    → [Confirm Dialog] → Confirm → (Toast "X items deleted")
```

### Flow 8 (optional): Export/Download

```
[Reports Page] → (Click "Export") → (Select format: CSV/PDF/Excel)
    → (Generate) → (Download starts) → (Toast "Downloaded")
```

### Flow 9 (optional): Empty → Populated

```
[List Page — empty] → (Show empty state illustration)
    → (Click CTA "Create your first {item}")
    → [Create Dialog] → (Fill & Save) → [List with 1 item]
```

---

## 6. Wireframes & Layout Patterns

### Layout Patterns Used

| Pattern | Screens | Structure |
|---------|---------|-----------|
| **Dashboard** | Overview, Analytics | KPI cards row → Charts section → Recent table |
| **List** | Users, Products, Orders, Invoices | Page header + filters → Table → Pagination |
| **Detail** | User Profile, Order Detail | Header info → Tabs/Sections → Actions |
| **Form** | Settings General, Notifications | Section cards → Form fields → Save button |
| **Auth** | Sign In, Sign Up, Forgot Password | Centered card → Logo → Form → Links |
| **Wizard** | Onboarding | Step indicator → Form content → Next/Back |
| **Utility** | 404, Empty State | Centered → Icon → Title → Description → CTA |

### Wireframe References

- [ ] Wireframes lưu tại `wireframes/layouts/`
- [ ] Flow diagrams lưu tại `wireframes/flows/`

---

## 7. Screen Specifications

### Auth

| # | Screen | Route | Layout | Components | Data | Actions | States |
|---|--------|-------|--------|------------|------|---------|--------|
| 1 | Sign In | /auth/sign-in | Auth | Card, Input, Button, Checkbox | — | Submit, Social login, Navigate | Default, Validation error, Loading |
| 2 | Sign Up | /auth/sign-up | Auth | + Progress, Password strength | — | Submit, Navigate | Default, Validation, Loading |
| 3 | Forgot Password | /auth/forgot-password | Auth | Input, Button | — | Submit | Default, Success, Error |
| 4 | Onboarding | /auth/onboarding | Auth | Wizard, RadioGroup, Select, Input | — | Next, Back, Skip | Step 1/2/3, Loading |

### Dashboard

| # | Screen | Route | Layout | Components | Data | Actions | States |
|---|--------|-------|--------|------------|------|---------|--------|
| 1 | | | Dashboard | | | | |
| 2 | | | Dashboard | | | | |
| 3 | | | Dashboard | | | | |

### Management

| # | Screen | Route | Layout | Components | Data | Actions | States |
|---|--------|-------|--------|------------|------|---------|--------|
| 1 | | | List | | | | |
| 2 | | | Detail | | | | |
| 3 | | | List | | | | |
| 4 | | | List | | | | |
| 5 | | | Detail | | | | |
| 6 | | | List | | | | |

### Settings

| # | Screen | Route | Layout | Components | Data | Actions | States |
|---|--------|-------|--------|------------|------|---------|--------|
| 1 | | | Form | | | | |
| 2 | | | Form | | | | |
| 3 | | | Form | | | | |

### Utility

| # | Screen | Route | Layout | Components | Data | Actions | States |
|---|--------|-------|--------|------------|------|---------|--------|
| 1 | 404 | * | Utility | Button | — | Go back, Go home | Default |

---

## 8. Component Inventory

### SprouX Components Used

(check all that apply)

**Layout**: [ ] Sidebar [ ] Sheet [ ] Dialog [ ] Drawer [ ] Tabs
**Data Display**: [ ] Table [ ] Card [ ] Badge [ ] Avatar [ ] Separator [ ] AspectRatio
**Data Input**: [ ] Input [ ] Select [ ] Checkbox [ ] RadioGroup [ ] Switch [ ] Textarea [ ] Slider
**Feedback**: [ ] Alert [ ] AlertDialog [ ] Toast/Sonner [ ] Progress [ ] Skeleton
**Navigation**: [ ] Breadcrumb [ ] Pagination [ ] DropdownMenu [ ] Command [ ] NavigationMenu
**Form**: [ ] Form [ ] Label [ ] Calendar [ ] DatePicker [ ] Popover
**Other**: [ ] Accordion [ ] Collapsible [ ] Tooltip [ ] Toggle [ ] ToggleGroup [ ] ScrollArea

**Coverage**: {X}/47 components used

### Custom Components Needed

| Component | Purpose | Based on | Screens Used |
|-----------|---------|----------|-------------|
| Chart (Line/Bar/Area/Donut) | Data visualization | Recharts + SprouX tokens | Dashboard pages |
| Data Table | Reusable table with sort/filter/paginate | SprouX Table | List pages |
| Page Header | Title + description + action buttons | — | All pages |
| KPI Card | Metric + change % + icon | SprouX Card | Dashboard |
| Empty State | Illustration + message + CTA | — | List pages |
| Confirm Dialog | Destructive action confirmation | SprouX AlertDialog | CRUD pages |
| | | | |
| | | | |

---

## 9. UI States & Edge Cases

### Empty States

| Screen | Type | Trigger | Icon/Illustration | Message | CTA |
|--------|------|---------|-------------------|---------|-----|
| Users list | No results | Filter returns 0 | Search icon | "No users found matching your filters." | "Clear filters" |
| Users list | First time | No users yet | Users icon | "No users yet" | "Invite your first user" |
| | | | | | |
| | | | | | |

### Loading States

| Screen | Skeleton Areas | Strategy |
|--------|---------------|----------|
| Dashboard Overview | KPI cards (4) + Charts (2) + Table rows (5) | Skeleton → fade in |
| Users list | Table header + rows (10) | Skeleton rows |
| | | |

### Error States

| Error | Screen | UI Treatment | Recovery Action |
|-------|--------|-------------|-----------------|
| 404 | Not Found page | Full-page centered | Go back / Go home |
| Network error | Any | Toast error | Retry button |
| Validation | Forms | Inline field errors | Fix and resubmit |
| Permission denied | Protected pages | Full-page message | Contact admin |

### Overflow & Edge Cases

| Case | Screen | Handling |
|------|--------|---------|
| Long user name | Tables, Profile | Truncate with ellipsis + tooltip |
| 0 items | List pages | Empty state component |
| 1000+ items | List pages | Paginated (10/page), server-side in real app |
| Long description | Cards | Line clamp (2-3 lines) |

---

## 10. Responsive Behavior

| Breakpoint | Sidebar | Grid | Cards | Table | Charts | Dialogs |
|------------|---------|------|-------|-------|--------|---------|
| 1440px (Desktop L) | Full expanded | 4 cols | Side-by-side | Full columns | Full size | Modal centered |
| 1024px (Desktop S) | Collapsible | 3 cols | 2 per row | All columns | Slightly smaller | Modal centered |
| 768px (Tablet) | Sheet overlay | 2 cols | Stacked | H-scroll / Cards | Stacked | Full width modal |
| 375px (Mobile) | Sheet overlay | 1 col | Full width | Card view | Full width | Full screen |

### Component-specific Responsive

| Component | Desktop | Tablet | Mobile |
|-----------|---------|--------|--------|
| Sidebar | Expanded / Collapsed | Sheet | Sheet |
| Data Table | Full table | H-scroll | Card per row |
| KPI Cards | 4 in row | 2×2 grid | Stacked |
| Charts | Side by side | Stacked | Full width |
| Form sections | 2-column | 2-column | 1-column |
| Dialog | Centered modal | Centered modal | Full screen via Drawer |

---

## 11. Content & Tone

### Tone of Voice
- **Overall**: (Professional / Friendly / Technical / Casual)
- **Headings**: (Clear and direct — ví dụ: "Dashboard Overview", not "Welcome to your dashboard!")
- **Actions**: (Imperative — ví dụ: "Save changes", "Delete user", "Export report")
- **Errors**: (Helpful — ví dụ: "Invalid email address. Please enter a valid email.")
- **Empty states**: (Encouraging — ví dụ: "No orders yet. Create your first order to get started.")

### Naming Conventions

| Concept | Consistent Name | NOT |
|---------|----------------|-----|
| (ví dụ: Users) | "Users" | "Members", "Team", "People" |
| | | |
| | | |
| | | |

---

## 12. Mock Data Requirements

| Data File | Records | Key Fields | Relationships |
|-----------|---------|------------|---------------|
| users.ts | 50-100 | name, email, role, status, avatar, plan, createdAt | → Orders, Invoices |
| orders.ts | 100 | id, items[], total, status, customer, paymentMethod, date | → Users, Products |
| products.ts | 30 | name, price, category, stock, status, rating, image | → Orders |
| invoices.ts | 50 | id, amount, tax, total, status, dueDate, paidAt | → Users |
| kpi.ts | — | revenue, users, orders, conversion (with change %) | — |
| chart-data.ts | 12 months | revenue, dailyUsers, trafficSources, usersByPlan | — |
| navigation.ts | — | sidebar items, groups, icons, routes | — |

### Data Quality Rules
- [ ] Tên người thực tế (không dùng "John Doe" lặp lại)
- [ ] Email follow pattern: firstname@domain.com
- [ ] Số liệu hợp lý (revenue tháng sau > tháng trước = growth story)
- [ ] Status distribution đa dạng (không 100% active)
- [ ] Dates trong 12 tháng gần nhất
- [ ] Avatars: dùng UI Faces hoặc placeholder initials

---

## 13. Tech Decisions

- **Routing**: react-router-dom
- **Charts**: Recharts (if dashboard has charts)
- **Forms**: react-hook-form + zod (if complex forms)
- **Date handling**: date-fns (if date picker/calendar needed)
- **Other**:

---

## 14. Build Phases

| Phase | Scope | Screens | Est. Days |
|-------|-------|---------|-----------|
| A | Layout shell (sidebar, header, routing, dark mode) | — | 1 |
| B | Auth pages | 4 | 1 |
| C | Dashboard pages + charts | 3 | 2 |
| D | Management pages (CRUD) | 6 | 3 |
| E | Settings pages | 3 | 1 |
| F | Utility + polish (404, skeletons, error boundary) | 1+ | 1 |
| **Total** | | **~{số}** | **~9** |

---

## 15. Spec Review Checklist

- [ ] Mọi screen trong sitemap đều có trong Screen Specifications (section 7)?
- [ ] Mọi flow đều có screens tương ứng?
- [ ] Mọi data entity đều có screens hiển thị?
- [ ] Mọi edge case (empty, loading, error) đều đã planned?
- [ ] Mọi cross-link đều có screens 2 chiều?
- [ ] Component inventory covers tất cả screens?
- [ ] Responsive behavior defined cho mọi component type?
- [ ] Content tone nhất quán xuyên suốt?
- [ ] Build phases đã ước lượng thời gian hợp lý?
