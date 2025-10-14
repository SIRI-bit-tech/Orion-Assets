"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatPercent, formatCompactNumber } from "@/lib/utils/format"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Stock {
  company: string
  symbol: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  peRatio: number
}

const MOCK_STOCKS: Stock[] = [
  {
    company: "Apple Inc",
    symbol: "AAPL",
    price: 233.16,
    change: 3.54,
    changePercent: 1.54,
    marketCap: 3.56e12,
    peRatio: 35.5,
  },
  {
    company: "Microsoft Corp",
    symbol: "MSFT",
    price: 520.42,
    change: -1.24,
    changePercent: -0.24,
    marketCap: 3.75e12,
    peRatio: 32.5,
  },
  {
    company: "Alphabet Inc",
    symbol: "GOOGL",
    price: 201.56,
    change: 5.32,
    changePercent: 2.65,
    marketCap: 2.62e12,
    peRatio: 21.5,
  },
  {
    company: "Amazon.com Inc",
    symbol: "AMZN",
    price: 244.16,
    change: -3.28,
    changePercent: -1.33,
    marketCap: 1.45e12,
    peRatio: 33.5,
  },
  {
    company: "Tesla Inc",
    symbol: "TSLA",
    price: 330.02,
    change: 11.45,
    changePercent: 3.59,
    marketCap: 1.66e12,
    peRatio: 161.2,
  },
  {
    company: "Meta Platforms Inc",
    symbol: "META",
    price: 762.96,
    change: -19.42,
    changePercent: -2.48,
    marketCap: 2.63e12,
    peRatio: 45.8,
  },
  {
    company: "NVIDIA Corp",
    symbol: "NVDA",
    price: 181.46,
    change: 4.19,
    changePercent: 2.36,
    marketCap: 1.36e12,
    peRatio: 16.8,
  },
  {
    company: "Netflix Inc",
    symbol: "NFLX",
    price: 1914.45,
    change: -78.23,
    changePercent: -3.93,
    marketCap: 4.74e11,
    peRatio: 48.9,
  },
]

export function TopStocksTable() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Today's Top Stocks</h2>
        <Button variant="ghost" size="sm" className="text-primary">
          View all
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Symbol</TableHead>
              <TableHead className="text-muted-foreground text-right">Price</TableHead>
              <TableHead className="text-muted-foreground text-right">Change</TableHead>
              <TableHead className="text-muted-foreground text-right">Market Cap</TableHead>
              <TableHead className="text-muted-foreground text-right">P/E Ratio</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_STOCKS.map((stock) => (
              <TableRow key={stock.symbol} className="border-border hover:bg-secondary/50 cursor-pointer">
                <TableCell className="font-medium">{stock.company}</TableCell>
                <TableCell className="text-muted-foreground">{stock.symbol}</TableCell>
                <TableCell className="text-right">{formatCurrency(stock.price, "USD", 2)}</TableCell>
                <TableCell className={`text-right ${stock.change >= 0 ? "text-success" : "text-destructive"}`}>
                  {stock.change >= 0 ? "+" : ""}
                  {formatPercent(stock.changePercent)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCompactNumber(stock.marketCap)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">{stock.peRatio}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
