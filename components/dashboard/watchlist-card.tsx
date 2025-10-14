"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercent } from "@/lib/utils/format"
import { Star } from "lucide-react"

interface WatchlistStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

const MOCK_WATCHLIST: WatchlistStock[] = [
  { symbol: "AMZN", name: "Amazon.com", price: 224.42, change: 2.15, changePercent: 0.97 },
  { symbol: "NFLX", name: "Netflix, Inc", price: 1220.48, change: -8.32, changePercent: -0.68 },
  { symbol: "AAPL", name: "Apple Inc", price: 450.04, change: -16.54, changePercent: -3.54 },
]

export function WatchlistCard() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Your Watchlist</h2>
        <Button variant="ghost" size="sm" className="text-primary">
          View all
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_WATCHLIST.map((stock) => (
          <div key={stock.symbol} className="p-4 bg-secondary rounded-lg border border-border relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-6 w-6 text-[#F59E0B] hover:text-[#D97706]"
            >
              <Star className="h-4 w-4 fill-current" />
            </Button>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {stock.symbol.slice(0, 2)}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">{stock.name}</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(stock.price, "USD", 2)}</p>
              </div>

              <div className={`text-sm font-medium ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                {stock.change >= 0 ? "+" : ""}
                {formatCurrency(stock.change, "USD", 2)} ({formatPercent(stock.changePercent)})
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
