import { inngest } from "../client"
import { connectToDatabase } from "@/lib/db/mongodb"
import { calculateMarginRequirements, shouldTriggerMarginCall, shouldLiquidate } from "@/lib/utils/risk-calculations"

export const monitorMargin = inngest.createFunction(
  {
    id: "monitor-margin",
    name: "Monitor Account Margins",
  },
  { cron: "*/5 * * * *" }, // Run every 5 minutes
  async ({ step }) => {
    const accounts = await step.run("fetch-accounts", async () => {
      const db = await connectToDatabase()
      return await db.collection("accounts").find({ status: "ACTIVE" }).toArray()
    })

    for (const account of accounts) {
      await step.run(`check-margin-${account._id}`, async () => {
        const db = await connectToDatabase()

        // Fetch all open positions for this account
        const positions = await db
          .collection("positions")
          .find({
            accountId: account._id,
            status: "OPEN",
          })
          .toArray()

        if (positions.length === 0) {
          return { accountId: account._id, status: "no_positions" }
        }

        // Calculate margin requirements
        const marginReqs = calculateMarginRequirements(positions, account.balance, account.leverage || 1)

        // Update account with margin metrics
        await db.collection("accounts").updateOne(
          { _id: account._id },
          {
            $set: {
              equity: marginReqs.equity,
              usedMargin: marginReqs.usedMargin,
              freeMargin: marginReqs.freeMargin,
              marginLevel: marginReqs.marginLevel,
              updatedAt: new Date(),
            },
          },
        )

        // Check for liquidation
        if (shouldLiquidate(marginReqs)) {
          console.log(`[v0] Liquidation triggered for account ${account._id}`)

          // Close all positions
          for (const position of positions) {
            await inngest.send({
              name: "trading/position.close",
              data: {
                positionId: position._id,
                userId: account.userId,
                accountId: account._id,
                reason: "liquidation",
                price: position.currentPrice,
              },
            })
          }

          // Send liquidation notification
          await inngest.send({
            name: "notification/margin.liquidation",
            data: {
              userId: account.userId,
              accountId: account._id,
              marginLevel: marginReqs.marginLevel,
              equity: marginReqs.equity,
            },
          })

          return { accountId: account._id, status: "liquidated", marginLevel: marginReqs.marginLevel }
        }

        // Check for margin call
        if (shouldTriggerMarginCall(marginReqs)) {
          console.log(`[v0] Margin call triggered for account ${account._id}`)

          // Send margin call notification
          await inngest.send({
            name: "notification/margin.call",
            data: {
              userId: account.userId,
              accountId: account._id,
              marginLevel: marginReqs.marginLevel,
              equity: marginReqs.equity,
              requiredDeposit: marginReqs.maintenanceMargin - marginReqs.equity,
            },
          })

          return { accountId: account._id, status: "margin_call", marginLevel: marginReqs.marginLevel }
        }

        return { accountId: account._id, status: "healthy", marginLevel: marginReqs.marginLevel }
      })
    }

    return { processedAccounts: accounts.length }
  },
)
