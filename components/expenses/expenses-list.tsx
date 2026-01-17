"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCategoryById } from "@/lib/categories"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ExpenseDialog } from "./expense-dialog"
import { DeleteExpenseDialog } from "./delete-expense-dialog"

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
}

interface ExpensesListProps {
  expenses: Expense[]
  currency: string
  total: number
}

export function ExpensesList({ expenses, currency, total }: ExpensesListProps) {
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [deleteExpense, setDeleteExpense] = useState<Expense | null>(null)

  if (expenses.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-muted-foreground">No expenses found.</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first expense or adjust your filters.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-foreground">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""}
          </CardTitle>
          <p className="text-lg font-semibold text-red-500">Total: -{formatCurrency(total, currency)}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {expenses.map((expense) => {
              const category = getCategoryById(expense.category)
              const Icon = category?.icon || getCategoryById("other")!.icon

              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full bg-background flex items-center justify-center ${category?.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{expense.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {category?.name || "Other"} · {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold text-red-500">-{formatCurrency(expense.amount, currency)}</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditExpense(expense)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setDeleteExpense(expense)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {editExpense && (
        <ExpenseDialog
          open={!!editExpense}
          onOpenChange={(open) => !open && setEditExpense(null)}
          currency={currency}
          expense={editExpense}
        />
      )}

      {/* Delete Dialog */}
      {deleteExpense && (
        <DeleteExpenseDialog
          open={!!deleteExpense}
          onOpenChange={(open) => !open && setDeleteExpense(null)}
          expense={deleteExpense}
          currency={currency}
        />
      )}
    </>
  )
}
