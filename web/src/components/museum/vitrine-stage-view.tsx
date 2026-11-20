"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react"
import { type Artifact, museumBySlug, museums } from "@/lib/mock-data"
import { BrassPlacardPin } from "@/components/renaissance/deco-assets"
import { VitrineCanvasBackground } from "@/components/museum/vitrine-canvas-background"
import { TiltedCard } from "@/components/reactbits/tilted-card"
import { cn } from "@/lib/utils"

interface VitrineStageViewProps {
  artifacts: Artifact[]
  initialSlug?: string
  showFilters?: boolean
  selectedMuseum?: string
  onSelectMuseum?: (museum: string) => void
  onSearchChange?: (q: string) => void
  backHref?: string
}

export function VitrineStageView({
  artifacts,
  initialSlug,
  showFilters = false,
  selectedMuseum = "all",
  onSelectMuseum,
  onSearchChange,
  backHref,
}: VitrineStageViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Sync initial slug if provided
  useEffect(() => {
    if (initialSlug && artifacts.length > 0) {
      const idx = artifacts.findIndex((a) => a.slug === initialSlug || a.id === initialSlug)
      if (idx !== -1) {
        setCurrentIndex(idx)
      }
    }
  }, [initialSlug, artifacts])

  // Click outside to close custom museum dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!artifacts || artifacts.length === 0) return null

  const active = artifacts[currentIndex] || artifacts[0]
  const museum = museumBySlug(active.museumSlug)
  const catalog = active.id.replace("art-", "SI-").toUpperCase()

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : artifacts.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < artifacts.length - 1 ? prev + 1 : 0))
  }

  const currentMuseumName =
    selectedMuseum === "all"
      ? "Tất cả bảo tàng"
      : museums.find((m) => m.slug === selectedMuseum)?.name || "Tất cả bảo tàng"

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] flex flex-col justify-between overflow-hidden bg-[#0c0906] text-[#f8f6f0] select-none">
      {/* =========================================================================
          FLOATING CORNER: NÚT TRỞ VỀ & BỘ CHỌN BẢO TÀNG (Tiết kiệm không gian tối đa)
         ========================================================================= */}
      <div className="absolute top-4 left-6 md:left-10 z-30 flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-[#08162b]/90 text-white backdrop-blur-md transition-all hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#08162b] active:scale-95 shadow-lg"
            title="Trở về danh mục"
            aria-label="Trở về danh mục"
          >
            <ArrowLeft className="size-4" />
          </Link>
        )}

        {showFilters && onSelectMuseum && (
          <div ref={dropdownRef} className="relative flex items-center">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="h-8.5 px-3.5 flex items-center justify-between gap-2.5 rounded-full border border-[#d4af37]/60 bg-[#08162b]/90 backdrop-blur-md hover:border-[#ffd700] hover:bg-[#0e213d] transition-all shadow-lg group cursor-pointer"
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
            >
              <span className="text-[0.62rem] tracking-wider text-[#d4af37] font-mono font-bold uppercase">
                BẢO TÀNG:
              </span>
              <span className="text-xs text-[#fbe396] font-medium truncate max-w-[140px]">
                {currentMuseumName}
              </span>
              <ChevronDown
                className={cn(
                  "size-3 text-[#d4af37] transition-transform duration-200 group-hover:text-[#ffd700]",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {/* Dropdown Menu lựa chọn bảo tàng */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-full mt-2 left-0 min-w-[270px] max-w-sm rounded-2xl border border-[#d4af37]/60 bg-[#08162b]/98 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_25px_rgba(212,175,55,0.3)] p-1.5 z-50 text-left"
                >
                  <button
                    onClick={() => {
                      onSelectMuseum("all")
                      setIsDropdownOpen(false)
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-colors text-left",
                      selectedMuseum === "all"
                        ? "bg-[#d4af37]/25 text-[#ffd700] font-semibold border-l-2 border-[#d4af37]"
                        : "text-stone-300 hover:bg-white/10 hover:text-[#fbe396]"
                    )}
                  >
                    <span>Tất cả bảo tàng</span>
                    {selectedMuseum === "all" && <Check className="size-3.5 text-[#d4af37]" />}
                  </button>
                  <div className="my-1 border-t border-white/10" />
                  {museums.map((m) => (
                    <button
                      key={m.slug}
                      onClick={() => {
                        onSelectMuseum(m.slug)
                        setIsDropdownOpen(false)
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs transition-colors text-left",
                        selectedMuseum === m.slug
                          ? "bg-[#d4af37]/25 text-[#ffd700] font-semibold border-l-2 border-[#d4af37]"
                          : "text-stone-300 hover:bg-white/10 hover:text-[#fbe396]"
                      )}
                    >
                      <span className="truncate pr-2">{m.name}</span>
                      {selectedMuseum === m.slug && <Check className="size-3.5 text-[#d4af37] shrink-0" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* =========================================================================
          MAIN EXHIBITION STAGE (Toàn bộ không gian màn hình tối ưu cho hiện vật)
         ========================================================================= */}
      <div className="relative flex-1 flex flex-col xl:flex-row items-center justify-between gap-6 md:gap-8 lg:gap-10 px-6 py-4 md:px-10 lg:px-12 bg-[radial-gradient(ellipse_at_50%_35%,#261c12_0%,#0c0906_90%)] overflow-hidden">
        {/* Constellation Network Canvas: Mạng lưới chòm sao hoàng kim liên kết & tương tác chuột (Ảnh 1) */}
        <VitrineCanvasBackground />

        {/* Classical Left Column / Stanchion Pedestal Preview (Bỏ dòng CÁC BẢO VẬT LIÊN KẾT theo Ảnh 1, đệm lề thoáng đãng) */}
        <div className="hidden lg:flex flex-col gap-3 z-20 xl:w-56 shrink-0 pt-16 md:pt-20">
          <div className="space-y-2.5 max-h-[calc(100vh-10rem)] overflow-y-auto museum-scrollbar pr-2">
            {artifacts.map((art, idx) => (
              <button
                key={art.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? "border-[#d4af37] bg-[#d4af37]/20 shadow-[0_0_16px_rgba(212,175,55,0.4)] ring-1 ring-[#ffd700]"
                    : "border-white/10 bg-white/5 opacity-60 hover:opacity-100 hover:border-[#d4af37]/50"
                }`}
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-[#d4af37]/50 bg-stone-900 shadow-md">
                  <Image src={art.image} alt={art.title} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-heading text-xs italic text-white line-clamp-1">{art.title}</p>
                  <p className="placard mt-0.5 text-[0.62rem] text-stone-400 font-mono line-clamp-1">{art.artist}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Masterpiece Centerpiece (Ảnh 3 & 4: Khung vàng giảm độ dày 1 nửa, bỏ chi tiết góc thẻ, ảnh to nhìn dọc, có stepper bên dưới) */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative flex flex-col items-center justify-center w-full"
            >
              {/* TiltedCard mượt mà không bị giật khi chuột rời khỏi thẻ */}
              <TiltedCard frameless tiltMaxAngleX={8} tiltMaxAngleY={8} scale={1}>
                {/* Viền vàng hoàng kim giảm độ dày 1 nửa (p-1.5 md:p-2), không có chi tiết góc thẻ theo Ảnh 4 */}
                <div className="relative rounded-xl p-1.5 md:p-2 bg-gradient-to-br from-[#ebd59b] via-[#d4af37] to-[#7a5410] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_22px_rgba(212,175,55,0.35)] ring-1 ring-black/50">
                  {/* Tỷ lệ ảnh to, nhìn dọc aspect-[3/4] chuẩn Ảnh 3 */}
                  <div className="relative aspect-[3/4] h-[54vh] md:h-[60vh] xl:h-[64vh] max-h-[64vh] w-auto overflow-hidden rounded-lg bg-stone-950 ring-1 ring-black/80">
                    <Image
                      src={active.image}
                      alt={active.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-700 hover:scale-105"
                      sizes="(max-width:768px) 100vw, 45vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    {/* Year glint badge */}
                    <span className="absolute top-2.5 right-2.5 rounded-full border border-[#d4af37]/60 bg-[#08162b]/90 px-2.5 py-0.5 placard text-[0.68rem] font-semibold text-[#fbe396] shadow-md backdrop-blur-md">
                      {active.year}
                    </span>
                  </div>
                </div>
              </TiltedCard>

              {/* Nút mũi tên và bộ đếm số nhỏ gọn đặt ngay dưới thẻ ảnh hiện vật */}
              <div className="mt-3 flex items-center justify-center gap-2 select-none z-20">
                <button
                  onClick={handlePrev}
                  className="flex size-7 items-center justify-center rounded-full border border-white/20 bg-[#08162b]/85 text-white backdrop-blur-md transition-all hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#08162b] active:scale-95 shadow-md cursor-pointer"
                  aria-label="Kiệt tác trước"
                >
                  <ArrowLeft className="size-3.5" />
                </button>
                <div className="flex items-center gap-1 font-mono text-xs tracking-wider text-[#fbe396] font-semibold px-2">
                  <span>{String(currentIndex + 1).padStart(2, "0")}</span>
                  <span className="text-[#d4af37]/50">/</span>
                  <span>{String(artifacts.length).padStart(2, "0")}</span>
                </div>
                <button
                  onClick={handleNext}
                  className="flex size-7 items-center justify-center rounded-full border border-white/20 bg-[#08162b]/85 text-white backdrop-blur-md transition-all hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#08162b] active:scale-95 shadow-md cursor-pointer"
                  aria-label="Kiệt tác kế tiếp"
                >
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating Curator Glass Placard (Ảnh 3: Thẻ thông tin nhỏ hơn và nằm gọn một bên) */}
        <div className="relative z-20 w-full xl:max-w-[340px] 2xl:max-w-[380px] shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-[#d4af37]/45 bg-[#08162b]/92 p-4 md:p-5 lg:p-5.5 text-[#f8f6f0] shadow-2xl backdrop-blur-xl"
            >
              {/* Placard Header */}
              <p className="placard text-[0.62rem] tracking-[0.22em] text-[#d4af37] uppercase font-bold">
                NAME OF THE MASTERPIECE
              </p>

              {/* Title */}
              <h2 className="mt-1 font-heading text-xl md:text-2xl font-light italic text-white leading-tight line-clamp-1">
                {active.title}
              </h2>

              {/* Artist & Year */}
              <div className="mt-2 flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-serif text-xs md:text-sm text-[#fbe396] font-medium truncate pr-2">
                  {active.artist}
                </span>
                <span className="font-mono text-xs text-stone-300 shrink-0">{active.year}</span>
              </div>

              {/* Curatorial Description (Gọn gàng, thanh cuộn hoàng kim không bị tràn) */}
              <div className="mt-2.5 space-y-2 text-xs text-stone-200 leading-relaxed max-h-24 md:max-h-28 overflow-y-auto museum-scrollbar pr-1">
                <p className="line-clamp-3">{active.description}</p>
                <div className="pt-2 border-t border-white/10 space-y-1 text-[0.68rem] text-stone-300">
                  <p className="truncate"><strong>Bảo tàng:</strong> {museum?.name || "Smithsonian Institution"}</p>
                  <p className="truncate"><strong>Chất liệu:</strong> {active.medium}</p>
                  <p className="truncate"><strong>Kích thước:</strong> {active.dimensions}</p>
                  <p className="truncate"><strong>Bản quyền:</strong> {active.rights}</p>
                  <p className="font-mono text-[#d4af37]"><strong>Mã Catalog:</strong> {catalog}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3.5 flex flex-col sm:flex-row items-center gap-2 pt-2.5 border-t border-white/10">
                <Link
                  href={`/hien-vat/${active.slug}`}
                  className="flex w-full sm:flex-1 items-center justify-center gap-1.5 rounded-full bg-[#d4af37] py-2 text-xs font-bold uppercase tracking-wider text-[#08162b] shadow-md transition-all hover:bg-[#e2c14d]"
                >
                  Xem hồ sơ đầy đủ <ArrowUpRight className="size-3.5" />
                </Link>

                <Link
                  href={`/dat-ve?museum=${active.museumSlug}`}
                  className="w-full sm:w-auto"
                >
                  <span className="flex w-full items-center justify-center gap-1 rounded-full border border-stone-400 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-stone-200 hover:border-[#d4af37] hover:text-white transition-all">
                    Đặt vé <Sparkles className="size-3 text-[#d4af37]" />
                  </span>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
