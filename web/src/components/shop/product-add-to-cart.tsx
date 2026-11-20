"use client"

import { useState } from "react"
import { Check, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function ProductAddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      })
    }
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className="mt-8 flex items-center gap-3">
        <div className="flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-foreground transition-colors active:scale-90"
            aria-label="Giảm"
          >
            −
          </button>
          <span className="w-10 text-center tabular-nums font-mono text-sm font-semibold">{qty}</span>
          <button
            onClick={() => setQty(Math.min(product.inventory, qty + 1))}
            className="flex size-9 items-center justify-center rounded-full hover:bg-muted text-foreground transition-colors active:scale-90"
            aria-label="Tăng"
          >
            +
          </button>
        </div>
        <button
          onClick={handleAdd}
          disabled={product.inventory === 0}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-full py-3 px-6 text-xs uppercase tracking-wider font-medium transition-all duration-300 active:scale-95 shadow-sm",
            added
              ? "border border-emerald-500 bg-emerald-50 text-emerald-800"
              : product.inventory === 0
                ? "cursor-not-allowed bg-muted text-muted-foreground opacity-50"
                : "bg-foreground text-background hover:bg-foreground/90 hover:shadow-md",
          )}
        >
          {added ? <Check className="size-4 text-emerald-600" /> : <ShoppingBag className="size-4" />}
          {added ? "Đã thêm vào giỏ!" : "Thêm vào giỏ hàng"}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        {product.inventory > 0 ? `Còn ${product.inventory} sản phẩm trong kho` : "Hết hàng"}
      </p>
    </>
  )
}
