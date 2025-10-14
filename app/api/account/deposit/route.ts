import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db/mongodb"
import { ObjectId } from "mongodb"
import { depositSchema } from "@/lib/utils/validation"

export async function POST(request: NextRequest) {
  try {
    const db = await getDb()
    const userId = request.headers.get("x-user-id")

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = depositSchema.parse(body)

    // Get user's account
    const account = await db.collection("accounts").findOne({ userId: new ObjectId(userId), status: "ACTIVE" })

    if (!account) {
      return NextResponse.json({ error: "No active trading account found" }, { status: 400 })
    }

    // Create transaction
    const transaction = {
      userId: new ObjectId(userId),
      accountId: account._id,
      type: "DEPOSIT",
      amount: validated.amount,
      currency: validated.currency,
      status: "PENDING",
      description: `Deposit via ${body.method}`,
      reference: `DEP-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("transactions").insertOne(transaction)

    // Create audit log
    await db.collection("audit_logs").insertOne({
      userId: new ObjectId(userId),
      action: "DEPOSIT_INITIATED",
      resource: "transaction",
      resourceId: result.insertedId.toString(),
      changes: transaction,
      createdAt: new Date(),
    })

    return NextResponse.json({ transaction: { ...transaction, _id: result.insertedId } }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error processing deposit:", error)
    return NextResponse.json({ error: "Failed to process deposit" }, { status: 500 })
  }
}
