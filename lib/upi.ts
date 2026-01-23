/**
 * UPI Payment utilities
 * Constructs UPI intent URLs for redirecting to UPI apps
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

  // Encode parameters to handle special characters
  const pa = encodeURIComponent(upiId)
  const pn = encodeURIComponent(payeeName)
  const am = amount.toFixed(2)
  const tn = encodeURIComponent(`${category} via Finzy`)
  const tr = transactionRef ? encodeURIComponent(transactionRef) : ""
  const cu = currency

  let url = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&cu=${cu}&tn=${tn}`

  if (tr) {
    url += `&tr=${tr}`
  }

  return url
}

/**
 * Converts a mobile number to UPI ID format
 * Example: 9876543210 -> 9876543210@upi
 */
export function mobileToUPI(mobileNumber: string): string {
  // Remove any non-digit characters
  const cleaned = mobileNumber.replace(/\D/g, "")

  // Validate Indian mobile number (10 digits)
  if (cleaned.length !== 10) {
    throw new Error("Invalid mobile number - must be 10 digits")
  }

  const firstDigit = cleaned[0]
  if (!["6", "7", "8", "9"].includes(firstDigit)) {
    throw new Error("Invalid Indian mobile number")
  }

  return `${cleaned}@upi`
}

/**
 * Validates UPI ID format
 * Valid formats: username@bank, 9876543210@upi, etc.
 */
export function isValidUPI(upiId: string): boolean {
  const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/
  return upiRegex.test(upiId)
}

/**
 * Extracts payee info from UPI QR code payload
 * QR code typically contains: upi://pay?pa=<UPI>&pn=<NAME>&...
 */
export function extractUPIInfo(qrPayload: string): { upiId: string; payeeName?: string } | null {
  try {
    // Remove the upi:// prefix if present
    const payload = qrPayload.replace(/^upi:\/\//, "")

    // Parse query parameters
    const params = new URLSearchParams(payload.replace(/^pay\?/, ""))

    const pa = params.get("pa") // payee address (UPI ID)
    const pn = params.get("pn") // payee name

    if (!pa) return null

    return {
      upiId: decodeURIComponent(pa),
      payeeName: pn ? decodeURIComponent(pn) : undefined,
    }
  } catch {
    return null
  }
}

/**
 * Redirects to UPI app with payment URL
 * This is typically called after expense record is created
 */
export function initiateUPIPayment(upiUrl: string): void {
  window.location.href = upiUrl
}
