import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Trophy, Target, Flame, PiggyBank, TrendingDown, Calendar, Award, Star, Zap, Crown } from "lucide-react"

const allAchievements = [
  {
    id: "first_expense",
    name: "First Step",
    description: "Log your first expense",
    icon: Target,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    requirement: 1,
    type: "expenses",
  },
  {
    id: "expense_tracker",
    name: "Expense Tracker",
    description: "Log 10 expenses",
    icon: TrendingDown,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    requirement: 10,
    type: "expenses",
  },
  {
    id: "expense_master",
    name: "Expense Master",
    description: "Log 50 expenses",
    icon: Award,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    requirement: 50,
    type: "expenses",
  },
  {
    id: "budget_setter",
    name: "Budget Setter",
    description: "Create your first budget",
    icon: PiggyBank,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    requirement: 1,
    type: "budgets",
  },
  {
    id: "budget_pro",
    name: "Budget Pro",
    description: "Create 5 budgets",
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    requirement: 5,
    type: "budgets",
  },
  {
    id: "income_starter",
    name: "Income Starter",
    description: "Log your first income",
    icon: Star,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    requirement: 1,
    type: "income",
  },
  {
    id: "streak_3",
    name: "Consistent",
    description: "Maintain a 3-day spending streak",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    requirement: 3,
    type: "streak",
  },
  {
    id: "streak_7",
    name: "On Fire",
    description: "Maintain a 7-day spending streak",
    icon: Zap,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    requirement: 7,
    type: "streak",
  },
  {
    id: "streak_30",
    name: "Unstoppable",
    description: "Maintain a 30-day spending streak",
    icon: Trophy,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    requirement: 30,
    type: "streak",
  },
  {
    id: "month_complete",
    name: "Month Master",
    description: "Complete a full month under budget",
    icon: Calendar,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    requirement: 1,
    type: "month",
  },
]

async function getAchievementsData() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get counts for achievements
  const [expensesResult, budgetsResult, incomeResult, statsResult] = await Promise.all([
    supabase.from("expenses").select("id", { count: "exact" }).eq("user_id", user.id),
    supabase.from("budgets").select("id", { count: "exact" }).eq("user_id", user.id),
    supabase.from("income").select("id", { count: "exact" }).eq("user_id", user.id),
    supabase.from("user_stats").select("*").eq("user_id", user.id).maybeSingle(),
  ])

  const expenseCount = expensesResult.count || 0
  const budgetCount = budgetsResult.count || 0
  const incomeCount = incomeResult.count || 0
  const currentStreak = statsResult.data?.current_streak || 0
  const longestStreak = statsResult.data?.longest_streak || 0

  // Calculate unlocked achievements
  const achievements = allAchievements.map((achievement) => {
    let progress = 0
    let unlocked = false

    switch (achievement.type) {
      case "expenses":
        progress = Math.min(expenseCount, achievement.requirement)
        unlocked = expenseCount >= achievement.requirement
        break
      case "budgets":
        progress = Math.min(budgetCount, achievement.requirement)
        unlocked = budgetCount >= achievement.requirement
        break
      case "income":
        progress = Math.min(incomeCount, achievement.requirement)
        unlocked = incomeCount >= achievement.requirement
        break
      case "streak":
        progress = Math.min(longestStreak, achievement.requirement)
        unlocked = longestStreak >= achievement.requirement
        break
      default:
        progress = 0
    }

    return {
      ...achievement,
      progress,
      unlocked,
    }
  })

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return {
    achievements,
    unlockedCount,
    totalCount: achievements.length,
    currentStreak,
    longestStreak,
  }
}

export default async function AchievementsPage() {
  const { achievements, unlockedCount, totalCount, currentStreak, longestStreak } = await getAchievementsData()

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Track your progress and earn rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {unlockedCount}/{totalCount}
                </p>
                <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentStreak}</p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{longestStreak}</p>
                <p className="text-sm text-muted-foreground">Longest Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            const progressPercent = (achievement.progress / achievement.requirement) * 100

            return (
              <div
                key={achievement.id}
                className={`rounded-xl border bg-card p-5 transition-all ${
                  achievement.unlocked ? "ring-2 ring-amber-500/50" : "opacity-75"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      achievement.unlocked ? achievement.bgColor : "bg-muted"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${achievement.unlocked ? achievement.color : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{achievement.name}</h3>
                      {achievement.unlocked && (
                        <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full">
                          Unlocked
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {achievement.progress}/{achievement.requirement}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            achievement.unlocked ? "bg-amber-500" : "bg-muted-foreground/30"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardShell>
  )
}
