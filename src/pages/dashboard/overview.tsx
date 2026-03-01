import { useMemo, useState, useEffect, useRef, useCallback } from "react"
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  MoreHorizontal,
  ArrowRight,
  Globe,
  Warehouse,
  PiggyBank,
  BadgeDollarSign,
  Receipt,
  Sparkles,
  ShoppingCart,
  Store,
  Smartphone,
  Package,
  Download,
  RefreshCw,
  Eye,
  ExternalLink,
  Copy,
  Trash2,
  FileText,
  Star,
  TrendingUp,
  Filter,
  Calendar,
  Share2,
  Printer,
  BarChart3,
  WifiOff,
  ChevronDown,
} from "lucide-react"
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
  Line,
  LineChart,
} from "recharts"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  TooltipProvider,
  Tooltip as TT,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  recentOrders,
  topProducts,
  channelData,
  salesLocations,
} from "@/data/chart-data"
import { useChartColors } from "@/hooks/use-chart-colors"
import { SalesGlobe } from "@/components/charts/sales-globe"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, subDays, startOfYear } from "date-fns"
import type { DateRange } from "react-day-picker"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router-dom"
import { revenueData } from "@/data/chart-data"
import { toast } from "sonner"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ANIMATED COUNTER — smooth number transitions
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function useAnimatedValue(target: number, duration = 600) {
  const [value, setValue] = useState(0)
  const prev = useRef(0)
  const raf = useRef<number>(undefined)
  useEffect(() => {
    const start = prev.current
    const diff = target - start
    const startTime = performance.now()
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const curr = start + diff * ease
      setValue(curr)
      if (t < 1) { raf.current = requestAnimationFrame(tick) }
      else { prev.current = target }
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])
  return value
}

function AnimatedKPI({ value, prefix = "", suffix = "", decimals = 0, className = "" }: {
  value: number; prefix?: string; suffix?: string; decimals?: number; className?: string
}) {
  const animated = useAnimatedValue(value)
  return (
    <span className={className}>
      {prefix}{animated.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}
    </span>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SPARKLINE — inline mini chart for metric cards
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SPARKLINE_DATA: Record<string, { v: number }[]> = {
  "Current Balance": [{ v: 45 }, { v: 52 }, { v: 48 }, { v: 61 }, { v: 55 }, { v: 68 }, { v: 70 }],
  "Savings":         [{ v: 30 }, { v: 35 }, { v: 38 }, { v: 42 }, { v: 40 }, { v: 48 }, { v: 53 }],
  "Income":          [{ v: 200 }, { v: 210 }, { v: 195 }, { v: 240 }, { v: 260 }, { v: 255 }, { v: 287 }],
  "Expenses":        [{ v: 180 }, { v: 190 }, { v: 200 }, { v: 215 }, { v: 210 }, { v: 220 }, { v: 214 }],
}

function Sparkline({ dataKey, color }: { dataKey: string; color: string; up?: boolean }) {
  const data = SPARKLINE_DATA[dataKey] || SPARKLINE_DATA["Current Balance"]
  return (
    <div className="h-[32px] w-[80px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
            dot={false} isAnimationActive={true} animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ERROR STATE — failed data card
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ErrorCard({ title, onRetry }: { title: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-2xl text-center">
      <div className="size-[44px] rounded-full bg-destructive/10 dark:bg-destructive/20 flex items-center justify-center mb-md">
        <WifiOff className="size-[20px] text-destructive" />
      </div>
      <p className="sp-body-semibold text-foreground">Failed to load {title}</p>
      <p className="sp-caption text-muted-foreground mt-2xs">Check your connection and try again.</p>
      <Button variant="outline" size="sm" className="mt-lg gap-xs" onClick={onRetry}>
        <RefreshCw className="size-[13px]" /> Retry
      </Button>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* Card wrapper — dashboard-specific: 2xl radius, softer border, no shadow */
function DCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`rounded-2xl border-border/60 dark:border-border-subtle shadow-none p-xl ${className}`}>
      {children}
    </Card>
  )
}

const statusBadge: Record<string, { variant: "success" | "emphasis" | "warning" | "destructive" | "secondary"; label: string }> = {
  Delivered: { variant: "success", label: "Delivered" },
  Shipped: { variant: "emphasis", label: "Shipped" },
  Processing: { variant: "warning", label: "Processing" },
  Cancelled: { variant: "destructive", label: "Cancelled" },
  Refunded: { variant: "secondary", label: "Refunded" },
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LOADING SKELETON
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        <div className="lg:col-span-8 flex flex-col gap-lg">
          <div className="grid grid-cols-1 md:grid-cols-[3fr_5fr] gap-lg">
            <Skeleton className="h-[280px] rounded-2xl" />
            <div className="grid grid-cols-2 gap-lg">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[130px] rounded-2xl" />)}
            </div>
          </div>
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-lg">
          <Skeleton className="h-[519px] rounded-2xl" />
          <Skeleton className="h-[160px] rounded-2xl" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="lg:col-span-4 h-[280px] rounded-2xl" />)}
      </div>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   EMPTY STATE
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-2xl text-center">
      <div className="size-[40px] rounded-full bg-surface-raised flex items-center justify-center mb-md">
        <Icon className="size-[18px] text-muted-foreground" />
      </div>
      <p className="sp-body-semibold text-foreground">{title}</p>
      <p className="sp-caption text-muted-foreground mt-2xs">{description}</p>
    </div>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STATISTICS CHART — tab-switchable stacked bar chart
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SEGMENT_KEYS = [
  { key: "online", label: "Online", token: "chart-4" },
  { key: "retail", label: "Retail", token: "chart-2" },
  { key: "wholesale", label: "Wholesale", token: "chart-5" },
  { key: "services", label: "Services", token: "chart-1" },
] as const

const CHART_DATA = {
  Days: [
    { label: "01", online: 420, retail: 310, wholesale: 180, services: 90, total: 1000 },
    { label: "02", online: 380, retail: 280, wholesale: 150, services: 75, total: 885 },
    { label: "03", online: 520, retail: 390, wholesale: 210, services: 120, total: 1240 },
    { label: "04", online: 310, retail: 240, wholesale: 130, services: 65, total: 745 },
    { label: "05", online: 680, retail: 480, wholesale: 280, services: 160, total: 1600 },
    { label: "06", online: 450, retail: 350, wholesale: 190, services: 95, total: 1085 },
    { label: "07", online: 290, retail: 210, wholesale: 120, services: 55, total: 675 },
    { label: "08", online: 560, retail: 420, wholesale: 240, services: 135, total: 1355 },
    { label: "09", online: 610, retail: 460, wholesale: 260, services: 145, total: 1475 },
    { label: "10", online: 780, retail: 580, wholesale: 340, services: 195, total: 1895 },
    { label: "11", online: 490, retail: 370, wholesale: 200, services: 110, total: 1170 },
    { label: "12", online: 350, retail: 260, wholesale: 140, services: 70, total: 820 },
    { label: "13", online: 720, retail: 540, wholesale: 310, services: 175, total: 1745 },
  ],
  Weeks: [
    { label: "Week 1", online: 2100, retail: 1580, wholesale: 850, services: 480, total: 5010 },
    { label: "Week 2", online: 1780, retail: 1340, wholesale: 720, services: 405, total: 4245 },
    { label: "Week 3", online: 2650, retail: 1980, wholesale: 1080, services: 610, total: 6320 },
    { label: "Week 4", online: 3200, retail: 2400, wholesale: 1320, services: 745, total: 7665 },
  ],
  Months: [
    { label: "Jul", online: 4200, retail: 3100, wholesale: 1700, services: 960, total: 9960 },
    { label: "Aug", online: 3600, retail: 2700, wholesale: 1450, services: 820, total: 8570 },
    { label: "Sep", online: 5100, retail: 3800, wholesale: 2080, services: 1180, total: 12160 },
    { label: "Oct", online: 4800, retail: 3600, wholesale: 1960, services: 1108, total: 11468 },
    { label: "Nov", online: 3400, retail: 2560, wholesale: 1380, services: 780, total: 8120 },
    { label: "Dec", online: 6300, retail: 4700, wholesale: 2580, services: 1460, total: 15040 },
  ],
} as const

type TabKey = keyof typeof CHART_DATA

const TAB_SUMMARY: Record<TabKey, { pct: string; amount: string }> = {
  Days: { pct: "15.8%", amount: "$2,143" },
  Weeks: { pct: "22.4%", amount: "$8,650" },
  Months: { pct: "31.2%", amount: "$24,380" },
}

const DAY_LABELS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Wed", "Thu"]

/* Each segment: rounded corners + gap between segments */
function RoundedSegment(props: Record<string, unknown>) {
  const { x, y, width, height, fill, opacity } = props as { x: number; y: number; width: number; height: number; fill: string; opacity?: number }
  if (!height || height <= 0) return null
  const gap = 4
  const ay = y + gap / 2
  const ah = Math.max(height - gap, 2)
  const r = Math.min(10, ah / 2, (width as number) / 2)
  return <rect x={x} y={ay} width={width} height={ah} rx={r} ry={r} fill={fill} opacity={opacity ?? 1} style={{ transition: "opacity 0.2s" }} />
}

function StatsChart({ colors }: { colors: Record<string, string> }) {
  const [tab, setTab] = useState<TabKey>("Days")
  const [activeDay, setActiveDay] = useState<number | null>(null)
  const [hiddenSegments, setHiddenSegments] = useState<Set<string>>(new Set())
  const data = CHART_DATA[tab]
  const summary = TAB_SUMMARY[tab]

  const SEGMENTS = useMemo(() =>
    SEGMENT_KEYS.map(s => ({ ...s, color: colors[s.token] || "#888" })),
    [colors]
  )

  const segColor = useMemo(() => ({
    online: colors["chart-4"] || "#22c55e",
    retail: colors["chart-2"] || "#06b6d4",
    wholesale: colors["chart-5"] || "#f59e0b",
    services: colors["chart-1"] || "#8b5cf6",
  }), [colors])

  const toggleSegment = (key: string) => {
    setHiddenSegments(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }

  return (
    <DCard className="p-2xl">
      {/* Header: title + actions + period tabs */}
      <div className="flex items-center justify-between mb-xl">
        <div className="flex items-center gap-md">
          <h3 className="sp-h4 text-foreground">Statistics</h3>
          <Badge variant="default" level="secondary" size="sm">Live</Badge>
        </div>
        <div className="flex items-center gap-xs">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="xs" className="text-muted-foreground/60 hover:text-muted-foreground">
                <MoreHorizontal className="size-[14px]" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Chart Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setTimeout(() => toast.success("Chart exported as PNG"), 100) }}>
                <Download className="size-[14px]" /> Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const csv = data.map((d) => `${d.label},${d.online},${d.retail},${d.wholesale},${d.services}`).join("\n")
                navigator.clipboard.writeText(`Label,Online,Retail,Wholesale,Services\n${csv}`)
                setTimeout(() => toast.success("Data copied to clipboard"), 100)
              }}>
                <Copy className="size-[14px]" /> Copy Data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { window.location.href = "/dashboard/reports" }}>
                <FileText className="size-[14px]" /> Generate Report
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { window.location.href = "/dashboard/analytics" }}>
                <BarChart3 className="size-[14px]" /> View in Analytics
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Tabs value={tab} onValueChange={(v) => { setTab(v as TabKey); if (v !== "Days") setActiveDay(null) }}>
            <TabsList className="rounded-full">
              {(["Days", "Weeks", "Months"] as TabKey[]).map((t) => (
                <TabsTrigger key={t} value={t} className="rounded-full">{t}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Date selector — only for Days tab */}
      {tab === "Days" && (
        <div className="flex items-center mb-xs overflow-x-auto scrollbar-none py-sm -my-sm">
          {DAY_LABELS.map((day, i) => {
            const num = String(i + 1).padStart(2, "0")
            const isActive = i === activeDay
            const isNextActive = i + 1 === activeDay
            const showDivider = !isActive && !isNextActive && i < DAY_LABELS.length - 1
            return (
              <div key={i} className="flex items-center shrink-0">
                <button
                  onClick={() => setActiveDay((prev) => prev === i ? null : i)}
                  className={`flex flex-col items-center justify-center gap-2xs size-[48px] rounded-2xl transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(139,92,246,0.25)]"
                      : "text-muted-foreground hover:bg-surface-raised hover:rounded-xl"
                  }`}
                >
                  <span className={`sp-body-semibold leading-none ${isActive ? "" : "text-foreground"}`}>{num}</span>
                  <span className={`sp-overline leading-none ${isActive ? "opacity-80" : ""}`}>{day}</span>
                </button>
                {showDivider && (
                  <div className="w-px h-[20px] bg-surface-raised shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Summary stats + legend */}
      <div className="flex items-center justify-between mb-lg min-h-[28px]">
        <div className="flex items-center gap-md">
          {tab === "Days" && activeDay !== null ? (
            <>
              <span className="inline-flex items-center gap-2xs px-sm py-3xs rounded-full bg-primary/10 dark:bg-primary/20 sp-caption font-semibold text-primary">
                Day {String(activeDay + 1).padStart(2, "0")} ({DAY_LABELS[activeDay]})
              </span>
              <span className="sp-body-semibold text-foreground">
                ${(data[activeDay] as { total: number }).total.toLocaleString()}
              </span>
              <button onClick={() => setActiveDay(null)} className="sp-caption text-muted-foreground hover:text-foreground transition-colors">Clear</button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2xs px-sm py-3xs rounded-full bg-success-subtle sp-caption font-semibold text-success-subtle-foreground">
                {summary.pct} <ArrowUpRight className="size-[11px]" />
              </span>
              <span className="sp-body text-muted-foreground">+ {summary.amount} increased</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-lg">
          {SEGMENTS.map((s) => {
            const hidden = hiddenSegments.has(s.key)
            return (
              <button
                key={s.key}
                onClick={() => toggleSegment(s.key)}
                className={`flex items-center gap-2xs sp-caption transition-opacity ${hidden ? "opacity-30" : ""}`}
              >
                <div className="size-[8px] rounded-sm" style={{ backgroundColor: hidden ? "currentColor" : s.color }} />
                <span className="text-muted-foreground">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Stacked bar chart */}
      <div className="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data as unknown as Record<string, unknown>[]}
            margin={{ top: 24, right: 4, bottom: 0, left: 4 }}
            barSize={tab === "Days" ? 48 : tab === "Weeks" ? 80 : 64}
            barGap={0}
            barCategoryGap="12%"
            onClick={(state) => {
              if (tab === "Days" && state?.activeTooltipIndex != null) {
                setActiveDay((prev) => prev === state.activeTooltipIndex ? null : state.activeTooltipIndex!)
              }
            }}
            className={tab === "Days" ? "cursor-pointer" : ""}
          >
            <XAxis
              dataKey="label" fontSize={tab === "Days" ? 10 : 12} fontFamily="Inter" fontWeight={500}
              tickLine={false} axisLine={false}
              stroke={colors["muted-foreground"]} dy={8}
            />
            <YAxis hide />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-xl border border-border/30 bg-card/95 backdrop-blur-xl px-lg py-sm shadow-lg">
                    <p className="sp-label text-muted-foreground mb-xs">{label}</p>
                    <div className="flex flex-col gap-3xs">
                      {SEGMENTS.map((s) => {
                        if (hiddenSegments.has(s.key)) return null
                        const entry = payload.find((p) => p.dataKey === s.key)
                        if (!entry) return null
                        return (
                          <div key={s.key} className="flex items-center gap-xs">
                            <div className="size-[8px] rounded-sm" style={{ backgroundColor: s.color }} />
                            <span className="sp-data-sm text-muted-foreground">{s.label}</span>
                            <span className="sp-data text-foreground font-medium ml-auto pl-lg">${Number(entry.value).toLocaleString()}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }}
              cursor={{ fill: colors["surface-inset"] || "rgba(0,0,0,0.04)", radius: 8 }}
            />
            {!hiddenSegments.has("services") && (
              <Bar dataKey="services" stackId="rev" fill={segColor.services} shape={<RoundedSegment />}>
                {tab === "Days" && data.map((_, i) => (
                  <Cell key={i} opacity={activeDay === null || activeDay === i ? 1 : 0.25} />
                ))}
              </Bar>
            )}
            {!hiddenSegments.has("wholesale") && (
              <Bar dataKey="wholesale" stackId="rev" fill={segColor.wholesale} shape={<RoundedSegment />}>
                {tab === "Days" && data.map((_, i) => (
                  <Cell key={i} opacity={activeDay === null || activeDay === i ? 1 : 0.25} />
                ))}
              </Bar>
            )}
            {!hiddenSegments.has("retail") && (
              <Bar dataKey="retail" stackId="rev" fill={segColor.retail} shape={<RoundedSegment />}>
                {tab === "Days" && data.map((_, i) => (
                  <Cell key={i} opacity={activeDay === null || activeDay === i ? 1 : 0.25} />
                ))}
              </Bar>
            )}
            {!hiddenSegments.has("online") && (
              <Bar dataKey="online" stackId="rev" fill={segColor.online} shape={<RoundedSegment />}>
                {tab === "Days" && data.map((_, i) => (
                  <Cell key={i} opacity={activeDay === null || activeDay === i ? 1 : 0.25} />
                ))}
                <LabelList
                  dataKey="total"
                  position="top"
                  offset={8}
                  fontSize={tab === "Days" ? 9 : 12}
                  fontWeight={600}
                  fontFamily="Inter"
                  fill={colors["foreground"] || "#fff"}
                  formatter={(v: number) => `$${v.toLocaleString()}`}
                />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

    </DCard>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN — 2-column layout
   Left: featured card + metric cards + stats chart
   Right: globe + upgrade + top products + channels
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function DashboardOverviewPage() {
  const navigate = useNavigate()
  const colors = useChartColors()
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<"Online" | "Retail" | "Wholesale">("Retail")
  const [refreshingOrders, setRefreshingOrders] = useState(false)
  const [globeError, setGlobeError] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(undefined)

  // Sheet / Dialog states for action UIs
  const [revenueSheet, setRevenueSheet] = useState(false)
  const [compareDialog, setCompareDialog] = useState(false)
  const [metricSheet, setMetricSheet] = useState<{ open: boolean; label: string; value: string; change: string; up: boolean; desc: string }>({ open: false, label: "", value: "", change: "", up: true, desc: "" })
  const [orderSheet, setOrderSheet] = useState<{ open: boolean; id: string; customer: string; amount: string; status: string; time: string }>({ open: false, id: "", customer: "", amount: "", status: "", time: "" })
  const [productSheet, setProductSheet] = useState<{ open: boolean; name: string; price: string; sales: number; growth: string; stock: number; imageUrl: string }>({ open: false, name: "", price: "", sales: 0, growth: "", stock: 0, imageUrl: "" })
  const [globeSheet, setGlobeSheet] = useState(false)
  const [channelDialog, setChannelDialog] = useState(false)
  const [addChannelDialog, setAddChannelDialog] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 60),
    to: new Date(),
  })
  const [presetLabel, setPresetLabel] = useState("Last 60 days")

  // Simulate loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  // Detect offline/online status
  useEffect(() => {
    const goOnline = () => { setConnectionStatus("online"); toast.success("Connection restored") }
    const goOffline = () => { setConnectionStatus("offline"); toast.error("You are offline") }
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    if (!navigator.onLine) setConnectionStatus("offline")
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline) }
  }, [])

  const p = useMemo(() => [
    colors["chart-1"] || "#8b5cf6",
    colors["chart-2"] || "#06b6d4",
    colors["chart-3"] || "#f43f5e",
    colors["chart-4"] || "#22c55e",
    colors["chart-5"] || "#f59e0b",
    colors["chart-6"] || "#ec4899",
  ], [colors])

  const accent = p[0]

  const handleRefreshOrders = () => {
    setRefreshingOrders(true)
    setTimeout(() => { setRefreshingOrders(false); toast.success("Orders refreshed") }, 800)
  }

  const handleRetryGlobe = useCallback(() => {
    setGlobeError(false)
    toast("Reconnecting to globe data...")
  }, [])

  const downloadCSV = useCallback((filename: string, headers: string[], rows: string[][]) => {
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
    toast.success(`${filename} downloaded`)
  }, [])

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard")
  }, [])

  if (loading) return <DashboardSkeleton />

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-lg">

        {/* Offline banner */}
        {connectionStatus === "offline" && (
          <div className="flex items-center gap-sm px-lg py-sm rounded-xl bg-warning-subtle border border-warning-border/20 text-warning-subtle-foreground">
            <WifiOff className="size-[16px] shrink-0" />
            <p className="sp-body-medium flex-1">You're offline. Some data may not be up to date.</p>
            <Button variant="ghost" size="xs" className="text-warning-subtle-foreground hover:text-warning" onClick={() => window.location.reload()}>
              <RefreshCw className="size-[13px]" /> Reconnect
            </Button>
          </div>
        )}

        {/* Date range + last updated */}
        <div className="flex items-center justify-between gap-sm">
          <div className="flex items-center gap-sm min-w-0">
            <Popover open={datePickerOpen} onOpenChange={(open) => {
              setDatePickerOpen(open)
              if (open) setDraftRange(dateRange)
              if (!open) setDraftRange(undefined)
            }}>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-xs px-md py-2xs rounded-lg border border-border/40 dark:border-outline-hover bg-card hover:bg-surface-raised hover:border-border-strong transition-colors sp-body-medium text-foreground">
                  <Calendar className="size-[14px] text-muted-foreground" />
                  {dateRange.from && dateRange.to
                    ? `${format(dateRange.from, "MMM d")} – ${format(dateRange.to, "MMM d, yyyy")}`
                    : "Pick a date range"}
                  <ChevronDown className="size-[12px] text-muted-foreground/50" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
                <div className="flex">
                  <div className="flex flex-col gap-3xs border-r border-border/30 dark:border-white/[0.06] p-sm min-w-[140px]">
                    <p className="sp-label text-muted-foreground px-sm pb-2xs">Presets</p>
                    {([
                      { label: "Last 7 days", days: 7 },
                      { label: "Last 14 days", days: 14 },
                      { label: "Last 30 days", days: 30 },
                      { label: "Last 60 days", days: 60 },
                      { label: "Last 90 days", days: 90 },
                      { label: "This year", days: 0 },
                    ] as const).map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => {
                          const to = new Date()
                          const from = preset.days > 0 ? subDays(to, preset.days) : startOfYear(to)
                          setDateRange({ from, to })
                          setPresetLabel(preset.label)
                          setDraftRange(undefined)
                          setDatePickerOpen(false)
                          toast(`Switched to ${preset.label}`)
                        }}
                        className={`sp-caption text-left px-sm py-xs rounded-md transition-colors ${
                          presetLabel === preset.label
                            ? "bg-primary text-primary-foreground font-medium"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <CalendarComponent
                      mode="range"
                      selected={draftRange}
                      onSelect={(range) => {
                        if (range) {
                          setDraftRange(range)
                          setPresetLabel("")
                        }
                      }}
                      numberOfMonths={2}
                      disabled={{ after: new Date() }}
                    />
                    {/* Apply / Cancel footer */}
                    <div className="flex items-center justify-between border-t border-border/30 dark:border-white/[0.06] px-md py-sm">
                      <p className="sp-caption text-muted-foreground">
                        {draftRange?.from && draftRange?.to
                          ? `${format(draftRange.from, "MMM d")} – ${format(draftRange.to, "MMM d, yyyy")}`
                          : draftRange?.from
                            ? `${format(draftRange.from, "MMM d, yyyy")} – ...`
                            : "Select a range"}
                      </p>
                      <div className="flex items-center gap-sm">
                        <Button variant="ghost" size="sm" onClick={() => { setDraftRange(undefined); setDatePickerOpen(false) }}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={!draftRange?.from || !draftRange?.to}
                          onClick={() => {
                            if (draftRange?.from && draftRange?.to) {
                              setDateRange(draftRange)
                              setPresetLabel("")
                              setDatePickerOpen(false)
                              toast(`${format(draftRange.from, "MMM d")} – ${format(draftRange.to, "MMM d, yyyy")}`)
                            }
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="hidden sm:flex items-center gap-2xs text-muted-foreground/50">
            <div className="size-[6px] rounded-full bg-success animate-pulse" />
            <span className="sp-caption">Updated just now</span>
          </div>
        </div>

        {/* ━━━ MAIN: 8/4 nested layout ━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">

          {/* ── LEFT col-span-8: Revenue+Metrics → Statistics ── */}
          <div className="lg:col-span-8 flex flex-col gap-lg">
            <div className="grid grid-cols-1 md:grid-cols-[3fr_5fr] gap-lg">
              {/* Total Revenue */}
              <div className="rounded-2xl border border-border/60 dark:border-border-subtle bg-card p-xl relative overflow-hidden flex flex-col gap-lg">
                <div className="pointer-events-none absolute -top-[60px] -right-[40px] size-[160px] rounded-full blur-[80px] opacity-15 dark:opacity-[0.06]" style={{ backgroundColor: accent }} />
                <div className="relative flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="sp-body-semibold text-foreground truncate">Total Revenue</p>
                    <p className="sp-caption text-muted-foreground truncate mt-3xs">All-time gross revenue.</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="xs" className="sp-caption text-muted-foreground gap-2xs shrink-0">
                        Details <span className="text-foreground">+</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setRevenueSheet(true)}>
                        <BarChart3 className="size-[14px]" /> Revenue Breakdown
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => downloadCSV("revenue-report.csv", ["Month","Revenue","Orders","Refunds","Profit"], revenueData.map((r) => [r.month, String(r.revenue), String(r.orders), String(r.refunds), String(r.profit)]))}>
                        <Download className="size-[14px]" /> Export CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setCompareDialog(true)}>
                        <TrendingUp className="size-[14px]" /> Compare Periods
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="relative mt-auto">
                  {(() => {
                    const catData = {
                      Online:    { main: "34,218", dec: ".40", change: "+12.3%", up: true, sub: "Online Sales", desc: "Web store & marketplace channels" },
                      Retail:    { main: "28,764", dec: ".85", change: "+8.7%", up: true, sub: "Retail Sales", desc: "In-store & point-of-sale revenue" },
                      Wholesale: { main: "21,247", dec: ".25", change: "+5.2%", up: true, sub: "Wholesale Sales", desc: "B2B & bulk order transactions" },
                    } as const
                    const d = catData[activeCategory]
                    return (
                      <>
                        <div className="flex items-baseline gap-xs">
                          <span className="sp-kpi-lg text-foreground leading-none">{d.main}</span>
                          <span className="sp-body text-muted-foreground">{d.dec}</span>
                          <span className="sp-label text-muted-foreground ml-2xs">USD</span>
                        </div>
                        <div className="flex items-center gap-sm mt-xs">
                          <p className="sp-caption text-muted-foreground">{d.sub}</p>
                          <span className={`sp-caption font-medium flex items-center gap-4xs ${d.up ? "text-success" : "text-destructive"}`}>
                            {d.up ? <ArrowUpRight className="size-[10px]" /> : <ArrowDownRight className="size-[10px]" />}
                            {d.change}
                          </span>
                        </div>
                        <p className="sp-caption text-muted-foreground/60 mt-2xs">{d.desc}</p>
                      </>
                    )
                  })()}
                </div>
                <div className="flex items-center gap-sm">
                  {([
                    { icon: Globe, label: "Online" as const, value: "$34.2k" },
                    { icon: Store, label: "Retail" as const, value: "$28.8k" },
                    { icon: Warehouse, label: "Wholesale" as const, value: "$21.2k" },
                  ]).map((cat) => (
                    <TT key={cat.label}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setActiveCategory(cat.label)}
                          className={`flex-1 flex flex-col items-center gap-xs py-sm rounded-xl border transition-all ${
                            activeCategory === cat.label
                              ? "border-border/60 bg-background dark:border-border-subtle dark:bg-outline-hover"
                              : "border-transparent bg-muted/30 hover:bg-muted/50 dark:bg-surface-inset/50 dark:hover:bg-surface-inset"
                          }`}
                        >
                          <cat.icon className={`size-[18px] ${activeCategory === cat.label ? "text-foreground" : "text-muted-foreground"}`} />
                          <span className={`sp-caption ${activeCategory === cat.label ? "text-foreground" : "text-muted-foreground"}`}>{cat.label}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{cat.label}: {cat.value}</TooltipContent>
                    </TT>
                  ))}
                </div>
              </div>

              {/* 2x2 Metric cards with sparklines */}
              <div className="grid grid-cols-2 gap-lg">
                {([
                  { icon: DollarSign, label: "Current Balance", numValue: 7000.75, value: "$7,000.75", change: "+34.5%", up: true, desc: "Available balance across all accounts", sparkColor: p[0] },
                  { icon: PiggyBank, label: "Savings", numValue: 5300.50, value: "$5,300.50", change: "+12.01%", up: true, desc: "Total savings this quarter", sparkColor: p[1] },
                  { icon: BadgeDollarSign, label: "Income", numValue: 28750.75, value: "$28,750.75", change: "+7.76%", up: true, desc: "Net income after deductions", sparkColor: p[3] },
                  { icon: Receipt, label: "Expenses", numValue: 21450, value: "$21,450.00", change: "-8.12%", up: false, desc: "Total operating expenses", sparkColor: p[2] },
                ] as const).map((metric) => (
                  <DCard key={metric.label} className="flex flex-col gap-md">
                    <div className="flex items-center gap-sm">
                      <TT>
                        <TooltipTrigger asChild>
                          <div className="size-[28px] rounded-full bg-outline-hover flex items-center justify-center shrink-0 cursor-help">
                            <metric.icon className="size-[14px] text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{metric.desc}</TooltipContent>
                      </TT>
                      <span className="sp-label text-muted-foreground truncate flex-1">{metric.label}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="xs" className="size-[24px] p-0 text-muted-foreground/50 hover:text-muted-foreground shrink-0">
                            <MoreHorizontal className="size-[14px]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setMetricSheet({ open: true, label: metric.label, value: metric.value, change: metric.change, up: metric.up, desc: metric.desc })}>
                            <Eye className="size-[14px]" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => downloadCSV(`${metric.label.toLowerCase().replace(/\s/g, "-")}.csv`, ["Metric","Value","Change"], [[metric.label, metric.value, metric.change]])}>
                            <Download className="size-[14px]" /> Export
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate("/dashboard/analytics")}>
                            <TrendingUp className="size-[14px]" /> View Trend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="flex flex-col gap-2xs">
                        <AnimatedKPI value={metric.numValue} prefix="$" decimals={2} className="sp-kpi-sm text-foreground leading-none" />
                        <TT>
                          <TooltipTrigger asChild>
                            <span className={`sp-caption font-medium flex items-center gap-4xs cursor-help ${metric.up ? "text-success" : "text-destructive"}`}>
                              {metric.up
                                ? <ArrowUpRight className="size-[12px]" />
                                : <ArrowDownRight className="size-[12px]" />
                              }
                              {metric.change}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>vs. previous period</TooltipContent>
                        </TT>
                      </div>
                      <Sparkline dataKey={metric.label} color={metric.sparkColor} up={metric.up} />
                    </div>
                  </DCard>
                ))}
              </div>
            </div>
            <StatsChart colors={colors} />
          </div>

          {/* ── RIGHT col-span-4: Globe → Upgrade ── */}
          <div className="lg:col-span-4 flex flex-col gap-lg">
            <DCard className="p-2xl h-[515px] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between mb-sm shrink-0">
                <div className="flex items-center gap-sm">
                  <h3 className="sp-h4 text-foreground">Global Sales</h3>
                  <Badge variant="success" level="secondary" size="sm">{salesLocations.length} regions</Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="xs" className="text-muted-foreground/60 hover:text-muted-foreground">
                      <MoreHorizontal className="size-[14px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setGlobeSheet(true)}>
                      <ExternalLink className="size-[14px]" /> Full Map View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => downloadCSV("sales-locations.csv", ["City","Country","Sales"], salesLocations.map((l) => [l.city, l.country, String(l.sales)]))}>
                      <Download className="size-[14px]" /> Export Data
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyToClipboard(window.location.href + "#global-sales")}>
                      <Share2 className="size-[14px]" /> Share
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                {globeError ? (
                  <ErrorCard title="globe data" onRetry={handleRetryGlobe} />
                ) : (
                  <SalesGlobe locations={salesLocations} className="-mx-md" />
                )}
              </div>
            </DCard>

            {/* Upgrade CTA — purple gradient surface */}
            <div className="rounded-2xl relative overflow-hidden bg-gradient-to-br from-primary via-primary-hover to-violet-800">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_80%_0%,rgba(255,255,255,0.15)_0%,transparent_60%)]" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[60%] bg-[radial-gradient(ellipse_80%_60%_at_50%_90%,rgba(0,0,0,0.15)_0%,transparent_70%)]" />
              <div className="relative p-xl flex flex-col gap-lg">
                <div className="flex items-center gap-sm">
                  <svg viewBox="0 0 28 28" fill="none" className="size-[28px]">
                    <path d="M14 3L24 10L14 25L4 10Z" fill="white" fillOpacity="0.25" stroke="white" strokeWidth="1" strokeOpacity="0.4"/>
                    <path d="M14 7L20 11.5L14 22L8 11.5Z" fill="white" fillOpacity="0.5"/>
                  </svg>
                  <span className="sp-body-semibold text-white">ShopPulse<sup className="text-[9px] text-white/50 ml-[2px]">&reg;</sup></span>
                </div>
                <div>
                  <h3 className="sp-h3 text-white leading-tight">Advanced Analytics Suite</h3>
                  <p className="sp-body text-white/60 mt-xs line-clamp-1">Unlock deeper e-commerce insights, real-time reports & predictive trends.</p>
                </div>
                <button
                  className="flex items-center justify-center gap-xs w-full py-sm rounded-xl sp-body-semibold text-primary-hover bg-white transition-all hover:bg-white/90 shadow-[0_2px_12px_rgba(0,0,0,0.15)]"
                  onClick={() => navigate("/settings/billing")}
                >
                  Upgrade
                  <Sparkles className="size-[14px]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ SECTION 2: Bottom — 3 cards (4+4+4 = 12 cols) ━━━ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-lg items-start">

          {/* ── Recent Orders ──────────────────────────────── */}
          <DCard className="md:col-span-1 lg:col-span-4 p-2xl">
            <div className="flex items-center justify-between mb-xl">
              <div className="flex items-center gap-sm">
                <h3 className="sp-h4 text-foreground">Recent Orders</h3>
                <Badge variant="default" level="secondary" size="sm">{recentOrders.length}</Badge>
              </div>
              <div className="flex items-center gap-2xs">
                <TT>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground" onClick={handleRefreshOrders}>
                      <RefreshCw className={`size-[13px] ${refreshingOrders ? "animate-spin" : ""}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh</TooltipContent>
                </TT>
                <Button variant="ghost" size="sm" className="sp-label gap-3xs text-muted-foreground" onClick={() => navigate("/management/orders")}>
                  View all <ArrowRight className="size-sm" />
                </Button>
              </div>
            </div>
            {refreshingOrders ? (
              <div className="flex flex-col gap-sm">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-sm py-xs">
                    <Skeleton className="size-[38px] rounded-full shrink-0" />
                    <div className="flex-1 space-y-2xs">
                      <Skeleton className="h-[14px] w-[120px] rounded" />
                      <Skeleton className="h-[10px] w-[80px] rounded" />
                    </div>
                    <Skeleton className="h-[14px] w-[50px] rounded" />
                  </div>
                ))}
              </div>
            ) : recentOrders.length === 0 ? (
              <EmptyState icon={ShoppingCart} title="No recent orders" description="Orders will appear here once customers start purchasing." />
            ) : (
              <div className="flex flex-col">
                {recentOrders.slice(0, 4).map((order) => (
                  <DropdownMenu key={order.id}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-sm py-xs px-sm -mx-sm rounded-xl transition-colors hover:bg-surface-inset w-full text-left">
                        <Avatar className="size-[38px] ring-1 ring-border/20">
                          <AvatarImage src={order.avatarUrl} alt={order.customer} />
                          <AvatarFallback className="sp-label bg-muted/30 text-muted-foreground">{order.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="sp-body-semibold text-foreground truncate">{order.customer}</p>
                          <div className="flex items-center gap-2xs mt-3xs">
                            <span className="sp-data-sm text-muted-foreground">{order.id}</span>
                            <span className="text-muted-foreground/50">&middot;</span>
                            <Clock className="size-[11px] text-muted-foreground/60" />
                            <span className="sp-data-sm text-muted-foreground/50">{order.time}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2xs">
                          <span className="sp-data text-foreground font-medium">{order.amount}</span>
                          <Badge variant={statusBadge[order.status]?.variant || "secondary"} level="secondary" size="sm">
                            {order.status}
                          </Badge>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{order.id}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setOrderSheet({ open: true, id: order.id, customer: order.customer, amount: order.amount, status: order.status, time: order.time })}>
                        <Eye className="size-[14px]" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/management/orders/${order.id.replace("#", "")}`)}>
                        <Package className="size-[14px]" /> Track Shipment
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/management/invoices")}>
                        <Printer className="size-[14px]" /> Print Invoice
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { copyToClipboard(`${order.customer} — ${order.id}`); toast.success(`Contact info copied for ${order.customer}`) }}>
                        <ExternalLink className="size-[14px]" /> Contact Customer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>
            )}
          </DCard>

          {/* ── Top Products ───────────────────────────────── */}
          <DCard className="md:col-span-1 lg:col-span-4 p-2xl">
            <div className="flex items-center justify-between mb-lg">
              <div className="flex items-center gap-sm">
                <h3 className="sp-h4 text-foreground">Top Products</h3>
                <TT>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">
                      <Badge variant="success" level="secondary" size="sm">
                        <TrendingUp className="size-[10px]" /> Trending
                      </Badge>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>Based on sales in the last 30 days</TooltipContent>
                </TT>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="xs" className="sp-caption gap-3xs text-muted-foreground">
                    All <ArrowRight className="size-[14px]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/management/products")}>
                    <Eye className="size-[14px]" /> View All Products
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadCSV("top-products.csv", ["Name","Price","Sales","Growth","Stock"], topProducts.map((p) => [p.name, p.price, String(p.sales), p.growth, String(p.stock)]))}>
                    <Download className="size-[14px]" /> Export Report
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/management/products")}>
                    <Filter className="size-[14px]" /> Filter by Category
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDatePickerOpen(true)}>
                    <Calendar className="size-[14px]" /> Change Period
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {topProducts.length === 0 ? (
              <EmptyState icon={Package} title="No products yet" description="Add products to start tracking performance." />
            ) : (
              <div className="flex flex-col">
                {topProducts.slice(0, 4).map((prod, idx) => (
                  <DropdownMenu key={prod.sku}>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-sm py-xs px-sm -mx-sm rounded-xl transition-colors hover:bg-surface-inset group w-full text-left">
                        <div className="size-[40px] shrink-0 rounded-lg overflow-hidden bg-surface-raised relative">
                          <img src={prod.imageUrl} alt={prod.name} className="size-full object-cover" />
                          {idx === 0 && (
                            <div className="absolute -top-[1px] -right-[1px] size-[16px] rounded-bl-md bg-warning flex items-center justify-center">
                              <Star className="size-[9px] text-white fill-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="sp-body-medium text-foreground truncate">{prod.name}</p>
                          <div className="flex items-center gap-2xs">
                            <span className="sp-data-sm text-muted-foreground">{prod.sales.toLocaleString()} sold</span>
                            <span className="text-muted-foreground/50">&middot;</span>
                            <span className="sp-data-sm text-muted-foreground">{prod.price}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3xs">
                          {prod.growth.startsWith("+")
                            ? <ArrowUpRight className="size-[12px] text-success" />
                            : <ArrowDownRight className="size-[12px] text-destructive" />
                          }
                          <span className={`sp-data-sm ${prod.growth.startsWith("+") ? "text-success" : "text-destructive"}`}>{prod.growth}</span>
                        </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{prod.name}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setProductSheet({ open: true, name: prod.name, price: prod.price, sales: prod.sales, growth: prod.growth, stock: prod.stock, imageUrl: prod.imageUrl })}>
                        <Eye className="size-[14px]" /> View Product
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/dashboard/analytics")}>
                        <BarChart3 className="size-[14px]" /> Sales Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/management/products")}>
                        <Package className="size-[14px]" /> Stock: {prod.stock} units
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => toast.error("This is a demo — product not removed")}>
                        <Trash2 className="size-[14px]" /> Remove from List
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ))}
              </div>
            )}
          </DCard>

          {/* ── Sales Channels ─────────────────────────────── */}
          <DCard className="md:col-span-2 lg:col-span-4 p-2xl pb-xl">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="sp-h4 text-foreground">Sales Channels</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="xs" className="text-muted-foreground/50 hover:text-muted-foreground">
                    <MoreHorizontal className="size-sm" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setChannelDialog(true)}>
                    <Eye className="size-[14px]" /> Manage Channels
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => downloadCSV("sales-channels.csv", ["Channel","Revenue","Target","Progress"], channelData.map((c) => [c.name, c.amount, c.target, c.subtitle]))}>
                    <Download className="size-[14px]" /> Export Data
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setAddChannelDialog(true)}>
                    <Store className="size-[14px]" /> Add Channel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex flex-col">
              {([
                { ...channelData[0], Icon: ShoppingCart },
                { ...channelData[1], Icon: Store },
                { ...channelData[2], Icon: Smartphone },
                { ...channelData[3], Icon: Package },
              ] as const).map((ch, i) => (
                <div key={ch.name} className="group py-xs">
                  {/* Row 1: icon + name + amount */}
                  <div className="flex items-center gap-sm mb-xs">
                    <TT>
                      <TooltipTrigger asChild>
                        <div className="size-[28px] shrink-0 rounded-md bg-surface-raised flex items-center justify-center cursor-help">
                          <ch.Icon className="size-[14px] text-muted-foreground" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{ch.subtitle}</TooltipContent>
                    </TT>
                    <div className="flex-1 min-w-0">
                      <p className="sp-body-medium text-foreground">{ch.name}</p>
                    </div>
                    <div className="flex items-baseline gap-3xs">
                      <span className="sp-data text-foreground font-semibold">{ch.amount}</span>
                      <span className="sp-data-sm text-muted-foreground">/{ch.target}</span>
                    </div>
                  </div>
                  {/* Row 2: progress bar */}
                  <TT>
                    <TooltipTrigger asChild>
                      <div className="relative h-[10px] w-full rounded-sm bg-surface-inset overflow-hidden cursor-help">
                        <div
                          className="absolute inset-y-0 left-0 rounded-sm transition-all duration-500 group-hover:brightness-125"
                          style={{
                            width: `${ch.value}%`,
                            backgroundColor: p[i],
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>{ch.value}% of target reached</TooltipContent>
                  </TT>
                </div>
              ))}
            </div>
          </DCard>
        </div>
      </div>

      {/* ━━━ SHEETS & DIALOGS for action UIs ━━━ */}

      {/* Revenue Breakdown Sheet */}
      <Sheet open={revenueSheet} onOpenChange={setRevenueSheet}>
        <SheetContent className="sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Revenue Breakdown</SheetTitle>
            <SheetDescription>Monthly revenue performance for the past 12 months.</SheetDescription>
          </SheetHeader>
          <div className="mt-xl flex flex-col gap-lg">
            <div className="grid grid-cols-2 gap-md">
              <div className="surface-subtle p-lg">
                <p className="sp-caption text-muted-foreground">Total Revenue</p>
                <p className="sp-kpi-md text-foreground mt-2xs">${(revenueData.reduce((s, r) => s + r.revenue, 0) / 1000).toFixed(0)}k</p>
              </div>
              <div className="surface-subtle p-lg">
                <p className="sp-caption text-muted-foreground">Total Profit</p>
                <p className="sp-kpi-md text-success mt-2xs">${(revenueData.reduce((s, r) => s + r.profit, 0) / 1000).toFixed(0)}k</p>
              </div>
              <div className="surface-subtle p-lg">
                <p className="sp-caption text-muted-foreground">Total Orders</p>
                <p className="sp-kpi-md text-foreground mt-2xs">{revenueData.reduce((s, r) => s + r.orders, 0).toLocaleString()}</p>
              </div>
              <div className="surface-subtle p-lg">
                <p className="sp-caption text-muted-foreground">Total Refunds</p>
                <p className="sp-kpi-md text-destructive mt-2xs">${(revenueData.reduce((s, r) => s + r.refunds, 0) / 1000).toFixed(1)}k</p>
              </div>
            </div>
            <div>
              <p className="sp-label text-foreground mb-sm">Monthly Detail</p>
              <div className="flex flex-col divide-y divide-border/30 dark:divide-white/[0.06]">
                {revenueData.map((r) => (
                  <div key={r.month} className="flex items-center justify-between py-sm">
                    <span className="sp-body-medium text-foreground w-[48px]">{r.month}</span>
                    <Progress value={(r.revenue / 130000) * 100} className="flex-1 mx-md" />
                    <div className="flex items-baseline gap-xs">
                      <span className="sp-data text-foreground font-medium">${(r.revenue / 1000).toFixed(1)}k</span>
                      <span className="sp-data-sm text-muted-foreground">{r.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={() => { setRevenueSheet(false); navigate("/dashboard/analytics") }}>
              View Full Analytics <ArrowRight className="size-[14px]" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Compare Periods Dialog */}
      <Dialog open={compareDialog} onOpenChange={setCompareDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Compare Periods</DialogTitle>
            <DialogDescription>Revenue comparison between recent months.</DialogDescription>
          </DialogHeader>
          <div className="mt-lg flex flex-col gap-md">
            {[
              { period: "This Month vs Last Month", current: "$128.4k", previous: "$124.2k", change: "+3.4%" },
              { period: "This Quarter vs Last Quarter", current: "$368.4k", previous: "$303.0k", change: "+21.6%" },
              { period: "H2 vs H1", current: "$677.6k", previous: "$483.2k", change: "+40.2%" },
            ].map((cmp) => (
              <div key={cmp.period} className="flex items-center justify-between rounded-xl border border-border-card p-lg">
                <div>
                  <p className="sp-body-medium text-foreground">{cmp.period}</p>
                  <div className="flex items-center gap-sm mt-2xs">
                    <span className="sp-data text-muted-foreground">{cmp.previous}</span>
                    <ArrowRight className="size-[12px] text-muted-foreground/60" />
                    <span className="sp-data text-foreground font-semibold">{cmp.current}</span>
                  </div>
                </div>
                <Badge variant="success" level="secondary" size="sm">{cmp.change}</Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-sm" onClick={() => { setCompareDialog(false); navigate("/dashboard/analytics") }}>
              Detailed Comparison in Analytics
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Metric Detail Sheet */}
      <Sheet open={metricSheet.open} onOpenChange={(open) => setMetricSheet((prev) => ({ ...prev, open }))}>
        <SheetContent className="sm:max-w-[400px]">
          <SheetHeader>
            <SheetTitle>{metricSheet.label}</SheetTitle>
            <SheetDescription>{metricSheet.desc}</SheetDescription>
          </SheetHeader>
          <div className="mt-xl flex flex-col gap-xl">
            <div className="surface-subtle p-2xl text-center">
              <p className="sp-kpi-lg text-foreground">{metricSheet.value}</p>
              <span className={`sp-label font-medium mt-xs inline-flex items-center gap-4xs ${metricSheet.up ? "text-success" : "text-destructive"}`}>
                {metricSheet.up ? <ArrowUpRight className="size-[14px]" /> : <ArrowDownRight className="size-[14px]" />}
                {metricSheet.change} vs last period
              </span>
            </div>
            <div>
              <p className="sp-label text-foreground mb-sm">Breakdown</p>
              {[
                { label: "This Week", value: "32%", progress: 32 },
                { label: "This Month", value: "68%", progress: 68 },
                { label: "This Quarter", value: "85%", progress: 85 },
              ].map((b) => (
                <div key={b.label} className="flex items-center gap-sm py-xs">
                  <span className="sp-caption text-muted-foreground w-[100px]">{b.label}</span>
                  <Progress value={b.progress} className="flex-1 h-[6px]" />
                  <span className="sp-data-sm text-foreground w-[36px] text-right">{b.value}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => { setMetricSheet((prev) => ({ ...prev, open: false })); navigate("/dashboard/analytics") }}>
              View Full Trend <TrendingUp className="size-[14px]" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Order Detail Sheet */}
      <Sheet open={orderSheet.open} onOpenChange={(open) => setOrderSheet((prev) => ({ ...prev, open }))}>
        <SheetContent className="sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Order {orderSheet.id}</SheetTitle>
            <SheetDescription>Placed by {orderSheet.customer}</SheetDescription>
          </SheetHeader>
          <div className="mt-xl flex flex-col gap-lg">
            <div className="grid grid-cols-2 gap-md">
              <div className="surface-subtle p-lg">
                <p className="sp-caption text-muted-foreground">Amount</p>
                <p className="sp-kpi-sm text-foreground mt-2xs">{orderSheet.amount}</p>
              </div>
              <div className="surface-subtle p-lg">
                <p className="sp-caption text-muted-foreground">Status</p>
                <Badge variant={statusBadge[orderSheet.status]?.variant || "secondary"} level="secondary" className="mt-sm">{orderSheet.status}</Badge>
              </div>
            </div>
            <div>
              <p className="sp-label text-foreground mb-sm">Timeline</p>
              <div className="flex flex-col gap-sm">
                {[
                  { label: "Order placed", time: orderSheet.time, done: true },
                  { label: "Payment confirmed", time: "Just now", done: orderSheet.status !== "Pending" },
                  { label: "Processing", time: "—", done: orderSheet.status === "Shipped" || orderSheet.status === "Delivered" },
                  { label: "Shipped", time: "—", done: orderSheet.status === "Shipped" || orderSheet.status === "Delivered" },
                  { label: "Delivered", time: "—", done: orderSheet.status === "Delivered" },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-sm">
                    <div className={`size-[8px] rounded-full shrink-0 ${step.done ? "bg-success" : "bg-border"}`} />
                    <span className={`sp-body-medium flex-1 ${step.done ? "text-foreground" : "text-muted-foreground/50"}`}>{step.label}</span>
                    <span className="sp-caption text-muted-foreground">{step.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={() => { setOrderSheet((prev) => ({ ...prev, open: false })); navigate(`/management/orders/${orderSheet.id.replace("#", "")}`) }}>
              Full Order Details <ArrowRight className="size-[14px]" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Detail Sheet */}
      <Sheet open={productSheet.open} onOpenChange={(open) => setProductSheet((prev) => ({ ...prev, open }))}>
        <SheetContent className="sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>{productSheet.name}</SheetTitle>
            <SheetDescription>Product performance overview</SheetDescription>
          </SheetHeader>
          <div className="mt-xl flex flex-col gap-lg">
            <div className="surface-subtle p-lg flex items-center gap-lg">
              <img src={productSheet.imageUrl} alt={productSheet.name} className="size-[64px] rounded-lg object-cover" />
              <div>
                <p className="sp-kpi-sm text-foreground">{productSheet.price}</p>
                <p className="sp-caption text-muted-foreground mt-2xs">{productSheet.sales.toLocaleString()} units sold</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-md">
              <div className="surface-subtle p-lg">
                <p className="sp-caption text-muted-foreground">Growth</p>
                <p className={`sp-data text-foreground font-semibold mt-2xs ${productSheet.growth.startsWith("+") ? "text-success" : "text-destructive"}`}>{productSheet.growth}</p>
              </div>
              <div className="surface-subtle p-lg">
                <p className="sp-caption text-muted-foreground">Stock</p>
                <p className={`sp-data font-semibold mt-2xs ${productSheet.stock < 50 ? "text-warning" : "text-foreground"}`}>{productSheet.stock} units</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => { setProductSheet((prev) => ({ ...prev, open: false })); navigate("/management/products") }}>
              View in Products <ArrowRight className="size-[14px]" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Global Sales Sheet */}
      <Sheet open={globeSheet} onOpenChange={setGlobeSheet}>
        <SheetContent className="sm:max-w-[480px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Global Sales</SheetTitle>
            <SheetDescription>Sales performance by region</SheetDescription>
          </SheetHeader>
          <div className="mt-xl flex flex-col gap-md">
            {salesLocations.map((loc, i) => (
              <div key={loc.city} className="flex items-center gap-sm rounded-xl border border-border-card p-lg">
                <div className="size-[36px] rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p[i % p.length]}15` }}>
                  <Globe className="size-[16px]" style={{ color: p[i % p.length] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="sp-body-medium text-foreground">{loc.city}</p>
                  <p className="sp-caption text-muted-foreground">{loc.country}</p>
                </div>
                <div className="text-right">
                  <p className="sp-data text-foreground font-semibold">${(loc.sales / 1000).toFixed(1)}k</p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-sm" onClick={() => { setGlobeSheet(false); navigate("/dashboard/analytics") }}>
              Full Analytics <ArrowRight className="size-[14px]" />
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Channel Management Dialog */}
      <Dialog open={channelDialog} onOpenChange={setChannelDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sales Channels</DialogTitle>
            <DialogDescription>Manage and monitor your sales channels.</DialogDescription>
          </DialogHeader>
          <div className="mt-lg flex flex-col gap-md">
            {channelData.map((ch, i) => (
              <div key={ch.name} className="flex items-center gap-sm rounded-xl border border-border-card p-lg">
                <div className="size-[36px] rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${p[i]}15` }}>
                  {[ShoppingCart, Store, Smartphone, Package][i] && (() => { const Icon = [ShoppingCart, Store, Smartphone, Package][i]; return <Icon className="size-[16px]" style={{ color: p[i] }} /> })()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="sp-body-medium text-foreground">{ch.name}</p>
                  <p className="sp-caption text-muted-foreground">{ch.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="sp-data text-foreground font-semibold">{ch.amount}</p>
                  <Progress value={ch.value} className="w-[60px] h-[4px] mt-xs" />
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Channel Dialog */}
      <Dialog open={addChannelDialog} onOpenChange={setAddChannelDialog}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Add Sales Channel</DialogTitle>
            <DialogDescription>Connect a new sales channel to track revenue.</DialogDescription>
          </DialogHeader>
          <form
            className="mt-lg flex flex-col gap-lg"
            onSubmit={(e) => {
              e.preventDefault()
              setAddChannelDialog(false)
              toast.success("Channel added successfully")
            }}
          >
            <div className="flex flex-col gap-md">
              <div className="flex flex-col gap-2xs">
                <Label>Channel Name</Label>
                <Input size="lg" placeholder="e.g. TikTok Shop" />
              </div>
              <div className="flex flex-col gap-2xs">
                <Label>Channel Type</Label>
                <div className="grid grid-cols-2 gap-sm">
                  {[
                    { icon: ShoppingCart, label: "E-Commerce", desc: "Online marketplace" },
                    { icon: Store, label: "Retail", desc: "Physical store" },
                    { icon: Smartphone, label: "Mobile App", desc: "In-app purchases" },
                    { icon: Package, label: "Wholesale", desc: "B2B distribution" },
                  ].map((type) => (
                    <label key={type.label} className="flex items-center gap-sm rounded-xl border border-border/30 dark:border-border-subtle p-md cursor-pointer hover:bg-muted/30 dark:hover:bg-muted/10 transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/[0.04]">
                      <input type="radio" name="channelType" value={type.label} className="sr-only" defaultChecked={type.label === "E-Commerce"} />
                      <type.icon className="size-[16px] text-muted-foreground shrink-0" />
                      <div>
                        <p className="sp-body-medium text-foreground">{type.label}</p>
                        <p className="sp-caption text-muted-foreground">{type.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2xs">
                <Label>Monthly Target</Label>
                <div className="relative">
                  <span className="absolute left-md top-1/2 -translate-y-1/2 sp-body text-muted-foreground">$</span>
                  <Input size="lg" className="pl-[28px]" placeholder="10,000" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-sm justify-end">
              <Button type="button" variant="outline" onClick={() => setAddChannelDialog(false)}>Cancel</Button>
              <Button type="submit">Add Channel</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </TooltipProvider>
  )
}
