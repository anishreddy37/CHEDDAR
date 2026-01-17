"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, RefreshCw, TrendingUp, TrendingDown, AlertTriangle, Lightbulb } from "lucide-react"

interface Expense {
  category: string
  amount: number
  date: string
}

interface AIInsightsProps {
  expenses: Expense[]
  income: number
  currency: string
}

function generateInsights(expenses: Expense[], income: number): string[] {
  const insights: string[] = []

  if (expenses.length === 0) {
    return ["Start tracking your expenses to get personalized insights!"]
  }

  // Calculate total spending
  const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0)

  // Spending by category
  const categorySpending: Record<string, number> = {}
  expenses.forEach((e) => {
    categorySpending[e.category] = (categorySpending[e.category] || 0) + e.amount
  })

  // Find highest spending category
  const sortedCategories = Object.entries(categorySpending).sort((a, b) => b[1] - a[1])
  if (sortedCategories.length > 0) {
    const [topCategory, topAmount] = sortedCategories[0]
    const percentage = Math.round((topAmount / totalSpending) * 100)
    insights.push(
      `Your highest spending category is ${topCategory} (${percentage}% of total). Consider setting a budget limit here.`,
    )
  }

  // Savings rate
  if (income > 0) {
    const savingsRate = Math.round(((income - totalSpending) / income) * 100)
    if (savingsRate >= 20) {
      insights.push(`Great job! You're saving ${savingsRate}% of your income. Keep up the good work!`)
    } else if (savingsRate >= 0) {
      insights.push(`Your savings rate is ${savingsRate}%. Financial experts recommend saving at least 20% of income.`)
    } else {
      insights.push(`Warning: You're spending more than you earn. Review your expenses to find areas to cut back.`)
    }
  }

  // Spending trend (compare first vs second half of expenses)
  if (expenses.length >= 4) {
    const midpoint = Math.floor(expenses.length / 2)
    const firstHalf = expenses.slice(0, midpoint).reduce((sum, e) => sum + e.amount, 0)
    const secondHalf = expenses.slice(midpoint).reduce((sum, e) => sum + e.amount, 0)

    if (secondHalf < firstHalf * 0.9) {
      insights.push("Your spending has decreased recently. You're trending in the right direction!")
    } else if (secondHalf > firstHalf * 1.1) {
      insights.push("Your spending has increased recently. Consider reviewing your recent purchases.")
    }
  }

  // Weekend vs weekday spending
  const weekendExpenses = expenses.filter((e) => {
    const day = new Date(e.date).getDay()
    return day === 0 || day === 6
  })
  const weekendTotal = weekendExpenses.reduce((sum, e) => sum + e.amount, 0)
  const weekendPercentage = Math.round((weekendTotal / totalSpending) * 100)

  if (weekendPercentage > 40) {
    insights.push(
      `${weekendPercentage}% of your spending happens on weekends. Planning activities in advance could help reduce impulse purchases.`,
    )
  }

  // Category diversity
  if (sortedCategories.length <= 2) {
    insights.push("Your expenses are concentrated in few categories. Make sure you're tracking all your spending!")
  }

  return insights.slice(0, 4)
}

export function AIInsights({ expenses, income, currency }: AIInsightsProps) {
  const [insights, setInsights] = useState(() => generateInsights(expenses, income))
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setInsights(generateInsights(expenses, income))
      setIsRefreshing(false)
    }, 500)
  }

  const getIcon = (insight: string) => {
    if (insight.toLowerCase().includes("great") || insight.toLowerCase().includes("good")) {
      return <TrendingUp className="h-5 w-5 text-green-500" />
    }
    if (insight.toLowerCase().includes("warning") || insight.toLowerCase().includes("increased")) {
      return <AlertTriangle className="h-5 w-5 text-amber-500" />
    }
    if (insight.toLowerCase().includes("decreased") || insight.toLowerCase().includes("saving")) {
      return <TrendingDown className="h-5 w-5 text-green-500" />
    }
    return <Lightbulb className="h-5 w-5 text-blue-500" />
  }

  return (
    <div className="rounded-xl border bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-violet-500" />
          </div>
          <h3 className="font-semibold">AI Insights</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8 p-0">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3 text-sm">
            {getIcon(insight)}
            <p className="text-muted-foreground leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
