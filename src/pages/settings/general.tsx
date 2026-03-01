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
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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
      <Skeleton className="h-[200px] rounded-2xl" />
      <Skeleton className="h-[200px] rounded-2xl" />
      <Skeleton className="h-[200px] rounded-2xl" />
    </div>
  )
}

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
  const [deleteDialog, setDeleteDialog] = useState(false)

  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [companyName, setCompanyName] = useState("ShopPulse Inc.")
  const [companyUrl, setCompanyUrl] = useState("https://shoppulse.io")
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState("utc-8")

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-lg">
            <div>
              <p className="sp-caption text-muted-foreground">Settings</p>
              <h1 className="sp-h3 text-foreground">General</h1>
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

        {refreshing ? (
          <>
            <Skeleton className="h-[200px] rounded-2xl" />
            <Skeleton className="h-[200px] rounded-2xl" />
            <Skeleton className="h-[260px] rounded-2xl" />
          </>
        ) : (
          <>
            {/* Profile */}
            <DCard>
              <h3 className="sp-h4 text-foreground">Profile</h3>
              <p className="sp-caption text-muted-foreground mt-3xs mb-lg">Manage your personal information</p>
              <div className="flex flex-col gap-lg">
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
                    className="grid grid-cols-3 gap-md"
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
      </div>
    </TooltipProvider>
  )
}
