import { useLocation } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { breadcrumbLabels } from "@/data/navigation"

export function AppHeader() {
  const location = useLocation()
  const segments = location.pathname.split("/").filter(Boolean)

  // Build breadcrumb items from URL segments
  // Skip dynamic segments (IDs) — they'll be resolved to labels later
  const crumbs = segments
    .map((seg, i) => {
      const label = breadcrumbLabels[seg] || seg
      const path = "/" + segments.slice(0, i + 1).join("/")
      return { label, path }
    })
    .filter((c) => c.label !== c.path.split("/").pop()) // filter out raw IDs for now

  return (
    <header className="flex h-16 shrink-0 items-center gap-xs border-b border-border px-lg">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-xs h-md" />
      <Breadcrumb>
        <BreadcrumbList>
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1
            return (
              <span key={crumb.path} className="contents">
                {i > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.path}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
