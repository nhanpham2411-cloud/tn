export interface User {
  id: string
  name: string
  email: string
  role: "admin" | "editor" | "viewer" | "billing" | "developer"
  avatar: string
  avatarUrl: string
  status: "active" | "inactive" | "invited"
  joinDate: string
  lastActive: string
  plan: "free" | "pro" | "enterprise"
}

export const currentUser: User = {
  id: "usr_001",
  name: "Sarah Johnson",
  email: "sarah@shoppulse.io",
  role: "admin",
  avatar: "SJ",
  avatarUrl: "https://i.pravatar.cc/80?img=1",
  status: "active",
  joinDate: "2024-03-15",
  lastActive: "2026-02-28",
  plan: "enterprise",
}

// Generate 50 realistic users
const firstNames = ["Alex", "Sarah", "James", "Maria", "David", "Emma", "Oliver", "Sophia", "Liam", "Isabella", "Noah", "Ava", "Ethan", "Mia", "Lucas", "Charlotte", "Mason", "Amelia", "Logan", "Harper", "Ryan", "Lily", "Jack", "Ella", "Aiden", "Grace", "Henry", "Zoe", "Leo", "Chloe", "Owen", "Aria", "Sam", "Riley", "Jake", "Layla", "Ben", "Nora", "Max", "Luna", "Tom", "Stella", "Dan", "Violet", "Cal", "Ruby", "Ian", "Iris", "Jay", "Maya"]
const lastNames = ["Morgan", "Chen", "Wilson", "Garcia", "Kim", "Smith", "Jones", "Brown", "Davis", "Miller", "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin", "Thompson", "Moore", "Clark", "Lewis", "Walker", "Hall", "Allen", "Young", "King", "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker", "Nelson", "Carter", "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers", "Reed"]
const roles: User["role"][] = ["admin", "editor", "viewer", "billing", "developer"]
const statuses: User["status"][] = ["active", "active", "active", "active", "inactive", "invited"]
const plans: User["plan"][] = ["free", "free", "pro", "pro", "pro", "enterprise"]

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  return new Date(s + Math.random() * (e - s)).toISOString().split("T")[0]
}

export const users: User[] = Array.from({ length: 50 }, (_, i) => {
  const first = firstNames[i % firstNames.length]
  const last = lastNames[i % lastNames.length]
  const joinDate = randomDate("2023-01-01", "2026-02-01")
  return {
    id: `usr_${String(i + 1).padStart(3, "0")}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@shoppulse.io`,
    role: roles[i % roles.length],
    avatar: `${first[0]}${last[0]}`,
    avatarUrl: `https://i.pravatar.cc/80?img=${(i % 70) + 1}`,
    status: statuses[i % statuses.length],
    joinDate,
    lastActive: randomDate(joinDate, "2026-02-28"),
    plan: plans[i % plans.length],
  }
})
