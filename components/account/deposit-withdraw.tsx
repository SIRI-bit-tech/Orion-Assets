"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils/format"
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react"

export function DepositWithdraw() {
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [depositMethod, setDepositMethod] = useState("bank_transfer")
  const [withdrawMethod, setWithdrawMethod] = useState("bank_transfer")
  const [isProcessing, setIsProcessing] = useState(false)

  const availableBalance = 50000

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      const response = await fetch("/api/account/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number.parseFloat(depositAmount),
          method: depositMethod,
        }),
      })

      if (!response.ok) throw new Error("Failed to process deposit")

      alert("Deposit request submitted successfully!")
      setDepositAmount("")
    } catch (error) {
      alert("Failed to process deposit")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()

    const amount = Number.parseFloat(withdrawAmount)
    if (amount > availableBalance) {
      alert("Insufficient balance")
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch("/api/account/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: withdrawMethod,
        }),
      })

      if (!response.ok) throw new Error("Failed to process withdrawal")

      alert("Withdrawal request submitted successfully!")
      setWithdrawAmount("")
    } catch (error) {
      alert("Failed to process withdrawal")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <h2 className="text-xl font-bold mb-6">Deposit & Withdraw</h2>

      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="deposit" className="flex items-center gap-2">
            <ArrowDownToLine className="h-4 w-4" />
            Deposit
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="flex items-center gap-2">
            <ArrowUpFromLine className="h-4 w-4" />
            Withdraw
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <form onSubmit={handleDeposit} className="space-y-6">
            <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
              <p className="text-sm text-success">Deposits are typically processed within 1-3 business days.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="depositMethod">Deposit Method</Label>
              <Select value={depositMethod} onValueChange={setDepositMethod}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="depositAmount">Amount (USD)</Label>
              <Input
                id="depositAmount"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                min="10"
                step="0.01"
                className="bg-secondary border-border"
                required
              />
              <p className="text-xs text-muted-foreground">Minimum deposit: $10.00</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Deposit Amount</span>
                <span className="font-medium">{formatCurrency(Number.parseFloat(depositAmount || "0"), "USD", 2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-medium">{formatCurrency(0, "USD", 2)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">
                  {formatCurrency(Number.parseFloat(depositAmount || "0"), "USD", 2)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
              disabled={isProcessing || !depositAmount}
            >
              {isProcessing ? "Processing..." : "Deposit Funds"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="withdraw">
          <form onSubmit={handleWithdraw} className="space-y-6">
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-400">Available Balance</span>
                <span className="text-lg font-bold text-blue-400">{formatCurrency(availableBalance, "USD", 2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawMethod">Withdrawal Method</Label>
              <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                <SelectTrigger className="bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawAmount">Amount (USD)</Label>
              <Input
                id="withdrawAmount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="0.00"
                min="10"
                step="0.01"
                max={availableBalance}
                className="bg-secondary border-border"
                required
              />
              <p className="text-xs text-muted-foreground">Minimum withdrawal: $10.00</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Withdrawal Amount</span>
                <span className="font-medium">
                  {formatCurrency(Number.parseFloat(withdrawAmount || "0"), "USD", 2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processing Fee</span>
                <span className="font-medium">{formatCurrency(5, "USD", 2)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between">
                <span className="font-semibold">You'll Receive</span>
                <span className="font-bold text-lg">
                  {formatCurrency(Math.max(0, Number.parseFloat(withdrawAmount || "0") - 5), "USD", 2)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={isProcessing || !withdrawAmount}
            >
              {isProcessing ? "Processing..." : "Withdraw Funds"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
