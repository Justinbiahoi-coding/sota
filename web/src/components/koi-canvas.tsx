"use client"
import { useEffect, useRef } from "react"

// ─── Goldfish color types ───────────────────────────────────
const GF = [
  { body: "#f06018", fin: "#fce8d0", accent: "#ffffff" },  // orange/white
  { body: "#f0a020", fin: "#fdf4d8", accent: "#ffffff" },  // golden/white
  { body: "#e84010", fin: "#fcd8c0", accent: null       },  // deep red solid
  { body: "#f07c10", fin: "#fde8c0", accent: "#fff8f0" },  // tangerine/cream
  { body: "#d84418", fin: "#fcd0b8", accent: "#ffffff" },  // red-orange/white
]

interface Fish {
  x: number; y: number
  angle: number; targetAngle: number
  speed: number; baseSpeed: number
  L: number; HW: number
  gi: number
  ph: number; phSpd: number
  scared: boolean; scaredTick: number
  turnTick: number; nextTurn: number
  patches: { px: number; py: number; rx: number; ry: number; rot: number }[]
}
interface Ripple { x: number; y: number; r: number; maxR: number; a: number }

function rand(a: number, b: number) { return a + Math.random() * (b - a) }
function dim(hex: string, f: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgb(${((n>>16)*f)|0},${(((n>>8)&0xff)*f)|0},${((n&0xff)*f)|0})`
}

function makeFish(w: number, h: number, i: number): Fish {
  const L  = rand(130, 180)
  const gi = i % GF.length
  const gf = GF[gi]
  const patches: Fish["patches"] = []
  if (gf.accent) {
    const n = 1 + Math.floor(rand(0, 3))
    for (let j = 0; j < n; j++) {
      patches.push({
        px: rand(-0.28, 0.22),
        py: rand(-0.38, 0.38),
        rx: rand(0.09, 0.20),
        ry: rand(0.07, 0.15),
        rot: rand(-0.9, 0.9),
      })
    }
  }
  const spd = rand(0.5, 0.95)
  return {
    x: rand(0, w), y: rand(0, h),
    angle: rand(0, Math.PI * 2), targetAngle: rand(0, Math.PI * 2),
    speed: spd, baseSpeed: spd,
    L, HW: L * 0.44,
    gi, ph: rand(0, Math.PI * 2), phSpd: rand(1.1, 1.9),
    scared: false, scaredTick: 0,
    turnTick: (rand(80, 240) | 0), nextTurn: (rand(100, 260) | 0),
    patches,
  }
}

// ─── Draw one goldfish (translated+rotated, top-down) ───────
function drawGoldfish(ctx: CanvasRenderingContext2D, f: Fish) {
  const { L, HW, gi, ph, scared } = f
  const gf = GF[gi]
  const wag    = Math.sin(ph) * (scared ? 1.0 : 0.46)
  const wagFin = wag * HW

  const hx      =  L * 0.44
  const bEnd    = -L * 0.28
  const tailTip = -L * 1.00
  const tSpread =  HW * 1.75

  const bodyPath = () => {
    ctx.beginPath()
    ctx.moveTo(hx * 0.86, 0)
    ctx.bezierCurveTo( hx,     -HW * 0.55,  -L*0.07, -HW,  bEnd, -HW*0.22)
    ctx.lineTo(bEnd, HW * 0.22)
    ctx.bezierCurveTo(-L*0.07,  HW,           hx,      HW * 0.55,  hx * 0.86, 0)
  }

  ctx.save()
  ctx.shadowColor = "rgba(0,8,20,0.52)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6

  // ── VEIL TAIL LOBES ──
  const drawVeil = (sign: number) => {
    const wOff = wagFin * sign * 0.35
    ctx.beginPath()
    ctx.moveTo(bEnd, sign * HW * 0.22)
    ctx.bezierCurveTo(
      bEnd - L*0.14,    wOff + sign * tSpread * 0.42,
      tailTip + L*0.12, wOff + sign * tSpread * 0.95,
      tailTip,          wOff + sign * tSpread * 0.68
    )
    ctx.bezierCurveTo(
      tailTip + L*0.10, wOff + sign * tSpread * 0.28,
      bEnd - L*0.06,    wOff + sign * HW * 0.06,
      bEnd, 0
    )
    const tg = ctx.createLinearGradient(bEnd, 0, tailTip, sign * tSpread)
    tg.addColorStop(0.0, gf.fin + "d8")
    tg.addColorStop(0.4, gf.fin + "90")
    tg.addColorStop(1.0, gf.fin + "08")
    ctx.fillStyle = tg; ctx.globalAlpha = 0.78; ctx.fill(); ctx.globalAlpha = 1

    ctx.globalAlpha = 0.20; ctx.strokeStyle = gf.body; ctx.lineWidth = 0.65
    for (let r = 0; r < 9; r++) {
      const t = r / 8
      ctx.beginPath(); ctx.moveTo(bEnd, sign * HW * 0.22)
      ctx.lineTo(tailTip + t * L * 0.14, wOff + sign * tSpread * (0.18 + t * 0.60))
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }
  drawVeil(-1); drawVeil(1)

  // ── BODY ──
  bodyPath()
  const bg = ctx.createRadialGradient(L*0.06, 0, 0, L*0.06, 0, L*0.56)
  bg.addColorStop(0.00, "#ffe888")
  bg.addColorStop(0.18, gf.body)
  bg.addColorStop(0.75, dim(gf.body, 0.72))
  bg.addColorStop(1.00, dim(gf.body, 0.50))
  ctx.fillStyle = bg; ctx.fill()
  ctx.shadowBlur = 0; ctx.restore()

  // ── WHITE PATCHES ──
  ctx.save(); bodyPath(); ctx.clip()
  f.patches.forEach(p => {
    ctx.save()
    ctx.translate(p.px * L, p.py * L); ctx.rotate(p.rot)
    ctx.beginPath()
    ctx.ellipse(0, 0, p.rx * L, p.ry * L, 0, 0, Math.PI * 2)
    ctx.fillStyle = (gf.accent ?? "#fff") + "cc"; ctx.fill()
    ctx.restore()
  })
  ctx.restore()

  // ── SCALE TEXTURE ──
  ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = dim(gf.body, 0.55); ctx.lineWidth = 1
  for (let row = -3; row <= 3; row++) {
    for (let col = -2; col <= 2; col++) {
      const sx = col * L * 0.19 + L * 0.08, sy = row * HW * 0.23
      if (Math.abs(sx) < L*0.38 && Math.abs(sy) < HW*0.82) {
        ctx.beginPath(); ctx.arc(sx, sy, HW * 0.15, Math.PI * 0.08, Math.PI * 0.92); ctx.stroke()
      }
    }
  }
  ctx.restore()

  // ── PECTORAL FINS ──
  const finWave = Math.sin(ph * 0.60) * 0.22
  ;[-1, 1].forEach(sign => {
    ctx.save()
    ctx.translate(L * 0.08, sign * HW * 0.92)
    ctx.rotate(sign * (0.68 + finWave))
    ctx.beginPath(); ctx.ellipse(0, 0, L * 0.20, HW * 0.30, 0, 0, Math.PI * 2)
    const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, L * 0.20)
    fg.addColorStop(0, gf.fin + "cc"); fg.addColorStop(1, gf.fin + "06")
    ctx.fillStyle = fg; ctx.globalAlpha = 0.72; ctx.fill(); ctx.globalAlpha = 1
    ctx.restore()
  })

  // ── DORSAL SPINE RIDGE ──
  ctx.beginPath()
  ctx.moveTo(hx * 0.72, 0)
  ctx.bezierCurveTo(L * 0.08, 0, -L * 0.04, 0, bEnd * 0.75, 0)
  ctx.strokeStyle = "rgba(0,0,0,0.10)"; ctx.lineWidth = HW * 0.14
  ctx.lineCap = "round"; ctx.stroke()

  // ── EYES (symmetric top-down) ──
  ;[-1, 1].forEach(sign => {
    ctx.beginPath()
    ctx.arc(L * 0.34, sign * HW * 0.52, HW * 0.16, 0, Math.PI * 2)
    ctx.fillStyle = "#1a1008"; ctx.fill()
    ctx.beginPath()
    ctx.arc(L * 0.345, sign * HW * 0.515, HW * 0.075, 0, Math.PI * 2)
    ctx.fillStyle = "#c8921a"; ctx.fill()
    ctx.beginPath()
    ctx.arc(L * 0.345, sign * HW * 0.515, HW * 0.042, 0, Math.PI * 2)
    ctx.fillStyle = "#080604"; ctx.fill()
    ctx.beginPath()
    ctx.arc(L * 0.355, sign * HW * 0.505, HW * 0.028, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(255,255,255,0.80)"; ctx.fill()
  })
}

// ─── Component ───────────────────────────────────────────────
const NUM      = 5
const FLEE_R   = 170
const FLEE_SPD = 4.2

export function KoiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx    = canvas.getContext("2d")!
    let W = 0, H = 0

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const fish    = Array.from({ length: NUM }, (_, i) => makeFish(W, H, i))
    const ripples: Ripple[] = []
    let mx = -9999, my = -9999

    const onMouse = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }
    window.addEventListener("mousemove", onMouse)

    let raf: number
    const tick = () => {
      ctx.clearRect(0, 0, W, H)

      fish.forEach(f => {
        f.ph += f.phSpd * 0.036 * (f.scared ? 2.8 : 1)

        const dx = f.x - mx, dy = f.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < FLEE_R) {
          if (!f.scared) ripples.push({ x: f.x, y: f.y, r: 6, maxR: 90, a: 1 })
          f.scared = true; f.scaredTick = 120
          f.targetAngle = Math.atan2(dy, dx)
          f.speed = FLEE_SPD
        } else if (f.scared) {
          if (--f.scaredTick <= 0) { f.scared = false; f.speed = f.baseSpeed }
          if (f.scaredTick % 5 === 0) {
            const tx = f.x + Math.cos(f.angle + Math.PI) * f.L * 0.5
            const ty = f.y + Math.sin(f.angle + Math.PI) * f.L * 0.5
            ripples.push({ x: tx, y: ty, r: 2, maxR: 28, a: 0.65 })
          }
        } else {
          if (--f.turnTick <= 0) {
            f.targetAngle = Math.random() * Math.PI * 2
            f.turnTick = f.nextTurn; f.nextTurn = (rand(100, 260) | 0)
          }
        }

        let da = f.targetAngle - f.angle
        while (da >  Math.PI) da -= Math.PI * 2
        while (da < -Math.PI) da += Math.PI * 2
        f.angle += da * (f.scared ? 0.09 : 0.014)

        f.x += Math.cos(f.angle) * f.speed
        f.y += Math.sin(f.angle) * f.speed

        const m = f.L * 1.1
        if (f.x < -m) f.x = W + m; else if (f.x > W + m) f.x = -m
        if (f.y < -m) f.y = H + m; else if (f.y > H + m) f.y = -m
      })

      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.r += 1.6; r.a *= 0.965
        if (r.r > r.maxR || r.a < 0.015) ripples.splice(i, 1)
      }

      ripples.forEach(r => {
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(200,240,255,${r.a * 0.42})`
        ctx.lineWidth = 1.5; ctx.stroke()
        if (r.r > 14) {
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.r * 0.54, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(230,250,255,${r.a * 0.22})`
          ctx.lineWidth = 0.7; ctx.stroke()
        }
      })

      fish.forEach(f => {
        ctx.save()
        ctx.translate(f.x, f.y)
        ctx.rotate(f.angle)
        drawGoldfish(ctx, f)
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
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  )
}
