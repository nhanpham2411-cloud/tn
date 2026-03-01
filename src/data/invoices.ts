export interface Invoice {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  status: "paid" | "pending" | "overdue" | "cancelled"
  amount: number
  tax: number
  total: number
  issuedAt: string
  dueDate: string
  paidAt: string | null
}

const customers = [
  "Alex Morgan", "Sarah Chen", "James Wilson", "Maria Garcia", "David Kim",
  "Emma Smith", "Oliver Jones", "Sophia Brown", "Liam Davis", "Isabella Miller",
  "Noah Taylor", "Ava Anderson", "Ethan Thomas", "Mia Jackson", "Lucas White",
  "Charlotte Harris", "Mason Martin", "Amelia Thompson", "Logan Moore", "Harper Clark",
]

const statuses: Invoice["status"][] = ["paid", "paid", "paid", "paid", "pending", "pending", "overdue", "cancelled"]

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  return new Date(s + Math.random() * (e - s)).toISOString().split("T")[0]
}

function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split("T")[0]
}

export const invoices: Invoice[] = Array.from({ length: 50 }, (_, i) => {
  const customer = customers[i % customers.length]
  const amount = Math.round((50 + Math.random() * 950) * 100) / 100
  const tax = Math.round(amount * 0.08 * 100) / 100
  const status = statuses[i % statuses.length]
  const issuedAt = randomDate("2025-06-01", "2026-02-15")
  const dueDate = addDays(issuedAt, 30)

  return {
    id: `INV-${String(i + 1).padStart(4, "0")}`,
    orderId: `ORD-${String(i + 1).padStart(4, "0")}`,
    customerName: customer,
    customerEmail: `${customer.split(" ")[0].toLowerCase()}.${customer.split(" ")[1].toLowerCase()}@shoppulse.io`,
    status,
    amount,
    tax,
    total: Math.round((amount + tax) * 100) / 100,
    issuedAt,
    dueDate,
    paidAt: status === "paid" ? randomDate(issuedAt, dueDate) : null,
  }
})
