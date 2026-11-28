"use client"

import React, { createContext, useCallback, useContext, useEffect, useState } from "react"

export type CartItem = {
  productId: string
  name: string
  price: number // cents or VND
  image: string
  qty: number
  museumSlug?: string
  inventory?: number
}

type CartContextValue = {
  items: CartItem[]
  totalQty: number
  totalCents: number
  hydrated: boolean
  addItem: (item: Omit<CartItem, "qty">, quantity?: number) => void
  removeItem: (productId: string) => void
  removeItems: (productIds: string[]) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "sota_cart"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage once on client
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }
    } catch {}
    setHydrated(true)
  }, [])

  // Persist on every change only after initial hydration completes
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items, hydrated])

  const addItem = useCallback((item: Omit<CartItem, "qty">, quantity = 1) => {
    if (quantity <= 0 || item.inventory === 0) return
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId)
      const qty = Math.min((existing?.qty ?? 0) + quantity, item.inventory ?? Infinity)
      return existing
        ? prev.map((i) => (i.productId === item.productId ? { ...i, ...item, qty } : i))
        : [...prev, { ...item, qty }]
    })
  }, [])

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }, [])

  const removeItems = useCallback((productIds: string[]) => {
    setItems((prev) => prev.filter((i) => !productIds.includes(i.productId)))
  }, [])

  const updateQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.productId !== productId))
    } else {
      setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, qty: Math.min(qty, i.inventory ?? Infinity) } : i)))
    }
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const totalQty = items.reduce((s, i) => s + i.qty, 0)
  const totalCents = items.reduce((s, i) => s + i.price * i.qty, 0)

  return (
    <CartContext.Provider value={{ items, totalQty, totalCents, hydrated, addItem, removeItem, removeItems, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
