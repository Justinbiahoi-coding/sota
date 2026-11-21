"use client"

import { useState } from "react"
import Link from "next/link"

// 6 destinations — art overlay covers building footprint on the 1456×1080 map
// art = colored building image (transparent bg), positioned/sized to match map
// zone = same area, invisible hover target
const PINS = [
  {
    slug: "lich-su-tu-nhien",
    href: "/bao-tang/lich-su-tu-nhien",
    label: "Lịch sử Tự nhiên",
    accent: "#38bdf8",
    title: "Lịch sử Tự nhiên",
    desc: "Hành trình 500 triệu năm qua các kỷ địa chất, từ đại dương nguyên thuỷ đến thế giới hiện đại.",
    hours: "10:00–17:30",
    cta: "Tham quan",
    art: "/map-art-lich-su-tu-nhien.webp",
    zone: { left:"17%", top:"8%",  width:"30%", height:"33%" },
  },
  {
    slug: "phong-tranh-chan-dung",
    href: "/bao-tang/phong-tranh-chan-dung",
    label: "Phòng tranh Chân dung",
    accent: "#f472b6",
    title: "Phòng tranh Chân dung",
    desc: "Hơn 23.000 bức chân dung ghi lại lịch sử và văn hoá Hoa Kỳ từ thế kỷ 18 đến nay.",
    hours: "11:30–19:00",
    cta: "Tham quan",
    art: "/map-art-phong-tranh-chan-dung.webp",
    zone: { left:"48%", top:"7%",  width:"28%", height:"32%" },
  },
  {
    slug: "lich-su-hoa-ky",
    href: "/bao-tang/lich-su-hoa-ky",
    label: "Lịch sử Hoa Kỳ",
    accent: "#f87171",
    title: "Lịch sử Hoa Kỳ",
    desc: "Di sản văn hoá và lịch sử dân tộc Mỹ qua các thế kỷ — từ cách mạng đến kỷ nguyên số.",
    hours: "10:00–17:30",
    cta: "Tham quan",
    art: "/map-art-lich-su-hoa-ky.webp",
    zone: { left:"7%",  top:"33%", width:"30%", height:"28%" },
  },
  {
    slug: "cua-hang",
    href: "/cua-hang",
    label: "Cửa hàng",
    accent: "#818cf8",
    title: "Cửa hàng Smithsonian",
    desc: "Quà lưu niệm và vật phẩm độc quyền từ Smithsonian — từ mô hình 3D đến sách nghệ thuật.",
    hours: null,
    cta: "Vào cửa hàng",
    art: "/map-art-cua-hang.webp",
    zone: { left:"62%", top:"26%", width:"24%", height:"38%" },
  },
  {
    slug: "trang-chu",
    href: "/",
    label: "Trang chủ",
    accent: "#34d399",
    title: "Smithsonian Institution",
    desc: "Khám phá toàn bộ cụm bảo tàng Smithsonian trong một trải nghiệm số hoá thống nhất.",
    hours: null,
    cta: "Về trang chủ",
    art: "/map-art-trang-chu.webp",
    zone: { left:"14%", top:"52%", width:"28%", height:"32%" },
  },
  {
    slug: "dat-ve",
    href: "/dat-ve",
    label: "Đặt vé",
    accent: "#fbbf24",
    title: "Đặt vé tham quan",
    desc: "Mua vé trước để ưu tiên vào cửa không chờ đợi — có vé gia đình và nhóm học sinh.",
    hours: null,
    cta: "Đặt ngay",
    art: "/map-art-dat-ve.webp",
    zone: { left:"42%", top:"52%", width:"30%", height:"33%" },
  },
]

export function MuseumMapSection() {
  // default = trang chủ (user is on home page)
  const [active, setActive] = useState("trang-chu")
  const sel = PINS.find(p => p.slug === active)!

  return (
    <section style={{ backgroundColor: "#1e1b1f", paddingBlock: "96px 80px" }}>
      <div style={{ maxWidth: 1440, marginInline: "auto", paddingInline: 32 }}>

        {/* HEADING */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16, marginBottom:56 }}>
          <h2 style={{ margin:0, fontWeight:400, lineHeight:1.04, textAlign:"center" }}>
            <span style={{ display:"block", fontSize:60, letterSpacing:"-.03em", fontStyle:"italic", color:"#bba5c3", fontFamily:"var(--font-display)" }}>Khám phá</span>
            <span style={{ display:"block", fontSize:56, letterSpacing:"-.02em", color:"#fff", fontFamily:"var(--font-display)" }}>Các Bảo Tàng</span>
          </h2>
          <p style={{ margin:0, maxWidth:480, fontSize:17, lineHeight:1.6, textAlign:"center", color:"#9e96a6" }}>
            Rê chuột vào công trình để xem thông tin — nhấp để đến thẳng địa điểm đó.
          </p>
        </div>

        {/* BODY — map left + info right */}
        <div style={{ display:"grid", gridTemplateColumns:"60fr 40fr", gap:32, alignItems:"center" }}>

          {/* MAP */}
          <div style={{ position:"relative", width:"100%", aspectRatio:"1456 / 1080" }}>
            <img
              src="/colosseum-map.webp"
              alt="Bản đồ cụm bảo tàng Smithsonian"
              style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block" }}
            />

            {/* Building overlay images + hover zones */}
            {PINS.map(p => {
              const isActive = p.slug === active
              return (
                <div key={p.slug}>
                  {/* colored building art — transparent WebP, fades in on hover */}
                  <img
                    src={p.art}
                    alt=""
                    aria-hidden
                    style={{
                      position:"absolute",
                      left: p.zone.left, top: p.zone.top,
                      width: p.zone.width, height: p.zone.height,
                      objectFit: "contain",
                      pointerEvents: "none", zIndex: 2,
                      opacity: isActive ? 1 : 0,
                      transition: "opacity .3s ease-in-out",
                    }}
                  />

                  {/* hover/click zone */}
                  <div
                    onClick={() => setActive(p.slug)}
                    onMouseEnter={() => setActive(p.slug)}
                    style={{
                      position:"absolute",
                      left: p.zone.left, top: p.zone.top,
                      width: p.zone.width, height: p.zone.height,
                      cursor: "pointer", zIndex: 3,
                    }}
                  />
                </div>
              )
            })}
          </div>

          {/* INFO PANEL — slides in from right on change */}
          <div style={{ minHeight: 320, display:"flex", alignItems:"center" }}>
            <div
              key={active}
              style={{
                width: "100%",
                animation: "mapPanelSlide .4s cubic-bezier(.22,.68,0,1.2) both",
              }}
            >
              {/* accent top bar */}
              <div style={{ height: 3, width: 48, background: sel.accent, marginBottom: 24, transition:"background .2s" }} />

              <p style={{
                margin:"0 0 8px", fontSize:10, letterSpacing:"0.22em", textTransform:"uppercase",
                color: sel.accent, fontFamily:"var(--font-label)", opacity:0.85,
              }}>
                {sel.hours ? "Mở cửa hàng ngày" : "Smithsonian"}
              </p>

              <h3 style={{
                margin:"0 0 16px", fontSize:40, fontStyle:"italic", fontWeight:400,
                color:"#fff", fontFamily:"var(--font-display)", lineHeight:1.05,
              }}>
                {sel.title}
              </h3>

              {sel.hours && (
                <p style={{
                  margin:"0 0 16px", fontSize:28, fontStyle:"italic", fontWeight:400,
                  color: sel.accent, fontFamily:"var(--font-display)", lineHeight:1,
                }}>
                  {sel.hours}
                </p>
              )}

              <p style={{
                margin:"0 0 32px", fontSize:15, lineHeight:1.7, color:"#9d95a5", maxWidth:380,
              }}>
                {sel.desc}
              </p>

              <Link
                href={sel.href}
                style={{
                  display:"inline-flex", alignItems:"center", gap:10,
                  color: sel.accent,
                  fontSize:11, fontFamily:"var(--font-label)", letterSpacing:"0.16em",
                  textTransform:"uppercase", textDecoration:"none",
                  borderBottom:`1px solid ${sel.accent}55`,
                  paddingBottom:3,
                  transition:"border-color .2s, gap .2s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = sel.accent
                  e.currentTarget.style.gap = "14px"
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = sel.accent + "55"
                  e.currentTarget.style.gap = "10px"
                }}
              >
                {sel.cta} →
              </Link>

              {/* subtle dot nav */}
              <div style={{ display:"flex", gap:8, marginTop:32 }}>
                {PINS.map(p => (
                  <button
                    key={p.slug}
                    onClick={() => setActive(p.slug)}
                    style={{
                      width:6, height:6, borderRadius:"50%", border:"none", padding:0, cursor:"pointer",
                      background: p.slug === active ? p.accent : "#555",
                      transition:"background .2s, transform .2s",
                      transform: p.slug === active ? "scale(1.5)" : "scale(1)",
                    }}
                    aria-label={p.label}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
