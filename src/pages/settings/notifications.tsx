import { useState, useEffect, useCallback } from "react"
import {
  Bell,
  Mail,
  Webhook,
  RefreshCw,
  WifiOff,
  Loader2,
  Save,
  TestTube,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
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

function NotificationsSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <Skeleton className="h-[10px] w-[60px] rounded" />
      <Skeleton className="h-[28px] w-[150px] rounded" />
      <Skeleton className="h-[400px] rounded-2xl" />
      <Skeleton className="h-[400px] rounded-2xl" />
      <Skeleton className="h-[180px] rounded-2xl" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface NotificationSetting {
  id: string
  label: string
  description: string
  email: boolean
  push: boolean
}

const defaultSettings: NotificationSetting[] = [
  { id: "new-sale", label: "New Sale", description: "When a new order is placed", email: true, push: true },
  { id: "new-user", label: "New User Signup", description: "When someone creates an account", email: true, push: false },
  { id: "low-stock", label: "Low Stock Alert", description: "When product inventory is below threshold", email: true, push: true },
  { id: "report-ready", label: "Report Ready", description: "When a scheduled report is generated", email: true, push: false },
  { id: "payment-failed", label: "Payment Failed", description: "When a payment attempt fails", email: true, push: true },
  { id: "team-invite", label: "Team Invitation", description: "When a team member accepts an invite", email: false, push: true },
  { id: "security", label: "Security Alerts", description: "Login from new device or password changes", email: true, push: true },
  { id: "product-update", label: "Product Updates", description: "New features and improvements", email: true, push: false },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState(defaultSettings)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [webhookEnabled, setWebhookEnabled] = useState(false)

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
    setTimeout(() => { setRefreshing(false); toast.success("Preferences refreshed") }, 800)
  }, [])

  function toggleEmail(id: string) {
    setSettings(settings.map((s) => s.id === id ? { ...s, email: !s.email } : s))
  }

  function togglePush(id: string) {
    setSettings(settings.map((s) => s.id === id ? { ...s, push: !s.push } : s))
  }

  const handleSavePreferences = useCallback(() => {
    setSaving(true)
    setTimeout(() => { setSaving(false); toast.success("Notification preferences saved") }, 800)
  }, [])

  const handleTestWebhook = useCallback(() => {
    toast("Sending test webhook...")
    setTimeout(() => toast.success("Webhook test successful"), 1000)
  }, [])

  const handleSaveWebhook = useCallback(() => {
    setSaving(true)
    setTimeout(() => { setSaving(false); toast.success("Webhook configuration saved") }, 800)
  }, [])

  if (loading) return <NotificationsSkeleton />

  const emailCount = settings.filter((s) => s.email).length
  const pushCount = settings.filter((s) => s.push).length

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
              <h1 className="sp-h3 text-foreground">Notifications</h1>
            </div>
            <div className="flex items-center gap-2xs text-muted-foreground/50 mt-lg">
              <div className="size-[6px] rounded-full bg-success animate-pulse" />
              <span className="sp-caption">Updated just now</span>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <Button variant="ghost" size="xs" className="size-[28px] p-0 text-muted-foreground/60 hover:text-muted-foreground" onClick={handleRefresh}>
              <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={handleSavePreferences} disabled={saving}>
              {saving ? (
                <><Loader2 className="size-[14px] mr-xs animate-spin" /> Saving...</>
              ) : (
                <><Save className="size-[14px] mr-xs" /> Save All</>
              )}
            </Button>
          </div>
        </div>

        {refreshing ? (
          <>
            <Skeleton className="h-[400px] rounded-2xl" />
            <Skeleton className="h-[400px] rounded-2xl" />
            <Skeleton className="h-[180px] rounded-2xl" />
          </>
        ) : (
          <>
            {/* Email Notifications */}
            <DCard>
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-sm">
                  <div className="size-[36px] rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                    <Mail className="size-[18px] text-primary" />
                  </div>
                  <div>
                    <h3 className="sp-h4 text-foreground">Email Notifications</h3>
                    <p className="sp-caption text-muted-foreground mt-3xs">{emailCount} of {settings.length} enabled</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                {settings.map((setting, i) => (
                  <div key={setting.id}>
                    <div className="flex items-center justify-between py-md">
                      <div className="flex-1">
                        <p className="sp-body-semibold text-foreground">{setting.label}</p>
                        <p className="sp-caption text-muted-foreground mt-2xs">{setting.description}</p>
                      </div>
                      <Switch
                        checked={setting.email}
                        onCheckedChange={() => toggleEmail(setting.id)}
                        aria-label={`Email notification for ${setting.label}`}
                      />
                    </div>
                    {i < settings.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </DCard>

            {/* Push Notifications */}
            <DCard>
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-sm">
                  <div className="size-[36px] rounded-lg bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
                    <Bell className="size-[18px] text-violet-600 dark:text-violet-400" />
                  </div>
                  <div>
                    <h3 className="sp-h4 text-foreground">Push Notifications</h3>
                    <p className="sp-caption text-muted-foreground mt-3xs">{pushCount} of {settings.length} enabled</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col">
                {settings.map((setting, i) => (
                  <div key={setting.id}>
                    <div className="flex items-center justify-between py-md">
                      <div className="flex-1">
                        <p className="sp-body-semibold text-foreground">{setting.label}</p>
                        <p className="sp-caption text-muted-foreground mt-2xs">{setting.description}</p>
                      </div>
                      <Switch
                        checked={setting.push}
                        onCheckedChange={() => togglePush(setting.id)}
                        aria-label={`Push notification for ${setting.label}`}
                      />
                    </div>
                    {i < settings.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </DCard>

            {/* Webhooks */}
            <DCard>
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-sm">
                  <div className="size-[36px] rounded-lg bg-success-subtle flex items-center justify-center">
                    <Webhook className="size-[18px] text-success" />
                  </div>
                  <div>
                    <h3 className="sp-h4 text-foreground">Webhooks</h3>
                    <p className="sp-caption text-muted-foreground mt-3xs">Send real-time notifications to external services</p>
                  </div>
                </div>
                <Switch
                  checked={webhookEnabled}
                  onCheckedChange={setWebhookEnabled}
                  aria-label="Enable webhooks"
                />
              </div>

              {webhookEnabled && (
                <>
                  <Separator className="mb-lg" />
                  <div className="flex flex-col gap-lg">
                    <div className="flex flex-col gap-2xs">
                      <Label className="sp-label">Webhook URL</Label>
                      <Input
                        type="url"
                        placeholder="https://your-service.com/webhook"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                      />
                      <p className="sp-caption text-muted-foreground/60">
                        We'll send POST requests with JSON payloads to this URL
                      </p>
                    </div>
                    <div className="flex justify-end gap-sm">
                      <Button variant="outline" onClick={handleTestWebhook} disabled={!webhookUrl.trim()}>
                        <TestTube className="size-[14px] mr-xs" /> Test Webhook
                      </Button>
                      <Button onClick={handleSaveWebhook} disabled={saving || !webhookUrl.trim()}>
                        {saving ? (
                          <><Loader2 className="size-[14px] mr-xs animate-spin" /> Saving...</>
                        ) : (
                          <><Save className="size-[14px] mr-xs" /> Save</>
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </DCard>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
