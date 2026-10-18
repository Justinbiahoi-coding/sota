"use client"

import { useEffect, useRef } from "react"

// The opening: the evolution of art in six scenes. Scrolling dives into the material of one era
// (stone, bronze, ink, oil paint, open space, pixels) until it dissolves into the next.
// Everything that moves is a transform or opacity on a pre-rendered image, so it stays on the GPU.

type Scene = { art: string; era: string; line: string; placard: string; origin: string }

const SCENES: Scene[] = [
  { art: "stone", era: "Khoảng 40.000 năm trước", line: "Trước chữ viết, con người đã để lại dấu tay trên đá.", placard: "Tiền sử · Bảo tàng Lịch sử Tự nhiên", origin: "65% 46%" },
  { art: "bronze", era: "Khoảng 1200 TCN", line: "Rồi họ đúc đồng để nói chuyện với tổ tiên.", placard: "Đồ đồng nghi lễ · Bảo tàng Nghệ thuật châu Á", origin: "58% 48%" },
  { art: "ink", era: "Thế kỷ 8 đến 19", line: "Mực loang trên lụa, một con sóng vẽ bằng một nét.", placard: "Tranh mực · Bảo tàng Nghệ thuật châu Á", origin: "68% 32%" },
  { art: "oil", era: "Thế kỷ 18 và 19", line: "Gương mặt người được giữ lại bằng sơn dầu.", placard: "Chân dung · Phòng tranh Chân dung Quốc gia", origin: "50% 48%" },
  { art: "modern", era: "Thế kỷ 20", line: "Nghệ thuật rời khung tranh, bước vào không gian.", placard: "Điêu khắc · Bảo tàng Hirshhorn", origin: "50% 50%" },
  { art: "pixels", era: "Hôm nay", line: "Và giờ, nghệ thuật đến chỗ bạn.", placard: "Sota · Space of the Art", origin: "50% 50%" },
]

const N = SCENES.length
const SEEN_KEY = "sota-intro-seen"
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const ease = (t: number) => t * t * (3 - 2 * t)

export function EvolutionIntro({ nextId }: { nextId: string }) {
  const root = useRef<HTMLElement>(null)
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const lines = useRef<(HTMLDivElement | null)[]>([])
  const rail = useRef<HTMLDivElement>(null)
  const ticks = useRef<(HTMLLIElement | null)[]>([])
  const shade = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // reduced motion: the stacked version below is shown by CSS, nothing here runs
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const el = root.current!
    let target = 0, p = 0, raf = 0, seen = false

    // a visitor who has watched it once lands past it next time (unless they came back on purpose)
    try {
      if (localStorage.getItem(SEEN_KEY) && scrollY === 0 && !location.hash)
        document.getElementById(nextId)?.scrollIntoView({ behavior: "instant" })
    } catch {}

    const measure = () => {
      const top = el.offsetTop, span = el.offsetHeight - innerHeight
      target = clamp((scrollY - top) / span)
    }
    const render = () => {
      p += (target - p) * 0.14 // eased toward the scroll position, so wheel steps glide
      if (Math.abs(target - p) < 0.0004) p = target
      const f = p * N // which scene, and how far through it
      for (let i = 0; i < N; i++) {
        const u = f - i
        // entering (u -0.3..0): the material settles from large to its size; holding: a slow drift;
        // leaving (u 0.62..1): the camera dives into it and it dissolves
        let s = 1, o = 0
        if (u >= -0.3 && u < 0) { const t = ease((u + 0.3) / 0.3); s = 3.2 - 2.2 * t; o = t }
        else if (u >= 0 && u < 0.62) { s = 1 + 0.06 * (u / 0.62); o = 1 }
        else if (u >= 0.62 && u < 1) { const t = ease((u - 0.62) / 0.38); s = 1.06 + 6 * t * t; o = 1 - t }
        if (i === 0 && u < 0) { s = 1; o = 1 }        // the first scene is there from the start
        if (i === N - 1 && u >= 0.62) { s = 1.06; o = 1 } // and the last one stays to hand over
        const L = layers.current[i]
        if (L) { L.style.transform = `scale(${s.toFixed(4)})`; L.style.opacity = o.toFixed(3); L.style.visibility = o > 0.001 ? "visible" : "hidden" }
        const T = lines.current[i]
        if (T) {
          // each line peaks a third of the way through its scene (the first one is up from the start)
          const a = i === 0 && u < 0.3 ? 1 : clamp(1 - Math.abs(u - 0.3) / 0.3)
          T.style.opacity = (i === N - 1 ? clamp((u - 0.05) / 0.25) : a).toFixed(3)
          T.style.transform = `translateY(${((1 - a) * 18 * Math.sign(u - 0.3)).toFixed(1)}px)`
        }
        ticks.current[i]?.toggleAttribute("data-on", f >= i - 0.3)
      }
      rail.current?.style.setProperty("transform", `scaleY(${p.toFixed(4)})`)
      // the last scene is light: lift the dark shade off it as it arrives
      shade.current?.style.setProperty("opacity", (1 - clamp((f - (N - 1) + 0.3) / 0.3)).toFixed(3))
      // and switch the timeline and buttons from white to ink over it
      stage.current?.toggleAttribute("data-light", f > N - 1.2)
      if (!seen && p > 0.97) { seen = true; try { localStorage.setItem(SEEN_KEY, "1") } catch {} }
      raf = p === target ? 0 : requestAnimationFrame(render)
    }
    const kick = () => { measure(); if (!raf) raf = requestAnimationFrame(render) }
    kick()
    addEventListener("scroll", kick, { passive: true })
    addEventListener("resize", kick)
    return () => { removeEventListener("scroll", kick); removeEventListener("resize", kick); cancelAnimationFrame(raf) }
  }, [nextId])

  const skip = () => document.getElementById(nextId)?.scrollIntoView({ behavior: "smooth" })

  const stacked = (
    <section aria-label="Hành trình của nghệ thuật" className="hidden motion-reduce:block">
      {SCENES.map((sc) => (
        <figure key={sc.art} className="relative h-[80vh] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/intro-art/${sc.art}.webp`} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-8 text-white">
            <p className="placard opacity-80">{sc.era}</p>
            <p className="mt-2 font-heading text-3xl">{sc.line}</p>
          </figcaption>
        </figure>
      ))}
    </section>
  )

  return (
    <>
      {stacked}
      <section ref={root} aria-label="Hành trình của nghệ thuật" className="relative motion-reduce:hidden" style={{ height: `${N * 115 + 40}vh` }}>
        <div ref={stage} className="group/intro sticky top-0 h-[100svh] overflow-hidden bg-[#1b1611]">
          {SCENES.map((sc, i) => (
            <div key={sc.art} ref={(d) => { layers.current[i] = d }} className="absolute inset-0 will-change-transform" style={{ transformOrigin: sc.origin, opacity: i === 0 ? 1 : 0, visibility: i === 0 ? "visible" : "hidden" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/intro-art/${sc.art}.webp`} alt="" decoding="async" fetchPriority={i < 2 ? "high" : "low"} className="size-full object-cover" />
            </div>
          ))}
          {/* a soft darkening at the bottom so the line of text always reads */}
          <div ref={shade} className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/15" />

          {/* the line for each era */}
          <div className="pointer-events-none absolute inset-x-0 bottom-[16vh] mx-auto max-w-7xl px-5 md:px-8">
            {SCENES.map((sc, i) => (
              <div key={sc.art} ref={(d) => { lines.current[i] = d }} className="absolute inset-x-5 bottom-0 md:inset-x-8" style={{ opacity: i === 0 ? 1 : 0 }}>
                <p className={`placard ${i === N - 1 ? "text-[#1c1a17]/60" : "text-white/75"}`}>{sc.era}</p>
                {i === N - 1 ? (
                  <p className="mt-3 max-w-3xl font-heading text-5xl font-light leading-[1.02] tracking-tight text-[#1c1a17] sm:text-7xl">
                    {sc.line}<span className="mt-2 block italic">Sota.</span>
                  </p>
                ) : (
                  <p className="mt-3 max-w-2xl font-heading text-3xl font-light leading-tight text-white [text-shadow:0_1px_24px_rgb(0_0_0/0.45)] sm:text-5xl">{sc.line}</p>
                )}
                <p className={`placard mt-6 ${i === N - 1 ? "text-[#1c1a17]/60" : "text-white/60"}`}>{sc.placard}</p>
              </div>
            ))}
          </div>

          {/* the timeline down the right edge */}
          <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 md:right-8 md:block">
            <div className="absolute right-[3px] top-0 h-full w-px bg-white/25 group-data-[light]/intro:bg-black/15">
              <div ref={rail} className="h-full w-full origin-top bg-white group-data-[light]/intro:bg-[#1c1a17]" style={{ transform: "scaleY(0)" }} />
            </div>
            <ol className="relative flex h-[46vh] flex-col justify-between">
              {SCENES.map((sc, i) => (
                <li key={sc.art} ref={(d) => { ticks.current[i] = d }} className="group flex items-center justify-end gap-3" data-on={i === 0 ? "" : undefined}>
                  <span className="placard text-white/40 transition-colors group-data-[on]:text-white group-data-[light]/intro:text-black/35 group-data-[light]/intro:group-data-[on]:text-[#1c1a17]">{sc.era}</span>
                  <span className="size-[7px] rounded-full border border-white/50 bg-[#1b1611] transition-colors group-data-[on]:bg-white group-data-[light]/intro:border-black/40 group-data-[light]/intro:bg-[#f6f3ec] group-data-[light]/intro:group-data-[on]:bg-[#1c1a17]" />
                </li>
              ))}
            </ol>
          </div>

          <button onClick={skip} className="placard absolute right-5 top-20 rounded-full border border-white/30 px-4 py-2 text-white/80 backdrop-blur-sm transition-colors hover:bg-white/10 group-data-[light]/intro:border-black/25 group-data-[light]/intro:text-[#1c1a17] md:right-8">
            Bỏ qua phần mở đầu
          </button>
          <p className="placard absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 group-data-[light]/intro:text-black/45">Cuộn để đi tiếp</p>
        </div>
      </section>
    </>
  )
}
