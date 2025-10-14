"use client"

import { Card } from "@/components/ui/card"
import { formatCurrency, formatCompactNumber } from "@/lib/utils/format"
import { Users, TrendingUp, DollarSign, Activity } from "lucide-react"

interface AdminStatsProps {
  totalUsers?: number
  activeUsers?: number
  totalVolume?: number
  totalOrders?: number
}

export function AdminStats({
  totalUsers = 1247,
  activeUsers = 892,
  totalVolume = 45678900,
  totalOrders = 3456,
}: AdminStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{formatCompactNumber(totalUsers)}</p>
            <p className="text-xs text-success">+12% from last month</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-2xl font-bold">{formatCompactNumber(activeUsers)}</p>
            <p className="text-xs text-success">+8% from last month</p>
          </div>
          <div className="p-2 bg-success/10 rounded-lg">
            <Activity className="h-5 w-5 text-success" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Volume</p>
            <p className="text-2xl font-bold">{formatCurrency(totalVolume, "USD", 0)}</p>
            <p className="text-xs text-success">+24% from last month</p>
          </div>
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <DollarSign className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="text-2xl font-bold">{formatCompactNumber(totalOrders)}</p>
            <p className="text-xs text-success">+18% from last month</p>
          </div>
          <div className="p-2 bg-[#F59E0B]/10 rounded-lg">
            <TrendingUp className="h-5 w-5 text-[#F59E0B]" />
          </div>
        </div>
      </Card>
    </div>
  )
}
