"use client"

import { useState, useTransition, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Search, ArrowUpRight } from "lucide-react"
import { artifacts, exhibitions, museums, products, formatPrice } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { SpotlightCard } from "@/components/reactbits/spotlight-card"
import { BlurText } from "@/components/reactbits/blur-text"
import { ShinyText } from "@/components/reactbits/shiny-text"
import { BrassPlacardPin } from "@/components/renaissance/deco-assets"
import { DecryptedText } from "@/components/reactbits/decrypted-text"

type Category = "all" | "artifacts" | "exhibitions" | "museums" | "products"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<Category>("all")
  const [, startTransition] = useTransition()

  const trimmed = query.trim().toLowerCase()

  const matchedArtifacts = useMemo(() => {
    if (!trimmed) return artifacts.slice(0, 6)
    return artifacts.filter(
      (a) =>
        a.title.toLowerCase().includes(trimmed) ||
        a.artist.toLowerCase().includes(trimmed) ||
        a.description.toLowerCase().includes(trimmed),
    )
  }, [trimmed])

  const matchedExhibitions = useMemo(() => {
    if (!trimmed) return exhibitions.slice(0, 3)
    return exhibitions.filter(
      (e) =>
        e.title.toLowerCase().includes(trimmed) ||
        e.curator.toLowerCase().includes(trimmed) ||
        e.description.toLowerCase().includes(trimmed),
    )
  }, [trimmed])

  const matchedMuseums = useMemo(() => {
    if (!trimmed) return museums
    return museums.filter(
      (m) =>
        m.name.toLowerCase().includes(trimmed) ||
        m.nameEn.toLowerCase().includes(trimmed) ||
        m.description.toLowerCase().includes(trimmed),
    )
  }, [trimmed])

  const matchedProducts = useMemo(() => {
    if (!trimmed) return products.slice(0, 4)
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(trimmed) ||
        p.description.toLowerCase().includes(trimmed) ||
        p.category.toLowerCase().includes(trimmed),
    )
  }, [trimmed])

  const totalResults =
    (category === "all" || category === "artifacts" ? matchedArtifacts.length : 0) +
    (category === "all" || category === "exhibitions" ? matchedExhibitions.length : 0) +
    (category === "all" || category === "museums" ? matchedMuseums.length : 0) +
    (category === "all" || category === "products" ? matchedProducts.length : 0)

  return (
    <div className="mx-auto max-w-[1560px] px-6 py-16 md:px-12 xl:px-16">
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
        </div>
        <h1 className="mt-4 text-4xl font-light tracking-tight md:text-5xl text-foreground">
          <BlurText text="Tìm kiếm trong kho lưu trữ" delay={0.04} />
        </h1>
        <p className="mt-4 text-base text-stone-300 leading-relaxed">
          Tra cứu hiện vật, triển lãm, bảo tàng và quà lưu niệm trong một nơi duy nhất.
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
          placeholder="Tìm Monet, Apollo 11, hóa thạch, chân dung..."
          className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-5 text-base text-foreground shadow-sm outline-none transition-all focus:border-foreground focus:ring-1 focus:ring-foreground"
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
            Thử tìm kiếm với từ khóa khác như &ldquo;Monet&rdquo;, &ldquo;Apollo&rdquo;, hoặc &ldquo;Kim cương&rdquo;.
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
                    <Link href={`/hien-vat/${art.slug}`} className="group flex flex-col">
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
                      href={`/trien-lam/${e.slug}`}
                      className="group flex flex-col justify-between h-full"
                    >
                      <div>
                        <p className="placard text-xs text-muted-foreground">Curator: {e.curator}</p>
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
                      <p className="mt-auto pt-3 font-heading text-base font-semibold text-museum">{formatPrice(p.price)}</p>
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
