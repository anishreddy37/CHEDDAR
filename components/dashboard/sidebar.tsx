"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Receipt, BarChart3, Settings, LogOut, Target, Trophy, Wallet, PiggyBank, Send } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/income", label: "Income", icon: Wallet },
  { href: "/payments", label: "Pay via UPI", icon: Send },
  { href: "/budgets", label: "Budgets", icon: Target },
  { href: "/goals", label: "Savings Goals", icon: PiggyBank },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push("/auth/login")
      router.refresh()
    } catch (error) {
      console.error("[v0] Logout error:", error)
      // Redirect to login even if logout fails
      router.push("/auth/login")
      router.refresh()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-40 flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center glow-primary">
            <span className="text-xl font-bold text-primary-foreground">₿</span>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-heading font-bold text-sidebar-foreground">Finzy</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Pay & Track</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          disabled={isLoggingOut}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          {isLoggingOut ? "Signing out..." : "Logout"}
        </Button>
      </div>
    </aside>
  )
}
