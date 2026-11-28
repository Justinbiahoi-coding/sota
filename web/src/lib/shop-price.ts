import { formatPrice } from "@/lib/mock-data"

export function isLiveProduct(id: string) {
  return /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)
}

export function formatShopPrice(amount: number, productId: string) {
  return isLiveProduct(productId)
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount)
    : formatPrice(amount)
}
