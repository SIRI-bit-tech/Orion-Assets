import { inngest } from "../client"
import { connectToDatabase } from "@/lib/db/mongodb"
import { calculatePositionRisk } from "@/lib/utils/risk-calculations"

export const monitorPositions = inngest.createFunction(
  {
    id: "monitor-positions",
    name: "Monitor Open Positions",
  },
  { cron: "*/1 * * * *" }, // Run every minute
  async ({ step }) => {
    const positions = await step.run("fetch-positions", async () => {
      const db = await connectToDatabase()
      return await db.collection("positions").find({ status: "OPEN" }).toArray()
    })

    for (const position of positions) {
      await step.run(`check-position-${position._id}`, async () => {
        // Simulate price update (in production, fetch from market data API)
        const currentPrice = position.currentPrice * (1 + (Math.random() - 0.5) * 0.02)

        const unrealizedPnL =
          position.side === "LONG"
            ? (currentPrice - position.averagePrice) * position.quantity
            : (position.averagePrice - currentPrice) * position.quantity

        const db = await connectToDatabase()

        const account = await db.collection("accounts").findOne({ _id: position.accountId })
        const positionRisk = account
          ? calculatePositionRisk({ ...position, currentPrice }, account.equity || account.balance)
          : 0

        // Update position with current price and P&L
        await db.collection("positions").updateOne(
          { _id: position._id },
          {
            $set: {
              currentPrice,
              unrealizedPnL,
              riskPercentage: positionRisk,
              updatedAt: new Date(),
            },
          },
        )

        // Check stop loss
        if (position.stopLoss) {
          const shouldTriggerStopLoss =
            position.side === "LONG" ? currentPrice <= position.stopLoss : currentPrice >= position.stopLoss

          if (shouldTriggerStopLoss) {
            await inngest.send({
              name: "trading/position.close",
              data: {
                positionId: position._id,
                userId: position.userId,
                accountId: position.accountId,
                reason: "stop-loss",
                price: currentPrice,
              },
            })
          }
        }

        // Check take profit
        if (position.takeProfit) {
          const shouldTriggerTakeProfit =
            position.side === "LONG" ? currentPrice >= position.takeProfit : currentPrice <= position.takeProfit

          if (shouldTriggerTakeProfit) {
            await inngest.send({
              name: "trading/position.close",
              data: {
                positionId: position._id,
                userId: position.userId,
                accountId: position.accountId,
                reason: "take-profit",
                price: currentPrice,
              },
            })
          }
        }
      })
    }

    return { processedPositions: positions.length }
  },
)
