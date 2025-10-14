"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import type { ORDER_TYPES, TIME_IN_FORCE } from "@/lib/constants/trading"

interface OrderFormProps {
  symbol?: string
  currentPrice?: number
}

export function OrderForm({ symbol = "", currentPrice = 0 }: OrderFormProps) {
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY")
  const [orderType, setOrderType] = useState<keyof typeof ORDER_TYPES>("MARKET")
  const [quantity, setQuantity] = useState("")
  const [price, setPrice] = useState("")
  const [stopPrice, setStopPrice] = useState("")
  const [limitPrice, setLimitPrice] = useState("")
  const [timeInForce, setTimeInForce] = useState<keyof typeof TIME_IN_FORCE>("GTC")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const estimatedTotal =
    Number.parseFloat(quantity || "0") * (orderType === "MARKET" ? currentPrice : Number.parseFloat(price || "0"))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const orderData = {
        symbol,
        orderType,
        side: orderSide,
        quantity: Number.parseFloat(quantity),
        price: price ? Number.parseFloat(price) : undefined,
        stopPrice: stopPrice ? Number.parseFloat(stopPrice) : undefined,
        limitPrice: limitPrice ? Number.parseFloat(limitPrice) : undefined,
        timeInForce,
      }

      const response = await fetch("/api/trading/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) throw new Error("Failed to place order")

      // Reset form
      setQuantity("")
      setPrice("")
      setStopPrice("")
      setLimitPrice("")
      alert("Order placed successfully!")
    } catch (error) {
      alert("Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-bold mb-6">Place Order</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Buy/Sell Tabs */}
        <Tabs value={orderSide} onValueChange={(v) => setOrderSide(v as "BUY" | "SELL")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="BUY"
              className="data-[state=active]:bg-success data-[state=active]:text-success-foreground"
            >
              Buy
            </TabsTrigger>
            <TabsTrigger
              value="SELL"
              className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
            >
              Sell
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Symbol */}
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol</Label>
          <Input
            id="symbol"
            type="text"
            value={symbol}
            placeholder="e.g., AAPL"
            className="bg-secondary border-border uppercase"
            readOnly
          />
        </div>

        {/* Order Type */}
        <div className="space-y-2">
          <Label htmlFor="orderType">Order Type</Label>
          <Select value={orderType} onValueChange={(v) => setOrderType(v as keyof typeof ORDER_TYPES)}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MARKET">Market</SelectItem>
              <SelectItem value="LIMIT">Limit</SelectItem>
              <SelectItem value="STOP">Stop</SelectItem>
              <SelectItem value="STOP_LIMIT">Stop Limit</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            className="bg-secondary border-border"
            required
          />
        </div>

        {/* Limit Price */}
        {(orderType === "LIMIT" || orderType === "STOP_LIMIT") && (
          <div className="space-y-2">
            <Label htmlFor="limitPrice">Limit Price</Label>
            <Input
              id="limitPrice"
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="bg-secondary border-border"
              required
            />
          </div>
        )}

        {/* Stop Price */}
        {(orderType === "STOP" || orderType === "STOP_LIMIT") && (
          <div className="space-y-2">
            <Label htmlFor="stopPrice">Stop Price</Label>
            <Input
              id="stopPrice"
              type="number"
              value={stopPrice}
              onChange={(e) => setStopPrice(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="bg-secondary border-border"
              required
            />
          </div>
        )}

        {/* Time in Force */}
        <div className="space-y-2">
          <Label htmlFor="timeInForce">Time in Force</Label>
          <Select value={timeInForce} onValueChange={(v) => setTimeInForce(v as keyof typeof TIME_IN_FORCE)}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GTC">Good Till Cancelled</SelectItem>
              <SelectItem value="DAY">Day Order</SelectItem>
              <SelectItem value="IOC">Immediate or Cancel</SelectItem>
              <SelectItem value="FOK">Fill or Kill</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estimated Total */}
        <div className="p-4 bg-secondary rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated Total</span>
            <span className="text-lg font-bold">{formatCurrency(estimatedTotal, "USD", 2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className={`w-full ${
            orderSide === "BUY"
              ? "bg-success hover:bg-success/90 text-success-foreground"
              : "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          }`}
          disabled={isSubmitting || !quantity}
        >
          {isSubmitting ? "Placing Order..." : `${orderSide === "BUY" ? "Buy" : "Sell"} ${symbol || "Stock"}`}
        </Button>
      </form>
    </Card>
  )
}
