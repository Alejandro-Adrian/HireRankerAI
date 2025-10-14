"use client"
import { useState, useRef } from "react"
import type React from "react"

import { cn } from "@/lib/utils"

interface TouchFeedbackProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
  rippleColor?: string
}

export function TouchFeedback({
  children,
  className,
  disabled = false,
  rippleColor = "rgba(16, 185, 129, 0.3)",
}: TouchFeedbackProps) {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const createRipple = (event: React.TouchStart | React.MouseEvent) => {
    if (disabled || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const x = ("touches" in event ? event.touches[0].clientX : event.clientX) - rect.left
    const y = ("touches" in event ? event.touches[0].clientY : event.clientY) - rect.top

    const newRipple = {
      id: Date.now(),
      x,
      y,
    }

    setRipples((prev) => [...prev, newRipple])

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id))
    }, 600)
  }

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onTouchStart={createRipple}
      onMouseDown={createRipple}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute pointer-events-none animate-ripple"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: rippleColor,
            borderRadius: "50%",
            transform: "scale(0)",
            animation: "ripple 0.6s linear",
          }}
        />
      ))}
    </div>
  )
}
