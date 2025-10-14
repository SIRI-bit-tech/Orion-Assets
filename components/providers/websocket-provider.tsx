"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useWebSocket, type WebSocketMessage } from "@/lib/websocket/client"

type WebSocketContextType = {
  isConnected: boolean
  lastMessage: WebSocketMessage | null
  sendMessage: (message: WebSocketMessage) => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3000/api/ws"
  const { isConnected, lastMessage, sendMessage } = useWebSocket(wsUrl)

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>{children}</WebSocketContext.Provider>
  )
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext)
  if (!context) {
    throw new Error("useWebSocketContext must be used within WebSocketProvider")
  }
  return context
}
