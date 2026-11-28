"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { AtSign, Eye, EyeOff, Lock, UserRound } from "lucide-react"
import Image from "next/image"
import { RenaissanceCorners } from "@/components/renaissance/deco-assets"
import { StarBorder } from "@/components/reactbits/star-border"
import { createClient } from "@/lib/supabase/client"

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
    lead: "Xem vé tham quan, theo dõi đơn lưu niệm và quản lý hồ sơ của bạn.",
    cta: "Đăng nhập",
    switch: ["Chưa có tài khoản?", "Đăng ký", "/dang-ky"],
  },
  register: {
    label: "Đăng ký",
    lead: "Tạo một tài khoản để đặt vé tham quan và theo dõi đơn lưu niệm.",
    cta: "Tạo tài khoản",
    switch: ["Đã có tài khoản?", "Đăng nhập", "/dang-nhap"],
  },
}
export function AuthScene({ mode }: { mode: Mode }) {
  const router = useRouter()
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const copy = COPY[mode]
  const fields = FIELDS[mode]

  const send = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const email = String(f.get("email") ?? "")
    const password = String(f.get("password") ?? "")

    if (mode === "register" && f.get("password") !== f.get("confirm")) {
      setNote("Hai mật khẩu chưa khớp nhau.")
      return
    }

    setLoading(true)
    setNote("")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient()
        if (mode === "login") {
          const { error } = await supabase.auth.signInWithPassword({ email, password })
          if (error) { setNote(error.message); setLoading(false); return }
          localStorage.setItem("sota_user_name", email.split("@")[0] || "Khách Sota")
          router.push("/tai-khoan")
          router.refresh()
          return
        } else {
          const name = String(f.get("name") ?? "")
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: name } },
          })
          if (error) { setNote(error.message); setLoading(false); return }
          if (data.session) {
            localStorage.setItem("sota_user_name", name || email.split("@")[0] || "Khách Sota")
            router.push("/tai-khoan")
            router.refresh()
            return
          }
          setNote("Kiểm tra email để xác nhận tài khoản.")
          setLoading(false)
          return
        }
      } catch {
        setNote("Chưa thể kết nối để xác thực tài khoản. Vui lòng thử lại.")
        setLoading(false)
        return
      }
    }

    // Chế độ thử nghiệm Frontend Mock (Không phụ thuộc backend/Supabase)
    const name = String(f.get("name") || email.split("@")[0] || "Khách Sota")
    localStorage.setItem("sota_user_name", name)
    setNote(mode === "login" ? "Đăng nhập thành công (thử nghiệm)! Đang vào tài khoản..." : "Đăng ký thành công! Đang vào tài khoản...")
    setTimeout(() => {
      router.push("/tai-khoan")
      router.refresh()
    }, 500)
  }

  return (
    <section className="gallery-page pt-[72px]">
      <div className="grid min-h-[calc(100svh-72px)] lg:grid-cols-[1fr_1fr]">
        <div className="gallery-on-dark relative isolate flex min-h-72 flex-col justify-end overflow-hidden bg-[#08162b] p-7 text-[#f7f4ec] sm:p-12 lg:p-16">
          <Image
            src="/auth/sky.jpg"
            alt=""
            fill
            sizes="(max-width: 1023px) 100vw, 50vw"
            priority
            className="-z-20 object-cover object-[43%_center]"
          />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-[#08162b] via-[#08162b]/65 to-[#08162b]/10" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-4 border border-[#d4af37]/35 sm:inset-7">
            <RenaissanceCorners />
          </div>
          <div className="gallery-enter">
            <p className="gallery-kicker">Tài khoản Sota</p>
            <p className="mt-5 font-heading text-5xl leading-none italic sm:text-7xl">Space of the Art</p>
          </div>
        </div>
        <div className="flex items-center justify-center px-5 py-12 sm:px-10 lg:py-16">
          <div className="gallery-enter w-full max-w-md">
            <h1 className="font-heading text-5xl leading-none tracking-tight sm:text-6xl">{copy.label}</h1>
            <p className="mt-4 text-base leading-relaxed text-stone-700">{copy.lead}</p>
            <form onSubmit={send} className="mt-7 grid gap-4" aria-busy={loading}>
              {fields.map((field) => {
                const Icon = field.icon
                return (
                  <div key={field.name}>
                    <label htmlFor={field.name} className="block text-sm font-semibold">{field.label}</label>
                    <div className="relative mt-1.5">
                      <Icon aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#77531c]" />
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type === "password" && showPassword ? "text" : field.type}
                        required
                        minLength={field.min}
                        autoComplete={field.auto}
                        className="gallery-control w-full py-2.5 ps-10 pe-12 text-base"
                      />
                      {field.name === "password" && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                          className="absolute inset-y-0 right-0 flex min-w-11 items-center justify-center text-[#77531c]"
                        >
                          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              {mode === "login" && <Link href="/quen-mat-khau" className="justify-self-end text-sm font-semibold text-[#77531c] underline underline-offset-4">Quên mật khẩu?</Link>}
              {note && <p role="status" className="rounded border border-[#e1d8c7] bg-white p-3 text-sm text-[#08162b]">{note}</p>}
              <StarBorder type="submit" disabled={loading} className="min-h-12 w-full bg-[#d4af37] disabled:opacity-60">
                {loading ? "Đang xử lý…" : copy.cta}
              </StarBorder>
            </form>
            <p className="mt-6 border-t border-[#e1d8c7] pt-5 text-sm text-stone-700">
              {copy.switch[0]}{" "}
              <Link href={copy.switch[2]} className="font-semibold text-[#77531c] underline underline-offset-4">{copy.switch[1]}</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
