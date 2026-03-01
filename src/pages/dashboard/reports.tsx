import { useState, useEffect, useCallback } from "react"
import {
  Download,
  FileText,
  Search,
  MoreHorizontal,
  RefreshCw,
  WifiOff,
  Eye,
  Share2,
  Trash2,
  CheckCircle2,
  Clock,
  CalendarClock,
  Plus,
  Loader2,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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

function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-[500px] rounded-2xl" />
    </div>
  )
}

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

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><div className="flex flex-col gap-2xs"><Skeleton className="h-[14px] w-[70%] rounded" /><Skeleton className="h-[10px] w-[40%] rounded" /></div></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[60px] rounded" /></TableCell>
      <TableCell><Skeleton className="h-[22px] w-[80px] rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[80px] rounded" /></TableCell>
      <TableCell><Skeleton className="h-[20px] w-[40px] rounded" /></TableCell>
      <TableCell className="text-right"><Skeleton className="h-[14px] w-[45px] rounded ml-auto" /></TableCell>
      <TableCell className="text-right"><Skeleton className="size-[28px] rounded ml-auto" /></TableCell>
    </TableRow>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Report {
  id: string
  name: string
  type: "revenue" | "customers" | "products" | "channels"
  status: "completed" | "processing" | "scheduled"
  date: string
  size: string
  format: "PDF" | "CSV" | "Excel"
  createdBy: string
}

const reports: Report[] = [
  { id: "RPT-001", name: "Monthly Revenue Summary", type: "revenue", status: "completed", date: "Feb 28, 2026", size: "2.4 MB", format: "PDF", createdBy: "Linh Nguyen" },
  { id: "RPT-002", name: "Customer Growth Analysis", type: "customers", status: "completed", date: "Feb 27, 2026", size: "1.8 MB", format: "CSV", createdBy: "Tùng Trần" },
  { id: "RPT-003", name: "Product Performance Q4", type: "products", status: "completed", date: "Feb 25, 2026", size: "3.1 MB", format: "PDF", createdBy: "Hà Phạm" },
  { id: "RPT-004", name: "Churn Rate Report", type: "customers", status: "processing", date: "Feb 28, 2026", size: "—", format: "Excel", createdBy: "Linh Nguyen" },
  { id: "RPT-005", name: "Revenue by Region", type: "revenue", status: "completed", date: "Feb 24, 2026", size: "4.2 MB", format: "Excel", createdBy: "Tùng Trần" },
  { id: "RPT-006", name: "New Customer Onboarding", type: "customers", status: "completed", date: "Feb 23, 2026", size: "1.1 MB", format: "PDF", createdBy: "Hà Phạm" },
  { id: "RPT-007", name: "Top Products Monthly", type: "products", status: "scheduled", date: "Mar 1, 2026", size: "—", format: "PDF", createdBy: "Linh Nguyen" },
  { id: "RPT-008", name: "Annual Revenue Overview", type: "revenue", status: "completed", date: "Feb 20, 2026", size: "5.6 MB", format: "PDF", createdBy: "Tùng Trần" },
  { id: "RPT-009", name: "Customer Retention Cohort", type: "customers", status: "completed", date: "Feb 18, 2026", size: "2.9 MB", format: "CSV", createdBy: "Hà Phạm" },
  { id: "RPT-010", name: "Inventory Status", type: "products", status: "completed", date: "Feb 15, 2026", size: "1.5 MB", format: "Excel", createdBy: "Linh Nguyen" },
  { id: "RPT-011", name: "MRR Breakdown", type: "revenue", status: "completed", date: "Feb 14, 2026", size: "2.0 MB", format: "CSV", createdBy: "Tùng Trần" },
  { id: "RPT-012", name: "Customer Segmentation", type: "customers", status: "completed", date: "Feb 12, 2026", size: "3.4 MB", format: "PDF", createdBy: "Hà Phạm" },
  { id: "RPT-013", name: "Channel ROAS Analysis", type: "channels", status: "completed", date: "Feb 10, 2026", size: "1.7 MB", format: "PDF", createdBy: "Tùng Trần" },
  { id: "RPT-014", name: "Traffic Sources Breakdown", type: "channels", status: "completed", date: "Feb 8, 2026", size: "2.3 MB", format: "Excel", createdBy: "Linh Nguyen" },
  { id: "RPT-015", name: "Ad Spend vs Revenue", type: "channels", status: "processing", date: "Feb 28, 2026", size: "—", format: "CSV", createdBy: "Tùng Trần" },
  { id: "RPT-016", name: "Social Media Performance", type: "channels", status: "scheduled", date: "Mar 3, 2026", size: "—", format: "PDF", createdBy: "Hà Phạm" },
]

const typeConfig: Record<string, { label: string; color: string; dotColor: string }> = {
  revenue: { label: "Revenue", color: "text-violet-600 dark:text-violet-400", dotColor: "bg-violet-500" },
  customers: { label: "Customers", color: "text-cyan-600 dark:text-cyan-400", dotColor: "bg-cyan-500" },
  products: { label: "Products", color: "text-amber-600 dark:text-amber-400", dotColor: "bg-amber-500" },
  channels: { label: "Channels", color: "text-rose-600 dark:text-rose-400", dotColor: "bg-rose-500" },
}

const statusConfig: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  completed: {
    label: "Completed",
    dotClass: "bg-success",
    badgeClass: "bg-success-subtle text-success-subtle-foreground border-success-border/20",
  },
  processing: {
    label: "Processing",
    dotClass: "bg-warning animate-pulse",
    badgeClass: "bg-warning-subtle text-warning-subtle-foreground border-warning-border/20",
  },
  scheduled: {
    label: "Scheduled",
    dotClass: "bg-muted-foreground/40",
    badgeClass: "bg-muted text-muted-foreground border-border/40",
  },
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [tab, setTab] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [detailSheet, setDetailSheet] = useState<string | null>(null)
  const [generateDialog, setGenerateDialog] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genType, setGenType] = useState("revenue")
  const [genRange, setGenRange] = useState("30d")
  const [genFormat, setGenFormat] = useState("PDF")
  const [refreshing, setRefreshing] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null)
  const perPage = 8

  // Loading simulation
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  // Network detection
  useEffect(() => {
    const goOnline = () => { setConnectionStatus("online"); toast.success("Connection restored") }
    const goOffline = () => { setConnectionStatus("offline"); toast.error("You are offline") }
    window.addEventListener("online", goOnline)
    window.addEventListener("offline", goOffline)
    if (!navigator.onLine) setConnectionStatus("offline")
    return () => { window.removeEventListener("online", goOnline); window.removeEventListener("offline", goOffline) }
  }, [])

  // Filtering
  const filtered = reports.filter((r) => {
    if (tab !== "all" && r.type !== tab) return false
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // KPI counts
  const totalCount = reports.length
  const completedCount = reports.filter((r) => r.status === "completed").length
  const processingCount = reports.filter((r) => r.status === "processing").length
  const scheduledCount = reports.filter((r) => r.status === "scheduled").length

  // Handlers
  const handleDownload = useCallback((report: Report) => {
    toast(`Downloading ${report.name}...`)
    setTimeout(() => toast.success(`${report.name} downloaded`), 800)
  }, [])

  const handleShare = useCallback((report: Report) => {
    navigator.clipboard.writeText(`https://app.shoppulse.io/reports/${report.id}`)
    toast.success("Report link copied to clipboard")
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    toast.success(`${deleteTarget.name} deleted`)
    setDeleteTarget(null)
  }, [deleteTarget])

  const handleExportAll = useCallback(() => {
    toast("Exporting all reports...")
    setTimeout(() => toast.success("All reports exported"), 1200)
  }, [])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); toast.success("Reports refreshed") }, 800)
  }, [])

  const handleGenerate = useCallback(() => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setGenerateDialog(false)
      toast.success("Report generated successfully")
      setGenType("revenue")
      setGenRange("30d")
      setGenFormat("PDF")
    }, 1500)
  }, [])

  // Detail sheet report
  const detailReport = detailSheet ? reports.find((r) => r.id === detailSheet) : null

  if (loading) return <ReportsSkeleton />

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

        {/* Page header */}
        <div className="flex items-center justify-between gap-sm">
          <div className="flex items-center gap-sm sm:gap-lg min-w-0">
            <div>
              <p className="sp-caption text-muted-foreground">Dashboard</p>
              <h1 className="sp-h3 text-foreground">Reports</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2xs text-muted-foreground/50 mt-lg">
              <div className="size-[6px] rounded-full bg-success animate-pulse" />
              <span className="sp-caption">Updated just now</span>
            </div>
          </div>
          <div className="flex gap-sm shrink-0">
            <Button variant="outline" onClick={handleExportAll}>
              <Download className="mr-xs size-[14px]" />
              <span className="hidden sm:inline">Export All</span>
              <span className="sm:hidden">Export</span>
            </Button>
            <Button onClick={() => setGenerateDialog(true)}>
              <Plus className="mr-xs size-[14px]" />
              <span className="hidden sm:inline">Generate Report</span>
              <span className="sm:hidden">Generate</span>
            </Button>
          </div>
        </div>

        {/* KPI summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
          {[
            { icon: FileText, label: "Total Reports", value: totalCount, iconBg: "bg-primary/10 dark:bg-primary/20", iconColor: "text-primary" },
            { icon: CheckCircle2, label: "Completed", value: completedCount, iconBg: "bg-success-subtle", iconColor: "text-success" },
            { icon: Clock, label: "Processing", value: processingCount, iconBg: "bg-warning-subtle", iconColor: "text-warning" },
            { icon: CalendarClock, label: "Scheduled", value: scheduledCount, iconBg: "bg-muted", iconColor: "text-muted-foreground" },
          ].map((kpi) => (
            <DCard key={kpi.label} className="flex flex-col justify-center gap-xs">
              <div className="flex items-center gap-sm">
                <div className={`size-[36px] rounded-lg ${kpi.iconBg} flex items-center justify-center`}>
                  <kpi.icon className={`size-[18px] ${kpi.iconColor}`} />
                </div>
                <div>
                  <p className="sp-kpi-md text-foreground">{kpi.value}</p>
                  <p className="sp-caption text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </DCard>
          ))}
        </div>

        {/* Reports table card */}
        <DCard className="!p-0 overflow-hidden">
          {/* Card header: Title (left) + Tabs (right) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md p-md sm:p-xl pb-0">
            <div className="flex items-center gap-md">
              <div>
                <h3 className="sp-h4 text-foreground">All Reports</h3>
                <p className="sp-caption text-muted-foreground mt-3xs">{filtered.length} reports found</p>
              </div>
              <Button
                variant="ghost"
                size="xs"
                className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground"
                onClick={handleRefresh}
              >
                <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1) }}>
              <TabsList className="rounded-full">
                <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
                <TabsTrigger value="revenue" className="rounded-full">Revenue</TabsTrigger>
                <TabsTrigger value="customers" className="rounded-full">Customers</TabsTrigger>
                <TabsTrigger value="products" className="rounded-full">Products</TabsTrigger>
                <TabsTrigger value="channels" className="rounded-full">Channels</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Search + Status filter */}
          <div className="px-md sm:px-xl pt-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
            <div className="relative flex-1">
              <Search className="absolute left-md top-1/2 -translate-y-1/2 size-[14px] text-muted-foreground/50" />
              <Input
                placeholder="Search reports..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-2xl"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile card list — below md */}
          <div className="md:hidden px-md pt-md pb-xl">
            {refreshing ? (
              <div className="flex flex-col gap-sm">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[90px] rounded-xl" />)}
              </div>
            ) : paginated.length === 0 ? (
              <EmptyState icon={FileText} title="No reports found" description="Try adjusting your filters or generate a new report." />
            ) : (
              <div className="flex flex-col gap-sm">
                {paginated.map((report) => {
                  const type = typeConfig[report.type]
                  const status = statusConfig[report.status]
                  return (
                    <div
                      key={report.id}
                      className="rounded-xl border border-border/60 dark:border-white/[0.06] p-md flex flex-col gap-sm hover:bg-muted/30 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => setDetailSheet(report.id)}
                    >
                      <div className="flex items-start justify-between gap-sm">
                        <div className="min-w-0 flex-1">
                          <p className="sp-body-semibold text-foreground truncate">{report.name}</p>
                          <span className={`inline-flex items-center gap-xs sp-caption mt-3xs ${type.color}`}>
                            <span className={`size-[5px] rounded-full ${type.dotColor}`} />
                            {type.label}
                          </span>
                        </div>
                        <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full border sp-caption font-medium shrink-0 ${status.badgeClass}`}>
                          <span className={`size-[5px] rounded-full ${status.dotClass}`} />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sp-caption text-muted-foreground">
                        <span>{report.date} · <Badge variant="outline" className="sp-caption">{report.format}</Badge></span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Table — md and above */}
          <div className="hidden md:block px-md sm:px-xl pb-xl pt-md overflow-x-auto">
            <Table className="table-fixed min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="sp-label w-[30%]">Name</TableHead>
                  <TableHead className="sp-label w-[13%]">Type</TableHead>
                  <TableHead className="sp-label w-[14%]">Status</TableHead>
                  <TableHead className="sp-label w-[14%]">Date</TableHead>
                  <TableHead className="sp-label w-[10%]">Format</TableHead>
                  <TableHead className="sp-label text-right w-[10%]">Size</TableHead>
                  <TableHead className="sp-label text-right w-[9%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refreshing ? (
                  [...Array(perPage)].map((_, i) => <TableRowSkeleton key={i} />)
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="border-0">
                      <EmptyState
                        icon={FileText}
                        title="No reports found"
                        description="Try adjusting your filters or generate a new report."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((report) => {
                    const type = typeConfig[report.type]
                    const status = statusConfig[report.status]
                    return (
                      <TableRow key={report.id} className="group">
                        <TableCell>
                          <button
                            className="sp-body-semibold text-foreground hover:text-primary transition-colors text-left"
                            onClick={() => setDetailSheet(report.id)}
                          >
                            {report.name}
                          </button>
                          <p className="sp-caption text-muted-foreground/60 mt-3xs">{report.id}</p>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-xs sp-caption ${type.color}`}>
                            <span className={`size-[6px] rounded-full ${type.dotColor}`} />
                            {type.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full border sp-caption font-medium ${status.badgeClass}`}>
                            <span className={`size-[5px] rounded-full ${status.dotClass}`} />
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="sp-caption text-muted-foreground">{report.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="sp-caption">{report.format}</Badge>
                        </TableCell>
                        <TableCell className="text-right sp-caption text-muted-foreground">{report.size}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground"
                              >
                                <MoreHorizontal className="size-[14px]" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setDetailSheet(report.id)}>
                                <Eye className="size-[14px]" /> Preview
                              </DropdownMenuItem>
                              {report.status === "completed" && (
                                <DropdownMenuItem onClick={() => handleDownload(report)}>
                                  <Download className="size-[14px]" /> Download
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleShare(report)}>
                                <Share2 className="size-[14px]" /> Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(report)}>
                                <Trash2 className="size-[14px]" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-lg border-t border-border/40 mt-md">
                <p className="sp-caption text-muted-foreground whitespace-nowrap">
                  Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage(Math.max(1, page - 1))}
                        className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={page === i + 1}
                          onClick={() => setPage(i + 1)}
                          className="cursor-pointer"
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </DCard>

        {/* Report Detail Sheet */}
        <Sheet open={detailSheet !== null} onOpenChange={(open) => !open && setDetailSheet(null)}>
          <SheetContent className="sm:max-w-[480px] overflow-y-auto">
            {detailReport && (
              <>
                <SheetHeader>
                  <SheetTitle>{detailReport.name}</SheetTitle>
                  <SheetDescription>{detailReport.id} · Generated {detailReport.date}</SheetDescription>
                </SheetHeader>
                <div className="mt-xl flex flex-col gap-lg">
                  {/* Status + Type */}
                  <div className="flex items-center gap-sm">
                    {(() => {
                      const status = statusConfig[detailReport.status]
                      return (
                        <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full border sp-caption font-medium ${status.badgeClass}`}>
                          <span className={`size-[5px] rounded-full ${status.dotClass}`} />
                          {status.label}
                        </span>
                      )
                    })()}
                    {(() => {
                      const type = typeConfig[detailReport.type]
                      return (
                        <span className={`inline-flex items-center gap-xs sp-caption ${type.color}`}>
                          <span className={`size-[6px] rounded-full ${type.dotColor}`} />
                          {type.label}
                        </span>
                      )
                    })()}
                  </div>

                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 gap-md">
                    {[
                      { label: "Created", value: detailReport.date },
                      { label: "Created by", value: detailReport.createdBy },
                      { label: "Format", value: detailReport.format },
                      { label: "Size", value: detailReport.size },
                    ].map((meta) => (
                      <div key={meta.label} className="rounded-xl bg-surface-raised/50 dark:bg-surface-inset/50 p-lg">
                        <p className="sp-caption text-muted-foreground">{meta.label}</p>
                        <p className="sp-body-semibold text-foreground mt-2xs">{meta.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Preview placeholder */}
                  <div className="rounded-xl border border-border/40 dark:border-border-subtle bg-muted/30 dark:bg-surface-inset/30 h-[200px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-sm text-muted-foreground/50">
                      <FileText className="size-[32px]" />
                      <p className="sp-caption">Report preview</p>
                    </div>
                  </div>

                  {/* Export actions */}
                  {detailReport.status === "completed" && (
                    <div className="flex flex-col gap-sm">
                      <p className="sp-label text-muted-foreground">Export as</p>
                      <div className="flex gap-sm">
                        {(["PDF", "CSV", "Excel"] as const).map((fmt) => (
                          <Button
                            key={fmt}
                            variant={fmt === detailReport.format ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              toast(`Downloading ${detailReport.name} as ${fmt}...`)
                              setTimeout(() => toast.success(`Downloaded ${fmt}`), 800)
                            }}
                          >
                            <Download className="size-[13px] mr-xs" />
                            {fmt}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailReport.status === "processing" && (
                    <div className="flex flex-col gap-md p-lg rounded-xl bg-warning-subtle border border-warning-border/20">
                      <div className="flex items-center gap-sm">
                        <Loader2 className="size-[16px] text-warning animate-spin" />
                        <p className="sp-body-medium text-warning-subtle-foreground flex-1">Generating report...</p>
                        <span className="sp-caption text-warning-subtle-foreground">67%</span>
                      </div>
                      <Progress value={67} className="h-[4px]" />
                    </div>
                  )}

                  {detailReport.status === "scheduled" && (
                    <div className="flex items-center gap-sm p-lg rounded-xl bg-muted border border-border/40">
                      <CalendarClock className="size-[16px] text-muted-foreground" />
                      <p className="sp-body-medium text-muted-foreground">Scheduled for {detailReport.date}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation */}
        <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete report?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete <span className="font-medium text-foreground">{deleteTarget?.name}</span>. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDeleteConfirm}
              >
                <Trash2 className="size-[14px] mr-xs" />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Generate Report Dialog */}
        <Dialog open={generateDialog} onOpenChange={(open) => { if (!generating) setGenerateDialog(open) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Report</DialogTitle>
              <DialogDescription>Select report type, date range, and export format.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-lg pt-md">
              <div className="flex flex-col gap-2xs">
                <Label className="sp-label">Report Type</Label>
                <Select value={genType} onValueChange={setGenType} disabled={generating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                    <SelectItem value="products">Products</SelectItem>
                    <SelectItem value="channels">Channels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2xs">
                <Label className="sp-label">Date Range</Label>
                <Select value={genRange} onValueChange={setGenRange} disabled={generating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="14d">Last 14 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2xs">
                <Label className="sp-label">Format</Label>
                <Select value={genFormat} onValueChange={setGenFormat} disabled={generating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="CSV">CSV</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleGenerate} disabled={generating} className="w-full mt-sm">
                {generating ? (
                  <>
                    <Loader2 className="size-[14px] mr-xs animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="size-[14px] mr-xs" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
