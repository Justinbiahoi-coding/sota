import { Suspense } from "react"
import Link from "next/link"
import { Menu, Search } from "lucide-react"
import { NavLinks } from "./nav-links"
import { CartIcon } from "./cart-icon"
import { AuthActions } from "./auth-actions"
import { StarBorder } from "@/components/reactbits/star-border"
import { Magnet } from "@/components/reactbits/magnet"

function SmithsonianSeal({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Smithsonian Institution" role="img">
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3.5" />
      {/* text path top */}
      <defs>
        <path id="top-arc" d="M 10,50 A 40,40 0 0,1 90,50" />
        <path id="bot-arc" d="M 14,58 A 40,40 0 0,0 86,58" />
      </defs>
      <text fontSize="10.5" fontFamily="serif" letterSpacing="2.8" fill="currentColor" fontWeight="500">
        <textPath href="#top-arc" startOffset="50%" textAnchor="middle">SMITHSONIAN</textPath>
      </text>
      <text fontSize="9" fontFamily="serif" letterSpacing="2" fill="currentColor" fontWeight="500">
        <textPath href="#bot-arc" startOffset="50%" textAnchor="middle">INSTITUTION</textPath>
      </text>
      {/* blue circle */}
      <circle cx="50" cy="47" r="22" fill="#2a8bbf" />
      {/* sun rays */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2
        const r1 = i % 2 === 0 ? 11 : 8
        const r2 = i % 2 === 0 ? 20 : 18
        return (
          <line key={i}
            x1={50 + Math.cos(a) * r1} y1={47 + Math.sin(a) * r1}
            x2={50 + Math.cos(a) * r2} y2={47 + Math.sin(a) * r2}
            stroke="#f5c518" strokeWidth={i % 2 === 0 ? 2.8 : 1.6} strokeLinecap="round"
          />
        )
      })}
      {/* sun center */}
      <circle cx="50" cy="47" r="7.5" fill="#f5c518" />
    </svg>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d4af37]/20 bg-[#08162b]/95 backdrop-blur-md text-[#f8f6f0] shadow-md transition-colors duration-300">
      {/* 3-column layout: brand | seal | actions */}
      <div className="mx-auto grid h-16 max-w-[1560px] items-center px-6 md:px-12"
        style={{ gridTemplateColumns: "1fr auto 1fr" }}>

        {/* LEFT — brand wordmark + nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-baseline gap-2" aria-label="Sota, về trang chủ">
            <span className="font-heading text-2xl font-semibold italic tracking-tight text-white transition-colors group-hover:text-[#d4af37]">
              Sota
            </span>
          </Link>
          {/* nav on left side */}
          <nav aria-label="Chính" className="hidden lg:block">
            <Suspense fallback={<div className="h-9 w-56" />}>
              <NavLinks />
            </Suspense>
          </nav>
        </div>

        {/* CENTER — Smithsonian seal */}
        <Link href="/" className="flex items-center justify-center text-[#d4af37]/80 hover:text-[#d4af37] transition-colors" aria-label="Smithsonian Institution">
          <SmithsonianSeal size={42} />
        </Link>

        {/* Action Controls & StarBorder CTA */}
        <div className="flex items-center justify-end gap-2.5">
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

          {/* Supabase Auth State (Đăng nhập / Đăng xuất / Hồ sơ) */}
          <AuthActions />

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

