"use client"

import Link from "next/link"
import { Suspense, useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { KeyRound, LogOut, ReceiptText, TicketCheck, UserRound, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { api } from "@/lib/api/client"
import { formatVndOrPrice } from "@/app/cua-hang/page"
import { cn } from "@/lib/utils"
import { SpotlightCard } from "@/components/reactbits/spotlight-card"
import { MuseumButton } from "@/components/reactbits/museum-button"
import { GalleryMasthead } from "@/components/site/gallery-masthead"
import { EntryQr } from "@/components/site/entry-qr"
import { formatPrice } from "@/lib/mock-data"

type Ticket = {
  id?: string
  code: string | null
  invoice?: string
  museum: string
  date: string
  time: string
  adults?: number
  children: number
  total: number
  status?: string
  demo?: boolean
}

type Order = {
  id: string
  invoice?: string
  status?: string
  items: { productId?: string; name: string; qty: number; price: number; image: string }[]
  total: number
  name: string
  address: string
  createdAt: string
  demo?: boolean
}

const DB_MUSEUM_VI_NAMES: Record<string, string> = {
  "national-museum-of-natural-history": "Bảo tàng Lịch sử Tự nhiên",
  "national-air-and-space-museum": "Bảo tàng Hàng không và Vũ trụ",
  "national-museum-of-american-history": "Bảo tàng Lịch sử Hoa Kỳ",
  "national-portrait-gallery": "Phòng tranh Chân dung Quốc gia",
  "hirshhorn-museum-and-sculpture-garden": "Bảo tàng và Vườn điêu khắc Hirshhorn",
  "national-museum-of-asian-art": "Bảo tàng Nghệ thuật Châu Á",
}

const TICKET_STATUS_LABEL: Record<string, string> = {
  confirmed: "Đã xác nhận",
  used: "Đã soát vé",
  pending: "Chờ thanh toán",
  cancelled: "Đã hủy",
}

const ORDER_STATUS_LABEL: Record<string, string> = {
  confirmed: "Đã xác nhận",
  shipped: "Đang giao hàng",
  completed: "Hoàn tất",
  pending: "Chờ thanh toán",
  cancelled: "Đã hủy",
}

export default function TaiKhoanPage() {
  return <Suspense fallback={<AccountLoading />}><AccountContent /></Suspense>
}

function AccountLoading() {
  return <div className="gallery-page"><GalleryMasthead label="Tài khoản Sota" title="Hồ sơ của bạn" /><p role="status" className="gallery-wrap py-12">Đang tải hồ sơ…</p></div>
}

function AccountContent() {
  const router = useRouter()
  const params = useSearchParams()
  const selectedTab = params.get("tab")
  const tab = selectedTab === "orders" || selectedTab === "profile" ? selectedTab : "tickets"
  const ticketDialog = useRef<HTMLDialogElement>(null)
  const [orderDetails, setOrderDetails] = useState<Record<string, "loading" | "loaded" | "error">>({})
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [qrTicket, setQrTicket] = useState<Ticket | null>(null)

  const [authChecked, setAuthChecked] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("Khách Sota")
  const [userEmail, setUserEmail] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [roleLabel, setRoleLabel] = useState("Hội viên Sota")
  const [isAdmin, setIsAdmin] = useState(false)
  const [logoutError, setLogoutError] = useState("")

  // Profile & password edit state (UC09, UC25)
  const [displayNameInput, setDisplayNameInput] = useState("")
  const [phoneInput, setPhoneInput] = useState("")
  const [profileMsg, setProfileMsg] = useState("")
  const [profileSaving, setProfileSaving] = useState(false)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [pwMsg, setPwMsg] = useState("")
  const [pwSaving, setPwSaving] = useState(false)

  useEffect(() => {
    let active = true

    async function loadBackendData() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!active) return

        if (!user) {
          const localName = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? null
            : localStorage.getItem("sota_user_name")
          if (localName) {
            setIsLoggedIn(true)
            setUserName(localName)
            setDisplayNameInput(localName)
            setTickets(JSON.parse(localStorage.getItem("sota_tickets") ?? "[]"))
            setOrders(JSON.parse(localStorage.getItem("sota_orders") ?? "[]"))
          } else {
            setIsLoggedIn(false)
          }
          setAuthChecked(true)
          return
        }

        setIsLoggedIn(true)
        setUserEmail(user.email ?? "")
        const fallbackName = user.user_metadata?.display_name || user.email?.split("@")[0] || "Hội viên Sota"
        setUserName(fallbackName)
        setDisplayNameInput(fallbackName)
        localStorage.setItem("sota_user_name", fallbackName)

        // 1. Lấy hồ sơ & vai trò từ Express /me
        try {
          const meRes = await api.me.get()
          if (active && meRes?.data) {
            const name = meRes.data.display_name || fallbackName
            setUserName(name)
            setDisplayNameInput(name)
            setUserPhone(meRes.data.phone ?? "")
            setPhoneInput(meRes.data.phone ?? "")
            localStorage.setItem("sota_user_name", name)

            if (meRes.data.roles?.includes("super_admin")) {
              setIsAdmin(true)
              setRoleLabel("Quản trị hệ thống")
            } else if (meRes.data.roles?.includes("admin_user")) {
              setIsAdmin(true)
              setRoleLabel("Quản trị viên bảo tàng")
            } else {
              setRoleLabel("Hội viên Sota")
            }
          }
        } catch {}

        // 2. Lấy danh sách bảo tàng để ánh xạ tên
        const museumMap = new Map<string, string>()
        try {
          const mRes = await api.museums.list({ limit: 20 })
          for (const m of mRes?.data ?? []) {
            museumMap.set(m.id, DB_MUSEUM_VI_NAMES[m.slug] ?? m.name)
          }
        } catch {}

        // 3. Lấy danh sách vé đã đặt từ Backend API
        try {
          const ticketRes = await api.ticketOrders.list()
          const serverTickets: Ticket[] = (ticketRes?.data ?? []).map((t) => ({
            id: t.id,
            code: t.entry_code,
            invoice: t.invoice?.invoice_number,
            museum: museumMap.get(t.museum_id) ?? "Bảo tàng Smithsonian",
            date: t.visit_date,
            time: t.time_slot,
            adults: t.items?.reduce((s, it) => s + it.quantity, 0),
            children: 0,
            total: parseFloat(t.total_amount || "0"),
            status: t.status,
          }))
          if (active) setTickets(serverTickets)
        } catch {
          if (active) setTickets([])
        }

        try {
          const shopRes = await api.shopOrders.list()
          const serverOrders: Order[] = shopRes.data.map((order) => ({
            id: order.id,
            status: order.status,
            items: [],
            total: Number(order.total_amount),
            name: order.shipping_name,
            address: order.shipping_address,
            createdAt: order.created_at,
          }))
          if (active) setOrders(serverOrders)
        } catch {
          if (active) setOrders([])
        }
      } catch {
        // Fallback offline
      } finally {
        if (active) setAuthChecked(true)
      }
    }

    loadBackendData()
    return () => {
      active = false
    }
  }, [])

  async function handleLogout() {
    setLogoutError("")
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        const { error } = await createClient().auth.signOut()
        if (error) throw error
      }
      localStorage.removeItem("sota_user_name")
      router.push("/dang-nhap")
      router.refresh()
    } catch {
      setLogoutError("Chưa thể đăng xuất. Vui lòng thử lại.")
    }
  }

  async function loadOrderDetails(order: Order) {
    if (order.demo || !/^[0-9a-f-]{36}$/i.test(order.id) || ["loading", "loaded"].includes(orderDetails[order.id])) return
    setOrderDetails((current) => ({ ...current, [order.id]: "loading" }))
    try {
      const { data } = await api.shopOrders.get(order.id)
      setOrders((current) => current.map((item) => item.id === order.id ? {
        ...item,
        invoice: data.invoice?.invoice_number,
        items: data.items.map((line) => ({
          productId: line.product_id,
          name: line.product_name,
          qty: line.quantity,
          price: Number(line.unit_price),
          image: "",
        })),
      } : item))
      setOrderDetails((current) => ({ ...current, [order.id]: "loaded" }))
    } catch {
      setOrderDetails((current) => ({ ...current, [order.id]: "error" }))
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg("")
    try {
      const res = await api.me.update({
        display_name: displayNameInput.trim(),
        phone: phoneInput.trim() || undefined,
      })
      const updatedName = res?.data?.display_name || displayNameInput.trim()
      setUserName(updatedName)
      setUserPhone(res?.data?.phone ?? phoneInput.trim())
      localStorage.setItem("sota_user_name", updatedName)
      setProfileMsg("Đã cập nhật thông tin hồ sơ.")
    } catch (err) {
      setProfileMsg(err instanceof Error ? err.message : "Không cập nhật được hồ sơ.")
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 8) {
      setPwMsg("Mật khẩu mới phải có ít nhất 8 ký tự.")
      return
    }
    if (newPassword !== confirmPassword) {
      setPwMsg("Hai mật khẩu chưa khớp nhau.")
      return
    }
    setPwSaving(true)
    setPwMsg("")
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setNewPassword("")
      setConfirmPassword("")
      setPwMsg("Đã đổi mật khẩu thành công.")
    } catch (err) {
      setPwMsg(err instanceof Error ? err.message : "Không thể đổi mật khẩu.")
    } finally {
      setPwSaving(false)
    }
  }

  if (!authChecked) return <AccountLoading />

  if (!isLoggedIn) {
    return (
      <div className="gallery-page">
        <GalleryMasthead label="Tài khoản Sota" title={<>Hồ sơ <em>của bạn.</em></>} image="/museum-elephant.webp" />
        <div className="gallery-wrap py-12">
          <div className="gallery-sheet mx-auto max-w-2xl rounded-md p-8 text-center sm:p-12">
            <h2 className="font-heading text-4xl">Vé, đơn hàng và hồ sơ</h2>
            <p className="mt-4 text-stone-700">Đăng nhập để xem vé tham quan, theo dõi đơn lưu niệm và cập nhật thông tin cá nhân.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/dang-nhap" className="gallery-action">Đăng nhập</Link>
              <Link href="/dang-ky" className="gallery-action gallery-action-muted">Tạo tài khoản</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="gallery-page">
      <GalleryMasthead label={roleLabel} title={userName}>
        {(userEmail || userPhone) && <p className="gallery-lead break-words">{[userEmail, userPhone].filter(Boolean).join(" · ")}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {isAdmin && <MuseumButton href="/admin" variant="outline">Bảng điều khiển quản trị</MuseumButton>}
          <MuseumButton onClick={handleLogout} variant="outline"><LogOut className="size-4" /> Đăng xuất</MuseumButton>
        </div>
        {logoutError && <p role="alert" className="mt-3 text-sm text-rose-200">{logoutError}</p>}
      </GalleryMasthead>
      <div className="gallery-wrap grid items-start gap-7 py-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 lg:py-14">
        <nav aria-label="Tài khoản" className="gallery-sheet flex flex-wrap gap-2 rounded-md p-2 lg:sticky lg:top-24 lg:flex-col">
          {([
            { key: "tickets", label: "Vé của tôi", count: tickets.length, icon: TicketCheck },
            { key: "orders", label: "Đơn lưu niệm", count: orders.length, icon: ReceiptText },
            { key: "profile", label: "Hồ sơ & bảo mật", icon: UserRound },
          ] as const).map(({ key, label, icon: Icon, ...meta }) => (
            <Link
              key={key}
              href={"/tai-khoan?tab=" + key}
              scroll={false}
              aria-current={tab === key ? "page" : undefined}
              className={cn("flex min-h-11 items-center gap-2.5 rounded-sm px-3 text-sm font-semibold transition-colors",
                tab === key ? "bg-[#08162b] text-[#f7f4ec]" : "hover:bg-[#f7f4ec]")}
            >
              <Icon className="size-4 shrink-0" /> {label}
              {"count" in meta && <span className="ml-auto font-mono text-xs tabular-nums">{meta.count}</span>}
            </Link>
          ))}
        </nav>
        <section aria-labelledby="account-section">
          <h2 id="account-section" className="mb-5 font-heading text-4xl">
            {tab === "tickets" ? "Vé tham quan" : tab === "orders" ? "Đơn lưu niệm" : "Hồ sơ & bảo mật"}
          </h2>

      {/* Tickets tab */}
      {tab === "tickets" && (
        <div>
          {tickets.length === 0 ? (
            <div className="gallery-sheet rounded-md p-8 text-center">
              <p className="font-heading text-2xl text-[#08162b]">Bạn chưa có vé tham quan nào.</p>
              <div className="mt-5">
                <MuseumButton href="/dat-ve" variant="primary" size="md" icon>
                  Đặt vé ngay
                </MuseumButton>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {tickets.map((tk) => (
                <li key={tk.id ?? tk.code}>
                  <SpotlightCard className="flex flex-wrap items-center justify-between gap-4 gallery-sheet p-5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-heading text-xl text-[#08162b] font-light">{tk.museum}</p>
                        {tk.status && (
                          <span className="rounded-full border border-emerald-500/35 bg-emerald-950/60 px-2.5 py-0.5 text-[0.65rem] font-medium text-emerald-300">
                            {TICKET_STATUS_LABEL[tk.status] ?? tk.status}
                          </span>
                        )}
                      </div>
                      <p className="placard mt-1.5 text-xs text-stone-700">
                        {tk.date} · {tk.time}
                      </p>
                      <p className="mt-1.5 text-sm text-stone-700">
                        {tk.adults ? `${tk.adults} khách${tk.children ? ` (gồm ${tk.children} trẻ em)` : ""} · ` : ""}
                        <span className="text-[#77531c] font-medium">
                          {tk.demo ? formatPrice(tk.total) : tk.id ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(tk.total) : formatVndOrPrice(tk.total)}
                        </span>
                      </p>
                      <p className="mt-1.5 font-mono text-xs tracking-widest text-stone-700 font-semibold">
                        {tk.code}{" "}
                        {tk.invoice && (
                          <span className="text-[0.68rem] font-normal text-emerald-400">· {tk.invoice}</span>
                        )}
                      </p>
                    </div>
                    {tk.code && <button
                      onClick={() => { setQrTicket(tk); ticketDialog.current?.showModal() }}
                      className="gallery-action gallery-action-muted"
                      aria-haspopup="dialog"
                    >
                      <TicketCheck className="size-5 text-[#08162b]" />
                      Xem mã QR
                    </button>}
                  </SpotlightCard>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Orders tab */}
      {tab === "orders" && (
        <div>
          {orders.length === 0 ? (
            <div className="gallery-sheet rounded-md p-8 text-center">
              <p className="font-heading text-2xl text-[#08162b]">Bạn chưa có đơn hàng lưu niệm nào.</p>
              <div className="mt-5">
                <MuseumButton href="/cua-hang" variant="primary" size="md" icon>
                  Ghé cửa hàng
                </MuseumButton>
              </div>
            </div>
          ) : (
            <ul className="space-y-5">
              {orders.map((ord) => (
                <li key={ord.id}>
                  <details className="gallery-sheet group rounded-md" onToggle={(event) => {
                    if (event.currentTarget.open) void loadOrderDetails(ord)
                  }}>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
                      <div className="min-w-0">
                        <p className="break-all font-mono text-sm font-semibold text-[#77531c]">{ord.invoice || ord.id}</p>
                        <p className="mt-1 text-sm text-stone-700">{new Date(ord.createdAt).toLocaleDateString("vi-VN")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{ord.demo ? formatPrice(ord.total) : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(ord.total)}</p>
                        <p className="mt-1 text-sm text-stone-700">{ord.demo ? "Đơn thử nghiệm" : ORDER_STATUS_LABEL[ord.status ?? ""] ?? ord.status}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#77531c] group-open:hidden">Xem chi tiết</span>
                    </summary>
                    <div className="border-t border-[#e1d8c7] p-5">
                      {orderDetails[ord.id] === "loading" && <p role="status">Đang tải vật phẩm…</p>}
                      {orderDetails[ord.id] === "error" && <button type="button" onClick={() => loadOrderDetails(ord)} className="gallery-action gallery-action-muted">Tải lại chi tiết đơn</button>}
                      <ul className="divide-y divide-[#e1d8c7]">
                        {ord.items.map((item, idx) => (
                          <li key={item.productId ?? idx} className="flex justify-between gap-3 py-2 text-sm">
                            <span>{item.name}</span><span className="shrink-0 font-mono">× {item.qty}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm text-stone-700">Người nhận: {ord.name} · {ord.address}</p>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Profile & Security tab (UC09 & UC25) */}
      {tab === "profile" && (
        <div className="grid gap-6 md:grid-cols-2">
          <SpotlightCard className="gallery-sheet p-6">
            <h2 className="font-heading text-2xl text-[#08162b]">Thông tin cá nhân</h2>
            <p className="mt-1 text-xs text-stone-700">Cập nhật tên hiển thị và số điện thoại liên hệ.</p>
            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <label className="block text-xs text-stone-700">
                <span className="placard block mb-1.5">Họ và tên hiển thị</span>
                <input
                  type="text"
                  required
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="gallery-control w-full px-3.5 py-2.5 text-base"
                />
              </label>
              <label className="block text-xs text-stone-700">
                <span className="placard block mb-1.5">Số điện thoại</span>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="0901 234 567"
                  className="gallery-control w-full px-3.5 py-2.5 text-base"
                />
              </label>
              {profileMsg && <p role="status" className="text-sm text-[#77531c]">{profileMsg}</p>}
              <button
                type="submit"
                disabled={profileSaving}
                className="gallery-action disabled:opacity-60"
              >
                {profileSaving ? "Đang lưu…" : "Lưu thay đổi"}
              </button>
            </form>
          </SpotlightCard>

          <SpotlightCard className="gallery-sheet p-6">
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-[#d4af37]" />
              <h2 className="font-heading text-2xl text-[#08162b]">Đổi mật khẩu</h2>
            </div>
            <p className="mt-1 text-xs text-stone-700">Thiết lập mật khẩu mới có độ dài tối thiểu 8 ký tự.</p>
            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <label className="block text-xs text-stone-700">
                <span className="placard block mb-1.5">Mật khẩu mới</span>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="gallery-control w-full px-3.5 py-2.5 text-base"
                />
              </label>
              <label className="block text-xs text-stone-700">
                <span className="placard block mb-1.5">Nhập lại mật khẩu mới</span>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="gallery-control w-full px-3.5 py-2.5 text-base"
                />
              </label>
              {pwMsg && <p role="status" className="text-sm text-[#77531c]">{pwMsg}</p>}
              <button
                type="submit"
                disabled={pwSaving}
                className="gallery-action disabled:opacity-60"
              >
                {pwSaving ? "Đang cập nhật…" : "Cập nhật mật khẩu"}
              </button>
            </form>
          </SpotlightCard>
        </div>
      )}

        </section>
      </div>
      <dialog ref={ticketDialog} aria-label="Mã vé tham quan" onClose={() => setQrTicket(null)}
        className="gallery-sheet fixed inset-0 m-auto w-[min(90vw,28rem)] rounded-md p-7 text-center backdrop:bg-[#08162b]/70">
        {qrTicket?.code && <div>
          <button type="button" className="gallery-icon-button ml-auto flex" onClick={() => ticketDialog.current?.close()} aria-label="Đóng mã vé"><X className="size-5" /></button>
          <h2 className="mt-4 font-heading text-3xl">{qrTicket.museum}</h2>
          <p className="mt-1 text-sm text-stone-700">{qrTicket.date} · {qrTicket.time}</p>
          <div className="mx-auto mt-4 flex w-fit justify-center border border-[#e1d8c7]"><EntryQr value={qrTicket.code} /></div>
          <p className="mt-4 text-sm text-stone-700">Mã vào cổng</p>
          <p className="mt-2 break-all border border-[#e1d8c7] bg-[#f7f4ec] p-4 font-mono text-2xl font-semibold text-[#77531c]">{qrTicket.code}</p>
        </div>}
      </dialog>
    </div>
  )
}
