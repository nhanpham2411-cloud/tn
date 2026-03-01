import { useState, useEffect, useCallback } from "react"
import {
  Check,
  CreditCard,
  Download,
  RefreshCw,
  WifiOff,
  Zap,
  BarChart3,
  Users,
  HardDrive,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function DCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`rounded-2xl border-border/60 dark:border-border-subtle shadow-none p-xl h-full ${className}`}>
      {children}
    </Card>
  )
}

function BillingSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <Skeleton className="h-[10px] w-[60px] rounded" />
      <Skeleton className="h-[28px] w-[100px] rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[90px] rounded-2xl" />)}
      </div>
      <Skeleton className="h-[280px] rounded-2xl" />
      <Skeleton className="h-[200px] rounded-2xl" />
      <Skeleton className="h-[200px] rounded-2xl" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const plans = [
  {
    name: "Free",
    price: 0,
    features: ["5 projects", "1 GB storage", "Basic analytics", "Email support"],
    current: false,
  },
  {
    name: "Pro",
    price: 29,
    features: ["Unlimited projects", "50 GB storage", "Advanced analytics", "Priority support", "API access", "Custom reports"],
    current: false,
  },
  {
    name: "Enterprise",
    price: 99,
    features: ["Everything in Pro", "Unlimited storage", "SSO & SAML", "Dedicated account manager", "SLA guarantee", "Custom integrations", "Audit logs"],
    current: true,
  },
]

const usage = [
  { label: "Storage", used: 32.4, total: 100, unit: "GB", icon: HardDrive, color: "text-primary", bg: "bg-primary/10 dark:bg-primary/20" },
  { label: "API Calls", used: 847000, total: 1000000, unit: "calls", icon: BarChart3, color: "text-success", bg: "bg-success-subtle" },
  { label: "Team Members", used: 12, total: 50, unit: "seats", icon: Users, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10 dark:bg-violet-500/20" },
  { label: "Projects", used: 8, total: -1, unit: "projects", icon: Zap, color: "text-warning", bg: "bg-warning-subtle" },
]

const billingHistory = [
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: 99.00, status: "paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: 99.00, status: "paid" },
  { id: "INV-2025-012", date: "Dec 1, 2025", amount: 99.00, status: "paid" },
  { id: "INV-2025-011", date: "Nov 1, 2025", amount: 99.00, status: "paid" },
  { id: "INV-2025-010", date: "Oct 1, 2025", amount: 29.00, status: "paid" },
  { id: "INV-2025-009", date: "Sep 1, 2025", amount: 29.00, status: "paid" },
]

function formatUsage(used: number, unit: string): string {
  if (unit === "calls") return `${(used / 1000).toFixed(0)}K`
  if (unit === "GB") return `${used} GB`
  return `${used}`
}

function formatTotal(total: number, unit: string): string {
  if (total === -1) return "Unlimited"
  if (unit === "calls") return `${(total / 1000000).toFixed(0)}M`
  if (unit === "GB") return `${total} GB`
  return `${total}`
}

const statusBadgeClass: Record<string, string> = {
  paid: "bg-success-subtle text-success-subtle-foreground border-success-border/20",
  pending: "bg-warning-subtle text-warning-subtle-foreground border-warning-border/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [refreshing, setRefreshing] = useState(false)

  // Loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  // Network
  useEffect(() => {
    const goOnline = () => { setConnectionStatus("online"); toast.success("Connection restored") }
    const goOffline = () => { setConnectionStatus("offline"); toast.error("You are offline") }
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    if (!navigator.onLine) setConnectionStatus("offline")
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline) }
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); toast.success("Billing refreshed") }, 800)
  }, [])

  if (loading) return <BillingSkeleton />

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-lg">
        {/* Offline banner */}
        {connectionStatus === "offline" && (
          <div className="flex items-center gap-sm px-lg py-sm rounded-xl bg-warning-subtle border border-warning-border/20 text-warning-subtle-foreground">
            <WifiOff className="size-[16px] shrink-0" />
            <p className="sp-body-medium flex-1">You're offline. Billing data may not be current.</p>
            <Button variant="ghost" size="xs" className="text-warning-subtle-foreground hover:text-warning" onClick={() => window.location.reload()}>
              <RefreshCw className="size-[13px]" /> Reconnect
            </Button>
          </div>
        )}

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-lg">
            <div>
              <p className="sp-caption text-muted-foreground">Settings</p>
              <h1 className="sp-h3 text-foreground">Billing</h1>
            </div>
            <div className="flex items-center gap-2xs text-muted-foreground/50 mt-lg">
              <div className="size-[6px] rounded-full bg-success animate-pulse" />
              <span className="sp-caption">Updated just now</span>
            </div>
          </div>
          <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground" onClick={handleRefresh}>
            <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Usage KPI cards */}
        {refreshing ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[90px] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
            {usage.map((item) => (
              <DCard key={item.label} className="flex flex-col justify-center gap-xs">
                <div className="flex items-center gap-sm">
                  <div className={`size-[36px] rounded-lg ${item.bg} flex items-center justify-center`}>
                    <item.icon className={`size-[18px] ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="sp-body-semibold text-foreground">{formatUsage(item.used, item.unit)}</p>
                    <p className="sp-caption text-muted-foreground">{item.label}</p>
                  </div>
                </div>
                {item.total !== -1 && (
                  <Progress value={(item.used / item.total) * 100} className="h-1.5 mt-xs" />
                )}
                <p className="sp-caption text-muted-foreground/60">
                  {item.total === -1 ? "Unlimited" : `of ${formatTotal(item.total, item.unit)}`}
                </p>
              </DCard>
            ))}
          </div>
        )}

        {refreshing ? (
          <>
            <Skeleton className="h-[280px] rounded-2xl" />
            <Skeleton className="h-[120px] rounded-2xl" />
            <Skeleton className="h-[300px] rounded-2xl" />
          </>
        ) : (
          <>
            {/* Current Plan */}
            <DCard>
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <h3 className="sp-h4 text-foreground">Current Plan</h3>
                  <p className="sp-caption text-muted-foreground mt-3xs">You are on the Enterprise plan</p>
                </div>
                <span className="inline-flex items-center gap-xs px-sm py-3xs rounded-full bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 sp-caption font-medium">
                  <Zap className="size-[10px]" /> Enterprise
                </span>
              </div>
              <div className="grid gap-lg md:grid-cols-3">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`rounded-xl border p-lg flex flex-col gap-md transition-colors ${
                      plan.current
                        ? "border-primary bg-primary/5 dark:bg-primary/10"
                        : "border-border/60 dark:border-border-subtle"
                    }`}
                  >
                    <div>
                      <h3 className="sp-h4 text-foreground">{plan.name}</h3>
                      <div className="flex items-baseline gap-3xs mt-xs">
                        <span className="sp-kpi-lg text-foreground">${plan.price}</span>
                        <span className="sp-caption text-muted-foreground">/month</span>
                      </div>
                    </div>
                    <ul className="flex flex-col gap-xs flex-1">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-xs">
                          <Check className="size-[14px] text-primary shrink-0" />
                          <span className="sp-caption text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.current ? "outline" : "default"}
                      className="w-full"
                      disabled={plan.current}
                      onClick={() => !plan.current && toast.success(`Switching to ${plan.name} plan...`)}
                    >
                      {plan.current ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                    </Button>
                  </div>
                ))}
              </div>
            </DCard>

            {/* Payment Method */}
            <DCard>
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <h3 className="sp-h4 text-foreground">Payment Method</h3>
                  <p className="sp-caption text-muted-foreground mt-3xs">Manage your payment details</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success("Opening payment settings...")}>
                  Update
                </Button>
              </div>
              <div className="flex items-center gap-md rounded-xl border border-border/60 dark:border-border-subtle p-lg">
                <div className="size-[40px] rounded-lg bg-muted flex items-center justify-center">
                  <CreditCard className="size-[18px] text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="sp-body-semibold text-foreground">Visa ending in 4242</p>
                  <p className="sp-caption text-muted-foreground">Expires 12/2027</p>
                </div>
                <Badge variant="outline" className="sp-caption">Default</Badge>
              </div>
            </DCard>

            {/* Billing History */}
            <DCard className="!p-0 overflow-hidden">
              <div className="p-xl pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="sp-h4 text-foreground">Billing History</h3>
                    <p className="sp-caption text-muted-foreground mt-3xs">Download past invoices</p>
                  </div>
                </div>
              </div>
              <div className="px-xl pb-xl pt-md">
                <Table className="table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="sp-label w-[25%]">Invoice</TableHead>
                      <TableHead className="sp-label w-[25%]">Date</TableHead>
                      <TableHead className="sp-label text-right w-[20%]">Amount</TableHead>
                      <TableHead className="sp-label w-[20%]">Status</TableHead>
                      <TableHead className="sp-label text-right w-[10%]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingHistory.map((invoice) => (
                      <TableRow key={invoice.id} className="group">
                        <TableCell className="sp-body-semibold text-foreground">{invoice.id}</TableCell>
                        <TableCell className="sp-caption text-muted-foreground">{invoice.date}</TableCell>
                        <TableCell className="text-right sp-body-semibold text-foreground">${invoice.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full border sp-caption font-medium capitalize ${statusBadgeClass[invoice.status] ?? statusBadgeClass.paid}`}>
                            <span className="size-[5px] rounded-full bg-success" />
                            {invoice.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground" onClick={() => { toast(`Downloading ${invoice.id}...`); setTimeout(() => toast.success("Downloaded"), 800) }}>
                            <Download className="size-[14px]" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="sp-caption text-muted-foreground/60 text-center pt-lg border-t border-border/40 mt-md">
                  Need help with billing? Contact support at billing@shoppulse.io
                </p>
              </div>
            </DCard>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
