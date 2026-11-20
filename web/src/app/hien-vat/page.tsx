"use client"

import { Search, Sparkles, LayoutGrid, Eye, ArrowDown } from "lucide-react"
import { useEffect, useState, useRef } from "react"
import { artifacts, museums, type Artifact } from "@/lib/mock-data"
import { FlippableVitrineCard } from "@/components/reactbits/flippable-card"
import { VitrineStageView } from "@/components/museum/vitrine-stage-view"
import {
  BrassPlacardPin,
  RenaissanceCorners,
  RenaissanceDivider,
  RenaissanceFrieze,
  ClassicalMuseumMedallion,
} from "@/components/renaissance/deco-assets"

export default function ArtifactListPage() {
  const [query, setQuery] = useState("")
  const [museumFilter, setMuseumFilter] = useState("all")
  const catalogSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const m = params.get("museum")
    if (m) {
      queueMicrotask(() => setMuseumFilter(m))
    }
  }, [])

  const q = query.toLowerCase()
  const displayed = artifacts.filter(
    (a) =>
      (museumFilter === "all" || a.museumSlug === museumFilter) &&
      (q === "" || a.title.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)),
  )

  const scrollToCatalog = () => {
    catalogSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="w-full bg-[#0c0906]">
      {/* =========================================================================
          100% TOÀN MÀN HÌNH - PHÒNG TRƯNG BÀY TIÊU ĐIỂM (Ảnh 1)
          Không có viền trắng/kem xung quanh, tập trung hoàn toàn vào hiện vật
         ========================================================================= */}
      <section className="relative w-full">
        <VitrineStageView
          artifacts={displayed}
          showFilters={true}
          selectedMuseum={museumFilter}
          onSelectMuseum={setMuseumFilter}
        />

        {/* Scroll down indicator to catalog */}
        <div className="relative z-20 flex justify-center py-4 bg-gradient-to-b from-[#0c0906] to-[#08162b] border-t border-white/10">
          <button
            onClick={scrollToCatalog}
            className="group inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-[#08162b]/90 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#fbe396] shadow-md transition-all hover:bg-[#d4af37] hover:text-[#08162b]"
          >
            <LayoutGrid className="size-3.5" /> Khám phá danh mục toàn bộ ({displayed.length} hiện vật)
            <ArrowDown className="size-3.5 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          MỤC LỤC KHO LƯU TRỮ (COLLAPSIBLE / SCROLLABLE CATALOG)
         ========================================================================= */}
      <div ref={catalogSectionRef} className="mx-auto max-w-[1560px] px-6 py-16 md:px-12 xl:px-16 bg-[#f7f4ec] text-[#171717]">
        <RenaissanceDivider title="Sổ mục lục kho lưu trữ" />

        {/* Royal Navy Catalog Banner */}
        <div className="relative mb-12 overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-[#08162b] px-8 py-8 text-[#f7f4ec] shadow-[0_20px_50px_-20px_rgba(8,22,43,0.85)] md:px-12 md:py-10">
          <RenaissanceCorners />
          <RenaissanceFrieze className="absolute top-0 left-0 right-0" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-8 pt-1">
            <div className="flex items-center gap-5">
              <ClassicalMuseumMedallion className="hidden sm:block size-14 text-[#d4af37] shrink-0" />
              <div>
                <p className="flex items-center gap-2 placard text-[0.68rem] uppercase tracking-[0.22em] text-[#d4af37]">
                  <BrassPlacardPin />
                  Sổ mục lục viện bảo tàng
                </p>
                <p className="mt-1 font-heading text-2xl md:text-3xl font-light text-white">
                  {displayed.length.toString().padStart(2, "0")} kiệt tác trong tầm nhìn
                </p>
              </div>
            </div>
            <p className="max-w-xl text-xs md:text-sm leading-relaxed text-stone-300">
              Tuyển tập những di sản và kiệt tác nghệ thuật tiêu biểu thuộc chương trình Smithsonian Open Access, được số hóa độ phân giải cao phục vụ nghiên cứu và thưởng lãm công cộng.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-12 flex flex-wrap gap-4">
          <div className="relative min-w-72 flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm theo tên tác phẩm, danh họa hoặc nghệ nhân..."
              className="w-full rounded-full border border-stone-300/90 bg-white px-5 py-3.5 pl-11 text-sm text-[#171717] shadow-sm outline-none transition-all placeholder:text-stone-400 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/45"
            />
          </div>
          <select
            value={museumFilter}
            onChange={(e) => setMuseumFilter(e.target.value)}
            aria-label="Lọc theo bảo tàng"
            className="cursor-pointer rounded-full border border-stone-300/90 bg-white px-6 py-3.5 text-sm text-[#171717] shadow-sm outline-none transition-all focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/45"
          >
            <option value="all">Tất cả bảo tàng</option>
            {museums.map((m) => (
              <option key={m.slug} value={m.slug}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {displayed.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white py-24 text-center shadow-sm">
            <RenaissanceCorners />
            <p className="font-heading text-2xl font-light text-[#171717]">Không tìm thấy hiện vật nào</p>
            <p className="mt-2 text-sm text-stone-500">Đổi bộ lọc hoặc rút ngắn từ khóa.</p>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayed.map((art) => (
              <FlippableVitrineCard key={art.id} artifact={art} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
