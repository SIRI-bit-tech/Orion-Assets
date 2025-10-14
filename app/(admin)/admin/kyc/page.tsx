import { AdminNavbar } from "@/components/admin/admin-navbar"
import { KYCApprovals } from "@/components/admin/kyc-approvals"

export default function AdminKYCPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">KYC Approvals</h1>
          <p className="text-muted-foreground mt-2">Review and approve user verification applications</p>
        </div>

        <KYCApprovals />
      </main>
    </div>
  )
}
