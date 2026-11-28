"use client"

import "./natural-history-page.css"
import { SketchfabStage } from "./sketchfab-stage"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  specimens,
  ERA_LABELS,
  CATEGORIES,
  type NHSpecimen,
  type Era,
} from "@/lib/natural-history-specimens"

// ── inline SVG icons ──────────────────────────────────────────────────────────
function Icon({ id, size = 20 }: { id: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <use href={`#nha-icon-${id}`} />
    </svg>
  )
}

function IconDefs() {
  return (
    <svg style={{ display: "none" }} aria-hidden>
      <defs>
        <symbol id="nha-icon-ruler" viewBox="0 0 24 24">
          <path d="M2 12.5h20M6 8v9M10 10v5M14 10v5M18 8v9" />
        </symbol>
        <symbol id="nha-icon-weight" viewBox="0 0 24 24">
          <path d="M12 3a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /><path d="M5 21h14l-2-10H7L5 21z" />
        </symbol>
        <symbol id="nha-icon-fish" viewBox="0 0 24 24">
          <path d="M6.5 12c0-5 4-8 9-8s7 3 7 8-2 8-7 8-9-3-9-8z" /><path d="M1.5 9l3 3-3 3" />
        </symbol>
        <symbol id="nha-icon-globe" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10A15.3 15.3 0 0 1 12 22 15.3 15.3 0 0 1 8 12 15.3 15.3 0 0 1 12 2z" />
        </symbol>
        <symbol id="nha-icon-speed" viewBox="0 0 24 24">
          <path d="M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 0 0-4 0" /><path d="M4.9 4.9A9 9 0 0 0 3 12M19.1 4.9A9 9 0 0 1 21 12M15.5 8.5l-3.5 3.5" />
        </symbol>
        <symbol id="nha-icon-sun" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </symbol>
        <symbol id="nha-icon-moon" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </symbol>
        <symbol id="nha-icon-expand" viewBox="0 0 24 24">
          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
        </symbol>
        <symbol id="nha-icon-compress" viewBox="0 0 24 24">
          <path d="M9 9V3M9 9H3M15 9V3M15 9h6M9 15v6M9 15H3M15 15v6M15 15h6" />
        </symbol>
        <symbol id="nha-icon-chevron-right" viewBox="0 0 24 24">
          <path d="M9 18l6-6-6-6" />
        </symbol>
        <symbol id="nha-icon-habitat" viewBox="0 0 24 24">
          <path d="M3 17l3-7 4 4 3-6 4 9" /><line x1="3" y1="20" x2="21" y2="20" />
        </symbol>
        <symbol id="nha-icon-museum" viewBox="0 0 24 24">
          <path d="M3 21h18M3 10h18M3 7l9-4 9 4M5 10v11M9 10v11M13 10v11M17 10v11M19 10v11" />
        </symbol>
        <symbol id="nha-icon-bones" viewBox="0 0 24 24">
          <path d="M6.5 6.5a2.5 2.5 0 0 1 3.536 3.536L4.5 15.5a2.5 2.5 0 0 1-3.536-3.536zm11 11a2.5 2.5 0 0 1 3.536 3.536L15.5 16.5a2.5 2.5 0 0 1-3.536-3.536zM14.5 2.5a2.5 2.5 0 0 1 0 3.536L9.5 11.5A2.5 2.5 0 0 1 5.964 7.964z" />
        </symbol>
        <symbol id="nha-icon-animal" viewBox="0 0 24 24">
          <path d="M18 11a4 4 0 0 1-4 4H9l-5 5V9a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4z" />
        </symbol>
        <symbol id="nha-icon-plant" viewBox="0 0 24 24">
          <path d="M12 22V12M12 12C12 7 8 3 3 3c0 5 3 9 9 9M12 12c0-5 4-9 9-9-1 5-4 9-9 9" />
        </symbol>
        <symbol id="nha-icon-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </symbol>
        <symbol id="nha-icon-close" viewBox="0 0 24 24">
          <path d="M18 6 6 18M6 6l12 12" />
        </symbol>
        <symbol id="nha-icon-dino" viewBox="0 0 24 24">
          <path d="M4 20c0-4 2-6 4-7l3-1 2-4h3l1 3h2v3l-2 1v5H4z" />
        </symbol>
        <symbol id="nha-icon-mammoth" viewBox="0 0 24 24">
          <path d="M6 18c0-4 2-6 4-7 1-3 2-5 4-5s3 2 4 5c1 1 2 3 2 7M9 18v-4M15 18v-4M4 10c-1-1-2-3 0-4 1-1 3 0 3 2M20 10c1-1 2-3 0-4-1-1-3 0-3 2" />
        </symbol>
      </defs>
    </svg>
  )
}

// ── Sketchfab iframe ──────────────────────────────────────────────────────────
// ── trait icon map ────────────────────────────────────────────────────────────
const TRAIT_ICON: Record<string, string> = {
  ruler: "ruler",
  weight: "weight",
  fish: "fish",
  globe: "globe",
  speed: "speed",
}

// ── detail panel ─────────────────────────────────────────────────────────────
function DetailPanel({ specimen: s }: { specimen: NHSpecimen }) {
  const eraInfo = ERA_LABELS[s.era]
  const [closeupOpen, setCloseupOpen] = useState(false)
  const ref = useRef<HTMLElement>(null)

  // stagger children in on mount
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const children = Array.from(el.children) as HTMLElement[]
    children.forEach((c, i) => {
      c.style.opacity = "0"
      c.style.transform = "translateY(12px)"
      const tid = setTimeout(() => {
        c.style.transition = "opacity .6s cubic-bezier(.22,.8,.24,1), transform .6s cubic-bezier(.22,.8,.24,1)"
        c.style.opacity = "1"
        c.style.transform = ""
      }, i * 45)
      return () => clearTimeout(tid)
    })
  }, [s.id])

  return (
    <article ref={ref} className="nha-detail" aria-live="polite">
      <p className="nha-detail__eyebrow">{s.family}</p>
      <h1 className="nha-detail__name">{s.name}</h1>
      <div className="nha-detail__tags">
        {s.tags.map((t) => <span key={t} className="nha-chip">{t}</span>)}
      </div>
      <p className="nha-detail__desc">{s.description}</p>

      <h2 className="nha-detail__h2">Đặc điểm nổi bật</h2>
      <div className="nha-traits">
        {s.traits.map((tr) => (
          <div key={tr.label} className="nha-trait">
            <Icon id={TRAIT_ICON[tr.icon] ?? "ruler"} size={18} />
            <span className="nha-trait__label">{tr.label}</span>
            <span className="nha-trait__val">{tr.value}</span>
          </div>
        ))}
      </div>

      <h2 className="nha-detail__h2">Môi trường sống</h2>
      <div className="nha-habitat">
        <Icon id="habitat" size={18} />
        <span>{s.habitat}</span>
      </div>

      <button
        className={`nha-closeup-btn${closeupOpen ? " is-open" : ""}`}
        onClick={() => setCloseupOpen((v) => !v)}
        aria-pressed={closeupOpen}
      >
        <div
          className="nha-closeup-btn__lens"
          style={{
            backgroundImage: `url(${s.image})`,
            backgroundPosition: s.closeup.lensPosition,
            backgroundSize: "520%",
          }}
        />
        <div className="nha-closeup-btn__body">
          <span className="nha-closeup-btn__title">Chi tiết cận cảnh</span>
          <span className="nha-closeup-btn__sub">{s.closeup.text}</span>
        </div>
        <Icon id="chevron-right" size={16} />
      </button>
    </article>
  )
}

// ── era pill ─────────────────────────────────────────────────────────────────
function EraPill({ era }: { era: Era }) {
  const e = ERA_LABELS[era]
  return (
    <span className="nha-era-pill" data-era={era} title={e.en}>
      {e.vi}
    </span>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function NaturalHistoryPage() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [catFilter, setCatFilter] = useState<"all" | "khung-long" | "co-sinh-vat" | "thu-tien-su" | "dong-vat-song" | "san-ho" | "dia-chat" | "thuc-vat" | "khao-co">("all")
  const [theme, setTheme] = useState<"day" | "dusk">("day")
  const [expanded, setExpanded] = useState(false)
  const [iframeLoading, setIframeLoading] = useState(true)
  const heroRef = useRef<HTMLDivElement>(null)

  const filtered = catFilter === "all" ? specimens : specimens.filter((s) => s.category === catFilter)
  // clamp activeIdx when filter changes
  const safeIdx = Math.min(activeIdx, filtered.length - 1)
  const active = filtered[safeIdx] ?? specimens[0]

  const switchTo = useCallback((idx: number) => {
    setActiveIdx(idx)
    setIframeLoading(true)
    // iframe's onLoad fires via key remount; simulate minimal delay
    setTimeout(() => setIframeLoading(false), 2200)
  }, [])

  useEffect(() => {
    function selectLinkedSpecimen() {
      const index = specimens.findIndex(({ id }) => id === window.location.hash.slice(1))
      if (index >= 0) {
        setCatFilter("all")
        switchTo(index)
      }
    }
    selectLinkedSpecimen()
    window.addEventListener("hashchange", selectLinkedSpecimen)
    return () => window.removeEventListener("hashchange", selectLinkedSpecimen)
  }, [switchTo])

  // keyboard on hero
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false)
      if (e.key === "ArrowLeft") switchTo(Math.max(0, safeIdx - 1))
      if (e.key === "ArrowRight") switchTo(Math.min(filtered.length - 1, safeIdx + 1))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [safeIdx, filtered.length, switchTo])

  // reset loading on first specimen
  useEffect(() => { setTimeout(() => setIframeLoading(false), 2200) }, [])

  return (
    <div
      ref={heroRef}
      className={`nha-hero${expanded ? " is-expanded" : ""}`}
      data-theme={theme}
    >
      {specimens.map(({ id }) => <span key={id} id={id} className="nha-exhibit-anchor" aria-hidden="true" />)}
      <IconDefs />

      {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
      <aside className="nha-sidebar">
        <div className="nha-brand">
          <Icon id="museum" size={18} />
          <span>Lịch sử Tự nhiên</span>
        </div>

        <nav className="nha-cat-nav" aria-label="Phân loại">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`nha-cat-btn${catFilter === cat.id ? " is-active" : ""}`}
              onClick={() => { setCatFilter(cat.id as typeof catFilter); setActiveIdx(0) }}
            >
              <Icon id={cat.icon} size={17} />
              <span>{cat.label}</span>
            </button>
          ))}
        </nav>

        <div className="nha-era-legend">
          <p className="nha-sidebar__label">Thời đại địa chất</p>
          {(["paleozoic", "creta", "pleistocene", "recent"] as Era[]).map((era) => (
            <div key={era} className="nha-era-row" data-era={era}>
              <span className="nha-era-dot" />
              <span>{ERA_LABELS[era].vi}</span>
              <span className="nha-era-en">{ERA_LABELS[era].en}</span>
            </div>
          ))}
        </div>

        {/* featured card */}
        <div className="nha-featured-card">
          <p className="nha-featured-card__eyebrow">TIÊU BẢN ĐANG XEM</p>
          <img
            src={active.image}
            alt={active.name}
            className="nha-featured-card__img"
            loading="lazy"
          />
          <p className="nha-featured-card__title">{active.featured.title}</p>
          <p className="nha-featured-card__text">{active.featured.text}</p>
          <EraPill era={active.era} />
        </div>
      </aside>

      {/* ── CENTER STAGE ─────────────────────────────────────── */}
      <section className="nha-center">
        {/* tabs */}
        <div className="nha-tabs" role="tablist" aria-label="Chọn tiêu bản">
          {filtered.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === safeIdx}
              className={`nha-tab${i === safeIdx ? " is-active" : ""}`}
              onClick={() => switchTo(i)}
            >
              <img src={s.image} alt={s.nameVi} className="nha-tab__img" loading="lazy" />
              <span className="nha-tab__name">{s.nameVi}</span>
              <span className="nha-tab__latin">{s.latin}</span>
            </button>
          ))}
        </div>

        {/* 3D stage */}
        <div className="nha-stage">
          <SketchfabStage uid={active.sketchfabUid} theme={theme} loading={iframeLoading} />

          {/* rail buttons */}
          <div className="nha-rail">
            <button
              className={`nha-rail-btn${expanded ? " is-on" : ""}`}
              aria-label={expanded ? "Thu nhỏ" : "Mở rộng"}
              aria-pressed={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              <Icon id={expanded ? "compress" : "expand"} size={17} />
            </button>
            <button
              className={`nha-rail-btn${theme === "dusk" ? " is-on" : ""}`}
              aria-label={theme === "dusk" ? "Chế độ ban ngày" : "Chế độ hoàng hôn"}
              aria-pressed={theme === "dusk"}
              onClick={() => setTheme((v) => (v === "day" ? "dusk" : "day"))}
            >
              <Icon id={theme === "dusk" ? "sun" : "moon"} size={17} />
            </button>
          </div>

          <p className="nha-caption" aria-live="polite">{active.caption}</p>
        </div>
      </section>

      {/* ── RIGHT DETAIL ─────────────────────────────────────── */}
      <section className="nha-right">
        <div className="nha-detail-card">
          <DetailPanel key={active.id} specimen={active} />
        </div>
      </section>
    </div>
  )
}
