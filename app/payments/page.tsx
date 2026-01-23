import { createClient } from "@/lib/supabase/server"
import { getUserCurrency } from "@/lib/supabase/get-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowUpRight, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { getCategoryById } from "@/lib/categories"

async function getUPIPayments(userId: string) {
  const supabase = await createClient()

  const { data: payments, error } = await supabase
    .from("upi_payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching UPI payments:", error)
    return []
  }

  return payments || []
}

function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />
    case "initiated":
      return <Clock className="h-5 w-5 text-yellow-500" />
    case "failed":
      return <XCircle className="h-5 w-5 text-red-500" />
    case "completed_assumed":
      return <AlertCircle className="h-5 w-5 text-blue-500" />
    default:
      return <Clock className="h-5 w-5 text-gray-500" />
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "Completed"
    case "initiated":
      return "Initiated"
    case "failed":
      return "Failed"
    case "completed_assumed":
      return "Completed (Assumed)"
    default:
      return status
  }
}

export default async function UPIPaymentsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const currency = await getUserCurrency(user.id)
  const payments = await getUPIPayments(user.id)

  const stats = {
    totalPaid: payments
      .filter((p) => p.status === "completed" || p.status === "completed_assumed")
      .reduce((sum, p) => sum + Number(p.amount), 0),
    initiatedCount: payments.filter((p) => p.status === "initiated").length,
    failedCount: payments.filter((p) => p.status === "failed").length,
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">UPI Payments</h1>
          <p className="text-muted-foreground">Manage and track your UPI transactions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalPaid, currency)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.initiatedCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{stats.failedCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>All your UPI transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground">No UPI payments yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">{getStatusIcon(payment.status)}</div>
                      <div>
                        <p className="font-medium text-sm">{payment.payee_name || payment.upi_id}</p>
                        <p className="text-xs text-muted-foreground">
                          {getCategoryById(payment.category)?.name} • {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(Number(payment.amount), currency)}</p>
                      <p className="text-xs text-muted-foreground">{getStatusLabel(payment.status)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50 border-muted">
          <CardHeader>
            <CardTitle className="text-base">How UPI Payments Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Enter recipient's mobile number, UPI ID, or scan a QR code</p>
            <p>2. Enter amount and select expense category</p>
            <p>3. Click "Pay via UPI" to redirect to your preferred UPI app</p>
            <p>4. Expense is automatically recorded before payment is initiated</p>
            <p>5. Status updates when you return to Finzy (automatic or manual)</p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
