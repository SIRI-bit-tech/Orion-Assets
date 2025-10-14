import type React from "react"
import { PublicNavbar } from "@/components/layout/public-navbar"

export default function RootGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PublicNavbar />
      {children}
    </>
  )
}
