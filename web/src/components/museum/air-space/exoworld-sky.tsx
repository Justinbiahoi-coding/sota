"use client"

import { useEffect, useRef } from "react"

export function ExoworldSky({ lit = false }: { lit?: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const element = canvas.current
    const context = element?.getContext("2d")
    if (!element || !context) return

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let stars: { x: number; y: number; r: number; phase: number; opacity: number }[] = []
    let width = 0
    let height = 0
    let frame = 0
    let visible = false

    function draw(time: number) {
      if (!context) return
      context.clearRect(0, 0, width, height)
      for (const star of stars) {
        const alpha = motion.matches ? star.opacity : star.opacity * (.76 + .24 * Math.sin(time * .0015 + star.phase))
        context.fillStyle = (lit ? "rgba(43, 80, 109," : "rgba(249, 221, 163,") + alpha + ")"
        context.beginPath()
        context.arc(star.x, star.y, star.r, 0, Math.PI * 2)
        context.fill()
      }
      if (visible && !motion.matches && !document.hidden) frame = requestAnimationFrame(draw)
    }

    function refresh() {
      cancelAnimationFrame(frame)
      draw(0)
    }

    function resize() {
      if (!element || !context) return
      width = element.clientWidth
      height = element.clientHeight
      const dpr = Math.min(devicePixelRatio, 1.5)
      element.width = Math.floor(width * dpr)
      element.height = Math.floor(height * dpr)
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.min(155, Math.round(width * height / 6600))
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: .25 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        opacity: .18 + Math.random() * .5,
      }))
      refresh()
    }

    const sizing = new ResizeObserver(resize)
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      refresh()
    })
    sizing.observe(element)
    visibility.observe(element)
    motion.addEventListener("change", refresh)
    document.addEventListener("visibilitychange", refresh)

    return () => {
      sizing.disconnect()
      visibility.disconnect()
      motion.removeEventListener("change", refresh)
      document.removeEventListener("visibilitychange", refresh)
      cancelAnimationFrame(frame)
    }
  }, [lit])

  return <canvas ref={canvas} className="air-stars" aria-hidden="true" />
}
