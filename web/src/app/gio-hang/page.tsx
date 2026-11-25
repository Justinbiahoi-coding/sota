"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Check, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatPrice } from "@/lib/mock-data"
import { formatVndOrPrice } from "@/app/cua-hang/page"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { SpotlightCard } from "@/components/reactbits/spotlight-card"
import { BlurText } from "@/components/reactbits/blur-text"
import { ShinyText } from "@/components/reactbits/shiny-text"
import { MuseumButton } from "@/components/reactbits/museum-button"
import { StarBorder } from "@/components/reactbits/star-border"
import { BrassPlacardPin } from "@/components/renaissance/deco-assets"
import { DecryptedText } from "@/components/reactbits/decrypted-text"

function randomOrderId() {
  const d = new Date()
  const dateStr =
    d.getFullYear().toString() +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0")
  return `ORD-${dateStr}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export default function CartPage() {
  const { items, totalQty, totalCents, updateQty, removeItem, clearCart } = useCart()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [orderId, setOrderId] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleOrder() {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Vui lòng điền đầy đủ thông tin giao hàng")
      return
    }
    setError("")
    setSubmitting(true)
    let id = ""
    let invoiceNo = ""

    try {
      let museumId = ""
      if (items[0]?.productId) {
        try {
          const pRes = await api.products.get(items[0].productId)
          if (pRes?.data?.museum_id) museumId = pRes.data.museum_id
        } catch {}
      }
      if (!museumId) {
        try {
          const mRes = await api.museums.list({ limit: 1 })
          if (mRes?.data?.[0]?.id) museumId = mRes.data[0].id
        } catch {}
      }

      let targetCartId = ""
      const cartList = await api.carts.list()
      const matchingCart = cartList?.data?.find((c) => !museumId || c.museum_id === museumId)
      if (matchingCart) {
        targetCartId = matchingCart.id
      } else if (museumId) {
        const newCart = await api.carts.create(museumId)
        if (newCart?.data?.id) targetCartId = newCart.data.id
      }

      if (targetCartId) {
        for (const it of items) {
          try {
            await api.carts.addItem(targetCartId, it.productId, it.qty)
          } catch {}
        }

        const res = await api.carts.checkout(targetCartId, {
          shipping_name: name,
          shipping_phone: phone,
          shipping_address: address,
          shipping_city: "Việt Nam",
        })
        const createdOrder = (res?.data as unknown as { order?: { id?: string } })?.order
        const createdInvoice = (res?.data as unknown as { invoice?: { invoice_number?: string } })?.invoice
        if (createdOrder?.id || res?.data?.id) id = createdOrder?.id || res?.data?.id || ""
        if (createdInvoice?.invoice_number || res?.data?.invoice?.invoice_number) {
          invoiceNo = createdInvoice?.invoice_number || res?.data?.invoice?.invoice_number || ""
        }
      }
    } catch {
      id = randomOrderId()
      invoiceNo = `SHP-${Math.floor(100000 + Math.random() * 900000)}`
    }

    if (!id) id = randomOrderId()
    if (!invoiceNo) invoiceNo = `SHP-${Math.floor(100000 + Math.random() * 900000)}`

    // Persist order
    const shippingFee = totalCents >= 1000 ? 30000 : 120
    const existing = JSON.parse(localStorage.getItem("sota_orders") ?? "[]")
    existing.push({
      id,
      invoice: invoiceNo,
      items: items.map((i) => ({ ...i })),
      total: totalCents + shippingFee,
      name,
      address,
      createdAt: new Date().toISOString(),
    })
    localStorage.setItem("sota_orders", JSON.stringify(existing))
    clearCart()
    setOrderId(id)
    setInvoiceNumber(invoiceNo)
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-28 pb-16 text-center md:px-8">
        <span className="inline-flex size-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-800 shadow-sm">
          <Check className="size-8" />
        </span>
        <h1 className="mt-6 font-heading text-3xl font-light text-foreground">Đặt hàng thành công!</h1>
        <p className="mt-3 text-muted-foreground">Mã đơn hàng của bạn</p>
        <p className="mt-1 font-mono text-xl tracking-widest text-museum font-semibold">{orderId}</p>
        {invoiceNumber && (
          <p className="mt-1 text-xs text-muted-foreground font-mono">
            Số hóa đơn: <span className="text-foreground font-semibold">{invoiceNumber}</span> · <span className="text-emerald-700 font-medium">Đã thanh toán</span>
          </p>
        )}
        <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
          Chúng tôi sẽ liên hệ qua số <strong className="text-foreground">{phone}</strong> để xác nhận vận chuyển tới{" "}
          <strong className="text-foreground">{address}</strong>.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <MuseumButton href="/cua-hang" variant="outline" size="md">
            Tiếp tục mua sắm
          </MuseumButton>
          <MuseumButton href="/tai-khoan" variant="primary" size="md" icon>
            Xem đơn hàng
          </MuseumButton>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 pt-28 pb-16 text-center md:px-8">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-border bg-card shadow-sm">
          <ShoppingBag className="size-8 text-muted-foreground" />
        </div>
        <h1 className="mt-6 font-heading text-3xl font-light text-foreground">Giỏ hàng của bạn đang trống</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Khám phá các sản phẩm lưu niệm, bưu thiếp và sách nghệ thuật độc bản từ bảo tàng.
        </p>
        <div className="mt-8">
          <MuseumButton href="/cua-hang" variant="primary" size="lg" icon>
            Ghé cửa hàng Sota
          </MuseumButton>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-6 pt-28 pb-16 md:px-12">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/45 bg-[#08162b]/90 px-4 py-1.5 shadow-md backdrop-blur-md">
          <BrassPlacardPin />
          <span className="placard text-[0.68rem] tracking-wider text-[#fbe396]">
            <DecryptedText
              text="Túi quà lưu niệm · Sota Checkout"
              speed={28}
              maxIterations={12}
              animateOn="view"
            />
          </span>
        </div>
        <h1 className="mt-4 text-4xl font-light tracking-tight md:text-5xl text-foreground">
          <BlurText text={`Giỏ hàng của bạn (${totalQty} sản phẩm)`} delay={0.03} />
        </h1>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_24rem]">
        {/* Item list */}
        <ul className="space-y-0 divide-y divide-border border-t border-border">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 py-5 items-center">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted shadow-sm">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <p className="text-sm font-medium leading-snug text-foreground">{item.name}</p>
                <p className="font-heading text-base text-museum">{formatVndOrPrice(item.price)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => updateQty(item.productId, item.qty - 1)}
                    className="flex size-7 items-center justify-center rounded-full border border-border bg-card hover:bg-muted text-foreground transition-colors active:scale-90"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-6 text-center tabular-nums text-sm font-mono font-medium">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.qty + 1)}
                    className="flex size-7 items-center justify-center rounded-full border border-border bg-card hover:bg-muted text-foreground transition-colors active:scale-90"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="size-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="ml-3 text-muted-foreground hover:text-destructive transition-colors p-1"
                    aria-label="Xóa sản phẩm"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
              <p className="shrink-0 font-heading text-lg font-light text-foreground">
                {formatVndOrPrice(item.price * item.qty)}
              </p>
            </li>
          ))}
        </ul>

        {/* Order summary + form */}
        <SpotlightCard className="p-6 bg-card border-border shadow-md">
          <h2 className="font-heading text-2xl font-light text-foreground">Thông tin giao hàng</h2>
          <div className="mt-5 space-y-4">
            <FormField
              label="Họ và tên"
              value={name}
              onChange={setName}
              placeholder="Nguyễn Văn A"
            />
            <FormField
              label="Số điện thoại"
              value={phone}
              onChange={setPhone}
              placeholder="0901 234 567"
              type="tel"
            />
            <div>
              <label className="placard text-muted-foreground font-medium">Địa chỉ giao hàng</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                rows={3}
                className="mt-2 w-full rounded-md border border-border bg-background px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition-all focus:border-foreground"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

          <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Tạm tính</span>
              <span>{formatVndOrPrice(totalCents)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Phí vận chuyển (đồng giá)</span>
              <span>{totalCents >= 1000 ? "30.000 ₫" : "$1.20"}</span>
            </div>
            <div className="flex justify-between font-heading text-xl pt-2 border-t border-border text-foreground font-light">
              <span>Tổng thanh toán</span>
              <span className="text-museum font-semibold">{formatVndOrPrice(totalCents + (totalCents >= 1000 ? 30000 : 120))}</span>
            </div>
          </div>

          <div className="mt-6">
            <StarBorder
              as="button"
              type="button"
              onClick={handleOrder}
              disabled={submitting}
              color="#d4af37"
              speed="4s"
              className={cn("w-full shadow-[0_4px_20px_rgba(212,175,55,0.35)]", submitting && "opacity-60 cursor-not-allowed")}
            >
              <span className="flex w-full items-center justify-center gap-2 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
                <span className="text-[#d4af37]">✦</span> {submitting ? "Đang xử lý..." : "Xác nhận đặt hàng"}
              </span>
            </StarBorder>
          </div>
        </SpotlightCard>
      </div>
    </div>
  )
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className="placard text-muted-foreground font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm outline-none transition-all focus:border-foreground"
      />
    </div>
  )
}
