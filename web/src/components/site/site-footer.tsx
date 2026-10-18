import Link from "next/link"
import { NAV } from "./nav"

const HELP = [
  { href: "/dat-ve", label: "Đặt vé" },
  { href: "/tai-khoan", label: "Vé và đơn hàng của tôi" },
  { href: "/ban-do", label: "Bản đồ cụm bảo tàng" },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <p className="font-heading text-5xl font-medium italic tracking-tight">Sota</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Một lối vào chung cho cả cụm bảo tàng Smithsonian: xem hiện vật, đặt vé, dạo phòng trưng bày 3D và mua quà lưu niệm.
          </p>
        </div>
        <FooterCol title="Tham quan" links={NAV} />
        <FooterCol title="Hỗ trợ" links={HELP} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-xs text-muted-foreground md:flex-row md:justify-between md:px-8">
          <p>Dữ liệu hiện vật: Smithsonian Open Access (CC0).</p>
          <p>Đồ án Nhập môn Công nghệ phần mềm, HCMUS, 2026.</p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="md:col-span-3 md:col-start-auto">
      <p className="placard text-muted-foreground">{title}</p>
      <ul className="mt-4 space-y-2.5 text-sm">
        {links.map((l) => (
          <li key={l.href}><Link href={l.href} className="transition-colors hover:text-museum">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  )
}
