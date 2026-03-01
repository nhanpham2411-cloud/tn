import { useState, useEffect, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  MoreHorizontal,
  UserPlus,
  RefreshCw,
  WifiOff,
  Loader2,
  Users,
  UserCheck,
  UserX,
  Mail,
  Trash2,
  Eye,
  Shield,
  Download,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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

import { users, type User } from "@/data/users"

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

function UsersListSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[100px] rounded-2xl" />
        ))}
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
      <TableCell><div className="flex items-center gap-sm"><Skeleton className="size-[32px] rounded-full shrink-0" /><div className="flex flex-col gap-2xs"><Skeleton className="h-[14px] w-[120px] rounded" /><Skeleton className="h-[10px] w-[160px] rounded" /></div></div></TableCell>
      <TableCell><Skeleton className="h-[20px] w-[60px] rounded" /></TableCell>
      <TableCell><Skeleton className="h-[20px] w-[55px] rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[50px] rounded" /></TableCell>
      <TableCell><Skeleton className="h-[14px] w-[80px] rounded" /></TableCell>
      <TableCell><Skeleton className="size-[28px] rounded ml-auto" /></TableCell>
    </TableRow>
  )
}

/* ------------------------------------------------------------------ */
/*  Config                                                             */
/* ------------------------------------------------------------------ */

const roleLabel: Record<User["role"], string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
  billing: "Billing",
  developer: "Developer",
}

const statusConfig: Record<User["status"], { label: string; dotClass: string; badgeClass: string }> = {
  active: {
    label: "Active",
    dotClass: "bg-success",
    badgeClass: "bg-success-subtle text-success-subtle-foreground border-success-border/20",
  },
  inactive: {
    label: "Inactive",
    dotClass: "bg-muted-foreground/40",
    badgeClass: "bg-muted text-muted-foreground border-border/40",
  },
  invited: {
    label: "Invited",
    dotClass: "bg-primary animate-pulse",
    badgeClass: "bg-primary/10 text-primary border-primary/20 dark:bg-primary/20",
  },
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function UsersListPage() {
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusTab, setStatusTab] = useState("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [inviteDialog, setInviteDialog] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteName, setInviteName] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("viewer")
  const [editRoleSheet, setEditRoleSheet] = useState<string | null>(null)
  const [editRoleValue, setEditRoleValue] = useState<string>("")
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)
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

  // Filter
  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false
      if (roleFilter !== "all" && u.role !== roleFilter) return false
      if (statusTab !== "all" && u.status !== statusTab) return false
      return true
    })
  }, [search, roleFilter, statusTab])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  // Bulk select
  const allSelected = paginated.length > 0 && paginated.every((u) => selected.has(u.id))
  function toggleAll() {
    const next = new Set(selected)
    if (allSelected) paginated.forEach((u) => next.delete(u.id))
    else paginated.forEach((u) => next.add(u.id))
    setSelected(next)
  }
  function toggleOne(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id); else next.add(id)
    setSelected(next)
  }

  // KPI counts
  const totalCount = users.length
  const activeCount = users.filter((u) => u.status === "active").length
  const inactiveCount = users.filter((u) => u.status === "inactive").length
  const invitedCount = users.filter((u) => u.status === "invited").length

  // Edit role
  const editUser = editRoleSheet ? users.find((u) => u.id === editRoleSheet) : null
  const openEditRole = useCallback((user: User) => {
    setEditRoleSheet(user.id)
    setEditRoleValue(user.role)
  }, [])

  // Handlers
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); toast.success("Users refreshed") }, 800)
  }, [])

  const handleInvite = useCallback(() => {
    setInviting(true)
    setTimeout(() => {
      setInviting(false)
      setInviteDialog(false)
      toast.success(`Invite sent to ${inviteEmail}`)
      setInviteName(""); setInviteEmail(""); setInviteRole("viewer")
    }, 1500)
  }, [inviteEmail])

  const handleSaveRole = useCallback(() => {
    toast.success(`Role updated to ${roleLabel[editRoleValue as User["role"]]}`)
    setEditRoleSheet(null)
  }, [editRoleValue])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    toast.success(`${deleteTarget.name} removed`)
    setDeleteTarget(null)
  }, [deleteTarget])

  const handleBulkExport = useCallback(() => {
    toast(`Exporting ${selected.size} users...`)
    setTimeout(() => { toast.success("Export complete"); setSelected(new Set()) }, 800)
  }, [selected.size])

  const handleBulkDelete = useCallback(() => {
    toast.success(`${selected.size} users removed`)
    setSelected(new Set())
  }, [selected.size])

  if (loading) return <UsersListSkeleton />

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
              <h1 className="sp-h3 text-foreground">Users</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2xs text-muted-foreground/50 mt-lg">
              <div className="size-[6px] rounded-full bg-success animate-pulse" />
              <span className="sp-caption">Updated just now</span>
            </div>
          </div>
          <Button onClick={() => setInviteDialog(true)} className="shrink-0">
            <UserPlus className="mr-xs size-[14px]" />
            <span className="hidden sm:inline">Invite User</span>
            <span className="sm:hidden">Invite</span>
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
          {[
            { icon: Users, label: "Total Users", value: totalCount, iconBg: "bg-primary/10 dark:bg-primary/20", iconColor: "text-primary" },
            { icon: UserCheck, label: "Active", value: activeCount, iconBg: "bg-success-subtle", iconColor: "text-success" },
            { icon: UserX, label: "Inactive", value: inactiveCount, iconBg: "bg-muted", iconColor: "text-muted-foreground" },
            { icon: Mail, label: "Invited", value: invitedCount, iconBg: "bg-primary/10 dark:bg-primary/20", iconColor: "text-primary" },
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

        {/* Users table card */}
        <DCard className="!p-0 overflow-hidden">
          {/* Card header: always rendered for stable height */}
          <div className="relative p-md sm:p-xl pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
              <div className="flex items-center gap-md">
                <div>
                  <h3 className="sp-h4 text-foreground">All Users</h3>
                  <p className="sp-caption text-muted-foreground mt-3xs">{filtered.length} users found</p>
                </div>
                <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground" onClick={handleRefresh} aria-label="Refresh">
                  <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
                </Button>
              </div>
              {/* Mobile: Select dropdown */}
              <Select value={statusTab} onValueChange={(v) => { setStatusTab(v); setPage(1) }}>
                <SelectTrigger className="sm:hidden w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                </SelectContent>
              </Select>
              {/* Desktop: Pill tabs */}
              <Tabs value={statusTab} onValueChange={(v) => { setStatusTab(v); setPage(1) }}>
                <TabsList className="rounded-full hidden sm:inline-flex">
                  <TabsTrigger value="all" className="rounded-full">All</TabsTrigger>
                  <TabsTrigger value="active" className="rounded-full">Active</TabsTrigger>
                  <TabsTrigger value="inactive" className="rounded-full">Inactive</TabsTrigger>
                  <TabsTrigger value="invited" className="rounded-full">Invited</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {/* Bulk action overlay */}
            {selected.size > 0 && (
              <div className="absolute inset-0 flex items-center justify-between px-xl bg-background rounded-t-2xl">
                <p className="sp-body-semibold text-primary">{selected.size} user{selected.size > 1 ? "s" : ""} selected</p>
                <div className="flex items-center gap-sm">
                  <Button variant="outline" size="sm" onClick={handleBulkExport}>
                    <Download className="size-[13px] mr-xs" /> Export
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={handleBulkDelete}>
                    <Trash2 className="size-[13px] mr-xs" /> Remove
                  </Button>
                  <Button variant="ghost" size="xs" onClick={() => setSelected(new Set())}>
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Search + Role filter */}
          <div className="px-md sm:px-xl pt-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-sm">
            <div className="relative flex-1">
              <Search className="absolute left-md top-1/2 -translate-y-1/2 size-[14px] text-muted-foreground/50" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="pl-2xl"
                aria-label="Search"
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
              <SelectTrigger className="w-full sm:w-[130px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="billing">Billing</SelectItem>
                <SelectItem value="developer">Developer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mobile card list — below md */}
          <div className="md:hidden px-md pt-md pb-xl">
            {refreshing ? (
              <div className="flex flex-col gap-sm">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[100px] rounded-xl" />)}
              </div>
            ) : paginated.length === 0 ? (
              <EmptyState icon={Users} title="No users found" description="Try adjusting your filters or invite a new user." />
            ) : (
              <div className="flex flex-col gap-sm">
                {paginated.map((user) => {
                  const status = statusConfig[user.status]
                  return (
                    <Link
                      key={user.id}
                      to={`/management/users/${user.id}`}
                      className="rounded-xl border border-border/60 dark:border-white/[0.06] p-md flex flex-col gap-sm hover:bg-muted/30 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-sm">
                        <Avatar className="size-[36px] ring-1 ring-border/20">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback className="sp-caption">{user.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="sp-body-semibold text-foreground truncate">{user.name}</p>
                          <p className="sp-caption text-muted-foreground/60 truncate">{user.email}</p>
                        </div>
                        <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full border sp-caption font-medium shrink-0 ${status.badgeClass}`}>
                          <span className={`size-[5px] rounded-full ${status.dotClass}`} />
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between sp-caption text-muted-foreground">
                        <span><Badge variant="outline" className="sp-caption mr-xs">{roleLabel[user.role]}</Badge> · {user.plan}</span>
                        <span>{user.lastActive}</span>
                      </div>
                    </Link>
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
                  <TableHead className="w-[32px] !p-0 text-center">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
                  </TableHead>
                  <TableHead className="sp-label w-[28%]">User</TableHead>
                  <TableHead className="sp-label w-[13%]">Role</TableHead>
                  <TableHead className="sp-label w-[14%]">Status</TableHead>
                  <TableHead className="sp-label w-[13%]">Plan</TableHead>
                  <TableHead className="sp-label w-[18%]">Last Active</TableHead>
                  <TableHead className="sp-label text-right w-[10%]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refreshing ? (
                  [...Array(perPage)].map((_, i) => <TableRowSkeleton key={i} />)
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="border-0">
                      <EmptyState icon={Users} title="No users found" description="Try adjusting your filters or invite a new user." />
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((user) => {
                    const status = statusConfig[user.status]
                    return (
                      <TableRow key={user.id} className="group">
                        <TableCell className="!p-0 text-center">
                          <Checkbox checked={selected.has(user.id)} onCheckedChange={() => toggleOne(user.id)} aria-label={`Select ${user.name}`} />
                        </TableCell>
                        <TableCell>
                          <Link to={`/management/users/${user.id}`} className="flex items-center gap-sm hover:opacity-80 transition-opacity">
                            <Avatar className="size-[32px] ring-1 ring-border/20">
                              <AvatarImage src={user.avatarUrl} alt={user.name} />
                              <AvatarFallback className="sp-caption">{user.avatar}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="sp-body-semibold text-foreground truncate">{user.name}</p>
                              <p className="sp-caption text-muted-foreground/60 truncate">{user.email}</p>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="sp-caption">{roleLabel[user.role]}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full border sp-caption font-medium ${status.badgeClass}`}>
                            <span className={`size-[5px] rounded-full ${status.dotClass}`} />
                            {status.label}
                          </span>
                        </TableCell>
                        <TableCell className="sp-caption text-muted-foreground capitalize">{user.plan}</TableCell>
                        <TableCell className="sp-caption text-muted-foreground">{user.lastActive}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground" aria-label="More options">
                                <MoreHorizontal className="size-[14px]" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/management/users/${user.id}`}>
                                  <Eye className="size-[14px]" /> View Profile
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditRole(user)}>
                                <Shield className="size-[14px]" /> Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { toast(`Exporting ${user.name}...`); setTimeout(() => toast.success("Export complete"), 800) }}>
                                <Download className="size-[14px]" /> Export Data
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteTarget(user)}>
                                <Trash2 className="size-[14px]" /> Remove User
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
                      <PaginationPrevious onClick={() => setPage(Math.max(1, page - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) pageNum = i + 1
                      else if (page <= 3) pageNum = i + 1
                      else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                      else pageNum = page - 2 + i
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink isActive={page === pageNum} onClick={() => setPage(pageNum)} className="cursor-pointer">{pageNum}</PaginationLink>
                        </PaginationItem>
                      )
                    })}
                    <PaginationItem>
                      <PaginationNext onClick={() => setPage(Math.min(totalPages, page + 1))} className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </DCard>

        {/* Edit Role Sheet */}
        <Sheet open={editRoleSheet !== null} onOpenChange={(open) => !open && setEditRoleSheet(null)}>
          <SheetContent className="sm:max-w-[400px]">
            {editUser && (
              <>
                <SheetHeader>
                  <SheetTitle>Edit Role</SheetTitle>
                  <SheetDescription>Change role for {editUser.name}</SheetDescription>
                </SheetHeader>
                <div className="mt-xl flex flex-col gap-lg">
                  <div className="flex items-center gap-sm p-lg rounded-xl bg-surface-raised/50 dark:bg-surface-inset/50">
                    <Avatar className="size-[40px] ring-1 ring-border/20">
                      <AvatarImage src={editUser.avatarUrl} alt={editUser.name} />
                      <AvatarFallback className="sp-body-semibold">{editUser.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="sp-body-semibold text-foreground">{editUser.name}</p>
                      <p className="sp-caption text-muted-foreground">{editUser.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Role</Label>
                    <Select value={editRoleValue} onValueChange={setEditRoleValue}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSaveRole} className="w-full">
                    <Shield className="size-[14px] mr-xs" /> Save Role
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
              <AlertDialogTitle>Remove user?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove <span className="font-medium text-foreground">{deleteTarget?.name}</span> from the team. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteConfirm}>
                <Trash2 className="size-[14px] mr-xs" /> Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Invite User Dialog */}
        <Dialog open={inviteDialog} onOpenChange={(open) => { if (!inviting) setInviteDialog(open) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>Send an invitation to join the team.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-lg pt-md">
              <div className="flex flex-col gap-2xs">
                <Label className="sp-label">Full Name</Label>
                <Input placeholder="John Doe" value={inviteName} onChange={(e) => setInviteName(e.target.value)} disabled={inviting} />
              </div>
              <div className="flex flex-col gap-2xs">
                <Label className="sp-label">Email</Label>
                <Input placeholder="john@company.com" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} disabled={inviting} />
              </div>
              <div className="flex flex-col gap-2xs">
                <Label className="sp-label">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole} disabled={inviting}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleInvite} disabled={inviting || !inviteName.trim() || !inviteEmail.trim()} className="w-full mt-sm">
                {inviting ? (
                  <><Loader2 className="size-[14px] mr-xs animate-spin" /> Sending...</>
                ) : (
                  <><Mail className="size-[14px] mr-xs" /> Send Invite</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
