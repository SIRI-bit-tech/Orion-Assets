"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatDateTime } from "@/lib/utils/format"
import { Search } from "lucide-react"

interface Order {
  _id: string
  userId: string
  userName: string
  symbol: string
  orderType: string
  side: "BUY" | "SELL"
  quantity: number
  price?: number
  status: string
  placedAt: Date
}

const MOCK_ORDERS: Order[] = [
  {
    _id: "1",
    userId: "user1",
    userName: "John Smith",
    symbol: "AAPL",
    orderType: "MARKET",
    side: "BUY",
    quantity: 100,
    status: "FILLED",
    placedAt: new Date("2025-01-14T10:30:00"),
  },
  {
    _id: "2",
    userId: "user2",
    userName: "Sarah Johnson",
    symbol: "TSLA",
    orderType: "LIMIT",
    side: "BUY",
    quantity: 50,
    price: 325.0,
    status: "OPEN",
    placedAt: new Date("2025-01-14T09:15:00"),
  },
  {
    _id: "3",
    userId: "user3",
    userName: "Michael Chen",
    symbol: "GOOGL",
    orderType: "MARKET",
    side: "SELL",
    quantity: 75,
    status: "FILLED",
    placedAt: new Date("2025-01-14T11:45:00"),
  },
]

export function OrdersMonitor() {
  const openOrders = MOCK_ORDERS.filter((o) => o.status === "OPEN" || o.status === "PARTIALLY_FILLED")
  const filledOrders = MOCK_ORDERS.filter((o) => o.status === "FILLED")
  const allOrders = MOCK_ORDERS

  const renderOrdersTable = (orders: Order[]) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">User</TableHead>
            <TableHead className="text-muted-foreground">Symbol</TableHead>
            <TableHead className="text-muted-foreground">Type</TableHead>
            <TableHead className="text-muted-foreground">Side</TableHead>
            <TableHead className="text-muted-foreground text-right">Quantity</TableHead>
            <TableHead className="text-muted-foreground text-right">Price</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order._id} className="border-border hover:bg-secondary/50">
                <TableCell className="font-medium">{order.userName}</TableCell>
                <TableCell className="font-bold">{order.symbol}</TableCell>
                <TableCell className="text-muted-foreground">{order.orderType}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      order.side === "BUY" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                    }`}
                  >
                    {order.side}
                  </span>
                </TableCell>
                <TableCell className="text-right">{order.quantity}</TableCell>
                <TableCell className="text-right">
                  {order.price ? formatCurrency(order.price, "USD", 2) : "Market"}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      order.status === "FILLED"
                        ? "bg-success/20 text-success"
                        : order.status === "OPEN"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {order.status}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{formatDateTime(order.placedAt)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Order Monitoring</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input type="text" placeholder="Search orders..." className="pl-9 bg-secondary border-border" />
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="all">All ({allOrders.length})</TabsTrigger>
          <TabsTrigger value="open">Open ({openOrders.length})</TabsTrigger>
          <TabsTrigger value="filled">Filled ({filledOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderOrdersTable(allOrders)}</TabsContent>
        <TabsContent value="open">{renderOrdersTable(openOrders)}</TabsContent>
        <TabsContent value="filled">{renderOrdersTable(filledOrders)}</TabsContent>
      </Tabs>
    </Card>
  )
}
