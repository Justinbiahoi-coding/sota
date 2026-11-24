"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { ShoppingBag, Check, LayoutGrid, Boxes, Search, X, Loader2, ArrowUpDown } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { formatPrice, products as initialMockProducts, type Product, type ProductCategory } from "@/lib/mock-data"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { SplitText } from "@/components/reactbits/split-text"
import { DecryptedText } from "@/components/reactbits/decrypted-text"
import {
  BrassPlacardPin,
  RenaissanceCorners,
  RenaissanceDivider,
  GildedMuseumFrame,
} from "@/components/renaissance/deco-assets"
import { Shop3DGallery } from "@/components/shop/shop-gallery-3d"

const CATEGORIES: { label: string; value: ProductCategory | "all" }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Bưu thiếp nghệ thuật", value: "Postcard" },
  { label: "Sách mỹ thuật & Nghiên cứu", value: "Sách nghệ thuật" },
  { label: "Mô hình & Cổ vật", value: "Lưu niệm" },
  { label: "Thời trang cao cấp", value: "Thời trang" },
]

// In-memory module cache so switching tabs or revisiting /cua-hang is immediate
let cachedShopProducts: Product[] | null = null

export function formatVndOrPrice(centsOrAmount: number | string, free = "Miễn phí") {
  const num = typeof centsOrAmount === "string" ? parseFloat(centsOrAmount) : centsOrAmount
  if (isNaN(num) || num === 0) return free
  if (num >= 1000) return `${Math.round(num).toLocaleString("vi-VN")}₫`
  return formatPrice(num, free)
}

function deriveCategory(name: string, sku?: string | null): ProductCategory {
  const text = `${name} ${sku ?? ""}`.toLowerCase()
  if (text.includes("postcard") || text.includes("thiệp") || text.includes("bưu thiếp") || text.includes("print") || text.includes("card")) {
    return "Postcard"
  }
  if (text.includes("book") || text.includes("sách") || text.includes("guide") || text.includes("chuyên khảo") || text.includes("tạp chí")) {
    return "Sách nghệ thuật"
  }
  if (text.includes("hoodie") || text.includes("shirt") || text.includes("sweatshirt") || text.includes("pullover") || text.includes("silk") || text.includes("lụa") || text.includes("áo") || text.includes("t-shirt") || text.includes("apparel") || text.includes("tote")) {
    return "Thời trang"
  }
  return "Lưu niệm"
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#d4af37]/35 bg-white p-3.5 shadow-md transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_12px_32px_-8px_rgba(212,175,55,0.3)]">
      <RenaissanceCorners />

      <div>
        <Link href={`/cua-hang/${product.slug}`}>
          <GildedMuseumFrame className="w-full">
            <div className="relative aspect-square w-full bg-stone-900">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
              />
            </div>
          </GildedMuseumFrame>
        </Link>

        <div className="pt-3">
          <div className="flex items-center gap-1.5">
            <BrassPlacardPin />
            <p className="placard text-[0.65rem] text-stone-500 font-mono">{product.category}</p>
          </div>
          <Link href={`/cua-hang/${product.slug}`}>
            <h3 className="mt-1 font-heading text-base font-light italic leading-snug text-[#171717] hover:text-[#92400e] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="mt-2 font-heading text-lg font-semibold text-[#92400e]">{formatVndOrPrice(product.price)}</p>
        </div>
      </div>

      <div className="pt-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={product.inventory === 0}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-full py-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 active:scale-95",
            added
              ? "border border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
              : product.inventory === 0
                ? "cursor-not-allowed border border-stone-200 opacity-40 text-stone-400"
                : "border border-stone-300 bg-stone-50 text-stone-800 shadow-sm hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#08162b]",
          )}
        >
          {added ? <Check className="size-3.5 text-emerald-600" /> : <ShoppingBag className="size-3.5" />}
          {added ? "Đã vào giỏ!" : product.inventory === 0 ? "Hết hàng" : "Thêm vào giỏ"}
        </button>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="relative flex flex-col justify-between rounded-xl border border-[#d4af37]/20 bg-white/70 p-3.5 shadow-sm animate-pulse">
      <RenaissanceCorners />
      <div>
        <div className="relative aspect-square w-full rounded-md bg-stone-200/80" />
        <div className="pt-3 space-y-2">
          <div className="h-3 w-1/3 rounded bg-stone-200" />
          <div className="h-4 w-3/4 rounded bg-stone-200" />
          <div className="h-5 w-1/2 rounded bg-stone-200" />
        </div>
      </div>
      <div className="pt-3">
        <div className="h-8 w-full rounded-full bg-stone-200" />
      </div>
    </div>
  )
}

export default function ShopPage() {
  const [category, setCategory] = useState<ProductCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name-asc">("default")
  const [view, setView] = useState<"grid" | "gallery">("grid")
  const [liveProducts, setLiveProducts] = useState<Product[]>(cachedShopProducts ?? initialMockProducts)
  const [isLoading, setIsLoading] = useState(!cachedShopProducts)

  useEffect(() => {
    let active = true

    async function loadLiveProducts() {
      if (!cachedShopProducts) {
        setIsLoading(true)
      }

      try {
        const museumsRes = await api.museums.list({ limit: 20 })
        const museumList = museumsRes?.data ?? []
        if (museumList.length === 0) {
          if (active) setIsLoading(false)
          return
        }

        const productResponses = await Promise.all(
          museumList.map(async (m) => {
            try {
              const res = await api.museums.products(m.id)
              return (res?.data ?? []).map((p) => ({ ...p, museumSlug: m.slug }))
            } catch {
              return []
            }
          })
        )

        const flatProducts = productResponses.flat()
        if (active && flatProducts.length > 0) {
          const mapped: Product[] = await Promise.all(
            flatProducts.map(async (p, idx) => {
              let imageUrl = ""
              try {
                const mediaRes = await api.media("souvenir", p.id)
                if (mediaRes?.data && mediaRes.data.length > 0) {
                  const item = mediaRes.data[0]
                  if (item.storage_path.startsWith("http://") || item.storage_path.startsWith("https://")) {
                    imageUrl = item.storage_path
                  } else {
                    const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://onauuvsjpnmjxqxeiuvy.supabase.co"
                    imageUrl = `${base}/storage/v1/object/public/${item.storage_bucket}/${item.storage_path}`
                  }
                }
              } catch {}

              if (!imageUrl) {
                const mockMatch = initialMockProducts[idx % initialMockProducts.length]
                imageUrl = mockMatch?.image ?? "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"
              }

              return {
                id: p.id,
                slug: p.id,
                name: p.name,
                price: Number(p.price) || 0,
                image: imageUrl,
                inventory: p.stock_quantity ?? 0,
                museumSlug: p.museumSlug,
                inspiredByArtifactId: null,
                category: deriveCategory(p.name, p.sku),
                description: p.description ?? "",
              }
            })
          )

          if (active && mapped.length > 0) {
            cachedShopProducts = mapped
            setLiveProducts(mapped)
          }
        }
      } catch {
        // Fallback remains initialMockProducts
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadLiveProducts()
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    let list = liveProducts

    if (category !== "all") {
      list = list.filter((p) => p.category === category)
    }

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
    }

    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price)
    } else if (sortBy === "name-asc") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "vi"))
    }

    return list
  }, [liveProducts, category, searchQuery, sortBy])

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: liveProducts.length }
    for (const p of liveProducts) {
      counts[p.category] = (counts[p.category] ?? 0) + 1
    }
    return counts
  }, [liveProducts])

  return (
    <div className="mx-auto max-w-[1560px] px-6 pt-28 pb-16 md:px-12 xl:px-16">
      <header className="mb-8 max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/45 bg-[#08162b]/90 px-4 py-1.5 shadow-md backdrop-blur-md">
          <BrassPlacardPin />
          <span className="placard text-[0.68rem] tracking-wider text-[#fbe396]">
            <DecryptedText
              text="Smithsonian Boutique · Ấn bản giới hạn"
              speed={28}
              maxIterations={12}
              animateOn="view"
            />
          </span>
          {isLoading && <Loader2 className="ml-2 size-3 animate-spin text-[#d4af37]" />}
        </div>
        <h1 className="mt-5 font-heading text-4xl font-light tracking-tight text-[#f8f6f0] sm:text-5xl md:text-6xl">
          <SplitText text="Quà lưu niệm & Sách nghệ thuật" delay={0.04} stagger={0.04} />
        </h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-stone-300">
          Bưu thiếp nghệ thuật in dập nổi, sách chuyên khảo mỹ thuật phục chế và các vật phẩm lưu niệm độc bản từ kho tàng bảo tàng Smithsonian.
        </p>
      </header>

      <RenaissanceDivider title="Bộ sưu tập lưu niệm" />

      {/* Controls: Search Bar & View Switch */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bưu thiếp, sách, áo, quà lưu niệm..."
            className="h-11 w-full rounded-full border border-white/20 bg-[#08162b]/80 pl-11 pr-10 text-sm text-[#f8f6f0] placeholder:text-stone-400 shadow-sm backdrop-blur-md outline-none transition-all focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* View toggle & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-[#08162b]/80 px-3 py-1.5 text-xs text-stone-300 shadow-sm">
            <ArrowUpDown className="size-3 text-[#d4af37]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-stone-200 outline-none cursor-pointer"
            >
              <option value="default" className="bg-[#08162b] text-white">Mặc định</option>
              <option value="price-asc" className="bg-[#08162b] text-white">Giá: Thấp đến Cao</option>
              <option value="price-desc" className="bg-[#08162b] text-white">Giá: Cao đến Thấp</option>
              <option value="name-asc" className="bg-[#08162b] text-white">Tên: A-Z</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-all duration-300",
                view === "grid"
                  ? "border-[#d4af37] bg-[#d4af37] text-[#08162b] font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                  : "border-white/15 bg-[#08162b]/80 text-stone-300 hover:border-[#d4af37]/60 hover:text-[#fbe396]",
              )}
            >
              <LayoutGrid className="size-3.5" />
              Danh sách
            </button>
            <button
              onClick={() => setView("gallery")}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs transition-all duration-300",
                view === "gallery"
                  ? "border-[#d4af37] bg-[#d4af37] text-[#08162b] font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                  : "border-white/15 bg-[#08162b]/80 text-stone-300 hover:border-[#d4af37]/60 hover:text-[#fbe396]",
              )}
            >
              <Boxes className="size-3.5" />
              Phòng trưng bày 3D
            </button>
          </div>
        </div>
      </div>

      {/* 3D gallery view */}
      {view === "gallery" && (
        <Shop3DGallery products={filtered} />
      )}

      {/* Grid view */}
      {view === "grid" && (
        <>
          {/* Category filter pills */}
          <div className="mb-8 flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.value] ?? 0
              return (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "placard rounded-full border px-4 py-2 text-xs transition-all duration-300 font-medium",
                    category === cat.value
                      ? "border-[#d4af37] bg-[#d4af37] text-[#08162b] font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                      : "border-white/15 bg-[#08162b]/80 text-stone-300 hover:border-[#d4af37]/60 hover:text-[#fbe396]",
                  )}
                >
                  {cat.label} {count > 0 && `(${count})`}
                </button>
              )
            })}
          </div>

          {/* Results stats */}
          <div className="mb-6 flex items-center justify-between text-xs text-stone-400">
            <span>
              Hiển thị <strong className="text-[#fbe396] font-mono">{filtered.length}</strong> vật phẩm
              {searchQuery && <span> cho &ldquo;{searchQuery}&rdquo;</span>}
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[#d4af37] hover:underline"
              >
                Xóa từ khóa
              </button>
            )}
          </div>

          {/* Skeletons while initial loading */}
          {isLoading && !cachedShopProducts ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white py-24 text-center shadow-sm">
              <RenaissanceCorners />
              <p className="font-heading text-2xl font-light text-stone-800">
                Không tìm thấy vật phẩm nào phù hợp
              </p>
              <p className="mt-2 text-sm text-stone-500">
                {searchQuery
                  ? `Không có kết quả cho từ khóa "${searchQuery}". Vui lòng thử từ khóa khác.`
                  : "Vui lòng chọn danh mục khác."}
              </p>
              {(searchQuery || category !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setCategory("all")
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d4af37] bg-[#d4af37] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#08162b] shadow-sm hover:bg-[#e0be47]"
                >
                  Xem tất cả vật phẩm
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
