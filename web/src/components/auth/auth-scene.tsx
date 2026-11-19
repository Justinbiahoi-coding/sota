"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { ArrowRight, AtSign, Lock, UserRound } from "lucide-react"
import { readGrain } from "@/lib/grain"

// Sign-in and sign-up, laid out like pear.no's application: the astronomer pointing at a constellation
// (a frame from Pear's films, made with AI), and the form floating in the sky as panes of glass on one
// plane, tipped in 3D and turning a little toward the pointer, their rims catching the light as it
// moves. Over the painting the stars glint and dashed orbits turn slowly.
// The form is checked in the browser; there is no server to send it to yet (the API is the backend's
// part), so sending says so instead of pretending.

type Mode = "login" | "register"
type Field = { name: string; type: string; label: string; icon: typeof AtSign; auto: string; min?: number }

const FIELDS: Record<Mode, Field[]> = {
  login: [
    { name: "email", type: "email", label: "Email", icon: AtSign, auto: "email" },
    { name: "password", type: "password", label: "Mật khẩu", icon: Lock, auto: "current-password", min: 8 },
  ],
  register: [
    { name: "name", type: "text", label: "Họ và tên", icon: UserRound, auto: "name" },
    { name: "email", type: "email", label: "Email", icon: AtSign, auto: "email" },
    { name: "password", type: "password", label: "Mật khẩu (từ 8 ký tự)", icon: Lock, auto: "new-password", min: 8 },
    { name: "confirm", type: "password", label: "Nhập lại mật khẩu", icon: Lock, auto: "new-password", min: 8 },
  ],
}
const COPY: Record<Mode, { label: string; lead: string; cta: string; switch: [string, string, string] }> = {
  login: {
    label: "Đăng nhập",
    lead: "Đăng nhập để đặt vé, lưu những hiện vật bạn thích và xem lại đơn hàng. Một tài khoản dùng cho cả cụm bảo tàng Smithsonian.",
    cta: "Đăng nhập",
    switch: ["Chưa có tài khoản?", "Đăng ký", "/dang-ky"],
  },
  register: {
    label: "Đăng ký",
    lead: "Tạo tài khoản để đặt vé cho nhiều bảo tàng trong một giỏ hàng, nhận vé có mã QR và lưu những hiện vật bạn thích.",
    cta: "Tạo tài khoản",
    switch: ["Đã có tài khoản?", "Đăng nhập", "/dang-nhap"],
  },
}
// the stars of the painting, as fractions of it (from its top left), and how bright each glints
const STARS: [number, number, number][] = [
  [0.377, 0.15, 1], [0.611, 0.098, 1.1], [0.248, 0.246, 0.8], [0.555, 0.215, 0.6], [0.42, 0.336, 0.6],
  [0.383, 0.388, 0.9], [0.433, 0.476, 0.8], [0.333, 0.529, 0.7], [0.411, 0.631, 0.7], [0.488, 0.631, 0.8],
  [0.8, 0.215, 0.6], [0.758, 0.596, 0.5], [0.401, 0.246, 0.4], [0.667, 0.246, 0.4], [0.914, 0.246, 0.5], [0.808, 0.089, 0.4],
]
// how each pane sits on the plane: a little turned, a little forward
const TILT = ["rotate(1.6deg) translateZ(22px)", "rotate(2.2deg) translateZ(8px)", "rotate(1.2deg) translateZ(14px)", "rotate(1.8deg) translateZ(4px)"]

const noSubscribe = () => () => {}

export function AuthScene({ mode }: { mode: Mode }) {
  const router = useRouter()
  const plane = useRef<HTMLDivElement>(null)
  const [note, setNote] = useState("")
  const grain = useSyncExternalStore(noSubscribe, readGrain, () => "none")
  const copy = COPY[mode], fields = FIELDS[mode]

  // the plane leans toward the pointer, eased; the rims' light follows its angle
  useEffect(() => {
    const el = plane.current!
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0
    const tick = () => {
      cx += (x - cx) * 0.08; cy += (y - cy) * 0.08
      el.style.setProperty("--rx", `${(9 - cy * 7).toFixed(2)}deg`)
      el.style.setProperty("--ry", `${(-14 + cx * 10).toFixed(2)}deg`)
      el.style.setProperty("--a", `${(160 + cx * 70 + cy * 40).toFixed(1)}deg`)
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.001 ? requestAnimationFrame(tick) : 0
    }
    const onMove = (e: PointerEvent) => {
      x = e.clientX / innerWidth - 0.5; y = e.clientY / innerHeight - 0.5
      if (!raf) raf = requestAnimationFrame(tick)
    }
    addEventListener("pointermove", onMove)
    return () => { removeEventListener("pointermove", onMove); cancelAnimationFrame(raf) }
  }, [])

  const send = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    if (mode === "register" && f.get("password") !== f.get("confirm")) return setNote("Hai mật khẩu chưa khớp nhau.")
    const email = String(f.get("email") || "")
    const name = String(f.get("name") || email.split("@")[0] || "Khách Sota")
    localStorage.setItem("sota_user_name", name)
    setNote(mode === "login" ? "Đăng nhập thành công! Đang chuyển hướng..." : "Tạo tài khoản thành công! Đang chuyển hướng...")
    setTimeout(() => {
      router.push("/tai-khoan")
    }, 600)
  }

  return (
    <main data-on="true" className="fixed inset-0 z-50 overflow-y-auto bg-[#0d4f9e] text-white md:overflow-hidden">
      {/* the painting, cover-fit, with its glints in a box the same size as it so they stay on its stars */}
      <div aria-hidden className="pointer-events-none fixed left-[38%] top-1/2 h-[max(56.25vw,100vh)] w-[max(100vw,177.78vh)] -translate-x-[38%] -translate-y-1/2 md:left-1/2 md:-translate-x-1/2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auth/sky.jpg" alt="" className="size-full" draggable={false} />
        {STARS.map(([sx, sy, b], k) => (
          <span key={k} className="glint absolute" style={{ left: `${sx * 100}%`, top: `${sy * 100}%`, "--b": b, animationDelay: `${(k * 0.73) % 4}s` } as React.CSSProperties} />
        ))}
      </div>
      <div aria-hidden className="film-grain pointer-events-none fixed inset-0" style={{ background: grain }} />

      {/* the chrome, as on the intro */}
      <div className="pointer-events-none fixed inset-y-0 left-14 w-px bg-white/22 md:left-[72px]" />
      <div className="pointer-events-none fixed inset-x-0 top-14 h-px bg-white/22 md:top-[72px]" />
      <Link href="/" aria-label="Sota" className="absolute left-0 top-0 grid size-14 place-items-center font-heading text-3xl italic md:size-[72px]">S</Link>
      <Link href="/" className="placard absolute right-4 top-3 inline-flex items-center gap-3 rounded-[3px] bg-[#111] py-1.5 pl-4 pr-1.5 md:right-8 md:top-[18px]">
        Về Sota
        <span className="grid size-7 place-items-center rounded-[2px] border border-white/25"><ArrowRight className="size-3.5" /></span>
      </Link>

      {/* (on a phone the words and the form run down the page, which scrolls; wider, they float apart) */}
      <div className="relative flex min-h-full flex-col justify-between gap-10 pb-14 pl-[calc(3.5rem+1.25rem)] pr-5 pt-[calc(3.5rem+1.5rem)] md:block md:p-0">
      {/* the words, top left */}
      <div className="md:absolute md:left-[calc(72px+2rem)] md:top-[calc(72px+3rem)] md:w-[min(34vw,30rem)]">
        <span className="placard rounded-[3px] bg-white/12 px-2.5 py-1.5">Tài khoản · {copy.label}</span>
        <p className="ink mt-6 font-heading text-xl leading-snug [text-shadow:0_1px_18px_rgb(0_0_0/0.35)] md:text-2xl">{copy.lead}</p>
        <p className="placard mt-6 flex items-center gap-3 opacity-80">
          <span className="h-px w-6 bg-current" />{copy.switch[0]}
          <Link href={copy.switch[2]} className="underline decoration-white/40 underline-offset-4 hover:decoration-white">{copy.switch[1]}</Link>
        </p>
      </div>

      {/* the form: panes of glass on one plane, tipped toward the pointer */}
      <div className="relative md:absolute md:left-[47vw] md:top-[27vh] md:w-[min(42vw,40rem)] md:[perspective:1700px]">
        {/* the orbits, behind the panes */}
        <svg aria-hidden viewBox="0 0 600 500" className="pointer-events-none absolute -left-[22%] -top-[45%] hidden h-[190%] w-[144%] md:block">
          <ellipse className="orbit" cx="300" cy="250" rx="270" ry="120" style={{ "--r": "-14deg", animationDuration: "140s" } as React.CSSProperties} />
          <ellipse className="orbit" cx="300" cy="250" rx="200" ry="230" style={{ "--r": "-76deg", animationDuration: "190s", animationDirection: "reverse" } as React.CSSProperties} />
        </svg>
        <div ref={plane} className="md:[transform-style:preserve-3d] md:[transform:rotateX(var(--rx,9deg))_rotateY(var(--ry,-14deg))_rotateZ(1.5deg)]" style={{ "--a": "160deg" } as React.CSSProperties}>
          <form onSubmit={send} className="grid gap-4 md:grid-cols-2 md:gap-x-7 md:gap-y-9 md:[transform-style:preserve-3d]" noValidate={false}>
            {fields.map((f, k) => {
              const Icon = f.icon
              return (
                <label key={f.name} className="glass relative flex h-[58px] items-center gap-3.5 rounded-full pl-6 pr-4 md:h-[74px]" style={{ transform: TILT[k % TILT.length] }}>
                  <span aria-hidden className="rim rounded-full" />
                  <Icon aria-hidden className="size-4 shrink-0 opacity-85" />
                  <span className="sr-only">{f.label}</span>
                  <input name={f.name} type={f.type} required minLength={f.min} autoComplete={f.auto} placeholder={f.label}
                    className="w-full min-w-0 bg-transparent text-[17px] text-white outline-none placeholder:text-white/85 md:text-xl" />
                </label>
              )
            })}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-2 md:mt-3" style={{ transform: "rotate(1.6deg) translateZ(30px)" }}>
              <button className="placard inline-flex h-[52px] items-center gap-4 rounded-full bg-[#0b0b0d] px-8 text-[0.8rem] md:h-[62px] md:px-12 md:text-[0.9rem] tracking-[0.22em] shadow-[0_10px_30px_rgb(0_0_0/0.35)] transition-transform hover:scale-[1.02]">
                {copy.cta}
              </button>
              {mode === "login" && <button type="button" onClick={() => setNote("Đặt lại mật khẩu sẽ gửi qua email khi máy chủ tài khoản chạy.")} className="placard opacity-75 hover:opacity-100">Quên mật khẩu?</button>}
            </div>
          </form>
          <p aria-live="polite" className="mt-6 min-h-6 max-w-md text-sm leading-relaxed [text-shadow:0_1px_12px_rgb(0_0_0/0.5)]">{note}</p>
        </div>
      </div>

      </div>

      <p className="pointer-events-none fixed bottom-3 left-[calc(3.5rem+1.25rem)] text-[10px] opacity-55 md:bottom-6 md:left-[calc(72px+1.5rem)]">Hình ảnh: Pear (pear.no), tạo bằng AI</p>
    </main>
  )
}
