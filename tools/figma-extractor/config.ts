/**
 * Figma Extractor — Configuration
 * Page routes, breakpoints, and token mappings
 */

export const BASE_URL = "http://localhost:5173"

export const PAGES = [
  // Dashboard layout
  { route: "/dashboard", name: "dashboard-overview", category: "dashboard", layout: "dashboard" },
  { route: "/dashboard/analytics", name: "dashboard-analytics", category: "dashboard", layout: "dashboard" },
  { route: "/dashboard/reports", name: "dashboard-reports", category: "dashboard", layout: "dashboard" },
  // Management
  { route: "/management/users", name: "management-users", category: "management", layout: "dashboard" },
  { route: "/management/products", name: "management-products", category: "management", layout: "dashboard" },
  { route: "/management/orders", name: "management-orders", category: "management", layout: "dashboard" },
  { route: "/management/invoices", name: "management-invoices", category: "management", layout: "dashboard" },
  // Settings
  { route: "/settings/general", name: "settings-general", category: "settings", layout: "dashboard" },
  { route: "/settings/notifications", name: "settings-notifications", category: "settings", layout: "dashboard" },
  { route: "/settings/billing", name: "settings-billing", category: "settings", layout: "dashboard" },
  { route: "/settings/help", name: "settings-help", category: "settings", layout: "dashboard" },
  // Auth layout
  { route: "/auth/sign-in", name: "auth-sign-in", category: "auth", layout: "auth" },
  { route: "/auth/sign-up", name: "auth-sign-up", category: "auth", layout: "auth" },
  { route: "/auth/forgot-password", name: "auth-forgot-password", category: "auth", layout: "auth" },
  { route: "/auth/onboarding", name: "auth-onboarding", category: "auth", layout: "auth" },
  // Utility
  { route: "/utility/empty-state", name: "utility-empty-state", category: "utility", layout: "dashboard" },
  { route: "/not-found-page", name: "utility-not-found", category: "utility", layout: "none" },
] as const

export type PageConfig = (typeof PAGES)[number]

export const BREAKPOINTS = [
  { name: "Desktop", width: 1440, height: 900 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Mobile", width: 375, height: 812 },
] as const

export type Breakpoint = (typeof BREAKPOINTS)[number]

// Spacing px → token name
export const SPACING_MAP: Record<number, string> = {
  0: "none", 2: "4xs", 4: "3xs", 6: "2xs", 8: "xs",
  12: "sm", 16: "md", 20: "lg", 24: "xl", 32: "2xl",
  40: "3xl", 48: "4xl", 56: "5xl", 64: "6xl",
}

// Border radius px → token name
export const RADIUS_MAP: Record<number, string> = {
  0: "none", 2: "xs", 4: "sm", 6: "md", 8: "lg",
  10: "10", 12: "xl", 16: "2xl", 24: "3xl", 32: "4xl", 9999: "full",
}

// Text style matching rules
// family regex, weight, size(px), lineHeight(px) → Figma style name
export const TEXT_STYLE_RULES = [
  // Headings (Plus Jakarta Sans)
  { family: /Plus Jakarta/i, weight: 700, minSize: 29, maxSize: 32, style: "sp-h1" },
  { family: /Plus Jakarta/i, weight: 700, minSize: 23, maxSize: 25, style: "sp-h2" },
  { family: /Plus Jakarta/i, weight: 700, minSize: 19, maxSize: 21, style: "sp-h3" },
  { family: /Plus Jakarta/i, weight: 600, minSize: 15, maxSize: 17, style: "sp-h4" },
  { family: /Plus Jakarta/i, weight: 600, minSize: 13, maxSize: 15, style: "sp-h5" },
  // Body (Inter)
  { family: /Inter/i, weight: 400, minSize: 13, maxSize: 15, style: "sp-body" },
  { family: /Inter/i, weight: 500, minSize: 13, maxSize: 15, style: "sp-body-medium" },
  { family: /Inter/i, weight: 600, minSize: 13, maxSize: 15, style: "sp-body-semibold" },
  { family: /Inter/i, weight: 700, minSize: 13, maxSize: 15, style: "sp-body-bold" },
  // Label (Inter 500 12px)
  { family: /Inter/i, weight: 500, minSize: 11, maxSize: 13, style: "sp-label" },
  // Caption (Inter 400 12px)
  { family: /Inter/i, weight: 400, minSize: 11, maxSize: 13, style: "sp-caption" },
  // Caption Medium (Inter 500 11px)
  { family: /Inter/i, weight: 500, minSize: 10, maxSize: 12, style: "sp-caption-medium" },
  // Data/KPI
  { family: /Plus Jakarta/i, weight: 800, minSize: 35, maxSize: 50, style: "sp-kpi-xl" },
  { family: /Plus Jakarta/i, weight: 700, minSize: 23, maxSize: 31, style: "sp-kpi-lg" },
  { family: /Plus Jakarta/i, weight: 700, minSize: 19, maxSize: 23, style: "sp-kpi-md" },
  { family: /Plus Jakarta/i, weight: 600, minSize: 15, maxSize: 19, style: "sp-kpi-sm" },
  // Mono (JetBrains Mono)
  { family: /JetBrains/i, weight: 400, minSize: 11, maxSize: 15, style: "sp-mono" },
  { family: /JetBrains/i, weight: 500, minSize: 11, maxSize: 15, style: "sp-mono-medium" },
]

// Elements to skip during extraction (non-visual, scripts, etc.)
export const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "LINK", "META", "HEAD", "NOSCRIPT", "BR", "HR",
  "TEMPLATE", "SLOT", "DIALOG", "PORTAL",
])

// Elements that are invisible/decorative and should be skipped
export const SKIP_CLASSES = [
  "sr-only", "hidden", "invisible",
]

// Output directory
export const OUTPUT_DIR = "../../products/001-analytics-dashboard/figma-specs/screens"
