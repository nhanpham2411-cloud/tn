# Common Mistakes & Lessons — tn Products

> File tham chiếu dùng chung cho TẤT CẢ products trong `tn/`.
> Trước khi bắt đầu bất kỳ task nào, ĐỌC file này.
> Cập nhật: 2026-03-15 | 192 lessons

---

## Mục lục

- [A. Figma Plugin](#a-figma-plugin) (#1-#8)
- [B. JSON Spec Files](#b-json-spec-files) (#9-#13)
- [C. Component Docs — Web App](#c-component-docs--web-app) (#14-#22, #58-#59, #62-#63)
- [D. Design Token & Styling](#d-design-token--styling) (#23-#28, #34-#35)
- [D2. Plugin & JSON Spec — Input Components](#d2-plugin--json-spec--input-components) (#36-#38)
- [D3. Plugin — Upsert & Rendering](#d3-plugin--upsert--rendering) (#39-#41, #68, #123, #126, #149)
- [D4. Plugin — Instance Sizing & Performance](#d4-plugin--instance-sizing--performance) (#42-#44)
- [D5. Plugin — Variable Binding](#d5-plugin--variable-binding) (#45, #56, #178)
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
- [D17. Plugin — JSON Spec Structure](#d17-plugin--json-spec-structure) (#179)
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

**1. `"gap": "auto"`** — Figma Auto spacing, bind `spacing/none` (itemSpacing=0 + variable token).
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

## D16. Component Structure — No Boolean Properties in Variants

### #97: ComponentSet dùng `iconLeft`/`iconRight` boolean flags — element hidden thay vì xóa

**Sai**: Base component set `"iconLeft": false` hoặc trong variantStyles, element vẫn được tạo nhưng ẩn → layout issue, clipping, variant inconsistency.

```json
{
  "name": "Input",
  "base": {
    "iconLeft": false,
    "iconLeftName": "Search"
  },
  "Left=None": {
    "iconLeft": false  // Icon node tồn tại, chỉ visibility toggle
  }
}
```

→ Input `Left=None` variant: icon node vẫn tạo ra, bị HUG hoặc clip, gây layout indent lệch.

**Đúng**: Dùng `children` array với `showWhen` — element KHÔNG được tạo khi variant không cần nó:

```json
{
  "name": "Input",
  "base": {
    "children": [
      { "name": "Icon Left", "type": "icon", "iconName": "Search", "showWhen": "Left=Icon" },
      { "name": "Input Field", "type": "frame", ... },
      { "name": "Icon Right", "type": "icon", "iconName": "Eye", "showWhen": "Right=Icon" }
    ]
  },
  "Left=None": {
    // Icon Left child KHÔNG hiện (showWhen: "Left=Icon" = false)
  }
}
```

→ Figma variant có CHÍNH XÁC các element cần thiết, không HUG/clip, layout clean.

**Quy tắc**: ComponentSet properties **KHÔNG BAO GIỜ** dùng boolean flags (`iconLeft`, `showIcon`, `showLabel`...) khi element optional. PHẢI dùng `children` array với `showWhen` condition matching property axis value. Áp dụng cho:
- Input/Select/Textarea (Left/Right icon options)
- Dropdown Item (with/without icon variant)
- Context Menu Item (conditional icons)
- Bất kỳ component nào có optional visual element

**Lý do**: Figma ComponentSet là **flat property matrix**. Element ẩn (visibility toggle) vẫn chiếm layout space hoặc bị clip. Phải tạo/xóa element theo variant, không toggle visibility. `children` + `showWhen` = proper DOM structure per variant.

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

### #127: HTML to Figma — Brand logo bị dính stroke `foreground` sau swapComponent

**Sai**: Plugin swap icon slot từ Lucide icon (stroke-based: `stroke="currentColor"`, `fill="none"`) sang brand logo (fill-based: `fill="#4285F4"`, no stroke). Figma transfer stroke overrides từ icon cũ sang icon mới theo child name matching (cả hai dùng generic "Vector"). Kết quả: brand logo bị dính stroke `foreground` — trùng màu nền dark mode → icon gần như invisible.

**Đúng**: Sau `swapComponent`, kiểm tra component đích có phải fill-based không bằng cách scan vectors: nếu có `fills` SOLID visible → clear strokes trên instance vectors. KHÔNG dùng flag `isBrandLogo = !findComponent()` vì lần chạy sau component đã tồn tại → flag sai.

**Rule**: Khi swap icon instance, LUÔN kiểm tra cấu trúc thực tế của component đích (fill-based vs stroke-based) thay vì dựa vào context tìm/tạo. Lucide = stroke-based → giữ strokes. Brand logo = fill-based → clear inherited strokes.

### #128: DOM Extraction — Password input value PHẢI mask, KHÔNG hiện plain text

**Sai**: `dom-walker.ts` extract `inputEl.value` trực tiếp cho tất cả input types → password field hiện plain text ("SecureP@ss123") thay vì masked bullets. `raw-dom-walker.ts` có mask code nhưng `extract.ts` dùng `dom-walker.ts` (file khác) → mask code không chạy.

**Đúng**: CẢ HAI walker files (`dom-walker.ts` + `raw-dom-walker.ts`) PHẢI check `getAttribute("type") || inputEl.type` trước khi set Label. Nếu `type === "password"` → `"\u2022".repeat(inputEl.value.length)` (bullet char). Dùng `\u2022` (không phải `•` literal) vì walker code nằm trong template literal string.

**Rule**: Khi thêm input handling logic → PHẢI update CẢ 2 walker files. `extract.ts` dùng `DOM_WALKER_SCRIPT` (dom-walker.ts), `html-to-figma.ts` dùng `RAW_DOM_WALKER_SCRIPT` (raw-dom-walker.ts). Logic PHẢI đồng bộ giữa 2 files.

### #129: Password field — icon Eye/EyeOff toggle pattern

**Sai**: Password input không có icon toggle, hoặc icon không swap đúng trạng thái: khi password ẩn (type="password") phải show Eye icon (nhìn = muốn thấy), khi password hiện (type="text") phải show EyeOff icon (đóng = muốn ẩn).

**Đúng**:
- Web: `const [showPassword, setShowPassword] = useState(false)` → `type={showPassword ? "text" : "password"}` → `iconRight={showPassword ? <EyeOff /> : <Eye />}`
- DOM extraction (filled state): password ẩn mặc định → extract icon = Eye, Label = bullets
- DOM extraction (show-password state): nếu cần → toggle password trước extract → icon = EyeOff, Label = plain text
- Figma: Input variant `Right: "Icon"` → icon instance swap Eye/EyeOff tùy state

**Rule**: Password input LUÔN có `iconRight` toggle. Mặc định `showPassword=false`: `type="password"` + Eye icon. Khi toggle: `type="text"` + EyeOff icon. Đây là UX pattern chuẩn — KHÔNG bỏ qua khi tạo auth forms.

### #130: DOM Extraction — Form input textOverrides key PHẢI match Figma text node name

**Sai**: Walker luôn set `textOverrides["Label"]` cho tất cả components. Nhưng Input/Select/Textarea/Combobox Figma component dùng text node tên **"Value"** (không phải "Label"). Plugin `findOne(n.name === "Label")` → không tìm thấy → text giữ default "Placeholder text" thay vì placeholder/value thực tế từ web.

**Đúng**: Walker detect form input components (`figmaComp === "Input" || "Select" || "Textarea" || "Combobox"`) → dùng `textOverrides["Value"]` thay vì `"Label"`. Plugin có fallback: nếu `"Label"` không tìm thấy → thử `"Value"`, và ngược lại.

**Rule**: textOverrides key PHẢI match tên text node trong Figma component. Khi thêm component mới vào extraction pipeline → kiểm tra tên text node trong component JSON spec (`children[].name`). Form inputs dùng "Value", hầu hết components khác dùng "Label". PHẢI update CẢ 2 walker files + plugin fallback.

### #131: DOM Extraction — SVG icons trong data-figma components bị skip → Button Icon variant luôn "None"

**Sai**: dom-walker.ts line 479 `if (childEl.tagName === "svg") continue;` skip SVG elements hoàn toàn bên trong leaf components. Button `{...figma("Button", { Icon: "None" })}` luôn emit `Icon: "None"` — walker cần override khi phát hiện SVG. Kết quả: Button trên Figma không có icon (Mail, ArrowLeft, etc.).

**Đúng**: Walker KHÔNG skip SVG — extract icon name via `getIconName()`. Khi `figmaComp === "Button"` và có SVG icons + `variants.Icon === "None"` → override `variants.Icon = "Left"`. Cũng scan nested elements (`querySelectorAll("svg")`) cho trường hợp `asChild` (Button > a > svg).

**Rule**: CẢ 2 walker files (dom-walker.ts + raw-dom-walker.ts) PHẢI extract SVG icon data từ data-figma components, KHÔNG BAO GIỜ skip. Button component web luôn emit `Icon: "None"` — walker chịu trách nhiệm detect và override khi có SVG icons.

### #132: DOM Extraction — Mixed content (text nodes + non-inline elements) bị mất text

**Sai**: `<p>Text content <button>click</button></p>` — walker dùng `el.children` (HTMLCollection) chỉ thấy `<button>`, text node "Text content" invisible vì `el.children` không bao gồm text nodes (nodeType 3). `isMixedInline()` return false vì BUTTON không nằm trong INLINE_TAGS. Kết quả: paragraph text hoàn toàn biến mất.

**Đúng**: Thêm section mixed content handler (TRƯỚC section layout frame): detect `el.childNodes` có cả text nodes VÀ non-inline elements → iterate `childNodes` (KHÔNG phải `children`) → text nodes thành text frames, element nodes thành recursive walkDOM. Output: horizontal frame `wrap: true, gap: 4` chứa tất cả children.

**Rule**: LUÔN dùng `el.childNodes` khi cần capture text nodes lẫn element children. `el.children` chỉ trả về element nodes. Phải check pattern này ở CẢ 2 walker files.

### #133: DOM Extraction — Small square frames (icon containers) mất fixed height

**Sai**: json-builder line 307 "Never set fixed height on frames with children" → icon container `size-[48px]` với icon child bên trong chỉ có `width: fixed:48`, KHÔNG có height → parent vertical layout stretch nó thành bar dài. Cùng lúc, `selfAlign: "center"` (từ `mx-auto`) không được pass qua json-builder.

**Đúng**: json-builder detect small square frames (width ≈ height, ≤100px, có children) → giữ `height: fixed:N`. selfAlign được pass qua ở cả convertFrame VÀ convertInstance. Icon container 48×48 giờ có đầy đủ `width:fixed:48, height:fixed:48, selfAlign: center`.

**Rule**: Frames nhỏ hình vuông (icon containers, avatar wrappers) PHẢI giữ fixed height dù có children. Chỉ skip fixed height cho layout frames lớn (content containers, sections). selfAlign PHẢI được propagate ở TẤT CẢ node types.

### #134: DOM Extraction — `getFlexGrow()` không detect horizontal flex fillWidth

**Sai**: `getFlexGrow(el)` chỉ check `flex-grow > 0` cho column flex parent (`flexDirection.startsWith("column")` + child fills). Khi parent là row flex (horizontal), child có `w-full` (width=100% → computed width = parent content width) → `getFlexGrow()` return false → Button instance KHÔNG có `fillWidth: true` → Figma render FIXED width.

**Đúng**: Thêm horizontal flex detection: `if (!isCol && fills) return true`. `getComputedStyle().width` trả về pixels (không bao giờ "100%") nên check `fills = parseFloat(w) >= parentW - 1` (child width ≈ parent content width).

**Rule**: `getFlexGrow()` PHẢI detect fillWidth cho CẢ column VÀ row flex parents. CẢ 2 walker files phải sync logic này.

### #135: DOM Extraction — Visual frame margin-to-padding distorts shape

**Sai**: Walker convert CSS `marginBottom` thành `paddingBottom` trên child frame + tăng height. Khi child là visual frame (rounded, filled, nhỏ ≤100px) — VD: 48×48 icon circle có `mb-sm` (12px) → trở thành 48×60 với paddingBottom 12px → hình tròn bị méo thành oval trên Figma.

**Đúng**: Detect visual frames (radius > 0, has fill, ≤100px) → wrap trong transparent frame thay vì thêm margin vào internal padding. Wrapper có `paddingBottom: extraMargin`, child giữ nguyên shape. Inherit `selfAlign`/`fillWidth` từ child lên wrapper.

**Rule**: KHÔNG BAO GIỜ thêm margin vào internal padding của visual frames (có radius + fill + nhỏ). Luôn wrap. Non-visual layout frames (transparent, large) vẫn ok thêm margin-as-padding.

### #136: DOM Extraction — Mixed inline content `text-align: center` mất center alignment

**Sai**: `isMixedInline` hoặc mixed content handler tạo horizontal frame chứa text runs. Parent CSS `text-align: center` chỉ được map thành `textAlign` trên text nodes — frame KHÔNG nhận `primaryAlign: center`. Kết quả: text runs left-aligned trên Figma dù web center.

**Đúng**: Check `style.textAlign === "center"` → set `primaryAlign: "center"` trên mixed inline/content frames. CẢ 2 code paths (hasColoredInlineChildren return frame, và mixed content handler) PHẢI set primaryAlign.

**Rule**: Khi tạo frame từ mixed inline content, LUÔN propagate parent `text-align` thành frame `primaryAlign`. CẢ 2 walker files phải sync.

### #137: DOM Extraction — `getHugWidth`/`getHugHeight` false positive cho explicit-size elements

**Sai**: Element có `size-[48px]` (explicit 48×48) nhưng nằm trong column flex parent có `align-items: center` → walker thấy "cross-axis không stretch" → return HUG. Plugin set `layoutSizing = "HUG"` → frame co lại từ 48×48 thành 24×24 (icon size). Background circle biến mất vì quá nhỏ.

**Đúng**: Thêm `hasExplicitWidth(el)`/`hasExplicitHeight(el)` — so sánh element dimension với tổng children dimension. Nếu element > content → CSS đã set explicit size → return FIXED, không HUG. VD: 48×48 container chứa 24×24 icon → 48 > 24+0+0+2 → explicit → FIXED.

**Rule**: Trước khi return HUG từ flex context checks, LUÔN verify content không nhỏ hơn element. Nếu element lớn hơn content đáng kể (>2px tolerance) → explicit CSS sizing → FIXED.

### #138: Plugin — `primaryAxisSizingMode = "AUTO"` hardcode cho mọi frame

**Sai**: Plugin `createFrame()` luôn set `primaryAxisSizingMode = "AUTO"` (hug content). Frame 48×48 horizontal chứa icon 24×24 → width co thành 24px. `counterAxisSizingMode = "FIXED"` → height giữ 48. Kết quả: 24×48 thay vì 48×48. `primaryAxisSizingMode` là frame sizing **của chính nó** (khác `layoutSizingHorizontal` = sizing **trong parent**).

**Đúng**: Set `primaryAxisSizingMode`/`counterAxisSizingMode` dựa trên data flags: `hugWidth`/`hugHeight`/`fillWidth`/`fillHeight` → AUTO. Không có flag nào → FIXED (giữ dimensions). Logic map theo layout direction (horizontal: primary=width, counter=height; vertical: ngược lại).

**Rule**: `primaryAxisSizingMode` PHẢI match intent: FIXED cho explicit dimensions, AUTO cho hug/fill. KHÔNG hardcode AUTO cho mọi frame.

### #139: DOM Extraction — Visual frame margin wrapper sizing cứng

**Sai**: Wrapper tạo cho visual frame margin dùng `width: child.width` (FIXED 48px) + `height: child.height + margin` (FIXED 60px). Wrapper nằm trong vertical flex parent (CardHeader) → width FIXED 48 thay vì fill parent → alignment không đúng. Height FIXED 60 thay vì hug content.

**Đúng**: Wrapper dùng `fillWidth: true` (fill parent width) + `hugHeight: true` (hug content) + `counterAlign: "center"` (center child). Xóa `selfAlign` từ child vì wrapper handle centering. Trên Figma: wrapper fill 406px, icon frame 48×48 center bên trong, paddingBottom 12px.

**Rule**: Margin wrappers là transparent layout helpers — LUÔN fill parent width, hug height, center child via counterAlign. KHÔNG dùng fixed dimensions trên wrappers.

### #140: DOM Extraction — `isTextOnly()` bỏ qua visual properties (bg, stroke, radius)

**Sai**: Walker `isTextOnly(el)` check `childElementCount === 0 && textContent.trim()` → return TEXT node ngay lập tức. Element có bg/stroke/radius (VD: step indicator circle `bg-primary rounded-full` chứa text "1") bị extract thành text 28×28, mất hoàn toàn background, border-radius, stroke. Trên Figma: số "1" floating không có circle background.

**Đúng**: Trước khi return text node, check `normalizeColor(bg)`, `getStrokeInfo()`, `extractBorderRadius()`. Nếu có visual → return frame với fill/stroke/radius + text child bên trong. Layout horizontal, primaryAlign/counterAlign center (nếu flex+center). CẢ 2 walker files phải sync.

**Rule**: `isTextOnly()` early return chỉ dành cho pure text leaves. Khi element có visual decoration (bg, stroke, radius) → PHẢI wrap text trong frame để preserve styling. Check visual properties TRƯỚC khi return text node.

### #141: Figma Component — Instance built-in label shows when web renders label separately

**Sai**: Radio Figma component có `"Show Label": ["Yes", "No"]` với default label "Option label". Web `RadioGroupItem` render ONLY radio circle (không có label) + sibling `<Label>` component. DOM extraction tạo `instance Radio` với `{ Value, State }` (thiếu `Show Label`) → default "Yes" → "Option label" text hiện trên Figma instance, kết hợp với sibling text → "Option label 1-10".

**Đúng**: Thêm `"Show Label": "No"` vào `figma()` call trong component: `figma("Radio", { Value, State, "Show Label": "No" })`. Extraction sẽ include variant này → Figma instance ẩn built-in label → chỉ hiện sibling text.

**Rule**: Khi Figma component có label/visibility property mà web render separately → PHẢI set hide variant trong `figma()` data attributes. Check TẤT CẢ components có `Show Label`/`Show Icon`/`hideLabel` properties.

### #142: DOM Extraction — Margin handling chỉ xử lý `type === "frame"`, skip instance/text/icon

**Sai**: Margin-to-padding conversion check `children[i].type === "frame"` → instance (Progress, Button, Input...), text, icon nodes có CSS margin (VD: `mb-md`) bị bỏ qua hoàn toàn. Kết quả: Figma chỉ có parent gap (6px) giữa items thay vì gap + margin (22px). VD: Progress instance có `mb-md` (16px) bị skip → khoảng cách progress–title chỉ 6px.

**Đúng**: Handle TẤT CẢ node types: frame (add padding hoặc wrap visual frame), instance/text/icon/svg (wrap trong transparent frame với margin as padding). Wrapper: fillWidth kế thừa từ child, hugHeight (vertical) hoặc hugWidth (horizontal), padding = extraMargin.

**Rule**: Margin conversion KHÔNG được filter theo node type. Mọi child có CSS margin PHẢI được xử lý — frame add padding trực tiếp, non-frame types wrap trong frame.

### #143: DOM Extraction — Radix `data-state` không phản ánh vào figma variants

**Sai**: `figma("Radio", { Value: "Unchecked" })` hardcode Value tại React render time. Nhưng Radix dynamically set `data-state="checked"` trên DOM element sau render. Walker chỉ đọc `data-figma-variants` (static) → KHÔNG biết item nào đang checked. Kết quả: tất cả Radio/Checkbox/Switch trên Figma đều Unchecked dù web có default selected.

**Đúng**: Walker đọc `el.getAttribute("data-state")` SAU khi parse `data-figma-variants`. Nếu `data-state` tồn tại VÀ variants có `Value` property → override: `"checked"→"Checked"`, `"unchecked"→"Unchecked"`, `"indeterminate"→"Indeterminate"`. Áp dụng cho Radio, Checkbox, Switch (tất cả Radix primitives dùng `data-state`).

**Rule**: Luôn check `data-state` từ DOM để override static figma variants. Radix quản lý state qua data attributes — walker PHẢI đọc DOM state thực tế, KHÔNG tin static props.

### #144: Web — Label-input gap phải là `gap-3xs` (4px), KHÔNG phải `gap-xs` (8px)

**Sai**: Nhiều auth pages (sign-in, sign-up, forgot-password, onboarding) dùng `gap-xs` (8px) cho khoảng cách Label → Input/Select/Textarea. Không match chuẩn ShopPulse design system: `gap-3xs` / `space-y-3xs` (4px).

**Đúng**: TẤT CẢ form field wrappers (`flex flex-col`) chứa Label + Input/Select/Textarea/RadioGroup PHẢI dùng `gap-3xs` (4px). `gap-xs` (8px) chỉ dùng cho horizontal items: checkbox+label, radio+label, icon+text, button groups.

**Rule**: Khi tạo form page mới → label-input gap = `gap-3xs`. Khi review → scan `gap-xs` trong `flex-col` wrappers chứa Label + form component → fix thành `gap-3xs`. Chuẩn này áp dụng TOÀN BỘ sản phẩm, không chỉ auth.

### #144: DOM Extraction — `getFlexGrow()` false positive khi parent horizontal flex chỉ có 1 child

**Sai**: `getFlexGrow()` check `childRect.width ≈ parentContentWidth` trong horizontal flex → return `fillWidth: true`. Nhưng khi parent chỉ có 1 visible child, parent HUG → parent width = child width → match luôn đúng dù child có explicit size (VD: `size-[28px]`). Kết quả: step indicator 28×28 bị FILL thành pill shape trong Figma.

**Đúng**: Thêm kiểm tra số lượng visible siblings. Nếu parent horizontal flex chỉ có 1 visible child VÀ width match → KHÔNG trust match → return false. Yêu cầu explicit signal (`flex-grow > 0` hoặc `width: 100%`) cho single-child case.

**Rule**: `getFlexGrow()` horizontal flex path PHẢI check `visibleSiblings.length > 1` trước khi trust width-match heuristic. Single-child = width match trivially true.

### #145: DOM Extraction — Radix `data-state` override PHẢI giới hạn component type

**Sai**: Walker override `variants.Value` dựa trên `data-state` cho TẤT CẢ components có `Value` property. Nhưng Radix Progress cũng set `data-state` (`"loading"`, `"complete"`, `"indeterminate"`) — khi `value=undefined` (do không pass prop) → `data-state="indeterminate"` → override Value thành `"Indeterminate"` dù `data-figma-variants` set đúng.

**Đúng**: Giới hạn `data-state` override chỉ cho `["Checkbox", "Switch", "Radio"]` — các Radix primitives dùng checked/unchecked/indeterminate states. Progress, Collapsible, Accordion dùng `data-state` khác (`loading`/`open`/`closed`) → KHÔNG override.

**Rule**: `data-state` override trong walker PHẢI whitelist component names. Thêm component mới vào whitelist khi xác nhận dùng checked/unchecked pattern.

### #146: React Component — Progress PHẢI pass `value` prop xuống Radix Root

**Sai**: `function Progress({ className, value, ...props })` destructure `value` ra nhưng KHÔNG pass xuống `ProgressPrimitive.Root`. `...props` không chứa `value` (đã destructured). Radix nhận `value=undefined` → render `data-state="indeterminate"` + `aria-valuenow=null`.

**Đúng**: PHẢI `<ProgressPrimitive.Root value={value} ...>`. Destructured props PHẢI được pass lại nếu component con cần.

**Rule**: Khi destructure prop để dùng trong logic (VD: `figma()`) → vẫn phải pass prop đó xuống underlying primitive. Kiểm tra `aria-valuenow` trên DOM để verify.

### #147: Figma Component — Form select KHÔNG có icon swap property

**Sai**: Select JSON dùng `iconRight: true` + `iconRightName: "ChevronDown"` (native icon+label flow) → plugin tạo "Icon Right" INSTANCE_SWAP property trên ComponentSet. Nhưng web Select chỉ có ChevronDown cố định — không swap icon, không có icon left.

**Đúng**: Dùng `children` array với: (1) `"type": "text"` cho value/placeholder (fillWidth + truncate), (2) `"type": "icon"` cho ChevronDown cố định (16×16). `children` mode KHÔNG tạo swap property. `Value=Filled` variantStyles override full children array (shallow merge) — đổi `textFill` thành `foreground`.

**Rule**: Form select/combobox trigger có icon cố định (chevron) → dùng `children` array, KHÔNG dùng `iconRight`/`iconLeft` flow (tạo swap property không cần thiết). Swap property chỉ cho components cần thay đổi icon theo context.

### #148: Plugin — Stale INSTANCE_SWAP property không tự xóa khi upsert

**Sai**: Plugin upsert thêm/update variants nhưng KHÔNG xóa component properties cũ. Khi JSON đổi từ `iconRight` (tạo swap) sang `children` (không swap) → "Icon Left"/"Icon Right" INSTANCE_SWAP vẫn còn trên ComponentSet dù không có instance nào reference.

**Đúng**: Step 3d cleanup — sau khi link swap properties, scan TẤT CẢ INSTANCE_SWAP properties. Mỗi property check `componentPropertyReferences.mainComponent` trên mọi instance trong mọi variant. Nếu không có reference → `cs.deleteComponentProperty(key)`.

**Rule**: Plugin upsert PHẢI cleanup stale properties. Khi đổi component structure (icon+label → children, bỏ swap) → chạy lại plugin sẽ auto-remove orphan properties.

### #149: Plugin — Absolute children frame: constraints + resize phải set SAU layoutPositioning

**Sai**: `_processChildren` frame path set `frm.resize(w, h)` và `layoutSizingHorizontal` TRƯỚC `layoutPositioning = "ABSOLUTE"`. Auto-layout parent override width (FILL default) → resize bị mất. Constraints không được set → default LEFT/TOP thay vì SCALE.

**Đúng**: (1) Plugin PHẢI set `frm.constraints` từ `cs.constraints` JSON sau khi set `layoutPositioning = "ABSOLUTE"`. (2) PHẢI re-apply `frm.resize(cs.width, cs.height)` SAU `layoutPositioning = "ABSOLUTE"` vì auto-layout có thể override initial resize. (3) Absolute children default `layoutSizingHorizontal/Vertical = "FIXED"` (không FILL).

**Rule**: Absolute positioned children trong `_processChildren`: set `layoutPositioning` → re-apply `resize()` → set `constraints`. Dùng `"constraints": { "horizontal": "SCALE", "vertical": "STRETCH" }` cho proportional scaling (VD: Progress indicator giữ đúng % khi variant width thay đổi).

### #150: DOM Extraction — Playwright click bị decorative blur div chặn trên Mobile

**Sai**: `{ action: "click", selector: "button:has-text('Continue')" }` timeout trên Mobile viewport. Nguyên nhân: decorative absolute-positioned blur div (`bg-primary-10 blur-[80px]`) nằm đè lên button → Playwright action check "element is obscured" → fail. `force: true` cũng không đáng tin cậy.

**Đúng**: Dùng `evaluate` action bypass hoàn toàn Playwright element interception check:
```json
{ "action": "evaluate", "script": "Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Continue').click()" }
```
**KHÔNG dùng** `document.querySelector("button").click()` — quá generic, có thể click nhầm radio button, combobox trigger, v.v.

**Rule**: Khi page có decorative blur/gradient overlays (common trong auth/landing pages) → LUÔN dùng `evaluate` action với `querySelectorAll + textContent match` cho button clicks trong `states.ts`. Generic selectors (`button:has-text`, `querySelector("button")`) không đáng tin cậy khi có absolute-positioned decorative elements.

### #151: DOM Extraction — getFlexGrow single-child phải check parent context

**Sai**: Fix #144 return `false` cho TẤT CẢ single-child horizontal flex → breaks Input `w-full` bên trong `flex items-center` (single email field). `getComputedStyle().width` trả "448px" (computed px) KHÔNG PHẢI "100%" → check `w === "100%"` (line 343) không bắt được Tailwind `w-full`.

**Đúng**: Trước khi return `false` cho single child, check parent context:
1. Parent có `flex-grow > 0` → true (parent stretches → child fills)
2. Parent có `width: 100%` → true (explicit 100%)
3. Parent nằm trong column flex → true (cross-axis stretch by default)
4. Không match → false (parent HUGs, width match trivial)

**Rule**: `getFlexGrow()` single-child horizontal flex: KHÔNG blindly return false. Check parent genuinely fills container (flex-grow, width:100%, hoặc column-flex-stretch) trước. `getComputedStyle().width` LUÔN trả px value cho percentage widths — KHÔNG bao giờ so sánh `=== "100%"`.

### #152: DOM Extraction — Frames FIXED height khi web là HUG (auto-sizing)

**Sai**: Walker `getHugHeight()` chỉ check flex parent cases (row cross-axis content-sized, column primary axis no-grow). Khi element ở row-flex parent với `align-items: stretch` (default) + auto-height parent → cả `getFillHeight` lẫn `getHugHeight` return false → plugin default `layoutSizingVertical = "FIXED"`. Nhiều div content-driven bị FIXED height thay vì HUG.

**Đúng**: Thêm `isContentSizedHeight(el)` fallback: nếu element có visible flow children VÀ height ≈ content height (không explicit CSS height) → `hugHeight = true`. Fallback chạy khi cả `getHugHeight` và `getFillHeight` đều false:
```javascript
hugHeight: getHugHeight(el) || (!getFillHeight(el) && isContentSizedHeight(el)) || undefined
```
Đồng thời fix `getFillHeight` cho row-flex stretch: thêm sibling height comparison — nếu có sibling cao hơn → element đang bị stretch → FILL (không cần parent explicit height).

**Rule**: Mọi frame content-driven trên web đều phải HUG trong Figma. Chỉ FIXED khi có explicit CSS height (h-9, size-[48px]). `isContentSizedHeight` = safety net cho các edge case mà specific checks bỏ sót.

### #153: Plugin — MỌI gap/padding/radius PHẢI bind variable token (kể cả 0px)

**Sai**: Nhiều code path trong cả 2 plugin (HTML-to-Figma + Generate SaaS Template) set gap, padding, border-radius bằng raw number (`frame.itemSpacing = 6`, `frame.cornerRadius = 8`) mà không bind variable. Kết quả: Figma nodes có giá trị đúng nhưng KHÔNG gắn design token → khi thay đổi token, nodes không tự update.

**Đúng**: MỌI frame tạo bởi plugin PHẢI dùng binding functions:
- **HTML-to-Figma**: `bindSpacing(node, field, token, px)` + `bindRadius(node, field, token, px)`. Các function này auto-resolve px → token name (0→"none", 4→"3xs", 8→"xs", 12→"sm", 16→"md", v.v.) qua `SPACING_PX_TO_TOKEN` / `RADIUS_PX_TO_TOKEN`.
- **Generate SaaS Template**: `bindFloat(node, field, varName, px)` / `_bindSp(node, px)` / `_bindRad(node, px)`. Dùng `"spacing/none"` cho 0px, `"border radius/none"` cho 0px radius.

**Code paths đã fix trong HTML-to-Figma**: Icon fallback (line 1332), Image frame (1384), Sonner toast container/content/button (1579-1711), Component fallback (1753), Placeholder (1816).

**Rule**: KHÔNG BAO GIỜ set `itemSpacing`, `paddingTop/Right/Bottom/Left`, `cornerRadius`, `topLeftRadius`, etc. bằng raw number. LUÔN qua binding function. Áp dụng cho TẤT CẢ code paths: component gen, showcase, foundation docs, fallback frames.

### #154: JSON Spec — showcase.sections PHẢI include "installation" khi có installation data

**Sai**: Component JSON có `"installation": { "import": "..." }` nhưng `"showcase": { "sections": ["header", "component"] }` → plugin tạo showcase THIẾU section Installation. Illustration và Logo đều bị lỗi này.

**Đúng**: 3 tiers cho `showcase.sections`:
1. **Standard components** (có `installation` data): `["header", "component", "installation"]` — BẮT BUỘC cả 3 sections
2. **Sub-components** (item/cell, KHÔNG có `installation`): `["header", "component"]` — chỉ 2 sections (VD: Dropdown Item, Cell Row, Cell Header)
3. **Slot components** (internal): `[]` — không tạo showcase

**Rule**: Khi component JSON có field `"installation"` → `showcase.sections` PHẢI chứa `"installation"`. Checklist: grep `"installation"` trong JSON → verify nó có trong `sections` array.

### #155: Web DS — Dynamic Tailwind class `grid-cols-${n}` không work (JIT không scan)

**Sai**: Dùng dynamic class template literal trong Tailwind v4:
```tsx
<div className={`grid grid-cols-${headers.length}`}>
```
JIT compiler không scan dynamic string → class không được generate → layout fallback `grid-cols-1`.

**Đúng**: Dùng inline style cho dynamic grid columns:
```tsx
<div className="grid" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}>
```

**Rule**: Tailwind JIT chỉ scan STATIC class names. Mọi giá trị dynamic (số cột, width, spacing) PHẢI dùng inline `style` attribute. Cũng áp dụng cho: `w-[${x}px]`, `gap-[${y}]`, `max-w-[${z}]`.

### #156: Web DS — Auth breakpoint `hidden lg:flex` = desktop only, KHÔNG phải `!isMobile`

**Sai**: Design System Screen component dùng `!isMobile` để show/hide branding panel:
```tsx
{!isMobile && <BrandingPanel />}
```
Kết quả: tablet (768px-1023px) hiện branding panel — SAI so với actual auth layout.

**Đúng**: Auth layout dùng `hidden lg:flex` — branding panel CHỈ hiện trên desktop (≥1024px). DS phải match:
```tsx
{isDesktop && <BrandingPanel />}  // lg breakpoint = 1024px+
{!isDesktop && <Logo />}          // tablet + mobile show logo in card
```

**Rule**: Khi DS Screen component mô phỏng actual layout → PHẢI check actual layout code (`auth-layout.tsx`, `dashboard-layout.tsx`) cho breakpoint conditions chính xác. KHÔNG suy từ UX logic ("tablet nhỏ nên hide") — check CSS breakpoint classes thực tế.

### #157: Screen JSON spec KHÔNG cần — screens dùng HTML-to-Figma pipeline

**Sai**: Tạo `screen.json` component spec cho Figma plugin generation.

**Đúng**: Screen/page generation dùng HTML-to-Figma DOM extraction pipeline (`tools/figma-extractor/html-to-figma.ts`), KHÔNG dùng JSON spec. Screen component chỉ tồn tại trên web DS page để showcase layout structure. JSON spec chỉ dành cho COMPONENT và FOUNDATION generation.

**Rule**: KHÔNG tạo JSON spec cho Screen, Illustration (branding panel), hoặc bất kỳ layout wrapper nào. Chúng là showcase-only trên web DS. Actual screens → HTML-to-Figma pipeline.

### #158: JSON Spec — Brand SVG mark PHẢI dùng foundation icon reference, KHÔNG dùng frame trống

**Sai**: Logo Mark dùng `"type": "frame"` với `fill: "primary"` → plugin tạo frame trống, SVG vector bị mất khi regenerate.

**Đúng**: (1) Thêm brand SVG vào `foundation-icons.json` với `"brand": true` + gradient fill hardcoded (KHÔNG `currentColor` — gradient không recolor được). (2) Logo JSON dùng `"type": "icon"` với `"iconName": "ShopPulse"` (KHÔNG thêm `iconFill` — giữ gradient gốc) → plugin tạo INSTANCE từ foundation icon component → SVG vector tồn tại vĩnh viễn qua mọi lần upsert.

### #159: Figma Output — MỌI element phải bind variable token + text style + effect style

**Sai**: Plugin tạo Figma UI nhưng một số elements không bind design tokens:
- Gap/padding/radius = raw number assignment (`frame.itemSpacing = 8` KHÔNG bind `spacing/sm`)
- Text = không gắn text style (sau bind rồi lại set `fontSize = 12` → Figma detach style)
- Effect styles (Ring, Shadow, Glow) = không áp dụng hoặc manual + không bind variable

Kết quả: Khi thay đổi token, nodes không tự update. Showcase, foundation docs, icon assets — tất cả bị ảnh hưởng.

**Đúng**: MỌI UI tạo bởi CẢ 2 plugin (Generate SaaS Template + HTML-to-Figma) PHẢI bind design tokens hoàn toàn:

1. **Variable token binding** (gap, padding, radius):
   - **Generate SaaS Template**: JSON spec dùng string tokens (`"gap": "sm"`, `"paddingX": "md"`, `"radius": "lg"`) → plugin gọi `bindFloat(node, field, varName, px)` / `_bindSp()` / `_bindRad()`
   - **HTML-to-Figma**: walker return px values → plugin gọi `bindSpacing(node, field, token, px)` / `bindRadius(node, field, token, px)` (auto-resolve px → token name)
   - Kể cả 0px → `spacing/none` / `border radius/none` (KHÔNG bỏ qua)
   - Áp dụng: component gen, showcase frames, foundation docs, icon assets, fallback frames, toast container — MỌI frame

2. **Text style binding**:
   - MỌI text node PHẢI bind text style via `setTextStyleIdAsync(styleId)`
   - **KHÔNG BAO GIỜ** override `node.fontSize` / `node.fontName` sau khi bind text style — sẽ detach style
   - Nếu cần font khác → chọn text style khác từ foundation (VD: `SP/Caption` 12px thay vì `SP/Overline` 10px uppercase)
   - Đặc biệt cho: showcase text (component name, section header), foundation docs labels, descriptions

3. **Effect style binding**:
   - Ring effects (focus state) → bind via `setEffectStyleIdAsync("Ring/default")` (KHÔNG manual DROP_SHADOW)
   - Shadow effects (card shadow, elevation) → bind via `setEffectStyleIdAsync("Shadow/sm")`
   - Glow effects → bind via `setEffectStyleIdAsync("Glow/primary")`
   - Effect styles PHẢI tồn tại trong Figma (create via `foundation-effects.json`)

**Code paths áp dụng**: (1) Component main frame, (2) Children frames, (3) Indicator children, (4) Addon inner frame, (5) Showcase frames (header, component grid, installation), (6) Foundation docs frames, (7) Icon asset frames, (8) Fallback frames, (9) Sonner toast nodes, (10) Showcase helper frames (`_makeFrame`, `_makeSep`, sub-headers, grid frames — tất cả bind padding 0 + radius 0), (11) Addon shared-edge radius 0 (textLeft/textRight corners = `border radius/none`), (12) `gap: "auto"` paths (bind `spacing/none` trên TẤT CẢ 4 code paths: applyGap, children, addon, main).

**Rule**: Bất kỳ hardcoded giá trị (`itemSpacing = 8`, `cornerRadius = 12`, `fontSize = 14`) mà không bind token/style = lỗi. LUÔN qua binding function. Khi nghi ngờ → trace code từ JSON spec → plugin execution → verify binding function được gọi.

**Rule**: Mọi brand mark/logo SVG PHẢI tồn tại trong foundation icons. Component JSON reference qua `"type": "icon"` children — KHÔNG BAO GIỜ dùng `"type": "frame"` cho visual content cần SVG vectors bên trong (frame trống = mất content khi regenerate).

### #160: JSON Spec — Brand icon `skipIconFill` để giữ gradient fill gốc

**Sai**: Brand icon (ShopPulse logo) trong component JSON dùng `"type": "icon"` children nhưng KHÔNG có `skipIconFill` → plugin `_processChildren` override gradient fill thành `foreground` (white) via `iconFill` fallback.

**Đúng**: Thêm `"skipIconFill": true` trên icon children khi icon là brand mark có fill gradient gốc cần giữ nguyên (KHÔNG override bằng semantic token):
```json
{
  "type": "icon",
  "name": "Mark",
  "iconName": "ShopPulse",
  "skipIconFill": true,
  "iconSize": 28
}
```

Plugin `_processChildren` icon type check `if (!cs.skipIconFill)` trước khi override fills — cả 2 code paths (upsert existing + create new). Áp dụng cho: Logo brand mark, social brand icons (X Twitter, Google, Apple) có fill-based SVG.

### #161: DOM Extraction — Form input Value variant phải detect từ DOM state, không tin figma() static

**Sai**: `figma("Select", { Value: "Placeholder" })` hardcode Value tại React render time. Khi Playwright actions chọn option → text thay đổi nhưng `data-figma-variants` vẫn giữ `Value: "Placeholder"`. Walker tin tuyệt đối static attribute → extract sai variant. Áp dụng cho TẤT CẢ form inputs: Select, Combobox, Input, Textarea.

**Đúng**: Walker PHẢI detect DOM state thực tế SAU khi parse `data-figma-variants`:
- **Select/Combobox**: Scan `<span>` children trực tiếp — nếu KHÔNG có `data-placeholder` attribute VÀ có text content → `variants.Value = "Filled"`
- **Input/Textarea**: Nếu `inputEl.value` có giá trị → `variants.Value = "Filled"`

**Rule**: `figma()` là static annotation — KHÔNG BAO GIỜ tin tuyệt đối cho properties phụ thuộc runtime state. Pattern chung:
1. **Checked state** (Checkbox/Switch/Radio): override từ `data-state` attribute (#143)
2. **Filled state** (Select/Combobox/Input/Textarea): override từ DOM content (#161)
3. **Luôn dual-walker sync**: Fix ở `raw-dom-walker.ts` → PHẢI fix cả `dom-walker.ts` (#128)

**Tại sao mắc lỗi**: Đã biết pattern data-state override (#143) nhưng KHÔNG mở rộng cho form inputs. Khi thêm states với Playwright actions (fill, click option), không verify rằng variant output khớp visual state.

### #162: Size variable collision — heightVar/widthVar từ Pass 1 không bị override bởi compound key

**Sai**: Badge `Size=SM` (Pass 1) set `heightVar: "badge/sm"` (=20px). Compound key `Type=Dot,Size=SM` override `height: 4` nhưng KHÔNG override `heightVar` → `bindSizeVar()` bind variable value (20px) đè lên `resize(4px)` → Dot hiện 4×20 thay vì 4×4.

**Đúng**: Khi component có Type variations với kích thước hoàn toàn khác nhau (Badge vs BadgeRound vs BadgeDot) → PHẢI tạo type-specific size variables:
- `badge/sm`, `badge/default`, `badge/lg` — cho Badge (text pill)
- `badge-round/sm`, `badge-round/default`, `badge-round/lg` — cho BadgeRound (circular)
- `badge-dot/sm`, `badge-dot/default`, `badge-dot/lg` — cho BadgeDot (status dot)

MỌI compound key `Type=X,Size=Y` PHẢI override BOTH `height`/`width` VÀ `heightVar`/`widthVar` — nếu không Pass 1 variable sẽ đè pixel resize.

**Rule**: variantStyles merge là shallow — Pass 1 (single property) apply trước, Pass 2 (compound) apply sau. Nhưng compound key chỉ override fields nó KHAI BÁO. Fields từ Pass 1 mà compound key không nhắc → GIỮ NGUYÊN → gây collision.

**Tại sao mắc lỗi**: Giả định `height: 4` trong compound key đủ để override → quên rằng `heightVar` từ Pass 1 vẫn tồn tại và `bindSizeVar()` sẽ bind variable value SAU resize.

### #163: Form components PHẢI dùng minWidthVar, KHÔNG widthVar

**Sai**: Input/Select/Textarea/Combobox/SearchBox dùng `"widthVar": "width/input"` → bind fixed width 320px → component KHÔNG thể fill container rộng hơn.

**Đúng**: Form components fill container width → dùng `"minWidthVar": "width/input"` để set `minWidth` (sàn tối thiểu) thay vì `width` (cố định). Plugin bind `minWidth` property thay vì `width`.

**Rule**: `widthVar` → FIXED width (Badge, BadgeRound, icon-only Button). `minWidthVar` → MIN width (form components fill container). Chỉ dùng `widthVar` khi component LUÔN cùng 1 width.

**Tại sao mắc lỗi**: Áp dụng size variable binding máy móc cho mọi component mà không xét behavior (fixed vs fill).

### #164: bindSizeVar KHÔNG được có fallback set pixel value

**Sai**: `bindSizeVar(node, "width", varName)` có fallback `node.width = fallbackPx` khi variable không tìm thấy → Figma freeze/hang vì set `width`/`height` trực tiếp có thể xung đột với auto-layout.

**Đúng**: `bindSizeVar()` chỉ làm 1 việc: tìm variable → `setBoundVariable()`. KHÔNG fallback. `resize()` đã set pixel value trước đó. Variable binding chỉ là thêm layer token lên trên.

**Rule**: Size binding functions (bindSizeVar, bindSpacing, bindRadius) KHÔNG BAO GIỜ có fallback pixel assignment. Pixel value đã được set bởi resize()/padding assignment trước đó.

**Tại sao mắc lỗi**: Copy pattern từ bindSpacing có fallback → không nghĩ đến side effect khi set width/height trực tiếp trên auto-layout node.

### #165: Figma Size collection RIÊNG BIỆT với Spacing — scopes WIDTH_HEIGHT

**Sai**: Gộp size variables vào spacing collection hoặc tìm size variables qua `findSpacingVar()`.

**Đúng**: Size là collection riêng biệt (5th collection: raw colors, semantic colors, spacing, border radius, **size**). `scopes: ["WIDTH_HEIGHT"]`. Tìm qua `findSizeVar(name)` với prefix `"size/"`. `findSpacingVar()` CŨNG có fallback tìm `"size/"` để backward compat, nhưng code mới PHẢI dùng `findSizeVar()`.

**Rule**: Size collection chứa component height/width tokens (button heights, input heights, checkbox size, switch track dimensions, badge sizes). Spacing collection chứa gap/padding tokens. KHÔNG MIX.

**Tại sao mắc lỗi**: Tưởng size là subset của spacing vì cùng FLOAT type.

### #166: Size variable KHÔNG bind vào inner children + min/fixed mutual exclusion

**Sai**: (1) Addon innerF (inner input frame) cũng được bind `minWidthVar`/`heightVar` → inner frame có min-width constraint → khi có textLeft/textRight addon trong auto-layout, inner frame tràn ra và cắt UI. (2) Variant comp bind CẢ `widthVar` (fixed) LẪN `minWidthVar` (min) trên cùng axis → xung đột.

**Đúng**:
- Size variable chỉ bind vào **variant comp** — KHÔNG BAO GIỜ bind vào inner children (addon innerF, children frames)
- `minWidthVar` và `widthVar` **mutual exclusive**: có `minWidthVar` → skip `widthVar`. Có `minHeightVar` → skip `heightVar`
- Inner frame trong addon layout → FILL parent, KHÔNG có size constraint riêng

**Rule**: 3 code paths cho size binding: (1) addon comp, (2) indicator, (3) default path. KHÔNG có addon innerF. Min và fixed KHÔNG BAO GIỜ bind cùng axis.

**Tại sao mắc lỗi**: Copy paste binding logic từ outer comp sang innerF mà không nghĩ inner frame chỉ cần FILL. Không nhận ra min + fixed cùng axis là contradiction.

### #167: Dùng sai scope color token cho border — dùng fill/text token thay vì border token

**Sai**: `border-primary` (fill token), `border-foreground/10` (text token), `border-destructive` (fill token) — dùng fill/text color scope cho border property.

**Đúng**:
- Border PHẢI dùng `-border` suffix token: `border-primary-border`, `border-destructive-border`, `border-toast-border`
- Fill token (`primary`, `destructive`, `foreground`) scope cho `bg-*` và `text-*` — KHÔNG dùng cho `border-*`
- Nếu thiếu token → tạo mới với `-border` suffix (VD: `--primary-border: var(--color-violet-500)`)
- Pattern: `-border` token dùng color scale nhẹ hơn fill 1 bậc (VD: fill = violet-600, border = violet-500)

**Áp dụng**: Checkbox, Radio, Slider (hover/checked border), Sonner (toast border), DatePicker (error border)

**Rule**: MỌI `border-{color}` class trong Tailwind PHẢI map tới token có scope `STROKE_COLOR`. Scan toàn bộ `src/` khi thêm border token mới.

**Tại sao mắc lỗi**: Tailwind cho phép `border-primary` compile thành `border-color: var(--color-primary)` — visually gần giống nhưng sai semantic scope. Figma variable scoping (STROKE_COLOR vs ALL_FILLS) không cho phép dùng lẫn.

### #168: Plugin upsert KHÔNG cleanup stale properties khi JSON spec thay đổi

**Sai**: JSON spec bỏ `minWidthVar` hoặc `strokeOpacity` → chạy plugin lại → Figma component vẫn giữ property cũ vì plugin chỉ SET property từ JSON, KHÔNG CLEAR property đã bị xóa.

**Đúng**: Plugin cần `_resetStaleProps(node)` chạy ĐẦU mỗi variant build — reset: minWidth/minHeight (+ unbind variable), strokes (fills + weight + dashPattern), effects, opacity, clipsContent. Sau reset, JSON properties được apply clean.

**Rule**: Mọi property có thể thay đổi giữa JSON versions PHẢI có reset path. `_resetStaleProps()` gọi 1 lần trước `if (_hasAddon)` block.

**Tại sao mắc lỗi**: Upsert logic chỉ focus "apply what's in JSON" mà quên "remove what's NOT in JSON". Additive-only upsert tích tụ stale properties qua nhiều lần chạy.

### #169: Ring token scope KHÔNG được có STROKE_COLOR — chỉ EFFECT_COLOR

**Sai**: `"scopes": ["STROKE_COLOR", "EFFECT_COLOR"]` cho ring, ring-error, ring-brand, ring-success, ring-warning, ring-emphasis.

**Đúng**: `"scopes": ["EFFECT_COLOR"]` — ring tokens chỉ dùng cho focus ring effects (DROP_SHADOW), KHÔNG BAO GIỜ dùng cho border/stroke.

**Rule**: Ring = effect. Border = `-border` suffix tokens (scope `STROKE_COLOR`). Hai concept hoàn toàn tách biệt. Nếu cần border cho element → tạo `-border` token riêng, KHÔNG reuse ring token.

**Tại sao mắc lỗi**: Ring và border visually giống nhau (vòng quanh element) nhưng Figma implement khác nhau — ring = effect style (DROP_SHADOW), border = stroke. Scope lẫn lộn khiến ring token xuất hiện trong stroke picker.

### #170: variantStyles compound key specificity — compound key override simple key

**Sai**: Simple key `"In Card=Yes": { "stroke": "transparent" }` bị compound key `"Type=Error,Show Icon=No": { "stroke": "destructive-border" }` override vì compound (2-key) có specificity cao hơn simple (1-key).

**Đúng**: Compound keys chỉ chứa properties ĐẶC THÙ cho combination đó (VD: `children` array). Fill/stroke/textFill đã define ở simple Type key → KHÔNG lặp lại trong compound. Simple keys khác (In Card, Show Label) sẽ override đúng.

**Rule**: Plugin merge theo specificity: 1-key < 2-key < 3-key. Trong cùng specificity → JSON order (sau override trước). Redundant fill/stroke trong compound keys block simple keys ít property hơn từ override.

**Tại sao mắc lỗi**: Copy-paste compound keys từ base styles — include đầy đủ fill/stroke "cho chắc" mà không biết nó block các simple key override.

### #171: Boolean property trên web DS ExploreBehavior — PHẢI dùng toggle, KHÔNG select

**Sai**: `{ label: "Show Label", type: "select", options: ["yes","no"], value: showLabel ? "yes" : "no", onChange: (v: string) => setShowLabel(v === "yes") }` — render pill buttons cho boolean.

**Đúng**: `{ label: "Show Label", type: "toggle", value: showLabel, onChange: setShowLabel }` — render Switch component.

**Rule**: Property chỉ có 2 giá trị boolean (Yes/No, on/off) → `type: "toggle"`. Property có ≥3 giá trị hoặc non-boolean → `type: "select"` pill buttons. Checkbox đã dùng đúng, Switch và Radio bị sai.

**Tại sao mắc lỗi**: Copy pattern từ select control, quên check control type. Lỗi lặp đi lặp lại nhiều lần.

### #172: Plugin upsert KHÔNG swap icon component — variant sau giữ icon variant trước

**Sai**: Plugin upsert tìm thấy "Icon Left" instance đã tồn tại → chỉ set visible + recolor vectors → KHÔNG swap component. Variant Checked tạo "Icon Left" = Check → variant Indeterminate tìm thấy cùng instance → giữ Check thay vì swap sang Minus.

**Đúng**: Khi `leftExist` là INSTANCE và `_showIconLeft = true`, plugin PHẢI `findIconComponent(_iconLeftName)` → so sánh `mainComponent.id` → nếu khác thì `swapComponent()`. Tương tự cho Icon Right.

**Rule**: Plugin upsert icon flow PHẢI swap component khi icon name thay đổi giữa variants. Áp dụng cho CẢ 4 paths: Icon Left visible, Icon Left hidden, Icon Right visible, Icon Right hidden.

**Tại sao mắc lỗi**: Code ban đầu chỉ xử lý 2 case: (1) tạo mới instance, (2) toggle visibility. Quên case (3) instance đã tồn tại nhưng icon name khác.

### #173: Plugin tạo hidden icon instance cho variants không cần icon — full variant model KHÔNG dùng boolean

**Sai**: Khi `_showIconLeft = false`, plugin tạo hidden instance (`visible = false`) "để giữ swap property consistency". Gây ra: thừa node, layout issues, swap property không cần thiết trên ComponentSet.

```javascript
// SAI — tạo hidden instance
if (leftExist) {
  leftExist.visible = false;
} else {
  var _hiddenLeftComp = findIconComponent(_iconLeftName);
  var _hiddenLeft = _hiddenLeftComp.createInstance();
  _hiddenLeft.visible = false;
  iconTarget.appendChild(_hiddenLeft);
}
```

**Đúng**: Full variant model — tất cả variants show full properties, KHÔNG có boolean show/hide. Variant không cần icon → **xóa icon node**, không hide.

```javascript
// ĐÚNG — xóa hoàn toàn
if (leftExist) leftExist.remove();
```

**Rule**: ComponentSet full variant model: mỗi variant chứa CHÍNH XÁC các elements cần thiết. KHÔNG BAO GIỜ tạo hidden elements "cho consistency". Icon chỉ tồn tại khi variant property yêu cầu (`iconLeft: true`).

**Tại sao mắc lỗi**: Suy nghĩ theo INSTANCE_SWAP boolean property model (swap property cần instance ở tất cả variants). Project này dùng full variant matrix — không có boolean internal properties.

### #174: Mixed native iconRight + children array — duplicate/conflict icon

**Sai**: Combobox JSON dùng `children` array ở base cho Icon Right (ChevronsUpDown), nhưng một số variantStyles thêm `iconRight: true, iconRightName: "Info"` cùng lúc với `children` array cũng có Icon Right. Gây duplicate icon hoặc conflict.

```json
"Right=Icon": {
  "iconRight": true,
  "iconRightName": "Info",
  "children": [
    { "name": "Icon Right", "type": "icon", "iconName": "Info" }
  ]
}
```

**Đúng**: Chọn MỘT approach duy nhất. Khi base dùng `children` → TẤT CẢ variants (không có addon) dùng `children`. Chỉ fallback sang native icon khi addon active (`textLeft`/`textRight` disable children).

```json
"Right=Icon": {
  "children": [
    { "name": "Icon Right", "type": "icon", "iconName": "Info" }
  ]
}
```

**Rule**: KHÔNG BAO GIỜ mix native icon flow (`iconRight`/`iconLeft`) với `children` array icon cùng lúc trong cùng variant. Addon variants (textLeft/textRight) là exception duy nhất — addon disable children → native icon cần thiết.

**Tại sao mắc lỗi**: Copy-paste variantStyles, thêm native icon "cho chắc" mà không biết children đã handle.

### #175: Indicator component tạo INSTANCE_SWAP cho icon cố định — Check/Minus trên Checkbox

**Sai**: Checkbox dùng `iconLeft: true` + `iconLeftName: "Check"/"Minus"` → plugin step 3c scan "Icon Left" instances → tạo INSTANCE_SWAP property → designer có thể swap Check icon thành bất kỳ icon nào. Check/Minus là icon CỐ ĐỊNH theo semantics (checked = ✓, indeterminate = −), không được thay đổi.

**Đúng**: Thêm `"fixedIcons": true` vào component spec. Plugin step 3c skip INSTANCE_SWAP linking khi `compSpec.fixedIcons === true`. Icon instances vẫn tạo đúng (đúng icon per variant), nhưng KHÔNG có swap property trên ComponentSet.

```json
{
  "name": "Checkbox",
  "fixedIcons": true,
  "base": { ... }
}
```

**Rule**: Indicator components có icon biểu thị STATE (Check, Minus, Circle) → `"fixedIcons": true`. Components có icon decorative/customizable (Toggle Bold, Button Search) → KHÔNG set (default swap). Danh sách: Checkbox = fixedIcons, Toggle = swappable, Radio/Switch = không có icon.

**Tại sao mắc lỗi**: Tất cả native `iconLeft`/`iconRight` đều tự tạo INSTANCE_SWAP mà không phân biệt semantic fixed vs decorative swappable.

### #176: Plugin default radius = "lg" (8px) khi JSON không set — components không có rounded bị sai

**Sai**: JSON base không có `radius` → plugin default `merged.radius !== undefined ? merged.radius : "lg"` → apply 8px radius cho components KHÔNG có `rounded-*` trên web (Sheet, Breadcrumb, Label, Separator, Spinner, Logo).

**Đúng**: MỌI component JSON PHẢI explicit set `radius`. Components không có `rounded-*` → `"radius": "none"` (0px, bind `border radius/none`). KHÔNG BAO GIỜ bỏ trống radius.

**Rule**: Kiểm tra web CSS `rounded-*` class trên main container → map: `rounded-sm` = `"sm"`, `rounded-md` = `"md"`, `rounded-lg` = `"lg"`, `rounded-xl` = `"xl"`, `rounded-full` = `"full"`, no rounded = `"none"`.

**Tại sao mắc lỗi**: Assume plugin default 0px khi omit, nhưng thực tế default `"lg"` (8px).

### #177: ABSOLUTE RULE — 100% Foundation Token Binding, ZERO Raw/Manual/Tailwind

**Sai**: Dùng raw hex (`#7C3AED`), Tailwind color scale (`bg-violet-600`, `text-zinc-400`), hardcoded pixel (`gap-[12px]`), hoặc manual font override (`fontSize = 14`) ở BẤT KỲ đâu — web code, Figma JSON, plugin output.

**Đúng**: MỌI visual property — color, spacing, radius, typography, effect — PHẢI 100% bind từ foundation tokens:
- **Web React**: Semantic CSS tokens (`text-primary`, `bg-card`, `border-border`, `gap-xs`, `rounded-lg`, `sp-body-semibold`). KHÔNG Tailwind color scale names (`violet-*`, `zinc-*`, `amber-*`).
- **Figma JSON**: Semantic token names (`"fill": "primary"`, `"stroke": "border"`, `"gap": "xs"`, `"radius": "lg"`, `"textStyle": "SP/Body"`). KHÔNG raw values.
- **Plugin output**: `bindFloat()` / `setTextStyleIdAsync()` / `setEffectStyleIdAsync()` / `setBoundVariableForPaint()`. KHÔNG `node.fontSize = 14` / `node.fills = [{ type: 'SOLID', color: { r:0.48, g:0.22, b:0.93 } }]`.
- **Ngoại lệ duy nhất**: Installation code blocks trong showcase dùng hardcoded `#09090b`/`#f5f5f7` (cosmetic, không phải design token).

**Rule**: Foundation (CSS `index.css` → Figma variables/text styles/effect styles) là SINGLE SOURCE OF TRUTH. Mọi thứ build trên foundation → tự động hỗ trợ Light/Dark mode, token swap, rebrand. Nếu cần color/spacing/font chưa có → TẠO MỚI trong foundation TRƯỚC, rồi mới dùng.

**Tại sao critical**: Raw value = break dark mode, break token swap, break rebrand, break consistency. Một raw value = technical debt lan tỏa toàn bộ system.

### #178: Plugin gap "auto" PHẢI unbind stale itemSpacing variable từ previous runs

**Sai**: JSON spec `"gap": "auto"` → plugin set `itemSpacing = 0` nhưng KHÔNG unbind variable từ previous run → Figma vẫn hiển thị cũ binding `spacing/none` (0px) thay vì Figma Auto layout (space-between).

```javascript
// SAI — không unbind
_bindSp(frame, 0, "auto");
frame.itemSpacing = 0; // Figma Auto
```

**Đúng**: `setBoundVariable(null)` để clear stale binding, rồi mới set itemSpacing. `_resetStaleProps()` KHÔNG unbind `itemSpacing` vì nó gọi `prop !== undefined` check — nên các gap code paths phải explicitly unbind.

```javascript
// ĐÚNG — unbind trước
frame.setBoundVariable("itemSpacing", null);
frame.itemSpacing = 0; // Figma Auto (itemSpacing=0 + unbound)
```

**Rule**: `gap: "auto"` = Figma Auto layout (space-between), KHÔNG bind variable. MỌI 4 code path (`applyGap()`, `_processChildren` frame, addon `innerF`, main `comp`) PHẢI unbind nếu previous state có variable binding. Check `node.variantProperties?.itemSpacing` trước để avoid redundant unbind.

**Tại sao mắc lỗi**: `_resetStaleProps()` skip `itemSpacing` (KHÔNG trong hardcoded list). Khi re-run plugin sau gap value change (`"auto"` ← chưa set), old binding persistent → gap hiển thị sai.

### #179: Multi-component JSON showcase chỉ LAST component build showcase — sub-components must come BEFORE parent

**Sai**: `table.json` chứa `[Table Row, Table]` — plugin line ~4646 check `_isSubComponent = components.length > 1 && ci < components.length - 1` → `ci=0` is subcomponent → skip showcase. Rồi `ci=1` (Table, last) → build showcase với name `"Table — Showcase"`. Khi reorder array hoặc thêm sub-component SAU Table → showcase naming bị sai hoặc build hai lần.

**Đúng**: Multi-component JSON pattern: **sub-component (item) PHẢI index 0, main component (parent) PHẢI LAST** (`components.length - 1`). Plugin logic detect subcomponent = `ci < components.length - 1` → only LAST builds showcase.

```json
{
  "components": [
    { "name": "Table Row" },
    { "name": "Table Header" },
    { "name": "Table Card Row" },
    { "name": "Table Card" },
    { "name": "Table" }
  ]
}
```

Showcase name = `"Table — Showcase"` (last component name).

**Rule**: Multi-component JSON file = 1 Docs page (1 web `*Docs()` function). Thứ tự: tất cả sub-component (item) trước, main component (group) cuối. Showcase build từ component cuối (`ci === components.length - 1`). KHÔNG split sub-component vào file riêng nếu chúng share cùng Docs page — reorder array thay thế.

**Tại sao mắc lỗi**: Assume plugin build showcase cho từng component. Thực tế chỉ last component + web `*Docs()` = 1:1 mapping.

---

### #180: Children frame `imageUrl` not applied — plugin `_processChildren` frame path missing image handling

**Sai**: JSON children frame có `"imageUrl": "https://..."` nhưng plugin chỉ xử lý `cs.fill` → frame rỗng không có ảnh.

**Đúng**: Plugin `_processChildren` frame path PHẢI check `cs.imageUrl` TRƯỚC `cs.fill`:
```js
if (cs.imageUrl) {
  var _cImgHash = await getImageHash(cs.imageUrl);
  frm.fills = [{ type: "IMAGE", imageHash: _cImgHash, scaleMode: cs.imageScaleMode || "FILL" }];
} else if (cs.fill) { ... }
```

**Rule**: `imageUrl` phải được xử lý ở TẤT CẢ code paths: (1) renderPlaceholder, (2) main comp, (3) children frame, (4) addon. Khi thêm tính năng mới cho comp → check tất cả code paths.

**Tại sao mắc lỗi**: `imageUrl` xử lý ở main comp (line 4008) và renderPlaceholder (line 1172) nhưng quên children frame path trong `_processChildren`.

---

### #181: Image/asset source inconsistency across surfaces — DS page uses different CDN than web app

**Sai**: Web app dùng `cdn.dummyjson.com` cho product images, nhưng DS page và Figma JSON dùng `images.unsplash.com` → style ảnh khác biệt hoàn toàn (lifestyle shot vs product-on-white).

**Đúng**: Sau khi chốt image source trong `src/data/`, TẤT CẢ surfaces PHẢI dùng cùng source:
- Web app pages → `cdn.dummyjson.com/product-images/...`
- DS page examples → `cdn.dummyjson.com/product-images/...`
- Figma JSON `imageUrl` → `cdn.dummyjson.com/product-images/...`
- User avatars: `i.pravatar.cc/80?img={N}` everywhere

**Rule**: Khi tạo component có images, LUÔN check `src/data/` để biết app dùng source nào → dùng cùng source + items từ cùng dataset. Áp dụng cho TẤT CẢ asset types: product images, user avatars, icons, brand logos.

**Tại sao mắc lỗi**: DS page tạo trước app data → dùng placeholder Unsplash. Khi app data chốt dummyjson → quên update DS page.

---

### #182: Làm JSON/Figma spec TRƯỚC khi update web component — workflow ngược

**Sai**: Khi cần thêm property mới cho component (VD: Thumbnail thêm `shape` cho Image type), viết `thumbnail.json` Figma spec TRƯỚC rồi mới update web React component + DS page.

**Đúng**: LUÔN LUÔN theo thứ tự:
1. **Web component** (`src/components/ui/thumbnail.tsx`) — thêm prop, types, logic
2. **Web DS page** (`src/pages/design-system/index.tsx`) — thêm Explore controls, examples
3. **JSON spec** (`figma-specs/components/thumbnail.json`) — tham chiếu web để viết
4. **Chạy plugin** → verify trên Figma

**Rule**: Web là source of truth. JSON chỉ là representation của web. KHÔNG BAO GIỜ tạo giá trị mới trong JSON mà web chưa có. Khi cần sửa component → sửa web TRƯỚC, verify hoạt động, rồi mới update JSON.

**Tại sao mắc lỗi**: Thấy JSON file "dễ sửa hơn" vì chỉ là data. Nhưng nếu sửa JSON trước thì không có web reference để cross-check → dễ sai spec.

---

### #183: Ẩn Explore control thay vì filter values — mất property trên Figma

**Sai**: Khi Image type không cần nhiều Color options, ẩn hoàn toàn Color control bằng conditional spread:
```tsx
...(thType !== "image" ? [{ label: "Color", options: colorOptions }] : [])
```
→ Image type mất Color property trên Figma (variant thiếu property = lỗi).

**Đúng**: Control LUÔN visible cho ALL types, chỉ filter values:
```tsx
{ label: "Color", options: thType === "image" ? ["default"] : colorOptions, value: thType === "image" ? "default" : thColor }
```
→ Image type có Color property = "default" (1 value), Icon/Text có đầy đủ 8 values.

**Rule**: Figma ComponentSet yêu cầu ALL variants có ALL properties. Property controls KHÔNG BAO GIỜ bị ẩn — chỉ restrict values per type. Khi type chỉ có 1 valid value → control vẫn hiện với 1 pill button. Reset value về default khi switch type.

**Tại sao mắc lỗi**: Nghĩ rằng control 1 value "trông xấu" nên ẩn đi. Thực tế 1 value = explicit restriction, user biết property tồn tại nhưng bị giới hạn.

---

### #184: Không cho ALL types có ALL properties — component thiếu property trên Figma

**Sai**: Image type không có `shape` prop trong TypeScript interface → Figma Image variants thiếu Shape property. Image type không có `color` prop → thiếu Color property. Dẫn đến ComponentSet variants không đồng nhất.

**Đúng**: MỌI type PHẢI có MỌI property trong TypeScript interface:
```tsx
interface ThumbnailImageProps {
  type?: "image"
  size?: ThumbnailSize
  shape?: ThumbnailShape  // ← PHẢI có, dù default "square"
  color?: ThumbnailColor  // ← PHẢI có, dù chỉ "default" applicable
  src?: string
  ...
}
```
Web logic restrict giá trị (Image color luôn dùng `bg-surface-raised` bất kể color prop), nhưng TypeScript interface PHẢI khai báo đầy đủ.

**Rule**: Component với discriminated union types (Image | Icon | Text) → MỌI variant interface PHẢI khai báo MỌI shared properties. Web logic có thể ignore/restrict values, nhưng interface phải complete để Figma ComponentSet có đủ properties cho mọi variant. DS page Explore controls filter values per type (VD: Image Color = ["default"]).

**Tại sao mắc lỗi**: Nghĩ Image type "không cần" shape/color nên bỏ khỏi interface. Quên rằng Figma ComponentSet yêu cầu mọi variant có mọi property.

---

### #185: Instance children absolute positioning — missing resize() after ABSOLUTE

**Sai**: Plugin set `layoutPositioning = "ABSOLUTE"` cho instance children nhưng KHÔNG gọi `resize()` → Figma có thể reset instance dimensions.

**Đúng**: Gọi `resize(cs.width || inst.width, cs.height || inst.height)` ngay sau `layoutPositioning = "ABSOLUTE"` trên TẤT CẢ 3 code paths (new, swap, update). Frame children đã có resize (line 3213) nhưng instance children thiếu.

**Rule**: Khi set `layoutPositioning = "ABSOLUTE"` trên BẤT KỲ node type nào (frame, instance, icon, text) → LUÔN re-apply `resize()` ngay sau. Auto-layout có thể override initial dimensions khi chuyển sang ABSOLUTE mode.

**Tại sao mắc lỗi**: Chỉ thêm resize cho frame children khi ban đầu implement absolute positioning. Quên rằng instances cũng cần resize vì cùng chịu ảnh hưởng auto-layout override.

---

### #186: Raw HTML element thay vì DS component — unread dot

**Sai**: Notification Item unread dot dùng raw `<div className="size-[6px] rounded-full bg-primary">` thay vì `<BadgeDot>`.

**Đúng**: Dùng `<BadgeDot size="sm">` — DS đã có component cho mọi dot/indicator. Positioning qua `className`.

**Rule**: TRƯỚC khi tạo raw element cho indicator/dot/badge → check DS component library có sẵn component phù hợp không. `BadgeDot` cho status dots, `Badge` cho text labels, `BadgeRound` cho counts. KHÔNG BAO GIỜ raw div cho visual indicators.

**Tại sao mắc lỗi**: Developer tạo component nhanh, dùng raw div cho element nhỏ mà không check DS.

---

### #187: JSON raw frame thay vì instance — phải mirror web component usage

**Sai**: JSON Unread Dot dùng `"type": "frame"` với manual `fill`, `radius`, `width/height`.

**Đúng**: `"type": "instance", "component": "Badge", "variants": { "Type": "Dot", "Size": "SM" }`.

**Rule**: JSON PHẢI mirror web component usage 1:1. Web dùng `<BadgeDot>` → JSON dùng Badge instance `Type=Dot`. Web dùng `<Badge>` → JSON dùng Badge instance. KHÔNG tạo manual frame simulate component visual.

**Tại sao mắc lỗi**: Copy visual spec (size, color, radius) thay vì map đúng component.

---

### #188: Image service CORS — i.pravatar.cc không có CORS headers

**Sai**: Dùng `i.pravatar.cc` imageUrl trong JSON → Figma plugin UI `fetch()` bị browser block (no `Access-Control-Allow-Origin` header) → `getImageHash` fail silently → instance giữ ảnh mặc định.

**Đúng**: Plugin UI có `fetchWithCorsProxy()` fallback qua `corsproxy.io` → `api.allorigins.win`. Manifest cần include proxy domains trong `allowedDomains`.

**Rule**: Khi thêm image service mới vào JSON specs → check CORS headers TRƯỚC (`curl -sI url | grep access-control`). Services đã verify: `cdn.dummyjson.com` ✅ CORS, `avatars.githubusercontent.com` ✅ CORS, `i.pravatar.cc` ❌ no CORS (cần proxy). Plugin UI giờ có auto-fallback.

**Tại sao mắc lỗi**: Assume mọi image service đều có CORS. Web browser `<img>` tag không cần CORS nhưng `fetch()` API cần.

---

### #189: combineAsVariants reset instance fill overrides — imageUrl mất

**Sai**: Plugin set `_inst.fills = [IMAGE]` trên instance children TRƯỚC `combineAsVariants` → Figma reset fill overrides khi combine → instance hiện ảnh mặc định component.

**Đúng**: Plugin có post-combine step: iterate CS variants → tìm instance children có `imageUrl` trong spec → re-apply `_target.fills = [IMAGE]` SAU combine.

**Rule**: Instance fill overrides (imageUrl, custom fills) trên children PHẢI re-apply SAU `combineAsVariants`. Code: section "Post-combine: re-apply imageUrl on instance children" trong `code.js`. Upsert path (no combine) không bị ảnh hưởng.

**Tại sao mắc lỗi**: Không biết `combineAsVariants` reset instance fill overrides — Figma internal behavior không documented.

---

### #190: Item List group instances — imageOverrides PHẢI explicit cho MỌI custom image row

**Sai**: Item List group Row 1 (base variant) không có `imageOverrides` → dựa vào component base `imageUrl` (bị reset bởi #189) → ảnh sai.

**Đúng**: MỌI instance row có custom image PHẢI có `"overrides": { "imageOverrides": { "Avatar": "url" } }` — kể cả Row 1 dùng base variant.

**Rule**: KHÔNG BAO GIỜ dựa vào component base `imageUrl` cho group instances. `imageOverrides` trong `overrides` object hoạt động đáng tin cậy hơn vì nó apply SAU instance creation, target node by name via `findAll`. Pattern: mọi row cần custom image → explicit `imageOverrides`.

**Tại sao mắc lỗi**: Assume Row 1 kế thừa image từ component base tự động.

---

### #191: Image source mismatch — JSON phải match web data 100%

**Sai**: JSON Avatar `imageUrl` dùng `avatars.githubusercontent.com`, web dùng `i.pravatar.cc` → visual khác nhau.

**Đúng**: JSON `imageUrl` PHẢI copy CHÍNH XÁC từ web DS data (`ilOrderData`, `ilUserData`, etc.).

**Rule**: Workflow check: (1) Đọc web DS data arrays, (2) Copy imageUrl CHÍNH XÁC vào JSON, (3) Verify domain match. Avatar=`i.pravatar.cc`, Product=`cdn.dummyjson.com`. Cross-check bảng: web data array → JSON base → JSON variantStyles → JSON group instances (overrides).

**Tại sao mắc lỗi**: Dùng placeholder URL lúc viết JSON thay vì check web source data.

---

### #192: ⛔ CRITICAL — Plugin upsert XÓA children rồi tạo lại → phá hủy TẤT CẢ instances

**Sai**: Plugin upsert variant bằng cách `for (var _urc = comp.children.length - 1; _urc >= 0; _urc--) comp.children[_urc].remove()` — xóa TẤT CẢ children rồi build lại từ đầu. Khi children (text "Label", icon "Icon Left") bị xóa+tạo mới → Figma internal IDs thay đổi → TẤT CẢ instances của component đó trong TOÀN BỘ file mất text/icon overrides. VD: update Button → Dialog, Sheet, Card, Alert Dialog, App Header, Item List, Date Picker, Popover, Drawer — 9 components chứa Button instances bị reset về default.

**Đúng**: Upsert PHẢI giữ nguyên children đã tồn tại. `_processChildren` và native icon+label flow ĐÃ CÓ upsert logic tìm child by name → update in-place. Chỉ cần bỏ dòng `comp.children[_urc].remove()`. Children không còn trong spec sẽ bị xóa bởi cleanup step (line 4210-4212) SAU `_processChildren`.

**Rule**: ⛔ TUYỆT ĐỐI KHÔNG xóa children của variant component khi upsert. Variant node được reuse (giữ ID) — children bên trong CŨNG PHẢI được reuse. Bất kỳ code nào loop `comp.children` để `remove()` trong upsert path = BUG NGHIÊM TRỌNG. Chỉ cleanup step cuối cùng (sau `_processChildren`) mới được xóa children không còn trong spec.

**Impact**: Core components (Button, Badge, Avatar, Input) khi bị lỗi này → cascade reset HÀNG CHỤC components phụ thuộc. Recovery = re-run TẤT CẢ dependent component JSONs.

**Tại sao mắc lỗi**: Design ban đầu "rebuild fresh" cho đơn giản — không lường trước impact lên instances ở components khác.

---

## Cập nhật: 2026-03-15 | 192 lessons
