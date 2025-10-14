import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/client"

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const symbols = searchParams.get("symbols")?.split(",") || []

    if (symbols.length === 0) {
      return NextResponse.json({ error: "No symbols provided" }, { status: 400 })
    }

    // In production, fetch from real market data API (e.g., Alpha Vantage, IEX Cloud, Polygon.io)
    // For now, simulate real-time quotes
    const quotes = symbols.map((symbol) => ({
      symbol,
      price: 100 + Math.random() * 900,
      bid: 100 + Math.random() * 900,
      ask: 100 + Math.random() * 900,
      volume: Math.floor(Math.random() * 10000000),
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      high: 100 + Math.random() * 900,
      low: 100 + Math.random() * 900,
      open: 100 + Math.random() * 900,
      previousClose: 100 + Math.random() * 900,
      timestamp: new Date().toISOString(),
    }))

    return NextResponse.json({ quotes })
  } catch (error) {
    console.error("[v0] Error fetching market quotes:", error)
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 })
  }
}
