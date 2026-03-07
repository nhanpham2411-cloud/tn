import { useEffect, useState, useCallback } from "react"
import { useLocation, Link, useNavigate } from "react-router-dom"
import {
  Search,
  Settings,
  Moon,
  Sun,
  Palette,
  LayoutDashboard,
  BarChart3,
  FileText,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  CreditCard,
  Bell,
  LogOut,
  User,
  HelpCircle,
  Check,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
  X,
  Menu,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchBox } from "@/components/ui/search-box"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useTheme } from "@/hooks/use-theme"
import { products } from "@/data/products"
import { toast } from "sonner"

const topTabs = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Analytics", path: "/dashboard/analytics" },
  { label: "Reports", path: "/dashboard/reports" },
  { label: "Users", path: "/management/users" },
  { label: "Products", path: "/management/products" },
  { label: "Orders", path: "/management/orders" },
]

const pages = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Reports", url: "/dashboard/reports", icon: FileText },
  { title: "Users", url: "/management/users", icon: Users },
  { title: "Products", url: "/management/products", icon: Package },
  { title: "Orders", url: "/management/orders", icon: ShoppingCart },
  { title: "Invoices", url: "/management/invoices", icon: Receipt },
  { title: "General Settings", url: "/settings/general", icon: Settings },
  { title: "Notifications", url: "/settings/notifications", icon: Bell },
  { title: "Billing", url: "/settings/billing", icon: CreditCard },
  { title: "Help & Support", url: "/settings/help", icon: HelpCircle },
]

const INITIAL_NOTIFICATIONS = [
  { id: "1", icon: ShoppingCart, title: "New order #SP-4821", desc: "Emily Zhang placed a $284.00 order", time: "2 min ago", read: false, type: "order" as const },
  { id: "2", icon: AlertTriangle, title: "Low stock alert", desc: "MacBook Pro 14\" has only 12 units left", time: "18 min ago", read: false, type: "warning" as const },
  { id: "3", icon: TrendingUp, title: "Revenue milestone", desc: "Monthly revenue crossed $100k!", time: "1h ago", read: false, type: "success" as const },
  { id: "4", icon: MessageSquare, title: "New review", desc: "5-star review on Apple AirPods Pro", time: "2h ago", read: true, type: "info" as const },
  { id: "5", icon: Users, title: "Team invite accepted", desc: "Marcus Johnson joined your workspace", time: "3h ago", read: true, type: "info" as const },
]

const notifTypeColor: Record<string, string> = {
  order: "text-primary",
  warning: "text-amber-500",
  success: "text-success",
  info: "text-muted-foreground",
}

export function AppHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const { resolvedTheme, toggleTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [notifOpen, setNotifOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    toast.success("All notifications marked as read")
  }

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  const removeNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    toast("Notification dismissed")
  }

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = useCallback((cmd: () => void) => {
    setOpen(false)
    cmd()
  }, [])

  const isActive = (path: string) => {
    if (path === "/dashboard") return location.pathname === "/dashboard"
    return location.pathname.startsWith(path)
  }

  return (
    <>
      <header className="px-md sm:px-xl lg:px-2xl pt-md sm:pt-xl lg:pt-2xl w-full">
        <div className="flex flex-col gap-sm sm:gap-lg max-w-[1440px] mx-auto w-full">
        {/* Top row: logo text + tab nav + actions */}
        <div className="flex items-center justify-between">
          {/* Mobile menu + Brand */}
          <div className="flex items-center gap-xs">
          {/* Hamburger — mobile only */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden size-[36px] rounded-full text-muted-foreground hover:text-foreground">
                <Menu className="size-[20px]" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="flex flex-col h-full">
                {/* Mobile nav header */}
                <div className="flex items-center gap-sm px-xl py-lg border-b border-border/30 dark:border-white/[0.06]">
                  <svg viewBox="0 0 28 28" fill="none" className="size-[24px]">
                    <path d="M14 3L24 10L14 25L4 10Z" fill="url(#mobGrd)" fillOpacity="0.5" stroke="url(#mobGrd)" strokeWidth="1" strokeOpacity="0.7"/>
                    <path d="M14 7L20 11.5L14 22L8 11.5Z" fill="url(#mobGrd)" fillOpacity="0.85"/>
                    <defs><linearGradient id="mobGrd" x1="4" y1="3" x2="24" y2="25"><stop stopColor="#c4b5fd"/><stop offset="1" stopColor="#818cf8"/></linearGradient></defs>
                  </svg>
                  <span className="sp-h5 text-foreground">ShopPulse</span>
                </div>
                {/* Mobile nav links */}
                <nav className="flex-1 overflow-y-auto py-sm">
                  {pages.map((page) => (
                    <Link
                      key={page.url}
                      to={page.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-sm px-xl py-sm sp-body transition-colors ${
                        isActive(page.url)
                          ? "text-foreground bg-muted/50 dark:bg-white/[0.04] font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/30 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      <page.icon className="size-[18px]" />
                      {page.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          <Link to="/dashboard" className="flex items-center gap-sm">
            <svg viewBox="0 0 28 28" fill="none" className="size-[28px]">
              <path d="M14 3L24 10L14 25L4 10Z" fill="url(#hdrGrd)" fillOpacity="0.5" stroke="url(#hdrGrd)" strokeWidth="1" strokeOpacity="0.7"/>
              <path d="M14 7L20 11.5L14 22L8 11.5Z" fill="url(#hdrGrd)" fillOpacity="0.85"/>
              <defs><linearGradient id="hdrGrd" x1="4" y1="3" x2="24" y2="25"><stop stopColor="#c4b5fd"/><stop offset="1" stopColor="#818cf8"/></linearGradient></defs>
            </svg>
            <span className="sp-h4 text-foreground hidden sm:inline">ShopPulse</span>
          </Link>
          </div>

          {/* Tab nav — centered */}
          <nav className="hidden md:flex items-center gap-3xs bg-muted dark:bg-white/[0.04] rounded-full px-2xs py-2xs">
            {topTabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`px-lg py-xs rounded-full sp-label transition-all ${
                  isActive(tab.path)
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-xs">
            {/* Mobile search icon — below sm only */}
            <Button variant="ghost" size="icon" className="sm:hidden size-[36px] rounded-full text-muted-foreground hover:text-foreground" onClick={() => setOpen(true)}>
              <Search className="size-[18px]" />
            </Button>

            <Link to="/design-system">
              <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground hover:text-foreground" title="Design System">
                <Palette className="size-[18px]" />
              </Button>
            </Link>

            <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground hover:text-foreground" onClick={toggleTheme}>
              {resolvedTheme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </Button>

            {/* Notification Bell */}
            <Popover open={notifOpen} onOpenChange={setNotifOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="size-[36px] rounded-full text-muted-foreground hover:text-foreground relative">
                  <Bell className="size-[18px]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-[4px] right-[4px] size-[16px] rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center ring-2 ring-background">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[calc(100vw-2rem)] sm:w-[380px] p-0" sideOffset={8}>
                <div className="flex items-center justify-between px-xl py-md border-b border-border/30 dark:border-white/[0.06]">
                  <div className="flex items-center gap-sm">
                    <h4 className="sp-h5 text-foreground">Notifications</h4>
                    {unreadCount > 0 && (
                      <Badge variant="default" level="secondary" size="sm">{unreadCount} new</Badge>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="xs" className="sp-caption text-muted-foreground gap-2xs" onClick={markAllRead}>
                      <Check className="size-[12px]" /> Mark all read
                    </Button>
                  )}
                </div>
                <div className="max-h-[360px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-2xl text-center">
                      <Bell className="size-[24px] text-muted-foreground/50 mb-sm" />
                      <p className="sp-body-medium text-foreground">All caught up!</p>
                      <p className="sp-caption text-muted-foreground mt-2xs">No notifications to show.</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-sm px-xl py-md transition-colors hover:bg-muted/50 dark:hover:bg-white/[0.03] group relative ${!n.read ? "bg-primary/[0.03]" : ""}`}
                        onClick={() => markRead(n.id)}
                      >
                        {!n.read && (
                          <div className="absolute left-[8px] top-1/2 -translate-y-1/2 size-[6px] rounded-full bg-primary" />
                        )}
                        <div className={`size-[32px] shrink-0 rounded-lg bg-muted/40 dark:bg-white/[0.06] flex items-center justify-center mt-[2px] ${notifTypeColor[n.type]}`}>
                          <n.icon className="size-[15px]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`sp-body-medium text-foreground truncate ${!n.read ? "font-semibold" : ""}`}>{n.title}</p>
                          <p className="sp-caption text-muted-foreground truncate mt-[1px]">{n.desc}</p>
                          <p className="sp-caption text-muted-foreground/50 mt-2xs">{n.time}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => { e.stopPropagation(); removeNotif(n.id) }}
                          className="size-[24px] shrink-0 text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted dark:hover:bg-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="size-[12px]" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-border/30 dark:border-white/[0.06] px-xl py-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full sp-label text-muted-foreground justify-center"
                    onClick={() => { setNotifOpen(false); navigate("/settings/notifications") }}
                  >
                    View all notifications
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 border-0 shadow-none hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:bg-transparent">
                  <div className="relative size-[36px]">
                    <Avatar className="size-[36px] ring-2 ring-primary/30 cursor-pointer">
                      <AvatarImage src="https://i.pravatar.cc/80?img=47" alt="Linh Nguyen" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-[12px] font-semibold">LN</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 size-[10px] rounded-full bg-success ring-[1.5px] ring-background" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-2xs">
                    <p className="sp-body-semibold text-foreground">Linh Nguyen</p>
                    <p className="sp-caption text-muted-foreground">linh@shoppulse.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings/general")}>
                  <User className="size-[14px]" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings/billing")}>
                  <CreditCard className="size-[14px]" /> Billing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings/notifications")}>
                  <Bell className="size-[14px]" /> Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings/help")}>
                  <HelpCircle className="size-[14px]" /> Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { toast("Signing out..."); setTimeout(() => navigate("/auth/sign-in"), 600) }} className="text-destructive">
                  <LogOut className="size-[14px]" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Second row: greeting + search */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-sm">
          <div className="min-w-0">
            <h1 className="sp-h3 sm:sp-h2 text-foreground">Good morning, Linh</h1>
            <p className="sp-caption sm:sp-body text-muted-foreground mt-3xs hidden sm:block">Stay on top of your tasks, monitor progress, and track status.</p>
          </div>
          <SearchBox
            placeholder="Search product"
            shortcut
            readOnly
            onClick={() => setOpen(true)}
            className="hidden sm:flex w-[280px] cursor-pointer"
          />
        </div>
        </div>
      </header>

      {/* Search Command Palette */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search products, pages, orders..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Pages">
            {pages.map((page) => (
              <CommandItem
                key={page.url}
                value={page.title}
                onSelect={() => runCommand(() => navigate(page.url))}
              >
                <page.icon className="size-[16px]" />
                <span>{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Products">
            {products.slice(0, 8).map((product) => (
              <CommandItem
                key={product.id}
                value={`${product.name} ${product.category}`}
                onSelect={() => runCommand(() => navigate("/management/products"))}
              >
                <Package className="size-[16px]" />
                <span>{product.name}</span>
                <span className="ml-auto sp-caption text-muted-foreground capitalize">{product.category}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => runCommand(toggleTheme)}>
              {resolvedTheme === "dark" ? <Sun className="size-[16px]" /> : <Moon className="size-[16px]" />}
              <span>Toggle {resolvedTheme === "dark" ? "Light" : "Dark"} Mode</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/settings/general"))}>
              <Settings className="size-[16px]" />
              <span>Open Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
