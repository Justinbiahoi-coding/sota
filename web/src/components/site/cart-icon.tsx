"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export function CartIcon() {
  const { totalQty } = useCart()
  return (
    <Link
      href="/gio-hang"
      className="group relative inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-200 transition-all duration-300 hover:border-[#d4af37]/60 hover:bg-white/10 hover:text-[#d4af37]"
      aria-label="Giỏ hàng"
    >
      <ShoppingBag className="size-[17px] transition-transform duration-300 group-hover:scale-110" />
      {totalQty > 0 && (
        <span className="absolute -right-1 -top-1 flex size-4.5 items-center justify-center rounded-full bg-[#d4af37] text-[0.62rem] font-bold text-[#08162b] shadow-[0_0_10px_rgba(212,175,55,0.7)] animate-pulse">
          {totalQty > 9 ? "9+" : totalQty}
        </span>
      )}
    </Link>
  )
}
