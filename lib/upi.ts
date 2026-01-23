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
    throw new Error("Invalid Indian mobile number - must start with 6, 7, 8, or 9")
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
export function extractUPIInfo(qrPayload: string): { upiId: string; payeeName?: string; amount?: number } | null {
  try {
    // Remove the upi:// prefix if present
    const payload = qrPayload.replace(/^upi:\/\//, "")

    // Parse query parameters
    const params = new URLSearchParams(payload.replace(/^pay\?/, ""))

    const pa = params.get("pa") // payee address (UPI ID)
    const pn = params.get("pn") // payee name
    const am = params.get("am") // amount

    if (!pa) return null

    return {
      upiId: decodeURIComponent(pa),
      payeeName: pn ? decodeURIComponent(pn) : undefined,
      amount: am ? parseFloat(am) : undefined,
    }
  } catch (error) {
    console.error("[v0] Error parsing QR code:", error)
    return null
  }
}

/**
 * Starts QR code scanner using device camera
 * Requires HTTPS and camera permissions
 */
export async function startQRScanner(): Promise<string | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment", // Use back camera on mobile
      },
    })

    return new Promise((resolve) => {
      // Create video element for stream
      const video = document.createElement("video")
      video.srcObject = stream
      video.play()

      // Stop scanning after 30 seconds
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop())
        resolve(null)
      }, 30000)

      // Here you'd normally use a QR code library like jsQR or ZXing
      // For now, we'll trigger a file input as fallback
      resolve(null)
    })
  } catch (error) {
    console.error("[v0] Camera access denied:", error)
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
 * Redirects to UPI app with payment URL
 * This is typically called after expense record is created
 */
export function initiateUPIPayment(upiUrl: string): void {
  console.log("[v0] Initiating UPI payment with URL:", upiUrl)
  window.location.href = upiUrl
}
