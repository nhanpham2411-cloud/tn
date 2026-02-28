import { useState } from "react"
import { Download, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface Report {
  id: string
  name: string
  type: "revenue" | "users" | "products"
  status: "completed" | "processing" | "scheduled"
  date: string
  size: string
}

const reports: Report[] = [
  { id: "RPT-001", name: "Monthly Revenue Summary", type: "revenue", status: "completed", date: "Feb 28, 2026", size: "2.4 MB" },
  { id: "RPT-002", name: "User Growth Analysis", type: "users", status: "completed", date: "Feb 27, 2026", size: "1.8 MB" },
  { id: "RPT-003", name: "Product Performance Q4", type: "products", status: "completed", date: "Feb 25, 2026", size: "3.1 MB" },
  { id: "RPT-004", name: "Churn Rate Report", type: "users", status: "processing", date: "Feb 28, 2026", size: "—" },
  { id: "RPT-005", name: "Revenue by Region", type: "revenue", status: "completed", date: "Feb 24, 2026", size: "4.2 MB" },
  { id: "RPT-006", name: "New User Onboarding", type: "users", status: "completed", date: "Feb 23, 2026", size: "1.1 MB" },
  { id: "RPT-007", name: "Top Products Monthly", type: "products", status: "scheduled", date: "Mar 1, 2026", size: "—" },
  { id: "RPT-008", name: "Annual Revenue Overview", type: "revenue", status: "completed", date: "Feb 20, 2026", size: "5.6 MB" },
  { id: "RPT-009", name: "User Retention Cohort", type: "users", status: "completed", date: "Feb 18, 2026", size: "2.9 MB" },
  { id: "RPT-010", name: "Inventory Status", type: "products", status: "completed", date: "Feb 15, 2026", size: "1.5 MB" },
  { id: "RPT-011", name: "MRR Breakdown", type: "revenue", status: "completed", date: "Feb 14, 2026", size: "2.0 MB" },
  { id: "RPT-012", name: "User Segmentation", type: "users", status: "completed", date: "Feb 12, 2026", size: "3.4 MB" },
]

const statusBadge: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
  completed: { variant: "default", label: "Completed" },
  processing: { variant: "secondary", label: "Processing" },
  scheduled: { variant: "outline", label: "Scheduled" },
}

export default function ReportsPage() {
  const [tab, setTab] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const perPage = 8

  const filtered = reports.filter((r) => {
    if (tab !== "all" && r.type !== tab) return false
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    return true
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="typo-paragraph-sm text-muted-foreground">Dashboard</p>
          <h1 className="typo-heading-2 text-foreground">Reports</h1>
        </div>
        <div className="flex gap-sm">
          <Button variant="outline">
            <Download className="mr-xs size-md" />
            Export All
          </Button>
          <Button>
            <FileText className="mr-xs size-md" />
            Generate Report
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Reports</CardTitle>
              <CardDescription>{filtered.length} reports found</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1) }}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>

            <TabsContent value={tab} className="pt-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                        No reports found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((report) => {
                      const badge = statusBadge[report.status]
                      return (
                        <TableRow key={report.id}>
                          <TableCell className="typo-paragraph-sm text-muted-foreground">{report.id}</TableCell>
                          <TableCell className="typo-paragraph-sm-semibold">{report.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">{report.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={badge.variant}>{badge.label}</Badge>
                          </TableCell>
                          <TableCell className="typo-paragraph-sm text-muted-foreground">{report.date}</TableCell>
                          <TableCell className="text-right typo-paragraph-sm text-muted-foreground">{report.size}</TableCell>
                          <TableCell className="text-right">
                            {report.status === "completed" && (
                              <Button variant="ghost" size="sm">
                                <Download className="size-md" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-md">
                  <p className="typo-paragraph-sm text-muted-foreground">
                    Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(Math.max(1, page - 1))}
                          className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            isActive={page === i + 1}
                            onClick={() => setPage(i + 1)}
                            className="cursor-pointer"
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(Math.min(totalPages, page + 1))}
                          className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}
