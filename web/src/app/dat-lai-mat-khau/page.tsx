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
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="text-2xl font-light tracking-tight">Đặt lại mật khẩu</h1>
      <form onSubmit={send} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          Mật khẩu mới
          <input type="password" required minLength={8} autoComplete="new-password"
            value={password} onChange={e => setPassword(e.target.value)}
            className="rounded-md border border-border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          Nhập lại mật khẩu
          <input type="password" required minLength={8} autoComplete="new-password"
            value={confirm} onChange={e => setConfirm(e.target.value)}
            className="rounded-md border border-border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
        </label>
        {note && <p className="text-sm text-destructive">{note}</p>}
        <button disabled={loading} className="h-10 rounded-full bg-foreground text-background text-sm disabled:opacity-60">
          {loading ? "Đang lưu…" : "Lưu mật khẩu mới"}
        </button>
      </form>
    </div>
  )
}
