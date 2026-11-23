"use client"

import { useEffect, useRef } from "react"

const FLORAL_COLORS = ["#D9603A", "#EB6F70", "#F28C5B", "#F07A5A", "#C8503A", "#D9C3A0"]

export function FloralCanvas({ titleRef }: { titleRef: React.RefObject<HTMLElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const title = titleRef.current
    if (!canvas || !title) return
    const disposed = { current: false }

    const ctx = canvas.getContext("2d")!
    const dpr = Math.min(devicePixelRatio, 2)
    const W = canvas.clientWidth, H = canvas.clientHeight
    canvas.width = W * dpr; canvas.height = H * dpr
    ctx.scale(dpr, dpr)
    const cr = canvas.getBoundingClientRect()
    const spans = Array.from(title.querySelectorAll(".flor-letter"))
    if (!spans.length) return

    // Seeded PRNG (mulberry32)
    let _s = 42
    const rnd = () => { _s |= 0; _s = _s + 0x6D2B79F5 | 0; let t = Math.imul(_s ^ _s >>> 15, 1 | _s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }
    const rng = (a: number, b: number) => a + rnd() * (b - a)
    const TAU = Math.PI * 2

    const C_STEM = "#A8A08A", C_FLINE = "#FFD0B8", C_CORE = "#0E0B0A", C_VEIN = "rgba(28,28,27,0.18)"
    const S = spans[0].getBoundingClientRect().height

    type V = [number, number]
    interface StemG { pts: V[]; delay: number; w: number }
    interface LeafG { p: V; a: number; len: number; delay: number }
    interface PoppyG { p: V; R: number; rot: number; delay: number; ph1: number; ph2: number; col: string }
    interface PodG { p: V; a: number; len: number; delay: number }

    const gStems: StemG[] = [], gLeaves: LeafG[] = [], gPoppies: PoppyG[] = [], gPods: PodG[] = []

    function mkVine(bx: number, by: number, dir: number, len: number): V[] {
      const N = 40, step = len / N
      const amp = rng(0.35, 0.8) * rng(0.8, 1.4), waves = rng(1, 2.6), bend = rng(-0.6, 0.6), phase = rnd() * TAU
      const pts: V[] = []; let x = bx, y = by
      for (let i = 0; i <= N; i++) {
        pts.push([x, y])
        const u = i / N
        const h = dir + bend * u + amp * Math.sin(u * Math.PI * waves + phase) * Math.min(1, 3 * u)
        x += Math.cos(h) * step; y += Math.sin(h) * step
      }
      return pts
    }

    function mkCurl(px: number, py: number, dir: number): V[] {
      const pts: V[] = []; let x = px, y = py, a = dir
      const r0 = rng(0.05, 0.1) * S
      for (let i = 0; i < 14; i++) {
        pts.push([x, y]); const r = r0 * (1 - i / 28); a += rng(0.3, 0.5)
        x += Math.cos(a) * r * 0.4; y += Math.sin(a) * r * 0.4
      }
      return pts
    }

    function addLeaves(pts: V[], delay: number, count: number) {
      for (let j = 0; j < count; j++) {
        const u = rng(0.2, 0.85), idx = Math.min(Math.floor(u * (pts.length - 2)), pts.length - 2)
        const stemA = Math.atan2(pts[idx + 1][1] - pts[idx][1], pts[idx + 1][0] - pts[idx][0])
        gLeaves.push({ p: pts[idx], a: stemA + (j % 2 === 0 ? 1 : -1) * rng(0.55, 1.05), len: rng(0.12, 0.3) * S, delay: delay + u * 500 })
      }
    }

    function addTip(pts: V[], delay: number, pChance: number, bloom: number) {
      const tip = pts[pts.length - 1], prev = pts[pts.length - 2]
      const tipA = Math.atan2(tip[1] - prev[1], tip[0] - prev[0])
      if (rnd() < pChance) {
        gPoppies.push({ p: tip, R: rng(0.1, 0.2) * bloom * S, rot: rng(-0.5, 0.5), delay: delay + 420, ph1: rnd() * 7, ph2: rnd() * 7, col: FLORAL_COLORS[Math.floor(rnd() * FLORAL_COLORS.length)] })
      } else if (rnd() < 0.45) {
        gPods.push({ p: tip, a: tipA, len: rng(0.08, 0.12) * S, delay: delay + 380 })
      } else {
        gStems.push({ pts: mkCurl(tip[0], tip[1], tipA), delay: delay + 350, w: S * 0.01 })
      }
    }

    spans.forEach((span, li) => {
      const r = span.getBoundingClientRect()
      const cx = r.left - cr.left + r.width / 2, lw = r.width
      const midY = r.top - cr.top + r.height * 0.5
      const pChance = rng(0.25, 0.4), lean = rng(-0.2, 0.2), bloom = rng(0.7, 1.0)

      const nUp = rnd() < 0.3 ? 2 : 1
      for (let si = 0; si < nUp; si++) {
        const bx = cx + rng(-lw * 0.25, lw * 0.25)
        const by = midY + rng(0.05, 0.25) * S
        const dir = -Math.PI / 2 + lean / 2 + rng(-0.45, 0.45)
        const len = rng(0.3, 0.6) * S
        const pts = mkVine(bx, by, dir, len)
        const delay = li * 90 + si * 160
        gStems.push({ pts, delay, w: S * 0.014 })
        addLeaves(pts, delay, Math.floor(rnd() * 1.8))
        addTip(pts, delay, pChance, bloom)
        if (si === 0 && rnd() < 0.2) {
          const fU = rng(0.3, 0.6), fIdx = Math.floor(fU * (pts.length - 1))
          const fp = pts[fIdx], fn = pts[Math.min(fIdx + 1, pts.length - 1)]
          const brPts = mkVine(fp[0], fp[1], Math.atan2(fn[1] - fp[1], fn[0] - fp[0]) + rng(-0.7, 0.7), len * rng(0.25, 0.4))
          gStems.push({ pts: brPts, delay: delay + fU * 400, w: S * 0.011 })
          addTip(brPts, delay + fU * 400, pChance * 0.6, bloom * 0.7)
        }
      }

      if (rnd() < 0.4) {
        const side = rnd() < 0.5 ? 1 : -1
        const bx = cx + side * lw * rng(0.1, 0.3)
        const dir = (side > 0 ? 0 : Math.PI) + rng(-0.35, 0.35)
        const pts = mkVine(bx, midY + rng(-S * 0.1, S * 0.1), dir, rng(0.3, 0.6) * S)
        const delay = li * 90 + 100
        gStems.push({ pts, delay, w: S * 0.012 })
        addLeaves(pts, delay, 1)
        addTip(pts, delay, pChance * 0.5, bloom * 0.75)
      }

      if (rnd() < 0.3) {
        const pts = mkVine(cx + rng(-lw * 0.25, lw * 0.25), midY + rng(-0.03, 0.08) * S, Math.PI / 2 + rng(-0.4, 0.4), rng(0.2, 0.4) * S)
        const delay = li * 90 + 150
        gStems.push({ pts, delay, w: S * 0.011 })
        addLeaves(pts, delay, 1)
      }

      if (li === 0) {
        const pts = mkVine(cx - lw * 0.3, midY + rng(-S * 0.1, S * 0.1), Math.PI + rng(-0.3, 0.3), rng(0.3, 0.5) * S)
        gStems.push({ pts, delay: 100, w: S * 0.011 })
        addLeaves(pts, 100, 1)
      }

      if (li > 0 && rnd() < 0.7) {
        const pr = spans[li - 1].getBoundingClientRect()
        const pcx = pr.left - cr.left + pr.width / 2, pMidY = pr.top - cr.top + pr.height * 0.5
        const fx = cx - lw * 0.1, fy = midY + rng(-0.3, 0.3) * S
        const tx = pcx + pr.width * 0.1, ty = pMidY + rng(-0.3, 0.3) * S
        const bulge = rng(-0.4, 0.4) * S
        const cp1x = fx + (tx - fx) * 0.3 + rng(-8, 8), cp2x = tx + (fx - tx) * 0.3 + rng(-8, 8)
        const pts: V[] = []; for (let i = 0; i <= 24; i++) { const t = i / 24, m = 1 - t; pts.push([m ** 3 * fx + 3 * m ** 2 * t * cp1x + 3 * m * t ** 2 * cp2x + t ** 3 * tx, m ** 3 * fy + 3 * m ** 2 * t * (fy + bulge) + 3 * m * t ** 2 * (ty + bulge) + t ** 3 * ty]) }
        gStems.push({ pts, delay: li * 90 + 80, w: S * 0.013 })
        addLeaves(pts, li * 90 + 80, 1)
      }
    })

    const boilAmt = Math.max(0.8, S * 0.01)
    function boil(id: number, frame: number): V {
      let h = (id * 2654435761 + frame * 1597334677) | 0
      h = ((h >>> 16) ^ h) * 0x45d9f3b | 0; h = ((h >>> 16) ^ h) * 0x45d9f3b | 0
      const x = (((h >>> 16) ^ h) >>> 0) / 2147483648 - 1
      h = (h * 0x85ebca6b) | 0
      return [x * boilAmt, (((h >>> 16) ^ h) >>> 0) / 2147483648 * boilAmt - boilAmt]
    }

    const t0 = performance.now()

    function drawStem(s: StemG, t: number, id: number, bf: number) {
      const se = 1 - (1 - Math.min(1, Math.max(0, (t - s.delay) / Math.max(320, s.pts.length * 15)))) ** 3
      if (se <= 0) return
      const drawTo = Math.floor(se * (s.pts.length - 1))
      const [bx, by] = boil(id, bf)
      ctx.beginPath(); ctx.strokeStyle = C_STEM; ctx.lineWidth = s.w; ctx.lineCap = "round"; ctx.lineJoin = "round"
      for (let k = 0; k <= drawTo; k++) { const x = s.pts[k][0] + bx, y = s.pts[k][1] + by; k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
      ctx.stroke()
    }

    function drawLeaf(lf: LeafG, t: number, id: number, bf: number) {
      const rawP = Math.min(1, Math.max(0, (t - lf.delay) / 350))
      const spring = 1 - Math.exp(-7 * rawP) * Math.cos(15 * rawP)
      if (spring < 0.01) return
      const L = lf.len * spring
      const [bx, by] = boil(id, bf)
      ctx.save(); ctx.translate(lf.p[0] + bx, lf.p[1] + by); ctx.rotate(lf.a)
      const N = 18
      ctx.beginPath()
      for (let i = 0; i <= N; i++) {
        const u = i / N, x = u * L, baseW = 0.3 * L * Math.sin(Math.PI * u ** 0.8)
        const tp = u * 5.5, tu = tp - Math.floor(tp)
        const w = baseW * (0.28 + 0.72 * (tu < 0.7 ? tu / 0.7 : 1 - (tu - 0.7) / 0.3))
        i === 0 ? ctx.moveTo(x, 0) : ctx.lineTo(x, -w)
      }
      for (let i = N; i >= 0; i--) {
        const u = i / N, x = u * L, baseW = 0.3 * L * Math.sin(Math.PI * u ** 0.8)
        const tp = (u + 0.09) * 5.5, tu = tp - Math.floor(tp)
        ctx.lineTo(x, baseW * (0.28 + 0.72 * (tu < 0.7 ? tu / 0.7 : 1 - (tu - 0.7) / 0.3)))
      }
      ctx.closePath(); ctx.fillStyle = C_STEM; ctx.fill()
      if (L > 5) { ctx.beginPath(); ctx.moveTo(L * 0.05, 0); ctx.lineTo(L * 0.85, 0); ctx.strokeStyle = C_VEIN; ctx.lineWidth = Math.max(0.7, L * 0.022); ctx.lineCap = "round"; ctx.stroke() }
      ctx.restore()
    }

    function drawPod(pod: PodG, t: number, id: number, bf: number) {
      const spring = 1 - Math.exp(-7 * Math.min(1, Math.max(0, (t - pod.delay) / 350))) * Math.cos(15 * Math.min(1, Math.max(0, (t - pod.delay) / 350)))
      if (spring < 0.01) return
      const L = pod.len * spring; const [bx, by] = boil(id, bf)
      ctx.save(); ctx.translate(pod.p[0] + bx, pod.p[1] + by); ctx.rotate(pod.a)
      ctx.beginPath(); ctx.ellipse(L * 0.55, 0, L * 0.55, L * 0.44, 0, 0, TAU); ctx.fillStyle = C_STEM; ctx.fill()
      ctx.beginPath(); ctx.ellipse(L * 1.12, 0, L * 0.1, L * 0.36, 0, 0, TAU); ctx.fill()
      for (let i = 0; i < 5; i++) { const a = (i / 5) * TAU - Math.PI / 2; ctx.beginPath(); ctx.moveTo(L * 1.06, Math.sin(a) * L * 0.1); ctx.lineTo(L * 1.24, Math.sin(a) * L * 0.3); ctx.strokeStyle = C_STEM; ctx.lineWidth = Math.max(0.5, L * 0.04); ctx.lineCap = "round"; ctx.stroke() }
      ctx.strokeStyle = "rgba(28,28,27,0.12)"; ctx.lineWidth = Math.max(0.7, L * 0.045)
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(L * 0.15, i * L * 0.12); ctx.lineTo(L * 0.95, i * L * 0.1); ctx.stroke() }
      ctx.restore()
    }

    function drawPoppy(pop: PoppyG, t: number, id: number, bf: number) {
      const rawP = Math.min(1, Math.max(0, (t - pop.delay) / 800))
      if (rawP < 0.01) return
      const R = pop.R; const [bx, by] = boil(id, bf)
      ctx.save(); ctx.translate(pop.p[0] + bx, pop.p[1] + by); ctx.rotate(pop.rot)
      const petals = [
        { cx: -R * 0.42, cy: -R * 0.24, rx: R * 0.6, ry: R * 0.56, tilt: -0.4, d: 0 },
        { cx: R * 0.44, cy: -R * 0.22, rx: R * 0.6, ry: R * 0.56, tilt: 0.4, d: 85 },
        { cx: -R * 0.38, cy: R * 0.24, rx: R * 0.6, ry: R * 0.5, tilt: 0.3, d: 170 },
        { cx: R * 0.4, cy: R * 0.26, rx: R * 0.6, ry: R * 0.5, tilt: -0.3, d: 255 },
      ]
      for (let pi = 0; pi < 4; pi++) {
        const pt = petals[pi]
        const petalT = Math.max(0, Math.min(1, (rawP * 800 - pt.d) / 600))
        const s = Math.min(1, 1 - Math.exp(-8 * petalT) * Math.cos(14 * petalT))
        if (s < 0.01) continue
        ctx.save()
        ctx.translate(0, R * 0.45); ctx.scale(s, s); ctx.translate(0, -R * 0.45)
        ctx.rotate(pt.tilt * (1 - s) * 0.5)
        ctx.beginPath()
        for (let j = 0; j <= 24; j++) {
          const theta = (j / 24) * TAU
          const crinkle = 1 + 0.045 * Math.sin(5 * theta + pop.ph1 + pi) + 0.03 * Math.sin(9 * theta + pop.ph2) + 0.012 * Math.sin(15 * theta + 2 * pi)
          const x = pt.cx + Math.cos(theta) * pt.rx * crinkle, y = pt.cy + Math.sin(theta) * pt.ry * crinkle
          j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.closePath(); ctx.fillStyle = pop.col; ctx.fill()
        if (R >= 10 && petalT > 0.4) {
          const lineP = Math.min(1, (petalT - 0.4) / 0.5)
          ctx.lineCap = "round"
          for (const [off, alpha, wMul] of [[-0.32, 0.75, 0.75], [0.05, 0.9, 0.9], [0.36, 0.75, 0.75]] as [number, number, number][]) {
            const lineA = Math.atan2(pt.cy, pt.cx) + off
            const dist = Math.sqrt(pt.cx ** 2 + pt.cy ** 2)
            const reach = dist + 0.6 * Math.max(pt.rx, pt.ry)
            ctx.globalAlpha = lineP * alpha; ctx.strokeStyle = C_FLINE; ctx.lineWidth = R * 0.032 * wMul
            ctx.beginPath(); ctx.moveTo(Math.cos(lineA) * dist * 0.32, Math.sin(lineA) * dist * 0.32)
            ctx.lineTo(Math.cos(lineA) * reach * lineP, Math.sin(lineA) * reach * lineP); ctx.stroke()
          }
          ctx.globalAlpha = 1
        }
        ctx.restore()
      }
      const coreP = Math.min(1, Math.max(0, (rawP * 800 - 340) / 520))
      const coreSc = 1 - (1 - coreP) ** 3
      if (coreSc > 0.01) {
        ctx.beginPath(); ctx.ellipse(0, -R * 0.02, R * 0.24 * coreSc, R * 0.21 * coreSc, 0, 0, TAU); ctx.fillStyle = C_CORE; ctx.fill()
        if (R >= 9) for (let d = 0; d < 11; d++) {
          const dp = Math.min(1, Math.max(0, (coreP * 520 - d * 25) / 150))
          if (dp <= 0) continue; const da = (d / 11) * TAU
          ctx.beginPath(); ctx.arc(Math.cos(da) * R * 0.33 * coreSc, -R * 0.02 + Math.sin(da) * R * 0.33 * coreSc, R * 0.045 * dp, 0, TAU); ctx.fillStyle = C_CORE; ctx.fill()
        }
        ctx.beginPath(); ctx.ellipse(0, -R * 0.02, R * 0.085 * coreSc, R * 0.075 * coreSc, 0, 0, TAU); ctx.fillStyle = C_STEM; ctx.fill()
      }
      ctx.restore()
    }

    function florFrame() {
      if (disposed.current) return
      const t = performance.now() - t0, bf = Math.floor(t / 120)
      ctx.clearRect(0, 0, W, H)
      gStems.forEach((s, i) => drawStem(s, t, i, bf))
      gLeaves.forEach((l, i) => drawLeaf(l, t, i + 1000, bf))
      gPods.forEach((p, i) => drawPod(p, t, i + 2000, bf))
      gPoppies.forEach((p, i) => drawPoppy(p, t, i + 3000, bf))
      requestAnimationFrame(florFrame)
    }
    requestAnimationFrame(florFrame)

    return () => { disposed.current = true }
  }, [titleRef])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  )
}
