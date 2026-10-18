"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import { ArrowRight } from "lucide-react"

// The opening: a full-screen chain of living paintings (images and films by Pear, pear.no, made
// with AI) over the whole site, header included. Like pear.no, each visit opens on one of three
// living paintings, picked at random; each has its own bridge film, and all three bridges arrive
// on the same close-up (hands grafting a branch), from where the story runs on together.
// Each step (a click or tap, one notch of the wheel, a swipe, an arrow key) plays the short film
// that carries the camera to the next painting, then rests. Films are played, never scrubbed.
// Leaving (the last scene, "Bỏ qua", Esc) fades it away onto the home page.
// Media: public/intro/ (films re-encoded from Pear's frame sequences, stills are their end frames).

type Rest = { id: string; chapter: string; line: string; loop?: string; pos?: string } // loop: a living painting while resting; pos: where to crop it on a narrow screen
type Step = { film?: string; from?: string } // film: the transition; from: its first frame, if the rest before differs

// the three openings (pos: where the figure stands, kept in frame on a narrow screen)
const HEROES = [
  { id: "signal", pos: "70% 60%" }, // the statue raising a torch over a crowd
  { id: "colossus", pos: "73% 54%" }, // the golden pear on its plinth
  { id: "reveal", pos: "68% 50%" }, // the youth drawing a curtain
]
// the story after the bridge, shared by every opening
const SHARED: Rest[] = [
  { id: "graft", chapter: "Ghép cành", line: "Ở đây, quá khứ được ghép vào hiện tại." },
  { id: "ripe", chapter: "Trái chín", line: "Từng hiện vật được chăm chút như một trái chín." },
  { id: "share", chapter: "Chia sẻ", line: "Rồi được chia cho mọi người." },
  { id: "garden", chapter: "Khu vườn", line: "Nghệ thuật lớn lên như một khu vườn." },
  { id: "sky", chapter: "Bầu trời", line: "Người xưa nhìn lên trời và kể lại những gì họ thấy." },
  { id: "couple", chapter: "Vun trồng", line: "Mỗi thế hệ lại tưới thêm một chút.", loop: "couple" },
]
// SHARED_STEPS[i] carries the story from SHARED[i] to SHARED[i + 1]
const SHARED_STEPS: Step[] = [
  { film: "harvest-a" },
  { film: "harvest-b" },
  { film: "tree", from: "tree-start" }, // the halves dissolve into the woman picking pears
  { film: "flysky" },
  { film: "trans" },
]
const SEEN_KEY = "sota-intro-seen"
const FADE = 700 // ms, for dissolves, stepping back and leaving
const src = (name: string, ext: "mp4" | "jpg") => `/intro/${name}.${ext}`

// read on the client only: skipped (seen before, or reduced motion) and which opening to show
const noSubscribe = () => () => {}
const readSkipped = () => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return true
  try { return !!localStorage.getItem(SEEN_KEY) } catch { return false }
}
let pick = -1
const readHero = () => (pick < 0 ? (pick = Math.floor(Math.random() * HEROES.length)) : pick)

export function EvolutionIntro() {
  const root = useRef<HTMLElement>(null)
  const skipped = useSyncExternalStore(noSubscribe, readSkipped, () => false)
  const hero = HEROES[useSyncExternalStore(noSubscribe, readHero, () => 0)]
  const { rests, steps } = useMemo(() => ({
    rests: [{ id: hero.id, chapter: "Mở màn", line: "", loop: hero.id, pos: hero.pos }, ...SHARED] as Rest[],
    steps: [{ film: `bridge-${hero.id}`, from: `bridge-${hero.id}-start` }, ...SHARED_STEPS] as Step[],
  }), [hero])
  const N = rests.length
  const [closed, setClosed] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [at, setAt] = useState(0) // the rest the story is on (or heading to)
  const [moving, setMoving] = useState(false) // a transition is playing
  const [film, setFilm] = useState<number | null>(null) // the step whose film is on screen
  const films = useRef<(HTMLVideoElement | null)[]>([])
  const loops = useRef<Record<string, HTMLVideoElement | null>>({})
  const state = useRef({ at: 0, moving: false, leaving: false })
  const plan = useRef({ steps, N })
  useEffect(() => { plan.current = { steps, N } }, [steps, N])
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
      if (id === rests[at].loop && !moving) { if (v.paused && at > 0) v.currentTime = 0; v.play().catch(() => {}) }
      else v.pause()
    }
    // fetch the next film while the visitor reads this rest
    const next = films.current[at]
    if (next && next.preload !== "auto") { next.preload = "auto"; next.load() }
  }, [at, moving, visible, rests])

  useEffect(() => {
    if (!visible) return
    const el = root.current!
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

    const forward = async () => {
      const s = state.current, { steps, N } = plan.current
      if (s.moving || s.leaving) return
      if (s.at >= N - 1) return leave()
      const i = s.at, step = steps[i]
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
      // (on a focused button, Enter and Space press it; the arrows always step)
      if (!dir || ((e.key === "Enter" || e.key === " ") && (e.target as HTMLElement).closest?.("button"))) return
      e.preventDefault()
      step(dir)
    }
    const onClick = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest("button, a")) forward() }
    // (the opening's own button moves on too)
    const start = el.querySelector<HTMLButtonElement>("[data-start]")
    const onStart = () => forward()
    el.addEventListener("wheel", onWheel, { passive: false })
    el.addEventListener("touchstart", onTouchStart, { passive: true })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)
    addEventListener("keydown", onKey)
    el.addEventListener("click", onClick)
    start?.addEventListener("click", onStart)
    return () => {
      el.removeEventListener("wheel", onWheel)
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      removeEventListener("keydown", onKey)
      el.removeEventListener("click", onClick)
      start?.removeEventListener("click", onStart)
    }
  }, [visible, leave])

  if (!visible) return null
  const last = at === N - 1 && !moving
  const onHero = at === 0 && !moving
  const fade = { transition: `opacity ${FADE}ms ease` }
  const line = "pointer-events-none absolute bg-white/20"

  return (
    <section
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label="Phần mở đầu"
      className="fixed inset-0 z-50 cursor-pointer select-none overflow-hidden bg-[#0d4f9e]"
      style={{ ...fade, opacity: leaving ? 0 : 1, pointerEvents: leaving ? "none" : undefined }}
    >
      {/* the rests: a living painting, or a still (the last frame of the film that led here) */}
      {rests.map((r, i) => (
        <div key={r.id} className="absolute inset-0 [&>*]:[object-position:var(--pos)] md:[&>*]:[object-position:center]" style={{ ...fade, opacity: i === at ? 1 : 0, "--pos": r.pos ?? "50% 50%" } as React.CSSProperties}>
          {r.loop ? (
            <video ref={(v) => { loops.current[r.loop!] = v }} src={src(r.loop, "mp4")} poster={src(r.id, "jpg")} muted loop playsInline autoPlay={i === 0} preload={i === 0 ? "auto" : "metadata"} className="size-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src(r.id, "jpg")} alt="" loading={i < 2 ? "eager" : "lazy"} className="size-full object-cover" draggable={false} />
          )}
        </div>
      ))}
      {/* a step's first frame, dissolving in over a rest that looks different */}
      {steps.map((s, i) => s.from ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={s.from} src={src(s.from, "jpg")} alt="" className="absolute inset-0 size-full object-cover" style={{ ...fade, opacity: moving && at === i ? 1 : 0 }} draggable={false} />
      ) : null)}
      {/* the films, shown only while they play */}
      {steps.map((s, i) => s.film ? (
        <video key={s.film} ref={(v) => { films.current[i] = v }} src={src(s.film, "mp4")} muted playsInline preload={i === 0 ? "auto" : "none"} className="absolute inset-0 size-full object-cover" style={{ opacity: film === i ? 1 : 0 }} />
      ) : null)}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />

      {/* the opening: a ruled page over the painting, title, line, button, and a word on Sota */}
      <div className="absolute inset-0" style={{ ...fade, opacity: onHero ? 1 : 0, pointerEvents: onHero ? undefined : "none" }}>
        {/* on a narrow screen the title sits over the figure: a soft shade behind it */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-transparent md:hidden" />
        <div className={`${line} inset-y-0 left-[7vw] w-px`} />
        <div className={`${line} inset-x-0 top-[18vh] h-px`} />
        <div className={`${line} inset-x-0 top-[74vh] h-px`} />
        <span className="pointer-events-none absolute left-[7vw] top-[74vh] -translate-x-1/2 -translate-y-1/2 text-sm text-white">✦</span>
        <span className="pointer-events-none absolute right-[14vw] top-[74vh] hidden -translate-y-1/2 translate-x-1/2 text-sm text-white md:block">✦</span>
        <div className="absolute left-[10vw] right-5 top-[30vh] md:right-auto">
          <h1 className="font-heading text-5xl font-light leading-[0.98] tracking-tight text-white [text-shadow:0_2px_30px_rgb(0_0_0/0.25)] sm:text-7xl xl:text-8xl">Space of the Art.</h1>
          <p className="mt-6 font-heading text-2xl font-light leading-snug text-white sm:text-3xl">
            Hai mươi mốt bảo tàng Smithsonian,<br />một lối vào.
          </p>
          <button data-start className="placard mt-10 inline-flex items-center gap-4 rounded-[3px] bg-[#111] py-1.5 pl-5 pr-1.5 text-white transition-colors hover:bg-black">
            Bắt đầu tham quan
            <span className="grid size-8 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
          </button>
        </div>
        <div className="pointer-events-none absolute left-[10vw] right-5 top-[calc(74vh+2.5rem)] hidden gap-16 md:flex">
          <span className="placard h-fit shrink-0 rounded-[3px] bg-white/12 px-3 py-2 text-white/85">Cụm Smithsonian</span>
          <p className="max-w-xl text-lg leading-relaxed text-white [text-shadow:0_1px_16px_rgb(0_0_0/0.35)]">
            Xem hiện vật thật từ bộ sưu tập Smithsonian, dạo phòng trưng bày 3D của từng bảo tàng và đặt vé cho cả ngày tham quan trong một lần thanh toán.
          </p>
        </div>
      </div>

      {/* the wordmark, where the header would be */}
      <p className="pointer-events-none absolute left-5 top-5 flex items-baseline gap-2.5 text-white [text-shadow:0_1px_12px_rgb(0_0_0/0.45)] md:left-8 md:top-6">
        <span className="font-heading text-2xl font-semibold italic tracking-tight">Sota</span>
        <span className="placard hidden text-white/75 sm:inline">Space of the Art</span>
      </p>

      {/* the line of each later rest */}
      <div className="pointer-events-none absolute inset-x-0 bottom-[14vh] mx-auto max-w-7xl px-5 md:px-8">
        {rests.map((r, i) => i === 0 ? null : (
          <div key={r.id} className="absolute inset-x-5 bottom-0 transition-all duration-700 md:inset-x-8" style={{ opacity: i === at && !moving ? 1 : 0, transform: `translateY(${i === at && !moving ? 0 : 14}px)` }} aria-hidden={i !== at}>
            <p className="placard text-white/75">{String(i + 1).padStart(2, "0")} · {r.chapter}</p>
            <p className={`mt-3 max-w-3xl font-heading font-light leading-[1.05] tracking-tight text-white [text-shadow:0_1px_28px_rgb(0_0_0/0.4)] ${i === N - 1 ? "text-4xl sm:text-6xl" : "text-3xl sm:text-5xl"}`}>
              {r.line}
              {i === N - 1 && <span className="mt-2 block italic">Sota.</span>}
            </p>
          </div>
        ))}
      </div>

      {/* the chapters down the right edge */}
      <ol aria-label="Các chương" className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-3 [text-shadow:0_1px_10px_rgb(0_0_0/0.55)] md:right-8 md:flex" style={{ ...fade, opacity: onHero ? 0 : 1 }}>
        {rests.map((r, i) => (
          <li key={r.id} className={`placard flex items-center justify-end gap-3 transition-colors ${i <= at ? "text-white" : "text-white/40"}`}>
            {r.chapter}
            <span className={`size-[7px] rounded-full border border-white/70 shadow-[0_0_6px_rgb(0_0_0/0.5)] ${i <= at ? "bg-white" : "bg-black/20"}`} />
          </li>
        ))}
      </ol>

      <button onClick={leave} className="placard absolute right-5 top-5 rounded-full border border-white/35 bg-black/20 px-4 py-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/35 md:right-8 md:top-6">
        Bỏ qua phần mở đầu
      </button>
      <p className="placard pointer-events-none absolute bottom-11 left-1/2 -translate-x-1/2 whitespace-nowrap text-white/60 md:bottom-6" style={{ ...fade, opacity: onHero ? 0 : 1 }}>
        {last ? "Nhấn để vào Sota" : "Nhấn hoặc cuộn để đi tiếp"}
      </p>
      <p className="pointer-events-none absolute bottom-4 left-5 text-[10px] text-white/50 md:bottom-6 md:left-8">Hình ảnh: Pear (pear.no), tạo bằng AI</p>
    </section>
  )
}
