import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminStats } from "@/components/admin/admin-stats"
import { OrdersMonitor } from "@/components/admin/orders-monitor"
import { KYCApprovals } from "@/components/admin/kyc-approvals"

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container mx-auto p-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Monitor and manage platform operations</p>
        </div>

        <AdminStats />

        <div className="grid grid-cols-1 gap-6">
          <OrdersMonitor />
          <KYCApprovals />
        </div>
      </main>
    </div>
  )
}
