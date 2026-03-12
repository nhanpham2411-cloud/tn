import { Outlet } from "react-router-dom"

import { AppHeader } from "@/components/layout/app-header"
import { PageTransition } from "@/components/page-transition"

export function DashboardLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <AppHeader />
      <main className="relative flex-1 p-md sm:p-xl lg:p-2xl">
        {/* Ambient gradient orbs — visible in dark mode only */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden dark:block hidden" aria-hidden="true">
          <div className="absolute -top-[300px] -right-[200px] size-[700px] rounded-full bg-primary/[0.03] blur-[200px]" />
          <div className="absolute top-[40%] -left-[250px] size-[500px] rounded-full bg-indigo-500/[0.02] blur-[180px]" />
        </div>
        <div className="relative flex flex-col gap-xl w-full max-w-[1440px] mx-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </div>
      </main>
    </div>
  )
}
