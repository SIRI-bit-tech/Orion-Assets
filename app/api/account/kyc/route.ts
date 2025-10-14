import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const db = await getDb()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const kyc = await db.collection("kyc_verifications").findOne({ userId: new ObjectId(userId) })

    return NextResponse.json({ kyc })
  } catch (error) {
    console.error("[v0] Error fetching KYC:", error)
    return NextResponse.json({ error: "Failed to fetch KYC" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const kyc = {
      userId: new ObjectId(userId),
      status: "PENDING",
      verificationLevel: "BASIC",
      documentType: body.documentType,
      documentNumber: body.documentNumber,
      dateOfBirth: new Date(body.dateOfBirth),
      address: {
        street: body.street,
        city: body.city,
        state: body.state,
        postalCode: body.postalCode,
        country: body.country,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("kyc_verifications").insertOne(kyc)

    // Create audit log
    await db.collection("audit_logs").insertOne({
      userId: new ObjectId(userId),
      action: "KYC_SUBMITTED",
      resource: "kyc",
      resourceId: result.insertedId.toString(),
      createdAt: new Date(),
    })

    return NextResponse.json({ kyc: { ...kyc, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error submitting KYC:", error)
    return NextResponse.json({ error: "Failed to submit KYC" }, { status: 500 })
  }
}
