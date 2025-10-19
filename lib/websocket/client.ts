"use client"

import { useEffect, useRef, useState } from "react"
import { io, Socket } from "socket.io-client"

export type SocketMessage = {
  type: "price_update" | "order_update" | "position_update" | "notification"
  data: any
}

export function useSocket(url: string, userId?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null)
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)

  useEffect(() => {
    function connect() {
      const socket = io(url, {
        path: '/api/socketio',
        auth: {
          userId: userId
        },
        transports: ['websocket', 'polling']
      })

      socket.on("connect", () => {
        console.log("[Socket.io] Connected:", socket.id)
        setIsConnected(true)
      })

      socket.on("disconnect", () => {
        console.log("[Socket.io] Disconnected")
        setIsConnected(false)
      })

      socket.on("connect_error", (error) => {
        console.error("[Socket.io] Connection error:", error)
        setIsConnected(false)
      })

      // Handle different message types
      socket.on("price_update", (data: MarketQuote[]) => {
        setLastMessage({ type: "price_update", data })
      })

      socket.on("order_update", (data: Order) => {
        setLastMessage({ type: "order_update", data })
      })

      socket.on("position_update", (data: Position) => {
        setLastMessage({ type: "position_update", data })
      })

      socket.on("notification", (data: { message: string; type: 'success' | 'error' | 'info' }) => {
        setLastMessage({ type: "notification", data })
      })

      socket.on("subscription_confirmed", (symbols: string[]) => {
        console.log("[Socket.io] Subscribed to symbols:", symbols)
      })

      socket.on("pong", () => {
        console.log("[Socket.io] Pong received")
      })

      socketRef.current = socket
    }

    connect()

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [url, userId])

  const sendMessage = (event: keyof ClientToServerEvents, data?: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data)
    }
  }

  const subscribeToPrices = (symbols: string[]) => {
    sendMessage("subscribe_prices", symbols)
  }

  const unsubscribeFromPrices = (symbols: string[]) => {
    sendMessage("unsubscribe_prices", symbols)
  }

  const ping = () => {
    sendMessage("ping")
  }

  return { 
    isConnected, 
    lastMessage, 
    sendMessage, 
    subscribeToPrices, 
    unsubscribeFromPrices, 
    ping 
  }
}
