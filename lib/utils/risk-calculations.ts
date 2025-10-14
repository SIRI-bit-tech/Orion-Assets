export interface MarginRequirements {
  initialMargin: number
  maintenanceMargin: number
  usedMargin: number
  freeMargin: number
  marginLevel: number
  equity: number
}

export interface RiskMetrics {
  totalExposure: number
  maxDrawdown: number
  sharpeRatio: number
  winRate: number
  profitFactor: number
}

export function calculateMarginRequirements(
  positions: any[],
  accountBalance: number,
  leverage = 1,
): MarginRequirements {
  let usedMargin = 0
  let unrealizedPnL = 0

  for (const position of positions) {
    if (position.status === "OPEN") {
      // Calculate margin required for this position
      const positionValue = position.quantity * position.currentPrice
      const positionMargin = positionValue / (position.leverage || leverage)
      usedMargin += positionMargin

      // Add unrealized P&L
      unrealizedPnL += position.unrealizedPnL || 0
    }
  }

  const equity = accountBalance + unrealizedPnL
  const freeMargin = equity - usedMargin
  const marginLevel = usedMargin > 0 ? (equity / usedMargin) * 100 : Number.POSITIVE_INFINITY

  // Initial margin is typically 100% / leverage
  // Maintenance margin is typically 50% of initial margin
  const initialMargin = usedMargin
  const maintenanceMargin = usedMargin * 0.5

  return {
    initialMargin,
    maintenanceMargin,
    usedMargin,
    freeMargin,
    marginLevel,
    equity,
  }
}

export function shouldTriggerMarginCall(marginRequirements: MarginRequirements): boolean {
  // Trigger margin call when margin level falls below 120%
  return marginRequirements.marginLevel < 120
}

export function shouldLiquidate(marginRequirements: MarginRequirements): boolean {
  // Liquidate when margin level falls below 50%
  return marginRequirements.marginLevel < 50
}

export function calculatePositionRisk(position: any, accountEquity: number): number {
  const positionValue = position.quantity * position.currentPrice
  const riskPercentage = (positionValue / accountEquity) * 100
  return riskPercentage
}

export function calculateRiskMetrics(positions: any[], trades: any[]): RiskMetrics {
  let totalExposure = 0

  for (const position of positions) {
    if (position.status === "OPEN") {
      totalExposure += position.quantity * position.currentPrice
    }
  }

  // Calculate win rate
  const closedTrades = trades.filter((t: any) => t.realizedPnL !== undefined)
  const winningTrades = closedTrades.filter((t: any) => t.realizedPnL > 0)
  const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0

  // Calculate profit factor
  const totalProfit = winningTrades.reduce((sum: number, t: any) => sum + t.realizedPnL, 0)
  const losingTrades = closedTrades.filter((t: any) => t.realizedPnL < 0)
  const totalLoss = Math.abs(losingTrades.reduce((sum: number, t: any) => sum + t.realizedPnL, 0))
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Number.POSITIVE_INFINITY : 0

  // Calculate max drawdown (simplified)
  let maxDrawdown = 0
  let peak = 0
  let runningPnL = 0

  for (const trade of closedTrades) {
    runningPnL += trade.realizedPnL
    if (runningPnL > peak) {
      peak = runningPnL
    }
    const drawdown = peak - runningPnL
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  // Calculate Sharpe ratio (simplified)
  const returns = closedTrades.map((t: any) => t.realizedPnL)
  const avgReturn = returns.reduce((sum: number, r: number) => sum + r, 0) / returns.length || 0
  const variance = returns.reduce((sum: number, r: number) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length || 0
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0

  return {
    totalExposure,
    maxDrawdown,
    sharpeRatio,
    winRate,
    profitFactor,
  }
}

export function calculateMaxPositionSize(
  accountEquity: number,
  riskPercentage: number,
  stopLossDistance: number,
  price: number,
): number {
  // Calculate position size based on risk percentage
  const riskAmount = accountEquity * (riskPercentage / 100)
  const maxQuantity = riskAmount / (stopLossDistance * price)
  return Math.floor(maxQuantity)
}

export function validateLeverage(leverage: number, accountType: string): boolean {
  const maxLeverage: Record<string, number> = {
    STANDARD: 100,
    PROFESSIONAL: 500,
    INSTITUTIONAL: 1000,
  }

  return leverage <= (maxLeverage[accountType] || 100)
}
