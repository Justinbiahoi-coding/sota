import { exhibitions, exhibitionStatus, museumBySlug } from "@/lib/mock-data"
import { FlippableExhibitionCard } from "@/components/reactbits/flippable-card"
import { SplitText } from "@/components/reactbits/split-text"
import { DecryptedText } from "@/components/reactbits/decrypted-text"
import {
  BrassPlacardPin,
  RenaissanceCorners,
  RenaissanceDivider,
  RenaissanceFrieze,
  ClassicalMuseumMedallion,
} from "@/components/renaissance/deco-assets"

export const metadata = { title: "Lịch Triển lãm" }

export default function ExhibitionListPage() {
  const dated = exhibitions.map((e) => ({
    ...e,
    status: exhibitionStatus(e.starts, e.ends),
    museum: museumBySlug(e.museumSlug)!,
  }))

  return (
    <div className="mx-auto max-w-[1560px] px-6 py-16 md:px-12 xl:px-16">
      <header className="mb-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/35 bg-white/95 px-4 py-1.5 shadow-sm">
          <BrassPlacardPin />
          <span className="placard text-[0.68rem] tracking-wider text-[#92400e]">
            <DecryptedText
              text="Smithsonian · Lịch mùa triển lãm quốc gia"
              speed={28}
              maxIterations={12}
              animateOn="view"
            />
          </span>
        </div>
        <h1 className="mt-5 font-heading text-4xl font-light tracking-tight text-[#171717] sm:text-5xl md:text-6xl">
          <SplitText text="Các triển lãm nghệ thuật" delay={0.04} stagger={0.04} />
        </h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-stone-600">
          Tuyển tập các chuyên đề trưng bày nghệ thuật, cổ vật lịch sử và các công trình thám hiểm vũ trụ tiêu biểu thuộc hệ thống Smithsonian.
        </p>
      </header>

      <RenaissanceDivider title="Lịch mùa triển lãm" />

      {/* Royal Navy Exhibition Catalog Banner màn ảnh rộng */}
      <div className="relative mb-14 overflow-hidden rounded-2xl border border-[#d4af37]/40 bg-[#08162b] px-8 py-8 text-[#f7f4ec] shadow-[0_20px_50px_-20px_rgba(8,22,43,0.85)] md:px-12 md:py-10">
        <RenaissanceCorners />
        <RenaissanceFrieze className="absolute top-0 left-0 right-0" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 pt-1">
          <div className="flex items-center gap-5">
            <ClassicalMuseumMedallion className="hidden sm:block size-14 text-[#d4af37] shrink-0" />
            <div>
              <p className="flex items-center gap-2 placard text-[0.68rem] uppercase tracking-[0.22em] text-[#d4af37]">
                <BrassPlacardPin />
                Biên niên sử triển lãm chuyên đề
              </p>
              <p className="mt-1 font-heading text-2xl md:text-3xl font-light text-white">
                Mùa trưng bày nghệ thuật quốc gia 2026
              </p>
              <p className="mt-2 text-xs md:text-sm text-stone-300 max-w-2xl leading-relaxed">
                Tập hợp các chuyên đề trưng bày từ cổ vật thời tiền sử đến mỹ thuật đương đại và khoa học thám hiểm không gian.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 sm:gap-8 border-t lg:border-t-0 lg:border-l border-[#d4af37]/30 pt-6 lg:pt-0 lg:pl-10">
            {[
              ["I", "Đang mở", dated.filter((e) => e.status === "ongoing").length],
              ["II", "Sắp tới", dated.filter((e) => e.status === "upcoming").length],
              ["III", "Đã hạ màn", dated.filter((e) => e.status === "ended").length],
            ].map(([numeral, label, count]) => (
              <div key={String(label)}>
                <p className="font-heading text-xs italic text-[#d4af37]">{numeral}</p>
                <p className="mt-1 font-heading text-2xl md:text-3xl font-light text-white">{count}</p>
                <p className="placard mt-0.5 flex items-center gap-1.5 text-xs uppercase tracking-wider text-stone-300">
                  <BrassPlacardPin className="size-1" />
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {dated.map((ex) => (
          <FlippableExhibitionCard
            key={ex.slug}
            exhibition={ex}
            museumName={ex.museum.name}
            status={ex.status}
          />
        ))}
      </div>
    </div>
  )
}
