"use client"
import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import { ORNAMENT_TOP, ORNAMENT_BOTTOM, ORNAMENT_LEFT, ORNAMENT_RIGHT } from "./ornament-assets"

// --- Museum destination data ---
const PINS = [
  {
    slug: "lich-su-hoa-ky",
    href: "/bao-tang/lich-su-hoa-ky",
    label: "Lịch sử Hoa Kỳ",
    accent: "#f87171",
    title: "Lịch sử Hoa Kỳ",
    desc: "Di sản văn hoá và lịch sử dân tộc Mỹ qua các thế kỷ — từ cách mạng đến kỷ nguyên số.",
    hours: "10:00–17:30",
    cta: "Tham quan",
  },
  {
    slug: "phong-tranh-chan-dung",
    href: "/bao-tang/phong-tranh-chan-dung",
    label: "Phòng tranh Chân dung",
    accent: "#f472b6",
    title: "Phòng tranh Chân dung",
    desc: "Hơn 23.000 bức chân dung ghi lại lịch sử và văn hoá Hoa Kỳ từ thế kỷ 18 đến nay.",
    hours: "11:30–19:00",
    cta: "Tham quan",
  },
  {
    slug: "dat-ve",
    href: "/dat-ve",
    label: "Đặt vé",
    accent: "#fbbf24",
    title: "Đặt vé tham quan",
    desc: "Mua vé trước để ưu tiên vào cửa không chờ đợi — có vé gia đình và nhóm học sinh.",
    hours: null,
    cta: "Đặt ngay",
  },
  {
    slug: "lich-su-tu-nhien",
    href: "/bao-tang/lich-su-tu-nhien",
    label: "Lịch sử Tự nhiên",
    accent: "#38bdf8",
    title: "Lịch sử Tự nhiên",
    desc: "Hành trình 500 triệu năm qua các kỷ địa chất, từ đại dương nguyên thuỷ đến thế giới hiện đại.",
    hours: "10:00–17:30",
    cta: "Tham quan",
  },
  {
    slug: "trang-chu",
    href: "/",
    label: "Trang chủ",
    accent: "#34d399",
    title: "Smithsonian Institution",
    desc: "Khám phá toàn bộ cụm bảo tàng Smithsonian trong một trải nghiệm số hoá thống nhất.",
    hours: null,
    cta: "Về trang chủ",
  },
  {
    slug: "cua-hang",
    href: "/cua-hang",
    label: "Cửa hàng",
    accent: "#818cf8",
    title: "Cửa hàng Smithsonian",
    desc: "Quà lưu niệm và vật phẩm độc quyền từ Smithsonian — từ mô hình 3D đến sách nghệ thuật.",
    hours: null,
    cta: "Vào cửa hàng",
  },
  {
    slug: "trien-lam",
    href: "/trien-lam",
    label: "Triển lãm",
    accent: "#fb923c",
    title: "Triển lãm",
    desc: "Các triển lãm chuyên đề xoay quanh nghệ thuật, lịch sử và khoa học — cập nhật theo mùa và theo sự kiện đặc biệt.",
    hours: "10:00–18:00",
    cta: "Xem lịch triển lãm",
  },
  {
    slug: "lien-he",
    href: "/lien-he",
    label: "Liên hệ",
    accent: "#a78bfa",
    title: "Liên hệ",
    desc: "Hỗ trợ tham quan, hợp tác giáo dục và truyền thông — đội ngũ Sota luôn sẵn sàng lắng nghe.",
    hours: null,
    cta: "Gửi tin nhắn",
  },
]

// Building sprite positions extracted from colosseum site CSS
// left/top/width/height as fractions of the base map canvas (1672×941)
const BUILDINGS = [
  { slug: "lich-su-hoa-ky",       src: "/map-art-arbitrum.webp",   left:0.0898, top:0.0528, w:0.2258, h:0.3801 },
  { slug: "phong-tranh-chan-dung", src: "/map-art-zcash.webp",      left:0.2666, top:0.0844, w:0.2248, h:0.2475 },
  { slug: "dat-ve",               src: "/map-art-ethereum.webp",   left:0.5088, top:0.2231, w:0.1803, h:0.3955 },
  { slug: "lich-su-tu-nhien",     src: "/map-art-robinhood.webp",  left:0.0420, top:0.3390, w:0.2029, h:0.2631 },
  { slug: "trang-chu",            src: "/map-art-base.webp",       left:0.0740, top:0.5389, w:0.2161, h:0.3201 },
  { slug: "cua-hang",             src: "/map-art-tempo.webp",      left:0.4155, top:0.5146, w:0.2443, h:0.3140 },
  { slug: "trien-lam",           src: "/map-art-solana.webp",     left:0.4004, top:0.1366, w:0.1977, h:0.3152 },
  { slug: "lien-he",             src: "/map-art-hyperliquid.webp",left:0.2583, top:0.6156, w:0.2077, h:0.2869 },
]

// --- GLSL ---
const VS = `
attribute vec2 aPos;
attribute vec2 aUv;
varying vec2 vUv;
void main() {
  vUv = aUv;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`

const FS_BASE = `
precision mediump float;
uniform sampler2D uTex;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(uTex, vUv);
  float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  gl_FragColor = vec4(vec3(g * 0.35), 1.0);
}`

const FS_LAYER = `
precision mediump float;
uniform sampler2D uTex;
uniform float uGlow;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(uTex, vUv);
  if (c.a < 0.04) discard;
  float g = dot(c.rgb, vec3(0.299, 0.587, 0.114));
  vec3 dark = vec3(g * 0.35);
  vec3 lit  = c.rgb * vec3(1.25, 1.1, 0.6) + vec3(0.1, 0.05, 0.0);
  gl_FragColor = vec4(mix(dark, lit, uGlow), c.a);
}`

// --- WebGL helpers ---
function makeProgram(gl: WebGLRenderingContext, vs: string, fs: string) {
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src); gl.compileShader(s)
    return s
  }
  const p = gl.createProgram()!
  gl.attachShader(p, compile(gl.VERTEX_SHADER, vs))
  gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(p)
  return p
}

function makeTexture(gl: WebGLRenderingContext, img: HTMLImageElement) {
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  return tex
}

// Convert CSS % rect [0,1] → 4-vertex triangle-strip buffer (pos xy + uv)
function buildQuadBuffer(gl: WebGLRenderingContext, left: number, top: number, w: number, h: number) {
  const x0 = left * 2 - 1,         x1 = (left + w) * 2 - 1
  const y0 = 1 - top * 2,           y1 = 1 - (top + h) * 2
  const buf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  // TL, BL, TR, BR  (triangle strip)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x0, y0,  0, 0,
    x0, y1,  0, 1,
    x1, y0,  1, 0,
    x1, y1,  1, 1,
  ]), gl.STATIC_DRAW)
  return buf
}

type HitData = { data: Uint8ClampedArray; w: number; h: number }

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.onload = () => res(img)
    img.onerror = rej
    img.src = src
  })
}

function buildHitData(img: HTMLImageElement, scale = 0.5): HitData {
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const c = document.createElement("canvas")
  c.width = w; c.height = h
  c.getContext("2d")!.drawImage(img, 0, 0, w, h)
  return { data: c.getContext("2d")!.getImageData(0, 0, w, h).data, w, h }
}

function bindBuffer(gl: WebGLRenderingContext, prog: WebGLProgram, buf: WebGLBuffer) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buf)
  const pos = gl.getAttribLocation(prog, "aPos")
  const uv  = gl.getAttribLocation(prog, "aUv")
  gl.enableVertexAttribArray(pos)
  gl.enableVertexAttribArray(uv)
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 16, 0)
  gl.vertexAttribPointer(uv,  2, gl.FLOAT, false, 16, 8)
}

// --- Component ---
export function MuseumMapGL() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState("trang-chu")
  const [loaded, setLoaded] = useState(false)
  const activeRef = useRef("trang-chu")
  useEffect(() => { activeRef.current = active }, [active])

  const glowRef = useRef<Record<string, number>>(
    Object.fromEntries(PINS.map(p => [p.slug, p.slug === "trang-chu" ? 1 : 0]))
  )
  const hitRef = useRef<Record<string, HitData>>({})

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let disposed = false, rafId = 0

    const glRaw = canvas.getContext("webgl", { alpha: false })
    if (!glRaw) return
    const gl: WebGLRenderingContext = glRaw

    const W = 1672, H = 941
    canvas.width = W; canvas.height = H
    gl.viewport(0, 0, W, H)
    gl.clearColor(0.11, 0.09, 0.06, 1)

    const progBase  = makeProgram(gl, VS, FS_BASE)
    const progLayer = makeProgram(gl, VS, FS_LAYER)

    // Fullscreen quad for base map
    const baseQuad = buildQuadBuffer(gl, 0, 0, 1, 1)

    let baseTex: WebGLTexture | null = null
    const layerData: Array<{ tex: WebGLTexture; buf: WebGLBuffer }> = []

    async function init() {
      const baseImg = await loadImage("/wf-base.webp")
      if (disposed) return
      baseTex = makeTexture(gl, baseImg)

      await Promise.all(BUILDINGS.map(async (b, i) => {
        const img = await loadImage(b.src)
        if (disposed) return
        layerData[i] = {
          tex: makeTexture(gl, img),
          buf: buildQuadBuffer(gl, b.left, b.top, b.w, b.h),
        }
        hitRef.current[b.slug] = buildHitData(img)
      }))

      if (!disposed) { setLoaded(true); startLoop() }
    }

    // Cache uniform locations once (getUniformLocation is an IPC call to GPU driver)
    const uBaseTex  = gl.getUniformLocation(progBase,  "uTex")
    const uLayerTex = gl.getUniformLocation(progLayer, "uTex")
    const uGlow     = gl.getUniformLocation(progLayer, "uGlow")

    let lastT = 0
    function startLoop() {
      function frame(t: number) {
        if (disposed) return
        const dt = Math.min((t - lastT) / 1000, 0.05)
        lastT = t

        // Animate glow
        const cur = activeRef.current
        for (const p of PINS) {
          const target = p.slug === cur ? 1 : 0
          const v = glowRef.current[p.slug] ?? 0
          glowRef.current[p.slug] = v + (target - v) * Math.min(1, 7 * dt)
        }

        gl.clear(gl.COLOR_BUFFER_BIT)

        // 1. Base map (darkened, full canvas)
        gl.disable(gl.BLEND)
        gl.useProgram(progBase)
        bindBuffer(gl, progBase, baseQuad)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, baseTex)
        gl.uniform1i(uBaseTex, 0)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

        // 2. Building layers with alpha blend
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        gl.useProgram(progLayer)
        gl.uniform1i(uLayerTex, 0)

        BUILDINGS.forEach((b, i) => {
          const ld = layerData[i]
          if (!ld) return
          bindBuffer(gl, progLayer, ld.buf)
          gl.bindTexture(gl.TEXTURE_2D, ld.tex)
          gl.uniform1f(uGlow, glowRef.current[b.slug] ?? 0)
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        })

        rafId = requestAnimationFrame(frame)
      }
      rafId = requestAnimationFrame(frame)
    }

    init().catch(() => { /* images failed to load — stay in loading state */ })
    return () => {
      disposed = true
      cancelAnimationFrame(rafId)
      // Free GPU resources explicitly to avoid leaking WebGL memory on remount
      if (baseTex) gl.deleteTexture(baseTex)
      gl.deleteBuffer(baseQuad)
      gl.deleteProgram(progBase)
      gl.deleteProgram(progLayer)
      layerData.forEach(ld => { if (ld) { gl.deleteTexture(ld.tex); gl.deleteBuffer(ld.buf) } })
    }
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const cw = rect.width, ch = rect.height

    // Test front-to-back (last rendered = frontmost)
    for (let i = BUILDINGS.length - 1; i >= 0; i--) {
      const b = BUILDINGS[i]
      const bx = b.left * cw, by = b.top * ch
      const bw = b.w * cw,   bh = b.h * ch

      if (mx < bx || mx > bx + bw || my < by || my > by + bh) continue

      const hd = hitRef.current[b.slug]
      if (!hd) continue

      const u = (mx - bx) / bw
      const v = (my - by) / bh
      const px = Math.floor(u * hd.w)
      const py = Math.floor(v * hd.h)
      const alpha = hd.data[(py * hd.w + px) * 4 + 3]

      if (alpha > 32) { setActive(b.slug); return }
    }
  }, [])

  const sel = PINS.find(p => p.slug === active)!

  return (
    <section className="bg-water relative" style={{ paddingBlock: "96px 80px" }}>
      <div style={{ maxWidth: 1440, marginInline: "auto", paddingInline: 32, position: "relative" }}>

        {/* Heading */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, marginBottom:56 }}>
          <h2 style={{ margin:0, fontWeight:400, lineHeight:1.04, textAlign:"center" }}>
            <span style={{ display:"block", fontSize:60, letterSpacing:"-.03em", fontStyle:"italic", color:"#d4af37", fontFamily:"var(--font-display)" }}>Khám phá</span>
            <span style={{ display:"block", fontSize:56, letterSpacing:"-.02em", color:"#f8f6f0", fontFamily:"var(--font-display)" }}>Các Bảo Tàng</span>
          </h2>
          <p style={{ margin:0, maxWidth:480, fontSize:17, lineHeight:1.6, textAlign:"center", color:"#94a3b8" }}>
            Rê chuột vào công trình để xem thông tin — nhấp để đến thẳng địa điểm đó.
          </p>
        </div>

        {/* Body */}
        <div style={{ display:"grid", gridTemplateColumns:"60fr 40fr", gap:32, alignItems:"stretch" }}>

          {/* WebGL canvas — ornate pixel-art frame */}
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:66, pointerEvents:"none", backgroundImage:`url("${ORNAMENT_TOP}")`, backgroundRepeat:"repeat-x", backgroundSize:"212px 66px" }} />
            <div style={{ position:"absolute", bottom:0, left:0, right:0, height:66, pointerEvents:"none", backgroundImage:`url("${ORNAMENT_BOTTOM}")`, backgroundRepeat:"repeat-x", backgroundSize:"212px 66px" }} />
            <div style={{ position:"absolute", top:66, bottom:66, left:0, width:67, pointerEvents:"none", backgroundImage:`url("${ORNAMENT_LEFT}")`, backgroundRepeat:"repeat-y", backgroundSize:"67px 214px" }} />
            <div style={{ position:"absolute", top:66, bottom:66, right:0, width:67, pointerEvents:"none", backgroundImage:`url("${ORNAMENT_RIGHT}")`, backgroundRepeat:"repeat-y", backgroundSize:"67px 214px" }} />

            <div style={{ padding:"66px 67px" }}>
              <div style={{ border:"2px solid #4a3f6b", padding:4, backgroundColor:"#0d0a14", position:"relative", overflow:"hidden" }}>
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleMouseMove}
                  onClick={handleMouseMove as unknown as React.MouseEventHandler<HTMLCanvasElement>}
                  style={{ width:"135%", aspectRatio:"1672/941", display:"block", cursor:"crosshair", opacity:loaded ? 1 : 0, transition:"opacity .5s" }}
                />
                {!loaded && (
                  <div style={{ position:"absolute", inset:4, display:"flex", alignItems:"center", justifyContent:"center", background:"#1C170F", color:"#7A5A3A", fontSize:11, letterSpacing:"0.2em", fontFamily:"var(--font-label)", textTransform:"uppercase" }}>
                    Đang tải…
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info panel — frosted glass card */}
          <div style={{ display:"flex", alignItems:"stretch" }}>
            <div key={active} style={{
              width:"100%",
              animation:"mapPanelSlide .5s cubic-bezier(.22,.68,0,1.2) both",
              background:"rgba(8,20,42,0.88)",
              backdropFilter:"blur(22px)",
              WebkitBackdropFilter:"blur(22px)",
              borderRadius:14,
              padding:"40px 44px",
              border:"1px solid rgba(212,175,55,0.2)",
              boxShadow:"0 12px 48px rgba(0,0,0,0.4)",
              display:"flex",
              flexDirection:"column",
              justifyContent:"center",
              minHeight:360,
            }}>
              <div style={{ height:3, width:52, background:sel.accent, marginBottom:28 }} />

              <p style={{ margin:"0 0 10px", fontSize:11, letterSpacing:"0.24em", textTransform:"uppercase", color:sel.accent, fontFamily:"var(--font-label)" }}>
                {sel.hours ? "Mở cửa hàng ngày" : "Smithsonian"}
              </p>

              <h3 style={{ margin:"0 0 18px", fontSize:52, fontStyle:"italic", fontWeight:400, color:"#f8f6f0", fontFamily:"var(--font-display)", lineHeight:1.02 }}>
                {sel.title}
              </h3>

              {sel.hours && (
                <p style={{ margin:"0 0 20px", fontSize:34, fontStyle:"italic", fontWeight:400, color:sel.accent, fontFamily:"var(--font-display)", lineHeight:1 }}>
                  {sel.hours}
                </p>
              )}

              <p style={{ margin:"0 0 36px", fontSize:16, lineHeight:1.75, color:"#94a3b8" }}>
                {sel.desc}
              </p>

              <Link
                href={sel.href}
                style={{ display:"inline-flex", alignItems:"center", gap:10, color:sel.accent, fontSize:11, fontFamily:"var(--font-label)", letterSpacing:"0.18em", textTransform:"uppercase", textDecoration:"none", borderBottom:`1px solid ${sel.accent}55`, paddingBottom:3, transition:"border-color .2s, gap .2s", width:"fit-content" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=sel.accent; e.currentTarget.style.gap="16px" }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=sel.accent+"55"; e.currentTarget.style.gap="10px" }}
              >
                {sel.cta} →
              </Link>

              <div style={{ display:"flex", gap:8, marginTop:"auto", paddingTop:36 }}>
                {PINS.map(p => (
                  <button key={p.slug} onClick={() => setActive(p.slug)}
                    style={{ width:7, height:7, borderRadius:"50%", border:"none", padding:0, cursor:"pointer", background:p.slug===active ? p.accent : "rgba(42,26,8,0.2)", transition:"background .2s, transform .2s", transform:p.slug===active ? "scale(1.5)" : "scale(1)" }}
                    aria-label={p.label}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
