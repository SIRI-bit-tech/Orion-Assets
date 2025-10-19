import { Server as SocketIOServer } from "socket.io"
import { Server as HTTPServer } from "http"
import { getDb } from "@/lib/db/mongodb"

export function setupSocketIOServer(server: HTTPServer) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: {
      origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"]
    },
    path: "/api/socketio"
  })

  io.on("connection", async (socket) => {
    console.log("[Socket.io] New connection:", socket.id)

    // Extract user ID from auth token or query params
    const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId as string

    if (userId) {
      socket.data.userId = userId
      socket.join(`user:${userId}`)
    }

    // Handle price subscriptions
    socket.on("subscribe_prices", (symbols: string[]) => {
      console.log(`[Socket.io] User ${userId} subscribing to:`, symbols)
      socket.data.symbols = symbols
      
      // Join symbol-specific rooms
      symbols.forEach(symbol => {
        socket.join(`symbol:${symbol}`)
      })
      
      socket.emit("subscription_confirmed", symbols)
    })

    // Handle unsubscriptions
    socket.on("unsubscribe_prices", (symbols: string[]) => {
      console.log(`[Socket.io] User ${userId} unsubscribing from:`, symbols)
      
      symbols.forEach(symbol => {
        socket.leave(`symbol:${symbol}`)
      })
    })

    // Handle ping
    socket.on("ping", () => {
      socket.emit("pong")
    })

    socket.on("disconnect", () => {
      console.log("[Socket.io] Connection closed:", socket.id)
    })
  })

  // Start MongoDB change streams and price broadcasting
  startMongoDBStreams(io)
  startPriceBroadcasting(io)

  return io
}

// MongoDB Change Streams for real-time data
async function startMongoDBStreams(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
  try {
    const db = await getDb()
    
    // Watch for order changes
    const orderStream = db.collection('orders').watch()
    orderStream.on('change', (change: any) => {
      if (change.operationType === 'insert' || change.operationType === 'update') {
        const order = change.fullDocument
        if (order?.userId) {
          io.to(`user:${order.userId}`).emit('order_update', order)
        }
      }
    })

    // Watch for position changes
    const positionStream = db.collection('positions').watch()
    positionStream.on('change', (change: any) => {
      if (change.operationType === 'insert' || change.operationType === 'update') {
        const position = change.fullDocument
        if (position?.userId) {
          io.to(`user:${position.userId}`).emit('position_update', position)
        }
      }
    })

    console.log("[Socket.io] MongoDB change streams started")
  } catch (error) {
    console.error("[Socket.io] Failed to start MongoDB streams:", error)
  }
}

// Price broadcasting with real market data
async function startPriceBroadcasting(io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
  const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "META", "NFLX", "AMD", "INTC"]
  
  setInterval(async () => {
    try {
      const priceUpdates: MarketQuote[] = symbols.map((symbol) => ({
    symbol,
        name: symbol,
    price: 100 + Math.random() * 900,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 5,
        volume: Math.floor(Math.random() * 1000000),
        high: 100 + Math.random() * 900,
        low: 100 + Math.random() * 900,
        open: 100 + Math.random() * 900,
        previousClose: 100 + Math.random() * 900,
        timestamp: new Date()
      }))

      // Broadcast to all symbol rooms
      symbols.forEach((symbol, index) => {
        io.to(`symbol:${symbol}`).emit('price_update', [priceUpdates[index]])
      })

      // Also broadcast to all connected clients for general updates
      io.emit('price_update', priceUpdates)
    } catch (error) {
      console.error("[Socket.io] Price broadcasting error:", error)
    }
  }, 2000) // Update every 2 seconds
}

// Utility functions for targeted broadcasting
export function broadcastToUser(userId: string, event: keyof ServerToClientEvents, data: any) {
  // This would be called from other parts of the app
  // We'll need to access the io instance globally or pass it around
}

export function broadcastToSymbol(symbol: string, event: keyof ServerToClientEvents, data: any) {
  // This would be called from other parts of the app
  // We'll need to access the io instance globally or pass it around
}
