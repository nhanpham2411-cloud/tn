import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { Progress } from "@/components/ui/progress"
import { trafficData, planDistribution, growthData, dailyUsersData } from "@/data/chart-data"
import { useChartColors } from "@/hooks/use-chart-colors"

const conversionFunnel = [
  { stage: "Visitors", value: 12500, pct: 100 },
  { stage: "Sign Ups", value: 3200, pct: 25.6 },
  { stage: "Active Users", value: 2350, pct: 18.8 },
  { stage: "Paid Users", value: 890, pct: 7.1 },
]

const geoData = [
  { country: "United States", users: 4520, pct: 36.2 },
  { country: "United Kingdom", users: 1890, pct: 15.1 },
  { country: "Germany", users: 1340, pct: 10.7 },
  { country: "Canada", users: 980, pct: 7.8 },
  { country: "Australia", users: 760, pct: 6.1 },
  { country: "Other", users: 2990, pct: 24.1 },
]

export default function AnalyticsPage() {
  const colors = useChartColors()

  const chartColorList = [
    colors["chart-1"] || "#14b8a6",
    colors["chart-2"] || "#22c55e",
    colors["chart-3"] || "#f59e0b",
    colors["chart-4"] || "#ef4444",
    colors["chart-5"] || "#8b5cf6",
  ]

  return (
    <>
      {/* Page header */}
      <div>
        <p className="typo-paragraph-sm text-muted-foreground">Dashboard</p>
        <h1 className="typo-heading-2 text-foreground">Analytics</h1>
      </div>

      {/* Donut charts row */}
      <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
        {/* Traffic Sources */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic Sources</CardTitle>
            <CardDescription>Where your visitors come from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-xl">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={trafficData}
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {trafficData.map((_, i) => (
                      <Cell key={i} fill={chartColorList[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-sm flex-1">
                {trafficData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-xs">
                      <div className="size-sm rounded-full" style={{ backgroundColor: chartColorList[i] }} />
                      <span className="typo-paragraph-sm text-foreground">{item.name}</span>
                    </div>
                    <span className="typo-paragraph-sm-semibold text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users by Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Plan</CardTitle>
            <CardDescription>Distribution across pricing tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-xl">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={planDistribution}
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                  >
                    {planDistribution.map((_, i) => (
                      <Cell key={i} fill={chartColorList[i + 2]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number) => [value.toLocaleString(), "Users"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-sm flex-1">
                {planDistribution.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-xs">
                      <div className="size-sm rounded-full" style={{ backgroundColor: chartColorList[i + 2] }} />
                      <span className="typo-paragraph-sm text-foreground">{item.name}</span>
                    </div>
                    <span className="typo-paragraph-sm-semibold text-foreground">{item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Active Users */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Active Users</CardTitle>
          <CardDescription>User activity over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dailyUsersData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
              <XAxis dataKey="day" stroke={colors["muted-foreground"]} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={colors["muted-foreground"]} fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number) => [value.toLocaleString(), "Users"]}
              />
              <Bar dataKey="users" fill={colors["chart-1"]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Growth chart */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Trend</CardTitle>
          <CardDescription>Quarterly growth rate</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors["chart-2"] || "#22c55e"} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors["chart-2"] || "#22c55e"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="quarter" stroke={colors["muted-foreground"]} fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke={colors["muted-foreground"]} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(value: number) => [`${value}%`, "Growth"]}
              />
              <Area type="monotone" dataKey="growth" stroke={colors["chart-2"]} fill="url(#growthGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-lg md:grid-cols-2">
        {/* Conversion funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>From visitors to paid users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-md">
              {conversionFunnel.map((stage) => (
                <div key={stage.stage} className="flex flex-col gap-xs">
                  <div className="flex items-center justify-between">
                    <span className="typo-paragraph-sm text-foreground">{stage.stage}</span>
                    <span className="typo-paragraph-sm-semibold text-foreground">
                      {stage.value.toLocaleString()} ({stage.pct}%)
                    </span>
                  </div>
                  <Progress value={stage.pct} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Users by country</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-md">
              {geoData.map((geo) => (
                <div key={geo.country} className="flex flex-col gap-xs">
                  <div className="flex items-center justify-between">
                    <span className="typo-paragraph-sm text-foreground">{geo.country}</span>
                    <span className="typo-paragraph-mini text-muted-foreground">
                      {geo.users.toLocaleString()} ({geo.pct}%)
                    </span>
                  </div>
                  <Progress value={geo.pct} className="h-1.5" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
