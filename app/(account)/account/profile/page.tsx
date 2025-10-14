import { Navbar } from "@/components/layout/navbar"
import { ProfileForm } from "@/components/account/profile-form"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account information</p>
        </div>

        <div className="max-w-2xl">
          <ProfileForm />
        </div>
      </main>
    </div>
  )
}
