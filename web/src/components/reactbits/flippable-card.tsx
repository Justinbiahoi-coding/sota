"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { RotateCcw, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import {
  RenaissanceCorners,
  BrassPlacardPin,
  GildedMuseumFrame,
} from "@/components/renaissance/deco-assets"
import { DecryptedText } from "@/components/reactbits/decrypted-text"
import { museumBySlug, type Artifact, type Exhibition } from "@/lib/mock-data"

export function FlippableVitrineCard({ artifact }: { artifact: Artifact }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const museum = museumBySlug(artifact.museumSlug)
  const catalog = artifact.id.replace("art-", "SI-").toUpperCase()

  return (
    <div className="group relative aspect-[3/4.6] w-full [perspective:1200px]">
      <motion.div
        className="relative h-full w-full rounded-xl shadow-md transition-all duration-700 [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        {/* ==================== MẶT TRƯỚC (70% TRẮNG KEM VITRINE + KHUNG HOÀNG KIM) ==================== */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-xl border border-[#d4af37]/35 bg-white p-3.5 shadow-md transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_12px_32px_-8px_rgba(212,175,55,0.3)] [backface-visibility:hidden]">
          <RenaissanceCorners />

          {/* Khung Tranh Hoàng Kim Bảo Tàng (Không bị bo tròn cắt góc) */}
          <GildedMuseumFrame className="w-full">
            <div className="relative aspect-[4/3.8] w-full bg-stone-900">
              <Image
                src={artifact.image}
                alt={artifact.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 25vw"
              />
              <span className="absolute top-2.5 right-2.5 rounded-full border border-[#d4af37]/50 bg-[#08162b]/85 px-2.5 py-0.5 text-[0.62rem] font-semibold text-[#fbe396] shadow-sm backdrop-blur-sm">
                {artifact.year}
              </span>
            </div>
          </GildedMuseumFrame>

          {/* Thông tin tác phẩm */}
          <div className="pt-3">
            <div className="flex items-center gap-1.5">
              <BrassPlacardPin />
              <p className="placard text-xs text-stone-600 font-mono line-clamp-1">{artifact.artist}</p>
            </div>
            <h4 className="mt-1 font-heading text-xl font-light italic leading-snug line-clamp-1 text-[#171717]">
              {artifact.title}
            </h4>
            <p className="placard mt-1 font-mono text-xs tracking-[0.18em] text-[#92400e]">
              <DecryptedText text={catalog} animateOn="hover" speed={28} />
            </p>
          </div>

          {/* Nút bấm lật thẻ và xem chi tiết (Chỉ lật khi click, không tự lật lại khi rời chuột) */}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-stone-50/90 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 transition-all hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#08162b] active:scale-95 shadow-sm"
            >
              <RotateCcw className="size-3.5" /> Hồ sơ tác phẩm
            </button>
            <Link
              href={`/hien-vat/${artifact.slug}`}
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#d4af37]/60 bg-[#08162b] text-[#fbe396] shadow-sm transition-all hover:bg-[#d4af37] hover:text-[#08162b]"
              aria-label="Xem chi tiết"
            >
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* ==================== MẶT SAU (20% DEEP ROYAL NAVY #08162b) ==================== */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-xl border-2 border-[#d4af37]/60 bg-[#08162b] p-5 text-[#f8f6f0] shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <RenaissanceCorners />

          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="placard text-[0.68rem] tracking-widest text-[#d4af37] uppercase font-bold flex items-center gap-2">
                <BrassPlacardPin className="size-1.5" /> HỒ SƠ GIÁM TUYỂN
              </span>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="text-stone-300 hover:text-white p-1 transition-colors rounded-full hover:bg-white/10"
                aria-label="Quay lại mặt trước"
              >
                <RotateCcw className="size-4" />
              </button>
            </div>

            <h3 className="mt-3 font-heading text-xl md:text-2xl italic font-light text-white leading-snug">
              {artifact.title}
            </h3>
            <p className="placard mt-1 text-xs text-[#fbe396] font-medium">{artifact.artist} · {artifact.year}</p>
            {museum && (
              <p className="mt-0.5 text-xs text-stone-300 font-serif">{museum.name}</p>
            )}

            <div className="mt-4 space-y-2.5 text-xs md:text-sm text-stone-200 leading-relaxed max-h-40 overflow-y-auto museum-scrollbar pr-1">
              <p className="line-clamp-4">{artifact.description}</p>
              <div className="pt-2.5 border-t border-white/15 text-xs text-stone-300 space-y-1">
                <p><strong>Chất liệu:</strong> {artifact.medium}</p>
                <p><strong>Kích thước:</strong> {artifact.dimensions}</p>
                <p><strong>Bản quyền:</strong> {artifact.rights}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex gap-2">
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="flex items-center justify-center gap-1.5 rounded-full border border-stone-400/80 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-[#d4af37] hover:text-white transition-all"
            >
              <RotateCcw className="size-3.5" /> Lật lại
            </button>
            <Link
              href={`/hien-vat/${artifact.slug}`}
              className="group/cta flex flex-1 items-center justify-center gap-2 rounded-full bg-[#d4af37] py-2 text-xs font-bold uppercase tracking-wider text-[#08162b] shadow-md transition-all hover:bg-[#e2c14d]"
            >
              Xem chi tiết <ArrowRight className="size-4 transition-transform duration-300 group-hover/cta:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const exhibitionStatusLabel: Record<Exhibition["status"], string> = {
  ongoing: "Đang diễn ra",
  upcoming: "Sắp diễn ra",
  ended: "Đã kết thúc",
}

const exhibitionStatusTone: Record<Exhibition["status"], string> = {
  ongoing: "border border-[#d4af37] bg-gradient-to-br from-[#fbe396] to-[#d4af37] text-[#08162b]",
  upcoming: "border border-[#d4af37]/70 bg-[#08162b]/85 text-[#f5d77f]",
  ended: "border border-stone-300 bg-white/90 text-stone-600",
}

export function FlippableExhibitionCard({
  exhibition,
  museumName,
  status,
}: {
  exhibition: Exhibition
  museumName: string
  status: Exhibition["status"]
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const catalog = `EX-${exhibition.slug.slice(0, 8).toUpperCase()}`
  const range = `${new Date(exhibition.starts).toLocaleDateString("vi-VN")} – ${new Date(exhibition.ends).toLocaleDateString("vi-VN")}`

  return (
    <div className="group relative aspect-[3/4.6] w-full [perspective:1200px]">
      <motion.div
        className="relative h-full w-full rounded-xl shadow-md transition-all duration-700 [transform-style:preserve-3d]"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        {/* ==================== MẶT TRƯỚC ==================== */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-xl border border-[#d4af37]/35 bg-white p-3.5 shadow-md transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_12px_32px_-8px_rgba(212,175,55,0.3)] [backface-visibility:hidden]">
          <RenaissanceCorners />

          {/* Khung Hoàng Kim Bảo Tàng (Không bị bo tròn cắt góc) */}
          <GildedMuseumFrame className="w-full">
            <div className="relative aspect-[4/3.8] w-full bg-stone-900">
              <Image
                src={exhibition.image}
                alt={exhibition.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 33vw"
              />
              <span className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold shadow-sm backdrop-blur-sm ${exhibitionStatusTone[status]}`}>
                <BrassPlacardPin className="size-1.5" />
                {exhibitionStatusLabel[status]}
              </span>
            </div>
          </GildedMuseumFrame>

          <div className="pt-3">
            <div className="flex items-center gap-1.5">
              <BrassPlacardPin />
              <p className="placard line-clamp-1 font-mono text-xs text-stone-600">{museumName}</p>
            </div>
            <h4 className="mt-1 line-clamp-1 font-heading text-xl font-light italic leading-snug text-[#171717]">
              {exhibition.title}
            </h4>
            <p className="placard mt-1 font-mono text-xs tracking-[0.16em] text-[#92400e]">
              <DecryptedText text={catalog} animateOn="hover" speed={28} />
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsFlipped(!isFlipped)}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-stone-50/90 py-2 text-xs font-semibold uppercase tracking-wider text-stone-700 shadow-sm transition-all hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#08162b] active:scale-95"
          >
            <RotateCcw className="size-3.5" /> Thông tin chuyên đề
          </button>
        </div>

        {/* ==================== MẶT SAU ==================== */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-xl border-2 border-[#d4af37]/60 bg-[#08162b] p-5 text-[#f8f6f0] shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <RenaissanceCorners />
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="placard flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-widest text-[#d4af37]">
                <span className="text-xs">✦</span> Hồ sơ chuyên đề
              </span>
              <button
                type="button"
                onClick={() => setIsFlipped(false)}
                className="p-1 text-stone-400 transition-colors hover:text-white"
                aria-label="Quay lại mặt trước"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
            <h3 className="mt-3 font-heading text-xl font-light italic leading-snug text-white">
              {exhibition.title}
            </h3>
            <p className="placard mt-1 text-xs text-[#d4af37]">Giám tuyển · {exhibition.curator}</p>
            <p className="mt-1 text-[0.68rem] text-stone-400">{range}</p>
            <p className="mt-4 line-clamp-4 text-xs leading-relaxed text-stone-300">{exhibition.description}</p>
          </div>
          <div className="flex gap-2 border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setIsFlipped(false)}
              className="flex items-center justify-center gap-1.5 rounded-full border border-stone-400/80 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-[#d4af37] hover:text-white transition-all"
            >
              <RotateCcw className="size-3.5" /> Lật lại
            </button>
            <Link
              href={`/trien-lam/${exhibition.slug}`}
              className="group/cta flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#d4af37] py-2 text-xs font-bold uppercase tracking-wider text-[#08162b] shadow-md transition-all hover:bg-[#e2c14d]"
            >
              Chi tiết triển lãm
              <ArrowRight className="size-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
