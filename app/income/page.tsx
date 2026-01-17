import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { IncomeList } from "@/components/income/income-list"
import { AddIncomeDialog } from "@/components/income/add-income-dialog"

async function getIncomeData(searchParams: Promise<{ month?: string; source?: string }>) {
  const supabase = await createClient()
  const params = await searchParams

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle()

  const currency = profile?.currency || "USD"

  // Build query
  let query = supabase.from("income").select("*").eq("user_id", user.id).order("date", { ascending: false })

  // Filter by month
  if (params.month) {
    const [year, month] = params.month.split("-")
    const startDate = new Date(Number(year), Number(month) - 1, 1)
    const endDate = new Date(Number(year), Number(month), 0)
    query = query.gte("date", startDate.toISOString().split("T")[0]).lte("date", endDate.toISOString().split("T")[0])
  }

  // Filter by source/category
  if (params.source && params.source !== "all") {
    query = query.eq("category", params.source)
  }

  const { data: income } = await query

  // Get total income
  const totalIncome = income?.reduce((sum, i) => sum + i.amount, 0) || 0

  return {
    income: income || [],
    currency,
    totalIncome,
  }
}

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; source?: string }>
}) {
  const { income, currency, totalIncome } = await getIncomeData(searchParams)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Income</h1>
            <p className="text-muted-foreground">Track your income sources</p>
          </div>
          <AddIncomeDialog currency={currency} />
        </div>

        {/* Total Income Card */}
        <div className="rounded-xl border bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-3xl font-bold text-green-500">
                {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(totalIncome)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <IncomeList income={income} currency={currency} />
      </div>
    </DashboardShell>
  )
}
