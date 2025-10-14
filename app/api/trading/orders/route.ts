import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"
import { orderSchema } from "@/lib/utils/validation"

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const userId = request.headers.get("x-user-id") // From auth middleware

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await db
      .collection("orders")
      .find({ userId: new ObjectId(userId) })
      .sort({ placedAt: -1 })
      .limit(100)
      .toArray()

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("[v0] Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = orderSchema.parse(body)

    // Get user's account
    const account = await db.collection("accounts").findOne({ userId: new ObjectId(userId), status: "ACTIVE" })

    if (!account) {
      return NextResponse.json({ error: "No active trading account found" }, { status: 400 })
    }

    // Calculate order value
    const orderValue = validated.quantity * (validated.price || 0)

    // Check buying power for buy orders
    if (validated.side === "BUY" && orderValue > account.buyingPower) {
      return NextResponse.json({ error: "Insufficient buying power" }, { status: 400 })
    }

    // Create order
    const order = {
      userId: new ObjectId(userId),
      accountId: account._id,
      symbol: validated.symbol.toUpperCase(),
      assetClass: "STOCK",
      orderType: validated.orderType,
      side: validated.side,
      quantity: validated.quantity,
      filledQuantity: 0,
      price: validated.price,
      stopPrice: validated.stopPrice,
      limitPrice: validated.limitPrice,
      timeInForce: validated.timeInForce,
      status: "PENDING",
      commission: orderValue * 0.001, // 0.1% commission
      placedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("orders").insertOne(order)

    // Create audit log
    await db.collection("audit_logs").insertOne({
      userId: new ObjectId(userId),
      action: "ORDER_PLACED",
      resource: "order",
      resourceId: result.insertedId.toString(),
      changes: order,
      createdAt: new Date(),
    })

    return NextResponse.json({ order: { ...order, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
