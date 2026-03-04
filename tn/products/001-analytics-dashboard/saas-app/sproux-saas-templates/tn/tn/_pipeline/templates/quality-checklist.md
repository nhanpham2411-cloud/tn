# Quality Checklist: {Tên Template}

> Dùng trước khi publish. Mọi item PHẢI pass.
> Ngày review: YYYY-MM-DD

---

## A. React App Quality

### Build & Code
- [ ] `pnpm build` pass — zero TypeScript errors
- [ ] No console errors/warnings khi chạy `pnpm dev`
- [ ] Code-split (React.lazy) cho mọi page route
- [ ] No unused imports hoặc dead code
- [ ] `typo-*` prefix cho typography (KHÔNG `text-*` custom)

### Visual — Light Mode
- [ ] Mọi page render đúng
- [ ] Typography hierarchy rõ ràng (heading > subheading > body > caption)
- [ ] Spacing consistent (dùng SprouX tokens, không hardcode px)
- [ ] Colors đúng semantic (primary, destructive, warning, muted)
- [ ] Icons consistent size (size-sm, size-md)
- [ ] Cards có proper border + radius
- [ ] Tables có header styling rõ ràng

### Visual — Dark Mode
- [ ] Mọi page render đúng trong dark mode
- [ ] Không có text-on-text contrast issue
- [ ] Charts colors vẫn distinguishable
- [ ] Borders visible (không bị mất trên dark background)
- [ ] Avatar fallback colors OK
- [ ] Input fields có border rõ

### Functional
- [ ] Sidebar navigation hoạt động — click chuyển page
- [ ] Sidebar collapse (Cmd+B) hoạt động
- [ ] Breadcrumbs hiển thị đúng theo route
- [ ] Dark mode toggle persist (localStorage)
- [ ] Search/filter hoạt động trên list pages
- [ ] Pagination hoạt động (prev/next/page numbers)
- [ ] Empty state hiển thị khi filter trả về 0 results
- [ ] Links giữa các page hoạt động (users → user profile, orders → order detail)
- [ ] Form validation hiển thị error messages
- [ ] Dropdown menus open/close đúng

### Responsive
- [ ] 1440px — full layout, sidebar expanded
- [ ] 1024px — sidebar auto-collapse hoặc icon mode
- [ ] 768px — stacked cards, table horizontal scroll
- [ ] 375px — single column, no horizontal overflow

### Accessibility (WCAG AA)
- [ ] Color contrast ≥ 4.5:1 cho normal text
- [ ] Color contrast ≥ 3:1 cho large text + UI components
- [ ] Focus rings visible khi dùng keyboard
- [ ] Tab order hợp lý (top-left → bottom-right)
- [ ] Icon-only buttons có aria-label
- [ ] Form inputs có associated labels
- [ ] Error messages linked với aria-invalid
- [ ] Modal/dialog trap focus đúng

### Component Documentation (theo `component-docs-pattern.md`)
- [ ] Mọi component có đủ 10 sections: Header, Explore Behavior, Installation, Examples, Props, Design Tokens, Best Practices, Figma Mapping, Accessibility, Related
- [ ] Explore Behavior shows component face — KHÔNG show trigger
- [ ] Overlay/trigger components có Interactive Demo trong Examples
- [ ] Props table 100% coverage — match React source code
- [ ] Disabled logic cascade hoạt động đúng (ví dụ: showAction off → showActionSecondary disabled)
- [ ] Toggle controls xếp hàng ngang, select controls xếp dọc
- [ ] FigmaMapping table khớp với JSON spec (component name, property path, variant)
- [ ] Không lặp bất kỳ mistake nào trong `common-mistakes.md`

---

## B. Figma File Quality

### Structure
- [ ] Pages organized: Cover, All Screens, Components, How to Use, Change Log
- [ ] Layer names rõ nghĩa (KHÔNG "Frame 427", "Group 12")
- [ ] Mọi frame dùng auto-layout
- [ ] Components trong page "Components" riêng

### Components
- [ ] Dùng SprouX Figma component set (không detach)
- [ ] Component variants đầy đủ (size, state)
- [ ] Component properties configured (boolean, text, instance swap)
- [ ] Không có orphaned/unused components

### Design Tokens
- [ ] Figma Variables for colors (light + dark modes)
- [ ] Figma Variables for spacing
- [ ] Figma Variables for border radius
- [ ] Text styles match SprouX typography scale
- [ ] Color styles match semantic tokens

### Responsive
- [ ] Desktop (1440px) — tất cả screens
- [ ] Tablet (768px) — ít nhất key screens
- [ ] Mobile (375px) — ít nhất key screens
- [ ] Auto-layout resize hoạt động đúng

### Polish
- [ ] Consistent padding/margin mọi screen
- [ ] Consistent icon sizes
- [ ] No pixel rounding issues (fractional pixels)
- [ ] Sidebar state: expanded + collapsed
- [ ] Mọi interactive element có hover state

---

## C. Package Quality

### Preview Images
- [ ] Cover image 1600×1200px
- [ ] Ít nhất 6 feature screenshots
- [ ] Dark mode showcase (2-3 images)
- [ ] Responsive showcase (1-2 images)
- [ ] Images sharp, no compression artifacts
- [ ] Consistent mockup style

### Documentation
- [ ] Getting started guide
- [ ] Font list + download links
- [ ] Color customization guide
- [ ] Component overview
- [ ] Change log

### File
- [ ] .fig file exportable
- [ ] File size reasonable (< 100MB)
- [ ] No unnecessary hidden layers
- [ ] No test/draft pages left

---

## D. Listing Quality

### Title & Description
- [ ] Title SEO-friendly, ≤ 60 chars
- [ ] Description mentions: screen count, dark mode, responsive, Figma
- [ ] Features bulleted list
- [ ] "What's included" section
- [ ] Compatibility info (Figma version)

### Tags & Pricing
- [ ] 10-15 relevant tags
- [ ] Price aligned với competitor analysis
- [ ] Launch discount set (optional)

---

## Sign-off

| Reviewer | Date | Status |
|----------|------|--------|
| | | Pass / Fail |
