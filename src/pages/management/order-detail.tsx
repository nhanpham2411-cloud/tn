import { useState, useEffect, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  Package,
  CreditCard,
  MapPin,
  Clock,
  Printer,
  Download,
  RefreshCw,
  WifiOff,
  Loader2,
  XCircle,
  Pencil,
  Truck,
  CheckCircle2,
  ShoppingBag,
  Copy,
  MoreHorizontal,
  ExternalLink,
  StickyNote,
  Send,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"

import { orders, type Order } from "@/data/orders"

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

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <Skeleton className="h-[10px] w-[100px] rounded" />
      <Skeleton className="h-[80px] rounded-2xl" />
      <div className="grid gap-lg lg:grid-cols-3">
        <Skeleton className="lg:col-span-2 h-[300px] rounded-2xl" />
        <Skeleton className="h-[300px] rounded-2xl" />
      </div>
      <Skeleton className="h-[180px] rounded-2xl" />
    </div>
  )
}

const statusConfig: Record<Order["status"], { label: string; dotClass: string; badgeClass: string }> = {
  pending: {
    label: "Pending",
    dotClass: "bg-warning",
    badgeClass: "bg-warning-subtle text-warning-subtle-foreground border-warning-border/20",
  },
  processing: {
    label: "Processing",
    dotClass: "bg-primary animate-pulse",
    badgeClass: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20",
  },
  shipped: {
    label: "Shipped",
    dotClass: "bg-info",
    badgeClass: "bg-info-subtle text-info-subtle-foreground border-info-border/20",
  },
  delivered: {
    label: "Delivered",
    dotClass: "bg-success",
    badgeClass: "bg-success-subtle text-success-subtle-foreground border-success-border/20",
  },
  cancelled: {
    label: "Cancelled",
    dotClass: "bg-destructive",
    badgeClass: "bg-destructive/10 text-destructive border-destructive/20 dark:bg-destructive/20",
  },
  refunded: {
    label: "Refunded",
    dotClass: "bg-muted-foreground/40",
    badgeClass: "bg-muted text-muted-foreground border-border/40",
  },
}

const paymentLabel: Record<Order["paymentMethod"], string> = {
  card: "Card",
  paypal: "PayPal",
  bank_transfer: "Bank Transfer",
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const cfg = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full border sp-caption font-medium ${cfg.badgeClass}`}>
      <span className={`size-[5px] rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  )
}

function getTimeline(order: Order) {
  if (order.status === "cancelled") {
    return [
      { label: "Order Placed", date: order.createdAt, done: true, icon: ShoppingBag },
      { label: "Cancelled", date: order.updatedAt, done: true, icon: XCircle },
    ]
  }
  if (order.status === "refunded") {
    return [
      { label: "Order Placed", date: order.createdAt, done: true, icon: ShoppingBag },
      { label: "Refunded", date: order.updatedAt, done: true, icon: CreditCard },
    ]
  }
  return [
    { label: "Order Placed", date: order.createdAt, done: true, icon: ShoppingBag },
    { label: "Processing", date: order.createdAt, done: ["processing", "shipped", "delivered"].includes(order.status), icon: Package },
    { label: "Shipped", date: order.updatedAt, done: ["shipped", "delivered"].includes(order.status), icon: Truck },
    { label: "Delivered", date: order.updatedAt, done: order.status === "delivered", icon: CheckCircle2 },
  ]
}

/* ------------------------------------------------------------------ */
/*  Internal notes (mock data)                                         */
/* ------------------------------------------------------------------ */

interface Note {
  id: string
  author: string
  text: string
  date: string
}

const mockNotes: Note[] = [
  { id: "n1", author: "Sarah Johnson", text: "Customer requested expedited shipping. Upgrading to express.", date: "Feb 28, 2026 at 10:30 AM" },
  { id: "n2", author: "Alex Morgan", text: "Payment verified. Order ready for fulfillment.", date: "Feb 27, 2026 at 3:15 PM" },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function OrderDetailPage() {
  const { id } = useParams()
  const order = orders.find((o) => o.id === id)

  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [refreshing, setRefreshing] = useState(false)
  const [editSheet, setEditSheet] = useState(false)
  const [editStatus, setEditStatus] = useState(order?.status ?? "pending")
  const [editAddress, setEditAddress] = useState(order?.shippingAddress ?? "")
  const [saving, setSaving] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

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
    setTimeout(() => { setRefreshing(false); toast.success("Order refreshed") }, 800)
  }, [])

  const handleSave = useCallback(() => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setEditSheet(false)
      toast.success("Order updated")
    }, 800)
  }, [])

  const handleCancel = useCallback(() => {
    setCancelDialog(false)
    toast.success("Order cancelled")
  }, [])

  const handlePrint = useCallback(() => {
    toast("Preparing print view...")
    setTimeout(() => toast.success("Print dialog opened"), 600)
  }, [])

  const handleDownload = useCallback(() => {
    toast("Generating invoice PDF...")
    setTimeout(() => toast.success("Invoice downloaded"), 800)
  }, [])

  const handleCopyId = useCallback(() => {
    if (order) {
      navigator.clipboard.writeText(order.id)
      toast.success("Order ID copied")
    }
  }, [order])

  const handleAddNote = useCallback(() => {
    if (!newNote.trim()) return
    setNotes((prev) => [
      { id: `n${Date.now()}`, author: "You", text: newNote.trim(), date: "Just now" },
      ...prev,
    ])
    setNewNote("")
    toast.success("Note added")
  }, [newNote])

  if (loading) return <DetailSkeleton />

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-md py-4xl">
        <div className="size-[48px] rounded-full bg-surface-raised flex items-center justify-center mb-sm">
          <Package className="size-[22px] text-muted-foreground" />
        </div>
        <h2 className="sp-h4 text-foreground">Order not found</h2>
        <p className="sp-body text-muted-foreground">The order "{id}" does not exist.</p>
        <Button asChild variant="outline">
          <Link to="/management/orders">
            <ArrowLeft className="mr-xs size-[14px]" /> Back to Orders
          </Link>
        </Button>
      </div>
    )
  }

  const timeline = getTimeline(order)

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

        {/* Back + Updated + Refresh */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/management/orders">
              <ArrowLeft className="mr-xs size-[14px]" /> Back to Orders
            </Link>
          </Button>
          <div className="flex items-center gap-sm">
            <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground" onClick={handleRefresh}>
              <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <div className="flex items-center gap-2xs text-muted-foreground/70">
              <div className="size-[6px] rounded-full bg-success animate-pulse" />
              <span className="sp-caption">Updated just now</span>
            </div>
          </div>
        </div>

        {/* Order header */}
        {refreshing ? (
          <Skeleton className="h-[80px] rounded-2xl" />
        ) : (
          <DCard>
            <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-md">
                <div className="size-[44px] rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
                  <Package className="size-[20px] text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-sm">
                    <h1 className="sp-h3 text-foreground">{order.id}</h1>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="sp-caption text-muted-foreground mt-2xs">
                    {order.customerName} · {order.items.length} item{order.items.length !== 1 && "s"} · ${order.total.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-sm">
                <Button variant="outline" size="sm" onClick={() => { setEditStatus(order.status); setEditAddress(order.shippingAddress); setEditSheet(true) }}>
                  <Pencil className="size-[13px] mr-xs" /> Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="size-[32px]">
                      <MoreHorizontal className="size-[14px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopyId}>
                      <Copy className="size-[14px]" /> Copy Order ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePrint}>
                      <Printer className="size-[14px]" /> Print Order
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownload}>
                      <Download className="size-[14px]" /> Download Invoice
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/management/users`}>
                        <ExternalLink className="size-[14px]" /> View Customer
                      </Link>
                    </DropdownMenuItem>
                    {order.status !== "cancelled" && order.status !== "refunded" && order.status !== "delivered" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setCancelDialog(true)}>
                          <XCircle className="size-[14px]" /> Cancel Order
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </DCard>
        )}

        {/* Main grid */}
        <div className="grid gap-lg lg:grid-cols-3">
          {/* Left: Items table + Timeline + Notes */}
          <div className="lg:col-span-2 flex flex-col gap-lg">
            {refreshing ? (
              <>
                <Skeleton className="h-[300px] rounded-2xl" />
                <Skeleton className="h-[180px] rounded-2xl" />
              </>
            ) : (
              <>
                <DCard>
                  <div className="flex items-center justify-between mb-lg">
                    <div className="flex items-center gap-sm">
                      <h3 className="sp-h4 text-foreground">Order Items</h3>
                      <Badge variant="default" level="secondary" size="sm">{order.items.length} item{order.items.length !== 1 && "s"}</Badge>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                  <Table className="table-fixed min-w-[500px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sp-label w-[45%]">Product</TableHead>
                        <TableHead className="sp-label text-right w-[18%]">Price</TableHead>
                        <TableHead className="sp-label text-right w-[12%]">Qty</TableHead>
                        <TableHead className="sp-label text-right w-[25%]">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, i) => (
                        <TableRow key={i} className="group">
                          <TableCell>
                            <div>
                              <p className="sp-body-medium text-foreground">{item.productName}</p>
                              <p className="sp-caption text-muted-foreground/60">{item.productId}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right sp-data text-muted-foreground">${item.unitPrice}</TableCell>
                          <TableCell className="text-right sp-data text-muted-foreground">{item.quantity}</TableCell>
                          <TableCell className="text-right sp-data font-semibold text-foreground">${item.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  </div>

                  <Separator className="my-lg" />

                  <div className="flex flex-col gap-xs items-end">
                    <div className="flex justify-between w-48">
                      <span className="sp-body text-muted-foreground">Subtotal</span>
                      <span className="sp-data text-foreground">${order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-48">
                      <span className="sp-body text-muted-foreground">Tax</span>
                      <span className="sp-data text-foreground">${order.tax.toLocaleString()}</span>
                    </div>
                    <Separator className="w-48" />
                    <div className="flex justify-between w-48">
                      <span className="sp-body-semibold text-foreground">Total</span>
                      <span className="sp-h4 text-foreground">${order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </DCard>

                {/* Timeline */}
                <DCard>
                  <h3 className="sp-h4 text-foreground mb-lg">Order Timeline</h3>
                  <div className="relative">
                    <div className="absolute left-[14px] top-[20px] bottom-[20px] w-[2px] bg-border/40 dark:bg-border-subtle" />
                    <div className="flex flex-col gap-md">
                      {timeline.map((step, i) => {
                        const StepIcon = step.icon
                        return (
                          <div key={i} className="flex items-start gap-md relative">
                            <div className={`size-[30px] rounded-lg flex items-center justify-center shrink-0 z-10 ${step.done ? "bg-primary/10 dark:bg-primary/20" : "bg-muted"}`}>
                              <StepIcon className={`size-[14px] ${step.done ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div className="flex-1 flex flex-col gap-2xs sm:flex-row sm:items-center sm:justify-between py-xs min-h-[30px]">
                              <span className={`sp-body-medium ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                              <span className="sp-caption text-muted-foreground/60 shrink-0">{step.date}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </DCard>

                {/* Internal Notes */}
                <DCard>
                  <div className="flex items-center gap-sm mb-lg">
                    <StickyNote className="size-[16px] text-muted-foreground" />
                    <h3 className="sp-h4 text-foreground">Internal Notes</h3>
                    <Badge variant="default" level="secondary" size="sm">{notes.length}</Badge>
                  </div>

                  {/* Add note */}
                  <div className="flex gap-sm mb-lg">
                    <Textarea
                      placeholder="Add a note about this order..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[60px] resize-none flex-1"
                    />
                    <Button size="sm" className="self-end" onClick={handleAddNote} disabled={!newNote.trim()}>
                      <Send className="size-[13px] mr-xs" /> Add
                    </Button>
                  </div>

                  {/* Notes list */}
                  {notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-lg text-center">
                      <p className="sp-body text-muted-foreground">No notes yet</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-sm">
                      {notes.map((note) => (
                        <div key={note.id} className="rounded-xl bg-surface-raised/50 dark:bg-surface-inset/50 p-lg">
                          <div className="flex items-center justify-between mb-xs">
                            <span className="sp-body-semibold text-foreground">{note.author}</span>
                            <span className="sp-caption text-muted-foreground/60">{note.date}</span>
                          </div>
                          <p className="sp-body text-muted-foreground">{note.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </DCard>
              </>
            )}
          </div>

          {/* Right: Customer, Shipping, Payment, Dates */}
          <div className="flex flex-col gap-lg">
            {refreshing ? (
              <>
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl" />)}
              </>
            ) : (
              <>
                <DCard>
                  <h3 className="sp-label text-muted-foreground mb-md">Customer</h3>
                  <p className="sp-body-semibold text-foreground">{order.customerName}</p>
                  <p className="sp-caption text-muted-foreground mt-2xs">{order.customerEmail}</p>
                  <p className="sp-caption text-muted-foreground/60 mt-2xs">ID: {order.customerId}</p>
                </DCard>

                <DCard>
                  <div className="flex items-center gap-xs mb-md">
                    <MapPin className="size-[14px] text-muted-foreground" />
                    <h3 className="sp-label text-muted-foreground">Shipping Address</h3>
                  </div>
                  <p className="sp-body text-foreground">{order.shippingAddress}</p>
                </DCard>

                <DCard>
                  <div className="flex items-center gap-xs mb-md">
                    <CreditCard className="size-[14px] text-muted-foreground" />
                    <h3 className="sp-label text-muted-foreground">Payment</h3>
                  </div>
                  <div className="flex flex-col gap-sm">
                    <div className="flex justify-between">
                      <span className="sp-body text-muted-foreground">Method</span>
                      <span className="sp-body-medium text-foreground">{paymentLabel[order.paymentMethod]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="sp-body text-muted-foreground">Amount</span>
                      <span className="sp-body-semibold text-foreground">${order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </DCard>

                <DCard>
                  <div className="flex items-center gap-xs mb-md">
                    <Clock className="size-[14px] text-muted-foreground" />
                    <h3 className="sp-label text-muted-foreground">Dates</h3>
                  </div>
                  <div className="flex flex-col gap-sm">
                    <div className="flex justify-between">
                      <span className="sp-body text-muted-foreground">Created</span>
                      <span className="sp-body-medium text-foreground">{order.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="sp-body text-muted-foreground">Updated</span>
                      <span className="sp-body-medium text-foreground">{order.updatedAt}</span>
                    </div>
                  </div>
                </DCard>

                {/* Cancel button for applicable statuses */}
                {order.status !== "cancelled" && order.status !== "refunded" && order.status !== "delivered" && (
                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setCancelDialog(true)}
                  >
                    <XCircle className="size-[13px] mr-xs" /> Cancel Order
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Edit Sheet */}
        <Sheet open={editSheet} onOpenChange={(open) => { if (!saving && !open) setEditSheet(false) }}>
          <SheetContent className="sm:max-w-[480px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Order</SheetTitle>
              <SheetDescription>{order.id} · {order.items.length} item{order.items.length !== 1 && "s"} · ${order.total.toLocaleString()}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-col gap-lg mt-xl">
              {/* Customer info (read-only) */}
              <div className="rounded-xl bg-surface-raised/50 dark:bg-surface-inset/50 p-lg">
                <p className="sp-body-semibold text-foreground">{order.customerName}</p>
                <p className="sp-caption text-muted-foreground">{order.customerEmail}</p>
              </div>
              <div className="flex flex-col gap-2xs">
                <Label className="sp-label">Status</Label>
                <Select value={editStatus} onValueChange={(v) => setEditStatus(v as Order["status"])} disabled={saving}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2xs">
                <Label className="sp-label">Shipping Address</Label>
                <Input value={editAddress} onChange={(e) => setEditAddress(e.target.value)} disabled={saving} />
              </div>
              <div className="flex justify-end gap-sm mt-lg">
                <Button variant="outline" onClick={() => setEditSheet(false)} disabled={saving}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving || !editAddress.trim()}>
                  {saving ? (
                    <><Loader2 className="size-[14px] mr-xs animate-spin" /> Saving...</>
                  ) : (
                    <><Pencil className="size-[14px] mr-xs" /> Save Changes</>
                  )}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Cancel AlertDialog */}
        <AlertDialog open={cancelDialog} onOpenChange={setCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel order {order.id}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will cancel the order for {order.customerName}. The customer will be notified and a refund may be issued.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Order</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleCancel}>
                Cancel Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
