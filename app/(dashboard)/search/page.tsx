"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import TradingViewWatchlist from "@/components/dashboard/tradingview-watchlist"
import TradingViewNews from "@/components/dashboard/tradingview-news"
import Link from "next/link"

export default function SearchPage() {
  const params = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState("")

  useEffect(() => {
    const q = params.get("q") || ""
    setQuery(q)
  }, [params])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const normalizedSymbol = (query || "").trim().toUpperCase()

  // Simple site-wide pages index for client-side search
  const sitePages = [
    { title: "Dashboard", path: "/dashboard", description: "Overview, charts, market overview, and positions", keywords: ["home", "overview", "market", "charts"] },
    { title: "Search", path: "/search", description: "Search markets and site content", keywords: ["find", "symbols", "lookup"] },
    { title: "Watchlist", path: "/watchlist", description: "Track your favorite securities in real time", keywords: ["favorites", "symbols", "tracking"] },
    { title: "News", path: "/news", description: "Financial news timeline and updates", keywords: ["timeline", "updates", "headlines"] },
    { title: "Account Profile", path: "/account/profile", description: "View and edit your profile", keywords: ["user", "name", "avatar", "profile"] },
    { title: "Account Settings", path: "/account/settings", description: "Preferences, notifications, security", keywords: ["preferences", "notifications", "password"] },
    { title: "KYC Verification", path: "/account/kyc", description: "Verify your identity to unlock features", keywords: ["verification", "identity", "compliance"] },
  ] as const

  const siteResults = (() => {
    const q = (query || "").toLowerCase().trim()
    if (!q) return [] as typeof sitePages
    return sitePages.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.path.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.keywords.some(k => k.includes(q))
    )
  })()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6 pb-24">
        <Card className="p-8 bg-card border-border">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Search Markets</h1>
              <p className="text-muted-foreground">Search for stocks, ETFs, crypto, forex, and more</p>
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search by symbol or company name..."
                className="pl-10 h-12 text-lg bg-secondary border-border"
              />
            </form>

            {!normalizedSymbol ? (
              <div className="text-center text-muted-foreground py-12">
                <p>Start typing to search for securities</p>
              </div>
            ) : (
              <div className="space-y-10">
                {/* Site-wide results */}
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold">Site results</h2>
                  {siteResults.length === 0 ? (
                    <p className="text-muted-foreground">No matching pages. Try a different keyword.</p>
                  ) : (
                    <ul className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                      {siteResults.map((p) => (
                        <li key={p.path} className="bg-card/50 hover:bg-accent/30 transition-colors">
                          <Link href={p.path} className="block p-4">
                            <div className="font-medium">{p.title}</div>
                            <div className="text-sm text-muted-foreground">{p.description}</div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Market results */}
                <div className="space-y-4">
                  <div className="text-center">
                    <p>
                      Market results for: <span className="font-medium text-foreground">{normalizedSymbol}</span>
                    </p>
                  </div>
                  <TradingViewWatchlist symbols={[normalizedSymbol]} height={420} />
                  <TradingViewNews feedMode="symbol" symbols={[normalizedSymbol]} height={520} />
                </div>
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  )
}
