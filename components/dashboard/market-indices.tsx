"use client"

import { Card } from "@/components/ui/card"
import { formatCurrency, formatPercent } from "@/lib/utils/format"
import { TrendingUp, TrendingDown } from "lucide-react"

interface IndexData {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
}

const MOCK_INDICES: IndexData[] = [
  { symbol: "SPX", name: "S&P 500", value: 6432.6, change: -11.0, changePercent: -0.17 },
  { symbol: "NDX", name: "Nasdaq 100", value: 23453.86, change: 45.2, changePercent: 0.19 },
  { symbol: "DJI", name: "Dow Jones", value: 45221.7, change: -95.36, changePercent: -0.21 },
]

export function MarketIndices() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {MOCK_INDICES.map((index) => (
        <Card key={index.symbol} className="p-4 bg-card border-border">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{index.name}</p>
              <p className="text-2xl font-bold">{formatCurrency(index.value, "USD", 2)}</p>
            </div>
            <div className={`flex items-center gap-1 ${index.change >= 0 ? "text-success" : "text-destructive"}`}>
              {index.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-sm font-medium ${index.change >= 0 ? "text-success" : "text-destructive"}`}>
              {formatPercent(index.changePercent)}
            </span>
            <span className="text-sm text-muted-foreground">
              {index.change >= 0 ? "+" : ""}
              {formatCurrency(index.change, "USD", 2)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )
}
