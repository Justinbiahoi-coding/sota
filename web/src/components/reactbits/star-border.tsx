"use client"

import React, { ElementType, ComponentPropsWithoutRef } from "react"
import { cn } from "@/lib/utils"

type StarBorderProps<T extends ElementType = "button"> = {
  as?: T
  className?: string
  color?: string
  speed?: string
  thickness?: number
  children?: React.ReactNode
} & ComponentPropsWithoutRef<T>

export function StarBorder<T extends ElementType = "button">({
  as,
  className = "",
  color = "#d4af37", // Imperial Museum Gold
  speed = "5s",
  thickness = 1.5,
  children,
  ...rest
}: StarBorderProps<T>) {
  const Component = as || "button"

  return (
    <Component
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full p-[1.5px] transition-transform duration-300 active:scale-95",
        className
      )}
      {...rest}
    >
      {/* Bottom Star Particle Orbit */}
      <div
        className="pointer-events-none absolute -bottom-3 -right-[150%] z-0 h-[200%] w-[300%] rounded-full opacity-80 animate-star-movement-bottom"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 45%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />

      {/* Top Star Particle Orbit */}
      <div
        className="pointer-events-none absolute -left-[150%] -top-3 z-0 h-[200%] w-[300%] rounded-full opacity-80 animate-star-movement-top"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 45%)`,
          animationDuration: speed,
        }}
        aria-hidden="true"
      />

      {/* Inner Content */}
      <div className="relative z-10 flex h-full w-full items-center justify-center rounded-full bg-[#0a1c36] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#f8f6f0] shadow-sm transition-colors hover:bg-[#0f284e]">
        {children}
      </div>
    </Component>
  )
}

