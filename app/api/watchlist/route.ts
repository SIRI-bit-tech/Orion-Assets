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

    const watchlist = await db
      .collection("watchlist")
      .find({ userId: new ObjectId(userId) })
      .sort({ addedAt: -1 })
      .toArray()

    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error("[v0] Error fetching watchlist:", error)
    return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 })
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
    const { symbol, assetClass } = body

    // Check if already in watchlist
    const existing = await db.collection("watchlist").findOne({
      userId: new ObjectId(userId),
      symbol: symbol.toUpperCase(),
    })

    if (existing) {
      return NextResponse.json({ error: "Symbol already in watchlist" }, { status: 400 })
    }

    const item = {
      userId: new ObjectId(userId),
      symbol: symbol.toUpperCase(),
      assetClass: assetClass || "STOCK",
      addedAt: new Date(),
    }

    const result = await db.collection("watchlist").insertOne(item)

    return NextResponse.json({ item: { ...item, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error adding to watchlist:", error)
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const db = await getDb()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    await db.collection("watchlist").deleteOne({
      userId: new ObjectId(userId),
      symbol: symbol.toUpperCase(),
    })

    return NextResponse.json({ message: "Removed from watchlist" })
  } catch (error) {
    console.error("[v0] Error removing from watchlist:", error)
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 })
  }
}
