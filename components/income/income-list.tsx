"use client"

import { useState } from "react"
import { getCategoryById } from "@/lib/categories"
import { formatDate } from "@/lib/utils/format"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { EditIncomeDialog } from "./edit-income-dialog"
import { DeleteIncomeDialog } from "./delete-income-dialog"

interface Income {
  id: string
  title: string
  amount: number
  category: string
  date: string
}

interface IncomeListProps {
  income: Income[]
  currency: string
}

export function IncomeList({ income, currency }: IncomeListProps) {
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [deletingIncome, setDeletingIncome] = useState<Income | null>(null)

  if (income.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No income recorded yet</p>
          <p className="text-sm mt-1">Add your first income to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="divide-y">
          {income.map((item) => {
            const category = getCategoryById(item.category, "income")

            return (
              <div key={item.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl bg-muted ${category?.color || "text-green-500"}`}>
                    {category ? <category.icon className="h-5 w-5" /> : <span className="h-5 w-5">💰</span>}
                  </div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {category?.name || item.category} • {formatDate(item.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-green-500">
                    +{new Intl.NumberFormat("en-US", { style: "currency", currency }).format(item.amount)}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingIncome(item)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeletingIncome(item)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {editingIncome && (
        <EditIncomeDialog
          open={!!editingIncome}
          onOpenChange={(open) => !open && setEditingIncome(null)}
          income={editingIncome}
          currency={currency}
        />
      )}

      {deletingIncome && (
        <DeleteIncomeDialog
          open={!!deletingIncome}
          onOpenChange={(open) => !open && setDeletingIncome(null)}
          income={deletingIncome}
        />
      )}
    </>
  )
}
