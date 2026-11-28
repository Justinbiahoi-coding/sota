"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CalendarDays, Check, Landmark, Minus, Plus, Ticket } from "lucide-react"
import { api, ApiClientError } from "@/lib/api/client"
import { TIME_SLOTS, type Museum as ApiMuseum, type TimeSlot } from "@/lib/api/types"
import { formatPrice, museums, ticketSlotsByMuseum } from "@/lib/mock-data"
import { GalleryMasthead } from "@/components/site/gallery-masthead"
import { EntryQr } from "@/components/site/entry-qr"
import { StarBorder } from "@/components/reactbits/star-border"
import { RenaissanceCorners } from "@/components/renaissance/deco-assets"

const translations: Record<string, number> = {
  "national-museum-of-natural-history": 0,
  "national-air-and-space-museum": 1,
  "national-museum-of-american-history": 2,
  "national-portrait-gallery": 3,
  "hirshhorn-museum-and-sculpture-garden": 4,
  "national-museum-of-asian-art": 5,
}

const steps = ["Bảo tàng", "Ngày và giờ", "Loại vé", "Xác nhận"]
const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
const day = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeZone: "UTC" })

function museumFromApi(result: ApiMuseum) {
  const local = museums[translations[result.slug]]
  return {
    id: result.id,
    slug: local?.slug ?? result.slug,
    name: local?.name ?? result.name,
    nameEn: result.name,
  }
}

type VisitMuseum = { id?: string; slug: string; name: string; nameEn: string }
type Tier = { id: string; name: string; price: number }
type Receipt = { code: string; invoice?: string; total: number; demo: boolean }

function formatTicketPrice(value: number, live: boolean) {
  return value === 0 ? "Miễn phí" : live ? money.format(value) : formatPrice(value)
}

function formatDate(value: string) {
  return value ? day.format(new Date(value + "T00:00:00Z")) : ""
}

export default function DatVePage() {
  const [step, setStep] = useState(0)
  const [options, setOptions] = useState<VisitMuseum[]>(museums)
  const [loadingMuseums, setLoadingMuseums] = useState(true)
  const [selection, setSelection] = useState("")
  const [date, setDate] = useState("")
  const [today, setToday] = useState("")
  const [slot, setSlot] = useState<TimeSlot | null>(null)
  const [priceList, setPriceList] = useState<{ museumId: string; tiers: Tier[]; failed?: boolean }>()
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [receipt, setReceipt] = useState<Receipt>()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const bookingLock = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const visit = options.find((museum) => museum.slug === selection)
  const museumId = visit?.id

  useEffect(() => {
    let active = true
    const selected = new URLSearchParams(window.location.search).get("museum")
    if (selected) setSelection(museums[translations[selected]]?.slug ?? selected)
    api.museums.list({ limit: 20 }).then(({ data }) => {
      if (active) setOptions(data.map(museumFromApi))
    }).catch(() => {
      // The frontend prototype can also be used with the local catalogue.
    }).finally(() => {
      if (active) setLoadingMuseums(false)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!museumId) return
    let active = true
    api.museums.ticketTypes(museumId).then(({ data }) => {
      if (active) setPriceList({
        museumId,
        tiers: data.filter((item) => item.is_available).map(({ id, name, price }) => ({ id, name, price: Number(price) })),
      })
    }).catch(() => {
      if (active) setPriceList({ museumId, tiers: [], failed: true })
    })
    return () => { active = false }
  }, [museumId])

  const demoPrice = visit ? ticketSlotsByMuseum(visit.slug)[0]?.price ?? 0 : 0
  const tiers = museumId
    ? (priceList?.museumId === museumId ? priceList.tiers : [])
    : [{ id: "adult", name: "Vé người lớn", price: demoPrice }, { id: "child", name: "Vé trẻ em", price: Math.round(demoPrice / 2) }]
  const selectedTiers = tiers.filter(({ id }) => quantities[id] > 0)
  const total = selectedTiers.reduce((sum, tier) => sum + tier.price * quantities[tier.id], 0)
  const totalTickets = selectedTiers.reduce((sum, tier) => sum + quantities[tier.id], 0)

  function go(nextStep: number) {
    if (nextStep === 1) {
      const currentDay = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
      setToday(currentDay)
      if (!date || date < currentDay) setDate(currentDay)
    }
    setStep(nextStep)
    setError("")
    requestAnimationFrame(() => heading.current?.focus())
  }

  function chooseMuseum(slug: string) {
    if (slug === selection) return
    setSelection(slug)
    setSlot(null)
    setQuantities({})
  }

  function continueFromSchedule() {
    if (tiers.length === 0) return
    if (!totalTickets) setQuantities({ [tiers[0].id]: 1 })
    go(2)
  }

  async function confirm() {
    if (!visit || !slot || date < today || !totalTickets || bookingLock.current) return
    bookingLock.current = true
    setSubmitting(true)
    setError("")
    try {
      if (museumId) {
        const { data } = await api.ticketOrders.create({
          museum_id: museumId,
          visit_date: date,
          time_slot: slot,
          items: selectedTiers.map(({ id }) => ({ ticket_type_id: id, quantity: quantities[id] })),
        })
        setReceipt({ code: data.order.entry_code, invoice: data.invoice.invoice_number, total: Number(data.order.total_amount), demo: false })
      } else {
        const code = "BK-" + crypto.randomUUID().slice(0, 8).toUpperCase()
        let saved: unknown = []
        try { saved = JSON.parse(localStorage.getItem("sota_tickets") ?? "[]") } catch {}
        localStorage.setItem("sota_tickets", JSON.stringify([...(Array.isArray(saved) ? saved : []), {
          code, museum: visit.name, date, time: slot, adults: totalTickets, children: quantities.child ?? 0, total, demo: true, status: "confirmed",
        }]))
        setReceipt({ code, total, demo: true })
      }
      go(3)
    } catch (cause) {
      if (cause instanceof ApiClientError && cause.status === 401) {
        setError("Hãy đăng nhập để xác nhận vé.")
      } else if (cause instanceof ApiClientError && cause.code === "ticket_type_unavailable") {
        setError("Loại vé đã chọn hiện không còn mở bán. Vui lòng tải lại bảng vé.")
      } else if (cause instanceof ApiClientError && cause.code === "invalid_visit_date") {
        setError("Ngày tham quan không còn hợp lệ. Vui lòng chọn ngày khác.")
      } else {
        setError("Chưa thể xác nhận vé. Vui lòng thử lại.")
      }
    } finally {
      setSubmitting(false)
      bookingLock.current = false
    }
  }

  return (
    <div className="gallery-page">
      <GalleryMasthead label="Vé vào cửa" title={<>Đặt vé <em>tham quan.</em></>}
        description="Chọn một bảo tàng, ngày ghé thăm và loại vé phù hợp."
        image="/map-art-dat-ve.webp" />
      <div className="gallery-wrap py-10 md:py-14">
        <ol aria-label="Tiến độ đặt vé" className="mb-7 grid grid-cols-4 gap-1 border-b border-[#d3c8b5] md:mb-10 md:gap-4">
          {steps.map((label, index) => (
            <li key={label} aria-current={step === index ? "step" : undefined}
              className={"flex min-w-0 flex-col items-center gap-1.5 border-b-2 px-1 pb-3 text-center text-xs font-semibold sm:flex-row sm:gap-2 sm:text-sm " + (step === index ? "border-[#77531c] text-[#08162b]" : "border-transparent text-stone-700")}>
              <span className={"flex size-7 shrink-0 items-center justify-center rounded-full border font-mono " + (index <= step ? "border-[#08162b] bg-[#08162b] text-white" : "border-[#d3c8b5]")}>
                {index < step ? <Check aria-label="Hoàn thành" className="size-4" /> : index + 1}
              </span>
              {label}
            </li>
          ))}
        </ol>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,23rem)] lg:gap-10">
          <section className="gallery-sheet rounded-md p-5 md:p-8" aria-labelledby="booking-step">
            <h2 ref={heading} tabIndex={-1} id="booking-step" className="scroll-mt-24 font-heading text-4xl leading-tight">
              {step === 0 ? "Chọn bảo tàng" : step === 1 ? "Chọn ngày và giờ" : step === 2 ? "Chọn loại vé" : receipt?.demo ? "Đã tạo vé thử nghiệm" : "Đã xác nhận vé"}
            </h2>
            {step === 0 && (
              <>
                {loadingMuseums && <p role="status" className="mt-3 text-sm text-stone-700">Đang tải danh sách bảo tàng…</p>}
                {!loadingMuseums && options.length === 0 && <p className="mt-4 text-stone-700">Chưa có bảo tàng mở đặt vé.</p>}
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {options.map((museum) => (
                    <button type="button" key={museum.slug} aria-pressed={selection === museum.slug} onClick={() => chooseMuseum(museum.slug)}
                      className={"min-h-24 rounded-md border p-4 text-left transition-colors " + (museum.slug === selection ? "border-[#ac8128] bg-[#f4ead2]" : "border-[#e1d8c7] hover:border-[#ac8128]")}>
                      <span className="block font-heading text-2xl leading-tight">{museum.name}</span>
                      {museum.nameEn !== museum.name && <span className="mt-1 block text-sm text-stone-700">{museum.nameEn}</span>}
                    </button>
                  ))}
                </div>
                <button type="button" disabled={!visit || loadingMuseums} onClick={() => go(1)} className="gallery-action mt-6 disabled:opacity-50">Chọn ngày và giờ</button>
              </>
            )}
            {step === 1 && (
              <>
                <label className="mt-5 grid max-w-xs gap-2 font-semibold">
                  Ngày tham quan
                  <input type="date" min={today} value={date} onChange={(event) => setDate(event.target.value)} className="gallery-control px-3 font-normal" />
                </label>
                <fieldset className="mt-6">
                  <legend className="mb-2 font-semibold">Khung giờ</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {TIME_SLOTS.map((time) => (
                      <button type="button" key={time} aria-pressed={slot === time} onClick={() => setSlot(time)}
                        className={"min-h-12 rounded-md border px-2 font-mono text-sm " + (slot === time ? "border-[#ac8128] bg-[#f4ead2]" : "border-[#e1d8c7] hover:border-[#ac8128]")}>{time}</button>
                    ))}
                  </div>
                </fieldset>
                {museumId && !tiers.length && (
                  <p role="status" className="mt-4 text-sm text-stone-700">
                    {priceList?.museumId !== museumId ? "Đang tải bảng vé…" : priceList.failed ? "Chưa tải được bảng vé. Vui lòng tải lại trang." : "Bảo tàng chưa mở bán vé."}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => go(0)} className="gallery-action gallery-action-muted">Quay lại</button>
                  <button type="button" disabled={!date || date < today || !slot || !tiers.length} onClick={continueFromSchedule} className="gallery-action disabled:opacity-50">Chọn số vé</button>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <ul className="mt-4 divide-y divide-[#e1d8c7]">
                  {tiers.map((tier) => {
                    const qty = quantities[tier.id] ?? 0
                    return <li key={tier.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div><p className="font-heading text-2xl">{tier.name}</p><p className="text-sm font-semibold text-[#77531c]">{formatTicketPrice(tier.price, Boolean(museumId))}</p></div>
                      <div className="flex items-center gap-2">
                        <button type="button" aria-label={"Giảm " + tier.name} disabled={!qty || submitting} className="gallery-icon-button"
                          onClick={() => setQuantities({ ...quantities, [tier.id]: qty - 1 })}><Minus className="size-4" /></button>
                        <span className="w-7 text-center font-mono tabular-nums">{qty}</span>
                        <button type="button" aria-label={"Tăng " + tier.name} disabled={submitting} className="gallery-icon-button"
                          onClick={() => setQuantities({ ...quantities, [tier.id]: qty + 1 })}><Plus className="size-4" /></button>
                      </div>
                    </li>
                  })}
                </ul>
                <p className="mt-4 text-sm text-stone-700">{museumId ? "Thanh toán mô phỏng" : "Dữ liệu mẫu · Thanh toán mô phỏng"}</p>
                {error && <p role="alert" className="mt-4 rounded-sm border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error} {error.includes("đăng nhập") && <Link href="/dang-nhap" className="font-semibold underline">Đăng nhập</Link>}</p>}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button type="button" onClick={() => go(1)} disabled={submitting} className="gallery-action gallery-action-muted disabled:opacity-50">Quay lại</button>
                  <StarBorder type="button" onClick={confirm} disabled={!totalTickets || submitting} className="min-h-12 bg-[#d4af37] disabled:opacity-50">
                    {submitting ? "Đang xác nhận…" : "Xác nhận đặt vé"}
                  </StarBorder>
                </div>
              </>
            )}
            {step === 3 && receipt && (
              <div className="mt-5">
                <p className="text-stone-700">{receipt.demo ? "Mã QR dùng trong bản thử nghiệm." : "Xuất trình mã QR này tại cửa soát vé."}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="border border-[#e1d8c7]"><EntryQr value={receipt.code} /></div>
                  <div className="min-w-0">
                    <p className="text-sm text-stone-700">Mã vào cổng</p>
                    <p className="mt-1 break-all font-mono text-lg font-semibold text-[#77531c]">{receipt.code}</p>
                    {receipt.invoice && <p className="mt-2 text-sm">Hóa đơn {receipt.invoice}</p>}
                  </div>
                </div>
                <Link href="/tai-khoan" className="gallery-action mt-6">Xem vé của tôi</Link>
              </div>
            )}
          </section>

          <aside aria-label="Tóm tắt chuyến tham quan" className="gallery-on-dark relative rounded-md border border-[#d4af37]/35 bg-[#08162b] p-5 text-[#f7f4ec] md:p-7">
            <RenaissanceCorners />
            <p className="gallery-kicker">Vé tham quan</p>
            <p className="mt-4 flex items-start gap-3 font-heading text-2xl leading-tight">
              <Landmark aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#f2d790]" /> {visit?.name ?? "Chưa chọn bảo tàng"}
            </p>
            <p className="mt-4 flex items-center gap-3 text-sm text-stone-200"><CalendarDays className="size-5 shrink-0 text-[#f2d790]" />{[formatDate(date), slot].filter(Boolean).join(" · ") || "Chưa chọn ngày và giờ"}</p>
            {step >= 2 && <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-[#d4af37]/30 pt-4">
              <span className="flex items-center gap-2"><Ticket className="size-5 text-[#f2d790]" />{totalTickets} vé</span>
              <span className="font-semibold text-[#f2d790]">{formatTicketPrice(receipt?.total ?? total, Boolean(museumId))}</span>
            </div>}
          </aside>
        </div>
      </div>
    </div>
  )
}
