"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"

// The opening: the Smithsonian Castle full screen, drawn in WebGL as one quad with one shader (cover
// fit, a slow breathing zoom, a little parallax after the pointer, a vignette). The plain image sits
// underneath, so it shows while the texture loads and stands in without WebGL. Leaving ("Khám phá",
// "Bỏ qua", Esc) fades onto the home page.
const SRC = "/intro/castle.avif"
const FADE = 700

const VERT = `attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}`
const FRAG = `precision mediump float;uniform sampler2D t;uniform vec2 res,img,m;uniform float z;varying vec2 v;
void main(){float ra=res.x/res.y,ia=img.x/img.y;vec2 s=ra>ia?vec2(1.,ia/ra):vec2(ra/ia,1.);
vec2 uv=(v-.5)*s/z+.5+m*.012*s;vec3 c=texture2D(t,uv).rgb;
c*=1.-smoothstep(.4,1.,distance(v,vec2(.5)))*.5;gl_FragColor=vec4(c,1.);}`

export function CastleIntro() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [closed, setClosed] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const left = useRef(false)

  const leave = useCallback(() => {
    if (left.current) return
    left.current = true
    setLeaving(true)
    setTimeout(() => setClosed(true), FADE)
  }, [])

  // the page underneath does not scroll while the intro is up; Esc leaves
  useEffect(() => {
    if (closed) return
    const html = document.documentElement, before = html.style.overflow
    html.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") leave() }
    addEventListener("keydown", onKey)
    return () => { html.style.overflow = before; removeEventListener("keydown", onKey) }
  }, [closed, leave])

  useEffect(() => {
    if (closed) return
    const cv = canvas.current!
    const gl = cv.getContext("webgl2") ?? cv.getContext("webgl")
    if (!gl) return
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src); gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog); gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const p = gl.getAttribLocation(prog, "p")
    gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, "res"), uImg = gl.getUniformLocation(prog, "img")
    const uM = gl.getUniformLocation(prog, "m"), uZ = gl.getUniformLocation(prog, "z")
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches
    let mx = 0, my = 0, ax = 0, ay = 0, raf = 0, ready = false
    const size = () => {
      const d = Math.min(devicePixelRatio, 1.5)
      cv.width = Math.round(innerWidth * d); cv.height = Math.round(innerHeight * d)
      gl.viewport(0, 0, cv.width, cv.height)
      gl.uniform2f(uRes, cv.width, cv.height)
    }
    const draw = (now: number) => {
      raf = 0
      mx += (ax - mx) * 0.05; my += (ay - my) * 0.05
      gl.uniform2f(uM, mx, -my)
      gl.uniform1f(uZ, still ? 1.04 : 1.06 + Math.sin(now / 9000) * 0.03)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      if (!still) raf = requestAnimationFrame(draw)
    }
    const kick = () => { if (ready && !raf) raf = requestAnimationFrame(draw) }
    const onResize = () => { size(); kick() }
    const onPointer = (e: PointerEvent) => { ax = (e.clientX / innerWidth) * 2 - 1; ay = (e.clientY / innerHeight) * 2 - 1 }
    addEventListener("resize", onResize)
    if (!still) addEventListener("pointermove", onPointer)

    const img = new Image()
    img.src = SRC
    img.decode().then(() => {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      // (mipmaps on a non-power-of-two texture: WebGL2 only; they keep the downscale from shimmering)
      if (typeof WebGL2RenderingContext !== "undefined" && gl instanceof WebGL2RenderingContext) {
        gl.generateMipmap(gl.TEXTURE_2D)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      }
      gl.uniform2f(uImg, img.naturalWidth, img.naturalHeight)
      size()
      ready = true
      kick()
      setDrawn(true)
    }).catch(() => {})

    // (the context is kept: a lost context stays lost on this canvas, and React dev remounts the effect)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener("resize", onResize)
      removeEventListener("pointermove", onPointer)
    }
  }, [closed])

  if (closed) return null
  const btn = "placard inline-flex items-center gap-4 whitespace-nowrap rounded-[3px] bg-[#111] py-1.5 pl-5 pr-1.5 text-white"
  const tip = "grid size-8 place-items-center rounded-[2px] border border-white/25"

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-label="Phần mở đầu"
      className="fixed inset-0 z-50 select-none overflow-hidden bg-[#1c1a17] text-white"
      style={{ transition: `opacity ${FADE}ms ease`, opacity: leaving ? 0 : 1, pointerEvents: leaving ? "none" : undefined }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={SRC} alt="" className="absolute inset-0 size-full object-cover" draggable={false} />
      <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" style={{ transition: "opacity 600ms ease", opacity: drawn ? 1 : 0 }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35" />

      <Link href="/" onClick={leave} className="absolute left-5 top-4 font-heading text-3xl italic md:left-8">Sota</Link>
      <Link href="/dang-nhap" className={`${btn} absolute right-4 top-4 py-1 pl-4 md:right-8`}>
        Đăng nhập<span className="grid size-7 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
      </Link>

      <div className="absolute inset-x-5 top-1/2 -translate-y-1/2 text-center md:inset-x-8">
        <p className="placard rise text-white/70">Cụm bảo tàng Smithsonian · Washington, D.C.</p>
        <h1 className="rise mt-5 font-heading text-5xl font-light leading-[0.98] tracking-tight [animation-delay:120ms] [text-shadow:0_2px_30px_rgb(0_0_0/0.35)] sm:text-7xl xl:text-[7rem]">Space of the Art.</h1>
        <p className="rise mt-6 font-heading text-xl font-light [animation-delay:240ms] [text-shadow:0_1px_16px_rgb(0_0_0/0.4)] sm:text-2xl">Cụm bảo tàng Smithsonian, một lối vào.</p>
        <button onClick={leave} className={`${btn} rise mt-10 [animation-delay:360ms]`}>
          Khám phá<span className={tip}><ArrowRight className="size-3.5" /></span>
        </button>
      </div>

      <p className="placard pointer-events-none absolute bottom-5 left-5 text-white/60 md:bottom-6 md:left-8">10 · 08 · 1846 — Smithsonian Institution</p>
      <button onClick={leave} className="placard absolute bottom-5 right-5 opacity-60 transition-opacity hover:opacity-100 md:bottom-6 md:right-8">Bỏ qua</button>
    </section>
  )
}
