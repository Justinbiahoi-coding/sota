import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, CalendarDays, Clock3, MapPin } from "lucide-react"
import { GalleryWalkthroughHero } from "@/components/home/intro/gallery-walkthrough-hero"
import { VideoSection } from "@/components/home/video-section"
import { MuseumMapGL } from "@/components/home/museum-map-gl"
import { exhibitions, museums } from "@/lib/mock-data"
import { MuseumButton } from "@/components/reactbits/museum-button"
import { RenaissanceCorners } from "@/components/renaissance/deco-assets"

const dateFmt = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "short", year: "numeric" })
const range = (a: string, b: string) => `${dateFmt.format(new Date(a))} — ${dateFmt.format(new Date(b))}`

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
      <section className="glass-panel py-24 px-6 overflow-hidden relative">
        <div className="relative mx-auto max-w-6xl grid md:grid-cols-[1fr_1.1fr] gap-16 items-center">
          {/* text */}
          <div>
            <p className="font-mono text-[0.65rem] tracking-[0.3em] text-[#8a7a3a] uppercase mb-4">
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
            <p className="text-stone-400 leading-relaxed text-sm mb-6">
              Với hơn 37 tiêu bản 3D độc quyền và bộ sưu tập triển lãm phong phú,
              Sota mang di sản nhân loại đến gần hơn với mọi người trên toàn thế giới.
            </p>
            <div className="flex flex-wrap gap-3">
              <MuseumButton href="/tim-kiem" variant="outline" size="sm" icon>
                Tìm kiếm kho lưu trữ
              </MuseumButton>
              <MuseumButton href="/bao-tang" variant="primary" size="sm" icon>
                Khám phá 6 bảo tàng
              </MuseumButton>
            </div>
          </div>

          {/* painting */}
          <div className="relative aspect-[5/4] rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
            <Image
              src="/museum-elephant.webp"
              alt="Rotunda, National Museum of Natural History"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p className="font-mono text-[0.6rem] tracking-widest uppercase text-white/60">Kenneth E. Behring Family Hall</p>
              <p className="font-heading text-sm text-white font-light mt-0.5">National Museum of Natural History · Washington D.C.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          VIDEO — Launch video (Colosseum-style ornate frame)
      ════════════════════════════════════════════════════════ */}
      <VideoSection />

      {/* ════════════════════════════════════════════════════════
          EXHIBITIONS — Opportunities / Awards
      ════════════════════════════════════════════════════════ */}
      <section className="glass-panel py-24 px-6 relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl">
          <p className="font-mono text-[0.65rem] tracking-[0.3em] text-[#8a7a3a] uppercase mb-2">Triển lãm</p>
          <div className="flex items-end justify-between mb-10 gap-4">
            <h2 className="font-heading text-4xl md:text-5xl font-light text-white leading-tight">
              Cơ hội<br /><em>khám phá</em>
            </h2>
            <MuseumButton href="/tim-kiem?category=exhibitions" variant="outline" size="sm" icon>Lịch triển lãm</MuseumButton>
          </div>

          {/* grand prize — featured exhibition */}
          {exhibitions[0] && (
            <Link
              href={`/bao-tang/${exhibitions[0].museumSlug}`}
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
                href={`/bao-tang/${e.museumSlug}`}
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
          MUSEUMS — Interactive map
      ════════════════════════════════════════════════════════ */}
      <MuseumMapGL />

      <section className="gallery-page !min-h-0 py-14 md:py-24" aria-labelledby="home-shop-title">
        <div className="gallery-wrap grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          <Link href="/cua-hang" aria-label="Mở cửa hàng quà lưu niệm" className="gallery-sheet group relative block rounded-t-[5rem] p-2 sm:rounded-t-[8rem] sm:p-3">
            <div className="relative aspect-[16/10] overflow-hidden rounded-t-[4.5rem] bg-[#08162b] sm:rounded-t-[7.5rem]">
              <Image src="/map-art-cua-hang.webp" alt="" fill sizes="(max-width: 1023px) 90vw, 48vw"
                className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.025]" />
            </div>
            <RenaissanceCorners />
          </Link>
          <div>
            <p className="gallery-kicker">Cửa hàng Smithsonian</p>
            <h2 id="home-shop-title" className="mt-4 font-heading text-5xl leading-[.97] tracking-tight md:text-7xl">Quà lưu niệm <em className="text-[#77531c]">từ bảo tàng.</em></h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-stone-700">
              Tìm bưu thiếp, sách nghệ thuật và vật phẩm theo từng bảo tàng trong cụm.
            </p>
            <Link href="/cua-hang" className="gallery-action mt-6">Khám phá cửa hàng</Link>
          </div>
        </div>
        <div className="gallery-wrap mt-14 border-t border-[#d3c8b5] pt-9 md:mt-20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-heading text-4xl tracking-tight">Lên lịch tham quan</h2>
            <Link href="/dat-ve" className="gallery-action">Đặt vé tham quan</Link>
          </div>
          <div className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-3">
            <p className="flex items-center gap-3 text-stone-700"><MapPin className="size-5 shrink-0 text-[#77531c]" /> National Mall, Washington D.C.</p>
            <p className="flex items-center gap-3 text-stone-700"><Clock3 className="size-5 shrink-0 text-[#77531c]" /> <Link href="/bao-tang" className="underline underline-offset-4">Xem giờ mở cửa từng bảo tàng</Link></p>
            <p className="flex items-center gap-3 text-stone-700"><CalendarDays className="size-5 shrink-0 text-[#77531c]" /> <Link href="/tim-kiem?category=exhibitions" className="underline underline-offset-4">Xem lịch triển lãm</Link></p>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          ACCELERATOR — Benefits / Features
      ════════════════════════════════════════════════════════ */}
      <section className="bg-water-deep relative py-24 px-6 overflow-hidden">
        {/* ghost painting */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.09]">
          <Image src="/fossil-hall.webp" alt="" fill className="object-cover object-top" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#060d19]/80 via-transparent to-[#060d19]/80" />

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

    </>
  )
}
