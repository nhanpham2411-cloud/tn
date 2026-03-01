import { useState } from "react"
import { Bell, Mail, Webhook } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

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

export default function NotificationsPage() {
  const [settings, setSettings] = useState(defaultSettings)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [webhookEnabled, setWebhookEnabled] = useState(false)

  function toggleEmail(id: string) {
    setSettings(settings.map((s) => s.id === id ? { ...s, email: !s.email } : s))
  }

  function togglePush(id: string) {
    setSettings(settings.map((s) => s.id === id ? { ...s, push: !s.push } : s))
  }

  return (
    <>
      <div>
        <p className="typo-paragraph-sm text-muted-foreground">Settings</p>
        <h1 className="typo-heading-2 text-foreground">Notifications</h1>
      </div>

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Mail className="size-md" />
            Email Notifications
          </CardTitle>
          <CardDescription>Choose which emails you want to receive</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {settings.map((setting, i) => (
              <div key={setting.id}>
                <div className="flex items-center justify-between py-sm">
                  <div className="flex-1">
                    <p className="typo-paragraph-sm-semibold text-foreground">{setting.label}</p>
                    <p className="typo-paragraph-mini text-muted-foreground">{setting.description}</p>
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
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Bell className="size-md" />
            Push Notifications
          </CardTitle>
          <CardDescription>In-app and browser push notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col">
            {settings.map((setting, i) => (
              <div key={setting.id}>
                <div className="flex items-center justify-between py-sm">
                  <div className="flex-1">
                    <p className="typo-paragraph-sm-semibold text-foreground">{setting.label}</p>
                    <p className="typo-paragraph-mini text-muted-foreground">{setting.description}</p>
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
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-xs">
            <Webhook className="size-md" />
            Webhooks
          </CardTitle>
          <CardDescription>
            Send real-time notifications to external services
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="typo-paragraph-sm-semibold text-foreground">Enable Webhooks</p>
              <p className="typo-paragraph-mini text-muted-foreground">
                Send event payloads to your endpoint
              </p>
            </div>
            <Switch
              checked={webhookEnabled}
              onCheckedChange={setWebhookEnabled}
              aria-label="Enable webhooks"
            />
          </div>

          {webhookEnabled && (
            <>
              <Separator />
              <div className="flex flex-col gap-xs">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  placeholder="https://your-service.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="typo-paragraph-mini text-muted-foreground">
                  We'll send POST requests with JSON payloads to this URL
                </p>
              </div>
              <div className="flex justify-end gap-sm">
                <Button variant="outline">Test Webhook</Button>
                <Button>Save</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
