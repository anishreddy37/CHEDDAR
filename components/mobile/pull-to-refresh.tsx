"use client"

import type React from "react"

import { useState, useRef, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PullToRefreshProps {
  children: ReactNode
  onRefresh?: () => Promise<void>
}

export function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const router = useRouter()

  const THRESHOLD = 80

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (startY.current === 0 || isRefreshing) return

      const currentY = e.touches[0].clientY
      const diff = currentY - startY.current

      if (diff > 0 && window.scrollY === 0) {
        setPullDistance(Math.min(diff * 0.5, THRESHOLD + 20))
      }
    },
    [isRefreshing],
  )

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(THRESHOLD)

      if (onRefresh) {
        await onRefresh()
      } else {
        router.refresh()
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      setIsRefreshing(false)
    }

    setPullDistance(0)
    startY.current = 0
  }, [pullDistance, isRefreshing, onRefresh, router])

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen"
    >
      {/* Pull indicator */}
      <div
        className={cn(
          "flex items-center justify-center overflow-hidden transition-all duration-200",
          pullDistance > 0 ? "opacity-100" : "opacity-0",
        )}
        style={{ height: pullDistance }}
      >
        <Loader2
          className={cn(
            "h-6 w-6 text-primary transition-transform",
            isRefreshing && "animate-spin",
            pullDistance >= THRESHOLD && !isRefreshing && "scale-110",
          )}
        />
      </div>

      {children}
    </div>
  )
}
