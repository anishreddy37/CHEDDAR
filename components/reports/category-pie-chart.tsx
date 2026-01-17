"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { getCategoryById, expenseCategories } from "@/lib/categories"
import { formatCurrency } from "@/lib/utils/format"

interface CategoryPieChartProps {
  categoryTotals: Record<string, number>
  currency: string
}

const COLORS = [
  "#f97316", // orange
  "#ec4899", // pink
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
  "#ef4444", // red
  "#a855f7", // purple
  "#6366f1", // indigo
  "#06b6d4", // cyan
  "#6b7280", // gray
]

export function CategoryPieChart({ categoryTotals, currency }: CategoryPieChartProps) {
  const data = Object.entries(categoryTotals)
    .map(([categoryId, amount]) => {
      const category = getCategoryById(categoryId)
      return {
        name: category?.name || "Other",
        value: amount,
        categoryId,
      }
    })
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p className="text-muted-foreground">No expense data to display</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{payload[0].name}</p>
          <p className="text-muted-foreground">{formatCurrency(payload[0].value, currency)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => {
              const categoryIndex = expenseCategories.findIndex((c) => c.id === entry.categoryId)
              return <Cell key={`cell-${index}`} fill={COLORS[categoryIndex !== -1 ? categoryIndex : 9]} />
            })}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
