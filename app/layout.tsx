import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { WebSocketProvider } from "@/components/providers/websocket-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Orion Assets Broker - Professional Trading Platform",
  description:
    "Trade stocks, ETFs, crypto, forex, and commodities with real-time market data and advanced trading tools",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <WebSocketProvider>
          <Suspense fallback={null}>{children}</Suspense>
        </WebSocketProvider>
        <Analytics />
      </body>
    </html>
  )
}
