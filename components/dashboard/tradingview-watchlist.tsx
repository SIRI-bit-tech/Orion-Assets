"use client"

import { useEffect, useRef, useState } from "react"

interface TradingViewWatchlistProps {
  height?: number
  width?: string
  symbols?: string[]
}

export default function TradingViewWatchlist({ 
  height = 400, 
  width = "100%",
  symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "META", "NFLX"]
}: TradingViewWatchlistProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || isLoaded) return

    // Load TradingView Watchlist widget script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      symbols: symbols.map(symbol => ({
        s: symbol,
        d: symbol
      })),
      chartOnly: false,
      width: width,
      height: height,
      locale: "en",
      colorTheme: "light",
      autosize: true,
      showVolume: false,
      hideDateRanges: false,
      scalePosition: "right",
      scaleMode: "Normal",
      fontFamily: "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
      fontSize: "10",
      noTimeScale: false,
      valuesScale: "Normal",
      chartType: "area",
      lineColor: "rgba(41, 98, 255, 1)",
      topColor: "rgba(41, 98, 255, 0.3)",
      bottomColor: "rgba(41, 98, 255, 0)",
      lineStyle: 0,
      lineWidth: 2,
      pointSize: 1,
      fillStyle: "solid",
      isTransparent: false,
      gridLineColor: "rgba(240, 243, 250, 0)",
      fontColor: "rgba(120, 123, 134, 1)",
      scaleFontColor: "rgba(120, 123, 134, 1)",
      belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
      belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
      symbolActiveColor: "rgba(41, 98, 255, 0.12)"
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
          <div className="text-gray-500">Loading watchlist...</div>
        </div>
      )}
    </div>
  )
}
