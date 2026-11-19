"use client"

import React, { useRef, useState } from "react"
import { motion } from "framer-motion"

interface MagnetProps {
  children: React.ReactNode
  padding?: number
  disabled?: boolean
  magnetStrength?: number
  className?: string
}

export function Magnet({
  children,
  padding = 30,
  disabled = false,
  magnetStrength = 0.3,
  className = "",
}: MagnetProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const magnetRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !magnetRef.current) return

    const { left, top, width, height } = magnetRef.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2

    const distX = Math.abs(centerX - e.clientX)
    const distY = Math.abs(centerY - e.clientY)

    if (distX < width / 2 + padding && distY < height / 2 + padding) {
      setPosition({
        x: (e.clientX - centerX) * magnetStrength,
        y: (e.clientY - centerY) * magnetStrength,
      })
    } else {
      setPosition({ x: 0, y: 0 })
    }
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.div
      ref={magnetRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 200, damping: 18, mass: 0.1 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  )
}

