"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

// The opening: a full-screen chain of living paintings (images and films by Pear, pear.no, made
// with AI) over the whole site, header included. The story rests on one painting at a time; each
// step (a click or tap, one notch of the wheel, a swipe, an arrow key) plays the short film that
// carries the camera to the next, then rests again. Films are played, never scrubbed, so the
// motion stays smooth. Leaving (the last scene, "Bỏ qua", Esc) fades it away onto the home page.
// Media: public/intro/ (films re-encoded from Pear's frame sequences, stills are their last frames).

type Rest = { id: string; chapter: string; line: string; loop?: string; pos?: string } // loop: a living painting while resting; pos: where to crop it on a narrow screen
type Step = { film?: string; from?: string } // film: the transition; from: its first frame, if the rest before differs

const RESTS: Rest[] = [
  { id: "reveal", chapter: "Mở màn", line: "Mỗi bảo tàng bắt đầu bằng một tấm rèm được kéo lên.", loop: "reveal", pos: "66% 50%" },
  { id: "garden", chapter: "Khu vườn", line: "Nghệ thuật lớn lên như một khu vườn." },
  { id: "sky", chapter: "Bầu trời", line: "Người xưa nhìn lên trời và kể lại những gì họ thấy." },
  { id: "couple", chapter: "Vun trồng", line: "Mỗi thế hệ lại tưới thêm một chút.", loop: "couple" },
  { id: "signal", chapter: "Ngọn đuốc", line: "Bảo tàng giữ cho câu chuyện ấy còn sáng.", loop: "signal" },
  { id: "graft", chapter: "Ghép cành", line: "Ở đây, quá khứ được ghép vào hiện tại." },
  { id: "ripe", chapter: "Trái chín", line: "Từng hiện vật được chăm chút như một trái chín." },
  { id: "share", chapter: "Sota", line: "Và giờ, nghệ thuật được chia cho mọi người." },
]
// STEPS[i] carries the story from RESTS[i] to RESTS[i + 1]
const STEPS: Step[] = [
  { film: "tree", from: "tree-start" },
  { film: "flysky" },
  { film: "trans" },
  {}, // the couple to the torch: a dissolve
  { film: "graft", from: "signal" },
  { film: "harvest-a" },
  { film: "harvest-b" },
]
const N = RESTS.length
const SEEN_KEY = "sota-intro-seen"
const FADE = 700 // ms, for dissolves, stepping back and leaving
const src = (name: string, ext: "mp4" | "jpg") => `/intro/${name}.${ext}`

// skipped: the visitor has watched it before, or asked for reduced motion (read on the client only)
const noSubscribe = () => () => {}
const readSkipped = () => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return true
  try { return !!localStorage.getItem(SEEN_KEY) } catch { return false }
}

export function EvolutionIntro() {
  const root = useRef<HTMLElement>(null)
  const skipped = useSyncExternalStore(noSubscribe, readSkipped, () => false)
  const [closed, setClosed] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [at, setAt] = useState(0) // the rest the story is on (or heading to)
  const [moving, setMoving] = useState(false) // a transition is playing
  const [film, setFilm] = useState<number | null>(null) // the step whose film is on screen
  const films = useRef<(HTMLVideoElement | null)[]>([])
  const loops = useRef<Record<string, HTMLVideoElement | null>>({})
  const state = useRef({ at: 0, moving: false, leaving: false })
  const visible = !skipped && !closed

  // fade away onto the home page, and remember it was seen
  const leave = useCallback(() => {
    if (state.current.leaving) return
    state.current.leaving = true
    setLeaving(true)
    try { localStorage.setItem(SEEN_KEY, "1") } catch {}
    setTimeout(() => setClosed(true), FADE)
  }, [])

  // the page underneath does not scroll while the intro is up
  useEffect(() => {
    if (!visible) return
    const html = document.documentElement, before = html.style.overflow
    html.style.overflow = "hidden"
    return () => { html.style.overflow = before }
  }, [visible])

  // the living painting of the current rest plays; every other loop is paused
  useEffect(() => {
    for (const [id, v] of Object.entries(loops.current)) {
      if (!v) continue
      // (from its first frame: that is where the film leading here ends)
      if (id === RESTS[at].loop && !moving) { if (v.paused) v.currentTime = 0; v.play().catch(() => {}) }
      else v.pause()
    }
    // fetch the next film while the visitor reads this rest
    const next = films.current[at]
    if (next && next.preload !== "auto") { next.preload = "auto"; next.load() }
  }, [at, moving, visible])

  useEffect(() => {
    if (!visible) return
    const el = root.current!
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

    const forward = async () => {
      const s = state.current
      if (s.moving || s.leaving) return
      if (s.at >= N - 1) return leave()
      const i = s.at, step = STEPS[i]
      s.moving = true; setMoving(true)
      const v = step.film ? films.current[i] : null
      if (v) {
        v.currentTime = 0
        if (v.readyState < 3) await new Promise((r) => v.addEventListener("canplay", r, { once: true }))
        if (step.from) await wait(FADE) // its first frame dissolves in over the rest (see the opacity below)
        setFilm(i)
        await v.play().catch(() => {})
        await new Promise((r) => v.addEventListener("ended", r, { once: true }))
      } else await wait(FADE)
      // the film holds its last frame until the rest's still (the same frame) has faded in under it
      s.at = i + 1; setAt(i + 1)
      if (v) await wait(FADE)
      setFilm(null)
      s.moving = false; setMoving(false)
    }
    const back = async () => {
      const s = state.current
      if (s.moving || s.leaving || s.at === 0) return
      s.moving = true; setMoving(true)
      s.at -= 1; setAt(s.at)
      await wait(FADE)
      s.moving = false; setMoving(false)
    }
    const step = (dir: 1 | -1) => (dir > 0 ? forward() : back())

    // a trackpad's momentum lands inside the running transition and is ignored
    const onWheel = (e: WheelEvent) => { e.preventDefault(); if (Math.abs(e.deltaY) >= 4) step(e.deltaY > 0 ? 1 : -1) }
    let ty = 0
    const onTouchStart = (e: TouchEvent) => { ty = e.touches[0].clientY }
    const onTouchMove = (e: TouchEvent) => e.preventDefault()
    const onTouchEnd = (e: TouchEvent) => {
      const dy = ty - e.changedTouches[0].clientY
      if (Math.abs(dy) > 40) step(dy > 0 ? 1 : -1)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return leave()
      const dir = ["ArrowDown", "ArrowRight", "PageDown", " ", "Enter"].includes(e.key) ? 1 : ["ArrowUp", "ArrowLeft", "PageUp"].includes(e.key) ? -1 : 0
      if (!dir || (e.target as HTMLElement).closest?.("button")) return
      e.preventDefault()
      step(dir)
    }
    const onClick = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest("button, a")) forward() }
    el.addEventListener("wheel", onWheel, { passive: false })
    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)
    addEventListener("keydown", onKey)
    el.addEventListener("click", onClick)
    return () => {
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      removeEventListener("keydown", onKey)
      el.removeEventListener("click", onClick)
    }
  }, [visible, leave])

  if (!visible) return null
  const last = at === N - 1 && !moving
  const fade = { transition: `opacity ${FADE}ms ease` }

  return (
    <section
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Phần mở đầu"
      className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden bg-[#0d4f9e]"
      style={{ ...fade, opacity: leaving ? 0 : 1, pointerEvents: leaving ? "none" : undefined }}
    >
      {/* the rests: a still (the last frame of the film that led here) or a living painting */}
      {RESTS.map((r, i) => (
        <div key={r.id} className="absolute inset-0 [&>*]:[object-position:var(--pos)] md:[&>*]:[object-position:center]" style={{ ...fade, opacity: i === at ? 1 : 0, "--pos": r.pos ?? "50% 50%" } as React.CSSProperties}>
          {r.loop ? (
            <video ref={(v) => { loops.current[r.loop!] = v }} src={src(r.loop, "mp4")} poster={src(r.id, "jpg")} muted loop playsInline preload={i === 0 ? "auto" : "metadata"} className="size-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src(r.id, "jpg")} alt="" loading={i < 2 ? "eager" : "lazy"} className="size-full object-cover" draggable={false} />
          )}
        </div>
      ))}
      {/* a step's first frame, dissolving in over a rest that looks different */}
      {STEPS.map((s, i) => s.from && s.from !== RESTS[i].loop ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={s.from} src={src(s.from, "jpg")} alt="" className="absolute inset-0 size-full object-cover" style={{ ...fade, opacity: moving && at === i ? 1 : 0 }} draggable={false} />
      ) : null)}
      {/* the films, shown only while they play */}
      {STEPS.map((s, i) => s.film ? (
        <video key={s.film} ref={(v) => { films.current[i] = v }} src={src(s.film, "mp4")} muted playsInline preload={i === 0 ? "auto" : "none"} className="absolute inset-0 size-full object-cover" style={{ opacity: film === i ? 1 : 0 }} />
      ) : null)}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

      {/* the wordmark, where the header would be */}
      <p className="pointer-events-none absolute left-5 top-5 flex items-baseline gap-2.5 text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.45)] md:left-8 md:top-6">
        <span className="font-heading text-2xl font-semibold italic tracking-tight">Sota</span>
        <span className="placard hidden text-white/75 sm:inline">Space of the Art</span>
      </p>

      {/* the line of the current rest */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[14vh] mx-auto max-w-7xl px-5 md:px-8">
        {RESTS.map((r, i) => (
          <div key={r.id} className="absolute inset-x-5 bottom-0 transition-all duration-700 md:inset-x-8" style={{ opacity: i === at && !moving ? 1 : 0, transform: `translateY(${i === at && !moving ? 0 : 14}px)` }} aria-hidden={i !== at}>
            <p className="placard text-white/75">{String(i + 1).padStart(2, "0")} · {r.chapter}</p>
            <p className={`mt-3 max-w-3xl font-heading font-light leading-[1.05] tracking-tight text-white [text-shadow:0_1px_28px_rgb(0_0_0/0.4)] ${i === N - 1 ? "text-5xl sm:text-7xl" : "text-3xl sm:text-5xl"}`}>
              {r.line}
              {i === N - 1 && <span className="mt-2 block italic">Sota.</span>}
            </p>
          </div>
        ))}
      </div>

      {/* the chapters down the right edge */}
      <ol aria-label="Các chương" className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 [text-shadow:0_1px_10px_rgb(0_0_0/0.55)] md:right-8 md:flex">
        {RESTS.map((r, i) => (
          <li key={r.id} className={`placard flex items-center justify-end gap-3 transition-colors ${i <= at ? "text-white" : "text-white/40"}`}>
            {r.chapter}
            <span className={`size-[7px] rounded-full border border-white/70 shadow-[0_0_6px_rgb(0_0_0/0.5)] ${i <= at ? "bg-white" : "bg-black/20"}`} />
          </li>
        ))}
      </ol>

      <button onClick={leave} className="placard absolute right-5 top-5 rounded-full border border-white/35 bg-black/20 px-4 py-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/35 md:right-8 md:top-6">
        Bỏ qua phần mở đầu
      </button>
      <p className="placard pointer-events-none absolute bottom-11 left-1/2 -translate-x-1/2 whitespace-nowrap text-white/60 md:bottom-6">
        {last ? "Nhấn để vào Sota" : "Nhấn hoặc cuộn để đi tiếp"}
      </p>
      <p className="pointer-events-none absolute bottom-4 left-5 text-[10px] text-white/50 md:bottom-6 md:left-8">Hình ảnh: Pear (pear.no), tạo bằng AI</p>
    </section>
  )
}
