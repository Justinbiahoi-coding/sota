"use client"

import { useState } from "react"
import Link from "next/link"
import type { AdminBackendStore } from "./admin-api"

export function AdminAccess({ store }: { store: AdminBackendStore }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const configured = Boolean(process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  return (
    <div className="min-h-screen bg-[#f7f6ef] text-[#202d2a] p-6">
      <div className="max-w-lg mx-auto my-16 bg-white border border-[#d6ddd3] p-8 space-y-5">
        <h1 className="font-heading text-4xl">Quản trị SOTA</h1>
        <p className="text-sm text-[#53685f]">
          Đăng nhập bằng tài khoản đã được cấp quyền quản trị. Hệ thống xác định vai trò và phạm vi quản lý sau khi đăng nhập.
        </p>
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-semibold">Quản trị bảo tàng (admin user)</dt>
            <dd className="text-[#53685f]">
              Quản lý nội dung, vé, sản phẩm, đơn hàng và media tại các bảo tàng được phân công có quyền đang hoạt động.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Quản trị hệ thống (super admin)</dt>
            <dd className="text-[#53685f]">
              Quản lý dữ liệu của tất cả bảo tàng và tạo bảo tàng mới.
            </dd>
          </div>
        </dl>
        {!configured && <p role="alert">Cần cấu hình địa chỉ Express và Supabase để đăng nhập quản trị.</p>}
        {(store.error || error) && <p role="alert" className="text-red-800">{error || store.error}</p>}
        {store.profile ? (
          <>
            <p>{store.role === "super_admin"
              ? "Hệ thống chưa có bảo tàng. Bạn có thể tạo bảo tàng đầu tiên."
              : "Tài khoản chưa được phân công bảo tàng với quyền đang hoạt động. Liên hệ quản trị hệ thống để được cấp quyền."}</p>
            {store.role === "super_admin" && (
              <form className="grid gap-3" onSubmit={async event => {
                event.preventDefault()
                if (busy) return
                const form = new FormData(event.currentTarget)
                setBusy(true); setError("")
                try {
                  await store.save("", "museum", "", String(form.get("name")), "draft", { slug: String(form.get("slug")) })
                  await store.initialize()
                } catch (error) { setError(error instanceof Error ? error.message : "Không tạo được bảo tàng.") }
                finally { setBusy(false) }
              }}>
                <h2 className="font-semibold">Tạo bảo tàng đầu tiên</h2>
                <label>Tên<input className="border p-2 w-full" name="name" required maxLength={160} /></label>
                <label>Slug<input className="border p-2 w-full" name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" /></label>
                <button disabled={busy} className="bg-[#184c40] text-white p-3">{busy ? "Đang lưu…" : "Tạo bảo tàng"}</button>
              </form>
            )}
          </>
        ) : (
          <form className="grid gap-4" onSubmit={async event => {
            event.preventDefault()
            if (busy || !configured) return
            const form = new FormData(event.currentTarget)
            setBusy(true); setError("")
            try { await store.signIn(String(form.get("email")), String(form.get("password"))) }
            catch (error) { setError(error instanceof Error ? error.message : "Đăng nhập thất bại.") }
            finally { setBusy(false) }
          }}>
            <label>Email<input className="border p-2 w-full" name="email" type="email" autoComplete="username" required /></label>
            <label>Mật khẩu<input className="border p-2 w-full" name="password" type="password" autoComplete="current-password" required /></label>
            <button disabled={busy || !configured} className="bg-[#184c40] text-white p-3" type="submit">{busy ? "Đang đăng nhập…" : "Đăng nhập quản trị"}</button>
          </form>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#e5ebe3] text-xs font-semibold">
          <button
            disabled={busy}
            onClick={() => { void store.initialize() }}
            className="rounded border border-[#d6ddd3] bg-[#f7f6ef] px-3 py-1.5 text-[#184c40] hover:bg-[#edf2eb] cursor-pointer"
          >
            Tải lại quyền truy cập
          </button>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true)
              try { await store.signOut(); setError("") }
              catch (error) { setError(error instanceof Error ? error.message : "Không đăng xuất được.") }
              finally { setBusy(false) }
            }}
            className="rounded border border-[#d6ddd3] bg-white px-3 py-1.5 text-[#53685f] hover:bg-[#f7f6ef] cursor-pointer"
          >
            Đăng xuất
          </button>
          <Link
            className="ml-auto text-[#184c40] hover:underline"
            href="/"
          >
            ← Về trang khách tham quan
          </Link>
        </div>
      </div>
    </div>
  )
}
