import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Search,
  Download,
  Printer,
  FileText,
  RefreshCw,
  WifiOff,
  MoreHorizontal,
  Eye,
  Pencil,
  XCircle,
  Loader2,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"

import { invoices, type Invoice } from "@/data/invoices"

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

function InvoicesSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[100px] rounded-2xl" />)}
      </div>
      <Skeleton className="h-[560px] rounded-2xl" />
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
      <TableCell className="!p-0 text-center"><Skeleton className="size-[16px] rounded mx-auto" /></TableCell>
      <TableCell><div className="flex flex-col gap-2xs"><Skeleton className="h-[14px] w-[80px] rounded" /><Skeleton className="h-[10px] w-[60px] rounded" /></div></TableCell>
      <TableCell><div className="flex flex-col gap-2xs"><Skeleton className="h-[14px] w-[100px] rounded" /><Skeleton className="h-[10px] w-[140px] rounded" /></div></TableCell>
      <TableCell><Skeleton className="h-[22px] w-[70px] rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[55px] rounded" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[55px] rounded" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[70px] rounded" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[70px] rounded" /></TableCell>
      <TableCell className="text-right"><Skeleton className="size-[28px] rounded ml-auto" /></TableCell>
    </TableRow>
  )
}

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const statusConfig: Record<Invoice["status"], { label: string; dotClass: string; badgeClass: string }> = {
  paid: {
    label: "Paid",
    dotClass: "bg-success",
    badgeClass: "bg-success-subtle text-success-subtle-foreground border-success-border/20",
  },
  pending: {
    label: "Pending",
    dotClass: "bg-warning",
    badgeClass: "bg-warning-subtle text-warning-subtle-foreground border-warning-border/20",
  },
  overdue: {
    label: "Overdue",
    dotClass: "bg-destructive animate-pulse",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
  },
  cancelled: {
    label: "Cancelled",
    dotClass: "bg-muted-foreground/40",
    badgeClass: "bg-muted text-muted-foreground border-border/40",
  },
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function InvoicesPage() {
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [statusTab, setStatusTab] = useState("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [detailSheet, setDetailSheet] = useState<string | null>(null)
  const [editSheet, setEditSheet] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<string>("")
  const [editDueDate, setEditDueDate] = useState("")
  const [saving, setSaving] = useState(false)
  const [cancelTarget, setCancelTarget] = useState<Invoice | null>(null)
  const perPage = 10

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

  // Clear selection on filter/page change
  useEffect(() => { setSelected(new Set()) }, [search, statusTab, page])

  // Filter
  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (search) {
        const q = search.toLowerCase()
        if (!inv.id.toLowerCase().includes(q) && !inv.customerName.toLowerCase().includes(q) && !inv.customerEmail.toLowerCase().includes(q) && !inv.orderId.toLowerCase().includes(q)) return false
      }
      if (statusTab !== "all" && inv.status !== statusTab) return false
      return true
    })
  }, [search, statusTab])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // Bulk select
  const allSelected = paginated.length > 0 && paginated.every((inv) => selected.has(inv.id))
  function toggleAll() {
    const next = new Set(selected)
    if (allSelected) paginated.forEach((inv) => next.delete(inv.id))
    else paginated.forEach((inv) => next.add(inv.id))
    setSelected(next)
  }
  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  // KPI
  const totalPaid = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0)
  const totalPending = invoices.filter((i) => i.status === "pending").reduce((s, i) => s + i.total, 0)
  const totalOverdue = invoices.filter((i) => i.status === "overdue").reduce((s, i) => s + i.total, 0)
  const totalInvoices = invoices.length

  // Handlers
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); toast.success("Invoices refreshed") }, 800)
  }, [])

  const openEditSheet = useCallback((invoice: Invoice) => {
    setEditSheet(invoice.id)
    setEditStatus(invoice.status)
    setEditDueDate(invoice.dueDate)
  }, [])

  const handleSaveEdit = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setEditSheet(null)
      toast.success("Invoice updated")
    }, 800)
  }, [])

  const handleCancelConfirm = useCallback(() => {
    if (!cancelTarget) return
    toast.success(`Invoice ${cancelTarget.id} cancelled`)
    setCancelTarget(null)
  }, [cancelTarget])

  const handleBulkExport = useCallback(() => {
    toast(`Exporting ${selected.size} invoices...`)
    setTimeout(() => { toast.success("Export complete"); setSelected(new Set()) }, 800)
  }, [selected.size])

  const handleBulkCancel = useCallback(() => {
    toast.success(`${selected.size} invoice${selected.size > 1 ? "s" : ""} cancelled`)
    setSelected(new Set())
  }, [selected.size])

  const detailInvoice = detailSheet ? invoices.find((i) => i.id === detailSheet) : null
  const editInvoice = editSheet ? invoices.find((i) => i.id === editSheet) : null

  if (loading) return <InvoicesSkeleton />

  const StatusBadge = ({ status }: { status: Invoice["status"] }) => {
    const cfg = statusConfig[status]
    return (
      <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full border sp-caption font-medium ${cfg.badgeClass}`}>
        <span className={`size-[5px] rounded-full ${cfg.dotClass}`} />
        {cfg.label}
      </span>
    )
  }

  const InvoiceActions = ({ invoice }: { invoice: Invoice }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground">
          <MoreHorizontal className="size-[14px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setDetailSheet(invoice.id)}>
          <Eye className="size-[14px]" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openEditSheet(invoice)}>
          <Pencil className="size-[14px]" /> Edit Invoice
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { toast(`Downloading ${invoice.id}...`); setTimeout(() => toast.success("Invoice downloaded"), 800) }}>
          <Download className="size-[14px]" /> Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { toast("Preparing print view..."); setTimeout(() => toast.success("Print dialog opened"), 600) }}>
          <Printer className="size-[14px]" /> Print
        </DropdownMenuItem>
        {invoice.status !== "cancelled" && invoice.status !== "paid" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setCancelTarget(invoice)}>
              <XCircle className="size-[14px]" /> Cancel Invoice
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )

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
              <p className="sp-caption text-muted-foreground">Management</p>
              <h1 className="sp-h3 text-foreground">Invoices</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2xs text-muted-foreground/50 mt-lg">
              <div className="size-[6px] rounded-full bg-success animate-pulse" />
              <span className="sp-caption">Updated just now</span>
            </div>
          </div>
          <div className="flex gap-sm shrink-0">
            <Button variant="outline" className="hidden sm:flex" onClick={() => { toast("Exporting all invoices..."); setTimeout(() => toast.success("Export complete"), 1200) }}>
              <Download className="mr-xs size-[14px]" /> Export
            </Button>
            <Button onClick={() => toast.success("New invoice form coming soon")}>
              <FileText className="mr-xs size-[14px]" /> <span className="hidden sm:inline">New Invoice</span><span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>

        {/* KPI summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
          {[
            { icon: FileText, label: "Total Invoices", value: totalInvoices, iconBg: "bg-primary/10 dark:bg-primary/20", iconColor: "text-primary" },
            { icon: CheckCircle2, label: "Paid", value: `$${(totalPaid / 1_000).toFixed(1)}K`, iconBg: "bg-success-subtle", iconColor: "text-success" },
            { icon: Clock, label: "Pending", value: `$${(totalPending / 1_000).toFixed(1)}K`, iconBg: "bg-warning-subtle", iconColor: "text-warning" },
            { icon: AlertTriangle, label: "Overdue", value: `$${(totalOverdue / 1_000).toFixed(1)}K`, iconBg: "bg-destructive/10 dark:bg-destructive/20", iconColor: "text-destructive" },
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

        {/* Invoices table card */}
        <DCard className="!p-0 overflow-hidden">
          {/* Card header */}
          <div className="relative p-md sm:p-xl pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
              <div className="flex items-center gap-md">
                <div>
                  <h3 className="sp-h4 text-foreground">All Invoices</h3>
                  <p className="sp-caption text-muted-foreground mt-3xs">{filtered.length} invoices found</p>
                </div>
                <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground" onClick={handleRefresh}>
                  <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
              <Tabs value={statusTab} onValueChange={(v) => { setStatusTab(v); setPage(1) }}>
                <TabsList className="rounded-full">
                  <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
                  <TabsTrigger value="paid" className="rounded-full">Paid</TabsTrigger>
                  <TabsTrigger value="pending" className="rounded-full">Pending</TabsTrigger>
                  <TabsTrigger value="overdue" className="rounded-full">Overdue</TabsTrigger>
                  <TabsTrigger value="cancelled" className="rounded-full">Cancelled</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {/* Bulk action overlay */}
            {selected.size > 0 && (
              <div className="absolute inset-0 flex items-center justify-between px-xl bg-background rounded-t-2xl">
                <p className="sp-body-semibold text-primary">{selected.size} invoice{selected.size > 1 ? "s" : ""} selected</p>
                <div className="flex items-center gap-sm">
                  <Button variant="outline" size="sm" onClick={handleBulkExport}>
                    <Download className="size-[13px] mr-xs" /> Export
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleBulkCancel}>
                    <XCircle className="size-[13px] mr-xs" /> Cancel
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => setSelected(new Set())}>
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="px-md sm:px-xl pt-lg">
            <div className="relative">
              <Search className="absolute left-md top-1/2 -translate-y-1/2 size-[14px] text-muted-foreground/50" />
              <Input
                placeholder="Search by invoice ID, order ID, customer or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-2xl"
              />
            </div>
          </div>

          {/* Table */}
          <div className="px-md sm:px-xl pb-xl pt-md overflow-x-auto">
            <Table className="table-fixed min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[32px] !p-0 text-center">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead className="sp-label w-[12%]">Invoice</TableHead>
                  <TableHead className="sp-label w-[22%]">Customer</TableHead>
                  <TableHead className="sp-label w-[12%]">Status</TableHead>
                  <TableHead className="sp-label text-right w-[10%]">Amount</TableHead>
                  <TableHead className="sp-label text-right w-[10%]">Total</TableHead>
                  <TableHead className="sp-label w-[12%]">Issued</TableHead>
                  <TableHead className="sp-label w-[12%]">Due</TableHead>
                  <TableHead className="sp-label text-right w-[6%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refreshing ? (
                  [...Array(perPage)].map((_, i) => <TableRowSkeleton key={i} />)
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="border-0">
                      <EmptyState icon={FileText} title="No invoices found" description="Try adjusting your filters or search terms." />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((invoice) => (
                    <TableRow key={invoice.id} className="group" data-state={selected.has(invoice.id) ? "selected" : undefined}>
                      <TableCell className="!p-0 text-center">
                        <Checkbox checked={selected.has(invoice.id)} onCheckedChange={() => toggleOne(invoice.id)} aria-label={`Select ${invoice.id}`} />
                      </TableCell>
                      <TableCell>
                        <button
                          className="sp-body-semibold text-primary hover:underline text-left"
                          onClick={() => setDetailSheet(invoice.id)}
                        >
                          {invoice.id}
                        </button>
                        <p className="sp-caption text-muted-foreground/60">{invoice.orderId}</p>
                      </TableCell>
                      <TableCell>
                        <div className="min-w-0">
                          <p className="sp-body-semibold text-foreground truncate">{invoice.customerName}</p>
                          <p className="sp-caption text-muted-foreground/60 truncate">{invoice.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell className="text-right sp-data text-muted-foreground">
                        ${invoice.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right sp-body-semibold text-foreground">
                        ${invoice.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="sp-caption text-muted-foreground">
                        {invoice.issuedAt}
                      </TableCell>
                      <TableCell className="sp-caption text-muted-foreground">
                        {invoice.dueDate}
                      </TableCell>
                      <TableCell className="text-right">
                        <InvoiceActions invoice={invoice} />
                      </TableCell>
                    </TableRow>
                  ))
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
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) pageNum = i + 1
                      else if (page <= 3) pageNum = i + 1
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                      else pageNum = page - 2 + i
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink isActive={page === pageNum} onClick={() => setPage(pageNum)} className="cursor-pointer">
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      )
                    })}
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

        {/* Detail Sheet */}
        <Sheet open={detailSheet !== null} onOpenChange={(open) => !open && setDetailSheet(null)}>
          <SheetContent className="sm:max-w-[520px] overflow-y-auto">
            {detailInvoice && (
              <>
                <SheetHeader>
                  <SheetTitle>{detailInvoice.id}</SheetTitle>
                  <SheetDescription>Invoice for {detailInvoice.customerName}</SheetDescription>
                </SheetHeader>
                <div className="mt-xl flex flex-col gap-lg">
                  {/* Status */}
                  <StatusBadge status={detailInvoice.status} />

                  {/* Customer */}
                  <div className="rounded-xl bg-surface-raised/50 dark:bg-surface-inset/50 p-lg">
                    <p className="sp-label text-muted-foreground mb-sm">Customer</p>
                    <p className="sp-body-semibold text-foreground">{detailInvoice.customerName}</p>
                    <p className="sp-caption text-muted-foreground">{detailInvoice.customerEmail}</p>
                  </div>

                  {/* Amounts */}
                  <div className="rounded-xl bg-surface-raised/50 dark:bg-surface-inset/50 p-lg">
                    <p className="sp-label text-muted-foreground mb-sm">Breakdown</p>
                    <div className="flex flex-col gap-xs">
                      <div className="flex items-center justify-between">
                        <span className="sp-body text-muted-foreground">Amount</span>
                        <span className="sp-body text-foreground">${detailInvoice.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="sp-body text-muted-foreground">Tax</span>
                        <span className="sp-body text-foreground">${detailInvoice.tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-border/40 pt-xs mt-xs flex items-center justify-between">
                        <span className="sp-body-semibold text-foreground">Total</span>
                        <span className="sp-body-semibold text-foreground">${detailInvoice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="grid grid-cols-2 gap-md">
                    {[
                      { label: "Order ID", value: detailInvoice.orderId },
                      { label: "Issued At", value: detailInvoice.issuedAt },
                      { label: "Due Date", value: detailInvoice.dueDate },
                      { label: "Paid At", value: detailInvoice.paidAt ?? "—" },
                    ].map((meta) => (
                      <div key={meta.label} className="rounded-xl bg-surface-raised/50 dark:bg-surface-inset/50 p-lg">
                        <p className="sp-caption text-muted-foreground">{meta.label}</p>
                        <p className="sp-body-semibold text-foreground mt-2xs">{meta.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-sm">
                    <Button className="flex-1" onClick={() => { setDetailSheet(null); const inv = detailInvoice; setTimeout(() => openEditSheet(inv), 100) }}>
                      <Pencil className="size-[13px] mr-xs" /> Edit Invoice
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { toast(`Downloading ${detailInvoice.id}...`); setTimeout(() => toast.success("Downloaded"), 800) }}>
                      <Download className="size-[13px] mr-xs" /> Download
                    </Button>
                  </div>
                  {detailInvoice.status !== "cancelled" && detailInvoice.status !== "paid" && (
                    <Button
                      variant="outline"
                      className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => { setDetailSheet(null); const inv = detailInvoice; setTimeout(() => setCancelTarget(invoices.find((x) => x.id === inv.id) ?? null), 100) }}
                    >
                      <XCircle className="size-[13px] mr-xs" /> Cancel Invoice
                    </Button>
                  )}
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Edit Sheet */}
        <Sheet open={editSheet !== null} onOpenChange={(open) => { if (!saving && !open) setEditSheet(null) }}>
          <SheetContent className="sm:max-w-[480px] overflow-y-auto">
            {editInvoice && (
              <>
                <SheetHeader>
                  <SheetTitle>Edit Invoice</SheetTitle>
                  <SheetDescription>{editInvoice.id} · ${editInvoice.total.toFixed(2)}</SheetDescription>
                </SheetHeader>
                <div className="mt-xl flex flex-col gap-lg">
                  {/* Customer info (read-only) */}
                  <div className="rounded-xl bg-surface-raised/50 dark:bg-surface-inset/50 p-lg">
                    <p className="sp-body-semibold text-foreground">{editInvoice.customerName}</p>
                    <p className="sp-caption text-muted-foreground">{editInvoice.customerEmail}</p>
                    <p className="sp-caption text-muted-foreground mt-xs">
                      Order: {editInvoice.orderId} · ${editInvoice.total.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus} disabled={saving}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Due Date</Label>
                    <Input type="date" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} disabled={saving} />
                  </div>
                  <Button onClick={handleSaveEdit} disabled={saving || !editDueDate} className="w-full">
                    {saving ? (
                      <><Loader2 className="size-[14px] mr-xs animate-spin" /> Saving...</>
                    ) : (
                      <><Pencil className="size-[14px] mr-xs" /> Save Changes</>
                    )}
                  </Button>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Cancel Confirmation */}
        <AlertDialog open={cancelTarget !== null} onOpenChange={(open) => !open && setCancelTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel invoice?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel invoice <span className="font-medium text-foreground">{cancelTarget?.id}</span> for {cancelTarget?.customerName} (${cancelTarget?.total.toFixed(2)}). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Invoice</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleCancelConfirm}>
                <XCircle className="size-[14px] mr-xs" /> Cancel Invoice
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
