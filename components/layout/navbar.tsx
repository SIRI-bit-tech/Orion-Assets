"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { signOut, useSession } from "@/lib/auth/client"
import { Search, Home, Star, Newspaper, User2 } from "lucide-react"
import { Logo } from "@/components/ui/logo"
import NotificationsBell from "@/components/notifications/notifications-bell"

export function Navbar() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const [query, setQuery] = useState("")

  const handleSignOut = async () => {
    await signOut()
    router.push("/signin")
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`)
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Left: Logo + Desktop Nav */}
          <div className="flex items-center gap-4 md:gap-8">
            <Logo size="md" />

            {/* Navigation Links (Desktop) */}
            <div className="hidden md:flex items-center gap-2 lg:gap-6">
              <Button asChild variant="ghost" className="text-foreground hover:text-foreground"><a href="/dashboard">Dashboard</a></Button>
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground"><a href="/search">Search</a></Button>
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground"><a href="/watchlist">Watchlist</a></Button>
              <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground"><a href="/news">News</a></Button>
            </div>
          </div>

          {/* Right: Search (desktop), Notifications, Profile */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Desktop search input */}
            <form onSubmit={handleSearchSubmit} className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search symbols, companies..."
                  className="pl-9 w-64 lg:w-80"
                />
              </div>
            </form>

            {/* Mobile: search icon navigates to search page */}
            <Button asChild variant="ghost" size="icon" className="md:hidden text-muted-foreground">
              <a href="/search" aria-label="Search">
                <Search className="h-5 w-5" />
              </a>
            </Button>

            {/* Notifications dropdown */}
            <NotificationsBell />

            {/* Account dropdown hidden on mobile */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {isPending ? "..." : session?.user?.name ? getInitials(session.user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block text-sm font-medium">
                      {isPending ? "Loading..." : session?.user?.name || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/account/profile")}>Account</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/account/settings")}>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">Log Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom navbar (glassmorphic) */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 w-full px-3 pb-[env(safe-area-inset-bottom)] overflow-x-hidden">
        <div className="mx-auto flex w-full items-center justify-between rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-lg shadow-black/10 px-2 py-1.5 text-[11px] text-foreground dark:border-white/10 dark:bg-black/20">
          <Button asChild variant="ghost" className="flex-1 min-w-0 px-1 flex flex-col items-center gap-1 py-2 shrink">
            <a href="/dashboard" aria-label="Home">
              <Home className="h-5 w-5 shrink-0" />
              <span className="truncate">Home</span>
            </a>
          </Button>
          <Button asChild variant="ghost" className="flex-1 min-w-0 px-1 flex flex-col items-center gap-1 py-2 shrink">
            <a href="/watchlist" aria-label="Watchlist">
              <Star className="h-5 w-5 shrink-0" />
              <span className="truncate">Watchlist</span>
            </a>
          </Button>
          <Button asChild variant="ghost" className="flex-1 min-w-0 px-1 flex flex-col items-center gap-1 py-2 shrink">
            <a href="/news" aria-label="News">
              <Newspaper className="h-5 w-5 shrink-0" />
              <span className="truncate">News</span>
            </a>
          </Button>
          <Button asChild variant="ghost" className="flex-1 min-w-0 px-1 flex flex-col items-center gap-1 py-2 shrink">
            <a href="/account/profile" aria-label="Account">
              <User2 className="h-5 w-5 shrink-0" />
              <span className="truncate">Account</span>
            </a>
          </Button>
        </div>
      </div>
    </>
  )
}
