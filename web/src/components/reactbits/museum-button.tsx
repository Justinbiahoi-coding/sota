"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface MuseumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string
  variant?: "primary" | "outline" | "ghost" | "shine"
  size?: "sm" | "md" | "lg"
  icon?: boolean
  children: React.ReactNode
  className?: string
}

export function MuseumButton({
  href,
  variant = "primary",
  size = "md",
  icon = false,
  children,
  className,
  ...props
}: MuseumButtonProps) {
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  const baseStyles =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-wider uppercase transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50"

  const sizeStyles = {
    sm: "px-4 py-1.5 text-[0.68rem]",
    md: "px-6 py-2.5 text-xs",
    lg: "px-8 py-3.5 text-sm",
  }

  const variantStyles = {
    primary:
      "bg-foreground text-background shadow-sm hover:bg-foreground/90 hover:shadow-md",
    outline:
      "border border-foreground/25 bg-background/60 backdrop-blur-sm text-foreground hover:border-foreground hover:bg-foreground hover:text-background",
    ghost:
      "bg-transparent text-foreground hover:bg-muted/70",
    shine:
      "border border-foreground/20 bg-foreground text-background shadow-sm hover:shadow-lg",
  }

  const content = (
    <>
      {/* Shine reflection effect on hover */}
      <span
        className="pointer-events-none absolute -inset-full rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isHovered
            ? `radial-gradient(120px circle at ${coords.x}px ${coords.y}px, rgba(255,255,255,0.25), transparent 70%)`
            : "none",
        }}
        aria-hidden="true"
      />

      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {icon && (
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </span>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {content}
    </button>
  )
}

