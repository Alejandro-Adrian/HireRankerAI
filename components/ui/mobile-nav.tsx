"use client"
import { useState } from "react"
import type React from "react"

import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  children: React.ReactNode
  trigger?: React.ReactNode
  className?: string
}

export function MobileNav({ children, trigger, className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile menu trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "lg:hidden p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200",
          className,
        )}
      >
        {trigger || <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm glass-card border-l border-emerald-200/20 dark:border-emerald-800/20">
            <div className="flex items-center justify-between p-4 border-b border-emerald-200/20 dark:border-emerald-800/20">
              <h2 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">{children}</div>
          </div>
        </div>
      )}
    </>
  )
}
