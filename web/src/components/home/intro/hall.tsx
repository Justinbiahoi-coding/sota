"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { ArrowRight } from "lucide-react"
import gsap from "gsap"
import { museums } from "@/lib/mock-data"

// The hall behind the door: a three-storey atrium built from real geometry (Three.js), one storey per
// museum. The camera walks in from the doorway, lifts its gaze to take in the three floors, and sways
// after the pointer; hovering a floor label rides the camera up to that floor.
import type { BufferGeometry, Material } from "three"

type Three = typeof import("three")
const FLOORS = museums.slice(0, 3)
const W = 18, D = 40, FH = 5.4, H = FH * 3 + 1.4
const SLAB = 4 // balcony depth

// Three cannot parse oklch(); the 2D canvas can
const cssToHex = (css: string) => {
  const c = document.createElement("canvas").getContext("2d")!
  c.fillStyle = css; c.fillRect(0, 0, 1, 1)
  const [r, g, b] = c.getImageData(0, 0, 1, 1).data
  return (r << 16) | (g << 8) | b
}

const tileTexture = (THREE: Three) => {
  const s = 512, cv = document.createElement("canvas"); cv.width = cv.height = s
  const c = cv.getContext("2d")!
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? "#cfc6b8" : "#dcd4c7"; c.fillRect(i * s / 2, j * s / 2, s / 2, s / 2) }
  c.strokeStyle = "#b3a999"; c.lineWidth = 4
  c.strokeRect(0, 0, s, s); c.beginPath(); c.moveTo(s / 2, 0); c.lineTo(s / 2, s); c.moveTo(0, s / 2); c.lineTo(s, s / 2); c.stroke()
  const t = new THREE.CanvasTexture(cv)
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(W / 2, D / 2); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8
  return t
}

export function Hall({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const labels = useRef<(HTMLAnchorElement | null)[]>([])
  const hover = useRef<(k: number | null) => void>(() => {})

  useEffect(() => {
    let dead = false, cleanup = () => {}
    import("three").then((THREE) => {
      if (dead) return
      const cv = canvas.current!
      const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: "high-performance" })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.05
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap

      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xf2ede5)
      scene.fog = new THREE.Fog(0xf2ede5, 24, 70)
      const cam = new THREE.PerspectiveCamera(58, 1, 0.1, 140)

      const wall = new THREE.MeshStandardMaterial({ color: 0xf5f0e8, roughness: 0.92 })
      const trim = new THREE.MeshStandardMaterial({ color: 0xe6dfd3, roughness: 0.85 })
      const stone = new THREE.MeshStandardMaterial({ map: tileTexture(THREE), roughness: 0.42, metalness: 0.04 })
      const dark = new THREE.MeshStandardMaterial({ color: 0x2b2724, roughness: 0.35, metalness: 0.55 })
      const glass = new THREE.MeshStandardMaterial({ color: 0xd4e6ec, transparent: true, opacity: 0.2, roughness: 0.05 })
      const add = (geo: BufferGeometry, mat: Material, x: number, y: number, z: number, rx = 0, ry = 0, shadow = true) => {
        const m = new THREE.Mesh(geo, mat)
        m.position.set(x, y, z); m.rotation.set(rx, ry, 0)
        m.castShadow = shadow; m.receiveShadow = true
        scene.add(m)
        return m
      }

      // the shell
      add(new THREE.PlaneGeometry(W, D), stone, 0, 0, 0, -Math.PI / 2, 0, false)
      add(new THREE.PlaneGeometry(W, D), wall, 0, H, 0, Math.PI / 2, 0, false)
      add(new THREE.PlaneGeometry(W, H), wall, 0, H / 2, -D / 2, 0, 0, false)
      add(new THREE.PlaneGeometry(D, H), wall, -W / 2, H / 2, 0, 0, Math.PI / 2, false)
      add(new THREE.PlaneGeometry(D, H), wall, W / 2, H / 2, 0, 0, -Math.PI / 2, false)
      add(new THREE.PlaneGeometry(W, H), wall, 0, H / 2, D / 2, 0, Math.PI, false)
      // skylight: a glowing slab in the ceiling
      add(new THREE.PlaneGeometry(W * 0.5, D * 0.72), new THREE.MeshBasicMaterial({ color: 0xfff7ea }), 0, H - 0.02, -2, Math.PI / 2, 0, false)

      // the upper storeys: a U of balconies with glass rails, columns underneath
      for (let k = 1; k < 3; k++) {
        const y = FH * k
        add(new THREE.BoxGeometry(SLAB, 0.4, D), trim, -W / 2 + SLAB / 2, y, 0)
        add(new THREE.BoxGeometry(SLAB, 0.4, D), trim, W / 2 - SLAB / 2, y, 0)
        add(new THREE.BoxGeometry(W - 2 * SLAB, 0.4, SLAB), trim, 0, y, -D / 2 + SLAB / 2)
        for (const sx of [-1, 1]) {
          add(new THREE.BoxGeometry(0.04, 1.05, D - SLAB), glass, sx * (W / 2 - SLAB), y + 0.72, SLAB / 2, 0, 0, false)
          add(new THREE.BoxGeometry(0.1, 0.07, D - SLAB), dark, sx * (W / 2 - SLAB), y + 1.26, SLAB / 2)
        }
        add(new THREE.BoxGeometry(W - 2 * SLAB, 1.05, 0.04), glass, 0, y + 0.72, -D / 2 + SLAB, 0, 0, false)
        add(new THREE.BoxGeometry(W - 2 * SLAB, 0.07, 0.1), dark, 0, y + 1.26, -D / 2 + SLAB)
      }
      for (let i = 0; i < 5; i++) for (const sx of [-1, 1])
        add(new THREE.CylinderGeometry(0.3, 0.3, H, 24), trim, sx * (W / 2 - SLAB - 0.35), H / 2, -D / 2 + SLAB + 1 + i * 8)

      // one feature wall per museum, in its colour, on the back wall of its floor
      const anchors = FLOORS.map((m, k) => {
        const y = FH * k + 2.9
        const col = cssToHex(m.accent)
        const mat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.55, emissive: col, emissiveIntensity: 0.18 })
        add(new THREE.PlaneGeometry(8, 3.4), mat, 0, y, -D / 2 + 0.06, 0, 0, false)
        add(new THREE.BoxGeometry(8.4, 0.12, 0.5), dark, 0, y - 1.8, -D / 2 + 0.25)
        return new THREE.Vector3(0, y, -D / 2 + 0.1)
      })

      // light: a soft sky from above, a sun through the skylight, warm lamps on each floor
      scene.add(new THREE.HemisphereLight(0xfff5e8, 0xb5aa99, 1.1))
      const sun = new THREE.DirectionalLight(0xfff0da, 2.4)
      sun.position.set(7, H + 8, 8); sun.target.position.set(0, 0, -8)
      sun.castShadow = true
      sun.shadow.mapSize.set(2048, 2048)
      Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 80 })
      sun.shadow.bias = -0.0005
      scene.add(sun, sun.target)
      FLOORS.forEach((_, k) => {
        const l = new THREE.PointLight(0xffd6a6, 60, 36, 2)
        l.position.set(0, FH * k + 4.2, -D / 2 + 8)
        scene.add(l)
      })

      // the camera: in through the door, gaze rising to the upper floors, then a sway after the pointer
      const look = new THREE.Vector3(0, 2, -D / 2), off = { x: 0, y: 0 }
      cam.position.set(0, 1.6, D / 2 - 0.6)
      const still = matchMedia("(prefers-reduced-motion: reduce)").matches
      if (still) { cam.position.set(0, 2.2, 7); look.y = 7.2 }
      else {
        gsap.to(cam.position, { z: 7, y: 2.2, duration: 4.2, ease: "power2.out" })
        gsap.to(look, { y: 7.2, duration: 4.2, ease: "power2.inOut", delay: 0.5 })
      }
      const offX = gsap.quickTo(off, "x", { duration: 1.2, ease: "power3" })
      const offY = gsap.quickTo(off, "y", { duration: 1.2, ease: "power3" })
      const onMove = (e: PointerEvent) => { offX((e.clientX / innerWidth) * 2 - 1); offY((e.clientY / innerHeight) * 2 - 1) }
      addEventListener("pointermove", onMove)
      hover.current = (k) => {
        if (still) return
        gsap.to(cam.position, { y: k == null ? 2.2 : FH * k + 1.9, duration: 1.4, ease: "power3.inOut", overwrite: "auto" })
        gsap.to(look, { y: k == null ? 7.2 : FH * k + 2.9, duration: 1.4, ease: "power3.inOut", overwrite: "auto" })
      }

      const size = () => {
        const w = innerWidth, h = innerHeight
        renderer.setSize(w, h, false)
        cam.aspect = w / h; cam.updateProjectionMatrix()
      }
      addEventListener("resize", size)
      size()

      const v = new THREE.Vector3()
      const tick = () => {
        cam.lookAt(look.x + off.x * 2.2, look.y - off.y * 1.4, look.z)
        renderer.render(scene, cam)
        anchors.forEach((a, k) => {
          const el = labels.current[k]
          if (!el) return
          v.copy(a).project(cam)
          el.style.transform = `translate(-50%,-50%) translate(${((v.x + 1) / 2) * innerWidth}px,${((1 - v.y) / 2) * innerHeight}px)`
          el.style.visibility = v.z < 1 ? "visible" : "hidden"
        })
      }
      gsap.ticker.add(tick)
      gsap.to(root.current, { autoAlpha: 1, duration: 1.2, ease: "power2.out" })

      cleanup = () => {
        gsap.ticker.remove(tick)
        removeEventListener("pointermove", onMove)
        removeEventListener("resize", size)
        scene.traverse((o) => {
          if (o instanceof THREE.Mesh) { o.geometry.dispose(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()) }
        })
        renderer.dispose()
      }
    })
    return () => { dead = true; cleanup() }
  }, [])

  return (
    <div ref={root} className="absolute inset-0 opacity-0" style={{ visibility: "hidden" }}>
      <canvas ref={canvas} className="absolute inset-0 size-full" />
      {FLOORS.map((m, k) => (
        <Link
          key={m.slug}
          href={`/bao-tang/${m.slug}`}
          ref={(el) => { labels.current[k] = el }}
          onPointerEnter={() => hover.current(k)}
          onPointerLeave={() => hover.current(null)}
          style={{ "--museum-accent": m.accent } as React.CSSProperties}
          className="group absolute left-0 top-0 flex items-center gap-4 whitespace-nowrap rounded-[3px] border-l-4 border-museum bg-[#141210]/85 py-3 pl-5 pr-4 text-white backdrop-blur transition-colors hover:bg-[#141210]"
        >
          <span className="placard text-white/55">Tầng {k + 1}</span>
          <span className="font-heading text-xl md:text-2xl">{m.name}</span>
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ))}
      <p className="placard pointer-events-none absolute bottom-5 left-5 text-[#141210]/70 md:bottom-6 md:left-8">Sảnh chính · chọn một tầng</p>
      <button onClick={onDone} className="placard absolute bottom-5 right-5 text-[#141210]/70 transition-opacity hover:text-[#141210] md:bottom-6 md:right-8">Vào trang chủ</button>
    </div>
  )
}
