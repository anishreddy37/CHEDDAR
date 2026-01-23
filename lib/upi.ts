/**
 * UPI Payment utilities - SECURITY CRITICAL
 * Constructs UPI intent URLs for redirecting to UPI apps
 * DO NOT store payment records until payment succeeds
 */

export interface UPIPaymentParams {
  upiId: string
  payeeName?: string
  amount: number
  currency?: string
  transactionRef?: string
  category?: string
}

/**
 * Constructs a UPI payment URL
 * Format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&tn=<DESCRIPTION>&tr=<REF>
 * Note: Amount must be a valid number, not string
 */
export function constructUPIUrl(params: UPIPaymentParams): string {
  const {
    upiId,
    payeeName = "Finzy User",
    amount,
    currency = "INR",
    transactionRef,
    category = "Payment",
  } = params

  // Validate amount
  if (amount <= 0 || amount > 100000) {
    throw new Error("Amount must be between 0.01 and 100000")
  }

  // Validate UPI ID format
  if (!isValidUPI(upiId)) {
    throw new Error(`Invalid UPI ID format: ${upiId}`)
  }

  // Encode parameters to handle special characters
  const pa = encodeURIComponent(upiId)
  const pn = encodeURIComponent(payeeName)
  // Amount must be a valid number format without extra decimals for UPI spec
  const am = amount.toFixed(2)
  const tn = encodeURIComponent(`${category} via Finzy`)
  const tr = transactionRef ? encodeURIComponent(transactionRef) : ""
  const cu = currency

  // Build URL with proper UPI spec formatting
  let url = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tn=${tn}`

  if (tr) {
    url += `&tr=${tr}`
  }

  console.log("[v0] UPI URL constructed:", url)
  return url
}

/**
 * NOTE: Direct mobile number to UPI conversion is NOT SUPPORTED
 * Each UPI ID is linked to a specific bank/provider account
 * Simply converting mobile@upi is invalid and will be rejected by UPI apps
 * 
 * Users MUST provide their actual UPI ID which can be found in their:
 * - Bank app (Settings > UPI ID / My UPI)
 * - Payment app (Google Pay, PhonePe, Paytm profile)
 * Example valid UPI IDs: username@okhdfcbank, username@okaxis, user@google-pay
 */
export function mobileToUPI(mobileNumber: string): string {
  throw new Error(
    "Mobile number alone cannot be converted to UPI ID. Please use the UPI ID option instead and enter your registered UPI ID from your bank or payment app."
  )
}

/**
 * Validates UPI ID format - SECURITY CRITICAL
 * Valid formats: username@bankname, 9876543210@upi, mobile@provider
 * Must follow: [alphanumeric._-]+@[alphanumeric]+
 */
export function isValidUPI(upiId: string): boolean {
  // Strict UPI ID format validation
  const upiRegex = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z0-9]{2,}$/

  if (!upiRegex.test(upiId)) {
    console.warn("[v0] Invalid UPI format:", upiId)
    return false
  }

  // Additional validation: check for common UPI providers or mobile number
  const [username, provider] = upiId.split("@")

  // If username looks like a mobile number, validate it
  if (/^\d{10}$/.test(username)) {
    const firstDigit = username[0]
    if (!["6", "7", "8", "9"].includes(firstDigit)) {
      console.warn("[v0] Invalid mobile number in UPI:", username)
      return false
    }
  }

  return true
}

/**
 * Extracts payee info from UPI QR code payload - SECURITY FIX
 * QR code typically contains: upi://pay?pa=<UPI>&pn=<NAME>&...
 * Validates extracted UPI ID format
 */
export function extractUPIInfo(qrPayload: string): {
  upiId: string
  payeeName?: string
  amount?: number
} | null {
  try {
    // Remove the upi:// prefix if present
    const payload = qrPayload.replace(/^upi:\/\//, "")

    // Parse query parameters
    const params = new URLSearchParams(payload.replace(/^pay\?/, ""))

    const pa = params.get("pa") // payee address (UPI ID)
    const pn = params.get("pn") // payee name
    const am = params.get("am") // amount

    if (!pa) {
      console.warn("[v0] No payee address (pa) in QR code")
      return null
    }

    const upiId = decodeURIComponent(pa)

    // Validate extracted UPI ID
    if (!isValidUPI(upiId)) {
      console.warn("[v0] Extracted UPI ID is invalid:", upiId)
      return null
    }

    return {
      upiId,
      payeeName: pn ? decodeURIComponent(pn) : undefined,
      amount: am ? parseFloat(am) : undefined,
    }
  } catch (error) {
    console.error("[v0] Error parsing QR code:", error)
    return null
  }
}

/**
 * Opens file picker for QR code image
 */
export function openQRImagePicker(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      resolve(file || null)
    }
    input.click()
  })
}

/**
 * Redirects to UPI app with payment URL - SECURITY NOTE
 * IMPORTANT: Do NOT create expense records before this redirect
 * Payment may fail or be cancelled by user
 * Wait for callback/return to confirm successful payment
 */
export function initiateUPIPayment(upiUrl: string): void {
  console.log("[v0] Initiating UPI payment (DO NOT record until success)")
  window.location.href = upiUrl
}
