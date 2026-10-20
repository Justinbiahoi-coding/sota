"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { ArrowRight } from "lucide-react"
import { makeVeil, ready, type Veil } from "./veil"
import { readGrain } from "@/lib/grain"

// The opening, laid out like pear.no: a full-screen story over the whole site (images and films by
// Pear, pear.no, made with AI). A rail down the left (mark, menu, progress ticks), a rule across the
// top, the sign-in button top right. Each visit opens on one of three living paintings, picked at
// random; each has its own film into the pear tree, where the story runs on through Sota's features:
// the collection, the 3D galleries, tickets, questions, the map, and a closing scene.
// Two ways through it, as the visitor likes: scrolling (wheel, trackpad, a drag on a phone) runs the
// films with the hand, like pear.no, forward and back, stopping wherever the hand stops; a click, a
// tap or an arrow key plays the film on to the next painting by itself and rests there. Scrolling
// during a playing film takes over from the frame it is on. The films are encoded with a keyframe
// every third frame, so a seek decodes at most two frames. Where one painting gives way to a film that
// starts elsewhere, the hand-over is drawn in WebGL (veil.ts): the signal break with its flash out of the
// opening, a burn, a soak; without WebGL the film simply dissolves in.
// It shows on every visit, like pear.no, and arrives the same way: the opening painting first, out of
// focus, drained and held close, coming into focus as its film loads (with the percentage along the
// bottom); the words and the chrome follow once it is sharp. Leaving (the last scene, "Bỏ qua", Esc)
// fades it away.
// Media: public/intro/ (films re-encoded from Pear's frame sequences, stills are their end frames).

type Section = "hero" | "collection" | "shop" | "account" | "exhibits" | "stories" | "gallery" | "tickets" | "notes" | "faq" | "map" | "end"
// light: a pale painting, ink type over it; glow: its point of light; img: the picture, when it is not
// named after the rest; tall: its pos holds on every screen (a tall plate framed at one height)
type Rest = { id: string; section: Section; chapter: string; loop?: string; pos?: string; light?: boolean; glow?: [number, number]; img?: string; tall?: boolean }
// film: what plays between two rests (fade: its first frame differs from the rest before it, so it
// dissolves in); with no film the step hands one still over to the next, through its veil (WebGL), or
// pans down a tall plate from one rest's framing to the next
type Step = { film?: string; fade?: boolean; veil?: Veil; pan?: boolean }

// the three openings (pos: where the figure stands, kept in frame on a narrow screen)
const HEROES = [
  { id: "signal", pos: "70% 60%", glow: [0.715, 0.075] }, // the statue raising a pear of light over a crowd
  { id: "colossus", pos: "73% 54%", glow: [0.73, 0.48] }, // the golden pear on its plinth (the glint on it)
  { id: "reveal", pos: "68% 50%", glow: [0.85, 0.37] }, // the youth drawing a curtain (the glint at its edge)
] as const
// the story after the opening, shared by every opening
const SHARED: Rest[] = [
  { id: "collection", section: "collection", chapter: "Bộ sưu tập" },
  { id: "shop", section: "shop", chapter: "Cửa hàng" },
  { id: "share", section: "account", chapter: "Tài khoản", light: true },
  { id: "work", section: "exhibits", chapter: "Triển lãm", img: "plate", pos: "50% 0%", tall: true },
  { id: "build", section: "stories", chapter: "Khám phá thêm", img: "plate", pos: "50% 53%", tall: true },
  { id: "blueprint", section: "gallery", chapter: "Tham quan 3D", light: true },
  { id: "plan", section: "tickets", chapter: "Đặt vé", light: true },
  { id: "terms", section: "notes", chapter: "Lưu ý" },
  { id: "garden", section: "faq", chapter: "Hỏi đáp" },
  { id: "sky", section: "map", chapter: "Bản đồ" },
  { id: "couple", section: "end", chapter: "Sota", loop: "couple" },
]
// SHARED_STEPS[i] carries the story from SHARED[i] to SHARED[i + 1]
const SHARED_STEPS: Step[] = [
  { film: "harvest" }, // up into the tree, a hand reaching for the golden pear
  { film: "share" }, // the youth with the pear, cutting it, the halves handed across
  { veil: "burn" }, // the halves burn away onto the top of a tall plate: sky and clouds
  { pan: true }, // down the plate to the pear being gilded on its scaffold
  { film: "coda", fade: true }, // the scaffold, down to the drawing in her hands
  { film: "plan", fade: true, veil: "soak" }, // the golden pear on its scaffold, seen from above
  { veil: "burn" }, // the plan burns away onto the woman with the shears by her pear tree
  { film: "tree" }, // the pear she cuts falls, through a ring of light, into the tree
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
const DEPTH = [0, 1.6, 0.7, 2.3, 1.2] // px of blur on each question pane, wide screens
const LIFT = [0, 7, -2, 4, 5] // vh each pane sits lower, so they do not read as a table
const CLOUDS: [string, string, string, string][] = [["7%", "60%", "13vw", "38s"], ["68%", "74%", "18vw", "47s"], ["36%", "20%", "9vw", "31s"]] // left, top, width, drift time
const FADE = 700 // ms, for the words, leaving and jumping
const HOLD = 0.14 // of each gap between two rests, the stretch at either end that holds the rest
const SCROLL = 1200 // px of wheel per gap
const VEIL = 0.35 // of a film with a veil, the stretch the hand-over takes
const BOOT = 6000 // ms: the arrival gives up waiting on the film after this
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
  const grain = useSyncExternalStore(noSubscribe, readGrain, () => "none")
  const { rests, steps } = useMemo(() => ({
    rests: [{ id: hero.id, section: "hero", chapter: "Mở màn", loop: hero.id, pos: hero.pos, glow: [...hero.glow] }, ...SHARED] as Rest[],
    steps: [{ film: `hero-${hero.id}-in`, fade: true, veil: "signal" }, ...SHARED_STEPS] as Step[],
  }), [hero])
  const N = rests.length
  const [closed, setClosed] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [at, setAt] = useState(0) // the rest nearest to where the story is
  const [still, setStill] = useState(true) // the story is resting on it: its words show
  const [menu, setMenu] = useState(false)
  const [open, setOpen] = useState<number | null>(null) // the question whose answer shows
  const [booted, setBooted] = useState(false) // the opening painting has come into focus
  const [loaded, setLoaded] = useState(0) // how much of its film is in, 0..100
  const boot = useRef<HTMLImageElement>(null)
  const ready_ = useRef(false)
  const films = useRef<(HTMLVideoElement | null)[]>([])
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const loops = useRef<Record<string, HTMLVideoElement | null>>({})
  const canvas = useRef<HTMLCanvasElement>(null)
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

  // the arrival: the painting sharpens as its film comes in (never faster than about two seconds), then
  // the blurred copy fades off it
  useEffect(() => {
    if (!visible) return
    const img = boot.current!, v = loops.current[rests[0].loop!]!
    let u = 0, m = 0, last = 0, raf = 0, pct = -1
    const progress = () => {
      try { if (v.duration && v.buffered.length) u = Math.max(u, Math.min(0.92, v.buffered.end(v.buffered.length - 1) / v.duration)) } catch {}
    }
    const full = () => { u = 1 }
    v.addEventListener("progress", progress)
    v.addEventListener("loadedmetadata", progress)
    v.addEventListener("canplaythrough", full)
    v.addEventListener("playing", full)
    if (v.readyState >= 4) full()
    const give = setTimeout(full, BOOT)
    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0.016
      last = now
      m = Math.min(u, m + dt * 0.55)
      const k = m * m * (3 - 2 * m)
      img.style.filter = `blur(${((1 - k) * 26).toFixed(1)}px) saturate(${(0.62 + 0.38 * k).toFixed(3)}) brightness(${(0.92 + 0.08 * k).toFixed(3)})`
      img.style.transform = `scale(${(1.06 - 0.06 * k).toFixed(4)})`
      const p = Math.round(m * 100)
      if (p !== pct) { pct = p; setLoaded(p) }
      if (m >= 1) { ready_.current = true; setBooted(true); return }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf); clearTimeout(give)
      v.removeEventListener("progress", progress)
      v.removeEventListener("loadedmetadata", progress)
      v.removeEventListener("canplaythrough", full)
      v.removeEventListener("playing", full)
    }
  }, [visible, rests])

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
    const el = root.current!, vids = films.current, rest = layers.current, cv = canvas.current!
    let p = 0, target = 0, raf = 0, playing = -1, overflow = 0, near = 0, resting = true, live = false, gauged = ""
    // a click on a rest whose film opens with the ring: the ring runs first (the film held on its first
    // frame, as pear.no does), then the film plays
    let ramp: { k: number; from: number; to: number; t0: number; dur: number } | null = null
    const through = (u: number) => clamp((u - HOLD) / (1 - 2 * HOLD)) // how far into the film, at u into the gap
    // the ring holds its film on the first frame; the film then runs over the rest of the gap
    const lead = (k: number) => (steps[k]?.veil === "signal" ? VEIL : 0)
    const filmAt = (k: number, f: number) => clamp((f - lead(k)) / (1 - lead(k)))
    const veil = makeVeil(cv)
    veil?.size()
    const wide = matchMedia("(min-width: 768px)")
    // a rest's object-position as fractions (the layers drop it on a wide screen)
    const posOf = (r: Rest): [number, number] => {
      if ((wide.matches && !r.tall) || !r.pos) return [0.5, 0.5]
      const [x, y] = r.pos.split(" ").map((q) => parseFloat(q) / 100)
      return [x, y]
    }

    const draw = () => {
      const i = Math.min(Math.floor(p), N - 1), u = p - i
      const mid = i < N - 1 && u > HOLD && u < 1 - HOLD // between two rests
      const show = mid && steps[i].film ? i : -1 // the film on screen
      const f = through(u), lit = i < N - 1 && u >= 1 - HOLD ? i + 1 : i // the rest on screen when no film is
      const still = (el: HTMLDivElement | null | undefined) => el?.firstElementChild as HTMLImageElement | HTMLVideoElement | null
      // the hand-over in WebGL, over both, while it lasts: into a film (its first stretch), from one
      // still to the next (the whole gap), or, at a rest whose film opens with the ring, the ring
      // breathing at its point of light (t = 0)
      let mode: Veil | undefined, t = 0, fi = i, to: HTMLImageElement | HTMLVideoElement | null = null, toPos: [number, number] = [0.5, 0.5]
      if (show >= 0 && steps[show].veil && f < VEIL) { mode = steps[show].veil; t = f / VEIL; to = vids[show] }
      else if (mid && !steps[i].film && steps[i].veil) { mode = steps[i].veil; t = f; to = still(rest[i + 1]); toPos = posOf(rests[i + 1]) }
      else if (show < 0 && steps[lit]?.veil === "signal") {
        mode = "signal"; fi = lit; to = vids[lit]
        if (to && !to.seeking && to.currentTime > 0.01) to.currentTime = 0
      }
      if (!veil) mode = undefined
      live = !!mode
      const from = still(rest[fi])
      const veiled = live && ready(from) && ready(to)
      if (veiled) veil!.draw(from!, to!, t, mode!, rests[fi].glow ?? [0.5, 0.5], posOf(rests[fi]), toPos)
      cv.style.opacity = veiled ? "1" : "0"
      // down a tall plate: the leaving rest's picture slides from its framing to the next one's
      const pan = mid && !!steps[i].pan, e = f * f * (3 - 2 * f)
      rest.forEach((L, k) => {
        if (!L) return
        // under a film: the rest it leaves while it dissolves in, the rest it reaches once it covers;
        // between two stills, the one it leaves
        const on = show < 0 ? k === (mid ? i : lit) : (k === i && f < 0.15) || (k === i + 1 && f >= 0.12)
        L.style.opacity = on ? "1" : "0"
        if (!rests[k].tall) return
        const y = pan && k === i ? posOf(rests[i])[1] + (posOf(rests[i + 1])[1] - posOf(rests[i])[1]) * e : posOf(rests[k])[1]
        still(L)!.style.objectPosition = `50% ${(y * 100).toFixed(2)}%`
        L.style.setProperty("--pan", String(pan && k === i ? e : k > 0 && rests[k - 1].img === rests[k].img ? 1 : 0))
      })
      const pct = String(Math.round((p / (N - 1)) * 100)) + "%"
      if (pct !== gauged) { gauged = pct; for (const g of el.querySelectorAll("[data-gauge]")) g.textContent = pct }
      vids.forEach((v, k) => {
        if (!v) return
        if (k !== show) { v.style.opacity = "0"; return }
        v.style.opacity = String(steps[k].fade && !(veil && steps[k].veil) ? clamp(f / 0.12) : 1)
        // scrubbing: seek to the frame, one seek at a time (a playing film runs on its own)
        const at = filmAt(k, f) * v.duration
        if (playing !== k && v.duration && !v.seeking && Math.abs(v.currentTime - at) > 0.012) v.currentTime = at
      })
      const r = Math.round(p), rested = Math.abs(p - r) < HOLD
      if (r !== near) { near = r; setAt(r) }
      if (rested !== resting) { resting = rested; setStill(rested) }
    }
    const frame = (now: number) => {
      raf = 0
      if (ramp) {
        const e = clamp((now - ramp.t0) / ramp.dur)
        p = target = ramp.from + (ramp.to - ramp.from) * e * e * (3 - 2 * e)
        if (e >= 1) { const k = ramp.k; ramp = null; if (steps[k].film) play(k, 0) }
      } else if (playing >= 0) {
        const v = vids[playing]!, fv = v.duration ? v.currentTime / v.duration : 0
        if (v.ended || fv >= 0.998) { p = target = playing + 1; playing = -1 }
        else p = target = playing + HOLD + (lead(playing) + fv * (1 - lead(playing))) * (1 - 2 * HOLD)
      } else {
        p += (target - p) * 0.16
        if (Math.abs(target - p) < 0.0005) p = target
      }
      draw()
      // (a veil keeps moving while it is on screen, even with the hand still)
      if (playing >= 0 || ramp || p !== target || live) raf = requestAnimationFrame(frame)
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const stop = () => { ramp = null; if (playing >= 0) { vids[playing]?.pause(); playing = -1 } }
    // play film k on from fv (0..1 of the film)
    const play = (k: number, fv: number) => {
      const v = vids[k]
      if (!v) return
      p = target = k + HOLD + 0.0001 + (lead(k) + fv * (1 - lead(k))) * (1 - 2 * HOLD)
      if (v.duration) v.currentTime = fv * v.duration
      playing = k
      v.play().catch(() => { playing = -1 })
      kick()
    }

    // a click, a tap, an arrow: play on to the next rest (from the frame the story is on)
    const forward = () => {
      if (left.current || playing >= 0 || ramp || !ready_.current) return
      const r = Math.round(p), seg = Math.abs(p - r) < HOLD ? r : Math.floor(p)
      if (seg >= N - 1) return leave()
      setMenu(false); setOpen(null)
      const f = through(p - seg)
      // a step with no film runs by itself, in under two seconds
      if (!steps[seg].film) {
        ramp = { k: seg, from: p, to: seg + 1, t0: performance.now(), dur: 1800 * (1 - f) + 200 }
        return kick()
      }
      if (!vids[seg]) return
      if (f < lead(seg)) {
        // (about a second and a half for the whole ring, less for what is left of it)
        ramp = { k: seg, from: p, to: seg + HOLD + lead(seg) * (1 - 2 * HOLD), t0: performance.now(), dur: 1500 * (1 - f / lead(seg)) }
        return kick()
      }
      play(seg, filmAt(seg, f))
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
      if (left.current || !ready_.current) return
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
    const onResize = () => { veil?.size(); draw() }
    addEventListener("resize", onResize)
    draw()
    kick() // (the ring breathes at rest)
    return () => {
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      removeEventListener("keydown", onKey)
      el.removeEventListener("click", onClick)
      removeEventListener("resize", onResize)
      cancelAnimationFrame(raf)
      stop()
    }
  }, [visible, leave, N, steps, rests])

  if (!visible) return null
  const rest = rests[at]
  const ink = !!rest.light && still // pale painting under the chrome: ink instead of white
  const fade = { transition: `opacity ${FADE}ms ease, color ${FADE}ms ease, border-color ${FADE}ms ease` }
  // a section's wrapper: shown while the story rests on it (data-on starts its words' ink)
  const shown = (s: Section) => {
    const on = booted && still && rest.section === s
    return { "data-on": on, style: { ...fade, opacity: on ? 1 : 0, pointerEvents: on ? undefined : "none" } as React.CSSProperties }
  }
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
        <div key={r.id} ref={(d) => { layers.current[i] = d }} className={`absolute inset-0 overflow-hidden [&>*:first-child]:[object-position:var(--pos)] ${r.tall ? "" : "md:[&>*:first-child]:[object-position:center]"}`} style={{ transition: "opacity 400ms ease", opacity: i === 0 ? 1 : 0, "--pos": r.pos ?? "50% 50%" } as React.CSSProperties}>
          {r.loop ? (
            <video ref={(v) => { loops.current[r.loop!] = v }} src={src(r.loop, "mp4")} poster={src(r.id, "jpg")} muted loop playsInline autoPlay={i === 0} preload={i === 0 ? "auto" : "metadata"} className="size-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src(r.img ?? r.id, "jpg")} alt="" loading={i < 2 ? "eager" : "lazy"} className="size-full object-cover" draggable={false} />
          )}
          {r.img === "plate" && <Plate />}
        </div>
      ))}
      {steps.map((s, i) => s.film && (
        <video key={s.film} ref={(v) => { films.current[i] = v }} src={src(s.film, "mp4")} muted playsInline preload={i === 0 ? "auto" : "none"} className="absolute inset-0 size-full object-cover" style={{ opacity: 0 }} />
      ))}
      <canvas ref={canvas} aria-hidden className="pointer-events-none absolute inset-0 size-full" style={{ opacity: 0 }} />
      {/* the arrival: the opening painting, out of focus until its film is in */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={boot} src={src(rests[0].id, "jpg")} alt="" aria-hidden className="pointer-events-none absolute inset-0 size-full object-cover [object-position:var(--pos)] md:[object-position:center]"
        style={{ "--pos": rests[0].pos, filter: "blur(26px) saturate(0.62) brightness(0.92)", transform: "scale(1.06)", transition: "opacity 600ms ease", opacity: booted ? 0 : 1 } as React.CSSProperties} />
      <p aria-hidden className="placard pointer-events-none absolute bottom-6 left-[calc(3.5rem+1.25rem)] text-white/55 md:left-[calc(72px+1.5rem)]" style={{ transition: "opacity 700ms ease", opacity: booted ? 0 : 1 }}>
        Phim đang tải<b className="ml-3 font-normal text-white/85">{loaded}%</b>
      </p>
      {/* the grain over the whole picture, like pear.no's */}
      <div aria-hidden className="film-grain pointer-events-none absolute inset-0" style={{ background: grain }} />
      {/* a shade so the words read: dark under white type, pale under ink */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" style={{ ...fade, opacity: ink ? 0 : 1 }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#f3ead8]/80 via-[#f3ead8]/25 to-transparent" style={{ ...fade, opacity: ink ? 1 : 0 }} />

      {/* ---------------------------------------------------------------- the chrome */}
      {/* (everything but the mark waits for the arrival) */}
      <div style={{ transition: `opacity ${FADE}ms ease`, opacity: booted ? 1 : 0, visibility: booted ? undefined : "hidden" }}>
      <div className={`pointer-events-none absolute inset-y-0 left-14 w-px md:left-[72px] ${rule}`} style={fade} />
      <div className={`pointer-events-none absolute inset-x-0 top-14 h-px md:top-[72px] ${rule}`} style={fade} />
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
      <div {...shown("hero")}>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent md:hidden" />
        <div className={`pointer-events-none absolute inset-x-0 top-[74vh] h-px ${rule}`} />
        <span className="pointer-events-none absolute left-14 top-[74vh] -translate-x-1/2 -translate-y-1/2 text-sm md:left-[72px]">✦</span>
        <span className="pointer-events-none absolute right-[14vw] top-[74vh] hidden -translate-y-1/2 translate-x-1/2 text-sm md:block">✦</span>
        <div className="absolute left-[calc(3.5rem+1.25rem)] right-5 top-[28vh] md:left-[calc(72px+4vw)] md:right-auto">
          <h1 className="ink font-heading text-5xl font-light leading-[0.98] tracking-tight [text-shadow:0_2px_30px_rgb(0_0_0/0.25)] sm:text-7xl xl:text-[7.5rem]">Space of the Art.</h1>
          <p className="ink mt-6 font-heading text-2xl font-light leading-snug [animation-delay:150ms] sm:text-[2rem]">Hai mươi mốt bảo tàng Smithsonian,<br />một lối vào.</p>
          <button data-start className="placard mt-10 inline-flex items-center gap-4 whitespace-nowrap rounded-[3px] bg-[#111] py-1.5 pl-5 pr-1.5 text-white">
            Bắt đầu tham quan
            <span className="grid size-8 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
          </button>
        </div>
        <div className="pointer-events-none absolute left-[calc(72px+4vw)] right-5 top-[calc(74vh+2.5rem)] hidden gap-16 md:flex">
          <span className="placard h-fit shrink-0 rounded-[3px] bg-white/12 px-3 py-2">Cụm Smithsonian</span>
          <p className="ink max-w-xl text-lg leading-relaxed [animation-delay:300ms] [text-shadow:0_1px_16px_rgb(0_0_0/0.35)]">Xem hiện vật thật từ bộ sưu tập Smithsonian, dạo phòng trưng bày 3D của từng bảo tàng và đặt vé cho cả ngày tham quan trong một lần thanh toán.</p>
        </div>
      </div>

      <Block show={shown("collection")} side="left" title="Hơn 5 triệu hiện vật." lead="Ảnh và thông tin từng hiện vật, lấy thẳng từ Smithsonian Open Access." label="Bộ sưu tập" shade
        body="Tìm theo tên, tác giả hoặc bảo tàng; mỗi hiện vật có trang riêng với ảnh lớn, mô tả và nơi đang trưng bày." cta={{ href: "/hien-vat", label: "Xem hiện vật" }} />
      <Block show={shown("shop")} side="right" title="Mang một món về nhà." lead="Quà lưu niệm từ các bảo tàng Smithsonian: bản in, sách, đồ chơi khoa học." label="Cửa hàng" narrow shade
        body="Chọn món, cho vào chung giỏ với vé tham quan rồi thanh toán một lần; đơn quà được giao tận nơi." cta={{ href: "/cua-hang", label: "Vào cửa hàng" }} />
      <Block show={shown("account")} side="right" title="Của bạn, ở một chỗ." lead="Vé, đơn hàng và những hiện vật bạn đã lưu, trong một tài khoản." label="Tài khoản" narrow
        body="Xem lại vé có mã QR, theo dõi đơn quà lưu niệm và mở lại hiện vật bạn thích trên bất kỳ máy nào." cta={{ href: "/dang-ky", label: "Tạo tài khoản" }} />
      <Block show={shown("exhibits")} side="right" title="Triển lãm đang mở, và sắp mở." lead="Lịch triển lãm của cả cụm bảo tàng trên một trang." label="Triển lãm" narrow
        body="Lọc theo bảo tàng, chủ đề hoặc ngày; mỗi triển lãm có trang riêng với ảnh, thời gian và chỗ đặt vé." cta={{ href: "/trien-lam", label: "Xem triển lãm" }} />
      <Block show={shown("stories")} side="left" title="Câu chuyện phía sau hiện vật." lead="Bài viết, video và tư liệu từ các nhà nghiên cứu Smithsonian." label="Khám phá thêm"
        body="Mỗi bài gắn với hiện vật và bảo tàng được nhắc tới, đọc xong là biết nên ghé đâu." cta={{ href: "/kham-pha", label: "Đọc thêm" }} />
      <Block show={shown("gallery")} side="right" title="Bước vào từng bảo tàng." lead="Mỗi bảo tàng có một phòng trưng bày 3D, dựng theo bản vẽ của riêng nó." label="Tham quan 3D"
        body="Đi giữa các bức tường, bấm vào hiện vật để xem gần, rồi đọc tiếp về nó ở trang hiện vật." cta={{ href: "/bao-tang", label: "Xem các bảo tàng" }} />
      <Block show={shown("tickets")} side="right" title="Một giỏ hàng, cả ngày tham quan." lead="Chọn bảo tàng hoặc triển lãm, chọn ngày và khung giờ còn chỗ." label="Đặt vé" narrow
        body="Đặt vé cho nhiều nơi rồi thanh toán một lần. Mỗi vé có mã QR để quét ở cửa, xem lại trong Vé của tôi." cta={{ href: "/dat-ve", label: "Đặt vé" }} />

      <Block show={shown("notes")} side="left" title="Phần lớn miễn phí vào cửa." lead="Hầu hết bảo tàng Smithsonian không bán vé vào cửa; vài triển lãm và sự kiện cần vé giữ chỗ theo giờ." label="Lưu ý"
        body="Sota ghi rõ nơi nào cần vé và nơi nào chỉ cần tới; vé giữ chỗ miễn phí vẫn đặt được ngay trên Sota." cta={{ href: "/bao-tang", label: "Xem giờ mở cửa" }} />

      {/* questions, round the tree: panes at different depths, the nearer sharp and the farther soft;
          the one asked comes forward */}
      <div {...shown("faq")}>
        <h2 className="ink pointer-events-none absolute inset-x-0 top-[15vh] text-center font-heading text-5xl font-light tracking-tight [text-shadow:0_2px_30px_rgb(0_0_0/0.35)] sm:text-7xl xl:text-[7.5rem]">
          Hỏi trước khi <span className="font-[family-name:var(--font-script)] text-[1.12em] font-normal tracking-normal">ghé thăm</span>
        </h2>
        <ul className="absolute inset-x-5 top-[34vh] grid gap-3 md:inset-x-[10vw] md:grid-cols-3 md:gap-x-12 md:gap-y-8">
          {FAQ.map((f, k) => (
            <li key={f.q} className={`transition-[filter,opacity,transform] duration-500 md:[filter:blur(var(--d))] md:[transform:translateY(var(--y))] md:hover:[filter:none] ${k === 1 ? "md:col-start-3" : k === 3 ? "md:col-start-2" : ""}`}
              style={{ "--d": `${open === k ? 0 : DEPTH[k]}px`, "--y": `${LIFT[k]}vh`, opacity: open === null || open === k ? 1 : 0.8 } as React.CSSProperties}>
              <button onClick={() => setOpen(open === k ? null : k)} aria-expanded={open === k} className="relative block w-full border border-white/25 p-5 text-left [text-shadow:0_1px_14px_rgb(0_0_0/0.5)] md:min-h-[11rem] md:p-7">
                <span aria-hidden className="absolute -left-[7px] -top-[11px] text-sm">✦</span>
                <span aria-hidden className="absolute -bottom-[11px] -right-[6px] text-sm">✦</span>
                <span className="block font-heading text-xl leading-tight md:text-[1.65rem]">{f.q}</span>
                <span className="mt-4 block text-sm leading-relaxed transition-opacity duration-300" style={{ opacity: open === k ? 1 : 0 }}>{f.a}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Block show={shown("map")} side="right" title="Cả cụm bảo tàng, trên một tấm bản đồ." lead="Như người xưa nhìn sao để định hướng." label="Bản đồ"
        body="Xem bảo tàng nào nằm ở đâu, hôm nay mở cửa tới mấy giờ và đang có triển lãm gì." cta={{ href: "/ban-do", label: "Xem bản đồ" }} />

      {/* the close: the name, framed by rules, over the couple tending the tree */}
      <div {...shown("end")}>
        <div className="pointer-events-none absolute left-1/2 top-[14vh] h-[56vh] w-[min(80vw,42rem)] -translate-x-1/2 border border-white/30">
          <span className="absolute -left-1.5 -top-2.5 text-sm">✦</span><span className="absolute -right-1.5 -top-2.5 text-sm">✦</span>
          <p className="ink mt-[6vh] text-center font-heading text-[clamp(5rem,16vw,12rem)] font-light italic leading-none tracking-tight [text-shadow:0_4px_40px_rgb(0_0_0/0.3)]">sota.</p>
          <p className="ink mx-auto mt-4 max-w-sm text-center font-heading [animation-delay:200ms] text-xl leading-snug [text-shadow:0_1px_16px_rgb(0_0_0/0.45)]">Một lối vào chung cho cụm bảo tàng Smithsonian.</p>
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
      </div>
      <Link href="/" onClick={leave} aria-label="Sota" className="absolute left-0 top-0 grid size-14 place-items-center font-heading text-3xl italic md:size-[72px]">S</Link>
    </section>
  )
}

// over the tall plate, as pear.no's: halftone clouds drifting across the sky, and a ruler down it with
// how far through the story you are; both ride up as the plate pans (--pan, set by the engine)
function Plate() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {CLOUDS.map(([x, y, w, d]) => (
        <div key={x} className="absolute" style={{ left: x, top: y, transform: "translateY(calc(var(--pan, 0) * -70vh))", opacity: "calc(1 - var(--pan, 0))" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/intro/cloud.png" alt="" className="drift" style={{ width: w, animationDuration: d }} />
        </div>
      ))}
      <div className="absolute inset-y-0 left-[61%] hidden w-12 border-l border-white/30 md:block"
        style={{ backgroundImage: "linear-gradient(to bottom, rgb(255 255 255 / 0.7) 0 1px, transparent 1px)", backgroundSize: "60% 11vh", backgroundRepeat: "repeat-y", backgroundPositionY: "calc(var(--pan, 0) * -70vh)" }} />
      <span data-gauge className="placard absolute bottom-[7vh] left-[61%] hidden -translate-x-1/2 bg-[#0d4f9e] px-1 italic md:block" />
    </div>
  )
}

// a feature section like pear.no's: a large title, a lead in the serif, a label and a short text, a button
function Block({ show, side, title, lead, label, body, cta, narrow, shade }: { show: { "data-on": boolean; style: React.CSSProperties }; side: "left" | "right"; title: string; lead: string; label: string; body: string; cta: { href: string; label: string }; narrow?: boolean; shade?: boolean }) {
  return (
    <div {...show}>
      {/* (over a busy painting: a dark wash on the side the words sit) */}
      {shade && <div className={`pointer-events-none absolute inset-0 from-black/65 via-black/25 to-transparent ${side === "left" ? "bg-gradient-to-r" : "bg-gradient-to-l"}`} />}
      <div className={`absolute bottom-[16vh] left-[calc(3.5rem+1.25rem)] right-5 md:bottom-auto md:top-[24vh] ${narrow ? "md:w-[min(25vw,24rem)]" : "md:w-[min(40vw,36rem)]"} ${side === "right" ? `md:left-auto ${narrow ? "md:right-[3.5vw]" : "md:right-[8vw]"}` : "md:left-[calc(72px+4vw)] md:right-auto"}`}>
        <h2 className={`ink font-heading text-[2.4rem] font-light leading-[1.02] tracking-tight [text-shadow:0_2px_24px_rgb(0_0_0/0.2)] ${narrow ? "sm:text-5xl" : "sm:text-6xl"}`}>{title}</h2>
        <p className="ink mt-4 max-w-md font-heading text-lg leading-snug [animation-delay:150ms] sm:mt-5 sm:text-2xl">{lead}</p>
        {/* (on a phone the label and the short text give way to the painting) */}
        <div className="mt-8 hidden gap-8 sm:flex">
          <span className="placard h-fit shrink-0 rounded-[3px] bg-current/10 px-3 py-2">{label}</span>
          <p className="ink max-w-xs text-sm leading-relaxed [animation-delay:300ms]">{body}</p>
        </div>
        <Link href={cta.href} className="placard mt-8 inline-flex items-center gap-4 whitespace-nowrap rounded-[3px] bg-[#111] py-1.5 pl-5 pr-1.5 text-white">
          {cta.label}
          <span className="grid size-8 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
        </Link>
      </div>
    </div>
  )
}
