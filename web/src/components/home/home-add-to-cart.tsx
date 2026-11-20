"use client"

import { useState } from "react"
import { Check, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function HomeAddToCart({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handle() {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <button
      onClick={handle}
      disabled={product.inventory === 0}
      className={cn(
        "mt-3 flex items-center justify-center gap-1.5 rounded-full py-2 px-4 text-xs font-medium uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-sm",
        added
          ? "border border-emerald-500 bg-emerald-50 text-emerald-800"
          : product.inventory === 0
            ? "cursor-not-allowed border border-border opacity-40 text-muted-foreground"
            : "border border-foreground/30 bg-card text-foreground hover:bg-foreground hover:text-background",
      )}
    >
      {added ? <Check className="size-3 text-emerald-600" /> : <ShoppingBag className="size-3" />}
      {added ? "Đã thêm!" : "Thêm vào giỏ"}
    </button>
  )
}
