import {
  CreditCard,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Users,
  Bell,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: { title: string; url: string }[]
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
        items: [
          { title: "Overview", url: "/dashboard" },
          { title: "Analytics", url: "/dashboard/analytics" },
          { title: "Reports", url: "/dashboard/reports" },
        ],
      },
      {
        title: "Users",
        url: "/management/users",
        icon: Users,
      },
      {
        title: "Products",
        url: "/management/products",
        icon: Package,
      },
      {
        title: "Orders",
        url: "/management/orders",
        icon: ShoppingCart,
      },
      {
        title: "Invoices",
        url: "/management/invoices",
        icon: Receipt,
      },
    ],
  },
  {
    label: "Settings",
    items: [
      {
        title: "General",
        url: "/settings/general",
        icon: Settings,
      },
      {
        title: "Notifications",
        url: "/settings/notifications",
        icon: Bell,
      },
      {
        title: "Billing",
        url: "/settings/billing",
        icon: CreditCard,
      },
    ],
  },
]

// Breadcrumb label mapping from URL segments
export const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  analytics: "Analytics",
  reports: "Reports",
  management: "Management",
  users: "Users",
  products: "Products",
  orders: "Orders",
  invoices: "Invoices",
  settings: "Settings",
  general: "General",
  notifications: "Notifications",
  billing: "Billing",
}
