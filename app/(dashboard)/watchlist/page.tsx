import { Navbar } from "@/components/layout/navbar"
import TradingViewWatchlist from "@/components/dashboard/tradingview-watchlist"

export default function WatchlistPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6 pb-24">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Your Watchlist</h1>
          <p className="text-muted-foreground mt-2">Track your favorite securities</p>
        </div>

        <TradingViewWatchlist height={500} />
      </main>
    </div>
  )
}
