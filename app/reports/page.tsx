import { createClient } from "@/lib/supabase/server"
import { getUserCurrency } from "@/lib/supabase/get-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { CategoryPieChart } from "@/components/reports/category-pie-chart"
import { MonthlyTrendChart } from "@/components/reports/monthly-trend-chart"
import { CategoryBreakdown } from "@/components/reports/category-breakdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils/format"
import { TrendingDown, TrendingUp, Calendar } from "lucide-react"

async function getReportsData(userId: string) {
  const supabase = await createClient()

  const currency = await getUserCurrency(userId)

  // Get all expenses for the user
  const { data: allExpenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true })

  const expenses = allExpenses || []

  // Calculate category totals
  const categoryTotals: Record<string, number> = {}
  expenses.forEach((expense) => {
    const cat = expense.category || "other"
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(expense.amount)
  })

  // Calculate monthly totals (last 6 months)
  const monthlyTotals: { month: string; amount: number; label: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const year = date.getFullYear()
    const month = date.getMonth()
    const monthKey = `${year}-${String(month + 1).padStart(2, "0")}`
    const label = date.toLocaleDateString("en-US", { month: "short" })

    const monthExpenses = expenses.filter((e) => {
      const expDate = new Date(e.date)
      return expDate.getFullYear() === year && expDate.getMonth() === month
    })

    const total = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    monthlyTotals.push({ month: monthKey, amount: total, label })
  }

  // Current month stats
  const now = new Date()
  const currentMonthExpenses = expenses.filter((e) => {
    const expDate = new Date(e.date)
    return expDate.getFullYear() === now.getFullYear() && expDate.getMonth() === now.getMonth()
  })
  const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  // Last month stats
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  const lastMonthExpenses = expenses.filter((e) => {
    const expDate = new Date(e.date)
    return expDate.getFullYear() === lastMonth.getFullYear() && expDate.getMonth() === lastMonth.getMonth()
  })
  const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0)

  // Calculate change percentage
  const changePercent = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0

  // Total all time
  const totalAllTime = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  // Average monthly spending
  const avgMonthly = monthlyTotals.length > 0 ? totalAllTime / monthlyTotals.length : 0

  return {
    currency,
    categoryTotals,
    monthlyTotals,
    currentMonthTotal,
    lastMonthTotal,
    changePercent,
    totalAllTime,
    avgMonthly,
    expenseCount: expenses.length,
  }
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const data = await getReportsData(user.id)

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Analyze your spending patterns</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(data.currentMonthTotal, data.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Month</p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(data.lastMonthTotal, data.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center ${data.changePercent > 0 ? "bg-red-500/10" : "bg-green-500/10"}`}
                >
                  {data.changePercent > 0 ? (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Change</p>
                  <p className={`text-lg font-bold ${data.changePercent > 0 ? "text-red-500" : "text-green-500"}`}>
                    {data.changePercent > 0 ? "+" : ""}
                    {data.changePercent.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Monthly</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(data.avgMonthly, data.currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Pie Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryPieChart categoryTotals={data.categoryTotals} currency={data.currency} />
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Monthly Spending Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyTrendChart monthlyTotals={data.monthlyTotals} currency={data.currency} />
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <CategoryBreakdown categoryTotals={data.categoryTotals} currency={data.currency} total={data.totalAllTime} />
      </div>
    </DashboardShell>
  )
}
