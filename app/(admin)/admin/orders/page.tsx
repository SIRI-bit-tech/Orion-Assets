import { AdminNavbar } from "@/components/admin/admin-navbar"
import { OrdersMonitor } from "@/components/admin/orders-monitor"

export default function AdminOrdersPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Order Monitoring</h1>
          <p className="text-muted-foreground mt-2">Monitor all trading orders across the platform</p>
        </div>

        <OrdersMonitor />
      </main>
    </div>
  )
}
