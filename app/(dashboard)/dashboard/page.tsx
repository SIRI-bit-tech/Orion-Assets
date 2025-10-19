import { Navbar } from "@/components/layout/navbar"
import { MarketIndices } from "@/components/dashboard/market-indices"
import TradingViewHeatmap from "@/components/dashboard/tradingview-heatmap"
import TradingViewMarketOverview from "@/components/dashboard/tradingview-market-overview"
import TradingViewWatchlist from "@/components/dashboard/tradingview-watchlist"
import TradingViewNews from "@/components/dashboard/tradingview-news"
import TradingViewChart from "@/components/dashboard/tradingview-chart"
import LivePriceFeed from "@/components/dashboard/live-price-feed"
import { Card } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6 space-y-6">
        {/* Market Indices */}
        <MarketIndices />

        {/* Real-Time Trading Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-0 bg-card border-border h-[500px] overflow-hidden">
            <TradingViewChart symbol="AAPL" height={500} />
          </Card>
          <LivePriceFeed symbols={["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA"]} />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Market Overview */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-0 bg-card border-border h-[400px] overflow-hidden">
              <TradingViewMarketOverview height={400} />
            </Card>
          </div>

          {/* Center Column - TradingView Heatmap */}
          <div className="lg:col-span-2">
            <Card className="p-0 bg-card border-border h-[600px] overflow-hidden">
              <TradingViewHeatmap height={600} />
            </Card>
          </div>
        </div>

        {/* Watchlist */}
        <Card className="p-0 bg-card border-border h-[400px] overflow-hidden">
          <TradingViewWatchlist height={400} />
        </Card>

        {/* Bottom Grid - News */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card className="p-0 bg-card border-border h-[500px] overflow-hidden">
            <TradingViewNews height={500} />
          </Card>
        </div>
      </main>
    </div>
  )
}
