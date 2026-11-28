"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useState, type FormEvent } from "react"
import { Check, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { GalleryMasthead } from "@/components/site/gallery-masthead"
import { RenaissanceCorners } from "@/components/renaissance/deco-assets"
import { StarBorder } from "@/components/reactbits/star-border"
import { useCart, type CartItem } from "@/lib/cart-context"
import { products, museumBySlug, formatPrice } from "@/lib/mock-data"
import { api, ApiClientError } from "@/lib/api/client"
import { formatShopPrice, isLiveProduct } from "@/lib/shop-price"

function cartGroup(item: CartItem) {
  const slug = item.museumSlug ?? products.find((product) => product.id === item.productId)?.museumSlug ?? ""
  return (isLiveProduct(item.productId) ? "live:" : "demo:") + slug
}

function saveDemoOrder(order: object) {
  let existing: unknown = []
  try {
    existing = JSON.parse(localStorage.getItem("sota_orders") ?? "[]")
  } catch {}
  localStorage.setItem("sota_orders", JSON.stringify([...(Array.isArray(existing) ? existing : []), order]))
}

function checkoutError(error: unknown) {
  if (error instanceof ApiClientError) {
    if (error.status === 401) return "Hãy đăng nhập để đặt các vật phẩm trong giỏ này."
    if (error.code === "out_of_stock" || error.code === "product_unavailable" || error.status === 404) {
      return "Một vật phẩm không còn đủ hàng. Hãy kiểm tra lại số lượng hoặc bỏ vật phẩm khỏi giỏ."
    }
    if (error.code === "price_changed") return "Giá sản phẩm đã thay đổi. Hãy kiểm tra lại giá tại cửa hàng."
  }
  return error instanceof Error && !(error instanceof TypeError)
    ? error.message
    : "Chưa thể kết nối để đặt hàng. Giỏ hàng vẫn được lưu, bạn có thể thử lại."
}

export default function CartPage() {
  const { items, hydrated, updateQty, removeItem, removeItems } = useCart()
  const [selectedGroup, setSelectedGroup] = useState("")
  const [receipt, setReceipt] = useState<{ code: string; demo: boolean } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const submitLock = useRef(false)
  const groups = Map.groupBy(items, cartGroup)
  const group = groups.has(selectedGroup) ? selectedGroup : (groups.keys().next().value ?? "")
  const selectedItems = groups.get(group) ?? []
  const isDemo = group.startsWith("demo:")
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shippingFee = isDemo ? 120 : 30_000
  const formatTotal = (value: number) => isDemo ? formatPrice(value) : formatShopPrice(value, selectedItems[0]?.productId ?? "")

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedItems.length || submitLock.current) return

    const form = new FormData(event.currentTarget)
    const name = String(form.get("name") ?? "").trim()
    const phone = String(form.get("phone") ?? "").trim()
    const address = String(form.get("address") ?? "").trim()
    if (!name || !phone || !address) {
      setError("Vui lòng điền đủ họ tên, số điện thoại và địa chỉ giao hàng.")
      return
    }

    submitLock.current = true
    setSubmitting(true)
    setError("")
    try {
      let code: string
      if (isDemo) {
        const id = "ORD-" + crypto.randomUUID().slice(0, 8).toUpperCase()
        saveDemoOrder({ id, items: selectedItems, total: subtotal + shippingFee, name, address, demo: true, createdAt: new Date().toISOString() })
        code = id
      } else {
        const { data: carts } = await api.carts.list()
        const liveProducts = await Promise.all(selectedItems.map(({ productId }) => api.products.get(productId).then(({ data }) => data)))
        const museumId = liveProducts[0].museum_id
        if (liveProducts.some((product) => product.museum_id !== museumId)) {
          throw new Error("Đơn hàng chỉ gồm vật phẩm của một bảo tàng. Hãy bỏ sản phẩm khác bảo tàng khỏi nhóm này rồi đặt riêng.")
        }
        if (liveProducts.some((product, index) => product.stock_quantity < selectedItems[index].qty)) {
          throw new Error("Một vật phẩm không còn đủ hàng. Hãy giảm số lượng hoặc bỏ vật phẩm đó khỏi giỏ.")
        }
        if (liveProducts.some((product, index) => Number(product.price) !== selectedItems[index].price)) {
          throw new Error("Giá đã thay đổi. Hãy thêm lại vật phẩm từ cửa hàng để xem giá mới trước khi đặt.")
        }

        let serverCart = carts.find((cart) => cart.museum_id === museumId)
        if (!serverCart) {
          try {
            serverCart = (await api.carts.create(museumId)).data
          } catch (cause) {
            if (!(cause instanceof ApiClientError) || cause.status !== 409) throw cause
            serverCart = (await api.carts.list()).data.find((cart) => cart.museum_id === museumId)
            if (!serverCart) throw cause
          }
        }

        for (const saved of serverCart.items ?? []) {
          if (!selectedItems.some((item) => item.productId === saved.product_id)) {
            await api.carts.removeItem(serverCart.id, saved.id)
          }
        }
        for (const item of selectedItems) {
          const saved = serverCart.items?.find((row) => row.product_id === item.productId)
          if (!saved) await api.carts.addItem(serverCart.id, item.productId, item.qty)
          else if (saved.quantity !== item.qty) await api.carts.updateItem(serverCart.id, saved.id, item.qty)
        }

        const { data } = await api.carts.checkout(serverCart.id, {
          shipping_name: name,
          shipping_phone: phone,
          shipping_address: address,
        })
        code = data.invoice.invoice_number
      }

      removeItems(selectedItems.map(({ productId }) => productId))
      setReceipt({ code, demo: isDemo })
    } catch (cause) {
      setError(checkoutError(cause))
    } finally {
      setSubmitting(false)
      submitLock.current = false
    }
  }

  return (
    <div className="gallery-page">
      <GalleryMasthead label="Cửa hàng Smithsonian" title={<>Giỏ <em>hàng.</em></>} />
      <div className="gallery-wrap py-12 md:py-16">
        {receipt ? (
          <section className="gallery-sheet relative mx-auto max-w-2xl rounded-md p-7 text-center sm:p-12" aria-labelledby="receipt-heading">
            <RenaissanceCorners />
            <Check aria-hidden="true" className="mx-auto mb-5 size-10 text-[#77531c]" />
            <h2 id="receipt-heading" className="font-heading text-4xl">Đã xác nhận đơn hàng</h2>
            <p className="mt-4 text-stone-700">{receipt.demo ? "Mã đơn thử nghiệm" : "Số hóa đơn"}</p>
            <p className="mt-1 break-all font-mono text-xl font-semibold text-[#77531c]">{receipt.code}</p>
            <p className="mt-4 text-stone-700">Thanh toán mô phỏng đã hoàn tất.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link className="gallery-action" href="/tai-khoan?tab=orders">Xem lịch sử đơn hàng</Link>
              {items.length > 0
                ? <button onClick={() => setReceipt(null)} className="gallery-action gallery-action-muted">Về giỏ hàng</button>
                : <Link href="/cua-hang" className="gallery-action gallery-action-muted">Tiếp tục mua sắm</Link>}
            </div>
          </section>
        ) : !hydrated ? (
          <p role="status">Đang tải giỏ hàng…</p>
        ) : selectedItems.length === 0 ? (
          <section className="gallery-sheet relative mx-auto max-w-2xl rounded-md p-7 text-center sm:p-12">
            <RenaissanceCorners />
            <ShoppingBag aria-hidden="true" className="mx-auto mb-5 size-10 text-[#77531c]" />
            <h2 className="font-heading text-4xl">Giỏ hàng đang trống</h2>
            <Link className="gallery-action mt-6" href="/cua-hang">Khám phá quà lưu niệm</Link>
          </section>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(20rem,1fr)] lg:gap-12">
            <section aria-labelledby="cart-items-title">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="cart-items-title" className="font-heading text-4xl">Vật phẩm đã chọn</h2>
                <Link href="/cua-hang" className="text-sm font-semibold text-[#77531c] underline underline-offset-4">Tiếp tục mua sắm</Link>
              </div>
              {groups.size > 1 && (
                <label className="mt-5 grid gap-2 text-sm font-semibold">
                  Chọn giỏ để đặt theo bảo tàng
                  <select className="gallery-control px-3" value={group} disabled={submitting} onChange={(event) => {
                    setSelectedGroup(event.target.value)
                    setError("")
                  }}>
                    {Array.from(groups, ([key, lines]) => {
                      const museum = museumBySlug(key.slice(key.indexOf(":") + 1))
                      return <option key={key} value={key}>{museum?.name ?? "Bảo tàng Smithsonian"}{key.startsWith("demo:") ? " · Dữ liệu mẫu" : ""} · {lines.length} loại</option>
                    })}
                  </select>
                </label>
              )}
              <ul className="gallery-sheet mt-6 divide-y divide-[#e1d8c7] rounded-md px-4 sm:px-6">
                {selectedItems.map((item) => (
                  <li key={item.productId} className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-start gap-3 py-4 sm:grid-cols-[5rem_minmax(0,1fr)_auto] sm:gap-4">
                    <div className="relative aspect-square overflow-hidden rounded-sm bg-[#f7f4ec]">
                      <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />
                    </div>
                    <div>
                      <p className="break-words font-heading text-xl leading-tight">{item.name}</p>
                      <p className="mt-1 text-sm text-stone-700">{formatShopPrice(item.price, item.productId)} / món</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        <button type="button" disabled={submitting || item.qty <= 1} onClick={() => updateQty(item.productId, item.qty - 1)} className="gallery-icon-button" aria-label={"Giảm số lượng " + item.name}><Minus className="size-4" /></button>
                        <span className="w-7 text-center font-mono text-sm tabular-nums">{item.qty}</span>
                        <button type="button" disabled={submitting || item.qty >= (item.inventory ?? Infinity)} onClick={() => updateQty(item.productId, item.qty + 1)} className="gallery-icon-button" aria-label={"Tăng số lượng " + item.name}><Plus className="size-4" /></button>
                        <button type="button" disabled={submitting} onClick={() => removeItem(item.productId)} className="gallery-icon-button ml-1" aria-label={"Xóa " + item.name}><Trash2 className="size-4" /></button>
                      </div>
                    </div>
                    <p className="col-start-2 font-semibold text-[#77531c] sm:col-start-3">{formatShopPrice(item.price * item.qty, item.productId)}</p>
                  </li>
                ))}
              </ul>
            </section>
            <form onSubmit={submitOrder} className="gallery-sheet relative rounded-md p-5 sm:p-7 lg:sticky lg:top-24">
              <RenaissanceCorners />
              <h2 className="font-heading text-3xl">Giao hàng</h2>
              <fieldset disabled={submitting} className="mt-5 min-w-0 space-y-4">
                <label className="grid gap-1.5 text-sm font-semibold">
                  Họ và tên
                  <input name="name" autoComplete="name" required className="gallery-control w-full px-3 text-base font-normal" />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold">
                  Số điện thoại
                  <input name="phone" type="tel" autoComplete="tel" required className="gallery-control w-full px-3 text-base font-normal" />
                </label>
                <label className="grid gap-1.5 text-sm font-semibold">
                  Địa chỉ giao hàng
                  <textarea name="address" autoComplete="street-address" rows={2} required className="gallery-control w-full p-3 text-base font-normal" />
                </label>
              </fieldset>
              <dl className="mt-6 space-y-2 border-t border-[#e1d8c7] pt-4">
                <div className="flex justify-between gap-3"><dt>Tạm tính</dt><dd>{formatTotal(subtotal)}</dd></div>
                <div className="flex justify-between gap-3"><dt>Phí vận chuyển</dt><dd>{formatTotal(shippingFee)}</dd></div>
                <div className="flex flex-wrap justify-between gap-3 border-t border-[#e1d8c7] pt-3 text-lg font-semibold"><dt>Tổng thanh toán</dt><dd>{formatTotal(subtotal + shippingFee)}</dd></div>
              </dl>
              <p className="mt-3 text-sm text-stone-700">{isDemo ? "Giỏ dữ liệu mẫu · Thanh toán mô phỏng" : "Thanh toán mô phỏng"}</p>
              {error && <p role="alert" className="mt-4 rounded-sm border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">{error} {error.includes("đăng nhập") && <Link href="/dang-nhap" className="font-semibold underline">Đăng nhập</Link>}</p>}
              <StarBorder type="submit" disabled={submitting} className="mt-5 min-h-12 w-full bg-[#d4af37] disabled:opacity-60">
                {submitting ? "Đang xác nhận…" : "Xác nhận đặt hàng"}
              </StarBorder>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
