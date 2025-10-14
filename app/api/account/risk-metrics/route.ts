import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/client"
import { connectToDatabase } from "@/lib/db/mongodb"
import { calculateMarginRequirements, calculateRiskMetrics } from "@/lib/utils/risk-calculations"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectToDatabase()

    // Fetch user's account
    const account = await db.collection("accounts").findOne({ userId: session.user.id })

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 })
    }

    // Fetch open positions
    const positions = await db
      .collection("positions")
      .find({
        accountId: account._id,
        status: "OPEN",
      })
      .toArray()

    // Fetch all trades for risk metrics
    const trades = await db
      .collection("trades")
      .find({
        accountId: account._id,
      })
      .toArray()

    // Calculate margin requirements
    const marginRequirements = calculateMarginRequirements(positions, account.balance, account.leverage || 1)

    // Calculate risk metrics
    const riskMetrics = calculateRiskMetrics(positions, trades)

    return NextResponse.json({
      marginRequirements,
      riskMetrics,
      account: {
        balance: account.balance,
        equity: marginRequirements.equity,
        leverage: account.leverage || 1,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching risk metrics:", error)
    return NextResponse.json({ error: "Failed to fetch risk metrics" }, { status: 500 })
  }
}
