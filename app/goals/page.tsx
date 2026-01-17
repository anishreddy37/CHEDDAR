import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { GoalsList } from "@/components/goals/goals-list"
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog"
import { PiggyBank, Target, TrendingUp } from "lucide-react"

async function getGoalsData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("currency").eq("id", user.id).maybeSingle()

  const currency = profile?.currency || "USD"

  const { data: goals } = await supabase
    .from("savings_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const totalTarget = goals?.reduce((sum, g) => sum + g.target_amount, 0) || 0
  const totalSaved = goals?.reduce((sum, g) => sum + g.current_amount, 0) || 0
  const completedGoals = goals?.filter((g) => g.current_amount >= g.target_amount).length || 0

  return {
    goals: goals || [],
    currency,
    totalTarget,
    totalSaved,
    completedGoals,
  }
}

export default async function GoalsPage() {
  const { goals, currency, totalTarget, totalSaved, completedGoals } = await getGoalsData()

  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Savings Goals</h1>
            <p className="text-muted-foreground">Track your savings progress</p>
          </div>
          <CreateGoalDialog currency={currency} />
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20 p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <PiggyBank className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-500">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(totalSaved)}
                </p>
                <p className="text-sm text-muted-foreground">Total Saved</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Target className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency }).format(totalTarget)}
                </p>
                <p className="text-sm text-muted-foreground">Total Target</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedGoals}</p>
                <p className="text-sm text-muted-foreground">Goals Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Overall Progress</h3>
            <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-4 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>

        <GoalsList goals={goals} currency={currency} />
      </div>
    </DashboardShell>
  )
}
