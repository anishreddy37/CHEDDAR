"use client"

import { useState } from "react"
import { getCategoryById } from "@/lib/categories"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import { EditBudgetDialog } from "./edit-budget-dialog"
import { DeleteBudgetDialog } from "./delete-budget-dialog"

interface Budget {
  id: string
  category: string
  amount: number
  spent: number
}

interface BudgetsListProps {
  budgets: Budget[]
  currency: string
}

export function BudgetsList({ budgets, currency }: BudgetsListProps) {
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deletingBudget, setDeletingBudget] = useState<Budget | null>(null)

  if (budgets.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No budgets set</p>
          <p className="text-sm mt-1">Create budgets to track your spending limits</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {budgets.map((budget) => {
          const category = getCategoryById(budget.category)
          const percentage = (budget.spent / budget.amount) * 100
          const isOverBudget = budget.spent > budget.amount
          const isNearLimit = percentage >= 80 && !isOverBudget

          return (
            <div key={budget.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {category && (
                    <div className={`p-2 rounded-lg bg-muted ${category.color}`}>
                      <category.icon className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{category?.name || budget.category}</p>
                    <p className="text-xs text-muted-foreground">Monthly budget</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingBudget(budget)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setDeletingBudget(budget)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(budget.spent)} spent
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(budget.amount)}
                  </span>
                </div>

                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isOverBudget ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isOverBudget ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-xs text-red-500 font-medium">Over budget!</span>
                      </>
                    ) : isNearLimit ? (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs text-amber-500 font-medium">Near limit</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-xs text-green-500 font-medium">On track</span>
                      </>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{Math.round(percentage)}% used</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {editingBudget && (
        <EditBudgetDialog
          open={!!editingBudget}
          onOpenChange={(open) => !open && setEditingBudget(null)}
          budget={editingBudget}
          currency={currency}
        />
      )}

      {deletingBudget && (
        <DeleteBudgetDialog
          open={!!deletingBudget}
          onOpenChange={(open) => !open && setDeletingBudget(null)}
          budget={deletingBudget}
        />
      )}
    </>
  )
}
