# Plugin JSON Spec Patterns

Master reference for all JSON spec types consumed by the "Generate SaaS Template" Figma plugin.
Each section documents the structure, rules, and lessons learned for that specific type.

---

## Golden Rule — Web React = Source of Truth

The **web React SaaS app** (`products/{NNN}/001-saas-templates/`) is the **single source of truth** for ALL Figma plugin generation — variables, text styles, effect styles, icons, components, UI features, or any other asset.

**Every creation, update, or modification** in JSON specs must reference and match the current web React implementation:
- **Component properties** → match web Design System Explore controls exactly (no extra, no missing)
- **Variant values** → use the same labels/options as the web Explore dropdowns
- **Design tokens** → match CSS custom properties and Tailwind tokens used in the React code
- **Visual output** → the Figma result must look identical to the running web app

Before writing or editing any JSON spec, **always check the corresponding web source code first** (components in `src/components/ui/`, pages in `src/pages/`, styles in `src/index.css`).

### Figma Component = Web Variant 1:1 Principle

A Figma ComponentSet is a **flat matrix** of all property combinations. Each **Figma variant** (one cell in the matrix) must be **visually identical** to the web component rendered with the same property values.

**How it works:**

1. **Web Explore controls define Figma properties.**
   The `*Docs()` function in `design-system/index.tsx` has an `ExploreBehavior` with controls (dropdowns, toggles). Each control = one Figma variant axis. Each option in that control = one value for that axis.

2. **One property value = one Figma variant slice.**
   When the user selects `Variant=Outline` on the web Explore, the component renders with specific CSS classes. The Figma variant `Variant=Outline` must produce the **exact same visual**: same fill, same stroke, same text color, same radius, same padding, same font.

3. **Extract specs directly from web CSS.**
   For each property value, read the corresponding CSS class / Tailwind utility in `src/components/ui/*.tsx` and `src/index.css`. Convert every CSS property to its Figma JSON equivalent:
   - `bg-primary` → `"fill": "primary"`
   - `border border-border` → `"stroke": "border"` (strokeWeight 1). Per-side: `border-y border-r` → `"stroke": "border", "strokeSides": "top,right,bottom"`. Values: `"all"` (default) or comma-separated `"top,right,bottom,left"`
   - `rounded-2xl` → `"radius": "2xl"` (16px)
   - `px-sm` → `"paddingX": 12` (or `"paddingX": "sm"`)
   - `h-xl` → `"height": 24`
   - `opacity-50` / `disabled:opacity-50` → `"opacity": 0.5`
   - `focus-visible:ring-[3px] ring-ring` → `"focusRing": "ring"`
   - `hover:bg-ghost-hover` → compound `"Variant=Ghost,State=Hover": { "fill": "ghost-hover" }`

4. **Compound variants for state × style combinations.**
   When web applies different hover/focus styles per variant (e.g. Destructive uses `ring-error` instead of `ring`), create compound keys: `"Variant=Destructive,State=Focus": { "focusRing": "ring-error" }`.

5. **Verify by inspection.**
   After generating, visually compare every Figma variant against the web Explore at the same property values. Any visual difference = JSON spec is wrong.

**Checklist for each component JSON:**
- [ ] `properties` keys & values match web Explore controls exactly
- [ ] Boolean-like properties use `"Yes"/"No"` (NEVER `"True"/"False"`) — includes Open, End Item, Show Label, Show Icon, etc.
- [ ] All `showWhen`, `variantStyles` keys, instance `variants`, and `examples` props use matching `"Yes"/"No"` values
- [ ] `base` specs match the web default state CSS (first value of each property)
- [ ] Every `variantStyles` entry has specs extracted from the web CSS for that specific property value
- [ ] Compound variants cover all cross-axis style differences (e.g. hover colors per variant)
- [ ] No hardcoded colors — only semantic tokens that resolve via Figma variables
- [ ] Group+Item: item at index 0, parent uses `"type": "instance"` referencing item, both in same JSON file

### Component Structure Rules

- **1 web Docs page = 1 JSON file**. The number of JSON component files must match the number of `*Docs()` functions in the design system page exactly — no extra, no missing.
- **Never split** a single web component into multiple JSON components. If the web shows Badge, BadgeRound, BadgeDot under ONE `BadgeDocs()` page, the JSON must represent them as ONE component (use a `Type` property to create variants, e.g. `Type: ["Badge", "Round", "Dot"]`).
- **Never merge** separate web components into one JSON. If the web has separate `DialogDocs()` and `AlertDialogDocs()`, they must be separate JSON files.
- **Compound components** (parent + child pattern like ToggleGroup + ToggleGroupItem) that are documented WITHIN another component's Docs page should be included in that component's JSON file, not as a separate file.
- **Sub-component naming**: When a Docs page covers multiple sub-components (e.g. Badge + BadgeRound + BadgeDot), add a variant property (typically `Type` or `Shape`) to create all sub-component variants within ONE ComponentSet in Figma.
- **Multi-component JSON file**: When a sub-component (item) belongs to a parent component (group) and they share ONE `*Docs()` page on the web, put BOTH in ONE JSON file as `"components": [ItemSpec, ParentSpec]`. Item MUST be first (index 0) so plugin generates it before the parent. **NEVER create a separate JSON file for the item** — one Docs page = one JSON file, always. Examples: `input-otp.json` contains `[OTP Slot, Input OTP]`, `tabs.json` contains `[Tabs Item, Tabs]`, `navigation-menu.json` contains `[Nav Menu Item, Navigation Menu]`. Only create a separate file when the sub-component is shared across MULTIPLE parent Docs pages (e.g. `day-cell.json` used by both Calendar and DatePicker).
- **Item component rendering rule**: Item components (Tabs Item, Nav Menu Item, etc.) that display text + optional icon must use the **default icon+label flow** (`textContent` + `iconLeft`/`iconRight` in variantStyles). **NEVER use `children` array** on item components — `children` skips the default text/icon rendering entirely. Reserve `children` for parent/group components that compose instances with `hideLabel: true`. For conditional icons (e.g. ChevronDown only on Type=Trigger), set `iconRight: true` + `iconRightName` in the relevant variantStyle key.
- **Component naming = web heading**: The `"name"` in JSON must match the `<h1>` heading on the web Design System page exactly. If web says "Tabs", JSON must be `"name": "Tabs"`, NOT "Tabs Group". Check the `*Docs()` function heading before writing JSON.

---

## Table of Contents

1. [Variables (Foundation)](#1-variables-foundation)
2. [Text Styles (Foundation)](#2-text-styles-foundation)
3. [Effect Styles (Foundation)](#3-effect-styles-foundation)
4. [Icons (Foundation)](#4-icons-foundation)
5. [Components (ComponentSet + Variants)](#5-components-componentset--variants)
6. [Showcase (Auto-generated from Component)](#6-showcase-auto-generated-from-component)
7. [Foundation Docs (Visual Documentation)](#7-foundation-docs-visual-documentation)
8. [Screens (Page UI Generation)](#8-screens-page-ui-generation)

---

## 1. Variables (Foundation)

**Plugin function**: `doCreateVariables(spec)`
**JSON file**: `foundation-variables.json`
**Type key**: `"type": "foundation-variables"`

### Structure

```json
{
  "type": "foundation-variables",
  "collections": [
    {
      "name": "raw colors",
      "modes": ["Value"],
      "scopes": [],
      "hiddenFromPublishing": true,
      "variables": [
        {
          "name": "violet/600",
          "type": "COLOR",
          "values": { "Value": "#7c3aed" }
        }
      ]
    },
    {
      "name": "semantic colors",
      "modes": ["Light", "Dark"],
      "variables": [
        {
          "name": "primary",
          "type": "COLOR",
          "scopes": ["ALL_FILLS", "STROKE_COLOR"],
          "values": {
            "Light": "$raw colors/violet/600",
            "Dark": "$raw colors/violet/600"
          }
        }
      ]
    }
  ]
}
```

### Rules

- **Collections** are created in order — raw colors FIRST, semantic SECOND (aliases need raw to exist)
- **Alias syntax**: `"$collectionName/varName"` (dollar prefix + full path)
- **Variable types**: `"COLOR"`, `"FLOAT"`, `"STRING"`
- **Scopes** control which Figma pickers show the variable:
  - `[]` = hidden from all pickers (raw colors)
  - `["FRAME_FILL"]`, `["TEXT_FILL"]`, `["STROKE_COLOR"]`, `["ALL_FILLS"]`, `["EFFECT_COLOR"]`
  - Omit = ALL_SCOPES (default)
- **hiddenFromPublishing**: `true` hides from team library (for raw colors)
- **Modes**: Each mode key in `values` must match a mode name in `modes[]`
- **Color format**: Hex string `"#7c3aed"` or hex with alpha `"#ffffff0f"` or `"#00000099"`

### Lessons Learned

| Issue | Fix |
|-------|-----|
| Alias not found | Ensure referenced collection is earlier in `collections[]` array |
| Variable name collision | Plugin stores by full path `collectionName/varName` AND short name — short name uses first-registered wins |
| RGBA hex | Plugin `parseColor()` handles 8-digit hex: `"#000000b3"` = black at 70% opacity |
| Scopes not working | Must be an array of valid Figma scope strings — typos silently fail |
| Variable used as fill but only has `STROKE_COLOR` scope | Add `FRAME_FILL` (and `SHAPE_FILL` if needed) to scopes. `setBoundVariableForPaint` binds regardless of scope, but Figma UI won't show the binding. Always cross-check: if a component JSON uses `fill: "tokenName"`, the variable MUST have `FRAME_FILL` or `ALL_FILLS` scope. |

---

## 2. Text Styles (Foundation)

**Plugin function**: `doCreateTextStyles(spec)`
**JSON file**: `foundation-text-styles.json`
**Type key**: `"type": "foundation-text-styles"`

### Structure

```json
{
  "type": "foundation-text-styles",
  "styles": [
    {
      "name": "SP/H1",
      "fontFamily": "Plus Jakarta Sans",
      "fontStyle": "ExtraBold",
      "fontSize": 36,
      "lineHeight": 40,
      "letterSpacing": "-0.02em",
      "textCase": "UPPER"
    }
  ]
}
```

### Rules

- **name**: Figma text style name — uses `/` for grouping (e.g. `"SP/Body"`, `"SP/KPI Hero"`)
- **fontFamily**: Exact family name — `"Plus Jakarta Sans"`, `"Inter"`, `"JetBrains Mono"`
- **fontStyle**: Exact style — `"Regular"`, `"Medium"`, `"SemiBold"`, `"Bold"`, `"ExtraBold"`
- **fontSize**: Number in px
- **lineHeight**: Number in px (optional, uses Figma default if omitted)
- **letterSpacing**: String in em format `"-0.02em"`, `"0.05em"` → converted to PERCENT internally. Or number in px.
- **textCase**: `"UPPER"`, `"LOWER"`, `"TITLE"`, `"ORIGINAL"` (optional)

### Lessons Learned

| Issue | Fix |
|-------|-----|
| Font not loading | `loadFontSafe()` handles `"SemiBold"` → `"Semi Bold"` fallback. If still fails, falls back to Inter Regular |
| letterSpacing em conversion | Plugin converts em to percent: `0.05em` → `5%`. This is correct for Figma. |
| Missing lineHeight | Omit field = Figma default (AUTO). Prefer explicit value for consistency. |

---

## 3. Effect Styles (Foundation)

**Plugin function**: `doCreateEffectStyles(spec)`
**JSON file**: `foundation-effects.json`
**Type key**: `"type": "foundation-effects"`

### Structure

```json
{
  "type": "foundation-effects",
  "styles": [
    {
      "name": "Shadows/md",
      "effects": [
        { "type": "INNER_SHADOW", "color": "#ffffff", "alpha": 0.05, "x": 0, "y": 1, "radius": 0, "spread": 0 },
        { "type": "DROP_SHADOW", "color": "#000000", "alpha": 0.4, "x": 0, "y": 4, "radius": 8, "spread": -2 }
      ]
    },
    {
      "name": "Glass/card",
      "effects": [
        { "type": "BACKGROUND_BLUR", "radius": 12 }
      ]
    }
  ]
}
```

### Rules

- **name**: Uses `/` for grouping — `"Shadows/sm"`, `"Glass/card"`, `"Glow/accent"`
- **Effect types**: `"DROP_SHADOW"`, `"INNER_SHADOW"`, `"LAYER_BLUR"`, `"BACKGROUND_BLUR"`
- **Shadow fields**: `type`, `color` (hex), `alpha` (0-1), `x`, `y`, `radius`, `spread`
- **Blur fields**: `type`, `radius` (no color/offset needed)
- **Multiple effects**: Array order matters — first effect is rendered on top in Figma
- **alpha**: Separate from color hex — `"color": "#000000", "alpha": 0.4` (NOT `"color": "#00000066"`)

### Lessons Learned

| Issue | Fix |
|-------|-----|
| Shadow missing blendMode | Plugin adds `"blendMode": "NORMAL"` automatically — no need in JSON |
| Blur type wrong | `BACKGROUND_BLUR` for glassmorphism, `LAYER_BLUR` for gaussian blur on the element itself |
| Negative spread | Figma supports negative spread — `"spread": -4` is valid and commonly used |

---

## 4. Icons (Foundation)

**Plugin function**: `doCreateIcons(spec)`
**JSON file**: `foundation-icons.json`
**Type key**: `"type": "foundation-icons"`

### Structure

```json
{
  "type": "foundation-icons",
  "targetPage": "🔣 Icons",
  "size": 24,
  "icons": [
    {
      "name": "Search",
      "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/></svg>"
    }
  ]
}
```

### Rules

- **targetPage**: Figma page name to place icons on — created if doesn't exist
- **size**: Icon component size in px (default 24)
- **name**: Used for Figma component name as `"Icon / {name}"` — must match Lucide icon name exactly (used by `findIconComponent()` lookup in component generation)
- **svg**: Full SVG string from Lucide — `stroke="currentColor"` gets replaced with foreground variable binding
- Plugin creates a **showcase frame** automatically: `"Icons — Showcase"` with grid layout

### Lessons Learned

| Issue | Fix |
|-------|-----|
| Icon not found during component gen | Icon name in component `iconLeftName`/`iconRightName` must exactly match icon `name` in icons JSON |
| SVG stroke not binding | Plugin binds ALL vector strokes to `foreground` variable. Ensure SVG uses `stroke="currentColor"` |
| Icon fills appearing white | Vectors with non-zero opacity fills also get bound to foreground. Transparent fills (opacity=0) are skipped. |
| Showcase icon cards | Each card: 80×60px FIXED, `setFill(card, "card")`, 12px top pad, 8px sides |

---

## 5. Components (ComponentSet + Variants)

**Plugin function**: `doCreateComponents(spec)`
**JSON files**: `components/*.json`

### Structure

```json
{
  "components": [
    {
      "name": "Button",
      "description": "...",
      "category": "Actions",
      "installation": {
        "dependencies": "pnpm add @radix-ui/react-button",
        "import": "import { Button } from \"@/components/ui/button\""
      },

      "properties": {
        "Variant": ["Primary", "Secondary"],
        "Size": ["Large", "Regular"],
        "State": ["Default", "Hover", "Focus", "Disabled"],
        "Icon": ["None", "Left", "Right", "Both", "Icon Only"]
      },

      "base": {
        "layout": "horizontal",
        "primaryAlign": "center",
        "counterAlign": "center",
        "width": 120,
        "height": 36,
        "gap": 8,
        "fill": "primary",
        "stroke": "none",
        "radius": "lg",
        "paddingX": 16,
        "paddingY": 0,
        "textStyle": "SP/Body Semibold",
        "textContent": "Button",
        "textFill": "primary-foreground",
        "iconSize": 16
      },

      "variantStyles": {
        "Variant=Primary": { "fill": "primary", "textFill": "primary-foreground" },
        "State=Disabled": { "opacity": 0.5 },
        "Icon=Left": { "iconLeft": true, "iconLeftName": "Plus" },
        "Variant=Primary,State=Hover": { "fill": "primary-hover" }
      },

      "examples": [...],
      "props": [...],
      "designTokens": [...],
      "bestPractices": [...],
      "figmaMapping": [...],
      "accessibility": {...},
      "related": [...]
    }
  ]
}
```

### properties Rules

- **Must match web ExploreBehavior controls 100%** — same axes, same option count
- Each key = Figma variant axis → creates ComponentSet property
- Values use **Title Case**: `"Default"`, `"Ghost Muted"`, `"Icon Only"`
- **Boolean-like properties MUST use `"Yes"/"No"`** — NEVER `"True"/"False"`. Applies to: Switch/toggle controls on web (Open, End Item, Show Label, Show Icon, etc.), any 2-value property that represents on/off, show/hide, or presence/absence. Example: `"End Item": ["No", "Yes"]`, `"Open": ["No", "Yes"]`, `"Show Label": ["No", "Yes"]`. This convention matches Figma's native boolean property format. Using `"True"/"False"` causes variant mismatch and fallback to wrong variant.
- **Variant count** = product of all axis lengths. Target under 600 for performance.
- Check web `*Docs()` function in `design-system/index.tsx` for exact controls

### variantRestrictions Rules

Figma ComponentSet rule: **ALL variants MUST have ALL properties** with at least 1 value. Properties are NEVER hidden — they show restricted values instead.

Use `variantRestrictions` to filter out invalid combinations from the full cross product:

```json
"variantRestrictions": {
  "Type=Ellipsis": {
    "State": ["Default"],
    "Active": ["False"]
  },
  "Type=Previous": {
    "Active": ["False"]
  }
}
```

**Format**: `{ "condition": { "property": ["allowed", "values"] } }`
- **Condition key**: comma-separated `Property=Value` pairs (same syntax as variantStyles compound keys)
- **Value**: object mapping property names to arrays of allowed values
- When condition matches a combo, the combo is kept ONLY if its property value is in the allowed list

**Plugin behavior**: After building full combos array (step 1), step 1.1 reads `variantRestrictions` and filters invalid combos before creating variants. Example: Type(4) × State(3) × Active(2) = 24 combos → after restrictions → 13 valid variants.

**Web DS pattern** (3 rules for Explore controls):
1. **Pill buttons** (State/Type selectors): Show restricted option list per Type — `(type === "ellipsis" ? ["default"] : ["default", "hover", "disabled"]).map(...)`
2. **Switch/toggle** (boolean props): Show but `disabled` when not applicable — `<Switch disabled={type !== "page"} />`
3. **Reset on change**: When Type changes to a restricted value, reset dependent props — `if (type === "ellipsis") setState("default")`

### base Rules

- `width`, `height`, `iconSize` must be **numbers** — Figma `resize()` rejects strings
- `paddingX`, `paddingY`, `gap` should be **string tokens** (e.g. `"xs"`, `"md"`, `"xl"`) for Figma variable binding. Use numbers only for `0`. Token map: `2xs=6, xs=8, sm=12, md=16, lg=20, xl=24, 2xl=32, 3xl=40`
- `width` should match web CSS width: Input/Select/Textarea = 320, Button = 120
- `fill`/`stroke`/`textFill` = **semantic token names** only (e.g. `"primary"`, `"border"`)
- Never use hex colors or Tailwind scale names (`violet-600`, `zinc-200`)
- `textStyle` must match existing Figma text style: `"SP/Body"`, `"SP/Body Semibold"`, `"SP/Caption"`, etc.
- `"stroke": "none"` = no border
- `labelFill: true` → text node gets `textAutoResize="TRUNCATE"`, `maxLines=1`
- **`textContent` NOT `text`**: Plugin reads `merged.textContent` for label/placeholder text. Using `text` will produce empty text nodes.
- **`textStyle` = Figma text style name**: Must use exact Figma text style names from `foundation-text-styles.json` (e.g. `"SP/Body"`, `"SP/Body Semibold"`, `"SP/Label"`). NEVER use CSS class names (`"sp-paragraph-sm"`, `"typo-paragraph-sm"`). Mapping: `typo-paragraph-sm` = `"SP/Body"` (Inter Regular 14/20).
- **`gap: 0` when no gap needed**: If gap is omitted, plugin defaults to `8` (hardcoded number, no variable binding). Set `"gap": 0` explicitly to avoid unwanted gap with no variable token.

### variantStyles Rules

- **Single key**: `"PropertyName=ValueName"` — exact match with `properties`
- **Compound key**: `"Variant=Primary,State=Hover"` — comma-separated, **no spaces around comma**
- Empty object `{ }` is valid for "no override needed" variants
- **Icon props** — BOTH boolean flag AND name are required:
  - `iconLeft: true` — **required** to show left icon (plugin checks `merged.iconLeft`)
  - `iconRight: true` — **required** to show right icon (plugin checks `merged.iconRight`)
  - `iconLeftName: "Plus"` — Lucide icon name (must exist in Icons foundation)
  - `iconRightName: "ChevronRight"` — Lucide icon name
  - Setting only `iconLeftName`/`iconRightName` WITHOUT `iconLeft: true`/`iconRight: true` will NOT render icons
- `hideLabel: true` — hides the text node (for icon-only variants, or image-fill variants like Avatar). **Do NOT use** for form components (Input/Select/Textarea) — their label IS the placeholder/value text and must be visible.
- `imageUrl: "https://..."` — fetches external image and sets as IMAGE fill on the component frame. URL must be **direct** (no redirects) — Figma plugin sandbox blocks cross-domain redirects. Pre-fetched by UI before sending to plugin.
- `clipsContent: true` — clips content to frame shape. **TWO use cases**: (1) Avatar/rounded cards with image — clip for circular/rounded shape. (2) **Components with `focusRing`** — Figma requires clip content enabled for DROP_SHADOW effect styles to render. Set in `base`. Plugin reads from spec (`!!merged.clipsContent`), defaults to `false`. **Rule: if component has ANY `focusRing` in variantStyles → `base` MUST have `"clipsContent": true`**.
- `opacity: 0.5` — for disabled states
- **Focus ring** — LUÔN dùng effect style (không manual DROP_SHADOW):
  - **`focusRing: "ring"`** — plugin map `"ring"` → effect style `Ring/default`, `"ring-error"` → `Ring/error`, etc. via `applyFocusRingEffect()`. Dùng cho TẤT CẢ components (form, indicator, standalone).
  - **`effectStyleName: "Ring/default"`** — cách thay thế, gắn trực tiếp effect style by name. Cả hai cách đều kết quả giống nhau.
  - Effect styles phải tồn tại trong Figma (tạo qua `foundation-effects.json`): `Ring/default`, `Ring/error`, `Ring/brand`, `Ring/success`, `Ring/warning`, `Ring/emphasis`
  - **Ring colors bind variable (Light/Dark)**: `foundation-effects.json` có `"variable": "ring"` → plugin bind `boundVariables.color` vào semantic color variable → tự switch Light (zinc-200, red-200...) / Dark (zinc-800, red-900...). Hardcoded hex là fallback khi variable không tìm thấy.
  - **`showShadowBehindNode: false`**: Ring effects PHẢI có `"showShadowBehindNode": false` — tắt "Show behind transparent areas". Nếu không, component có fill trong suốt/alpha (Button Outline, Ghost) hiển thị ring shadow xuyên qua fill → tạo vùng tối giả. Plugin đọc `e.showShadowBehindNode` từ JSON, default `true`.
  - Use instead of `stroke: "ring"` — stroke goes INSIDE and shrinks content; DROP_SHADOW matches web box-shadow behavior
  - Base stroke is preserved (e.g. Checkbox keeps `border-strong` while Focus adds ring effect)
  - Mapping: web `ring-[3px] ring-ring` → `"focusRing": "ring"`, web `ring-[3px] ring-ring-error` → `"focusRing": "ring-error"`
- **Addon decorations** (Input-specific):
  - `textLeft: "https://"` / `textRight: ".com"` — outer addon labels
  - `prefix: "$"` / `suffix: "kg"` — inner short text
- **Indicator pattern** (compound components like Checkbox/Switch/Radio):
  - Set `base.indicator: { width, height, radius }` to enable compound mode
  - Comp becomes transparent HUG wrapper with `gap` between indicator and label
  - Indicator child frame gets `fill`/`stroke`/`radius` from merged styles
  - Icons (`iconLeft`/`iconRight`) go inside the indicator frame
  - Label text goes in comp frame after indicator
  - Use `iconFill` for icon color inside indicator (separate from `textFill` for label)
  - `opacity` stays on comp (affects whole row — used for disabled state)
- **Ellipse pattern** (donut/arc components like Spinner):
  - Set `base.ellipses: [...]` array to create overlapping Figma ellipses with `arcData`
  - Each ellipse spec: `{ name, fill, opacity, innerRadius, arcStart?, arcSweep? }`
  - `innerRadius` (0-1): ratio of inner hole to outer radius (e.g. 0.667 = donut ring)
  - `arcStart` + `arcSweep` (degrees): partial arc segment (e.g. `-90` + `90` = quarter arc starting at top)
  - Without `arcStart`/`arcSweep`: full donut (360°)
  - `opacity` = element-level opacity (matches React CSS `opacity-25`). Do NOT use `fillOpacity` (paint-level) — visual mismatch with React
  - `fill` = semantic token name resolved via `findVar()` (e.g. `"muted-foreground"`, `"primary"`)
  - Ellipses are positioned `layoutPositioning: "ABSOLUTE"` over the comp frame
  - Comp frame must have `hideLabel: true` and typically `paddingX: 0, paddingY: 0, gap: 0`
  - Color variants override entire `ellipses` array (shallow merge — dot notation won't work for nested objects)
  - Size variants only change `width`/`height` — ellipses auto-resize to match comp dimensions
  - Cleanup: plugin removes ELLIPSE children not in current spec's `ellipses` array + adds ellipse names to `_validTF` whitelist
  - Use for: Spinner, Progress rings, any SVG-based donut/arc visual

### children Rules (Compound Layout Components)

For components that need structured multi-section content (Card, Dialog, Alert Dialog, Collapsible, etc.), use a `children` array in `base` instead of the default icon+label flow.

```json
"base": {
  "hideLabel": true,
  "children": [
    { "name": "Title", "type": "text", "textStyle": "SP/H4", "textContent": "Title", "textFill": "foreground" },
    { "name": "Description", "type": "text", "textStyle": "SP/Body", "textContent": "...", "textFill": "muted-foreground" },
    { "name": "Footer", "type": "frame", "layout": "horizontal", "primaryAlign": "end", "counterAlign": "center", "gap": "xs", "showWhen": "ShowFooter=Yes", "children": [
      { "name": "Cancel", "type": "text", "textStyle": "SP/Body Medium", "textContent": "Cancel", "textFill": "muted-foreground" },
      { "name": "Save", "type": "text", "textStyle": "SP/Body Semibold", "textContent": "Save", "textFill": "primary" }
    ]},
    { "name": "Close", "type": "icon", "iconName": "X", "iconSize": 16, "iconFill": "muted-foreground", "showWhen": "ShowClose=Yes" }
  ]
}
```

**Child types**:
- `"text"` — Text node with `textStyle`, `textContent`, `textFill`
- `"frame"` — Auto-layout frame with nested `children`. Supports `layout`, `primaryAlign`, `counterAlign`, `gap`, `width`, `height`, `radius`, `fill`, `stroke`
- `"icon"` — Icon instance with `iconName`, `iconSize`, `iconFill`
- `"divider"` — 1px separator line with `fill` (defaults to `"border"`)
- `"instance"` — Instance of an existing ComponentSet. See **Instance children rule** below.

**Conditional visibility**: `"showWhen": "PropertyName=Value"` — child is only created when the variant combo matches. Supports compound conditions: `"ShowHeader=Yes,State=Default"` (comma-separated, no spaces around comma).

**Mutual exclusivity**: `children` is mutually exclusive with `addon` (textLeft/textRight) and `indicator` patterns. When `children` is present, the normal icon+label flow is skipped entirely.

**Required**: Set `"hideLabel": true` in `base` when using `children` to suppress the default text node.

### Instance Children Rule — Use Existing Components, Never Manual Frames

**CRITICAL**: When a component contains sub-elements that correspond to an existing Figma ComponentSet (Button, Checkbox, Switch, Toggle, Badge, Input, etc.), you **MUST** use `"type": "instance"` to insert a real component instance — **NEVER** recreate them as manual `"type": "frame"` with handcrafted fills/strokes/padding.

**Why**: Manual frames break when the source component is updated, don't inherit design token changes, can't be swapped by users in Figma, and create visual drift between the instance and its source component.

**`"instance"` child spec**:
```json
{
  "name": "Cancel",
  "type": "instance",
  "component": "Button",
  "variants": { "Variant": "Outline", "Size": "Small", "State": "Default", "Icon": "No Icon" },
  "textOverrides": { "Label": "Cancel" },
  "fillWidth": true,
  "showWhen": "Show Action Secondary=Yes"
}
```

| Field | Required | Description |
|---|---|---|
| `component` | Yes | Name of the existing ComponentSet to instantiate (e.g. `"Button"`) |
| `variants` | No | Object mapping property names to values for the desired variant (e.g. `{ "Variant": "Outline", "Size": "Small" }`) |
| `textOverrides` | No | Object mapping text node names inside the instance to new text content (e.g. `{ "Label": "Cancel" }`) |
| `iconOverrides` | No | Object mapping icon node names to icon names (e.g. `{ "Icon Left": "Palette" }`) |
| `overrides` | No | Deep override object for 2-level-deep nested instances (see below) |
| `fillWidth` | No | `true` to set `layoutSizingHorizontal = "FILL"` (default: `"FIXED"`) |
| `heightMode` | No | `"hug"` for HUG height (default: `"FIXED"`) |
| `showWhen` | No | Same conditional visibility as other child types |

#### Deep Overrides on Instance Children (`overrides`)

When an instance contains **nested sub-instances** (2+ levels deep), use `overrides` to reach into them. This calls `applyComponentOverrides()` on the instance after creation.

**Available override types**:

| Key | Purpose | Format |
|---|---|---|
| `overrides.nested` | Change text inside nested child nodes | `{ "ChildNodeName": { "TextNodeName": "new value" } }` |
| `overrides.nestedVariants` | Change variant of nested INSTANCE nodes | `{ "ChildNodeName": { "PropertyName": "Value" } }` |
| `overrides.iconSwap` | Swap icon instances by name | `{ "IconNodeName": "NewIconName" }` |
| `overrides.boolean` | Toggle boolean properties | `{ "PropertyName": true }` |
| `overrides.text` | Change direct text nodes | `{ "TextNodeName": "new value" }` |

**How it works**: Plugin uses `findAll()` (recursive) to locate nodes by name, then applies changes. `nestedVariants` finds INSTANCE nodes → calls `setProperties()`. `nested` finds parent nodes → finds TEXT nodes inside.

**Example — App Header with Navigation Menu**:

Navigation Menu contains Nav Menu Item instances. App Header needs to change which item is active per Page variant:

```json
{
  "type": "instance", "name": "Nav",
  "component": "Navigation Menu",
  "variants": { "Items": "6" },
  "widthMode": "hug",
  "overrides": {
    "nested": {
      "Item 4": { "Label": "Users" },
      "Item 5": { "Label": "Products" },
      "Item 6": { "Label": "Orders" }
    },
    "nestedVariants": {
      "Item 1": { "State": "Default" },
      "Item 2": { "State": "Active" }
    }
  }
}
```

**IMPORTANT**: `instanceOverrides` does NOT exist in the plugin. Always use `overrides` on instance children specs. See common-mistake #106.

**How to determine variant property values**: Open the source ComponentSet in Figma (or read its JSON spec), look at its `properties` map, and use the exact values. Example — Button has `{ "Variant": [...], "Size": [...], "State": [...], "Icon": [...] }`.

**Common components that MUST be used as instances** (when they appear inside another component):
- Button (Action, Cancel, Submit, etc.)
- Checkbox, Switch, Toggle
- Badge, Avatar
- Input, Select, Textarea
- Any other ComponentSet already generated by the plugin

**Before vs After example** — Alert Dialog buttons:

Before (WRONG — manual frame):
```json
{ "name": "Cancel", "type": "frame", "height": 32, "paddingX": "sm", "radius": "lg", "stroke": "border", "fill": "outline", "children": [{ "name": "Label", "type": "text", "textStyle": "SP/Body Semibold", "textContent": "Cancel" }] }
```

After (CORRECT — component instance):
```json
{ "name": "Cancel", "type": "instance", "component": "Button", "variants": { "Variant": "Outline", "Size": "Small", "State": "Default", "Icon": "No Icon" }, "textOverrides": { "Label": "Cancel" } }
```

### Instance Swap Properties (Swappable Sub-components)

When a web React component has elements that can be **selected or swapped** (icon pickers, day cell states, slot variants, etc.), the Figma component must create **instance swap properties** for those elements — not variant properties.

**When to use instance swap**:
- Web component has **sub-components with states** that are visually distinct (e.g., Calendar Day cells with Default/Hover/Today/Selected/Outside/Disabled/Range states)
- Web component has a **fixed icon** that users can swap in Figma (e.g., Alert Dialog's icon circle — always visible, icon is instance swap)
- Web component has a **slot** that can be replaced with different content layouts

**How it works**:
1. **Web**: Create a reusable component (e.g., `DayCell` with `dayCellStyles` map) used in both the visual reference section (DayStatesSection) and referenced by the parent component's CSS
2. **Figma**: Create a separate ComponentSet (e.g., `Day Cell` with `State` property) → parent component uses **instances** of it → Figma exposes instance swap controls

**Concrete example — Day Cell**:

Web (`design-system/index.tsx`):
```tsx
const dayCellStyles: Record<DayCellState, string> = {
  "default":      "rounded-sm text-foreground bg-transparent",
  "selected":     "rounded-sm text-primary-foreground bg-primary",
  "range-start":  "rounded-l-sm text-primary-foreground bg-primary",
  // ... 10 states total
}
function DayCell({ state, children }) {
  return <div className={cn("size-[48px] flex items-center justify-center typo-paragraph-sm font-normal", dayCellStyles[state])}>{children}</div>
}
```

Figma JSON (`components/day-cell.json`):
```json
{
  "name": "Day Cell",
  "properties": {
    "State": ["Default", "Hover", "Today", "Selected", "Outside", "Disabled", "Range Start", "Range Middle", "Range End", "Range Hover"]
  },
  "base": { "width": 48, "height": 48, "radius": "sm", "textStyle": "SP/Body", "textFill": "foreground" },
  "variantStyles": {
    "State=Selected": { "fill": "primary", "textFill": "primary-foreground" },
    "State=Range Start": { "fill": "primary", "textFill": "primary-foreground", "radiusTopLeft": "sm", "radiusBottomLeft": "sm", "radiusTopRight": 0, "radiusBottomRight": 0 }
  }
}
```

Parent (`calendar.json`) references via `related` + `bestPractices`:
```json
"bestPractices": [{
  "title": "Day Cell instances",
  "do": "Use Day Cell sub-component instances for every day in the grid.",
  "dont": "Style day cells individually — always use Day Cell instances."
}],
"related": [{ "name": "Day Cell", "desc": "Sub-component for every day in the calendar grid." }]
```

**Key rules**:
- Sub-component (item) must be **generated before** parent component (group) that references it as instance
- Web reusable component (e.g., `DayCell`, `OTPSlotMock`) = single source of truth for both web rendering and Figma JSON
- `DayStatesSection` on web maps 1:1 to `Day Cell` ComponentSet in Figma
- Calendar CSS (`calendar.tsx`) must produce the same visual as `dayCellStyles` — use `aria-selected:bg-primary` on day_button to match DayCell's `bg-primary` for selected state
- If web **removes a property** (e.g., ShowIcon from Alert Dialog), do NOT keep it as variant in JSON — the element stays visible with instance swap

**Figma canvas placement rule**:
- Sub-component ComponentSet (item) must be placed **directly below** its parent ComponentSet (group) within the same section on the Figma page
- Generation order: item JSON first → parent JSON second. Plugin creates item ComponentSet, then parent ComponentSet references it via instance swap
- Example: `OTP Slot` ComponentSet sits directly below `Input OTP` ComponentSet; `Day Cell` sits directly below `Calendar`; `Table Row` sits directly below `Table`

**Group+Item components in this project**:
Table, Calendar, DatePicker, Tabs, Input OTP, Navigation Menu, Breadcrumb, Pagination, Accordion — all follow the Group+Item pattern where item sub-components must be created before the group parent. When writing JSON for these components, always place items at lower indices in the `"components"` array.

**Examples in this project**:
| Web Element | Figma Sub-component | JSON File | Used In |
|---|---|---|---|
| Day cells (10 states) | `Day Cell` | `day-cell.json` | Calendar, Date Picker |
| OTP slots (position × state) | `OTP Slot` | `input-otp.json` (index 0, same file as Input OTP) | Input OTP |
| Tab triggers (variant × state × icon) | `Tabs Item` | `tabs.json` (index 0, same file as Tabs) | Tabs |
| Nav menu pills (type × state) | `Nav Menu Item` | `navigation-menu.json` (index 0, same file as Navigation Menu) | Navigation Menu |
| Table rows (type × striped × state) | `Table Row` | `table.json` (index 0, same file as Table) | Table |
| Accordion items (state × type × end item) | `Accordion Item` | `accordion.json` (index 0, same file as Accordion) | Accordion |
| Alert Dialog icon circle | Icon instance (from Icons foundation) | — | Alert Dialog |

### Menu/Overlay Component Pattern (Dropdown, Context Menu, Command)

Menu components share a common structure. Follow these rules to avoid recurring mistakes:

**Item component** (e.g. Dropdown Item, Context Menu Item, Command Item):
- Use **`children` array** with `hideLabel: true` — NOT icon+label flow (`iconLeft`/`iconLeftName`)
- Why: Items need conditional icons (show/hide per variant via `showWhen`). `iconLeft` doesn't support `showWhen`. Using `children` with `"type": "icon"` gives per-variant icon control.
- Icon children: `"type": "icon"` with `iconName`, `iconSize: 16`, `iconFill`, `showWhen`. Separate child per variant: "Icon" (`showWhen: "Type=With Icon"`) + "Icon D" (`showWhen: "Type=Destructive"`)
- Label child: `"type": "text"` with `textContent`, `textFill: "foreground"`, `fillWidth: true` (pushes shortcuts right)
- Shortcut child: `"type": "text"` with `textStyle: "SP/Mini"`, `textFill: "muted-foreground"`, `showWhen: "Type=With Shortcut"`
- `gap: "xs"` (8px), `paddingX: "xs"`, `paddingY: "2xs"`, `radius: "sm"`
- States: `"State=Hover": { "fill": "muted" }`, `"State=Disabled": { "opacity": 0.5 }`
- **Shallow merge rule**: variantStyles that change label text (Destructive, With Shortcut) MUST include the FULL `children` array — shallow merge replaces entire array

**Parent/Group component** (e.g. Dropdown Menu, Context Menu, Command):
- Use `"type": "instance"` for items — `component: "Dropdown Item"`, `variants`, `textOverrides`, `fillWidth: true`
- **Edge-to-edge dividers**: Parent `paddingX: 0, paddingY: 0`. Items wrapped in group frames with `paddingX: "3xs"`, `paddingY: "3xs"` (4px). Dividers at parent level fill full width.
- React `p-1` (4px) on Content = group frame `paddingX: "3xs"`. Item `px-xs` (8px built-in) + group 4px = 12px from edge.
- Label/heading text: wrap in `"type": "frame"` with `paddingX: "xs"`, `paddingY: "2xs"` (text nodes don't support padding)
- Separator `showWhen`: tie to the element it logically separates from (e.g. bottom separator → `showWhen: "Show Destructive=Yes"`)
- Use `"type": "divider"` for separators, NOT `"type": "frame"` with height 1
- Separator fill: check React source — Dropdown uses `bg-muted`, Context Menu and Command use `bg-border`

### examples Rules

- Each example must have `"name"` (NOT `"title"`) — plugin reads `exDef.name` for card name
- Every item's `props` must include **ALL property axes** — no implicit defaults
- `layout`: `"horizontal"` or `"vertical"`
- Match web DS page Examples section order and content

### showcase Config

Optional `showcase` object controls which sections appear in the auto-generated showcase frame.

```json
"showcase": {
  "sections": ["header", "component", "installation"]
}
```

**Section keys**: `header`, `component`, `explore`, `installation`, `examples`, `props`, `designTokens`, `bestPractices`, `figmaMapping`, `accessibility`, `related`

**Standard rule**: Every component JSON MUST set `showcase.sections` to `["header", "component", "installation"]`. The Figma plugin only generates these 3 sections:
1. **header** — component name, category, description
2. **component** — ComponentSet grid (all variants from Explore Behavior)
3. **installation** — import code card

All other sections (examples, props, designTokens, bestPractices, figmaMapping, accessibility, related) exist in the JSON for **web documentation only** — they are NOT rendered in Figma.

### Component Generation Order

Components must be generated in **dependency order** — leaf components first, then components that use them as instances. See `products/{NNN}/STATUS.md` section "7d. Component Generation" for the full tier-based generation order.

**3 tiers**:
- **Tier 0**: Leaf components with no instance dependencies (Button, Badge, Avatar, Input, Checkbox, Switch, Toggle, Radio, Separator, Skeleton, Progress, Slider, Textarea, Select, InputOTP, Tabs, Accordion, Breadcrumb, ScrollArea, Tooltip, Label, Spinner, NavigationMenu)
- **Tier 1**: Components using Tier 0 as instances (Alert, Card, Table, Pagination, Collapsible, Command, Dropdown, ContextMenu, Popover, SearchBox)
- **Tier 2**: Components using Tier 0 + Tier 1 (Dialog, Sheet, Drawer, Alert Dialog, HoverCard, Combobox, Calendar, DatePicker)

**Rule**: Always generate all Tier 0 components before Tier 1, and all Tier 1 before Tier 2. Sub-components (e.g. Day Cell, OTP Slot) must be generated before their parent (Calendar, Input OTP). Within the same tier, generate sub-components first.

**Canvas Display Order Rule**: Thứ tự ComponentSet trên Figma canvas (trên → dưới) PHẢI match thứ tự tab Explore Behavior trên web (trái → phải). JSON `"components"` array giữ dependency order (item trước parent) để plugin tạo đúng, nhưng sau khi tạo xong plugin sắp xếp lại vị trí trên canvas theo web tab order. VD: Table web tabs = Table | Table Header | Table Row | Cell Header | Cell Row → canvas: Table ở trên cùng, Cell Row ở dưới cùng.

### Upsert Behavior

- Plugin detects existing ComponentSet by exact `name` match → updates in place
- Showcase detected by name suffix `" — Showcase"` (em dash) — e.g., `"Input — Showcase"`
- Existing variant components matched by normalized name (alphabetically sorted prop pairs)
- Stray COMPONENT nodes from failed runs are auto-cleaned

### Lessons Learned

| Issue | Fix |
|-------|-----|
| `resize()` error with string | `"width": "hug"` → must be number. Use actual px value like `120` |
| Missing Icon property | Check web ExploreBehavior — all controls must be in `properties` |
| Hex colors in fill/stroke | Always use semantic token names — plugin resolves via `findVar()` |
| Compound key spaces | `"A=X,B=Y"` NOT `"A=X, B=Y"` — plugin splits on exact comma |
| Icon not rendering | `iconLeftName` must match icon component name in Icons foundation |
| Instance FIXED sizing | After `parent.appendChild(inst)` plugin sets `inst.layoutSizingHorizontal = "FIXED"` — Figma auto-overrides to FILL in FILL containers. Set FILL only when `fill: true` in JSON. |
| `base.width` mismatch | Must match web CSS max-width: Input = 320 (max-w-xs), Button = 120 |
| Extra properties not on web | JSON `properties` had "Error" in State but web only has 4 states. ALWAYS verify against `{Component}Docs()` in `design-system/index.tsx` |
| Ellipse `layoutPositioning` before appendChild | `layoutPositioning = "ABSOLUTE"` requires parent with `layoutMode !== NONE`. Must `comp.appendChild(ellipse)` FIRST, then set `layoutPositioning`. |
| Ellipses deleted by cleanup whitelist | Cleanup removes children not in `_validTF`. Ellipse names must be added to whitelist via `if (merged.ellipses)` block. |
| Element opacity vs fillOpacity for ellipses | React CSS `opacity-25` = element-level. Figma `fillOpacity` = paint-level. Use element `opacity` on ellipse node, NOT `fillOpacity` on paint. |
| `instanceOverrides` ignored | `instanceOverrides` does NOT exist in plugin. Use `overrides` on instance children spec (see "Deep Overrides on Instance Children"). |
| Button Icon Only shrinks to 16px | Don't use `widthMode: "hug"` on Icon Only button instances — omit it to keep FIXED 36×36. |
| Nested instance variant not changing | `overrides.nestedVariants` needs exact child INSTANCE node name from parent component (e.g. `"Item 1"`, not `"Nav Menu Item"`). |
| Checkbox just a box, no label | Component needs `indicator` pattern — set `base.indicator: { width, height, radius }` so comp becomes wrapper with indicator + label children |
| Icon color vs label color | Use `iconFill` in variantStyles for icon color inside indicator, `textFill` for label color. Without `iconFill`, icons default to `textFill` |
| Spacing not variable-bound | `paddingX: 16` → raw number, no variable. Use string token `"md"` → plugin calls `getSpacingValue()` + `bindFloat()` to bind Figma spacing variable. Same for `gap`, `paddingY`. String `"none"` preferred for zero values. Plugin now auto-binds `spacing/none` for number `0` as safety net. |
| **Border radius not variable-bound** | `"radius": 9999` → raw number, Figma shows no variable binding. **MUST use string token**: `"radius": "full"`, `"radius": "lg"`, `"radius": "sm"`, `"radius": "none"` (for 0), etc. Plugin calls `bindFloat(node, "topLeftRadius", "border radius/full", value)` to bind Figma variable. This applies to `base.radius`, `variantStyles.radius`, children frame `radius`, and `indicator.radius`. **NEVER use raw numbers for radius** — always use token strings from `border radius/` collection (`"none"`, `"3xs"`, `"2xs"`, `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`, `"2xl"`, `"3xl"`, `"full"`). Plugin auto-binds `border radius/none` for number `0` as safety net, but string `"none"` is preferred. |
| Image not loading in Figma | `imageUrl` with redirect (e.g. `github.com/shadcn.png` → `avatars.githubusercontent.com`) blocked by Figma sandbox. Use **direct URL** without redirects. Also ensure domain is in `manifest.json` `networkAccess.allowedDomains`. |
| `clipsContent` not working | Was hardcoded `false`. Now reads from spec: `comp.clipsContent = !!merged.clipsContent`. Set `"clipsContent": true` in `base` for: (1) circular/rounded image clips (Avatar), (2) **any component with `focusRing`** — Figma requires clip content ON for DROP_SHADOW effect styles to render. |
| Empty/wrong text on component | Plugin reads `merged.textContent`, NOT `merged.text`. Always use `"textContent"` in JSON base and variantStyles. |
| Text style not applied | `textStyle` must be exact Figma text style name (`"SP/Body"`), not CSS class (`"sp-paragraph-sm"`, `"typo-paragraph-sm"`). Check `foundation-text-styles.json` for valid names. |
| Form component shows no placeholder | `hideLabel: true` suppresses the label text node entirely. For Input/Select/Textarea the label IS the placeholder — never use `hideLabel` on form components. |
| Icon variant not rendering | Setting only `iconLeftName: "Search"` is insufficient. Must ALSO set `iconLeft: true` — plugin checks boolean flag `merged.iconLeft` before rendering. Same for `iconRight`. |
| Gap hardcoded 8px without variable | Plugin defaults `gap` to `8` (raw number) when omitted. Set `"gap": 0` explicitly for no-gap components (Input/Textarea). Use string tokens (`"xs"`, `"sm"`) for variable binding. |
| `children` array breaks icon+label flow | Plugin rendering paths are **mutually exclusive**: `children`, `addon`, `indicator`, and default icon+label flow. When `children` is present, the default text label (`textContent`) and icon (`iconLeft`/`iconRight`) are **completely skipped**. **Two valid approaches**: (1) For items with simple always-on icons (e.g. Tabs Item, Nav Menu Item) → use `iconLeft`/`iconRight` in variantStyles. (2) For items with conditional icons per variant (e.g. Dropdown Item, Context Menu Item) → use `children` array with `"type": "icon"` + `showWhen` + `"type": "text"` for label. Parent/group components always use `children` with `"type": "instance"`. |
| Frame child defaults to FILL width | Plugin line 2274: `frm.layoutSizingHorizontal = cs.widthMode === "fixed" ? "FIXED" : cs.widthMode === "hug" ? "HUG" : "FILL"`. Frame children without `widthMode` default to **FILL**. Fixed-size elements (icon placeholders 16×16, handle bars) MUST set `"widthMode": "fixed"` to prevent stretching to parent width. |
| Instance child defaults to FIXED width | Plugin line 2502: `_inst.layoutSizingHorizontal = cs.fillWidth ? "FILL" : cs.widthMode === "hug" ? "HUG" : "FIXED"`. Instance children without `fillWidth` or `widthMode` default to **FIXED**. Buttons that should hug content MUST set `"widthMode": "hug"`. |
| Text children ignore padding | Plugin `_processChildren` for `type: "text"` (line 2225-2236) only sets text content, fill, and sizing. `paddingX`/`paddingY` on text children are **silently ignored**. To add padding around text, wrap it in a `"type": "frame"` child with `layout` and put the text as a nested child. |
| Divider fills within parent padding | `type: "divider"` sets `layoutSizingHorizontal = "FILL"` but fills only within parent content area (after padding). React separators like `-mx-1` bleed edge-to-edge. **Fix for edge-to-edge dividers**: set parent `paddingX: 0` and add `paddingX` to individual items instead. |
| Footer/alignment needs fillWidth | `primaryAlign: "end"` (or `"center"`) on a frame has no effect unless the frame fills its parent width. Without `fillWidth: true`, the frame HUGs content and alignment is meaningless. Always set `"fillWidth": true` on frames that use `primaryAlign`. |
| Icon placeholder frames in menus | Manual `"type": "frame"` with `width: 16, height: 16, fill: "foreground"` creates opaque rectangles, NOT proper Lucide icon instances. **For menu item components** (DropdownItem, ContextMenuItem, CommandItem): use `children` array with `"type": "icon"` children + `showWhen` for conditional icons per variant. **For parent/group components** with `children` array: use `"type": "instance"` referencing the item ComponentSet, NOT manual frames. |
| `textStyle` mismatch causing height difference | `SP/Label` = 12px/16px, `SP/Body Medium` = 14px/20px. Web `text-sm font-medium` = 14px/20px. Using wrong text style causes 4px line-height difference → visible height mismatch between web and Figma. **Always verify textStyle against web CSS**: `text-sm` = 14px/20px = `SP/Body` or `SP/Body Medium`; `text-xs` = 12px/16px = `SP/Label`. Check `index.css` for `@utility sp-*` definitions. |
| Addon path missing focus ring | Addon inner frame only checked `focusRing`, not `effectStyleName`. Fixed: addon path now checks `effectStyleName` first → falls back to `focusRing` → falls back to clear effects. |
| Prefix/Suffix/TextLeft/TextRight wrong font | These nodes used hardcoded `Inter Regular 14px`. Fixed: now resolve `merged.textStyle` via `findTextStyle()` for proper Figma text style binding. |
| Showcase crash on upsert | When variant keys change completely during upsert, Figma auto-deletes the ComponentSet → showcase node becomes stale. Fixed: try-catch safety check on `existingShowcase.x` before accessing. |

### Established JSON Archetypes (Proven Structures)

These are the **13 proven component archetypes** extracted from working JSON specs. When creating or updating a component JSON, identify which archetype(s) it matches and follow that pattern exactly. Each archetype includes a canonical example from the codebase.

---

#### Archetype 1: Simple Component (icon+label flow)

**When**: Component has text label ± icons, no complex inner structure.
**Files**: `button.json`, `badge.json`, `toggle.json`, `label.json`

```json
{
  "name": "Button",
  "properties": { "Variant": [...], "Size": [...], "State": [...], "Icon": [...] },
  "base": {
    "layout": "horizontal", "primaryAlign": "center", "counterAlign": "center",
    "width": 120, "height": 36, "gap": "xs",
    "fill": "primary", "radius": "lg", "paddingX": "md", "paddingY": "none",
    "textStyle": "SP/Body Semibold", "textContent": "Button", "textFill": "primary-foreground",
    "iconSize": 16, "clipsContent": true
  },
  "variantStyles": {
    "Icon=Left": { "iconLeft": true, "iconLeftName": "Plus" },
    "Icon=Icon Only": { "hideLabel": true, "iconLeft": true, "iconLeftName": "Plus" },
    "State=Focus": { "focusRing": "ring" },
    "State=Disabled": { "opacity": 0.5 },
    "Variant=Ghost,State=Hover": { "fill": "ghost-hover" }
  }
}
```

**Key rules**:
- `textContent` + `textFill` + `textStyle` for label (NO `children` array)
- `iconLeft`/`iconRight` boolean + name for icons
- `hideLabel: true` for icon-only variants
- `clipsContent: true` when ANY variant has `focusRing`
- Compound keys for cross-axis overrides (`Variant=X,State=Y`)

---

#### Archetype 2: Indicator Compound (Checkbox/Switch/Radio)

**When**: Component has a visual indicator element + separate label text.
**Files**: `checkbox.json`, `switch.json`, `radio.json`

```json
{
  "name": "Checkbox",
  "properties": { "Value": ["Unchecked", "Checked", "Indeterminate"], "State": [...] },
  "base": {
    "layout": "horizontal", "primaryAlign": "center", "counterAlign": "center",
    "gap": "xs",
    "indicator": {
      "width": 16, "height": 16, "radius": "sm",
      "clipsContent": true
    },
    "fill": "input", "stroke": "border-strong",
    "textStyle": "SP/Body", "textContent": "Accept terms", "textFill": "foreground",
    "iconSize": 14, "iconFill": "primary-foreground"
  },
  "variantStyles": {
    "Value=Checked": { "fill": "primary", "stroke": "primary", "iconLeft": true, "iconLeftName": "Check" },
    "State=Focus": { "focusRing": "ring" },
    "State=Disabled": { "opacity": 0.5 },
    "Value=Checked,State=Hover": { "fill": "primary", "stroke": "primary" }
  }
}
```

**Key rules**:
- `base.indicator: { width, height, radius, clipsContent }` — **clipsContent goes INSIDE indicator, NOT base level** (common-mistake #121)
- `fill`/`stroke` apply to the indicator frame (NOT the outer wrapper)
- `iconLeft`/`iconRight` render INSIDE the indicator
- `textContent`/`textFill` render OUTSIDE as label
- `iconFill` for icon color (separate from `textFill`)
- `opacity` on outer wrapper (affects whole row = disabled)
- Compound keys needed for Value×State combinations

---

#### Archetype 3: Children Layout (structured sections)

**When**: Component has multiple visual sections (header, body, footer, dividers).
**Files**: `dialog.json`, `alert.json`, `card.json`, `collapsible.json`, `alert-dialog.json`

```json
{
  "name": "Dialog",
  "base": {
    "layout": "vertical", "width": 512,
    "fill": "card", "stroke": "border", "radius": "xl",
    "paddingX": "none", "paddingY": "none", "gap": 0,
    "hideLabel": true,
    "children": [
      {
        "name": "Header", "type": "frame",
        "layout": "horizontal", "counterAlign": "start", "gap": "xs",
        "paddingX": "md", "paddingTop": "md", "paddingBottom": "md",
        "fillWidth": true,
        "children": [
          { "name": "Text Group", "type": "frame", "layout": "vertical", "gap": "xs", "fillWidth": true,
            "children": [
              { "name": "Title", "type": "text", "textStyle": "SP/H4", "textContent": "Edit profile", "textFill": "foreground", "fillWidth": true },
              { "name": "Description", "type": "text", "textStyle": "SP/Body", "textContent": "...", "textFill": "muted-foreground", "fillWidth": true, "showWhen": "Show Description=Yes" }
            ]
          },
          { "name": "Close Icon", "type": "instance", "component": "Icon / X", "width": 16, "height": 16, "showWhen": "Show Close=Yes" }
        ]
      },
      {
        "name": "Body", "type": "frame", "layout": "vertical",
        "paddingX": "md", "paddingBottom": "md", "fillWidth": true,
        "children": [
          { "name": "Slot", "type": "instance", "component": "Dialog Slot", "variants": { "Content": "Form" }, "fillWidth": true, "swapProperty": "Swap Slot" }
        ]
      },
      {
        "name": "Footer", "type": "frame", "layout": "horizontal",
        "primaryAlign": "end", "counterAlign": "center", "gap": "xs",
        "paddingX": "md", "paddingY": "md", "fillWidth": true,
        "showWhen": "Show Footer=Yes",
        "children": [
          { "name": "Cancel", "type": "instance", "component": "Button", "variants": { "Variant": "Outline", "Size": "Default", "State": "Default", "Icon": "No Icon" }, "textOverrides": { "Label": "Cancel" }, "widthMode": "hug" },
          { "name": "Save", "type": "instance", "component": "Button", "variants": { "Variant": "Primary", "Size": "Default", "State": "Default", "Icon": "No Icon" }, "textOverrides": { "Label": "Save changes" }, "widthMode": "hug" }
        ]
      }
    ]
  }
}
```

**Key rules**:
- `hideLabel: true` required when using `children`
- Text nodes: `textContent`/`textFill` (NOT `content`/`fill`)
- Frame children: `counterAlign` defaults CENTER — set `"start"` for left-aligned text
- `fillWidth: true` on frames that need to stretch
- Button instances use `widthMode: "hug"` (NOT `fillWidth`)
- `showWhen` for conditional sections
- Edge-to-edge borders: parent `paddingX: "none"`, items set own padding
- `strokeSides: "top,bottom"` for section dividers

---

#### Archetype 4: Menu Item (children with conditional icons)

**When**: Item component needs different icons per variant type, controlled by `showWhen`.
**Files**: `dropdown.json` (Dropdown Item)

```json
{
  "name": "Dropdown Item",
  "properties": { "Type": ["Default", "With Icon", "Destructive", "With Shortcut"], "State": [...] },
  "base": {
    "layout": "horizontal", "counterAlign": "center",
    "paddingX": "xs", "paddingY": "2xs", "radius": "sm", "gap": "xs",
    "hideLabel": true,
    "children": [
      { "name": "Icon", "type": "icon", "iconName": "User", "iconSize": 16, "iconFill": "foreground", "showWhen": "Type=With Icon" },
      { "name": "Icon D", "type": "icon", "iconName": "Trash2", "iconSize": 16, "iconFill": "destructive", "showWhen": "Type=Destructive" },
      { "name": "Label", "type": "text", "textStyle": "SP/Body", "textContent": "Profile", "textFill": "foreground", "fillWidth": true, "truncate": true },
      { "name": "Shortcut", "type": "text", "textStyle": "SP/Mini", "textContent": "⌘,", "textFill": "muted-foreground", "showWhen": "Type=With Shortcut" }
    ]
  },
  "variantStyles": {
    "Type=Destructive": {
      "children": [
        { "name": "Icon", "type": "icon", "iconName": "User", "iconSize": 16, "iconFill": "foreground", "showWhen": "Type=With Icon" },
        { "name": "Icon D", "type": "icon", "iconName": "Trash2", "iconSize": 16, "iconFill": "destructive", "showWhen": "Type=Destructive" },
        { "name": "Label", "type": "text", "textStyle": "SP/Body", "textContent": "Delete Account", "textFill": "destructive", "fillWidth": true, "truncate": true },
        { "name": "Shortcut", "type": "text", "textStyle": "SP/Mini", "textContent": "⌘,", "textFill": "muted-foreground", "showWhen": "Type=With Shortcut" }
      ]
    },
    "State=Hover": { "fill": "muted" },
    "State=Disabled": { "opacity": 0.5 }
  }
}
```

**Key rules**:
- Uses `children` (NOT icon+label flow) because icons are conditional per variant
- Each icon variant gets its own `"type": "icon"` child with `showWhen`
- Label text MUST have `"truncate": true` + `"fillWidth": true`
- **Shallow merge**: variantStyles that change `textFill` on Label MUST include the FULL `children` array
- States (`Hover`, `Disabled`) only change frame-level properties (fill, opacity) — NO children override needed

---

#### Archetype 5: Menu Parent (instances of shared item)

**When**: Parent component composes multiple instances of a shared item component.
**Files**: `dropdown.json` (Dropdown Menu), `context-menu.json`, `command.json`

```json
{
  "name": "Dropdown Menu",
  "base": {
    "layout": "vertical", "width": 224,
    "fill": "popover", "stroke": "border", "radius": "lg",
    "paddingX": "none", "paddingY": "none", "gap": "none",
    "hideLabel": true,
    "children": [
      {
        "name": "Group 1", "type": "frame", "layout": "vertical",
        "paddingX": "3xs", "paddingY": "3xs", "fillWidth": true, "gap": "none",
        "children": [
          { "name": "Item Profile", "type": "instance", "component": "Dropdown Item",
            "variants": { "Type": "With Icon", "State": "Default" },
            "textOverrides": { "Label": "Profile" },
            "iconOverrides": { "Icon": "User" },
            "fillWidth": true },
          { "name": "Item Settings", "type": "instance", "component": "Dropdown Item",
            "variants": { "Type": "With Icon", "State": "Default" },
            "textOverrides": { "Label": "Settings" },
            "iconOverrides": { "Icon": "Settings" },
            "fillWidth": true }
        ]
      },
      { "name": "Sep 1", "type": "divider", "fill": "muted" },
      {
        "name": "Group 2", "type": "frame", "layout": "vertical",
        "paddingX": "3xs", "paddingY": "3xs", "fillWidth": true, "gap": "none",
        "children": [
          { "name": "Item Delete", "type": "instance", "component": "Dropdown Item",
            "variants": { "Type": "Destructive", "State": "Default" },
            "textOverrides": { "Label": "Delete" },
            "fillWidth": true }
        ]
      }
    ]
  }
}
```

**Key rules**:
- Parent `paddingX/Y: "none"` — groups handle their own padding (`"3xs"`)
- Dividers at parent level for edge-to-edge separators
- Each instance needs UNIQUE `name` (e.g. "Item Profile", "Item Settings" — NOT all "Dropdown Item")
- `textOverrides` changes item label text
- `iconOverrides` swaps icon instances inside the item
- `fillWidth: true` on every instance
- Check React source for divider fill: Dropdown = `"muted"`, Context/Command = `"border"`

---

#### Archetype 6: Swap Slot (swappable content)

**When**: Component has a body area that users should be able to replace with custom content in Figma.
**Files**: `dialog.json` (Dialog Slot), `sheet.json`, `drawer.json`, `card.json`, `alert-dialog.json`, `popover.json`

```json
{
  "name": "Dialog Slot",
  "description": "Swappable content slot for Dialog body.",
  "properties": { "Content": ["Form", "Text"] },
  "base": {
    "layout": "vertical", "width": 240,
    "paddingX": "none", "paddingY": "none", "gap": "md",
    "hideLabel": true,
    "children": [
      {
        "name": "Field Name", "type": "frame", "layout": "vertical",
        "counterAlign": "start", "gap": "3xs", "fillWidth": true,
        "showWhen": "Content=Form",
        "children": [
          { "name": "Label", "type": "instance", "component": "Label", "variants": { "Required": "No", "State": "Default" }, "textOverrides": { "Label": "Name" } },
          { "name": "Input", "type": "instance", "component": "Input", "variants": { "State": "Default", "Value": "Filled", "Left": "None", "Right": "None" }, "textOverrides": { "Label": "Pedro Duarte" }, "fillWidth": true }
        ]
      },
      { "name": "Body Text", "type": "text", "textStyle": "SP/Body", "textContent": "...", "textFill": "muted-foreground", "fillWidth": true, "showWhen": "Content=Text" }
    ]
  },
  "showcase": { "sections": [] }
}
```

**Used in parent via swapProperty**:
```json
{ "name": "Slot", "type": "instance", "component": "Dialog Slot",
  "variants": { "Content": "Form" }, "fillWidth": true,
  "swapProperty": "Swap Slot" }
```

**Key rules**:
- Slot component `width: 240` (fixed base width)
- Slot `showcase.sections: []` (no showcase — it's an internal sub-component)
- Parent uses `swapProperty: "Swap Slot"` on the instance child
- Plugin auto-creates INSTANCE_SWAP property on parent ComponentSet
- Label-Input field gap = `"3xs"` (4px)
- `showWhen` separates Content variants (Form vs Text)

---

#### Archetype 7: Group+Item (multi-component file)

**When**: Parent component contains repeating instances of a sub-component (tabs, accordion items, OTP digits, table rows, nav items, breadcrumb items, pagination items).
**Files**: `accordion.json`, `tabs.json`, `input-otp.json`, `navigation-menu.json`, `table.json`, `breadcrumb.json`, `pagination.json`, `date-picker.json`

**5-point checklist** (common-mistake #122):
1. Item at `components[0]`, parent at `components[1+]`
2. Parent uses `"type": "instance"` children referencing item
3. Item `variants` in parent instances use EXACT property values from item's `properties`
4. Canvas order = web Explore tab order (top→bottom = left→right)
5. Both in SAME JSON file (unless item shared across multiple parents)

```json
{
  "components": [
    {
      "name": "Accordion Item",
      "properties": { "State": [...], "Type": ["Open", "Closed"], "End Item": ["No", "Yes"] },
      "base": {
        "layout": "vertical", "hideLabel": true, "clipsContent": true,
        "children": [
          { "name": "Trigger", "type": "frame", ... },
          { "name": "Content", "type": "frame", "showWhen": "Type=Open", ... },
          { "name": "Border", "type": "frame", "fill": "border", "showWhen": "End Item=No", ... }
        ]
      }
    },
    {
      "name": "Accordion",
      "properties": { "Open": ["No", "Yes"], "State": [...] },
      "base": {
        "layout": "vertical", "hideLabel": true,
        "children": [
          { "name": "Item 1", "type": "instance", "component": "Accordion Item",
            "variants": { "State": "Default", "Type": "Closed", "End Item": "No" },
            "textOverrides": { "Label": "Is it accessible?" }, "fillWidth": true },
          { "name": "Item 2", "type": "instance", "component": "Accordion Item",
            "variants": { "State": "Default", "Type": "Closed", "End Item": "No" },
            "textOverrides": { "Label": "Is it styled?" }, "fillWidth": true },
          { "name": "Item 3", "type": "instance", "component": "Accordion Item",
            "variants": { "State": "Default", "Type": "Closed", "End Item": "Yes" },
            "textOverrides": { "Label": "Is it animated?" }, "fillWidth": true }
        ]
      },
      "variantStyles": {
        "Open=Yes": {
          "children": [
            { "name": "Item 1", "type": "instance", "component": "Accordion Item",
              "variants": { "State": "Default", "Type": "Open", "End Item": "No" }, ... },
            ...
          ]
        }
      }
    }
  ]
}
```

**Key rules**:
- Last item instance: `"End Item": "Yes"` (removes bottom border)
- `variantStyles` with `children` override = FULL array (shallow merge)
- Each instance needs unique `name` ("Item 1", "Item 2", "Item 3")
- Boolean-like properties: `"No"/"Yes"` (NEVER `"False"/"True"`)

---

#### Archetype 8: Deep Overrides (nested instance control)

**When**: Component contains an instance that itself contains sub-instances, and you need to change text/variants 2+ levels deep.
**Files**: `app-header.json`

```json
{
  "type": "instance", "name": "Nav",
  "component": "Navigation Menu",
  "variants": { "Items": "6" },
  "widthMode": "hug",
  "overrides": {
    "nested": {
      "Item 4": { "Label": "Users" },
      "Item 5": { "Label": "Products" },
      "Item 6": { "Label": "Orders" }
    },
    "nestedVariants": {
      "Item 1": { "State": "Active" }
    }
  }
}
```

**Key rules**:
- Use `overrides` (NOT `instanceOverrides` — doesn't exist in plugin)
- `nested`: `{ childNodeName: { textNodeName: "value" } }` — changes text 2 levels deep
- `nestedVariants`: `{ childNodeName: { propertyName: "value" } }` — changes variant of nested instance
- Node names must match EXACT Figma node names inside the instance (e.g. `"Item 1"`, not `"Nav Menu Item"`)
- Also supports: `iconSwap`, `boolean`, `text` (direct text nodes)
- Per-variant Page switching: each `Page=X` variantStyle overrides `nestedVariants` to set different item as Active

---

#### Archetype 9: Absolute Positioning (overlapping elements)

**When**: Elements overlap or need pixel-precise placement (slider thumbs, notification dots, online indicators).
**Files**: `slider.json`, `app-header.json`

**Slider** (all children absolute):
```json
{
  "base": {
    "width": 320, "height": 16, "heightMode": "fixed",
    "children": [
      { "name": "Track", "type": "frame", "position": "absolute", "x": 0, "y": 5,
        "width": 320, "height": 6, "widthMode": "fixed", "heightMode": "fixed",
        "fill": "muted", "radius": "full" },
      { "name": "Range 50", "type": "frame", "position": "absolute", "x": 0, "y": 5,
        "width": 160, "height": 6, "widthMode": "fixed", "heightMode": "fixed",
        "fill": "primary", "radius": "full", "showWhen": "Value=50" },
      { "name": "Thumb 50", "type": "frame", "position": "absolute", "x": 152, "y": 0,
        "width": 16, "height": 16, "widthMode": "fixed", "heightMode": "fixed",
        "radius": "full", "fill": "background", "stroke": "primary", "strokeWidth": 2,
        "showWhen": "Value=50" }
    ]
  }
}
```

**Notification dot** (small overlay):
```json
{
  "type": "frame", "name": "Notif Dot",
  "width": 8, "height": 8, "widthMode": "fixed",
  "radius": "full", "fill": "destructive",
  "stroke": "background", "strokeWeight": 2,
  "paddingX": "none", "paddingY": "none",
  "position": "absolute", "x": 28, "y": 4,
  "constraints": { "horizontal": "MAX", "vertical": "MIN" }
}
```

**Key rules**:
- `position: "absolute"` + `x`/`y` coordinates
- MUST set `widthMode: "fixed"` + `heightMode: "fixed"` (prevent auto-stretch)
- `constraints`: `MIN` (pin to left/top), `MAX` (pin to right/bottom), `CENTER`, `STRETCH`
- Parent MUST have `heightMode: "fixed"` for absolute children
- variantStyles overrides need FULL children array (each value position has different thumb x)
- Focus state adds `effectStyleName: "Ring/default"` to thumb elements

---

#### Archetype 10: Ellipse (donut/arc rendering)

**When**: Component uses circular shapes with donut holes or partial arcs (spinners, progress rings).
**Files**: `spinner.json`

```json
{
  "name": "Spinner",
  "base": {
    "layout": "horizontal", "primaryAlign": "center", "counterAlign": "center",
    "gap": "none", "paddingX": "none", "paddingY": "none",
    "width": 24, "height": 24, "hideLabel": true,
    "ellipses": [
      { "name": "Track", "fill": "muted-foreground", "opacity": 0.25, "innerRadius": 0.667 },
      { "name": "Arc", "fill": "muted-foreground", "opacity": 0.75,
        "arcStart": -90, "arcSweep": 90, "innerRadius": 0.667 }
    ]
  },
  "variantStyles": {
    "Color=Primary": {
      "ellipses": [
        { "name": "Track", "fill": "primary", "opacity": 0.25, "innerRadius": 0.667 },
        { "name": "Arc", "fill": "primary", "opacity": 0.75, "arcStart": -90, "arcSweep": 90, "innerRadius": 0.667 }
      ]
    },
    "Size=SM": { "width": 16, "height": 16 }
  }
}
```

**Key rules**:
- `ellipses` array creates overlapping Figma ellipses with `arcData`
- `innerRadius` (0-1): hole ratio (0.667 = standard donut ring)
- `arcStart`/`arcSweep` (degrees): partial arc (-90 + 90 = quarter starting at top)
- Use element `opacity` (NOT `fillOpacity`) to match React CSS
- Color variants MUST override ENTIRE `ellipses` array (shallow merge)
- Size variants only change `width`/`height` — ellipses auto-resize
- Comp needs `paddingX/Y: "none"`, `gap: "none"`, `hideLabel: true`

---

#### Archetype 11: Per-Side Strokes

**When**: Component needs border on specific sides only (table cells, OTP slots, scrollable sections).
**Files**: `input-otp.json`, `dialog.json`, `sheet.json`, `command.json`, `table.json`

```json
{
  "name": "OTP Slot",
  "base": {
    "stroke": "border-strong",
    "strokeSides": "top,right,bottom",
    ...
  },
  "variantStyles": {
    "Position=First": { "strokeSides": "all", "radiusTopLeft": "md", "radiusBottomLeft": "md" },
    "Position=Last": { "radiusTopRight": "md", "radiusBottomRight": "md" }
  }
}
```

**Scrollable section dividers**:
```json
{ "name": "Body Scrollable", "type": "frame",
  "strokeSides": "top,bottom", "stroke": "border",
  "height": 160, "clipsContent": true, ... }
```

**Key rules**:
- `strokeSides`: comma-separated sides — `"top"`, `"right"`, `"bottom"`, `"left"`, or `"all"`
- Omit `strokeSides` for uniform stroke on all sides
- Match web CSS: `border-y border-r` → `"strokeSides": "top,right,bottom"`
- Per-side radius: `radiusTopLeft`, `radiusBottomLeft`, `radiusTopRight`, `radiusBottomRight` (string tokens or numbers)

---

#### Archetype 12: Variant Restrictions

**When**: Some property combinations are invalid (e.g. Tablet only shows Dashboard page, Ellipsis only has Default state).
**Files**: `app-header.json`, `pagination.json`, `badge.json`, `table.json`, `breadcrumb.json`

```json
{
  "properties": {
    "Page": ["Dashboard", "Analytics", "Reports", "Users", "Products", "Orders"],
    "Breakpoint": ["Desktop", "Tablet", "Mobile"]
  },
  "variantRestrictions": {
    "Breakpoint=Tablet": { "Page": ["Dashboard"] },
    "Breakpoint=Mobile": { "Page": ["Dashboard"] }
  }
}
```

**Key rules**:
- Format: `{ "condition": { "property": ["allowed values"] } }` — OBJECT, not array
- Condition key: same syntax as variantStyles (`Property=Value`, comma-separated for compound)
- Plugin filters cross product AFTER building full combos
- Reduces variant count (6×3=18 → 8 valid variants)
- Web Explore: show restricted option list per condition, disable controls when not applicable
- NEVER use array format `[{ if, then }]` — causes `.indexOf()` error

---

#### Archetype 13: Image Fill

**When**: Component variant displays an image instead of text/icon (avatars, cards with cover).
**Files**: `avatar.json`

```json
{
  "variantStyles": {
    "Type=Image": {
      "imageUrl": "https://avatars.githubusercontent.com/u/124599?v=4",
      "hideLabel": true,
      "clipsContent": true
    }
  }
}
```

**Key rules**:
- `imageUrl` must be DIRECT URL (no redirects) — Figma sandbox blocks cross-domain redirect
- Domain must be in `manifest.json` → `networkAccess.allowedDomains`
- `hideLabel: true` suppresses text node for image variants
- `clipsContent: true` clips image to rounded shape
- UI pre-fetches image bytes before sending to plugin (`_prefetchedImages`)

---

#### Archetype Summary Table

| # | Archetype | When to Use | Canonical Example |
|---|-----------|-------------|-------------------|
| 1 | Simple (icon+label) | Text ± icons, no structure | `button.json` |
| 2 | Indicator | Checkbox/Switch/Radio compound | `checkbox.json` |
| 3 | Children layout | Multi-section (header/body/footer) | `dialog.json` |
| 4 | Menu item | Conditional icons per variant | `dropdown.json` (Item) |
| 5 | Menu parent | Compose item instances | `dropdown.json` (Menu) |
| 6 | Swap slot | Replaceable content area | `dialog.json` (Slot) |
| 7 | Group+Item | Repeating sub-component instances | `accordion.json` |
| 8 | Deep overrides | Control nested instances 2+ levels | `app-header.json` |
| 9 | Absolute position | Overlapping/precise placement | `slider.json` |
| 10 | Ellipse | Donut/arc shapes | `spinner.json` |
| 11 | Per-side strokes | Borders on specific sides | `input-otp.json` |
| 12 | Variant restrictions | Invalid property combinations | `app-header.json` |
| 13 | Image fill | Image variant instead of text | `avatar.json` |

**Combination rule**: Many components use MULTIPLE archetypes. Example: `dialog.json` = #3 (children layout) + #5 (instances) + #6 (swap slot) + #11 (per-side strokes). Identify ALL applicable archetypes before writing JSON.

---

## 6. Showcase (Auto-generated from Component)

**Plugin function**: `_buildShowcase(cs, compSpec, properties, propNames, log)`
**Generated from**: Component JSON spec (section 5 above)
**Output**: Frame named `"{compName} — Showcase"` with 3 sections

The showcase is auto-generated by the plugin. It contains **only 3 sections** — the component grid and minimal context. All detailed documentation (examples, props, tokens, etc.) lives on the **web Design System page only**.

### 3 Sections (generated in Figma)

| # | Section | Source Field | Notes |
|---|---------|-------------|-------|
| 1 | Header | `name`, `description`, `category` | Category as overline, name as H1, description as body |
| 2 | Component | `properties` | ComponentSet grid — all variants laid out in a matrix |
| 3 | Installation | `installation.dependencies`, `installation.import` | Card with Dependencies header + pkg command, Import header + import code. If no external dependency, omit `dependencies` field |

### Web-only sections (NOT generated in Figma)

These fields exist in the component JSON for **web documentation only**. The plugin ignores them when `showcase.sections` is set to `["header", "component", "installation"]`:

`examples`, `props`, `designTokens`, `bestPractices`, `figmaMapping`, `accessibility`, `related`

### Visual Spec

```
Showcase frame:
  width: 1440px FIXED
  padding: 80px all sides
  gap: 64px between sections
  fill: "background" (variable, dark mode)
  layoutMode: VERTICAL

Section frames:
  gap: 24px
  fills: [] (transparent)
  sizing: FILL horizontal, HUG vertical

Separator: 1px height, fill "border", FILL horizontal

Installation card (matches web InstallationSection):
  outer card: fills=[] (NO background), stroke: "border", radius: 12px, clipsContent: true
  header rows: bg-muted at 30% opacity (setFillWithOpacity), px-md py-sm
  header text: "SP/Overline", "muted-foreground"
  code blocks: bg-zinc-950 (#09090b), text zinc-100 (#f5f5f7), p-md, "SP/Caption"
  separators: 1px "border" between each section (header→code, code→header)
  structure: [Dep Header] [Sep] [Dep Code] [Import Header] [Sep] [Import Code]
```

### Lessons Learned

| Issue | Fix |
|-------|-----|
| White #FFFFFF fill on cards | `figma.createFrame()` defaults to white fill. Must explicitly `setFill(node, "card")` or `fills = []` |
| Stray ComponentSet | Pre-run cleanup removes orphan COMPONENT nodes from failed runs |
| `setFillWithOpacity` not working | `setBoundVariableForPaint()` drops `opacity` from input paint. Fix: set `paint.opacity` AFTER calling `setBoundVariableForPaint()`, not before. |
| Dark mode not applied | `setExplicitVariableModeForCollection(collectionId, modeId)` takes STRING `.id`, not VariableCollection object. Pass `_col.id`. |
| Dark mode: iterate all collections | Don't hardcode "semantic colors" name. Loop all collections, find any with a "Dark" mode, set it. |
| `_buildProps` not defined | Function was block-scoped inside `if (_showSec("explore"))`. Moved to parent scope so `examples` section can also use it. |
| Installation card bg wrong | Outer card had `setFill("card")` — web has NO background (just `border border-border`). Fixed: `installCard.fills = []`. Code blocks use hardcoded `#09090b` (zinc-950) bg + `#f5f5f7` (zinc-100) text to match web `CodeBlockFlush`. |
| Showcase not rebuilding after plugin code change | `specHash = JSON.stringify(compSpec)` — only changes when JSON changes, not plugin code. To force rebuild: delete showcase in Figma, or bump `_v` field in JSON `showcase` object. |
| Nested async function crash | `async function _installCode()` defined inside `if (installData)` block caused plugin sandbox crash. Fix: inline all code, no nested async functions in Figma plugin. |
| Children paddingX/Y not bound | `_processChildren` set numeric value but skipped `bindFloat()` for string spacing tokens. Fixed: now binds `spacing/{token}` variable like gap does. |
| Manual frames for buttons | Alert Dialog used `"type": "frame"` to recreate Button visually. MUST use `"type": "instance"` with `component: "Button"` + `variants` to use real component instances. |
| Number 0 not variable-bound | Plugin set raw 0px for gap/padding/radius number `0` without binding variable. Fixed: plugin now auto-binds `spacing/none` (gap/padding) and `border radius/none` (radius) for all number `0` values across all 4 code paths (children, main, addon, indicator). JSON should still use `"none"` string for clarity. |
| Full-width divider in dialog | Base `paddingX: "md"` constrains ALL children → dividers can't span full width. Fix: base `paddingX: "none"`, each child sets own `paddingX: "md"`. Children needing full-width borders (scrollable body) span full dialog width. |

---

## JSON Spec Review & Test Protocol

**BẮT BUỘC**: Sau khi viết xong JSON spec, PHẢI chạy quy trình review 3 bước dưới đây TRƯỚC KHI giao cho user chạy plugin. Không skip bước nào.

### Bước 1: Format Validation (Structural Check)

Kiểm tra cấu trúc JSON có đúng format plugin yêu cầu:

| # | Check | Lỗi thường gặp |
|---|-------|----------------|
| 1 | `variantRestrictions` là **object** `{ "Prop=Val": { ... } }` | KHÔNG phải array `[{ if, then }]` — gây "not a function" |
| 2 | `paddingX`/`paddingY`/`gap` dùng **string token** (`"none"`, `"xs"`, `"md"`) | Số → không bind variable (plugin auto-bind `0` as safety net, but `"none"` preferred) |
| 3 | `radius` dùng **string token** (`"lg"`, `"full"`) | Số → không bind variable |
| 4 | `textContent` (KHÔNG phải `text`) | `text` tạo node trống |
| 5 | `textStyle` = tên Figma (`"SP/Body"`) | KHÔNG dùng CSS class (`"typo-paragraph-sm"`) |
| 6 | Icon cần CẢ boolean + name: `iconLeft: true` + `iconLeftName: "Search"` | Chỉ name → icon không hiện |
| 7 | `width`/`height` là **number** | String sẽ gây `resize()` error |
| 8 | Compound key KHÔNG có space: `"A=X,B=Y"` | `"A=X, B=Y"` → plugin split sai |
| 9 | `fill`/`stroke`/`textFill` dùng semantic token | KHÔNG hex, KHÔNG scale (`violet-600`) |
| 10 | `showcase.sections` = `["header", "component", "installation"]` | Thiếu → plugin không biết render gì |
| 11 | Icon names trong children `"component": "Icon / X"` match `foundation-icons.json` | Lucide rename: AlertCircle→CircleAlert, CheckCircle2→CircleCheck, AlertTriangle→TriangleAlert |
| 12 | Children icon instances có `iconFill` theo variant | Thiếu → icon kế thừa default color, không khớp variant |

### Bước 2: Web Source Cross-Check (Spec Accuracy)

So sánh JSON spec với React source code. Đọc 3 file:
1. **Component file**: `src/components/ui/{component}.tsx` — CSS classes, props, structure
2. **Docs function**: `src/pages/design-system/index.tsx` → `{Component}Docs()` — Explore controls, examples
3. **CSS vars**: `src/index.css` — token values, custom utilities

| # | Check | Cách verify |
|---|-------|------------|
| 1 | `properties` keys + values = web Explore controls 100% | Đọc `{Component}Docs()`, đếm controls + options |
| 2 | `variantRestrictions` = web disabled/hidden logic | Check web disabled conditions trên controls |
| 3 | `base` specs = web default CSS (State=Default, first value mỗi property) | Đọc component `.tsx`, extract CSS classes cho default state |
| 4 | Mỗi `variantStyles` entry = đúng CSS class cho property value đó | Map từng CSS class → JSON field |
| 5 | `height`/`width` match web sizing (`h-9`=36, `h-3xl`=40, `h-xl`=24) | Check component `.tsx` size classes |
| 6 | `paddingX`/`paddingY` match web padding (`px-md`=16, `px-sm`=12, `p-md`=16) | Check component `.tsx` padding classes |
| 7 | Colors match: hover → `border-strong`, focus → `ring`, error → `destructive-border` | Check component `.tsx` state classes |
| 8 | Form components có `iconFill: "muted-foreground"` trong base | Web icon luôn `text-muted-foreground`, không đổi theo value |
| 8b | Children icon instances có `iconFill` theo variant (Alert, Toast, Banner...) | Check web `[&>svg]:text-{color}` per variant → map sang `iconFill` |
| 8c | KHÔNG dùng `iconOpacity` hay `opacity-*` trong JSON — plugin KHÔNG hỗ trợ per-icon opacity | Web `opacity-50` trên icon = vi phạm rule → fix web thành `text-muted-foreground` trước, JSON dùng `iconFill: "muted-foreground"` |
| 9 | `gap` match web spacing (absolute pos icon = gap "xs" cho 8px visual offset) | Check web layout: autolayout vs absolute position |
| 10 | `examples` match web Examples section (same groups, same items) | So sánh web Examples với JSON examples |
| 11 | Property migration safe: default value (first in array) phải là giá trị "neutral" — existing instances sẽ nhận default khi property mới được thêm | VD: `"Show Label": ["Yes", "No"]` → existing variants nhận `Show Label=Yes` (giữ nguyên hành vi cũ). Nếu default = "No" → label biến mất trên tất cả existing instances |

### Bước 3: Visual Diff Prediction (Mental Render)

Cho MỖI variant combination (hoặc ít nhất mỗi property value), "render" trong đầu kết quả Figma và so sánh với web:

| # | Check | Chi tiết |
|---|-------|---------|
| 1 | Base variant: size, padding, border, text color, font đúng? | So sánh mental Figma vs web default state |
| 2 | Hover: border color thay đổi đúng? Fill có thêm? | `stroke: "border-strong"` hoặc `fill: "muted"` |
| 3 | Focus: ring effect + border strong? | `effectStyleName` hoặc `focusRing` |
| 4 | Disabled: opacity 0.5? | `"opacity": 0.5` |
| 5 | Error: destructive border + ring-error? | `stroke: "destructive-border"`, `focusRing: "ring-error"` |
| 6 | fillOpacity conflicts: State wins over Striped? | Check property order (last applied wins in merge) |
| 7 | Addon (textLeft/textRight): border sides, sizing, radius correct? | `strokeSides`, `HUG`/`FILL` sizing |
| 8 | Children: correct type (instance vs frame), showWhen logic? | Instance cho existing ComponentSet/Component. **Icon instance check**: (a) icon name match `foundation-icons.json` (common-mistake #81), (b) `iconFill` set per variant (common-mistake #82), (c) plugin KHÔNG hỗ trợ `iconOverrides` → nếu cần icon khác → dùng frame + icon (common-mistake #74) |
| 9 | Indicator: icon goes in indicator, label goes in comp? | `iconFill` vs `textFill` |
| 10 | Text truncation: `labelFill: true` cho text cần truncate? | Width constraint + single line |

### Output Format

Sau review, report kết quả:

```
## JSON Spec Review: {ComponentName}

### Format Validation: ✅ PASS / ❌ {N issues}
- [issue list nếu có]

### Web Cross-Check: ✅ PASS / ❌ {N issues}
- [issue list nếu có]

### Visual Diff: ✅ PASS / ❌ {N issues}
- [issue list nếu có]

### Result: ✅ READY / 🔧 FIXED {N issues} / ❌ BLOCKED
```

Nếu có issue → fix TRƯỚC khi giao user. Report lại sau fix.

---

## ComponentSet Visual Standard

Mỗi ComponentSet được tạo trên Figma PHẢI tuân theo các quy tắc visual sau:

### Border & Radius
- **Border**: Inside, 1px, style **DASH**, stroke color = `foreground`
- **Border radius**: 16px
- Plugin PHẢI apply border + radius này lên node ComponentSet sau khi tạo/update

### Upsert Behavior (Position Preservation + Property Migration)
Plugin upsert xử lý 4 case khi ComponentSet (CS) đã tồn tại trên Figma:

1. **Pure update** (không thêm/xóa variant): Update trực tiếp lên variant hiện tại — **KHÔNG chạm position** của CS hay bất kỳ variant nào. Không gọi `combineAsVariants()`.
2. **Structural change** (thêm/xóa variant):
   - Xóa variant thừa: `variant.remove()` trên CS children
   - Thêm variant mới: `existingCS.appendChild(newVariant)` — thêm trực tiếp vào CS, KHÔNG gọi `combineAsVariants()`
   - Sau đó gọi `_layoutVariantsInGrid(cs, propNames, properties)` để sắp xếp lại lưới
   - Restore `cs.x`, `cs.y` về vị trí gốc (saved trước khi bắt đầu)
3. **Property migration** (thêm/xóa property trong spec — Section 1.6):
   - Plugin parse property names từ existing variant names, so sánh với spec `propNames`
   - **Thêm property**: Rename variant cũ, append `NewProp=DefaultValue` (first value trong `properties` array). VD: `Value=Unchecked, State=Default` → `Value=Unchecked, State=Default, Show Label=Yes`
   - **Xóa property**: Rename variant cũ, bỏ property pairs không còn trong spec. Nếu nhiều variant collapse cùng tên → giữ cái đầu, remove duplicate
   - Rebuild `existingVarMap` với tên mới → matching logic tìm thấy và reuse → **preserve instances trên mọi page**
   - Chỉ tạo variant MỚI cho combinations chưa tồn tại (VD: `Show Label=No`)
4. **CS bị auto-delete** (Figma xóa CS khi variant cuối bị remove): Fallback `combineAsVariants()` + `_layoutVariantsInGrid()` + restore position

**CRITICAL**: `combineAsVariants()` phá hủy toàn bộ layout — CHỈ gọi khi tạo mới hoặc CS bị auto-delete. Khi CS còn tồn tại → update in-place. **KHÔNG BAO GIỜ** xóa tất cả variant rồi tạo lại khi property keys thay đổi.

### Variant Grid Layout (`_layoutVariantsInGrid`)
Helper function sắp xếp variants theo lưới property-based:

- **Axes**: Property cuối cùng trong `propNames` = **columns** (X axis), các property còn lại = **rows** (Y axis)
- **Row key**: Cross product của tất cả properties trừ property cuối (VD: `Type=Error` hoặc `Variant=Outline,Size=Small`)
- **Gap**: 20px giữa variants (cả horizontal và vertical)
- **Column width**: Max width trong mỗi cột (tất cả variants cùng column value)
- **Row height**: Max height trong mỗi hàng (tất cả variants cùng row key)
- **Empty rows**: Tự động bỏ qua (do `variantRestrictions` filter)
- **Single property**: Xếp 1 hàng ngang
- **CS resize**: Tự động resize CS frame để vừa khít grid

Thứ tự sắp xếp: theo thứ tự khai báo trong `properties` (top-to-bottom cho rows, left-to-right cho columns)

### Property 1:1 Match với React
- Tên property trên Figma = tên control trên React Explore (Title Case)
- Tên value = giống 100% React (VD: React `"Default"` → Figma `"Default"`, KHÔNG viết tắt)
- Số lượng values = khớp chính xác (KHÔNG thừa, KHÔNG thiếu)
- Nếu React có restriction (disable/hide control) → Figma dùng `variantRestrictions`

---

## 7. Foundation Docs (Visual Documentation)

**Plugin function**: `doFoundationDocs(spec)` (planned — not yet implemented in plugin)
**JSON files**: `figma-specs/docs/*.json` (7 files)
**Output**: Visual documentation frames on the 🧱 Foundation page

Foundation Docs are JSON files that define **visual documentation pages** for design tokens — showing color swatches, typography samples, spacing bars, radius demos, effect cards, etc. They are the Figma equivalent of the web React foundation tabs (Colors, Typography, Spacing, Border Radius, Effects, Icons, Illustrations).

### Source of Truth Chain

```
index.css (CSS custom properties)
    ↓ defines tokens
Web DS page (design-system/index.tsx → *Docs() functions)
    ↓ displays all tokens visually
Foundation Docs JSON (figma-specs/docs/*.json)
    ↓ mirrors web sections 1:1
Figma Foundation page (🧱 Foundation)
```

**Rule**: Every token in `index.css` MUST appear in the web DS page AND the corresponding JSON doc. When updating one, update ALL three.

### File Inventory

| File | Web Tab | Sections |
|------|---------|----------|
| `colors.json` | Colors | 17 sections: Base, Card & Popover, Primary, Secondary & Accent, Border & Ring, Input & Form, Ghost & Outline, Surface & Code, Destructive, Success, Warning, Emphasis, Brand, Glass, Chart, Sidebar, Color Palettes |
| `typography.json` | Typography | 6 sections: Font Families, Headings, Body Text, Labels & Captions, Data & KPI, Font Weights |
| `spacing.json` | Spacing | 1 section: Scale (14 items: none→6xl) |
| `border-radius.json` | Border Radius | 1 section: Scale (10 items: none→full) |
| `shadows.json` | Effects | 4 sections: Shadows (7), Glass Blur (4), Glow (3), Focus Rings (6) |
| `illustrations.json` | Illustrations | 3 sections: Empty States, Decorative Patterns, Guidelines |
| (none) | Icons | Dynamic Lucide browser on web — icons exist as Figma components via `foundation-icons.json` |

### JSON Structure

```json
{
  "type": "foundation-docs",
  "targetPage": "🧱 Foundation",
  "name": "Colors",
  "description": "Description text...",
  "sections": [
    {
      "title": "Section Title",
      "sectionType": "color-grid|palette|type-scale|font-family|font-weight|spacing-bar|radius-grid|shadow-grid|illustration-grid|pattern-grid|guidelines",
      "columns": 4,
      "items": [
        { "name": "Background", "variable": "background", "tw": "bg-background" }
      ]
    }
  ]
}
```

### Section Types

| sectionType | Used in | Item fields |
|-------------|---------|-------------|
| `color-grid` | colors.json | `name`, `variable` (Figma var name), `tw` (Tailwind class) |
| `palette` | colors.json | `name`, `shades` (object: `"50": "#hex"` ... `"950": "#hex"`) |
| `type-scale` | typography.json | `name`, `textStyle` (Figma text style name e.g. `SP/H1`), `spec`, `sample` |
| `font-family` | typography.json | `name`, `usage`, `class` |
| `font-weight` | typography.json | `name`, `weight`, `fontFamily`, `class` |
| `spacing-bar` | spacing.json | `name`, `value` (px number), `tw` |
| `radius-grid` | border-radius.json | `name`, `value` (px number), `tw` |
| `shadow-grid` | shadows.json | `name`, `tw`, `effectStyle` (Figma effect style name), `desc` |

### Color Token Rules

- **Semantic colors** (`variable` field): Bind to Figma variables → auto dark mode
- **Raw palette hex** (`shades` object): Hardcoded fill → reference colors, no dark mode
- **Variable names** must match `foundation-variables.json` semantic color collection exactly
- **`tw` field**: Full Tailwind class including prefix (`bg-`, `text-`, `border-`, `ring-`)
- **No `destructive-hover`** or other non-existent tokens — only tokens defined in `index.css`

### Sync Protocol — Updating Foundation Docs

When CSS tokens change in `index.css`:

1. **Update web** — edit the `*Docs()` function in `design-system/index.tsx`
2. **Update JSON** — edit corresponding `figma-specs/docs/*.json` to match web exactly
3. **Verify sync** — count items per section in web vs JSON — must be identical
4. **Check tw values** — use full Tailwind class names (e.g. `text-destructive-subtle-foreground`), NOT abbreviations (`text-destructive-subtle-fg`)

### Lessons Learned

| Issue | Fix |
|-------|-----|
| `destructive-hover` in JSON but not in CSS | Always grep `index.css` for token existence before adding to JSON |
| Sidebar section had 6/10 items | Count CSS `--color-sidebar-*` lines and match exactly |
| Backdrop placement differed (JSON: Base Colors, web: Surface & Code) | Follow web section grouping as source of truth |
| `tw` abbreviations (`-fg` instead of `-foreground`) | Copy full tw class names from web, no shortcuts |
| Chart section missing entirely | Scan ALL `--color-*` lines in `index.css` — don't miss any category |
| Icons tab = dynamic browser | Not suitable for static JSON doc — icons already exist as Figma components |

---

## 8. Screens (Page UI Generation)

**Plugin function**: `doGenerate(spec)` — reuses existing layout engine, **NO plugin code changes needed**.
**UI tab**: "Generate UI" — paste JSON → Generate.

Screens render full-page UI frames on Figma — complete with sidebar, header, content, using real ComponentSet instances from Type 5.

### Structure

```json
{
  "pageName": "Dashboard — Overview",
  "sectionLabel": "Dashboard",
  "roots": [
    {
      "type": "frame",
      "name": "Overview / Default — Dark",
      "layout": "horizontal",
      "sizing": { "width": "fixed:1440", "height": "fixed:900" },
      "fill": "background",
      "children": [
        { "sidebar (80px)": "..." },
        {
          "type": "frame", "name": "Main Area",
          "layout": "vertical", "sizing": { "width": "fill", "height": "fill" },
          "children": [
            { "header (56px)": "..." },
            { "content area": "page-specific content" }
          ]
        }
      ]
    }
  ]
}
```

- `pageName` → creates Figma page `[Gen] {pageName}`
- `roots` array → multiple frames rendered left→right (Dark + Light variants)
- `sectionLabel` → gray label text above frames

### File Organization

```
figma-specs/screens/
├── auth/            sign-in, sign-up, forgot-password, onboarding
├── dashboard/       overview, analytics, reports
├── management/      orders, order-detail, products, users-list, user-profile, invoices
├── settings/        general, notifications, billing, help-support
└── utility/         empty-state, not-found
```

### Naming Conventions

| Field | Pattern | Example |
|-------|---------|---------|
| `pageName` | `"{Category} — {Screen}"` | `"Auth — Sign In"` |
| `sectionLabel` | Category name | `"Dashboard"` |
| Root frame `name` | `"{Screen} / {State} — {Theme}"` | `"Overview / Default — Dark"` |

State values: Default, Loading, Empty, Error, Offline.
Theme values: Dark, Light.

### Frame Dimensions

| Breakpoint | Width × Height | Usage |
|-----------|---------------|-------|
| Desktop | 1440 × 900 | Primary — all screens |
| Tablet | 768 × 1024 | Secondary — key screens |
| Mobile | 375 × 812 | Secondary — key screens |

### Node Types (renderNode dispatcher)

| Type | Description | Example |
|------|-------------|---------|
| `frame` | Auto-layout container + children | Card, row, column, section |
| `text` | Styled text node | Heading, body, label, caption |
| `component` | Instance from ComponentSet (Type 5) | Button, Input, Checkbox, Badge |
| `placeholder` | Colored rect + label text | Chart, image, illustration |
| `separator` | 1px divider | Horizontal/vertical line |

### Layout Templates

#### Dashboard Layout Wrapper (Sidebar + Header + Content)
```json
{
  "type": "frame",
  "name": "Overview / Default — Dark",
  "layout": "horizontal",
  "sizing": { "width": "fixed:1440", "height": "fixed:900" },
  "fill": "background",
  "children": [
    {
      "type": "frame", "name": "Sidebar",
      "layout": "vertical",
      "sizing": { "width": "fixed:80", "height": "fill" },
      "fill": "sidebar", "padding": "sm", "gap": "xs",
      "align": { "counter": "center" },
      "children": ["logo, nav icons, user avatar"]
    },
    {
      "type": "frame", "name": "Main Area",
      "layout": "vertical",
      "sizing": { "width": "fill", "height": "fill" },
      "children": [
        {
          "type": "frame", "name": "Header",
          "layout": "horizontal",
          "sizing": { "width": "fill", "height": "fixed:56" },
          "fill": "background", "stroke": "border",
          "padding": { "x": "xl" }, "gap": "md",
          "align": { "counter": "center", "justify": "space-between" },
          "children": ["breadcrumb/title left, search+notifications+avatar right"]
        },
        {
          "type": "frame", "name": "Content",
          "layout": "vertical",
          "sizing": { "width": "fill", "height": "fill" },
          "padding": "2xl", "gap": "xl",
          "children": ["page-specific content sections"]
        }
      ]
    }
  ]
}
```

#### Auth Layout Wrapper (Left Panel + Right Panel)
```json
{
  "type": "frame",
  "name": "Sign In / Default — Dark",
  "layout": "horizontal",
  "sizing": { "width": "fixed:1440", "height": "fixed:900" },
  "fill": "background",
  "children": [
    {
      "type": "frame", "name": "Left Panel — Branding",
      "layout": "vertical",
      "sizing": { "width": "fixed:720", "height": "fill" },
      "fill": "sidebar", "padding": "2xl", "gap": "xl",
      "align": { "justify": "space-between", "counter": "center" },
      "children": ["logo row, illustration + tagline, stats row"]
    },
    {
      "type": "frame", "name": "Right Panel — Form",
      "layout": "vertical",
      "sizing": { "width": "fill", "height": "fill" },
      "fill": "background",
      "align": { "justify": "center", "counter": "center" },
      "children": ["form card (max-w 440px)"]
    }
  ]
}
```

### Reusable Section Patterns

#### KPI Card Row (Dashboard/Management)
```json
{
  "type": "frame", "name": "KPI Cards",
  "layout": "horizontal", "gap": "lg", "sizing": { "width": "fill" },
  "children": [
    {
      "type": "frame", "name": "KPI — Revenue",
      "layout": "vertical", "sizing": { "width": "fill" },
      "fill": "card", "stroke": "border", "radius": "xl",
      "padding": "lg", "gap": "sm",
      "children": [
        { "type": "text", "content": "Total Revenue", "textStyle": "sp-label", "fill": "muted-foreground" },
        { "type": "text", "content": "$45,231.89", "textStyle": "sp-kpi-lg", "fill": "foreground" },
        { "type": "text", "content": "+20.1% from last month", "textStyle": "sp-caption", "fill": "success" }
      ]
    }
  ]
}
```

#### Table Section (Management)
```json
{
  "type": "frame", "name": "Orders Table",
  "layout": "vertical", "sizing": { "width": "fill" },
  "fill": "card", "stroke": "border", "radius": "xl", "clip": true,
  "children": [
    { "// header": "horizontal frame, fill muted/50, sp-label headers" },
    { "// rows": "horizontal frames with data, separator between each" },
    { "// pagination": "horizontal frame at bottom" }
  ]
}
```

#### Form Section (Settings)
```json
{
  "type": "frame", "name": "Profile Form",
  "layout": "vertical", "sizing": { "width": "fill" },
  "fill": "card", "stroke": "border", "radius": "xl",
  "padding": "xl", "gap": "lg",
  "children": [
    { "// header": "title + description text" },
    {
      "type": "frame", "name": "Field — Name",
      "layout": "vertical", "gap": "3xs", "sizing": { "width": "fill" },
      "children": [
        { "type": "text", "content": "Full Name", "textStyle": "sp-label", "fill": "foreground" },
        { "type": "component", "componentSet": "Input",
          "overrides": { "text": { "Input": "John Doe" } },
          "sizing": { "width": "fill" } }
      ]
    }
  ]
}
```

#### Chart Placeholder
```json
{
  "type": "placeholder", "name": "Revenue Chart",
  "sizing": { "width": "fill", "height": "fixed:300" },
  "fill": "card", "stroke": "border", "radius": "xl",
  "label": "Revenue Bar Chart\n(Recharts — 12 months)"
}
```

### Component References

Screens use `"type": "component"` to create instances from existing ComponentSets (Type 5):

```json
{
  "type": "component",
  "componentSet": "Button",
  "name": "Save Button",
  "variants": { "Variant": "Default", "Size": "Default" },
  "overrides": { "text": { "Label": "Save Changes" } },
  "sizing": { "width": "fill" }
}
```

**Override types**:
- `overrides.text` — text swap: `{ "Label": "Save" }`
- `overrides.boolean` — show/hide: `{ "Show Icon": true }`
- `overrides.nested` — nested text: `{ "childName": { "Label": "text" } }`
- `overrides.nestedVariants` — nested variant swap: `{ "childName": { "Size": "Small" } }`
- `slots` — shorthand for text overrides

### State Variants per Screen Type

| Page Type | Required Roots |
|-----------|----------------|
| Auth | Default Dark, Default Light |
| Dashboard | Default Dark, Default Light |
| Management (list) | Default Dark, Default Light, Loading Dark, Empty Dark |
| Management (detail) | Default Dark, Default Light |
| Settings | Default Dark, Default Light |
| Utility | Default Dark, Default Light |

### Source of Truth

```
React Page (.tsx) → Screen JSON (.json) → Figma Frame
```

- **Content**: From React mock data (`src/data/*.ts`) — realistic names, numbers, dates
- **Layout**: Match React JSX nesting (flex direction, gap, padding)
- **Components**: Reference ComponentSets by exact name from `figma-specs/components/`
- **Colors**: Semantic tokens only — NO hardcoded hex
- **Typography**: `sp-*` text styles from Figma text styles

### Rules

1. Root frames MUST be `fixed:1440` width × `fixed:900` height (desktop)
2. Sidebar = `fixed:80` width, Header = `fixed:56` height
3. All `componentSet` names must exist in `figma-specs/components/`
4. No hardcoded hex colors — use semantic fill tokens (`background`, `card`, `sidebar`, `primary`, etc.)
5. Text styles use `sp-*` names (fallback to font map in plugin)
6. Charts/images that can't be rendered as components → use `placeholder` type
7. Frame hierarchy should match React JSX nesting structure
8. Mock data must be realistic (no "Lorem ipsum", no "John Doe" ×20)
9. Each screen JSON = 1 file, produces 1 Figma page with 2-4 root frames (Dark + Light variants)

### Lessons Learned

*(To be populated as screens are built)*

---

## Quick Checklist — Before Submitting Any JSON

### Variables
- [ ] Raw colors collection comes FIRST
- [ ] Alias references use `$collectionName/varName` format
- [ ] Scopes are valid Figma scope arrays
- [ ] All mode names in `values` match `modes[]`

### Text Styles
- [ ] Font family and style names are exact
- [ ] letterSpacing uses `"em"` suffix for em values
- [ ] All styles follow `SP/*` naming convention

### Effect Styles
- [ ] Shadow alpha is separate from color hex (0-1 float)
- [ ] Blur types: `BACKGROUND_BLUR` for glass, `LAYER_BLUR` for gaussian
- [ ] Style names use `/` grouping: `Shadows/md`, `Glass/card`

### Icons
- [ ] SVG uses `stroke="currentColor"`
- [ ] Icon names match Lucide naming exactly — **verify in `foundation-icons.json`** (Lucide renames icons between versions)
- [ ] Names will be used as `"Icon / {name}"` in Figma
- [ ] Component JSON referencing icons uses full name: `"component": "Icon / Info"` (NOT just `"Info"`)

### Components
- [ ] `properties` matches web ExploreBehavior controls 1:1
- [ ] All values in `properties` are Title Case
- [ ] `base.width` and `base.height` are numbers (not strings)
- [ ] Spacing values (`paddingX`, `paddingY`, `gap`) use **string tokens** (`"none"`, `"xs"`, `"sm"`, `"md"`, `"lg"`, `"xl"`) for Figma variable binding — NOT hardcoded numbers. Use `"none"` for zero values (binds `spacing/none`). Plugin auto-binds number `0` as safety net, but `"none"` is preferred. Token map: `none=0, 3xs=4, 2xs=6, xs=8, sm=12, md=16, lg=20, xl=24, 2xl=32, 3xl=40`
- [ ] All `fill`/`stroke`/`textFill` use semantic tokens
- [ ] `variantStyles` covers every value in every property axis
- [ ] Compound variant keys have no spaces around comma
- [ ] `examples` items include ALL property axes in props (web-only, not rendered in Figma)
- [ ] `installation` field present with `import` (required). Add `dependencies` with `pnpm add PACKAGE` when component has external deps (Radix, input-otp, vaul, etc.). Omit `dependencies` for built-in components with no external pkg. Other fields (`props`, `designTokens`, `bestPractices`, `figmaMapping`, `accessibility`, `related`, `examples`) are optional — web documentation only
- [ ] `iconLeftName`/`iconRightName` match icons in foundation — **ALWAYS verify name in `foundation-icons.json`** (Lucide renames icons between versions: AlertCircle→CircleAlert, CheckCircle2→CircleCheck, AlertTriangle→TriangleAlert)
- [ ] Children icon instances (`"type": "instance", "component": "Icon / ..."`) set `iconFill` to match variant-specific color (e.g. `"iconFill": "destructive-subtle-foreground"` for error variant). Without `iconFill`, icon inherits master component default color
- [ ] Total variant count < 600
- [ ] Compound components (Checkbox/Switch/Radio) use `indicator` pattern with `iconFill` for icon color
- [ ] Donut/arc components (Spinner) use `ellipses` array with `hideLabel: true`, element `opacity` (not `fillOpacity`), and `innerRadius` ratio
- [ ] Multi-section components (Card/Dialog/AlertDialog/Collapsible) use `children` array with `hideLabel: true`
- [ ] `children` items with conditional visibility use `showWhen` matching property axis values
- [ ] **Instance rule**: Any sub-element that corresponds to an existing ComponentSet (Button, Checkbox, Switch, Toggle, Badge, etc.) uses `"type": "instance"` with `component`/`variants`/`textOverrides` — NEVER manual `"type": "frame"` recreating that component's visual
- [ ] `showcase.sections` set to `["header", "component", "installation"]` — plugin only generates these 3 sections (header, component grid from Explore, installation). All other sections (examples, props, designTokens, bestPractices, figmaMapping, accessibility, related) are **web-only** — NOT generated in Figma
- [ ] Components with `imageUrl` use **direct URLs** (no redirects) and domain is in `manifest.json` `networkAccess.allowedDomains`
- [ ] Components needing content clipping (circular Avatar, rounded cards with image) set `clipsContent: true` in `base`
- [ ] **Components with `focusRing`** in variantStyles MUST have `clipsContent: true` in `base` — Figma requires clip content ON for effect style DROP_SHADOW to render
- [ ] `textContent` used for all text values (NOT `text` — plugin reads `merged.textContent`)
- [ ] `textStyle` uses Figma text style names (`"SP/Body"`, NOT CSS class names like `"sp-paragraph-sm"`)
- [ ] `gap` explicitly set (omitting defaults to hardcoded `8` without variable binding — use `"none"` for zero gap, `"auto"` for space-between auto)
- [ ] **ComponentSet visual**: border inside 1px DASH foreground, radius 16px, variants xếp lưới gọn gàng (xem "ComponentSet Visual Standard")
- [ ] **Property 1:1**: `properties` keys + values khớp 100% React Explore controls (tên, số lượng, Title Case)
- [ ] Icon variants set BOTH `iconLeft: true` AND `iconLeftName` (boolean flag required for rendering)
- [ ] Form components (Input/Select/Textarea) do NOT use `hideLabel: true` — label is the placeholder/value text
- [ ] Focus states use `effectStyleName: "Ring/default"` (preferred) or `focusRing: "ring"` (for indicators)
- [ ] **All `radius` values use string tokens** (`"none"`, `"full"`, `"lg"`, `"md"`, `"sm"`, etc.) — NEVER raw numbers like `9999`, `16`, `8`. Applies to `base.radius`, `variantStyles.radius`, `children[].radius`, `indicator.radius`. Plugin auto-binds `border radius/none` for number `0` as safety net, but string `"none"` is preferred for explicit zero radius.

### Foundation Docs
- [ ] Every token in `index.css` appears in both the web DS page AND the JSON doc
- [ ] `variable` names match `foundation-variables.json` semantic color collection
- [ ] `tw` values use full Tailwind class names (no abbreviations like `-fg`)
- [ ] `textStyle` values use Figma text style names (`SP/H1`, not CSS classes)
- [ ] `effectStyle` values match Figma effect style names exactly (`Shadows/md`, `Glass/card`, `Ring/default`)
- [ ] Section count and item count match web DS page exactly
- [ ] No tokens that don't exist in `index.css` (grep before adding)

### Screens
- [ ] Root frame dimensions: `fixed:1440` × `fixed:900`
- [ ] Sidebar `fixed:80`, Header `fixed:56`
- [ ] All `componentSet` names exist in `figma-specs/components/`
- [ ] No hardcoded hex — semantic fill tokens only
- [ ] Text styles use `sp-*` names
- [ ] Frame hierarchy matches React JSX nesting
- [ ] Mock data is realistic (from `src/data/*.ts`)
- [ ] `pageName` format: `"{Category} — {Screen}"`
- [ ] Root frame `name` format: `"{Screen} / {State} — {Theme}"`

---

## HTML to Figma Pipeline (DOM Extraction)

### Architecture
- **Server**: `tools/figma-extractor/html-to-figma.ts` — Playwright-based HTTP API (port 3457)
- **DOM Walker**: `tools/figma-extractor/raw-dom-walker.ts` — browser-side DOM extraction script
- **Token Mapper**: `tools/figma-extractor/style-mapper.ts` — CSS computed values → semantic token names
- **States**: `tools/figma-extractor/states.ts` — Playwright actions for edge case states (filled, validation-error, submitting, etc.)
- **Config**: `tools/figma-extractor/config.ts` — page routes, breakpoints, token maps
- **Plugin UI**: `plugins/HTML to Figma/ui.html` — Figma plugin frontend, connects to server API

### API Endpoints
- `GET /api/pages` — List pages with states: `{ pages: [{ name, route, category, states: string[] }] }`
- `GET /api/extract/{page}?breakpoint=Desktop&state=filled` — Extract single breakpoint: `{ tree, pageName }`
- `GET /api/extract/{page}?breakpoints=Desktop,Tablet,Mobile` — Multi-breakpoint: `{ pageName, roots: [{ breakpoint, width, minHeight, tree }] }`

### State Execution Flow
1. Plugin UI sends `?state=filled` param
2. Server looks up `PAGE_STATES[pageName]` → finds `ScreenState` with matching name
3. Playwright navigates to page, applies `waitMode` and `skipSettleWait` from state config
4. Executes state actions in order: fill, click, wait, waitFor, evaluate, press, hover
5. DOM walker extracts post-action DOM tree
6. Response includes `pageName: "{page}-{state}"` for Figma frame naming

### DOM Walker Key Patterns
- **Input icon extraction**: Native `<input>` has no children — walker scans parent wrapper (`position:relative` + flex) for sibling `<svg>` elements
- **Input width from wrapper**: Use parent wrapper dimensions for sizing, not the `<input>` element itself
- **Single-child flattening**: Skip wrapper divs with no visual properties (but preserve if has bg/stroke/data-slot)
- **Background screenshots**: Decorative elements (gradients, glow, grid) captured as base64 images

### Plugin UI Patterns
- **Collapsible states**: State items rendered flat in page list with `style.display` toggle (no wrapper div — Figma sandbox CSS limitations)
- **Port sync**: Plugin UI default URL must match server `SERVE_PORT` (currently 3457)
- **Responsive flow**: UI sends `responsive-start` → `responsive-frame` (per breakpoint) → `responsive-end` to plugin code
