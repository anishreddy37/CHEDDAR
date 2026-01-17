"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface MobileHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  rightAction?: ReactNode
  className?: string
}

export function MobileHeader({ title, subtitle, showBack = false, rightAction, className }: MobileHeaderProps) {
  const router = useRouter()

  return (
    <header className={cn("sticky top-0 z-40 -mx-4 px-4 py-3 glass", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 tap-highlight rounded-full hover:bg-muted"
              aria-label="Go back"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-heading font-bold text-foreground leading-tight">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  )
}
