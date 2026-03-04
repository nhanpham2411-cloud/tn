import { useState, useEffect, useCallback, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"

// Icons — named imports for component usage
import {
  ArrowLeft, Sun, Moon, Copy, Check, ChevronRight, Plus, Trash2, X,
  Search, Bold, Italic, Underline, ChevronsUpDown, CalendarIcon,
  AlertCircle, CheckCircle2, AlertTriangle, Info, Loader2,
  User, Bell, Settings, ChevronDown, MoreHorizontal,
  ArrowRight, Pencil, Share, Star, Package, BarChart3, GripHorizontal,
} from "lucide-react"
import * as LucideIcons from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge, BadgeRound, BadgeDot } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Combobox } from "@/components/ui/combobox"
import { DatePicker, DateRangePicker } from "@/components/ui/date-picker"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Calendar } from "@/components/ui/calendar"
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger,
  ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger,
} from "@/components/ui/context-menu"

// ============================================================
// HELPERS
// ============================================================

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])
  return (
    <div className="relative rounded-lg bg-zinc-950 text-zinc-100 text-[13px] p-sm overflow-x-auto">
      <pre className="font-mono whitespace-pre-wrap">{code}</pre>
      <button onClick={copy} className="absolute top-2 right-2 p-1 rounded hover:bg-zinc-800 text-zinc-400">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  )
}

function Example({ title, description, code, children }: {
  title: string; description?: string; code: string; children: ReactNode
}) {
  const [showCode, setShowCode] = useState(false)
  return (
    <div className="border border-border rounded-xl overflow-hidden flex flex-col">
      <div className="p-md bg-muted/30">
        <h4 className="font-semibold text-sm font-heading">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="p-lg flex flex-wrap items-center gap-md border-t border-border flex-1">
        {children}
      </div>
      <div className="border-t border-border px-md py-xs flex justify-end mt-auto">
        <button onClick={() => setShowCode(!showCode)} className="text-xs text-muted-foreground hover:text-foreground">
          {showCode ? "Hide code" : "View code"}
        </button>
      </div>
      {showCode && <div className="border-t border-border"><CodeBlock code={code} /></div>}
    </div>
  )
}

function PropsTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead><tr className="bg-muted/50 text-left">
          <th className="p-xs font-medium">Prop</th>
          <th className="p-xs font-medium">Type</th>
          <th className="p-xs font-medium">Default</th>
          <th className="p-xs font-medium">Description</th>
        </tr></thead>
        <tbody>
          {rows.map(([prop, type, def, desc], i) => (
            <tr key={i} className="border-t border-border">
              <td className="p-xs font-mono text-xs text-primary">{prop}</td>
              <td className="p-xs font-mono text-xs text-muted-foreground">{type}</td>
              <td className="p-xs font-mono text-xs">{def}</td>
              <td className="p-xs text-muted-foreground">{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FigmaMapping({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Figma Mapping</h2>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50 text-left">
            <th className="p-xs font-medium">Figma Property</th>
            <th className="p-xs font-medium">Figma Value</th>
            <th className="p-xs font-medium">Code Prop</th>
            <th className="p-xs font-medium">Code Value</th>
          </tr></thead>
          <tbody>
            {rows.map(([fp, fv, cp, cv], i) => (
              <tr key={i} className="border-t border-border">
                <td className="p-xs font-semibold text-xs">{fp}</td>
                <td className="p-xs text-xs">{fv}</td>
                <td className="p-xs font-mono text-xs text-primary">{cp}</td>
                <td className="p-xs font-mono text-xs text-muted-foreground">{cv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function AccessibilityInfo({ keyboard, notes }: { keyboard: [string, string][]; notes?: string[] }) {
  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Accessibility</h2>
      <div className="space-y-sm">
        <div className="border border-border rounded-lg p-md space-y-sm">
          <h3 className="font-semibold text-sm">Keyboard</h3>
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border text-left"><th className="pr-lg py-1 font-semibold">Key</th><th className="py-1 font-semibold">Action</th></tr></thead>
            <tbody>
              {keyboard.map(([key, action], i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="pr-lg py-1.5"><kbd className="bg-muted border border-border rounded px-1.5 py-0.5 text-[10px] font-mono">{key}</kbd></td>
                  <td className="py-1.5 text-muted-foreground">{action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {notes && notes.length > 0 && (
          <div className="border border-border rounded-lg p-md space-y-sm">
            <h3 className="font-semibold text-sm">Notes</h3>
            <ul className="space-y-1 list-disc list-inside text-xs text-muted-foreground">
              {notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

function RelatedComponents({ items }: { items: { name: string; desc: string }[] }) {
  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Related Components</h2>
      <div className="border border-border rounded-lg divide-y divide-border">
        {items.map((item, i) => (
          <div key={i} className="px-md py-sm flex justify-between items-center">
            <div>
              <p className="font-semibold text-sm">{item.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
            <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded shrink-0">Available</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============================================================
// EXPLORE BEHAVIOR — Reusable playground wrapper
// ============================================================

type ControlDef = {
  label: string
  type: "select" | "toggle"
  options?: string[]
  value: string | boolean
  onChange: (v: any) => void
  disabled?: boolean
}

function ExploreBehavior({ controls, children }: { controls: ControlDef[]; children: ReactNode }) {
  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="p-2xl flex items-center justify-center min-h-[160px] bg-muted/20 gap-md flex-wrap">
          {children}
        </div>
        <div className="border-t border-border p-md bg-muted/10">
          {(() => {
            const selects = controls.filter(c => c.type === "select")
            const toggles = controls.filter(c => c.type === "toggle")
            return (
              <div className="flex flex-col gap-md">
                {selects.map((c) => (
                  <div key={c.label} className={cn("space-y-xs", c.disabled && "opacity-50 pointer-events-none")}>
                    <Label className="text-xs text-muted-foreground font-body">{c.label}</Label>
                    <div className="flex flex-wrap gap-xs">
                      {c.options!.map(o => (
                        <button key={o} onClick={() => c.onChange(o)} disabled={c.disabled} className={cn(
                          "px-xs py-[4px] rounded-md text-xs font-body border transition-colors",
                          String(c.value) === o
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card text-foreground border-border hover:bg-accent"
                        )}>{o}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {toggles.length > 0 && (
                  <div className="flex flex-wrap gap-x-lg gap-y-xs">
                    {toggles.map((c) => (
                      <div key={c.label} className={cn("flex items-center gap-xs", c.disabled && "opacity-50 pointer-events-none")}>
                        <Switch checked={!!c.value} onCheckedChange={c.onChange} disabled={c.disabled} />
                        <Label className="text-xs text-muted-foreground font-body whitespace-nowrap">{c.label}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// ADDITIONAL SECTION HELPERS
// ============================================================

function InstallationSection({ pkg, importCode }: { pkg: string[]; importCode: string }) {
  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Installation</h2>
      <div className="space-y-sm">
        {pkg.length > 0 && (
          <div className="space-y-xs">
            <p className="text-xs text-muted-foreground font-body">Dependencies</p>
            <CodeBlock code={`pnpm add ${pkg.join(" ")}`} />
          </div>
        )}
        <div className="space-y-xs">
          <p className="text-xs text-muted-foreground font-body">Import</p>
          <CodeBlock code={importCode} />
        </div>
      </div>
    </section>
  )
}

function DesignTokensTable({ rows }: { rows: [string, string, string][] }) {
  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Design Tokens</h2>
      <p className="text-sm text-muted-foreground font-body">CSS custom properties from <code className="text-xs bg-muted px-1 rounded">src/index.css</code>.</p>
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-muted/50 text-left"><th className="p-xs font-medium">Token</th><th className="p-xs font-medium">Value</th><th className="p-xs font-medium">Usage</th></tr></thead>
          <tbody>
            {rows.map(([token, value, usage], i) => (
              <tr key={i} className="border-t border-border">
                <td className="p-xs font-mono text-xs text-primary">{token}</td>
                <td className="p-xs font-mono text-xs text-muted-foreground">{value}</td>
                <td className="p-xs text-xs text-muted-foreground">{usage}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function BestPractices({ items }: { items: { do: string; dont: string }[] }) {
  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Best Practices</h2>
      <div className="space-y-sm">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-sm">
            <div className="border border-success/40 bg-success/5 rounded-lg p-md space-y-xs">
              <p className="text-xs font-semibold text-success uppercase tracking-wide">Do</p>
              <p className="text-sm text-foreground font-body">{item.do}</p>
            </div>
            <div className="border border-destructive/40 bg-destructive/5 rounded-lg p-md space-y-xs">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wide">Don't</p>
              <p className="text-sm text-foreground font-body">{item.dont}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============================================================
// COMPONENT DOCS
// ============================================================

function ButtonDocs() {
  const [v, setV] = useState("default")
  const [sz, setSz] = useState("default")
  const [state, setState] = useState("default")
  const [ico, setIco] = useState("none")
  const isDisabled = state === "disabled"
  const isHover = state === "hover"
  const isFocus = state === "focus"

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Actions</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Button</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Displays a button or a component that looks like a button. Supports 7 variants, 4 sizes, and icon compositions.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Variant", type: "select", options: ["default","secondary","outline","ghost","ghost-muted","destructive","destructive-secondary"], value: v, onChange: setV },
        { label: "Size", type: "select", options: ["lg","default","sm","xs"], value: sz, onChange: setSz },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
        { label: "Icon", type: "select", options: ["none","left","right","both"], value: ico, onChange: setIco },
      ]}>
        <div className={cn("pointer-events-none", isFocus && "[&_button]:ring-2 [&_button]:ring-ring")}>
          <Button variant={v as any} size={sz as any} disabled={isDisabled} className={cn(isHover && v === "default" && "bg-primary-hover", isHover && v === "secondary" && "bg-secondary-hover", isHover && v === "outline" && "bg-outline-hover", isHover && v === "ghost" && "bg-ghost-hover")}>
            {(ico === "left" || ico === "both") && <Plus className="size-4" />}
            Button
          {(ico === "right" || ico === "both") && <ChevronRight className="size-4" />}
        </Button>
        </div>
      </ExploreBehavior>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">

        <Example title="Primary" description="Default button for primary actions." code={`<Button>Save Changes</Button>`}>
          <Button>Save Changes</Button>
        </Example>

        <Example title="Secondary" description="For secondary actions." code={`<Button variant="secondary">Cancel</Button>`}>
          <Button variant="secondary">Cancel</Button>
        </Example>

        <Example title="Outline" description="Button with border, no fill." code={`<Button variant="outline">Edit</Button>`}>
          <Button variant="outline">Edit</Button>
        </Example>

        <Example title="Ghost" description="Minimal button for tertiary actions." code={`<Button variant="ghost">Settings</Button>`}>
          <Button variant="ghost">Settings</Button>
        </Example>

        <Example title="Ghost Muted" description="Even more subtle ghost variant." code={`<Button variant="ghost-muted">View All</Button>`}>
          <Button variant="ghost-muted">View All</Button>
        </Example>

        <Example title="Destructive" description="For dangerous/delete actions." code={`<Button variant="destructive">Delete</Button>`}>
          <Button variant="destructive">Delete Account</Button>
        </Example>

        <Example title="Destructive Secondary" description="Softer destructive variant." code={`<Button variant="destructive-secondary">Remove</Button>`}>
          <Button variant="destructive-secondary">Remove</Button>
        </Example>

        <Example title="All Sizes" description="lg, default, sm, xs" code={`<Button size="lg">Large</Button>\n<Button>Default</Button>\n<Button size="sm">Small</Button>\n<Button size="xs">XSmall</Button>`}>
          <Button size="lg">Large</Button>
          <Button>Default</Button>
          <Button size="sm">Small</Button>
          <Button size="xs">XSmall</Button>
        </Example>

        <Example title="With Icons" description="Leading and trailing icons." code={`<Button><Plus className="size-4" /> Create\n</Button>\n<Button variant="outline">Continue <ChevronRight className="size-4" /></Button>`}>
          <Button><Plus className="size-4" /> Create</Button>
          <Button variant="outline">Continue <ChevronRight className="size-4" /></Button>
          <Button variant="ghost"><ArrowLeft className="size-4" /> Back</Button>
        </Example>

        <Example title="Icon Only" description="Square icon buttons." code={`<Button size="icon"><Plus className="size-4" /></Button>`}>
          <Button size="icon"><Plus className="size-4" /></Button>
          <Button size="icon" variant="outline"><Settings className="size-4" /></Button>
          <Button size="icon" variant="ghost"><Search className="size-4" /></Button>
          <Button size="icon" variant="destructive"><Trash2 className="size-4" /></Button>
        </Example>

        <Example title="Disabled" description="Disabled state for all variants." code={`<Button disabled>Submit</Button>`}>
          <Button disabled>Submit</Button>
          <Button variant="outline" disabled>Edit</Button>
          <Button variant="ghost" disabled>Cancel</Button>
        </Example>

        <Example title="Loading" description="With spinner indicator." code={`<Button disabled><Loader2 className="size-4 animate-spin" /> Saving...</Button>`}>
          <Button disabled><Loader2 className="size-4 animate-spin" /> Saving...</Button>
        </Example>

        <Example title="Form Actions" description="Common save/cancel pair." code={`<div className="flex gap-sm">\n  <Button variant="ghost">Cancel</Button>\n  <Button>Save Changes</Button>\n</div>`}>
          <Button variant="ghost">Cancel</Button>
          <Button>Save Changes</Button>
        </Example>

        <Example title="Destructive Confirm" description="Delete confirmation dialog." code={`<Button variant="outline">Cancel</Button>\n<Button variant="destructive">Delete Account</Button>`}>
          <Button variant="outline">Cancel</Button>
          <Button variant="destructive">Delete Account</Button>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["variant", '"default" | "secondary" | "outline" | "ghost" | "ghost-muted" | "destructive" | "destructive-secondary"', '"default"', "Visual style variant"],
          ["size", '"lg" | "default" | "sm" | "xs" | "icon" | "icon-sm" | "icon-lg"', '"default"', "Button size"],
          ["disabled", "boolean", "false", "Disables the button"],
          ["asChild", "boolean", "false", "Render as child element (Radix Slot)"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import { Button } from "@/components/ui/button"`} />
      <DesignTokensTable rows={[["--primary","violet-600","Default variant background"],["--primary-hover","violet-700","Hover state"],["--secondary","zinc-100","Secondary variant background"],["--destructive","red-500","Destructive variant"],["--ring","violet-600/30","Focus ring"],["--radius-md","10px","Button border radius"]]} />
      <BestPractices items={[{do:"Use one primary action per section to establish clear hierarchy.",dont:"Place multiple primary buttons side by side — use secondary or outline for less important actions."},{do:"Include aria-label on icon-only buttons for screen reader users.",dont:"Use icon-only buttons without a tooltip or accessible label."}]} />
      <FigmaMapping rows={[["Variant","Primary","variant",'"default"'],["Variant","Secondary","variant",'"secondary"'],["Variant","Outline","variant",'"outline"'],["Variant","Ghost","variant",'"ghost"'],["Size","Large (40px)","size",'"lg"'],["Size","Default (36px)","size",'"default"'],["Size","Small (32px)","size",'"sm"'],["Size","Mini (24px)","size",'"xs"'],["State","Disabled","disabled","true"],["Show Left Icon","true","children","<Icon /> Label"]]} />
      <AccessibilityInfo keyboard={[["Tab","Move focus to button"],["Enter / Space","Activate button"]]} notes={["Icon-only buttons must include aria-label","Use type=\"submit\" for form submission"]} />
      <RelatedComponents items={[{name:"Toggle",desc:"For on/off state changes."},{name:"Badge",desc:"For status indicators, not actions."}]} />
    </div>
  )
}

function InputDocs() {
  const [sz, setSz] = useState("default")
  const [state, setState] = useState("default")
  const [icon, setIcon] = useState("none")
  const isDisabled = state === "disabled"
  const isError = state === "error"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Input</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A text input field with 4 size variants, focus ring, error, and disabled states. Use wrapper pattern for icons.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Size", type: "select", options: ["lg","default","sm","xs"], value: sz, onChange: setSz },
        { label: "State", type: "select", options: ["default","focus","error","disabled"], value: state, onChange: setState },
        { label: "Icon", type: "select", options: ["none","left","right","both"], value: icon, onChange: setIcon },
      ]}>
        <div className="relative max-w-xs w-full">
          {(icon === "left" || icon === "both") && <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />}
          <Input size={sz as any} disabled={isDisabled} aria-invalid={isError || undefined} placeholder="Placeholder text" className={cn(isFocus && "ring-2 ring-ring", (icon === "left" || icon === "both") && "pl-9", (icon === "right" || icon === "both") && "pr-9")} />
          {(icon === "right" || icon === "both") && <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />}
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Input placeholder="Enter email..." />`}>
          <Input placeholder="Enter email..." className="max-w-xs" />
        </Example>
        <Example title="All Sizes" code={`<Input size="lg" />\n<Input />\n<Input size="sm" />\n<Input size="xs" />`}>
          <div className="space-y-sm w-full max-w-xs">
            <Input size="lg" placeholder="Large" />
            <Input placeholder="Default" />
            <Input size="sm" placeholder="Small" />
            <Input size="xs" placeholder="Extra Small" />
          </div>
        </Example>
        <Example title="With Label" code={`<Label>Email</Label>\n<Input type="email" placeholder="name@example.com" />`}>
          <div className="space-y-xs w-full max-w-xs">
            <Label>Email</Label>
            <Input type="email" placeholder="name@example.com" />
          </div>
        </Example>
        <Example title="With Icon" code={`<div className="relative">\n  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />\n  <Input className="pl-9" placeholder="Search..." />\n</div>`}>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search..." />
          </div>
        </Example>
        <Example title="Disabled" code={`<Input disabled value="Disabled input" />`}>
          <Input disabled value="Disabled input" className="max-w-xs" />
        </Example>
        <Example title="Error State" code={`<Input aria-invalid placeholder="Invalid email" />`}>
          <Input aria-invalid placeholder="Invalid email" className="max-w-xs" />
        </Example>
        <Example title="With Button" code={`<div className="flex gap-xs">\n  <Input placeholder="Enter email" />\n  <Button>Subscribe</Button>\n</div>`}>
          <div className="flex gap-xs w-full max-w-sm">
            <Input placeholder="Enter email" />
            <Button>Subscribe</Button>
          </div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["size", '"lg" | "default" | "sm" | "xs"', '"default"', "Input height size"],
          ["type", "string", '"text"', "HTML input type (text, email, password, etc.)"],
          ["placeholder", "string", "—", "Placeholder text"],
          ["disabled", "boolean", "false", "Disables the input"],
          ["aria-invalid", "boolean", "false", "Show error border styling"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import { Input } from "@/components/ui/input"`} />
      <DesignTokensTable rows={[["--input","transparent","Input background"],["--border","zinc-200","Default border"],["--ring","violet-600/30","Focus ring"],["--ring-error","red-500/30","Error focus ring"],["--muted-foreground","zinc-500","Placeholder color"],["--foreground","zinc-900","Input text"]]} />
      <BestPractices items={[{do:"Always pair with <Label> using htmlFor for accessibility.",dont:"Use placeholder text as the only label — it disappears on input."},{do:"Show validation errors immediately with aria-invalid and error message.",dont:"Block form submission without surfacing field-level errors."}]} />
      <FigmaMapping rows={[["Size","Large","size",'"lg"'],["Size","Default","size",'"default"'],["Size","Small","size",'"sm"'],["Size","Extra Small","size",'"xs"'],["State","Error","aria-invalid","true"],["State","Disabled","disabled","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus the input"],["Esc","Clear focus"]]} notes={["Always pair with <Label> for accessibility","Use aria-invalid for error states"]} />
      <RelatedComponents items={[{name:"Textarea",desc:"For multi-line text input."},{name:"Select",desc:"For predefined options."},{name:"Combobox",desc:"For searchable dropdown."}]} />
    </div>
  )
}

function BadgeDocs() {
  const [v, setV] = useState("default")
  const [lv, setLv] = useState("primary")
  const [sz, setSz] = useState("default")
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Data Display</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Badge</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Displays a badge, status indicator, or tag. Includes Badge, BadgeRound, and BadgeDot variants.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Variant", type: "select", options: ["default","secondary","outline","ghost","destructive","emphasis","success","warning"], value: v, onChange: setV },
        { label: "Level", type: "select", options: ["primary","secondary"], value: lv, onChange: setLv },
        { label: "Size", type: "select", options: ["sm","default","lg"], value: sz, onChange: setSz },
      ]}>
        <Badge variant={v as any} level={lv as any} size={sz as any}>Badge</Badge>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="All Variants" code={`<Badge>Default</Badge>\n<Badge variant="secondary">Secondary</Badge>\n<Badge variant="outline">Outline</Badge>`}>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="emphasis">Emphasis</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </Example>
        <Example title="Secondary Level (Subtle)" code={`<Badge variant="success" level="secondary">Active</Badge>`}>
          <Badge variant="success" level="secondary">Active</Badge>
          <Badge variant="warning" level="secondary">Pending</Badge>
          <Badge variant="destructive" level="secondary">Failed</Badge>
          <Badge variant="emphasis" level="secondary">New</Badge>
        </Example>
        <Example title="Sizes" code={`<Badge size="sm">Small</Badge>\n<Badge>Default</Badge>\n<Badge size="lg">Large</Badge>`}>
          <Badge size="sm">Small</Badge>
          <Badge>Default</Badge>
          <Badge size="lg">Large</Badge>
        </Example>
        <Example title="Badge Round" code={`<BadgeRound>5</BadgeRound>`}>
          <BadgeRound>3</BadgeRound>
          <BadgeRound variant="destructive">!</BadgeRound>
          <BadgeRound variant="success" size="lg">12</BadgeRound>
        </Example>
        <Example title="Badge Dot" code={`<BadgeDot variant="success" />`}>
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-xs"><BadgeDot variant="success" /> Online</div>
            <div className="flex items-center gap-xs"><BadgeDot variant="warning" /> Away</div>
            <div className="flex items-center gap-xs"><BadgeDot variant="destructive" /> Offline</div>
          </div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">Badge</h3>
        <PropsTable rows={[
          ["variant", '"default" | "secondary" | "outline" | "ghost" | "destructive" | "emphasis" | "success" | "warning"', '"default"', "Color variant"],
          ["level", '"primary" | "secondary"', '"primary"', "Visual weight (primary=solid, secondary=subtle)"],
          ["size", '"sm" | "default" | "lg"', '"default"', "Badge size"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">BadgeRound</h3>
        <PropsTable rows={[
          ["variant", "same as Badge", '"default"', "Color variant"],
          ["size", '"sm" | "default" | "lg"', '"default"', "Circle size (20/24/28px)"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">BadgeDot</h3>
        <PropsTable rows={[
          ["variant", '"default" | "secondary" | "destructive" | "emphasis" | "success" | "warning"', '"default"', "Dot color"],
          ["size", '"sm" | "default" | "lg"', '"default"', "Dot size (4/8/12px)"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import { Badge } from "@/components/ui/badge"`} />
      <DesignTokensTable rows={[["--primary","violet-600","Default badge background"],["--secondary","zinc-100","Secondary badge"],["--success","green-500","Success status"],["--warning","amber-500","Warning status"],["--destructive","red-500","Destructive status"]]} />
      <BestPractices items={[{do:"Use semantic variants (success, warning, destructive) for status indicators.",dont:"Use badges for interactive actions — use Button instead."},{do:"Keep badge text concise — 1-2 words maximum.",dont:"Put long text or full sentences inside badges."}]} />
      <FigmaMapping rows={[["Variant","Default","variant",'"default"'],["Variant","Success","variant",'"success"'],["Level","Primary","level",'"primary"'],["Level","Secondary","level",'"secondary"'],["Size","Small","size",'"sm"'],["Size","Default","size",'"default"'],["Size","Large","size",'"lg"']]} />
      <AccessibilityInfo keyboard={[["\u2014","Badge is not interactive"]]} notes={["Badge is purely presentational","Use aria-label if badge conveys essential meaning"]} />
      <RelatedComponents items={[{name:"BadgeRound",desc:"Circular badge for counts."},{name:"BadgeDot",desc:"Small status indicator dot."}]} />
    </div>
  )
}

function CheckboxDocs() {
  const [checked, setChecked] = useState<boolean | "indeterminate">(false)
  const [state, setState] = useState("default")
  const isDisabled = state === "disabled"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Checkbox</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A control that allows the user to toggle between checked and not checked. Supports indeterminate state.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Value", type: "select", options: ["unchecked","checked","indeterminate"], value: checked === true ? "checked" : checked === "indeterminate" ? "indeterminate" : "unchecked", onChange: (v: string) => setChecked(v === "checked" ? true : v === "indeterminate" ? "indeterminate" : false) },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
      ]}>
        <div className={cn("flex items-center gap-xs pointer-events-none", isFocus && "[&_button]:ring-2 [&_button]:ring-ring")}>
          <Checkbox checked={checked} onCheckedChange={setChecked} disabled={isDisabled} id="exp-cb" />
          <Label htmlFor="exp-cb">Accept terms</Label>
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Checkbox />`}>
          <div className="flex items-center gap-xs">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
          </div>
        </Example>
        <Example title="Checked" code={`<Checkbox checked />`}>
          <div className="flex items-center gap-xs">
            <Checkbox checked id="checked" />
            <Label htmlFor="checked">Checked</Label>
          </div>
        </Example>
        <Example title="Indeterminate" code={`<Checkbox checked="indeterminate" />`}>
          <div className="flex items-center gap-xs">
            <Checkbox checked="indeterminate" id="indet" />
            <Label htmlFor="indet">Select All (partial)</Label>
          </div>
        </Example>
        <Example title="Disabled" code={`<Checkbox disabled />`}>
          <div className="flex items-center gap-xs">
            <Checkbox disabled id="dis" />
            <Label htmlFor="dis" className="opacity-50">Disabled</Label>
          </div>
          <div className="flex items-center gap-xs">
            <Checkbox disabled checked id="dis2" />
            <Label htmlFor="dis2" className="opacity-50">Disabled checked</Label>
          </div>
        </Example>
        <Example title="Interactive" code={`const [checked, setChecked] = useState(false)\n<Checkbox checked={checked} onCheckedChange={setChecked} />`}>
          <div className="flex items-center gap-xs">
            <Checkbox checked={checked} onCheckedChange={setChecked} id="interactive" />
            <Label htmlFor="interactive">{checked === true ? "Checked" : checked === "indeterminate" ? "Indeterminate" : "Unchecked"}</Label>
          </div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["checked", 'boolean | "indeterminate"', "false", "Controlled checked state"],
          ["onCheckedChange", "(checked: boolean | 'indeterminate') => void", "—", "Callback when checked changes"],
          ["disabled", "boolean", "false", "Disable the checkbox"],
          ["aria-invalid", "boolean", "false", "Show error ring styling"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-checkbox"]} importCode={`import { Checkbox } from "@/components/ui/checkbox"`} />
      <DesignTokensTable rows={[["--primary","violet-600","Checked background"],["--primary-foreground","white","Check icon color"],["--border","zinc-200","Unchecked border"],["--ring","violet-600/30","Focus ring"],["--ring-error","red-500/30","Error state ring"]]} />
      <BestPractices items={[{do:"Always pair with a <Label> for click target and accessibility.",dont:"Use a standalone checkbox without any visible label."},{do:"Use indeterminate state for parent checkboxes in a tree.",dont:"Mix checkbox and switch for the same type of setting."}]} />
      <FigmaMapping rows={[["Value","Unchecked","checked","false"],["Value","Checked","checked","true"],["Value","Indeterminate","checked",'"indeterminate"'],["State","Disabled","disabled","true"],["State","Error","aria-invalid","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus the checkbox"],["Space","Toggle checked state"]]} notes={["Uses aria-checked for screen readers","Indeterminate state must be set programmatically"]} />
      <RelatedComponents items={[{name:"Switch",desc:"For immediate on/off settings."},{name:"Radio",desc:"For selecting one from a group."}]} />
    </div>
  )
}

function SwitchDocs() {
  const [on, setOn] = useState(false)
  const [state, setState] = useState("default")
  const isDisabled = state === "disabled"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Switch</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A toggle switch for boolean on/off settings.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Checked", type: "toggle", value: on, onChange: setOn },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
      ]}>
        <div className={cn("flex items-center gap-xs pointer-events-none", isFocus && "[&_button]:ring-2 [&_button]:ring-ring")}>
          <Switch checked={on} onCheckedChange={setOn} disabled={isDisabled} /><Label>{on ? "On" : "Off"}</Label>
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Switch />`}>
          <div className="flex items-center gap-xs"><Switch id="s1" /><Label htmlFor="s1">Airplane Mode</Label></div>
        </Example>
        <Example title="Checked" code={`<Switch checked />`}>
          <div className="flex items-center gap-xs"><Switch checked id="s2" /><Label htmlFor="s2">Enabled</Label></div>
        </Example>
        <Example title="Disabled" code={`<Switch disabled />`}>
          <div className="flex items-center gap-xs"><Switch disabled id="s3" /><Label htmlFor="s3">Disabled</Label></div>
        </Example>
        <Example title="Interactive" code={`const [on, setOn] = useState(false)\n<Switch checked={on} onCheckedChange={setOn} />`}>
          <div className="flex items-center gap-xs">
            <Switch checked={on} onCheckedChange={setOn} id="s4" />
            <Label htmlFor="s4">{on ? "On" : "Off"}</Label>
          </div>
        </Example>
        <Example title="Settings Pattern" description="Multiple toggles in a settings panel." code={`<div className="space-y-md">\n  <div className="flex justify-between"><Label>Notifications</Label><Switch /></div>\n  <div className="flex justify-between"><Label>Dark Mode</Label><Switch checked /></div>\n</div>`}>
          <div className="space-y-md w-full max-w-xs">
            <div className="flex items-center justify-between"><Label>Notifications</Label><Switch /></div>
            <Separator />
            <div className="flex items-center justify-between"><Label>Dark Mode</Label><Switch defaultChecked /></div>
            <Separator />
            <div className="flex items-center justify-between"><Label>Auto-save</Label><Switch defaultChecked /></div>
          </div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["checked", "boolean", "false", "Controlled toggle state"],
          ["onCheckedChange", "(checked: boolean) => void", "—", "Callback when toggled"],
          ["disabled", "boolean", "false", "Disable the switch"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-switch"]} importCode={`import { Switch } from "@/components/ui/switch"`} />
      <DesignTokensTable rows={[["--primary","violet-600","On state track"],["--input","zinc-200","Off state track"],["--background","white","Thumb color"],["--ring","violet-600/30","Focus ring"]]} />
      <BestPractices items={[{do:"Use Switch for settings that take effect immediately.",dont:"Use Switch for choices that require a form submit — use Checkbox instead."},{do:"Pair with Label on the same row for clear association.",dont:"Stack switch and label vertically when space allows horizontal layout."}]} />
      <FigmaMapping rows={[["State","Off","checked","false"],["State","On","checked","true"],["State","Disabled","disabled","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus the switch"],["Space","Toggle on/off"]]} notes={["Uses role=\"switch\" with aria-checked","Prefer Switch for instant-effect settings"]} />
      <RelatedComponents items={[{name:"Checkbox",desc:"For form submissions requiring save."},{name:"Toggle",desc:"For toolbar-style on/off."}]} />
    </div>
  )
}

function ToggleDocs() {
  const [v, setV] = useState("default")
  const [sz, setSz] = useState("default")
  const [pressed, setPressed] = useState(false)
  const [state, setState] = useState("default")
  const isDisabled = state === "disabled"
  const isHover = state === "hover"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Toggle</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A two-state button that can be on or off. Used in toolbars and formatting controls.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Variant", type: "select", options: ["default","outline"], value: v, onChange: setV },
        { label: "Size", type: "select", options: ["sm","default","lg"], value: sz, onChange: setSz },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
        { label: "Pressed", type: "toggle", value: pressed, onChange: setPressed },
      ]}>
        <div className={cn("pointer-events-none", isFocus && "[&_button]:ring-2 [&_button]:ring-ring")}>
          <Toggle variant={v as any} size={sz as any} pressed={pressed} disabled={isDisabled} className={cn(isHover && "bg-muted")}><Bold className="size-4" /></Toggle>
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Toggle><Bold className="size-4" /></Toggle>`}>
          <Toggle><Bold className="size-4" /></Toggle>
          <Toggle><Italic className="size-4" /></Toggle>
          <Toggle><Underline className="size-4" /></Toggle>
        </Example>
        <Example title="Outline Variant" code={`<Toggle variant="outline"><Bold className="size-4" /></Toggle>`}>
          <Toggle variant="outline"><Bold className="size-4" /></Toggle>
          <Toggle variant="outline"><Italic className="size-4" /></Toggle>
        </Example>
        <Example title="Sizes" code={`<Toggle size="sm" />\n<Toggle />\n<Toggle size="lg" />`}>
          <Toggle size="sm"><Bold className="size-4" /></Toggle>
          <Toggle><Bold className="size-4" /></Toggle>
          <Toggle size="lg"><Bold className="size-5" /></Toggle>
        </Example>
        <Example title="With Text" code={`<Toggle><Bold className="size-4" /> Bold</Toggle>`}>
          <Toggle><Bold className="size-4" /> Bold</Toggle>
          <Toggle><Italic className="size-4" /> Italic</Toggle>
        </Example>
        <Example title="Toggle Group — Single" description="Only one item active at a time." code={`<ToggleGroup type="single">\n  <ToggleGroupItem value="bold"><Bold /></ToggleGroupItem>\n  <ToggleGroupItem value="italic"><Italic /></ToggleGroupItem>\n</ToggleGroup>`}>
          <ToggleGroup type="single">
            <ToggleGroupItem value="bold"><Bold className="size-4" /></ToggleGroupItem>
            <ToggleGroupItem value="italic"><Italic className="size-4" /></ToggleGroupItem>
            <ToggleGroupItem value="underline"><Underline className="size-4" /></ToggleGroupItem>
          </ToggleGroup>
        </Example>
        <Example title="Toggle Group — Multiple" description="Any combination can be active." code={`<ToggleGroup type="multiple" defaultValue={["bold"]}>\n  <ToggleGroupItem value="bold"><Bold /></ToggleGroupItem>\n</ToggleGroup>`}>
          <ToggleGroup type="multiple" defaultValue={["bold"]}>
            <ToggleGroupItem value="bold"><Bold className="size-4" /></ToggleGroupItem>
            <ToggleGroupItem value="italic"><Italic className="size-4" /></ToggleGroupItem>
            <ToggleGroupItem value="underline"><Underline className="size-4" /></ToggleGroupItem>
          </ToggleGroup>
        </Example>
        <Example title="Toggle Group — Outline" code={`<ToggleGroup type="single" variant="outline">...</ToggleGroup>`}>
          <ToggleGroup type="single" variant="outline">
            <ToggleGroupItem value="left">Left</ToggleGroupItem>
            <ToggleGroupItem value="center">Center</ToggleGroupItem>
            <ToggleGroupItem value="right">Right</ToggleGroupItem>
          </ToggleGroup>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">Toggle</h3>
        <PropsTable rows={[
          ["variant", '"default" | "outline"', '"default"', "Visual style variant"],
          ["size", '"sm" | "default" | "lg"', '"default"', "Button size"],
          ["pressed", "boolean", "—", "Controlled pressed state"],
          ["onPressedChange", "(pressed: boolean) => void", "—", "Callback when toggled"],
          ["disabled", "boolean", "false", "Disable the toggle"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">ToggleGroup</h3>
        <PropsTable rows={[
          ["type", '"single" | "multiple"', "—", "Selection mode (required)"],
          ["variant", '"default" | "outline"', '"default"', "Applied to all items"],
          ["size", '"sm" | "default" | "lg"', '"default"', "Applied to all items"],
          ["value", "string | string[]", "—", "Controlled selected value(s)"],
          ["onValueChange", "(value) => void", "—", "Callback when selection changes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-toggle"]} importCode={`import { Toggle, ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle"`} />
      <DesignTokensTable rows={[["--accent","zinc-100","Pressed background"],["--accent-foreground","zinc-900","Pressed text"],["--border","zinc-200","Outline variant border"],["--muted-foreground","zinc-500","Unpressed icon/text"],["--ring","violet-600/30","Focus ring"]]} />
      <BestPractices items={[{do:"Use Toggle for binary view options (grid/list, bold/italic).",dont:"Use Toggle for navigation or primary actions — use Button or Tabs."},{do:"Include aria-label on icon-only toggles.",dont:"Use toggles without clear visual indication of pressed state."}]} />
      <FigmaMapping rows={[["Variant","Default","variant",'"default"'],["Variant","Outline","variant",'"outline"'],["Size","Large","size",'"lg"'],["Size","Default","size",'"default"'],["Size","Small","size",'"sm"'],["State","Pressed","pressed","true"],["State","Disabled","disabled","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus the toggle"],["Enter / Space","Toggle pressed state"],["Arrow Left/Right","Navigate in ToggleGroup"]]} notes={["Uses aria-pressed to communicate toggle state","Icon-only toggles must have aria-label"]} />
      <RelatedComponents items={[{name:"Button",desc:"For one-time actions."},{name:"Switch",desc:"For on/off settings."}]} />
    </div>
  )
}

function AlertDocs() {
  const [v, setV] = useState("default")
  const [showIcon, setShowIcon] = useState(true)
  const [inCard, setInCard] = useState(false)
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Feedback</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Alert</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Displays a callout for important messages. 5 semantic variants for different contexts.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Variant", type: "select", options: ["default","destructive","success","warning","emphasis"], value: v, onChange: setV },
        { label: "Show Icon", type: "toggle", value: showIcon, onChange: setShowIcon },
        { label: "In Card", type: "toggle", value: inCard, onChange: setInCard },
      ]}>
        <Alert variant={v as any} inCard={inCard} className="w-full max-w-md">
          {showIcon && (v === "destructive" ? <AlertCircle className="size-4" /> : v === "success" ? <CheckCircle2 className="size-4" /> : v === "warning" ? <AlertTriangle className="size-4" /> : <Info className="size-4" />)}
          <AlertTitle>Alert Title</AlertTitle>
          <AlertDescription>This is a {v} alert message.</AlertDescription>
        </Alert>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Alert>\n  <AlertTitle>Heads up!</AlertTitle>\n  <AlertDescription>You can add components to your app.</AlertDescription>\n</Alert>`}>
          <Alert className="w-full">
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>You can add components and dependencies to your app using the CLI.</AlertDescription>
          </Alert>
        </Example>
        <Example title="Destructive" code={`<Alert variant="destructive">...</Alert>`}>
          <Alert variant="destructive" className="w-full">
            <AlertCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
          </Alert>
        </Example>
        <Example title="Success" code={`<Alert variant="success">...</Alert>`}>
          <Alert variant="success" className="w-full">
            <CheckCircle2 className="size-4" />
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>Your changes have been saved successfully.</AlertDescription>
          </Alert>
        </Example>
        <Example title="Warning" code={`<Alert variant="warning">...</Alert>`}>
          <Alert variant="warning" className="w-full">
            <AlertTriangle className="size-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>Your free trial expires in 3 days.</AlertDescription>
          </Alert>
        </Example>
        <Example title="Emphasis (Info)" code={`<Alert variant="emphasis">...</Alert>`}>
          <Alert variant="emphasis" className="w-full">
            <Info className="size-4" />
            <AlertTitle>New feature</AlertTitle>
            <AlertDescription>Check out the new analytics dashboard.</AlertDescription>
          </Alert>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["variant", '"default" | "destructive" | "success" | "warning" | "emphasis"', '"default"', "Alert semantic variant"],
          ["inCard", "boolean", "false", "Reduces padding for use inside cards"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AlertTitle / AlertDescription</h3>
        <PropsTable rows={[
          ["children", "ReactNode", "—", "Title or description content"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"`} />
      <DesignTokensTable rows={[["--success-subtle","green-50","Success background"],["--warning-subtle","amber-50","Warning background"],["--destructive-subtle","red-50","Destructive background"],["--emphasis-subtle","violet-50","Emphasis background"],["--border","zinc-200","Default border"],["--foreground","zinc-900","Alert text"]]} />
      <BestPractices items={[{do:"Use semantic variants — success for confirmations, destructive for errors.",dont:"Use default variant for urgent messages that need attention."},{do:"Include an action or next step in the alert description.",dont:"Show multiple alerts stacked without clear priority ordering."}]} />
      <FigmaMapping rows={[["Variant","Default","variant",'"default"'],["Variant","Destructive","variant",'"destructive"'],["Variant","Success","variant",'"success"'],["Variant","Warning","variant",'"warning"'],["Variant","Emphasis","variant",'"emphasis"'],["In Card","true","inCard","true"]]} />
      <AccessibilityInfo keyboard={[["\u2014","Alert is not interactive"]]} notes={["Uses role=\"alert\" for screen reader announcements","Destructive alerts should include action guidance"]} />
      <RelatedComponents items={[{name:"AlertDialog",desc:"For blocking confirmations."},{name:"Badge",desc:"For inline status."}]} />
    </div>
  )
}

function SelectDocs() {
  const [sz, setSz] = useState("default")
  const [state, setState] = useState("default")
  const isDisabled = state === "disabled"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Select</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A dropdown select component with 4 sizes. Built on Radix Select primitive.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Size", type: "select", options: ["lg","default","sm","xs"], value: sz, onChange: setSz },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
      ]}>
        <div className={cn("pointer-events-none", isFocus && "[&_button]:ring-2 [&_button]:ring-ring")}>
          <Select disabled={isDisabled}><SelectTrigger size={sz as any} className="w-[200px]"><SelectValue placeholder="Select option" /></SelectTrigger><SelectContent><SelectItem value="a">Option A</SelectItem><SelectItem value="b">Option B</SelectItem></SelectContent></Select>
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Select>\n  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>\n  <SelectContent>\n    <SelectItem value="1">Option 1</SelectItem>\n  </SelectContent>\n</Select>`}>
          <Select>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select a fruit" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
            </SelectContent>
          </Select>
        </Example>
        <Example title="All Sizes" code={`<SelectTrigger size="lg" />\n<SelectTrigger />\n<SelectTrigger size="sm" />\n<SelectTrigger size="xs" />`}>
          <div className="space-y-sm">
            {(["lg", "default", "sm", "xs"] as const).map(s => (
              <Select key={s}>
                <SelectTrigger size={s} className="w-[200px]"><SelectValue placeholder={`Size: ${s}`} /></SelectTrigger>
                <SelectContent><SelectItem value="a">Option A</SelectItem></SelectContent>
              </Select>
            ))}
          </div>
        </Example>
        <Example title="With Label" code={`<Label>Country</Label>\n<Select>...</Select>`}>
          <div className="space-y-xs w-[200px]">
            <Label>Country</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="vn">Vietnam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">SelectTrigger</h3>
        <PropsTable rows={[
          ["size", '"lg" | "default" | "sm" | "xs"', '"default"', "Trigger height size"],
          ["disabled", "boolean", "false", "Disable the select"],
          ["aria-invalid", "boolean", "false", "Show error border"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">SelectItem</h3>
        <PropsTable rows={[
          ["value", "string", "—", "Item value (required)"],
          ["disabled", "boolean", "false", "Disable this option"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-select"]} importCode={`import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select"`} />
      <DesignTokensTable rows={[["--input","transparent","Trigger background"],["--border","zinc-200","Trigger border"],["--popover","white","Dropdown background"],["--accent","zinc-100","Hover item"],["--ring","violet-600/30","Focus ring"],["--muted-foreground","zinc-500","Placeholder"]]} />
      <BestPractices items={[{do:"Use placeholder text to hint at expected selection.",dont:"Leave select trigger blank without any indication of purpose."},{do:"Group related items with SelectGroup and SelectLabel.",dont:"Put more than 15 items without groups or search — use Combobox instead."}]} />
      <FigmaMapping rows={[["Size","Large","size",'"lg"'],["Size","Default","size",'"default"'],["Size","Small","size",'"sm"'],["State","Disabled","disabled","true"],["State","Error","aria-invalid","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus trigger"],["Enter / Space","Open dropdown"],["Arrow Up/Down","Navigate options"],["Enter","Select option"],["Esc","Close dropdown"]]} notes={["Built on Radix Select with full ARIA","Use placeholder for initial state"]} />
      <RelatedComponents items={[{name:"Combobox",desc:"For searchable selection."},{name:"Radio",desc:"For visible option lists."}]} />
    </div>
  )
}

function ProgressDocs() {
  const [value, setValue] = useState(45)
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Feedback</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Progress</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A progress bar showing completion percentage.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Value", type: "select", options: ["0","25","50","75","100"], value: String(value), onChange: (v: string) => setValue(Number(v)) },
      ]}>
        <Progress value={value} className="w-full max-w-sm" />
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Progress value={45} />`}>
          <Progress value={45} className="w-full max-w-sm" />
        </Example>
        <Example title="Interactive" code={`<Progress value={value} />\n<Slider value={[value]} onValueChange={([v]) => setValue(v)} />`}>
          <div className="space-y-md w-full max-w-sm">
            <Progress value={value} />
            <Slider value={[value]} onValueChange={([v]) => setValue(v)} max={100} step={1} />
            <p className="text-sm text-muted-foreground">{value}% complete</p>
          </div>
        </Example>
        <Example title="Upload Pattern" code={`<div className="space-y-xs"><p>Uploading file...</p><Progress value={73} /></div>`}>
          <div className="space-y-xs w-full max-w-sm">
            <div className="flex justify-between text-sm"><span>Uploading file...</span><span className="text-muted-foreground">73%</span></div>
            <Progress value={73} />
          </div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["value", "number", "0", "Progress percentage (0-100)"],
          ["max", "number", "100", "Maximum progress value"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-progress"]} importCode={`import { Progress } from "@/components/ui/progress"`} />
      <DesignTokensTable rows={[["--primary","violet-600","Indicator fill"],["--muted","zinc-100","Track background"],["--radius-full","9999px","Track border radius"]]} />
      <BestPractices items={[{do:"Include a text label or aria-label describing progress context.",dont:"Use progress bars without any textual indication of what is loading."},{do:"Update value smoothly with transitions for better perceived performance.",dont:"Jump progress from 0 to 100 instantly — use intermediate values."}]} />
      <FigmaMapping rows={[["Value","0-100","value","number"]]} />
      <AccessibilityInfo keyboard={[["\u2014","Progress is not interactive"]]} notes={["Uses role=\"progressbar\" with aria-valuenow","Set aria-label for context"]} />
      <RelatedComponents items={[{name:"Spinner",desc:"For indeterminate loading."},{name:"Skeleton",desc:"For content placeholders."}]} />
    </div>
  )
}

function AvatarDocs() {
  const [avSize, setAvSize] = useState("default")
  const [showImage, setShowImage] = useState(true)
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Data Display</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Avatar</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">An image element with fallback text for user profile pictures.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Size", type: "select", options: ["sm","default","lg"], value: avSize, onChange: setAvSize },
        { label: "Show Image", type: "toggle", value: showImage, onChange: setShowImage },
      ]}>
        <Avatar className={cn(avSize === "sm" && "size-8", avSize === "lg" && "size-14")}>
          {showImage && <AvatarImage src="https://github.com/shadcn.png" alt="User" />}
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="With Image" code={`<Avatar>\n  <AvatarImage src="..." />\n  <AvatarFallback>JD</AvatarFallback>\n</Avatar>`}>
          <Avatar><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>CN</AvatarFallback></Avatar>
        </Example>
        <Example title="Fallback" code={`<Avatar><AvatarFallback>JD</AvatarFallback></Avatar>`}>
          <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>TN</AvatarFallback></Avatar>
        </Example>
        <Example title="Avatar Group" description="Stack avatars for team display." code={`<div className="flex -space-x-2">\n  <Avatar>...</Avatar>\n  <Avatar>...</Avatar>\n</div>`}>
          <div className="flex -space-x-2">
            <Avatar className="border-2 border-background"><AvatarFallback>JD</AvatarFallback></Avatar>
            <Avatar className="border-2 border-background"><AvatarFallback>AB</AvatarFallback></Avatar>
            <Avatar className="border-2 border-background"><AvatarFallback>TN</AvatarFallback></Avatar>
            <Avatar className="border-2 border-background"><AvatarFallback>+3</AvatarFallback></Avatar>
          </div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">AvatarImage</h3>
        <PropsTable rows={[
          ["src", "string", "—", "Image source URL"],
          ["alt", "string", "—", "Alt text for accessibility"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AvatarFallback</h3>
        <PropsTable rows={[
          ["children", "ReactNode", "—", "Fallback content (initials or icon)"],
          ["delayMs", "number", "600", "Delay before showing fallback"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-avatar"]} importCode={`import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"`} />
      <DesignTokensTable rows={[["--muted","zinc-100","Fallback background"],["--muted-foreground","zinc-500","Fallback initials color"],["--radius-full","9999px","Circle shape"],["--border","zinc-200","Optional ring border"]]} />
      <BestPractices items={[{do:"Always provide AvatarFallback with initials for when images fail.",dont:"Use Avatar without a fallback — broken images leave empty circles."},{do:"Include alt text on AvatarImage for screen readers.",dont:"Use decorative avatars without any accessible alternative."}]} />
      <FigmaMapping rows={[["Size","Default (40px)","className",'"size-10"'],["Size","Small (32px)","className",'"size-8"'],["Size","Large (56px)","className",'"size-14"'],["Image","true","AvatarImage","src prop"],["Fallback","initials","AvatarFallback","children"]]} />
      <AccessibilityInfo keyboard={[["\u2014","Avatar is not interactive"]]} notes={["AvatarImage should always have alt text","AvatarFallback shows when image fails"]} />
      <RelatedComponents items={[{name:"Badge",desc:"Often paired for status."},{name:"HoverCard",desc:"Show user details on hover."}]} />
    </div>
  )
}

function SpinnerDocs() {
  const [sz, setSz] = useState("default")
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Feedback</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Spinner</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A loading spinner indicator in 3 sizes.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Size", type: "select", options: ["sm","default","lg"], value: sz, onChange: setSz },
      ]}>
        <Spinner size={sz as any} />
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Sizes" code={`<Spinner size="sm" />\n<Spinner />\n<Spinner size="lg" />`}>
          <Spinner size="sm" /><Spinner /><Spinner size="lg" />
        </Example>
        <Example title="Button Loading" code={`<Button disabled><Spinner size="sm" /> Loading...</Button>`}>
          <Button disabled><Spinner size="sm" /> Loading...</Button>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["size", '"sm" | "default" | "lg"', '"default"', "Spinner size (16/24/32px)"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import { Spinner } from "@/components/ui/spinner"`} />
      <DesignTokensTable rows={[["--primary","violet-600","Default spinner color"],["--muted-foreground","zinc-500","Muted spinner color"]]} />
      <BestPractices items={[{do:"Add aria-label='Loading' to the parent container.",dont:"Use spinners as the only loading indicator — combine with skeleton for layouts."},{do:"Place spinner near the content it represents.",dont:"Show full-page spinners for partial content loads."}]} />
      <FigmaMapping rows={[["Size","Small (16px)","size",'"sm"'],["Size","Default (24px)","size",'"default"'],["Size","Large (32px)","size",'"lg"']]} />
      <AccessibilityInfo keyboard={[["\u2014","Spinner is not interactive"]]} notes={["Add aria-label=\"Loading\" to parent","Use role=\"status\" for announcements"]} />
      <RelatedComponents items={[{name:"Progress",desc:"For determinate loading."},{name:"Skeleton",desc:"For content placeholders."}]} />
    </div>
  )
}

function SeparatorDocs() {
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Layout</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Separator</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A visual divider between sections. Horizontal or vertical orientation.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Horizontal" code={`<Separator />`}>
          <div className="w-full space-y-sm"><p className="text-sm">Above</p><Separator /><p className="text-sm">Below</p></div>
        </Example>
        <Example title="Vertical" code={`<Separator orientation="vertical" className="h-6" />`}>
          <div className="flex items-center gap-md h-6">
            <span className="text-sm">Left</span>
            <Separator orientation="vertical" />
            <span className="text-sm">Right</span>
          </div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["orientation", '"horizontal" | "vertical"', '"horizontal"', "Line direction"],
          ["decorative", "boolean", "true", "Whether purely visual (no aria role)"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-separator"]} importCode={`import { Separator } from "@/components/ui/separator"`} />
      <DesignTokensTable rows={[["--border","zinc-200","Separator line color"],["--spacing-md","12px","Default margin around separator"]]} />
      <BestPractices items={[{do:"Use Separator to divide distinct content groups.",dont:"Use Separator between every element — it adds visual noise."},{do:"Set decorative=true when separator is purely visual.",dont:"Rely on separator for semantic grouping — use heading hierarchy instead."}]} />
      <FigmaMapping rows={[["Orientation","Horizontal","orientation",'"horizontal"'],["Orientation","Vertical","orientation",'"vertical"']]} />
      <AccessibilityInfo keyboard={[["\u2014","Separator is not interactive"]]} notes={["Uses role=\"separator\" by default","Set decorative=true to hide from screen readers"]} />
      <RelatedComponents items={[{name:"Card",desc:"For bordered content containers."}]} />
    </div>
  )
}

function SkeletonDocs() {
  const [shape, setShape] = useState("card")
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Feedback</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Skeleton</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A placeholder animation for loading content.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Shape", type: "select", options: ["card","text","avatar","line"], value: shape, onChange: setShape },
      ]}>
        {shape === "card" && (
          <div className="space-y-sm w-full max-w-xs">
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}
        {shape === "text" && (
          <div className="space-y-xs w-full max-w-xs">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        )}
        {shape === "avatar" && (
          <div className="flex items-center gap-md">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-xs"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div>
          </div>
        )}
        {shape === "line" && <Skeleton className="h-4 w-full max-w-xs" />}
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Card Skeleton" code={`<Skeleton className="h-[120px] w-full rounded-xl" />\n<Skeleton className="h-4 w-3/4" />\n<Skeleton className="h-4 w-1/2" />`}>
          <div className="space-y-sm w-full max-w-xs">
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </Example>
        <Example title="User Row" code={`<div className="flex items-center gap-md">\n  <Skeleton className="size-10 rounded-full" />\n  <div className="space-y-xs">\n    <Skeleton className="h-4 w-32" />\n    <Skeleton className="h-3 w-20" />\n  </div>\n</div>`}>
          <div className="flex items-center gap-md">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-xs"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div>
          </div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["className", "string", '""', "Controls size, shape (rounded-full, h-4, w-[200px] etc.)"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import { Skeleton } from "@/components/ui/skeleton"`} />
      <DesignTokensTable rows={[["--muted","zinc-100","Skeleton background"],["--radius-md","10px","Default border radius"]]} />
      <BestPractices items={[{do:"Match skeleton shapes to the content they replace (text → rectangle, avatar → circle).",dont:"Use a single generic skeleton for all content types."},{do:"Use aria-hidden on skeleton containers and announce loading state.",dont:"Leave skeletons on screen indefinitely — always transition to content or error."}]} />
      <FigmaMapping rows={[["Shape","Rectangle","className",'"h-4 w-full"'],["Shape","Circle","className",'"rounded-full size-10"'],["Shape","Card","className",'"h-[120px] rounded-xl"']]} />
      <AccessibilityInfo keyboard={[["\u2014","Skeleton is not interactive"]]} notes={["Use aria-hidden on skeleton containers","Replace with actual content once loaded"]} />
      <RelatedComponents items={[{name:"Spinner",desc:"For indeterminate loading."},{name:"Progress",desc:"For progress bar."}]} />
    </div>
  )
}

function TabsDocs() {
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Navigation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Tabs</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A set of layered sections of content known as tab panels.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Tabs defaultValue="account">\n  <TabsList>\n    <TabsTrigger value="account">Account</TabsTrigger>\n    <TabsTrigger value="password">Password</TabsTrigger>\n  </TabsList>\n  <TabsContent value="account">Account settings...</TabsContent>\n  <TabsContent value="password">Password settings...</TabsContent>\n</Tabs>`}>
          <Tabs defaultValue="account" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            <TabsContent value="account"><p className="text-sm text-muted-foreground p-md">Make changes to your account here.</p></TabsContent>
            <TabsContent value="password"><p className="text-sm text-muted-foreground p-md">Change your password here.</p></TabsContent>
            <TabsContent value="billing"><p className="text-sm text-muted-foreground p-md">Manage your billing info.</p></TabsContent>
          </Tabs>
        </Example>
        <Example title="With Icons" description="Tabs with icon + label." code={`<TabsTrigger value="profile"><User /> Profile</TabsTrigger>`}>
          <Tabs defaultValue="profile" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="profile"><User className="size-4 mr-1" />Profile</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="size-4 mr-1" />Notifications</TabsTrigger>
              <TabsTrigger value="settings"><Settings className="size-4 mr-1" />Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="profile"><p className="text-sm text-muted-foreground p-md">Your profile details.</p></TabsContent>
            <TabsContent value="notifications"><p className="text-sm text-muted-foreground p-md">Notification preferences.</p></TabsContent>
            <TabsContent value="settings"><p className="text-sm text-muted-foreground p-md">General settings.</p></TabsContent>
          </Tabs>
        </Example>
        <Example title="Disabled Tab" description="Individual tabs can be disabled." code={`<TabsTrigger value="billing" disabled>Billing</TabsTrigger>`}>
          <Tabs defaultValue="general" className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
              <TabsTrigger value="api">API</TabsTrigger>
            </TabsList>
            <TabsContent value="general"><p className="text-sm text-muted-foreground p-md">General settings content.</p></TabsContent>
            <TabsContent value="api"><p className="text-sm text-muted-foreground p-md">API key management.</p></TabsContent>
          </Tabs>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">Tabs</h3>
        <PropsTable rows={[
          ["defaultValue", "string", "—", "Default active tab (uncontrolled)"],
          ["value", "string", "—", "Controlled active tab"],
          ["onValueChange", "(value: string) => void", "—", "Callback on tab change"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">TabsTrigger</h3>
        <PropsTable rows={[
          ["value", "string", "—", "Unique tab identifier (required)"],
          ["disabled", "boolean", "false", "Disable this tab"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-tabs"]} importCode={`import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"`} />
      <DesignTokensTable rows={[["--muted","zinc-100","Tab list background"],["--background","white","Active tab background"],["--foreground","zinc-900","Active tab text"],["--muted-foreground","zinc-500","Inactive tab text"],["--ring","violet-600/30","Focus ring"]]} />
      <BestPractices items={[{do:"Use Tabs for switching between related views within the same context.",dont:"Use Tabs for navigation between different pages — use links instead."},{do:"Keep tab labels short (1-2 words) and descriptive.",dont:"Put more than 6 tabs in a single TabsList — use a dropdown for overflow."}]} />
      <FigmaMapping rows={[["State","Default","\u2014","default"],["State","Active","value","tab-id"],["State","Disabled","disabled","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus tab list"],["Arrow Left/Right","Navigate tabs"],["Enter / Space","Activate tab"],["Home / End","First/last tab"]]} notes={["Uses role=\"tablist\", role=\"tab\", role=\"tabpanel\"","Each tab has aria-selected and aria-controls"]} />
      <RelatedComponents items={[{name:"Accordion",desc:"For stacked expandable sections."},{name:"Select",desc:"For compact selection."}]} />
    </div>
  )
}

function TextareaDocs() {
  const [state, setState] = useState("default")
  const [rows, setRows] = useState("3")
  const isDisabled = state === "disabled"
  const isError = state === "error"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Textarea</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A multi-line text input for longer content like comments or descriptions.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "State", type: "select", options: ["default","focus","error","disabled"], value: state, onChange: setState },
        { label: "Rows", type: "select", options: ["2","3","4","5"], value: rows, onChange: setRows },
      ]}>
        <Textarea rows={Number(rows)} disabled={isDisabled} aria-invalid={isError || undefined} placeholder="Type your message..." className={cn("max-w-sm", isFocus && "ring-2 ring-ring")} />
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Textarea placeholder="Type your message here." />`}>
          <Textarea placeholder="Type your message here." className="max-w-sm" />
        </Example>
        <Example title="With Label" code={`<Label>Bio</Label>\n<Textarea placeholder="Tell us about yourself" />`}>
          <div className="space-y-xs w-full max-w-sm">
            <Label>Bio</Label>
            <Textarea placeholder="Tell us about yourself" />
          </div>
        </Example>
        <Example title="Disabled" code={`<Textarea disabled value="This textarea is disabled" />`}>
          <Textarea disabled value="This textarea is disabled" className="max-w-sm" />
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["placeholder", "string", "—", "Placeholder text"],
          ["rows", "number", "3", "Number of visible text rows"],
          ["disabled", "boolean", "false", "Disable the textarea"],
          ["aria-invalid", "boolean", "false", "Show error border styling"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import { Textarea } from "@/components/ui/textarea"`} />
      <DesignTokensTable rows={[["--input","transparent","Background"],["--border","zinc-200","Default border"],["--ring","violet-600/30","Focus ring"],["--ring-error","red-500/30","Error ring"],["--muted-foreground","zinc-500","Placeholder"]]} />
      <BestPractices items={[{do:"Set a visible minimum height with the rows prop.",dont:"Use Textarea for single-line input — use Input instead."},{do:"Provide a character count or max length hint for long-form fields.",dont:"Allow unlimited text without any size guidance."}]} />
      <FigmaMapping rows={[["State","Default","\u2014","default"],["State","Error","aria-invalid","true"],["State","Disabled","disabled","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus textarea"],["Shift+Tab","Move focus away"]]} notes={["Always pair with <Label>","Use rows prop to control height"]} />
      <RelatedComponents items={[{name:"Input",desc:"For single-line text."},{name:"Select",desc:"For choosing options."}]} />
    </div>
  )
}

function RadioDocs() {
  const [checked, setChecked] = useState(true)
  const [state, setState] = useState("default")
  const isDisabled = state === "disabled"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Radio</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A set of radio buttons for selecting a single option from a list. Uses RadioGroup and RadioGroupItem from Radix.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Checked", type: "select", options: ["checked","unchecked"], value: checked ? "checked" : "unchecked", onChange: (v: string) => setChecked(v === "checked") },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
      ]}>
        <div className={cn("flex items-center gap-xs pointer-events-none", isFocus && "[&_button]:ring-2 [&_button]:ring-ring")}>
          <RadioGroup value={checked ? "on" : undefined} disabled={isDisabled}>
            <RadioGroupItem value="on" id="eb-radio" />
          </RadioGroup>
          <Label htmlFor="eb-radio">Option label</Label>
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Single Item" description="A single radio with label." code={`<RadioGroup defaultValue="yes">\n  <div className="flex items-center gap-xs">\n    <RadioGroupItem value="yes" id="r1" />\n    <Label htmlFor="r1">Accept</Label>\n  </div>\n</RadioGroup>`}>
          <RadioGroup defaultValue="yes">
            <div className="flex items-center gap-xs"><RadioGroupItem value="yes" id="rs1" /><Label htmlFor="rs1">Accept terms</Label></div>
          </RadioGroup>
        </Example>
        <Example title="Radio Group" description="Select one option from a list." code={`<RadioGroup defaultValue="option-1">\n  <RadioGroupItem value="option-1" />\n  <RadioGroupItem value="option-2" />\n</RadioGroup>`}>
          <RadioGroup defaultValue="comfortable">
            <div className="flex items-center gap-xs"><RadioGroupItem value="default" id="rg1" /><Label htmlFor="rg1">Default</Label></div>
            <div className="flex items-center gap-xs"><RadioGroupItem value="comfortable" id="rg2" /><Label htmlFor="rg2">Comfortable</Label></div>
            <div className="flex items-center gap-xs"><RadioGroupItem value="compact" id="rg3" /><Label htmlFor="rg3">Compact</Label></div>
          </RadioGroup>
        </Example>
        <Example title="Horizontal" description="Horizontal layout for short options." code={`<RadioGroup className="flex gap-md">...</RadioGroup>`}>
          <RadioGroup defaultValue="monthly" className="flex gap-lg">
            <div className="flex items-center gap-xs"><RadioGroupItem value="monthly" id="rh1" /><Label htmlFor="rh1">Monthly</Label></div>
            <div className="flex items-center gap-xs"><RadioGroupItem value="yearly" id="rh2" /><Label htmlFor="rh2">Yearly</Label></div>
          </RadioGroup>
        </Example>
        <Example title="Disabled" description="Non-interactive state." code={`<RadioGroup disabled>...</RadioGroup>`}>
          <RadioGroup disabled defaultValue="option-1">
            <div className="flex items-center gap-xs"><RadioGroupItem value="option-1" id="rd1" /><Label htmlFor="rd1">Option 1</Label></div>
            <div className="flex items-center gap-xs"><RadioGroupItem value="option-2" id="rd2" /><Label htmlFor="rd2">Option 2</Label></div>
          </RadioGroup>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">RadioGroup</h3>
        <PropsTable rows={[
          ["defaultValue", "string", "—", "Default selected value (uncontrolled)"],
          ["value", "string", "—", "Controlled selected value"],
          ["onValueChange", "(value: string) => void", "—", "Callback when selection changes"],
          ["disabled", "boolean", "false", "Disable all radio items"],
          ["orientation", '"horizontal" | "vertical"', '"vertical"', "Layout direction"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">RadioGroupItem</h3>
        <PropsTable rows={[
          ["value", "string", "—", "Item value (required)"],
          ["disabled", "boolean", "false", "Disable this item"],
          ["id", "string", "—", "ID for label association"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-radio-group"]} importCode={`import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"`} />
      <DesignTokensTable rows={[["--primary","violet-600","Selected indicator"],["--border","zinc-200","Unselected border"],["--ring","violet-600/30","Focus ring"],["--muted-foreground","zinc-500","Disabled text"]]} />
      <BestPractices items={[{do:"Use RadioGroup for mutually exclusive options (2-5 choices).",dont:"Use Radio for more than 5 options — use Select or Combobox instead."},{do:"Always show all options at once — don't hide radio items behind a toggle.",dont:"Use radio buttons for binary choices — use Switch or Checkbox."}]} />
      <FigmaMapping rows={[["State","Default","\u2014","default"],["State","Checked","value","option-id"],["State","Disabled","disabled","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus radio group"],["Arrow Up/Down","Navigate options"],["Space","Select focused option"]]} notes={["Uses role=\"radiogroup\" with role=\"radio\"","Each item has aria-checked"]} />
      <RelatedComponents items={[{name:"Checkbox",desc:"For multiple selections."},{name:"Select",desc:"For dropdown selection."},{name:"Toggle",desc:"For binary states."}]} />
    </div>
  )
}

function TooltipDocs() {
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Tooltip</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A popup that displays information related to an element when it receives focus or hover.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Tooltip>\n  <TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger>\n  <TooltipContent>Add to library</TooltipContent>\n</Tooltip>`}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild><Button variant="outline">Hover me</Button></TooltipTrigger>
              <TooltipContent><p>Add to library</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </Example>
        <Example title="Positions" description="Tooltip can appear on any side." code={`<TooltipContent side="top">Top</TooltipContent>`}>
          <TooltipProvider>
            <div className="flex gap-md">
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm">Top</Button></TooltipTrigger><TooltipContent side="top">Top tooltip</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm">Right</Button></TooltipTrigger><TooltipContent side="right">Right tooltip</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm">Bottom</Button></TooltipTrigger><TooltipContent side="bottom">Bottom tooltip</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button variant="outline" size="sm">Left</Button></TooltipTrigger><TooltipContent side="left">Left tooltip</TooltipContent></Tooltip>
            </div>
          </TooltipProvider>
        </Example>
        <Example title="On Icon Button" description="Common pattern for icon-only buttons." code={`<Tooltip><TooltipTrigger asChild><Button size="icon"><Plus /></Button></TooltipTrigger>...`}>
          <TooltipProvider>
            <div className="flex gap-xs">
              <Tooltip><TooltipTrigger asChild><Button size="icon" variant="outline"><Pencil className="size-4" /></Button></TooltipTrigger><TooltipContent>Edit</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button size="icon" variant="outline"><Share className="size-4" /></Button></TooltipTrigger><TooltipContent>Share</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button size="icon" variant="outline"><Trash2 className="size-4" /></Button></TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
            </div>
          </TooltipProvider>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">TooltipContent</h3>
        <PropsTable rows={[
          ["side", '"top" | "right" | "bottom" | "left"', '"top"', "Tooltip placement"],
          ["sideOffset", "number", "4", "Distance from trigger in px"],
          ["align", '"start" | "center" | "end"', '"center"', "Alignment relative to trigger"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-tooltip"]} importCode={`import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"`} />
      <DesignTokensTable rows={[["--popover","zinc-900","Tooltip background"],["--popover-foreground","zinc-50","Tooltip text"],["--radius-md","10px","Border radius"]]} />
      <BestPractices items={[{do:"Use Tooltip for supplementary info on icon-only buttons and truncated text.",dont:"Put essential information in tooltips — it's hidden on touch devices."},{do:"Keep tooltip text to one short sentence.",dont:"Include interactive content (links, buttons) inside tooltips — use Popover."}]} />
      <FigmaMapping rows={[["Side","Top","side",'"top"'],["Side","Right","side",'"right"'],["Side","Bottom","side",'"bottom"'],["Side","Left","side",'"left"']]} />
      <AccessibilityInfo keyboard={[["Tab","Focus trigger to show"],["Esc","Dismiss tooltip"]]} notes={["Content announced via aria-describedby","No interactive content inside tooltips"]} />
      <RelatedComponents items={[{name:"Popover",desc:"For interactive floating content."},{name:"HoverCard",desc:"For rich hover previews."}]} />
    </div>
  )
}

// ============================================================
// ADDITIONAL COMPONENT DOCS
// ============================================================

function CardDocs() {
  const [showHeader, setShowHeader] = useState(true)
  const [showFooter, setShowFooter] = useState(true)
  const [state, setState] = useState("default")
  const isHover = state === "hover"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Layout</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Card</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A container for grouping related content with header, content, and footer slots.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "State", type: "select", options: ["default","hover"], value: state, onChange: setState },
        { label: "Show Header", type: "toggle", value: showHeader, onChange: setShowHeader },
        { label: "Show Footer", type: "toggle", value: showFooter, onChange: setShowFooter },
      ]}>
        <Card className={cn("w-full max-w-sm transition-shadow", isHover && "shadow-md")}>
          {showHeader && <CardHeader><CardTitle>Card Title</CardTitle><CardDescription>Description text for this card.</CardDescription></CardHeader>}
          <CardContent className={cn(!showHeader && "pt-md")}><p className="text-sm text-muted-foreground">Card content area. Any element can go here.</p></CardContent>
          {showFooter && <CardFooter className="flex justify-between"><Button variant="ghost" size="sm">Cancel</Button><Button size="sm">Save</Button></CardFooter>}
        </Card>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default Card" code={`<Card>\n  <CardHeader>\n    <CardTitle>Title</CardTitle>\n    <CardDescription>Description</CardDescription>\n  </CardHeader>\n  <CardContent>Content here</CardContent>\n</Card>`}>
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>Project Alpha</CardTitle><CardDescription>Active project with 12 tasks remaining</CardDescription></CardHeader>
            <CardContent><p className="text-sm">Last updated 2 hours ago. Team members: 5</p></CardContent>
            <CardFooter className="flex justify-between"><Button variant="ghost" size="sm">View</Button><Button size="sm">Open</Button></CardFooter>
          </Card>
        </Example>
        <Example title="Stats Card" description="KPI dashboard card pattern." code={`<Card><CardHeader>...</CardHeader><CardContent>$45,231.89</CardContent></Card>`}>
          <div className="grid grid-cols-2 gap-md w-full">
            <Card><CardHeader className="pb-2"><CardDescription>Total Revenue</CardDescription><CardTitle className="text-2xl font-bold">$45,231.89</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">+20.1% from last month</p></CardContent></Card>
            <Card><CardHeader className="pb-2"><CardDescription>Active Users</CardDescription><CardTitle className="text-2xl font-bold">2,350</CardTitle></CardHeader><CardContent><p className="text-xs text-muted-foreground">+180 since last week</p></CardContent></Card>
          </div>
        </Example>
        <Example title="With Form" code={`<Card>...<CardContent><Input /><Button /></CardContent></Card>`}>
          <Card className="w-full max-w-sm">
            <CardHeader><CardTitle>Create project</CardTitle><CardDescription>Deploy your new project in one-click.</CardDescription></CardHeader>
            <CardContent className="space-y-md"><div className="space-y-xs"><Label>Name</Label><Input placeholder="Project name" /></div><div className="space-y-xs"><Label>Description</Label><Textarea placeholder="Describe your project" /></div></CardContent>
            <CardFooter className="flex justify-between"><Button variant="outline">Cancel</Button><Button>Create</Button></CardFooter>
          </Card>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["className", "string", '""', "Additional CSS classes"],
          ["children", "ReactNode", "—", "CardHeader, CardContent, CardFooter"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"`} />
      <DesignTokensTable rows={[["--card","white","Card background"],["--card-foreground","zinc-900","Card text"],["--border","zinc-200","Card border"],["--radius-xl","16px","Card border radius"],["--shadow-sm","0 1px 2px...","Card shadow"]]} />
      <BestPractices items={[{do:"Use Card as a content container — combine with sub-components for structure.",dont:"Nest Cards inside other Cards — flatten the hierarchy instead."},{do:"Use CardHeader for title + description, CardContent for body, CardFooter for actions.",dont:"Put all content in a single div inside Card without sub-components."}]} />
      <FigmaMapping rows={[["Show Header","true","CardHeader","present"],["Show Footer","true","CardFooter","present"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus interactive elements inside"]]} notes={["Card is a container, not a link","Use sub-components for structure"]} />
      <RelatedComponents items={[{name:"Accordion",desc:"For collapsible sections."},{name:"Dialog",desc:"For modal content."}]} />
    </div>
  )
}

function DialogDocs() {
  const [type, setType] = useState("Desktop")
  const [showClose, setShowClose] = useState(true)
  const [showTitle, setShowTitle] = useState(true)
  const [showDesc, setShowDesc] = useState(true)
  const [showFooter, setShowFooter] = useState(true)

  const isMobile = type.startsWith("Mobile")
  const isScrollable = type.includes("Scrollable") || type.includes("Full Screen")

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Dialog</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Modal dialog with overlay. Interrupts the user with important content and expects a response.</p>
      </header>

      {/* Explore Behavior — static preview */}
      <ExploreBehavior controls={[
        { label: "Type", type: "select", options: ["Desktop", "Desktop Scrollable", "Mobile", "Mobile Full Screen"], value: type, onChange: setType },
        { label: "Show Close Button", type: "toggle", value: showClose, onChange: setShowClose },
        { label: "Show Title", type: "toggle", value: showTitle, onChange: setShowTitle },
        { label: "Show Description", type: "toggle", value: showDesc, onChange: setShowDesc },
        { label: "Show Footer", type: "toggle", value: showFooter, onChange: setShowFooter },
      ]}>
        <div className={cn(
          "relative bg-card border border-border shadow pointer-events-none w-full",
          isMobile ? "max-w-xs" : "max-w-lg",
          type === "Mobile Full Screen" ? "rounded-none" : "rounded-xl",
        )}>
          {isScrollable ? (
            <>
              {/* Scrollable: header / content / footer as separate sections */}
              <div className={cn("p-md", showClose && "pr-xl")}>
                {showClose && <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>}
                <div className="flex flex-col gap-xs">
                  {showTitle && <h3 className="text-base font-semibold text-foreground font-heading">Edit profile</h3>}
                  {showDesc && <p className="text-sm text-muted-foreground font-body">Make changes to your profile here. Click save when you're done.</p>}
                </div>
              </div>
              <div className="border-t border-b border-border p-md max-h-[160px] overflow-y-auto">
                <div className="space-y-md">
                  <div className="grid grid-cols-4 items-center gap-md"><Label className="text-right text-sm">Name</Label><Input defaultValue="Pedro Duarte" className="col-span-3" readOnly /></div>
                  <div className="grid grid-cols-4 items-center gap-md"><Label className="text-right text-sm">Username</Label><Input defaultValue="@peduarte" className="col-span-3" readOnly /></div>
                  <div className="grid grid-cols-4 items-center gap-md"><Label className="text-right text-sm">Email</Label><Input defaultValue="pedro@example.com" className="col-span-3" readOnly /></div>
                </div>
              </div>
              {showFooter && (
                <div className={cn("p-md", isMobile ? "flex flex-col-reverse gap-xs" : "flex justify-end gap-xs")}>
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button size="sm">Save changes</Button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Standard: title/desc + content + footer */}
              <div className={cn("p-md", showClose && "pr-xl")}>
                {showClose && <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>}
                <div className="flex flex-col gap-xs">
                  {showTitle && <h3 className="text-base font-semibold text-foreground font-heading">Edit profile</h3>}
                  {showDesc && <p className="text-sm text-muted-foreground font-body">Make changes to your profile here. Click save when you're done.</p>}
                </div>
                {(showTitle || showDesc) && (
                  <div className="grid grid-cols-4 items-center gap-md py-md">
                    <Label className="text-right text-sm">Name</Label>
                    <Input defaultValue="Pedro Duarte" className="col-span-3" readOnly />
                  </div>
                )}
                {showFooter && (
                  <div className={cn("mt-xs", isMobile ? "flex flex-col-reverse gap-xs" : "flex justify-end gap-xs")}>
                    <Button variant="outline" size="sm">Cancel</Button>
                    <Button size="sm">Save changes</Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </ExploreBehavior>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="With Form" description="Dialog with form inputs for editing user profile." code={`<Dialog>\n  <DialogTrigger asChild><Button variant="outline">Edit Profile</Button></DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Edit profile</DialogTitle>\n      <DialogDescription>Make changes to your profile here.</DialogDescription>\n    </DialogHeader>\n    <div className="grid gap-md py-md">\n      <div className="grid grid-cols-4 items-center gap-md">\n        <Label className="text-right">Name</Label>\n        <Input className="col-span-3" />\n      </div>\n    </div>\n    <DialogFooter><Button>Save changes</Button></DialogFooter>\n  </DialogContent>\n</Dialog>`}>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Edit Profile</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit profile</DialogTitle><DialogDescription>Make changes to your profile here. Click save when done.</DialogDescription></DialogHeader>
              <div className="space-y-md py-md"><div className="space-y-xs"><Label>Name</Label><Input defaultValue="John Doe" /></div><div className="space-y-xs"><Label>Username</Label><Input defaultValue="@johndoe" /></div></div>
              <DialogFooter><Button>Save changes</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </Example>
        <Example title="Confirmation" description="Common pattern for confirming destructive actions." code={`<Dialog>\n  <DialogTrigger asChild><Button variant="destructive">Delete</Button></DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Confirm deletion</DialogTitle>\n      <DialogDescription>This action cannot be undone.</DialogDescription>\n    </DialogHeader>\n    <DialogFooter>\n      <Button variant="outline">Cancel</Button>\n      <Button variant="destructive">Delete</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>`}>
          <Dialog>
            <DialogTrigger asChild><Button variant="destructive">Delete Account</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Are you sure?</DialogTitle><DialogDescription>This action cannot be undone. This will permanently delete your account.</DialogDescription></DialogHeader>
              <DialogFooter><Button variant="outline">Cancel</Button><Button variant="destructive">Delete</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </Example>
        <Example title="Without Close Button" description="User must use footer actions to dismiss — for terms acceptance." code={`<DialogContent showCloseButton={false}>\n  <DialogHeader><DialogTitle>Terms of Service</DialogTitle></DialogHeader>\n  <DialogFooter>\n    <Button variant="outline">Decline</Button>\n    <Button>Accept</Button>\n  </DialogFooter>\n</DialogContent>`}>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Terms</Button></DialogTrigger>
            <DialogContent showCloseButton={false}>
              <DialogHeader><DialogTitle>Terms of Service</DialogTitle><DialogDescription>Please read and accept the terms before continuing.</DialogDescription></DialogHeader>
              <DialogFooter><Button variant="outline">Decline</Button><Button>Accept</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </Example>
        <Example title="Simple Info" description="Informational dialog with title only — close via X button." code={`<DialogContent>\n  <DialogHeader><DialogTitle>Update Available</DialogTitle></DialogHeader>\n  <p>A new version is available. Restart to apply changes.</p>\n</DialogContent>`}>
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Show Info</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Update Available</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">A new version is available. Restart the application to apply changes.</p>
            </DialogContent>
          </Dialog>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">Dialog (Root)</h3>
        <PropsTable rows={[
          ["open", "boolean", "—", "Controlled open state"],
          ["onOpenChange", "(open: boolean) => void", "—", "Callback when open changes"],
          ["modal", "boolean", "true", "Block interaction outside dialog"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DialogContent</h3>
        <PropsTable rows={[
          ["showCloseButton", "boolean", "true", "Show/hide the X close button"],
          ["forceMount", "boolean", "—", "Force mounting for animation libraries"],
          ["onOpenAutoFocus", "(e: Event) => void", "—", "Called on open auto-focus"],
          ["onEscapeKeyDown", "(e: KeyboardEvent) => void", "—", "Called on Escape key"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DialogTrigger</h3>
        <PropsTable rows={[
          ["asChild", "boolean", "false", "Merge props onto child element"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-dialog"]} importCode={`import {\n  Dialog, DialogTrigger, DialogContent,\n  DialogHeader, DialogTitle, DialogDescription,\n  DialogFooter, DialogClose\n} from "@/components/ui/dialog"`} />
      <DesignTokensTable rows={[["--card","white","Content background"],["--border","zinc-200","Content border"],["--backdrop","black/50","Overlay backdrop"],["--muted-foreground","zinc-500","Description text"],["--ring","violet-600/30","Focus ring"],["--radius-xl","16px","Content border radius"]]} />
      <BestPractices items={[{do:"Use Dialog for non-destructive tasks (forms, info). Use AlertDialog for confirmations.",dont:"Use Dialog for blocking decisions — AlertDialog prevents accidental dismissal."},{do:"Keep dialog content focused on a single task.",dont:"Nest dialogs — flatten the flow or use a multi-step form instead."}]} />
      <FigmaMapping rows={[
        ["Overlay","Black 50%","DialogOverlay","bg-black/50, fixed inset-0, z-50"],
        ["Content","bg-card, border, shadow","DialogContent","sm:max-w-lg, sm:rounded-xl, p-md, gap-xs"],
        ["Header","Title + Description","DialogHeader","flex flex-col gap-xs"],
        ["Title","heading 4","DialogTitle","typo-heading-4 text-foreground"],
        ["Description","body text","DialogDescription","typo-paragraph-sm text-muted-foreground"],
        ["Footer","Action buttons","DialogFooter","flex flex-col-reverse gap-xs sm:flex-row sm:justify-end"],
        ["Close","X button","showCloseButton","absolute right-md top-md, X icon size-md"],
        ["Animation","Open/Close","data-state","zoom-in-95, fade-in / fade-out"],
      ]} />
      <AccessibilityInfo keyboard={[["Tab","Move focus between elements (trapped)"],["Shift+Tab","Move focus backwards"],["Escape","Close the dialog"],["Enter / Space","Activate focused button"]]} notes={["Focus trapped inside when open","Returns focus to trigger on close","role=\"dialog\" + aria-modal=\"true\"","Always include DialogTitle for screen readers"]} />
      <RelatedComponents items={[{name:"AlertDialog",desc:"Non-dismissible confirmation — cannot close by clicking overlay."},{name:"Sheet",desc:"Slide-in panel for larger content areas."},{name:"Drawer",desc:"Bottom sheet for mobile-friendly interactions."}]} />
    </div>
  )
}

function SheetDocs() {
  const [side, setSide] = useState("right")

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Sheet</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Slide-out panel from any edge of the screen. Great for navigation, filters, or detail views.</p>
      </header>

      {/* Explore Behavior */}
      <ExploreBehavior controls={[
        { label: "Side", type: "select", options: ["right", "left", "top", "bottom"], value: side, onChange: setSide },
      ]}>
        <Sheet>
          <SheetTrigger asChild><Button variant="outline">Open {side} sheet</Button></SheetTrigger>
          <SheetContent side={side as "right" | "left" | "top" | "bottom"}>
            <SheetHeader><SheetTitle>Sheet ({side})</SheetTitle><SheetDescription>This sheet slides in from the {side}.</SheetDescription></SheetHeader>
            <div className="space-y-md py-md"><div className="space-y-xs"><Label>Name</Label><Input defaultValue="John Doe" /></div></div>
          </SheetContent>
        </Sheet>
      </ExploreBehavior>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Right (Default)" description="Most common — settings, details, or edit forms." code={`<Sheet>\n  <SheetTrigger asChild><Button>Open Sheet</Button></SheetTrigger>\n  <SheetContent>\n    <SheetHeader>\n      <SheetTitle>Edit profile</SheetTitle>\n      <SheetDescription>Make changes to your profile.</SheetDescription>\n    </SheetHeader>\n  </SheetContent>\n</Sheet>`}>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline">Open Sheet</Button></SheetTrigger>
            <SheetContent>
              <SheetHeader><SheetTitle>Edit Settings</SheetTitle><SheetDescription>Make changes to your preferences.</SheetDescription></SheetHeader>
              <div className="space-y-md py-md"><div className="space-y-xs"><Label>Theme</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent></Select></div></div>
            </SheetContent>
          </Sheet>
        </Example>
        <Example title="Left Side" description="Ideal for navigation menus or sidebar content." code={`<SheetContent side="left">...</SheetContent>`}>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline">Left Sheet</Button></SheetTrigger>
            <SheetContent side="left">
              <SheetHeader><SheetTitle>Navigation</SheetTitle></SheetHeader>
              <div className="space-y-xs py-md">{["Dashboard", "Analytics", "Settings"].map(i => <Button key={i} variant="ghost" className="w-full justify-start">{i}</Button>)}</div>
            </SheetContent>
          </Sheet>
        </Example>
        <Example title="Top Side" description="Useful for notification banners or search panels." code={`<SheetContent side="top">...</SheetContent>`}>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline">Top Sheet</Button></SheetTrigger>
            <SheetContent side="top">
              <SheetHeader><SheetTitle>Notifications</SheetTitle><SheetDescription>Recent notifications panel.</SheetDescription></SheetHeader>
            </SheetContent>
          </Sheet>
        </Example>
        <Example title="Bottom Side" description="Great for quick actions or mobile-style bottom sheets." code={`<SheetContent side="bottom">...</SheetContent>`}>
          <Sheet>
            <SheetTrigger asChild><Button variant="outline">Bottom Sheet</Button></SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader><SheetTitle>Quick Actions</SheetTitle><SheetDescription>Common actions.</SheetDescription></SheetHeader>
            </SheetContent>
          </Sheet>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">Sheet (Root)</h3>
        <PropsTable rows={[
          ["open", "boolean", "—", "Controlled open state"],
          ["onOpenChange", "(open: boolean) => void", "—", "Callback when open changes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">SheetContent</h3>
        <PropsTable rows={[
          ["side", '"top" | "right" | "bottom" | "left"', '"right"', "Slide-in direction"],
          ["forceMount", "boolean", "—", "Force mounting for animation libraries"],
          ["onEscapeKeyDown", "(e: KeyboardEvent) => void", "—", "Called on Escape key"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-dialog"]} importCode={`import {\n  Sheet, SheetTrigger, SheetContent,\n  SheetHeader, SheetTitle, SheetDescription,\n  SheetFooter, SheetClose\n} from "@/components/ui/sheet"`} />
      <DesignTokensTable rows={[["--card","white","Panel background"],["--border","zinc-200","Panel border"],["--backdrop","black/80","Overlay backdrop"],["--muted-foreground","zinc-500","Description text"],["--ring","violet-600/30","Focus ring"]]} />
      <BestPractices items={[{do:"Use Sheet for supplementary content (details, filters, navigation).",dont:"Use Sheet for critical decisions — use AlertDialog instead."},{do:"Choose side based on content: right for details, left for navigation.",dont:"Use Sheet for full forms — use a dedicated page or Dialog."}]} />
      <FigmaMapping rows={[
        ["Overlay","Black 80%","SheetOverlay","bg-black/80, fixed inset-0"],
        ["Side right","inset-y-0 right-0","side=\"right\"","border-l, w-3/4 sm:max-w-sm, slide-in-from-right"],
        ["Side left","inset-y-0 left-0","side=\"left\"","border-r, w-3/4 sm:max-w-sm, slide-in-from-left"],
        ["Side top","inset-x-0 top-0","side=\"top\"","border-b, slide-in-from-top"],
        ["Side bottom","inset-x-0 bottom-0","side=\"bottom\"","border-t, slide-in-from-bottom"],
        ["Close","X button","SheetClose","absolute right-md top-md"],
        ["Animation","Slide in/out","data-state","slide-in-from-{side}"],
      ]} />
      <AccessibilityInfo keyboard={[["Tab","Navigate within sheet (trapped)"],["Shift+Tab","Move focus backwards"],["Escape","Close the sheet"]]} notes={["Focus trapped when open","Returns focus to trigger on close","role=\"dialog\" + aria-modal","Overlay click closes by default","Always include SheetTitle for screen readers"]} />
      <RelatedComponents items={[{name:"Dialog",desc:"Centered modal for focused interactions."},{name:"Drawer",desc:"Bottom sheet alternative for mobile."}]} />
    </div>
  )
}

function DropdownDocs() {
  const [align, setAlign] = useState("center");
  const [sideOffset, setSideOffset] = useState(4);

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Dropdown Menu</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A menu of actions or options triggered by a button. Supports nested submenus, checkboxes, and radio items.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Align", type: "select", options: ["start","center","end"], value: align, onChange: setAlign },
        { label: "Side Offset", type: "select", options: ["0","4","8","16"], value: String(sideOffset), onChange: (v) => setSideOffset(Number(v)) },
      ]}>
        <div className="pointer-events-none bg-popover border border-border rounded-md shadow-md w-48 p-xs">
          <div className="space-y-xs">
            <div className="text-xs font-semibold text-muted-foreground">My Account</div>
            <div className="border-t border-border my-xs"></div>
            <div className="flex items-center gap-xs"><User className="size-4" /> Profile</div>
            <div className="flex items-center gap-xs"><Settings className="size-4" /> Settings</div>
            <div className="flex items-center gap-xs"><Bell className="size-4" /> Notifications</div>
            <div className="border-t border-border my-xs"></div>
            <div className="flex items-center gap-xs text-destructive"><Trash2 className="size-4" /> Delete Account</div>
          </div>
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<DropdownMenu>\n  <DropdownMenuTrigger asChild><Button>Open</Button></DropdownMenuTrigger>\n  <DropdownMenuContent>\n    <DropdownMenuItem>Profile</DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">Open Menu <ChevronDown className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem><User className="size-4 mr-2" /> Profile</DropdownMenuItem>
              <DropdownMenuItem><Settings className="size-4 mr-2" /> Settings</DropdownMenuItem>
              <DropdownMenuItem><Bell className="size-4 mr-2" /> Notifications</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><Trash2 className="size-4 mr-2" /> Delete Account</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Example>
        <Example title="With Actions" description="Common row actions pattern for data tables." code={`<DropdownMenu>...<DropdownMenuItem>Edit</DropdownMenuItem>...</DropdownMenu>`}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem><Pencil className="size-4 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem><Copy className="size-4 mr-2" />Duplicate</DropdownMenuItem>
              <DropdownMenuItem><Share className="size-4 mr-2" />Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">DropdownMenuContent</h3>
        <PropsTable rows={[
          ["align", '"start" | "center" | "end"', '"center"', "Horizontal alignment"],
          ["sideOffset", "number", "4", "Distance from trigger in px"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DropdownMenuItem</h3>
        <PropsTable rows={[
          ["inset", "boolean", "false", "Add left padding for icon alignment"],
          ["disabled", "boolean", "false", "Disable the item"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-dropdown-menu"]} importCode={`import {\n  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,\n  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,\n  DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem\n} from "@/components/ui/dropdown-menu"`} />
      <DesignTokensTable rows={[["--popover","white","Menu background"],["--accent","zinc-100","Hover item"],["--border","zinc-200","Menu border"],["--muted-foreground","zinc-500","Label text"],["--destructive","red-500","Destructive item text"]]} />
      <BestPractices items={[{do:"Use DropdownMenu for contextual actions on a specific element.",dont:"Use DropdownMenu for primary navigation — use links or Tabs."},{do:"Group related items with separators and labels.",dont:"Put more than 10 items without grouping — split into submenus."}]} />
      <FigmaMapping rows={[["Align","Start","align",'"start"'],["Align","Center","align",'"center"'],["Align","End","align",'"end"']]} />
      <AccessibilityInfo keyboard={[["Tab","Focus trigger"],["Enter / Space","Open menu"],["Arrow Up/Down","Navigate items"],["Enter","Activate item"],["Esc","Close menu"]]} notes={["Uses role=\"menu\" with role=\"menuitem\"","Supports checkbox and radio items"]} />
      <RelatedComponents items={[{name:"ContextMenu",desc:"For right-click menus."},{name:"Popover",desc:"For non-menu content."},{name:"Select",desc:"For form value selection."}]} />
    </div>
  )
}

function PopoverDocs() {
  const [side, setSide] = useState("top");
  const [align, setAlign] = useState("center");

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Popover</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Floating content panel triggered by a button. Used for filters, settings, and quick actions.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Side", type: "select", options: ["top","right","bottom","left"], value: side, onChange: setSide },
        { label: "Align", type: "select", options: ["start","center","end"], value: align, onChange: setAlign },
      ]}>
        <div className="pointer-events-none bg-popover border border-border rounded-md shadow-md p-md max-w-xs">
          <p className="text-sm text-muted-foreground">Popover content (side={side}, align={align})</p>
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Popover>\n  <PopoverTrigger asChild><Button>Open</Button></PopoverTrigger>\n  <PopoverContent>Content</PopoverContent>\n</Popover>`}>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline">Open Popover</Button></PopoverTrigger>
            <PopoverContent className="w-72 space-y-md">
              <div className="space-y-xs"><h4 className="font-medium text-sm">Dimensions</h4><p className="text-xs text-muted-foreground">Set the dimensions for the layer.</p></div>
              <div className="grid grid-cols-2 gap-sm"><div className="space-y-xs"><Label className="text-xs">Width</Label><Input defaultValue="100%" size="sm" /></div><div className="space-y-xs"><Label className="text-xs">Height</Label><Input defaultValue="auto" size="sm" /></div></div>
            </PopoverContent>
          </Popover>
        </Example>
        <Example title="Notification Settings" description="Form inside popover for quick edits." code={`<Popover><PopoverTrigger>...</PopoverTrigger>\n<PopoverContent>\n  <Switch />\n</PopoverContent></Popover>`}>
          <Popover>
            <PopoverTrigger asChild><Button variant="outline" size="sm"><Bell className="size-4 mr-1" />Notifications</Button></PopoverTrigger>
            <PopoverContent className="w-72 space-y-md">
              <h4 className="font-medium text-sm">Notifications</h4>
              <div className="space-y-sm">
                <div className="flex items-center justify-between"><Label className="text-xs">Email</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label className="text-xs">Push</Label><Switch /></div>
                <div className="flex items-center justify-between"><Label className="text-xs">SMS</Label><Switch /></div>
              </div>
            </PopoverContent>
          </Popover>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">PopoverContent</h3>
        <PropsTable rows={[
          ["align", '"start" | "center" | "end"', '"center"', "Horizontal alignment"],
          ["sideOffset", "number", "4", "Distance from trigger in px"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-popover"]} importCode={`import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"`} />
      <DesignTokensTable rows={[["--popover","white","Popover background"],["--popover-foreground","zinc-900","Popover text"],["--border","zinc-200","Popover border"],["--ring","violet-600/30","Focus ring inside popover"]]} />
      <BestPractices items={[{do:"Use Popover for interactive content that needs user input (forms, pickers).",dont:"Use Popover for static info — use Tooltip instead."},{do:"Keep popover content compact and focused.",dont:"Put full-page forms inside a popover — use Dialog or Sheet."}]} />
      <FigmaMapping rows={[["Align","Start","align",'"start"'],["Align","Center","align",'"center"'],["Align","End","align",'"end"']]} />
      <AccessibilityInfo keyboard={[["Tab","Focus trigger"],["Enter / Space","Toggle popover"],["Esc","Close popover"]]} notes={["Focus moves into popover on open","Closes on outside click or Esc"]} />
      <RelatedComponents items={[{name:"Tooltip",desc:"For non-interactive hover info."},{name:"DropdownMenu",desc:"For action menus."}]} />
    </div>
  )
}

function AccordionDocs() {
  const [type, setType] = useState("single")
  const [state, setState] = useState("default")
  const [collapsible, setCollapsible] = useState(true)
  const isDisabled = state === "disabled"
  const isHover = state === "hover"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Data Display</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Accordion</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A vertically stacked set of interactive headings that each reveal a section of content.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Type", type: "select", options: ["single","multiple"], value: type, onChange: setType },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
        { label: "Collapsible", type: "toggle", value: collapsible, onChange: setCollapsible },
      ]}>
        <div className={cn("w-full max-w-md pointer-events-none", isHover && "[&_[data-slot=accordion-trigger]]:underline", isFocus && "[&_[data-slot=accordion-trigger]]:ring-2 [&_[data-slot=accordion-trigger]]:ring-ring [&_[data-slot=accordion-trigger]]:rounded-md")}>
          {type === "single" ? (
            <Accordion type="single" collapsible={collapsible} disabled={isDisabled}>
              <AccordionItem value="item-1"><AccordionTrigger>Is it accessible?</AccordionTrigger><AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent></AccordionItem>
              <AccordionItem value="item-2"><AccordionTrigger>Is it styled?</AccordionTrigger><AccordionContent>Yes. It comes with default styles.</AccordionContent></AccordionItem>
            </Accordion>
          ) : (
            <Accordion type="multiple" disabled={isDisabled}>
              <AccordionItem value="item-1"><AccordionTrigger>Is it accessible?</AccordionTrigger><AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent></AccordionItem>
              <AccordionItem value="item-2"><AccordionTrigger>Is it styled?</AccordionTrigger><AccordionContent>Yes. It comes with default styles.</AccordionContent></AccordionItem>
            </Accordion>
          )}
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Accordion type="single" collapsible>\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Is it accessible?</AccordionTrigger>\n    <AccordionContent>Yes.</AccordionContent>\n  </AccordionItem>\n</Accordion>`}>
          <Accordion type="single" collapsible className="w-full max-w-md">
            <AccordionItem value="item-1"><AccordionTrigger>Is it accessible?</AccordionTrigger><AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent></AccordionItem>
            <AccordionItem value="item-2"><AccordionTrigger>Is it styled?</AccordionTrigger><AccordionContent>Yes. It comes with default styles matching the design system.</AccordionContent></AccordionItem>
            <AccordionItem value="item-3"><AccordionTrigger>Is it animated?</AccordionTrigger><AccordionContent>Yes. It uses CSS animations for smooth open/close transitions.</AccordionContent></AccordionItem>
          </Accordion>
        </Example>
        <Example title="Multiple" description="Allow multiple items open simultaneously." code={`<Accordion type="multiple">...</Accordion>`}>
          <Accordion type="multiple" className="w-full max-w-md">
            <AccordionItem value="a"><AccordionTrigger>Section A</AccordionTrigger><AccordionContent>Content for section A.</AccordionContent></AccordionItem>
            <AccordionItem value="b"><AccordionTrigger>Section B</AccordionTrigger><AccordionContent>Content for section B.</AccordionContent></AccordionItem>
          </Accordion>
        </Example>
        <Example title="Default Open" description="Start with an item expanded." code={`<Accordion type="single" defaultValue="item-1">...</Accordion>`}>
          <Accordion type="single" collapsible defaultValue="faq-1" className="w-full max-w-md">
            <AccordionItem value="faq-1"><AccordionTrigger>What is included?</AccordionTrigger><AccordionContent>All components from the design system are included.</AccordionContent></AccordionItem>
            <AccordionItem value="faq-2"><AccordionTrigger>Can I customize?</AccordionTrigger><AccordionContent>Yes, all components support className overrides.</AccordionContent></AccordionItem>
          </Accordion>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">Accordion</h3>
        <PropsTable rows={[
          ["type", '"single" | "multiple"', "—", "Selection mode (required)"],
          ["collapsible", "boolean", "false", "Allow closing all items (single mode only)"],
          ["defaultValue", "string | string[]", "—", "Default open item(s)"],
          ["value", "string | string[]", "—", "Controlled open item(s)"],
          ["onValueChange", "(value) => void", "—", "Callback on open/close"],
          ["disabled", "boolean", "false", "Disable all items"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AccordionItem</h3>
        <PropsTable rows={[
          ["value", "string", "—", "Unique item identifier (required)"],
          ["disabled", "boolean", "false", "Disable this item"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-accordion"]} importCode={`import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"`} />
      <DesignTokensTable rows={[["--border","zinc-200","Item divider"],["--foreground","zinc-900","Trigger text"],["--muted-foreground","zinc-500","Content text"],["--ring","violet-600/30","Focus ring"]]} />
      <BestPractices items={[{do:"Use type='single' when sections are independent and only one matters at a time.",dont:"Use type='multiple' by default — it leads to information overload."},{do:"Keep trigger text concise and descriptive.",dont:"Put critical information inside collapsed sections — users may miss it."}]} />
      <FigmaMapping rows={[["Type","Single","type",'"single"'],["Type","Multiple","type",'"multiple"'],["State","Open","value",'"item-id"'],["State","Disabled","disabled","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus trigger"],["Enter / Space","Toggle section"],["Arrow Up/Down","Navigate triggers"],["Home / End","First/last trigger"]]} notes={["Triggers have aria-expanded","Content panels have role=\"region\""]} />
      <RelatedComponents items={[{name:"Collapsible",desc:"For single collapsible."},{name:"Tabs",desc:"For horizontal switching."}]} />
    </div>
  )
}

function TableDocs() {
  const [striped, setStriped] = useState(false)
  const [compact, setCompact] = useState(false)
  const [state, setState] = useState("default")
  const rowHover = state === "hover"
  const rowSelected = state === "selected"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Data Display</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Table</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A responsive table component for displaying tabular data with header, body, and footer rows.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "State", type: "select", options: ["default","hover","selected"], value: state, onChange: setState },
        { label: "Striped", type: "toggle", value: striped, onChange: setStriped },
        { label: "Compact", type: "toggle", value: compact, onChange: setCompact },
      ]}>
        <Table className={cn("w-full", compact && "[&_td]:py-1 [&_th]:py-1")}>
          <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Status</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
          <TableBody>
            <TableRow className={cn(rowHover && "bg-muted/50", rowSelected && "bg-muted", striped && "even:bg-muted/30")} data-state={rowSelected ? "selected" : undefined}>
              <TableCell className="font-medium">INV001</TableCell><TableCell>Paid</TableCell><TableCell>Credit Card</TableCell><TableCell className="text-right">$250.00</TableCell>
            </TableRow>
            <TableRow className={cn(striped && "even:bg-muted/30")}>
              <TableCell className="font-medium">INV002</TableCell><TableCell>Pending</TableCell><TableCell>PayPal</TableCell><TableCell className="text-right">$150.00</TableCell>
            </TableRow>
            <TableRow className={cn(striped && "even:bg-muted/30")}>
              <TableCell className="font-medium">INV003</TableCell><TableCell>Failed</TableCell><TableCell>Bank Transfer</TableCell><TableCell className="text-right">$350.00</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Table>\n  <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>\n  <TableBody><TableRow><TableCell>John</TableCell></TableRow></TableBody>\n</Table>`}>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Status</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">INV001</TableCell><TableCell><Badge variant="success" level="secondary">Paid</Badge></TableCell><TableCell>Credit Card</TableCell><TableCell className="text-right">$250.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV002</TableCell><TableCell><Badge variant="warning" level="secondary">Pending</Badge></TableCell><TableCell>PayPal</TableCell><TableCell className="text-right">$150.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV003</TableCell><TableCell><Badge variant="destructive" level="secondary">Failed</Badge></TableCell><TableCell>Bank Transfer</TableCell><TableCell className="text-right">$350.00</TableCell></TableRow>
            </TableBody>
          </Table>
        </Example>
        <Example title="Simple List" description="Compact user list table." code={`<Table><TableBody><TableRow><TableCell>...</TableCell></TableRow></TableBody></Table>`}>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">Alice Johnson</TableCell><TableCell>alice@example.com</TableCell><TableCell><Badge level="secondary">Admin</Badge></TableCell></TableRow>
              <TableRow><TableCell className="font-medium">Bob Smith</TableCell><TableCell>bob@example.com</TableCell><TableCell><Badge variant="secondary" level="secondary">Member</Badge></TableCell></TableRow>
              <TableRow><TableCell className="font-medium">Carol Lee</TableCell><TableCell>carol@example.com</TableCell><TableCell><Badge variant="secondary" level="secondary">Member</Badge></TableCell></TableRow>
            </TableBody>
          </Table>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["className", "string", '""', "Table, TableHeader, TableBody, TableRow, TableHead, TableCell all accept className"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import {\n  Table, TableHeader, TableBody, TableRow,\n  TableHead, TableCell, TableCaption\n} from "@/components/ui/table"`} />
      <DesignTokensTable rows={[["--border","zinc-200","Row borders"],["--muted","zinc-100","Hover & striped row background"],["--foreground","zinc-900","Cell text"],["--muted-foreground","zinc-500","Header text"]]} />
      <BestPractices items={[{do:"Use TableHead with scope for accessibility in complex tables.",dont:"Use div-based grids for tabular data — use semantic Table."},{do:"Add table-fixed with percentage column widths for consistent layouts.",dont:"Let table columns auto-size — it causes layout shift when data changes."}]} />
      <FigmaMapping rows={[["State","Default","\u2014","default"],["State","Hover","className",'"bg-muted/50"'],["State","Selected","data-state",'"selected"'],["Striped","true","className",'"even:bg-muted/30"']]} />
      <AccessibilityInfo keyboard={[["Tab","Navigate to interactive cells"]]} notes={["Use semantic <th> for headers","Add scope for complex tables"]} />
      <RelatedComponents items={[{name:"Card",desc:"For single-item display."},{name:"Accordion",desc:"For expandable row details."}]} />
    </div>
  )
}

function BreadcrumbDocs() {
  const [items, setItems] = useState("3")
  const [separator, setSeparator] = useState("chevron")
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Navigation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Breadcrumb</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Shows the user's current location in a hierarchy of pages.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Items", type: "select", options: ["2","3","4","5"], value: items, onChange: setItems },
        { label: "Separator", type: "select", options: ["chevron","slash"], value: separator, onChange: setSeparator },
      ]}>
        <Breadcrumb>
          <BreadcrumbList>
            {["Home","Dashboard","Settings","Account","Profile"].slice(0, Number(items)).map((item, i, arr) => (
              <span key={item} className="contents">
                {i > 0 && <BreadcrumbSeparator>{separator === "slash" ? "/" : <ChevronRight className="size-3.5" />}</BreadcrumbSeparator>}
                <BreadcrumbItem>{i === arr.length - 1 ? <BreadcrumbPage>{item}</BreadcrumbPage> : <BreadcrumbLink href="#">{item}</BreadcrumbLink>}</BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem><BreadcrumbPage>Current</BreadcrumbPage></BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>`}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#">Dashboard</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Analytics</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Example>
        <Example title="With Ellipsis" description="Collapse middle items for deep paths." code={`<BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>`}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><span className="text-muted-foreground">...</span></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href="#">Settings</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Profile</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Example>
        <Example title="Custom Separator" description="Use slash instead of chevron." code={`<BreadcrumbSeparator>/</BreadcrumbSeparator>`}>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem><BreadcrumbLink href="#">Products</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem><BreadcrumbPage>Details</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">BreadcrumbLink</h3>
        <PropsTable rows={[
          ["href", "string", "—", "Navigation URL"],
          ["asChild", "boolean", "false", "Render as child element for router Link"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">BreadcrumbSeparator</h3>
        <PropsTable rows={[
          ["children", "ReactNode", "ChevronRight", "Custom separator icon or text"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import {\n  Breadcrumb, BreadcrumbList, BreadcrumbItem,\n  BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator\n} from "@/components/ui/breadcrumb"`} />
      <DesignTokensTable rows={[["--muted-foreground","zinc-500","Inactive link text"],["--foreground","zinc-900","Current page text"],["--primary","violet-600","Link hover color"]]} />
      <BestPractices items={[{do:"Show the full path hierarchy from root to current page.",dont:"Use breadcrumbs as the only navigation — always provide sidebar or back links."},{do:"Mark the last item as current page (non-clickable).",dont:"Make the current page a clickable link — it reloads the same page."}]} />
      <FigmaMapping rows={[["Items","2-5","children","BreadcrumbItem[]"],["Separator","Chevron","BreadcrumbSeparator","ChevronRight"],["Separator","Slash","BreadcrumbSeparator","\"/\""]]} />
      <AccessibilityInfo keyboard={[["Tab","Navigate breadcrumb links"]]} notes={["Uses <nav aria-label=\"breadcrumb\">","Current page uses aria-current=\"page\""]} />
      <RelatedComponents items={[{name:"Tabs",desc:"For section navigation."},{name:"Pagination",desc:"For page navigation."}]} />
    </div>
  )
}

function PaginationDocs() {
  const [activePage, setActivePage] = useState("2")
  const [showEllipsis, setShowEllipsis] = useState(true)
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Navigation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Pagination</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Navigation for paged content like data tables and lists.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Active Page", type: "select", options: ["1","2","3","4","5"], value: activePage, onChange: setActivePage },
        { label: "Ellipsis", type: "toggle", value: showEllipsis, onChange: setShowEllipsis },
      ]}>
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
            {["1","2","3","4","5"].map(p => (
              <PaginationItem key={p}><PaginationLink href="#" isActive={p === activePage}>{p}</PaginationLink></PaginationItem>
            ))}
            {showEllipsis && <PaginationItem><PaginationEllipsis /></PaginationItem>}
            <PaginationItem><PaginationNext href="#" /></PaginationItem>
          </PaginationContent>
        </Pagination>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Pagination>\n  <PaginationContent>\n    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>\n    <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationNext href="#" /></PaginationItem>\n  </PaginationContent>\n</Pagination>`}>
          <Pagination>
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
              <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
              <PaginationItem><PaginationEllipsis /></PaginationItem>
              <PaginationItem><PaginationNext href="#" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </Example>
        <Example title="Simple Prev/Next" description="Minimal navigation without page numbers." code={`<Pagination>\n  <PaginationContent>\n    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>\n    <PaginationItem><PaginationNext href="#" /></PaginationItem>\n  </PaginationContent>\n</Pagination>`}>
          <Pagination>
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
              <PaginationItem><PaginationNext href="#" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </Example>
        <Example title="Many Pages" description="With ellipsis for large datasets." code={`<PaginationEllipsis />`}>
          <Pagination>
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
              <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationEllipsis /></PaginationItem>
              <PaginationItem><PaginationLink href="#">4</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#" isActive>5</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">6</PaginationLink></PaginationItem>
              <PaginationItem><PaginationEllipsis /></PaginationItem>
              <PaginationItem><PaginationLink href="#">20</PaginationLink></PaginationItem>
              <PaginationItem><PaginationNext href="#" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">PaginationLink</h3>
        <PropsTable rows={[
          ["href", "string", "—", "Page URL"],
          ["isActive", "boolean", "false", "Highlight as current page"],
          ["size", '"default" | "icon"', '"icon"', "Link size"],
        ]} />
      </section>

      <InstallationSection pkg={[]} importCode={`import {\n  Pagination, PaginationContent, PaginationItem,\n  PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis\n} from "@/components/ui/pagination"`} />
      <DesignTokensTable rows={[["--primary","violet-600","Active page background"],["--primary-foreground","white","Active page text"],["--border","zinc-200","Page link border"],["--muted-foreground","zinc-500","Ellipsis/disabled text"]]} />
      <BestPractices items={[{do:"Show a smart window of pages (max 5 visible) with ellipsis for large datasets.",dont:"Show all page numbers for datasets with 50+ pages."},{do:"Include 'Showing X–Y of Z' text alongside pagination controls.",dont:"Use pagination for fewer than 10 items — show all items instead."}]} />
      <FigmaMapping rows={[["Active","true","isActive","true"],["Ellipsis","true","PaginationEllipsis","present"]]} />
      <AccessibilityInfo keyboard={[["Tab","Navigate page links"],["Enter","Go to page"]]} notes={["Uses <nav aria-label=\"pagination\">","Active page has aria-current=\"page\""]} />
      <RelatedComponents items={[{name:"Breadcrumb",desc:"For hierarchical navigation."},{name:"Tabs",desc:"For content switching."}]} />
    </div>
  )
}

function SliderDocs() {
  const [val, setVal] = useState([50])
  const [step, setStep] = useState("1")
  const [state, setState] = useState("default")
  const isDisabled = state === "disabled"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Slider</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">An input for selecting a numeric value within a range by dragging a thumb.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Value", type: "select", options: ["0","25","50","75","100"], value: String(val[0]), onChange: (v: string) => setVal([Number(v)]) },
        { label: "Step", type: "select", options: ["1","5","10","25"], value: step, onChange: setStep },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
      ]}>
        <div className={cn("w-full max-w-sm space-y-xs pointer-events-none", isFocus && "[&_[role=slider]]:ring-2 [&_[role=slider]]:ring-ring")}>
          <Slider value={val} onValueChange={setVal} max={100} step={Number(step)} disabled={isDisabled} />
          <p className="text-sm text-muted-foreground text-center font-body">{val[0]}%</p>
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Slider defaultValue={[50]} max={100} step={1} />`}>
          <Slider defaultValue={[50]} max={100} step={1} className="w-full max-w-sm" />
        </Example>
        <Example title="Interactive" code={`const [val, setVal] = useState([50])\n<Slider value={val} onValueChange={setVal} />`}>
          <div className="space-y-md w-full max-w-sm">
            <Slider value={val} onValueChange={setVal} max={100} step={1} />
            <p className="text-sm text-muted-foreground">Value: {val[0]}</p>
          </div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["value", "number[]", "—", "Controlled value(s)"],
          ["defaultValue", "number[]", "[0]", "Default value(s)"],
          ["min", "number", "0", "Minimum value"],
          ["max", "number", "100", "Maximum value"],
          ["step", "number", "1", "Step increment"],
          ["onValueChange", "(value: number[]) => void", "—", "Callback on change"],
          ["disabled", "boolean", "false", "Disable the slider"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-slider"]} importCode={`import { Slider } from "@/components/ui/slider"`} />
      <DesignTokensTable rows={[["--primary","violet-600","Thumb and filled track"],["--muted","zinc-100","Track background"],["--ring","violet-600/30","Focus ring"],["--background","white","Thumb color"]]} />
      <BestPractices items={[{do:"Display the current value alongside the slider for clarity.",dont:"Use a slider without visible value — users can't tell exact position."},{do:"Set sensible min/max/step values based on the use case.",dont:"Use step=1 for ranges spanning 0-1000 — use larger steps."}]} />
      <FigmaMapping rows={[["Value","0-100","value","number[]"],["Step","1/5/10/25","step","number"],["State","Disabled","disabled","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus thumb"],["Arrow Left/Right","Decrease/increase by step"],["Home / End","Jump to min/max"]]} notes={["Uses role=\"slider\" with aria-valuenow","Set aria-label for context"]} />
      <RelatedComponents items={[{name:"Input",desc:"For precise numeric entry."},{name:"Progress",desc:"For read-only progress."}]} />
    </div>
  )
}


function LabelDocs() {
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Label</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Renders an accessible label associated with form controls.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="With Input" code={`<Label htmlFor="email">Email</Label>\n<Input id="email" type="email" />`}>
          <div className="space-y-xs w-full max-w-xs"><Label htmlFor="email2">Email</Label><Input id="email2" type="email" placeholder="name@example.com" /></div>
        </Example>
        <Example title="With Checkbox" code={`<div className="flex items-center gap-xs">\n  <Checkbox id="t" />\n  <Label htmlFor="t">Accept terms</Label>\n</div>`}>
          <div className="flex items-center gap-xs"><Checkbox id="t2" /><Label htmlFor="t2">Accept terms and conditions</Label></div>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["htmlFor", "string", "—", "ID of associated form control"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-label"]} importCode={`import { Label } from "@/components/ui/label"`} />
      <DesignTokensTable rows={[["--foreground","zinc-900","Label text"],["--destructive","red-500","Error state text"]]} />
      <BestPractices items={[{do:"Always use htmlFor to link label with its form control.",dont:"Use label as visual-only text without htmlFor — screen readers can't associate it."},{do:"Keep labels above or to the left of the input field.",dont:"Hide labels — use visible labels instead of relying on placeholder."}]} />
      <FigmaMapping rows={[["\u2014","\u2014","htmlFor","input-id"]]} />
      <AccessibilityInfo keyboard={[["Click","Focus associated control"]]} notes={["Always use htmlFor to associate with controls","Clicking label focuses the linked input"]} />
      <RelatedComponents items={[{name:"Input",desc:"Primary control to label."},{name:"Checkbox",desc:"Often paired with label."}]} />
    </div>
  )
}

function ScrollAreaDocs() {
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Layout</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Scroll Area</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A custom scrollable area with consistent styling across browsers.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Vertical Scroll" code={`<ScrollArea className="h-72 w-48 rounded-md border">\n  {items.map(...)}\n</ScrollArea>`}>
          <ScrollArea className="h-48 w-48 rounded-md border p-md">
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="py-1 text-sm">{`Item ${i + 1}`}<Separator className="mt-1" /></div>
            ))}
          </ScrollArea>
        </Example>
        <Example title="Horizontal Scroll" description="Scroll horizontally for wide content." code={`<ScrollArea className="w-full" orientation="horizontal">...</ScrollArea>`}>
          <ScrollArea className="w-72 rounded-md border">
            <div className="flex gap-md p-md">
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} className="shrink-0 w-24 h-24 rounded-lg bg-muted flex items-center justify-center text-sm font-medium">{i + 1}</div>
              ))}
            </div>
          </ScrollArea>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["className", "string", '""', "Container CSS classes (set h-* for height)"],
          ["type", '"auto" | "always" | "scroll" | "hover"', '"hover"', "Scrollbar visibility"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-scroll-area"]} importCode={`import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"`} />
      <DesignTokensTable rows={[["--border","zinc-200","Scrollbar track border"],["--muted","zinc-100","Scrollbar thumb"],["--radius-full","9999px","Thumb border radius"]]} />
      <BestPractices items={[{do:"Use ScrollArea for consistent scrollbar styling across browsers.",dont:"Use native overflow-auto when visual consistency matters."},{do:"Set explicit height constraints on the scroll container.",dont:"Use ScrollArea without a fixed height — it won't scroll."}]} />
      <FigmaMapping rows={[["Type","Hover","type",'"hover"'],["Type","Always","type",'"always"'],["Type","Auto","type",'"auto"']]} />
      <AccessibilityInfo keyboard={[["Arrow Keys","Scroll content"],["Page Up/Down","Scroll by page"]]} notes={["Custom scrollbar consistent across browsers","Content remains keyboard-navigable"]} />
      <RelatedComponents items={[{name:"Card",desc:"For bordered content containers."}]} />
    </div>
  )
}

// ============================================================
// NEW COMPONENT DOCS
// ============================================================

function AlertDialogDocs() {
  const [type, setType] = useState("Desktop")
  const [slotVariant, setSlotVariant] = useState("text")
  const [showIcon, setShowIcon] = useState(true)
  const [iconName, setIconName] = useState("CircleAlert")
  const [showTitle, setShowTitle] = useState(true)
  const [showAction, setShowAction] = useState(true)
  const [showActionSecondary, setShowActionSecondary] = useState(true)

  const isSlotIllustration = slotVariant === "congratulation"
  const isMobile = type === "Mobile"

  const slotContent: Record<string, string> = {
    text: "This action cannot be undone. This will permanently delete your account and remove your data from our servers.",
    congratulation: "Congratulations! Your account has been successfully created. Welcome aboard!",
  }

  const handleShowActionChange = (v: boolean) => {
    setShowAction(v)
    if (!v) setShowActionSecondary(false)
  }

  const handleSlotChange = (v: string) => {
    setSlotVariant(v)
    if (v === "congratulation") {
      setShowIcon(false)
      setShowTitle(false)
      setShowAction(false)
      setShowActionSecondary(false)
    } else {
      setShowIcon(true)
      setShowTitle(true)
      setShowAction(true)
      setShowActionSecondary(true)
    }
  }

  const iconMap: Record<string, React.ElementType> = { CircleAlert: AlertCircle, AlertTriangle: AlertTriangle, Info: Info, CheckCircle2: CheckCircle2 }
  const IconComp = iconMap[iconName] || AlertCircle

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Alert Dialog</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A modal dialog for important confirmations. Cannot be dismissed by clicking outside — the user must take an explicit action.</p>
      </header>

      {/* Explore Behavior — static preview */}
      <ExploreBehavior controls={[
        { label: "Type", type: "select", options: ["Desktop", "Mobile"], value: type, onChange: setType },
        { label: "Slot", type: "select", options: ["text", "congratulation"], value: slotVariant, onChange: handleSlotChange },
        { label: "Show Icon", type: "toggle", value: showIcon, onChange: setShowIcon, disabled: isSlotIllustration },
        { label: "Icon", type: "select", options: ["CircleAlert", "AlertTriangle", "Info", "CheckCircle2"], value: iconName, onChange: setIconName, disabled: !showIcon || isSlotIllustration },
        { label: "Show Title", type: "toggle", value: showTitle, onChange: setShowTitle, disabled: isSlotIllustration },
        { label: "Show Action", type: "toggle", value: showAction, onChange: handleShowActionChange, disabled: isSlotIllustration },
        { label: "Show Action Secondary", type: "toggle", value: showActionSecondary, onChange: setShowActionSecondary, disabled: !showAction || isSlotIllustration },
      ]}>
        <div className={cn(
          "relative bg-card border border-border rounded-xl shadow pointer-events-none p-xl space-y-lg w-full",
          isMobile ? "max-w-sm" : "max-w-lg",
        )}>
          {isSlotIllustration ? (
            <>
              <div className="flex justify-center py-md">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="size-8 text-primary" />
                </div>
              </div>
              <div className="space-y-xs text-center">
                <p className="text-sm text-muted-foreground font-body">{slotContent.congratulation}</p>
              </div>
              <div className={cn(isMobile ? "flex flex-col gap-xs" : "flex justify-center gap-xs")}>
                <Button size="sm">Got it</Button>
              </div>
            </>
          ) : (
            <>
              {showIcon && (
                <div className="size-9 rounded-full border border-border flex items-center justify-center">
                  <IconComp className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="space-y-xs">
                {showTitle && <h3 className="text-base font-semibold text-foreground font-heading">Are you absolutely sure?</h3>}
                <p className="text-sm text-muted-foreground font-body">{slotContent.text}</p>
              </div>
              {showAction && (
                <div className={cn(isMobile ? "flex flex-col-reverse gap-xs" : "flex justify-end gap-xs")}>
                  {showActionSecondary && <Button variant="outline" size="sm">Cancel</Button>}
                  <Button size="sm">Continue</Button>
                </div>
              )}
            </>
          )}
        </div>
      </ExploreBehavior>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Basic Confirmation" description="Standard confirm/cancel with icon, title, description, and both action buttons." code={`<AlertDialog>\n  <AlertDialogTrigger asChild>\n    <Button variant="outline">Show Alert</Button>\n  </AlertDialogTrigger>\n  <AlertDialogContent>\n    <AlertDialogHeader>\n      <AlertDialogTitle>Are you sure?</AlertDialogTitle>\n      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>\n    </AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogCancel>Cancel</AlertDialogCancel>\n      <AlertDialogAction>Continue</AlertDialogAction>\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>`}>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline">Show Alert</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove your data.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Continue</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Example>
        <Example title="Destructive" description="Destructive action confirmation — delete account with red action button." code={`<AlertDialogAction variant="destructive">Yes, Delete</AlertDialogAction>`}>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="destructive">Delete Account</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Delete Account</AlertDialogTitle><AlertDialogDescription>All your data, projects, and settings will be permanently deleted. This cannot be reversed.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Keep Account</AlertDialogCancel><AlertDialogAction variant="destructive">Yes, Delete</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Example>
        <Example title="Logout Confirmation" description="Session-ending action confirmation with Cancel and Log Out buttons." code={`<AlertDialogContent>\n  <AlertDialogHeader>\n    <AlertDialogTitle>Log out?</AlertDialogTitle>\n    <AlertDialogDescription>You'll need to sign in again.</AlertDialogDescription>\n  </AlertDialogHeader>\n  <AlertDialogFooter>\n    <AlertDialogCancel>Stay</AlertDialogCancel>\n    <AlertDialogAction>Log Out</AlertDialogAction>\n  </AlertDialogFooter>\n</AlertDialogContent>`}>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline">Log Out</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Log out?</AlertDialogTitle><AlertDialogDescription>You'll need to sign in again to access your account.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Stay</AlertDialogCancel><AlertDialogAction>Log Out</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Example>
        <Example title="Discard Changes" description="Unsaved changes warning — without icon, text-only confirmation." code={`<AlertDialogContent>\n  <AlertDialogHeader>\n    <AlertDialogTitle>Discard changes?</AlertDialogTitle>\n    <AlertDialogDescription>Your unsaved changes will be lost.</AlertDialogDescription>\n  </AlertDialogHeader>\n  <AlertDialogFooter>...</AlertDialogFooter>\n</AlertDialogContent>`}>
          <AlertDialog>
            <AlertDialogTrigger asChild><Button variant="outline">Discard</Button></AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader><AlertDialogTitle>Discard changes?</AlertDialogTitle><AlertDialogDescription>You have unsaved changes that will be permanently lost if you leave now.</AlertDialogDescription></AlertDialogHeader>
              <AlertDialogFooter><AlertDialogCancel>Keep Editing</AlertDialogCancel><AlertDialogAction variant="destructive">Discard</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">AlertDialog (Root)</h3>
        <PropsTable rows={[
          ["open", "boolean", "—", "Controlled open state"],
          ["onOpenChange", "(open: boolean) => void", "—", "Callback when open state changes"],
          ["defaultOpen", "boolean", "false", "Initial open state (uncontrolled)"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AlertDialogContent</h3>
        <PropsTable rows={[
          ["forceMount", "boolean", "—", "Force mounting for animation libraries"],
          ["onOpenAutoFocus", "(e: Event) => void", "—", "Called on open auto-focus"],
          ["onCloseAutoFocus", "(e: Event) => void", "—", "Called on close auto-focus"],
          ["onEscapeKeyDown", "(e: KeyboardEvent) => void", "—", "Called on Escape key"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AlertDialogAction / AlertDialogCancel</h3>
        <PropsTable rows={[
          ["variant", '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"', '"default" / "outline"', "Button visual variant"],
          ["size", '"default" | "sm" | "lg" | "icon"', '"default"', "Button size"],
          ["asChild", "boolean", "false", "Merge props onto child element"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AlertDialogTrigger</h3>
        <PropsTable rows={[
          ["asChild", "boolean", "false", "Merge props onto child element"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-alert-dialog"]} importCode={`import {\n  AlertDialog, AlertDialogTrigger, AlertDialogContent,\n  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,\n  AlertDialogFooter, AlertDialogAction, AlertDialogCancel\n} from "@/components/ui/alert-dialog"`} />
      <DesignTokensTable rows={[["--card","white","Content background"],["--border","zinc-200","Content border"],["--backdrop","black/50","Overlay backdrop"],["--destructive","red-500","Destructive action button"],["--muted-foreground","zinc-500","Description text"],["--ring","violet-600/30","Focus ring"]]} />
      <BestPractices items={[{do:"Use AlertDialog for irreversible actions (delete, discard, logout).",dont:"Use AlertDialog for informational messages — use Dialog or Alert instead."},{do:"Make the action button label specific: 'Delete Account' not just 'OK'.",dont:"Use generic labels like 'Yes'/'No' — users should know the action without reading the description."}]} />
      <FigmaMapping rows={[
        ["Overlay","Black 50%","AlertDialogOverlay","bg-black/50, fixed inset-0, z-50"],
        ["Content","bg-card, border, shadow","AlertDialogContent","max-w-lg, rounded-xl, p-xl, gap-lg"],
        ["Icon","36px circle + icon","—","size-9 rounded-full border flex items-center justify-center"],
        ["Title","heading 4","AlertDialogTitle","typo-heading-4 text-foreground"],
        ["Description","paragraph small","AlertDialogDescription","typo-paragraph-sm text-muted-foreground"],
        ["Footer","flex, gap-xs","AlertDialogFooter","flex-col-reverse sm:flex-row sm:justify-end gap-xs"],
        ["Action","Button default","AlertDialogAction","Wraps Radix in Button via asChild"],
        ["Cancel","Button outline","AlertDialogCancel","Wraps Radix in Button via asChild"],
        ["ShowIcon","true / false","—","Toggle leading icon circle visibility"],
        ["ShowTitle","true / false","—","Toggle title text visibility"],
        ["ShowAction","true / false","—","Toggle footer action buttons"],
        ["ShowCancel","true / false","—","Toggle Cancel button (requires ShowAction=true)"],
        ["Behavior","Non-dismissible","—","Cannot close by clicking overlay (Radix default)"],
        ["Animation","Open / Close","data-state","zoom-in-95 / zoom-out-95, fade-in / fade-out"],
      ]} />
      <AccessibilityInfo keyboard={[["Tab","Move focus between action and cancel buttons"],["Shift+Tab","Move focus backwards between buttons"],["Enter / Space","Activate the focused button"],["Escape","Close the dialog (same as cancel)"]]} notes={["Cannot dismiss by clicking overlay — user must take explicit action","Focus trapped inside and auto-focused on first interactive element","Focus returns to trigger element when closed","role=\"alertdialog\" announces urgent content to screen readers","aria-labelledby → AlertDialogTitle for dialog label","aria-describedby → AlertDialogDescription for additional context"]} />
      <RelatedComponents items={[{name:"Dialog",desc:"Dismissible modal for forms and interactions — can close by clicking outside."},{name:"Sheet",desc:"Slide-out panel for larger content areas."},{name:"Drawer",desc:"Bottom sheet for mobile-friendly interactions."}]} />
    </div>
  )
}

function CollapsibleDocs() {
  const [open, setOpen] = useState(false)
  const [colDisabled, setColDisabled] = useState(false)
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Data Display</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Collapsible</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">An interactive component that expands/collapses a panel. Simpler alternative to Accordion for single sections.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Open", type: "toggle", value: open, onChange: setOpen },
        { label: "Disabled", type: "toggle", value: colDisabled, onChange: setColDisabled },
      ]}>
        <Collapsible open={open} onOpenChange={setOpen} disabled={colDisabled} className="w-full max-w-sm space-y-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Toggle section</h4>
            <CollapsibleTrigger asChild><Button variant="ghost" size="sm"><ChevronsUpDown className="size-4" /></Button></CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-xs">
            <div className="rounded-md border px-md py-xs text-sm">Expanded content here</div>
          </CollapsibleContent>
        </Collapsible>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Collapsible>\n  <CollapsibleTrigger asChild><Button variant="ghost">Toggle</Button></CollapsibleTrigger>\n  <CollapsibleContent>Hidden content</CollapsibleContent>\n</Collapsible>`}>
          <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm space-y-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">3 items tagged</h4>
              <CollapsibleTrigger asChild><Button variant="ghost" size="sm"><ChevronsUpDown className="size-4" /></Button></CollapsibleTrigger>
            </div>
            <div className="rounded-md border px-md py-xs text-sm">@radix-ui/primitives</div>
            <CollapsibleContent className="space-y-xs">
              <div className="rounded-md border px-md py-xs text-sm">@radix-ui/colors</div>
              <div className="rounded-md border px-md py-xs text-sm">@stitches/react</div>
            </CollapsibleContent>
          </Collapsible>
        </Example>
        <Example title="Default Open" description="Start expanded with defaultOpen." code={`<Collapsible defaultOpen>...</Collapsible>`}>
          <Collapsible defaultOpen className="w-full max-w-sm space-y-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Changelog</h4>
              <CollapsibleTrigger asChild><Button variant="ghost" size="sm"><ChevronsUpDown className="size-4" /></Button></CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-xs">
              <p className="text-sm text-muted-foreground">v2.1.0 — Added dark mode support</p>
              <p className="text-sm text-muted-foreground">v2.0.0 — Major redesign</p>
              <p className="text-sm text-muted-foreground">v1.5.0 — Performance improvements</p>
            </CollapsibleContent>
          </Collapsible>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["open", "boolean", "—", "Controlled open state"],
          ["defaultOpen", "boolean", "false", "Start expanded"],
          ["onOpenChange", "(open: boolean) => void", "—", "Callback when toggled"],
          ["disabled", "boolean", "false", "Prevent toggling"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-collapsible"]} importCode={`import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"`} />
      <DesignTokensTable rows={[["--border","zinc-200","Content border"],["--foreground","zinc-900","Trigger text"],["--ring","violet-600/30","Focus ring"]]} />
      <BestPractices items={[{do:"Use Collapsible for optional details that don't need to be visible by default.",dont:"Hide primary content inside collapsible sections."},{do:"Use a clear trigger label indicating expandable content.",dont:"Use collapsible for navigation menus — use Accordion for multi-section lists."}]} />
      <FigmaMapping rows={[["State","Open","open","true"],["State","Closed","open","false"],["State","Disabled","disabled","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus trigger"],["Enter / Space","Toggle open/close"]]} notes={["Trigger has aria-expanded","Content hidden when collapsed"]} />
      <RelatedComponents items={[{name:"Accordion",desc:"For multiple collapsible sections."},{name:"Card",desc:"For static containers."}]} />
    </div>
  )
}

function ComboboxDocs() {
  const [val, setVal] = useState("")
  const [cbDisabled, setCbDisabled] = useState(false)
  const frameworks = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "svelte", label: "Svelte" },
    { value: "solid", label: "Solid" },
  ]
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Combobox</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A searchable dropdown select. Combines a text input with a popover list for filtering and selecting options.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Disabled", type: "toggle", value: cbDisabled, onChange: setCbDisabled },
      ]}>
        <div className={cn(cbDisabled && "opacity-50 pointer-events-none")}>
          <Combobox options={frameworks} value={val} onValueChange={setVal} placeholder="Select framework..." />
        </div>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" code={`<Combobox\n  options={frameworks}\n  value={val}\n  onValueChange={setVal}\n  placeholder="Select framework..."\n/>`}>
          <Combobox options={frameworks} value={val} onValueChange={setVal} placeholder="Select framework..." />
        </Example>
        <Example title="With Default Value" description="Pre-selected option." code={`<Combobox options={options} value="react" />`}>
          <Combobox options={frameworks} value="react" placeholder="Select framework..." />
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["options", "{ value: string; label: string }[]", "[]", "Selectable options"],
          ["value", "string", '""', "Controlled selected value"],
          ["onValueChange", "(value: string) => void", "—", "Callback on selection"],
          ["placeholder", "string", '"Select option..."', "Trigger placeholder text"],
          ["searchPlaceholder", "string", '"Search..."', "Search input placeholder"],
          ["emptyText", "string", '"No results found."', "Empty state text"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-popover","cmdk"]} importCode={`import { Combobox } from "@/components/ui/combobox"`} />
      <DesignTokensTable rows={[["--popover","white","Dropdown background"],["--accent","zinc-100","Hover item"],["--border","zinc-200","Dropdown border"],["--muted-foreground","zinc-500","Placeholder/empty text"],["--primary","violet-600","Selected check icon"]]} />
      <BestPractices items={[{do:"Use Combobox when users need to search through 10+ options.",dont:"Use Combobox for fewer than 5 options — use Select instead."},{do:"Show 'No results found' when the search returns empty.",dont:"Leave the dropdown empty without explanation when no match."}]} />
      <FigmaMapping rows={[["State","Open","\u2014","dropdown visible"],["State","Selected","value","option-value"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus trigger"],["Enter / Space","Open dropdown"],["Arrow Up/Down","Navigate"],["Enter","Select option"],["Esc","Close"]]} notes={["Combines Input + Popover + Command","Supports type-ahead filtering"]} />
      <RelatedComponents items={[{name:"Select",desc:"For non-searchable dropdown."},{name:"Input",desc:"For free-text entry."}]} />
    </div>
  )
}

function DatePickerDocs() {
  const [date, setDate] = useState<Date>()
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Date Picker</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A date selection component with calendar popup. Supports single date and date range modes.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Mode", type: "select", options: ["single","range"], value: "single", onChange: () => {} },
      ]}>
        <DatePicker date={date} onDateChange={setDate} />
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Single Date" code={`<DatePicker date={date} onDateChange={setDate} />`}>
          <DatePicker date={date} onDateChange={setDate} />
        </Example>
        <Example title="Date Range" description="With preset shortcuts like Last 7 days, Last 30 days." code={`<DateRangePicker />`}>
          <DateRangePicker />
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">DatePicker</h3>
        <PropsTable rows={[
          ["date", "Date | undefined", "—", "Selected date"],
          ["onDateChange", "(date: Date | undefined) => void", "—", "Callback on change"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DateRangePicker</h3>
        <PropsTable rows={[
          ["from", "Date | undefined", "—", "Range start date"],
          ["to", "Date | undefined", "—", "Range end date"],
          ["onRangeChange", "(range: {from?: Date; to?: Date}) => void", "—", "Callback on range change"],
          ["presets", "boolean", "true", "Show preset shortcut buttons"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["react-day-picker","date-fns"]} importCode={`import { DatePicker } from "@/components/ui/date-picker"\nimport { DateRangePicker } from "@/components/ui/date-range-picker"`} />
      <DesignTokensTable rows={[["--popover","white","Calendar dropdown background"],["--primary","violet-600","Selected date"],["--accent","zinc-100","Hover date"],["--muted-foreground","zinc-500","Outside days"],["--border","zinc-200","Calendar border"]]} />
      <BestPractices items={[{do:"Use DatePicker for single dates and DateRangePicker for date ranges.",dont:"Build a custom date input — use the pre-built picker for consistency."},{do:"Set sensible default dates close to the expected selection.",dont:"Open the calendar on January 1970 — default to today or the relevant context date."}]} />
      <FigmaMapping rows={[["Mode","Single","DatePicker","present"],["Mode","Range","DateRangePicker","present"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus trigger"],["Enter / Space","Open calendar"],["Arrow Keys","Navigate days"],["Enter","Select date"],["Esc","Close"]]} notes={["Uses Calendar internally","DateRangePicker shows 2-month view"]} />
      <RelatedComponents items={[{name:"Calendar",desc:"Standalone calendar."},{name:"Input",desc:"For manual date entry."}]} />
    </div>
  )
}

function DrawerDocs() {
  const [showHandle, setShowHandle] = useState(true)
  const [showFooter, setShowFooter] = useState(true)

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Drawer</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A bottom sheet panel with swipe-to-close. Mobile-first alternative to Dialog and Sheet. Built on the vaul library.</p>
      </header>

      {/* Explore Behavior — static preview */}
      <ExploreBehavior controls={[
        { label: "Show Handle", type: "toggle", value: showHandle, onChange: setShowHandle },
        { label: "Show Footer", type: "toggle", value: showFooter, onChange: setShowFooter },
      ]}>
        <div className="relative w-full max-w-sm bg-card border border-border rounded-t-[10px] shadow pointer-events-none overflow-hidden">
          {showHandle && (
            <div className="flex justify-center pt-md">
              <div className="h-1 w-[100px] rounded-full bg-muted" />
            </div>
          )}
          <div className="p-md space-y-xs">
            <h3 className="text-base font-semibold text-foreground font-heading">Move Goal</h3>
            <p className="text-sm text-muted-foreground font-body">Set your daily activity goal.</p>
          </div>
          <div className="px-md pb-sm">
            <Slider defaultValue={[50]} max={100} step={1} disabled />
          </div>
          {showFooter && (
            <div className="flex flex-col gap-xs p-md pt-xs">
              <Button size="sm">Submit</Button>
              <Button variant="outline" size="sm">Cancel</Button>
            </div>
          )}
        </div>
      </ExploreBehavior>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" description="Bottom drawer with handle, header, slider, and footer actions." code={`<Drawer>\n  <DrawerTrigger asChild><Button>Open</Button></DrawerTrigger>\n  <DrawerContent>\n    <DrawerHeader>\n      <DrawerTitle>Move Goal</DrawerTitle>\n      <DrawerDescription>Set your daily activity goal.</DrawerDescription>\n    </DrawerHeader>\n    <div className="p-md"><Slider defaultValue={[50]} /></div>\n    <DrawerFooter>\n      <Button>Submit</Button>\n      <DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose>\n    </DrawerFooter>\n  </DrawerContent>\n</Drawer>`}>
          <Drawer>
            <DrawerTrigger asChild><Button variant="outline">Open Drawer</Button></DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Move Goal</DrawerTitle><DrawerDescription>Set your daily activity goal.</DrawerDescription></DrawerHeader>
              <div className="p-md"><Slider defaultValue={[50]} max={100} step={1} /></div>
              <DrawerFooter><Button>Submit</Button><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Example>
        <Example title="With Form" description="Drawer containing form inputs — ideal for quick edits on mobile." code={`<DrawerContent>\n  <DrawerHeader>\n    <DrawerTitle>Edit Profile</DrawerTitle>\n  </DrawerHeader>\n  <div className="p-md space-y-md">\n    <Input placeholder="Name" />\n    <Textarea placeholder="Bio" />\n  </div>\n  <DrawerFooter>...</DrawerFooter>\n</DrawerContent>`}>
          <Drawer>
            <DrawerTrigger asChild><Button variant="outline">Edit Profile</Button></DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Edit Profile</DrawerTitle><DrawerDescription>Update your display name and bio.</DrawerDescription></DrawerHeader>
              <div className="p-md space-y-md"><div className="space-y-xs"><Label>Name</Label><Input placeholder="Your name" /></div><div className="space-y-xs"><Label>Bio</Label><Textarea placeholder="Short bio" /></div></div>
              <DrawerFooter><Button>Save</Button><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Example>
        <Example title="Content Only" description="Drawer with handle but no footer — swipe to dismiss." code={`<DrawerContent>\n  <DrawerHeader>...</DrawerHeader>\n  <div className="p-md">Content here</div>\n</DrawerContent>`}>
          <Drawer>
            <DrawerTrigger asChild><Button variant="outline">Quick View</Button></DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Notifications</DrawerTitle><DrawerDescription>Your recent activity.</DrawerDescription></DrawerHeader>
              <div className="p-md space-y-xs">{["New comment on your post","Your report is ready","System maintenance tonight"].map((item, i) => (<div key={i} className="flex items-center gap-sm py-xs border-b border-border last:border-0"><Info className="size-4 text-muted-foreground shrink-0" /><p className="text-sm">{item}</p></div>))}</div>
            </DrawerContent>
          </Drawer>
        </Example>
        <Example title="Nested Scroll" description="Drawer with scrollable content area for long lists." code={`<DrawerContent>\n  <ScrollArea className="h-64">\n    {items.map(...)}\n  </ScrollArea>\n</DrawerContent>`}>
          <Drawer>
            <DrawerTrigger asChild><Button variant="outline">Select Item</Button></DrawerTrigger>
            <DrawerContent>
              <DrawerHeader><DrawerTitle>Choose a framework</DrawerTitle><DrawerDescription>Pick your preferred option.</DrawerDescription></DrawerHeader>
              <div className="px-md pb-md">{["React","Vue","Angular","Svelte","Solid","Qwik","Astro","Next.js"].map((fw, i) => (<button key={i} className="w-full text-left px-md py-sm text-sm hover:bg-accent rounded-md transition-colors">{fw}</button>))}</div>
              <DrawerFooter><DrawerClose asChild><Button variant="outline">Cancel</Button></DrawerClose></DrawerFooter>
            </DrawerContent>
          </Drawer>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">Drawer (Root)</h3>
        <PropsTable rows={[
          ["open", "boolean", "—", "Controlled open state"],
          ["onOpenChange", "(open: boolean) => void", "—", "Callback when open state changes"],
          ["shouldScaleBackground", "boolean", "true", "Scale page background when open"],
          ["dismissible", "boolean", "true", "Allow dismiss via overlay click or swipe"],
          ["snapPoints", "number[]", "—", "Snap points for drawer height (e.g. [0.5, 1])"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DrawerContent</h3>
        <PropsTable rows={[
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DrawerTrigger / DrawerClose</h3>
        <PropsTable rows={[
          ["asChild", "boolean", "false", "Merge props onto child element"],
        ]} />
      </section>

      <InstallationSection pkg={["vaul"]} importCode={`import {\n  Drawer, DrawerTrigger, DrawerContent,\n  DrawerHeader, DrawerTitle, DrawerDescription,\n  DrawerFooter, DrawerClose\n} from "@/components/ui/drawer"`} />
      <DesignTokensTable rows={[["--card","white","Content background"],["--border","zinc-200","Content border"],["--backdrop","black/80","Overlay backdrop"],["--muted","zinc-100","Handle bar color"],["--muted-foreground","zinc-500","Description text"]]} />
      <BestPractices items={[{do:"Use Drawer for mobile-friendly bottom sheets (confirmations, selections).",dont:"Use Drawer for complex forms — use a full page or Dialog instead."},{do:"Include a visible drag handle for swipe-to-close affordance.",dont:"Remove the handle bar — users need the visual cue for swipe gestures."}]} />
      <FigmaMapping rows={[
        ["Overlay","Black 80%","DrawerOverlay","bg-black/80, fixed inset-0"],
        ["Content","bg-card, border-t","DrawerContent","fixed inset-x-0 bottom-0, rounded-t-[10px]"],
        ["Handle","100x4px bar","—","mx-auto mt-md h-1 w-[100px] rounded-full bg-muted"],
        ["Header","Title + Description","DrawerHeader","grid gap-2xs p-md"],
        ["Title","heading 4","DrawerTitle","typo-heading-4 text-foreground"],
        ["Description","body text","DrawerDescription","typo-paragraph-sm text-muted-foreground"],
        ["Footer","Action buttons","DrawerFooter","mt-auto flex flex-col gap-xs p-md"],
        ["Close","Close button","DrawerClose","Wraps child with close behavior"],
        ["ShowHandle","true / false","—","Toggle drag handle bar visibility"],
        ["ShowFooter","true / false","—","Toggle footer action area"],
        ["Gesture","Swipe to close","—","vaul library built-in touch gesture"],
        ["Scale BG","true","shouldScaleBackground","Scale page background on open"],
      ]} />
      <AccessibilityInfo keyboard={[["Tab","Move focus within drawer (trapped)"],["Shift+Tab","Move focus backwards"],["Escape","Close the drawer"],["Enter / Space","Activate focused button"]]} notes={["Swipe-to-close on touch devices (vaul built-in)","Focus trapped inside when open","Returns focus to trigger on close","Built on vaul library — not Radix Dialog","Always include DrawerTitle for screen readers"]} />
      <RelatedComponents items={[{name:"Sheet",desc:"Desktop side panel from any edge."},{name:"Dialog",desc:"Centered modal alternative."},{name:"AlertDialog",desc:"Non-dismissible confirmation modal."}]} />
    </div>
  )
}

function InputOTPDocs() {
  const [otpLength, setOtpLength] = useState("6")
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Input OTP</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A one-time password input for verification codes. Supports auto-focus, paste, and keyboard navigation.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Length", type: "select", options: ["4","6","8"], value: otpLength, onChange: setOtpLength },
      ]}>
        <InputOTP maxLength={Number(otpLength)}>
          <InputOTPGroup>
            {Array.from({ length: Number(otpLength) }, (_, i) => (
              <InputOTPSlot key={i} index={i} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="6 Digits" code={`<InputOTP maxLength={6}>\n  <InputOTPGroup>\n    <InputOTPSlot index={0} />\n    ...\n  </InputOTPGroup>\n</InputOTP>`}>
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Example>
        <Example title="With Separator" description="Group digits with visual separator." code={`<InputOTPGroup>...<InputOTPSeparator />...<InputOTPGroup>`}>
          <InputOTP maxLength={6}>
            <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /></InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} /></InputOTPGroup>
          </InputOTP>
        </Example>
        <Example title="4 Digits" description="Shorter code for PIN entry." code={`<InputOTP maxLength={4}>...</InputOTP>`}>
          <InputOTP maxLength={4}>
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">InputOTP</h3>
        <PropsTable rows={[
          ["maxLength", "number", "—", "Number of OTP digits (required)"],
          ["value", "string", '""', "Controlled value"],
          ["onChange", "(value: string) => void", "—", "Callback on input"],
          ["containerClassName", "string", '""', "Container wrapper CSS classes"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">InputOTPSlot</h3>
        <PropsTable rows={[
          ["index", "number", "—", "Slot position (required, 0-based)"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["input-otp"]} importCode={`import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"`} />
      <DesignTokensTable rows={[["--border","zinc-200","Slot border"],["--ring","violet-600/30","Focus ring"],["--foreground","zinc-900","Digit text"],["--primary","violet-600","Active slot indicator"]]} />
      <BestPractices items={[{do:"Auto-advance focus to the next slot after digit entry.",dont:"Require users to manually click each slot."},{do:"Support paste for the full code in one action.",dont:"Block paste functionality — users copy OTP codes from SMS/email."}]} />
      <FigmaMapping rows={[["Length","4","maxLength","4"],["Length","6","maxLength","6"],["Length","8","maxLength","8"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus first slot"],["0-9","Enter digit"],["Backspace","Delete and move back"],["Arrow Left/Right","Navigate slots"],["Ctrl+V","Paste code"]]} notes={["Auto-advances to next slot","Supports paste for full code"]} />
      <RelatedComponents items={[{name:"Input",desc:"For standard text input."},{name:"Dialog",desc:"Often used in verification dialogs."}]} />
    </div>
  )
}

function HoverCardDocs() {
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Hover Card</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A rich preview card that appears when hovering over a trigger element. Ideal for user profiles and link previews.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="User Profile" description="Common pattern for @mention previews." code={`<HoverCard>\n  <HoverCardTrigger asChild><Button variant="ghost">@user</Button></HoverCardTrigger>\n  <HoverCardContent>...</HoverCardContent>\n</HoverCard>`}>
          <HoverCard>
            <HoverCardTrigger asChild><Button variant="ghost">@nextjs</Button></HoverCardTrigger>
            <HoverCardContent className="w-72">
              <div className="flex gap-md">
                <Avatar><AvatarImage src="https://github.com/vercel.png" /><AvatarFallback>VC</AvatarFallback></Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">@nextjs</h4>
                  <p className="text-xs text-muted-foreground">The React Framework — created and maintained by @vercel.</p>
                  <div className="flex items-center gap-xs text-xs text-muted-foreground"><CalendarIcon className="size-3" /><span>Joined December 2021</span></div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </Example>
        <Example title="Link Preview" description="Preview external links on hover." code={`<HoverCard><HoverCardTrigger>...</HoverCardTrigger>...</HoverCard>`}>
          <HoverCard>
            <HoverCardTrigger asChild><Button variant="ghost">Documentation</Button></HoverCardTrigger>
            <HoverCardContent className="w-64">
              <div className="space-y-xs">
                <h4 className="text-sm font-semibold">API Reference</h4>
                <p className="text-xs text-muted-foreground">Complete API documentation with examples, types, and migration guides.</p>
                <p className="text-xs text-primary">docs.example.com</p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">HoverCardContent</h3>
        <PropsTable rows={[
          ["align", '"start" | "center" | "end"', '"center"', "Horizontal alignment"],
          ["sideOffset", "number", "4", "Distance from trigger in px"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-hover-card"]} importCode={`import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"`} />
      <DesignTokensTable rows={[["--popover","white","Card background"],["--popover-foreground","zinc-900","Card text"],["--border","zinc-200","Card border"],["--muted-foreground","zinc-500","Secondary text"]]} />
      <BestPractices items={[{do:"Use HoverCard for previewing supplementary info (user profiles, links).",dont:"Put essential content in HoverCard — it's inaccessible on touch devices."},{do:"Keep content read-only and concise.",dont:"Include interactive elements (buttons, forms) — use Popover instead."}]} />
      <FigmaMapping rows={[["Align","Center","align",'"center"'],["Side Offset","4px","sideOffset","4"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus trigger to show"],["Esc","Dismiss card"]]} notes={["Opens on hover or focus","Content should be supplementary"]} />
      <RelatedComponents items={[{name:"Tooltip",desc:"For brief text hints."},{name:"Popover",desc:"For interactive content."}]} />
    </div>
  )
}

function CalendarDocs() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Calendar</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A date picker calendar built on react-day-picker. Supports single date and range selection.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Show Outside Days", type: "toggle", value: true, onChange: () => {} },
      ]}>
        <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
      </ExploreBehavior>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Single Date" code={`<Calendar mode="single" selected={date} onSelect={setDate} />`}>
          <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
        </Example>
        <Example title="Read-only" description="Display a calendar without interaction." code={`<Calendar mode="single" selected={new Date()} />`}>
          <Calendar mode="single" selected={new Date()} className="rounded-md border pointer-events-none" />
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["mode", '"single" | "range"', '"single"', "Selection mode"],
          ["selected", "Date | DateRange", "—", "Selected date(s)"],
          ["onSelect", "(date) => void", "—", "Callback on selection"],
          ["showOutsideDays", "boolean", "true", "Show days from adjacent months"],
          ["disabled", "Date[] | Matcher", "—", "Dates to disable"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <InstallationSection pkg={["react-day-picker","date-fns"]} importCode={`import { Calendar } from "@/components/ui/calendar"`} />
      <DesignTokensTable rows={[["--primary","violet-600","Selected day"],["--accent","zinc-100","Hover day"],["--muted-foreground","zinc-500","Outside days text"],["--foreground","zinc-900","Day text"],["--border","zinc-200","Calendar border"]]} />
      <BestPractices items={[{do:"Use Calendar inline when date selection is the primary task.",dont:"Use Calendar inline for quick date picking — use DatePicker with popover."},{do:"Disable dates outside valid ranges with the disabled prop.",dont:"Allow selection of invalid dates and validate later."}]} />
      <FigmaMapping rows={[["Mode","Single","mode",'"single"'],["Mode","Range","mode",'"range"'],["Outside Days","true","showOutsideDays","true"]]} />
      <AccessibilityInfo keyboard={[["Arrow Keys","Navigate days"],["Enter / Space","Select day"],["Page Up/Down","Prev/next month"],["Home / End","First/last day of week"]]} notes={["Built on react-day-picker v9","Supports disabled dates"]} />
      <RelatedComponents items={[{name:"DatePicker",desc:"Calendar in a popover."},{name:"Input",desc:"For manual date entry."}]} />
    </div>
  )
}

function ContextMenuDocs() {
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Context Menu</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A right-click context menu with support for items, checkboxes, radio groups, and submenus.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" description="Right-click the area below." code={`<ContextMenu>\n  <ContextMenuTrigger>Right click here</ContextMenuTrigger>\n  <ContextMenuContent>\n    <ContextMenuItem>Edit</ContextMenuItem>\n  </ContextMenuContent>\n</ContextMenu>`}>
          <ContextMenu>
            <ContextMenuTrigger className="flex h-32 w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">Right click here</ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem><ArrowLeft className="size-4 mr-2" />Back<ContextMenuShortcut>⌘[</ContextMenuShortcut></ContextMenuItem>
              <ContextMenuItem><ArrowRight className="size-4 mr-2" />Forward<ContextMenuShortcut>⌘]</ContextMenuShortcut></ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuSub>
                <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-40">
                  <ContextMenuItem>Email</ContextMenuItem>
                  <ContextMenuItem>Message</ContextMenuItem>
                  <ContextMenuItem>Copy Link</ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuItem><Pencil className="size-4 mr-2" />Edit</ContextMenuItem>
              <ContextMenuItem className="text-destructive"><Trash2 className="size-4 mr-2" />Delete</ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">ContextMenuContent</h3>
        <PropsTable rows={[
          ["className", "string", '""', "Additional CSS classes"],
          ["alignOffset", "number", "0", "Alignment offset in px"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">ContextMenuItem</h3>
        <PropsTable rows={[
          ["inset", "boolean", "false", "Add left padding for alignment"],
          ["disabled", "boolean", "false", "Disable the item"],
        ]} />
      </section>

      <InstallationSection pkg={["@radix-ui/react-context-menu"]} importCode={`import {\n  ContextMenu, ContextMenuTrigger, ContextMenuContent,\n  ContextMenuItem, ContextMenuSeparator, ContextMenuLabel,\n  ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem\n} from "@/components/ui/context-menu"`} />
      <DesignTokensTable rows={[["--popover","white","Menu background"],["--accent","zinc-100","Hover item"],["--border","zinc-200","Menu border"],["--muted-foreground","zinc-500","Label text"],["--destructive","red-500","Destructive item"]]} />
      <BestPractices items={[{do:"Use ContextMenu for secondary actions discoverable via right-click.",dont:"Put primary actions in ContextMenu — users may never find them."},{do:"Match ContextMenu items with the DropdownMenu for the same element.",dont:"Have different actions in context menu vs dropdown for the same item."}]} />
      <FigmaMapping rows={[["Align","Start","align",'"start"'],["Align","Center","align",'"center"']]} />
      <AccessibilityInfo keyboard={[["Right Click","Open menu"],["Arrow Up/Down","Navigate items"],["Arrow Right","Open submenu"],["Enter","Activate item"],["Esc","Close"]]} notes={["Uses role=\"menu\" with menuitem","Supports submenus and radio items"]} />
      <RelatedComponents items={[{name:"DropdownMenu",desc:"For button-triggered menus."},{name:"Popover",desc:"For non-menu content."}]} />
    </div>
  )
}


// ============================================================
// FOUNDATION PAGES
// ============================================================

function ColorsDocs() {
  const semanticColors = [
    { name: "Background", var: "background", tw: "bg-background" },
    { name: "Foreground", var: "foreground", tw: "text-foreground" },
    { name: "Primary", var: "primary", tw: "bg-primary" },
    { name: "Primary Foreground", var: "primary-foreground", tw: "text-primary-foreground" },
    { name: "Secondary", var: "secondary", tw: "bg-secondary" },
    { name: "Muted", var: "muted", tw: "bg-muted" },
    { name: "Muted Foreground", var: "muted-foreground", tw: "text-muted-foreground" },
    { name: "Accent", var: "accent", tw: "bg-accent" },
    { name: "Destructive", var: "destructive", tw: "bg-destructive" },
    { name: "Border", var: "border", tw: "border-border" },
    { name: "Ring", var: "ring", tw: "ring-ring" },
    { name: "Card", var: "card", tw: "bg-card" },
  ]
  const statusColors = [
    { name: "Success", var: "success", tw: "bg-success" },
    { name: "Success Subtle", var: "success-subtle", tw: "bg-success-subtle" },
    { name: "Warning", var: "warning", tw: "bg-warning" },
    { name: "Warning Subtle", var: "warning-subtle", tw: "bg-warning-subtle" },
    { name: "Emphasis", var: "emphasis", tw: "bg-emphasis" },
    { name: "Emphasis Subtle", var: "emphasis-subtle", tw: "bg-emphasis-subtle" },
    { name: "Brand", var: "brand", tw: "bg-brand" },
    { name: "Brand Subtle", var: "brand-subtle", tw: "bg-brand-subtle" },
  ]
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Foundation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Colors</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Semantic color tokens from the design system. All colors adapt to light/dark mode automatically.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Semantic Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sm">
          {semanticColors.map(c => (
            <div key={c.name} className="border border-border rounded-lg overflow-hidden">
              <div className="h-16" style={{ backgroundColor: `var(--${c.var})` }} />
              <div className="p-xs">
                <p className="font-semibold text-xs">{c.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground">--{c.var}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{c.tw}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Status Colors</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sm">
          {statusColors.map(c => (
            <div key={c.name} className="border border-border rounded-lg overflow-hidden">
              <div className="h-16" style={{ backgroundColor: `var(--${c.var})` }} />
              <div className="p-xs">
                <p className="font-semibold text-xs">{c.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground">--{c.var}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{c.tw}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Color Palettes</h2>
        {[
    { name: "violet", shades: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95", 950: "#2e1065" } },
    { name: "zinc", shades: { 50: "#fafafa", 100: "#f4f4f5", 200: "#e4e4e7", 300: "#d4d4d8", 400: "#a1a1aa", 500: "#71717a", 600: "#52525b", 700: "#3f3f46", 800: "#27272a", 900: "#18181b", 950: "#09090b" } },
    { name: "red", shades: { 50: "#fef2f2", 100: "#ffe2e2", 200: "#fecaca", 300: "#fca5a5", 400: "#f87171", 500: "#ef4444", 600: "#dc2626", 700: "#b91c1c", 800: "#991b1b", 900: "#7f1d1d", 950: "#450a0a" } },
    { name: "green", shades: { 50: "#f0fdf4", 100: "#dcfce7", 200: "#bbf7d0", 300: "#86efac", 400: "#4ade80", 500: "#22c55e", 600: "#16a34a", 700: "#15803d", 800: "#166534", 900: "#14532d", 950: "#052e16" } },
    { name: "amber", shades: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f", 950: "#451a03" } },
    { name: "blue", shades: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a", 950: "#172554" } },
    { name: "teal", shades: { 50: "#f0fdfa", 100: "#ccfbf1", 200: "#99f6e4", 300: "#5eead4", 400: "#2dd4bf", 500: "#14b8a6", 600: "#0d9488", 700: "#0f766e", 800: "#115e59", 900: "#134e4a", 950: "#042f2e" } },
    { name: "indigo", shades: { 50: "#eef2ff", 100: "#e0e7ff", 200: "#c7d2fe", 300: "#a5b4fc", 400: "#818cf8", 500: "#6366f1", 600: "#4f46e5", 700: "#4338ca", 800: "#3730a3", 900: "#312e81", 950: "#1e1b4b" } },
    { name: "rose", shades: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337", 950: "#4c0519" } },
    { name: "emerald", shades: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b", 950: "#022c22" } },
    { name: "orange", shades: { 50: "#fff7ed", 100: "#ffedd5", 200: "#fed7aa", 300: "#fdba74", 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c", 800: "#9a3412", 900: "#7c2d12", 950: "#431407" } },
    { name: "purple", shades: { 50: "#faf5ff", 100: "#f3e8ff", 200: "#e9d5ff", 300: "#d8b4fe", 400: "#c084fc", 500: "#a855f7", 600: "#9333ea", 700: "#7e22ce", 800: "#6b21a8", 900: "#581c87", 950: "#3b0764" } },
    { name: "cyan", shades: { 50: "#ecfeff", 100: "#cffafe", 200: "#a5f3fc", 300: "#67e8f9", 400: "#22d3ee", 500: "#06b6d4", 600: "#0891b2", 700: "#0e7490", 800: "#155e75", 900: "#164e63", 950: "#083344" } },
    { name: "pink", shades: { 50: "#fdf2f8", 100: "#fce7f3", 200: "#fbcfe8", 300: "#f9a8d4", 400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d", 800: "#9d174d", 900: "#831843", 950: "#500724" } }
        ].map(palette => (
          <div key={palette.name} className="space-y-xs">
            <h3 className="font-semibold text-sm capitalize">{palette.name}</h3>
            <div className="flex gap-1 rounded-lg overflow-hidden">
              {[50,100,200,300,400,500,600,700,800,900,950].map(shade => (
                <div key={shade} className="flex-1 h-10" style={{ backgroundColor: (palette.shades as Record<number,string>)[shade] || "transparent" }} title={`${palette.name}-${shade}`} />
              ))}
            </div>
            <div className="flex gap-1">
              {[50,100,200,300,400,500,600,700,800,900,950].map(shade => (
                <p key={shade} className="flex-1 text-[9px] text-center text-muted-foreground">{shade}</p>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

function TypographyDocs() {
  const typeScale = [
    { name: "Heading 1", cls: "text-4xl font-bold font-heading", spec: "Plus Jakarta Sans / Bold / 36px / 40px" },
    { name: "Heading 2", cls: "text-3xl font-bold font-heading", spec: "Plus Jakarta Sans / Bold / 30px / 36px" },
    { name: "Heading 3", cls: "text-2xl font-semibold font-heading", spec: "Plus Jakarta Sans / SemiBold / 24px / 32px" },
    { name: "Heading 4", cls: "text-xl font-semibold font-heading", spec: "Plus Jakarta Sans / SemiBold / 20px / 28px" },
    { name: "Paragraph", cls: "text-base font-body", spec: "Inter / Regular / 16px / 24px" },
    { name: "Paragraph SM", cls: "text-sm font-body", spec: "Inter / Regular / 14px / 20px" },
    { name: "Paragraph XS", cls: "text-xs font-body", spec: "Inter / Regular / 12px / 16px" },
    { name: "Code", cls: "text-sm font-mono", spec: "JetBrains Mono / Regular / 14px / 20px" },
  ]
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Foundation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Typography</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Three font families optimized for readability: Plus Jakarta Sans for headings, Inter for body, JetBrains Mono for code.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Font Families</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="border border-border rounded-lg p-md space-y-xs">
            <p className="font-heading font-bold text-xl">Plus Jakarta Sans</p>
            <p className="text-xs text-muted-foreground">Headings & Titles</p>
            <p className="text-xs font-mono text-muted-foreground">font-heading</p>
          </div>
          <div className="border border-border rounded-lg p-md space-y-xs">
            <p className="font-body text-xl">Inter</p>
            <p className="text-xs text-muted-foreground">Body & UI Text</p>
            <p className="text-xs font-mono text-muted-foreground">font-body</p>
          </div>
          <div className="border border-border rounded-lg p-md space-y-xs">
            <p className="font-mono text-xl">JetBrains Mono</p>
            <p className="text-xs text-muted-foreground">Code & Monospace</p>
            <p className="text-xs font-mono text-muted-foreground">font-mono</p>
          </div>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Type Scale</h2>
        <div className="space-y-md">
          {typeScale.map(t => (
            <div key={t.name} className="border border-border rounded-lg p-md flex items-center justify-between">
              <div className="space-y-xs">
                <p className={t.cls}>The quick brown fox jumps over the lazy dog</p>
                <p className="text-xs font-mono text-muted-foreground">{t.spec}</p>
              </div>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-sm py-1 rounded shrink-0 ml-md">{t.name}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Font Weights</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[["Regular (400)","font-normal"],["Medium (500)","font-medium"],["SemiBold (600)","font-semibold"],["Bold (700)","font-bold"]].map(([name,cls]) => (
            <div key={name} className="border border-border rounded-lg p-md text-center">
              <p className={`text-xl font-heading ${cls}`}>Aa</p>
              <p className="text-xs text-muted-foreground mt-xs">{name}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{cls}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SpacingDocs() {
  const spacings = [
    { name: "4xs", value: "2px", tw: "p-4xs" },
    { name: "3xs", value: "4px", tw: "p-3xs" },
    { name: "2xs", value: "6px", tw: "p-2xs" },
    { name: "xs", value: "8px", tw: "p-xs" },
    { name: "sm", value: "12px", tw: "p-sm" },
    { name: "md", value: "16px", tw: "p-md" },
    { name: "lg", value: "20px", tw: "p-lg" },
    { name: "xl", value: "24px", tw: "p-xl" },
    { name: "2xl", value: "32px", tw: "p-2xl" },
    { name: "3xl", value: "40px", tw: "p-3xl" },
    { name: "4xl", value: "48px", tw: "p-4xl" },
  ]
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Foundation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Spacing</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Consistent spacing scale from Figma semantic tokens. Used for padding, margin, and gap.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Scale</h2>
        <div className="space-y-xs">
          {spacings.map(s => (
            <div key={s.name} className="flex items-center gap-md border border-border rounded-lg p-xs">
              <span className="w-12 text-xs font-semibold">{s.name}</span>
              <div className="bg-gradient-to-r from-violet-500 to-violet-600 rounded-sm" style={{ width: s.value, height: "20px" }} />
              <span className="text-xs font-mono text-muted-foreground">{s.value}</span>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-sm py-0.5 rounded">{s.tw}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function BorderRadiusDocs() {
  const radii = [
    { name: "none", value: "0px", tw: "rounded-none" },
    { name: "xs", value: "2px", tw: "rounded-xs" },
    { name: "sm", value: "4px", tw: "rounded-sm" },
    { name: "md", value: "6px", tw: "rounded-md" },
    { name: "lg", value: "8px", tw: "rounded-lg" },
    { name: "10", value: "10px", tw: "rounded-10" },
    { name: "xl", value: "12px", tw: "rounded-xl" },
    { name: "2xl", value: "16px", tw: "rounded-2xl" },
    { name: "3xl", value: "24px", tw: "rounded-3xl" },
    { name: "full", value: "9999px", tw: "rounded-full" },
  ]
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Foundation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Border Radius</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Border radius tokens from Figma. Maps to Tailwind rounded-* utilities.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Scale</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-md">
          {radii.map(r => (
            <div key={r.name} className="border border-border rounded-lg p-md flex flex-col items-center gap-xs">
              <div className="size-16 bg-gradient-to-br from-violet-500 to-violet-600" style={{ borderRadius: r.value }} />
              <p className="font-semibold text-xs">{r.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{r.value}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{r.tw}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ShadowsDocs() {
  const shadows = [
    { name: "2xs", tw: "shadow-2xs", desc: "0 1px 0 black/5%" },
    { name: "xs", tw: "shadow-xs", desc: "0 1px 2px black/5%" },
    { name: "sm (default)", tw: "shadow", desc: "0 1px 3px black/10%, 0 1px 2px -1px black/10%" },
    { name: "md", tw: "shadow-md", desc: "0 4px 6px -1px black/10%, 0 2px 4px -2px black/10%" },
    { name: "lg", tw: "shadow-lg", desc: "0 10px 15px -3px black/10%, 0 4px 6px -4px black/10%" },
    { name: "xl", tw: "shadow-xl", desc: "0 20px 25px -5px black/10%, 0 8px 10px -6px black/10%" },
    { name: "2xl", tw: "shadow-2xl", desc: "0 25px 50px 12px black/25%" },
  ]
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Foundation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Shadows</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Elevation shadow tokens. Figma shadow-sm = Tailwind shadow (default), not shadow-sm.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Scale</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {shadows.map(s => (
            <div key={s.name} className={`bg-card border border-border rounded-xl p-lg ${s.tw}`}>
              <p className="font-semibold text-sm">{s.name}</p>
              <p className="text-xs font-mono text-muted-foreground mt-xs">{s.tw}</p>
              <p className="text-[10px] text-muted-foreground mt-3xs">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function IconsDocs() {
  const [iconSearch, setIconSearch] = useState("")
  // Get all icon components from lucide-react
  const allIcons = Object.entries(LucideIcons)
    .filter(([name, comp]: [string, any]) => /^[A-Z]/.test(name) && !name.endsWith("Icon") && comp && typeof comp === "object" && comp.render)
    .map(([name, comp]) => ({ name, Icon: comp as React.ComponentType<{ className?: string }> }))
  const filteredIcons = iconSearch
    ? allIcons.filter(i => i.name.toLowerCase().includes(iconSearch.toLowerCase()))
    : allIcons
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Foundation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Icons</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Lucide React — {allIcons.length}+ icons. Consistent 24px grid, 1.5px stroke. Search to find any icon.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Icon Sizes</h2>
        <div className="flex items-end gap-lg border border-border rounded-lg p-lg">
          {[["size-4","16px"],["size-5","20px"],["size-6","24px"],["size-8","32px"]].map(([cls,px]) => (
            <div key={cls} className="flex flex-col items-center gap-xs">
              <Star className={cls} />
              <p className="text-[10px] font-mono text-muted-foreground">{cls}</p>
              <p className="text-[10px] text-muted-foreground">{px}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">All Icons ({filteredIcons.length})</h2>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search icons..." value={iconSearch} onChange={e => setIconSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-xs">
          {filteredIcons.slice(0, 500).map(({ name, Icon }) => (
            <div key={name} className="border border-border rounded-md p-xs flex flex-col items-center gap-3xs hover:bg-muted/50 transition-colors cursor-default" title={name}>
              <Icon className="size-5" />
              <p className="text-[8px] font-mono text-muted-foreground truncate w-full text-center">{name}</p>
            </div>
          ))}
        </div>
        {filteredIcons.length > 500 && <p className="text-xs text-muted-foreground">Showing 500 of {filteredIcons.length} — use search to find specific icons.</p>}
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Usage</h2>
        <div className="border border-border rounded-lg p-md space-y-sm">
          <p className="text-sm text-muted-foreground">Import from <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-xs">lucide-react</code> and use as React components:</p>
          <div className="bg-zinc-950 text-zinc-100 p-sm rounded-lg text-xs font-mono">
            {`import { Search, Plus, Check } from "lucide-react"

<Search className="size-4" />
<Plus className="size-5 text-primary" />`}
          </div>
        </div>
      </section>
    </div>
  )
}

function IllustrationsDocs() {
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Foundation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Illustrations</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Placeholder patterns and decorative elements used for empty states, onboarding, and feature highlights.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Empty States</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {[
            { title: "No Data", icon: BarChart3, desc: "Used when charts or tables have no data to display." },
            { title: "No Results", icon: Search, desc: "Used when a search or filter returns no matches." },
            { title: "No Items", icon: Package, desc: "Used when a list or collection is empty." },
          ].map(item => (
            <div key={item.title} className="border border-border rounded-xl p-lg flex flex-col items-center text-center gap-md">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center">
                <item.icon className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Decorative Patterns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div className="border border-border rounded-xl p-lg">
            <div className="h-32 rounded-lg bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Gradient Background</p>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-sm">bg-gradient-to-br from-primary/10 via-primary/5 to-transparent</p>
          </div>
          <div className="border border-border rounded-xl p-lg">
            <div className="h-32 rounded-lg relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-lg bg-[radial-gradient(circle_at_50%_50%,var(--primary)_0%,transparent_70%)] opacity-10" />
              <p className="text-sm text-muted-foreground relative">Radial Glow</p>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-sm">radial-gradient with primary color</p>
          </div>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Guidelines</h2>
        <div className="border border-border rounded-lg p-md space-y-sm text-sm text-muted-foreground">
          <p>\u2022 Use Lucide icons at larger sizes (32-48px) with muted backgrounds for empty states</p>
          <p>\u2022 Gradient patterns should use primary color at low opacity (5-10%)</p>
          <p>\u2022 Keep illustrations minimal and functional — avoid decorative clutter</p>
          <p>\u2022 All illustrations must work in both light and dark mode</p>
        </div>
      </section>
    </div>
  )
}

// ============================================================
// COMPONENT REGISTRY
// ============================================================

type ComponentId = string

const componentGroups = [
  {
    label: "Foundation",
    items: [
      { id: "colors", label: "Colors" },
      { id: "typography", label: "Typography" },
      { id: "spacing", label: "Spacing" },
      { id: "border-radius", label: "Border Radius" },
      { id: "shadows", label: "Shadows" },
      { id: "icons", label: "Icons" },
      { id: "illustrations", label: "Illustrations" },
    ],
  },
  {
    label: "Form",
    items: [
      { id: "button", label: "Button" },
      { id: "input", label: "Input" },
      { id: "textarea", label: "Textarea" },
      { id: "select", label: "Select" },
      { id: "checkbox", label: "Checkbox" },
      { id: "radio", label: "Radio" },
      { id: "switch", label: "Switch" },
      { id: "toggle", label: "Toggle" },
      { id: "slider", label: "Slider" },
      { id: "combobox", label: "Combobox" },
      { id: "date-picker", label: "Date Picker" },
      { id: "calendar", label: "Calendar" },
      { id: "input-otp", label: "Input OTP" },
      { id: "label", label: "Label" },
    ],
  },
  {
    label: "Data Display",
    items: [
      { id: "badge", label: "Badge" },
      { id: "avatar", label: "Avatar" },
      { id: "accordion", label: "Accordion" },
      { id: "collapsible", label: "Collapsible" },
      { id: "table", label: "Table" },
      { id: "card", label: "Card" },
      { id: "hover-card", label: "Hover Card" },
    ],
  },
  {
    label: "Feedback",
    items: [
      { id: "alert", label: "Alert" },
      { id: "progress", label: "Progress" },
      { id: "spinner", label: "Spinner" },
      { id: "skeleton", label: "Skeleton" },
    ],
  },
  {
    label: "Navigation",
    items: [
      { id: "tabs", label: "Tabs" },
      { id: "breadcrumb", label: "Breadcrumb" },
      { id: "pagination", label: "Pagination" },
    ],
  },
  {
    label: "Overlay",
    items: [
      { id: "dialog", label: "Dialog" },
      { id: "alert-dialog", label: "Alert Dialog" },
      { id: "sheet", label: "Sheet" },
      { id: "drawer", label: "Drawer" },
      { id: "dropdown", label: "Dropdown Menu" },
      { id: "context-menu", label: "Context Menu" },
      { id: "popover", label: "Popover" },
      { id: "tooltip", label: "Tooltip" },
    ],
  },
  {
    label: "Layout",
    items: [
      { id: "separator", label: "Separator" },
      { id: "scroll-area", label: "Scroll Area" },
    ],
  },
]

const componentDocs: Record<string, () => ReactNode> = {
  colors: ColorsDocs,
  typography: TypographyDocs,
  spacing: SpacingDocs,
  "border-radius": BorderRadiusDocs,
  shadows: ShadowsDocs,
  icons: IconsDocs,
  illustrations: IllustrationsDocs,
  button: ButtonDocs,
  input: InputDocs,
  textarea: TextareaDocs,
  select: SelectDocs,
  badge: BadgeDocs,
  checkbox: CheckboxDocs,
  radio: RadioDocs,
  switch: SwitchDocs,
  toggle: ToggleDocs,
  slider: SliderDocs,
  label: LabelDocs,
  avatar: AvatarDocs,
  accordion: AccordionDocs,
  table: TableDocs,
  card: CardDocs,
  alert: AlertDocs,
  progress: ProgressDocs,
  spinner: SpinnerDocs,
  skeleton: SkeletonDocs,
  tabs: TabsDocs,
  breadcrumb: BreadcrumbDocs,
  pagination: PaginationDocs,
  dialog: DialogDocs,
  sheet: SheetDocs,
  dropdown: DropdownDocs,
  popover: PopoverDocs,
  tooltip: TooltipDocs,
  separator: SeparatorDocs,
  "scroll-area": ScrollAreaDocs,
  "alert-dialog": AlertDialogDocs,
  collapsible: CollapsibleDocs,
  combobox: ComboboxDocs,
  "date-picker": DatePickerDocs,
  drawer: DrawerDocs,
  "input-otp": InputOTPDocs,
  "hover-card": HoverCardDocs,
  calendar: CalendarDocs,
  "context-menu": ContextMenuDocs,
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function DesignSystem() {
  const [active, setActive] = useState<ComponentId>("colors")
  const { resolvedTheme, toggleTheme } = useTheme()

  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash && componentDocs[hash]) setActive(hash)
  }, [])

  const navigate = (id: string) => {
    setActive(id)
    window.location.hash = id
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const DocComponent = componentDocs[active]

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center px-lg border-b border-border bg-background">
          <Link to="/dashboard" className="flex items-center gap-xs text-muted-foreground hover:text-foreground transition-colors group mr-md">
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-sm font-body hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-xs">
            <svg viewBox="0 0 28 28" fill="none" className="size-7">
              <path d="M14 3L24 10L14 25L4 10Z" fill="url(#dsGrd)" fillOpacity="0.5" stroke="url(#dsGrd)" strokeWidth="1" strokeOpacity="0.7"/>
              <path d="M14 7L20 11.5L14 22L8 11.5Z" fill="url(#dsGrd)" fillOpacity="0.85"/>
              <defs><linearGradient id="dsGrd" x1="4" y1="3" x2="24" y2="25"><stop stopColor="#c4b5fd"/><stop offset="1" stopColor="#818cf8"/></linearGradient></defs>
            </svg>
            <span className="font-heading font-semibold text-sm">Design System</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-xs">
            <span className="sp-caption text-muted-foreground hidden sm:inline">{Object.keys(componentDocs).length} components</span>
            <div className="h-4 w-px bg-border mx-2xs hidden sm:block" />
            <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={toggleTheme}>
              {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>

        <div className="flex pt-14">
          {/* Sidebar */}
          <aside className="fixed left-0 top-14 w-[220px] h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-border bg-background">
            <nav className="py-md">
              {componentGroups.map((group, gi) => (
                <div key={group.label} className={cn(gi > 0 && "mt-lg")}>
                  <p className="px-lg mb-3xs text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest font-heading">{group.label}</p>
                  <div>
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.id)}
                        className={cn(
                          "w-full text-left px-lg py-[5px] text-[13px] font-body transition-colors duration-150 border-l-2",
                          active === item.id
                            ? "border-l-primary text-primary font-medium bg-primary/5"
                            : "border-l-transparent text-muted-foreground hover:text-foreground hover:border-l-border"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="ml-[220px] flex-1 min-h-[calc(100vh-3.5rem)]">
            <div className="max-w-5xl mx-auto px-2xl py-2xl">
              <div key={active} className="animate-page-in">
                {DocComponent ? <DocComponent /> : <p className="sp-body text-muted-foreground">Select a component from the sidebar.</p>}
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
