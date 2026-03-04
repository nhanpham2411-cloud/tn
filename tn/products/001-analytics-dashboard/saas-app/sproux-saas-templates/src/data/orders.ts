export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: "card" | "paypal" | "bank_transfer"
  shippingAddress: string
  createdAt: string
  updatedAt: string
}

const customerNames = [
  "Alex Morgan", "Sarah Chen", "James Wilson", "Maria Garcia", "David Kim",
  "Emma Smith", "Oliver Jones", "Sophia Brown", "Liam Davis", "Isabella Miller",
  "Noah Taylor", "Ava Anderson", "Ethan Thomas", "Mia Jackson", "Lucas White",
  "Charlotte Harris", "Mason Martin", "Amelia Thompson", "Logan Moore", "Harper Clark",
]

const productPool = [
  { name: "Apple AirPods Pro", price: 249 },
  { name: "MacBook Pro 14\"", price: 1999 },
  { name: "iPhone 15 Pro", price: 1199 },
  { name: "Nike Air Jordan 1", price: 179 },
  { name: "Rolex Datejust", price: 4999 },
  { name: "Samsung Galaxy S24", price: 899 },
  { name: "Adidas Ultraboost", price: 189 },
  { name: "Classic Sunglasses", price: 89 },
  { name: "Yoga Mat Premium", price: 49 },
  { name: "Table Lamp", price: 69 },
  { name: "Sony WH-1000XM5", price: 349 },
  { name: "Leather Wallet", price: 59 },
  { name: "Tennis Racket Pro", price: 159 },
  { name: "iPad Air", price: 599 },
  { name: "Silver Necklace", price: 129 },
]

const addresses = [
  "123 Market St, San Francisco, CA 94105",
  "456 Broadway, New York, NY 10013",
  "789 Michigan Ave, Chicago, IL 60611",
  "101 Main St, Austin, TX 78701",
  "202 Pike St, Seattle, WA 98101",
  "303 Peachtree St, Atlanta, GA 30308",
  "404 Boylston St, Boston, MA 02116",
  "505 Collins Ave, Miami, FL 33139",
  "606 Sunset Blvd, Los Angeles, CA 90028",
  "707 K St, Washington, DC 20001",
]

const statuses: Order["status"][] = ["pending", "processing", "processing", "shipped", "shipped", "delivered", "delivered", "delivered", "cancelled", "refunded"]
const paymentMethods: Order["paymentMethod"][] = ["card", "card", "card", "paypal", "bank_transfer"]

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  return new Date(s + Math.random() * (e - s)).toISOString().split("T")[0]
}

export const orders: Order[] = Array.from({ length: 100 }, (_, i) => {
  const customer = customerNames[i % customerNames.length]
  const itemCount = 1 + (i % 3)
  const items: OrderItem[] = Array.from({ length: itemCount }, (_, j) => {
    const product = productPool[(i + j) % productPool.length]
    const quantity = 1 + ((i + j) % 5)
    return {
      productId: `PRD-${String(((i + j) % productPool.length) + 1).padStart(3, "0")}`,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      total: product.price * quantity,
    }
  })
  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const tax = Math.round(subtotal * 0.08)
  const createdAt = randomDate("2025-06-01", "2026-02-28")

  return {
    id: `ORD-${String(i + 1).padStart(4, "0")}`,
    customerId: `usr_${String((i % customerNames.length) + 1).padStart(3, "0")}`,
    customerName: customer,
    customerEmail: `${customer.split(" ")[0].toLowerCase()}.${customer.split(" ")[1].toLowerCase()}@email.com`,
    status: statuses[i % statuses.length],
    items,
    subtotal,
    tax,
    total: subtotal + tax,
    paymentMethod: paymentMethods[i % paymentMethods.length],
    shippingAddress: addresses[i % addresses.length],
    createdAt,
    updatedAt: randomDate(createdAt, "2026-02-28"),
  }
})
