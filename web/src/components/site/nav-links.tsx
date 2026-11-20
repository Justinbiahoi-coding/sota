"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { NAV } from "./nav"

export function NavLinks({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  const path = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <nav className={cn("relative flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md", className)}>
      {NAV.map(({ href, label }, idx) => {
        const active = path === href || path.startsWith(href + "/")
        const isHovered = hoveredIndex === idx

        return (
          <Link
            key={href}
            href={href}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative px-4 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 z-10 rounded-full",
              active
                ? "text-white font-semibold"
                : "text-stone-300 hover:text-white",
              linkClassName
            )}
          >
            {/* Sliding Hover Glow Pill (ReactBits Animated Nav) */}
            {isHovered && (
              <motion.span
                layoutId="navHoverPill"
                className="absolute inset-0 -z-10 rounded-full bg-white/15 backdrop-blur-sm"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}

            {/* Active Imperial Gold Indicator */}
            {active && (
              <motion.span
                layoutId="navActivePill"
                className="absolute inset-0 -z-20 rounded-full bg-white/10 border border-[#d4af37]/40 shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}

            <span className="flex items-center gap-1.5">
              {active && <span className="size-1 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37]" />}
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
