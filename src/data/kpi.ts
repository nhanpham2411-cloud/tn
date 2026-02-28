import {
  DollarSign,
  Users,
  CreditCard,
  TrendingDown,
  type LucideIcon,
} from "lucide-react"

export interface KPIMetric {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
  description: string
  icon: LucideIcon
}

export const kpiMetrics: KPIMetric[] = [
  {
    title: "Total Revenue",
    value: "$45,231.89",
    change: "+20.1%",
    changeType: "positive",
    description: "from last month",
    icon: DollarSign,
  },
  {
    title: "Active Users",
    value: "2,350",
    change: "+180.1%",
    changeType: "positive",
    description: "from last month",
    icon: Users,
  },
  {
    title: "Subscriptions",
    value: "12,234",
    change: "+19%",
    changeType: "positive",
    description: "from last month",
    icon: CreditCard,
  },
  {
    title: "Churn Rate",
    value: "2.1%",
    change: "-0.3%",
    changeType: "positive",
    description: "from last month",
    icon: TrendingDown,
  },
]
