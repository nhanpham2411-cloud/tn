import { Check, CreditCard, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const plans = [
  {
    name: "Free",
    price: 0,
    features: ["5 projects", "1 GB storage", "Basic analytics", "Email support"],
    current: false,
  },
  {
    name: "Pro",
    price: 29,
    features: ["Unlimited projects", "50 GB storage", "Advanced analytics", "Priority support", "API access", "Custom reports"],
    current: false,
  },
  {
    name: "Enterprise",
    price: 99,
    features: ["Everything in Pro", "Unlimited storage", "SSO & SAML", "Dedicated account manager", "SLA guarantee", "Custom integrations", "Audit logs"],
    current: true,
  },
]

const usage = [
  { label: "Storage", used: 32.4, total: 100, unit: "GB" },
  { label: "API Calls", used: 847000, total: 1000000, unit: "calls" },
  { label: "Team Members", used: 12, total: 50, unit: "seats" },
  { label: "Projects", used: 8, total: -1, unit: "projects" },
]

const billingHistory = [
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: 99.00, status: "paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: 99.00, status: "paid" },
  { id: "INV-2025-012", date: "Dec 1, 2025", amount: 99.00, status: "paid" },
  { id: "INV-2025-011", date: "Nov 1, 2025", amount: 99.00, status: "paid" },
  { id: "INV-2025-010", date: "Oct 1, 2025", amount: 29.00, status: "paid" },
  { id: "INV-2025-009", date: "Sep 1, 2025", amount: 29.00, status: "paid" },
]

function formatUsage(used: number, unit: string): string {
  if (unit === "calls") return `${(used / 1000).toFixed(0)}K`
  if (unit === "GB") return `${used} GB`
  return `${used}`
}

function formatTotal(total: number, unit: string): string {
  if (total === -1) return "Unlimited"
  if (unit === "calls") return `${(total / 1000000).toFixed(0)}M`
  if (unit === "GB") return `${total} GB`
  return `${total}`
}

export default function BillingPage() {
  return (
    <>
      <div>
        <p className="typo-paragraph-sm text-muted-foreground">Settings</p>
        <h1 className="typo-heading-2 text-foreground">Billing</h1>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>You are on the Enterprise plan</CardDescription>
            </div>
            <Badge>Enterprise</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-md md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-xl border p-lg flex flex-col gap-md ${
                  plan.current
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <div>
                  <h3 className="typo-heading-4 text-foreground">{plan.name}</h3>
                  <div className="flex items-baseline gap-3xs mt-xs">
                    <span className="typo-heading-2 text-foreground">${plan.price}</span>
                    <span className="typo-paragraph-sm text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="flex flex-col gap-xs flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-xs">
                      <Check className="size-sm text-primary shrink-0" />
                      <span className="typo-paragraph-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.current ? "outline" : "default"}
                  className="w-full"
                  disabled={plan.current}
                >
                  {plan.current ? "Current Plan" : plan.price === 0 ? "Downgrade" : "Upgrade"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Current billing period: Feb 1 – Feb 28, 2026</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-lg sm:grid-cols-2">
            {usage.map((item) => {
              const percent = item.total === -1 ? 0 : (item.used / item.total) * 100
              return (
                <div key={item.label} className="flex flex-col gap-xs">
                  <div className="flex items-center justify-between">
                    <span className="typo-paragraph-sm-semibold text-foreground">{item.label}</span>
                    <span className="typo-paragraph-mini text-muted-foreground">
                      {formatUsage(item.used, item.unit)} / {formatTotal(item.total, item.unit)}
                    </span>
                  </div>
                  {item.total !== -1 ? (
                    <Progress value={percent} className="h-2" />
                  ) : (
                    <div className="h-2 rounded-full bg-muted flex items-center justify-center">
                      <span className="typo-paragraph-mini text-muted-foreground">Unlimited</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment details</CardDescription>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-md rounded-lg border border-border p-md">
            <div className="flex size-2xl items-center justify-center rounded-md bg-muted">
              <CreditCard className="size-md text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="typo-paragraph-sm-semibold text-foreground">Visa ending in 4242</p>
              <p className="typo-paragraph-mini text-muted-foreground">Expires 12/2027</p>
            </div>
            <Badge variant="outline">Default</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Download past invoices</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="typo-paragraph-sm-semibold">{invoice.id}</TableCell>
                  <TableCell className="typo-paragraph-sm text-muted-foreground">{invoice.date}</TableCell>
                  <TableCell className="typo-paragraph-sm">${invoice.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="capitalize">{invoice.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" aria-label="Download invoice">
                      <Download className="size-md" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-md" />

          <p className="typo-paragraph-mini text-muted-foreground text-center">
            Need help with billing? Contact support at billing@shoppulse.io
          </p>
        </CardContent>
      </Card>
    </>
  )
}
