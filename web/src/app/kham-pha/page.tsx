"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Clock, Compass, Footprints, Info, MapPin, TrainTrack } from "lucide-react"
import { museums as initialMockMuseums, museumBySlug, type Museum } from "@/lib/mock-data"
import { api } from "@/lib/api/client"
import { SplitText } from "@/components/reactbits/split-text"
import { DecryptedText } from "@/components/reactbits/decrypted-text"
import { StarBorder } from "@/components/reactbits/star-border"
import {
  BrassPlacardPin,
  RenaissanceCorners,
  RenaissanceDivider,
  RenaissanceFrieze,
  ClassicalMuseumMedallion,
  GildedMuseumFrame,
} from "@/components/renaissance/deco-assets"

const DB_TO_VI_SLUG: Record<string, string> = {
  "national-museum-of-natural-history": "lich-su-tu-nhien",
  "national-air-and-space-museum": "hang-khong-vu-tru",
  "national-museum-of-american-history": "lich-su-hoa-ky",
  "national-portrait-gallery": "phong-tranh-chan-dung",
  "hirshhorn-museum-and-sculpture-garden": "hirshhorn",
  "national-museum-of-asian-art": "nghe-thuat-chau-a",
}

const MALL_STATIONS = [
  { name: "Smithsonian Station (Blue / Orange / Silver)", desc: "Trạm Metro gần nhất, nằm ngay trung tâm đại lộ National Mall, bước lên là các gian trưng bày." },
  { name: "L'Enfant Plaza Station (Yellow / Green)", desc: "Cách Bảo tàng Hàng không & Vũ trụ 5 phút đi bộ thong thả qua quảng trường." },
  { name: "Archives-Navy Memorial Station (Yellow / Green)", desc: "Cách Bảo tàng Lịch sử Tự nhiên và Phòng tranh Chân dung Quốc gia 6 phút đi bộ." },
]

export default function KhamPhaPage() {
  const [liveMuseums, setLiveMuseums] = useState<Museum[]>(initialMockMuseums)

  useEffect(() => {
    let active = true
    async function loadMuseums() {
      try {
        const res = await api.museums.list({ limit: 20 })
        if (active && res?.data && res.data.length > 0) {
          const merged: Museum[] = res.data.map((dbM) => {
            const viSlug = DB_TO_VI_SLUG[dbM.slug] ?? dbM.slug
            const fallback = museumBySlug(viSlug) ?? museumBySlug(dbM.slug)
            let coverImg = dbM.cover_image_path
            if (coverImg && !coverImg.startsWith("http")) {
              const base = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://onauuvsjpnmjxqxeiuvy.supabase.co"
              coverImg = `${base}/storage/v1/object/public/museum-media/${coverImg}`
            }

            return {
              id: dbM.id,
              slug: viSlug,
              name: fallback?.name ?? dbM.name,
              nameEn: fallback?.nameEn ?? dbM.name,
              accent: fallback?.accent ?? "#d4af37",
              opens: fallback?.opens ?? "10:00",
              closes: fallback?.closes ?? "17:30",
              image: coverImg || fallback?.image || "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=1200&q=80",
              address: dbM.address ? `${dbM.address}, ${dbM.city ?? "Washington, D.C."}` : (fallback?.address ?? "Washington, D.C."),
              description: dbM.description || fallback?.description || "",
            }
          })
          setLiveMuseums(merged)
        }
      } catch {
        // Fallback remains initialMockMuseums
      }
    }
    loadMuseums()
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-[1560px] px-6 pt-28 pb-16 md:px-12 xl:px-16">
      {/* Header chuẩn mực White Cube & Renaissance */}
      <header className="mb-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/45 bg-[#08162b]/90 px-4 py-1.5 shadow-md backdrop-blur-md">
          <BrassPlacardPin />
          <span className="placard text-[0.68rem] tracking-wider text-[#fbe396]">
            <DecryptedText
              text="Cẩm nang Thưởng ngoạn · National Mall, Washington, D.C."
              speed={28}
              maxIterations={12}
              animateOn="view"
            />
          </span>
        </div>
        <h1 className="mt-5 font-heading text-4xl font-light tracking-tight text-[#f8f6f0] sm:text-5xl md:text-6xl">
          <SplitText text="Khám phá Quần thể Bảo tàng" delay={0.04} stagger={0.04} />
        </h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-stone-300">
          Dọc theo đại lộ National Mall dài 3 km là quần thể di sản văn hóa và khoa học quy mô bậc nhất hành tinh. Tất cả các bảo tàng trong cụm Smithsonian đều mở cửa tự do phục vụ công chúng.
        </p>
      </header>

      <RenaissanceDivider title="Chỉ dẫn khách tham quan" />

      {/* Guide Cards rộng rãi, sáng rõ và tinh tế */}
      <div className="mb-16 grid gap-6 sm:grid-cols-3">
        <div className="group relative flex flex-col justify-between rounded-xl border border-[#d4af37]/35 bg-white p-7 shadow-md transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_16px_36px_-12px_rgba(212,175,55,0.25)]">
          <RenaissanceCorners />
          <div>
            <div className="inline-flex size-12 items-center justify-center rounded-full border border-[#d4af37]/50 bg-stone-50 text-[#08162b] shadow-inner">
              <Compass className="size-6 text-[#92400e]" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-light text-[#171717]">Vào cửa miễn phí 100%</h2>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              Tất cả các bảo tàng Smithsonian không thu phí vào cửa thường lệ. Bạn có thể tự do ghé thăm mọi ngày trong năm từ 10:00 sáng.
            </p>
          </div>
          <p className="placard mt-6 flex items-center gap-1.5 text-xs text-[#92400e] font-semibold">
            <BrassPlacardPin className="size-1.5" /> CHÍNH SÁCH QUỐC GIA
          </p>
        </div>

        <div className="group relative flex flex-col justify-between rounded-xl border border-[#d4af37]/35 bg-white p-7 shadow-md transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_16px_36px_-12px_rgba(212,175,55,0.25)]">
          <RenaissanceCorners />
          <div>
            <div className="inline-flex size-12 items-center justify-center rounded-full border border-[#d4af37]/50 bg-stone-50 text-[#08162b] shadow-inner">
              <Footprints className="size-6 text-[#92400e]" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-light text-[#171717]">Lộ trình đi bộ liên hoàn</h2>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              Khoảng cách giữa các viện bảo tàng chỉ từ 3–8 phút đi bộ thong dong dọc bãi cỏ xanh ngát. Bạn có thể dễ dàng khám phá 2–3 bảo tàng trong một ngày.
            </p>
          </div>
          <p className="placard mt-6 flex items-center gap-1.5 text-xs text-[#92400e] font-semibold">
            <BrassPlacardPin className="size-1.5" /> 3-8 PHÚT DI CHUYỂN
          </p>
        </div>

        <div className="group relative flex flex-col justify-between rounded-xl border border-[#d4af37]/35 bg-white p-7 shadow-md transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_16px_36px_-12px_rgba(212,175,55,0.25)]">
          <RenaissanceCorners />
          <div>
            <div className="inline-flex size-12 items-center justify-center rounded-full border border-[#d4af37]/50 bg-stone-50 text-[#08162b] shadow-inner">
              <Info className="size-6 text-[#92400e]" />
            </div>
            <h2 className="mt-5 font-heading text-2xl font-light text-[#171717]">An ninh & Tiện ích</h2>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">
              Mọi du khách đều qua cổng kiểm soát kim loại và quét túi xách tại sảnh. Nên mang hành lý gọn nhẹ để thủ tục vào cửa diễn ra nhanh chóng.
            </p>
          </div>
          <p className="placard mt-6 flex items-center gap-1.5 text-xs text-[#92400e] font-semibold">
            <BrassPlacardPin className="size-1.5" /> QUY TRÌNH TIÊU CHUẨN
          </p>
        </div>
      </div>

      {/* Royal Navy Visual Map Section */}
      <section className="mb-16 overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-[#08162b] p-6 text-[#f7f4ec] shadow-[0_20px_50px_-20px_rgba(8,22,43,0.85)] md:p-10">
        <RenaissanceFrieze className="mb-4" />

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <ClassicalMuseumMedallion className="hidden sm:block size-14 text-[#d4af37] shrink-0" />
            <div>
              <p className="flex items-center gap-2 placard text-[0.65rem] uppercase tracking-[0.22em] text-[#d4af37]">
                <BrassPlacardPin />
                Sơ đồ phân bổ không gian
              </p>
              <h2 className="mt-1 font-heading text-3xl font-light text-white md:text-4xl">
                Quần thể Bảo tàng National Mall
              </h2>
            </div>
          </div>

          <Link href="/dat-ve">
            <StarBorder color="#d4af37" speed="4s" className="shadow-[0_4px_20px_rgba(212,175,55,0.3)]">
              <span className="flex items-center gap-2 py-1 px-3 text-xs font-semibold tracking-wider uppercase text-white">
                <span className="text-[#d4af37]">✦</span> Đặt vé một lượt
              </span>
            </StarBorder>
          </Link>
        </div>

        {/* Coordinate compass bar */}
        <p className="placard my-6 text-center text-xs tracking-wider text-[#d4af37] font-mono">
          ✦ Phía Bắc: Constitution Ave · Phía Nam: Independence Ave · Phía Tây: Đài tưởng niệm Washington · Phía Đông: Tòa nhà Quốc hội U.S. Capitol ✦
        </p>

        {/* 6 Museum Vitrine Cards in wide grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {liveMuseums.map((m, idx) => (
            <div
              key={m.slug}
              className="group relative flex flex-col justify-between rounded-xl border border-[#d4af37]/35 bg-white p-4 shadow-md transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_16px_36px_-12px_rgba(212,175,55,0.35)]"
            >
              <RenaissanceCorners />

              <div>
                <Link href={`/bao-tang/${m.slug}`}>
                  <GildedMuseumFrame className="w-full">
                    <div className="relative aspect-[16/10] w-full bg-stone-900">
                      <Image
                        src={m.image}
                        alt={m.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width:640px) 100vw, 33vw"
                      />
                      <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/60 bg-[#08162b]/90 px-2.5 py-0.5 placard text-[0.62rem] font-semibold text-[#fbe396] shadow-sm backdrop-blur-md">
                        <BrassPlacardPin className="size-1" />
                        Điểm {String(idx + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </GildedMuseumFrame>
                </Link>

                <div className="pt-3">
                  <h3 className="font-heading text-xl font-light leading-snug text-[#171717] group-hover:text-[#92400e] transition-colors line-clamp-1">
                    {m.name}
                  </h3>
                  <p className="mt-0.5 font-serif text-xs italic text-stone-500 line-clamp-1">{m.nameEn}</p>
                  
                  <div className="mt-3 space-y-1.5 text-xs text-stone-600">
                    <p className="flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="size-3.5 shrink-0 text-[#92400e]" />
                      <span className="truncate">{m.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="size-3.5 shrink-0 text-[#92400e]" />
                      <span>{m.opens} – {m.closes} (Mở cửa hàng ngày)</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-stone-200/90 pt-3 text-xs">
                <Link
                  href={`/bao-tang/${m.slug}`}
                  className="font-semibold text-stone-800 flex items-center gap-1 hover:text-[#92400e] transition-colors"
                >
                  Xem chi tiết <ArrowUpRight className="size-3.5" />
                </Link>
                <Link
                  href={`/dat-ve?museum=${m.slug}`}
                  className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 font-semibold text-stone-700 uppercase tracking-wider text-[0.68rem] transition-all hover:border-[#d4af37] hover:bg-[#d4af37] hover:text-[#08162b]"
                >
                  Lấy suất vé
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Metro & Transportation Section */}
      <section className="rounded-2xl border border-[#d4af37]/30 bg-white p-8 md:p-10 shadow-md">
        <div className="flex items-center gap-3">
          <TrainTrack className="size-6 text-[#92400e]" />
          <h2 className="font-heading text-2xl md:text-3xl font-light text-[#171717]">
            Tuyến tàu điện ngầm Metro tiếp cận
          </h2>
        </div>
        <p className="mt-2 text-sm text-stone-600 leading-relaxed max-w-2xl">
          Hệ thống Washington Metro kết nối thẳng vào cụm bảo tàng, tàu chạy liên tục 6–10 phút/chuyến.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {MALL_STATIONS.map((st, i) => (
            <div
              key={i}
              className="relative rounded-xl border border-stone-200/90 bg-stone-50/60 p-5 shadow-sm transition-all hover:border-[#d4af37] hover:bg-white hover:shadow-md"
            >
              <span className="placard text-[0.65rem] text-[#92400e] font-semibold uppercase tracking-wider">
                Trạm Metro 0{i + 1}
              </span>
              <h3 className="mt-2 font-heading text-lg font-light text-[#171717]">{st.name}</h3>
              <p className="mt-2 text-xs text-stone-600 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
