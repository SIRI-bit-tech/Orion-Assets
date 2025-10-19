"use client"

import { useState, useEffect } from "react"
import { useSocketContext } from "@/components/providers/websocket-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface LivePriceFeedProps {
  symbols?: string[]
  maxItems?: number
}

export default function LivePriceFeed({ symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"], maxItems = 10 }: LivePriceFeedProps) {
  const [priceData, setPriceData] = useState<Map<string, MarketQuote>>(new Map())
  const { subscribeToPrices, unsubscribeFromPrices, lastMessage, isConnected } = useSocketContext()

  useEffect(() => {
    // Subscribe to price updates for specified symbols
    subscribeToPrices(symbols)

    return () => {
      unsubscribeFromPrices(symbols)
    }
  }, [symbols, subscribeToPrices, unsubscribeFromPrices])

  useEffect(() => {
    if (lastMessage?.type === "price_update" && lastMessage.data) {
      const newPriceData = new Map(priceData)
      
      lastMessage.data.forEach((quote: MarketQuote) => {
        if (symbols.includes(quote.symbol)) {
          newPriceData.set(quote.symbol, quote)
        }
      })
      
      setPriceData(newPriceData)
    }
  }, [lastMessage, symbols, priceData])

  const formatPrice = (price: number) => {
    return price.toFixed(2)
  }

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getChangeBadgeVariant = (change: number) => {
    if (change > 0) return "default" as const
    if (change < 0) return "destructive" as const
    return "secondary" as const
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Live Price Feed</CardTitle>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from(priceData.values()).slice(0, maxItems).map((quote) => (
            <div key={quote.symbol} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex flex-col">
                <div className="font-semibold text-sm">{quote.symbol}</div>
                <div className="text-xs text-muted-foreground">{quote.name}</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="font-semibold text-sm">${formatPrice(quote.price)}</div>
                <Badge variant={getChangeBadgeVariant(quote.change)} className="text-xs">
                  {formatChange(quote.change, quote.changePercent)}
                </Badge>
              </div>
            </div>
          ))}
          
          {priceData.size === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-sm">Waiting for price data...</div>
              <div className="text-xs mt-1">
                {!isConnected ? "Connecting to server..." : "No data received yet"}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
