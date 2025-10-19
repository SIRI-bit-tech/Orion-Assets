"use client"

import { useEffect, useRef, useState } from "react"

interface TradingViewMarketOverviewProps {
  height?: number
  width?: string
  symbols?: string[][]
}

export default function TradingViewMarketOverview({ 
  height = 400, 
  width = "100%",
  symbols = [
    ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"],
    ["NVDA", "META", "NFLX", "AMD", "INTC"],
    ["BTCUSD", "ETHUSD", "XRPUSD", "ADAUSD", "SOLUSD"]
  ]
}: TradingViewMarketOverviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || isLoaded) return

    // Load TradingView Market Overview widget script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      colorTheme: "light",
      dateRange: "12M",
      showChart: true,
      locale: "en",
      width: width,
      height: height,
      largeChartUrl: "",
      isTransparent: false,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: "rgba(41, 98, 255, 1)",
      plotLineColorFalling: "rgba(41, 98, 255, 1)",
      gridLineColor: "rgba(240, 243, 250, 0)",
      scaleFontColor: "rgba(120, 123, 134, 1)",
      belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
      belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
      symbolActiveColor: "rgba(41, 98, 255, 0.12)",
      tabs: symbols.map((group, index) => ({
        title: index === 0 ? "Stocks" : index === 1 ? "Tech" : "Crypto",
        symbols: group.map(symbol => ({
          s: symbol,
          d: symbol
        }))
      }))
    })
    
    script.onload = () => {
      setIsLoaded(true)
    }
    
    containerRef.current.appendChild(script)

    return () => {
      if (containerRef.current && script.parentNode) {
        containerRef.current.removeChild(script)
      }
    }
  }, [height, width, symbols, isLoaded])

  return (
    <div className="w-full">
      <div 
        ref={containerRef}
        className="w-full border rounded-lg overflow-hidden"
        style={{ height: `${height}px` }}
      />
      {!isLoaded && (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading market overview...</div>
        </div>
      )}
    </div>
  )
}
