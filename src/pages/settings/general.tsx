import { useState, useEffect, useCallback } from "react"
import {
  Moon,
  Sun,
  Monitor,
  AlertTriangle,
  RefreshCw,
  WifiOff,
  Loader2,
  Save,
  Download,
  Trash2,
  Shield,
  Smartphone,
  Globe,
  Laptop,
  LogOut,
  Camera,
  Eye,
  EyeOff,
  Key,
  Clock,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

import { useTheme } from "@/hooks/use-theme"
import { currentUser } from "@/data/users"

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

function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <Skeleton className="h-[10px] w-[60px] rounded" />
      <Skeleton className="h-[28px] w-[120px] rounded" />
      <Skeleton className="h-[140px] rounded-2xl" />
      <Skeleton className="h-[200px] rounded-2xl" />
      <Skeleton className="h-[200px] rounded-2xl" />
      <Skeleton className="h-[260px] rounded-2xl" />
      <Skeleton className="h-[200px] rounded-2xl" />
      <Skeleton className="h-[180px] rounded-2xl" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const sessions = [
  { id: "s1", device: "MacBook Pro", browser: "Chrome 122", location: "Ho Chi Minh City, VN", lastActive: "Active now", icon: Laptop, current: true },
  { id: "s2", device: "iPhone 15 Pro", browser: "Safari 18", location: "Ho Chi Minh City, VN", lastActive: "2h ago", icon: Smartphone, current: false },
  { id: "s3", device: "Windows Desktop", browser: "Firefox 124", location: "Hanoi, VN", lastActive: "3 days ago", icon: Globe, current: false },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function GeneralSettingsPage() {
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [refreshing, setRefreshing] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingCompany, setSavingCompany] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState(false)
  const [revokeDialog, setRevokeDialog] = useState<string | null>(null)

  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [companyName, setCompanyName] = useState("ShopPulse Inc.")
  const [companyUrl, setCompanyUrl] = useState("https://shoppulse.io")
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState("utc-8")

  // Password
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)

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
    setTimeout(() => { setRefreshing(false); toast.success("Settings refreshed") }, 800)
  }, [])

  const handleSaveProfile = useCallback(() => {
    setSavingProfile(true)
    setTimeout(() => { setSavingProfile(false); toast.success("Profile saved") }, 800)
  }, [])

  const handleSaveCompany = useCallback(() => {
    setSavingCompany(true)
    setTimeout(() => { setSavingCompany(false); toast.success("Company details saved") }, 800)
  }, [])

  const handleChangePassword = useCallback(() => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setSavingPassword(true)
    setTimeout(() => {
      setSavingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("Password updated successfully")
    }, 800)
  }, [newPassword, confirmPassword])

  const handleToggle2FA = useCallback((checked: boolean) => {
    setTwoFactorEnabled(checked)
    toast.success(checked ? "Two-factor authentication enabled" : "Two-factor authentication disabled")
  }, [])

  const handleRevokeSession = useCallback(() => {
    setRevokeDialog(null)
    toast.success("Session revoked successfully")
  }, [])

  const handleUploadAvatar = useCallback(() => {
    toast("Uploading avatar...")
    setTimeout(() => toast.success("Avatar updated"), 800)
  }, [])

  const handleExport = useCallback(() => {
    toast("Exporting data...")
    setTimeout(() => toast.success("Data exported successfully"), 1200)
  }, [])

  const handleDelete = useCallback(() => {
    setDeleteDialog(false)
    toast.success("Account deletion request submitted")
  }, [])

  if (loading) return <SettingsSkeleton />

  const themeOptions = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ] as const

  const canChangePassword = currentPassword.trim() && newPassword.trim() && confirmPassword.trim()
  const passwordMismatch = confirmPassword && newPassword !== confirmPassword

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-lg">
        {/* Offline banner */}
        {connectionStatus === "offline" && (
          <div className="flex items-center gap-sm px-lg py-sm rounded-xl bg-warning-subtle border border-warning-border/20 text-warning-subtle-foreground">
            <WifiOff className="size-[16px] shrink-0" />
            <p className="sp-body-medium flex-1">You're offline. Changes may not be saved.</p>
            <Button variant="ghost" size="xs" className="text-warning-subtle-foreground hover:text-warning" onClick={() => window.location.reload()}>
              <RefreshCw className="size-[13px]" /> Reconnect
            </Button>
          </div>
        )}

        {/* Page header */}
        <div className="flex items-center justify-between gap-sm">
          <div className="flex items-center gap-sm sm:gap-lg min-w-0">
            <div>
              <p className="sp-caption text-muted-foreground">Settings</p>
              <h1 className="sp-h3 text-foreground">General</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2xs text-muted-foreground/50 mt-lg">
              <div className="size-[6px] rounded-full bg-success animate-pulse" />
              <span className="sp-caption">Updated just now</span>
            </div>
          </div>
          <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground shrink-0" onClick={handleRefresh} aria-label="Refresh">
            <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {refreshing ? (
          <>
            <Skeleton className="h-[140px] rounded-2xl" />
            <Skeleton className="h-[200px] rounded-2xl" />
            <Skeleton className="h-[200px] rounded-2xl" />
            <Skeleton className="h-[260px] rounded-2xl" />
            <Skeleton className="h-[200px] rounded-2xl" />
            <Skeleton className="h-[180px] rounded-2xl" />
          </>
        ) : (
          <>
            {/* Profile with Avatar */}
            <DCard>
              <div className="flex items-center justify-between mb-lg">
                <div>
                  <h3 className="sp-h4 text-foreground">Profile</h3>
                  <p className="sp-caption text-muted-foreground mt-3xs">Manage your personal information</p>
                </div>
              </div>
              <div className="flex flex-col gap-lg">
                {/* Avatar */}
                <div className="flex items-center gap-lg">
                  <div className="relative group">
                    <Avatar className="size-[64px]">
                      <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-[18px] font-semibold">{currentUser.avatar}</AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleUploadAvatar}
                      className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label="Upload avatar"
                    >
                      <Camera className="size-[18px] text-white" />
                    </button>
                  </div>
                  <div>
                    <p className="sp-body-semibold text-foreground">{name}</p>
                    <p className="sp-caption text-muted-foreground">{email}</p>
                    <Button variant="ghost" size="xs" className="mt-xs text-muted-foreground h-auto p-0 hover:text-foreground" onClick={handleUploadAvatar}>
                      Change photo
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Name + Email */}
                <div className="grid gap-lg sm:grid-cols-2">
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Full Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} disabled={savingProfile} />
                  </div>
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Email Address</Label>
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={savingProfile} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={savingProfile || !name.trim() || !email.trim()}>
                    {savingProfile ? (
                      <><Loader2 className="size-[14px] mr-xs animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="size-[14px] mr-xs" /> Save Profile</>
                    )}
                  </Button>
                </div>
              </div>
            </DCard>

            {/* Password & Security */}
            <DCard>
              <div className="flex items-center gap-sm mb-lg">
                <div className="size-[36px] rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  <Key className="size-[18px] text-primary" />
                </div>
                <div>
                  <h3 className="sp-h4 text-foreground">Password & Security</h3>
                  <p className="sp-caption text-muted-foreground mt-3xs">Manage your password and security settings</p>
                </div>
              </div>
              <div className="flex flex-col gap-lg">
                <div className="flex flex-col gap-2xs">
                  <Label className="sp-label">Current Password</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      disabled={savingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-md top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showCurrentPw ? "Hide password" : "Show password"}
                    >
                      {showCurrentPw ? <EyeOff className="size-[14px]" /> : <Eye className="size-[14px]" />}
                    </button>
                  </div>
                </div>
                <div className="grid gap-lg sm:grid-cols-2">
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">New Password</Label>
                    <div className="relative">
                      <Input
                        type={showNewPw ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={savingPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-md top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showNewPw ? "Hide password" : "Show password"}
                      >
                        {showNewPw ? <EyeOff className="size-[14px]" /> : <Eye className="size-[14px]" />}
                      </button>
                    </div>
                    {newPassword && newPassword.length < 8 && (
                      <p className="sp-caption text-destructive">Must be at least 8 characters</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Confirm New Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      disabled={savingPassword}
                      aria-invalid={passwordMismatch ? true : undefined}
                    />
                    {passwordMismatch && (
                      <p className="sp-caption text-destructive">Passwords do not match</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleChangePassword} disabled={savingPassword || !canChangePassword}>
                    {savingPassword ? (
                      <><Loader2 className="size-[14px] mr-xs animate-spin" /> Updating...</>
                    ) : (
                      <><Key className="size-[14px] mr-xs" /> Update Password</>
                    )}
                  </Button>
                </div>

                <Separator />

                {/* 2FA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className="size-[36px] rounded-lg bg-success-subtle flex items-center justify-center">
                      <Shield className="size-[18px] text-success" />
                    </div>
                    <div>
                      <p className="sp-body-semibold text-foreground">Two-Factor Authentication</p>
                      <p className="sp-caption text-muted-foreground mt-2xs">Add an extra layer of security to your account</p>
                    </div>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggle2FA}
                    aria-label="Toggle two-factor authentication"
                  />
                </div>
                {twoFactorEnabled && (
                  <div className="flex items-center gap-sm px-lg py-sm rounded-xl bg-success-subtle border border-success-border/20 text-success-subtle-foreground">
                    <Shield className="size-[14px] shrink-0" />
                    <p className="sp-caption">2FA is active via authenticator app. Last verified 2 days ago.</p>
                  </div>
                )}
              </div>
            </DCard>

            {/* Active Sessions */}
            <DCard>
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-sm">
                  <div className="size-[36px] rounded-lg bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                    <Clock className="size-[18px] text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="sp-h4 text-foreground">Active Sessions</h3>
                    <p className="sp-caption text-muted-foreground mt-3xs">{sessions.length} devices logged in</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => { toast.success("All other sessions revoked") }}
                >
                  <LogOut className="size-[14px] mr-xs" /> Revoke All
                </Button>
              </div>
              <div className="flex flex-col">
                {sessions.map((session, i) => (
                  <div key={session.id}>
                    <div className="flex items-center justify-between py-md">
                      <div className="flex items-center gap-sm">
                        <div className="size-[36px] rounded-lg bg-muted flex items-center justify-center">
                          <session.icon className="size-[18px] text-muted-foreground" />
                        </div>
                        <div>
                          <div className="flex items-center gap-xs">
                            <p className="sp-body-semibold text-foreground">{session.device}</p>
                            {session.current && (
                              <span className="inline-flex items-center gap-xs px-sm py-3xs rounded-full bg-success-subtle text-success-subtle-foreground border border-success-border/20 sp-caption font-medium">
                                <span className="size-[5px] rounded-full bg-success" />
                                This device
                              </span>
                            )}
                          </div>
                          <p className="sp-caption text-muted-foreground mt-2xs">
                            {session.browser} · {session.location} · {session.lastActive}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <Button
                          variant="ghost"
                          size="xs"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setRevokeDialog(session.id)}
                          aria-label="Revoke session"
                        >
                          <LogOut className="size-[13px]" />
                        </Button>
                      )}
                    </div>
                    {i < sessions.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </DCard>

            {/* Company */}
            <DCard>
              <h3 className="sp-h4 text-foreground">Company</h3>
              <p className="sp-caption text-muted-foreground mt-3xs mb-lg">Update your organization details</p>
              <div className="flex flex-col gap-lg">
                <div className="grid gap-lg sm:grid-cols-2">
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Company Name</Label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} disabled={savingCompany} />
                  </div>
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Website</Label>
                    <Input type="url" value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} disabled={savingCompany} />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveCompany} disabled={savingCompany || !companyName.trim()}>
                    {savingCompany ? (
                      <><Loader2 className="size-[14px] mr-xs animate-spin" /> Saving...</>
                    ) : (
                      <><Save className="size-[14px] mr-xs" /> Save Company</>
                    )}
                  </Button>
                </div>
              </div>
            </DCard>

            {/* Appearance */}
            <DCard>
              <h3 className="sp-h4 text-foreground">Appearance</h3>
              <p className="sp-caption text-muted-foreground mt-3xs mb-lg">Customize the look and feel</p>
              <div className="flex flex-col gap-lg">
                <div className="flex flex-col gap-sm">
                  <Label className="sp-label">Theme</Label>
                  <RadioGroup
                    value={theme}
                    onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-md"
                  >
                    {themeOptions.map((opt) => (
                      <Label
                        key={opt.value}
                        htmlFor={`theme-${opt.value}`}
                        className="flex flex-col items-center gap-sm rounded-xl border border-border/60 dark:border-border-subtle p-lg cursor-pointer hover:bg-muted/50 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5 transition-colors"
                      >
                        <opt.icon className="size-[20px] text-muted-foreground" />
                        <RadioGroupItem value={opt.value} id={`theme-${opt.value}`} className="sr-only" />
                        <span className="sp-body-medium">{opt.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <Separator />

                <div className="grid gap-lg sm:grid-cols-2">
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="vi">Vietnamese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="utc-8">Pacific Time (UTC-8)</SelectItem>
                        <SelectItem value="utc-5">Eastern Time (UTC-5)</SelectItem>
                        <SelectItem value="utc+0">UTC</SelectItem>
                        <SelectItem value="utc+1">Central European (UTC+1)</SelectItem>
                        <SelectItem value="utc+7">Indochina Time (UTC+7)</SelectItem>
                        <SelectItem value="utc+9">Japan/Korea (UTC+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </DCard>

            {/* Danger Zone */}
            <DCard className="!border-destructive/30">
              <h3 className="sp-h4 text-destructive flex items-center gap-xs">
                <AlertTriangle className="size-[16px]" />
                Danger Zone
              </h3>
              <p className="sp-caption text-muted-foreground mt-3xs mb-lg">Irreversible actions</p>
              <div className="flex flex-col gap-md">
                <div className="flex items-center justify-between rounded-xl border border-border/60 dark:border-border-subtle p-lg">
                  <div>
                    <p className="sp-body-semibold text-foreground">Export Data</p>
                    <p className="sp-caption text-muted-foreground mt-2xs">Download all your data as a JSON file</p>
                  </div>
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="size-[14px] mr-xs" /> Export
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-destructive/30 p-lg">
                  <div>
                    <p className="sp-body-semibold text-foreground">Delete Account</p>
                    <p className="sp-caption text-muted-foreground mt-2xs">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive" onClick={() => setDeleteDialog(true)}>
                    <Trash2 className="size-[14px] mr-xs" /> Delete
                  </Button>
                </div>
              </div>
            </DCard>
          </>
        )}

        {/* Delete AlertDialog */}
        <AlertDialog open={deleteDialog} onOpenChange={setDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete your account, all projects, team members, and data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDelete}>
                Delete Everything
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Revoke Session AlertDialog */}
        <AlertDialog open={!!revokeDialog} onOpenChange={(open) => !open && setRevokeDialog(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Revoke this session?</AlertDialogTitle>
              <AlertDialogDescription>
                This device will be signed out immediately. They will need to log in again to access the account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleRevokeSession}>
                Revoke Session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </TooltipProvider>
  )
}
