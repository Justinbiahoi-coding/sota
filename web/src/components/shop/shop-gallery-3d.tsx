"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { X, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatPrice, type Product } from "@/lib/mock-data"
import type * as ThreeTypes from "three"

// ─────────────────────────────────────────────────────────────
// Canvas product texture (no external images needed)
// ─────────────────────────────────────────────────────────────
const CAT_PALETTE: Record<string, { bg: string; fg: string }> = {
  Postcard:          { bg: "#E8D4B0", fg: "#5A3E10" },
  "Sách nghệ thuật": { bg: "#C0A890", fg: "#3A2818" },
  "Lưu niệm":        { bg: "#C8A850", fg: "#4A3800" },
  "Thời trang":      { bg: "#DCA8A8", fg: "#580A0A" },
}

function makeTexture(product: Product): HTMLCanvasElement {
  const W = 300, H = 400
  const c = document.createElement("canvas"); c.width = W; c.height = H
  const ctx = c.getContext("2d")!
  const pal = CAT_PALETTE[product.category] ?? { bg: "#B8CCBE", fg: "#2A4A38" }

  const gr = ctx.createLinearGradient(0, 0, 0, H)
  gr.addColorStop(0, pal.bg + "b0"); gr.addColorStop(1, pal.bg)
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H)

  // subtle grid lines
  ctx.strokeStyle = pal.fg + "14"; ctx.lineWidth = 1
  for (let x = 0; x < W; x += 30) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
  for (let y = 0; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

  // category shape
  ctx.save(); ctx.translate(W / 2, H * 0.38); ctx.strokeStyle = pal.fg + "cc"; ctx.fillStyle = pal.fg + "cc"; ctx.lineWidth = 5
  const s = 55
  if (product.category === "Postcard") {
    for (let k = 2; k >= 0; k--) { ctx.save(); ctx.rotate((k - 1) * 0.18); ctx.strokeRect(-s * .9, -s * .65, s * 1.8, s * 1.3); ctx.restore() }
  } else if (product.category === "Sách nghệ thuật") {
    ctx.strokeRect(-s, -s * 1.1, s * 2, s * 2.1)
    for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.arc(-s, k * s * .3, 5, 0, Math.PI * 2); ctx.fill() }
  } else if (product.category === "Thời trang") {
    ctx.save(); ctx.rotate(-0.3)
    ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(-s * .5, -s * .5); ctx.bezierCurveTo(-s * .3, s * .1, s * .3, -s * .1, s * .5, s * .5); ctx.stroke()
    ctx.restore()
  } else {
    ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * .7, 0); ctx.lineTo(0, s); ctx.lineTo(-s * .7, 0); ctx.closePath(); ctx.stroke()
  }
  ctx.restore()

  ctx.fillStyle = pal.fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"
  const words = product.name.split(" "); const half = Math.ceil(words.length / 2)
  const line1 = words.slice(0, half).join(" "), line2 = words.slice(half).join(" ")
  ctx.font = `600 ${W * 0.058}px Georgia,serif`
  if (line2) {
    ctx.fillText(line1, W / 2, H * 0.72); ctx.fillText(line2, W / 2, H * 0.82)
  } else {
    ctx.fillText(line1, W / 2, H * 0.77)
  }
  ctx.font = `${W * 0.038}px monospace`; ctx.fillStyle = pal.fg + "99"
  ctx.fillText(formatPrice(product.price), W / 2, H * 0.92)
  return c
}

// ─────────────────────────────────────────────────────────────
// Shop3DGallery component
// ─────────────────────────────────────────────────────────────
export function Shop3DGallery({ products }: { products: Product[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const walkRef = useRef<(dir: number) => void>(() => {})
  const { addItem } = useCart()
  const [panel, setPanel] = useState<Product | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !products.length) return
    const canvas = canvasRef.current
    let disposed = false

    import("three").then((THREE) => {
      if (disposed) return

      // ── renderer / scene / camera ──────────────────────────
      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xF6EFE3)
      scene.fog = new THREE.Fog(0xF6EFE3, 10, 46)
      const camera = new THREE.PerspectiveCamera(56, 1, 0.05, 100)
      scene.add(new THREE.HemisphereLight(0xfffdf6, 0xe9cfa6, 1.55))

      // ── corridor geometry ──────────────────────────────────
      const R = 18, RIN = 12.2, CH = 6.2

      function gradTex(stops: [number, string][]): ThreeTypes.CanvasTexture {
        const c = document.createElement("canvas"); c.width = 4; c.height = 256
        const ctx = c.getContext("2d")!
        const g = ctx.createLinearGradient(0, 0, 0, 256)
        stops.forEach(([t, col]) => g.addColorStop(t, col))
        ctx.fillStyle = g; ctx.fillRect(0, 0, 4, 256)
        const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t
      }

      const outerW = new THREE.Mesh(
        Object.assign(new THREE.CylinderGeometry(R, R, CH, 160, 1, true), { name: "outer" }),
        new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: gradTex([[0, "#F0E5D0"], [0.6, "#FAF2E2"], [1, "#EBD9C0"]]) })
      )
      outerW.position.y = CH / 2; scene.add(outerW)

      const innerW = new THREE.Mesh(
        new THREE.CylinderGeometry(RIN, RIN, CH, 120, 1, true),
        new THREE.MeshBasicMaterial({ side: THREE.FrontSide, map: gradTex([[0, "#F3E8D8"], [0.5, "#FFF8EE"], [1, "#EDE0C8"]]) })
      )
      innerW.position.y = CH / 2; scene.add(innerW)

      const flGeo = new THREE.CircleGeometry(R, 160); flGeo.rotateX(-Math.PI / 2)
      const flC = document.createElement("canvas"); flC.width = flC.height = 512
      const flCtx = flC.getContext("2d")!
      const flGr = flCtx.createRadialGradient(256, 256, 256 * RIN / R, 256, 256, 256)
      flGr.addColorStop(0, "#E8D4B0"); flGr.addColorStop(1, "#E0C8A0")
      flCtx.fillStyle = flGr; flCtx.fillRect(0, 0, 512, 512)
      scene.add(new THREE.Mesh(flGeo, new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(flC) })))
      const clGeo = new THREE.CircleGeometry(R, 160); clGeo.rotateX(-Math.PI / 2)
      const cl = new THREE.Mesh(clGeo, new THREE.MeshBasicMaterial({ color: 0xFAF0DF, side: THREE.BackSide }))
      cl.position.y = CH; scene.add(cl)

      // ── product frames on walls ────────────────────────────
      const PW = 1.36, PH = PW * 4 / 3, PY = 1.95
      const printMeshes: Array<{ mesh: ThreeTypes.Mesh; product: Product; isOuter: boolean }> = []

      function placeProduct(product: Product, angle: number, r: number, faceSign: number, isOuter: boolean) {
        const texCanvas = makeTexture(product)
        const tex = new THREE.CanvasTexture(texCanvas); tex.colorSpace = THREE.SRGBColorSpace
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(PW, PH),
          new THREE.MeshBasicMaterial({ map: tex, fog: true })
        )
        const offset = -faceSign * 0.015
        mesh.position.set(Math.cos(angle) * (r + offset), PY, Math.sin(angle) * (r + offset))
        mesh.rotation.y = -angle + faceSign * Math.PI / 2
        scene.add(mesh); printMeshes.push({ mesh, product, isOuter })

        const frame = new THREE.Mesh(
          new THREE.BoxGeometry(PW + 0.07, PH + 0.07, 0.025),
          new THREE.MeshBasicMaterial({ color: 0xC8A058 })
        )
        frame.position.set(Math.cos(angle) * (r + offset - faceSign * 0.02), PY, Math.sin(angle) * (r + offset - faceSign * 0.02))
        frame.rotation.y = -angle + faceSign * Math.PI / 2
        scene.add(frame)
      }

      const OUTER_N = Math.max(products.length, 10) * 3
      for (let s = 0; s < OUTER_N; s++) {
        placeProduct(products[s % products.length], s * 2 * Math.PI / OUTER_N, 17.98, 1, true)
      }
      const INNER_N = Math.round(OUTER_N * 0.67)
      for (let k = 0; k < INNER_N; k++) {
        placeProduct(products[(k + Math.floor(products.length / 2)) % products.length], (k + 0.5) * 2 * Math.PI / INNER_N, 12.22, -1, false)
      }

      // ── camera walk state ─────────────────────────────────
      const D = 0.14, STEP = 2 * Math.PI / OUTER_N
      let th = D, target = D, focused = false, focusedAng = 0
      type Glide = { t0: number; dur: number; th0: number; th1: number; r0: number; r1: number; yaw0: number; yaw1: number; y0: number; y1: number; p0: number; p1: number }
      let glide: Glide | null = null
      const walk = { r: 15.6, yaw: -0.3, y: 1.92, pitch: -0.12 }

      function lerp(a: number, b: number, t: number) { return a + (b - a) * t }
      function easeOut4(t: number) { return 1 - (1 - t) ** 4 }
      function easeOut2(t: number) { return 1 - (1 - t) ** 2 }

      function pose(thV: number, r: number, yaw: number, y: number, pitch: number) {
        camera.position.set(r * Math.cos(thV), y, r * Math.sin(thV))
        const tan = new THREE.Vector3(Math.sin(thV), 0, -Math.cos(thV))
        const nor = new THREE.Vector3(Math.cos(thV), 0, Math.sin(thV))
        const dir = new THREE.Vector3().addScaledVector(tan, Math.cos(yaw)).addScaledVector(nor, Math.sin(yaw))
        camera.lookAt(camera.position.clone().add(dir).add(new THREE.Vector3(0, pitch, 0)))
      }

      function stepBack() {
        focused = false
        target = focusedAng + D
        glide = { t0: performance.now(), dur: 900, th0: focusedAng, th1: focusedAng + D, r0: camera.position.length(), r1: walk.r, yaw0: Math.PI / 2, yaw1: walk.yaw, y0: PY - 0.52, y1: walk.y, p0: 0, p1: walk.pitch }
        setPanel(null)
      }

      // expose walk to React component
      walkRef.current = (dir: number) => {
        if (focused) { stepBack(); return }
        target += dir * STEP * 3
      }

      // ── interaction ────────────────────────────────────────
      const ray = new THREE.Raycaster(); const mouse = new THREE.Vector2()
      let ptrDown: { x: number; y: number; th: number } | null = null, dragged = false

      canvas.addEventListener("wheel", (e: WheelEvent) => {
        e.preventDefault()
        if (focused) { stepBack(); return }
        target += (e.deltaMode === 1 ? e.deltaY * 33 : e.deltaY) * 0.0016
      }, { passive: false })
      canvas.addEventListener("pointerdown", (e: PointerEvent) => {
        ptrDown = { x: e.clientX, y: e.clientY, th: target }; dragged = false
        canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"
      })
      canvas.addEventListener("pointermove", (e: PointerEvent) => {
        if (!ptrDown) return
        const dx = e.clientX - ptrDown.x, dy = e.clientY - ptrDown.y
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
          dragged = true
          if (focused) { stepBack(); ptrDown = null; return }
          target = ptrDown.th - (Math.abs(dx) > Math.abs(dy) ? dx : dy) * 0.0022
        }
      })
      canvas.addEventListener("pointerup", (e: PointerEvent) => {
        canvas.style.cursor = "grab"
        if (!dragged) {
          const rect = canvas.getBoundingClientRect()
          mouse.set((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
          ray.setFromCamera(mouse, camera)
          const hits = ray.intersectObjects(printMeshes.map(p => p.mesh))
          if (hits.length) {
            const hit = printMeshes.find(p => p.mesh === hits[0].object)!
            const wp = new THREE.Vector3(); hit.mesh.getWorldPosition(wp)
            let ang = Math.atan2(wp.z, wp.x)
            while (ang - th > Math.PI) ang -= 2 * Math.PI
            while (th - ang > Math.PI) ang += 2 * Math.PI
            focusedAng = ang; focused = true
            const rF = hit.isOuter ? R - 4.26 : RIN + 4.26
            const yawF = hit.isOuter ? Math.PI / 2 : -Math.PI / 2
            glide = { t0: performance.now(), dur: 950, th0: th, th1: ang, r0: walk.r, r1: rF, yaw0: walk.yaw, yaw1: yawF, y0: walk.y, y1: PY - 0.52, p0: walk.pitch, p1: 0 }
            setPanel(hit.product)
          } else if (focused) {
            stepBack()
          }
        }
        ptrDown = null
      })
      window.addEventListener("keydown", function onKey(e: KeyboardEvent) {
        if (disposed) { window.removeEventListener("keydown", onKey); return }
        if (e.key === "Escape") stepBack()
        if (e.key === "ArrowRight" || e.key === "ArrowDown") { if (focused) stepBack(); else target += STEP * 3 }
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") { if (focused) stepBack(); else target -= STEP * 3 }
      })

      // ── resize ─────────────────────────────────────────────
      const obs = new ResizeObserver(() => {
        const W = canvas.clientWidth, H = canvas.clientHeight
        renderer.setSize(W, H, false); camera.aspect = W / H
        camera.fov = W < H ? 70 : 56; camera.updateProjectionMatrix()
      })
      obs.observe(canvas)
      obs.unobserve(canvas); obs.observe(canvas) // force initial call
      {
        const W = canvas.clientWidth || innerWidth, H = canvas.clientHeight || 480
        renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix()
      }

      // ── render loop ────────────────────────────────────────
      let last = 0, rafId = 0
      function frame(now: number) {
        if (disposed) return
        rafId = requestAnimationFrame(frame)
        const dt = Math.min((now - last) / 1000, 0.1); last = now
        if (glide) {
          const t = Math.min(1, (now - glide.t0) / glide.dur); const e = easeOut4(t); const e2 = easeOut2(t)
          pose(lerp(glide.th0, glide.th1, e), lerp(glide.r0, glide.r1, e2), lerp(glide.yaw0, glide.yaw1, e2), lerp(glide.y0, glide.y1, e2), lerp(glide.p0, glide.p1, e2))
          if (!focused) th = lerp(glide.th0, glide.th1, e)
          if (t >= 1) { th = glide.th1; glide = null }
        } else if (!focused) {
          th += (target - th) * (1 - Math.exp(-dt / 0.36))
          pose(th, walk.r, walk.yaw, walk.y, walk.pitch)
        }
        renderer.render(scene, camera)
      }
      rafId = requestAnimationFrame(frame)

      // cleanup stored on canvas for effect cleanup
      ;(canvas as any).__sotaCleanup = () => {
        disposed = true
        cancelAnimationFrame(rafId)
        obs.disconnect()
        renderer.dispose()
        scene.traverse(obj => {
          if ((obj as ThreeTypes.Mesh).isMesh) {
            const m = obj as ThreeTypes.Mesh
            m.geometry.dispose()
            if (Array.isArray(m.material)) m.material.forEach((mt: ThreeTypes.Material) => mt.dispose())
            else (m.material as ThreeTypes.Material).dispose()
          }
        })
      }
    })

    return () => {
      disposed = true
      ;(canvas as any).__sotaCleanup?.()
    }
  }, [products])

  return (
    <div className="relative w-full" style={{ height: "calc(100vh - 112px)", minHeight: 480 }}>
      <canvas ref={canvasRef} className="block w-full h-full" style={{ cursor: "grab" }} />

      {/* walk hint */}
      <div className="pointer-events-none absolute bottom-6 right-6 text-right font-mono text-[10px] uppercase tracking-widest text-stone-500">
        <span className="block">Cuộn hoặc kéo để đi dọc hành lang</span>
        <span className="block">Click sản phẩm để xem chi tiết</span>
      </div>

      {/* nav arrows */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        <button onClick={() => walkRef.current(-1)} className="size-10 rounded-full border border-stone-300 bg-white/90 flex items-center justify-center hover:bg-stone-100 shadow-sm"><ChevronLeft className="size-4" /></button>
        <button onClick={() => walkRef.current(1)} className="size-10 rounded-full border border-stone-300 bg-white/90 flex items-center justify-center hover:bg-stone-100 shadow-sm"><ChevronRight className="size-4" /></button>
      </div>

      {/* product panel */}
      <div className={`absolute inset-y-0 right-0 w-72 md:w-80 bg-[#fcfbf9] border-l border-[#d4af37]/35 shadow-xl flex flex-col transition-transform duration-300 ${panel ? "translate-x-0" : "translate-x-full"}`}>
        {panel && (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
              <span className="font-mono text-[10px] uppercase tracking-widest text-stone-500">{panel.category}</span>
              <button onClick={() => setPanel(null)} className="p-1 hover:bg-stone-100 rounded"><X className="size-4 text-stone-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="w-full aspect-[3/4] rounded mb-4" style={{ background: (CAT_PALETTE[panel.category] ?? { bg: "#B8CCBE" }).bg }} />
              <h3 className="font-heading text-xl font-light italic text-stone-900 leading-snug">{panel.name}</h3>
              <p className="mt-1 font-heading text-lg font-semibold text-[#92400e]">{formatPrice(panel.price)}</p>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{panel.description}</p>
              {panel.inventory === 0 && <p className="mt-3 font-mono text-xs tracking-wider text-red-600">HẾT HÀNG</p>}
            </div>
            <div className="border-t border-stone-200 px-5 py-4 flex flex-col gap-2">
              <button
                onClick={() => { addItem({ productId: panel.id, name: panel.name, price: panel.price, image: panel.image }); setPanel(null) }}
                disabled={panel.inventory === 0}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#d4af37] bg-[#08162b] py-2.5 text-xs font-semibold uppercase tracking-wider text-[#fbe396] transition hover:bg-[#0f2040] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag className="size-3.5" />
                Thêm vào giỏ
              </button>
              <Link href={`/cua-hang/${panel.slug}`} className="text-center font-mono text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900 transition border-b border-transparent hover:border-stone-400 pb-0.5">
                Xem chi tiết →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
