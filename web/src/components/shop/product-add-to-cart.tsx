"use client"

import { useEffect, useState } from "react"
import { Check, Minus, Plus, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/mock-data"
import { StarBorder } from "@/components/reactbits/star-border"

export function ProductAddToCart({ product }: { product: Product }) {
  const { addItem, items, hydrated } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const inCart = items.find((item) => item.productId === product.id)?.qty ?? 0
  const remaining = Math.max(0, product.inventory - inCart)
  const quantityToAdd = Math.min(quantity, remaining)

  useEffect(() => {
    if (!added) return
    const timer = window.setTimeout(() => setAdded(false), 1700)
    return () => window.clearTimeout(timer)
  }, [added])

  function handleAdd() {
    if (!quantityToAdd) return
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      museumSlug: product.museumSlug,
      inventory: product.inventory,
    }, quantityToAdd)
    setQuantity(1)
    setAdded(true)
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div aria-label="Số lượng" className="flex items-center">
          <button type="button" onClick={() => setQuantity(quantityToAdd - 1)} disabled={quantityToAdd <= 1}
            className="gallery-icon-button" aria-label="Giảm số lượng"><Minus className="size-4" /></button>
          <span className="w-10 text-center font-mono text-sm tabular-nums" aria-live="polite">{quantityToAdd}</span>
          <button type="button" onClick={() => setQuantity(quantityToAdd + 1)} disabled={quantityToAdd >= remaining}
            className="gallery-icon-button" aria-label="Tăng số lượng"><Plus className="size-4" /></button>
        </div>
        <StarBorder type="button" disabled={!hydrated || !quantityToAdd} onClick={handleAdd}
          className="min-h-11 min-w-40 grow bg-[#d4af37] disabled:opacity-50">
          <span className="inline-flex items-center gap-2">
            {added ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
            {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
          </span>
        </StarBorder>
      </div>
      <p className="mt-3 text-sm text-stone-700" aria-live="polite">
        {product.inventory ? "Còn " + product.inventory + " sản phẩm" : "Tạm hết hàng"}
        {inCart > 0 && " · " + inCart + " trong giỏ"}
      </p>
    </>
  )
}
