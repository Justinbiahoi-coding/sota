"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, ChevronRight, QrCode } from "lucide-react"
import {
  formatPrice,
  museums,
  museumBySlug,
  ticketSlotsByMuseum,
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

export default function DatVePage() {
  const [step, setStep] = useState<Step>(1)
  const [selectedMuseum, setSelectedMuseum] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedSlot, setSelectedSlot] = useState<TicketSlot | null>(null)
  const [adultQty, setAdultQty] = useState(1)
  const [childQty, setChildQty] = useState(0)
  const [bookingCode, setBookingCode] = useState("")

  // Pre-select museum from query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const m = params.get("museum")
    if (m) {
      queueMicrotask(() => setSelectedMuseum(m))
    }
  }, [])

  const slots = selectedMuseum ? ticketSlotsByMuseum(selectedMuseum) : []

  const museum = museumBySlug(selectedMuseum)
  const totalAdult = selectedSlot ? selectedSlot.price * adultQty : 0
  const totalChild = selectedSlot ? Math.round(selectedSlot.price * 0.5) * childQty : 0
  const grandTotal = totalAdult + totalChild

  const minDate = "2026-11-19"

  function handleConfirm() {
    const code = randomCode()
    setBookingCode(code)
    // Persist to localStorage for /tai-khoan
    const existing = JSON.parse(localStorage.getItem("sota_tickets") ?? "[]")
    existing.push({
      code,
      museum: museum?.name,
      date: selectedDate,
      time: selectedSlot?.time,
      adults: adultQty,
      children: childQty,
      total: grandTotal,
    })
    localStorage.setItem("sota_tickets", JSON.stringify(existing))
    setStep(4)
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-10">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-white/95 px-4 py-1.5 shadow-sm">
          <BrassPlacardPin />
          <span className="placard text-[0.68rem] tracking-wider text-[#92400e]">
            <DecryptedText text="Smithsonian Pass · Soát vé điện tử" speed={28} animateOn="view" />
          </span>
        </div>
        <h1 className="mt-4 font-heading text-4xl font-light tracking-tight text-[#171717] md:text-5xl">
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
                  ? "border-foreground bg-foreground text-background shadow-sm"
                  : step > s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-muted-foreground",
              )}
            >
              {step > s ? <Check className="size-3.5" /> : s}
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline font-medium">
              {["Bảo tàng", "Lịch tham quan", "Số vé", "Xác nhận"][s - 1]}
            </span>
            {s < 4 && <ChevronRight className="size-4 text-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Museum */}
      {step === 1 && (
        <div>
          <p className="mb-5 text-sm text-muted-foreground">Chọn một bảo tàng bạn muốn ghé thăm</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {museums.map((m) => (
              <SpotlightCard
                key={m.slug}
                onClick={() => setSelectedMuseum(m.slug)}
                className={cn(
                  "cursor-pointer flex flex-col items-start p-5 text-left transition-all duration-300 bg-card",
                  selectedMuseum === m.slug
                    ? "border-foreground ring-2 ring-foreground/20 shadow-md"
                    : "border-border hover:border-foreground/40",
                )}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-heading text-lg font-light leading-snug">{m.name}</span>
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: m.accent }}
                  />
                </div>
                <span className="placard mt-2 text-xs text-muted-foreground">
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
      {step === 2 && museum && (
        <div>
          <p className="mb-1 text-sm text-muted-foreground">Bảo tàng đã chọn</p>
          <p className="mb-6 font-heading text-2xl text-foreground font-light">
            {museum.name}
          </p>

          <label className="mb-6 block">
            <span className="placard text-muted-foreground font-medium">Chọn ngày tham quan</span>
            <input
              type="date"
              min={minDate}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-2 block w-full rounded-full border border-border bg-card px-5 py-3 text-sm text-foreground shadow-sm outline-none transition-all focus:border-foreground"
            />
          </label>

          {selectedDate && (
            <div className="mt-6">
              <p className="placard mb-3 text-muted-foreground font-medium">Chọn suất tham quan còn chỗ</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    disabled={slot.remainingSpots === 0}
                    className={cn(
                      "rounded-lg border p-4 text-center transition-all duration-300",
                      selectedSlot?.id === slot.id
                        ? "border-foreground bg-foreground text-background shadow-md"
                        : slot.remainingSpots === 0
                          ? "cursor-not-allowed border-border opacity-40 bg-muted/40"
                          : "border-border bg-card hover:border-foreground/50 hover:shadow-sm",
                    )}
                  >
                    <p className="font-heading text-lg font-light">{slot.time}</p>
                    <p className="placard mt-1 text-xs">{formatPrice(slot.price)}</p>
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
      {step === 3 && museum && selectedSlot && (
        <div>
          <p className="mb-6 text-sm text-muted-foreground">
            {museum.name} · {selectedDate} · {selectedSlot.time}
          </p>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <QtyRow
              label="Vé người lớn"
              sub={formatPrice(selectedSlot.price)}
              qty={adultQty}
              min={1}
              onChange={setAdultQty}
            />
            <QtyRow
              label="Vé trẻ em (dưới 12 tuổi)"
              sub={formatPrice(Math.round(selectedSlot.price * 0.5))}
              qty={childQty}
              min={0}
              onChange={setChildQty}
            />

            <div className="mt-6 border-t border-border pt-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground font-medium">Tổng thanh toán dự kiến</span>
                <span className="font-heading text-3xl font-light text-museum">{formatPrice(grandTotal)}</span>
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
              color="#d4af37"
              speed="4s"
              className="shadow-[0_4px_20px_rgba(212,175,55,0.35)]"
            >
              <span className="flex items-center gap-2 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                <span className="text-[#d4af37]">✦</span> Thanh toán
              </span>
            </StarBorder>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation + QR */}
      {step === 4 && museum && selectedSlot && (
        <div className="text-center">
          <span className="inline-flex size-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-800 shadow-sm">
            <Check className="size-8" />
          </span>
          <h2 className="mt-5 font-heading text-3xl font-light text-foreground">Đặt vé thành công!</h2>
          <p className="mt-2 text-sm text-muted-foreground">Mã vé tham quan điện tử</p>
          <p className="mt-1 font-mono text-2xl tracking-widest text-museum font-semibold">{bookingCode}</p>

          <SpotlightCard className="mt-8 mx-auto inline-flex flex-col items-center rounded-xl border border-border bg-white p-8 text-black shadow-xl">
            <QrCode className="mb-2 size-6 text-black/60" />
            <QrPlaceholder value={bookingCode} />
            <p className="placard mt-4 text-black/70 text-xs font-medium">Xuất trình mã QR tại cửa soát vé tự động</p>
          </SpotlightCard>

          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{museum.name}</p>
            <p>
              {selectedDate} · {selectedSlot.time}
            </p>
            <p>
              {adultQty} người lớn{childQty > 0 ? ` · ${childQty} trẻ em` : ""} · Tổng{" "}
              {formatPrice(grandTotal)}
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
        <p className="placard text-muted-foreground">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, qty - 1))}
          className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-lg text-foreground hover:bg-muted transition-colors active:scale-90"
        >
          −
        </button>
        <span className="w-5 text-center tabular-nums font-mono text-sm font-semibold">{qty}</span>
        <button
          onClick={() => onChange(qty + 1)}
          className="flex size-8 items-center justify-center rounded-full border border-border bg-card text-lg text-foreground hover:bg-muted transition-colors active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  )
}
