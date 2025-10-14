import { z } from "zod"

export const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  country: z.string().min(2, "Please select a country"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  investmentGoals: z.string().optional(),
  riskTolerance: z.string().optional(),
  preferredIndustry: z.string().optional(),
})

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const orderSchema = z.object({
  symbol: z.string().min(1, "Symbol is required"),
  orderType: z.enum(["MARKET", "LIMIT", "STOP", "STOP_LIMIT"]),
  side: z.enum(["BUY", "SELL"]),
  quantity: z.number().positive("Quantity must be positive"),
  price: z.number().positive().optional(),
  stopPrice: z.number().positive().optional(),
  limitPrice: z.number().positive().optional(),
  timeInForce: z.enum(["GTC", "DAY", "IOC", "FOK"]),
})

export const depositSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
})

export const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().default("USD"),
})

export const kycSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  documentNumber: z.string().min(1, "Document number is required"),
  dateOfBirth: z.date(),
  address: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
})
