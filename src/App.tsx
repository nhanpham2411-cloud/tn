import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AuthLayout } from "@/components/layout/auth-layout"

// Lazy-load all pages for code splitting
const DashboardOverview = lazy(() => import("@/pages/dashboard/overview"))
const Analytics = lazy(() => import("@/pages/dashboard/analytics"))
const Reports = lazy(() => import("@/pages/dashboard/reports"))

const UsersList = lazy(() => import("@/pages/management/users-list"))
const UserProfile = lazy(() => import("@/pages/management/user-profile"))
const Products = lazy(() => import("@/pages/management/products"))
const Orders = lazy(() => import("@/pages/management/orders"))
const OrderDetail = lazy(() => import("@/pages/management/order-detail"))
const Invoices = lazy(() => import("@/pages/management/invoices"))

const SettingsGeneral = lazy(() => import("@/pages/settings/general"))
const Notifications = lazy(() => import("@/pages/settings/notifications"))
const Billing = lazy(() => import("@/pages/settings/billing"))
const HelpSupport = lazy(() => import("@/pages/settings/help-support"))

const SignIn = lazy(() => import("@/pages/auth/sign-in"))
const SignUp = lazy(() => import("@/pages/auth/sign-up"))
const ForgotPassword = lazy(() => import("@/pages/auth/forgot-password"))
const Onboarding = lazy(() => import("@/pages/auth/onboarding"))

const NotFound = lazy(() => import("@/pages/utility/not-found"))

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-4xl">
      <div className="size-xl animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard layout routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardOverview />} />
          <Route path="/dashboard/analytics" element={<Analytics />} />
          <Route path="/dashboard/reports" element={<Reports />} />

          <Route path="/management/users" element={<UsersList />} />
          <Route path="/management/users/:id" element={<UserProfile />} />
          <Route path="/management/products" element={<Products />} />
          <Route path="/management/orders" element={<Orders />} />
          <Route path="/management/orders/:id" element={<OrderDetail />} />
          <Route path="/management/invoices" element={<Invoices />} />

          <Route path="/settings" element={<Navigate to="/settings/general" replace />} />
          <Route path="/settings/general" element={<SettingsGeneral />} />
          <Route path="/settings/notifications" element={<Notifications />} />
          <Route path="/settings/billing" element={<Billing />} />
          <Route path="/settings/help" element={<HelpSupport />} />
        </Route>

        {/* Auth layout routes (no sidebar) */}
        <Route element={<AuthLayout />}>
          <Route path="/auth/sign-in" element={<SignIn />} />
          <Route path="/auth/sign-up" element={<SignUp />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/onboarding" element={<Onboarding />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
