"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"

interface DecryptedTextProps {
  text: string
  speed?: number
  maxIterations?: number
  characters?: string
  className?: string
  animateOn?: "view" | "hover"
}

export function DecryptedText({
  text,
  speed = 35,
  maxIterations = 10,
  characters = "✦§‡✧ABCDEFGHJKLMNPQRSTUVWXYZ0123456789",
  className = "",
  animateOn = "view",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const isAnimatingRef = useRef(false)

  const triggerAnimation = useCallback(() => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true

    let iteration = 0
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " "
            if (index < iteration) {
              return text[index]
            }
            return characters[Math.floor(Math.random() * characters.length)]
          })
          .join("")
      )

      if (iteration >= text.length) {
        clearInterval(interval)
        setDisplayText(text)
        isAnimatingRef.current = false
      }

      iteration += 1 / (maxIterations / text.length || 1)
    }, speed)
  }, [characters, maxIterations, speed, text])

  useEffect(() => {
    // Luôn kích hoạt animation khi mount hoặc khi text đổi
    if (animateOn === "view") {
      const timeout = setTimeout(() => {
        triggerAnimation()
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [animateOn, triggerAnimation, text])

  return (
    <span
      onMouseEnter={animateOn === "hover" ? triggerAnimation : undefined}
      className={className}
    >
      {displayText}
    </span>
  )
}
