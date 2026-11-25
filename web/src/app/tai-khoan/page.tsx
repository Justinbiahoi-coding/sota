"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, LogOut, QrCode, ShieldCheck, UserCheck, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { api } from "@/lib/api/client"
import { formatVndOrPrice } from "@/app/cua-hang/page"
import { cn } from "@/lib/utils"
import { SpotlightCard } from "@/components/reactbits/spotlight-card"
import { BlurText } from "@/components/reactbits/blur-text"
import { MuseumButton } from "@/components/reactbits/museum-button"
import { BrassPlacardPin } from "@/components/renaissance/deco-assets"
import { DecryptedText } from "@/components/reactbits/decrypted-text"

type Ticket = {
  code: string
  invoice?: string
  museum: string
  date: string
  time: string
  adults: number
  children: number
  total: number
  status?: string
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

// Minimal SVG QR placeholder
function QrPlaceholder({ value }: { value: string }) {
  const size = 11
  const cells: boolean[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      const inFinder =
        (r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3)
      if (inFinder) return true
      const hash = (value.charCodeAt((r * size + c) % value.length) + r * 7 + c * 13) % 2
      return hash === 0
    }),
  )
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-28" xmlns="http://www.w3.org/2000/svg">
      {cells.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="currentColor" />
          ) : null,
        ),
      )}
    </svg>
  )
}

export default function TaiKhoanPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"tickets" | "orders" | "profile">("tickets")
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
          const localName = localStorage.getItem("sota_user_name")
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
        const localTickets: Ticket[] = JSON.parse(localStorage.getItem("sota_tickets") ?? "[]")
        try {
          const ticketRes = await api.ticketOrders.list()
          const serverTickets: Ticket[] = (ticketRes?.data ?? []).map((t) => ({
            code: t.entry_code || t.id.slice(0, 8).toUpperCase(),
            invoice: t.invoice?.invoice_number,
            museum: museumMap.get(t.museum_id) ?? "Bảo tàng Smithsonian",
            date: t.visit_date,
            time: t.time_slot,
            adults: t.items?.reduce((s, it) => s + it.quantity, 0) || 1,
            children: 0,
            total: parseFloat(t.total_amount || "0"),
            status: t.status,
          }))
          const merged = [
            ...serverTickets,
            ...localTickets.filter((lt) => !serverTickets.some((st) => st.code === lt.code)),
          ]
          if (active) setTickets(merged)
        } catch {
          if (active) setTickets(localTickets)
        }

        // 4. Lấy danh sách đơn hàng lưu niệm từ Backend API
        const localOrders: Order[] = JSON.parse(localStorage.getItem("sota_orders") ?? "[]")
        try {
          const shopRes = await api.shopOrders.list()
          const serverOrders: Order[] = await Promise.all(
            (shopRes?.data ?? []).map(async (o) => {
              const orderItems = await Promise.all(
                (o.items ?? []).map(async (it) => {
                  let img = "/museum-elephant.webp"
                  try {
                    const mediaRes = await api.media("souvenir", it.product_id)
                    if (mediaRes?.data?.[0]?.storage_path) {
                      const m = mediaRes.data[0]
                      img = m.storage_path.startsWith("http")
                        ? m.storage_path
                        : `${process.env.NEXT_PUBLIC_SUPABASE_URL || "https://onauuvsjpnmjxqxeiuvy.supabase.co"}/storage/v1/object/public/${m.storage_bucket}/${m.storage_path}`
                    }
                  } catch {}
                  return {
                    productId: it.product_id,
                    name: it.product_name,
                    qty: it.quantity,
                    price: parseFloat(it.unit_price || "0"),
                    image: img,
                  }
                }),
              )
              return {
                id: o.id,
                invoice: o.invoice?.invoice_number,
                status: o.status,
                items: orderItems,
                total: parseFloat(o.total_amount || "0"),
                name: o.shipping_name,
                address: o.shipping_address,
                createdAt: o.created_at,
              }
            }),
          )
          const mergedOrders = [
            ...serverOrders,
            ...localOrders.filter((lo) => !serverOrders.some((so) => so.id === lo.id)),
          ]
          if (active) setOrders(mergedOrders)
        } catch {
          if (active) setOrders(localOrders)
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
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {}
    localStorage.removeItem("sota_user_name")
    router.push("/dang-nhap")
    router.refresh()
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

  if (authChecked && !isLoggedIn) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-32 pb-20 text-center">
        <div className="rounded-2xl border border-[#d4af37]/30 bg-[#08162b]/90 p-10 shadow-2xl backdrop-blur-md">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#fbe396]">
            <UserCheck className="size-6" />
          </div>
          <h1 className="mt-5 font-heading text-3xl font-light text-white">Hồ sơ Hội viên Sota</h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-300">
            Đăng nhập tài khoản để quản lý vé tham quan kèm mã QR, theo dõi đơn hàng lưu niệm và cập nhật hồ sơ cá nhân.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <MuseumButton href="/dang-nhap" variant="primary" size="md" icon>
              Đăng nhập
            </MuseumButton>
            <MuseumButton href="/dang-ky" variant="outline" size="md">
              Đăng ký tài khoản
            </MuseumButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-5 pt-28 pb-16 md:px-8">
      {/* Header cleanly below fixed 72px navbar */}
      <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/45 bg-[#08162b]/90 px-4 py-1.5 shadow-md backdrop-blur-md">
            <BrassPlacardPin />
            <span className="placard text-[0.68rem] tracking-wider text-[#fbe396]">
              <DecryptedText
                text={`Hồ sơ Hội viên · ${roleLabel}`}
                speed={28}
                maxIterations={12}
                animateOn="view"
              />
            </span>
          </div>
          <h1 className="mt-4 font-heading text-4xl font-light text-foreground md:text-5xl">
            <BlurText text={userName} delay={0.04} />
          </h1>
          {(userEmail || userPhone) && (
            <p className="mt-2 text-sm text-stone-400">
              {userEmail}
              {userPhone ? ` · ${userPhone}` : ""}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#d4af37] bg-[#d4af37]/15 px-4 py-2 text-xs font-semibold text-[#fbe396] shadow-sm transition-colors hover:bg-[#d4af37] hover:text-[#08162b]"
            >
              <ShieldCheck className="size-4" /> Bảng điều khiển Quản trị
            </Link>
          )}
          <MuseumButton
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="border border-white/10 text-stone-300 hover:border-rose-500/40 hover:text-rose-300"
          >
            <LogOut className="size-4" /> Đăng xuất
          </MuseumButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex flex-wrap gap-3 border-b border-border pb-4">
        {(["tickets", "orders", "profile"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "placard rounded-full px-5 py-2 text-xs transition-all duration-300 font-medium cursor-pointer",
              tab === t
                ? "border border-[#d4af37] bg-[#d4af37] text-[#08162b] font-bold shadow-sm"
                : "border border-border bg-card text-stone-300 hover:border-[#d4af37]/50 hover:text-white",
            )}
          >
            {t === "tickets"
              ? `Vé của tôi (${tickets.length})`
              : t === "orders"
                ? `Đơn hàng (${orders.length})`
                : "Hồ sơ & Bảo mật"}
          </button>
        ))}
      </div>

      {/* Tickets tab */}
      {tab === "tickets" && (
        <div>
          {tickets.length === 0 ? (
            <div className="rounded-xl border border-border bg-card/60 py-20 text-center text-muted-foreground shadow-sm">
              <p className="font-heading text-xl text-stone-200">Bạn chưa có vé tham quan nào.</p>
              <div className="mt-5">
                <MuseumButton href="/dat-ve" variant="primary" size="md" icon>
                  Đặt vé ngay
                </MuseumButton>
              </div>
            </div>
          ) : (
            <ul className="space-y-4">
              {tickets.map((tk) => (
                <li key={tk.code}>
                  <SpotlightCard className="flex items-center justify-between gap-4 p-5 bg-card border-border shadow-sm hover:shadow-md transition-all">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="font-heading text-xl text-foreground font-light">{tk.museum}</p>
                        {tk.status && (
                          <span className="rounded-full border border-emerald-500/35 bg-emerald-950/60 px-2.5 py-0.5 text-[0.65rem] font-medium text-emerald-300">
                            {TICKET_STATUS_LABEL[tk.status] ?? tk.status}
                          </span>
                        )}
                      </div>
                      <p className="placard mt-1.5 text-xs text-stone-400">
                        {tk.date} · {tk.time}
                      </p>
                      <p className="mt-1.5 text-sm text-stone-300">
                        {tk.adults} khách{tk.children > 0 ? ` (gồm ${tk.children} trẻ em)` : ""} ·{" "}
                        <span className="text-[#fbe396] font-medium">{formatVndOrPrice(tk.total)}</span>
                      </p>
                      <p className="mt-1.5 font-mono text-xs tracking-widest text-stone-400 font-semibold">
                        {tk.code}{" "}
                        {tk.invoice && (
                          <span className="text-[0.68rem] font-normal text-emerald-400">· {tk.invoice}</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setQrTicket(tk)}
                      className="flex shrink-0 flex-col items-center gap-1.5 rounded-lg border border-border bg-background/80 p-3 text-muted-foreground hover:border-[#d4af37] hover:text-[#fbe396] transition-all duration-300 active:scale-95 shadow-sm cursor-pointer"
                      aria-label="Mở mã QR"
                    >
                      <QrCode className="size-6 text-foreground" />
                      <span className="placard text-[0.6rem] font-bold">MÃ QR</span>
                    </button>
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
            <div className="rounded-xl border border-border bg-card/60 py-20 text-center text-muted-foreground shadow-sm">
              <p className="font-heading text-xl text-stone-200">Bạn chưa có đơn hàng lưu niệm nào.</p>
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
                  <SpotlightCard className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-mono text-sm tracking-widest text-[#fbe396] font-semibold">
                            {ord.invoice || ord.id}
                          </p>
                          {ord.status && (
                            <span className="rounded-full border border-emerald-500/35 bg-emerald-950/60 px-2.5 py-0.5 text-[0.65rem] font-medium text-emerald-300">
                              {ORDER_STATUS_LABEL[ord.status] ?? ord.status}
                            </span>
                          )}
                        </div>
                        <p className="placard mt-1 text-xs text-stone-400">
                          {new Date(ord.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <p className="font-heading text-xl font-light text-foreground">
                        {formatVndOrPrice(ord.total)}
                      </p>
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-4">
                      {ord.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-foreground">
                          <div className="relative size-12 overflow-hidden rounded-md border border-border bg-muted shadow-sm">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <span>
                            {item.name} <span className="text-stone-400 font-mono">× {item.qty}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 pt-3 border-t border-border text-xs text-stone-400">
                      Người nhận: <span className="text-foreground">{ord.name}</span> · Địa chỉ:{" "}
                      <span className="text-foreground">{ord.address}</span>
                    </p>
                  </SpotlightCard>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Profile & Security tab (UC09 & UC25) */}
      {tab === "profile" && (
        <div className="grid gap-6 md:grid-cols-2">
          <SpotlightCard className="p-6 bg-card border-border shadow-sm">
            <h2 className="font-heading text-2xl font-light text-white">Thông tin cá nhân</h2>
            <p className="mt-1 text-xs text-stone-400">Cập nhật tên hiển thị và số điện thoại liên hệ.</p>
            <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
              <label className="block text-xs text-stone-300">
                <span className="placard block mb-1.5">Họ và tên hiển thị</span>
                <input
                  type="text"
                  required
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-background px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#d4af37]"
                />
              </label>
              <label className="block text-xs text-stone-300">
                <span className="placard block mb-1.5">Số điện thoại</span>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="0901 234 567"
                  className="w-full rounded-lg border border-white/15 bg-background px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#d4af37]"
                />
              </label>
              {profileMsg && <p className="text-xs text-[#fbe396]">{profileMsg}</p>}
              <button
                type="submit"
                disabled={profileSaving}
                className="rounded-full bg-[#d4af37] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#08162b] hover:bg-[#e5c158] disabled:opacity-60 cursor-pointer"
              >
                {profileSaving ? "Đang lưu…" : "Lưu thay đổi"}
              </button>
            </form>
          </SpotlightCard>

          <SpotlightCard className="p-6 bg-card border-border shadow-sm">
            <div className="flex items-center gap-2">
              <KeyRound className="size-5 text-[#d4af37]" />
              <h2 className="font-heading text-2xl font-light text-white">Đổi mật khẩu</h2>
            </div>
            <p className="mt-1 text-xs text-stone-400">Thiết lập mật khẩu mới có độ dài tối thiểu 8 ký tự.</p>
            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <label className="block text-xs text-stone-300">
                <span className="placard block mb-1.5">Mật khẩu mới</span>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-background px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#d4af37]"
                />
              </label>
              <label className="block text-xs text-stone-300">
                <span className="placard block mb-1.5">Nhập lại mật khẩu mới</span>
                <input
                  type="password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/15 bg-background px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#d4af37]"
                />
              </label>
              {pwMsg && <p className="text-xs text-[#fbe396]">{pwMsg}</p>}
              <button
                type="submit"
                disabled={pwSaving}
                className="rounded-full border border-[#d4af37] bg-transparent px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#fbe396] hover:bg-[#d4af37] hover:text-[#08162b] disabled:opacity-60 cursor-pointer transition-colors"
              >
                {pwSaving ? "Đang cập nhật…" : "Cập nhật mật khẩu"}
              </button>
            </form>
          </SpotlightCard>
        </div>
      )}

      {/* QR modal */}
      {qrTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
          onClick={() => setQrTicket(null)}
        >
          <div
            className="relative rounded-xl border border-border bg-white p-8 text-center text-black shadow-2xl max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute right-4 top-4 text-black/60 hover:text-black p-1 transition-colors cursor-pointer"
              onClick={() => setQrTicket(null)}
              aria-label="Đóng"
            >
              <X className="size-5" />
            </button>
            <p className="font-heading text-2xl font-light">{qrTicket.museum}</p>
            <p className="placard mt-1 text-black/60 text-xs">
              {qrTicket.date} · {qrTicket.time}
            </p>
            <div className="mx-auto mt-6 inline-flex p-3 rounded-lg border border-stone-200 bg-stone-50">
              <QrPlaceholder value={qrTicket.code} />
            </div>
            <p className="mt-4 font-mono font-bold tracking-widest text-xl text-stone-900">{qrTicket.code}</p>
            <p className="placard mt-1.5 text-black/60 text-xs">Xuất trình tại cửa soát vé tự động</p>
          </div>
        </div>
      )}
    </div>
  )
}
