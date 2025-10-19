"use client"

import { useEffect, useRef, useState } from "react"

interface TradingViewNewsProps {
  height?: number
  width?: string
  symbols?: string[]
  feedMode?: "all" | "symbol"
}

export default function TradingViewNews({ 
  height = 400, 
  width = "100%",
  symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA"],
  feedMode = "all"
}: TradingViewNewsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!containerRef.current || isLoaded) return

    // Load TradingView Timeline widget script
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      feedMode: feedMode,
      colorTheme: "light",
      isTransparent: false,
      displayMode: "regular",
      width: width,
      height: height,
      locale: "en",
      ...(feedMode === "symbol" && symbols.length > 0 && {
        symbol: symbols[0]
      })
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
  }, [height, width, symbols, feedMode, isLoaded])

  return (
    <div className="w-full">
      <div 
        ref={containerRef}
        className="w-full border rounded-lg overflow-hidden"
        style={{ height: `${height}px` }}
      />
      {!isLoaded && (
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading news...</div>
        </div>
      )}
    </div>
  )
}
