import { Navbar } from "@/components/layout/navbar"
import { KYCVerification } from "@/components/account/kyc-verification"

export default function KYCPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">KYC Verification</h1>
          <p className="text-muted-foreground mt-2">Verify your identity to unlock full trading features</p>
        </div>

        <div className="max-w-2xl">
          <KYCVerification />
        </div>
      </main>
    </div>
  )
}
