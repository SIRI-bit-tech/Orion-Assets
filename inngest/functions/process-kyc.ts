import { inngest } from "../client"
import { connectToDatabase } from "@/lib/db/mongodb"

export const processKYC = inngest.createFunction(
  {
    id: "process-kyc",
    name: "Process KYC Verification",
    retries: 2,
  },
  { event: "kyc/verification.submitted" },
  async ({ event, step }) => {
    const { kycId, userId } = event.data

    // Step 1: Validate documents (simulate AI/manual review)
    await step.sleep("review-documents", "1m")

    const isApproved = await step.run("validate-documents", async () => {
      // Simulate document validation (in production, integrate with KYC provider)
      return Math.random() > 0.1 // 90% approval rate for demo
    })

    // Step 2: Update KYC status
    await step.run("update-kyc-status", async () => {
      const db = await connectToDatabase()

      await db.collection("kyc_verifications").updateOne(
        { _id: kycId },
        {
          $set: {
            status: isApproved ? "APPROVED" : "REJECTED",
            reviewedAt: new Date(),
            rejectionReason: isApproved ? null : "Document quality insufficient",
            updatedAt: new Date(),
          },
        },
      )

      // Update user KYC status
      await db.collection("users").updateOne(
        { _id: userId },
        {
          $set: {
            kycStatus: isApproved ? "APPROVED" : "REJECTED",
            updatedAt: new Date(),
          },
        },
      )
    })

    // Step 3: Send notification
    await step.run("send-notification", async () => {
      await inngest.send({
        name: isApproved ? "notification/kyc.approved" : "notification/kyc.rejected",
        data: {
          userId,
          kycId,
        },
      })
    })

    return { success: true, kycId, isApproved }
  },
)
