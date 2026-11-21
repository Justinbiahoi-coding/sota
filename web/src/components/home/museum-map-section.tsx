"use client"

import { useState } from "react"
import Link from "next/link"
import { museums } from "@/lib/mock-data"

// Approximate positions (cx%, cy%) on the National Mall aerial schematic
const POSITIONS: Record<string, { cx: number; cy: number; w: number; h: number; shape?: "circle" }> = {
  "lich-su-tu-nhien":    { cx: 32, cy: 26, w: 14, h: 10 },
  "lich-su-hoa-ky":     { cx: 14, cy: 26, w: 11, h: 10 },
  "hang-khong-vu-tru":  { cx: 68, cy: 68, w: 14, h: 9  },
  "phong-tranh-chan-dung": { cx: 20, cy: 68, w: 10, h: 10 },
  "hirshhorn":          { cx: 50, cy: 68, w: 9,  h: 9,  shape: "circle" },
  "nghe-thuat-chau-a":  { cx: 36, cy: 68, w: 10, h: 8  },
}

// Extra static landmarks (non-interactive)
const LANDMARKS = [
  { label: "National Mall", cx: 50, cy: 48, w: 60, h: 14, type: "mall" },
  { label: "Capitol", cx: 88, cy: 48, w: 7,  h: 10, type: "bldg" },
  { label: "Washington Monument", cx: 50, cy: 48, type: "monument" },
  { label: "Smithsonian Castle", cx: 50, cy: 60, w: 8, h: 6, type: "castle" },
]

export function MuseumMapSection() {
  const [active, setActive] = useState(museums[0].slug)
  const selected = museums.find(m => m.slug === active) ?? museums[0]

  return (
    <section className="bg-[#161318] py-24 px-6 overflow-clip relative">
      {/* header */}
      <div className="text-center mb-16">
        <p className="font-mono text-[0.65rem] tracking-[0.3em] text-[#d4af37]/60 uppercase mb-3">
          Hệ thống bảo tàng
        </p>
        <h2 className="font-heading text-5xl md:text-6xl font-light text-white leading-tight">
          Khám phá <em>các</em> Bảo tàng
        </h2>
        <p className="mt-4 text-stone-400 text-sm max-w-md mx-auto leading-relaxed">
          Chọn một bảo tàng để khám phá bộ sưu tập hiện vật và triển lãm đang diễn ra.
        </p>
      </div>

      {/* map + card layout */}
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row gap-8 items-center lg:items-start">

        {/* ── SVG MAP ── */}
        <div className="relative flex-1 min-h-[380px] select-none">
          <svg
            viewBox="0 0 100 100"
            className="w-full max-w-[560px] mx-auto"
            style={{ filter: "drop-shadow(0 24px 48px #0008)" }}
          >
            {/* ground */}
            <rect width="100" height="100" fill="#1e1b1f" rx="2" />

            {/* grid streets */}
            {[20, 40, 60, 80].map(x => (
              <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#2a272c" strokeWidth="0.3" />
            ))}
            {[20, 40, 60, 80].map(y => (
              <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#2a272c" strokeWidth="0.3" />
            ))}

            {/* National Mall green strip */}
            <rect x="8" y="43" width="74" height="14" fill="#1f2a1a" rx="0.5" />

            {/* trees (dots) */}
            {[12,18,25,35,45,55,65,72].map(x => (
              <circle key={x} cx={x} cy={47} r="1.2" fill="#2d3f22" />
            ))}
            {[12,18,25,35,45,55,65,72].map(x => (
              <circle key={x + 100} cx={x} cy={53} r="1.2" fill="#2d3f22" />
            ))}

            {/* Capitol building */}
            <rect x="84" y="43.5" width="9" height="13" fill="#28252b" rx="0.5" />
            <circle cx="88.5" cy="47" r="2.5" fill="#2f2b33" />

            {/* Washington Monument */}
            <polygon points="50,43 51.2,36 49.8,36" fill="#28252b" />
            <rect x="49.5" y="43" width="1" height="1" fill="#28252b" />

            {/* Smithsonian Castle */}
            <rect x="46.5" y="57.5" width="7" height="5" fill="#28252b" rx="0.3" />
            <polygon points="46.5,57.5 50,55.5 53.5,57.5" fill="#2f2b33" />

            {/* Museum buildings */}
            {museums.map((m) => {
              const pos = POSITIONS[m.slug]
              if (!pos) return null
              const isActive = m.slug === active
              const fill = isActive ? m.accent + "55" : "#28252b"
              const stroke = isActive ? m.accent : "#3a3640"
              const strokeW = isActive ? 0.6 : 0.3

              return (
                <g
                  key={m.slug}
                  onClick={() => setActive(m.slug)}
                  className="cursor-pointer"
                  style={{ filter: isActive ? `drop-shadow(0 0 3px ${m.accent}88)` : undefined }}
                >
                  {pos.shape === "circle" ? (
                    <circle
                      cx={pos.cx} cy={pos.cy} r={pos.w / 2}
                      fill={fill} stroke={stroke} strokeWidth={strokeW}
                    />
                  ) : (
                    <rect
                      x={pos.cx - pos.w / 2} y={pos.cy - pos.h / 2}
                      width={pos.w} height={pos.h}
                      fill={fill} stroke={stroke} strokeWidth={strokeW} rx="0.4"
                    />
                  )}
                  {/* glow dot for active */}
                  {isActive && <circle cx={pos.cx} cy={pos.cy} r="1" fill={m.accent} />}
                </g>
              )
            })}

            {/* Badge labels */}
            {museums.map((m) => {
              const pos = POSITIONS[m.slug]
              if (!pos) return null
              const isActive = m.slug === active
              const labelY = pos.cy < 50
                ? pos.cy - pos.h / 2 - 5     // above building (north side)
                : pos.cy + pos.h / 2 + 5     // below building (south side)

              return (
                <g
                  key={m.slug + "-label"}
                  onClick={() => setActive(m.slug)}
                  className="cursor-pointer"
                >
                  {/* connector line */}
                  <line
                    x1={pos.cx} y1={pos.cy < 50 ? pos.cy - pos.h / 2 : pos.cy + pos.h / 2}
                    x2={pos.cx} y2={labelY + (pos.cy < 50 ? 3 : -3)}
                    stroke={isActive ? m.accent : "#4a4650"}
                    strokeWidth="0.3"
                    strokeDasharray="0.8 0.8"
                  />
                  {/* badge bg */}
                  <rect
                    x={pos.cx - 11} y={labelY - 3}
                    width="22" height="6"
                    fill={isActive ? "#1e1b1f" : "#1e1b1f"}
                    stroke={isActive ? m.accent : "#3a3640"}
                    strokeWidth={isActive ? 0.5 : 0.3}
                    rx="1"
                  />
                  {/* accent dot */}
                  <circle cx={pos.cx - 8} cy={labelY} r="0.8" fill={m.accent} />
                  {/* label text */}
                  <text
                    x={pos.cx - 6} y={labelY + 1}
                    fontSize="2.4" fill={isActive ? "#ffffff" : "#a09aa8"}
                    fontFamily="monospace" fontWeight={isActive ? "bold" : "normal"}
                  >
                    {m.nameEn.replace("National Museum of ", "").replace("National ", "").slice(0, 16)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* ── DETAIL CARD ── */}
        <div
          className="w-full lg:w-72 shrink-0 rounded border p-6 flex flex-col gap-5 transition-all duration-300"
          style={{ borderColor: selected.accent + "44", background: selected.accent + "0d" }}
        >
          <p className="font-mono text-[0.6rem] tracking-widest uppercase" style={{ color: selected.accent }}>
            Bảo tàng đang chọn
          </p>

          <div>
            <h3 className="font-heading text-2xl font-light text-white leading-snug mb-1">
              <em>{selected.name}</em>
            </h3>
            <p className="font-mono text-[0.6rem] text-stone-500 tracking-wide">{selected.nameEn}</p>
          </div>

          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-stone-300 text-sm leading-relaxed">{selected.description}</p>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-stone-500">
            <span>Mở cửa {selected.opens} — {selected.closes}</span>
            <span
              className="size-2 rounded-full"
              style={{ background: selected.accent, boxShadow: `0 0 6px ${selected.accent}` }}
            />
          </div>

          {/* dot indicators (like Colosseum's decorative dots) */}
          <div className="flex gap-1.5 flex-wrap">
            {museums.map(m => (
              <button
                key={m.slug}
                onClick={() => setActive(m.slug)}
                className="size-3 rounded-sm transition-transform hover:scale-110"
                style={{
                  background: m.slug === active ? m.accent : m.accent + "33",
                  border: `1px solid ${m.accent}55`,
                }}
                aria-label={m.name}
              />
            ))}
          </div>

          <Link
            href={`/bao-tang/${selected.slug}`}
            className="mt-auto text-center py-2.5 text-xs font-mono tracking-widest uppercase transition-colors"
            style={{
              border: `1px solid ${selected.accent}66`,
              color: selected.accent,
            }}
          >
            Khám phá bảo tàng →
          </Link>
        </div>
      </div>
    </section>
  )
}
