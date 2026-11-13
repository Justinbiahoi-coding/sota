import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { IsoCluster } from "@/components/home/iso-cluster"
import { EvolutionIntro } from "@/components/home/intro/evolution-intro"
import { buttonVariants } from "@/components/ui/button"
import { featuredArtifacts, museums } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <>
      <EvolutionIntro />

      {/* ---------------------------------------------------------------- hero */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-16 pt-12 md:px-8 lg:grid-cols-12 lg:pb-24 lg:pt-20">
        <div className="lg:col-span-5">
          <p className="placard rise text-muted-foreground">Cụm bảo tàng Smithsonian · Washington, D.C.</p>
          <h1 className="rise mt-6 text-5xl font-light leading-[1.02] tracking-tight [animation-delay:80ms] sm:text-6xl xl:text-7xl">
            Hai mươi mốt bảo{"\u00a0"}tàng,
            <span className="block italic text-museum">một lối vào.</span>
          </h1>
          <p className="rise mt-7 max-w-md text-base leading-relaxed text-muted-foreground [animation-delay:160ms]">
            Xem hiện vật thật từ bộ sưu tập Smithsonian, dạo phòng trưng bày 3D của từng bảo tàng và đặt vé cho cả ngày tham quan trong một lần thanh toán.
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3 [animation-delay:240ms]">
            <Link href="/dat-ve" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full px-6")}>Đặt vé tham quan</Link>
            <Link href="/bao-tang" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 rounded-full px-6")}>Xem các bảo tàng</Link>
          </div>
        </div>
        <figure className="rise relative lg:col-span-7 [animation-delay:200ms]">
          <div className="aspect-[760/470] w-full">
            <IsoCluster museums={museums} />
          </div>
          <figcaption className="placard mt-3 flex justify-between text-muted-foreground">
            <span className="hidden sm:inline">Rê chuột lên một bảo tàng</span>
            <span>Bản đồ 3D · bản dựng sớm</span>
          </figcaption>
        </figure>
      </section>

      {/* ---------------------------------------------------------------- open today */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <SectionHead index="01" title="Hôm nay mở cửa" href="/bao-tang" more="Tất cả bảo tàng" />
          <ol className="mt-10 border-t border-border">
            {museums.map((m, i) => (
              <li key={m.slug} style={{ "--museum-accent": m.accent } as React.CSSProperties}>
                <Link href={`/bao-tang/${m.slug}`} className="group grid grid-cols-[2.25rem_1fr] items-baseline gap-x-3 border-b border-border py-5 transition-colors hover:bg-card md:grid-cols-[3rem_1fr_14rem_2rem] md:gap-x-4 md:px-2">
                  <span className="placard tabular-nums text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="font-heading text-xl transition-colors group-hover:text-museum md:text-2xl">{m.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{m.city}</span>
                  </span>
                  <span className="col-start-2 mt-2 flex items-center gap-2 text-sm tabular-nums text-muted-foreground md:col-start-auto md:mt-0">
                    <span className="size-2 rounded-full bg-museum" aria-hidden />
                    {m.address}
                  </span>
                  <ArrowUpRight className="hidden size-5 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-museum md:block" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------------------------------------------------------- featured artifacts */}
      <section className="border-t border-border bg-card/60">
        <div className="mx-auto max-w-7xl px-5 py-16 md:px-8">
          <SectionHead index="02" title="Hiện vật nổi bật" href="/hien-vat" more="Xem tất cả" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featuredArtifacts.map((a) => (
              <Link key={a.id} href={`/bao-tang/${a.museumSlug}`} style={{ "--museum-accent": a.accent } as React.CSSProperties}
                className="group flex min-h-64 flex-col justify-between border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:border-museum hover:shadow-[0_18px_40px_-24px] hover:shadow-museum">
                <div>
                  <span className="block h-1 w-10 bg-museum transition-all duration-500 group-hover:w-full" />
                  <p className="placard mt-5 text-muted-foreground">{a.inventory_code}</p>
                </div>
                <div>
                  <h3 className="text-2xl leading-tight">{a.name}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{a.period}</p>
                </div>
              </Link>
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
        <p className="placard text-muted-foreground">{index}</p>
        <h2 className="mt-3 text-3xl font-light tracking-tight md:text-4xl">{title}</h2>
      </div>
      <Link href={href} className="placard self-start shrink-0 border-b border-foreground/30 pb-1 sm:self-auto transition-colors hover:border-museum hover:text-museum">{more}</Link>
    </div>
  )
}
