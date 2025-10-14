import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { positionId: string } }) {
  try {
    const db = await getDb()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const position = await db.collection("positions").findOne({
      _id: new ObjectId(params.positionId),
      userId: new ObjectId(userId),
    })

    if (!position) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 })
    }

    if (position.status !== "OPEN") {
      return NextResponse.json({ error: "Position is already closed" }, { status: 400 })
    }

    // Update position status
    await db.collection("positions").updateOne(
      { _id: new ObjectId(params.positionId) },
      {
        $set: {
          status: "CLOSED",
          closedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    // Update account balance with realized P&L
    await db.collection("accounts").updateOne(
      { _id: position.accountId },
      {
        $inc: {
          balance: position.unrealizedPnL,
          realizedPnL: position.unrealizedPnL,
        },
        $set: { updatedAt: new Date() },
      },
    )

    // Create audit log
    await db.collection("audit_logs").insertOne({
      userId: new ObjectId(userId),
      action: "POSITION_CLOSED",
      resource: "position",
      resourceId: params.positionId,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Position closed successfully" })
  } catch (error) {
    console.error("[v0] Error closing position:", error)
    return NextResponse.json({ error: "Failed to close position" }, { status: 500 })
  }
}
