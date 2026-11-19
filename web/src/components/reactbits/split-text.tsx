"use client"

import React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SplitTextProps {
  text: string
  className?: string
  delay?: number
  stagger?: number
  by?: "words" | "chars"
}

export function SplitText({
  text,
  className = "",
  delay = 0.04,
  stagger = 0.035,
  by = "words",
}: SplitTextProps) {
  const items = by === "words" ? text.split(" ") : text.split("")

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  }

  const child = {
    hidden: {
      opacity: 0,
      y: 20,
      rotateX: -15,
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring" as const,
        damping: 14,
        stiffness: 180,
      },
    },
  }

  return (
    <motion.span
      key={text}
      variants={container}
      initial="hidden"
      animate="visible"
      className={cn("flex w-full max-w-full flex-wrap items-baseline gap-x-[0.25em]", className)}
      style={{ perspective: 600 }}
    >
      {items.map((item, index) => (
        <motion.span
          key={`${item}-${index}`}
          variants={child}
          className="inline-block transform-gpu will-change-transform"
        >
          {item}
        </motion.span>
      ))}
    </motion.span>
  )
}
