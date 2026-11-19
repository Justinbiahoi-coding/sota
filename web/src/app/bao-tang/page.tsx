import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Clock, MapPin } from "lucide-react"
import { museums } from "@/lib/mock-data"
import { SplitText } from "@/components/reactbits/split-text"
import { DecryptedText } from "@/components/reactbits/decrypted-text"
import {
  BrassPlacardPin,
  RenaissanceCorners,
  RenaissanceDivider,
  RenaissanceFrieze,
  ClassicalMuseumMedallion,
  GildedMuseumFrame,
} from "@/components/renaissance/deco-assets"

export const metadata = { title: "Các bảo tàng" }

export default function MuseumListPage() {
  return (
    <div className="mx-auto max-w-[1560px] px-6 py-16 md:px-12 xl:px-16">
      {/* Header đồng bộ chuẩn White Cube & Renaissance */}
      <header className="mb-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-white/95 px-4 py-1.5 shadow-sm">
          <BrassPlacardPin />
          <span className="placard text-[0.68rem] tracking-wider text-[#92400e]">
            <DecryptedText
              text="Smithsonian Institution · Washington, D.C."
              speed={28}
              maxIterations={12}
              animateOn="view"
            />
          </span>
        </div>
        <h1 className="mt-5 font-heading text-4xl font-light tracking-tight text-[#171717] sm:text-5xl md:text-6xl">
          <SplitText text="Các bảo tàng Smithsonian" delay={0.04} stagger={0.04} />
        </h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-stone-600">
          Sáu viện bảo tàng tiêu biểu trong cụm Smithsonian — mở cửa thường niên quanh năm tại trung tâm đại lộ National Mall, lưu giữ hơn 145 triệu hiện vật lịch sử tự nhiên, hàng không vũ trụ, mỹ thuật và văn hóa thế giới.
        </p>
      </header>

      <RenaissanceDivider title="Không gian di sản & nghệ thuật" />

      {/* Royal Navy Catalog Banner mở rộng màn ảnh rộng */}
      <div className="relative mb-14 overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-[#08162b] px-8 py-8 text-[#f7f4ec] shadow-[0_20px_50px_-20px_rgba(8,22,43,0.85)] md:px-12 md:py-10">
        <RenaissanceCorners />
        <RenaissanceFrieze className="absolute top-0 left-0 right-0" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-1">
          <div className="flex items-center gap-5">
            <ClassicalMuseumMedallion className="hidden sm:block size-14 text-[#d4af37] shrink-0" />
            <div>
              <p className="flex items-center gap-2 placard text-[0.68rem] uppercase tracking-[0.22em] text-[#d4af37]">
                <BrassPlacardPin />
                Hệ thống bảo tàng quốc gia Hoa Kỳ
              </p>
              <p className="mt-1 font-heading text-2xl md:text-3xl font-light text-white">
                06 không gian kiến trúc · Miễn phí 100% mở cửa đón khách
              </p>
              <p className="mt-2 text-xs md:text-sm text-stone-300 max-w-2xl leading-relaxed">
                Tọa lạc tại trung tâm thủ đô Washington, D.C., phục vụ hàng triệu lượt du khách mỗi năm với trải nghiệm văn hóa đỉnh cao.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-8 border-t lg:border-t-0 lg:border-l border-[#d4af37]/30 pt-6 lg:pt-0 lg:pl-10">
            <div>
              <p className="font-heading text-xs italic text-[#d4af37]">QUẦN THỂ</p>
              <p className="mt-1 font-heading text-2xl md:text-3xl font-light text-white">National</p>
              <p className="placard mt-0.5 text-xs text-stone-300 uppercase tracking-wider">Mall D.C.</p>
            </div>
            <div>
              <p className="font-heading text-xs italic text-[#d4af37]">VÉ VÀO CỬA</p>
              <p className="mt-1 font-heading text-2xl md:text-3xl font-light text-emerald-400">100%</p>
              <p className="placard mt-0.5 text-xs text-stone-300 uppercase tracking-wider">Miễn phí</p>
            </div>
            <div>
              <p className="font-heading text-xs italic text-[#d4af37]">KHO LƯU TRỮ</p>
              <p className="mt-1 font-heading text-2xl md:text-3xl font-light text-[#fbe396]">145M+</p>
              <p className="placard mt-0.5 text-xs text-stone-300 uppercase tracking-wider">Hiện vật</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Danh sách bảo tàng màn ảnh rộng, thoáng đãng, chữ to rõ */}
      <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {museums.map((m, i) => (
          <li key={m.slug}>
            <div className="group relative flex h-full flex-col justify-between rounded-xl border border-[#d4af37]/35 bg-white p-5 md:p-6 shadow-md transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_20px_45px_-12px_rgba(212,175,55,0.35)]">
              <RenaissanceCorners />

              <Link href={`/bao-tang/${m.slug}`} className="flex flex-1 flex-col">
                {/* Khung tranh viện bảo tàng hoàng kim */}
                <GildedMuseumFrame className="w-full">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                    <Image
                      src={m.image}
                      alt={m.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width:640px) 100vw, (max-width:1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-[#d4af37]/60 bg-[#08162b]/90 px-3 py-1 placard text-[0.68rem] font-semibold tracking-wider text-[#fbe396] shadow-sm backdrop-blur-md">
                      <BrassPlacardPin className="size-1.5" />
                      Điểm {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </GildedMuseumFrame>

                {/* Card Body với chữ to rõ, thông tin đầy đủ */}
                <div className="flex flex-1 flex-col justify-between pt-5">
                  <div>
                    <div className="flex items-center gap-2 text-xs md:text-sm text-stone-500">
                      <BrassPlacardPin className="size-1.5" />
                      <Clock className="size-4 text-[#92400e]" />
                      <span className="placard tracking-wide text-stone-700 font-medium">
                        {m.opens} – {m.closes} (Mở cửa hàng ngày)
                      </span>
                    </div>

                    <h2 className="mt-3 font-heading text-2xl md:text-3xl font-light leading-snug text-[#171717] group-hover:text-[#92400e] transition-colors">
                      {m.name}
                    </h2>
                    <p className="mt-1 font-serif text-sm italic text-stone-500">{m.nameEn}</p>
                    <p className="mt-4 line-clamp-3 text-sm text-stone-600 leading-relaxed">
                      {m.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-stone-200/90 pt-4 text-xs md:text-sm">
                    <span className="flex items-center gap-1.5 text-stone-500 line-clamp-1 max-w-[65%]">
                      <MapPin className="size-4 shrink-0 text-[#92400e]" />
                      <span className="truncate">{m.address.split(",")[0]}</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 px-3.5 py-1.5 font-semibold text-stone-800 uppercase tracking-wider text-xs transition-all group-hover:border-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#08162b]">
                      Khám phá <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
