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
    <div className="mx-auto max-w-sm px-5 py-20">
      <h1 className="text-2xl font-light tracking-tight">Quên mật khẩu</h1>
      {sent ? (
        <p className="mt-6 text-muted-foreground">
          Email đặt lại đã được gửi đến <strong>{email}</strong>. Kiểm tra hộp thư (kể cả thư mục spam).
        </p>
      ) : (
        <form onSubmit={send} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            Email
            <input
              type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              className="rounded-md border border-border bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          {note && <p className="text-sm text-destructive">{note}</p>}
          <button disabled={loading} className="h-10 rounded-full bg-foreground text-background text-sm disabled:opacity-60">
            {loading ? "Đang gửi…" : "Gửi link đặt lại"}
          </button>
        </form>
      )}
      <Link href="/dang-nhap" className="mt-6 block text-sm text-muted-foreground hover:underline">← Quay lại đăng nhập</Link>
    </div>
  )
}
