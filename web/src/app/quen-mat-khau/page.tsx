"use client"

import Link from "next/link"
import { useState } from "react"
import { GalleryMasthead } from "@/components/site/gallery-masthead"
import { RenaissanceCorners } from "@/components/renaissance/deco-assets"
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
    <div className="gallery-page pb-16">
      <GalleryMasthead label="Khôi phục truy cập" title="Quên mật khẩu" />
      <div className="gallery-sheet relative mx-auto mt-10 w-[calc(100%-2rem)] max-w-lg rounded-md p-6 sm:p-9">
        <RenaissanceCorners />
        {sent ? (
          <p className="mt-6 text-sm leading-relaxed text-stone-700">
            Email đặt lại đã được gửi đến <strong className="text-[#08162b]">{email}</strong>. Vui lòng kiểm tra hộp thư (kể cả thư mục spam).
          </p>
        ) : (
          <form onSubmit={send} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm text-stone-700">
              Email tài khoản
              <input
                type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                className="gallery-control w-full px-3 text-base"
              />
            </label>
            {note && <p role="status" className="text-sm text-rose-800">{note}</p>}
            <button disabled={loading} className="gallery-action mt-2 disabled:opacity-60">
              {loading ? "Đang gửi…" : "Gửi liên kết đặt lại"}
            </button>
          </form>
        )}
        <Link href="/dang-nhap" className="mt-6 inline-block text-sm text-stone-700 font-semibold underline underline-offset-4">Quay lại đăng nhập</Link>
      </div>
    </div>
  )
}
