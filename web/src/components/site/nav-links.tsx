"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { NAV } from "./nav"

// the current section gets a hairline under it, in the accent of the page it is on
export function NavLinks({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  const path = usePathname()
  return (
    <ul className={className}>
      {NAV.map(({ href, label }) => {
        const active = path === href || path.startsWith(href + "/")
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative py-1 transition-colors hover:text-foreground",
                "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-museum after:transition-transform hover:after:scale-x-100",
                active ? "text-foreground after:scale-x-100" : "text-muted-foreground",
                linkClassName,
              )}
            >
              {label}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
