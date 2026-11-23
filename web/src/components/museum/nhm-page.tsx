"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, usePresence } from "framer-motion"
import { ArrowUpRight, Bone, Dna, Gem, Leaf, BookOpen } from "lucide-react"
import { FloralCanvas } from "./floral-canvas"

// ── Data ────────────────────────────────────────────────────────────────────
const chapters = [
  { name: "Thời đại Khủng long",         image: "/nhm/01.png" },
  { name: "Hóa thạch Sự sống Cổ đại",    image: "/nhm/02.png" },
  { name: "Bò sát Kỷ Trung sinh",        image: "/nhm/03.png" },
  { name: "Phòng trưng bày Hóa thạch Biển", image: "/nhm/04.png" },
  { name: "Những Khổng lồ Tiền sử",      image: "/nhm/05.png" },
]

// ── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}
const letterBlock = {
  initial: { y: 120, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as const } },
}

// ── SandTransitionImage ─────────────────────────────────────────────────────
function SandTransitionImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [isPresent, safeToRemove] = usePresence()
  const imgRef    = useRef<HTMLImageElement>(null)
  const svgRef    = useRef<SVGSVGElement>(null)
  const filterRef = useRef<string>(`sand-${Math.random().toString(36).slice(2)}`)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const duration = 900
    const start    = performance.now()
    const entering = isPresent

    const tick = (now: number) => {
      const raw = Math.min((now - start) / duration, 1)
      const t   = entering
        ? 1 - Math.pow(1 - raw, 4)
        : Math.pow(raw, 3)
      const progress = entering ? t : t

      const svg = svgRef.current
      if (!svg) return

      const turb = svg.querySelector("feTurbulence")
      const disp = svg.querySelector("feDisplacementMap")
      const off  = svg.querySelector("feOffset")
      const blur = svg.querySelector("feGaussianBlur")
      const col  = svg.querySelector("feColorMatrix")

      if (turb) turb.setAttribute("baseFrequency", "1.8")
      if (disp) disp.setAttribute("scale", String(entering ? (1 - t) * 150 : t * 150))
      if (off)  off.setAttribute("dy",  String(entering ? (1 - t) * -80 : t * 120))
      if (off)  off.setAttribute("dx",  String(entering ? (1 - t) * -30 : t * 30))
      if (blur) blur.setAttribute("stdDeviation", String(entering ? (1 - t) * 6 : t * 6))
      if (col)  col.setAttribute("values", `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${entering ? t : 1 - t * 1.2} 0`)

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else if (!entering) {
        safeToRemove?.()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPresent, safeToRemove])

  const id = filterRef.current
  return (
    <>
      <svg ref={svgRef} style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves={4} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" result="displaced" />
            <feOffset dx="0" dy="0" in="displaced" result="offset" />
            <feGaussianBlur in="offset" stdDeviation="0" result="blurred" />
            <feColorMatrix in="blurred" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 0" />
          </filter>
        </defs>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        className={className}
        style={{ filter: `url(#${id})` }}
      />
    </>
  )
}

// ── Museum title — per-letter typewriter, Newsreader serif ──────────────────
const TITLE_LINE1 = "BẢO TÀNG".split("")
const TITLE_LINE2 = "LỊCH SỬ TỰ NHIÊN".split("")

function MuseumTitle() {
  const h1Ref = useRef<HTMLHeadingElement>(null)
  return (
    <div className="relative">
      <motion.h1
        ref={h1Ref}
        className="relative z-[1] leading-[1.15] tracking-[0.02em] uppercase select-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 5.8vw, 6rem)",
          fontWeight: 400,
          color: "#111",
        }}
        initial="initial"
        animate="animate"
        variants={{ animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } } }}
      >
        <div>
          {TITLE_LINE1.map((ch, i) => (
            <motion.span
              key={i}
              className={`inline-block${ch !== " " ? " flor-letter" : ""}`}
              variants={{
                initial: { opacity: 0, y: "0.06em" },
                animate: { opacity: 1, y: 0, transition: { duration: 0.18, ease: "easeOut" } },
              }}
            >
              {ch === " " ? "\u00a0" : ch}
            </motion.span>
          ))}
        </div>
        <div>
          {TITLE_LINE2.map((ch, i) => (
            <motion.span
              key={i}
              className={`inline-block${ch !== " " ? " flor-letter" : ""}`}
              variants={{
                initial: { opacity: 0, y: "0.06em" },
                animate: {
                  opacity: 1, y: 0,
                  transition: { duration: 0.18, ease: "easeOut", delay: TITLE_LINE1.length * 0.07 },
                },
              }}
            >
              {ch === " " ? "\u00a0" : ch}
            </motion.span>
          ))}
        </div>
      </motion.h1>
      <FloralCanvas titleRef={h1Ref} />
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function NHMPage() {
  const [showVideo,     setShowVideo]     = useState(false)
  const [activeChapter, setActiveChapter] = useState(2)

  useEffect(() => {
    const t = setTimeout(() => setShowVideo(true), 2800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const iv = setInterval(() => setActiveChapter(p => (p + 1) % 5), 3500)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className="bg-[#fcfcfc] text-[#111] overflow-x-hidden font-sans selection:bg-black selection:text-white">
      <div className="fixed inset-0 pointer-events-none z-[55]"
        style={{ background: "rgba(10, 40, 80, 0.22)" }} />

      {/* ══ SECTION 1: HERO ══════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-screen flex flex-col overflow-hidden pt-[72px]">

        {/* Background video */}
        {showVideo && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="/nhm/hero.mp4" type="video/mp4" />
            </video>
          </div>
        )}

        {/* Header */}
        <motion.header
          className="pt-6 px-6 md:px-16 z-20"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
        >

          {/* Big title below the sub-nav */}
          <MuseumTitle />
        </motion.header>


        {/* Hero content — 2 col: headline left, descriptions right */}
        <motion.div
          className="px-6 md:px-16 mt-8 md:mt-12 z-10 flex flex-col md:flex-row md:items-end gap-10 md:gap-16"
          initial="initial"
          animate="animate"
          variants={{ animate: { transition: { staggerChildren: 0.15, delayChildren: 0.6 } } }}
        >
          {/* Left: 01 + headline */}
          <div className="flex-shrink-0">
            <motion.div variants={fadeUp} transition={{ duration: 0.8 }} className="flex items-center gap-3 mb-5">
              <span className="text-xs font-mono text-gray-500">01</span>
              <div className="w-16 h-[1.5px] bg-black/20" />
            </motion.div>

            <motion.h2 variants={fadeUp} transition={{ duration: 0.8 }}
              className="text-[3.5rem] md:text-[5rem] font-normal tracking-tight leading-[1]"
              style={{ fontFamily: "var(--font-display)" }}>
              DI SẢN<br/>ĐẤT TRỜI
            </motion.h2>
          </div>

          {/* Right: 2 descriptions, bigger */}
          <motion.div
            variants={fadeUp} transition={{ duration: 0.8 }}
            className="flex flex-col gap-6 max-w-[480px] pb-2"
          >
            <p className="text-[1.1rem] md:text-[1.25rem] text-gray-800 leading-[1.55] font-mono">
              Khám phá câu chuyện về sự sống trên Trái Đất<br className="hidden md:block"/>
              qua khoa học, khám phá và kỳ quan.
            </p>
            <p className="text-[1.1rem] md:text-[1.25rem] text-gray-600 leading-[1.55] font-mono">
              Bước vào thế giới tự nhiên và khám phá<br className="hidden md:block"/>
              những câu chuyện được viết từ hàng triệu năm trước.
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="hidden md:flex absolute bottom-10 left-16 items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center gap-[4px]">
            <div className="w-[1px] h-[12px] bg-gray-600" />
            <div className="w-[1px] h-[12px] bg-gray-600" />
          </div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 font-semibold">Cuộn để khám phá</span>
        </motion.div>
      </section>

      {/* ══ SECTION 2: EXPLORE OUR WORLD ════════════════════════════════════ */}
      <section className="relative w-full bg-[#fcfcfc] flex flex-col pt-6 md:pt-8 pb-6 md:pb-8 z-20 px-8 md:px-16 overflow-hidden">

        {/* 2-col: label+text left | pterodactyl right */}
        <div className="flex flex-col md:flex-row md:items-center gap-0 mb-5 w-full">
          <motion.div
            className="md:w-[44%] flex-shrink-0 flex flex-col gap-5"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
          >
            {/* Label */}
            <div className="text-[20px] md:text-[26px] font-mono tracking-[0.2em] flex items-center gap-4">
              <span className="text-gray-400">02</span>
              <span className="text-gray-900 font-bold uppercase tracking-[0.22em]">Khám Phá Thế Giới</span>
            </div>
            {/* Body */}
            <h2 className="text-[1.25rem] md:text-[1.6rem] lg:text-[1.9rem] leading-[1.45] font-medium tracking-tight text-[#111]">
              Giải mã câu chuyện của hành tinh chúng ta qua hóa thạch, khoáng vật và những kỳ quan cổ đại.
            </h2>
          </motion.div>

          {/* Pterodactyl — bigger, flush right, bleed edge */}
          <motion.div
            className="hidden md:flex flex-1 items-center justify-end -mr-16"
            initial={{ opacity: 0, x: 80 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }} transition={{ duration: 1.3, ease: "easeOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nhm/pterodactyl.png" alt="Pterodactyl fossil" className="w-full max-w-[1100px]" />
          </motion.div>
        </div>

        {/* Buttons — full width below both columns */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 md:gap-4"
          initial="initial" whileInView="animate" viewport={{ once: true }}
          variants={{ animate: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
        >
          {[
            { icon: <Bone size={14} strokeWidth={2} />, label: "Khủng long" },
            { icon: <Dna size={14} strokeWidth={2} />,  label: "Sự sống Cổ đại" },
            { icon: <Gem size={14} strokeWidth={2} />,  label: "Khoáng vật" },
            { icon: <Leaf size={14} strokeWidth={2} />, label: "Hóa thạch" },
            { icon: <BookOpen size={14} strokeWidth={2} />, label: "Tìm hiểu thêm" },
          ].map(({ icon, label }) => (
            <motion.button
              key={label}
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-[11px] font-medium uppercase tracking-wider bg-white/50 backdrop-blur-sm text-gray-800 hover:border-black hover:bg-black hover:text-white transition-colors duration-300"
            >
              {icon}{label}
            </motion.button>
          ))}
        </motion.div>
      </section>

      {/* ══ SECTION 3: ANCIENT COLLECTION ═══════════════════════════════════ */}
      <section className="relative w-full bg-[#0a0a0a] text-white flex flex-col z-30">

        {/* Heading area */}
        <div className="px-8 md:px-16 pt-32 md:pt-48 mb-16 z-10 flex flex-col xl:flex-row justify-between gap-12">
          <h2 className="text-[1.8rem] md:text-[3rem] lg:text-[3.8rem] xl:text-[4rem] leading-[1.15] font-medium tracking-tight text-white max-w-3xl">
            Được chắt lọc từ hàng triệu năm kỳ quan{" "}
            <span className="inline-flex gap-2 md:gap-3 align-middle mx-2 md:mx-4" style={{ transform: "translateY(-4px)" }}>
              {[Bone, Dna, Leaf].map((Icon, i) => (
                <button key={i} className="w-10 h-10 md:w-14 md:h-14 rounded-full border border-gray-600 bg-black text-gray-400 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-colors duration-300">
                  <Icon size={22} />
                </button>
              ))}
            </span>
            {" "}& khám phá.
          </h2>

          <div className="flex flex-col gap-6 xl:items-end">
            <p className="text-[9px] md:text-[10px] font-mono tracking-widest text-gray-400 uppercase leading-relaxed">
              CHÚNG TÔI KHÔNG CHỈ TRƯNG BÀY HÓA THẠCH<br/>CHÚNG TÔI CHIA SẺ CÂU CHUYỆN CỦA TRÁI ĐẤT
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="/dat-ve" className="px-6 py-2.5 rounded-full bg-white text-black text-[10px] font-semibold tracking-widest uppercase hover:bg-gray-100 transition-colors duration-300">
                Đặt vé ngay
              </a>
              <a href="/tham-quan/lich-su-tu-nhien" className="px-6 py-2.5 rounded-full border border-gray-600 text-[10px] font-mono tracking-widest uppercase text-gray-300 hover:bg-white hover:text-black hover:border-white transition-colors duration-300">
                Tham quan hiện vật số
              </a>
            </div>
          </div>
        </div>

        {/* Two-column panel */}
        <div className="border-t border-gray-800" />
        <div className="flex flex-col md:flex-row">

          {/* Left: image viewer */}
          <div className="relative md:w-[35%] border-b md:border-b-0 md:border-r border-gray-800 min-h-[400px] md:min-h-[500px] flex flex-col justify-between p-8">
            <div className="text-gray-500 text-xl tracking-[0.3em]">***</div>

            <div className="relative flex-1 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <SandTransitionImage
                  key={activeChapter}
                  src={chapters[activeChapter].image}
                  alt={chapters[activeChapter].name}
                  className="absolute inset-0 w-[80%] h-[80%] m-auto object-contain mix-blend-lighten"
                />
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#888]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeChapter}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="inline-block"
                  >
                    {String(activeChapter + 1).padStart(2, "0")}
                  </motion.span>
                </AnimatePresence>
              </span>
              <span className="text-[#333] text-[10px] font-mono">/ 05</span>
            </div>
          </div>

          {/* Right: chapter list */}
          <div className="md:w-[65%] flex flex-col">
            <div className="border-b border-gray-800 p-8 flex justify-between items-center">
              <span className="text-[10px] font-mono text-gray-400 tracking-widest uppercase">Khám phá quá khứ. Hiểu hiện tại.</span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeChapter}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.3 }}
                  className="text-[10px] font-mono text-gray-500 tracking-widest uppercase"
                >
                  Chương {String(activeChapter + 1).padStart(2, "0")}
                </motion.span>
              </AnimatePresence>
            </div>

            {chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => setActiveChapter(i)}
                className={`flex items-center justify-between border-b border-gray-800/80 py-8 px-8 text-left transition-colors duration-300 ${
                  i === activeChapter ? "text-white" : "text-[#444] hover:text-[#999]"
                }`}
              >
                <span className="text-2xl md:text-[2rem] font-medium tracking-tight">{ch.name}</span>
                {i === activeChapter && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <ArrowUpRight size={22} strokeWidth={1} className="text-gray-400" />
                  </motion.span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer line */}
        <div className="h-[1px] bg-gray-800" />
        <div className="px-8 py-8 text-[10px] font-mono tracking-widest text-gray-500 uppercase bg-[#0a0a0a]">
          KHÁM PHÁ QUÁ KHỨ CỦA HÀNH TINH CHÚNG TA
        </div>
      </section>
    </div>
  )
}

