"use client"

import { useEffect, useRef, useState } from "react"
import { useSocketContext } from "@/components/providers/websocket-provider"

interface TradingViewChartProps {
  symbol: string
  height?: number
  width?: string
}

export default function TradingViewChart({ symbol, height = 400, width = "100%" }: TradingViewChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { subscribeToPrices, unsubscribeFromPrices, lastMessage } = useSocketContext()

  useEffect(() => {
    // Subscribe to price updates for this symbol
    subscribeToPrices([symbol])

    return () => {
      unsubscribeFromPrices([symbol])
    }
  }, [symbol, subscribeToPrices, unsubscribeFromPrices])

  useEffect(() => {
    if (!chartRef.current || isLoaded) return

    // Load TradingView widget script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/tv.js'
    script.async = true
    script.onload = () => {
      if (window.TradingView && chartRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: "1",
          timezone: "Etc/UTC",
          theme: "light",
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: chartRef.current.id,
          studies: [
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies"
          ],
          width: width,
          height: height,
        })
        setIsLoaded(true)
      }
    }
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [symbol, height, width, isLoaded])

  // Update chart with real-time data using TradingView API
  useEffect(() => {
    if (lastMessage?.type === "price_update" && lastMessage.data) {
      const priceData = lastMessage.data.find((quote: MarketQuote) => quote.symbol === symbol)
      if (priceData && window.TradingView && window.TradingView.widget) {
        try {
          // Get the widget instance
          const widget = window.TradingView.widget
          if (widget && widget.chart) {
            // Update the chart with new price data
            widget.chart().executeActionById('charting_library.toggle_auto_scale')
            
            // Create a new bar with the latest price data
            const newBar = {
              time: Math.floor(Date.now() / 1000),
              open: priceData.open,
              high: priceData.high,
              low: priceData.low,
              close: priceData.price,
              volume: priceData.volume
            }
            
            // Update the chart data
            widget.chart().updateData(newBar)
            
            console.log(`[TradingView] Updated chart for ${symbol}:`, priceData.price)
          }
        } catch (error) {
          console.error(`[TradingView] Error updating chart for ${symbol}:`, error)
        }
      }
    }
  }, [lastMessage, symbol])

  return (
    <div className="w-full">
      <div 
        ref={chartRef}
        id={`tradingview_${symbol}`}
        className="w-full border rounded-lg"
        style={{ height: `${height}px` }}
      />
      {!isLoaded && (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      )}
    </div>
  )
}

// Extend Window interface for TradingView
declare global {
  interface Window {
    TradingView: any
  }
}