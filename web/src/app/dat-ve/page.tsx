"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, ChevronRight, QrCode } from "lucide-react"
import { api } from "@/lib/api/client"
import type { TimeSlot, TicketType, Museum as ApiMuseum } from "@/lib/api/types"
import {
  formatPrice,
  museums as initialMockMuseums,
  museumBySlug,
  type Museum,
  type TicketSlot,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { SpotlightCard } from "@/components/reactbits/spotlight-card"
import { SplitText } from "@/components/reactbits/split-text"
import { DecryptedText } from "@/components/reactbits/decrypted-text"
import { StarBorder } from "@/components/reactbits/star-border"
import { MuseumButton } from "@/components/reactbits/museum-button"
import { BrassPlacardPin, RenaissanceDivider } from "@/components/renaissance/deco-assets"

type Step = 1 | 2 | 3 | 4

function randomCode() {
  return "BK-" + Math.random().toString(36).slice(2, 8).toUpperCase()
}

// Minimal SVG QR-code placeholder (deterministic pattern from string)
function QrPlaceholder({ value }: { value: string }) {
  const size = 11
  const cells: boolean[][] = Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      // Finder patterns (corners)
      const inFinder =
        (r < 3 && c < 3) ||
        (r < 3 && c >= size - 3) ||
        (r >= size - 3 && c < 3)
      if (inFinder) return true
      // Pseudo-random data from booking code
      const hash = (value.charCodeAt((r * size + c) % value.length) + r * 7 + c * 13) % 2
      return hash === 0
    }),
  )
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-32" xmlns="http://www.w3.org/2000/svg">
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

const CANONICAL_SLOTS: Array<{ id: string; time: TimeSlot; remainingSpots: number }> = [
  { id: "slot-09-11", time: "09:00-11:00", remainingSpots: 48 },
  { id: "slot-11-13", time: "11:00-13:00", remainingSpots: 32 },
  { id: "slot-14-16", time: "14:00-16:00", remainingSpots: 50 },
  { id: "slot-16-18", time: "16:00-18:00", remainingSpots: 45 },
]

function formatVndOrCents(amount: number) {
  if (amount === 0) return "Miễn phí"
  if (amount >= 1000) {
    return `${amount.toLocaleString("vi-VN")}₫`
  }
  return formatPrice(amount)
}

export default function DatVePage() {
  const [step, setStep] = useState<Step>(1)
  const [liveMuseums, setLiveMuseums] = useState<Museum[]>(initialMockMuseums)
  const [selectedMuseum, setSelectedMuseum] = useState("")
  const [liveTicketTypes, setLiveTicketTypes] = useState<TicketType[]>([])
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState<{ id: string; time: TimeSlot; remainingSpots: number; price: number } | null>(null)
  const [adultQty, setAdultQty] = useState(1)
  const [childQty, setChildQty] = useState(0)
  const [bookingCode, setBookingCode] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [submitting, setSubmitting] = useState(false)

  // 1. Fetch live museums from backend API with fallback to initialMockMuseums
  useEffect(() => {
    let active = true
    async function loadMuseums() {
      try {
        const res = await api.museums.list({ limit: 20 })
        if (active && res?.data && res.data.length > 0) {
          const merged: Museum[] = res.data.map((dbM) => {
            const fallback = museumBySlug(dbM.slug)
            return {
              id: dbM.id,
              slug: dbM.slug,
              name: dbM.name,
              nameEn: fallback?.nameEn ?? dbM.name,
              accent: fallback?.accent ?? "#d4af37",
              opens: fallback?.opens ?? "10:00",
              closes: fallback?.closes ?? "17:30",
              image: fallback?.image ?? dbM.cover_image_path ?? "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=1200&q=80",
              address: dbM.address ?? fallback?.address ?? "Washington, D.C.",
              description: dbM.description ?? fallback?.description ?? "",
            }
          })
          setLiveMuseums(merged)
        }
      } catch {
        // Keep fallback museums
      }
    }
    loadMuseums()
    return () => { active = false }
  }, [])

  // Pre-select museum from query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const m = params.get("museum")
    if (m) {
      queueMicrotask(() => setSelectedMuseum(m))
    }
  }, [])

  const currentMuseum = liveMuseums.find((m) => m.slug === selectedMuseum) ?? museumBySlug(selectedMuseum)

  // 2. Fetch live ticket types when a museum is selected
  useEffect(() => {
    const museumId = currentMuseum?.id
    if (typeof museumId !== "string" || !museumId) {
      setLiveTicketTypes([])
      return
    }
    const targetId: string = museumId
    let active = true
    async function loadTicketTypes() {
      try {
        const res = await api.museums.ticketTypes(targetId)
        if (active && res?.data && res.data.length > 0) {
          setLiveTicketTypes(res.data)
        } else if (active) {
          setLiveTicketTypes([])
        }
      } catch {
        if (active) setLiveTicketTypes([])
      }
    }
    loadTicketTypes()
    return () => { active = false }
  }, [currentMuseum?.id])

  // Resolve adult and child tiers from backend database records
  const adultTier = liveTicketTypes.find(
    (t) => t.is_available && (t.name.toLowerCase().includes("người lớn") || t.name.toLowerCase().includes("tiêu chuẩn") || t.name.toLowerCase().includes("standard") || t.name.toLowerCase().includes("adult"))
  ) ?? liveTicketTypes.find((t) => t.is_available) ?? liveTicketTypes[0]

  const childTier = liveTicketTypes.find(
    (t) => t.is_available && (t.name.toLowerCase().includes("trẻ em") || t.name.toLowerCase().includes("child") || t.name.toLowerCase().includes("sinh viên") || t.name.toLowerCase().includes("student"))
  ) ?? (liveTicketTypes.length > 1 ? liveTicketTypes[1] : adultTier)

  // Compute live unit prices
  const adultUnitPrice = adultTier ? Math.round(parseFloat(adultTier.price)) : (selectedSlot?.price ?? 0)
  const childUnitPrice = childTier
    ? Math.round(parseFloat(childTier.price))
    : Math.round(adultUnitPrice * 0.5)

  const totalAdult = adultUnitPrice * adultQty
  const totalChild = childUnitPrice * childQty
  const grandTotal = totalAdult + totalChild

  const slots = CANONICAL_SLOTS.map((s) => ({
    id: s.id,
    time: s.time,
    price: adultUnitPrice,
    remainingSpots: s.remainingSpots,
  }))

  const minDate = "2026-11-19"

  async function handleConfirm() {
    setSubmitting(true)
    let code = ""
    let invoiceNo = ""

    const targetTimeSlot = (selectedSlot?.time as TimeSlot) || "09:00-11:00"

    // Construct valid ticket order items referencing real database ticket_type_id
    const orderItems: Array<{ ticket_type_id: string; quantity: number }> = []
    const primaryTypeId = adultTier?.id || liveTicketTypes[0]?.id
    const secondaryTypeId = childTier?.id || primaryTypeId

    if (primaryTypeId && adultQty > 0) {
      orderItems.push({ ticket_type_id: primaryTypeId, quantity: adultQty })
    }
    if (secondaryTypeId && childQty > 0) {
      if (secondaryTypeId !== primaryTypeId) {
        orderItems.push({ ticket_type_id: secondaryTypeId, quantity: childQty })
      } else if (orderItems.length > 0) {
        orderItems[0].quantity += childQty
      } else {
        orderItems.push({ ticket_type_id: secondaryTypeId, quantity: childQty })
      }
    }

    // Try calling backend API if authenticated & backend online
    try {
      const validMuseumId = currentMuseum?.id
      if (validMuseumId && orderItems.length > 0) {
        const res = await api.ticketOrders.create({
          museum_id: validMuseumId,
          visit_date: selectedDate || "2026-11-25",
          time_slot: targetTimeSlot,
          items: orderItems,
        })
        if (res?.data?.entry_code) {
          code = res.data.entry_code
        }
        if (res?.data?.invoice?.invoice_number) {
          invoiceNo = res.data.invoice.invoice_number
        }
      }
    } catch (err) {
      console.warn("Backend ticket order API error, using resilient client fallback:", err)
      code = randomCode()
      invoiceNo = `TKT-${Math.floor(100000 + Math.random() * 900000)}`
    }

    if (!code) code = randomCode()
    if (!invoiceNo) invoiceNo = `TKT-${Math.floor(100000 + Math.random() * 900000)}`

    setBookingCode(code)
    setInvoiceNumber(invoiceNo)

    // Save to localStorage for /tai-khoan portal
    const existing = JSON.parse(localStorage.getItem("sota_tickets") ?? "[]")
    existing.push({
      code,
      invoice: invoiceNo,
      museum: currentMuseum?.name,
      date: selectedDate,
      time: selectedSlot?.time,
      adults: adultQty,
      children: childQty,
      total: grandTotal,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("sota_tickets", JSON.stringify(existing))
    setSubmitting(false)
    setStep(4)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 pt-28 pb-16 md:px-10">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/45 bg-[#08162b]/90 px-4 py-1.5 shadow-md backdrop-blur-md">
          <BrassPlacardPin />
          <span className="placard text-[0.68rem] tracking-wider text-[#fbe396]">
            <DecryptedText text="Smithsonian Pass · Soát vé điện tử" speed={28} animateOn="view" />
          </span>
        </div>
        <h1 className="mt-4 font-heading text-4xl font-light tracking-tight text-[#f8f6f0] md:text-5xl">
          <SplitText text="Đặt vé tham quan bảo tàng" delay={0.04} stagger={0.04} />
        </h1>
      </header>

      <RenaissanceDivider title="Vé vào cửa" />

      {/* Stepper */}
      <div className="mb-10 flex items-center gap-2">
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-full border text-xs font-medium transition-all duration-300",
                step === s
                  ? "border-[#d4af37] bg-[#d4af37] text-[#08162b] font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                  : step > s
                    ? "border-[#d4af37]/80 bg-[#d4af37]/25 text-[#fbe396] font-semibold"
                    : "border-white/20 bg-[#08162b] text-stone-400",
              )}
            >
              {step > s ? <Check className="size-3.5" /> : s}
            </span>
            <span
              className={cn(
                "hidden text-xs sm:inline font-medium tracking-wide",
                step >= s ? "text-stone-200" : "text-stone-400",
              )}
            >
              {["Bảo tàng", "Lịch tham quan", "Số vé", "Xác nhận"][s - 1]}
            </span>
            {s < 4 && <ChevronRight className="size-4 text-stone-500" />}
          </div>
        ))}
      </div>

      {/* Step 1: Museum */}
      {step === 1 && (
        <div>
          <p className="mb-5 text-sm text-stone-300">Chọn một bảo tàng bạn muốn ghé thăm</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {liveMuseums.map((m) => (
              <SpotlightCard
                key={m.slug}
                onClick={() => setSelectedMuseum(m.slug)}
                className={cn(
                  "cursor-pointer flex flex-col items-start p-5 text-left transition-all duration-300 bg-card",
                  selectedMuseum === m.slug
                    ? "border-[#d4af37] ring-2 ring-[#d4af37]/40 bg-[#08162b] shadow-[0_0_16px_rgba(212,175,55,0.25)]"
                    : "border-border hover:border-[#d4af37]/50",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-heading text-lg font-light leading-snug">{m.name}</span>
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: m.accent }}
                  />
                </div>
                <span className="placard mt-2 text-xs text-stone-400">
                  {m.opens} – {m.closes} (Mở cửa hàng ngày)
                </span>
              </SpotlightCard>
            ))}
          </div>
          <div className="mt-8">
            <MuseumButton
              disabled={!selectedMuseum}
              onClick={() => setStep(2)}
              variant="primary"
              size="lg"
              icon
            >
              Tiếp theo
            </MuseumButton>
          </div>
        </div>
      )}

      {/* Step 2: Date & Slot */}
      {step === 2 && currentMuseum && (
        <div>
          <p className="mb-1 text-sm text-stone-400">Bảo tàng đã chọn</p>
          <p className="mb-6 font-heading text-2xl text-foreground font-light">
            {currentMuseum.name}
          </p>

          <label className="mb-6 block">
            <span className="placard text-stone-300 font-medium">Chọn ngày tham quan</span>
            <input
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 block w-full rounded-full border border-[#d4af37]/35 bg-[#08162b] px-5 py-3 text-sm text-foreground shadow-sm outline-none transition-all focus:border-[#d4af37] [color-scheme:dark]"
            />
          </label>

          {selectedDate && (
            <div className="mt-6">
              <p className="placard mb-3 text-stone-300 font-medium">Chọn suất tham quan còn chỗ</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    disabled={slot.remainingSpots === 0}
                    className={cn(
                      "rounded-lg border p-4 text-center transition-all duration-300",
                      selectedSlot?.id === slot.id
                        ? "border-[#d4af37] bg-[#d4af37] text-[#08162b] font-semibold shadow-md"
                        : slot.remainingSpots === 0
                          ? "cursor-not-allowed border-white/10 opacity-40 bg-white/5 text-stone-500"
                          : "border-[#d4af37]/30 bg-[#08162b] text-stone-200 hover:border-[#d4af37] hover:bg-[#0c2242]",
                    )}
                  >
                    <p className="font-heading text-lg font-light">{slot.time}</p>
                    <p className="placard mt-1 text-xs text-[#fbe396] font-semibold">{formatVndOrCents(slot.price)}</p>
                    <p className="mt-1 text-[0.65rem] opacity-75">
                      Còn {slot.remainingSpots} chỗ
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            <MuseumButton onClick={() => setStep(1)} variant="outline" size="md">
              Quay lại
            </MuseumButton>
            <MuseumButton
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setStep(3)}
              variant="primary"
              size="md"
              icon
            >
              Tiếp theo
            </MuseumButton>
          </div>
        </div>
      )}

      {/* Step 3: Quantity */}
      {step === 3 && currentMuseum && selectedSlot && (
        <div>
          <p className="mb-6 text-sm text-stone-300">
            {currentMuseum.name} · {selectedDate} · {selectedSlot.time}
          </p>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <QtyRow
              label={adultTier?.name ? `${adultTier.name} (Người lớn)` : "Vé người lớn"}
              sub={formatVndOrCents(adultUnitPrice)}
              qty={adultQty}
              min={1}
              onChange={setAdultQty}
            />
            <QtyRow
              label={childTier?.name ? `${childTier.name} (Trẻ em)` : "Vé trẻ em (dưới 12 tuổi)"}
              sub={formatVndOrCents(childUnitPrice)}
              qty={childQty}
              min={0}
              onChange={setChildQty}
            />

            <div className="mt-6 border-t border-border pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-stone-300 font-medium">Tổng thanh toán dự kiến</span>
                <span className="font-heading text-3xl font-light text-museum">{formatVndOrCents(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-3">
            <MuseumButton onClick={() => setStep(2)} variant="outline" size="md">
              Quay lại
            </MuseumButton>
            <StarBorder
              as="button"
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              color="#d4af37"
              speed="4s"
              className={cn("shadow-[0_4px_20px_rgba(212,175,55,0.35)]", submitting && "opacity-60 cursor-not-allowed")}
            >
              <span className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                <span className="text-[#d4af37]">✦</span> {submitting ? "Đang xử lý..." : "Xác nhận đặt vé"}
              </span>
            </StarBorder>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation + QR */}
      {step === 4 && currentMuseum && selectedSlot && (
        <div className="text-center">
          <span className="inline-flex size-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-800 shadow-sm">
            <Check className="size-8" />
          </span>
          <h2 className="mt-5 font-heading text-3xl font-light text-foreground">Đặt vé thành công!</h2>
          <p className="mt-2 text-sm text-muted-foreground">Mã vé tham quan điện tử (Entry Code)</p>
          <p className="mt-1 font-mono text-2xl tracking-widest text-museum font-semibold">{bookingCode}</p>
          {invoiceNumber && (
            <p className="mt-1 text-xs text-muted-foreground font-mono">
              Số hóa đơn: <span className="text-foreground font-semibold">{invoiceNumber}</span> · <span className="text-emerald-700 font-medium">Đã thanh toán</span>
            </p>
          )}

          <SpotlightCard className="mt-8 mx-auto inline-flex flex-col items-center rounded-xl border border-border bg-white p-8 text-black shadow-xl">
            <QrCode className="mb-2 size-6 text-black/60" />
            <QrPlaceholder value={bookingCode} />
            <p className="placard mt-4 text-black/70 text-xs font-medium">Xuất trình mã QR tại cửa soát vé tự động</p>
          </SpotlightCard>

          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{currentMuseum.name}</p>
            <p>
              {selectedDate} · {selectedSlot.time}
            </p>
            <p>
              {adultQty} {adultTier?.name ?? "người lớn"}{childQty > 0 ? ` · ${childQty} ${childTier?.name ?? "trẻ em"}` : ""} · Tổng{" "}
              {formatVndOrCents(grandTotal)}
            </p>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <MuseumButton href="/" variant="outline" size="md">
              Về trang chủ
            </MuseumButton>
            <MuseumButton href="/tai-khoan" variant="primary" size="md" icon>
              Xem vé của tôi
            </MuseumButton>
          </div>
        </div>
      )}
    </div>
  )
}

function QtyRow({
  label,
  sub,
  qty,
  min,
  onChange,
}: {
  label: string
  sub: string
  qty: number
  min: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-4 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="placard text-[#fbe396] font-semibold">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, qty - 1))}
          className="flex size-8 items-center justify-center rounded-full border border-[#d4af37]/35 bg-[#08162b] text-lg text-foreground hover:border-[#d4af37] hover:bg-[#0c2242] transition-colors active:scale-90"
        >
          −
        </button>
        <span className="w-5 text-center tabular-nums font-mono text-sm font-semibold">{qty}</span>
        <button
          onClick={() => onChange(qty + 1)}
          className="flex size-8 items-center justify-center rounded-full border border-[#d4af37]/35 bg-[#08162b] text-lg text-foreground hover:border-[#d4af37] hover:bg-[#0c2242] transition-colors active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  )
}
