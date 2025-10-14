"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/navbar"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, PieChart } from "lucide-react"
import { formatCurrency, formatPercent } from "@/lib/utils/format"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/account/portfolio")
      .then((res) => res.json())
      .then((data) => {
        setPortfolioData(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto p-6">
          <div className="text-center py-12">Loading portfolio data...</div>
        </main>
      </div>
    )
  }

  const { summary, allocation, performance, statistics, drawdown } = portfolioData || {}

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card border-border">
            <div className="text-sm text-muted-foreground mb-1">Total Value</div>
            <div className="text-2xl font-bold">{formatCurrency(summary?.totalValue || 0, "USD", 2)}</div>
            <div
              className={`text-sm mt-1 flex items-center gap-1 ${summary?.totalChange >= 0 ? "text-success" : "text-destructive"}`}
            >
              {summary?.totalChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {formatPercent(summary?.totalChangePercent || 0)}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="text-sm text-muted-foreground mb-1">Total P&L</div>
            <div className={`text-2xl font-bold ${summary?.totalPnL >= 0 ? "text-success" : "text-destructive"}`}>
              {formatCurrency(summary?.totalPnL || 0, "USD", 2)}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{formatPercent(summary?.totalPnLPercent || 0)}</div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
            <div className="text-2xl font-bold">{formatPercent(statistics?.winRate || 0)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {statistics?.winningTrades || 0} / {statistics?.totalTrades || 0} trades
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="text-sm text-muted-foreground mb-1">Max Drawdown</div>
            <div className="text-2xl font-bold text-destructive">{formatPercent(drawdown?.maxDrawdown || 0)}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Current: {formatPercent(drawdown?.currentDrawdown || 0)}
            </div>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="allocation">Allocation</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="drawdown">Drawdown</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-bold mb-4">Portfolio Performance</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performance?.history || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Portfolio Value"
                  />
                  <Line
                    type="monotone"
                    dataKey="benchmark"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Benchmark"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-bold mb-4">P&L by Instrument</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performance?.byInstrument || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="symbol" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Bar dataKey="pnl" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          {/* Allocation Tab */}
          <TabsContent value="allocation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Asset Allocation
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={allocation?.byAssetType || []}
                      dataKey="value"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {(allocation?.byAssetType || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold mb-4">Top Holdings</h3>
                <div className="space-y-3">
                  {(allocation?.topHoldings || []).map((holding: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                      <div>
                        <div className="font-semibold">{holding.symbol}</div>
                        <div className="text-sm text-muted-foreground">{holding.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(holding.value, "USD", 0)}</div>
                        <div className="text-sm text-muted-foreground">{formatPercent(holding.percentage)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 bg-card border-border">
                <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
                <div className="text-2xl font-bold">{statistics?.totalTrades || 0}</div>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="text-sm text-muted-foreground mb-1">Profit Factor</div>
                <div className="text-2xl font-bold text-success">{statistics?.profitFactor?.toFixed(2) || "0.00"}</div>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="text-sm text-muted-foreground mb-1">Sharpe Ratio</div>
                <div className="text-2xl font-bold">{statistics?.sharpeRatio?.toFixed(2) || "0.00"}</div>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="text-sm text-muted-foreground mb-1">Avg Win</div>
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(statistics?.avgWin || 0, "USD", 2)}
                </div>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="text-sm text-muted-foreground mb-1">Avg Loss</div>
                <div className="text-2xl font-bold text-destructive">
                  {formatCurrency(statistics?.avgLoss || 0, "USD", 2)}
                </div>
              </Card>
              <Card className="p-6 bg-card border-border">
                <div className="text-sm text-muted-foreground mb-1">Risk/Reward</div>
                <div className="text-2xl font-bold">{statistics?.riskRewardRatio?.toFixed(2) || "0.00"}</div>
              </Card>
            </div>
          </TabsContent>

          {/* Drawdown Tab */}
          <TabsContent value="drawdown" className="space-y-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-lg font-bold mb-4">Drawdown History</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={drawdown?.history || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="drawdown"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    name="Drawdown %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
