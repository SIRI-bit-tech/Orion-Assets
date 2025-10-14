"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface NewsArticle {
  id: string
  title: string
  source: string
  time: string
  imageUrl?: string
  url: string
}

const MOCK_NEWS: NewsArticle[] = [
  {
    id: "1",
    title: "Exclusive | Walmart's New Employee Perk Takes a Bite Out of Workers' Grocery Bills",
    source: "WSJ",
    time: "37 minutes ago",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-aoxzZY3jwdF7iCgl0HA4xFbQkqhujU.png",
    url: "#",
  },
  {
    id: "2",
    title: "Stock market today: Dow pops, S&P 500 and Nasdaq waver as Fed rate cut bets surge",
    source: "NBCQ",
    time: "38 minutes ago",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ph0PFLCxqH2fMwhQrTxb4kJ87Q9av8.png",
    url: "#",
  },
  {
    id: "3",
    title: "Ex-Kroger CEO must reveal 'embarrassing' details about his abrupt exit thanks to lawsuit involving Jewel",
    source: "GE",
    time: "1 hour ago",
    imageUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-7BWCtmqrtoCh5aEiiTO1cHkx1hHfXC.png",
    url: "#",
  },
]

export function FinancialNews() {
  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Today's Financial News</h2>
        <Button variant="ghost" size="sm" className="text-primary">
          View all
        </Button>
      </div>

      <Tabs defaultValue="top" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="top">Top stories</TabsTrigger>
          <TabsTrigger value="local">Local market</TabsTrigger>
          <TabsTrigger value="world">World markets</TabsTrigger>
        </TabsList>

        <TabsContent value="top" className="space-y-4">
          {MOCK_NEWS.map((article) => (
            <div
              key={article.id}
              className="flex gap-4 p-4 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
            >
              <div className="flex-1 space-y-2">
                <h3 className="font-medium leading-tight line-clamp-2">{article.title}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">{article.source}</span>
                  <span>•</span>
                  <span>{article.time}</span>
                </div>
              </div>
              {article.imageUrl && (
                <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={article.imageUrl || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </TabsContent>

        <TabsContent value="local" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">No local market news available</p>
        </TabsContent>

        <TabsContent value="world" className="space-y-4">
          <p className="text-center text-muted-foreground py-8">No world market news available</p>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
