"use client"

import { cn } from "@/lib/utils"

interface ShinyTextProps {
  text: string
  disabled?: boolean
  speed?: number
  className?: string
}

export function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = "",
}: ShinyTextProps) {
  const animationDuration = `${speed}s`

  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent font-medium",
        disabled
          ? "text-muted-foreground"
          : "animate-shiny bg-[linear-gradient(110deg,#6b7280,45%,#ffffff,55%,#6b7280)] [background-size:200%_100%]",
        className
      )}
      style={{
        animationDuration,
      }}
    >
      {text}
    </span>
  )
}

