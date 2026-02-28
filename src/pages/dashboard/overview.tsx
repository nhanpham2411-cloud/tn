import { TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { kpiMetrics } from "@/data/kpi"
import { revenueData, dailyUsersData, recentSales, topProducts } from "@/data/chart-data"
import { useChartColors } from "@/hooks/use-chart-colors"

export default function DashboardOverviewPage() {
  const colors = useChartColors()

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="typo-paragraph-sm text-muted-foreground">Dashboard</p>
          <h1 className="typo-heading-2 text-foreground">Overview</h1>
        </div>
        <Button variant="outline">Export</Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
        {kpiMetrics.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-xs">
              <CardDescription className="typo-paragraph-sm">
                {kpi.title}
              </CardDescription>
              <kpi.icon className="size-md text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="typo-heading-2 text-foreground">{kpi.value}</div>
              <p className="typo-paragraph-mini text-muted-foreground flex items-center gap-3xs">
                {kpi.changeType === "positive" ? (
                  <ArrowUpRight className="size-sm text-chart-2" />
                ) : (
                  <ArrowDownRight className="size-sm text-destructive" />
                )}
                <span className={kpi.changeType === "positive" ? "text-chart-2" : "text-destructive"}>
                  {kpi.change}
                </span>{" "}
                {kpi.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-lg lg:grid-cols-7">
        {/* Revenue chart - wider */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Monthly revenue and expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="revenue">
              <TabsList>
                <TabsTrigger value="revenue">Revenue</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue" className="pt-md">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors["chart-1"] || "#14b8a6"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors["chart-1"] || "#14b8a6"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border || "#e5e7eb"} />
                    <XAxis
                      dataKey="month"
                      stroke={colors["muted-foreground"] || "#9ca3af"}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke={colors["muted-foreground"] || "#9ca3af"}
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--color-card)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke={colors["chart-1"] || "#14b8a6"}
                      fill="url(#revenueGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="expenses" className="pt-md">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors["chart-3"] || "#f59e0b"} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={colors["chart-3"] || "#f59e0b"} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.border || "#e5e7eb"} />
                    <XAxis dataKey="month" stroke={colors["muted-foreground"]} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={colors["muted-foreground"]} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, "Expenses"]}
                    />
                    <Area type="monotone" dataKey="expenses" stroke={colors["chart-3"]} fill="url(#expensesGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent sales - narrower */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>You made 265 sales this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-lg">
              {recentSales.map((sale) => (
                <div key={sale.email} className="flex items-center gap-md">
                  <Avatar className="size-2xl">
                    <AvatarFallback>{sale.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="typo-paragraph-sm-semibold text-foreground truncate">
                      {sale.name}
                    </p>
                    <p className="typo-paragraph-mini text-muted-foreground truncate">
                      {sale.email}
                    </p>
                  </div>
                  <span className="typo-paragraph-sm-semibold text-foreground">
                    {sale.amount}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-lg lg:grid-cols-2">
        {/* Active users bar chart */}
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Daily active users this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dailyUsersData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.border || "#e5e7eb"} vertical={false} />
                <XAxis dataKey="day" stroke={colors["muted-foreground"]} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={colors["muted-foreground"]} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [value.toLocaleString(), "Users"]}
                />
                <Bar dataKey="users" fill={colors["chart-1"] || "#14b8a6"} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top products table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best performing products this month</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-3xs">
              <TrendingUp className="size-sm" />
              +12.5%
            </Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Sales</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="text-right">Growth</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.name}>
                    <TableCell className="typo-paragraph-sm-semibold">{product.name}</TableCell>
                    <TableCell className="text-right">{product.sales.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{product.revenue}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-chart-2">{product.growth}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
