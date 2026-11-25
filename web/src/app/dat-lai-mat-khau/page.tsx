"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function Page() {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setNote("Hai mật khẩu chưa khớp nhau."); return }
    setLoading(true)
    setNote("")
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setNote(error.message); return }
    router.push("/dang-nhap")
  }

  return (
    <div className="mx-auto max-w-md px-5 pt-28 pb-16">
      <div className="rounded-2xl border border-[#d4af37]/30 bg-[#08162b]/90 p-8 shadow-2xl backdrop-blur-md">
        <p className="placard text-[0.65rem] text-[#fbe396]">Tài khoản · Bảo mật</p>
        <h1 className="mt-2 font-heading text-3xl font-light tracking-tight text-white">Đặt lại mật khẩu</h1>
        <form onSubmit={send} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-stone-200">
            Mật khẩu mới
            <input type="password" required minLength={8} autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)}
              className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-white outline-none transition-colors focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-stone-200">
            Nhập lại mật khẩu
            <input type="password" required minLength={8} autoComplete="new-password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-white outline-none transition-colors focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]" />
          </label>
          {note && <p className="text-sm text-rose-400">{note}</p>}
          <button disabled={loading} className="mt-2 h-11 rounded-full bg-[#d4af37] text-xs font-semibold uppercase tracking-wider text-[#08162b] transition-colors hover:bg-[#e5c158] disabled:opacity-60">
            {loading ? "Đang lưu…" : "Lưu mật khẩu mới"}
          </button>
        </form>
      </div>
    </div>
  )
}
