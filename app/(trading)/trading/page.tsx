import { Navbar } from "@/components/layout/navbar"
import { AccountSummary } from "@/components/trading/account-summary"
import { OrderForm } from "@/components/trading/order-form"
import { PositionsTable } from "@/components/trading/positions-table"
import { OrdersTable } from "@/components/trading/orders-table"
import { TradeHistory } from "@/components/trading/trade-history"
import { TradingViewChart } from "@/components/dashboard/tradingview-chart"
import { RiskMetricsCard } from "@/components/trading/risk-metrics-card"
import { OrderBook } from "@/components/trading/order-book"
import { QuickTrade } from "@/components/trading/quick-trade"
import { Card } from "@/components/ui/card"

export default function TradingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6 space-y-6">
        {/* Account Summary */}
        <AccountSummary />

        <RiskMetricsCard />

        {/* Main Trading Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Chart and Order Book */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-card border-border">
              <h2 className="text-xl font-bold mb-4">Chart</h2>
              <TradingViewChart symbol="AAPL" height={500} />
            </Card>

            <OrderBook symbol="AAPL" />

            <PositionsTable />
            <OrdersTable />
            <TradeHistory />
          </div>

          {/* Right Column - Order Forms */}
          <div className="lg:col-span-1 space-y-6">
            <QuickTrade symbol="AAPL" bidPrice={233.14} askPrice={233.18} />

            <OrderForm symbol="AAPL" currentPrice={233.16} />
          </div>
        </div>
      </main>
    </div>
  )
}
