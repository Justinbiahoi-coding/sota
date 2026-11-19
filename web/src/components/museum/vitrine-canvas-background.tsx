"use client"

import React, { useEffect, useRef } from "react"

interface DustMote {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  baseAlpha: number
  pulseSpeed: number
  color: string
}

export function VitrineCanvasBackground() {
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const bgCanvas = bgCanvasRef.current
    if (!bgCanvas) return

    const bgCtx = bgCanvas.getContext("2d")
    if (!bgCtx) return

    let animId: number
    const updateSize = () => {
      const parent = bgCanvas.parentElement
      const w = parent ? parent.clientWidth : window.innerWidth
      const h = parent ? parent.clientHeight : window.innerHeight
      bgCanvas.width = w
      bgCanvas.height = h
      return { w, h }
    }

    let { w: width, h: height } = updateSize()

    const handleResize = () => {
      const s = updateSize()
      width = s.w
      height = s.h
    }

    window.addEventListener("resize", handleResize)

    // Bảng màu vàng hoàng kim & hổ phách cung đình
    const goldPalette = [
      "255, 215, 0",   // Imperial gold (#ffd700)
      "245, 158, 11",  // Warm amber (#f59e0b)
      "212, 175, 55",  // Classical gold (#d4af37)
      "251, 227, 150", // Champagne luster (#fbe396)
    ]

    // Mật độ hạt nền chòm sao bảo tàng (Constellation Particles)
    const motesCount = Math.min(110, Math.max(50, Math.floor((width * height) / 11500)))
    const motes: DustMote[] = []
    for (let i = 0; i < motesCount; i++) {
      const baseAlpha = 0.28 + Math.random() * 0.45
      motes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.42,
        vy: -0.15 - Math.random() * 0.35,
        size: 1.3 + Math.random() * 3.2,
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: 1.2 + Math.random() * 2,
        color: goldPalette[Math.floor(Math.random() * goldPalette.length)],
      })
    }

    // Tọa độ chuột phục vụ hiệu ứng tương tác nền (Interactive Background Network)
    let mouseX = -9999
    let mouseY = -9999
    let targetMouseX = -9999
    let targetMouseY = -9999
    let isMouseInside = false

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = bgCanvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (x >= -40 && x <= rect.width + 40 && y >= -40 && y <= rect.height + 40) {
        if (!isMouseInside) {
          mouseX = targetMouseX = x
          mouseY = targetMouseY = y
          isMouseInside = true
        } else {
          targetMouseX = x
          targetMouseY = y
        }
      } else {
        isMouseInside = false
      }
    }

    const handleMouseLeave = () => {
      isMouseInside = false
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)

    let time = 0
    const render = () => {
      time += 0.016
      bgCtx.clearRect(0, 0, width, height)

      if (isMouseInside) {
        mouseX += (targetMouseX - mouseX) * 0.18
        mouseY += (targetMouseY - mouseY) * 0.18
      } else {
        mouseX += (-9999 - mouseX) * 0.1
        mouseY += (-9999 - mouseY) * 0.1
      }

      // =========================================================================
      // 1. MẠNG LƯỚI ĐƯỜNG NỐI CHÒM SAO HOÀNG KIM (CONSTELLATION NETWORK - ẢNH 1)
      // =========================================================================
      bgCtx.lineWidth = 0.75
      for (let i = 0; i < motes.length; i++) {
        // Nối các hạt với nhau khi khoảng cách < 125px
        for (let j = i + 1; j < motes.length; j++) {
          const dx = motes[i].x - motes[j].x
          const dy = motes[i].y - motes[j].y
          const dist = Math.hypot(dx, dy)

          if (dist < 125) {
            const alpha = (1 - dist / 125) * 0.3
            bgCtx.beginPath()
            bgCtx.moveTo(motes[i].x, motes[i].y)
            bgCtx.lineTo(motes[j].x, motes[j].y)
            bgCtx.strokeStyle = `rgba(212, 175, 55, ${alpha})`
            bgCtx.stroke()
          }
        }

        // =======================================================================
        // 2. HIỆU ỨNG TƯƠNG TÁC NỀN VỚI CHUỘT (EFFECT BG INTERACTIVE)
        // =======================================================================
        if (isMouseInside && mouseX > 0 && mouseY > 0) {
          const dmx = motes[i].x - mouseX
          const dmy = motes[i].y - mouseY
          const distMouse = Math.hypot(dmx, dmy)

          // Vẽ đường chỉ hoàng kim nối hạt gần chuột tới tâm con trỏ
          if (distMouse < 155) {
            const alpha = (1 - distMouse / 155) * 0.4
            bgCtx.beginPath()
            bgCtx.moveTo(motes[i].x, motes[i].y)
            bgCtx.lineTo(mouseX, mouseY)
            bgCtx.strokeStyle = `rgba(255, 215, 0, ${alpha})`
            bgCtx.stroke()
          }
        }
      }

      // =========================================================================
      // 3. VẬN HÀNH & HIỂN THỊ CÁC HẠT BỤI VÀNG BỒNG BỀNH (AMBIENT DUST MOTES)
      // =========================================================================
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i]

        // Bay bổng tự nhiên có nhịp thở sin
        m.x += m.vx + Math.sin(time + i) * 0.22
        m.y += m.vy

        // Tuần hoàn biên màn hình
        if (m.y < -15) m.y = height + 15
        if (m.y > height + 15) m.y = -15
        if (m.x < -15) m.x = width + 15
        if (m.x > width + 15) m.x = -15

        // Tương tác vật lý đẩy nhẹ khi chuột tới gần (Mouse Repulsion Physics)
        if (isMouseInside && mouseX > 0 && mouseY > 0) {
          const dmx = m.x - mouseX
          const dmy = m.y - mouseY
          const distMouse = Math.hypot(dmx, dmy)
          if (distMouse < 175 && distMouse > 0) {
            const force = (175 - distMouse) / 175
            m.x += (dmx / distMouse) * force * 1.8
            m.y += (dmy / distMouse) * force * 1.8
          }
        }

        // Vẽ hạt bụi hoàng kim phát sáng
        const pulsingAlpha = m.baseAlpha + Math.sin(time * m.pulseSpeed + i) * 0.2
        const actualAlpha = Math.max(0.12, Math.min(0.95, pulsingAlpha))

        bgCtx.beginPath()
        bgCtx.arc(m.x, m.y, m.size, 0, Math.PI * 2)
        bgCtx.fillStyle = `rgba(${m.color}, ${actualAlpha})`
        bgCtx.shadowColor = `rgba(${m.color}, 0.7)`
        bgCtx.shadowBlur = m.size > 2.2 ? 8 : 4
        bgCtx.fill()
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={bgCanvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
