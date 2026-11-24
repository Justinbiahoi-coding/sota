"use client"

import { useEffect, useRef } from "react"
import { usePathname } from "next/navigation"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  baseAlpha: number
  color: string
  pulseSpeed: number
}

export function GalleryBackground() {
  const pathname = usePathname()
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return
    const bgCanvas = bgCanvasRef.current
    if (!bgCanvas) return

    const bgCtx = bgCanvas.getContext("2d")
    if (!bgCtx) return

    let animationFrameId: number
    let width = (bgCanvas.width = window.innerWidth)
    let height = (bgCanvas.height = window.innerHeight)

    const handleResize = () => {
      if (!bgCanvas) return
      width = bgCanvas.width = window.innerWidth
      height = bgCanvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    // Bảng màu vàng hoàng kim trong trẻo (vivid brilliant gold palette)
    const goldColors = [
      "255, 215, 0",  // Brilliant Imperial Gold (#ffd700)
      "245, 158, 11", // Warm Sunlit Amber (#f59e0b)
      "212, 175, 55", // Classical Museum Gold (#d4af37)
      "251, 227, 150",// Champagne Luster (#fbe396)
    ]

    // Mật độ hạt nền (Gallery Ambient Dust)
    const particleCount = Math.min(110, Math.floor((width * height) / 11500))
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = 0.25 + Math.random() * 0.45
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: -0.2 - Math.random() * 0.35,
        size: 1.2 + Math.random() * 3.5,
        alpha: baseAlpha,
        baseAlpha,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        pulseSpeed: 1.5 + Math.random() * 2,
      })
    }

    let mouseX = -9999
    let mouseY = -9999
    let targetMouseX = -9999
    let targetMouseY = -9999
    let isMouseActive = false

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseActive) {
        mouseX = targetMouseX = e.clientX
        mouseY = targetMouseY = e.clientY
        isMouseActive = true
      } else {
        targetMouseX = e.clientX
        targetMouseY = e.clientY
      }
    }

    const handleMouseLeave = () => {
      isMouseActive = false
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)

    let time = 0

    const render = () => {
      time += 0.015

      bgCtx.clearRect(0, 0, width, height)

      if (isMouseActive) {
        mouseX += (targetMouseX - mouseX) * 0.16
        mouseY += (targetMouseY - mouseY) * 0.16
      }

      // =========================================================================
      // TẦNG 1: NỀN BACKGROUND (z-0) - Hạt bụi vàng & Chòm sao hoàng kim liên kết
      // =========================================================================

      // Mạng lưới chòm sao hoàng kim liên kết các hạt (Constellation Network)
      bgCtx.lineWidth = 0.65
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.hypot(dx, dy)

          if (dist < 95) {
            const alpha = (1 - dist / 95) * 0.2
            bgCtx.beginPath()
            bgCtx.moveTo(particles[i].x, particles[i].y)
            bgCtx.lineTo(particles[j].x, particles[j].y)
            bgCtx.strokeStyle = `rgba(212, 175, 55, ${alpha})`
            bgCtx.stroke()
          }
        }
      }

      // Hiệu ứng tương tác: đường chỉ hoàng kim nối hạt gần chuột tới con trỏ
      if (isMouseActive && mouseX > 0 && mouseY > 0) {
        for (let i = 0; i < particles.length; i++) {
          const dmx = particles[i].x - mouseX
          const dmy = particles[i].y - mouseY
          const distMouse = Math.hypot(dmx, dmy)
          if (distMouse < 135) {
            const alpha = (1 - distMouse / 135) * 0.25
            bgCtx.beginPath()
            bgCtx.moveTo(particles[i].x, particles[i].y)
            bgCtx.lineTo(mouseX, mouseY)
            bgCtx.strokeStyle = `rgba(255, 215, 0, ${alpha})`
            bgCtx.stroke()
          }
        }
      }

      // Render các hạt bụi vàng bay bổng tuần hoàn và phản ứng chuột
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        p.x += p.vx + Math.sin(time + i) * 0.2
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        // Phản ứng nhẹ nhàng khi chuột lướt qua trong nền
        if (isMouseActive) {
          const dx = p.x - mouseX
          const dy = p.y - mouseY
          const dist = Math.hypot(dx, dy)
          if (dist < 160 && dist > 0) {
            const force = (160 - dist) / 160
            p.x += (dx / dist) * force * 1.5
            p.y += (dy / dist) * force * 1.5
          }
        }

        p.alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed + i) * 0.15

        bgCtx.beginPath()
        bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        bgCtx.fillStyle = `rgba(${p.color}, ${Math.max(0.08, p.alpha)})`
        bgCtx.shadowColor = `rgba(${p.color}, 0.5)`
        bgCtx.shadowBlur = p.size > 2.5 ? 7 : 3
        bgCtx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [pathname])

  if (pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <canvas
      ref={bgCanvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
      aria-hidden="true"
    />
  )
}
