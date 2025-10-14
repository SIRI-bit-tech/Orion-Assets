"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatDateTime } from "@/lib/utils/format"
import { X } from "lucide-react"

interface Order {
  _id: string
  symbol: string
  orderType: string
  side: "BUY" | "SELL"
  quantity: number
  filledQuantity: number
  price?: number
  status: string
  placedAt: Date
}

const MOCK_ORDERS: Order[] = [
  {
    _id: "1",
    symbol: "AAPL",
    orderType: "LIMIT",
    side: "BUY",
    quantity: 10,
    filledQuantity: 0,
    price: 230.0,
    status: "OPEN",
    placedAt: new Date("2025-01-14T10:30:00"),
  },
  {
    _id: "2",
    symbol: "MSFT",
    orderType: "MARKET",
    side: "BUY",
    quantity: 5,
    filledQuantity: 5,
    status: "FILLED",
    placedAt: new Date("2025-01-14T09:15:00"),
  },
  {
    _id: "3",
    symbol: "GOOGL",
    orderType: "LIMIT",
    side: "SELL",
    quantity: 8,
    filledQuantity: 0,
    price: 205.0,
    status: "CANCELLED",
    placedAt: new Date("2025-01-13T14:20:00"),
  },
]

export function OrdersTable() {
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return

    try {
      const response = await fetch(`/api/trading/orders/${orderId}/cancel`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to cancel order")

      alert("Order cancelled successfully!")
    } catch (error) {
      alert("Failed to cancel order")
    }
  }

  const openOrders = MOCK_ORDERS.filter((o) => o.status === "OPEN" || o.status === "PARTIALLY_FILLED")
  const filledOrders = MOCK_ORDERS.filter((o) => o.status === "FILLED")
  const cancelledOrders = MOCK_ORDERS.filter((o) => o.status === "CANCELLED" || o.status === "REJECTED")

  const renderOrdersTable = (orders: Order[], showCancelButton = false) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Symbol</TableHead>
            <TableHead className="text-muted-foreground">Type</TableHead>
            <TableHead className="text-muted-foreground">Side</TableHead>
            <TableHead className="text-muted-foreground text-right">Quantity</TableHead>
            <TableHead className="text-muted-foreground text-right">Filled</TableHead>
            <TableHead className="text-muted-foreground text-right">Price</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Time</TableHead>
            {showCancelButton && <TableHead className="text-muted-foreground text-right">Action</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showCancelButton ? 9 : 8} className="text-center text-muted-foreground py-8">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order._id} className="border-border hover:bg-secondary/50">
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
                <TableCell className="text-right">{order.filledQuantity}</TableCell>
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
                {showCancelButton && (
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleCancelOrder(order._id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-bold mb-6">Orders</h2>

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
          <TabsTrigger value="open">Open ({openOrders.length})</TabsTrigger>
          <TabsTrigger value="filled">Filled ({filledOrders.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open">{renderOrdersTable(openOrders, true)}</TabsContent>
        <TabsContent value="filled">{renderOrdersTable(filledOrders)}</TabsContent>
        <TabsContent value="cancelled">{renderOrdersTable(cancelledOrders)}</TabsContent>
      </Tabs>
    </Card>
  )
}
