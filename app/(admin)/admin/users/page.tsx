import { AdminNavbar } from "@/components/admin/admin-navbar"
import { UsersTable } from "@/components/admin/users-table"

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-2">View and manage all platform users</p>
        </div>

        <UsersTable />
      </main>
    </div>
  )
}
