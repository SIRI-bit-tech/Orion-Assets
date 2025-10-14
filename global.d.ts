import type { ObjectId } from "mongodb"

declare global {
  // User types
  type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN"

  interface User {
    _id: ObjectId
    email: string
    fullName: string
    country: string
    investmentGoals?: string
    riskTolerance?: string
    preferredIndustry?: string
    role: UserRole
    emailVerified: boolean
    createdAt: Date
    updatedAt: Date
  }

  // Account types
  type AccountStatus = "ACTIVE" | "SUSPENDED" | "CLOSED" | "PENDING_VERIFICATION"

  interface TradingAccount {
    _id: ObjectId
    userId: ObjectId
    accountNumber: string
    accountType: "CASH" | "MARGIN"
    status: AccountStatus
    balance: number
    equity: number
    buyingPower: number
    marginUsed: number
    unrealizedPnL: number
    realizedPnL: number
    totalPnL: number
    currency: string
    leverage: number
    createdAt: Date
    updatedAt: Date
  }

  // Order types
  type OrderType = "MARKET" | "LIMIT" | "STOP" | "STOP_LIMIT"
  type OrderSide = "BUY" | "SELL"
  type OrderStatus = "PENDING" | "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED" | "REJECTED" | "EXPIRED"
  type TimeInForce = "GTC" | "DAY" | "IOC" | "FOK"

  interface Order {
    _id: ObjectId
    userId: ObjectId
    accountId: ObjectId
    symbol: string
    assetClass: string
    orderType: OrderType
    side: OrderSide
    quantity: number
    filledQuantity: number
    price?: number
    stopPrice?: number
    limitPrice?: number
    timeInForce: TimeInForce
    status: OrderStatus
    commission: number
    notes?: string
    placedAt: Date
    filledAt?: Date
    cancelledAt?: Date
    expiresAt?: Date
    createdAt: Date
    updatedAt: Date
  }

  // Position types
  type PositionSide = "LONG" | "SHORT"
  type PositionStatus = "OPEN" | "CLOSED"

  interface Position {
    _id: ObjectId
    userId: ObjectId
    accountId: ObjectId
    symbol: string
    assetClass: string
    side: PositionSide
    quantity: number
    averageEntryPrice: number
    currentPrice: number
    marketValue: number
    costBasis: number
    unrealizedPnL: number
    unrealizedPnLPercent: number
    realizedPnL: number
    totalPnL: number
    status: PositionStatus
    openedAt: Date
    closedAt?: Date
    createdAt: Date
    updatedAt: Date
  }

  // Trade types
  interface Trade {
    _id: ObjectId
    userId: ObjectId
    accountId: ObjectId
    orderId: ObjectId
    positionId?: ObjectId
    symbol: string
    assetClass: string
    side: OrderSide
    quantity: number
    price: number
    commission: number
    totalAmount: number
    executedAt: Date
    createdAt: Date
  }

  // Transaction types
  type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRADE" | "FEE" | "DIVIDEND" | "INTEREST" | "ADJUSTMENT"
  type TransactionStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED"

  interface Transaction {
    _id: ObjectId
    userId: ObjectId
    accountId: ObjectId
    type: TransactionType
    amount: number
    currency: string
    status: TransactionStatus
    description: string
    reference?: string
    metadata?: Record<string, any>
    processedAt?: Date
    createdAt: Date
    updatedAt: Date
  }

  // KYC types
  type KYCStatus = "NOT_STARTED" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "EXPIRED"
  type KYCVerificationLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED"

  interface KYCVerification {
    _id: ObjectId
    userId: ObjectId
    status: KYCStatus
    verificationLevel: KYCVerificationLevel
    documentType: string
    documentNumber: string
    documentFrontUrl?: string
    documentBackUrl?: string
    selfieUrl?: string
    addressProofUrl?: string
    dateOfBirth?: Date
    address?: {
      street: string
      city: string
      state: string
      postalCode: string
      country: string
    }
    rejectionReason?: string
    reviewedBy?: ObjectId
    reviewedAt?: Date
    expiresAt?: Date
    createdAt: Date
    updatedAt: Date
  }

  // Watchlist types
  interface WatchlistItem {
    _id: ObjectId
    userId: ObjectId
    symbol: string
    assetClass: string
    addedAt: Date
  }

  // Alert types
  type AlertType = "PRICE" | "VOLUME" | "PERCENTAGE_CHANGE" | "MARGIN_CALL" | "POSITION_CLOSED"
  type AlertCondition = "ABOVE" | "BELOW" | "CROSSES_ABOVE" | "CROSSES_BELOW"

  interface Alert {
    _id: ObjectId
    userId: ObjectId
    symbol: string
    alertType: AlertType
    condition: AlertCondition
    targetValue: number
    message: string
    isActive: boolean
    triggeredAt?: Date
    createdAt: Date
    updatedAt: Date
  }

  // Audit log types
  interface AuditLog {
    _id: ObjectId
    userId: ObjectId
    action: string
    resource: string
    resourceId?: string
    changes?: Record<string, any>
    ipAddress?: string
    userAgent?: string
    createdAt: Date
  }

  // Market data types
  interface MarketQuote {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
    volume: number
    marketCap?: number
    high: number
    low: number
    open: number
    previousClose: number
    timestamp: Date
  }

  interface NewsArticle {
    id: string
    title: string
    summary: string
    source: string
    url: string
    imageUrl?: string
    publishedAt: Date
    symbols?: string[]
  }
}
