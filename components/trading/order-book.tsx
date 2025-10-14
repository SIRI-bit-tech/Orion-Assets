"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { useWebSocket } from "@/lib/websocket/client"

interface OrderBookLevel {
  price: number
  quantity: number
  total: number
}

interface OrderBookProps {
  symbol: string
}

export function OrderBook({ symbol }: OrderBookProps) {
  const [bids, setBids] = useState<OrderBookLevel[]>([])
  const [asks, setAsks] = useState<OrderBookLevel[]>([])
  const { subscribe, unsubscribe } = useWebSocket()

  useEffect(() => {
    const handleOrderBook = (data: any) => {
      if (data.symbol === symbol && data.type === "orderbook") {
        setBids(data.bids || [])
        setAsks(data.asks || [])
      }
    }

    subscribe(`orderbook:${symbol}`, handleOrderBook)

    // Fetch initial order book data
    fetch(`/api/market/orderbook?symbol=${symbol}`)
      .then((res) => res.json())
      .then((data) => {
        setBids(data.bids || [])
        setAsks(data.asks || [])
      })
      .catch(console.error)

    return () => unsubscribe(`orderbook:${symbol}`)
  }, [symbol, subscribe, unsubscribe])

  const spread = asks[0] && bids[0] ? asks[0].price - bids[0].price : 0
  const spreadPercent = asks[0] && bids[0] ? (spread / bids[0].price) * 100 : 0

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Order Book</h2>
        <div className="text-sm text-muted-foreground">
          Spread: {formatCurrency(spread, "USD", 2)} ({spreadPercent.toFixed(2)}%)
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Bids (Buy Orders) */}
        <div>
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground mb-2 pb-2 border-b border-border">
            <div className="text-left">Price</div>
            <div className="text-right">Quantity</div>
            <div className="text-right">Total</div>
          </div>
          <div className="space-y-1">
            {bids.slice(0, 10).map((bid, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 gap-2 text-sm relative hover:bg-success/10 cursor-pointer rounded px-1 py-0.5"
              >
                <div
                  className="absolute inset-0 bg-success/20 rounded"
                  style={{ width: `${(bid.quantity / Math.max(...bids.map((b) => b.quantity))) * 100}%` }}
                />
                <div className="text-success font-mono relative z-10">{formatCurrency(bid.price, "USD", 2)}</div>
                <div className="text-right font-mono relative z-10">{bid.quantity.toFixed(2)}</div>
                <div className="text-right font-mono text-muted-foreground relative z-10">
                  {formatCurrency(bid.total, "USD", 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Asks (Sell Orders) */}
        <div>
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground mb-2 pb-2 border-b border-border">
            <div className="text-left">Price</div>
            <div className="text-right">Quantity</div>
            <div className="text-right">Total</div>
          </div>
          <div className="space-y-1">
            {asks.slice(0, 10).map((ask, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 gap-2 text-sm relative hover:bg-destructive/10 cursor-pointer rounded px-1 py-0.5"
              >
                <div
                  className="absolute inset-0 bg-destructive/20 rounded"
                  style={{ width: `${(ask.quantity / Math.max(...asks.map((a) => a.quantity))) * 100}%` }}
                />
                <div className="text-destructive font-mono relative z-10">{formatCurrency(ask.price, "USD", 2)}</div>
                <div className="text-right font-mono relative z-10">{ask.quantity.toFixed(2)}</div>
                <div className="text-right font-mono text-muted-foreground relative z-10">
                  {formatCurrency(ask.total, "USD", 0)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
