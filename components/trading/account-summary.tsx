"use client"

import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { TrendingUp, Wallet, DollarSign, Activity } from "lucide-react"

interface AccountSummaryProps {
  balance?: number
  equity?: number
  buyingPower?: number
  unrealizedPnL?: number
}

export function AccountSummary({
  balance = 50000,
  equity = 53364,
  buyingPower = 48626,
  unrealizedPnL = 3364,
}: AccountSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Account Balance</p>
            <p className="text-2xl font-bold">{formatCurrency(balance, "USD", 2)}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Equity</p>
            <p className="text-2xl font-bold">{formatCurrency(equity, "USD", 2)}</p>
          </div>
          <div className="p-2 bg-success/10 rounded-lg">
            <DollarSign className="h-5 w-5 text-success" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Buying Power</p>
            <p className="text-2xl font-bold">{formatCurrency(buyingPower, "USD", 2)}</p>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Activity className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Unrealized P&L</p>
            <p className={`text-2xl font-bold ${unrealizedPnL >= 0 ? "text-success" : "text-destructive"}`}>
              {unrealizedPnL >= 0 ? "+" : ""}
              {formatCurrency(unrealizedPnL, "USD", 2)}
            </p>
          </div>
          <div className={`p-2 rounded-lg ${unrealizedPnL >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
            <TrendingUp className={`h-5 w-5 ${unrealizedPnL >= 0 ? "text-success" : "text-destructive"}`} />
          </div>
        </div>
      </Card>
    </div>
  )
}
