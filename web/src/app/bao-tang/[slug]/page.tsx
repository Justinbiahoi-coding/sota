import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Clock, MapPin, Sparkles } from "lucide-react"
import {
  artifactsByMuseum,
  exhibitionsByMuseum,
  exhibitionStatus,
  museumBySlug,
} from "@/lib/mock-data"
import { SpotlightCard } from "@/components/reactbits/spotlight-card"
import { StarBorder } from "@/components/reactbits/star-border"
import { MuseumButton } from "@/components/reactbits/museum-button"
import { MuseumHall3D } from "@/components/museum/museum-hall-3d"
import {
  BrassPlacardPin,
  RenaissanceCorners,
  RenaissanceDivider,
  GildedMuseumFrame,
} from "@/components/renaissance/deco-assets"

export function generateStaticParams() {
  return [
    { slug: "lich-su-tu-nhien" },
    { slug: "hang-khong-vu-tru" },
    { slug: "lich-su-hoa-ky" },
    { slug: "phong-tranh-chan-dung" },
    { slug: "hirshhorn" },
    { slug: "nghe-thuat-chau-a" },
  ]
}

const statusLabel: Record<string, string> = {
  ongoing: "Đang diễn ra",
  upcoming: "Sắp diễn ra",
  ended: "Đã kết thúc",
}

export default async function MuseumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const museum = museumBySlug(slug)
  if (!museum) notFound()

  const exList = exhibitionsByMuseum(slug)
  const artList = artifactsByMuseum(slug)

  return (
    <div style={{ "--museum-accent": museum.accent } as React.CSSProperties}>
      {/* Back button */}
      <div className="mx-auto max-w-[1560px] px-6 pt-8 md:px-12">
        <Link
          href="/bao-tang"
          className="placard inline-flex items-center gap-2 text-xs text-stone-500 hover:text-[#92400e] transition-colors"
        >
          <ArrowLeft className="size-4" /> Quay lại danh mục bảo tàng
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative mt-4 h-96 w-full overflow-hidden bg-stone-900 md:h-[32rem]">
        <Image
          src={museum.image}
          alt={museum.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08162b] via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 px-6 pb-10 md:px-12 max-w-5xl">
          <span className="placard rounded-full border border-[#d4af37]/60 bg-[#08162b]/90 px-4 py-1.5 text-xs text-[#fbe396] shadow-md backdrop-blur-md">
            {museum.nameEn}
          </span>
          <h1 className="mt-4 text-4xl font-heading font-light text-white sm:text-5xl md:text-6xl lg:text-7xl drop-shadow-md">
            {museum.name}
          </h1>
          <p className="mt-4 max-w-3xl text-sm md:text-base text-stone-300 leading-relaxed">
            {museum.description}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1560px] px-6 py-12 md:px-12 xl:px-16">
        {/* Info bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-[#d4af37]/35 bg-white p-6 shadow-md">
          <div className="flex flex-wrap items-center gap-6 text-sm text-stone-700">
            <span className="flex items-center gap-2">
              <BrassPlacardPin />
              <Clock className="size-4 text-[#92400e]" />
              <span className="font-semibold text-[#171717]">{museum.opens} – {museum.closes}</span> (Mở cửa thường lệ)
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="size-4 text-[#92400e]" />
              <span>{museum.address}</span>
            </span>
          </div>

          <div>
            <Link href={`/dat-ve?museum=${museum.slug}`}>
              <StarBorder
                as="span"
                color="#d4af37"
                speed="4.5s"
                className="shadow-[0_0_16px_rgba(212,175,55,0.3)]"
              >
                <span className="flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  <span className="text-[#d4af37]">✦</span> Đặt vé tham quan
                </span>
              </StarBorder>
            </Link>
          </div>
        </div>

        {/* =========================================================================
            3D PERSPECTIVE GALLERY HALL (Tái hiện không gian Trưng bày 3D Ảnh 4)
           ========================================================================= */}
        {artList.length > 0 && (
          <section className="mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
              <div>
                <p className="placard text-xs text-[#d4af37] font-semibold uppercase tracking-widest flex items-center gap-2">
                  <BrassPlacardPin /> KHÔNG GIAN TRIỂN LÃM 3D
                </p>
                <h2 className="mt-1 font-heading text-3xl md:text-4xl font-light text-[#f8f6f0]">
                  Không gian trưng bày hiện vật tiêu biểu
                </h2>
                <p className="mt-2 text-sm text-stone-300 max-w-2xl leading-relaxed">
                  Không gian phục dựng ba chiều sinh động, mang đến trải nghiệm chiêm ngưỡng cận cảnh từng hiện vật tiêu biểu trong bộ sưu tập của bảo tàng.
                </p>
              </div>

              <MuseumButton href={`/hien-vat?museum=${slug}`} variant="outline" size="sm" icon>
                Toàn bộ hiện vật ({artList.length})
              </MuseumButton>
            </div>

            <MuseumHall3D
              artifacts={artList}
              museumName={museum.name}
              museumSlug={museum.slug}
            />
          </section>
        )}

        <RenaissanceDivider title="Các triển lãm đang diễn ra" />

        {/* Exhibitions */}
        {exList.length > 0 && (
          <section className="mt-12">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {exList.map((ex) => {
                const st = exhibitionStatus(ex.starts, ex.ends)
                return (
                  <div
                    key={ex.slug}
                    className="group relative flex flex-col justify-between rounded-xl border border-[#d4af37]/35 bg-white p-5 shadow-md transition-all duration-300 hover:border-[#d4af37] hover:shadow-[0_16px_36px_-12px_rgba(212,175,55,0.3)]"
                  >
                    <RenaissanceCorners />

                    <Link href={`/trien-lam/${ex.slug}`} className="flex flex-1 flex-col">
                      <GildedMuseumFrame className="w-full">
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-900">
                          <Image
                            src={ex.image}
                            alt={ex.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width:768px) 100vw, 33vw"
                          />
                          <span className="absolute top-2.5 left-2.5 rounded-full border border-[#d4af37]/50 bg-[#08162b]/90 px-3 py-1 placard text-[0.65rem] font-semibold text-[#fbe396] shadow-sm backdrop-blur-sm">
                            {statusLabel[st]}
                          </span>
                        </div>
                      </GildedMuseumFrame>

                      <div className="flex flex-1 flex-col justify-between pt-4">
                        <div>
                          <h3 className="font-heading text-xl md:text-2xl font-light italic leading-snug text-[#171717] group-hover:text-[#92400e] transition-colors">
                            {ex.title}
                          </h3>
                          <p className="placard mt-2 text-xs text-stone-500 font-mono">
                            {new Date(ex.starts).toLocaleDateString("vi-VN")} – {new Date(ex.ends).toLocaleDateString("vi-VN")}
                          </p>
                          <p className="mt-3 line-clamp-2 text-xs text-stone-600 leading-relaxed">
                            {ex.description}
                          </p>
                        </div>

                        <div className="mt-6 flex items-center justify-between border-t border-stone-200/90 pt-3 text-xs">
                          <span className="font-semibold text-stone-700 group-hover:text-[#92400e] transition-colors flex items-center gap-1">
                            Chi tiết triển lãm <ArrowUpRight className="size-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
