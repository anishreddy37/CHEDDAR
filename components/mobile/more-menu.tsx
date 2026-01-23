"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Wallet, Target, Trophy, Settings, LogOut, ChevronRight, Send } from "lucide-react"
import { MobileHeader } from "./mobile-header"

const menuSections = [
  {
    title: "Finance",
    items: [
      { href: "/income", label: "Income", icon: Wallet, description: "Track your earnings" },
      { href: "/budgets", label: "Budgets", icon: Target, description: "Manage spending limits" },
      { href: "/payments", label: "UPI Payments", icon: Send, description: "Pay via UPI" },
      { href: "/achievements", label: "Achievements", icon: Trophy, description: "View your milestones" },
    ],
  },
  {
    title: "Account",
    items: [{ href: "/settings", label: "Settings", icon: Settings, description: "App preferences" }],
  },
]

export function MoreMenu() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <MobileHeader title="More" subtitle="Additional features & settings" />

      {menuSections.map((section) => (
        <div key={section.title} className="space-y-2">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">{section.title}</h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between p-4 tap-highlight hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Logout button */}
      <div className="pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl tap-highlight hover:bg-destructive/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {/* App version */}
      <p className="text-center text-xs text-muted-foreground pt-4">Finzy v1.0.0 - Pay & Track</p>
    </div>
  )
}
