"use client"

import React, { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, ArrowUpRight, Sparkles, Eye } from "lucide-react"
import { type Artifact } from "@/lib/mock-data"
import { BrassPlacardPin, RenaissanceCorners } from "@/components/renaissance/deco-assets"
import { StarBorder } from "@/components/reactbits/star-border"

interface MuseumHall3DProps {
  artifacts: Artifact[]
  museumName: string
  museumSlug: string
}

export function MuseumHall3D({ artifacts, museumName, museumSlug }: MuseumHall3DProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  if (!artifacts || artifacts.length === 0) return null

  const activeArt = artifacts[activeIndex] || artifacts[0]
  const catalog = activeArt.id.replace("art-", "SI-").toUpperCase()

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setMouseOffset({ x, y })
  }

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 })
  }

  return (
    <div className="relative my-12 w-full overflow-hidden rounded-3xl border border-[#d4af37]/40 bg-[#0d0905] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
      {/* Top Header Rail in 3D Gallery (Atelier style) */}
      <div className="relative z-30 flex items-center justify-between border-b border-white/10 bg-[#08162b]/80 px-6 py-4 backdrop-blur-md md:px-10">
        <div className="flex items-center gap-3">
          <span className="placard text-[0.68rem] tracking-[0.25em] text-[#d4af37] uppercase font-bold flex items-center gap-2">
            <BrassPlacardPin className="size-2" />
            KHÔNG GIAN TRƯNG BÀY 3D · HALL OF MASTERPIECES
          </span>
          <span className="hidden sm:inline text-xs text-stone-400">|</span>
          <span className="hidden sm:inline font-serif text-xs italic text-stone-300">{museumName}</span>
        </div>

        {/* Navigation Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {artifacts.map((art, idx) => (
            <button
              key={art.id}
              onClick={() => setActiveIndex(idx)}
              className={`rounded-full px-3 py-1 text-[0.68rem] font-mono tracking-wider transition-all duration-300 ${
                idx === activeIndex
                  ? "bg-[#d4af37] text-[#08162b] font-bold shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                  : "border border-white/10 bg-white/5 text-stone-300 hover:border-[#d4af37]/50 hover:text-white"
              }`}
            >
              PLINTH 0{idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Perspective Gallery Room (Matching Ảnh 4) */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[580px] w-full [perspective:1400px] overflow-hidden bg-gradient-to-b from-[#120d09] via-[#1a140d] to-[#0c0906]"
      >
        {/* Gallery Ceiling Light Strip (Ánh sáng trần dải dài) */}
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-3 md:w-5 h-full bg-gradient-to-b from-white/90 via-white/40 to-transparent blur-[2px] opacity-75 shadow-[0_0_50px_rgba(255,255,255,0.8)]" />

        {/* Ambient Warm Gallery Spotlight Cone */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(212,175,55,0.18)_0%,rgba(0,0,0,0.8)_85%)]" />

        {/* Perspective Gallery Walls & Floor with 3D Parallax */}
        <motion.div
          animate={{
            rotateY: mouseOffset.x * 6,
            rotateX: -mouseOffset.y * 4,
          }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="relative h-full w-full min-h-[580px] [transform-style:preserve-3d] flex items-center justify-center p-6 md:p-12"
        >
          {/* 3D Pedestals Stage (Plinths in Perspective Corridor) */}
          <div className="relative z-10 flex w-full max-w-6xl items-center justify-center gap-4 md:gap-8 lg:gap-12">
            {artifacts.map((art, idx) => {
              const isSelected = idx === activeIndex
              const offsetFromActive = idx - activeIndex

              return (
                <motion.div
                  key={art.id}
                  onClick={() => setActiveIndex(idx)}
                  animate={{
                    scale: isSelected ? 1.08 : 0.85,
                    opacity: Math.abs(offsetFromActive) > 2 ? 0.3 : isSelected ? 1 : 0.65,
                    y: isSelected ? -10 : 15,
                    z: isSelected ? 40 : -40 * Math.abs(offsetFromActive),
                  }}
                  transition={{ type: "spring", stiffness: 200, damping: 24 }}
                  className="group relative cursor-pointer flex flex-col items-center select-none"
                  style={{
                    display: Math.abs(offsetFromActive) > 2 ? "none" : "flex",
                  }}
                >
                  {/* Spotlight Circle on the floor beneath pedestal */}
                  <div
                    className={`absolute -bottom-8 size-36 md:size-48 rounded-full transition-all duration-500 blur-md ${
                      isSelected
                        ? "bg-[#d4af37]/45 shadow-[0_0_40px_rgba(212,175,55,0.7)] scale-110"
                        : "bg-stone-700/20 group-hover:bg-[#d4af37]/20"
                    }`}
                  />

                  {/* Artwork on Exhibition Plinth with 3D Gilded Frame */}
                  <div
                    className={`relative aspect-[3/3.6] w-48 sm:w-56 md:w-64 overflow-hidden rounded-xl border-2 transition-all duration-500 ${
                      isSelected
                        ? "border-[#d4af37] shadow-[0_15px_40px_rgba(212,175,55,0.45)] ring-2 ring-[#ffd700]/30"
                        : "border-stone-700 bg-stone-900/90 opacity-70 group-hover:opacity-90 group-hover:border-[#d4af37]/60"
                    }`}
                  >
                    <Image
                      src={art.image}
                      alt={art.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width:768px) 50vw, 30vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    {/* Badge on plinth */}
                    <span className="absolute bottom-2.5 left-2.5 right-2.5 text-center rounded bg-black/75 px-2 py-1 text-[0.62rem] font-mono tracking-wider text-[#fbe396] backdrop-blur-sm truncate">
                      {art.title}
                    </span>
                  </div>

                  {/* Classical Architectural Pedestal / Plinth */}
                  <div className="relative mt-2 w-36 sm:w-44 h-12 md:h-16 bg-gradient-to-b from-[#2a2218] via-[#1a140d] to-[#0d0905] rounded-b-md border-t-2 border-[#d4af37]/60 border-x border-stone-800 shadow-2xl flex flex-col items-center justify-center">
                    <span className="placard text-[0.62rem] text-[#d4af37] tracking-[0.2em] font-mono">
                      PLINTH 0{idx + 1}
                    </span>
                    <span className="text-[0.6rem] text-stone-400 font-serif italic truncate max-w-[85%]">
                      {art.artist}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Floating Curator Glass Placard (Matching Ảnh 4 - Atelier Marne Style) */}
          <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 max-w-sm md:max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeArt.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="relative rounded-2xl border border-[#d4af37]/45 bg-[#08162b]/90 p-6 text-[#f8f6f0] shadow-2xl backdrop-blur-xl"
              >
                <RenaissanceCorners />

                {/* Subtitle / Plinth tag */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <span className="placard flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#d4af37]">
                    <BrassPlacardPin className="size-1.5" />
                    PLINTH 0{activeIndex + 1} · {catalog}
                  </span>
                  <span className="rounded-full border border-[#d4af37]/40 bg-[#d4af37]/15 px-2 py-0.5 text-[0.62rem] text-[#fbe396]">
                    {activeArt.year}
                  </span>
                </div>

                {/* Main Heading */}
                <h3 className="mt-3 font-heading text-2xl md:text-3xl font-light italic leading-snug text-white">
                  {activeArt.title}
                </h3>
                <p className="placard mt-1 text-xs text-[#d4af37] font-serif">{activeArt.artist}</p>

                {/* Curatorial description */}
                <p className="mt-3.5 text-xs text-stone-300 leading-relaxed line-clamp-3">
                  {activeArt.description}
                </p>

                {/* Curatorial metadata tags */}
                <div className="mt-4 flex flex-wrap gap-2 text-[0.65rem] text-stone-400">
                  <span className="rounded bg-white/5 px-2 py-0.5 border border-white/10">
                    Chất liệu: {activeArt.medium.split(",")[0]}
                  </span>
                  <span className="rounded bg-white/5 px-2 py-0.5 border border-white/10">
                    Bản quyền: {activeArt.rights}
                  </span>
                </div>

                {/* CTAs */}
                <div className="mt-5 flex items-center gap-3 pt-3 border-t border-white/10">
                  <Link
                    href={`/hien-vat/${activeArt.slug}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#d4af37] py-2 text-xs font-bold uppercase tracking-wider text-[#08162b] shadow-md transition-all hover:bg-[#e2c14d]"
                  >
                    Xem chi tiết <ArrowUpRight className="size-3.5" />
                  </Link>

                  <Link href={`/dat-ve?museum=${museumSlug}`}>
                    <span className="rounded-full border border-stone-400 px-3 py-2 text-xs font-semibold text-stone-200 hover:border-[#d4af37] hover:text-white transition-all flex items-center gap-1">
                      Đặt vé <Sparkles className="size-3 text-[#d4af37]" />
                    </span>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Left / Right Navigation Arrows */}
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
            <button
              onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : artifacts.length - 1))}
              className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#08162b]"
              aria-label="Hiện vật trước đó"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev < artifacts.length - 1 ? prev + 1 : 0))}
              className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#08162b]"
              aria-label="Hiện vật tiếp theo"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

