"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDateTime } from "@/lib/utils/format"
import { ArrowDownToLine, ArrowUpFromLine, DollarSign } from "lucide-react"

interface Transaction {
  _id: string
  type: "DEPOSIT" | "WITHDRAWAL" | "TRADE" | "FEE" | "DIVIDEND"
  amount: number
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  description: string
  createdAt: Date
}

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    _id: "1",
    type: "DEPOSIT",
    amount: 10000,
    status: "COMPLETED",
    description: "Bank Transfer Deposit",
    createdAt: new Date("2025-01-10T09:00:00"),
  },
  {
    _id: "2",
    type: "TRADE",
    amount: -9034.03,
    status: "COMPLETED",
    description: "Buy 50 AAPL @ $180.50",
    createdAt: new Date("2025-01-10T10:30:00"),
  },
  {
    _id: "3",
    type: "WITHDRAWAL",
    amount: -5000,
    status: "PROCESSING",
    description: "Bank Transfer Withdrawal",
    createdAt: new Date("2025-01-14T14:00:00"),
  },
  {
    _id: "4",
    type: "DIVIDEND",
    amount: 125.5,
    status: "COMPLETED",
    description: "AAPL Dividend Payment",
    createdAt: new Date("2025-01-12T08:00:00"),
  },
]

export function TransactionHistory() {
  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownToLine className="h-4 w-4 text-success" />
      case "WITHDRAWAL":
        return <ArrowUpFromLine className="h-4 w-4 text-destructive" />
      default:
        return <DollarSign className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-success/20 text-success">Completed</span>
      case "PROCESSING":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-400">Processing</span>
      case "PENDING":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">Pending</span>
      case "FAILED":
        return <span className="px-2 py-1 rounded text-xs font-medium bg-destructive/20 text-destructive">Failed</span>
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-bold mb-6">Transaction History</h2>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Type</TableHead>
              <TableHead className="text-muted-foreground">Description</TableHead>
              <TableHead className="text-muted-foreground text-right">Amount</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_TRANSACTIONS.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              MOCK_TRANSACTIONS.map((transaction) => (
                <TableRow key={transaction._id} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(transaction.type)}
                      <span className="font-medium">{transaction.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{transaction.description}</TableCell>
                  <TableCell className="text-right">
                    <span className={`font-semibold ${transaction.amount >= 0 ? "text-success" : "text-foreground"}`}>
                      {transaction.amount >= 0 ? "+" : ""}
                      {formatCurrency(transaction.amount, "USD", 2)}
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDateTime(transaction.createdAt)}
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
