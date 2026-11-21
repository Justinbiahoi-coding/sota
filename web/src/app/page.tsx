import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"
import { GalleryWalkthroughHero } from "@/components/home/intro/gallery-walkthrough-hero"
import { exhibitions, highlightArtifacts, museumBySlug, museums, products, formatPrice } from "@/lib/mock-data"
import { HomeAddToCart } from "@/components/home/home-add-to-cart"
import { SpotlightCard } from "@/components/reactbits/spotlight-card"
import { FlippableVitrineCard } from "@/components/reactbits/flippable-card"
import { RenaissanceDivider } from "@/components/renaissance/deco-assets"
import { SplitText } from "@/components/reactbits/split-text"
import { MuseumButton } from "@/components/reactbits/museum-button"

const dateFmt = new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "short", year: "numeric" })
const range = (a: string, b: string) => `${dateFmt.format(new Date(a))} đến ${dateFmt.format(new Date(b))}`

export default function Home() {
  return (
    <>
      <GalleryWalkthroughHero />

      {/* ---------------------------------------------------------------- open today */}
      <section id="today" className="relative border-t border-stone-200/80 bg-stone-50/50">
        <span className="pointer-events-none absolute left-8 top-0 -translate-x-1/2 -translate-y-1/2 text-xs text-[#d4af37]">✦</span>
        <span className="pointer-events-none absolute right-8 top-0 translate-x-1/2 -translate-y-1/2 text-xs text-[#d4af37]">✦</span>

        <div className="mx-auto max-w-[1560px] px-6 py-16 md:px-12 xl:px-16">
          <SectionHead index="01" title="Hôm nay mở cửa" href="/bao-tang" more="Tất cả 6 bảo tàng" />
          
          <SpotlightCard
            spotlightColor="rgba(212, 175, 55, 0.18)"
            borderColor="rgba(212, 175, 55, 0.5)"
            className="mt-10 overflow-hidden bg-card border-stone-200 shadow-md"
          >
            <ol className="divide-y divide-stone-200/80">
              {museums.map((m, i) => (
                <li key={m.slug} style={{ "--museum-accent": m.accent } as React.CSSProperties}>
                  <Link
                    href={`/bao-tang/${m.slug}`}
                    className="group grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 px-5 py-5 transition-all hover:bg-stone-50/80 md:grid-cols-[3rem_1fr_14rem_2rem] md:gap-x-6 md:px-7"
                  >
                    <span className="placard tabular-nums text-stone-400 font-mono text-sm font-semibold">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="font-heading text-xl transition-colors group-hover:text-[#92400e] md:text-2xl font-light text-[#171717]">
                        {m.name}
                      </span>
                      <span className="mt-1 block text-xs text-stone-500">{m.nameEn}</span>
                    </span>
                    <span className="col-start-2 mt-2 flex items-center gap-2 text-sm tabular-nums text-stone-600 md:col-start-auto md:mt-0 font-medium">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: m.accent, boxShadow: `0 0 8px ${m.accent}` }}
                        aria-hidden
                      />
                      {m.opens} — {m.closes}
                    </span>
                    <ArrowUpRight className="hidden size-5 text-stone-400 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#92400e] md:block" />
                  </Link>
                </li>
              ))}
            </ol>
          </SpotlightCard>
        </div>
      </section>

      {/* ---------------------------------------------------------------- exhibitions */}
      <section className="relative border-t border-stone-200/80">
        <span className="pointer-events-none absolute left-8 top-0 -translate-x-1/2 -translate-y-1/2 text-xs text-[#d4af37]">✦</span>
        <span className="pointer-events-none absolute right-8 top-0 translate-x-1/2 -translate-y-1/2 text-xs text-[#d4af37]">✦</span>

        <div className="mx-auto max-w-[1560px] px-6 py-16 md:px-12 xl:px-16">
          <SectionHead index="02" title="Triển lãm đang & sắp diễn ra" href="/trien-lam" more="Lịch triển lãm" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {exhibitions.map((e) => {
              const m = museumBySlug(e.museumSlug)!
              return (
                <SpotlightCard
                  key={e.slug}
                  spotlightColor="rgba(212, 175, 55, 0.2)"
                  borderColor="rgba(212, 175, 55, 0.6)"
                  style={{ "--museum-accent": m.accent } as React.CSSProperties}
                  className="flex flex-col bg-card"
                >
                  <Link href={`/trien-lam/${e.slug}`} className="flex flex-1 flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                      <Image
                        src={e.image}
                        alt={e.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width:768px) 100vw,33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-[#08162b]/80 px-3 py-1 placard text-[0.62rem] text-white backdrop-blur-md font-medium">
                        {m.name}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col justify-between p-6">
                      <div>
                        <h3 className="font-heading text-2xl font-light leading-snug text-[#171717] group-hover:text-[#92400e] transition-colors">
                          {e.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs text-stone-500 leading-relaxed">
                          {e.description}
                        </p>
                      </div>
                      <div className="mt-6 flex items-center justify-between border-t border-stone-200/80 pt-4">
                        <p className="placard text-[0.68rem] text-stone-500 font-mono">{range(e.starts, e.ends)}</p>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#92400e] group-hover:translate-x-1 transition-transform">
                          Chi tiết <ArrowUpRight className="size-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </SpotlightCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- curated artifacts with FlippableVitrineCard (ReactBits 3D Flip) */}
      <section className="relative border-t border-stone-200/80 bg-stone-50/50">
        <span className="pointer-events-none absolute left-8 top-0 -translate-x-1/2 -translate-y-1/2 text-xs text-[#d4af37]">✦</span>
        <span className="pointer-events-none absolute right-8 top-0 translate-x-1/2 -translate-y-1/2 text-xs text-[#d4af37]">✦</span>

        <div className="mx-auto max-w-[1560px] px-6 py-16 md:px-12 xl:px-16">
          <SectionHead index="03" title="Kiệt tác tuyển chọn" href="/hien-vat" more="Tất cả 16 hiện vật" />
          
          <RenaissanceDivider title="Bộ Sưu Tập Cổ Điển Smithsonian" />

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlightArtifacts().map((a) => (
              <FlippableVitrineCard key={a.slug} artifact={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- shop */}
      <section className="relative border-t border-stone-200/80">
        <span className="pointer-events-none absolute left-8 top-0 -translate-x-1/2 -translate-y-1/2 text-xs text-[#d4af37]">✦</span>
        <span className="pointer-events-none absolute right-8 top-0 translate-x-1/2 -translate-y-1/2 text-xs text-[#d4af37]">✦</span>

        <div className="mx-auto max-w-[1560px] px-6 py-16 md:px-12 xl:px-16">
          <SectionHead index="04" title="Cửa hàng lưu niệm Sota" href="/cua-hang" more="Xem toàn bộ 10 quà lưu niệm" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((p) => (
              <SpotlightCard
                key={p.slug}
                spotlightColor="rgba(212, 175, 55, 0.2)"
                borderColor="rgba(212, 175, 55, 0.55)"
                className="flex flex-col bg-card p-3.5"
              >
                <Link href={`/cua-hang/${p.slug}`}>
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-100 shadow-inner">
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width:640px) 50vw,25vw"
                    />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col pt-3.5">
                  <p className="placard text-[0.65rem] text-stone-500 font-medium">{p.category}</p>
                  <Link href={`/cua-hang/${p.slug}`}>
                    <p className="mt-1 text-sm font-medium leading-snug hover:text-[#92400e] transition-colors line-clamp-1 text-[#171717]">{p.name}</p>
                  </Link>
                  <p className="mt-auto pt-3 font-heading text-lg font-semibold text-[#92400e]">{formatPrice(p.price)}</p>
                  <HomeAddToCart product={p} />
                </div>
              </SpotlightCard>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function SectionHead({ index, title, href, more }: { index: string; title: string; href: string; more: string }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div>
        <p className="placard text-xs tracking-widest text-[#92400e] font-semibold">{index} · CHƯƠNG TRÌNH</p>
        <h2 className="mt-2 text-3xl font-light tracking-tight md:text-4xl text-[#171717]">
          <SplitText text={title} delay={0.02} stagger={0.03} />
        </h2>
      </div>
      <MuseumButton href={href} variant="outline" size="sm" icon>
        {more}
      </MuseumButton>
    </div>
  )
}
