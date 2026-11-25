"use client"

import { useState, useTransition, useMemo, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, ArrowUpRight, Loader2 } from "lucide-react"
import {
  artifacts as initialMockArtifacts,
  exhibitions as initialMockExhibitions,
  museums as initialMockMuseums,
  products as initialMockProducts,
  museumBySlug,
  type Museum,
  type Artifact,
  type Exhibition,
  type Product,
  type ProductCategory,
} from "@/lib/mock-data"
import { api } from "@/lib/api/client"
import { cn } from "@/lib/utils"
import { SpotlightCard } from "@/components/reactbits/spotlight-card"
import { BlurText } from "@/components/reactbits/blur-text"
import { BrassPlacardPin } from "@/components/renaissance/deco-assets"
import { DecryptedText } from "@/components/reactbits/decrypted-text"

const DB_TO_VI_SLUG: Record<string, string> = {
  "national-museum-of-natural-history": "lich-su-tu-nhien",
  "national-air-and-space-museum": "hang-khong-vu-tru",
  "national-museum-of-american-history": "lich-su-hoa-ky",
  "national-portrait-gallery": "phong-tranh-chan-dung",
  "hirshhorn-museum-and-sculpture-garden": "hirshhorn",
  "national-museum-of-asian-art": "nghe-thuat-chau-a",
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

function formatVndOrPrice(centsOrAmount: number | string, free = "Miễn phí") {
  const num = typeof centsOrAmount === "string" ? parseFloat(centsOrAmount) : centsOrAmount
  if (isNaN(num) || num === 0) return free
  if (num >= 1000) return `${Math.round(num).toLocaleString("vi-VN")}₫`
  return `${(num / 100).toFixed(2)}$`
}

type Category = "all" | "artifacts" | "exhibitions" | "museums" | "products"

const VALID_CATEGORIES = new Set<Category>(["all", "artifacts", "exhibitions", "museums", "products"])

function SearchContent() {
  const searchParams = useSearchParams()
  const rawCategory = searchParams.get("category") as Category | null
  const initialCategory = rawCategory && VALID_CATEGORIES.has(rawCategory) ? rawCategory : "all"
  const initialQuery = searchParams.get("q") ?? ""

  return (
    <SearchContentInner
      key={`${initialCategory}:${initialQuery}`}
      initialCategory={initialCategory}
      initialQuery={initialQuery}
    />
  )
}

function SearchContentInner({
  initialCategory,
  initialQuery,
}: {
  initialCategory: Category
  initialQuery: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<Category>(initialCategory)
  const [, startTransition] = useTransition()

  const [liveMuseums, setLiveMuseums] = useState<Museum[]>(initialMockMuseums)
  const [liveArtifacts, setLiveArtifacts] = useState<Artifact[]>(initialMockArtifacts)
  const [liveProducts, setLiveProducts] = useState<Product[]>(initialMockProducts)
  const [liveExhibitions] = useState<Exhibition[]>(initialMockExhibitions)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let active = true
    async function loadData() {
      setIsLoading(true)
      try {
        const museumsRes = await api.museums.list({ limit: 20 })
        const dbMuseums = museumsRes?.data ?? []
        if (!active || dbMuseums.length === 0) {
          if (active) setIsLoading(false)
          return
        }

        // Map live museums
        const mappedMuseums: Museum[] = dbMuseums.map((dbM) => {
          const viSlug = DB_TO_VI_SLUG[dbM.slug] ?? dbM.slug
          const fallback = museumBySlug(viSlug) ?? museumBySlug(dbM.slug)
          let coverImg = dbM.cover_image_path
          if (coverImg && !coverImg.startsWith("http")) {
            const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://onauuvsjpnmjxqxeiuvy.supabase.co"
            coverImg = `${base}/storage/v1/object/public/museum-media/${coverImg}`
          }

          return {
            id: dbM.id,
            slug: viSlug,
            name: fallback?.name ?? dbM.name,
            nameEn: fallback?.nameEn ?? dbM.name,
            accent: fallback?.accent ?? "#d4af37",
            opens: fallback?.opens ?? "10:00",
            closes: fallback?.closes ?? "17:30",
            image: coverImg || fallback?.image || "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=1200&q=80",
            address: dbM.address ? `${dbM.address}, ${dbM.city ?? "Washington, D.C."}` : (fallback?.address ?? "Washington, D.C."),
            description: dbM.description || fallback?.description || "",
          }
        })

        if (active) setLiveMuseums(mappedMuseums)

        // Query artifacts and products across live museums immediately (non-blocking)
        const results = await Promise.all(
          dbMuseums.map(async (dbM) => {
            const viSlug = DB_TO_VI_SLUG[dbM.slug] ?? dbM.slug

            let arts: Artifact[] = []
            try {
              const artRes = await api.museums.artifacts(dbM.id, { limit: 20 })
              if (artRes?.data && artRes.data.length > 0) {
                arts = artRes.data.map((a, idx) => {
                  const fallbackMatch = initialMockArtifacts[idx % initialMockArtifacts.length]
                  return {
                    id: a.id,
                    slug: a.id,
                    title: a.name,
                    artist: a.period ?? "Bộ sưu tập Smithsonian",
                    year: a.period ?? "Hiện vật lịch sử",
                    medium: a.inventory_code ?? "Hiện vật bảo tàng",
                    dimensions: "Trưng bày thường xuyên",
                    image: fallbackMatch?.image ?? "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80",
                    description: a.description ?? "",
                    museumSlug: viSlug,
                    exhibitionSlugs: [],
                    rights: "CC0 – Public Domain" as const,
                    isHighlight: true,
                  }
                })
              }
            } catch {}

            let prods: Product[] = []
            try {
              const prodRes = await api.museums.products(dbM.id)
              if (prodRes?.data && prodRes.data.length > 0) {
                prods = prodRes.data.map((p, idx) => {
                  const fallbackMatch = initialMockProducts[idx % initialMockProducts.length]
                  return {
                    id: p.id,
                    slug: p.id,
                    name: p.name,
                    price: Number(p.price) || 0,
                    image: fallbackMatch?.image ?? "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80",
                    inventory: p.stock_quantity ?? 0,
                    museumSlug: viSlug,
                    inspiredByArtifactId: null,
                    category: deriveCategory(p.name, p.sku),
                    description: p.description ?? "",
                  }
                })
              }
            } catch {}

            return { arts, prods }
          })
        )

        if (active) {
          const allArts = results.flatMap((r) => r.arts)
          const allProds = results.flatMap((r) => r.prods)

          if (allArts.length > 0) {
            setLiveArtifacts(allArts)
          }
          if (allProds.length > 0) {
            setLiveProducts(allProds)
          }
          setIsLoading(false)

          // Background enrich top 8 artifacts & top 8 products without blocking UI
          const resolveMediaUrl = async (type: "artifact" | "souvenir", id: string) => {
            try {
              const mediaRes = await api.media(type, id)
              if (mediaRes?.data && mediaRes.data.length > 0) {
                const m = mediaRes.data[0]
                if (m.storage_path.startsWith("http")) return m.storage_path
                const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://onauuvsjpnmjxqxeiuvy.supabase.co"
                return `${base}/storage/v1/object/public/${m.storage_bucket}/${m.storage_path}`
              }
            } catch {}
            return null
          }

          Promise.all(
            allArts.slice(0, 8).map(async (art) => {
              const url = await resolveMediaUrl("artifact", art.id)
              return url ? { id: art.id, url } : null
            })
          ).then((updates) => {
            if (!active) return
            const map = new Map(updates.filter((u): u is { id: string; url: string } => !!u).map((u) => [u.id, u.url]))
            if (map.size > 0) {
              setLiveArtifacts((prev) => prev.map((a) => (map.has(a.id) ? { ...a, image: map.get(a.id)! } : a)))
            }
          })

          Promise.all(
            allProds.slice(0, 8).map(async (prod) => {
              const url = await resolveMediaUrl("souvenir", prod.id)
              return url ? { id: prod.id, url } : null
            })
          ).then((updates) => {
            if (!active) return
            const map = new Map(updates.filter((u): u is { id: string; url: string } => !!u).map((u) => [u.id, u.url]))
            if (map.size > 0) {
              setLiveProducts((prev) => prev.map((p) => (map.has(p.id) ? { ...p, image: map.get(p.id)! } : p)))
            }
          })
        }
      } catch {
        // Fallback remains initial mock data
      } finally {
        if (active) setIsLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [])

  const trimmed = query.trim().toLowerCase()

  const matchedArtifacts = useMemo(() => {
    if (!trimmed) return liveArtifacts.slice(0, 8)
    return liveArtifacts.filter(
      (a) =>
        a.title.toLowerCase().includes(trimmed) ||
        a.artist.toLowerCase().includes(trimmed) ||
        a.description.toLowerCase().includes(trimmed),
    )
  }, [trimmed, liveArtifacts])

  const matchedExhibitions = useMemo(() => {
    if (!trimmed) return liveExhibitions.slice(0, 4)
    return liveExhibitions.filter(
      (e) =>
        e.title.toLowerCase().includes(trimmed) ||
        e.curator.toLowerCase().includes(trimmed) ||
        e.description.toLowerCase().includes(trimmed),
    )
  }, [trimmed, liveExhibitions])

  const matchedMuseums = useMemo(() => {
    if (!trimmed) return liveMuseums
    return liveMuseums.filter(
      (m) =>
        m.name.toLowerCase().includes(trimmed) ||
        m.nameEn.toLowerCase().includes(trimmed) ||
        m.description.toLowerCase().includes(trimmed),
    )
  }, [trimmed, liveMuseums])

  const matchedProducts = useMemo(() => {
    if (!trimmed) return liveProducts.slice(0, 8)
    return liveProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(trimmed) ||
        p.description.toLowerCase().includes(trimmed) ||
        p.category.toLowerCase().includes(trimmed),
    )
  }, [trimmed, liveProducts])

  const totalResults =
    (category === "all" || category === "artifacts" ? matchedArtifacts.length : 0) +
    (category === "all" || category === "exhibitions" ? matchedExhibitions.length : 0) +
    (category === "all" || category === "museums" ? matchedMuseums.length : 0) +
    (category === "all" || category === "products" ? matchedProducts.length : 0)

  return (
    <div className="mx-auto max-w-[1560px] px-6 pt-28 pb-16 md:px-12 xl:px-16">
      <header className="mb-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/45 bg-[#08162b]/90 px-4 py-1.5 shadow-md backdrop-blur-md">
          <BrassPlacardPin />
          <span className="placard text-[0.68rem] tracking-wider text-[#fbe396]">
            <DecryptedText
              text="Bộ máy Tra cứu Tổng hợp · Smithsonian Index"
              speed={28}
              maxIterations={12}
              animateOn="view"
            />
          </span>
          {isLoading && <Loader2 className="ml-2 size-3 animate-spin text-[#d4af37]" />}
        </div>
        <h1 className="mt-4 text-4xl font-light tracking-tight md:text-5xl text-foreground">
          <BlurText text="Tìm kiếm trong kho lưu trữ" delay={0.04} />
        </h1>
        <p className="mt-4 text-base text-stone-300 leading-relaxed">
          Tra cứu hiện vật, triển lãm, bảo tàng và quà lưu niệm trong một nơi duy nhất với dữ liệu đồng bộ trực tiếp từ hệ thống.
        </p>
      </header>

      {/* Search Input */}
      <div className="relative mb-8 max-w-2xl">
        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(e) => {
            const v = e.target.value
            startTransition(() => setQuery(v))
          }}
          placeholder="Tìm Monet, Apollo 11, hóa thạch, chân dung, áo khoác..."
          className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-5 text-base text-foreground shadow-sm outline-none transition-all focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
        />
      </div>

      {/* Category Tabs */}
      <div className="mb-10 flex flex-wrap gap-2.5 border-b border-border pb-4">
        {[
          { key: "all", label: "Tất cả" },
          { key: "artifacts", label: `Hiện vật (${matchedArtifacts.length})` },
          { key: "exhibitions", label: `Triển lãm (${matchedExhibitions.length})` },
          { key: "museums", label: `Bảo tàng (${matchedMuseums.length})` },
          { key: "products", label: `Quà lưu niệm (${matchedProducts.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCategory(tab.key as Category)}
            className={cn(
              "placard rounded-full border px-4 py-2 text-xs transition-all duration-300 font-medium",
              category === tab.key
                ? "border-[#d4af37] bg-[#d4af37] text-[#08162b] font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                : "border-white/15 bg-[#08162b]/80 text-stone-300 hover:border-[#d4af37]/60 hover:text-[#fbe396]",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {totalResults === 0 ? (
        <div className="rounded-lg border border-border bg-card/60 py-24 text-center shadow-sm">
          <p className="text-xl text-foreground font-light">Không tìm thấy kết quả nào cho &ldquo;{query}&rdquo;</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Thử tìm kiếm với từ khóa khác như &ldquo;Monet&rdquo;, &ldquo;Apollo&rdquo;, &ldquo;Khủng long&rdquo; hoặc &ldquo;Kim cương&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-14">
          {/* Museums section */}
          {(category === "all" || category === "museums") && matchedMuseums.length > 0 && (
            <section>
              <h2 className="text-2xl font-heading font-light text-foreground mb-6">Bảo tàng ({matchedMuseums.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matchedMuseums.map((m) => (
                  <SpotlightCard key={m.slug} className="p-5 bg-card border-border shadow-sm">
                    <Link
                      href={`/bao-tang/${m.slug}`}
                      style={{ "--museum-accent": m.accent } as React.CSSProperties}
                      className="group flex flex-col justify-between h-full"
                    >
                      <div>
                        <p className="placard text-xs text-muted-foreground">{m.opens} – {m.closes}</p>
                        <h3 className="mt-2 text-xl font-heading font-light group-hover:text-museum transition-colors">{m.name}</h3>
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{m.description}</p>
                      </div>
                      <span className="mt-5 flex items-center gap-1 text-xs font-medium text-museum group-hover:translate-x-1.5 transition-transform">
                        Xem chi tiết <ArrowUpRight className="size-3.5" />
                      </span>
                    </Link>
                  </SpotlightCard>
                ))}
              </div>
            </section>
          )}

          {/* Artifacts section */}
          {(category === "all" || category === "artifacts") && matchedArtifacts.length > 0 && (
            <section>
              <h2 className="text-2xl font-heading font-light text-foreground mb-6">Hiện vật ({matchedArtifacts.length})</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {matchedArtifacts.map((art) => (
                  <SpotlightCard key={art.id} className="p-3 bg-card border-border shadow-sm">
                    <Link href={`/bao-tang/${art.museumSlug}`} className="group flex flex-col">
                      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                        <Image
                          src={art.image}
                          alt={art.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width:640px) 50vw,25vw"
                        />
                      </div>
                      <p className="mt-3 font-heading italic text-base leading-snug group-hover:text-museum transition-colors line-clamp-1">
                        {art.title}
                      </p>
                      <p className="placard mt-1 text-xs text-muted-foreground">{art.artist} · {art.year}</p>
                    </Link>
                  </SpotlightCard>
                ))}
              </div>
            </section>
          )}

          {/* Exhibitions section */}
          {(category === "all" || category === "exhibitions") && matchedExhibitions.length > 0 && (
            <section>
              <h2 className="text-2xl font-heading font-light text-foreground mb-6">Triển lãm ({matchedExhibitions.length})</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matchedExhibitions.map((e) => (
                  <SpotlightCard key={e.slug} className="p-5 bg-card border-border shadow-sm">
                    <Link
                      href={`/bao-tang/${e.museumSlug}`}
                      className="group flex flex-col justify-between h-full"
                    >
                      <div>
                        <p className="placard text-xs text-muted-foreground">Giám tuyển: {e.curator}</p>
                        <h3 className="mt-2 text-xl font-heading font-light group-hover:text-museum transition-colors">{e.title}</h3>
                        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{e.description}</p>
                      </div>
                      <span className="mt-5 flex items-center gap-1 text-xs font-medium text-museum group-hover:translate-x-1.5 transition-transform">
                        Chi tiết <ArrowUpRight className="size-3.5" />
                      </span>
                    </Link>
                  </SpotlightCard>
                ))}
              </div>
            </section>
          )}

          {/* Products section */}
          {(category === "all" || category === "products") && matchedProducts.length > 0 && (
            <section>
              <h2 className="text-2xl font-heading font-light text-foreground mb-6">Quà lưu niệm ({matchedProducts.length})</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {matchedProducts.map((p) => (
                  <SpotlightCard key={p.id} className="p-3.5 bg-card border-border shadow-sm">
                    <Link
                      href={`/cua-hang/${p.slug}`}
                      className="group flex flex-col h-full"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                        <Image src={p.image} alt={p.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                      <p className="placard mt-3 text-xs text-muted-foreground">{p.category}</p>
                      <p className="mt-1 text-sm font-medium leading-tight group-hover:text-museum transition-colors line-clamp-1">{p.name}</p>
                      <p className="mt-auto pt-3 font-heading text-base font-semibold text-museum">{formatVndOrPrice(p.price)}</p>
                    </Link>
                  </SpotlightCard>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1560px] px-6 pt-28 pb-16 md:px-12 text-center">
          <p className="font-heading text-2xl text-stone-400">Đang tải kho lưu trữ Smithsonian...</p>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  )
}
