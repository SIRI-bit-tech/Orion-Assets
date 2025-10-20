"use client"

import { useEffect, useMemo, useState } from "react"
import { Bell, CheckCircle2, CircleDot, Info, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSocket } from "@/lib/websocket/client"

// Types
export type NotificationItem = {
  id: string
  title?: string
  message: string
  type?: "success" | "error" | "info"
  timestamp: number
  read: boolean
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const STORAGE_KEY = "orion.notifications"

function loadStored(): NotificationItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as NotificationItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch (e) {
    return []
  }
}

function saveStored(items: NotificationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {}
}

function typeIcon(t?: "success" | "error" | "info") {
  switch (t) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    case "error":
      return <TriangleAlert className="h-4 w-4 text-red-500" />
    default:
      return <Info className="h-4 w-4 text-blue-500" />
  }
}

export function NotificationsBell() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<NotificationItem | null>(null)

  // Socket for real-time notifications (URL taken from env when available)
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || ""
  const { lastMessage } = useSocket(socketUrl)

  // Load from storage initially
  useEffect(() => {
    setItems(loadStored())
  }, [])

  // Persist on change
  useEffect(() => {
    saveStored(items)
  }, [items])

  // Handle incoming socket notification
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== "notification") return
    const data = lastMessage.data as { message: string; type?: "success" | "error" | "info" }
    const next: NotificationItem = {
      id: generateId(),
      title: data.type === "error" ? "Error" : data.type === "success" ? "Success" : "Notification",
      message: data.message || "",
      type: data.type || "info",
      timestamp: Date.now(),
      read: false,
    }
    setItems((prev) => [next, ...prev].slice(0, 50)) // keep last 50
  }, [lastMessage])

  const unreadCount = useMemo(() => items.filter((i) => !i.read).length, [items])

  const markAllRead = () => {
    if (unreadCount === 0) return
    setItems((prev) => prev.map((i) => ({ ...i, read: true })))
  }

  const openDetail = (item: NotificationItem) => {
    setDetail(item)
    // mark as read when opening
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, read: true } : i)))
  }

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts
    const s = Math.floor(diff / 1000)
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return `${d}d ago`
  }

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative text-muted-foreground">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                aria-label={`${unreadCount} unread`}
                className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white px-1 shadow ring-1 ring-white/60"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <DropdownMenuLabel className="px-0 py-0">Notifications</DropdownMenuLabel>
            <div className="text-xs text-muted-foreground">{unreadCount} unread</div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No notifications yet</div>
            ) : (
              items.map((n) => (
                <DropdownMenuItem key={n.id} className="px-3 py-2.5 gap-2 cursor-pointer" onClick={() => openDetail(n)}>
                  <div className="mt-0.5">{typeIcon(n.type)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium truncate">{n.title || "Notification"}</div>
                      <div className="text-[10px] text-muted-foreground ml-auto whitespace-nowrap">{timeAgo(n.timestamp)}</div>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{n.message}</div>
                  </div>
                  {!n.read && <CircleDot className="h-3.5 w-3.5 text-red-500" />}
                </DropdownMenuItem>
              ))
            )}
          </div>
          <DropdownMenuSeparator />
          <div className="flex items-center justify-between px-2 py-1.5">
            <Button variant="ghost" size="sm" className="text-xs" onClick={markAllRead} disabled={unreadCount === 0}>
              Mark all as read
            </Button>
            {/* Placeholder for future: View all page */}
            <Button asChild variant="link" size="sm" className="text-xs">
              <a href="#">View all</a>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {typeIcon(detail?.type)}
              <span>{detail?.title || "Notification"}</span>
            </DialogTitle>
            <DialogDescription>
              <div className="whitespace-pre-wrap text-foreground text-sm leading-6 mt-2">
                {detail?.message}
              </div>
              {detail && (
                <div className="text-muted-foreground text-xs mt-2">
                  Received: {new Date(detail.timestamp).toLocaleString()}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NotificationsBell
