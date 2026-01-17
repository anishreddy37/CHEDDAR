import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { BudgetsList } from "@/components/budgets/budgets-list"
import { CreateBudgetDialog } from "@/components/budgets/create-budget-dialog"
import { expenseCategories } from "@/lib/categories"

async function getBudgetsData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle()

  const currency = profile?.currency || "USD"

  // Get current month's date range
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0]

  // Get budgets
  const { data: budgets } = await supabase
    .from("budgets")
    .select("*")
    .eq("user_id", user.id)
    .order("category", { ascending: true })

  // Get this month's expenses by category
  const { data: expenses } = await supabase
    .from("expenses")
    .select("category, amount")
    .eq("user_id", user.id)
    .gte("date", startOfMonth)
    .lte("date", endOfMonth)

  // Calculate spent per category
  const spentByCategory: Record<string, number> = {}
  expenses?.forEach((expense) => {
    spentByCategory[expense.category] = (spentByCategory[expense.category] || 0) + expense.amount
  })

  // Combine budgets with spent amounts
  const budgetsWithSpent = (budgets || []).map((budget) => ({
    ...budget,
    spent: spentByCategory[budget.category] || 0,
  }))

  // Calculate total budget and spent
  const totalBudget = budgetsWithSpent.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = budgetsWithSpent.reduce((sum, b) => sum + b.spent, 0)

  return {
    budgets: budgetsWithSpent,
    currency,
    totalBudget,
    totalSpent,
  }
}

export default async function BudgetsPage() {
  const { budgets, currency, totalBudget, totalSpent } = await getBudgetsData()

  // Get categories that don't have budgets yet
  const existingCategories = budgets.map((b) => b.category)
  const availableCategories = expenseCategories.filter((c) => !existingCategories.includes(c.id))

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Budgets</h1>
            <p className="text-muted-foreground">Set spending limits for each category</p>
          </div>
          {availableCategories.length > 0 && (
            <CreateBudgetDialog currency={currency} availableCategories={availableCategories} />
          )}
        </div>

        {/* Budget Overview Card */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Monthly Overview</h3>
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Budget</span>
              <span className="font-medium">
                {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(totalBudget)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Spent</span>
              <span className={`font-medium ${totalSpent > totalBudget ? "text-red-500" : "text-green-500"}`}>
                {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(totalSpent)}
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${totalSpent > totalBudget ? "bg-red-500" : "bg-green-500"}`}
                style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100) || 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Remaining</span>
              <span className={`font-medium ${totalBudget - totalSpent < 0 ? "text-red-500" : "text-green-500"}`}>
                {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(totalBudget - totalSpent)}
              </span>
            </div>
          </div>
        </div>

        <BudgetsList budgets={budgets} currency={currency} />
      </div>
    </DashboardShell>
  )
}
