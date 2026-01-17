"use client"

import { Flame, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface SpendingStreakProps {
  currentStreak: number
  longestStreak: number
}

export function SpendingStreak({ currentStreak, longestStreak }: SpendingStreakProps) {
  const isOnFire = currentStreak >= 7

  return (
    <div className="p-6 rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Flame className={cn("h-5 w-5", isOnFire ? "text-orange-400" : "text-muted-foreground")} />
        <h3 className="font-heading font-semibold text-foreground">Spending Streak</h3>
      </div>

      <div className="flex items-end gap-4">
        <div className="flex-1">
          <div className={cn("text-5xl font-heading font-bold", isOnFire ? "text-orange-400" : "text-primary")}>
            {currentStreak}
          </div>
          <p className="text-sm text-muted-foreground">days under budget</p>
        </div>

        {isOnFire && (
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
            <Zap className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-medium text-orange-400">On Fire!</span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Best streak</span>
          <span className="font-medium text-foreground">{longestStreak} days</span>
        </div>
      </div>
    </div>
  )
}
