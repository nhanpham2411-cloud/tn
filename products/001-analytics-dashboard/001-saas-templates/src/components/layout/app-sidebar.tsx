import { useLocation, Link } from "react-router-dom"
import {
  LogOut,
  Moon,
  Sun,
  HelpCircle,
  Settings,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { navigation } from "@/data/navigation"
import { useTheme } from "@/hooks/use-theme"

export function AppSidebar() {
  const location = useLocation()
  const { resolvedTheme, toggleTheme } = useTheme()

  // Flatten all nav items for icon-only display
  const mainItems = navigation.flatMap((g) => g.items).filter((item) => item.icon)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard">
                <div className="flex size-2xl items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <span className="sp-body font-semibold">S</span>
                </div>
                <span className="sp-body-semibold truncate">ShopPulse</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {mainItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={location.pathname.startsWith(item.url)}
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* Settings */}
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings" isActive={location.pathname.startsWith("/settings")}>
              <Link to="/settings/general">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Help */}
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Help">
              <HelpCircle />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* User avatar dropdown */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Linh Nguyen" className="data-[state=open]:bg-sidebar-accent">
                  <Avatar className="size-[20px] rounded-lg">
                    <AvatarFallback className="rounded-lg text-[10px]">LN</AvatarFallback>
                  </Avatar>
                  <span className="truncate">Linh Nguyen</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-48 rounded-xl"
                side="right"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuItem onClick={toggleTheme}>
                  {resolvedTheme === "dark" ? <Sun /> : <Moon />}
                  {resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/auth/sign-in">
                    <LogOut />
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
