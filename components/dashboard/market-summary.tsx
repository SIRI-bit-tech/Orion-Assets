"use client"

import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TradingViewChart } from "./tradingview-chart"

export function MarketSummary() {
  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-bold mb-4">Market Summary</h2>

      <Tabs defaultValue="indices" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-5 mb-4">
          <TabsTrigger value="indices">Indices</TabsTrigger>
          <TabsTrigger value="stocks">Stocks</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="forex">Forex</TabsTrigger>
          <TabsTrigger value="bonds">Bonds</TabsTrigger>
        </TabsList>

        <TabsContent value="indices">
          <TradingViewChart symbol="SPX" height={350} />
        </TabsContent>

        <TabsContent value="stocks">
          <TradingViewChart symbol="AAPL" height={350} />
        </TabsContent>

        <TabsContent value="crypto">
          <TradingViewChart symbol="BTCUSD" height={350} />
        </TabsContent>

        <TabsContent value="forex">
          <TradingViewChart symbol="EURUSD" height={350} />
        </TabsContent>

        <TabsContent value="bonds">
          <TradingViewChart symbol="US10Y" height={350} />
        </TabsContent>
      </Tabs>
    </Card>
  )
}
