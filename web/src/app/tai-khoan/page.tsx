"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, QrCode, X } from "lucide-react"
import { formatPrice } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { SpotlightCard } from "@/components/reactbits/spotlight-card"
import { BlurText } from "@/components/reactbits/blur-text"
import { ShinyText } from "@/components/reactbits/shiny-text"
import { MuseumButton } from "@/components/reactbits/museum-button"
import { BrassPlacardPin } from "@/components/renaissance/deco-assets"
import { DecryptedText } from "@/components/reactbits/decrypted-text"

type Ticket = {
  code: string
  museum: string
  date: string
  time: string
  adults: number
  children: number
  total: number
}

type Order = {
  id: string
  items: { name: string; qty: number; price: number; image: string }[]
  total: number
  name: string
  address: string
  createdAt: string
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
  const [tab, setTab] = useState<"tickets" | "orders">("tickets")
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [qrTicket, setQrTicket] = useState<Ticket | null>(null)
  const [userName, setUserName] = useState("Khách Sota")

  useEffect(() => {
    const tks = JSON.parse(localStorage.getItem("sota_tickets") ?? "[]")
    const ords = JSON.parse(localStorage.getItem("sota_orders") ?? "[]")
    const saved = localStorage.getItem("sota_user_name")
    const demo = saved || "Nguyễn Lê Anh Tuấn"
    if (!saved) localStorage.setItem("sota_user_name", demo)

    queueMicrotask(() => {
      setTickets(tks)
      setOrders(ords)
      setUserName(demo)
    })
  }, [])

  function handleLogout() {
    localStorage.removeItem("sota_user_name")
    router.push("/dang-nhap")
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:px-8">
      {/* Header */}
      <div className="mb-10 flex items-start justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-white/95 px-4 py-1.5 shadow-sm">
            <BrassPlacardPin />
            <span className="placard text-[0.68rem] tracking-wider text-[#92400e]">
              <DecryptedText
                text="Hồ sơ Hội viên · Sota Patron"
                speed={28}
                maxIterations={12}
                animateOn="view"
              />
            </span>
          </div>
          <h1 className="mt-4 font-heading text-4xl font-light text-foreground">
            <BlurText text={userName} delay={0.04} />
          </h1>
        </div>
        <MuseumButton
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4" /> Đăng xuất
        </MuseumButton>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-3 border-b border-border pb-3">
        {(["tickets", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "placard rounded-full px-5 py-2 text-xs transition-all duration-300 font-medium",
              tab === t
                ? "border border-foreground bg-foreground text-background shadow-sm"
                : "border border-border bg-card text-muted-foreground hover:border-foreground/50 hover:text-foreground",
            )}
          >
            {t === "tickets" ? `Vé của tôi (${tickets.length})` : `Đơn hàng (${orders.length})`}
          </button>
        ))}
      </div>

      {/* Tickets tab */}
      {tab === "tickets" && (
        <div>
          {tickets.length === 0 ? (
            <div className="rounded-lg border border-border bg-card/60 py-20 text-center text-muted-foreground shadow-sm">
              <p className="font-heading text-xl">Bạn chưa có vé tham quan nào.</p>
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
                  <SpotlightCard className="flex items-center justify-between p-5 bg-card border-border shadow-sm hover:shadow-md transition-all">
                    <div>
                      <p className="font-heading text-xl text-foreground font-light">{tk.museum}</p>
                      <p className="placard mt-1 text-xs text-muted-foreground">
                        {tk.date} · {tk.time}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tk.adults} người lớn{tk.children > 0 ? ` · ${tk.children} trẻ em` : ""} ·{" "}
                        <span className="text-museum font-medium">{formatPrice(tk.total)}</span>
                      </p>
                      <p className="mt-1.5 font-mono text-xs tracking-widest text-muted-foreground font-semibold">{tk.code}</p>
                    </div>
                    <button
                      onClick={() => setQrTicket(tk)}
                      className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-background/80 p-3 text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-300 active:scale-95 shadow-sm"
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
            <div className="rounded-lg border border-border bg-card/60 py-20 text-center text-muted-foreground shadow-sm">
              <p className="font-heading text-xl">Bạn chưa có đơn hàng lưu niệm nào.</p>
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
                    <div className="flex items-start justify-between border-b border-border pb-4">
                      <div>
                        <p className="font-mono text-sm tracking-widest text-museum font-semibold">{ord.id}</p>
                        <p className="placard mt-1 text-xs text-muted-foreground">
                          {new Date(ord.createdAt).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <p className="font-heading text-xl font-light text-foreground">{formatPrice(ord.total)}</p>
                    </div>
                    <ul className="mt-4 flex flex-wrap gap-4">
                      {ord.items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3 text-sm text-foreground">
                          <div className="relative size-12 overflow-hidden rounded-md border border-border bg-muted shadow-sm">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <span>
                            {item.name} <span className="text-muted-foreground font-mono">× {item.qty}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                      Địa chỉ nhận hàng: <span className="text-foreground">{ord.address}</span>
                    </p>
                  </SpotlightCard>
                </li>
              ))}
            </ul>
          )}
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
              className="absolute right-4 top-4 text-black/60 hover:text-black p-1 transition-colors"
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
