"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { ArrowRightLeft } from "lucide-react"

export function InternalTransfer() {
  const [fromAccount, setFromAccount] = useState("")
  const [toAccount, setToAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/account/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromAccount,
          toAccount,
          amount: Number.parseFloat(amount),
        }),
      })

      if (!response.ok) throw new Error("Transfer failed")

      alert("Transfer completed successfully!")
      setAmount("")
    } catch (error) {
      alert("Failed to complete transfer")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center gap-2 mb-6">
        <ArrowRightLeft className="w-5 h-5" />
        <h2 className="text-xl font-bold">Internal Transfer</h2>
      </div>

      <form onSubmit={handleTransfer} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fromAccount">From Account</Label>
          <Select value={fromAccount} onValueChange={setFromAccount}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select source account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trading">Trading Account</SelectItem>
              <SelectItem value="savings">Savings Account</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="toAccount">To Account</Label>
          <Select value={toAccount} onValueChange={setToAccount}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select destination account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trading">Trading Account</SelectItem>
              <SelectItem value="savings">Savings Account</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="0"
            step="0.01"
            className="bg-secondary border-border"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || !fromAccount || !toAccount || !amount}>
          {isSubmitting ? "Processing..." : "Transfer Funds"}
        </Button>
      </form>
    </Card>
  )
}
