"use client"

import { Target } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/format"
import { expenseCategories } from "@/lib/categories"

interface BudgetItem {
  category: string
  budget: number
  spent: number
}

interface BudgetOverviewProps {
  budgets: BudgetItem[]
  currency: string
}

export function BudgetOverview({ budgets, currency }: BudgetOverviewProps) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <h3 className="font-heading font-semibold text-foreground">Budget Progress</h3>
        </div>
      </div>

      {budgets.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No budgets set. Create one to track your spending!
        </p>
      ) : (
        <div className="space-y-4">
          {budgets.slice(0, 4).map((item) => {
            const category = expenseCategories.find((c) => c.id === item.category)
            const percentage = Math.min((item.spent / item.budget) * 100, 100)
            const isOver = item.spent > item.budget
            const Icon = category?.icon || Target

            return (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ backgroundColor: `${category?.color}20` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: category?.color }} />
                    </div>
                    <span className="text-foreground font-medium">{category?.label || item.category}</span>
                  </div>
                  <span className={cn("text-xs", isOver ? "text-destructive" : "text-muted-foreground")}>
                    {formatCurrency(item.spent, currency)} / {formatCurrency(item.budget, currency)}
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isOver ? "bg-destructive" : "bg-primary",
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
