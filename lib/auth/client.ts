import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  plugins: [
    inferAdditionalFields({
      user: {
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
        phoneNumber: {
          type: "string",
          required: false,
        },
        dateOfBirth: {
          type: "date",
          required: false,
        },
        kycStatus: {
          type: "string",
          required: false,
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
        },
        lockedUntil: {
          type: "date",
          required: false,
        },
        twoFactorEnabled: {
          type: "boolean",
          required: false,
        },
        marketingConsent: {
          type: "boolean",
          required: false,
        },
        termsAcceptedAt: {
          type: "date",
          required: false,
        },
        privacyAcceptedAt: {
          type: "date",
          required: false,
        },
        role: {
          type: "string",
          required: true,
        },
        status: {
          type: "string",
          required: true,
        },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
