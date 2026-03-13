# Common Mistakes & Lessons — tn Products

> File tham chiếu dùng chung cho TẤT CẢ products trong `tn/`.
> Trước khi bắt đầu bất kỳ task nào, ĐỌC file này.
> Cập nhật: 2026-03-13 | 118 lessons

---

## Mục lục

- [A. Figma Plugin](#a-figma-plugin) (#1-#8)
- [B. JSON Spec Files](#b-json-spec-files) (#9-#13)
- [C. Component Docs — Web App](#c-component-docs--web-app) (#14-#22, #58-#59, #62-#63)
- [D. Design Token & Styling](#d-design-token--styling) (#23-#28, #34-#35)
- [D2. Plugin & JSON Spec — Input Components](#d2-plugin--json-spec--input-components) (#36-#38)
- [D3. Plugin — Upsert & Rendering](#d3-plugin--upsert--rendering) (#39-#41, #68, #123, #126)
- [D4. Plugin — Instance Sizing & Performance](#d4-plugin--instance-sizing--performance) (#42-#44)
- [D5. Plugin — Variable Binding](#d5-plugin--variable-binding) (#45, #56)
- [D6. Plugin — Image & clipsContent](#d6-plugin--image--clipscontent) (#49-#51)
- [D7. Plugin — Ellipse Rendering](#d7-plugin--ellipse-rendering) (#52-#54)
- [D8. Plugin — Variable Scopes](#d8-plugin--variable-scopes) (#55)
- [D9. Plugin — Variant Restrictions](#d9-plugin--variant-restrictions) (#69)
- [D10. Component Docs — Property Visibility](#d10-component-docs--property-visibility) (#70-#74)
- [D11. Plugin — Instance & Layout in Children Frames](#d11-plugin--instance--layout-in-children-frames) (#75-#80)
- [D12. Plugin — Icon Instance in Children](#d12-plugin--icon-instance-in-children) (#81-#83)
- [D13. Plugin — Zero Value Variable Binding](#d13-plugin--zero-value-variable-binding) (#87)
- [D14. Component Layout — Full-Width Divider Pattern](#d14-component-layout--full-width-divider-pattern) (#88)
- [D15. Foundation Docs — Web ↔ JSON Sync](#d15-foundation-docs--web--json-sync) (#89-#91)
- [D16. DOM Extraction — Portal & Fallback](#d16-dom-extraction--portal--fallback) (#97-#100)
- [E. Workflow & Process](#e-workflow--process) (#29-#33)

---

## A. Figma Plugin

### #1: Plugin code.js phải là Plain JavaScript — không TypeScript

**Sai**: Viết code.js với type annotations (`: Record<string, Variable>`, `interface X {}`).

**Đúng**: Figma "Run once" plugin yêu cầu plain JS. File `code.js` từ template chứa `throw new Error("This plugin template uses TypeScript...")` — phải overwrite toàn bộ.

**Rule**: Không dùng TS syntax trong `tn/plugins/*/code.js`. Nếu cần type safety → viết file `.ts` riêng rồi compile ra `.js`.

---

### #2: Plugin `_buildShowcase()` crash khi `properties: {}` rỗng

**Sai**: JSON spec component có `"properties": {}` → `propNames[0]` = `undefined` → `firstProp.toLowerCase()` crash: `Error: cannot read property 'toLowerCase' of undefined`.

**Đúng**: Mỗi component trong JSON spec PHẢI có ít nhất 1 property.

**Rule**: Trước khi chạy plugin, kiểm tra TẤT CẢ component trong mọi file `figma-specs/components-*.json`:
```
grep -r '"properties": {}' tn/products/*/figma-specs/
```
Nếu tìm thấy → thêm ít nhất 1 property có nghĩa (không phải dummy).

**Các component hay bị**:
- Overlay components (Drawer, Popover, AlertDialog) — khi chưa xác định properties
- Simple display components (Separator, Skeleton) — tưởng không cần property

---

### #3: Plugin variable binding — dùng full path, KHÔNG bare token name

**Sai**: `bindFloat(comp, "paddingLeft", "sm", 12)` — `findVar("sm")` match `border radius/sm` (4px) thay vì `spacing/sm` (12px).

**Đúng**: Luôn dùng full path: `"spacing/sm"`, `"border radius/lg"`.

**Rule**: Không bao giờ pass bare token name ("sm", "lg", "xl") vào `bindFloat` / `findVar`. Luôn include collection prefix.

---

### #4: Plugin grid layout — property đầu tiên = columns

**Sai**: Tất cả properties stack dọc → ComponentSet rất cao và hẹp.

**Đúng**: Property đầu tiên (thường là Variant) quyết định số cột. Các property còn lại (Size, State...) stack thành rows.

**Rule**: Sắp xếp `properties` trong JSON spec sao cho property có nhiều values nhất đặt đầu tiên → tạo grid đẹp trong Figma.

---

### #5: Plugin IconLeft/IconRight không hiển thị icon

**Sai**: `merged.iconLeft` = undefined vì `mergeComponentStyles` chỉ apply `variantStyles` keys, `base` không có `iconLeft`.

**Đúng**: Auto-detect từ combo object: `combo["IconLeft"] === "true" || combo["Show Left Icon"] === "true"`.

**Rule**: Không rely vào `merged.iconLeft` duy nhất. Check cả combo properties trực tiếp.

---

### #6: Figma Effect API — blendMode khác nhau theo type

**Sai**: Dùng `blendMode: "NORMAL"` cho tất cả effect types → crash trên BACKGROUND_BLUR / LAYER_BLUR.

**Đúng**:
- **Shadows** (DROP_SHADOW, INNER_SHADOW): cần `blendMode`, `color`, `offset`, `radius`, `spread`
- **Blurs** (LAYER_BLUR, BACKGROUND_BLUR): CHỈ `type`, `visible`, `radius` — KHÔNG `blendMode`

**Rule**: Build effect object per-type, không từ shared base.

---

### #7: Figma createEffectStyle — orphan styles khi crash

**Sai**: `figma.createEffectStyle()` + set name TRƯỚC khi build effects array → crash → orphan empty style trong Figma.

**Đúng**: Build effects array + validate TRƯỚC → rồi mới `createEffectStyle()` + assign effects cùng lúc.

**Rule**: Prepare ALL data trước mọi `create*Style()` / `createVariable()` call.

---

### #8: Figma font style naming khác nhau per family

**Sai**: `figma.loadFontAsync({ family: "Inter", style: "SemiBold" })` → Inter cần "Semi Bold" (có space).

**Mapping**:
- Inter: "Semi Bold" (spaced)
- Plus Jakarta Sans: "SemiBold" (no space)
- JetBrains Mono: Không có SemiBold → fallback Bold (700)

**Rule**: Luôn dùng `loadFontSafe()` với fallback chain. Không dùng raw `figma.loadFontAsync()`.

---

## B. JSON Spec Files

### #9: JSON spec schema — tất cả fields bắt buộc

**Sai**: Thiếu `properties`, `props`, `figmaMapping`, hoặc `accessibility` → plugin crash hoặc output thiếu.

**Schema bắt buộc cho mỗi component:**
```json
{
  "name": "Component Name",
  "category": "Components / {Category}",
  "description": "Mô tả ngắn",
  "properties": { "PropertyName": ["value1", "value2"] },
  "base": { "layout": "...", "width": 0, "..." : "..." },
  "variantStyles": {},
  "props": [["propName", "type", "default", "description"]],
  "examples": [{ "name": "...", "layout": "...", "items": [...] }],
  "figmaMapping": [["Figma Layer", "Figma Value", "Code Prop", "Code Value"]],
  "accessibility": { "keyboard": [...], "notes": [...] },
  "related": [{ "name": "...", "desc": "..." }]
}
```

**Rule**: Validate JSON trước khi chạy plugin. Check: `properties` ≠ `{}`, `props` có ít nhất 1 row, `examples` có ít nhất 1 item.

---

### #10: Properties phải phản ánh Figma component 1:1

**Sai**: JSON spec có "ShowHandle" nhưng Figma component không có property đó, hoặc ngược lại.

**Đúng**: `properties` trong JSON = chính xác `componentPropertyDefinitions` của Figma component set.

**Rule**: Trước khi viết JSON spec, fetch Figma component set → liệt kê ALL properties → map 1:1.

---

### #11: Examples layout — "horizontal" vs "vertical"

**Sai**: Dùng `"layout": "horizontal"` cho comparison examples nhưng items quá rộng → overflow.

**Đúng**:
- `"horizontal"`: Cho comparison (2-4 items nhỏ side-by-side) — VD: Button sizes, Badge variants
- `"vertical"`: Cho standalone examples (1 item full width) — VD: Dialog, Form

**Rule**: Horizontal chỉ khi mỗi item < 200px width. Overlay components luôn vertical.

---

### #12: JSON spec description — phải chứa sizing info

**Sai**: `"description": "A modal dialog"` — quá generic, không có thông tin sizing.

**Đúng**: `"description": "Modal dialog. max-w-lg, rounded-xl, p-md gap-xs. Close button top-right. Focus trapped, Esc to close."`

**Rule**: Description = behavior + key sizing tokens + key behavior notes. Dev đọc description phải biết ngay kích thước / spacing chính.

---

### #13: Variant styles key format — phải match properties key

**Sai**: `"properties": { "ShowIcon": [...] }` nhưng `"variantStyles": { "showIcon=true": {...} }` (camelCase vs PascalCase).

**Đúng**: Key trong `variantStyles` phải match chính xác format `"PropertyName=value"`.

**Rule**: Copy-paste property name từ `properties` object → dùng làm prefix cho variantStyles key.

---

## C. Component Docs — Web App

### #14: Explore Behavior PHẢI show giao diện thật — KHÔNG show trigger

**Sai**: Render `<AlertDialogTrigger>` → user chỉ thấy button "Open Alert", phải click mới thấy dialog face.

**Đúng**: Dựng div giả với `pointer-events-none`, render mặt component trực tiếp (title, description, buttons...).

**Ví dụ ĐÚNG (AlertDialog):**
```tsx
<div className="w-full max-w-lg bg-card border rounded-xl shadow pointer-events-none p-xl space-y-lg">
  {showTitle && <h3 className="text-base font-semibold">Are you sure?</h3>}
  <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
  {showAction && <div className="flex justify-end gap-xs">
    <Button variant="outline" size="sm">Cancel</Button>
    <Button size="sm">Continue</Button>
  </div>}
</div>
```

**Ví dụ SAI:**
```tsx
<AlertDialog>
  <AlertDialogTrigger asChild><Button>Open Alert</Button></AlertDialogTrigger>
  <AlertDialogContent>...</AlertDialogContent>
</AlertDialog>
```

**Rule**: Explore Behavior = xem giao diện + toggle properties. Interactive trigger thuộc về section Examples (Interactive Demo). Tham khảo chi tiết: `component-docs-pattern.md` section 2.

**Áp dụng cho**: Dialog, AlertDialog, Sheet, Drawer, Dropdown, Context Menu, Tooltip, Popover, Select.

---

### #15: Component cần trigger → Examples PHẢI có Interactive Demo section

**Sai**: Dialog docs chỉ có static examples → user không thể test focus trap, Esc dismiss, overlay click, animation.

**Đúng**: Thêm "Interactive Demo" card trong Examples section — chứa trigger buttons thật.

```tsx
<div className="rounded-xl border border-border overflow-hidden">
  <div className="px-md py-xs bg-muted/50 border-b border-border">
    <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
  </div>
  <div className="p-lg flex flex-wrap gap-sm">
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="outline" size="sm">Basic</Button></AlertDialogTrigger>
      <AlertDialogContent>...</AlertDialogContent>
    </AlertDialog>
    {/* ... mỗi example variant 1 trigger */}
  </div>
</div>
```

**Components BẮT BUỘC có Interactive Demo**: Dialog, AlertDialog, Sheet, Drawer, Dropdown Menu, Context Menu, Tooltip, Popover, Command, Combobox.

**Components KHÔNG cần**: Button, Input, Checkbox, Badge, Card, Table, và tất cả component hiển thị trực tiếp không cần trigger.

---

### #16: Example `code` prop PHẢI match rendered JSX — 100% identical

**Sai**: Code snippet show `<Button variant="outline">` nhưng visual render `<Button variant="ghost">`.

**Đúng**: `code` prop trong `<Example>` = exact representation của rendered children.

**Rule**: Sau MỌI thay đổi component → re-sync ALL Examples. User copy-paste code phải chạy được giống visual.

---

### #17: Explore Behavior controls phải cover 100% Figma properties

**Sai**: AlertDialog chỉ có 4 controls (ShowIcon, ShowTitle, ShowAction, ShowCancel) nhưng Figma component có 8 properties (thêm Type, Slot, Icon picker, responsive).

**Đúng**: Mỗi Figma property = 1 control trong Explore Behavior. Không ngoại lệ.

**Mapping**:
| Figma property type | Control type |
|-------------------|-------------|
| Variant enum (nhiều options) | `type: "select"` |
| Variant enum (1 option) | `type: "select"`, `disabled: true` |
| Boolean | `type: "toggle"` |
| Instance swap (Icon) | `type: "select"` với icon names |
| Instance swap (Slot) | `type: "select"` với slot names |

---

### #18: Toggle controls disabled logic — parent tắt → child disabled

**Sai**: Tắt "Show Action" nhưng "Show Action Secondary" vẫn toggle được → UI mâu thuẫn.

**Đúng**: Khi parent toggle tắt → tất cả child toggles phụ thuộc PHẢI `disabled: true`.

**Ví dụ AlertDialog:**
- Tắt "Show Action" → "Show Action Secondary" disabled
- Chọn Slot = "congratulation" → TẤT CẢ toggles disabled (vì congratulation slot có layout riêng)

```tsx
{ label: "Show Action", type: "toggle", value: showAction, onChange: handleShowActionChange },
{ label: "Show Cancel", type: "toggle", value: showCancel, onChange: setShowCancel, disabled: !showAction },
```

---

### #19: Toggle controls xếp ngang — không chiếm 1 dòng mỗi toggle

**Sai**: Mỗi toggle (Switch) chiếm 1 dòng riêng → controls panel quá cao, lãng phí vertical space.

**Đúng**: Tất cả toggles xếp ngang hàng (`flex-wrap gap-x-lg gap-y-xs`), select controls giữ dọc.

**Rule**: ExploreBehavior render theo thứ tự:
1. Select controls (pill buttons) — mỗi control 1 dòng
2. Toggle controls (Switch) — TẤT CẢ xếp ngang hàng cùng 1 row

---

### #20: Web app docs thiếu 3 section so với SprouX chuẩn

**Sai**: Component docs chỉ có 7 sections (Header, Explore, Examples, Props, Figma Mapping, Accessibility, Related).

**Đúng**: Phải có đủ **10 sections** theo pattern:
1. Header
2. Explore Behavior
3. Installation (deps + import)
4. Examples (static + interactive demo)
5. Props (per sub-component)
6. Design Tokens (CSS custom properties table)
7. Best Practices (Do/Don't pairs)
8. Figma Mapping
9. Accessibility
10. Related Components

**Rule**: Tham khảo `component-docs-pattern.md` cho template code từng section.

---

### #21: Static example của overlay component render trigger thay vì face

**Sai**: Example card render `<Button>Open Dialog</Button>` → user thấy button, không thấy dialog content.

**Đúng**: Example card render mặt dialog trực tiếp với `pointer-events-none`:
```tsx
<Example title="Basic" code={`...`}>
  <div className="w-full border border-border rounded-xl bg-card p-xl shadow pointer-events-none">
    <h3>Are you sure?</h3>
    <p>This action cannot be undone.</p>
    <div className="flex justify-end gap-xs">
      <Button variant="outline">Cancel</Button>
      <Button>Continue</Button>
    </div>
  </div>
</Example>
```

**Rule**: Overlay components (Dialog, AlertDialog, Sheet, Drawer) → static example = dựng mặt content trực tiếp. Trigger button chỉ xuất hiện ở Interactive Demo section.

---

### #22: Sửa JSON spec nhưng quên update web app (hoặc ngược lại)

**Sai**: Cập nhật properties trong `figma-specs/components-08.json` nhưng web app `index.tsx` vẫn dùng controls cũ → 2 nơi không sync.

**Đúng**: Mỗi thay đổi component spec phải update ĐỒNG THỜI:
1. `figma-specs/components-*.json` (cho Figma plugin)
2. `sproux-saas-templates/src/pages/design-system/index.tsx` (cho web preview)

**Rule**: Sau mỗi spec change → search cả 2 files cho component name → update cả 2 → build cả 2.

---

## D. Design Token & Styling

### #23: Shadow naming — Figma ≠ Tailwind (off by one)

**Sai**: Figma "shadow-sm" → dùng Tailwind `shadow-sm`. Thực tế Figma names offset 1 level.

**Mapping đúng**:
- Figma `shadow-sm` → Tailwind `shadow` (DEFAULT)
- Figma `shadow-md` → Tailwind `shadow-md`
- Figma `shadow-lg` → Tailwind `shadow-lg`

**Rule**: Luôn compare CSS box-shadow values (px, spread, rgba) giữa Figma effect style và Tailwind output. Đừng trust name matching.

---

### #24: Spacing token ≠ pixel — luôn verify giá trị

**SprouX spacing scale**:
| Token | Value |
|-------|-------|
| `3xs` | 4px |
| `2xs` | 6px |
| `xs` | 8px |
| `sm` | 12px |
| `md` | 16px |
| `lg` | 20px |
| `xl` | 24px |
| `2xl` | 32px |
| `3xl` | 48px |

**Rule**: Token names KHÔNG intuitive — `2xs` nghe giống ~4px nhưng thực tế 6px. Luôn `grep` token value trong `index.css` trước khi dùng.

---

### #25: `bg-background` ≠ `bg-card` — semantic meaning khác nhau

- `--background` = page/app background (slate-50)
- `--card` = card/container background (white) — elevated surface
- `--card-subtle` = nested element inside card

**Rule**: Match Figma variable ID, không match bằng visual appearance. Cùng hex ≠ cùng token.

---

### #26: rgba tokens — light vs dark values hoàn toàn khác

**Sai**: Copy light mode rgba value cho dark mode.

**Đúng**: rgba tokens (outline-bg, outline-hover, ghost-hover) có **independent values per mode**. Không thể trace qua Variable Alias chains.

**Rule**: Verify BOTH light AND dark values cho mọi rgba token separately.

---

### #27: Tailwind v4 `@theme inline` — CSS vars NOT available at runtime

**Sai**: `style={{ backgroundColor: "var(--color-violet-500)" }}` → invisible. `@theme inline` compile at build time, không emit CSS custom properties.

**Đúng**: Dùng hardcoded hex cho inline styles. Semantic vars (không `inline`) như `var(--primary)` vẫn hoạt động.

---

### #28: Hardcoded hex trong className — luôn dùng tokens

**Sai**: `<span className="bg-[#eff6ff] text-[#2563eb]">` thay vì `<Badge variant="emphasis">`.

**Rule**: Search `#[0-9a-fA-F]{6}` trong className → bất kỳ hex nào = code smell. Dùng component instances hoặc token-based classes.

---

### #34: Hardcoded color scale names trong className — dùng semantic tokens

**Sai**: Dùng color scale cụ thể thay vì semantic tokens.

```tsx
// SAI — scale names hard-link vào color palette, không rebrandable
<div className="bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400" />
<Star className="text-amber-500" />
<div className="bg-violet-600/[0.03] blur-[200px]" />  // ambient orb

// ĐÚNG — semantic tokens, work cho bất kỳ brand color nào
<div className="bg-primary/10 dark:bg-primary/20 text-primary" />
<Star className="text-warning" />
<div className="bg-primary/[0.03] blur-[200px]" />  // ambient orb
```

**Mapping phổ biến**:
| Scale name | Semantic token |
|-----------|---------------|
| `text-violet-600 dark:text-violet-400` | `text-primary` |
| `bg-violet-500/10 dark:bg-violet-500/20` | `bg-primary/10 dark:bg-primary/20` |
| `text-amber-500` / `text-amber-600` | `text-warning` |
| `bg-amber-*/10` | `bg-warning-subtle` |
| `text-emerald-600` | `text-success` |
| `text-red-600` | `text-destructive` |

**Ngoại lệ hợp lệ**: Data visualization category colors khi KHÔNG có semantic token tương ứng (e.g., `text-cyan-600` cho category "fashion", `text-rose-600` cho "sports"). Recharts chart components dùng hex cho `stroke`/`fill` props. `indigo-*` orbs trong glassmorphism decoration để tạo color variety.

**Grep để audit**: `grep -rn 'className.*\(text\|bg\|border\)-\(violet\|amber\|zinc\)-[0-9]' src/ --exclude-dir="components/ui" --exclude-dir="components/charts"`

---

### #35: `typo-*` prefix trong product pages — phải dùng `sp-*`

**Vấn đề**: `typo-*` là CSS class system nội bộ của SprouX (`components/ui/` internals). Khi fork SprouX vào product, `typo-*` classes tồn tại bên trong `src/components/ui/` — điều này ĐÚNG và không cần sửa. Nhưng nếu dùng `typo-*` trong product pages/layouts/components thì SAI.

```tsx
// SAI — typo-* không phải product typography tokens
<span className="typo-paragraph-sm-bold">S</span>
<span className="typo-paragraph-reg-semibold">ShopPulse</span>

// ĐÚNG — dùng sp-* (product prefix cho ShopPulse)
<span className="sp-body font-semibold">S</span>
<span className="sp-body-semibold">ShopPulse</span>
```

**Rule**: `typo-*` chỉ xuất hiện trong `src/components/ui/`. Product pages (`src/pages/`), layouts (`src/components/layout/`), custom components → luôn dùng `sp-*`.

**Grep để detect**: `grep -rn "typo-" src/ --include="*.tsx" --exclude-dir="components/ui"`

---

### #36: Plugin `gap` PHẢI là string để bind spacing variable token

**Sai**: `"gap": 8` (number) → plugin hardcode pixel, không bind variable token.

**Đúng**: `"gap": "xs"` (string) → plugin gọi `bindFloat(comp, "itemSpacing", "spacing/xs", ...)`.

**Rule**: MỌI spacing value trong `base` / `variantStyles` JSON spec phải là **string token name** (e.g., `"xs"`, `"sm"`, `"md"`), KHÔNG phải number. Chỉ dùng number khi không có token tương ứng.

---

### #37: Plugin Input-type component — cần `primaryAlign` và `labelFill`

**Vấn đề**: Plugin mặc định hardcode `primaryAxisAlignItems = "CENTER"` → Input component trông như Button (text canh giữa).

**Fix đã áp dụng** trong `plugins/Generate SaaS Template/code.js`:
```js
// primaryAlign: "start" → MIN (text left-aligned)
var _primaryAlign = merged.primaryAlign || "CENTER";
comp.primaryAxisAlignItems = _primaryAlign === "start" ? "MIN" : ...

// labelFill: true → text label FILL width (chiếm hết không gian còn lại)
if (merged.labelFill) { lbl.layoutSizingHorizontal = "FILL"; }
```

**Rule**: Tất cả input-type components (Input, Textarea, Select trigger...) trong JSON spec PHẢI có:
```json
"base": {
  "primaryAlign": "start",
  "labelFill": true,
  ...
}
```

---

### #38: Web Explore Behavior — Value property cho input-type form components

**Quy tắc**: Tất cả component dạng nhập liệu phải có "Value" control trong Explore Behavior:
- **Input, Textarea**: `options: ["placeholder","filled","empty"]`
- **Select, Combobox**: `options: ["placeholder","filled"]`
- **InputOTP**: `options: ["empty","partial","filled"]`

**Bug quan trọng — `key` reset trick**: Khi chuyển từ `filled` về `empty`/`placeholder`, React không reset DOM input value vì component vẫn mount. Fix bắt buộc: thêm `key={val}` để force remount.

```tsx
// ✅ ĐÚNG — key buộc remount khi val thay đổi
<Input key={val} placeholder={placeholderProp} {...valueProp} />
<Textarea key={val} placeholder={taPlaceholder} {...taValueProp} />

// ❌ SAI — DOM giữ nguyên filled text dù val đổi về "empty"
<Input placeholder={placeholderProp} {...valueProp} />
```

**Select controlled pattern**:
```tsx
const [selectVal, setSelectVal] = useState<string | undefined>(undefined)
const handleValMode = (mode: string) => { setValMode(mode); setSelectVal(mode === "filled" ? "a" : undefined) }
// value={undefined} = uncontrolled (placeholder), value="a" = filled
<Select value={selectVal} onValueChange={setSelectVal}>
```

---

## D3. Plugin — Upsert & Rendering

### #39: Plugin upsert mode — ComponentSet tìm theo tên, update in-place

**Cơ chế**: Plugin tự detect xem `ComponentSet` với cùng tên đã tồn tại trên page chưa:
- **Tìm thấy** → upsert in-place: variant khớp tên → clear children + restyle; variant mới → `appendChild`; variant xóa → `.remove()`. Showcase cũ bị xóa → tạo lại đúng vị trí cũ.
- **Không tìm thấy** → tạo mới bình thường.

**Lợi ích**: Instance trên các page khác KHÔNG bị phá vì ComponentSet vẫn giữ nguyên ID.

**Showcase naming convention** (quan trọng cho detection):
```
ComponentSet name: "Input"              (type: COMPONENT_SET)
Showcase frame name: "Input — Showcase" (type: FRAME)
```

**Rule**: Showcase frame luôn có suffix ` — Showcase` (em dash). Plugin detect showcase qua `name.indexOf(" — Showcase") >= 0`.

---

### #40: Plugin labelFill + text truncation — 3 props bắt buộc dùng cùng nhau

**Vấn đề**: `labelFill: true` cho `layoutSizingHorizontal = "FILL"` nhưng text vẫn wrap xuống dòng khi content quá dài (xảy ra với Input filled value như `"name@example.com"`).

**Fix bắt buộc** — 3 props phải set cùng lúc khi `labelFill: true`:
```js
lbl.layoutSizingHorizontal = "FILL";
lbl.textAutoResize = "TRUNCATE";   // prevent wrap, resize to container
lbl.maxLines = 1;                  // hard limit 1 line
lbl.textTruncation = "ENDING";    // show … at end (API v1.0+)
```

**Rule**: Mọi input-type component với `labelFill: true` → plugin PHẢI set cả 4 properties trên text label node.

---

### #41: JSON spec examples — KHÔNG dùng `"fill": true` cho input-type components

**Sai**: `{ "props": {...}, "label": "Default", "fill": true }` → instance stretch full width của showcase container (~1200px) → trông như full-width form field, không giống web DS.

**Đúng**: Bỏ `"fill": true` → instance render đúng fixed width từ `base.width` (240px Default, 280px LG, v.v.).

**Rule**: `"fill": true` chỉ dùng cho component cần stretch full-width theo thiết kế (e.g., full-width form, card content area). Input, Select, Combobox, Textarea — **không dùng** `"fill": true` trong examples.

---

### #68: Upsert — Figma tự rename variant khi move ra khỏi ComponentSet

**Sai**: Upsert path move existing variants từ CS ra page level bằng `targetPage.appendChild(variant)` → rồi gọi `combineAsVariants()`. Figma tự đổi tên variant từ `Property=Value` thành `CSName/Value` (VD: `Items=3` → `Navigation Menu/3`). `combineAsVariants()` nhận mixed naming format → tạo rogue properties ("Property 1", "Property 2") thay vì property đúng.

**Đúng**: Save original variant names TRƯỚC khi move, restore SAU khi move:
```js
// Save names BEFORE moving
var _origNames = {};
for (var i = 0; i < vars.length; i++) _origNames[vars[i].id] = vars[i].name;
for (var i = 0; i < vars.length; i++) targetPage.appendChild(vars[i]);
// Restore names AFTER moving (Figma renamed them)
for (var i = 0; i < vars.length; i++) vars[i].name = _origNames[vars[i].id];
```

**Rule**: Bất cứ khi nào move variant ra khỏi ComponentSet → PHẢI save/restore tên. Đây là behavior cố hữu của Figma API, không thể tắt.

---

## D4. Plugin — Instance Sizing & Performance

### #42: Instance sizing trong showcase — bắt buộc set FIXED sau appendChild

**Vấn đề**: Khi `_makeExCard` / `_makeFrame` tạo container với `layoutSizingHorizontal = "FILL"`, Figma tự động set children thành FILL khi append → instances stretch toàn bộ card width (~1200px) thay vì giữ `base.width`.

**Fix bắt buộc** trong `_getInstanceWithLabel` sau `parent.appendChild(inst)`:
```js
parent.appendChild(inst);
try { inst.layoutSizingHorizontal = "FIXED"; inst.layoutSizingVertical = "FIXED"; } catch(e) {}
```

Và trong vòng lặp custom examples:
```js
if (_er.fill) { inst.layoutSizingHorizontal = "FILL"; }
else { inst.layoutSizingHorizontal = "FIXED"; inst.layoutSizingVertical = "FIXED"; }
```

**Rule**: Sau `parent.appendChild(inst)`, LUÔN set lại `layoutSizingHorizontal = "FIXED"` trừ khi `fill: true` được chỉ định rõ ràng trong JSON spec example.

---

### #43: JSON spec `base.width` phải match web CSS max-width

**Sai**: `"base": { "width": 240 }` → Figma hiển thị 240px nhưng web DS dùng `max-w-xs` (320px) → showcase không representative.

**Đúng**: Đo CSS width thực tế trên web → set `base.width` tương ứng.

| Component | Web CSS | Figma `base.width` |
|-----------|---------|-------------------|
| Input | `max-w-xs` = 320px | 320 |
| Select | `max-w-xs` = 320px | 320 |
| Textarea | `max-w-xs` = 320px | 320 |

**Rule**: Trước khi tạo/update JSON spec cho form input components, verify `max-w-*` class trong web DS → set `base.width` khớp chính xác.

---

### #44: Plugin performance — 5 caching + parallelization patterns bắt buộc

**Vấn đề**: Không có cache → plugin chạy chậm do:
1. `loadFontAsync` gọi 600+ lần cho cùng font (mỗi variant × mỗi text node)
2. `buildVariantMap` rebuild 24+ lần cho cùng ComponentSet (5,760 iterations mỗi lần)
3. `findIconComponent` scan toàn bộ page tree cho mỗi icon lookup
4. Font preloading sequential (85 awaits tuần tự)
5. Example instance creation sequential

**5 patterns đã implement trong `code.js`**:

```js
// 1. Font dedup cache
var _loadedFontsSet = {};
async function _loadFont(family, style) {
  var key = family + "|" + style;
  if (_loadedFontsSet[key]) return;
  try { await figma.loadFontAsync({ family, style }); _loadedFontsSet[key] = true; } catch(e) {}
}

// 2. Variant map cache (keyed by componentSet.id)
var _variantMapCache = {};
function buildVariantMap(componentSet) {
  if (_variantMapCache[componentSet.id]) return _variantMapCache[componentSet.id];
  // ... build map ...
  _variantMapCache[componentSet.id] = map;
  return map;
}

// 3. Icon component cache
var _iconCache = {};
function findIconComponent(iconName) {
  if (_iconCache[iconName] !== undefined) return _iconCache[iconName];
  // ... find ...
  _iconCache[iconName] = found || null;
  return _iconCache[iconName];
}

// 4. Parallel font preload
await Promise.all(fonts.map(function(f) { return loadFontSafe(f[0], f[1]); }));

// 5. Parallel example instance creation
var tasks = exItems.map(function(exItem) { return (async function() { ... })(); });
var results = await Promise.all(tasks);
```

**Rule**: Reset ALL caches trong `loadCaches()` khi bắt đầu mỗi plugin run (`_loadedFontsSet = {}; _variantMapCache = {}; _iconCache = {};`).

---

## D5. Plugin — Variable Binding

### #45: `setBoundVariableForPaint()` drops paint.opacity — phải set SAU khi bind

**Sai**: Set `opacity` trên paint object TRƯỚC khi gọi `setBoundVariableForPaint()`:
```js
var paint = { type: "SOLID", color: { r: 0, g: 0, b: 0 } };
paint.opacity = 0.2;  // ← bị drop!
return figma.variables.setBoundVariableForPaint(paint, "color", variable);
```
→ Kết quả: opacity = 1.0 (100%), fill hiển thị solid thay vì 20%.

**Đúng**: Set `opacity` SAU khi `setBoundVariableForPaint()` trả về:
```js
var paint = figma.variables.setBoundVariableForPaint(
  { type: "SOLID", color: { r: 0, g: 0, b: 0 } },
  "color",
  variable
);
paint.opacity = 0.2;  // ← giữ được!
return paint;
```

**Ảnh hưởng**: Tất cả nơi dùng `setFillWithOpacity()`:
- Explore Behavior: preview (`muted/0.2`), controls (`muted/0.1`)
- Tables: header rows (`muted/0.5`), separators (`border/0.5`)
- Example cards: headers (`muted/0.5`)
- Related components: separators (`border/0.5`)

**Rule**: Trong `makeBoundPaint()`, LUÔN gọi `setBoundVariableForPaint()` trước → set `paint.opacity` trên kết quả trả về.

---

### #46: `setExplicitVariableModeForCollection()` nhận collectionId string, không phải object

**Sai**: Truyền VariableCollection object:
```js
main.setExplicitVariableModeForCollection(_semCol, _darkMode.modeId);
```
→ Silent fail trong try/catch → showcase render ở Light mode (default).

**Đúng**: Truyền collection `.id`:
```js
main.setExplicitVariableModeForCollection(_semCol.id, _darkMode.modeId);
```

**Rule**: Figma Plugin API `setExplicitVariableModeForCollection(collectionId: string, modeId: string)` — luôn dùng `.id` cho cả collection và mode.

---

### #47: JSON properties phải match 100% web ExploreBehavior controls

**Sai**: Checkbox JSON có `State: ["Default","Hover","Focus","Error","Disabled"]` — 5 values.
Web CheckboxDocs chỉ có 4: `["default","hover","focus","disabled"]` — KHÔNG có "error".

**Đúng**: Mở `design-system/index.tsx`, tìm `{Component}Docs()` function, đọc `<ExploreBehavior controls={[...]}>`
→ copy chính xác options vào `properties`.

**Rule**: TRƯỚC khi viết/update bất kỳ component JSON nào, ĐỌC web source code để verify controls. Không thêm state/variant mà web không có.

---

### #48: Compound components cần indicator pattern, không phải hideLabel

**Sai**: Checkbox JSON dùng `hideLabel: true` + `width: 16, height: 16` → tạo ra khung 16x16 không có label.
Web ExploreBehavior hiện checkbox + label text cạnh nhau.

**Đúng**: Dùng `base.indicator: { width: 16, height: 16, radius: "sm" }` → plugin tạo:
- Comp frame = transparent HUG wrapper (gap = "xs")
- Indicator child = 16x16 frame với fill/stroke/radius
- Icons vào indicator, Label vào comp sau indicator
- `iconFill` cho màu icon trong indicator (khác `textFill` cho label)
- `opacity` trên comp (ảnh hưởng toàn bộ row cho disabled)

**Rule**: Checkbox/Switch/Radio LUÔN dùng `indicator` pattern. Không bao giờ `hideLabel: true` cho compound components.

---

## D6. Plugin — Image & clipsContent

### #49: Image URL trong plugin PHẢI là direct URL — không redirect

**Sai**: `"imageUrl": "https://github.com/shadcn.png"` → URL redirect tới `avatars.githubusercontent.com` → Figma plugin sandbox block cross-domain redirect → `Failed to fetch`.

**Đúng**: Dùng URL trực tiếp: `"imageUrl": "https://avatars.githubusercontent.com/u/124599?v=4"`.

**Rule**: Tất cả `imageUrl` trong component JSON spec PHẢI dùng URL cuối cùng (final destination), không qua redirect. Test bằng `curl -I <url>` — nếu thấy `302`/`301` → tìm URL trực tiếp.

**Manifest**: Domain phải có trong `manifest.json` → `networkAccess.allowedDomains` (với `https://` prefix).

---

### #50: `clipsContent` phải set trong JSON spec — plugin không hardcode

**Sai**: Tạo Avatar component có `radius: "full"` + `imageUrl` → ảnh tràn ra ngoài hình tròn vì `clipsContent = false` (default).

**Đúng**: Thêm `"clipsContent": true` vào `base` → plugin đọc `!!merged.clipsContent` → clip content theo frame shape.

**Rule**: Components có rounded shape + content fill (Avatar, rounded card with image) PHẢI có `"clipsContent": true` trong `base`.

---

### #51: Plugin image pre-fetch — UI fetch trước, embed vào spec, plugin apply

**Flow**:
1. UI `collectImageUrls(spec)` → tìm recursive tất cả `imageUrl` fields trong JSON spec
2. UI `prefetchImages(spec)` → fetch all URLs → embed byte arrays vào `spec._imageData`
3. Plugin nhận spec → extract `_imageData` vào `_prefetchedImages` cache
4. Plugin `getImageHash(url)` → tìm bytes từ `_prefetchedImages` → `figma.createImage()` → set IMAGE fill

**Lưu ý**: Pre-fetch PHẢI có ở CẢ Foundation tab VÀ Generate UI tab trong `ui.html`. Foundation tab dùng cho component JSON files.

---

## D7. Plugin — Ellipse Rendering

### #52: `layoutPositioning = "ABSOLUTE"` yêu cầu appendChild TRƯỚC

**Sai**: Tạo ellipse → set `layoutPositioning = "ABSOLUTE"` → rồi mới `comp.appendChild(ellipse)`.
→ Error: `in set_layoutPositioning: Can only set layoutPositioning = ABSOLUTE if the parent node has layoutMode !== NONE`

**Đúng**: `comp.appendChild(ellipse)` TRƯỚC → rồi mới set `ellipse.layoutPositioning = "ABSOLUTE"`.

**Rule**: Bất kỳ node nào cần `layoutPositioning = "ABSOLUTE"` phải được append vào parent (có `layoutMode !== NONE`) TRƯỚC khi set property này.

---

### #53: Cleanup whitelist phải include ellipse names — nếu không ellipses bị xóa

**Sai**: Plugin cleanup loop xóa tất cả children không nằm trong `_validTF` whitelist. Với `hideLabel: true` và không có icons → whitelist rỗng → ellipses vừa tạo bị xóa → variant rỗng.

**Đúng**: Thêm block kiểm tra `merged.ellipses` vào cleanup section:
```js
if (merged.ellipses && Array.isArray(merged.ellipses)) {
  for (var _vei2 = 0; _vei2 < merged.ellipses.length; _vei2++)
    _validTF[merged.ellipses[_vei2].name || ("Ellipse" + _vei2)] = true;
}
```

**Rule**: Khi thêm child type mới (ellipse, line, polygon...) vào plugin, PHẢI thêm vào `_validTF` whitelist trong cleanup section. Nếu không → cleanup xóa chúng ngay sau khi tạo.

---

### #54: Element opacity vs fillOpacity — phải dùng element opacity cho match React CSS

**Sai**: Spinner JSON dùng `fillOpacity: 0.25` trên paint object → Figma paint-level opacity khác visual so với React CSS `opacity-25` (element-level).

**Đúng**: Dùng `opacity: 0.25` → plugin set `ellipse.opacity = 0.25` (element-level opacity) → match chính xác React CSS `opacity-25`.

**Mapping**:
| React CSS | Figma JSON | Plugin code |
|-----------|-----------|-------------|
| `opacity-25` | `"opacity": 0.25` | `ellipse.opacity = 0.25` |
| `opacity-75` | `"opacity": 0.75` | `ellipse.opacity = 0.75` |

**Rule**: Khi convert React CSS opacity classes sang Figma → luôn dùng element-level `opacity`, KHÔNG dùng paint-level `fillOpacity`. Hai loại cho visual khác nhau.

---

## D8. Plugin — Variable Scopes

### #55: Variable scope phải match cách sử dụng trong component JSON

**Sai**: Variable `border` có scope `["STROKE_COLOR"]` → component JSON dùng `fill: "border"` → plugin gọi `setBoundVariableForPaint()` nhưng Figma không hiện binding vì scope không cho phép fill.

**Đúng**: Variable `border` có scope `["STROKE_COLOR", "FRAME_FILL", "SHAPE_FILL"]` → cho phép dùng cả làm stroke lẫn fill.

**Affected variables đã fix**:
| Variable | Old scope | New scope | Lý do |
|----------|-----------|-----------|-------|
| `border` | `STROKE_COLOR` | `STROKE_COLOR, FRAME_FILL, SHAPE_FILL` | `bg-border` dùng trong Separator, Switch |
| `outline` | `STROKE_COLOR` | `STROKE_COLOR, FRAME_FILL, SHAPE_FILL` | `fill: "outline"` trong Button Outline |
| `outline-hover` | `STROKE_COLOR` | `STROKE_COLOR, FRAME_FILL, SHAPE_FILL` | `fill: "outline-hover"` trong Button Outline Hover |

**Rule**: Khi tạo component JSON với `fill: "tokenName"`, PHẢI verify variable đó có scope `FRAME_FILL` hoặc `ALL_FILLS`. Nếu chỉ có `STROKE_COLOR` → Figma không bind được vào fill → component xuất hiện raw color thay vì variable.

### #56: paddingX/paddingY/gap PHẢI dùng string token — KHÔNG raw number (trừ 0)

**Sai**: `"paddingX": 4, "paddingY": 4` → plugin set pixel value nhưng KHÔNG bind `spacing/*` variable → Figma hiện raw 4px thay vì token.

**Đúng**: `"paddingX": "3xs", "paddingY": "3xs"` → plugin gọi `bindFloat()` gắn `spacing/3xs` variable.

**Spacing token map**:
| Token | Pixels |
|-------|--------|
| `"3xs"` | 4 |
| `"2xs"` | 6 |
| `"xs"` | 8 |
| `"sm"` | 12 |
| `"md"` | 16 |
| `"lg"` | 20 |
| `"xl"` | 24 |
| `"2xl"` | 32 |
| `"3xl"` | 40 |

**Exceptions**: Raw number `1` cho special cases không có token (e.g. Switch indicator `p-[1px]`). Number `0` giờ được plugin auto-bind `spacing/none` (safety net #87), nhưng string `"none"` vẫn preferred.

**Plugin code** (line ~2724): `if (typeof pxR === "string")` → bind variable. `else` → set pixel + auto-bind `spacing/none` nếu value = 0. Áp dụng cho cả base padding VÀ children frame padding/gap.

---

### #57: Border radius PHẢI dùng string token — KHÔNG raw number

**Sai**: `"radius": 9999` hoặc `"radius": 16` → plugin set pixel value nhưng KHÔNG bind `border radius/*` variable → Figma hiện raw px, không gắn token.

**Đúng**: `"radius": "full"` hoặc `"radius": "lg"` → plugin gọi `bindFloat()` gắn `border radius/full` variable lên cả 4 corner.

**Border radius token map**:
| Token | Pixels |
|-------|--------|
| `"3xs"` | 2 |
| `"2xs"` | 4 |
| `"xs"` | 6 |
| `"sm"` | 8 |
| `"md"` | 10 |
| `"lg"` | 12 |
| `"xl"` | 16 |
| `"2xl"` | 20 |
| `"3xl"` | 24 |
| `"full"` | 9999 |

---

### #58: Group+Item tab — item state PHẢI sync vào group preview

**Sai**: Tab 2 (Item) có State/Type controls riêng, nhưng item trong Tab 1 (Group) hardcode giá trị — khi đổi state ở Tab 2, item trong Tab 1 không update.

**Đúng**: Tab 2 item state vars PHẢI được áp dụng vào MỘT item tương ứng trong Tab 1 group. VD: Dropdown Tab 2 đổi `ddItemState="hover"` → item đầu tiên trong Dropdown group Tab 1 cũng hiển thị hover.

**Rule**:
- Tab 1 controls = chỉ group-level settings (Show Icons, Compact, Viewport...)
- Tab 2 controls = item-level settings (Type, State, toggles)
- KHÔNG duplicate item-level controls ở Tab 1
- Single source of truth cho item state ở Tab 2

**Ngoại lệ — Calendar/DatePicker**: Day Cell state ở Tab 2 KHÔNG sync vào Tab 1. Thay vào đó, dùng `CalendarDayButton` override `DayButton` component của react-day-picker qua `components` prop. Day Cell instance được đưa vào Calendar dưới dạng component override, tương tác bình thường (click, hover, selected...). DatePicker Tab 1 dùng component gốc `<DatePicker />` / `<DateRangePicker />`.

### #59: Breadcrumb Item Tab 2 — chỉ show 1 item duy nhất

**Sai**: Breadcrumb Item preview trong Tab 2 show "Home" + separator + controlled item → 2 items trên canvas.

**Đúng**: Tab 2 chỉ show 1 item duy nhất. Wrap trong `BreadcrumbList` để inherit `text-muted-foreground`, nhưng không thêm item khác.

**Lưu ý**: Type "current" vẫn có State control nhưng chỉ hiện pill "default" (không có hover). Khi switch từ "link" sang "current" → auto reset state về "default".

### #60: tailwind-merge KHÔNG override custom spacing tokens

**Sai**: `cn("p-sm", "p-0")` → output `p-sm p-0` — CẢ HAI đều apply, tailwind-merge không nhận `p-sm` là padding conflict với `p-0`.

**Đúng**: Dùng Tailwind standard value thay vì custom token khi component cần cho phép override. VD: PopoverContent base dùng `p-3` (12px) thay vì `p-sm` → `cn("p-3", "p-0")` = `p-0` override đúng.

**Áp dụng cho**: Mọi base component có default padding mà consumer có thể override qua className — Popover, Dialog, Sheet, Drawer, Card, etc.

### #61: React named imports — KHÔNG dùng `React.` namespace khi chưa import

**Sai**: `import { useState } from "react"` rồi dùng `React.useMemo(...)`, `React.ReactNode` → runtime crash (React is not defined).

**Đúng**: Import đầy đủ named exports: `import { useState, useMemo, type ReactNode } from "react"` rồi dùng trực tiếp `useMemo(...)`, `ReactNode`.

---

### #62: Context-dependent sub-items cần Mock component cho Group+Item tab

**Sai**: Dùng real `InputOTPSlot` trong Tab 1/Tab 2 → fail vì cần `OTPInputContext` từ parent `InputOTP`. Hoặc dùng real `InputOTP` trong Tab 1 nhưng không thể sync individual slot state.

**Đúng**: Tạo shared mock component (`OTPSlotMock`) replicate exact CSS styles của real component. Dùng mock cho CẢ Tab 1 group (array of mocks) VÀ Tab 2 item (single mock). Synced slot trong Tab 1 dùng Tab 2's state.

**Rule**: Khi sub-item phụ thuộc parent context (React Context, internal state) → tạo mock visual component dùng chung 2 tab. Mock PHẢI match 100% CSS của real component.

---

### #63: Group sub-items có Position property khi border/radius phụ thuộc vị trí

---

### #64: Sub-component JSON gộp chung file với parent khi cùng 1 Docs page

**Sai**: Tạo `otp-slot.json` riêng rồi `input-otp.json` riêng → 2 file cho 1 mục menu sidebar.

**Đúng**: Gộp vào `input-otp.json` với `"components": [OTP Slot, Input OTP]`. Item ở index 0 (plugin tạo trước).

**Rule**: Khi sub-component thuộc cùng 1 `*Docs()` page → gộp chung 1 file JSON. Chỉ tách file riêng khi sub-component dùng cho NHIỀU parent khác nhau (VD: `day-cell.json` dùng cho Calendar + DatePicker).

---

**Sai**: Render OTP Slot trong Tab 2 với `rounded-md border` full → không match thực tế (slot ở giữa không có left border, không rounded).

**Đúng**: Thêm **Position** property (`first | middle | last`) — mỗi vị trí có border/radius khác nhau. Position cũng xác định synced index trong Tab 1 group.

**Rule**: Khi sub-item styling thay đổi theo vị trí trong group (first/middle/last) → PHẢI có Position property trong Tab 2 controls.

### #65: heightMode "fixed" bị override khi có children

**Sai**: Plugin code `var _useHugV = merged.heightMode === "hug" || (!!(merged.children && merged.children.length > 0))` → component có children luôn bị HUG height, bỏ qua `heightMode: "fixed"`.

**Đúng**: `var _useHugV = merged.heightMode === "hug" || (merged.heightMode !== "fixed" && !!(merged.children && merged.children.length > 0))` → chỉ HUG khi KHÔNG explicitly set "fixed".

**Rule**: Khi component cần fixed size nhưng có children (VD: OTP Slot 48x48 với Digit/Caret children) → PHẢI set `"heightMode": "fixed"` trong JSON. Plugin phải respect explicit "fixed" override.

### #66: Component JSON PHẢI verify từng CSS property trên web trước khi viết

**Sai**: Viết JSON spec dựa trên "cảm giác" hoặc đoán — VD: OTP Slot không có border (borderless frame), Group có outer border + separator frames.

**Đúng**: Đọc kỹ TỪNG dòng CSS trong `src/components/ui/*.tsx` + `OTPSlotMock` trong design system page. Map 1:1:
- Web `border-y border-r border-border-strong` → `"stroke": "border-strong", "strokeSides": "top,right,bottom"`
- Web `first:border-l` → Position=First `"strokeSides": "all"`
- Web `flex items-center` (no border) → Group wrapper KHÔNG có stroke/radius
- Web `ring-[3px] ring-ring` → `"focusRing": "ring"`
- Web `size-3xl` → `"width": 48, "height": 48, "widthMode": "fixed", "heightMode": "fixed"`

**Rule**: LUÔN mở file React component + design system page, đọc từng className, rồi convert sang JSON. KHÔNG bao giờ đoán. Mỗi CSS property phải có mapping tương ứng trong JSON.

---

### #67: Effect styles trên Figma phải match web React 100%

**Sai**: Tạo component Figma nhưng quên gắn effect style (focus ring, shadow) → component trông flat, thiếu depth và interactive feedback so với web.

**Đúng**: Kiểm tra MỌI effect CSS trên web component và map sang Figma effect tương ứng:
- Web `ring-[3px] ring-ring` (focus state) → `"focusRing": "ring"` (DROP_SHADOW, blur=0, spread=3)
- Web `ring-[3px] ring-ring/50` → `"focusRing": "ring"` + `"focusRingSpread": 2` (nếu spread khác 3)
- Web `shadow-sm` / `shadow-md` / `shadow-lg` → `"effectStyleName": "Shadows/sm"` (hoặc md, lg)
- Web `animate-caret-blink` → hiện tại không map sang Figma (animation không hỗ trợ), nhưng caret node vẫn phải tồn tại với đúng size/color

**Checklist khi tạo component JSON**:
1. Mở React component file → tìm TẤT CẢ `ring-*`, `shadow-*`, `outline-*` classes
2. Mở design system page → check interactive states (hover, focus, active, disabled)
3. Map từng effect vào JSON property tương ứng
4. Verify sau khi generate: so sánh Figma output với web component side-by-side

**Rule**: Component Figma THIẾU effect style = component SAI. Effect styles (focus ring, shadows, elevation) là phần KHÔNG THỂ THIẾU của visual fidelity.

---

## D9. Plugin — Variant Restrictions

### #69: variantRestrictions — KHÔNG hide property controls, restrict values thay thế

**Sai**: Web DS page ẩn hoàn toàn property control khi variant không cần nó (VD: ẩn State khi Type=Ellipsis, ẩn Active khi Type=Previous). Plugin tạo cross product đầy đủ → Figma có variants không cần thiết.

**Đúng**: Figma ComponentSet rule — TẤT CẢ variants PHẢI có TẤT CẢ properties với ≥1 value. Properties KHÔNG BAO GIỜ bị ẩn — chỉ restrict values:
- **JSON**: Thêm `"variantRestrictions": { "Type=Ellipsis": { "State": ["Default"], "Active": ["False"] } }` → plugin filter cross product
- **Web DS pill buttons**: Show restricted option list — `(type === "ellipsis" ? ["default"] : allStates).map(...)`
- **Web DS Switch/toggle**: Show but `disabled` — `<Switch disabled={type !== "page"} />`
- **Reset on change**: `if (type === "ellipsis") setState("default")` khi Type thay đổi

**Anti-pattern — conditional spread ẩn control**:
```tsx
// ❌ SAI — ẩn hoàn toàn Level khi Type≠badge
...(isBadge ? [{ label: "Level", options: ["primary","secondary"] }] : []),

// ✅ ĐÚNG — luôn show Level, restrict values theo Type
{ label: "Level", options: isBadge ? ["primary","secondary"] : ["primary"] },
```

**Rule**: Khi 1 property value restrict values của property khác → dùng `variantRestrictions` trong JSON + restrict (KHÔNG hide) controls trên web DS. KHÔNG BAO GIỜ dùng conditional spread (`...( ? [] : [])`) để ẩn control — luôn render control với restricted options. Áp dụng cho: Pagination Item, Breadcrumb Item, Badge (Type→Level, Type→Variant), và bất kỳ component nào có conditional property validity.

---

## E. Workflow & Process

### #29: Luôn `pnpm build` / `tsc --noEmit` sau mỗi thay đổi

**Sai**: Viết xong 3-4 files rồi mới build → gặp lỗi cascade, khó trace.

**Đúng**: Mỗi logical change → build ngay. Đặc biệt sau full file rewrite.

**Rule**: `pnpm build` FIRST, fix errors FIRST, rồi mới move on.

---

### #30: Unused imports sau full page rewrite

**Sai**: Import 10 icons "phòng hờ" → cuối cùng chỉ dùng 6 → build fail vì 4 unused.

**Rule**: Sau ANY full file rewrite → `tsc --noEmit` → fix unused imports TRƯỚC khi làm gì khác. Đặc biệt phổ biến với lucide-react icons.

---

### #31: Commit message format cho tn products

**Format**: `feat({product-id}/{area}): description`

**Ví dụ**:
- `feat(001/figma-specs): add overlay component specs`
- `fix(001/web): add Explore Behavior to AlertDialog docs`
- `feat(plugin): fix _buildShowcase crash on empty properties`

**Rule**: Luôn prefix product ID (`001`, `002`...) và area (`figma-specs`, `web`, `design-system`).

---

### #32: Đọc component bên SprouX trước khi viết cho tn product

**Sai**: Viết component docs từ đầu → thiếu sections, chất lượng kém, phải sửa nhiều lần.

**Đúng**: Đọc SprouX reference (`SprouX_uiux/src/App.tsx`) TRƯỚC → note đủ sections + controls → rồi mới viết.

**Rule**: Workflow chuẩn:
1. Đọc SprouX component (Gemini CLI)
2. Đọc `component-docs-pattern.md`
3. Viết component docs
4. Build + verify
5. So sánh visual với SprouX

---

### #33: Auto-update ĐỒNG THỜI khi thay đổi process

**Sai**: Thêm rule mới vào pattern nhưng quên update `common-mistakes.md`, `STATUS.md`, hoặc ngược lại.

**Đúng**: Khi thay đổi process/convention/pattern → tự động update TẤT CẢ files liên quan:
- `tn/common-mistakes.md` (file này)
- `tn/products/*/component-docs-pattern.md`
- `tn/products/*/STATUS.md`
- `tn/_pipeline/process.md` (nếu thay đổi workflow)

**Rule**: KHÔNG chờ user yêu cầu. Tự động update ngay khi thay đổi hoàn thành.

---

### #34: iconFill fallback — icon đổi màu theo textFill

**Sai**: Omit `iconFill` trong component JSON base → plugin resolve `merged.iconFill || merged.textFill || "foreground"`. Khi `Value=Filled` đổi `textFill` thành `"foreground"`, icon cũng đổi theo.

**Đúng**: Luôn set `"iconFill": "muted-foreground"` trong base cho form components (Input, Select, Combobox, Textarea) nơi icon luôn giữ màu muted bất kể input value.

**Rule**: Nếu icon color cố định trên web (`text-muted-foreground`) → PHẢI explicit set `iconFill` trong JSON, không dựa vào fallback.

---

### #35: gap "xs" cho form components có icon/prefix/suffix

**Sai**: Set `"gap": 0` cho Input/Select vì web dùng absolute positioning cho icon. Kết quả: icon và label dính nhau trên Figma.

**Đúng**: Figma dùng autolayout (không absolute) → cần `"gap": "xs"` (8px). Tính: 12px(paddingX) + 16px(icon) + 8px(gap) = 36px = web `pl-9`.

**Rule**: Form components có icon decoration → `"gap": "xs"`. Chỉ dùng `"gap": 0` cho components thực sự KHÔNG có spacing giữa children.

---

### #70: Filter values không applicable — breadcrumb pattern (KHÔNG ẩn cả property)

**Sai 1**: Hiện tất cả values khi không applicable → user bấm "Right" khi Type=Checkbox nhưng không thấy thay đổi gì.
**Sai 2**: Ẩn cả property control (Alignment) khi Type=Checkbox → variant thiếu property, không match Figma.

**Đúng**: Property control LUÔN hiện, nhưng **filter values** không applicable. Reset về default khi switch. VD:
- Cell Row: Type=Checkbox → Alignment chỉ show ["Left"] (hide "Right"), Weight chỉ show ["Regular"] (hide "Medium")
- Cell Header: Type=Checkbox → Alignment chỉ show ["Left"] (hide "Right")
- Breadcrumb Item: Type=Current → State chỉ show ["Default"] (hide "Hover")

**Code pattern**: `{(type === "checkbox" ? ["left"] : ["left", "right"]).map(s => ...)}`

**Rule**: Theo **breadcrumb pattern** — property control LUÔN visible, nhưng khi value A của property X làm một số values của property Y không có tác dụng visual → filter bỏ values đó. Reset Y về default khi switch sang A. Figma JSON PHẢI dùng `variantRestrictions` để loại bỏ combos không hợp lệ tương ứng (xem #69) — KHÔNG tạo cross-product đầy đủ.

---

### #71: CSS contextual property — border last-child cần property riêng

**Sai**: Table Row trên Figma luôn có border-bottom nhưng trên web `[&_tr:last-child]:border-0` tự động ẩn border ở hàng cuối. Figma không có CSS `:last-child` → thiếu cách toggle.

**Đúng**: Thêm property `Border [Yes, No]` cho Table Row. `Border=No` set `strokeWidth: 0`. Table parent set `Border=No` cho row cuối.

**Rule**: Khi CSS parent dùng `:last-child`, `:first-child`, `:nth-child` để thay đổi style con → component con PHẢI có property tương ứng trên Figma để toggle behavior đó. Scan web CSS cho `[&_*:last-child]`, `[&_*:first-child]` patterns.

---

### #72: Sub-component variant width phải match web CSS width behavior

**Sai**: Cell Row `base.width: 140` → ALL variants (kể cả Type=Checkbox) đều 140px. Trên web, checkbox cell dùng `w-px` (minimum width ~28px) nhưng Figma cell vẫn 140px → chiếm quá nhiều không gian trong Table Row.

**Đúng**: Variant nào có web CSS khác biệt về width (`w-px`, `w-auto`, `w-fit`, `max-w-*`) → override `"widthMode": "hug"` hoặc `"width"` cụ thể trong `variantStyles`. VD:
```json
"Type=Checkbox": { "widthMode": "hug", "paddingLeft": "sm", "paddingRight": 0, ... }
```

**Rule**: Khi viết JSON spec cho sub-component, PHẢI check web CSS width của TỪNG variant. Nếu một variant dùng `w-px`/`w-fit`/`w-auto` → set `"widthMode": "hug"`. Nếu dùng explicit width (VD `w-[200px]`) → set `"width": 200`. Không để base width áp dụng cho tất cả variants khi web có width khác biệt.

---

### #73: ComponentSet canvas order phải match web Explore tab order

**Sai**: JSON `"components"` array xếp theo dependency order (item trước parent) → trên Figma canvas: Cell Row ở trên, Table ở dưới. Nhưng trên web, Explore Behavior tabs xếp: Table | Table Header | Table Row | Cell Header | Cell Row (parent trước, leaf sau).

**Đúng**: Thứ tự ComponentSet trên Figma canvas (trên → dưới) PHẢI tương ứng với thứ tự tab Explore Behavior trên web (trái → phải). JSON `"components"` array vẫn giữ dependency order để plugin tạo đúng thứ tự, nhưng sau khi tạo xong plugin phải sắp xếp lại vị trí trên canvas theo web tab order.

**Rule**: Figma canvas layout = web Explore tab order. Khi review component trên Figma, verify thứ tự trên → dưới khớp với thứ tự tab trái → phải trên web DS page. Nếu sai → sắp xếp lại.

---

### #74: Icon trong component — dùng direct icon, KHÔNG dùng instance hoặc frame wrapper

**Sai 1**: Dùng Button instance `Icon=Icon Only` cho trigger cần icon ChevronsUpDown → Figma hiển thị icon mặc định "Plus". Plugin không có `iconOverrides` trên instance.

**Sai 2**: Dùng `"type": "frame"` wrapper (32×32) chứa icon → `createFrame()` mặc định có white fill (#FFFFFF), tạo hình vuông trắng che icon.

**Đúng**: Đặt icon trực tiếp làm child của parent frame — KHÔNG wrapper:
```json
{
  "name": "ChevronsUpDown",
  "type": "icon",
  "iconName": "ChevronsUpDown",
  "iconSize": 16,
  "iconFill": "ghost-foreground"
}
```
VD tham chiếu: Accordion dùng direct icon (`"type": "icon"`, `"iconName": "ChevronDown"`) trong Trigger frame — proven pattern.

**Rule**: Khi component cần icon decorative (chevron, toggle icon) → dùng `"type": "icon"` trực tiếp trong parent frame. KHÔNG wrap trong frame riêng (white fill issue) và KHÔNG dùng instance khi cần icon khác default. Review step 3 (Visual Diff) PHẢI verify: (1) icon name khớp web, (2) không có wrapper frame thừa.

---

## D11. Plugin — Instance & Layout in Children Frames

### #75: space-between gap — 3 chế độ: "auto" vs token vs number

Gap trong JSON có 3 chế độ hoàn toàn khác nhau:

**1. `"gap": "auto"`** — Figma Auto spacing, KHÔNG bind variable, KHÔNG hiển thị 0px.
Dùng cho space-between khi TẤT CẢ children đều HUG (không có child nào FILL width). Figma tự phân phối khoảng cách đẩy items ra 2 mép.
```json
{ "primaryAlign": "space-between", "gap": "auto" }
```
VD: Card Footer (2 HUG buttons), Progress Label Row (2 HUG texts).

**2. `"gap": "xs"` (hoặc token string khác)** — actual spacing, bind `spacing/*` variable.
Dùng cho space-between khi CÓ child FILL width. Child FILL tự đẩy child khác ra mép, gap là khoảng cách thực giữa các items.
```json
{ "primaryAlign": "space-between", "gap": "xs", "children": [
  { "name": "Title", "fillWidth": true },
  { "name": "Icon", "type": "icon" }
]}
```
VD: Collapsible Header (FILL text + HUG icon, 8px gap), Accordion Trigger, Select/Combobox base (`labelFill:true` + icon).

**3. `"gap": "none"`** — explicit 0px, bind `spacing/none` variable.
Dùng khi gap thực sự là 0px (KHÔNG phải auto). Hiển thị trên Figma là `spacing/none = 0`.

**Lưu ý**: `"auto"` và `"none"` (0px) là 2 giá trị hoàn toàn khác nhau. Auto = Figma tự tính, None = 0px cố định với variable token.

### #77: Zero spacing/padding PHẢI dùng "none" token — KHÔNG dùng number 0

**Sai**: `"gap": 0`, `"paddingBottom": 0` → plugin set pixel value 0 NHƯNG KHÔNG bind variable → Figma hiển thị "0px" manual thay vì token `spacing/none`.

**Đúng**: Dùng `"paddingBottom": "none"` → plugin gọi `getSpacingValue("none")` = 0 + `bindFloat(node, field, "spacing/none", 0)` → Figma hiển thị token variable.

**Quy tắc**: Tất cả `paddingX`, `paddingY`, `paddingTop`, `paddingBottom`, `paddingLeft`, `paddingRight` có giá trị 0 NÊN dùng string `"none"`. Với `gap`: dùng `"auto"` cho space-between auto, dùng `"none"` cho explicit 0px. Plugin giờ có safety net: number `0` tự động bind `spacing/none` (xem #87), nhưng `"none"` string vẫn là best practice vì rõ ràng hơn.

### #76: Instance trong child frame — thêm widthMode: "hug" khi cần wrap content

**Sai**: Button instance trong footer KHÔNG có `widthMode` → plugin default `layoutSizingHorizontal = "FIXED"` (120px base width). Button bị fixed width thay vì co theo nội dung text.

**Đúng**: Thêm `"widthMode": "hug"` cho instance cần wrap content:
```json
{
  "type": "instance",
  "component": "Button",
  "variants": { "Variant": "Ghost", "Size": "Small", "State": "Default", "Icon": "No Icon" },
  "textOverrides": { "Label": "Cancel" },
  "widthMode": "hug"
}
```
Plugin code (line 2469): `cs.fillWidth ? "FILL" : cs.widthMode === "hug" ? "HUG" : "FIXED"`.

**Rule**: Instance sizing — 3 modes:
- Omit (default) → FIXED (giữ component base width)
- `"fillWidth": true` → FILL (fill parent container)
- `"widthMode": "hug"` → HUG (wrap content — dùng cho Button trong footer, nav items)

Review step 3 (Visual Diff) PHẢI verify: instance width behavior match web React (HUG = `w-fit`/`w-auto`, FILL = `w-full`, FIXED = explicit width).

### #78: labelFill truncation — thứ tự Figma API: TRUNCATE trước, FILL sau

**Sai**: Set `layoutSizingHorizontal = "FILL"` trước → `textAutoResize = "TRUNCATE"` sau → Figma API reset `layoutSizingHorizontal` về `"FIXED"` → text node không fill container → wrap 2 dòng.

```javascript
// ❌ SAI — TRUNCATE reset FILL về FIXED
lbl.layoutSizingHorizontal = "FILL";
lbl.textAutoResize = "TRUNCATE";
lbl.maxLines = 1;
lbl.textTruncation = "ENDING";
```

**Đúng**: Set truncation properties TRƯỚC, `layoutSizingHorizontal = "FILL"` CUỐI CÙNG. Figma API: `TRUNCATE` → sets sizing to FIXED. `FILL` sau đó → KHÔNG reset `textAutoResize` (chỉ reset khi trước đó là `WIDTH_AND_HEIGHT`).

```javascript
// ✅ ĐÚNG — FILL cuối cùng giữ nguyên TRUNCATE
lbl.textAutoResize = "TRUNCATE";
lbl.maxLines = 1;
lbl.textTruncation = "ENDING";
lbl.layoutSizingHorizontal = "FILL";
```

**Ảnh hưởng**: Mọi component có `labelFill: true` (Input, Select, Combobox, Textarea, DatePicker...). Cũng áp dụng cho addon text nodes (prefix, suffix, textLeft, textRight) nếu cần truncate + fill.

**Quy tắc Figma API**: `textAutoResize` và `layoutSizing*` tương tác 2 chiều. `TRUNCATE` reset sizing về FIXED. `FILL` chỉ reset `textAutoResize` khi nó đang là `WIDTH_AND_HEIGHT`. Luôn set `textAutoResize` TRƯỚC `layoutSizing*`.

### #79: Children frame default counterAlign = "center" — text bị align giữa

**Sai**: Children frame (type `"frame"`) KHÔNG set `counterAlign` → plugin default `counterAxisAlignItems = "CENTER"` → text nodes bên trong align paragraph giữa thay vì trái.

```json
{
  "name": "Info",
  "type": "frame",
  "layout": "vertical",
  "gap": "3xs"
}
```

**Đúng**: LUÔN set `"counterAlign": "start"` cho children frame chứa text nodes cần align left:

```json
{
  "name": "Info",
  "type": "frame",
  "layout": "vertical",
  "primaryAlign": "start",
  "counterAlign": "start",
  "gap": "3xs"
}
```

**Giải thích**: Plugin code (line ~2262): `frm.counterAxisAlignItems = ca === "start" ? "MIN" : ca === "end" ? "MAX" : "CENTER"`. Default `"center"` → text HUG nodes bị center trong frame FILL width. Cross-axis alignment ≠ text paragraph alignment, nhưng visual effect giống nhau khi text node HUG width nhỏ hơn frame.

### #80: Overlay component không có visual diff → bỏ properties, tạo 1 variant

**Sai**: Tạo properties cho overlay component (HoverCard, Popover...) dựa trên web Explore controls (Side, Align) → tạo 12 variants trông HOÀN TOÀN GIỐNG NHAU trên Figma.

```json
"properties": {
  "Side": ["Bottom", "Top", "Left", "Right"],
  "Align": ["Center", "Start", "End"]
}
```

**Đúng**: Khi web Explore controls chỉ thay đổi runtime behavior (vị trí hiển thị, animation direction) mà KHÔNG thay đổi visual của component → `"properties": {}` → 1 variant duy nhất.

```json
"properties": {}
```

**Quy tắc**: Figma ComponentSet variant = visual state khác nhau. Properties mà không tạo visual diff trên Figma (Side, Align, Offset, Delay...) → bỏ khỏi properties, chỉ document trong props/figmaMapping. Áp dụng cho: HoverCard (no arrow), Popover (no arrow), components chỉ khác runtime behavior.

---

## D12. Plugin — Icon Instance in Children

### #81: Lucide icon rename — LUÔN check foundation-icons.json trước khi dùng tên icon

**Sai**: Dùng tên icon cũ trong component JSON vì nhớ từ React code hoặc Lucide docs cũ.

```json
{ "component": "Icon / AlertCircle" }
{ "component": "Icon / CheckCircle2" }
{ "component": "Icon / AlertTriangle" }
```

**Đúng**: Mở `figma-specs/foundation-icons.json`, search tên icon → dùng tên chính xác từ đó.

```json
{ "component": "Icon / CircleAlert" }
{ "component": "Icon / CircleCheck" }
{ "component": "Icon / TriangleAlert" }
```

**Quy tắc**: Lucide liên tục rename icons giữa các version (AlertCircle→CircleAlert, CheckCircle2→CircleCheck, AlertTriangle→TriangleAlert, v.v.). Foundation icons JSON dùng tên version mới nhất. **KHÔNG tin vào trí nhớ** — LUÔN verify tên icon trong `foundation-icons.json` trước khi dùng trong component JSON. Nếu icon không tồn tại trong foundation → plugin `findComponent()` trả null → icon không hiện.

### #82: Children instance icon thiếu iconFill → icon kế thừa màu mặc định, không khớp variant

**Sai**: Tạo icon instance trong `children` array mà không set `iconFill`. Icon kế thừa `foreground` từ master component, không đổi theo variant (Error=đỏ, Success=xanh...).

```json
"Type=Error": {
  "fill": "destructive-subtle",
  "children": [
    { "name": "Icon", "type": "instance", "component": "Icon / CircleAlert", "width": 16, "height": 16 }
  ]
}
```

**Đúng**: Set `iconFill` trên mỗi icon instance để override màu vector theo variant.

```json
"Type=Error": {
  "fill": "destructive-subtle",
  "children": [
    { "name": "Icon", "type": "instance", "component": "Icon / CircleAlert", "iconFill": "destructive-subtle-foreground", "width": 16, "height": 16 }
  ]
}
```

**Quy tắc**: Icon instances trong `children` array KHÔNG tự động kế thừa `textFill` hay bất kỳ color nào từ parent variant. Plugin `_processChildren` cần `iconFill` để override vector strokes/fills trên instance con. **Mỗi variant có icon** → PHẢI set `iconFill` tương ứng. Check React component CSS: `[&>svg]:text-{variant}` → map sang `iconFill: "{variant}"`. Áp dụng cho: Alert, AlertDialog, Toast, Banner, hoặc bất kỳ component nào có icon instance thay đổi màu theo variant.

### #83: Plugin findComponentSet() chỉ tìm COMPONENT_SET — icon là standalone COMPONENT

**Sai**: Chỉ dùng `findComponentSet()` trong `_processChildren` instance path. Khi `component: "Icon / Info"` → trả null vì icons là COMPONENT, không phải COMPONENT_SET → icon không render.

**Đúng**: Thêm fallback `findComponent()` khi `findComponentSet()` trả null:

```javascript
var _compSet = findComponentSet(compSetName);
if (_compSet) {
  _inst = _getInstance(_compSet, _instProps);
} else {
  var _standaloneComp = findComponent(compSetName);
  if (_standaloneComp && _standaloneComp.type === "COMPONENT") {
    _inst = _standaloneComp.createInstance();
  }
}
```

**Quy tắc**: Foundation icons được tạo bằng `figma.createComponent()` → mỗi icon là 1 standalone COMPONENT (không có variants). `findComponentSet()` chỉ tìm COMPONENT_SET (multi-variant). Plugin `_processChildren` instance path PHẢI có fallback qua `findComponent()` cho standalone components. Đã fix trong code.js — lesson này nhắc KHÔNG xóa fallback nếu refactor.

---

## D10. Plugin — Layout & Positioning

### #84: Web `absolute` element → gộp vào parent row trong Figma JSON

**Sai**: Tạo wrapper frame riêng cho absolute-positioned element (VD: Dialog close button):
```json
{
  "name": "Close",
  "type": "frame",
  "layout": "horizontal",
  "primaryAlign": "end",
  "fillWidth": true,
  "showWhen": "Show Close=Yes",
  "children": [{ "name": "Close Icon", "type": "frame", "width": 16, "height": 16 }]
}
```
→ Wrapper chiếm 1 row trong vertical auto-layout → đẩy content xuống → padding không đều.

**Đúng**: Gộp element vào parent row đã tồn tại (VD: Header):
```json
{
  "name": "Header",
  "type": "frame",
  "layout": "horizontal",
  "counterAlign": "start",
  "fillWidth": true,
  "children": [
    { "name": "Text Group", "type": "frame", "layout": "vertical", "fillWidth": true, "children": [...] },
    { "name": "Close Icon", "type": "instance", "component": "Icon / X", "width": 16, "height": 16, "iconFill": "muted-foreground", "showWhen": "Show Close=Yes" }
  ]
}
```
→ Close icon nằm inline cùng Header → không chiếm row riêng → padding đều. Icon X render đúng hình dạng (không phải filled rectangle).

**Quy tắc**: Plugin KHÔNG hỗ trợ `layoutPositioning: "ABSOLUTE"` cho regular children (chỉ ellipses). Khi web dùng `absolute right-* top-*` → Figma JSON PHẢI gộp element vào row gần nhất (horizontal layout). Close icon PHẢI dùng `"type": "instance", "component": "Icon / X"` với `iconFill: "muted-foreground"` — KHÔNG dùng `"type": "frame"` filled rectangle (render hình vuông thay vì icon X). Áp dụng cho: Dialog close, Sheet close, Toast close — bất kỳ floating button nào.

---

### #85: Label-input gap phải dùng `space-y-2xs` (4px), KHÔNG dùng `space-y-xs`

**Sai**: Dùng `space-y-xs` (6px) cho khoảng cách giữa Label và Input/Textarea/Select:
```tsx
<div className="space-y-xs">
  <Label>Name</Label>
  <Input placeholder="Your name" />
</div>
```

**Đúng**: Dùng `space-y-2xs` (4px) — tighter coupling giữa label và field:
```tsx
<div className="space-y-2xs">
  <Label>Name</Label>
  <Input placeholder="Your name" />
</div>
```

**Scope**: Tất cả label+input/textarea/select field patterns — bao gồm FormItem component (`form.tsx`), design system page demos, code snippets, và mọi form trong app pages.

### #86: Explore Behavior preview PHẢI interactive — KHÔNG dùng `pointer-events-none`

**Sai**: Dùng `pointer-events-none` trên explore behavior preview canvas → user không thể hover/click để thấy trạng thái:
```tsx
<div className="pointer-events-none">
  <Button>Click me</Button>
</div>
```

**Đúng**: Explore preview canvas để interactive — user hover/click trực tiếp trên component:
```tsx
<div>
  <Button>Click me</Button>
</div>
```

**Lưu ý**: `pointer-events-none` chỉ hợp lệ trong: (1) disabled state simulation trên controls, (2) design token table text, (3) example sections cần giữ overlay mở (VD: `<Tooltip open>`). KHÔNG dùng trong explore behavior preview area.

---

## D13. Plugin — Zero Value Variable Binding

### #87: Plugin auto-bind `spacing/none` và `border radius/none` cho number 0 — safety net

**Trước đây**: Plugin KHÔNG bind variable khi gap/padding/radius là number `0` → Figma hiện raw "0px" thay vì token.

**Sau fix**: Plugin tự động bind variable cho MỌI giá trị number `0`:
- `gap: 0` → bind `spacing/none`
- `paddingX: 0`, `paddingY: 0`, `paddingTop: 0`... → bind `spacing/none`
- `radius: 0` → bind `border radius/none`
- Children frame không set radius → default 0 → bind `border radius/none`

**4 code paths đã fix**: children frame (`_processChildren`), main comp (no addon/indicator), addon innerF, indicator.

**RADIUS_FALLBACKS**: Thêm `"none": 0` → `getRadiusValue("none")` trả 0 đúng cách.

**Vẫn nên dùng string `"none"`**: Đây là safety net cho edge cases. JSON spec VẪN NÊN dùng `"none"` string (best practice #77) vì string path rõ ràng hơn và bind variable ở cả getSpacingValue + bindFloat.

---

## D14. Component Layout — Full-Width Divider Pattern

### #88: Dialog full-width divider — base paddingX "none", per-child paddingX riêng

**Sai**: Base component có `paddingX: "md"` → TẤT CẢ children bị constraint trong padding → border của scrollable body không thể span full width.

```json
"base": { "paddingX": "md", "children": [
  { "name": "Body Scrollable", "stroke": "border", "strokeSides": "top,bottom" }
]}
```
→ Border Body Scrollable bị indent 16px mỗi bên.

**Đúng**: Base dùng `paddingX: "none"` (0), mỗi child có `paddingX: "md"` riêng. Child cần full-width border KHÔNG set paddingX → border span toàn bộ width.

```json
"base": { "paddingX": "none", "children": [
  { "name": "Header", "paddingX": "md", ... },
  { "name": "Body Scrollable", "stroke": "border", "strokeSides": "top,bottom", "paddingX": "md", ... },
  { "name": "Footer", "paddingX": "md", ... }
]}
```
→ Body Scrollable border spans full dialog width, content vẫn có padding.

**Áp dụng cho**: Dialog (scrollable variant), Sheet (scrollable), Drawer (scrollable) — bất kỳ component nào cần child border span full width trong vertical auto-layout.

## D15. Foundation Docs — Web ↔ JSON Sync

### #89: Foundation token không tồn tại trong CSS — PHẢI grep trước khi thêm vào JSON

**Sai**: Thêm `destructive-hover` vào `colors.json` mà không verify trong `index.css` → JSON có token Figma plugin không resolve được.

**Đúng**: Trước khi thêm bất kỳ token nào vào foundation doc JSON, PHẢI chạy `grep "token-name" index.css` để confirm nó tồn tại. Source of truth = `index.css` CSS custom properties.

### #90: Foundation doc JSON thiếu section/items so với web — PHẢI đếm và match chính xác

**Sai**: `colors.json` Sidebar section có 6 items, web có 10. `colors.json` thiếu hoàn toàn Chart section (web có 6 items). → Figma docs page thiếu tokens.

**Đúng**: Khi update foundation docs, đếm items trong TỪNG section trên web, so sánh với JSON. Count phải khớp 100%. Workflow:
1. Update web `*Docs()` trước (source of truth for visual)
2. Update JSON để match web chính xác (same sections, same items, same order)
3. Verify: `grep -c "variable" colors.json` vs đếm items trên web

### #91: Foundation doc `tw` values bị viết tắt — PHẢI dùng full Tailwind class name

**Sai**: `"tw": "text-destructive-subtle-fg"`, `"tw": "text-brand-subtle-fg"` → không khớp web, gây confusion khi devs reference.

**Đúng**: `"tw": "text-destructive-subtle-foreground"`, `"tw": "text-brand-subtle-foreground"` — copy full class name từ web, KHÔNG tự rút gọn. Áp dụng cho tất cả `tw` fields: `bg-*`, `text-*`, `border-*`, `ring-*`.

### #92: Dùng opacity-modified colors thay vì semantic tokens — Figma variables không thể override opacity

**Sai**: `text-white/80`, `bg-primary/[0.08]`, `bg-white/[0.08]`, `bg-success/10 dark:bg-success/20` → Figma variables chỉ override color, KHÔNG override opacity. Khi switch theme/mode, opacity giữ nguyên → color sai.

**Đúng**: Map sang semantic tokens có sẵn: `text-white/90` → `text-foreground`, `text-white/35` → `text-muted-foreground`, `bg-primary/[0.08]` → `bg-primary-10`, `bg-white/[0.08]` → `bg-border-subtle`, `bg-success/10` → `bg-success-subtle`. KHÔNG tạo opacity mới — dùng semantic tokens tồn tại.

### #93: Password icon dùng absolute-positioned Button thay vì Input iconRight — DOM walker skip absolute elements

**Sai**: `<div class="relative"><Input /><Button class="absolute right-3">👁</Button></div>` → DOM walker skip absolute elements → Figma output thiếu icon.

**Đúng**: Dùng Input component's native `iconRight` prop: `<Input iconRight={<button>👁</button>} />` → icon nằm trong Input's sibling span, DOM walker extract được qua parent wrapper scan.

### #94: Figma plugin API response thiếu wrapper — UI đọc `data.tree` = undefined

**Sai**: Server trả raw tree object trực tiếp `res.end(JSON.stringify(result))` → UI đọc `data.tree` → `undefined` → plugin crash "cannot read property 'children' of undefined".

**Đúng**: Luôn wrap response: `res.end(JSON.stringify({ tree: result, pageName: displayName }))`. UI convention: `data.tree` cho DOM tree, `data.pageName` cho tên page.

### #95: Figma plugin UI dùng wrapper div cho collapsible items — Figma sandbox CSS hạn chế

**Sai**: Wrap state items trong `<div class="state-group">` với CSS `display:none/block` toggle → Figma plugin iframe không render children khi toggle class.

**Đúng**: Render state items flat trực tiếp trong list, toggle bằng `style.display = 'none'/'flex'` trên từng item. Không dùng wrapper div trong Figma plugin UI.

### #96: Server port mismatch giữa extractor và plugin UI

**Sai**: Plugin UI hardcode `http://localhost:3456`, server chạy trên `3457` → connect fail, không nhận data.

**Đúng**: Plugin UI default port PHẢI match server `SERVE_PORT`. Khi đổi port ở server → đổi cả UI. Hiện tại: `html-to-figma.ts` port `3457`, plugin UI `http://localhost:3457`.

---

## D16. DOM Extraction — Portal & Fallback

### #97: DOM walker không thấy Sonner toast — portal render ngoài #root

**Sai**: DOM walker `walkDOM(document.querySelector("#root"))` → Sonner `<ol data-sonner-toaster>` render qua React portal NGOÀI `#root` → walker không bao giờ thấy toast.

**Đúng**: Sau khi walk `#root`, thêm portal traversal: `document.querySelector("[data-sonner-toaster]")` → walk từng `[data-sonner-toast]` → push vào `result.children`. Áp dụng cho CẢ `raw-dom-walker.ts` VÀ `dom-walker.ts`.

### #98: toast.custom() data-type="custom" — không phải toast type thật

**Sai**: Walker đọc `el.getAttribute("data-type")` trên `[data-sonner-toast]` → `toast.custom()` set `data-type="custom"` thay vì `"error"/"success"`.

**Đúng**: Khi `data-type === "custom"` → check inner element `[data-toast-type]` để lấy type thật. React JSX: thêm `data-toast-type={type}` vào root div bên trong `toast.custom()`.

### #99: Plugin field name mismatch — json-builder vs direct walker format

**Sai**: json-builder outputs `type: "component"` + `componentSet` + `overrides.text`, plugin chỉ có `case "instance"` + đọc `component` + `textOverrides` → skip hoàn toàn.

**Đúng**: Plugin switch PHẢI có cả `case "component":` VÀ `case "instance":`. `createInstance()` support cả 2 format: `node.component || node.componentSet`, `node.textOverrides || (node.overrides && node.overrides.text)`.

### #100: ComponentSet không tồn tại trên Figma — cần manual UI fallback

**Sai**: Khi `findComponentSet(name)` return null → plugin tạo placeholder frame trống hoặc skip → user không biết component nào thiếu.

**Đúng**: `createManualInstance()` fallback vẽ UI manual bằng Figma API (frames, text, icons, variables). Sonner toast: foreground fill, border 10% opacity, shadow, type-specific icon, title text. Generic: card frame với component name + variant label.

---

## D17. DOM Extraction — Absolute Positioning & Decorative Backgrounds

### #101: `insertChild()` reorder reset `layoutPositioning` — absolute nodes mất vị trí

**Sai**: `reconcileChildren()` set `layoutPositioning = "ABSOLUTE"` + x/y/constraints trên node, sau đó `parent.insertChild(oi, resultOrder[oi])` reorder children → Figma reset `layoutPositioning` về `"AUTO"` → node bị auto-layout đẩy về vị trí mặc định.

**Đúng**: PHẢI re-apply absolute positioning SAU reorder. Thêm post-reorder loop: iterate `childSpecs`, tìm `position === "absolute"` → set lại `layoutPositioning`, `resize()`, x/y, constraints trên `resultOrder[ai]`. Áp dụng cho tất cả node loại overlay (Sonner toast, modal, dialog).

### #102: Absolute overlay dùng viewport x/y — sai vị trí khi frame height khác viewport

**Sai**: Walker trả `x: rect.left, y: rect.top` (viewport-relative). Plugin set `node.x = spec.x`. Nhưng root frame có `primaryAxisSizingMode = "AUTO"` (HUG height) → actual frame height ≠ viewport height → y sai. Tương tự khi frame resize.

**Đúng**: Walker trả `rightMargin` + `bottomMargin` (khoảng cách từ mép viewport). Plugin tính x/y từ PARENT FRAME dimensions: `x = parent.width - nodeWidth - rightMargin` (cho `horizontal: "MAX"`), `y = parent.height - nodeHeight - bottomMargin` (cho `vertical: "MAX"`), `x = (parent.width - nodeWidth) / 2` (cho `horizontal: "CENTER"`). Constraints đi kèm: Desktop/Tablet = MAX/MAX (right-bottom), Mobile = CENTER/MAX (center-bottom).

### #103: Sonner toast breakpoint-specific positioning

**Sai**: Dùng cùng 1 logic positioning cho tất cả breakpoints. Desktop/Tablet cần right-bottom, Mobile cần center-bottom với width khác.

**Đúng**: Walker detect breakpoint qua `window.innerWidth`:
- **Desktop/Tablet** (>480px): width = `rect.width`, constraints = `{ horizontal: "MAX", vertical: "MAX" }`, rightMargin/bottomMargin từ viewport edges.
- **Mobile** (≤480px): width = `viewport - 32` (16px mỗi bên), constraints = `{ horizontal: "CENTER", vertical: "MAX" }`, x tự tính từ center.

### #104: Decorative background screenshot bị dính content (illustration, card, text)

**Sai**: `el.screenshot()` chụp TOÀN BỘ element bao gồm children → background screenshot chứa cả illustration SVG, auth card, text.

**Đúng**: Trước khi screenshot, hide flow children (`visibility: hidden`) giữ lại chỉ absolute/fixed decorative elements (gradient orbs, glow, grid pattern). Screenshot. Restore visibility. Overlay portals (Sonner, dialog) cũng phải hide (`display: none`) trước khi chụp bg.

### #105: Instance node cần explicit `resize()` khi absolute positioning

**Sai**: `createInstance()` trả instance với default component size. `applySizing()` set `layoutSizingHorizontal = "FIXED"` nhưng KHÔNG gọi `resize()` → instance giữ component's default width/height, không match extracted dimensions.

**Đúng**: Khi set absolute positioning, PHẢI gọi `node.resize(spec.width, spec.height)` TRƯỚC khi set x/y. Nếu không, x/y tính từ wrong width → vị trí sai (VD: Sonner component 400px default, extracted 356px → x shift 44px).

### #106: `instanceOverrides` KHÔNG tồn tại trong plugin — dùng `overrides` thay thế

**Sai**: Dùng `"instanceOverrides": { "Item 1": { "variants": { "State": "Active" } } }` trên instance children hoặc trong variantStyles → plugin hoàn toàn ignore vì function `_applyInstanceOverrides` không tồn tại.

**Đúng**: Dùng `"overrides"` trên instance children spec trong `_processChildren`. Format: `"overrides": { "nested": { "ChildName": { "TextNodeName": "value" } }, "nestedVariants": { "ChildName": { "PropName": "PropValue" } } }`. Plugin gọi `applyComponentOverrides(inst, cs)` ở cả 3 code paths (new/swap/update). VD: App Header Nav instance dùng `overrides.nestedVariants` để set Item 1 State Active/Default theo Page property.

### #107: Button Icon Only — KHÔNG dùng `widthMode: "hug"` trên instance

**Sai**: Button Icon Only instance với `"widthMode": "hug"` → width shrink về icon size 16px thay vì giữ component 36×36.

**Đúng**: Omit `widthMode` (default = FIXED) → instance giữ đúng 36×36 từ Button component. Chỉ dùng `widthMode: "hug"` cho instances cần wrap nội dung (text buttons, logos).

### #108: Figma variant values dùng Yes/No — KHÔNG dùng True/False

**Sai**: `figma("Progress", { "Show Label": "False" })` → `data-figma-variants='{"Show Label":"False"}'` → không match variant nào → fallback variant đầu tiên (Value=0).

**Đúng**: `figma("Progress", { "Show Label": "No" })`. Figma component properties dùng `"Yes"/"No"` cho boolean-like values, KHÔNG dùng `"True"/"False"`. Quy tắc: **`data-figma-variants` values PHẢI khớp 100% với Figma property values trong component JSON `properties`**. Luôn kiểm tra `properties` trong component JSON trước khi viết `figma()` helper.

### #109: Foundation icon tên trùng — brand icon vs Lucide icon

**Sai**: Brand icon "X" (Twitter/X logo, fill-based) trùng tên Lucide "X" (close icon, stroke-based). Walker extract `name="X"` → plugin match brand icon → hiển thị logo Twitter thay vì close icon trên tất cả component dùng nút X.

**Đúng**: Rename brand icon thành `"X Twitter"` trong foundation-icons.json, brand-icons.tsx, và design-system page. Thêm Lucide "X" (close) icon riêng vào foundation-icons.json. Khi thêm brand icon có tên trùng Lucide → PHẢI dùng tên phân biệt (prefix brand name hoặc suffix).

### #110: Lucide-react export duplicate names — filter `Lucide` prefix

**Sai**: `Object.entries(LucideIcons).filter(([name]) => /^[A-Z]/.test(name) && !name.endsWith("Icon"))` → mỗi icon hiện 2 lần vì lucide-react export cả `X` và `LucideX`.

**Đúng**: Thêm `!name.startsWith("Lucide")` vào filter: `.filter(([name]) => /^[A-Z]/.test(name) && !name.endsWith("Icon") && !name.startsWith("Lucide"))`.

### #111: Button `asChild` + `<Link>` → DOM walker không detect component

**Sai**: `<Button asChild><Link to="...">text</Link></Button>` → Radix Slot render `<a>` tag, `data-figma` attribute truyền xuống `<a>`. Nhưng `<a>` nằm trong `INLINE_TAGS` → parent mixed-inline logic treat nó như text run thay vì component instance.

**Đúng**: Dùng `<Button onClick={() => navigate("...")}>` trực tiếp (không `asChild`) để render `<button>` tag → walker detect đúng `data-figma` attribute. Import `useNavigate` từ react-router-dom cho navigation.

### #112: Mixed-color inline text (links trong label) — mất color trên Figma

**Sai**: `<Label>Text <span class="text-primary">Link</span></Label>` → Label có `data-figma` → walker extract thành instance → text flatten mất color info → link text cùng màu với text thường.

**Đúng**: Walker skip instance extraction cho Label có `hasColoredInlineChildren()` → fall through mixed-inline logic → extract frame chứa text runs riêng biệt với đúng color token. Frame cần `wrap: true` + `fillWidth: true` để text wrap đúng trên mobile. Checkbox/Radio kế bên mixed-color label → set `textOverrides.Label = " "` (ẩn default text).

### #113: Buttons stacked cần cùng container — gap 8px, full width

**Sai**: Submit button trong `<form>` bên `CardContent`, back button trong `CardFooter` riêng → gap lớn do padding giữa các card sections.

**Đúng**: Đặt 2 buttons cùng container `<div className="flex flex-col gap-xs">`, cả 2 đều `className="w-full"`. Gap giữa stacked buttons = 8px (`gap-xs`).

### #114: Có 2 return paths → phải fix CẢ 2

**Sai**: Component có conditional render (`if (sent) return <A/>; return <B/>`) → chỉ fix 1 return path (success state), bỏ sót default state. Code vẫn dùng `<Link>` cũ ở return thứ 2.

**Đúng**: Khi fix component có multiple return paths → LUÔN search ALL return statements (`return (`) để fix tất cả. Dùng `replace_all: true` chỉ work khi cả 2 chỗ có cùng exact string.

### #115: Component có `focusRing` PHẢI có `clipsContent: true` — nếu không effect style không hiện trên Figma

**Sai**: Button component có `focusRing: "ring"` trong Focus state nhưng thiếu `clipsContent: true` → Ring/default effect style (DROP_SHADOW 3px spread) không render trên Figma UI.

**Đúng**: Thêm `"clipsContent": true` vào `base` cho MỌI component có `focusRing` trong variantStyles. Figma yêu cầu clip content bật thì DROP_SHADOW effect style mới hiển thị.

**Rule**: Khi component JSON có bất kỳ `focusRing` property nào → `base` PHẢI có `"clipsContent": true`. Checklist components cần: Button, Switch, Toggle, Radio, Checkbox, SearchBox, DatePicker, Accordion, Input OTP (đã có sẵn).

### #116: Ring effect styles PHẢI có `showShadowBehindNode: false` — tránh lỗi fill tối trên component có fill trong suốt/alpha

**Sai**: Ring/default DROP_SHADOW dùng default `showShadowBehindNode: true` → component có fill trong suốt (Button Outline, Ghost) hiển thị ring shadow xuyên qua fill → tạo vùng tối giả như có background.

**Đúng**: Tất cả Ring effect styles trong `foundation-effects.json` PHẢI có `"showShadowBehindNode": false` trên mỗi DROP_SHADOW effect. Plugin đọc `e.showShadowBehindNode` từ JSON, default `true` nếu không set.

**Rule**: Khi tạo focus ring effect style (Ring/*) → LUÔN set `"showShadowBehindNode": false`. Web CSS `box-shadow` không bao giờ render behind node — Figma cần explicit tắt.

### #117: Toggle "pressed" thuộc State — KHÔNG tách thành property Value riêng

**Sai**: Toggle JSON có `"Value": ["Unpressed", "Pressed"]` riêng + `"State": ["Default", "Hover", "Focus", "Disabled"]` → 4 properties, web chỉ có 3.

**Đúng**: Web DS gộp pressed vào State: `["default", "hover", "pressed", "focus", "disabled"]`. JSON phải match: `"State": ["Default", "Hover", "Pressed", "Focus", "Disabled"]`.

**Rule**: LUÔN kiểm tra web `ExploreBehavior controls` — số lượng controls = số Figma properties. Nếu web gộp states (pressed, active, checked) vào 1 dropdown → JSON cũng gộp.

### #118: Figma property values PHẢI dùng Title Case with spaces — không camelCase

**Sai**: `"Left": ["None", "Icon", "Prefix", "TextLeft"]` — "TextLeft" là camelCase.

**Đúng**: `"Left": ["None", "Icon", "Prefix", "Text Left"]` — Title Case with space.

**Rule**: Figma property values convention = Title Case separated by spaces. Web internal values (camelCase) KHÔNG copy trực tiếp vào JSON properties.

### #119: Components transparent background + focusRing PHẢI có fill token — KHÔNG dùng fillOpacity thủ công

**Sai**: `"State=Focus": { "focusRing": "ring" }` — Figma không render DROP_SHADOW effect trên node hoàn toàn transparent.

**Cũng sai**: `"fill": "foreground", "fillOpacity": 0.01` — giảm opacity thủ công trên variable token, phá vỡ tính nhất quán của design token.

**Đúng**: `"State=Focus": { "focusRing": "ring", "fill": "ghost" }` — token `ghost` = `rgba(255,255,255,0.01)` light / `rgba(0,0,0,0.01)` dark — near-invisible, variable token nguyên vẹn.

**Rule**: Khi component base KHÔNG có fill (Toggle, Accordion) hoặc variant có `"fill": "ghost"` (transparent) — Focus state PHẢI thêm `"fill": "ghost"`. Token `ghost` có opacity 1% nên visually invisible nhưng đủ để Figma render ring. KHÔNG ĐƯỢC dùng `fillOpacity` để giảm opacity variable token. Áp dụng: Toggle, Button Ghost/Ghost Muted, Accordion.

### #120: Boolean-like property values PHẢI dùng "Yes"/"No" — KHÔNG BAO GIỜ "True"/"False"

**Sai**: `"End Item": ["False", "True"]`, `"Open": ["False", "True"]`, `"Show Label": ["True", "False"]` — Figma không có convention True/False. Gây variant mismatch khi plugin tìm variant theo key `End Item=False` thay vì `End Item=No`.

**Đúng**: `"End Item": ["No", "Yes"]`, `"Open": ["No", "Yes"]`, `"Show Label": ["Yes", "No"]` — match Figma native boolean property format.

**Rule**: Mọi property có 2 giá trị đại diện on/off, show/hide, hoặc có/không → PHẢI dùng `"Yes"/"No"`. Áp dụng TOÀN BỘ: `properties`, `variantStyles` keys (`"Open=Yes"`), `showWhen` (`"End Item=No"`), instance `variants` (`"End Item": "Yes"`), `examples` props, `figmaMapping`. KHÔNG copy trực tiếp giá trị boolean từ React (true/false) vào JSON — phải chuyển đổi sang Yes/No. Tham chiếu: `_refs/plugin-json-pattern.md` → "properties Rules".

### #121: Indicator pattern — clipsContent thuộc indicator, KHÔNG thuộc base

**Sai**: `"base": { "clipsContent": true }` trên compound components (Radio, Checkbox, Switch) → clip toàn bộ variant bao gồm cả label text bên ngoài indicator.

**Đúng**: `"base": { "indicator": { "clipsContent": true, ... } }` — chỉ clip indicator frame (vòng tròn radio, ô checkbox, track switch), không ảnh hưởng label.

**Rule**: Compound components dùng indicator pattern (`base.indicator`) → `clipsContent` PHẢI nằm trong `indicator` object, KHÔNG nằm ở `base` level. Plugin đọc `indicatorF.clipsContent = !!(_indSpec.clipsContent)`. Áp dụng: Radio, Checkbox, Switch.

### #122: Group+Item pattern — Item PHẢI ở index 0, parent dùng instance, Accordion cũng là Group+Item

**Sai**: (1) Item ở index 1 (sau parent) → plugin tạo parent trước, lúc đó chưa có item ComponentSet → instance reference fail. (2) Parent dùng `"type": "frame"` để tạo manual layout thay vì instance. (3) Accordion không được xem là Group+Item → không tách Accordion Item.

**Đúng**: (1) Item LUÔN ở `"components"` index 0. (2) Parent dùng `"type": "instance"` với `component`/`variants`/`textOverrides`. (3) Accordion, Tabs, Table, Calendar, DatePicker, Input OTP, Navigation Menu, Breadcrumb, Pagination — TẤT CẢ là Group+Item.

**Rule**: Khi component có sub-component (item/row/cell/trigger) → PHẢI follow Group+Item pattern:
1. Item spec ở index 0 trong `"components"` array
2. Parent spec ở index 1+, children dùng `"type": "instance"` reference item
3. Canvas order: web Explore tab trái→phải = Figma canvas trên→dưới
4. Variants trong ComponentSet xếp lưới: property A chiều ngang, property B chiều dọc
5. Cùng 1 file JSON (1 Docs page = 1 JSON file)
Tham chiếu: `_refs/plugin-json-pattern.md` → "Group+Item" + "Instance Swap / Sub-Component Pattern".

### #124: KHÔNG dùng opacity-* để giảm màu token — dùng semantic token thay thế

**Sai**: `<ChevronsUpDown className="size-md opacity-50" />` — giảm opacity icon inheriting `text-foreground` từ Button. Dark mode `foreground@50%` (semi-transparent white) ≠ `muted-foreground` (zinc-400).

**Đúng**: `<ChevronsUpDown className="size-md text-muted-foreground" />` — dùng semantic token trực tiếp.

**Rule**: KHÔNG dùng `opacity-*` trên individual elements để giảm màu của variable token. Thay bằng semantic token phù hợp (`text-muted-foreground`, `text-border`, etc.) hoặc `color-mix()` khi cần chính xác alpha. **Ngoại lệ cho phép**: (1) `disabled:opacity-50` trên toàn component (Shadcn convention), (2) `opacity-0`/`opacity-100` cho visibility toggle, (3) `opacity-*` trên toàn cell khi cần giảm mọi element cùng lúc (calendar outside days). Vi phạm đã fix: combobox ChevronsUpDown, command Search icon, dropdown-menu shortcut, sonner description.

### #123: Upsert phải giữ vị trí ComponentSet — không gọi combineAsVariants khi CS đã tồn tại

**Sai**: Khi upsert (CS đã tồn tại), move tất cả variants ra page → xóa CS → `combineAsVariants(all)` → Figma xáo trộn layout, mất vị trí thủ công của variants và ComponentSet.

**Đúng**: Upsert in-place: update existing variants tại chỗ, add new variants qua `cs.appendChild(newComp)`, remove stale variants. Chỉ re-layout grid khi có thay đổi cấu trúc (thêm/xóa variant). Pure update (chỉ sửa fill/text/children) → giữ nguyên vị trí.

**Rule**: Plugin upsert 3 case:
1. **Pure update** (không thêm/xóa variant): update in-place, KHÔNG chạm position
2. **Structural change** (thêm hoặc xóa variant): add/remove trực tiếp trong CS, rồi `_layoutVariantsInGrid()` sắp xếp lại grid theo property axes (last prop = columns, rest = rows)
3. **CS bị Figma auto-delete** (xóa hết variants): fallback `combineAsVariants` + grid layout
Grid layout: gap 20px, last property → cột X, remaining properties → hàng Y. Resize CS vừa khít.

### #125: Icon-type children trong _processChildren — PHẢI update fill trên cả upsert + xử lý BOOLEAN_OPERATION

**Sai**: Upsert path cho icon-type children chỉ `resize()` mà không update `iconFill`. `findAll` chỉ tìm VECTOR/ELLIPSE/LINE → bỏ sót BOOLEAN_OPERATION. Chỉ set `strokes` → bỏ sót icons dùng `fills`.

**Đúng**: Upsert path PHẢI: (1) swap icon component nếu tên khác (`getMainComponentAsync` + `swapComponent`), (2) re-apply `iconFill` lên TẤT CẢ vectors (VECTOR + BOOLEAN_OPERATION + ELLIPSE + LINE), (3) set CẢ `strokes` VÀ `fills` (không chỉ strokes).

**Rule**: Plugin `_processChildren` icon-type code phải xử lý đầy đủ 4 việc trên CẢ 2 paths (new + upsert): resize, swap icon nếu cần, apply iconFill lên strokes, apply iconFill lên fills.

### #126: Plugin upsert — thêm/xóa property PHẢI migrate variant names, KHÔNG xóa tạo lại

**Sai**: Thêm property mới (VD: "Show Label") → variant cũ `Value=Unchecked, State=Default` không match combo mới `Value=Unchecked, State=Default, Show Label=Yes` → plugin xóa TẤT CẢ variant cũ → tạo lại → phá hỏng mọi instance trên các page khác.

**Đúng**: Detect property mới bằng cách parse property names từ existing variant names vs spec. Rename variant cũ thêm `NewProp=DefaultValue` (first value in properties array) TRƯỚC khi matching. Variant cũ match → reuse (preserve instances). Chỉ tạo variant MỚI cho combinations chưa tồn tại.

**Rule**: KHÔNG BAO GIỜ xóa hết variants rồi tạo lại khi property keys thay đổi. Plugin section 1.6 xử lý migration: rename existing → rebuild existingVarMap → normal matching logic.
