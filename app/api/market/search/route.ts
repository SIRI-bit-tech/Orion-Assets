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
    const query = searchParams.get("q") || ""

    if (query.length < 1) {
      return NextResponse.json({ results: [] })
    }

    // In production, fetch from real market data API
    // For now, return mock data for common symbols
    const allSymbols = [
      { symbol: "AAPL", name: "Apple Inc.", exchange: "NASDAQ", type: "Stock" },
      { symbol: "GOOGL", name: "Alphabet Inc.", exchange: "NASDAQ", type: "Stock" },
      { symbol: "MSFT", name: "Microsoft Corporation", exchange: "NASDAQ", type: "Stock" },
      { symbol: "AMZN", name: "Amazon.com Inc.", exchange: "NASDAQ", type: "Stock" },
      { symbol: "TSLA", name: "Tesla Inc.", exchange: "NASDAQ", type: "Stock" },
      { symbol: "NVDA", name: "NVIDIA Corporation", exchange: "NASDAQ", type: "Stock" },
      { symbol: "META", name: "Meta Platforms Inc.", exchange: "NASDAQ", type: "Stock" },
      { symbol: "NFLX", name: "Netflix Inc.", exchange: "NASDAQ", type: "Stock" },
      { symbol: "JPM", name: "JPMorgan Chase & Co.", exchange: "NYSE", type: "Stock" },
      { symbol: "V", name: "Visa Inc.", exchange: "NYSE", type: "Stock" },
      { symbol: "WMT", name: "Walmart Inc.", exchange: "NYSE", type: "Stock" },
      { symbol: "DIS", name: "The Walt Disney Company", exchange: "NYSE", type: "Stock" },
      { symbol: "EURUSD", name: "Euro / US Dollar", exchange: "FOREX", type: "Forex" },
      { symbol: "GBPUSD", name: "British Pound / US Dollar", exchange: "FOREX", type: "Forex" },
      { symbol: "USDJPY", name: "US Dollar / Japanese Yen", exchange: "FOREX", type: "Forex" },
      { symbol: "BTCUSD", name: "Bitcoin / US Dollar", exchange: "CRYPTO", type: "Crypto" },
      { symbol: "ETHUSD", name: "Ethereum / US Dollar", exchange: "CRYPTO", type: "Crypto" },
    ]

    const results = allSymbols.filter(
      (s) => s.symbol.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase()),
    )

    return NextResponse.json({ results: results.slice(0, 10) })
  } catch (error) {
    console.error("[v0] Error searching symbols:", error)
    return NextResponse.json({ error: "Failed to search symbols" }, { status: 500 })
  }
}
