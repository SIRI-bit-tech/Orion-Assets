"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDateTime, formatCurrency } from "@/lib/utils/format"
import { Search, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface User {
  _id: string
  fullName: string
  email: string
  country: string
  accountBalance: number
  kycStatus: string
  status: string
  createdAt: Date
}

const MOCK_USERS: User[] = [
  {
    _id: "1",
    fullName: "John Smith",
    email: "john.smith@example.com",
    country: "United States",
    accountBalance: 50000,
    kycStatus: "APPROVED",
    status: "ACTIVE",
    createdAt: new Date("2024-12-15"),
  },
  {
    _id: "2",
    fullName: "Sarah Johnson",
    email: "sarah.j@example.com",
    country: "Canada",
    accountBalance: 75000,
    kycStatus: "APPROVED",
    status: "ACTIVE",
    createdAt: new Date("2024-11-20"),
  },
  {
    _id: "3",
    fullName: "Michael Chen",
    email: "m.chen@example.com",
    country: "Singapore",
    accountBalance: 120000,
    kycStatus: "PENDING",
    status: "ACTIVE",
    createdAt: new Date("2025-01-05"),
  },
  {
    _id: "4",
    fullName: "Emma Wilson",
    email: "emma.w@example.com",
    country: "United Kingdom",
    accountBalance: 35000,
    kycStatus: "APPROVED",
    status: "SUSPENDED",
    createdAt: new Date("2024-10-10"),
  },
]

export function UsersTable() {
  const getKYCBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-success/20 text-success">Approved</span>
      case "PENDING":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">Pending</span>
      case "REJECTED":
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-destructive/20 text-destructive">Rejected</span>
        )
      default:
        return <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">Not Started</span>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-success/20 text-success">Active</span>
      case "SUSPENDED":
        return (
          <span className="px-2 py-1 rounded text-xs font-medium bg-destructive/20 text-destructive">Suspended</span>
        )
      case "CLOSED":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">Closed</span>
      default:
        return <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">Pending</span>
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">User Management</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search users..." className="pl-9 bg-secondary border-border" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Email</TableHead>
              <TableHead className="text-muted-foreground">Country</TableHead>
              <TableHead className="text-muted-foreground text-right">Balance</TableHead>
              <TableHead className="text-muted-foreground">KYC Status</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Joined</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_USERS.map((user) => (
              <TableRow key={user._id} className="border-border hover:bg-secondary/50">
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-muted-foreground">{user.country}</TableCell>
                <TableCell className="text-right">{formatCurrency(user.accountBalance, "USD", 2)}</TableCell>
                <TableCell>{getKYCBadge(user.kycStatus)}</TableCell>
                <TableCell>{getStatusBadge(user.status)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDateTime(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>View Transactions</DropdownMenuItem>
                      <DropdownMenuItem>Suspend Account</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
