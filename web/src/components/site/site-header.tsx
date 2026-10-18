import Link from "next/link"
import { Menu, Search, ShoppingBag, UserRound } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NavLinks } from "./nav-links"

const icon = "inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-5 md:px-8">
        <Link href="/" className="group flex items-baseline gap-2.5" aria-label="Sota, về trang chủ">
          <span className="font-heading text-2xl font-semibold italic tracking-tight">Sota</span>
          <span className="placard hidden text-muted-foreground sm:inline">Space of the Art</span>
        </Link>

        <nav aria-label="Chính" className="ml-auto hidden lg:block">
          <NavLinks className="flex items-center gap-7 text-sm" />
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-4">
          <Link href="/tim-kiem" className={icon} aria-label="Tìm kiếm"><Search className="size-[18px]" /></Link>
          <Link href="/gio-hang" className={icon} aria-label="Giỏ hàng"><ShoppingBag className="size-[18px]" /></Link>
          <Link href="/tai-khoan" className={cn(icon, "hidden sm:inline-flex")} aria-label="Tài khoản"><UserRound className="size-[18px]" /></Link>
          <Link href="/dat-ve" className={cn(buttonVariants({ size: "lg" }), "ml-2 hidden rounded-full px-4 sm:inline-flex")}>Đặt vé</Link>

          {/* phones and tablets: a native disclosure, no script needed */}
          <details className="group relative lg:hidden">
            <summary className={cn(icon, "list-none cursor-pointer [&::-webkit-details-marker]:hidden")} aria-label="Mở menu">
              <Menu className="size-5" />
            </summary>
            <div className="absolute right-0 top-12 w-64 rounded-md border border-border bg-card p-5 shadow-xl shadow-black/5">
              <NavLinks className="flex flex-col gap-3 text-base" />
              <div className="mt-5 flex gap-2 border-t border-border pt-4">
                <Link href="/dat-ve" className={cn(buttonVariants({ size: "lg" }), "flex-1 rounded-full")}>Đặt vé</Link>
                <Link href="/tai-khoan" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}>Tài khoản</Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  )
}
