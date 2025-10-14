import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { kycId: string } }) {
  try {
    const db = await getDb()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { reason } = body

    await db.collection("kyc_verifications").updateOne(
      { _id: new ObjectId(params.kycId) },
      {
        $set: {
          status: "REJECTED",
          rejectionReason: reason,
          reviewedBy: new ObjectId(userId),
          reviewedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    )

    // Create audit log
    await db.collection("audit_logs").insertOne({
      userId: new ObjectId(userId),
      action: "KYC_REJECTED",
      resource: "kyc",
      resourceId: params.kycId,
      changes: { reason },
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "KYC rejected successfully" })
  } catch (error) {
    console.error("[v0] Error rejecting KYC:", error)
    return NextResponse.json({ error: "Failed to reject KYC" }, { status: 500 })
  }
}
