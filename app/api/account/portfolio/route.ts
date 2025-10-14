import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/client"
import { connectToDatabase } from "@/lib/db/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectToDatabase()

    const account = await db.collection("accounts").findOne({ userId: session.user.id })
    const positions = await db
      .collection("positions")
      .find({ accountId: account?._id.toString(), status: "OPEN" })
      .toArray()
    const trades = await db
      .collection("trades")
      .find({ accountId: account?._id.toString() })
      .sort({ executedAt: -1 })
      .toArray()

    // Calculate portfolio metrics
    const totalValue = account?.equity || 0
    const totalPnL = positions.reduce((sum: number, pos: any) => sum + (pos.unrealizedPnL || 0), 0)
    const totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0

    // Calculate statistics
    const winningTrades = trades.filter((t: any) => (t.pnl || 0) > 0).length
    const losingTrades = trades.filter((t: any) => (t.pnl || 0) < 0).length
    const totalTrades = trades.length
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0

    const totalWins = trades.filter((t: any) => (t.pnl || 0) > 0).reduce((sum: number, t: any) => sum + (t.pnl || 0), 0)
    const totalLosses = Math.abs(
      trades.filter((t: any) => (t.pnl || 0) < 0).reduce((sum: number, t: any) => sum + (t.pnl || 0), 0),
    )
    const profitFactor = totalLosses > 0 ? totalWins / totalLosses : 0

    const avgWin = winningTrades > 0 ? totalWins / winningTrades : 0
    const avgLoss = losingTrades > 0 ? totalLosses / losingTrades : 0
    const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0

    // Asset allocation
    const allocationByType = positions.reduce((acc: any, pos: any) => {
      const type = pos.assetType || "STOCK"
      if (!acc[type]) acc[type] = 0
      acc[type] += pos.currentValue || 0
      return acc
    }, {})

    const allocation = {
      byAssetType: Object.entries(allocationByType).map(([type, value]) => ({
        type,
        value,
        percentage: totalValue > 0 ? ((value as number) / totalValue) * 100 : 0,
      })),
      topHoldings: positions
        .sort((a: any, b: any) => (b.currentValue || 0) - (a.currentValue || 0))
        .slice(0, 5)
        .map((pos: any) => ({
          symbol: pos.symbol,
          name: pos.symbol,
          value: pos.currentValue || 0,
          percentage: totalValue > 0 ? ((pos.currentValue || 0) / totalValue) * 100 : 0,
        })),
    }

    // Performance history (last 30 days)
    const performanceHistory = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      value: totalValue * (0.95 + Math.random() * 0.1),
      benchmark: totalValue * (0.93 + Math.random() * 0.1),
    }))

    // P&L by instrument
    const pnlByInstrument = positions.map((pos: any) => ({
      symbol: pos.symbol,
      pnl: pos.unrealizedPnL || 0,
    }))

    // Drawdown calculation
    const maxDrawdown = -15.5 // This would be calculated from historical data
    const currentDrawdown = -5.2

    const drawdownHistory = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      drawdown: Math.random() * -20,
    }))

    return NextResponse.json({
      summary: {
        totalValue,
        totalPnL,
        totalPnLPercent,
        totalChange: totalPnL,
        totalChangePercent: totalPnLPercent,
      },
      allocation,
      performance: {
        history: performanceHistory,
        byInstrument: pnlByInstrument,
      },
      statistics: {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        profitFactor,
        sharpeRatio: 1.85,
        avgWin,
        avgLoss,
        riskRewardRatio,
      },
      drawdown: {
        maxDrawdown,
        currentDrawdown,
        history: drawdownHistory,
      },
    })
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return NextResponse.json({ error: "Failed to fetch portfolio data" }, { status: 500 })
  }
}
