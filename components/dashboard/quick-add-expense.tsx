"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ExpenseDialog } from "@/components/expenses/expense-dialog"
import { UPIPaymentDialog } from "@/components/payments/upi-payment-dialog"

interface QuickAddExpenseProps {
  currency: string
  mobile?: boolean
}

export function QuickAddExpense({ currency, mobile }: QuickAddExpenseProps) {
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [upiOpen, setUpiOpen] = useState(false)

  if (mobile) {
    return (
      <>
        <div className="flex gap-2 w-full">
          <Button onClick={() => setExpenseOpen(true)} className="flex-1 gap-2 h-12 text-base tap-highlight">
            <Plus className="h-5 w-5" />
            Add Expense
          </Button>
          <Button
            onClick={() => setUpiOpen(true)}
            variant="secondary"
            className="flex-1 gap-2 h-12 text-base tap-highlight"
          >
            <Plus className="h-5 w-5" />
            Pay UPI
          </Button>
        </div>
        <ExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} currency={currency} />
        <UPIPaymentDialog open={upiOpen} onOpenChange={setUpiOpen} currency={currency} />
      </>
    )
  }

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setExpenseOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
        <Button onClick={() => setUpiOpen(true)} variant="secondary" className="gap-2">
          <Plus className="h-4 w-4" />
          Pay UPI
        </Button>
      </div>
      <ExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} currency={currency} />
      <UPIPaymentDialog open={upiOpen} onOpenChange={setUpiOpen} currency={currency} />
    </>
  )
}
