"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime } from "@/lib/utils/format"
import { CheckCircle2, XCircle, Eye } from "lucide-react"

interface KYCApplication {
  _id: string
  userId: string
  userName: string
  email: string
  documentType: string
  status: string
  submittedAt: Date
}

const MOCK_KYC_APPLICATIONS: KYCApplication[] = [
  {
    _id: "1",
    userId: "user3",
    userName: "Michael Chen",
    email: "m.chen@example.com",
    documentType: "Passport",
    status: "PENDING",
    submittedAt: new Date("2025-01-14T08:00:00"),
  },
  {
    _id: "2",
    userId: "user5",
    userName: "David Brown",
    email: "d.brown@example.com",
    documentType: "Driver's License",
    status: "UNDER_REVIEW",
    submittedAt: new Date("2025-01-13T14:30:00"),
  },
  {
    _id: "3",
    userId: "user6",
    userName: "Lisa Anderson",
    email: "l.anderson@example.com",
    documentType: "National ID",
    status: "PENDING",
    submittedAt: new Date("2025-01-12T10:15:00"),
  },
]

export function KYCApprovals() {
  const handleApprove = async (applicationId: string) => {
    if (!confirm("Are you sure you want to approve this KYC application?")) return

    try {
      const response = await fetch(`/api/admin/kyc/${applicationId}/approve`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to approve KYC")

      alert("KYC application approved successfully!")
    } catch (error) {
      alert("Failed to approve KYC application")
    }
  }

  const handleReject = async (applicationId: string) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (!reason) return

    try {
      const response = await fetch(`/api/admin/kyc/${applicationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) throw new Error("Failed to reject KYC")

      alert("KYC application rejected successfully!")
    } catch (error) {
      alert("Failed to reject KYC application")
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">KYC Approvals</h2>
        <div className="text-sm text-muted-foreground">
          Pending: <span className="font-semibold text-foreground">{MOCK_KYC_APPLICATIONS.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">User</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Document Type</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Submitted</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_KYC_APPLICATIONS.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No pending KYC applications
                </TableCell>
              </TableRow>
            ) : (
              MOCK_KYC_APPLICATIONS.map((application) => (
                <TableRow key={application._id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-medium">{application.userName}</TableCell>
                  <TableCell className="text-muted-foreground">{application.email}</TableCell>
                  <TableCell className="text-muted-foreground">{application.documentType}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                      {application.status === "UNDER_REVIEW" ? "Under Review" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(application.submittedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-success hover:text-success hover:bg-success/10"
                        onClick={() => handleApprove(application._id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleReject(application._id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
