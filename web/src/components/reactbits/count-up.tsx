"use client"

import React, { useEffect, useState, useRef } from "react"

interface CountUpProps {
  to: number
  from?: number
  duration?: number
  separator?: string
  className?: string
  suffix?: string
  prefix?: string
}

export function CountUp({
  to,
  from = 0,
  duration = 2,
  separator = ",",
  className = "",
  suffix = "",
  prefix = "",
}: CountUpProps) {
  const [count, setCount] = useState(from)
  const nodeRef = useRef<HTMLSpanElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          let startTime: number | null = null

          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
            const easeOutQuad = 1 - (1 - progress) * (1 - progress)
            setCount(Math.floor(easeOutQuad * (to - from) + from))

            if (progress < 1) {
              requestAnimationFrame(step)
            } else {
              setCount(to)
            }
          }

          requestAnimationFrame(step)
        }
      },
      { threshold: 0.1 }
    )

    if (nodeRef.current) {
      observer.observe(nodeRef.current)
    }

    return () => observer.disconnect()
  }, [to, from, duration])

  const formatted = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)

  return (
    <span ref={nodeRef} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}

