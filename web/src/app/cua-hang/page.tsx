"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ShoppingBag, Check, LayoutGrid, Boxes } from "lucide-react"
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
  { label: "Tất cả vật phẩm", value: "all" },
  { label: "Bưu thiếp nghệ thuật", value: "Postcard" },
  { label: "Sách mỹ thuật & Nghiên cứu", value: "Sách nghệ thuật" },
  { label: "Mô hình & Cổ vật phục chế", value: "Lưu niệm" },
  { label: "Thời trang & Lụa cao cấp", value: "Thời trang" },
]

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

export default function ShopPage() {
  const [category, setCategory] = useState<ProductCategory | "all">("all")
  const [view, setView] = useState<"grid" | "gallery">("grid")
  const [liveProducts, setLiveProducts] = useState<Product[]>(initialMockProducts)

  useEffect(() => {
    let active = true
    async function loadLiveProducts() {
      try {
        const museumsRes = await api.museums.list({ limit: 20 })
        const museumList = museumsRes?.data ?? []
        if (museumList.length === 0) return

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
            setLiveProducts(mapped)
          }
        }
      } catch {
        // Graceful fallback to initialMockProducts
      }
    }
    loadLiveProducts()
    return () => {
      active = false
    }
  }, [])

  const filtered =
    category === "all" ? liveProducts : liveProducts.filter((p) => p.category === category)

  return (
    <div className="mx-auto max-w-[1560px] px-6 py-16 md:px-12 xl:px-16">
      <header className="mb-10 max-w-4xl">
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
        </div>
        <h1 className="mt-5 font-heading text-4xl font-light tracking-tight text-[#f8f6f0] sm:text-5xl md:text-6xl">
          <SplitText text="Quà lưu niệm & Sách nghệ thuật" delay={0.04} stagger={0.04} />
        </h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-stone-300">
          Bưu thiếp nghệ thuật in dập nổi, sách chuyên khảo mỹ thuật phục chế và các vật phẩm lưu niệm độc bản từ kho tàng bảo tàng Smithsonian.
        </p>
      </header>

      <RenaissanceDivider title="Bộ sưu tập lưu niệm" />

      {/* View toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setView("grid")}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs transition-all duration-300",
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
              "flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs transition-all duration-300",
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

      {/* 3D gallery view */}
      {view === "gallery" && (
        <Shop3DGallery products={liveProducts} />
      )}

      {/* Category filter + grid — only in grid view */}
      {view === "grid" && (
        <>
          <div className="mb-10 flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => (
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
                {cat.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white py-24 text-center shadow-sm">
              <RenaissanceCorners />
              <p className="font-heading text-2xl font-light text-stone-800">Không có sản phẩm nào trong danh mục này</p>
              <p className="mt-2 text-sm text-stone-500">Vui lòng chọn danh mục khác.</p>
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
