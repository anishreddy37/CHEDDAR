import type React from "react"
import { Sidebar } from "./sidebar"
import { BottomNav } from "@/components/mobile/bottom-nav"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="dark min-h-screen bg-background">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main content with bottom padding for mobile nav */}
      <main className="lg:ml-64 min-h-screen pb-20 lg:pb-0">
        <div className="p-4 lg:p-8 page-transition">{children}</div>
      </main>

      <BottomNav />
    </div>
  )
}
