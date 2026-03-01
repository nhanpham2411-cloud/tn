import { useState } from "react"
import { Moon, Sun, Monitor, AlertTriangle } from "lucide-react"

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
import { Separator } from "@/components/ui/separator"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { useTheme } from "@/hooks/use-theme"
import { currentUser } from "@/data/users"

export default function GeneralSettingsPage() {
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState(currentUser.name)
  const [email, setEmail] = useState(currentUser.email)
  const [companyName, setCompanyName] = useState("ShopPulse Inc.")
  const [companyUrl, setCompanyUrl] = useState("https://shoppulse.io")
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState("utc-8")

  return (
    <>
      <div>
        <p className="typo-paragraph-sm text-muted-foreground">Settings</p>
        <h1 className="typo-heading-2 text-foreground">General</h1>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your personal information</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-md">
          <div className="grid gap-md sm:grid-cols-2">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Save Profile</Button>
          </div>
        </CardContent>
      </Card>

      {/* Company */}
      <Card>
        <CardHeader>
          <CardTitle>Company</CardTitle>
          <CardDescription>Update your organization details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-md">
          <div className="grid gap-md sm:grid-cols-2">
            <div className="flex flex-col gap-xs">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-xs">
              <Label htmlFor="url">Website</Label>
              <Input id="url" type="url" value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Save Company</Button>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-lg">
          <div className="flex flex-col gap-sm">
            <Label>Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}
              className="grid grid-cols-3 gap-md"
            >
              <Label
                htmlFor="theme-light"
                className="flex flex-col items-center gap-sm rounded-lg border border-border p-md cursor-pointer hover:bg-muted/50 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
              >
                <Sun className="size-lg text-muted-foreground" />
                <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                <span className="typo-paragraph-sm">Light</span>
              </Label>
              <Label
                htmlFor="theme-dark"
                className="flex flex-col items-center gap-sm rounded-lg border border-border p-md cursor-pointer hover:bg-muted/50 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
              >
                <Moon className="size-lg text-muted-foreground" />
                <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                <span className="typo-paragraph-sm">Dark</span>
              </Label>
              <Label
                htmlFor="theme-system"
                className="flex flex-col items-center gap-sm rounded-lg border border-border p-md cursor-pointer hover:bg-muted/50 has-[button[data-state=checked]]:border-primary has-[button[data-state=checked]]:bg-primary/5"
              >
                <Monitor className="size-lg text-muted-foreground" />
                <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                <span className="typo-paragraph-sm">System</span>
              </Label>
            </RadioGroup>
          </div>

          <Separator />

          <div className="grid gap-md sm:grid-cols-2">
            <div className="flex flex-col gap-xs">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
            <div className="flex flex-col gap-xs">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-xs">
            <AlertTriangle className="size-md" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-md">
          <div className="flex items-center justify-between rounded-lg border border-border p-md">
            <div>
              <p className="typo-paragraph-sm-semibold text-foreground">Export Data</p>
              <p className="typo-paragraph-mini text-muted-foreground">
                Download all your data as a JSON file
              </p>
            </div>
            <Button variant="outline">Export</Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-destructive/50 p-md">
            <div>
              <p className="typo-paragraph-sm-semibold text-foreground">Delete Account</p>
              <p className="typo-paragraph-mini text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your account, all projects, team members, and data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
