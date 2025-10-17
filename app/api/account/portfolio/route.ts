import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongodb";
import { ObjectId } from "mongodb";
import {
  withAuth,
  getUserAccount,
  createAuditLog,
  AuthErrors,
} from "@/lib/auth/server-utils";

export const GET = withAuth(async (request, { user }) => {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d"; // 1d, 7d, 30d, 90d, 1y

    // Get user's trading account
    const account = await getUserAccount(user.id);
    if (!account) {
      return NextResponse.json(AuthErrors.ACCOUNT_NOT_FOUND, { status: 400 });
    }

    // Get current positions
    const positions = await db
      .collection("positions")
      .find({
        userId: new ObjectId(user.id),
        accountId: account._id,
        status: "OPEN",
      })
      .toArray();

    // Get recent trades for performance calculation
    const trades = await db
      .collection("trades")
      .find({
        userId: new ObjectId(user.id),
        accountId: account._id,
      })
      .sort({ executedAt: -1 })
      .limit(1000)
      .toArray();

    // Calculate portfolio metrics
    const totalValue = account.equity || 0;
    const totalPnL = positions.reduce((sum: number, pos: any) => {
      const currentValue = pos.currentValue || 0;
      const costBasis = pos.costBasis || 0;
      return sum + (currentValue - costBasis);
    }, 0);
    const totalPnLPercent = totalValue > 0 ? (totalPnL / totalValue) * 100 : 0;

    // Calculate trade statistics
    const completedTrades = trades.filter((t: any) => t.status === "FILLED");
    const winningTrades = completedTrades.filter((t: any) => (t.pnl || 0) > 0);
    const losingTrades = completedTrades.filter((t: any) => (t.pnl || 0) < 0);

    const totalTrades = completedTrades.length;
    const winRate =
      totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;

    const totalWins = winningTrades.reduce(
      (sum: number, t: any) => sum + (t.pnl || 0),
      0,
    );
    const totalLosses = Math.abs(
      losingTrades.reduce((sum: number, t: any) => sum + (t.pnl || 0), 0),
    );
    const profitFactor =
      totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;

    const avgWin =
      winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
    const avgLoss =
      losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
    const riskRewardRatio =
      avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;

    // Asset allocation calculation
    const allocationByType = positions.reduce((acc: any, pos: any) => {
      const type = pos.assetClass || "STOCK";
      const value = pos.currentValue || 0;
      if (!acc[type]) acc[type] = { value: 0, count: 0 };
      acc[type].value += value;
      acc[type].count += 1;
      return acc;
    }, {});

    const allocation = {
      byAssetType: Object.entries(allocationByType).map(
        ([type, data]: [string, any]) => ({
          type,
          value: data.value,
          count: data.count,
          percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
        }),
      ),
      topHoldings: positions
        .sort((a: any, b: any) => (b.currentValue || 0) - (a.currentValue || 0))
        .slice(0, 10)
        .map((pos: any) => ({
          symbol: pos.symbol,
          name: pos.companyName || pos.symbol,
          quantity: pos.quantity,
          currentPrice: pos.currentPrice,
          value: pos.currentValue || 0,
          costBasis: pos.costBasis || 0,
          pnl: (pos.currentValue || 0) - (pos.costBasis || 0),
          pnlPercent:
            pos.costBasis > 0
              ? (((pos.currentValue || 0) - pos.costBasis) / pos.costBasis) *
                100
              : 0,
          percentage:
            totalValue > 0 ? ((pos.currentValue || 0) / totalValue) * 100 : 0,
        })),
    };

    // Performance history calculation
    const periodDays = {
      "1d": 1,
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    };
    const days = periodDays[period as keyof typeof periodDays] || 30;

    // Get account value history from trades and positions
    const performanceHistory = await calculatePerformanceHistory(
      db,
      account._id,
      days,
    );

    // P&L by instrument
    const pnlByInstrument = positions
      .map((pos: any) => ({
        symbol: pos.symbol,
        pnl: (pos.currentValue || 0) - (pos.costBasis || 0),
        pnlPercent:
          pos.costBasis > 0
            ? (((pos.currentValue || 0) - pos.costBasis) / pos.costBasis) * 100
            : 0,
        quantity: pos.quantity,
        currentValue: pos.currentValue || 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);

    // Calculate drawdown from performance history
    const { maxDrawdown, currentDrawdown, drawdownHistory } =
      calculateDrawdown(performanceHistory);

    // Calculate Sharpe ratio
    const returns = performanceHistory
      .slice(1)
      .map((point: any, index: number) => {
        const prevValue = performanceHistory[index].value;
        return prevValue > 0 ? (point.value - prevValue) / prevValue : 0;
      });

    const avgReturn =
      returns.length > 0
        ? returns.reduce((sum: number, r: number) => sum + r, 0) /
          returns.length
        : 0;
    const returnStdDev = calculateStandardDeviation(returns);
    const sharpeRatio =
      returnStdDev > 0 ? (avgReturn / returnStdDev) * Math.sqrt(252) : 0; // Annualized

    // Sector allocation for stocks
    const sectorAllocation = await calculateSectorAllocation(
      db,
      positions.filter((p) => p.assetClass === "STOCK"),
    );

    // Create audit log for portfolio access
    await createAuditLog(
      user.id,
      "PORTFOLIO_VIEWED",
      "portfolio",
      account._id.toString(),
      { period },
      { totalValue, totalPnL, positionsCount: positions.length },
    );

    return NextResponse.json({
      summary: {
        totalValue,
        totalPnL,
        totalPnLPercent,
        totalChange: totalPnL,
        totalChangePercent: totalPnLPercent,
        dayChange: account.dayReturn || 0,
        dayChangePercent: account.dayReturnPercent || 0,
        buyingPower: account.buyingPower,
        cash: account.cash || 0,
        marginUsed: account.marginUsed || 0,
        marginAvailable: account.marginAvailable || 0,
      },
      allocation,
      performance: {
        history: performanceHistory,
        byInstrument: pnlByInstrument,
        sectorAllocation,
      },
      statistics: {
        totalTrades,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        profitFactor,
        sharpeRatio,
        avgWin,
        avgLoss,
        riskRewardRatio,
        totalCommissions: trades.reduce(
          (sum: number, t: any) => sum + (t.commission || 0),
          0,
        ),
        largestWin:
          winningTrades.length > 0
            ? Math.max(...winningTrades.map((t: any) => t.pnl || 0))
            : 0,
        largestLoss:
          losingTrades.length > 0
            ? Math.min(...losingTrades.map((t: any) => t.pnl || 0))
            : 0,
      },
      drawdown: {
        maxDrawdown,
        currentDrawdown,
        history: drawdownHistory,
      },
      risk: {
        beta: await calculatePortfolioBeta(positions),
        volatility: returnStdDev * Math.sqrt(252) * 100, // Annualized volatility as percentage
        var95: calculateVaR(returns, 0.95),
        diversificationRatio: calculateDiversificationRatio(positions),
      },
    });
  } catch (error) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio data" },
      { status: 500 },
    );
  }
});

// Helper function to calculate performance history
async function calculatePerformanceHistory(
  db: any,
  accountId: ObjectId,
  days: number,
) {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  // Get daily account snapshots or calculate from trades
  const snapshots = await db
    .collection("account_snapshots")
    .find({
      accountId,
      date: { $gte: startDate, $lte: endDate },
    })
    .sort({ date: 1 })
    .toArray();

  if (snapshots.length > 0) {
    return snapshots.map((snapshot: any) => ({
      date: snapshot.date.toISOString().split("T")[0],
      value: snapshot.totalValue,
      benchmark: snapshot.benchmarkValue || snapshot.totalValue,
    }));
  }

  // Fallback: generate history from current account value with simple interpolation
  const currentAccount = await db
    .collection("accounts")
    .findOne({ _id: accountId });
  const currentValue = currentAccount?.equity || 0;

  const history = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    // Growth simulation based on total return
    const progress = i / (days - 1);
    const totalReturn = currentAccount?.totalReturn || 0;
    const historicalValue = currentValue - totalReturn * (1 - progress);

    history.push({
      date: date.toISOString().split("T")[0],
      value: Math.max(historicalValue, 0),
      benchmark: Math.max(historicalValue * 1.02, 0),
    });
  }

  return history;
}

// Helper function to calculate drawdown
function calculateDrawdown(performanceHistory: any[]) {
  if (performanceHistory.length === 0) {
    return { maxDrawdown: 0, currentDrawdown: 0, drawdownHistory: [] };
  }

  let peak = performanceHistory[0].value;
  let maxDrawdown = 0;
  const drawdownHistory = [];

  for (const point of performanceHistory) {
    if (point.value > peak) {
      peak = point.value;
    }

    const drawdown = peak > 0 ? ((point.value - peak) / peak) * 100 : 0;
    maxDrawdown = Math.min(maxDrawdown, drawdown);

    drawdownHistory.push({
      date: point.date,
      drawdown,
    });
  }

  const currentDrawdown =
    drawdownHistory[drawdownHistory.length - 1]?.drawdown || 0;

  return { maxDrawdown, currentDrawdown, drawdownHistory };
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  return Math.sqrt(variance);
}

// Helper function to calculate Value at Risk (VaR)
function calculateVaR(returns: number[], confidenceLevel: number): number {
  if (returns.length === 0) return 0;

  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * sortedReturns.length);
  return sortedReturns[index] || 0;
}

// Helper function to calculate sector allocation
async function calculateSectorAllocation(db: any, stockPositions: any[]) {
  const sectorMap: { [key: string]: number } = {};

  for (const position of stockPositions) {
    // Get sector information from securities collection
    const security = await db
      .collection("securities")
      .findOne({ symbol: position.symbol });
    const sector = security?.sector || "Technology";
    const value = position.currentValue || 0;

    if (!sectorMap[sector]) {
      sectorMap[sector] = 0;
    }
    sectorMap[sector] += value;
  }

  const totalStockValue = Object.values(sectorMap).reduce(
    (sum: number, value: number) => sum + value,
    0,
  );

  return Object.entries(sectorMap)
    .map(([sector, value]) => ({
      sector,
      value,
      percentage: totalStockValue > 0 ? (value / totalStockValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}

// Helper function to calculate portfolio beta
async function calculatePortfolioBeta(positions: any[]): Promise<number> {
  // Calculate weighted average beta of all positions
  let totalValue = 0;
  let weightedBeta = 0;

  for (const position of positions) {
    const value = position.currentValue || 0;
    const beta = position.beta || 1.0; // Default beta of 1.0 for stocks

    totalValue += value;
    weightedBeta += beta * value;
  }

  return totalValue > 0 ? weightedBeta / totalValue : 1.0;
}

// Helper function to calculate diversification ratio
function calculateDiversificationRatio(positions: any[]): number {
  if (positions.length === 0) return 0;

  const totalValue = positions.reduce(
    (sum: number, pos: any) => sum + (pos.currentValue || 0),
    0,
  );

  if (totalValue === 0) return 0;

  // Calculate concentration (Herfindahl-Hirschman Index)
  const hhi = positions.reduce((sum: number, pos: any) => {
    const weight = (pos.currentValue || 0) / totalValue;
    return sum + weight * weight;
  }, 0);

  // Diversification ratio = 1 - HHI (higher is more diversified)
  return Math.max(0, Math.min(1, 1 - hhi));
}
