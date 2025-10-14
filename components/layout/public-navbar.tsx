"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export function PublicNavbar() {
  const router = useRouter()

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Logo size="md" />

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features">
              <Button variant="ghost" className="text-foreground hover:text-foreground">
                Features
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Contact
              </Button>
            </Link>
          </div>
        </div>

        {/* Right side - Auth Buttons */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/signin")}
          >
            Sign In
          </Button>
          <Button 
            onClick={() => router.push("/signup")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </nav>
  )
}
