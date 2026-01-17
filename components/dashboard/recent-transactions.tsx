import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCategoryById } from "@/lib/categories"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
}

interface RecentTransactionsProps {
  expenses: Expense[]
  currency: string
}

export function RecentTransactions({ expenses, currency }: RecentTransactionsProps) {
  if (expenses.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first expense to get started!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-foreground">Recent Transactions</CardTitle>
        <Link href="/expenses">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            View all
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => {
            const category = getCategoryById(expense.category)
            const Icon = category?.icon || getCategoryById("other")!.icon

            return (
              <div key={expense.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${category?.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{expense.title}</p>
                    <p className="text-sm text-muted-foreground">{category?.name || "Other"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-500">-{formatCurrency(expense.amount, currency)}</p>
                  <p className="text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
