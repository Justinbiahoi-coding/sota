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

interface TrailParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  color: string
  decay: number
  isStar: boolean
  rotation: number
}

export function GalleryBackground() {
  const pathname = usePathname()
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)
  const topCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return
    const bgCanvas = bgCanvasRef.current
    const topCanvas = topCanvasRef.current
    if (!bgCanvas || !topCanvas) return

    const bgCtx = bgCanvas.getContext("2d")
    const topCtx = topCanvas.getContext("2d")
    if (!bgCtx || !topCtx) return

    let animationFrameId: number
    let width = (bgCanvas.width = topCanvas.width = window.innerWidth)
    let height = (bgCanvas.height = topCanvas.height = window.innerHeight)

    const handleResize = () => {
      if (!bgCanvas || !topCanvas) return
      width = bgCanvas.width = topCanvas.width = window.innerWidth
      height = bgCanvas.height = topCanvas.height = window.innerHeight
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

    // Danh sách hạt bụi sao vệt chuột (Golden Stardust Trail)
    let trailParticles: TrailParticle[] = []

    let mouseX = -9999
    let mouseY = -9999
    let targetMouseX = -9999
    let targetMouseY = -9999
    let lastSpawnX = -9999
    let lastSpawnY = -9999
    let isMouseActive = false

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseActive) {
        mouseX = targetMouseX = e.clientX
        mouseY = targetMouseY = e.clientY
        lastSpawnX = e.clientX
        lastSpawnY = e.clientY
        isMouseActive = true
      } else {
        targetMouseX = e.clientX
        targetMouseY = e.clientY
      }

      const distSinceLast = Math.hypot(e.clientX - lastSpawnX, e.clientY - lastSpawnY)

      // Khi chuột di chuyển, sinh ra vệt bụi sao hoàng kim lấp lánh (Stardust trail)
      if (distSinceLast > 6) {
        lastSpawnX = e.clientX
        lastSpawnY = e.clientY

        const countToSpawn = Math.min(4, Math.max(1, Math.floor(distSinceLast / 11)))
        for (let k = 0; k < countToSpawn; k++) {
          trailParticles.push({
            x: e.clientX + (Math.random() - 0.5) * 12,
            y: e.clientY + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -0.2 - Math.random() * 0.9,
            size: 1.8 + Math.random() * 3.8,
            alpha: 0.95,
            color: goldColors[Math.floor(Math.random() * goldColors.length)],
            decay: 0.024 + Math.random() * 0.03,
            isStar: Math.random() > 0.4,
            rotation: Math.random() * Math.PI,
          })
        }
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

      // Xóa khung vẽ trên cả 2 tầng
      bgCtx.clearRect(0, 0, width, height)
      topCtx.clearRect(0, 0, width, height)

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

      // =========================================================================
      // TẦNG 2: FOREGROUND HOVER (z-[60]) - NẰM ĐÈ LÊN TRÊN TẤT CẢ CÁC CARDS
      // =========================================================================

      // 1. Quầng sáng hoàng kim trong trẻo bám theo chuột (Radiant Clear Gold Spotlight)
      // Nằm đè lên trên bề mặt các thẻ, tôn vinh tác phẩm và không làm đục màu
      if (isMouseActive && mouseX > -100 && mouseX < width + 100) {
        const cursorGlow = topCtx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 280)
        cursorGlow.addColorStop(0, "rgba(255, 215, 0, 0.15)")
        cursorGlow.addColorStop(0.35, "rgba(212, 175, 55, 0.05)")
        cursorGlow.addColorStop(1, "rgba(212, 175, 55, 0)")
        topCtx.fillStyle = cursorGlow
        topCtx.fillRect(0, 0, width, height)
      }

      // 2. Render vệt bụi sao và ngôi sao 4 cánh lướt trực tiếp TRÊN MẶT CÁC THẺ
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const tp = trailParticles[i]
        tp.x += tp.vx
        tp.y += tp.vy
        tp.alpha -= tp.decay
        tp.rotation += 0.04

        if (tp.alpha <= 0) {
          trailParticles.splice(i, 1)
          continue
        }

        topCtx.save()
        topCtx.translate(tp.x, tp.y)
        topCtx.rotate(tp.rotation)
        topCtx.fillStyle = `rgba(${tp.color}, ${tp.alpha})`
        topCtx.shadowColor = `rgba(${tp.color}, 0.85)`
        topCtx.shadowBlur = tp.size > 2.5 ? 10 : 5

        if (tp.isStar) {
          // Ngôi sao 4 cánh hoàng kim lấp lánh (Sparkling 4-point diamond star)
          const s = tp.size * 1.55
          topCtx.beginPath()
          topCtx.moveTo(0, -s)
          topCtx.quadraticCurveTo(0, 0, s, 0)
          topCtx.quadraticCurveTo(0, 0, 0, s)
          topCtx.quadraticCurveTo(0, 0, -s, 0)
          topCtx.quadraticCurveTo(0, 0, 0, -s)
          topCtx.fill()
        } else {
          topCtx.beginPath()
          topCtx.arc(0, 0, tp.size, 0, Math.PI * 2)
          topCtx.fill()
        }
        topCtx.restore()
      }

      // Giới hạn số lượng hạt trail tối đa để đảm bảo 60fps mượt mà
      if (trailParticles.length > 90) {
        trailParticles = trailParticles.slice(-90)
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
    <>
      {/* Canvas tầng nền (z-0): Hạt bụi vàng & mạng lưới chòm sao sau các thẻ */}
      <canvas
        ref={bgCanvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90"
        aria-hidden="true"
      />
      {/* Canvas tầng nổi (z-[60]): Vệt sao chuột & vầng hào quang NẰM ĐÈ LÊN TRÊN TẤT CẢ CÁC THẺ */}
      <canvas
        ref={topCanvasRef}
        className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
        aria-hidden="true"
      />
    </>
  )
}
