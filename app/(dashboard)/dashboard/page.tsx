import { Navbar } from "@/components/layout/navbar"
import { MarketIndices } from "@/components/dashboard/market-indices"
import { TradingViewHeatmap } from "@/components/dashboard/tradingview-heatmap"
import { MarketSummary } from "@/components/dashboard/market-summary"
import { WatchlistCard } from "@/components/dashboard/watchlist-card"
import { TopStocksTable } from "@/components/dashboard/top-stocks-table"
import { FinancialNews } from "@/components/dashboard/financial-news"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6 space-y-6">
        {/* Market Indices */}
        <MarketIndices />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Market Summary & Top Stocks */}
          <div className="lg:col-span-1 space-y-6">
            <MarketSummary />
          </div>

          {/* Center Column - TradingView Heatmap */}
          <div className="lg:col-span-2">
            <Card className="p-0 bg-card border-border h-[600px] overflow-hidden">
              <TradingViewHeatmap />
            </Card>
          </div>
        </div>

        {/* Watchlist */}
        <WatchlistCard />

        {/* Bottom Grid - Top Stocks & News */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopStocksTable />
          <FinancialNews />
        </div>
      </main>
    </div>
  )
}
