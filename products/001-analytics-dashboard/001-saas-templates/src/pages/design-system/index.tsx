import { useState, useEffect, useCallback, type ReactNode, type ComponentType } from "react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"

// Icons — named imports for component usage
import {
  ArrowLeft, Sun, Moon, Copy, Check, ChevronLeft, ChevronRight, Plus, Trash2, X,
  Search, Bold, Italic, Underline, ChevronsUpDown, CalendarIcon,
  AlertCircle, CheckCircle2, AlertTriangle, Info, Loader2,
  User, Bell, Settings, ChevronDown, MoreHorizontal,
  ArrowRight, Pencil, Share, Star, Package, BarChart3, Eye, Palette,
  XCircle, Sparkles, Clock, ArrowUp, ArrowDown, Menu,
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ShopPulseLogo, AuthIllustration } from "@/components/layout/auth-layout"
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
  Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command"
import { Combobox } from "@/components/ui/combobox"
import { DatePickerTrigger, DatePicker, DateRangePicker } from "@/components/ui/date-picker"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Calendar, DayCell, dayCellStyles, type DayCellState } from "@/components/ui/calendar"
import { SearchBox } from "@/components/ui/search-box"
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger,
  ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

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
    <div className="group relative rounded-lg bg-zinc-950 text-zinc-100 text-[13px] p-sm overflow-x-auto">
      <pre className="font-mono whitespace-pre-wrap">{code}</pre>
      <button onClick={copy} className="absolute top-2 right-2 p-1 rounded bg-zinc-800/80 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  )
}

function Example({ title, description, code, children, allowOverflow, flush }: {
  title: string; description?: string; code: string; children: ReactNode; allowOverflow?: boolean; flush?: boolean
}) {
  const [showCode, setShowCode] = useState(false)
  return (
    <div className={cn("border border-border rounded-xl flex flex-col", !allowOverflow && "overflow-hidden")}>
      <div className={cn("p-md bg-muted/30", allowOverflow && "rounded-t-xl")}>
        <h4 className="font-semibold text-sm font-heading">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className={cn("border-t border-border flex-1", flush ? "" : "p-lg flex flex-wrap items-center gap-md", allowOverflow && "items-start")}>
        {children}
      </div>
      <div className="border-t border-border px-md py-xs flex justify-end mt-auto">
        <button onClick={() => setShowCode(!showCode)} className="text-xs text-muted-foreground hover:text-foreground">
          {showCode ? "Hide code" : "View code"}
        </button>
      </div>
      {showCode && <div className={cn("border-t border-border", allowOverflow && "rounded-b-xl")}><CodeBlock code={code} /></div>}
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

function ExploreBehavior({ controls = [], children, flush = false }: { controls?: ControlDef[]; children: ReactNode; flush?: boolean }) {
  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className={cn(flush ? "bg-muted/20" : "p-2xl flex items-center justify-center min-h-[160px] bg-muted/20 gap-md flex-wrap")}>
          {children}
        </div>
        {controls.length > 0 && <div className="border-t border-border p-md bg-muted/10">
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
                      <div key={c.label} className={cn("flex flex-col gap-xs", c.disabled && "opacity-50 pointer-events-none")}>
                        <Label className="text-xs text-muted-foreground font-body">{c.label}</Label>
                        <Switch checked={!!c.value} onCheckedChange={c.onChange} disabled={c.disabled} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}
        </div>}
      </div>
    </section>
  )
}

// ============================================================
// ADDITIONAL SECTION HELPERS
// ============================================================

function CodeBlockFlush({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const copy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])
  return (
    <div className="group relative bg-code text-code-foreground text-[13px] p-md overflow-x-auto border-t border-border">
      <pre className="font-mono whitespace-pre-wrap">{code}</pre>
      <button onClick={copy} className="absolute top-2 right-2 p-1 rounded bg-muted/60 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      </button>
    </div>
  )
}

function InstallationSection({ pkg, importCode }: { pkg: string[]; importCode: string }) {
  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Installation</h2>
      <div className="border border-border rounded-xl overflow-hidden">
        {pkg.length > 0 && (
          <>
            <div className="px-md py-sm bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground">Dependencies</p>
            </div>
            <CodeBlockFlush code={`pnpm add ${pkg.join(" ")}`} />
            <div className="px-md py-sm bg-muted/30 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground">Import</p>
            </div>
          </>
        )}
        {pkg.length === 0 && (
          <div className="px-md py-sm bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground">Import</p>
          </div>
        )}
        <CodeBlockFlush code={importCode} />
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

function BestPractices({ items }: { items: { title?: string; do: string; dont: string }[] }) {
  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Best Practices</h2>
      <div className="space-y-md">
        {items.map((item, i) => (
          <div key={i} className="space-y-xs">
            {item.title && <h3 className="text-sm font-semibold">{item.title}</h3>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-sm">
              <div className="border border-success/40 bg-success/5 rounded-lg p-md space-y-xs">
                <p className="text-xs font-semibold text-success uppercase tracking-wide">Do</p>
                <p className="text-sm text-foreground font-body">{item.do}</p>
              </div>
              <div className="border border-destructive/40 bg-destructive/5 rounded-lg p-md space-y-xs">
                <p className="text-xs font-semibold text-destructive uppercase tracking-wide">Don't</p>
                <p className="text-sm text-foreground font-body">{item.dont}</p>
              </div>
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
        { label: "Icon", type: "select", options: ["none","left","right","both","icon-only"], value: ico, onChange: setIco },
      ]}>
        <div className={cn(isFocus && "[&_button]:ring-2 [&_button]:ring-ring")}>
          <Button variant={v as any} size={ico === "icon-only" ? "icon" : sz as any} disabled={isDisabled} className={cn(isHover && v === "default" && "bg-primary-hover", isHover && v === "secondary" && "bg-secondary-hover", isHover && v === "outline" && "bg-outline-hover", isHover && v === "ghost" && "bg-ghost-hover")}>
            {ico === "icon-only" ? <Plus className="size-4" /> : <>
              {(ico === "left" || ico === "both") && <Plus className="size-4" />}
              Button
              {(ico === "right" || ico === "both") && <ChevronRight className="size-4" />}
            </>}
          </Button>
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={[]} importCode={`import { Button } from "@/components/ui/button"`} />

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

        <Example title="Hover State" description="Simulated hover — border darkens and background shifts." code={`<Button className="bg-primary-hover">Save Changes</Button>`}>
          <Button className="bg-primary-hover">Default</Button>
          <Button variant="outline" className="bg-accent">Outline</Button>
          <Button variant="ghost" className="bg-accent">Ghost</Button>
        </Example>

        <Example title="Focus State" description="Keyboard focus ring shown on Tab navigation." code={`<Button className="ring-2 ring-ring">Save Changes</Button>`}>
          <Button className="ring-2 ring-ring">Default</Button>
          <Button variant="outline" className="ring-2 ring-ring">Outline</Button>
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

      <DesignTokensTable rows={[["--primary","violet-600","Default variant background"],["--primary-hover","violet-700","Hover state"],["--secondary","zinc-100","Secondary variant background"],["--destructive","red-500","Destructive variant"],["--ring","violet-600/30","Focus ring"],["--radius-md","10px","Button border radius"]]} />
      <BestPractices items={[
        {title:"Content",do:"Use one primary action per section to establish clear hierarchy — label should be a verb (Save, Delete, Continue).",dont:"Place multiple primary buttons side by side — use secondary or outline for less important actions."},
        {title:"Visual",do:"Include aria-label on icon-only buttons so screen reader users know the action.",dont:"Use icon-only buttons without a tooltip or accessible label — the icon alone is not enough context."},
      ]} />
      <FigmaMapping rows={[["Variant","Primary","variant",'"default"'],["Variant","Secondary","variant",'"secondary"'],["Variant","Outline","variant",'"outline"'],["Variant","Ghost","variant",'"ghost"'],["Size","Large (40px)","size",'"lg"'],["Size","Default (36px)","size",'"default"'],["Size","Small (32px)","size",'"sm"'],["Size","Mini (24px)","size",'"xs"'],["State","Disabled","disabled","true"],["Show Left Icon","true","children","<Icon /> Label"]]} />
      <AccessibilityInfo keyboard={[["Tab","Move focus to button"],["Enter / Space","Activate button"]]} notes={["Icon-only buttons must include aria-label","Use type=\"submit\" for form submission"]} />
      <RelatedComponents items={[
        {name:"Toggle",desc:"Stateful button that stays pressed to represent an on/off value. Use instead of Button when the action is reversible and needs to show active state."},
        {name:"Badge",desc:"Non-interactive label for status or category display. Use Badge when there is no user action — Badge is never clickable."},
      ]} />
    </div>
  )
}

function InputDocs() {
  const [state, setState] = useState("default")
  const [val, setVal] = useState("placeholder")
  const [left, setLeft] = useState("none")
  const [right, setRight] = useState("none")
  const isDisabled = state === "disabled"
  const isError = state === "error"
  const isFocus = state === "focus"
  const isHover = state === "hover"
  const iconLeftProp = left === "icon" ? <Search /> : undefined
  const prefixProp = left === "prefix" ? "$" : undefined
  const textLeftProp = left === "textLeft" ? "https://" : undefined
  const iconRightProp = right === "icon" ? <ArrowRight /> : undefined
  const suffixProp = right === "suffix" ? "kg" : undefined
  const textRightProp = right === "textRight" ? ".com" : undefined
  const valueProp = val === "filled" ? { value: "name@example.com", onChange: () => {} } : {}
  const placeholderProp = val === "placeholder" ? "Placeholder text" : undefined
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Input</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A text input field with focus ring, error, and disabled states. Supports inner decorations (iconLeft, iconRight, prefix, suffix) and outer addon labels (textLeft, textRight) as built-in props.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "State", type: "select", options: ["default","hover","focus","error","disabled"], value: state, onChange: setState },
        { label: "Value", type: "select", options: ["placeholder","filled","empty"], value: val, onChange: setVal },
        { label: "Left", type: "select", options: ["none","icon","prefix","textLeft"], value: left, onChange: setLeft },
        { label: "Right", type: "select", options: ["none","icon","suffix","textRight"], value: right, onChange: setRight },
      ]}>
        <div className="max-w-xs w-full">
          <Input
            key={val}
            disabled={isDisabled}
            aria-invalid={isError || undefined}
            placeholder={placeholderProp}
            iconLeft={iconLeftProp}
            prefix={prefixProp}
            textLeft={textLeftProp}
            iconRight={iconRightProp}
            suffix={suffixProp}
            textRight={textRightProp}
            className={cn(isFocus && "ring-[3px] ring-ring outline-none", isHover && "border-border-strong")}
            {...valueProp}
          />
        </div>
      </ExploreBehavior>
      <InstallationSection pkg={[]} importCode={`import { Input } from "@/components/ui/input"`} />
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" description="Basic text input with placeholder." code={`<Input placeholder="Enter email..." />`}>
          <Input placeholder="Enter email..." className="max-w-xs" />
        </Example>
<Example title="With Label" description="Always pair with a visible Label for accessibility." code={`<Label>Email</Label>\n<Input type="email" placeholder="name@example.com" />`}>
          <div className="space-y-3xs w-full max-w-xs">
            <Label>Email</Label>
            <Input type="email" placeholder="name@example.com" />
          </div>
        </Example>
        <Example title="Password" description="Use type='password' for sensitive fields. Pair with iconRight for a show/hide toggle affordance." code={`<Input type="password" placeholder="Enter password" iconRight={<Eye />} />`}>
          <Input type="password" placeholder="Enter password" iconRight={<Eye />} className="max-w-xs" />
        </Example>
        <Example title="Icon Left" description="Leading icon for contextual affordance, e.g. search or user." code={`<Input iconLeft={<Search />} placeholder="Search..." />`}>
          <Input iconLeft={<Search />} placeholder="Search..." className="max-w-xs" />
        </Example>
        <Example title="Icon Right" description="Trailing icon for actions like clear, reveal password, or status." code={`<Input iconRight={<ArrowRight />} placeholder="Go to..." />`}>
          <Input iconRight={<ArrowRight />} placeholder="Go to..." className="max-w-xs" />
        </Example>
        <Example title="With Prefix" description="Text prefix inside the input, e.g. currency symbol or URL scheme." code={`<Input prefix="$" placeholder="0.00" />`}>
          <Input prefix="$" placeholder="0.00" className="max-w-xs" />
        </Example>
        <Example title="With Suffix" description="Text suffix inside the input, e.g. unit or domain." code={`<Input suffix="kg" placeholder="Enter weight" />`}>
          <Input suffix="kg" placeholder="Enter weight" className="max-w-xs" />
        </Example>
        <Example title="Text Left" description="Outer addon label on the left, visually attached to the input." code={`<Input textLeft="https://" placeholder="yoursite.com" />`}>
          <Input textLeft="https://" placeholder="yoursite.com" className="max-w-xs" />
        </Example>
        <Example title="Text Right" description="Outer addon label on the right, visually attached to the input." code={`<Input textRight=".com" placeholder="yoursite" />`}>
          <Input textRight=".com" placeholder="yoursite" className="max-w-xs" />
        </Example>
        <Example title="Text Left + Right" description="Wrap input with addon labels on both sides." code={`<Input textLeft="https://" textRight=".com" placeholder="yoursite" />`}>
          <Input textLeft="https://" textRight=".com" placeholder="yoursite" className="max-w-xs" />
        </Example>
        <Example title="With Button" description="Inline composition for email capture or search submit." code={`<div className="flex gap-xs">\n  <Input placeholder="Enter email" />\n  <Button>Subscribe</Button>\n</div>`}>
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
          ["type", "string", '"text"', "HTML input type (text, email, password, etc.)"],
          ["placeholder", "string", "—", "Placeholder text"],
          ["disabled", "boolean", "false", "Disables the input"],
          ["aria-invalid", "boolean", "false", "Show error border styling"],
          ["iconLeft", "ReactNode", "—", "Icon rendered inside the input on the left"],
          ["iconRight", "ReactNode", "—", "Icon rendered inside the input on the right"],
          ["prefix", "string", "—", "Short text rendered inside the input before the value (e.g. '$')"],
          ["suffix", "string", "—", "Short text rendered inside the input after the value (e.g. 'kg')"],
          ["textLeft", "string", "—", "Outer addon label attached to the left of the input"],
          ["textRight", "string", "—", "Outer addon label attached to the right of the input"],
          ["className", "string", '""', "Additional CSS classes applied to the input element"],
        ]} />
      </section>

      <DesignTokensTable rows={[["--input","transparent","Input background"],["--border","zinc-200","Default border"],["--ring","violet-600/30","Focus ring"],["--ring-error","red-500/30","Error focus ring"],["--muted-foreground","zinc-500","Placeholder / icon color"],["--foreground","zinc-900","Input text"],["--muted","zinc-100","Addon label background"]]} />
      <BestPractices items={[{title:"Labeling",do:"Always pair with <Label> using htmlFor for accessibility.",dont:"Use placeholder text as the only label — it disappears on input."},{title:"Validation",do:"Show validation errors immediately with aria-invalid and a visible error message.",dont:"Block form submission without surfacing field-level errors."},{title:"Inner vs Outer decorations",do:"Use iconLeft/iconRight for icons and prefix/suffix for short text inside the input. Use textLeft/textRight for longer labels that sit outside.",dont:"Mix inner and outer decorations on the same side — e.g. textLeft + iconLeft together creates visual clutter."}]} />
      <FigmaMapping rows={[["State","Hover","className",'"border-border-strong"'],["State","Focus","className",'"ring-[3px] ring-ring outline-none"'],["State","Error","aria-invalid","true"],["State","Disabled","disabled","true"],["Decoration","Icon Left","iconLeft","<SearchIcon />"],["Decoration","Icon Right","iconRight","<ArrowRightIcon />"],["Decoration","Prefix","prefix",'"$"'],["Decoration","Suffix","suffix",'"kg"'],["Addon","Text Left","textLeft",'"https://"'],["Addon","Text Right","textRight","'.com'"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus the input"],["Esc","Clear focus"]]} notes={["Always pair with <Label> for accessibility","Use aria-invalid for error states","Icons are marked pointer-events-none so they don't interfere with input focus"]} />
      <RelatedComponents items={[{name:"Textarea",desc:"Use Textarea for multi-line text entry. Prefer Input when the response fits on one line."},{name:"Select",desc:"Use Select when the user must choose from a fixed list. Input is better for free-form text."},{name:"Combobox",desc:"Use Combobox when options are searchable or user-typed values are valid. Input alone lacks the dropdown affordance."}]} />
    </div>
  )
}

function SearchBoxDocs() {
  const [state, setState] = useState("default")
  const [val, setVal] = useState("placeholder")
  const [showShortcut, setShowShortcut] = useState(true)

  const isDisabled = state === "disabled"
  const isFocus = state === "focus"
  const isHover = state === "hover"
  const valueProp = val === "filled" ? { value: "Wireless headphones", readOnly: true } : { defaultValue: "" }

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Search Box</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A pill-shaped search input with Search icon (left) and optional ⌘K shortcut badge (right). Matches the header search bar pattern used across the dashboard.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
        { label: "Value", type: "select", options: ["placeholder","filled"], value: val, onChange: setVal },
        { label: "Shortcut", type: "toggle", value: showShortcut, onChange: setShowShortcut },
      ]}>
        <div className="max-w-xs w-full">
          <SearchBox
            key={val}
            disabled={isDisabled}
            shortcut={showShortcut}
            placeholder="Search products..."
            className={cn(isFocus && "[&>input]:ring-[3px] [&>input]:ring-ring [&>input]:outline-none", isHover && "[&>input]:border-border-strong")}
            {...valueProp}
          />
        </div>
      </ExploreBehavior>
      <InstallationSection pkg={[]} importCode={`import { SearchBox } from "@/components/ui/search-box"`} />
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Default" description="Pill-shaped search with Search icon and placeholder." code={`<SearchBox placeholder="Search..." />`}>
            <SearchBox placeholder="Search..." className="max-w-xs" />
          </Example>
          <Example title="With Shortcut" description="Shows a ⌘K keyboard shortcut badge when empty. Badge hides when input has a value." code={`<SearchBox shortcut placeholder="Search..." />`}>
            <SearchBox shortcut placeholder="Search..." className="max-w-xs" />
          </Example>
          <Example title="With Clear Button" description="Clear button (X) appears when input has a value. Press Escape to clear." code={`<SearchBox value={search} onChange={setSearch} />`}>
            <SearchBoxLiveExample />
          </Example>
          <Example title="Disabled" description="Disabled state prevents interaction." code={`<SearchBox disabled placeholder="Search..." />`}>
            <SearchBox disabled placeholder="Search..." className="max-w-xs" />
          </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["value", "string", '""', "Controlled search value"],
          ["onChange", "(value: string) => void", "—", "Callback when value changes — receives the string directly"],
          ["onClear", "() => void", "—", "Callback when clear button is clicked or Escape pressed"],
          ["shortcut", "boolean", "false", "Show ⌘K keyboard shortcut badge when input is empty"],
          ["placeholder", "string", '"Search..."', "Placeholder text"],
          ["disabled", "boolean", "false", "Disables the input"],
          ["className", "string", '""', "Additional CSS classes on the wrapper"],
        ]} />
      </section>
      <DesignTokensTable rows={[["--muted","zinc-100 / white 4%","Input background (light / dark)"],["--border","50% opacity","Default border"],["--ring","violet-600/30","Focus ring"],["--muted-foreground","zinc-500","Search icon & placeholder color"],["--foreground","zinc-900","Input text & clear icon hover"],["--foreground/5","zinc-900 5%","⌘K badge background (light)"],["white/6%","white 6%","⌘K badge background (dark)"]]} />
      <BestPractices items={[{title:"Usage",do:"Use SearchBox for filtering and search in management pages — products, orders, invoices, users.",dont:"Use SearchBox for search with autocomplete dropdown — use Combobox or Command instead."},{title:"Labeling",do:"Always add aria-label for accessibility since SearchBox has no visible label.",dont:"Rely on placeholder text as the only accessible label."}]} />
      <FigmaMapping rows={[["State","Default","—","No special state"],["State","Hover","—","border-border-strong"],["State","Focus","—","ring-[3px] ring-ring"],["State","Disabled","disabled","true"],["Value","Placeholder","—","Placeholder text shown, shortcut or nothing on right"],["Value","Filled","—","Text shown, X clear button visible"],["Shortcut","Yes","shortcut","true — shows ⌘K badge when empty"],["Shortcut","No","shortcut","false — no badge"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus the search input"],["Escape","Clear search value when focused"],["Type","Filter results as you type"]]} notes={["Uses type='search' for semantic search input","Clear button has aria-label='Clear search'","Native browser search cancel button is hidden in favor of custom X icon"]} />
      <RelatedComponents items={[{name:"Input",desc:"General-purpose text field. SearchBox is a specialized pill-shaped search variant."},{name:"Combobox",desc:"Use Combobox when search results should appear in a dropdown list."},{name:"Command",desc:"Use Command for global search with keyboard-driven navigation."}]} />
    </div>
  )
}

function SearchBoxLiveExample() {
  const [search, setSearch] = useState("")
  return <SearchBox value={search} onChange={setSearch} placeholder="Type to search..." className="max-w-xs" />
}

function BadgeDocs() {
  const [type, setType] = useState<"badge" | "round" | "dot">("badge")
  const [v, setV] = useState("default")
  const [lv, setLv] = useState("primary")
  const [sz, setSz] = useState("default")
  const isBadge = type === "badge"
  const isRound = type === "round"
  const isDot = type === "dot"
  const dotVariants = ["default","secondary","destructive","emphasis","success","warning"]
  const allVariants = ["default","secondary","outline","ghost","destructive","emphasis","success","warning"]
  const variantOptions = isDot ? dotVariants : allVariants
  const levelOptions = isBadge ? ["primary","secondary"] : ["primary"]
  // Reset restricted values on type change
  useEffect(() => {
    if (isDot && !dotVariants.includes(v)) setV("default")
    if (!isBadge) setLv("primary")
  }, [type])
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Data Display</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Badge</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A compact inline label for categorizing content, indicating status, or displaying notification counts. Three shapes available: Badge (pill text), BadgeRound (circular count), and BadgeDot (status dot).</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Type", type: "select", options: ["badge","round","dot"], value: type, onChange: (val: string) => setType(val as any) },
        { label: "Variant", type: "select", options: variantOptions, value: v, onChange: setV },
        { label: "Level", type: "select", options: levelOptions, value: lv, onChange: setLv },
        { label: "Size", type: "select", options: ["sm","default","lg"], value: sz, onChange: setSz },
      ]}>
        {isBadge ? (
          <Badge variant={v as any} level={lv as any} size={sz as any}>Badge</Badge>
        ) : isRound ? (
          <BadgeRound variant={v as any} size={sz as any}>3</BadgeRound>
        ) : (
          <BadgeDot variant={v as any} size={sz as any} />
        )}
      </ExploreBehavior>

      <InstallationSection pkg={[]} importCode={`import { Badge, BadgeRound, BadgeDot } from "@/components/ui/badge"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="All Variants" description="Eight color variants cover the full semantic spectrum — from neutral to destructive." code={`<Badge>Default</Badge>\n<Badge variant="secondary">Secondary</Badge>\n<Badge variant="outline">Outline</Badge>\n<Badge variant="ghost">Ghost</Badge>\n<Badge variant="destructive">Destructive</Badge>\n<Badge variant="emphasis">Emphasis</Badge>\n<Badge variant="success">Success</Badge>\n<Badge variant="warning">Warning</Badge>`}>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="emphasis">Emphasis</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
        </Example>
        <Example title="Secondary Level (Subtle)" description="level=&quot;secondary&quot; reduces visual weight by using a muted background — ideal for dense UIs." code={`<Badge variant="success" level="secondary">Active</Badge>\n<Badge variant="warning" level="secondary">Pending</Badge>\n<Badge variant="destructive" level="secondary">Failed</Badge>\n<Badge variant="emphasis" level="secondary">New</Badge>`}>
          <Badge variant="success" level="secondary">Active</Badge>
          <Badge variant="warning" level="secondary">Pending</Badge>
          <Badge variant="destructive" level="secondary">Failed</Badge>
          <Badge variant="emphasis" level="secondary">New</Badge>
        </Example>
        <Example title="Sizes" description="Three sizes: sm (20px), default (24px), lg (28px). Choose based on surrounding text size." code={`<Badge size="sm">Small</Badge>\n<Badge>Default</Badge>\n<Badge size="lg">Large</Badge>`}>
          <Badge size="sm">Small</Badge>
          <Badge>Default</Badge>
          <Badge size="lg">Large</Badge>
        </Example>
        <Example title="With Icon" description="Pair an icon before or after the label to reinforce meaning without extra copy." code={`<Badge variant="success"><CheckCircle2 className="size-sm" />Verified</Badge>\n<Badge variant="warning"><Clock className="size-sm" />Pending</Badge>`}>
          <Badge variant="success"><CheckCircle2 className="size-sm" />Verified</Badge>
          <Badge variant="warning"><Clock className="size-sm" />Pending</Badge>
          <Badge variant="destructive"><XCircle className="size-sm" />Rejected</Badge>
          <Badge variant="emphasis"><Sparkles className="size-sm" />New</Badge>
        </Example>
        <Example title="Badge Round" description="Circular badge for notification counts or icon indicators. No level prop — primary fill only." code={`<BadgeRound>3</BadgeRound>\n<BadgeRound variant="destructive">!</BadgeRound>\n<BadgeRound variant="success" size="lg">12</BadgeRound>`}>
          <BadgeRound>3</BadgeRound>
          <BadgeRound variant="secondary">7</BadgeRound>
          <BadgeRound variant="destructive">!</BadgeRound>
          <BadgeRound variant="success" size="lg">12</BadgeRound>
          <BadgeRound variant="warning" size="sm">2</BadgeRound>
        </Example>
        <Example title="Badge Dot" description="A 4–12px status dot with role=&quot;status&quot; and aria-label built in — use for online/offline indicators." code={`<div className="flex items-center gap-xs">\n  <BadgeDot variant="success" /> Online\n</div>`}>
          <div className="flex items-center gap-lg">
            <div className="flex items-center gap-xs"><BadgeDot variant="success" /> Online</div>
            <div className="flex items-center gap-xs"><BadgeDot variant="warning" /> Away</div>
            <div className="flex items-center gap-xs"><BadgeDot variant="destructive" /> Offline</div>
            <div className="flex items-center gap-xs"><BadgeDot variant="secondary" size="sm" /> Muted</div>
          </div>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground">Custom component built with class-variance-authority. No external package dependency — all props are applied via className merging.</p>
        <h3 className="font-semibold text-sm mt-md">Badge</h3>
        <PropsTable rows={[
          ["variant", '"default" | "secondary" | "outline" | "ghost" | "destructive" | "emphasis" | "success" | "warning"', '"default"', "Color variant"],
          ["level", '"primary" | "secondary"', '"primary"', "Visual weight — primary=solid fill, secondary=subtle muted background"],
          ["size", '"sm" | "default" | "lg"', '"default"', "Badge height: sm=20px, default=24px, lg=28px"],
          ["className", "string", '—', "Additional CSS classes merged via cn()"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">BadgeRound</h3>
        <PropsTable rows={[
          ["variant", '"default" | "secondary" | "outline" | "ghost" | "destructive" | "emphasis" | "success" | "warning"', '"default"', "Color variant (same 8 as Badge; primary fill only — no level prop)"],
          ["size", '"sm" | "default" | "lg"', '"default"', "Circle size: sm=20px, default=24px, lg=28px"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">BadgeDot</h3>
        <PropsTable rows={[
          ["variant", '"default" | "secondary" | "destructive" | "emphasis" | "success" | "warning"', '"default"', "Dot color (no outline/ghost — dots need visible fill)"],
          ["size", '"sm" | "default" | "lg"', '"default"', "Dot diameter: sm=4px, default=8px, lg=12px"],
          ["aria-label", "string", '"status indicator"', "Overrides the built-in aria-label for screen readers"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--primary","violet-600","Default / BadgeRound / BadgeDot fill"],
        ["--primary-subtle","violet-100","level=secondary default background"],
        ["--success","green-500","Success variant fill"],
        ["--success-subtle","green-100","level=secondary success background"],
        ["--warning","amber-500","Warning variant fill"],
        ["--warning-subtle","amber-100","level=secondary warning background"],
        ["--destructive","red-500","Destructive variant fill"],
        ["--destructive-subtle","red-100","level=secondary destructive background"],
        ["--emphasis","purple-600","Emphasis variant fill"],
        ["--border","zinc-200","Outline variant border"],
      ]} />
      <BestPractices items={[
        {do:"Use semantic variants (success, warning, destructive) to match the status meaning.",dont:"Apply a random color variant for visual variety — colors carry semantic weight."},
        {do:"Keep badge text to 1–2 words maximum for legibility at small sizes.",dont:"Put long phrases or full sentences inside a Badge — use Alert or Toast instead."},
        {do:"Use BadgeDot for inline presence/status indicators alongside a user name or avatar.",dont:"Use Badge where an interactive element is needed — use Button or a clickable tag instead."},
      ]} />
      <FigmaMapping rows={[
        ["Type","Badge","type",'"badge"'],
        ["Type","Round","type",'"round"'],
        ["Type","Dot","type",'"dot"'],
        ["Variant","Default → Warning (8 values, 6 for Dot)","variant",'"default" … "warning"'],
        ["Level","Primary / Secondary (Badge only)","level",'"primary" | "secondary"'],
        ["Size","Small / Default / Large","size",'"sm" | "default" | "lg"'],
      ]} />
      <AccessibilityInfo
        keyboard={[["—","Badge, BadgeRound, and BadgeDot are non-interactive and not keyboard-focusable"]]}
        notes={[
          "Badge and BadgeRound are purely presentational <span> elements — add aria-label to the parent if the badge conveys essential meaning not available in surrounding text.",
          "BadgeDot automatically includes role=\"status\" and aria-label=\"status indicator\" — override aria-label when the dot represents a specific state (e.g., aria-label=\"Online\").",
          "Avoid relying on color alone to convey meaning: pair variant color with a visible text label or icon for users with color vision deficiency.",
          "When embedding a BadgeRound count inside an icon button, add aria-label to the button that includes the count (e.g., aria-label=\"Notifications, 3 unread\").",
        ]}
      />
      <RelatedComponents items={[
        {name:"Button",desc:"Use when the badge-like element needs to be interactive or clickable."},
        {name:"Avatar",desc:"Combine with BadgeDot to show user presence status overlaid on an avatar."},
        {name:"Alert",desc:"For prominent status messages that require more space than a badge."},
        {name:"Progress",desc:"For quantitative completion status rather than a categorical label."},
      ]} />
    </div>
  )
}

function CheckboxDocs() {
  const [checked, setChecked] = useState<boolean | "indeterminate">(false)
  const [state, setState] = useState("default")
  const isDisabled = state === "disabled"
  const isHover = state === "hover"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Checkbox</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A control that allows the user to toggle between checked and not checked. Supports three values: unchecked, checked, and indeterminate for partial-selection patterns.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Value", type: "select", options: ["unchecked","checked","indeterminate"], value: checked === true ? "checked" : checked === "indeterminate" ? "indeterminate" : "unchecked", onChange: (v: string) => setChecked(v === "checked" ? true : v === "indeterminate" ? "indeterminate" : false) },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
      ]}>
        <div className="flex items-center gap-xs">
          <Checkbox
            checked={checked}
            onCheckedChange={setChecked}
            disabled={isDisabled}
            id="exp-cb"
            className={cn(
              isHover && "border-primary/60",
              isFocus && "ring-[3px] ring-ring outline-none",
            )}
          />
          <Label htmlFor="exp-cb">Accept terms</Label>
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-checkbox"]} importCode={`import { Checkbox } from "@/components/ui/checkbox"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Default" description="Unchecked state — the initial value before user interaction." code={`<div className="flex items-center gap-xs">\n  <Checkbox id="terms" />\n  <Label htmlFor="terms">Accept terms and conditions</Label>\n</div>`}>
            <div className="flex items-center gap-xs">
              <Checkbox id="cb-default" />
              <Label htmlFor="cb-default">Accept terms and conditions</Label>
            </div>
          </Example>
          <Example title="Checked" description="Checked state indicating the option is selected." code={`<div className="flex items-center gap-xs">\n  <Checkbox checked id="checked" />\n  <Label htmlFor="checked">Checked</Label>\n</div>`}>
            <div className="flex items-center gap-xs">
              <Checkbox checked id="cb-checked" />
              <Label htmlFor="cb-checked">Checked</Label>
            </div>
          </Example>
          <Example title="Indeterminate" description="Partial selection — used for parent checkboxes when only some children are selected." code={`<div className="flex items-center gap-xs">\n  <Checkbox checked="indeterminate" id="indet" />\n  <Label htmlFor="indet">Select All (partial)</Label>\n</div>`}>
            <div className="flex items-center gap-xs">
              <Checkbox checked="indeterminate" id="cb-indet" />
              <Label htmlFor="cb-indet">Select All (partial)</Label>
            </div>
          </Example>
          <Example title="Interactive" description="Controlled checkbox using useState — label reflects the current value." code={`const [checked, setChecked] = useState(false)\n<Checkbox checked={checked} onCheckedChange={setChecked} />`}>
            <div className="flex items-center gap-xs">
              <Checkbox checked={checked} onCheckedChange={setChecked} id="cb-interactive" />
              <Label htmlFor="cb-interactive">{checked === true ? "Checked" : checked === "indeterminate" ? "Indeterminate" : "Unchecked"}</Label>
            </div>
          </Example>
          <Example title="In Form Context" description="Multiple checkboxes in a fieldset — each paired with a label for full click-area coverage." code={`<fieldset className="space-y-xs">\n  <legend>Notification preferences</legend>\n  <div className="flex items-center gap-xs"><Checkbox id="n1" /><Label htmlFor="n1">Email</Label></div>\n  <div className="flex items-center gap-xs"><Checkbox id="n2" defaultChecked /><Label htmlFor="n2">Push</Label></div>\n  <div className="flex items-center gap-xs"><Checkbox id="n3" /><Label htmlFor="n3">SMS</Label></div>\n</fieldset>`}>
            <fieldset className="space-y-xs border-0 p-0 m-0">
              <legend className="text-sm font-medium mb-xs">Notification preferences</legend>
              <div className="flex items-center gap-xs"><Checkbox id="cb-n1" /><Label htmlFor="cb-n1">Email</Label></div>
              <div className="flex items-center gap-xs"><Checkbox id="cb-n2" defaultChecked /><Label htmlFor="cb-n2">Push</Label></div>
              <div className="flex items-center gap-xs"><Checkbox id="cb-n3" /><Label htmlFor="cb-n3">SMS</Label></div>
            </fieldset>
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

      <DesignTokensTable rows={[
        ["--primary","violet-600","Checked background and indeterminate background"],
        ["--primary-foreground","white","Check and minus icon color"],
        ["--border-strong","zinc-400","Unchecked border"],
        ["--ring","violet-600/30","Focus ring"],
        ["--ring-error","red-500/30","Error focus ring"],
        ["--destructive","red-600","Error checked background"],
        ["--destructive-border","red-500","Error state border"],
      ]} />

      <BestPractices items={[
        {
          title: "Always pair with a Label",
          do: "Wrap Checkbox with a <Label htmlFor> so the full text is clickable and screen readers announce it correctly.",
          dont: "Render a standalone checkbox without any visible label — it passes no context to assistive technology.",
        },
        {
          title: "Use indeterminate for partial selection",
          do: "Set checked='indeterminate' on a parent checkbox when only some children are selected in a tree or list.",
          dont: "Leave the parent checkbox unchecked when some children are checked — it misrepresents the current selection.",
        },
        {
          title: "Reserve checkbox for multi-select",
          do: "Use Checkbox when the user can pick multiple independent options from a list.",
          dont: "Use Checkbox for binary on/off application settings — prefer Switch which better communicates immediate effect.",
        },
      ]} />

      <FigmaMapping rows={[
        ["Value","Unchecked","checked","false"],
        ["Value","Checked","checked","true"],
        ["Value","Indeterminate","checked",'"indeterminate"'],
        ["State","Default","—","—"],
        ["State","Hover","className","border-primary/60"],
        ["State","Focus","className","ring-[3px] ring-ring"],
        ["State","Disabled","disabled","true"],
        ["State","Error","aria-invalid","true"],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Tab","Move focus to the checkbox"],
          ["Space","Toggle checked / unchecked"],
        ]}
        notes={[
          "Uses aria-checked for screen readers; indeterminate maps to aria-checked='mixed'",
          "Indeterminate state must be set programmatically — there is no native HTML equivalent",
          "Always provide a visible label or aria-label so the purpose is announced",
        ]}
      />

      <RelatedComponents items={[
        {
          name: "Switch",
          desc: "Switch is designed for immediate on/off application settings that take effect without a submit button. Use Checkbox instead when the selection is part of a form that the user submits explicitly.",
        },
        {
          name: "Radio",
          desc: "Radio enforces single selection within a group — only one option can be active at a time. Use Checkbox when multiple independent options can all be selected simultaneously.",
        },
      ]} />
    </div>
  )
}

function SwitchDocs() {
  const [value, setValue] = useState("off")
  const [state, setState] = useState("default")
  const isOn = value === "on"
  const isDisabled = state === "disabled"
  const isHover = state === "hover"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Switch</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A toggle switch for boolean on/off settings that take effect immediately without a form submit. Visually distinct from Checkbox — it communicates an instant action rather than a deferred selection.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Value", type: "select", options: ["off", "on"], value: value, onChange: setValue },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
      ]}>
        <div className="flex items-center gap-xs">
          <Switch
            checked={isOn}
            onCheckedChange={(v) => setValue(v ? "on" : "off")}
            disabled={isDisabled}
            className={cn(
              isHover && "opacity-90",
              isFocus && "ring-[3px] ring-ring outline-none",
            )}
          />
          <Label>{isOn ? "On" : "Off"}</Label>
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-switch"]} importCode={`import { Switch } from "@/components/ui/switch"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Default (Off)" description="Unchecked state — the track shows border color, indicating the setting is off." code={`<div className="flex items-center gap-xs">\n  <Switch id="s1" />\n  <Label htmlFor="s1">Airplane Mode</Label>\n</div>`}>
            <div className="flex items-center gap-xs"><Switch id="sw-default" /><Label htmlFor="sw-default">Airplane Mode</Label></div>
          </Example>
          <Example title="Checked (On)" description="Checked state — the track fills with primary color, thumb slides to the right." code={`<div className="flex items-center gap-xs">\n  <Switch checked id="s2" />\n  <Label htmlFor="s2">Notifications enabled</Label>\n</div>`}>
            <div className="flex items-center gap-xs"><Switch checked id="sw-checked" /><Label htmlFor="sw-checked">Notifications enabled</Label></div>
          </Example>
          <Example title="Interactive" description="Controlled switch with useState — label reflects the current on/off value." code={`const [on, setOn] = useState(false)\n<Switch checked={on} onCheckedChange={setOn} />`}>
            <div className="flex items-center gap-xs">
              <Switch checked={isOn} onCheckedChange={(v) => setValue(v ? "on" : "off")} id="sw-interactive" />
              <Label htmlFor="sw-interactive">{isOn ? "On" : "Off"}</Label>
            </div>
          </Example>
          <Example title="Settings Panel" description="Multiple switches in a settings list — each row uses justify-between to push the toggle to the right." code={`<div className="space-y-md w-full max-w-xs">\n  <div className="flex items-center justify-between"><Label>Notifications</Label><Switch /></div>\n  <Separator />\n  <div className="flex items-center justify-between"><Label>Dark Mode</Label><Switch defaultChecked /></div>\n</div>`}>
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
          ["defaultChecked", "boolean", "false", "Uncontrolled initial state"],
          ["onCheckedChange", "(checked: boolean) => void", "—", "Callback when toggled"],
          ["disabled", "boolean", "false", "Disable the switch"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--primary","violet-600","On state track background"],
        ["--border","zinc-200","Off state track background"],
        ["--background","white","Thumb color"],
        ["--ring","violet-600/30","Focus ring"],
      ]} />

      <BestPractices items={[
        {
          title: "Use for immediate-effect settings",
          do: "Use Switch for settings that apply instantly — dark mode, notifications, feature flags.",
          dont: "Use Switch for choices requiring an explicit save or form submit — use Checkbox instead.",
        },
        {
          title: "Always pair with a Label",
          do: "Pair Switch with a Label on the same row using justify-between for clear visual association.",
          dont: "Use Switch without a label or with only an icon — the on/off state won't be clear to all users.",
        },
        {
          title: "Keep labels concise",
          do: "Write the label to describe the setting in its active state — e.g. 'Receive notifications'.",
          dont: "Repeat On/Off in the label — the switch thumb position already communicates the current state.",
        },
      ]} />

      <FigmaMapping rows={[
        ["State","Off","checked","false"],
        ["State","On","checked","true"],
        ["State","Hover","className","opacity-90"],
        ["State","Focus","className","ring-[3px] ring-ring"],
        ["State","Disabled","disabled","true"],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Tab","Move focus to the switch"],
          ["Space","Toggle on / off"],
        ]}
        notes={[
          "Uses role='switch' with aria-checked — screen readers announce 'on' or 'off'",
          "Always provide a visible label or aria-label to describe what the switch controls",
          "Consider adding aria-describedby for switches with non-obvious effects",
        ]}
      />

      <RelatedComponents items={[
        {
          name: "Checkbox",
          desc: "Checkbox is for selections that are submitted as part of a form — the change has no immediate effect. Use Switch when toggling applies instantly without a submit button.",
        },
        {
          name: "Toggle",
          desc: "Toggle is a button-style on/off control designed for toolbar and formatting contexts. Use Switch for application settings in lists or settings panels.",
        },
      ]} />
    </div>
  )
}

function ToggleDocs() {
  const [v, setV] = useState("default")
  const [sz, setSz] = useState("default")
  const [state, setState] = useState("default")
  const isPressed = state === "pressed"
  const isDisabled = state === "disabled"
  const isHover = state === "hover"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Toggle</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A two-state button that switches between pressed and unpressed — ideal for formatting controls, view options, and toolbar actions. Unlike Switch, Toggle lives in toolbars and responds to the same interaction patterns as a button.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Variant", type: "select", options: ["default","outline"], value: v, onChange: setV },
        { label: "Size", type: "select", options: ["sm","default","lg"], value: sz, onChange: setSz },
        { label: "State", type: "select", options: ["default","hover","pressed","focus","disabled"], value: state, onChange: setState },
      ]}>
        <Toggle
          variant={v as any}
          size={sz as any}
          pressed={isPressed}
          disabled={isDisabled}
          className={cn(
            isHover && "bg-muted text-foreground",
            isFocus && "ring-[3px] ring-ring outline-none",
          )}
        >
          <Bold className="size-4" />
        </Toggle>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-toggle"]} importCode={`import { Toggle, ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Default (Unpressed)" description="Unpressed toggle in default variant — transparent background with muted text until activated." code={`<Toggle><Bold className="size-4" /></Toggle>`}>
            <div className="flex items-center gap-xs">
              <Toggle><Bold className="size-4" /></Toggle>
              <Toggle><Italic className="size-4" /></Toggle>
              <Toggle><Underline className="size-4" /></Toggle>
            </div>
          </Example>
          <Example title="Pressed" description="Pressed state fills the background with the muted color and brings text to full foreground opacity." code={`<Toggle pressed><Bold className="size-4" /></Toggle>`}>
            <div className="flex items-center gap-xs">
              <Toggle pressed><Bold className="size-4" /></Toggle>
              <Toggle><Italic className="size-4" /></Toggle>
              <Toggle pressed><Underline className="size-4" /></Toggle>
            </div>
          </Example>
          <Example title="Outline Variant" description="A bordered variant that makes the toggle boundary visible at all times, regardless of pressed state." code={`<Toggle variant="outline"><Bold className="size-4" /></Toggle>`}>
            <div className="flex items-center gap-xs">
              <Toggle variant="outline"><Bold className="size-4" /></Toggle>
              <Toggle variant="outline" pressed><Italic className="size-4" /></Toggle>
              <Toggle variant="outline"><Underline className="size-4" /></Toggle>
            </div>
          </Example>
          <Example title="Sizes" description="Three size options — sm (32px), default (36px), and lg (40px) — match the density of surrounding UI." code={`<Toggle size="sm"><Bold /></Toggle>\n<Toggle><Bold /></Toggle>\n<Toggle size="lg"><Bold /></Toggle>`}>
            <div className="flex items-center gap-xs">
              <Toggle size="sm"><Bold className="size-4" /></Toggle>
              <Toggle><Bold className="size-4" /></Toggle>
              <Toggle size="lg"><Bold className="size-5" /></Toggle>
            </div>
          </Example>
          <Example title="With Text" description="Icon combined with a text label — useful when the action needs verbal reinforcement alongside the icon." code={`<Toggle><Bold className="size-4" /> Bold</Toggle>`}>
            <div className="flex items-center gap-xs">
              <Toggle><Bold className="size-4" /> Bold</Toggle>
              <Toggle pressed><Italic className="size-4" /> Italic</Toggle>
            </div>
          </Example>
          <Example title="Toggle Group — Single" description="Only one item can be active at a time — use for mutually exclusive options like text alignment." code={`<ToggleGroup type="single">\n  <ToggleGroupItem value="bold"><Bold /></ToggleGroupItem>\n  <ToggleGroupItem value="italic"><Italic /></ToggleGroupItem>\n</ToggleGroup>`}>
            <ToggleGroup type="single">
              <ToggleGroupItem value="bold"><Bold className="size-4" /></ToggleGroupItem>
              <ToggleGroupItem value="italic"><Italic className="size-4" /></ToggleGroupItem>
              <ToggleGroupItem value="underline"><Underline className="size-4" /></ToggleGroupItem>
            </ToggleGroup>
          </Example>
          <Example title="Toggle Group — Multiple" description="Any combination of items can be active simultaneously — use for independent formatting options like bold + italic." code={`<ToggleGroup type="multiple" defaultValue={["bold"]}>\n  <ToggleGroupItem value="bold"><Bold /></ToggleGroupItem>\n</ToggleGroup>`}>
            <ToggleGroup type="multiple" defaultValue={["bold"]}>
              <ToggleGroupItem value="bold"><Bold className="size-4" /></ToggleGroupItem>
              <ToggleGroupItem value="italic"><Italic className="size-4" /></ToggleGroupItem>
              <ToggleGroupItem value="underline"><Underline className="size-4" /></ToggleGroupItem>
            </ToggleGroup>
          </Example>
          <Example title="Toggle Group — Outline" description="Outline variant on a group gives a segmented button appearance — well suited for alignment or view-mode selectors." code={`<ToggleGroup type="single" variant="outline">...</ToggleGroup>`}>
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

      <DesignTokensTable rows={[
        ["--muted", "zinc-100", "Pressed and hover background"],
        ["--muted-foreground", "zinc-500", "Unpressed icon/text color"],
        ["--foreground", "zinc-900", "Pressed/hover icon/text color"],
        ["--border", "zinc-200", "Outline variant border"],
        ["--ring", "violet-600/30", "Focus ring color"],
      ]} />
      <BestPractices items={[
        { title: "Binary view options", do: "Use Toggle for binary view options like grid/list, bold/italic, or active filters that take effect immediately.", dont: "Use Toggle for navigation or primary one-shot actions — use Button or Tabs instead." },
        { title: "Icon-only accessibility", do: "Include aria-label on icon-only toggles so screen readers can announce the action clearly.", dont: "Rely on visual context alone — the toggle's purpose must be programmatically determinable." },
        { title: "Instant vs deferred", do: "Use Toggle when the state change takes effect immediately without a form submit.", dont: "Use Toggle for deferred form selections — use Checkbox for values that are submitted with a form." },
      ]} />
      <FigmaMapping rows={[
        ["Variant", "Default", "variant", '"default"'],
        ["Variant", "Outline", "variant", '"outline"'],
        ["Size", "Large", "size", '"lg"'],
        ["Size", "Default", "size", '"default"'],
        ["Size", "Small", "size", '"sm"'],
        ["Value", "Unpressed", "pressed", "false (default)"],
        ["Value", "Pressed", "pressed", "true"],
        ["State", "Disabled", "disabled", "true"],
      ]} />
      <AccessibilityInfo keyboard={[["Tab","Focus the toggle"],["Enter / Space","Toggle pressed state"],["Arrow Left / Right","Navigate between items in ToggleGroup"]]} notes={["Uses aria-pressed to communicate toggle state to screen readers","Icon-only toggles must have aria-label — without it the action is invisible to assistive tech","ToggleGroup with type='single' behaves like a radio group; type='multiple' behaves like a checkbox group"]} />
      <RelatedComponents items={[
        { name: "Button", desc: "Use Button for one-time actions that trigger a single event without persisting state. Toggle is for actions that remain active until explicitly deactivated." },
        { name: "Switch", desc: "Switch is for on/off settings in a settings panel context, communicating an instant mode change. Toggle is for formatting-style controls typically embedded in toolbars." },
        { name: "Checkbox", desc: "Checkbox is for deferred selections submitted as part of a form — the state does not take effect until form submit. Toggle reflects an immediate, persistent action with no submit step." },
      ]} />
    </div>
  )
}

function AlertDocs() {
  const [v, setV] = useState("default")
  const [showIcon, setShowIcon] = useState(true)
  const [showTitle, setShowTitle] = useState(true)
  const [showDescription, setShowDescription] = useState(true)
  const [inCard, setInCard] = useState(false)
  const handleShowTitle = (val: boolean) => {
    if (!val && !showDescription) setShowDescription(true)
    setShowTitle(val)
  }
  const handleShowDescription = (val: boolean) => {
    if (!val && !showTitle) setShowTitle(true)
    setShowDescription(val)
  }
  const icon = v === "destructive" ? <AlertCircle className="size-4" />
    : v === "success" ? <CheckCircle2 className="size-4" />
    : v === "warning" ? <AlertTriangle className="size-4" />
    : <Info className="size-4" />
  const alertEl = (
    <Alert variant={v as any} inCard={inCard} className="w-full">
      {showIcon && icon}
      {showTitle && <AlertTitle>Alert Title</AlertTitle>}
      {showDescription && <AlertDescription>This is a {v} alert — surfaces context without blocking the user.</AlertDescription>}
    </Alert>
  )
  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Feedback</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Alert</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          Inline feedback message for neutral, error, success, warning, and emphasis states — surfaces important context without blocking the user. Non-interactive and static; use AlertDialog for confirmations that require a response.
        </p>
      </header>

      {/* 2. ExploreBehavior */}
      <ExploreBehavior controls={[
        { label: "Variant", type: "select", options: ["default", "destructive", "success", "warning", "emphasis"], value: v, onChange: setV },
        { label: "Show Icon", type: "toggle", value: showIcon, onChange: setShowIcon },
        { label: "Show Title", type: "toggle", value: showTitle, onChange: handleShowTitle },
        { label: "Show Description", type: "toggle", value: showDescription, onChange: handleShowDescription },
        { label: "In Card", type: "toggle", value: inCard, onChange: setInCard },
      ]}>
        {inCard ? (
          <Card size="md" className="w-full max-w-md">{alertEl}</Card>
        ) : (
          <div className="w-full max-w-md">{alertEl}</div>
        )}
      </ExploreBehavior>

      {/* 3. Installation */}
      <InstallationSection
        pkg={[]}
        importCode={`import {\n  Alert,\n  AlertTitle,\n  AlertDescription,\n} from "@/components/ui/alert"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example
            title="All Variants"
            description="Five semantic variants covering neutral, error, success, warning, and emphasis. Always match the variant to message severity."
            code={`<Alert>\n  <Info className="size-4" />\n  <AlertTitle>Heads up</AlertTitle>\n  <AlertDescription>Neutral message.</AlertDescription>\n</Alert>\n<Alert variant="destructive">\n  <AlertCircle className="size-4" />\n  <AlertTitle>Error</AlertTitle>\n  <AlertDescription>Session expired.</AlertDescription>\n</Alert>\n{/* success, warning, emphasis same pattern */}`}
          >
            <div className="w-full space-y-sm">
              <Alert>
                <Info className="size-4" />
                <AlertTitle>Heads up</AlertTitle>
                <AlertDescription>Your settings will be applied on next login.</AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
              </Alert>
              <Alert variant="success">
                <CheckCircle2 className="size-4" />
                <AlertTitle>Saved</AlertTitle>
                <AlertDescription>Your changes have been saved successfully.</AlertDescription>
              </Alert>
              <Alert variant="warning">
                <AlertTriangle className="size-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>Your free trial expires in 3 days.</AlertDescription>
              </Alert>
              <Alert variant="emphasis">
                <Info className="size-4" />
                <AlertTitle>New feature</AlertTitle>
                <AlertDescription>Analytics dashboard is now available.</AlertDescription>
              </Alert>
            </div>
          </Example>

          <Example
            title="Without Icon"
            description="Title and description only — use when icon adds no meaningful context or in dense layouts where space is constrained."
            code={`<Alert>\n  <AlertTitle>Heads up!</AlertTitle>\n  <AlertDescription>\n    You can add components using the CLI.\n  </AlertDescription>\n</Alert>`}
          >
            <Alert className="w-full">
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>You can add components and dependencies to your app using the CLI.</AlertDescription>
            </Alert>
          </Example>

          <Example
            title="Description Only"
            description="Skip AlertTitle for short, self-explanatory messages. Useful for compact inline banners where a title would be redundant."
            code={`<Alert variant="warning">\n  <AlertTriangle className="size-4" />\n  <AlertDescription>\n    Your free trial expires in 3 days. Upgrade to keep access.\n  </AlertDescription>\n</Alert>`}
          >
            <Alert variant="warning" className="w-full">
              <AlertTriangle className="size-4" />
              <AlertDescription>Your free trial expires in 3 days. Upgrade to keep access.</AlertDescription>
            </Alert>
          </Example>

          <Example
            title="In Card"
            description="Use inCard={true} when Alert sits inside a Card — removes the border, tightens padding, and switches the neutral variant to card-subtle background."
            code={`<Card size="md">\n  <Alert variant="warning" inCard>\n    <AlertTriangle className="size-4" />\n    <AlertTitle>Storage limit</AlertTitle>\n    <AlertDescription>\n      You have used 90% of your storage quota.\n    </AlertDescription>\n  </Alert>\n</Card>`}
          >
            <Card size="md" className="w-full">
              <Alert variant="warning" inCard>
                <AlertTriangle className="size-4" />
                <AlertTitle>Storage limit</AlertTitle>
                <AlertDescription>You have used 90% of your storage quota. Upgrade to add more.</AlertDescription>
              </Alert>
            </Card>
          </Example>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground font-body">
          Native <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">div</code> — no Radix dependency. Custom props extend the base HTML element.
        </p>
        <h3 className="font-semibold text-sm">Alert</h3>
        <PropsTable rows={[
          ["variant", '"default" | "destructive" | "success" | "warning" | "emphasis"', '"default"', "Semantic color variant — match to message severity"],
          ["inCard", "boolean", "false", "Removes border, tightens padding, switches neutral to card-subtle background"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AlertTitle</h3>
        <PropsTable rows={[
          ["children", "ReactNode", "—", "Title text"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AlertDescription</h3>
        <PropsTable rows={[
          ["children", "ReactNode", "—", "Body text or inline elements"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--color-card", "white / zinc-900", "Default (neutral) background (bg-card)"],
        ["--color-card-subtle", "zinc-50 / zinc-950", "Neutral inCard background (bg-card-subtle)"],
        ["--color-border", "zinc-200 / zinc-800", "Default border color (border-border)"],
        ["--destructive-subtle", "red-50 / red-950/20", "Destructive background"],
        ["--destructive-border", "red-200 / red-800", "Destructive border"],
        ["--success-subtle", "green-50 / green-950/20", "Success background"],
        ["--success-border", "green-200 / green-800", "Success border"],
        ["--warning-subtle", "amber-50 / amber-950/20", "Warning background"],
        ["--warning-border", "amber-200 / amber-800", "Warning border"],
        ["--emphasis-subtle", "violet-50 / violet-950/20", "Emphasis background"],
        ["--emphasis-border", "violet-200 / violet-800", "Emphasis border"],
        ["--spacing-sm", "12px", "Vertical padding (py-sm); inCard uses py-xs (8px)"],
        ["--spacing-md", "16px", "Horizontal padding (px-md); icon left offset (left-md)"],
        ["--radius-lg", "8px", "Border radius (rounded-lg)"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          title: "Variant",
          do: "Match the variant to message severity: destructive for errors, warning for cautions, success for confirmations, emphasis for highlights, default for neutral info.",
          dont: "Use the default variant for urgent messages — users learn color semantics and will miss critical alerts styled as neutral.",
        },
        {
          title: "Icon",
          do: "Include the matching semantic icon (AlertCircle for destructive, CheckCircle2 for success, AlertTriangle for warning, Info for default/emphasis).",
          dont: "Mix icons across variants — a warning icon on an emphasis alert breaks the learned visual language.",
        },
        {
          title: "In Card",
          do: "Use inCard={true} when Alert sits inside a Card — it removes the outer border and tightens padding to match the card's internal spacing.",
          dont: "Apply custom padding or border overrides via className to compensate for card context — inCard handles this correctly.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["Type: Neutral", "bg-card, border-border", "variant", '"default"'],
        ["Type: Error", "bg-destructive-subtle, border-destructive-border", "variant", '"destructive"'],
        ["Type: Success", "bg-success-subtle, border-success-border", "variant", '"success"'],
        ["Type: Warning", "bg-warning-subtle, border-warning-border", "variant", '"warning"'],
        ["Type: Emphasis", "bg-emphasis-subtle, border-emphasis-border", "variant", '"emphasis"'],
        ["In Card: True", "border-transparent, py-xs px-sm", "inCard", "true"],
        ["Show Icon", "svg absolute left-md top-[14px] size-md", "children (SVG)", '<AlertCircle className="size-4" />'],
        ["Show Title", "typo-paragraph-sm-bold", "children", "<AlertTitle>"],
        ["Show Subtitle", "typo-paragraph-sm text-ghost-foreground", "children", "<AlertDescription>"],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[["—", "Alert is static — not keyboard interactive"]]}
        notes={[
          'Uses role="alert" — screen readers announce content immediately on mount',
          "Destructive alerts should include an action link or next-step guidance in AlertDescription",
          "Do not put interactive elements (buttons, links) directly inside Alert — use AlertDialog or a Banner pattern instead",
          'When dynamically injecting alerts, ensure the element is in the DOM with role="alert" before updating content to guarantee announcement',
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "AlertDialog", desc: "Blocking modal confirmation for irreversible actions. Use when the user must explicitly confirm before proceeding." },
        { name: "Badge", desc: "Inline status indicator. Use Badge for short labels in tables or lists, Alert for paragraph-length feedback." },
        { name: "Sonner", desc: "Auto-dismissing toast notification. Use Sonner for transient feedback after actions, Alert for persistent inline messages." },
      ]} />
    </div>
  )
}

function SelectDocs() {
  const [state, setState] = useState("default")
  const [valMode, setValMode] = useState("placeholder")
  const [selectVal, setSelectVal] = useState<string | undefined>(undefined)
  const handleValMode = (mode: string) => {
    setValMode(mode)
    setSelectVal(mode === "filled" ? "a" : undefined)
  }
  const isDisabled = state === "disabled"
  const isFocus = state === "focus"
  const isHover = state === "hover"
  const isError = state === "error"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Select</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A dropdown for choosing one option from a predefined list. Use instead of Input when the valid values are fixed and known in advance.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "State", type: "select", options: ["default","hover","focus","error","disabled"], value: state, onChange: setState },
        { label: "Value", type: "select", options: ["placeholder","filled"], value: valMode, onChange: handleValMode },
      ]}>
        <Select disabled={isDisabled} value={selectVal} onValueChange={setSelectVal}>
          <SelectTrigger aria-invalid={isError || undefined} className={cn("w-[200px]", isHover && "border-border-strong", isFocus && "ring-[3px] ring-ring")}>
            <SelectValue placeholder="Select option" />
          </SelectTrigger>
          <SelectContent><SelectItem value="a">Option A</SelectItem><SelectItem value="b">Option B</SelectItem></SelectContent>
        </Select>
      </ExploreBehavior>
      <InstallationSection pkg={["@radix-ui/react-select"]} importCode={`import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/ui/select"`} />
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" description="Basic select with placeholder and a list of options." code={`<Select>\n  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>\n  <SelectContent>\n    <SelectItem value="1">Option 1</SelectItem>\n  </SelectContent>\n</Select>`}>
          <Select>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select a fruit" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
            </SelectContent>
          </Select>
        </Example>
<Example title="With Label" description="Always pair with a visible Label for accessibility." code={`<Label>Country</Label>\n<Select>...</Select>`}>
          <div className="space-y-3xs w-[200px]">
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
        <Example title="With Groups" description="Use SelectGroup and SelectLabel to organize long option lists." code={`<SelectContent>\n  <SelectGroup>\n    <SelectLabel>Fruits</SelectLabel>\n    <SelectItem value="apple">Apple</SelectItem>\n  </SelectGroup>\n</SelectContent>`}>
          <Select>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select food" /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Fruits</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Vegetables</SelectLabel>
                <SelectItem value="carrot">Carrot</SelectItem>
                <SelectItem value="broccoli">Broccoli</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </Example>
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">SelectTrigger</h3>
        <PropsTable rows={[
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
      <DesignTokensTable rows={[["--input","transparent","Trigger background"],["--border","zinc-200","Trigger border"],["--border-strong","zinc-400","Hover border"],["--popover","white","Dropdown background"],["--accent","zinc-100","Hover item background"],["--ring","violet-600/30","Focus ring"],["--muted-foreground","zinc-500","Placeholder"]]} />
      <BestPractices items={[
        {title:"Placeholder",do:"Use a descriptive placeholder to hint at the expected selection (e.g. 'Select country').",dont:"Leave the trigger blank — users won't know what the field is for."},
        {title:"List length",do:"Group related items with SelectGroup and SelectLabel when the list exceeds 8 items.",dont:"Put more than 15 items in a flat list without grouping — use Combobox with search instead."},
      ]} />
      <FigmaMapping rows={[["State","Hover","className","border-border-strong"],["State","Focus","className","ring-[3px] ring-ring"],["State","Disabled","disabled","true"],["State","Error","aria-invalid","true"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus the trigger"],["Enter / Space","Open the dropdown"],["Arrow Up / Down","Navigate options"],["Enter","Select highlighted option"],["Escape","Close the dropdown"]]} notes={["Built on Radix Select with full WAI-ARIA compliance","Always pair with <Label> using htmlFor for accessibility","Placeholder text is announced as the current value when nothing is selected"]} />
      <RelatedComponents items={[
        {name:"Combobox",desc:"Select with built-in search filtering. Use Combobox when the list is long or users may type their own value."},
        {name:"Radio",desc:"Visible radio buttons for small option sets. Use Radio when all options should be visible without opening a dropdown."},
      ]} />
    </div>
  )
}

function ProgressDocs() {
  const [value, setValue] = useState(45)
  const [showLabel, setShowLabel] = useState(true)
  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Feedback</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Progress</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          Determinate progress bar that shows completion percentage for uploads, form steps, or any quantifiable operation. Built on Radix Progress; always pair with a visible label or <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">aria-label</code> — the bar alone does not communicate context to screen readers.
        </p>
      </header>

      {/* 2. ExploreBehavior */}
      <ExploreBehavior controls={[
        { label: "Value", type: "select", options: ["0", "25", "50", "75", "100"], value: String(value), onChange: (v: string) => setValue(Number(v)) },
        { label: "Show Label", type: "toggle", value: showLabel, onChange: setShowLabel },
      ]}>
        <div className="w-full max-w-sm space-y-xs">
          {showLabel && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground font-medium">Progress</span>
              <span className="text-muted-foreground">{value}%</span>
            </div>
          )}
          <Progress value={value} aria-label="Progress" />
        </div>
      </ExploreBehavior>

      {/* 3. Installation */}
      <InstallationSection
        pkg={["@radix-ui/react-progress"]}
        importCode={`import { Progress } from "@/components/ui/progress"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example
            title="With Label"
            description="Always pair the bar with a text label and percentage. Use justify-between to place context left and value right."
            code={`<div className="space-y-xs">\n  <div className="flex justify-between text-sm">\n    <span>Uploading…</span>\n    <span className="text-muted-foreground">73%</span>\n  </div>\n  <Progress value={73} aria-label="Upload progress" />\n</div>`}
          >
            <div className="w-full max-w-sm space-y-xs">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Uploading report.pdf</span>
                <span className="text-muted-foreground">73%</span>
              </div>
              <Progress value={73} aria-label="Upload progress" />
            </div>
          </Example>

          <Example
            title="Storage Usage"
            description="Use in settings or account panels to visualize quota consumption. Add a sub-label beneath for used / total detail."
            code={`<div className="space-y-xs">\n  <div className="flex justify-between text-sm">\n    <span>Storage</span>\n    <span className="text-muted-foreground">18 GB of 20 GB</span>\n  </div>\n  <Progress value={90} aria-label="Storage usage" />\n  <p className="text-xs text-muted-foreground">2 GB remaining</p>\n</div>`}
          >
            <div className="w-full max-w-sm space-y-xs">
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">Storage</span>
                <span className="text-muted-foreground">18 GB of 20 GB</span>
              </div>
              <Progress value={90} aria-label="Storage usage" />
              <p className="text-xs text-muted-foreground">2 GB remaining — upgrade to add more</p>
            </div>
          </Example>

          <Example
            title="Onboarding Steps"
            description="Show step-based progress for multi-step flows. Compute value as (currentStep / totalSteps) × 100."
            code={`<div className="space-y-xs">\n  <div className="flex justify-between text-sm">\n    <span>Step 2 of 4</span>\n    <span className="text-muted-foreground">50%</span>\n  </div>\n  <Progress value={50} aria-label="Onboarding step 2 of 4" />\n</div>`}
          >
            <div className="w-full max-w-sm space-y-xs">
              <div className="flex justify-between text-sm">
                <span className="text-foreground font-medium">Step 2 of 4 — Profile setup</span>
                <span className="text-muted-foreground">50%</span>
              </div>
              <Progress value={50} aria-label="Onboarding step 2 of 4" />
            </div>
          </Example>

          <Example
            title="Stacked — Multiple Bars"
            description="Multiple labeled bars for comparing parallel operations. Keep each bar in its own row with a clear label."
            code={`<div className="space-y-md">\n  {items.map(item => (\n    <div key={item.label} className="space-y-xs">\n      <div className="flex justify-between text-sm">\n        <span>{item.label}</span>\n        <span className="text-muted-foreground">{item.value}%</span>\n      </div>\n      <Progress value={item.value} />\n    </div>\n  ))}\n</div>`}
          >
            <div className="w-full max-w-sm space-y-md">
              {[
                { label: "Design", value: 100 },
                { label: "Development", value: 68 },
                { label: "QA Testing", value: 32 },
              ].map(item => (
                <div key={item.label} className="space-y-xs">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{item.label}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <Progress value={item.value} aria-label={`${item.label} progress`} />
                </div>
              ))}
            </div>
          </Example>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground font-body">
          Built on <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">@radix-ui/react-progress</code>. Supports all Radix Progress props in addition to the following:
        </p>
        <PropsTable rows={[
          ["value", "number | null", "0", "Completion percentage 0–100. Pass null for indeterminate state"],
          ["max", "number", "100", "Maximum value — change when working with non-percentage units"],
          ["aria-label", "string", "—", "Screen reader label describing what is progressing (required when no visible label)"],
          ["className", "string", '""', "Additional CSS classes — use h-* to change track height"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--color-primary", "violet-600", "Indicator fill (bg-primary)"],
        ["--color-muted", "zinc-100 / zinc-800", "Track background (bg-muted)"],
        ["--radius-full", "9999px", "Track and indicator border radius (rounded-full)"],
        ["--transition-all", "150ms ease", "Indicator transition animation (transition-all)"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          title: "Label",
          do: "Always pair the bar with a visible text label and a percentage — place context left, value right using justify-between.",
          dont: "Use the bar alone without any label — users cannot tell what is progressing or how much remains.",
        },
        {
          title: "Accessibility",
          do: 'Add aria-label="[context] progress" on Progress when no visible label is present — Radix sets aria-valuenow automatically.',
          dont: "Omit aria-label on standalone bars — screen readers will announce the percentage but not the subject.",
        },
        {
          title: "Value updates",
          do: "Update value incrementally — the CSS transition-all gives smooth motion between steps automatically.",
          dont: "Jump value from 0 to 100 instantly — skips the transition and gives no perceived progress feedback.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["Track", "h-1.5 (6px), bg-muted, rounded-full", "Progress root", "className"],
        ["Indicator", "bg-primary, h-full, translateX offset", "value", "0–100"],
        ["Value: 0%", "indicator fully left (translateX -100%)", "value", "0"],
        ["Value: 50%", "indicator half width (translateX -50%)", "value", "50"],
        ["Value: 100%", "indicator full width (translateX 0%)", "value", "100"],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[["—", "Progress is static — not keyboard interactive"]]}
        notes={[
          'Radix sets role="progressbar", aria-valuenow, aria-valuemin (0), and aria-valuemax (100) automatically',
          'Pass aria-label="Upload progress" or associate with a visible label using aria-labelledby',
          "Value null renders an indeterminate bar — announce state changes with aria-live on the surrounding container",
          "Color alone does not convey meaning — always include a text percentage for users with color vision deficiencies",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Spinner", desc: "Indeterminate loading indicator. Use Spinner when duration is unknown; Progress when a percentage can be measured." },
        { name: "Skeleton", desc: "Content placeholder for loading states. Use Skeleton when the layout is known; Progress when a quantity is trackable." },
        { name: "Slider", desc: "Interactive range input that shares the same visual track. Use Slider for user input, Progress for read-only display." },
      ]} />
    </div>
  )
}

function AvatarDocs() {
  const [avSize, setAvSize] = useState("default")
  const [avType, setAvType] = useState("image")
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Data Display</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Avatar</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A circular image element for representing users, with automatic fallback to initials or an icon when the image fails to load. Built on @radix-ui/react-avatar — provides graceful image loading with a configurable fallback delay to prevent flash.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Size", type: "select", options: ["sm","default","lg"], value: avSize, onChange: setAvSize },
        { label: "Type", type: "select", options: ["image","text"], value: avType, onChange: setAvType },
      ]}>
        <Avatar key={avType} className={cn(avSize === "sm" && "size-8", avSize === "lg" && "size-14")}>
          {avType === "image" && <AvatarImage src="https://github.com/shadcn.png" alt="User" />}
          <AvatarFallback delayMs={0}>CN</AvatarFallback>
        </Avatar>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-avatar"]} importCode={`import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="With Image" description="Provide both AvatarImage and AvatarFallback — the fallback renders automatically if the image fails or is slow to load." code={`<Avatar>\n  <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />\n  <AvatarFallback>CN</AvatarFallback>\n</Avatar>`}>
          <Avatar><AvatarImage src="https://github.com/shadcn.png" alt="shadcn" /><AvatarFallback>CN</AvatarFallback></Avatar>
        </Example>
        <Example title="Fallback Initials" description="When no image is available, AvatarFallback displays initials. Use 1–2 uppercase characters." code={`<Avatar><AvatarFallback>JD</AvatarFallback></Avatar>`}>
          <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>TN</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>MR</AvatarFallback></Avatar>
        </Example>
        <Example title="Sizes" description="No built-in size prop — control diameter via className. Common sizes: size-8 (32px), size-10 (40px, default), size-14 (56px)." code={`<Avatar className="size-8"><AvatarFallback>SM</AvatarFallback></Avatar>\n<Avatar><AvatarFallback>MD</AvatarFallback></Avatar>\n<Avatar className="size-14"><AvatarFallback>LG</AvatarFallback></Avatar>`}>
          <Avatar className="size-8"><AvatarFallback>SM</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>MD</AvatarFallback></Avatar>
          <Avatar className="size-14"><AvatarFallback>LG</AvatarFallback></Avatar>
        </Example>
        <Example title="With Status Dot" description="Overlay a BadgeDot on a relative wrapper to indicate user presence — online, away, or offline." code={`<div className="relative inline-flex">\n  <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>\n  <BadgeDot variant="success" className="absolute bottom-0 right-0 ring-2 ring-background" />\n</div>`}>
          <div className="flex items-center gap-md">
            <div className="relative inline-flex">
              <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
              <BadgeDot variant="success" className="absolute bottom-0 right-0 ring-2 ring-background" />
            </div>
            <div className="relative inline-flex">
              <Avatar><AvatarFallback>AB</AvatarFallback></Avatar>
              <BadgeDot variant="warning" className="absolute bottom-0 right-0 ring-2 ring-background" />
            </div>
            <div className="relative inline-flex">
              <Avatar><AvatarFallback>TN</AvatarFallback></Avatar>
              <BadgeDot variant="destructive" className="absolute bottom-0 right-0 ring-2 ring-background" />
            </div>
          </div>
        </Example>
        <Example title="Avatar Group" description="Use negative margin (-space-x-2) and a ring border to stack avatars for team or participant displays." code={`<div className="flex -space-x-2">\n  <Avatar className="border-2 border-background">...</Avatar>\n  <Avatar className="border-2 border-background">...</Avatar>\n</div>`}>
          <div className="flex -space-x-2">
            <Avatar className="border-2 border-background"><AvatarFallback>JD</AvatarFallback></Avatar>
            <Avatar className="border-2 border-background"><AvatarFallback>AB</AvatarFallback></Avatar>
            <Avatar className="border-2 border-background"><AvatarFallback>TN</AvatarFallback></Avatar>
            <Avatar className="border-2 border-background"><AvatarFallback>MR</AvatarFallback></Avatar>
            <Avatar className="border-2 border-background"><AvatarFallback>+5</AvatarFallback></Avatar>
          </div>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground">Built on <code>@radix-ui/react-avatar</code>. All unrecognized props are forwarded to the underlying Radix primitives.</p>
        <h3 className="font-semibold text-sm mt-md">Avatar</h3>
        <PropsTable rows={[
          ["className", "string", '—', "Override or extend styles — use Tailwind size-* to control diameter (default is size-10 = 40px)"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AvatarImage</h3>
        <PropsTable rows={[
          ["src", "string", "—", "Image source URL"],
          ["alt", "string", "—", "Descriptive alt text for screen readers — required for accessibility"],
          ["onLoadingStatusChange", '(status: "idle" | "loading" | "loaded" | "error") => void', "—", "Fires when image load status changes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AvatarFallback</h3>
        <PropsTable rows={[
          ["children", "ReactNode", "—", "Fallback content — initials (1–2 chars) or an icon"],
          ["delayMs", "number", "600", "Milliseconds to wait before showing fallback, preventing flash on fast networks"],
          ["className", "string", "—", "Additional CSS classes"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--muted","zinc-100","AvatarFallback background"],
        ["--muted-foreground","zinc-500","AvatarFallback initials text color"],
        ["--border","zinc-200","Default 1px circle border on Avatar root"],
        ["--background","white / zinc-950","Ring color used in Avatar Group (border-background)"],
      ]} />
      <BestPractices items={[
        {do:"Always provide AvatarFallback alongside AvatarImage — broken images leave empty circles without it.",dont:"Omit AvatarFallback when using AvatarImage, even if the image URL is reliable."},
        {do:"Use 1–2 uppercase initials in AvatarFallback that meaningfully represent the user.",dont:"Use a full name or long string in AvatarFallback — it overflows the circle."},
        {do:"Set delayMs={0} on AvatarFallback when you know the image will not load (e.g., no src provided).",dont:"Leave the default 600ms delay when intentionally showing fallback — it causes a visible flash."},
      ]} />
      <FigmaMapping rows={[
        ["Size","Small (32px)","className",'"size-8"'],
        ["Size","Default (40px)","className",'"size-10" (default)'],
        ["Size","Large (56px)","className",'"size-14"'],
        ["Content","Image","AvatarImage","src + alt props"],
        ["Content","Initials","AvatarFallback","children (1–2 chars)"],
        ["State","With status","BadgeDot","absolute overlay on relative wrapper"],
      ]} />
      <AccessibilityInfo
        keyboard={[["—","Avatar is non-interactive and not keyboard-focusable — wrap in a button if a click action is needed"]]}
        notes={[
          "AvatarImage requires a descriptive alt attribute — the fallback initials are not automatically surfaced to screen readers when the image loads successfully.",
          "When AvatarFallback is the only content (no image), it is visible text and does not need extra aria attributes.",
          "For Avatar Group with a +N overflow item, add aria-label to that avatar (e.g., aria-label=\"5 more members\") so screen readers can announce the count.",
          "If the avatar is wrapped in an interactive element (link, button), put accessible name on the wrapper, not on the Avatar itself.",
        ]}
      />
      <RelatedComponents items={[
        {name:"BadgeDot",desc:"Overlay a status dot on Avatar to indicate user presence (online/away/offline)."},
        {name:"HoverCard",desc:"Trigger a rich user profile card when hovering over an Avatar."},
        {name:"Badge",desc:"Pair with Avatar in list rows to display user role or plan tier."},
      ]} />
    </div>
  )
}

function SpinnerDocs() {
  const [sz, setSz] = useState("default")
  const [color, setColor] = useState("default")
  const colorClass = color === "default" ? "" : `text-${color}`
  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Feedback</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Spinner</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          Animated SVG indicator for indeterminate loading states — use when an operation is in progress but its duration is unknown. Spinner itself is decorative; always wrap with <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">role="status"</code> and <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">aria-label</code> on the parent container.
        </p>
      </header>

      {/* 2. ExploreBehavior */}
      <ExploreBehavior controls={[
        { label: "Size", type: "select", options: ["sm", "default", "lg"], value: sz, onChange: setSz },
        { label: "Color", type: "select", options: ["default", "primary", "foreground"], value: color, onChange: setColor },
      ]}>
        <div className="flex flex-col items-center gap-sm">
          <Spinner size={sz as any} className={colorClass} aria-hidden="true" />
          <span className="text-xs text-muted-foreground">
            {sz} — {sz === "sm" ? "16px" : sz === "lg" ? "32px" : "24px"}
          </span>
        </div>
      </ExploreBehavior>

      {/* 3. Installation */}
      <InstallationSection
        pkg={[]}
        importCode={`import { Spinner } from "@/components/ui/spinner"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example
            title="All Sizes"
            description="Three sizes — sm (16px) for inline use, default (24px) for standalone, lg (32px) for full-page or empty states."
            code={`<Spinner size="sm" aria-hidden="true" />\n<Spinner aria-hidden="true" />\n<Spinner size="lg" aria-hidden="true" />`}
          >
            <div className="flex items-end gap-xl">
              {([
                { size: "sm", label: "sm — 16px" },
                { size: "default", label: "default — 24px" },
                { size: "lg", label: "lg — 32px" },
              ] as const).map(({ size, label }) => (
                <div key={size} className="flex flex-col items-center gap-xs">
                  <Spinner size={size} aria-hidden="true" />
                  <span className="text-xs text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </Example>

          <Example
            title="Button Loading"
            description="Disable the button and replace the label with Spinner + text. Use size='sm' to match button line-height."
            code={`<Button disabled>\n  <Spinner size="sm" aria-hidden="true" />\n  Saving…\n</Button>`}
          >
            <div className="flex flex-wrap gap-sm">
              <Button disabled>
                <Spinner size="sm" aria-hidden="true" />
                Saving…
              </Button>
              <Button variant="outline" disabled>
                <Spinner size="sm" aria-hidden="true" />
                Loading
              </Button>
              <Button variant="secondary" disabled>
                <Spinner size="sm" aria-hidden="true" />
                Processing
              </Button>
            </div>
          </Example>

          <Example
            title="Inline with Text"
            description="Pair size='sm' with a short status label for inline feedback next to a form field or action area."
            code={`<div role="status" className="flex items-center gap-sm text-sm text-muted-foreground">\n  <Spinner size="sm" aria-hidden="true" />\n  <span>Saving changes…</span>\n</div>`}
          >
            <div className="space-y-sm">
              <div role="status" className="flex items-center gap-sm text-sm text-muted-foreground">
                <Spinner size="sm" aria-hidden="true" />
                <span>Saving changes…</span>
              </div>
              <div role="status" className="flex items-center gap-sm text-sm text-muted-foreground">
                <Spinner size="sm" aria-hidden="true" />
                <span>Uploading file…</span>
              </div>
            </div>
          </Example>

          <Example
            title="Card Loading State"
            description="Center a default-size spinner inside a card to indicate content is being fetched. Add a descriptive label below."
            code={`<Card size="md">\n  <div role="status" className="flex flex-col items-center justify-center py-2xl gap-sm">\n    <Spinner aria-hidden="true" />\n    <p className="text-sm text-muted-foreground">Loading data…</p>\n  </div>\n</Card>`}
          >
            <Card size="md" className="w-full">
              <div role="status" className="flex flex-col items-center justify-center py-2xl gap-sm">
                <Spinner aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Loading data…</p>
              </div>
            </Card>
          </Example>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground font-body">
          Native <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">svg</code> — no Radix dependency. Accepts all SVG attributes in addition to the following:
        </p>
        <PropsTable rows={[
          ["size", '"sm" | "default" | "lg"', '"default"', "Spinner diameter — sm 16px, default 24px, lg 32px"],
          ["className", "string", '""', "Additional CSS classes — use text-* to override color"],
          ["aria-hidden", '"true"', "—", "Set to true on the SVG when a visible text label or role=status parent is present"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--color-muted-foreground", "zinc-500", "Default spinner color (text-muted-foreground)"],
        ["--spacing-md", "16px", "sm size (size-md — 16×16px)"],
        ["--spacing-xl", "24px", "default size (size-xl — 24×24px)"],
        ["--spacing-2xl", "32px", "lg size (size-2xl — 32×32px)"],
        ["animate-spin", "360deg 1s linear infinite", "Rotation animation applied to the SVG root"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          title: "Accessibility",
          do: 'Wrap Spinner in a container with role="status" and aria-label="Loading" — the SVG itself should have aria-hidden="true" since it is decorative.',
          dont: 'Put aria-label directly on the Spinner SVG without a role="status" parent — screen readers may not announce it correctly.',
        },
        {
          title: "Size choice",
          do: "Use size='sm' (16px) inside buttons and inline text, size='default' (24px) for standalone loaders, size='lg' (32px) for full-page or empty-state loading.",
          dont: "Use size='lg' inside a button — it overflows the button height and misaligns with the label text.",
        },
        {
          title: "When to use",
          do: "Use Spinner for indeterminate operations where duration is unknown (API calls, auth checks). Pair with a short status label like 'Loading…'.",
          dont: "Use Spinner for operations with a measurable percentage — use Progress instead so users can gauge remaining time.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["Size: Small", "size-md (16×16px)", "size", '"sm"'],
        ["Size: Default", "size-xl (24×24px)", "size", '"default"'],
        ["Size: Large", "size-2xl (32×32px)", "size", '"lg"'],
        ["Color: Default", "text-muted-foreground", "className", '""'],
        ["Color: Primary", "text-primary (violet-600)", "className", '"text-primary"'],
        ["Track circle", "opacity-25, stroke currentColor", "SVG circle", "strokeWidth={4}"],
        ["Arc path", "opacity-75, fill currentColor", "SVG path", "d='M4 12a8 8...'"],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[["—", "Spinner is static — not keyboard interactive"]]}
        notes={[
          'Spinner SVG is purely decorative — always set aria-hidden="true" on the SVG element',
          'Wrap with a container using role="status" and aria-label="Loading [context]" so screen readers announce the state',
          'For dynamic injection (spinner appears after an action), use aria-live="polite" on the parent region to guarantee announcement',
          "Remove the spinner from the DOM when loading completes — do not just hide it with display:none while keeping it mounted",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Progress", desc: "Determinate percentage bar. Use Progress when the completion percentage is measurable; Spinner when duration is unknown." },
        { name: "Skeleton", desc: "Content placeholder that mimics layout. Use Skeleton when the page structure is known; Spinner for opaque async operations." },
        { name: "Button", desc: "Accepts Spinner inside when disabled during form submission — pair size='sm' with the button label text." },
      ]} />
    </div>
  )
}

function SeparatorDocs() {
  const [orientation, setOrientation] = useState("horizontal")

  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Layout</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Separator</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          A thin line that visually divides content into distinct groups — supports horizontal and vertical orientations. Purely decorative by default; set <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">decorative=false</code> to expose a semantic separator role for assistive technologies.
        </p>
      </header>

      {/* 2. Explore Behavior */}
      <ExploreBehavior controls={[
        { label: "Orientation", type: "select", options: ["horizontal", "vertical"], value: orientation, onChange: setOrientation },
      ]}>
        {orientation === "horizontal" ? (
          <div className="w-full max-w-xs space-y-sm">
            <p className="text-sm text-foreground font-medium">Section A</p>
            <Separator />
            <p className="text-sm text-foreground font-medium">Section B</p>
          </div>
        ) : (
          <div className="flex items-center gap-md h-6">
            <span className="text-sm text-foreground font-medium">Left</span>
            <Separator orientation="vertical" />
            <span className="text-sm text-foreground font-medium">Right</span>
          </div>
        )}
      </ExploreBehavior>

      {/* 3. Installation */}
      <InstallationSection
        pkg={["@radix-ui/react-separator"]}
        importCode={`import { Separator } from "@/components/ui/separator"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">

          <Example
            title="Horizontal"
            description="Default orientation — divides stacked content blocks with a full-width line."
            code={`<div className="space-y-sm">\n  <p className="text-sm font-medium">Radix Primitives</p>\n  <Separator />\n  <p className="text-sm text-muted-foreground">Unstyled UI primitives.</p>\n</div>`}
          >
            <div className="w-full space-y-sm">
              <p className="text-sm font-medium text-foreground">Radix Primitives</p>
              <Separator />
              <p className="text-sm text-muted-foreground">An open-source UI component library.</p>
            </div>
          </Example>

          <Example
            title="Vertical"
            description="Divides inline items — common in breadcrumbs, toolbars, and nav links."
            code={`<div className="flex items-center gap-md h-5">\n  <span className="text-sm">Blog</span>\n  <Separator orientation="vertical" />\n  <span className="text-sm">Docs</span>\n  <Separator orientation="vertical" />\n  <span className="text-sm">Source</span>\n</div>`}
          >
            <div className="flex items-center gap-md h-5">
              <span className="text-sm text-foreground">Blog</span>
              <Separator orientation="vertical" />
              <span className="text-sm text-foreground">Docs</span>
              <Separator orientation="vertical" />
              <span className="text-sm text-foreground">Source</span>
            </div>
          </Example>

          <Example
            title="In Navigation Menu"
            description="Separate distinct nav groups inside a sidebar or dropdown without extra heading noise."
            code={`<nav className="space-y-xs">\n  <a className="block text-sm px-sm py-xs rounded hover:bg-muted">Dashboard</a>\n  <a className="block text-sm px-sm py-xs rounded hover:bg-muted">Analytics</a>\n  <Separator className="my-xs" />\n  <a className="block text-sm px-sm py-xs rounded hover:bg-muted">Settings</a>\n  <a className="block text-sm px-sm py-xs rounded hover:bg-muted">Billing</a>\n</nav>`}
          >
            <nav className="w-full max-w-[180px] space-y-xs">
              {["Dashboard", "Analytics"].map(item => (
                <div key={item} className="text-sm px-sm py-xs rounded-md bg-muted/50 text-foreground">{item}</div>
              ))}
              <Separator className="my-xs" />
              {["Settings", "Billing"].map(item => (
                <div key={item} className="text-sm px-sm py-xs rounded-md bg-muted/50 text-foreground">{item}</div>
              ))}
            </nav>
          </Example>

          <Example
            title="In Profile / Detail Row"
            description="Vertical separator between inline metadata fields — name, role, and team in a compact row."
            code={`<div className="flex items-center gap-sm text-sm">\n  <span className="font-medium">Jane Doe</span>\n  <Separator orientation="vertical" className="h-4" />\n  <span className="text-muted-foreground">Designer</span>\n  <Separator orientation="vertical" className="h-4" />\n  <span className="text-muted-foreground">Growth</span>\n</div>`}
          >
            <div className="flex items-center gap-sm text-sm">
              <span className="font-medium text-foreground">Jane Doe</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">Designer</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground">Growth</span>
            </div>
          </Example>

        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["orientation", '"horizontal" | "vertical"', '"horizontal"', "Direction of the divider line"],
          ["decorative",  "boolean",                   "true",         "When true, hides from screen readers (role='none'). Set false to expose role='separator'."],
          ["className",   "string",                    "—",            "Extend sizing or color — e.g. className='my-md' or 'bg-primary/20'"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--border",       "zinc-200 / zinc-800", "Separator line color (bg-border)"],
        ["h-px / w-px",   "1px",                 "Line thickness — horizontal uses h-px w-full, vertical uses h-full w-px"],
        ["--color-border", "zinc-200 / zinc-800", "Overridable via className='bg-primary/20' etc."],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          do:   "Use Separator to divide distinct content groups — nav sections, form fieldsets, metadata rows. Combine with spacing utilities (my-sm, mx-sm) to control breathing room.",
          dont: "Add a Separator between every item in a list — it creates visual noise. Use gap or padding to create rhythm instead.",
        },
        {
          do:   "Leave decorative=true (default) when the separation is already communicated by layout, heading, or context. Only set decorative=false when the separator carries semantic meaning (e.g. separating two distinct regions in a landmark).",
          dont: "Rely on Separator alone for semantic content grouping. Use heading hierarchy, sections, or fieldsets for structure that assistive technologies need to navigate.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["Orientation", "Horizontal", "orientation", '"horizontal"'],
        ["Orientation", "Vertical",   "orientation", '"vertical"'],
        ["Decorative",  "True",       "decorative",  "true"],
        ["Decorative",  "False",      "decorative",  "false (adds role='separator')"],
        ["Color",       "Default",    "className",   '"" (uses --border token)'],
        ["Color",       "Custom",     "className",   '"bg-primary/20" etc.'],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[["—", "Separator is not interactive — no keyboard interaction"]]}
        notes={[
          "Default (decorative=true): renders role='none' — invisible to screen readers. Use when the visual separation is redundant with surrounding context.",
          "Semantic (decorative=false): renders role='separator' with aria-orientation. Use when the separator marks a meaningful boundary between two distinct regions.",
          "Never place focusable content (links, buttons) immediately adjacent to a separator without proper landmark or heading structure.",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Card",       desc: "For bordered surface containers that group related content." },
        { name: "Accordion",  desc: "For collapsible content sections with built-in dividers." },
        { name: "Breadcrumb", desc: "Uses vertical separators between navigation path segments." },
        { name: "Tabs",       desc: "Alternative to separator for switching between content views." },
      ]} />

    </div>
  )
}

function SkeletonDocs() {
  const [shape, setShape] = useState("avatar")
  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Feedback</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Skeleton</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          Layout-aware loading placeholder with pulse animation — compose multiple Skeleton elements to mirror the exact shape of the content being fetched. No props beyond <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">className</code>; all sizing, shape, and radius come from Tailwind utilities.
        </p>
      </header>

      {/* 2. ExploreBehavior */}
      <ExploreBehavior controls={[
        { label: "Shape", type: "select", options: ["avatar", "text", "card", "table"], value: shape, onChange: setShape },
      ]}>
        {shape === "avatar" && (
          <div className="flex items-center gap-md">
            <Skeleton className="size-10 rounded-full shrink-0" />
            <div className="space-y-xs flex-1 max-w-[180px]">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/5" />
            </div>
          </div>
        )}
        {shape === "text" && (
          <div className="space-y-xs w-full max-w-xs">
            <Skeleton className="h-5 w-2/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        )}
        {shape === "card" && (
          <div className="space-y-sm w-full max-w-xs">
            <Skeleton className="h-[120px] w-full rounded-xl" />
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/5" />
          </div>
        )}
        {shape === "table" && (
          <div className="w-full max-w-sm space-y-xs">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-md">
                <Skeleton className="size-8 rounded-full shrink-0" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-16 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </ExploreBehavior>

      {/* 3. Installation */}
      <InstallationSection
        pkg={[]}
        importCode={`import { Skeleton } from "@/components/ui/skeleton"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example
            title="User Row"
            description="Avatar circle + name + subtitle — use in lists, comment threads, or anywhere user identity loads asynchronously."
            code={`<div className="flex items-center gap-md">\n  <Skeleton className="size-10 rounded-full" />\n  <div className="space-y-xs flex-1">\n    <Skeleton className="h-4 w-1/2" />\n    <Skeleton className="h-3 w-1/3" />\n  </div>\n</div>`}
          >
            <div className="w-full space-y-sm">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-md">
                  <Skeleton className="size-10 rounded-full shrink-0" />
                  <div className="space-y-xs flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </Example>

          <Example
            title="KPI Card"
            description="Stat headline + label + trend line — use in dashboard panels while metric data is fetching."
            code={`<Card size="md">\n  <div className="space-y-sm">\n    <Skeleton className="h-3 w-1/3" />\n    <Skeleton className="h-8 w-2/5" />\n    <Skeleton className="h-3 w-1/2" />\n  </div>\n</Card>`}
          >
            <div className="w-full grid grid-cols-2 gap-sm">
              {[1, 2].map(i => (
                <Card key={i} size="md">
                  <div className="space-y-sm">
                    <Skeleton className="h-3 w-1/3" />
                    <Skeleton className="h-8 w-2/5" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          </Example>

          <Example
            title="Table Rows"
            description="Repeat a row skeleton to fill the expected row count. Mirror the column layout of the real table."
            code={`<div className="space-y-xs">\n  {Array.from({ length: 4 }).map((_, i) => (\n    <div key={i} className="flex items-center gap-md">\n      <Skeleton className="size-8 rounded-full" />\n      <Skeleton className="h-4 flex-1" />\n      <Skeleton className="h-4 w-16" />\n      <Skeleton className="h-4 w-20" />\n    </div>\n  ))}\n</div>`}
          >
            <div className="w-full space-y-xs">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-md">
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-16 shrink-0" />
                  <Skeleton className="h-4 w-20 shrink-0" />
                </div>
              ))}
            </div>
          </Example>

          <Example
            title="Form Field"
            description="Label + input placeholder — use in settings or edit panels while form data loads from the server."
            code={`<div className="space-y-sm">\n  <div className="space-y-xs">\n    <Skeleton className="h-3 w-16" />\n    <Skeleton className="h-9 w-full rounded-lg" />\n  </div>\n  <div className="space-y-xs">\n    <Skeleton className="h-3 w-20" />\n    <Skeleton className="h-9 w-full rounded-lg" />\n  </div>\n</div>`}
          >
            <div className="w-full space-y-sm">
              {[{ w: "w-16" }, { w: "w-24" }, { w: "w-20" }].map((f, i) => (
                <div key={i} className="space-y-xs">
                  <Skeleton className={`h-3 ${f.w}`} />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </Example>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground font-body">
          Native <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">div</code> — no Radix dependency. Shape, size, and radius are all controlled via <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">className</code>.
        </p>
        <PropsTable rows={[
          ["className", "string", '""', "Tailwind classes that define size (h-*, w-*), shape (rounded-full, rounded-xl), and any override"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--color-muted", "zinc-100 / zinc-800", "Skeleton fill color (bg-muted)"],
        ["--radius-lg", "8px", "Default border radius (rounded-lg) — override with rounded-full or rounded-xl via className"],
        ["animate-pulse", "opacity 0.5→1, 2s cubic-bezier, infinite", "Pulse animation applied to the root div"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          title: "Shape matching",
          do: "Mirror the exact shape of the content being loaded — rounded-full for avatars, h-4 for text lines, rounded-xl for images, h-9 for inputs.",
          dont: "Use a single full-width rectangle for all loading states — it fails to set user expectations about the incoming layout.",
        },
        {
          title: "Quantity",
          do: "Render the same number of skeleton rows/cards as the real content will contain — this prevents layout shift when data arrives.",
          dont: "Render one or two skeleton rows when the real list will have ten — the layout jump disorients users.",
        },
        {
          title: "Lifecycle",
          do: "Remove skeleton elements from the DOM entirely once content loads or an error occurs — swap in the real component.",
          dont: "Hide skeletons with opacity-0 or display:none while keeping them mounted — they still take up space and confuse screen readers.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["Text line", "h-4 rounded-lg bg-muted", "className", '"h-4 w-full"'],
        ["Heading", "h-5 or h-6 rounded-lg bg-muted", "className", '"h-5 w-2/5"'],
        ["Avatar / Circle", "rounded-full bg-muted", "className", '"size-10 rounded-full"'],
        ["Image / Banner", "rounded-xl bg-muted", "className", '"h-[120px] rounded-xl"'],
        ["Input field", "h-9 rounded-lg bg-muted", "className", '"h-9 w-full rounded-lg"'],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[["—", "Skeleton is static — not keyboard interactive"]]}
        notes={[
          'Add aria-hidden="true" to the skeleton container so screen readers skip decorative placeholders',
          'Wrap the entire loading region with role="status" and aria-label="Loading [content name]" to announce the state',
          "Remove skeleton elements from the DOM once content loads — do not hide with CSS while keeping them mounted",
          "Avoid relying on animation alone to communicate loading — pair with a visible or announced text like 'Loading…'",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Spinner", desc: "Indeterminate loading indicator without layout structure. Use Spinner for opaque async operations; Skeleton when the content layout is known." },
        { name: "Progress", desc: "Determinate percentage bar. Use Progress when completion is measurable; Skeleton for content-level placeholders." },
        { name: "Card", desc: "The real container a Skeleton card often wraps — match Skeleton dimensions to Card size prop padding." },
      ]} />
    </div>
  )
}

function TabsDocs() {
  const [showIcons, setShowIcons] = useState(false)
  const [showDisabled, setShowDisabled] = useState(false)
  const [pill, setPill] = useState(false)
  // Tabs Item explore state
  const [itemVariant, setItemVariant] = useState("default")
  const [itemState, setItemState] = useState("default")
  const [itemIcon, setItemIcon] = useState(false)
  const isItemPill = itemVariant === "pill"
  const isItemActive = itemState === "active"
  const isItemHover = itemState === "hover"
  const isItemDisabled = itemState === "disabled"
  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Navigation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Tabs</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          Tabbed interface for switching between related content sections within the same page context — use when views share the same data scope and switching should not trigger a full navigation. Built on Radix Tabs with full keyboard navigation and ARIA roles.
        </p>
      </header>

      {/* 2. Explore Behavior — tabbed: Tabs Group | Tabs Item */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
        <Tabs defaultValue="tabs-group" className="w-full">
          <div className="border border-border rounded-xl overflow-hidden">
          <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
            <TabsTrigger value="tabs-group" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Tabs</span></TabsTrigger>
            <TabsTrigger value="tabs-item" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Tabs Item</span></TabsTrigger>
          </TabsList>

          {/* Tab 1: Tabs Group */}
          <TabsContent value="tabs-group" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <Tabs defaultValue="account" className="w-full max-w-md">
                  <TabsList variant={pill ? "pill" : "default"}>
                    <TabsTrigger value="account" className="gap-xs">
                      {showIcons && <User className="size-4" />}Account
                    </TabsTrigger>
                    <TabsTrigger value="notifications" className="gap-xs">
                      {showIcons && <Bell className="size-4" />}Notifications
                    </TabsTrigger>
                    <TabsTrigger value="billing" className="gap-xs" disabled={showDisabled}>
                      {showIcons && <Settings className="size-4" />}Billing
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="account">
                    <p className="text-sm text-muted-foreground p-md">Manage your account details and preferences.</p>
                  </TabsContent>
                  <TabsContent value="notifications">
                    <p className="text-sm text-muted-foreground p-md">Configure how and when you receive notifications.</p>
                  </TabsContent>
                  <TabsContent value="billing">
                    <p className="text-sm text-muted-foreground p-md">View invoices and manage your subscription.</p>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-wrap gap-x-lg gap-y-xs">
                  <div className="flex flex-col gap-xs">
                    <Label className="text-xs text-muted-foreground font-body">Show Icons</Label>
                    <Switch checked={showIcons} onCheckedChange={setShowIcons} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <Label className="text-xs text-muted-foreground font-body">Disabled Tab</Label>
                    <Switch checked={showDisabled} onCheckedChange={setShowDisabled} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <Label className="text-xs text-muted-foreground font-body">Pill Variant</Label>
                    <Switch checked={pill} onCheckedChange={setPill} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Tabs Item */}
          <TabsContent value="tabs-item" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <div className={cn("inline-flex h-9 items-center justify-center bg-muted p-1", isItemPill ? "rounded-full" : "rounded-lg")}>
                  <div
                    data-slot="tabs-trigger"
                    className={cn(
                      "inline-flex items-center justify-center whitespace-nowrap px-sm py-1 text-sm font-medium transition-all gap-xs",
                      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring",
                      isItemPill ? "rounded-full" : "rounded-md",
                      isItemDisabled && "opacity-50 pointer-events-none",
                      isItemActive && "bg-background text-foreground shadow",
                      !isItemActive && !isItemHover && !isItemDisabled && "text-muted-foreground",
                      isItemHover && !isItemActive && "text-foreground",
                    )}
                  >
                    {itemIcon && <User className="size-4" />}Account
                  </div>
                </div>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-col gap-md">
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">Variant</Label>
                    <div className="flex flex-wrap gap-xs">
                      {["default", "pill"].map(v => (
                        <button key={v} onClick={() => setItemVariant(v)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", itemVariant === v ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{v}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">State</Label>
                    <div className="flex flex-wrap gap-xs">
                      {["default", "hover", "active", "disabled"].map(s => (
                        <button key={s} onClick={() => setItemState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", itemState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-lg gap-y-xs">
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Show Icon</Label>
                      <Switch checked={itemIcon} onCheckedChange={setItemIcon} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          </div>
        </Tabs>
      </section>

      {/* 3. Installation */}
      <InstallationSection
        pkg={["@radix-ui/react-tabs"]}
        importCode={`import {\n  Tabs,\n  TabsList,\n  TabsTrigger,\n  TabsContent,\n} from "@/components/ui/tabs"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example
            title="Default"
            description="Basic settings panel with three tab sections. Use defaultValue to set the initially active tab without controlled state."
            code={`<Tabs defaultValue="account">\n  <TabsList>\n    <TabsTrigger value="account">Account</TabsTrigger>\n    <TabsTrigger value="password">Password</TabsTrigger>\n    <TabsTrigger value="billing">Billing</TabsTrigger>\n  </TabsList>\n  <TabsContent value="account">Account settings…</TabsContent>\n  <TabsContent value="password">Password settings…</TabsContent>\n  <TabsContent value="billing">Billing settings…</TabsContent>\n</Tabs>`}
          >
            <Tabs defaultValue="account" className="w-full max-w-md">
              <TabsList>
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <p className="text-sm text-muted-foreground p-md">Make changes to your account here.</p>
              </TabsContent>
              <TabsContent value="password">
                <p className="text-sm text-muted-foreground p-md">Change your password here.</p>
              </TabsContent>
              <TabsContent value="billing">
                <p className="text-sm text-muted-foreground p-md">Manage your billing information.</p>
              </TabsContent>
            </Tabs>
          </Example>

          <Example
            title="With Icons"
            description="Icon and label together for richer tab triggers. Use gap-xs on TabsTrigger to space icon and text consistently."
            code={`<TabsTrigger value="profile" className="gap-xs">\n  <User className="size-4" />\n  Profile\n</TabsTrigger>`}
          >
            <Tabs defaultValue="profile" className="w-full max-w-md">
              <TabsList>
                <TabsTrigger value="profile" className="gap-xs">
                  <User className="size-4" />Profile
                </TabsTrigger>
                <TabsTrigger value="notifications" className="gap-xs">
                  <Bell className="size-4" />Notifications
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-xs">
                  <Settings className="size-4" />Settings
                </TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <p className="text-sm text-muted-foreground p-md">Your profile details and avatar.</p>
              </TabsContent>
              <TabsContent value="notifications">
                <p className="text-sm text-muted-foreground p-md">Notification preferences and channels.</p>
              </TabsContent>
              <TabsContent value="settings">
                <p className="text-sm text-muted-foreground p-md">General application settings.</p>
              </TabsContent>
            </Tabs>
          </Example>

          <Example
            title="Disabled Tab"
            description="Use disabled on TabsTrigger to block access to tabs not yet available — e.g. a billing tab locked to paid plans."
            code={`<TabsTrigger value="billing" disabled>\n  Billing\n</TabsTrigger>`}
          >
            <Tabs defaultValue="general" className="w-full max-w-md">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
                <TabsTrigger value="api">API Keys</TabsTrigger>
              </TabsList>
              <TabsContent value="general">
                <p className="text-sm text-muted-foreground p-md">General workspace settings.</p>
              </TabsContent>
              <TabsContent value="api">
                <p className="text-sm text-muted-foreground p-md">Manage API keys and webhooks.</p>
              </TabsContent>
            </Tabs>
          </Example>

          <Example
            title="Pill Variant"
            description="Fully rounded list and triggers — set variant='pill' once on TabsList and all triggers inherit the shape automatically via context."
            code={`<TabsList variant="pill">\n  <TabsTrigger value="all">All</TabsTrigger>\n  <TabsTrigger value="revenue">Revenue</TabsTrigger>\n  <TabsTrigger value="orders">Orders</TabsTrigger>\n</TabsList>`}
          >
            <Tabs defaultValue="all" className="w-full max-w-md">
              <TabsList variant="pill">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <p className="text-sm text-muted-foreground p-md">All transactions across all categories.</p>
              </TabsContent>
              <TabsContent value="revenue">
                <p className="text-sm text-muted-foreground p-md">Revenue breakdown by source and period.</p>
              </TabsContent>
              <TabsContent value="orders">
                <p className="text-sm text-muted-foreground p-md">Order volume and fulfillment status.</p>
              </TabsContent>
            </Tabs>
          </Example>

          <Example
            title="In Card"
            description="Tabs inside a card with full-width list — common for dashboard detail panels. Add className='w-full' to TabsList and flex-1 to each trigger."
            code={`<Card size="md">\n  <Tabs defaultValue="overview">\n    <TabsList className="w-full">\n      <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>\n      <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>\n    </TabsList>\n    <TabsContent value="overview">…</TabsContent>\n    <TabsContent value="analytics">…</TabsContent>\n  </Tabs>\n</Card>`}
          >
            <Card size="md" className="w-full">
              <Tabs defaultValue="overview">
                <TabsList className="w-full">
                  <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                  <TabsTrigger value="analytics" className="flex-1 gap-xs">
                    <BarChart3 className="size-4" />Analytics
                  </TabsTrigger>
                  <TabsTrigger value="reports" className="flex-1">Reports</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <p className="text-sm text-muted-foreground pt-md">Summary metrics and recent activity.</p>
                </TabsContent>
                <TabsContent value="analytics">
                  <p className="text-sm text-muted-foreground pt-md">Detailed charts and trend analysis.</p>
                </TabsContent>
                <TabsContent value="reports">
                  <p className="text-sm text-muted-foreground pt-md">Exportable reports and scheduled summaries.</p>
                </TabsContent>
              </Tabs>
            </Card>
          </Example>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground font-body">
          Built on <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">@radix-ui/react-tabs</code>. Supports all Radix Tabs props in addition to the following:
        </p>
        <h3 className="font-semibold text-sm">Tabs (Root)</h3>
        <PropsTable rows={[
          ["defaultValue", "string", "—", "Initially active tab value (uncontrolled)"],
          ["value", "string", "—", "Controlled active tab value"],
          ["onValueChange", "(value: string) => void", "—", "Callback fired when the active tab changes"],
          ["orientation", '"horizontal" | "vertical"', '"horizontal"', "Tab list orientation — affects arrow key navigation direction"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">TabsList</h3>
        <PropsTable rows={[
          ["variant", '"default" | "pill"', '"default"', "Shape of the list and all child triggers — \"pill\" applies rounded-full to TabsList and propagates to every TabsTrigger via context"],
          ["className", "string", '""', "Additional CSS classes — use w-full to stretch the list to container width"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">TabsTrigger (as tabs item)</h3>
        <PropsTable rows={[
          ["value", "string", "—", "Unique identifier matching a TabsContent value (required)"],
          ["disabled", "boolean", "false", "Prevents the tab from being selected"],
          ["children", "ReactNode", "—", "Label text and optional icon"],
          ["className", "string", '""', "Additional CSS — use flex-1 to stretch, gap-xs for icon spacing"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">TabsContent</h3>
        <PropsTable rows={[
          ["value", "string", "—", "Identifier matching the corresponding TabsTrigger (required)"],
          ["forceMount", "boolean", "false", "Keep content mounted in DOM when inactive — useful for animation libraries"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--color-muted", "zinc-100 / zinc-800", "TabsList background (bg-muted)"],
        ["--color-background", "white / zinc-950", "Active trigger background (data-[state=active]:bg-background)"],
        ["--color-foreground", "zinc-950 / zinc-50", "Active trigger text color (data-[state=active]:text-foreground)"],
        ["--color-muted-foreground", "zinc-500", "Inactive trigger text color (text-muted-foreground)"],
        ["--radius-lg", "8px", "TabsList border radius — default variant (rounded-lg)"],
        ["--radius-md", "6px", "Active trigger border radius — default variant (rounded-md)"],
        ["rounded-full", "9999px", "TabsList and trigger border radius — pill variant"],
        ["--spacing-ring", "violet-600/30", "Focus ring color (ring-ring)"],
        ["--spacing-xs", "8px", "TabsContent top margin (mt-xs)"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          title: "When to use",
          do: "Use Tabs to switch between related content sections that share the same data scope and URL — e.g. Account / Password / Billing within Settings.",
          dont: "Use Tabs for page-level navigation between distinct routes — use a sidebar or navigation links so the URL reflects the active section.",
        },
        {
          title: "Label length",
          do: "Keep tab labels to 1–3 words. Use an icon alongside for extra clarity in icon-heavy UIs.",
          dont: "Put more than 6 tabs in one TabsList or use long sentence labels — tabs overflow and lose scannability.",
        },
        {
          title: "Default value",
          do: "Always set defaultValue or value — Tabs has no implicit default and will render with no active tab if omitted.",
          dont: "Rely on the first tab being active automatically — always be explicit about the initial state.",
        },
        {
          title: "Active state (item)",
          do: "Set exactly one item to Active to indicate the current section.",
          dont: "Set multiple items to Active — it confuses users about their current section.",
        },
        {
          title: "Disabled usage (item)",
          do: "Use Disabled for tabs locked behind a paywall or permission — shows what's available.",
          dont: "Hide unavailable tabs entirely — showing disabled communicates upgrade potential.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["TabsList (default)", "bg-muted, rounded-lg, h-9, p-1", "TabsList", 'variant="default"'],
        ["TabsList (pill)", "bg-muted, rounded-full, h-9, p-1", "TabsList", 'variant="pill"'],
        ["Trigger: Default", "text-muted-foreground, rounded-md", "TabsTrigger", "inactive state"],
        ["Trigger: Pill", "text-muted-foreground, rounded-full", "TabsTrigger", "inherited from variant context"],
        ["Trigger: Active", "bg-background, text-foreground, shadow", "TabsTrigger", "data-[state=active]"],
        ["Trigger: Disabled", "opacity-50, pointer-events-none", "TabsTrigger", "disabled={true}"],
        ["Trigger: With Icon", "icon + label, gap-xs", "TabsTrigger", 'className="gap-xs"'],
        ["Content panel", "mt-xs, focus-visible:ring-ring", "TabsContent", "value"],
        ["Item: Default", "No fill, muted-foreground text", "TabsTrigger", "Default appearance"],
        ["Item: Pill", "rounded-full trigger", "TabsTrigger", "Inherits from TabsList variant=\"pill\""],
        ["Item: Active", "bg-background, text-foreground, shadow", "TabsTrigger", "data-[state=active]"],
        ["Item: Disabled", "opacity-50", "TabsTrigger", "disabled={true}"],
        ["Item: With Icon", "Icon + label, gap-xs", "TabsTrigger", "className=\"gap-xs\""],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[
          ["Tab", "Move focus into and out of the tab list"],
          ["Arrow Left / Right", "Navigate between tabs (horizontal orientation)"],
          ["Arrow Up / Down", "Navigate between tabs (vertical orientation)"],
          ["Enter / Space", "Activate the focused tab"],
          ["Home", "Jump to the first tab"],
          ["End", "Jump to the last tab"],
        ]}
        notes={[
          'Radix sets role="tablist" on TabsList, role="tab" on each trigger, and role="tabpanel" on each content panel automatically',
          "Each trigger has aria-selected, aria-controls (pointing to its panel), and aria-disabled when disabled",
          "Inactive TabsContent panels are hidden from the DOM by default — set forceMount to keep them mounted for animation libraries",
          "When using Tabs for a sub-section that is also reachable by URL, sync the active value with the route to support deep-linking",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Accordion", desc: "Stacked expandable sections within a single column. Use Accordion when sections may be open simultaneously or the content is long-form." },
        { name: "Select", desc: "Compact single-choice dropdown. Use Select instead of Tabs when there are more than 6 options or screen space is constrained." },
        { name: "NavigationMenu", desc: "Page-level navigation with dropdown support. Use NavigationMenu for top-level routing; Tabs for in-page section switching." },
      ]} />
    </div>
  )
}

function TextareaDocs() {
  const [state, setState] = useState("default")
  const [rows, setRows] = useState("3")
  const [val, setVal] = useState("placeholder")
  const isDisabled = state === "disabled"
  const isError = state === "error"
  const isFocus = state === "focus"
  const isHover = state === "hover"
  const taValueProp = val === "filled" ? { value: "This is some filled content typed by the user. It spans multiple lines to demonstrate the multi-line nature of the component.", onChange: () => {} } : {}
  const taPlaceholder = val === "placeholder" ? "Type your message..." : undefined
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Textarea</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A multi-line text input for longer content like comments, descriptions, or notes. Use instead of Input when the response is expected to span more than one line.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "State", type: "select", options: ["default","hover","focus","error","disabled"], value: state, onChange: setState },
        { label: "Rows", type: "select", options: ["2","3","4","5"], value: rows, onChange: setRows },
        { label: "Value", type: "select", options: ["placeholder","filled","empty"], value: val, onChange: setVal },
      ]}>
        <Textarea key={val} rows={Number(rows)} disabled={isDisabled} aria-invalid={isError || undefined} placeholder={taPlaceholder} className={cn("max-w-sm", isFocus && "ring-[3px] ring-ring", isHover && "border-border-strong")} {...taValueProp} />
      </ExploreBehavior>
      <InstallationSection pkg={[]} importCode={`import { Textarea } from "@/components/ui/textarea"`} />
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default" description="Basic multi-line text input with placeholder." code={`<Textarea placeholder="Type your message here." />`}>
          <Textarea placeholder="Type your message here." className="max-w-sm" />
        </Example>
        <Example title="With Label" description="Always pair with a visible Label for accessibility." code={`<Label>Bio</Label>\n<Textarea placeholder="Tell us about yourself" />`}>
          <div className="space-y-3xs w-full max-w-sm">
            <Label>Bio</Label>
            <Textarea placeholder="Tell us about yourself" />
          </div>
        </Example>
        <Example title="In Form Context" description="Typical form layout with label, textarea, and helper text." code={`<div className="space-y-3xs">\n  <Label htmlFor="msg">Message</Label>\n  <Textarea id="msg" rows={4} placeholder="Write your message..." />\n  <p className="text-xs text-muted-foreground">Max 500 characters.</p>\n</div>`}>
          <div className="space-y-3xs w-full max-w-sm">
            <Label htmlFor="msg-ex">Message</Label>
            <Textarea id="msg-ex" rows={4} placeholder="Write your message..." />
            <p className="text-xs text-muted-foreground">Max 500 characters.</p>
          </div>
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
      <DesignTokensTable rows={[["--input","transparent","Background"],["--border","zinc-200","Default border"],["--border-strong","zinc-400","Hover border"],["--ring","violet-600/30","Focus ring"],["--ring-error","red-500/30","Error ring"],["--muted-foreground","zinc-500","Placeholder"]]} />
      <BestPractices items={[
        {title:"Sizing",do:"Set a visible minimum height with the rows prop to signal how much content is expected.",dont:"Use Textarea for single-line input — use Input instead."},
        {title:"Guidance",do:"Provide a character count or max-length hint so users know the constraint before submitting.",dont:"Allow unlimited text without any feedback — users lose context of acceptable length."},
      ]} />
      <FigmaMapping rows={[["State","Default","—","default"],["State","Hover","className","border-border-strong"],["State","Focus","className","ring-[3px] ring-ring"],["State","Error","aria-invalid","true"],["State","Disabled","disabled","true"],["Rows","3 (default)","rows","3"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus the textarea"],["Shift+Tab","Move focus away"]]} notes={["Always pair with <Label> using htmlFor for accessibility","Use aria-invalid for error states","Use aria-describedby to associate error messages"]} />
      <RelatedComponents items={[
        {name:"Input",desc:"Single-line text field for short responses. Use Input when the answer fits on one line."},
        {name:"Select",desc:"Dropdown for choosing from a fixed list. Use Select when the user picks an option rather than writing free text."},
      ]} />
    </div>
  )
}

function RadioDocs() {
  const [radioValue, setRadioValue] = useState("checked")
  const [state, setState] = useState("default")
  const isDisabled = state === "disabled"
  const isHover = state === "hover"
  const isFocus = state === "focus"
  const isChecked = radioValue === "checked"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Radio</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A group of radio buttons that enforces single selection — only one option in the group can be active at a time. Built on Radix UI with <code>RadioGroup</code> as the container and <code>RadioGroupItem</code> as each option.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Value", type: "select", options: ["unchecked","checked"], value: radioValue, onChange: setRadioValue },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
      ]}>
        <RadioGroup value={isChecked ? "on" : undefined} disabled={isDisabled}>
          <div className="flex items-center gap-xs">
            <RadioGroupItem
              value="on"
              id="eb-radio"
              className={cn(
                isHover && "border-primary/60",
                isFocus && "ring-[3px] ring-ring outline-none",
              )}
            />
            <Label htmlFor="eb-radio">Option label</Label>
          </div>
        </RadioGroup>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-radio-group"]} importCode={`import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Default Group" description="Vertical list of options with a pre-selected value set via defaultValue." code={`<RadioGroup defaultValue="comfortable">\n  <div className="flex items-center gap-xs"><RadioGroupItem value="default" id="r1" /><Label htmlFor="r1">Default</Label></div>\n  <div className="flex items-center gap-xs"><RadioGroupItem value="comfortable" id="r2" /><Label htmlFor="r2">Comfortable</Label></div>\n  <div className="flex items-center gap-xs"><RadioGroupItem value="compact" id="r3" /><Label htmlFor="r3">Compact</Label></div>\n</RadioGroup>`}>
            <RadioGroup defaultValue="comfortable">
              <div className="flex items-center gap-xs"><RadioGroupItem value="default" id="rg-d1" /><Label htmlFor="rg-d1">Default</Label></div>
              <div className="flex items-center gap-xs"><RadioGroupItem value="comfortable" id="rg-d2" /><Label htmlFor="rg-d2">Comfortable</Label></div>
              <div className="flex items-center gap-xs"><RadioGroupItem value="compact" id="rg-d3" /><Label htmlFor="rg-d3">Compact</Label></div>
            </RadioGroup>
          </Example>
          <Example title="Horizontal Layout" description="Flex row orientation suits short labels like billing cycle or size selection." code={`<RadioGroup defaultValue="monthly" className="flex gap-lg">...</RadioGroup>`}>
            <RadioGroup defaultValue="monthly" className="flex gap-lg">
              <div className="flex items-center gap-xs"><RadioGroupItem value="monthly" id="rg-h1" /><Label htmlFor="rg-h1">Monthly</Label></div>
              <div className="flex items-center gap-xs"><RadioGroupItem value="yearly" id="rg-h2" /><Label htmlFor="rg-h2">Yearly</Label></div>
            </RadioGroup>
          </Example>
          <Example title="Disabled Item" description="A single item can be disabled while the rest remain interactive." code={`<RadioGroupItem value="enterprise" disabled />`}>
            <RadioGroup defaultValue="free">
              <div className="flex items-center gap-xs"><RadioGroupItem value="free" id="rg-di1" /><Label htmlFor="rg-di1">Free</Label></div>
              <div className="flex items-center gap-xs"><RadioGroupItem value="pro" id="rg-di2" /><Label htmlFor="rg-di2">Pro</Label></div>
              <div className="flex items-center gap-xs"><RadioGroupItem value="enterprise" id="rg-di3" disabled /><Label htmlFor="rg-di3" className="opacity-50">Enterprise (contact sales)</Label></div>
            </RadioGroup>
          </Example>
          <Example title="In Form Context" description="Wrapped in a fieldset with a legend so assistive technology announces the group question." code={`<fieldset>\n  <legend>Preferred contact method</legend>\n  <RadioGroup defaultValue="email">...</RadioGroup>\n</fieldset>`}>
            <fieldset className="border-0 p-0 m-0">
              <legend className="text-sm font-medium mb-xs">Preferred contact method</legend>
              <RadioGroup defaultValue="email">
                <div className="flex items-center gap-xs"><RadioGroupItem value="email" id="rg-fctx-1" /><Label htmlFor="rg-fctx-1">Email</Label></div>
                <div className="flex items-center gap-xs"><RadioGroupItem value="phone" id="rg-fctx-2" /><Label htmlFor="rg-fctx-2">Phone</Label></div>
                <div className="flex items-center gap-xs"><RadioGroupItem value="sms" id="rg-fctx-3" /><Label htmlFor="rg-fctx-3">SMS</Label></div>
              </RadioGroup>
            </fieldset>
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
          ["orientation", '"horizontal" | "vertical"', '"vertical"', "Layout direction for keyboard navigation"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">RadioGroupItem</h3>
        <PropsTable rows={[
          ["value", "string", "—", "Item value matched against RadioGroup value (required)"],
          ["disabled", "boolean", "false", "Disable this specific item"],
          ["aria-invalid", "boolean", "false", "Show error border and ring"],
          ["id", "string", "—", "ID for Label association via htmlFor"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--primary","violet-600","Selected indicator fill and border"],
        ["--border-strong","zinc-400","Unselected item border"],
        ["--ring","violet-600/30","Focus ring"],
        ["--ring-error","red-500/30","Error focus ring"],
        ["--destructive","red-600","Error checked fill"],
        ["--destructive-border","red-500","Error state border"],
      ]} />

      <BestPractices items={[
        {
          title: "Keep groups to 2–5 options",
          do: "Use RadioGroup for mutually exclusive choices that fit on screen simultaneously (2–5 options).",
          dont: "Use Radio for long lists — reach for Select or Combobox when there are more than 5 options.",
        },
        {
          title: "Show all options at once",
          do: "Display every radio option upfront so the user can compare choices before deciding.",
          dont: "Hide radio items behind a toggle or 'show more' — partial visibility defeats the purpose of radio.",
        },
        {
          title: "Avoid radio for instant-effect choices",
          do: "Use RadioGroup when the selection is part of a form submitted explicitly by the user.",
          dont: "Use radio buttons for binary on/off settings — prefer Switch for choices that take immediate effect.",
        },
      ]} />

      <FigmaMapping rows={[
        ["State","Default","—","—"],
        ["State","Hover","className","border-primary/60"],
        ["State","Focus","className","ring-[3px] ring-ring"],
        ["State","Disabled","disabled","true"],
        ["State","Error","aria-invalid","true"],
        ["Value","Unchecked","value","(different from item)"],
        ["Value","Checked","value","(matches item value)"],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Tab","Move focus into the radio group"],
          ["Arrow Up / Arrow Down","Navigate between options (vertical)"],
          ["Arrow Left / Arrow Right","Navigate between options (horizontal)"],
          ["Space","Select the focused option"],
        ]}
        notes={[
          "Uses role='radiogroup' on the container and role='radio' on each item",
          "Arrow keys move selection — Tab moves focus out of the group entirely",
          "Wrap the group in a <fieldset> with <legend> so assistive technology announces the group question",
        ]}
      />

      <RelatedComponents items={[
        {
          name: "Checkbox",
          desc: "Checkbox allows multiple independent options to be selected simultaneously. Use Radio when exactly one option must be active at a time.",
        },
        {
          name: "Select",
          desc: "Select collapses options into a dropdown, saving vertical space for long lists. Use Radio when all options should be visible at once for easy comparison.",
        },
      ]} />
    </div>
  )
}

function TooltipDocs() {
  const [side, setSide] = useState("top")

  const bubblePos = {
    top:    "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left:   "right-full mr-2 top-1/2 -translate-y-1/2",
    right:  "left-full ml-2 top-1/2 -translate-y-1/2",
  }[side]

  const arrowCls = {
    top:    "absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-foreground",
    bottom: "absolute bottom-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-foreground",
    left:   "absolute left-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-l-foreground",
    right:  "absolute right-full top-1/2 -translate-y-1/2 border-[6px] border-transparent border-r-foreground",
  }[side]

  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Tooltip</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          A floating label that appears on hover or keyboard focus, providing brief supplementary context for UI elements without taking up permanent space. Non-interactive by design — for clickable floating content, use Popover instead.
        </p>
      </header>

      {/* 2. Explore Behavior */}
      <ExploreBehavior controls={[
        { label: "Side",  type: "select", options: ["top", "right", "bottom", "left"],    value: side,  onChange: setSide },
      ]}>
        <div className="flex items-center justify-center h-28">
          <div className="relative inline-flex items-center justify-center">
            {/* Trigger mock */}
            <div className="px-md py-xs rounded-md border border-border bg-muted text-sm text-foreground font-medium">
              Hover target
            </div>
            {/* Tooltip bubble mock */}
            <div className={`absolute ${bubblePos} px-sm py-2xs bg-foreground text-background text-xs rounded-md whitespace-nowrap shadow z-10`}>
              Tooltip text
              <div className={arrowCls} />
            </div>
          </div>
        </div>
      </ExploreBehavior>

      {/* 3. Installation */}
      <InstallationSection
        pkg={["@radix-ui/react-tooltip"]}
        importCode={`import {\n  Tooltip,\n  TooltipTrigger,\n  TooltipContent,\n  TooltipProvider,\n} from "@/components/ui/tooltip"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>

        {/* Phần A: Static previews — tooltip face always visible via open prop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example
            title="Default"
            description="Basic tooltip with short label. Wrap the root with TooltipProvider."
            code={`<TooltipProvider>\n  <Tooltip>\n    <TooltipTrigger asChild>\n      <Button variant="outline">Hover me</Button>\n    </TooltipTrigger>\n    <TooltipContent>Add to library</TooltipContent>\n  </Tooltip>\n</TooltipProvider>`}
          >
            <div className="flex items-center justify-center py-3xl pointer-events-none">
              <TooltipProvider delayDuration={0}>
                <Tooltip open>
                  <TooltipTrigger asChild>
                    <Button variant="outline">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent>Add to library</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Example>

          <Example
            title="Positions"
            description="Tooltip can appear on any side of the trigger using the side prop."
            code={`<TooltipContent side="top">Top</TooltipContent>\n<TooltipContent side="right">Right</TooltipContent>\n<TooltipContent side="bottom">Bottom</TooltipContent>\n<TooltipContent side="left">Left</TooltipContent>`}
          >
            <div className="flex flex-wrap gap-3xl items-center justify-center py-3xl pointer-events-none">
              <TooltipProvider delayDuration={0}>
                {(["top", "right", "bottom", "left"] as const).map(s => (
                  <Tooltip key={s} open>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm">{s.charAt(0).toUpperCase() + s.slice(1)}</Button>
                    </TooltipTrigger>
                    <TooltipContent side={s}>Tooltip on {s}</TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </Example>

          <Example
            title="On Icon Button"
            description="Standard pattern for icon-only action buttons — tooltip reveals the label."
            code={`<Tooltip>\n  <TooltipTrigger asChild>\n    <Button size="icon" variant="outline"><Pencil /></Button>\n  </TooltipTrigger>\n  <TooltipContent>Edit</TooltipContent>\n</Tooltip>`}
          >
            <div className="flex gap-3xl items-center justify-center py-3xl pointer-events-none">
              <TooltipProvider delayDuration={0}>
                <Tooltip open>
                  <TooltipTrigger asChild><Button size="icon" variant="outline"><Pencil className="size-4" /></Button></TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                <Tooltip open>
                  <TooltipTrigger asChild><Button size="icon" variant="outline"><Share className="size-4" /></Button></TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
                <Tooltip open>
                  <TooltipTrigger asChild><Button size="icon" variant="outline"><Trash2 className="size-4" /></Button></TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Example>

          <Example
            title="With Keyboard Shortcut"
            description="Tooltip content can include a kbd element to surface keyboard shortcuts alongside the action name."
            code={`<TooltipContent className="flex items-center gap-xs">\n  Copy link\n  <kbd className="px-1 py-0.5 bg-white/20 rounded text-[10px] font-mono">⌘C</kbd>\n</TooltipContent>`}
          >
            <div className="flex items-center justify-center py-3xl pointer-events-none">
              <TooltipProvider delayDuration={0}>
                <Tooltip open>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-xs">
                      <Copy className="size-4" />Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="flex items-center gap-xs">
                    Copy link <kbd className="px-1 py-0.5 bg-white/20 rounded text-[10px] font-mono">⌘C</kbd>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </Example>
        </div>

        {/* Phần B: Interactive Demo */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg space-y-md">
            <p className="text-xs text-muted-foreground">Hover over each element to trigger the tooltip.</p>
            <TooltipProvider>
              <div className="flex flex-wrap gap-sm">
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="outline" size="sm">Top</Button></TooltipTrigger>
                  <TooltipContent side="top">Tooltip on top</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="outline" size="sm">Right</Button></TooltipTrigger>
                  <TooltipContent side="right">Tooltip on right</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="outline" size="sm">Bottom</Button></TooltipTrigger>
                  <TooltipContent side="bottom">Tooltip on bottom</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="outline" size="sm">Left</Button></TooltipTrigger>
                  <TooltipContent side="left">Tooltip on left</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline"><Pencil className="size-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline"><Share className="size-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent>Share</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline"><Trash2 className="size-4" /></Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-xs">
                      <Copy className="size-4" />Copy
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="flex items-center gap-xs">
                    Copy link <kbd className="px-1 py-0.5 bg-white/20 rounded text-[10px] font-mono">⌘C</kbd>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">TooltipContent</h3>
        <PropsTable rows={[
          ["side",       '"top" | "right" | "bottom" | "left"', '"top"',    "Preferred side relative to the trigger"],
          ["sideOffset", "number",                               "4",        "Distance from trigger in px"],
          ["className",  "string",                               "—",        "Additional CSS classes for the bubble"],
          ["children",   "ReactNode",                            "—",        "Tooltip content — keep to 1 short phrase"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">Tooltip (Root)</h3>
        <PropsTable rows={[
          ["delayDuration", "number",  "700",       "Delay in ms before tooltip shows on hover"],
          ["open",          "boolean", "—",         "Controlled open state"],
          ["defaultOpen",   "boolean", "false",     "Uncontrolled initial open state"],
          ["onOpenChange",  "(open: boolean) => void", "—", "Callback when open state changes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">TooltipProvider</h3>
        <PropsTable rows={[
          ["delayDuration", "number", "700", "Default hover delay for all tooltips inside the provider"],
          ["skipDelayDuration", "number", "300", "How quickly to re-show tooltip when moving between triggers"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--foreground",        "zinc-950 / zinc-50",  "Tooltip background + arrow fill (inverted surface)"],
        ["--background",        "zinc-50 / zinc-950",  "Tooltip text (inverted foreground)"],
        ["--radius-md",         "10px",                "Border radius of the tooltip bubble"],
        ["--spacing-sm",        "12px",                "Horizontal padding (px-sm)"],
        ["--spacing-2xs",       "6px",                 "Vertical padding (py-2xs)"],
        ["--shadow-sm",         "0 1px 2px rgba(...)", "Bubble drop shadow"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          do:   "Use Tooltip for supplementary context on icon-only buttons and truncated text — label should be a short phrase or keyboard shortcut.",
          dont: "Put essential information only in tooltips. Tooltips are invisible on touch devices and hidden from users who rely on pointer interactions.",
        },
        {
          do:   "Keep tooltip text to one line — a noun phrase or imperative verb ('Edit profile', 'Delete item', 'Copy link ⌘C').",
          dont: "Place links, buttons, or form controls inside TooltipContent — use Popover for interactive floating content.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["Side",    "Top",    "side",    '"top"'],
        ["Side",    "Right",  "side",    '"right"'],
        ["Side",    "Bottom", "side",    '"bottom"'],
        ["Side",    "Left",   "side",    '"left"'],
        ["Content", "string", "children","tooltip label text"],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[
          ["Tab",   "Focus trigger to show tooltip"],
          ["Esc",   "Dismiss tooltip"],
        ]}
        notes={[
          "TooltipContent is linked to its trigger via aria-describedby — screen readers announce the tooltip text after the button label.",
          "Tooltip must not contain interactive elements (links, buttons, inputs) — use Popover for that pattern.",
          "Always provide visible labels for icon-only buttons via TooltipContent, but also consider aria-label on the trigger for completeness.",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Popover",    desc: "For interactive floating panels — supports forms, links, and custom content." },
        { name: "HoverCard",  desc: "For rich hover previews with structured content (avatar, bio, links)." },
        { name: "ContextMenu", desc: "For right-click triggered menus with actions and submenus." },
      ]} />

    </div>
  )
}

// ============================================================
// ADDITIONAL COMPONENT DOCS
// ============================================================

function CardDocs() {
  const [showHeader, setShowHeader] = useState(true)
  const [showDescription, setShowDescription] = useState(true)
  const [showFooter, setShowFooter] = useState(true)
  const [state, setState] = useState("default")
  const [size, setSize] = useState("default")
  const isHover = state === "hover"
  const cardSize = size === "default" ? undefined : (size as "md" | "lg")
  return (
    <div className="space-y-3xl">
      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Layout</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Card</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          A surface container for grouping related content — title, body, and actions — into a visually distinct section. Composed of sub-components (CardHeader, CardTitle, CardDescription, CardContent, CardFooter) for structured layouts, or use <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">size</code> for a flat container with built-in padding.
        </p>
      </header>

      {/* 2. Explore Behavior */}
      <ExploreBehavior controls={[
        { label: "State", type: "select", options: ["default", "hover"], value: state, onChange: setState },
        { label: "Size", type: "select", options: ["default", "md", "lg"], value: size, onChange: setSize },
        { label: "Show Header", type: "toggle", value: showHeader, onChange: setShowHeader },
        { label: "Show Description", type: "toggle", value: showDescription, onChange: setShowDescription, disabled: !showHeader },
        { label: "Show Footer", type: "toggle", value: showFooter, onChange: setShowFooter },
      ]}>
        <div className="w-full flex justify-center">
          <Card size={cardSize as "md" | "lg" | undefined} className={cn("w-full max-w-sm transition-shadow flex flex-col gap-sm", isHover && "shadow-md")}>
            {showHeader && (
              <div className="flex flex-col gap-2xs">
                <p className="text-sm font-medium text-foreground">Card Title</p>
                {showDescription && <p className="text-sm text-muted-foreground">Supporting description for this card.</p>}
              </div>
            )}
            <p className="text-sm text-muted-foreground">Card content area. Place any element here — text, charts, lists, or forms.</p>
            {showFooter && (
              <div className="flex justify-between pt-xs">
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button size="sm">Save</Button>
              </div>
            )}
          </Card>
        </div>
      </ExploreBehavior>

      {/* 3. Installation */}
      <InstallationSection
        pkg={[]}
        importCode={`import {\n  Card,\n  CardHeader,\n  CardTitle,\n  CardDescription,\n  CardContent,\n  CardFooter,\n} from "@/components/ui/card"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example
            title="Default"
            description="Basic card with header, content, and footer. Use for any general-purpose grouped content."
            code={`<Card>\n  <CardHeader>\n    <CardTitle>Project Alpha</CardTitle>\n    <CardDescription>Active project with 12 tasks remaining</CardDescription>\n  </CardHeader>\n  <CardContent>\n    <p className="text-sm">Last updated 2 hours ago.</p>\n  </CardContent>\n  <CardFooter className="flex justify-between">\n    <Button variant="ghost" size="sm">View</Button>\n    <Button size="sm">Open</Button>\n  </CardFooter>\n</Card>`}
          >
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Project Alpha</CardTitle>
                <CardDescription>Active project with 12 tasks remaining</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Last updated 2 hours ago. Team members: 5</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost" size="sm">View</Button>
                <Button size="sm">Open</Button>
              </CardFooter>
            </Card>
          </Example>

          <Example
            title="Stats / KPI"
            description="Metric card with large number and trend indicator. Use for dashboard overview panels."
            code={`<Card>\n  <CardHeader className="pb-2">\n    <CardDescription>Total Revenue</CardDescription>\n    <CardTitle className="text-2xl">$45,231.89</CardTitle>\n  </CardHeader>\n  <CardContent>\n    <p className="text-xs text-muted-foreground">+20.1% from last month</p>\n  </CardContent>\n</Card>`}
          >
            <div className="grid grid-cols-2 gap-md w-full">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Revenue</CardDescription>
                  <CardTitle className="text-2xl font-bold">$45,231</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Users</CardDescription>
                  <CardTitle className="text-2xl font-bold">2,350</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">+180 since last week</p>
                </CardContent>
              </Card>
            </div>
          </Example>

          <Example
            title="With Form"
            description="Card wrapping a form for create or edit flows. Footer holds submit and cancel actions."
            code={`<Card>\n  <CardHeader>\n    <CardTitle>Create project</CardTitle>\n    <CardDescription>Deploy your new project in one click.</CardDescription>\n  </CardHeader>\n  <CardContent className="space-y-md">\n    <div className="space-y-3xs">\n      <Label>Name</Label>\n      <Input placeholder="Project name" />\n    </div>\n    <div className="space-y-3xs">\n      <Label>Description</Label>\n      <Textarea placeholder="Describe your project" />\n    </div>\n  </CardContent>\n  <CardFooter className="flex justify-between">\n    <Button variant="outline">Cancel</Button>\n    <Button>Create</Button>\n  </CardFooter>\n</Card>`}
          >
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Create project</CardTitle>
                <CardDescription>Deploy your new project in one click.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-md">
                <div className="space-y-3xs">
                  <Label>Name</Label>
                  <Input placeholder="Project name" />
                </div>
                <div className="space-y-3xs">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe your project" />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline">Cancel</Button>
                <Button>Create</Button>
              </CardFooter>
            </Card>
          </Example>

          <Example
            title="Profile / Notification"
            description="Card with avatar for user profiles, notifications, or team member lists."
            code={`<Card>\n  <CardContent className="pt-md">\n    <div className="flex items-start gap-md">\n      <Avatar>\n        <AvatarFallback>JD</AvatarFallback>\n      </Avatar>\n      <div className="flex-1 space-y-1">\n        <p className="text-sm font-medium">Jane Doe</p>\n        <p className="text-xs text-muted-foreground">Requested access to Project Alpha</p>\n        <p className="text-xs text-muted-foreground">2 minutes ago</p>\n      </div>\n    </div>\n  </CardContent>\n  <CardFooter className="gap-xs">\n    <Button size="sm" className="flex-1">Approve</Button>\n    <Button variant="outline" size="sm" className="flex-1">Deny</Button>\n  </CardFooter>\n</Card>`}
          >
            <Card className="w-full max-w-sm">
              <CardContent className="pt-md">
                <div className="flex items-start gap-md">
                  <Avatar>
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">Jane Doe</p>
                    <p className="text-xs text-muted-foreground">Requested access to Project Alpha</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="gap-xs">
                <Button size="sm" className="flex-1">Approve</Button>
                <Button variant="outline" size="sm" className="flex-1">Deny</Button>
              </CardFooter>
            </Card>
          </Example>

          <Example
            title="Flat Container (size)"
            description='Use size="md" or size="lg" for cards with direct content — no sub-components. Matches the dashboard page card style.'
            code={`// no size prop — p-md (16px), used for standard dashboard cards\n<Card className="flex flex-col gap-sm">\n  <p className="text-sm font-medium text-foreground">Monthly Revenue</p>\n  <p className="text-2xl font-bold">$12,450</p>\n  <p className="text-xs text-muted-foreground">+8.2% from last month</p>\n</Card>\n\n// size="md" — p-xl (24px), for cards needing more breathing room\n<Card size="md" className="flex flex-col gap-sm">\n  <p className="text-sm font-medium text-foreground">Monthly Revenue</p>\n  <p className="text-2xl font-bold">$12,450</p>\n  <p className="text-xs text-muted-foreground">+8.2% from last month</p>\n</Card>\n\n// size="lg" — p-2xl (32px), for prominent feature cards\n<Card size="lg" className="flex flex-col gap-sm">\n  <p className="text-sm font-medium text-foreground">Annual Report</p>\n  <p className="text-2xl font-bold">$148,200</p>\n  <p className="text-xs text-muted-foreground">Full year 2024</p>\n</Card>`}
          >
            <div className="flex flex-col gap-md w-full">
              <Card size="md" className="flex flex-col gap-sm">
                <p className="text-xs text-muted-foreground font-mono">size="md" — p-xl (24px)</p>
                <p className="text-sm font-medium text-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-foreground">$12,450</p>
                <p className="text-xs text-muted-foreground">+8.2% from last month</p>
              </Card>
              <Card size="lg" className="flex flex-col gap-sm">
                <p className="text-xs text-muted-foreground font-mono">size="lg" — p-2xl (32px)</p>
                <p className="text-sm font-medium text-foreground">Annual Report</p>
                <p className="text-2xl font-bold text-foreground">$148,200</p>
                <p className="text-xs text-muted-foreground">Full year 2024</p>
              </Card>
            </div>
          </Example>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground font-body">
          Pure HTML composition — no external dependencies. Each sub-component extends{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">React.ComponentProps</code>{" "}
          for its corresponding HTML element.
        </p>
        <h3 className="font-semibold text-sm">Card</h3>
        <PropsTable rows={[
          ["size", '"md" | "lg"', '—', 'Flat container padding: no prop = p-md (16px), md = p-xl (24px), lg = p-2xl (32px). Use when placing content directly without sub-components.'],
          ["className", "string", '""', "Additional CSS classes applied to the outer container"],
          ["children", "ReactNode", "—", "CardHeader / CardContent / CardFooter, or direct content when size is set"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">CardHeader</h3>
        <PropsTable rows={[
          ["className", "string", '""', "Override default padding (p-md) and gap (gap-2xs)"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">CardTitle</h3>
        <PropsTable rows={[
          ["className", "string", '""', "Override default typo-heading-4 text-foreground"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">CardDescription</h3>
        <PropsTable rows={[
          ["className", "string", '""', "Override default typo-paragraph-sm text-muted-foreground"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">CardContent</h3>
        <PropsTable rows={[
          ["className", "string", '""', "Override default padding (p-md pt-0) — use pt-md when CardHeader is absent"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">CardFooter</h3>
        <PropsTable rows={[
          ["className", "string", '""', "Override default flex layout (flex items-center p-md pt-0)"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--card", "white / zinc-900", "Card background (bg-card)"],
        ["--card-foreground", "zinc-950 / zinc-50", "Card text color (text-card-foreground)"],
        ["--color-border", "zinc-200 / zinc-800", "Card border (border-border)"],
        ["--radius-xl", "12px", "Card border-radius (rounded-xl)"],
        ["--shadow-sm", "0 1px 2px rgba(...)", "Default card shadow (shadow-sm)"],
        ["--spacing-md", "16px", "Padding for CardHeader, CardContent, CardFooter (p-md)"],
        ["--spacing-xl", "24px", "Flat container padding — size=\"md\" (p-xl)"],
        ["--spacing-2xl", "32px", "Flat container padding — size=\"lg\" (p-2xl)"],
        ["--spacing-2xs", "4px", "Gap between CardTitle and CardDescription (gap-2xs)"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          do: 'Use size="md" when placing custom content directly inside Card without sub-components — matches the p-xl (24px) padding used across all dashboard and settings pages.',
          dont: 'Add p-xl via className to override padding — use the size prop instead so padding is a first-class documented prop, not an ad-hoc override.',
        },
        {
          do: "Use CardHeader for title + description, CardContent for the main body, CardFooter for actions. This keeps padding and structure consistent across all cards.",
          dont: "Put all content inside a single child div without sub-components when not using size — you lose the consistent padding contract.",
        },
        {
          do: "Keep each card focused on one topic or entity (a project, a user, a metric). Cards work best when they answer a single question.",
          dont: "Nest cards inside other cards — flatten the hierarchy and use other layout containers (sections, groups) instead.",
        },
        {
          do: "When CardHeader is absent, apply pt-md to CardContent to restore top spacing: <CardContent className='pt-md'>.",
          dont: "Rely on CardContent's default pt-0 when there is no CardHeader — content will sit flush against the card's top border.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["Card container", "bg-card, border-border, rounded-xl, shadow-sm", "Card", "rounded-xl border border-border bg-card text-card-foreground shadow-sm"],
        ["Card Header", "flex-col, gap-2xs, p-md", "CardHeader", "flex flex-col gap-2xs p-md"],
        ["Card Title", "typo-heading-4 (Geist/600 20px/28px)", "CardTitle", "typo-heading-4 text-foreground"],
        ["Card Description", "typo-paragraph-sm (Geist/400 14px/20px)", "CardDescription", "typo-paragraph-sm text-muted-foreground"],
        ["Card Content", "p-md, pt-0 when header present", "CardContent", "p-md pt-0"],
        ["Card Footer", "flex items-center, p-md, pt-0", "CardFooter", "flex items-center p-md pt-0"],
        ["Show Header", "true / false", "—", "Conditionally render CardHeader"],
        ["Show Footer", "true / false", "—", "Conditionally render CardFooter"],
        ["Hover Elevation", "shadow-md on hover", "—", "Add via className — shadow-md for elevated hover state"],
        ["Flat Container / md", "p-xl, direct children", "size=\"md\"", "p-xl — used on all dashboard & settings page cards"],
        ["Flat Container / lg", "p-2xl, direct children", "size=\"lg\"", "p-2xl — for prominent feature or chart cards"],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[
          ["Tab", "Move focus to interactive elements inside the card (buttons, inputs, links)"],
          ["Enter / Space", "Activate the focused interactive element within the card"],
        ]}
        notes={[
          "Card is a layout container (div) — not inherently interactive or focusable itself",
          "CardTitle renders as a div — if a semantic heading is needed, pass a heading element via asChild or override the rendered element",
          "Add aria-label to Card when multiple cards share similar titles on the same page",
          "When a card represents a clickable entity, wrap it in an anchor or button rather than adding onClick to the Card div",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Accordion", desc: "Collapsible content sections. Use when card content can be hidden to reduce cognitive load on the page." },
        { name: "Dialog", desc: "Modal overlay for focused content. Use when a card action needs a dedicated full-screen treatment." },
        { name: "Table", desc: "Structured row/column data display. Use instead of a grid of Cards when the content is tabular and needs scanning across fields." },
      ]} />
    </div>
  )
}

function DialogDocs() {
  const [type, setType] = useState("Desktop")
  const [showClose, setShowClose] = useState(true)
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
        { label: "Show Close", type: "toggle", value: showClose, onChange: setShowClose },
        { label: "Show Description", type: "toggle", value: showDesc, onChange: setShowDesc },
        { label: "Show Footer", type: "toggle", value: showFooter, onChange: setShowFooter },
      ]}>
        <div className={cn(
          "relative bg-card border border-border shadow w-full",
          isMobile ? "max-w-xs" : "max-w-lg",
          type === "Mobile Full Screen" ? "rounded-none" : "rounded-xl",
        )}>
          {isScrollable ? (
            <>
              <div className="p-md">
                {showClose && <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>}
                <div className={cn("flex flex-col gap-xs", showClose && "pr-xl")}>
                  <h3 className="sp-h4 text-foreground">Edit profile</h3>
                  {showDesc && <p className="typo-paragraph-sm text-muted-foreground">Make changes to your profile here. Click save when you're done.</p>}
                </div>
              </div>
              <div className={cn("border-t border-border p-md max-h-[160px] overflow-y-auto", showFooter && "border-b")}>
                <div className="grid gap-md">
                  <div className="space-y-3xs">
                    <Label className="typo-paragraph-sm font-medium">Name</Label>
                    <Input defaultValue="Pedro Duarte" onValueChange={() => {}} />
                  </div>
                  <div className="space-y-3xs">
                    <Label className="typo-paragraph-sm font-medium">Username</Label>
                    <Input defaultValue="@peduarte" onValueChange={() => {}} />
                  </div>
                  <div className="space-y-3xs">
                    <Label className="typo-paragraph-sm font-medium">Email</Label>
                    <Input defaultValue="pedro@example.com" onValueChange={() => {}} />
                  </div>
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
            <div className={cn("p-md", !showFooter && "pb-0")}>
              {showClose && <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>}
              <div className={cn("flex flex-col gap-xs", showClose && "pr-xl")}>
                <h3 className="sp-h4 text-foreground">Edit profile</h3>
                {showDesc && <p className="typo-paragraph-sm text-muted-foreground">Make changes to your profile here. Click save when you're done.</p>}
              </div>
              <div className={cn("grid gap-md pt-md", !showFooter && "pb-md")}>
                <div className="space-y-3xs">
                  <Label className="typo-paragraph-sm font-medium">Name</Label>
                  <Input defaultValue="Pedro Duarte" onValueChange={() => {}} />
                </div>
                <div className="space-y-3xs">
                  <Label className="typo-paragraph-sm font-medium">Username</Label>
                  <Input defaultValue="@peduarte" onValueChange={() => {}} />
                </div>
              </div>
              {showFooter && (
                <div className={cn("mt-md", isMobile ? "flex flex-col-reverse gap-xs" : "flex justify-end gap-xs")}>
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button size="sm">Save changes</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-dialog"]} importCode={`import {\n  Dialog,\n  DialogTrigger,\n  DialogContent,\n  DialogHeader,\n  DialogFooter,\n  DialogTitle,\n  DialogDescription,\n  DialogClose,\n} from "@/components/ui/dialog"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="With Form" description="Edit dialog with labeled inputs. The most common Dialog pattern for data entry tasks." code={`<Dialog>\n  <DialogTrigger asChild>\n    <Button variant="outline">Edit Profile</Button>\n  </DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Edit profile</DialogTitle>\n      <DialogDescription>Make changes to your profile here.</DialogDescription>\n    </DialogHeader>\n    <div className="grid gap-md pt-xs">\n      <div className="space-y-3xs">\n        <Label>Name</Label>\n        <Input defaultValue="John Doe" />\n      </div>\n      <div className="space-y-3xs">\n        <Label>Username</Label>\n        <Input defaultValue="@johndoe" />\n      </div>\n    </div>\n    <DialogFooter>\n      <Button>Save changes</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>`}>
          <div className="relative bg-card border border-border rounded-xl shadow pointer-events-none w-full p-md">
            <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>
            <div className="flex flex-col gap-xs pr-xl">
              <h3 className="sp-h4 text-foreground">Edit profile</h3>
              <p className="typo-paragraph-sm text-muted-foreground">Make changes to your profile here.</p>
            </div>
            <div className="grid gap-md pt-md">
              <div className="space-y-3xs">
                <Label className="typo-paragraph-sm font-medium">Name</Label>
                <Input defaultValue="John Doe" onValueChange={() => {}} />
              </div>
              <div className="space-y-3xs">
                <Label className="typo-paragraph-sm font-medium">Username</Label>
                <Input defaultValue="@johndoe" onValueChange={() => {}} />
              </div>
            </div>
            <div className="flex justify-end gap-xs mt-md">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm">Save changes</Button>
            </div>
          </div>
        </Example>
        <Example title="Destructive Confirmation" description="Confirms an irreversible action with a destructive primary button. Use Dialog (not AlertDialog) when users need to input data before confirming." code={`<Dialog>\n  <DialogTrigger asChild>\n    <Button variant="destructive">Delete account</Button>\n  </DialogTrigger>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Delete account</DialogTitle>\n      <DialogDescription>This cannot be undone.</DialogDescription>\n    </DialogHeader>\n    <DialogFooter>\n      <Button variant="outline">Cancel</Button>\n      <Button variant="destructive">Delete</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>`}>
          <div className="relative bg-card border border-border rounded-xl shadow pointer-events-none w-full p-md">
            <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>
            <div className="flex flex-col gap-xs pr-xl">
              <h3 className="sp-h4 text-foreground">Delete account</h3>
              <p className="typo-paragraph-sm text-muted-foreground">This action cannot be undone. All data will be permanently removed.</p>
            </div>
            <div className="flex justify-end gap-xs mt-md">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button variant="destructive" size="sm">Delete account</Button>
            </div>
          </div>
        </Example>
        <Example title="No Close Button" description="Forces user to act via footer buttons — no X to dismiss. Use for terms acceptance or required acknowledgements." code={`<DialogContent showCloseButton={false}>\n  <DialogHeader>\n    <DialogTitle>Terms of Service</DialogTitle>\n    <DialogDescription>Please read and accept before continuing.</DialogDescription>\n  </DialogHeader>\n  <DialogFooter>\n    <Button variant="outline">Decline</Button>\n    <Button>Accept</Button>\n  </DialogFooter>\n</DialogContent>`}>
          <div className="relative bg-card border border-border rounded-xl shadow pointer-events-none w-full p-md">
            <div className="flex flex-col gap-xs">
              <h3 className="sp-h4 text-foreground">Terms of Service</h3>
              <p className="typo-paragraph-sm text-muted-foreground">Please read and accept the terms before continuing.</p>
            </div>
            <div className="flex justify-end gap-xs mt-md">
              <Button variant="outline" size="sm">Decline</Button>
              <Button size="sm">Accept</Button>
            </div>
          </div>
        </Example>
        <Example title="Info Only" description="Informational dialog with no footer — close via X only. Use for version notes, announcements, or release info." code={`<DialogContent>\n  <DialogHeader>\n    <DialogTitle>Update Available</DialogTitle>\n  </DialogHeader>\n  <p className="typo-paragraph-sm text-muted-foreground">\n    Version 2.4.0 is ready. Restart the app to apply changes.\n  </p>\n</DialogContent>`}>
          <div className="relative bg-card border border-border rounded-xl shadow pointer-events-none w-full p-md">
            <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>
            <div className="pr-xl">
              <h3 className="sp-h4 text-foreground mb-xs">Update Available</h3>
              <p className="typo-paragraph-sm text-muted-foreground">Version 2.4.0 is ready. Restart the app to apply changes.</p>
            </div>
          </div>
        </Example>
        </div>

        {/* Interactive Demo */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg flex flex-wrap gap-sm">
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" size="sm">With Form</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>Make changes to your profile here.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-md pt-xs">
                  <div className="space-y-3xs">
                    <Label className="typo-paragraph-sm font-medium">Name</Label>
                    <Input defaultValue="John Doe" />
                  </div>
                  <div className="space-y-3xs">
                    <Label className="typo-paragraph-sm font-medium">Username</Label>
                    <Input defaultValue="@johndoe" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
                  <Button size="sm">Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild><Button variant="destructive" size="sm">Destructive</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete account</DialogTitle>
                  <DialogDescription>This action cannot be undone. All data will be permanently removed.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline" size="sm">Cancel</Button></DialogClose>
                  <Button variant="destructive" size="sm">Delete account</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" size="sm">No Close Button</Button></DialogTrigger>
              <DialogContent showCloseButton={false}>
                <DialogHeader>
                  <DialogTitle>Terms of Service</DialogTitle>
                  <DialogDescription>Please read and accept the terms before continuing.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline" size="sm">Decline</Button></DialogClose>
                  <DialogClose asChild><Button size="sm">Accept</Button></DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild><Button variant="outline" size="sm">Info Only</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Available</DialogTitle>
                </DialogHeader>
                <p className="typo-paragraph-sm text-muted-foreground">Version 2.4.0 is ready. Restart the app to apply changes.</p>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">Dialog (Root)</h3>
        <PropsTable rows={[
          ["open", "boolean", "—", "Controlled open state"],
          ["onOpenChange", "(open: boolean) => void", "—", "Callback fired when open state changes"],
          ["modal", "boolean", "true", "Block interaction with content outside the dialog"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DialogContent</h3>
        <PropsTable rows={[
          ["showCloseButton", "boolean", "true", "Show/hide the X close button in the top-right corner"],
          ["onOpenAutoFocus", "(e: Event) => void", "—", "Override which element receives focus on open"],
          ["onEscapeKeyDown", "(e: KeyboardEvent) => void", "—", "Intercept Escape key — call e.preventDefault() to block close"],
          ["forceMount", "boolean", "—", "Keep content mounted for external animation libraries"],
          ["className", "string", '""', "Additional CSS classes on the content panel"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DialogTrigger</h3>
        <PropsTable rows={[
          ["asChild", "boolean", "false", "Merge trigger behavior onto the child element instead of wrapping"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--card","#252522 (dark)","Dialog content background"],
        ["--border","zinc-700/60 (dark)","Content border"],
        ["--muted-foreground","zinc-400","Description + placeholder text"],
        ["--ring","violet-600/30","Focus ring on close button"],
        ["--radius-xl","12px","Content border radius (sm:rounded-xl)"],
        ["black/50","—","Overlay backdrop opacity"],
      ]} />
      <BestPractices items={[
        {do:"Use Dialog for non-destructive tasks (forms, data entry, info). Use AlertDialog for blocking confirmations.",dont:"Use Dialog for critical confirmations — it can be dismissed by clicking the overlay, which is dangerous for irreversible actions."},
        {do:"Keep dialog content focused on a single task. Use a multi-step form pattern if more steps are needed.",dont:"Nest dialogs or chain overlays — flatten the flow instead."},
        {do:"Always include a DialogTitle even if visually hidden — required for screen readers (aria-labelledby).",dont:"Omit DialogTitle or DialogDescription — dialog content will be inaccessible to assistive technologies."},
      ]} />
      <FigmaMapping rows={[
        ["Overlay","Black 50%","DialogOverlay","fixed inset-0 z-50 bg-black/50"],
        ["Content BG","bg-card, border, shadow","DialogContent","sm:max-w-lg sm:rounded-xl p-md gap-xs"],
        ["Header","Title + Description stack","DialogHeader","flex flex-col gap-xs"],
        ["Title","sp-h4 (16px/600)","DialogTitle","sp-h4 text-foreground"],
        ["Description","paragraph-sm","DialogDescription","typo-paragraph-sm text-muted-foreground"],
        ["Footer","Action buttons row","DialogFooter","flex justify-end gap-xs (desktop) / flex-col-reverse (mobile)"],
        ["Close button","X icon, top-right","showCloseButton={true}","absolute right-md top-md, size-md icon"],
        ["Animation","Zoom + Fade","data-[state=open/closed]","zoom-in-95, fade-in-0 / fade-out-0"],
      ]} />
      <AccessibilityInfo keyboard={[["Tab","Move focus between interactive elements (focus trapped)"],["Shift+Tab","Move focus backwards"],["Escape","Close the dialog (unless overridden)"],["Enter / Space","Activate focused button"]]} notes={["Focus is trapped inside the dialog when open","Focus returns to the trigger element on close","role=\"dialog\" aria-modal=\"true\" on DialogContent","DialogTitle is required — linked via aria-labelledby","DialogDescription linked via aria-describedby"]} />
      <RelatedComponents items={[
        {name:"AlertDialog",desc:"Non-dismissible confirmation — cannot be closed by clicking the overlay. Use for destructive actions."},
        {name:"Sheet",desc:"Slide-in side panel — better for detail views, filters, and larger content areas."},
        {name:"Drawer",desc:"Bottom sheet variant — mobile-friendly slide-up for forms and selections."},
      ]} />
    </div>
  )
}

function SheetDocs() {
  const [side, setSide] = useState("right")
  const [showDesc, setShowDesc] = useState(true)
  const [showFooter, setShowFooter] = useState(true)
  const [showClose, setShowClose] = useState(true)

  const isVertical = side === "right" || side === "left"

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Sheet</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A slide-out panel that enters from any edge of the screen — right, left, top, or bottom. Use for supplementary content like detail views, filters, or navigation that shouldn't block the main flow.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Side", type: "select", options: ["right", "left", "top", "bottom"], value: side, onChange: setSide },
        { label: "Show Close", type: "toggle", value: showClose, onChange: setShowClose },
        { label: "Show Description", type: "toggle", value: showDesc, onChange: setShowDesc },
        { label: "Show Footer", type: "toggle", value: showFooter, onChange: setShowFooter },
      ]}>
        <div className={cn(
          "relative bg-card",
          isVertical
            ? "w-64 min-h-[280px] flex flex-col p-md"
            : "w-full p-md",
          side === "right" && "border-l border-border ml-auto",
          side === "left" && "border-r border-border mr-auto",
          side === "top" && "border-b border-border",
          side === "bottom" && "border-t border-border",
        )}>
          {showClose && <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>}
          <div className={cn("flex flex-col gap-xs", showClose && "pr-xl")}>
            <h3 className="sp-h4 text-foreground">
              {side === "right" && "Edit Settings"}
              {side === "left" && "Navigation"}
              {side === "top" && "Search"}
              {side === "bottom" && "Quick Actions"}
            </h3>
            {showDesc && <p className="typo-paragraph-sm text-muted-foreground">
              {side === "right" && "Update your account preferences."}
              {side === "left" && "Navigate between sections."}
              {side === "top" && "Search across all content."}
              {side === "bottom" && "Common actions and shortcuts."}
            </p>}
          </div>
          {isVertical && (
            <div className="flex flex-col gap-xs mt-md flex-1">
              <div className="space-y-3xs">
                <Label className="text-sm">Theme</Label>
                <div className="h-8 rounded-md border border-border bg-muted/30 w-full" />
              </div>
              <div className="space-y-3xs">
                <Label className="text-sm">Language</Label>
                <div className="h-8 rounded-md border border-border bg-muted/30 w-full" />
              </div>
            </div>
          )}
          {showFooter && (
            <div className={cn("flex gap-xs", isVertical ? "mt-auto pt-md" : "mt-md", "justify-end")}>
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm">Save</Button>
            </div>
          )}
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-dialog"]} importCode={`import {\n  Sheet,\n  SheetTrigger,\n  SheetContent,\n  SheetHeader,\n  SheetFooter,\n  SheetTitle,\n  SheetDescription,\n  SheetClose,\n} from "@/components/ui/sheet"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Right — Edit Form" description="Settings or profile edit panel. Default side — most common pattern for detail views." code={`<Sheet>\n  <SheetTrigger asChild>\n    <Button variant="outline">Edit Profile</Button>\n  </SheetTrigger>\n  <SheetContent>\n    <SheetHeader>\n      <SheetTitle>Edit profile</SheetTitle>\n      <SheetDescription>Update your account details.</SheetDescription>\n    </SheetHeader>\n    <div className="space-y-md py-md">\n      <div className="space-y-3xs">\n        <Label>Name</Label>\n        <Input defaultValue="John Doe" />\n      </div>\n    </div>\n    <SheetFooter>\n      <Button>Save changes</Button>\n    </SheetFooter>\n  </SheetContent>\n</Sheet>`}>
          <div className="relative bg-card border-l border-border pointer-events-none w-full max-w-xs ml-auto p-md min-h-[200px] flex flex-col">
            <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>
            <div className="flex flex-col gap-xs pr-xl">
              <h3 className="sp-h4 text-foreground">Edit profile</h3>
              <p className="typo-paragraph-sm text-muted-foreground">Update your account details.</p>
            </div>
            <div className="space-y-3xs mt-md flex-1">
              <Label className="text-sm">Name</Label>
              <Input defaultValue="John Doe" onValueChange={() => {}} />
            </div>
            <div className="flex justify-end gap-xs mt-md">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm">Save changes</Button>
            </div>
          </div>
        </Example>
        <Example title="Left — Navigation" description="Side navigation or menu panel. Use left side to match natural reading flow." code={`<Sheet>\n  <SheetTrigger asChild>\n    <Button variant="outline">Open Nav</Button>\n  </SheetTrigger>\n  <SheetContent side="left">\n    <SheetHeader>\n      <SheetTitle>Navigation</SheetTitle>\n    </SheetHeader>\n    <nav className="flex flex-col gap-xs mt-md">\n      <Button variant="ghost" className="justify-start">Dashboard</Button>\n      <Button variant="ghost" className="justify-start">Analytics</Button>\n      <Button variant="ghost" className="justify-start">Settings</Button>\n    </nav>\n  </SheetContent>\n</Sheet>`}>
          <div className="relative bg-card border-r border-border pointer-events-none w-full max-w-xs mr-auto p-md min-h-[200px] flex flex-col">
            <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>
            <h3 className="sp-h4 text-foreground mb-md pr-xl">Navigation</h3>
            <div className="flex flex-col gap-xs">
              {["Dashboard", "Analytics", "Orders", "Settings"].map(item => (
                <div key={item} className="flex items-center gap-xs px-sm py-xs rounded-md text-sm text-muted-foreground hover:bg-muted/30">{item}</div>
              ))}
            </div>
          </div>
        </Example>
        <Example title="Top — Search" description="Full-width search or filter panel from the top edge." code={`<Sheet>\n  <SheetTrigger asChild>\n    <Button variant="outline">Search</Button>\n  </SheetTrigger>\n  <SheetContent side="top">\n    <SheetHeader>\n      <SheetTitle>Search</SheetTitle>\n    </SheetHeader>\n    <Input className="mt-md" placeholder="Type to search..." />\n  </SheetContent>\n</Sheet>`}>
          <div className="relative bg-card border-b border-border pointer-events-none w-full p-md">
            <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>
            <h3 className="sp-h4 text-foreground mb-md pr-xl">Search</h3>
            <Input placeholder="Search orders, products, users..." onValueChange={() => {}} />
          </div>
        </Example>
        <Example title="Bottom — Quick Actions" description="Action sheet from the bottom edge. Ideal for mobile-style contextual menus." code={`<Sheet>\n  <SheetTrigger asChild>\n    <Button variant="outline">Actions</Button>\n  </SheetTrigger>\n  <SheetContent side="bottom">\n    <SheetHeader>\n      <SheetTitle>Quick Actions</SheetTitle>\n    </SheetHeader>\n    <div className="grid grid-cols-2 gap-xs mt-md">\n      <Button variant="outline">Export CSV</Button>\n      <Button variant="outline">Print</Button>\n    </div>\n  </SheetContent>\n</Sheet>`}>
          <div className="relative bg-card border-t border-border pointer-events-none w-full p-md">
            <div className="absolute right-md top-md opacity-70"><X className="size-md" /></div>
            <h3 className="sp-h4 text-foreground mb-md pr-xl">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-xs">
              <Button variant="outline" size="sm">Export CSV</Button>
              <Button variant="outline" size="sm">Print</Button>
              <Button variant="outline" size="sm">Duplicate</Button>
              <Button variant="destructive" size="sm">Delete</Button>
            </div>
          </div>
        </Example>
        </div>

        {/* Interactive Demo */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg flex flex-wrap gap-sm">
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" size="sm">Right</Button></SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Edit profile</SheetTitle>
                  <SheetDescription>Update your account details.</SheetDescription>
                </SheetHeader>
                <div className="space-y-3xs mt-md">
                  <Label>Name</Label>
                  <Input defaultValue="John Doe" />
                </div>
                <SheetFooter className="mt-md">
                  <SheetClose asChild><Button variant="outline" size="sm">Cancel</Button></SheetClose>
                  <Button size="sm">Save changes</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" size="sm">Left</Button></SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-xs mt-md">
                  {["Dashboard", "Analytics", "Orders", "Settings"].map(item => (
                    <Button key={item} variant="ghost" className="justify-start">{item}</Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" size="sm">Top</Button></SheetTrigger>
              <SheetContent side="top">
                <SheetHeader>
                  <SheetTitle>Search</SheetTitle>
                </SheetHeader>
                <Input className="mt-md" placeholder="Type to search..." />
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild><Button variant="outline" size="sm">Bottom</Button></SheetTrigger>
              <SheetContent side="bottom">
                <SheetHeader>
                  <SheetTitle>Quick Actions</SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-2 gap-xs mt-md">
                  <Button variant="outline" size="sm">Export CSV</Button>
                  <Button variant="outline" size="sm">Print</Button>
                  <Button variant="outline" size="sm">Duplicate</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">Sheet (Root)</h3>
        <PropsTable rows={[
          ["open", "boolean", "—", "Controlled open state"],
          ["onOpenChange", "(open: boolean) => void", "—", "Callback fired when open state changes"],
          ["modal", "boolean", "true", "Block interaction outside the sheet panel"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">SheetContent</h3>
        <PropsTable rows={[
          ["side", '"top" | "right" | "bottom" | "left"', '"right"', "Edge the panel slides in from"],
          ["onEscapeKeyDown", "(e: KeyboardEvent) => void", "—", "Intercept Escape key — call e.preventDefault() to block close"],
          ["forceMount", "boolean", "—", "Keep panel mounted for external animation libraries"],
          ["className", "string", '""', "Additional CSS classes on the panel"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">SheetTrigger</h3>
        <PropsTable rows={[
          ["asChild", "boolean", "false", "Merge trigger behavior onto the child element"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--card","#252522 (dark)","Panel background"],
        ["--border","zinc-700/60 (dark)","Panel edge border"],
        ["--muted-foreground","zinc-400","Description text"],
        ["--ring","violet-600/30","Focus ring on close button"],
        ["black/50","—","Overlay backdrop opacity"],
      ]} />
      <BestPractices items={[
        {do:"Use right side for detail views and edit forms — matches natural reading direction.",dont:"Use Sheet for critical confirmations — use AlertDialog which cannot be dismissed by overlay click."},
        {do:"Use left side for navigation menus — consistent with sidebar patterns users expect.",dont:"Put too much content in a Sheet — if it needs a full form, use a dedicated page instead."},
        {do:"Always include SheetTitle even if visually hidden — required for screen reader accessibility.",dont:"Use Sheet when the task requires the user's full attention — use Dialog for that."},
      ]} />
      <FigmaMapping rows={[
        ["Overlay","Black 50%","SheetOverlay","fixed inset-0 z-50 bg-black/50"],
        ["Panel right","inset-y-0 right-0","side=\"right\"","border-l border-border, w-3/4 sm:max-w-sm, slide-in-from-right"],
        ["Panel left","inset-y-0 left-0","side=\"left\"","border-r border-border, w-3/4 sm:max-w-sm, slide-in-from-left"],
        ["Panel top","inset-x-0 top-0","side=\"top\"","border-b border-border, slide-in-from-top"],
        ["Panel bottom","inset-x-0 bottom-0","side=\"bottom\"","border-t border-border, slide-in-from-bottom"],
        ["Header","Title + Description","SheetHeader","flex flex-col gap-xs"],
        ["Title","sp-h4 (16px/600)","SheetTitle","sp-h4 text-foreground"],
        ["Close button","X icon, top-right","SheetClose (auto)","absolute right-md top-md, size-md icon"],
        ["Animation","Slide duration","data-[state]","open: 500ms, close: 300ms ease-in-out"],
      ]} />
      <AccessibilityInfo keyboard={[["Tab","Move focus within the panel (focus trapped)"],["Shift+Tab","Move focus backwards"],["Escape","Close the sheet"]]} notes={["Focus trapped inside when open","Returns focus to trigger on close","role=\"dialog\" aria-modal=\"true\" on SheetContent","Overlay click closes by default","SheetTitle linked via aria-labelledby — always required"]} />
      <RelatedComponents items={[
        {name:"Dialog",desc:"Centered modal — better for focused tasks that need user's full attention."},
        {name:"Drawer",desc:"Bottom sheet for mobile — use Drawer instead of side=\"bottom\" for richer mobile UX."},
        {name:"AlertDialog",desc:"Non-dismissible confirmation — use when user must explicitly choose an action."},
      ]} />
    </div>
  )
}

function DropdownDocs() {
  const [showLabel, setShowLabel] = useState(true)
  const [showIcons, setShowIcons] = useState(true)
  const [showSeparator, setShowSeparator] = useState(true)
  const [showDestructive, setShowDestructive] = useState(true)

  // Dropdown Item explore state
  const [ddItemType, setDdItemType] = useState("default")
  const [ddItemState, setDdItemState] = useState("default")

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Dropdown Menu</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A floating menu of contextual actions triggered by a button click. Supports labels, separators, checkboxes, radio groups, submenus, and keyboard shortcuts.</p>
      </header>

      {/* 2. Explore Behavior — tabbed: Dropdown Menu | Dropdown Item */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
        <Tabs defaultValue="dropdown-group" className="w-full">
          <div className="border border-border rounded-xl overflow-hidden">
            <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
              <TabsTrigger value="dropdown-group" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Dropdown Menu</span></TabsTrigger>
              <TabsTrigger value="dropdown-item" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Dropdown Item</span></TabsTrigger>
            </TabsList>

            {/* Tab 1: Dropdown Menu */}
            <TabsContent value="dropdown-group" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <div className="bg-card border border-border rounded-md shadow-md w-48 p-1">
                    {showLabel && (
                      <div className="px-xs py-2xs typo-paragraph-sm-bold text-muted-foreground">My Account</div>
                    )}
                    {showLabel && showSeparator && <div className="-mx-1 my-1 h-px bg-muted" />}
                    <div className={cn("flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm", ddItemType === "destructive" ? "text-destructive" : "", ddItemState === "hover" && "bg-muted", ddItemState === "disabled" && "opacity-50")}>
                      {(showIcons || ddItemType === "with-icon") && (ddItemType === "destructive" ? <Trash2 className="size-md" /> : <User className="size-md" />)} {ddItemType === "destructive" ? "Delete" : "Profile"}
                      {ddItemType === "with-shortcut" && <span className="ml-auto typo-paragraph-mini tracking-widest opacity-60">⌘P</span>}
                    </div>
                    <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm">
                      {showIcons && <Settings className="size-md" />} Settings
                    </div>
                    <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm">
                      {showIcons && <Bell className="size-md" />} Notifications
                    </div>
                    {showSeparator && <div className="-mx-1 my-1 h-px bg-muted" />}
                    {showDestructive && (
                      <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm text-destructive">
                        {showIcons && <Trash2 className="size-md" />} Delete Account
                      </div>
                    )}
                  </div>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-wrap gap-x-lg gap-y-xs">
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Show Label</Label>
                      <Switch checked={showLabel} onCheckedChange={setShowLabel} />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Show Icons</Label>
                      <Switch checked={showIcons} onCheckedChange={setShowIcons} />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Show Separator</Label>
                      <Switch checked={showSeparator} onCheckedChange={setShowSeparator} />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Show Destructive</Label>
                      <Switch checked={showDestructive} onCheckedChange={setShowDestructive} />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Dropdown Item */}
            <TabsContent value="dropdown-item" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <div>
                    <div className="bg-card border border-border rounded-md shadow-md w-48 p-1">
                      {ddItemType === "destructive" ? (
                        <div className={cn("flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm text-destructive", ddItemState === "hover" && "bg-muted", ddItemState === "disabled" && "opacity-50")}>
                          <Trash2 className="size-md" /> Delete Account
                        </div>
                      ) : ddItemType === "with-icon" ? (
                        <div className={cn("flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm", ddItemState === "hover" && "bg-muted", ddItemState === "disabled" && "opacity-50")}>
                          <User className="size-md" /> Profile
                        </div>
                      ) : ddItemType === "with-shortcut" ? (
                        <div className={cn("flex items-center rounded-sm px-xs py-2xs typo-paragraph-sm", ddItemState === "hover" && "bg-muted", ddItemState === "disabled" && "opacity-50")}>
                          Settings <span className="ml-auto typo-paragraph-mini tracking-widest opacity-60">⌘,</span>
                        </div>
                      ) : (
                        <div className={cn("flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm", ddItemState === "hover" && "bg-muted", ddItemState === "disabled" && "opacity-50")}>
                          Profile
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Type</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["default", "with-icon", "destructive", "with-shortcut"].map(t => (
                          <button key={t} onClick={() => setDdItemType(t)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", ddItemType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{t.replace("with-", "with ")}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">State</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["default", "hover", "disabled"].map(s => (
                          <button key={s} onClick={() => setDdItemState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", ddItemState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>

      <InstallationSection pkg={["@radix-ui/react-dropdown-menu"]} importCode={`import {\n  DropdownMenu,\n  DropdownMenuTrigger,\n  DropdownMenuContent,\n  DropdownMenuItem,\n  DropdownMenuLabel,\n  DropdownMenuSeparator,\n  DropdownMenuShortcut,\n  DropdownMenuCheckboxItem,\n  DropdownMenuRadioGroup,\n  DropdownMenuRadioItem,\n  DropdownMenuSub,\n  DropdownMenuSubTrigger,\n  DropdownMenuSubContent,\n  DropdownMenuGroup,\n} from "@/components/ui/dropdown-menu"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Account Menu" description="Label, icons, separator, and a destructive action — typical user account dropdown." code={`<DropdownMenu>\n  <DropdownMenuTrigger asChild>\n    <Button variant="outline">My Account</Button>\n  </DropdownMenuTrigger>\n  <DropdownMenuContent className="w-48">\n    <DropdownMenuLabel>My Account</DropdownMenuLabel>\n    <DropdownMenuSeparator />\n    <DropdownMenuItem>\n      <User /> Profile\n    </DropdownMenuItem>\n    <DropdownMenuItem>\n      <Settings /> Settings\n    </DropdownMenuItem>\n    <DropdownMenuSeparator />\n    <DropdownMenuItem className="text-destructive">\n      <Trash2 /> Delete Account\n    </DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md w-48 p-1">
              <div className="px-xs py-2xs typo-paragraph-sm-bold text-muted-foreground">My Account</div>
              <div className="-mx-1 my-1 h-px bg-muted" />
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm bg-muted"><User className="size-md" /> Profile</div>
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm"><Settings className="size-md" /> Settings</div>
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm"><Bell className="size-md" /> Notifications</div>
              <div className="-mx-1 my-1 h-px bg-muted" />
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm text-destructive"><Trash2 className="size-md" /> Delete Account</div>
            </div>
          </Example>
          <Example title="Row Actions" description="Compact action menu for data table rows — triggered by a ⋯ icon button." code={`<DropdownMenu>\n  <DropdownMenuTrigger asChild>\n    <Button variant="ghost" size="icon">\n      <MoreHorizontal />\n    </Button>\n  </DropdownMenuTrigger>\n  <DropdownMenuContent align="end" className="w-40">\n    <DropdownMenuItem><Pencil /> Edit</DropdownMenuItem>\n    <DropdownMenuItem><Copy /> Duplicate</DropdownMenuItem>\n    <DropdownMenuItem><Share /> Share</DropdownMenuItem>\n    <DropdownMenuSeparator />\n    <DropdownMenuItem className="text-destructive">\n      <Trash2 /> Delete\n    </DropdownMenuItem>\n  </DropdownMenuContent>\n</DropdownMenu>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md w-40 p-1">
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm bg-muted"><Pencil className="size-md" /> Edit</div>
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm"><Copy className="size-md" /> Duplicate</div>
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm"><Share className="size-md" /> Share</div>
              <div className="-mx-1 my-1 h-px bg-muted" />
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm text-destructive"><Trash2 className="size-md" /> Delete</div>
            </div>
          </Example>
          <Example title="With Keyboard Shortcuts" description="Show keyboard shortcuts via DropdownMenuShortcut for power-user affordance." code={`<DropdownMenuContent>\n  <DropdownMenuItem>\n    <User /> Profile\n    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>\n  </DropdownMenuItem>\n  <DropdownMenuItem>\n    <Settings /> Settings\n    <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>\n  </DropdownMenuItem>\n  <DropdownMenuSeparator />\n  <DropdownMenuItem>\n    <X /> Close\n    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>\n  </DropdownMenuItem>\n</DropdownMenuContent>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md w-48 p-1">
              <div className="flex items-center rounded-sm px-xs py-2xs typo-paragraph-sm bg-muted"><User className="size-md mr-xs" /> Profile <span className="ml-auto typo-paragraph-mini tracking-widest opacity-60">⇧⌘P</span></div>
              <div className="flex items-center rounded-sm px-xs py-2xs typo-paragraph-sm"><Settings className="size-md mr-xs" /> Settings <span className="ml-auto typo-paragraph-mini tracking-widest opacity-60">⌘,</span></div>
              <div className="flex items-center rounded-sm px-xs py-2xs typo-paragraph-sm"><Bell className="size-md mr-xs" /> Notifications <span className="ml-auto typo-paragraph-mini tracking-widest opacity-60">⌘N</span></div>
              <div className="-mx-1 my-1 h-px bg-muted" />
              <div className="flex items-center rounded-sm px-xs py-2xs typo-paragraph-sm"><X className="size-md mr-xs" /> Close <span className="ml-auto typo-paragraph-mini tracking-widest opacity-60">⇧⌘Q</span></div>
            </div>
          </Example>
          <Example title="With Checkboxes" description="Checkbox items for toggling view preferences such as column visibility." code={`<DropdownMenuContent>\n  <DropdownMenuLabel>Columns</DropdownMenuLabel>\n  <DropdownMenuSeparator />\n  <DropdownMenuCheckboxItem checked>\n    Status\n  </DropdownMenuCheckboxItem>\n  <DropdownMenuCheckboxItem checked>\n    Email\n  </DropdownMenuCheckboxItem>\n  <DropdownMenuCheckboxItem>\n    Role\n  </DropdownMenuCheckboxItem>\n</DropdownMenuContent>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md w-48 p-1">
              <div className="px-xs py-2xs typo-paragraph-sm-bold text-muted-foreground">Columns</div>
              <div className="-mx-1 my-1 h-px bg-muted" />
              <div className="relative flex items-center rounded-sm py-2xs pl-2xl pr-xs typo-paragraph-sm bg-muted">
                <span className="absolute left-xs flex size-3.5 items-center justify-center"><Check className="size-md" /></span> Status
              </div>
              <div className="relative flex items-center rounded-sm py-2xs pl-2xl pr-xs typo-paragraph-sm">
                <span className="absolute left-xs flex size-3.5 items-center justify-center"><Check className="size-md" /></span> Email
              </div>
              <div className="relative flex items-center rounded-sm py-2xs pl-2xl pr-xs typo-paragraph-sm opacity-50">
                <span className="absolute left-xs flex size-3.5 items-center justify-center" /> Role
              </div>
            </div>
          </Example>
        </div>

        {/* Interactive Demo */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg flex flex-wrap gap-sm">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Account Menu</Button></DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem><User /> Profile</DropdownMenuItem>
                <DropdownMenuItem><Settings /> Settings</DropdownMenuItem>
                <DropdownMenuItem><Bell /> Notifications</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive"><Trash2 /> Delete Account</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal /> Row Actions</Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem><Pencil /> Edit</DropdownMenuItem>
                <DropdownMenuItem><Copy /> Duplicate</DropdownMenuItem>
                <DropdownMenuItem><Share /> Share</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive"><Trash2 /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="sm">With Shortcuts</Button></DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem><User /> Profile <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem><Settings /> Settings <DropdownMenuShortcut>⌘,</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuItem><Bell /> Notifications <DropdownMenuShortcut>⌘N</DropdownMenuShortcut></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem><X /> Close <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="outline" size="sm">With Checkboxes</Button></DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>Status</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem checked>Email</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Role</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">DropdownMenuContent</h3>
        <PropsTable rows={[
          ["align", '"start" | "center" | "end"', '"center"', "Horizontal alignment relative to the trigger"],
          ["sideOffset", "number", "4", "Gap in px between trigger and menu"],
          ["className", "string", "—", "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DropdownMenuItem</h3>
        <PropsTable rows={[
          ["inset", "boolean", "false", "Add left padding to align text with icon items"],
          ["disabled", "boolean", "false", "Disable the item — grays it out and prevents interaction"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DropdownMenuCheckboxItem</h3>
        <PropsTable rows={[
          ["checked", "boolean | 'indeterminate'", "false", "Controlled checked state"],
          ["onCheckedChange", "(checked: boolean) => void", "—", "Callback when checked state changes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DropdownMenuRadioItem</h3>
        <PropsTable rows={[
          ["value", "string", "—", "The value of this item within its DropdownMenuRadioGroup"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DropdownMenuSubTrigger</h3>
        <PropsTable rows={[
          ["inset", "boolean", "false", "Add left padding for icon alignment"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--card", "white / #252522", "Menu panel background"],
        ["--border", "zinc-200 / zinc-800", "Menu panel border"],
        ["--muted", "zinc-100 / zinc-800", "Hovered item background and separator color"],
        ["--foreground", "zinc-900 / zinc-50", "Default item text color"],
        ["--muted-foreground", "zinc-500", "Label text color"],
        ["--destructive", "red-500", "Destructive item text color"],
      ]} />

      <BestPractices items={[
        { do: "Use DropdownMenu for contextual actions tied to a specific element — not for primary navigation.", dont: "Use DropdownMenu as a nav menu — use links, Tabs, or a Sidebar instead." },
        { do: "Group related items with DropdownMenuSeparator and DropdownMenuLabel so users can scan quickly.", dont: "Put more than 10 items in a flat list without grouping — add submenus or split the menu." },
        { do: "Add DropdownMenuShortcut to items that have keyboard shortcuts — reinforces keyboard discoverability.", dont: "Show keyboard shortcuts that don't actually work — verify bindings are registered first." },
        { do: "Place destructive actions last, separated by a divider for visual warning.", dont: "Mix destructive items among regular items without separation." },
      ]} />

      <FigmaMapping rows={[
        ["Menu", "bg-card border rounded-md shadow-md", "DropdownMenuContent", "min-w-[8rem] p-1 z-50"],
        ["Label", "paragraph-sm-bold muted-foreground", "DropdownMenuLabel", "px-xs py-2xs typo-paragraph-sm-bold"],
        ["Separator", "1px muted horizontal", "DropdownMenuSeparator", "-mx-1 my-1 h-px bg-muted"],
        ["Item", "paragraph-sm foreground", "DropdownMenuItem", "flex items-center gap-2 px-xs py-2xs rounded-sm"],
        ["Item / Hover", "bg-muted", "focus:bg-muted", "Applied via Radix focus state"],
        ["Item / Disabled", "opacity-50", "data-[disabled]", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"],
        ["Item / Destructive", "text-destructive", "className", "Apply text-destructive className on DropdownMenuItem"],
        ["Shortcut", "paragraph-mini opacity-60", "DropdownMenuShortcut", "ml-auto tracking-widest opacity-60"],
        ["Checkbox indicator", "size-3.5 check icon", "DropdownMenuCheckboxItem", "absolute left-xs ItemIndicator"],
        ["Radio indicator", "size-xs circle fill-current", "DropdownMenuRadioItem", "absolute left-xs ItemIndicator"],
        ["Item: Default", "text-foreground, rounded-sm", "DropdownMenuItem", "Basic text item"],
        ["Item: With Icon", "icon + label, gap-xs", "DropdownMenuItem", "Icon as first child"],
        ["Item: Destructive", "text-destructive", "DropdownMenuItem", "className=\"text-destructive\""],
        ["Item: With Shortcut", "label + shortcut", "DropdownMenuShortcut", "ml-auto tracking-widest opacity-60"],
        ["Item: Disabled", "opacity-50", "DropdownMenuItem", "data-[disabled]"],
        ["Item: Hover", "bg-muted", "focus:bg-muted", "Radix focus state"],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Enter / Space", "Open the menu from the trigger"],
          ["Arrow Up / Down", "Navigate between menu items"],
          ["Arrow Right", "Open a submenu from SubTrigger"],
          ["Arrow Left / Escape", "Close submenu or the full menu"],
          ["Enter", "Activate the focused item"],
          ["Tab", "Close menu and move focus to next element"],
        ]}
        notes={[
          "Uses role=\"menu\" with role=\"menuitem\" for screen readers",
          "Focus is managed automatically — first item focuses on open",
          "CheckboxItem and RadioItem use role=\"menuitemcheckbox\" / role=\"menuitemradio\"",
          "Supports type-ahead: press a letter to jump to matching items",
          "Trigger must be a focusable element — use asChild with Button",
        ]}
      />

      <RelatedComponents items={[
        { name: "ContextMenu", desc: "Right-click triggered menu with the same item types." },
        { name: "Popover", desc: "Floating panel for non-menu content — forms, filters, info." },
        { name: "Select", desc: "Single value selection in a form — prefer over a radio-group dropdown." },
      ]} />
    </div>
  )
}

function PopoverDocs() {
  const [showDescription, setShowDescription] = useState(true)
  const [showFooter, setShowFooter] = useState(true)

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Popover</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A floating content panel anchored to a trigger — used for inline forms, filters, and rich settings. Unlike Tooltip, Popover supports interactive content and persists until explicitly dismissed.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Show Description", type: "toggle", value: showDescription, onChange: setShowDescription },
        { label: "Show Footer", type: "toggle", value: showFooter, onChange: setShowFooter },
      ]}>
        <div className="bg-card border border-border rounded-md shadow-md p-md w-72 space-y-md">
          <div className="space-y-2xs">
            <h4 className="text-sm font-semibold text-foreground">Dimensions</h4>
            {showDescription && <p className="typo-paragraph-sm text-muted-foreground">Set the dimensions for the layer.</p>}
          </div>
          <div className="grid grid-cols-2 gap-sm">
            <div className="space-y-3xs"><Label className="text-xs">Width</Label><Input defaultValue="100%" /></div>
            <div className="space-y-3xs"><Label className="text-xs">Height</Label><Input defaultValue="auto" /></div>
          </div>
          {showFooter && (
            <div className="flex justify-end">
              <Button size="sm">Apply</Button>
            </div>
          )}
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-popover"]} importCode={`import {\n  Popover,\n  PopoverTrigger,\n  PopoverContent,\n  PopoverAnchor,\n} from "@/components/ui/popover"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Dimensions Form" description="Two inputs for width and height — typical design tool property panel." code={`<Popover>\n  <PopoverTrigger asChild>\n    <Button variant="outline">Edit Dimensions</Button>\n  </PopoverTrigger>\n  <PopoverContent className="w-72 space-y-md">\n    <div className="space-y-2xs">\n      <h4 className="text-sm font-semibold">Dimensions</h4>\n      <p className="typo-paragraph-sm text-muted-foreground">\n        Set the dimensions for the layer.\n      </p>\n    </div>\n    <div className="grid grid-cols-2 gap-sm">\n      <div className="space-y-3xs">\n        <Label className="text-xs">Width</Label>\n        <Input defaultValue="100%" />\n      </div>\n      <div className="space-y-3xs">\n        <Label className="text-xs">Height</Label>\n        <Input defaultValue="auto" />\n      </div>\n    </div>\n    <div className="flex justify-end">\n      <Button size="sm">Apply</Button>\n    </div>\n  </PopoverContent>\n</Popover>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md p-md w-72 space-y-md">
              <div className="space-y-2xs">
                <h4 className="text-sm font-semibold text-foreground">Dimensions</h4>
                <p className="typo-paragraph-sm text-muted-foreground">Set the dimensions for the layer.</p>
              </div>
              <div className="grid grid-cols-2 gap-sm">
                <div className="space-y-3xs"><Label className="text-xs">Width</Label><Input defaultValue="100%" /></div>
                <div className="space-y-3xs"><Label className="text-xs">Height</Label><Input defaultValue="auto" /></div>
              </div>
              <div className="flex justify-end"><Button size="sm">Apply</Button></div>
            </div>
          </Example>
          <Example title="Notification Settings" description="Toggle preferences inline — no need to open a full settings page." code={`<Popover>\n  <PopoverTrigger asChild>\n    <Button variant="outline" size="sm">\n      <Bell /> Notifications\n    </Button>\n  </PopoverTrigger>\n  <PopoverContent className="w-72 space-y-md">\n    <h4 className="text-sm font-semibold">Notifications</h4>\n    <div className="space-y-sm">\n      <div className="flex items-center justify-between">\n        <Label>Email</Label><Switch defaultChecked />\n      </div>\n      <div className="flex items-center justify-between">\n        <Label>Push</Label><Switch />\n      </div>\n      <div className="flex items-center justify-between">\n        <Label>SMS</Label><Switch />\n      </div>\n    </div>\n  </PopoverContent>\n</Popover>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md p-md w-72 space-y-md">
              <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
              <div className="space-y-sm">
                <div className="flex items-center justify-between"><Label className="text-xs">Email</Label><Switch defaultChecked /></div>
                <div className="flex items-center justify-between"><Label className="text-xs">Push</Label><Switch /></div>
                <div className="flex items-center justify-between"><Label className="text-xs">SMS</Label><Switch /></div>
              </div>
            </div>
          </Example>
          <Example title="User Info Card" description="Rich user details panel on click — richer than a Tooltip, lighter than a Dialog." code={`<Popover>\n  <PopoverTrigger asChild>\n    <Button variant="ghost" size="sm">@johndoe</Button>\n  </PopoverTrigger>\n  <PopoverContent className="w-72">\n    <div className="flex gap-md">\n      <Avatar>\n        <AvatarFallback>JD</AvatarFallback>\n      </Avatar>\n      <div>\n        <p className="text-sm font-semibold">John Doe</p>\n        <p className="typo-paragraph-sm text-muted-foreground">@johndoe</p>\n        <p className="typo-paragraph-sm text-muted-foreground mt-xs">\n          Full-stack developer\n        </p>\n      </div>\n    </div>\n  </PopoverContent>\n</Popover>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md p-md w-72">
              <div className="flex gap-md">
                <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">John Doe</p>
                  <p className="typo-paragraph-sm text-muted-foreground">@johndoe</p>
                  <p className="typo-paragraph-sm text-muted-foreground mt-xs">Full-stack developer based in SF</p>
                </div>
              </div>
            </div>
          </Example>
          <Example title="Quick Filters" description="Apply table filters inline without a full filter panel — keeps the user in context." code={`<Popover>\n  <PopoverTrigger asChild>\n    <Button variant="outline" size="sm">\n      <Settings /> Filters\n    </Button>\n  </PopoverTrigger>\n  <PopoverContent className="w-72 space-y-md">\n    <h4 className="text-sm font-semibold">Filters</h4>\n    <div className="space-y-sm">\n      <div className="space-y-3xs">\n        <Label className="text-xs">Status</Label>\n        <Input placeholder="All statuses" />\n      </div>\n      <div className="space-y-3xs">\n        <Label className="text-xs">Date range</Label>\n        <Input placeholder="Last 30 days" />\n      </div>\n    </div>\n    <div className="flex justify-end gap-xs">\n      <Button variant="ghost" size="sm">Reset</Button>\n      <Button size="sm">Apply</Button>\n    </div>\n  </PopoverContent>\n</Popover>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md p-md w-72 space-y-md">
              <h4 className="text-sm font-semibold text-foreground">Filters</h4>
              <div className="space-y-sm">
                <div className="space-y-3xs"><Label className="text-xs">Status</Label><Input placeholder="All statuses" /></div>
                <div className="space-y-3xs"><Label className="text-xs">Date range</Label><Input placeholder="Last 30 days" /></div>
              </div>
              <div className="flex justify-end gap-xs">
                <Button variant="ghost" size="sm">Reset</Button>
                <Button size="sm">Apply</Button>
              </div>
            </div>
          </Example>
        </div>

        {/* Interactive Demo */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg flex flex-wrap gap-sm">
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" size="sm">Dimensions</Button></PopoverTrigger>
              <PopoverContent className="w-72 space-y-md">
                <div className="space-y-2xs">
                  <h4 className="text-sm font-semibold">Dimensions</h4>
                  <p className="typo-paragraph-sm text-muted-foreground">Set the dimensions for the layer.</p>
                </div>
                <div className="grid grid-cols-2 gap-sm">
                  <div className="space-y-3xs"><Label className="text-xs">Width</Label><Input defaultValue="100%" /></div>
                  <div className="space-y-3xs"><Label className="text-xs">Height</Label><Input defaultValue="auto" /></div>
                </div>
                <div className="flex justify-end"><Button size="sm">Apply</Button></div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" size="sm"><Bell className="size-md" /> Notifications</Button></PopoverTrigger>
              <PopoverContent className="w-72 space-y-md">
                <h4 className="text-sm font-semibold">Notifications</h4>
                <div className="space-y-sm">
                  <div className="flex items-center justify-between"><Label>Email</Label><Switch defaultChecked /></div>
                  <div className="flex items-center justify-between"><Label>Push</Label><Switch /></div>
                  <div className="flex items-center justify-between"><Label>SMS</Label><Switch /></div>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild><Button variant="ghost" size="sm">@johndoe</Button></PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="flex gap-md">
                  <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
                  <div>
                    <p className="text-sm font-semibold">John Doe</p>
                    <p className="typo-paragraph-sm text-muted-foreground">@johndoe</p>
                    <p className="typo-paragraph-sm text-muted-foreground mt-xs">Full-stack developer based in SF</p>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" size="sm"><Settings className="size-md" /> Filters</Button></PopoverTrigger>
              <PopoverContent className="w-72 space-y-md">
                <h4 className="text-sm font-semibold">Filters</h4>
                <div className="space-y-sm">
                  <div className="space-y-3xs"><Label className="text-xs">Status</Label><Input placeholder="All statuses" /></div>
                  <div className="space-y-3xs"><Label className="text-xs">Date range</Label><Input placeholder="Last 30 days" /></div>
                </div>
                <div className="flex justify-end gap-xs">
                  <Button variant="ghost" size="sm">Reset</Button>
                  <Button size="sm">Apply</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">PopoverContent</h3>
        <PropsTable rows={[
          ["align", '"start" | "center" | "end"', '"center"', "Horizontal alignment relative to the trigger"],
          ["side", '"top" | "right" | "bottom" | "left"', '"bottom"', "Which side of the trigger to render on"],
          ["sideOffset", "number", "4", "Gap in px between trigger and popover panel"],
          ["className", "string", "—", "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">PopoverTrigger</h3>
        <PropsTable rows={[
          ["asChild", "boolean", "false", "Merge trigger props onto the child element"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--card", "white / #252522", "Popover panel background"],
        ["--border", "zinc-200 / zinc-800", "Popover panel border"],
        ["--foreground", "zinc-900 / zinc-50", "Default text color inside popover"],
        ["--muted-foreground", "zinc-500", "Description and secondary text"],
        ["shadow-md", "0 4px 6px -1px …", "Panel shadow (always applied)"],
      ]} />

      <BestPractices items={[
        { do: "Use Popover for interactive content — forms, toggles, pickers — where users need to act.", dont: "Use Popover for static read-only info — use Tooltip or HoverCard instead." },
        { do: "Keep popover content compact and focused on a single task.", dont: "Put complex multi-step flows inside a popover — use Dialog or Sheet for large content." },
        { do: "Use sideOffset and align to keep the popover visible and close to its trigger.", dont: "Let the popover clip off screen — always test positioning near viewport edges." },
      ]} />

      <FigmaMapping rows={[
        ["Content panel", "bg-card border rounded-md shadow-md", "PopoverContent", "z-50 w-72 p-md outline-none"],
        ["Border", "border-border", "PopoverContent", "border border-border"],
        ["Padding", "p-md (16px)", "PopoverContent", "Default padding — override via className"],
        ["Default width", "w-72 (288px)", "PopoverContent", "Override with className for different widths"],
        ["Side", "bottom (default)", "side prop", "top | right | bottom | left"],
        ["Align", "center (default)", "align prop", "start | center | end"],
        ["Offset", "4px gap", "sideOffset", "Gap between trigger element and popover panel"],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Enter / Space", "Open the popover from the trigger"],
          ["Tab", "Move focus into and through popover content"],
          ["Shift+Tab", "Move focus backwards through popover content"],
          ["Escape", "Close the popover and return focus to trigger"],
        ]}
        notes={[
          "Focus moves into the popover content on open",
          "Closes on outside click or Escape key",
          "Use PopoverAnchor to position relative to a custom element instead of the trigger",
          "Trigger must be a focusable element — use asChild with Button",
        ]}
      />

      <RelatedComponents items={[
        { name: "Tooltip", desc: "Non-interactive hover info — no forms or clickable content." },
        { name: "HoverCard", desc: "Rich preview on hover — for links and user mentions." },
        { name: "Dialog", desc: "Centered modal for larger forms or confirmations that need full focus." },
      ]} />
    </div>
  )
}

function AccordionDocs() {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState("default")
  const isDisabled = state === "disabled"
  const isHover = state === "hover"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Data Display</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Accordion</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A vertically stacked set of interactive headings that each reveal a section of content on click. Built on @radix-ui/react-accordion — supports single (one open at a time) and multiple (several open simultaneously) selection modes.</p>
      </header>
      <ExploreBehavior controls={[
        { label: "Open", type: "toggle", value: open, onChange: setOpen },
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
      ]}>
        <div className={cn(
          "w-full max-w-md",
          state !== "default" && "pointer-events-none",
          isHover && "[&_[data-slot=accordion-trigger]]:underline",
          isFocus && "[&_[data-slot=accordion-trigger]]:ring-2 [&_[data-slot=accordion-trigger]]:ring-ring [&_[data-slot=accordion-trigger]]:rounded-lg",
        )}>
          <Accordion type="single" collapsible value={open ? "item-1" : ""} onValueChange={(v) => setOpen(!!v)} disabled={isDisabled}>
            <AccordionItem value="item-1"><AccordionTrigger>Is it accessible?</AccordionTrigger><AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent></AccordionItem>
          </Accordion>
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-accordion"]} importCode={`import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Default (Single)" description="type='single' allows only one item open at a time. Add collapsible to let users close all panels." code={`<Accordion type="single" collapsible>\n  <AccordionItem value="item-1">\n    <AccordionTrigger>Is it accessible?</AccordionTrigger>\n    <AccordionContent>Yes.</AccordionContent>\n  </AccordionItem>\n</Accordion>`}>
          <Accordion type="single" collapsible className="w-full max-w-md">
            <AccordionItem value="item-1"><AccordionTrigger>Is it accessible?</AccordionTrigger><AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent></AccordionItem>
            <AccordionItem value="item-2"><AccordionTrigger>Is it styled?</AccordionTrigger><AccordionContent>Yes. It comes with default styles matching the design system.</AccordionContent></AccordionItem>
            <AccordionItem value="item-3"><AccordionTrigger>Is it animated?</AccordionTrigger><AccordionContent>Yes. It uses CSS animations for smooth open/close transitions.</AccordionContent></AccordionItem>
          </Accordion>
        </Example>
        <Example title="Multiple Open" description="type='multiple' lets users expand several sections at once — ideal for settings panels or comparison views." code={`<Accordion type="multiple">\n  <AccordionItem value="a">...</AccordionItem>\n  <AccordionItem value="b">...</AccordionItem>\n</Accordion>`}>
          <Accordion type="multiple" className="w-full max-w-md">
            <AccordionItem value="a"><AccordionTrigger>Section A</AccordionTrigger><AccordionContent>Content for section A — visible alongside other open sections.</AccordionContent></AccordionItem>
            <AccordionItem value="b"><AccordionTrigger>Section B</AccordionTrigger><AccordionContent>Content for section B — both A and B can be open at the same time.</AccordionContent></AccordionItem>
            <AccordionItem value="c"><AccordionTrigger>Section C</AccordionTrigger><AccordionContent>Content for section C.</AccordionContent></AccordionItem>
          </Accordion>
        </Example>
        <Example title="Default Open" description="Use defaultValue to pre-expand an item on mount — useful for FAQ pages where the first answer should be visible." code={`<Accordion type="single" collapsible defaultValue="faq-1">...</Accordion>`}>
          <Accordion type="single" collapsible defaultValue="faq-1" className="w-full max-w-md">
            <AccordionItem value="faq-1"><AccordionTrigger>What is included?</AccordionTrigger><AccordionContent>All components from the design system are included.</AccordionContent></AccordionItem>
            <AccordionItem value="faq-2"><AccordionTrigger>Can I customize?</AccordionTrigger><AccordionContent>Yes, all components support className overrides.</AccordionContent></AccordionItem>
          </Accordion>
        </Example>
        <Example title="Disabled Items" description="Disable the entire accordion via the root disabled prop, or disable individual items for selective restriction." code={`{/* Whole accordion */}\n<Accordion type="single" disabled>...</Accordion>\n\n{/* Single item */}\n<AccordionItem value="b" disabled>...</AccordionItem>`}>
          <Accordion type="single" collapsible className="w-full max-w-md">
            <AccordionItem value="a"><AccordionTrigger>Available item</AccordionTrigger><AccordionContent>This item can be expanded normally.</AccordionContent></AccordionItem>
            <AccordionItem value="b" disabled><AccordionTrigger>Disabled item</AccordionTrigger><AccordionContent>This content is inaccessible.</AccordionContent></AccordionItem>
            <AccordionItem value="c"><AccordionTrigger>Another available item</AccordionTrigger><AccordionContent>This item also works normally.</AccordionContent></AccordionItem>
          </Accordion>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground">Built on <code>@radix-ui/react-accordion</code>. All unrecognized props are forwarded to the underlying Radix primitives.</p>
        <h3 className="font-semibold text-sm mt-md">Accordion</h3>
        <PropsTable rows={[
          ["type", '"single" | "multiple"', "—", "Selection mode — required. single: one item open; multiple: several open simultaneously"],
          ["collapsible", "boolean", "false", "Allow all items to be closed (single mode only) — set true to avoid trapping content open"],
          ["defaultValue", "string | string[]", "—", "Uncontrolled: item(s) open by default on mount"],
          ["value", "string | string[]", "—", "Controlled open item(s) — pair with onValueChange"],
          ["onValueChange", "(value: string | string[]) => void", "—", "Fires when open item(s) change"],
          ["disabled", "boolean", "false", "Disable all triggers in the accordion"],
          ["className", "string", "—", "Additional CSS classes on the root element"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AccordionItem</h3>
        <PropsTable rows={[
          ["value", "string", "—", "Unique identifier for this item — required, used by Accordion value/defaultValue"],
          ["disabled", "boolean", "false", "Disable this item's trigger independently of the root"],
          ["className", "string", "—", "Additional CSS classes — default adds border-b border-border"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AccordionTrigger</h3>
        <PropsTable rows={[
          ["children", "ReactNode", "—", "Trigger label text — ChevronDown icon is appended automatically"],
          ["className", "string", "—", "Additional CSS classes on the trigger button"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AccordionContent</h3>
        <PropsTable rows={[
          ["children", "ReactNode", "—", "Content shown when the item is open"],
          ["className", "string", "—", "Applied to the inner div — use to adjust content padding or spacing"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--border","zinc-200","AccordionItem bottom divider line"],
        ["--foreground","zinc-900","Trigger label text color"],
        ["--ghost-foreground","zinc-400","ChevronDown icon color"],
        ["--ring","violet-600/30","Focus-visible ring on trigger"],
      ]} />
      <BestPractices items={[
        {do:"Use type='single' when sections are mutually exclusive — only one answer/section is relevant at a time.",dont:"Default to type='multiple' — it causes information overload and users can't find what they need."},
        {do:"Add collapsible={true} on single-mode accordions so users can close all panels when done.",dont:"Leave collapsible={false} as it traps users with content open they can't dismiss."},
        {do:"Keep trigger labels short and scannable — users read triggers to decide whether to expand.",dont:"Put critical, must-read content inside collapsed sections — users may never see it."},
      ]} />
      <FigmaMapping rows={[
        ["Type","Single","type",'"single"'],
        ["Type","Multiple","type",'"multiple"'],
        ["State","Default","—","default render"],
        ["State","Hover","—","hover:underline on trigger"],
        ["State","Focus","—","focus-visible ring on trigger"],
        ["State","Disabled","disabled","true (root or item)"],
        ["Type (trigger)","Open","value / defaultValue","item value string"],
        ["End Item","True","AccordionItem","last item — last:border-b-0"],
      ]} />
      <AccessibilityInfo
        keyboard={[
          ["Tab","Move focus to the next accordion trigger"],
          ["Shift + Tab","Move focus to the previous accordion trigger"],
          ["Enter / Space","Toggle the focused section open or closed"],
          ["Arrow Down","Move focus to the next trigger (wraps to first)"],
          ["Arrow Up","Move focus to the previous trigger (wraps to last)"],
          ["Home","Move focus to the first trigger"],
          ["End","Move focus to the last trigger"],
        ]}
        notes={[
          "AccordionTrigger renders as a <button> inside an <h3> — the heading level is part of the WAI-ARIA Accordion pattern and aids page structure for screen readers.",
          "Each trigger has aria-expanded reflecting its open/closed state, and aria-controls pointing to the content panel.",
          "Content panels have role=\"region\" and aria-labelledby pointing back to their trigger — screen readers announce the region label when focus enters the content.",
          "Disabled items have pointer-events-none and opacity-50 — they are still present in the DOM and announced as disabled by screen readers.",
        ]}
      />
      <RelatedComponents items={[
        {name:"Collapsible",desc:"Single toggle section — use when you only need one expandable area rather than a stacked list."},
        {name:"Tabs",desc:"Horizontal section switcher — use when sections are mutually exclusive and space is limited."},
        {name:"Card",desc:"Always-visible content container — use when content should not be hidden behind an interaction."},
      ]} />
    </div>
  )
}

const TABLE_ROWS = [
  { invoice: "INV001", method: "Credit Card", amount: 250 },
  { invoice: "INV003", method: "Bank Transfer", amount: 350 },
  { invoice: "INV002", method: "PayPal", amount: 150 },
]

function SortableTableExample() {
  const [sortCol, setSortCol] = useState<"invoice" | "method" | "amount" | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  function handleSort(col: "invoice" | "method" | "amount") {
    if (sortCol === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortCol(col)
      setSortDir("asc")
    }
  }

  const sorted = [...TABLE_ROWS].sort((a, b) => {
    if (!sortCol) return 0
    const va = a[sortCol], vb = b[sortCol]
    const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb))
    return sortDir === "asc" ? cmp : -cmp
  })

  function SortIcon({ col }: { col: "invoice" | "method" | "amount" }) {
    if (sortCol !== col) return <ChevronsUpDown className="size-3 ml-1 text-muted-foreground/50" />
    return sortDir === "asc"
      ? <ArrowUp className="size-3 ml-1 text-foreground" />
      : <ArrowDown className="size-3 ml-1 text-foreground" />
  }

  return (
    <Example
      title="Sortable Columns"
      description="Click a column header to sort ascending; click again to reverse. Track sort column and direction in state, then sort the data before rendering."
      code={`const [sortCol, setSortCol] = useState(null)\nconst [sortDir, setSortDir] = useState("asc")\n\n<TableHead\n  className="cursor-pointer select-none"\n  onClick={() => handleSort("amount")}\n  aria-sort={sortCol === "amount" ? sortDir === "asc" ? "ascending" : "descending" : "none"}\n>\n  Amount <ArrowUp className="size-3 ml-1" />\n</TableHead>`}
    >
      <Table>
        <TableHeader>
          <TableRow>
            {(["invoice", "method", "amount"] as const).map(col => (
              <TableHead
                key={col}
                className={cn("cursor-pointer select-none", col === "amount" && "text-right")}
                onClick={() => handleSort(col)}
                aria-sort={sortCol === col ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
              >
                <span className="inline-flex items-center">
                  {col.charAt(0).toUpperCase() + col.slice(1)}
                  <SortIcon col={col} />
                </span>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map(row => (
            <TableRow key={row.invoice}>
              <TableCell className="font-medium">{row.invoice}</TableCell>
              <TableCell>{row.method}</TableCell>
              <TableCell className="text-right">${row.amount}.00</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Example>
  )
}

function TooltipHeaderTableExample() {
  return (
    <Example
      title="Tooltip on Header"
      description="Wrap TableHead content in a Tooltip to explain abbreviations or technical column names — use TooltipProvider at the table level."
      code={`<TooltipProvider>\n  <TableHead>\n    <Tooltip>\n      <TooltipTrigger className="underline decoration-dotted cursor-help">\n        LTV\n      </TooltipTrigger>\n      <TooltipContent>Lifetime Value — total revenue from this customer</TooltipContent>\n    </Tooltip>\n  </TableHead>\n</TooltipProvider>`}
    >
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted cursor-help">LTV</span>
                  </TooltipTrigger>
                  <TooltipContent>Lifetime Value — total revenue from this customer</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted cursor-help">MRR</span>
                  </TooltipTrigger>
                  <TooltipContent>Monthly Recurring Revenue</TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="underline decoration-dotted cursor-help">CAC</span>
                  </TooltipTrigger>
                  <TooltipContent>Customer Acquisition Cost</TooltipContent>
                </Tooltip>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell className="font-medium">Alice Johnson</TableCell><TableCell>$4,200</TableCell><TableCell>$350</TableCell><TableCell>$120</TableCell></TableRow>
            <TableRow><TableCell className="font-medium">Bob Smith</TableCell><TableCell>$1,800</TableCell><TableCell>$150</TableCell><TableCell>$95</TableCell></TableRow>
            <TableRow><TableCell className="font-medium">Carol Lee</TableCell><TableCell>$6,500</TableCell><TableCell>$540</TableCell><TableCell>$210</TableCell></TableRow>
          </TableBody>
        </Table>
      </TooltipProvider>
    </Example>
  )
}

function TableDocs() {
  const [tableStriped, setTableStriped] = useState(false)
  // Table Row explore state (shared between Tab 1 & Tab 3)
  const [rowState, setRowState] = useState("default")
  const [rowStriped, setRowStriped] = useState(false)
  const [rowCheckbox, setRowCheckbox] = useState(false)
  const [headerCheckbox, setHeaderCheckbox] = useState(false)
  const [headerState, setHeaderState] = useState("default")
  // Cell Header explore state
  const [cellHeaderType, setCellHeaderType] = useState("text")
  const [cellHeaderAlignment, setCellHeaderAlignment] = useState("left")
  // Cell Row explore state
  const [cellRowType, setCellRowType] = useState("text")
  const [cellRowAlignment, setCellRowAlignment] = useState("left")
  const [cellRowWeight, setCellRowWeight] = useState("regular")
  // Table Row border state
  const [rowBorder, setRowBorder] = useState(true)
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Data Display</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Table</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A semantic HTML table for displaying structured, multi-column data with built-in hover, selected, and striped row states. Composed from eight sub-components: Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, and TableCaption.</p>
      </header>

      {/* 2. Explore Behavior — tabbed: Table | Table Row */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
        <Tabs defaultValue="table-group" className="w-full">
          <div className="border border-border rounded-xl overflow-hidden">
          <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
            <TabsTrigger value="table-group" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Table</span></TabsTrigger>
            <TabsTrigger value="table-header" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Table Header</span></TabsTrigger>
            <TabsTrigger value="table-row" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Table Row</span></TabsTrigger>
            <TabsTrigger value="cell-header" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Cell Header</span></TabsTrigger>
            <TabsTrigger value="cell-row" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Cell Row</span></TabsTrigger>
          </TabsList>

          {/* Tab 1: Table */}
          <TabsContent value="table-group" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className={cn(headerState === "hover" && "bg-muted/50")}>
                      {headerCheckbox && <TableHead className="w-px"><Checkbox /></TableHead>}
                      <TableHead>Invoice</TableHead><TableHead>Status</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className={cn(rowState === "hover" && "bg-muted/50", rowStriped && "bg-muted/30")} data-state={rowState === "selected" ? "selected" : undefined}>
                      {rowCheckbox && <TableCell className="w-px"><Checkbox checked={rowState === "selected"} onCheckedChange={() => {}} /></TableCell>}
                      <TableCell className="font-medium">INV001</TableCell><TableCell>Paid</TableCell><TableCell>Credit Card</TableCell><TableCell className="text-right">$250.00</TableCell>
                    </TableRow>
                    <TableRow className={cn(tableStriped && "bg-muted/30")}>
                      {rowCheckbox && <TableCell className="w-px"><Checkbox /></TableCell>}
                      <TableCell className="font-medium">INV002</TableCell><TableCell>Pending</TableCell><TableCell>PayPal</TableCell><TableCell className="text-right">$150.00</TableCell>
                    </TableRow>
                    <TableRow>
                      {rowCheckbox && <TableCell className="w-px"><Checkbox /></TableCell>}
                      <TableCell className="font-medium">INV003</TableCell><TableCell>Failed</TableCell><TableCell>Bank Transfer</TableCell><TableCell className="text-right">$350.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-wrap gap-x-lg gap-y-xs">
                  <div className="flex flex-col gap-xs">
                    <Label className="text-xs text-muted-foreground font-body">Striped</Label>
                    <Switch checked={tableStriped} onCheckedChange={setTableStriped} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Table Header */}
          <TabsContent value="table-header" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <div className="w-full">
                  <Table>
                    <TableHeader>
                      <TableRow className={cn(headerState === "hover" && "bg-muted/50")}>
                        {headerCheckbox && <TableHead className="w-px"><Checkbox /></TableHead>}
                        <TableHead>Invoice</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-col gap-md">
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">State</Label>
                    <div className="flex flex-wrap gap-xs">
                      {["default", "hover"].map(s => (
                        <button key={s} onClick={() => setHeaderState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", headerState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-lg gap-y-xs">
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Checkbox</Label>
                      <Switch checked={headerCheckbox} onCheckedChange={setHeaderCheckbox} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Table Row */}
          <TabsContent value="table-row" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <div className="w-full">
                  <Table>
                    <TableBody>
                      <TableRow
                        className={cn(
                          rowState === "hover" && "bg-muted/50",
                          rowState === "selected" && "bg-muted",
                          rowStriped && "bg-muted/30",
                          !rowBorder && "border-0",
                        )}
                        data-state={rowState === "selected" ? "selected" : undefined}
                      >
                        {rowCheckbox && <TableCell className="w-px"><Checkbox checked={rowState === "selected"} onCheckedChange={() => {}} /></TableCell>}
                        <TableCell className="font-medium">INV001</TableCell>
                        <TableCell>Paid</TableCell>
                        <TableCell>Credit Card</TableCell>
                        <TableCell className="text-right">$250.00</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-col gap-md">
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">State</Label>
                    <div className="flex flex-wrap gap-xs">
                      {["default", "hover", "selected"].map(s => (
                        <button key={s} onClick={() => setRowState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", rowState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-lg gap-y-xs">
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Striped</Label>
                      <Switch checked={rowStriped} onCheckedChange={setRowStriped} />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Checkbox</Label>
                      <Switch checked={rowCheckbox} onCheckedChange={setRowCheckbox} />
                    </div>
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Border</Label>
                      <Switch checked={rowBorder} onCheckedChange={setRowBorder} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Cell Header */}
          <TabsContent value="cell-header" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <div className="w-full max-w-xs">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {cellHeaderType === "checkbox" ? (
                          <TableHead className="w-px pl-sm pr-0"><Checkbox /></TableHead>
                        ) : (
                          <TableHead className={cn(cellHeaderAlignment === "right" && "text-right")}>Invoice</TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                  </Table>
                </div>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-col gap-md">
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">Type</Label>
                    <div className="flex flex-wrap gap-xs">
                      {["text", "checkbox"].map(s => (
                        <button key={s} onClick={() => { setCellHeaderType(s); if (s === "checkbox") setCellHeaderAlignment("left"); }} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", cellHeaderType === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">Alignment</Label>
                    <div className="flex flex-wrap gap-xs">
                      {(cellHeaderType === "checkbox" ? ["left"] : ["left", "right"]).map(s => (
                        <button key={s} onClick={() => setCellHeaderAlignment(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", cellHeaderAlignment === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 5: Cell Row */}
          <TabsContent value="cell-row" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <div className="w-full max-w-xs">
                  <Table>
                    <TableBody>
                      <TableRow>
                        {cellRowType === "checkbox" ? (
                          <TableCell className="w-px pl-sm pr-0"><Checkbox /></TableCell>
                        ) : (
                          <TableCell className={cn(cellRowAlignment === "right" && "text-right", cellRowWeight === "medium" && "font-medium")}>INV001</TableCell>
                        )}
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-col gap-md">
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">Type</Label>
                    <div className="flex flex-wrap gap-xs">
                      {["text", "checkbox"].map(s => (
                        <button key={s} onClick={() => { setCellRowType(s); if (s === "checkbox") { setCellRowAlignment("left"); setCellRowWeight("regular"); } }} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", cellRowType === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">Alignment</Label>
                    <div className="flex flex-wrap gap-xs">
                      {(cellRowType === "checkbox" ? ["left"] : ["left", "right"]).map(s => (
                        <button key={s} onClick={() => setCellRowAlignment(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", cellRowAlignment === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">Weight</Label>
                    <div className="flex flex-wrap gap-xs">
                      {(cellRowType === "checkbox" ? ["regular"] : ["regular", "medium"]).map(s => (
                        <button key={s} onClick={() => setCellRowWeight(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", cellRowWeight === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          </div>
        </Tabs>
      </section>

      <InstallationSection pkg={[]} importCode={`import {\n  Table, TableHeader, TableBody, TableFooter,\n  TableRow, TableHead, TableCell, TableCaption,\n} from "@/components/ui/table"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="With Status Badges" description="Combine Badge inside TableCell to display status columns — use level='secondary' for subtle color that doesn't compete with content." code={`<TableCell>\n  <Badge variant="success" level="secondary">Paid</Badge>\n</TableCell>`}>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Status</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">INV001</TableCell><TableCell><Badge variant="success" level="secondary">Paid</Badge></TableCell><TableCell>Credit Card</TableCell><TableCell className="text-right">$250.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV002</TableCell><TableCell><Badge variant="warning" level="secondary">Pending</Badge></TableCell><TableCell>PayPal</TableCell><TableCell className="text-right">$150.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV003</TableCell><TableCell><Badge variant="destructive" level="secondary">Failed</Badge></TableCell><TableCell>Bank Transfer</TableCell><TableCell className="text-right">$350.00</TableCell></TableRow>
            </TableBody>
          </Table>
        </Example>
        <Example title="With Footer" description="TableFooter renders a bordered summary row — use for totals, counts, or aggregate values at the bottom of the table." code={`<TableFooter>\n  <TableRow>\n    <TableCell colSpan={3}>Total</TableCell>\n    <TableCell className="text-right">$750.00</TableCell>\n  </TableRow>\n</TableFooter>`}>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">INV001</TableCell><TableCell>Credit Card</TableCell><TableCell className="text-right">$250.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV002</TableCell><TableCell>PayPal</TableCell><TableCell className="text-right">$150.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV003</TableCell><TableCell>Bank Transfer</TableCell><TableCell className="text-right">$350.00</TableCell></TableRow>
            </TableBody>
            <TableFooter>
              <TableRow><TableCell colSpan={2}>Total</TableCell><TableCell className="text-right">$750.00</TableCell></TableRow>
            </TableFooter>
          </Table>
        </Example>
        <Example title="With Actions" description="Place icon buttons in a right-aligned TableCell for row-level actions. Use variant='ghost' to keep actions subtle until hover." code={`<TableCell className="text-right">\n  <Button variant="ghost" size="sm"><Pencil className="size-4" /></Button>\n  <Button variant="ghost" size="sm"><Trash2 className="size-4" /></Button>\n</TableCell>`}>
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Alice Johnson</TableCell>
                <TableCell><Badge level="secondary">Admin</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm"><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="sm"><Trash2 className="size-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Bob Smith</TableCell>
                <TableCell><Badge variant="secondary" level="secondary">Member</Badge></TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="sm"><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="sm"><Trash2 className="size-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Example>
        <Example title="With Caption" description="TableCaption renders below the table as a visible label — useful for describing the table's content for context or accessibility." code={`<TableCaption>A list of your recent invoices.</TableCaption>`}>
          <Table>
            <TableCaption>A list of recent invoices.</TableCaption>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">INV001</TableCell><TableCell>Paid</TableCell><TableCell className="text-right">$250.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV002</TableCell><TableCell>Pending</TableCell><TableCell className="text-right">$150.00</TableCell></TableRow>
            </TableBody>
          </Table>
        </Example>
        <SortableTableExample />
        <TooltipHeaderTableExample />
        <Example title="Striped Rows" description="Add even:bg-muted/30 to each TableRow for alternating row colors — improves readability in dense tables with many columns." code={`<TableRow className="even:bg-muted/30">...</TableRow>`}>
          <Table>
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow className="even:bg-muted/30"><TableCell className="font-medium">INV001</TableCell><TableCell>Credit Card</TableCell><TableCell className="text-right">$250.00</TableCell></TableRow>
              <TableRow className="even:bg-muted/30"><TableCell className="font-medium">INV002</TableCell><TableCell>PayPal</TableCell><TableCell className="text-right">$150.00</TableCell></TableRow>
              <TableRow className="even:bg-muted/30"><TableCell className="font-medium">INV003</TableCell><TableCell>Bank Transfer</TableCell><TableCell className="text-right">$350.00</TableCell></TableRow>
              <TableRow className="even:bg-muted/30"><TableCell className="font-medium">INV004</TableCell><TableCell>Credit Card</TableCell><TableCell className="text-right">$480.00</TableCell></TableRow>
              <TableRow className="even:bg-muted/30"><TableCell className="font-medium">INV005</TableCell><TableCell>PayPal</TableCell><TableCell className="text-right">$90.00</TableCell></TableRow>
            </TableBody>
          </Table>
        </Example>
        <Example title="Compact" description="Override cell padding via [&_td]:py-1 [&_th]:py-1 on the Table root — useful for data-dense UIs or dashboard widgets with limited vertical space." code={`<Table className="[&_td]:py-1 [&_th]:py-1">...</Table>`}>
          <Table className="[&_td]:py-1 [&_th]:py-1">
            <TableHeader><TableRow><TableHead>Invoice</TableHead><TableHead>Status</TableHead><TableHead>Method</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
            <TableBody>
              <TableRow><TableCell className="font-medium">INV001</TableCell><TableCell><Badge variant="success" level="secondary" size="sm">Paid</Badge></TableCell><TableCell>Credit Card</TableCell><TableCell className="text-right">$250.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV002</TableCell><TableCell><Badge variant="warning" level="secondary" size="sm">Pending</Badge></TableCell><TableCell>PayPal</TableCell><TableCell className="text-right">$150.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV003</TableCell><TableCell><Badge variant="destructive" level="secondary" size="sm">Failed</Badge></TableCell><TableCell>Bank Transfer</TableCell><TableCell className="text-right">$350.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV004</TableCell><TableCell><Badge variant="success" level="secondary" size="sm">Paid</Badge></TableCell><TableCell>Credit Card</TableCell><TableCell className="text-right">$480.00</TableCell></TableRow>
              <TableRow><TableCell className="font-medium">INV005</TableCell><TableCell><Badge variant="warning" level="secondary" size="sm">Pending</Badge></TableCell><TableCell>PayPal</TableCell><TableCell className="text-right">$90.00</TableCell></TableRow>
            </TableBody>
          </Table>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground">Pure semantic HTML — no external dependencies. All sub-components accept <code>className</code> and their native HTML element props. Notable built-in behaviors are listed below.</p>
        <PropsTable rows={[
          ["Table", "wraps <table> in overflow-auto div", "—", "Enables horizontal scroll on narrow viewports automatically"],
          ["TableHeader", "[&_tr]:border-b", "—", "Adds bottom border to the header row"],
          ["TableBody", "[&_tr:last-child]:border-0", "—", "Removes bottom border from the last body row"],
          ["TableFooter", "border-t bg-muted/50", "—", "Renders with top border and muted background for summary rows"],
          ["TableRow", "hover:bg-muted/50, data-[state=selected]:bg-muted", "—", "Hover highlight built-in; add data-state='selected' for selected state"],
          ["TableHead", "scope='col', h-3xl px-md, text-muted-foreground", "—", "scope='col' added automatically for accessibility"],
          ["TableCell", "p-md align-middle", "—", "Standard cell padding; use className to override"],
          ["TableCaption", "mt-md text-sm text-muted-foreground", "—", "Renders below the table as a visible description"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--border","zinc-200","TableRow bottom border, TableFooter top border"],
        ["--muted","zinc-100","TableRow hover background, TableFooter background"],
        ["--muted-foreground","zinc-500","TableHead text color"],
        ["--foreground","zinc-900","TableCell text color"],
      ]} />
      <BestPractices items={[
        {do:"Use semantic Table sub-components for all multi-column data — screen readers announce column headers to each cell.",dont:"Use div/grid layouts to simulate a table — they lose the row/column relationship for assistive technology."},
        {do:"Apply data-state='selected' on TableRow to highlight selected rows — the selected style is built in.",dont:"Use a custom background color class for selection — it bypasses the design token and breaks dark mode."},
        {do:"Use table-fixed with explicit column widths when column content varies — prevents layout shift on data update.",dont:"Let all columns auto-size — variable-length content causes columns to jump width between pages."},
      ]} />
      <FigmaMapping rows={[
        ["Row / State","Default","—","default TableRow"],
        ["Row / State","Hover","hover:bg-muted/50","built-in, no className needed"],
        ["Row / State","Selected","data-state",'"selected" on TableRow'],
        ["Row / Striped","Even rows tinted","className",'"even:bg-muted/30" on each TableRow'],
        ["Row / Checkbox","Checkbox column","TableCell",'"w-px" cell with <Checkbox />'],
        ["Header / State","Default / Hover","—","Same as TableRow hover"],
        ["Header / Checkbox","Select-all checkbox","TableHead",'"w-px" head with <Checkbox />'],
        ["Table / Striped","Alternating row tint","className","even:bg-muted/30 on rows"],
        ["Footer","Summary row","TableFooter","wrap rows in TableFooter"],
        ["Caption","Table label","TableCaption","place inside Table, renders below"],
      ]} />
      <AccessibilityInfo
        keyboard={[
          ["Tab","Move focus through interactive elements inside cells (buttons, links, inputs)"],
          ["Enter / Space","Activate focused interactive element within a cell"],
        ]}
        notes={[
          "TableHead automatically adds scope='col' — this tells screen readers which column each header belongs to, required for accessible data tables.",
          "For row headers (first column identifying each row), add scope='row' to those TableCell elements manually.",
          "TableCaption is announced by screen readers as the table's accessible name — prefer it over an external heading for describing table content.",
          "For sortable columns, add aria-sort='ascending' | 'descending' | 'none' to the TableHead element and update on click.",
        ]}
      />
      <RelatedComponents items={[
        {name:"Card",desc:"For displaying a single record's details rather than a multi-row comparison."},
        {name:"Accordion",desc:"Add expandable row details by nesting a Collapsible inside a TableRow spanning all columns."},
        {name:"Pagination",desc:"Pair with Table for navigating large datasets across multiple pages."},
      ]} />
    </div>
  )
}

function BreadcrumbDocs() {
  const [items, setItems] = useState("3")
  const [separator, setSeparator] = useState("chevron")
  // Breadcrumb Item explore state
  const [bcItemType, setBcItemType] = useState("link")
  const [bcItemState, setBcItemState] = useState("default")
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Navigation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Breadcrumb</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Shows the user's current location in a page hierarchy as a series of navigable links. The last item is always rendered as a non-clickable current page — never a link.</p>
      </header>

      {/* 2. Explore Behavior — tabbed: Breadcrumb | Breadcrumb Item */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
        <Tabs defaultValue="breadcrumb-group" className="w-full">
          <div className="border border-border rounded-xl overflow-hidden">
            <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
              <TabsTrigger value="breadcrumb-group" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Breadcrumb</span></TabsTrigger>
              <TabsTrigger value="breadcrumb-item" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Breadcrumb Item</span></TabsTrigger>
            </TabsList>

            {/* Tab 1: Breadcrumb */}
            <TabsContent value="breadcrumb-group" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <Breadcrumb>
                    <BreadcrumbList>
                      {["Home","Dashboard","Settings","Account","Profile"].slice(0, Number(items)).map((item, i, arr) => (
                        <span key={item} className="contents">
                          {i > 0 && <BreadcrumbSeparator>{separator === "slash" ? "/" : <ChevronRight className="size-3.5" />}</BreadcrumbSeparator>}
                          <BreadcrumbItem>
                            {i === arr.length - 1 ? (
                              bcItemType === "current" ? <BreadcrumbPage>{item}</BreadcrumbPage> : <BreadcrumbLink href="#" className={cn(bcItemState === "hover" && "text-foreground")}>{item}</BreadcrumbLink>
                            ) : (
                              <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                        </span>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Items</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["2","3","4","5"].map(n => (
                          <button key={n} onClick={() => setItems(n)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors", items === n ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{n}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Separator</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["chevron","slash"].map(s => (
                          <button key={s} onClick={() => setSeparator(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", separator === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Breadcrumb Item */}
            <TabsContent value="breadcrumb-item" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <div>
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          {bcItemType === "current" ? (
                            <BreadcrumbPage>Settings</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink href="#" className={cn(bcItemState === "hover" && "text-foreground")}>
                              Dashboard
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Type</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["link", "current"].map(t => (
                          <button key={t} onClick={() => { setBcItemType(t); if (t === "current") setBcItemState("default"); }} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors", bcItemType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{t === "current" ? "Current Page" : "Link"}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">State</Label>
                      <div className="flex flex-wrap gap-xs">
                        {(bcItemType === "current" ? ["default"] : ["default", "hover"]).map(s => (
                          <button key={s} onClick={() => setBcItemState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", bcItemState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>

      <InstallationSection pkg={[]} importCode={`import {\n  Breadcrumb,\n  BreadcrumbList,\n  BreadcrumbItem,\n  BreadcrumbLink,\n  BreadcrumbPage,\n  BreadcrumbSeparator,\n  BreadcrumbEllipsis,\n} from "@/components/ui/breadcrumb"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Three Levels" description="Standard path from root to current page. Use for most app pages with a clear hierarchy." code={`<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem><BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink></BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem><BreadcrumbPage>Analytics</BreadcrumbPage></BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>`}>
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

          <Example title="With Ellipsis" description="Collapse middle items when the path exceeds 4 levels. Keeps the trail scannable on narrow screens." code={`<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem><BreadcrumbLink href="/settings">Settings</BreadcrumbLink></BreadcrumbItem>\n    <BreadcrumbSeparator />\n    <BreadcrumbItem><BreadcrumbPage>Profile</BreadcrumbPage></BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>`}>
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbLink href="#">Settings</BreadcrumbLink></BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem><BreadcrumbPage>Profile</BreadcrumbPage></BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </Example>

          <Example title="Slash Separator" description="Use a slash character as separator for a URL-style breadcrumb trail." code={`<Breadcrumb>\n  <BreadcrumbList>\n    <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>\n    <BreadcrumbSeparator>/</BreadcrumbSeparator>\n    <BreadcrumbItem><BreadcrumbLink href="/products">Products</BreadcrumbLink></BreadcrumbItem>\n    <BreadcrumbSeparator>/</BreadcrumbSeparator>\n    <BreadcrumbItem><BreadcrumbPage>Details</BreadcrumbPage></BreadcrumbItem>\n  </BreadcrumbList>\n</Breadcrumb>`}>
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

          <Example title="In Page Header" description="Place breadcrumb above the page title to orient users within the app structure." code={`<div className="space-y-xs">\n  <Breadcrumb>...</Breadcrumb>\n  <h1 className="text-2xl font-bold">Alice Johnson</h1>\n</div>`}>
            <div className="space-y-xs">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbLink href="#">Users</BreadcrumbLink></BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem><BreadcrumbPage>Alice Johnson</BreadcrumbPage></BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <h1 className="text-2xl font-bold font-heading">Alice Johnson</h1>
            </div>
          </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground">Native HTML composition — no Radix primitive dependency. Uses <code>@radix-ui/react-slot</code> only for the <code>asChild</code> prop on <code>BreadcrumbLink</code>.</p>
        <h3 className="font-semibold text-sm mt-md">BreadcrumbLink</h3>
        <PropsTable rows={[
          ["href", "string", "—", "Navigation URL for the link"],
          ["asChild", "boolean", "false", "Merge props onto child element — use with router Link"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">BreadcrumbPage</h3>
        <PropsTable rows={[
          ["className", "string", '""', "Additional CSS classes — renders as bold foreground span with aria-current"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">BreadcrumbSeparator</h3>
        <PropsTable rows={[
          ["children", "ReactNode", "ChevronRight", "Custom separator — pass a string or icon to override the default chevron"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">BreadcrumbEllipsis</h3>
        <PropsTable rows={[
          ["className", "string", '""', "Additional CSS classes — renders MoreHorizontal icon with sr-only 'More' label"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--muted-foreground", "zinc-500", "Inactive link and separator color"],
        ["--foreground", "zinc-900", "Current page (BreadcrumbPage) text color"],
        ["--primary", "violet-600", "Link hover color transition target"],
        ["typo-paragraph-sm", "text-sm", "Font size of the entire breadcrumb list"],
        ["gap-xs", "4px", "Gap between items and separators"],
      ]} />

      <BestPractices items={[
        {title:"Current Page",do:"Always render the last item as BreadcrumbPage — it gets aria-current=\"page\" and is non-clickable.",dont:"Make the current page a BreadcrumbLink — clicking it reloads the same page with no benefit."},
        {title:"Path Depth",do:"Use BreadcrumbEllipsis to collapse intermediate levels when the path exceeds 4 items.",dont:"Show every nested level on mobile — the trail overflows and pushes other header content."},
        {title:"Placement",do:"Place the breadcrumb above the page title inside the page header area.",dont:"Use breadcrumb as the sole navigation mechanism — always provide sidebar or back-button alternatives."},
        {title:"Item hover (item)",do:"BreadcrumbLink transitions to text-foreground on hover for clear interactivity.",dont:"Style current page as a link — it should always be non-clickable BreadcrumbPage."},
      ]} />

      <FigmaMapping rows={[
        ["Container", "nav", "Breadcrumb", "Root nav element with aria-label"],
        ["List", "ol", "BreadcrumbList", "Flex row with gap-xs and text-sm"],
        ["Link item", "Inactive link", "BreadcrumbLink", "text-muted-foreground → hover:text-foreground"],
        ["Current page", "Active label", "BreadcrumbPage", "font-semibold text-foreground + aria-current"],
        ["Separator", "Chevron / Slash", "BreadcrumbSeparator", "children prop — default ChevronRight icon"],
        ["Ellipsis", "...", "BreadcrumbEllipsis", "MoreHorizontal icon + sr-only More label"],
        ["Item: Link", "text-muted-foreground hover:text-foreground", "BreadcrumbLink", "Default link item"],
        ["Item: Current Page", "font-semibold text-foreground", "BreadcrumbPage", "aria-current=\"page\""],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Tab", "Move focus to the next breadcrumb link"],
          ["Shift+Tab", "Move focus to the previous breadcrumb link"],
          ["Enter", "Follow the focused link"],
        ]}
        notes={[
          "Root nav element has aria-label=\"breadcrumb\" for landmark navigation",
          "BreadcrumbPage renders with aria-current=\"page\" to identify the active location",
          "BreadcrumbSeparator has role=\"presentation\" and aria-hidden=\"true\" — excluded from the accessibility tree",
          "BreadcrumbEllipsis has aria-hidden=\"true\" with a visually-hidden 'More' label for screen readers",
        ]}
      />

      <RelatedComponents items={[
        {name:"Pagination",desc:"Navigates between pages of a data set. Use Pagination for numbered page controls; use Breadcrumb for hierarchical location trails."},
        {name:"Tabs",desc:"Switches between sibling views within the same page. Use Tabs for in-page navigation; use Breadcrumb to show the path to the current page."},
        {name:"NavigationMenu",desc:"Top-level app navigation with dropdowns. Use NavigationMenu for primary routes; use Breadcrumb to show context within a route."},
      ]} />
    </div>
  )
}

function PaginationDocs() {
  const [activePage, setActivePage] = useState("3")
  const [showEllipsis, setShowEllipsis] = useState(true)
  const [showPrev, setShowPrev] = useState(true)
  const [showNext, setShowNext] = useState(true)
  // Pagination Item explore state
  const [pgItemType, setPgItemType] = useState("page")
  const [pgItemState, setPgItemState] = useState("default")
  const [pgItemActive, setPgItemActive] = useState(false)
  const isPgItemHover = pgItemState === "hover"
  const isPgItemDisabled = pgItemState === "disabled"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Navigation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Pagination</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Page navigation controls for paged content like data tables and lists. Composed of Previous, Next, numbered links, and an Ellipsis for large page counts.</p>
      </header>

      {/* 2. Explore Behavior — tabbed: Pagination | Pagination Item */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
        <Tabs defaultValue="pagination-group" className="w-full">
          <div className="border border-border rounded-xl overflow-hidden">
            <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
              <TabsTrigger value="pagination-group" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Pagination</span></TabsTrigger>
              <TabsTrigger value="pagination-item" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Pagination Item</span></TabsTrigger>
            </TabsList>

            {/* Tab 1: Pagination Group */}
            <TabsContent value="pagination-group" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <Pagination>
                    <PaginationContent>
                      {showPrev && <PaginationItem><PaginationPrevious href="#" className={cn(activePage === "1" && isPgItemHover && "bg-accent text-accent-foreground", activePage === "1" && isPgItemDisabled && "pointer-events-none opacity-50")} /></PaginationItem>}
                      {["1","2","3","4","5"].map(p => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            href="#"
                            isActive={p === activePage ? pgItemActive : false}
                            className={cn(p === activePage && isPgItemHover && "bg-accent text-accent-foreground", p === activePage && isPgItemDisabled && "pointer-events-none opacity-50")}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      {showEllipsis && (
                        <>
                          <PaginationItem><PaginationEllipsis /></PaginationItem>
                          <PaginationItem><PaginationLink href="#">20</PaginationLink></PaginationItem>
                        </>
                      )}
                      {showNext && <PaginationItem><PaginationNext href="#" className={cn(activePage === "5" && isPgItemHover && "bg-accent text-accent-foreground", activePage === "5" && isPgItemDisabled && "pointer-events-none opacity-50")} /></PaginationItem>}
                    </PaginationContent>
                  </Pagination>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Active Page</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["1","2","3","4","5"].map(p => (
                          <button key={p} onClick={() => setActivePage(p)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors", activePage === p ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{p}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-lg gap-y-xs">
                      <div className="flex flex-col gap-xs">
                        <Label className="text-xs text-muted-foreground font-body">Ellipsis</Label>
                        <Switch checked={showEllipsis} onCheckedChange={setShowEllipsis} />
                      </div>
                      <div className="flex flex-col gap-xs">
                        <Label className="text-xs text-muted-foreground font-body">Show Prev</Label>
                        <Switch checked={showPrev} onCheckedChange={setShowPrev} />
                      </div>
                      <div className="flex flex-col gap-xs">
                        <Label className="text-xs text-muted-foreground font-body">Show Next</Label>
                        <Switch checked={showNext} onCheckedChange={setShowNext} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Pagination Item */}
            <TabsContent value="pagination-item" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          {pgItemType === "page" && <PaginationLink href="#" isActive={pgItemActive} className={cn(isPgItemHover && "bg-accent text-accent-foreground", isPgItemDisabled && "pointer-events-none opacity-50")}>5</PaginationLink>}
                          {pgItemType === "previous" && <PaginationPrevious href="#" className={cn(isPgItemHover && "bg-accent text-accent-foreground", isPgItemDisabled && "pointer-events-none opacity-50")} />}
                          {pgItemType === "next" && <PaginationNext href="#" className={cn(isPgItemHover && "bg-accent text-accent-foreground", isPgItemDisabled && "pointer-events-none opacity-50")} />}
                          {pgItemType === "ellipsis" && <PaginationEllipsis />}
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Type</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["page", "previous", "next", "ellipsis"].map(type => (
                          <button key={type} onClick={() => { setPgItemType(type); if (type !== "page") setPgItemActive(false); if (type === "ellipsis") setPgItemState("default") }} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", pgItemType === type ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{type}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">State</Label>
                      <div className="flex flex-wrap gap-xs">
                        {(pgItemType === "ellipsis" ? ["default"] : ["default", "hover", "disabled"]).map(s => (
                          <button key={s} onClick={() => setPgItemState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", pgItemState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-lg gap-y-xs">
                      <div className="flex flex-col gap-xs">
                        <Label className="text-xs text-muted-foreground font-body">Active</Label>
                        <Switch checked={pgItemActive} onCheckedChange={setPgItemActive} disabled={pgItemType !== "page"} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>

      <InstallationSection pkg={[]} importCode={`import {\n  Pagination,\n  PaginationContent,\n  PaginationItem,\n  PaginationLink,\n  PaginationPrevious,\n  PaginationNext,\n  PaginationEllipsis,\n} from "@/components/ui/pagination"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="With Ellipsis" description="Smart window of visible pages with ellipsis for large datasets." code={`<Pagination>\n  <PaginationContent>\n    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>\n    <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationEllipsis /></PaginationItem>\n    <PaginationItem><PaginationLink href="#">4</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationLink href="#" isActive>5</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationLink href="#">6</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationEllipsis /></PaginationItem>\n    <PaginationItem><PaginationLink href="#">20</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationNext href="#" /></PaginationItem>\n  </PaginationContent>\n</Pagination>`}>
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
        <Example title="Simple Prev / Next" description="Minimal navigation without page numbers. Use when total page count is unknown." code={`<Pagination>\n  <PaginationContent>\n    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>\n    <PaginationItem><PaginationNext href="#" /></PaginationItem>\n  </PaginationContent>\n</Pagination>`}>
          <Pagination>
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
              <PaginationItem><PaginationNext href="#" /></PaginationItem>
            </PaginationContent>
          </Pagination>
        </Example>
        <Example title="With Page Info" description="Pair with a results summary label. Use alongside data tables to orient users." code={`<div className="flex items-center justify-between">\n  <p className="text-sm text-muted-foreground">Showing 41–50 of 200 results</p>\n  <Pagination className="w-auto mx-0">\n    <PaginationContent>\n      <PaginationItem><PaginationPrevious href="#" /></PaginationItem>\n      <PaginationItem><PaginationLink href="#" isActive>5</PaginationLink></PaginationItem>\n      <PaginationItem><PaginationNext href="#" /></PaginationItem>\n    </PaginationContent>\n  </Pagination>\n</div>`}>
          <div className="flex items-center justify-between w-full gap-md flex-wrap">
            <p className="text-sm text-muted-foreground">Showing 41–50 of 200 results</p>
            <Pagination className="w-auto mx-0">
              <PaginationContent>
                <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
                <PaginationItem><PaginationLink href="#" isActive>5</PaginationLink></PaginationItem>
                <PaginationItem><PaginationNext href="#" /></PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </Example>
        <Example title="Small Dataset" description="Full page list without ellipsis for datasets with fewer than 8 pages." code={`<Pagination>\n  <PaginationContent>\n    <PaginationItem><PaginationPrevious href="#" /></PaginationItem>\n    <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationLink href="#">4</PaginationLink></PaginationItem>\n    <PaginationItem><PaginationNext href="#" /></PaginationItem>\n  </PaginationContent>\n</Pagination>`}>
          <Pagination>
            <PaginationContent>
              <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
              <PaginationItem><PaginationLink href="#">1</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#" isActive>2</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">3</PaginationLink></PaginationItem>
              <PaginationItem><PaginationLink href="#">4</PaginationLink></PaginationItem>
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
          ["href", "string", "—", "Page URL or anchor"],
          ["isActive", "boolean", "false", "Marks this link as the current page — applies outline variant and aria-current"],
          ["size", '"default" | "icon"', '"icon"', "Link button size. icon = square (36×36px), default = pill with label"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">PaginationPrevious / PaginationNext</h3>
        <PropsTable rows={[
          ["href", "string", "—", "URL for previous or next page"],
          ["className", "string", '""', "Additional classes passed to the underlying PaginationLink"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">PaginationEllipsis</h3>
        <PropsTable rows={[
          ["className", "string", '""', "Additional classes on the span wrapper"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--primary","violet-600","Active page background (filled button)"],
        ["--primary-foreground","white","Active page text"],
        ["--ghost (hover)","zinc-800","Inactive page hover background"],
        ["--muted-foreground","zinc-400","Ellipsis icon color"],
        ["--border","zinc-700","Active page outline border (outline variant)"],
      ]} />
      <BestPractices items={[
        {do:"Show a smart window of 5 visible pages max with ellipsis at both ends for large datasets.",dont:"Show all page numbers for datasets with 20+ pages — it overflows the row."},
        {do:"Include a 'Showing X–Y of Z results' label alongside the controls to orient users.",dont:"Use pagination for fewer than 10 items — show all items instead."},
        {do:"Use PaginationEllipsis + last page number so users can jump to the end.",dont:"Hide the total page count — users need to know how far the dataset extends."},
        {title:"Active item (item)", do:"Mark exactly one page link as isActive to indicate the current page.", dont:"Mark multiple page links as active simultaneously."},
      ]} />
      <FigmaMapping rows={[
        ["State","Default","isActive={false}","ghost variant, no border"],
        ["State","Active","isActive={true}","outline variant, border-border"],
        ["Nav","Previous","PaginationPrevious","ChevronLeft + 'Previous' label"],
        ["Nav","Next","PaginationNext","'Next' label + ChevronRight"],
        ["Overflow","Ellipsis","PaginationEllipsis","MoreHorizontal icon, aria-hidden"],
        ["Item: Page Link","ghost button, border on active","PaginationLink","isActive for current page"],
        ["Item: Previous","ChevronLeft + label","PaginationPrevious","ghost variant"],
        ["Item: Next","Label + ChevronRight","PaginationNext","ghost variant"],
        ["Item: Ellipsis","MoreHorizontal icon","PaginationEllipsis","aria-hidden"],
      ]} />
      <AccessibilityInfo keyboard={[["Tab","Move focus between page links"],["Enter / Space","Navigate to page"]]} notes={["<nav role=\"navigation\" aria-label=\"pagination\"> wraps all controls","Active page link has aria-current=\"page\"","PaginationEllipsis has aria-hidden — screen readers skip it"]} />
      <RelatedComponents items={[
        {name:"Table",desc:"Pair with Table for navigating large datasets across multiple pages."},
        {name:"Breadcrumb",desc:"For hierarchical location navigation — not page number navigation."},
        {name:"Tabs",desc:"For switching between content panels, not paged datasets."},
      ]} />
    </div>
  )
}

function SliderWithLabel() {
  const [vol, setVol] = useState([60])
  return (
    <div className="w-full max-w-sm space-y-xs">
      <div className="flex justify-between"><Label>Volume</Label><span className="text-sm text-muted-foreground">{vol[0]}%</span></div>
      <Slider value={vol} onValueChange={setVol} max={100} step={1} />
    </div>
  )
}

function SliderDocs() {
  const [val, setVal] = useState([50])
  const [state, setState] = useState("default")
  const isDisabled = state === "disabled"
  const isFocus = state === "focus"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Slider</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A range input for selecting a numeric value within a defined min/max boundary by dragging a thumb along a track. Supports single and dual-thumb ranges, step increments, and controlled or uncontrolled usage.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Value", type: "select", options: ["0","25","50","75","100"], value: String(val[0]), onChange: (v: string) => setVal([Number(v)]) },
        { label: "State", type: "select", options: ["default","focus","disabled"], value: state, onChange: setState },
      ]}>
        <div className="w-full max-w-sm space-y-xs">
          <Slider
            value={val}
            onValueChange={setVal}
            max={100}
            step={1}
            disabled={isDisabled}
            className={cn(isFocus && "[&_[data-slot=slider-thumb]]:ring-[3px] [&_[data-slot=slider-thumb]]:ring-ring [&_[data-slot=slider-thumb]]:outline-none")}
          />
          <p className="text-sm text-muted-foreground text-center font-body">{val[0]}</p>
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-slider"]} importCode={`import { Slider } from "@/components/ui/slider"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Default" description="Uncontrolled slider at 50% with default step of 1 — renders immediately without any state management." code={`<Slider defaultValue={[50]} max={100} step={1} />`}>
            <Slider defaultValue={[50]} max={100} step={1} className="w-full max-w-sm" />
          </Example>
          <Example title="Step Increments" description="Step=10 snaps the thumb to 11 discrete positions — useful for coarse controls like volume or brightness." code={`<Slider defaultValue={[50]} step={10} />`}>
            <Slider defaultValue={[50]} step={10} className="w-full max-w-sm" />
          </Example>
          <Example title="Custom Range" description="Custom min/max constrains the selectable boundary — here 0–200 with step 25 for a budget selector." code={`<Slider defaultValue={[100]} min={0} max={200} step={25} />`}>
            <div className="w-full max-w-sm space-y-xs">
              <Slider defaultValue={[100]} min={0} max={200} step={25} />
              <div className="flex justify-between text-xs text-muted-foreground"><span>0</span><span>200</span></div>
            </div>
          </Example>
          <Example title="Dual Thumb Range" description="Two thumbs select a min/max range — use for price filters, date ranges, or any bounded selection." code={`<Slider defaultValue={[20, 80]} max={100} step={1} />`}>
            <div className="w-full max-w-sm space-y-xs">
              <Slider defaultValue={[20, 80]} max={100} step={1} />
              <div className="flex justify-between text-xs text-muted-foreground"><span>20</span><span>80</span></div>
            </div>
          </Example>
          <Example title="With Label and Value" description="Paired with a label and live value display — the complete pattern for a labeled form field." code={`const [vol, setVol] = useState([60])\n<div className="flex justify-between">\n  <Label>Volume</Label>\n  <span>{vol[0]}%</span>\n</div>\n<Slider value={vol} onValueChange={setVol} max={100} />`}>
            <SliderWithLabel />
          </Example>
          <Example title="Interactive" description="Controlled slider with useState — value display updates live as the thumb is dragged." code={`const [val, setVal] = useState([50])\n<Slider value={val} onValueChange={setVal} />\n<p>Value: {val[0]}</p>`}>
            <div className="w-full max-w-sm space-y-xs">
              <Slider value={val} onValueChange={setVal} max={100} step={1} />
              <p className="text-sm text-muted-foreground text-center">Value: {val[0]}</p>
            </div>
          </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["value", "number[]", "—", "Controlled value(s) — array for single or dual thumb"],
          ["defaultValue", "number[]", "[0]", "Initial value(s) for uncontrolled usage"],
          ["min", "number", "0", "Minimum selectable value"],
          ["max", "number", "100", "Maximum selectable value"],
          ["step", "number", "1", "Step increment between selectable values"],
          ["onValueChange", "(value: number[]) => void", "—", "Callback fired when value changes"],
          ["disabled", "boolean", "false", "Disable the slider"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--primary", "violet-600", "Thumb border and filled range track"],
        ["--muted", "zinc-100", "Empty track background"],
        ["--background", "white", "Thumb fill color"],
        ["--ring", "violet-600/30", "Focus ring on thumb"],
      ]} />
      <BestPractices items={[
        { title: "Show the current value", do: "Display the current value alongside the slider — either as a live label or a static readout.", dont: "Rely on the thumb position alone — users cannot determine the exact value without a numeric display." },
        { title: "Set meaningful step", do: "Choose a step that matches the granularity of the data — step=10 for volume (0-100), step=25 for a budget range.", dont: "Use step=1 for ranges spanning thousands — the thumb becomes too sensitive and hard to control." },
        { title: "Single vs range", do: "Use a single thumb for a single value (volume, brightness) and dual thumbs for a min/max range (price filter).", dont: "Use a slider when the user needs to enter a precise value — use Input[type=number] instead." },
      ]} />
      <FigmaMapping rows={[
        ["Track", "h-6px, bg-muted, rounded-full", "SliderPrimitive.Track", "h-1.5 rounded-full bg-muted"],
        ["Range", "bg-primary, h-full", "SliderPrimitive.Range", "absolute h-full bg-primary"],
        ["Thumb", "16×16px circle, border-primary 2px", "SliderPrimitive.Thumb", "size-md rounded-full border-2 border-primary bg-background"],
        ["State", "Focus", "className", "[data-slot=slider-thumb]:ring-[3px] ring-ring outline-none"],
        ["State", "Disabled", "disabled", "true — root: opacity-50 cursor-not-allowed; range: muted-foreground/40; thumb: border-border-strong bg-muted"],
        ["Value", "0–100 (single) or [min,max] (range)", "value", "number[] — single: [50], range: [20,80]"],
        ["Step", "1 / 5 / 10 / 25", "step", "number"],
      ]} />
      <AccessibilityInfo
        keyboard={[
          ["Tab", "Focus the slider thumb"],
          ["Arrow Left / Down", "Decrease value by one step"],
          ["Arrow Right / Up", "Increase value by one step"],
          ["Home", "Jump to minimum value"],
          ["End", "Jump to maximum value"],
        ]}
        notes={[
          "Uses role=\"slider\" with aria-valuenow, aria-valuemin, aria-valuemax — announced live by screen readers",
          "Provide aria-label or aria-labelledby on the Slider root for context (e.g. 'Volume')",
          "For dual-thumb range sliders, each thumb gets its own aria-label (e.g. 'Minimum price', 'Maximum price')",
        ]}
      />
      <RelatedComponents items={[
        { name: "Input", desc: "Use Input[type=number] when the user needs to enter a precise numeric value. Slider is better when approximate range selection is more natural than typing a number." },
        { name: "Progress", desc: "Progress is a read-only indicator of system-driven completion state. Use Slider when the user controls the value — use Progress to communicate status they cannot change." },
      ]} />
    </div>
  )
}


function LabelDocs() {
  const [labelRequired, setLabelRequired] = useState(false)
  const [labelDisabled, setLabelDisabled] = useState(false)
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Label</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">An accessible form label that links to its control via htmlFor, enabling click-to-focus and screen reader association. Automatically dims and shows a not-allowed cursor when the linked control is disabled.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Required", type: "toggle", value: labelRequired, onChange: setLabelRequired },
        { label: "Disabled", type: "toggle", value: labelDisabled, onChange: setLabelDisabled },
      ]}>
        <div className="flex flex-col gap-3xs w-full max-w-xs">
          <Label htmlFor="eb-label" className={labelDisabled ? "opacity-50 cursor-not-allowed" : ""}>
            Email address{labelRequired && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <Input id="eb-label" placeholder="name@example.com" disabled={labelDisabled} />
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-label"]} importCode={`import { Label } from "@/components/ui/label"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="With Input" description="Stack label above input using flex-col — the most common pattern for text fields." code={`<div className="flex flex-col gap-3xs">\n  <Label htmlFor="email">Email</Label>\n  <Input id="email" type="email" placeholder="name@example.com" />\n</div>`}>
          <div className="flex flex-col gap-3xs w-full max-w-xs">
            <Label htmlFor="ex-email">Email</Label>
            <Input id="ex-email" type="email" placeholder="name@example.com" />
          </div>
        </Example>
        <Example title="Required Field" description="Add a destructive asterisk inside the label to indicate a required field." code={`<Label htmlFor="name">\n  Full name <span className="text-destructive">*</span>\n</Label>\n<Input id="name" required />`}>
          <div className="flex flex-col gap-3xs w-full max-w-xs">
            <Label htmlFor="ex-name">Full name <span className="text-destructive">*</span></Label>
            <Input id="ex-name" placeholder="Jane Smith" required />
          </div>
        </Example>
        <Example title="With Checkbox" description="Place label inline beside the checkbox using flex items-center." code={`<div className="flex items-center gap-xs">\n  <Checkbox id="terms" />\n  <Label htmlFor="terms">Accept terms and conditions</Label>\n</div>`}>
          <div className="flex items-center gap-xs">
            <Checkbox id="ex-terms" />
            <Label htmlFor="ex-terms">Accept terms and conditions</Label>
          </div>
        </Example>
        <Example title="With Switch" description="Same inline pattern as Checkbox — label and switch aligned on a row." code={`<div className="flex items-center gap-xs">\n  <Switch id="notifs" />\n  <Label htmlFor="notifs">Email notifications</Label>\n</div>`}>
          <div className="flex items-center gap-xs">
            <Switch id="ex-notifs" />
            <Label htmlFor="ex-notifs">Email notifications</Label>
          </div>
        </Example>
        <Example title="With Textarea" description="Stack label above a multi-line textarea — identical layout to Input." code={`<div className="flex flex-col gap-3xs">\n  <Label htmlFor="bio">Bio</Label>\n  <Textarea id="bio" placeholder="Tell us about yourself" />\n</div>`}>
          <div className="flex flex-col gap-3xs w-full max-w-xs">
            <Label htmlFor="ex-bio">Bio</Label>
            <Textarea id="ex-bio" placeholder="Tell us about yourself" rows={3} />
          </div>
        </Example>
        <Example title="Disabled Control" description="Label dims automatically via peer-disabled when the paired input is disabled." code={`<div className="flex flex-col gap-3xs">\n  <Label htmlFor="locked">API Key</Label>\n  <Input id="locked" disabled value="sk-••••••••" />\n</div>`}>
          <div className="flex flex-col gap-3xs w-full max-w-xs">
            <Label htmlFor="ex-locked">API Key</Label>
            <Input id="ex-locked" disabled value="sk-••••••••" />
          </div>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground font-body">Built on <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">@radix-ui/react-label</code>. Supports all Radix Label props in addition to the following:</p>
        <PropsTable rows={[
          ["htmlFor", "string", "—", "ID of the associated form control (required for accessibility)"],
          ["children", "ReactNode", "—", "Label text — include a destructive span for required indicator"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--foreground","zinc-950 / zinc-50","Label text color"],
        ["--destructive","red-500","Required asterisk color"],
        ["typo-paragraph-sm-medium","14px / 500","Font size and weight (from design system)"],
      ]} />
      <BestPractices items={[
        {do:"Always set htmlFor matching the input id — this is required for click-to-focus and screen reader association.",dont:"Use a plain <span> or <p> as a visual label without htmlFor — screen readers cannot associate it with the input."},
        {do:"Place visible labels above or beside every input. Use placeholder only as supplementary hint.",dont:"Replace labels with placeholders — placeholders disappear on focus and are not accessible labels."},
        {do:"Add a destructive asterisk inside the label text to mark required fields consistently.",dont:"Use color alone to communicate 'required' — always pair it with a text symbol like *."},
      ]} />
      <FigmaMapping rows={[
        ["Text style","paragraph-sm-medium (14px/500)","—","typo-paragraph-sm-medium"],
        ["Color","zinc-950 / zinc-50","—","text-foreground"],
        ["Required indicator","red asterisk *","—","<span className='text-destructive'>*</span> inside children"],
        ["State — Default","opacity 100%","—","Normal label"],
        ["State — Disabled","opacity 50%, cursor not-allowed","—","peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"],
        ["htmlFor link","Figma group Label + Input","htmlFor","Must match input id prop"],
      ]} />
      <AccessibilityInfo keyboard={[
        ["Click label","Move focus to the associated form control"],
      ]} notes={[
        "htmlFor must match the id of the associated control — required for all screen readers",
        "Clicking the label programmatically focuses and activates the linked control (checkbox, switch, input)",
        "peer-disabled:opacity-50 requires the sibling input to have className='peer' for the CSS selector to work",
        "role is implicitly 'label' via the native <label> element — no aria-label needed",
        "For required fields, also add the required attribute on the input for form validation",
      ]} />
      <RelatedComponents items={[
        {name:"Input",desc:"Standard text field — always paired with a Label via htmlFor for accessibility."},
        {name:"Checkbox",desc:"Toggle control — label placed inline beside the checkbox using flex items-center."},
        {name:"Switch",desc:"Boolean control — same inline layout pattern as Checkbox."},
        {name:"Form",desc:"Wraps Label, Input, and error message into a complete accessible field group."},
      ]} />
    </div>
  )
}

function ScrollAreaDocs() {
  const contacts = ["Alice Wang", "Bob Smith", "Carol Chen", "Dan Park", "Elena Ross", "Frank Liu", "Grace Kim", "Henry Patel", "Iris Müller", "James Okonkwo"]
  const tags = ["React", "TypeScript", "Tailwind CSS", "Vite", "Radix UI", "Zustand", "React Query", "Framer Motion", "Recharts", "shadcn/ui", "Lucide", "Zod"]

  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Layout</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Scroll Area</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          A custom scrollable container that replaces the native browser scrollbar with a styled, cross-browser consistent thumb. Vertical and horizontal axes each require their own <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">ScrollBar</code> component; scrollbar visibility is controlled via the <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">type</code> prop.
        </p>
      </header>

      {/* 2. Explore Behavior — ScrollBar as main component */}
      <ExploreBehavior>
        <div className="flex items-end gap-2xl">
          <div className="flex flex-col items-center gap-xs">
            <div className="flex items-center justify-center w-1.5 h-44">
              <div className="w-1 h-16 rounded-full bg-black/15 dark:bg-white/35" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">Vertical</span>
          </div>
          <div className="flex flex-col items-center gap-xs">
            <div className="flex items-center justify-center w-72 h-1.5">
              <div className="w-20 h-1 rounded-full bg-black/15 dark:bg-white/35" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">Horizontal</span>
          </div>
        </div>
      </ExploreBehavior>

      {/* 3. Installation */}
      <InstallationSection
        pkg={["@radix-ui/react-scroll-area"]}
        importCode={`import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">

          <Example
            title="Type: Hover (Default)"
            description="Scrollbar appears on hover and fades out when idle. The default behavior."
            code={`<ScrollArea className="h-44 w-56 rounded-md border" type="hover">\n  {items.map(item => (\n    <div className="px-sm py-xs border-b">{item}</div>\n  ))}\n</ScrollArea>`}
          >
            <ScrollArea className="h-44 w-56 rounded-md border" type="hover">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="flex items-center gap-sm px-sm py-xs border-b border-border last:border-0">
                  <div className="size-2 rounded-full bg-primary/60 shrink-0" />
                  <span className="text-sm text-foreground">Notification {i + 1}</span>
                </div>
              ))}
            </ScrollArea>
          </Example>

          <Example
            title="Type: Always"
            description="Scrollbar is always visible regardless of interaction state."
            code={`<ScrollArea className="h-44 w-56 rounded-md border" type="always">\n  {items.map(item => (\n    <div className="px-sm py-xs border-b">{item}</div>\n  ))}\n</ScrollArea>`}
          >
            <ScrollArea className="h-44 w-56 rounded-md border" type="always">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="flex items-center gap-sm px-sm py-xs border-b border-border last:border-0">
                  <div className="size-2 rounded-full bg-primary/60 shrink-0" />
                  <span className="text-sm text-foreground">Notification {i + 1}</span>
                </div>
              ))}
            </ScrollArea>
          </Example>

          <Example
            title="Type: Auto"
            description="Scrollbar appears only when content overflows the container."
            code={`<ScrollArea className="h-44 w-56 rounded-md border" type="auto">\n  {items.map(item => (\n    <div className="px-sm py-xs border-b">{item}</div>\n  ))}\n</ScrollArea>`}
          >
            <ScrollArea className="h-44 w-56 rounded-md border" type="auto">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="flex items-center gap-sm px-sm py-xs border-b border-border last:border-0">
                  <div className="size-2 rounded-full bg-primary/60 shrink-0" />
                  <span className="text-sm text-foreground">Notification {i + 1}</span>
                </div>
              ))}
            </ScrollArea>
          </Example>

          <Example
            title="Type: Scroll"
            description="Scrollbar appears only while actively scrolling."
            code={`<ScrollArea className="h-44 w-56 rounded-md border" type="scroll">\n  {items.map(item => (\n    <div className="px-sm py-xs border-b">{item}</div>\n  ))}\n</ScrollArea>`}
          >
            <ScrollArea className="h-44 w-56 rounded-md border" type="scroll">
              {Array.from({ length: 12 }, (_, i) => (
                <div key={i} className="flex items-center gap-sm px-sm py-xs border-b border-border last:border-0">
                  <div className="size-2 rounded-full bg-primary/60 shrink-0" />
                  <span className="text-sm text-foreground">Notification {i + 1}</span>
                </div>
              ))}
            </ScrollArea>
          </Example>

          <Example
            title="Horizontal Scroll"
            description="Tag or card row that overflows the container width. Add ScrollBar with orientation='horizontal' for the custom thumb."
            code={`<ScrollArea className="w-72 rounded-md border">\n  <div className="flex gap-sm p-sm">\n    {tags.map(tag => (\n      <Badge key={tag} variant="outline" className="shrink-0">{tag}</Badge>\n    ))}\n  </div>\n  <ScrollBar orientation="horizontal" />\n</ScrollArea>`}
          >
            <ScrollArea className="w-72 rounded-md border">
              <div className="flex gap-sm p-sm">
                {tags.map(tag => (
                  <Badge key={tag} variant="outline" className="shrink-0 whitespace-nowrap">{tag}</Badge>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </Example>

          <Example
            title="Vertical List"
            description="Scrollable contact or user list with avatars."
            code={`<ScrollArea className="h-52 w-56 rounded-md border">\n  {contacts.map(name => (\n    <div key={name} className="flex items-center gap-sm px-sm py-xs border-b border-border last:border-0">\n      <Avatar className="size-7"><AvatarFallback>{name[0]}</AvatarFallback></Avatar>\n      <span className="text-sm">{name}</span>\n    </div>\n  ))}\n</ScrollArea>`}
          >
            <ScrollArea className="h-52 w-56 rounded-md border">
              {contacts.map(name => (
                <div key={name} className="flex items-center gap-sm px-sm py-xs border-b border-border last:border-0">
                  <Avatar className="size-7">
                    <AvatarFallback className="text-xs">{name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground">{name}</span>
                </div>
              ))}
            </ScrollArea>
          </Example>

        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">ScrollArea</h3>
        <PropsTable rows={[
          ["type",      '"auto" | "always" | "scroll" | "hover"', '"hover"',  'Scrollbar visibility — "hover" shows on hover, "always" always visible, "scroll" shows while scrolling, "auto" shows when overflowing'],
          ["className", "string",                                  "—",        "Container classes — always include a height constraint (h-48, h-[300px]...) or ScrollArea will not scroll"],
          ["children",  "ReactNode",                               "—",        "Scrollable content"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">ScrollBar</h3>
        <PropsTable rows={[
          ["orientation", '"vertical" | "horizontal"', '"vertical"', "Axis of the scrollbar. Add a second ScrollBar with orientation='horizontal' to enable horizontal scrolling."],
          ["className",   "string",                    "—",          "Override scrollbar width, color, or padding"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["bg-black/15",    "rgba(0,0,0,0.15)",  "Scrollbar thumb color — light mode"],
        ["bg-white/35",    "rgba(255,255,255,0.35)", "Scrollbar thumb color — dark mode"],
        ["w-1.5 / h-1.5",  "6px",              "Scrollbar track width (vertical) / height (horizontal)"],
        ["rounded-full",   "9999px",            "Thumb border radius"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          do:   "Always set an explicit height on the ScrollArea container (h-48, h-[300px], or max-h-*). Without a height constraint the container expands to fit content and never scrolls.",
          dont: "Skip the height class and wonder why the scrollbar never appears — ScrollArea requires the parent to be constrained.",
        },
        {
          do:   "Add <ScrollBar orientation='horizontal' /> as a child of ScrollArea when content overflows horizontally (tag rows, wide tables, image carousels). The default ScrollBar is vertical-only.",
          dont: "Rely on browser native horizontal scrollbar — it won't appear inside a ScrollArea without an explicit horizontal ScrollBar child.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["Type", "Hover",  "type", '"hover"'],
        ["Type", "Always", "type", '"always"'],
        ["Type", "Auto",   "type", '"auto"'],
        ["Type", "Scroll", "type", '"scroll"'],
        ["Axis", "Vertical",   "ScrollBar orientation", '"vertical"'],
        ["Axis", "Horizontal", "ScrollBar orientation", '"horizontal"'],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[
          ["Arrow Up / Down",   "Scroll vertically when the scroll area is focused"],
          ["Arrow Left / Right","Scroll horizontally (horizontal ScrollArea)"],
          ["Page Up / Down",    "Scroll by a full page height"],
          ["Home / End",        "Jump to top or bottom of scrollable content"],
        ]}
        notes={[
          "ScrollArea uses overflow-hidden on the root — content remains accessible to screen readers via the Viewport region.",
          "The custom scrollbar is visually positioned but does not interfere with keyboard navigation of inner content.",
          "Focusable elements inside ScrollArea (buttons, links, inputs) remain tab-navigable in DOM order.",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Card",      desc: "For bordered content containers — wrap a ScrollArea inside CardContent for a scrollable card body." },
        { name: "Table",     desc: "Wrap a Table in a horizontal ScrollArea to handle wide data on small viewports." },
        { name: "Separator", desc: "Use inside a vertical ScrollArea to divide list items cleanly." },
        { name: "Sidebar",   desc: "App sidebar uses ScrollArea to keep nav scrollable while header/footer stay fixed." },
      ]} />

    </div>
  )
}

// ============================================================
// NEW COMPONENT DOCS
// ============================================================

function AlertDialogDocs() {
  const [type, setType] = useState("Desktop")
  const [showAction, setShowAction] = useState(true)
  const [showActionSecondary, setShowActionSecondary] = useState(true)

  const isMobile = type === "Mobile"

  const handleShowActionChange = (v: boolean) => {
    setShowAction(v)
    if (!v) setShowActionSecondary(false)
  }

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
        { label: "Show Action", type: "toggle", value: showAction, onChange: handleShowActionChange },
        { label: "Show Action Secondary", type: "toggle", value: showActionSecondary, onChange: setShowActionSecondary, disabled: !showAction },
      ]}>
        <div className={cn(
          "relative bg-card border border-border rounded-xl shadow p-xl space-y-lg w-full",
          isMobile ? "max-w-sm" : "max-w-lg",
        )}>
          <div className="space-y-xs">
            <h3 className="text-base font-semibold text-foreground font-heading">Are you absolutely sure?</h3>
            <p className="text-sm text-muted-foreground font-body">This action cannot be undone. This will permanently delete your account and remove your data from our servers.</p>
          </div>
          {showAction && (
            <div className={cn(isMobile ? "flex flex-col-reverse gap-xs" : "flex justify-end gap-xs")}>
              {showActionSecondary && <Button variant="outline" size="sm">Cancel</Button>}
              <Button size="sm">Continue</Button>
            </div>
          )}
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-alert-dialog"]} importCode={`import {\n  AlertDialog, AlertDialogTrigger, AlertDialogContent,\n  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,\n  AlertDialogFooter, AlertDialogAction, AlertDialogCancel\n} from "@/components/ui/alert-dialog"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>

        {/* Phần A: Static previews — dialog face visible without trigger */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Basic Confirmation" description="Standard confirmation with icon, title, description, and Cancel/Continue buttons." code={`<AlertDialog>\n  <AlertDialogTrigger asChild>\n    <Button variant="outline">Show Alert</Button>\n  </AlertDialogTrigger>\n  <AlertDialogContent>\n    <AlertDialogHeader>\n      <AlertDialogTitle>Are you sure?</AlertDialogTitle>\n      <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>\n    </AlertDialogHeader>\n    <AlertDialogFooter>\n      <AlertDialogCancel>Cancel</AlertDialogCancel>\n      <AlertDialogAction>Continue</AlertDialogAction>\n    </AlertDialogFooter>\n  </AlertDialogContent>\n</AlertDialog>`}>
          <div className="w-full border border-border rounded-xl bg-card p-xl shadow pointer-events-none space-y-lg">
            <div className="space-y-xs">
              <h3 className="text-base font-semibold text-foreground font-heading">Are you sure?</h3>
              <p className="text-sm text-muted-foreground font-body">This action cannot be undone. This will permanently delete your account and remove your data from our servers.</p>
            </div>
            <div className="flex justify-end gap-xs">
              <Button variant="outline" size="sm">Cancel</Button>
              <Button size="sm">Continue</Button>
            </div>
          </div>
        </Example>
        <Example title="Destructive" description="Delete confirmation — red action button signals an irreversible destructive operation." code={`<AlertDialogFooter>\n  <AlertDialogCancel>Keep Account</AlertDialogCancel>\n  <AlertDialogAction variant="destructive">Yes, Delete</AlertDialogAction>\n</AlertDialogFooter>`}>
          <div className="w-full border border-border rounded-xl bg-card p-xl shadow pointer-events-none space-y-lg">
            <div className="space-y-xs">
              <h3 className="text-base font-semibold text-foreground font-heading">Delete Account</h3>
              <p className="text-sm text-muted-foreground font-body">All your data, projects, and settings will be permanently deleted. This cannot be reversed.</p>
            </div>
            <div className="flex justify-end gap-xs">
              <Button variant="outline" size="sm">Keep Account</Button>
              <Button variant="destructive" size="sm">Yes, Delete</Button>
            </div>
          </div>
        </Example>
        <Example title="Logout Confirmation" description="Session-ending confirmation — no icon, minimal copy, two clear choices." code={`<AlertDialogContent>\n  <AlertDialogHeader>\n    <AlertDialogTitle>Log out?</AlertDialogTitle>\n    <AlertDialogDescription>You'll need to sign in again to access your account.</AlertDialogDescription>\n  </AlertDialogHeader>\n  <AlertDialogFooter>\n    <AlertDialogCancel>Stay</AlertDialogCancel>\n    <AlertDialogAction>Log Out</AlertDialogAction>\n  </AlertDialogFooter>\n</AlertDialogContent>`}>
          <div className="w-full border border-border rounded-xl bg-card p-xl shadow pointer-events-none space-y-lg">
            <div className="space-y-xs">
              <h3 className="text-base font-semibold text-foreground font-heading">Log out?</h3>
              <p className="text-sm text-muted-foreground font-body">You'll need to sign in again to access your account.</p>
            </div>
            <div className="flex justify-end gap-xs">
              <Button variant="outline" size="sm">Stay</Button>
              <Button size="sm">Log Out</Button>
            </div>
          </div>
        </Example>
        <Example title="Discard Changes" description="Unsaved changes warning — destructive secondary action makes the consequence clear." code={`<AlertDialogFooter>\n  <AlertDialogCancel>Keep Editing</AlertDialogCancel>\n  <AlertDialogAction variant="destructive">Discard</AlertDialogAction>\n</AlertDialogFooter>`}>
          <div className="w-full border border-border rounded-xl bg-card p-xl shadow pointer-events-none space-y-lg">
            <div className="space-y-xs">
              <h3 className="text-base font-semibold text-foreground font-heading">Discard changes?</h3>
              <p className="text-sm text-muted-foreground font-body">You have unsaved changes that will be permanently lost if you leave now.</p>
            </div>
            <div className="flex justify-end gap-xs">
              <Button variant="outline" size="sm">Keep Editing</Button>
              <Button variant="destructive" size="sm">Discard</Button>
            </div>
          </div>
        </Example>
        <Example title="Mobile Layout" description="On small screens, buttons stack vertically in reverse order — action on top, cancel below." code={`{/* AlertDialogFooter auto-stacks on mobile via flex-col-reverse sm:flex-row */}\n<AlertDialogFooter>\n  <AlertDialogCancel>Cancel</AlertDialogCancel>\n  <AlertDialogAction>Continue</AlertDialogAction>\n</AlertDialogFooter>`}>
          <div className="w-full max-w-sm border border-border rounded-xl bg-card p-xl shadow pointer-events-none space-y-lg mx-auto">
            <div className="space-y-xs">
              <h3 className="text-base font-semibold text-foreground font-heading">Are you sure?</h3>
              <p className="text-sm text-muted-foreground font-body">This action cannot be undone.</p>
            </div>
            <div className="flex flex-col-reverse gap-xs">
              <Button variant="outline" size="sm" className="w-full">Cancel</Button>
              <Button size="sm" className="w-full">Continue</Button>
            </div>
          </div>
        </Example>
        </div>

        {/* Phần B: Interactive Demo — click thật để test behavior */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg flex flex-wrap gap-sm">
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="outline" size="sm">Basic</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete your account and remove your data.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Continue</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="sm">Destructive</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Delete Account</AlertDialogTitle><AlertDialogDescription>All your data, projects, and settings will be permanently deleted. This cannot be reversed.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Keep Account</AlertDialogCancel><AlertDialogAction variant="destructive">Yes, Delete</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="outline" size="sm">Logout</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Log out?</AlertDialogTitle><AlertDialogDescription>You'll need to sign in again to access your account.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Stay</AlertDialogCancel><AlertDialogAction>Log Out</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="outline" size="sm">Discard Changes</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Discard changes?</AlertDialogTitle><AlertDialogDescription>You have unsaved changes that will be permanently lost if you leave now.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Keep Editing</AlertDialogCancel><AlertDialogAction variant="destructive">Discard</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground">Built on <code>@radix-ui/react-alert-dialog</code>. All unrecognized props are forwarded to the underlying Radix primitive.</p>
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

      <DesignTokensTable rows={[["--card","white","Content background"],["--border","zinc-200","Content border"],["--backdrop","black/50","Overlay backdrop"],["--destructive","red-500","Destructive action button"],["--muted-foreground","zinc-500","Description text"],["--ring","violet-600/30","Focus ring"]]} />
      <BestPractices items={[{do:"Use AlertDialog for irreversible actions (delete, discard, logout).",dont:"Use AlertDialog for informational messages — use Dialog or Alert instead."},{do:"Make the action button label specific: 'Delete Account' not just 'OK'.",dont:"Use generic labels like 'Yes'/'No' — users should know the action without reading the description."},{do:"Keep the description short and focused — one action, one consequence.",dont:"Stack multiple confirmation steps or unrelated decisions inside one dialog."}]} />
      <FigmaMapping rows={[
        ["Overlay","Black 50%","AlertDialogOverlay","bg-black/50, fixed inset-0, z-50"],
        ["Content","bg-card, border, shadow","AlertDialogContent","max-w-lg, rounded-xl, p-xl, gap-lg"],
        ["Title","SP/H4","AlertDialogTitle","text-base font-semibold font-heading text-foreground"],
        ["Description","SP/Body","AlertDialogDescription","text-sm text-muted-foreground font-body"],
        ["Footer Desktop","flex, justify-end, gap-xs","AlertDialogFooter","flex justify-end gap-xs"],
        ["Footer Mobile","flex-col, gap-xs","AlertDialogFooter","flex flex-col-reverse gap-xs"],
        ["Action","Button instance (Default/Small)","AlertDialogAction","Wraps Radix in Button via asChild"],
        ["Cancel","Button instance (Outline/Small)","AlertDialogCancel","Wraps Radix in Button via asChild"],
        ["Type","Desktop / Mobile","—","Desktop = max-w-lg (512px), Mobile = max-w-sm (384px)"],
        ["Show Action","Yes / No","—","Toggle footer action buttons"],
        ["Show Action Secondary","Yes / No","—","Toggle Cancel button (requires Show Action=Yes)"],
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
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A single toggle section that shows or hides content, triggered by any custom element wrapped in CollapsibleTrigger. Built on @radix-ui/react-collapsible — use for one expandable area; use Accordion when you need a stacked list of sections.</p>
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

      <InstallationSection pkg={["@radix-ui/react-collapsible"]} importCode={`import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="Basic" description="Uncontrolled — the component manages its own open state. Use CollapsibleTrigger asChild to attach toggle behavior to any element." code={`<Collapsible className="space-y-xs">\n  <div className="flex items-center justify-between">\n    <h4 className="text-sm font-semibold">3 items tagged</h4>\n    <CollapsibleTrigger asChild>\n      <Button variant="ghost" size="sm"><ChevronsUpDown className="size-4" /></Button>\n    </CollapsibleTrigger>\n  </div>\n  <div className="rounded-md border px-md py-xs text-sm">@radix-ui/primitives</div>\n  <CollapsibleContent className="space-y-xs">\n    <div className="rounded-md border px-md py-xs text-sm">@radix-ui/colors</div>\n    <div className="rounded-md border px-md py-xs text-sm">@stitches/react</div>\n  </CollapsibleContent>\n</Collapsible>`}>
          <Collapsible className="w-full max-w-sm space-y-xs">
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
        <Example title="Default Open" description="Use defaultOpen to start the section expanded on mount — useful for content that should be immediately visible." code={`<Collapsible defaultOpen className="space-y-xs">...</Collapsible>`}>
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
        <Example title="Disabled" description="disabled prevents the trigger from toggling. The content remains in its current open/closed state and cannot be changed." code={`<Collapsible disabled defaultOpen className="space-y-xs">...</Collapsible>`}>
          <Collapsible disabled defaultOpen className="w-full max-w-sm space-y-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Locked section</h4>
              <CollapsibleTrigger asChild><Button variant="ghost" size="sm" disabled><ChevronsUpDown className="size-4" /></Button></CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-xs">
              <div className="rounded-md border px-md py-xs text-sm text-muted-foreground">This content cannot be collapsed.</div>
            </CollapsibleContent>
          </Collapsible>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground">Built on <code>@radix-ui/react-collapsible</code>. All props are forwarded to the underlying Radix primitives. The component itself has no built-in styles — layout and appearance are fully controlled by className.</p>
        <h3 className="font-semibold text-sm mt-md">Collapsible</h3>
        <PropsTable rows={[
          ["open", "boolean", "—", "Controlled open state — pair with onOpenChange"],
          ["defaultOpen", "boolean", "false", "Uncontrolled: start expanded on mount"],
          ["onOpenChange", "(open: boolean) => void", "—", "Fires when open state changes"],
          ["disabled", "boolean", "false", "Prevent trigger from toggling the open state"],
          ["className", "string", "—", "Additional CSS classes on the root element"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">CollapsibleTrigger</h3>
        <PropsTable rows={[
          ["asChild", "boolean", "false", "Merge trigger behavior onto child element instead of rendering a default button — required when using Button or other components as trigger"],
          ["className", "string", "—", "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">CollapsibleContent</h3>
        <PropsTable rows={[
          ["className", "string", "—", "Applied to the content wrapper — use for spacing, padding, and layout of hidden content"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--border","zinc-200","Commonly used for content area border"],
        ["--foreground","zinc-900","Trigger label text"],
        ["--muted-foreground","zinc-500","Secondary/helper text inside content"],
        ["--ring","violet-600/30","Focus-visible ring on trigger"],
      ]} />
      <BestPractices items={[
        {do:"Use Collapsible for optional secondary details that don't need to be visible on load.",dont:"Hide primary or critical content inside a Collapsible — users may never find it."},
        {do:"Use CollapsibleTrigger asChild to attach toggle behavior to a Button or icon — gives full style control.",dont:"Rely on the bare CollapsibleTrigger without asChild for styled UIs — it renders a plain unstyled button."},
        {do:"Use Accordion when you have 2 or more related collapsible sections with a consistent visual structure.",dont:"Stack multiple independent Collapsibles as a substitute for Accordion — it loses keyboard navigation and ARIA structure."},
      ]} />
      <FigmaMapping rows={[
        ["State","Closed","open / defaultOpen","false (default)"],
        ["State","Open","open / defaultOpen","true"],
        ["State","Disabled","disabled","true"],
        ["Trigger","Custom element","CollapsibleTrigger","asChild + child element"],
      ]} />
      <AccessibilityInfo
        keyboard={[
          ["Tab","Move focus to the CollapsibleTrigger"],
          ["Enter / Space","Toggle the section open or closed"],
        ]}
        notes={[
          "CollapsibleTrigger renders a <button> by default and has aria-expanded reflecting the current open state, and aria-controls pointing to the content panel.",
          "When using asChild, the trigger behavior (aria-expanded, aria-controls, role) is merged onto the child element — ensure the child is a focusable element (button, a) for keyboard accessibility.",
          "CollapsibleContent is hidden from the accessibility tree when closed (display:none equivalent) — hidden content is not reachable by screen readers or keyboard until opened.",
          "If the trigger is an icon-only button, add aria-label to describe the action (e.g., aria-label=\"Toggle changelog\").",
        ]}
      />
      <RelatedComponents items={[
        {name:"Accordion",desc:"Stacked list of collapsible sections with built-in keyboard navigation — use instead of multiple Collapsibles."},
        {name:"Card",desc:"Always-visible content container — use when content should never be hidden behind an interaction."},
        {name:"Sheet",desc:"Slide-in panel for larger hidden content — use when the content is too large for an inline collapse."},
      ]} />
    </div>
  )
}

function ComboboxDocs() {
  const [val, setVal] = useState("")
  const [valMode, setValMode] = useState("placeholder")
  const [state, setState] = useState("default")
  const [left, setLeft] = useState("none")
  const [right, setRight] = useState("none")
  const handleCbxValMode = (mode: string) => {
    setValMode(mode)
    setVal(mode === "filled" ? "react" : "")
  }

  const isDisabled = state === "disabled"
  const isFocus = state === "focus"
  const isHover = state === "hover"
  const iconLeftCbx = left === "icon" ? <LucideIcons.Globe /> : undefined
  const prefixCbx = left === "prefix" ? "$" : undefined
  const textLeftCbx = left === "textLeft" ? "Filter" : undefined
  const iconRightCbx = right === "icon" ? <Info /> : undefined
  const suffixCbx = right === "suffix" ? "%" : undefined
  const textRightCbx = right === "textRight" ? "USD" : undefined

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
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A searchable dropdown that combines a trigger button with a filterable list. Use it when the option list is long enough that users benefit from typing to narrow down choices.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "State", type: "select", options: ["default","hover","focus","disabled"], value: state, onChange: setState },
        { label: "Value", type: "select", options: ["placeholder","filled"], value: valMode, onChange: handleCbxValMode },
        { label: "Left", type: "select", options: ["none","icon","prefix","textLeft"], value: left, onChange: setLeft },
        { label: "Right", type: "select", options: ["none","icon","suffix","textRight"], value: right, onChange: setRight },
      ]}>
        <Combobox
          key={valMode}
          options={frameworks}
          value={val}
          onValueChange={setVal}
          placeholder="Select framework..."
          disabled={isDisabled}
          iconLeft={iconLeftCbx}
          prefix={prefixCbx}
          textLeft={textLeftCbx}
          iconRight={iconRightCbx}
          suffix={suffixCbx}
          textRight={textRightCbx}
          className={cn(isHover && "border-border-strong", isFocus && "ring-[3px] ring-ring outline-none")}
        />
      </ExploreBehavior>

      <InstallationSection pkg={["@radix-ui/react-popover","cmdk"]} importCode={`import { Combobox, type ComboboxOption } from "@/components/ui/combobox"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">

          <Example title="Default" description="Uncontrolled combobox — manages selected value internally." code={`<Combobox\n  options={frameworks}\n  placeholder="Select framework..."\n/>`}>
            <Combobox options={frameworks} placeholder="Select framework..." />
          </Example>

          <Example title="With Pre-selected Value" description="Pass value to start with an option already selected." code={`<Combobox options={frameworks} value="react" />`}>
            <Combobox options={frameworks} value="react" />
          </Example>

          <Example title="Disabled" description="Prevents interaction when the field is not applicable." code={`<Combobox options={frameworks} disabled />`}>
            <Combobox options={frameworks} disabled placeholder="Select framework..." />
          </Example>

          <Example title="With Label" description="Always pair with a visible Label for screen reader accessibility." code={`<Label>Framework</Label>\n<Combobox options={frameworks} placeholder="Select framework..." />`}>
            <div className="space-y-3xs">
              <Label>Framework</Label>
              <Combobox options={frameworks} placeholder="Select framework..." />
            </div>
          </Example>

          <Example title="Custom Placeholder" description="Tailor placeholder and search text to match the field context." code={`<Combobox\n  options={languages}\n  placeholder="Pick a language..."\n  searchPlaceholder="Filter languages..."\n/>`}>
            <Combobox options={[{value:"js",label:"JavaScript"},{value:"ts",label:"TypeScript"},{value:"py",label:"Python"},{value:"go",label:"Go"}]} placeholder="Pick a language..." searchPlaceholder="Filter languages..." />
          </Example>

          <Example title="Full Width" description="Use className to stretch to the container width." code={`<Combobox options={frameworks} className="w-full" />`}>
            <Combobox options={frameworks} className="w-full" placeholder="Select framework..." />
          </Example>

          <Example title="Icon Left" description="Add a contextual icon before the value to clarify what the field represents." code={`<Combobox\n  options={countries}\n  iconLeft={<Globe />}\n  placeholder="Select country..."\n/>`}>
            <Combobox options={[{value:"us",label:"United States"},{value:"uk",label:"United Kingdom"},{value:"vn",label:"Vietnam"},{value:"jp",label:"Japan"}]} iconLeft={<LucideIcons.Globe />} placeholder="Select country..." />
          </Example>

          <Example title="Icon Right" description="Add a secondary icon between the value and the dropdown indicator." code={`<Combobox\n  options={frameworks}\n  iconRight={<Info />}\n  placeholder="Select framework..."\n/>`}>
            <Combobox options={frameworks} iconRight={<LucideIcons.Info />} placeholder="Select framework..." />
          </Example>

          <Example title="With Prefix" description="Prefix text appears before the value — useful for currency or unit selectors." code={`<Combobox\n  options={currencies}\n  prefix="$"\n  placeholder="Select currency..."\n/>`}>
            <Combobox options={[{value:"usd",label:"US Dollar"},{value:"eur",label:"Euro"},{value:"gbp",label:"British Pound"},{value:"jpy",label:"Japanese Yen"}]} prefix="$" placeholder="Select currency..." />
          </Example>

          <Example title="With Suffix" description="Suffix text appears after the value — useful for unit or rate selectors." code={`<Combobox\n  options={rates}\n  suffix="%"\n  placeholder="Select rate..."\n/>`}>
            <Combobox options={[{value:"5",label:"5"},{value:"10",label:"10"},{value:"15",label:"15"},{value:"20",label:"20"}]} suffix="%" placeholder="Select rate..." />
          </Example>

          <Example title="Combined" description="Icon left with prefix and suffix together for rich trigger labels." code={`<Combobox\n  options={currencies}\n  iconLeft={<DollarSign />}\n  prefix="USD"\n  suffix="/ mo"\n  placeholder="Select plan..."\n/>`}>
            <Combobox options={[{value:"basic",label:"Basic"},{value:"pro",label:"Pro"},{value:"enterprise",label:"Enterprise"}]} iconLeft={<LucideIcons.DollarSign />} prefix="USD" suffix="/ mo" placeholder="Select plan..." />
          </Example>

          <Example title="Text Left" description="External addon label attached to the left — useful for labeling a unit or category." code={`<Combobox\n  options={countries}\n  textLeft="Country"\n  placeholder="Select..."\n/>`}>
            <Combobox options={[{value:"us",label:"United States"},{value:"uk",label:"United Kingdom"},{value:"vn",label:"Vietnam"}]} textLeft="Country" placeholder="Select..." />
          </Example>

          <Example title="Text Right" description="External addon label attached to the right — useful for appending a unit or domain." code={`<Combobox\n  options={rates}\n  textRight="per year"\n  placeholder="Select rate..."\n/>`}>
            <Combobox options={[{value:"5",label:"5%"},{value:"10",label:"10%"},{value:"15",label:"15%"}]} textRight="per year" placeholder="Select rate..." />
          </Example>

          <Example title="Text Left + Right" description="Both addons together to frame the trigger — e.g. for structured form fields." code={`<Combobox\n  options={amounts}\n  textLeft="From"\n  textRight="USD"\n  placeholder="Select amount..."\n/>`}>
            <Combobox options={[{value:"100",label:"100"},{value:"500",label:"500"},{value:"1000",label:"1,000"},{value:"5000",label:"5,000"}]} textLeft="From" textRight="USD" placeholder="Select amount..." />
          </Example>

        </div>

        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg flex flex-wrap gap-sm">
            <Combobox options={frameworks} placeholder="Select framework..." />
            <Combobox options={[{value:"js",label:"JavaScript"},{value:"ts",label:"TypeScript"},{value:"py",label:"Python"},{value:"go",label:"Go"}]} placeholder="Pick a language..." searchPlaceholder="Filter languages..." />
            <Combobox options={[]} emptyText="No frameworks available." placeholder="Empty list..." />
          </div>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <PropsTable rows={[
          ["options", "{ value: string; label: string }[]", "[]", "Selectable options list"],
          ["value", "string", '""', "Controlled selected value"],
          ["onValueChange", "(value: string) => void", "—", "Callback fired when selection changes"],
          ["placeholder", "string", '"Select option..."', "Trigger button placeholder text"],
          ["searchPlaceholder", "string", '"Search..."', "Search input placeholder"],
          ["emptyText", "string", '"No results found."', "Text shown when search returns no results"],
          ["disabled", "boolean", "false", "Disables the trigger button"],
          ["iconLeft", "ReactNode", "—", "Icon rendered at the start of the trigger, before the value text"],
          ["iconRight", "ReactNode", "—", "Icon rendered between the value text and the ChevronsUpDown indicator"],
          ["prefix", "string", "—", "Short text rendered before the value (e.g. currency symbol)"],
          ["suffix", "string", "—", "Short text rendered after the value (e.g. unit label)"],
          ["textLeft", "string", "—", "Addon label attached outside the trigger on the left (input group style)"],
          ["textRight", "string", "—", "Addon label attached outside the trigger on the right (input group style)"],
          ["className", "string", '""', "Additional CSS classes for the trigger button"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--popover","white","Dropdown panel background"],
        ["--popover-foreground","zinc-900","Dropdown text color"],
        ["--accent","zinc-100","Hovered item background"],
        ["--border","zinc-200","Trigger and dropdown border"],
        ["--muted-foreground","zinc-500","Placeholder and empty state text"],
        ["--primary","violet-600","Selected item checkmark icon"],
      ]} />

      <BestPractices
        items={[
          { do: "Use Combobox when users need to search through 10 or more options.", dont: "Use Combobox for fewer than 5 options — a Select is simpler and faster." },
          { do: "Provide a descriptive placeholder that matches the field context.", dont: "Use generic placeholder text like 'Select...' for every combobox." },
          { do: "Show a clear empty state message when no search results match.", dont: "Leave the dropdown blank without explanation when a search returns nothing." },
          { do: "Use className=\"w-full\" to match the combobox width to other form fields.", dont: "Leave it at the default 200px if the layout uses full-width inputs." },
        ]}
      />

      <FigmaMapping rows={[
        ["State","Default","trigger closed, no selection","default idle state"],
        ["State","Hover","cursor over trigger","border-border-strong on button"],
        ["State","Focus","trigger focused via keyboard","ring-[3px] ring-ring on button"],
        ["State","Open","trigger clicked","popover visible"],
        ["State","Selected","option chosen","checkmark visible next to item"],
        ["State","Disabled","disabled prop","button disabled, no interaction"],
        ["Prop","placeholder","placeholder","trigger text when no value selected"],
        ["Prop","emptyText","emptyText","text in empty state row"],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Tab","Move focus to the trigger button"],
          ["Enter / Space","Open the dropdown"],
          ["Type","Filter options by label"],
          ["Arrow Up / Down","Navigate the option list"],
          ["Enter","Select the focused option"],
          ["Esc","Close the dropdown without selecting"],
        ]}
        notes={[
          "Built from Popover + Command (cmdk) — each handles its own ARIA roles.",
          "The trigger button carries role=\"combobox\" and aria-expanded for screen readers.",
          "cmdk handles live-region announcements for search results automatically.",
        ]}
      />

      <RelatedComponents items={[
        { name: "Select", desc: "Use Select when the list is short and users don't need to search — simpler and faster for fewer than 10 options." },
        { name: "Input", desc: "Use Input when the answer is free-form text rather than a value from a predefined list." },
        { name: "Command", desc: "The underlying primitive — use Command directly for command palettes or multi-section search." },
      ]} />
    </div>
  )
}

function DatePickerControlledExample() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 2, 18))
  return <DatePicker date={date} onDateChange={setDate} />
}

function DatePickerDocs() {
  const [mode, setMode] = useState<"single" | "range">("single")
  const [triggerState, setTriggerState] = useState<"default" | "hover" | "error" | "disable">("default")
  const [triggerValue, setTriggerValue] = useState<"placeholder" | "filled">("placeholder")
  const [dayCellState, setDayCellState] = useState<DayCellState>("default")
  const [presetItemState, setPresetItemState] = useState<PresetItemState>("default")
  const [activePresetIdx, setActivePresetIdx] = useState(2)
  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Date Picker</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A trigger that opens a calendar popup for selecting a single date or date range. DateRangePicker adds a two-month view with a preset shortcuts sidebar.</p>
      </header>

      {/* 2. Explore Behavior — tabbed: Date Picker | Date Picker Trigger | Day Cell */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
        <Tabs defaultValue="date-picker" className="w-full">
          <div className="border border-border rounded-xl overflow-hidden">
            <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
              <TabsTrigger value="date-picker" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Date Picker</span></TabsTrigger>
              <TabsTrigger value="date-picker-trigger" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Date Picker Trigger</span></TabsTrigger>
              <TabsTrigger value="day-cell" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Day Cell</span></TabsTrigger>
              <TabsTrigger value="preset-item" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Preset Item</span></TabsTrigger>
            </TabsList>

            {/* Tab 1: Date Picker — shows popover content (calendar panel) */}
            <TabsContent value="date-picker" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  {mode === "range" ? (
                    <div className="rounded-lg border border-border bg-card shadow-md flex overflow-hidden">
                      <div className="flex flex-col gap-3xs border-r border-border/30 dark:border-white/[0.06] p-sm min-w-[140px]">
                        <p className="sp-label text-muted-foreground/60 uppercase tracking-wider px-sm pt-xs pb-2xs">Presets</p>
                        {["Last 7 days","Last 14 days","Last 30 days","Last 60 days","Last 90 days","This month","Last month","This year"].map((p, i) => (
                          <PresetItem key={p} state={activePresetIdx === i ? "active" : "default"} onClick={() => setActivePresetIdx(i)}>{p}</PresetItem>
                        ))}
                      </div>
                      <div className="flex flex-col">
                        <Calendar mode="range" numberOfMonths={2} selected={{ from: new Date(2026, 2, 18), to: new Date(2026, 3, 8) }} components={calendarDayCellComponents} />
                        <div className="flex items-center justify-between border-t border-border/30 dark:border-white/[0.06] px-md py-sm">
                          <p className="sp-caption text-muted-foreground">Mar 18 – Apr 8, 2026</p>
                          <div className="flex items-center gap-sm">
                            <Button variant="ghost" size="sm">Cancel</Button>
                            <Button size="sm">Apply</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border bg-card shadow-md overflow-hidden">
                      <Calendar mode="single" selected={new Date(2026, 2, 18)} components={calendarDayCellComponents} />
                    </div>
                  )}
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">Mode</Label>
                    <div className="flex flex-wrap gap-xs">
                      {(["single", "range"] as const).map(m => (
                        <button key={m} onClick={() => setMode(m)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", mode === m ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{m}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Date Picker Trigger */}
            <TabsContent value="date-picker-trigger" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <DatePickerTrigger
                    state={triggerState}
                    value={triggerValue}
                    date={triggerValue === "filled" ? new Date(2026, 2, 7) : undefined}
                  />
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">State</Label>
                      <div className="flex flex-wrap gap-xs">
                        {(["default", "hover", "error", "disable"] as const).map(s => (
                          <button key={s} onClick={() => setTriggerState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", triggerState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Value</Label>
                      <div className="flex flex-wrap gap-xs">
                        {(["placeholder", "filled"] as const).map(v => (
                          <button key={v} onClick={() => setTriggerValue(v)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", triggerValue === v ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{v}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Day Cell */}
            <TabsContent value="day-cell" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <div>
                    <DayCell state={dayCellState}>{dayCellState === "outside" ? "31" : "14"}</DayCell>
                  </div>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">State</Label>
                      <div className="flex flex-wrap gap-xs">
                        {(["default", "hover", "today", "selected", "outside", "disabled", "range-start", "range-middle", "range-end", "range-hover"] as DayCellState[]).map(s => (
                          <button key={s} onClick={() => setDayCellState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", dayCellState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s.replace("-", " ")}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Preset Item */}
            <TabsContent value="preset-item" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <PresetItem state={presetItemState}>Last 30 days</PresetItem>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">State</Label>
                      <div className="flex flex-wrap gap-xs">
                        {(["default", "hover", "active"] as PresetItemState[]).map(s => (
                          <button key={s} onClick={() => setPresetItemState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", presetItemState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>

      {/* 3. Installation */}
      <InstallationSection pkg={["react-day-picker","date-fns"]} importCode={`import { DatePickerTrigger, DatePicker, DateRangePicker } from "@/components/ui/date-picker"`} />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Single Date" description="Selects one date. Calendar opens in a popover on click." code={`<DatePicker />`}>
            <DatePicker />
          </Example>
          <Example title="Date Range" description="Two-month calendar with preset shortcuts sidebar. Closes when both dates are picked." code={`<DateRangePicker />`}>
            <DateRangePicker />
          </Example>
          <Example title="No Presets" description="DateRangePicker without the preset sidebar — calendar only, smaller footprint." code={`<DateRangePicker presets={false} />`}>
            <DateRangePicker presets={false} />
          </Example>
          <Example title="Controlled" description="Pass date and onDateChange to sync with form state or external state management." code={`const [date, setDate] = useState<Date | undefined>()\n\n<DatePicker date={date} onDateChange={setDate} />`}>
            <DatePickerControlledExample />
          </Example>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg flex flex-wrap gap-lg">
            <div className="space-y-xs">
              <p className="text-xs text-muted-foreground">Single Date</p>
              <DatePicker />
            </div>
            <div className="space-y-xs">
              <p className="text-xs text-muted-foreground">Date Range</p>
              <DateRangePicker />
            </div>
            <div className="space-y-xs">
              <p className="text-xs text-muted-foreground">No Presets</p>
              <DateRangePicker presets={false} />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">DatePickerTrigger</h3>
        <PropsTable rows={[
          ["state", '"default" | "hover" | "error" | "disable"', '"default"', "Visual state of the trigger"],
          ["value", '"placeholder" | "filled"', '"placeholder"', "Whether to show placeholder or filled date"],
          ["date", "Date | undefined", "—", "Selected date to display when filled"],
          ["placeholder", "string", '"Pick a date"', "Placeholder text when no date selected"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DatePicker</h3>
        <PropsTable rows={[
          ["date", "Date | undefined", "—", "Controlled selected date"],
          ["onDateChange", "(date: Date | undefined) => void", "—", "Callback when date changes"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DateRangePicker</h3>
        <PropsTable rows={[
          ["from", "Date | undefined", "—", "Controlled range start"],
          ["to", "Date | undefined", "—", "Controlled range end"],
          ["onRangeChange", "(range: {from?: Date; to?: Date}) => void", "—", "Callback when range changes"],
          ["presets", "boolean", "true", "Show preset shortcut sidebar"],
          ["className", "string", '""', "Additional CSS classes"],
        ]} />
      </section>

      {/* 6–10 */}
      <DesignTokensTable rows={[["--popover","white","Calendar dropdown background"],["--primary","violet-600","Selected date"],["--accent","zinc-100","Hover date"],["--muted-foreground","zinc-500","Outside days"],["--border","zinc-200","Calendar border"]]} />
      <BestPractices items={[{do:"Use DatePicker for single dates and DateRangePicker for date ranges.",dont:"Build a custom date input — use the pre-built picker for consistency."},{do:"Set sensible default dates close to the expected selection.",dont:"Open the calendar on January 1970 — default to today or the relevant context date."}]} />
      <FigmaMapping rows={[["Mode","Single","DatePicker","present"],["Mode","Range","DateRangePicker","present"]]} />
      <AccessibilityInfo keyboard={[["Tab","Focus trigger"],["Enter / Space","Open calendar"],["Arrow Keys","Navigate days"],["Enter","Select date"],["Esc","Close"]]} notes={["Uses Calendar internally","DateRangePicker shows 2-month view"]} />
      <RelatedComponents items={[{name:"Calendar",desc:"Standalone calendar without trigger."},{name:"Input",desc:"For manual date entry."}]} />
    </div>
  )
}

function DrawerDocs() {
  const [showHandle, setShowHandle] = useState(true)
  const [showDescription, setShowDescription] = useState(true)
  const [showFooter, setShowFooter] = useState(true)

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Drawer</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A mobile-first bottom sheet that slides up from the screen bottom with swipe-to-close gesture support. Built on vaul — not Radix Dialog.</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Show Handle", type: "toggle", value: showHandle, onChange: setShowHandle },
        { label: "Show Description", type: "toggle", value: showDescription, onChange: setShowDescription },
        { label: "Show Footer", type: "toggle", value: showFooter, onChange: setShowFooter },
      ]}>
        <div className="relative w-full max-w-sm bg-card border border-border rounded-t-[10px] shadow overflow-hidden">
          {showHandle && (
            <div className="flex justify-center pt-md">
              <div className="h-1 w-[100px] rounded-full bg-muted" />
            </div>
          )}
          <div className="grid gap-2xs p-md">
            <p className="sp-h4 text-foreground">Move Goal</p>
            {showDescription && <p className="typo-paragraph-sm text-muted-foreground">Set your daily activity goal.</p>}
          </div>
          <div className="px-md pb-sm">
            <Slider defaultValue={[50]} max={100} step={1} disabled />
          </div>
          {showFooter && (
            <div className="mt-auto flex flex-col gap-xs p-md">
              <Button size="sm">Submit</Button>
              <Button variant="outline" size="sm">Cancel</Button>
            </div>
          )}
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={["vaul"]} importCode={`import {\n  Drawer,\n  DrawerTrigger,\n  DrawerPortal,\n  DrawerOverlay,\n  DrawerContent,\n  DrawerHeader,\n  DrawerTitle,\n  DrawerDescription,\n  DrawerFooter,\n  DrawerClose,\n} from "@/components/ui/drawer"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Default" description="Bottom drawer with handle bar, header, slider content, and footer actions." code={`<Drawer>\n  <DrawerTrigger asChild>\n    <Button>Open Drawer</Button>\n  </DrawerTrigger>\n  <DrawerContent>\n    <DrawerHeader>\n      <DrawerTitle>Move Goal</DrawerTitle>\n      <DrawerDescription>Set your daily activity goal.</DrawerDescription>\n    </DrawerHeader>\n    <div className="px-md pb-sm">\n      <Slider defaultValue={[50]} max={100} step={1} />\n    </div>\n    <DrawerFooter>\n      <Button>Submit</Button>\n      <DrawerClose asChild>\n        <Button variant="outline">Cancel</Button>\n      </DrawerClose>\n    </DrawerFooter>\n  </DrawerContent>\n</Drawer>`}>
            <div className="relative w-full max-w-sm bg-card border border-border rounded-t-[10px] shadow pointer-events-none overflow-hidden">
              <div className="flex justify-center pt-md"><div className="h-1 w-[100px] rounded-full bg-muted" /></div>
              <div className="grid gap-2xs p-md"><p className="sp-h4 text-foreground">Move Goal</p><p className="typo-paragraph-sm text-muted-foreground">Set your daily activity goal.</p></div>
              <div className="px-md pb-sm"><Slider defaultValue={[50]} max={100} step={1} disabled /></div>
              <div className="mt-auto flex flex-col gap-xs p-md"><Button size="sm">Submit</Button><Button variant="outline" size="sm">Cancel</Button></div>
            </div>
          </Example>
          <Example title="With Form" description="Drawer with form inputs for quick edits — keeps the page in context while collecting data." code={`<Drawer>\n  <DrawerTrigger asChild>\n    <Button>Edit Profile</Button>\n  </DrawerTrigger>\n  <DrawerContent>\n    <DrawerHeader>\n      <DrawerTitle>Edit Profile</DrawerTitle>\n      <DrawerDescription>Update your display name and bio.</DrawerDescription>\n    </DrawerHeader>\n    <div className="p-md space-y-md">\n      <div className="space-y-3xs">\n        <Label>Name</Label>\n        <Input placeholder="Your name" />\n      </div>\n      <div className="space-y-3xs">\n        <Label>Bio</Label>\n        <Textarea placeholder="Short bio" />\n      </div>\n    </div>\n    <DrawerFooter>\n      <Button>Save</Button>\n      <DrawerClose asChild>\n        <Button variant="outline">Cancel</Button>\n      </DrawerClose>\n    </DrawerFooter>\n  </DrawerContent>\n</Drawer>`}>
            <div className="relative w-full max-w-sm bg-card border border-border rounded-t-[10px] shadow pointer-events-none overflow-hidden">
              <div className="flex justify-center pt-md"><div className="h-1 w-[100px] rounded-full bg-muted" /></div>
              <div className="grid gap-2xs p-md"><p className="sp-h4 text-foreground">Edit Profile</p><p className="typo-paragraph-sm text-muted-foreground">Update your display name and bio.</p></div>
              <div className="p-md space-y-md">
                <div className="space-y-3xs"><Label>Name</Label><Input placeholder="Your name" /></div>
                <div className="space-y-3xs"><Label>Bio</Label><Textarea placeholder="Short bio" /></div>
              </div>
              <div className="mt-auto flex flex-col gap-xs p-md"><Button size="sm">Save</Button><Button variant="outline" size="sm">Cancel</Button></div>
            </div>
          </Example>
          <Example title="Content Only" description="Drawer without footer — suitable for read-only content where swipe-to-close is the only exit." code={`<Drawer>\n  <DrawerTrigger asChild>\n    <Button>View Notifications</Button>\n  </DrawerTrigger>\n  <DrawerContent>\n    <DrawerHeader>\n      <DrawerTitle>Notifications</DrawerTitle>\n      <DrawerDescription>Your recent activity.</DrawerDescription>\n    </DrawerHeader>\n    <div className="p-md space-y-xs">\n      {notifications.map((item, i) => (\n        <div key={i} className="flex items-center gap-sm py-xs border-b border-border last:border-0">\n          <Info className="size-4 text-muted-foreground shrink-0" />\n          <p className="text-sm">{item}</p>\n        </div>\n      ))}\n    </div>\n  </DrawerContent>\n</Drawer>`}>
            <div className="relative w-full max-w-sm bg-card border border-border rounded-t-[10px] shadow pointer-events-none overflow-hidden">
              <div className="flex justify-center pt-md"><div className="h-1 w-[100px] rounded-full bg-muted" /></div>
              <div className="grid gap-2xs p-md"><p className="sp-h4 text-foreground">Notifications</p><p className="typo-paragraph-sm text-muted-foreground">Your recent activity.</p></div>
              <div className="p-md space-y-xs">
                {["New comment on your post", "Your report is ready", "System maintenance tonight"].map((item, i) => (
                  <div key={i} className="flex items-center gap-sm py-xs border-b border-border last:border-0">
                    <Info className="size-4 text-muted-foreground shrink-0" />
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </Example>
          <Example title="Selection List" description="Drawer with a scrollable list of options — use for mobile-friendly pickers instead of a dropdown." code={`<Drawer>\n  <DrawerTrigger asChild>\n    <Button>Choose Framework</Button>\n  </DrawerTrigger>\n  <DrawerContent>\n    <DrawerHeader>\n      <DrawerTitle>Choose a framework</DrawerTitle>\n      <DrawerDescription>Pick your preferred option.</DrawerDescription>\n    </DrawerHeader>\n    <div className="px-md pb-sm">\n      {frameworks.map((fw, i) => (\n        <button key={i} className="w-full text-left px-md py-sm text-sm hover:bg-accent rounded-md">\n          {fw}\n        </button>\n      ))}\n    </div>\n    <DrawerFooter>\n      <DrawerClose asChild>\n        <Button variant="outline">Cancel</Button>\n      </DrawerClose>\n    </DrawerFooter>\n  </DrawerContent>\n</Drawer>`}>
            <div className="relative w-full max-w-sm bg-card border border-border rounded-t-[10px] shadow pointer-events-none overflow-hidden">
              <div className="flex justify-center pt-md"><div className="h-1 w-[100px] rounded-full bg-muted" /></div>
              <div className="grid gap-2xs p-md"><p className="sp-h4 text-foreground">Choose a framework</p><p className="typo-paragraph-sm text-muted-foreground">Pick your preferred option.</p></div>
              <div className="px-md pb-xs">
                {["React", "Vue", "Angular", "Svelte", "Solid"].map((fw, i) => (
                  <div key={i} className="w-full text-left px-sm py-xs text-sm border-b border-border/50 last:border-0">{fw}</div>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-xs p-md"><Button variant="outline" size="sm">Cancel</Button></div>
            </div>
          </Example>
        </div>

        {/* Interactive Demo */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg flex flex-wrap gap-sm">
            <Drawer>
              <DrawerTrigger asChild><Button variant="outline" size="sm">Default</Button></DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Move Goal</DrawerTitle>
                  <DrawerDescription>Set your daily activity goal.</DrawerDescription>
                </DrawerHeader>
                <div className="px-md pb-sm">
                  <Slider defaultValue={[50]} max={100} step={1} />
                </div>
                <DrawerFooter>
                  <Button size="sm">Submit</Button>
                  <DrawerClose asChild><Button variant="outline" size="sm">Cancel</Button></DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            <Drawer>
              <DrawerTrigger asChild><Button variant="outline" size="sm">With Form</Button></DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Edit Profile</DrawerTitle>
                  <DrawerDescription>Update your display name and bio.</DrawerDescription>
                </DrawerHeader>
                <div className="p-md space-y-md">
                  <div className="space-y-3xs"><Label>Name</Label><Input placeholder="Your name" /></div>
                  <div className="space-y-3xs"><Label>Bio</Label><Textarea placeholder="Short bio" /></div>
                </div>
                <DrawerFooter>
                  <Button size="sm">Save</Button>
                  <DrawerClose asChild><Button variant="outline" size="sm">Cancel</Button></DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
            <Drawer>
              <DrawerTrigger asChild><Button variant="outline" size="sm">Content Only</Button></DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Notifications</DrawerTitle>
                  <DrawerDescription>Your recent activity.</DrawerDescription>
                </DrawerHeader>
                <div className="p-md space-y-xs">
                  {["New comment on your post", "Your report is ready", "System maintenance tonight"].map((item, i) => (
                    <div key={i} className="flex items-center gap-sm py-xs border-b border-border last:border-0">
                      <Info className="size-4 text-muted-foreground shrink-0" />
                      <p className="text-sm">{item}</p>
                    </div>
                  ))}
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">Drawer (Root)</h3>
        <PropsTable rows={[
          ["open", "boolean", "—", "Controlled open state"],
          ["onOpenChange", "(open: boolean) => void", "—", "Callback when open state changes"],
          ["shouldScaleBackground", "boolean", "true", "Scale the page background when the drawer opens"],
          ["dismissible", "boolean", "true", "Allow dismissal via overlay click or swipe-down gesture"],
          ["snapPoints", "number[]", "—", "Snap point heights as fractions of screen height (e.g. [0.5, 1])"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DrawerTrigger / DrawerClose</h3>
        <PropsTable rows={[
          ["asChild", "boolean", "false", "Merge trigger/close props onto the child element"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DrawerContent</h3>
        <PropsTable rows={[
          ["className", "string", "—", "Additional CSS classes for the content panel"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">DrawerHeader / DrawerFooter / DrawerTitle / DrawerDescription</h3>
        <PropsTable rows={[
          ["className", "string", "—", "Additional CSS classes"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--card", "white / #252522", "Content panel background"],
        ["--border", "zinc-200 / zinc-800", "Content panel border"],
        ["black/50", "rgba(0,0,0,0.5)", "Overlay backdrop (DrawerOverlay)"],
        ["--muted", "zinc-100 / zinc-800", "Drag handle bar color"],
        ["--muted-foreground", "zinc-500", "Description text color"],
        ["--foreground", "zinc-900 / zinc-50", "Title text color (sp-h4)"],
      ]} />

      <BestPractices items={[
        { do: "Use Drawer for mobile-friendly bottom sheets — confirmations, pickers, and quick actions.", dont: "Use Drawer for complex multi-step flows — prefer a full page or Dialog." },
        { do: "Include a visible drag handle so users discover the swipe-to-close gesture.", dont: "Remove the handle bar — without it users have no visual affordance for swipe dismiss." },
        { do: "Keep drawer height short — show only essential content so users can see the page behind.", dont: "Fill the drawer with too much content — use a Sheet or dedicated page for long forms." },
      ]} />

      <FigmaMapping rows={[
        ["Overlay", "black/50", "DrawerOverlay", "fixed inset-0 z-50 bg-black/50"],
        ["Content", "bg-card, border-t border-border", "DrawerContent", "fixed inset-x-0 bottom-0 rounded-t-[10px]"],
        ["Handle bar", "100×4px muted", "—", "mx-auto mt-md h-1 w-[100px] rounded-full bg-muted"],
        ["Header", "Title + Description", "DrawerHeader", "grid gap-2xs p-md text-center sm:text-left"],
        ["Title", "sp-h4 foreground", "DrawerTitle", "sp-h4 text-foreground"],
        ["Description", "paragraph-sm muted", "DrawerDescription", "typo-paragraph-sm text-muted-foreground"],
        ["Footer", "Action buttons", "DrawerFooter", "mt-auto flex flex-col gap-xs p-md"],
        ["Close", "Wraps child", "DrawerClose", "asChild — merges close behavior onto child"],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Tab", "Move focus within drawer (focus trapped)"],
          ["Shift+Tab", "Move focus backwards"],
          ["Escape", "Close the drawer"],
          ["Enter / Space", "Activate the focused button"],
        ]}
        notes={[
          "Focus is trapped inside the drawer while it is open",
          "Returns focus to the trigger element on close",
          "Swipe-to-close gesture handled natively by vaul on touch devices",
          "Built on vaul — not Radix Dialog; accessibility model differs from Sheet/Dialog",
          "Always include DrawerTitle for screen reader announcement",
        ]}
      />

      <RelatedComponents items={[
        { name: "Sheet", desc: "Side panel from any edge — better for desktop use cases." },
        { name: "Dialog", desc: "Centered modal for interruptions and confirmations." },
        { name: "AlertDialog", desc: "Non-dismissible modal for destructive action confirmation." },
      ]} />
    </div>
  )
}

function OTPSlotMock({ position, state, char }: { position: "first" | "middle" | "last"; state: string; char?: string }) {
  return (
    <div
      className={cn(
        "relative flex size-3xl items-center justify-center border-y border-r border-border-strong text-sm transition-all",
        position === "first" && "border-l rounded-l-md",
        position === "last" && "rounded-r-md",
        state === "active" && "z-10 ring-[3px] ring-ring",
        state === "disabled" && "opacity-50",
      )}
    >
      {(state === "filled" || (char && state !== "active")) && (
        <span className="text-foreground">{char || "5"}</span>
      )}
      {state === "active" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-md w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  )
}

function InputOTPDocs() {
  const [otpLength, setOtpLength] = useState("6")
  const [otpDisabled, setOtpDisabled] = useState(false)
  const [otpFillMode, setOtpFillMode] = useState("empty")
  const [otpSlotState, setOtpSlotState] = useState("default")
  const [otpSlotPosition, setOtpSlotPosition] = useState<"first" | "middle" | "last">("middle")

  const len = Number(otpLength)
  const syncedIndex = otpSlotPosition === "first" ? 0 : otpSlotPosition === "last" ? len - 1 : Math.floor(len / 2)

  const getSlotChar = (i: number) => {
    if (i === syncedIndex && (otpSlotState === "active" || otpSlotState === "default")) return undefined
    if (i === syncedIndex && otpSlotState === "filled") return String((i + 1) % 10)
    if (otpFillMode === "filled") return String((i + 1) % 10)
    if (otpFillMode === "partial" && i < Math.floor(len / 2)) return String((i + 1) % 10)
    return undefined
  }

  const getSlotPosition = (i: number): "first" | "middle" | "last" =>
    i === 0 ? "first" : i === len - 1 ? "last" : "middle"

  const getSlotState = (i: number) => {
    if (otpDisabled) return "disabled"
    if (i === syncedIndex) return otpSlotState
    const ch = getSlotChar(i)
    return ch ? "filled" : "default"
  }

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Input OTP</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">An accessible single-input OTP field rendered as individual digit slots for verification codes and PINs. Auto-advances focus on each key press and supports full-code paste from SMS or email.</p>
      </header>

      <section>
        <Tabs defaultValue="otp-group">
          <div className="rounded-lg border border-border overflow-hidden">
            <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
              <TabsTrigger value="otp-group" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Input OTP</span></TabsTrigger>
              <TabsTrigger value="otp-slot" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">OTP Slot</span></TabsTrigger>
            </TabsList>

            {/* Tab 1: Input OTP Group — uses OTPSlotMock, synced slot reflects Tab 2 state */}
            <TabsContent value="otp-group" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <div className="pointer-events-none flex items-center">
                    {Array.from({ length: len }, (_, i) => (
                      <OTPSlotMock
                        key={i}
                        position={getSlotPosition(i)}
                        state={getSlotState(i)}
                        char={getSlotChar(i)}
                      />
                    ))}
                  </div>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Length</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["4","6","8"].map(v => (
                          <button key={v} onClick={() => setOtpLength(v)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors", otpLength === v ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{v}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Value</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["empty","partial","filled"].map(v => (
                          <button key={v} onClick={() => setOtpFillMode(v)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", otpFillMode === v ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{v}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-lg gap-y-xs">
                      <div className="flex flex-col gap-xs">
                        <Label className="text-xs text-muted-foreground font-body">Disabled</Label>
                        <Switch checked={otpDisabled} onCheckedChange={setOtpDisabled} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: OTP Slot — single slot with Position + State controls */}
            <TabsContent value="otp-slot" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <div>
                    <OTPSlotMock
                      position={otpSlotPosition}
                      state={otpSlotState}
                      char={otpSlotState === "filled" ? "5" : undefined}
                    />
                  </div>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Position</Label>
                      <div className="flex flex-wrap gap-xs">
                        {(["first","middle","last"] as const).map(p => (
                          <button key={p} onClick={() => setOtpSlotPosition(p)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", otpSlotPosition === p ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{p}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">State</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["default","active","filled","disabled"].map(s => (
                          <button key={s} onClick={() => setOtpSlotState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", otpSlotState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>

      <InstallationSection pkg={["input-otp"]} importCode={`import {\n  InputOTP,\n  InputOTPGroup,\n  InputOTPSlot,\n  InputOTPSeparator,\n} from "@/components/ui/input-otp"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
        <Example title="6 Digits" description="Standard 6-digit code for email and SMS verification flows." code={`<InputOTP maxLength={6}>\n  <InputOTPGroup>\n    <InputOTPSlot index={0} />\n    <InputOTPSlot index={1} />\n    <InputOTPSlot index={2} />\n    <InputOTPSlot index={3} />\n    <InputOTPSlot index={4} />\n    <InputOTPSlot index={5} />\n  </InputOTPGroup>\n</InputOTP>`}>
          <InputOTP maxLength={6}>
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Example>
        <Example title="With Separator" description="Use InputOTPSeparator to split groups visually — common for phone codes (3+3 or 4+4)." code={`<InputOTP maxLength={6}>\n  <InputOTPGroup>\n    <InputOTPSlot index={0} />\n    <InputOTPSlot index={1} />\n    <InputOTPSlot index={2} />\n  </InputOTPGroup>\n  <InputOTPSeparator />\n  <InputOTPGroup>\n    <InputOTPSlot index={3} />\n    <InputOTPSlot index={4} />\n    <InputOTPSlot index={5} />\n  </InputOTPGroup>\n</InputOTP>`}>
          <InputOTP maxLength={6}>
            <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /></InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} /></InputOTPGroup>
          </InputOTP>
        </Example>
        <Example title="4 Digits" description="Shorter PIN entry — ideal for in-app lock screens or payment confirmation." code={`<InputOTP maxLength={4}>\n  <InputOTPGroup>\n    <InputOTPSlot index={0} />\n    <InputOTPSlot index={1} />\n    <InputOTPSlot index={2} />\n    <InputOTPSlot index={3} />\n  </InputOTPGroup>\n</InputOTP>`}>
          <InputOTP maxLength={4}>
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </Example>
        <Example title="8 Digits" description="Extended code for backup codes or high-security token entry." code={`<InputOTP maxLength={8}>\n  <InputOTPGroup>\n    <InputOTPSlot index={0} />\n    ...\n    <InputOTPSlot index={7} />\n  </InputOTPGroup>\n</InputOTP>`}>
          <InputOTP maxLength={8}>
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} />
              <InputOTPSlot index={4} /><InputOTPSlot index={5} /><InputOTPSlot index={6} /><InputOTPSlot index={7} />
            </InputOTPGroup>
          </InputOTP>
        </Example>
        <Example title="Disabled" description="Prevent input when code is being verified or the session is locked." code={`<InputOTP maxLength={6} disabled>\n  ...\n</InputOTP>`}>
          <InputOTP maxLength={6} disabled>
            <InputOTPGroup>
              <InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} />
              <InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Example>
        <Example title="4+4 Split" description="Two groups of four — suits 8-character backup tokens or reference numbers." code={`<InputOTP maxLength={8}>\n  <InputOTPGroup><!-- slots 0–3 --></InputOTPGroup>\n  <InputOTPSeparator />\n  <InputOTPGroup><!-- slots 4–7 --></InputOTPGroup>\n</InputOTP>`}>
          <InputOTP maxLength={8}>
            <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /></InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup><InputOTPSlot index={4} /><InputOTPSlot index={5} /><InputOTPSlot index={6} /><InputOTPSlot index={7} /></InputOTPGroup>
          </InputOTP>
        </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground font-body">Built on <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">input-otp</code>. Supports all OTPInput props in addition to the following:</p>
        <h3 className="font-semibold text-sm">InputOTP</h3>
        <PropsTable rows={[
          ["maxLength", "number", "—", "Total number of OTP digits (required)"],
          ["value", "string", '""', "Controlled current value"],
          ["onChange", "(value: string) => void", "—", "Callback fired on each digit change"],
          ["disabled", "boolean", "false", "Disable all input interaction"],
          ["containerClassName", "string", '""', "CSS classes on the outer container div"],
          ["className", "string", '""', "CSS classes on the hidden input element"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">InputOTPSlot</h3>
        <PropsTable rows={[
          ["index", "number", "—", "Zero-based slot position (required)"],
          ["className", "string", '""', "Additional CSS classes on the slot cell"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">InputOTPSeparator</h3>
        <PropsTable rows={[
          ["children", "ReactNode", "<Minus />", "Override the separator element"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--border-strong","zinc-400 / zinc-600","Slot border color"],
        ["--ring","violet-600/30","Focus ring on active slot"],
        ["--foreground","zinc-950 / zinc-50","Digit text color"],
        ["--muted-foreground","zinc-500","Caret color"],
        ["--radius-md","6px","Slot corner radius (rounded-md)"],
        ["--size-3xl","48px","Slot dimensions (size-3xl)"],
      ]} />
      <BestPractices items={[
        {do:"Use maxLength matching the exact code length — never make users guess how many digits to enter.",dont:"Use a generic text input for OTP codes — users lose auto-advance and paste behavior."},
        {do:"Always support paste so users can copy from SMS or email in one action.",dont:"Block paste functionality — it's the most common way users receive verification codes."},
        {do:"Trigger verification automatically when all slots are filled (onChange fires on completion).",dont:"Require an extra 'Submit' click after the last digit is entered."},
      ]} />
      <FigmaMapping rows={[
        ["Length","4","maxLength","4"],
        ["Length","6","maxLength","6"],
        ["Length","8","maxLength","8"],
        ["Slot size","48×48px","—","size-3xl on InputOTPSlot"],
        ["Slot border","zinc-400","—","border-border-strong"],
        ["Active ring","violet-600/30","—","ring-[3px] ring-ring on isActive"],
        ["Separator","Minus icon","InputOTPSeparator","Between InputOTPGroup elements"],
        ["State — Disabled","opacity 50%","disabled","has-disabled:opacity-50 on container"],
      ]} />
      <AccessibilityInfo keyboard={[
        ["0–9","Enter digit and auto-advance to next slot"],
        ["Backspace","Delete current digit and move focus back"],
        ["Arrow Left / Right","Navigate between slots"],
        ["Tab","Move focus into the OTP field"],
        ["Ctrl+V / Cmd+V","Paste full code and distribute across slots"],
      ]} notes={[
        "Rendered as a single hidden <input> — screen readers see one field, not six",
        "aria-label should be added to InputOTP for context: aria-label='Verification code'",
        "Slot cells are visual only (role=presentation); keyboard focus stays on the hidden input",
        "Auto-advances after each digit — no additional navigation required from the user",
        "Paste distributes characters across all slots automatically",
      ]} />
      <RelatedComponents items={[
        {name:"Input",desc:"Standard single-line text field — use when the code is free-form rather than fixed-length."},
        {name:"Dialog",desc:"Commonly wraps an OTP field for step-up authentication flows."},
        {name:"Form",desc:"Wrap InputOTP in a Form field for label, description, and error message support."},
      ]} />
    </div>
  )
}

function HoverCardDocs() {
  const [side, setSide] = useState("bottom")
  const [align, setAlign] = useState("center")
  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Hover Card</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          A rich preview card that appears on hover or focus — for displaying supplementary info like user profiles, link metadata, and entity details without navigating away. Built on Radix HoverCard; not accessible on touch devices and should never contain essential content or interactive elements.
        </p>
      </header>

      {/* 2. ExploreBehavior — interactive, hover the trigger */}
      <ExploreBehavior controls={[
        { label: "Side", type: "select", options: ["bottom", "top", "left", "right"], value: side, onChange: setSide },
        { label: "Align", type: "select", options: ["center", "start", "end"], value: align, onChange: setAlign },
      ]}>
        <div className="flex items-center justify-center py-2xl">
          <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
              <Button variant="ghost">@nextjs</Button>
            </HoverCardTrigger>
            <HoverCardContent side={side as "bottom" | "top" | "left" | "right"} align={align as "center" | "start" | "end"} className="w-72">
              <div className="flex gap-md">
                <Avatar>
                  <AvatarImage src="https://github.com/vercel.png" />
                  <AvatarFallback>VC</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold">@nextjs</h4>
                  <p className="text-xs text-muted-foreground">The React Framework — created and maintained by @vercel.</p>
                  <div className="flex items-center gap-xs text-xs text-muted-foreground">
                    <CalendarIcon className="size-3" />
                    <span>Joined December 2021</span>
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </ExploreBehavior>

      {/* 3. Installation */}
      <InstallationSection
        pkg={["@radix-ui/react-hover-card"]}
        importCode={`import {\n  HoverCard,\n  HoverCardTrigger,\n  HoverCardContent,\n} from "@/components/ui/hover-card"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example
            title="User Profile"
            description="@mention trigger with avatar, handle, bio, and join date. Use for social or collaborative apps where users reference teammates."
            code={`<HoverCard>\n  <HoverCardTrigger asChild>\n    <Button variant="ghost">@nextjs</Button>\n  </HoverCardTrigger>\n  <HoverCardContent className="w-72">\n    <div className="flex gap-md">\n      <Avatar>\n        <AvatarImage src="https://github.com/vercel.png" />\n        <AvatarFallback>VC</AvatarFallback>\n      </Avatar>\n      <div className="space-y-1">\n        <h4 className="text-sm font-semibold">@nextjs</h4>\n        <p className="text-xs text-muted-foreground">The React Framework.</p>\n        <div className="flex items-center gap-xs text-xs text-muted-foreground">\n          <CalendarIcon className="size-3" />\n          <span>Joined December 2021</span>\n        </div>\n      </div>\n    </div>\n  </HoverCardContent>\n</HoverCard>`}
          >
            <div className="flex flex-col items-start gap-md">
              <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger asChild>
                  <Button variant="ghost">@nextjs</Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-72">
                  <div className="flex gap-md">
                    <Avatar>
                      <AvatarImage src="https://github.com/vercel.png" />
                      <AvatarFallback>VC</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">@nextjs</h4>
                      <p className="text-xs text-muted-foreground">The React Framework — created and maintained by @vercel.</p>
                      <div className="flex items-center gap-xs text-xs text-muted-foreground">
                        <CalendarIcon className="size-3" />
                        <span>Joined December 2021</span>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <div className="pointer-events-none w-72 rounded-md border border-border bg-card p-md shadow-md">
                <div className="flex gap-md">
                  <Avatar>
                    <AvatarImage src="https://github.com/vercel.png" />
                    <AvatarFallback>VC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">@nextjs</h4>
                    <p className="text-xs text-muted-foreground">The React Framework — created and maintained by @vercel.</p>
                    <div className="flex items-center gap-xs text-xs text-muted-foreground">
                      <CalendarIcon className="size-3" />
                      <span>Joined December 2021</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Example>

          <Example
            title="Link Preview"
            description="Resource or doc link with title, description, and URL. Use when inline links point to external pages and a preview reduces uncertainty."
            code={`<HoverCard>\n  <HoverCardTrigger asChild>\n    <Button variant="ghost">Documentation</Button>\n  </HoverCardTrigger>\n  <HoverCardContent className="w-64">\n    <div className="space-y-xs">\n      <h4 className="text-sm font-semibold">API Reference</h4>\n      <p className="text-xs text-muted-foreground">Complete API docs with examples and migration guides.</p>\n      <p className="text-xs text-primary">docs.example.com</p>\n    </div>\n  </HoverCardContent>\n</HoverCard>`}
          >
            <div className="flex flex-col items-start gap-md">
              <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger asChild>
                  <Button variant="ghost">Documentation</Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64">
                  <div className="space-y-xs">
                    <h4 className="text-sm font-semibold">API Reference</h4>
                    <p className="text-xs text-muted-foreground">Complete API documentation with examples, types, and migration guides.</p>
                    <p className="text-xs text-primary">docs.example.com</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <div className="pointer-events-none w-64 rounded-md border border-border bg-card p-md shadow-md">
                <div className="space-y-xs">
                  <h4 className="text-sm font-semibold">API Reference</h4>
                  <p className="text-xs text-muted-foreground">Complete API documentation with examples, types, and migration guides.</p>
                  <p className="text-xs text-primary">docs.example.com</p>
                </div>
              </div>
            </div>
          </Example>

          <Example
            title="Metric / Stats Preview"
            description="KPI card with breakdown metrics. Use in data tables or dashboards where a cell value needs context without opening a detail panel."
            code={`<HoverCard>\n  <HoverCardTrigger asChild>\n    <Button variant="ghost" className="font-mono">$48,200</Button>\n  </HoverCardTrigger>\n  <HoverCardContent className="w-56">\n    <div className="space-y-sm">\n      <p className="text-xs font-medium text-foreground">Revenue Breakdown</p>\n      <div className="space-y-2xs">\n        <div className="flex justify-between text-xs">\n          <span className="text-muted-foreground">Subscriptions</span>\n          <span>$32,100</span>\n        </div>\n        <div className="flex justify-between text-xs">\n          <span className="text-muted-foreground">One-time</span>\n          <span>$16,100</span>\n        </div>\n      </div>\n    </div>\n  </HoverCardContent>\n</HoverCard>`}
          >
            <div className="flex flex-col items-start gap-md">
              <HoverCard openDelay={0} closeDelay={0}>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" className="font-mono">$48,200</Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-56">
                  <div className="space-y-sm">
                    <p className="text-xs font-medium text-foreground">Revenue Breakdown</p>
                    <div className="space-y-2xs">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Subscriptions</span>
                        <span className="text-foreground">$32,100</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">One-time</span>
                        <span className="text-foreground">$16,100</span>
                      </div>
                      <div className="flex justify-between text-xs font-medium border-t border-border pt-2xs">
                        <span className="text-muted-foreground">Total</span>
                        <span className="text-foreground">$48,200</span>
                      </div>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
              <div className="pointer-events-none w-56 rounded-md border border-border bg-card p-md shadow-md">
                <div className="space-y-sm">
                  <p className="text-xs font-medium text-foreground">Revenue Breakdown</p>
                  <div className="space-y-2xs">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Subscriptions</span>
                      <span className="text-foreground">$32,100</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">One-time</span>
                      <span className="text-foreground">$16,100</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium border-t border-border pt-2xs">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-foreground">$48,200</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Example>
        </div>

        {/* Phần B: Interactive Demo — hover thật để test behavior */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg flex flex-wrap gap-sm">
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <Button variant="outline" size="sm">@nextjs</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-72">
                <div className="flex gap-md">
                  <Avatar>
                    <AvatarImage src="https://github.com/vercel.png" />
                    <AvatarFallback>VC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">@nextjs</h4>
                    <p className="text-xs text-muted-foreground">The React Framework — created and maintained by @vercel.</p>
                    <div className="flex items-center gap-xs text-xs text-muted-foreground">
                      <CalendarIcon className="size-3" />
                      <span>Joined December 2021</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <Button variant="outline" size="sm">Documentation</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-64">
                <div className="space-y-xs">
                  <h4 className="text-sm font-semibold">API Reference</h4>
                  <p className="text-xs text-muted-foreground">Complete API documentation with examples, types, and migration guides.</p>
                  <p className="text-xs text-primary">docs.example.com</p>
                </div>
              </HoverCardContent>
            </HoverCard>
            <HoverCard openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <Button variant="outline" size="sm" className="font-mono">$48,200</Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-56">
                <div className="space-y-sm">
                  <p className="text-xs font-medium text-foreground">Revenue Breakdown</p>
                  <div className="space-y-2xs">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Subscriptions</span>
                      <span className="text-foreground">$32,100</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">One-time</span>
                      <span className="text-foreground">$16,100</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium border-t border-border pt-2xs">
                      <span className="text-muted-foreground">Total</span>
                      <span className="text-foreground">$48,200</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground font-body">
          Three sub-components — <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">HoverCard</code> controls timing,{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">HoverCardTrigger</code> wraps the hover target,{" "}
          <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">HoverCardContent</code> controls position and renders the preview.
        </p>
        <h3 className="font-semibold text-sm">HoverCard</h3>
        <PropsTable rows={[
          ["openDelay", "number", "700", "Delay in ms before the card opens after hover starts"],
          ["closeDelay", "number", "300", "Delay in ms before the card closes after hover ends"],
          ["open", "boolean", "—", "Controlled open state"],
          ["onOpenChange", "(open: boolean) => void", "—", "Callback when open state changes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">HoverCardTrigger</h3>
        <PropsTable rows={[
          ["asChild", "boolean", "false", "Merge props onto child element instead of rendering a span"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">HoverCardContent</h3>
        <PropsTable rows={[
          ["side", '"top" | "right" | "bottom" | "left"', '"bottom"', "Side of the trigger to render on"],
          ["align", '"start" | "center" | "end"', '"center"', "Alignment along the trigger edge"],
          ["sideOffset", "number", "4", "Distance from the trigger in px"],
          ["className", "string", '""', "Additional CSS classes — use w-* to control width"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--card", "white / zinc-900", "HoverCardContent background (bg-card)"],
        ["--card-foreground", "zinc-950 / zinc-50", "HoverCardContent text color"],
        ["--color-border", "zinc-200 / zinc-800", "HoverCardContent border (border-border)"],
        ["--radius-md", "8px", "HoverCardContent border radius (rounded-md)"],
        ["--shadow-md", "0 4px 6px rgba(...)", "HoverCardContent shadow (shadow-md)"],
        ["--spacing-md", "16px", "HoverCardContent padding (p-md)"],
        ["--z-index-50", "50", "Stack order (z-50) — above most content"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          do: "Use HoverCard for supplementary info only — user bio, link preview, metric breakdown. Content must make sense even if the user never sees it.",
          dont: "Put essential content in HoverCard — touch users and keyboard users relying on screen readers may not trigger it.",
        },
        {
          do: "Keep content read-only: text, avatars, badges, and stats. Use openDelay={0} in demos to reduce friction during testing.",
          dont: "Add buttons, forms, or links inside HoverCardContent — use Popover for interactive overlays.",
        },
        {
          do: "Set an explicit width via className (e.g. w-64, w-72) to prevent layout shifts when content length varies.",
          dont: "Let the card width be unconstrained — it will reflow based on content and break alignment.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["HoverCard container", "bg-card, border-border, rounded-md, shadow-md, p-md", "HoverCardContent", "z-50 w-64 rounded-md border border-border bg-card p-md shadow-md"],
        ["Side", "bottom / top / left / right", "side", '"bottom"'],
        ["Align", "start / center / end", "align", '"center"'],
        ["Side Offset", "4px gap from trigger", "sideOffset", "4"],
        ["Open Delay", "700ms default", "openDelay", "700"],
        ["Close Delay", "300ms default", "closeDelay", "300"],
        ["Trigger", "Any element (button, text, link)", "HoverCardTrigger asChild", "asChild merges onto child"],
        ["Width", "w-64 default", "className", "Override with w-56, w-72, etc."],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[
          ["Tab", "Focus the trigger to show the hover card"],
          ["Esc", "Dismiss the hover card"],
        ]}
        notes={[
          "HoverCard opens on both hover and keyboard focus — keyboard users can access content",
          "Touch devices cannot hover — never put essential content here; use Popover or Dialog instead",
          "HoverCardContent renders in a portal (z-50) — ensure it does not overlap critical UI",
          "HoverCardTrigger should always be a focusable element (button or link) — use asChild to avoid nested interactive elements",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Tooltip", desc: "Plain text hint on hover. Use instead of HoverCard when content is a single short label with no rich layout." },
        { name: "Popover", desc: "Interactive overlay triggered by click. Use when the preview needs buttons, forms, or other interactive elements." },
        { name: "Dialog", desc: "Full modal for focused tasks. Use when the entity being previewed needs a dedicated detail view." },
      ]} />
    </div>
  )
}

/* ── Preset Item ── */
type PresetItemState = "default" | "hover" | "active"

const presetItemStyles: Record<PresetItemState, string> = {
  "default": "text-muted-foreground",
  "hover":   "bg-muted text-foreground",
  "active":  "bg-primary text-primary-foreground font-medium",
}

function PresetItem({ state, children, onClick }: { state: PresetItemState; children: ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "sp-caption text-left px-sm py-xs rounded-md transition-colors",
        presetItemStyles[state],
        state === "default" && "hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function DayStatesSection() {
  const states: { state: DayCellState; label: string; value: string }[] = [
    { state: "default", label: "Default", value: "14" },
    { state: "hover", label: "Hover", value: "14" },
    { state: "today", label: "Today", value: "14" },
    { state: "selected", label: "Selected", value: "14" },
    { state: "outside", label: "Outside", value: "31" },
    { state: "disabled", label: "Disabled", value: "14" },
    { state: "range-start", label: "Range Start", value: "10" },
    { state: "range-middle", label: "Range Middle", value: "12" },
    { state: "range-end", label: "Range End", value: "15" },
    { state: "range-hover", label: "Range Hover", value: "12" },
  ]

  return (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">Day States</h2>
      <p className="text-muted-foreground font-body">All visual states a day cell can have inside the calendar grid. Each cell is 48×48px with rounded-sm (4px) radius.</p>
      <div className="flex flex-wrap gap-md items-end">
        {states.map(({ state, label, value }) => (
          <div key={state} className="flex flex-col items-center gap-xs">
            <DayCell state={state}>{value}</DayCell>
            <span className="text-xs text-muted-foreground font-mono">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function CalendarSingleExample() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 2, 18))
  return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
}

function CalendarRangeExample() {
  const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: new Date(2026, 2, 18), to: new Date(2026, 3, 8) })
  return (
    <Calendar
      mode="range"
      selected={range.from ? { from: range.from, to: range.to } : undefined}
      onSelect={(r) => setRange({ from: r?.from, to: r?.to })}
      className="rounded-md border"
    />
  )
}

function CalendarDocs() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 2, 18))
  const [calRange, setCalRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: new Date(2026, 2, 18), to: new Date(2026, 3, 8) })
  const [calMode, setCalMode] = useState<"single" | "range">("single")
  const [showOutsideDays, setShowOutsideDays] = useState(true)
  const [calDayCellState, setCalDayCellState] = useState<DayCellState>("default")
  return (
    <div className="space-y-3xl">
      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Form</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Calendar</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A date picker calendar built on react-day-picker. Supports single date and date range selection, with optional outside-day display and date disabling.</p>
      </header>

      {/* 2. Explore Behavior — tabbed: Calendar | Day Cell */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
        <Tabs defaultValue="calendar-group" className="w-full">
          <div className="border border-border rounded-xl overflow-hidden">
          <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
            <TabsTrigger value="calendar-group" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Calendar</span></TabsTrigger>
            <TabsTrigger value="day-cell" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Day Cell</span></TabsTrigger>
          </TabsList>

          {/* Tab 1: Calendar */}
          <TabsContent value="calendar-group" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                {calMode === "range" ? (
                  <Calendar
                    mode="range"
                    selected={calRange.from ? { from: calRange.from, to: calRange.to } : undefined}
                    onSelect={(r) => setCalRange({ from: r?.from, to: r?.to })}
                    showOutsideDays={showOutsideDays}
                    numberOfMonths={2}
                    className="rounded-md border"
                                     />
                ) : (
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    showOutsideDays={showOutsideDays}
                    className="rounded-md border"
                                     />
                )}
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-col gap-md">
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">Mode</Label>
                    <div className="flex flex-wrap gap-xs">
                      {(["single", "range"] as const).map(m => (
                        <button key={m} onClick={() => setCalMode(m)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", calMode === m ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{m}</button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-lg gap-y-xs">
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Show Outside Days</Label>
                      <Switch checked={showOutsideDays} onCheckedChange={setShowOutsideDays} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Day Cell */}
          <TabsContent value="day-cell" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <div>
                  <DayCell state={calDayCellState}>{calDayCellState === "outside" ? "31" : "14"}</DayCell>
                </div>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-col gap-md">
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">State</Label>
                    <div className="flex flex-wrap gap-xs">
                      {(["default", "hover", "today", "selected", "outside", "disabled", "range-start", "range-middle", "range-end", "range-hover"] as DayCellState[]).map(s => (
                        <button key={s} onClick={() => setCalDayCellState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", calDayCellState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s.replace("-", " ")}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          </div>
        </Tabs>
      </section>

      {/* 3. Installation */}
      <InstallationSection pkg={["react-day-picker","date-fns"]} importCode={`import { Calendar } from "@/components/ui/calendar"`} />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Single Date" description="Select one date. Controlled via selected and onSelect props." code={`const [date, setDate] = useState<Date | undefined>()\n\n<Calendar mode="single" selected={date} onSelect={setDate} />`}>
            <CalendarSingleExample />
          </Example>
          <Example title="Date Range" description="Select a start and end date. The range between them is highlighted." code={`const [range, setRange] = useState<DateRange>()\n\n<Calendar mode="range" selected={range} onSelect={setRange} />`}>
            <CalendarRangeExample />
          </Example>
          <Example title="Read-only" description="Display a fixed date without allowing interaction. Use pointer-events-none." code={`<Calendar mode="single" selected={new Date()} className="pointer-events-none" />`}>
            <Calendar mode="single" selected={new Date()} className="rounded-md border pointer-events-none" />
          </Example>
          <Example title="Hide Outside Days" description="Hides days from adjacent months for a cleaner, focused view." code={`<Calendar mode="single" showOutsideDays={false} />`}>
            <Calendar mode="single" showOutsideDays={false} className="rounded-md border" />
          </Example>
        </div>
      </section>

      {/* 5. Props */}
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

      <DesignTokensTable rows={[["--primary","violet-600","Selected day"],["--accent","zinc-100","Hover day"],["--muted-foreground","zinc-500","Outside days text"],["--foreground","zinc-900","Day text"],["--border","zinc-200","Calendar border"]]} />
      <BestPractices items={[{do:"Use Calendar inline when date selection is the primary task.",dont:"Use Calendar inline for quick date picking — use DatePicker with popover."},{do:"Disable dates outside valid ranges with the disabled prop.",dont:"Allow selection of invalid dates and validate later."}]} />
      <FigmaMapping rows={[["Mode","Single","mode",'"single"'],["Mode","Range","mode",'"range"'],["Outside Days","true","showOutsideDays","true"]]} />
      <AccessibilityInfo keyboard={[["Arrow Keys","Navigate days"],["Enter / Space","Select day"],["Page Up/Down","Prev/next month"],["Home / End","First/last day of week"]]} notes={["Built on react-day-picker v9","Supports disabled dates"]} />
      <RelatedComponents items={[{name:"DatePicker",desc:"Calendar in a popover."},{name:"Input",desc:"For manual date entry."}]} />
    </div>
  )
}

function ContextMenuDocs() {
  const [showLabel, setShowLabel] = useState(true)
  const [showIcons, setShowIcons] = useState(true)
  const [showSeparator, setShowSeparator] = useState(true)
  const [showDestructive, setShowDestructive] = useState(true)
  // Context Menu Item explore state
  const [cmItemType, setCmItemType] = useState("default")
  const [cmItemState, setCmItemState] = useState("default")

  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Context Menu</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">A contextual menu triggered by right-click (or long-press on touch) that surfaces secondary actions for a specific target. Shares the same item types as DropdownMenu — labels, separators, checkboxes, radio groups, and submenus.</p>
      </header>

      {/* 2. Explore Behavior — tabbed: Context Menu | Context Menu Item */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
        <Tabs defaultValue="context-group" className="w-full">
          <div className="border border-border rounded-xl overflow-hidden">
          <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
            <TabsTrigger value="context-group" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Context Menu</span></TabsTrigger>
            <TabsTrigger value="context-item" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Context Menu Item</span></TabsTrigger>
          </TabsList>

          {/* Tab 1: Context Menu */}
          <TabsContent value="context-group" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <div className="bg-card border border-border rounded-md shadow-md w-48 p-1">
                  {showLabel && (
                    <div className="px-xs py-2xs typo-paragraph-sm-bold text-foreground">file.tsx</div>
                  )}
                  {showLabel && showSeparator && <div className="-mx-1 my-1 h-px bg-border" />}
                  <div className={cn("flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm", cmItemType === "destructive" ? "text-destructive" : "", cmItemState === "hover" && "bg-muted", cmItemState === "disabled" && "opacity-50")}>
                    {(showIcons || cmItemType === "with-icon") && (cmItemType === "destructive" ? <Trash2 className="size-md" /> : <Eye className="size-md" />)} {cmItemType === "destructive" ? "Delete" : "Open"}
                    {cmItemType === "with-shortcut" && <span className="ml-auto typo-paragraph-mini tracking-widest text-muted-foreground">⌘O</span>}
                  </div>
                  <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm">
                    {showIcons && <Pencil className="size-md" />} Rename
                  </div>
                  <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm">
                    {showIcons && <Copy className="size-md" />} Duplicate
                  </div>
                  {showSeparator && <div className="-mx-1 my-1 h-px bg-border" />}
                  {showDestructive && (
                    <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm text-destructive">
                      {showIcons && <Trash2 className="size-md" />} Delete
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-wrap gap-x-lg gap-y-xs">
                  <div className="flex flex-col gap-xs">
                    <Label className="text-xs text-muted-foreground font-body">Show Label</Label>
                    <Switch checked={showLabel} onCheckedChange={setShowLabel} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <Label className="text-xs text-muted-foreground font-body">Show Icons</Label>
                    <Switch checked={showIcons} onCheckedChange={setShowIcons} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <Label className="text-xs text-muted-foreground font-body">Show Separator</Label>
                    <Switch checked={showSeparator} onCheckedChange={setShowSeparator} />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <Label className="text-xs text-muted-foreground font-body">Show Destructive</Label>
                    <Switch checked={showDestructive} onCheckedChange={setShowDestructive} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Context Menu Item */}
          <TabsContent value="context-item" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <div>
                  {cmItemType === "destructive" ? (
                    <div className={cn("flex items-center gap-xs rounded-sm px-sm py-1.5 text-sm text-destructive", cmItemState === "hover" && "bg-accent", cmItemState === "disabled" && "opacity-50")}>
                      <Trash2 className="size-md" /> Delete
                    </div>
                  ) : cmItemType === "with-icon" ? (
                    <div className={cn("flex items-center gap-xs rounded-sm px-sm py-1.5 text-sm", cmItemState === "hover" && "bg-accent text-accent-foreground", cmItemState === "disabled" && "opacity-50")}>
                      <Eye className="size-md" /> Open
                    </div>
                  ) : cmItemType === "with-shortcut" ? (
                    <div className={cn("flex items-center gap-sm rounded-sm px-sm py-1.5 text-sm", cmItemState === "hover" && "bg-accent text-accent-foreground", cmItemState === "disabled" && "opacity-50")}>
                      Copy <span className="ml-auto text-xs tracking-widest text-muted-foreground">⌘C</span>
                    </div>
                  ) : (
                    <div className={cn("flex items-center gap-sm rounded-sm px-sm py-1.5 text-sm", cmItemState === "hover" && "bg-accent text-accent-foreground", cmItemState === "disabled" && "opacity-50")}>
                      Rename
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-col gap-md">
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">Type</Label>
                    <div className="flex flex-wrap gap-xs">
                      {["default", "with-icon", "destructive", "with-shortcut"].map(t => (
                        <button key={t} onClick={() => setCmItemType(t)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", cmItemType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{t.replace("with-", "with ")}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">State</Label>
                    <div className="flex flex-wrap gap-xs">
                      {["default", "hover", "disabled"].map(s => (
                        <button key={s} onClick={() => setCmItemState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", cmItemState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          </div>
        </Tabs>
      </section>

      <InstallationSection pkg={["@radix-ui/react-context-menu"]} importCode={`import {\n  ContextMenu,\n  ContextMenuTrigger,\n  ContextMenuContent,\n  ContextMenuItem,\n  ContextMenuLabel,\n  ContextMenuSeparator,\n  ContextMenuShortcut,\n  ContextMenuCheckboxItem,\n  ContextMenuRadioGroup,\n  ContextMenuRadioItem,\n  ContextMenuSub,\n  ContextMenuSubTrigger,\n  ContextMenuSubContent,\n  ContextMenuGroup,\n} from "@/components/ui/context-menu"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="File Explorer" description="Right-click actions for a file — Open, Rename, Duplicate, and Delete." code={`<ContextMenu>\n  <ContextMenuTrigger className="flex h-24 items-center justify-center\n    rounded-md border border-dashed text-sm text-muted-foreground">\n    Right-click here\n  </ContextMenuTrigger>\n  <ContextMenuContent className="w-48">\n    <ContextMenuLabel>file.tsx</ContextMenuLabel>\n    <ContextMenuSeparator />\n    <ContextMenuItem><Eye /> Open</ContextMenuItem>\n    <ContextMenuItem><Pencil /> Rename</ContextMenuItem>\n    <ContextMenuItem><Copy /> Duplicate</ContextMenuItem>\n    <ContextMenuSeparator />\n    <ContextMenuItem className="text-destructive">\n      <Trash2 /> Delete\n    </ContextMenuItem>\n  </ContextMenuContent>\n</ContextMenu>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md w-48 p-1">
              <div className="px-xs py-2xs typo-paragraph-sm-bold text-foreground">file.tsx</div>
              <div className="-mx-1 my-1 h-px bg-border" />
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm bg-muted"><Eye className="size-md" /> Open</div>
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm"><Pencil className="size-md" /> Rename</div>
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm"><Copy className="size-md" /> Duplicate</div>
              <div className="-mx-1 my-1 h-px bg-border" />
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm text-destructive"><Trash2 className="size-md" /> Delete</div>
            </div>
          </Example>
          <Example title="Text Selection" description="Cut, Copy, Paste with keyboard shortcuts — classic text editor context menu." code={`<ContextMenuContent className="w-48">\n  <ContextMenuItem>\n    Cut <ContextMenuShortcut>⌘X</ContextMenuShortcut>\n  </ContextMenuItem>\n  <ContextMenuItem>\n    Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>\n  </ContextMenuItem>\n  <ContextMenuItem>\n    Paste <ContextMenuShortcut>⌘V</ContextMenuShortcut>\n  </ContextMenuItem>\n  <ContextMenuSeparator />\n  <ContextMenuItem>\n    Select All <ContextMenuShortcut>⌘A</ContextMenuShortcut>\n  </ContextMenuItem>\n</ContextMenuContent>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md w-48 p-1">
              <div className="flex items-center rounded-sm px-xs py-2xs typo-paragraph-sm bg-muted">Cut <span className="ml-auto typo-paragraph-mini tracking-widest text-muted-foreground">⌘X</span></div>
              <div className="flex items-center rounded-sm px-xs py-2xs typo-paragraph-sm">Copy <span className="ml-auto typo-paragraph-mini tracking-widest text-muted-foreground">⌘C</span></div>
              <div className="flex items-center rounded-sm px-xs py-2xs typo-paragraph-sm">Paste <span className="ml-auto typo-paragraph-mini tracking-widest text-muted-foreground">⌘V</span></div>
              <div className="-mx-1 my-1 h-px bg-border" />
              <div className="flex items-center rounded-sm px-xs py-2xs typo-paragraph-sm">Select All <span className="ml-auto typo-paragraph-mini tracking-widest text-muted-foreground">⌘A</span></div>
            </div>
          </Example>
          <Example title="With Submenu" description="Use ContextMenuSub + ContextMenuSubTrigger to nest a secondary menu for grouped actions." code={`<ContextMenuContent>\n  <ContextMenuItem>\n    <ArrowLeft /> Back\n    <ContextMenuShortcut>⌘[</ContextMenuShortcut>\n  </ContextMenuItem>\n  <ContextMenuItem>\n    <ArrowRight /> Forward\n    <ContextMenuShortcut>⌘]</ContextMenuShortcut>\n  </ContextMenuItem>\n  <ContextMenuSeparator />\n  <ContextMenuSub>\n    <ContextMenuSubTrigger>\n      <Share /> Share\n    </ContextMenuSubTrigger>\n    <ContextMenuSubContent>\n      <ContextMenuItem>Email</ContextMenuItem>\n      <ContextMenuItem>Message</ContextMenuItem>\n      <ContextMenuItem>Copy Link</ContextMenuItem>\n    </ContextMenuSubContent>\n  </ContextMenuSub>\n  <ContextMenuSeparator />\n  <ContextMenuItem className="text-destructive">\n    <Trash2 /> Delete\n  </ContextMenuItem>\n</ContextMenuContent>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md w-48 p-1">
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm"><ArrowLeft className="size-md" /> Back <span className="ml-auto typo-paragraph-mini tracking-widest text-muted-foreground">⌘[</span></div>
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm bg-muted"><ArrowRight className="size-md" /> Forward <span className="ml-auto typo-paragraph-mini tracking-widest text-muted-foreground">⌘]</span></div>
              <div className="-mx-1 my-1 h-px bg-border" />
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm"><Share className="size-md" /> Share <ChevronRight className="ml-auto size-md" /></div>
              <div className="-mx-1 my-1 h-px bg-border" />
              <div className="flex items-center gap-xs rounded-sm px-xs py-2xs typo-paragraph-sm text-destructive"><Trash2 className="size-md" /> Delete</div>
            </div>
          </Example>
          <Example title="With Checkboxes" description="Toggle view preferences or panel visibility with ContextMenuCheckboxItem." code={`<ContextMenuContent>\n  <ContextMenuLabel>View</ContextMenuLabel>\n  <ContextMenuSeparator />\n  <ContextMenuCheckboxItem checked>\n    Show Toolbar\n  </ContextMenuCheckboxItem>\n  <ContextMenuCheckboxItem checked>\n    Show Sidebar\n  </ContextMenuCheckboxItem>\n  <ContextMenuCheckboxItem>\n    Show Status Bar\n  </ContextMenuCheckboxItem>\n</ContextMenuContent>`}>
            <div className="pointer-events-none bg-card border border-border rounded-md shadow-md w-48 p-1">
              <div className="px-xs py-2xs typo-paragraph-sm-bold text-foreground">View</div>
              <div className="-mx-1 my-1 h-px bg-border" />
              <div className="relative flex items-center rounded-sm py-2xs pl-8 pr-xs typo-paragraph-sm bg-muted">
                <span className="absolute left-xs flex size-3.5 items-center justify-center"><Check className="size-md" /></span> Show Toolbar
              </div>
              <div className="relative flex items-center rounded-sm py-2xs pl-8 pr-xs typo-paragraph-sm">
                <span className="absolute left-xs flex size-3.5 items-center justify-center"><Check className="size-md" /></span> Show Sidebar
              </div>
              <div className="relative flex items-center rounded-sm py-2xs pl-8 pr-xs typo-paragraph-sm opacity-50">
                <span className="absolute left-xs flex size-3.5 items-center justify-center" /> Show Status Bar
              </div>
            </div>
          </Example>
        </div>

        {/* Interactive Demo */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg">
            <ContextMenu>
              <ContextMenuTrigger className="flex h-24 w-full items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground select-none cursor-default">
                Right-click anywhere in this area
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuLabel>file.tsx</ContextMenuLabel>
                <ContextMenuSeparator />
                <ContextMenuItem><Eye /> Open</ContextMenuItem>
                <ContextMenuItem><Pencil /> Rename</ContextMenuItem>
                <ContextMenuItem><Copy /> Duplicate</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuSub>
                  <ContextMenuSubTrigger><Share /> Share</ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem>Email</ContextMenuItem>
                    <ContextMenuItem>Message</ContextMenuItem>
                    <ContextMenuItem>Copy Link</ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem className="text-destructive"><Trash2 /> Delete</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">ContextMenuContent</h3>
        <PropsTable rows={[
          ["className", "string", "—", "Additional CSS classes"],
          ["alignOffset", "number", "0", "Alignment offset in px from the cursor position"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">ContextMenuItem</h3>
        <PropsTable rows={[
          ["inset", "boolean", "false", "Add left padding to align text with icon items"],
          ["disabled", "boolean", "false", "Disable the item — grays it out and prevents interaction"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">ContextMenuCheckboxItem</h3>
        <PropsTable rows={[
          ["checked", "boolean | 'indeterminate'", "false", "Controlled checked state"],
          ["onCheckedChange", "(checked: boolean) => void", "—", "Callback when checked state changes"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">ContextMenuRadioItem</h3>
        <PropsTable rows={[
          ["value", "string", "—", "The value of this item within its ContextMenuRadioGroup"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">ContextMenuSubTrigger</h3>
        <PropsTable rows={[
          ["inset", "boolean", "false", "Add left padding for icon alignment"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--card", "white / #252522", "Menu panel background"],
        ["--border", "zinc-200 / zinc-800", "Menu panel border + separator color"],
        ["--muted", "zinc-100 / zinc-800", "Hovered item background"],
        ["--foreground", "zinc-900 / zinc-50", "Default item text + label text"],
        ["--muted-foreground", "zinc-500", "Keyboard shortcut text color"],
        ["--destructive", "red-500", "Destructive item text color"],
      ]} />

      <BestPractices items={[
        { do: "Use ContextMenu for secondary actions discoverable via right-click — keep primary actions accessible elsewhere.", dont: "Put primary actions only in ContextMenu — users on touch devices may never discover them." },
        { do: "Keep context menu items consistent with the DropdownMenu for the same element when both exist.", dont: "Show different actions in context menu vs dropdown for the same target — creates confusion." },
        { do: "Limit items to what makes sense for the right-clicked target — filter irrelevant actions.", dont: "Show a generic global menu regardless of what was right-clicked — context menus should be contextual." },
        { title: "Destructive items (item)", do: "Place destructive actions last, separated by a divider for visual warning.", dont: "Mix destructive items among regular items without separation." },
      ]} />

      <FigmaMapping rows={[
        ["Menu", "bg-card border rounded-md shadow-md", "ContextMenuContent", "min-w-[8rem] p-1 z-50"],
        ["Label", "paragraph-sm-bold foreground", "ContextMenuLabel", "px-xs py-2xs typo-paragraph-sm-bold text-foreground"],
        ["Separator", "1px border horizontal", "ContextMenuSeparator", "-mx-1 my-1 h-px bg-border"],
        ["Item", "paragraph-sm foreground", "ContextMenuItem", "flex items-center gap-2 px-xs py-2xs rounded-sm"],
        ["Item / Hover", "bg-muted", "focus:bg-muted", "Applied via Radix focus state"],
        ["Item / Disabled", "opacity-50", "data-[disabled]", "data-[disabled]:pointer-events-none data-[disabled]:opacity-50"],
        ["Item / Destructive", "text-destructive", "className", "Apply text-destructive className on ContextMenuItem"],
        ["Shortcut", "paragraph-mini muted-foreground", "ContextMenuShortcut", "ml-auto tracking-widest text-muted-foreground"],
        ["Checkbox indicator", "size-3.5 check icon", "ContextMenuCheckboxItem", "absolute left-xs ItemIndicator"],
        ["Submenu arrow", "ChevronRight ml-auto", "ContextMenuSubTrigger", "ChevronRight rendered automatically"],
        ["Item: Default", "text-foreground, rounded-sm", "ContextMenuItem", "Basic text item"],
        ["Item: With Icon", "icon + label, gap-xs", "ContextMenuItem", "Icon as first child"],
        ["Item: Destructive", "text-destructive", "ContextMenuItem", "className=\"text-destructive\""],
        ["Item: With Shortcut", "label + shortcut", "ContextMenuShortcut", "ml-auto tracking-widest"],
        ["Item: Disabled", "opacity-50", "ContextMenuItem", "data-[disabled]"],
        ["Item: Hover", "bg-muted", "focus:bg-muted", "Radix focus state"],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Right Click / Long Press", "Open the context menu at cursor position"],
          ["Arrow Up / Down", "Navigate between menu items"],
          ["Arrow Right", "Open a submenu from SubTrigger"],
          ["Arrow Left / Escape", "Close submenu or the full menu"],
          ["Enter", "Activate the focused item"],
          ["Tab", "Close menu and move focus to next element"],
        ]}
        notes={[
          "Uses role=\"menu\" with role=\"menuitem\" for screen readers",
          "Focus is managed automatically — first item focuses on open",
          "CheckboxItem and RadioItem use role=\"menuitemcheckbox\" / role=\"menuitemradio\"",
          "Touch devices may use long-press instead of right-click — test on mobile",
          "Always provide an alternative way to trigger context actions (e.g. DropdownMenu button)",
        ]}
      />

      <RelatedComponents items={[
        { name: "DropdownMenu", desc: "Button-triggered menu with the same item types — essential for touch/keyboard users." },
        { name: "Popover", desc: "Floating panel for non-menu content — forms, filters, info." },
        { name: "AlertDialog", desc: "Non-dismissible confirmation — use before destructive context menu actions." },
      ]} />
    </div>
  )
}


// ============================================================
// FOUNDATION PAGES
// ============================================================

function ColorsDocs() {
  const ColorGrid = ({ title, items }: { title: string; items: { name: string; var: string; tw: string }[] }) => (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-sm">
        {items.map(c => (
          <div key={c.var} className="border border-border rounded-lg overflow-hidden">
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
  )
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Foundation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Colors</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Semantic color tokens from the design system. All colors adapt to light/dark mode automatically.</p>
      </header>

      <ColorGrid title="Base Colors" items={[
        { name: "Background", var: "background", tw: "bg-background" },
        { name: "Foreground", var: "foreground", tw: "text-foreground" },
        { name: "Foreground Subtle", var: "foreground-subtle", tw: "text-foreground-subtle" },
      ]} />

      <ColorGrid title="Card & Popover" items={[
        { name: "Card", var: "card", tw: "bg-card" },
        { name: "Card Foreground", var: "card-foreground", tw: "text-card-foreground" },
        { name: "Card Subtle", var: "card-subtle", tw: "bg-card-subtle" },
        { name: "Card Subtle Foreground", var: "card-subtle-foreground", tw: "text-card-subtle-foreground" },
        { name: "Popover", var: "popover", tw: "bg-popover" },
        { name: "Popover Foreground", var: "popover-foreground", tw: "text-popover-foreground" },
      ]} />

      <ColorGrid title="Primary" items={[
        { name: "Primary", var: "primary", tw: "bg-primary" },
        { name: "Primary Foreground", var: "primary-foreground", tw: "text-primary-foreground" },
        { name: "Primary Hover", var: "primary-hover", tw: "bg-primary-hover" },
        { name: "Primary 10%", var: "primary-10", tw: "bg-primary-10" },
        { name: "Primary 20%", var: "primary-20", tw: "bg-primary-20" },
        { name: "Primary Subtle", var: "primary-subtle", tw: "bg-primary-subtle" },
        { name: "Primary Subtle FG", var: "primary-subtle-foreground", tw: "text-primary-subtle-foreground" },
      ]} />

      <ColorGrid title="Secondary & Accent" items={[
        { name: "Secondary", var: "secondary", tw: "bg-secondary" },
        { name: "Secondary Foreground", var: "secondary-foreground", tw: "text-secondary-foreground" },
        { name: "Secondary Hover", var: "secondary-hover", tw: "bg-secondary-hover" },
        { name: "Muted", var: "muted", tw: "bg-muted" },
        { name: "Muted Foreground", var: "muted-foreground", tw: "text-muted-foreground" },
        { name: "Accent", var: "accent", tw: "bg-accent" },
        { name: "Accent Foreground", var: "accent-foreground", tw: "text-accent-foreground" },
        { name: "Accent Selected", var: "accent-selected", tw: "bg-accent-selected" },
      ]} />

      <ColorGrid title="Border & Ring" items={[
        { name: "Border", var: "border", tw: "border-border" },
        { name: "Border Subtle", var: "border-subtle", tw: "border-border-subtle" },
        { name: "Border Strong", var: "border-strong", tw: "border-border-strong" },
        { name: "Border Card", var: "border-card", tw: "border-border-card" },
        { name: "Ring", var: "ring", tw: "ring-ring" },
        { name: "Ring Error", var: "ring-error", tw: "ring-ring-error" },
        { name: "Ring Brand", var: "ring-brand", tw: "ring-ring-brand" },
        { name: "Ring Success", var: "ring-success", tw: "ring-ring-success" },
        { name: "Ring Warning", var: "ring-warning", tw: "ring-ring-warning" },
        { name: "Ring Emphasis", var: "ring-emphasis", tw: "ring-ring-emphasis" },
      ]} />

      <ColorGrid title="Input & Form" items={[
        { name: "Input", var: "input", tw: "bg-input" },
        { name: "Input Readonly", var: "input-readonly", tw: "bg-input-readonly" },
      ]} />

      <ColorGrid title="Ghost & Outline" items={[
        { name: "Ghost", var: "ghost", tw: "bg-ghost" },
        { name: "Ghost Foreground", var: "ghost-foreground", tw: "text-ghost-foreground" },
        { name: "Ghost Hover", var: "ghost-hover", tw: "bg-ghost-hover" },
        { name: "Outline", var: "outline", tw: "bg-outline" },
        { name: "Outline Hover", var: "outline-hover", tw: "bg-outline-hover" },
      ]} />

      <ColorGrid title="Surface & Code" items={[
        { name: "Surface Raised", var: "surface-raised", tw: "bg-surface-raised" },
        { name: "Surface Inset", var: "surface-inset", tw: "bg-surface-inset" },
        { name: "Backdrop", var: "backdrop", tw: "bg-backdrop" },
        { name: "Code", var: "code", tw: "bg-code" },
        { name: "Code Foreground", var: "code-foreground", tw: "text-code-foreground" },
      ]} />

      <ColorGrid title="Destructive" items={[
        { name: "Destructive", var: "destructive", tw: "bg-destructive" },
        { name: "Destructive FG", var: "destructive-foreground", tw: "text-destructive-foreground" },
        { name: "Destructive Subtle", var: "destructive-subtle", tw: "bg-destructive-subtle" },
        { name: "Destructive Subtle FG", var: "destructive-subtle-foreground", tw: "text-destructive-subtle-foreground" },
        { name: "Destructive Border", var: "destructive-border", tw: "border-destructive-border" },
      ]} />

      <ColorGrid title="Success" items={[
        { name: "Success", var: "success", tw: "bg-success" },
        { name: "Success FG", var: "success-foreground", tw: "text-success-foreground" },
        { name: "Success Subtle", var: "success-subtle", tw: "bg-success-subtle" },
        { name: "Success Subtle FG", var: "success-subtle-foreground", tw: "text-success-subtle-foreground" },
        { name: "Success Border", var: "success-border", tw: "border-success-border" },
      ]} />

      <ColorGrid title="Warning" items={[
        { name: "Warning", var: "warning", tw: "bg-warning" },
        { name: "Warning FG", var: "warning-foreground", tw: "text-warning-foreground" },
        { name: "Warning Subtle", var: "warning-subtle", tw: "bg-warning-subtle" },
        { name: "Warning Subtle FG", var: "warning-subtle-foreground", tw: "text-warning-subtle-foreground" },
        { name: "Warning Border", var: "warning-border", tw: "border-warning-border" },
      ]} />

      <ColorGrid title="Emphasis" items={[
        { name: "Emphasis", var: "emphasis", tw: "bg-emphasis" },
        { name: "Emphasis FG", var: "emphasis-foreground", tw: "text-emphasis-foreground" },
        { name: "Emphasis Subtle", var: "emphasis-subtle", tw: "bg-emphasis-subtle" },
        { name: "Emphasis Subtle FG", var: "emphasis-subtle-foreground", tw: "text-emphasis-subtle-foreground" },
        { name: "Emphasis Border", var: "emphasis-border", tw: "border-emphasis-border" },
      ]} />

      <ColorGrid title="Brand" items={[
        { name: "Brand", var: "brand", tw: "bg-brand" },
        { name: "Brand Hover", var: "brand-hover", tw: "bg-brand-hover" },
        { name: "Brand FG", var: "brand-foreground", tw: "text-brand-foreground" },
        { name: "Brand Subtle", var: "brand-subtle", tw: "bg-brand-subtle" },
        { name: "Brand Subtle FG", var: "brand-subtle-foreground", tw: "text-brand-subtle-foreground" },
        { name: "Brand Subtle FG Hover", var: "brand-subtle-foreground-hover", tw: "text-brand-subtle-foreground-hover" },
        { name: "Brand Border", var: "brand-border", tw: "border-brand-border" },
      ]} />

      <ColorGrid title="Glass" items={[
        { name: "Glass BG", var: "glass-bg", tw: "bg-glass-bg" },
        { name: "Glass BG Hover", var: "glass-bg-hover", tw: "bg-glass-bg-hover" },
        { name: "Glass Border", var: "glass-border", tw: "border-glass-border" },
        { name: "Glass Border Hover", var: "glass-border-hover", tw: "border-glass-border-hover" },
      ]} />

      <ColorGrid title="Chart" items={[
        { name: "Chart 1", var: "chart-1", tw: "bg-chart-1" },
        { name: "Chart 2", var: "chart-2", tw: "bg-chart-2" },
        { name: "Chart 3", var: "chart-3", tw: "bg-chart-3" },
        { name: "Chart 4", var: "chart-4", tw: "bg-chart-4" },
        { name: "Chart 5", var: "chart-5", tw: "bg-chart-5" },
        { name: "Chart 6", var: "chart-6", tw: "bg-chart-6" },
      ]} />

      <ColorGrid title="Sidebar" items={[
        { name: "Sidebar", var: "sidebar-background", tw: "bg-sidebar" },
        { name: "Sidebar FG", var: "sidebar-foreground", tw: "text-sidebar-foreground" },
        { name: "Sidebar Primary", var: "sidebar-primary", tw: "bg-sidebar-primary" },
        { name: "Sidebar Primary FG", var: "sidebar-primary-foreground", tw: "text-sidebar-primary-foreground" },
        { name: "Sidebar Accent", var: "sidebar-accent", tw: "bg-sidebar-accent" },
        { name: "Sidebar Accent FG", var: "sidebar-accent-foreground", tw: "text-sidebar-accent-foreground" },
        { name: "Sidebar Accent Hover", var: "sidebar-accent-hover", tw: "bg-sidebar-accent-hover" },
        { name: "Sidebar Muted", var: "sidebar-muted", tw: "text-sidebar-muted" },
        { name: "Sidebar Border", var: "sidebar-border", tw: "border-sidebar-border" },
        { name: "Sidebar Ring", var: "sidebar-ring", tw: "ring-sidebar-ring" },
      ]} />

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
  const headings = [
    { name: "H1", cls: "sp-h1", spec: "Plus Jakarta Sans / ExtraBold / 36px / 40px / -0.02em", sample: "The quick brown fox jumps over the lazy dog" },
    { name: "H2", cls: "sp-h2", spec: "Plus Jakarta Sans / Bold / 24px / 32px / -0.01em", sample: "The quick brown fox jumps over the lazy dog" },
    { name: "H3", cls: "sp-h3", spec: "Plus Jakarta Sans / Bold / 20px / 28px / -0.01em", sample: "The quick brown fox jumps over the lazy dog" },
    { name: "H4", cls: "sp-h4", spec: "Plus Jakarta Sans / SemiBold / 16px / 24px", sample: "The quick brown fox jumps over the lazy dog" },
    { name: "H5", cls: "sp-h5", spec: "Plus Jakarta Sans / SemiBold / 14px / 20px / 0.01em", sample: "The quick brown fox jumps over the lazy dog" },
  ]
  const bodyText = [
    { name: "Body LG", cls: "sp-body-lg", spec: "Inter / Regular / 16px / 24px", sample: "The quick brown fox jumps over the lazy dog" },
    { name: "Body", cls: "sp-body", spec: "Inter / Regular / 14px / 20px", sample: "The quick brown fox jumps over the lazy dog" },
    { name: "Body Medium", cls: "sp-body-medium", spec: "Inter / Medium / 14px / 20px", sample: "The quick brown fox jumps over the lazy dog" },
    { name: "Body Semibold", cls: "sp-body-semibold", spec: "Inter / SemiBold / 14px / 20px", sample: "The quick brown fox jumps over the lazy dog" },
  ]
  const labels = [
    { name: "Label", cls: "sp-label", spec: "Inter / Medium / 12px / 16px / 0.02em", sample: "Form label text" },
    { name: "Label Uppercase", cls: "sp-label-uppercase", spec: "Inter / SemiBold / 11px / 16px / 0.05em / UPPER", sample: "SECTION HEADER" },
    { name: "Caption", cls: "sp-caption", spec: "Inter / Regular / 12px / 16px / 0.01em", sample: "Helper text and descriptions" },
    { name: "Overline", cls: "sp-overline", spec: "Inter / SemiBold / 10px / 12px / 0.08em / UPPER", sample: "CATEGORY LABEL" },
  ]
  const dataKpi = [
    { name: "KPI Hero", cls: "sp-kpi-hero", spec: "JetBrains Mono / SemiBold / 48px / 48px / -0.02em", sample: "$1,234,567" },
    { name: "KPI LG", cls: "sp-kpi-lg", spec: "JetBrains Mono / SemiBold / 32px / 36px / -0.01em", sample: "$123,456" },
    { name: "KPI MD", cls: "sp-kpi-md", spec: "JetBrains Mono / Medium / 24px / 28px / -0.01em", sample: "$12,345" },
    { name: "KPI SM", cls: "sp-kpi-sm", spec: "JetBrains Mono / Medium / 20px / 24px", sample: "$1,234" },
    { name: "Data", cls: "sp-data", spec: "JetBrains Mono / Regular / 14px / 20px", sample: "const x = await fetchData()" },
    { name: "Data SM", cls: "sp-data-sm", spec: "JetBrains Mono / Regular / 12px / 16px / 0.01em", sample: "0x1a2b3c4d" },
    { name: "Order ID", cls: "sp-order-id", spec: "JetBrains Mono / Medium / 13px / 20px / 0.02em", sample: "#ORD-2024-0001" },
  ]
  const TypeScaleSection = ({ title, items }: { title: string; items: typeof headings }) => (
    <section className="space-y-md">
      <h2 className="text-lg font-semibold font-heading">{title}</h2>
      <div className="space-y-xs">
        {items.map(t => (
          <div key={t.name} className="border border-border rounded-lg p-md flex items-center justify-between gap-md">
            <div className="space-y-xs min-w-0">
              <p className={t.cls}>{t.sample}</p>
              <p className="text-xs font-mono text-muted-foreground">{t.spec}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="text-xs font-mono text-muted-foreground bg-muted px-sm py-1 rounded">{t.name}</span>
              <p className="text-[10px] font-mono text-muted-foreground mt-3xs">{t.cls}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Foundation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Typography</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Three font families optimized for readability: Plus Jakarta Sans for headings, Inter for body, JetBrains Mono for code & data.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Font Families</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          <div className="border border-border rounded-lg p-md space-y-xs">
            <p className="font-heading font-extrabold text-xl">Plus Jakarta Sans</p>
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
            <p className="text-xs text-muted-foreground">Code, Data & KPIs</p>
            <p className="text-xs font-mono text-muted-foreground">font-mono</p>
          </div>
        </div>
      </section>
      <TypeScaleSection title="Headings" items={headings} />
      <TypeScaleSection title="Body Text" items={bodyText} />
      <TypeScaleSection title="Labels & Captions" items={labels} />
      <TypeScaleSection title="Data & KPI" items={dataKpi} />
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Font Weights</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-md">
          {[
            ["Regular (400)","font-normal","Inter"],
            ["Medium (500)","font-medium","Inter"],
            ["SemiBold (600)","font-semibold","Plus Jakarta Sans"],
            ["Bold (700)","font-bold","Plus Jakarta Sans"],
            ["ExtraBold (800)","font-extrabold","Plus Jakarta Sans"],
          ].map(([name,cls,family]) => (
            <div key={name} className="border border-border rounded-lg p-md text-center">
              <p className={`text-xl ${family === "Inter" ? "font-body" : "font-heading"} ${cls}`}>Aa</p>
              <p className="text-xs text-muted-foreground mt-xs">{name}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{cls}</p>
              <p className="text-[10px] text-muted-foreground">{family}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SpacingDocs() {
  const spacings = [
    { name: "none", value: "0px", tw: "p-0" },
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
    { name: "5xl", value: "56px", tw: "p-5xl" },
    { name: "6xl", value: "64px", tw: "p-6xl" },
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
              <div className="bg-primary rounded-sm" style={{ width: s.value, height: "20px" }} />
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
              <div className="size-16 bg-primary" style={{ borderRadius: r.value }} />
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
  const glassBlur = [
    { name: "Glass Card", tw: "backdrop-blur-md", desc: "Background blur 12px" },
    { name: "Glass Elevated", tw: "backdrop-blur-lg", desc: "Background blur 16px" },
    { name: "Glass Panel", tw: "backdrop-blur-xl", desc: "Background blur 24px" },
    { name: "Glass Accent", tw: "backdrop-blur-md", desc: "Background blur 12px (accent)" },
  ]
  const glows = [
    { name: "Glow Accent", color: "#7c3aed", desc: "Violet glow \u2014 3 layers (spread + blur 20 + blur 40)", style: { boxShadow: "0 0 0 1px rgba(124,58,237,0.15), 0 0 20px -4px rgba(124,58,237,0.25), 0 0 40px -8px rgba(124,58,237,0.1)" } },
    { name: "Glow Success", color: "#22c55e", desc: "Green glow \u2014 2 layers (spread + blur 20)", style: { boxShadow: "0 0 0 1px rgba(34,197,94,0.15), 0 0 20px -4px rgba(34,197,94,0.2)" } },
    { name: "Glow Destructive", color: "#ef4444", desc: "Red glow \u2014 2 layers (spread + blur 20)", style: { boxShadow: "0 0 0 1px rgba(239,68,68,0.15), 0 0 20px -4px rgba(239,68,68,0.2)" } },
  ]
  const focusRings = [
    { name: "Ring Default", tw: "ring", color: "#27272a", desc: "Zinc 800 \u2014 3px spread, 0 blur" },
    { name: "Ring Error", tw: "ring-error", color: "#7f1d1d", desc: "Red 900 \u2014 3px spread, 0 blur" },
    { name: "Ring Brand", tw: "ring-brand", color: "#4c1d95", desc: "Violet 900 \u2014 3px spread, 0 blur" },
    { name: "Ring Success", tw: "ring-success", color: "#14532d", desc: "Green 900 \u2014 3px spread, 0 blur" },
    { name: "Ring Warning", tw: "ring-warning", color: "#78350f", desc: "Amber 900 \u2014 3px spread, 0 blur" },
    { name: "Ring Emphasis", tw: "ring-emphasis", color: "#1e3a8a", desc: "Blue 900 \u2014 3px spread, 0 blur" },
  ]
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Foundation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Effects</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">All Figma effect styles: shadows, glass blur, glow accents, and focus rings. Each card applies the actual effect.</p>
      </header>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Shadows</h2>
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
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Glass Blur</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {glassBlur.map(g => (
            <div key={g.name} className={`border border-border rounded-xl p-lg ${g.tw}`} style={{ backgroundColor: "rgba(124,58,237,0.08)" }}>
              <p className="font-semibold text-sm">{g.name}</p>
              <p className="text-xs font-mono text-muted-foreground mt-xs">{g.tw}</p>
              <p className="text-[10px] text-muted-foreground mt-3xs">{g.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Glow</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {glows.map(g => (
            <div key={g.name} className="bg-card border border-border rounded-xl p-lg" style={g.style}>
              <p className="font-semibold text-sm">{g.name}</p>
              <p className="text-[10px] text-muted-foreground mt-3xs">{g.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Focus Rings</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-lg">
          {focusRings.map(r => (
            <div key={r.name} className="bg-card border border-border rounded-xl p-lg" style={{ boxShadow: `0 0 0 3px ${r.color}` }}>
              <p className="font-semibold text-sm">{r.name}</p>
              <p className="text-xs font-mono text-muted-foreground mt-xs">{r.tw}</p>
              <p className="text-[10px] text-muted-foreground mt-3xs">{r.desc}</p>
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
    .map(([name, comp]) => ({ name, Icon: comp as ComponentType<{ className?: string }> }))
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

function CommandDocs() {
  const [open, setOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(true)
  // Command Item explore state
  const [cmdItemType, setCmdItemType] = useState("default")
  const [cmdItemState, setCmdItemState] = useState("default")

  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Overlay</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Command</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          A searchable command palette for surfacing actions, navigation items, and settings — renders inline or inside a Dialog via <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">CommandDialog</code>. Supports keyboard navigation, item grouping, empty state, and per-item shortcut hints.
        </p>
      </header>

      {/* 2. Explore Behavior — tabbed: Command | Command Item */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
        <Tabs defaultValue="command-group" className="w-full">
          <div className="border border-border rounded-xl overflow-hidden">
            <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
              <TabsTrigger value="command-group" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Command</span></TabsTrigger>
              <TabsTrigger value="command-item" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Command Item</span></TabsTrigger>
            </TabsList>

            {/* Tab 1: Command */}
            <TabsContent value="command-group" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <div className="w-full max-w-[380px]">
                    <Command className="rounded-lg border shadow-md">
                      <CommandInput placeholder="Type a command or search..." />
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Navigation">
                          <CommandItem><BarChart3 />Analytics{showShortcuts && <CommandShortcut>⌘A</CommandShortcut>}</CommandItem>
                          <CommandItem><User />Profile{showShortcuts && <CommandShortcut>⌘P</CommandShortcut>}</CommandItem>
                          <CommandItem><Settings />Settings{showShortcuts && <CommandShortcut>⌘,</CommandShortcut>}</CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Actions">
                          <CommandItem><Plus />New Order{showShortcuts && <CommandShortcut>⌘N</CommandShortcut>}</CommandItem>
                          <CommandItem><Bell />Notifications{showShortcuts && <CommandShortcut>⌘B</CommandShortcut>}</CommandItem>
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </div>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-wrap gap-x-lg gap-y-xs">
                    <div className="flex flex-col gap-xs">
                      <Label className="text-xs text-muted-foreground font-body">Show Shortcuts</Label>
                      <Switch checked={showShortcuts} onCheckedChange={setShowShortcuts} />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 2: Command Item */}
            <TabsContent value="command-item" className="mt-0">
              <div>
                <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                  <div>
                    <div className={cn("flex items-center gap-sm rounded-sm px-sm py-1.5 text-sm", cmdItemState === "hover" && "bg-accent text-accent-foreground", cmdItemState === "disabled" && "opacity-50")}>
                      {cmdItemType === "with-icon" && <BarChart3 className="size-md" />}
                      <span>{cmdItemType === "with-shortcut" ? "Analytics" : cmdItemType === "with-icon" ? "Analytics" : "Profile"}</span>
                      {cmdItemType === "with-shortcut" && <span className="ml-auto text-xs tracking-widest text-muted-foreground">⌘A</span>}
                    </div>
                  </div>
                </div>
                <div className="border-t border-border p-md bg-muted/10">
                  <div className="flex flex-col gap-md">
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">Type</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["default", "with-icon", "with-shortcut"].map(t => (
                          <button key={t} onClick={() => setCmdItemType(t)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", cmdItemType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{t.replace("with-", "with ")}</button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-xs">
                      <Label className="text-xs text-muted-foreground font-body">State</Label>
                      <div className="flex flex-wrap gap-xs">
                        {["default", "hover", "disabled"].map(s => (
                          <button key={s} onClick={() => setCmdItemState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", cmdItemState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </section>

      {/* 3. Installation */}
      <InstallationSection
        pkg={["cmdk"]}
        importCode={`import {\n  Command,\n  CommandDialog,\n  CommandInput,\n  CommandList,\n  CommandEmpty,\n  CommandGroup,\n  CommandItem,\n  CommandShortcut,\n  CommandSeparator,\n} from "@/components/ui/command"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>

        {/* Phần A: Inline Command renders directly — no pointer-events-none */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">

          <Example
            title="Default"
            description="Inline command palette with grouped items. Add rounded-lg border shadow-md for a floating card look."
            code={`<Command className="rounded-lg border shadow-md">\n  <CommandInput placeholder="Type a command..." />\n  <CommandList>\n    <CommandEmpty>No results found.</CommandEmpty>\n    <CommandGroup heading="Suggestions">\n      <CommandItem><BarChart3 />Analytics</CommandItem>\n      <CommandItem><User />Profile</CommandItem>\n    </CommandGroup>\n  </CommandList>\n</Command>`}
          >
            <div className="w-full max-w-[300px]">
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Type a command..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem><BarChart3 />Analytics</CommandItem>
                    <CommandItem><User />Profile</CommandItem>
                    <CommandItem><Settings />Settings</CommandItem>
                    <CommandItem><Bell />Notifications</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </Example>

          <Example
            title="With Keyboard Shortcuts"
            description="CommandShortcut renders a right-aligned hint — use for discoverable hotkeys on frequently used actions."
            code={`<CommandItem>\n  <BarChart3 />Analytics\n  <CommandShortcut>⌘A</CommandShortcut>\n</CommandItem>`}
          >
            <div className="w-full max-w-[300px]">
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Search actions..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Actions">
                    <CommandItem><BarChart3 />Analytics<CommandShortcut>⌘A</CommandShortcut></CommandItem>
                    <CommandItem><Plus />New Order<CommandShortcut>⌘N</CommandShortcut></CommandItem>
                    <CommandItem><User />Profile<CommandShortcut>⌘P</CommandShortcut></CommandItem>
                    <CommandItem><Settings />Settings<CommandShortcut>⌘,</CommandShortcut></CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </Example>

          <Example
            title="Multiple Groups"
            description="Use CommandGroup and CommandSeparator to organize items into logical categories like Navigation, Actions, and Recent."
            code={`<CommandGroup heading="Navigation">...</CommandGroup>\n<CommandSeparator />\n<CommandGroup heading="Recent">...</CommandGroup>`}
          >
            <div className="w-full max-w-[300px]">
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Navigation">
                    <CommandItem><BarChart3 />Dashboard</CommandItem>
                    <CommandItem><Package />Orders</CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup heading="Recent">
                    <CommandItem><Clock />Order #1042</CommandItem>
                    <CommandItem><Clock />Invoice #208</CommandItem>
                    <CommandItem><Clock />User: jane@acme.com</CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </Example>

          <Example
            title="Empty State"
            description="CommandEmpty renders automatically when no items match the current search query — always include it."
            code={`<CommandList>\n  <CommandEmpty>No results found.</CommandEmpty>\n  <CommandGroup heading="Items">...</CommandGroup>\n</CommandList>`}
          >
            <div className="w-full max-w-[300px] pointer-events-none">
              <div className="rounded-lg border shadow-md bg-card overflow-hidden">
                <div className="flex items-center border-b border-border px-sm">
                  <Search className="size-md opacity-50 shrink-0 mr-xs" />
                  <div className="h-3xl flex items-center text-sm text-muted-foreground">xyznotfound_</div>
                </div>
                <div className="py-xl text-center text-sm text-muted-foreground">No results found.</div>
              </div>
            </div>
          </Example>

        </div>

        {/* Phần B: Interactive Demo */}
        <div className="rounded-xl border border-border overflow-hidden">
          <div className="px-md py-xs bg-muted/50 border-b border-border">
            <span className="text-xs font-medium text-muted-foreground">Interactive Demo</span>
          </div>
          <div className="p-lg space-y-md">
            <p className="text-xs text-muted-foreground">Click to open CommandDialog. Use ↑↓ to navigate, Enter to select, Esc to close.</p>
            <div className="flex flex-wrap gap-sm">
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                Open Command Palette
              </Button>
            </div>
            <CommandDialog open={open} onOpenChange={setOpen}>
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Navigation">
                  <CommandItem onSelect={() => setOpen(false)}><BarChart3 />Analytics<CommandShortcut>⌘A</CommandShortcut></CommandItem>
                  <CommandItem onSelect={() => setOpen(false)}><Package />Orders<CommandShortcut>⌘O</CommandShortcut></CommandItem>
                  <CommandItem onSelect={() => setOpen(false)}><User />Profile<CommandShortcut>⌘P</CommandShortcut></CommandItem>
                  <CommandItem onSelect={() => setOpen(false)}><Settings />Settings<CommandShortcut>⌘,</CommandShortcut></CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Actions">
                  <CommandItem onSelect={() => setOpen(false)}><Plus />New Order<CommandShortcut>⌘N</CommandShortcut></CommandItem>
                  <CommandItem onSelect={() => setOpen(false)}><Star />Add to Favorites</CommandItem>
                  <CommandItem onSelect={() => setOpen(false)}><Bell />Notifications<CommandShortcut>⌘B</CommandShortcut></CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Recent">
                  <CommandItem onSelect={() => setOpen(false)}><Clock />Order #1042</CommandItem>
                  <CommandItem onSelect={() => setOpen(false)}><Clock />Invoice #208</CommandItem>
                  <CommandItem onSelect={() => setOpen(false)}><Clock />User: jane@acme.com</CommandItem>
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </div>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm">CommandInput</h3>
        <PropsTable rows={[
          ["placeholder",   "string",                    "—",     "Placeholder text shown when search is empty"],
          ["value",         "string",                    "—",     "Controlled search value"],
          ["onValueChange", "(value: string) => void",   "—",     "Callback fired on every keystroke"],
          ["className",     "string",                    "—",     "Additional classes for the input wrapper"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">CommandItem</h3>
        <PropsTable rows={[
          ["onSelect",  "(value: string) => void", "—",     "Callback when item is selected via click or Enter"],
          ["disabled",  "boolean",                 "false", "Removes item from keyboard navigation and greys it out"],
          ["value",     "string",                  "—",     "Override the search matching value (defaults to text content)"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">CommandDialog</h3>
        <PropsTable rows={[
          ["open",          "boolean",                   "—", "Controlled open state"],
          ["onOpenChange",  "(open: boolean) => void",   "—", "Callback when overlay is dismissed (Esc, outside click)"],
          ["children",      "ReactNode",                 "—", "CommandInput + CommandList tree"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--card",             "zinc-900 / white",        "Command panel background (bg-card)"],
        ["--border",           "zinc-800 / zinc-200",     "Border and CommandSeparator color"],
        ["--muted",            "zinc-800 / zinc-100",     "Highlighted item background (data-[selected=true]:bg-muted)"],
        ["--muted-foreground", "zinc-400 / zinc-500",     "Group headings and placeholder text"],
        ["--radius-md",        "10px",                    "Panel border radius (rounded-lg on Command wrapper)"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          do:   "Use CommandDialog for the global command palette — trigger with a button or ⌘K shortcut. Always call onOpenChange(false) inside each CommandItem's onSelect so the dialog closes after selection.",
          dont: "Leave the dialog open after an item is selected — users expect the palette to dismiss immediately when they pick an action.",
        },
        {
          do:   "Group related commands under meaningful headings (Navigation, Actions, Recent, Settings). Keep each CommandGroup to 4–6 items for scannability.",
          dont: "Dump all commands into a single flat list without groups — unstructured results are slower to scan and harder to keyboard-navigate.",
        },
        {
          do:   "Use icons consistently — either all items in a group have icons or none do. Pair CommandShortcut with frequently-used actions only.",
          dont: "Mix icon and non-icon items within the same CommandGroup — it creates visual misalignment and inconsistent hit targets.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["Mode",    "Inline",       "Command",        "No dialog wrapper"],
        ["Mode",    "Dialog",       "CommandDialog",  "Wraps in overlay Dialog"],
        ["Input",   "Placeholder",  "placeholder",    '"Type a command..."'],
        ["Item",    "Default",      "CommandItem",    "Selectable row"],
        ["Item",    "With Icon",    "CommandItem + icon", "Icon child before label"],
        ["Item",    "With Shortcut","CommandShortcut", "Right-aligned shortcut hint"],
        ["Item",    "Disabled",     "disabled",       "true"],
        ["Item",    "Hover",        "data-[selected=true]", "bg-accent highlight"],
        ["Group",   "With Heading", "heading",        '"Navigation" / "Actions" etc.'],
        ["Empty",   "No Results",   "CommandEmpty",   "renders when list is empty"],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[
          ["↑ / ↓",          "Navigate between selectable items"],
          ["Enter",           "Select the currently highlighted item"],
          ["Esc",             "Close CommandDialog, or blur/clear in inline mode"],
          ["⌘K (custom)",    "Open command palette — wire up with useEffect + keydown listener"],
        ]}
        notes={[
          "Command uses role='combobox' on the input and role='listbox' on the list — screen readers announce items as options within a listbox.",
          "CommandDialog renders a visually hidden DialogTitle ('Command') required by Radix Dialog — do not remove it.",
          "Disabled CommandItems receive data-disabled='true' and are automatically excluded from keyboard navigation.",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Combobox",      desc: "For searchable single-value select fields — use instead of Command when the goal is picking one value from a list." },
        { name: "Dialog",        desc: "CommandDialog wraps Command in a standard Dialog with overlay and focus trap." },
        { name: "Dropdown Menu", desc: "For contextual action menus — use instead of Command for simple lists without search." },
        { name: "Popover",       desc: "Combine with an inline Command for search-in-popover patterns (e.g. tag pickers)." },
      ]} />

    </div>
  )
}

function NavigationMenuDocs() {
  const [viewport, setViewport] = useState(true)
  const [open, setOpen] = useState(false)
  // Menu Item explore state
  const [itemType, setItemType] = useState("link")
  const [itemState, setItemState] = useState("default")
  const isItemActive = itemState === "active"
  const isItemHover = itemState === "hover"
  return (
    <div className="space-y-3xl">

      {/* 1. Header */}
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Navigation</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Navigation Menu</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">
          Top-level site navigation with hover-triggered dropdown content panels. Supports multi-column layouts,
          active link states, and full keyboard navigation. Built on Radix Navigation Menu.
        </p>
      </header>

      {/* 2. Explore Behavior — tabbed: Navigation Menu | Menu Item */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Explore Behavior</h2>
        <Tabs defaultValue="nav-menu" className="w-full">
          <div className="border border-border rounded-xl overflow-hidden">
          <TabsList className="w-full justify-start bg-transparent rounded-none h-auto p-0 border-b border-border">
            <TabsTrigger value="nav-menu" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Navigation Menu</span></TabsTrigger>
            <TabsTrigger value="menu-item" className="rounded-none border-b-2 border-transparent data-[state=active]:border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none px-lg py-sm text-sm"><span className="relative pb-sm -mb-sm after:absolute after:bottom-0 after:inset-x-0 after:h-[2px] after:rounded-full [[data-state=active]>&]:after:bg-primary">Menu Item</span></TabsTrigger>
          </TabsList>

          {/* Tab 1: Navigation Menu */}
          <TabsContent value="nav-menu" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-start justify-center bg-muted/20">
                <nav className="flex items-center gap-3xs bg-muted dark:bg-white/[0.04] rounded-full px-2xs py-2xs">
                  <NavigationMenu viewport={viewport}>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid gap-xs p-md w-[280px]">
                            <NavigationMenuLink href="#">
                              <span className="font-semibold text-sm">Analytics Dashboard</span>
                              <span className="text-xs text-muted-foreground">Real-time sales and traffic insights</span>
                            </NavigationMenuLink>
                            <NavigationMenuLink href="#">
                              <span className="font-semibold text-sm">E-commerce Suite</span>
                              <span className="text-xs text-muted-foreground">Orders, inventory, and fulfillment</span>
                            </NavigationMenuLink>
                            <NavigationMenuLink href="#">
                              <span className="font-semibold text-sm">CRM Tools</span>
                              <span className="text-xs text-muted-foreground">Customer management and pipelines</span>
                            </NavigationMenuLink>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid gap-xs p-md w-[240px]">
                            <NavigationMenuLink href="#">
                              <span className="font-semibold text-sm">For Startups</span>
                              <span className="text-xs text-muted-foreground">Grow fast with lean tooling</span>
                            </NavigationMenuLink>
                            <NavigationMenuLink href="#">
                              <span className="font-semibold text-sm">For Enterprise</span>
                              <span className="text-xs text-muted-foreground">Scale with security and compliance</span>
                            </NavigationMenuLink>
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        <a href="#" className={navigationMenuTriggerStyle()}>
                          Documentation
                        </a>
                      </NavigationMenuItem>
                      <NavigationMenuItem>
                        {itemType === "trigger" ? (
                          <NavigationMenuTrigger
                            className={cn(
                              isItemActive && "bg-foreground text-background shadow-sm",
                              isItemHover && "bg-muted/40 text-foreground",
                            )}
                          >
                            Dashboard
                          </NavigationMenuTrigger>
                        ) : (
                          <span
                            data-active={isItemActive ? "true" : undefined}
                            className={cn(
                              navigationMenuTriggerStyle(),
                              isItemActive && "bg-foreground text-background shadow-sm",
                              isItemHover && "bg-muted/40 text-foreground",
                            )}
                          >
                            Dashboard
                          </span>
                        )}
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </nav>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-wrap gap-x-lg gap-y-xs">
                  <div className="flex flex-col gap-xs">
                    <Label className="text-xs text-muted-foreground font-body">Viewport</Label>
                    <Switch checked={viewport} onCheckedChange={setViewport} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Menu Item */}
          <TabsContent value="menu-item" className="mt-0">
            <div>
              <div className="px-2xl py-2xl flex items-center justify-center bg-muted/20">
                <div>
                  {itemType === "trigger" ? (
                    <NavigationMenu viewport={false}>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger
                            className={cn(
                              isItemActive && "bg-foreground text-background shadow-sm",
                              isItemHover && "bg-muted/40 text-foreground",
                            )}
                          >
                            Products
                          </NavigationMenuTrigger>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  ) : (
                    <span
                      data-active={isItemActive ? "true" : undefined}
                      className={cn(
                        navigationMenuTriggerStyle(),
                        isItemActive && "bg-foreground text-background shadow-sm",
                        isItemHover && "bg-muted/40 text-foreground",
                      )}
                    >
                      Dashboard
                    </span>
                  )}
                </div>
              </div>
              <div className="border-t border-border p-md bg-muted/10">
                <div className="flex flex-col gap-md">
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">Type</Label>
                    <div className="flex flex-wrap gap-xs">
                      {["link", "trigger"].map(t => (
                        <button key={t} onClick={() => setItemType(t)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors", itemType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{t === "link" ? "Link" : "Trigger"}</button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-xs">
                    <Label className="text-xs text-muted-foreground font-body">State</Label>
                    <div className="flex flex-wrap gap-xs">
                      {["default", "hover", "active"].map(s => (
                        <button key={s} onClick={() => setItemState(s)} className={cn("px-xs py-[4px] rounded-md text-xs font-body border transition-colors capitalize", itemState === s ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border hover:bg-accent")}>{s}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          </div>
        </Tabs>
      </section>

      {/* 3. Installation */}
      <InstallationSection
        pkg={["@radix-ui/react-navigation-menu"]}
        importCode={`import {\n  NavigationMenu,\n  NavigationMenuList,\n  NavigationMenuItem,\n  NavigationMenuContent,\n  NavigationMenuTrigger,\n  NavigationMenuLink,\n  NavigationMenuViewport,\n  NavigationMenuIndicator,\n  navigationMenuTriggerStyle,\n} from "@/components/ui/navigation-menu"`}
      />

      {/* 4. Examples */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">

          <Example
            title="Pill Style — AppHeader"
            description="Wrap NavigationMenuList in a rounded-full muted container to create the pill tab bar pattern used in AppHeader."
            code={`<nav className="flex items-center gap-3xs bg-muted rounded-full px-2xs py-2xs">\n  <NavigationMenu>\n    <NavigationMenuList>\n      <NavigationMenuItem>\n        <NavigationMenuLink href="/dashboard"\n          className="px-lg py-xs rounded-full text-sm font-medium bg-foreground text-background shadow-sm inline-flex items-center">\n          Dashboard\n        </NavigationMenuLink>\n      </NavigationMenuItem>\n      <NavigationMenuItem>\n        <NavigationMenuLink href="/analytics"\n          className="px-lg py-xs rounded-full text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center">\n          Analytics\n        </NavigationMenuLink>\n      </NavigationMenuItem>\n    </NavigationMenuList>\n  </NavigationMenu>\n</nav>`}
          >
            <nav className="flex items-center gap-3xs bg-muted dark:bg-white/[0.04] rounded-full px-2xs py-2xs">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#" data-active="true" className={navigationMenuTriggerStyle()}>Dashboard</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>Analytics</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>Settings</NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </Example>

          <Example
            allowOverflow
            title="With Dropdown Content"
            description="Trigger + NavigationMenuContent for items that expand into a panel with sub-links."
            code={`<NavigationMenu>\n  <NavigationMenuList>\n    <NavigationMenuItem>\n      <NavigationMenuTrigger>Products</NavigationMenuTrigger>\n      <NavigationMenuContent>\n        <ul className="grid gap-xs p-md w-[280px]">\n          <NavigationMenuLink href="/analytics">\n            <span className="font-semibold text-sm">Analytics</span>\n            <span className="text-xs text-muted-foreground">Real-time insights</span>\n          </NavigationMenuLink>\n          <NavigationMenuLink href="/reports">\n            <span className="font-semibold text-sm">Reports</span>\n            <span className="text-xs text-muted-foreground">Scheduled exports</span>\n          </NavigationMenuLink>\n        </ul>\n      </NavigationMenuContent>\n    </NavigationMenuItem>\n  </NavigationMenuList>\n</NavigationMenu>`}
          >
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-xs p-md w-[240px]">
                      <NavigationMenuLink href="#">
                        <span className="font-semibold text-sm">Analytics</span>
                        <span className="text-xs text-muted-foreground">Real-time insights</span>
                      </NavigationMenuLink>
                      <NavigationMenuLink href="#">
                        <span className="font-semibold text-sm">Reports</span>
                        <span className="text-xs text-muted-foreground">Scheduled exports</span>
                      </NavigationMenuLink>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </Example>

          <Example
            allowOverflow
            title="No Viewport"
            description="viewport={false} renders the dropdown inline below the trigger — use inside bounded containers."
            code={`<NavigationMenu viewport={false}>\n  <NavigationMenuList>\n    <NavigationMenuItem>\n      <NavigationMenuTrigger>More</NavigationMenuTrigger>\n      <NavigationMenuContent>\n        <ul className="grid gap-xs p-sm w-[200px]">\n          <NavigationMenuLink href="#">Help Center</NavigationMenuLink>\n          <NavigationMenuLink href="#">Changelog</NavigationMenuLink>\n          <NavigationMenuLink href="#">API Docs</NavigationMenuLink>\n        </ul>\n      </NavigationMenuContent>\n    </NavigationMenuItem>\n  </NavigationMenuList>\n</NavigationMenu>`}
          >
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>More</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-xs p-sm w-[200px]">
                      <NavigationMenuLink href="#">Help Center</NavigationMenuLink>
                      <NavigationMenuLink href="#">Changelog</NavigationMenuLink>
                      <NavigationMenuLink href="#">API Docs</NavigationMenuLink>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </Example>

          <Example
            allowOverflow
            title="Pill + Dropdown"
            description="Combine NavigationMenuTrigger with dropdown content panels — trigger uses built-in pill styles, link items use navigationMenuTriggerStyle()."
            code={`<nav className="flex items-center gap-3xs bg-muted rounded-full px-2xs py-2xs">\n  <NavigationMenu viewport={false}>\n    <NavigationMenuList>\n      <NavigationMenuItem>\n        <NavigationMenuTrigger>Products</NavigationMenuTrigger>\n        <NavigationMenuContent>...</NavigationMenuContent>\n      </NavigationMenuItem>\n      <NavigationMenuItem>\n        <NavigationMenuLink href="#" data-active="true"\n          className={navigationMenuTriggerStyle()}>Dashboard</NavigationMenuLink>\n      </NavigationMenuItem>\n    </NavigationMenuList>\n  </NavigationMenu>\n</nav>`}
          >
            <nav className="flex items-center gap-3xs bg-muted dark:bg-white/[0.04] rounded-full px-2xs py-2xs">
              <NavigationMenu viewport={false}>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      Products
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-xs p-md w-[220px]">
                        <NavigationMenuLink href="#">
                          <span className="font-semibold text-sm">Analytics</span>
                          <span className="text-xs text-muted-foreground">Real-time insights</span>
                        </NavigationMenuLink>
                        <NavigationMenuLink href="#">
                          <span className="font-semibold text-sm">Reports</span>
                          <span className="text-xs text-muted-foreground">Scheduled exports</span>
                        </NavigationMenuLink>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#" data-active="true" className={navigationMenuTriggerStyle()}>Dashboard</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>Analytics</NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </Example>

        </div>

        {/* Interactive Demo */}
        <div className="border border-border rounded-xl">
          <div className="px-2xl py-2xl flex flex-col items-start gap-md bg-muted/20 rounded-t-xl">
            <p className="text-xs text-muted-foreground font-body">Hover over <strong>Products</strong> or <strong>Solutions</strong> to open dropdown panels. <strong>Dashboard</strong> shows the active pill state.</p>
            <nav className="flex items-center gap-3xs bg-muted dark:bg-white/[0.04] rounded-full px-2xs py-2xs">
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      Products
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid grid-cols-2 gap-xs p-md w-[380px]">
                        <NavigationMenuLink href="#">
                          <span className="font-semibold text-sm flex items-center gap-xs"><BarChart3 className="size-4 text-primary" />Analytics</span>
                          <span className="text-xs text-muted-foreground">Real-time sales and traffic</span>
                        </NavigationMenuLink>
                        <NavigationMenuLink href="#">
                          <span className="font-semibold text-sm flex items-center gap-xs"><Package className="size-4 text-primary" />Commerce</span>
                          <span className="text-xs text-muted-foreground">Orders, inventory, fulfillment</span>
                        </NavigationMenuLink>
                        <NavigationMenuLink href="#">
                          <span className="font-semibold text-sm flex items-center gap-xs"><User className="size-4 text-primary" />CRM</span>
                          <span className="text-xs text-muted-foreground">Customer management</span>
                        </NavigationMenuLink>
                        <NavigationMenuLink href="#">
                          <span className="font-semibold text-sm flex items-center gap-xs"><Settings className="size-4 text-primary" />Settings</span>
                          <span className="text-xs text-muted-foreground">Account and workspace config</span>
                        </NavigationMenuLink>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger>
                      Solutions
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid gap-xs p-md w-[260px]">
                        <NavigationMenuLink href="#">
                          <span className="font-semibold text-sm">For Startups</span>
                          <span className="text-xs text-muted-foreground">Move fast with lean tooling</span>
                        </NavigationMenuLink>
                        <NavigationMenuLink href="#">
                          <span className="font-semibold text-sm">For Enterprise</span>
                          <span className="text-xs text-muted-foreground">Scale with security</span>
                        </NavigationMenuLink>
                        <NavigationMenuLink href="#">
                          <span className="font-semibold text-sm">For Agencies</span>
                          <span className="text-xs text-muted-foreground">Manage multiple clients</span>
                        </NavigationMenuLink>
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#" data-active="true" className={navigationMenuTriggerStyle()}>Dashboard</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>Analytics</NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink href="#" className={navigationMenuTriggerStyle()}>Reports</NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </nav>
          </div>
          <div className="border-t border-border p-md bg-muted/10 rounded-b-xl">
            <p className="text-xs text-muted-foreground font-body">Pill tab bar styled to match the <strong>AppHeader</strong> nav: <code className="text-xs bg-muted px-1 rounded">bg-muted rounded-full</code> container + active tab as <code className="text-xs bg-muted px-1 rounded">bg-foreground text-background</code>.</p>
          </div>
        </div>
      </section>

      {/* 5. Props */}
      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <h3 className="font-semibold text-sm mt-md">NavigationMenu</h3>
        <PropsTable rows={[
          ["viewport",   "boolean",   "true",  "Render a shared NavigationMenuViewport — set false to render dropdown inline below the trigger"],
          ["className",  "string",    '""',    "Additional CSS classes on the root element"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">NavigationMenuTrigger</h3>
        <PropsTable rows={[
          ["className",  "string",    '""',    "Extends the base trigger style — apply via cn(navigationMenuTriggerStyle(), ...)"],
          ["children",   "ReactNode", "—",     "Label text — a ChevronDown icon is appended automatically"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">NavigationMenuContent</h3>
        <PropsTable rows={[
          ["className",  "string",    '""',    "Additional CSS on the content panel — commonly used to set w-[N] or grid columns"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">NavigationMenuLink</h3>
        <PropsTable rows={[
          ["href",       "string",    "—",     "Navigation URL — pass to the underlying anchor element"],
          ["asChild",    "boolean",   "false", "Merge props onto child element — use with router Link components"],
          ["data-active","boolean",   "—",     "Marks the link as the current active route — applies bg-muted/50 and text-foreground styles"],
          ["className",  "string",    '""',    "Additional CSS — combine with navigationMenuTriggerStyle() for top-level link items"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">navigationMenuTriggerStyle()</h3>
        <p className="text-xs text-muted-foreground font-body">A cva helper that returns the standard trigger className string. Apply to NavigationMenuLink items that should look like trigger buttons: <code className="text-xs bg-muted px-1 rounded">className={`{navigationMenuTriggerStyle()}`}</code></p>
        <h3 className="font-semibold text-sm mt-md">NavigationMenuLink (as menu item)</h3>
        <PropsTable rows={[
          ["children",   "ReactNode", "—",     "Label text for the nav item"],
          ["href",       "string",    "—",     "Navigation URL for link items"],
          ["asChild",    "boolean",   "false", "Merge props onto child element — use with router Link components"],
          ["data-active","boolean",   "—",     "Marks the link as the current active route"],
          ["className",  "string",    '""',    "Combine with navigationMenuTriggerStyle() for pill appearance"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">NavigationMenuTrigger (as menu item)</h3>
        <PropsTable rows={[
          ["children",   "ReactNode", "—",     "Label text — ChevronDown icon appended automatically"],
          ["className",  "string",    '""',    "Additional CSS classes"],
        ]} />
      </section>

      {/* 6. Design Tokens */}
      <DesignTokensTable rows={[
        ["--background",       "white / zinc-950",  "NavigationMenu root and NavigationMenuViewport background"],
        ["--muted",            "zinc-100 / zinc-800","Trigger and link hover background"],
        ["--muted-foreground", "zinc-500",           "Trigger default text color"],
        ["--foreground",       "zinc-900 / zinc-50", "Trigger text on hover and active states"],
        ["--border",           "zinc-200 / zinc-800","Viewport and content panel border"],
        ["ring-[3px] ring-ring","violet-300",        "Focus ring on trigger and link keyboard focus"],
        ["--card",             "white / zinc-900",   "Dropdown content panel background (viewport=false mode)"],
        ["rounded-full",       "9999px",             "Menu item pill shape border radius"],
        ["--spacing-lg",       "20px",               "Menu item horizontal padding (px-lg)"],
        ["--spacing-xs",       "8px",                "Menu item vertical padding (py-xs)"],
      ]} />

      {/* 7. Best Practices */}
      <BestPractices items={[
        {
          title: "Use case",
          do:   "Use NavigationMenu for primary top-level routes — items that navigate to distinct pages or sections of your app.",
          dont: "Use NavigationMenu for in-page section switching — use Tabs instead so the URL doesn't change.",
        },
        {
          title: "Links vs Triggers",
          do:   "Use NavigationMenuLink + navigationMenuTriggerStyle() for leaf links with no sub-content. Use NavigationMenuTrigger only when there's a content panel to show.",
          dont: "Wrap every item in a NavigationMenuTrigger — items without content look broken (ChevronDown icon with nothing to open).",
        },
        {
          title: "Viewport mode",
          do:   "Keep viewport={true} (default) for page-level headers — the shared viewport creates smooth animated transitions between panels.",
          dont: "Use viewport={true} inside modals, cards, or small containers where the viewport overflows — use viewport={false} for those.",
        },
        {
          title: "Content width",
          do:   "Set a fixed width on NavigationMenuContent (e.g. w-[320px] or w-[500px]) and use grid cols for multi-column layouts.",
          dont: "Let content panels grow without a width constraint — they can expand to full viewport width on large screens.",
        },
        {
          title: "Item labels",
          do:   "Use short, clear labels (1-2 words) — Dashboard, Analytics, Settings.",
          dont: "Use long labels or sentences — they break the pill layout and overflow on small screens.",
        },
        {
          title: "Active state",
          do:   "Set data-active='true' on the item matching the current route. Only one item should be active at a time.",
          dont: "Set multiple items to active — it confuses users about their current location.",
        },
      ]} />

      {/* 8. Figma Mapping */}
      <FigmaMapping rows={[
        ["Nav Bar",          "Root container",       "NavigationMenu",            "flex max-w-max — wraps the list and viewport"],
        ["Nav Item (link)",  "Link",                 "NavigationMenuLink",        "className={navigationMenuTriggerStyle()} for visual parity with triggers"],
        ["Nav Item (menu)",  "Trigger with chevron", "NavigationMenuTrigger",     "ChevronDown appended automatically, rotates on open"],
        ["Dropdown Panel",   "Content overlay",      "NavigationMenuContent",     "Rendered inside NavigationMenuViewport or inline (viewport=false)"],
        ["Viewport",         "Floating container",   "NavigationMenuViewport",    "Shared panel with size animation — one per NavigationMenu"],
        ["Arrow Indicator",  "Arrow / caret",        "NavigationMenuIndicator",   "Animated arrow below trigger pointing into viewport"],
        ["Active state",     "Selected / current",   "data-active on Link",       "bg-muted/50 + text-foreground applied automatically"],
        ["Item Type=Link",   "Text only, no chevron","NavigationMenuLink",        "className={navigationMenuTriggerStyle()}"],
        ["Item Type=Trigger","Text + ChevronDown",   "NavigationMenuTrigger",     "ChevronDown appended automatically"],
        ["Item State=Default","No fill, muted text", "—",                         "Default appearance"],
        ["Item State=Active","bg-foreground text-bg", "data-active / data-[state=open]", "Active route or open trigger"],
        ["Item State=Hover", "bg-muted/40",           "hover:",                   "hover:bg-muted/40 hover:text-foreground"],
      ]} />

      {/* 9. Accessibility */}
      <AccessibilityInfo
        keyboard={[
          ["Tab",         "Move focus to the next navigation trigger or link"],
          ["Shift+Tab",   "Move focus to the previous navigation trigger or link"],
          ["Enter / Space","Open the focused trigger's content panel"],
          ["↑ / ↓",       "Navigate between links inside an open content panel"],
          ["Escape",       "Close the open content panel and return focus to the trigger"],
        ]}
        notes={[
          "Root element renders a <nav> with role='navigation' — acts as a page-level landmark for screen readers.",
          "NavigationMenuTrigger has aria-expanded='true/false' and aria-controls pointing to the content panel id.",
          "NavigationMenuContent has role='group' and is controlled by the trigger via aria-controls.",
          "NavigationMenuLink with data-active gets aria-current='page' — announces the current route to screen readers.",
          "Add aria-label to NavigationMenu for multiple navs on the same page (e.g. aria-label='Main navigation').",
        ]}
      />

      {/* 10. Related Components */}
      <RelatedComponents items={[
        { name: "Tabs",          desc: "For in-page section switching where all views share the same page. Use NavigationMenu for top-level routing between pages." },
        { name: "Breadcrumb",    desc: "Shows the user's current location in a hierarchy. Complement NavigationMenu with Breadcrumb to show context within a route." },
        { name: "Dropdown Menu", desc: "For contextual action menus triggered by a button click — not for primary navigation." },
        { name: "Sidebar",       desc: "Vertical navigation for apps with many sections. Use Sidebar for deeply nested routes; NavigationMenu for top-level horizontal nav." },
      ]} />

    </div>
  )
}

// ============================================================
// LOGO
// ============================================================

function LogoDocs() {
  const [logoType, setLogoType] = useState<"full" | "icon" | "text">("full")
  const [logoSize, setLogoSize] = useState<"default" | "small">("default")
  const sizeVal = logoSize === "default" ? 28 : 24
  const textClass = logoSize === "default" ? "sp-h4" : "sp-h5"
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Branding</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Logo</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">ShopPulse brand logo. Diamond mark with violet gradient + wordmark. Three types: Full (mark + text), Icon (mark only), Text (wordmark only). Two sizes matching header desktop (Default 28px) and mobile (Small 24px).</p>
      </header>

      <ExploreBehavior controls={[
        { label: "Type", type: "select", options: ["full", "icon", "text"], value: logoType, onChange: (v: string) => setLogoType(v as "full" | "icon" | "text") },
        { label: "Size", type: "select", options: ["default", "small"], value: logoSize, onChange: (v: string) => setLogoSize(v as "default" | "small") },
      ]}>
        <div className="flex items-center gap-sm">
          {(logoType === "full" || logoType === "icon") && (
            <ShopPulseLogo size={sizeVal} />
          )}
          {(logoType === "full" || logoType === "text") && (
            <span className={cn(textClass, "text-foreground")}>ShopPulse</span>
          )}
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={[]} importCode={`import { ShopPulseLogo } from "@/components/layout/auth-layout"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Header Desktop" description="Full logo as used in the main header — mark + wordmark at 28px." code={`<div className="flex items-center gap-sm">\n  <ShopPulseLogo size={28} />\n  <span className="sp-h4 text-foreground">ShopPulse</span>\n</div>`}>
            <div className="flex items-center gap-sm">
              <ShopPulseLogo size={28} />
              <span className="sp-h4 text-foreground">ShopPulse</span>
            </div>
          </Example>
          <Example title="Header Mobile" description="Smaller logo for mobile header — mark + wordmark at 24px." code={`<div className="flex items-center gap-sm">\n  <ShopPulseLogo size={24} />\n  <span className="sp-h5 text-foreground">ShopPulse</span>\n</div>`}>
            <div className="flex items-center gap-sm">
              <ShopPulseLogo size={24} />
              <span className="sp-h5 text-foreground">ShopPulse</span>
            </div>
          </Example>
          <Example title="All Types" description="Full, Icon only, Text only at default size." code={`{/* Full */}\n<div className="flex items-center gap-sm">\n  <ShopPulseLogo size={28} />\n  <span className="sp-h4 text-foreground">ShopPulse</span>\n</div>\n{/* Icon */}\n<ShopPulseLogo size={28} />\n{/* Text */}\n<span className="sp-h4 text-foreground">ShopPulse</span>`}>
            <div className="flex items-center gap-lg">
              <div className="flex items-center gap-sm">
                <ShopPulseLogo size={28} />
                <span className="sp-h4 text-foreground">ShopPulse</span>
              </div>
              <ShopPulseLogo size={28} />
              <span className="sp-h4 text-foreground">ShopPulse</span>
            </div>
          </Example>
          <Example title="Small Size" description="Small variants for mobile header and compact areas." code={`<div className="flex items-center gap-sm">\n  <ShopPulseLogo size={24} />\n  <span className="sp-h5 text-foreground">ShopPulse</span>\n</div>\n<ShopPulseLogo size={24} />\n<span className="sp-h5 text-foreground">ShopPulse</span>`}>
            <div className="flex items-center gap-lg">
              <div className="flex items-center gap-sm">
                <ShopPulseLogo size={24} />
                <span className="sp-h5 text-foreground">ShopPulse</span>
              </div>
              <ShopPulseLogo size={24} />
              <span className="sp-h5 text-foreground">ShopPulse</span>
            </div>
          </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground">ShopPulseLogo is a standalone SVG component exported from <code>auth-layout.tsx</code>.</p>
        <PropsTable rows={[
          ["size", "number", "32", "Width and height of the SVG in pixels"],
          ["className", "string", '""', "Additional CSS classes applied to the SVG element"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--primary", "violet-600", "Mark fill mapped to primary token in Figma — actual SVG uses gradient #c4b5fd → #818cf8"],
        ["--foreground", "zinc-50 / zinc-950", "Wordmark text color"],
      ]} />

      <BestPractices items={[
        { do: "Use Full type in desktop headers and auth pages where horizontal space allows.", dont: "Use Full type in cramped spaces like collapsed sidebars — switch to Icon type." },
        { do: "Use Default size (28px) for desktop and Small (24px) for mobile — matches header breakpoints.", dont: "Use arbitrary sizes that don't match the header design tokens." },
        { do: "Pair the mark and wordmark with gap-sm (12px) for consistent spacing.", dont: "Use custom gap values between mark and wordmark — keep it consistent across all instances." },
      ]} />

      <FigmaMapping rows={[
        ["Type", "Full", "—", "Mark SVG + wordmark text side by side"],
        ["Type", "Icon", "—", "Mark SVG only (no text)"],
        ["Type", "Text", "—", "Wordmark text only (no SVG)"],
        ["Size", "Default", "size={28}", "28×28px mark, SP/H4 text"],
        ["Size", "Small", "size={24}", "24×24px mark, SP/H5 text"],
      ]} />

      <AccessibilityInfo
        keyboard={[["—", "Logo is non-interactive by default — wrap in a Link when used as a home navigation element"]]}
        notes={[
          "The SVG has no title or aria-label by default — when used as a link, add accessible text to the wrapping anchor element.",
          "When used decoratively (alongside visible text), the SVG should have aria-hidden='true' to avoid redundant screen reader announcements.",
          "The gradient fills are purely decorative — the logo shape alone provides sufficient visual identity at all sizes.",
        ]}
      />

      <RelatedComponents items={[
        { name: "Avatar", desc: "For user profile images — use Logo for brand identity, Avatar for user identity." },
        { name: "Button", desc: "Wrap Logo in a Button or Link for clickable home navigation in headers." },
      ]} />
    </div>
  )
}

// ============================================================
// TOP HEADER
// ============================================================

const headerNavTabs = ["Dashboard", "Analytics", "Reports", "Users", "Products", "Orders"]

function TopHeaderDocs() {
  const [breakpoint, setBreakpoint] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const isDesktop = breakpoint === "desktop"
  const isMobile = breakpoint === "mobile"
  const containerWidth = isMobile ? "w-[375px]" : breakpoint === "tablet" ? "w-[768px]" : ""
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Branding</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Top Header</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">The main application header bar. Contains the ShopPulse logo, horizontal navigation tabs, search, notifications, theme toggle, and user avatar. Two rows: top bar (branding + nav + actions) and greeting row (welcome message + search box).</p>
      </header>

      <ExploreBehavior flush controls={[
        { label: "Breakpoint", type: "select", options: ["desktop", "tablet", "mobile"], value: breakpoint, onChange: (v: string) => setBreakpoint(v as "desktop" | "tablet" | "mobile") },
      ]}>
        <div className={cn(containerWidth, "overflow-hidden bg-background", !isDesktop && "mx-auto")}>
          <div className={cn("flex flex-col", isDesktop ? "px-2xl pt-2xl gap-lg" : "px-md pt-md gap-sm")}>
            {/* Row 1: Logo + Nav + Actions — 3-column justify-between */}
            <div className="flex items-center justify-between">
              {/* Left: hamburger + logo */}
              <div className="flex items-center gap-xs">
                {/* Hamburger — tablet & mobile (md:hidden in real app) */}
                {!isDesktop && <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Menu className="size-[20px]" /></Button>}
                {/* Logo */}
                <div className="flex items-center gap-sm">
                  <ShopPulseLogo size={isMobile ? 24 : 28} />
                  {!isMobile && <span className="sp-h4 text-foreground">ShopPulse</span>}
                </div>
              </div>
              {/* Center: nav tabs — desktop only */}
              {isDesktop && (
                <nav className="flex items-center gap-3xs bg-muted dark:bg-white/[0.04] rounded-full px-2xs py-2xs" aria-label="Main navigation">
                  {headerNavTabs.map(tab => (
                    <span key={tab} className={cn("px-lg py-xs rounded-full sp-label cursor-default",
                      tab === "Dashboard" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground"
                    )}>{tab}</span>
                  ))}
                </nav>
              )}
              {/* Right: action buttons */}
              <div className="flex items-center gap-3xs">
                {isMobile && <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Search className="size-[18px]" /></Button>}
                <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Palette className="size-[18px]" /></Button>
                <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Sun className="size-[18px]" /></Button>
                <div className="relative">
                  <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Bell className="size-[18px]" /></Button>
                  <span className="absolute top-[4px] right-[4px] size-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center ring-2 ring-background">3</span>
                </div>
                <div className="relative">
                  <Avatar className="size-[36px] ring-2 ring-primary/30">
                    <AvatarImage src="https://i.pravatar.cc/80?img=47" alt="Linh Nguyen" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-[12px] font-semibold">LN</AvatarFallback>
                  </Avatar>
                  <span className="absolute bottom-0 right-0 size-[10px] rounded-full bg-success ring-[1.5px] ring-background" />
                </div>
              </div>
            </div>
            {/* Row 2: Greeting + SearchBox */}
            <div className={cn("flex gap-sm", isMobile ? "flex-col" : "flex-row items-end justify-between")}>
              <div className="min-w-0">
                <h1 className={cn(isMobile ? "sp-h3" : "sp-h2", "text-foreground")}>Good morning, Linh</h1>
                {!isMobile && <p className={cn(isDesktop ? "sp-body" : "sp-caption", "text-muted-foreground mt-3xs")}>Stay on top of your tasks, monitor progress, and track status.</p>}
              </div>
              {!isMobile && (
                <SearchBox placeholder="Search product" shortcut readOnly className="w-[280px] cursor-pointer" />
              )}
            </div>
          </div>
          {/* Bottom spacing to match real header pb */}
          <div className={cn(isDesktop ? "h-lg" : "h-sm")} />
        </div>
      </ExploreBehavior>

      <InstallationSection pkg={[]} importCode={`import { AppHeader } from "@/components/layout/app-header"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 gap-md">
          <Example flush title="Desktop (≥1024px)" description="3-column layout: Logo+text | Nav tabs (bg-muted container, active=bg-foreground) | Actions (Palette, Theme, Bell+dot, Avatar+online). Greeting row: sp-h2 + subtitle + SearchBox ⌘K." code={`<AppHeader />\n\n// Inside DashboardLayout:\n// <div className="min-h-svh flex flex-col bg-background">\n//   <AppHeader />\n//   <main className="flex-1">...</main>\n// </div>`}>
            <div className="w-full overflow-hidden bg-background">
              <div className="flex flex-col px-2xl pt-2xl gap-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <div className="flex items-center gap-sm">
                      <ShopPulseLogo size={28} />
                      <span className="sp-h4 text-foreground">ShopPulse</span>
                    </div>
                  </div>
                  <nav className="flex items-center gap-3xs bg-muted dark:bg-white/[0.04] rounded-full px-2xs py-2xs">
                    {headerNavTabs.slice(0, 4).map(tab => (
                      <span key={tab} className={cn("px-lg py-xs rounded-full sp-label cursor-default",
                        tab === "Dashboard" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground"
                      )}>{tab}</span>
                    ))}
                  </nav>
                  <div className="flex items-center gap-3xs">
                    <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Palette className="size-[18px]" /></Button>
                    <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Sun className="size-[18px]" /></Button>
                    <div className="relative">
                      <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Bell className="size-[18px]" /></Button>
                      <span className="absolute top-[4px] right-[4px] size-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center ring-2 ring-background">3</span>
                    </div>
                    <div className="relative">
                      <Avatar className="size-[36px] ring-2 ring-primary/30">
                        <AvatarImage src="https://i.pravatar.cc/80?img=47" alt="Linh Nguyen" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-[12px] font-semibold">LN</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 size-[10px] rounded-full bg-success ring-[1.5px] ring-background" />
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-sm">
                  <div className="min-w-0">
                    <h1 className="sp-h2 text-foreground">Good morning, Linh</h1>
                    <p className="sp-body text-muted-foreground mt-3xs">Stay on top of your tasks, monitor progress, and track status.</p>
                  </div>
                  <SearchBox placeholder="Search product" shortcut readOnly className="w-[280px] cursor-pointer" />
                </div>
              </div>
              <div className="h-lg" />
            </div>
          </Example>
          <Example title="Tablet (768px)" description="Hamburger + Logo + text | Actions. No nav tabs at this width. Greeting sp-h2 + subtitle + SearchBox." code={`// Tablet layout (768px):\n// Hamburger + Logo → Actions (Palette, Theme, Bell, Avatar)\n// Greeting + SearchBox`}>
            <div className="w-[768px] max-w-full border border-border rounded-xl overflow-hidden bg-background">
              <div className="flex flex-col px-md pt-md gap-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Menu className="size-[20px]" /></Button>
                    <div className="flex items-center gap-sm">
                      <ShopPulseLogo size={28} />
                      <span className="sp-h4 text-foreground">ShopPulse</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3xs">
                    <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Palette className="size-[18px]" /></Button>
                    <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Sun className="size-[18px]" /></Button>
                    <div className="relative">
                      <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Bell className="size-[18px]" /></Button>
                      <span className="absolute top-[4px] right-[4px] size-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center ring-2 ring-background">3</span>
                    </div>
                    <div className="relative">
                      <Avatar className="size-[36px] ring-2 ring-primary/30">
                        <AvatarImage src="https://i.pravatar.cc/80?img=47" alt="Linh Nguyen" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-[12px] font-semibold">LN</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 size-[10px] rounded-full bg-success ring-[1.5px] ring-background" />
                    </div>
                  </div>
                </div>
                <div className="flex items-end justify-between gap-sm">
                  <div className="min-w-0">
                    <h1 className="sp-h2 text-foreground">Good morning, Linh</h1>
                    <p className="sp-caption text-muted-foreground mt-3xs">Stay on top of your tasks, monitor progress, and track status.</p>
                  </div>
                  <SearchBox placeholder="Search product" shortcut readOnly className="w-[280px] cursor-pointer" />
                </div>
              </div>
              <div className="h-sm" />
            </div>
          </Example>
          <Example title="Mobile (375px)" description="Hamburger + Logo (no text) | Search, Palette, Theme, Bell, Avatar. Greeting sp-h3 only — no subtitle, no SearchBox." code={`// Mobile layout (<640px):\n// Hamburger + Logo (no 'ShopPulse' text)\n// Search icon, Palette, Theme, Bell, Avatar\n// Greeting only (no subtitle, no SearchBox)`}>
            <div className="w-[375px] border border-border rounded-xl overflow-hidden bg-background">
              <div className="flex flex-col px-md pt-md gap-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-xs">
                    <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Menu className="size-[20px]" /></Button>
                    <ShopPulseLogo size={24} />
                  </div>
                  <div className="flex items-center gap-3xs">
                    <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Search className="size-[18px]" /></Button>
                    <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Palette className="size-[18px]" /></Button>
                    <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Sun className="size-[18px]" /></Button>
                    <div className="relative">
                      <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Bell className="size-[18px]" /></Button>
                      <span className="absolute top-[4px] right-[4px] size-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center ring-2 ring-background">3</span>
                    </div>
                    <div className="relative">
                      <Avatar className="size-[36px] ring-2 ring-primary/30">
                        <AvatarImage src="https://i.pravatar.cc/80?img=47" alt="Linh Nguyen" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-[12px] font-semibold">LN</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 size-[10px] rounded-full bg-success ring-[1.5px] ring-background" />
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className="sp-h3 text-foreground">Good morning, Linh</h1>
                </div>
              </div>
              <div className="h-sm" />
            </div>
          </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground">AppHeader is a self-contained layout component with no external props. It reads route and theme state internally.</p>
        <PropsTable rows={[
          ["—", "—", "—", "No props — AppHeader manages its own state (active tab from route, theme, notifications, user menu)"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--background", "zinc-950 / white", "Header background, active tab text (text-background)"],
        ["--foreground", "zinc-50 / zinc-950", "Active nav tab fill (bg-foreground), logo wordmark, greeting h1"],
        ["--muted", "zinc-800 / zinc-200", "Nav tabs container background (bg-muted)"],
        ["--muted-foreground", "zinc-400 / zinc-500", "Inactive nav tabs, subtitle text, action button icons"],
        ["--primary", "violet-600", "Avatar ring tint (ring-primary/30)"],
        ["--destructive", "red-600", "Notification badge background (bg-destructive)"],
        ["--success", "green-500", "Avatar online status dot (bg-success)"],
      ]} />

      <BestPractices items={[
        { do: "Place AppHeader as the first child in DashboardLayout — it provides global navigation context for the entire app.", dont: "Render AppHeader inside individual page components — it should be a layout-level concern." },
        { do: "Use the built-in Sheet for mobile navigation — it mirrors the desktop tab structure and maintains consistency.", dont: "Create a separate mobile navigation component — the AppHeader already handles responsive behavior." },
        { do: "Keep the greeting message dynamic (Good morning/afternoon/evening) to add personality to the dashboard.", dont: "Hardcode a static greeting — the time-based message makes the app feel alive." },
      ]} />

      <FigmaMapping rows={[
        ["Breakpoint", "Desktop (≥1024px)", "breakpoint", "3-column: Logo | Nav tabs (muted container) | Actions + greeting + SearchBox"],
        ["Breakpoint", "Tablet (768px)", "breakpoint", "Hamburger + Logo | Actions + greeting sp-caption subtitle + SearchBox"],
        ["Breakpoint", "Mobile (<375px)", "breakpoint", "Hamburger + Logo (no text) | Search + Actions — no subtitle, no SearchBox"],
        ["Logo", "ShopPulseLogo", "instance", "Diamond 28px (desktop/tablet) / 24px (mobile) + 'ShopPulse' sp-h4 (hidden on mobile)"],
        ["Nav tabs", "bg-muted container", "layout", "rounded-full px-2xs py-2xs gap-3xs, active = bg-foreground text-background shadow-sm sp-label"],
        ["Palette btn", "Button (ghost, icon)", "instance", "Palette 18px in 36px rounded-full — all breakpoints"],
        ["Theme btn", "Button (ghost, icon)", "instance", "Sun/Moon 18px in 36px rounded-full — all breakpoints"],
        ["Bell btn", "Button (ghost, icon)", "instance", "Bell 18px + absolute dot 16px bg-destructive ring-2 ring-background"],
        ["Avatar", "Avatar + online dot", "instance", "36px ring-2 ring-primary/30, AvatarImage, green dot 10px ring-[1.5px]"],
        ["Hamburger", "Button (ghost, icon)", "instance", "Menu 20px in 36px — tablet & mobile (md:hidden)"],
        ["Search btn", "Button (ghost, icon)", "instance", "Search 18px — mobile only (sm:hidden), opens CommandDialog"],
        ["SearchBox", "SearchBox", "instance", "w-[280px] placeholder='Search product' shortcut readOnly — desktop & tablet"],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Tab", "Move focus through header elements: logo link → nav tabs → search → notifications → theme toggle → user menu"],
          ["Enter / Space", "Activate the focused element (nav tab, button, or dropdown trigger)"],
          ["Escape", "Close any open dropdown, popover, or sheet"],
          ["⌘K / Ctrl+K", "Open the global search command dialog from anywhere"],
        ]}
        notes={[
          "The header renders as a <header> element with role='banner' — a page-level landmark for screen readers.",
          "Each nav tab is a Link element with aria-current='page' when active.",
          "The notification bell includes a visually hidden count for screen readers when unread items exist.",
          "The mobile Sheet menu includes proper focus trap and Escape dismissal.",
        ]}
      />

      <RelatedComponents items={[
        { name: "Logo", desc: "The ShopPulse brand logo rendered in the header — diamond mark + wordmark." },
        { name: "Search Box", desc: "SearchBox instance in the greeting row — pill-shaped search with ⌘K shortcut badge." },
        { name: "Screen", desc: "The full-page layout wrapper that contains Top Header as part of the Dashboard layout." },
        { name: "Avatar", desc: "User avatar in the header actions — triggers the profile dropdown menu." },
      ]} />
    </div>
  )
}

// ============================================================
// SCREEN
// ============================================================

function ScreenDocs() {
  const [screenType, setScreenType] = useState<"dashboard" | "auth">("dashboard")
  const [breakpoint, setBreakpoint] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const isDesktop = breakpoint === "desktop"
  const isMobile = breakpoint === "mobile"
  const containerWidth = isMobile ? "w-[375px]" : breakpoint === "tablet" ? "w-[768px]" : ""
  return (
    <div className="space-y-3xl">
      <header>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">Components / Branding</p>
        <h1 className="text-2xl font-bold font-heading mt-xs">Screen</h1>
        <p className="text-muted-foreground mt-xs max-w-2xl font-body">Full-page layout wrapper for the application. Two layout types: Dashboard (header + content area with ambient gradient orbs) and Auth (split-screen with branding illustration left + form right). Each layout wraps page content via React Router Outlet.</p>
      </header>

      <ExploreBehavior flush controls={[
        { label: "Type", type: "select", options: ["dashboard", "auth"], value: screenType, onChange: (v: string) => setScreenType(v as "dashboard" | "auth") },
        { label: "Breakpoint", type: "select", options: ["desktop", "tablet", "mobile"], value: breakpoint, onChange: (v: string) => setBreakpoint(v as "desktop" | "tablet" | "mobile") },
      ]}>
        {screenType === "dashboard" ? (
          /* ── Dashboard Layout: AppHeader + content area ── */
          <div className={cn(containerWidth, "overflow-hidden bg-background flex flex-col", !isDesktop && "mx-auto")}>
            {/* Top Header instance */}
            <div className={cn("flex flex-col", isDesktop ? "px-2xl pt-2xl gap-lg" : "px-md pt-md gap-sm")}>
              {/* Row 1: Logo + Nav + Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-xs">
                  {!isDesktop && <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Menu className="size-[20px]" /></Button>}
                  <div className="flex items-center gap-sm">
                    <ShopPulseLogo size={isMobile ? 24 : 28} />
                    {!isMobile && <span className="sp-h4 text-foreground">ShopPulse</span>}
                  </div>
                </div>
                {isDesktop && (
                  <nav className="flex items-center gap-3xs bg-muted dark:bg-white/[0.04] rounded-full px-2xs py-2xs">
                    {headerNavTabs.slice(0, 4).map(tab => (
                      <span key={tab} className={cn("px-lg py-xs rounded-full sp-label cursor-default",
                        tab === "Dashboard" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground"
                      )}>{tab}</span>
                    ))}
                  </nav>
                )}
                <div className="flex items-center gap-3xs">
                  {isMobile && <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Search className="size-[18px]" /></Button>}
                  <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Palette className="size-[18px]" /></Button>
                  <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Sun className="size-[18px]" /></Button>
                  <div className="relative">
                    <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground"><Bell className="size-[18px]" /></Button>
                    <span className="absolute top-[4px] right-[4px] size-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center ring-2 ring-background">3</span>
                  </div>
                  <div className="relative">
                    <Avatar className="size-[36px] ring-2 ring-primary/30">
                      <AvatarImage src="https://i.pravatar.cc/80?img=47" alt="Linh Nguyen" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-[12px] font-semibold">LN</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-[10px] rounded-full bg-success ring-[1.5px] ring-background" />
                  </div>
                </div>
              </div>
              {/* Row 2: Greeting + SearchBox */}
              <div className={cn("flex gap-sm", isMobile ? "flex-col" : "flex-row items-end justify-between")}>
                <div className="min-w-0">
                  <h1 className={cn(isMobile ? "sp-h3" : "sp-h2", "text-foreground")}>Good morning, Linh</h1>
                  {!isMobile && <p className={cn(isDesktop ? "sp-body" : "sp-caption", "text-muted-foreground mt-3xs")}>Stay on top of your tasks, monitor progress, and track status.</p>}
                </div>
                {!isMobile && <SearchBox placeholder="Search product" shortcut readOnly className="w-[280px] cursor-pointer" />}
              </div>
            </div>
            <div className={cn(isDesktop ? "h-lg" : "h-sm")} />
            {/* Main content area */}
            <main className={cn("relative flex-1 overflow-hidden", isDesktop ? "p-2xl" : "p-md")}>
              <div className="pointer-events-none absolute inset-0 overflow-hidden dark:block hidden" aria-hidden="true">
                <div className="absolute -top-[200px] -right-[100px] size-[500px] rounded-full bg-primary/[0.03] blur-[200px]" />
                <div className="absolute top-[40%] -left-[150px] size-[350px] rounded-full bg-indigo-500/[0.02] blur-[180px]" />
              </div>
              <div className="relative flex flex-col gap-xl w-full max-w-[1440px] mx-auto">
                <div className={cn("grid gap-lg", isMobile ? "grid-cols-1" : "grid-cols-3")}>
                  {[
                    { label: "Total Revenue", value: "$48,520", change: "+12.5%" },
                    { label: "Total Orders", value: "1,284", change: "+8.3%" },
                    { label: "Conversion Rate", value: "3.24%", change: "+2.1%" },
                  ].map(kpi => (
                    <div key={kpi.label} className="rounded-2xl border border-border/60 dark:border-border bg-card p-xl">
                      <p className="sp-caption text-muted-foreground">{kpi.label}</p>
                      <div className="flex items-end justify-between mt-xs">
                        <p className="sp-h2 text-foreground">{kpi.value}</p>
                        <Badge variant="outline" className="text-success border-success/20 bg-success/10">{kpi.change}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-border/60 dark:border-border bg-card p-xl h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="size-8 text-muted-foreground/30 mx-auto mb-xs" />
                    <p className="sp-caption text-muted-foreground/50">Revenue Chart Area</p>
                  </div>
                </div>
              </div>
            </main>
          </div>
        ) : (
          /* ── Auth Layout: split-screen branding + form ── */
          <div className={cn(containerWidth, "overflow-hidden flex", !isDesktop && "mx-auto", isDesktop ? "" : "flex-col")} style={{ minHeight: 600 }}>
            {/* Left — branding panel (hidden on mobile, visible desktop+tablet) */}
            {!isMobile && (
              <div className={cn("flex flex-col items-center justify-between bg-[#0c0a1a] relative overflow-hidden", isDesktop ? "flex-1 p-2xl" : "p-xl")}>
                <div className="absolute inset-0">
                  <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full bg-primary/[0.08] blur-[100px]" />
                  <div className="absolute bottom-[15%] left-[20%] w-[350px] h-[250px] rounded-full bg-indigo-500/[0.06] blur-[80px]" />
                  <div className="absolute top-[60%] right-[10%] w-[200px] h-[200px] rounded-full bg-purple-500/[0.04] blur-[60px]" />
                </div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#c4b5fd 1px, transparent 1px), linear-gradient(90deg, #c4b5fd 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
                <div className="relative z-10 flex items-center gap-sm">
                  <ShopPulseLogo size={28} />
                  <span className="text-white/90 font-heading text-lg font-bold tracking-tight">ShopPulse</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-lg">
                  <AuthIllustration />
                  <div className="text-center max-w-[360px]">
                    <h2 className="text-[24px] font-heading font-bold text-white/90 leading-tight tracking-tight mb-xs">
                      Powerful analytics for<br />modern e-commerce
                    </h2>
                    <p className="sp-body text-white/35 leading-relaxed">
                      Real-time revenue tracking, order insights, and growth metrics — everything you need in one beautiful dashboard.
                    </p>
                  </div>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-md w-full">
                  <div className="flex items-center gap-xl">
                    <div className="text-center">
                      <p className="text-white/80 font-heading text-lg font-bold">10K+</p>
                      <p className="sp-caption text-white/25">Active Users</p>
                    </div>
                    <div className="w-px h-lg bg-white/[0.08]" />
                    <div className="text-center">
                      <p className="text-white/80 font-heading text-lg font-bold">99.9%</p>
                      <p className="sp-caption text-white/25">Uptime</p>
                    </div>
                    <div className="w-px h-lg bg-white/[0.08]" />
                    <div className="text-center">
                      <p className="text-white/80 font-heading text-lg font-bold">4.9★</p>
                      <p className="sp-caption text-white/25">Rating</p>
                    </div>
                  </div>
                  <p className="sp-caption text-white/15">&copy; 2026 ShopPulse. All rights reserved.</p>
                </div>
              </div>
            )}
            {/* Right — form area */}
            <div className={cn("flex items-center justify-center bg-background relative overflow-hidden", isDesktop ? "flex-1 p-xl" : "p-lg")}>
              <div className="absolute top-0 left-0 w-[400px] h-[300px] rounded-full bg-primary/[0.03] blur-[100px] dark:bg-primary/[0.04]" />
              <div className="absolute bottom-0 right-0 w-[300px] h-[250px] rounded-full bg-indigo-500/[0.02] blur-[80px] dark:bg-indigo-500/[0.03]" />
              <div className="relative z-10 w-full max-w-[440px] space-y-xl">
                {isMobile && (
                  <div className="flex items-center justify-center gap-sm mb-md">
                    <ShopPulseLogo size={24} />
                    <span className="sp-h4 text-foreground">ShopPulse</span>
                  </div>
                )}
                <div className="text-center">
                  <h2 className="sp-h2 text-foreground">Welcome back</h2>
                  <p className="sp-body text-muted-foreground mt-3xs">Sign in to your account to continue</p>
                </div>
                <div className="space-y-md">
                  <div className="space-y-3xs">
                    <Label>Email</Label>
                    <Input placeholder="name@example.com" readOnly />
                  </div>
                  <div className="space-y-3xs">
                    <Label>Password</Label>
                    <Input type="password" placeholder="Enter your password" readOnly />
                  </div>
                  <Button className="w-full">Sign In</Button>
                </div>
                <div className="flex items-center gap-xs">
                  <Separator className="flex-1" />
                  <span className="sp-caption text-muted-foreground">or continue with</span>
                  <Separator className="flex-1" />
                </div>
                <div className="grid grid-cols-2 gap-sm">
                  <Button variant="outline" className="w-full">Google</Button>
                  <Button variant="outline" className="w-full">GitHub</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ExploreBehavior>

      <InstallationSection pkg={[]} importCode={`// Dashboard layout\nimport DashboardLayout from "@/components/layout/dashboard-layout"\n\n// Auth layout\nimport AuthLayout from "@/components/layout/auth-layout"`} />

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Examples</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
          <Example title="Dashboard Layout" description="Full app shell: Top Header (3-column with nav tabs) + content area with ambient gradient orbs (dark mode only). max-w-[1440px] content constraint. Content renders via React Router Outlet." code={`// In router config:\n<Route element={<DashboardLayout />}>\n  <Route path="/" element={<Overview />} />\n  <Route path="/analytics" element={<Analytics />} />\n</Route>\n\n// DashboardLayout renders:\n// <div className="min-h-svh flex flex-col bg-background">\n//   <AppHeader />\n//   <main className="relative flex-1 p-md sm:p-xl lg:p-2xl overflow-hidden">\n//     <div className="pointer-events-none absolute inset-0 overflow-hidden dark:block hidden">\n//       <div className="absolute ... bg-primary/[0.03] blur-[200px]" />\n//       <div className="absolute ... bg-indigo-500/[0.02] blur-[180px]" />\n//     </div>\n//     <div className="relative flex flex-col gap-xl max-w-[1440px] mx-auto">\n//       <PageTransition><Outlet /></PageTransition>\n//     </div>\n//   </main>\n// </div>`}>
            <div className="w-full aspect-video border border-border rounded-lg overflow-hidden bg-background flex flex-col">
              {/* Mini header */}
              <div className="px-sm py-xs border-b border-border/60 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2xs">
                  <ShopPulseLogo size={12} />
                  <span className="text-[9px] font-semibold text-foreground">ShopPulse</span>
                </div>
                <div className="flex gap-[3px]">
                  {["Dashboard", "Analytics", "Reports"].map(t => (
                    <span key={t} className={cn("text-[7px] px-[5px] py-[2px] rounded-full",
                      t === "Dashboard" ? "bg-foreground text-background" : "text-muted-foreground"
                    )}>{t}</span>
                  ))}
                </div>
                <div className="flex gap-1 items-center">
                  <div className="size-3 rounded-full bg-muted/50" />
                  <div className="size-3 rounded-full bg-muted/50" />
                  <Avatar className="size-3"><AvatarFallback className="text-[6px]">LN</AvatarFallback></Avatar>
                </div>
              </div>
              {/* Mini greeting */}
              <div className="px-sm pt-xs">
                <p className="text-[9px] font-semibold text-foreground">Good morning, Linh</p>
                <p className="text-[7px] text-muted-foreground">Stay on top of your tasks</p>
              </div>
              {/* Content with ambient orbs */}
              <div className="flex-1 p-sm pt-xs relative overflow-hidden">
                <div className="pointer-events-none absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] dark:block hidden" />
                <div className="grid grid-cols-3 gap-1 mb-1">
                  {["$48.5K", "1,284", "3.24%"].map(v => (
                    <div key={v} className="rounded bg-card border border-border p-[4px]">
                      <div className="h-1 w-6 bg-muted-foreground/20 rounded mb-[2px]" />
                      <p className="text-[8px] font-semibold text-foreground">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="h-16 rounded bg-card border border-border flex items-center justify-center">
                  <BarChart3 className="size-4 text-muted-foreground/20" />
                </div>
              </div>
            </div>
          </Example>
          <Example title="Auth Layout" description="Split-screen: left branding panel bg-[#0c0a1a] with gradient orbs, grid pattern, ShopPulseLogo, animated AuthIllustration, tagline, stats row. Right: form area with ambient violet glows. Left panel hidden on mobile (< lg)." code={`// In router config:\n<Route element={<AuthLayout />}>\n  <Route path="/sign-in" element={<SignIn />} />\n  <Route path="/sign-up" element={<SignUp />} />\n</Route>\n\n// AuthLayout renders:\n// <div className="min-h-svh flex">\n//   <aside className="hidden lg:flex lg:flex-1 bg-[#0c0a1a] p-2xl relative overflow-hidden">\n//     {/* gradient orbs + grid pattern + logo + AuthIllustration + tagline + stats */}\n//   </aside>\n//   <main className="flex flex-1 items-center justify-center bg-background p-lg sm:p-xl">\n//     {/* ambient violet glows */}\n//     <PageTransition><Outlet /></PageTransition>\n//   </main>\n// </div>`}>
            <div className="w-full aspect-video border border-border rounded-lg overflow-hidden bg-background flex">
              {/* Mini left panel */}
              <div className="flex-1 bg-[#0c0a1a] flex flex-col items-center justify-between p-sm relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(#c4b5fd 1px, transparent 1px), linear-gradient(90deg, #c4b5fd 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-32 h-24 rounded-full bg-primary/[0.08] blur-[40px]" />
                <div className="relative z-10 flex items-center gap-2xs">
                  <ShopPulseLogo size={12} />
                  <span className="text-[9px] text-white/90 font-bold">ShopPulse</span>
                </div>
                <div className="relative z-10 flex flex-col items-center gap-xs">
                  <div className="w-24 h-16 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                    <BarChart3 className="size-5 text-primary/40" />
                  </div>
                  <p className="text-[7px] text-white/35 text-center leading-tight">Powerful analytics for<br />modern e-commerce</p>
                </div>
                <div className="relative z-10 flex gap-sm text-center">
                  <div>
                    <p className="text-[8px] text-white/80 font-bold">10K+</p>
                    <p className="text-[6px] text-white/25">Users</p>
                  </div>
                  <div className="w-px h-3 bg-white/[0.08]" />
                  <div>
                    <p className="text-[8px] text-white/80 font-bold">99.9%</p>
                    <p className="text-[6px] text-white/25">Uptime</p>
                  </div>
                  <div className="w-px h-3 bg-white/[0.08]" />
                  <div>
                    <p className="text-[8px] text-white/80 font-bold">4.9★</p>
                    <p className="text-[6px] text-white/25">Rating</p>
                  </div>
                </div>
              </div>
              {/* Mini right panel */}
              <div className="flex-1 flex items-center justify-center p-sm">
                <div className="space-y-1 w-20">
                  <div className="text-center mb-1">
                    <div className="h-1.5 w-12 bg-foreground/20 rounded mx-auto mb-[2px]" />
                    <div className="h-1 w-16 bg-muted-foreground/15 rounded mx-auto" />
                  </div>
                  <div className="h-4 w-full bg-muted/30 border border-border rounded" />
                  <div className="h-4 w-full bg-muted/30 border border-border rounded" />
                  <div className="h-4 w-full bg-primary rounded" />
                  <div className="grid grid-cols-2 gap-[2px] mt-1">
                    <div className="h-3 rounded border border-border flex items-center justify-center">
                      <span className="text-[6px] text-muted-foreground">Google</span>
                    </div>
                    <div className="h-3 rounded border border-border flex items-center justify-center">
                      <span className="text-[6px] text-muted-foreground">GitHub</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Example>
        </div>
      </section>

      <section className="space-y-md">
        <h2 className="text-lg font-semibold font-heading">Props</h2>
        <p className="text-sm text-muted-foreground">Both layout components are route wrappers with no external props. They render child routes via React Router&apos;s <code>&lt;Outlet /&gt;</code>.</p>
        <h3 className="font-semibold text-sm mt-md">DashboardLayout</h3>
        <PropsTable rows={[
          ["—", "—", "—", "No props — renders AppHeader + Outlet with ambient gradient orbs and max-w-[1440px] content area"],
        ]} />
        <h3 className="font-semibold text-sm mt-md">AuthLayout</h3>
        <PropsTable rows={[
          ["—", "—", "—", "No props — renders split-screen with branding panel (lg+) + form area with Outlet"],
        ]} />
      </section>

      <DesignTokensTable rows={[
        ["--background", "zinc-950 / white", "Main content area and right panel background"],
        ["#0c0a1a", "custom", "Auth left panel — very dark violet background (not tokenized)"],
        ["--primary", "violet-600", "Ambient gradient orbs, active states, illustration accents"],
        ["--border", "zinc-800 / zinc-200", "Card borders, header bottom border"],
        ["--card", "zinc-900 / white", "Dashboard KPI card and chart card backgrounds"],
      ]} />

      <BestPractices items={[
        { do: "Use DashboardLayout for all authenticated pages — it provides the header, ambient effects, and max-width constraint.", dont: "Create custom wrappers for individual pages — the layout handles all structural concerns." },
        { do: "Use AuthLayout for all unauthenticated pages (sign-in, sign-up, forgot password, onboarding) to maintain visual consistency.", dont: "Mix auth and dashboard layout patterns — each has its own visual language." },
        { do: "Wrap Outlet with PageTransition inside each layout to ensure smooth page transitions.", dont: "Put PageTransition at the router level wrapping Routes — it must be inside each layout wrapping Outlet." },
      ]} />

      <FigmaMapping rows={[
        ["Type", "Dashboard", "component", "DashboardLayout — header + content area"],
        ["Type", "Auth", "component", "AuthLayout — split-screen branding + form"],
        ["Content", "Header", "instance", "Top Header component (Dashboard type only)"],
        ["Content", "Logo", "instance", "ShopPulseLogo in both layout types"],
        ["Dimensions", "1440 × 900", "root frame", "Desktop viewport size for Figma frames"],
      ]} />

      <AccessibilityInfo
        keyboard={[
          ["Tab", "Navigate through layout landmarks: header → main content → footer"],
          ["Escape", "Close any open overlay within the layout (sheets, dialogs, popovers)"],
        ]}
        notes={[
          "DashboardLayout uses <header> and <main> elements — automatic landmarks for screen readers.",
          "AuthLayout left panel is decorative (hidden on mobile) — aria-hidden prevents screen reader confusion.",
          "Ambient gradient orbs use pointer-events-none and aria-hidden — purely decorative, invisible to assistive tech.",
          "PageTransition avoids motion for users with prefers-reduced-motion: reduce.",
        ]}
      />

      <RelatedComponents items={[
        { name: "Top Header", desc: "The application header bar — rendered as part of Dashboard layout." },
        { name: "Logo", desc: "ShopPulse brand logo — appears in both layout types." },
        { name: "Separator", desc: "Used as visual dividers between layout sections." },
      ]} />
    </div>
  )
}

// ============================================================
// COMPONENT REGISTRY
// ============================================================

type ComponentId = string

const componentGroups = [
  {
    label: "Branding",
    items: [
      { id: "logo", label: "Logo" },
      { id: "top-header", label: "Top Header" },
      { id: "screen", label: "Screen" },
    ],
  },
  {
    label: "Foundation",
    items: [
      { id: "colors", label: "Colors" },
      { id: "typography", label: "Typography" },
      { id: "spacing", label: "Spacing" },
      { id: "border-radius", label: "Border Radius" },
      { id: "shadows", label: "Effects" },
      { id: "icons", label: "Icons" },
      { id: "illustrations", label: "Illustrations" },
    ],
  },
  {
    label: "Form",
    items: [
      { id: "button", label: "Button" },
      { id: "input", label: "Input" },
      { id: "search-box", label: "Search Box" },
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
      { id: "navigation-menu", label: "Navigation Menu" },
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
      { id: "command", label: "Command" },
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
  logo: LogoDocs,
  "top-header": TopHeaderDocs,
  screen: ScreenDocs,
  colors: ColorsDocs,
  typography: TypographyDocs,
  spacing: SpacingDocs,
  "border-radius": BorderRadiusDocs,
  shadows: ShadowsDocs,
  icons: IconsDocs,
  illustrations: IllustrationsDocs,
  button: ButtonDocs,
  input: InputDocs,
  "search-box": SearchBoxDocs,
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
  command: CommandDocs,
  "navigation-menu": NavigationMenuDocs,
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
