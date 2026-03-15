import { useState, useEffect, useCallback, useMemo } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Clock,
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Loader2,
  Save,
  CreditCard,
  Settings,
  LogIn,
  FileText,
  UserMinus,
  Users,
  Key,
  Globe,
  MoreHorizontal,
  Copy,
  Ban,
  Trash2,
  Activity,
  Download,
  Zap,
  Filter,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Thumbnail } from "@/components/ui/thumbnail"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"

import { users, type User } from "@/data/users"

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function DCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <Card className={`h-full ${className}`}>
      {children}
    </Card>
  )
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <Skeleton className="h-[10px] w-[100px] rounded" />
      <Skeleton className="h-[180px] rounded-2xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[90px] rounded-2xl" />)}
      </div>
      <Skeleton className="h-[36px] w-[300px] rounded-full" />
      <Skeleton className="h-[400px] rounded-2xl" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const statusConfig: Record<User["status"], { label: string; dotClass: string; badgeClass: string }> = {
  active: {
    label: "Active",
    dotClass: "bg-success",
    badgeClass: "bg-success-subtle text-success-subtle-foreground border-success-border",
  },
  inactive: {
    label: "Inactive",
    dotClass: "bg-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground border-border",
  },
  invited: {
    label: "Invited",
    dotClass: "bg-primary animate-pulse",
    badgeClass: "bg-primary-10 text-primary border-primary-10 dark:bg-primary-20",
  },
}

const planConfig: Record<User["plan"], { label: string; color: string; bg: string }> = {
  free: { label: "Free", color: "text-muted-foreground", bg: "bg-muted" },
  pro: { label: "Pro", color: "text-primary", bg: "bg-primary-10 dark:bg-primary-20" },
  enterprise: { label: "Enterprise", color: "text-primary", bg: "bg-primary-10 dark:bg-primary-20" },
}

interface ActivityEntry {
  action: string
  date: string
  type: "auth" | "settings" | "report" | "team" | "security" | "billing" | "project"
}

const activityLog: ActivityEntry[] = [
  { action: "Logged in", date: "Feb 28, 2026 at 9:15 AM", type: "auth" },
  { action: "Updated profile settings", date: "Feb 27, 2026 at 3:42 PM", type: "settings" },
  { action: "Exported monthly report", date: "Feb 27, 2026 at 11:20 AM", type: "report" },
  { action: "Invited team member", date: "Feb 26, 2026 at 2:05 PM", type: "team" },
  { action: "Changed password", date: "Feb 25, 2026 at 10:30 AM", type: "security" },
  { action: "Created new project", date: "Feb 24, 2026 at 4:15 PM", type: "project" },
  { action: "Updated billing information", date: "Feb 23, 2026 at 1:00 PM", type: "billing" },
  { action: "Logged in from new device", date: "Feb 22, 2026 at 8:45 AM", type: "auth" },
  { action: "Exported quarterly report", date: "Feb 21, 2026 at 10:00 AM", type: "report" },
  { action: "Updated notification preferences", date: "Feb 20, 2026 at 2:30 PM", type: "settings" },
  { action: "Added API key", date: "Feb 19, 2026 at 11:45 AM", type: "security" },
  { action: "Invited 3 team members", date: "Feb 18, 2026 at 9:00 AM", type: "team" },
]

const activityTypeConfig: Record<ActivityEntry["type"], { icon: React.ElementType; color: "primary" | "success" | "warning" | "destructive" | "default"; label: string }> = {
  auth: { icon: LogIn, color: "primary", label: "Auth" },
  settings: { icon: Settings, color: "warning", label: "Settings" },
  report: { icon: FileText, color: "success", label: "Report" },
  team: { icon: Users, color: "primary", label: "Team" },
  security: { icon: Key, color: "destructive", label: "Security" },
  billing: { icon: CreditCard, color: "warning", label: "Billing" },
  project: { icon: Globe, color: "primary", label: "Project" },
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function UserProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = users.find((u) => u.id === id)

  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editName, setEditName] = useState(user?.name ?? "")
  const [editEmail, setEditEmail] = useState(user?.email ?? "")
  const [editRole, setEditRole] = useState<string>(user?.role ?? "viewer")
  const [editStatus, setEditStatus] = useState<string>(user?.status ?? "active")
  const [editPlan, setEditPlan] = useState<string>(user?.plan ?? "free")
  const [deactivateDialog, setDeactivateDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [activityFilter, setActivityFilter] = useState("all")
  const [showAllActivity, setShowAllActivity] = useState(false)

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

  // Refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => { setRefreshing(false); toast.success("Profile refreshed") }, 800)
  }, [])

  const handleSave = useCallback(() => {
    setSaving(true)
    setTimeout(() => { setSaving(false); toast.success("Changes saved successfully") }, 800)
  }, [])

  const handleDeactivate = useCallback(() => {
    setDeactivateDialog(false)
    toast.success("User deactivated")
  }, [])

  const handleDelete = useCallback(() => {
    setDeleteDialog(false)
    toast.success("User deleted")
    setTimeout(() => navigate("/management/users"), 300)
  }, [navigate])

  const handleCopyId = useCallback(() => {
    if (user) {
      navigator.clipboard.writeText(user.id)
      toast.success("User ID copied to clipboard")
    }
  }, [user])

  const handleExportData = useCallback(() => {
    toast("Exporting user data...")
    setTimeout(() => toast.success("User data exported"), 800)
  }, [])

  // Filtered activity
  const filteredActivity = useMemo(() => {
    if (activityFilter === "all") return activityLog
    return activityLog.filter((e) => e.type === activityFilter)
  }, [activityFilter])

  const displayedActivity = showAllActivity ? filteredActivity : filteredActivity.slice(0, 5)

  if (loading) return <ProfileSkeleton />

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-md py-4xl">
        <Thumbnail type="icon" shape="circle" size="lg" color="surface" icon={<Users className="size-[22px]" />} className="mb-sm" />
        <h2 className="sp-h4 text-foreground">User not found</h2>
        <p className="sp-body text-muted-foreground">The user with ID "{id}" does not exist.</p>
        <Button asChild variant="outline">
          <Link to="/management/users">
            <ArrowLeft className="mr-xs size-[14px]" /> Back to Users
          </Link>
        </Button>
      </div>
    )
  }

  const status = statusConfig[user.status]
  const plan = planConfig[user.plan]

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-lg">
        {/* Offline banner */}
        {connectionStatus === "offline" && (
          <div className="flex items-center gap-sm px-lg py-sm rounded-xl bg-warning-subtle border border-warning-border text-warning-subtle-foreground">
            <WifiOff className="size-[16px] shrink-0" />
            <p className="sp-body-medium flex-1">You're offline. Some data may not be up to date.</p>
            <Button variant="ghost" size="xs" className="text-warning-subtle-foreground hover:text-warning" onClick={() => window.location.reload()}>
              <RefreshCw className="size-[13px]" /> Reconnect
            </Button>
          </div>
        )}

        {/* Back link + Updated indicator */}
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to="/management/users">
              <ArrowLeft className="mr-xs size-[14px]" /> Back to Users
            </Link>
          </Button>
          <div className="flex items-center gap-sm">
            <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-muted-foreground" onClick={handleRefresh} aria-label="Refresh">
              <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <div className="flex items-center gap-2xs text-muted-foreground">
              <div className="size-[6px] rounded-full bg-success animate-pulse" />
              <span className="sp-caption">Updated just now</span>
            </div>
          </div>
        </div>

        {/* Profile header */}
        {refreshing ? (
          <Skeleton className="h-[180px] rounded-2xl" />
        ) : (
          <DCard>
            <div className="flex flex-col items-center gap-md sm:flex-row sm:items-start">
              <div className="relative">
                <Avatar className="size-[64px] ring-1 ring-border">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="sp-h4">{user.avatar}</AvatarFallback>
                </Avatar>
                {user.status === "active" && (
                  <div className="absolute -bottom-[2px] -right-[2px] size-[14px] rounded-full bg-background flex items-center justify-center">
                    <div className="size-[10px] rounded-full bg-success" />
                  </div>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col gap-xs sm:flex-row sm:items-center sm:gap-sm">
                  <h1 className="sp-h3 text-foreground">{user.name}</h1>
                  <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full border sp-caption font-medium w-fit mx-auto sm:mx-0 ${status.badgeClass}`}>
                    <span className={`size-[5px] rounded-full ${status.dotClass}`} />
                    {status.label}
                  </span>
                  <span className={`inline-flex items-center gap-xs px-sm py-3xs rounded-full sp-caption font-medium w-fit mx-auto sm:mx-0 ${plan.bg} ${plan.color}`}>
                    <Zap className="size-[10px]" />
                    {plan.label}
                  </span>
                </div>
                <div className="flex flex-col gap-xs mt-md text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-lg">
                  <div className="flex items-center justify-center gap-xs sm:justify-start">
                    <Mail className="size-[14px]" />
                    <span className="sp-caption">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-center gap-xs sm:justify-start">
                    <Shield className="size-[14px]" />
                    <span className="sp-caption capitalize">{user.role}</span>
                  </div>
                  <div className="flex items-center justify-center gap-xs sm:justify-start">
                    <Calendar className="size-[14px]" />
                    <span className="sp-caption">Joined {user.joinDate}</span>
                  </div>
                  <div className="flex items-center justify-center gap-xs sm:justify-start">
                    <Clock className="size-[14px]" />
                    <span className="sp-caption">Last active {user.lastActive}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-sm">
                <Button>Send Message</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon-sm" aria-label="More options">
                      <MoreHorizontal className="size-[16px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleCopyId}>
                      <Copy className="size-[14px]" /> Copy User ID
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportData}>
                      <Download className="size-[14px]" /> Export Data
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {user.status === "active" && (
                      <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeactivateDialog(true)}>
                        <Ban className="size-[14px]" /> Deactivate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteDialog(true)}>
                      <Trash2 className="size-[14px]" /> Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </DCard>
        )}

        {/* KPI summary cards */}
        {refreshing ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-[90px] rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-lg stagger-children">
            {[
              { icon: CreditCard, label: "Plan", value: user.plan, color: "primary" as const },
              { icon: Shield, label: "Role", value: user.role, color: "success" as const },
              { icon: Calendar, label: "Member Since", value: user.joinDate, color: "default" as const },
              { icon: Activity, label: "Last Active", value: user.lastActive, color: "primary" as const },
            ].map((kpi) => (
              <DCard key={kpi.label} className="flex flex-col justify-center gap-xs">
                <div className="flex items-center gap-sm">
                  <Thumbnail type="icon" color={kpi.color} icon={<kpi.icon className="size-[18px]" />} />
                  <div>
                    <p className="sp-body-semibold text-foreground capitalize">{kpi.value}</p>
                    <p className="sp-caption text-muted-foreground">{kpi.label}</p>
                  </div>
                </div>
              </DCard>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="rounded-full">
            <TabsTrigger value="overview" className="rounded-full">Overview</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-full">Activity</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="flex flex-col gap-lg pt-lg">
            {refreshing ? (
              <Skeleton className="h-[350px] rounded-2xl" />
            ) : (
              <DCard>
                <div className="flex items-center justify-between mb-lg">
                  <div>
                    <h3 className="sp-h4 text-foreground">Recent Activity</h3>
                    <p className="sp-caption text-muted-foreground mt-3xs">Last 5 actions by this user</p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
                    <Link to="#" onClick={(e) => { e.preventDefault(); const tab = document.querySelector<HTMLButtonElement>('[data-state="inactive"][value="activity"]'); tab?.click() }}>
                      View All
                    </Link>
                  </Button>
                </div>
                <div className="flex flex-col">
                  {activityLog.slice(0, 5).map((entry, i) => {
                    const typeConf = activityTypeConfig[entry.type]
                    const TypeIcon = typeConf.icon
                    return (
                      <div key={i}>
                        <div className="flex items-center gap-md py-md">
                          <Thumbnail type="icon" size="sm" color={typeConf.color} icon={<TypeIcon className="size-[14px]" />} className="!size-[30px]" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-sm">
                              <span className="sp-body-medium text-foreground">{entry.action}</span>
                              <Badge variant="outline" className="sp-caption capitalize shrink-0">{entry.type}</Badge>
                            </div>
                          </div>
                          <span className="sp-caption text-muted-foreground shrink-0 hidden sm:block">{entry.date}</span>
                        </div>
                        {i < 4 && <Separator />}
                      </div>
                    )
                  })}
                </div>
              </DCard>
            )}

            {/* Quick info grid */}
            {!refreshing && (
              <div className="grid gap-lg md:grid-cols-2">
                <DCard>
                  <h3 className="sp-label text-muted-foreground mb-md">Account Details</h3>
                  <div className="flex flex-col gap-md">
                    {[
                      { label: "User ID", value: user.id },
                      { label: "Email", value: user.email },
                      { label: "Role", value: user.role },
                      { label: "Status", value: user.status },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="sp-body text-muted-foreground">{item.label}</span>
                        <span className="sp-body-medium text-foreground capitalize">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </DCard>

                <DCard>
                  <h3 className="sp-label text-muted-foreground mb-md">Subscription</h3>
                  <div className="flex flex-col gap-md">
                    {[
                      { label: "Plan", value: user.plan },
                      { label: "Joined", value: user.joinDate },
                      { label: "Last Active", value: user.lastActive },
                      { label: "Sessions", value: `${Math.floor(Math.random() * 200) + 50}` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="sp-body text-muted-foreground">{item.label}</span>
                        <span className="sp-body-medium text-foreground capitalize">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </DCard>
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="pt-lg">
            {refreshing ? (
              <Skeleton className="h-[500px] rounded-2xl" />
            ) : (
              <DCard>
                <div className="flex flex-col gap-lg sm:flex-row sm:items-center sm:justify-between mb-lg">
                  <div>
                    <h3 className="sp-h4 text-foreground">Activity Log</h3>
                    <p className="sp-caption text-muted-foreground mt-3xs">Complete history of user actions</p>
                  </div>
                  <div className="flex items-center gap-sm">
                    <Filter className="size-[14px] text-muted-foreground" />
                    <Select value={activityFilter} onValueChange={setActivityFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="auth">Auth</SelectItem>
                        <SelectItem value="settings">Settings</SelectItem>
                        <SelectItem value="report">Report</SelectItem>
                        <SelectItem value="team">Team</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="billing">Billing</SelectItem>
                        <SelectItem value="project">Project</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredActivity.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-2xl text-center">
                    <Thumbnail type="icon" shape="circle" size="default" color="surface" icon={<Activity className="size-[18px]" />} className="mb-md" />
                    <p className="sp-body-semibold text-foreground">No activity found</p>
                    <p className="sp-caption text-muted-foreground mt-2xs">No {activityFilter} events recorded for this user.</p>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      {/* Timeline line */}
                      <div className="absolute left-[14px] top-[20px] bottom-[20px] w-[2px] bg-border-subtle" />
                      <div className="flex flex-col gap-sm">
                        {displayedActivity.map((entry, i) => {
                          const typeConf = activityTypeConfig[entry.type]
                          const TypeIcon = typeConf.icon
                          return (
                            <div key={i} className="flex items-start gap-md relative">
                              <Thumbnail type="icon" size="sm" icon={<TypeIcon className={`size-[14px] ${typeConf.color}`} />} className={`!size-[30px] z-10 ${typeConf.bg}`} />
                              <div className="flex-1 flex flex-col gap-2xs sm:flex-row sm:items-center sm:justify-between py-xs min-h-[30px]">
                                <div className="flex items-center gap-sm">
                                  <span className="sp-body-medium text-foreground">{entry.action}</span>
                                  <Badge variant="outline" className="sp-caption capitalize">{typeConf.label}</Badge>
                                </div>
                                <span className="sp-caption text-muted-foreground shrink-0">{entry.date}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Load more / Show less */}
                    {filteredActivity.length > 5 && (
                      <div className="flex justify-center mt-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => setShowAllActivity(!showAllActivity)}
                        >
                          {showAllActivity ? "Show Less" : `Show All (${filteredActivity.length})`}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </DCard>
            )}
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="flex flex-col gap-lg pt-lg">
            {refreshing ? (
              <>
                <Skeleton className="h-[280px] rounded-2xl" />
                <Skeleton className="h-[200px] rounded-2xl" />
              </>
            ) : (
              <>
                <DCard>
                  <h3 className="sp-h4 text-foreground">User Information</h3>
                  <p className="sp-caption text-muted-foreground mt-3xs mb-lg">Update this user's details</p>
                  <div className="flex flex-col gap-lg">
                    <div className="grid gap-lg sm:grid-cols-2">
                      <div className="flex flex-col gap-2xs">
                        <Label className="sp-label">Full Name</Label>
                        <Input value={editName} onChange={(e) => setEditName(e.target.value)} disabled={saving} />
                      </div>
                      <div className="flex flex-col gap-2xs">
                        <Label className="sp-label">Email</Label>
                        <Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} type="email" disabled={saving} />
                      </div>
                    </div>
                    <div className="grid gap-lg sm:grid-cols-3">
                      <div className="flex flex-col gap-2xs">
                        <Label className="sp-label">Role</Label>
                        <Select value={editRole} onValueChange={setEditRole} disabled={saving}>
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
                      <div className="flex flex-col gap-2xs">
                        <Label className="sp-label">Status</Label>
                        <Select value={editStatus} onValueChange={setEditStatus} disabled={saving}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="invited">Invited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-2xs">
                        <Label className="sp-label">Plan</Label>
                        <Select value={editPlan} onValueChange={setEditPlan} disabled={saving}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button onClick={handleSave} disabled={saving || !editName.trim() || !editEmail.trim()}>
                        {saving ? (
                          <><Loader2 className="size-[14px] mr-xs animate-spin" /> Saving...</>
                        ) : (
                          <><Save className="size-[14px] mr-xs" /> Save Changes</>
                        )}
                      </Button>
                    </div>
                  </div>
                </DCard>

                {/* Danger Zone */}
                <DCard className="!border-destructive-border">
                  <h3 className="sp-h4 text-destructive flex items-center gap-xs">
                    <AlertTriangle className="size-[16px]" />
                    Danger Zone
                  </h3>
                  <p className="sp-caption text-muted-foreground mt-3xs mb-lg">Irreversible actions for this user account</p>
                  <div className="flex flex-col gap-md">
                    <div className="flex items-center justify-between rounded-xl border border-border-subtle p-lg">
                      <div>
                        <p className="sp-body-semibold text-foreground">Deactivate User</p>
                        <p className="sp-caption text-muted-foreground mt-2xs">User will lose access but data is preserved</p>
                      </div>
                      <Button variant="outline" onClick={() => setDeactivateDialog(true)}>
                        <UserMinus className="size-[14px] mr-xs" /> Deactivate
                      </Button>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-destructive-subtle p-lg">
                      <div>
                        <p className="sp-body-semibold text-foreground">Delete User</p>
                        <p className="sp-caption text-muted-foreground mt-2xs">Permanently remove this user and all their data</p>
                      </div>
                      <Button variant="destructive" onClick={() => setDeleteDialog(true)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </DCard>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Deactivate AlertDialog */}
        <AlertDialog open={deactivateDialog} onOpenChange={setDeactivateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate {user.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This user will lose access to the platform. Their data will be preserved and you can reactivate them later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeactivate}>Deactivate</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete AlertDialog */}
        <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {user.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this user account and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive" onClick={handleDelete}>
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
