import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const db = await getDb()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const order = await db.collection("orders").findOne({
      _id: new ObjectId(params.orderId),
      userId: new ObjectId(userId),
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.status !== "OPEN" && order.status !== "PARTIALLY_FILLED") {
      return NextResponse.json({ error: "Order cannot be cancelled" }, { status: 400 })
    }

    await db.collection("orders").updateOne(
      { _id: new ObjectId(params.orderId) },
      {
        $set: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    // Create audit log
    await db.collection("audit_logs").insertOne({
      userId: new ObjectId(userId),
      action: "ORDER_CANCELLED",
      resource: "order",
      resourceId: params.orderId,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Order cancelled successfully" })
  } catch (error) {
    console.error("[v0] Error cancelling order:", error)
    return NextResponse.json({ error: "Failed to cancel order" }, { status: 500 })
  }
}
