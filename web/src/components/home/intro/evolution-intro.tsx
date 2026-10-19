"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { ArrowRight } from "lucide-react"

// The opening, laid out like pear.no: a full-screen story over the whole site (images and films by
// Pear, pear.no, made with AI). A rail down the left (mark, menu, progress ticks), a rule across the
// top, the sign-in button top right. Each visit opens on one of three living paintings, picked at
// random; each has its own film into the pear tree, where the story runs on through Sota's features:
// the collection, the 3D galleries, tickets, questions, the map, and a closing scene.
// Two ways through it, as the visitor likes: scrolling (wheel, trackpad, a drag on a phone) runs the
// films with the hand, like pear.no, forward and back, stopping wherever the hand stops; a click, a
// tap or an arrow key plays the film on to the next painting by itself and rests there. Scrolling
// during a playing film takes over from the frame it is on. The films are encoded with a keyframe
// every third frame, so a seek decodes at most two frames.
// It shows on every visit, like pear.no; leaving (the last scene, "Bỏ qua", Esc) fades it away.
// Media: public/intro/ (films re-encoded from Pear's frame sequences, stills are their end frames).

type Section = "hero" | "collection" | "gallery" | "tickets" | "faq" | "map" | "end"
type Rest = { id: string; section: Section; chapter: string; loop?: string; pos?: string; light?: boolean } // light: a pale painting, ink type over it
type Step = { film: string; fade?: boolean } // fade: the film's first frame differs from the rest before it, so it dissolves in

// the three openings (pos: where the figure stands, kept in frame on a narrow screen)
const HEROES = [
  { id: "signal", pos: "70% 60%" }, // the statue raising a torch over a crowd
  { id: "colossus", pos: "73% 54%" }, // the golden pear on its plinth
  { id: "reveal", pos: "68% 50%" }, // the youth drawing a curtain
]
// the story after the opening, shared by every opening
const SHARED: Rest[] = [
  { id: "collection", section: "collection", chapter: "Bộ sưu tập" },
  { id: "blueprint", section: "gallery", chapter: "Tham quan 3D", light: true },
  { id: "plan", section: "tickets", chapter: "Đặt vé", light: true },
  { id: "garden", section: "faq", chapter: "Hỏi đáp" },
  { id: "sky", section: "map", chapter: "Bản đồ" },
  { id: "couple", section: "end", chapter: "Sota", loop: "couple" },
]
// SHARED_STEPS[i] carries the story from SHARED[i] to SHARED[i + 1]
const SHARED_STEPS: Step[] = [
  { film: "coda", fade: true }, // the scaffold, down to the drawing in her hands
  { film: "plan", fade: true }, // the golden pear on its scaffold, seen from above
  { film: "tree", fade: true }, // the woman picking pears, into the tree
  { film: "flysky" }, // through the leaves and clouds to the stars
  { film: "trans" }, // the stars down to the couple watering the tree
]
const FAQ = [
  { q: "Mua vé ở đâu?", a: "Ngay trên Sota: chọn bảo tàng hoặc triển lãm, chọn ngày và khung giờ còn chỗ rồi thanh toán. Vé có mã QR để quét ở cửa." },
  { q: "Đặt vé nhiều nơi một lúc được không?", a: "Được. Vé của các bảo tàng và triển lãm nằm chung một giỏ hàng, thanh toán một lần." },
  { q: "Hiện vật trên Sota lấy từ đâu?", a: "Từ Smithsonian Open Access: ảnh và thông tin hiện vật Smithsonian công bố miễn phí theo giấy phép CC0." },
  { q: "Đổi ý thì hủy vé thế nào?", a: "Vào Vé của tôi trong trang tài khoản và hủy vé chưa dùng." },
  { q: "Quà lưu niệm giao ra sao?", a: "Đặt trong Cửa hàng, nhập địa chỉ khi thanh toán rồi theo dõi trong Đơn hàng của tôi." },
]
const FADE = 700 // ms, for the words, leaving and jumping
const HOLD = 0.14 // of each gap between two rests, the stretch at either end that holds the rest
const SCROLL = 1200 // px of wheel per gap
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const src = (name: string, ext: "mp4" | "jpg") => `/intro/${name}.${ext}`

// read on the client only: skipped (reduced motion) and which opening to show
const noSubscribe = () => () => {}
const readSkipped = () => matchMedia("(prefers-reduced-motion: reduce)").matches
let pick = -1
const readHero = () => (pick < 0 ? (pick = Math.floor(Math.random() * HEROES.length)) : pick)

export function EvolutionIntro() {
  const root = useRef<HTMLElement>(null)
  const skipped = useSyncExternalStore(noSubscribe, readSkipped, () => false)
  const hero = HEROES[useSyncExternalStore(noSubscribe, readHero, () => 0)]
  const { rests, steps } = useMemo(() => ({
    rests: [{ id: hero.id, section: "hero", chapter: "Mở màn", loop: hero.id, pos: hero.pos }, ...SHARED] as Rest[],
    steps: [{ film: `hero-${hero.id}-in`, fade: true }, ...SHARED_STEPS] as Step[],
  }), [hero])
  const N = rests.length
  const [closed, setClosed] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [at, setAt] = useState(0) // the rest nearest to where the story is
  const [still, setStill] = useState(true) // the story is resting on it: its words show
  const [menu, setMenu] = useState(false)
  const [open, setOpen] = useState<number | null>(null) // the question whose answer shows
  const films = useRef<(HTMLVideoElement | null)[]>([])
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const loops = useRef<Record<string, HTMLVideoElement | null>>({})
  const left = useRef(false)
  const jumpTo = useRef<(i: number) => void>(() => {})
  const visible = !skipped && !closed

  // fade away onto the home page
  const leave = useCallback(() => {
    if (left.current) return
    left.current = true
    setLeaving(true)
    setTimeout(() => setClosed(true), FADE)
  }, [])

  // the page underneath does not scroll while the intro is up
  useEffect(() => {
    if (!visible) return
    const html = document.documentElement, before = html.style.overflow
    html.style.overflow = "hidden"
    return () => { html.style.overflow = before }
  }, [visible])

  // while resting, the living painting there plays (from its first frame, where the film leading
  // here ends); the films either side of the rest are fetched
  useEffect(() => {
    for (const [id, v] of Object.entries(loops.current)) {
      if (!v) continue
      if (id === rests[at].loop && still) { if (v.paused && at > 0) v.currentTime = 0; v.play().catch(() => {}) }
      else v.pause()
    }
    for (const v of [films.current[at], films.current[at - 1]]) if (v && v.preload !== "auto") { v.preload = "auto"; v.load() }
  }, [at, still, visible, rests])

  // the story engine: p runs from 0 to N - 1, each whole number a rest, the films in between
  useEffect(() => {
    if (!visible) return
    const el = root.current!, vids = films.current, rest = layers.current
    let p = 0, target = 0, raf = 0, playing = -1, overflow = 0, near = 0, resting = true
    const through = (u: number) => clamp((u - HOLD) / (1 - 2 * HOLD)) // how far into the film, at u into the gap

    const draw = () => {
      const i = Math.min(Math.floor(p), N - 1), u = p - i
      const show = i < N - 1 && u > HOLD && u < 1 - HOLD ? i : -1 // the film on screen
      const f = through(u), lit = i < N - 1 && u >= 1 - HOLD ? i + 1 : i // the rest on screen when no film is
      rest.forEach((L, k) => {
        if (!L) return
        // under a film: the rest it leaves while it dissolves in, the rest it reaches once it covers
        const on = show < 0 ? k === lit : (k === i && f < 0.15) || (k === i + 1 && f >= 0.12)
        L.style.opacity = on ? "1" : "0"
      })
      vids.forEach((v, k) => {
        if (!v) return
        if (k !== show) { v.style.opacity = "0"; return }
        v.style.opacity = String(steps[k].fade ? clamp(f / 0.12) : 1)
        // scrubbing: seek to the frame, one seek at a time (a playing film runs on its own)
        if (playing !== k && v.duration && !v.seeking && Math.abs(v.currentTime - f * v.duration) > 0.012) v.currentTime = f * v.duration
      })
      const r = Math.round(p), rested = Math.abs(p - r) < HOLD
      if (r !== near) { near = r; setAt(r) }
      if (rested !== resting) { resting = rested; setStill(rested) }
    }
    const frame = () => {
      raf = 0
      if (playing >= 0) {
        const v = vids[playing]!, f = v.duration ? v.currentTime / v.duration : 0
        if (v.ended || f >= 0.998) { p = target = playing + 1; playing = -1 }
        else p = target = playing + HOLD + f * (1 - 2 * HOLD)
      } else {
        p += (target - p) * 0.16
        if (Math.abs(target - p) < 0.0005) p = target
      }
      draw()
      if (playing >= 0 || p !== target) raf = requestAnimationFrame(frame)
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const stop = () => { if (playing >= 0) { vids[playing]?.pause(); playing = -1 } }

    // a click, a tap, an arrow: play on to the next rest (from the frame the story is on)
    const forward = () => {
      if (left.current || playing >= 0) return
      const r = Math.round(p), seg = Math.abs(p - r) < HOLD ? r : Math.floor(p)
      if (seg >= N - 1) return leave()
      const v = vids[seg]
      if (!v) return
      setMenu(false); setOpen(null)
      const f = through(p - seg)
      p = target = seg + HOLD + 0.0001 + f * (1 - 2 * HOLD)
      if (v.duration) v.currentTime = f * v.duration
      playing = seg
      v.play().catch(() => { playing = -1 })
      kick()
    }
    // stepping back, or jumping from the menu: a dissolve straight to that rest
    const jump = (i: number) => {
      if (left.current) return
      stop(); setMenu(false); setOpen(null)
      p = target = clamp(i, 0, N - 1)
      draw()
    }
    jumpTo.current = jump
    const back = () => { const r = Math.round(p); jump(Math.abs(p - r) < HOLD ? r - 1 : Math.floor(p)) }

    // scrolling runs the films with the hand; scrolling on past the last rest leaves
    const scrub = (d: number) => {
      if (left.current) return
      stop()
      if (target >= N - 1 && d > 0) { overflow += d; if (overflow > SCROLL * 0.5) leave(); return }
      overflow = 0
      target = clamp(target + d / SCROLL, 0, N - 1)
      kick()
    }
    const onWheel = (e: WheelEvent) => { e.preventDefault(); scrub(e.deltaMode === 1 ? e.deltaY * 40 : e.deltaY) }
    let ty = 0, moved = false
    const onTouchStart = (e: TouchEvent) => { ty = e.touches[0].clientY; moved = false }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      const y = e.touches[0].clientY
      if (Math.abs(y - ty) > 2) { scrub((ty - y) * 2.4); ty = y; moved = true }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return leave()
      const dir = ["ArrowDown", "ArrowRight", "PageDown", " ", "Enter"].includes(e.key) ? 1 : ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key) ? -1 : 0
      // (on a focused button or link, Enter and Space press it; the arrows always step)
      if (!dir || ((e.key === "Enter" || e.key === " ") && (e.target as HTMLElement).closest?.("button, a"))) return
      e.preventDefault()
      if (dir > 0) forward(); else back()
    }
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      if (moved) { moved = false; return } // the end of a drag, not a tap
      if (t.closest("[data-start]") || !t.closest("button, a, [data-menu]")) forward()
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    addEventListener("keydown", onKey)
    el.addEventListener("click", onClick)
    draw()
    return () => {
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      removeEventListener("keydown", onKey)
      el.removeEventListener("click", onClick)
      cancelAnimationFrame(raf)
      stop()
    }
  }, [visible, leave, N, steps])

  if (!visible) return null
  const rest = rests[at]
  const ink = !!rest.light && still // pale painting under the chrome: ink instead of white
  const fade = { transition: `opacity ${FADE}ms ease, color ${FADE}ms ease, border-color ${FADE}ms ease` }
  const shown = (s: Section) => ({ ...fade, opacity: still && rest.section === s ? 1 : 0, pointerEvents: still && rest.section === s ? undefined : "none" } as React.CSSProperties)
  const tone = ink ? "text-[#1c1a17]" : "text-white"
  const rule = ink ? "bg-[#1c1a17]/20" : "bg-white/22"

  return (
    <section
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Phần mở đầu"
      className={`fixed inset-0 z-50 cursor-pointer select-none overflow-hidden bg-[#0d4f9e] ${tone}`}
      style={{ ...fade, opacity: leaving ? 0 : 1, pointerEvents: leaving ? "none" : undefined }}
    >
      {/* ---------------------------------------------------------------- the paintings */}
      {/* (their opacity is set by the engine, frame by frame; the transition softens jumps) */}
      {rests.map((r, i) => (
        <div key={r.id} ref={(d) => { layers.current[i] = d }} className="absolute inset-0 [&>*]:[object-position:var(--pos)] md:[&>*]:[object-position:center]" style={{ transition: "opacity 400ms ease", opacity: i === 0 ? 1 : 0, "--pos": r.pos ?? "50% 50%" } as React.CSSProperties}>
          {r.loop ? (
            <video ref={(v) => { loops.current[r.loop!] = v }} src={src(r.loop, "mp4")} poster={src(r.id, "jpg")} muted loop playsInline autoPlay={i === 0} preload={i === 0 ? "auto" : "metadata"} className="size-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src(r.id, "jpg")} alt="" loading={i < 2 ? "eager" : "lazy"} className="size-full object-cover" draggable={false} />
          )}
        </div>
      ))}
      {steps.map((s, i) => (
        <video key={s.film} ref={(v) => { films.current[i] = v }} src={src(s.film, "mp4")} muted playsInline preload={i === 0 ? "auto" : "none"} className="absolute inset-0 size-full object-cover" style={{ opacity: 0 }} />
      ))}
      {/* a shade so the words read: dark under white type, pale under ink */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" style={{ ...fade, opacity: ink ? 0 : 1 }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#f3ead8]/80 via-[#f3ead8]/25 to-transparent" style={{ ...fade, opacity: ink ? 1 : 0 }} />

      {/* ---------------------------------------------------------------- the chrome */}
      <div className={`pointer-events-none absolute inset-y-0 left-14 w-px md:left-[72px] ${rule}`} style={fade} />
      <div className={`pointer-events-none absolute inset-x-0 top-14 h-px md:top-[72px] ${rule}`} style={fade} />
      <Link href="/" onClick={leave} aria-label="Sota" className="absolute left-0 top-0 grid size-14 place-items-center font-heading text-3xl italic md:size-[72px]">S</Link>
      <button data-menu onClick={() => setMenu((m) => !m)} aria-label="Các chương" aria-expanded={menu} className="absolute left-0 top-16 grid size-14 place-items-center md:top-20 md:size-[72px]">
        <span className="grid grid-cols-2 gap-[3px]">{[0, 1, 2, 3].map((k) => <span key={k} className="size-[5px] bg-current" />)}</span>
      </button>
      {/* the rail's ticks: one per chapter, the current one long */}
      <ol aria-hidden className="pointer-events-none absolute left-[calc(3.5rem-1px)] top-40 flex flex-col gap-4 md:left-[71px] md:top-44">
        {rests.map((r, i) => <li key={r.id} className="h-px bg-current transition-all duration-700" style={{ width: i === at ? 18 : 8, opacity: i === at ? 1 : 0.45 }} />)}
      </ol>
      <p className="placard pointer-events-none absolute left-[calc(3.5rem+1.25rem)] top-[calc(3.5rem+1.25rem)] md:left-[calc(72px+1.5rem)] md:top-[calc(72px+1.5rem)]" style={fade}>
        {String(at + 1).padStart(2, "0")} · {rest.chapter}
      </p>
      <Link href="/dang-nhap" className="placard absolute right-4 top-3 inline-flex items-center gap-3 rounded-[3px] bg-[#111] py-1.5 pl-4 pr-1.5 text-white md:right-8 md:top-[18px]">
        <span className="sm:hidden">Đăng nhập</span><span className="hidden sm:inline">Đăng nhập / Đăng ký</span>
        <span className="grid size-7 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
      </Link>

      {/* the menu: every chapter, to jump to */}
      <nav data-menu aria-label="Các chương" className="absolute left-14 top-14 w-64 border border-white/15 bg-[#0b1c3a]/85 p-5 text-white backdrop-blur-md md:left-[72px] md:top-[72px]" style={{ transition: "opacity 300ms ease, transform 300ms ease", opacity: menu ? 1 : 0, transform: `translateY(${menu ? 0 : -8}px)`, pointerEvents: menu ? undefined : "none" }}>
        <ol className="space-y-3">
          {rests.map((r, i) => (
            <li key={r.id}>
              <button onClick={() => jumpTo.current(i)} className={`placard flex w-full items-center justify-between transition-opacity ${i === at ? "opacity-100" : "opacity-60 hover:opacity-100"}`}>
                <span>{String(i + 1).padStart(2, "0")} · {r.chapter}</span>{i === at && <span>●</span>}
              </button>
            </li>
          ))}
        </ol>
        <button onClick={leave} className="placard mt-5 w-full border-t border-white/15 pt-4 text-left opacity-60 hover:opacity-100">Bỏ qua phần mở đầu</button>
      </nav>

      {/* ---------------------------------------------------------------- the sections */}
      {/* the opening */}
      <div style={shown("hero")}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent md:hidden" />
        <div className={`pointer-events-none absolute inset-x-0 top-[74vh] h-px ${rule}`} />
        <span className="pointer-events-none absolute left-14 top-[74vh] -translate-x-1/2 -translate-y-1/2 text-sm md:left-[72px]">✦</span>
        <span className="pointer-events-none absolute right-[14vw] top-[74vh] hidden -translate-y-1/2 translate-x-1/2 text-sm md:block">✦</span>
        <div className="absolute left-[calc(3.5rem+1.25rem)] right-5 top-[28vh] md:left-[calc(72px+4vw)] md:right-auto">
          <h1 className="font-heading text-5xl font-light leading-[0.98] tracking-tight [text-shadow:0_2px_30px_rgb(0_0_0/0.25)] sm:text-7xl xl:text-[7.5rem]">Space of the Art.</h1>
          <p className="mt-6 font-heading text-2xl font-light leading-snug sm:text-[2rem]">Hai mươi mốt bảo tàng Smithsonian,<br />một lối vào.</p>
          <button data-start className="placard mt-10 inline-flex items-center gap-4 whitespace-nowrap rounded-[3px] bg-[#111] py-1.5 pl-5 pr-1.5 text-white">
            Bắt đầu tham quan
            <span className="grid size-8 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
          </button>
        </div>
        <div className="pointer-events-none absolute left-[calc(72px+4vw)] right-5 top-[calc(74vh+2.5rem)] hidden gap-16 md:flex">
          <span className="placard h-fit shrink-0 rounded-[3px] bg-white/12 px-3 py-2">Cụm Smithsonian</span>
          <p className="max-w-xl text-lg leading-relaxed [text-shadow:0_1px_16px_rgb(0_0_0/0.35)]">Xem hiện vật thật từ bộ sưu tập Smithsonian, dạo phòng trưng bày 3D của từng bảo tàng và đặt vé cho cả ngày tham quan trong một lần thanh toán.</p>
        </div>
      </div>

      <Block show={shown("collection")} side="left" title="Hơn 5 triệu hiện vật." lead="Ảnh và thông tin từng hiện vật, lấy thẳng từ Smithsonian Open Access." label="Bộ sưu tập" shade
        body="Tìm theo tên, tác giả hoặc bảo tàng; mỗi hiện vật có trang riêng với ảnh lớn, mô tả và nơi đang trưng bày." cta={{ href: "/hien-vat", label: "Xem hiện vật" }} />
      <Block show={shown("gallery")} side="right" title="Bước vào từng bảo tàng." lead="Mỗi bảo tàng có một phòng trưng bày 3D, dựng theo bản vẽ của riêng nó." label="Tham quan 3D"
        body="Đi giữa các bức tường, bấm vào hiện vật để xem gần, rồi đọc tiếp về nó ở trang hiện vật." cta={{ href: "/bao-tang", label: "Xem các bảo tàng" }} />
      <Block show={shown("tickets")} side="right" title="Một giỏ hàng, cả ngày tham quan." lead="Chọn bảo tàng hoặc triển lãm, chọn ngày và khung giờ còn chỗ." label="Đặt vé" narrow
        body="Đặt vé cho nhiều nơi rồi thanh toán một lần. Mỗi vé có mã QR để quét ở cửa, xem lại trong Vé của tôi." cta={{ href: "/dat-ve", label: "Đặt vé" }} />

      {/* questions, round the tree */}
      <div style={shown("faq")}>
        <h2 className="pointer-events-none absolute inset-x-0 top-[20vh] text-center font-heading text-5xl font-light tracking-tight [text-shadow:0_2px_30px_rgb(0_0_0/0.35)] sm:text-7xl xl:text-8xl">
          Hỏi trước khi <span className="italic">ghé thăm</span>
        </h2>
        <ul className="absolute inset-x-5 top-[38vh] grid gap-3 md:inset-x-[12vw] md:grid-cols-3 md:gap-x-10 md:gap-y-8">
          {FAQ.map((f, k) => (
            <li key={f.q} className={k === 1 ? "md:col-start-3" : k === 3 ? "md:col-start-2" : ""}>
              <button onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="text-left font-heading text-xl leading-tight [text-shadow:0_1px_16px_rgb(0_0_0/0.45)] md:text-2xl">
                {f.q}<span className="placard ml-2 align-middle opacity-70">{open === k ? "−" : "+"}</span>
              </button>
              <p className="mt-2 max-w-xs text-sm leading-relaxed [text-shadow:0_1px_12px_rgb(0_0_0/0.55)]" style={{ transition: "opacity 300ms ease", opacity: open === k ? 1 : 0 }}>{f.a}</p>
            </li>
          ))}
        </ul>
      </div>

      <Block show={shown("map")} side="right" title="Cả cụm bảo tàng, trên một tấm bản đồ." lead="Như người xưa nhìn sao để định hướng." label="Bản đồ"
        body="Xem bảo tàng nào nằm ở đâu, hôm nay mở cửa tới mấy giờ và đang có triển lãm gì." cta={{ href: "/ban-do", label: "Xem bản đồ" }} />

      {/* the close: the name, framed by rules, over the couple tending the tree */}
      <div style={shown("end")}>
        <div className="pointer-events-none absolute left-1/2 top-[14vh] h-[56vh] w-[min(80vw,42rem)] -translate-x-1/2 border border-white/30">
          <span className="absolute -left-1.5 -top-2.5 text-sm">✦</span><span className="absolute -right-1.5 -top-2.5 text-sm">✦</span>
          <p className="mt-[6vh] text-center font-heading text-[clamp(5rem,16vw,12rem)] font-light italic leading-none tracking-tight [text-shadow:0_4px_40px_rgb(0_0_0/0.3)]">sota.</p>
          <p className="mx-auto mt-4 max-w-sm text-center font-heading text-xl leading-snug [text-shadow:0_1px_16px_rgb(0_0_0/0.45)]">Một lối vào chung cho cụm bảo tàng Smithsonian.</p>
        </div>
        <div className="absolute left-1/2 top-[73vh] -translate-x-1/2">
          <button onClick={leave} className="placard inline-flex items-center gap-4 rounded-[3px] bg-[#111] py-1.5 pl-5 pr-1.5 text-white">
            Vào Sota
            <span className="grid size-8 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------------------- along the bottom */}
      <p className="placard pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap md:bottom-6" style={{ ...fade, opacity: still && at > 0 ? 0.6 : 0 }}>
        {at === N - 1 ? "Nhấn hoặc cuộn để vào Sota" : "Cuộn hoặc nhấn để đi tiếp"}
      </p>
      <p className="pointer-events-none absolute bottom-3 left-[calc(3.5rem+1.25rem)] text-[10px] opacity-55 md:bottom-6 md:left-[calc(72px+1.5rem)]" style={fade}>Hình ảnh: Pear (pear.no), tạo bằng AI</p>
      <button onClick={leave} className="placard absolute bottom-3 right-4 opacity-60 transition-opacity hover:opacity-100 md:bottom-6 md:right-8" style={fade}>Bỏ qua</button>
    </section>
  )
}

// a feature section like pear.no's: a large title, a lead in the serif, a label and a short text, a button
function Block({ show, side, title, lead, label, body, cta, narrow, shade }: { show: React.CSSProperties; side: "left" | "right"; title: string; lead: string; label: string; body: string; cta: { href: string; label: string }; narrow?: boolean; shade?: boolean }) {
  return (
    <div style={show}>
      {/* (over a busy painting: a dark wash on the side the words sit) */}
      {shade && <div className={`pointer-events-none absolute inset-0 from-black/65 via-black/25 to-transparent ${side === "left" ? "bg-gradient-to-r" : "bg-gradient-to-l"}`} />}
      <div className={`absolute bottom-[16vh] left-[calc(3.5rem+1.25rem)] right-5 md:bottom-auto md:top-[24vh] ${narrow ? "md:w-[min(25vw,24rem)]" : "md:w-[min(40vw,36rem)]"} ${side === "right" ? `md:left-auto ${narrow ? "md:right-[3.5vw]" : "md:right-[8vw]"}` : "md:left-[calc(72px+4vw)] md:right-auto"}`}>
        <h2 className={`font-heading text-[2.4rem] font-light leading-[1.02] tracking-tight [text-shadow:0_2px_24px_rgb(0_0_0/0.2)] ${narrow ? "sm:text-5xl" : "sm:text-6xl"}`}>{title}</h2>
        <p className="mt-4 max-w-md font-heading text-lg leading-snug sm:mt-5 sm:text-2xl">{lead}</p>
        {/* (on a phone the label and the short text give way to the painting) */}
        <div className="mt-8 hidden gap-8 sm:flex">
          <span className="placard h-fit shrink-0 rounded-[3px] bg-current/10 px-3 py-2">{label}</span>
          <p className="max-w-xs text-sm leading-relaxed">{body}</p>
        </div>
        <Link href={cta.href} className="placard mt-8 inline-flex items-center gap-4 whitespace-nowrap rounded-[3px] bg-[#111] py-1.5 pl-5 pr-1.5 text-white">
          {cta.label}
          <span className="grid size-8 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
        </Link>
      </div>
    </div>
  )
}
