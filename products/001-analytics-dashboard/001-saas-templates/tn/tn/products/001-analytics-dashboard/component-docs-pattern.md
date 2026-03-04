# Component Documentation Pattern — Project 01

> **Reference chuẩn**: SprouX Design System `AlertDialogDocs` (App.tsx:13360-13788)
> **Áp dụng cho**: Tất cả component docs trong `sproux-saas-templates/src/pages/design-system/index.tsx`
> **Cập nhật**: 2026-03-04

---

## Tổng quan

Mỗi component docs function phải có **đủ 10 section** theo đúng thứ tự dưới đây.
Không bỏ section nào. Component đơn giản thì section ngắn hơn, nhưng vẫn phải có.

---

## 10 Section bắt buộc (theo thứ tự)

---

### 1. Header

**Mục đích**: Giới thiệu component — nó là gì, dùng khi nào, khác biệt gì.

**Cách viết nội dung:**
- **Category breadcrumb**: Phân loại component (`Form`, `Overlay`, `Data Display`, `Layout`, `Navigation`, `Feedback`)
- **Title**: Tên component, viết hoa mỗi từ (Title Case)
- **Description**: Chính xác **2 câu**
  - Câu 1: Component làm gì + use case chính (functional, không marketing)
  - Câu 2: Đặc điểm khác biệt hoặc constraint quan trọng nhất

**Ví dụ nội dung chuẩn (AlertDialog):**
> "A modal dialog that interrupts the user with important content and expects a response. Cannot be dismissed by clicking outside."

**Ví dụ nội dung chuẩn (Dialog):**
> "Modal dialog with overlay. Interrupts the user with important content and expects a response."

**Anti-pattern:**
- "A beautiful, modern dialog component" — marketing, không functional
- "Dialog component" — quá ngắn, không nói được use case
- 3+ câu — quá dài, phình header

```tsx
<header>
  <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
    Components / {Category}
  </p>
  <h1 className="text-2xl font-bold font-heading mt-xs">{Component Name}</h1>
  <p className="text-muted-foreground mt-xs max-w-2xl font-body">
    {Câu 1: functional purpose}. {Câu 2: constraint hoặc đặc điểm}.
  </p>
</header>
```

---

### 2. Explore Behavior

**Mục đích**: Playground tương tác — user toggle properties và thấy component thay đổi real-time NGAY TRÊN MÀN HÌNH (không cần click trigger).

**Cách viết nội dung:**

#### Controls panel (phía dưới preview):

Controls chia 2 loại, render theo thứ tự:

1. **Select controls** (pill buttons) — render trước, mỗi control 1 dòng riêng:
   - Cho properties có 2+ options cụ thể (Type, Variant, Side, Size, Icon, Slot)
   - Options viết Title Case: "Desktop", "Mobile", "Left", "Right"

2. **Toggle controls** (Switch) — render sau, **xếp ngang hàng** cùng 1 row:
   - Cho properties boolean ON/OFF (Show Title, Show Footer, Show Icon)
   - Label ngắn gọn: "Show X" hoặc "Enable X"

**Disabled logic**: Khi toggle A tắt → toggle B phụ thuộc vào A phải disabled.
Ví dụ AlertDialog: tắt "Show Action" → "Show Action Secondary" tự disabled.
Ví dụ AlertDialog: chọn Slot = "congratulation" → tắt + disabled tất cả toggles.

#### Static preview (phía trên controls):

> **NGUYÊN TẮC VÀNG**: Explore Behavior PHẢI show **giao diện thật** của component với đầy đủ thuộc tính — user nhìn thấy component ngay lập tức, KHÔNG cần click trigger, KHÔNG cần mở popover/dialog/sheet mới thấy.

**BẮT BUỘC:**
- `pointer-events-none` — chỉ xem, không tương tác
- Hiển thị **mặt component trực tiếp** (dialog face, sheet panel, form field, button...), KHÔNG phải trigger button

**TUYỆT ĐỐI KHÔNG:**
- Render `<AlertDialogTrigger>` rồi bắt user click → SAI
- Render `<Button>Open Dialog</Button>` → SAI
- Render component trong trạng thái đóng, phải click mới thấy → SAI

**CÁCH LÀM ĐÚNG cho từng loại:**

| Loại component | Preview hiển thị cái gì | Cách implement |
|---------------|------------------------|----------------|
| **Dialog / AlertDialog** | Mặt dialog content: title, description, buttons, icon | Dựng div giả với `bg-card border rounded-xl shadow p-xl`, render từng phần theo toggle states |
| **Sheet** | Panel content: header, body, close button | Dựng div giả với `bg-card border rounded-t-xl` hoặc `rounded-l-xl` tùy side |
| **Drawer** | Bottom sheet face: handle bar, header, content, footer | Dựng div giả với `rounded-t-[10px]`, handle bar, content sections |
| **Dropdown / Context Menu** | Menu face: menu items, separators, icons | Dựng div giả với `bg-popover border rounded-md shadow-md p-xs` + menu items |
| **Tooltip / Popover** | Popover face: content area + arrow | Dựng div giả cho popover content |
| **Select** | Trigger button + dropdown list (đã mở) | Render cả trigger + floating list cùng lúc |
| **Form controls** (Input, Checkbox...) | Component thật | Render component trực tiếp (đã visible sẵn, không cần trigger) |
| **Button** | Button thật | Render button trực tiếp |
| **Data Display** (Card, Badge, Table) | Component thật | Render component trực tiếp |

**Ví dụ ĐÚNG — AlertDialog preview:**
```tsx
{/* Dựng mặt dialog trực tiếp — KHÔNG dùng AlertDialogTrigger */}
<div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow pointer-events-none p-xl space-y-lg">
  {showIcon && (
    <div className="size-9 rounded-full border flex items-center justify-center">
      <AlertCircle className="size-4 text-muted-foreground" />
    </div>
  )}
  {showTitle && <h3 className="text-base font-semibold">Are you absolutely sure?</h3>}
  <p className="text-sm text-muted-foreground">This action cannot be undone...</p>
  {showAction && (
    <div className="flex justify-end gap-xs">
      {showCancel && <Button variant="outline" size="sm">Cancel</Button>}
      <Button size="sm">Continue</Button>
    </div>
  )}
</div>
```

**Ví dụ SAI — AlertDialog preview:**
```tsx
{/* SAI: Render trigger → user phải click mới thấy dialog */}
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button>Open Alert</Button>  {/* ← User chỉ thấy button, không thấy dialog face */}
  </AlertDialogTrigger>
  <AlertDialogContent>...</AlertDialogContent>
</AlertDialog>
```

- Preview thay đổi theo mỗi control state:
  - Toggle "Show Title" tắt → title biến mất khỏi preview
  - Select "Type = Mobile" → max-w nhỏ hơn, button layout thay đổi
  - Select "Side = left" → border/rounded thay đổi
  - Select "Slot = congratulation" → illustration thay thế icon + title

**Controls bắt buộc theo loại component:**

| Loại | Select controls | Toggle controls |
|------|----------------|-----------------|
| **Overlay** (Dialog, AlertDialog, Sheet, Drawer) | Type (Desktop/Mobile/...), Slot (nếu có special slot) | Show Close, Show Title, Show Description, Show Footer, Show Icon |
| **Form** (Input, Select, Checkbox, Textarea) | State (default/focus/disabled/error), Size (sm/default/lg) | Required, Disabled |
| **Button** | Variant (6 options), Size (4 options) | Disabled, Loading, With Icon |
| **Data Display** (Card, Badge, Table) | Variant, Size | — |
| **Navigation** (Tabs, Breadcrumb) | Variant | Disabled |

```tsx
<ExploreBehavior controls={[
  // Select controls trước
  { label: "Type", type: "select", options: ["Desktop", "Mobile"], value: type, onChange: setType },
  { label: "Slot", type: "select", options: ["text", "congratulation"], value: slot, onChange: handleSlotChange },
  { label: "Icon", type: "select", options: ["CircleAlert", "AlertTriangle", "Info"], value: iconName, onChange: setIconName, disabled: !showIcon },
  // Toggle controls sau — hiển thị ngang hàng
  { label: "Show Icon", type: "toggle", value: showIcon, onChange: setShowIcon, disabled: isSpecialSlot },
  { label: "Show Title", type: "toggle", value: showTitle, onChange: setShowTitle },
  { label: "Show Action", type: "toggle", value: showAction, onChange: handleShowActionChange },
  { label: "Show Cancel", type: "toggle", value: showCancel, onChange: setShowCancel, disabled: !showAction },
]}>
  <div className="... pointer-events-none">
    {/* Static preview renders component face based on control states */}
  </div>
</ExploreBehavior>
```

---

### 3. Installation

**Mục đích**: Dev copy-paste để setup component ngay.

**Cách viết nội dung:**
- **Dependencies**: Liệt kê chính xác packages cần install (pnpm add)
  - Radix primitive package
  - Utility libs nếu cần (clsx, tailwind-merge, vaul cho Drawer, input-otp, etc.)
- **Import**: Statement đầy đủ TẤT CẢ sub-components có thể dùng
  - Mỗi named export 1 dòng cho dễ đọc
  - Path: `@/components/ui/{component-name}`

**Ví dụ nội dung chuẩn (AlertDialog):**
```
Dependencies: pnpm add @radix-ui/react-alert-dialog clsx tailwind-merge

Import:
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
```

```tsx
<section className="space-y-md">
  <h2 className="text-lg font-semibold font-heading">Installation</h2>
  <div className="space-y-sm">
    <p className="text-xs text-muted-foreground font-body">Dependencies</p>
    <CodeBlock code={`pnpm add @radix-ui/react-alert-dialog clsx tailwind-merge`} />
    <p className="text-xs text-muted-foreground font-body">Import</p>
    <CodeBlock code={`import {\n  AlertDialog,\n  AlertDialogTrigger,\n  ...\n} from "@/components/ui/alert-dialog"`} />
  </div>
</section>
```

---

### 4. Examples

**Mục đích**: Minh họa use cases thực tế. Dev xem + copy code ngay.

**Gồm 2 phần bắt buộc:**

#### Phần A — Static Previews (grid 2 cột)

Mỗi Example card gồm:
- **Title**: 1-3 từ, descriptive. VD: "Basic", "Destructive Confirmation", "Without Description", "Logout Confirmation", "Congratulation Slot"
- **Description**: 1-2 câu, tone action-oriented.
  - Câu 1: Mô tả example này demo cái gì
  - Câu 2 (optional): Khi nào sử dụng pattern này
  - VD: "Simple confirmation dialog with default action button."
  - VD: "Use a destructive variant for delete or dangerous operations."
  - VD: "Illustration slot auto-disables Show Action — slot has its own built-in button. Title hidden, no Cancel."
- **Code**: Code snippet copy-paste được, đầy đủ JSX structure
- **Visual**: Static render mặt component với `pointer-events-none`
  - Overlay components: hiển thị dialog/sheet face trực tiếp (KHÔNG render trigger button)
  - Form components: hiển thị component ở state tương ứng
  - Style: `w-full border border-border rounded-xl bg-card p-xl shadow pointer-events-none`

**Số lượng tối thiểu theo loại:**

| Loại | Examples bắt buộc | Giải thích |
|------|-------------------|------------|
| **Overlay** | Basic, Destructive/Variant, Without Optional Part, Use Case Cụ Thể, Special Slot (nếu có) | Bao quát hết variant + edge case |
| **Form** | Default, With Label, Disabled, Error State, In Form Context | States + context |
| **Button** | Mỗi variant 1 card + Sizes + Icons + Loading | Đầy đủ visual variants |
| **Data Display** | Default, With Rich Content, All Variants | Content flexibility |

#### Phần B — Interactive Demo (cho component cần trigger)

> **KHI NÀO CẦN**: Component phải có trigger mới hiển thị được (overlay, popover, tooltip, dropdown...).
> Phần A chỉ show mặt tĩnh — phần B cho phép user **click thật** để trải nghiệm behavior thật (animation, focus trap, dismiss, swipe...).
>
> **KHI NÀO KHÔNG CẦN**: Component hiển thị trực tiếp không cần trigger (Button, Input, Badge, Card, Table...) → BỎ phần B, chỉ cần phần A.

**Cấu trúc:**
- 1 bordered card với header "Interactive Demo" trên nền `bg-muted/50`
- Body chứa **trigger buttons thật** — user click → component mở thật (có animation, focus trap, dismiss...)
- Mỗi example variant từ phần A có **1 trigger tương ứng** cùng tên
- Button style: `size="sm"`, `variant="outline"` (hoặc `variant="destructive"` cho destructive example)

**Components BẮT BUỘC có Interactive Demo:**

| Component | Lý do | Trigger buttons |
|-----------|-------|-----------------|
| **Dialog** | Cần click trigger mới mở, test focus trap + Esc + overlay click | Edit Profile, Confirmation, Terms, Info |
| **AlertDialog** | Cần test non-dismissible behavior, action buttons | Basic, Destructive, Discard, Logout, Congratulation |
| **Sheet** | Cần test slide animation + overlay + 4 sides | Right, Left, Top, Bottom |
| **Drawer** | Cần test swipe gesture + snap points | Default, With Form, Content Only |
| **Dropdown Menu** | Cần test keyboard navigation + submenu | Default, With Submenu, With Checkbox Items |
| **Context Menu** | Cần test right-click trigger | Right Click Area |
| **Tooltip** | Cần test hover trigger + delay | Hover targets |
| **Popover** | Cần test click trigger + positioning | Default, With Form |
| **Command** | Cần test search + keyboard navigation | Open Command Palette |
| **Combobox** | Cần test search + select + dropdown | Default, With Groups |

**Components KHÔNG cần Interactive Demo (chỉ phần A):**
Button, Input, Textarea, Checkbox, Switch, Radio, Select, Slider, Toggle, Badge, Card, Table, Avatar, Separator, Skeleton, Progress, Alert, Label, Breadcrumb, Tabs, Accordion, Collapsible, Pagination, Scroll Area, Calendar

**Ví dụ nội dung chuẩn (AlertDialog interactive — 5 triggers):**

```tsx
{/* Interactive demos — user click thật để test behavior */}
<div className="rounded-xl border border-border overflow-hidden">
  <div className="px-md py-xs bg-muted/50 border-b border-border">
    <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
  </div>
  <div className="p-lg flex flex-wrap gap-sm">
    {/* Trigger 1: Basic */}
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="outline" size="sm">Basic</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Trigger 2: Destructive */}
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Destructive</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account</AlertDialogTitle>
          <AlertDialogDescription>This will permanently delete your account.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Trigger 3-5: Without Description, Logout, Congratulation */}
    {/* ... mỗi trigger tương ứng 1 example từ phần A */}
  </div>
</div>
```

**Full section template:**

```tsx
<section className="space-y-md">
  <h2 className="text-lg font-semibold font-heading">Examples</h2>

  {/* Phần A: Static previews — component face visible without clicking */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
    <Example title="Basic" description="Simple confirmation with default action." code={`...`}>
      <div className="w-full border border-border rounded-xl bg-card p-xl shadow pointer-events-none">
        {/* Dựng mặt dialog trực tiếp — KHÔNG dùng trigger */}
      </div>
    </Example>
    {/* ... 4-5 more static cards */}
  </div>

  {/* Phần B: Interactive Demo — CHỈ cho component cần trigger */}
  <div className="rounded-xl border border-border overflow-hidden">
    <div className="px-md py-xs bg-muted/50 border-b border-border">
      <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
    </div>
    <div className="p-lg flex flex-wrap gap-sm">
      {/* Trigger buttons thật — click → component mở real */}
    </div>
  </div>
</section>
```

---

### 5. Props

**Mục đích**: API reference đầy đủ cho dev implement.

**Cách viết nội dung:**

- **Intro text**: 1 câu ghi rõ Radix source: "Built on `@radix-ui/react-{primitive}`. Supports all Radix props in addition to the following:"
- **Tách props theo sub-component**: Mỗi sub-component có heading `<h3>` riêng + `PropsTable` riêng
  - Root component: props điều khiển state (open, onOpenChange, modal)
  - Content component: props visual + behavior (forceMount, onEscapeKeyDown, className)
  - Trigger/Action/Cancel: props composition (asChild, variant, size)

**Quy tắc viết mỗi prop row:**
- **Prop name**: camelCase, chính xác tên prop trong code
- **Type**: Union type đầy đủ. VD: `"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"`
- **Default**: Giá trị mặc định chính xác. `"—"` nếu required/optional-no-default
- **Description**: 1 câu ngắn, bắt đầu bằng verb hoặc noun. VD: "Controlled open state", "Callback when open changes", "Merge props onto child element"

**Ví dụ nội dung chuẩn (AlertDialog):**
```
AlertDialog (Root):
  open        | boolean                    | —         | Controlled open state
  onOpenChange| (open: boolean) => void    | —         | Callback when open state changes
  defaultOpen | boolean                    | false     | Initial open state (uncontrolled)

AlertDialogContent:
  forceMount       | boolean                    | —    | Force mounting for animation libraries
  onOpenAutoFocus  | (e: Event) => void         | —    | Called on open auto-focus
  onCloseAutoFocus | (e: Event) => void         | —    | Called on close auto-focus
  onEscapeKeyDown  | (e: KeyboardEvent) => void | —    | Called on Escape key
  className        | string                     | ""   | Additional CSS classes

AlertDialogAction / AlertDialogCancel:
  variant | "default"|"destructive"|"outline"|... | "default"/"outline" | Button visual variant
  size    | "default"|"sm"|"lg"|"icon"            | "default"           | Button size
  asChild | boolean                               | false               | Merge props onto child
```

```tsx
<section className="space-y-md">
  <h2 className="text-lg font-semibold font-heading">Props</h2>
  <p className="text-sm text-muted-foreground font-body">
    Built on <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">@radix-ui/react-alert-dialog</code>.
    Supports all Radix AlertDialog props in addition to the following:
  </p>
  <h3 className="font-semibold text-sm">AlertDialog (Root)</h3>
  <PropsTable rows={[...]} />
  <h3 className="font-semibold text-sm mt-md">AlertDialogContent</h3>
  <PropsTable rows={[...]} />
  <h3 className="font-semibold text-sm mt-md">AlertDialogAction / AlertDialogCancel</h3>
  <PropsTable rows={[...]} />
</section>
```

---

### 6. Design Tokens

**Mục đích**: Dev biết component dùng CSS tokens nào → dễ customize theme.

**Cách viết nội dung:**

- **Intro text**: Ghi rõ 2 nguồn: "Tokens defined in `src/index.css`, sourced from Figma file [tên file]."
- **Table 3 cột**: Token | Value | Usage
  - **Token**: CSS custom property name, font-mono. VD: `--radius-xl`, `--color-card`, `--spacing-xl`
  - **Value**: Giá trị thực. VD: `12px`, `#ffffff`, `24px`
  - **Usage**: Mô tả ngắn token dùng ở đâu trong component. VD: "Content border-radius", "Background color", "Content padding"
- **Chỉ liệt kê tokens component THỰC SỰ dùng** — không dump hết design tokens

**Ví dụ nội dung chuẩn (AlertDialog):**
```
Token              | Value                | Usage
--radius-xl        | 12px                 | Content border-radius
--color-card       | white / zinc-900     | Content background
--color-border     | zinc-200 / zinc-800  | Content border
--spacing-xl       | 24px                 | Content padding (p-xl)
--spacing-lg       | 16px                 | Gap between sections (gap-lg)
--spacing-xs       | 8px                  | Gap between buttons (gap-xs)
--shadow-sm        | 0 1px 2px rgba(...)  | Content shadow
--color-foreground | zinc-950 / zinc-50   | Title text color
--color-muted-fg   | zinc-500             | Description text color
```

```tsx
<section className="space-y-md">
  <h2 className="text-lg font-semibold font-heading">Design Tokens</h2>
  <p className="text-sm text-muted-foreground font-body">
    Tokens defined in <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">src/index.css</code>,
    sourced from Figma file <strong>ShopPulse Design System</strong>.
  </p>
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-border text-left">
          <th className="pr-md py-xs font-semibold">Token</th>
          <th className="pr-md py-xs font-semibold">Value</th>
          <th className="pr-md py-xs font-semibold">Usage</th>
        </tr>
      </thead>
      <tbody>{/* rows */}</tbody>
    </table>
  </div>
</section>
```

---

### 7. Best Practices

**Mục đích**: Hướng dẫn dùng đúng cách + cảnh báo sai phổ biến. Giúp dev chọn component phù hợp.

**Cách viết nội dung:**

- **Tối thiểu 2 subsections**, mỗi subsection 1 cặp Do / Don't
- **Tên subsection**: Đặt theo khía cạnh. Phổ biến: "Content", "Structure", "Layout", "Labeling", "Validation", "Visual"

#### Viết Do:
- Tone: Prescriptive — nói rõ nên làm gì
- Dùng **bold** để highlight key concept
- Cho ví dụ cụ thể nếu cần (e.g., "Delete your account?")
- 1-2 bullet points mỗi Do

#### Viết Don't:
- Tone: Cảnh báo — nói rõ anti-pattern + tại sao sai
- Gợi ý thay thế đúng (VD: "use Dialog or Toast instead")
- 1-2 bullet points mỗi Don't

**Ví dụ nội dung chuẩn (AlertDialog):**

> **Content — Do:**
> - Use a clear title that states the consequence of the action (e.g., "Delete your account?").
> - Make the primary action the **safest option** — Cancel should be prominent.
>
> **Content — Don't:**
> - Don't use vague titles like "Are you sure?" without context — be specific about what will happen.
> - Don't make the destructive action the visually dominant button.
>
> **Structure — Do:**
> - Use Alert Dialog for **destructive action confirmations**, critical decisions, and blocking user flow.
> - Always provide a **cancel/escape** option so the user can back out safely.
>
> **Structure — Don't:**
> - Don't use Alert Dialog for **informational messages** — use Dialog or Toast instead.
> - Don't use for **non-critical confirmations** that don't require user attention.

**Subsection gợi ý theo loại component:**

| Loại | Subsection 1 | Subsection 2 | Subsection 3 (optional) |
|------|-------------|-------------|------------------------|
| **Overlay** | Content (title wording, desc clarity) | Structure (khi nào dùng vs alternatives) | — |
| **Form** | Labeling (label text, placeholder) | Validation (error msg, required indicator) | Layout (form grid, spacing) |
| **Button** | Content (label wording, verb usage) | Visual (variant selection, icon usage) | — |
| **Data Display** | Content (what to show, truncation) | Responsive (mobile behavior) | — |
| **Navigation** | Structure (hierarchy, depth) | State (active indication, disabled) | — |

```tsx
<section className="space-y-md">
  <h2 className="text-lg font-semibold font-heading">Best Practices</h2>
  <div className="space-y-sm">
    <h3 className="font-semibold text-sm">Content</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
      <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-md space-y-xs">
        <p className="text-xs font-semibold text-green-600">Do</p>
        <p className="text-sm text-muted-foreground">Use a clear title that states the consequence.</p>
      </div>
      <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-md space-y-xs">
        <p className="text-xs font-semibold text-red-600">Don't</p>
        <p className="text-sm text-muted-foreground">Don't use vague titles like "Are you sure?" without context.</p>
      </div>
    </div>
  </div>
  {/* Subsection 2: Structure */}
</section>
```

---

### 8. Figma Mapping

**Mục đích**: Bridge giữa Figma design layers → React code. Designer + dev nhìn chung 1 bảng.

**Cách viết nội dung:**

4 cột, mỗi row map 1 layer/property:

| Cột | Viết gì | Ví dụ |
|-----|---------|-------|
| **Figma Property** | Tên layer hoặc property trong Figma | "Overlay", "Content", "Title", "Animation", "ShowIcon" |
| **Figma Value** | Giá trị/styling trong Figma | "Black 50%", "bg-card, border, p-xl, rounded-xl", "heading 4 (Geist/600 20px/24px)" |
| **Code Prop** | Tên React component hoặc prop | "AlertDialogOverlay", "AlertDialogTitle", "data-state", "—" (nếu Figma-only) |
| **Code Value / Notes** | Tailwind classes hoặc ghi chú implementation | "bg-black/50, fixed inset-0, z-50", "typo-heading-4 text-foreground", "Figma-only variants" |

**Rows bắt buộc:**
1. Structural layers (Overlay, Content, Header, Footer)
2. Text layers (Title, Description)
3. Interactive elements (Action, Cancel, Close button)
4. Boolean properties (ShowIcon, ShowTitle, ShowAction — ghi "true / false")
5. Behavior notes (Non-dismissible, Swipe to close)
6. Animation (Open/Close states — data-state attribute)
7. Figma-only variants (dòng cuối — properties chỉ dùng trong Figma để explore)

**Ví dụ nội dung chuẩn (AlertDialog — 10 rows):**
```
Overlay      | Black 50%                              | AlertDialogOverlay | bg-black/50, fixed inset-0, z-50
Content      | bg-card, border-border, p-xl, rounded-xl| AlertDialogContent | max-w-lg, shadow, gap-lg
Title        | heading 4 (Geist/600 20px/24px)        | AlertDialogTitle   | typo-heading-4 text-foreground
Description  | paragraph small (Geist/400 14px/20px)  | AlertDialogDescription | typo-paragraph-sm text-muted-foreground
Button Group | flex, gap-xs, justify-end               | AlertDialogFooter  | flex-col-reverse sm:flex-row sm:justify-end gap-xs
Action       | Button default variant                  | AlertDialogAction  | Wraps Radix in Button via asChild
Cancel       | Button outline variant                  | AlertDialogCancel  | Wraps Radix in Button via asChild
Behavior     | Non-dismissible                         | —                  | Cannot close by clicking overlay (Radix default)
Animation    | Open / Close                            | data-state         | zoom-in-95 / zoom-out-95, fade-in / fade-out
Variants     | Type: Desktop/Mobile, Show Icon, Show Action | —            | Figma-only variants for design exploration
```

```tsx
<FigmaMapping rows={[
  ["Overlay", "Black 50%", "AlertDialogOverlay", "bg-black/50, fixed inset-0, z-50"],
  ["Content", "bg-card, border, shadow", "AlertDialogContent", "max-w-lg, rounded-xl, p-xl, gap-lg"],
  // ... 8-14 rows total
]} />
```

---

### 9. Accessibility

**Mục đích**: Dev implement keyboard + screen reader support đúng chuẩn WCAG.

**Cách viết nội dung:**

Gồm **3 khối thông tin** (hiện render qua `AccessibilityInfo` helper):

#### Khối 1 — Keyboard support (table):

| Viết Key như thế nào | Viết Action như thế nào |
|---------------------|------------------------|
| Tên phím chính xác: `Tab`, `Shift+Tab`, `Enter / Space`, `Escape`, `Arrow Up/Down`, `Home / End` | Hành động cụ thể trong context component. VD: "Move focus between action and cancel buttons", không phải generic "Navigate" |

**Ví dụ chuẩn (AlertDialog):**
```
Tab         | Move focus between action and cancel buttons
Shift+Tab   | Move focus backwards between buttons
Enter/Space | Activate the focused button (action or cancel)
Escape      | Close the dialog (same as cancel)
```

**Ví dụ chuẩn (Select):**
```
Tab         | Focus the trigger button
Enter/Space | Open/close the dropdown
Arrow Up    | Highlight previous option
Arrow Down  | Highlight next option
Home        | Jump to first option
End         | Jump to last option
```

#### Khối 2 — ARIA attributes (bullet list):

Liệt kê cụ thể từng ARIA attribute component dùng:
- `role` attribute → giải thích effect: "role=\"alertdialog\" announces urgent content to screen readers"
- `aria-labelledby` → ghi reference element: "aria-labelledby → AlertDialogTitle for dialog label"
- `aria-describedby` → ghi reference element
- Focus behavior: "Focus is trapped inside and auto-focused on first interactive element"
- Dismiss behavior: "Overlay cannot be clicked to dismiss — users must take explicit action"

**Tone**: Factual, technical. Inline code cho attribute names.

#### Khối 3 — Focus management (prose):

1 đoạn văn mô tả flow focus:
- Focus đi đâu khi component mở (auto-focus element nào?)
- Focus đi đâu khi component đóng (return to trigger)
- Focus có trapped không? Tab/Shift+Tab cycle qua đâu?
- Giải thích WHY trapping quan trọng (prevent background interaction)

**Ví dụ chuẩn (AlertDialog):**
> "When opened, focus moves automatically to the first focusable element (typically the Cancel button). When closed, focus returns to the trigger element. Focus is **trapped** within the dialog — Tab and Shift+Tab cycle only through dialog buttons. This prevents users from accidentally interacting with the page behind the overlay."

```tsx
<AccessibilityInfo
  keyboard={[
    ["Tab", "Move focus between action and cancel buttons"],
    ["Shift+Tab", "Move focus backwards between buttons"],
    ["Enter / Space", "Activate the focused button (action or cancel)"],
    ["Escape", "Close the dialog (same as cancel)"],
  ]}
  notes={[
    "role=\"alertdialog\" announces urgent content to screen readers",
    "aria-labelledby → AlertDialogTitle for dialog label",
    "aria-describedby → AlertDialogDescription for additional context",
    "Focus trapped inside and auto-focused on first interactive element",
    "Overlay cannot be clicked to dismiss — users must take explicit action",
    "Focus returns to trigger element when closed",
  ]}
/>
```

---

### 10. Related Components

**Mục đích**: Giúp dev chọn đúng component — khi nào dùng cái này thay vì cái kia.

**Cách viết nội dung:**

- **2-4 components** liên quan
- Mỗi item gồm: name + description (1-2 câu)
- **Câu 1**: Mô tả kỹ thuật ngắn (behavior, vị trí, tính chất)
- **Câu 2**: Khi nào chọn component đó thay vì component hiện tại

**Tone**: So sánh (comparative) — luôn nói rõ use case khác biệt.

**Ưu tiên liệt kê:**
1. **Alternatives** (thay thế): Components giải quyết use case tương tự nhưng khác behavior
2. **Complements** (kết hợp): Components thường dùng cùng nhau

**Ví dụ nội dung chuẩn (AlertDialog):**
```
Dialog  | For general-purpose modal dialogs that can be dismissed by clicking outside. Use when content is informational, not confirmational.
Sheet   | Slide-out panel from the screen edge. Use for forms, settings, or content that doesn't require confirmation.
Sonner  | For transient, non-blocking notifications. Use for success messages and status updates that don't require user action.
```

**Anti-pattern:**
- "Dialog — Another modal component" — quá vague, không nói khác biệt
- Liệt kê 6+ related components — quá nhiều, dev overwhelmed

```tsx
<RelatedComponents items={[
  { name: "Dialog", desc: "Dismissible modal — can close by clicking outside. Use for informational content." },
  { name: "Sheet", desc: "Slide-out panel from screen edge. Use for forms and settings." },
  { name: "Sonner (Toast)", desc: "Non-blocking notifications. Use when no user action required." },
]} />
```

---

## Checklist trước khi hoàn thành component docs

```
[ ] 1. Header — category + title + 2-sentence description (functional, not marketing)
[ ] 2. Explore Behavior — controls đầy đủ + static preview + disabled logic
[ ] 3. Installation — deps + import (copy-paste ready)
[ ] 4. Examples — 4-6 static cards + interactive demo section
[ ] 5. Props — per sub-component tables + Radix intro text
[ ] 6. Design Tokens — 3-column table, only tokens component uses
[ ] 7. Best Practices — 2+ Do/Don't subsections
[ ] 8. Figma Mapping — 8-14 rows (layers + properties + behavior + animation)
[ ] 9. Accessibility — keyboard table + ARIA list + focus prose
[ ] 10. Related — 2-4 items with comparative descriptions
[ ] Build passes (tsc + vite build)
[ ] Preview matches SprouX quality on localhost
```

---

## Helper Components có sẵn

| Helper | Mô tả |
|--------|-------|
| `ExploreBehavior` | Playground wrapper: preview (trên) + controls panel (dưới). Select → pill buttons, Toggle → Switch ngang hàng |
| `Example` | Example card: title + description + collapsible code + visual children |
| `CodeBlock` | Code display: monospace dark bg + copy button |
| `PropsTable` | 4-column table: Prop / Type / Default / Description |
| `FigmaMapping` | 4-column table: Figma Property / Figma Value / Code Prop / Code Value |
| `AccessibilityInfo` | 2 sections: Keyboard table + Notes bullet list |
| `RelatedComponents` | List: name + description per item |

**Cần tạo thêm (inline JSX hiện tại, chưa có helper):**
- Best Practices Do/Don't cards → viết inline JSX theo template ở section 7
- Design Tokens table → viết inline JSX theo template ở section 6
- Installation section → viết inline JSX theo template ở section 3

---

## Tone & Writing Style tổng quát

| Aspect | Guideline |
|--------|-----------|
| **Tone** | Technical, direct, functional — không marketing, không adjective thừa |
| **Voice** | Active voice. "Use X for Y" thay vì "X can be used for Y" |
| **Length** | Mỗi description 1-2 câu. Mỗi note 1 câu. Không paragraph dài |
| **Formatting** | **Bold** cho key concepts. `code` cho prop names, CSS values, ARIA attributes |
| **Ví dụ** | Luôn cho ví dụ cụ thể khi hướng dẫn. VD: "Delete your account?" thay vì "a clear title" |
| **Anti-pattern** | Luôn ghi alternative đúng khi nói Don't. VD: "use Dialog or Toast instead" |
