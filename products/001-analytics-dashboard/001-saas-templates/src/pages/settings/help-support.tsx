import { useState, useEffect, useCallback } from "react"
import {
  HelpCircle,
  Book,
  MessageSquare,
  Mail,
  ExternalLink,
  Search,
  FileText,
  Video,
  ChevronRight,
  RefreshCw,
  WifiOff,
  Loader2,
  Send,
  CheckCircle2,
  Zap,
  Shield,
  CreditCard,
  Users,
  Package,
  BarChart3,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Thumbnail } from "@/components/ui/thumbnail"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toast } from "sonner"

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

function HelpSkeleton() {
  return (
    <div className="flex flex-col gap-lg">
      <Skeleton className="h-[10px] w-[60px] rounded" />
      <Skeleton className="h-[28px] w-[180px] rounded" />
      <Skeleton className="h-[48px] rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl" />)}
      </div>
      <Skeleton className="h-[300px] rounded-2xl" />
      <Skeleton className="h-[320px] rounded-2xl" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const quickLinks = [
  {
    icon: Book,
    title: "Documentation",
    description: "Browse our comprehensive guides and API docs",
    action: "View Docs",
    color: "primary" as const,
  },
  {
    icon: Video,
    title: "Video Tutorials",
    description: "Watch step-by-step walkthroughs",
    action: "Watch Now",
    color: "primary" as const,
  },
  {
    icon: MessageSquare,
    title: "Community Forum",
    description: "Connect with other ShopPulse users",
    action: "Join Forum",
    color: "success" as const,
  },
]

const faqCategories = [
  { icon: Zap, label: "Getting Started", value: "getting-started" },
  { icon: CreditCard, label: "Billing", value: "billing" },
  { icon: Shield, label: "Security", value: "security" },
  { icon: Users, label: "Team Management", value: "team" },
  { icon: Package, label: "Products", value: "products" },
  { icon: BarChart3, label: "Analytics", value: "analytics" },
]

const faqs: Record<string, { question: string; answer: string }[]> = {
  "getting-started": [
    { question: "How do I set up my first store?", answer: "Navigate to Dashboard > Products and click \"Add Product\" to start building your catalog. You can import products in bulk via CSV or add them individually. Our onboarding wizard will guide you through the initial setup including payment processing and shipping options." },
    { question: "Can I import data from another platform?", answer: "Yes! ShopPulse supports importing from Shopify, WooCommerce, and CSV files. Go to Settings > Import/Export to get started. The import process handles products, orders, and customer data automatically." },
    { question: "How do I customize my dashboard?", answer: "Click the gear icon on any dashboard widget to configure it. You can rearrange widgets by dragging, hide ones you don't need, and add custom KPI cards. Changes are saved automatically to your account." },
  ],
  billing: [
    { question: "How do I upgrade my plan?", answer: "Go to Settings > Billing and select your desired plan. Upgrades take effect immediately and are prorated for the current billing cycle. You can also contact our sales team for custom Enterprise pricing." },
    { question: "Can I get a refund?", answer: "We offer a 14-day money-back guarantee for new subscriptions. For existing subscriptions, please contact our billing support team at billing@shoppulse.io and we'll review your request within 24 hours." },
    { question: "What payment methods do you accept?", answer: "We accept Visa, Mastercard, American Express, and PayPal. For Enterprise plans, we also support wire transfers and purchase orders. All payments are processed securely through Stripe." },
  ],
  security: [
    { question: "How do I enable two-factor authentication?", answer: "Go to Settings > General > Password & Security and toggle on Two-Factor Authentication. You can use any TOTP-compatible app like Google Authenticator or Authy. We also support hardware security keys (FIDO2/WebAuthn)." },
    { question: "What happens if I lose access to my 2FA device?", answer: "During 2FA setup, you'll receive backup recovery codes. Store these securely. If you lose both your device and backup codes, contact our security team with identity verification to regain account access." },
    { question: "Is my data encrypted?", answer: "Yes. All data is encrypted at rest using AES-256 and in transit using TLS 1.3. We also support customer-managed encryption keys (CMEK) on Enterprise plans for additional security control." },
  ],
  team: [
    { question: "How do I invite team members?", answer: "Navigate to Management > Users and click \"Invite User\". Enter their email address and select a role (Admin, Editor, Viewer, Billing, or Developer). They'll receive an invitation email to join your workspace." },
    { question: "What are the different user roles?", answer: "Admin: Full access to all features. Editor: Can manage products, orders, and content. Viewer: Read-only access to dashboards and reports. Billing: Access to billing and invoices only. Developer: API access and webhook configuration." },
    { question: "Can I set up SSO for my team?", answer: "SSO (SAML 2.0 and OAuth) is available on Enterprise plans. Go to Settings > Security > SSO Configuration to set up your identity provider. We support Okta, Azure AD, Google Workspace, and any SAML 2.0 compliant provider." },
  ],
  products: [
    { question: "How do I manage inventory?", answer: "Each product has an inventory section where you can set stock quantities, low-stock thresholds, and enable automatic stock alerts. For multi-location inventory, upgrade to the Pro plan for warehouse management features." },
    { question: "Can I set up product variants?", answer: "Yes! When editing a product, click \"Add Variants\" to create options like size, color, or material. Each variant can have its own price, SKU, and inventory level. You can manage up to 100 variants per product." },
    { question: "How do bulk product updates work?", answer: "Go to Management > Products, select multiple products using checkboxes, and click the bulk action menu. You can update prices, categories, status, and tags in bulk. For larger updates, use our CSV import/export feature." },
  ],
  analytics: [
    { question: "How often is analytics data updated?", answer: "Dashboard analytics are updated in real-time for most metrics. Revenue and conversion reports are processed hourly. Custom reports scheduled via Reports > Schedule run at your configured frequency (daily, weekly, or monthly)." },
    { question: "Can I export analytics data?", answer: "Yes! Every chart and report has a download button supporting CSV, PDF, and PNG formats. For automated exports, use our API or set up scheduled report emails from Dashboard > Reports." },
    { question: "What metrics are tracked?", answer: "We track revenue, orders, conversion rate, average order value, customer lifetime value, traffic sources, product performance, and more. Custom metrics can be created using our analytics API on Pro and Enterprise plans." },
  ],
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HelpSupportPage() {
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<"online" | "offline">("online")
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [faqCategory, setFaqCategory] = useState("getting-started")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Contact form
  const [ticketSubject, setTicketSubject] = useState("")
  const [ticketCategory, setTicketCategory] = useState("")
  const [ticketMessage, setTicketMessage] = useState("")

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
    setTimeout(() => { setRefreshing(false); toast.success("Help content refreshed") }, 800)
  }, [])

  const handleSubmitTicket = useCallback(() => {
    if (!ticketSubject.trim() || !ticketCategory || !ticketMessage.trim()) {
      toast.error("Please fill in all fields")
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      setTicketSubject("")
      setTicketCategory("")
      setTicketMessage("")
      toast.success("Support ticket submitted successfully")
    }, 1200)
  }, [ticketSubject, ticketCategory, ticketMessage])

  if (loading) return <HelpSkeleton />

  // Filter FAQs by search
  const currentFaqs = faqs[faqCategory] ?? []
  const filteredFaqs = searchQuery.trim()
    ? Object.values(faqs).flat().filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentFaqs

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col gap-lg">
        {/* Offline banner */}
        {connectionStatus === "offline" && (
          <div className="flex items-center gap-sm px-lg py-sm rounded-xl bg-warning-subtle border border-warning-border text-warning-subtle-foreground">
            <WifiOff className="size-[16px] shrink-0" />
            <p className="sp-body-medium flex-1">You're offline. Some help content may not be available.</p>
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
              <h1 className="sp-h3 text-foreground">Help & Support</h1>
            </div>
            <div className="hidden sm:flex items-center gap-2xs text-muted-foreground mt-lg">
              <div className="size-[6px] rounded-full bg-success animate-pulse" />
              <span className="sp-caption">Updated just now</span>
            </div>
          </div>
          <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-muted-foreground shrink-0" onClick={handleRefresh} aria-label="Refresh">
            <RefreshCw className={`size-[13px] ${refreshing ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {refreshing ? (
          <>
            <Skeleton className="h-[48px] rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-[120px] rounded-2xl" />)}
            </div>
            <Skeleton className="h-[300px] rounded-2xl" />
            <Skeleton className="h-[320px] rounded-2xl" />
          </>
        ) : (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-md top-1/2 -translate-y-1/2 size-[16px] text-muted-foreground" />
              <Input
                placeholder="Search help articles, FAQs, and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-2xl"
                aria-label="Search"
              />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg stagger-children">
              {quickLinks.map((link) => (
                <DCard key={link.title} className="flex flex-col gap-md cursor-pointer hover:border-border dark:hover:border-border transition-colors">
                  <div className="flex items-center gap-sm">
                    <Thumbnail type="icon" color={link.color} icon={<link.icon className="size-[18px]" />} />
                    <div className="flex-1">
                      <h3 className="sp-body-semibold text-foreground">{link.title}</h3>
                      <p className="sp-caption text-muted-foreground mt-2xs">{link.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="self-start sp-caption text-muted-foreground gap-2xs"
                    onClick={() => toast(`Opening ${link.title}...`)}
                  >
                    {link.action} <ExternalLink className="size-[11px]" />
                  </Button>
                </DCard>
              ))}
            </div>

            {/* FAQ */}
            <DCard>
              <div className="flex items-center gap-sm mb-lg">
                <Thumbnail type="icon" color="primary" icon={<HelpCircle className="size-[18px]" />} />
                <div>
                  <h3 className="sp-h4 text-foreground">Frequently Asked Questions</h3>
                  <p className="sp-caption text-muted-foreground mt-3xs">
                    {searchQuery.trim() ? `${filteredFaqs.length} results for "${searchQuery}"` : `${currentFaqs.length} articles in ${faqCategories.find((c) => c.value === faqCategory)?.label}`}
                  </p>
                </div>
              </div>

              {/* Category tabs */}
              {!searchQuery.trim() && (
                <div className="flex flex-wrap gap-xs mb-lg">
                  {faqCategories.map((cat) => (
                    <Button
                      key={cat.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => setFaqCategory(cat.value)}
                      className={`inline-flex items-center gap-xs rounded-full sp-caption font-medium transition-colors ${
                        faqCategory === cat.value
                          ? "bg-foreground text-background hover:bg-foreground hover:text-background"
                          : "bg-muted text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <cat.icon className="size-[13px]" />
                      {cat.label}
                    </Button>
                  ))}
                </div>
              )}

              {/* FAQ items */}
              {filteredFaqs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-2xl text-center">
                  <Thumbnail type="icon" shape="circle" size="default" color="surface" icon={<FileText className="size-[18px]" />} className="mb-md" />
                  <p className="sp-body-semibold text-foreground">No articles found</p>
                  <p className="sp-caption text-muted-foreground mt-2xs">Try a different search term or browse categories</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border-border-subtle">
                      <AccordionTrigger className="sp-body-semibold text-foreground text-left hover:no-underline py-md">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="sp-body text-muted-foreground pb-md">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </DCard>

            {/* Contact Support */}
            <DCard>
              <div className="flex items-center gap-sm mb-lg">
                <Thumbnail type="icon" color="primary" icon={<Mail className="size-[18px]" />} />
                <div>
                  <h3 className="sp-h4 text-foreground">Contact Support</h3>
                  <p className="sp-caption text-muted-foreground mt-3xs">Can't find what you need? Our team typically responds within 4 hours.</p>
                </div>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-2xl text-center">
                  <Thumbnail type="icon" shape="circle" size="lg" color="success" icon={<CheckCircle2 className="size-[24px]" />} className="mb-md" />
                  <p className="sp-h4 text-foreground">Ticket Submitted!</p>
                  <p className="sp-body text-muted-foreground mt-xs max-w-[400px]">
                    We've received your request and will get back to you at your account email within 4 hours. Check your inbox for a confirmation.
                  </p>
                  <Button variant="outline" className="mt-lg" onClick={() => setSubmitted(false)}>
                    Submit Another Ticket
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-lg">
                  <div className="grid gap-lg sm:grid-cols-2">
                    <div className="flex flex-col gap-2xs">
                      <Label className="sp-label">Subject</Label>
                      <Input
                        placeholder="Brief description of your issue"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                    <div className="flex flex-col gap-2xs">
                      <Label className="sp-label">Category</Label>
                      <Select value={ticketCategory} onValueChange={setTicketCategory} disabled={submitting}>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="billing">Billing Issue</SelectItem>
                          <SelectItem value="account">Account Help</SelectItem>
                          <SelectItem value="integration">Integration Support</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2xs">
                    <Label className="sp-label">Message</Label>
                    <Textarea
                      placeholder="Describe your issue in detail. Include steps to reproduce if reporting a bug..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      rows={5}
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="sp-caption text-muted-foreground">
                      You can also email us directly at support@shoppulse.io
                    </p>
                    <Button onClick={handleSubmitTicket} disabled={submitting || !ticketSubject.trim() || !ticketCategory || !ticketMessage.trim()}>
                      {submitting ? (
                        <><Loader2 className="size-[14px] mr-xs animate-spin" /> Submitting...</>
                      ) : (
                        <><Send className="size-[14px] mr-xs" /> Submit Ticket</>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DCard>

            {/* System Status */}
            <DCard>
              <div className="flex items-center justify-between mb-lg">
                <div className="flex items-center gap-sm">
                  <Thumbnail type="icon" color="success" icon={<CheckCircle2 className="size-[18px]" />} />
                  <div>
                    <h3 className="sp-h4 text-foreground">System Status</h3>
                    <p className="sp-caption text-muted-foreground mt-3xs">All systems operational</p>
                  </div>
                </div>
                <Button variant="ghost" size="xs" className="sp-caption text-muted-foreground gap-2xs" onClick={() => toast("Opening status page...")}>
                  View Status Page <ChevronRight className="size-[13px]" />
                </Button>
              </div>
              <div className="flex flex-col gap-sm">
                {[
                  { name: "API", status: "operational" },
                  { name: "Dashboard", status: "operational" },
                  { name: "Webhooks", status: "operational" },
                  { name: "Payment Processing", status: "operational" },
                ].map((service) => (
                  <div key={service.name} className="flex items-center justify-between py-xs">
                    <p className="sp-body text-foreground">{service.name}</p>
                    <span className="inline-flex items-center gap-xs sp-caption text-success">
                      <span className="size-[6px] rounded-full bg-success" />
                      Operational
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-md" />
              <p className="sp-caption text-muted-foreground text-center">
                Uptime: 99.98% over the last 90 days · Last incident: 14 days ago
              </p>
            </DCard>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
