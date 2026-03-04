# Design System: {Tên Sản Phẩm}

> Forked from SprouX Design System
> Customized: YYYY-MM-DD
> Art direction: (tham chiếu từ research.md section 5)

---

## 1. Style Direction

**Style chính**: (ví dụ: "Minimal clean + subtle glassmorphism on cards")
**Mood**: (ví dụ: "Professional but friendly, data-driven but not overwhelming")
**Differentiator**: (ví dụ: "Warmer tones than competitors, more generous spacing")

---

## 2. Color Palette

### Raw Colors (Primitive Palette)

| Color | Shade Range | Hex (representative) | Usage |
|-------|------------|---------------------|-------|
| Primary | 50-950 | #... | Main accent, CTAs, active states |
| Gray/Neutral | 50-950 | #... | Text, backgrounds, borders |
| (thêm nếu cần) | | | |

### Semantic Colors

| Token | Light Mode | Dark Mode | Raw Reference |
|-------|-----------|-----------|---------------|
| `--background` | | | `var(--color-...)` |
| `--foreground` | | | `var(--color-...)` |
| `--card` | | | |
| `--card-foreground` | | | |
| `--muted` | | | |
| `--muted-foreground` | | | |
| `--accent` | | | |
| `--accent-foreground` | | | |
| `--primary` | | | |
| `--primary-foreground` | | | |
| `--secondary` | | | |
| `--secondary-foreground` | | | |
| `--destructive` | | | |
| `--border` | | | |
| `--input` | | | |
| `--ring` | | | |

### Chart Colors

| Token | Light Mode | Dark Mode | Purpose |
|-------|-----------|-----------|---------|
| `--chart-1` | | | Primary data series |
| `--chart-2` | | | Secondary data series |
| `--chart-3` | | | Tertiary |
| `--chart-4` | | | Quaternary |
| `--chart-5` | | | Quinary |

### Semantic Status Colors

| Status | Color | Light Hex | Dark Hex |
|--------|-------|-----------|----------|
| Success | Green | | |
| Warning | Amber/Yellow | | |
| Error/Destructive | Red | | |
| Info | Blue | | |

---

## 3. Typography

### Fonts

| Role | Font Family | Source | Import |
|------|-----------|--------|--------|
| Headings | (ví dụ: Plus Jakarta Sans) | Google Fonts | `@import url(...)` |
| Body | (ví dụ: Inter) | Google Fonts | `@import url(...)` |
| Monospace | (ví dụ: JetBrains Mono) | Google Fonts | `@import url(...)` |

### Font Tokens Changed

| Token | SprouX Original | New Value | Reason |
|-------|----------------|-----------|--------|
| `--font-body` | Inter | | |
| `--font-heading` | Fraunces | | |
| `--font-size-*` | (nếu thay đổi) | | |
| `--font-weight-*` | (nếu thay đổi) | | |
| `--line-height-*` | (nếu thay đổi) | | |

### Typography Scale

| Level | Class | Font | Size | Weight | Line Height | Usage |
|-------|-------|------|------|--------|-------------|-------|
| Display | `typo-display-*` | Heading | | | | Hero sections |
| H1 | `typo-heading-3xl` | Heading | | | | Page titles |
| H2 | `typo-heading-2xl` | Heading | | | | Section titles |
| H3 | `typo-heading-xl` | Heading | | | | Card titles |
| Body | `typo-paragraph-base` | Body | | | | Main text |
| Small | `typo-paragraph-sm` | Body | | | | Secondary text |
| Label | `typo-label-*` | Body | | | | Form labels, table headers |
| Code | `typo-code-*` | Mono | | | | Inline code, numbers |

---

## 4. Spacing & Layout

### Spacing Tokens Changed

| Token | SprouX Original | New Value | Reason |
|-------|----------------|-----------|--------|
| `--spacing-3xs` | 4px | | |
| `--spacing-2xs` | 6px | | |
| `--spacing-xs` | 8px | | |
| `--spacing-sm` | 12px | | |
| `--spacing-md` | 16px | | |
| `--spacing-lg` | 20px | | |
| `--spacing-xl` | 24px | | |
| `--spacing-2xl` | 32px | | |
| `--spacing-3xl` | 40px | | |

(Chỉ ghi các tokens đã thay đổi, bỏ trống nếu giữ nguyên)

### Border Radius

| Token | SprouX Original | New Value | Style Note |
|-------|----------------|-----------|------------|
| `--radius-sm` | 4px | | |
| `--radius-md` | 6px | | |
| `--radius-lg` | 8px | | |
| `--radius-xl` | 12px | | |
| `--radius-2xl` | 16px | | |
| `--radius-full` | 9999px | | |

---

## 5. Shadows

| Token | SprouX Light | New Light | SprouX Dark | New Dark |
|-------|-------------|-----------|-------------|----------|
| `--shadow-xs` | | | | |
| `--shadow-sm` | | | | |
| `--shadow-md` | | | | |
| `--shadow-lg` | | | | |
| `--shadow-xl` | | | | |
| `--shadow-2xl` | | | | |

**Shadow strategy**: (subtle / medium / dramatic)
**Glassmorphism**: (yes/no — nếu yes, ghi `backdrop-blur` values)

---

## 6. Component Customizations

### Components đã customize visual

| Component | What Changed | Before (SprouX) | After |
|-----------|-------------|-----------------|-------|
| Card | border radius, shadow | radius-lg, shadow-sm | |
| Button | radius, padding | radius-md | |
| Sidebar | bg color, active style | | |
| Badge | radius, border | | |
| Table | row hover, header | | |
| Input | border, focus ring | | |
| Avatar | shape | circle | |
| Tabs | indicator style | underline | |
| Dialog | backdrop, border | | |
| (thêm nếu cần) | | | |

### Custom Components tạo mới

| Component | File | Purpose | Props |
|-----------|------|---------|-------|
| | | | |
| | | | |

---

## 7. Verification Results

| Check | Status | Notes |
|-------|--------|-------|
| All components render with new tokens | ✅/❌ | |
| Light mode matches art direction | ✅/❌ | |
| Dark mode contrast ≥ 4.5:1 | ✅/❌ | |
| Typography hierarchy clear | ✅/❌ | |
| Spacing rhythm consistent | ✅/❌ | |
| `pnpm build` pass | ✅/❌ | |
| Chart colors visible in both modes | ✅/❌ | |

---

## 8. Font Installation Guide

(Cho người mua template — sẽ include trong documentation)

### Required Fonts
1. **{Font Name}** — [Download link]
   - Weights needed: Regular (400), Medium (500), SemiBold (600), Bold (700)
2. **{Font Name}** — [Download link]
   - Weights needed: ...
3. **{Monospace Font}** — [Download link]
   - Weights needed: Regular (400)

### How to Install
- **Web (React app)**: Already imported via Google Fonts in `index.css`
- **Figma**: Download from Google Fonts → Install on system → Restart Figma
