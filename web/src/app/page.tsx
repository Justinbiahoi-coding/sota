import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { GalleryWalkthroughHero } from "@/components/home/intro/gallery-walkthrough-hero"
import { MuseumMapSection } from "@/components/home/museum-map-section"
import { exhibitions, museums } from "@/lib/mock-data"
import { MuseumButton } from "@/components/reactbits/museum-button"

const dateFmt = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "short", year: "numeric" })
const range = (a: string, b: string) => `${dateFmt.format(new Date(a))} — ${dateFmt.format(new Date(b))}`

const TEAM = [
  { name: "Thành viên 1", role: "Backend & API" },
  { name: "Thành viên 2", role: "Database & Auth" },
  { name: "Thành viên 3", role: "Frontend UX" },
  { name: "Tuấn", role: "Layout, Store & UI" },
  { name: "Thành viên 5", role: "DevOps & Testing" },
]

export default function Home() {
  return (
    <>
      {/* ════════════════════════════════════════════════════════
          MỞ ĐẦU — 3D gallery walkthrough
      ════════════════════════════════════════════════════════ */}
      <GalleryWalkthroughHero />

      {/* ════════════════════════════════════════════════════════
          ABOUT — "Welcome to the World's Fair"
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#1e1b1f] py-24 px-6 overflow-clip relative">
        {/* subtle watermark */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-1/2 opacity-[0.04]">
          <Image src="/gallery/EndOfGallery.webp" alt="" fill className="object-cover object-left" />
        </div>

        <div className="relative mx-auto max-w-6xl grid md:grid-cols-[1fr_1.1fr] gap-16 items-center">
          {/* text */}
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-[#d4af37]/70 uppercase mb-4">
              Chào mừng đến với
            </p>
            <h2 className="font-heading text-5xl md:text-6xl font-light text-white leading-[0.95] mb-6">
              Space<br />of <em>the Art</em>
            </h2>
            <div className="w-16 h-px bg-[#d4af37] mb-6" />
            <p className="text-stone-300 leading-relaxed text-sm mb-4">
              Sota là cổng khám phá trực tuyến dành cho cụm bảo tàng Smithsonian —
              nơi hội tụ lịch sử tự nhiên, hàng không vũ trụ, nghệ thuật và văn hoá
              Hoa Kỳ trong một trải nghiệm số hoá thống nhất.
            </p>
            <p className="text-stone-400 leading-relaxed text-sm">
              Với hơn 37 tiêu bản 3D độc quyền và bộ sưu tập triển lãm phong phú,
              Sota mang di sản nhân loại đến gần hơn với mọi người trên toàn thế giới.
            </p>
          </div>

          {/* painting */}
          <div className="relative aspect-[5/4] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
            <Image
              src="/gallery/EndOfGallery.webp"
              alt="Smithsonian Castle in Bloom"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="font-mono text-[0.6rem] tracking-widest uppercase text-white/60">Oil on canvas</p>
              <p className="font-heading text-sm text-white font-light mt-0.5">Smithsonian Castle in Bloom · Dawson Wells</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          EXHIBITIONS — Opportunities / Awards
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#0d1117] py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[0.65rem] tracking-[0.3em] text-[#d4af37]/70 uppercase mb-2">Triển lãm</p>
          <div className="flex items-end justify-between mb-10 gap-4">
            <h2 className="font-heading text-4xl md:text-5xl font-light text-white leading-tight">
              Cơ hội<br /><em>khám phá</em>
            </h2>
            <MuseumButton href="/trien-lam" variant="outline" size="sm" icon>Lịch triển lãm</MuseumButton>
          </div>

          {/* grand prize — featured exhibition */}
          {exhibitions[0] && (
            <Link
              href={`/trien-lam/${exhibitions[0].slug}`}
              className="group relative block overflow-hidden rounded-2xl mb-5 aspect-[21/8] bg-stone-900 shadow-xl"
            >
              <Image
                src={exhibitions[0].image}
                alt={exhibitions[0].title}
                fill
                className="object-cover opacity-55 group-hover:opacity-65 group-hover:scale-[1.02] transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end max-w-xl">
                <span className="inline-block font-mono text-[0.6rem] tracking-widest uppercase text-[#d4af37] border border-[#d4af37]/30 rounded-full px-3 py-1 mb-4 w-fit">
                  Triển lãm nổi bật
                </span>
                <h3 className="font-heading text-3xl md:text-4xl font-light text-white mb-2 leading-snug">
                  {exhibitions[0].title}
                </h3>
                <p className="text-stone-300/80 text-sm leading-relaxed line-clamp-2">
                  {exhibitions[0].description}
                </p>
                <p className="mt-4 font-mono text-xs text-stone-500">
                  {range(exhibitions[0].starts, exhibitions[0].ends)}
                </p>
              </div>
            </Link>
          )}

          {/* secondary exhibitions */}
          <div className="grid md:grid-cols-3 gap-4">
            {exhibitions.slice(1, 4).map((e) => (
              <Link
                key={e.slug}
                href={`/trien-lam/${e.slug}`}
                className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-stone-900 shadow-lg"
              >
                <Image
                  src={e.image}
                  alt={e.title}
                  fill
                  className="object-cover opacity-45 group-hover:opacity-60 group-hover:scale-105 transition-all duration-600"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                  <p className="font-mono text-[0.58rem] tracking-widest uppercase text-[#d4af37]/70 mb-1">
                    {e.status === "upcoming" ? "Sắp diễn ra" : "Đang diễn ra"}
                  </p>
                  <h3 className="font-heading text-lg font-light text-white leading-snug">{e.title}</h3>
                  <p className="mt-2 font-mono text-[0.6rem] text-stone-500">
                    {range(e.starts, e.ends)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          MUSEUMS — Interactive map (Colosseum-style)
      ════════════════════════════════════════════════════════ */}
      <MuseumMapSection />

      {/* ════════════════════════════════════════════════════════
          ACCELERATOR — Benefits / Features
      ════════════════════════════════════════════════════════ */}
      <section className="relative bg-[#0a0603] py-24 px-6 overflow-clip">
        {/* ghost painting */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]">
          <Image src="/gallery/EndOfGallery.webp" alt="" fill className="object-cover object-top" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0603]/80 via-transparent to-[#0a0603]/80" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <p className="text-center font-mono text-[0.65rem] tracking-[0.3em] text-[#d4af37]/70 uppercase mb-2">
            Sota
          </p>
          <h2 className="text-center font-heading text-4xl md:text-5xl font-light text-white mb-4 leading-tight">
            Trải nghiệm <em>toàn diện</em>
          </h2>
          <p className="text-center text-stone-500 text-sm mb-16 max-w-md mx-auto leading-relaxed">
            Khám phá văn hoá và nghệ thuật nhân loại theo cách của bạn — miễn phí, không giới hạn.
          </p>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                label: "Miễn phí vào cửa",
                desc: "Truy cập toàn bộ 6 bảo tàng Smithsonian không giới hạn, bất kỳ lúc nào.",
                badge: "Free admission",
              },
              {
                label: "Cộng đồng toàn cầu",
                desc: "Kết nối với hàng triệu người yêu nghệ thuật và lịch sử trên toàn thế giới.",
                badge: "Global network",
              },
              {
                label: "Nghiên cứu chuyên sâu",
                desc: "Tiếp cận 37+ tiêu bản 3D độc quyền và tài liệu hướng dẫn từ chuyên gia.",
                badge: "Expert research",
              },
            ].map((b) => (
              <div
                key={b.label}
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-6 flex flex-col gap-4"
              >
                <span className="font-mono text-[0.55rem] tracking-widest uppercase text-[#d4af37]/60 border border-[#d4af37]/20 rounded-full px-2 py-0.5 w-fit">
                  {b.badge}
                </span>
                <h3 className="font-heading text-xl font-light text-white">{b.label}</h3>
                <p className="text-sm text-stone-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-stone-500 text-xs font-mono mt-14 tracking-wide">
            Tham quan tại{" "}
            <strong className="text-stone-300">Washington D.C.</strong>
            {" "}· Mở cửa 10:00 — 17:30 hàng ngày
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TEAM — Meet the Judges
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#08162b] py-24 px-6 border-t border-white/[0.04]">
        <div className="mx-auto max-w-4xl">
          <p className="text-center font-mono text-[0.65rem] tracking-[0.3em] text-[#d4af37]/70 uppercase mb-2">
            Nhóm phát triển
          </p>
          <h2 className="text-center font-heading text-4xl md:text-5xl font-light text-white mb-16 leading-tight">
            Gặp gỡ <em>đội ngũ</em>
          </h2>

          {/* Sota team */}
          <h3 className="font-mono text-[0.6rem] tracking-widest uppercase text-stone-600 mb-6 text-center">
            Nhóm Sota · Group 08
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-14">
            {TEAM.map((p) => (
              <div
                key={p.name}
                className="flex flex-col items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-4 text-center"
              >
                <div className="size-10 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 ring-1 ring-white/5" />
                <div>
                  <p className="text-sm font-medium text-white leading-snug">{p.name}</p>
                  <p className="text-[0.65rem] text-stone-500 mt-0.5">{p.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Partners */}
          <h3 className="font-mono text-[0.6rem] tracking-widest uppercase text-stone-600 mb-6 text-center">
            Đối tác & Bảo trợ
          </h3>
          <div className="flex flex-wrap justify-center gap-2">
            {museums.map((m) => (
              <Link
                key={m.slug}
                href={`/bao-tang/${m.slug}`}
                className="group flex items-center gap-2 font-mono text-[0.6rem] tracking-widest text-stone-400 border border-white/[0.07] rounded-full px-3 py-1.5 uppercase hover:border-[#d4af37]/30 hover:text-white transition-colors"
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: m.accent }}
                />
                {m.nameEn}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
