"use client"

import React, { useRef, useState } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface TiltedCardProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  tiltMaxAngleX?: number
  tiltMaxAngleY?: number
  scale?: number
  frameless?: boolean
}

export function TiltedCard({
  children,
  className,
  containerClassName,
  tiltMaxAngleX = 10,
  tiltMaxAngleY = 10,
  scale = 1,
  frameless = false,
}: TiltedCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Critically damped spring physics for buttery-smooth glide with ZERO jitter or snap
  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 24, mass: 0.5 })
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 24, mass: 0.5 })

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [tiltMaxAngleX, -tiltMaxAngleX])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-tiltMaxAngleY, tiltMaxAngleY])
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"])
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    if (width === 0 || height === 0) return
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const xPct = Math.max(-0.5, Math.min(0.5, mouseX / width - 0.5))
    const yPct = Math.max(-0.5, Math.min(0.5, mouseY / height - 0.5))
    x.set(xPct)
    y.set(yPct)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    // Smooth glide back to flat resting position with no oscillation
    x.set(0)
    y.set(0)
  }

  return (
    <div
      ref={ref}
      className={cn("perspective-1000 select-none", containerClassName)}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        className={cn(
          "relative h-full w-full overflow-hidden transition-all duration-300",
          frameless
            ? "bg-transparent border-none shadow-none rounded-2xl"
            : "rounded-xl border border-stone-200/90 bg-card shadow-[0_4px_16px_-3px_rgba(0,0,0,0.05)] hover:border-[#d4af37]/70 hover:shadow-[0_24px_50px_-10px_rgba(10,28,54,0.18)]",
          className
        )}
      >
        {/* Dynamic glare sheen that follows mouse angle, fades smoothly */}
        <motion.div
          className="pointer-events-none absolute -inset-full z-20 transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle at center, rgba(255, 236, 179, 0.35) 0%, rgba(212, 175, 55, 0.1) 35%, transparent 70%)",
            top: glareY,
            left: glareX,
            opacity: isHovered ? 0.35 : 0,
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 h-full w-full transform-gpu" style={{ transform: "translateZ(10px)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
