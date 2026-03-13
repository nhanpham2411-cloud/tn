/**
 * Screen States — Playwright actions to capture different UI states
 *
 * Each state describes actions to run after page navigation, before DOM extraction.
 * Enables capturing edge cases: validation errors, filled forms, loading skeletons, etc.
 *
 * Usage:
 *   npx tsx extract.ts --states                    # All pages × default + all states
 *   npx tsx extract.ts --states --page auth-sign-in # All states for one page
 *   npx tsx extract.ts --state filled --page auth-sign-in  # Specific state only
 */

export type StateAction =
  | { action: "fill"; selector: string; text: string }
  | { action: "click"; selector: string; force?: boolean }
  | { action: "wait"; ms: number }
  | { action: "waitFor"; selector: string; timeout?: number }
  | { action: "evaluate"; script: string }
  | { action: "press"; key: string }
  | { action: "hover"; selector: string }

export interface ScreenState {
  /** State name — appended to page name for output file (e.g. "filled" → sign-in-filled.json) */
  name: string
  /** Override page.goto waitUntil (default: "networkidle") */
  waitMode?: "domcontentloaded" | "networkidle" | "load"
  /** Skip the 1000ms post-navigation settle wait (useful for loading skeleton capture) */
  skipSettleWait?: boolean
  /** Playwright actions to set up this state */
  actions: StateAction[]
}

export const PAGE_STATES: Record<string, ScreenState[]> = {

  // ═══════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════

  "auth-sign-in": [
    {
      name: "filled",
      actions: [
        { action: "fill", selector: "#email", text: "john@shoppulse.com" },
        { action: "fill", selector: "#password", text: "SecureP@ss123" },
        { action: "wait", ms: 200 },
      ],
    },
    {
      name: "validation-error",
      actions: [
        { action: "fill", selector: "#email", text: "invalid-email" },
        { action: "fill", selector: "#password", text: "short" },
        { action: "click", selector: "button[type='submit']" },
        { action: "waitFor", selector: ".text-destructive", timeout: 3000 },
        // Wait for sonner toast to render and animate in
        { action: "waitFor", selector: "[data-sonner-toast]", timeout: 2000 },
        { action: "wait", ms: 500 },
      ],
    },
  ],

  "auth-sign-up": [
    {
      name: "password-strength",
      actions: [
        { action: "fill", selector: "#name", text: "Alex Rivera" },
        { action: "fill", selector: "#email", text: "alex@shoppulse.com" },
        { action: "fill", selector: "#password", text: "Str0ng!Pass" },
        { action: "wait", ms: 200 },
      ],
    },
    {
      name: "validation-error",
      actions: [
        // Fill all fields to enable button, but with invalid email + weak password
        { action: "fill", selector: "#name", text: "Test User" },
        { action: "fill", selector: "#email", text: "bad-email" },
        { action: "fill", selector: "#password", text: "weak" },
        // Use JS .click() to bypass decorative blur div intercepting pointer events on Mobile
        { action: "evaluate", script: "document.querySelector('#terms').click()" },
        { action: "wait", ms: 500 },
        { action: "evaluate", script: "document.querySelector('button[type=\"submit\"]').click()" },
        { action: "wait", ms: 500 },
        { action: "waitFor", selector: ".text-destructive", timeout: 5000 },
        { action: "waitFor", selector: "[data-sonner-toast]", timeout: 5000 },
      ],
    },
  ],

  "auth-forgot-password": [
    {
      name: "validation-error",
      actions: [
        { action: "fill", selector: "#email", text: "invalid-email" },
        { action: "click", selector: "button[type='submit']" },
        { action: "waitFor", selector: ".text-destructive", timeout: 3000 },
        { action: "waitFor", selector: "[data-sonner-toast]", timeout: 2000 },
      ],
    },
    {
      name: "success",
      actions: [
        { action: "fill", selector: "#email", text: "john@shoppulse.com" },
        { action: "click", selector: "button[type='submit']" },
        { action: "wait", ms: 1500 }, // Wait for 1200ms setTimeout + render
      ],
    },
  ],

  "auth-onboarding": [
    {
      name: "step-2",
      actions: [
        // Fill step 1 fields
        { action: "fill", selector: "#company", text: "Acme Inc." },
        // Open industry select (Radix: role=combobox)
        { action: "click", selector: "[role='combobox']" },
        { action: "wait", ms: 300 },
        // Select "E-commerce" from portal dropdown
        { action: "click", selector: "[role='option']:has-text('E-commerce')" },
        { action: "wait", ms: 300 },
        // Click Continue to advance to step 2
        { action: "click", selector: "button:has-text('Continue')" },
        { action: "wait", ms: 500 },
      ],
    },
    {
      name: "step-3",
      actions: [
        // Fill step 1
        { action: "fill", selector: "#company", text: "Acme Inc." },
        { action: "click", selector: "[role='combobox']" },
        { action: "wait", ms: 300 },
        { action: "click", selector: "[role='option']:has-text('E-commerce')" },
        { action: "wait", ms: 300 },
        // Continue to step 2
        { action: "click", selector: "button:has-text('Continue')" },
        { action: "wait", ms: 500 },
        // Continue to step 3 (step 2 has no required fields)
        { action: "click", selector: "button:has-text('Continue')" },
        { action: "wait", ms: 500 },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // DASHBOARD — Loading skeleton states
  // ═══════════════════════════════════════════════════════════

  "dashboard-overview": [
    {
      name: "loading",
      // networkidle loads page chunk (skeleton visible), skipSettleWait prevents 1s wait that lets loading timeout fire
      skipSettleWait: true,
      actions: [],
    },
  ],

  "dashboard-analytics": [
    {
      name: "loading",
      skipSettleWait: true,
      actions: [],
    },
  ],

  "dashboard-reports": [
    {
      name: "loading",
      skipSettleWait: true,
      actions: [],
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  "management-users": [
    {
      name: "loading",
      skipSettleWait: true,
      actions: [],
    },
    {
      name: "bulk-selected",
      actions: [
        // Click first 3 row checkboxes in the table
        { action: "click", selector: "table tbody tr:nth-child(1) [role='checkbox']" },
        { action: "click", selector: "table tbody tr:nth-child(2) [role='checkbox']" },
        { action: "click", selector: "table tbody tr:nth-child(3) [role='checkbox']" },
        { action: "wait", ms: 200 },
      ],
    },
    {
      name: "empty-search",
      actions: [
        { action: "fill", selector: "input[placeholder*='Search']", text: "zzzznonexistent" },
        { action: "wait", ms: 300 },
      ],
    },
  ],

  "management-products": [
    {
      name: "loading",
      skipSettleWait: true,
      actions: [],
    },
    {
      name: "bulk-selected",
      actions: [
        { action: "click", selector: "table tbody tr:nth-child(1) [role='checkbox']" },
        { action: "click", selector: "table tbody tr:nth-child(2) [role='checkbox']" },
        { action: "wait", ms: 200 },
      ],
    },
  ],

  "management-orders": [
    {
      name: "loading",
      skipSettleWait: true,
      actions: [],
    },
    {
      name: "bulk-selected",
      actions: [
        { action: "click", selector: "table tbody tr:nth-child(1) [role='checkbox']" },
        { action: "click", selector: "table tbody tr:nth-child(2) [role='checkbox']" },
        { action: "click", selector: "table tbody tr:nth-child(3) [role='checkbox']" },
        { action: "wait", ms: 200 },
      ],
    },
  ],

  "management-invoices": [
    {
      name: "loading",
      skipSettleWait: true,
      actions: [],
    },
    {
      name: "bulk-selected",
      actions: [
        { action: "click", selector: "table tbody tr:nth-child(1) [role='checkbox']" },
        { action: "click", selector: "table tbody tr:nth-child(2) [role='checkbox']" },
        { action: "wait", ms: 200 },
      ],
    },
  ],

  // ═══════════════════════════════════════════════════════════
  // SETTINGS — Loading skeleton states
  // ═══════════════════════════════════════════════════════════

  "settings-general": [
    {
      name: "loading",
      skipSettleWait: true,
      actions: [],
    },
  ],

  "settings-notifications": [
    {
      name: "loading",
      skipSettleWait: true,
      actions: [],
    },
  ],

  "settings-billing": [
    {
      name: "loading",
      skipSettleWait: true,
      actions: [],
    },
  ],

  "settings-help": [
    {
      name: "loading",
      skipSettleWait: true,
      actions: [],
    },
  ],
}
