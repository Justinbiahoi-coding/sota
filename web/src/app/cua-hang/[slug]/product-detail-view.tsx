"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Landmark } from "lucide-react"
import { artifactById, type Product } from "@/lib/mock-data"
import { ProductAddToCart } from "@/components/shop/product-add-to-cart"
import { formatVndOrPrice } from "@/app/cua-hang/page"
import { api } from "@/lib/api/client"
import { BrassPlacardPin } from "@/components/renaissance/deco-assets"
import { cn } from "@/lib/utils"

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

const DB_TO_VI_SLUG: Record<string, string> = {
  "national-museum-of-natural-history": "lich-su-tu-nhien",
  "national-air-and-space-museum": "hang-khong-vu-tru",
  "national-museum-of-american-history": "lich-su-hoa-ky",
  "national-portrait-gallery": "phong-tranh-chan-dung",
  "hirshhorn-museum-and-sculpture-garden": "hirshhorn",
  "national-museum-of-asian-art": "nghe-thuat-chau-a",
}

export function ProductDetailView({
  slug,
  initialProduct,
}: {
  slug: string
  initialProduct: Product | null
}) {
  const [product, setProduct] = useState<Product | null>(initialProduct)

  useEffect(() => {
    let active = true
    async function loadLiveProduct() {
      try {
        const res = await api.products.get(slug)
        if (active && res?.data) {
          const p = res.data
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
            imageUrl = initialProduct?.image ?? "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80"
          }

          const text = `${p.name} ${p.sku ?? ""}`.toLowerCase()
          const category = text.includes("postcard") || text.includes("thiệp") || text.includes("print")
            ? "Postcard"
            : text.includes("book") || text.includes("sách")
              ? "Sách nghệ thuật"
              : text.includes("hoodie") || text.includes("shirt") || text.includes("lụa")
                ? "Thời trang"
                : "Lưu niệm"

          const resolvedMuseumSlug = initialProduct?.museumSlug ?? "lich-su-tu-nhien"

          setProduct({
            id: p.id,
            slug: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            image: imageUrl,
            inventory: p.stock_quantity ?? 0,
            museumSlug: resolvedMuseumSlug,
            inspiredByArtifactId: null,
            category,
            description: p.description ?? "Vật phẩm lưu niệm độc bản phát hành bởi Viện Smithsonian.",
          })
        }
      } catch {
        // Fallback remains active
      }
    }
    loadLiveProduct()
    return () => {
      active = false
    }
  }, [slug, initialProduct])

  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="font-heading text-3xl font-light text-foreground">Không tìm thấy sản phẩm</h1>
        <p className="mt-3 text-sm text-stone-400">Sản phẩm này có thể đã ngừng kinh doanh hoặc đường dẫn không tồn tại.</p>
        <div className="mt-6">
          <Link
            href="/cua-hang"
            className="inline-flex items-center gap-2 rounded-full border border-[#d4af37] bg-[#d4af37] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#08162b]"
          >
            Quay lại cửa hàng
          </Link>
        </div>
      </div>
    )
  }

  const viMuseumSlug = DB_TO_VI_SLUG[product.museumSlug] ?? product.museumSlug
  const museumName = MUSEUM_NAMES[viMuseumSlug] ?? MUSEUM_NAMES[product.museumSlug] ?? "Bảo tàng Smithsonian"
  const inspiredBy = product.inspiredByArtifactId ? artifactById(product.inspiredByArtifactId) : null

  return (
    <div className="mx-auto max-w-6xl px-5 pt-28 pb-16 md:px-8">
      {/* Breadcrumb back */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Link
          href="/cua-hang"
          className="placard text-stone-400 hover:text-[#fbe396] transition-colors"
        >
          Cửa hàng
        </Link>
        <span className="text-stone-600">/</span>
        <Link
          href={`/cua-hang?museum=${viMuseumSlug}`}
          className="placard text-[#fbe396] hover:underline"
        >
          {museumName}
        </Link>
        <span className="text-stone-600">/</span>
        <span className="text-stone-400 line-clamp-1 max-w-[240px]">{product.name}</span>
      </div>

      <div className="mt-6">
        <Link
          href={`/cua-hang?museum=${viMuseumSlug}`}
          className="placard inline-flex items-center gap-1.5 text-xs text-stone-300 hover:text-[#fbe396] transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Trở về Cửa hàng — {museumName}
        </Link>
      </div>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl border border-[#d4af37]/35 bg-stone-900 shadow-md">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            className="object-cover"
            sizes="(max-width:1024px) 100vw,50vw"
          />
        </div>

        {/* Details */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="placard inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-[#08162b] px-3.5 py-1 text-xs text-[#fbe396] font-medium">
              <BrassPlacardPin />
              {product.category}
            </span>

            <Link
              href={`/cua-hang?museum=${viMuseumSlug}`}
              className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-stone-300 hover:border-[#d4af37]/50 hover:text-[#fbe396] transition-colors"
            >
              <Landmark className="size-3 text-[#d4af37]" />
              <span>{museumName}</span>
            </Link>
          </div>

          <h1 className="mt-4 font-heading text-3xl font-light leading-snug text-[#f8f6f0] md:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 font-heading text-3xl text-[#fbe396] font-semibold">
            {formatVndOrPrice(product.price)}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs placard font-semibold",
                product.inventory > 0
                  ? "border border-emerald-500/40 bg-emerald-950/60 text-emerald-400"
                  : "border border-rose-500/40 bg-rose-950/60 text-rose-400"
              )}
            >
              {product.inventory > 0 ? `Còn hàng (${product.inventory} sản phẩm)` : "Tạm hết hàng"}
            </span>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-stone-300">{product.description}</p>

          {/* Museum attribution card */}
          <div className="mt-6 rounded-xl border border-white/10 bg-[#08162b]/80 p-4 shadow-sm backdrop-blur-md">
            <p className="placard text-[0.68rem] uppercase tracking-wider text-stone-400">
              Vật phẩm chính thức của bảo tàng
            </p>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Landmark className="size-4 text-[#d4af37]" />
                <span className="font-heading text-sm text-white">{museumName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Link
                  href={`/bao-tang/${viMuseumSlug}`}
                  className="text-[#d4af37] hover:underline"
                >
                  Tham quan bảo tàng →
                </Link>
                <span className="text-stone-600">|</span>
                <Link
                  href={`/cua-hang?museum=${viMuseumSlug}`}
                  className="text-[#d4af37] hover:underline"
                >
                  Cửa hàng bảo tàng →
                </Link>
              </div>
            </div>
          </div>

          {inspiredBy && (
            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="placard text-stone-400">Lấy cảm hứng từ hiện vật</p>
              <Link
                href={`/hien-vat/${inspiredBy.slug}`}
                className="mt-1.5 block text-sm italic text-[#fbe396] hover:underline"
              >
                {inspiredBy.title} — {inspiredBy.artist}
              </Link>
            </div>
          )}

          <div className="mt-8 pt-4 border-t border-white/10">
            <ProductAddToCart product={product} />
          </div>
        </div>
      </div>
    </div>
  )
}
