import { createClient } from "@/lib/supabase/server"
import { getUserCurrency } from "@/lib/supabase/get-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { StatCard } from "@/components/dashboard/stat-card"
import { Wallet, TrendingDown, TrendingUp, CreditCard } from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { QuickAddExpense } from "@/components/dashboard/quick-add-expense"
import { HealthScore } from "@/components/dashboard/health-score"
import { SpendingStreak } from "@/components/dashboard/spending-streak"
import { BudgetOverview } from "@/components/dashboard/budget-overview"
import { AIInsights } from "@/components/dashboard/ai-insights"
import { calculateHealthScore } from "@/lib/utils/calculate-health-score"

async function getDashboardData(userId: string) {
  const supabase = await createClient()

  const currency = await getUserCurrency(userId)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

  const [
    { data: expenses },
    { data: allExpenses },
    { data: income },
    { data: recentExpenses },
    { data: budgets },
    { data: userStats },
    { data: savingsGoals },
  ] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount, category")
      .eq("user_id", userId)
      .gte("date", startOfMonth)
      .lte("date", endOfMonth),
    supabase
      .from("expenses")
      .select("amount, category, date")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(50),
    supabase.from("income").select("amount").eq("user_id", userId).gte("date", startOfMonth).lte("date", endOfMonth),
    supabase.from("expenses").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(5),
    supabase.from("budgets").select("category, amount").eq("user_id", userId),
    supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("savings_goals").select("target_amount, current_amount").eq("user_id", userId),
  ])

  const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const totalIncome = income?.reduce((sum, i) => sum + Number(i.amount), 0) || 0
  const balance = totalIncome - totalExpenses

  // Calculate spending per category
  const categorySpending =
    expenses?.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  // Map budgets with spending
  const budgetProgress =
    budgets?.map((b) => ({
      category: b.category,
      budget: Number(b.amount),
      spent: categorySpending[b.category] || 0,
    })) || []

  // Calculate savings goals progress
  const totalGoalTarget = savingsGoals?.reduce((sum, g) => sum + Number(g.target_amount), 0) || 0
  const totalGoalCurrent = savingsGoals?.reduce((sum, g) => sum + Number(g.current_amount), 0) || 0
  const savingsGoalsProgress = totalGoalTarget > 0 ? (totalGoalCurrent / totalGoalTarget) * 100 : 0

  // Calculate health score
  const healthScore = calculateHealthScore({
    totalIncome,
    totalExpenses,
    budgets: budgetProgress,
    currentStreak: userStats?.current_streak || 0,
    savingsGoalsProgress,
  })

  return {
    currency,
    totalExpenses,
    totalIncome,
    balance,
    recentExpenses: recentExpenses || [],
    allExpenses: allExpenses || [],
    transactionCount: (expenses?.length || 0) + (income?.length || 0),
    healthScore,
    currentStreak: userStats?.current_streak || 0,
    longestStreak: userStats?.longest_streak || 0,
    budgetProgress,
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const data = await getDashboardData(user.id)

  return (
    <DashboardShell>
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl lg:text-3xl font-heading font-bold text-foreground">Dashboard</h1>
              <p className="text-sm lg:text-base text-muted-foreground">Your financial overview</p>
            </div>
            {/* Desktop only button */}
            <div className="hidden lg:block">
              <QuickAddExpense currency={data.currency} />
            </div>
          </div>

          {/* Mobile full-width add button */}
          <div className="lg:hidden">
            <QuickAddExpense currency={data.currency} mobile />
          </div>
        </div>

        {/* Health Score and Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <HealthScore score={data.healthScore} />
          <SpendingStreak currentStreak={data.currentStreak} longestStreak={data.longestStreak} />
        </div>

        {/* Stats Grid - 2x2 on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <StatCard
            title="Balance"
            value={formatCurrency(data.balance, data.currency)}
            icon={Wallet}
            variant={data.balance >= 0 ? "default" : "expense"}
          />
          <StatCard
            title="Income"
            value={formatCurrency(data.totalIncome, data.currency)}
            icon={TrendingUp}
            variant="income"
          />
          <StatCard
            title="Expenses"
            value={formatCurrency(data.totalExpenses, data.currency)}
            icon={TrendingDown}
            variant="expense"
          />
          <StatCard title="Transactions" value={data.transactionCount.toString()} icon={CreditCard} />
        </div>

        {/* AI Insights */}
        <AIInsights expenses={data.allExpenses} income={data.totalIncome} currency={data.currency} />

        {/* Budget Overview and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <BudgetOverview budgets={data.budgetProgress} currency={data.currency} />
          <RecentTransactions expenses={data.recentExpenses} currency={data.currency} />
        </div>
      </div>
    </DashboardShell>
  )
}
