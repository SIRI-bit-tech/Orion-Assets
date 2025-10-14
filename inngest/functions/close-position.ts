import { inngest } from "../client"
import { connectToDatabase } from "@/lib/db/mongodb"

export const closePosition = inngest.createFunction(
  {
    id: "close-position",
    name: "Close Position",
    retries: 3,
  },
  { event: "trading/position.close" },
  async ({ event, step }) => {
    const { positionId, userId, accountId, reason, price } = event.data

    await step.run("close-position", async () => {
      const db = await connectToDatabase()

      const position = await db.collection("positions").findOne({ _id: positionId })
      if (!position) {
        throw new Error("Position not found")
      }

      const realizedPnL =
        position.side === "LONG"
          ? (price - position.averagePrice) * position.quantity
          : (position.averagePrice - price) * position.quantity

      // Close position
      await db.collection("positions").updateOne(
        { _id: positionId },
        {
          $set: {
            status: "CLOSED",
            closedAt: new Date(),
            realizedPnL,
            closeReason: reason,
            updatedAt: new Date(),
          },
        },
      )

      // Update account balance
      await db.collection("accounts").updateOne(
        { _id: accountId },
        {
          $inc: {
            balance: realizedPnL,
          },
          $set: {
            updatedAt: new Date(),
          },
        },
      )

      // Send notification
      await inngest.send({
        name: "notification/position.closed",
        data: {
          userId,
          positionId,
          symbol: position.symbol,
          realizedPnL,
          reason,
        },
      })
    })

    return { success: true, positionId }
  },
)
