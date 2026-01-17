import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCategoryById, expenseCategories } from "@/lib/categories"
import { formatCurrency } from "@/lib/utils/format"
import { Progress } from "@/components/ui/progress"

interface CategoryBreakdownProps {
  categoryTotals: Record<string, number>
  currency: string
  total: number
}

export function CategoryBreakdown({ categoryTotals, currency, total }: CategoryBreakdownProps) {
  const sortedCategories = Object.entries(categoryTotals)
    .map(([categoryId, amount]) => {
      const category = getCategoryById(categoryId)
      const percentage = total > 0 ? (amount / total) * 100 : 0
      return {
        categoryId,
        name: category?.name || "Other",
        amount,
        percentage,
        icon: category?.icon || expenseCategories[9].icon,
        color: category?.color || "text-gray-500",
      }
    })
    .sort((a, b) => b.amount - a.amount)

  if (sortedCategories.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No expense data to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Category Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCategories.map((category) => (
            <div key={category.categoryId} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full bg-muted flex items-center justify-center ${category.color}`}>
                    <category.icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium text-foreground">{category.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatCurrency(category.amount, currency)}</p>
                  <p className="text-sm text-muted-foreground">{category.percentage.toFixed(1)}%</p>
                </div>
              </div>
              <Progress value={category.percentage} className="h-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
