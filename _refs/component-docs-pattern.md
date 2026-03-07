# Component Documentation Pattern — Project 01

> **Reference chuẩn**: SprouX Design System `AlertDialogDocs` (App.tsx:13360-13788)
> **Áp dụng cho**: Tất cả component docs trong `sproux-saas-templates/src/pages/design-system/index.tsx`
> **Cập nhật**: 2026-03-04 (Lỗi 16-21 + Table patterns + Card size)

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
- Preview phải **interactive** — user có thể hover/click để thấy trạng thái (hover, active, focus) trực tiếp trên canvas. KHÔNG dùng `pointer-events-none` trên explore preview.
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
| **Form — Input field** (Input, Textarea) | State (default/hover/focus/error/disabled), Size (sm/default/lg), **Value (placeholder/filled/empty)**, Left (none/icon/prefix/textLeft), Right (none/icon/suffix/textRight) | — |
| **Form — Trigger** (Select, Combobox, DatePicker) | State (default/hover/focus/disabled), **Value (placeholder/filled)**, Left (none/icon/prefix/textLeft), Right (none/icon/suffix/textRight) | — |
| **Form — OTP** (InputOTP) | **Tab 1 Group**: Length (4/6/8), Value (empty/partial/filled); **Tab 2 Slot**: Position (first/middle/last), State (default/active/filled/disabled) | Disabled (Tab 1) |
| **Form — Toggle/Check** (Checkbox, Switch, Radio) | Value (unchecked/checked/...), State (default/hover/focus/disabled) | — |
| **Button** | Variant (7 options), Size (4 options), State (default/hover/focus/disabled), Icon (none/left/right/both) | — |
| **Data Display** (Card, Badge, Table) | Variant, Size | — |
| **Navigation** (Tabs, Breadcrumb) | Variant | Disabled |

> **Value control** cho Input field (Input, Textarea) và Trigger (Select, Combobox):
> ```tsx
> const [val, setVal] = useState("placeholder")
> // Input / Textarea
> const valueProp     = val === "filled" ? { value: "name@example.com", onChange: () => {} } : {}
> const placeholderProp = val === "placeholder" ? "Placeholder text" : undefined
> // key={val} BẮTBUỘC — force remount để DOM input reset khi chuyển từ filled sang empty/placeholder
> <Input key={val} placeholder={placeholderProp} {...valueProp} />
>
> // Select
> const [selectVal, setSelectVal] = useState<string | undefined>(undefined)
> const handleValMode = (mode: string) => { setValMode(mode); setSelectVal(mode === "filled" ? "a" : undefined) }
> <Select value={selectVal} onValueChange={setSelectVal}>...</Select>
>
> // Combobox
> const handleCbxValMode = (mode: string) => { setValMode(mode); setVal(mode === "filled" ? "react" : "") }
>
> // InputOTP
> const handleOtpFillMode = (mode: string) => {
>   setOtpFillMode(mode)
>   const len = Number(otpLength)
>   if (mode === "empty")   setOtpValue("")
>   else if (mode === "partial") setOtpValue("123456789".slice(0, Math.floor(len / 2)))
>   else if (mode === "filled")  setOtpValue("123456789".slice(0, len))
> }
> ```

> **Left / Right controls** cho Input và Trigger components:
> ```tsx
> { label: "Left",  type: "select", options: ["none","icon","prefix","textLeft"],  value: left,  onChange: setLeft  },
> { label: "Right", type: "select", options: ["none","icon","suffix","textRight"], value: right, onChange: setRight },
> ```
> Logic tương ứng:
> ```tsx
> const iconLeftProp  = left  === "icon"     ? <Search />    : undefined
> const prefixProp    = left  === "prefix"   ? "$"           : undefined
> const textLeftProp  = left  === "textLeft" ? "https://"    : undefined
> const iconRightProp = right === "icon"     ? <ArrowRight /> : undefined
> const suffixProp    = right === "suffix"   ? "kg"          : undefined
> const textRightProp = right === "textRight"? ".com"        : undefined
> ```

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

#### Group + Item Tabbed Pattern

Components dạng navigation, menu, group có sub-items (Tabs, Dropdown, ContextMenu, Command, Table, Breadcrumb, Pagination, Calendar, DatePicker, NavigationMenu, InputOTP) dùng **tabbed Explore Behavior card**:

- **Tab 1**: Group preview (full component với nhiều items)
- **Tab 2**: Item preview (single item với Type/State controls)

**Instance Sync Rule (BẮT BUỘC):**
- State vars của Tab 2 (item) PHẢI được phản ánh vào MỘT item trong Tab 1 (group)
- Khi user thay đổi state ở Tab 2 → item tương ứng trong Tab 1 PHẢI update theo
- Tab 1 controls = chỉ group-level settings (Show Icons, Compact, Viewport...)
- Tab 2 controls = item-level settings (Type, State, toggles)
- KHÔNG duplicate item-level controls ở Tab 1 — single source of truth ở Tab 2

**Ngoại lệ — Calendar/DatePicker + Day Cell:**
- Day Cell state ở Tab 2 KHÔNG sync vào Calendar/DatePicker Tab 1
- Thay vào đó: override `DayButton` của react-day-picker qua `components` prop → dùng `CalendarDayButton` (map modifiers → `dayCellStyles`)
- Calendar Tab 1 interactive bình thường (click, hover, today, selected, range...)
- DatePicker Tab 1 dùng component gốc `<DatePicker />` / `<DateRangePicker />` (popover)

**Context-Dependent Items — Mock Component Pattern:**
- Khi sub-item phụ thuộc parent context (React Context) → tạo shared **mock component** dùng chung Tab 1 + Tab 2
- Mock replicate exact CSS styles của real component, nhận props thay vì đọc context
- Ví dụ: `OTPSlotMock({ position, state, char })` — Tab 1 group = array of mocks (synced slot dùng Tab 2 state), Tab 2 = single mock
- Components dùng pattern này: Input OTP

**Position Property:**
- Khi sub-item styling thay đổi theo vị trí trong group (border/radius) → thêm **Position** property
- OTP Slot: `first | middle | last` — first có `border-l rounded-l-md`, last có `rounded-r-md`, middle chỉ `border-y border-r`
- Position xác định synced index trong Tab 1: first → 0, middle → floor(len/2), last → len-1

**Anti-pattern:**
- Tab 1 có State pills (default/hover/selected) riêng biệt không liên kết Tab 2 → SAI
- Tab 2 item đổi state nhưng item trong Tab 1 group vẫn giữ nguyên → SAI
- Breadcrumb Item Tab 2 show 2 items (Home + separator + controlled item) → SAI, chỉ show 1 item
- OTP Slot Tab 2 render với `rounded-md border` full (không phân biệt position) → SAI
- Dùng real InputOTPSlot trong Tab 2 (cần OTPInputContext) → SAI, dùng mock

**Tab header style:**
```tsx
<TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
  <TabsTrigger value="group" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm">
    <span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">
      Group Name
    </span>
  </TabsTrigger>
</TabsList>
```

**Item preview (Tab 2):**
- Render standalone (không wrapper card) — giống Command Item pattern
- Ngoại lệ: Breadcrumb/Pagination wrap item trong parent để inherit styles
- `pointer-events-none` wrapper
- Canvas: `px-2xl py-2xl flex items-center justify-center bg-muted/20`

---

### 3. Installation

> ⚠️ **VỊ TRÍ BẮT BUỘC**: `<InstallationSection>` phải đặt ngay sau `</ExploreBehavior>`, TRƯỚC `<section>` Examples.
> Đây là lỗi tái diễn nhiều lần — TUYỆT ĐỐI không đặt Installation sau Props hoặc sau Examples.
> Thứ tự đúng: Header → ExploreBehavior → **Installation** → Examples → Props → ...

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
{/* InstallationSection helper — dùng trực tiếp */}
<InstallationSection
  pkg={["@radix-ui/react-alert-dialog"]}
  importCode={`import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"`}
/>

{/* CodeBlockFlush — code area flush với card, không có rounded corners riêng */}
{/* Dùng bên trong InstallationSection, không dùng standalone */}
<div className="group relative bg-zinc-950 text-zinc-100 text-[13px] p-md overflow-x-auto border-t border-border">
  <pre className="font-mono whitespace-pre-wrap">{code}</pre>
  <button className="absolute top-2 right-2 p-1 rounded bg-zinc-800/80 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
    <Copy className="size-4" />
  </button>
</div>

{/* Structure bên trong InstallationSection:
  - Outer card: border border-border rounded-xl overflow-hidden
  - Label row: px-md py-sm bg-muted/30 (giống Example card header)
  - Code area: CodeBlockFlush — dark bg flush, không padding wrapper trắng
*/}
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

> **NGUYÊN TẮC BẮT BUỘC — Dùng component instance thật:**
> Examples **PHẢI render component gốc** (`<Input>`, `<Button>`, `<Badge>`, v.v.), **KHÔNG dựng div giả** thay thế.
> Mục đích: khi component gốc được cập nhật (style, behavior, props), tất cả examples tự động phản ánh thay đổi đó — không cần update thủ công từng example.
>
> | Loại | Visual trong Example | Cách implement |
> |------|----------------------|----------------|
> | **Form** (Input, Checkbox, Select...) | Dùng `<Input>`, `<Checkbox>`, `<Select>` thật với props tương ứng | `<Input className="border-border-strong" />` cho hover, `<Input disabled />` cho disabled |
> | **Button** | Dùng `<Button>` thật với variant/size props | `<Button variant="destructive">Delete</Button>` |
> | **Data Display** (Badge, Card, Table) | Dùng component thật | `<Badge variant="success">Active</Badge>` |
> | **Overlay hover-triggered** (Tooltip, Popover, HoverCard) | Dùng component thật với `open` prop force hiển thị + `pointer-events-none` — tooltip/popover face luôn visible, **KHÔNG cần mock div** | `<TooltipProvider delayDuration={0}><Tooltip open><TooltipTrigger asChild><Button>Hover</Button></TooltipTrigger><TooltipContent>Label</TooltipContent></Tooltip></TooltipProvider>` |
> | **Overlay blocking** (Dialog, Sheet, AlertDialog, Drawer) | **Ngoại lệ**: dựng div giả vì component chiếm toàn màn hình khi mở — div giả mô phỏng visual face | `<div className="bg-card border rounded-xl p-xl pointer-events-none">` |
>
> **TUYỆT ĐỐI KHÔNG** dựng `<div className="border rounded-lg h-9 px-3 ...">` để simulate Input — đây là div, không phải component, sẽ không cập nhật khi Input component thay đổi.
> **TUYỆT ĐỐI KHÔNG** dựng `<div className="px-sm py-2xs bg-foreground text-background rounded-md">` để simulate Tooltip — dùng `<Tooltip open>` + `<TooltipContent>` thật.

**Số lượng tối thiểu theo loại:**

| Loại | Examples bắt buộc | Giải thích |
|------|-------------------|------------|
| **Overlay** | Basic, Destructive/Variant, Without Optional Part, Use Case Cụ Thể, Special Slot (nếu có) | Bao quát hết variant + edge case |
| **Form** | Default, All Sizes, With Label, use-case cụ thể (Password, Search, URL...), props mới (Icon Left/Right, Prefix, Suffix, Text Left/Right) | Use cases + props — **không** làm example riêng cho states |
| **Button** | Mỗi variant 1 card + Sizes + Icons + Disabled + Loading | Đầy đủ visual variants |
| **Data Display** | Default, With Rich Content, All Variants | Content flexibility |

> **NGUYÊN TẮC**: Examples là **use cases thực tế** — không phải state demos.
> - States (hover, focus, disabled, error) → **chỉ** trong ExploreBehavior controls, KHÔNG làm Example riêng
> - Mỗi Example phải trả lời: "Developer dùng cái này để làm gì?" — nếu câu trả lời chỉ là "để xem state X" thì đừng làm Example
> - Exception: **Disabled** đôi khi có thể là Example nếu nó minh họa một use case rõ ràng (e.g. "Disabled in Form" với context đầy đủ)

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

## Common Mistakes — Lỗi đã gặp, đừng lặp lại

### Lỗi 0: Controls sai thứ tự hoặc sai type

**Vấn đề**: RadioDocs dùng `type: "toggle"` cho "Checked" và đặt nó TRƯỚC `State` (select) — vi phạm 2 quy tắc cùng lúc:
1. Toggle controls phải đến SAU select controls
2. Property có giá trị rõ ràng (unchecked/checked) nên dùng `type: "select"`, không phải toggle

**Quy tắc thứ tự bắt buộc:**
```
Select controls trước → Toggle controls sau
```

**Nhất quán với Checkbox**: Checkbox dùng `Value` (select: unchecked/checked/indeterminate). Radio phải dùng cùng pattern:
```tsx
// ✅ ĐÚNG — select trước, nhất quán với CheckboxDocs
{ label: "Value", type: "select", options: ["unchecked","checked"], value: radioValue, onChange: setRadioValue },
{ label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },

// ❌ SAI — toggle trước select, không nhất quán
{ label: "Checked", type: "toggle", value: checked, onChange: setChecked },
{ label: "State", type: "select", options: [...], value: state, onChange: setState },
```

**Khi nào dùng toggle**: Chỉ khi property thực sự là boolean show/hide không có tên value rõ ràng. VD: "Show Icon", "Show Footer" trong Dialog/AlertDialog.

---

### Lỗi 3: Toggle "pressed" không phải Value riêng — phải nằm trong State

**Vấn đề**: ToggleDocs ban đầu có `Value` select (unpressed/pressed) tách riêng khỏi `State` — sai vì `pressed` là trạng thái visual (giống hover/focus/disabled), không phải data value.

**Phân biệt Value vs State:**

| Component | Value (dữ liệu) | State (visual/interaction) |
|-----------|-----------------|---------------------------|
| Checkbox  | unchecked / checked / indeterminate | default / hover / focus / disabled / error |
| Radio     | unchecked / checked | default / hover / focus / disabled / error |
| Switch    | off / on | default / hover / focus / disabled |
| **Toggle** | *(không có Value riêng)* | **default / hover / pressed / focus / disabled** |

**Lý do Toggle khác**: `pressed` của Toggle không phải dữ liệu được lưu/submit — nó là trạng thái active visual giống như "selected" trong button group. Cùng bản chất với hover/focus/disabled.

```tsx
// ✅ ĐÚNG — pressed nằm trong State
{ label: "State", type: "select", options: ["default","hover","pressed","focus","disabled"], value: state, onChange: setState },

// ❌ SAI — pressed tách thành Value riêng
{ label: "Value", type: "select", options: ["unpressed","pressed"], value: value, onChange: setValue },
{ label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
```

---

### Lỗi 1: ExploreBehavior của group component show nhiều items

**Vấn đề**: RadioDocs's ExploreBehavior show 3 RadioGroupItems thay vì 1 — giống như đang demo full group, không phải demo state của 1 item.

**Quy tắc**:
> ExploreBehavior **luôn chỉ show 1 item** duy nhất của component, kể cả khi component đó là "group" (RadioGroup, ToggleGroup...).
> Mục đích của ExploreBehavior là minh họa **states** (hover, focus, disabled, error) của 1 item — không phải demo full group layout.

**Cách làm đúng cho group components (RadioGroup, ToggleGroup):**
```tsx
// ✅ ĐÚNG — chỉ 1 item, controls là Checked toggle
<RadioGroup value={checked ? "on" : undefined} disabled={isDisabled}>
  <div className="flex items-center gap-xs">
    <RadioGroupItem value="on" id="eb-radio"
      className={cn(isHover && "border-primary/60", isFocus && "ring-[3px] ring-ring outline-none")}
    />
    <Label htmlFor="eb-radio">Option label</Label>
  </div>
</RadioGroup>

// ❌ SAI — show 3 items như demo group
<RadioGroup value={value} onValueChange={setValue}>
  <RadioGroupItem value="option-a" id="eb-radio-a" />  {/* item 1 */}
  <RadioGroupItem value="option-b" id="eb-radio-b" />  {/* item 2 */}
  <RadioGroupItem value="option-c" id="eb-radio-c" />  {/* item 3 */}
</RadioGroup>
```

**Examples section** (section 4) mới là nơi demo full group với nhiều items.

---

### Lỗi 2: InstallationSection bị mất khi edit nhiều bước

**Vấn đề**: Khi edit RadioDocs theo 2 bước:
- Bước 1: Thêm `<InstallationSection>` vào sau ExploreBehavior ✅
- Bước 2: Edit tiếp phần Examples/Props — dùng `old_string` từ bản **trước bước 1** (chưa có InstallationSection) → string khớp được nhưng vô tình xóa mất InstallationSection vừa thêm ❌

**Quy tắc**:
> Sau mỗi bước edit, **re-read file** trước khi edit tiếp để đảm bảo `old_string` của lần sau khớp với **trạng thái hiện tại** của file, không phải trạng thái cũ.

**Checklist khi edit nhiều bước:**
```
[ ] Sau bước 1 edit → read lại section vừa chỉnh
[ ] Lấy old_string từ nội dung đã read (không copy từ memory)
[ ] Verify InstallationSection còn ở đúng vị trí (section 3) sau mỗi bước
[ ] Sau khi xong hoàn toàn → grep "InstallationSection" để confirm tất cả component docs đều có
```

---

### Lỗi 4: Example dùng shared state → các examples ảnh hưởng lẫn nhau

**Vấn đề**: SliderDocs có `const [val, setVal] = useState([50])` dùng chung cho cả ExploreBehavior, "With Label and Value", và "Interactive" example. Khi user kéo slider ở "With Label and Value" → "Interactive" cũng thay đổi theo.

**Quy tắc**:
> Example nào cần state riêng (interactive live display) → phải dùng **state độc lập**, không dùng chung state của `XxxDocs`.
> Giải pháp: extract thành **sub-component** riêng với `useState` của nó.

**Phân loại state trong một Docs function:**

| State | Dùng cho | Dùng chung được không? |
|-------|----------|----------------------|
| `state` (hover/focus/disabled) | ExploreBehavior controls | ✅ Chỉ dùng trong ExploreBehavior |
| `value` / `val` | ExploreBehavior preview | ✅ Chỉ dùng trong ExploreBehavior |
| State cho Example interactive | Example cards | ❌ Phải độc lập — extract sub-component |

**Cách làm đúng:**
```tsx
// ✅ ĐÚNG — sub-component với state riêng
function SliderWithLabel() {
  const [vol, setVol] = useState([60])
  return (
    <div className="w-full max-w-sm space-y-xs">
      <div className="flex justify-between">
        <Label>Volume</Label>
        <span className="text-sm text-muted-foreground">{vol[0]}%</span>
      </div>
      <Slider value={vol} onValueChange={setVol} max={100} step={1} />
    </div>
  )
}

// Dùng trong Example:
<Example title="With Label and Value" ...>
  <SliderWithLabel />
</Example>

// ❌ SAI — dùng val từ SliderDocs → đi chung với Interactive example
<Example title="With Label and Value" ...>
  <Slider value={val} onValueChange={setVal} />  {/* val shared với Interactive! */}
</Example>
```

**Khi nào cần extract sub-component:**
- Example có live display (số, text) cập nhật khi tương tác
- Example là controlled component (Slider, Input, Select...)
- 2+ examples cần state độc lập nhau

**Khi nào KHÔNG cần:**
- Example là uncontrolled (`defaultValue`) và không hiển thị live value
- Example chỉ show static state (disabled, error...)

---

### Lỗi 5: Form trigger component thiếu `hover` state — không nhất quán với Select

**Vấn đề**: ComboboxDocs ban đầu chỉ có State `["default","focus","disabled"]` — thiếu `hover`. Select (component tương tự) có đủ 4 states `["default","hover","focus","disabled"]`. Không nhất quán → docs thiếu ví dụ hover, FigmaMapping thiếu row.

**Quy tắc**:
> Mọi Form component dùng **trigger element** (button, input field) đều phải có đủ 4 states cơ bản.
> Khi viết docs cho component mới, **so sánh với component tương tự đã có** để đảm bảo nhất quán.

**State options chuẩn cho từng nhóm:**

| Nhóm | State options bắt buộc | Ghi chú |
|------|------------------------|---------|
| **Trigger button** (Combobox, DatePicker) | `["default","hover","focus","disabled"]` | hover: `border-border-strong`, focus: `ring-[3px] ring-ring` |
| **Input field** (Input, Textarea, Select) | `["default","hover","focus","disabled","error"]` | thêm error vì có `aria-invalid` |
| **Toggle/Checkbox/Switch** | `["default","hover","focus","disabled"]` | Toggle thêm `pressed` sau hover |
| **Slider** | `["default","focus","disabled"]` | Không có hover state trên track |

**Cách simulate hover cho trigger button (Combobox):**
```tsx
// Simulate hover — dùng border-border-strong (nhất quán với Select)
className={cn(isHover && "border-border-strong", isFocus && "ring-[3px] ring-ring outline-none")}
```

**Checklist khi viết state options cho Form component:**
```
[ ] Tìm component tương tự đã có (Select, Input, Checkbox...)
[ ] So sánh State options — phải nhất quán cùng nhóm
[ ] Mỗi state trong options → phải có row trong FigmaMapping
[ ] KHÔNG làm Example riêng cho state — states thuộc ExploreBehavior (xem Lỗi 7)
```

---

### Lỗi 6: Combobox thiếu Interactive Demo — bỏ sót requirements table

**Vấn đề**: Pattern có bảng liệt kê rõ "Components BẮT BUỘC có Interactive Demo" gồm Combobox, nhưng khi viết ComboboxDocs lần đầu vẫn không có phần này.

**Quy tắc**:
> Trước khi hoàn thành bất kỳ component docs nào, **check lại bảng requirements** trong section 4 của pattern:
> - Components BẮT BUỘC có Interactive Demo
> - Components KHÔNG cần Interactive Demo

**Lý do Combobox cần Interactive Demo**: Phần A (static examples) chỉ show mặt trigger đóng — user không thấy được dropdown list, search behavior, select behavior. Interactive Demo cho phép click thật để trải nghiệm.

**Template Interactive Demo cho Combobox:**
```tsx
<div className="rounded-xl border border-border overflow-hidden">
  <div className="px-md py-xs bg-muted/50 border-b border-border">
    <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
  </div>
  <div className="p-lg flex flex-wrap gap-sm">
    <Combobox options={frameworks} placeholder="Select framework..." />
    <Combobox options={languages} placeholder="Pick a language..." searchPlaceholder="Filter languages..." />
    <Combobox options={[]} emptyText="No items available." placeholder="Empty list..." />
  </div>
</div>
```

---

### Lỗi 7: Examples duplicate states từ ExploreBehavior — nhầm lẫn mục đích 2 section

**Vấn đề**: InputDocs và ComboboxDocs ban đầu có các examples "Hover State", "Focus State", "Disabled", "Error State" — mỗi example chỉ show component ở 1 state cụ thể. Đây là duplicate với ExploreBehavior (user đã có thể tự toggle states), làm phình section Examples với nội dung không có giá trị thêm.

**Phân biệt rõ mục đích 2 section:**

| Section | Mục đích | Nội dung |
|---------|----------|----------|
| **ExploreBehavior** | Playground tương tác — user toggle thấy states | Size, State, Left, Right controls |
| **Examples** | Use cases thực tế — dev copy code để dùng | Password, Search, URL input, In Form, etc. |

**Quy tắc**:
> Examples KHÔNG làm riêng cho từng state (hover, focus, disabled, error).
> States được cover đủ bởi ExploreBehavior controls.
> Example phải trả lời: "Developer dùng cái này để build gì?" — không phải "Cái này trông thế nào khi hover?"

**Examples tốt cho Form components:**
```
✅ Default              — cơ bản nhất, copy-paste
✅ All Sizes            — demo 4 kích thước cùng lúc
✅ With Label           — pattern labeling đúng cách
✅ Password             — type="password" + iconRight
✅ Search               — iconLeft + searchable context
✅ URL Input            — textLeft="https://"
✅ Currency             — prefix="$" hoặc textLeft="USD"
✅ With Button          — composition pattern

❌ Hover State          — đã có trong ExploreBehavior State control
❌ Focus State          — đã có trong ExploreBehavior State control
❌ Disabled             — đã có trong ExploreBehavior State control (trừ khi cần context đặc biệt)
❌ Error State          — đã có trong ExploreBehavior State control
```

**ExploreBehavior cho Form components phải bổ sung Left/Right controls:**
```tsx
// Input và Trigger-based form components (Combobox, DatePicker)
{ label: "Left",  type: "select", options: ["none","icon","prefix","textLeft"],  value: left,  onChange: setLeft  },
{ label: "Right", type: "select", options: ["none","icon","suffix","textRight"], value: right, onChange: setRight },
```
Mục đích: user khám phá tất cả decoration props ngay trong ExploreBehavior, không cần click vào từng Example.

---

### Lỗi 8: JSX string attribute không hỗ trợ backslash escape

**Vấn đề**: Dùng `\"` để escape dấu ngoặc kép trong JSX attribute string — Vite/Babel báo lỗi parse "Expecting Unicode escape sequence \uXXXX":
```tsx
// ❌ SAI — JSX string attribute không hỗ trợ backslash escape
<Example description="Use type=\"password\" for sensitive fields." ...>

// ✅ ĐÚNG — dùng single quotes bên trong double-quoted attribute
<Example description="Use type='password' for sensitive fields." ...>
```

**Quy tắc**:
> Trong JSX attribute string (double-quoted), KHÔNG dùng `\"`. Thay bằng:
> 1. `'single quotes'` bên trong → đơn giản nhất
> 2. Rephrase tránh dấu ngoặc kép → "for password fields" thay vì "for type=\"password\" fields"

**Áp dụng cho**: `description`, `title`, `placeholder`, bất kỳ JSX string prop nào cần chứa dấu `"`.

---

### Lỗi 9: "Disabled Item" trong group component — khi nào là Example hợp lệ

**Vấn đề**: Sau khi áp dụng Lỗi 7 (bỏ state examples), có thể nhầm bỏ luôn "Disabled Item" của RadioDocs — nhưng example này là **use case** chứ không phải state demo.

**Phân biệt:**

| Example | Loại | Giữ hay bỏ? |
|---------|------|-------------|
| `Disabled Group` — toàn bộ group disabled | State demo | ❌ Bỏ |
| `Disabled Item` — 1 item disabled trong group còn lại interactive | Use case (Enterprise plan, coming soon...) | ✅ Giữ |
| `Hover State` — component ở hover | State demo | ❌ Bỏ |

**Quy tắc kiểm tra**:
> Đặt câu hỏi: "Một developer sẽ dùng pattern này trong app thật không?"
> - `<RadioGroup disabled>` — không, disabled cả group không phải pattern thực tế → bỏ
> - `<RadioGroupItem value="enterprise" disabled />` trong group — có, đây là pattern "unavailable option" thực tế → giữ

---

### Lỗi 10: Sai thứ tự section — Installation đặt sau Examples/Props

**Vấn đề**: DatePickerDocs đặt InstallationSection SAU Examples và Props — sai hoàn toàn thứ tự 10 section bắt buộc.

**Thứ tự đúng:**
```
1. Header
2. Explore Behavior
3. Installation      ← PHẢI ở đây
4. Examples          ← không phải ở đây
5. Props
6. Design Tokens
7. Best Practices
8. Figma Mapping
9. Accessibility
10. Related Components
```

**Quy tắc**:
> Sau khi viết/refine một component docs, grep "InstallationSection" rồi đếm line số để verify nó nằm TRƯỚC section Examples.
> Checklist: Header → ExploreBehavior → **InstallationSection** → `<section>Examples` → `<section>Props`

---

### Lỗi 11: DatePicker/Calendar — ExploreBehavior và Examples phải là interactive, không phải static calendar face

**Vấn đề ban đầu**: DatePickerDocs dùng pattern "Form — Trigger" (chỉ show trigger button với pointer-events-none).
**Sửa sai tiếp theo (sai)**: Dùng pointer-events-none + static open calendar face.
**Pattern đúng cuối cùng**: Render component thật, tương tác được — không pointer-events-none.

**Phân loại đúng:**

| Component | ExploreBehavior | Examples (Phần A) |
|-----------|-----------------|-------------------|
| **Calendar** | `<Calendar />` trực tiếp, interactive, có mode/showOutsideDays controls | `<Calendar />` trực tiếp |
| **DatePicker** | `<DatePicker />` trigger thật, user bấm mở calendar được | `<DatePicker />` trigger thật |
| **DateRangePicker** | `<DateRangePicker />` trigger thật, user bấm mở được | `<DateRangePicker />` trigger thật |
| Select, Combobox | Trigger + dropdown list đã mở (pointer-events-none) | Trigger only |
| Dialog, Sheet | Dialog/Sheet face trực tiếp (pointer-events-none) | Dialog/Sheet face |

**Lý do DatePicker/Calendar khác**: User cần tương tác thật (chọn ngày, thấy behavior) — static face không có giá trị vì calendar không có trạng thái "open" rõ ràng như Dialog.

```tsx
// ✅ ĐÚNG — render component thật, interactive
function DatePickerDocs() {
  return (
    <ExploreBehavior controls={[...]}>
      <DatePicker />  {/* bấm được, calendar mở thật */}
    </ExploreBehavior>
  )
}

// ❌ SAI — pointer-events-none, không tương tác được
<div className="pointer-events-none">
  <DatePicker />
</div>

// ❌ SAI — static calendar face open (không thật)
<div className="pointer-events-none space-y-sm">
  <DatePicker />
  <div className="border rounded-xl bg-popover">
    <Calendar mode="single" />
  </div>
</div>
```

**Examples (Phần A) cho DatePicker** — show real interactive trigger:
```tsx
// ✅ ĐÚNG — dùng sub-component với state riêng
function DatePickerControlledExample() {
  const [date, setDate] = useState<Date | undefined>()
  return <DatePicker date={date} onDateChange={setDate} />
}
<Example title="Single Date" ...>
  <DatePickerControlledExample />
</Example>

// ❌ SAI — static calendar face (không phản ánh DatePicker component thật)
<Example title="Single Date" ...>
  <div className="pointer-events-none">
    <Calendar mode="single" />
  </div>
</Example>
```

**Calendar docs khác DatePicker docs**: CalendarDocs show `<Calendar />` trực tiếp vì Calendar là inline component — không cần trigger. DatePickerDocs show `<DatePicker />` trigger vì đó chính là component user sẽ dùng.

---

### Lỗi 12: Tailwind v4 `aria-selected:` variant không override `text-foreground` — dùng CSS trực tiếp

**Vấn đề**: Trong react-day-picker Calendar, cố gắng làm text trắng cho selected day bằng Tailwind:
```tsx
// ❌ Không hoạt động — aria-selected:text-white thua text-foreground
day_button: cn(
  buttonVariants({ variant: "ghost" }),   // set text-ghost-foreground (zinc-500/400)
  "aria-selected:text-primary-foreground",  // thua
  "aria-selected:!text-primary-foreground", // !important — vẫn thua
  "aria-selected:text-white",               // thua
)
```

**Root cause**: Tailwind v4 generate CSS utilities theo thứ tự: `text-foreground` (base utility) được output SAU `aria-selected:text-white` (variant utility) trong một số trường hợp → cascade override. Thêm vào đó, ghost variant set `text-ghost-foreground` trực tiếp qua `buttonVariants()` — không thể override bằng Tailwind variant.

**Giải pháp đúng — CSS rule trực tiếp trong `index.css`:**
```css
/* Calendar — selected day button color overrides */
[data-slot="calendar"] button[aria-selected="true"] {
  background-color: var(--primary);
  color: #ffffff;
}
[data-slot="calendar"] button[aria-selected="true"]:hover {
  background-color: var(--primary-hover);
  color: #ffffff;
}
```

**Tại sao CSS trực tiếp thắng**: Selector `[data-slot="calendar"] button[aria-selected="true"]` có specificity cao hơn bất kỳ Tailwind utility nào (1 attribute + 1 element + 1 attribute = 0,2,1 vs 0,1,0 của Tailwind).

**Nguyên tắc tổng quát**:
> Khi Tailwind variant (`aria-*:`, `data-*:`) không thể override màu từ một variant component (`buttonVariants`), **đừng thêm `!important` vào Tailwind** — dùng CSS rule trực tiếp trong `index.css` với `[data-slot]` selector để có specificity cao hơn.

**Áp dụng thêm**: Bỏ ghost variant, viết styles trực tiếp khi cần full control:
```tsx
// ✅ ĐÚNG — không dùng buttonVariants, viết direct styles
day_button: cn(
  "inline-flex items-center justify-center whitespace-nowrap transition-colors",
  "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
  "disabled:pointer-events-none disabled:opacity-50",
  "size-[48px] rounded-sm p-xs font-normal",
  "bg-transparent text-foreground hover:bg-ghost-hover",
  // ← selected override handled in index.css CSS rule
),
```

---

### Lỗi 13: `space-y-*` không tạo vertical layout cho inline elements — dùng `flex flex-col`

**Vấn đề**: Trong ExploreBehavior toggle controls, dùng `space-y-xs` để stack Label trên Switch nhưng chúng vẫn hiển thị ngang:
```tsx
// ❌ KHÔNG hoạt động — space-y dùng margin-top, không force block context
<div className="space-y-xs">
  <Label>Show Outside Days</Label>
  <Switch checked={...} />
</div>
```

**Root cause**: `space-y-xs` thêm `margin-top` vào child thứ 2 trở đi, nhưng `<label>` và `<Switch>` là inline/inline-flex elements — chúng vẫn flow ngang vì không có block formatting context.

**Giải pháp**:
```tsx
// ✅ ĐÚNG — flex flex-col tạo block context, items xếp dọc
<div className="flex flex-col gap-xs">
  <Label>Show Outside Days</Label>
  <Switch checked={...} />
</div>
```

**Nguyên tắc**:
> Bất cứ khi nào muốn xếp 2+ elements theo chiều dọc, **luôn dùng `flex flex-col gap-*`** thay vì `space-y-*`. `space-y-*` chỉ an toàn khi tất cả children đã là block-level elements (div, p, section...).

---

### Lỗi 14: DateRangePicker thiếu pending/committed state và Cancel/Apply footer

**Vấn đề**: DateRangePicker ban đầu apply range ngay khi user click date — không có Cancel/Apply. Không nhất quán với cách component được dùng trong dashboard (overview.tsx).

**Pattern đúng — 2 state layers**:
```tsx
// committed = giá trị đang hiển thị trên trigger (last applied)
const [committed, setCommitted] = useState<{ from?: Date; to?: Date }>({ from, to })
// pending = giá trị đang edit trong popover (chưa apply)
const [pending, setPending] = useState<{ from?: Date; to?: Date }>({ from, to })

const handleOpenChange = (next: boolean) => {
  if (next) setPending(committed)  // reset pending khi mở lại
  setOpen(next)
}
const handleApply = () => { setCommitted(pending); onRangeChange?.(pending); setOpen(false) }
const handleCancel = () => { setOpen(false) }  // bỏ pending, giữ committed

// Trigger hiển thị committed, Calendar hiển thị pending
```

**Footer specs chính xác** (lấy từ overview.tsx):
```tsx
<div className="flex items-center justify-between border-t border-border/30 dark:border-white/[0.06] px-md py-sm">
  <p className="sp-caption text-muted-foreground">
    {/* format: "MMM d – MMM d, yyyy" hoặc "Select a range" */}
  </p>
  <div className="flex items-center gap-sm">
    <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
    <Button size="sm" disabled={!pending.from || !pending.to} onClick={handleApply}>Apply</Button>
  </div>
</div>
```

**Key specs**:
- Padding: `px-md py-sm` (16px/12px) — không phải `px-sm py-xs`
- Border: `border-border/30 dark:border-white/[0.06]`
- Cancel: `variant="ghost"` — không phải `variant="outline"`
- Gap buttons: `gap-sm` — không phải `gap-xs`
- Apply disabled khi chưa chọn đủ 2 ngày
- Format text: `format(from, "MMM d") – format(to, "MMM d, yyyy")`

**Nguyên tắc nhất quán UI**:
> Khi component trong docs page (design system) dùng cùng component với trang app thật (dashboard), **phải đọc code trang app** để lấy spec chính xác. Không tự viết spec khác — sẽ tạo inconsistency.

---

### Lỗi 15: Interactive Demo dùng sub-components chưa import → build vỡ, trang trắng

**Vấn đề**: Sau khi thêm Interactive Demo (Phần B) vào overlay components, build vỡ hoàn toàn (trang trắng không hiển thị nội dung). Nguyên nhân: Interactive Demo dùng các sub-components chưa có trong import statement vì chúng không được dùng trong static div mocks (Phần A).

**Danh sách sub-components hay bị bỏ sót:**

| Component | Sub-components thường thiếu |
|-----------|----------------------------|
| Dialog | `DialogClose` |
| Sheet | `SheetClose`, `SheetFooter` |
| Drawer | `DrawerClose` (thường đã có) |
| DropdownMenu | `DropdownMenuCheckboxItem`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubContent`, `DropdownMenuSubTrigger` |
| ContextMenu | `ContextMenuLabel`, `ContextMenuCheckboxItem` |
| Popover | Thường đủ nếu đã import `PopoverContent`, `PopoverTrigger` |

**Quy tắc**:
> Sau khi viết xong Interactive Demo, đọc lại toàn bộ JSX trong phần đó và cross-check từng component name với imports ở đầu file. Đặc biệt chú ý các "close/dismiss" và "sub-menu" sub-components.

```tsx
// ✅ ĐÚNG — DialogClose được import cùng với Dialog
import {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"

// ❌ SAI — DialogClose dùng trong Interactive Demo nhưng chưa import
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
// → Build thành công nhưng runtime error, trang trắng
```

**Checklist sau khi viết Interactive Demo:**
```
[ ] Grep tất cả component names dùng trong Interactive Demo JSX
[ ] So sánh với import statements ở đầu file
[ ] Đặc biệt kiểm tra: *Close, *Footer, *Sub, *SubContent, *SubTrigger, *CheckboxItem, *Shortcut, *Label
[ ] Reload local dev để confirm trang không bị trắng
```

---

### Lỗi 15: Examples Phần A của Overlay — dùng trigger button thay vì div giả

**Vấn đề**: AlertDialogDocs ban đầu render `<AlertDialog><AlertDialogTrigger>` trong mỗi Example card (Phần A). User chỉ thấy button nhỏ, không thấy dialog face — phải click mới mở được. Đây là sai hoàn toàn mục đích của Phần A.

```tsx
// ❌ SAI — Phần A dùng trigger → user chỉ thấy button, không thấy dialog
<Example title="Basic Confirmation" ...>
  <AlertDialog>
    <AlertDialogTrigger asChild><Button>Show Alert</Button></AlertDialogTrigger>
    <AlertDialogContent>...</AlertDialogContent>
  </AlertDialog>
</Example>

// ✅ ĐÚNG — Phần A dùng div giả, dialog face hiển thị trực tiếp
<Example title="Basic Confirmation" ...>
  <div className="w-full border border-border rounded-xl bg-card p-xl shadow pointer-events-none space-y-lg">
    <div className="size-9 rounded-full border border-border flex items-center justify-center">
      <AlertCircle className="size-4 text-muted-foreground" />
    </div>
    <div className="space-y-xs">
      <h3 className="text-base font-semibold text-foreground font-heading">Are you sure?</h3>
      <p className="text-sm text-muted-foreground font-body">This action cannot be undone.</p>
    </div>
    <div className="flex justify-end gap-xs">
      <Button variant="outline" size="sm">Cancel</Button>
      <Button size="sm">Continue</Button>
    </div>
  </div>
</Example>
```

**Quy tắc**:
> Phần A (grid static cards) của overlay components (Dialog, AlertDialog, Sheet, Drawer) **PHẢI** render dialog/sheet face trực tiếp bằng div giả với `pointer-events-none`.
> Trigger buttons chỉ được phép trong **Phần B (Interactive Demo)**.

**Checklist khi viết Examples cho Overlay:**
```
[ ] Phần A: mỗi Example card → div giả, dialog face visible ngay, pointer-events-none
[ ] Phần A: KHÔNG có <AlertDialogTrigger>, <DialogTrigger>, <SheetTrigger> bên trong Example
[ ] Phần B: bordered card "Interactive Demo" → trigger buttons thật cho từng variant
[ ] Phần B: mỗi trigger tương ứng 1 Example từ Phần A (cùng tên)
```

---

### Lỗi 16: Behavioral props trong ExploreBehavior — không có visual output

**Vấn đề**: AccordionDocs ban đầu có control "Collapsible" (toggle prop `collapsible` trên Accordion). Khi user bật/tắt toggle, accordion trông hoàn toàn giống nhau — không có visual feedback. `collapsible` chỉ thay đổi *behavior* (có thể đóng item đang mở hay không), không thay đổi giao diện.

**Phân biệt props phù hợp cho ExploreBehavior:**

| Loại prop | Ví dụ | Phù hợp cho ExploreBehavior? |
|-----------|-------|------------------------------|
| **Visual props** — thay đổi giao diện ngay lập tức | `variant`, `size`, `open/close`, `disabled` | ✅ Có |
| **Behavioral props** — thay đổi interaction, không thay đổi visual | `collapsible` (Accordion), `modal` (Dialog), `preventScrollOnMount` | ❌ Không |

**Quy tắc**:
> Trước khi thêm control vào ExploreBehavior, tự hỏi: "User toggle prop này → có thấy gì thay đổi trên màn hình ngay lập tức không?"
> - Có → thêm vào controls
> - Không → chỉ document trong Props table, không đưa vào ExploreBehavior

```tsx
// ❌ SAI — collapsible không tạo visual change nào khi toggle
controls={[
  { label: "Collapsible", type: "toggle", value: collapsible, onChange: setCollapsible },
  { label: "State", type: "select", options: ["default","disabled"], value: state, onChange: setState },
]}

// ✅ ĐÚNG — bỏ collapsible khỏi controls, chỉ giữ props có visual output
controls={[
  { label: "Open", type: "toggle", value: open, onChange: setOpen },
  { label: "State", type: "select", options: ["default","disabled"], value: state, onChange: setState },
]}
```

---

### Lỗi 17: pointer-events-none áp dụng cả default state — component không interactive

**Vấn đề**: AccordionDocs và CollapsibleDocs wrap toàn bộ component trong `pointer-events-none` kể cả khi `state === "default"`. Điều này khiến accordion/collapsible không click được, mất đi value của interactive component.

**Nguyên tắc đúng:**

| Loại component | Khi state = "default" | Khi state ≠ "default" |
|---------------|----------------------|----------------------|
| **Overlay** (Dialog, Sheet, Drawer) | `pointer-events-none` — luôn static vì phải trigger mới hiện | `pointer-events-none` |
| **Form static** (Button, Badge, Input disabled) | `pointer-events-none` | `pointer-events-none` |
| **Interactive** (Accordion, Collapsible, Tabs, Switch) | ❌ KHÔNG `pointer-events-none` — để user tương tác được | `pointer-events-none` — chỉ simulate hover/focus/disabled visual |

```tsx
// ✅ ĐÚNG — chỉ block pointer events khi không phải default
<div className={cn(state !== "default" && "pointer-events-none")}>
  <Accordion ...>
    {/* User có thể click mở/đóng khi state = "default" */}
  </Accordion>
</div>

// ❌ SAI — luôn pointer-events-none kể cả default
<div className="pointer-events-none">
  <Accordion ...>
    {/* Không bao giờ interactive */}
  </Accordion>
</div>
```

**Checklist khi viết ExploreBehavior cho interactive components:**
```
[ ] state === "default" → component có thể click/interact được
[ ] state = "hover" → simulate bằng className override + pointer-events-none
[ ] state = "focus" → simulate bằng ring className + pointer-events-none
[ ] state = "disabled" → dùng disabled prop + pointer-events-none
```

---

### Pattern: Controlled Open toggle cho accordion/collapsible components

**Khi nào dùng**: Khi muốn add "Open" toggle trong ExploreBehavior để demo accordion/collapsible mở/đóng từ controls panel.

**Vấn đề với uncontrolled approach**: Dùng `defaultValue` + `key={String(open)}` để reset accordion — không hoạt động mượt, gây re-mount toàn component.

**Giải pháp đúng — controlled value pattern:**
```tsx
const [open, setOpen] = useState(false)

// Accordion controlled với value + onValueChange
<Accordion
  type="single"
  collapsible
  value={open ? "item-1" : ""}
  onValueChange={(v) => setOpen(!!v)}
  disabled={isDisabled}
>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section title</AccordionTrigger>
    <AccordionContent>Content here</AccordionContent>
  </AccordionItem>
</Accordion>

// Control trong controls panel
{ label: "Open", type: "toggle", value: open, onChange: setOpen },
```

**Collapsible tương tự:**
```tsx
const [open, setOpen] = useState(false)

<Collapsible open={open} onOpenChange={setOpen}>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>

// Control:
{ label: "Open", type: "toggle", value: open, onChange: setOpen },
```

**Key insight**: Dùng `value` controlled (Accordion) hoặc `open` controlled (Collapsible) để ExploreBehavior toggle có thể drive component state trực tiếp.

---

### Lỗi 18: Table selected state không có checkbox — thiếu trigger mechanism

**Vấn đề**: TableDocs ExploreBehavior có `state = "selected"` nhưng không có checkbox column. Row đổi màu `bg-muted` (do `data-state="selected"`) nhưng không có gì giải thích tại sao row đó được select — confused vì trong app thật, selected state luôn đi kèm checkbox.

**Quy tắc**:
> Khi demo `data-state="selected"` cho TableRow, **bắt buộc** phải có checkbox column. Đây là pattern thực tế — user chọn row bằng checkbox, không phải click vào row.

```tsx
// ✅ ĐÚNG — có checkbox column, row 1 checked khi state="selected"
const rowSelected = state === "selected"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="w-px"><Checkbox /></TableHead>  {/* checkbox col */}
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow data-state={rowSelected ? "selected" : undefined}>
      <TableCell><Checkbox checked={rowSelected} readOnly /></TableCell>
      <TableCell>Alice Johnson</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
    {/* other rows — không có data-state="selected" */}
  </TableBody>
</Table>

// ❌ SAI — selected row không có checkbox
<TableRow data-state={state === "selected" ? "selected" : undefined}>
  <TableCell>Alice</TableCell>  {/* không rõ tại sao selected */}
</TableRow>
```

---

### Pattern: Table variants — Sortable, Tooltip Header, Striped, Compact

Bốn pattern phổ biến cho Table. Mỗi cái nên là **Example card riêng** (không phải ExploreBehavior control).

#### Sortable Table
Cần state riêng → extract thành named function trước Docs function:

```tsx
// Định nghĩa TRƯỚC TableDocs function — cần useState
function SortableTableExample() {
  type SortKey = "name" | "role" | "status"
  type SortDir = "asc" | "desc" | null
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : d === "desc" ? null : "asc")
      if (sortDir === "desc") setSortKey(null)
    } else {
      setSortKey(key); setSortDir("asc")
    }
  }

  const sorted = [...TABLE_ROWS].sort(/* sort logic */)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {(["name","role","status"] as SortKey[]).map(key => (
            <TableHead key={key}
              className="cursor-pointer select-none"
              aria-sort={sortKey === key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              onClick={() => handleSort(key)}
            >
              <span className="flex items-center gap-xs">
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {sortKey === key
                  ? sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                  : <ChevronsUpDown className="size-3 text-muted-foreground" />
                }
              </span>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map(row => <TableRow key={row.name}>...</TableRow>)}
      </TableBody>
    </Table>
  )
}
```

**Key specs sortable:**
- `aria-sort` attribute trên `<th>`: `"ascending"`, `"descending"`, `"none"`
- Icon: `ChevronsUpDown` (unsorted) → `ArrowUp` / `ArrowDown` (sorted)
- `cursor-pointer select-none` trên sortable header

#### Tooltip Header
Dùng khi header là abbreviation cần giải thích:

```tsx
<TableHead>
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="underline decoration-dotted cursor-help">LTV</span>
    </TooltipTrigger>
    <TooltipContent>Lifetime Value</TooltipContent>
  </Tooltip>
</TableHead>
```

**Key specs**: `underline decoration-dotted cursor-help` trên span trigger.

#### Striped Rows
```tsx
// Áp dụng vào TableRow hoặc TableBody
<TableRow className="even:bg-muted/30">
```

#### Compact Table
```tsx
// Áp dụng vào Table wrapper — override tất cả td/th padding
<Table className="[&_td]:py-1 [&_th]:py-1">
```

### Lỗi 19: Component thiếu size/variant prop — SaaS web dùng className override thay thế

**Vấn đề**: Component thiếu size/variant prop — SaaS web phải dùng `className` override thay thế. Đây là dấu hiệu component chưa đủ API cho các use case thực tế.

**Nguyên tắc**: Nếu một pattern được dùng lặp đi lặp lại trên nhiều trang (3+ lần), nó phải là prop chính thức trên component — không phải ad-hoc className override. SaaS web được xây từ design system, không thể có thứ SaaS web có mà component không có.

**Cách phát hiện**:
```bash
# Tìm className override lặp lại — có thể là missing prop
grep -r "p-xl\|p-2xl" src/pages --include="*.tsx"
# Nếu thấy 10+ file dùng cùng một pattern → candidate for prop
```

**Fix đúng — Card có 3 tiers padding**:
```tsx
type CardSize = "md" | "lg"

function Card({ className, size, ...props }: React.ComponentProps<"div"> & { size?: CardSize }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "rounded-2xl border border-border/60 bg-card text-card-foreground dark:border-border-subtle",
        !size && "p-md",           // default: 16px — dùng cho tất cả DCard thông thường
        size === "md" && "p-xl",   // md: 24px — card cần padding thoáng hơn
        size === "lg" && "p-2xl",  // lg: 32px — card nổi bật, feature card
        className
      )}
      {...props}
    />
  )
}
```

**Sau khi thêm prop — update tất cả callsites**:
```tsx
// Trước (ad-hoc override)
<Card className="... p-xl h-full ...">

// Sau (prop chính thức — dùng default 16px)
<Card className="... h-full ...">

// Hoặc dùng size prop khi cần padding lớn hơn
<Card size="md" className="... h-full ...">
```

`twMerge` trong `cn()` đảm bảo `className` padding override `size` đúng khi cần padding đặc biệt trên instance cụ thể (`!p-0` cho table cards).

---

### Lỗi 20: ExploreBehavior controls ẩn có điều kiện — controls không nhất quán

**Vấn đề**: Khi thêm `size` control vào CardDocs, Show Header và Show Footer bị ẩn khi `size !== "default"` bằng spread `...(!isSized ? [...] : [])`. User thấy controls biến mất khi đổi size — cảm giác broken.

**Nguyên tắc**: Property controls trong ExploreBehavior luôn hiển thị đầy đủ — KHÔNG BAO GIỜ ẩn cả control. Tuy nhiên, có thể **filter values** bên trong control khi một số values không applicable (breadcrumb pattern). VD: Type=Checkbox → Alignment chỉ show ["Left"] (hide value "Right"), nhưng control Alignment vẫn visible. Code pattern: `{(type === "checkbox" ? ["left"] : ["left", "right"]).map(...)}`.

**Anti-pattern**:
```tsx
// SAI — controls biến mất khi đổi size
controls={[
  { label: "Size", ... },
  ...(!isSized ? [
    { label: "Show Header", ... },
    { label: "Show Footer", ... },
  ] : []),
]}
```

**Pattern đúng — controls cố định, preview thay đổi theo state**:
```tsx
// ĐÚNG — luôn show đủ 4 controls
controls={[
  { label: "State", type: "select", options: ["default", "hover"], ... },
  { label: "Size", type: "select", options: ["default", "md", "lg"], ... },
  { label: "Show Header", type: "toggle", ... },
  { label: "Show Footer", type: "toggle", ... },
]}

// Trong preview: isSized → render flat content với showHeader/showFooter
// !isSized → render sub-component pattern với showHeader/showFooter
```

---

### Lỗi 21: pointer-events-none trên ExploreBehavior canvas khi component có interactive children

**Vấn đề**: CardDocs ban đầu dùng `pointer-events-none` trên canvas — buttons bên trong không click được.

**Áp dụng Lỗi 17 đúng cách**:
- `pointer-events-none` chỉ dùng khi component **tự nó** là overlay/modal (Dialog, Sheet, Drawer, AlertDialog) — không thể tương tác thực sự trên canvas
- Card là layout container với children interactive → **không dùng** `pointer-events-none`
- Badge, Avatar, Skeleton → static, không interactive → **dùng** `pointer-events-none`
- Accordion, Collapsible khi `state !== "default"` → `pointer-events-none`

**Bảng tổng hợp**:
| Component | pointer-events-none? | Lý do |
|-----------|---------------------|-------|
| Dialog, Sheet, Drawer, AlertDialog | Luôn có | Overlay không render trực tiếp trên canvas |
| Card, Tabs, Accordion, Collapsible | Không (hoặc chỉ khi state là hover/focus) | Có interactive children |
| Badge, Avatar, Skeleton, Separator | Luôn có | Static, không interactive |
| Button, Input, Select | Không | Mục đích chính là tương tác |

---

### Lỗi 22: `overflow-hidden` trên ExploreBehavior và Example clip dropdown/viewport của NavigationMenu

**Vấn đề**: Cả `ExploreBehavior` lẫn `Example` dùng `overflow-hidden` trên `rounded-xl` container để clip border radius. NavigationMenuViewport render dưới dạng `position: absolute` bên ngoài trigger — bị clip hoàn toàn, dropdown tàng hình.

**Các component bị ảnh hưởng**: NavigationMenu (viewport), Combobox (popover), Select (dropdown), DatePicker, bất kỳ component nào có floating panel render ngoài luồng DOM thông thường.

**Fix cho ExploreBehavior**: Thay `<ExploreBehavior>` bằng custom section không dùng `overflow-hidden`. Áp dụng `rounded-t-xl` trên div preview và `rounded-b-xl` trên div controls.
```tsx
// SAI — ExploreBehavior có overflow-hidden, clip dropdown
<ExploreBehavior ...>
  <NavigationMenu />
</ExploreBehavior>

// ĐÚNG — custom section, không overflow-hidden
<section className="space-y-md">
  <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
  <div className="border border-border rounded-xl">
    <div className="px-2xl py-2xl flex items-start justify-center bg-muted/20 rounded-t-xl">
      {/* NavigationMenu preview */}
    </div>
    <div className="border-t border-border p-md bg-muted/10 rounded-b-xl">
      {/* controls */}
    </div>
  </div>
</section>
```

**Fix cho Example**: Dùng prop `allowOverflow` trên `<Example>`. Khi `allowOverflow=true`: bỏ `overflow-hidden` trên outer div, áp dụng `rounded-t-xl`/`rounded-b-xl` trên từng child div.
```tsx
// SAI
<Example title="With Dropdown Content" ...>...</Example>

// ĐÚNG
<Example allowOverflow title="With Dropdown Content" ...>...</Example>
```

**Pattern nhận biết**: Nếu component có popup/dropdown/popover/viewport nào đó → kiểm tra xem `Example` hay `ExploreBehavior` có cần `allowOverflow` hay custom section không.

---

### Lỗi 23: Dùng `pb-[120px]` để tạo chỗ cho dropdown — canvas phồng to không cần thiết

**Vấn đề**: Khi dropdown bị clip, có thể nghĩ rằng thêm `pb-[Npx]` lớn sẽ tạo không gian cho dropdown render. Cách này sai vì:
1. `overflow-hidden` vẫn clip — padding không giúp được gì
2. Nếu đã bỏ `overflow-hidden` rồi, dropdown render ra ngoài card mà không cần padding thêm
3. Canvas phồng to làm trang DS xấu

**Fix**: Bỏ hẳn các `pb-[Npx]` lớn. Dùng `py-2xl` (padding đều) là đủ. Khi `overflow-hidden` đã được bỏ, dropdown tự render ra ngoài card không cần "chỗ trống" bên dưới.

```tsx
// SAI — canvas quá cao
<div className="px-2xl pb-[120px] flex items-start rounded-t-xl">

// ĐÚNG — padding đều, dropdown tự overflow ra ngoài
<div className="px-2xl py-2xl flex items-start rounded-t-xl">
```

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
