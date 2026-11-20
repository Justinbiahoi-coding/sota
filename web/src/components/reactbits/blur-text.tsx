"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface BlurTextProps {
  text: string
  className?: string
  delay?: number
  animateBy?: "words" | "letters"
  direction?: "top" | "bottom"
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
}

export function BlurText({
  text,
  className = "",
  delay = 0.035,
  animateBy = "words",
  direction = "bottom",
  as: Component = "span",
}: BlurTextProps) {
  const elements = animateBy === "words" ? text.split(" ") : text.split("")

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: delay,
      },
    },
  }

  const childVariants = {
    hidden: {
      filter: "blur(10px)",
      opacity: 0,
      y: direction === "bottom" ? 14 : -14,
    },
    visible: {
      filter: "blur(0px)",
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  }

  return (
    <Component className={cn("inline-block", className)}>
      <motion.span
        key={text}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="inline"
      >
        {elements.map((el, i) => (
          <motion.span
            key={`${el}-${i}`}
            variants={childVariants}
            className="inline-block"
            style={{ willChange: "filter, opacity, transform" }}
          >
            {el}
            {animateBy === "words" && i < elements.length - 1 ? "\u00A0" : ""}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  )
}
