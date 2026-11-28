"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Landmark, Maximize2, X } from "lucide-react"
import { artifactById, type Product } from "@/lib/mock-data"
import { ProductAddToCart } from "@/components/shop/product-add-to-cart"
import { formatShopPrice, isLiveProduct } from "@/lib/shop-price"
import { api } from "@/lib/api/client"
import { RenaissanceCorners } from "@/components/renaissance/deco-assets"


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
  const [loading, setLoading] = useState(!initialProduct && isLiveProduct(slug))
  const dialog = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (!isLiveProduct(slug)) return
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
              const item = mediaRes.data.find((asset) => asset.media_type === "image" && asset.is_primary) ?? mediaRes.data.find((asset) => asset.media_type === "image")
              if (!item) throw new Error("No product image")
              if (item.storage_path.startsWith("http://") || item.storage_path.startsWith("https://")) {
                imageUrl = item.storage_path
              } else {
                const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://onauuvsjpnmjxqxeiuvy.supabase.co"
                imageUrl = `${base}/storage/v1/object/public/${item.storage_bucket}/${item.storage_path}`
              }
            }
          } catch {}

          if (!imageUrl) {
            imageUrl = initialProduct?.image ?? "/map-art-cua-hang.webp"
          }

          const text = `${p.name} ${p.sku ?? ""}`.toLowerCase()
          const category = text.includes("postcard") || text.includes("thiệp") || text.includes("print")
            ? "Postcard"
            : text.includes("book") || text.includes("sách")
              ? "Sách nghệ thuật"
              : text.includes("hoodie") || text.includes("shirt") || text.includes("lụa")
                ? "Thời trang"
                : "Lưu niệm"

          const museumList = await api.museums.list({ limit: 100 }).catch(() => null)
          const resolvedMuseumSlug = museumList?.data.find((museum) => museum.id === p.museum_id)?.slug
            ?? initialProduct?.museumSlug ?? ""
          if (!active) return

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
            description: p.description ?? "",
          })
        }
      } catch {
        // Keep any product data already available.
      } finally {
        if (active) setLoading(false)
      }
    }
    loadLiveProduct()
    return () => {
      active = false
    }
  }, [slug, initialProduct])

  if (!product) {
    return (
      <div className="gallery-page pt-32">
        <div className="gallery-wrap gallery-sheet rounded-md p-7 text-center sm:p-12">
          <h1 className="font-heading text-4xl">{loading ? "Đang tải vật phẩm…" : "Không tìm thấy vật phẩm"}</h1>
          {!loading && <Link href="/cua-hang" className="gallery-action mt-6">Về cửa hàng</Link>}
        </div>
      </div>
    )
  }

  const viMuseumSlug = DB_TO_VI_SLUG[product.museumSlug] ?? product.museumSlug
  const museumName = MUSEUM_NAMES[viMuseumSlug] ?? MUSEUM_NAMES[product.museumSlug] ?? "Bảo tàng Smithsonian"
  const inspiredBy = product.inspiredByArtifactId ? artifactById(product.inspiredByArtifactId) : null

  return (
    <section className="gallery-page pb-16 pt-28">
      <div className="gallery-wrap">
        <nav aria-label="Đường dẫn" className="mb-7 flex flex-wrap items-center gap-2 text-sm text-stone-700">
          <Link href="/cua-hang" className="font-semibold text-[#77531c] underline-offset-4 hover:underline">Cửa hàng</Link>
          {viMuseumSlug && (
            <>
              <span aria-hidden="true">/</span>
              <Link href={"/cua-hang?museum=" + viMuseumSlug} className="underline-offset-4 hover:underline">{museumName}</Link>
            </>
          )}
        </nav>
        <div className="grid items-center gap-8 lg:grid-cols-[1.08fr_1fr] lg:gap-16">
          <button
            type="button"
            aria-label="Phóng to ảnh sản phẩm"
            aria-haspopup="dialog"
            onClick={() => dialog.current?.showModal()}
            className="gallery-enter gallery-sheet group relative isolate block overflow-hidden rounded-t-[5rem] bg-[#ede4d2] p-2 sm:rounded-t-[8rem] sm:p-3"
          >
            <div className="relative aspect-[5/4] overflow-hidden rounded-t-[4.5rem] bg-[#efe8db] sm:rounded-t-[7.5rem]">
              <Image src={product.image} alt={product.name} fill priority sizes="(max-width: 1023px) 90vw, 45vw" className="object-contain transition-transform duration-500 motion-safe:group-hover:scale-[1.025]" />
            </div>
            <RenaissanceCorners />
            <span className="absolute bottom-5 right-5 flex size-11 items-center justify-center rounded-full border border-[#d4af37]/50 bg-[#08162b] text-white"><Maximize2 className="size-4" /></span>
          </button>

          <div className="gallery-enter">
            <p className="gallery-kicker">{product.category}</p>
            <h1 className="mt-4 break-words font-heading text-5xl leading-[.97] tracking-tight sm:text-6xl">{product.name}</h1>
            <p className="mt-5 font-heading text-3xl text-[#77531c]">{formatShopPrice(product.price, product.id)}</p>
            {product.description && <p className="mt-5 whitespace-pre-line text-base leading-relaxed text-stone-700">{product.description}</p>}
            <div className="mt-6 border-y border-[#e1d8c7] py-5">
              <ProductAddToCart product={product} />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
              <span className="flex items-center gap-2 font-semibold"><Landmark className="size-4 text-[#77531c]" />{museumName}</span>
              {viMuseumSlug && <Link href={"/bao-tang/" + viMuseumSlug} className="text-[#77531c] underline underline-offset-4">Tham quan bảo tàng</Link>}
            </div>
            {inspiredBy && (
              <p className="mt-4 text-sm text-stone-700">
                Lấy cảm hứng từ{" "}
                <Link href={"/tim-kiem?category=artifacts&q=" + encodeURIComponent(inspiredBy.title)} className="text-[#77531c] underline underline-offset-4">{inspiredBy.title}</Link>
              </p>
            )}
          </div>
        </div>
      </div>
      <dialog
        ref={dialog}
        aria-label="Ảnh sản phẩm"
        className="fixed inset-0 m-auto w-[min(92vw,64rem)] max-w-none overflow-visible rounded-md border border-[#d4af37]/40 bg-[#08162b] p-3 backdrop:bg-[#08162b]/80 sm:p-5"
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close() }}
      >
        <div className="relative h-[min(72dvh,48rem)]">
          <Image src={product.image} alt={product.name} fill sizes="90vw" className="object-contain" />
        </div>
        <button type="button" className="gallery-icon-button absolute right-3 top-3" aria-label="Đóng ảnh" onClick={() => dialog.current?.close()}><X className="size-5" /></button>
      </dialog>
    </section>
  )
}
