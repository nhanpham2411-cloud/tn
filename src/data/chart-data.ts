// Monthly revenue & orders data (Jan - Dec) — dual series for composed charts
export const revenueData = [
  { month: "Jan", revenue: 68400, orders: 2120, refunds: 4200, profit: 52200 },
  { month: "Feb", revenue: 72100, orders: 2280, refunds: 3800, profit: 55800 },
  { month: "Mar", revenue: 81200, orders: 2540, refunds: 4100, profit: 63400 },
  { month: "Apr", revenue: 76800, orders: 2380, refunds: 3600, profit: 58200 },
  { month: "May", revenue: 89500, orders: 2720, refunds: 4800, profit: 68400 },
  { month: "Jun", revenue: 95200, orders: 2980, refunds: 3900, profit: 74100 },
  { month: "Jul", revenue: 102500, orders: 3150, refunds: 5200, profit: 78800 },
  { month: "Aug", revenue: 98800, orders: 3080, refunds: 4400, profit: 76200 },
  { month: "Sep", revenue: 108400, orders: 3320, refunds: 4600, profit: 84600 },
  { month: "Oct", revenue: 115800, orders: 3540, refunds: 5100, profit: 89200 },
  { month: "Nov", revenue: 124200, orders: 3720, refunds: 5800, profit: 95400 },
  { month: "Dec", revenue: 128430, orders: 3842, refunds: 4200, profit: 102800 },
]

// Hourly traffic (24h) — for sparkline-style mini chart
export const hourlyTraffic = [
  { hour: "00", visitors: 120 }, { hour: "01", visitors: 80 }, { hour: "02", visitors: 45 },
  { hour: "03", visitors: 32 }, { hour: "04", visitors: 28 }, { hour: "05", visitors: 42 },
  { hour: "06", visitors: 95 }, { hour: "07", visitors: 210 }, { hour: "08", visitors: 380 },
  { hour: "09", visitors: 520 }, { hour: "10", visitors: 680 }, { hour: "11", visitors: 740 },
  { hour: "12", visitors: 620 }, { hour: "13", visitors: 710 }, { hour: "14", visitors: 690 },
  { hour: "15", visitors: 650 }, { hour: "16", visitors: 580 }, { hour: "17", visitors: 490 },
  { hour: "18", visitors: 420 }, { hour: "19", visitors: 380 }, { hour: "20", visitors: 310 },
  { hour: "21", visitors: 250 }, { hour: "22", visitors: 190 }, { hour: "23", visitors: 150 },
]

// Daily orders (last 7 days) — with previous week comparison
export const dailyOrdersData = [
  { day: "Mon", orders: 142, prevWeek: 128, revenue: 4850 },
  { day: "Tue", orders: 158, prevWeek: 145, revenue: 5320 },
  { day: "Wed", orders: 172, prevWeek: 152, revenue: 5810 },
  { day: "Thu", orders: 165, prevWeek: 168, revenue: 5540 },
  { day: "Fri", orders: 189, prevWeek: 175, revenue: 6420 },
  { day: "Sat", orders: 124, prevWeek: 118, revenue: 4180 },
  { day: "Sun", orders: 98, prevWeek: 92, revenue: 3280 },
]

// Sales channels — progress tracker style
export const channelData = [
  { name: "Online Store", value: 45, amount: "$57,794", target: "$120,000", subtitle: "On track · 5 months left", color: "var(--color-chart-1)" },
  { name: "Marketplace", value: 25, amount: "$32,108", target: "$80,000", subtitle: "Ahead of schedule · 4 months left", color: "var(--color-chart-2)" },
  { name: "Social Media", value: 18, amount: "$23,117", target: "$50,000", subtitle: "Needs attention · 6 months left", color: "var(--color-chart-3)" },
  { name: "Wholesale", value: 12, amount: "$15,412", target: "$40,000", subtitle: "New channel · 8 months left", color: "var(--color-chart-5)" },
]

// Product categories — for radial/treemap
export const categoryData = [
  { name: "Electronics", value: 38200, pct: 31, color: "var(--color-chart-1)" },
  { name: "Clothing", value: 28400, pct: 23, color: "var(--color-chart-2)" },
  { name: "Home & Garden", value: 22100, pct: 18, color: "var(--color-chart-3)" },
  { name: "Sports", value: 18600, pct: 15, color: "var(--color-chart-5)" },
]

// Conversion funnel
export const conversionFunnel = [
  { stage: "Store Visits", value: 42800, pct: 100, fill: "var(--color-chart-1)" },
  { stage: "Product Views", value: 28400, pct: 66.4, fill: "var(--color-chart-2)" },
  { stage: "Add to Cart", value: 8520, pct: 19.9, fill: "var(--color-chart-3)" },
  { stage: "Checkout", value: 5112, pct: 11.9, fill: "var(--color-chart-5)" },
  { stage: "Purchase", value: 3842, pct: 9.0, fill: "var(--color-chart-4)" },
]

// Quarterly growth
export const growthData = [
  { quarter: "Q1 2025", growth: 12.4 },
  { quarter: "Q2 2025", growth: 18.2 },
  { quarter: "Q3 2025", growth: 22.8 },
  { quarter: "Q4 2025", growth: 28.5 },
  { quarter: "Q1 2026", growth: 32.1 },
]

// Recent orders for dashboard
export const recentOrders = [
  { id: "#SP-4821", customer: "Emily Zhang", email: "emily@gmail.com", amount: "$284.00", status: "Delivered", avatar: "EZ", avatarUrl: "https://i.pravatar.cc/80?img=5", items: 3, time: "2 min ago" },
  { id: "#SP-4820", customer: "Marcus Johnson", email: "marcus@outlook.com", amount: "$156.00", status: "Shipped", avatar: "MJ", avatarUrl: "https://i.pravatar.cc/80?img=12", items: 2, time: "18 min ago" },
  { id: "#SP-4819", customer: "Sofia Petrov", email: "sofia@gmail.com", amount: "$432.00", status: "Processing", avatar: "SP", avatarUrl: "https://i.pravatar.cc/80?img=9", items: 5, time: "34 min ago" },
  { id: "#SP-4818", customer: "Daniel Park", email: "daniel@yahoo.com", amount: "$89.00", status: "Delivered", avatar: "DP", avatarUrl: "https://i.pravatar.cc/80?img=33", items: 1, time: "1h ago" },
  { id: "#SP-4817", customer: "Aisha Patel", email: "aisha@gmail.com", amount: "$367.00", status: "Shipped", avatar: "AP", avatarUrl: "https://i.pravatar.cc/80?img=25", items: 4, time: "2h ago" },
  { id: "#SP-4816", customer: "Lucas Weber", email: "lucas@gmail.com", amount: "$198.00", status: "Delivered", avatar: "LW", avatarUrl: "https://i.pravatar.cc/80?img=53", items: 2, time: "3h ago" },
]

// Top selling products (images: dummyjson.com CDN)
export const topProducts = [
  { name: "Apple AirPods Pro", sku: "AAP-001", sales: 1842, revenue: "$73,680", growth: "+18.3%", price: "$249.99", stock: 234, imageUrl: "https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp" },
  { name: "Rolex Datejust", sku: "RDJ-003", sales: 1456, revenue: "$43,680", growth: "+12.1%", price: "$4,999.99", stock: 567, imageUrl: "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/1.webp" },
  { name: "Nike Air Jordan 1", sku: "NAJ-012", sales: 1234, revenue: "$24,680", growth: "+8.7%", price: "$179.99", stock: 892, imageUrl: "https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp" },
  { name: "MacBook Pro 14\"", sku: "MBP-045", sales: 986, revenue: "$19,720", growth: "+25.4%", price: "$1,999.99", stock: 145, imageUrl: "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp" },
  { name: "Black Sun Glasses", sku: "CSG-023", sales: 754, revenue: "$15,080", growth: "+6.2%", price: "$89.99", stock: 78, imageUrl: "https://cdn.dummyjson.com/product-images/sunglasses/black-sun-glasses/1.webp" },
]

// Customer satisfaction scores for radial chart
export const satisfactionData = [
  { name: "Product Quality", value: 92, fill: "var(--color-chart-1)" },
  { name: "Shipping Speed", value: 87, fill: "var(--color-chart-2)" },
  { name: "Customer Support", value: 95, fill: "var(--color-chart-4)" },
  { name: "Return Process", value: 78, fill: "var(--color-chart-3)" },
]

// Global sales locations for 3D globe
export const salesLocations = [
  { city: "New York", country: "US", lat: 40.7128, lng: -74.006, sales: 18420 },
  { city: "London", country: "UK", lat: 51.5074, lng: -0.1278, sales: 15600 },
  { city: "Tokyo", country: "JP", lat: 35.6762, lng: 139.6503, sales: 22100 },
  { city: "Johannesburg", country: "ZA", lat: -26.2041, lng: 28.0473, sales: 7200 },
  { city: "Dubai", country: "AE", lat: 25.2048, lng: 55.2708, sales: 8900 },
  { city: "São Paulo", country: "BR", lat: -23.5505, lng: -46.6333, sales: 6500 },
  { city: "Mumbai", country: "IN", lat: 19.076, lng: 72.8777, sales: 11400 },
  { city: "Lagos", country: "NG", lat: 6.5244, lng: 3.3792, sales: 4800 },
]
