# Component Size System — ShopPulse SaaS Template

## Spacing Scale (Foundation)
All sizes derive from the spacing scale defined in `src/index.css`:

| Token | px Value |
|-------|----------|
| 4xs   | 2px      |
| 3xs   | 4px      |
| 2xs   | 6px      |
| xs    | 8px      |
| sm    | 12px     |
| md    | 16px     |
| lg    | 20px     |
| xl    | 24px     |
| 2xl   | 32px     |
| 3xl   | 40px     |
| 4xl   | 48px     |
| 5xl   | 56px     |
| 6xl   | 64px     |

---

## Component Size Variants

### Button

| Size | Height | Padding | Gap | Icon Size | Font | Usage |
|------|--------|---------|-----|-----------|------|-------|
| **lg** | h-3xl (40px) | px-xl (24px) | gap-xs (8px) | size-md (16px) | typo-paragraph-sm-bold | CTA buttons, prominent actions |
| **default** | h-9 (36px) | px-md (16px) | gap-xs (8px) | size-md (16px) | typo-paragraph-sm-bold | Standard buttons (default) |
| **sm** | h-2xl (32px) | px-sm (12px) | gap-2xs (6px) | size-md (16px) | typo-paragraph-sm-bold | Compact actions, tables |
| **xs** | h-xl (24px) | px-xs (8px) | gap-2xs (6px) | size-md (16px) | typo-paragraph-mini-bold | Mini buttons, inline actions |
| **icon** | size-9 (36×36px) | — | — | size-md (16px) | — | Icon-only, centered content |
| **icon-sm** | size-2xl (32×32px) | — | — | size-md (16px) | — | Smaller icon-only buttons |
| **icon-lg** | size-3xl (40×40px) | — | — | size-md (16px) | — | Larger icon-only buttons |
| **icon-xs** | size-xl (24×24px) | — | — | size-md (16px) | — | Mini icon-only buttons |

**Gap note**: Icon + label gap = xs (8px), controlled by `gap-xs` class.

---

### Input

| Size | Height | Padding X | Padding Y | Border Radius | Font | Inner Addon Offset |
|------|--------|-----------|-----------|---------------|------|-------------------|
| **lg** | h-3xl (40px) | px-md (16px) | — | rounded-lg (8px) | typo-paragraph-sm | pl-3xl/pr-3xl (icon/prefix offset) |
| **default** | h-9 (36px) | px-sm (12px) | — | rounded-lg (8px) | typo-paragraph-sm | pl-3xl/pr-3xl |
| **sm** | h-2xl (32px) | px-xs (8px) | — | rounded-lg (8px) | typo-paragraph-sm | pl-3xl/pr-3xl |
| **xs** | h-xl (24px) | px-2xs (6px) | — | rounded-sm (4px) | typo-paragraph-mini | pl-3xl/pr-3xl |

**Icon/Prefix positioning**: Absolute left/right with `left-3`/`right-3` offset. Icon size = size-md (16px).
**Max-width**: 320px (`max-w-xs`) for consistent form layouts.

---

### Select

| Size | Height | Padding (left/right) | Gap | Font | Icon Size |
|------|--------|----------------------|-----|------|-----------|
| **lg** | h-3xl (40px) | pl-md pr-xs (16px / 8px) | gap-sm (12px) | typo-paragraph-sm | size-md (16px) |
| **default** | h-9 (36px) | pl-sm pr-xs (12px / 8px) | gap-xs (8px) | typo-paragraph-sm | size-md (16px) |
| **sm** | h-2xl (32px) | px-xs (8px) | gap-2xs (6px) | typo-paragraph-sm | size-md (16px) |
| **xs** | h-2xl (32px) | px-2xs (6px) | gap-1 (4px?) | typo-paragraph-sm | size-md (16px) |

**Chevron icon**: Always size-md (16px), positioned right with `shrink-0`.

---

### Badge

| Type | Size | Height | Padding X | Padding Y | Gap | Font | Icon Size |
|------|------|--------|-----------|-----------|-----|------|-----------|
| **Badge** | sm | h-lg (20px) | px-2xs (6px) | — | gap-3xs (4px) | typo-paragraph-mini-bold | size-sm (12px) |
| **Badge** | default | h-xl (24px) | px-xs (8px) | — | gap-3xs (4px) | typo-paragraph-mini-bold | size-sm (12px) |
| **Badge** | lg | h-[28px] | px-sm (12px) | py-3xs (4px) | gap-2xs (6px) | typo-paragraph-sm-medium | size-md (16px) |
| **BadgeRound** | sm | size-lg (20×20px) | — | — | — | typo-paragraph-mini-bold | size-sm (12px) |
| **BadgeRound** | default | size-xl (24×24px) | — | — | — | typo-paragraph-mini-bold | size-sm (12px) |
| **BadgeRound** | lg | size-[28px] | — | — | — | typo-paragraph-sm-medium | size-md (16px) |
| **BadgeDot** | sm | size-3xs (4×4px) | — | — | — | — | — |
| **BadgeDot** | default | size-xs (8×8px) | — | — | — | — | — |
| **BadgeDot** | lg | size-sm (12×12px) | — | — | — | — | — |

---

### Checkbox

| Aspect | Value | Notes |
|--------|-------|-------|
| **Size** | size-md (16×16px) | Fixed, no variants |
| **Border radius** | rounded-sm (4px) | Rounded square |
| **Border weight** | 1px | border-border-strong |
| **States** | unchecked, checked, indeterminate | Via Radix state |
| **Icon inside** | Check (14px) / Minus (14px) | Lucide icons |

---

### Switch

| Aspect | Value |
|--------|-------|
| **Track height** | h-[18px] |
| **Track width** | w-[33px] |
| **Thumb size** | size-md (16×16px) |
| **Thumb shape** | rounded-full (pill) |
| **States** | unchecked → bg-border, checked → bg-primary |
| **Transition** | data-[state=checked]:translate-x-[15px] |

---

### Avatar

| Size | Dimension | Aspect | Border |
|------|-----------|--------|--------|
| **sm** | size-8 (32×32px) | square | 1px border-border |
| **default** | size-10 (40×40px) | square | 1px border-border |
| **lg** | size-14 (56×56px) | square | 1px border-border |

**Border radius**: rounded-full (entire edge, circular).
**Fallback text**: typo-paragraph-sm-bold, bg-muted.

---

### Search Box

| Aspect | Value |
|--------|-------|
| **Height** | h-9 (36px) |
| **Width** | w-full |
| **Border radius** | rounded-full (pill shape) |
| **Padding** | pl-3xl pr-md (icon/clear offset) |
| **Left icon** | size-[16px], absolute left-md |
| **Right icon/Badge** | size-[14px] or kbd h-[20px] |
| **Font** | sp-body (Inter 400 14px) |

---

### Textarea

| Aspect | Value |
|--------|-------|
| **Min height** | min-h-[76px] (4 lines approx) |
| **Width** | w-full |
| **Padding** | p-xs (8px all sides) |
| **Border radius** | rounded-lg (8px) |
| **Font** | text-sm, font-normal |
| **Border** | 1px border-border |

**States**: default, focus, error (aria-invalid), disabled.

---

## Key Design Patterns

### 1. Height Grid (Vertical Rhythm)
All interactive components follow these heights:
- **24px** (xs): Mini, inline actions
- **32px** (sm): Compact form controls
- **36px** (default): Standard form controls, search bars
- **40px** (lg): Large buttons, prominent CTAs
- **Custom**: 18px (Switch track), 28px (Badge)

### 2. Padding Grid (Horizontal Rhythm)
- **Icon addon offset**: `pl-3xl` / `pr-3xl` (24px from edge)
- **Form padding**: xs (8px) → sm (12px) → md (16px) → xl (24px)
- **Icon/inner addon gap**: xs (8px)
- **Interior gap (icon + label)**: xs (8px) in buttons, 2xs (6px) in small buttons

### 3. Icon Sizing
- **Standard icon**: size-md (16×16px) — all buttons, inputs, badges
- **Small icon**: size-sm (12×12px) — badge, badge round sm
- **Mini badge dot**: size-3xs → size-xs (4px → 8px)

### 4. Form Controls Width Constraint
- **Max-width**: 320px (max-w-xs) — enforced per component instance
- **Input styles**: All 4 sizes (xs/sm/default/lg) respect this 320px boundary in form layouts

### 5. Font Consistency
- **Body text (14px)**: typo-paragraph-sm, used in lg/default/sm buttons, inputs, select
- **Mini text (12px)**: typo-paragraph-mini, used in xs buttons, badges, labels
- **Bold variants**: typo-paragraph-sm-bold (buttons), typo-paragraph-mini-bold (badges)

---

## Translation to Figma JSON (for Plugin)

When generating Figma components, map as follows:

```json
{
  "Button": {
    "Size": {
      "lg": { "height": 40, "paddingX": "md", "gap": "xs" },
      "default": { "height": 36, "paddingX": "md", "gap": "xs" },
      "sm": { "height": 32, "paddingX": "sm", "gap": "2xs" },
      "xs": { "height": 24, "paddingX": "xs", "gap": "2xs" }
    }
  },
  "Input": {
    "Size": {
      "lg": { "height": 40, "paddingX": "md", "radius": "lg" },
      "default": { "height": 36, "paddingX": "sm", "radius": "lg" },
      "sm": { "height": 32, "paddingX": "xs", "radius": "lg" },
      "xs": { "height": 24, "paddingX": "2xs", "radius": "sm" }
    }
  }
}
```

Spacing tokens bind to Figma variables (e.g., `spacing/md`, `spacing/xs`).

---

## Summary

**9 UI components** with size variants across **1-7 sizes each**:
- Button: 8 sizes (lg, default, sm, xs, icon, icon-sm, icon-lg, icon-xs)
- Input: 4 sizes (lg, default, sm, xs)
- Select: 4 sizes (lg, default, sm, xs)
- Badge: 3 types × 3 sizes (9 combos)
- Checkbox: 1 size (fixed)
- Switch: 1 size (fixed)
- Avatar: 3 sizes (sm, default, lg)
- Search Box: 1 size (fixed)
- Textarea: 1 size (min-height only)

**Color inheritance**: All components use semantic tokens (foreground, muted-foreground, primary, etc.) — no hardcoded hex values.

**Responsive behavior**: Sizes are fixed per variant; responsive adaptation happens at the layout/wrapper level.

---

## Figma Size Variable Collection

Separate collection (5th) from spacing. `scopes: ["WIDTH_HEIGHT"]`, FLOAT type. Contains 28 variables:

### Height Tokens
| Variable | Value | Component |
|----------|-------|-----------|
| height/lg | 40px | Button lg, Input lg, Select lg |
| height/default | 36px | Button default, Input default, Select default, SearchBox |
| height/sm | 32px | Button sm, Input sm, Select sm |
| height/xs | 24px | Button xs, Input xs |

### Width Tokens
| Variable | Value | Component |
|----------|-------|-----------|
| width/input | 320px | Input, Select, Textarea, Combobox, SearchBox (minWidth) |

### Icon-Only Button
| Variable | Value |
|----------|-------|
| icon/lg | 40px |
| icon/default | 36px |
| icon/sm | 32px |
| icon/xs | 24px |

### Badge
| Variable | Value |
|----------|-------|
| badge/sm | 20px |
| badge/default | 24px |
| badge/lg | 28px |
| badge-round/sm | 20px |
| badge-round/default | 24px |
| badge-round/lg | 28px |
| badge-dot/sm | 4px |
| badge-dot/default | 8px |
| badge-dot/lg | 12px |

### Indicator Components
| Variable | Value | Component |
|----------|-------|-----------|
| checkbox | 16px | Checkbox (w+h) |
| radio | 16px | Radio (w+h) |
| switch/track-w | 33px | Switch track width |
| switch/track-h | 18px | Switch track height |
| switch/thumb | 16px | Switch thumb (w+h) |

### Avatar
| Variable | Value |
|----------|-------|
| avatar/sm | 32px |
| avatar/default | 40px |
| avatar/lg | 56px |

### Binding Rules
- **`widthVar`/`heightVar`** → FIXED size (Badge, icon-only Button, Checkbox, Switch, Avatar)
- **`minWidthVar`/`minHeightVar`** → form components that fill container (Input, Select, etc.)
- **indicator.widthVar/heightVar** → indicator sub-frame (Checkbox, Radio, Switch)
- Plugin function: `findSizeVar(name)` + `bindSizeVar(node, field, varName)` — NO pixel fallback
