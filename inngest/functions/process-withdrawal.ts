import { inngest } from "../client"
import { connectToDatabase } from "@/lib/db/mongodb"

export const processWithdrawal = inngest.createFunction(
  {
    id: "process-withdrawal",
    name: "Process Withdrawal Request",
    retries: 3,
  },
  { event: "account/withdrawal.requested" },
  async ({ event, step }) => {
    const { transactionId, userId, accountId, amount, method } = event.data

    // Step 1: Validate withdrawal
    await step.run("validate-withdrawal", async () => {
      const db = await connectToDatabase()

      const account = await db.collection("accounts").findOne({ _id: accountId })
      if (!account) {
        throw new Error("Account not found")
      }

      if (account.balance < amount) {
        await db.collection("transactions").updateOne(
          { _id: transactionId },
          {
            $set: {
              status: "REJECTED",
              rejectionReason: "Insufficient balance",
              updatedAt: new Date(),
            },
          },
        )
        throw new Error("Insufficient balance")
      }
    })

    // Step 2: Process payment (simulate)
    await step.sleep("process-payment", "30s") // Simulate payment processing delay

    // Step 3: Update transaction status
    await step.run("complete-withdrawal", async () => {
      const db = await connectToDatabase()

      await db.collection("transactions").updateOne(
        { _id: transactionId },
        {
          $set: {
            status: "COMPLETED",
            completedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      )

      // Deduct from account balance
      await db.collection("accounts").updateOne(
        { _id: accountId },
        {
          $inc: {
            balance: -amount,
          },
          $set: {
            updatedAt: new Date(),
          },
        },
      )
    })

    // Step 4: Send notification
    await step.run("send-notification", async () => {
      await inngest.send({
        name: "notification/withdrawal.completed",
        data: {
          userId,
          transactionId,
          amount,
          method,
        },
      })
    })

    return { success: true, transactionId }
  },
)
