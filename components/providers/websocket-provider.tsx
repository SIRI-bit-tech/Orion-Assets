"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useSocket, type SocketMessage } from "@/lib/websocket/client"

type SocketContextType = {
  isConnected: boolean
  lastMessage: SocketMessage | null
  sendMessage: (event: keyof ClientToServerEvents, data?: any) => void
  subscribeToPrices: (symbols: string[]) => void
  unsubscribeFromPrices: (symbols: string[]) => void
  ping: () => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"
  const { 
    isConnected, 
    lastMessage, 
    sendMessage, 
    subscribeToPrices, 
    unsubscribeFromPrices, 
    ping 
  } = useSocket(socketUrl)

  return (
    <SocketContext.Provider value={{ 
      isConnected, 
      lastMessage, 
      sendMessage, 
      subscribeToPrices, 
      unsubscribeFromPrices, 
      ping 
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider")
  }
  return context
}

// Keep the old name for backward compatibility
export const WebSocketProvider = SocketProvider
export const useWebSocketContext = useSocketContext
