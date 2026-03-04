# Common Mistakes & Lessons — tn Products

> File tham chiếu dùng chung cho TẤT CẢ products trong `tn/`.
> Trước khi bắt đầu bất kỳ task nào, ĐỌC file này.
> Cập nhật: 2026-03-04

---

## Mục lục

- [A. Figma Plugin](#a-figma-plugin) (#1-#8)
- [B. JSON Spec Files](#b-json-spec-files) (#9-#13)
- [C. Component Docs — Web App](#c-component-docs--web-app) (#14-#22)
- [D. Design Token & Styling](#d-design-token--styling) (#23-#28)
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
