import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "income" | "expense"
}

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <Card className="bg-card border-border tap-highlight">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs lg:text-sm text-muted-foreground">{title}</p>
            <p
              className={cn(
                "text-xl lg:text-2xl font-bold",
                variant === "income" && "text-green-500",
                variant === "expense" && "text-red-500",
                variant === "default" && "text-foreground",
              )}
            >
              {value}
            </p>
            {trend && (
              <p className={cn("text-xs", trend.isPositive ? "text-green-500" : "text-red-500")}>
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}% from last month
              </p>
            )}
          </div>
          <div
            className={cn(
              "h-10 w-10 lg:h-12 lg:w-12 rounded-full flex items-center justify-center shrink-0",
              variant === "income" && "bg-green-500/10",
              variant === "expense" && "bg-red-500/10",
              variant === "default" && "bg-primary/10",
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 lg:h-6 lg:w-6",
                variant === "income" && "text-green-500",
                variant === "expense" && "text-red-500",
                variant === "default" && "text-primary",
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
