import { createClient } from "@/lib/supabase/server"
import { getUserCurrency } from "@/lib/supabase/get-profile"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { ExpensesList } from "@/components/expenses/expenses-list"
import { ExpenseFilters } from "@/components/expenses/expense-filters"
import { QuickAddExpense } from "@/components/dashboard/quick-add-expense"

interface ExpensesPageProps {
  searchParams: Promise<{
    month?: string
    category?: string
  }>
}

async function getExpensesData(userId: string, month?: string, category?: string) {
  const supabase = await createClient()

  const currency = await getUserCurrency(userId)

  let query = supabase.from("expenses").select("*").eq("user_id", userId).order("date", { ascending: false })

  if (month) {
    const [year, monthNum] = month.split("-").map(Number)
    const startOfMonth = new Date(year, monthNum - 1, 1).toISOString()
    const endOfMonth = new Date(year, monthNum, 0).toISOString()
    query = query.gte("date", startOfMonth).lte("date", endOfMonth)
  }

  if (category && category !== "all") {
    query = query.eq("category", category)
  }

  const { data: expenses } = await query

  const total = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0

  return {
    currency,
    expenses: expenses || [],
    total,
  }
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const params = await searchParams
  const data = await getExpensesData(user.id, params.month, params.category)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Expenses</h1>
            <p className="text-muted-foreground">Manage and track your expenses</p>
          </div>
          <QuickAddExpense currency={data.currency} />
        </div>

        <ExpenseFilters currentMonth={params.month} currentCategory={params.category} />

        <ExpensesList expenses={data.expenses} currency={data.currency} total={data.total} />
      </div>
    </DashboardShell>
  )
}
