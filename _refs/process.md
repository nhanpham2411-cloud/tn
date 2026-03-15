# BredarStudio — SaaS Template Production Process

> Process A→Z để xây dựng SaaS UI templates bán trên UI8, Gumroad, và các marketplace khác.
> Sử dụng SprouX Design System làm nền tảng component, tạo Design System riêng cho mỗi sản phẩm.

---

## Tổng quan Pipeline

```
[1. Research] → [2. UX & Spec] → [3. Art Direction] → [4. Design System] → [5. Build App] → [6. Review] → [6.5. Test] → [7. Figma Gen] → [8. Polish] → [9. Package] → [10. Publish] → [11. Post-launch]
```

Mỗi sản phẩm (product) đi qua 11 giai đoạn + 1 giai đoạn test (6.5). Mỗi giai đoạn có checklist rõ ràng, deliverable cụ thể.

> **QUAN TRỌNG**: Mỗi SaaS app template là dự án HOÀN TOÀN ĐỘC LẬP với SprouX. SprouX chỉ là nền tảng để fork — KHÔNG được chỉnh sửa gì bên SprouX khi làm việc với SaaS app.

---

## Cấu trúc thư mục

```
BredarStudio_Templates/
├── _pipeline/
│   ├── process.md                          ← File này
│   ├── competitor-analysis/                ← Phân tích đối thủ (chung)
│   │   └── ui8-analysis.md
│   └── templates/                          ← Template dùng chung cho mọi product
│       ├── market-research-template.md
│       ├── product-spec-template.md
│       ├── design-system-template.md
│       ├── quality-checklist.md
│       └── marketplace-listing-template.md
├── plugins/
│   └── Generate SaaS Template/            ← Figma plugin
│       ├── code.js
│       └── manifest.json
├── products/
│   └── {NNN}-{tên-product}/               ← Mỗi sản phẩm 1 thư mục
│       ├── research.md                     ← Giai đoạn 1
│       ├── product-spec.md                 ← Giai đoạn 2
│       ├── art-direction.md                ← Giai đoạn 3
│       ├── design-system.md                ← Giai đoạn 4
│       ├── saas-app/                       ← Giai đoạn 5 (React app hoặc symlink)
│       ├── review-notes.md                 ← Giai đoạn 6
│       ├── figma-specs/                    ← Giai đoạn 7 (JSON specs cho plugin)
│       ├── wireframes/                     ← Wireframes/sketches
│       ├── preview-images/                 ← Giai đoạn 9
│       ├── listing/                        ← Giai đoạn 10
│       │   ├── ui8.md
│       │   └── gumroad.md
│       └── STATUS.md                       ← Trạng thái hiện tại
├── common-mistakes.md                     ← Training reference — 33 bài học tránh lặp lỗi
└── README.md
```

---

## Tài liệu tham chiếu chung

> **BẮT BUỘC đọc** trước khi bắt đầu Phase 5 trở đi.

| File | Mục đích | Khi nào đọc |
|------|----------|-------------|
| `common-mistakes.md` | 33 bài học phân theo 5 danh mục (Figma Plugin, JSON Spec, Component Docs, Design Token, Workflow) | Trước MỌI phase — tránh lặp lỗi |
| `_refs/component-docs-pattern.md` | 10-section pattern chuẩn cho component documentation + Group+Item tabbed pattern với instance sync rule | Trước Phase 7b (Design System Page) |
| `_pipeline/templates/quality-checklist.md` | Checklist quality trước khi publish | Phase 6, 6.5, 9 |

---

## Giai đoạn 1: Market Research (2-3 ngày)

### Mục tiêu
Xác định loại SaaS app nào có nhu cầu thị trường cao, giải quyết bài toán thực tế cho người dùng, tạo ra giá trị rõ ràng cho doanh nghiệp, và phù hợp với SprouX DS.

### Quy trình

#### A. Nghiên cứu thị trường SaaS & nhu cầu thực tế

1. **Xác định ngành/lĩnh vực SaaS có thể thâm nhập**
   - Phân loại các nhóm SaaS phổ biến:
     - **Operations**: Analytics Dashboard, Project Management, Inventory, HR/Payroll
     - **Sales & Marketing**: CRM, Email Marketing, Social Media, Landing Page Builder
     - **Finance**: Billing/Invoicing, Expense Tracker, Accounting, Payment Gateway
     - **Developer Tools**: API Management, CI/CD Dashboard, Log Viewer, Feature Flags
     - **Customer-facing**: Helpdesk/Support, Knowledge Base, Booking/Scheduling
     - **E-commerce**: Admin Panel, Order Management, Marketplace Dashboard
     - **Education**: LMS Dashboard, Student Portal, Course Builder
     - **Healthcare**: Clinic Management, Telemedicine, Patient Portal
   - Đánh giá mỗi ngành theo 3 tiêu chí:
     - **Demand**: Bao nhiêu startup/doanh nghiệp cần?
     - **Complexity**: Bao nhiêu screens cần? Phù hợp scale của template?
     - **SprouX fit**: Components hiện tại cover được bao nhiêu %?

2. **Hiểu nhu cầu người dùng cuối (End Users)**
   - Ai là người SỬ DỤNG SaaS app hàng ngày? (admin, manager, team member, customer)
   - Họ cần giải quyết vấn đề gì?
     - Xem dữ liệu nhanh → cần dashboard rõ ràng
     - Quản lý danh sách lớn → cần table mạnh (search, filter, sort, pagination)
     - Thực hiện hành động → cần form/dialog/wizard
     - Theo dõi tiến độ → cần charts, progress, timeline
     - Cấu hình hệ thống → cần settings pages
   - Pain points phổ biến của SaaS users:
     - UI quá phức tạp, learning curve cao
     - Thiếu dark mode, mỏi mắt khi dùng lâu
     - Không responsive, không dùng được trên tablet
     - Data visualization kém, khó đọc insights

3. **Hiểu giá trị cho doanh nghiệp mua template**
   - **Tiết kiệm thời gian**: Template cắt giảm 2-4 tuần design → dev ship nhanh hơn
   - **Chất lượng chuyên nghiệp**: UI consistent, WCAG compliant, production-ready
   - **Giảm chi phí thuê designer**: $79 template vs $5000+ thuê designer
   - **Reference design**: Founders/PMs dùng để communicate ý tưởng với dev team
   - **Figma-to-Code bridge**: Design handoff rõ ràng, giảm friction design↔dev
   - **Ghi rõ value proposition cho từng buyer persona**:
     - Startup founder: "Ship MVP UI trong 1 tuần thay vì 1 tháng"
     - Designer: "Professional starting point, customize theo brand"
     - Developer: "Pixel-perfect reference, biết chính xác cần build gì"
     - Agency: "Reuse across client projects, ROI sau 2-3 projects"

4. **Xác định giá trị sản phẩm tạo ra (Value Framework)**

   | Giá trị | Mô tả | Cách đo lường |
   |---------|-------|---------------|
   | **Time-to-market** | Giảm thời gian từ ý tưởng → UI hoàn chỉnh | Tuần tiết kiệm vs build from scratch |
   | **Design quality** | Consistent, accessible, modern | WCAG AA pass, design system token-driven |
   | **Completeness** | Đủ screens cho real-world SaaS | Số screens, edge cases covered |
   | **Customizability** | Dễ đổi brand, colors, content | Figma Variables, component properties |
   | **Dark mode** | Dual theme sẵn sàng | 100% screens support light + dark |
   | **Responsiveness** | Hoạt động trên mọi device | 4 breakpoints verified |
   | **Real-world ready** | Không phải demo/mockup, mà là production reference | Realistic data, full user flows |

#### B. Phân tích cạnh tranh trên marketplace

5. **Phân tích trending trên marketplace**
   - Duyệt UI8, Gumroad, Creative Market, Envato — filter "SaaS", "Dashboard", "Admin"
   - Ghi nhận: top sellers, giá bán, số reviews, tags phổ biến
   - Dùng file `_pipeline/competitor-analysis/` để lưu

6. **Phân tích xu hướng thiết kế trên Dribbble**
   - Search keywords: "SaaS Dashboard", "Admin Panel", "Analytics UI", "Dashboard Dark Mode"
   - Ghi nhận: visual trends, layout patterns, color palettes đang hot
   - Phân tích top shots (nhiều likes/views nhất):
     - Style nào đang trending? (glassmorphism, neubrutalism, minimal, bento grid...)
     - Color scheme phổ biến? (monochrome, vibrant accent, gradient...)
     - Layout patterns? (sidebar left, top nav, card-based, data-dense...)
     - Chart/data visualization styles?
   - Follow các designers nổi bật trong niche SaaS/Dashboard
   - Lưu inspiration links + screenshots vào `products/{NNN}-{tên}/wireframes/`

#### C. Nghiên cứu phong cách thiết kế & art direction (high-level)

> Sản phẩm bán trên marketplace cần visual bắt mắt ngay từ thumbnail. Phong cách thiết kế quyết định 70% quyết định click vào xem chi tiết.
>
> **LƯU Ý**: Section này chỉ xác định **hướng đi** (style, mood, direction). Specs chi tiết implementation-ready (hex values, CSS, glassmorphism levels, component patterns...) sẽ được deep dive ở **Giai đoạn 3: Art Direction Deep Dive** — sau khi có product spec (biết rõ screens, components, data types).

7. **Xác định design style phù hợp**
   - Phân tích các phong cách thiết kế hiện đại:
     - **Minimal Clean**: Ít decoration, nhiều white space, typography-driven
     - **Glassmorphism**: Frosted glass effect, blur, transparency layers
     - **Neubrutalism**: Bold borders, raw shapes, high contrast colors
     - **Bento Grid**: Card-based layout kiểu Apple/iOS, rounded corners lớn
     - **3D & Depth**: Shadows nặng, layered elements, perspective
     - **Gradient Rich**: Mesh gradients, color transitions, aurora effects
     - **Dark-first**: Dark mode là primary, light là secondary
     - **Data-dense**: Compact layout, nhiều thông tin trên 1 screen
   - Đánh giá mỗi style theo 4 tiêu chí:
     - **Trend longevity**: Style này sẽ hot bao lâu? (6 tháng / 1 năm / 2+ năm)
     - **Marketplace appeal**: Có bắt mắt trên thumbnail marketplace không?
     - **SprouX compatibility**: SprouX tokens có hỗ trợ style này không?
     - **Build complexity**: Cần effort bao nhiêu để implement?

8. **Nghiên cứu color palette & visual identity**
   - Phân tích color trends trong SaaS UI:
     - Primary accent color nào đang trending? (indigo, violet, emerald, amber...)
     - Neutral palette: warm gray vs cool gray vs true gray?
     - Gradient combinations phổ biến?
     - Chart/data visualization color schemes?
   - Xác định color strategy cho template:
     - Chọn 1 accent color chính (phải nổi bật trên marketplace thumbnail)
     - Light mode: background tones (pure white vs off-white vs warm cream)
     - Dark mode: darkness level (true black vs dark gray vs navy dark)
     - Semantic colors: success/warning/error/info nhất quán

9. **Nghiên cứu typography & visual hierarchy**
   - Font pairing trends:
     - Heading font: geometric sans (Inter, Plus Jakarta) vs rounded (Nunito, Outfit) vs display (Cal Sans, Cabinet Grotesk)?
     - Body font: readability-first (Inter, DM Sans) vs character (General Sans, Satoshi)?
     - Monospace accent: cho code/numbers (JetBrains Mono, Fira Code, SF Mono)?
   - Hierarchy patterns:
     - Font size scale (compact vs spacious)
     - Font weight contrast (light↔black vs regular↔semibold)
     - Letter spacing: tight headings vs normal body

10. **Nghiên cứu visual elements & micro-details**
    - **Cards**: border style (solid / dashed / none), shadow depth, border-radius (8px vs 12px vs 16px)
    - **Charts**: flat vs gradient fills, rounded bars, animated transitions
    - **Icons**: outline vs solid vs duotone, stroke width, corner style
    - **Avatars**: rounded vs squircle, ring/border style, status indicators
    - **Empty states**: illustration style (flat / isometric / 3D / line art)
    - **Hover/interaction**: subtle vs dramatic animations, color shifts, scale effects
    - **Spacing rhythm**: tight (dense data) vs generous (modern minimal)

11. **Tạo mood board & style direction**
    - Thu thập 10-20 screenshots đại diện cho style muốn theo đuổi
    - Nguồn: Dribbble, Behance, Mobbin, Godly, Awwwards, Land-book
    - Tổ chức mood board theo categories:
      - Overall vibe / feel
      - Color palette references
      - Typography examples
      - Component styling (cards, buttons, tables, charts)
      - Dark mode references
    - Lưu tại: `products/{NNN}-{tên}/wireframes/mood-board/`
    - Viết **Style Direction Summary**:
      - Style chính: (ví dụ: "Minimal clean + subtle glassmorphism on cards")
      - Primary accent: (ví dụ: "Indigo-violet gradient")
      - Mood: (ví dụ: "Professional but friendly, data-driven but not overwhelming")
      - Differentiator: (ví dụ: "Warmer tones than competitors, more generous spacing")

12. **Đánh giá visual competitiveness trên marketplace**
    - So sánh style direction với top 5 best-sellers trên UI8:
      - Template mình sẽ nổi bật hay bị lẫn vào đám đông?
      - Thumbnail có đủ contrast để bắt mắt khi scroll?
      - Dark mode screenshots có dramatic enough không?
    - Preview image strategy:
      - Cover image phải "WOW" trong 2 giây đầu tiên
      - Dùng dark mode cho cover (dark mode screenshots luôn bắt mắt hơn trên marketplace)
      - Showcase variety: dashboard + detail page + mobile + components
      - Nền: solid dark / gradient / pattern — tránh plain white

#### D. Tổng hợp & quyết định

13. **Xác định khoảng trống (gap analysis)**
   - Template nào bán chạy nhưng thiếu dark mode?
   - Template nào chỉ có Figma, không có code?
   - Template nào UI cũ (2-3 năm), cần refresh?
   - Dribbble shots nào được like nhiều nhưng không có template bán trên marketplace?
   - Visual trend nào trên Dribbble chưa xuất hiện trên UI8/Gumroad?
   - Ngành SaaS nào có nhu cầu cao nhưng ít template chất lượng?

14. **Chọn niche cụ thể + định nghĩa giá trị**
   - Ví dụ: "Analytics Dashboard", "CRM", "Project Management", "E-commerce Admin"
   - Ưu tiên niche đạt cả 3:
     - Nhu cầu người dùng cao (nhiều SaaS startups trong ngành)
     - Ít sản phẩm chất lượng trên marketplace
     - Trending trên Dribbble (visual demand)
   - Viết rõ: **"Template này giúp [ai] giải quyết [vấn đề gì] bằng cách [cung cấp gì], tiết kiệm [bao nhiêu thời gian/tiền]"**

15. **Viết research document**
   - Dùng template: `_pipeline/templates/market-research-template.md`
   - Lưu tại: `products/{NNN}-{tên}/research.md`

### Deliverable
- `research.md` hoàn chỉnh với: phân tích thị trường, nhu cầu người dùng, giá trị sản phẩm, phong cách thiết kế, đối thủ, pricing strategy
- Mood board lưu tại `wireframes/mood-board/`

### Checklist

**A. Thị trường & giá trị**
- [ ] Đã xác định ngành SaaS và đánh giá tiềm năng (demand, complexity, SprouX fit)
- [ ] Đã phân tích nhu cầu người dùng cuối (pain points, use cases)
- [ ] Đã định nghĩa giá trị sản phẩm tạo ra (value framework)
- [ ] Đã xác định buyer personas và value proposition cho từng persona

**B. Cạnh tranh**
- [ ] Đã duyệt ít nhất 3 marketplace (UI8, Gumroad, Creative Market/Envato)
- [ ] Đã phân tích trending trên Dribbble (top shots, visual trends, layout patterns)
- [ ] Đã phân tích ít nhất 5 đối thủ trực tiếp

**C. Phong cách thiết kế (high-level direction)**
- [ ] Đã xác định design style chính (minimal / glassmorphism / bento / ...)
- [ ] Đã chọn color palette & accent color strategy (hướng đi, chưa cần hex cụ thể)
- [ ] Đã xác định typography direction (heading + body + monospace fonts)
- [ ] Đã phân tích visual elements (cards, charts, icons, spacing rhythm)
- [ ] Đã tạo mood board (10-20 references) lưu tại `wireframes/mood-board/`
- [ ] Đã viết Style Direction Summary (high-level)
- [ ] Đã đánh giá visual competitiveness vs top marketplace sellers
- [ ] Đã xác định preview image strategy (cover dark mode, variety showcase)
> **Note**: Implementation-ready specs (CSS values, hex codes, glassmorphism levels) → xem Giai đoạn 3

**D. Tổng hợp**
- [ ] Đã xác định gap: nhu cầu thị trường + Dribbble trends chưa có trên marketplace
- [ ] Đã viết value statement: "Template này giúp [ai] giải quyết [gì]..."
- [ ] Đã xác định unique selling points (USP)
- [ ] Đã chọn giá bán mục tiêu
- [ ] Inspiration screenshots/links đã lưu
- [ ] Research document đã viết xong

---

## Giai đoạn 2: UX Research & Product Spec (3-5 ngày)

### Mục tiêu
Xây dựng chân dung người dùng chi tiết, thiết kế trải nghiệm người dùng đầy đủ (user journey, user flows, sitemap, wireframes), và định nghĩa chính xác template sẽ có những gì.

### Quy trình

#### A. Chân dung người dùng (User Personas)

1. **Xây dựng End User Personas (người dùng SaaS app)**
   - Tạo 2-4 personas đại diện cho các vai trò khác nhau trong SaaS app
   - Mỗi persona ghi rõ:
     - **Tên & vai trò**: (ví dụ: "Minh — Marketing Manager", "Lan — Data Analyst")
     - **Demographics**: tuổi, chức vụ, trình độ kỹ thuật, thiết bị sử dụng
     - **Goals**: Họ muốn đạt được gì khi dùng SaaS app?
     - **Frustrations**: Điều gì khiến họ khó chịu với tools hiện tại?
     - **Daily tasks**: Họ làm gì hàng ngày trên app? (xem data, tạo report, quản lý team...)
     - **Tech savviness**: Beginner / Intermediate / Advanced
     - **Frequency**: Dùng app bao nhiêu lần/ngày? (power user vs occasional)
     - **Key screens**: Screens nào họ dùng nhiều nhất?
   - Xác định **Primary persona** (người dùng chính mà UI phải tối ưu cho)

2. **Xây dựng Buyer Personas (người mua template)**
   - Tạo 2-3 personas cho người mua template trên marketplace
   - Mỗi persona ghi rõ:
     - **Tên & vai trò**: (ví dụ: "Alex — Startup Founder", "Sarah — UI Designer", "Dev Agency")
     - **Budget**: Sẵn sàng trả bao nhiêu cho template?
     - **Decision criteria**: Chọn template dựa trên gì? (screens count, dark mode, code quality, Figma quality...)
     - **Use case**: Dùng template để làm gì? (MVP nhanh, reference design, client project...)
     - **Pain with alternatives**: Vấn đề với template hiện tại trên marketplace?
   - Xác định **Primary buyer** (target buyer chính để tối ưu messaging + pricing)

#### B. User Journey Mapping

3. **Xây dựng User Journey Maps**
   - Vẽ journey map cho mỗi primary persona, bao gồm:
     - **Stages**: Các giai đoạn sử dụng app (Onboarding → First Use → Daily Use → Advanced Use)
     - **Actions**: Hành động cụ thể ở mỗi giai đoạn
     - **Touchpoints**: Screens/features nào họ tương tác?
     - **Emotions**: Cảm xúc tại mỗi điểm (frustrated / neutral / delighted)
     - **Pain points**: Vấn đề có thể gặp tại mỗi điểm
     - **Opportunities**: Cơ hội cải thiện UX tại mỗi điểm
   - Ví dụ journey cho Analytics Dashboard:
     ```
     Sign Up → Onboarding (setup company) → First Dashboard View → Explore Analytics
     → Create First Report → Share Report → Daily Check Dashboard → Customize Settings
     ```

4. **Xác định key moments & emotional peaks**
   - **"Aha" moment**: Khi nào người dùng nhận ra giá trị của app? (ví dụ: thấy chart đầu tiên load data)
   - **Friction points**: Nơi nào dễ bỏ cuộc? (ví dụ: onboarding quá nhiều bước)
   - **Delight moments**: Nơi nào có thể tạo ấn tượng tốt? (ví dụ: smooth dark mode transition)
   - Ghi chú lại → ưu tiên polish các screens này trong Phase 3 (Art Direction) và Phase 4 (Design System)

#### C. User Flows

5. **Viết User Flows chi tiết**
   - Mỗi flow là 1 chuỗi hành động từ A → B → kết quả
   - **Core flows** (bắt buộc):
     - Authentication flow: Sign Up → Email Verify → Onboarding → Dashboard
     - Sign In flow: Sign In → Dashboard (+ Forgot Password branch)
     - Primary task flow: Dashboard → Drill down → Detail → Action → Confirmation
     - CRUD flow: List → Create/Edit (dialog/page) → Save → Updated List
     - Search & Filter flow: List → Apply Filters → View Results → Clear Filters
     - Settings flow: Navigate → Edit → Save → Confirmation toast
   - **Secondary flows** (nên có):
     - Onboarding wizard: Step 1 → Step 2 → Step 3 → Complete
     - Bulk action flow: Select multiple → Action → Confirm → Result
     - Export/Download flow: Select format → Generate → Download
     - Error recovery: Error state → Retry / Go Back / Contact Support
     - Empty → Populated: Empty state → CTA → Create first item → Populated view
   - Mỗi flow ghi rõ:
     - **Entry point**: Người dùng bắt đầu từ đâu?
     - **Steps**: Từng bước click/input
     - **Decision points**: Điểm rẽ nhánh (if/else)
     - **Happy path**: Kịch bản lý tưởng
     - **Error paths**: Kịch bản lỗi + cách xử lý
     - **Exit point**: Kết thúc ở đâu?

6. **Vẽ flow diagrams**
   - Dùng text-based notation hoặc tool (Excalidraw, FigJam, Miro)
   - Lưu tại: `products/{NNN}-{tên}/wireframes/flows/`
   - Notation:
     ```
     [Screen] → (Action) → [Screen]
     [Screen] → (Action) → {Decision?}
                              ├── Yes → [Screen A]
                              └── No → [Screen B]
     ```

#### D. Sitemap & Information Architecture

7. **Xây dựng Sitemap**
   - Tổ chức toàn bộ screens thành cây navigation
   - Cấu trúc chuẩn cho SaaS app:
     ```
     Root (/)
     ├── Auth (no sidebar)
     │   ├── /auth/sign-in
     │   ├── /auth/sign-up
     │   ├── /auth/forgot-password
     │   └── /auth/onboarding
     ├── Dashboard (sidebar layout)
     │   ├── /dashboard              ← Overview (landing page sau login)
     │   ├── /dashboard/analytics    ← Chi tiết phân tích
     │   └── /dashboard/reports      ← Báo cáo
     ├── Management
     │   ├── /management/users       ← Danh sách (list view)
     │   ├── /management/users/:id   ← Chi tiết (detail view)
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
   - Xác định:
     - **Navigation hierarchy**: Sidebar groups (Main, Management, Settings)
     - **Breadcrumb structure**: Home > Section > Page > Detail
     - **Cross-linking**: Screens nào link đến nhau? (ví dụ: order → user profile)

8. **Thiết kế Navigation Model**
   - **Primary navigation**: Sidebar (icon + label, collapsible)
   - **Secondary navigation**: Tabs trong page (ví dụ: User Profile tabs)
   - **Contextual navigation**: Breadcrumbs, back buttons, related links
   - **Quick actions**: Command palette (Cmd+K), search bar
   - **User menu**: Avatar dropdown → profile, settings, logout
   - Ghi rõ trạng thái navigation:
     - Active state (highlight current page)
     - Hover state
     - Collapsed state (icon-only sidebar)
     - Mobile state (sheet/drawer sidebar)

#### E. Wireframes & Layout

9. **Sketching wireframes (low-fidelity)**
   - Vẽ wireframe cho MỖI screen trong sitemap
   - Focus vào layout structure, KHÔNG focus vào visual:
     - Content blocks đặt ở đâu?
     - Hierarchy thông tin: cái gì quan trọng nhất → nổi bật nhất
     - Grid system: 1-column / 2-column / 3-column / sidebar+content
     - Card layout: stacked vs grid vs list view
   - Tools: paper sketch, Excalidraw, FigJam, hoặc text-based ASCII
   - Lưu tại: `products/{NNN}-{tên}/wireframes/layouts/`

10. **Định nghĩa layout patterns**
    - **Dashboard pattern**: KPI cards row → Charts section → Recent activity table
    - **List pattern**: Page header + filters → Table/grid → Pagination
    - **Detail pattern**: Header info → Tabs → Content sections → Actions
    - **Form pattern**: Section cards → Form fields → Action buttons (bottom)
    - **Settings pattern**: Sidebar nav (settings sections) → Form content → Save
    - **Auth pattern**: Centered card → Logo → Form → Links
    - **Empty state pattern**: Icon/illustration → Title → Description → CTA button
    - Ghi rõ pattern nào dùng cho screen nào

#### F. Content & Data Strategy

11. **Content inventory**
    - Liệt kê mọi text/content cần có trên mỗi screen:
      - Page titles, descriptions, labels
      - Button text, placeholder text
      - Empty state messages, error messages
      - Toast/notification messages
      - Tooltip text
    - Quyết định tone of voice: Professional / Friendly / Technical / Casual
    - Đặt tên features/sections nhất quán (ví dụ: "Users" không phải "Members" rồi "Team")

12. **Mock data strategy**
    - Mỗi data entity cần:
      - **Schema**: fields, types, relationships
      - **Volume**: bao nhiêu records (đủ test pagination)
      - **Variety**: đủ diverse để test filters, edge cases
      - **Realism**: tên, email, số liệu thực tế (KHÔNG dùng Lorem ipsum)
    - Ví dụ data entities:
      | Entity | Records | Key Fields | Relationships |
      |--------|---------|------------|---------------|
      | Users | 50-100 | name, email, role, status, avatar, plan, createdAt | → Orders, Invoices |
      | Orders | 100 | id, items, total, status, customer, date | → Users, Products |
      | Products | 30 | name, price, category, stock, status, rating | → Orders |
      | Invoices | 50 | id, amount, status, dueDate, customer | → Users |

#### G. Edge Cases & States

13. **Định nghĩa UI states cho mọi screen**
    - **Default state**: Data đầy đủ, hoạt động bình thường
    - **Empty state**: Không có data (first-time user hoặc filter không có kết quả)
      - Phân biệt: "No data yet" (first time) vs "No results" (filtered)
      - Mỗi empty state cần: illustration/icon + message + CTA
    - **Loading state**: Đang tải data
      - Skeleton screens (không dùng spinner)
      - Progressive loading: header load trước, content sau
    - **Error state**: Lỗi xảy ra
      - Network error → retry button
      - 404 → go back / home
      - Permission denied → contact admin
      - Validation error → inline field errors
    - **Partial state**: Data một phần (ví dụ: user chưa setup avatar)
    - **Overflow state**: Data quá nhiều (long text truncation, scrollable areas)

14. **Responsive behavior**
    - Định nghĩa layout thay đổi tại mỗi breakpoint:
      | Breakpoint | Sidebar | Grid | Cards | Table | Charts |
      |------------|---------|------|-------|-------|--------|
      | 1440px (Desktop L) | Full (expanded) | 4 cols | Side-by-side | Full width | Full size |
      | 1024px (Desktop S) | Collapsible | 3 cols | 2 per row | Horizontal scroll | Slightly smaller |
      | 768px (Tablet) | Sheet/Drawer | 2 cols | Stacked | Horizontal scroll / Card view | Stacked |
      | 375px (Mobile) | Sheet/Drawer | 1 col | Full width | Card view | Full width, stacked |
    - Quyết định responsive strategy cho từng component type:
      - Tables: horizontal scroll vs card transformation?
      - Charts: resize vs stack vs hide on mobile?
      - Sidebar: collapse to icons vs sheet overlay?
      - Dialogs: modal vs full-screen on mobile?

#### H. Screen Specifications & Component Mapping

15. **Liệt kê chi tiết tất cả screens**
    - Chia theo nhóm: Auth, Dashboard, Management, Settings, Utility
    - Mỗi screen ghi rõ:
      - **Mục đích**: Screen này giải quyết vấn đề gì?
      - **Route**: URL path
      - **Layout pattern**: (dashboard / list / detail / form / auth)
      - **SprouX components**: Components nào từ DS được sử dụng?
      - **Custom components**: Components cần tạo mới?
      - **Data cần**: Data entities + fields hiển thị
      - **User actions**: Người dùng có thể làm gì trên screen này?
      - **States**: Default / Empty / Loading / Error
      - **Connected screens**: Links đến screens nào khác?

16. **Component inventory**
    - Kiểm tra SprouX DS coverage: 47 components nào được sử dụng?
    - Liệt kê custom components cần tạo:
      - Chart components (line, bar, donut, area)
      - Data table (reusable, sort/filter/paginate)
      - Page header (title + description + actions)
      - Empty state (illustration + message + CTA)
      - KPI card (value + change + icon + sparkline)
      - Stat card, timeline, activity feed...

#### I. Tổng hợp & Viết Product Spec

17. **Viết product spec document**
    - Dùng template: `_pipeline/templates/product-spec-template.md`
    - Lưu tại: `products/{NNN}-{tên}/product-spec.md`
    - Tổng hợp tất cả artifacts đã tạo ở trên vào 1 document duy nhất

18. **Review spec trước khi build**
    - Cross-check: mọi screen trong sitemap đều có trong spec?
    - Cross-check: mọi flow đều có screens tương ứng?
    - Cross-check: mọi data entity đều có screens hiển thị?
    - Cross-check: mọi edge case đều đã planned?
    - Ước lượng build time cho từng phase

### Deliverable
- `product-spec.md` hoàn chỉnh
- User personas tại `product-spec.md` section 2
- User journey maps tại `wireframes/journeys/`
- User flow diagrams tại `wireframes/flows/`
- Sitemap tại `product-spec.md` section 4
- Wireframe sketches tại `wireframes/layouts/`

### Checklist

**A. Personas**
- [ ] End User Personas đã xây dựng (2-4 personas, có primary persona)
- [ ] Buyer Personas đã xây dựng (2-3 personas, có primary buyer)
- [ ] Mỗi persona có: tên, vai trò, goals, frustrations, daily tasks, tech level

**B. User Journey**
- [ ] User Journey Maps đã vẽ cho primary persona
- [ ] Key moments đã xác định ("aha" moment, friction points, delight moments)
- [ ] Journey stages: Onboarding → First Use → Daily Use → Advanced Use

**C. User Flows**
- [ ] Core flows đã viết (auth, primary task, CRUD, search/filter, settings)
- [ ] Secondary flows đã viết (onboarding wizard, bulk action, export, error recovery)
- [ ] Mỗi flow có: entry point, steps, decision points, happy/error paths, exit point
- [ ] Flow diagrams đã lưu tại `wireframes/flows/`

**D. Sitemap & Navigation**
- [ ] Sitemap hoàn chỉnh (tất cả routes + hierarchy)
- [ ] Navigation model đã thiết kế (primary, secondary, contextual, quick actions)
- [ ] Breadcrumb structure đã định nghĩa
- [ ] Cross-linking giữa screens đã xác định

**E. Wireframes & Layout**
- [ ] Wireframes đã vẽ cho mọi screen (low-fidelity)
- [ ] Layout patterns đã định nghĩa (dashboard, list, detail, form, auth, empty)
- [ ] Wireframes đã lưu tại `wireframes/layouts/`

**F. Content & Data**
- [ ] Content inventory hoàn chỉnh (titles, labels, messages, tone of voice)
- [ ] Mock data strategy đã định nghĩa (entities, volumes, schemas, relationships)

**G. Edge Cases & States**
- [ ] UI states đã định nghĩa cho mọi screen (default, empty, loading, error, partial, overflow)
- [ ] Responsive behavior đã planned (4 breakpoints, mỗi component type)

**H. Screen Specs**
- [ ] Tất cả screens đã liệt kê chi tiết (target: 15-25 screens)
- [ ] Component inventory đã kiểm tra (SprouX coverage + custom components)
- [ ] Mỗi screen có: mục đích, route, layout, components, data, actions, states

**I. Tổng hợp**
- [ ] Product spec document hoàn chỉnh
- [ ] Cross-check: sitemap ↔ specs ↔ flows ↔ data đều nhất quán
- [ ] Build phases đã ước lượng thời gian

---

## Giai đoạn 3: Art Direction Deep Dive (2-3 ngày)

### Mục tiêu
Chuyển art direction từ high-level (Phase 1 Section C) thành **implementation-ready specs**: hex values, CSS code, component patterns, glassmorphism levels, shadows... đủ chi tiết để Phase 4 (Design System) chỉ cần copy-paste.

> **Tại sao tách riêng?** Art direction ở mức implementation-ready CẦN biết product spec (Phase 2) trước — phải biết có KPI cards không, product cards kiểu gì, chart loại nào, bao nhiêu screens... mới define visual specs cụ thể được.

### Input bắt buộc
- `research.md` Section 5 — Style Direction Summary (high-level từ Phase 1)
- `product-spec.md` — biết rõ screens, components, data types

### Quy trình

#### A. Competitor Visual Deep Dive

1. **Nghiên cứu sâu competitors trực tiếp**
   - Tìm và phân tích 3-5 SaaS apps thực tế trong cùng domain (không chỉ templates)
   - Mỗi competitor ghi rõ:
     - **Color palette**: Primary, secondary, accent, neutral colors
     - **Typography**: Font families, sizes, weights
     - **Layout patterns**: Sidebar style, card density, spacing rhythm
     - **Dark mode approach**: True black vs dark gray, color adjustment
     - **Signature element**: Điều gì làm nó khác biệt visually?
   - Tham khảo app thực: Analytics (Triple Whale, Mixpanel), CRM (HubSpot, Pipedrive), PM (Linear, Notion)

2. **Phân tích Dribbble/Behance shots chi tiết**
   - Tìm 20+ shots trong niche cụ thể
   - Phân tích patterns: glassmorphism usage, shadow styles, chart styles, card layouts
   - Identify: cái gì "trông đẹp nhưng không practical" vs "đẹp VÀ usable"

#### B. Color Palette Specifications

3. **Define complete color token table**
   - Dựa trên direction từ Phase 1 → chọn exact hex values
   - Phải cover đủ categories:
     - **Raw palette**: Primary scale (50-950), neutral scale (50-950)
     - **Surfaces**: background, card, popover, muted (light + dark)
     - **Text**: foreground, muted-foreground, card-foreground
     - **Accent/Primary**: primary, primary-foreground, accent, accent-foreground
     - **Borders**: border, input border, ring, separator
     - **Status colors**: success, warning, destructive, info (+ subtle variants)
     - **Chart colors**: 6 distinct colors, perceptually spaced (đặc biệt trên dark bg)
     - **Glassmorphism** (nếu dùng): glass-bg, glass-border, glass-shadow opacity levels
   - Format: bảng với columns [Token | Light Value | Dark Value | Raw Reference]
   - Verify: contrast ratio ≥ 4.5:1 cho text, ≥ 3:1 cho interactive elements

4. **Define dark mode strategy**
   - Base darkness level: true black (#000) vs dark gray (#0a0a0a) vs tinted dark (#09090b)
   - Color temperature: cool (zinc/slate) vs warm (stone/neutral)
   - How accent color changes in dark: same hue? lighter? more saturated?
   - Shadow approach in dark mode: invisible (border-based) vs deep shadows vs glow?

#### C. Typography Specifications

5. **Define complete typography scale**
   - Font families: heading, body, mono (with Google Fonts import URLs)
   - Complete scale table:
     - Display sizes (hero headings): size, weight, line-height, letter-spacing
     - Heading sizes (h1-h4): size, weight, line-height, letter-spacing
     - Body sizes (paragraph, label, caption): size, weight, line-height, letter-spacing
     - Monospace (numbers, code): size, weight
   - Special rules:
     - `font-variant-numeric: tabular-nums` for KPI/data numbers?
     - Heading letter-spacing: tight (-0.02em)?
     - Body letter-spacing: normal (0)?
   - Dark mode typography: same weights? lighter weights? increased letter-spacing?

#### D. Visual Effects & Elevation

6. **Define glassmorphism specs** (nếu dùng)
   - Levels: Glass Level 1 (subtle) → Level 4 (heavy)
   - Mỗi level: background opacity, blur radius, border opacity
   - Exact CSS cho mỗi level (copy-paste ready)
   - Usage map: which components use which level?
   - Ambient background: gradient orbs, mesh gradients, or solid?
   - Performance considerations: khi nào nên dùng border-based elevation thay vì blur?

7. **Define shadow & elevation system**
   - Shadow scale: sm, md, lg, xl (CSS values cho light + dark mode)
   - Dark mode shadows: inset top-edge highlight? border-based? accent glow?
   - Accent glow effect (nếu dùng): cho CTAs, hover states
   - Elevation hierarchy: surface → raised → floating → overlay → dialog

#### E. Component Visual Patterns

8. **Define visual patterns cho key components**
   - Dựa trên screen specs từ Phase 2, define chi tiết visual cho:
     - **KPI Card**: layout (icon position, value size, change indicator), colors, shadows
     - **Data Table**: header style, row hover, stripe pattern, border style
     - **Chart Config**: fill style (solid/gradient), grid lines, axis labels, tooltip
     - **Status Badge**: colors per status, border radius (rounded/pill), background opacity
     - **Sidebar**: bg color, active state, hover state, section separators
     - **Cards**: border style, shadow level, padding, radius
   - Format: ASCII mockup + CSS specs (copy-paste ready)
   - Responsive variations: how components change at breakpoints?

9. **Define micro-interactions & transitions**
   - Hover effects: scale, color shift, shadow change
   - Page transitions: fade, slide, none
   - Loading states: skeleton style (pulse, wave), shimmer color
   - Toast/notification style: position, animation, duration
   - Timing function: ease-in-out / cubic-bezier values

#### F. Synthesis & Documentation

10. **Tạo art-direction.md**
    - Compile tất cả specs vào 1 file: `products/{NNN}-{tên}/art-direction.md`
    - File này = "visual bible" cho Phase 4 (Design System) và Phase 5 (Build App)
    - Structure:
      1. Design Style Matrix (style + rationale)
      2. Competitor Visual Analysis (3-5 apps)
      3. Complete Color Token Table
      4. Typography Scale
      5. Glassmorphism / Visual Effects Specs
      6. Shadow & Elevation System
      7. Component Visual Patterns (with CSS)
      8. Micro-interactions
      9. Responsive Strategy
      10. Mood Board References
      11. Marketplace Visual Competitiveness
      12. Preview Image Strategy

11. **Cross-check với product spec**
    - Mọi screen trong spec đều có visual pattern defined?
    - Mọi component type đều có visual specs?
    - Dark mode specs cho mọi component?
    - Responsive behavior cho mọi breakpoint?

### Deliverable
- `art-direction.md` hoàn chỉnh với implementation-ready specs
- Research.md Section 5 updated (nếu có thay đổi so với Phase 1)
- Mood board references (links, screenshots)

### Checklist

**A. Competitor Deep Dive**
- [ ] Đã phân tích 3-5 SaaS apps thực tế trong domain
- [ ] Đã phân tích 20+ Dribbble/Behance shots chi tiết
- [ ] Đã identify signature visual elements cho sản phẩm mình

**B. Color Palette**
- [ ] Complete color token table (raw + semantic + chart + glass)
- [ ] Light + dark mode hex values cho tất cả tokens
- [ ] Contrast ratio ≥ 4.5:1 verified
- [ ] Dark mode strategy documented (base darkness, temperature, shadow approach)

**C. Typography**
- [ ] Font families confirmed (heading + body + mono)
- [ ] Complete scale table (display, heading, body, mono) với exact values
- [ ] Google Fonts import URLs ready
- [ ] Special rules documented (tabular-nums, letter-spacing, dark mode adjustments)

**D. Visual Effects**
- [ ] Glassmorphism levels defined (nếu dùng) với exact CSS
- [ ] Shadow scale defined (sm-xl) cho light + dark
- [ ] Elevation hierarchy documented
- [ ] Ambient background decorations planned (nếu dùng)

**E. Component Patterns**
- [ ] KPI Card visual specs (layout + colors + CSS)
- [ ] Data Table visual specs (header, rows, hover, borders)
- [ ] Chart config specs (fill, grid, tooltip, colors)
- [ ] Status Badge specs (colors per status, shape)
- [ ] Sidebar visual specs (bg, active, hover, separators)
- [ ] Micro-interactions defined (hover, transitions, loading)

**F. Synthesis**
- [ ] `art-direction.md` hoàn chỉnh
- [ ] Cross-check với product-spec.md (mọi screen/component covered)
- [ ] Mood board references saved

---

## Giai đoạn 4: Design System Customization (2-3 ngày)

### Mục tiêu
Fork SprouX Design System thành Design System riêng cho sản phẩm, customize toàn bộ visual style (colors, typography, spacing, shadows, components) theo art direction đã xác định ở Phase 3 (`art-direction.md`).

> **NGUYÊN TẮC TÁCH BIỆT**: SprouX là template gốc — chỉ COPY, KHÔNG BAO GIỜ sửa. Mọi thay đổi chỉ diễn ra trên bản copy trong project SaaS app.

### Quy trình

#### A. Fork SprouX → Project Design System

1. **Copy toàn bộ SprouX assets vào project mới**
   - Copy `src/index.css` (foundation tokens — 1000+ CSS custom properties)
   - Copy `src/lib/utils.ts` (cn helper)
   - Copy `src/components/ui/*` (47 component files)
   - Copy dependencies từ SprouX `package.json`
   - **KHÔNG giữ git reference đến SprouX** — đây là bản hoàn toàn độc lập
   - Từ thời điểm này, mọi chỉnh sửa chỉ diễn ra trong project SaaS app

2. **Đổi tên & branding**
   - Rename mọi reference "SprouX" → tên sản phẩm (ví dụ: "DataFlow")
   - Cập nhật metadata: package.json name, title trong index.html
   - Chuẩn bị logo placeholder

#### B. Customize Foundation Tokens

3. **Customize Color Tokens** (dựa trên Art Direction từ Phase 3 `art-direction.md`)
   - Mở `src/index.css`, section `:root` (light mode) và `.dark` (dark mode)
   - **Raw color palette**: Thay đổi hoặc thêm primitive colors
     - Giữ cấu trúc `--color-{name}-{shade}` (50, 100, ..., 950)
     - Thêm accent color mới nếu cần (ví dụ: `--color-indigo-*`)
     - Có thể dùng tool: Realtime Colors, Coolors, Tailwind Color Generator
   - **Semantic color mapping**: Cập nhật semantic tokens trỏ đến raw colors mới
     - `--background`, `--foreground`, `--card`, `--muted`, `--accent`...
     - `--primary` → accent color chính (ví dụ: từ slate → indigo)
     - `--chart-1` đến `--chart-5` → palette cho data visualization
   - **Dark mode colors**: Đảm bảo `.dark` section có contrast ratio ≥ 4.5:1
   - Tham chiếu: `art-direction.md` (complete color token table từ Phase 3)

4. **Customize Typography Tokens**
   - **Font family**: Thay đổi `--font-body` và `--font-heading`
     - Import Google Fonts hoặc self-host font files
     - Cập nhật `index.html` hoặc CSS `@import`
     - Ví dụ: `--font-body: 'Inter', sans-serif` → `--font-body: 'Plus Jakarta Sans', sans-serif`
   - **Font sizes**: Điều chỉnh scale nếu cần (compact vs spacious)
     - `--font-size-*` (xs, sm, base, lg, xl, 2xl, 3xl, 4xl)
   - **Font weights**: Điều chỉnh theo font được chọn
     - `--font-weight-*` (regular, medium, semibold, bold)
   - **Line heights**: Điều chỉnh cho readability
   - **Lưu ý**: Vẫn dùng `typo-*` prefix cho custom typography classes (KHÔNG dùng `text-*`)

5. **Customize Spacing & Layout Tokens**
   - **Spacing scale**: Điều chỉnh nếu style cần compact hoặc spacious
     - `--spacing-*` (3xs, 2xs, xs, sm, md, lg, xl, 2xl, 3xl)
   - **Border radius**: Điều chỉnh theo style direction
     - Sharp: `--radius-sm: 2px`, `--radius-md: 4px`
     - Rounded: `--radius-sm: 6px`, `--radius-md: 10px`
     - Pill: `--radius-sm: 8px`, `--radius-md: 16px`
   - **Container widths**: Điều chỉnh max-width cho content area

6. **Customize Shadow Tokens**
   - **Light mode shadows**: Điều chỉnh intensity, blur, spread
     - Subtle style: `--shadow-sm: 0 1px 2px rgba(0,0,0,0.05)`
     - Dramatic style: `--shadow-sm: 0 2px 8px rgba(0,0,0,0.12)`
   - **Dark mode shadows**: Thường đậm hơn light mode
   - **Elevation levels**: Đảm bảo hierarchy rõ ràng (sm < md < lg < xl)
   - Nếu style là glassmorphism → thêm backdrop-blur tokens

#### C. Customize Components

7. **Điều chỉnh component styles theo art direction** (theo specs từ Phase 3 `art-direction.md`)
   - **KHÔNG thay đổi component API** (props, variants vẫn giữ nguyên)
   - **CHỈ thay đổi visual styling** qua CSS/Tailwind classes:
   - Components ưu tiên customize (ảnh hưởng visual nhiều nhất):
     - **Card**: border style, shadow, background, radius
     - **Button**: radius, padding, font weight, hover effect
     - **Sidebar**: background color, active state, hover state, separator style
     - **Badge**: radius (rounded vs pill), border, background opacity
     - **Table**: row hover, header style, border style, stripe pattern
     - **Input**: border style, focus ring color, placeholder color
     - **Avatar**: shape (circle vs squircle), border ring
     - **Tabs**: indicator style (underline vs pill vs box)
     - **Dialog/Sheet**: backdrop blur, border, shadow
   - Cách customize:
     - Mở component file → tìm className/CVA variants → sửa Tailwind classes
     - HOẶC override qua CSS custom properties nếu component support

8. **Tạo custom components mới (nếu cần)**
   - Components không có trong SprouX nhưng cần cho sản phẩm:
     - KPI Card (value + change + sparkline)
     - Chart wrapper (Recharts + theme colors)
     - Status badge (custom colors cho domain-specific statuses)
     - Timeline component
     - Activity feed
   - **Tuân theo patterns SprouX**: `data-slot`, `cn()`, CVA nếu có variants

#### D. Verify & Document

9. **Verify customized Design System**
   - Tạo 1 trang test render tất cả components đã customize
   - Kiểm tra:
     - [ ] Tất cả components render đúng với tokens mới
     - [ ] Light mode visual đúng art direction
     - [ ] Dark mode visual đúng + contrast OK
     - [ ] Typography hierarchy rõ ràng (heading vs body vs label)
     - [ ] Color consistency (primary, semantic, chart colors)
     - [ ] Spacing rhythm đều đặn
     - [ ] `pnpm build` pass zero errors

10. **Document Design System decisions**
    - Tạo file: `products/{NNN}-{tên}/design-system.md`
    - Ghi lại:
      - Color palette (hex values, light/dark)
      - Typography (fonts, sizes, weights)
      - Spacing & radius choices
      - Component customization notes
      - Fonts cần download/import
    - File này sẽ dùng cho Phase 7 (Polish Figma) để sync Figma Variables

### Deliverable
- Customized `src/index.css` với tokens mới
- Customized `src/components/ui/*` với visual style mới
- `design-system.md` documenting all decisions
- Trang test components render đúng

### Checklist

**A. Fork**
- [ ] Đã copy toàn bộ SprouX assets (index.css, utils.ts, 47 components)
- [ ] Đã rename branding (SprouX → tên sản phẩm)
- [ ] Project hoàn toàn độc lập, không reference SprouX

**B. Tokens**
- [ ] Color palette đã customize (raw + semantic + chart + dark mode)
- [ ] Typography đã customize (font family, sizes, weights)
- [ ] Spacing & border radius đã điều chỉnh
- [ ] Shadows đã điều chỉnh (light + dark mode)
- [ ] Fonts đã import (Google Fonts / self-hosted)

**C. Components**
- [ ] Card, Button, Sidebar, Badge, Table, Input đã customize visual
- [ ] Custom components mới đã tạo (nếu cần)
- [ ] Component API không thay đổi (chỉ visual)

**D. Verify**
- [ ] Test page render tất cả components → visual đúng art direction
- [ ] Light + Dark mode đều OK
- [ ] Color contrast ≥ 4.5:1
- [ ] `pnpm build` pass zero errors
- [ ] `design-system.md` đã viết

---

## Giai đoạn 5: Build React App (5-10 ngày)

### Mục tiêu
Xây dựng React app hoàn chỉnh, pixel-perfect, chạy được trên browser. Đây là **source of truth** cho toàn bộ template. Sử dụng Design System đã customize ở Phase 4.

### Quy trình
1. **Scaffold project** (nếu chưa tạo ở Phase 4)
   - `pnpm create vite {tên}-template --template react-ts`
   - Tạo repo GitHub riêng: `thanhnhan-evol/{tên}-template`
   - Design System đã sẵn sàng từ Phase 4 (index.css + components + utils)
   - Install dependencies: tất cả deps + react-router-dom + recharts

2. **Build theo phases** (incremental, verify mỗi phase)
   - Phase A: Layout shell (sidebar, header, routing, dark mode toggle)
   - Phase B: Auth pages (sign-in, sign-up, forgot-password, onboarding)
   - Phase C: Dashboard pages (overview, analytics, reports) + charts
   - Phase D: Management pages (CRUD tables, detail views, filters)
   - Phase E: Settings pages (profile, notifications, billing)
   - Phase F: Utility (404, empty states, loading skeletons)

3. **Mock data**
   - Tạo realistic data files trong `src/data/` (theo spec từ Phase 2)
   - Dùng tên, email, số liệu thực tế (không dùng Lorem ipsum)
   - Đủ data để test pagination (50-100 items)

4. **Quality standards**
   - `sp-*` prefix cho typography (KHÔNG dùng `text-*` hoặc `typo-*` — dùng prefix của product DS)
   - Spacing tokens: `gap-xs`, `p-md`, `gap-xl`... (customized values từ Phase 4)
   - Dark mode hoạt động trên mọi page
   - `pnpm build` pass zero errors
   - **Tham chiếu**: Đọc `common-mistakes.md` phần B (JSON Spec), C (Component Docs), D (Design Token) trước khi build

5. **Management page edge cases** (BẮT BUỘC cho mọi CRUD/list page)
   - **Loading**: 800ms initial skeleton → real content
   - **Offline**: WifiOff banner + Reconnect button + network online/offline toast
   - **Refresh**: RefreshCw button with `animate-spin` + skeleton rows while refreshing
   - **Bulk selection**: Checkbox column + select all + bulk overlay (Export/Delete) + clear on filter change
   - **Status badges**: Dot badge pattern (colored dot + semantic bg) — NOT Badge component
   - **Status tabs**: Pill tabs (rounded-full) — 1 tab per unique status + "All"
   - **Empty state**: EmptyState component (icon + title + description)
   - **Table**: `table-fixed` + percentage widths + `sp-label` headers + `group` class on rows
   - **Pagination**: Smart window (max 5 pages) + `whitespace-nowrap` on "Showing X–Y of Z"
   - **Actions**: DropdownMenu per row + Detail Sheet + Edit Sheet (with save guard) + AlertDialog confirm
   - **Detail → Edit**: `setTimeout(100ms)` transition
   - **Validation**: Disabled save button when form invalid + Loader2 spinner while saving
   - **"Updated just now"**: Pulse indicator in page header
   - **DCard wrapper**: `rounded-2xl border-border/60 dark:border-border-subtle shadow-none p-xl`

### Deliverable
- GitHub repo với React app chạy được
- Symlink hoặc ghi path tại `products/{NNN}-{tên}/saas-app/`

### Checklist
- [ ] Repo GitHub đã tạo
- [ ] Design System từ Phase 4 đã integrate
- [ ] Tất cả screens từ spec đã build
- [ ] Dark mode hoạt động mọi page
- [ ] Mock data realistic
- [ ] `pnpm build` pass, zero TS errors
- [ ] Code-split (React.lazy) cho mọi page
- [ ] Management pages pass edge case checklist (loading, offline, refresh, bulk, tabs, badges, empty state, pagination, actions, validation)
- [ ] **BẮT BUỘC**: Sau khi tạo/update/điều chỉnh component hoặc foundation trên web React → chạy `/commands review` và `/commands test` để verify chất lượng

---

## Giai đoạn 6: Review & Iterate (2-3 ngày)

### Mục tiêu
Review trên browser, phát hiện và fix mọi vấn đề trước khi chuyển sang Figma.

### Quy trình
1. **Visual review** — chạy `pnpm dev`, duyệt từng page
   - Spacing consistent?
   - Typography hierarchy rõ ràng?
   - Colors đúng semantic (success=green, destructive=red)?
   - Dark mode contrast OK?

2. **Functional review**
   - Navigation hoạt động đúng?
   - Filters, search, pagination chạy OK?
   - Empty states hiển thị đúng?
   - Forms validate đúng?

3. **Responsive review**
   - 1440px (desktop large)
   - 1024px (desktop small / tablet landscape)
   - 768px (tablet portrait)
   - 375px (mobile)

4. **WCAG audit**
   - Color contrast ratio ≥ 4.5:1 (text), ≥ 3:1 (large text)
   - Focus rings visible khi keyboard nav
   - Aria-labels trên icon-only buttons (RefreshCw, MoreHorizontal, Download, Eye/EyeOff...)
   - Tab order hợp lý
   - Search inputs có `aria-label`

5. **Design System compliance audit**
   - **Typography prefix**: Tất cả pages dùng đúng prefix của product (e.g. `sp-*`), KHÔNG dùng `typo-*` hay `text-*` custom
   - **Component usage**: Tất cả interactive elements dùng DS components (`<Button>` không `<button>`, `<Input>` không `<input>`, `<Table>` không `<table>`)
   - **Token usage**: Không có hardcoded hex/rgb/hsl trong className, không dùng raw Tailwind colors (bg-zinc-*, text-violet-*). Không `opacity-*` để giảm màu element — dùng semantic token (`text-muted-foreground`) hoặc `color-mix()`
   - **Foundation tokens**: Colors, spacing, border-radius, shadows — semantic tokens throughout
   - **Dark mode**: Mọi `bg-*` có dark counterpart hoặc dùng semantic tokens
   - **Imports**: Tất cả UI imports từ `@/components/ui/*`, không import trực tiếp từ `@radix-ui/`
   - **DCard pattern**: Consistent card wrapper across pages
   - **Form components**: Input, Select, Label, Checkbox, Switch, RadioGroup từ DS

6. **Animation & Micro-interaction polish**
   - Page transitions: `PageTransition` wraps `<Outlet />` inside each layout (NOT Routes)
   - CSS keyframes: `page-in` (route change), `slide-up` (content blocks), `scale-in` (popups), `shimmer` (skeletons)
   - Stagger: `stagger-children` utility on KPI grids (50ms delay between cards)
   - Reduced motion: `prefers-reduced-motion: reduce` media query at end of index.css
   - Autofill fix: `background-color: var(--input) !important` + `transition: background-color 5000s`
   - FOUC prevention: inline `<script>` in `index.html` applies `.dark` before React

7. **Auth page review**
   - Split-screen layout: illustration (left) + form card (right), 50/50 flex
   - ShopPulseLogo component with diamond SVG gradient
   - Card: `max-w-[440px] border-0 shadow-none sm:border sm:shadow-sm`, padding `p-xl`
   - Social buttons: `grid grid-cols-2` (NOT flex — prevents overflow)
   - Mobile: logo visible only below `lg:`, left panel hidden

8. **Ghi review notes**
   - Lưu tại: `products/{NNN}-{tên}/review-notes.md`
   - Fix mọi issue → commit → re-review

### Deliverable
- `review-notes.md` với tất cả issues đã found + fixed
- App đạt chất lượng production-ready

### Checklist
- [ ] Visual review passed (light + dark)
- [ ] Functional review passed (navigation, filters, forms)
- [ ] Responsive review passed (4 breakpoints)
- [ ] WCAG audit passed (contrast, focus, aria)
- [ ] DS compliance audit passed (typography prefix, components, tokens, dark mode, imports)
- [ ] Animation & transition review passed (page transitions, stagger, reduced motion)
- [ ] Auth page review passed (layout, logo, autofill, FOUC)
- [ ] Review notes documented
- [ ] Tất cả issues đã fix

---

## Giai đoạn 6.5: Test — Quality Audit (1-2 ngày)

### Mục tiêu
Kiểm tra chất lượng toàn diện nhắm tới tiêu chuẩn UI8 Featured/Trending. Chạy qua skill `test [product-name]`.

### 8 Categories (A-H)

| Cat | Name | Type | Checks |
|-----|------|------|--------|
| A | Code Quality Scan | Automated | 8 |
| B | Interaction & State Completeness | Automated | 11 |
| C | Visual Polish Scan | Automated | 7 |
| D | Dark Mode Audit | Automated | 7 |
| E | Responsive Audit | Automated | 7 |
| F | Data Realism | Automated | 7 |
| G | Micro-interactions | Manual | 7 |
| H | UI8 Buyer Experience | Manual | 9 |
| **I** | **Marketplace Readiness** | **Research + Scoring** | **8** |

**Total**: 47 automated + 16 manual + 8 marketplace = 71 checks

### Category I: Marketplace Readiness Assessment (CRITICAL)

Đánh giá sản phẩm theo tiêu chuẩn **UI8 Featured/Trending** — không chỉ check kỹ thuật mà đánh giá tổng thể khả năng cạnh tranh trên marketplace.

**I1. Competitive Benchmark** (Research)
- Tìm và phân tích 5+ sản phẩm cạnh tranh trực tiếp trên UI8
- So sánh: price, screen count, coded?, niche, visual style
- Xác định edge cạnh tranh duy nhất (USP)

**I2. UI8 Featured Criteria Scoring** (8 factors × 5 điểm = 40 max)

| Factor | Weight | Tiêu chí 5/5 |
|--------|--------|---------------|
| Visual quality | 15% | Premium aesthetic, modern trends, cohesive palette |
| Completeness | 15% | 100+ screens/views, full app flow (auth → CRUD → settings) |
| Uniqueness | 10% | Duy nhất trong niche trên marketplace |
| Code quality | 10% | Production-grade React/Tailwind (nếu có coded version) |
| Design system | 10% | Component-based, semantic tokens, dark mode |
| Data realism | 10% | Realistic mock data, real images, meaningful charts |
| Buyer appeal | 15% | Preview images, pricing, free sample, listing copy |
| Trend alignment | 15% | 2026 trends: bento, micro-anim, dark-first, AI-ready |

**Threshold**:
- ≥ 34/40 (85%): **HIGH** — xác suất Featured cao
- 28–33/40 (70–82%): **MEDIUM** — cần polish thêm
- < 28/40 (< 70%): **LOW** — chưa đủ chất lượng Featured

**I3. Screen Count Analysis**
- Đếm: routes × states (default, loading, empty, dark, mobile) = total Figma frames
- So sánh với competitor average (100–300+ screens)
- Plan tối ưu frame count cho Phase 7

**I4. Pricing Validation**
- So sánh giá với 5+ competitors cùng niche
- Validate: Figma-only tier vs Figma+Code tier
- Check: coded version có justify được premium price?

**I5. Gap Analysis**
- Liệt kê gaps còn thiếu vs Featured bar (Figma, preview, free sample, listing)
- Assign severity (Critical/High/Medium/Low)
- Map mỗi gap tới phase sẽ resolve

**I6. Featured Probability Estimate**
- Tính % xác suất dựa trên:
  - Current state (code only) vs Full package (Figma + preview + listing)
  - Weight: Preview images 25%, Figma quality 25%, Screen count 15%, Visual quality 15%, Code 10%, Uniqueness 5%, Edge cases 5%
  - Output: X% Featured | Y% Trending | Z% Accept

**I7. Competitive Advantage Matrix**
- Liệt kê 3–5 điểm mạnh duy nhất vs market
- Identify điểm nào phải highlight trong preview images + listing copy

**I8. Action Items**
- Priority P0/P1/P2 cho mỗi gap
- Map tới phase cụ thể (Phase 7/8/9/10)

### Output
- `products/{product}/test-report.md` — score table per category (A–I) + flagged issues + marketplace readiness + fix suggestions
- Automated Grade: A (≥42/47), B (≥38), C (≥33), F (<33)
- Marketplace Grade: HIGH (≥34/40), MEDIUM (≥28), LOW (<28)
- Target: **Automated A + Marketplace HIGH** before proceeding to Phase 7

### Checklist
- [ ] All 9 categories audited (A–I)
- [ ] Automated score ≥ A grade (42/47+)
- [ ] Marketplace readiness ≥ HIGH (34/40+)
- [ ] Competitive analysis with 5+ competitors
- [ ] Featured probability calculated
- [ ] All critical issues (flagged ❌) resolved
- [ ] Action items mapped to phases
- [ ] Test report saved to product folder

---

## Giai đoạn 7: Export JSON & Generate Figma (2-3 ngày)

### Mục tiêu
Export JSON specs từ React app → chạy Figma plugin để generate UI tự động.

> **Tham chiếu BẮT BUỘC**: `common-mistakes.md` phần A (Figma Plugin) + B (JSON Spec) + `component-docs-pattern.md`

### Quy trình

#### 7a. Foundation
- Generate Figma variables (raw colors, semantic colors, spacing, border radius)
- Generate text styles, effect styles
- Verify CSS ↔ Figma sync
- **Foundation Docs**: Create/update visual documentation JSONs in `figma-specs/docs/` (7 files: colors, typography, spacing, border-radius, shadows, illustrations, icons)
  - Source chain: `index.css` → web DS page `*Docs()` → `figma-specs/docs/*.json` → Figma Foundation page
  - Every token in `index.css` must appear in both web and JSON
  - Sync protocol: update web first, then JSON, then verify counts match
  - Reference: `_refs/plugin-json-pattern.md` → "Foundation Docs (Visual Documentation)"

#### 7b. Design System Page
- Viết component docs theo chuẩn `component-docs-pattern.md` (10 sections)
- **Nguyên tắc Explore Behavior**: PHẢI show component face (giao diện), KHÔNG show trigger
- **Group+Item Pattern**: Components dạng navigation/menu/group PHẢI dùng tabbed Explore (Tab 1: Group, Tab 2: Item). Item state ở Tab 2 PHẢI sync vào 1 item trong Tab 1 group (instance sync rule)
- **Interactive Demo**: Component cần trigger (Dialog, Sheet, Drawer, AlertDialog, Dropdown...) → thêm subsection Interactive Demo trong Examples
- **Disabled logic**: Cascade property disable khi parent toggle off (ví dụ: `showAction=false` → `showActionSecondary` disabled)
- Tham chiếu `common-mistakes.md` #14-#22, #58 (Component Docs mistakes)

#### 7c. Plugin Showcase
- Figma showcase generates **3 sections only**: Header, Component grid, Installation
- Other sections (Explore, Examples, Props, Tokens, etc.) are **web-only** — not rendered in Figma
- Variable binding: gap/padding → `spacing/*` (string tokens), radius → `border radius/*`

> **⛔ ABSOLUTE RULE — 100% Foundation Token Binding (áp dụng TOÀN BỘ dự án, common-mistake #177)**:
> MỌI visual property — color, spacing, radius, typography, effect — PHẢI 100% bind từ foundation tokens. TUYỆT ĐỐI KHÔNG raw hex, Tailwind color scale names, hardcoded pixel, manual font override. Áp dụng cho CẢ web React code, Figma JSON spec, VÀ plugin output. Foundation (`index.css` → Figma variables/text styles/effects) = SINGLE SOURCE OF TRUTH. Nếu cần token chưa có → TẠO MỚI trong foundation TRƯỚC.
>
> **⚠️ Universal Variable Token Binding Rule (áp dụng TOÀN BỘ Phase 7)**:
> MỌI UI tạo bởi PLUGIN (cả "Generate SaaS Template" lẫn "HTML to Figma") PHẢI bind variable token cho gap, padding, border-radius — kể cả 0px → `spacing/none` / `border radius/none`. KHÔNG raw number assignment.
> - Generate SaaS Template: dùng `bindFloat()` / `_bindSp()` / `_bindRad()` / `_bindPad()` (string tokens trong JSON spec)
> - HTML to Figma: dùng `bindSpacing()` / `bindRadius()` (auto-resolve px→token)
> - Helper frames (`_makeFrame`, `_makeSep`, sub-headers, grids): tất cả bind padding 0 + radius 0
> - `gap: "auto"` (space-between): bind `spacing/none` trên tất cả 4 code paths
> - Text styles: `setTextStyleIdAsync()` — KHÔNG override `fontSize`/`fontName` sau binding
> - Effect styles: Ring/Shadow/Glow via `setEffectStyleIdAsync()`
> - **Color token scope**: `stroke` PHẢI dùng `-border` suffix tokens (`primary-border`, `destructive-border`, `toast-border`). KHÔNG dùng fill/text tokens cho border (common-mistake #167)
> - Xem common-mistake #153, #159, #167, #168, #177

#### 7d. Component Generation
- Analyze React component tree → convert thành JSON spec format
- Mỗi page = 1 JSON spec file
- Lưu tại: `products/{NNN}-{tên}/figma-specs/`
- Tham chiếu `common-mistakes.md` #9-#13 (JSON Spec mistakes)
- **BẮT BUỘC: Chạy Review & Test Protocol** (xem `_refs/plugin-json-pattern.md` → "JSON Spec Review & Test Protocol"):
  1. **Format Validation** — kiểm tra cấu trúc JSON (variantRestrictions object, token types, naming)
  2. **Web Source Cross-Check** — so sánh JSON vs React code (properties, CSS, sizing, colors)
  3. **Visual Diff Prediction** — mental render mỗi variant, so sánh với web
  4. Fix TẤT CẢ issues tìm được TRƯỚC KHI giao cho user chạy plugin
  5. Report kết quả review (PASS/FIXED/BLOCKED)
- **Image Service & CORS Verification** (áp dụng cho components có imageUrl):
  - [ ] Image CORS verify: `curl -sI <imageUrl> | grep access-control` cho MỌI image service mới
  - [ ] JSON imageUrl match web data: cross-check JSON URLs với web DS data arrays (ilOrderData, ilUserData, etc.)
  - [ ] No raw frame for DS elements: dots/badges/indicators → component instances
  - [ ] Group instance imageOverrides: explicit cho MỌI row có custom image

#### 7e. Flow Generation
- Chạy Figma plugin "Generate SaaS Template"
- Plugin tạo frames, components, layout tự động
- **Mandatory Screenshot Verification Protocol** (xem `_refs/plugin-json-pattern.md` → "Screenshot Verification Protocol"):
  1. **Spec Content Cross-Check** — so sánh JSON spec vs web React source (text, variants, children, overrides)
  2. **User Plugin Run** — user chạy plugin + chụp ảnh Figma output
  3. **Visual Accuracy Verification** — Claude compare screenshot vs web UI (content accuracy + visual fidelity)
  4. **Iterate** — nếu mismatch, fix spec/web, re-run plugin, re-verify
  5. Mark spec DONE chỉ sau khi screenshot verification PASS

### Deliverable
- JSON spec files trong `figma-specs/`
- Design system page với component docs (10-section standard)
- Figma file với tất cả pages generated
- **Screenshot verification report** (spec name → PASS/FIXED/BLOCKED)

### Checklist
- [ ] Foundation variables + text styles + effects synced
- [ ] Foundation Docs JSONs (`figma-specs/docs/*.json`) match web DS page tabs 1:1 (item counts, section names, token names)
- [ ] Component docs viết theo `component-docs-pattern.md` (10 sections)
- [ ] Explore Behavior shows component face (NOT trigger)
- [ ] Group+Item components: Tab 2 item state syncs into Tab 1 group
- [ ] Interactive Demo cho overlay/trigger components
- [ ] JSON specs viết cho tất cả pages
- [ ] Mỗi JSON spec đã qua Review & Test Protocol (3 bước: Format, Cross-Check, Visual Diff)
- [ ] **🔴 MANDATORY: Screenshot Verification Protocol — MỖI spec (component + foundation) phải qua spec cross-check + user plugin run + Claude TỰ chụp screenshot bằng Figma MCP `get_screenshot` để verify visual output TRƯỚC mark done. KHÔNG yêu cầu user chụp hình.**
- [ ] Figma plugin chạy thành công (không error)
- [ ] Claude TỰ chụp web screenshot (Playwright/browser) + Figma screenshot (`get_screenshot` MCP) → so sánh 2 bên → báo cáo lỗi nếu có
- [ ] Tất cả components đều sử dụng Figma component set (không detach)
- [ ] ComponentSet visual: border inside 1px DASH foreground, radius 16px, variants xếp lưới gọn gàng
- [ ] Properties trên Figma khớp 100% React Explore controls (tên property, tên value, số lượng)
- [ ] Boolean-like properties dùng `"Yes"/"No"` — KHÔNG `"True"/"False"` (common-mistake #120). Check: properties, variantStyles, showWhen, instance variants, examples
- [ ] Group+Item: item ở index 0 trong JSON, parent dùng instance reference, Accordion cũng là Group+Item (common-mistake #122)
- [ ] Indicator components (Radio, Checkbox, Switch): clipsContent trong indicator object, không ở base (common-mistake #121)
- [ ] Screen component trên web DS có Page property (Dashboard, Analytics, Reports, Users, Products, Orders) với content riêng cho mỗi page
- [ ] Illustration component JSON (`illustration.json`) tạo đúng: Type=Auth, 480×700, vertical, space-between, Logo instance + center content + footer stats
- [ ] **Image Service & CORS Verification** (cho components có imageUrl):
  - [ ] Image CORS verify: `curl -sI <imageUrl> | grep access-control` cho MỌI image service mới
  - [ ] JSON imageUrl match web data: cross-check JSON URLs với web DS data arrays (ilOrderData, ilUserData, etc.)
  - [ ] No raw frame for DS elements: dots/badges/indicators → component instances
  - [ ] Group instance imageOverrides: explicit cho MỌI row có custom image
- [ ] Screen JSON spec KHÔNG tồn tại — screens dùng HTML-to-Figma pipeline only (common-mistake #157)
- [ ] Dynamic grid columns dùng inline `style` (KHÔNG `grid-cols-${n}` template literal) (common-mistake #155)
- [ ] Auth breakpoint: branding panel = desktop only (`hidden lg:flex`), logo in card = tablet+mobile (common-mistake #156)
- [ ] **Universal token binding (common-mistake #159)**:
  - [ ] MỌI frame bind variable token: gap/padding/radius kể cả 0px → `spacing/none` / `border radius/none`
  - [ ] MỌI text node bind text style. KHÔNG override `fontSize`/`fontName` sau binding
  - [ ] MỌI effect (Ring, Shadow, Glow) bind effect style via `setEffectStyleIdAsync()`
  - [ ] Áp dụng: component gen, showcase, foundation docs, icon assets, fallback frames, toasts
- [ ] **DOM Extraction — figma() static vs runtime state (common-mistake #161)**:
  - [ ] Form input Value variant: Select/Combobox detect `data-placeholder` on child span, Input/Textarea detect `inputEl.value` → override `Value: "Filled"`
  - [ ] Container components (Screen, Illustration) trong `CONTAINER_COMPONENTS` set → walker recurse, không extract leaf instance
  - [ ] Dual walker sync: mọi fix ở `raw-dom-walker.ts` → fix cả `dom-walker.ts`
  - [ ] Sau khi add Playwright states → verify extraction output: variant values khớp visual state
- [ ] **Icon upsert correctness (common-mistake #172-174)**:
  - [ ] Variants dùng `iconLeftName`/`iconRightName` khác nhau → plugin swap đúng component trên upsert (KHÔNG giữ icon cũ)
  - [ ] Variant KHÔNG cần icon → node XÓA hoàn toàn, KHÔNG hidden instance
  - [ ] KHÔNG mix native `iconRight`/`iconLeft` + `children` array icon cùng variant (exception: addon variants)
  - [ ] Indicator components có icon semantic (Checkbox Check/Minus) → `"fixedIcons": true` (KHÔNG tạo INSTANCE_SWAP)
- [ ] ⛔ Plugin code guard: verify upsert path KHÔNG có `comp.children.remove()` loop — xóa children = phá hủy instances (common-mistake #192)
- [ ] `common-mistakes.md` reviewed — no known mistakes repeated

---

## Giai đoạn 8: Polish Figma (3-5 ngày)

### Mục tiêu
Polish Figma file đạt chất lượng bán được: consistent, organized, dễ customize.

### Quy trình
1. **Auto-layout & constraints**
   - Mọi frame phải dùng auto-layout
   - Responsive resize hoạt động đúng
   - Min/max width constraints hợp lý

2. **Component organization**
   - Components gom vào page "Components" riêng
   - Variants đầy đủ (size, state, color)
   - Component properties (boolean, text, instance swap)

3. **Naming convention**
   - Pages: "Dashboard / Overview", "Auth / Sign In"
   - Layers: tên rõ nghĩa (không "Frame 427")
   - Components: PascalCase (Button, Card, Badge)

4. **Design tokens**
   - Figma Variables sync với customized tokens từ Phase 4 (`design-system.md`)
   - Light + Dark mode qua variable modes
   - Spacing, radius, colors đều dùng variables

5. **Typography & color styles**
   - Text styles match customized typography scale
   - Color styles match customized semantic tokens

### Deliverable
- Figma file polished, organized, variable-driven

### Checklist
- [ ] Mọi frame dùng auto-layout
- [ ] Responsive resize hoạt động (1440 → 375)
- [ ] Components organized với variants
- [ ] Naming convention consistent
- [ ] Figma Variables cho light/dark mode
- [ ] Không có "Frame 123" hoặc layer unnamed
- [ ] Không có detached components

---

## Giai đoạn 9: Package (1-2 ngày)

### Mục tiêu
Đóng gói sản phẩm hoàn chỉnh: Figma file + preview images + documentation.

### Quy trình
1. **Preview images** (cho marketplace listing)
   - Cover image: 1600×1200px (tỉ lệ 4:3)
   - Feature screenshots: 6-10 images
   - Dark mode showcase: 2-3 images
   - Responsive showcase: 1-2 images
   - Xuất PNG và/hoặc JPG
   - Lưu tại: `products/{NNN}-{tên}/preview-images/`

2. **Figma file cleanup**
   - Remove work-in-progress pages
   - Add "How to Use" page trong Figma
   - Add "Change Log" page
   - Export `.fig` file

3. **Documentation**
   - README / Getting Started guide
   - Component list + customization guide
   - Font list + where to download
   - Color customization guide

4. **Quality checklist cuối cùng**
   - Dùng: `_pipeline/templates/quality-checklist.md`

### Deliverable
- Figma file final (.fig)
- Preview images (PNG/JPG)
- Documentation (PDF hoặc included trong Figma)

### Checklist
- [ ] Cover image 1600×1200
- [ ] Ít nhất 6 preview images
- [ ] Dark mode screenshots
- [ ] Responsive screenshots
- [ ] Figma file cleaned up
- [ ] "How to Use" page trong Figma
- [ ] Documentation hoàn chỉnh
- [ ] Quality checklist passed

---

## Giai đoạn 10: Publish (1 ngày)

### Mục tiêu
Publish lên marketplace(s) với listing tối ưu cho conversion.

### Quy trình
1. **Chuẩn bị listing**
   - Dùng template: `_pipeline/templates/marketplace-listing-template.md`
   - Viết title (SEO-friendly, ≤ 60 chars)
   - Viết description (features, what's included, compatibility)
   - Tags/keywords (10-15 tags relevant)
   - Pricing strategy (dựa trên research)

2. **Upload lên marketplaces**
   - **UI8**: Upload .fig + preview images + description
   - **Gumroad**: Upload .fig + set price + description
   - **Creative Market**: (optional) Upload + listing
   - Lưu listing links tại: `products/{NNN}-{tên}/listing/`

3. **Verify listing**
   - Preview page hiển thị đúng
   - Download file hoạt động
   - Price đúng
   - Tags đúng

### Deliverable
- Live listings trên marketplace(s)
- Listing URLs documented

### Checklist
- [ ] Title SEO-optimized
- [ ] Description hoàn chỉnh (features, included, compatibility)
- [ ] Tags/keywords đã thêm
- [ ] Preview images uploaded
- [ ] Price đã set
- [ ] Test download hoạt động
- [ ] Listing URLs lưu vào `listing/`

---

## Giai đoạn 11: Post-launch (ongoing)

### Mục tiêu
Monitor performance, collect feedback, plan updates.

### Quy trình
1. **Monitor metrics** (hàng tuần)
   - Views, downloads, revenue
   - Reviews và ratings
   - Questions từ buyers

2. **Respond to feedback**
   - Reply reviews trên marketplace
   - Fix bugs nếu reported
   - Add features nếu requested nhiều

3. **Plan updates**
   - Version 1.1, 1.2... với new screens hoặc improvements
   - Cross-sell: promote templates khác trong listing

4. **Update STATUS.md**
   - Lưu tại: `products/{NNN}-{tên}/STATUS.md`

### Deliverable
- Updated product (nếu có)
- Revenue tracking

---

## Quy tắc chung

### Naming
- Product folder: `{NNN}-{kebab-case-name}` (ví dụ: `001-analytics-dashboard`)
- React app repo: `sproux-{tên}-template` (ví dụ: `sproux-saas-templates`)
- Figma file: `BredarStudio — {Tên Template}` (ví dụ: `BredarStudio — Analytics Dashboard`)

### Tech Stack (cố định)
- **React app**: React 19, TypeScript 5.9, Tailwind v4, Vite 7, pnpm
- **Components**: Fork từ SprouX Design System (47 components), customize riêng cho mỗi sản phẩm
- **Charts**: Recharts
- **Routing**: react-router-dom
- **Figma**: Variables, Auto-layout, Component Properties
- **Plugin**: "Generate SaaS Template" (custom Figma plugin)

### SprouX Independence Rule
- SprouX là **nền tảng fork** — mỗi sản phẩm COPY SprouX rồi customize riêng
- **KHÔNG BAO GIỜ** sửa code/tokens trong repo SprouX khi đang làm SaaS app
- Mỗi SaaS app có Design System riêng: tokens, colors, typography, component styles
- Nếu phát hiện bug trong SprouX components → fix trong project SaaS app, KHÔNG fix ở SprouX
- Nếu muốn fix SprouX → tạo PR riêng, KHÔNG mix với công việc SaaS app

### Pricing Guidelines
| Tier | Screens | Price Range |
|------|---------|-------------|
| Starter | 8-12 | $29-49 |
| Standard | 15-25 | $59-89 |
| Pro | 25-40 | $99-149 |
| Premium | 40+ | $149-249 |

### Quality Bar
- Mọi template PHẢI có: light + dark mode
- Mọi template PHẢI responsive (4 breakpoints)
- Mọi template PHẢI có realistic mock data
- Mọi template PHẢI pass WCAG AA
- Mọi template PHẢI có empty states + loading states
