import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const orders = await db.collection("orders").find({}).sort({ placedAt: -1 }).limit(100).toArray()

    return NextResponse.json({ orders })
  } catch (error) {
    console.error("[v0] Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
