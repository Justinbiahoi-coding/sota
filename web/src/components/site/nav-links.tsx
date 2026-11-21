"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV } from "./nav"

export function NavLinks({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  const path = usePathname()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  return (
    <nav className={cn("relative flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md", className)}>
      {NAV.map(({ href, label, dropdown }, idx) => {
        const active = path === href || (href !== "#" && path.startsWith(href + "/"))
        const isHovered = hoveredIndex === idx
        const hasDropdown = !!dropdown

        if (hasDropdown) {
          return (
            <div
              key={href + label}
              className="relative"
              onMouseEnter={() => { setHoveredIndex(idx); setDropdownOpen(true) }}
              onMouseLeave={() => { setHoveredIndex(null); setDropdownOpen(false) }}
            >
              <button
                className={cn(
                  "relative flex items-center gap-1 px-4 py-1.5 text-xs font-medium tracking-wide transition-colors duration-200 z-10 rounded-full",
                  "text-stone-300 hover:text-white",
                  linkClassName
                )}
              >
                {isHovered && (
                  <motion.span
                    layoutId="navHoverPill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/15 backdrop-blur-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  />
                )}
                {label}
                <ChevronDown
                  className={cn("size-3 transition-transform duration-200", dropdownOpen && "rotate-180")}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-1/2 top-full z-50 mt-2 w-64 -translate-x-1/2 rounded-xl border border-white/10 bg-[#08162b]/95 p-2 shadow-2xl backdrop-blur-xl"
                  >
                    {dropdown.map((item) => {
                      const itemActive = path === item.href || path.startsWith(item.href + "/")
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex flex-col gap-0.5 rounded-lg px-3 py-2.5 transition-colors duration-150",
                            itemActive
                              ? "bg-[#d4af37]/15 text-[#d4af37]"
                              : "text-stone-200 hover:bg-white/8 hover:text-white"
                          )}
                        >
                          <span className="flex items-center gap-1.5 text-xs font-medium">
                            {itemActive && <span className="size-1.5 rounded-full bg-[#d4af37] shadow-[0_0_6px_#d4af37]" />}
                            {item.label}
                          </span>
                          {item.desc && (
                            <span className="text-[0.68rem] text-stone-400">{item.desc}</span>
                          )}
                        </Link>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        }

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
            {isHovered && (
              <motion.span
                layoutId="navHoverPill"
                className="absolute inset-0 -z-10 rounded-full bg-white/15 backdrop-blur-sm"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}

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
