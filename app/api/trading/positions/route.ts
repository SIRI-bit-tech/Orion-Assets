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

    const positions = await db
      .collection("positions")
      .find({ userId: new ObjectId(userId), status: "OPEN" })
      .sort({ openedAt: -1 })
      .toArray()

    return NextResponse.json({ positions })
  } catch (error) {
    console.error("[v0] Error fetching positions:", error)
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 500 })
  }
}
