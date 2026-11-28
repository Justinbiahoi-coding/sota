"use client"

import Image from "next/image"
import Link from "next/link"
import { useRef, useSyncExternalStore } from "react"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatShopPrice } from "@/lib/shop-price"

const subscribe = () => () => {}

export function CartIcon() {
  const cart = useCart()
  const ready = useSyncExternalStore(subscribe, () => true, () => false)
  const items = ready ? cart.items : []
  const totalQty = ready ? cart.totalQty : 0
  const drawer = useRef<HTMLDialogElement>(null)

  return (
    <>
      <button
        type="button"
        className="group relative inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/25 bg-white/5 text-stone-200 transition-colors hover:border-[#d4af37] hover:text-[#f2d790]"
        aria-label={totalQty ? "Giỏ hàng, " + totalQty + " vật phẩm" : "Giỏ hàng"}
        aria-haspopup="dialog"
        onClick={() => drawer.current?.showModal()}
      >
        <ShoppingBag className="size-[18px]" />
        {totalQty > 0 && (
          <span aria-hidden="true" className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[#d4af37] px-1 py-0.5 text-xs font-bold text-[#08162b]">
            {totalQty > 99 ? "99+" : totalQty}
          </span>
        )}
      </button>
      <dialog
        ref={drawer}
        aria-label="Xem nhanh giỏ hàng"
        className="gallery-page gallery-drawer fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-md border-l border-[#d4af37]/50 p-0 shadow-2xl backdrop:bg-[#08162b]/65"
        onClick={(event) => { if (event.target === event.currentTarget) drawer.current?.close() }}
      >
        <div className="flex h-full flex-col p-5 sm:p-7">
          <header className="flex items-start justify-between gap-3 border-b border-[#e1d8c7] pb-4">
            <div>
              <h2 className="font-heading text-4xl">Giỏ hàng</h2>
              <p className="mt-1 text-sm text-stone-700">{totalQty} vật phẩm</p>
            </div>
            <button type="button" className="gallery-icon-button" aria-label="Đóng giỏ hàng" onClick={() => drawer.current?.close()}><X className="size-5" /></button>
          </header>
          {items.length > 0 ? (
            <ul className="flex-1 divide-y divide-[#e1d8c7] overflow-y-auto">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 py-4">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-sm bg-[#eadfcb]">
                    <Image src={item.image} alt="" fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-heading text-xl leading-tight">{item.name}</p>
                    <p className="mt-1 text-sm text-stone-700">{item.qty} × {formatShopPrice(item.price, item.productId)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button type="button" onClick={() => cart.updateQty(item.productId, item.qty - 1)} disabled={item.qty <= 1} className="gallery-icon-button" aria-label={"Giảm số lượng " + item.name}><Minus className="size-4" /></button>
                      <button type="button" onClick={() => cart.updateQty(item.productId, item.qty + 1)} disabled={item.qty >= (item.inventory ?? Infinity)} className="gallery-icon-button" aria-label={"Tăng số lượng " + item.name}><Plus className="size-4" /></button>
                      <button type="button" onClick={() => cart.removeItem(item.productId)} className="gallery-icon-button" aria-label={"Xóa " + item.name}><Trash2 className="size-4" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="flex-1 pt-6 text-stone-700">{ready && cart.hydrated ? "Bạn chưa thêm vật phẩm nào." : "Đang tải giỏ hàng…"}</p>}
          <Link href={items.length ? "/gio-hang" : "/cua-hang"} onClick={() => drawer.current?.close()} className="gallery-action mt-4 w-full">
            {items.length ? "Xem giỏ hàng và đặt hàng" : "Xem quà lưu niệm"}
          </Link>
        </div>
      </dialog>
    </>
  )
}
