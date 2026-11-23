"use client"
import { useEffect, useRef } from "react"

// ─── Betta color presets (7 vivid metallic hues) ────────────────
const BC = [
  { body: "#c82828", fin: "#ff6060", accent: "#ff2040" },   // crimson red
  { body: "#2048c8", fin: "#7098ff", accent: "#4080ff" },   // royal blue
  { body: "#7820c0", fin: "#c070ff", accent: "#a040ff" },   // violet
  { body: "#18a890", fin: "#50f0d8", accent: "#20e8c0" },   // teal
  { body: "#b85818", fin: "#ff9050", accent: "#ff7030" },   // copper/flame
  { body: "#1ab040", fin: "#60ff80", accent: "#40ff60" },   // emerald
  { body: "#c82890", fin: "#ff70c8", accent: "#ff40a0" },   // fuchsia rose
]

interface Betta {
  x: number; y: number
  angle: number; targetAngle: number
  speed: number; baseSpeed: number
  L: number; ci: number
  ph: number; phSpd: number
  hue: number
  scared: boolean; scaredTick: number
  turnTick: number; nextTurn: number
}
interface Ripple { x: number; y: number; r: number; maxR: number; a: number }
interface Mote   { x: number; y: number; vx: number; vy: number; a: number }

function rand(a: number, b: number) { return a + Math.random() * (b - a) }

function makeBetta(W: number, H: number, i: number): Betta {
  const spd = rand(0.35, 0.72)
  return {
    x: rand(0, W), y: rand(0, H),
    angle: rand(0, Math.PI * 2), targetAngle: rand(0, Math.PI * 2),
    speed: spd, baseSpeed: spd,
    L: rand(70, 118),
    ci: i % BC.length,
    ph: rand(0, Math.PI * 2), phSpd: rand(0.9, 1.5),
    hue: rand(0, 360),
    scared: false, scaredTick: 0,
    turnTick: (rand(80, 220) | 0), nextTurn: (rand(90, 250) | 0),
  }
}

// ─── Draw one betta fish (translated+rotated, top-down artistic) ─
function drawBetta(ctx: CanvasRenderingContext2D, f: Betta, t: number) {
  const { L, ci, ph, hue } = f
  const c = BC[ci]
  const HW     = L * 0.19   // body half-width
  const hx     = L * 0.36   // head front X
  const bEnd   = -L * 0.28  // body-tail junction X
  const TAIL_L = L * 1.08   // veil tail length
  const SPREAD = L * 0.88   // max tail spread at tips
  const wag    = Math.sin(ph) * (f.scared ? 0.86 : 0.40)
  const wagFin = wag * HW
  const iridH  = (hue + t * 18) % 360

  ctx.save()
  ctx.shadowColor = "rgba(0,5,20,0.65)"; ctx.shadowBlur = 20; ctx.shadowOffsetY = 7

  // ─── VEIL TAIL — 4 feather lobes per side ─────────────────────
  for (let side = -1; side <= 1; side += 2) {
    for (let feather = 0; feather < 4; feather++) {
      const frac  = feather / 3
      const tLen  = TAIL_L * (0.65 + frac * 0.35)
      const spread = SPREAD * (0.22 + frac * 0.78)
      const tWag  = wagFin * side * (0.28 + frac * 0.52)
      const tipX  = bEnd - tLen
      const tipY  = tWag + side * spread

      ctx.beginPath()
      ctx.moveTo(bEnd, side * HW * 0.20)
      ctx.bezierCurveTo(
        bEnd - tLen * 0.22, tWag + side * spread * 0.26,
        tipX + tLen * 0.14, tipY * 0.86,
        tipX, tipY
      )
      ctx.bezierCurveTo(
        tipX + tLen * 0.09, tipY * 0.46,
        bEnd - tLen * 0.09, side * HW * 0.07,
        bEnd, 0
      )
      const tg = ctx.createLinearGradient(bEnd, 0, tipX, tipY)
      tg.addColorStop(0.00, c.fin + "c0")
      tg.addColorStop(0.35, c.fin + "80")
      tg.addColorStop(0.72, c.fin + "28")
      tg.addColorStop(1.00, c.fin + "00")
      ctx.fillStyle = tg
      ctx.globalAlpha = 0.72 - frac * 0.14; ctx.fill()

      // vein lines
      ctx.globalAlpha = 0.20 - frac * 0.06
      ctx.strokeStyle = c.body; ctx.lineWidth = 0.55
      for (let v = 1; v <= 6; v++) {
        const vt = v / 6
        ctx.beginPath()
        ctx.moveTo(bEnd, side * HW * 0.18 * (1 - vt * 0.5))
        ctx.lineTo(bEnd - tLen * vt * 0.88, tWag * vt + side * spread * vt * 0.9)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
  }

  // ─── DORSAL / ANAL SAILS (long flowing side fins) ─────────────
  for (let side = -1; side <= 1; side += 2) {
    const sw = wagFin * side * 0.18
    ctx.beginPath()
    ctx.moveTo(hx * 0.38, side * HW * 0.72)
    ctx.bezierCurveTo(
      L * 0.04,  sw + side * HW * 1.95,
      -L * 0.09, sw + side * HW * 1.65,
      bEnd * 0.68, sw + side * HW * 0.92
    )
    ctx.lineTo(bEnd, side * HW * 0.20)
    ctx.bezierCurveTo(
      -L * 0.08, side * HW * 0.68,
      L * 0.00,  side * HW * 0.72,
      hx * 0.38, side * HW * 0.72
    )
    const sg = ctx.createLinearGradient(0, side * HW * 0.72, 0, side * HW * 2.1)
    sg.addColorStop(0.00, c.body + "55")
    sg.addColorStop(0.35, c.fin  + "72")
    sg.addColorStop(1.00, c.fin  + "12")
    ctx.fillStyle = sg; ctx.globalAlpha = 0.52; ctx.fill(); ctx.globalAlpha = 1
  }

  // ─── VENTRAL RIBBONS (long thin streamers hanging sideways) ───
  ;[-1, 1].forEach(side => {
    const vw = wagFin * side * 0.42
    ctx.beginPath()
    ctx.moveTo(0, side * HW * 1.0)
    ctx.bezierCurveTo(
      -L * 0.1,  vw + side * HW * 1.3,
      -L * 0.28, vw + side * HW * 1.1,
      -L * 0.5,  vw + side * HW * 0.72
    )
    ctx.strokeStyle = c.fin + "88"; ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.stroke()
  })

  // ─── BODY ──────────────────────────────────────────────────────
  const bodyPath = () => {
    ctx.beginPath()
    ctx.moveTo(hx * 0.85, 0)
    ctx.bezierCurveTo(hx, -HW * 0.62, -L * 0.04, -HW, bEnd, -HW * 0.20)
    ctx.lineTo(bEnd, HW * 0.20)
    ctx.bezierCurveTo(-L * 0.04, HW, hx, HW * 0.62, hx * 0.85, 0)
  }
  bodyPath()
  const bg = ctx.createRadialGradient(L * 0.04, 0, 0, L * 0.04, 0, L * 0.47)
  bg.addColorStop(0.00, "#ffffff48")
  bg.addColorStop(0.12, c.body)
  bg.addColorStop(0.65, c.body + "cc")
  bg.addColorStop(1.00, c.body + "88")
  ctx.fillStyle = bg; ctx.fill()
  ctx.shadowBlur = 0; ctx.restore()

  // ─── IRIDESCENT SHEEN ──────────────────────────────────────────
  ctx.save(); bodyPath(); ctx.clip()
  const sheen = ctx.createLinearGradient(-L * 0.08, -HW * 0.6, L * 0.25, HW * 0.3)
  sheen.addColorStop(0.00, `hsla(${iridH},85%,72%,0.00)`)
  sheen.addColorStop(0.38, `hsla(${iridH},85%,72%,0.19)`)
  sheen.addColorStop(0.62, `hsla(${(iridH + 60) % 360},80%,75%,0.08)`)
  sheen.addColorStop(1.00, `hsla(${iridH},80%,70%,0.00)`)
  ctx.fillStyle = sheen; ctx.fill()
  ctx.restore()

  // ─── PECTORAL FINS ─────────────────────────────────────────────
  const fw = Math.sin(ph * 0.65) * 0.25
  ;[-1, 1].forEach(sign => {
    ctx.save()
    ctx.translate(L * 0.08, sign * HW * 0.88); ctx.rotate(sign * (0.68 + fw))
    ctx.beginPath(); ctx.ellipse(0, 0, L * 0.12, HW * 0.19, 0, 0, Math.PI * 2)
    const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, L * 0.12)
    fg.addColorStop(0, c.fin + "cc"); fg.addColorStop(1, c.fin + "04")
    ctx.fillStyle = fg; ctx.globalAlpha = 0.62; ctx.fill(); ctx.globalAlpha = 1
    ctx.restore()
  })

  // ─── EYES ──────────────────────────────────────────────────────
  ;[-1, 1].forEach(sign => {
    ctx.beginPath(); ctx.arc(L * 0.29, sign * HW * 0.52, HW * 0.19, 0, Math.PI * 2)
    ctx.fillStyle = "#080412"; ctx.fill()
    ctx.beginPath(); ctx.arc(L * 0.295, sign * HW * 0.515, HW * 0.09, 0, Math.PI * 2)
    ctx.fillStyle = c.accent + "aa"; ctx.fill()
    ctx.beginPath(); ctx.arc(L * 0.295, sign * HW * 0.515, HW * 0.05, 0, Math.PI * 2)
    ctx.fillStyle = "#04020a"; ctx.fill()
    ctx.beginPath(); ctx.arc(L * 0.305, sign * HW * 0.505, HW * 0.027, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255,255,255,0.86)"; ctx.fill()
  })

  // ─── TAIL TIP GLINT ────────────────────────────────────────────
  const ga = Math.abs(Math.sin(ph * 1.8)) * 0.72
  if (ga > 0.08) {
    ctx.globalAlpha = ga * 0.55
    ctx.fillStyle = "#ffffff"
    ctx.beginPath(); ctx.arc(bEnd - TAIL_L * 0.88, wagFin, 2.0, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = ga * 0.26
    ctx.beginPath(); ctx.arc(bEnd - TAIL_L * 0.88 + 10, wagFin - 16, 1.4, 0, Math.PI * 2); ctx.fill()
    ctx.globalAlpha = 1
  }
}

// ─── Component ─────────────────────────────────────────────────
const NUM = 7, FLEE_R = 160, FLEE_SPD = 3.8

export function LiquidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // respect prefers-reduced-motion — blobs only
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const canvas = canvasRef.current!
    const ctx    = canvas.getContext("2d")!
    let W = 0, H = 0

    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)

    const fish    = Array.from({ length: NUM }, (_, i) => makeBetta(W, H, i))
    const ripples: Ripple[] = []
    const motes: Mote[] = Array.from({ length: 18 }, () => ({
      x: rand(0, W), y: rand(0, H),
      vx: rand(-0.08, 0.08), vy: rand(-0.12, -0.04),
      a: rand(0.1, 0.38),
    }))

    let mx = -9999, my = -9999, t = 0
    const onMouse = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    window.addEventListener("mousemove", onMouse)

    let raf: number
    const tick = () => {
      t += 0.016
      ctx.clearRect(0, 0, W, H)

      // ─── Caustic light patches ──────────────────────────────
      for (let i = 0; i < 18; i++) {
        const cx = (Math.sin(t * 0.25 + i * 2.17) * 0.5 + 0.5) * W
        const cy = (Math.sin(t * 0.19 + i * 1.73) * 0.5 + 0.5) * H * 0.68
        const r  = 30 + Math.sin(t * 0.38 + i * 0.9) * 13
        const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        rg.addColorStop(0, "rgba(60,180,255,0.038)")
        rg.addColorStop(0.6, "rgba(40,140,220,0.016)")
        rg.addColorStop(1, "transparent")
        ctx.fillStyle = rg
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
      }

      // ─── Light shafts from above ────────────────────────────
      for (let i = 0; i < 5; i++) {
        const rx = ((i + 0.5) / 5) * W + Math.sin(t * 0.11 + i * 1.42) * 55
        const rw = 22 + Math.sin(t * 0.17 + i) * 9
        const sg = ctx.createLinearGradient(rx, 0, rx, H * 0.44)
        sg.addColorStop(0, "rgba(80,180,255,0.024)"); sg.addColorStop(1, "transparent")
        ctx.fillStyle = sg
        ctx.beginPath()
        ctx.moveTo(rx - rw, 0); ctx.lineTo(rx + rw, 0)
        ctx.lineTo(rx + rw * 0.28, H * 0.44); ctx.lineTo(rx - rw * 0.28, H * 0.44)
        ctx.fill()
      }

      // ─── Motes (plankton) ───────────────────────────────────
      motes.forEach(m => {
        m.x += m.vx; m.y += m.vy
        if (m.y < -4) { m.y = H + 4; m.x = rand(0, W) }
        if (m.x < -4 || m.x > W + 4) m.x = rand(0, W)
        ctx.globalAlpha = m.a * (0.4 + 0.6 * Math.sin(t * 0.9 + m.x * 0.01))
        ctx.fillStyle = "rgba(140,220,255,0.9)"
        ctx.beginPath(); ctx.arc(m.x, m.y, 1.0, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      })

      // ─── Fish physics ───────────────────────────────────────
      fish.forEach(f => {
        f.ph += f.phSpd * 0.032 * (f.scared ? 2.6 : 1)
        f.hue = (f.hue + 0.08) % 360

        const dx = f.x - mx, dy = f.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < FLEE_R) {
          if (!f.scared) ripples.push({ x: f.x, y: f.y, r: 5, maxR: 80, a: 1 })
          f.scared = true; f.scaredTick = 110
          f.targetAngle = Math.atan2(dy, dx); f.speed = FLEE_SPD
        } else if (f.scared) {
          if (--f.scaredTick <= 0) { f.scared = false; f.speed = f.baseSpeed }
          if (f.scaredTick % 6 === 0) ripples.push({ x: f.x, y: f.y, r: 2, maxR: 24, a: 0.6 })
        } else {
          if (--f.turnTick <= 0) {
            f.targetAngle = Math.random() * Math.PI * 2
            f.turnTick = f.nextTurn; f.nextTurn = (rand(90, 250) | 0)
          }
        }

        let da = f.targetAngle - f.angle
        while (da >  Math.PI) da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        f.angle += da * (f.scared ? 0.08 : 0.011)
        f.x += Math.cos(f.angle) * f.speed; f.y += Math.sin(f.angle) * f.speed

        const m = f.L * 1.2
        if (f.x < -m) f.x = W + m; else if (f.x > W + m) f.x = -m
        if (f.y < -m) f.y = H + m; else if (f.y > H + m) f.y = -m
      })

      // ─── Ripples ────────────────────────────────────────────
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.r += 1.5; r.a *= 0.962
        if (r.r > r.maxR || r.a < 0.012) { ripples.splice(i, 1); continue }
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(140,220,255,${r.a * 0.38})`
        ctx.lineWidth = 1.4; ctx.stroke()
        if (r.r > 12) {
          ctx.beginPath(); ctx.arc(r.x, r.y, r.r * 0.52, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(180,235,255,${r.a * 0.20})`
          ctx.lineWidth = 0.65; ctx.stroke()
        }
      }

      // ─── Draw fish ──────────────────────────────────────────
      fish.forEach(f => {
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.angle)
        drawBetta(ctx, f, t)
        ctx.restore()
      })

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", onMouse)
    }
  }, [])

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
        background: "linear-gradient(160deg, #000913 0%, #010f22 45%, #000913 100%)",
      }}
    >
      <div className="lb lb1" />
      <div className="lb lb2" />
      <div className="lb lb3" />
      <div className="lb lb4" />
      <div className="lb lb5" />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  )
}
