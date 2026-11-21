"use client"

import { useState } from "react"
import Link from "next/link"

// Art overlay — exact positions from Colosseum HTML (each image = one building in color)
const ARTS = [
  { slug: "lich-su-tu-nhien",     src: "/map-art-solana.webp",      left:"40.0422%", top:"13.6623%", width:"19.7718%", height:"31.5152%" },
  { slug: "phong-tranh-chan-dung", src: "/map-art-zcash.webp",       left:"26.6636%", top:"8.4355%",  width:"22.4807%", height:"24.7459%" },
  { slug: "lich-su-hoa-ky",       src: "/map-art-arbitrum.webp",    left:"8.9781%",  top:"5.2816%",  width:"22.575%",  height:"38.0106%" },
  { slug: "hirshhorn",            src: "/map-art-hyperliquid.webp", left:"25.8251%", top:"61.5562%", width:"20.7676%", height:"28.6945%" },
  { slug: "hang-khong-vu-tru",    src: "/map-art-ethereum.webp",    left:"50.8763%", top:"22.3053%", width:"18.0374%", height:"39.5473%" },
  { slug: "nghe-thuat-chau-a",    src: "/map-art-base.webp",        left:"7.4025%",  top:"53.8853%", width:"21.6119%", height:"32.0122%" },
]

// Pin absolute positions on the map
const PIN_POS: Record<string, React.CSSProperties> = {
  "lich-su-tu-nhien":      { left: "58.0585%", top: "19.8438%", transform: "translate(-50%,-50%)" },
  "phong-tranh-chan-dung":  { left: "31.9854%", top: "15.4999%", transform: "translate(-50%,-50%)" },
  "lich-su-hoa-ky":        { left: "11.9068%", top: "32.1119%", transform: "translate(-50%,-50%)" },
  "hirshhorn":             { left: "35.3837%", top: "88.9841%", transform: "translate(-50%,-50%)" },
  "hang-khong-vu-tru":     { right: "27.91%",  top: "52.6281%", transform: "translateY(-50%)" },
  "nghe-thuat-chau-a":     { left: "9.7084%",  top: "55.4221%", transform: "translate(-50%,-50%)" },
}

// All 6 destinations — 3 museum pages + đặt vé + cửa hàng + trang chủ
const PINS = [
  { slug: "lich-su-tu-nhien",     href: "/bao-tang/lich-su-tu-nhien",     label: "Natural History",   accent: "#38bdf8", title: "Lịch sử Tự nhiên",          desc: "Hành trình 500 triệu năm qua các kỷ địa chất.",       hours: "10:00–17:30", cta: "Tham quan" },
  { slug: "phong-tranh-chan-dung", href: "/bao-tang/phong-tranh-chan-dung", label: "Portrait Gallery",  accent: "#f472b6", title: "Phòng tranh Chân dung",       desc: "Nghệ thuật chân dung lịch sử Hoa Kỳ từ thế kỷ 18.",   hours: "11:30–19:00", cta: "Tham quan" },
  { slug: "lich-su-hoa-ky",       href: "/bao-tang/lich-su-hoa-ky",       label: "American History",  accent: "#f87171", title: "Lịch sử Hoa Kỳ",             desc: "Di sản văn hóa và lịch sử dân tộc Mỹ qua các thế kỷ.", hours: "10:00–17:30", cta: "Tham quan" },
  { slug: "hirshhorn",            href: "/dat-ve",                         label: "Đặt vé",            accent: "#fbbf24", title: "Đặt vé tham quan",            desc: "Mua vé trước, ưu tiên vào cửa không chờ đợi.",        hours: null,          cta: "Đặt ngay" },
  { slug: "hang-khong-vu-tru",    href: "/cua-hang",                       label: "Cửa hàng",          accent: "#818cf8", title: "Cửa hàng Smithsonian",        desc: "Quà lưu niệm và vật phẩm độc quyền từ Smithsonian.",  hours: null,          cta: "Vào cửa hàng" },
  { slug: "nghe-thuat-chau-a",    href: "/",                               label: "Trang chủ",         accent: "#34d399", title: "Smithsonian Institution",      desc: "Khám phá toàn bộ cụm bảo tàng trong một trải nghiệm.", hours: null,          cta: "Về trang chủ" },
]

function Flare({ color }: { color: string }) {
  return (
    <span style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gridTemplateRows:"repeat(3,1fr)", width:18, height:18, flexShrink:0 }}>
      {(["1/2","2/1","2/3","3/2"] as const).map((area, i) => (
        <span key={i} style={{ backgroundColor: color, gridArea: area }} />
      ))}
    </span>
  )
}

export function MuseumMapSection() {
  const [active, setActive] = useState(PINS[0].slug)
  const sel = PINS.find(p => p.slug === active) ?? PINS[0]

  return (
    <section style={{ backgroundColor: "#1e1b1f", paddingBlock: "96px 80px" }}>
      <div style={{ maxWidth: 1440, marginInline: "auto", paddingInline: 32 }}>

        {/* HEADING */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, marginBottom:64 }}>
          <h2 style={{ margin:0, fontWeight:400, lineHeight:1.04, textAlign:"center" }}>
            <span style={{ display:"block", fontSize:64, letterSpacing:"-.03em", fontStyle:"italic", color:"#bba5c3", fontFamily:"var(--font-display)" }}>Khám phá</span>
            <span style={{ display:"block", fontSize:60, letterSpacing:"-.02em", color:"#fff", fontFamily:"var(--font-display)" }}>Các Bảo Tàng</span>
          </h2>
          <p style={{ margin:0, maxWidth:560, fontSize:20, lineHeight:1.5, textAlign:"center", color:"#9e96a6" }}>
            Trỏ chuột vào công trình để khám phá — nhấp để đến thẳng địa điểm đó.
          </p>
        </div>

        {/* MAP — full width */}
        <div
          style={{ position:"relative", width:"100%", aspectRatio:"1137 / 640" }}
          onMouseLeave={() => {/* keep last active */}}
        >
          <img src="/colosseum-map.webp" alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block", borderRadius:4 }} />

          {/* Building zones — large Link covering each building footprint.
              Hover here (anywhere on the building) triggers the highlight. */}
          {PINS.map(p => {
            const art = ARTS.find(a => a.slug === p.slug)!
            const isActive = p.slug === active
            return (
              <Link
                key={p.slug}
                href={p.href}
                aria-label={p.label}
                onMouseEnter={() => setActive(p.slug)}
                style={{
                  position: "absolute",
                  left: art.left, top: art.top, width: art.width, height: art.height,
                  display: "block",
                  cursor: "pointer",
                  zIndex: 2,
                  textDecoration: "none",
                }}
              >
                {/* art overlay fills the zone */}
                <img
                  src={art.src}
                  alt=""
                  style={{
                    position: "absolute", inset: 0, width: "100%", height: "100%",
                    display: "block",
                    opacity: isActive ? 1 : 0,
                    transition: "opacity .25s ease-in-out",
                    pointerEvents: "none",
                  }}
                />
              </Link>
            )
          })}

          {/* Pin badges — visual labels only, pointer-events:none so hover falls through to building zone */}
          {PINS.map(p => {
            const isActive = p.slug === active
            return (
              <div
                key={`badge-${p.slug}`}
                style={{
                  position: "absolute",
                  ...PIN_POS[p.slug],
                  zIndex: 5,
                  pointerEvents: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  height: 28,
                  paddingInline: 12,
                  border: `1px solid ${isActive ? p.accent : "#555"}`,
                  backgroundColor: isActive ? p.accent + "22" : "#2a2a2acc",
                  boxShadow: isActive ? `0 2px 16px ${p.accent}44` : "none",
                  fontSize: 11,
                  color: isActive ? p.accent : "#b0b0b0",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.04em",
                  transition: "background-color .2s, border-color .2s, color .2s, box-shadow .2s",
                  fontFamily: "var(--font-label)",
                }}
              >
                <span style={{ width:7, height:7, borderRadius:"50%", background: p.accent, flexShrink:0 }} />
                {p.label}
              </div>
            )
          })}
        </div>

        {/* CARD — below map, horizontal */}
        <div style={{ marginTop: 24 }}>
          <div style={{
            display:"grid",
            gridTemplateColumns:"6px 1fr 6px",
            gridTemplateRows:"6px 1fr 6px",
          }}>
            <span style={{ background: sel.accent + "44" }} />
            <span style={{ background: sel.accent + "44" }} />
            <span style={{ background: sel.accent + "44" }} />
            <span style={{ background: sel.accent + "44" }} />

            <div style={{
              display:"flex", alignItems:"center", justifyContent:"space-between", gap:32,
              padding:"24px 32px",
              border:`1px solid ${sel.accent}33`,
              backgroundColor:"#1e1b1f",
              backgroundImage:"linear-gradient(rgba(40,34,44,.6),rgba(40,34,44,.6))",
              transition:"border-color .25s",
            }}>
              {/* left: flares + name */}
              <div style={{ display:"flex", alignItems:"center", gap:20, flexShrink:0 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {["99","55"].map(a => <Flare key={a} color={sel.accent + a} />)}
                </div>
                <div>
                  <p style={{ margin:0, fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color: sel.accent, fontFamily:"var(--font-label)", opacity:0.8 }}>
                    {sel.hours ? "Mở cửa hàng ngày" : "Smithsonian"}
                  </p>
                  <h3 style={{ margin:"4px 0 0", fontSize:28, fontStyle:"italic", fontWeight:400, color:"#fff", fontFamily:"var(--font-display)", whiteSpace:"nowrap" }}>
                    {sel.title}
                  </h3>
                </div>
              </div>

              {/* center: hours + desc */}
              <div style={{ flex:1, minWidth:0, borderLeft:`1px solid ${sel.accent}22`, paddingLeft:32 }}>
                {sel.hours && (
                  <p style={{ margin:"0 0 4px", fontSize:32, fontStyle:"italic", fontWeight:400, color:"#fff", fontFamily:"var(--font-display)", lineHeight:1 }}>
                    {sel.hours}
                  </p>
                )}
                <p style={{ margin:0, fontSize:15, lineHeight:1.5, color:"#b4aabb", maxWidth:480 }}>
                  {sel.desc}
                </p>
              </div>

              {/* right: flares + CTA */}
              <div style={{ display:"flex", alignItems:"center", gap:20, flexShrink:0 }}>
                <Link
                  href={sel.href}
                  style={{
                    display:"inline-flex", alignItems:"center", gap:6,
                    padding:"10px 20px",
                    border:`1px solid ${sel.accent}66`,
                    color: sel.accent,
                    fontSize:12, fontFamily:"var(--font-label)", letterSpacing:"0.12em", textTransform:"uppercase", textDecoration:"none",
                    whiteSpace:"nowrap",
                    transition:"background .2s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = sel.accent + "18")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {sel.cta} →
                </Link>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  {["55","99"].map(a => <Flare key={a} color={sel.accent + a} />)}
                </div>
              </div>
            </div>

            <span style={{ background: sel.accent + "44" }} />
            <span style={{ background: sel.accent + "44" }} />
            <span style={{ background: sel.accent + "44" }} />
            <span style={{ background: sel.accent + "44" }} />
          </div>
        </div>

      </div>
    </section>
  )
}
