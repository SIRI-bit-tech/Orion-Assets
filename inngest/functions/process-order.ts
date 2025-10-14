import { inngest } from "../client"
import { connectToDatabase } from "@/lib/db/mongodb"
import { ORDER_STATUS } from "@/lib/constants/trading"

export const processOrder = inngest.createFunction(
  {
    id: "process-order",
    name: "Process Order Execution",
    retries: 3,
  },
  { event: "trading/order.created" },
  async ({ event, step }) => {
    const { orderId, userId, accountId } = event.data

    // Step 1: Validate order
    const order = await step.run("validate-order", async () => {
      const db = await connectToDatabase()
      const orderDoc = await db.collection("orders").findOne({ _id: orderId })

      if (!orderDoc) {
        throw new Error("Order not found")
      }

      return orderDoc
    })

    // Step 2: Check account balance and margin
    await step.run("check-margin", async () => {
      const db = await connectToDatabase()
      const account = await db.collection("accounts").findOne({ _id: accountId })

      if (!account) {
        throw new Error("Account not found")
      }

      const requiredMargin = order.quantity * order.price * (order.leverage || 1)

      if (account.balance < requiredMargin) {
        await db.collection("orders").updateOne(
          { _id: orderId },
          {
            $set: {
              status: ORDER_STATUS.REJECTED,
              rejectionReason: "Insufficient margin",
              updatedAt: new Date(),
            },
          },
        )
        throw new Error("Insufficient margin")
      }
    })

    // Step 3: Execute order (simulate market execution)
    const execution = await step.run("execute-order", async () => {
      const db = await connectToDatabase()

      // Simulate order execution with market price
      const executionPrice = order.type === "MARKET" ? order.price : order.limitPrice
      const executionTime = new Date()

      // Update order status
      await db.collection("orders").updateOne(
        { _id: orderId },
        {
          $set: {
            status: ORDER_STATUS.FILLED,
            filledQuantity: order.quantity,
            averagePrice: executionPrice,
            filledAt: executionTime,
            updatedAt: executionTime,
          },
        },
      )

      return { executionPrice, executionTime }
    })

    // Step 4: Create position or update existing
    await step.run("create-position", async () => {
      const db = await connectToDatabase()

      const existingPosition = await db.collection("positions").findOne({
        userId,
        accountId,
        symbol: order.symbol,
        status: "OPEN",
      })

      if (existingPosition) {
        // Update existing position
        const newQuantity =
          order.side === "BUY" ? existingPosition.quantity + order.quantity : existingPosition.quantity - order.quantity

        if (newQuantity === 0) {
          // Close position
          await db.collection("positions").updateOne(
            { _id: existingPosition._id },
            {
              $set: {
                status: "CLOSED",
                closedAt: execution.executionTime,
                realizedPnL: existingPosition.unrealizedPnL,
                updatedAt: execution.executionTime,
              },
            },
          )
        } else {
          // Update position
          const newAveragePrice =
            (existingPosition.averagePrice * existingPosition.quantity + execution.executionPrice * order.quantity) /
            (existingPosition.quantity + order.quantity)

          await db.collection("positions").updateOne(
            { _id: existingPosition._id },
            {
              $set: {
                quantity: newQuantity,
                averagePrice: newAveragePrice,
                updatedAt: execution.executionTime,
              },
            },
          )
        }
      } else {
        // Create new position
        await db.collection("positions").insertOne({
          userId,
          accountId,
          symbol: order.symbol,
          side: order.side,
          quantity: order.quantity,
          averagePrice: execution.executionPrice,
          currentPrice: execution.executionPrice,
          unrealizedPnL: 0,
          realizedPnL: 0,
          status: "OPEN",
          leverage: order.leverage || 1,
          stopLoss: order.stopLoss,
          takeProfit: order.takeProfit,
          openedAt: execution.executionTime,
          createdAt: execution.executionTime,
          updatedAt: execution.executionTime,
        })
      }
    })

    // Step 5: Create trade record
    await step.run("create-trade", async () => {
      const db = await connectToDatabase()

      await db.collection("trades").insertOne({
        userId,
        accountId,
        orderId,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: execution.executionPrice,
        commission: order.quantity * execution.executionPrice * 0.001, // 0.1% commission
        executedAt: execution.executionTime,
        createdAt: execution.executionTime,
      })
    })

    // Step 6: Update account balance
    await step.run("update-account", async () => {
      const db = await connectToDatabase()

      const tradeValue = order.quantity * execution.executionPrice
      const commission = tradeValue * 0.001

      await db.collection("accounts").updateOne(
        { _id: accountId },
        {
          $inc: {
            balance: order.side === "BUY" ? -(tradeValue + commission) : tradeValue - commission,
          },
          $set: {
            updatedAt: execution.executionTime,
          },
        },
      )
    })

    // Step 7: Send notification
    await step.run("send-notification", async () => {
      await inngest.send({
        name: "notification/order.filled",
        data: {
          userId,
          orderId,
          symbol: order.symbol,
          side: order.side,
          quantity: order.quantity,
          price: execution.executionPrice,
        },
      })
    })

    return { success: true, orderId, executionPrice: execution.executionPrice }
  },
)
