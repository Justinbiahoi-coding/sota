import { Suspense } from "react"
import Link from "next/link"
import { Menu, Search, UserRound } from "lucide-react"
import { NavLinks } from "./nav-links"
import { CartIcon } from "./cart-icon"
import { StarBorder } from "@/components/reactbits/star-border"
import { Magnet } from "@/components/reactbits/magnet"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d4af37]/20 bg-[#08162b]/95 backdrop-blur-md text-[#f8f6f0] shadow-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-[1560px] items-center justify-between gap-6 px-6 md:px-12">
        {/* Brand Logo with Imperial Gold Glint */}
        <Link href="/" className="group flex items-baseline gap-2.5" aria-label="Sota, về trang chủ">
          <span className="font-heading text-2xl font-semibold italic tracking-tight text-white transition-colors group-hover:text-[#d4af37]">
            Sota
          </span>
          <span className="placard hidden text-[0.68rem] tracking-widest text-[#d4af37]/90 uppercase font-medium sm:inline">
            Space of the Art
          </span>
        </Link>

        {/* Central Navigation with ReactBits Sliding Pill */}
        <nav aria-label="Chính" className="hidden lg:block">
          <Suspense fallback={<div className="h-9 w-64" />}>
            <NavLinks />
          </Suspense>
        </nav>

        {/* Action Controls & StarBorder CTA */}
        <div className="flex items-center gap-2.5">
          <Magnet magnetStrength={0.25}>
            <Link
              href="/tim-kiem"
              className="inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-200 transition-all duration-300 hover:border-[#d4af37]/60 hover:bg-white/10 hover:text-[#d4af37]"
              aria-label="Tìm kiếm"
            >
              <Search className="size-[17px]" />
            </Link>
          </Magnet>

          <Magnet magnetStrength={0.25}>
            <CartIcon />
          </Magnet>

          <Magnet magnetStrength={0.25}>
            <Link
              href="/tai-khoan"
              className="hidden sm:inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-200 transition-all duration-300 hover:border-[#d4af37]/60 hover:bg-white/10 hover:text-[#d4af37]"
              aria-label="Tài khoản"
            >
              <UserRound className="size-[17px]" />
            </Link>
          </Magnet>

          {/* StarBorder Featured Button (ReactBits) */}
          <div className="hidden sm:block ml-1">
            <Link href="/dat-ve">
              <StarBorder color="#d4af37" speed="4.5s" className="shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                <span className="flex items-center gap-1.5 font-medium tracking-wider">
                  <span className="text-[#d4af37]">✦</span> Đặt vé
                </span>
              </StarBorder>
            </Link>
          </div>

          {/* Mobile menu disclosure */}
          <details className="group relative lg:hidden">
            <summary
              className="list-none cursor-pointer inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-200 hover:text-[#d4af37] [&::-webkit-details-marker]:hidden"
              aria-label="Mở menu"
            >
              <Menu className="size-5" />
            </summary>
            <div className="absolute right-0 top-12 w-64 rounded-xl border border-[#d4af37]/25 bg-[#08162b] p-5 shadow-2xl backdrop-blur-xl">
              <Suspense fallback={null}>
                <NavLinks className="flex flex-col gap-2 bg-transparent border-0 p-0" />
              </Suspense>
              <div className="mt-5 flex flex-col gap-2.5 border-t border-white/10 pt-4">
                <Link
                  href="/dat-ve"
                  className="flex items-center justify-center rounded-full bg-[#d4af37] py-2 text-xs font-semibold uppercase tracking-wider text-[#08162b] shadow-md hover:bg-[#e0be47]"
                >
                  ✦ Đặt vé ngay
                </Link>
                <Link
                  href="/tai-khoan"
                  className="flex items-center justify-center rounded-full border border-white/20 bg-white/5 py-2 text-xs font-medium text-white hover:bg-white/10"
                >
                  Tài khoản của tôi
                </Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
