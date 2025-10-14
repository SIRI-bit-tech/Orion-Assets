import { Navbar } from "@/components/layout/navbar"
import { DepositWithdraw } from "@/components/account/deposit-withdraw"
import { TransactionHistory } from "@/components/account/transaction-history"

export default function FundsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Manage Funds</h1>
          <p className="text-muted-foreground mt-2">Deposit, withdraw, and view transaction history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DepositWithdraw />
          <TransactionHistory />
        </div>
      </main>
    </div>
  )
}
