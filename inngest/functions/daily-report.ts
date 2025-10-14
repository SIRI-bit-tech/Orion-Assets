import { inngest } from "../client"
import { connectToDatabase } from "@/lib/db/mongodb"

export const generateDailyReport = inngest.createFunction(
  {
    id: "generate-daily-report",
    name: "Generate Daily Trading Report",
  },
  { cron: "0 0 * * *" }, // Run daily at midnight
  async ({ step }) => {
    const report = await step.run("generate-report", async () => {
      const db = await connectToDatabase()
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get today's trades
      const trades = await db
        .collection("trades")
        .find({
          executedAt: { $gte: today },
        })
        .toArray()

      // Get active users
      const activeUsers = await db.collection("users").countDocuments({
        lastLoginAt: { $gte: today },
      })

      // Calculate metrics
      const totalVolume = trades.reduce((sum, trade) => sum + trade.quantity * trade.price, 0)
      const totalCommission = trades.reduce((sum, trade) => sum + trade.commission, 0)

      return {
        date: today,
        totalTrades: trades.length,
        totalVolume,
        totalCommission,
        activeUsers,
      }
    })

    // Store report
    await step.run("store-report", async () => {
      const db = await connectToDatabase()
      await db.collection("daily_reports").insertOne({
        ...report,
        createdAt: new Date(),
      })
    })

    // Send to admin
    await step.run("notify-admin", async () => {
      await inngest.send({
        name: "notification/daily.report",
        data: report,
      })
    })

    return report
  },
)
