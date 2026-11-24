"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ChevronDown } from "lucide-react"
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

function NavDropdown({ navIndex }: { navIndex: number }) {
  const [open, setOpen] = useState(false)
  const path = usePathname()
  const item = NAV[navIndex]

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 text-sm text-stone-300 hover:text-white transition-colors whitespace-nowrap">
        {item.label}
        <ChevronDown className={`size-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3">
          <div className="rounded-xl border border-white/10 bg-[#08162b]/95 p-2 shadow-2xl backdrop-blur-xl">
            {item.dropdown?.map((sub) => {
              const active = path === sub.href || path.startsWith(sub.href + "/")
              return (
                <Link
                  key={sub.href}
                  href={sub.href}
                  className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors duration-150 ${
                    active ? "bg-[#d4af37]/15 text-[#d4af37]" : "text-stone-200 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    {active && <span className="size-1.5 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37]" />}
                    {sub.label}
                  </span>
                  {sub.desc && <span className="text-[0.68rem] text-stone-400">{sub.desc}</span>}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

const RIGHT_NAV = NAV.slice(2) // Đặt vé, Cửa hàng

export function SiteHeader() {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return null

  return (
    <header className="sticky top-0 z-40 border-b border-[#d4af37]/20 bg-[#08162b]/95 backdrop-blur-md text-[#f8f6f0] shadow-md transition-colors duration-300">
      <div className="mx-auto flex h-16 max-w-[1560px] items-center justify-between gap-6 px-6 md:px-12">
        {/* Left nav links */}
        <nav className="hidden md:flex items-center gap-8 pr-8">
          <NavDropdown navIndex={0} />
          <NavDropdown navIndex={1} />
        </nav>

        {/* Seal */}
        <Link href="/" className="text-stone-300 hover:text-white transition-colors" aria-label="Sota — Trang chủ">
          <SmithsonianSeal size={38} />
        </Link>

        {/* Right nav + utilities */}
        <div className="hidden md:flex items-center gap-8 pl-8">
          {RIGHT_NAV.map(n => (
            <Link key={n.href + n.label} href={n.href}
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
              {NAV.flatMap(n =>
                n.dropdown
                  ? [
                      <span key={n.label} className="text-[0.65rem] uppercase tracking-widest text-stone-500 mt-2">{n.label}</span>,
                      ...n.dropdown.map(sub => (
                        <Link key={sub.href} href={sub.href}
                          className="text-sm text-stone-300 hover:text-white transition-colors pl-3 border-l border-white/10">
                          {sub.label}
                        </Link>
                      )),
                    ]
                  : [
                      <Link key={n.href + n.label} href={n.href}
                        className="text-sm text-stone-200 hover:text-white transition-colors">
                        {n.label}
                      </Link>,
                    ]
              )}
            </nav>
            <div className="mt-4 border-t border-white/10 pt-4">
              <Link href="/dat-ve"
                className="flex items-center justify-center rounded-full bg-[#d4af37] py-2 text-xs font-semibold uppercase tracking-wider text-[#08162b] shadow-md hover:bg-[#e0be47]">
                Đặt vé ngay
              </Link>
            </div>
          </div>
        </details>
      </div>
    </header>
  )
}
