"use client"

import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatDateTime } from "@/lib/utils/format"

interface Trade {
  _id: string
  symbol: string
  side: "BUY" | "SELL"
  quantity: number
  price: number
  commission: number
  totalAmount: number
  executedAt: Date
}

const MOCK_TRADES: Trade[] = [
  {
    _id: "1",
    symbol: "AAPL",
    side: "BUY",
    quantity: 50,
    price: 180.5,
    commission: 9.03,
    totalAmount: 9034.03,
    executedAt: new Date("2025-01-10T10:30:00"),
  },
  {
    _id: "2",
    symbol: "TSLA",
    side: "BUY",
    quantity: 25,
    price: 245.8,
    commission: 6.15,
    totalAmount: 6151.15,
    executedAt: new Date("2025-01-09T14:15:00"),
  },
  {
    _id: "3",
    symbol: "MSFT",
    side: "SELL",
    quantity: 30,
    price: 410.2,
    commission: 12.31,
    totalAmount: 12293.69,
    executedAt: new Date("2025-01-08T11:45:00"),
  },
]

export function TradeHistory() {
  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-bold mb-6">Trade History</h2>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Symbol</TableHead>
              <TableHead className="text-muted-foreground">Side</TableHead>
              <TableHead className="text-muted-foreground text-right">Quantity</TableHead>
              <TableHead className="text-muted-foreground text-right">Price</TableHead>
              <TableHead className="text-muted-foreground text-right">Commission</TableHead>
              <TableHead className="text-muted-foreground text-right">Total</TableHead>
              <TableHead className="text-muted-foreground">Executed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_TRADES.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No trade history
                </TableCell>
              </TableRow>
            ) : (
              MOCK_TRADES.map((trade) => (
                <TableRow key={trade._id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-bold">{trade.symbol}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        trade.side === "BUY" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {trade.side}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{trade.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(trade.price, "USD", 2)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(trade.commission, "USD", 2)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(trade.totalAmount, "USD", 2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{formatDateTime(trade.executedAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
