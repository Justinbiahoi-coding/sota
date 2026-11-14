"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { SplitText } from "gsap/SplitText"
import { Physics2DPlugin } from "gsap/Physics2DPlugin"

gsap.registerPlugin(useGSAP, SplitText, Physics2DPlugin)

// The opening: the Castle over its reflecting pool, read as a window rather than a photo. The
// picture is one WebGL quad whose shader does the depth work (parallax that grows toward the near
// water, ripples where the pointer touches the pool, the vignette); GSAP does everything in the DOM
// (the perspective tilt of the whole stage, three depths of drifting petals that land as ripples,
// a petal burst on the trees, the entrance, the exit).
const SRC = "/intro/pool.webp"
const IMG_ASPECT = 16 / 9
const WATER = 0.31 // the water line, image uv from the bottom (just under the pool's stone rim)
const ZOOM = 1.14 // headroom so the strong depth parallax never samples past the image edge
const MAX_RIPPLES = 8

const VERT = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}`
const FRAG = `precision highp float;uniform sampler2D t;uniform vec2 res,img,m;uniform float z,time,wl;uniform vec4 rip[${MAX_RIPPLES}];varying vec2 v;
void main(){float ra=res.x/res.y,ia=img.x/img.y;vec2 s=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);
vec2 uv=(v-.5)*s/z+.5;float depth=smoothstep(.15,1.,1.-v.y);uv+=m*(.009+depth*.05)*s;
float water=1.-smoothstep(wl-.015,wl+.015,uv.y);
vec2 d=vec2(sin(uv.y*90.+time*1.4),cos(uv.x*70.+time*1.1))*.0012;float glint=0.;
for(int i=0;i<${MAX_RIPPLES};i++){vec4 r=rip[i];float age=time-r.z;if(age<0.||age>2.2)continue;
vec2 dv=(v-r.xy)*vec2(ra,1.);float dist=length(dv),rad=age*.22;
float ring=sin((dist-rad)*55.)*exp(-abs(dist-rad)*28.)*(1.-age/2.2)*r.w;
d+=dv/max(dist,1e-4)*ring*.014;glint+=abs(ring)*.25;}
uv+=d*water;vec3 c=texture2D(t,uv).rgb;
vec2 px=1./img;
vec3 nb=texture2D(t,uv+vec2(px.x,0.)).rgb+texture2D(t,uv-vec2(px.x,0.)).rgb
       +texture2D(t,uv+vec2(0.,px.y)).rgb+texture2D(t,uv-vec2(0.,px.y)).rgb;
c=clamp(c+(c-nb*.25)*.55,0.,1.);
c+=water*glint*vec3(.9,.95,1.);
c*=1.28;c=pow(c,vec3(.9));
float lum=dot(c,vec3(.299,.587,.114));c=mix(vec3(lum),c,1.12);
c*=1.-smoothstep(.55,1.,distance(v,vec2(.5)))*.26;gl_FragColor=vec4(c,1.);}`

// where the water line sits on screen (inverse of the shader's cover fit)
const waterScreenY = () => {
  const ra = innerWidth / innerHeight
  const sy = ra > IMG_ASPECT ? IMG_ASPECT / ra : 1
  return (1 - ((WATER - 0.5) * ZOOM) / sy - 0.5) * innerHeight
}
const inWater = (clientY: number) => clientY > waterScreenY()

type Layer = { n: number; size: [number, number]; z: number; blur: number; alpha: number; dur: [number, number]; sway: number; ripple?: boolean }
const LAYERS: Layer[] = [
  { n: 12, size: [5, 8], z: 0, blur: 1, alpha: 0.55, dur: [16, 22], sway: 40 },
  { n: 12, size: [9, 13], z: 90, blur: 0, alpha: 0.85, dur: [11, 15], sway: 70 },
  { n: 8, size: [15, 22], z: 220, blur: 0, alpha: 1, dur: [7, 10], sway: 110, ripple: true },
]

type Gl = { pointer: (x: number, y: number) => void; ripple: (cx: number, cy: number, strength: number) => void }
const rnd = gsap.utils.random

export function CastleIntro() {
  const section = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const fx = useRef<HTMLDivElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const gl = useRef<Gl | null>(null)
  const [closed, setClosed] = useState(false)
  const [drawn, setDrawn] = useState(false)

  // the page underneath does not scroll while the intro is up
  useEffect(() => {
    const html = document.documentElement, before = html.style.overflow
    html.style.overflow = "hidden"
    return () => { html.style.overflow = before }
  }, [])

  // ---------------------------------------------------------------- the picture (raw WebGL)
  useEffect(() => {
    const cv = canvas.current!
    const g = cv.getContext("webgl2") ?? cv.getContext("webgl")
    if (!g) return
    const shader = (type: number, src: string) => {
      const s = g.createShader(type)!
      g.shaderSource(s, src); g.compileShader(s)
      return s
    }
    const prog = g.createProgram()!
    g.attachShader(prog, shader(g.VERTEX_SHADER, VERT))
    g.attachShader(prog, shader(g.FRAGMENT_SHADER, FRAG))
    g.linkProgram(prog); g.useProgram(prog)
    g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer())
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW)
    const p = g.getAttribLocation(prog, "p")
    g.enableVertexAttribArray(p); g.vertexAttribPointer(p, 2, g.FLOAT, false, 0, 0)
    const u = (n: string) => g.getUniformLocation(prog, n)
    const uRes = u("res"), uImg = u("img"), uM = u("m"), uZ = u("z"), uT = u("time"), uRip = u("rip[0]")
    g.uniform1f(u("wl"), WATER)
    g.bindTexture(g.TEXTURE_2D, g.createTexture())
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR)
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR)
    g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true)

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    const t0 = performance.now()
    const rip = new Float32Array(MAX_RIPPLES * 4).fill(-10)
    let ri = 0, mx = 0, my = 0, ax = 0, ay = 0, raf = 0, ready = false
    const size = () => {
      const d = Math.min(devicePixelRatio, 2)
      cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d)
      g.viewport(0, 0, cv.width, cv.height)
      g.uniform2f(uRes, cv.width, cv.height)
    }
    const draw = (nowMs: number) => {
      raf = 0
      const t = (nowMs - t0) / 1000
      mx += (ax - mx) * 0.05; my += (ay - my) * 0.05
      g.uniform2f(uM, mx, -my)
      g.uniform1f(uT, t)
      g.uniform1f(uZ, still ? ZOOM : ZOOM + Math.sin(t / 9) * 0.03)
      g.uniform4fv(uRip, rip)
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4)
      if (!still) raf = requestAnimationFrame(draw)
    }
    const kick = () => { if (ready && !raf) raf = requestAnimationFrame(draw) }
    const onResize = () => { size(); kick() }
    addEventListener("resize", onResize)
    gl.current = {
      pointer: (x, y) => { ax = x; ay = y },
      ripple: (cx, cy, strength) => {
        if (still) return
        rip.set([cx / innerWidth, 1 - cy / innerHeight, (performance.now() - t0) / 1000, strength], ri * 4)
        ri = (ri + 1) % MAX_RIPPLES
      },
    }

    const img = new Image()
    img.src = SRC
    img.decode().then(() => {
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, img)
      // (mipmaps on a non-power-of-two texture: WebGL2 only; they keep the downscale from shimmering)
      if (typeof WebGL2RenderingContext !== "undefined" && g instanceof WebGL2RenderingContext) {
        g.generateMipmap(g.TEXTURE_2D)
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR_MIPMAP_LINEAR)
      }
      g.uniform2f(uImg, img.naturalWidth, img.naturalHeight)
      size()
      ready = true
      kick()
      setDrawn(true)
    }).catch(() => {})

    // (the context is kept: a lost context stays lost on this canvas, and React dev remounts the effect)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener("resize", onResize)
      gl.current = null
    }
  }, [])

  // ---------------------------------------------------------------- the motion (GSAP)
  const { contextSafe } = useGSAP(() => {
    const sec = section.current!, st = stage.current!
    const mm = gsap.matchMedia()
    mm.add({ still: "(prefers-reduced-motion: reduce)", motion: "(prefers-reduced-motion: no-preference)" }, (ctx) => {
      const still = !!ctx.conditions?.still

      // entrance: caption, title letter by letter from under a mask, then the button
      gsap.timeline({ defaults: { ease: "power3.out", duration: still ? 0 : 1 } })
        .from(".cap", { y: 16, autoAlpha: 0 }, 0.2)
        .from(".cta", { y: 16, autoAlpha: 0 }, 1)
      SplitText.create(title.current!, {
        type: "words,chars", mask: "chars", autoSplit: true,
        onSplit: (self) => gsap.from(self.chars, { yPercent: 110, duration: still ? 0 : 0.9, stagger: 0.025, ease: "power3.out", delay: 0.35 }),
      })
      if (still) return

      // the stage tilts after the pointer (perspective on the section), the shader parallaxes with it
      gsap.set(st, { scale: 1.1 })
      // camera: dolly-in on entrance, then a slow depth drift so the scene never sits still
      gsap.from(st, { z: -180, duration: 2.4, ease: "power3.out" }) // (z only — rotation belongs to the pointer quickTo)
      gsap.to(st, { z: 26, duration: 8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 2.4 })
      const rotX = gsap.quickTo(st, "rotationX", { duration: 0.9, ease: "power3" })
      const rotY = gsap.quickTo(st, "rotationY", { duration: 0.9, ease: "power3" })
      let lastT = 0, lx = 0, ly = 0
      const onMove = (e: PointerEvent) => {
        const x = (e.clientX / innerWidth) * 2 - 1, y = (e.clientY / innerHeight) * 2 - 1
        gl.current?.pointer(x, y)
        rotY(x * 4.5); rotX(-y * 3.5)
        // a trail of small ripples while the pointer moves over the water
        if (inWater(e.clientY) && e.timeStamp - lastT > 70 && Math.hypot(e.clientX - lx, e.clientY - ly) > 18) {
          lastT = e.timeStamp; lx = e.clientX; ly = e.clientY
          gl.current?.ripple(e.clientX, e.clientY, 0.45)
        }
      }
      const onDown = (e: PointerEvent) => {
        if ((e.target as HTMLElement).closest("a,button")) return
        if (inWater(e.clientY)) gl.current?.ripple(e.clientX, e.clientY, 1)
        else burst(e.clientX, e.clientY)
      }
      sec.addEventListener("pointermove", onMove)
      sec.addEventListener("pointerdown", onDown)

      // the drifting petals: three depths, each one falls to the water line, fades, and starts over
      gsap.utils.toArray<HTMLElement>(".petal", sec).forEach((el) => {
        const L = LAYERS[+el.dataset.layer!]
        const size = rnd(L.size[0], L.size[1]), dur = rnd(L.dur[0], L.dur[1])
        gsap.set(el, { width: size, height: size * 1.3, filter: L.blur ? `blur(${L.blur}px)` : "none" })
        const tl = gsap.timeline({ repeat: -1, repeatRefresh: true })
        tl.fromTo(el,
          { x: () => rnd(-20, innerWidth + 20), y: -30, z: L.z, rotationX: 0, rotationY: 0, rotation: () => rnd(0, 360), autoAlpha: L.alpha },
          { y: () => waterScreenY() + rnd(-6, 6), duration: dur, ease: "none" })
          .to(el, { x: `+=random(-${L.sway},${L.sway})`, duration: dur / 4, repeat: 3, yoyo: true, ease: "sine.inOut" }, 0)
          .to(el, { rotationX: "+=random(300,800)", rotationY: "+=random(300,800)", rotation: "+=random(-180,180)", duration: dur, ease: "none" }, 0)
          .to(el, { autoAlpha: 0, duration: 0.5 }, dur - 0.5)
        if (L.ripple) tl.call(() => gl.current?.ripple(gsap.getProperty(el, "x") as number, waterScreenY(), 0.3), [], dur - 0.45)
        tl.time(rnd(0, dur))
      })

      return () => {
        sec.removeEventListener("pointermove", onMove)
        sec.removeEventListener("pointerdown", onDown)
      }
    })
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") leave() }
    addEventListener("keydown", onKey)
    return () => removeEventListener("keydown", onKey)
  }, { scope: section })

  // a handful of petals thrown off the trees where the pointer lands
  const burst = contextSafe((cx: number, cy: number) => {
    for (let i = 0; i < 14; i++) {
      const el = document.createElement("span")
      el.className = "petal"
      const size = rnd(8, 16)
      fx.current!.appendChild(el)
      gsap.set(el, { width: size, height: size * 1.3, x: cx, y: cy, z: 120, rotation: rnd(0, 360) })
      gsap.to(el, {
        duration: rnd(1.4, 2.2), ease: "none",
        physics2D: { velocity: rnd(120, 320), angle: rnd(200, 340), gravity: 420 },
        rotationX: "+=random(200,600)", rotationY: "+=random(200,600)", autoAlpha: 0,
        onComplete: () => el.remove(),
      })
    }
  })

  const leave = contextSafe(() => {
    gsap.to(section.current, { autoAlpha: 0, duration: 0.7, ease: "power2.inOut", overwrite: true, onComplete: () => setClosed(true) })
  })

  if (closed) return null
  const btn = "placard inline-flex items-center gap-4 whitespace-nowrap rounded-[3px] bg-[#111] py-1.5 pl-5 pr-1.5 text-white"

  return (
    <section
      ref={section}
      role="dialog"
      aria-modal="true"
      aria-label="Phần mở đầu"
      className="fixed inset-0 z-50 select-none overflow-hidden bg-[#1c1a17] text-white"
      style={{ perspective: 1200 }}
    >
      <div ref={stage} className="absolute inset-0 will-change-transform" style={{ transformStyle: "preserve-3d" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SRC} alt="" className="absolute inset-0 size-full object-cover" draggable={false} />
        <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" style={{ transition: "opacity 600ms ease", opacity: drawn ? 1 : 0 }} />
        <div ref={fx} aria-hidden className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {LAYERS.flatMap((L, li) => Array.from({ length: L.n }, (_, i) => <span key={`${li}-${i}`} className="petal" data-layer={li} />))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/20" />

      <Link href="/" onClick={leave} className="absolute left-5 top-4 font-heading text-3xl italic md:left-8">Sota</Link>
      <Link href="/dang-nhap" className={`${btn} absolute right-4 top-4 py-1 pl-4 md:right-8`}>
        Đăng nhập<span className="grid size-7 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
      </Link>

      <div className="absolute inset-x-0 top-[42%] -translate-y-1/2 px-5 text-center md:px-8">
        <p className="cap placard text-white/90 [text-shadow:0_1px_12px_rgb(0_0_0/0.7)]">Cụm bảo tàng Smithsonian · Washington, D.C.</p>
        <h1 ref={title} className="mt-5 font-heading text-5xl font-light leading-[1.05] tracking-tight [text-shadow:0_2px_24px_rgb(0_0_0/0.45)] sm:text-7xl xl:text-[7rem]">Space of the Art.</h1>
        <button onClick={leave} className={`cta ${btn} mt-10`}>
          Khám phá<span className="grid size-8 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
        </button>
      </div>

      <p className="placard pointer-events-none absolute bottom-5 left-5 text-white/60 md:bottom-6 md:left-8">10 · 08 · 1846 — Smithsonian Institution</p>
      <p className="placard pointer-events-none absolute bottom-5 inset-x-0 hidden text-center text-white/45 sm:block">Chạm vào mặt nước · nhấn vào hàng cây</p>
      <button onClick={leave} className="placard absolute bottom-5 right-5 opacity-60 transition-opacity hover:opacity-100 md:bottom-6 md:right-8">Bỏ qua</button>
    </section>
  )
}
