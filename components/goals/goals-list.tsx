"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Plus, Minus, Trash2, Gift, Car, Home, Plane, GraduationCap, Sparkles } from "lucide-react"
import { AddToGoalDialog } from "./add-to-goal-dialog"
import { DeleteGoalDialog } from "./delete-goal-dialog"

const goalIcons: Record<string, typeof Gift> = {
  vacation: Plane,
  car: Car,
  home: Home,
  education: GraduationCap,
  other: Sparkles,
}

const goalColors: Record<string, string> = {
  vacation: "text-cyan-500",
  car: "text-blue-500",
  home: "text-green-500",
  education: "text-purple-500",
  other: "text-amber-500",
}

interface Goal {
  id: string
  name: string
  target_amount: number
  current_amount: number
  category: string
  target_date: string | null
}

interface GoalsListProps {
  goals: Goal[]
  currency: string
}

export function GoalsList({ goals, currency }: GoalsListProps) {
  const [addingToGoal, setAddingToGoal] = useState<Goal | null>(null)
  const [withdrawingFromGoal, setWithdrawingFromGoal] = useState<Goal | null>(null)
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null)

  if (goals.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium">No savings goals yet</p>
          <p className="text-sm mt-1">Create your first goal to start saving!</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const Icon = goalIcons[goal.category] || Gift
          const color = goalColors[goal.category] || "text-amber-500"
          const progress = (goal.current_amount / goal.target_amount) * 100
          const isComplete = goal.current_amount >= goal.target_amount
          const remaining = goal.target_amount - goal.current_amount

          return (
            <div
              key={goal.id}
              className={`rounded-xl border bg-card p-5 ${isComplete ? "ring-2 ring-emerald-500/50" : ""}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-muted ${color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{goal.name}</h3>
                      {isComplete && (
                        <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-full">
                          Complete!
                        </span>
                      )}
                    </div>
                    {goal.target_date && (
                      <p className="text-xs text-muted-foreground">
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setAddingToGoal(goal)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Funds
                    </DropdownMenuItem>
                    {goal.current_amount > 0 && (
                      <DropdownMenuItem onClick={() => setWithdrawingFromGoal(goal)}>
                        <Minus className="mr-2 h-4 w-4" />
                        Withdraw
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => setDeletingGoal(goal)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(goal.current_amount)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    of {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(goal.target_amount)}
                  </span>
                </div>

                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${isComplete ? "bg-emerald-500" : "bg-primary"}`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{Math.round(progress)}% saved</span>
                  {!isComplete && (
                    <span className="text-muted-foreground">
                      {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(remaining)} to go
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {addingToGoal && (
        <AddToGoalDialog
          open={!!addingToGoal}
          onOpenChange={(open) => !open && setAddingToGoal(null)}
          goal={addingToGoal}
          currency={currency}
          mode="add"
        />
      )}

      {withdrawingFromGoal && (
        <AddToGoalDialog
          open={!!withdrawingFromGoal}
          onOpenChange={(open) => !open && setWithdrawingFromGoal(null)}
          goal={withdrawingFromGoal}
          currency={currency}
          mode="withdraw"
        />
      )}

      {deletingGoal && (
        <DeleteGoalDialog
          open={!!deletingGoal}
          onOpenChange={(open) => !open && setDeletingGoal(null)}
          goal={deletingGoal}
        />
      )}
    </>
  )
}
