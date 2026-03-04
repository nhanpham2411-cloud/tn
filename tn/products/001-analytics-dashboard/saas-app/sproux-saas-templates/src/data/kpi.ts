import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react"

export interface KPIMetric {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  description: string
  icon: LucideIcon
  sparkline?: number[]
}

export const kpiMetrics: KPIMetric[] = [
  {
    title: "Total Revenue",
    value: "$128,430",
    change: "+14.2%",
    changeType: "positive",
    description: "vs last 30 days",
    icon: DollarSign,
    sparkline: [42, 48, 51, 46, 55, 62, 58, 65, 71, 68, 74, 82],
  },
  {
    title: "Orders",
    value: "3,842",
    change: "+8.7%",
    changeType: "positive",
    description: "vs last 30 days",
    icon: ShoppingCart,
    sparkline: [120, 135, 128, 142, 156, 148, 162, 170, 165, 178, 185, 192],
  },
  {
    title: "Avg. Order Value",
    value: "$33.42",
    change: "-2.1%",
    changeType: "negative",
    description: "vs last 30 days",
    icon: TrendingUp,
    sparkline: [36, 35, 34, 35, 33, 34, 33, 32, 34, 33, 33, 33],
  },
  {
    title: "Active Customers",
    value: "12,648",
    change: "+23.5%",
    changeType: "positive",
    description: "vs last 30 days",
    icon: Users,
    sparkline: [8200, 8800, 9100, 9400, 9800, 10200, 10600, 11100, 11500, 12000, 12300, 12648],
  },
]
