import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb"
import clientPromise from "@/lib/db/mongodb"

export const auth = betterAuth({
  database: mongodbAdapter(clientPromise),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      fullName: {
        type: "string",
        required: true,
      },
      country: {
        type: "string",
        required: true,
      },
      investmentGoals: {
        type: "string",
        required: false,
      },
      riskTolerance: {
        type: "string",
        required: false,
      },
      preferredIndustry: {
        type: "string",
        required: false,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
      },
    },
  },
})

export type Session = typeof auth.$Infer.Session
