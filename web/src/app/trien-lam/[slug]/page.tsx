import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Sparkles, Clock, Calendar, UserCheck } from "lucide-react"
import {
  artifacts,
  exhibitionBySlug,
  exhibitionStatus,
  museumBySlug,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { StarBorder } from "@/components/reactbits/star-border"
import { BrassPlacardPin, RenaissanceCorners, RenaissanceDivider } from "@/components/renaissance/deco-assets"
import { VitrineStageView } from "@/components/museum/vitrine-stage-view"

export function generateStaticParams() {
  return [
    { slug: "hoa-thach-thoi-gian" },
    { slug: "buoc-ra-quy-dao" },
    { slug: "chan-dung-the-ky" },
    { slug: "uyen-chuyen-vien-dong" },
    { slug: "sat-thuep-va-anh-sang" },
    { slug: "ngon-co-va-bien" },
  ]
}

const statusLabel: Record<string, string> = {
  ongoing: "Đang diễn ra",
  upcoming: "Sắp diễn ra",
  ended: "Đã kết thúc",
}
const statusColor: Record<string, string> = {
  ongoing: "bg-emerald-950/80 text-emerald-300 border border-emerald-500/50",
  upcoming: "bg-indigo-950/80 text-indigo-300 border border-indigo-500/50",
  ended: "bg-stone-800 text-stone-400 border border-stone-600",
}

export default async function ExhibitionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const ex = exhibitionBySlug(slug)
  if (!ex) notFound()

  const museum = museumBySlug(ex.museumSlug)!
  const status = exhibitionStatus(ex.starts, ex.ends)
  const relatedArtifacts = artifacts.filter((a) => a.exhibitionSlugs.includes(slug))
  const displayArts = relatedArtifacts.length > 0 ? relatedArtifacts : artifacts.filter((a) => a.museumSlug === ex.museumSlug)

  return (
    <div className="w-full bg-[#0c0906]" style={{ "--museum-accent": museum.accent } as React.CSSProperties}>
      {/* =========================================================================
          KHÔNG GIAN GIÁM TUYỂN TRIỂN LÃM (VITRINE STAGE THEO ẢNH 3)
          Ảnh to nhìn dọc, thẻ thông tin nhỏ hơn nằm một bên
         ========================================================================= */}
      {displayArts.length > 0 && (
        <VitrineStageView
          artifacts={displayArts}
          backHref="/trien-lam"
        />
      )}

      {/* =========================================================================
          HỒ SƠ CHUYÊN ĐỀ & ĐẶT VÉ THAM QUAN TRIỂN LÃM
         ========================================================================= */}
      <div className="bg-[#f7f4ec] text-[#171717] px-6 py-16 md:px-12 xl:px-16 border-t border-[#d4af37]/30">
        <div className="mx-auto max-w-[1560px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_24rem]">
            {/* Cột trái: Biên niên sử và lời tựa chuyên đề */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d4af37]/40 bg-white px-4 py-1.5 shadow-sm">
                <BrassPlacardPin />
                <span className="placard text-[0.68rem] tracking-wider text-[#92400e]">
                  Hồ sơ triển lãm · {museum.name}
                </span>
              </div>

              <h1 className="mt-4 font-heading text-3xl md:text-5xl font-light text-[#171717] leading-tight">
                {ex.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs md:text-sm text-stone-600">
                <span className={cn("placard rounded-full px-3 py-1 font-semibold", statusColor[status])}>
                  {statusLabel[status]}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4 text-[#92400e]" />
                  {new Date(ex.starts).toLocaleDateString("vi-VN")} – {new Date(ex.ends).toLocaleDateString("vi-VN")}
                </span>
                <span className="flex items-center gap-1.5">
                  <UserCheck className="size-4 text-[#92400e]" />
                  Giám tuyển: {ex.curator}
                </span>
              </div>

              <p className="mt-6 text-base md:text-lg leading-relaxed text-stone-700">
                {ex.description}
              </p>

              {/* Thông tin phòng trưng bày */}
              <div className="mt-10 rounded-2xl border border-[#d4af37]/40 bg-white p-6 md:p-8 shadow-sm">
                <RenaissanceCorners />
                <h3 className="font-heading text-xl font-light text-[#171717]">Quy định tham quan chuyên đề</h3>
                <ul className="mt-4 space-y-3 text-sm text-stone-600">
                  <li className="flex items-start gap-2.5">
                    <BrassPlacardPin className="size-2 mt-1.5 shrink-0" />
                    <span>Triển lãm mở cửa tự do trong khung giờ hoạt động thường lệ của {museum.name}.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <BrassPlacardPin className="size-2 mt-1.5 shrink-0" />
                    <span>Khuyến khích đăng ký trước khung giờ tham quan vào dịp cuối tuần để đảm bảo trải nghiệm chiêm ngưỡng tốt nhất.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <BrassPlacardPin className="size-2 mt-1.5 shrink-0" />
                    <span>Cho phép chụp ảnh không sử dụng đèn flash và không dùng chân máy chuyên dụng.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Cột phải: Thẻ tóm tắt & Nút đặt vé hoàng kim */}
            <aside className="space-y-6">
              <div className="rounded-2xl border border-[#d4af37]/45 bg-[#08162b] p-6 text-[#f7f4ec] shadow-xl">
                <RenaissanceCorners />
                <p className="placard text-[0.65rem] uppercase tracking-[0.2em] text-[#d4af37] font-bold">
                  BẢO TÀNG SỞ HỮU
                </p>
                <Link
                  href={`/bao-tang/${museum.slug}`}
                  className="mt-2 block font-heading text-xl md:text-2xl font-light text-white hover:text-[#fbe396] transition-colors"
                >
                  {museum.name} ↗
                </Link>
                <p className="mt-2 text-xs text-stone-300 leading-relaxed">
                  {museum.address}
                </p>

                <div className="my-5 border-t border-white/10" />

                <div className="space-y-3 text-xs text-stone-300">
                  <p><strong>Thời gian mở cửa:</strong> {museum.opens} – {museum.closes}</p>
                  <p><strong>Số lượng bảo vật:</strong> {displayArts.length} hiện vật trưng bày</p>
                  <p><strong>Vé vào cửa:</strong> 100% Miễn phí thường niên</p>
                </div>

                <RenaissanceDivider title="Đăng ký suất vé" />

                {status !== "ended" ? (
                  <div className="pt-2">
                    <Link href={`/dat-ve?museum=${museum.slug}`} className="block">
                      <StarBorder
                        as="span"
                        color="#d4af37"
                        speed="4s"
                        className="w-full shadow-[0_4px_20px_rgba(212,175,55,0.35)]"
                      >
                        <span className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">
                          <Sparkles className="size-3.5 text-[#d4af37]" /> Lấy suất vé tham quan
                        </span>
                      </StarBorder>
                    </Link>
                  </div>
                ) : (
                  <div className="rounded-xl border border-stone-700 bg-stone-900/60 p-3 text-center text-xs text-stone-400">
                    Triển lãm chuyên đề đã kết thúc thời gian trưng bày.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}
