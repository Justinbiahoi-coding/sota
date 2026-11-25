"use client"

import Link from "next/link"
import { useState } from "react"
import type { Metadata } from "next"
import { createClient } from "@/lib/supabase/client"

export default function Page() {
  const [email, setEmail] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setNote("")
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/dat-lai-mat-khau`,
    })
    setLoading(false)
    if (error) { setNote(error.message); return }
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-md px-5 pt-28 pb-16">
      <div className="rounded-2xl border border-[#d4af37]/30 bg-[#08162b]/90 p-8 shadow-2xl backdrop-blur-md">
        <p className="placard text-[0.65rem] text-[#fbe396]">Tài khoản · Khôi phục truy cập</p>
        <h1 className="mt-2 font-heading text-3xl font-light tracking-tight text-white">Quên mật khẩu</h1>
        {sent ? (
          <p className="mt-6 text-sm leading-relaxed text-stone-300">
            Email đặt lại đã được gửi đến <strong className="text-white">{email}</strong>. Vui lòng kiểm tra hộp thư (kể cả thư mục spam).
          </p>
        ) : (
          <form onSubmit={send} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-stone-200">
              Email tài khoản
              <input
                type="email" required autoComplete="email"
                placeholder="email@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-white outline-none transition-colors focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
              />
            </label>
            {note && <p className="text-sm text-rose-400">{note}</p>}
            <button disabled={loading} className="mt-2 h-11 rounded-full bg-[#d4af37] text-xs font-semibold uppercase tracking-wider text-[#08162b] transition-colors hover:bg-[#e5c158] disabled:opacity-60">
              {loading ? "Đang gửi…" : "Gửi liên kết đặt lại"}
            </button>
          </form>
        )}
        <Link href="/dang-nhap" className="mt-6 inline-block text-sm text-stone-300 hover:text-[#fbe396] hover:underline">← Quay lại đăng nhập</Link>
      </div>
    </div>
  )
}
