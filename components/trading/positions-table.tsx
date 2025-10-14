"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency, formatPercent } from "@/lib/utils/format"
import { X } from "lucide-react"

interface Position {
  _id: string
  symbol: string
  side: "LONG" | "SHORT"
  quantity: number
  averageEntryPrice: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
}

const MOCK_POSITIONS: Position[] = [
  {
    _id: "1",
    symbol: "AAPL",
    side: "LONG",
    quantity: 50,
    averageEntryPrice: 180.5,
    currentPrice: 233.16,
    marketValue: 11658,
    unrealizedPnL: 2633,
    unrealizedPnLPercent: 29.15,
  },
  {
    _id: "2",
    symbol: "TSLA",
    side: "LONG",
    quantity: 25,
    averageEntryPrice: 245.8,
    currentPrice: 330.02,
    marketValue: 8250.5,
    unrealizedPnL: 2105.5,
    unrealizedPnLPercent: 34.27,
  },
  {
    _id: "3",
    symbol: "NVDA",
    side: "LONG",
    quantity: 100,
    averageEntryPrice: 195.2,
    currentPrice: 181.46,
    marketValue: 18146,
    unrealizedPnL: -1374,
    unrealizedPnLPercent: -7.04,
  },
]

export function PositionsTable() {
  const handleClosePosition = async (positionId: string) => {
    if (!confirm("Are you sure you want to close this position?")) return

    try {
      const response = await fetch(`/api/trading/positions/${positionId}/close`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to close position")

      alert("Position closed successfully!")
    } catch (error) {
      alert("Failed to close position")
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Open Positions</h2>
        <div className="text-sm text-muted-foreground">
          Total P&L:{" "}
          <span className="text-success font-semibold">
            {formatCurrency(
              MOCK_POSITIONS.reduce((sum, pos) => sum + pos.unrealizedPnL, 0),
              "USD",
              2,
            )}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Symbol</TableHead>
              <TableHead className="text-muted-foreground">Side</TableHead>
              <TableHead className="text-muted-foreground text-right">Quantity</TableHead>
              <TableHead className="text-muted-foreground text-right">Avg Entry</TableHead>
              <TableHead className="text-muted-foreground text-right">Current Price</TableHead>
              <TableHead className="text-muted-foreground text-right">Market Value</TableHead>
              <TableHead className="text-muted-foreground text-right">Unrealized P&L</TableHead>
              <TableHead className="text-muted-foreground text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_POSITIONS.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No open positions
                </TableCell>
              </TableRow>
            ) : (
              MOCK_POSITIONS.map((position) => (
                <TableRow key={position._id} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-bold">{position.symbol}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        position.side === "LONG" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {position.side}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{position.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(position.averageEntryPrice, "USD", 2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(position.currentPrice, "USD", 2)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(position.marketValue, "USD", 2)}</TableCell>
                  <TableCell className="text-right">
                    <div className={position.unrealizedPnL >= 0 ? "text-success" : "text-destructive"}>
                      <div className="font-semibold">{formatCurrency(position.unrealizedPnL, "USD", 2)}</div>
                      <div className="text-xs">{formatPercent(position.unrealizedPnLPercent)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleClosePosition(position._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
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
