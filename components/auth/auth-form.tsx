"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { signIn, signUp } from "@/lib/auth/client";
import { signUpSchema, signInSchema } from "@/lib/utils/validation";
import { Star } from "lucide-react";
import { Logo } from "@/components/ui/logo";

interface AuthFormProps {
  mode: "signin" | "signup";
}

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "Singapore",
  "Hong Kong",
  "United Arab Emirates",
];

const INVESTMENT_GOALS = ["Growth", "Income", "Preservation", "Speculation"];
const RISK_TOLERANCE = ["Conservative", "Moderate", "Aggressive"];
const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Energy",
  "Consumer Goods",
  "Real Estate",
  "Telecommunications",
];

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    password: "",
    investmentGoals: "",
    riskTolerance: "",
    preferredIndustry: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const validated = signUpSchema.parse(formData);
        const result = await signUp.email({
          email: validated.email,
          password: validated.password,
          name: validated.fullName,
          fullName: validated.fullName,
          country: validated.country,
          investmentGoals: validated.investmentGoals,
          riskTolerance: validated.riskTolerance,
          preferredIndustry: validated.preferredIndustry,
          role: "USER",
          status: "ACTIVE",
          callbackURL: "/dashboard",
        });

        if (result.error) {
          setError(result.error.message || "Failed to create account");
        } else {
          router.push("/dashboard");
        }
      } else {
        const validated = signInSchema.parse({
          email: formData.email,
          password: formData.password,
        });

        const result = await signIn.email({
          email: validated.email,
          password: validated.password,
          callbackURL: "/dashboard",
        });

        if (result.error) {
          setError(result.error.message || "Invalid email or password");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo size="md" />
          </div>

          {/* Form Title */}
          <div>
            <h1 className="text-2xl font-bold">
              {mode === "signup"
                ? "Sign Up & Personalize"
                : "Log In Your Account"}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Adrian Hajdin"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                  className="bg-secondary border-border"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="bg-secondary border-border"
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) =>
                    setFormData({ ...formData, country: value })
                  }
                >
                  <SelectTrigger className="bg-secondary border-border">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Helps us show market data and news relevant to you.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter a strong password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="bg-secondary border-border"
              />
            </div>

            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="investmentGoals">Investment Goals</Label>
                  <Select
                    value={formData.investmentGoals}
                    onValueChange={(value) =>
                      setFormData({ ...formData, investmentGoals: value })
                    }
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select your goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTMENT_GOALS.map((goal) => (
                        <SelectItem key={goal} value={goal}>
                          {goal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select
                    value={formData.riskTolerance}
                    onValueChange={(value) =>
                      setFormData({ ...formData, riskTolerance: value })
                    }
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select your risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      {RISK_TOLERANCE.map((risk) => (
                        <SelectItem key={risk} value={risk}>
                          {risk}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredIndustry">Preferred Industry</Label>
                  <Select
                    value={formData.preferredIndustry}
                    onValueChange={(value) =>
                      setFormData({ ...formData, preferredIndustry: value })
                    }
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Select your preferred industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-black font-semibold"
              disabled={isLoading}
            >
              {isLoading
                ? "Please wait..."
                : mode === "signup"
                  ? "Start Your Investing Journey"
                  : "Log In"}
            </Button>

            <div className="text-center text-sm">
              {mode === "signup" ? (
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <a href="/signin" className="text-primary hover:underline">
                    Log In
                  </a>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <a href="/signup" className="text-primary hover:underline">
                    Sign Up
                  </a>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Testimonial & Preview */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary items-center justify-center p-12">
        <div className="max-w-2xl space-y-8">
          {/* Testimonial */}
          <div className="space-y-4">
            <p className="text-2xl font-medium leading-relaxed">
              Orion Assets turned my watchlist into a winning list. The alerts
              are spot-on, and I feel more confident making moves in the market
            </p>
            <div className="space-y-1">
              <p className="font-semibold">— Ethan R.</p>
              <p className="text-sm text-muted-foreground">Retail Investor</p>
            </div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]"
                />
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="rounded-lg overflow-hidden border border-border shadow-2xl">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Ph0PFLCxqH2fMwhQrTxb4kJ87Q9av8.png"
              alt="Dashboard Preview"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
