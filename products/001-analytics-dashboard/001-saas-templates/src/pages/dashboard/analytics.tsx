import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Eye,
  MoreHorizontal,
  Download,
  Copy,
  Target,
  BarChart3,
  Sparkles,
  RefreshCw,
  WifiOff,
  Globe,
  Package,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  TooltipProvider,
  Tooltip as TT,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"
import {
  revenueData,
  channelData,
  categoryData,
  conversionFunnel,
  dailyOrdersData,
  salesLocations,
} from "@/data/chart-data"
import { useChartColors } from "@/hooks/use-chart-colors"
import { SalesMap, countryFlag } from "@/components/charts/sales-map"
import { toast } from "sonner"

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function DCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`rounded-2xl border-border/60 dark:border-border-subtle shadow-none p-xl h-full ${className}`}>
      {children}
    </Card>
  )
}

function CardActions({ onExport, onCopy }: { onExport?: () => void; onCopy?: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="xs" className="text-muted-foreground/60 hover:text-muted-foreground" aria-label="More options">
          <MoreHorizontal className="size-[14px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onExport && (
          <DropdownMenuItem onClick={onExport}>
            <Download className="size-[14px]" /> Export Data
          </DropdownMenuItem>
        )}
        {onCopy && (
          <>
            {onExport && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={onCopy}>
              <Copy className="size-[14px]" /> Copy Data
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LOADING SKELETON
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-lg">
      {/* Row 1: 4 KPI cards */}
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="md:col-span-3 lg:col-span-3 h-[130px] rounded-2xl" />)}
      {/* Row 2-3 */}
      <Skeleton className="md:col-span-6 lg:col-span-5 lg:row-span-2 h-[280px] rounded-2xl" />
      <Skeleton className="md:col-span-3 lg:col-span-4 lg:row-span-2 h-[280px] rounded-2xl" />
      <Skeleton className="md:col-span-3 lg:col-span-3 lg:row-span-2 h-[280px] rounded-2xl" />
      {/* Row 4-5 */}
      <Skeleton className="md:col-span-6 lg:col-span-7 lg:row-span-2 h-[330px] rounded-2xl" />
      <Skeleton className="md:col-span-6 lg:col-span-5 lg:row-span-2 h-[330px] rounded-2xl" />
      {/* Row 6-7 */}
      <Skeleton className="md:col-span-3 lg:col-span-4 lg:row-span-2 h-[280px] rounded-2xl" />
      <Skeleton className="md:col-span-6 lg:col-span-8 lg:row-span-2 h-[280px] rounded-2xl" />
      {/* Row 8: 4 Insight cards */}
      {[...Array(4)].map((_, i) => <Skeleton key={`insight-${i}`} className="md:col-span-3 lg:col-span-3 h-[130px] rounded-2xl" />)}
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
   ERROR STATE
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

/* Custom tooltip matching dashboard style */
function ChartTooltipContent({ active, payload, label, formatter }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
  label?: string
  formatter?: (value: number, name: string) => string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-border/30 bg-card/95 backdrop-blur-xl px-lg py-sm shadow-lg">
      <p className="sp-label text-muted-foreground mb-xs">{label}</p>
      <div className="flex flex-col gap-3xs">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-xs">
            <div className="size-[8px] rounded-sm" style={{ backgroundColor: entry.color }} />
            <span className="sp-data-sm text-muted-foreground">{entry.name}</span>
            <span className="sp-data text-foreground font-medium ml-auto pl-lg">
              {formatter ? formatter(entry.value, entry.name) : entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* Each segment: rounded corners + gap between segments (matches dashboard) */
function RoundedSegment(props: Record<string, unknown>) {
  const { x, y, width, height, fill } = props as { x: number; y: number; width: number; height: number; fill: string }
  if (!height || height <= 0) return null
  const gap = 4
  const ay = y + gap / 2
  const ah = Math.max(height - gap, 2)
  const r = Math.min(10, ah / 2, (width as number) / 2)
  return <rect x={x} y={ay} width={width} height={ah} rx={r} ry={r} fill={fill} />
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DATA — monthly revenue by channel (derived from revenueData)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const MONTHLY_CHANNELS = [
  { month: "Jan", online: 30100, retail: 17800, wholesale: 8900, services: 11600, total: 68400 },
  { month: "Feb", online: 32400, retail: 18000, wholesale: 8500, services: 13200, total: 72100 },
  { month: "Mar", online: 37800, retail: 20300, wholesale: 9500, services: 13600, total: 81200 },
  { month: "Apr", online: 33800, retail: 19200, wholesale: 9600, services: 14200, total: 76800 },
  { month: "May", online: 40300, retail: 22400, wholesale: 10200, services: 16600, total: 89500 },
  { month: "Jun", online: 43400, retail: 23800, wholesale: 11200, services: 16800, total: 95200 },
  { month: "Jul", online: 46100, retail: 25600, wholesale: 12800, services: 18000, total: 102500 },
  { month: "Aug", online: 44500, retail: 24700, wholesale: 12200, services: 17400, total: 98800 },
  { month: "Sep", online: 48800, retail: 27100, wholesale: 13500, services: 19000, total: 108400 },
  { month: "Oct", online: 53700, retail: 28900, wholesale: 13200, services: 20000, total: 115800 },
  { month: "Nov", online: 56100, retail: 31100, wholesale: 14900, services: 22100, total: 124200 },
  { month: "Dec", online: 58200, retail: 32100, wholesale: 15400, services: 22730, total: 128430 },
]

/* Forecast: actual → projected */
const FORECAST_DATA = [
  { month: "Jul", actual: 102500, projected: null },
  { month: "Aug", actual: 98800, projected: null },
  { month: "Sep", actual: 108400, projected: 106000 },
  { month: "Oct", actual: 115800, projected: 112000 },
  { month: "Nov", actual: 124200, projected: 121000 },
  { month: "Dec", actual: 128430, projected: 130000 },
  { month: "Jan '27", actual: null, projected: 136000 },
  { month: "Feb '27", actual: null, projected: 143000 },
  { month: "Mar '27", actual: null, projected: 149500 },
]

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SUMMARY METRICS — right sidebar (ref: monex Total Income/Expenses/Net)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const SUMMARY_METRICS = [
  { label: "Total Revenue", value: "$1,161,330", change: "+14.2%", up: true, icon: DollarSign, spark: revenueData.map((d) => d.revenue) },
  { label: "Total Orders", value: "35,692", change: "+8.7%", up: true, icon: ShoppingCart, spark: revenueData.map((d) => d.orders) },
  { label: "Net Profit", value: "$899,100", change: "+18.6%", up: true, icon: TrendingUp, spark: revenueData.map((d) => d.profit) },
  { label: "Avg. Order Value", value: "$33.42", change: "-2.1%", up: false, icon: Target, spark: revenueData.map((d) => +(d.revenue / d.orders).toFixed(2)) },
]

/* Tiny inline sparkline using SVG polyline */
function Sparkline({ data, up, className = "" }: { data: number[]; up: boolean; className?: string }) {
  const w = 80
  const h = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ")
  const stroke = up ? "var(--color-success)" : "var(--color-destructive)"
  const fill = up ? "var(--color-success)" : "var(--color-destructive)"

  // Area fill path
  const areaPath = `M0,${h} ` + data.map((v, i) => `L${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ") + ` L${w},${h} Z`

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className} fill="none">
      <path d={areaPath} fill={fill} opacity={0.08} />
      <polyline points={points} stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} fill="none" />
    </svg>
  )
}


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GEOGRAPHY MAP — bubble map showing sales by region
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function GeographySection({ error, onRetry }: { error?: boolean; onRetry?: () => void }) {
  const totalSales = salesLocations.reduce((s, l) => s + l.sales, 0)
  const sorted = [...salesLocations].sort((a, b) => b.sales - a.sales)
  const [highlightCity, setHighlightCity] = useState<string | null>(null)

  return (
    <DCard className="p-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-md">
          <h3 className="sp-h4 text-foreground">Geography</h3>
          <Badge variant="default" level="secondary" size="sm">{salesLocations.length} Regions</Badge>
        </div>
        <CardActions
          onCopy={() => {
            navigator.clipboard.writeText(salesLocations.map((l) => `${l.city} (${l.country}): $${l.sales.toLocaleString()}`).join("\n"))
            toast.success("Geography data copied")
          }}
        />
      </div>

      {error ? (
        <ErrorCard title="geography data" onRetry={onRetry!} />
      ) : (
      <>
      {/* Bubble map */}
      <SalesMap
        locations={salesLocations}
        highlightCity={highlightCity}
        onHover={(loc) => setHighlightCity(loc?.city ?? null)}
      />

      {/* Bottom: interactive location legend */}
      <div className="mt-auto pt-sm grid grid-cols-2 md:grid-cols-4">
        {sorted.map((loc, i) => {
          const pct = ((loc.sales / totalSales) * 100).toFixed(0)
          const isActive = highlightCity === loc.city
          /* Border logic: right border except last in row, bottom border except last row */
          const isLastCol2 = (i + 1) % 2 === 0
          const isLastCol4 = (i + 1) % 4 === 0
          const lastRow2Start = Math.floor((sorted.length - 1) / 2) * 2
          const lastRow4Start = Math.floor((sorted.length - 1) / 4) * 4
          const isLastRow2 = i >= lastRow2Start
          const isLastRow4 = i >= lastRow4Start
          return (
            <div
              key={loc.city}
              className={`${!isLastCol2 ? "border-r" : ""} ${!isLastRow2 ? "border-b" : ""} ${isLastCol2 && !isLastCol4 ? "md:border-r" : ""} ${isLastRow2 && !isLastRow4 ? "md:border-b" : ""} ${isLastCol4 ? "md:border-r-0" : ""} ${isLastRow4 ? "md:border-b-0" : ""} border-border-card px-md md:px-lg py-md`}
            >
              <button
                className={`flex items-center gap-sm text-left rounded-xl px-sm py-xs w-full transition-colors ${isActive ? "bg-surface-raised" : "hover:bg-surface-raised/50"}`}
                onPointerEnter={() => setHighlightCity(loc.city)}
                onPointerLeave={() => setHighlightCity(null)}
              >
                <span className="text-[15px] leading-none shrink-0">{countryFlag(loc.country)}</span>
                <div className="flex flex-col gap-4xs min-w-0 flex-1">
                  <span className="sp-body-medium text-foreground truncate">{loc.city}</span>
                  <span className="sp-caption text-muted-foreground">${(loc.sales / 1000).toFixed(1)}k</span>
                </div>
                <span className="sp-data font-semibold text-foreground">{pct}%</span>
              </button>
            </div>
          )
        })}
      </div>
      </>
      )}
    </DCard>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   REVENUE OVERVIEW — big KPI + mini stacked bar + legend
   (ref: monex Income Overview card)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function RevenueOverview({ p }: { p: string[] }) {
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0)
  const channelTotals = [
    { name: "Online Store", amount: MONTHLY_CHANNELS.reduce((s, d) => s + d.online, 0), color: p[3] },
    { name: "Retail", amount: MONTHLY_CHANNELS.reduce((s, d) => s + d.retail, 0), color: p[1] },
    { name: "Wholesale", amount: MONTHLY_CHANNELS.reduce((s, d) => s + d.wholesale, 0), color: p[4] },
    { name: "Services", amount: MONTHLY_CHANNELS.reduce((s, d) => s + d.services, 0), color: p[0] },
  ]

  return (
    <DCard className="p-2xl flex flex-col">
      <div className="flex items-center justify-between mb-lg">
        <h3 className="sp-h4 text-foreground">Revenue Overview</h3>
        <Badge variant="default" level="secondary" size="sm">Channels</Badge>
      </div>

      {revenueData.length === 0 ? (
        <EmptyState icon={DollarSign} title="No revenue data" description="Revenue data will appear once transactions are recorded." />
      ) : (
      <>
      {/* Big KPI */}
      <p className="sp-kpi-lg text-foreground mb-lg">${totalRevenue.toLocaleString()}</p>

      {/* Stacked horizontal bar — segments with gaps */}
      <div className="flex gap-[3px] h-[12px] mb-xl">
        {channelTotals.map((ch) => (
          <div
            key={ch.name}
            className="h-full rounded-sm"
            style={{ width: `${(ch.amount / totalRevenue) * 100}%`, backgroundColor: ch.color }}
          />
        ))}
      </div>

      {/* Legend with values */}
      <div className="grid grid-cols-2 gap-lg mt-auto">
        {channelTotals.map((ch) => {
          const pct = ((ch.amount / totalRevenue) * 100).toFixed(0)
          return (
            <div key={ch.name} className="flex flex-col gap-3xs">
              <div className="flex items-center gap-xs">
                <div className="size-[8px] rounded-sm shrink-0" style={{ backgroundColor: ch.color }} />
                <span className="sp-caption text-muted-foreground">{ch.name}</span>
              </div>
              <div className="flex items-baseline gap-xs">
                <span className="sp-h4 text-foreground">${(ch.amount / 1000).toFixed(0)}K</span>
                <span className="sp-caption text-muted-foreground">{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
      </>
      )}
    </DCard>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TRAFFIC SOURCES — donut chart
   (ref: monex Expense Analysis donut)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* Custom active-sector renderer — expands outward on hover */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ActiveSector(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, cornerRadius } = props
  const expand = 6
  return (
    <g>
      {/* Glow ring behind */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 2}
        outerRadius={outerRadius + expand + 4}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill} opacity={0.15}
        cornerRadius={cornerRadius}
      />
      {/* Expanded sector */}
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 1}
        outerRadius={outerRadius + expand}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill}
        cornerRadius={cornerRadius}
      />
    </g>
  )
}

function TrafficSources({ p }: { p: string[] }) {
  const totalValue = channelData.reduce((s, d) => s + d.value, 0)
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  return (
    <DCard className="p-2xl flex flex-col">
      <div className="flex items-center justify-between mb-lg">
        <h3 className="sp-h4 text-foreground">Traffic Sources</h3>
        <Badge variant="default" level="secondary" size="sm">Channels</Badge>
      </div>

      {channelData.length === 0 ? (
        <EmptyState icon={Globe} title="No traffic data" description="Traffic sources will appear as visitors interact with your store." />
      ) : (
      <div className="flex items-center gap-xl flex-1">
        {/* Donut — left side */}
        <div className="relative shrink-0 overflow-visible">
          <ResponsiveContainer width={210} height={210} className="overflow-visible [&_svg]:overflow-visible">
            <PieChart>
              <Pie
                data={channelData}
                innerRadius={55}
                outerRadius={95}
                dataKey="value"
                stroke="none"
                startAngle={90}
                endAngle={-270}
                paddingAngle={2}
                cornerRadius={8}
                activeIndex={activeIdx ?? undefined}
                activeShape={<ActiveSector />}
                onMouseEnter={(_, idx) => setActiveIdx(idx)}
                onMouseLeave={() => setActiveIdx(null)}
              >
                {channelData.map((_entry, i) => (
                  <Cell
                    key={i}
                    fill={p[i]}
                    opacity={activeIdx !== null && activeIdx !== i ? 0.4 : 1}
                    style={{ transition: "opacity 0.2s" }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label — show hovered segment or total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-200">
            {activeIdx !== null ? (
              <>
                <span className="sp-kpi-md text-foreground">{channelData[activeIdx].value}%</span>
                <span className="sp-overline text-muted-foreground truncate max-w-[80px] text-center">{channelData[activeIdx].name}</span>
              </>
            ) : (
              <>
                <span className="sp-kpi-md text-foreground">{totalValue}</span>
                <span className="sp-overline text-muted-foreground">Total</span>
              </>
            )}
          </div>
        </div>

        {/* Legend — right side (bidirectional hover with pie) */}
        <div className="flex flex-col gap-md flex-1">
          {channelData.map((ch, i) => {
            const isActive = activeIdx === i
            const isDimmed = activeIdx !== null && activeIdx !== i
            return (
              <button
                key={ch.name}
                className={`flex items-center gap-sm rounded-lg px-sm py-xs -mx-sm transition-all ${isActive ? "bg-surface-raised" : "hover:bg-surface-raised/50"}`}
                onPointerEnter={() => setActiveIdx(i)}
                onPointerLeave={() => setActiveIdx(null)}
              >
                <div
                  className="size-[10px] rounded-[3px] shrink-0 transition-opacity"
                  style={{ backgroundColor: p[i], opacity: isDimmed ? 0.4 : 1 }}
                />
                <span className={`sp-body-medium flex-1 truncate text-left transition-colors ${isDimmed ? "text-muted-foreground" : "text-foreground"}`}>{ch.name}</span>
                <span className={`sp-data font-semibold transition-colors ${isDimmed ? "text-muted-foreground" : "text-foreground"}`}>{ch.value}%</span>
              </button>
            )
          })}
        </div>
      </div>
      )}
    </DCard>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   REVENUE FORECAST — dual line chart + insight callout
   (ref: monex Financial Forecast card)
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function RevenueForecast({ colors }: { colors: Record<string, string> }) {
  return (
    <DCard className="p-2xl flex flex-col">
      <div className="flex items-center justify-between mb-lg">
        <h3 className="sp-h4 text-foreground">Revenue Forecast</h3>
        <div className="flex items-center gap-lg">
          <div className="flex items-center gap-xs">
            <div className="size-[8px] rounded-full" style={{ backgroundColor: colors["chart-1"] }} />
            <span className="sp-caption text-muted-foreground">Actual</span>
          </div>
          <div className="flex items-center gap-xs">
            <div className="size-[8px] rounded-full border-2 border-dashed" style={{ borderColor: colors["chart-2"] }} />
            <span className="sp-caption text-muted-foreground">Forecast</span>
          </div>
        </div>
      </div>

      <div className="h-[180px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={FORECAST_DATA} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
            <XAxis dataKey="month" stroke={colors["muted-foreground"]} fontSize={10} tickLine={false} axisLine={false} fontFamily="Inter" fontWeight={500} dy={8} />
            <YAxis stroke={colors["muted-foreground"]} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={42} />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload?.filter((e) => e.value != null).map((e) => ({
                    name: e.dataKey === "actual" ? "Actual" : "Forecast",
                    value: Number(e.value),
                    color: e.dataKey === "actual" ? (colors["chart-1"] || "#7c3aed") : (colors["chart-2"] || "#22c55e"),
                    dataKey: String(e.dataKey),
                  }))}
                  label={label}
                  formatter={(v) => `$${(v / 1000).toFixed(1)}k`}
                />
              )}
            />
            <Line type="monotone" dataKey="actual" stroke={colors["chart-1"]} strokeWidth={2} dot={{ r: 3, fill: "var(--color-card)", stroke: colors["chart-1"], strokeWidth: 2 }} connectNulls={false} />
            <Line type="monotone" dataKey="projected" stroke={colors["chart-2"]} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 3, fill: "var(--color-card)", stroke: colors["chart-2"], strokeWidth: 2 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Insight callout */}
      <div className="mt-lg px-md py-sm rounded-xl bg-surface-inset border border-border-card">
        <p className="sp-caption text-muted-foreground">
          <Sparkles className="size-[12px] inline -mt-0.5 mr-2xs text-chart-5" />
          Revenue trending <span className="text-foreground font-semibold">+14.2% YoY</span>. Projected to reach <span className="text-foreground font-semibold">$149.5k</span> by March 2027 based on current growth trajectory.
        </p>
      </div>
    </DCard>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONVERSION FUNNEL — waterfall-style bars
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ConversionFunnel({ colors, p, refreshing, onRefresh }: { colors: Record<string, string>; p: string[]; refreshing?: boolean; onRefresh?: () => void }) {
  const funnelWithDropoff = conversionFunnel.map((stage, i) => ({
    ...stage,
    dropoff: i > 0 ? `${((1 - stage.value / conversionFunnel[i - 1].value) * 100).toFixed(0)}%` : null,
  }))

  return (
    <DCard className="p-2xl flex flex-col">
      <div className="flex items-center justify-between mb-md">
        <div className="flex items-center gap-sm">
          <h3 className="sp-h4 text-foreground">Conversion Funnel</h3>
          <TT>
            <TooltipTrigger asChild>
              <Badge variant="success" level="secondary" size="sm">9.0% CVR</Badge>
            </TooltipTrigger>
            <TooltipContent>Overall conversion: Store Visits → Purchase</TooltipContent>
          </TT>
        </div>
        <div className="flex items-center gap-2xs">
          {onRefresh && (
            <TT>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="xs" className="text-muted-foreground/60 hover:text-muted-foreground" onClick={onRefresh} aria-label="Refresh">
                  <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </TT>
          )}
          <CardActions
            onCopy={() => {
              navigator.clipboard.writeText(conversionFunnel.map((s) => `${s.stage}: ${s.value.toLocaleString()} (${s.pct}%)`).join("\n"))
              toast.success("Funnel data copied")
            }}
          />
        </div>
      </div>

      {refreshing ? (
        <div className="flex-1 flex flex-col gap-md py-lg">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-sm px-xs">
              <Skeleton className="size-[24px] rounded-md shrink-0" />
              <Skeleton className="h-[14px] flex-1 rounded" />
              <Skeleton className="h-[14px] w-[50px] rounded" />
            </div>
          ))}
        </div>
      ) : (
      <>
      <div className="flex-1 min-h-[100px] mb-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={conversionFunnel} margin={{ top: 14, right: 4, bottom: 0, left: 4 }} barSize={48} barCategoryGap="12%">
            <XAxis dataKey="stage" stroke={colors["muted-foreground"]} fontSize={11} tickLine={false} axisLine={false} fontFamily="Inter" fontWeight={500} dy={8} />
            <YAxis hide domain={[0, (max: number) => max * 1.15]} />
            <Tooltip
              cursor={{ fill: colors["surface-inset"] || "rgba(0,0,0,0.04)", radius: 8 }}
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload?.map((e) => ({ name: "Users", value: Number(e.value), color: String(e.payload?.fill || p[0]), dataKey: "value" }))}
                  label={label}
                />
              )}
            />
            <Bar dataKey="value" shape={<RoundedSegment />}>
              <LabelList dataKey="value" position="top" offset={8} fontSize={11} fontWeight={600} fontFamily="Inter" fill={colors["foreground"] || "#888"} formatter={(v: number) => v.toLocaleString()} />
              {conversionFunnel.map((_entry, i) => (
                <Cell key={i} fill={p[i % p.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Funnel steps — vertical list */}
      <div className="mt-auto pt-sm flex flex-col gap-sm">
        {funnelWithDropoff.map((stage, i) => (
          <div key={stage.stage} className="flex items-center gap-sm px-xs">
            <div className="size-[24px] rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${p[i % p.length]}15` }}>
              <span className="text-[11px] font-semibold" style={{ color: p[i % p.length] }}>{i + 1}</span>
            </div>
            <span className="sp-body-medium text-foreground truncate flex-1 min-w-0">{stage.stage}</span>
            <span className="sp-caption text-muted-foreground shrink-0">{stage.value.toLocaleString()}</span>
            {stage.dropoff && (
              <span className="sp-data font-semibold text-destructive shrink-0">{stage.dropoff}</span>
            )}
          </div>
        ))}
      </div>
      </>
      )}
    </DCard>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DAILY ORDERS — bar chart with prev week comparison
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function DailyOrders({ colors }: { colors: Record<string, string> }) {
  const totalThisWeek = dailyOrdersData.reduce((s, d) => s + d.orders, 0)
  const totalPrevWeek = dailyOrdersData.reduce((s, d) => s + d.prevWeek, 0)
  const weekChange = ((totalThisWeek - totalPrevWeek) / totalPrevWeek * 100).toFixed(1)

  return (
    <DCard className="p-2xl flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm mb-lg">
        <div>
          <h3 className="sp-h4 text-foreground">Daily Orders</h3>
          <div className="flex items-center gap-sm mt-xs">
            <span className="sp-kpi-sm text-foreground">{totalThisWeek.toLocaleString()}</span>
            <span className="inline-flex items-center gap-4xs sp-caption font-semibold text-success">
              <ArrowUpRight className="size-[11px]" /> +{weekChange}%
            </span>
            <span className="sp-caption text-muted-foreground">vs last week</span>
          </div>
        </div>
        <div className="flex items-center gap-lg shrink-0">
          <div className="flex items-center gap-xs">
            <div className="size-[8px] rounded-sm" style={{ backgroundColor: colors["chart-1"] }} />
            <span className="sp-caption text-muted-foreground">This week</span>
          </div>
          <div className="flex items-center gap-xs">
            <div className="size-[8px] rounded-sm" style={{ backgroundColor: colors["chart-2"] }} />
            <span className="sp-caption text-muted-foreground">Last week</span>
          </div>
        </div>
      </div>

      {dailyOrdersData.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No order data" description="Daily orders will show here once customers start purchasing." />
      ) : (
      <div className="h-[220px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailyOrdersData} margin={{ top: 24, right: 4, bottom: 0, left: 4 }} barGap={4} barCategoryGap="12%">
            <XAxis dataKey="day" stroke={colors["muted-foreground"]} fontSize={12} tickLine={false} axisLine={false} fontFamily="Inter" fontWeight={500} dy={8} />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: colors["surface-inset"] || "rgba(0,0,0,0.04)", radius: 8 }}
              content={({ active, payload, label }) => (
                <ChartTooltipContent
                  active={active}
                  payload={payload?.map((e) => ({ name: e.dataKey === "orders" ? "This week" : "Last week", value: Number(e.value), color: e.dataKey === "orders" ? (colors["chart-1"] || "#7c3aed") : (colors["chart-2"] || "#22c55e"), dataKey: String(e.dataKey) }))}
                  label={label}
                />
              )}
            />
            <Bar dataKey="prevWeek" fill={colors["chart-2"]} shape={<RoundedSegment />} barSize={28} />
            <Bar dataKey="orders" fill={colors["chart-1"]} shape={<RoundedSegment />} barSize={28}>
              <LabelList dataKey="orders" position="top" offset={8} fontSize={10} fontWeight={600} fontFamily="Inter" fill={colors["foreground"] || "#888"} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      )}
    </DCard>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PRODUCT CATEGORIES — horizontal progress bars
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const CATEGORY_ICONS = [ShoppingCart, Target, BarChart3, Sparkles, Eye] as const

function ProductCategories({ p }: { p: string[] }) {
  const maxValue = Math.max(...categoryData.map((c) => c.value))

  return (
    <DCard className="p-2xl flex flex-col">
      <div className="flex items-center justify-between mb-lg">
        <h3 className="sp-h4 text-foreground">Product Categories</h3>
        <Badge variant="default" level="secondary" size="sm">{categoryData.length} categories</Badge>
      </div>
      {categoryData.length === 0 ? (
        <EmptyState icon={Package} title="No categories yet" description="Product categories will appear as you add products to your catalog." />
      ) : (
      <div className="flex flex-col">
        {categoryData.map((cat, i) => {
          const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length]
          return (
            <div key={cat.name} className="group py-xs">
              <div className="flex items-center gap-sm mb-xs">
                <div className="size-[28px] shrink-0 rounded-md bg-surface-raised flex items-center justify-center">
                  <Icon className="size-[14px] text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="sp-body-medium text-foreground">{cat.name}</p>
                </div>
                <div className="flex items-baseline gap-3xs">
                  <span className="sp-data text-foreground font-semibold">${(cat.value / 1000).toFixed(1)}k</span>
                  <span className="sp-data-sm text-muted-foreground">{cat.pct}%</span>
                </div>
              </div>
              <div className="relative h-[10px] w-full rounded-sm bg-surface-inset overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-sm transition-all duration-500 group-hover:brightness-125"
                  style={{ width: `${(cat.value / maxValue) * 100}%`, backgroundColor: p[i] }}
                />
              </div>
            </div>
          )
        })}
      </div>
      )}
    </DCard>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   KEY INSIGHTS — summary cards
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const INSIGHTS = [
  { label: "Best Selling Day", value: "Friday", detail: "189 avg orders", icon: BarChart3, change: "+8.0%" },
  { label: "Peak Hour", value: "11:00 AM", detail: "740 visitors", icon: Eye, change: "+22%" },
  { label: "Top Channel", value: "Online Store", detail: "45% of revenue", icon: ShoppingCart, change: "+12.4%" },
  { label: "Highest Growth", value: "Q1 2026", detail: "32.1% QoQ", icon: TrendingUp, change: "+3.6%" },
]


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN — Analytics page
   Layout inspired by monex Financial Analytics:
   - Top: Main chart (col-8) + Summary metrics sidebar (col-4)
   - Middle: 3 equal cards (Revenue Overview, Traffic Sources, Forecast)
   - Bottom: 2 detail cards (Funnel, Daily Orders)
   - Footer: 4 key insights + Product Categories
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export default function AnalyticsPage() {
  const colors = useChartColors()
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [mapError, setMapError] = useState(false)
  const [refreshingFunnel, setRefreshingFunnel] = useState(false)

  const p = useMemo(() => [
    colors["chart-1"] || "#7c3aed",
    colors["chart-2"] || "#22c55e",
    colors["chart-3"] || "#f59e0b",
    colors["chart-4"] || "#c4b5fd",
    colors["chart-5"] || "#86efac",
    colors["chart-6"] || "#fde68a",
  ], [colors])

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

  const handleRetryMap = useCallback(() => {
    setMapError(false)
    toast("Reconnecting to map data...")
  }, [])

  const handleRefreshFunnel = useCallback(() => {
    setRefreshingFunnel(true)
    setTimeout(() => { setRefreshingFunnel(false); toast.success("Funnel data refreshed") }, 800)
  }, [])

  if (loading) return <AnalyticsSkeleton />

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

      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-lg [grid-auto-rows:minmax(115px,auto)] stagger-children">

        {/* ── Row 1: 4 KPI cards ── */}
        {SUMMARY_METRICS.map((m) => (
          <DCard key={m.label} className="md:col-span-3 lg:col-span-3 flex flex-col justify-center gap-xs">
            <div className="flex items-center justify-between">
              <p className="sp-caption text-muted-foreground">{m.label}</p>
              <m.icon className="size-[14px] text-muted-foreground/50" />
            </div>
            <p className="sp-kpi-lg text-foreground">{m.value}</p>
            <div className="flex items-end justify-between">
              <span className={`inline-flex items-center gap-4xs sp-caption font-semibold ${m.up ? "text-success" : "text-destructive"}`}>
                {m.up ? <ArrowUpRight className="size-[11px]" /> : <ArrowDownRight className="size-[11px]" />}
                {m.change}
                <span className="text-muted-foreground font-normal ml-3xs">vs last year</span>
              </span>
              <Sparkline data={m.spark} up={m.up} className="shrink-0" />
            </div>
          </DCard>
        ))}

        {/* ── Row 2-3: Revenue Overview (5) + Traffic Sources (4) + Product Categories (3) ── */}
        <div className="md:col-span-6 lg:col-span-5 lg:row-span-2">
          <RevenueOverview p={p} />
        </div>
        <div className="md:col-span-3 lg:col-span-4 lg:row-span-2">
          <TrafficSources p={p} />
        </div>
        <div className="md:col-span-3 lg:col-span-3 lg:row-span-2">
          <ProductCategories p={p} />
        </div>

        {/* ── Row 4-5: Daily Orders (7) + Revenue Forecast (5) ── */}
        <div className="md:col-span-6 lg:col-span-7 lg:row-span-2 lg:min-h-[330px]">
          <DailyOrders colors={colors} />
        </div>
        <div className="md:col-span-6 lg:col-span-5 lg:row-span-2 lg:min-h-[330px]">
          <RevenueForecast colors={colors} />
        </div>

        {/* ── Row 6-7: Conversion Funnel (4) + Geography (8) ── */}
        <div className="md:col-span-6 lg:col-span-4 lg:row-span-2">
          <ConversionFunnel colors={colors} p={p} refreshing={refreshingFunnel} onRefresh={handleRefreshFunnel} />
        </div>
        <div className="md:col-span-6 lg:col-span-8 lg:row-span-2">
          <GeographySection error={mapError} onRetry={handleRetryMap} />
        </div>

        {/* ── Row 8: 4 Key Insight cards ── */}
        {INSIGHTS.map((insight) => (
          <DCard key={insight.label} className="md:col-span-3 lg:col-span-3 flex flex-col gap-sm">
            <div className="flex items-center justify-between">
              <insight.icon className="size-[16px] text-muted-foreground/60" />
              <span className="inline-flex items-center gap-4xs sp-caption font-semibold text-success">
                <ArrowUpRight className="size-[11px]" /> {insight.change}
              </span>
            </div>
            <div>
              <p className="sp-h4 text-foreground">{insight.value}</p>
              <p className="sp-caption text-muted-foreground mt-3xs">{insight.label}</p>
              <p className="sp-data-sm text-muted-foreground mt-4xs">{insight.detail}</p>
            </div>
          </DCard>
        ))}
      </div>
      </div>
    </TooltipProvider>
  )
}
