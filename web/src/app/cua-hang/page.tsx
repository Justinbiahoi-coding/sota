"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useMemo, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  ShoppingBag,
  Check,
  LayoutGrid,
  Boxes,
  Search,
  X,
  Loader2,
  ArrowUpDown,
  Landmark,
  ChevronDown,
} from "lucide-react"
import { useCart } from "@/lib/cart-context"
import {
  formatPrice,
  products as initialMockProducts,
  museums as mockMuseums,
  type Product,
  type ProductCategory,
} from "@/lib/mock-data"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { formatShopPrice } from "@/lib/shop-price"
import { GalleryMasthead } from "@/components/site/gallery-masthead"
import { MuseumButton } from "@/components/reactbits/museum-button"
import {
  BrassPlacardPin,
  RenaissanceCorners,
  GildedMuseumFrame,
} from "@/components/renaissance/deco-assets"
import { Shop3DGallery } from "@/components/shop/shop-gallery-3d"

const VI_TO_DB_SLUG: Record<string, string> = {
  "lich-su-tu-nhien": "national-museum-of-natural-history",
  "hang-khong-vu-tru": "national-air-and-space-museum",
  "lich-su-hoa-ky": "national-museum-of-american-history",
  "phong-tranh-chan-dung": "national-portrait-gallery",
  "hirshhorn": "hirshhorn-museum-and-sculpture-garden",
  "nghe-thuat-chau-a": "national-museum-of-asian-art",
}

const DB_TO_VI_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(VI_TO_DB_SLUG).map(([vi, db]) => [db, vi])
)

const MUSEUM_NAMES: Record<string, string> = {
  "lich-su-tu-nhien": "Bảo tàng Lịch sử Tự nhiên",
  "hang-khong-vu-tru": "Bảo tàng Hàng không & Vũ trụ",
  "lich-su-hoa-ky": "Bảo tàng Lịch sử Hoa Kỳ",
  "phong-tranh-chan-dung": "Phòng tranh Chân dung",
  "hirshhorn": "Vườn Điêu khắc Hirshhorn",
  "nghe-thuat-chau-a": "Bảo tàng Nghệ thuật Châu Á",
  "national-museum-of-natural-history": "Bảo tàng Lịch sử Tự nhiên",
  "national-air-and-space-museum": "Bảo tàng Hàng không & Vũ trụ",
  "national-museum-of-american-history": "Bảo tàng Lịch sử Hoa Kỳ",
  "national-portrait-gallery": "Phòng tranh Chân dung",
  "hirshhorn-museum-and-sculpture-garden": "Vườn Điêu khắc Hirshhorn",
  "national-museum-of-asian-art": "Bảo tàng Nghệ thuật Châu Á",
}

const MUSEUM_TABS: { label: string; slug: string }[] = [
  { label: "Tất cả bảo tàng", slug: "all" },
  { label: "Lịch sử Tự nhiên", slug: "lich-su-tu-nhien" },
  { label: "Hàng không & Vũ trụ", slug: "hang-khong-vu-tru" },
  { label: "Lịch sử Hoa Kỳ", slug: "lich-su-hoa-ky" },
  { label: "Phòng tranh Chân dung", slug: "phong-tranh-chan-dung" },
  { label: "Vườn Hirshhorn", slug: "hirshhorn" },
  { label: "Nghệ thuật Châu Á", slug: "nghe-thuat-chau-a" },
]

const CATEGORIES: { label: string; value: ProductCategory | "all" }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Bưu thiếp nghệ thuật", value: "Postcard" },
  { label: "Sách mỹ thuật & Nghiên cứu", value: "Sách nghệ thuật" },
  { label: "Mô hình & Cổ vật", value: "Lưu niệm" },
  { label: "Thời trang cao cấp", value: "Thời trang" },
]

// In-memory cache for instant switching between tabs
let cachedShopProducts: Product[] | null = null
const fetchedMediaIds = new Set<string>()
const cachedMediaUrls = new Map<string, string>()

function isUuid(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str)
}

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

function ProductCard({
  product,
  onSelectMuseum,
}: {
  product: Product
  onSelectMuseum?: (slug: string) => void
}) {
  const { addItem, items } = useCart()
  const available = product.inventory - (items.find((item) => item.productId === product.id)?.qty ?? 0)
  const [added, setAdded] = useState(false)

  function handleAdd() {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      museumSlug: product.museumSlug,
      inventory: product.inventory,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  const museumName = MUSEUM_NAMES[product.museumSlug] ?? "Bảo tàng Smithsonian"
  const viSlug = DB_TO_VI_SLUG[product.museumSlug] ?? product.museumSlug

  return (
    <div className="gallery-sheet group relative flex flex-col justify-between rounded-md p-3.5 transition-[transform,box-shadow] duration-300 hover:shadow-lg motion-safe:hover:-translate-y-0.5">
      <RenaissanceCorners />

      <div>
        <Link href={`/cua-hang/${product.slug}`}>
          <GildedMuseumFrame className="w-full">
            <div className="relative aspect-[5/4] w-full bg-[#efe7d6]">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025]"
                sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
                loading="lazy"
              />
            </div>
          </GildedMuseumFrame>
        </Link>

        <div className="pt-3">
          <div className="flex flex-wrap items-center justify-between gap-1 text-[0.65rem]">
            <div className="flex items-center gap-1">
              <BrassPlacardPin />
              <p className="placard text-stone-500 font-mono">{product.category}</p>
            </div>
            {product.museumSlug && (
              <button
                type="button"
                onClick={() => onSelectMuseum?.(viSlug)}
                title={`Lọc theo ${museumName}`}
                className="inline-flex items-center gap-1 rounded-md border border-[#d4af37]/40 bg-[#d4af37]/10 px-2 py-0.5 text-[0.62rem] font-medium text-[#92400e] hover:bg-[#d4af37] hover:text-[#08162b] transition-colors"
              >
                <Landmark className="size-2.5" />
                <span className="line-clamp-1 max-w-[110px]">{museumName}</span>
              </button>
            )}
          </div>

          <Link href={`/cua-hang/${product.slug}`}>
            <h3 className="mt-2 font-heading text-[1.3rem] leading-snug text-[#08162b] hover:text-[#77531c] transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="mt-2 font-heading text-lg font-semibold text-[#92400e]">
            {formatShopPrice(product.price, product.id)}
          </p>
        </div>
      </div>

      <div className="pt-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={available <= 0}
          className={cn(
            "flex w-full items-center justify-center gap-2 min-h-11 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
            added
              ? "border border-emerald-600 bg-emerald-50 text-emerald-700 shadow-sm"
              : product.inventory === 0
                ? "cursor-not-allowed border border-stone-200 opacity-40 text-stone-400"
                : "border border-[#d3c8b5] bg-[#f7f4ec] text-[#08162b] hover:border-[#08162b] hover:bg-[#08162b] hover:text-white",
          )}
        >
          {added ? <Check className="size-3.5 text-emerald-600" /> : <ShoppingBag className="size-3.5" />}
          {added ? "Đã vào giỏ!" : product.inventory === 0 ? "Hết hàng" : available <= 0 ? "Đã chọn hết số lượng" : "Thêm vào giỏ"}
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

const CHUNK_SIZE = 8 // Progressive load step

function ShopContent() {
  const searchParams = useSearchParams()
  const museumParam = searchParams.get("museum") ?? "all"
  const selectedMuseum = DB_TO_VI_SLUG[museumParam] ?? museumParam

  function setSelectedMuseum(slug: string) {
    const url = new URL(window.location.href)
    if (slug === "all") url.searchParams.delete("museum")
    else url.searchParams.set("museum", slug)
    window.history.replaceState(null, "", url)
  }
  const [category, setCategory] = useState<ProductCategory | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "name-asc">("default")
  const [view, setView] = useState<"grid" | "gallery">("grid")

  // Instant render: initialize with cached data or immediate mock products for ZERO wait time
  const [liveProducts, setLiveProducts] = useState<Product[]>(cachedShopProducts ?? initialMockProducts)
  const [isLoading, setIsLoading] = useState(!cachedShopProducts)

  // Progressive loading chunk limit
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Reset chunk count whenever filters change
  useEffect(() => {
    setVisibleCount(CHUNK_SIZE)
  }, [selectedMuseum, category, searchQuery, sortBy])

  // Non-blocking background loader: immediate display, fetch API in parallel
  useEffect(() => {
    let active = true

    async function loadLiveProducts() {
      try {
        const museumsRes = await api.museums.list({ limit: 20 })
        const museumList = museumsRes?.data ?? []
        if (museumList.length === 0) {
          if (active) setIsLoading(false)
          return
        }

        // Fetch products for all museums in parallel
        const productResponses = await Promise.all(
          museumList.map(async (m) => {
            try {
              const res = await api.museums.products(m.id)
              return (res?.data ?? []).map((p) => ({
                ...p,
                museumSlug: DB_TO_VI_SLUG[m.slug] ?? m.slug,
                museumDbSlug: m.slug,
              }))
            } catch {
              return []
            }
          })
        )

        const flatProducts = productResponses.flat()
        if (active && flatProducts.length > 0) {
          // Immediately map products with instant images
          const mapped: Product[] = flatProducts.map((p, idx) => {
            const initialMatch = initialMockProducts.find(
              (m) => m.name.toLowerCase() === p.name.toLowerCase() || m.id === p.id
            ) ?? initialMockProducts[idx % initialMockProducts.length]

            return {
              id: p.id,
              slug: p.id,
              name: p.name,
              price: Number(p.price) || 0,
              image:
                cachedMediaUrls.get(p.id) ??
                initialMatch?.image ??
                "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
              inventory: p.stock_quantity ?? 0,
              museumSlug: p.museumSlug,
              inspiredByArtifactId: null,
              category: deriveCategory(p.name, p.sku),
              description: p.description ?? "",
            }
          })

          cachedShopProducts = mapped
          setLiveProducts(mapped)
          setIsLoading(false)
        } else {
          setIsLoading(false)
        }
      } catch {
        if (active) setIsLoading(false)
      }
    }

    loadLiveProducts()
    return () => {
      active = false
    }
  }, [])

  // Filter products by selected museum, category, search, and sort
  const filtered = useMemo(() => {
    let list = liveProducts

    // Museum filtering (Bảo tàng -> Cửa hàng flow)
    if (selectedMuseum !== "all") {
      const dbSlug = VI_TO_DB_SLUG[selectedMuseum] ?? selectedMuseum
      list = list.filter(
        (p) =>
          p.museumSlug === selectedMuseum ||
          p.museumSlug === dbSlug ||
          DB_TO_VI_SLUG[p.museumSlug] === selectedMuseum
      )
    }

    // Category filter
    if (category !== "all") {
      list = list.filter((p) => p.category === category)
    }

    // Search query filter
    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (MUSEUM_NAMES[p.museumSlug] ?? "").toLowerCase().includes(q)
      )
    }

    // Sorting
    if (sortBy === "price-asc") {
      list = [...list].sort((a, b) => a.price - b.price)
    } else if (sortBy === "price-desc") {
      list = [...list].sort((a, b) => b.price - a.price)
    } else if (sortBy === "name-asc") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name, "vi"))
    }

    return list
  }, [liveProducts, selectedMuseum, category, searchQuery, sortBy])

  // Progressive slice of visible products
  const visibleProducts = useMemo(() => {
    return filtered.slice(0, visibleCount)
  }, [filtered, visibleCount])

  // Lazy media enrich: resolve live media URLs for currently visible products only
  useEffect(() => {
    let active = true
    const toFetch = visibleProducts.filter((p) => isUuid(p.id) && !fetchedMediaIds.has(p.id))
    if (toFetch.length === 0) return

    toFetch.forEach((p) => fetchedMediaIds.add(p.id))

    Promise.all(
      toFetch.map(async (item) => {
        try {
          const mediaRes = await api.media("souvenir", item.id)
          if (mediaRes?.data && mediaRes.data.length > 0) {
            const m = mediaRes.data[0]
            let img = m.storage_path
            if (!img.startsWith("http")) {
              const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://onauuvsjpnmjxqxeiuvy.supabase.co"
              img = `${base}/storage/v1/object/public/${m.storage_bucket}/${m.storage_path}`
            }
            cachedMediaUrls.set(item.id, img)
            return { id: item.id, image: img }
          }
        } catch {
          fetchedMediaIds.delete(item.id)
        }
        return null
      })
    ).then((updates) => {
      const valid = updates.filter((u): u is { id: string; image: string } => u !== null)
      if (!active || valid.length === 0) return
      const updateMap = new Map(valid.map((u) => [u.id, u.image]))
      setLiveProducts((prev) => {
        const next = prev.map((p) => (updateMap.has(p.id) ? { ...p, image: updateMap.get(p.id)! } : p))
        cachedShopProducts = next
        return next
      })
    })

    return () => {
      active = false
    }
  }, [visibleProducts])

  const hasMore = visibleCount < filtered.length

  // Infinite Scroll Observer: triggers next batch as user scrolls near bottom
  useEffect(() => {
    if (!hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + CHUNK_SIZE, filtered.length))
        }
      },
      { rootMargin: "300px" }
    )

    const target = loadMoreRef.current
    if (target) observer.observe(target)
    return () => {
      if (target) observer.unobserve(target)
    }
  }, [hasMore, filtered.length])

  // Count items per category under current museum
  const categoryCounts = useMemo(() => {
    const list = selectedMuseum === "all"
      ? liveProducts
      : liveProducts.filter(
          (p) =>
            p.museumSlug === selectedMuseum ||
            p.museumSlug === (VI_TO_DB_SLUG[selectedMuseum] ?? selectedMuseum) ||
            DB_TO_VI_SLUG[p.museumSlug] === selectedMuseum
        )

    const counts: Record<string, number> = { all: list.length }
    for (const p of list) {
      counts[p.category] = (counts[p.category] ?? 0) + 1
    }
    return counts
  }, [liveProducts, selectedMuseum])

  const museumName = MUSEUM_NAMES[selectedMuseum] ?? mockMuseums.find((m) => m.slug === selectedMuseum)?.name
  const filtersActive = Boolean(searchQuery || selectedMuseum !== "all" || category !== "all" || sortBy !== "default")

  function resetFilters() {
    setSearchQuery("")
    setCategory("all")
    setSortBy("default")
    setSelectedMuseum("all")
  }

  return (
    <div className="gallery-page">
      <GalleryMasthead
        label={museumName ?? "Cửa hàng Smithsonian"}
        title={<>Quà <em>lưu niệm.</em></>}
        description="Bưu thiếp, sách nghệ thuật và vật phẩm từ các bộ sưu tập Smithsonian."
        image="/map-art-cua-hang.webp"
      >
        <div className="mt-7 flex flex-wrap gap-3">
          <MuseumButton href="#bo-suu-tap" variant="primary" size="md">Xem sản phẩm</MuseumButton>
          {museumName && (
            <MuseumButton href={"/bao-tang/" + selectedMuseum} variant="outline" size="md">
              Về bảo tàng
            </MuseumButton>
          )}
        </div>
      </GalleryMasthead>

      <section id="bo-suu-tap" className="gallery-wrap scroll-mt-24 py-12 md:py-16" aria-labelledby="catalog-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 id="catalog-title" className="font-heading text-4xl font-normal tracking-tight md:text-5xl">Danh mục lưu niệm</h2>
          <label className="grid w-full gap-1.5 text-sm font-semibold sm:w-auto">
            Bảo tàng
            <select
              value={selectedMuseum}
              onChange={(event) => setSelectedMuseum(event.target.value)}
              className="gallery-control w-full px-3 sm:min-w-56"
            >
              {MUSEUM_TABS.map(({ slug, label }) => <option key={slug} value={slug}>{label}</option>)}
              {!MUSEUM_TABS.some(({ slug }) => slug === selectedMuseum) && <option value={selectedMuseum}>{museumName ?? "Bảo tàng đã chọn"}</option>}
            </select>
          </label>
        </div>

      {/* Controls: Search Bar & View Switch */}
      <div className="gallery-sheet mb-5 flex flex-wrap items-center justify-between gap-4 rounded-md p-4">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Tìm quà lưu niệm"
            placeholder="Tìm theo tên vật phẩm…"
            className="gallery-control w-full pl-10 pr-10 text-base placeholder:text-stone-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              aria-label="Xóa từ khóa"
              className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-stone-600 hover:text-[#08162b]"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* View toggle & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Selector */}
          <div className="gallery-control flex items-center gap-2 px-3 text-sm">
            <ArrowUpDown className="size-3 text-[#d4af37]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sắp xếp sản phẩm"
              className="bg-white text-sm"
            >
              <option value="default" >Mặc định</option>
              <option value="price-asc" >Giá: Thấp đến Cao</option>
              <option value="price-desc" >Giá: Cao đến Thấp</option>
              <option value="name-asc" >Tên: A-Z</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex gap-1.5">
            <button
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              className={cn(
                "flex items-center gap-1.5 min-h-11 rounded-md border px-3 py-2 text-sm transition-colors",
                view === "grid"
                  ? "border-[#08162b] bg-[#08162b] text-[#f7f4ec] font-semibold"
                  : "border-[#d3c8b5] bg-white text-[#08162b] hover:border-[#967331]"
              )}
            >
              <LayoutGrid className="size-3.5" />
              Danh sách
            </button>
            <button
              onClick={() => setView("gallery")}
              aria-pressed={view === "gallery"}
              className={cn(
                "flex items-center gap-1.5 min-h-11 rounded-md border px-3 py-2 text-sm transition-colors",
                view === "gallery"
                  ? "border-[#08162b] bg-[#08162b] text-[#f7f4ec] font-semibold"
                  : "border-[#d3c8b5] bg-white text-[#08162b] hover:border-[#967331]"
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

      {/* Grid view with Progressive Loading */}
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
                  aria-pressed={category === cat.value}
                  className={cn(
                    "min-h-11 rounded-full border px-4 py-2 text-sm transition-colors font-medium",
                    category === cat.value
                      ? "border-[#08162b] bg-[#08162b] text-[#f7f4ec] font-semibold"
                      : "border-[#d3c8b5] bg-white text-[#08162b] hover:border-[#967331]"
                  )}
                >
                  {cat.label} {count > 0 && `(${count})`}
                </button>
              )
            })}
          </div>

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-700">
            <p aria-live="polite">{isLoading ? "Đang tải danh mục…" : `Hiển thị ${visibleProducts.length} / ${filtered.length} vật phẩm`}</p>
            {filtersActive && (
              <button type="button" onClick={resetFilters} className="min-h-11 text-[#77531c] underline underline-offset-4">
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Skeletons while initial loading */}
          {isLoading && !cachedShopProducts ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
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
                  : "Không có vật phẩm nào trong bảo tàng hoặc danh mục đã chọn."}
              </p>
              {(searchQuery || category !== "all" || selectedMuseum !== "all") && (
                <button
                  onClick={resetFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#d4af37] bg-[#d4af37] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#08162b] shadow-sm hover:bg-[#e0be47]"
                >
                  Xem tất cả vật phẩm
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-6">
                {visibleProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelectMuseum={(slug) => setSelectedMuseum(slug)}
                  />
                ))}
              </div>

              {/* Progressive Load Trigger / Sentinel */}
              <div
                ref={loadMoreRef}
                className="mt-12 flex flex-col items-center justify-center gap-3 py-6 text-xs text-stone-400"
              >
                {hasMore ? (
                  <>
                    <div className="flex items-center gap-2 text-stone-300">
                      <Loader2 className="size-4 animate-spin text-[#d4af37]" />
                      <span>Cuộn xuống để tải thêm hoặc nhấn nút bên dưới...</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVisibleCount((prev) => Math.min(prev + CHUNK_SIZE, filtered.length))}
                      className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#08162b]/90 px-6 py-2.5 text-xs font-medium text-[#fbe396] shadow-md hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#08162b] transition-all"
                    >
                      <ChevronDown className="size-3.5" />
                      Tải thêm {Math.min(CHUNK_SIZE, filtered.length - visibleCount)} vật phẩm ({visibleCount}/{filtered.length})
                    </button>
                  </>
                ) : (
                  <p className="placard text-[0.72rem] tracking-wider text-stone-500 font-mono">
                    ✦ Đã hiển thị toàn bộ {filtered.length} vật phẩm của cửa hàng
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
      </section>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1560px] px-6 pt-28 pb-16 md:px-12 text-center">
          <p className="font-heading text-2xl text-stone-400">Đang tải cửa hàng quà lưu niệm...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}
