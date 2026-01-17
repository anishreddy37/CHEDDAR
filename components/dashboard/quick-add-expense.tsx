"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"

interface QuickAddExpenseProps {
  currency: string
  mobile?: boolean
}

export function QuickAddExpense({ currency, mobile }: QuickAddExpenseProps) {
  const [open, setOpen] = useState(false)

  if (mobile) {
    return (
      <>
        <Button onClick={() => setOpen(true)} className="w-full gap-2 h-12 text-base tap-highlight">
          <Plus className="h-5 w-5" />
          Add Expense
        </Button>
        <ExpenseDialog open={open} onOpenChange={setOpen} currency={currency} />
      </>
    )
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Expense
      </Button>
      <ExpenseDialog open={open} onOpenChange={setOpen} currency={currency} />
    </>
  )
}
