"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"

interface QuickTradeProps {
  symbol: string
  bidPrice: number
  askPrice: number
}

export function QuickTrade({ symbol, bidPrice, askPrice }: QuickTradeProps) {
  const [quantity, setQuantity] = useState("1")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuickTrade = async (side: "BUY" | "SELL") => {
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/trading/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          orderType: "MARKET",
          side,
          quantity: Number.parseFloat(quantity),
          timeInForce: "IOC",
        }),
      })

      if (!response.ok) throw new Error("Failed to place order")

      alert(`${side} order placed successfully!`)
    } catch (error) {
      alert("Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  const buyTotal = Number.parseFloat(quantity || "0") * askPrice
  const sellTotal = Number.parseFloat(quantity || "0") * bidPrice

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-bold mb-4">Quick Trade</h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Quantity</label>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            className="bg-secondary border-border"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Quick Buy */}
          <div className="space-y-2">
            <div className="text-center p-3 bg-secondary rounded-lg border border-border">
              <div className="text-xs text-muted-foreground mb-1">Ask Price</div>
              <div className="text-lg font-bold text-destructive">{formatCurrency(askPrice, "USD", 2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Total: {formatCurrency(buyTotal, "USD", 2)}</div>
            </div>
            <Button
              onClick={() => handleQuickTrade("BUY")}
              disabled={isSubmitting || !quantity || Number.parseFloat(quantity) <= 0}
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
            >
              Buy {symbol}
            </Button>
          </div>

          {/* Quick Sell */}
          <div className="space-y-2">
            <div className="text-center p-3 bg-secondary rounded-lg border border-border">
              <div className="text-xs text-muted-foreground mb-1">Bid Price</div>
              <div className="text-lg font-bold text-success">{formatCurrency(bidPrice, "USD", 2)}</div>
              <div className="text-xs text-muted-foreground mt-1">Total: {formatCurrency(sellTotal, "USD", 2)}</div>
            </div>
            <Button
              onClick={() => handleQuickTrade("SELL")}
              disabled={isSubmitting || !quantity || Number.parseFloat(quantity) <= 0}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Sell {symbol}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
