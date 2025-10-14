import { WebSocketServer, WebSocket } from "ws"

const clients = new Map<string, Set<WebSocket>>()

export function setupWebSocketServer(server: any) {
  const wss = new WebSocketServer({ server, path: "/api/ws" })

  wss.on("connection", (ws: WebSocket, req) => {
    console.log("[v0] New WebSocket connection")

    // Extract user ID from query params or auth token
    const url = new URL(req.url!, `http://${req.headers.host}`)
    const userId = url.searchParams.get("userId")

    if (userId) {
      if (!clients.has(userId)) {
        clients.set(userId, new Set())
      }
      clients.get(userId)!.add(ws)
    }

    ws.on("message", async (message: string) => {
      try {
        const data = JSON.parse(message.toString())

        // Handle different message types
        switch (data.type) {
          case "subscribe_prices":
            // Subscribe to price updates for specific symbols
            handlePriceSubscription(ws, data.symbols)
            break
          case "ping":
            ws.send(JSON.stringify({ type: "pong" }))
            break
        }
      } catch (error) {
        console.error("[v0] WebSocket message error:", error)
      }
    })

    ws.on("close", () => {
      console.log("[v0] WebSocket connection closed")
      if (userId) {
        clients.get(userId)?.delete(ws)
        if (clients.get(userId)?.size === 0) {
          clients.delete(userId)
        }
      }
    })
  })

  // Broadcast price updates every 2 seconds
  setInterval(() => {
    broadcastPriceUpdates()
  }, 2000)

  return wss
}

function handlePriceSubscription(ws: WebSocket, symbols: string[]) {
  // Store subscription info (in production, use Redis)
  ws.send(
    JSON.stringify({
      type: "subscription_confirmed",
      symbols,
    }),
  )
}

async function broadcastPriceUpdates() {
  // Simulate price updates (in production, fetch from market data API)
  const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA"]

  const priceUpdates = symbols.map((symbol) => ({
    symbol,
    price: 100 + Math.random() * 900,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
    timestamp: new Date().toISOString(),
  }))

  const message = JSON.stringify({
    type: "price_update",
    data: priceUpdates,
  })

  // Broadcast to all connected clients
  clients.forEach((userClients) => {
    userClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message)
      }
    })
  })
}

export function broadcastToUser(userId: string, message: any) {
  const userClients = clients.get(userId)
  if (userClients) {
    const messageStr = JSON.stringify(message)
    userClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr)
      }
    })
  }
}
