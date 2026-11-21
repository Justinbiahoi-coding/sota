import { Suspense } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"
import { NAV } from "./nav"
import { CartIcon } from "./cart-icon"
import { AuthActions } from "./auth-actions"

function SmithsonianSeal({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label="Smithsonian Institution" role="img">
      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3.5" />
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
      <circle cx="50" cy="47" r="22" fill="#2a8bbf" />
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
      <circle cx="50" cy="47" r="7.5" fill="#f5c518" />
    </svg>
  )
}

const LEFT_NAV = NAV.slice(0, 2)
const RIGHT_NAV = NAV.slice(2)

export function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[60] text-[#f8f6f0] bg-black/40 backdrop-blur-md border-b border-white/[0.08]">
      {/* 3-col grid: 1fr | seal | 1fr — both sides equal so seal stays dead-center */}
      <div className="relative grid h-[72px] max-w-[1560px] mx-auto items-center px-8"
        style={{ gridTemplateColumns: "1fr auto 1fr" }}>

        {/* Left nav — right-aligned in col 1 */}
        <nav className="hidden md:flex items-center justify-end gap-8 pr-8" aria-label="Chính">
          {LEFT_NAV.map(n => (
            <Link key={n.href} href={n.href}
              className="text-sm text-stone-300 hover:text-white transition-colors whitespace-nowrap">
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Seal — col 2 (auto width, truly centered) */}
        <Link href="/" className="text-stone-300 hover:text-white transition-colors" aria-label="Sota — Trang chủ">
          <SmithsonianSeal size={38} />
        </Link>

        {/* Right nav + utilities — col 3, left-aligned */}
        <div className="hidden md:flex items-center gap-8 pl-8">
          {RIGHT_NAV.map(n => (
            <Link key={n.href} href={n.href}
              className="text-sm text-stone-300 hover:text-white transition-colors whitespace-nowrap">
              {n.label}
            </Link>
          ))}
          <div className="flex items-center gap-3 ml-auto">
            <CartIcon />
            <AuthActions />
          </div>
        </div>

        {/* Mobile menu */}
        <details className="group relative md:hidden absolute right-6">
          <summary
            className="list-none cursor-pointer inline-flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-stone-200 hover:text-white [&::-webkit-details-marker]:hidden"
            aria-label="Mở menu"
          >
            <Menu className="size-5" />
          </summary>
          <div className="absolute right-0 top-12 w-64 rounded-xl border border-white/10 bg-[#08162b]/95 p-5 shadow-2xl backdrop-blur-xl">
            <nav className="flex flex-col gap-3">
              {NAV.map(n => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="text-sm text-stone-200 hover:text-white transition-colors"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 border-t border-white/10 pt-4">
              <Link
                href="/dat-ve"
                className="flex items-center justify-center rounded-full bg-[#d4af37] py-2 text-xs font-semibold uppercase tracking-wider text-[#08162b] shadow-md hover:bg-[#e0be47]"
              >
                Đặt vé ngay
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  )
}
