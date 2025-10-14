"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, Shield } from "lucide-react"
import { formatCurrency, formatPercentage } from "@/lib/utils/format"

interface RiskMetrics {
  marginRequirements: {
    initialMargin: number
    maintenanceMargin: number
    usedMargin: number
    freeMargin: number
    marginLevel: number
    equity: number
  }
  riskMetrics: {
    totalExposure: number
    maxDrawdown: number
    sharpeRatio: number
    winRate: number
    profitFactor: number
  }
  account: {
    balance: number
    equity: number
    leverage: number
  }
}

export function RiskMetricsCard() {
  const [metrics, setMetrics] = useState<RiskMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRiskMetrics()
    const interval = setInterval(fetchRiskMetrics, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchRiskMetrics = async () => {
    try {
      const response = await fetch("/api/account/risk-metrics")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      }
    } catch (error) {
      console.error("[v0] Error fetching risk metrics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return null
  }

  const { marginRequirements, riskMetrics, account } = metrics

  const getMarginLevelColor = (level: number) => {
    if (level < 50) return "text-red-500"
    if (level < 120) return "text-yellow-500"
    return "text-green-500"
  }

  const getMarginLevelStatus = (level: number) => {
    if (level < 50) return "Critical - Liquidation Risk"
    if (level < 120) return "Warning - Margin Call"
    return "Healthy"
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Margin Status
          </CardTitle>
          <CardDescription>Real-time margin and risk monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Margin Level</span>
              <span className={`text-lg font-bold ${getMarginLevelColor(marginRequirements.marginLevel)}`}>
                {marginRequirements.marginLevel === Number.POSITIVE_INFINITY
                  ? "∞"
                  : formatPercentage(marginRequirements.marginLevel)}
              </span>
            </div>
            <Progress value={Math.min(marginRequirements.marginLevel, 200)} max={200} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{getMarginLevelStatus(marginRequirements.marginLevel)}</p>
          </div>

          {marginRequirements.marginLevel < 120 && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-500">Margin Warning</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your margin level is below the recommended threshold. Consider closing positions or depositing funds.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Equity</p>
              <p className="text-lg font-semibold">{formatCurrency(account.equity)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-lg font-semibold">{formatCurrency(account.balance)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Used Margin</p>
              <p className="text-lg font-semibold">{formatCurrency(marginRequirements.usedMargin)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Free Margin</p>
              <p className="text-lg font-semibold">{formatCurrency(marginRequirements.freeMargin)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>Trading performance analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Win Rate</p>
              <p className="text-lg font-semibold">{formatPercentage(riskMetrics.winRate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profit Factor</p>
              <p className="text-lg font-semibold">
                {riskMetrics.profitFactor === Number.POSITIVE_INFINITY ? "∞" : riskMetrics.profitFactor.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Sharpe Ratio</p>
              <p className="text-lg font-semibold">{riskMetrics.sharpeRatio.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Max Drawdown</p>
              <p className="text-lg font-semibold text-red-500">{formatCurrency(riskMetrics.maxDrawdown)}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Total Exposure</p>
            <p className="text-2xl font-bold">{formatCurrency(riskMetrics.totalExposure)}</p>
            <p className="text-xs text-muted-foreground mt-1">Leverage: {account.leverage}x</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
