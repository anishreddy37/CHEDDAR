interface HealthScoreInput {
  totalIncome: number
  totalExpenses: number
  budgets: { budget: number; spent: number }[]
  currentStreak: number
  savingsGoalsProgress: number // 0-100
}

export function calculateHealthScore(input: HealthScoreInput): number {
  const { totalIncome, totalExpenses, budgets, currentStreak, savingsGoalsProgress } = input

  let score = 50 // Base score

  // Income vs Expenses ratio (max 25 points)
  if (totalIncome > 0) {
    const savingsRate = (totalIncome - totalExpenses) / totalIncome
    if (savingsRate >= 0.3) score += 25
    else if (savingsRate >= 0.2) score += 20
    else if (savingsRate >= 0.1) score += 15
    else if (savingsRate >= 0) score += 10
    else score -= 10 // Spending more than earning
  }

  // Budget adherence (max 20 points)
  if (budgets.length > 0) {
    const budgetsOnTrack = budgets.filter((b) => b.spent <= b.budget).length
    const adherenceRate = budgetsOnTrack / budgets.length
    score += Math.round(adherenceRate * 20)
  }

  // Spending streak bonus (max 15 points)
  if (currentStreak >= 30) score += 15
  else if (currentStreak >= 14) score += 10
  else if (currentStreak >= 7) score += 5

  // Savings goals progress (max 10 points)
  score += Math.round((savingsGoalsProgress / 100) * 10)

  // Cap between 0 and 100
  return Math.max(0, Math.min(100, score))
}
