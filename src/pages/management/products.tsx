import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  MoreHorizontal,
  Star,
  RefreshCw,
  WifiOff,
  Loader2,
  Package,
  DollarSign,
  TrendingUp,
  Eye,
  Pencil,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import { Checkbox } from "@/components/ui/checkbox"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"

import { products, type Product } from "@/data/products"

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

function ProductsSkeleton() {
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
      <TableCell className="!p-0 text-center"><Skeleton className="size-[16px] rounded mx-auto" /></TableCell>
      <TableCell><div className="flex items-center gap-sm"><Skeleton className="size-[40px] rounded-lg" /><div className="flex flex-col gap-2xs"><Skeleton className="h-[14px] w-[120px] rounded" /><Skeleton className="h-[10px] w-[60px] rounded" /></div></div></TableCell>
      <TableCell><Skeleton className="h-[22px] w-[70px] rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[50px] rounded" /></TableCell>
      <TableCell><Skeleton className="h-[22px] w-[60px] rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[50px] rounded" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[32px] rounded" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[30px] rounded" /></TableCell>
      <TableCell className="text-right"><Skeleton className="size-[28px] rounded ml-auto" /></TableCell>
    </TableRow>
  )
}

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const statusConfig: Record<string, { label: string; dotClass: string; badgeClass: string }> = {
  active: {
    label: "Active",
    dotClass: "bg-success",
    badgeClass: "bg-success-subtle text-success-subtle-foreground border-success-border/20",
  },
  draft: {
    label: "Draft",
    dotClass: "bg-warning",
    badgeClass: "bg-warning-subtle text-warning-subtle-foreground border-warning-border/20",
  },
  archived: {
    label: "Archived",
    dotClass: "bg-muted-foreground/40",
    badgeClass: "bg-muted text-muted-foreground border-border/40",
  },
}

const categoryColors: Record<string, string> = {
  electronics: "text-violet-600 dark:text-violet-400",
  fashion: "text-cyan-600 dark:text-cyan-400",
  accessories: "text-amber-600 dark:text-amber-400",
  sports: "text-rose-600 dark:text-rose-400",
  home: "text-emerald-600 dark:text-emerald-400",
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProductsPage() {
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusTab, setStatusTab] = useState("all")
  const [view, setView] = useState<"grid" | "list">("list")
  const [page, setPage] = useState(1)
  const [refreshing, setRefreshing] = useState(false)
  const [addDialog, setAddDialog] = useState(false)
  const [adding, setAdding] = useState(false)
  const [addName, setAddName] = useState("")
  const [addCategory, setAddCategory] = useState("electronics")
  const [addPrice, setAddPrice] = useState("")
  const [addStock, setAddStock] = useState("")
  const [detailSheet, setDetailSheet] = useState<string | null>(null)
  const [editSheet, setEditSheet] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editPrice, setEditPrice] = useState("")
  const [editStock, setEditStock] = useState("")
  const [editStatus, setEditStatus] = useState("active")
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const perPage = view === "grid" ? 12 : 10

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

  // Filtering
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (statusTab !== "all" && p.status !== statusTab) return false
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [search, categoryFilter, statusTab])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // Bulk select
  const allSelected = paginated.length > 0 && paginated.every((p) => selected.has(p.id))
  function toggleAll() {
    const next = new Set(selected)
    if (allSelected) paginated.forEach((p) => next.delete(p.id))
    else paginated.forEach((p) => next.add(p.id))
    setSelected(next)
  }
  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  // KPI
  const totalCount = products.length
  const activeCount = products.filter((p) => p.status === "active").length
  const totalRevenue = products.reduce((sum, p) => sum + p.price * p.sales, 0)
  const avgRating = (products.reduce((sum, p) => sum + p.rating, 0) / products.length).toFixed(1)

  // Handlers
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); toast.success("Products refreshed") }, 800)
  }, [])

  const handleAdd = useCallback(() => {
    setAdding(true)
    setTimeout(() => {
      setAdding(false)
      setAddDialog(false)
      toast.success("Product added successfully")
      setAddName("")
      setAddCategory("electronics")
      setAddPrice("")
      setAddStock("")
    }, 1500)
  }, [])

  const handleDuplicate = useCallback((product: Product) => {
    toast.success(`${product.name} duplicated`)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    toast.success(`${deleteTarget.name} archived`)
    setDeleteTarget(null)
  }, [deleteTarget])

  const handleBulkExport = useCallback(() => {
    toast(`Exporting ${selected.size} products...`)
    setTimeout(() => { toast.success("Export complete"); setSelected(new Set()) }, 800)
  }, [selected.size])

  const handleBulkArchive = useCallback(() => {
    toast.success(`${selected.size} product${selected.size > 1 ? "s" : ""} archived`)
    setSelected(new Set())
  }, [selected.size])

  const openEditSheet = useCallback((product: Product) => {
    setEditSheet(product.id)
    setEditName(product.name)
    setEditPrice(String(product.price))
    setEditStock(String(product.stock))
    setEditStatus(product.status)
  }, [])

  const handleSaveEdit = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setEditSheet(null)
      toast.success("Product updated")
    }, 800)
  }, [])

  const detailProduct = detailSheet ? products.find((p) => p.id === detailSheet) : null
  const editProduct = editSheet ? products.find((p) => p.id === editSheet) : null
  const [detailImageIdx, setDetailImageIdx] = useState(0)

  // Reset image index when detail sheet changes
  useEffect(() => { setDetailImageIdx(0) }, [detailSheet])

  if (loading) return <ProductsSkeleton />

  const StatusBadge = ({ status }: { status: string }) => {
    const cfg = statusConfig[status]
    return (
      <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full border sp-caption font-medium ${cfg.badgeClass}`}>
        <span className={`size-[5px] rounded-full ${cfg.dotClass}`} />
        {cfg.label}
      </span>
    )
  }

  const ProductActions = ({ product }: { product: Product }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground">
          <MoreHorizontal className="size-[14px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setDetailSheet(product.id)}>
          <Eye className="size-[14px]" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openEditSheet(product)}>
          <Pencil className="size-[14px]" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicate(product)}>
          <Copy className="size-[14px]" /> Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(product)}>
          <Trash2 className="size-[14px]" /> Archive
        </DropdownMenuItem>
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
              <h1 className="sp-h3 text-foreground">Products</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2xs text-muted-foreground/50 mt-lg">
              <div className="size-[6px] rounded-full bg-success animate-pulse" />
              <span className="sp-caption">Updated just now</span>
            </div>
          </div>
          <Button onClick={() => setAddDialog(true)} className="shrink-0">
            <Plus className="mr-xs size-[14px]" />
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* KPI summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
          {[
            { icon: Package, label: "Total Products", value: totalCount, iconBg: "bg-primary/10 dark:bg-primary/20", iconColor: "text-primary" },
            { icon: Package, label: "Active", value: activeCount, iconBg: "bg-success-subtle", iconColor: "text-success" },
            { icon: DollarSign, label: "Total Revenue", value: `$${(totalRevenue / 1_000_000).toFixed(1)}M`, iconBg: "bg-violet-100 dark:bg-violet-500/20", iconColor: "text-violet-600 dark:text-violet-400" },
            { icon: TrendingUp, label: "Avg Rating", value: avgRating, iconBg: "bg-amber-100 dark:bg-amber-500/20", iconColor: "text-amber-600 dark:text-amber-400" },
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

        {/* Products card */}
        <DCard className="!p-0 overflow-hidden">
          {/* Card header: Title + Refresh (left) | Tabs + View toggle (right) */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-md p-md sm:p-xl pb-0">
            <div className="flex items-center gap-md">
              <div>
                <h3 className="sp-h4 text-foreground">All Products</h3>
                <p className="sp-caption text-muted-foreground mt-3xs">{filtered.length} products found</p>
              </div>
              <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground" onClick={handleRefresh}>
                <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <div className="flex items-center gap-md">
              <Tabs value={statusTab} onValueChange={(v) => { setStatusTab(v); setPage(1) }}>
                <TabsList className="rounded-full">
                  <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
                  <TabsTrigger value="active" className="rounded-full">Active</TabsTrigger>
                  <TabsTrigger value="draft" className="rounded-full">Draft</TabsTrigger>
                  <TabsTrigger value="archived" className="rounded-full">Archived</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-3xs border border-border/60 rounded-lg p-3xs">
                <Button
                  variant={view === "list" ? "secondary" : "ghost"}
                  size="xs"
                  className="size-[28px] p-0"
                  onClick={() => { setView("list"); setPage(1) }}
                  aria-label="List view"
                >
                  <List className="size-[14px]" />
                </Button>
                <Button
                  variant={view === "grid" ? "secondary" : "ghost"}
                  size="xs"
                  className="size-[28px] p-0"
                  onClick={() => { setView("grid"); setPage(1) }}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-[14px]" />
                </Button>
              </div>
            </div>
            {/* Bulk action overlay */}
            {selected.size > 0 && (
              <div className="absolute inset-0 flex items-center justify-between px-xl bg-background rounded-t-2xl">
                <p className="sp-body-semibold text-primary">{selected.size} product{selected.size > 1 ? "s" : ""} selected</p>
                <div className="flex items-center gap-sm">
                  <Button variant="outline" size="sm" onClick={handleBulkExport}>
                    <Download className="size-[13px] mr-xs" /> Export
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleBulkArchive}>
                    <Trash2 className="size-[13px] mr-xs" /> Archive
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => setSelected(new Set())}>
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Search + Category filter */}
          <div className="px-md sm:px-xl pt-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
            <div className="relative flex-1">
              <Search className="absolute left-md top-1/2 -translate-y-1/2 size-[14px] text-muted-foreground/50" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-2xl"
              />
            </div>
            <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="home">Home</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile card list — below md (always shows cards regardless of view toggle) */}
          <div className="md:hidden px-md pt-md pb-xl">
            {refreshing ? (
              <div className="flex flex-col gap-sm">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[100px] rounded-xl" />)}
              </div>
            ) : paginated.length === 0 ? (
              <EmptyState icon={Package} title="No products found" description="Try adjusting your filters or add a new product." />
            ) : (
              <div className="flex flex-col gap-sm">
                {paginated.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-border/60 dark:border-white/[0.06] p-md flex items-center gap-md hover:bg-muted/30 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setDetailSheet(product.id)}
                  >
                    <div className="size-[48px] rounded-lg ring-1 ring-border/20 bg-surface-raised/50 dark:bg-surface-inset/50 overflow-hidden shrink-0">
                      <img src={product.imageUrl} alt={product.name} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="sp-body-semibold text-foreground truncate">{product.name}</p>
                      <div className="flex items-center gap-sm sp-caption text-muted-foreground mt-3xs">
                        <span className={`capitalize ${categoryColors[product.category] ?? ""}`}>{product.category}</span>
                        <span>·</span>
                        <span className="text-foreground font-semibold">${product.price}</span>
                        <span>·</span>
                        <span className="flex items-center gap-3xs"><Star className="size-[10px] fill-current text-amber-500" />{product.rating}</span>
                      </div>
                    </div>
                    <StatusBadge status={product.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Content — md and above */}
          <div className="hidden md:block px-md sm:px-xl pb-xl pt-md overflow-x-auto">
            {view === "list" ? (
              /* List View */
              <Table className="table-fixed min-w-[700px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[32px] !p-0 text-center"><Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" /></TableHead>
                    <TableHead className="sp-label w-[28%]">Product</TableHead>
                    <TableHead className="sp-label w-[13%]">Category</TableHead>
                    <TableHead className="sp-label w-[10%]">Price</TableHead>
                    <TableHead className="sp-label w-[12%]">Status</TableHead>
                    <TableHead className="sp-label w-[10%]">Sales</TableHead>
                    <TableHead className="sp-label w-[9%]">Rating</TableHead>
                    <TableHead className="sp-label w-[8%]">Stock</TableHead>
                    <TableHead className="sp-label text-right w-[7%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {refreshing ? (
                    [...Array(perPage)].map((_, i) => <TableRowSkeleton key={i} />)
                  ) : paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="border-0">
                        <EmptyState icon={Package} title="No products found" description="Try adjusting your filters or add a new product." />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((product) => (
                      <TableRow key={product.id} data-state={selected.has(product.id) ? "selected" : undefined}>
                        <TableCell className="!p-0 text-center"><Checkbox checked={selected.has(product.id)} onCheckedChange={() => toggleOne(product.id)} aria-label={`Select ${product.name}`} /></TableCell>
                        <TableCell>
                          <div className="flex items-center gap-sm">
                            <div className="size-[40px] rounded-lg ring-1 ring-border/20 bg-surface-raised/50 dark:bg-surface-inset/50 overflow-hidden shrink-0">
                              <img src={product.imageUrl} alt={product.name} className="size-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.nextElementSibling?.classList.remove("hidden") }} />
                              <span className="hidden sp-caption text-muted-foreground size-full flex items-center justify-center">{product.image}</span>
                            </div>
                            <div>
                              <button className="sp-body-semibold text-foreground hover:text-primary transition-colors text-left" onClick={() => setDetailSheet(product.id)}>
                                {product.name}
                              </button>
                              <p className="sp-caption text-muted-foreground/60">{product.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`sp-caption capitalize ${categoryColors[product.category] ?? "text-muted-foreground"}`}>{product.category}</span>
                        </TableCell>
                        <TableCell className="sp-body-semibold text-foreground">${product.price}</TableCell>
                        <TableCell><StatusBadge status={product.status} /></TableCell>
                        <TableCell className="sp-caption text-muted-foreground">{product.sales.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3xs">
                            <Star className="size-[12px] fill-current text-amber-500" />
                            <span className="sp-caption">{product.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell className="sp-caption text-muted-foreground">{product.stock}</TableCell>
                        <TableCell className="text-right">
                          <ProductActions product={product} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            ) : (
              /* Grid View */
              refreshing ? (
                <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(Math.min(perPage, 6))].map((_, i) => (
                    <Skeleton key={i} className="h-[260px] rounded-2xl" />
                  ))}
                </div>
              ) : paginated.length === 0 ? (
                <EmptyState icon={Package} title="No products found" description="Try adjusting your filters or add a new product." />
              ) : (
                <div className="grid gap-lg sm:grid-cols-2 lg:grid-cols-3">
                  {paginated.map((product) => (
                    <DCard key={product.id} className="!p-0 overflow-hidden flex flex-col">
                      <div className="flex h-[140px] items-center justify-center bg-surface-raised/50 dark:bg-surface-inset/50 relative p-lg">
                        <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" onError={(e) => { e.currentTarget.style.display = "none" }} />
                        <div className="absolute top-md right-md">
                          <ProductActions product={product} />
                        </div>
                      </div>
                      <div className="p-lg flex flex-col gap-sm flex-1">
                        <div className="flex items-start justify-between gap-sm">
                          <div className="flex-1 min-w-0">
                            <button className="sp-body-semibold text-foreground hover:text-primary transition-colors text-left truncate block w-full" onClick={() => setDetailSheet(product.id)}>
                              {product.name}
                            </button>
                            <p className={`sp-caption capitalize mt-3xs ${categoryColors[product.category] ?? "text-muted-foreground"}`}>{product.category}</p>
                          </div>
                          <StatusBadge status={product.status} />
                        </div>
                        <div className="flex items-center justify-between mt-auto">
                          <span className="sp-body-semibold text-foreground">${product.price}</span>
                          <div className="flex items-center gap-3xs text-muted-foreground">
                            <Star className="size-[12px] fill-current text-amber-500" />
                            <span className="sp-caption">{product.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="sp-caption">{product.sales.toLocaleString()} sales</span>
                          <span className="sp-caption">{product.stock} in stock</span>
                        </div>
                      </div>
                    </DCard>
                  ))}
                </div>
              )
            )}

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

        {/* Product Detail Sheet */}
        <Sheet open={detailSheet !== null} onOpenChange={(open) => !open && setDetailSheet(null)}>
          <SheetContent className="sm:max-w-[480px] overflow-y-auto">
            {detailProduct && (
              <>
                <SheetHeader>
                  <SheetTitle>{detailProduct.name}</SheetTitle>
                  <SheetDescription>{detailProduct.id} · {detailProduct.category}</SheetDescription>
                </SheetHeader>
                <div className="mt-xl flex flex-col gap-lg">
                  {/* Image gallery */}
                  <div className="flex flex-col gap-sm">
                    <div className="rounded-xl overflow-hidden bg-surface-raised/50 dark:bg-surface-inset/50 h-[240px] flex items-center justify-center relative p-xl">
                      <img
                        src={detailProduct.images[detailImageIdx] ?? detailProduct.imageUrl}
                        alt={detailProduct.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = "none" }}
                      />
                      {detailProduct.images.length > 1 && (
                        <>
                          <button
                            className="absolute left-sm top-1/2 -translate-y-1/2 size-[28px] rounded-full bg-background/80 dark:bg-background/60 backdrop-blur-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setDetailImageIdx((prev) => (prev - 1 + detailProduct.images.length) % detailProduct.images.length)}
                          >
                            <ChevronLeft className="size-[14px]" />
                          </button>
                          <button
                            className="absolute right-sm top-1/2 -translate-y-1/2 size-[28px] rounded-full bg-background/80 dark:bg-background/60 backdrop-blur-sm border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setDetailImageIdx((prev) => (prev + 1) % detailProduct.images.length)}
                          >
                            <ChevronRight className="size-[14px]" />
                          </button>
                        </>
                      )}
                    </div>
                    {detailProduct.images.length > 1 && (
                      <div className="flex items-center gap-xs overflow-x-auto">
                        {detailProduct.images.map((img, idx) => (
                          <button
                            key={idx}
                            className={`size-[48px] rounded-lg overflow-hidden border-2 shrink-0 bg-surface-raised/50 dark:bg-surface-inset/50 transition-colors ${idx === detailImageIdx ? "border-primary" : "border-transparent hover:border-border/60"}`}
                            onClick={() => setDetailImageIdx(idx)}
                          >
                            <img src={img} alt={`${detailProduct.name} ${idx + 1}`} className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-sm">
                    <StatusBadge status={detailProduct.status} />
                    <span className={`sp-caption capitalize ${categoryColors[detailProduct.category]}`}>{detailProduct.category}</span>
                  </div>
                  <p className="sp-body text-muted-foreground">{detailProduct.description}</p>
                  <div className="grid grid-cols-2 gap-md">
                    {[
                      { label: "Price", value: `$${detailProduct.price}` },
                      { label: "Stock", value: `${detailProduct.stock} units` },
                      { label: "Sales", value: detailProduct.sales.toLocaleString() },
                      { label: "Rating", value: `${detailProduct.rating} / 5.0` },
                      { label: "Revenue", value: `$${(detailProduct.price * detailProduct.sales).toLocaleString()}` },
                      { label: "Created", value: detailProduct.createdAt },
                    ].map((meta) => (
                      <div key={meta.label} className="rounded-xl bg-surface-raised/50 dark:bg-surface-inset/50 p-lg">
                        <p className="sp-caption text-muted-foreground">{meta.label}</p>
                        <p className="sp-body-semibold text-foreground mt-2xs">{meta.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-sm">
                    <Button className="flex-1" onClick={() => { setDetailSheet(null); const p = detailProduct; setTimeout(() => openEditSheet(p), 100) }}>
                      <Pencil className="size-[13px] mr-xs" /> Edit Product
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => { handleDuplicate(detailProduct); setDetailSheet(null) }}>
                      <Copy className="size-[13px] mr-xs" /> Duplicate
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Edit Product Sheet */}
        <Sheet open={editSheet !== null} onOpenChange={(open) => { if (!saving && !open) setEditSheet(null) }}>
          <SheetContent className="sm:max-w-[480px] overflow-y-auto">
            {editProduct && (
              <>
                <SheetHeader>
                  <SheetTitle>Edit Product</SheetTitle>
                  <SheetDescription>{editProduct.id}</SheetDescription>
                </SheetHeader>
                <div className="mt-xl flex flex-col gap-lg">
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Name</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} disabled={saving} />
                  </div>
                  <div className="grid grid-cols-2 gap-md">
                    <div className="flex flex-col gap-2xs">
                      <Label className="sp-label">Price ($)</Label>
                      <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} disabled={saving} />
                    </div>
                    <div className="flex flex-col gap-2xs">
                      <Label className="sp-label">Stock</Label>
                      <Input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} disabled={saving} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Status</Label>
                    <Select value={editStatus} onValueChange={setEditStatus} disabled={saving}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveEdit} disabled={saving || !editName.trim() || !editPrice.trim() || Number(editPrice) <= 0} className="w-full">
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

        {/* Delete Confirmation */}
        <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Archive product?</AlertDialogTitle>
              <AlertDialogDescription>
                This will archive <span className="font-medium text-foreground">{deleteTarget?.name}</span>. You can restore it later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteConfirm}>
                <Trash2 className="size-[14px] mr-xs" /> Archive
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Product Dialog */}
        <Dialog open={addDialog} onOpenChange={(open) => { if (!adding) setAddDialog(open) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
              <DialogDescription>Create a new product for your catalog.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-lg pt-md">
              <div className="flex flex-col gap-2xs">
                <Label className="sp-label">Product Name</Label>
                <Input placeholder="My Product" value={addName} onChange={(e) => setAddName(e.target.value)} disabled={adding} />
              </div>
              <div className="flex flex-col gap-2xs">
                <Label className="sp-label">Category</Label>
                <Select value={addCategory} onValueChange={setAddCategory} disabled={adding}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electronics">Electronics</SelectItem>
                    <SelectItem value="fashion">Fashion</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="home">Home</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div className="flex flex-col gap-2xs">
                  <Label className="sp-label">Price ($)</Label>
                  <Input type="number" placeholder="49" value={addPrice} onChange={(e) => setAddPrice(e.target.value)} disabled={adding} />
                </div>
                <div className="flex flex-col gap-2xs">
                  <Label className="sp-label">Stock</Label>
                  <Input type="number" placeholder="100" value={addStock} onChange={(e) => setAddStock(e.target.value)} disabled={adding} />
                </div>
              </div>
              <Button onClick={handleAdd} disabled={adding || !addName.trim() || !addPrice.trim() || Number(addPrice) <= 0} className="w-full mt-sm">
                {adding ? (
                  <><Loader2 className="size-[14px] mr-xs animate-spin" /> Adding...</>
                ) : (
                  <><Plus className="size-[14px] mr-xs" /> Add Product</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
