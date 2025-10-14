import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    const midPrice = 233.16 // This would come from real market data
    const spread = 0.02

    const bids = Array.from({ length: 20 }, (_, i) => {
      const price = midPrice - spread / 2 - i * 0.01
      const quantity = Math.random() * 1000 + 100
      return {
        price,
        quantity,
        total: price * quantity,
      }
    })

    const asks = Array.from({ length: 20 }, (_, i) => {
      const price = midPrice + spread / 2 + i * 0.01
      const quantity = Math.random() * 1000 + 100
      return {
        price,
        quantity,
        total: price * quantity,
      }
    })

    return NextResponse.json({ bids, asks })
  } catch (error) {
    console.error("Error fetching order book:", error)
    return NextResponse.json({ error: "Failed to fetch order book" }, { status: 500 })
  }
}
