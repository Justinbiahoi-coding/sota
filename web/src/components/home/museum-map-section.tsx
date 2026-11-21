"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { museums } from "@/lib/mock-data"

// Pin positions as % of map width/height — spread across the isometric map
const PINS: Record<string, { left: string; top: string }> = {
  "lich-su-tu-nhien":      { left: "27%", top: "35%" },
  "hang-khong-vu-tru":     { left: "62%", top: "55%" },
  "lich-su-hoa-ky":        { left: "14%", top: "52%" },
  "phong-tranh-chan-dung":  { left: "44%", top: "22%" },
  "hirshhorn":              { left: "52%", top: "68%" },
  "nghe-thuat-chau-a":     { left: "34%", top: "72%" },
}

// Colosseum diamond flare icon (3×3 grid, diamond pattern)
function Flare({ color = "#83648e" }: { color?: string }) {
  return (
    <span style={{
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gridTemplateRows: "repeat(3,1fr)",
      width: 22,
      height: 22,
      flexShrink: 0,
    }}>
      {[1,2,3,4].map(i => (
        <span key={i} style={{
          backgroundColor: color,
          gridArea: i === 1 ? "1/2" : i === 2 ? "2/1" : i === 3 ? "2/3" : "3/2",
        }} />
      ))}
    </span>
  )
}

export function MuseumMapSection() {
  const [active, setActive] = useState(museums[0].slug)
  const selected = museums.find(m => m.slug === active) ?? museums[0]

  return (
    <section style={{ backgroundColor: "#1e1b1f", paddingBlock: "128px 96px" }}>
      <div style={{ maxWidth: 1512, marginInline: "auto", paddingInline: 32 }}>

        {/* ── HEADING ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, marginBottom: 96 }}>
          <h2 style={{ margin: 0, fontWeight: 400, lineHeight: 1.04, textAlign: "center" }}>
            <span style={{ display: "block", fontSize: 75, letterSpacing: "-.03em", fontStyle: "italic", color: "#bba5c3", fontFamily: "var(--font-display)" }}>
              Khám phá
            </span>
            <span style={{ display: "block", fontSize: 72, letterSpacing: "-.02em", color: "#fff", fontFamily: "var(--font-display)" }}>
              Các Bảo Tàng
            </span>
          </h2>
          <p style={{ margin: 0, maxWidth: 682, fontSize: 24, lineHeight: 1.4, letterSpacing: "-.01em", textAlign: "center", color: "#fff" }}>
            Chọn một bảo tàng và bắt đầu hành trình khám phá di sản văn hoá nhân loại.
          </p>
        </div>

        {/* ── CONTENT: map + card ── */}
        <div style={{ position: "relative", maxWidth: 1440, marginRight: "auto", paddingTop: 10 }}>

          {/* MAP */}
          <div style={{
            containerType: "inline-size",
            position: "relative",
            width: "78.97%",
            aspectRatio: "1137 / 640",
          }}>
            {/* base map (dark isometric world's fair grounds) */}
            <Image
              src="/colosseum-map.webp"
              alt="Smithsonian campus map"
              fill
              className="object-cover"
              style={{ display: "block" }}
            />

            {/* per-museum colour overlay — fades in when active */}
            {museums.map(m => (
              <div
                key={m.slug}
                style={{
                  position: "absolute", inset: 0,
                  background: `radial-gradient(ellipse 40% 40% at 50% 50%, ${m.accent}22 0%, transparent 70%)`,
                  opacity: m.slug === active ? 1 : 0,
                  transition: "opacity .3s ease",
                  pointerEvents: "none",
                }}
              />
            ))}

            {/* PIN BADGES */}
            {museums.map(m => {
              const pos = PINS[m.slug]
              if (!pos) return null
              const isActive = m.slug === active
              return (
                <button
                  key={m.slug}
                  aria-pressed={isActive}
                  onClick={() => setActive(m.slug)}
                  style={{
                    position: "absolute",
                    left: pos.left,
                    top: pos.top,
                    transform: "translate(-50%, -50%)",
                    zIndex: isActive ? 3 : 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: "2.5714em",
                    paddingInline: "1.1429em",
                    border: `0.075em solid ${isActive ? "#bba5c3" : "#b4b4b4"}`,
                    backgroundColor: isActive ? "#65496e" : "#5c5c5c",
                    boxShadow: isActive ? "inset 0 0 0 1px #e8d9ef" : "none",
                    fontSize: "max(9px, 1.2311cqw)",
                    cursor: "pointer",
                    color: "#fff",
                    whiteSpace: "nowrap",
                    transition: "background-color .2s, border-color .2s",
                  }}
                >
                  {/* accent dot */}
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontFamily: "var(--font-label)", letterSpacing: "0.05em" }}>
                    {m.nameEn.replace("National Museum of ", "").replace("National ", "").replace(" Museum", "").slice(0, 20)}
                  </span>
                </button>
              )
            })}
          </div>

          {/* CARD — absolutely positioned to the right, vertically centered */}
          <div style={{
            position: "absolute",
            top: "50%",
            right: 32,
            width: 480,
            transform: "translateY(-50%)",
          }}>
            {/* corner-band frame (7px bands like Colosseum) */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "7px minmax(0,1fr) 7px",
              gridTemplateRows: "7px minmax(0,1fr) 7px",
              minHeight: 420,
            }}>
              {/* top-left, top, top-right corners */}
              <Corner accent={selected.accent} />
              <span style={{ background: selected.accent + "33" }} />
              <Corner accent={selected.accent} />

              {/* left band, body, right band */}
              <span style={{ background: selected.accent + "33" }} />
              <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 32,
                padding: "40px 33px 48px",
                border: `1.5px solid ${selected.accent}80`,
                backgroundColor: "#1e1b1f",
                backgroundImage: "linear-gradient(rgba(59,46,63,.5),rgba(59,46,63,.5))",
              }}>
                {/* head */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: 40,
                    fontStyle: "italic",
                    fontWeight: 400,
                    lineHeight: 1.2,
                    textAlign: "center",
                    color: "#fff",
                    fontFamily: "var(--font-display)",
                  }}>
                    {selected.name}
                  </h3>

                  <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center" }}>
                    <p style={{ margin: 0, fontSize: 56, fontStyle: "italic", lineHeight: 1, color: "#fff", fontFamily: "var(--font-display)" }}>
                      {selected.opens}–{selected.closes}
                    </p>
                    <p style={{ margin: 0, fontSize: 18, color: "#bba5c3" }}>
                      Giờ mở cửa hàng ngày
                    </p>
                    <p style={{ margin: 0, paddingTop: 8, maxWidth: 340, fontSize: 20, fontStyle: "italic", lineHeight: 1.3, color: "#cec7d1", fontFamily: "var(--font-display)" }}>
                      {selected.description?.slice(0, 90)}…
                    </p>
                  </div>
                </div>

                {/* flare row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                    <Flare color={selected.accent + "99"} />
                    <Flare color={selected.accent + "66"} />
                    <Flare color={selected.accent + "44"} />
                  </div>
                  <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                    <Flare color={selected.accent + "44"} />
                    <Flare color={selected.accent + "66"} />
                    <Flare color={selected.accent + "99"} />
                  </div>
                </div>

                {/* footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                  <p style={{ margin: 0, fontSize: 18, lineHeight: "26px", opacity: 0.7, color: "#fff" }}>
                    Smithsonian Institution
                  </p>
                  <Link
                    href={`/bao-tang/${selected.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 16px",
                      border: `1px solid ${selected.accent}66`,
                      color: selected.accent,
                      fontSize: 13,
                      fontFamily: "var(--font-label)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      transition: "border-color .2s, color .2s",
                    }}
                  >
                    Khám phá →
                  </Link>
                </div>
              </div>
              <span style={{ background: selected.accent + "33" }} />

              {/* bottom corners */}
              <Corner accent={selected.accent} />
              <span style={{ background: selected.accent + "33" }} />
              <Corner accent={selected.accent} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Corner({ accent }: { accent: string }) {
  return (
    <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
      <path d="M0 0h7v7H0z" fill={accent + "33"} />
    </svg>
  )
}
