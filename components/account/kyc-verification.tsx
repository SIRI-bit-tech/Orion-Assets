"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2, AlertCircle, Clock, Upload } from "lucide-react"

type KYCStatus = "NOT_STARTED" | "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED"

export function KYCVerification() {
  const [kycStatus, setKycStatus] = useState<KYCStatus>("NOT_STARTED")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    documentType: "",
    documentNumber: "",
    dateOfBirth: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/account/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to submit KYC")

      setKycStatus("PENDING")
      alert("KYC verification submitted successfully!")
    } catch (error) {
      alert("Failed to submit KYC verification")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = () => {
    switch (kycStatus) {
      case "APPROVED":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-success/20 text-success rounded-lg">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Verified</span>
          </div>
        )
      case "PENDING":
      case "UNDER_REVIEW":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Under Review</span>
          </div>
        )
      case "REJECTED":
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-destructive/20 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Rejected</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Not Started</span>
          </div>
        )
    }
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">KYC Verification</h2>
        {getStatusBadge()}
      </div>

      {kycStatus === "APPROVED" ? (
        <div className="text-center py-12 space-y-4">
          <CheckCircle2 className="h-16 w-16 text-success mx-auto" />
          <h3 className="text-xl font-semibold">Your account is verified!</h3>
          <p className="text-muted-foreground">You have full access to all trading features.</p>
        </div>
      ) : kycStatus === "PENDING" || kycStatus === "UNDER_REVIEW" ? (
        <div className="text-center py-12 space-y-4">
          <Clock className="h-16 w-16 text-blue-400 mx-auto" />
          <h3 className="text-xl font-semibold">Verification in Progress</h3>
          <p className="text-muted-foreground">We're reviewing your documents. This usually takes 1-2 business days.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              Complete KYC verification to unlock full trading features and higher limits.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType">Document Type</Label>
            <Select
              value={formData.documentType}
              onValueChange={(value) => setFormData({ ...formData, documentType: value })}
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="drivers_license">Driver's License</SelectItem>
                <SelectItem value="national_id">National ID Card</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentNumber">Document Number</Label>
            <Input
              id="documentNumber"
              type="text"
              value={formData.documentNumber}
              onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
              placeholder="Enter document number"
              className="bg-secondary border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="bg-secondary border-border"
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Address Information</h3>

            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="123 Main St"
                className="bg-secondary border-border"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="NY"
                  className="bg-secondary border-border"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="10001"
                  className="bg-secondary border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  className="bg-secondary border-border"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Document Upload</h3>

            <div className="space-y-2">
              <Label>Document Front</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Document Back (if applicable)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selfie with Document</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-black" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Verification"}
          </Button>
        </form>
      )}
    </Card>
  )
}
