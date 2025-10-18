import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";
import { emailService } from "@/lib/services/email";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

// Create MongoDB client following Better-Auth documentation
const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: "1" as any,
    strict: true,
    deprecationErrors: true,
  },
});

// Get database instance
const dbName = process.env.MONGODB_DB || "orion-assets-broker";
const db = client.db(dbName);

export const auth = betterAuth({
  database: mongodbAdapter(db, {
    client: client, // Optional: enables database transactions
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.NODE_ENV === "production",
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      await emailService.sendPasswordResetEmail(
        user.email,
        user.name || user.email,
        url,
      );
    },
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: any;
      url: string;
    }) => {
      await emailService.sendVerificationEmail(
        user.email,
        user.name || user.email,
        url,
      );
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },

  user: {
    additionalFields: {
      fullName: {
        type: "string",
        required: true,
        input: true,
      },
      country: {
        type: "string",
        required: true,
        input: true,
      },
      investmentGoals: {
        type: "string",
        required: false,
        input: true,
      },
      riskTolerance: {
        type: "string",
        required: false,
        input: true,
      },
      preferredIndustry: {
        type: "string",
        required: false,
        input: true,
      },
      role: {
        type: "string",
        required: true,
        defaultValue: "USER",
      },
      status: {
        type: "string",
        required: true,
        defaultValue: "ACTIVE",
      },
      phoneNumber: {
        type: "string",
        required: false,
        input: true,
      },
      dateOfBirth: {
        type: "date",
        required: false,
        input: true,
      },
      kycStatus: {
        type: "string",
        required: false,
        defaultValue: "PENDING",
      },
      kycSubmittedAt: {
        type: "date",
        required: false,
      },
      kycApprovedAt: {
        type: "date",
        required: false,
      },
      lastLoginAt: {
        type: "date",
        required: false,
      },
      loginAttempts: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      lockedUntil: {
        type: "date",
        required: false,
      },
      twoFactorEnabled: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      marketingConsent: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
      termsAcceptedAt: {
        type: "date",
        required: false,
      },
      privacyAcceptedAt: {
        type: "date",
        required: false,
      },
    },
  },

  rateLimit: {
    enabled: true,
    window: 60, // 1 minute
    max: 100, // 100 requests per minute
    storage: "memory",
  },

  logger: {
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
  },

  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? [process.env.BETTER_AUTH_URL!]
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
});

export type Session = typeof auth.$Infer.Session;
