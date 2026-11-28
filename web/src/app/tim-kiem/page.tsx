"use client"

import { useState, useDeferredValue, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Search, ArrowUpRight, Box, Landmark, Layers3, Package, Images, X } from "lucide-react"
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
import { motion, useReducedMotion } from "framer-motion"
import { airExhibits, AIR_TOUR } from "@/components/museum/air-space/exhibits"
import { specimens } from "@/lib/natural-history-specimens"
import { formatShopPrice } from "@/lib/shop-price"
import "./archive-search.css"

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

type Category = "all" | "artifacts" | "exhibitions" | "museums" | "products"

const VALID_CATEGORIES = new Set<Category>(["all", "artifacts", "exhibitions", "museums", "products"])

function SearchContent() {
  const searchParams = useSearchParams()
  const rawCategory = searchParams.get("category") as Category | null
  const initialCategory = rawCategory && VALID_CATEGORIES.has(rawCategory) ? rawCategory : "all"
  const initialQuery = searchParams.get("q") ?? ""
  const rawMuseum = searchParams.get("museum") ?? ""
  const initialMuseum = DB_TO_VI_SLUG[rawMuseum] ?? rawMuseum

  return (
    <SearchContentInner
      key={`${initialCategory}:${initialMuseum}:${initialQuery}`}
      initialCategory={initialCategory}
      initialQuery={initialQuery}
      initialMuseum={initialMuseum}
    />
  )
}

function SearchContentInner({
  initialCategory,
  initialQuery,
  initialMuseum,
}: {
  initialCategory: Category
  initialQuery: string
  initialMuseum: string
}) {
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<Category>(initialCategory)
  const [museum, setMuseum] = useState(initialMuseum)
  const deferredQuery = useDeferredValue(query)
  const reducedMotion = useReducedMotion()

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
                arts = artRes.data.map((a) => {
                  const fallbackMatch = initialMockArtifacts.find((item) => item.museumSlug === viSlug && normalize(item.title) === normalize(a.name))
                  return {
                    id: a.id,
                    slug: a.id,
                    title: a.name,
                    artist: a.period ?? "Bộ sưu tập Smithsonian",
                    year: a.period ?? "Hiện vật lịch sử",
                    medium: a.inventory_code ?? "Hiện vật bảo tàng",
                    dimensions: "Trưng bày thường xuyên",
                    image: fallbackMatch?.image ?? "",
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
                prods = prodRes.data.map((p) => {
                  const fallbackMatch = initialMockProducts.find((item) => item.museumSlug === viSlug && normalize(item.name) === normalize(p.name))
                  return {
                    id: p.id,
                    slug: p.id,
                    name: p.name,
                    price: Number(p.price) || 0,
                    image: fallbackMatch?.image ?? "",
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

  const term = normalize(deferredQuery)
  const matches = (text: string) => term.split(/\s+/).every((word) => normalize(text).includes(word))
  const inMuseum = (slug: string) => !museum || slug === museum
  const museumName = (slug: string) => liveMuseums.find((item) => item.slug === slug)?.name ?? museumBySlug(slug)?.name ?? "Smithsonian"
  const localArt: ResultItem[] = [
    ...airExhibits.map((item) => ({
      id: item.id, title: item.name, image: item.image, museum: "hang-khong-vu-tru",
      label: item.category + " · " + item.year, details: item.description,
      url: AIR_TOUR + "#" + item.id, model: true,
      keywords: [item.keywords, ...(item.catalogTitles ?? [])].filter(Boolean).join(" "),
      catalogTitles: item.catalogTitles,
    })),
    ...specimens.map((item) => ({
      id: item.id, title: item.nameVi, image: item.image, museum: "lich-su-tu-nhien",
      label: item.latin, details: item.description, url: "/tham-quan/lich-su-tu-nhien#" + item.id,
      model: true, keywords: item.name + " " + item.tags.join(" "),
    })),
  ]
  const groups = [
    { key: "artifacts" as const, title: "Hiện vật", icon: Box, items: [
      ...localArt,
      ...liveArtifacts.filter((item) => !localArt.some((known) => known.museum === item.museumSlug &&
        [known.title, ...(known.catalogTitles ?? [])].some((title) => normalize(title) === normalize(item.title)))).map((item) => ({
        id: item.id, title: item.title, label: [item.artist, item.year].filter(Boolean).join(" · "),
        image: item.image, museum: item.museumSlug, url: "/bao-tang/" + item.museumSlug, details: item.description,
      })),
    ] },
    { key: "museums" as const, title: "Bảo tàng", icon: Landmark, items: liveMuseums.map((item) => ({
      id: item.slug, title: item.name, details: item.description, label: item.nameEn, image: item.image,
      museum: item.slug, url: "/bao-tang/" + item.slug,
    })) },
    { key: "exhibitions" as const, title: "Triển lãm", icon: Images, items: liveExhibitions.map((item) => ({
      id: item.slug, title: item.title, details: item.description, label: item.curator,
      image: item.image, museum: item.museumSlug, url: "/bao-tang/" + item.museumSlug,
    })) },
    { key: "products" as const, title: "Quà lưu niệm", icon: Package, items: liveProducts.map((item) => ({
      id: item.id, title: item.name, details: item.description, label: item.category + " · " + formatShopPrice(item.price, item.id),
      image: item.image, museum: item.museumSlug, url: "/cua-hang/" + item.slug,
    })) },
  ].map((group) => ({
    ...group,
    items: group.items.filter((item: ResultItem) => inMuseum(item.museum) && matches([
      item.title, item.label, item.details, item.keywords, museumName(item.museum),
    ].filter(Boolean).join(" "))) as ResultItem[],
  }))

  const visible = groups.filter((group) => category === "all" || group.key === category)
  const total = visible.reduce((count, group) => count + group.items.length, 0)
  const [limits, setLimits] = useState<Record<string, number>>({})
  function updateQuery(next: string) {
    setLimits({})
    setQuery(next)
  }

  return (
    <div className="flight-search">
      <header className="archive-heading">
        <motion.div initial={{ opacity:0,y:12 }} animate={{opacity:1,y:0}} transition={{duration:reducedMotion ? 0 : .45}}>
          <p className="archive-eyebrow">Kho lưu trữ Smithsonian</p>
          <h1>Tìm kiếm <em>bộ sưu tập.</em></h1>
        </motion.div>
        <form role="search" onSubmit={(event) => {
          event.preventDefault()
          const params = new URLSearchParams()
          if (query.trim()) params.set("q", query.trim())
          if (category !== "all") params.set("category", category)
          if (museum) params.set("museum", museum)
          history.replaceState(history.state, "", "/tim-kiem" + (params.size ? "?" + params : ""))
        }}>
          <label htmlFor="archive-query">Từ khóa</label>
          <div className="archive-input">
            <Search size={21} aria-hidden="true" />
            <input id="archive-query" type="search" value={query} onChange={(event) => updateQuery(event.target.value)}
              placeholder="Ví dụ: Apollo 11, khủng long, Hubble" />
            {query && <button type="button" aria-label="Xóa từ khóa" onClick={() => updateQuery("")}><X size={18}/></button>}
            <button type="submit" className="archive-submit">Tìm</button>
          </div>
        </form>
      </header>

      <div className="archive-layout">
        <aside className="archive-filters" aria-label="Bộ lọc kho lưu trữ">
          <h2>Loại kết quả</h2>
          <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")}><Layers3 size={17} /> Tất cả</button>
          {groups.map(({ key, title, icon: Icon, items }) => (
            <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)}>
              <Icon size={17} /> {title} <span>{items.length}</span>
            </button>
          ))}
          <label htmlFor="archive-museum">Bảo tàng</label>
          <select id="archive-museum" value={museum} onChange={(event) => { setLimits({}); setMuseum(event.target.value) }}>
            <option value="">Tất cả bảo tàng</option>
            {liveMuseums.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            {museum && !liveMuseums.some(({slug}) => slug === museum) && <option value={museum}>{museumName(museum)}</option>}
          </select>
        </aside>
        <section className="archive-results" aria-label="Kết quả tìm kiếm">
          <div className="archive-result-head">
            <h2>{term ? "Kết quả tìm kiếm" : "Khám phá kho lưu trữ"}</h2>
            <p role="status">{isLoading ? "Đang cập nhật danh mục · " : ""}{total} kết quả</p>
          </div>
          {!total && <div className="archive-empty">
            <Search size={24} /><h3>Chưa tìm thấy kết quả</h3>
            <p>Thử từ khóa ngắn hơn hoặc tìm trong tất cả bảo tàng.</p>
            <button type="button" onClick={() => { updateQuery(""); setCategory("all"); setMuseum("") }}>Xóa bộ lọc và từ khóa</button>
          </div>}
          {visible.filter(({items}) => items.length).map(({ key, title, items }) => {
            const limit = limits[key] ?? (category === "all" ? 6 : 12)
            return (
              <section key={key} className="archive-result-group" aria-label={title}>
                <h3>{title}</h3>
                <div className="archive-grid">
                  {items.slice(0, limit).map((item) => (
                    <article key={item.id}>
                      <Link href={item.url} className="archive-card">
                        <div className="archive-card-art" data-model={Boolean(item.model)}>
                          {item.image ? <ArchiveImage src={item.image} /> : <Box aria-hidden="true" size={35} />}
                        </div>
                        <div className="archive-card-copy">
                          <p>{item.label}</p>
                          <h4>{item.title}</h4>
                          <span>{item.model ? "Xem mô hình 3D" : key === "artifacts" ? "Xem bảo tàng" : "Xem chi tiết"} <ArrowUpRight size={14} /></span>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
                {items.length > limit && <button type="button" className="archive-more" onClick={() => setLimits({ ...limits, [key]: limit + 12 })}>Xem thêm {title.toLowerCase()}</button>}
              </section>
            )
          })}
        </section>
      </div>
    </div>
  )
}

type ResultItem = {
  id: string
  title: string
  image: string
  label: string
  museum: string
  details: string
  url: string
  model?: boolean
  keywords?: string
  catalogTitles?: string[]
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replaceAll("đ", "d").replace(/[–—-]/g, " ").trim()
}

function ArchiveImage({ src }: { src: string }) {
  const [failed, setFailed] = useState("")
  if (failed === src) return <Box aria-hidden="true" size={35} />
  return <Image src={src} alt="" fill sizes="(max-width: 600px) 44vw, (max-width: 1100px) 38vw, 26vw" onError={() => setFailed(src)} />
}

export default function SearchPage() {
  return <Suspense fallback={<div className="archive-loading" role="status">Đang tải kho lưu trữ…</div>}><SearchContent /></Suspense>
}
