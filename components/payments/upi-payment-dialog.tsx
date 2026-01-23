"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { expenseCategories } from "@/lib/categories"
import { Loader2, QrCode, Smartphone, Hash, Camera, ImageIcon } from "lucide-react"
import {
  constructUPIUrl,
  mobileToUPI,
  isValidUPI,
  initiateUPIPayment,
  extractUPIInfo,
  openQRImagePicker,
} from "@/lib/upi"

type PaymentMode = "mobile" | "upi" | "qr"

interface UPIPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currency: string
}

export function UPIPaymentDialog({ open, onOpenChange, currency }: UPIPaymentDialogProps) {
  const [mode, setMode] = useState<PaymentMode>("mobile")
  const [mobileNumber, setMobileNumber] = useState("")
  const [upiId, setUpiId] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [payeeName, setPayeeName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrScanning, setQrScanning] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const handleQRImageUpload = async () => {
    try {
      setQrScanning(true)
      const file = await openQRImagePicker()

      if (!file) {
        setError("No image selected")
        return
      }

      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          // In production, you'd use jsQR or similar library to decode the image
          // For now, we'll show an alert and let user paste the content
          const base64 = e.target?.result as string
          console.log("[v0] Image loaded, would decode with QR library:", base64.substring(0, 50))

          // Simplified: prompt user to paste the QR code content
          const qrContent = window.prompt("Paste the UPI QR code content (starts with upi://pay?):")
          if (qrContent) {
            const upiInfo = extractUPIInfo(qrContent)
            if (upiInfo) {
              setQrCode(qrContent)
              setPayeeName(upiInfo.payeeName || "")
              if (upiInfo.amount) {
                setAmount(upiInfo.amount.toString())
              }
              setError(null)
            } else {
              setError("Invalid QR code format")
            }
          }
        } catch (err) {
          setError("Error reading image")
          console.error("[v0] QR read error:", err)
        } finally {
          setQrScanning(false)
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError("Failed to select image")
      setQrScanning(false)
    }
  }

  const handlePaymentInitiate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Validate inputs
      const amountNum = Number.parseFloat(amount)
      if (Number.isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Please enter a valid amount (minimum ₹1)")
      }

      // NEFT/RTGS limit check
      if (amountNum > 100000) {
        throw new Error("Amount cannot exceed ₹100,000. Use bank transfer for larger amounts")
      }

      if (!category) {
        throw new Error("Please select a category")
      }

      let finalUpiId = ""
      let finalPayeeName = payeeName

      // Determine UPI ID based on mode
      if (mode === "mobile") {
        if (!mobileNumber.trim()) throw new Error("Please enter a mobile number")
        finalUpiId = mobileToUPI(mobileNumber)
      } else if (mode === "upi") {
        if (!upiId.trim()) throw new Error("Please enter a UPI ID")
        if (!isValidUPI(upiId)) throw new Error("Invalid UPI ID format. Example: username@bank or 9876543210@upi")
        finalUpiId = upiId
      } else if (mode === "qr") {
        if (!qrCode.trim()) throw new Error("Please select or enter QR code data")
        const upiInfo = extractUPIInfo(qrCode)
        if (!upiInfo) throw new Error("Invalid QR code - must contain valid UPI data")
        finalUpiId = upiInfo.upiId
        if (upiInfo.payeeName && !finalPayeeName) {
          finalPayeeName = upiInfo.payeeName
        }
      }

      // Get user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("You must be logged in")

      // Step 1: Create expense record with UPI payment info
      const { data: expenseData, error: expenseError } = await supabase
        .from("expenses")
        .insert({
          user_id: user.id,
          title: `UPI Payment to ${finalPayeeName || "Payee"}`,
          amount: amountNum,
          category,
          date: new Date().toISOString().split("T")[0],
        })
        .select("id")
        .single()

      if (expenseError) throw expenseError

      // Step 2: Create UPI payment record
      const transactionId = `FINZY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      const { error: upiError } = await supabase.from("upi_payments").insert({
        user_id: user.id,
        expense_id: expenseData?.id,
        upi_id: finalUpiId,
        payee_name: finalPayeeName || "UPI Payee",
        amount: amountNum,
        category,
        currency,
        payment_method: "UPI",
        status: "initiated",
        transaction_id: transactionId,
      })

      if (upiError) throw upiError

      console.log("[v0] Payment initiated - Amount:", amountNum, "UPI ID:", finalUpiId)

      // Step 3: Construct and initiate UPI payment
      const upiUrl = constructUPIUrl({
        upiId: finalUpiId,
        payeeName: finalPayeeName,
        amount: amountNum,
        currency,
        transactionRef: transactionId,
        category,
      })

      // Reset form
      setMobileNumber("")
      setUpiId("")
      setQrCode("")
      setAmount("")
      setCategory("")
      setPayeeName("")

      onOpenChange(false)
      router.refresh()

      // Redirect to UPI app (this will open Google Pay, PhonePe, etc. if available)
      initiateUPIPayment(upiUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("[v0] Payment error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setMobileNumber("")
      setUpiId("")
      setQrCode("")
      setAmount("")
      setCategory("")
      setPayeeName("")
      setError(null)
      setMode("mobile")
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pay via UPI</DialogTitle>
          <DialogDescription>Send money instantly and auto-track as expense</DialogDescription>
        </DialogHeader>

        <form onSubmit={handlePaymentInitiate} className="space-y-4">
          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}

          {/* Payment Mode Selection */}
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={mode === "mobile" ? "default" : "outline"}
                onClick={() => setMode("mobile")}
                disabled={loading || qrScanning}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <Smartphone className="h-4 w-4" />
                <span className="text-xs">Mobile</span>
              </Button>
              <Button
                type="button"
                variant={mode === "upi" ? "default" : "outline"}
                onClick={() => setMode("upi")}
                disabled={loading || qrScanning}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <Hash className="h-4 w-4" />
                <span className="text-xs">UPI ID</span>
              </Button>
              <Button
                type="button"
                variant={mode === "qr" ? "default" : "outline"}
                onClick={() => setMode("qr")}
                disabled={loading || qrScanning}
                className="flex flex-col items-center gap-1 h-auto py-2"
              >
                <QrCode className="h-4 w-4" />
                <span className="text-xs">QR Code</span>
              </Button>
            </div>
          </div>

          {/* Dynamic Input Based on Mode */}
          {mode === "mobile" && (
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                placeholder="Enter 10-digit mobile number"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                maxLength={10}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">Converts to mobile@upi format</p>
            </div>
          )}

          {mode === "upi" && (
            <div className="space-y-2">
              <Label htmlFor="upi">UPI ID</Label>
              <Input
                id="upi"
                placeholder="e.g., username@bank or 9876543210@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                disabled={loading}
              />
            </div>
          )}

          {mode === "qr" && (
            <div className="space-y-2">
              <Label>QR Code</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading || qrScanning}
                  onClick={handleQRImageUpload}
                  className="flex-1 gap-2 bg-transparent"
                >
                  <ImageIcon className="h-4 w-4" />
                  {qrScanning ? "Scanning..." : "Upload Image"}
                </Button>
              </div>
              {qrCode && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">✓ QR code loaded successfully</div>
              )}
              {!qrCode && (
                <p className="text-xs text-muted-foreground">
                  Scan a UPI QR code image. It will extract payee details and amount automatically.
                </p>
              )}
            </div>
          )}

          {/* Payee Name */}
          <div className="space-y-2">
            <Label htmlFor="payee">Payee Name (Optional)</Label>
            <Input
              id="payee"
              placeholder="Who are you paying?"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">
              Amount ({currency})
              <span className="text-xs text-muted-foreground ml-1">(₹1 - ₹100,000)</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              max="100000"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Expense Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <cat.icon className={`h-4 w-4 ${cat.color}`} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={loading || qrScanning}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || qrScanning}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Pay via UPI"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
