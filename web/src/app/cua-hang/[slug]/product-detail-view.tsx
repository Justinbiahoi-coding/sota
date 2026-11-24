"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { artifactById, type Product } from "@/lib/mock-data"
import { ProductAddToCart } from "@/components/shop/product-add-to-cart"
import { formatVndOrPrice } from "@/app/cua-hang/page"
import { api } from "@/lib/api/client"
import { BrassPlacardPin } from "@/components/renaissance/deco-assets"
import { cn } from "@/lib/utils"

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

          setProduct({
            id: p.id,
            slug: p.id,
            name: p.name,
            price: Number(p.price) || 0,
            image: imageUrl,
            inventory: p.stock_quantity ?? 0,
            museumSlug: "smithsonian",
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

  const inspiredBy = product.inspiredByArtifactId ? artifactById(product.inspiredByArtifactId) : null

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8">
      <Link
        href="/cua-hang"
        className="placard inline-flex items-center gap-1.5 text-stone-300 hover:text-[#fbe396] transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Trở về Cửa hàng
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
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
          <span className="placard inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/40 bg-[#08162b] px-3.5 py-1 text-xs text-[#fbe396] font-medium">
            <BrassPlacardPin />
            {product.category}
          </span>
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

          {inspiredBy && (
            <div className="mt-8 border-t border-white/10 pt-5">
              <p className="placard text-stone-400">Lấy cảm hứng từ</p>
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

