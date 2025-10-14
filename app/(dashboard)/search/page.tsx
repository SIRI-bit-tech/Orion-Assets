import { Navbar } from "@/components/layout/navbar"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6">
        <Card className="p-8 bg-card border-border">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Search Markets</h1>
              <p className="text-muted-foreground">Search for stocks, ETFs, crypto, forex, and more</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by symbol or company name..."
                className="pl-10 h-12 text-lg bg-secondary border-border"
              />
            </div>

            <div className="text-center text-muted-foreground py-12">
              <p>Start typing to search for securities</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
