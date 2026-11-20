"use client"

import React, { useRef, useState, useCallback } from "react"
import { cn } from "@/lib/utils"

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  spotlightColor?: string
  borderColor?: string
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(212, 175, 55, 0.34)", // Imperial Museum Gold
  borderColor = "rgba(212, 175, 55, 0.72)",
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group relative overflow-hidden rounded-xl border border-[#d4af37]/25 bg-card text-card-foreground shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#d4af37]/70 hover:shadow-[0_0_32px_-4px_rgba(212,175,55,0.45),0_22px_44px_-14px_rgba(8,22,43,0.16)]",
        className
      )}
      {...props}
    >
      {/* Dual-layer gold spotlight locked to the cursor */}
      <div
        className="pointer-events-none absolute -inset-px z-0 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(140px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(245, 214, 122, 0.55), transparent 68%), radial-gradient(380px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 74%)`
            : "none",
        }}
        aria-hidden="true"
      />

      {/* Hairline that brightens only beside the pointer */}
      <div
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          padding: "1.5px",
          background: isHovered
            ? `radial-gradient(210px circle at ${mousePosition.x}px ${mousePosition.y}px, ${borderColor}, rgba(212, 175, 55, 0.05) 68%)`
            : "transparent",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 h-full w-full">{children}</div>
    </div>
  )
}
