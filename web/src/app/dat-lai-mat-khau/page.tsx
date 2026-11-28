"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { GalleryMasthead } from "@/components/site/gallery-masthead"
import { RenaissanceCorners } from "@/components/renaissance/deco-assets"
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
    <div className="gallery-page pb-16">
      <GalleryMasthead label="Bảo mật" title="Đặt lại mật khẩu" />
      <div className="gallery-sheet relative mx-auto mt-10 w-[calc(100%-2rem)] max-w-lg rounded-md p-6 sm:p-9">
        <RenaissanceCorners />
        <form onSubmit={send} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm text-stone-700">
            Mật khẩu mới
            <input type="password" required minLength={8} autoComplete="new-password"
              value={password} onChange={e => setPassword(e.target.value)}
              className="gallery-control w-full px-3 text-base" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm text-stone-700">
            Nhập lại mật khẩu
            <input type="password" required minLength={8} autoComplete="new-password"
              value={confirm} onChange={e => setConfirm(e.target.value)}
              className="gallery-control w-full px-3 text-base" />
          </label>
          {note && <p role="status" className="text-sm text-rose-800">{note}</p>}
          <button disabled={loading} className="gallery-action mt-2 disabled:opacity-60">
            {loading ? "Đang lưu…" : "Lưu mật khẩu mới"}
          </button>
        </form>
      </div>
    </div>
  )
}
