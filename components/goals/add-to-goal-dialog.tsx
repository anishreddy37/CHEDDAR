"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { getCurrencySymbol } from "@/lib/countries"

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
}

interface AddToGoalDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal: Goal
  currency: string
  mode: "add" | "withdraw"
}

export function AddToGoalDialog({ open, onOpenChange, goal, currency, mode }: AddToGoalDialogProps) {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const amountNum = Number.parseFloat(amount)
    if (Number.isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount")
      setLoading(false)
      return
    }

    if (mode === "withdraw" && amountNum > goal.current_amount) {
      setError("Cannot withdraw more than current balance")
      setLoading(false)
      return
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError("You must be logged in")
        setLoading(false)
        return
      }

      const newAmount = mode === "add" ? goal.current_amount + amountNum : goal.current_amount - amountNum

      const { error: updateError } = await supabase
        .from("savings_goals")
        .update({ current_amount: newAmount })
        .eq("id", goal.id)
        .eq("user_id", user.id)

      if (updateError) throw updateError

      setAmount("")
      onOpenChange(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Funds" : "Withdraw Funds"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? `Add money to "${goal.name}"` : `Withdraw money from "${goal.name}"`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{error}</div>}

            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Balance</span>
                <span className="font-medium">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(goal.current_amount)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({getCurrencySymbol(currency)})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={mode === "withdraw" ? goal.current_amount : undefined}
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant={mode === "withdraw" ? "destructive" : "default"}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "add" ? "Adding..." : "Withdrawing..."}
                </>
              ) : mode === "add" ? (
                "Add Funds"
              ) : (
                "Withdraw"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
