import {
  ShoppingBag,
  Utensils,
  Car,
  Home,
  Zap,
  Heart,
  Gamepad2,
  GraduationCap,
  Plane,
  MoreHorizontal,
  Briefcase,
  Gift,
  TrendingUp,
  type LucideIcon,
} from "lucide-react"

export interface Category {
  id: string
  name: string
  icon: LucideIcon
  color: string
}

export const expenseCategories: Category[] = [
  { id: "food", name: "Food & Dining", icon: Utensils, color: "text-orange-500" },
  { id: "shopping", name: "Shopping", icon: ShoppingBag, color: "text-pink-500" },
  { id: "transport", name: "Transportation", icon: Car, color: "text-blue-500" },
  { id: "housing", name: "Housing", icon: Home, color: "text-green-500" },
  { id: "utilities", name: "Utilities", icon: Zap, color: "text-yellow-500" },
  { id: "healthcare", name: "Healthcare", icon: Heart, color: "text-red-500" },
  { id: "entertainment", name: "Entertainment", icon: Gamepad2, color: "text-purple-500" },
  { id: "education", name: "Education", icon: GraduationCap, color: "text-indigo-500" },
  { id: "travel", name: "Travel", icon: Plane, color: "text-cyan-500" },
  { id: "other", name: "Other", icon: MoreHorizontal, color: "text-gray-500" },
]

export const incomeCategories: Category[] = [
  { id: "salary", name: "Salary", icon: Briefcase, color: "text-green-500" },
  { id: "freelance", name: "Freelance", icon: TrendingUp, color: "text-blue-500" },
  { id: "investment", name: "Investment", icon: TrendingUp, color: "text-purple-500" },
  { id: "gift", name: "Gift", icon: Gift, color: "text-pink-500" },
  { id: "other", name: "Other", icon: MoreHorizontal, color: "text-gray-500" },
]

export function getCategoryById(id: string, type: "expense" | "income" = "expense"): Category | undefined {
  const categories = type === "expense" ? expenseCategories : incomeCategories
  return categories.find((c) => c.id === id)
}
