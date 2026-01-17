"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react"

interface HealthScoreProps {
  score: number
  previousScore?: number
}

export function HealthScore({ score, previousScore }: HealthScoreProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-emerald-400"
    if (s >= 60) return "text-primary"
    if (s >= 40) return "text-accent"
    return "text-destructive"
  }

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Excellent"
    if (s >= 60) return "Good"
    if (s >= 40) return "Fair"
    return "Needs Work"
  }

  const getGradient = (s: number) => {
    if (s >= 80) return "from-emerald-500/20 to-emerald-500/5"
    if (s >= 60) return "from-primary/20 to-primary/5"
    if (s >= 40) return "from-accent/20 to-accent/5"
    return "from-destructive/20 to-destructive/5"
  }

  const diff = previousScore ? score - previousScore : 0
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={cn("relative p-6 rounded-2xl border border-border bg-gradient-to-br", getGradient(score))}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h3 className="font-heading font-semibold text-foreground">Financial Health</h3>
        </div>
        {diff !== 0 && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
              diff > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive",
            )}
          >
            {diff > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(diff)} pts
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Circular Progress */}
        <div className="relative">
          <svg className="w-28 h-28 -rotate-90">
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/30"
            />
            <circle
              cx="56"
              cy="56"
              r="45"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={getScoreColor(score)}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: "stroke-dashoffset 1s ease-out",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-heading font-bold", getScoreColor(score))}>{score}</span>
          </div>
        </div>

        <div className="flex-1">
          <p className={cn("text-lg font-semibold", getScoreColor(score))}>{getScoreLabel(score)}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {score >= 80 && "You're crushing it! Keep up the great work."}
            {score >= 60 && score < 80 && "You're on track. A few tweaks could boost your score."}
            {score >= 40 && score < 60 && "Room for improvement. Focus on budgeting."}
            {score < 40 && "Let's work on building better habits together."}
          </p>
        </div>
      </div>
    </div>
  )
}
