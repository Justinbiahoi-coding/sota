"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { museums } from "@/lib/mock-data"

// Art overlay images — exact positions extracted from Colosseum HTML
// Each image covers only one building in full color; rest is transparent
const ARTS = [
  { slug: "lich-su-tu-nhien",     src: "/map-art-solana.webp",      left:"40.0422%", top:"13.6623%", width:"19.7718%", height:"31.5152%" },
  { slug: "hang-khong-vu-tru",    src: "/map-art-ethereum.webp",    left:"50.8763%", top:"22.3053%", width:"18.0374%", height:"39.5473%" },
  { slug: "phong-tranh-chan-dung", src: "/map-art-zcash.webp",       left:"26.6636%", top:"8.4355%",  width:"22.4807%", height:"24.7459%" },
  { slug: "lich-su-hoa-ky",       src: "/map-art-arbitrum.webp",    left:"8.9781%",  top:"5.2816%",  width:"22.575%",  height:"38.0106%" },
  { slug: "hirshhorn",            src: "/map-art-hyperliquid.webp", left:"25.8251%", top:"61.5562%", width:"20.7676%", height:"28.6945%" },
  { slug: "nghe-thuat-chau-a",    src: "/map-art-base.webp",        left:"7.4025%",  top:"53.8853%", width:"21.6119%", height:"32.0122%" },
]

// Pin positions — extracted from Colosseum HTML
const PINS: Record<string, React.CSSProperties> = {
  "lich-su-tu-nhien":      { left: "58.0585%", top: "19.8438%", transform: "translate(-50%,-50%)" },
  "hang-khong-vu-tru":     { right: "27.91%",  top: "52.6281%", transform: "translateY(-50%)" },
  "phong-tranh-chan-dung":  { left: "31.9854%", top: "15.4999%", transform: "translate(-50%,-50%)" },
  "lich-su-hoa-ky":        { left: "11.9068%", top: "32.1119%", transform: "translate(-50%,-50%)" },
  "hirshhorn":             { left: "35.3837%", top: "88.9841%", transform: "translate(-50%,-50%)" },
  "nghe-thuat-chau-a":     { left: "9.7084%",  top: "55.4221%", transform: "translate(-50%,-50%)" },
}

// Short display label for each museum pin
const SHORT: Record<string, string> = {
  "lich-su-tu-nhien":      "Natural History",
  "hang-khong-vu-tru":     "Air & Space",
  "phong-tranh-chan-dung":  "Portrait Gallery",
  "lich-su-hoa-ky":        "American History",
  "hirshhorn":             "Hirshhorn",
  "nghe-thuat-chau-a":     "Asian Art",
}

function Flare({ color = "#83648e" }: { color?: string }) {
  return (
    <span style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gridTemplateRows:"repeat(3,1fr)", width:22, height:22, flexShrink:0 }}>
      {(["1/2","2/1","2/3","3/2"] as const).map((area, i) => (
        <span key={i} style={{ backgroundColor: color, gridArea: area }} />
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

        {/* HEADING */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24, marginBottom:96 }}>
          <h2 style={{ margin:0, fontWeight:400, lineHeight:1.04, textAlign:"center" }}>
            <span style={{ display:"block", fontSize:75, letterSpacing:"-.03em", fontStyle:"italic", color:"#bba5c3", fontFamily:"var(--font-display)" }}>
              Khám phá
            </span>
            <span style={{ display:"block", fontSize:72, letterSpacing:"-.02em", color:"#fff", fontFamily:"var(--font-display)" }}>
              Các Bảo Tàng
            </span>
          </h2>
          <p style={{ margin:0, maxWidth:682, fontSize:24, lineHeight:1.4, letterSpacing:"-.01em", textAlign:"center", color:"#fff" }}>
            Chọn một bảo tàng và bắt đầu hành trình khám phá di sản văn hoá nhân loại.
          </p>
        </div>

        {/* CONTENT */}
        <div style={{ position:"relative", maxWidth:1440, marginRight:"auto", paddingTop:10 }}>

          {/* MAP — 78.97% width, aspect 1137:640, same as Colosseum */}
          <div style={{ containerType:"inline-size", position:"relative", width:"78.97%", aspectRatio:"1137 / 640" }}>

            {/* base dark map */}
            <img src="/colosseum-map.webp" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }} />

            {/* per-building art overlays — opacity 0 → 1 on active */}
            {ARTS.map(a => (
              <img
                key={a.slug}
                src={a.src}
                alt=""
                style={{
                  position:"absolute",
                  left: a.left, top: a.top, width: a.width, height: a.height,
                  display:"block",
                  objectFit:"cover",
                  opacity: a.slug === active ? 1 : 0,
                  transition:"opacity .25s ease-in-out",
                }}
              />
            ))}

            {/* PIN BUTTONS */}
            {museums.filter(m => PINS[m.slug]).map(m => {
              const isActive = m.slug === active
              return (
                <button
                  key={m.slug}
                  aria-pressed={isActive}
                  onClick={() => setActive(m.slug)}
                  style={{
                    position: "absolute",
                    ...PINS[m.slug],
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
                  <span style={{ width:8, height:8, borderRadius:"50%", background:m.accent, flexShrink:0 }} />
                  <span style={{ fontSize:11, fontFamily:"var(--font-label)", letterSpacing:"0.05em" }}>
                    {SHORT[m.slug] ?? m.nameEn.slice(0, 20)}
                  </span>
                </button>
              )
            })}
          </div>

          {/* CARD — absolute right, vertically centered */}
          <div style={{ position:"absolute", top:"50%", right:32, width:480, transform:"translateY(-50%)" }}>
            <div style={{
              display:"grid",
              gridTemplateColumns:"7px minmax(0,1fr) 7px",
              gridTemplateRows:"7px minmax(0,1fr) 7px",
              minHeight:420,
            }}>
              {/* corners + bands */}
              <Band color={selected.accent} /><Band color={selected.accent} /><Band color={selected.accent} />
              <Band color={selected.accent} />

              {/* BODY */}
              <div style={{
                display:"flex", flexDirection:"column", justifyContent:"space-between", gap:32,
                padding:"40px 33px 48px",
                border:`1.5px solid ${selected.accent}80`,
                backgroundColor:"#1e1b1f",
                backgroundImage:"linear-gradient(rgba(59,46,63,.5),rgba(59,46,63,.5))",
              }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:24 }}>
                  <h3 style={{ margin:0, fontSize:40, fontStyle:"italic", fontWeight:400, lineHeight:1.2, textAlign:"center", color:"#fff", fontFamily:"var(--font-display)" }}>
                    {selected.name}
                  </h3>
                  <div style={{ width:"100%", display:"flex", flexDirection:"column", alignItems:"center", gap:8, textAlign:"center" }}>
                    <p style={{ margin:0, fontSize:52, fontStyle:"italic", lineHeight:1, color:"#fff", fontFamily:"var(--font-display)" }}>
                      {selected.opens}–{selected.closes}
                    </p>
                    <p style={{ margin:0, fontSize:18, color:"#bba5c3" }}>
                      Giờ mở cửa hàng ngày
                    </p>
                    <p style={{ margin:0, paddingTop:8, maxWidth:340, fontSize:18, fontStyle:"italic", lineHeight:1.4, color:"#cec7d1", fontFamily:"var(--font-display)" }}>
                      {(selected.description ?? "").slice(0, 90)}…
                    </p>
                  </div>
                </div>

                {/* flare row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", gap:18 }}>
                    {["99","66","44"].map(a => <Flare key={a} color={selected.accent + a} />)}
                  </div>
                  <div style={{ display:"flex", gap:18 }}>
                    {["44","66","99"].map(a => <Flare key={a} color={selected.accent + a} />)}
                  </div>
                </div>

                {/* footer */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
                  <p style={{ margin:0, fontSize:18, opacity:0.7, color:"#fff" }}>Smithsonian Institution</p>
                  <Link
                    href={`/bao-tang/${selected.slug}`}
                    style={{
                      display:"inline-flex", alignItems:"center", gap:6,
                      padding:"8px 16px",
                      border:`1px solid ${selected.accent}66`,
                      color: selected.accent,
                      fontSize:13, fontFamily:"var(--font-label)", letterSpacing:"0.1em", textTransform:"uppercase", textDecoration:"none",
                    }}
                  >
                    Khám phá →
                  </Link>
                </div>
              </div>

              <Band color={selected.accent} />
              <Band color={selected.accent} /><Band color={selected.accent} /><Band color={selected.accent} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Band({ color }: { color: string }) {
  return <span style={{ background: color + "33" }} />
}
